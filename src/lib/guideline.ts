import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { ApiError } from "@/lib/api";
import { STYLE_IDS } from "@/lib/citations/styles";
import { effectiveFormat, type DocFormat } from "@/lib/export/format";
import { hasFeature } from "@/lib/features";
import { assertWithinLimits, recordUsage } from "@/lib/usage";
import { STAGE_LIBRARY } from "@/lib/workflows";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * D179: Yazım kılavuzu (üniversite/enstitü/dergi) — dosya yüklenince kendiliğinden tanınır ve analiz edilir.
 * Kılavuzda AÇIKÇA yazan biçim kuralları (kenar boşlukları, yazı tipi, punto, satır aralığı, girinti, paragraf aralığı,
 * hizalama, başlık biçimi, sayfa numarası, kapak, içindekiler) hemen uygulanır; yazmayanlar yazım stilinin varsayılanında
 * kalır (uydurulmaz). Bölüm yapısı önerisi kullanıcı onayıyla uygulanır (yapı sessizce değişmez, D171).
 */

const orNull = (t: Record<string, unknown>) => ({ anyOf: [t, { type: "null" }] });
const num = orNull({ type: "number" });
const bool = orNull({ type: "boolean" });
const str = orNull({ type: "string" });
export const GUIDE_SCHEMA = {
  type: "object", additionalProperties: false,
  required: ["format", "cover", "stages", "notes"],
  properties: {
    format: {
      type: "object", additionalProperties: false,
      required: ["fontFamily", "fontSizePt", "lineSpacing", "marginTopCm", "marginBottomCm", "marginLeftCm", "marginRightCm", "firstLineIndentCm", "paragraphAfterPt", "justify", "chapterOnNewPage", "chapterTitleUppercase", "chapterTitleCenter", "pageNumber", "citationStyle", "tableOfContents"],
      properties: {
        fontFamily: str, fontSizePt: num, lineSpacing: num,
        marginTopCm: num, marginBottomCm: num, marginLeftCm: num, marginRightCm: num,
        firstLineIndentCm: num, paragraphAfterPt: num, justify: bool,
        chapterOnNewPage: bool, chapterTitleUppercase: bool, chapterTitleCenter: bool,
        pageNumber: orNull({ type: "string", enum: ["bottom-center", "bottom-right", "top-right"] }),
        citationStyle: str, tableOfContents: bool,
      },
    },
    cover: {
      type: "object", additionalProperties: false,
      required: ["showTC", "logoSpace", "university", "faculty", "institute"],
      properties: { showTC: bool, logoSpace: bool, university: str, faculty: str, institute: str },
    },
    stages: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "libraryKey", "description"], properties: { title: { type: "string" }, libraryKey: { type: "string" }, description: { type: "string" } } } },
    notes: { type: "array", items: { type: "string" } },
  },
};

/** Dosya adı veya içerikten yazım kılavuzu olup olmadığı (kullanıcı “kılavuz” diye belirtmese de) */
export function looksLikeGuideline(name: string, text: string | null | undefined): boolean {
  if (/(k[ıi]lavuz|yaz[ıi]m\s*kural|tez\s*yaz|guideline|style\s*guide|author\s*guide|formatting\s*guide|leitfaden|richtlinie)/i.test(name)) return true;
  const head = (text ?? "").slice(0, 30000).toLocaleLowerCase("tr");
  const hits = ["kenar boşluğu", "satır aralığı", "punto", "yazı tipi", "sayfa numara", "iç kapak", "onay sayfası", "içindekiler", "margin", "line spacing", "font size", "page number"]
    .filter((k) => head.includes(k)).length;
  return hits >= 4;
}

/** Kılavuzdan çıkarılan kurallardan biçim yaması: yalnızca kılavuzda yazan alanlar uygulanır */
export function guideFormatPatch(project: any, g: any): { format: Partial<DocFormat>; fields: string[]; citationStyle?: string } {
  const base = effectiveFormat(project);
  const f = g?.format ?? {};
  const c = g?.cover ?? {};
  const fields: string[] = [];
  const out: any = { ...base, cover: { ...base.cover }, v: 2 };
  const set = (k: string, v: unknown, label: string, ok = (x: unknown) => x !== null && x !== undefined && x !== "") => { if (ok(v)) { out[k] = v; fields.push(label); } };
  const inRange = (min: number, max: number) => (x: unknown) => typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;
  set("fontFamily", f.fontFamily, "yazı tipi");
  set("fontSizePt", f.fontSizePt, "punto", inRange(8, 16));
  set("lineSpacing", f.lineSpacing, "satır aralığı", inRange(1, 3));
  const m = { top: f.marginTopCm, bottom: f.marginBottomCm, left: f.marginLeftCm, right: f.marginRightCm };
  if (Object.values(m).some((x) => inRange(1, 6)(x))) {
    out.margins = { top: inRange(1, 6)(m.top) ? m.top : base.margins.top, bottom: inRange(1, 6)(m.bottom) ? m.bottom : base.margins.bottom, left: inRange(1, 6)(m.left) ? m.left : base.margins.left, right: inRange(1, 6)(m.right) ? m.right : base.margins.right };
    fields.push("kenar boşlukları");
  }
  set("firstLineIndentCm", f.firstLineIndentCm, "paragraf girintisi", inRange(0, 3));
  set("paragraphAfterPt", f.paragraphAfterPt, "paragraf aralığı", inRange(0, 24));
  set("justify", f.justify, "hizalama", (x) => typeof x === "boolean");
  set("chapterOnNewPage", f.chapterOnNewPage, "bölümlerin yeni sayfada başlaması", (x) => typeof x === "boolean");
  set("chapterTitleUppercase", f.chapterTitleUppercase, "başlık büyük harf", (x) => typeof x === "boolean");
  set("chapterTitleCenter", f.chapterTitleCenter, "başlık hizası", (x) => typeof x === "boolean");
  set("pageNumber", f.pageNumber, "sayfa numarası yeri", (x) => ["bottom-center", "bottom-right", "top-right"].includes(String(x)));
  if (f.tableOfContents === true) { out.layout = "submission"; fields.push("kapak ve içindekiler"); }
  if (typeof c.showTC === "boolean") { out.cover.showTC = c.showTC; fields.push("T.C. satırı"); }
  if (typeof c.logoSpace === "boolean") { out.cover.logoSpace = c.logoSpace; fields.push("logo yeri"); }
  for (const k of ["university", "faculty", "institute"] as const) if (c[k] && !base.cover[k]) { out.cover[k] = String(c[k]).slice(0, 200); fields.push(k === "university" ? "üniversite adı" : k === "faculty" ? "fakülte adı" : "enstitü adı"); }
  const style = typeof f.citationStyle === "string" && (STYLE_IDS as string[]).includes(f.citationStyle) ? f.citationStyle : undefined;
  if (style) fields.push("atıf stili");
  return { format: out, fields, citationStyle: style };
}

/**
 * Kılavuzu analiz eder ve biçimi uygular. Yapı önerisi proje bağlamında saklanır (kullanıcı onaylar).
 * Paket kılavuz özelliğini içermiyorsa veya hak dolmuşsa { skipped } döner (kılavuz metni yapay zekâ bağlamında yine kullanılır).
 */
export async function runGuidelineAnalysis(db: SupabaseClient, p: { userId: string; planId: string; projectId: string; ownerId: string }): Promise<{ skipped?: "feature" | "limit" | "no_text" | "ai"; fields?: string[]; suggestion?: any }> {
  if (!hasFeature(p.planId, "guideline")) return { skipped: "feature" };
  const { data: project } = await db.from("projects").select("*").eq("id", p.projectId).eq("user_id", p.ownerId).single();
  if (!project?.guideline_file_id) return { skipped: "no_text" };
  const { data: file } = await db.from("files").select("name, extracted_text").eq("id", project.guideline_file_id).eq("user_id", p.ownerId).maybeSingle();
  if (!file?.extracted_text) return { skipped: "no_text" };
  try { await assertWithinLimits(p.userId, p.planId, "ai_request"); } catch { return { skipped: "limit" }; }
  const model = await resolveModel(p.planId, "balanced");
  if (!isProviderConfigured(model.provider)) return { skipped: "ai" };
  const keys = Object.keys(STAGE_LIBRARY).join(", ");
  const res = await complete(model, {
    system: `Üniversite, enstitü ve dergi yazım kılavuzlarını analiz eden bir uzmansın. Kılavuzda AÇIKÇA yazan biçim kurallarını çıkar: yazı tipi, punto, satır aralığı (1, 1.15, 1.5, 2 gibi sayı), kenar boşlukları (cm; inç verilmişse cm’ye çevir), ilk satır girintisi (cm), paragraf sonrası boşluk (pt), iki yana yaslama, ana bölümlerin yeni sayfada başlaması, bölüm başlıklarının büyük harf ve ortalı olup olmadığı, sayfa numarasının yeri, atıf stili (${STYLE_IDS.join(", ")}), içindekiler/kapak isteniyor mu, kapakta T.C. ve logo olup olmadığı ve kurum adları. Kılavuzda YAZMAYAN her alan için null ver; tahmin etme, varsayılan uydurma. Zorunlu bölüm sırasını çıkar ve her bölüm için kütüphane anahtarı seç (${keys}); uygun yoksa "custom". Notlara, uygulanamayan ama önemli kuralları (ör. özet kelime sınırı, kaynakça biçimi ayrıntıları) kısa maddeler hâlinde yaz.`,
    messages: [{ role: "user", content: `Çalışma türü: ${project.work_type}\n\nKILAVUZ (${file.name}):\n${String(file.extracted_text).slice(0, 120000)}` }],
    maxTokens: 6000, effort: "medium", jsonSchema: GUIDE_SCHEMA,
  });
  await recordUsage(p.userId, "ai_request", { usage: res.usage, costUsd: await estimateCost(res.model, res.usage.input, res.usage.output, res.usage), provider: model.provider, model: res.model, meta: { action: "guideline" } });
  let g: any;
  try { g = JSON.parse(res.text); } catch { throw new ApiError(502, "Kılavuz analizi okunamadı, lütfen tekrar deneyin"); }
  const patch = guideFormatPatch(project, g);
  const stages = (g.stages ?? []).slice(0, 40).map((x: any) => ({ title: String(x.title ?? "").slice(0, 200), libraryKey: STAGE_LIBRARY[x.libraryKey] ? x.libraryKey : "custom", description: String(x.description ?? "").slice(0, 600) }));
  const guide = { fileId: project.guideline_file_id, fileName: file.name, appliedAt: new Date().toISOString(), fields: patch.fields, notes: (g.notes ?? []).map(String).slice(0, 12), stages, seen: false };
  await db.from("projects").update({ context: { ...(project.context ?? {}), format: patch.format, guide }, ...(patch.citationStyle ? { citation_style: patch.citationStyle } : {}) }).eq("id", p.projectId).eq("user_id", p.ownerId);
  return { fields: patch.fields, suggestion: { stages, notes: guide.notes, formatting: { fontFamily: patch.format.fontFamily, fontSizePt: patch.format.fontSizePt, lineSpacing: patch.format.lineSpacing, citationStyle: patch.citationStyle ?? project.citation_style } } };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
