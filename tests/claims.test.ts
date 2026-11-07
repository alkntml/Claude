import { describe, expect, it } from "vitest";
import { bestVerdict, extractClaims, summarize } from "@/lib/claims";
import type { JSONNode } from "@/lib/editor/doc";

const cite = (id: string, locator: string | null = null): JSONNode => ({ type: "citation", attrs: { ids: [id], locator } });
const p = (...c: (string | JSONNode)[]): JSONNode => ({ type: "paragraph", content: c.map((x) => (typeof x === "string" ? { type: "text", text: x } : x)) });
const doc = (...b: JSONNode[]): JSONNode => ({ type: "doc", content: b });

describe("iddia çıkarımı (D119)", () => {
  it("atıflı cümleleri atıflarıyla, atıfsız kesin iddiaları ve [KAYNAK GEREKLİ] işaretlerini bulur", () => {
    const d = doc(
      p("Bağlanma kuramı erken ilişkilerin önemini vurgular ", cite("A", "12"), ". Bu çalışma üç bölümden oluşur. Araştırmalar kaygının başarıyı düşürdüğünü göstermektedir. Katılımcıların %45’i kadındır."),
      p("Romantik ilişkilerde de benzer süreçler işler ", cite("B"), cite("C"), ". Bu konu tartışmalıdır [KAYNAK GEREKLİ]."),
    );
    const c = extractClaims(d);
    expect(c.map((x) => x.kind)).toEqual(["cited", "uncited", "uncited", "cited", "marked"]);
    expect(c[0].citations).toEqual([{ ids: ["A"], locator: "12" }]);
    expect(c[0].text).toBe("Bağlanma kuramı erken ilişkilerin önemini vurgular.");
    expect(c[3].citations.map((x) => x.ids[0])).toEqual(["B", "C"]);
  });
  it("kısaltmada (vd., ör.) bölmez; cümle başına kayan atıfı önceki cümleye verir", () => {
    const c = extractClaims(doc(p("Kaya vd. bu ilişkiyi ör. lise öğrencilerinde incelemiştir.", cite("K"), " Sonraki cümle burada ve oldukça uzundur.")));
    expect(c).toHaveLength(1);
    expect(c[0].text).toBe("Kaya vd. bu ilişkiyi ör. lise öğrencilerinde incelemiştir.");
    expect(c[0].citations[0].ids).toEqual(["K"]);
  });
  it("tablo hücreleri denetlenmez; aynı cümle iki kez sayılmaz; en güçlü sonuç esas alınır", () => {
    const table: JSONNode = { type: "table", content: [{ type: "tableRow", content: [{ type: "tableCell", content: [p("Değer %45 oldu.")] }] }] };
    expect(extractClaims(doc(table))).toHaveLength(0);
    expect(bestVerdict(["not_supported", "partial"])).toBe("partial");
    expect(summarize([{ kind: "cited", verdict: "supports" }, { kind: "cited" }, { kind: "uncited" }])).toMatchObject({ total: 3, supports: 1, pending: 1, uncited: 1 });
  });
});

describe("guardVerdict (çelişki ancak doğrulanmış alıntıyla)", () => {
  it("alıntısı kaynakta bulunmayan çelişki kararını desteklenmiyor’a düşürür", async () => {
    const { guardVerdict } = await import("@/lib/claim-audit");
    expect(guardVerdict("contradicts", false)).toBe("not_supported");
    expect(guardVerdict("contradicts", true)).toBe("contradicts");
    expect(guardVerdict("partial", false)).toBe("partial");
  });
});
