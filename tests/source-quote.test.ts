/** D207: kaynak okuyucudan seçilen metnin atıflı alıntıya çevrilmesi */
import { describe, expect, it } from "vitest";
import { buildQuoteNodes, cleanSelection, pageLocator } from "@/lib/sources/quote";

const id = "11111111-1111-1111-1111-111111111111";
const cite = (n: any[]) => n.find((x) => x.type === "citation") ?? n[0]?.content?.[0]?.content?.find((x: any) => x.type === "citation");

describe("D207: seçimden alıntı", () => {
  it("seçim temizlenir; kelimeler değişmez", () => {
    expect(cleanSelection("Öz düzen-\nleme  önemli bir\n yordayıcıdır.")).toBe("Öz düzenleme önemli bir yordayıcıdır.");
    expect(cleanSelection("“alıntı”")).toBe("alıntı");
    expect(cleanSelection("a*b [[x]] # c")).toBe("a*b [[x]] # c");
    expect(cleanSelection("Satır sonu hecele-\nmesi birleşir")).toBe("Satır sonu hecelemesi birleşir");
    expect(cleanSelection("Sosyal-Duygusal öğrenme")).toBe("Sosyal-Duygusal öğrenme");
  });
  it("sayfa konumu", () => {
    expect(pageLocator("s. 12")).toBe("12");
    expect(pageLocator("s. 12", "s. 13")).toBe("12–13");
    expect(pageLocator("13", "12")).toBe("12–13");
    expect(pageLocator(null, null)).toBeNull();
    expect(pageLocator(null, "s. 7")).toBe("7");
  });
  it("kısa alıntı: tırnak + sayfalı atıf + nokta atıftan sonra", () => {
    const r = buildQuoteNodes({ text: "Öz düzenleme başarıyı yordar.", locator: "12", kind: "quote", sourceId: id });
    expect(r.block).toBe(false);
    expect(r.nodes[0]).toEqual({ type: "text", text: "“Öz düzenleme başarıyı yordar” " });
    expect(cite(r.nodes).attrs).toEqual({ ids: [id], locator: "12", narrative: false });
    expect(r.nodes[2]).toEqual({ type: "text", text: ". " });
  });
  it("soru işareti tırnağın içinde kalır", () => {
    const r = buildQuoteNodes({ text: "Neden erteleriz?", locator: null, kind: "quote", sourceId: id });
    expect(r.nodes[0].text).toBe("“Neden erteleriz?” ");
    expect(cite(r.nodes).attrs.locator).toBeNull();
  });
  it("40 kelime ve üzeri blok alıntı, tırnaksız", () => {
    const long = Array.from({ length: 45 }, (_, i) => `kelime${i}`).join(" ");
    const r = buildQuoteNodes({ text: long, locator: "12–13", kind: "quote", sourceId: id });
    expect(r.block).toBe(true);
    expect(r.nodes[0].type).toBe("blockquote");
    const p = r.nodes[0].content![0].content!;
    expect(p[0].text).toBe(`${long}. `);
    expect(p[0].text!.startsWith("“")).toBe(false);
    expect(p[1].attrs!.locator).toBe("12–13");
  });
  it("yalnızca atıf", () => {
    const r = buildQuoteNodes({ text: "herhangi", locator: "5", kind: "cite", sourceId: id });
    expect(r.nodes.map((n) => n.type)).toEqual(["text", "citation"]);
    expect(r.nodes[1].attrs!.locator).toBe("5");
  });
});
