/**
 * Belge biçim şablonları (Word/PDF dışa aktarma). Değerler projenin context.format alanında saklanır;
 * kullanıcı hazır şablonu seçip üniversitesinin kılavuzuna göre düzenler.
 */
export interface CoverInfo {
  showTC?: boolean;
  university?: string;
  /** D178: fakülte (enstitü ile birlikte veya yerine) */
  faculty?: string;
  institute?: string;
  department?: string;
  programme?: string;
  thesisType?: string;
  advisor?: string;
  city?: string;
  year?: string;
  /** D178: ay (boşsa dışa aktarma ayı) */
  month?: string;
  /** D178: kapakta üniversite logosu için ayrılan yer (varsayılan açık) */
  logoSpace?: boolean;
}

export interface DocFormat {
  preset: string;
  fontFamily: string;
  fontSizePt: number;
  lineSpacing: number;
  /** cm */
  margins: { top: number; bottom: number; left: number; right: number };
  firstLineIndentCm: number;
  paragraphAfterPt: number;
  justify: boolean;
  chapterOnNewPage: boolean;
  chapterTitleUppercase: boolean;
  chapterTitleCenter: boolean;
  pageNumber: "bottom-center" | "bottom-right" | "top-right";
  /**
   * D178: belge düzeni — "submission": kapak + içindekiler + (varsa) tablo/şekil listeleri (üniversite/ders teslimi);
   * "journal": kapaksız dergi gönderim düzeni (başlık ilk sayfanın üstünde). Boşsa çalışma türü ve belge amacından seçilir.
   */
  layout?: "submission" | "journal";
  /** Biçim kaydı sürümü (2: başlık hizası kullanıcı seçimi olarak saklanır) */
  v?: number;
  cover: CoverInfo;
}

export const FORMAT_PRESETS: Record<string, { label: string; format: Omit<DocFormat, "cover" | "preset"> }> = {
  "tez-tr": {
    label: "Türk üniversiteleri — genel tez yazım kılavuzu",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 1.5, margins: { top: 3, bottom: 2.5, left: 3.5, right: 2.5 }, firstLineIndentCm: 1.25, paragraphAfterPt: 6, justify: true, chapterOnNewPage: true, chapterTitleUppercase: true, chapterTitleCenter: false, pageNumber: "bottom-center" },
  },
  "apa7-student": {
    // D180: APA 7 resmî kuralı — 1. düzey başlık ortalı, kalın; alt düzeyler sola yaslı
    label: "APA 7 — öğrenci ödevi / tez",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 2, margins: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 }, firstLineIndentCm: 1.27, paragraphAfterPt: 0, justify: false, chapterOnNewPage: false, chapterTitleUppercase: false, chapterTitleCenter: true, pageNumber: "top-right" },
  },
  // D179: yazım stillerinin öğrenci/el yazması biçimi (stilin resmî kılavuzundaki temel değerler)
  mla9: {
    label: "MLA 9 — öğrenci ödevi",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 2, margins: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 }, firstLineIndentCm: 1.27, paragraphAfterPt: 0, justify: false, chapterOnNewPage: false, chapterTitleUppercase: false, chapterTitleCenter: false, pageNumber: "top-right" },
  },
  chicago: {
    label: "Chicago 17 / Turabian 9 — öğrenci ödevi",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 2, margins: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 }, firstLineIndentCm: 1.27, paragraphAfterPt: 0, justify: false, chapterOnNewPage: false, chapterTitleUppercase: false, chapterTitleCenter: false, pageNumber: "bottom-center" },
  },
  harvard: {
    label: "Harvard — öğrenci ödevi",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 1.5, margins: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 }, firstLineIndentCm: 0, paragraphAfterPt: 12, justify: true, chapterOnNewPage: false, chapterTitleUppercase: false, chapterTitleCenter: false, pageNumber: "bottom-center" },
  },
  ieee: {
    label: "IEEE — teknik rapor",
    format: { fontFamily: "Times New Roman", fontSizePt: 10, lineSpacing: 1, margins: { top: 1.9, bottom: 2.54, left: 1.9, right: 1.9 }, firstLineIndentCm: 0.36, paragraphAfterPt: 0, justify: true, chapterOnNewPage: false, chapterTitleUppercase: true, chapterTitleCenter: false, pageNumber: "bottom-center" },
  },
  medical: {
    label: "Vancouver / AMA — el yazması",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 2, margins: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 }, firstLineIndentCm: 0, paragraphAfterPt: 0, justify: false, chapterOnNewPage: false, chapterTitleUppercase: false, chapterTitleCenter: false, pageNumber: "top-right" },
  },
  isnad: {
    label: "ISNAD 2 — Türkçe makale/ödev",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 1.5, margins: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 }, firstLineIndentCm: 1.25, paragraphAfterPt: 6, justify: true, chapterOnNewPage: false, chapterTitleUppercase: false, chapterTitleCenter: false, pageNumber: "bottom-center" },
  },
  article: {
    label: "Dergi makalesi taslağı",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 1.15, margins: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 }, firstLineIndentCm: 1, paragraphAfterPt: 6, justify: true, chapterOnNewPage: false, chapterTitleUppercase: false, chapterTitleCenter: false, pageNumber: "bottom-center" },
  },
};

export const FONT_CHOICES = ["Times New Roman", "Arial", "Calibri", "Cambria", "Georgia", "Garamond"];

/** Eski kayıtlarla uyumlu: eksik alanlar şablondan tamamlanır. */
export function resolveFormat(raw: Partial<DocFormat> | null | undefined): DocFormat {
  const preset = raw?.preset && FORMAT_PRESETS[raw.preset] ? raw.preset : "tez-tr";
  const base = FORMAT_PRESETS[preset].format;
  const num = (v: unknown, d: number, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d);
  return {
    ...base,
    ...(raw ?? {}),
    preset,
    fontFamily: raw?.fontFamily || base.fontFamily,
    fontSizePt: num(raw?.fontSizePt, base.fontSizePt, 8, 16),
    lineSpacing: num(raw?.lineSpacing, base.lineSpacing, 1, 3),
    margins: {
      top: num(raw?.margins?.top, base.margins.top, 1, 6), bottom: num(raw?.margins?.bottom, base.margins.bottom, 1, 6),
      left: num(raw?.margins?.left, base.margins.left, 1, 6), right: num(raw?.margins?.right, base.margins.right, 1, 6),
    },
    firstLineIndentCm: num(raw?.firstLineIndentCm, base.firstLineIndentCm, 0, 3),
    paragraphAfterPt: num(raw?.paragraphAfterPt, base.paragraphAfterPt, 0, 24),
    // D178: bölüm başlıkları varsayılan olarak sola yaslı; eski kayıtlardaki (v<2) şablondan gelen “ortalı” değeri uygulanmaz
    chapterTitleCenter: raw?.v === 2 && typeof raw.chapterTitleCenter === "boolean" ? raw.chapterTitleCenter : base.chapterTitleCenter,
    cover: { logoSpace: true, showTC: true, ...(raw?.cover ?? {}) },
  };
}

/**
 * D179: projenin varsayılan biçim şablonu — tez ve bitirme projesi Türk üniversitesi tez kılavuzu düzeninde; dergi
 * gönderiminde dergi taslağı; diğerlerinde seçilen yazım stilinin (APA, MLA, Chicago, Harvard, IEEE, Vancouver/AMA,
 * ISNAD) öğrenci ödevi biçimi. Kullanıcı biçim penceresinden veya yazım kılavuzu yükleyerek değiştirir.
 */
export function defaultPreset(p: { workType?: string | null; citationStyle?: string | null; documentPurpose?: string | null }): string {
  if (p.documentPurpose === "journal" || p.workType === "journal_article") return "article";
  if (p.workType === "thesis" || p.workType === "capstone" || p.documentPurpose === "institute") return "tez-tr";
  switch (p.citationStyle) {
    case "apa7": case "apa6": return "apa7-student";
    case "mla": return "mla9";
    case "chicago": case "turabian": return "chicago";
    case "harvard": return "harvard";
    case "ieee": return "ieee";
    case "vancouver": case "ama": return "medical";
    case "isnad": return "isnad";
    default: return "tez-tr";
  }
}

/** D179: projenin dışa aktarmada kullanılan tam biçimi (kayıtlı ayarlar + varsayılan şablon) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function effectiveFormat(project: any): DocFormat {
  const raw = (project?.context?.format ?? {}) as Partial<DocFormat>;
  const preset = raw.preset && FORMAT_PRESETS[raw.preset] ? raw.preset : defaultPreset({ workType: project?.work_type, citationStyle: project?.citation_style, documentPurpose: project?.context?.documentPurpose });
  return resolveFormat({ ...raw, preset });
}

/** D178: çalışma türü ve düzeyden kapaktaki tür satırı (kullanıcı “Çalışma türü”nü yazmadıysa) */
export function workTypeLabel(workType: string, level: string, lang: "tr" | "en" | "de"): string {
  const L: Record<string, Record<string, [string, string, string]>> = {
    thesis: { bachelor: ["Lisans Bitirme Tezi", "Bachelor’s Thesis", "Bachelorarbeit"], master: ["Yüksek Lisans Tezi", "Master’s Thesis", "Masterarbeit"], doctorate: ["Doktora Tezi", "Doctoral Dissertation", "Dissertation"] },
  };
  const other: Record<string, [string, string, string]> = {
    research_article: ["Araştırma Makalesi", "Research Article", "Forschungsartikel"], journal_article: ["Bilimsel Makale", "Journal Article", "Zeitschriftenartikel"],
    capstone: ["Bitirme Projesi", "Capstone Project", "Abschlussprojekt"], literature_review: ["Literatür Taraması", "Literature Review", "Literaturübersicht"],
    research_proposal: ["Araştırma Önerisi", "Research Proposal", "Forschungsexposé"], grant_proposal: ["Proje Önerisi", "Project Proposal", "Projektantrag"],
    thesis: ["Tez", "Thesis", "Abschlussarbeit"],
  };
  const i = lang === "en" ? 1 : lang === "de" ? 2 : 0;
  return (L[workType]?.[level] ?? other[workType])?.[i] ?? "";
}

/** D178: hangi düzen — kullanıcı seçtiyse o; değilse dergi makalesinde/dergi amacında dergi düzeni, diğerlerinde teslim düzeni */
export function resolveLayout(f: DocFormat, p: { workType?: string; documentPurpose?: string | null }): "submission" | "journal" {
  if (f.layout === "submission" || f.layout === "journal") return f.layout;
  if (p.documentPurpose === "journal" || p.workType === "journal_article") return "journal";
  return "submission";
}

/**
 * Kapak satırları (D178, Türk üniversitelerinde yaygın düzen): logo yeri · T.C. · ÜNİVERSİTE · FAKÜLTE/ENSTİTÜ ·
 * BÖLÜM/ANABİLİM DALI · (program) — başlık — çalışma türü — yazar — danışman — ŞEHİR · AY YIL.
 * Üniversite, fakülte ve bölüm girilmemişse köşeli parantezli doldurma alanı yazılır (belgede eksik bilgi görünür kalır, uydurulmaz).
 */
export function coverLines(f: DocFormat, d: { title: string; subtitle: string; author: string; date: string; language: "tr" | "en" | "de"; institution?: string; workType?: string; level?: string }) {
  const c = f.cover;
  const lang = d.language;
  const up = (s?: string) => (s ? (lang === "tr" ? s.toLocaleUpperCase("tr") : s.toLocaleUpperCase(lang)) : "");
  const ph = (tr: string, en: string, de: string) => (lang === "en" ? `[${en}]` : lang === "de" ? `[${de}]` : `[${tr}]`);
  const university = c.university || d.institution || "";
  const top = [
    c.showTC !== false && lang === "tr" ? "T.C." : "",
    up(university) || ph("ÜNİVERSİTE ADI", "UNIVERSITY NAME", "NAME DER HOCHSCHULE"),
    up(c.faculty) || (c.institute ? "" : ph("FAKÜLTE / ENSTİTÜ ADI", "FACULTY / INSTITUTE", "FAKULTÄT / INSTITUT")),
    up(c.institute),
    up(c.department) || ph("BÖLÜM / ANABİLİM DALI", "DEPARTMENT", "FACHBEREICH"),
    up(c.programme),
  ].filter(Boolean);
  const advisorLabel = lang === "tr" ? "Danışman" : lang === "de" ? "Betreuung" : "Supervisor";
  const now = new Date();
  const month = c.month || now.toLocaleDateString(lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-GB", { month: "long" });
  const year = c.year || String(now.getFullYear());
  return {
    logo: c.logoSpace !== false,
    top,
    title: up(d.title),
    subtitle: d.subtitle,
    thesisType: up(c.thesisType || workTypeLabel(d.workType ?? "", d.level ?? "", lang)),
    author: d.author,
    advisor: `${advisorLabel}\n${c.advisor || ph("Unvan Ad SOYAD", "Title First LAST", "Titel Vorname NACHNAME")}`,
    bottom: [up(c.city), `${up(month)} ${year}`].filter(Boolean).join(" – "),
  };
}

export const CM = 567; // twip / cm
