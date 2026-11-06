import { describe, expect, it } from "vitest";
import { STYLES } from "@/lib/citations";
import { captionRef, formatCaption, fromRoman, maxCaptionNo, noteLabel, parseCaption, toRoman } from "@/lib/citations/captions";
import { buildExportDoc, type Block } from "@/lib/export/model";

const text = (l: { text: string }[]) => l.map((r) => r.text).join("");
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

describe("tablo ve şekil başlıkları (D106)", () => {
  it("APA 7: tablo ve şekil üstte, numara kalın, başlık alt satırda italik", () => {
    for (const kind of ["table", "figure"] as const) {
      const f = formatCaption("apa7", kind, 2, "Betimsel İstatistikler", "tr");
      expect(f.position).toBe("above");
      expect(f.lines).toEqual([[{ text: kind === "table" ? "Tablo 2" : "Şekil 2", bold: true }], [{ text: "Betimsel İstatistikler", italic: true }]]);
    }
    expect(noteLabel("apa7", "tr")).toEqual({ text: "Not.", italic: true });
  });
  it("APA 6: şekil başlığı altta, “Şekil 1.” italik", () => {
    const f = formatCaption("apa6", "figure", 1, "Puan dağılımı", "tr");
    expect(f.position).toBe("below");
    expect(f.lines[0][0]).toEqual({ text: "Şekil 1.", italic: true });
  });
  it("IEEE: tablo Roma rakamı, büyük harf, ortalı; şekil “Fig. 1.” altta", () => {
    const t = formatCaption("ieee", "table", 4, "Model sonuçları", "en");
    expect(t).toMatchObject({ position: "above", align: "center" });
    expect(t.lines.map(text)).toEqual(["TABLE IV", "MODEL SONUÇLARI".toLocaleUpperCase("en")]);
    expect(formatCaption("ieee", "table", 1, "ılık", "tr").lines.map(text)).toEqual(["TABLO I", "ILIK"]);
    const f = formatCaption("ieee", "figure", 3, "Akış", "en");
    expect(f.position).toBe("below");
    expect(text(f.lines[0])).toBe("Fig. 3. Akış");
  });
  it("MLA: tablo numarası ve başlığı ayrı satırlarda; şekil “Fig. 1.” altta", () => {
    expect(formatCaption("mla", "table", 1, "Scores", "en").lines.map(text)).toEqual(["Table 1", "Scores"]);
    expect(text(formatCaption("mla", "figure", 1, "Scores", "en").lines[0])).toBe("Fig. 1. Scores");
  });
  it("her stil için tablo üstte; APA 7 dışındaki stillerde şekil altta", () => {
    for (const id of Object.keys(STYLES)) {
      expect(formatCaption(id, "table", 1, "Başlık", "tr").position).toBe("above");
      expect(formatCaption(id, "figure", 1, "Başlık", "tr").position).toBe(id === "apa7" ? "above" : "below");
      const all = formatCaption(id, "table", 7, "Başlık", "tr").lines.map(text).join(" ");
      expect(all).toMatch(/(Tablo|TABLO) (7|VII)/);
      expect(all.toLocaleLowerCase("tr")).toContain("başlık");
    }
    expect(text(formatCaption("chicago", "table", 1, "Başlık", "tr").lines[0])).toBe("Tablo 1. Başlık");
    expect(text(formatCaption("harvard", "figure", 1, "Başlık", "tr").lines[0])).toBe("Şekil 1: Başlık");
    expect(formatCaption("ama", "table", 1, "Başlık", "tr").lines[0][0]).toEqual({ text: "Tablo 1.", bold: true });
  });
  it("her stilde üretilen başlık yeniden tanınır (stil değişince dönüştürülebilir)", () => {
    for (const id of Object.keys(STYLES)) for (const kind of ["table", "figure"] as const) for (const lang of ["tr", "en"] as const) {
      const f = formatCaption(id, kind, 12, "Örnek başlık", lang);
      const first = parseCaption(text(f.lines[0]));
      expect(first, `${id} ${kind} ${lang}`).toMatchObject({ kind, no: 12 });
    }
  });
  it("tablo göndermeleri ve Roma rakamları", () => {
    expect(captionRef("ieee", "table", 9, "tr")).toBe("Tablo IX");
    expect(captionRef("apa7", "figure", 2, "en")).toBe("Figure 2");
    expect(toRoman(14)).toBe("XIV");
    expect(fromRoman("XIV")).toBe(14);
  });
  it("metin cümleleri başlık sayılmaz; numara bulma tüm biçimleri tanır", () => {
    expect(parseCaption("Tablo 1’de görüldüğü gibi puanlar yüksektir.")).toBeNull();
    expect(parseCaption("Tablo 1 ve Tablo 2 karşılaştırıldığında")).toBeNull();
    expect(parseCaption("Tablo 3")).toMatchObject({ kind: "table", no: 3, labelOnly: true });
    expect(maxCaptionNo("Giriş\nTablo 2\nBaşlık\nTABLO IV\nX\nTablo 3. Y", "table")).toBe(4);
    expect(maxCaptionNo("Fig. 5. A\nŞekil 2. B", "figure")).toBe(5);
  });
  it("dışa aktarma: başlık güncel stile göre yeniden biçimlenir ve şeklin altına/üstüne taşınır", () => {
    // Editörde APA 7 biçiminde (üstte, iki satır) yazılmış şekil + not
    const content = { type: "doc", content: [
      { type: "paragraph", content: [{ type: "text", text: "Şekil 1", marks: [{ type: "bold" }] }] },
      { type: "paragraph", content: [{ type: "text", text: "Puan dağılımı", marks: [{ type: "italic" }] }] },
      { type: "figure", attrs: { src: PNG, alt: "x" } },
      { type: "paragraph", content: [{ type: "text", text: "Not.", marks: [{ type: "italic" }] }, { type: "text", text: " N = 120." }] },
      { type: "paragraph", content: [{ type: "text", text: "Tablo 1’de görüldüğü gibi ortalama yüksektir." }] },
    ] };
    const run = (style: string) => buildExportDoc({ project: { title: "T", language: "tr", citation_style: style, context: {} }, stages: [{ id: "s", key: "findings", title: "Bulgular", position: 1, content, content_text: "x" }], sources: [], engineItems: [], authorName: "A" }).blocks;
    const kinds = (bs: Block[]) => bs.filter((b) => b.kind !== "heading").map((b) => b.kind);
    const apa = run("apa7");
    expect(kinds(apa)).toEqual(["caption", "image", "paragraph", "paragraph"]);
    const chicago = run("chicago");
    expect(kinds(chicago)).toEqual(["image", "caption", "paragraph", "paragraph"]);
    const cap = chicago.find((b) => b.kind === "caption") as Extract<Block, { kind: "caption" }>;
    expect(cap.lines.map(text)).toEqual(["Şekil 1. Puan dağılımı"]);
    const note = chicago.filter((b) => b.kind === "paragraph")[0] as Extract<Block, { kind: "paragraph" }>;
    expect(text(note.runs)).toBe("Not: N = 120.");
    // Başlık olmayan cümle paragraf olarak kalır
    expect(text((chicago.filter((b) => b.kind === "paragraph")[1] as Extract<Block, { kind: "paragraph" }>).runs)).toContain("görüldüğü gibi");
  });
});
