/**
 * Arama motoru altyapısı: dil bazlı adresler ve yardımcılar (istemci + sunucu).
 * Türkçe sayfalar köke, İngilizce sayfalar /en, Almanca sayfalar /de önekine yerleşir: /fiyatlar ↔ /en/fiyatlar ↔ /de/fiyatlar.
 * Yalnızca herkese açık (tanıtım) sayfalar önekli; uygulama sayfaları çerezdeki dili kullanır.
 */
import type { Locale } from "@/i18n";
import { SITE_URL } from "./site";

export const PUBLIC_PATHS = ["/", "/fiyatlar", "/ornekler", "/sss", "/kurumlar", "/yardim", "/gizlilik", "/kosullar", "/akademik-durustluk", "/hakkimizda", "/yontem", "/blog", "/kayit", "/giris", "/araclar", "/araclar/arastirmalar-ne-diyor", "/araclar/uydurma-kaynak-kontrolu", "/araclar/kaynakca-olusturucu", "/araclar/atif-donusturucu", "/araclar/orneklem-hesaplayici", "/araclar/cronbach-alfa", "/araclar/anket-olusturucu"];

export function isPublicPath(path: string): boolean {
  const p = path.split(/[?#]/)[0] || "/";
  return PUBLIC_PATHS.includes(p) || p.startsWith("/blog/");
}

/** /en/… veya /de/… → { locale, path: "/…" } */
export function splitLocale(pathname: string): { locale: Exclude<Locale, "tr"> | null; path: string } {
  for (const l of ["en", "de"] as const) {
    const p = `/${l}`;
    if (pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}?`) || pathname.startsWith(`${p}#`)) {
      const rest = pathname.slice(3);
      return { locale: l, path: rest.startsWith("/") ? rest : `/${rest}` };
    }
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
  return `${clean === "/" ? `/${locale}` : `/${locale}${clean}`}${m[2]}`;
}

/** Herkese açık sayfaların son içerik güncellemesi (site haritası lastmod); sayfa metinleri değişince güncellenir */
export const SITE_CONTENT_UPDATED = "2026-11-12";

export const absoluteUrl = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/** Botlar (arama motorları, önizleme servisleri) dil yönlendirmesine tabi tutulmaz */
export const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|whatsapp|telegram|linkedin|twitter|discord|preview|lighthouse|headless|google-inspectiontool|ahrefs|semrush/i;

const BRAND = " | Academiana";
/** Arama sonuçlarında kesilmeyen sayfa başlığı (≈60 karakter): sığarsa marka eklenir, sığmazsa anlamlı kısma kadar kısaltılır */
export function fitTitle(raw: string, max = 60): string {
  const base = raw.replace(/\s*[|·—-]\s*Academiana\s*$/i, "").trim();
  if (base.length + BRAND.length <= max) return base + BRAND;
  if (base.length <= max) return base;
  // Ayırıcıya kadar olan ana kısım (soru işareti korunur): “Tez Nasıl Yazılır? …” → “Tez Nasıl Yazılır?”
  const m = base.match(/^(.{12,}?)(\?|:|\s[—–-]\s|\s\(|,)/);
  if (m) {
    const head = (m[1] + (m[2] === "?" ? "?" : "")).trim();
    if (head.length <= max) return head.length + BRAND.length <= max ? head + BRAND : head;
  }
  const cut = base.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,:;—–-]+$/, "").trim();
}
