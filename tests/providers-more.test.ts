import { describe, expect, it } from "vitest";
import { parseAds, parseHal, parseIeee, parseInspire, parseOpenLibrary, parsePlos, parseSpringer, parseZenodo, PROVIDERS, solrEscape } from "@/lib/sources/providers";
import { searchAll } from "@/lib/sources/aggregate";
import { readFileSync } from "node:fs";
import path from "node:path";

// Örnek yanıtlar ilgili API'lerin belgelenmiş yanıt şemalarına göre hazırlanmıştır (D129).
// Canlı yanıt biçimi bulut oturumunda denenemez; ayrıştırıcılar eksik alanlarda boş liste/null döndürür.

describe("PLOS", () => {
  it("DOI, yazar, dergi, yıl ve özeti okur; açık erişim bağlantısı verir", () => {
    const [r] = parsePlos({ response: { docs: [{
      id: "10.1371/journal.pone.0123456", title_display: "Self-regulation in <i>online</i> learning", author_display: ["Ayşe Yılmaz", "John Smith"],
      journal: "PLOS ONE", publication_date: "2021-03-15T00:00:00Z", abstract: ["  Background: we examined self-regulation in online courses and its link to achievement.  "], volume: 16, issue: 3,
    }] } });
    expect(r.title).toBe("Self-regulation in online learning");
    expect(r.authors[0]).toEqual({ given: "Ayşe", family: "Yılmaz" });
    expect(r.year).toBe(2021);
    expect(r.month).toBe(3);
    expect(r.doi).toBe("10.1371/journal.pone.0123456");
    expect(r.oaUrl).toBe("https://doi.org/10.1371/journal.pone.0123456");
    expect(r.containerTitle).toBe("PLOS ONE");
    expect(r.volume).toBe("16");
    expect(r.accessLevel).toBe("abstract");
    expect(r.origins).toEqual(["plos"]);
  });
  it("boş yanıtta boş liste", () => expect(parsePlos({})).toEqual([]));
});

describe("Zenodo", () => {
  it("yayın türünü, açık erişimi ve dergi bilgisini okur; yayın olmayan kayıtları atar", () => {
    const out = parseZenodo({ hits: { hits: [
      { id: 101, doi: "10.5281/zenodo.101", links: { self_html: "https://zenodo.org/records/101" }, metadata: {
        title: "Uzaktan eğitimde öz düzenleme", creators: [{ name: "Kaya, Elif" }], publication_date: "2020-06-01",
        description: "<p>Bu çalışma öz düzenleme becerilerini inceler ve başarıyla ilişkisini raporlar.</p>", resource_type: { type: "publication", subtype: "thesis" },
        access_right: "open", license: { id: "cc-by-4.0" }, language: "tur" } },
      { id: 102, metadata: { title: "Bir veri seti", resource_type: { type: "dataset" } } },
      { id: 103, metadata: { title: "Kapalı makale", creators: [{ name: "Doe, Jane" }], publication_date: "2019", resource_type: { type: "publication", subtype: "article" }, access_right: "restricted", journal: { title: "J. Test", volume: "4", issue: "2", pages: "10-20" } } },
    ] } });
    expect(out).toHaveLength(2);
    expect(out[0].type).toBe("thesis");
    expect(out[0].authors[0]).toEqual({ family: "Kaya", given: "Elif" });
    expect(out[0].oaUrl).toBe("https://zenodo.org/records/101");
    expect(out[0].abstract).not.toContain("<p>");
    expect(out[1].type).toBe("article-journal");
    expect(out[1].oaUrl ?? null).toBeNull();
    expect(out[1].containerTitle).toBe("J. Test");
    expect(out[1].pages).toBe("10-20");
    expect(out[1].url).toBe("https://zenodo.org/records/103");
  });
});

describe("HAL", () => {
  it("belge türünü, dosya bağlantısını ve dizi alanlarını okur", () => {
    const [a, b] = parseHal({ response: { docs: [
      { title_s: ["Apprentissage autorégulé"], authFullName_s: ["Marie Curie"], producedDateY_i: 2018, doiId_s: "10.1000/hal1", uri_s: "https://hal.science/hal-001", files_s: ["https://hal.science/hal-001/document"], docType_s: "THESE", abstract_s: ["Cette thèse étudie l’apprentissage autorégulé chez les étudiants universitaires."], language_s: ["fr"] },
      { title_s: ["Conference talk"], authFullName_s: ["A. B. Cee"], producedDateY_i: 2022, docType_s: "COMM", conferenceTitle_s: "ICLR" },
    ] } });
    expect(a.type).toBe("thesis");
    expect(a.oaUrl).toBe("https://hal.science/hal-001/document");
    expect(a.language).toBe("fr");
    expect(a.accessLevel).toBe("abstract");
    expect(b.type).toBe("paper-conference");
    expect(b.containerTitle).toBe("ICLR");
    expect(b.oaUrl ?? null).toBeNull();
  });
});

describe("Open Library", () => {
  it("kitap künyesini, ISBN'i ve okunabilir e-kitabı okur", () => {
    const [r] = parseOpenLibrary({ docs: [{ key: "/works/OL1W", title: "Self-Regulated Learning", subtitle: "Theory and Practice", author_name: ["Barry J. Zimmerman"], first_publish_year: 1998, publisher: ["Guilford"], isbn: ["9781572303065"], ebook_access: "public" }] });
    expect(r.type).toBe("book");
    expect(r.title).toBe("Self-Regulated Learning: Theory and Practice");
    expect(r.isbn).toBe("9781572303065");
    expect(r.publisher).toBe("Guilford");
    expect(r.oaUrl).toBe("https://openlibrary.org/works/OL1W");
    expect(r.accessLevel).toBe("metadata");
  });
  it("e-kitap yoksa bağlantı vermez", () => {
    const [r] = parseOpenLibrary({ docs: [{ key: "/works/OL2W", title: "Book", ebook_access: "no_ebook" }] });
    expect(r.oaUrl ?? null).toBeNull();
  });
});

describe("INSPIRE-HEP", () => {
  it("dergi bilgisi, arXiv ve atıf sayısını okur", () => {
    const [r] = parseInspire({ hits: { hits: [{ id: 12345, metadata: {
      titles: [{ title: "Dark matter constraints" }], authors: [{ full_name: "Smith, John" }], abstracts: [{ value: "We present new constraints on dark matter from observations." }],
      dois: [{ value: "10.1103/PhysRevD.1.1" }], arxiv_eprints: [{ value: "2101.00001" }], publication_info: [{ journal_title: "Phys.Rev.D", journal_volume: "103", year: 2021, page_start: "1", page_end: "12" }],
      document_type: ["article"], citation_count: 42,
    } }] } });
    expect(r.type).toBe("article-journal");
    expect(r.authors[0]).toEqual({ family: "Smith", given: "John" });
    expect(r.year).toBe(2021);
    expect(r.pages).toBe("1-12");
    expect(r.arxivId).toBe("2101.00001");
    expect(r.oaUrl).toBe("https://arxiv.org/abs/2101.00001");
    expect(r.citedByCount).toBe(42);
    expect(r.url).toBe("https://inspirehep.net/literature/12345");
  });
});

describe("Anahtarlı kaynaklar (NASA ADS, Springer Nature, IEEE Xplore)", () => {
  it("ADS: başlık dizisi, DOI dizisi ve arXiv kimliği", () => {
    const [r] = parseAds({ response: { docs: [{ title: ["Exoplanet atmospheres"], author: ["Doe, J.", "Roe, R."], year: "2020", doi: ["10.3847/1538-3881/ab0000"], pub: "The Astronomical Journal", bibcode: "2020AJ....159...10D", identifier: ["arXiv:2001.00001"], doctype: "article", citation_count: 7 }] } });
    expect(r.title).toBe("Exoplanet atmospheres");
    expect(r.doi).toBe("10.3847/1538-3881/ab0000");
    expect(r.arxivId).toBe("2001.00001");
    expect(r.url).toContain("ui.adsabs.harvard.edu/abs/2020AJ");
    expect(r.type).toBe("article-journal");
  });
  it("Springer: yazar, açık erişim ve nesne biçimli özet", () => {
    const [r] = parseSpringer({ records: [{ title: "Learning analytics", creators: [{ creator: "Yılmaz, Ayşe" }], publicationName: "Education and Information Technologies", publicationDate: "2022-01-10", doi: "10.1007/s10639-022-00001-1", abstract: { h1: "Abstract", p: "This paper reviews learning analytics research in higher education settings." }, startingPage: "100", endingPage: "120", openaccess: "true", contentType: "Article", url: [{ format: "html", value: "https://link.springer.com/article/10.1007/s10639-022-00001-1" }] }] });
    expect(r.authors[0]).toEqual({ family: "Yılmaz", given: "Ayşe" });
    expect(r.abstract).toContain("learning analytics");
    expect(r.pages).toBe("100-120");
    expect(r.oaUrl).toBe("https://link.springer.com/article/10.1007/s10639-022-00001-1");
  });
  it("IEEE: bildiri türü ve kapalı erişim", () => {
    const [r] = parseIeee({ articles: [{ title: "A CNN for X", authors: { authors: [{ full_name: "Li Wei" }] }, publication_year: 2023, doi: "10.1109/CVPR.2023.1", publication_title: "CVPR", content_type: "Conferences", access_type: "LOCKED", html_url: "https://ieeexplore.ieee.org/document/1", abstract: "We propose a convolutional network for image recognition tasks." }] });
    expect(r.type).toBe("paper-conference");
    expect(r.oaUrl ?? null).toBeNull();
    expect(r.url).toBe("https://ieeexplore.ieee.org/document/1");
  });
  it("anahtar yoksa arama sessizce atlanır, hata olarak listelenmez", async () => {
    const res = await searchAll({ query: "test" }, ["ads", "springer", "ieee"], {});
    expect(res.results).toEqual([]);
    expect(res.providers).toEqual([]);
    expect(PROVIDERS.ads.unavailableReason?.({ adsKey: "x" })).toBeNull();
  });
});

describe("solrEscape", () => {
  it("sorgu sözdizimi karakterlerini etkisizleştirir", () => {
    expect(solrEscape('öz-düzenleme (online) "learning": AND/OR')).toBe("öz düzenleme online learning AND OR");
  });
});

it("varsayılan ayarlarda yeni kaynaklar açık", () => {
  const src = readFileSync(path.resolve(__dirname, "../src/lib/settings.ts"), "utf8");
  for (const k of ["plos", "zenodo", "hal", "openlibrary", "inspire", "ads", "springer", "ieee"]) expect(src).toMatch(new RegExp(`\\b${k}: true`));
});
