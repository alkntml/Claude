import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { responsesToRows, toCsv, type Question } from "@/lib/surveys";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };

/** Cevapları projeye veri dosyası (CSV) olarak ekler; istatistik analizi ve grafik bu dosyayı kullanır. */
export const POST = route<Ctx>("survey.toProject", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ projectId: z.string().uuid(), reverse: z.boolean().default(true) }));
  await requireProject(s, b.projectId);
  const { data: sv } = await s.supabase.from("surveys").select("id, title, questions").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!sv) throw new ApiError(404, "Anket bulunamadı");
  const { data: rs } = await s.supabase.from("survey_responses").select("answers, created_at").eq("survey_id", id).eq("user_id", s.user.id).order("created_at").limit(20000);
  if (!rs?.length) throw new ApiError(422, "Henüz cevap yok");
  const rows = responsesToRows(sv.questions as Question[], rs, { reverse: b.reverse });
  const buf = Buffer.from(toCsv(rows), "utf8");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "upload", { bytes: buf.length });
  const date = new Date().toISOString().slice(0, 10);
  const name = `${sv.title.slice(0, 120)} – ${date}.csv`;
  const path = `${s.user.id}/${crypto.randomUUID()}-anket-${date}.csv`;
  const { error: upErr } = await s.supabase.storage.from("user-files").upload(path, buf, { contentType: "text/csv", upsert: false });
  if (upErr) throw upErr;
  const { data: file, error } = await s.supabase.from("files").insert({
    user_id: s.user.id, project_id: b.projectId, name, mime_type: "text/csv", size_bytes: buf.length, storage_path: path, purpose: "data",
    extraction_status: "done", extracted_text: rows.slice(0, 2000).map((r) => r.join("\t")).join("\n"), extraction_meta: { kind: "csv", rows: rows.length, delimiter: ";", survey_id: id, reversed: b.reverse },
  }).select("id, name, mime_type, size_bytes, purpose, project_id, extraction_status, extraction_meta, created_at").single();
  if (error) { await s.supabase.storage.from("user-files").remove([path]); throw error; }
  await recordUsage(s.user.id, "upload", { meta: { bytes: buf.length, kind: "csv", survey: id } });
  return json({ file, rows: rows.length - 1 }, 201);
});
