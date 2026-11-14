/**
 * D194 — Uzun tanıtım filmi (örnek nicel tez): filmdeki yapay zekâ metinlerinde geçen her istatistik, sitenin
 * istatistik motorunun kurgusal veri seti üzerinde hesapladığı değerle aynı olmalı. Atıflar yalnızca S1…S14.
 * FILM_OUT=klasör verilirse veri.csv yazılır (kayıt için).
 */
import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { filmDataset, FILM_VARS as V, toCsv } from "../demo/film/dataset";
import { ANSWERS } from "../demo/film/answers";
import { FILM_SOURCES } from "../demo/film/sources";
import { runAnalysis, type AnalysisSpec } from "@/lib/stats/apa";

const rows = filmDataset();
const run = (spec: object) => runAnalysis(rows, spec as AnalysisSpec, "tr").text;
const all = Object.values(ANSWERS).map((a) => a.text).join("\n");

describe("film: örnek tezin sayıları motorla aynı (D194)", () => {
  it("veri seti 384 katılımcı", () => {
    expect(rows.length).toBe(385);
    if (process.env.FILM_OUT) writeFileSync(`${process.env.FILM_OUT}/veri.csv`, toCsv(rows));
  });
  it("güvenirlik", () => {
    expect(run({ kind: "alpha", items: Array.from({ length: 10 }, (_, i) => `B${i + 1}`) })).toContain("α = .91");
    expect(run({ kind: "alpha", items: Array.from({ length: 5 }, (_, i) => `E${i + 1}`) })).toContain("α = .88");
  });
  it("korelasyonlar (H1–H3) ve ekran süresi", () => {
    const t = run({ kind: "correlation", vars: [V.screen, V.dep, V.proc, V.sleep], method: "pearson" });
    for (const r of ["Akıllı telefon bağımlılığı – Akademik erteleme: r(382) = .39", "Akıllı telefon bağımlılığı – Uyku kalitesi (PUKİ): r(382) = .53", "Akademik erteleme – Uyku kalitesi (PUKİ): r(382) = .49", "Ekran süresi (saat) – Uyku kalitesi (PUKİ): r(382) = .33"]) expect(t).toContain(r);
    for (const r of ["r(382) = .39", "r(382) = .53", "r(382) = .49"]) expect(all).toContain(r);
  });
  it("regresyon (H4), t testi (H5), ANOVA (H6)", () => {
    const reg = run({ kind: "regression", dv: V.sleep, ivs: [V.dep, V.proc, V.screen] });
    for (const x of ["F(3, 380) = 75.70", "%37.4", "β = .39", "β = .33"]) expect(reg).toContain(x);
    expect(all).toContain("F(3, 380) = 75.70");
    expect(all).toContain("%37,4");
    expect(run({ kind: "ttest_ind", dv: V.dep, group: V.g })).toContain("t(382) = -2.33, p = .020, d = 0.24");
    expect(all).toContain("t(382) = -2.33, p = .020, d = 0.24");
    expect(run({ kind: "anova", dv: V.proc, group: V.cls })).toMatch(/F\(3, 380\) = 3\.86, p = \.010/);
    expect(all).toContain("F(3, 380) = 3.86, p = .010, η² = .03");
  });
  it("atıflar yalnızca projedeki 14 kurgusal kaynağa; kaynaklarda DOI yok", () => {
    const ids = [...all.matchAll(/\[\[kaynak:S(\d+)/g)].map((m) => Number(m[1]));
    expect(Math.max(...ids)).toBeLessThanOrEqual(FILM_SOURCES.length);
    expect(FILM_SOURCES.every((s) => !s.doi && /^(Örnek|Sample)/.test(s.containerTitle ?? s.publisher))).toBe(true);
  });
});

/** Kayıt hazırlığı: FILM_DB=…/db.json verilirse filmdeki çalışma sitenin PDF motoruyla tez.pdf olarak yazılır */
it.runIf(!!process.env.FILM_DB)("film: PDF", async () => {
  const { readFileSync } = await import("node:fs");
  const { buildExportDoc } = await import("@/lib/export/model");
  const { toPdf } = await import("@/lib/export/render-pdf");
  const { effectiveFormat } = await import("@/lib/export/format");
  const { sourceRowToItemClient } = await import("@/lib/sources/row");
  const db = JSON.parse(readFileSync(process.env.FILM_DB!, "utf8"));
  const project = db.projects[0];
  const stages = db.stages.filter((s: { project_id: string }) => s.project_id === project.id).sort((a: { position: number }, b: { position: number }) => a.position - b.position);
  const sources = db.sources.filter((s: { project_id: string }) => s.project_id === project.id);
  const doc = buildExportDoc({ project, stages, sources, engineItems: sources.map(sourceRowToItemClient), authorName: "Elif Aydın", options: { numberHeadings: true } });
  writeFileSync(process.env.FILM_DB!.replace(/db\.json$/, "tez.pdf"), await toPdf(doc, effectiveFormat(project)));
}, 60000);
