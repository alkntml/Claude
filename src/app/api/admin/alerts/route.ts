import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Yönetim → Uyarılar (D109): kötüye kullanım uyarıları ve yöneticinin kararı */
export const GET = route("admin.alerts", async () => {
  await requireAdmin();
  const db = adminClient();
  const { data: alerts, error } = await db.from("activity_log")
    .select("id, user_id, action, project_id, project_title, output, created_at, profiles(email, full_name, plan_id, is_suspended)")
    .eq("kind", "abuse_alert").order("created_at", { ascending: false }).limit(300);
  if (error) throw error;
  const ids = (alerts ?? []).map((a) => a.id);
  const { data: decisions } = ids.length ? await db.from("abuse_decisions").select("alert_id, decision, note, decided_at").in("alert_id", ids) : { data: [] };
  const byId = new Map((decisions ?? []).map((d) => [d.alert_id, d]));
  return json({
    alerts: (alerts ?? []).map((a) => {
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(a.output ?? "{}"); } catch { /* eski kayıt */ }
      return { id: a.id, userId: a.user_id, rule: a.action, projectTitle: a.project_title, data, createdAt: a.created_at, user: a.profiles, decision: byId.get(a.id) ?? null };
    }),
  });
});

const Body = z.object({
  alertId: z.number().int().positive(),
  decision: z.enum(["ok", "warn", "suspend"]),
  note: z.string().trim().max(2000).default(""),
  /** “Uyar” kararında kullanıcının bildirim kutusuna düşecek mesaj */
  message: z.string().trim().max(1000).default(""),
});

export const POST = route("admin.alerts.decide", async (req) => {
  const s = await requireAdmin();
  const b = await parseBody(req, Body);
  const db = adminClient();
  const { data: alert } = await db.from("activity_log").select("id, user_id").eq("id", b.alertId).eq("kind", "abuse_alert").maybeSingle();
  if (!alert) throw new ApiError(404, "Uyarı bulunamadı");
  const { error } = await db.from("abuse_decisions").upsert({ alert_id: alert.id, decision: b.decision, note: b.note, decided_by: s.user.id, decided_at: new Date().toISOString() });
  if (error) throw new ApiError(500, "Karar kaydedilemedi (migration 31 çalıştırıldı mı?)");
  if (b.decision === "warn") {
    await db.from("notifications").insert({ user_id: alert.user_id, kind: "admin_warning", data: b.message ? { message: b.message } : {} });
  }
  if (b.decision === "suspend") {
    const { error: e2 } = await db.from("profiles").update({ is_suspended: true }).eq("id", alert.user_id);
    if (e2) throw e2;
  }
  return json({ ok: true });
});
