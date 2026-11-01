import { describe, expect, it } from "vitest";
import { CitationEngine } from "@/lib/citations/styles";
import { renderPptx, resolveMarkers } from "@/lib/export/presentation";

const items = [{ id: "u1", type: "article-journal" as const, title: "ROCD", authors: [{ family: "Doron", given: "Guy" }], year: 2014, containerTitle: "J" }];

describe("savunma sunumu", () => {
  it("işaretleri gerçek atıfa çevirir, listede olmayanı çıkarır", () => {
    const used = new Set<string>();
    const e = new CitationEngine("apa7", items, { locale: "tr" });
    expect(resolveMarkers("İlişki odaklı OKB tanımlanmıştır [[kaynak:S1|s. 170]].", { S1: "u1" }, e, used)).toBe("İlişki odaklı OKB tanımlanmıştır (Doron, 2014, s. 170).");
    expect(resolveMarkers("Uydurma [[kaynak:S9]].", { S1: "u1" }, e, used)).toBe("Uydurma.");
    expect([...used]).toEqual(["u1"]);
  });
  it("geçerli bir .pptx (zip) üretir: başlık + içerik + kaynakça slaytları", async () => {
    const buf = await renderPptx({
      deck: { slides: [{ title: "Problem", bullets: ["Boşluk [[kaynak:S1]]", "İkinci madde"], notes: "Not" }, { title: "Yöntem", bullets: ["İlişkisel tarama"], notes: "" }] },
      sourceMap: { S1: "u1" },
      project: { title: "Deneme Tez", language: "tr", citation_style: "apa7", context: { format: { cover: { university: "Hacettepe Üniversitesi", advisor: "Prof. Dr. X" } } } },
      items, authorName: "Ayşe Yılmaz",
    });
    expect(buf.subarray(0, 2).toString("latin1")).toBe("PK");
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buf);
    const slides = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
    expect(slides).toHaveLength(4);
    const s2 = await zip.file("ppt/slides/slide2.xml")!.async("string");
    expect(s2).toContain("Boşluk (Doron, 2014)");
    const s4 = await zip.file("ppt/slides/slide4.xml")!.async("string");
    expect(s4).toContain("Kaynakça");
  });
});
