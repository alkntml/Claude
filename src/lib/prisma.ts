/**
 * Sistematik derleme (PRISMA 2020) modülü — saf kurallar (D122). Kayıtların aşamaları, yinelenen tespiti,
 * akış şeması sayıları ve PRISMA 2020 akış şemasının SVG çizimi. Sunucu, istemci ve testler ortak kullanır.
 * Yapay zekâ eleme kararı vermez; yalnızca öneri sunar. Kararı kullanıcı verir ve gerekçesi kaydedilir.
 */
import type { MetaModel, MetaRowInput, MetaType } from "@/lib/meta";
import { metaMethodsSentence } from "@/lib/meta-report";

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
  /** D222: veri çıkarma formuna eklenen alanlar (ör. “Örneklem büyüklüğü (n)”, “Etki büyüklüğü ve %95 GA”) */
  extractionFields?: string[];
  /** D222: yeni çalışmalarda varsayılan yanlılık riski aracı */
  appraisalTool?: AppraisalToolId;
  /** D222: PRISMA 2020 raporlama maddeleri (araştırmacının kendi yazdığı metin; yöntem metnine aynen aktarılır) */
  reporting?: Partial<Record<ReportingField, string>>;
  /** D224: meta-analiz girdileri (etki ölçüsü, model ve çalışma başına sayılar) */
  meta?: { type: MetaType; model: MetaModel; rows: MetaRowInput[] };
}
/** D222: PRISMA 2020 maddeleri: 24 kayıt, 12 etki ölçüsü, 13 sentez, 14 raporlama yanlılığı, 15 kesinlik, 25 destek, 26 çıkar çatışması, 27 veri erişimi */
export const REPORTING_FIELDS = ["registration", "effectMeasures", "synthesis", "reportingBias", "certainty", "funding", "competingInterests", "dataAvailability"] as const;
export type ReportingField = (typeof REPORTING_FIELDS)[number];
export const REPORTING_LABELS: Record<ReportingField, { item: number; tr: string; en: string; de: string; hint: { tr: string; en: string; de: string } }> = {
  registration: { item: 24, tr: "Kayıt ve protokol (ör. PROSPERO numarası)", en: "Registration and protocol (e.g. PROSPERO ID)", de: "Registrierung und Protokoll (z. B. PROSPERO-Nummer)", hint: { tr: "Ör. Protokol PROSPERO’ya kaydedilmiştir (CRD42025000000).", en: "E.g. The protocol was registered in PROSPERO (CRD42025000000).", de: "Z. B. Das Protokoll wurde in PROSPERO registriert (CRD42025000000)." } },
  effectMeasures: { item: 12, tr: "Etki ölçüleri", en: "Effect measures", de: "Effektmaße", hint: { tr: "Ör. Sürekli sonuçlar için standartlaştırılmış ortalama farkı (Hedges g) kullanılmıştır.", en: "E.g. Standardised mean differences (Hedges’ g) were used for continuous outcomes.", de: "Z. B. Für stetige Endpunkte wurden standardisierte Mittelwertdifferenzen (Hedges’ g) verwendet." } },
  synthesis: { item: 13, tr: "Sentez yöntemleri", en: "Synthesis methods", de: "Synthesemethoden", hint: { tr: "Ör. Rastgele etkiler modeliyle meta-analiz; heterojenlik I² ile; ya da anlatı sentezi (SWiM).", en: "E.g. Random-effects meta-analysis; heterogeneity assessed with I²; or narrative synthesis (SWiM).", de: "Z. B. Metaanalyse mit Random-Effects-Modell; Heterogenität mit I²; oder narrative Synthese (SWiM)." } },
  reportingBias: { item: 14, tr: "Raporlama (yayın) yanlılığı değerlendirmesi", en: "Reporting bias assessment", de: "Bewertung von Berichtsverzerrungen", hint: { tr: "Ör. Huni grafiği ve Egger testi (10 ve üzeri çalışmada).", en: "E.g. Funnel plot and Egger’s test (10 or more studies).", de: "Z. B. Funnel-Plot und Egger-Test (ab 10 Studien)." } },
  certainty: { item: 15, tr: "Kanıtın kesinliği (ör. GRADE)", en: "Certainty of evidence (e.g. GRADE)", de: "Vertrauenswürdigkeit der Evidenz (z. B. GRADE)", hint: { tr: "Ör. Kanıtın kesinliği GRADE yaklaşımıyla değerlendirilmiştir.", en: "E.g. Certainty of evidence was assessed with the GRADE approach.", de: "Z. B. Die Vertrauenswürdigkeit der Evidenz wurde mit GRADE bewertet." } },
  funding: { item: 25, tr: "Destek / finansman", en: "Support / funding", de: "Förderung", hint: { tr: "Ör. Bu çalışma herhangi bir kurumdan destek almamıştır.", en: "E.g. This review received no specific funding.", de: "Z. B. Für dieses Review gab es keine spezifische Förderung." } },
  competingInterests: { item: 26, tr: "Çıkar çatışması", en: "Competing interests", de: "Interessenkonflikte", hint: { tr: "Ör. Yazarlar çıkar çatışması bulunmadığını beyan eder.", en: "E.g. The authors declare no competing interests.", de: "Z. B. Die Autorinnen und Autoren erklären, dass keine Interessenkonflikte bestehen." } },
  dataAvailability: { item: 27, tr: "Veri, kod ve materyal erişimi", en: "Availability of data, code and materials", de: "Verfügbarkeit von Daten, Code und Materialien", hint: { tr: "Ör. Veri çıkarma formu ve kayıt listesi ek dosyada sunulmuştur.", en: "E.g. The data extraction form and record list are provided as supplementary files.", de: "Z. B. Extraktionsformular und Datensatzliste liegen als Zusatzmaterial vor." } },
};
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

/** D222: ön baskı sunucularının DOI önekleri (arXiv, bioRxiv/medRxiv, SSRN, Research Square, Preprints, OSF/PsyArXiv/SocArXiv, TechRxiv, Authorea, SciELO Preprints) */
const PREPRINT_DOI = /^10\.(48550|1101|2139|21203|20944|31234|31219|31235|31222|36227|22541|1590\/scielopreprints)\//i;
export const isPreprintDoi = (doi: string | null | undefined) => !!doi && PREPRINT_DOI.test(doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, ""));

/**
 * D222: başlıktaki bölüm/kısım/çalışma/cilt numarası (“Part 1”, “Bölüm II”, “Study 2”, “Vol. 3”, sonda “: I”).
 * Bu işaretleri farklı iki başlık, benzer olsalar da ayrı yayındır (bir dizinin parçaları).
 */
export function partMarkers(title: string): string {
  const t = normTitle(title);
  const words = "part|parte|teil|bolum|kisim|study|calisma|experiment|deney|volume|vol|cilt|paper|makale|chapter";
  const out: string[] = [];
  for (const m of t.matchAll(new RegExp(`\\b(${words})\\s+([0-9]+|[ivx]+|[a-d]|one|two|three|four|bir|iki|uc|dort)\\b`, "g"))) out.push(`${m[1]}:${m[2]}`);
  const tail = t.match(/\s([ivx]+|[0-9]{1,2})$/);
  if (tail) out.push(`end:${tail[1]}`);
  return out.join("|");
}

export type FuzzyKind = "similar" | "version";
/**
 * Olası yinelenen (D134): DOI eşleşmesi zaten anahtarla yakalanır; burada DOI’si olmayan veya farklı biçimde
 * kaydedilmiş aynı yayınlar bulunur. Başlık benzerliği ≥ 0,93 ve yıllar aynı/±1 (biri yoksa ≥ 0,97).
 * D222: bölüm/kısım numarası farklı başlıklar yinelenen sayılmaz; DOI’lerden biri ön baskıya aitse (arXiv, medRxiv…)
 * farklı DOI’ye rağmen aynı çalışmanın sürümü sayılır (ön baskı 2 yıla kadar önce çıkabilir).
 */
export function fuzzyMatch(r: { title: string; year?: number | null; doi?: string | null }, pool: { key: string; title: string; year?: number | null; doi?: string | null }[]): { key: string; kind: FuzzyKind } | null {
  const nt = normTitle(r.title);
  if (nt.length < 12) return null;
  const pm = partMarkers(r.title);
  for (const p of pool) {
    const bothDoi = !!(r.doi && p.doi) && r.doi.toLowerCase() !== p.doi.toLowerCase();
    const version = bothDoi && (isPreprintDoi(r.doi) !== isPreprintDoi(p.doi));
    if (bothDoi && !version) continue;
    if (partMarkers(p.title) !== pm) continue;
    const yearsKnown = r.year != null && p.year != null;
    if (yearsKnown && Math.abs((r.year ?? 0) - (p.year ?? 0)) > (version ? 2 : 1)) continue;
    if (Math.abs(nt.length - normTitle(p.title).length) > nt.length * 0.3) continue;
    const sim = titleSimilarity(r.title, p.title);
    if (sim >= (yearsKnown ? 0.93 : 0.97)) return { key: p.key, kind: version || isPreprintDoi(r.doi) !== isPreprintDoi(p.doi) ? "version" : "similar" };
  }
  return null;
}
export function findFuzzyDuplicate(r: { title: string; year?: number | null; doi?: string | null }, pool: { key: string; title: string; year?: number | null; doi?: string | null }[]): string | null {
  return fuzzyMatch(r, pool)?.key ?? null;
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
export type Extraction = Partial<Record<ExtractionField, ExtractionCell>> & { basedOn?: "full_text" | "abstract" | "metadata"; at?: string; /** D222: protokoldeki ek alanlar (alan adı → değer) */ custom?: Record<string, ExtractionCell> };

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

/**
 * D222: adı konmuş yanlılık riski araçları. Desene göre seçilir: randomize kontrollü → Cochrane RoB 2; randomize
 * olmayan müdahale → ROBINS-I; kesitsel → JBI analitik kesitsel listesi; kohort → Newcastle–Ottawa (kohort).
 * Alan adları araçların resmî alanlarıdır; genel karar kuralları araçların kendi rehberlerindeki “en kötü alan” ilkesidir.
 */
export type AppraisalToolId = "general" | "rob2" | "robins_i" | "jbi_cross" | "nos_cohort";
export type AppraisalAnswer = "yes" | "no" | "unclear" | "na" | "low" | "some" | "high" | "moderate" | "serious" | "critical" | "ni" | "0" | "1" | "2";
type L3 = { tr: string; en: string; de: string };
export interface AppraisalTool { id: AppraisalToolId; name: L3; use: L3; scale: "yn" | "rob2" | "robins" | "stars"; items: ({ id: string; max?: number } & L3)[] }
export const APPRAISAL_TOOLS: AppraisalTool[] = [
  { id: "general", scale: "yn", name: { tr: "Genel kalite listesi (JBI ve CASP’tan uyarlanmış 7 madde)", en: "General quality checklist (7 items adapted from JBI and CASP)", de: "Allgemeine Qualitätscheckliste (7 Punkte, adaptiert nach JBI und CASP)" }, use: { tr: "Karma desenler, nitel çalışmalar", en: "Mixed designs, qualitative studies", de: "Gemischte Designs, qualitative Studien" }, items: [...APPRAISAL_ITEMS] },
  { id: "rob2", scale: "rob2", name: { tr: "Cochrane RoB 2", en: "Cochrane RoB 2", de: "Cochrane RoB 2" }, use: { tr: "Randomize kontrollü çalışmalar", en: "Randomised controlled trials", de: "Randomisierte kontrollierte Studien" }, items: [
    { id: "d1", tr: "Randomizasyon süreci", en: "Randomisation process", de: "Randomisierungsprozess" },
    { id: "d2", tr: "Planlanan müdahaleden sapmalar", en: "Deviations from intended interventions", de: "Abweichungen von den vorgesehenen Interventionen" },
    { id: "d3", tr: "Eksik sonuç verisi", en: "Missing outcome data", de: "Fehlende Endpunktdaten" },
    { id: "d4", tr: "Sonucun ölçümü", en: "Measurement of the outcome", de: "Messung des Endpunkts" },
    { id: "d5", tr: "Raporlanan sonucun seçimi", en: "Selection of the reported result", de: "Auswahl des berichteten Ergebnisses" },
  ] },
  { id: "robins_i", scale: "robins", name: { tr: "ROBINS-I", en: "ROBINS-I", de: "ROBINS-I" }, use: { tr: "Randomize olmayan müdahale çalışmaları", en: "Non-randomised studies of interventions", de: "Nicht randomisierte Interventionsstudien" }, items: [
    { id: "d1", tr: "Karıştırıcı etkenler", en: "Confounding", de: "Confounding" },
    { id: "d2", tr: "Katılımcıların seçimi", en: "Selection of participants", de: "Auswahl der Teilnehmenden" },
    { id: "d3", tr: "Müdahalelerin sınıflandırılması", en: "Classification of interventions", de: "Klassifikation der Interventionen" },
    { id: "d4", tr: "Planlanan müdahaleden sapmalar", en: "Deviations from intended interventions", de: "Abweichungen von den vorgesehenen Interventionen" },
    { id: "d5", tr: "Eksik veri", en: "Missing data", de: "Fehlende Daten" },
    { id: "d6", tr: "Sonuçların ölçümü", en: "Measurement of outcomes", de: "Messung der Endpunkte" },
    { id: "d7", tr: "Raporlanan sonucun seçimi", en: "Selection of the reported result", de: "Auswahl des berichteten Ergebnisses" },
  ] },
  { id: "jbi_cross", scale: "yn", name: { tr: "JBI analitik kesitsel çalışma listesi", en: "JBI checklist for analytical cross-sectional studies", de: "JBI-Checkliste für analytische Querschnittstudien" }, use: { tr: "Kesitsel / ilişkisel çalışmalar", en: "Cross-sectional / correlational studies", de: "Querschnitt- / Korrelationsstudien" }, items: [
    { id: "q1", tr: "Örnekleme alınma ölçütleri açıkça tanımlanmış", en: "Criteria for inclusion in the sample clearly defined", de: "Einschlusskriterien der Stichprobe klar definiert" },
    { id: "q2", tr: "Katılımcılar ve ortam ayrıntılı tanımlanmış", en: "Study subjects and setting described in detail", de: "Teilnehmende und Setting ausführlich beschrieben" },
    { id: "q3", tr: "Maruziyet geçerli ve güvenilir biçimde ölçülmüş", en: "Exposure measured in a valid and reliable way", de: "Exposition valide und reliabel gemessen" },
    { id: "q4", tr: "Durumun ölçümünde nesnel, standart ölçütler kullanılmış", en: "Objective, standard criteria used for measurement of the condition", de: "Objektive Standardkriterien zur Messung des Zustands verwendet" },
    { id: "q5", tr: "Karıştırıcı etkenler belirlenmiş", en: "Confounding factors identified", de: "Störfaktoren identifiziert" },
    { id: "q6", tr: "Karıştırıcı etkenlerle başa çıkma stratejileri belirtilmiş", en: "Strategies to deal with confounding factors stated", de: "Strategien zum Umgang mit Störfaktoren angegeben" },
    { id: "q7", tr: "Sonuçlar geçerli ve güvenilir biçimde ölçülmüş", en: "Outcomes measured in a valid and reliable way", de: "Endpunkte valide und reliabel gemessen" },
    { id: "q8", tr: "Uygun istatistiksel analiz kullanılmış", en: "Appropriate statistical analysis used", de: "Angemessene statistische Analyse verwendet" },
  ] },
  { id: "nos_cohort", scale: "stars", name: { tr: "Newcastle–Ottawa Ölçeği (kohort)", en: "Newcastle–Ottawa Scale (cohort)", de: "Newcastle-Ottawa-Skala (Kohorte)" }, use: { tr: "Kohort çalışmaları", en: "Cohort studies", de: "Kohortenstudien" }, items: [
    { id: "s1", tr: "Seçim: maruz kalan kohortun temsil gücü", en: "Selection: representativeness of the exposed cohort", de: "Selektion: Repräsentativität der exponierten Kohorte" },
    { id: "s2", tr: "Seçim: maruz kalmayan kohortun seçimi", en: "Selection: selection of the non-exposed cohort", de: "Selektion: Auswahl der nicht exponierten Kohorte" },
    { id: "s3", tr: "Seçim: maruziyetin belirlenmesi", en: "Selection: ascertainment of exposure", de: "Selektion: Erhebung der Exposition" },
    { id: "s4", tr: "Seçim: sonucun başlangıçta bulunmadığının gösterilmesi", en: "Selection: outcome not present at start of study", de: "Selektion: Endpunkt zu Studienbeginn nicht vorhanden" },
    { id: "c1", max: 2, tr: "Karşılaştırılabilirlik: kohortların karşılaştırılabilirliği (en fazla 2 yıldız)", en: "Comparability: comparability of cohorts (up to 2 stars)", de: "Vergleichbarkeit der Kohorten (bis zu 2 Sterne)" },
    { id: "o1", tr: "Sonuç: sonucun değerlendirilmesi", en: "Outcome: assessment of outcome", de: "Endpunkt: Erhebung des Endpunkts" },
    { id: "o2", tr: "Sonuç: izlem süresinin yeterliliği", en: "Outcome: follow-up long enough for outcomes to occur", de: "Endpunkt: ausreichend lange Nachbeobachtung" },
    { id: "o3", tr: "Sonuç: izlemin yeterliliği (kayıp oranı)", en: "Outcome: adequacy of follow-up of cohorts", de: "Endpunkt: Vollständigkeit der Nachbeobachtung" },
  ] },
];
export const appraisalTool = (id: AppraisalToolId | null | undefined) => APPRAISAL_TOOLS.find((x) => x.id === id) ?? APPRAISAL_TOOLS[0];
/** Aracın ölçeğine göre yanıt seçenekleri */
export const SCALE_ANSWERS: Record<AppraisalTool["scale"], { v: AppraisalAnswer; tr: string; en: string; de: string }[]> = {
  yn: [{ v: "yes", tr: "Evet", en: "Yes", de: "Ja" }, { v: "no", tr: "Hayır", en: "No", de: "Nein" }, { v: "unclear", tr: "Belirsiz", en: "Unclear", de: "Unklar" }, { v: "na", tr: "Uygulanamaz", en: "Not applicable", de: "Nicht anwendbar" }],
  rob2: [{ v: "low", tr: "Düşük", en: "Low", de: "Niedrig" }, { v: "some", tr: "Bazı endişeler", en: "Some concerns", de: "Einige Bedenken" }, { v: "high", tr: "Yüksek", en: "High", de: "Hoch" }],
  robins: [{ v: "low", tr: "Düşük", en: "Low", de: "Niedrig" }, { v: "moderate", tr: "Orta", en: "Moderate", de: "Moderat" }, { v: "serious", tr: "Ciddi", en: "Serious", de: "Schwerwiegend" }, { v: "critical", tr: "Kritik", en: "Critical", de: "Kritisch" }, { v: "ni", tr: "Bilgi yok", en: "No information", de: "Keine Information" }],
  stars: [{ v: "1", tr: "★", en: "★", de: "★" }, { v: "0", tr: "Yıldız yok", en: "No star", de: "Kein Stern" }],
};
export interface Appraisal { tool?: AppraisalToolId; answers: Partial<Record<string, AppraisalAnswer>>; note?: string; at?: string }

/**
 * Kalite özeti → düşük / orta / yüksek yanlılık riski.
 * - Genel liste ve JBI: “evet” oranı ≥ %75 düşük, %50–74 orta, altı yüksek (uygulanamaz sayılmaz; en az 3 madde).
 * - RoB 2: herhangi bir alan “yüksek” → yüksek; yoksa herhangi biri “bazı endişeler” → orta (bazı endişeler);
 *   tüm alanlar “düşük” → düşük. Tüm alanlar yanıtlanmadan genel karar verilmez.
 * - ROBINS-I: genel karar en kötü alandır (düşük < orta < ciddi < kritik); “bilgi yok” alanları karar vermeyi engeller.
 * - Newcastle–Ottawa: toplam yıldız (en fazla 9); 7–9 düşük, 5–6 orta, 0–4 yüksek risk.
 */
export function appraisalSummary(a: Appraisal | null | undefined): { yes: number; applicable: number; score: number | null; risk: "low" | "moderate" | "high" | null; detail?: string } {
  const tool = appraisalTool(a?.tool);
  const ans = (id: string) => a?.answers?.[id];
  if (tool.scale === "yn") {
    const vals = tool.items.map((i) => ans(i.id)).filter((x) => x && x !== "na") as AppraisalAnswer[];
    const yes = vals.filter((x) => x === "yes").length;
    if (vals.length < 3) return { yes, applicable: vals.length, score: null, risk: null };
    const score = yes / vals.length;
    return { yes, applicable: vals.length, score: Math.round(score * 100) / 100, risk: score >= 0.75 ? "low" : score >= 0.5 ? "moderate" : "high" };
  }
  const vals = tool.items.map((i) => ans(i.id));
  const answered = vals.filter(Boolean).length;
  if (tool.scale === "rob2") {
    const low = vals.filter((x) => x === "low").length;
    if (vals.includes("high")) return { yes: low, applicable: answered, score: null, risk: "high", detail: "high" };
    if (answered < tool.items.length) return { yes: low, applicable: answered, score: null, risk: null };
    return vals.includes("some") ? { yes: low, applicable: answered, score: null, risk: "moderate", detail: "some" } : { yes: low, applicable: answered, score: null, risk: "low", detail: "low" };
  }
  if (tool.scale === "robins") {
    const order = ["low", "moderate", "serious", "critical"];
    const worst = vals.reduce((w, x) => (x && order.indexOf(x) > order.indexOf(w) ? x : w), "low" as string);
    const low = vals.filter((x) => x === "low").length;
    if (worst === "critical" || worst === "serious") return { yes: low, applicable: answered, score: null, risk: "high", detail: worst };
    if (answered < tool.items.length || vals.includes("ni")) return { yes: low, applicable: answered, score: null, risk: null };
    return { yes: low, applicable: answered, score: null, risk: worst === "moderate" ? "moderate" : "low", detail: worst };
  }
  const stars = tool.items.reduce((sum, i) => sum + Math.min(Number(ans(i.id) ?? 0) || 0, i.max ?? 1), 0);
  if (answered < tool.items.length) return { yes: stars, applicable: answered, score: null, risk: null };
  return { yes: stars, applicable: answered, score: stars / 9, risk: stars >= 7 ? "low" : stars >= 5 ? "moderate" : "high", detail: `${stars}/9` };
}

/** D222: Türkçe ve Almanca metinde ondalık ayırıcı virgüldür (κ = 0,71) */
export const fmtNum = (x: number, digits: number, lang: "tr" | "en" | "de") => { const v = x.toFixed(digits); return lang === "en" ? v : v.replace(".", ","); };

/* --- Yöntem bölümü metni (yapay zekâsız, kararlardan) --- */
/** D222: kullanılan yanlılık riski araçlarını adıyla yazar (araç başına hangi desende kullanıldığı) */
function appraisalSentence(tools: AppraisalToolId[] | undefined, lang: "tr" | "en" | "de"): string {
  const used = [...new Set(tools?.length ? tools : ["general" as AppraisalToolId])].map((id) => appraisalTool(id));
  const lower = (v: string) => (lang === "de" ? v : v.toLocaleLowerCase(lang === "tr" ? "tr" : "en"));
  const short = (x: AppraisalTool) => x.name[lang].replace(/\s*\([^)]*\)$/, "");
  const list = used.map((x) => (x.id === "general" ? x.name[lang] : lang === "tr" ? `${lower(x.use[lang])} için ${short(x)}` : lang === "de" ? `${short(x)} für ${x.use[lang]}` : `${short(x)} for ${lower(x.use[lang])}`));
  const join = (xs: string[], and: string) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${and} ${xs[xs.length - 1]}`);
  if (lang === "en") return `Risk of bias / methodological quality of the included studies was assessed with ${join(list, "and")}.`;
  if (lang === "de") return `Das Verzerrungsrisiko bzw. die methodische Qualität der eingeschlossenen Studien wurde mit ${join(list, "und")} bewertet.`;
  return `Dahil edilen çalışmaların yanlılık riski / yöntemsel kalitesi ${join(list, "ve")} ile değerlendirilmiştir.`;
}
/** D222: araştırmacının protokolde yazdığı raporlama metinleri (yapay zekâ üretmez; boşsa hiçbir şey eklenmez) */
function reportingParagraphs(p: ReviewProtocol, lang: "tr" | "en" | "de", fields: ReportingField[]): string[] {
  return fields.map((f) => (p.reporting?.[f] ?? "").trim()).filter(Boolean).map((x) => (/[.!?]$/.test(x) ? x : `${x}.`));
}

const fmtDate = (d: string, lang: "tr" | "en" | "de") => { const x = new Date(d); return Number.isNaN(+x) ? d : x.toLocaleDateString(lang === "en" ? "en-GB" : lang === "de" ? "de-DE" : "tr-TR", { day: "numeric", month: "long", year: "numeric" }); };

/**
 * PRISMA 2020’ye uygun yöntem ve sonuç paragrafları + arama stratejisi tablosu (Markdown). Sayılar kararlardan
 * hesaplanır; dahil edilen çalışmalar kaynaklarda ise [[kaynak:Sx]] ile atıf yapılır (sourceLabels).
 */
export function methodsMarkdown(o: { protocol: ReviewProtocol; counts: PrismaCounts; lang: "tr" | "en" | "de"; agreement?: Agreement | null; appraised?: number; extracted?: number; includedLabels?: string[]; tools?: AppraisalToolId[]; meta?: { type: MetaType; model: MetaModel } | null }): string {
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
  out.push(...reportingParagraphs(p, lang, ["registration"]));
  if (p.inclusion.length || p.exclusion.length) {
    out.push(en ? "Studies were eligible if they met the following inclusion criteria:" : "Çalışmaların derlemeye alınması için aşağıdaki dahil etme ölçütleri aranmıştır:");
    if (p.inclusion.length) out.push(p.inclusion.map((x) => `- ${x}`).join("\n"));
    if (p.exclusion.length) { out.push(en ? "Studies were excluded for the following reasons:" : "Aşağıdaki durumlardaki çalışmalar hariç tutulmuştur:"); out.push(p.exclusion.map((x) => `- ${x}`).join("\n")); }
  }
  const ag = o.agreement;
  const dual = ag && ag.n > 0 && ag.kappa != null;
  out.push(en
    ? `Duplicate records were removed before screening. Titles and abstracts were screened against the eligibility criteria${dual ? " independently by two reviewers" : ""}, followed by full-text assessment of potentially eligible reports.${dual ? ` Inter-rater agreement at title/abstract screening was ${Math.round((ag!.observed ?? 0) * 100)}% (Cohen’s κ = ${ag!.kappa!.toFixed(2)}); disagreements were resolved by discussion.` : ""} An AI tool was used only to suggest screening decisions; all decisions were made by the review team.`
    : `Taramadan önce yinelenen kayıtlar ayıklanmıştır. Başlık ve özetler dahil etme ölçütlerine göre${dual ? " iki araştırmacı tarafından birbirinden bağımsız olarak" : ""} taranmış, ardından uygun olabilecek raporların tam metinleri değerlendirilmiştir.${dual ? ` Başlık/özet taramasında değerlendiriciler arası uyum %${Math.round((ag!.observed ?? 0) * 100)} (Cohen’in κ = ${fmtNum(ag!.kappa!, 2, "tr")}) olup anlaşmazlıklar tartışılarak giderilmiştir.` : ""} Yapay zekâ aracı yalnızca tarama kararlarına öneri sunmak için kullanılmış; tüm kararlar araştırmacılar tarafından verilmiştir.`);
  const extra = (p.extractionFields ?? []).filter(Boolean);
  if (o.extracted) out.push(en ? `Data were extracted from the included studies using a standard form (design, setting, sample, variables, outcome measures and key findings${extra.length ? `; ${extra.join("; ")}` : ""}).` : `Dahil edilen çalışmalardan standart bir form kullanılarak veri çıkarılmıştır (desen, bağlam, örneklem, değişkenler, sonuç ölçümleri ve temel bulgular${extra.length ? `; ${extra.join("; ")}` : ""}).`);
  if (o.appraised) out.push(appraisalSentence(o.tools, lang));
  if (o.meta) out.push(metaMethodsSentence(o.meta.type, o.meta.model, lang));
  out.push(...reportingParagraphs(p, lang, ["effectMeasures", "synthesis", "reportingBias", "certainty"]));
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
  const decl = reportingParagraphs(p, lang, ["funding", "competingInterests", "dataAvailability"]);
  if (decl.length) { out.push(en ? "### Other information" : "### Diğer bilgiler"); out.push(...decl); }
  return out.join("\n\n");
}

/** Almanca yöntem ve sonuç metni (D144; PRISMA 2020 terminolojisinin Almanca karşılıkları) */
function methodsMarkdownDe(o: { protocol: ReviewProtocol; counts: PrismaCounts; agreement?: Agreement | null; appraised?: number; extracted?: number; includedLabels?: string[]; tools?: AppraisalToolId[]; meta?: { type: MetaType; model: MetaModel } | null }): string {
  const { protocol: p, counts: c } = o;
  const dbs = [...new Set(p.searches.map((s) => s.database))];
  const dates = p.searches.map((s) => s.date).filter(Boolean).sort();
  const lastDate = dates.length ? fmtDate(dates[dates.length - 1], "de") : null;
  const out: string[] = [];
  out.push("### Suchstrategie und Studienauswahl");
  out.push(`Dieses systematische Review wurde gemäß dem PRISMA-2020-Statement durchgeführt und berichtet.${p.question ? ` Die Fragestellung des Reviews lautete: ${p.question}` : ""} ${dbs.length ? `Durchsucht wurde${dbs.length > 1 ? "n die Datenbanken" : " die Datenbank"} ${dbs.join(", ")}${lastDate ? ` (letzte Suche: ${lastDate})` : ""}.` : ""} Die für jede Datenbank verwendeten Suchstrings sind in Tabelle 1 aufgeführt.`);
  out.push(...reportingParagraphs(p, "de", ["registration"]));
  if (p.inclusion.length || p.exclusion.length) {
    out.push("Studien wurden eingeschlossen, wenn sie die folgenden Einschlusskriterien erfüllten:");
    if (p.inclusion.length) out.push(p.inclusion.map((x) => `- ${x}`).join("\n"));
    if (p.exclusion.length) { out.push("Aus folgenden Gründen wurden Studien ausgeschlossen:"); out.push(p.exclusion.map((x) => `- ${x}`).join("\n")); }
  }
  const ag = o.agreement;
  const dual = ag && ag.n > 0 && ag.kappa != null;
  out.push(`Dubletten wurden vor dem Screening entfernt. Titel und Abstracts wurden${dual ? " von zwei Personen unabhängig voneinander" : ""} anhand der Eignungskriterien gescreent; anschließend wurden die Volltexte potenziell geeigneter Berichte geprüft.${dual ? ` Die Übereinstimmung der Gutachtenden im Titel-/Abstract-Screening betrug ${Math.round((ag!.observed ?? 0) * 100)} % (Cohens κ = ${ag!.kappa!.toFixed(2).replace(".", ",")}); Unstimmigkeiten wurden durch Diskussion geklärt.` : ""} Ein KI-Werkzeug wurde ausschließlich für Vorschläge zu Screening-Entscheidungen eingesetzt; alle Entscheidungen traf das Review-Team.`);
  const extra = (p.extractionFields ?? []).filter(Boolean);
  if (o.extracted) out.push(`Die Daten der eingeschlossenen Studien wurden mit einem standardisierten Formular extrahiert (Design, Setting, Stichprobe, Variablen, Endpunkte und zentrale Ergebnisse${extra.length ? `; ${extra.join("; ")}` : ""}).`);
  if (o.appraised) out.push(appraisalSentence(o.tools, "de"));
  if (o.meta) out.push(metaMethodsSentence(o.meta.type, o.meta.model, "de"));
  out.push(...reportingParagraphs(p, "de", ["effectMeasures", "synthesis", "reportingBias", "certainty"]));
  out.push("### Ergebnisse des Auswahlprozesses");
  const reasons = Object.entries(c.excludedEligibility).sort((a, b) => b[1] - a[1]).map(([r, n]) => `${r} (n = ${n})`).join("; ");
  const cites = o.includedLabels?.length ? ` [[kaynak:${o.includedLabels.join(",")}]]` : "";
  out.push(`Die Suchen ergaben ${c.identified} Datensätze. Nach Entfernung von ${c.duplicates} Dubletten wurden ${c.screened} Datensätze anhand von Titel und Abstract gescreent und ${c.excludedScreening} ausgeschlossen. Von ${c.sought} zur Beschaffung gesuchten Berichten waren ${c.notRetrieved} nicht verfügbar; ${c.assessed} Volltexte wurden auf Eignung geprüft und ${c.excludedEligibilityTotal} ausgeschlossen${reasons ? ` (${reasons})` : ""}. Insgesamt wurden ${c.included} Studien in das Review eingeschlossen${cites} (Abbildung 1).`);
  if (c.pendingScreening || c.pendingEligibility) out.push(`*Anmerkung: Für ${c.pendingScreening + c.pendingEligibility} Datensätze steht die Entscheidung noch aus; aktualisieren Sie diesen Text nach Abschluss des Screenings.*`);
  if (p.searches.length) {
    out.push("*Tabelle 1. Suchstrategie*");
    out.push(["| Datenbank | Suchstring | Datum | Treffer |", "|---|---|---|---|", ...p.searches.map((s) => `| ${s.database.replace(/\|/g, "/")} | ${s.query.replace(/\|/g, "/") || "-"} | ${s.date} | ${s.results || "-"} |`)].join("\n"));
  }
  const decl = reportingParagraphs(p, "de", ["funding", "competingInterests", "dataAvailability"]);
  if (decl.length) { out.push("### Weitere Angaben"); out.push(...decl); }
  return out.join("\n\n");
}

/** Dahil edilen çalışmaların özellikleri tablosu (Markdown): veri çıkarma alanları + kalite */
export function characteristicsMarkdown(rows: { label: string | null; title: string; year?: number | null; extraction?: Extraction | null; appraisal?: Appraisal | null }[], lang: "tr" | "en" | "de", extraFields: string[] = []): string {
  const en = lang === "en", de = lang === "de";
  const fields: ExtractionField[] = ["design", "country", "sample", "outcomes", "findings"];
  // D222: araca özgü genel karar (RoB 2 “bazı endişeler”, ROBINS-I “ciddi/kritik”, NOS yıldız sayısı)
  const L: Record<string, [string, string, string]> = { low: ["Düşük", "Low", "Niedrig"], moderate: ["Orta", "Moderate", "Mittel"], high: ["Yüksek", "High", "Hoch"], some: ["Bazı endişeler", "Some concerns", "Einige Bedenken"], serious: ["Ciddi", "Serious", "Schwerwiegend"], critical: ["Kritik", "Critical", "Kritisch"] };
  const li = en ? 1 : de ? 2 : 0;
  const riskLabel = (a: Appraisal | null | undefined) => {
    const sum = appraisalSummary(a);
    if (!sum.risk) return "-";
    const tool = appraisalTool(a?.tool);
    const base = sum.detail && L[sum.detail] ? L[sum.detail][li] : L[sum.risk][li];
    return tool.id === "general" ? base : `${base} (${tool.scale === "stars" ? `${sum.detail} ★` : tool.name[lang]})`;
  };
  const extra = extraFields.filter(Boolean);
  const head = `| ${en ? "Study" : de ? "Studie" : "Çalışma"} | ${[...fields.map((f) => EXTRACTION_LABELS[f][lang]), ...extra].join(" | ")} | ${en ? "Risk of bias" : de ? "Verzerrungsrisiko" : "Yanlılık riski"} |`;
  const clean = (s?: string) => (s ?? "-").replace(/\|/g, "/").replace(/\n/g, " ") || "-";
  const lines = rows.map((r) => `| ${r.label ? `[[kaynak:${r.label}|anlatı]]` : clean(`${r.title.slice(0, 60)}${r.year ? ` (${r.year})` : ""}`)} | ${[...fields.map((f) => clean(r.extraction?.[f]?.value)), ...extra.map((f) => clean(r.extraction?.custom?.[f]?.value))].join(" | ")} | ${riskLabel(r.appraisal)} |`);
  return [en ? "*Table 2. Characteristics of the included studies*" : de ? "*Tabelle 2. Merkmale der eingeschlossenen Studien*" : "*Tablo 2. Dahil edilen çalışmaların özellikleri*", [head, `|${"---|".repeat(fields.length + extra.length + 2)}`, ...lines].join("\n")].join("\n\n");
}

/* --- D222: PRISMA 2020 kontrol listesi (27 madde) --- */
type CheckStatus = "done" | "partial" | "todo" | "author";
const CHECK_ITEMS: { n: number; sec: L3; item: L3 }[] = [
  { n: 1, sec: { tr: "Başlık", en: "Title", de: "Titel" }, item: { tr: "Başlık", en: "Title", de: "Titel" } },
  { n: 2, sec: { tr: "Özet", en: "Abstract", de: "Abstract" }, item: { tr: "Özet", en: "Abstract", de: "Abstract" } },
  { n: 3, sec: { tr: "Giriş", en: "Introduction", de: "Einleitung" }, item: { tr: "Gerekçe", en: "Rationale", de: "Hintergrund" } },
  { n: 4, sec: { tr: "Giriş", en: "Introduction", de: "Einleitung" }, item: { tr: "Amaçlar", en: "Objectives", de: "Ziele" } },
  { n: 5, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Uygunluk ölçütleri", en: "Eligibility criteria", de: "Eignungskriterien" } },
  { n: 6, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Bilgi kaynakları", en: "Information sources", de: "Informationsquellen" } },
  { n: 7, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Arama stratejisi", en: "Search strategy", de: "Suchstrategie" } },
  { n: 8, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Seçim süreci", en: "Selection process", de: "Auswahlprozess" } },
  { n: 9, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Veri toplama süreci", en: "Data collection process", de: "Datenerhebungsprozess" } },
  { n: 10, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Veri öğeleri", en: "Data items", de: "Datenelemente" } },
  { n: 11, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Çalışmalarda yanlılık riski değerlendirmesi", en: "Study risk of bias assessment", de: "Bewertung des Verzerrungsrisikos" } },
  { n: 12, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Etki ölçüleri", en: "Effect measures", de: "Effektmaße" } },
  { n: 13, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Sentez yöntemleri", en: "Synthesis methods", de: "Synthesemethoden" } },
  { n: 14, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Raporlama yanlılığı değerlendirmesi", en: "Reporting bias assessment", de: "Bewertung von Berichtsverzerrungen" } },
  { n: 15, sec: { tr: "Yöntem", en: "Methods", de: "Methoden" }, item: { tr: "Kesinlik değerlendirmesi", en: "Certainty assessment", de: "Bewertung der Vertrauenswürdigkeit" } },
  { n: 16, sec: { tr: "Bulgular", en: "Results", de: "Ergebnisse" }, item: { tr: "Çalışma seçimi", en: "Study selection", de: "Studienauswahl" } },
  { n: 17, sec: { tr: "Bulgular", en: "Results", de: "Ergebnisse" }, item: { tr: "Çalışma özellikleri", en: "Study characteristics", de: "Studienmerkmale" } },
  { n: 18, sec: { tr: "Bulgular", en: "Results", de: "Ergebnisse" }, item: { tr: "Çalışmalarda yanlılık riski", en: "Risk of bias in studies", de: "Verzerrungsrisiko in den Studien" } },
  { n: 19, sec: { tr: "Bulgular", en: "Results", de: "Ergebnisse" }, item: { tr: "Bireysel çalışmaların sonuçları", en: "Results of individual studies", de: "Ergebnisse einzelner Studien" } },
  { n: 20, sec: { tr: "Bulgular", en: "Results", de: "Ergebnisse" }, item: { tr: "Sentez sonuçları", en: "Results of syntheses", de: "Ergebnisse der Synthesen" } },
  { n: 21, sec: { tr: "Bulgular", en: "Results", de: "Ergebnisse" }, item: { tr: "Raporlama yanlılıkları", en: "Reporting biases", de: "Berichtsverzerrungen" } },
  { n: 22, sec: { tr: "Bulgular", en: "Results", de: "Ergebnisse" }, item: { tr: "Kanıtın kesinliği", en: "Certainty of evidence", de: "Vertrauenswürdigkeit der Evidenz" } },
  { n: 23, sec: { tr: "Tartışma", en: "Discussion", de: "Diskussion" }, item: { tr: "Tartışma", en: "Discussion", de: "Diskussion" } },
  { n: 24, sec: { tr: "Diğer bilgiler", en: "Other information", de: "Weitere Angaben" }, item: { tr: "Kayıt ve protokol", en: "Registration and protocol", de: "Registrierung und Protokoll" } },
  { n: 25, sec: { tr: "Diğer bilgiler", en: "Other information", de: "Weitere Angaben" }, item: { tr: "Destek", en: "Support", de: "Förderung" } },
  { n: 26, sec: { tr: "Diğer bilgiler", en: "Other information", de: "Weitere Angaben" }, item: { tr: "Çıkar çatışması", en: "Competing interests", de: "Interessenkonflikte" } },
  { n: 27, sec: { tr: "Diğer bilgiler", en: "Other information", de: "Weitere Angaben" }, item: { tr: "Veri, kod ve diğer materyallerin erişilebilirliği", en: "Availability of data, code and other materials", de: "Verfügbarkeit von Daten, Code und weiteren Materialien" } },
];
const W: Record<string, L3> = {
  methods: { tr: "Yöntem metni", en: "Methods text", de: "Methodentext" },
  table1: { tr: "Yöntem metni, Tablo 1 (arama stratejisi)", en: "Methods text, Table 1 (search strategy)", de: "Methodentext, Tabelle 1 (Suchstrategie)" },
  flow: { tr: "Akış şeması ve sonuç metni (dışlama gerekçeleriyle)", en: "Flow diagram and results text (with exclusion reasons)", de: "Flussdiagramm und Ergebnistext (mit Ausschlussgründen)" },
  table2: { tr: "Tablo 2 (çalışma özellikleri)", en: "Table 2 (study characteristics)", de: "Tabelle 2 (Studienmerkmale)" },
  table2rob: { tr: "Tablo 2, yanlılık riski sütunu", en: "Table 2, risk of bias column", de: "Tabelle 2, Spalte Verzerrungsrisiko" },
  metaText: { tr: "Meta-analiz sonuçları ve orman grafiği", en: "Meta-analysis results and forest plot", de: "Ergebnisse der Metaanalyse und Forest-Plot" },
  metaTable: { tr: "Meta-analiz tablosu (çalışma etkileri)", en: "Meta-analysis table (study effects)", de: "Metaanalyse-Tabelle (Studieneffekte)" },
  metaBias: { tr: "Meta-analiz: huni grafiği ve Egger testi", en: "Meta-analysis: funnel plot and Egger’s test", de: "Metaanalyse: Funnel-Plot und Egger-Test" },
  other: { tr: "Yöntem metni, “Diğer bilgiler”", en: "Methods text, “Other information”", de: "Methodentext, „Weitere Angaben“" },
  author: { tr: "Sizin metniniz", en: "Your text", de: "Ihr Text" },
};
const TODO: Partial<Record<number, L3>> = {
  1: { tr: "Başlıkta çalışmanın sistematik derleme olduğu belirtilmeli.", en: "Identify the report as a systematic review in the title.", de: "Im Titel als systematisches Review kennzeichnen." },
  2: { tr: "Özet, PRISMA 2020 özet kontrol listesine göre yazılmalı.", en: "Write the abstract following the PRISMA 2020 for Abstracts checklist.", de: "Abstract gemäß PRISMA-2020-Checkliste für Abstracts." },
  3: { tr: "Derlemenin gerekçesi girişte açıklanmalı.", en: "Describe the rationale in the introduction.", de: "Begründung in der Einleitung darstellen." },
  19: { tr: "Her çalışma için özet istatistikler ve etki tahmini (güven aralığıyla) verilmeli.", en: "Give summary statistics and effect estimates with confidence intervals for each study.", de: "Für jede Studie Kennwerte und Effektschätzer mit Konfidenzintervall angeben." },
  20: { tr: "Sentezin sonuçları (meta-analiz ya da anlatı sentezi) raporlanmalı.", en: "Report the results of the syntheses (meta-analysis or narrative).", de: "Ergebnisse der Synthesen berichten." },
  21: { tr: "Raporlama yanlılığı değerlendirmesinin sonucu yazılmalı.", en: "Report the assessment of reporting biases.", de: "Ergebnisse der Bewertung von Berichtsverzerrungen angeben." },
  22: { tr: "Her sonuç için kanıtın kesinliği (ör. GRADE) raporlanmalı.", en: "Report the certainty of evidence for each outcome (e.g. GRADE).", de: "Vertrauenswürdigkeit der Evidenz je Endpunkt angeben (z. B. GRADE)." },
  23: { tr: "Tartışmada sınırlılıklar ve çıkarımlar ele alınmalı.", en: "Discuss limitations and implications.", de: "Limitationen und Implikationen diskutieren." },
};

export interface ChecklistRow { n: number; section: string; item: string; status: CheckStatus; where: string; note: string }
/**
 * D222: PRISMA 2020 kontrol listesinin 27 maddesi için modülün neyi raporladığı. “Tamam” yalnızca modülün yöntem/sonuç
 * metni, akış şeması veya tablolarıyla gerçekten karşılanan maddelerdir; araştırmacının yazacağı maddeler açıkça belirtilir.
 */
export function prismaChecklist(o: { protocol: ReviewProtocol; counts: PrismaCounts; lang: "tr" | "en" | "de"; dualKappa: boolean; extracted: number; appraised: number; meta?: { k: number } | null }): ChecklistRow[] {
  const { protocol: p, counts: c, lang } = o;
  const rep = (f: ReportingField) => !!p.reporting?.[f]?.trim();
  const searchesDated = p.searches.length > 0 && p.searches.every((s) => s.date);
  const searchesQueried = p.searches.length > 0 && p.searches.every((s) => s.query.trim());
  const need = (tr: string, en: string, de: string) => ({ tr, en, de })[lang];
  const st = (n: number): [CheckStatus, keyof typeof W, string] => {
    switch (n) {
      case 1: case 2: case 3: case 23: return ["author", "author", TODO[n]![lang]];
      case 4: return p.question.trim() ? ["done", "methods", ""] : ["todo", "methods", need("Protokolde araştırma sorusu yazılmadı.", "No review question in the protocol.", "Keine Fragestellung im Protokoll.")];
      case 5: return p.inclusion.length || p.exclusion.length ? ["done", "methods", ""] : ["todo", "methods", need("Dahil etme / hariç tutma ölçütleri girilmedi.", "No eligibility criteria entered.", "Keine Eignungskriterien eingetragen.")];
      case 6: return searchesDated ? ["done", "methods", ""] : p.searches.length ? ["partial", "methods", need("Bazı aramalarda tarih yok.", "Some searches lack a date.", "Bei einigen Suchen fehlt das Datum.")] : ["todo", "methods", need("Arama kaydı yok.", "No searches recorded.", "Keine Suchen erfasst.")];
      case 7: return searchesQueried ? ["done", "table1", ""] : p.searches.length ? ["partial", "table1", need("Bazı aramalarda arama ifadesi yok.", "Some searches lack the search string.", "Bei einigen Suchen fehlt der Suchstring.")] : ["todo", "table1", need("Arama ifadesi kaydı yok.", "No search strings recorded.", "Keine Suchstrings erfasst.")];
      case 8: return o.dualKappa ? ["done", "methods", ""] : ["partial", "methods", need("Kaç kişinin bağımsız taradığı yazılmadı (çift değerlendirici modunu açın ya da metne ekleyin).", "Number of independent reviewers not reported (enable dual-reviewer mode or add it).", "Anzahl unabhängiger Gutachtender fehlt (Doppelbegutachtung aktivieren oder ergänzen).")];
      case 9: return o.extracted ? ["partial", "methods", need("Veriyi kaç kişinin, bağımsız olarak mı çıkardığını ekleyin.", "Add how many reviewers extracted data and whether independently.", "Angeben, wie viele Personen unabhängig extrahiert haben.")] : ["todo", "methods", need("Veri çıkarılmadı.", "No data extracted.", "Keine Daten extrahiert.")];
      case 10: return o.extracted ? ["done", "methods", ""] : ["todo", "methods", need("Veri çıkarılmadı.", "No data extracted.", "Keine Daten extrahiert.")];
      case 11: return o.appraised ? ["done", "methods", ""] : ["todo", "methods", need("Yanlılık riski değerlendirilmedi.", "Risk of bias not assessed.", "Verzerrungsrisiko nicht bewertet.")];
      case 12: return rep("effectMeasures") || o.meta ? ["done", "methods", ""] : ["todo", "methods", need("Protokol → Raporlama bilgileri → Etki ölçüleri.", "Protocol → Reporting details → Effect measures.", "Protokoll → Berichtsangaben → Effektmaße.")];
      case 13: return rep("synthesis") || o.meta ? ["done", "methods", ""] : ["todo", "methods", need("Protokol → Raporlama bilgileri → Sentez yöntemleri.", "Protocol → Reporting details → Synthesis methods.", "Protokoll → Berichtsangaben → Synthesemethoden.")];
      case 14: return o.meta && o.meta.k >= 10 ? ["done", "metaBias", ""] : o.meta ? ["partial", "metaBias", need("Çalışma sayısı 10’dan az: Egger testi düşük güçlü, dikkatle yorumlayın.", "Fewer than 10 studies: Egger’s test has low power; interpret with caution.", "Weniger als 10 Studien: Der Egger-Test hat geringe Power; mit Vorsicht interpretieren.")] : rep("reportingBias") ? ["done", "methods", ""] : ["todo", "methods", need("Protokol → Raporlama bilgileri → Raporlama yanlılığı.", "Protocol → Reporting details → Reporting bias.", "Protokoll → Berichtsangaben → Berichtsverzerrungen.")];
      case 15: return rep("certainty") ? ["done", "methods", ""] : ["todo", "methods", need("Protokol → Raporlama bilgileri → Kanıtın kesinliği.", "Protocol → Reporting details → Certainty of evidence.", "Protokoll → Berichtsangaben → Vertrauenswürdigkeit.")];
      case 16: return c.identified ? (c.pendingScreening + c.pendingEligibility ? ["partial", "flow", need("Karar bekleyen kayıtlar var.", "Some records still await a decision.", "Einige Datensätze sind noch offen.")] : ["done", "flow", ""]) : ["todo", "flow", need("Kayıt yok.", "No records.", "Keine Datensätze.")];
      case 17: return o.extracted ? ["done", "table2", ""] : ["todo", "table2", need("Veri çıkarılmadı.", "No data extracted.", "Keine Daten extrahiert.")];
      case 18: return o.appraised ? ["done", "table2rob", ""] : ["todo", "table2rob", need("Yanlılık riski değerlendirilmedi.", "Risk of bias not assessed.", "Verzerrungsrisiko nicht bewertet.")];
      case 19: return o.meta ? ["done", "metaTable", ""] : o.extracted ? ["partial", "table2", TODO[19]![lang]] : ["author", "author", TODO[19]![lang]];
      case 20: return o.meta ? ["done", "metaText", ""] : ["author", "author", TODO[20]![lang]];
      case 21: return o.meta ? (o.meta.k >= 10 ? ["done", "metaBias", ""] : ["partial", "metaBias", need("Çalışma sayısı 10’dan az; huni grafiği ve Egger testi sınırlı bilgi verir.", "Fewer than 10 studies; the funnel plot and Egger’s test give limited information.", "Weniger als 10 Studien; Funnel-Plot und Egger-Test sind nur begrenzt aussagekräftig.")]) : ["author", "author", TODO[21]![lang]];
      case 22: return ["author", "author", TODO[22]![lang]];
      case 24: return rep("registration") ? ["done", "methods", ""] : ["todo", "methods", need("Kayıt yoksa “Protokol kaydedilmemiştir.” diye belirtin.", "If not registered, state that the review was not registered.", "Falls nicht registriert, dies angeben.")];
      case 25: return rep("funding") ? ["done", "other", ""] : ["todo", "other", need("Protokol → Raporlama bilgileri → Destek.", "Protocol → Reporting details → Support.", "Protokoll → Berichtsangaben → Förderung.")];
      case 26: return rep("competingInterests") ? ["done", "other", ""] : ["todo", "other", need("Protokol → Raporlama bilgileri → Çıkar çatışması.", "Protocol → Reporting details → Competing interests.", "Protokoll → Berichtsangaben → Interessenkonflikte.")];
      default: return rep("dataAvailability") ? ["done", "other", ""] : ["todo", "other", need("Kayıt listesi ve veri çıkarma tablosu CSV olarak indirilebilir; erişim bilgisini yazın.", "Records and extraction table can be downloaded as CSV; state where they are available.", "Datensätze und Extraktionstabelle sind als CSV verfügbar; Verfügbarkeit angeben.")];
    }
  };
  return CHECK_ITEMS.map((x) => { const [status, where, note] = st(x.n); return { n: x.n, section: x.sec[lang], item: x.item[lang], status, where: W[where][lang], note }; });
}
const STATUS_TEXT: Record<CheckStatus, L3> = { done: { tr: "Raporlandı", en: "Reported", de: "Berichtet" }, partial: { tr: "Kısmen", en: "Partly", de: "Teilweise" }, todo: { tr: "Eksik", en: "Missing", de: "Fehlt" }, author: { tr: "Yazar ekleyecek", en: "Author to add", de: "Von Autor/in zu ergänzen" } };
export const checklistStatusText = (s: CheckStatus, lang: "tr" | "en" | "de") => STATUS_TEXT[s][lang];
/** Kontrol listesi tablosu (Markdown): derginin istediği “PRISMA 2020 Checklist” ekinin taslağı */
export function checklistMarkdown(rows: ChecklistRow[], lang: "tr" | "en" | "de"): string {
  const h = lang === "en" ? ["Section", "#", "Checklist item", "Location where reported", "Status"] : lang === "de" ? ["Abschnitt", "Nr.", "Checklistenpunkt", "Ort im Bericht", "Status"] : ["Bölüm", "No", "Madde", "Raporlandığı yer", "Durum"];
  const cap = lang === "en" ? "*PRISMA 2020 checklist*" : lang === "de" ? "*PRISMA-2020-Checkliste*" : "*PRISMA 2020 kontrol listesi*";
  const esc = (x: string) => x.replace(/\|/g, "/");
  return [cap, [`| ${h.join(" | ")} |`, `|${"---|".repeat(5)}`, ...rows.map((r) => `| ${r.section} | ${r.n} | ${esc(r.item)} | ${esc(r.where)} | ${STATUS_TEXT[r.status][lang]}${r.note ? ` — ${esc(r.note)}` : ""} |`)].join("\n")].join("\n\n");
}
