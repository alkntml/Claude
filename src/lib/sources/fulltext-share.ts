/**
 * D177: Kütüphaneye eklenen kaynakların en az %60’ı tam metni okunabilen (açık erişim PDF, PMC, arXiv) kaynaklar olmalı.
 * İstemci ve sunucuda ortak kullanılır (otomatik ekleme, literatür araştırması ön seçimi).
 */
export const FULLTEXT_SHARE = 0.6;

export const fullTextLikely = (r: { oaUrl?: string | null; pmcid?: string | null; arxivId?: string | null; oa_url?: string | null; arxiv_id?: string | null }) =>
  !!(r.oaUrl || r.oa_url || r.pmcid || r.arxivId || r.arxiv_id);

/**
 * Sıralı adaylardan (en iyi önce) en fazla `max` tanesini seçer: önce tam metinliler, ardından tam metni olmayanlar
 * toplamın en fazla %40’ı olacak kadar. Seçilen dizinleri (aday sırasına göre) döndürür.
 */
export function pickWithFullTextQuota<T>(items: T[], max: number, isFull: (x: T) => boolean, accept: (x: T, chosen: T[]) => boolean = () => true): number[] {
  const chosen: number[] = [];
  const picked: T[] = [];
  items.forEach((x, i) => { if (chosen.length < max && isFull(x) && accept(x, picked)) { chosen.push(i); picked.push(x); } });
  const ft = chosen.length;
  const maxOther = Math.floor((ft * (1 - FULLTEXT_SHARE)) / FULLTEXT_SHARE + 1e-9);
  let other = 0;
  items.forEach((x, i) => { if (chosen.length < max && other < maxOther && !isFull(x) && accept(x, picked)) { chosen.push(i); picked.push(x); other++; } });
  return chosen.sort((a, b) => a - b);
}
