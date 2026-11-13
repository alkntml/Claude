import "server-only";
import { pick, type Locale } from "@/i18n/core";
import { translate } from "@/i18n";
import type { Session } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { buildRoadmap, type AcademicLevel, type GrantProgram, type Methodology, type WorkType } from "@/lib/workflows";
import { docToPlain, wordCount, type JSONNode } from "@/lib/editor/doc";
import type { ResearchPrefs } from "@/lib/research-prefs";
import { cleanSavedSections, insertStageRows, TEMPLATE_VERSION, type SavedSection } from "@/lib/structure-server";

/**
 * Çalışma oluşturma (yeni çalışma sihirbazı ve “Mevcut çalışmamı içe aktar” ortak yolu; D149).
 * Proje yalnızca sunucuda, kota kontrolünden sonra oluşturulur (D51). Aşamalar ya yol haritasından ya da
 * verilen listeden (içe aktarılan belgenin bölümleri) gelir.
 * structure: standard (şablon bölümler) · smart (kurgu modülü bölüm planını önerir; varsayılan davranış) · free (tek metin bölümü) · imported
 */
export type Structure = "standard" | "smart" | "free" | "imported";
export interface CreateInput {
  title: string; workType: WorkType; level: AcademicLevel; methodology: Methodology; discipline: string; language: "tr" | "en" | "de";
  citationStyle: string; topic: string; keywords: string[]; university?: string; targetJournal?: string; program?: GrantProgram;
  research?: ResearchPrefs; structure?: Structure;
  /** D171: araştırma deseni, alt tür (bitirme projesi türü) ve kullanıcı şablonu */
  design?: string | null; variant?: string | null; templateId?: string | null;
}
export interface StageSeed { key: string; title: string; description?: string; content?: JSONNode | null; requirement?: string; scope?: string; why?: string; critical?: boolean; hidden?: boolean; fromUser?: boolean }

export async function createProject(s: Session, body: CreateInput, uiLocale: Locale, stagesSource?: StageSeed[] | ((projectId: string) => Promise<StageSeed[]>), extraContext: Record<string, unknown> = {}) {
  const structure = body.structure ?? "smart";
  const { data: project, error } = await adminClient()
    .from("projects")
    .insert({
      user_id: s.user.id, title: body.title, work_type: body.workType, academic_level: body.level, discipline: body.discipline,
      language: body.language, citation_style: body.citationStyle, topic: body.topic, keywords: body.keywords,
      context: {
        methodology: body.methodology, university: body.university, targetJournal: body.targetJournal,
        ...(body.design ? { design: body.design } : {}), ...(body.variant ? { variant: body.variant } : {}),
        templateVersion: TEMPLATE_VERSION, ...(body.templateId ? { templateId: body.templateId } : {}),
        ...(body.workType === "grant_proposal" ? { program: body.program ?? "other" } : {}),
        ...(body.research ? { research: body.research } : {}),
        structure,
        ...extraContext,
      },
    })
    .select()
    .single();
  if (error || !project) throw error ?? new Error("Proje oluşturulamadı");

  // İçe aktarmada bölümler proje oluştuktan sonra hazırlanır (kaynaklar projeye eklenip atıflar bağlanmalı)
  let stagesOverride: StageSeed[] | undefined;
  try { stagesOverride = typeof stagesSource === "function" ? await stagesSource(project.id) : stagesSource; }
  catch (e) { await s.supabase.from("projects").delete().eq("id", project.id); throw e; }
  const roadmap = buildRoadmap({ workType: body.workType, level: body.level, methodology: body.methodology, program: body.program, design: body.design, variant: body.variant });
  // D171: kullanıcının kaydettiği şablon (yalnızca kendi şablonu; RLS)
  let saved: SavedSection[] = [];
  if (body.templateId && !stagesSource) {
    const { data: tpl } = await s.supabase.from("user_templates").select("sections").eq("id", body.templateId).eq("user_id", s.user.id).maybeSingle();
    saved = cleanSavedSections(tpl?.sections);
  }
  const refStage = roadmap.find((r) => r.key === "references");
  let seeds: StageSeed[];
  if (stagesOverride?.length) {
    seeds = [...stagesOverride];
    if (refStage && !seeds.some((x) => x.key === "references")) seeds.push({ key: "references", title: refStage.title, description: refStage.description });
  } else if (structure === "free") {
    seeds = [{ key: "custom_text", title: "Metin", description: "Çalışmanın metni; alt başlıkları kendiniz ekleyin." }, ...(refStage ? [{ key: "references", title: refStage.title, description: refStage.description }] : [])];
  } else if (saved.length) {
    seeds = saved.map((x) => ({ key: x.key, title: x.title, description: x.description, requirement: x.requirement, scope: x.scope, hidden: x.hidden, fromUser: true }));
    if (refStage && !seeds.some((x) => x.key === "references")) seeds.push({ key: "references", title: refStage.title, description: refStage.description });
  } else {
    seeds = roadmap.map((r) => ({ key: r.key, title: r.title, description: r.description, requirement: r.requirement, scope: r.scope, why: r.why, critical: r.critical }));
  }
  const used = new Set<string>();
  const rows = seeds.map((st, idx) => {
    let key = st.key;
    while (used.has(key)) key = `${st.key}_${idx}`;
    used.add(key);
    const content = st.content ?? null;
    const text = content ? docToPlain(content) : "";
    return {
      project_id: project.id, user_id: s.user.id, key, position: idx,
      // Şablon başlıkları arayüz diline çevrilir; içe aktarılan başlıklar olduğu gibi kalır
      title: stagesOverride?.length || st.fromUser ? st.title : translate(uiLocale, st.title),
      description: stagesOverride?.length || st.fromUser ? (st.description ?? "") : translate(uiLocale, st.description ?? ""),
      // D171: zorunluluk, kapsam, gerekçe ve kritiklik (gerekçe arayüz diline çevrilir)
      ...(st.requirement ? { requirement: st.requirement } : {}), ...(st.scope ? { scope: st.scope } : {}),
      ...(st.why ? { why: translate(uiLocale, st.why) } : {}), ...(st.critical ? { critical: true } : {}), ...(st.hidden ? { hidden: true } : {}),
      ...(content ? { content, content_text: text, word_count: wordCount(text), status: text.trim() ? "in_progress" : "not_started" } : {}),
    };
  });
  const { error: stErr } = await insertStageRows(s.supabase, rows);
  if (stErr) {
    await s.supabase.from("projects").delete().eq("id", project.id);
    throw stErr;
  }
  if (body.topic) {
    await s.supabase.from("project_memory").insert({ project_id: project.id, user_id: s.user.id, kind: "fact", content: `${pick({ tr: "Araştırma konusu", en: "Research topic", de: "Forschungsthema" }, uiLocale)}: ${body.topic}`, source: "user", pinned: true });
  }
  return project;
}
