/**
 * D191 — Danışman görünümü: danışman okur ve yorum yazar, metni değiştiremez; ilerleme kurgudaki hedeflere göre hesaplanır.
 */
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { canWriteRole, ROLE_LABEL } from "@/lib/coauthors";
import { computeProgress } from "@/lib/progress";

describe("danışman rolü (D191)", () => {
  it("danışman okur ve yorum yazar, düzenleyemez", async () => {
    const { roleAllows } = await import("@/lib/project-access");
    expect(roleAllows("advisor", "read")).toBe(true);
    expect(roleAllows("advisor", "comment")).toBe(true);
    expect(roleAllows("advisor", "edit")).toBe(false);
    expect(roleAllows("advisor", "owner")).toBe(false);
    expect(canWriteRole("advisor")).toBe(false);
    expect(canWriteRole("editor")).toBe(true);
    expect(ROLE_LABEL.advisor).toBe("Danışman");
  });
});

describe("ilerleme (D191)", () => {
  const stages = [
    { id: "a", key: "introduction", title: "Giriş", position: 0, word_count: 1800, updated_at: "2026-11-10T10:00:00Z" },
    { id: "b", key: "literature", title: "Literatür", position: 1, word_count: 1500, updated_at: "2026-11-12T10:00:00Z" },
    { id: "c", key: "method", title: "Yöntem", position: 2, word_count: 0, updated_at: null },
    { id: "d", key: "references", title: "Kaynakça", position: 3, word_count: 400, updated_at: "2026-11-13T10:00:00Z" },
    { id: "e", key: "findings", title: "Gizli bölüm", position: 4, word_count: 0, hidden: true },
  ];
  const context = { blueprint: { chapters: [{ stageId: "a", key: "introduction", title: "Giriş", words: 2000 }, { stageId: "b", key: "literature", title: "Literatür", words: 6000 }, { stageId: "c", key: "method", title: "Yöntem", words: 2000 }] } };
  it("hedefe göre yüzde; kaynakça ve gizli bölüm sayılmaz; açık yorumlar sayılır", () => {
    const p = computeProgress({ context, stages, comments: [{ stage_id: "b", resolved: false }, { stage_id: "b", resolved: true }, { stage_id: "a", resolved: false }], quality: { score: 82, created_at: "2026-11-13T09:00:00Z" } });
    expect(p.stages.map((s) => s.title)).toEqual(["Giriş", "Literatür", "Yöntem"]);
    expect(p.targetWords).toBe(10000);
    expect(p.percent).toBe(33); // (1800 + 1500 + 0) / 10000
    expect(p.stages[0].status).toBe("done"); // %90
    expect(p.stages[1].status).toBe("started");
    expect(p.stages[2].status).toBe("empty");
    expect(p.openComments).toBe(2);
    expect(p.lastActivity).toBe("2026-11-12T10:00:00Z");
    expect(p.quality).toEqual({ score: 82, at: "2026-11-13T09:00:00Z" });
  });
  it("kurgu yoksa yazılmış bölüm oranı", () => {
    const p = computeProgress({ context: {}, stages, comments: [] });
    expect(p.targetWords).toBe(0);
    expect(p.percent).toBe(67); // Giriş ve Literatür yazıldı (≥150 kelime) / 3 bölüm
  });
});
