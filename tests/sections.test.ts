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

import { academicOrder } from "@/lib/workflows/structure";
describe("akademik bölüm sırası (D84)", () => {
  const st = (keys: string[]) => keys.map((key) => ({ id: key, key }));
  it("ayrı düşen yöntem aşamasını grubuna, kaynakça ve ekleri sona alır", () => {
    expect(academicOrder(st(["topic", "problem", "literature", "method", "design_development", "conclusion", "references", "appendices", "testing"]))!.map((s) => s.key))
      .toEqual(["topic", "problem", "literature", "method", "design_development", "testing", "conclusion", "references", "appendices"]);
    expect(academicOrder(st(["topic", "problem", "method", "testing", "conclusion", "references", "appendices"]))).toBeNull();
  });
});

import { addSiblingAfter } from "@/lib/editor/sections";
describe("aynı düzeyde alt başlık ekleme (D86)", () => {
  const h = (level: number, text: string) => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });
  const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
  it("başlığın alt başlıklarından sonra aynı düzeyde ekler", () => {
    const d = { type: "doc", content: [h(2, "A"), p("a"), h(3, "A1"), p("a1"), h(2, "B")] };
    const r = addSiblingAfter(d, 0, "Yeni");
    expect(r.index).toBe(4);
    expect(sectionTree(r.doc, "3").map((s) => `${s.number} ${s.text}`)).toEqual(["3.1 A", "3.1.1 A1", "3.2 Yeni", "3.3 B"]);
    const r2 = addSiblingAfter(d, 2, "A2");
    expect(sectionTree(r2.doc, "3").map((s) => `${s.number} ${s.text}`)).toEqual(["3.1 A", "3.1.1 A1", "3.1.2 A2", "3.2 B"]);
    expect(addSiblingAfter(d, 1, "X").index).toBe(-1);
  });
});

import { insertImported } from "@/lib/editor/sections";
describe("içe aktarılan belgeyi yerleştirme (D87)", () => {
  const h = (level: number, text: string) => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });
  const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
  it("bölüm boşsa yerine, değilse sonuna; alt başlıkta giriş metni kendi metnine, başlıklılar alt başlıklarından sonra", () => {
    expect(insertImported({ type: "doc", content: [{ type: "paragraph" }] }, [p("x")], null).content).toEqual([p("x")]);
    const d = { type: "doc", content: [h(2, "A"), p("a"), h(3, "A1"), p("a1"), h(2, "B")] };
    const r = insertImported(d, [p("yeni giriş"), h(3, "A2"), p("a2")], 0);
    expect(sectionTree(r, "3").map((s) => `${s.number} ${s.text}`)).toEqual(["3.1 A", "3.1.1 A1", "3.1.2 A2", "3.2 B"]);
    expect(r.content![2]).toEqual(p("yeni giriş"));
  });
});

import { stagePrefixes } from "@/lib/workflows/structure";
import { buildExportDoc } from "@/lib/export/model";
describe("Giriş açılış metnindeki alt başlıklar (D89)", () => {
  it("sonraki kısımların numarası kayar; sol liste ve indirilen belge aynı numarayı verir", () => {
    const h = (level: number, text: string) => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });
    const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
    const stages = [
      { id: "t", key: "topic", title: "Araştırma konusunun belirlenmesi", position: 0, content_text: "x", content: { type: "doc", content: [p("Açılış."), h(2, "Değişkenlerin Ölçülmesi"), p("a"), h(3, "ISO 14001"), p("b")] } },
      { id: "p", key: "problem", title: "Araştırma probleminin tanımlanması", position: 1, content_text: "y", content: { type: "doc", content: [p("Problem.")] } },
      { id: "u", key: "purpose", title: "Araştırmanın amacı ve önemi", position: 2, content_text: "z", content: { type: "doc", content: [p("Amaç.")] } },
    ];
    const pre = stagePrefixes(stages, { problem: "Araştırma probleminin tanımlanması", purpose: "Araştırmanın amacı ve önemi" });
    expect(pre).toEqual({ t: "1", p: "1.2", u: "1.3" });
    expect(sectionTree(stages[0].content as any, pre.t).map((s) => s.number)).toEqual(["1.1", "1.1.1"]);
    const d = buildExportDoc({ project: { title: "X", language: "tr", citation_style: "apa7", work_type: "capstone", academic_level: "bachelor" }, stages, sources: [], engineItems: [], authorName: "" });
    expect(d.toc.map((x) => `${x.number} ${x.text}`)).toEqual(["1 GİRİŞ", "1.1 Değişkenlerin Ölçülmesi", "1.1.1 ISO 14001", "1.2 Problem Durumu", "1.3 Araştırmanın Amacı ve Önemi"]);
  });
});

describe("seçimli dışa aktarma (D91)", () => {
  it("yalnızca seçilen bölümler aktarılır; numaralar ve ana bölüm başlığı korunur, kaynakça seçilenlere göre", () => {
    const h = (level: number, text: string) => ({ type: "heading", attrs: { level }, content: [{ type: "text", text }] });
    const p = (text: string) => ({ type: "paragraph", content: [{ type: "text", text }] });
    const cite = (id: string) => ({ type: "paragraph", content: [{ type: "text", text: "İddia " }, { type: "citation", attrs: { ids: [id], locator: null, narrative: false } }] });
    const stages = [
      { id: "11111111-1111-1111-1111-111111111111", key: "problem", title: "Araştırma probleminin tanımlanması", position: 0, content_text: "x", content: { type: "doc", content: [cite("a")] } },
      { id: "22222222-2222-2222-2222-222222222222", key: "method", title: "Araştırmanın yöntemi", position: 1, content_text: "y", content: { type: "doc", content: [p("Yöntem.")] } },
      { id: "33333333-3333-3333-3333-333333333333", key: "sample", title: "Evren ve örneklem", position: 2, content_text: "z", content: { type: "doc", content: [h(2, "Örneklem seçimi"), cite("b")] } },
    ];
    const items = [{ id: "a", type: "book", title: "A kitabı", authors: [{ family: "Ak" }], year: 2020 }, { id: "b", type: "book", title: "B kitabı", authors: [{ family: "Bek" }], year: 2021 }] as any;
    const d = buildExportDoc({ project: { title: "X", language: "tr", citation_style: "apa7" }, stages, sources: [], engineItems: items, authorName: "", options: { onlyStageIds: [stages[2].id] } });
    expect(d.toc.map((x) => `${x.number} ${x.text}`)).toEqual(["2 YÖNTEM", "2.2 Evren ve Örneklem", "2.2.1 Örneklem seçimi"]);
    expect(d.bibliography.map((b) => b.rich.map((r) => r.text).join(""))).toEqual([expect.stringContaining("Bek")]);
    expect(JSON.stringify(d.blocks)).not.toContain("Yöntem.");
  });
});
