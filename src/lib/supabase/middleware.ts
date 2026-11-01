import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, localeForCountry, normalizeLocale } from "@/i18n";

const PROTECTED = ["/panel", "/proje", "/kaynaklar", "/dosyalar", "/hesap", "/yonetim", "/yeni", "/anketler", "/kurum", "/konu-bul"];

/** İlk ziyarette ülkeye göre dil: Türkiye (veya bilinmeyen) → tr, diğer ülkeler → en. Kullanıcı seçimi (çerez) her zaman önceliklidir. */
export async function updateSession(request: NextRequest) {
  const missing = !normalizeLocale(request.cookies.get(LOCALE_COOKIE)?.value);
  const locale = localeForCountry(request.headers.get("x-vercel-ip-country"));
  // Sunucu bileşenleri ilk istekte de doğru dili görsün diye isteğe de yazılır
  if (missing) request.cookies.set(LOCALE_COOKIE, locale);
  const response = await sessionResponse(request);
  if (missing) response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 31536000, sameSite: "lax" });
  return response;
}

async function sessionResponse(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

  if (!url || !key) {
    // Yapılandırma eksikse korumalı sayfalar kurulum ekranına yönlendirilir.
    if (isProtected) return NextResponse.redirect(new URL("/kurulum", request.url));
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
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
