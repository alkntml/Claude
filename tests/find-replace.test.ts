import { describe, expect, it } from "vitest";
import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { findHits } from "@/components/workspace/find-replace";

const schema = getSchema([StarterKit]);
const doc = schema.nodeFromJSON({ type: "doc", content: [
  { type: "paragraph", content: [{ type: "text", text: "İstanbul ve " }, { type: "text", text: "ist", marks: [{ type: "bold" }] }, { type: "text", text: "anbul; Istanbul değil." }] },
  { type: "paragraph", content: [{ type: "text", text: "kaygı kaygısı" }] },
] });
const texts = (hits: { from: number; to: number }[]) => hits.map((h) => doc.textBetween(h.from, h.to));

describe("findHits (bul ve değiştir)", () => {
  it("Türkçe büyük/küçük harf duyarsız bulur, biçim sınırını aşan eşleşmeyi de bulur", () => {
    const h = findHits(doc, { query: "istanbul", caseSensitive: false, wholeWord: false });
    expect(texts(h)).toEqual(["İstanbul", "istanbul"]); // “Istanbul” Türkçede “ıstanbul”dur
  });
  it("büyük/küçük harfe duyarlı arama", () => {
    expect(texts(findHits(doc, { query: "Istanbul", caseSensitive: true, wholeWord: false }))).toEqual(["Istanbul"]);
  });
  it("tam kelime seçeneği ekli biçimi dışarıda bırakır", () => {
    expect(findHits(doc, { query: "kaygı", caseSensitive: false, wholeWord: false })).toHaveLength(2);
    expect(findHits(doc, { query: "kaygı", caseSensitive: false, wholeWord: true })).toHaveLength(1);
  });
  it("boş aramada eşleşme yok", () => {
    expect(findHits(doc, { query: "", caseSensitive: false, wholeWord: false })).toEqual([]);
  });
});
