import { assertDeleted, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = route<Ctx>("templates.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  assertDeleted(await s.supabase.from("user_templates").delete().eq("id", id).eq("user_id", s.user.id).select("id"), "Şablon bulunamadı");
  return json({ ok: true });
});
