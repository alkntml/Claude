import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { checkMagic } from "@/lib/files/extract";
import { importDocx } from "@/lib/import/server";
import { recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const MAX_BYTES = 15 * 1024 * 1024;

/**
 * Word belgesini çalışmaya aktarır (D87): metin, başlıklar ve tablolar düğümlere çevrilir, kaynakça doğrulanıp
 * projeye eklenir, metin içi atıflar bağlanır. Belgeyi editöre yerleştirmek ve kaydetmek istemcinin işidir
 * (açık editörle çakışma olmasın); bu uç yalnızca düğümleri ve eklenen kaynakları döndürür.
 */
export const POST = route<Ctx>("project.import_doc", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: project } = await s.supabase.from("projects").select("id").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!project) throw new ApiError(404, "Proje bulunamadı");
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new ApiError(422, "Dosya gerekli");
  if (file.size > MAX_BYTES) throw new ApiError(413, "Dosya 15 MB sınırını aşıyor");
  if (!/\.docx$/i.test(file.name)) throw new ApiError(422, "Yalnızca Word (.docx) belgeleri içe aktarılabilir");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!checkMagic("docx", buffer)) throw new ApiError(422, "Dosya geçerli bir Word belgesi değil");
  const base = Math.min(4, Math.max(2, Number(form?.get("base")) || 2));
  const max = Math.min(4, Math.max(base, Number(form?.get("max")) || 4));
  const dropTitle = String(form?.get("dropTitle") ?? "").slice(0, 300) || null;
  const out = await importDocx(s.supabase, { projectId: id, userId: s.user.id, buffer, base, max, dropTitle });
  if (!out.nodes.length) throw new ApiError(422, "Belgede aktarılacak metin bulunamadı");
  await recordUsage(s.user.id, "upload", { meta: { kind: "import_doc", bytes: file.size, refs: out.report.refsTotal, linked: out.report.linked } });
  return json(out);
});
