import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, localeForCountry, normalizeLocale } from "@/i18n/core";
import { SITE_URL } from "@/lib/site";
import { BOT_UA, isPublicPath, splitLocale } from "@/lib/seo";

const PROTECTED = ["/panel", "/proje", "/kaynaklar", "/dosyalar", "/hesap", "/yonetim", "/yeni", "/anketler", "/kurum", "/konu-bul"];

/** İlk ziyarette ülkeye göre dil: Türkiye (veya bilinmeyen) → tr, Almanca konuşulan ülkeler → de, diğerleri → en. Kullanıcı seçimi (çerez) her zaman önceliklidir. */
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
  if (prefixed && !isPublicPath(basePath)) return NextResponse.redirect(new URL(`${basePath}${search}`, request.url), 308);
  if (isPublicPath(basePath)) {
    const urlLocale = prefixed ?? "tr";
    // İnsan ziyaretçi, öneksiz (Türkçe) sayfaya geldi ve tercihi İngilizce/Almanca ise /en veya /de sürümüne yönlendir (botlar hariç)
    const pref = cookieLang ?? geo;
    if (!prefixed && pref !== "tr" && request.method === "GET" && !BOT_UA.test(request.headers.get("user-agent") ?? "")) {
      return setLang(NextResponse.redirect(new URL(`${pathname === "/" ? `/${pref}` : `/${pref}${pathname}`}${search}`, request.url), 307), pref);
    }
    request.cookies.set(LOCALE_COOKIE, urlLocale);
    const build = () => {
      const h = new Headers(request.headers);
      h.set("x-locale", urlLocale);
      return prefixed ? NextResponse.rewrite(new URL(`${basePath}${search}`, request.url), { request: { headers: h } }) : NextResponse.next({ request: { headers: h } });
    };
    // Tanıtım sayfalarında oturum yenilenmez (Supabase’e ağ isteği yok; giriş durumu yalnızca çerezden okunur — D57).
    // Oturum, uygulama sayfasına geçildiğinde yenilenir.
    const res = build();
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

  // API uçları oturumu kendileri doğrular (requireUser); ara katmanda ikinci kez sorgulamaya gerek yok
  if (path.startsWith("/api/")) return build();
  // Oturum çerezi yoksa Supabase’e hiç gidilmez (ziyaretçiler ve arama motorları için hızlı)
  const hasAuth = request.cookies.getAll().some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name));
  if (!hasAuth) {
    if (isProtected) {
      const to = new URL("/giris", request.url);
      to.searchParams.set("next", path);
      return NextResponse.redirect(to);
    }
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

  // Oturumu yeniler; imza yerelde doğrulanabiliyorsa (asimetrik anahtar) ağ isteği yapmaz
  const { data } = await supabase.auth.getClaims().catch(() => ({ data: null }));
  const user = data?.claims?.sub ?? null;
  if (!user && isProtected) {
    const to = new URL("/giris", request.url);
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }
  return response;
}
