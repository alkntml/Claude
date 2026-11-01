/**
 * Uzman desteği: insan uzmanların verdiği hizmetler iş ortağı dermanlik.com.tr üzerinden sunulur.
 * Bağlantılar hangi hizmetten gelindiğini UTM parametreleriyle bildirir (kişisel veri gönderilmez).
 */
export const EXPERT_SITE = "https://dermanlik.com.tr";

export const EXPERT_SERVICES = [
  { id: "redaksiyon", title: "Akademik dil ve redaksiyon", desc: "Metninizin dil, anlatım, akış ve yazım kurallarına uygunluğunun uzman editörlerce düzeltilmesi." },
  { id: "istatistik", title: "İstatistik danışmanlığı", desc: "Analiz yönteminin seçimi, SPSS/R/AMOS analizleri ve bulguların raporlanmasında uzman desteği." },
  { id: "ceviri", title: "Akademik çeviri ve İngilizce düzeltme", desc: "Özet, makale ve tez çevirisi; İngilizce metinlerin anadil düzeyinde düzeltilmesi (proofreading)." },
  { id: "bicim", title: "Biçim ve şablon kontrolü", desc: "Tez yazım kılavuzuna ve dergi kurallarına göre biçim, kaynakça ve tablo düzeni kontrolü." },
] as const;

export function expertUrl(service?: string, medium = "site"): string {
  const u = new URL(EXPERT_SITE);
  u.searchParams.set("utm_source", "akademi-ai");
  u.searchParams.set("utm_medium", medium);
  if (service) u.searchParams.set("utm_campaign", service);
  return u.toString();
}
