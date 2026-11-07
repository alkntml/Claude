import { describe, expect, it } from "vitest";
import { buildChecklist } from "@/lib/quality/checklist";
import type { JSONNode } from "@/lib/editor/doc";

const doc = (...parts: (string | JSONNode)[]): JSONNode => ({ type: "doc", content: [{ type: "paragraph", content: parts.map((x) => (typeof x === "string" ? { type: "text", text: x } : x)) }] });
const cite = (id: string): JSONNode => ({ type: "citation", attrs: { ids: [id] } });

describe("teslim öncesi kontrol listesi (D121)", () => {
  it("boş bölüm, işaretler, denetlenmemiş atıf, doğrulanmamış ve atıfsız kaynakları yakalar", () => {
    const items = buildChecklist({
      workType: "research_article", keywords: ["a"], hasFormat: false, qualityScore: 72,
      stages: [
        { id: "s1", key: "introduction", title: "Giriş", content: doc("Kaygı başarıyı etkiler ", cite("S1"), ". Bu konu tartışmalıdır [KAYNAK GEREKLİ].") },
        { id: "s2", key: "method", title: "Yöntem", content: { type: "doc", content: [{ type: "paragraph" }] } },
        { id: "s3", key: "title_abstract", title: "Özet", content: doc("Kısa özet.") },
      ],
      sources: [{ id: "S1", verified: false, access_level: "metadata" }, { id: "S2", verified: true, access_level: "abstract" }],
      audits: {},
    });
    const by = Object.fromEntries(items.map((i) => [i.id, i]));
    expect(by.sections).toMatchObject({ status: "fail", stageId: "s2" });
    expect(by.placeholders).toMatchObject({ status: "fail", vars: { a: 1, b: 0 } });
    expect(by.claims).toMatchObject({ status: "todo", stageId: "s1" });
    expect(by.sources.status).toBe("warn");
    expect(by.access.status).toBe("warn");
    expect(by.unused.status).toBe("warn");
    expect(by.abstract.status).toBe("warn");
    expect(by.keywords.status).toBe("warn");
    expect(by.quality.status).toBe("warn");
    expect(by.journal.status).toBe("todo");
  });
  it("desteklenmeyen iddia varsa iddia maddesi başarısız olur", () => {
    const items = buildChecklist({ workType: "thesis", keywords: ["a", "b", "c"], hasFormat: true, qualityScore: 90, sources: [{ id: "S1", verified: true, access_level: "full_text" }],
      stages: [{ id: "s1", key: "introduction", title: "Giriş", content: doc("İddia ", cite("S1"), ".") }],
      audits: { s1: { not_supported: 2, partial: 1, insufficient: 0, uncited: 0, marked: 0, total: 3, created_at: "" } } });
    expect(items.find((i) => i.id === "claims")).toMatchObject({ status: "fail", vars: { bad: 2, partial: 1 } });
    expect(items.find((i) => i.id === "keywords")?.status).toBe("ok");
  });
});
