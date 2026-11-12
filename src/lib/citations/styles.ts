import type { CitationItem, CitationStyleId, CiteLocale, InTextOptions, Person, Rich, StyleMeta } from "./types";
import {
  clean, compareItems, doiUrl, endWith, familyOf, i, initials, isLiteral, mergeRich, normalizeDoi, pageRange,
  stripEndPunct, t,
} from "./util";

export const STYLES: Record<CitationStyleId, StyleMeta> = {
  apa7: { id: "apa7", label: "APA 7", family: "author-date", bibliographyTitle: { tr: "Kaynakça", en: "References", de: "Literaturverzeichnis" }, description: "American Psychological Association, 7. baskı" },
  isnad: { id: "isnad", label: "ISNAD 2 (metin içi)", family: "author-date", bibliographyTitle: { tr: "Kaynakça", en: "Bibliography", de: "Literaturverzeichnis" }, description: "İSNAD Atıf Sistemi, 2. edisyon, metin içi atıf (yazar-tarih)" },
  apa6: { id: "apa6", label: "APA 6", family: "author-date", bibliographyTitle: { tr: "Kaynakça", en: "References", de: "Literaturverzeichnis" }, description: "American Psychological Association, 6. baskı" },
  chicago: { id: "chicago", label: "Chicago (yazar-tarih)", family: "author-date", bibliographyTitle: { tr: "Kaynakça", en: "References", de: "Literaturverzeichnis" }, description: "Chicago Manual of Style 17, yazar-tarih sistemi" },
  turabian: { id: "turabian", label: "Turabian (yazar-tarih)", family: "author-date", bibliographyTitle: { tr: "Kaynakça", en: "Reference List", de: "Literaturverzeichnis" }, description: "Turabian 9, yazar-tarih (reference list) sistemi" },
  harvard: { id: "harvard", label: "Harvard", family: "author-date", bibliographyTitle: { tr: "Kaynakça", en: "Reference list", de: "Literaturverzeichnis" }, description: "Harvard (Cite Them Right) sistemi" },
  mla: { id: "mla", label: "MLA 9", family: "author-page", bibliographyTitle: { tr: "Kaynakça", en: "Works Cited", de: "Zitierte Werke" }, description: "Modern Language Association, 9. baskı" },
  vancouver: { id: "vancouver", label: "Vancouver", family: "numeric", bibliographyTitle: { tr: "Kaynaklar", en: "References", de: "Literaturverzeichnis" }, description: "ICMJE / NLM Vancouver sistemi" },
  ieee: { id: "ieee", label: "IEEE", family: "numeric", bibliographyTitle: { tr: "Kaynaklar", en: "References", de: "Literaturverzeichnis" }, description: "Institute of Electrical and Electronics Engineers" },
  ama: { id: "ama", label: "AMA 11", family: "numeric", bibliographyTitle: { tr: "Kaynaklar", en: "References", de: "Literaturverzeichnis" }, description: "American Medical Association, 11. baskı" },
};

export const STYLE_IDS = Object.keys(STYLES) as CitationStyleId[];

interface Terms {
  and: string; amp: string; etal: string; p: string; pp: string; nd: string; ed: string; eds: string;
  editionSuffix: string; in: string; retrieved: string; availableAt: string; accessed: string;
  thesisDoctoral: string; thesisMaster: string; preprint: string; thesisNo: string; thesisArt: string; yokArchive: string;
}

const TERMS: Record<CiteLocale, Terms> = {
  en: { and: "and", amp: "&", etal: "et al.", p: "p.", pp: "pp.", nd: "n.d.", ed: "Ed.", eds: "Eds.", editionSuffix: "ed.", in: "In", retrieved: "Retrieved from", availableAt: "Available at:", accessed: "Accessed", thesisDoctoral: "Doctoral dissertation", thesisMaster: "Master's thesis", preprint: "Preprint", thesisNo: "Publication No.", thesisArt: "Proficiency in art thesis", yokArchive: "YÖK National Thesis Center" },
  tr: { and: "ve", amp: "&", etal: "vd.", p: "s.", pp: "ss.", nd: "t.y.", ed: "Ed.", eds: "Ed.", editionSuffix: "bs.", in: "İçinde", retrieved: "Erişim adresi:", availableAt: "Erişim adresi:", accessed: "Erişim tarihi:", thesisDoctoral: "Doktora tezi", thesisMaster: "Yüksek lisans tezi", preprint: "Ön baskı", thesisNo: "Tez No.", thesisArt: "Sanatta yeterlik tezi", yokArchive: "YÖK Ulusal Tez Merkezi" },
  // Almanca: DGPs/APA’nın Almanca uygulaması (S., Hrsg., Aufl., o. J.)
  de: { and: "und", amp: "&", etal: "et al.", p: "S.", pp: "S.", nd: "o. J.", ed: "Hrsg.", eds: "Hrsg.", editionSuffix: "Aufl.", in: "In", retrieved: "Abgerufen von", availableAt: "Verfügbar unter:", accessed: "Zugriff am", thesisDoctoral: "Dissertation", thesisMaster: "Masterarbeit", preprint: "Preprint", thesisNo: "Publikationsnr.", thesisArt: "Künstlerische Doktorarbeit (Sanatta yeterlik)", yokArchive: "Nationales Thesenzentrum des YÖK" },
};

const MONTHS: Record<CiteLocale, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
};

export interface BibEntry {
  id: string;
  number?: number;
  rich: Rich;
}

export interface EngineOptions {
  locale?: CiteLocale;
  /** Metin içinde ilk geçiş sırasına göre kaynak kimlikleri (numaralı stiller için zorunlu). */
  citedOrder?: string[];
}

// ---------------------------------------------------------------------------
// Yazar listeleri
// ---------------------------------------------------------------------------

function nameFamilyInitials(p: Person, opts: { dots?: boolean; space?: boolean; comma?: boolean } = {}): string {
  if (isLiteral(p)) return familyOf(p);
  const ini = initials(p.given, { dots: opts.dots, space: opts.space });
  if (!ini) return familyOf(p);
  return opts.comma === false ? `${familyOf(p)} ${ini}` : `${familyOf(p)}, ${ini}`;
}

function nameFamilyGiven(p: Person): string {
  if (isLiteral(p)) return familyOf(p);
  return p.given ? `${familyOf(p)}, ${clean(p.given)}` : familyOf(p);
}

function nameGivenFamily(p: Person): string {
  if (isLiteral(p)) return familyOf(p);
  return p.given ? `${clean(p.given)} ${familyOf(p)}` : familyOf(p);
}

function nameInitialsFamily(p: Person): string {
  if (isLiteral(p)) return familyOf(p);
  const ini = initials(p.given);
  return ini ? `${ini} ${familyOf(p)}` : familyOf(p);
}

function apaAuthors(authors: Person[], style: "apa7" | "apa6", tm: Terms): string {
  const names = authors.map((a) => nameFamilyInitials(a));
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  const max = style === "apa7" ? 20 : 7;
  if (names.length > max) {
    const head = names.slice(0, max - 1);
    return `${head.join(", ")}, . . . ${names[names.length - 1]}`;
  }
  return `${names.slice(0, -1).join(", ")}, ${tm.amp} ${names[names.length - 1]}`;
}

function chicagoAuthors(authors: Person[], tm: Terms): string {
  if (authors.length === 0) return "";
  // Chicago 17: 10'dan fazla yazarda ilk yedi + et al.
  const list = authors.length > 10 ? authors.slice(0, 7) : authors;
  const names = list.map((a, idx) => (idx === 0 ? nameFamilyGiven(a) : nameGivenFamily(a)));
  if (authors.length > 10) return `${names.join(", ")}, ${tm.etal}`;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, ${tm.and} ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, ${tm.and} ${names[names.length - 1]}`;
}

function harvardAuthors(authors: Person[], tm: Terms): string {
  const names = authors.map((a) => nameFamilyInitials(a, { space: false }));
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} ${tm.and} ${names[names.length - 1]}`;
}

function mlaAuthors(authors: Person[], tm: Terms): string {
  if (authors.length === 0) return "";
  if (authors.length === 1) return nameFamilyGiven(authors[0]);
  if (authors.length === 2) return `${nameFamilyGiven(authors[0])}, ${tm.and} ${nameGivenFamily(authors[1])}`;
  return `${nameFamilyGiven(authors[0])}, ${tm.etal}`;
}

function vancouverAuthors(authors: Person[], tm: Terms, max: number, keep: number): string {
  const names = authors.map((a) => nameFamilyInitials(a, { dots: false, space: false, comma: false }));
  if (names.length === 0) return "";
  if (names.length > max) return `${names.slice(0, keep).join(", ")}, ${tm.etal}`;
  return names.join(", ");
}

function ieeeAuthors(authors: Person[], tm: Terms): string {
  const names = authors.map(nameInitialsFamily);
  if (names.length === 0) return "";
  if (names.length > 6) return `${names[0]} ${tm.etal}`;
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} ${tm.and} ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, ${tm.and} ${names[names.length - 1]}`;
}

/** ISNAD 2 kaynakça yazarları: “Soyadı, Ad”; iki yazar “ - ” ile; üç ve daha fazla yazarda ilk yazar + vd. */
function isnadAuthors(authors: Person[], tm: Terms): string {
  const names = authors.map(nameFamilyGiven);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} - ${names[1]}`;
  return `${names[0]} ${tm.etal}`;
}

const SMALL_WORDS = new Set(["ve", "ile", "veya", "ya", "da", "de", "ki", "mi", "ama", "fakat", "a", "an", "the", "and", "or", "nor", "but", "of", "in", "on", "at", "to", "for", "by", "with", "from", "as", "vs."]);

/**
 * ISNAD başlık yazımı: her kelimenin ilk harfi büyük, bağlaçlar ve edatlar küçük (başta ve iki noktadan sonra büyük).
 * Kısaltmalar (COVID-19, ABD) korunur; tamamı büyük harfle gelen başlıklar önce küçültülür.
 */
/** Başlığın dili (büyük harf kuralı için): Türkçe harf veya sık Türkçe kelime varsa Türkçe (D90) */
export function titleLang(title: string, fallback: "tr" | "en" = "tr"): "tr" | "en" {
  if (/[çğışöüÇĞİŞÖÜ]/.test(title) || /(^|\s)(ve|bir|ile|için|bu|da|de|olarak|üzerine)(\s|$)/i.test(title)) return "tr";
  if (/(^|\s)(the|of|and|in|on|for|with|to|an|from|among|toward|towards)(\s|$)/i.test(title)) return "en";
  return fallback;
}

/** Almanca başlık mı? (ä/ß veya sık Almanca kelimeler) — Almancada başlık büyük harf kuralı uygulanmaz */
export function isGermanTitle(title: string): boolean {
  if (/[çğışÇĞİŞ]/.test(title)) return false;
  return /[äßÄ]/.test(title) || ((title.match(/(^|\s)(und|der|die|das|für|mit|von|zur|zum|im|eine?|über|bei|zwischen)(\s|$)/gi) ?? []).length >= 1 && !/(^|\s)(the|of|and)(\s|$)/i.test(title));
}

export function isnadTitleCase(title: string, locale: CiteLocale = "tr"): string {
  // D144: Almanca başlıklarda adlar zaten büyük harfle yazılır; İngilizce tarzı başlık düzeni yanlış olur
  if (isGermanTitle(title)) return clean(title);
  // Büyük harf dönüşümü başlığın diline göre: İngilizce başlıkta “i” → “I” (İ değil); belirsizse kaynakça dili
  const loc = titleLang(title, locale === "tr" ? "tr" : "en"); // Almanca büyük/küçük harf kuralı İngilizceyle aynı (i → I)
  let s = clean(title);
  const letters = s.replace(/[^\p{L}]/gu, "");
  // Tamamı büyük harfli başlık: kelimeler küçültülür; rakam içeren kısaltmalar (COVID-19) korunur
  if (letters.length > 8 && letters === letters.toLocaleUpperCase(loc)) s = s.split(/(\s+)/).map((w) => (/\d/.test(w) ? w : w.toLocaleLowerCase(loc))).join("");
  let capNext = true;
  return s.split(/(\s+)/).map((w) => {
    if (/^\s+$/.test(w) || !w) return w;
    const bare = w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}.]+$/gu, "").toLocaleLowerCase(loc);
    const keepSmall = !capNext && SMALL_WORDS.has(bare);
    capNext = /[:.?!]$/.test(w);
    if (keepSmall) return w.toLocaleLowerCase(loc);
    // Kelimenin içinde büyük harf varsa (kısaltma, özel ad) olduğu gibi bırak; yalnızca ilk harfi büyüt
    return w.replace(/\p{L}/u, (c) => c.toLocaleUpperCase(loc));
  }).join("");
}

// ---------------------------------------------------------------------------
// Motor
// ---------------------------------------------------------------------------

export class CitationEngine {
  readonly style: CitationStyleId;
  readonly meta: StyleMeta;
  readonly locale: CiteLocale;
  private readonly tm: Terms;
  private readonly items: Map<string, CitationItem>;
  private readonly numbers = new Map<string, number>();
  private readonly suffix = new Map<string, string>();

  constructor(style: CitationStyleId, items: CitationItem[], opts: EngineOptions = {}) {
    this.style = style;
    this.meta = STYLES[style];
    this.locale = opts.locale ?? "tr";
    this.tm = TERMS[this.locale];
    this.items = new Map(items.map((it) => [it.id, it]));

    if (this.meta.family === "numeric") {
      let n = 1;
      for (const id of opts.citedOrder ?? []) {
        if (this.items.has(id) && !this.numbers.has(id)) this.numbers.set(id, n++);
      }
      // Metinde geçmeyen kaynaklar sona eklenir (kullanıcı uyarılır, bkz. checks.ts)
      for (const it of items) if (!this.numbers.has(it.id)) this.numbers.set(it.id, n++);
    } else {
      this.computeYearSuffixes(items);
    }
  }

  /** Aynı yazar(lar) + aynı yıl -> 2020a, 2020b (başlığa göre sıralı). */
  private computeYearSuffixes(items: CitationItem[]) {
    const groups = new Map<string, CitationItem[]>();
    for (const it of items) {
      const key = `${it.authors.map(familyOf).join("|").toLocaleLowerCase("tr")}#${it.year ?? "nd"}`;
      const g = groups.get(key) ?? [];
      g.push(it);
      groups.set(key, g);
    }
    for (const g of groups.values()) {
      if (g.length < 2) continue;
      g.sort((a, b) => a.title.localeCompare(b.title, "tr"));
      g.forEach((it, idx) => {
        // "t.y." için tireli ek kullanılır: t.y.-a
        this.suffix.set(it.id, (it.year ? "" : "-") + String.fromCharCode(97 + (idx % 26)));
      });
    }
  }

  numberOf(id: string): number | undefined {
    return this.numbers.get(id);
  }

  private yearText(it: CitationItem): string {
    // ISNAD: tarihsiz eserler “ts.” (en: “n.d.”)
    const nd = this.style === "isnad" && this.locale === "tr" ? "ts." : this.tm.nd;
    return `${it.year ?? nd}${this.suffix.get(it.id) ?? ""}`;
  }

  private locatorText(locator: string | null | undefined, style: "apa" | "harvard" | "chicago" | "mla" | "numeric"): string {
    const loc = pageRange(locator);
    if (!loc) return "";
    const multi = /[–,]/.test(loc);
    if (style === "chicago" || style === "mla") return loc;
    if (style === "numeric") return `${multi ? this.tm.pp : this.tm.p} ${loc}`;
    return `${multi ? this.tm.pp : this.tm.p} ${loc}`;
  }

  /** Metin içi yazar kısmı (yazar-tarih stilleri). */
  private citeAuthors(it: CitationItem, narrative: boolean): string {
    const a = it.authors.length ? it.authors : (it.editors ?? []);
    const fam = a.map(familyOf);
    if (fam.length === 0) {
      // Yazarsız eser: başlığın ilk birkaç kelimesi
      const short = it.title.split(/\s+/).slice(0, 4).join(" ");
      return it.type === "article-journal" || it.type === "chapter" ? `"${stripEndPunct(short)}"` : short;
    }
    const conj = narrative ? this.tm.and : this.style === "apa7" || this.style === "apa6" ? this.tm.amp : this.tm.and;
    const etal = `${fam[0]} ${this.tm.etal}`;
    switch (this.style) {
      case "apa7":
        if (fam.length === 1) return fam[0];
        if (fam.length === 2) return `${fam[0]} ${conj} ${fam[1]}`;
        return etal;
      case "apa6":
        if (fam.length === 1) return fam[0];
        if (fam.length === 2) return `${fam[0]} ${conj} ${fam[1]}`;
        return etal; // 3–5 yazarda ilk atıf tüm yazarları gösterir; bkz. cite(firstCite)
      case "harvard":
      case "chicago":
      case "turabian":
        if (fam.length === 1) return fam[0];
        if (fam.length === 2) return `${fam[0]} ${this.tm.and} ${fam[1]}`;
        if (fam.length === 3) return `${fam[0]}, ${fam[1]}, ${this.tm.and} ${fam[2]}`;
        return etal;
      case "mla":
        if (fam.length === 1) return fam[0];
        if (fam.length === 2) return `${fam[0]} ${this.tm.and} ${fam[1]}`;
        return etal;
      case "isnad":
        // ISNAD 2 metin içi: (Demir - Aksoy, 2022), üç ve daha fazla yazarda (Lee vd., 2020)
        if (fam.length === 1) return fam[0];
        if (fam.length === 2) return narrative ? `${fam[0]} ${this.tm.and} ${fam[1]}` : `${fam[0]} - ${fam[1]}`;
        return etal;
      default:
        return fam[0];
    }
  }

  /**
   * Metin içi atıf. `ids` birlikte atıf yapılan kaynaklardır.
   * `firstCite`: APA 6'da 3–5 yazarlı eserlerin ilk atfında tüm yazarlar listelenir.
   */
  cite(ids: string[], opts: InTextOptions = {}, firstCite = false): Rich {
    const items = ids.map((id) => this.items.get(id)).filter((x): x is CitationItem => !!x);
    if (items.length === 0) return [t(this.meta.family === "numeric" ? "[?]" : "(?)")];

    if (this.meta.family === "numeric") return this.citeNumeric(items, opts);

    const sorted = this.style.startsWith("apa") ? [...items].sort(compareItems) : items;
    const single = sorted.length === 1;

    const authorPart = (it: CitationItem, narrative: boolean): string => {
      if (this.style === "apa6" && firstCite && it.authors.length >= 3 && it.authors.length <= 5) {
        const fam = it.authors.map(familyOf);
        return `${fam.slice(0, -1).join(", ")}, ${narrative ? this.tm.and : this.tm.amp} ${fam[fam.length - 1]}`;
      }
      return this.citeAuthors(it, narrative);
    };

    if (this.style === "mla") {
      const loc = single ? this.locatorText(opts.locator, "mla") : "";
      if (opts.narrative) {
        const it = sorted[0];
        return [t(`${this.citeAuthors(it, true)}${loc ? ` (${loc})` : ""}`)];
      }
      const parts = sorted.map((it) => (opts.suppressAuthor ? "" : this.citeAuthors(it, false)));
      return [t(`(${parts.join("; ")}${loc ? `${parts[0] ? " " : ""}${loc}` : ""})`)];
    }

    const sep = this.style.startsWith("apa") || this.style === "harvard" || this.style === "isnad" ? ", " : " ";
    // ISNAD metin içi sayfa: (Kaya, 2021, 45) — “s.” yazılmaz
    const locStyle = this.style === "chicago" || this.style === "turabian" || this.style === "isnad" ? "chicago" : this.style === "harvard" ? "harvard" : "apa";
    const loc = single ? this.locatorText(opts.locator, locStyle) : "";

    if (opts.narrative) {
      const it = sorted[0];
      return [t(`${authorPart(it, true)} (${this.yearText(it)}${loc ? `, ${loc}` : ""})`)];
    }
    const pre = opts.prefix?.trim() ? `${opts.prefix.trim()} ` : "";
    const post = opts.suffix?.trim() ? `; ${opts.suffix.trim()}` : "";
    if (opts.suppressAuthor) {
      return [t(`(${pre}${sorted.map((it) => this.yearText(it)).join(", ")}${loc ? `, ${loc}` : ""}${post})`)];
    }
    const chunks = sorted.map((it) => `${authorPart(it, false)}${sep}${this.yearText(it)}`);
    return [t(`(${pre}${chunks.join("; ")}${loc ? `, ${loc}` : ""}${post})`)];
  }

  private citeNumeric(items: CitationItem[], opts: InTextOptions): Rich {
    const nums = [...new Set(items.map((it) => this.numbers.get(it.id)!))].sort((a, b) => a - b);
    const compress = (ns: number[], dash: string) => {
      const out: string[] = [];
      for (let k = 0; k < ns.length; k++) {
        let j = k;
        while (j + 1 < ns.length && ns[j + 1] === ns[j] + 1) j++;
        if (j - k >= 2) out.push(`${ns[k]}${dash}${ns[j]}`);
        else for (let m = k; m <= j; m++) out.push(String(ns[m]));
        k = j;
      }
      return out;
    };
    const loc = items.length === 1 ? pageRange(opts.locator) : "";
    if (this.style === "ieee") {
      const body = nums.map((n) => `[${n}${loc ? `, ${this.locatorText(loc, "numeric")}` : ""}]`).join(", ");
      return [t(body)];
    }
    if (this.style === "ama") {
      // AMA: üst simge, sayfa parantez içinde üst simge
      return [{ text: compress(nums, "-").join(",") + (loc ? `(${loc})` : ""), sup: true }];
    }
    // Vancouver
    return [t(`[${compress(nums, "–").join(",")}${loc ? `, ${this.locatorText(loc, "numeric")}` : ""}]`)];
  }

  // -------------------------------------------------------------------------
  // Kaynakça
  // -------------------------------------------------------------------------

  bibliography(onlyIds?: string[]): BibEntry[] {
    let list = [...this.items.values()];
    if (onlyIds) {
      const set = new Set(onlyIds);
      list = list.filter((it) => set.has(it.id));
    }
    if (this.meta.family === "numeric") {
      list.sort((a, b) => (this.numbers.get(a.id) ?? 0) - (this.numbers.get(b.id) ?? 0));
      return list.map((it, idx) => ({ id: it.id, number: onlyIds ? idx + 1 : this.numbers.get(it.id), rich: this.entry(it) }));
    }
    list.sort((a, b) => compareItems(a, b) || (this.suffix.get(a.id) ?? "").localeCompare(this.suffix.get(b.id) ?? ""));
    return list.map((it) => ({ id: it.id, rich: this.entry(it) }));
  }

  entry(it: CitationItem): Rich {
    switch (this.style) {
      case "apa7":
      case "apa6":
        return mergeRich(this.apa(it));
      case "isnad":
        return mergeRich(this.isnad(it));
      case "chicago":
      case "turabian":
        return mergeRich(this.chicago(it));
      case "harvard":
        return mergeRich(this.harvard(it));
      case "mla":
        return mergeRich(this.mla(it));
      case "vancouver":
        return mergeRich(this.vancouver(it, false));
      case "ama":
        return mergeRich(this.vancouver(it, true));
      case "ieee":
        return mergeRich(this.ieee(it));
    }
  }

  private link(it: CitationItem, style: "apa7" | "apa6" | "plain" | "harvard" | "ieee" | "ama" | "vancouver"): string {
    const doi = normalizeDoi(it.doi);
    if (doi) {
      if (style === "apa6") return `https://doi.org/${doi}`;
      if (style === "ieee") return `doi: ${doi}.`;
      if (style === "ama" || style === "vancouver") return `doi:${doi}`;
      if (style === "harvard") return `${this.tm.availableAt} ${doiUrl(doi)}`;
      return doiUrl(doi);
    }
    if (it.url) {
      if (style === "harvard") return `${this.tm.availableAt} ${it.url}${it.accessed ? ` (${this.tm.accessed} ${this.fmtDate(it.accessed)})` : ""}.`;
      if (style === "apa6") return `${this.tm.retrieved} ${it.url}`;
      if (style === "ama" || style === "vancouver") return `${it.url}`;
      return it.url;
    }
    return "";
  }

  private fmtDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getUTCDate()}${this.locale === "de" ? "." : ""} ${MONTHS[this.locale][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }

  private editorsText(it: CitationItem, mode: "apa" | "chicago"): string {
    const eds = it.editors ?? [];
    if (!eds.length) return "";
    const names = eds.map((e) => (mode === "apa" ? (isLiteral(e) ? familyOf(e) : `${initials(e.given)} ${familyOf(e)}`.trim()) : nameGivenFamily(e)));
    const joined = names.length <= 2 ? names.join(mode === "apa" ? ` ${this.tm.amp} ` : ` ${this.tm.and} `) : `${names.slice(0, -1).join(", ")}, ${mode === "apa" ? this.tm.amp : this.tm.and} ${names[names.length - 1]}`;
    return `${joined} (${eds.length > 1 ? this.tm.eds : this.tm.ed})`;
  }

  private thesisLabel(it: CitationItem): string {
    // Kodlu türler çalışma diline göre yazılır; serbest metin olduğu gibi kullanılır
    if (it.genre === "master") return this.tm.thesisMaster;
    if (it.genre === "doctoral") return this.tm.thesisDoctoral;
    if (it.genre === "art") return this.tm.thesisArt;
    if (it.genre) return it.genre;
    return this.tm.thesisDoctoral;
  }

  private archiveName(a: string): string {
    return a === "yok" ? this.tm.yokArchive : clean(a);
  }

  private apa(it: CitationItem): Rich {
    const style = this.style as "apa7" | "apa6";
    const authors = apaAuthors(it.authors, style, this.tm);
    const year = this.yearText(it);
    const title = clean(it.title);
    const out: Rich = [];
    const dateBit = `(${year}${it.type === "webpage" && it.month ? `, ${MONTHS[this.locale][it.month - 1]}` : ""}).`;
    const italicTitle = ["book", "thesis", "report", "webpage", "preprint", "dataset"].includes(it.type);

    if (authors) out.push(t(`${endWith(authors, ".")} ${dateBit} `));
    else if (italicTitle) out.push(i(endWith(title, ".")), t(` ${dateBit} `));
    else out.push(t(`${endWith(title, ".")} ${dateBit} `));

    const titleShown = !!authors;
    const pub = clean(it.publisher);
    const pubWithPlace = style === "apa6" && it.publisherPlace ? `${clean(it.publisherPlace)}: ${pub}` : pub;

    switch (it.type) {
      case "article-journal": {
        if (titleShown) out.push(t(`${endWith(title, ".")} `));
        if (it.containerTitle) {
          out.push(i(clean(it.containerTitle)));
          if (it.volume) out.push(t(", "), i(clean(it.volume)));
          if (it.issue) out.push(t(`(${clean(it.issue)})`));
          if (it.pages) out.push(t(`, ${pageRange(it.pages)}`));
          out.push(t(". "));
        }
        break;
      }
      case "chapter": {
        if (titleShown) out.push(t(`${endWith(title, ".")} `));
        const eds = this.editorsText(it, "apa");
        out.push(t(`${this.tm.in} ${eds ? `${eds}, ` : ""}`));
        if (it.containerTitle) out.push(i(clean(it.containerTitle)));
        const bits = [it.edition ? `${clean(it.edition)}. ${this.tm.editionSuffix}` : "", it.pages ? `${this.tm.pp} ${pageRange(it.pages)}` : ""].filter(Boolean);
        if (bits.length) out.push(t(` (${bits.join(", ")})`));
        out.push(t(". "));
        if (pubWithPlace) out.push(t(`${endWith(pubWithPlace, ".")} `));
        break;
      }
      case "thesis": {
        if (titleShown) out.push(i(title));
        const inst = clean(it.institution ?? it.publisher);
        out.push(t(style === "apa7" ? ` [${this.thesisLabel(it)}${inst ? `, ${inst}` : ""}]. ` : ` (${this.thesisLabel(it)}). `));
        if (style === "apa6" && inst) out.push(t(`${inst}. `));
        // Veri tabanından erişilen tez: APA 7 "Arşiv adı (Yayın No. 123)."
        if (it.archive) out.push(t(`${this.archiveName(it.archive)}${it.archiveId ? ` (${this.tm.thesisNo} ${clean(it.archiveId)})` : ""}. `));
        break;
      }
      case "paper-conference": {
        if (titleShown) out.push(t(`${endWith(title, ".")} `));
        if (it.containerTitle) {
          out.push(t(`${this.tm.in} `), i(clean(it.containerTitle)));
          if (it.pages) out.push(t(` (${this.tm.pp} ${pageRange(it.pages)})`));
          out.push(t(". "));
        }
        if (pubWithPlace) out.push(t(`${endWith(pubWithPlace, ".")} `));
        break;
      }
      case "preprint": {
        if (titleShown) out.push(i(stripEndPunct(title)));
        out.push(t(` [${this.tm.preprint}]. `));
        const repo = clean(it.containerTitle ?? it.publisher ?? (it.arxivId ? "arXiv" : ""));
        if (repo) out.push(t(`${endWith(repo, ".")} `));
        break;
      }
      case "webpage": {
        if (titleShown) out.push(i(endWith(title, ".")), t(" "));
        const site = clean(it.containerTitle ?? it.publisher);
        if (site && site !== authors) out.push(t(`${endWith(site, ".")} `));
        break;
      }
      default: {
        // book, report, dataset, other
        if (titleShown) out.push(i(stripEndPunct(title)));
        if (it.edition) out.push(t(` (${clean(it.edition)}. ${this.tm.editionSuffix})`));
        if (titleShown) out.push(t(". "));
        if (pubWithPlace && pubWithPlace !== authors) out.push(t(`${endWith(pubWithPlace, ".")} `));
      }
    }
    const link = this.link(it, style);
    if (link) out.push(t(link));
    return trimEnd(out);
  }

  private chicago(it: CitationItem): Rich {
    const authors = chicagoAuthors(it.authors, this.tm);
    const year = this.yearText(it);
    const title = stripEndPunct(it.title);
    const out: Rich = [];
    const quoted = ["article-journal", "chapter", "paper-conference", "webpage"].includes(it.type);
    if (authors) out.push(t(`${endWith(authors, ".")} ${year}. `));
    if (quoted) out.push(t(`“${title}.” `));
    else out.push(i(title), t(". "));
    if (!authors) out.push(t(`${year}. `));

    switch (it.type) {
      case "article-journal":
        if (it.containerTitle) {
          out.push(i(clean(it.containerTitle)));
          if (it.volume) out.push(t(` ${clean(it.volume)}`));
          if (it.issue) out.push(t(` (${clean(it.issue)})`));
          if (it.pages) out.push(t(`: ${pageRange(it.pages)}`));
          out.push(t(". "));
        }
        break;
      case "chapter":
      case "paper-conference": {
        const eds = (it.editors ?? []).map(nameGivenFamily);
        out.push(t(`${this.tm.in} `));
        if (it.containerTitle) out.push(i(clean(it.containerTitle)));
        if (eds.length) out.push(t(`, ${this.locale === "tr" ? "ed." : this.locale === "de" ? "hrsg. von" : "edited by"} ${eds.join(", ")}`));
        if (it.pages) out.push(t(`, ${pageRange(it.pages)}`));
        out.push(t(". "));
        out.push(t(placePub(it)));
        break;
      }
      case "thesis":
        out.push(t(`${this.thesisLabel(it)}, ${clean(it.institution ?? it.publisher)}. `));
        break;
      default:
        if (it.edition) out.push(t(`${clean(it.edition)}. ${this.tm.editionSuffix} `));
        out.push(t(placePub(it)));
    }
    const link = this.link(it, "plain");
    if (link) out.push(t(`${link}.`));
    return trimEnd(out);
  }

  /**
   * ISNAD 2. edisyon kaynakça girdisi (metin içi ve dipnotlu sürümlerde kaynakça aynıdır).
   * Makale: Soyadı, Ad. “Başlık”. Dergi Cilt/Sayı (Yıl), sayfa. DOI
   * Kitap:  Soyadı, Ad. Kitap Adı. Yayın Yeri: Yayınevi, Yıl.
   */
  private isnad(it: CitationItem): Rich {
    const authors = isnadAuthors(it.authors, this.tm);
    const year = this.yearText(it);
    const title = stripEndPunct(isnadTitleCase(it.title, this.locale));
    const out: Rich = [];
    const quoted = ["article-journal", "chapter", "paper-conference", "webpage"].includes(it.type);
    if (authors) out.push(t(`${endWith(authors, ".")} `));
    if (quoted) out.push(t(`“${title}”. `));
    else out.push(i(title), t(". "));
    const place = clean(it.publisherPlace);
    const pub = clean(it.publisher);
    const placePubYear = () => {
      const pp = [place && pub ? `${place}: ${pub}` : place || pub].filter(Boolean)[0];
      return `${pp ? `${pp}, ` : ""}${year}.`;
    };
    const ed = this.locale === "de" ? "hrsg. v." : "ed.";

    switch (it.type) {
      case "article-journal": {
        if (it.containerTitle) out.push(i(isnadTitleCase(clean(it.containerTitle), this.locale)));
        const vi = `${it.volume ? clean(it.volume) : ""}${it.issue ? `/${clean(it.issue)}` : ""}`;
        out.push(t(`${vi ? ` ${vi}` : ""} (${year})`));
        if (it.pages) out.push(t(`, ${pageRange(it.pages, "-")}`));
        out.push(t(". "));
        break;
      }
      case "chapter":
      case "paper-conference": {
        if (it.containerTitle) out.push(i(isnadTitleCase(clean(it.containerTitle), this.locale)), t(". "));
        const eds = (it.editors ?? []).map(nameGivenFamily);
        if (eds.length) out.push(t(`${ed} ${eds.join(" - ")}. `));
        if (it.pages) out.push(t(`${pageRange(it.pages, "-")}. `));
        out.push(t(`${placePubYear()} `));
        break;
      }
      case "thesis": {
        const inst = clean(it.institution ?? it.publisher);
        out.push(t(`${place ? `${place}: ` : ""}${inst ? `${inst}, ` : ""}${isnadTitleCase(this.thesisLabel(it), this.locale)}, ${year}. `));
        break;
      }
      case "webpage": {
        if (it.containerTitle) out.push(t(`${clean(it.containerTitle)}. `));
        if (it.year) out.push(t(`${year}. `));
        if (it.accessed) out.push(t(`${this.locale === "tr" ? "Erişim" : this.locale === "de" ? "Zugriff am" : "Accessed"} ${this.fmtDate(it.accessed)}. `));
        break;
      }
      default:
        if (it.edition) out.push(t(`${clean(it.edition)}. ${this.locale === "tr" ? "Baskı" : this.locale === "de" ? "Aufl" : "ed"}. `));
        out.push(t(`${placePubYear()} `));
    }
    const doi = normalizeDoi(it.doi);
    if (doi) out.push(t(doiUrl(doi)));
    else if (it.url) out.push(t(it.url));
    return trimEnd(out);
  }

  private harvard(it: CitationItem): Rich {
    const authors = harvardAuthors(it.authors, this.tm);
    const year = this.yearText(it);
    const title = stripEndPunct(it.title);
    const out: Rich = [];
    const quoted = ["article-journal", "chapter", "paper-conference", "webpage"].includes(it.type);
    if (authors) out.push(t(`${authors} (${year}) `));
    if (quoted) out.push(t(`‘${title}’`));
    else out.push(i(title));
    if (!authors) out.push(t(` (${year})`));

    switch (it.type) {
      case "article-journal":
        if (it.containerTitle) {
          out.push(t(", "), i(clean(it.containerTitle)));
          const vi = `${it.volume ? clean(it.volume) : ""}${it.issue ? `(${clean(it.issue)})` : ""}`;
          if (vi) out.push(t(`, ${vi}`));
          if (it.pages) out.push(t(`, ${this.tm.pp} ${pageRange(it.pages)}`));
        }
        out.push(t(". "));
        break;
      case "chapter": {
        const eds = (it.editors ?? []).map((e) => nameFamilyInitials(e, { space: false }));
        out.push(t(`, ${this.tm.in}${this.locale === "de" ? ":" : ""} `));
        if (eds.length) out.push(t(`${eds.join(` ${this.tm.and} `)} (${this.locale === "de" ? "Hrsg." : eds.length > 1 ? "eds." : "ed."}) `));
        if (it.containerTitle) out.push(i(clean(it.containerTitle)));
        out.push(t(". "));
        out.push(t(placePub(it)));
        if (it.pages) out.push(t(`${this.tm.pp} ${pageRange(it.pages)}. `));
        break;
      }
      case "thesis":
        out.push(t(`. ${this.thesisLabel(it)}. ${clean(it.institution ?? it.publisher)}. `));
        break;
      default:
        out.push(t(". "));
        if (it.edition) out.push(t(`${clean(it.edition)}. ${this.tm.editionSuffix} `));
        out.push(t(placePub(it)));
    }
    const link = this.link(it, "harvard");
    if (link) out.push(t(link));
    return trimEnd(out);
  }

  private mla(it: CitationItem): Rich {
    const authors = mlaAuthors(it.authors, this.tm);
    const title = stripEndPunct(it.title);
    const out: Rich = [];
    const quoted = ["article-journal", "chapter", "paper-conference", "webpage"].includes(it.type);
    if (authors) out.push(t(`${endWith(authors, ".")} `));
    if (quoted) out.push(t(`“${title}.” `));
    else out.push(i(title), t(". "));

    const container: string[] = [];
    const containerRich: Rich = [];
    if (it.containerTitle && it.type !== "book") containerRich.push(i(clean(it.containerTitle)));
    if (it.edition) container.push(`${clean(it.edition)}. ${this.tm.editionSuffix}`);
    if (it.volume) container.push(`vol. ${clean(it.volume)}`);
    if (it.issue) container.push(`no. ${clean(it.issue)}`);
    if (it.type !== "article-journal" && it.publisher) container.push(clean(it.publisher));
    container.push(it.year ? String(it.year) : this.tm.nd);
    if (it.pages) container.push(`${this.locale === "de" ? "S." : /[-–]/.test(it.pages) ? "pp." : "p."} ${pageRange(it.pages)}`);
    const doi = normalizeDoi(it.doi);
    if (doi) container.push(doiUrl(doi));
    else if (it.url) container.push(it.url.replace(/^https?:\/\//, ""));

    if (containerRich.length) {
      out.push(...containerRich);
      out.push(t(container.length ? `, ${container.join(", ")}.` : "."));
    } else {
      out.push(t(`${container.join(", ")}.`));
    }
    return trimEnd(out);
  }

  private vancouver(it: CitationItem, ama: boolean): Rich {
    const authors = ama ? vancouverAuthors(it.authors, this.tm, 6, 3) : vancouverAuthors(it.authors, this.tm, 6, 6);
    const title = stripEndPunct(it.title);
    const out: Rich = [];
    if (authors) out.push(t(`${endWith(authors, ".")} `));
    switch (it.type) {
      case "article-journal": {
        out.push(t(`${title}. `));
        if (it.containerTitle) {
          out.push(ama ? i(clean(it.containerTitle)) : t(clean(it.containerTitle)));
          out.push(t(". "));
        }
        let s = `${it.year ?? this.tm.nd}`;
        if (it.volume) s += `;${clean(it.volume)}`;
        if (it.issue) s += `(${clean(it.issue)})`;
        if (it.pages) s += `:${pageRange(it.pages, "-")}`;
        out.push(t(`${s}. `));
        break;
      }
      case "chapter": {
        out.push(t(`${title}. ${this.tm.in}: `));
        const eds = (it.editors ?? []).map((e) => nameFamilyInitials(e, { dots: false, space: false, comma: false }));
        if (eds.length) out.push(t(`${eds.join(", ")}, ${this.locale === "tr" ? "editörler" : this.locale === "de" ? "Hrsg" : eds.length > 1 ? "editors" : "editor"}. `));
        if (it.containerTitle) out.push(ama ? i(clean(it.containerTitle)) : t(clean(it.containerTitle)), t(". "));
        out.push(t(`${placePub(it, true)}${it.year ?? this.tm.nd}${it.pages ? `. p. ${pageRange(it.pages, "-")}` : ""}. `));
        break;
      }
      case "thesis":
        out.push(ama ? i(title) : t(title), t(` [${this.thesisLabel(it)}]. `));
        out.push(t(`${clean(it.institution ?? it.publisher)}; ${it.year ?? this.tm.nd}. `));
        break;
      default:
        out.push(ama ? i(title) : t(title), t(". "));
        if (it.edition) out.push(t(`${clean(it.edition)}. ${this.tm.editionSuffix} `));
        out.push(t(`${placePub(it, true)}${it.year ?? this.tm.nd}. `));
    }
    const link = this.link(it, ama ? "ama" : "vancouver");
    if (link) out.push(t(ama ? link : `${link}`));
    return trimEnd(out);
  }

  private ieee(it: CitationItem): Rich {
    const authors = ieeeAuthors(it.authors, this.tm);
    const title = stripEndPunct(it.title);
    const out: Rich = [];
    if (authors) out.push(t(`${authors}, `));
    const month = it.month ? `${MONTHS[this.locale === "de" ? "de" : "en"][it.month - 1].slice(0, 3)}. ` : "";
    switch (it.type) {
      case "article-journal":
      case "paper-conference": {
        out.push(t(`“${title},” `));
        if (it.containerTitle) out.push(t(it.type === "paper-conference" ? `${this.locale === "tr" ? "" : this.locale === "de" ? "in: " : "in "}` : ""), i(clean(it.containerTitle)), t(", "));
        const bits: string[] = [];
        if (it.volume) bits.push(`vol. ${clean(it.volume)}`);
        if (it.issue) bits.push(`no. ${clean(it.issue)}`);
        if (it.pages) bits.push(`${this.locale === "de" ? "S." : /[-–]/.test(it.pages) ? "pp." : "p."} ${pageRange(it.pages)}`);
        bits.push(`${month}${it.year ?? this.tm.nd}`);
        out.push(t(bits.join(", ")));
        break;
      }
      case "chapter":
        out.push(t(`“${title},” in `));
        if (it.containerTitle) out.push(i(clean(it.containerTitle)));
        out.push(t(`, ${placePub(it, false, true)}${it.year ?? this.tm.nd}${it.pages ? `, ${this.locale === "de" ? "S." : "pp."} ${pageRange(it.pages)}` : ""}`));
        break;
      case "thesis":
        out.push(t(`“${title},” ${this.thesisLabel(it)}, ${clean(it.institution ?? it.publisher)}, ${it.year ?? this.tm.nd}`));
        break;
      default:
        out.push(i(title), t(". "));
        if (it.edition) out.push(t(`${clean(it.edition)}${this.locale === "de" ? "." : ""} ${this.tm.editionSuffix} `));
        out.push(t(`${placePub(it, false, true)}${it.year ?? this.tm.nd}`));
    }
    const link = this.link(it, "ieee");
    out.push(t(link ? `, ${link}` : "."));
    return trimEnd(out);
  }
}

function placePub(it: CitationItem, vancouver = false, ieee = false): string {
  const place = clean(it.publisherPlace);
  const pub = clean(it.publisher);
  if (!place && !pub) return "";
  if (vancouver) return `${place ? `${place}: ` : ""}${pub}${pub ? "; " : ""}`;
  if (ieee) return `${place ? `${place}: ` : ""}${pub}${pub ? ", " : ""}`;
  return `${place ? `${place}: ` : ""}${endWith(pub, ".")} `;
}

function trimEnd(r: Rich): Rich {
  const out = r.filter((s) => s.text);
  const last = out[out.length - 1];
  if (last) last.text = last.text.replace(/\s+$/, "");
  return out;
}
