import { describe, expect, it } from "vitest";
import { buildGraph, insights, layout, simpleHash, timelineLayout, topicMap, type OATopic } from "@/lib/litmap-graph";

const T = (name: string, subfield = "Clinical Psychology", field = "Psychology"): OATopic => ({ id: name, name, subfield, field });
const W = (id: string, refs: string[], o: { year?: number; topic?: OATopic } = {}) => ({ id: `https://openalex.org/${id}`, doi: null, title: id, year: o.year ?? 2020, referenced_works: refs.map((r) => `https://openalex.org/${r}`), cited_by_count: 1, sourceId: id, topic: o.topic ?? null });

describe("literatür haritası (D123, D141)", () => {
  it("çalışma içi atıfları kenar yapar, ortak atıf alan dış yayınları aday önerir", () => {
    const g = buildGraph([W("W1", ["W2", "W9", "W8"]), W("W2", ["W9", "W8"]), W("W3", ["W9"]), W("W4", [])]);
    expect(g.edges).toEqual([{ from: "W1", to: "W2", kind: "cites", weight: 1 }]);
    expect(g.candidates).toEqual([{ id: "W9", refCount: 3 }, { id: "W8", refCount: 2 }]);
    expect(g.nodes.find((n) => n.id === "W2")?.inDegree).toBe(1);
    expect(g.isolated).toBe(2);
  });

  it("birbirine atıf yapmayan ama aynı kaynakları kullanan çalışmaları ortak kaynakça bağıyla bağlar", () => {
    const g = buildGraph([W("A", ["X1", "X2", "X3"]), W("B", ["X1", "X2", "X4"]), W("C", ["Y1", "Y2"])]);
    const c = g.edges.find((e) => e.kind === "coupling");
    expect(c).toMatchObject({ from: "A", to: "B" });
    expect(c!.weight).toBeCloseTo(2 / 3, 3);
    expect(g.nodes.find((n) => n.id === "C")?.degree).toBe(0);
  });

  it("dış yayınların birlikte atıf yaptığı çiftleri bağlar (en az iki yayın)", () => {
    const citing = [{ id: "N1", referenced_works: ["A", "B"] }, { id: "N2", referenced_works: ["https://openalex.org/A", "B", "Z"] }, { id: "N3", referenced_works: ["A", "C"] }];
    const g = buildGraph([W("A", []), W("B", []), W("C", [])], { citing });
    expect(g.edges).toEqual([{ from: "A", to: "B", kind: "cocitation", weight: 2 }]);
  });

  it("iki ayrı literatür akımını iki kümeye ayırır, küme adını ortak konudan verir ve köprüyü bulur", () => {
    const anx = T("Anxiety disorders"), sleep = T("Sleep and dreams");
    const g = buildGraph([
      W("A1", ["P1", "P2", "P3"], { topic: anx }), W("A2", ["P1", "P2", "P3"], { topic: anx }), W("A3", ["P1", "P2", "P4"], { topic: anx }),
      W("S1", ["Q1", "Q2", "Q3"], { topic: sleep }), W("S2", ["Q1", "Q2", "Q3"], { topic: sleep }), W("S3", ["Q1", "Q2", "Q4"], { topic: sleep }),
    ]);
    expect(g.clusters).toHaveLength(2);
    expect(g.clusters!.map((c) => c.label).sort()).toEqual(["Anxiety disorders", "Sleep and dreams"]);
    const ca = g.nodes.find((n) => n.id === "A1")!.cluster, cs = g.nodes.find((n) => n.id === "S1")!.cluster;
    expect(ca).not.toBe(cs);
    expect(g.nodes.find((n) => n.id === "A2")!.cluster).toBe(ca);
    const ins = insights(g, [], 2026);
    expect(ins.find((i) => i.kind === "split")).toMatchObject({ values: { clusters: 2, linked: 0 } });
  });

  it("yerleşimler kararlı ve sınırlar içinde; zaman çizelgesinde yıl soldan sağa artar", () => {
    const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const p1 = layout(nodes, [{ from: "a", to: "b" }]), p2 = layout(nodes, [{ from: "a", to: "b" }]);
    expect(p1).toEqual(p2);
    for (const p of Object.values(p1)) { expect(p.x).toBeGreaterThanOrEqual(20); expect(p.y).toBeLessThanOrEqual(440); }
    const g = buildGraph([W("O", [], { year: 1990 }), W("M", [], { year: 2005 }), W("N", [], { year: 2024 })]);
    const tl = timelineLayout(g.nodes, g.clusters ?? []);
    expect(tl.pos.O.x).toBeLessThan(tl.pos.M.x);
    expect(tl.pos.M.x).toBeLessThan(tl.pos.N.x);
    expect(tl.years[0]).toBeGreaterThanOrEqual(1990);
  });

  it("konu haritası eksik alt konuyu, boşluk analizi eski literatürü bildirir", () => {
    const rows = topicMap([T("Anxiety"), T("Anxiety"), null], [T("Anxiety"), T("Rumination"), T("Rumination")]);
    expect(rows[0]).toMatchObject({ topic: "Anxiety", mine: 2, related: 1 });
    expect(rows.find((r) => r.topic === "Rumination")).toMatchObject({ mine: 0, related: 2 });
    const g = buildGraph([W("A", [], { year: 2001 }), W("B", [], { year: 2003 }), W("C", [], { year: 2010 })]);
    const ins = insights(g, rows, 2026);
    expect(ins.find((i) => i.kind === "recency")).toMatchObject({ level: "warn", values: { share: 0 } });
    expect(ins.find((i) => i.kind === "gap_topic")?.values.topics).toBe("Rumination");
    expect(ins.find((i) => i.kind === "old")).toBeFalsy(); // güncellik uyarısı zaten verildi
    expect(insights(g, rows, 2026).filter((i) => i.level === "warn").length).toBeGreaterThan(0);
  });

  it("önbellek imzası kararlı ve içeriğe duyarlı", () => {
    expect(simpleHash("a,b")).toBe(simpleHash("a,b"));
    expect(simpleHash("a,b")).not.toBe(simpleHash("a,c"));
  });
});
