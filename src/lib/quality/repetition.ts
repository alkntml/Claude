/**
 * Tekrar analizi (deterministik, ücretsiz). Yapay zekâ taslaklarında sık görülen sorunları bulur:
 * aynı kalıp ifadenin defalarca kullanılması, cümlelerin hep aynı geçiş ifadesiyle başlaması ve
 * neredeyse aynı cümlelerin farklı yerlerde yeniden yazılması.
 * Konunun anahtar terimleri (başlık, anahtar kelimeler) doğal olarak tekrar ettiği için sayılmaz.
 */

export interface RepetitionReport {
  /** Sık tekrar eden kalıp ifadeler (3–5 kelime) */
  phrases: { phrase: string; count: number }[];
  /** Çok sık kullanılan cümle başlangıçları / geçiş ifadeleri */
  openers: { opener: string; count: number }[];
  /** Neredeyse aynı cümle çiftleri */
  nearDuplicates: { a: string; b: string }[];
  sentences: number;
}

const STOP_TR = new Set("ve veya ile bir bu şu o da de ki için gibi olarak daha en çok ise ya ne her bazı ancak fakat çünkü kadar sonra önce göre üzere arasında olan olduğu olan olup olması olarak ayrıca hem mi mı mu mü değil diğer aynı ilgili yönelik ilişkin itibaren karşı rağmen yani nasıl neden hangi tüm bütün birçok çeşitli farklı".split(" "));
const STOP_EN = new Set("the a an and or of to in on for with by as at from that this these those is are was were be been being it its which who whom whose not no but also more most such than then there their they them can could may might will would should has have had do does did into over under between about".split(" "));

/** Yapay zekâ metinlerinde aşırı kullanılan geçiş ifadeleri (cümle başında) */
export const CONNECTORS_TR = ["bu bağlamda", "bu doğrultuda", "bu çerçevede", "sonuç olarak", "ayrıca", "bununla birlikte", "öte yandan", "diğer taraftan", "dolayısıyla", "nitekim", "bu nedenle", "buna ek olarak", "bunun yanı sıra", "özellikle", "son olarak", "genel olarak", "kısacası", "özetle", "bu durum", "bu açıdan", "bu kapsamda", "ek olarak", "aynı zamanda", "literatürde"];
export const CONNECTORS_EN = ["moreover", "furthermore", "additionally", "in addition", "in this context", "however", "therefore", "thus", "in conclusion", "overall", "notably", "consequently", "importantly", "finally", "in summary", "similarly", "as a result"];

const words = (s: string) => s.toLocaleLowerCase("tr").replace(/\[[^\]]*\]|\([^)]*\d{4}[^)]*\)/g, " ").split(/[^\p{L}\p{N}]+/u).filter(Boolean);

export function splitSentences(text: string): string[] {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?…])\s+(?=[\p{Lu}"“(])/u).map((s) => s.trim()).filter((s) => s.length > 2);
}

function isContent(w: string, keep: Set<string>): boolean {
  return w.length > 2 && !STOP_TR.has(w) && !STOP_EN.has(w) && !/^\d+$/.test(w) && !keep.has(w);
}

/** Türkçe eklerden bağımsız karşılaştırma için kaba kök (ilk 5 harf) */
const stem = (w: string) => w.slice(0, 5);

export function analyzeRepetition(text: string, opts: { keepTerms?: string[]; minCount?: number } = {}): RepetitionReport {
  const keep = new Set((opts.keepTerms ?? []).flatMap((t) => words(t)).map(stem));
  const sents = splitSentences(text);
  const toks = words(text);
  const min = opts.minCount ?? 3;

  // 1) Kalıp ifadeler: en az iki içerik kelimesi taşıyan 3–5 kelimelik diziler
  const counts = new Map<string, number>();
  for (let n = 3; n <= 5; n++) {
    for (let i = 0; i + n <= toks.length; i++) {
      const g = toks.slice(i, i + n);
      const content = g.filter((w) => isContent(w, new Set())).length;
      const topical = g.filter((w) => keep.has(stem(w))).length;
      if (content < 2 || topical >= content || STOP_TR.has(g[n - 1]) || STOP_EN.has(g[n - 1]) || STOP_TR.has(g[0]) || STOP_EN.has(g[0])) continue;
      const key = g.join(" ");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  let phrases = [...counts.entries()].filter(([, c]) => c >= min).map(([phrase, count]) => ({ phrase, count }));
  // Daha uzun bir ifadenin parçası olan ve aynı sayıda geçen kısa ifadeleri ele
  phrases = phrases.filter((p) => !phrases.some((q) => q !== p && q.phrase.length > p.phrase.length && q.phrase.includes(p.phrase) && q.count >= p.count));
  phrases.sort((a, b) => b.count - a.count || b.phrase.length - a.phrase.length);

  // 2) Cümle başlangıçları
  const openerCounts = new Map<string, number>();
  const connectors = [...CONNECTORS_TR, ...CONNECTORS_EN].sort((a, b) => b.length - a.length);
  for (const s of sents) {
    const low = s.toLocaleLowerCase("tr").replace(/^[^\p{L}]+/u, "");
    const c = connectors.find((x) => low.startsWith(x) && !/\p{L}/u.test(low.charAt(x.length)));
    const key = c ?? words(s).slice(0, 2).join(" ");
    if (key) openerCounts.set(key, (openerCounts.get(key) ?? 0) + 1);
  }
  const openers = [...openerCounts.entries()]
    .filter(([o, c]) => (connectors.includes(o) ? c >= 3 : c >= 4))
    .map(([opener, count]) => ({ opener, count }))
    .sort((a, b) => b.count - a.count);

  // 3) Neredeyse aynı cümleler (içerik kelimesi kümeleri benzerliği)
  const sets = sents.map((s) => ({ s, set: new Set(words(s).filter((w) => isContent(w, new Set())).map(stem)) })).filter((x) => x.set.size >= 6);
  const nearDuplicates: { a: string; b: string }[] = [];
  for (let i = 0; i < sets.length && nearDuplicates.length < 10; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const a = sets[i].set, b = sets[j].set;
      let inter = 0;
      for (const w of a) if (b.has(w)) inter++;
      if (inter / (a.size + b.size - inter) >= 0.6) { nearDuplicates.push({ a: sets[i].s, b: sets[j].s }); break; }
    }
  }

  return { phrases: phrases.slice(0, 15), openers: openers.slice(0, 8), nearDuplicates, sentences: sents.length };
}

/** Raporun ciddi olup olmadığı (kullanıcıya uyarı gösterilecek düzey) */
export function isRepetitive(r: RepetitionReport): boolean {
  return r.phrases.some((p) => p.count >= 4) || r.phrases.length >= 3 || r.openers.some((o) => o.count >= 4) || r.nearDuplicates.length >= 2;
}

/** Yapay zekâya "bunları kullanma" diye verilecek kısa liste */
export function avoidListForPrompt(r: RepetitionReport): string[] {
  return [...r.openers.map((o) => `“${o.opener}…” ile başlayan cümle (${o.count} kez)`), ...r.phrases.slice(0, 12).map((p) => `“${p.phrase}” (${p.count} kez)`)];
}
