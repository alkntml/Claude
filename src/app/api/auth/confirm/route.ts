import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["recovery", "signup", "email", "invite", "magiclink", "email_change"];

/**
 * E-posta bağlantısı (token_hash) doğrulaması (D74). Supabase e-posta şablonu
 * {{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=recovery biçiminde ayarlanırsa
 * bağlantı, isteğin yapıldığı tarayıcıdan farklı bir cihazda açıldığında da çalışır.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const recovery = type === "recovery";
  const next = url.searchParams.get("next") ?? (recovery ? "/sifre-yenile" : "/panel");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/panel";
  if (token_hash && type && TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }
  return NextResponse.redirect(new URL(recovery ? "/sifremi-unuttum?hata=baglanti" : "/giris?hata=dogrulama", url.origin));
}
