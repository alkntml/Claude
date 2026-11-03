/**
 * Demo için tarayıcı içi API. Uygulamanın gerçek iş mantığını (yol haritası, belge modeli,
 * kalite kontrolü) kullanır; yalnızca sunucu gerektiren özellikler (yapay zekâ, canlı veri tabanı
 * araması, doğrulama, dışa aktarma) açık bir mesajla kapatılmıştır.
 */
import { citedIdsInOrder, docToPlain, wordCount, type JSONNode } from "@/lib/editor/doc";
import { runQualityChecks } from "@/lib/quality/checks";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { buildRoadmap, stageDef, type WorkType, type AcademicLevel, type Methodology } from "@/lib/workflows";

/* eslint-disable @typescript-eslint/no-explicit-any */
const KEY = "akademi-ai-demo-v1";
const now = () => new Date().toISOString();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const DEMO_DISABLED = {
  ai: "Demo sürümünde yapay zekâ asistanı kapalıdır. API anahtarı güvenlik nedeniyle tarayıcıya konamaz. Tam sürümde bu bölümde Claude ile çalışırsınız: taslak yazma, genişletme, literatür sentezi, hipotez önerisi.",
  search: "Demo sürümünde canlı veri tabanı araması kapalıdır (tarayıcı güvenlik kısıtı). Aşağıda künyeleri gerçek olan ÖRNEK kayıtlar gösteriliyor. Tam sürüm OpenAlex, Crossref, Semantic Scholar, PubMed, arXiv, DOAJ ve OpenAIRE'de arar.",
  verify: "Demo sürümünde DOI doğrulaması yapılamaz. Tam sürümde Crossref/DataCite/PubMed üzerinden doğrulanır.",
  export: "Demo sürümünde dosya indirme kapalıdır. Tam sürümde DOCX, PDF, Markdown ve TXT olarak indirilir.",
  files: "Demo sürümünde dosya yükleme kapalıdır.",
  share: "Demo sürümünde paylaşım bağlantısı oluşturulamaz.",
};

// Künyeleri gerçek, iyi bilinen eserler (özetleri eklenmemiştir: erişim seviyesi "yalnızca künye").
const SAMPLE_RECORDS: any[] = [
  { type: "article-journal", title: "Relationship obsessive compulsive disorder (ROCD): A conceptual framework", authors: [{ family: "Doron", given: "Guy" }, { family: "Derby", given: "Danny S." }, { family: "Szepsenwol", given: "Ohad" }], year: 2014, containerTitle: "Journal of Obsessive-Compulsive and Related Disorders", volume: "3", issue: "2", pages: "169-180", doi: "10.1016/j.jocrd.2013.12.005", tags: "relationship obsessive compulsive rocd okb ilişki" },
  { type: "book", title: "Attachment and loss: Vol. 1. Attachment", authors: [{ family: "Bowlby", given: "John" }], year: 1969, publisher: "Basic Books", tags: "attachment bağlanma" },
  { type: "article-journal", title: "The influence of parenting style on adolescent competence and substance use", authors: [{ family: "Baumrind", given: "Diana" }], year: 1991, containerTitle: "Journal of Early Adolescence", volume: "11", issue: "1", pages: "56-95", doi: "10.1177/0272431691111004", tags: "parenting style ebeveyn tutum" },
  { type: "article-journal", title: "Romantic love conceptualized as an attachment process", authors: [{ family: "Hazan", given: "Cindy" }, { family: "Shaver", given: "Phillip" }], year: 1987, containerTitle: "Journal of Personality and Social Psychology", volume: "52", issue: "3", pages: "511-524", doi: "10.1037/0022-3514.52.3.511", tags: "romantic love attachment relationship ilişki bağlanma" },
  { type: "article-journal", title: "A cognitive theory of obsessions", authors: [{ family: "Rachman", given: "S." }], year: 1997, containerTitle: "Behaviour Research and Therapy", volume: "35", issue: "9", pages: "793-802", doi: "10.1016/S0005-7967(97)00040-5", tags: "obsessions cognitive obsesif okb" },
  { type: "article-journal", title: "Obsessional-compulsive problems: A cognitive-behavioural analysis", authors: [{ family: "Salkovskis", given: "Paul M." }], year: 1985, containerTitle: "Behaviour Research and Therapy", volume: "23", issue: "5", pages: "571-583", doi: "10.1016/0005-7967(85)90105-6", tags: "obsessional compulsive cognitive obsesif kompulsif okb" },
  { type: "book", title: "Revised NEO Personality Inventory (NEO PI-R) and NEO Five-Factor Inventory (NEO-FFI) professional manual", authors: [{ family: "Costa", given: "Paul T." }, { family: "McCrae", given: "Robert R." }], year: 1992, publisher: "Psychological Assessment Resources", tags: "personality five factor kişilik beş faktör" },
  { type: "book", title: "Attachment in adulthood: Structure, dynamics, and change", authors: [{ family: "Mikulincer", given: "Mario" }, { family: "Shaver", given: "Phillip R." }], year: 2007, publisher: "Guilford Press", tags: "attachment adulthood bağlanma yetişkin" },
].map((r) => ({ ...r, accessLevel: "metadata", origins: ["demo"], abstract: null }));

function rowFromRecord(r: any, projectId: string) {
  return {
    id: uid(), project_id: projectId, user_id: "demo", type: r.type, title: r.title, authors: r.authors ?? [], year: r.year ?? null, month: null,
    container_title: r.containerTitle ?? null, volume: r.volume ?? null, issue: r.issue ?? null, pages: r.pages ?? null, publisher: r.publisher ?? null,
    publisher_place: null, edition: null, doi: r.doi ?? null, pmid: null, pmcid: null, arxiv_id: null, isbn: null, url: r.url ?? null, oa_url: null,
    abstract: r.abstract ?? null, access_level: r.abstract ? "abstract" : "metadata", verified: false, verification: { status: "demo", message: DEMO_DISABLED.verify },
    origin: (r.origins ?? ["manual"])[0], fulltext_status: "none", relevance_note: "", created_at: now(),
  };
}

const t = (text: string, marks?: string[]) => ({ type: "text", text, ...(marks ? { marks: marks.map((m) => ({ type: m })) } : {}) });
const p = (...content: any[]) => ({ type: "paragraph", content });
const h = (level: number, text: string) => ({ type: "heading", attrs: { level }, content: [t(text)] });
const cite = (ids: string[], locator: string | null = null, narrative = false) => ({ type: "citation", attrs: { ids, locator, narrative } });

interface DB { projects: any[]; stages: any[]; sources: any[]; memory: any[]; comments: any[]; revisions: any[]; reports: any[]; feedback: any[] }

function seed(): DB {
  const projectId = uid();
  const project = { id: projectId, user_id: "demo", title: "Kişilik Özellikleri, Ebeveyn Tutumları ve İlişki Odaklı Obsesif Kompulsif Belirtiler", work_type: "thesis", academic_level: "master", discipline: "Klinik Psikoloji", language: "tr", citation_style: "apa7", status: "active", topic: "Üniversite öğrencilerinde algılanan ebeveyn tutumları ile ilişki odaklı obsesif kompulsif belirtiler arasındaki ilişkide kişilik özelliklerinin aracı rolü", keywords: ["ilişki odaklı OKB", "ebeveyn tutumları", "beş faktör kişilik", "bağlanma"], context: { methodology: "quantitative", university: "Örnek Üniversitesi Sosyal Bilimler Enstitüsü" }, progress: 0, guideline_file_id: null, created_at: now(), updated_at: now(), last_opened_at: now() };
  const sources = SAMPLE_RECORDS.slice(0, 5).map((r) => rowFromRecord(r, projectId));
  const [doron, bowlby, baumrind, hazan, rachman] = sources.map((s) => s.id);
  const contents: Record<string, any> = {
    topic: { type: "doc", content: [p(t("Bu çalışma, üniversite öğrencilerinde algılanan ebeveyn tutumları ile ilişki odaklı obsesif kompulsif belirtiler arasındaki ilişkide kişilik özelliklerinin aracı rolünü incelemeyi amaçlamaktadır. Konu, romantik ilişkilere yönelik yineleyici şüphelerin klinik önemi ve bu belirtilerin gelişimsel kökenlerine ilişkin sınırlı bilgi nedeniyle seçilmiştir."))] },
    problem: { type: "doc", content: [p(t("İlişki odaklı obsesif kompulsif belirtiler, kişinin partnerine ya da ilişkinin kendisine yönelik istenmeyen, rahatsız edici düşünceleri ve bunlara eşlik eden kontrol davranışlarını kapsar "), cite([doron]), t(". Ebeveyn tutumlarının ergen gelişimi üzerindeki etkileri uzun süredir incelenmektedir "), cite([baumrind]), t("; ancak bu tutumların ilişki odaklı belirtilerle bağlantısı ve kişilik özelliklerinin bu bağlantıdaki rolü yeterince araştırılmamıştır."))] },
    purpose: { type: "doc", content: [p(t("Araştırmanın genel amacı, algılanan ebeveyn tutumlarının ilişki odaklı obsesif kompulsif belirtileri yordayıp yordamadığını ve bu ilişkide beş faktör kişilik özelliklerinin aracı rolünü belirlemektir."))] },
    questions: { type: "doc", content: [p(t("H1:", ["bold"]), t(" Algılanan aşırı koruyucu ebeveyn tutumu, ilişki odaklı obsesif kompulsif belirtilerle pozitif yönde ilişkilidir.")), p(t("H2:", ["bold"]), t(" Nevrotiklik, algılanan ebeveyn tutumları ile ilişki odaklı obsesif kompulsif belirtiler arasındaki ilişkide aracı rol oynar."))] },
    concepts: { type: "doc", content: [
      h(2, "Bağlanma"),
      p(t("Bağlanma kuramı, erken dönemde bakım verenle kurulan ilişkinin sonraki yakın ilişkilerin zihinsel temsillerini şekillendirdiğini öne sürer "), cite([bowlby]), t(". Yetişkin romantik ilişkilerinin de bir bağlanma süreci olarak ele alınabileceği gösterilmiştir "), cite([hazan]), t(".")),
      h(2, "İlişki odaklı obsesif kompulsif belirtiler"),
      p(cite([doron], null, true), t(" ilişki odaklı belirtileri iki temel boyutta ele almıştır: ilişkinin kendisine odaklanan ve partnere odaklanan belirtiler. Bilişsel kuram açısından obsesyonların sürmesinde, istenmeyen düşüncelere yüklenen anlamın belirleyici olduğu ileri sürülmüştür "), cite([rachman]), t(". Türkiye örneklemine ilişkin çalışmalar literatür taraması bölümünde ayrıca ele alınacaktır.")),
    ] },
  };
  const stages = buildRoadmap({ workType: "thesis", level: "master", methodology: "quantitative" }).map((r, i) => {
    const content = contents[r.key] ?? null;
    const text = content ? docToPlain(content) : "";
    return { id: uid(), project_id: projectId, user_id: "demo", key: r.key, title: r.title, description: r.description, position: i, status: content ? (r.key === "concepts" ? "in_progress" : "done") : "not_started", content, content_text: text, word_count: wordCount(text), updated_at: now(), created_at: now() };
  });
  const db: DB = { projects: [project], stages, sources, memory: [
    { id: uid(), project_id: projectId, kind: "fact", content: `Araştırma konusu: ${project.topic}`, source: "user", created_at: now() },
    { id: uid(), project_id: projectId, kind: "decision", content: "Örneklem: 18–30 yaş arası, romantik ilişkisi olan üniversite öğrencileri", source: "user", created_at: now() },
    { id: uid(), project_id: projectId, kind: "variable", content: "Aracı değişken: Nevrotiklik (beş faktör modeli)", source: "ai", created_at: now() },
  ], comments: [], revisions: [], reports: [], feedback: [] };
  recomputeProgress(db, projectId);
  return db;
}

let db: DB;
function load(): DB {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch { /* depolama kapalı olabilir */ }
  return seed();
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* yoksay */ } }
export function resetDemo() { db = seed(); persist(); emit(); }

const subs = new Set<() => void>();
let version = 0;
function emit() { version++; subs.forEach((s) => s()); }
export function subscribe(cb: () => void) { subs.add(cb); return () => { subs.delete(cb); }; }
export function getVersion() { return version; }
export function getDB() { return db; }

function recomputeProgress(d: DB, projectId: string) {
  const list = d.stages.filter((s) => s.project_id === projectId && s.key !== "references");
  const score = list.reduce((a, x) => a + (x.status === "done" ? 1 : x.status === "review" ? 0.75 : x.status === "in_progress" ? 0.35 : 0), 0);
  const pr = d.projects.find((x) => x.id === projectId);
  if (pr) { pr.progress = list.length ? Math.round((score / list.length) * 100) : 0; pr.updated_at = now(); }
  return pr?.progress ?? 0;
}

class HttpErr extends Error { constructor(public status: number, msg: string, public code?: string) { super(msg); } }
const fail = (status: number, msg: string, code = "demo_disabled") => { throw new HttpErr(status, msg, code); };

type Handler = (m: RegExpMatchArray, body: any, url: URL) => any;
const routes: [string, RegExp, Handler][] = [];
const on = (method: string, pattern: string, fn: Handler) => routes.push([method, new RegExp(`^${pattern}$`), fn]);

// --- Projeler
on("GET", "/api/projects", () => ({ projects: db.projects }));
on("GET", "/api/account/plans", () => ({ current: "free", email: "demo@akademi.ai", plans: [
  { id: "free", name: "Ücretsiz", price_monthly: 0, limits: { ai_requests_month: 10, source_searches_month: 7, projects: 1, storage_mb: 50 } },
  { id: "basic", name: "Basic", price_monthly: 749, limits: { ai_requests_month: 40, source_searches_month: 100, projects: 3, storage_mb: 500 } },
  { id: "pro", name: "Pro", price_monthly: 1349, limits: { ai_requests_month: 75, source_searches_month: 2000, projects: 10, storage_mb: 3000 } },
  { id: "premium", name: "Premium", price_monthly: 2249, limits: { ai_requests_month: 125, source_searches_month: 8000, projects: null, storage_mb: 15000 } },
] }));
on("POST", "/api/projects", (_m, b) => {
  const project = { id: uid(), user_id: "demo", title: b.title, work_type: b.workType, academic_level: b.level, discipline: b.discipline ?? "", language: b.language ?? "tr", citation_style: b.citationStyle ?? "apa7", status: "active", topic: b.topic ?? "", keywords: b.keywords ?? [], context: { methodology: b.methodology, university: b.university }, progress: 0, created_at: now(), updated_at: now(), last_opened_at: now() };
  db.projects.unshift(project);
  buildRoadmap({ workType: b.workType as WorkType, level: b.level as AcademicLevel, methodology: b.methodology as Methodology }).forEach((r, i) => db.stages.push({ id: uid(), project_id: project.id, user_id: "demo", key: r.key, title: r.title, description: r.description, position: i, status: "not_started", content: null, content_text: "", word_count: 0, updated_at: now(), created_at: now() }));
  if (b.topic) db.memory.push({ id: uid(), project_id: project.id, kind: "fact", content: `Araştırma konusu: ${b.topic}`, source: "user", created_at: now() });
  return { project };
});
const proj = (id: string) => db.projects.find((x) => x.id === id) ?? fail(404, "Proje bulunamadı", "not_found");
on("GET", "/api/projects/([^/]+)", (m) => ({ project: proj(m[1]) }));
// Demo: bölüm kontrolü (yalnızca basit kurallar; gerçek sürümde yapay zekâ incelemesi de yapılır)
on("POST", "/api/stages/([^/]+)/review", (m) => {
  const st = db.stages.find((x: any) => x.id === m[1]) ?? fail(404, "Bölüm bulunamadı", "not_found");
  const text = String(st.content_text ?? "");
  const words = (text.match(/[\p{L}\p{N}]+/gu) ?? []).length;
  const issues: any[] = [];
  if ((text.match(/\[KAYNAK GEREKLİ\]/g) ?? []).length) issues.push({ severity: "error", title: "Kaynak bekleyen iddialar", detail: "Bölümde “[KAYNAK GEREKLİ]” var.", fix: "Kaynak bul ve düzelt ile tamamlayın.", source: "rule" });
  if (words < 150) issues.push({ severity: "warning", title: "Kısa bölüm", detail: `Bölüm ${words} kelime.`, fix: "Bölümün amacındaki alt konuları genişletin.", source: "rule" });
  return { review: { verdict: issues.some((i) => i.severity === "error") ? "major" : issues.length ? "minor" : "ok", summary: "Demo: yapay zekâ incelemesi tam sürümde yapılır.", strengths: words >= 150 ? ["Bölüm kaynaklarla desteklenmiş."] : [], issues, aiRun: false, aiRan: false }, aiError: null };
});
// Demo: gerçek yapay zekâ çağrısı yerine örnek başlık önerileri
on("POST", "/api/projects/([^/]+)/titles", (m) => {
  const p = proj(m[1]);
  const base = (p.topic || p.title || "Araştırma konusu").replace(/\s+/g, " ").trim().slice(0, 80);
  return { titles: [
    { title: `${base}: Bir İnceleme`, note: "Demo önerisi: konuyu genel çerçevede ele alır." },
    { title: `${base} Üzerine Nicel Bir Araştırma`, note: "Demo önerisi: yöntemi başlıkta öne çıkarır." },
    { title: `${base}: Üniversite Öğrencileri Örneği`, note: "Demo önerisi: örneklemle daraltır." },
  ] };
});
on("PATCH", "/api/projects/([^/]+)", (m, b) => {
  const pr = proj(m[1]);
  const map: Record<string, string> = { citationStyle: "citation_style", academicLevel: "academic_level" };
  for (const [k, v] of Object.entries(b)) { if (k === "context") pr.context = { ...pr.context, ...(v as object) }; else pr[map[k] ?? k] = v; }
  pr.updated_at = now();
  return { project: pr };
});
on("DELETE", "/api/projects/([^/]+)", (m) => { db.projects = db.projects.filter((x) => x.id !== m[1]); db.stages = db.stages.filter((x) => x.project_id !== m[1]); return { ok: true }; });

// --- Aşamalar
on("POST", "/api/projects/([^/]+)/stages", (m, b) => {
  const list = db.stages.filter((s) => s.project_id === m[1]).sort((a, c) => a.position - c.position);
  const pos = b.afterPosition === undefined ? list.length : b.afterPosition + 1;
  list.filter((s) => s.position >= pos).forEach((s) => s.position++);
  const lib = b.libraryKey ? stageDef(b.libraryKey) : undefined;
  let key = lib ? b.libraryKey : `custom_${Date.now().toString(36)}`;
  if (list.some((s) => s.key === key)) key = `${key}_${Date.now().toString(36)}`;
  const st = { id: uid(), project_id: m[1], user_id: "demo", key, title: b.title, description: b.description || lib?.purpose || "", position: pos, status: "not_started", content: null, content_text: "", word_count: 0, updated_at: now(), created_at: now() };
  db.stages.push(st);
  return { stage: st };
});
on("PUT", "/api/projects/([^/]+)/stages", (_m, b) => { (b.order as string[]).forEach((id, i) => { const s = db.stages.find((x) => x.id === id); if (s) s.position = i; }); return { ok: true }; });
const stage = (id: string) => db.stages.find((x) => x.id === id) ?? fail(404, "Bölüm bulunamadı", "not_found");
on("PATCH", "/api/stages/([^/]+)", (m, b) => {
  const s = stage(m[1]);
  if (b.title) s.title = b.title;
  if (b.status) s.status = b.status;
  if (b.content) {
    s.content = b.content; s.content_text = docToPlain(b.content as JSONNode); s.word_count = wordCount(s.content_text);
    if (s.status === "not_started" && !b.status && s.content_text) s.status = "in_progress";
  }
  s.updated_at = now();
  if (b.snapshot) db.revisions.unshift({ id: uid(), stage_id: s.id, content: s.content, content_text: s.content_text, word_count: s.word_count, note: b.snapshot.note, author: b.snapshot.author, created_at: now() });
  return { stage: s, progress: recomputeProgress(db, s.project_id) };
});
on("DELETE", "/api/stages/([^/]+)", (m) => { const s = stage(m[1]); db.stages = db.stages.filter((x) => x.id !== m[1]); recomputeProgress(db, s.project_id); return { ok: true }; });
on("GET", "/api/stages/([^/]+)/revisions", (m) => ({ revisions: db.revisions.filter((r) => r.stage_id === m[1]) }));
on("DELETE", "/api/stages/([^/]+)/revisions", (_m, b) => { db.revisions = db.revisions.filter((r) => r.id !== b.revisionId); return { ok: true }; });
on("POST", "/api/stages/([^/]+)/revisions", (m, b) => {
  const s = stage(m[1]);
  const r = db.revisions.find((x) => x.id === b.revisionId) ?? fail(404, "Revizyon bulunamadı", "not_found");
  db.revisions.unshift({ id: uid(), stage_id: s.id, content: s.content, content_text: s.content_text, word_count: s.word_count, note: "Geri yükleme öncesi otomatik yedek", author: "system", created_at: now() });
  Object.assign(s, { content: r.content, content_text: r.content_text, word_count: r.word_count, updated_at: now() });
  return { stage: s };
});
on("GET", "/api/stages/([^/]+)/comments", (m) => ({ comments: db.comments.filter((c) => c.stage_id === m[1]) }));
on("POST", "/api/stages/([^/]+)/comments", (m, b) => { const c = { id: uid(), stage_id: m[1], body: b.body, quote: b.quote ?? "", resolved: false, created_at: now() }; db.comments.push(c); return { comment: c }; });
on("PATCH", "/api/stages/([^/]+)/comments", (_m, b) => { if (b.delete) db.comments = db.comments.filter((c) => c.id !== b.commentId); else { const c = db.comments.find((x) => x.id === b.commentId); if (c) c.resolved = !!b.resolved; } return { ok: true }; });

// --- Hafıza
on("GET", "/api/projects/([^/]+)/memory", (m) => ({ memory: db.memory.filter((x) => x.project_id === m[1]) }));
on("POST", "/api/projects/([^/]+)/memory", (m, b) => { const it = { id: uid(), project_id: m[1], kind: b.kind, content: b.content, source: "user", created_at: now() }; db.memory.push(it); return { item: it }; });
on("DELETE", "/api/projects/([^/]+)/memory", (_m, b) => { db.memory = db.memory.filter((x) => x.id !== b.itemId); return { ok: true }; });

// --- Kaynaklar
on("POST", "/api/sources/search", (_m, b) => {
  const q = String(b.query ?? "").toLocaleLowerCase("tr").split(/\s+/).filter((w) => w.length > 2);
  const results = SAMPLE_RECORDS.filter((r) => !q.length || q.some((w) => `${r.title} ${r.tags}`.toLocaleLowerCase("tr").includes(w)));
  return { results: results.length ? results : SAMPLE_RECORDS, providers: [{ provider: "demo", ok: false, count: 0, error: DEMO_DISABLED.search, ms: 0 }], demoNotice: DEMO_DISABLED.search };
});
on("POST", "/api/projects/([^/]+)/sources", (m, b) => {
  const have = new Set(db.sources.filter((s) => s.project_id === m[1] && s.doi).map((s) => s.doi.toLowerCase()));
  const rows = (b.sources as any[]).filter((r) => !r.doi || !have.has(String(r.doi).toLowerCase())).map((r) => rowFromRecord(r, m[1]));
  db.sources.push(...rows);
  return { sources: rows, skipped: b.sources.length - rows.length };
});
on("GET", "/api/sources/([^/]+)", (m) => ({ source: db.sources.find((s) => s.id === m[1]) ?? fail(404, "Kaynak bulunamadı", "not_found") }));
on("DELETE", "/api/sources/([^/]+)", (m) => { db.sources = db.sources.filter((s) => s.id !== m[1]); return { ok: true }; });
on("POST", "/api/sources/([^/]+)/verify", () => fail(503, DEMO_DISABLED.verify));
on("POST", "/api/sources/([^/]+)/fulltext", () => fail(503, "Demo sürümünde tam metin indirilemez. Tam sürümde açık erişimli tam metin arka planda analiz edilir."));
on("GET", "/api/sources/lookup", () => fail(503, DEMO_DISABLED.verify));

// --- Yapay zekâ (kapalı)
on("POST", "/api/ai/chat", () => fail(503, DEMO_DISABLED.ai));
on("GET", "/api/ai/chat", () => ({ conversations: [], messages: [] }));
on("DELETE", "/api/ai/chat", () => ({ ok: true }));
on("POST", "/api/ai/research", () => fail(503, DEMO_DISABLED.ai));
on("POST", "/api/projects/([^/]+)/stages/suggest", () => fail(503, DEMO_DISABLED.ai));

// --- Kalite kontrol (gerçek kural tabanlı kontroller çalışır)
on("GET", "/api/projects/([^/]+)/quality", (m) => ({ report: db.reports.find((r) => r.project_id === m[1]) ?? null }));
on("POST", "/api/projects/([^/]+)/quality", (m, b) => {
  const pr = proj(m[1]);
  const stages = db.stages.filter((s) => s.project_id === m[1]).sort((a, c) => a.position - c.position).map((s) => {
    const def = stageDef(s.key);
    return { key: s.key, title: s.title, text: s.content_text ?? "", citedIds: citedIdsInOrder([s.content]), needsLiterature: def?.needsLiterature, requiresUserData: def?.requiresUserData, generated: !!def?.generated };
  });
  const sources = db.sources.filter((s) => s.project_id === m[1]).map((r) => ({ ...sourceRowToItemClient(r), verified: r.verified, accessLevel: r.access_level }));
  const report = runQualityChecks(stages, sources, { language: pr.language });
  const row = { id: uid(), project_id: m[1], score: report.score, report: { ...report, aiReview: b.withAi ? { ran: false, error: DEMO_DISABLED.ai } : { ran: false } }, created_at: now() };
  db.reports = [row, ...db.reports.filter((r) => r.project_id !== m[1])];
  return { report: row };
});

// --- Diğer
on("GET", "/api/projects/([^/]+)/export", () => fail(503, DEMO_DISABLED.export));
on("GET", "/api/projects/([^/]+)/shares", () => ({ shares: [] }));
on("POST", "/api/projects/([^/]+)/shares", () => fail(503, DEMO_DISABLED.share));
on("GET", "/api/files", () => ({ files: [] }));
on("POST", "/api/files", () => fail(503, DEMO_DISABLED.files));
on("POST", "/api/feedback", (_m, b) => { db.feedback.push({ ...b, created_at: now() }); return { ok: true }; });
on("PATCH", "/api/account", () => ({ ok: true }));
on("GET", "/api/account/growth", () => ({ referral: { code: "DEMO1234", link: "https://www.academiana.com.tr/davet/DEMO1234", invited: 2, rewarded: 1, reward: { ai_requests: 50, source_searches: 50, valid_days: 60 } }, credits: { ai_requests: 0, source_searches: 0 }, org: null, personalPlan: "pro" }));
on("GET", "/api/admin/users-list", () => ({ rows: adminRows("users").map((u: Record<string, unknown>) => ({ ...u, plan_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(), work_locked: false })), count: 1, page: 0 }));
on("GET", "/api/admin/user/([^/]+)", () => ({ profile: { id: "demo", email: "demo@akademi.ai", full_name: "Demo Kullanıcı", plan_id: "pro", plan_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(), work_locked: false, created_at: new Date().toISOString() }, usage: { ai_requests: 31, tokens: 410000, source_searches: 120, projects: 2, storage_mb: 12, cost_usd: 2.1 }, limits: { ai_requests_month: 75, tokens_month: 60000000, source_searches_month: 2000, projects: 10, storage_mb: 3000 }, reasons: [], projects: [{ id: "p1", title: "Elektrikli araç bataryaları", status: "active", updated_at: new Date().toISOString() }], credits: [], passes: [], org: null, plan: { name: "Pro", price_monthly: 899 }, money: { revenue_try: 749, cost_try: 101, cost_share: 13 } }));
on("GET", "/api/admin/stats", () => adminStats());
on("GET", "/api/admin/([a-z]+)", (m) => ({ rows: adminRows(m[1]), count: adminRows(m[1]).length, page: 0 }));
on("PATCH", "/api/admin/([a-z]+)", () => fail(503, "Demo sürümünde yönetici değişiklikleri kaydedilmez."));
on("POST", "/api/admin/([a-z]+)", () => fail(503, "Demo sürümünde yönetici değişiklikleri kaydedilmez."));

function adminStats() {
  // ÖRNEK veriler: demo yönetici panelini göstermek içindir, gerçek kullanım değildir.
  const byDay = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400_000).toISOString().slice(0, 10);
    const ai = Math.round(40 + 25 * Math.sin(i / 3) + i * 2.2);
    return { day: d, ai, search: Math.round(ai * 0.7), tokens: ai * 5200, cost: Math.round(ai * 0.031 * 100) / 100 };
  });
  const ai = byDay.reduce((a, d) => a + d.ai, 0);
  return {
    days: 30, users: 128, newUsers: 23, projects: 214, errors: 3, openFeedback: 4,
    totals: { ai, search: byDay.reduce((a, d) => a + d.search, 0), exports: 96, uploads: 41, tokens: ai * 5200, cost: Math.round(byDay.reduce((a, d) => a + d.cost, 0) * 100) / 100 },
    byDay, byModel: { "claude-opus-5-5": { requests: Math.round(ai * 0.35), tokens: ai * 2600, cost: 41.2 }, "claude-sonnet-5-5": { requests: Math.round(ai * 0.4), tokens: ai * 2000, cost: 14.6 }, "claude-haiku-5-5": { requests: Math.round(ai * 0.25), tokens: ai * 600, cost: 0.7 } },
    providerHealth: { openalex: { ok: 412, fail: 3 }, crossref: { ok: 405, fail: 9 }, semantic_scholar: { ok: 361, fail: 44 }, europepmc: { ok: 398, fail: 2 }, arxiv: { ok: 401, fail: 6 } },
    planDist: { free: 92, basic: 21, pro: 12, premium: 3 },
    money: { paidUsers: 36, revenueTry: 21540, costTry: 5980, profitTry: 15560, costShare: 28, usdTry: 48 },
    expiring: [{ id: "x", email: "ornek@uni.edu.tr", full_name: "Örnek Kullanıcı", plan_id: "pro", plan_expires_at: new Date(Date.now() + 3 * 86400000).toISOString() }],
    locked: 4,
    integrations: { supabase: true, supabaseServiceRole: true, anthropic: true, openai: false, contactEmail: true, semanticScholarKey: false, coreKey: false, stripe: false, iyzico: false },
    payments: [{ id: "stripe", label: "Stripe (uluslararası kartlar)", configured: false, implemented: true, usable: false }, { id: "iyzico", label: "iyzico (Türkiye)", configured: false, implemented: false, usable: false }],
  };
}
function adminRows(resource: string): any[] {
  if (resource === "plans") return DEMO_PLANS.map((pl, i) => ({ ...pl, is_active: true, sort_order: i, limits: [{ ai_requests_month: 30, tokens_month: 60000, source_searches_month: 40, projects: 1, storage_mb: 50, export_formats: ["txt", "md"] }, { ai_requests_month: 300, tokens_month: 800000, source_searches_month: 400, projects: 5, storage_mb: 500, export_formats: ["txt", "md", "docx", "pdf"] }, { ai_requests_month: 1500, tokens_month: 4000000, source_searches_month: 2000, projects: 20, storage_mb: 3000, export_formats: ["txt", "md", "docx", "pdf"] }, { ai_requests_month: 5000, tokens_month: 15000000, source_searches_month: 8000, projects: null, storage_mb: 15000, export_formats: ["txt", "md", "docx", "pdf"] }][i] }));
  if (resource === "users") return [{ id: "demo", email: "demo@akademi.ai", full_name: "Demo Kullanıcı", role: "admin", plan_id: "pro", is_suspended: false, created_at: now() }];
  if (resource === "settings") return [
    { key: "ai.models", value: { default: { provider: "anthropic", model: "claude-opus-5-5" }, balanced: { provider: "anthropic", model: "claude-sonnet-5-5" }, fast: { provider: "anthropic", model: "claude-haiku-5-5" }, premium: { provider: "anthropic", model: "claude-opus-5-5" }, plan_tiers: { free: "fast", basic: "balanced", pro: "default", premium: "premium" }, max_output_tokens: 16000, effort: "medium" } },
    { key: "ai.system_prompt", value: { text: "Sen titiz, dürüst ve deneyimli bir akademik danışmansın… Asla kaynak, veri veya bulgu uydurma." } },
    { key: "ai.stage_prompts", value: {} },
    { key: "sources.enabled", value: { openalex: true, crossref: true, semantic_scholar: true, europepmc: true, arxiv: true, doaj: true, core: false, openaire: true, google_books: false, unpaywall: true } },
    { key: "limits.rate", value: { ai_per_minute: 12, search_per_minute: 30 } },
  ];
  return [];
}

export const DEMO_PLANS = [
  { id: "free", name: "Ücretsiz", description: "Platformu tanımak için sınırlı kullanım.", price_monthly: 0, price_yearly: 0, currency: "TRY", features: ["1 proje", "Aylık 7 kaynak taraması", "Bölüm bölüm yapay zekâ yazım asistanı", "Türk ve uluslararası veri tabanlarında gerçek kaynak arama", "9 atıf stili ve otomatik kaynakça", "Başlık önerisi ve bölüm kontrolü", "TXT / Markdown dışa aktarma"] },
  { id: "basic", name: "Basic", description: "Bireysel öğrenciler için temel akademik çalışma.", price_monthly: 749, price_yearly: 7490, currency: "TRY", features: ["Ücretsiz paketteki her şey", "3 proje", "Aylık 100 kaynak taraması", "Word / PDF dışa aktarma", "Yapay zekâ destekli kalite raporu", "İstatistik analizleri ve grafikler", "Anket oluşturucu", "Tez konusu bulma", "Zotero / Mendeley / EndNote aktarımı"] },
  { id: "pro", name: "Pro", description: "Gelişmiş araştırma, kaynak analizi ve yüksek limitler.", price_monthly: 1349, price_yearly: 13490, currency: "TRY", features: ["Basic paketteki her şey", "10 proje", "Aylık 2.000 kaynak taraması", "Literatür matrisi", "Dergi önerisi ve dergi kılavuzu kontrolü", "Yazım kılavuzu yükleme", "Hakem yorumlarına cevap asistanı", "Savunma sunumu ve savunma provası"] },
  { id: "premium", name: "Premium", description: "Yoğun çalışan lisansüstü öğrenciler ve araştırmacılar için.", price_monthly: 2249, price_yearly: 22490, currency: "TRY", features: ["Pro paketteki her şey", "Sınırsız proje", "Aylık 8.000 kaynak taraması", "En yüksek yapay zekâ kullanım hakkı", "15 GB depolama", "Öncelikli destek"] },
];

export function installMockApi() {
  db = load();
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(href, "https://demo.local");
    if (!url.pathname.startsWith("/api/")) return original(input, init);
    const method = (init?.method ?? "GET").toUpperCase();
    let body: any = undefined;
    if (typeof init?.body === "string") { try { body = JSON.parse(init.body); } catch { body = undefined; } }
    await new Promise((r) => setTimeout(r, 120)); // ağ gecikmesi hissi
    for (const [m, re, fn] of routes) {
      if (m !== method) continue;
      const match = url.pathname.match(re);
      if (!match) continue;
      try {
        const out = fn(match, body ?? {}, url);
        persist();
        emit();
        return new Response(JSON.stringify(out), { status: 200, headers: { "content-type": "application/json" } });
      } catch (e) {
        const err = e instanceof HttpErr ? e : new HttpErr(500, (e as Error).message);
        return new Response(JSON.stringify({ error: err.message, code: err.code }), { status: err.status, headers: { "content-type": "application/json" } });
      }
    }
    return new Response(JSON.stringify({ error: "Demo: bu işlem desteklenmiyor" }), { status: 404, headers: { "content-type": "application/json" } });
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
