import { describe, expect, it } from "vitest";
import { chargedWords, countWords, PAGE_ACTIONS, wordsLeft, wordsToPages, WORDS_PER_PAGE } from "@/lib/pages";
import { draftWords } from "@/lib/workflows/length";

/** D145: paket kartındaki sayfa sayısı gerçek sınır */
describe("sayfa hakkı", () => {
  it("1 sayfa = 344 kelime; sayfa bir ondalıkla", () => {
    expect(WORDS_PER_PAGE).toBe(344);
    expect(wordsToPages(344)).toBe(1);
    expect(wordsToPages(1720)).toBe(5);
    expect(wordsToPages(500)).toBe(1.5);
    expect(wordsToPages(-10)).toBe(0);
  });
  it("kalan kelime: Ücretsiz 5 sayfa = 1.720 kelime; sınırsızda null", () => {
    expect(wordsLeft(5, 0)).toBe(1720);
    expect(wordsLeft(5, 2000)).toBe(0);
    expect(wordsLeft(null, 99999)).toBeNull();
  });
  it("yalnızca taslak kelimeleri sayılır; seçili metin yeniden yazılınca net artış", () => {
    const answer = "Kısa açıklama burada.\n\n:::taslak\nBu çalışma öz yeterlik ile başarı arasındaki ilişkiyi inceler [[kaynak:S1]].\n:::\n\nNot: kontrol edin.";
    expect(draftWords(answer)).toBe(9);
    expect(chargedWords(draftWords(answer))).toBe(9);
    expect(chargedWords(120, countWords("eski metin üç"))).toBe(117);
    // Kısaltma: net artış yok, sayfa düşmez
    expect(chargedWords(40, 100)).toBe(0);
  });
  it("yeni metin yazan eylemler sayfa hakkına bağlı; soru-cevap ve düzeltme değil", () => {
    for (const a of ["draft", "expand", "discussion", "abstract"]) expect(PAGE_ACTIONS.has(a)).toBe(true);
    for (const a of ["chat", "shorten", "academic_tone", "consistency"]) expect(PAGE_ACTIONS.has(a)).toBe(false);
  });
});
