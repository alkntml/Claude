import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { providerConfig } from "@/lib/env";
import { verifySource } from "@/lib/sources/verify";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>("source.verify", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: src } = await s.supabase.from("sources").select("id, title, doi, pmid, arxiv_id, verification").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!src) throw new ApiError(404, "Kaynak bulunamadı");
  const v = await verifySource({ title: src.title, doi: src.doi, pmid: src.pmid, arxivId: src.arxiv_id }, providerConfig());
  const { record, ...meta } = v;
  const { data } = await s.supabase.from("sources").update({ verified: v.status === "verified", verification: { ...(src.verification ?? {}), ...meta } }).eq("id", id).select().single();
  return json({ source: data, verification: meta, authorityRecord: record ?? null });
});
