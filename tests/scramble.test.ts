import { describe, expect, it } from "vitest";
import { scrambleDoc, scrambleSource, scrambleText } from "@/lib/scramble";

describe("karartma (çalışma kilidi)", () => {
  it("metnin uzunluğunu ve boşluklarını korur, kelimeleri sızdırmaz", () => {
    const src = "Elektrikli araçların batarya ömrü 2019 yılında %12 azaldı.";
    const out = scrambleText(src);
    expect(out).toHaveLength(src.length);
    expect(out.split(" ").map((w) => w.length)).toEqual(src.split(" ").map((w) => w.length));
    for (const w of ["Elektrikli", "araçların", "batarya", "2019", "12"]) expect(out).not.toContain(w);
  });
  it("belge yapısını korur, şekil ve bağlantıları çıkarır", () => {
    const doc = { type: "doc", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Giriş" }] }, { type: "figure", attrs: { src: "data:image/png;base64,AAAA", caption: "Şekil 1" } }] };
    const out = scrambleDoc(doc);
    expect(out.content[0].type).toBe("heading");
    expect(JSON.stringify(out)).not.toContain("Giriş");
    expect(JSON.stringify(out)).not.toContain("base64");
  });
  it("kaynakta DOI, bağlantı ve künye gizlenir", () => {
    const row = { id: "x", title: "Lithium-ion degradation", authors: [{ family: "Smith", given: "John" }], doi: "10.1/abc", url: "https://a.b", abstract: "We show that", year: 2020 };
    const out = scrambleSource(row);
    const json = JSON.stringify(out);
    for (const w of ["Lithium", "Smith", "10.1/abc", "https://", "We show"]) expect(json).not.toContain(w);
    expect(out.year).toBe(2020);
  });
});
