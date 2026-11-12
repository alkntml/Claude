/**
 * Sistematik derleme (PRISMA 2020) modülü — saf kurallar (D122). Kayıtların aşamaları, yinelenen tespiti,
 * akış şeması sayıları ve PRISMA 2020 akış şemasının SVG çizimi. Sunucu, istemci ve testler ortak kullanır.
 * Yapay zekâ eleme kararı vermez; yalnızca öneri sunar. Kararı kullanıcı verir ve gerekçesi kaydedilir.
 */
export type ReviewStage = "identified" | "duplicate" | "excluded_screening" | "sought" | "not_retrieved" | "excluded_eligibility" | "included";
export const REVIEW_STAGES: ReviewStage[] = ["identified", "duplicate", "excluded_screening", "sought", "not_retrieved", "excluded_eligibility", "included"];

export interface ReviewRecordData {
  title: string;
  authors?: { family?: string; given?: string; literal?: string }[];
  year?: number | null;
  containerTitle?: string | null;
  doi?: string | null;
  url?: string | null;
  abstract?: string | null;
  type?: string;
  volume?: string | null; issue?: string | null; pages?: string | null; publisher?: string | null; pmid?: string | null; arxivId?: string | null; isbn?: string | null;
}
export interface ReviewRecord { id: string; key: string; origin: string; stage: ReviewStage; reason: string | null; record: ReviewRecordData; ai?: { decision: "include" | "exclude" | "unsure"; reason: string } | null; source_id?: string | null; votes?: Votes | null; extraction?: Extraction | null; appraisal?: Appraisal | null }

export interface ReviewProtocol {
  question: string;
  inclusion: string[];
  exclusion: string[];
  /** Veri tabanları ve arama ifadeleri (raporlama için) */
  searches: { database: string; query: string; date: string; results: number }[];
  /** Çift değerlendirici modu: her ekip üyesi bağımsız oy verir, uyum (kappa) raporlanır (D134) */
  dual?: boolean;
}
export const EMPTY_PROTOCOL: ReviewProtocol = { question: "", inclusion: [], exclusion: [], searches: [] };

/** Yinelenen tespiti anahtarı: DOI (küçük harf) yoksa sadeleştirilmiş başlık + yıl */
export function recordKey(r: { doi?: string | null; title: string; year?: number | null }): string {
  const doi = (r.doi ?? "").trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
  if (doi) return `doi:${doi}`;
  const t = r.title.toLocaleLowerCase("tr").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return `t:${t}|${r.year ?? ""}`;
}

export interface PrismaCounts {
  byOrigin: Record<string, number>;
  identified: number;
  duplicates: number;
  screened: number;
  excludedScreening: number;
  pendingScreening: number;
  sought: number;
  notRetrieved: number;
  assessed: number;
  pendingEligibility: number;
  excludedEligibility: Record<string, number>;
  excludedEligibilityTotal: number;
  included: number;
}

export function prismaCounts(records: Pick<ReviewRecord, "origin" | "stage" | "reason">[]): PrismaCounts {
  const n = (s: ReviewStage) => records.filter((r) => r.stage === s).length;
  const byOrigin: Record<string, number> = {};
  for (const r of records) byOrigin[r.origin] = (byOrigin[r.origin] ?? 0) + 1;
  const excludedEligibility: Record<string, number> = {};
  for (const r of records) if (r.stage === "excluded_eligibility") { const k = r.reason?.trim() || "Gerekçe belirtilmedi"; excludedEligibility[k] = (excludedEligibility[k] ?? 0) + 1; }
  const duplicates = n("duplicate");
  const sought = n("sought") + n("not_retrieved") + n("excluded_eligibility") + n("included");
  return {
    byOrigin, identified: records.length, duplicates, screened: records.length - duplicates,
    excludedScreening: n("excluded_screening"), pendingScreening: n("identified"),
    sought, notRetrieved: n("not_retrieved"), assessed: sought - n("not_retrieved"), pendingEligibility: n("sought"),
    excludedEligibility, excludedEligibilityTotal: n("excluded_eligibility"), included: n("included"),
  };
}

/** Bir kararın hangi aşamalardan verilebileceği (yanlışlıkla atlamayı önler) */
export function canMove(from: ReviewStage, to: ReviewStage): boolean {
  if (from === to) return true;
  const allowed: Record<ReviewStage, ReviewStage[]> = {
    identified: ["excluded_screening", "sought", "duplicate"],
    duplicate: ["identified"],
    excluded_screening: ["identified", "sought"],
    sought: ["identified", "not_retrieved", "excluded_eligibility", "included"],
    not_retrieved: ["sought", "excluded_eligibility", "included"],
    excluded_eligibility: ["sought", "included"],
    included: ["sought", "excluded_eligibility"],
  };
  return allowed[from].includes(to);
}

/* ---------------- PRISMA 2020 akış şeması (SVG) ---------------- */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(text: string, max: number): string[] {
  const out: string[] = []; let line = "";
  for (const w of text.split(/\s+/)) { if ((line + " " + w).trim().length > max) { if (line) out.push(line); line = w; } else line = (line + " " + w).trim(); }
  if (line) out.push(line);
  return out;
}
function box(x: number, y: number, w: number, h: number, lines: string[], bold = false): string {
  const tl = lines.map((l, i) => `<text x="${x + 10}" y="${y + 20 + i * 15}" font-size="12" ${bold && i === 0 ? 'font-weight="700"' : ""}>${esc(l)}</text>`).join("");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#1B1F33" stroke-width="1.2"/>${tl}`;
}
const arrow = (x1: number, y1: number, x2: number, y2: number) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1B1F33" stroke-width="1.2" marker-end="url(#a)"/>`;

export const PRISMA_LABELS = {
  tr: { title: "Veri tabanları ve kayıtlar yoluyla yeni çalışmaların belirlenmesi", ident: "Belirleme", screen: "Tarama", incl: "Dahil edilme",
    identified: "Belirlenen kayıtlar", removed: "Taramadan önce çıkarılan kayıtlar:", dup: "Yinelenen kayıtlar", screened: "Taranan kayıtlar", excluded: "Hariç tutulan kayıtlar",
    sought: "Tam metni aranan raporlar", notRet: "Erişilemeyen raporlar", assessed: "Uygunluğu değerlendirilen raporlar", exReasons: "Hariç tutulan raporlar:",
    included: "Derlemeye dahil edilen çalışmalar", pending: "Henüz karar verilmeyen" },
  en: { title: "Identification of new studies via databases and registers", ident: "Identification", screen: "Screening", incl: "Included",
    identified: "Records identified", removed: "Records removed before screening:", dup: "Duplicate records", screened: "Records screened", excluded: "Records excluded",
    sought: "Reports sought for retrieval", notRet: "Reports not retrieved", assessed: "Reports assessed for eligibility", exReasons: "Reports excluded:",
    included: "Studies included in review", pending: "Awaiting decision" },
  de: { title: "Identifikation neuer Studien über Datenbanken und Register", ident: "Identifikation", screen: "Screening", incl: "Eingeschlossen",
    identified: "Identifizierte Datensätze", removed: "Vor dem Screening entfernte Datensätze:", dup: "Dubletten", screened: "Gescreente Datensätze", excluded: "Ausgeschlossene Datensätze",
    sought: "Zur Beschaffung gesuchte Berichte", notRet: "Nicht beschaffte Berichte", assessed: "Auf Eignung geprüfte Berichte", exReasons: "Ausgeschlossene Berichte:",
    included: "In das Review eingeschlossene Studien", pending: "Entscheidung ausstehend" },
};

export function prismaSvg(c: PrismaCounts, lang: "tr" | "en" | "de" = "tr"): { svg: string; width: number; height: number } {
  const L = PRISMA_LABELS[lang];
  const W = 900, LX = 70, LW = 380, RX = 500, RW = 360;
  const origins = Object.entries(c.byOrigin).sort((a, b) => b[1] - a[1]);
  const idLines = [`${L.identified} (n = ${c.identified})`, ...origins.slice(0, 6).map(([o, k]) => `  ${o} (n = ${k})`)];
  const reasons = Object.entries(c.excludedEligibility).sort((a, b) => b[1] - a[1]);
  const reasonLines = [`${L.exReasons} (n = ${c.excludedEligibilityTotal})`, ...reasons.slice(0, 6).flatMap(([r, k]) => wrap(`${r} (n = ${k})`, 44).map((l, i) => (i ? `    ${l}` : `  ${l}`)))];
  const h1 = Math.max(70, 26 + idLines.length * 15);
  const y0 = 60, gap = 34;
  const y1 = y0 + h1 + gap, h2 = 60 + (c.pendingScreening ? 15 : 0);
  const y2 = y1 + h2 + gap, h3 = 50;
  const y3 = y2 + h3 + gap, h4 = 50 + (c.pendingEligibility ? 15 : 0);
  const hR = Math.max(h4, 26 + reasonLines.length * 15);
  const y4 = y3 + Math.max(h4, hR) + gap, h5 = 96; // yan şerit etiketi (“Dahil edilme”) sığsın
  const H = y4 + h5 + 30;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Times New Roman, serif" fill="#1B1F33">`,
    `<defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#1B1F33"/></marker></defs>`,
    `<rect width="${W}" height="${H}" fill="#fff"/>`,
    `<rect x="${LX}" y="12" width="${RX + RW - LX}" height="34" fill="#E8EDFB" stroke="#1B1F33" stroke-width="1"/><text x="${(LX + RX + RW) / 2}" y="34" font-size="13" font-weight="700" text-anchor="middle">${esc(L.title)}</text>`,
    // Yan şerit etiketleri
    ...[[L.ident, y0, h1], [L.screen, y1, y3 + Math.max(h4, hR) - y1], [L.incl, y4, h5]].map(([t, y, h]) => `<rect x="12" y="${y}" width="44" height="${h}" fill="#C7D3F5" stroke="#1B1F33" stroke-width="1"/><text transform="translate(39 ${Number(y) + Number(h) / 2}) rotate(-90)" font-size="12" font-weight="700" text-anchor="middle">${esc(String(t))}</text>`),
    box(LX, y0, LW, h1, idLines, true),
    box(RX, y0, RW, 60, [L.removed, `  ${L.dup} (n = ${c.duplicates})`]),
    arrow(LX + LW, y0 + 30, RX, y0 + 30),
    arrow(LX + LW / 2, y0 + h1, LX + LW / 2, y1),
    box(LX, y1, LW, h2, [`${L.screened} (n = ${c.screened})`, ...(c.pendingScreening ? [`${L.pending}: ${c.pendingScreening}`] : [])]),
    box(RX, y1, RW, 50, [`${L.excluded} (n = ${c.excludedScreening})`]),
    arrow(LX + LW, y1 + 25, RX, y1 + 25),
    arrow(LX + LW / 2, y1 + h2, LX + LW / 2, y2),
    box(LX, y2, LW, h3, [`${L.sought} (n = ${c.sought})`]),
    box(RX, y2, RW, 50, [`${L.notRet} (n = ${c.notRetrieved})`]),
    arrow(LX + LW, y2 + 25, RX, y2 + 25),
    arrow(LX + LW / 2, y2 + h3, LX + LW / 2, y3),
    box(LX, y3, LW, h4, [`${L.assessed} (n = ${c.assessed})`, ...(c.pendingEligibility ? [`${L.pending}: ${c.pendingEligibility}`] : [])]),
    box(RX, y3, RW, hR, reasonLines),
    arrow(LX + LW, y3 + 25, RX, y3 + 25),
    arrow(LX + LW / 2, y3 + Math.max(h4, hR) - (Math.max(h4, hR) - h4), LX + LW / 2, y4),
    box(LX, y4, LW, h5, [`${L.included} (n = ${c.included})`], true),
    `</svg>`,
  ];
  return { svg: parts.join(""), width: W, height: H };
}

/** Kayıtları CSV’ye çevirir (Excel uyumlu, noktalı virgül) */
export function reviewCsv(records: ReviewRecord[], stageLabel: (s: ReviewStage) => string): string {
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Başlık", "Yazarlar", "Yıl", "Dergi/Kaynak", "DOI", "Veri tabanı", "Aşama", "Gerekçe", "YZ önerisi", "YZ gerekçesi"];
  const rows = records.map((r) => [r.record.title, (r.record.authors ?? []).map((a) => a.literal ?? [a.family, a.given].filter(Boolean).join(", ")).join("; "), r.record.year ?? "", r.record.containerTitle ?? "", r.record.doi ?? "", r.origin, stageLabel(r.stage), r.reason ?? "", r.ai?.decision ?? "", r.ai?.reason ?? ""]);
  return "﻿" + [head, ...rows].map((r) => r.map(q).join(";")).join("\r\n");
}

/* ---------------- D134: derleme geliştirmeleri ---------------- */

/** Başlığı karşılaştırma için sadeleştirir (aksan, noktalama, büyük/küçük harf) */
export function normTitle(t: string): string {
  return t.toLocaleLowerCase("tr").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function bigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  const x = s.replace(/\s+/g, " ");
  for (let i = 0; i < x.length - 1; i++) { const g = x.slice(i, i + 2); m.set(g, (m.get(g) ?? 0) + 1); }
  return m;
}
/** Sørensen–Dice benzerliği (0–1) — yazım farkı, alt başlık ayracı, noktalama farklarına dayanıklı */
export function titleSimilarity(a: string, b: string): number {
  const A = bigrams(normTitle(a)), B = bigrams(normTitle(b));
  let inter = 0, na = 0, nb = 0;
  for (const v of A.values()) na += v;
  for (const v of B.values()) nb += v;
  for (const [g, v] of A) inter += Math.min(v, B.get(g) ?? 0);
  return na + nb ? (2 * inter) / (na + nb) : 0;
}

/**
 * Olası yinelenen (D134): DOI eşleşmesi zaten anahtarla yakalanır; burada DOI’si olmayan veya farklı biçimde
 * kaydedilmiş aynı yayınlar bulunur. Başlık benzerliği ≥ 0,93 ve yıllar aynı/±1 (biri yoksa ≥ 0,97).
 */
export function findFuzzyDuplicate(r: { title: string; year?: number | null; doi?: string | null }, pool: { key: string; title: string; year?: number | null; doi?: string | null }[]): string | null {
  const nt = normTitle(r.title);
  if (nt.length < 12) return null;
  for (const p of pool) {
    if (r.doi && p.doi && r.doi.toLowerCase() !== p.doi.toLowerCase()) continue;
    const yearsKnown = r.year != null && p.year != null;
    if (yearsKnown && Math.abs((r.year ?? 0) - (p.year ?? 0)) > 1) continue;
    if (Math.abs(nt.length - normTitle(p.title).length) > nt.length * 0.3) continue;
    const sim = titleSimilarity(r.title, p.title);
    if (sim >= (yearsKnown ? 0.93 : 0.97)) return p.key;
  }
  return null;
}

/* --- Çift değerlendirici (bağımsız tarama) ve uyum (Cohen’in kappası) --- */
export type VotePhase = "screening" | "eligibility";
export type VoteDecision = "include" | "exclude" | "unsure";
export interface Vote { decision: VoteDecision; reason?: string | null; name?: string; at: string }
export type Votes = Partial<Record<VotePhase, Record<string, Vote>>>;

export interface Agreement { raters: [string, string] | null; n: number; agree: number; observed: number | null; kappa: number | null; conflicts: string[]; label: string }

/** Cohen’in kappası: en çok oy veren iki değerlendiricinin ortak oyladığı kayıtlar üzerinden (dahil/hariç/emin değil) */
export function agreement(records: { id: string; votes?: Votes | null }[], phase: VotePhase): Agreement {
  const counts = new Map<string, number>();
  for (const r of records) for (const u of Object.keys(r.votes?.[phase] ?? {})) counts.set(u, (counts.get(u) ?? 0) + 1);
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([u]) => u);
  const conflicts: string[] = [];
  if (top.length < 2) return { raters: null, n: 0, agree: 0, observed: null, kappa: null, conflicts, label: "" };
  const [a, b] = top;
  const cats: VoteDecision[] = ["include", "exclude", "unsure"];
  const ma: Record<string, number> = { include: 0, exclude: 0, unsure: 0 }, mb: Record<string, number> = { include: 0, exclude: 0, unsure: 0 };
  let n = 0, agree = 0;
  for (const r of records) {
    const va = r.votes?.[phase]?.[a]?.decision, vb = r.votes?.[phase]?.[b]?.decision;
    if (!va || !vb) continue;
    n++; ma[va]++; mb[vb]++;
    if (va === vb) agree++; else conflicts.push(r.id);
  }
  if (!n) return { raters: [a, b], n: 0, agree: 0, observed: null, kappa: null, conflicts, label: "" };
  const po = agree / n;
  const pe = cats.reduce((s, c) => s + (ma[c] / n) * (mb[c] / n), 0);
  const kappa = pe >= 1 ? (po === 1 ? 1 : 0) : (po - pe) / (1 - pe);
  return { raters: [a, b], n, agree, observed: po, kappa: Math.round(kappa * 1000) / 1000, conflicts, label: kappaLabel(kappa) };
}
/** Landis ve Koch (1977) yorum ölçeği */
export function kappaLabel(k: number): string {
  return k < 0 ? "zayıf (şanstan kötü)" : k <= 0.2 ? "çok zayıf" : k <= 0.4 ? "zayıf" : k <= 0.6 ? "orta" : k <= 0.8 ? "iyi" : "çok iyi";
}

/* --- Veri çıkarma ve kalite (yanlılık riski) değerlendirmesi --- */
export const EXTRACTION_FIELDS = ["design", "country", "sample", "intervention", "outcomes", "findings"] as const;
export type ExtractionField = (typeof EXTRACTION_FIELDS)[number];
export const EXTRACTION_LABELS: Record<ExtractionField, { tr: string; en: string; de: string }> = {
  design: { tr: "Araştırma deseni", en: "Study design", de: "Studiendesign" },
  country: { tr: "Ülke / bağlam", en: "Country / setting", de: "Land / Setting" },
  sample: { tr: "Örneklem (n, özellikler)", en: "Sample (n, characteristics)", de: "Stichprobe (n, Merkmale)" },
  intervention: { tr: "Müdahale / değişkenler", en: "Intervention / variables", de: "Intervention / Variablen" },
  outcomes: { tr: "Sonuç ölçümleri / araçlar", en: "Outcomes / instruments", de: "Endpunkte / Instrumente" },
  findings: { tr: "Temel bulgular", en: "Key findings", de: "Zentrale Ergebnisse" },
};
export interface ExtractionCell { value: string; quote?: string | null; page?: string | null; edited?: boolean }
export type Extraction = Partial<Record<ExtractionField, ExtractionCell>> & { basedOn?: "full_text" | "abstract" | "metadata"; at?: string };

/** Genel amaçlı kalite değerlendirme ölçütleri (JBI ve CASP kontrol listelerinin ortak maddelerinden sadeleştirildi) */
export const APPRAISAL_ITEMS = [
  { id: "aim", tr: "Amaç veya araştırma sorusu açıkça belirtilmiş", en: "Aim or research question clearly stated", de: "Ziel oder Forschungsfrage klar formuliert" },
  { id: "design", tr: "Desen araştırma sorusuna uygun", en: "Design appropriate to the question", de: "Design passend zur Fragestellung" },
  { id: "sampling", tr: "Örneklem ve seçim yöntemi uygun ve açıklanmış", en: "Sample and selection appropriate and described", de: "Stichprobe und Auswahl angemessen und beschrieben" },
  { id: "measures", tr: "Ölçümler geçerli ve güvenilir", en: "Measures valid and reliable", de: "Messungen valide und reliabel" },
  { id: "analysis", tr: "Analiz uygun ve yeterince raporlanmış", en: "Analysis appropriate and adequately reported", de: "Analyse angemessen und ausreichend berichtet" },
  { id: "confounding", tr: "Karıştırıcı etkenler / yanlılıklar ele alınmış", en: "Confounders / biases addressed", de: "Störfaktoren / Verzerrungen berücksichtigt" },
  { id: "findings", tr: "Bulgular verilerle desteklenmiş, sınırlılıklar belirtilmiş", en: "Findings supported by data, limitations stated", de: "Ergebnisse durch Daten gestützt, Limitationen benannt" },
] as const;
export type AppraisalAnswer = "yes" | "no" | "unclear" | "na";
export interface Appraisal { answers: Partial<Record<(typeof APPRAISAL_ITEMS)[number]["id"], AppraisalAnswer>>; note?: string; at?: string }

/** Kalite özeti: “evet” oranına göre düşük / orta / yüksek yanlılık riski (uygulanamaz maddeler sayılmaz) */
export function appraisalSummary(a: Appraisal | null | undefined): { yes: number; applicable: number; score: number | null; risk: "low" | "moderate" | "high" | null } {
  const vals = Object.values(a?.answers ?? {}).filter((x) => x && x !== "na") as AppraisalAnswer[];
  const yes = vals.filter((x) => x === "yes").length;
  if (vals.length < 3) return { yes, applicable: vals.length, score: null, risk: null };
  const score = yes / vals.length;
  return { yes, applicable: vals.length, score: Math.round(score * 100) / 100, risk: score >= 0.75 ? "low" : score >= 0.5 ? "moderate" : "high" };
}

/* --- Yöntem bölümü metni (yapay zekâsız, kararlardan) --- */
const fmtDate = (d: string, lang: "tr" | "en" | "de") => { const x = new Date(d); return Number.isNaN(+x) ? d : x.toLocaleDateString(lang === "en" ? "en-GB" : lang === "de" ? "de-DE" : "tr-TR", { day: "numeric", month: "long", year: "numeric" }); };

/**
 * PRISMA 2020’ye uygun yöntem ve sonuç paragrafları + arama stratejisi tablosu (Markdown). Sayılar kararlardan
 * hesaplanır; dahil edilen çalışmalar kaynaklarda ise [[kaynak:Sx]] ile atıf yapılır (sourceLabels).
 */
export function methodsMarkdown(o: { protocol: ReviewProtocol; counts: PrismaCounts; lang: "tr" | "en" | "de"; agreement?: Agreement | null; appraised?: number; extracted?: number; includedLabels?: string[] }): string {
  if (o.lang === "de") return methodsMarkdownDe(o);
  const { protocol: p, counts: c, lang } = o;
  const en = lang === "en";
  const dbs = [...new Set(p.searches.map((s) => s.database))];
  const dates = p.searches.map((s) => s.date).filter(Boolean).sort();
  const lastDate = dates.length ? fmtDate(dates[dates.length - 1], lang) : null;
  const out: string[] = [];
  out.push(en ? "### Search strategy and study selection" : "### Arama stratejisi ve çalışma seçimi");
  out.push(en
    ? `This systematic review was conducted and reported in accordance with the PRISMA 2020 statement.${p.question ? ` The review question was: ${p.question}` : ""} ${dbs.length ? `The ${dbs.join(", ")} database${dbs.length > 1 ? "s were" : " was"} searched${lastDate ? ` (last search: ${lastDate})` : ""}.` : ""} The search strings used for each database are given in Table 1.`
    : `Bu sistematik derleme PRISMA 2020 bildirgesine uygun olarak yürütülmüş ve raporlanmıştır.${p.question ? ` Derlemenin araştırma sorusu şudur: ${p.question}` : ""} ${dbs.length ? `${dbs.join(", ")} veri taban${dbs.length > 1 ? "larında" : "ında"} tarama yapılmıştır${lastDate ? ` (son tarama: ${lastDate})` : ""}.` : ""} Her veri tabanında kullanılan arama ifadeleri Tablo 1’de verilmiştir.`);
  if (p.inclusion.length || p.exclusion.length) {
    out.push(en ? "Studies were eligible if they met the following inclusion criteria:" : "Çalışmaların derlemeye alınması için aşağıdaki dahil etme ölçütleri aranmıştır:");
    if (p.inclusion.length) out.push(p.inclusion.map((x) => `- ${x}`).join("\n"));
    if (p.exclusion.length) { out.push(en ? "Studies were excluded for the following reasons:" : "Aşağıdaki durumlardaki çalışmalar hariç tutulmuştur:"); out.push(p.exclusion.map((x) => `- ${x}`).join("\n")); }
  }
  const ag = o.agreement;
  const dual = ag && ag.n > 0 && ag.kappa != null;
  out.push(en
    ? `Duplicate records were removed before screening. Titles and abstracts were screened against the eligibility criteria${dual ? " independently by two reviewers" : ""}, followed by full-text assessment of potentially eligible reports.${dual ? ` Inter-rater agreement at title/abstract screening was ${Math.round((ag!.observed ?? 0) * 100)}% (Cohen’s κ = ${ag!.kappa!.toFixed(2)}); disagreements were resolved by discussion.` : ""} An AI tool was used only to suggest screening decisions; all decisions were made by the review team.`
    : `Taramadan önce yinelenen kayıtlar ayıklanmıştır. Başlık ve özetler dahil etme ölçütlerine göre${dual ? " iki araştırmacı tarafından birbirinden bağımsız olarak" : ""} taranmış, ardından uygun olabilecek raporların tam metinleri değerlendirilmiştir.${dual ? ` Başlık/özet taramasında değerlendiriciler arası uyum %${Math.round((ag!.observed ?? 0) * 100)} (Cohen’in κ = ${ag!.kappa!.toFixed(2)}) olup anlaşmazlıklar tartışılarak giderilmiştir.` : ""} Yapay zekâ aracı yalnızca tarama kararlarına öneri sunmak için kullanılmış; tüm kararlar araştırmacılar tarafından verilmiştir.`);
  if (o.extracted) out.push(en ? `Data were extracted from the included studies using a standard form (design, setting, sample, variables, outcome measures and key findings).` : `Dahil edilen çalışmalardan standart bir form kullanılarak veri çıkarılmıştır (desen, bağlam, örneklem, değişkenler, sonuç ölçümleri ve temel bulgular).`);
  if (o.appraised) out.push(en ? `The methodological quality of the included studies was appraised with a seven-item checklist adapted from the JBI and CASP tools.` : `Dahil edilen çalışmaların yöntemsel kalitesi, JBI ve CASP kontrol listelerinden uyarlanan yedi maddelik bir listeyle değerlendirilmiştir.`);
  out.push(en ? "### Results of the selection process" : "### Seçim sürecinin sonuçları");
  const reasons = Object.entries(c.excludedEligibility).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} (n = ${n})`).join(en ? "; " : "; ");
  const cites = o.includedLabels?.length ? ` [[kaynak:${o.includedLabels.join(",")}]]` : "";
  out.push(en
    ? `The searches yielded ${c.identified} records. After removing ${c.duplicates} duplicates, ${c.screened} records were screened by title and abstract and ${c.excludedScreening} were excluded. Of the ${c.sought} reports sought for retrieval, ${c.notRetrieved} could not be retrieved; ${c.assessed} full-text reports were assessed for eligibility and ${c.excludedEligibilityTotal} were excluded${reasons ? ` (${reasons})` : ""}. In total, ${c.included} studies were included in the review${cites} (Figure 1).`
    : `Taramalar sonucunda ${c.identified} kayda ulaşılmıştır. ${c.duplicates} yinelenen kayıt çıkarıldıktan sonra ${c.screened} kayıt başlık ve özet düzeyinde taranmış, ${c.excludedScreening} kayıt hariç tutulmuştur. Tam metnine ulaşılmaya çalışılan ${c.sought} rapordan ${c.notRetrieved} tanesine erişilememiş; ${c.assessed} raporun tam metni uygunluk açısından değerlendirilmiş ve ${c.excludedEligibilityTotal} rapor hariç tutulmuştur${reasons ? ` (${reasons})` : ""}. Sonuç olarak ${c.included} çalışma derlemeye dahil edilmiştir${cites} (Şekil 1).`);
  if (c.pendingScreening || c.pendingEligibility) out.push(en ? `*Note: ${c.pendingScreening + c.pendingEligibility} records are still awaiting a decision; update this text when screening is complete.*` : `*Not: ${c.pendingScreening + c.pendingEligibility} kayıt için henüz karar verilmemiştir; tarama tamamlanınca bu metni güncelleyin.*`);
  if (p.searches.length) {
    out.push(en ? "*Table 1. Search strategy*" : "*Tablo 1. Arama stratejisi*");
    const head = en ? "| Database | Search string | Date | Records |" : "| Veri tabanı | Arama ifadesi | Tarih | Kayıt |";
    out.push([head, "|---|---|---|---|", ...p.searches.map((s) => `| ${s.database.replace(/\|/g, "/")} | ${s.query.replace(/\|/g, "/") || "-"} | ${s.date} | ${s.results || "-"} |`)].join("\n"));
  }
  return out.join("\n\n");
}

/** Almanca yöntem ve sonuç metni (D144; PRISMA 2020 terminolojisinin Almanca karşılıkları) */
function methodsMarkdownDe(o: { protocol: ReviewProtocol; counts: PrismaCounts; agreement?: Agreement | null; appraised?: number; extracted?: number; includedLabels?: string[] }): string {
  const { protocol: p, counts: c } = o;
  const dbs = [...new Set(p.searches.map((s) => s.database))];
  const dates = p.searches.map((s) => s.date).filter(Boolean).sort();
  const lastDate = dates.length ? fmtDate(dates[dates.length - 1], "de") : null;
  const out: string[] = [];
  out.push("### Suchstrategie und Studienauswahl");
  out.push(`Dieses systematische Review wurde gemäß dem PRISMA-2020-Statement durchgeführt und berichtet.${p.question ? ` Die Fragestellung des Reviews lautete: ${p.question}` : ""} ${dbs.length ? `Durchsucht wurde${dbs.length > 1 ? "n die Datenbanken" : " die Datenbank"} ${dbs.join(", ")}${lastDate ? ` (letzte Suche: ${lastDate})` : ""}.` : ""} Die für jede Datenbank verwendeten Suchstrings sind in Tabelle 1 aufgeführt.`);
  if (p.inclusion.length || p.exclusion.length) {
    out.push("Studien wurden eingeschlossen, wenn sie die folgenden Einschlusskriterien erfüllten:");
    if (p.inclusion.length) out.push(p.inclusion.map((x) => `- ${x}`).join("\n"));
    if (p.exclusion.length) { out.push("Aus folgenden Gründen wurden Studien ausgeschlossen:"); out.push(p.exclusion.map((x) => `- ${x}`).join("\n")); }
  }
  const ag = o.agreement;
  const dual = ag && ag.n > 0 && ag.kappa != null;
  out.push(`Dubletten wurden vor dem Screening entfernt. Titel und Abstracts wurden${dual ? " von zwei Personen unabhängig voneinander" : ""} anhand der Eignungskriterien gescreent; anschließend wurden die Volltexte potenziell geeigneter Berichte geprüft.${dual ? ` Die Übereinstimmung der Gutachtenden im Titel-/Abstract-Screening betrug ${Math.round((ag!.observed ?? 0) * 100)} % (Cohens κ = ${ag!.kappa!.toFixed(2).replace(".", ",")}); Unstimmigkeiten wurden durch Diskussion geklärt.` : ""} Ein KI-Werkzeug wurde ausschließlich für Vorschläge zu Screening-Entscheidungen eingesetzt; alle Entscheidungen traf das Review-Team.`);
  if (o.extracted) out.push("Die Daten der eingeschlossenen Studien wurden mit einem standardisierten Formular extrahiert (Design, Setting, Stichprobe, Variablen, Endpunkte und zentrale Ergebnisse).");
  if (o.appraised) out.push("Die methodische Qualität der eingeschlossenen Studien wurde mit einer siebenteiligen, aus den JBI- und CASP-Instrumenten adaptierten Checkliste bewertet.");
  out.push("### Ergebnisse des Auswahlprozesses");
  const reasons = Object.entries(c.excludedEligibility).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} (n = ${n})`).join("; ");
  const cites = o.includedLabels?.length ? ` [[kaynak:${o.includedLabels.join(",")}]]` : "";
  out.push(`Die Suchen ergaben ${c.identified} Datensätze. Nach Entfernung von ${c.duplicates} Dubletten wurden ${c.screened} Datensätze anhand von Titel und Abstract gescreent und ${c.excludedScreening} ausgeschlossen. Von ${c.sought} zur Beschaffung gesuchten Berichten waren ${c.notRetrieved} nicht verfügbar; ${c.assessed} Volltexte wurden auf Eignung geprüft und ${c.excludedEligibilityTotal} ausgeschlossen${reasons ? ` (${reasons})` : ""}. Insgesamt wurden ${c.included} Studien in das Review eingeschlossen${cites} (Abbildung 1).`);
  if (c.pendingScreening || c.pendingEligibility) out.push(`*Anmerkung: Für ${c.pendingScreening + c.pendingEligibility} Datensätze steht die Entscheidung noch aus; aktualisieren Sie diesen Text nach Abschluss des Screenings.*`);
  if (p.searches.length) {
    out.push("*Tabelle 1. Suchstrategie*");
    out.push(["| Datenbank | Suchstring | Datum | Treffer |", "|---|---|---|---|", ...p.searches.map((s) => `| ${s.database.replace(/\|/g, "/")} | ${s.query.replace(/\|/g, "/") || "-"} | ${s.date} | ${s.results || "-"} |`)].join("\n"));
  }
  return out.join("\n\n");
}

/** Dahil edilen çalışmaların özellikleri tablosu (Markdown): veri çıkarma alanları + kalite */
export function characteristicsMarkdown(rows: { label: string | null; title: string; year?: number | null; extraction?: Extraction | null; appraisal?: Appraisal | null }[], lang: "tr" | "en" | "de"): string {
  const en = lang === "en", de = lang === "de";
  const fields: ExtractionField[] = ["design", "country", "sample", "outcomes", "findings"];
  const riskLabel = (r: string | null) => (r === "low" ? (en ? "Low" : de ? "Niedrig" : "Düşük") : r === "moderate" ? (en ? "Moderate" : de ? "Mittel" : "Orta") : r === "high" ? (en ? "High" : de ? "Hoch" : "Yüksek") : "-");
  const head = `| ${en ? "Study" : de ? "Studie" : "Çalışma"} | ${fields.map((f) => EXTRACTION_LABELS[f][lang]).join(" | ")} | ${en ? "Risk of bias" : de ? "Verzerrungsrisiko" : "Yanlılık riski"} |`;
  const clean = (s?: string) => (s ?? "-").replace(/\|/g, "/").replace(/\n/g, " ") || "-";
  const lines = rows.map((r) => `| ${r.label ? `[[kaynak:${r.label}|anlatı]]` : clean(`${r.title.slice(0, 60)}${r.year ? ` (${r.year})` : ""}`)} | ${fields.map((f) => clean(r.extraction?.[f]?.value)).join(" | ")} | ${riskLabel(appraisalSummary(r.appraisal).risk)} |`);
  return [en ? "*Table 2. Characteristics of the included studies*" : de ? "*Tabelle 2. Merkmale der eingeschlossenen Studien*" : "*Tablo 2. Dahil edilen çalışmaların özellikleri*", [head, `|${"---|".repeat(fields.length + 2)}`, ...lines].join("\n")].join("\n\n");
}
