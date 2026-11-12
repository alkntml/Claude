import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { mergeCsl, zoteroItemsUrl } from "@/lib/sources/zotero";
import { parseReferences } from "@/lib/sources/bib";

describe("Zotero içe aktarma (D149)", () => {
  it("kullanıcı, grup ve koleksiyon adresleri", () => {
    expect(zoteroItemsUrl({ library: "user", libraryId: "123", apiKey: "x" }, 0)).toContain("/users/123/items/top?format=csljson&limit=100&start=0");
    expect(zoteroItemsUrl({ library: "group", libraryId: "9", apiKey: "x", collection: "ABCD2345" }, 100)).toContain("/groups/9/collections/ABCD2345/items/top?format=csljson&limit=100&start=100");
  });
  it("sayfalar birleşir ve CSL-JSON olarak okunur", () => {
    const page = { items: [{ type: "article-journal", title: "Bağlanma ve ilişki", author: [{ family: "Kaya", given: "Elif" }], issued: { "date-parts": [[2021]] }, DOI: "10.1000/xyz" }] };
    const text = mergeCsl([page, [{ type: "book", title: "Attachment", author: [{ family: "Bowlby", given: "John" }], issued: { "date-parts": [[1969]] } }]]);
    const { format, refs } = parseReferences(text, "csljson");
    expect(format).toBe("csljson");
    expect(refs.map((r) => r.title)).toEqual(["Bağlanma ve ilişki", "Attachment"]);
  });
});
