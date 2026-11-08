/**
 * Ortak yazımda üç yollu paragraf (üst düzey blok) birleştirme (D140).
 * base: iki tarafın da en son bildiği ortak sürüm; mine: yerel; theirs: diğer yazarın kaydı.
 * Farklı paragraflardaki değişiklikler otomatik birleşir. Aynı paragraf iki tarafta farklı değiştiyse
 * “çakışma” sayılır: varsayılan olarak yerel sürüm korunur (prefer), çağıran karşı tarafınkini geçmişe saklayabilir.
 */
import type { JSONNode } from "./doc";

export interface MergeResult { doc: JSONNode; conflicts: number; changed: boolean }

const key = (n: JSONNode) => JSON.stringify(n);

/** a ile b arasında en uzun ortak alt dizi eşleşmesi: a indeksi → b indeksi */
function lcsMap(a: string[], b: string[]): Map<number, number> {
  const n = a.length, m = b.length;
  // Baştaki ve sondaki ortak kısımları hızlıca eşle (çoğu düzenleme küçüktür)
  let s = 0;
  while (s < n && s < m && a[s] === b[s]) s++;
  let e = 0;
  while (e < n - s && e < m - s && a[n - 1 - e] === b[m - 1 - e]) e++;
  const out = new Map<number, number>();
  for (let i = 0; i < s; i++) out.set(i, i);
  for (let i = 0; i < e; i++) out.set(n - 1 - i, m - 1 - i);
  const A = a.slice(s, n - e), B = b.slice(s, m - e);
  if (!A.length || !B.length) return out;
  const dp: Uint32Array[] = Array.from({ length: A.length + 1 }, () => new Uint32Array(B.length + 1));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    if (A[i] === B[j]) { out.set(s + i, s + j); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return out;
}

const same = (x: string[], y: string[]) => x.length === y.length && x.every((v, i) => v === y[i]);

export function mergeBlocks(base: JSONNode[], mine: JSONNode[], theirs: JSONNode[], prefer: "mine" | "theirs" = "mine"): { blocks: JSONNode[]; conflicts: number } {
  const bk = base.map(key), mk = mine.map(key), tk = theirs.map(key);
  if (same(mk, tk)) return { blocks: mine, conflicts: 0 };
  if (same(bk, mk)) return { blocks: theirs, conflicts: 0 };
  if (same(bk, tk)) return { blocks: mine, conflicts: 0 };
  const bm = lcsMap(bk, mk), bt = lcsMap(bk, tk);
  // Her iki tarafta da değişmeden kalan taban blokları: birleştirmenin sabit noktaları
  const anchors: number[] = [];
  for (let i = 0; i < bk.length; i++) if (bm.has(i) && bt.has(i)) anchors.push(i);
  const out: JSONNode[] = [];
  let conflicts = 0;
  let pb = 0, pm = 0, pt = 0;
  const flush = (b1: number, m1: number, t1: number) => {
    const cb = bk.slice(pb, b1), cm = mk.slice(pm, m1), ct = tk.slice(pt, t1);
    if (same(cm, cb)) out.push(...theirs.slice(pt, t1));
    else if (same(ct, cb) || same(cm, ct)) out.push(...mine.slice(pm, m1));
    else { out.push(...(prefer === "theirs" ? theirs.slice(pt, t1) : mine.slice(pm, m1))); conflicts++; }
  };
  for (const a of anchors) {
    const m = bm.get(a)!, t = bt.get(a)!;
    // Sıra bozulmuşsa (blok taşınmış) bu noktayı atla; aradaki kısım bütün olarak değerlendirilir
    if (m < pm || t < pt) continue;
    flush(a, m, t);
    out.push(mine[m]);
    pb = a + 1; pm = m + 1; pt = t + 1;
  }
  flush(bk.length, mk.length, tk.length);
  return { blocks: out, conflicts };
}

/**
 * prefer: aynı paragraf iki tarafta farklı değiştiğinde hangisi alınır. Canlı yazımda iki tarafın aynı sonuca
 * varması için kullanıcı kimliğine göre sabit bir kural kullanılır (bkz. workspace).
 */
export function mergeDocs(base: JSONNode | null | undefined, mine: JSONNode, theirs: JSONNode, prefer: "mine" | "theirs" = "mine"): MergeResult {
  const blocks = (d: JSONNode | null | undefined) => (d?.content ?? []) as JSONNode[];
  const r = mergeBlocks(blocks(base), blocks(mine), blocks(theirs), prefer);
  const doc: JSONNode = { ...mine, type: "doc", content: r.blocks.length ? r.blocks : [{ type: "paragraph" }] };
  return { doc, conflicts: r.conflicts, changed: key(doc) !== key(mine) };
}

