import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreRecord } from "@/lib/sources/aggregate";
import type { SourceRecord } from "@/lib/sources/types";
import { collectCitations, headings, type JSONNode } from "@/lib/editor/doc";
import { analyzeRepetition, avoidListForPrompt } from "@/lib/quality/repetition";
import { stageDef, METHODOLOGY_LABELS, LEVEL_LABELS, type Methodology, type AcademicLevel } from "@/lib/workflows";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ACCESS_TR = { metadata: "yalnızca künye", abstract: "özet okundu", full_text: "tam metin okundu" } as const;

export interface BuiltContext {
  text: string;
  /** Kısa kimlik (S1) -> kaynak uuid */
  sourceMap: Record<string, string>;
  usedChunks: number;
}

function authorShort(authors: any[]): string {
  const fam = (authors ?? []).map((a) => a.literal ?? a.family ?? "").filter(Boolean);
  if (!fam.length) return "Yazar yok";
  return fam.length > 2 ? `${fam[0]} vd.` : fam.join(" & ");
}

export async function buildContext(params: {
  db: SupabaseClient;
  project: any;
  stage: any | null;
  stages: any[];
  sources: any[];
  memory: any[];
  query: string;
  maxSources?: number;
  /** Diğer bölümlerden alınacak en fazla karakter (özet/abstract gibi bütünü gerektiren eylemler için artırılır) */
  otherChars?: number;
}): Promise<BuiltContext> {
  const { db, project, stage, stages, sources, memory, query } = params;
  const ctx = project.context ?? {};
  const out: string[] = [];

  out.push("## PROJE BAĞLAMI");
  out.push(`Başlık: ${project.title}`);
  out.push(`Çalışma türü: ${project.work_type} · Seviye: ${LEVEL_LABELS[project.academic_level as AcademicLevel] ?? project.academic_level} · Disiplin: ${project.discipline || "belirtilmedi"}`);
  if (ctx.methodology) out.push(`Yöntem yaklaşımı: ${METHODOLOGY_LABELS[ctx.methodology as Methodology] ?? ctx.methodology}`);
  out.push(`Çalışma dili: ${project.language === "en" ? "İngilizce" : "Türkçe"} · Atıf stili: ${project.citation_style}`);
  if (project.topic) out.push(`Araştırma konusu: ${project.topic}`);
  if (project.keywords?.length) out.push(`Anahtar kelimeler: ${project.keywords.join(", ")}`);
  if (ctx.university) out.push(`Üniversite / kılavuz: ${ctx.university}`);
  if (ctx.targetJournal) out.push(`Hedef dergi: ${ctx.targetJournal}`);

  if (memory.length) {
    out.push("\n## PROJE HAFIZASI (önceki kararlar ve bilgiler)");
    for (const m of memory.slice(-60)) out.push(`- [${m.kind}] ${m.content}`);
  }

  // Diğer bölümlerin kısa özetleri (bölümler arası tutarlılık için)
  const others = stages.filter((s) => s.id !== stage?.id && s.word_count > 0);
  if (others.length) {
    out.push("\n## DİĞER BÖLÜMLERİN DURUMU");
    const lim = params.otherChars ?? 400;
    for (const s of others) out.push(`- ${s.title} (${s.word_count} kelime): ${String(s.content_text).slice(0, lim).replace(/\s+/g, " ")}${s.content_text.length > lim ? "…" : ""}`);
  }

  if (stage) {
    const def = stageDef(stage.key);
    out.push(`\n## ÜZERİNDE ÇALIŞILAN BÖLÜM: ${stage.title}`);
    out.push(`Amaç: ${def?.purpose ?? stage.description}`);
    if (def?.rules.length) out.push(`Yazım kuralları:\n${def.rules.map((r) => `- ${r}`).join("\n")}`);
    if (def?.requiresUserData) out.push("UYARI: Bu bölüm kullanıcının gerçek verisini gerektirir. Kullanıcı veri sağlamadıysa değer üretme, [VERİ GİRİLECEK] kullan.");
    const current = String(stage.content_text ?? "");
    out.push(current ? `Bölümün mevcut metni:\n"""\n${current.slice(0, 12000)}\n"""` : "Bölüm henüz boş.");
  }

  // Tekrar önleme: bölümde ve çalışmada zaten çok geçen kalıplar modele "kullanma" listesi olarak verilir
  {
    const keepTerms = [project.title, project.topic ?? "", ...(project.keywords ?? [])];
    const here = analyzeRepetition(String(stage?.content_text ?? ""), { keepTerms, minCount: 3 });
    const whole = analyzeRepetition(stages.map((s) => String(s.content_text ?? "")).join("\n"), { keepTerms, minCount: 4 });
    const seen = new Set<string>();
    const avoid = [...avoidListForPrompt(here), ...avoidListForPrompt(whole)].filter((x) => (seen.has(x.replace(/ \(\d+ kez\)$/, "")) ? false : (seen.add(x.replace(/ \(\d+ kez\)$/, "")), true))).slice(0, 16);
    if (avoid.length) {
      out.push("\n## TEKRARDAN KAÇIN (metinde zaten sık geçiyor; yeni yazacağın metinde kullanma, farklı cümle yapısı seç. Teknik terimler ve kavram adları bu kuralın dışındadır; onları gerektiği kadar kullan)");
      for (const a of avoid) out.push(`- ${a}`);
    }
  }

  // Kaynaklar: soruya ve bölüme en alakalı olanlar
  // Bu bölümde zaten atıf yapılan kaynaklar her zaman listede kalır (revizyonda atıflar kaybolmasın)
  const stageHeads = stage ? headings(stage.content as JSONNode).map((h) => h.text) : [];
  const citedHere = new Set(stage ? collectCitations(stage.content as JSONNode).flatMap((c) => c.ids) : []);
  const q = `${query} ${stage?.title ?? ""} ${stageHeads.slice(-3).join(" ")} ${project.topic ?? ""}`;
  const ranked = [...sources]
    .map((s) => ({ s, score: scoreRecord({ title: s.title, abstract: s.abstract, citedByCount: 0, accessLevel: s.access_level } as SourceRecord, q) + (citedHere.has(s.id) ? 0.5 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, params.maxSources ?? 40)
    .map((x) => x.s);

  const sourceMap: Record<string, string> = {};
  out.push("\n## KAYNAKLAR (yalnızca bunlara atıf yapabilirsin)");
  if (!ranked.length) out.push("Projede henüz kaynak yok. Kaynak gerektiren kesin iddialar yazma; ihtiyaç duyulan konuları :::eksik bloğunda arama sorgusu olarak bildir.");
  ranked.forEach((s, idx) => {
    const sid = `S${idx + 1}`;
    sourceMap[sid] = s.id;
    const abs = s.access_level !== "metadata" && s.abstract ? `\n  Özet: ${String(s.abstract).slice(0, 1200)}` : "";
    out.push(`- ${sid}: ${authorShort(s.authors)} (${s.year ?? "t.y."}). ${s.title}. ${s.container_title ?? ""}${s.pages ? `, ss. ${s.pages}` : ""}${s.doi ? ` DOI: ${s.doi}` : ""} [Erişim: ${ACCESS_TR[s.access_level as keyof typeof ACCESS_TR]}; ${s.verified ? "doğrulandı" : "DOĞRULANMADI"}${citedHere.has(s.id) ? "; bu bölümde zaten atıf var" : ""}]${s.relevance_note ? `\n  Kullanıcı notu: ${s.relevance_note}` : ""}${abs}`);
  });

  // RAG: tam metin parçaları
  let usedChunks = 0;
  const reverse = Object.fromEntries(Object.entries(sourceMap).map(([k, v]) => [v, k]));
  const termSource = `${query} ${stage?.title ?? ""} ${stageHeads.slice(-3).join(" ")} ${(project.keywords ?? []).join(" ")}`;
  const terms = [...new Set(termSource.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 3).map((w) => w.toLocaleLowerCase("tr")))].slice(0, 16).join(" or ");
  if (terms) {
    const { data: chunks } = await db.rpc("search_project_chunks", { p_project_id: project.id, p_query: terms, p_limit: 14 });
    const list = (chunks ?? []) as any[];
    const fileIds = [...new Set(list.filter((c) => !c.source_id && c.file_id).map((c) => c.file_id))];
    const names: Record<string, string> = {};
    if (fileIds.length) {
      const { data: files } = await db.from("files").select("id, name, purpose").in("id", fileIds);
      for (const f of files ?? []) names[f.id] = `${f.name}${f.purpose === "guideline" ? " (yazım kılavuzu)" : ""}`;
    }
    const srcChunks = list.filter((c) => c.source_id && reverse[c.source_id]);
    const fileChunks = list.filter((c) => !c.source_id && names[c.file_id]);
    if (srcChunks.length) {
      out.push("\n## TAM METİN PARÇALARI (doğrudan alıntı yalnızca buradan yapılabilir; \"s. N\" yayındaki sayfa numarasıdır)");
      for (const c of srcChunks) {
        out.push(`[${reverse[c.source_id]}${c.page_hint ? `, ${c.page_hint}` : ", sayfa bilgisi yok"}]: ${String(c.content).slice(0, 1500)}`);
        usedChunks++;
      }
    }
    if (fileChunks.length) {
      out.push("\n## KULLANICININ YÜKLEDİĞİ DOSYALARDAN PARÇALAR (atıf kaynağı değildir; bağlam ve kurallar için kullan)");
      for (const c of fileChunks.slice(0, 5)) {
        out.push(`[${names[c.file_id]}${c.page_hint ? `, ${c.page_hint}` : ""}]: ${String(c.content).slice(0, 1200)}`);
        usedChunks++;
      }
    }
  }

  return { text: out.join("\n"), sourceMap, usedChunks };
}

/** Asistan yanıtındaki :::hafiza bloklarını ayrıştırır. */
export function extractMemory(answer: string): { kind: string; content: string }[] {
  const kinds: Record<string, string> = { karar: "decision", kavram: "concept", "değişken": "variable", soru: "question", hipotez: "hypothesis", bilgi: "fact" };
  const out: { kind: string; content: string }[] = [];
  for (const block of answer.matchAll(/:::hafiza\s*\n([\s\S]*?)\n:::/g)) {
    for (const line of block[1].split("\n")) {
      const m = line.replace(/^[-*]\s*/, "").match(/^([\p{L}]+)\s*:\s*(.+)$/u);
      if (m && kinds[m[1].toLocaleLowerCase("tr")]) out.push({ kind: kinds[m[1].toLocaleLowerCase("tr")], content: m[2].trim().slice(0, 1000) });
    }
  }
  return out.slice(0, 10);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Asistan yanıtındaki :::eksik bloğundan arama sorgularını çıkarır. */
export function extractGaps(answer: string): string[] {
  const out: string[] = [];
  for (const block of answer.matchAll(/:::eksik\s*\n([\s\S]*?)\n:::/g)) {
    for (const line of block[1].split("\n")) {
      const q = line.replace(/^[-*\d.)\s]+/, "").replace(/["“”]/g, "").trim();
      if (q.length >= 3 && q.length <= 120) out.push(q);
    }
  }
  return [...new Set(out)].slice(0, 4);
}
