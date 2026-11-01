import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { normalizeDoi } from "@/lib/citations";
import { providerConfig } from "@/lib/env";
import { verifySource } from "@/lib/sources/verify";

/** DOI / PMID / arXiv kimliğinden künye getirir (kaynak elle eklenirken). */
export const GET = route("sources.lookup", async (req) => {
  await requireUser();
  const url = new URL(req.url);
  const id = (url.searchParams.get("id") ?? "").trim();
  if (!id || id.length > 300) throw new ApiError(422, "Tanımlayıcı gerekli");
  const doi = normalizeDoi(id);
  const pmid = !doi && /^\d{4,10}$/.test(id) ? id : null;
  const arxivId = !doi && !pmid && /^(\d{4}\.\d{4,5}|[a-z-]+\/\d{7})(v\d+)?$/i.test(id.replace(/^arxiv:/i, "")) ? id.replace(/^arxiv:/i, "") : null;
  if (!doi && !pmid && !arxivId) throw new ApiError(422, "Geçerli bir DOI, PMID veya arXiv kimliği girin");
  // Başlık bilinmediği için önce kaydı getir; benzerlik kontrolü kaydın kendisiyle yapılır
  const v = await verifySource({ title: "", doi, pmid, arxivId }, providerConfig());
  if (!v.record) throw new ApiError(404, v.message ?? "Kayıt bulunamadı");
  return json({ record: { ...v.record, origins: [v.authority ?? "manual"] }, authority: v.authority });
});
