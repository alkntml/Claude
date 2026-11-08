import { describe, expect, it } from "vitest";
import { mergeDocs } from "@/lib/editor/merge";
import type { JSONNode } from "@/lib/editor/doc";

const p = (t: string): JSONNode => ({ type: "paragraph", content: [{ type: "text", text: t }] });
const doc = (...xs: string[]): JSONNode => ({ type: "doc", content: xs.map(p) });
const texts = (d: JSONNode) => (d.content ?? []).map((b) => (b.content?.[0] as { text?: string } | undefined)?.text ?? "");

describe("mergeDocs (paragraf düzeyinde üç yollu birleştirme)", () => {
  const base = doc("A", "B", "C", "D");
  it("farklı paragraflardaki değişiklikleri birleştirir", () => {
    const r = mergeDocs(base, doc("A1", "B", "C", "D"), doc("A", "B", "C2", "D"));
    expect(texts(r.doc)).toEqual(["A1", "B", "C2", "D"]);
    expect(r.conflicts).toBe(0);
  });
  it("bir tarafın eklediği ve diğerinin sildiği farklı yerleri korur", () => {
    const r = mergeDocs(base, doc("A", "X", "B", "C", "D"), doc("A", "B", "C"));
    expect(texts(r.doc)).toEqual(["A", "X", "B", "C"]);
    expect(r.conflicts).toBe(0);
  });
  it("aynı paragraf iki tarafta farklı değiştiyse yereli korur, çakışmayı sayar", () => {
    const r = mergeDocs(base, doc("A", "B-mine", "C", "D"), doc("A", "B-theirs", "C", "D"));
    expect(texts(r.doc)).toEqual(["A", "B-mine", "C", "D"]);
    expect(r.conflicts).toBe(1);
  });
  it("iki taraf aynı değişikliği yaptıysa tek kez alır", () => {
    const r = mergeDocs(base, doc("A", "B2", "C", "D"), doc("A", "B2", "C", "D"));
    expect(texts(r.doc)).toEqual(["A", "B2", "C", "D"]);
    expect(r.changed).toBe(false);
  });
  it("yalnız karşı taraf değiştiyse onun sürümünü alır", () => {
    const r = mergeDocs(base, base, doc("A", "B", "C", "D", "E"));
    expect(texts(r.doc)).toEqual(["A", "B", "C", "D", "E"]);
    expect(r.changed).toBe(true);
  });
  it("taban yoksa (ilk eşitleme) yereli korur ve çakışma bildirir", () => {
    const r = mergeDocs(null, doc("A"), doc("B"));
    expect(texts(r.doc)).toEqual(["A"]);
    expect(r.conflicts).toBe(1);
  });
  it("iki taraf da sona farklı paragraf eklerse çakışma sayar (sıra belirsiz)", () => {
    const r = mergeDocs(base, doc("A", "B", "C", "D", "M"), doc("A", "B", "C", "D", "T"));
    expect(r.conflicts).toBe(1);
  });
  it("prefer=theirs ile çakışmada karşı tarafın paragrafını alır (iki taraf aynı sonuca varır)", () => {
    const mine = doc("A", "B-mine", "C", "D"), theirs = doc("A", "B-theirs", "C2", "D");
    const a = mergeDocs(base, mine, theirs, "theirs");
    const b = mergeDocs(base, theirs, mine, "mine");
    expect(texts(a.doc)).toEqual(["A", "B-theirs", "C2", "D"]);
    expect(texts(b.doc)).toEqual(texts(a.doc));
  });
});
