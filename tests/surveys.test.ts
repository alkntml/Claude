import { describe, expect, it } from "vitest";
import { codebook, QuestionsSchema, responsesToRows, surveyColumns, toCsv, validateAnswers, type Question } from "@/lib/surveys";

const qs: Question[] = [
  { id: "g", code: "Cinsiyet", title: "Cinsiyet", help: "", required: true, type: "single", options: ["Kadın", "Erkek"] },
  { id: "y", code: "Yas", title: "Yaş", help: "", required: true, type: "number", min: 15, max: 100 },
  { id: "s", code: "BO", title: "Ölçek", help: "", required: true, type: "likert", items: ["a", "b", "c"], points: 5, labels: ["1", "2", "3", "4", "5"], reverse: [1] },
  { id: "m", code: "Ara", title: "Araçlar", help: "", required: false, type: "multi", options: ["X", "Y"] },
  { id: "i", code: "B1", title: "Bilgi", help: "", required: false, type: "info" },
  { id: "t", code: "Gorus", title: "Görüş", help: "", required: false, type: "text", long: true },
];

describe("anket", () => {
  it("sütunlar: Likert maddeleri ve çoklu seçim seçenekleri ayrı sütun", () => {
    expect(surveyColumns(qs)).toEqual(["Cinsiyet", "Yas", "BO1", "BO2", "BO3", "Ara_1", "Ara_2", "Gorus"]);
    expect(QuestionsSchema.safeParse(qs).success).toBe(true);
  });
  it("yinelenen değişken adı ve eksik etiket reddedilir", () => {
    expect(QuestionsSchema.safeParse([qs[0], { ...qs[1], code: "Cinsiyet" }]).success).toBe(false);
    expect(QuestionsSchema.safeParse([{ ...qs[2], labels: ["1", "2"] }]).success).toBe(false);
  });
  it("cevap doğrulama: zorunlu, aralık, geçersiz seçenek", () => {
    const ok = { g: 0, y: "21", "s:0": 5, "s:1": 1, "s:2": 3, m: [1, 0, 1] };
    const v = validateAnswers(qs, ok);
    expect(v.ok).toBe(true);
    if (v.ok) { expect(v.answers.y).toBe(21); expect(v.answers.m).toEqual([0, 1]); }
    expect(validateAnswers(qs, { ...ok, "s:2": undefined })).toMatchObject({ ok: false, questionId: "s" });
    expect(validateAnswers(qs, { ...ok, y: 10 })).toMatchObject({ ok: false, questionId: "y" });
    expect(validateAnswers(qs, { ...ok, g: 5 })).toMatchObject({ ok: false, questionId: "g" });
    expect(validateAnswers(qs, { ...ok, "s:0": 6 })).toMatchObject({ ok: false, questionId: "s" });
  });
  it("tablo: ters madde kodlama, çoklu seçim 0/1, seçenek metni", () => {
    const v = validateAnswers(qs, { g: 1, y: 30, "s:0": 4, "s:1": 2, "s:2": 5, m: [1], t: "iyi" });
    if (!v.ok) throw new Error();
    const raw = responsesToRows(qs, [{ answers: v.answers }]);
    expect(raw[1]).toEqual(["Erkek", "30", "4", "2", "5", "0", "1", "iyi"]);
    const rev = responsesToRows(qs, [{ answers: v.answers }], { reverse: true });
    expect(rev[1][3]).toBe("4"); // 5 + 1 − 2
  });
  it("CSV: BOM, noktalı virgül, formül enjeksiyonu engeli, negatif sayı korunur", () => {
    const csv = toCsv([["a", "b"], ["=HYPERLINK(x)", "-3"], ["x;y", 'q"r']]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("'=HYPERLINK(x)");
    expect(csv).toContain(";-3");
    expect(csv).toContain('"x;y";"q""r"');
  });
  it("kod kitabı ters maddeyi belirtir", () => {
    expect(codebook(qs).find((r) => r[0] === "BO2")![1]).toContain("ters");
  });
});
