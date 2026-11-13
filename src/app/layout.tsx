import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import { PwaRegister } from "@/components/pwa";
import { ConsentBanner } from "@/components/consent/consent";
import { Analytics } from "@/components/analytics";
import { UpgradeDialogHost } from "@/components/upgrade-dialog";
import { PriceProvider } from "@/components/price-context";
import { getUsdTry } from "@/lib/fx";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { organizationLd, websiteLd } from "@/lib/structured-data";

const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
// Başlıklar ve metin editörü: klasik akademik yayın hissi veren Source Serif (optik boyutlu, Türkçe karakter destekli)
const serif = Source_Serif_4({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap", style: ["normal", "italic"], axes: ["opsz"] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === "en", de = locale === "de";
  return {
    title: { default: de ? "Academiana — KI-gestützte Plattform für wissenschaftliches Recherchieren und Schreiben" : en ? "Academiana — AI-powered academic research and writing platform" : "Academiana — Yapay zekâ destekli akademik araştırma ve yazım platformu", template: "%s · Academiana" },
    description: de ? "Erstellen Sie Ihre Abschlussarbeit, Ihren Fachartikel oder Ihr Forschungsexposé Schritt für Schritt – mit echten wissenschaftlichen Quellen und korrekten Zitaten." : en ? "Prepare your thesis, article or research proposal step by step, with real academic sources and correct citations." : "Tez, makale ve araştırma önerinizi gerçek akademik kaynaklarla, doğru atıflarla ve adım adım hazırlayın.",
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    openGraph: { type: "website", siteName: SITE_NAME, url: SITE_URL, locale: de ? "de_DE" : en ? "en_US" : "tr_TR", title: de ? "Academiana — KI-gestütztes wissenschaftliches Schreiben mit echten Quellen" : en ? "Academiana — AI-powered academic writing with real sources" : "Academiana — Gerçek kaynaklarla yapay zekâ destekli akademik yazım", description: de ? "Abschlussarbeit, Fachartikel und Forschungsexposé Schritt für Schritt – mit verifizierten Quellen und korrekten Zitaten." : en ? "Thesis, article and research proposal, step by step, with verified sources and correct citations." : "Tez, makale ve araştırma önerinizi doğrulanmış kaynaklar ve doğru atıflarla adım adım hazırlayın." },
    keywords: ["tez yazma", "akademik yazım", "literatür taraması", "APA 7", "kaynakça", "yapay zekâ", "makale yazma", "TÜBİTAK 2209", "Academiana"],
    appleWebApp: { capable: true, title: "Academiana", statusBarStyle: "default" },
    icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" }, { url: "/icons/favicon-96.png", sizes: "96x96", type: "image/png" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/icons/apple-touch-icon.png" },
    formatDetection: { telephone: false },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    twitter: { card: "summary_large_image" },
    category: "education",
    // Arama motoru doğrulama kodları Vercel ortam değişkenlerinden okunur (Search Console, Bing, Yandex)
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
      other: process.env.NEXT_PUBLIC_BING_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } : undefined,
    },
  };
}

export const viewport: Viewport = { themeColor: "#0f1d3d", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, usdTry] = await Promise.all([getLocale(), getUsdTry().catch(() => 48)]);
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body className="font-sans min-h-screen">
        <I18nProvider locale={locale}>
          <PriceProvider usdTry={usdTry}><ToastProvider>{children}</ToastProvider>
          <PwaRegister />
          <ConsentBanner />
          <Analytics />
          <UpgradeDialogHost /></PriceProvider>
          <JsonLd data={[organizationLd(), websiteLd(locale)]} />
        </I18nProvider>
      </body>
    </html>
  );
}
