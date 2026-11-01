import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const sans = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const serif = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: "Akademi AI — Yapay zekâ destekli akademik araştırma ve yazım platformu", template: "%s · Akademi AI" },
  description: "Tez, makale ve araştırma önerinizi gerçek akademik kaynaklarla, doğru atıflarla ve adım adım hazırlayın.",
};

export const viewport: Viewport = { themeColor: "#151829", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
