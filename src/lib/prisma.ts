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
export interface ReviewRecord { id: string; key: string; origin: string; stage: ReviewStage; reason: string | null; record: ReviewRecordData; ai?: { decision: "include" | "exclude" | "unsure"; reason: string } | null; source_id?: string | null }

export interface ReviewProtocol {
  question: string;
  inclusion: string[];
  exclusion: string[];
  /** Veri tabanları ve arama ifadeleri (raporlama için) */
  searches: { database: string; query: string; date: string; results: number }[];
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
};

export function prismaSvg(c: PrismaCounts, lang: "tr" | "en" = "tr"): { svg: string; width: number; height: number } {
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
