/**
 * Sayfa hakkı (D145). Paket kartlarındaki “ayda N sayfa” gerçek sınırdır: yapay zekânın yazdığı taslak kelimeleri
 * sayılır ve sayfaya çevrilir. 1 sayfa = 344 kelime (Türk tez biçimi: A4, 12 punto, 1,5 satır; D95 ölçümü).
 * Saf modül: istemci (sayaç) ve sunucu (sınır) birlikte kullanır.
 */
export const WORDS_PER_PAGE = 344;

/** Yeni metin yazan (sayfa hakkından düşen) asistan eylemleri: hak dolunca bunlar durur */
export const PAGE_ACTIONS = new Set(["draft", "expand", "synthesize", "methodology", "discussion", "interpret", "abstract", "from_notes", "ethics_docs", "cover_letter", "reviewer_response"]);

/** Kelimeden sayfaya (bir ondalık) */
export function wordsToPages(words: number): number {
  return Math.round((Math.max(0, words) / WORDS_PER_PAGE) * 10) / 10;
}

/** Sınırdan kalan kelime (sınırsızsa null) */
export function wordsLeft(pagesLimit: number | null | undefined, usedWords: number): number | null {
  if (pagesLimit == null) return null;
  return Math.max(0, Math.round(pagesLimit * WORDS_PER_PAGE - usedWords));
}

/**
 * Bu yanıtta sayfa hakkından düşecek kelime: seçili metni yeniden yazan isteklerde yalnızca eklenen (net) kelime sayılır.
 * Kısaltma ve üslup düzeltmesi gibi işlerde net artış olmadığından sayfa düşmez.
 */
export function chargedWords(draftWords: number, selectionWords = 0): number {
  return Math.max(0, Math.round(draftWords - selectionWords));
}

export function countWords(s: string | null | undefined): number {
  return (String(s ?? "").match(/[\p{L}\p{N}][\p{L}\p{N}’'\-]*/gu) ?? []).length;
}
