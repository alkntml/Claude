/**
 * Literatür haritası (D123) — saf kısım: OpenAlex kayıtlarından atıf ağı ve “eksik temel çalışma” adayları.
 * Düğüm: çalışmadaki kaynaklar. Kenar: A, B’ye atıf yapıyor (ikisi de çalışmada). Aday: çalışmadaki kaynakların en az
 * ikisinin atıf yaptığı ama çalışmada olmayan yayın (ortak atıf sıklığına göre sıralı).
 */
export interface OAWork { id: string; doi: string | null; title: string; year: number | null; referenced_works: string[]; cited_by_count: number }
export interface MapNode { id: string; sourceId: string; title: string; year: number | null; citedByCount: number; inDegree: number; outDegree: number }
export interface MapEdge { from: string; to: string }
export interface LitGraph { nodes: MapNode[]; edges: MapEdge[]; candidates: { id: string; refCount: number }[]; isolated: number }

export const shortId = (id: string) => id.replace(/^https?:\/\/openalex\.org\//i, "").toUpperCase();

export function buildGraph(works: (OAWork & { sourceId: string })[], opts: { minRefs?: number; maxCandidates?: number } = {}): LitGraph {
  const minRefs = opts.minRefs ?? 2, maxCandidates = opts.maxCandidates ?? 15;
  const byId = new Map(works.map((w) => [shortId(w.id), w]));
  const edges: MapEdge[] = [];
  const ext = new Map<string, number>();
  for (const w of works) {
    const from = shortId(w.id);
    for (const r of new Set((w.referenced_works ?? []).map(shortId))) {
      if (r === from) continue;
      if (byId.has(r)) edges.push({ from, to: r });
      else ext.set(r, (ext.get(r) ?? 0) + 1);
    }
  }
  const inD = new Map<string, number>(), outD = new Map<string, number>();
  for (const e of edges) { outD.set(e.from, (outD.get(e.from) ?? 0) + 1); inD.set(e.to, (inD.get(e.to) ?? 0) + 1); }
  const nodes: MapNode[] = works.map((w) => { const id = shortId(w.id); return { id, sourceId: w.sourceId, title: w.title, year: w.year, citedByCount: w.cited_by_count ?? 0, inDegree: inD.get(id) ?? 0, outDegree: outD.get(id) ?? 0 }; });
  const candidates = [...ext.entries()].filter(([, n]) => n >= minRefs).sort((a, b) => b[1] - a[1]).slice(0, maxCandidates).map(([id, refCount]) => ({ id, refCount }));
  return { nodes, edges, candidates, isolated: nodes.filter((n) => !n.inDegree && !n.outDegree).length };
}

/** Küçük, bağımlılıksız kuvvet yönelimli yerleşim (istemcide çizim için). Aynı girdi → aynı çıktı. */
export function layout(nodes: { id: string }[], edges: MapEdge[], w = 760, h = 460, iterations = 260): Record<string, { x: number; y: number }> {
  const n = nodes.length;
  const pos: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
  nodes.forEach((nd, i) => { const a = (2 * Math.PI * i) / Math.max(1, n); pos[nd.id] = { x: w / 2 + Math.cos(a) * w * 0.35, y: h / 2 + Math.sin(a) * h * 0.35, vx: 0, vy: 0 }; });
  const k = Math.sqrt((w * h) / Math.max(1, n)) * 0.55;
  for (let it = 0; it < iterations; it++) {
    const temp = (1 - it / iterations) * 18;
    for (const a of nodes) {
      const p = pos[a.id]; let fx = 0, fy = 0;
      for (const b of nodes) { if (a === b) continue; const q = pos[b.id]; const dx = p.x - q.x, dy = p.y - q.y; const d2 = Math.max(0.01, dx * dx + dy * dy); const f = (k * k) / d2; fx += dx * f; fy += dy * f; }
      fx += (w / 2 - p.x) * 0.02; fy += (h / 2 - p.y) * 0.02;
      p.vx = fx; p.vy = fy;
    }
    for (const e of edges) {
      const p = pos[e.from], q = pos[e.to]; if (!p || !q) continue;
      const dx = q.x - p.x, dy = q.y - p.y; const d = Math.max(0.01, Math.hypot(dx, dy)); const f = (d * d) / k / d;
      p.vx += dx * f; p.vy += dy * f; q.vx -= dx * f; q.vy -= dy * f;
    }
    for (const nd of nodes) {
      const p = pos[nd.id]; const m = Math.hypot(p.vx, p.vy) || 1;
      p.x = Math.min(w - 20, Math.max(20, p.x + (p.vx / m) * Math.min(m, temp)));
      p.y = Math.min(h - 20, Math.max(20, p.y + (p.vy / m) * Math.min(m, temp)));
    }
  }
  return Object.fromEntries(Object.entries(pos).map(([id, p]) => [id, { x: Math.round(p.x), y: Math.round(p.y) }]));
}
