import "server-only";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, localeForCountry, makeT, normalizeLocale, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const fromCookie = normalizeLocale(c.get(LOCALE_COOKIE)?.value);
  if (fromCookie) return fromCookie;
  const h = await headers();
  return localeForCountry(h.get("x-vercel-ip-country"));
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: makeT(locale) };
}

/** API rotalarında istek çerezinden dil */
export function localeFromRequest(req: Request): Locale {
  const m = (req.headers.get("cookie") ?? "").match(/(?:^|;\s*)lang=(tr|en)/);
  if (m) return m[1] as Locale;
  return localeForCountry(req.headers.get("x-vercel-ip-country"));
}
