import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { localeFromRequest } from "@/i18n/server";
import { extract, kindOf } from "@/lib/files/extract";
import { runAnalysis, type AnalysisSpec } from "@/lib/stats/apa";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

const Col = z.string().min(1).max(200);
const Spec = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("describe"), vars: z.array(Col).min(1).max(30) }),
  z.object({ kind: z.literal("ttest_ind"), dv: Col, group: Col, levels: z.tuple([Col, Col]).optional() }),
  z.object({ kind: z.literal("ttest_paired"), a: Col, b: Col }),
  z.object({ kind: z.literal("ttest_one"), dv: Col, mu: z.number().finite() }),
  z.object({ kind: z.literal("anova"), dv: Col, group: Col }),
  z.object({ kind: z.literal("mannwhitney"), dv: Col, group: Col, levels: z.tuple([Col, Col]).optional() }),
  z.object({ kind: z.literal("kruskal"), dv: Col, group: Col }),
  z.object({ kind: z.literal("correlation"), vars: z.array(Col).min(2).max(15), method: z.enum(["pearson", "spearman"]) }),
  z.object({ kind: z.literal("regression"), dv: Col, ivs: z.array(Col).min(1).max(15) }),
  z.object({ kind: z.literal("chisquare"), a: Col, b: Col }),
  z.object({ kind: z.literal("alpha"), items: z.array(Col).min(2).max(100), scale: z.string().max(200).optional() }),
]);

/** Yüklenen veri dosyasında istatistik analizi (deterministik) ve APA raporu */
export const POST = route<Ctx>("file.analyze", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "stats");
  const { id } = await params;
  const b = await parseBody(req, z.object({ spec: Spec, language: z.enum(["tr", "en", "de"]).optional() }));
  const { data: f } = await s.supabase.from("files").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!f) throw new ApiError(404, "Dosya bulunamadı");
  const kind = kindOf(f.mime_type, f.name);
  if (kind !== "csv" && kind !== "xlsx") throw new ApiError(422, "Yalnızca CSV ve XLSX dosyaları analiz edilebilir");
  const { data: blob, error } = await s.supabase.storage.from("user-files").download(f.storage_path);
  if (error || !blob) throw new ApiError(500, "Dosya okunamadı");
  const ex = await extract(kind, Buffer.from(await blob.arrayBuffer()));
  try {
    const report = runAnalysis(ex.rows ?? [], b.spec as AnalysisSpec, b.language ?? localeFromRequest(req));
    return json({ report });
  } catch (e) {
    throw new ApiError(422, e instanceof Error ? e.message : "Analiz yapılamadı");
  }
});
