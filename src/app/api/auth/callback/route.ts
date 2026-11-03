import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { attachReferral, grantReferralReward } from "@/lib/growth";

/** E-posta doğrulama ve OAuth dönüşü: kodu oturuma çevirir. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/panel";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/panel";
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Davet ödülü: e-posta doğrulandığında (bir kez) her iki tarafa kredi
      // Google/Apple ile ilk girişte davet kodu geri dönüş adresinden gelir
      const ref = url.searchParams.get("ref");
      if (data.user && ref) await attachReferral(data.user.id, ref, data.user.created_at).catch(() => {});
      if (data.user) await grantReferralReward(data.user.id, !!data.user.email_confirmed_at).catch(() => false);
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
  }
  // Şifre yenileme bağlantısı geçersizse yeni bağlantı isteme sayfasına dön (D74)
  return NextResponse.redirect(new URL(safeNext === "/sifre-yenile" ? "/sifremi-unuttum?hata=baglanti" : "/giris?hata=dogrulama", url.origin));
}
