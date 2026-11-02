export interface BlogPost {
  slug: string;
  title: string;
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
