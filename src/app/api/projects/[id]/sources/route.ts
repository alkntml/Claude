import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { normalizeDoi } from "@/lib/citations";
import { SourceInput, toRow } from "@/lib/sources/input";
import { providerConfig } from "@/lib/env";
import { verifySource } from "@/lib/sources/verify";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("project.sources.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { data } = await s.supabase.from("sources").select("*").eq("project_id", id).order("created_at");
  return json({ sources: data ?? [] });
});

/** Kaynak(lar) ekler ve tanımlayıcısı olanları otomatik doğrular. */
export const POST = route<Ctx>("project.sources.add", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { sources } = await parseBody(req, z.object({ sources: z.array(SourceInput).min(1).max(30) }));
  const { data: existing } = await s.supabase.from("sources").select("doi").eq("project_id", id).not("doi", "is", null);
  const have = new Set((existing ?? []).map((x) => x.doi));
  const cfg = providerConfig();

  const rows = await Promise.all(
    sources.filter((b) => {
      // Hem projede var olan hem de aynı istek içinde tekrarlanan DOI'leri ayıkla
      const d = normalizeDoi(b.doi);
      if (!d) return true;
      if (have.has(d)) return false;
      have.add(d);
      return true;
    }).map(async (b) => {
      const row = toRow(b);
      const v = await verifySource({ title: row.title, doi: row.doi, pmid: row.pmid, arxivId: row.arxiv_id }, cfg);
      const filled: Record<string, unknown> = {};
      // Doğrulanmış kayıttan eksik künye alanlarını tamamla
      if (v.status === "verified" && v.record) {
        const r = v.record;
        if (!row.container_title && r.containerTitle) filled.container_title = r.containerTitle;
        if (!row.volume && r.volume) filled.volume = r.volume;
        if (!row.issue && r.issue) filled.issue = r.issue;
        if (!row.pages && r.pages) filled.pages = r.pages;
        if (!row.publisher && r.publisher) filled.publisher = r.publisher;
        if (!row.year && r.year) filled.year = r.year;
        if (!row.authors.length && r.authors.length) filled.authors = r.authors;
      }
      const { record: _omit, ...vMeta } = v;
      void _omit;
      return { ...row, ...filled, project_id: id, user_id: s.user.id, verified: v.status === "verified", verification: { ...("verification" in row ? row.verification : {}), ...vMeta } };
    }),
  );
  if (!rows.length) return json({ sources: [], skipped: sources.length });
  const { data, error } = await s.supabase.from("sources").insert(rows).select();
  if (error) throw error;
  return json({ sources: data, skipped: sources.length - rows.length }, 201);
});
