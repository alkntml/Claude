import { describe, expect, it } from "vitest";
import { detokenize, proofreadBlocks, splitChunks, tokenizeForLanguage, tokensIn } from "@/lib/editor/translate-doc";
import type { JSONNode } from "@/lib/editor/doc";

const cite = (id: string, locator: string | null = null): JSONNode => ({ type: "citation", attrs: { ids: [id], locator, narrative: false } });
const DOC: JSONNode = { type: "doc", content: [
  { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Kuramsal çerçeve" }] },
  { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Öz yeterlik" }] },
  { type: "paragraph", content: [{ type: "text", text: "Öz yeterlik " }, { type: "text", text: "önemlidir", marks: [{ type: "italic" }] }, { type: "text", text: " " }, cite("a", "12"), { type: "text", text: "." }, { type: "footnote", attrs: { text: "Bandura’nın tanımı." } }] },
  { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Birinci madde" }] }] }] },
  { type: "figure", attrs: { src: "data:image/png;base64,AAA", alt: "x" } },
  { type: "table", content: [{ type: "tableRow", content: [{ type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Değişken" }] }] }] }, { type: "tableRow", content: [{ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "Kaygı" }] }] }] }] },
] };

describe("çeviri dönüşümü (D111)", () => {
  it("atıf, dipnot ve şekli işarete çevirir; başlık düzeyi, liste ve tablo korunur", () => {
    const t = tokenizeForLanguage(DOC);
    expect(t.citations).toHaveLength(1);
    expect(t.footnotes).toEqual(["Bandura’nın tanımı."]);
    expect(t.figures).toHaveLength(1);
    expect(tokensIn(t.md).sort()).toEqual(["C1", "F1", "G1"]);
    // Çevirmen işaretleri koruyarak çevirmiş gibi
    const en = t.md.replace("Kuramsal çerçeve", "Theoretical framework").replace("Öz yeterlik önemlidir", "Self-efficacy is important").replace("Öz yeterlik", "Self-efficacy").replace("*önemlidir*", "*important*").replace("Birinci madde", "First item").replace("Değişken", "Variable").replace("Kaygı", "Anxiety");
    const { doc, missing } = detokenize(en, ["Bandura’s definition."], t);
    expect(missing).toEqual({ citations: 0, footnotes: 0, figures: 0 });
    const c = doc.content!;
    expect(c[0]).toMatchObject({ type: "heading", attrs: { level: 2 } });
    expect(c[1]).toMatchObject({ type: "heading", attrs: { level: 3 } });
    const para = c[2].content!;
    expect(para.find((n) => n.type === "citation")).toEqual(cite("a", "12"));
    expect(para.find((n) => n.type === "footnote")?.attrs?.text).toBe("Bandura’s definition.");
    expect(para.some((n) => n.marks?.some((m) => m.type === "italic"))).toBe(true);
    expect(c.map((b) => b.type)).toEqual(["heading", "heading", "paragraph", "bulletList", "figure", "table"]);
  });
  it("yapay zekânın düşürdüğü işaretler kaybolmaz, sona eklenir ve bildirilir", () => {
    const t = tokenizeForLanguage(DOC);
    const { doc, missing } = detokenize("## Theory\n\nText without tokens.", [], t);
    expect(missing).toEqual({ citations: 1, footnotes: 1, figures: 1 });
    const types = JSON.stringify(doc);
    expect(types).toContain('"citation"');
    expect(types).toContain('"footnote"');
    expect(doc.content!.at(-1)!.type).toBe("figure");
  });
  it("aynı işaret iki kez yazılırsa bir kez kullanılır", () => {
    const t = tokenizeForLanguage({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "A " }, cite("a")] }] });
    const { doc } = detokenize("A ⟦C1⟧ and again ⟦C1⟧", [], t);
    expect(JSON.stringify(doc).match(/"citation"/g)).toHaveLength(1);
  });
  it("parçalara bölme blokları bölmez", () => {
    const md = Array.from({ length: 10 }, (_, i) => `Paragraf ${i} ${"x".repeat(900)}`).join("\n\n");
    const chunks = splitChunks(md, 3000);
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks.join("\n\n")).toBe(md);
    expect(chunks.every((c) => c.length <= 3000)).toBe(true);
  });
  it("dil denetimi blokları atıfı ⟦C⟧ olarak verir", () => {
    expect(proofreadBlocks(DOC)).toContain("Öz yeterlik önemlidir ⟦C⟧.");
  });
});
