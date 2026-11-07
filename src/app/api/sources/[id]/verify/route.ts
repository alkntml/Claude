import { json, route } from "@/lib/api";
import { childAccess } from "@/lib/project-access";
import { requireUser } from "@/lib/auth";
import { providerConfig } from "@/lib/env";
import { verifySource } from "@/lib/sources/verify";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>("source.verify", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row: src, access } = await childAccess(s, "sources", id, "edit", "id, title, doi, pmid, arxiv_id, verification");
  const v = await verifySource({ title: src.title, doi: src.doi, pmid: src.pmid, arxivId: src.arxiv_id }, providerConfig());
  const { record, ...meta } = v;
  const { data } = await access.db.from("sources").update({ verified: v.status === "verified", verification: { ...(src.verification ?? {}), ...meta } }).eq("id", id).eq("user_id", access.ownerId).select().single();
  return json({ source: data, verification: meta, authorityRecord: record ?? null });
});
