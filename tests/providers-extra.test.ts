import { afterEach, describe, expect, it, vi } from "vitest";
import { parseDatacite, parseDblp, parseEric } from "@/lib/sources/providers";
import { getJsonRetry } from "@/lib/sources/http";

// Örnek yanıtlar ilgili API'lerin belgelenmiş yanıt şemalarına göre hazırlanmıştır (D92).
describe("ERIC", () => {
  it("kaydı, DOI'yi ve açık erişim PDF'ini okur", () => {
    const [r] = parseEric({ response: { docs: [{
      id: "EJ1234567", title: "Teacher Self-Efficacy and Student Engagement", author: ["Smith, John A.", "Yılmaz, Ayşe"],
      publicationdateyear: 2020, description: "This study examines...", source: "Journal of Educational Psychology, v112 n3 p500-512 2020",
      url: "https://doi.org/10.1037/edu0000400", e_fulltextauth: 1, publicationtype: ["Journal Articles", "Reports - Research"],
    }] } });
    expect(r.title).toBe("Teacher Self-Efficacy and Student Engagement");
    expect(r.authors[0].family).toBe("Smith");
    expect(r.authors[1].family).toBe("Yılmaz");
    expect(r.year).toBe(2020);
    expect(r.containerTitle).toBe("Journal of Educational Psychology");
    expect(r.doi).toBe("10.1037/edu0000400");
    expect(r.oaUrl).toBe("https://files.eric.ed.gov/fulltext/EJ1234567.pdf");
    expect(r.type).toBe("article-journal");
  });
  it("tezi tanır; tam metin yoksa PDF bağlantısı vermez", () => {
    const [r] = parseEric({ response: { docs: [{ id: "ED600000", title: "A Dissertation", author: "Doe, Jane", publicationdateyear: "2019", publicationtype: ["Dissertations/Theses - Doctoral Dissertations"] }] } });
    expect(r.type).toBe("thesis");
    expect(r.oaUrl ?? null).toBeNull();
    expect(r.year).toBe(2019);
  });
  it("boş yanıtta boş liste", () => expect(parseEric({})).toEqual([]));
});

describe("DBLP", () => {
  it("yazar ayırt etme numarasını atar, künyeyi okur", () => {
    const [r] = parseDblp({ result: { hits: { hit: [{ info: {
      authors: { author: [{ text: "Ada Lovelace 0001" }, { text: "Alan Turing" }] }, title: "Computing Machinery and Intelligence.",
      venue: "Mind", volume: "59", number: "236", pages: "433-460", year: "1950", type: "Journal Articles", doi: "10.1093/mind/LIX.236.433",
      ee: "https://doi.org/10.1093/mind/LIX.236.433",
    } }] } } });
    expect(r.authors.map((a) => a.family)).toEqual(["Lovelace", "Turing"]);
    expect(r.year).toBe(1950);
    expect(r.containerTitle).toBe("Mind");
    expect(r.volume).toBe("59");
    expect(r.issue).toBe("236");
    expect(r.doi?.toLowerCase()).toBe("10.1093/mind/lix.236.433");
    expect(r.type).toBe("article-journal");
  });
  it("tek yazar nesnesi ve konferans bildirisi", () => {
    const [r] = parseDblp({ result: { hits: { hit: [{ info: { authors: { author: { text: "Grace Hopper" } }, title: "Compilers", venue: "ACM Conference", year: "1952", type: "Conference and Workshop Papers" } }] } } });
    expect(r.authors[0].family).toBe("Hopper");
    expect(r.type).toBe("paper-conference");
  });
  it("sonuç yoksa boş liste", () => expect(parseDblp({ result: { hits: {} } })).toEqual([]));
});

describe("DataCite", () => {
  it("tez türünü, yazarları ve özeti okur", () => {
    const [r] = parseDatacite({ data: [{ id: "10.5281/zenodo.1", attributes: {
      doi: "10.5281/zenodo.1", titles: [{ title: "Öğretmen Öz Yeterliği Üzerine Bir Doktora Tezi" }],
      creators: [{ name: "Kaya, Mehmet", familyName: "Kaya", givenName: "Mehmet" }, { name: "Ankara Üniversitesi", nameType: "Organizational" }],
      publicationYear: 2019, publisher: "Zenodo", types: { resourceTypeGeneral: "Dissertation" },
      descriptions: [{ descriptionType: "Abstract", description: "Bu çalışma..." }], url: "https://zenodo.org/record/1",
    } }] });
    expect(r.type).toBe("thesis");
    expect(r.authors[0]).toMatchObject({ family: "Kaya", given: "Mehmet" });
    expect(r.authors[1].literal).toBe("Ankara Üniversitesi");
    expect(r.year).toBe(2019);
    expect(r.publisher).toBe("Zenodo");
    expect(r.doi).toBe("10.5281/zenodo.1");
    expect(r.abstract).toBe("Bu çalışma...");
  });
  it("başlıksız kayıtları atar", () => {
    expect(parseDatacite({ data: [{ id: "x", attributes: { titles: [] } }] })).toEqual([]);
  });
});

describe("getJsonRetry", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("429 sonrası yeniden dener ve başarılı yanıtı döndürür", async () => {
    let calls = 0;
    vi.stubGlobal("fetch", vi.fn(async () => {
      calls++;
      return calls === 1
        ? new Response("", { status: 429, headers: { "Retry-After": "0" } })
        : new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }));
    const r = await getJsonRetry<{ ok: boolean }>("https://api.example.org/x", { signal: new AbortController().signal }, { retries: 2, baseDelayMs: 1 });
    expect(r.ok).toBe(true);
    expect(calls).toBe(2);
  });
  it("404 gibi kalıcı hatada yeniden denemez", async () => {
    const f = vi.fn(async () => new Response("", { status: 404 }));
    vi.stubGlobal("fetch", f);
    await expect(getJsonRetry("https://api.example.org/x", { signal: new AbortController().signal }, { retries: 2, baseDelayMs: 1 })).rejects.toThrow();
    expect(f).toHaveBeenCalledTimes(1);
  });
});
