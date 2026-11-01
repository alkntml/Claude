import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";

const SELECT = "id, title, project_id, is_open, response_count, closes_at, max_responses, created_at, updated_at";

export const GET = route("surveys.list", async () => {
  const s = await requireUser();
  const { data } = await s.supabase.from("surveys").select(SELECT).eq("user_id", s.user.id).order("updated_at", { ascending: false });
  return json({ surveys: data ?? [] });
});

/** Yeni anket (boş veya mevcut bir anketin kopyası) */
export const POST = route("surveys.create", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, z.object({ title: z.string().trim().min(1).max(300), projectId: z.string().uuid().nullable().optional(), copyFrom: z.string().uuid().optional() }));
  if (b.projectId) await requireProject(s, b.projectId);
  let base: { description: string; consent: string; questions: unknown } = { description: "", consent: "", questions: [] };
  if (b.copyFrom) {
    const { data: src } = await s.supabase.from("surveys").select("description, consent, questions").eq("id", b.copyFrom).eq("user_id", s.user.id).maybeSingle();
    if (!src) throw new ApiError(404, "Anket bulunamadı");
    base = src;
  }
  const { data, error } = await s.supabase.from("surveys").insert({ user_id: s.user.id, project_id: b.projectId ?? null, title: b.title, ...base }).select(SELECT).single();
  if (error) throw error;
  return json({ survey: data }, 201);
});
