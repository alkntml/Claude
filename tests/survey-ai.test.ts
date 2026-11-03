import { describe, expect, it } from "vitest";
import { estimateMinutes, fromAiQuestions, QuestionsSchema, safeCode, surveyColumns, surveyLint, type Question } from "@/lib/surveys";

describe("yapay zekâ anket yardımcıları (D66)", () => {
  it("yapay zekâ çıktısını geçerli soru modeline çevirir, bozuk soruları atar", () => {
    const qs = fromAiQuestions([
      { type: "single", title: "Cinsiyetiniz", code: "Cinsiyet", options: ["Kadın", "Erkek", "Kadın", "Belirtmek istemiyorum"], required: true },
      { type: "number", title: "Yaşınız", code: "Yas", min: "18", max: "12" },
      { type: "likert", title: "Aşağıdaki ifadelere katılımınızı belirtin", code: "SM", items: ["1. Sosyal medyada çok vakit geçiririm", "Uyumadan önce telefona bakarım"], points: 7, reverse: [1, 5, -1] },
      { type: "likert", title: "Boş ölçek", items: [] },
      { type: "single", title: "Tek seçenekli", options: ["A"] },
      { type: "bilinmeyen", title: "x" },
      { type: "text", title: "", long: true },
      { type: "text", title: "Eklemek istedikleriniz", code: "Görüş ve öneri!", long: true },
    ], "tr");
    expect(qs.map((q) => q.type)).toEqual(["single", "number", "likert", "text"]);
    expect(QuestionsSchema.safeParse(qs).success).toBe(true);
    const [g, a, l, tx] = qs as [Extract<Question, { type: "single" }>, Extract<Question, { type: "number" }>, Extract<Question, { type: "likert" }>, Question];
    expect(g.options).toEqual(["Kadın", "Erkek", "Belirtmek istemiyorum"]);
    expect(a.min).toBe(18);
    expect(a.max).toBeNull(); // max < min olamaz
    expect(l.points).toBe(7);
    expect(l.labels).toHaveLength(7);
    expect(l.items[0]).toBe("Sosyal medyada çok vakit geçiririm");
    expect(l.reverse).toEqual([1]);
    expect(tx.code).toBe("Görüşveöneri");
  });

  it("değişken adlarını benzersizleştirir (Likert madde sütunları dahil)", () => {
    const qs = fromAiQuestions([
      { type: "single", title: "A", code: "X1", options: ["1", "2"] },
      { type: "likert", title: "Ölçek", code: "X", items: ["m1", "m2"] },
      { type: "single", title: "B", code: "X1", options: ["1", "2"] },
    ], "tr");
    const cols = surveyColumns(qs).map((c) => c.toLowerCase());
    expect(new Set(cols).size).toBe(cols.length);
    expect(QuestionsSchema.safeParse(qs).success).toBe(true);
  });

  it("düzenlemede mevcut soru kimliklerini sırayla korur", () => {
    const qs = fromAiQuestions([{ type: "text", title: "Soru 1" }, { type: "text", title: "Soru 2" }], "tr", ["eski1"]);
    expect(qs[0].id).toBe("eski1");
    expect(qs[1].id).not.toBe("eski1");
  });

  it("güvenli değişken adı", () => {
    expect(safeCode("Yaş grubu", "S1")).toBe("Yaşgrubu");
    expect(safeCode("!!!", "S1")).toBe("S1");
  });

  it("tahmini süre ve hızlı kontrol", () => {
    const likert = (n: number, reverse: number[] = []): Question => ({ id: "l", code: "L", title: "Ölçek", help: "", required: true, type: "likert", items: Array.from({ length: n }, (_, i) => `Madde ${i + 1}`), points: 5, labels: ["1", "2", "3", "4", "5"], reverse });
    expect(estimateMinutes([likert(20)])).toBe(2);
    const issues = surveyLint([likert(8), { id: "n", code: "N", title: "Kaç saat?", help: "", required: true, type: "number", min: null, max: null }], { consent: "Araştırmacı: [ARAŞTIRMACI ADI]" });
    const msgs = issues.map((x) => x.message);
    expect(msgs.some((m) => m.includes("doldurulmamış"))).toBe(true);
    expect(msgs.some((m) => m.includes("ters madde yok"))).toBe(true);
    expect(msgs.some((m) => m.includes("alt/üst sınır"))).toBe(true);
    expect(surveyLint([likert(8, [2])], { consent: "Gönüllü katılım." }).some((x) => x.message.includes("ters madde yok"))).toBe(false);
    expect(surveyLint([])).toEqual([]);
  });
});
