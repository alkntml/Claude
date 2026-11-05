import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";

// Ağ erişimi yok: DOI doğrulaması ve ekleme sahte
vi.mock("@/lib/sources/verify", () => ({ verifySource: vi.fn(async (r: { doi: string | null }) => (r.doi === "10.1108/ejmbe-06-2020-0158" ? { status: "verified", authority: "crossref", record: { title: "A study of employee acceptance of artificial intelligence technology", authors: [{ family: "Choi", given: "Y." }], year: 2021, doi: r.doi, type: "article-journal", origins: [] } } : { status: "not_found" })) }));
vi.mock("@/lib/research", () => ({
  mapLimit: async <T, R>(xs: T[], _n: number, fn: (x: T, i: number) => Promise<R>) => Promise.all(xs.map(fn)),
  recordToInput: (r: any) => ({ ...r, containerTitle: null }),
  addSourcesToProject: vi.fn(async (_db: unknown, _p: string, _u: string, inputs: any[]) => ({ sources: inputs.map((x, i) => ({ id: `new${i}`, title: x.title, doi: x.doi ?? null, authors: x.authors, year: x.year, verified: x.doi === "10.1108/ejmbe-06-2020-0158" })) })),
}));
vi.mock("@/lib/env", () => ({ providerConfig: () => ({}) }));

const sample = "/root/.claude/uploads/34918334-c0c2-5550-980b-63b0e058622f/d5bfcc43-Degiskenlerin_Olculmesi_kopyas_.docx";
describe("Word içe aktarma sunucu akışı (D87)", () => {
  it.skipIf(!existsSync(sample))("kaynakları ekler, mevcut olanı yeniden kullanır, atıfları bağlar", async () => {
    const { importDocx } = await import("@/lib/import/server");
    const existing = [{ id: "old-fonseca", title: "ISO 14001:2015: An improved tool for sustainability", doi: "10.3926/jiem.1298", authors: [{ family: "Fonseca" }], year: 2015, verified: true }];
    const db = { from: () => ({ select: () => ({ eq: () => ({ eq: async () => ({ data: existing }) }) }) }) } as any;
    const out = await importDocx(db, { projectId: "p", userId: "u", buffer: readFileSync(sample), base: 3, max: 3, dropTitle: "Araştırmanın yöntemi" });
    expect(out.report.refsTotal).toBe(9);
    expect(out.report.refsReused).toBe(1);
    expect(out.report.refsAdded).toBe(8);
    expect(out.report.refsUnverified.length).toBe(7);
    expect(out.report.linked).toBeGreaterThan(15);
    const ids = new Set<string>();
    const walk = (n: any) => { if (n.type === "citation") n.attrs.ids.forEach((x: string) => ids.add(x)); n.content?.forEach(walk); };
    out.nodes.forEach(walk);
    expect(ids.has("old-fonseca")).toBe(true);
    expect(out.nodes.filter((n) => n.type === "heading").map((n) => n.attrs!.level)).toEqual([3, 3, 3, 3, 3, 3]);
  });
});
