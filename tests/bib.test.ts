import { describe, expect, it } from "vitest";
import { detectFormat, latexToUnicode, parseBibTeX, parseCslJson, parseName, parseReferences, parseRIS, toBibTeX, toRIS } from "@/lib/sources/bib";
import type { CitationItem } from "@/lib/citations/types";

const BIB = String.raw`
% Zotero dışa aktarımı
@string{jocrd = "Journal of Obsessive-Compulsive and Related Disorders"}
@article{doron2014,
  title = {Relationship {Obsessive} Compulsive Disorder ({ROCD}): A conceptual framework},
  author = {Doron, Guy and Derby, Danny S. and Szepsenwol, Ohad},
  journal = jocrd,
  year = 2014,
  volume = {3}, number = {2},
  pages = {169--180},
  doi = {10.1016/j.jocrd.2013.12.005},
  month = apr
}
@phdthesis{yilmaz2020,
  author = {Y{\i}lmaz, Ay{\c{s}}e and {T\"{u}rk Psikologlar Derne\u{g}i}},
  title = "Ergenlerde ba{\u{g}}lanma ve {\"O}z-de{\u g}er",
  school = {Hacettepe {\"U}niversitesi},
  year = {2020}
}
@incollection{bowlby, author={John Bowlby}, title={Attachment}, booktitle={Handbook of Things}, editor={Ludwig van Beethoven}, publisher={Basic}, address={New York}, year={1969}, pages={1-10}}
@comment{bu bir yorum}
@misc(web1, title = {Sağlık Bakanlığı rehberi}, url = {https://saglik.gov.tr/x}, year = {2023})
`;

describe("BibTeX içe aktarma", () => {
  const refs = parseBibTeX(BIB);
  it("tüm girdileri ve türleri ayrıştırır (yorum atlanır)", () => {
    expect(refs.map((r) => r.type)).toEqual(["article-journal", "thesis", "chapter", "webpage"]);
  });
  it("makale alanları, @string makrosu, ay ve sayfa", () => {
    expect(refs[0]).toMatchObject({
      title: "Relationship Obsessive Compulsive Disorder (ROCD): A conceptual framework",
      containerTitle: "Journal of Obsessive-Compulsive and Related Disorders", year: 2014, month: 4, volume: "3", issue: "2", pages: "169-180", doi: "10.1016/j.jocrd.2013.12.005",
    });
    expect(refs[0].authors).toEqual([{ family: "Doron", given: "Guy" }, { family: "Derby", given: "Danny S." }, { family: "Szepsenwol", given: "Ohad" }]);
  });
  it("LaTeX Türkçe karakterleri ve kurum yazarı", () => {
    expect(refs[1].title).toBe("Ergenlerde bağlanma ve Öz-değer");
    expect(refs[1].authors).toEqual([{ family: "Yılmaz", given: "Ayşe" }, { literal: "Türk Psikologlar Derneği" }]);
    expect(refs[1]).toMatchObject({ publisher: "Hacettepe Üniversitesi", genre: "doctoral" });
  });
  it("kitap bölümü: editör (van öneki), yayınevi, yer; parantezli girdi", () => {
    expect(refs[2]).toMatchObject({ containerTitle: "Handbook of Things", publisher: "Basic", publisherPlace: "New York", pages: "1-10" });
    expect(refs[2].authors).toEqual([{ given: "John", family: "Bowlby" }]);
    expect(refs[2].editors).toEqual([{ given: "Ludwig", family: "van Beethoven" }]);
    expect(refs[3]).toMatchObject({ title: "Sağlık Bakanlığı rehberi", url: "https://saglik.gov.tr/x", year: 2023 });
  });
  it("latex yardımcıları", () => {
    expect(latexToUnicode("\\c{C}ocuk \\u{g} \\.{I}stanbul --- \\& \\i")).toBe("Çocuk ğ İstanbul — & ı");
    expect(parseName("van der Berg, Jan")).toEqual({ family: "van der Berg", given: "Jan" });
  });
});

const RIS = `TY  - JOUR
AU  - Doron, Guy
AU  - Derby, Danny S.
TI  - Relationship obsessive compulsive disorder
JO  - Journal of OCRD
PY  - 2014/04/01
VL  - 3
IS  - 2
SP  - 169
EP  - 180
DO  - https://doi.org/10.1016/j.jocrd.2013.12.005
AB  - Birinci satır
devam eden özet.
ER  - 

TY  - THES
AU  - Kaya, Mehmet
TI  - Bir yüksek lisans tezi
PB  - Ankara Üniversitesi
PY  - 2019
M3  - Yüksek lisans tezi
ER  - 
`;

describe("RIS içe aktarma", () => {
  const refs = parseRIS(RIS);
  it("makale ve tez", () => {
    expect(refs).toHaveLength(2);
    expect(refs[0]).toMatchObject({ type: "article-journal", containerTitle: "Journal of OCRD", year: 2014, month: 4, pages: "169-180", doi: "10.1016/j.jocrd.2013.12.005", abstract: "Birinci satır devam eden özet." });
    expect(refs[1]).toMatchObject({ type: "thesis", publisher: "Ankara Üniversitesi", genre: "master", year: 2019 });
  });
});

describe("CSL-JSON içe aktarma ve biçim tespiti", () => {
  const json = JSON.stringify([{ type: "article-journal", title: "T", author: [{ family: "A", given: "B" }, { literal: "WHO" }], issued: { "date-parts": [[2020, 5]] }, "container-title": "J", page: "1–5", DOI: "10.1/x" }]);
  it("alanlar", () => {
    expect(parseCslJson(json)[0]).toMatchObject({ title: "T", year: 2020, month: 5, pages: "1-5", doi: "10.1/x", containerTitle: "J", authors: [{ family: "A", given: "B" }, { literal: "WHO" }] });
  });
  it("biçimi içerikten tanır", () => {
    expect(detectFormat(BIB)).toBe("bibtex");
    expect(detectFormat(RIS)).toBe("ris");
    expect(detectFormat(json)).toBe("csljson");
    expect(detectFormat("düz metin")).toBeNull();
    expect(parseReferences("düz metin").refs).toEqual([]);
  });
});

describe("dışa aktarma ve gidiş-dönüş", () => {
  const items: CitationItem[] = [
    { id: "1", type: "article-journal", title: "Bağlanma & kaygı", authors: [{ family: "Yılmaz", given: "Ayşe" }, { literal: "WHO" }], year: 2020, containerTitle: "Türk Psikoloji Dergisi", volume: "35", issue: "2", pages: "10-20", doi: "10.1/abc" },
    { id: "2", type: "thesis", title: "Tez", authors: [{ family: "Yılmaz", given: "Ali" }], year: 2020, institution: "ODTÜ", genre: "master", archive: "yok", archiveId: "12345" },
  ];
  it("BibTeX: anahtarlar tekil, Türkçe korunur, tekrar ayrıştırılınca aynı", () => {
    const bib = toBibTeX(items);
    expect(bib).toContain("@article{Yilmaz2020,");
    expect(bib).toContain("@mastersthesis{Yilmaz2020a,");
    expect(bib).toContain("title = {{Bağlanma \\& kaygı}}");
    const back = parseBibTeX(bib);
    expect(back[0]).toMatchObject({ title: "Bağlanma & kaygı", containerTitle: "Türk Psikoloji Dergisi", pages: "10-20", doi: "10.1/abc", year: 2020 });
    expect(back[0].authors).toEqual([{ family: "Yılmaz", given: "Ayşe" }, { literal: "WHO" }]);
    expect(back[1]).toMatchObject({ type: "thesis", genre: "master", publisher: "ODTÜ" });
  });
  it("RIS gidiş-dönüş", () => {
    const back = parseRIS(toRIS(items));
    expect(back[0]).toMatchObject({ title: "Bağlanma & kaygı", pages: "10-20", volume: "35", issue: "2", doi: "10.1/abc" });
    expect(back[1]).toMatchObject({ type: "thesis", genre: "master", publisher: "ODTÜ" });
  });
});
