import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { assertFeature } from "@/lib/usage";
import { addSourcesToProject } from "@/lib/research";
import { SourceInput } from "@/lib/sources/input";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const TYPES = new Set(["article-journal", "book", "chapter", "paper-conference", "thesis", "report", "webpage", "preprint", "dataset", "other"]);
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Derlemeye dahil edilen çalışmaları çalışmanın kaynaklarına ekler (D122); doğrulama ve tam metin okuma normal akışla yapılır. */
export const POST = route<Ctx>("review.include", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ ids: z.array(z.string().uuid()).min(1).max(30) }));
  const { data: recs } = await acc.db.from("review_records").select("id, record, source_id").eq("project_id", id).eq("user_id", acc.ownerId).eq("stage", "included").in("id", b.ids);
  const todo = (recs ?? []).filter((r: any) => !r.source_id);
  if (!todo.length) return json({ sources: [], skipped: 0 });
  const inputs = todo.map((r: any) => SourceInput.safeParse({
    type: TYPES.has(r.record.type) ? r.record.type : r.record.type ? "other" : "article-journal", title: r.record.title, authors: r.record.authors ?? [], year: r.record.year ?? null,
    containerTitle: r.record.containerTitle ?? null, doi: r.record.doi ?? null, url: /^https?:\/\//.test(r.record.url ?? "") ? r.record.url : null, abstract: r.record.abstract ?? null,
    volume: r.record.volume ?? null, issue: r.record.issue ?? null, pages: r.record.pages ?? null, publisher: r.record.publisher ?? null,
    pmid: r.record.pmid ?? null, arxivId: r.record.arxivId ?? null, isbn: r.record.isbn ?? null, origins: ["manual"],
  }));
  const valid = inputs.map((x, i) => (x.success ? { input: x.data, rec: todo[i] } : null)).filter(Boolean) as { input: any; rec: any }[];
  const result = await addSourcesToProject(acc.db, id, acc.ownerId, valid.map((v) => v.input));
  // Eklenen kaynakları kayıtlarla eşleştir (DOI veya başlık)
  const norm = (x: string) => x.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  for (const v of valid) {
    const src = result.sources.find((x: any) => (v.input.doi && x.doi && x.doi.toLowerCase() === String(v.input.doi).toLowerCase()) || norm(x.title) === norm(v.input.title));
    if (src) await acc.db.from("review_records").update({ source_id: src.id }).eq("id", v.rec.id).eq("project_id", id).eq("user_id", acc.ownerId);
  }
  return json({ sources: result.sources, skipped: result.skipped ?? 0 });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
