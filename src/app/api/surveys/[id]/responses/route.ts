import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { codebook, responsesToRows, toCsv, type Question } from "@/lib/surveys";

type Ctx = { params: Promise<{ id: string }> };

function fileName(title: string, suffix: string) {
  return `${title.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "anket"}-${suffix}.csv`;
}

/** Cevaplar: json (özet ekranı), csv (analize hazır veri), codebook (değişken listesi) */
export const GET = route<Ctx>("survey.responses", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";
  const { data: sv } = await s.supabase.from("surveys").select("id, title, questions").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!sv) throw new ApiError(404, "Anket bulunamadı");
  const qs = sv.questions as Question[];
  if (format === "codebook") {
    return new Response(toCsv(codebook(qs)), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName(sv.title, "kod-kitabi")}"`, "Cache-Control": "no-store" } });
  }
  const { data: rs } = await s.supabase.from("survey_responses").select("id, answers, created_at, duration_seconds").eq("survey_id", id).eq("user_id", s.user.id).order("created_at").limit(20000);
  if (format === "csv") {
    const rows = responsesToRows(qs, rs ?? [], { reverse: url.searchParams.get("reverse") === "1", withTime: true });
    return new Response(toCsv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName(sv.title, "cevaplar")}"`, "Cache-Control": "no-store" } });
  }
  return json({ responses: rs ?? [] });
});

/** Tek cevabı (ör. deneme cevabı) veya tüm cevapları siler */
export const DELETE = route<Ctx>("survey.responses.delete", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const rid = new URL(req.url).searchParams.get("responseId");
  let q = s.supabase.from("survey_responses").delete().eq("survey_id", id).eq("user_id", s.user.id);
  if (rid) q = q.eq("id", rid);
  await q;
  const { count } = await s.supabase.from("survey_responses").select("id", { count: "exact", head: true }).eq("survey_id", id).eq("user_id", s.user.id);
  // Sayaç yalnızca sunucu tarafından güncellenir (kullanıcı tetikleyiciyle değiştiremez)
  const { adminClient } = await import("@/lib/supabase/admin");
  await adminClient().from("surveys").update({ response_count: count ?? 0 }).eq("id", id).eq("user_id", s.user.id);
  return json({ ok: true, count: count ?? 0 });
});
