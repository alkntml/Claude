import type { MetadataRoute } from "next";

/** Telefona/bilgisayara uygulama olarak kurulum (PWA) */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Academiana",
    short_name: "Academiana",
    description: "Tez, makale ve araştırma önerinizi gerçek akademik kaynaklarla adım adım hazırlayın.",
    id: "/panel",
    start_url: "/panel?kaynak=uygulama",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f6f7fb",
    theme_color: "#151829",
    lang: "tr",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Yeni çalışma", url: "/yeni", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Kaynak araştırması", url: "/kaynaklar", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
