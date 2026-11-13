import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Yönetim → KVKK talepleri: bekleyen ve son veri talepleri, hesap silmeler (D155: ücretli indirme hakkı kaldırıldı) */
export const GET = route("admin.locks", async () => {
  await requireAdmin();
  const db = adminClient();
  const [requests, recent] = await Promise.all([
    db.from("data_requests").select("id, user_id, kind, status, created_at").eq("status", "pending").order("created_at").limit(100),
    // D154: tamamlanan veri talepleri ve hesap silmeler (silinen hesapta kişi bağı yoktur: user_id = null)
    db.from("data_requests").select("id, user_id, kind, status, created_at, completed_at").neq("status", "pending").order("created_at", { ascending: false }).limit(50),
  ]);
  const userIds = [...new Set([...(requests.data ?? []), ...(recent.data ?? [])].map((r) => r.user_id).filter(Boolean))];
  const { data: users } = userIds.length ? await db.from("profiles").select("id, email").in("id", userIds) : { data: [] as { id: string; email: string }[] };
  const email = Object.fromEntries((users ?? []).map((u) => [u.id, u.email]));
  return json({
    requests: (requests.data ?? []).map((r) => ({ ...r, email: r.user_id ? email[r.user_id] ?? null : null })),
    recent: (recent.data ?? []).map((r) => ({ ...r, email: r.user_id ? email[r.user_id] ?? null : null })),
  });
});

/** KVKK talebini tamamlandı olarak işaretler */
export const PATCH = route("admin.locks.request", async (req) => {
  await requireAdmin();
  const b = await parseBody(req, z.object({ requestId: z.string().uuid(), status: z.enum(["completed", "rejected"]).default("completed") }));
  const { error } = await adminClient().from("data_requests").update({ status: b.status, completed_at: new Date().toISOString() }).eq("id", b.requestId);
  if (error) throw error;
  return json({ ok: true });
});
