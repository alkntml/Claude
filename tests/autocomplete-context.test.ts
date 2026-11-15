/** D205: satır içi tamamlama bağlamı — çalışmanın konusu, akışı, bölümün amacı ve rolü bütün çalışma türlerinde */
import { describe, expect, it } from "vitest";
import { buildSuggestContext } from "@/lib/autocomplete-context";
import { buildRoadmap, WORK_TYPES } from "@/lib/workflows";

const base = { title: "Sosyal Medya Kullanımı ve Akademik Erteleme", academic_level: "master", discipline: "Eğitim bilimleri", topic: "Lisans öğrencilerinde problemli sosyal medya kullanımı ile akademik erteleme ilişkisi", keywords: ["sosyal medya", "erteleme"] };

describe("D205: otomatik tamamlama bağlamı", () => {
  it("konu, amaç, araştırma soruları, akış, bölüm amacı ve rol bağlamda", () => {
    const stages = [
      { id: "a", key: "introduction", title: "Giriş", position: 0 },
      { id: "b", key: "method", title: "Yöntem", position: 1, why: "Araştırma sorularının nasıl cevaplanacağını gösterir" },
      { id: "c", key: "findings", title: "Bulgular", position: 2 },
      { id: "d", key: "references", title: "Kaynakça", position: 3 },
    ];
    const r = buildSuggestContext({ project: { ...base, work_type: "thesis", context: { methodology: "quantitative", blueprint: { problem: "", aim: "İlişkiyi incelemek", method: "", sample: "", data: "", analysis: "", contribution: "", questions: ["Problemli kullanım ertelemeyi yordar mı?"], targetWords: 0, chapters: [] } } }, stages, stageId: "b", stageTitle: "Yöntem", focusTitle: "Örneklem" });
    expect(r.text).toContain("Konu: Lisans öğrencilerinde");
    expect(r.text).toContain("Amaç: İlişkiyi incelemek");
    expect(r.text).toContain("Problemli kullanım ertelemeyi yordar mı?");
    expect(r.text).toContain("2. Yöntem  ← şu an bu bölümde");
    expect(r.text).not.toContain("Kaynakça");
    expect(r.text).toContain("BÖLÜM: Yöntem › Örneklem");
    expect(r.text).toMatch(/Bölümün amacı: .{20,}/);
    expect(r.text).toContain("Çalışmadaki işlevi: Araştırma sorularının");
    expect(r.role.name).toBe("Yöntem asistanı");
  });
  it("her çalışma türünün her bölümünde bölüm amacı ve rol bulunur", () => {
    for (const w of WORK_TYPES) {
      const map = buildRoadmap({ workType: w.id, level: "master", methodology: "quantitative" } as unknown as Parameters<typeof buildRoadmap>[0]);
      const items = (map as unknown as { stages?: { key: string; title: string; description?: string }[] }).stages ?? (map as unknown as { key: string; title: string; description?: string }[]);
      const stages = items.map((s, i) => ({ id: `s${i}`, key: s.key, title: s.title, description: s.description ?? null, position: i }));
      for (const st of stages.filter((x) => x.key !== "references")) {
        const r = buildSuggestContext({ project: { ...base, work_type: w.id, context: {} }, stages, stageId: st.id, stageTitle: st.title });
        expect(r.text, `${w.id}/${st.key}`).toMatch(/Bölümün amacı: \S/);
        expect(r.role.name.length, `${w.id}/${st.key}`).toBeGreaterThan(3);
        expect(r.text).toContain("← şu an bu bölümde");
      }
    }
  });
  it("kullanıcının eklediği özel bölümde açıklaması amaç olarak kullanılır", () => {
    const r = buildSuggestContext({ project: { ...base, work_type: "thesis", context: {} }, stages: [{ id: "x", key: "custom_1", title: "Saha notları", description: "Gözlem sürecinin günlük kaydı" }], stageId: "x", stageTitle: "Saha notları" });
    expect(r.text).toContain("Bölümün amacı: Gözlem sürecinin günlük kaydı");
    expect(r.role.name).toBe("Akademik editör");
  });
});
