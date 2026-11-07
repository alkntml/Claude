/**
 * İddia çıkarımı (D119): bir bölümün metnini cümlelere böler ve her cümlenin atıflarını bulur. Saf fonksiyonlar
 * (sunucu, istemci ve testler ortak). Kaynak destekli iddia denetimi bu listeyi kullanır:
 *  - "cited": atıflı cümle → kaynağın okunan metniyle karşılaştırılır,
 *  - "uncited": atıfsız ama kaynak gerektirebilecek kesin iddia (sayı, yüzde, “araştırmalar göstermektedir”…),
 *  - "marked": metinde zaten “[KAYNAK GEREKLİ]” işareti olan cümle.
 */
import { citationAttrs, walk, type JSONNode } from "@/lib/editor/doc";

export type ClaimKind = "cited" | "uncited" | "marked";
export interface Claim {
  id: string;
  kind: ClaimKind;
  /** Atıflar çıkarılmış düz cümle (editörde bulmak için) */
  text: string;
  /** Cümledeki atıflar: kaynak kimlikleri ve sayfa */
  citations: { ids: string[]; locator: string | null }[];
}

const ABBR = /(?:\b(?:vd|vb|ör|örn|bkz|s|ss|sf|no|dr|prof|doç|yrd|akt|çev|ed|eds|et al|e\.g|i\.e|vs|cf|pp|p|vol|fig|tab)\.)$/i;

/** “12345” → kısa ve kararlı kimlik (aynı metin + atıf = aynı kimlik; önbellek için) */
export function claimKey(text: string, extra = ""): string {
  let h = 5381;
  const s = `${text}|${extra}`;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** Atıfsız kesin iddia belirtisi: yüzde, ondalık/istatistik, “araştırmalar göstermektedir” vb. (TR + EN) */
const CLAIM_PATTERNS: RegExp[] = [
  /%\s?\d|\d\s?%|\byüzde\s+\d/i,
  /\b\d+[.,]\d+\b/,
  /\b(?:p|r|t|F|β|M|SS|SD|n|N)\s*[=<>]\s*\.?\d/,
  /\b(?:19|20)\d{2}\s+(?:yılında|yılı|tarihli|verilerine)/i,
  /(?:araştırma|çalışma|inceleme|meta-analiz|literatür)\w*\s+(?:\S+\s+){0,4}(?:göstermekte|göstermiş|ortaya koy|bulmuş|saptamış|belirlemiş|işaret etmekte|kanıtla)/i,
  /\b(?:kanıtlanmıştır|ispatlanmıştır|bilinmektedir ki|literatürde\s+(?:sıklıkla|yaygın|genel)|genel kabul gör)/i,
  /\b(?:studies|research|evidence|meta-analys[ie]s|the literature)\s+(?:\S+\s+){0,3}(?:show|shows|showed|has shown|have shown|suggests?|indicates?|demonstrates?|found|reports?)\b/i,
  /\b(?:it (?:is|has been) (?:well )?(?:established|shown|known|demonstrated)|according to)\b/i,
];

export function looksLikeClaim(sentence: string): boolean {
  return CLAIM_PATTERNS.some((r) => r.test(sentence));
}

/** Paragrafı atıf belirteçleriyle cümlelere böler */
function sentencesOf(block: JSONNode): { text: string; citations: { ids: string[]; locator: string | null }[] }[] {
  const cites: { ids: string[]; locator: string | null }[] = [];
  let s = "";
  const rec = (n: JSONNode) => {
    if (n.type === "text") s += n.text ?? "";
    else if (n.type === "citation") { const a = citationAttrs(n); cites.push({ ids: a.ids, locator: a.locator }); s += ` \u0001${cites.length - 1}\u0002 `; }
    else if (n.type === "hardBreak") s += " ";
    else if (n.type !== "footnote") for (const c of n.content ?? []) rec(c);
  };
  for (const c of block.content ?? []) rec(c);
  // Cümle sonu: . ! ? (kısaltma değilse) ardından boşluk ve büyük harf / rakam / tırnak / parantez
  const parts: string[] = [];
  let start = 0;
  const re = /([.!?…])(\s+)(?=[A-ZÇĞİÖŞÜ0-9“"'(\u0001[])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const head = s.slice(start, m.index + 1);
    if (m[1] === "." && ABBR.test(head.replace(/\s*\u0001\d+\u0002\s*/g, " ").trimEnd())) continue;
    parts.push(head);
    start = m.index + m[0].length;
  }
  parts.push(s.slice(start));
  // Cümle başına düşen atıf (“… sürer. (Kaya, 2020) Yetişkin”) bir önceki cümleye aittir
  for (let i = 1; i < parts.length; i++) {
    const lead = parts[i].match(/^\s*(\u0001\d+\u0002\s*)+/);
    if (lead) { parts[i - 1] += ` ${lead[0]}`; parts[i] = parts[i].slice(lead[0].length); }
  }
  return parts.map((p) => {
    const ids = [...p.matchAll(/\u0001(\d+)\u0002/g)].map((x) => cites[Number(x[1])]);
    const text = p.replace(/\s*\u0001\d+\u0002\s*/g, " ").replace(/\s+([.,;:!?])/g, "$1").replace(/\s+/g, " ").trim();
    return { text, citations: ids };
  }).filter((x) => x.text.length > 0);
}

/** Belgedeki denetlenecek cümleler (başlıklar, tablolar ve şekil başlıkları hariç) */
export function extractClaims(doc: JSONNode | null | undefined): Claim[] {
  const out: Claim[] = [];
  const seen = new Set<string>();
  walk(doc, (n, parent) => {
    if (n.type !== "paragraph") return;
    if (parent && (parent.type === "tableCell" || parent.type === "tableHeader")) return;
    for (const s of sentencesOf(n)) {
      const marked = /\[KAYNAK GEREKLİ\]|\[CITATION NEEDED\]/i.test(s.text);
      const kind: ClaimKind | null = s.citations.length ? "cited" : marked ? "marked" : s.text.length >= 25 && looksLikeClaim(s.text) ? "uncited" : null;
      if (!kind) continue;
      const id = claimKey(s.text, s.citations.map((c) => `${c.ids.join(",")}@${c.locator ?? ""}`).join(";"));
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ id, kind, text: s.text, citations: s.citations });
    }
  });
  return out;
}

export type ClaimVerdict = "supports" | "partial" | "not_supported" | "contradicts" | "insufficient";
/** Bir cümle birden çok kaynağa atıf yapıyorsa en güçlü destek sonucu esas alınır (D133: “çelişiyor” en alttadır) */
const RANK: Record<ClaimVerdict, number> = { supports: 4, partial: 3, insufficient: 2, not_supported: 1, contradicts: 0 };
export function bestVerdict(vs: ClaimVerdict[]): ClaimVerdict {
  return vs.reduce<ClaimVerdict>((a, b) => (RANK[b] > RANK[a] ? b : a), vs[0] ?? "insufficient");
}

export interface AuditSummary { total: number; supports: number; partial: number; not_supported: number; contradicts: number; insufficient: number; uncited: number; marked: number; pending: number; mixed?: number; relatedSupport?: number; relatedContradict?: number }
export function summarize(items: { kind: ClaimKind; verdict?: ClaimVerdict | null; checks?: { verdict: ClaimVerdict }[]; related?: { stance: string }[] }[]): AuditSummary {
  const s: AuditSummary = { total: items.length, supports: 0, partial: 0, not_supported: 0, contradicts: 0, insufficient: 0, uncited: 0, marked: 0, pending: 0, mixed: 0, relatedSupport: 0, relatedContradict: 0 };
  for (const i of items) {
    if (i.kind === "uncited") s.uncited++;
    else if (i.kind === "marked") s.marked++;
    else if (!i.verdict) s.pending++;
    else s[i.verdict]++;
    if (isMixed(i.checks)) s.mixed!++;
    if (i.related?.some((r) => r.stance === "supports")) s.relatedSupport!++;
    if (i.related?.some((r) => r.stance === "contradicts")) s.relatedContradict!++;
  }
  return s;
}

/** Atıf yapılan kaynaklardan biri destekleyip diğeri çelişiyorsa (karışık kanıt) */
export function isMixed(checks?: { verdict: ClaimVerdict }[]): boolean {
  if (!checks || checks.length < 2) return false;
  return checks.some((c) => c.verdict === "supports" || c.verdict === "partial") && checks.some((c) => c.verdict === "contradicts");
}

/** Denetim sonucu (cümle başına): atıf yaptığı her kaynak için karar ve kanıt */
export interface ClaimCheck { sourceId: string; verdict: ClaimVerdict; explanation: string; quote: string | null; quotePage: string | null; access: "metadata" | "abstract" | "full_text" }
/** D133: atıf yapılmayan, projedeki başka bir kaynağın bu cümleyi destekleyip desteklemediği / çeliştiği */
export interface RelatedEvidence { sourceId: string; stance: "supports" | "contradicts"; explanation: string; quote: string | null; quotePage: string | null }
export interface AuditItem extends Claim { verdict: ClaimVerdict | null; checks: ClaimCheck[]; related?: RelatedEvidence[]; relatedChecked?: boolean }

const ctoks = (s: string) => new Set((s.toLocaleLowerCase("tr").match(/[\p{L}\p{N}]{4,}/gu) ?? []).filter((w) => !STOP.has(w)));
const STOP = new Set(["olarak", "ancak", "ayrıca", "üzerine", "arasında", "olduğu", "olduğunu", "yapılan", "çalışma", "çalışmada", "araştırma", "bulunmuştur", "göstermektedir", "with", "that", "this", "from", "were", "have", "their", "which", "study", "studies", "results", "between", "among", "these", "there"]);

/**
 * Kaynaklar arası kontrol için aday seçimi (D133): cümleyle başlık+özet kelime örtüşmesi en yüksek kaynaklar.
 * Cümlenin zaten atıf yaptığı kaynaklar hariç; örtüşme eşiği altındaki kaynaklar gönderilmez (maliyet ve gürültü).
 */
export function relatedCandidates(claim: { text: string; citations: { ids: string[] }[] }, sources: { id: string; text: string }[], max = 2, minOverlap = 3): string[] {
  const cited = new Set(claim.citations.flatMap((c) => c.ids));
  const ct = ctoks(claim.text);
  if (ct.size < 3) return [];
  return sources
    .filter((s) => !cited.has(s.id))
    .map((s) => { const st = ctoks(s.text); let hit = 0; for (const w of ct) if (st.has(w)) hit++; return { id: s.id, hit, score: hit / ct.size }; })
    .filter((x) => x.hit >= minOverlap && x.score >= 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.id);
}

/** Denetim sonuçlarını CSV’ye çevirir (Excel uyumlu, noktalı virgül) */
export function auditCsv(items: AuditItem[], o: { title: (id: string) => string; verdictLabel: (v: ClaimVerdict | null, kind: ClaimKind) => string; stanceLabel: (s: "supports" | "contradicts") => string }): string {
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Cümle", "Sonuç", "Atıf yapılan kaynak", "Kaynağa göre karar", "Açıklama", "Alıntı", "Sayfa", "Diğer kaynaklar (destek/çelişki)"];
  const rows: unknown[][] = [];
  for (const it of items) {
    const rel = (it.related ?? []).map((r) => `${o.stanceLabel(r.stance)}: ${o.title(r.sourceId)}${r.quote ? ` — “${r.quote}”` : ""}`).join(" | ");
    if (!it.checks.length) rows.push([it.text, o.verdictLabel(it.verdict, it.kind), "", "", "", "", "", rel]);
    for (const c of it.checks) rows.push([it.text, o.verdictLabel(it.verdict, it.kind), o.title(c.sourceId), o.verdictLabel(c.verdict, "cited"), c.explanation, c.quote ?? "", c.quotePage ?? "", rel]);
  }
  return "\uFEFF" + [head, ...rows].map((r) => r.map(q).join(";")).join("\r\n");
}
export interface ClaimAudit { id: string | null; created_at: string; scope: string; summary: AuditSummary & { skipped?: number }; results: AuditItem[] }
