/**
 * Bölüm içi alt başlıklar (D83). Bir aşamanın metni tek bir belge olarak saklanır (dışa aktarma tek belge,
 * numaralandırma ve sayfa düzeni kurallara uygun kalır); kullanıcı ise her alt başlığa ayrı ayrı “girer”:
 * editörde yalnızca o alt başlığın kendi metni açılır, değişiklik belgenin ilgili yerine geri yazılır.
 * Saf modül (istemci + test).
 */
import { docToPlain, wordCount, type JSONNode } from "./doc";

export interface SectionInfo {
  /** Başlık düğümünün belgedeki üst düzey sırası (bölüm kimliği; odaklanma sırasında değişmez) */
  index: number;
  /** Editör düzeyi: 2 (##), 3 (###), 4 (####) */
  level: number;
  text: string;
  /** Belgedeki numara (ör. “3.2.1”); önek verilmediyse göreli (“2.1”) */
  number: string;
  /** Başlığın kendi metni (sonraki herhangi bir başlığa kadar) kelime sayısı */
  words: number;
  /** Alt başlıkları dahil bölümün bittiği üst düzey sıra (hariç) */
  end: number;
}

const nodesOf = (doc: JSONNode | null | undefined): JSONNode[] => doc?.content ?? [];
const levelOf = (n: JSONNode) => Math.min(4, Math.max(2, Number(n.attrs?.level ?? 2)));
const isHeading = (n: JSONNode | undefined) => n?.type === "heading";
const headingText = (n: JSONNode) => docToPlain({ type: "doc", content: n.content }).trim();

/**
 * Belgedeki alt başlıklar ve numaraları. `prefix` aşamanın belgedeki numarasıdır (gruplu aşamada “1.2”,
 * tek başına bölümde “3”); boşsa numara verilmez. Düzey atlanırsa (## olmadan ###) bir üst düzeye çekilir
 * (dışa aktarma ve editörle aynı kural, D76).
 */
export function sectionTree(doc: JSONNode | null | undefined, prefix = ""): SectionInfo[] {
  const nodes = nodesOf(doc);
  const out: SectionInfo[] = [];
  const counters = [0, 0, 0];
  let last = 1;
  nodes.forEach((n, i) => {
    if (!isHeading(n)) return;
    const lvl = Math.min(levelOf(n), last + 1);
    last = lvl;
    const k = lvl - 2;
    counters[k]++;
    for (let j = k + 1; j < counters.length; j++) counters[j] = 0;
    const rel = counters.slice(0, k + 1).join(".");
    let end = i + 1;
    while (end < nodes.length && !(isHeading(nodes[end]) && Math.min(levelOf(nodes[end]), 4) <= lvl)) end++;
    out.push({ index: i, level: lvl, text: headingText(n), number: prefix ? `${prefix}.${rel}` : "", words: 0, end });
  });
  for (const s of out) s.words = wordCount(docToPlain({ type: "doc", content: sectionBody(doc, s.index) }));
  return out;
}

/** Başlığın kendi metni: başlıktan sonraki düğümler, bir sonraki (herhangi düzeydeki) başlığa kadar */
export function sectionBody(doc: JSONNode | null | undefined, index: number): JSONNode[] {
  const nodes = nodesOf(doc);
  if (!isHeading(nodes[index])) return [];
  let end = index + 1;
  while (end < nodes.length && !isHeading(nodes[end])) end++;
  return nodes.slice(index + 1, end);
}

/** Editöre açılacak alt başlık belgesi (boşsa tek boş paragraf) */
export function sectionDoc(doc: JSONNode | null | undefined, index: number): JSONNode {
  const body = sectionBody(doc, index);
  return { type: "doc", content: body.length ? body : [{ type: "paragraph" }] };
}

/**
 * Alt başlığın kendi metnini yenisiyle değiştirir. Yeni içerikteki başlıklar atılır (alt başlık açmak ayrı
 * işlemdir; aksi hâlde metin yanlışlıkla başka bir alt başlığa bölünür). Tek boş paragraf metin sayılmaz.
 */
export function replaceSectionBody(doc: JSONNode, index: number, body: JSONNode[]): JSONNode {
  const nodes = nodesOf(doc);
  if (!isHeading(nodes[index])) return doc;
  let end = index + 1;
  while (end < nodes.length && !isHeading(nodes[end])) end++;
  const clean = body.filter((n) => !isHeading(n));
  const empty = clean.length === 1 && clean[0].type === "paragraph" && !(clean[0].content ?? []).length;
  return { ...doc, content: [...nodes.slice(0, index + 1), ...(empty ? [] : clean), ...nodes.slice(end)] };
}

/** Alt başlığın adını değiştirir */
export function renameSection(doc: JSONNode, index: number, title: string): JSONNode {
  const nodes = nodesOf(doc);
  if (!isHeading(nodes[index]) || !title.trim()) return doc;
  const next = [...nodes];
  next[index] = { ...nodes[index], content: [{ type: "text", text: title.trim() }] };
  return { ...doc, content: next };
}

/** Alt başlığı (kendi metni ve alt başlıklarıyla birlikte) siler */
export function removeSection(doc: JSONNode, index: number): JSONNode {
  const s = sectionTree(doc).find((x) => x.index === index);
  if (!s) return doc;
  const nodes = nodesOf(doc);
  return { ...doc, content: [...nodes.slice(0, s.index), ...nodes.slice(s.end)] };
}

const headingNode = (level: number, text: string): JSONNode => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });

/**
 * Yeni alt başlıklar ekler. `parentIndex` yoksa bölümün sonuna ## düzeyinde; verilirse o başlığın altına,
 * mevcut alt başlıklarından sonra bir alt düzeyde. Aynı adı taşıyan kardeş başlık tekrar eklenmez.
 * Eklenen başlıkların belgedeki sıraları da döner.
 */
export function addSubheadings(doc: JSONNode | null | undefined, titles: string[], parentIndex: number | null, opts: { maxLevel?: number; same?: (a: string, b: string) => boolean } = {}): { doc: JSONNode; added: number[] } {
  const same = opts.same ?? ((a: string, b: string) => a.trim().toLocaleLowerCase("tr") === b.trim().toLocaleLowerCase("tr"));
  const base: JSONNode = doc?.type === "doc" ? doc : { type: "doc", content: [] };
  const nodes = [...nodesOf(base)];
  // Boş belge: tek boş paragraf yer tutucudur
  if (nodes.length === 1 && nodes[0].type === "paragraph" && !(nodes[0].content ?? []).length) nodes.length = 0;
  const tree = sectionTree({ type: "doc", content: nodes });
  let level = 2, at = nodes.length;
  let siblings: string[] = tree.filter((s) => s.level === 2).map((s) => s.text);
  if (parentIndex != null) {
    const parent = tree.find((s) => s.index === parentIndex);
    if (!parent || parent.level >= Math.min(4, opts.maxLevel ?? 4)) return { doc: base, added: [] };
    level = parent.level + 1;
    at = parent.end;
    siblings = tree.filter((s) => s.index > parent.index && s.index < parent.end && s.level === level).map((s) => s.text);
  }
  const fresh = titles.map((x) => x.trim()).filter(Boolean).filter((x, i, a) => !siblings.some((y) => same(x, y)) && a.findIndex((z) => same(z, x)) === i);
  const insert = fresh.map((x) => headingNode(level, x));
  const added = insert.map((_, k) => at + k);
  nodes.splice(at, 0, ...insert);
  return { doc: { ...base, content: nodes }, added };
}

/**
 * Editörde açılabilecek en derin alt başlık düzeyi. Belgede en fazla dört numara düzeyi vardır (ör. 3.2.1.1):
 * gruplu aşamada aşamanın kendisi ikinci düzeydir (1.2), bu yüzden en fazla ### açılır; tek başına bölümde ####.
 */
export const maxSectionLevel = (grouped: boolean) => (grouped ? 3 : 4);

/** Düz metin sayacı (sol paneldeki kelime sayıları için) */
export function sectionPlain(doc: JSONNode | null | undefined, index: number): string {
  return docToPlain({ type: "doc", content: sectionBody(doc, index) });
}

/**
 * Bir alt başlığın hemen arkasına (kendi alt başlıklarından sonra) aynı düzeyde yeni bir alt başlık ekler (D86).
 * Yeni başlığın belgedeki sırası döner; başlık bulunamazsa veya ad boşsa belge değişmez (index -1).
 */
export function addSiblingAfter(doc: JSONNode, index: number, title: string): { doc: JSONNode; index: number } {
  const s = sectionTree(doc).find((x) => x.index === index);
  if (!s || !title.trim()) return { doc, index: -1 };
  const nodes = [...nodesOf(doc)];
  nodes.splice(s.end, 0, headingNode(s.level, title.trim()));
  return { doc: { ...doc, content: nodes }, index: s.end };
}

/**
 * İçe aktarılan belgeyi yerleştirir (D87). `parentIndex` yoksa bölümün sonuna (bölüm boşsa yerine); verilirse
 * baştaki başlıksız metin o alt başlığın kendi metninin sonuna, başlıklı kısımlar alt başlıklarından sonra gelir.
 */
export function insertImported(doc: JSONNode | null | undefined, nodes: JSONNode[], parentIndex: number | null): JSONNode {
  const base: JSONNode = doc?.type === "doc" ? doc : { type: "doc", content: [] };
  const list = [...nodesOf(base)];
  const isEmpty = list.every((n) => n.type === "paragraph" && !(n.content ?? []).length);
  if (parentIndex == null || !isHeading(list[parentIndex])) {
    return { ...base, content: isEmpty ? [...nodes] : [...list, ...nodes] };
  }
  const s = sectionTree(base).find((x) => x.index === parentIndex);
  if (!s) return base;
  const firstH = nodes.findIndex((n) => isHeading(n));
  const lead = firstH < 0 ? nodes : nodes.slice(0, firstH);
  const rest = firstH < 0 ? [] : nodes.slice(firstH);
  let ownEnd = parentIndex + 1;
  while (ownEnd < list.length && !isHeading(list[ownEnd])) ownEnd++;
  const out = [...list.slice(0, ownEnd), ...lead, ...list.slice(ownEnd, s.end), ...rest, ...list.slice(s.end)];
  return { ...base, content: out };
}
