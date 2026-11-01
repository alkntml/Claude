import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CitationEngine, type CitationItem, type CitationStyleId, type CiteLocale } from "@/lib/citations";
import { citedIdsInOrder, type JSONNode } from "@/lib/editor/doc";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function sourceRowToItem(r: any): CitationItem {
  return {
    id: r.id,
    type: r.type ?? "article-journal",
    title: r.title ?? "",
    authors: Array.isArray(r.authors) ? r.authors : [],
    editors: Array.isArray(r.verification?.editors) ? r.verification.editors : undefined,
    year: r.year,
    month: r.month,
    containerTitle: r.container_title,
    volume: r.volume,
    issue: r.issue,
    pages: r.pages,
    publisher: r.publisher,
    publisherPlace: r.publisher_place,
    edition: r.edition,
    doi: r.doi,
    url: r.url,
    isbn: r.isbn,
    pmid: r.pmid,
    arxivId: r.arxiv_id,
    institution: r.type === "thesis" ? r.publisher : null,
  };
}

export interface ProjectBundle {
  project: any;
  stages: any[];
  sources: any[];
  memory: any[];
}

export async function loadProjectBundle(db: SupabaseClient, projectId: string, userId: string): Promise<ProjectBundle | null> {
  const { data: project } = await db.from("projects").select("*").eq("id", projectId).eq("user_id", userId).maybeSingle();
  if (!project) return null;
  const [stages, sources, memory] = await Promise.all([
    db.from("project_stages").select("*").eq("project_id", projectId).order("position"),
    db.from("sources").select("*").eq("project_id", projectId).order("created_at"),
    db.from("project_memory").select("*").eq("project_id", projectId).order("created_at"),
  ]);
  return { project, stages: stages.data ?? [], sources: sources.data ?? [], memory: memory.data ?? [] };
}

export function engineFor(project: any, stages: any[], sources: any[]): CitationEngine {
  const order = citedIdsInOrder(stages.map((s) => s.content as JSONNode));
  return new CitationEngine(project.citation_style as CitationStyleId, sources.map(sourceRowToItem), {
    locale: (project.language === "en" ? "en" : "tr") as CiteLocale,
    citedOrder: order,
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
