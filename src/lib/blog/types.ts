export interface BlogPost {
  slug: string;
  title: string;
  /** İsteğe bağlı arama başlığı (<title>, ≤60 karakter); yoksa başlık otomatik sığdırılır (fitTitle) */
  seoTitle?: string;
  /** Arama sonuçlarında görünen kısa açıklama (≈150 karakter) */
  description: string;
  category: "Tez yazımı" | "Kaynak ve atıf" | "Araştırma ve yöntem" | "Makale ve yayın" | "Etik ve yapay zekâ" | "Başvuru ve savunma";
  keywords: string[];
  date: string;
  /** Yazının sonundaki yönlendirme: ilgili özellik */
  cta: { text: string; href: string; label: string };
  /** Basit Markdown: ##, ###, paragraf, - liste, 1. liste, **kalın**, [bağlantı](/yol), > not */
  body: string;
}

/** Yazının İngilizce sürümü (ayrı adres: /en/blog/<slug>) */
export interface BlogPostEn {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  keywords: string[];
  cta: { text: string; label: string };
  body: string;
}
