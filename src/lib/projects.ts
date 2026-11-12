import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CitationEngine, type CitationStyleId, type CiteLocale } from "@/lib/citations";
import { citedIdsInOrder, type JSONNode } from "@/lib/editor/doc";

/* eslint-disable @typescript-eslint/no-explicit-any */
export { sourceRowToItemClient as sourceRowToItem } from "@/lib/sources/row";
import { sourceRowToItemClient as sourceRowToItem } from "@/lib/sources/row";
import { writingLang } from "@/lib/writing-lang";

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
    locale: writingLang(project.language) as CiteLocale,
    citedOrder: order,
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
