/**
 * Gelişmiş PDF okuma (D132) — saf fonksiyonlar (sunucu ve testler ortak).
 * PDF’ten çıkan ham metin akademik okumada sorun çıkarır: her sayfada tekrar eden dergi başlığı/sayfa numarası,
 * satır sonunda bölünmüş kelimeler (“inves-\ntigation”), bitişik harfler (ﬁ, ﬂ), paragraf içinde kırılmış satırlar ve
 * kanıt aramasını kirleten kaynakça. Burada sayfalar temizlenir, bölümler (Özet, Yöntem, Bulgular…) tanınır ve
 * taranmış (metni seçilemeyen) PDF tespit edilir.
 */

export type SectionId = "abstract" | "introduction" | "literature" | "method" | "results" | "discussion" | "conclusion" | "references" | "appendix";

export const SECTION_LABELS: Record<SectionId, { tr: string; en: string }> = {
  abstract: { tr: "Özet", en: "Abstract" },
  introduction: { tr: "Giriş", en: "Introduction" },
  literature: { tr: "Kuramsal çerçeve", en: "Literature review" },
  method: { tr: "Yöntem", en: "Method" },
  results: { tr: "Bulgular", en: "Results" },
  discussion: { tr: "Tartışma", en: "Discussion" },
  conclusion: { tr: "Sonuç", en: "Conclusion" },
  references: { tr: "Kaynakça", en: "References" },
  appendix: { tr: "Ekler", en: "Appendix" },
};

/** Bölüm başlığı kalıpları (TR + EN; numaralı başlıklar dahil: “3. Method”, “III. YÖNTEM”) */
const HEADINGS: [SectionId, RegExp][] = [
  ["abstract", /^(abstract|özet|öz|summary)$/i],
  ["introduction", /^(introduction|giriş|background|arka ?plan)$/i],
  ["literature", /^(literature review|theoretical (framework|background)|related work|kuramsal çerçeve|kavramsal çerçeve|literatür( taraması)?|alanyazın)$/i],
  ["method", /^(methods?|methodology|materials and methods|research design|the study|yöntem|yöntem ve gereçler|araştırma yöntemi|metodoloji|gereç ve yöntem)$/i],
  ["results", /^(results?|findings|bulgular|sonuçlar ve bulgular)$/i],
  ["discussion", /^(discussion|general discussion|results and discussion|tartışma|tartışma ve yorum|bulgular ve tartışma)$/i],
  ["conclusion", /^(conclusions?|concluding remarks|implications|sonuç|sonuç ve öneriler|sonuçlar|öneriler)$/i],
  ["references", /^(references|reference list|bibliography|works cited|literature cited|kaynakça|kaynaklar|yararlanılan kaynaklar)$/i],
  ["appendix", /^(appendix|appendices|supplementary material|ek(ler)?)(\s+[a-z0-9]+)?$/i],
];

/** Bir satır bölüm başlığı mı? Numara ve noktalama atılır; çok uzun satırlar başlık sayılmaz. */
export function headingOf(line: string): SectionId | null {
  const s = line.trim().replace(/^((\d+(\.\d+)*|[IVX]+)[.)]?\s+)/, "").replace(/[:.]$/, "").trim();
  if (!s || s.length > 40) return null;
  for (const [id, re] of HEADINGS) if (re.test(s)) return id;
  return null;
}

const LIGATURES: Record<string, string> = { "ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl", "ﬃ": "ffi", "ﬄ": "ffl", "ﬅ": "st", "ﬆ": "st" };

/** Tekrar eden üst/alt bilgiyi bulmak için satırı sadeleştirir (sayılar # olur: “Page 3 of 12” = “Page # of #”) */
const shape = (l: string) => l.trim().toLocaleLowerCase("tr").replace(/\d+/g, "#").replace(/\s+/g, " ");

export interface CleanResult {
  pages: string[];
  /** Kaldırılan tekrar eden üst/alt bilgi satırı sayısı */
  removedLines: number;
  /** Metni seçilemeyen (taranmış) PDF olabilir mi? */
  scanned: boolean;
}

export function cleanPdfPages(raw: string[]): CleanResult {
  const pages = raw.map((p) => p.replace(/[ﬀﬁﬂﬃﬄﬅﬆ]/g, (m) => LIGATURES[m] ?? m).replace(/­/g, "").replace(/\r/g, ""));
  // Taranmış PDF: sayfa başına ortalama çok az metin
  const chars = pages.reduce((n, p) => n + p.replace(/\s/g, "").length, 0);
  const scanned = pages.length > 0 && chars / pages.length < 150;

  // Üst/alt bilgi: sayfaların ilk/son 3 satırında, sayfaların yarısından fazlasında tekrar eden satırlar
  const counts = new Map<string, number>();
  const lines = pages.map((p) => p.split("\n"));
  for (const ls of lines) {
    // Üst/alt bilgi kısa olur ve cümle gibi bitmez; gövde metnini yanlışlıkla silmemek için bu satırlar aday sayılmaz
    const edge = new Set([...ls.slice(0, 3), ...ls.slice(-3)].map(shape).filter((x) => x.length > 0 && x.length <= 90 && !/[.!?;,-]$/.test(x)));
    for (const e of edge) counts.set(e, (counts.get(e) ?? 0) + 1);
  }
  const min = Math.max(3, Math.ceil(pages.length * 0.5));
  const noisy = new Set([...counts].filter(([k, n]) => n >= min && k.length > 0).map(([k]) => k));
  let removedLines = 0;
  const cleaned = lines.map((ls) => {
    const keep = ls.filter((l, i) => {
      const edge = i < 3 || i >= ls.length - 3;
      const s = shape(l);
      // Tek başına sayfa numarası (“12”, “- 12 -”, “s. 12”)
      if (edge && /^[-–—\s]*(s\.|p\.|page|sayfa)?\s*#+\s*([-–—]\s*)?(of\s*#+)?$/i.test(s)) { removedLines++; return false; }
      if (edge && noisy.has(s)) { removedLines++; return false; }
      return true;
    });
    let text = keep.join("\n");
    // Satır sonunda bölünmüş kelime: “inves-\ntigation” → “investigation” (yalnız küçük harfle devam ediyorsa)
    text = text.replace(/(\p{L})-\n(\p{Ll})/gu, "$1$2");
    // Paragraf içi satır kırılmaları birleştirilir; boş satır ve başlık satırları korunur
    text = text.split(/\n{2,}/).map((para) => para.split("\n").reduce((acc, line) => {
      const t = line.trim();
      if (!t) return acc;
      if (!acc) return t;
      if (headingOf(t) || headingOf(acc.split("\n").pop() ?? "")) return `${acc}\n${t}`;
      return /[.!?:;]$/.test(acc) && /^[A-ZÇĞİÖŞÜ0-9•\-–(]/.test(t) && t.length < 60 ? `${acc}\n${t}` : `${acc} ${t}`;
    }, "")).join("\n\n");
    return text.trim();
  });
  return { pages: cleaned, removedLines, scanned };
}

export interface Segment { page: number; section: SectionId | null; text: string }

/**
 * Sayfaları bölümlere ayırır: başlık satırı görülünce sonraki metin o bölüme yazılır. Bölüm bilgisi parçalara
 * eklenir; kanıt ararken (ör. “yöntem” sorusu) ilgili bölüm öne alınır. İlk başlıktan önceki kısım (başlık, yazarlar,
 * özet bloğu) “abstract” sayılmaz; ancak metin “Abstract/Özet” ile başlıyorsa öyle işaretlenir.
 */
export function segmentPages(pages: string[]): Segment[] {
  const out: Segment[] = [];
  let current: SectionId | null = null;
  pages.forEach((p, pi) => {
    let buf = "";
    const flush = () => { if (buf.trim()) out.push({ page: pi + 1, section: current, text: buf.trim() }); buf = ""; };
    for (const line of p.split("\n")) {
      const h = headingOf(line);
      if (h) { flush(); current = h; continue; }
      buf += (buf ? "\n" : "") + line;
    }
    flush();
  });
  return out;
}

/** Kaynakça ve ekler kanıt aramasında gürültüdür; parçalara alınmaz (sayısı raporlanır). */
export function contentSegments(segs: Segment[]): { kept: Segment[]; droppedReferences: number } {
  const kept = segs.filter((s) => s.section !== "references" && s.section !== "appendix");
  return { kept: kept.length ? kept : segs, droppedReferences: segs.length - kept.length };
}

/** Hazır sorular ve iddia denetimi için bölüm öncelikleri */
export const SECTION_PREFS: Record<string, SectionId[]> = {
  summary: ["abstract", "conclusion", "discussion"],
  method: ["method"],
  sample: ["method"],
  findings: ["results", "discussion"],
  limitations: ["discussion", "conclusion"],
  relation: ["discussion", "conclusion"],
  quotes: ["discussion", "conclusion", "introduction"],
  definitions: ["introduction", "literature"],
};
