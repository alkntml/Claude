/**
 * Film (D194): demo sahte sunucusunun üstüne gelen katman. Filmde kullanılan uçları yanıtlar, kalanını demoya bırakır.
 * - Yapay zekâ yanıtları answers.ts’ten, sunucudaki gibi SSE olarak parça parça akar.
 * - Veri dosyası, istatistik analizi, grafik, iddia çıkarma, kalite kontrolü ve ilerleme sitenin GERÇEK motorlarıyla hesaplanır.
 * - Kaynaklar sources.ts’teki kurgusal kayıtlardır.
 */
import { summarize } from "@/lib/files/stats";
import { runAnalysis, type AnalysisSpec } from "@/lib/stats/apa";
import { buildChart, type ChartSpec } from "@/lib/stats/charts";
import { extractClaims, summarize as summarizeClaims, type AuditItem, type ClaimVerdict } from "@/lib/claims";
import { computeProgress } from "@/lib/progress";
import { buildGraph, insights, topicMap } from "@/lib/litmap-graph";
import { runQualityChecks } from "@/lib/quality/checks";
import { scoreOf } from "@/lib/quality/score";
import { citedIdsInOrder } from "@/lib/editor/doc";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { stageDef } from "@/lib/workflows";
import { commitDemo, getDB } from "../mock-api";
import { ANSWERS, BLUEPRINT, DEFENSE_FEEDBACK, DEFENSE_QUESTIONS, INTRO, TITLES } from "./answers";
import { FILM_SOURCES, filmSearch } from "./sources";

/* eslint-disable @typescript-eslint/no-explicit-any */
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
const W = window as any;
const speed = () => Number(W.__FILM_SPEED__ ?? 1);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms / speed()));
const jsonRes = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

/** S1…S14 → FILM_SOURCES sırası (kaynaklar iki aramada bu sırayla eklenir) */
const S_ORDER = [0, 1, 2, 3, 4, 5, 9, 10, 11, 6, 7, 8, 12, 13];
function sourceMap(projectId: string): Record<string, string> {
  const rows = getDB().sources.filter((s: any) => s.project_id === projectId);
  const map: Record<string, string> = {};
  S_ORDER.forEach((fi, i) => { const r = rows.find((x: any) => x.title === FILM_SOURCES[fi].title); if (r) map[`S${i + 1}`] = r.id; });
  return map;
}
const filmRecord = (title: string) => FILM_SOURCES.find((r) => r.title === title);

// --- Veri dosyası (CSV) — tarayıcıda saklanır, sunucudaki gibi ayrıştırılır
const CSV_KEY = "academiana-film-csv";
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  for (const line of text.replace(/\r/g, "").split("\n")) {
    if (!line.trim()) continue;
    const cells: string[] = []; let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === ",") { cells.push(cur); cur = ""; } else cur += c;
    }
    cells.push(cur); out.push(cells);
  }
  return out;
}
function rows(): string[][] { try { return parseCsv(localStorage.getItem(CSV_KEY) ?? ""); } catch { return []; } }

// --- Yapay zekâ yanıtı: SSE akışı
function sse(projectId: string, stageKey: string): Response {
  const a = ANSWERS[stageKey];
  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(c) {
      const send = (event: string, data: unknown) => c.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      if (!a) {
        send("meta", { conversationId: uid(), sourceMap: {}, model: "claude-opus-5-5", usedChunks: 0 });
        send("text", { text: "Bu bölüm için kurgudaki planı izleyin." }); send("done", { usage: {}, stopReason: "end_turn", warnings: [] }); c.close(); return;
      }
      const map = sourceMap(projectId);
      const full = getDB().sources.filter((s: any) => s.project_id === projectId && s.access_level === "full_text").length;
      send("phase", { phase: "plan" });
      send("status", { text: "Kurgu, çalışma hafızası ve önceki bölümler okunuyor" });
      await sleep(900);
      send("phase", { phase: "read" });
      send("status", { text: `Kütüphanedeki ${Object.keys(map).length} kaynak tarandı; ${full} kaynağın tam metninden ilgili bölümler seçildi` });
      await sleep(1100);
      send("meta", { conversationId: uid(), sourceMap: map, model: "claude-opus-5-5", usedChunks: 12 });
      send("phase", { phase: "write" });
      const text = `${INTRO[a.action] ?? INTRO.draft}\n\n:::taslak\n${a.text}\n:::\n`;
      const step = 9;
      for (let i = 0; i < text.length; i += step) { send("text", { text: text.slice(i, i + step) }); await sleep(16); }
      send("done", { usage: { input_tokens: 0, output_tokens: 0 }, stopReason: "end_turn", memoryAdded: 0, warnings: [] });
      c.close();
    },
  });
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

// --- Kurgu
function blueprint(projectId: string, input: string) {
  const stages = getDB().stages.filter((s: any) => s.project_id === projectId).sort((a: any, b: any) => a.position - b.position);
  const chapters = stages.filter((s: any) => BLUEPRINT.plans[s.key]).map((s: any) => ({ stageId: s.id, key: s.key, title: s.title, plan: BLUEPRINT.plans[s.key][0], words: BLUEPRINT.plans[s.key][1] }));
  const { plans: _p, ...rest } = BLUEPRINT; void _p;
  return { ...rest, chapters, targetWords: chapters.reduce((a: number, c: any) => a + c.words, 0), wordsPerPage: 250, input, approvedAt: null, updatedAt: now() };
}

// --- İddia denetimi: iddialar sitenin gerçek ayıklayıcısıyla çıkarılır; yargılar kaynakların erişim düzeyine göre
function audit(stageId: string): any {
  const st = getDB().stages.find((s: any) => s.id === stageId);
  const src = (id: string) => getDB().sources.find((s: any) => s.id === id);
  const results: AuditItem[] = extractClaims(st?.content).map((c) => {
    const checks = c.citations.flatMap((ct) => ct.ids).map((id) => {
      const s = src(id);
      const access = (s?.access_level ?? "metadata") as "metadata" | "abstract" | "full_text";
      const v: ClaimVerdict = access === "metadata" ? "insufficient" : "supports";
      const quote = access === "metadata" ? null : String(s?.abstract ?? "").split(/(?<=\.)\s/)[0] ?? null;
      return { sourceId: id, verdict: v, access, quote, quotePage: access === "full_text" ? (c.citations.find((x) => x.ids.includes(id))?.locator ?? null) : null,
        explanation: access === "metadata" ? "Bu kaynağın yalnızca künyesi var; metni okunmadan iddia doğrulanamaz. Tam metni yükleyin veya iddiayı tam metni okunmuş bir kaynakla destekleyin." : access === "full_text" ? "Tam metindeki ilgili bölüm iddiayı destekliyor." : "Özet iddiayı destekliyor; ayrıntı için tam metin önerilir." };
    });
    const verdict = checks.length ? (checks.some((x) => x.verdict === "supports") ? "supports" : "insufficient") as ClaimVerdict : null;
    return { ...c, verdict, checks };
  });
  return { id: uid(), created_at: now(), scope: "stage", summary: summarizeClaims(results), results };
}

// --- Literatür haritası (konu ağları kurgusal kaynaklara göre)
function litmap(projectId: string) {
  const src = getDB().sources.filter((x: any) => x.project_id === projectId);
  const T = [
    { id: "T1", name: "Smartphone addiction", subfield: "Clinical Psychology", field: "Psychology" },
    { id: "T2", name: "Academic procrastination", subfield: "Educational Psychology", field: "Psychology" },
    { id: "T3", name: "Sleep quality", subfield: "Health Psychology", field: "Psychology" },
  ];
  const topicOf = (t: string) => (/uyku|sleep|puki|pittsburgh|gece|bedtime|night/i.test(t) ? 2 : /erteleme|procrast|öz düzenleme|self-reg/i.test(t) ? 1 : 0);
  const works = src.map((x: any, i: number) => {
    const g = topicOf(x.title);
    const refs = g === 0 ? ["R1", "R2", "R3", `R${10 + i}`] : g === 1 ? ["Q1", "Q2", "Q3", `Q${10 + i}`] : ["P1", "P2", "P3", `P${10 + i}`];
    if (i % 3 === 0 && i > 0) refs.push(`W${i - 1}`);
    if (g === 1) refs.push("R1"); if (g === 2 && i % 2) refs.push("R2");
    return { id: `W${i}`, doi: null, title: x.title, year: x.year, referenced_works: refs, cited_by_count: 30 + ((i * 37) % 150), sourceId: x.id, topic: T[g] };
  });
  const citing = Array.from({ length: 8 }, (_, k) => ({ id: `N${k}`, referenced_works: [`W${k % works.length}`, `W${(k + 4) % works.length}`, `W${(k + 9) % works.length}`] }));
  const g = buildGraph(works, { citing });
  const rec = (title: string, year: number, extra: Record<string, unknown>) => ({ title, year, authors: [{ family: "Örnek" }], containerTitle: "Örnek Dergi (kurgusal)", openalexId: `https://openalex.org/F${title.length}${year}`, citedByCount: 140, ...extra });
  const suggestions = [rec("Örnek temel çalışma: öz düzenleme kuramı", 1998, { refCount: 5, topic: T[1] }), rec("Örnek temel çalışma: uyku kalitesinin ölçümü", 1989, { refCount: 4, topic: T[2] })];
  const newWorks = [rec("Örnek yeni çalışma: gece telefon kullanımı ve uyku", 2025, { citesMine: 4, topic: T[2] }), rec("Örnek yeni çalışma: dijital erteleme", 2024, { citesMine: 3, topic: T[1] })];
  const topics = topicMap(works.map((w: any) => w.topic), [...suggestions, ...newWorks].map((x: any) => x.topic));
  return { ...g, suggestions, newWorks, topics, insights: insights(g, topics, 2026), mapped: works.length, unmapped: 0, version: 2, cachedAt: Date.now() };
}

// --- Literatür matrisi (özeti/tam metni olan kaynaklarda)
const MATRIX: Record<string, Record<string, string>> = {
  "Üniversite öğrencilerinde akıllı telefon bağımlılığı ve yaşam doyumu": { purpose: "Bağımlılık ile yaşam doyumu ilişkisi", method: "İlişkisel tarama", sample: "412 üniversite öğrencisi", findings: "Bağımlılık arttıkça yaşam doyumu azalıyor; kullanım süresi en güçlü yordayıcı", relevance: "Bağımlılık tanımı ve Türkiye bağlamı" },
  "Akademik erteleme: Kavramsal bir çözümleme": { purpose: "Erteleme yaklaşımlarını karşılaştırmak", method: "Kavramsal derleme", sample: "—", findings: "Erteleme öz düzenleme başarısızlığı olarak açıklanıyor", relevance: "Kavram tanımı ve kuramsal çerçeve" },
  "Smartphone use before bedtime and sleep quality among college students": { purpose: "Yatmadan önce telefon kullanımı ve uyku", method: "Kesitsel", sample: "655 üniversite öğrencisi", findings: "Uykuya dalma süresi uzuyor; ilişki toplam ekran süresinden bağımsız", relevance: "H2 ve ekran süresi kontrolü" },
  "Gece ekran kullanımı ve uyku kalitesi ilişkisi": { purpose: "Gece ekran kullanımı ve PUKİ", method: "Karşılaştırmalı", sample: "Genç yetişkinler", findings: "Gece ekran kullananlarda PUKİ puanı daha yüksek", relevance: "H2 tartışması" },
  "Problematic smartphone use and academic procrastination: A meta-analysis": { purpose: "Telefon kullanımı–erteleme ilişkisinin büyüklüğü", method: "Meta-analiz (31 çalışma)", sample: "N = 14.862", findings: "r = .34; üniversite öğrencilerinde daha güçlü", relevance: "H1 karşılaştırması" },
  "Fear of missing out and nighttime phone checking": { purpose: "FoMO ve gece telefon kontrolü", method: "Kesitsel", sample: "318 lisans öğrencisi", findings: "FoMO gece kontrolünü, gece kontrolü uyku bozukluğunu yordadı", relevance: "Gece kullanımının mekanizması" },
  "Akıllı telefon bağımlılığı ölçeği kısa formunun üniversite öğrencilerinde geçerlik ve güvenirliği": { purpose: "Kısa formun geçerlik ve güvenirliği", method: "Ölçek uyarlama; DFA", sample: "Üniversite öğrencileri", findings: "Tek faktörlü yapı doğrulandı; α = .89", relevance: "Veri toplama aracı" },
  "Akademik erteleme ölçeğinin Türkçe uyarlaması": { purpose: "Ölçeğin Türkçe uyarlaması", method: "Ölçek uyarlama; DFA", sample: "Üniversite öğrencileri", findings: "Tek boyut; α = .86; test-tekrar test .81", relevance: "Veri toplama aracı" },
  "Pittsburgh Uyku Kalitesi İndeksinin Türkçe geçerlik ve güvenirlik çalışması": { purpose: "PUKİ Türkçe formunun sınanması", method: "Geçerlik–güvenirlik", sample: "Yetişkinler", findings: "Yedi bileşen; küresel puan 0–21; α = .80", relevance: "Veri toplama aracı" },
  "Üniversite öğrencilerinde uyku ve akademik işlevsellik": { purpose: "Uyku ve akademik işlevsellik", method: "İlişkisel tarama", sample: "Üniversite öğrencileri", findings: "Kötü uyku, görev başlatma güçlüğü ve ertelemeyle birlikte artıyor", relevance: "H3 tartışması" },
};

// --- Kaynak satırı (kurgusal kayıt; erişim düzeyi kayıttaki gibi)
function sourceRow(r: any, projectId: string) {
  const f = filmRecord(r.title) ?? r;
  return {
    id: uid(), project_id: projectId, user_id: "film", type: f.type, title: f.title, authors: f.authors ?? [], year: f.year ?? null, month: null,
    container_title: f.containerTitle ?? null, volume: f.volume ?? null, issue: f.issue ?? null, pages: f.pages ?? null, publisher: f.publisher ?? null,
    publisher_place: f.publisherPlace ?? null, edition: null, doi: null, pmid: null, pmcid: null, arxiv_id: null, isbn: null, url: null, oa_url: null,
    abstract: f.abstract ?? null, access_level: f.accessLevel ?? "metadata", verified: false, verification: { status: "demo", message: "Film için kurgusal örnek kayıt" },
    origin: "openalex", fulltext_status: f.accessLevel === "full_text" ? "done" : "none", relevance_note: "", created_at: now(),
  };
}

type H = (m: RegExpMatchArray, body: any, url: URL, init?: RequestInit) => Promise<Response | null> | Response | null;
const routes: [string, RegExp, H][] = [];
const on = (method: string, p: string, fn: H) => routes.push([method, new RegExp(`^${p}$`), fn]);

on("POST", "/api/ai/chat", (_m, b) => {
  const st = getDB().stages.find((s: any) => s.id === b.stageId);
  return sse(b.projectId, st?.key ?? "");
});
on("POST", "/api/projects/([^/]+)/blueprint", async (m, b) => {
  if (b.mode !== "generate") return jsonRes({ error: "Filmde kullanılmıyor" }, 400);
  await sleep(2600);
  return jsonRes({ blueprint: blueprint(m[1], b.input ?? "") });
});
on("POST", "/api/projects/([^/]+)/titles", async () => { await sleep(1500); return jsonRes({ titles: TITLES }); });
on("POST", "/api/projects/([^/]+)/stages/suggest", () => jsonRes({ suggestion: null, fields: [] }));
on("POST", "/api/sources/search", async (_m, b) => {
  await sleep(1400);
  const results = filmSearch(String(b.query ?? ""));
  const n = results.length;
  return jsonRes({ results, providers: [
    { provider: "openalex", ok: true, count: n, ms: 640 }, { provider: "crossref", ok: true, count: Math.max(1, n - 3), ms: 810 },
    { provider: "trdizin", ok: true, count: Math.max(1, n - 4), ms: 720 }, { provider: "semantic_scholar", ok: true, count: Math.max(1, n - 2), ms: 930 },
    { provider: "europepmc", ok: true, count: Math.max(1, n - 5), ms: 560 }, { provider: "dergipark", ok: true, count: Math.max(1, n - 4), ms: 690 },
  ] });
});
on("POST", "/api/projects/([^/]+)/sources", (m, b) => {
  const db = getDB();
  const have = new Set(db.sources.filter((s: any) => s.project_id === m[1]).map((s: any) => s.title));
  const list = (b.sources as any[]).filter((r) => !have.has(r.title)).map((r) => sourceRow(r, m[1]));
  db.sources.push(...list);
  commitDemo();
  return jsonRes({ sources: list, skipped: b.sources.length - list.length });
});
on("POST", "/api/projects/([^/]+)/litmap", async (m) => { await sleep(1800); return jsonRes(litmap(m[1])); });
on("POST", "/api/projects/([^/]+)/matrix", async (_m, b) => {
  await sleep(1200);
  return jsonRes({ sources: (b.sourceIds as string[]).map((id) => getDB().sources.find((s: any) => s.id === id)).filter(Boolean).map((s: any) => ({ ...s, summary: MATRIX[s.title] ? { ...MATRIX[s.title], basedOn: s.access_level === "full_text" ? "full_text" : "abstract" } : { purpose: "", method: "", sample: "", findings: "", relevance: "", basedOn: "metadata" } })) });
});
on("POST", "/api/sources/([^/]+)/ask", async (m) => {
  await sleep(1600);
  const s = getDB().sources.find((x: any) => x.id === m[1]);
  return jsonRes({ answer: "Kaynakta akademik erteleme, öğrencinin yapması gereken bir akademik görevi olumsuz sonuçlarını bildiği hâlde gereksiz yere geciktirmesi olarak tanımlanıyor (s. 24). Yazar ertelemeyi bir zaman yönetimi sorunundan çok öz düzenleme başarısızlığı olarak ele alıyor (s. 31).",
    evidence: s ? [{ content: "Akademik erteleme, öğrencinin yapması gereken akademik bir görevi, olumsuz sonuçlarını bildiği hâlde gereksiz yere geciktirmesidir.", page: "24" }, { content: "Erteleme, öz düzenleme sürecinin görev başlatma aşamasındaki bir başarısızlık olarak değerlendirilebilir.", page: "31" }] : [] });
});

on("POST", "/api/stages/([^/]+)/review", async () => {
  await sleep(2400);
  return jsonRes({ review: { verdict: "ok", aiRan: true,
    summary: "Problem durumu genelden özele ilerliyor ve problem cümlesiyle bitiyor. Her iddia projedeki bir kaynağa dayanıyor; kaynak bekleyen ifade yok.",
    strengths: ["Üç değişken tanımlanmış ve ikili ilişkiler kaynaklarla gösterilmiş.", "Literatürdeki boşluk açıkça belirtilmiş.", "Doğrudan alıntıda sayfa numarası var."],
    issues: [{ severity: "info", title: "Türkiye bağlamı", detail: "Türkiye’deki üniversite öğrencilerinde yaygınlığa ilişkin bir bilgi problemi güçlendirebilir.", fix: "Kütüphanenize bir yaygınlık çalışması ekleyip tek cümleyle belirtin.", source: "ai" }] }, aiError: null });
});

// Kalite kontrolü: sitenin kural motoru aynen çalışır. Filmdeki kaynaklar kurgusal olduğu ve DOI taşımadığı için
// yalnızca “Doğrulanmamış kaynak” ve “DOI eksik” bulguları rapordan çıkarılır; bu, raporda açıkça yazılır.
on("POST", "/api/projects/([^/]+)/quality", async (m) => {
  await sleep(1800);
  const db = getDB();
  const pr = db.projects.find((x: any) => x.id === m[1]);
  const stages = db.stages.filter((x: any) => x.project_id === m[1]).sort((a: any, b: any) => a.position - b.position).map((x: any) => {
    const def = stageDef(x.key);
    return { key: x.key, title: x.title, text: x.content_text ?? "", citedIds: citedIdsInOrder([x.content]), needsLiterature: def?.needsLiterature, requiresUserData: def?.requiresUserData, generated: !!def?.generated };
  });
  const sources = db.sources.filter((x: any) => x.project_id === m[1]).map((r: any) => ({ ...sourceRowToItemClient(r), verified: r.verified, accessLevel: r.access_level }));
  const report = runQualityChecks(stages, sources, { language: pr?.language ?? "tr" });
  const doiOnly = (i: any) => i.category === "sources" && (i.title === "Doğrulanmamış kaynak" || (i.title === "Eksik künye" && /: DOI eksik\.$/.test(i.detail)));
  const removed = report.issues.filter(doiOnly).length;
  const issues = [{ id: "film-note", category: "sources", severity: "info", weight: 0, title: "Film notu: kurgusal kaynaklar", detail: `Bu örnek çalışmanın kaynakları kurgusaldır ve DOI taşımaz; bu nedenle ${removed} DOI/doğrulama bulgusu bu rapordan çıkarıldı. Gerçek çalışmada kaynaklar veri tabanından DOI’siyle gelir ve doğrulanır.` }, ...report.issues.filter((i: any) => !doiOnly(i))];
  const row = { id: uid(), project_id: m[1], score: scoreOf(issues as any), report: { ...report, issues, score: scoreOf(issues as any), aiReview: { ran: false } }, created_at: now() };
  db.reports = [row, ...db.reports.filter((r: any) => r.project_id !== m[1])];
  commitDemo();
  return jsonRes({ report: row });
});

// Dosyalar ve istatistik (gerçek motorlar)
on("GET", "/api/files", () => jsonRes({ files: getDB().files ?? [] }));
on("POST", "/api/files", async (_m, _b, _u, init) => {
  const fd = init?.body as FormData;
  const f = fd.get("file") as File;
  const text = await f.text();
  try { localStorage.setItem(CSV_KEY, text); } catch { /* yoksay */ }
  await sleep(1200);
  const n = parseCsv(text).length - 1;
  const row = { id: uid(), name: f.name, mime_type: "text/csv", size_bytes: f.size, purpose: "data", project_id: fd.get("projectId") || null, created_at: now(), extraction_meta: { rows: n } };
  const db = getDB(); db.files = [row, ...(db.files ?? [])]; commitDemo();
  return jsonRes({ file: row });
});
on("GET", "/api/files/([^/]+)/stats", () => jsonRes({ summary: summarize(rows()) }));
on("POST", "/api/files/([^/]+)/analyze", async (_m, b) => { await sleep(700); return jsonRes({ report: runAnalysis(rows(), b.spec as AnalysisSpec, b.language ?? "tr") }); });
on("POST", "/api/files/([^/]+)/chart", async (_m, b) => { await sleep(600); return jsonRes({ chart: buildChart(rows(), b.spec as ChartSpec, b.language ?? "tr") }); });

// İddia denetimi, savunma, ortak çalışma, ilerleme
on("GET", "/api/stages/([^/]+)/claim-audit", () => jsonRes({ audit: null }));
on("POST", "/api/stages/([^/]+)/claim-audit", async (m) => { await sleep(2600); return jsonRes({ audit: audit(m[1]) }); });
on("POST", "/api/projects/([^/]+)/defense", async (_m, b) => {
  await sleep(1800);
  return jsonRes(b.mode === "evaluate" ? { feedback: DEFENSE_FEEDBACK } : { questions: DEFENSE_QUESTIONS });
});
const INVITES: any[] = [];
const people = () => ({ myRole: "owner", canInvite: true, limit: 3, advisorLimit: 2, members: [{ userId: "film", role: "owner", since: null, name: "Elif Aydın", me: true, email: "elif@ornek.edu.tr" }], invites: INVITES });
on("GET", "/api/projects/([^/]+)/members", () => jsonRes(people()));
on("POST", "/api/projects/([^/]+)/members", async (_m, b) => {
  await sleep(700);
  const invite = { id: uid(), email: b.email, role: b.role, token: "ornek-davet", expires_at: new Date(Date.now() + 14 * 86400000).toISOString(), created_at: now() };
  INVITES.push(invite);
  return jsonRes({ invite, registered: true }, 201);
});
on("GET", "/api/projects/([^/]+)/progress", (m) => {
  const db = getDB(); const p = db.projects.find((x: any) => x.id === m[1]);
  const q = db.reports.find((r: any) => r.project_id === m[1]);
  return jsonRes(computeProgress({ context: p?.context ?? {}, stages: db.stages.filter((s: any) => s.project_id === m[1]), comments: db.comments, quality: q ? { score: q.score, created_at: q.created_at } : null }));
});
const SHARES: any[] = [];
on("GET", "/api/projects/([^/]+)/shares", () => jsonRes({ shares: SHARES }));
on("POST", "/api/projects/([^/]+)/shares", (_m, b) => {
  const share = { id: uid(), token: "ornek-paylasim", label: b.label ?? "", allow_comments: !!b.allowComments, expires_at: b.expiresInDays ? new Date(Date.now() + b.expiresInDays * 86400000).toISOString() : null, created_at: now(), views: 0 };
  SHARES.unshift(share);
  return jsonRes({ share });
});
on("GET", "/api/projects/([^/]+)/export", (m, _b, url) => {
  window.dispatchEvent(new CustomEvent("film-export", { detail: { projectId: m[1], format: url.searchParams.get("format") } }));
  return new Response(new Blob(["%PDF-1.7 film"], { type: "application/pdf" }), { status: 200, headers: { "content-disposition": 'filename="tez.pdf"' } });
});

export function installFilmApi() {
  const inner = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(href, "https://demo.local");
    if (url.pathname.startsWith("/api/")) {
      const method = (init?.method ?? "GET").toUpperCase();
      let body: any = {};
      if (typeof init?.body === "string") { try { body = JSON.parse(init.body); } catch { body = {}; } }
      // Kalite kontrolünde yapay zekâ incelemesi filmde çalışmaz: yalnızca kural tabanlı kontroller
      if (method === "POST" && /\/quality$/.test(url.pathname) && body.withAi) init = { ...init, body: JSON.stringify({ ...body, withAi: false }) };
      for (const [m, re, fn] of routes) {
        if (m !== method) continue;
        const match = url.pathname.match(re);
        if (!match) continue;
        const r = await fn(match, body, url, init);
        if (r) return r;
      }
    }
    return inner(input, init);
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
