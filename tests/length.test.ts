import { describe, expect, it } from "vitest";
import { appendToDraft, continuationPrompt, draftTarget, draftWords, lengthInstruction } from "@/lib/workflows/length";
import type { JSONNode } from "@/lib/editor/doc";

const h = (level: number, text: string): JSONNode => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });
const p = (text: string): JSONNode => ({ type: "paragraph", content: [{ type: "text", text }] });

describe("kurgudaki hedef uzunluk (D97)", () => {
  // 2.1 (altında 2.1.1, 2.1.2), 2.2, 2.3 → metin taşıyan 4 alt başlık
  const doc: JSONNode = { type: "doc", content: [h(2, "A"), h(3, "A1"), p("x"), h(3, "A2"), h(2, "B"), p("y"), h(2, "C")] };

  it("alt başlıkta hedef, metin taşıyan alt başlıklara eşit bölünür", () => {
    const t = draftTarget({ chapterWords: 4000, doc, focusIndex: 1, currentWords: 0 });
    expect(t).toMatchObject({ words: 1000, scope: "subheading", parts: 4, chapterWords: 4000 });
  });
  it("boş bölümde hedefin tamamı, dolu bölümde kalan kısım istenir", () => {
    expect(draftTarget({ chapterWords: 3000, doc: { type: "doc", content: [p("")] }, currentWords: 0 })).toMatchObject({ words: 3000, scope: "section" });
    expect(draftTarget({ chapterWords: 3000, doc: { type: "doc", content: [p("metin")] }, currentWords: 1800 })).toMatchObject({ words: 1200, scope: "remaining" });
    expect(draftTarget({ chapterWords: 3000, doc: null, currentWords: 2950 })).toBeNull();
    expect(draftTarget({ chapterWords: 0, doc, currentWords: 0 })).toBeNull();
  });
  it("talimat kesin sayı ve alt-üst sınır verir", () => {
    const s = lengthInstruction({ words: 1000, chapterWords: 4000, scope: "subheading", parts: 4 });
    expect(s).toContain("yaklaşık 1000 kelime");
    expect(s).toContain("en az 900");
    expect(s).toContain("4 alt başlığa");
  });
  it("taslak kelimesi yalnızca :::taslak bloğundan ve atıf işaretleri hariç sayılır", () => {
    const a = "Açıklama metni burada.\n:::taslak\nBir iki üç [[kaynak:S1]] dört beş.\n:::\n:::eksik\nsorgu bir\n:::";
    expect(draftWords(a)).toBe(5);
  });
  it("devam metni son taslak bloğunun içine, kapanıştan önce eklenir", () => {
    const a = "Not.\n:::taslak\nİlk paragraf.\n:::\n:::eksik\nq\n:::";
    const out = appendToDraft(a, "İkinci paragraf.");
    expect(out).toBe("Not.\n:::taslak\nİlk paragraf.\n\nİkinci paragraf.\n:::\n:::eksik\nq\n:::");
    expect(draftWords(out)).toBe(4);
    // Model yine de :::taslak açarsa işaretler atılır
    expect(appendToDraft("x\n:::taslak\nA\n:::", ":::taslak\nB\n:::")).toBe("x\n:::taslak\nA\n\nB\n:::");
    // Kapanmamış blokta sona eklenir
    expect(appendToDraft(":::taslak\nA", "B")).toBe(":::taslak\nA\n\nB");
  });
  it("devam isteği kalan kelimeyi söyler", () => {
    expect(continuationPrompt(600, { words: 1000, chapterWords: 4000, scope: "subheading", parts: 4 })).toContain("yaklaşık 400 kelime daha");
  });
});
