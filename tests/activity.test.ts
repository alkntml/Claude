import { describe, expect, it } from "vitest";
import { activitySummary, type ActivityRow } from "@/lib/activity-summary";

const r = (kind: ActivityRow["kind"], words: number, at: string): ActivityRow => ({ id: Math.random(), kind, words, created_at: at, action: null, project_title: null, stage_title: null, words_before: null, model: null });

describe("kullanım kanıt kaydı özeti (D102)", () => {
  it("üretilen ve silinen kelimeyi, bu ayı ve ay dökümünü verir", () => {
    const s = activitySummary([
      r("ai_output", 1000, "2026-11-10T10:00:00Z"), r("ai_output", 720, "2026-11-12T10:00:00Z"), r("ai_output", 500, "2026-10-02T10:00:00Z"),
      r("text_removed", 900, "2026-11-13T10:00:00Z"), r("project_deleted", 2000, "2026-11-14T10:00:00Z"),
    ], new Date("2026-11-20T10:00:00Z"));
    expect(s).toMatchObject({ outputs: 3, words: 2220, pages: 6, monthOutputs: 2, monthWords: 1720, projectsDeleted: 1, deletedWords: 2900 });
    expect(s.months).toEqual([{ month: "2026-11", outputs: 2, words: 1720, deleted: 2900 }, { month: "2026-10", outputs: 1, words: 500, deleted: 0 }]);
  });
});
