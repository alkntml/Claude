import { ApiError, assertDeleted, json, route } from "@/lib/api";
import { cleanSavedSections } from "@/lib/structure-server";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = route<Ctx>("templates.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  assertDeleted(await s.supabase.from("user_templates").delete().eq("id", id).eq("user_id", s.user.id).select("id"), "Şablon bulunamadı");
  return json({ ok: true });
});

/** D172: şablonu dosya olarak dışa aktarma (yalnızca sahibi; metin içermez) */
export const GET = route<Ctx>("templates.get", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data } = await s.supabase.from("user_templates").select("name, work_type, methodology, template_version, sections").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!data) throw new ApiError(404, "Şablon bulunamadı");
  return json({ format: "academiana-template", version: 1, template: { ...data, sections: cleanSavedSections(data.sections) } });
});
