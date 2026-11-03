import { describe, expect, it } from "vitest";
import { alignChapters, distributeWords, pagesFor, blueprintContext, blueprintGaps, BlueprintSchema, emptyBlueprint, readBlueprint } from "@/lib/blueprint";

const stages = [{ id: "s1", key: "intro", title: "Giriş" }, { id: "s2", key: "method", title: "Yöntem" }, { id: "s3", key: "references", title: "Kaynakça" }];

describe("kurgu (D67)", () => {
  it("bozuk kayıtları güvenle okur", () => {
    expect(readBlueprint(null)).toBeNull();
    expect(readBlueprint({ questions: "x" })).toBeNull();
    expect(readBlueprint({ aim: "Amaç" })?.aim).toBe("Amaç");
  });

  it("bölüm planlarını aşamalarla hizalar (kaynakça hariç, eski planlar korunur)", () => {
    const bp = BlueprintSchema.parse({ chapters: [{ stageId: "s2", key: "method", title: "Eski ad", plan: "Nicel desen" }, { stageId: "silinmis", key: "x", title: "X", plan: "p" }] });
    const ch = alignChapters(bp, stages);
    expect(ch.map((c) => c.stageId)).toEqual(["s1", "s2"]);
    expect(ch[1]).toMatchObject({ title: "Yöntem", plan: "Nicel desen" });
    expect(ch[0].plan).toBe("");
  });

  it("boş alanları listeler", () => {
    const gaps = blueprintGaps({ ...emptyBlueprint(), aim: "A", questions: ["S?"] });
    expect(gaps).toContain("Araştırma problemi");
    expect(gaps).not.toContain("Amaç");
    expect(gaps).not.toContain("Araştırma soruları / hipotezler");
  });

  it("yapay zekâ bağlamına plan ve ilgili bölümün planı eklenir", () => {
    const bp = { ...emptyBlueprint(), aim: "Erteleme ile uyku ilişkisini incelemek", questions: ["İlişki var mı?"], chapters: [{ stageId: "s2", key: "method", title: "Yöntem", plan: "İlişkisel tarama", words: 1500 }], targetWords: 11000, approvedAt: "2026-11-03T00:00:00Z" };
    const txt = blueprintContext(bp, { id: "s2", key: "method" });
    expect(txt).toContain("onayladığı");
    expect(txt).toContain("Amaç: Erteleme");
    expect(txt).toContain("1. İlişki var mı?");
    expect(txt).toContain("BU BÖLÜMÜN KURGUDAKİ PLANI: İlişkisel tarama");
    expect(txt).toContain("yaklaşık 1500 kelime");
    expect(txt).toContain("toplam yaklaşık 11000 kelime");
    expect(txt).not.toContain("sayfa");
    expect(blueprintContext(emptyBlueprint())).toBe("");
    expect(blueprintContext(null)).toBe("");
  });

  it("toplam kelimeyi bölümlere dağıtır; toplam tam tutar, kaynakça/ekler sıfır", () => {
    const ch = [{ key: "topic" }, { key: "literature" }, { key: "findings" }, { key: "references" }, { key: "appendices" }];
    const d = distributeWords(ch, 20000);
    expect(d.reduce((a, c) => a + c.words, 0)).toBe(20000);
    expect(d[3].words).toBe(0);
    expect(d[4].words).toBe(0);
    expect(d[1].words).toBeGreaterThan(d[0].words);
    expect(d.every((c) => c.words % 50 === 0)).toBe(true);
    // Mevcut dağılım oran olarak korunur (toplam değişince ölçeklenir)
    const scaled = distributeWords([{ key: "a", words: 1000 }, { key: "b", words: 3000 }], 8000);
    expect(scaled.map((c) => c.words)).toEqual([2000, 6000]);
    // Yapay zekâ ağırlıkları önceliklidir
    expect(distributeWords([{ key: "a" }, { key: "b" }], 1000, [1, 1]).map((c) => c.words)).toEqual([500, 500]);
    expect(distributeWords(ch, 0).every((c) => c.words === 0)).toBe(true);
    expect(pagesFor(27500)).toBe(100);
    expect(pagesFor(0)).toBe(0);
  });
});
