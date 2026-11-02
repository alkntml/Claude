import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";
import { PwaRegister } from "@/components/pwa";

const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
// Başlıklar ve metin editörü: klasik akademik yayın hissi veren Source Serif (optik boyutlu, Türkçe karakter destekli)
const serif = Source_Serif_4({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap", style: ["normal", "italic"], axes: ["opsz"] });

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === "en";
  return {
    title: { default: en ? "Akademi AI — AI-powered academic research and writing platform" : "Akademi AI — Yapay zekâ destekli akademik araştırma ve yazım platformu", template: "%s · Akademi AI" },
    description: en ? "Prepare your thesis, article or research proposal step by step, with real academic sources and correct citations." : "Tez, makale ve araştırma önerinizi gerçek akademik kaynaklarla, doğru atıflarla ve adım adım hazırlayın.",
    applicationName: "Akademi AI",
    appleWebApp: { capable: true, title: "Akademi AI", statusBarStyle: "default" },
    icons: { icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }], apple: "/icons/apple-touch-icon.png" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { themeColor: "#151829", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans min-h-screen">
        <I18nProvider locale={locale}>
          <ToastProvider>{children}</ToastProvider>
          <PwaRegister />
        </I18nProvider>
      </body>
    </html>
  );
}
