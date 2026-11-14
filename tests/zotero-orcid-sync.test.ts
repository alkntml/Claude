/**
 * D192 — Zotero ve ORCID eşitlemesi: ORCID numarası doğrulaması, ORCID kaydı → CSL-JSON, Zotero sürüm takibi,
 * anahtar şifreleme. (Bulut oturumunda ORCID/Zotero’ya erişim yok: örnek yanıtlarla.)
 */
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
process.env.INTEGRATION_SECRET = "test-secret-for-vitest";
import { normalizeOrcid, workToCsl } from "@/lib/sources/orcid";
import { zoteroItemsUrl } from "@/lib/sources/zotero";
import { parseReferences } from "@/lib/sources/bib";
import { SourceInput } from "@/lib/sources/input";

describe("ORCID (D192)", () => {
  it("numara biçimi ve sağlama basamağı", () => {
    expect(normalizeOrcid("0000-0002-1825-0097")).toBe("0000-0002-1825-0097");
    expect(normalizeOrcid("https://orcid.org/0000-0002-1825-0097")).toBe("0000-0002-1825-0097");
    expect(normalizeOrcid("0000000218250097")).toBe("0000-0002-1825-0097");
    expect(normalizeOrcid("0000-0002-1694-233X")).toBe("0000-0002-1694-233X");
    expect(normalizeOrcid("0000-0002-1825-0098")).toBeNull();
    expect(normalizeOrcid("abc")).toBeNull();
  });

  const work = {
    "put-code": 1, type: "journal-article",
    title: { title: { value: "Sosyal medya ve akademik erteleme" } },
    "journal-title": { value: "Eğitim Araştırmaları Dergisi" },
    "publication-date": { year: { value: "2021" } },
    "external-ids": { "external-id": [{ "external-id-type": "doi", "external-id-value": "https://doi.org/10.1234/ornek.2021.5" }] },
    contributors: { contributor: [{ "credit-name": { value: "Elif Kaya" }, "contributor-attributes": { "contributor-role": "author" } }, { "credit-name": { value: "Demir, Ali" } }] },
  };

  it("ORCID kaydı → CSL-JSON; yazarlar, yıl, dergi, DOI", () => {
    const c = workToCsl(work, null)!;
    expect(c).toMatchObject({ type: "article-journal", title: "Sosyal medya ve akademik erteleme", "container-title": "Eğitim Araştırmaları Dergisi", DOI: "10.1234/ornek.2021.5", issued: { "date-parts": [[2021]] } });
    expect(c.author).toEqual([{ family: "Kaya", given: "Elif" }, { family: "Demir", given: "Ali" }]);
  });

  it("yazar listesi yoksa ORCID sahibi yazar olarak yazılır; başlıksız kayıt atlanır", () => {
    const c = workToCsl({ ...work, contributors: undefined }, { family: "Yılmaz", given: "Burak" })!;
    expect(c.author).toEqual([{ family: "Yılmaz", given: "Burak" }]);
    expect(workToCsl({ type: "book" }, null)).toBeNull();
  });

  it("CSL-JSON çıktısı içe aktarma hattından geçer", () => {
    const parsed = parseReferences(JSON.stringify([workToCsl(work, null)]), "csljson");
    expect(parsed.refs.length).toBe(1);
    const ok = SourceInput.safeParse({ ...parsed.refs[0], origins: ["orcid"] });
    expect(ok.success).toBe(true);
    if (ok.success) { expect(ok.data.doi).toBe("10.1234/ornek.2021.5"); expect(ok.data.year).toBe(2021); }
  });
});

describe("Zotero eşitlemesi (D192)", () => {
  it("sonraki eşitlemede yalnızca son sürümden sonra değişen öğeler istenir", () => {
    const z = { library: "user" as const, libraryId: "12345", apiKey: "x", collection: null };
    expect(zoteroItemsUrl(z, 0)).not.toContain("since=");
    expect(zoteroItemsUrl(z, 100, 4321)).toContain("&since=4321");
    expect(zoteroItemsUrl({ ...z, library: "group", collection: "ABCD2345" }, 0, 7)).toContain("/groups/12345/collections/ABCD2345/items/top");
  });

  it("anahtar şifrelenir ve çözülür; bozuk kayıt null döner; düz metin saklanmaz", async () => {
    const { seal, open } = await import("@/lib/secret-box");
    const s = seal("P9xZoteroKey123");
    expect(s.startsWith("v1:")).toBe(true);
    expect(s).not.toContain("P9xZoteroKey123");
    expect(open(s)).toBe("P9xZoteroKey123");
    expect(seal("P9xZoteroKey123")).not.toBe(s); // her seferinde farklı başlangıç vektörü
    expect(open(s.replace(/.$/, (c) => (c === "A" ? "B" : "A")))).toBeNull();
    expect(open(null)).toBeNull();
  });
});
