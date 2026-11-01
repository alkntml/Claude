import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { grantReferralReward } from "@/lib/growth";

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
      if (data.user) await grantReferralReward(data.user.id, !!data.user.email_confirmed_at).catch(() => false);
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/giris?hata=dogrulama", url.origin));
}
