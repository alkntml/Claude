/** D224: APA raporlarının ortak biçimlendirme yardımcıları (apa.ts ve apa2.ts kullanır) */
export type L = "tr" | "en" | "de";
/** Üç dilli kısa seçici */
export const L3 = (l: L, tr: string, en: string, de: string) => (l === "tr" ? tr : l === "de" ? de : en);

// ---------------------------------------------------------------------------
// Biçimlendirme (APA 7): p < .001; r, β, p, α başında sıfırsız
// ---------------------------------------------------------------------------
export const f2 = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "—");
export const noZero = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d).replace(/^(-?)0\./, "$1.") : "—");
export const pApa = (p: number) => (p < 0.001 ? "p < .001" : `p = ${noZero(p, 3)}`);
export const pCell = (p: number) => (p < 0.001 ? "< .001" : noZero(p, 3));
export const stars = (p: number) => (p < 0.001 ? "***" : p < 0.01 ? "**" : p < 0.05 ? "*" : "");
export const sig = (p: number, l: L) => (p < 0.05 ? L3(l, "anlamlı", "significant", "signifikant") : L3(l, "anlamlı değildir", "not significant", "nicht signifikant"));
export const table = (head: string[], rows: (string | number)[][]) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");

