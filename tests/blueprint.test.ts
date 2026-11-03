import { describe, expect, it } from "vitest";
import { alignChapters, blueprintContext, blueprintGaps, BlueprintSchema, emptyBlueprint, readBlueprint } from "@/lib/blueprint";

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
    const bp = { ...emptyBlueprint(), aim: "Erteleme ile uyku ilişkisini incelemek", questions: ["İlişki var mı?"], chapters: [{ stageId: "s2", key: "method", title: "Yöntem", plan: "İlişkisel tarama" }], approvedAt: "2026-11-03T00:00:00Z" };
    const txt = blueprintContext(bp, { id: "s2", key: "method" });
    expect(txt).toContain("onayladığı");
    expect(txt).toContain("Amaç: Erteleme");
    expect(txt).toContain("1. İlişki var mı?");
    expect(txt).toContain("BU BÖLÜMÜN KURGUDAKİ PLANI: İlişkisel tarama");
    expect(blueprintContext(emptyBlueprint())).toBe("");
    expect(blueprintContext(null)).toBe("");
  });
});
