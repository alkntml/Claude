/** Veritabanı yapılandırılmadan önce fiyat sayfasında gösterilen varsayılanlar (seed ile aynıdır). */
export const FALLBACK_PLANS = [
  { id: "free", name: "Ücretsiz", description: "Platformu tanımak için sınırlı kullanım.", price_monthly: 0, price_yearly: 0, currency: "TRY", features: ["1 proje", "Aylık 30 yapay zekâ isteği", "Aylık 40 kaynak taraması", "TXT / Markdown dışa aktarma"] },
  { id: "basic", name: "Basic", description: "Bireysel öğrenciler için temel akademik çalışma.", price_monthly: 249, price_yearly: 2490, currency: "TRY", features: ["5 proje", "Aylık 300 yapay zekâ isteği", "Aylık 400 kaynak taraması", "DOCX / PDF dışa aktarma", "Kalite kontrol"] },
  { id: "pro", name: "Pro", description: "Gelişmiş araştırma, kaynak analizi ve yüksek limitler.", price_monthly: 549, price_yearly: 5490, currency: "TRY", features: ["20 proje", "Aylık 1.500 yapay zekâ isteği", "Tam metin analizi (RAG)", "Kılavuz yükleme", "Öncelikli modeller"] },
  { id: "premium", name: "Premium", description: "Yoğun çalışan lisansüstü öğrenciler ve araştırmacılar için.", price_monthly: 999, price_yearly: 9990, currency: "TRY", features: ["Sınırsız proje", "Aylık 5.000 yapay zekâ isteği", "En güçlü modeller", "15 GB depolama", "Öncelikli destek"] },
];
export type PlanLike = (typeof FALLBACK_PLANS)[number];
