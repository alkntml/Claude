/** Büyük/küçük harf ve aksan duyarsız arama (ı/i, ş/s, ü/u, ä/a …); Türkçe, İngilizce ve Almanca için ortak. */
export const normSearch = (x: string) => x.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ß/g, "ss").normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Sorgudaki her kelime metinde geçiyorsa eşleşir */
export function matchesAll(query: string, haystack: string): boolean {
  const q = normSearch(query.trim());
  if (!q) return true;
  const h = normSearch(haystack);
  return q.split(/\s+/).every((w) => h.includes(w));
}
