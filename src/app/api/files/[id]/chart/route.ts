import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { localeFromRequest } from "@/i18n/server";
import { extract, kindOf } from "@/lib/files/extract";
import { buildChart, type ChartSpec } from "@/lib/stats/charts";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

const Col = z.string().min(1).max(200);
const Err = z.enum(["ci95", "se", "sd", "none"]);
const Spec = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("bar_means"), dv: Col, group: Col, error: Err }),
  z.object({ kind: z.literal("bar_freq"), variable: Col, percent: z.boolean() }),
  z.object({ kind: z.literal("line_means"), vars: z.array(Col).min(2).max(12), group: Col.optional(), error: Err }),
  z.object({ kind: z.literal("histogram"), variable: Col, bins: z.number().int().min(3).max(40).optional() }),
  z.object({ kind: z.literal("scatter"), x: Col, y: Col, fit: z.boolean() }),
  z.object({ kind: z.literal("box"), dv: Col, group: Col.optional() }),
]);

/** Veri dosyasından grafik verisi (deterministik). Çizim istemcide yapılır. */
export const POST = route<Ctx>("file.chart", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "stats");
  const { id } = await params;
  const b = await parseBody(req, z.object({ spec: Spec, language: z.enum(["tr", "en"]).optional() }));
  const { data: f } = await s.supabase.from("files").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!f) throw new ApiError(404, "Dosya bulunamadı");
  const kind = kindOf(f.mime_type, f.name);
  if (kind !== "csv" && kind !== "xlsx") throw new ApiError(422, "Yalnızca CSV ve XLSX dosyalarından grafik çizilebilir");
  const { data: blob, error } = await s.supabase.storage.from("user-files").download(f.storage_path);
  if (error || !blob) throw new ApiError(500, "Dosya okunamadı");
  const ex = await extract(kind, Buffer.from(await blob.arrayBuffer()));
  try {
    return json({ chart: buildChart(ex.rows ?? [], b.spec as ChartSpec, b.language ?? localeFromRequest(req)) });
  } catch (e) {
    throw new ApiError(422, e instanceof Error ? e.message : "Grafik oluşturulamadı");
  }
});
