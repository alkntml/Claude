import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreRecord } from "@/lib/sources/aggregate";
import type { SourceRecord } from "@/lib/sources/types";
import { collectCitations, headings, type JSONNode } from "@/lib/editor/doc";
import { analyzeRepetition, avoidListForPrompt } from "@/lib/quality/repetition";
import { blueprintContext, blueprintStageNote, readBlueprint } from "@/lib/blueprint";
import { structureRule } from "@/lib/workflows/structure";
import { capstoneGuidance, designById, LITERATURE_FUNCTIONS, LITERATURE_STAGES, literatureDepth, reportingStandards, scopeGuidance, GRANT_PROGRAMS, PROGRAM_NOTES, stageDef, stageNeedsData, EMPIRICAL_METHODS, METHODOLOGY_LABELS, LEVEL_LABELS, type Methodology, type AcademicLevel } from "@/lib/workflows";
import { LANG_NAME_TR, writingLang } from "@/lib/writing-lang";
import { missingFields } from "@/lib/citations/checks";
import { sourceRowToItemClient } from "@/lib/sources/row";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ACCESS_TR = { metadata: "yalnızca künye", abstract: "özet okundu", full_text: "tam metin okundu" } as const;

export interface BuiltContext {
  /** Bağlamın tamamı (head + tail); bölmeyi desteklemeyen sağlayıcılar için */
  text: string;
  /**
   * Sabit kısım (D78): proje bilgisi, kurgu, kaynak listesi ve hafıza. Aynı çalışmadaki ardışık isteklerde
   * değişmediği için önbelleğe alınır (önbellekten okuma, normal girdi fiyatının ~%10’u).
   */
  head: string;
  /** Değişken kısım: diğer bölümler, üzerinde çalışılan bölüm, yapı kuralı, tekrar listesi, tam metin parçaları */
  tail: string;
  /** Kısa kimlik (S1) -> kaynak uuid */
  sourceMap: Record<string, string>;
  usedChunks: number;
}

function authorShort(authors: any[]): string {
  const fam = (authors ?? []).map((a) => a.literal ?? a.family ?? "").filter(Boolean);
  if (!fam.length) return "Yazar yok";
  return fam.length > 2 ? `${fam[0]} vd.` : fam.join(" & ");
}

/**
 * D169: Atıf önceliği. 1 = doğrulanmış, künyesi eksiksiz ve tam metni okunmuş; 2 = doğrulanmış ve özeti okunmuş (künye eksiksiz);
 * 3 = doğrulanmış ama künyesi eksik; 4 = içeriği okunmamış (yalnızca künye) veya doğrulanmamış. Böylece model önce içeriğini
 * gerçekten bildiği, kaynakçada eksiksiz görünecek kaynaklara atıf yapar (kalite kontrolünde “doğrulanmamış / eksik künye /
 * yalnızca künye” bulgusu çıkmaz; atıf doğruluğu artar).
 */
export function citationPriority(s: any): 1 | 2 | 3 | 4 {
  if (!s.verified || s.access_level === "metadata" || !s.access_level) return 4;
  const complete = missingFields(sourceRowToItemClient(s)).length === 0;
  if (!complete) return 3;
  return s.access_level === "full_text" ? 1 : 2;
}

const PRIORITY_NOTE: Record<1 | 2 | 3 | 4, string> = {
  1: "Atıf önceliği 1 (tam metni okundu, doğrulandı)",
  2: "Atıf önceliği 2 (özeti okundu, doğrulandı)",
  3: "Atıf önceliği 3 (künyesi eksik; aynı bilgiyi destekleyen öncelik 1–2 kaynak varsa onu kullan)",
  4: "Atıf önceliği 4 (içeriği okunmadı veya doğrulanmadı)",
};

function sourceLine(s: any, sid: string, strict = false): string {
  const abs = s.access_level !== "metadata" && s.abstract ? `\n  Özet: ${String(s.abstract).slice(0, 1200)}` : "";
  const p = citationPriority(s);
  const note = p === 4 && strict ? "ATIF YAPMA (içeriği okunmadı veya doğrulanmadı; bu kaynağa dayanan cümle yazma)" : PRIORITY_NOTE[p];
  return `- ${sid}: ${authorShort(s.authors)} (${s.year ?? "t.y."}). ${s.title}. ${s.container_title ?? ""}${s.pages ? `, ss. ${s.pages}` : ""}${s.doi ? ` DOI: ${s.doi}` : ""} [Erişim: ${ACCESS_TR[s.access_level as keyof typeof ACCESS_TR]}; ${s.verified ? "doğrulandı" : "DOĞRULANMADI"}; ${note}]${s.relevance_note ? `\n  Kullanıcı notu: ${s.relevance_note}` : ""}${abs}`;
}

const relevance = (s: any, q: string) => scoreRecord({ title: s.title, abstract: s.abstract, citedByCount: 0, accessLevel: s.access_level } as SourceRecord, q);

/**
 * Bağlama girecek kaynaklar (D78). Önbelleğin işe yaraması için sabit kısımdaki liste isteğe göre değişmez:
 * kaynak sayısı sınırı aşmıyorsa hepsi eklenme sırasıyla; aşıyorsa çalışmanın konusuna en yakın olanlar
 * (yine eklenme sırasıyla). İsteğe/bölüme özgü ama listede olmayan ilgili ve bu bölümde atıf almış kaynaklar
 * değişken kısma ek olarak girer. Saf fonksiyon (test edilir).
 */
export function selectContextSources<S extends { id: string }>(sources: S[], opts: { max: number; projectQuery: string; query: string; citedHere: Set<string>; extraMax?: number; score?: (s: S, q: string) => number }): { head: S[]; extra: S[] } {
  const score = opts.score ?? relevance;
  if (sources.length <= opts.max) return { head: [...sources], extra: [] };
  const keep = new Set(
    sources.map((s, i) => ({ s, i, v: score(s, opts.projectQuery) })).sort((a, b) => b.v - a.v || a.i - b.i).slice(0, opts.max).map((x) => x.s.id),
  );
  const head = sources.filter((s) => keep.has(s.id));
  const extra = sources
    .filter((s) => !keep.has(s.id))
    .map((s) => ({ s, v: score(s, opts.query) + (opts.citedHere.has(s.id) ? 1 : 0) }))
    .filter((x) => x.v > 0 || opts.citedHere.has(x.s.id))
    .sort((a, b) => b.v - a.v)
    .slice(0, opts.extraMax ?? 12)
    .map((x) => x.s);
  return { head, extra };
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
  /** Bölümün tamamı zaten SEÇİLİ METİN olarak gönderiliyorsa mevcut metin bağlama ikinci kez eklenmez */
  omitCurrentText?: boolean;
  /** Bölüme özel yönetici talimatı (değişken kısma girer; sistem talimatı bölümden bölüme değişmesin) */
  stagePrompt?: string;
}): Promise<BuiltContext> {
  const { db, project, stage, stages, sources, memory, query } = params;
  const ctx = project.context ?? {};
  const head: string[] = [];
  const tail: string[] = [];
  const bp = readBlueprint(ctx.blueprint);

  // ---------- Sabit kısım (önbelleğe alınır) ----------
  head.push("## PROJE BAĞLAMI");
  head.push(`Başlık: ${project.title}`);
  head.push(`Çalışma türü: ${project.work_type} · Seviye: ${LEVEL_LABELS[project.academic_level as AcademicLevel] ?? project.academic_level} · Disiplin: ${project.discipline || "belirtilmedi"}`);
  if (ctx.methodology) head.push(`Yöntem yaklaşımı: ${METHODOLOGY_LABELS[ctx.methodology as Methodology] ?? ctx.methodology}`);
  // D171: araştırma deseni, raporlama standardı ve bitirme projesi türü
  const design = designById(ctx.design);
  if (design) head.push(`Araştırma deseni: ${design.label}. Desen gereği: ${design.guidance}`);
  const standards = reportingStandards({ workType: project.work_type, approach: ctx.methodology, design: ctx.design });
  if (standards.length) head.push(`Raporlama standardı (yol gösterici): ${standards.join(", ")}. Standardın gerektirdiği ancak kullanıcının sağlamadığı bilgiyi uydurma; [VERİ GİRİLECEK] ile işaretle.`);
  const capstone = project.work_type === "capstone" ? capstoneGuidance(ctx.variant) : "";
  if (capstone) head.push(capstone);
  // D170: kaynaklara dayalı çalışmalarda (dergi makalesi, derleme, kuramsal/derleme yaklaşımlı tez ve makale) veri yer tutucusu yok
  const sourceBased = ["journal_article", "literature_review", "source_research"].includes(project.work_type)
    || (["thesis", "research_article", "capstone"].includes(project.work_type) && !!ctx.methodology && !EMPIRICAL_METHODS.has(ctx.methodology));
  if (sourceBased) head.push("ÇALIŞMANIN NİTELİĞİ: Bu çalışma kullanıcının topladığı veriye değil, KAYNAKLAR’daki yayınlara dayanır. Yöntem/Bulgular/örneklem/veri analizi anlatma, “bu çalışmada veri toplanmıştır” gibi cümle kurma ve [VERİ GİRİLECEK] işaretini HİÇ KULLANMA; olgusal her bilgiyi kaynaklarla ver.");
  head.push(`Çalışma dili: ${LANG_NAME_TR[writingLang(project.language)]} · Atıf stili: ${project.citation_style}`);
  // D144: Almanca yazım — akademik Almanca kuralları; sistem işaretleri ve özet biçimi
  if (writingLang(project.language) === "de") head.push("ALMANCA YAZIM: Taslakların tamamını akademik Almancayla (wissenschaftliches Deutsch) yaz: nesnel üslup, birinci tekil şahıs yerine edilgen veya “in der vorliegenden Arbeit” yapıları, doğru büyük harf ve virgül kuralları, yerleşik Almanca terimler. Sistem işaretlerini ([[kaynak:S1]], [KAYNAK GEREKLİ], [VERİ GİRİLECEK], :::taslak) asla çevirme, aynen kullan. Özet istendiğinde Türkçe Özet yerine “## Zusammenfassung” (Almanca, 150–250 kelime) ve “Schlüsselwörter:” satırı, ardından “## Abstract” ve “Keywords:” yaz.");
  if (project.topic) head.push(`Araştırma konusu: ${project.topic}`);
  if (project.keywords?.length) head.push(`Anahtar kelimeler: ${project.keywords.join(", ")}`);
  if (ctx.university) head.push(`Üniversite / kılavuz: ${ctx.university}`);
  if (ctx.targetJournal) head.push(`Hedef dergi: ${ctx.targetJournal}`);
  if (ctx.program) head.push(`Başvurulan program: ${GRANT_PROGRAMS.find((p) => p.id === ctx.program)?.label ?? ctx.program}. ${PROGRAM_NOTES[ctx.program as keyof typeof PROGRAM_NOTES] ?? ""} Başvuru formunun bölüm düzenine uy; programın üst sınırları, puanlama ölçütleri veya kuralları hakkında bilmediğin ayrıntıyı uydurma, kullanıcıya çağrı duyurusunu kontrol etmesini söyle.`);

  // Öğrencinin kurgusu (D67): yazım bu plana göre ilerler (bölüme özel not değişken kısımda)
  const plan = blueprintContext(bp, null);
  if (plan) head.push(`\n${plan}`);

  // Kaynaklar (D78: sabit sırada; bölüme özgü ekler değişken kısımda)
  const stageHeads = stage ? headings(stage.content as JSONNode).map((h) => h.text) : [];
  const citedHere = new Set<string>(stage ? collectCitations(stage.content as JSONNode).flatMap((c) => c.ids) : []);
  const q = `${query} ${stage?.title ?? ""} ${stageHeads.slice(-3).join(" ")} ${project.topic ?? ""}`;
  // D169: kaynaklar atıf önceliğine göre sıralanır (eşitlikte eklenme sırası); seçimde içeriği okunan kaynaklar öne geçer
  const ordered = sources.map((s, i) => ({ s, i, p: citationPriority(s) })).sort((a, b) => a.p - b.p || a.i - b.i).map((x) => x.s);
  const picked = selectContextSources(ordered, {
    max: params.maxSources ?? 40,
    projectQuery: `${project.title} ${project.topic ?? ""} ${(project.keywords ?? []).join(" ")}`,
    query: q,
    citedHere,
    score: (s: any, qq: string) => relevance(s, qq) + (4 - citationPriority(s)) * 0.08,
  });
  // Yeterli sayıda içeriği okunmuş, doğrulanmış kaynak varsa okunmamış/doğrulanmamış kaynaklara atıf yapılmaz
  const strict = sources.filter((s) => citationPriority(s) <= 3).length >= 3;
  const sourceMap: Record<string, string> = {};
  head.push("\n## KAYNAKLAR (yalnızca bunlara atıf yapabilirsin)");
  // D150: atıfların denetimde “destekliyor” çıkması için cümle kaynağın söylediğini söylemeli
  head.push("ATIF DOĞRULUĞU (zorunlu): Bir cümleye yalnızca o cümlenin ANA bilgisini kaynağın özetinde veya okunan metninde açıkça bulduğun kaynakla atıf yap. Sayı, oran, yön, örneklem ve kapsamı kaynaktakiyle aynı yaz; kaynak “ilişkili” diyorsa “etkiler/neden olur” yazma; kaynaktaki temkini (“olabilir”, “işaret etmektedir”) koru; belirli bir örneklemdeki bulguyu genelleştirme. Erişimi “yalnızca künye” olan kaynağa belirli bir bulgu, sayı veya sonuç atfetme (yalnızca konunun ele alındığını belirtmek için kullan). Bir cümlede birden çok bilgi varsa her bilgiyi onu söyleyen kaynağa bağla. Emin değilsen o iddiayı yazma; :::eksik bloğunda bildir.");
  head.push("KAYNAK SEÇİMİ (zorunlu): Bir bilgiyi birden fazla kaynak destekliyorsa atıf önceliği daha iyi (küçük numaralı) olanı seç: önce tam metni okunan, sonra özeti okunan doğrulanmış kaynaklar. Tam metin parçalarında geçen bilgiyi tercih et ve sayfa numarasını kullan. Öncelik 4 kaynaklara yalnızca içeriği hakkında özette açıkça yazanı söylemek için ve başka kaynak yoksa atıf yap; “ATIF YAPMA” yazan kaynaklara hiç atıf yapma. Literatüre dayanan her alt başlıkta en az bir uygun kaynağa atıf yap; uygun kaynak yoksa kesin iddia yazma.");
  if (!sources.length) head.push("Projede henüz kaynak yok. Kaynak gerektiren kesin iddialar yazma; ihtiyaç duyulan konuları :::eksik bloğunda arama sorgusu olarak bildir.");
  picked.head.forEach((s, idx) => {
    const sid = `S${idx + 1}`;
    sourceMap[sid] = s.id;
    head.push(sourceLine(s, sid, strict));
  });

  if (memory.length) {
    head.push("\n## PROJE HAFIZASI (önceki kararlar ve bilgiler)");
    // D171: onaylanmış kararlar, bilgiler ve henüz doğrulanmamış varsayımlar ayrı tutulur
    head.push("[decision] kullanıcının onayladığı karardır, buna uy; [fact] kayıtlı bilgidir, kaynakla desteklenmiyorsa kesin bulgu gibi sunma; [hypothesis] ve [question] henüz doğrulanmamıştır, sonuç gibi yazma. Araştırma sorusu değiştiyse yöntem, analiz, bulgu ve tartışmanın yeni soruyla uyumunu gözet.");
    for (const m of memory.slice(-60)) head.push(`- [${m.kind}] ${m.content}`);
  }

  // ---------- Değişken kısım ----------
  if (picked.extra.length) {
    tail.push("## BU İSTEKLE İLGİLİ EK KAYNAKLAR (bunlara da atıf yapabilirsin)");
    picked.extra.forEach((s, idx) => {
      const sid = `S${picked.head.length + idx + 1}`;
      sourceMap[sid] = s.id;
      tail.push(sourceLine(s, sid, strict));
    });
  }
  const reverse = Object.fromEntries(Object.entries(sourceMap).map(([k, v]) => [v, k]));
  const citedIds = [...citedHere].map((id) => reverse[id]).filter(Boolean);
  if (citedIds.length) tail.push(`\nBu bölümde zaten atıf yapılan kaynaklar: ${citedIds.join(", ")} (düzeltme ve genişletmede bu atıfları koru).`);

  // Diğer bölümlerin kısa özetleri (bölümler arası tutarlılık için)
  // D171: gizlenen bölümler bağlama girmez
  const others = stages.filter((s) => s.id !== stage?.id && !s.hidden && s.word_count > 0);
  if (others.length) {
    tail.push("\n## DİĞER BÖLÜMLERİN DURUMU");
    const lim = params.otherChars ?? 400;
    for (const s of others) tail.push(`- ${s.title} (${s.word_count} kelime): ${String(s.content_text).slice(0, lim).replace(/\s+/g, " ")}${s.content_text.length > lim ? "…" : ""}`);
  }

  if (stage) {
    const def = stageDef(stage.key);
    tail.push(`\n## ÜZERİNDE ÇALIŞILAN BÖLÜM: ${stage.title}`);
    tail.push(`Amaç: ${def?.purpose ?? stage.description}`);
    if (def?.rules.length) tail.push(`Yazım kuralları:\n${def.rules.map((r) => `- ${r}`).join("\n")}`);
    if (params.stagePrompt) tail.push(`BÖLÜME ÖZEL TALİMAT:\n${params.stagePrompt}`);
    // D171: bölümün gerekçesi, kullanıcının seçtiği kapsam ve literatür derinliği
    if (stage.why) tail.push(`Bölümün çalışmadaki işlevi: ${stage.why}`);
    const sg = scopeGuidance(stage.scope);
    if (sg) tail.push(sg);
    if (LITERATURE_STAGES.has(stage.key)) tail.push(`${LITERATURE_FUNCTIONS}\nBeklenen derinlik (${LEVEL_LABELS[project.academic_level as AcademicLevel] ?? project.academic_level}): ${literatureDepth({ workType: project.work_type, level: project.academic_level, approach: ctx.methodology })}`);
    if (stageNeedsData(stage.key, project)) tail.push("UYARI: Bu bölüm kullanıcının gerçek verisini gerektirir. Kullanıcı veri sağlamadıysa değer üretme, [VERİ GİRİLECEK] kullan.");
    const note = blueprintStageNote(bp, stage);
    if (note) tail.push(note);
    // Akademik yapı (D76): aşama adı başlık olarak yazılmaz; alt başlık sayısı bölüm türü ve hedef uzunluğa göre sınırlı
    const target = Number((bp?.chapters ?? []).find((c) => c.stageId === stage.id)?.words) || 0;
    tail.push(structureRule(stage.key, stage.title, target));
    const current = String(stage.content_text ?? "");
    if (!current) tail.push("Bölüm henüz boş.");
    else if (params.omitCurrentText) tail.push("Bölümün mevcut metninin tamamı aşağıda SEÇİLİ METİN olarak verildi.");
    else tail.push(`Bölümün mevcut metni:\n"""\n${current.slice(0, 12000)}\n"""`);
  }

  // Tekrar önleme: bölümde ve çalışmada zaten çok geçen kalıplar modele "kullanma" listesi olarak verilir
  {
    const keepTerms = [project.title, project.topic ?? "", ...(project.keywords ?? [])];
    const here = analyzeRepetition(String(stage?.content_text ?? ""), { keepTerms, minCount: 3 });
    const whole = analyzeRepetition(stages.map((s) => String(s.content_text ?? "")).join("\n"), { keepTerms, minCount: 4 });
    const seen = new Set<string>();
    const avoid = [...avoidListForPrompt(here), ...avoidListForPrompt(whole)].filter((x) => (seen.has(x.replace(/ \(\d+ kez\)$/, "")) ? false : (seen.add(x.replace(/ \(\d+ kez\)$/, "")), true))).slice(0, 16);
    if (avoid.length) {
      tail.push("\n## TEKRARDAN KAÇIN (metinde zaten sık geçiyor; yeni yazacağın metinde kullanma, farklı cümle yapısı seç. Teknik terimler ve kavram adları bu kuralın dışındadır; onları gerektiği kadar kullan)");
      for (const a of avoid) tail.push(`- ${a}`);
    }
  }

  // RAG: tam metin parçaları
  let usedChunks = 0;
  const termSource = `${query} ${stage?.title ?? ""} ${stageHeads.slice(-3).join(" ")} ${(project.keywords ?? []).join(" ")}`;
  const terms = [...new Set(termSource.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 3).map((w) => w.toLocaleLowerCase("tr")))].slice(0, 16).join(" or ");
  if (terms) {
    const { data: chunks } = await db.rpc("search_project_chunks", { p_project_id: project.id, p_query: terms, p_limit: 18 });
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
      tail.push("\n## TAM METİN PARÇALARI (doğrudan alıntı yalnızca buradan yapılabilir; \"s. N\" yayındaki sayfa numarasıdır)");
      for (const c of srcChunks) {
        tail.push(`[${reverse[c.source_id]}${c.page_hint ? `, ${c.page_hint}` : ", sayfa bilgisi yok"}]: ${String(c.content).slice(0, 1500)}`);
        usedChunks++;
      }
    }
    if (fileChunks.length) {
      tail.push("\n## KULLANICININ YÜKLEDİĞİ DOSYALARDAN PARÇALAR (atıf kaynağı değildir; bağlam ve kurallar için kullan)");
      for (const c of fileChunks.slice(0, 5)) {
        tail.push(`[${names[c.file_id]}${c.page_hint ? `, ${c.page_hint}` : ""}]: ${String(c.content).slice(0, 1200)}`);
        usedChunks++;
      }
    }
  }

  const h = head.join("\n"), t = tail.join("\n");
  return { text: t ? `${h}\n\n${t}` : h, head: h, tail: t, sourceMap, usedChunks };
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
