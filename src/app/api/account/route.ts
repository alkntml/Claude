import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { STYLE_IDS } from "@/lib/citations";
import { adminClient } from "@/lib/supabase/admin";
import { effectiveLimits, forClient, usageSummary } from "@/lib/usage";
import { buildUserExport } from "@/lib/data-export";
import { listUserObjects, removeObjects } from "@/lib/account-delete";

export const GET = route("account.get", async (req) => {
  const s = await requireUser();
  if (new URL(req.url).searchParams.get("export") === "1") {
    const out = await buildUserExport(s.supabase, s.user.id, s.profile);
    await s.supabase.from("data_requests").insert({ user_id: s.user.id, kind: "export", status: "completed", completed_at: new Date().toISOString() });
    return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="academiana-verilerim.json"` } });
  }
  const [usage, limits, subs] = await Promise.all([
    usageSummary(s.user.id),
    effectiveLimits(s.user.id, s.profile.plan_id),
    s.supabase.from("subscriptions").select("*").eq("user_id", s.user.id).order("created_at", { ascending: false }).limit(5),
  ]);
  return json({ profile: s.profile, ...forClient(usage, limits), subscriptions: subs.data ?? [] });
});

export const PATCH = route("account.update", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, z.object({ fullName: z.string().max(200).optional(), institution: z.string().max(300).optional(), locale: z.enum(["tr", "en", "de"]).optional(), defaultCitationStyle: z.enum(STYLE_IDS as [string, ...string[]]).optional() }));
  const update: Record<string, unknown> = {};
  if (b.fullName !== undefined) update.full_name = b.fullName;
  if (b.institution !== undefined) update.institution = b.institution;
  if (b.locale) update.locale = b.locale;
  if (b.defaultCitationStyle) update.default_citation_style = b.defaultCitationStyle;
  const { data, error } = await s.supabase.from("profiles").update(update).eq("id", s.user.id).select().single();
  if (error) throw error;
  return json({ profile: data });
});

/**
 * Hesabı ve tüm verileri kalıcı olarak siler (D154 doğrulaması):
 * - Depo: `<user_id>/` altındaki TÜM dosyalar, alt klasörler (ör. Overleaf geçici ZIP’leri) ve 1000’den fazlası dâhil; ayrıca files tablosundaki yollar
 * - Veritabanı: auth kullanıcısı silinince profiles ve user_id ile bağlı tüm tablolar CASCADE ile silinir
 *   (çalışmalar, bölümler, sürümler, yorumlar, kaynaklar, notlar, dosya kayıtları, sohbetler, kullanım ve kanıt kayıtları,
 *   cihaz kimliği özetleri, gönderdiği ortak yazar davetleri, danışman paylaşım bağlantıları, bildirimler, anketler, ödeme kayıtları, kabul kayıtları)
 * - Kalanlar (kişi bağı koparılır, user_id = null): geri bildirim mesajları, hata kayıtları, ücretsiz araç kullanım sayaçları, veri talebi kaydı
 * Yedekler: barındırma sağlayıcısının yedeklerindeki kopyalar yedek saklama süresi dolunca silinir (docs/ACCOUNT_DELETION.md).
 */
export const DELETE = route("account.delete", async (req) => {
  const s = await requireUser();
  const { confirm } = await parseBody(req, z.object({ confirm: z.string() }));
  if (confirm !== "SİL" && confirm !== "SIL") throw new ApiError(422, "Onay için SİL yazın");
  const db = adminClient();
  const store = db.storage.from("user-files");
  const { data: rows } = await db.from("files").select("storage_path").eq("user_id", s.user.id).limit(50000);
  const listed = await listUserObjects(store, s.user.id);
  const paths = [...new Set([...listed, ...(rows ?? []).map((r) => r.storage_path as string).filter((p) => typeof p === "string" && p.startsWith(`${s.user.id}/`))])];
  // Dosyalar silinemezse hesap silinmez (sahipsiz dosya kalmasın); kullanıcı tekrar deneyebilir
  const removedFiles = await removeObjects(store, paths);
  await db.from("data_requests").insert({ user_id: null, kind: "delete", status: "completed", completed_at: new Date().toISOString() });
  const { error } = await db.auth.admin.deleteUser(s.user.id); // profiles ve bağlı tüm tablolar CASCADE ile silinir
  if (error) throw error;
  await s.supabase.auth.signOut();
  return json({ ok: true, removedFiles });
});
