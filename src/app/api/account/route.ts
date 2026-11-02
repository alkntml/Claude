import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { STYLE_IDS } from "@/lib/citations";
import { adminClient } from "@/lib/supabase/admin";
import { WORK_LOCKED_MESSAGE, effectiveLimits, usageSummary } from "@/lib/usage";
import { getWorkLock } from "@/lib/lock";
import { buildUserExport } from "@/lib/data-export";

export const GET = route("account.get", async (req) => {
  const s = await requireUser();
  if (new URL(req.url).searchParams.get("export") === "1") {
    // Kilitliyken anında indirme kapalı; KVKK talebi /api/account/data-request ile alınır ve yasal sürede yanıtlanır (D50)
    if ((await getWorkLock()).locked) throw new ApiError(402, WORK_LOCKED_MESSAGE, "work_locked");
    const out = await buildUserExport(s.supabase, s.user.id, s.profile);
    await s.supabase.from("data_requests").insert({ user_id: s.user.id, kind: "export", status: "completed", completed_at: new Date().toISOString() });
    return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="academiana-verilerim.json"` } });
  }
  const [usage, limits, subs] = await Promise.all([
    usageSummary(s.user.id),
    effectiveLimits(s.user.id, s.profile.plan_id),
    s.supabase.from("subscriptions").select("*").eq("user_id", s.user.id).order("created_at", { ascending: false }).limit(5),
  ]);
  return json({ profile: s.profile, usage, limits, subscriptions: subs.data ?? [] });
});

export const PATCH = route("account.update", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, z.object({ fullName: z.string().max(200).optional(), institution: z.string().max(300).optional(), locale: z.enum(["tr", "en"]).optional(), defaultCitationStyle: z.enum(STYLE_IDS as [string, ...string[]]).optional() }));
  const update: Record<string, unknown> = {};
  if (b.fullName !== undefined) update.full_name = b.fullName;
  if (b.institution !== undefined) update.institution = b.institution;
  if (b.locale) update.locale = b.locale;
  if (b.defaultCitationStyle) update.default_citation_style = b.defaultCitationStyle;
  const { data, error } = await s.supabase.from("profiles").update(update).eq("id", s.user.id).select().single();
  if (error) throw error;
  return json({ profile: data });
});

/** Hesabı ve tüm verileri kalıcı olarak siler (dosyalar dahil). */
export const DELETE = route("account.delete", async (req) => {
  const s = await requireUser();
  const { confirm } = await parseBody(req, z.object({ confirm: z.string() }));
  if (confirm !== "SİL" && confirm !== "SIL") throw new ApiError(422, "Onay için SİL yazın");
  const db = adminClient();
  const { data: files } = await db.storage.from("user-files").list(s.user.id, { limit: 1000 });
  if (files?.length) await db.storage.from("user-files").remove(files.map((f) => `${s.user.id}/${f.name}`));
  await db.from("data_requests").insert({ user_id: null, kind: "delete", status: "completed", completed_at: new Date().toISOString() });
  const { error } = await db.auth.admin.deleteUser(s.user.id); // profiles ve bağlı tüm tablolar CASCADE ile silinir
  if (error) throw error;
  await s.supabase.auth.signOut();
  return json({ ok: true });
});
