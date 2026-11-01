export type CitationStyleId =
  | "apa7" | "apa6" | "chicago" | "mla" | "harvard" | "vancouver" | "ieee" | "ama" | "turabian";

export type ItemType =
  | "article-journal" | "book" | "chapter" | "paper-conference" | "thesis"
  | "report" | "webpage" | "preprint" | "dataset" | "other";

export interface Person {
  family?: string;
  given?: string;
  literal?: string; // kurum yazarlar (ör. "World Health Organization")
}

export interface CitationItem {
  id: string;
  type: ItemType;
  title: string;
  authors: Person[];
  editors?: Person[];
  year?: number | null;
  month?: number | null;
  containerTitle?: string | null; // dergi, kitap (bölüm için), konferans adı
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  publisher?: string | null;
  publisherPlace?: string | null;
  edition?: string | null;
  doi?: string | null;
  url?: string | null;
  isbn?: string | null;
  pmid?: string | null;
  arxivId?: string | null;
  institution?: string | null; // tez/rapor
  genre?: string | null;       // "Doktora tezi", "Yüksek lisans tezi"
  accessed?: string | null;    // ISO tarih (web sayfası)
}

/** Biçimlendirilmiş metin parçası — DOCX/PDF/HTML'e kayıpsız aktarılır. */
export interface Seg {
  text: string;
  italic?: boolean;
  sup?: boolean;
}
export type Rich = Seg[];

export type CiteLocale = "tr" | "en";

export interface InTextOptions {
  locator?: string | null;     // sayfa: "12" veya "12-14"
  narrative?: boolean;         // Yılmaz (2020) ... biçimi
  suppressAuthor?: boolean;    // (2020)
}

export interface StyleMeta {
  id: CitationStyleId;
  label: string;
  family: "author-date" | "numeric" | "author-page";
  bibliographyTitle: Record<CiteLocale, string>;
  description: string;
}
