import { ApiError, json, route } from "@/lib/api";
import { assertSingleProject } from "@/lib/single-project";
import { requireUser } from "@/lib/auth";
import { isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { checkMagic, extract, kindOf } from "@/lib/files/extract";
import { learnFromDocument } from "@/lib/memory-learn";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const MAX_BYTES = 15 * 1024 * 1024;
/** Modele gönderilen en fazla metin (yaklaşık 15 bin token); daha uzun belgelerin başı okunur */
const MAX_CHARS = 60_000;

/** Hafızaya belgeden öğren (D88): belge okunur, çalışma için önemli bilgiler hafıza kaydı olarak eklenir. */
export const POST = route<Ctx>("memory.learn", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: project } = await s.supabase.from("projects").select("id, title, topic, language").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!project) throw new ApiError(404, "Proje bulunamadı");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  await assertSingleProject(s, id);
  const model = await resolveModel(s.profile.plan_id, "balanced");
  if (!isProviderConfigured(model.provider)) throw new ApiError(503, "Yapay zekâ sağlayıcısı yapılandırılmamış", "ai_not_configured");

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new ApiError(422, "Dosya gerekli");
  if (file.size > MAX_BYTES) throw new ApiError(413, "Dosya 15 MB sınırını aşıyor");
  const kind = kindOf(file.type, file.name);
  if (kind !== "pdf" && kind !== "docx" && kind !== "txt") throw new ApiError(422, "PDF, Word (.docx) veya metin dosyası yükleyin");
  const buf = Buffer.from(await file.arrayBuffer());
  if (!checkMagic(kind, buf)) throw new ApiError(422, "Dosya türü uzantısıyla uyuşmuyor");
  const { text } = await extract(kind, buf);
  const clean = text.replace(/\n{3,}/g, "\n\n").trim();
  if (clean.length < 50) throw new ApiError(422, "Belgeden okunabilir metin çıkarılamadı (taranmış PDF olabilir)");

  const { data: mem } = await s.supabase.from("project_memory").select("content").eq("project_id", id);
  const r = await learnFromDocument({ planId: s.profile.plan_id, fileName: file.name, text: clean.slice(0, MAX_CHARS), project, existing: (mem ?? []).map((m) => m.content as string) });
  await recordUsage(s.user.id, "ai_request", { usage: r.usage, costUsd: r.cost, provider: r.provider, model: r.model, meta: { action: "memory_learn", projectId: id } });
  if (!r.items.length) return json({ items: [], truncated: clean.length > MAX_CHARS });
  const { data, error } = await s.supabase.from("project_memory").insert(r.items.map((x) => ({ project_id: id, user_id: s.user.id, kind: x.kind, content: x.content, source: "ai" }))).select();
  if (error) throw error;
  return json({ items: data ?? [], truncated: clean.length > MAX_CHARS });
});
