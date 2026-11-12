import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { localeFromRequest } from "@/i18n/server";
import { makeT } from "@/i18n";
import { checkMagic } from "@/lib/files/extract";
import { addReferenceLines } from "@/lib/import/server";
import { splitReferences } from "@/lib/import/references";
import { analyzeWork, buildSeeds, documentNodes, type WorkKind } from "@/lib/import/work";
import { sectionText } from "@/lib/import/whole";
import { headings as docHeadings } from "@/lib/editor/doc";
import { createProject } from "@/lib/project-create";
import { assertCanCreateProject } from "@/lib/single-project";
import { assertProjectQuota, assertWithinLimits, recordUsage } from "@/lib/usage";
import { DEFAULT_RESEARCH_PREFS } from "@/lib/research-prefs";
import type { AcademicLevel, Methodology, WorkType } from "@/lib/workflows";

export const maxDuration = 300;
const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Mevcut çalışmamı içe aktar (D149): Word/PDF/metin → yapay zekâ künyeyi çıkarır → yeni çalışma oluşturulur,
 * kaynakça doğrulanıp eklenir, atıflar bağlanır, metin en üst düzey başlıklara göre bölümlere ayrılır. Metin yeniden yazılmaz.
 */
export const POST = route("projects.import", async (req) => {
  const s = await requireUser();
  const locale = localeFromRequest(req);
  const T = makeT(locale);
  await assertCanCreateProject(s);
  await assertProjectQuota(s.user.id, s.profile.plan_id);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new ApiError(422, "Dosya gerekli");
  if (file.size > MAX_BYTES) throw new ApiError(413, "Dosya 25 MB sınırını aşıyor");
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const kind: WorkKind | null = ext === "docx" ? "docx" : ext === "pdf" ? "pdf" : ext === "txt" || ext === "md" ? "txt" : null;
  if (!kind) throw new ApiError(422, "Word (.docx), PDF veya metin (.txt) dosyası yükleyin");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!checkMagic(kind, buffer)) throw new ApiError(422, "Dosya içeriği uzantısıyla uyuşmuyor");

  const { nodes, images } = await documentNodes(kind, buffer);
  const { body, refs } = splitReferences(nodes);
  const all = sectionText(body);
  if (all.words < 80) throw new ApiError(422, "Belgede içe aktarılacak yeterli metin bulunamadı (taranmış PDF olabilir; Word dosyası deneyin)");
  const heads = docHeadings({ type: "doc", content: body }).map((h) => h.text).filter(Boolean);
  const analysis = await analyzeWork(s.profile.plan_id, all.text, heads);
  await recordUsage(s.user.id, "ai_request", { usage: analysis.usage, costUsd: analysis.cost, provider: analysis.provider, model: analysis.model, meta: { action: "import_analyze" } });
  const m = analysis.meta;

  let report = { sections: 0, words: all.words, refsTotal: 0, refsAdded: 0, linked: 0, unmatched: [] as string[], unverified: [] as string[], images };
  const project = await createProject(s, {
    title: m.title || file.name.replace(/\.[a-z]+$/i, ""), workType: m.workType as WorkType, level: m.level as AcademicLevel, methodology: m.methodology as Methodology,
    discipline: m.discipline, language: m.language, citationStyle: m.citationStyle, topic: m.topic, keywords: m.keywords,
    research: DEFAULT_RESEARCH_PREFS, structure: "imported",
  }, locale, async (projectId) => {
    const r = await addReferenceLines(s.supabase, projectId, s.user.id, refs);
    const built = buildSeeds(body, r.keys, T("Ön metin"));
    report = { ...report, sections: built.seeds.length, refsTotal: r.total, refsAdded: r.added.length, linked: built.linked, unmatched: built.unmatched, unverified: r.unverified };
    return built.seeds;
  }, { titleChosen: true, imported: { file: file.name.slice(0, 200), at: new Date().toISOString(), words: all.words } });
  await recordUsage(s.user.id, "upload", { meta: { kind: "import_work", bytes: file.size, words: all.words, refs: report.refsTotal } });
  return json({ project, meta: m, report }, 201);
});
