import { describe, expect, it } from "vitest";
import {
  invertedIndexToText, parseArxiv, parseCrossref, parseDoaj, parseEuropePmc, parseGoogleBooks, parseOpenAlex,
  parseUnpaywall, splitName,
} from "@/lib/sources/providers";
import { dedupe, scoreRecord } from "@/lib/sources/aggregate";
import { isSafePublicUrl } from "@/lib/sources/http";

// Örnek yanıtlar, ilgili API'lerin belgelenmiş yanıt şemalarına göre hazırlanmıştır.
const openalexFixture = {
  results: [
    {
      id: "https://openalex.org/W2000000001",
      doi: "https://doi.org/10.1016/J.JOCRD.2013.12.005",
      display_name: "Relationship obsessive compulsive disorder (ROCD): A conceptual framework",
      publication_year: 2014,
      publication_date: "2014-04-01",
      type: "article",
      authorships: [{ author: { display_name: "Guy Doron" } }, { author: { display_name: "Danny S. Derby" } }],
      primary_location: { landing_page_url: "https://doi.org/10.1016/j.jocrd.2013.12.005", source: { display_name: "Journal of Obsessive-Compulsive and Related Disorders", host_organization_name: "Elsevier" } },
      biblio: { volume: "3", issue: "2", first_page: "169", last_page: "180" },
      abstract_inverted_index: { Relationship: [0], obsessive: [1], compulsive: [2], disorder: [3], is: [4], examined: [5], "in": [6], this: [7], conceptual: [8], review: [9] },
      open_access: { is_oa: false, oa_url: null },
      best_oa_location: null,
      ids: { pmid: "https://pubmed.ncbi.nlm.nih.gov/12345678" },
      cited_by_count: 210,
      language: "en",
    },
  ],
};

const crossrefFixture = {
  message: {
    items: [
      {
        DOI: "10.1016/j.jocrd.2013.12.005",
        type: "journal-article",
        title: ["Relationship obsessive compulsive disorder (ROCD): A conceptual framework"],
        author: [{ given: "Guy", family: "Doron" }, { given: "Danny S.", family: "Derby" }],
        issued: { "date-parts": [[2014, 4]] },
        "container-title": ["Journal of Obsessive-Compulsive and Related Disorders"],
        volume: "3", issue: "2", page: "169-180", publisher: "Elsevier BV",
        URL: "http://dx.doi.org/10.1016/j.jocrd.2013.12.005",
        "is-referenced-by-count": 230,
      },
    ],
  },
};

describe("provider parsers", () => {
  it("splits names", () => {
    expect(splitName("Ayşe Nur Yılmaz")).toEqual({ given: "Ayşe Nur", family: "Yılmaz" });
    expect(splitName("Ludwig van Beethoven")).toEqual({ given: "Ludwig", family: "van Beethoven" });
    expect(splitName("Yılmaz, Ayşe")).toEqual({ family: "Yılmaz", given: "Ayşe" });
  });

  it("parses OpenAlex works incl. inverted abstract", () => {
    const [r] = parseOpenAlex(openalexFixture);
    expect(r.doi).toBe("10.1016/j.jocrd.2013.12.005");
    expect(r.pmid).toBe("12345678");
    expect(r.pages).toBe("169-180");
    expect(r.authors[0]).toEqual({ given: "Guy", family: "Doron" });
    expect(r.abstract).toBe("Relationship obsessive compulsive disorder is examined in this conceptual review");
    expect(r.accessLevel).toBe("abstract");
    expect(invertedIndexToText(null)).toBeNull();
  });

  it("parses Crossref and marks metadata-only access when no abstract", () => {
    const [r] = parseCrossref(crossrefFixture);
    expect(r.year).toBe(2014);
    expect(r.month).toBe(4);
    expect(r.accessLevel).toBe("metadata");
  });

  it("parses Europe PMC", () => {
    const [r] = parseEuropePmc({ resultList: { result: [{ pmid: "111", pmcid: "PMC9", doi: "10.2000/x", title: "Title.", authorList: { author: [{ lastName: "Kaya", firstName: "Ali" }] }, pubYear: "2019", journalInfo: { volume: "2", issue: "1", journal: { title: "BMC Psychiatry" } }, pageInfo: "10-20", abstractText: "<h4>Background</h4>Some abstract text that is long enough to count.", isOpenAccess: "Y" }] } });
    expect(r.title).toBe("Title");
    expect(r.abstract).toBe("Background Some abstract text that is long enough to count.");
    expect(r.oaUrl).toBe("https://europepmc.org/article/PMC/PMC9");
    expect(r.url).toBe("https://pubmed.ncbi.nlm.nih.gov/111/");
  });

  it("parses arXiv Atom", () => {
    const xml = `<feed><entry><id>http://arxiv.org/abs/2101.00001v2</id><published>2021-01-04T00:00:00Z</published><title>Deep
 learning for X</title><summary>We study X with deep learning methods in detail.</summary><author><name>Ana Lima</name></author><link title="pdf" href="http://arxiv.org/pdf/2101.00001v2" rel="related"/></entry></feed>`;
    const [r] = parseArxiv(xml);
    expect(r).toMatchObject({ arxivId: "2101.00001", title: "Deep learning for X", year: 2021, type: "preprint", doi: "10.48550/arxiv.2101.00001", oaUrl: "http://arxiv.org/pdf/2101.00001v2" });
  });

  it("parses DOAJ", () => {
    const [r] = parseDoaj({ results: [{ bibjson: { title: "Open study", year: "2022", author: [{ name: "Mehmet Demir" }], journal: { title: "OA Journal", volume: "4", number: "2" }, start_page: "5", end_page: "9", identifier: [{ type: "doi", id: "10.3000/oa" }], link: [{ type: "fulltext", url: "https://oa.org/x" }] } }] });
    expect(r).toMatchObject({ doi: "10.3000/oa", pages: "5-9", oaUrl: "https://oa.org/x", accessLevel: "metadata" });
  });

  it("never treats Google Books descriptions as abstracts", () => {
    const [r] = parseGoogleBooks({ items: [{ volumeInfo: { title: "Attachment", subtitle: "Vol 1", authors: ["John Bowlby"], publishedDate: "1969", description: "Marketing blurb ".repeat(10), industryIdentifiers: [{ type: "ISBN_13", identifier: "9780465005437" }] } }] });
    expect(r).toMatchObject({ type: "book", title: "Attachment: Vol 1", isbn: "9780465005437", abstract: null, accessLevel: "metadata" });
  });

  it("parses Unpaywall", () => {
    expect(parseUnpaywall({ is_oa: true, best_oa_location: { url_for_pdf: "https://a/b.pdf", url: "https://a/b", license: "cc-by" } })).toEqual({ isOa: true, pdfUrl: "https://a/b.pdf", landingUrl: "https://a/b", license: "cc-by" });
  });
});

describe("aggregation", () => {
  it("merges duplicates across providers by DOI and keeps richest fields", () => {
    const merged = dedupe([...parseCrossref(crossrefFixture), ...parseOpenAlex(openalexFixture)]);
    expect(merged).toHaveLength(1);
    expect(merged[0].origins.sort()).toEqual(["crossref", "openalex"]);
    expect(merged[0].abstract).toBeTruthy();
    expect(merged[0].accessLevel).toBe("abstract");
    expect(merged[0].citedByCount).toBe(230);
  });
  it("scores title matches above unrelated records", () => {
    const [rel] = parseOpenAlex(openalexFixture);
    const other = { ...rel, title: "Soil microbiology of wheat", abstract: "", citedByCount: 0 };
    expect(scoreRecord(rel, "relationship obsessive compulsive")).toBeGreaterThan(scoreRecord(other, "relationship obsessive compulsive"));
  });
  it("blocks private URLs", () => {
    expect(isSafePublicUrl("https://arxiv.org/pdf/1")).toBe(true);
    expect(isSafePublicUrl("http://127.0.0.1/x")).toBe(false);
    expect(isSafePublicUrl("http://192.168.1.2/x")).toBe(false);
    expect(isSafePublicUrl("file:///etc/passwd")).toBe(false);
    expect(isSafePublicUrl("http://localhost:3000")).toBe(false);
  });
});
