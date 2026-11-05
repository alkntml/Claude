import { describe, expect, it } from "vitest";
import { addSubheadings, removeSection, renameSection, replaceSectionBody, sectionDoc, sectionTree } from "@/lib/editor/sections";
import type { JSONNode } from "@/lib/editor/doc";

const h = (level: number, text: string): JSONNode => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });
const p = (text: string): JSONNode => ({ type: "paragraph", content: [{ type: "text", text }] });
const doc = (...c: JSONNode[]): JSONNode => ({ type: "doc", content: c });

describe("bölüm içi alt başlıklar (D83)", () => {
  const d = doc(p("Giriş metni."), h(2, "Kuram"), p("Kuram metni."), h(3, "Alt kuram"), p("Alt metin bir iki."), h(2, "Model"), p("Model metni."));

  it("numaraları belgedeki önekle verir ve kendi metnini sayar", () => {
    const t = sectionTree(d, "3");
    expect(t.map((s) => [s.number, s.text, s.words])).toEqual([["3.1", "Kuram", 2], ["3.1.1", "Alt kuram", 4], ["3.2", "Model", 2]]);
    expect(t[0].end).toBe(5);
    // Düzey atlanırsa “3.0.1” olmaz
    expect(sectionTree(doc(h(3, "Atlanan")), "1.2").map((s) => s.number)).toEqual(["1.2.1"]);
  });

  it("yalnızca alt başlığın kendi metnini açar ve geri yazar; başka başlıklara dokunmaz", () => {
    expect(sectionDoc(d, 1).content).toEqual([p("Kuram metni.")]);
    const next = replaceSectionBody(d, 1, [p("Yeni 1."), h(2, "Sızan başlık"), p("Yeni 2.")]);
    expect(next.content?.map((n) => n.type === "heading" ? `#${(n.content?.[0] as JSONNode).text}` : (n.content?.[0] as JSONNode).text)).toEqual(["Giriş metni.", "#Kuram", "Yeni 1.", "Yeni 2.", "#Alt kuram", "Alt metin bir iki.", "#Model", "Model metni."]);
    // Boş editör (tek boş paragraf) metin sayılmaz
    expect(replaceSectionBody(d, 5, [{ type: "paragraph" }]).content?.length).toBe(6);
  });

  it("alt başlık ekler: bölüm sonuna ## veya bir başlığın altına (mevcut alt başlıklardan sonra) bir alt düzeyde", () => {
    const a = addSubheadings(d, ["Yöntem", "Model"], null);
    expect(a.added).toEqual([7]);
    expect(sectionTree(a.doc, "3").map((s) => s.number + " " + s.text)).toContain("3.3 Yöntem");
    const b = addSubheadings(d, ["İkinci alt kuram"], 1);
    expect(b.added).toEqual([5]);
    expect(sectionTree(b.doc, "3").map((s) => s.number)).toEqual(["3.1", "3.1.1", "3.1.2", "3.2"]);
    // Gruplu aşamada en fazla ### (1.2.1.1); daha derini açılmaz
    expect(addSubheadings(d, ["Derin"], 3, { maxLevel: 3 }).added).toEqual([]);
    // Boş bölüm
    expect(addSubheadings(doc({ type: "paragraph" }), ["A", "B"], null).doc.content?.length).toBe(2);
  });

  it("yeniden adlandırır ve alt başlıklarıyla birlikte siler", () => {
    expect(sectionTree(renameSection(d, 5, "Araştırma Modeli")).map((s) => s.text)).toContain("Araştırma Modeli");
    expect(sectionTree(removeSection(d, 1)).map((s) => s.text)).toEqual(["Model"]);
  });
});
