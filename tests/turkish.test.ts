import { describe, expect, it } from "vitest";
import { CitationEngine } from "@/lib/citations/styles";
import { openAlexUrl } from "@/lib/sources/providers";
import { isDergiPark, turkishSearchLinks } from "@/lib/sources/labels";
import { toRow, SourceInput } from "@/lib/sources/input";
import { sourceRowToItemClient } from "@/lib/sources/row";

const plain = (r: { text: string }[]) => r.map((s) => s.text).join("");

describe("Türk kaynakları", () => {
  it("OpenAlex sorgusu Türkçe ve Türkiye filtresini taşır", () => {
    const u = new URL(openAlexUrl({ query: "bağlanma kuramı", yearFrom: 2015 }, { contactEmail: "a@b.c" }, ["language:tr"]));
    expect(u.searchParams.get("filter")).toBe("language:tr,from_publication_date:2015-01-01");
    expect(u.searchParams.get("search")).toBe("bağlanma kuramı");
  });
  it("DergiPark kayıtlarını bağlantıdan tanır", () => {
    expect(isDergiPark({ url: "https://dergipark.org.tr/tr/pub/aupsikoloji/issue/1/2" })).toBe(true);
    expect(isDergiPark({ oa_url: "https://dergipark.org.tr/tr/download/article-file/123" })).toBe(true);
    expect(isDergiPark({ url: "https://evil.com/?x=dergipark.org.tr/" })).toBe(false);
    expect(isDergiPark({ url: "https://doi.org/10.1/x" })).toBe(false);
  });
  it("Türk veri tabanı bağlantıları sorguyu kodlar", () => {
    const links = turkishSearchLinks("ebeveyn tutumları & OKB");
    expect(links.find((l) => l.id === "dergipark")!.url).toContain("q=ebeveyn%20tutumlar%C4%B1%20%26%20OKB");
    expect(links.map((l) => l.id)).toEqual(["dergipark", "trdizin", "yoktez"]);
  });
});

describe("tez künyesi (YÖK Tez Merkezi)", () => {
  const input = SourceInput.parse({ type: "thesis", title: "Ergenlerde bağlanma", authors: [{ family: "Yılmaz", given: "Ayşe" }], year: 2021, publisher: "Ankara Üniversitesi", genre: "master", archive: "yok", archiveId: "654321", origins: ["manual"] });
  const row = { ...toRow(input), id: "t1" };
  const item = sourceRowToItemClient(row);
  it("tez türü ve arşiv bilgisi saklanır", () => {
    expect(item).toMatchObject({ genre: "master", archive: "yok", archiveId: "654321", institution: "Ankara Üniversitesi" });
  });
  it("APA 7 Türkçe", () => {
    const e = new CitationEngine("apa7", [item], { locale: "tr" });
    expect(plain(e.bibliography(["t1"])[0].rich)).toBe("Yılmaz, A. (2021). Ergenlerde bağlanma [Yüksek lisans tezi, Ankara Üniversitesi]. YÖK Ulusal Tez Merkezi (Tez No. 654321).");
  });
  it("APA 7 İngilizce", () => {
    const e = new CitationEngine("apa7", [item], { locale: "en" });
    expect(plain(e.bibliography(["t1"])[0].rich)).toBe("Yılmaz, A. (2021). Ergenlerde bağlanma [Master's thesis, Ankara Üniversitesi]. YÖK National Thesis Center (Publication No. 654321).");
  });
});
