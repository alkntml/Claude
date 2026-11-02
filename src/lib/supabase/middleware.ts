import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, localeForCountry, normalizeLocale } from "@/i18n";
import { SITE_URL } from "@/lib/site";
import { BOT_UA, isPublicPath, splitLocale } from "@/lib/seo";

const PROTECTED = ["/panel", "/proje", "/kaynaklar", "/dosyalar", "/hesap", "/yonetim", "/yeni", "/anketler", "/kurum", "/konu-bul"];

/** İlk ziyarette ülkeye göre dil: Türkiye (veya bilinmeyen) → tr, diğer ülkeler → en. Kullanıcı seçimi (çerez) her zaman önceliklidir. */
export async function updateSession(request: NextRequest) {
  // Eski Vercel adresinden gelen sayfa ziyaretleri resmî alan adına yönlendirilir (REDIRECT_TO_DOMAIN=1 iken; API hariç)
  const host = request.headers.get("host") ?? "";
  if (process.env.REDIRECT_TO_DOMAIN === "1" && host.endsWith(".vercel.app") && !request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, SITE_URL), 308);
  }
  const { pathname, search } = request.nextUrl;
  const cookieLang = normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  const geo = localeForCountry(request.headers.get("x-vercel-ip-country"));
  const { locale: prefixed, path: basePath } = splitLocale(pathname);
  const setLang = (res: NextResponse, l: string) => { res.cookies.set(LOCALE_COOKIE, l, { path: "/", maxAge: 31536000, sameSite: "lax" }); return res; };

  // Herkese açık sayfalar: dil adresten belirlenir (arama motorları her dili ayrı adreste görür)
  if (prefixed === "en" && !isPublicPath(basePath)) return NextResponse.redirect(new URL(`${basePath}${search}`, request.url), 308);
  if (isPublicPath(basePath)) {
    const urlLocale = prefixed ?? "tr";
    // İnsan ziyaretçi, öneksiz (Türkçe) sayfaya geldi ve tercihi İngilizce ise /en sürümüne yönlendir (botlar hariç)
    if (!prefixed && request.method === "GET" && !BOT_UA.test(request.headers.get("user-agent") ?? "") && (cookieLang ?? geo) === "en") {
      return setLang(NextResponse.redirect(new URL(`${pathname === "/" ? "/en" : `/en${pathname}`}${search}`, request.url), 307), "en");
    }
    request.cookies.set(LOCALE_COOKIE, urlLocale);
    const build = () => {
      const h = new Headers(request.headers);
      h.set("x-locale", urlLocale);
      return prefixed ? NextResponse.rewrite(new URL(`${basePath}${search}`, request.url), { request: { headers: h } }) : NextResponse.next({ request: { headers: h } });
    };
    const res = await sessionResponse(request, build);
    if (cookieLang !== urlLocale && (prefixed || !cookieLang)) setLang(res, urlLocale);
    return res;
  }

  // Uygulama sayfaları: çerezdeki dil; yoksa ülkeye göre
  if (!cookieLang) request.cookies.set(LOCALE_COOKIE, geo);
  const response = await sessionResponse(request, () => NextResponse.next({ request }));
  if (!cookieLang) setLang(response, geo);
  return response;
}

async function sessionResponse(request: NextRequest, build: () => NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

  if (!url || !key) {
    // Yapılandırma eksikse korumalı sayfalar kurulum ekranına yönlendirilir.
    if (isProtected) return NextResponse.redirect(new URL("/kurulum", request.url));
    return build();
  }

  let response = build();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = build();
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && isProtected) {
    const to = new URL("/giris", request.url);
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }
  return response;
}
