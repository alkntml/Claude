import { describe, expect, it } from "vitest";
import { chunkText } from "@/lib/files/chunk";
import { citationUsages, markdownToDoc } from "@/lib/editor/doc";
import { pdfPageLabels } from "@/lib/sources/pages";
import { CitationEngine } from "@/lib/citations/styles";

describe("tam metin sayfa numaraları", () => {
  it("PDF sayfalarını yayındaki sayfa aralığına eşler", () => {
    expect(pdfPageLabels("185-188", 4)).toEqual(["185", "186", "187", "188"]);
    expect(pdfPageLabels("185–96", 12)).toEqual(Array.from({ length: 12 }, (_, i) => String(185 + i)));
  });
  it("tek fazla sayfayı kapak sayfası kabul eder", () => {
    expect(pdfPageLabels("10-12", 4)).toEqual([null, "10", "11", "12"]);
  });
  it("künyede sayfa yoksa PDF sayfası, eşleşmiyorsa hiç sayfa vermez", () => {
    expect(pdfPageLabels(null, 3)).toEqual(["1", "2", "3"]);
    expect(pdfPageLabels("1-20", 7)).toEqual(Array(7).fill(null));
    expect(pdfPageLabels("e0123", 2)).toEqual([null, null]);
  });
  it("parçalara gerçek sayfa ipucu yazılır", () => {
    const pages = ["a ".repeat(40), "b ".repeat(40)];
    const chunks = chunkText({ pages, text: pages.join("\n"), pageLabels: ["42", null] });
    expect(chunks[0].pageHint).toBe("s. 42");
    expect(chunks[1].pageHint).toBeNull();
  });
});

describe("kaynağın kullanıldığı yerler", () => {
  it("bölüm, alt başlık, sayfa ve sıra bilgisini çıkarır", () => {
    const resolve = (sid: string) => ({ S1: "u1", S2: "u2" })[sid] ?? null;
    const a = markdownToDoc("## Bağlanma\n\nBağlanma erken dönemde oluşur [[kaynak:S1|s. 12]]. Diğer görüş [[kaynak:S1,S2]].", resolve);
    const b = markdownToDoc("Tartışmada yeniden ele alındı [[kaynak:S2]].", resolve);
    const u = citationUsages([{ id: "st1", title: "Kuram", content: a }, { id: "st2", title: "Tartışma", content: b }]);
    expect(u.get("u1")).toHaveLength(2);
    expect(u.get("u1")![0]).toMatchObject({ stageId: "st1", heading: "Bağlanma", locator: "12", occurrence: 0 });
    expect(u.get("u1")![1].occurrence).toBe(1);
    expect(u.get("u1")![0].snippet).toContain("Bağlanma erken dönemde oluşur⟦…⟧");
    expect(u.get("u2")!.map((x) => x.stageId)).toEqual(["st1", "st2"]);
  });
});

describe("sayfa numaralı atıf stile göre biçimlenir", () => {
  const item = { id: "u1", type: "article-journal" as const, title: "T", authors: [{ family: "Doron", given: "Guy" }], year: 2014, containerTitle: "J", pages: "185-196" };
  it("APA 7 (İngilizce) p. gösterimi", () => {
    const e = new CitationEngine("apa7", [item], { locale: "en" });
    expect(JSON.stringify(e.cite(["u1"], { locator: "187" }))).toContain("p. 187");
  });
  it("APA 7 (Türkçe) s. gösterimi", () => {
    const e = new CitationEngine("apa7", [item], { locale: "tr" });
    expect(JSON.stringify(e.cite(["u1"], { locator: "187-188" }))).toMatch(/s\. 187–188/);
  });
});
