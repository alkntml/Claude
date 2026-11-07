import { describe, expect, it } from "vitest";
import { buildGraph, layout } from "@/lib/litmap-graph";

const W = (id: string, refs: string[], sourceId = id) => ({ id: `https://openalex.org/${id}`, doi: null, title: id, year: 2020, referenced_works: refs.map((r) => `https://openalex.org/${r}`), cited_by_count: 1, sourceId });

describe("literatür haritası (D123)", () => {
  it("çalışma içi atıfları kenar yapar, ortak atıf alan dış yayınları aday önerir", () => {
    const g = buildGraph([W("W1", ["W2", "W9", "W8"]), W("W2", ["W9", "W8"]), W("W3", ["W9"]), W("W4", [])]);
    expect(g.edges).toEqual([{ from: "W1", to: "W2" }]);
    expect(g.candidates).toEqual([{ id: "W9", refCount: 3 }, { id: "W8", refCount: 2 }]);
    expect(g.nodes.find((n) => n.id === "W2")?.inDegree).toBe(1);
    expect(g.isolated).toBe(2);
  });
  it("yerleşim kararlı ve sınırlar içinde", () => {
    const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const p1 = layout(nodes, [{ from: "a", to: "b" }]), p2 = layout(nodes, [{ from: "a", to: "b" }]);
    expect(p1).toEqual(p2);
    for (const p of Object.values(p1)) { expect(p.x).toBeGreaterThanOrEqual(20); expect(p.y).toBeLessThanOrEqual(440); }
  });
});
