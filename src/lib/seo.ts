/**
 * Arama motoru altyapısı: dil bazlı adresler ve yardımcılar (istemci + sunucu).
 * Türkçe sayfalar köke, İngilizce sayfalar /en önekine yerleşir: /fiyatlar ↔ /en/fiyatlar.
 * Yalnızca herkese açık (tanıtım) sayfalar önekli; uygulama sayfaları çerezdeki dili kullanır.
 */
import type { Locale } from "@/i18n";
import { SITE_URL } from "./site";

export const PUBLIC_PATHS = ["/", "/fiyatlar", "/ornekler", "/sss", "/kurumlar", "/uzman-destegi", "/yardim", "/gizlilik", "/kosullar", "/akademik-durustluk", "/blog", "/kayit", "/giris", "/araclar", "/araclar/uydurma-kaynak-kontrolu", "/araclar/kaynakca-olusturucu", "/araclar/atif-donusturucu", "/araclar/orneklem-hesaplayici", "/araclar/cronbach-alfa", "/araclar/anket-olusturucu"];

export function isPublicPath(path: string): boolean {
  const p = path.split(/[?#]/)[0] || "/";
  return PUBLIC_PATHS.includes(p) || p.startsWith("/blog/");
}

/** /en/… → { locale: "en", path: "/…" } */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  if (pathname === "/en" || pathname.startsWith("/en/") || pathname.startsWith("/en?") || pathname.startsWith("/en#")) {
    const rest = pathname.slice(3);
    return { locale: "en", path: rest.startsWith("/") ? rest : `/${rest}` };
  }
  return { locale: null, path: pathname };
}

/** Herkese açık bir yolun belirtilen dildeki adresi (sorgu ve # korunur) */
export function localizedPath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const m = href.match(/^([^?#]*)(.*)$/)!;
  const base = m[1] || "/";
  const { locale: already, path } = splitLocale(base);
  const clean = already ? path : base;
  if (!isPublicPath(clean)) return href;
  if (locale === "tr") return `${clean}${m[2]}`;
  return `${clean === "/" ? "/en" : `/en${clean}`}${m[2]}`;
}

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Botlar (arama motorları, önizleme servisleri) dil yönlendirmesine tabi tutulmaz */
export const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|whatsapp|telegram|linkedin|twitter|discord|preview|lighthouse|headless|google-inspectiontool|ahrefs|semrush/i;
