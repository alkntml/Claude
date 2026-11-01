import { describe, expect, it } from "vitest";
import { CitationEngine, checkConsistency, findDuplicates, missingFields, richToPlain, type CitationItem } from "@/lib/citations";

const article: CitationItem = {
  id: "a1",
  type: "article-journal",
  title: "Relationship obsessive compulsive disorder: A review",
  authors: [
    { family: "Doron", given: "Guy" },
    { family: "Derby", given: "Danny S." },
    { family: "Szepsenwol", given: "Ohad" },
  ],
  year: 2014,
  containerTitle: "Journal of Obsessive-Compulsive and Related Disorders",
  volume: "3",
  issue: "2",
  pages: "169-180",
  doi: "10.1016/j.jocrd.2013.12.005",
};

const book: CitationItem = {
  id: "b1",
  type: "book",
  title: "Attachment and loss",
  authors: [{ family: "Bowlby", given: "John" }],
  year: 1969,
  publisher: "Basic Books",
  publisherPlace: "New York",
};

const single: CitationItem = {
  id: "s1",
  type: "article-journal",
  title: "Parenting styles",
  authors: [{ family: "Baumrind", given: "Diana" }],
  year: 1991,
  containerTitle: "Journal of Early Adolescence",
  volume: "11",
  issue: "1",
  pages: "56-95",
};

const plain = (r: ReturnType<CitationEngine["entry"]>) => richToPlain(r);

describe("APA 7", () => {
  const en = new CitationEngine("apa7", [article, book, single], { locale: "en" });
  it("formats journal article reference", () => {
    expect(plain(en.entry(article))).toBe(
      "Doron, G., Derby, D. S., & Szepsenwol, O. (2014). Relationship obsessive compulsive disorder: A review. Journal of Obsessive-Compulsive and Related Disorders, 3(2), 169–180. https://doi.org/10.1016/j.jocrd.2013.12.005",
    );
  });
  it("italicises journal name and volume", () => {
    const r = en.entry(article);
    expect(r.filter((s) => s.italic).map((s) => s.text)).toEqual(["Journal of Obsessive-Compulsive and Related Disorders", "3"]);
  });
  it("formats book without location", () => {
    expect(plain(en.entry(book))).toBe("Bowlby, J. (1969). Attachment and loss. Basic Books.");
  });
  it("in-text: et al. for 3+ authors, & in parentheses, page locator", () => {
    expect(plain(en.cite(["a1"]))).toBe("(Doron et al., 2014)");
    expect(plain(en.cite(["s1"], { locator: "60" }))).toBe("(Baumrind, 1991, p. 60)");
    expect(plain(en.cite(["s1"], { locator: "60-62" }))).toBe("(Baumrind, 1991, pp. 60–62)");
    expect(plain(en.cite(["s1"], { narrative: true }))).toBe("Baumrind (1991)");
  });
  it("sorts grouped citations alphabetically", () => {
    expect(plain(en.cite(["s1", "b1", "a1"]))).toBe("(Baumrind, 1991; Bowlby, 1969; Doron et al., 2014)");
  });
  it("uses Turkish terms", () => {
    const tr = new CitationEngine("apa7", [article, single], { locale: "tr" });
    expect(plain(tr.cite(["a1"], { locator: "12" }))).toBe("(Doron vd., 2014, s. 12)");
  });
  it("adds year suffixes for same author same year", () => {
    const x: CitationItem = { ...single, id: "x", title: "Another study" };
    const e = new CitationEngine("apa7", [single, x], { locale: "en" });
    expect(plain(e.cite(["x"]))).toBe("(Baumrind, 1991a)");
    expect(plain(e.cite(["s1"]))).toBe("(Baumrind, 1991b)");
  });
  it("truncates more than 20 authors", () => {
    const many: CitationItem = { ...single, id: "m", authors: Array.from({ length: 22 }, (_, k) => ({ family: `A${k + 1}`, given: "B" })) };
    const s = plain(new CitationEngine("apa7", [many], { locale: "en" }).entry(many));
    expect(s.startsWith("A1, B., A2, B.")).toBe(true);
    expect(s).toContain("A19, B., . . . A22, B.");
    expect(s).not.toContain("A20");
  });
});

describe("APA 6", () => {
  it("lists all 3–5 authors on first citation", () => {
    const e = new CitationEngine("apa6", [article], { locale: "en" });
    expect(plain(e.cite(["a1"], {}, true))).toBe("(Doron, Derby, & Szepsenwol, 2014)");
    expect(plain(e.cite(["a1"], {}, false))).toBe("(Doron et al., 2014)");
  });
  it("includes place of publication for books", () => {
    const e = new CitationEngine("apa6", [book], { locale: "en" });
    expect(plain(e.entry(book))).toBe("Bowlby, J. (1969). Attachment and loss. New York: Basic Books.");
  });
});

describe("numeric styles", () => {
  it("numbers by first citation order (Vancouver)", () => {
    const e = new CitationEngine("vancouver", [article, book, single], { locale: "en", citedOrder: ["s1", "a1", "b1"] });
    expect(plain(e.cite(["a1"]))).toBe("[2]");
    expect(plain(e.cite(["b1", "s1", "a1"]))).toBe("[1–3]");
    const bib = e.bibliography();
    expect(bib.map((b) => b.id)).toEqual(["s1", "a1", "b1"]);
    expect(plain(bib[1].rich)).toBe(
      "Doron G, Derby DS, Szepsenwol O. Relationship obsessive compulsive disorder: A review. Journal of Obsessive-Compulsive and Related Disorders. 2014;3(2):169-180. doi:10.1016/j.jocrd.2013.12.005",
    );
  });
  it("formats IEEE", () => {
    const e = new CitationEngine("ieee", [article], { locale: "en", citedOrder: ["a1"] });
    expect(plain(e.cite(["a1"]))).toBe("[1]");
    expect(plain(e.entry(article))).toBe(
      "G. Doron, D. S. Derby, and O. Szepsenwol, “Relationship obsessive compulsive disorder: A review,” Journal of Obsessive-Compulsive and Related Disorders, vol. 3, no. 2, pp. 169–180, 2014, doi: 10.1016/j.jocrd.2013.12.005.",
    );
  });
  it("uses superscript for AMA", () => {
    const e = new CitationEngine("ama", [article], { locale: "en", citedOrder: ["a1"] });
    const r = e.cite(["a1"]);
    expect(r[0].sup).toBe(true);
    expect(r[0].text).toBe("1");
  });
});

describe("other author-date styles", () => {
  it("formats Chicago author-date", () => {
    const e = new CitationEngine("chicago", [single], { locale: "en" });
    expect(plain(e.entry(single))).toBe("Baumrind, Diana. 1991. “Parenting styles.” Journal of Early Adolescence 11 (1): 56–95.");
    expect(plain(e.cite(["s1"], { locator: "60" }))).toBe("(Baumrind 1991, 60)");
  });
  it("formats Harvard", () => {
    const e = new CitationEngine("harvard", [single], { locale: "en" });
    expect(plain(e.entry(single))).toBe("Baumrind, D. (1991) ‘Parenting styles’, Journal of Early Adolescence, 11(1), pp. 56–95.");
    expect(plain(e.cite(["s1"], { locator: "60" }))).toBe("(Baumrind, 1991, p. 60)");
  });
  it("formats MLA", () => {
    const e = new CitationEngine("mla", [article, single], { locale: "en" });
    expect(plain(e.entry(article))).toBe(
      "Doron, Guy, et al. “Relationship obsessive compulsive disorder: A review.” Journal of Obsessive-Compulsive and Related Disorders, vol. 3, no. 2, 2014, pp. 169–180, https://doi.org/10.1016/j.jocrd.2013.12.005.",
    );
    expect(plain(e.cite(["s1"], { locator: "60" }))).toBe("(Baumrind 60)");
  });
});

describe("checks", () => {
  it("detects missing fields", () => {
    expect(missingFields({ ...single, volume: null, pages: "" })).toEqual(["volume", "pages", "doi"]);
  });
  it("detects duplicates by DOI and title", () => {
    const dupDoi = { ...article, id: "a2", doi: "https://doi.org/10.1016/J.JOCRD.2013.12.005" };
    const dupTitle = { ...single, id: "s2", title: "Parenting Styles." };
    const groups = findDuplicates([article, dupDoi, single, dupTitle, book]);
    expect(groups).toEqual([
      { ids: ["a1", "a2"], reason: "doi" },
      { ids: ["s1", "s2"], reason: "title" },
    ]);
  });
  it("checks citation / bibliography consistency", () => {
    const r = checkConsistency({
      citedIds: ["a1", "deleted"],
      sources: [article, single],
      plainText: "Bu bulgu önceki çalışmalarla uyumludur (Doron vd., 2014). Ancak Yılmaz (2019) farklı sonuçlar bildirmiştir (Kaya & Demir, 2020).",
    });
    expect(r.danglingCitations).toEqual(["deleted"]);
    expect(r.uncitedSources).toEqual(["s1"]);
    expect(r.unmatchedManualCitations).toEqual(["Yılmaz (2019)", "(Kaya & Demir, 2020)"]);
  });
});
