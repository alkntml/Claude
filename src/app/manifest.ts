import type { MetadataRoute } from "next";
import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/core";

const TEXT: Record<Locale, { description: string; newWork: string; sources: string; lang: string }> = {
  tr: { description: "Tez, makale ve araştırma önerinizi gerçek akademik kaynaklarla adım adım hazırlayın.", newWork: "Yeni çalışma", sources: "Kaynak araştırması", lang: "tr" },
  en: { description: "Prepare your thesis, paper or research proposal step by step with real academic sources.", newWork: "New work", sources: "Source search", lang: "en" },
  de: { description: "Erstellen Sie Abschlussarbeit, Fachartikel oder Forschungsexposé Schritt für Schritt mit echten wissenschaftlichen Quellen.", newWork: "Neue Arbeit", sources: "Quellenrecherche", lang: "de" },
};

/** Telefona/bilgisayara uygulama olarak kurulum (PWA); ad ve kısayollar ziyaretçinin dilinde */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const x = TEXT[await getLocale()];
  return {
    name: "Academiana",
    short_name: "Academiana",
    description: x.description,
    id: "/panel",
    start_url: "/panel?kaynak=uygulama",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#020d2d",
    theme_color: "#0f1d3d",
    lang: x.lang,
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: x.newWork, url: "/yeni", icons: [{ src: "/icons/icon-192.png?v=2", sizes: "192x192" }] },
      { name: x.sources, url: "/kaynaklar", icons: [{ src: "/icons/icon-192.png?v=2", sizes: "192x192" }] },
    ],
  };
}
