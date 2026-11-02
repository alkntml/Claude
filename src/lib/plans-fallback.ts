/** Veritabanı yapılandırılmadan önce fiyat sayfasında gösterilen varsayılanlar (seed ile aynıdır). */
export const FALLBACK_PLANS = [
  { id: "free", name: "Ücretsiz", description: "Platformu tanımak için sınırlı kullanım.", price_monthly: 0, price_yearly: 0, currency: "TRY", features: ["1 proje", "Aylık 20 yapay zekâ isteği", "Aylık 7 kaynak taraması", "TXT / Markdown dışa aktarma"] },
  { id: "basic", name: "Basic", description: "Bireysel öğrenciler için temel akademik çalışma.", price_monthly: 499, price_yearly: 4990, currency: "TRY", features: ["3 proje", "Aylık 150 yapay zekâ isteği", "Aylık 100 kaynak taraması", "DOCX / PDF dışa aktarma", "Kalite kontrol"] },
  { id: "pro", name: "Pro", description: "Gelişmiş araştırma, kaynak analizi ve yüksek limitler.", price_monthly: 899, price_yearly: 8990, currency: "TRY", features: ["10 proje", "Aylık 1.500 yapay zekâ isteği", "Aylık 2.000 kaynak taraması", "Tam metin analizi (RAG)", "Kılavuz yükleme"] },
  { id: "premium", name: "Premium", description: "Yoğun çalışan lisansüstü öğrenciler ve araştırmacılar için.", price_monthly: 1499, price_yearly: 14990, currency: "TRY", features: ["Sınırsız proje", "Aylık 5.000 yapay zekâ isteği", "Aylık 8.000 kaynak taraması", "15 GB depolama", "Öncelikli destek"] },
];
export type PlanLike = (typeof FALLBACK_PLANS)[number];
