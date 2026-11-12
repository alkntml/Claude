/**
 * Belge biçim şablonları (Word/PDF dışa aktarma). Değerler projenin context.format alanında saklanır;
 * kullanıcı hazır şablonu seçip üniversitesinin kılavuzuna göre düzenler.
 */
export interface CoverInfo {
  showTC?: boolean;
  university?: string;
  institute?: string;
  department?: string;
  programme?: string;
  thesisType?: string;
  advisor?: string;
  city?: string;
  year?: string;
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
  cover: CoverInfo;
}

export const FORMAT_PRESETS: Record<string, { label: string; format: Omit<DocFormat, "cover" | "preset"> }> = {
  "tez-tr": {
    label: "Türk üniversiteleri — genel tez yazım kılavuzu",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 1.5, margins: { top: 3, bottom: 2.5, left: 3.5, right: 2.5 }, firstLineIndentCm: 1.25, paragraphAfterPt: 6, justify: true, chapterOnNewPage: true, chapterTitleUppercase: true, chapterTitleCenter: true, pageNumber: "bottom-center" },
  },
  "apa7-student": {
    label: "APA 7 — öğrenci ödevi / tez",
    format: { fontFamily: "Times New Roman", fontSizePt: 12, lineSpacing: 2, margins: { top: 2.54, bottom: 2.54, left: 2.54, right: 2.54 }, firstLineIndentCm: 1.27, paragraphAfterPt: 0, justify: false, chapterOnNewPage: false, chapterTitleUppercase: false, chapterTitleCenter: true, pageNumber: "top-right" },
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
    cover: raw?.cover ?? {},
  };
}

/** Kapak satırları (Türk tezlerinde yaygın düzen). Boş alanlar atlanır. */
export function coverLines(f: DocFormat, d: { title: string; subtitle: string; author: string; date: string; language: "tr" | "en" | "de" }) {
  const c = f.cover;
  const up = (s?: string) => (s ? (d.language === "tr" ? s.toLocaleUpperCase("tr") : s.toLocaleUpperCase(d.language)) : "");
  const top = [c.showTC && d.language === "tr" ? "T.C." : "", up(c.university), up(c.institute), up(c.department), up(c.programme)].filter(Boolean);
  const advisorLabel = d.language === "tr" ? "Danışman" : d.language === "de" ? "Betreuung" : "Supervisor";
  return {
    top,
    title: f.chapterTitleUppercase ? up(d.title) : d.title,
    subtitle: d.subtitle,
    thesisType: up(c.thesisType),
    author: d.author,
    advisor: c.advisor ? `${advisorLabel}\n${c.advisor}` : "",
    bottom: [c.city, c.year || d.date].filter(Boolean).join(d.language === "tr" ? ", " : ", "),
  };
}

export const CM = 567; // twip / cm
