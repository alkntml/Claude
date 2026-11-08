/**
 * Literatür haritası (D123, D141) — saf kısım. OpenAlex kayıtlarından:
 * - Doğrudan atıf ağı: çalışmadaki A, çalışmadaki B’ye atıf yapıyor.
 * - Ortak kaynakça (bibliyografik eşleşme): A ile B aynı yayınlara atıf yapıyor (Salton kosinüsü). Birbirine atıf
 *   yapmayan ama aynı literatürden beslenen kaynakları bağlar; seyrek ağlarda yapıyı asıl bu gösterir.
 * - Birlikte atıf (co-citation): dışarıdaki yeni yayınlar A ile B’ye birlikte atıf yapıyor.
 * - Kümeler: ağırlıklı ağ üzerinde etiket yayılımı (deterministik); küme adı üyelerin en sık OpenAlex konusundan.
 * - Eksik temel çalışmalar (ortak atıf alan dış yayınlar) ve yeni çalışmalar (kaynaklarınızın en az ikisine atıf
 *   yapan yakın tarihli yayınlar) adayları; konu haritası ve kural tabanlı boşluk analizi.
 */
export interface OATopic { id: string; name: string; subfield: string | null; field: string | null }
export interface OAWork { id: string; doi: string | null; title: string; year: number | null; referenced_works: string[]; cited_by_count: number; topic?: OATopic | null }
export interface MapNode { id: string; sourceId: string; title: string; year: number | null; citedByCount: number; inDegree: number; outDegree: number; cluster?: number; degree?: number; bridge?: boolean; topic?: OATopic | null }
export type EdgeKind = "cites" | "coupling" | "cocitation";
export interface MapEdge { from: string; to: string; kind?: EdgeKind; weight?: number }
export interface MapCluster { id: number; label: string; size: number; members: string[]; years: [number | null, number | null] }
export interface LitGraph { nodes: MapNode[]; edges: MapEdge[]; candidates: { id: string; refCount: number }[]; isolated: number; clusters?: MapCluster[] }

export const shortId = (id: string) => id.replace(/^https?:\/\/openalex\.org\//i, "").toUpperCase();

/** OpenAlex primary_topic alanını sadeleştirir */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTopic(t: any): OATopic | null {
  if (!t?.display_name) return null;
  return { id: shortId(String(t.id ?? t.display_name)), name: String(t.display_name), subfield: t.subfield?.display_name ?? null, field: t.field?.display_name ?? null };
}

export function buildGraph(works: (OAWork & { sourceId: string })[], opts: { minRefs?: number; maxCandidates?: number; citing?: { id: string; referenced_works: string[] }[]; couplingPerNode?: number } = {}): LitGraph {
  const minRefs = opts.minRefs ?? 2, maxCandidates = opts.maxCandidates ?? 15, perNode = opts.couplingPerNode ?? 4;
  const byId = new Map(works.map((w) => [shortId(w.id), w]));
  const edges: MapEdge[] = [];
  const ext = new Map<string, number>();
  const refs = new Map<string, Set<string>>();
  for (const w of works) {
    const from = shortId(w.id);
    const rs = new Set((w.referenced_works ?? []).map(shortId));
    rs.delete(from);
    refs.set(from, rs);
    for (const r of rs) {
      if (byId.has(r)) edges.push({ from, to: r, kind: "cites", weight: 1 });
      else ext.set(r, (ext.get(r) ?? 0) + 1);
    }
  }
  const inD = new Map<string, number>(), outD = new Map<string, number>();
  for (const e of edges) { outD.set(e.from, (outD.get(e.from) ?? 0) + 1); inD.set(e.to, (inD.get(e.to) ?? 0) + 1); }

  // Ortak kaynakça: her düğüm için en güçlü birkaç bağ (yumak oluşmasın)
  const ids = [...byId.keys()];
  const direct = new Set(edges.map((e) => [e.from, e.to].sort().join("|")));
  const coupling = new Map<string, { a: string; b: string; w: number; shared: number }>();
  const best = new Map<string, { k: string; w: number }[]>();
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const A = refs.get(ids[i])!, B = refs.get(ids[j])!;
    if (!A.size || !B.size) continue;
    let shared = 0;
    const [small, big] = A.size < B.size ? [A, B] : [B, A];
    for (const r of small) if (big.has(r)) shared++;
    if (shared < 2) continue;
    const w = shared / Math.sqrt(A.size * B.size);
    if (w < 0.05) continue;
    const k = [ids[i], ids[j]].sort().join("|");
    coupling.set(k, { a: ids[i], b: ids[j], w, shared });
    for (const n of [ids[i], ids[j]]) best.set(n, [...(best.get(n) ?? []), { k, w }]);
  }
  const keep = new Set<string>();
  for (const list of best.values()) for (const x of list.sort((p, q) => q.w - p.w).slice(0, perNode)) keep.add(x.k);
  for (const k of keep) if (!direct.has(k)) { const c = coupling.get(k)!; edges.push({ from: c.a, to: c.b, kind: "coupling", weight: Math.round(c.w * 1000) / 1000 }); }

  // Birlikte atıf: dışarıdaki (yeni) yayınların aynı anda atıf yaptığı çiftler
  if (opts.citing?.length) {
    const co = new Map<string, number>();
    for (const c of opts.citing) {
      const mine = [...new Set((c.referenced_works ?? []).map(shortId))].filter((r) => byId.has(r)).sort();
      if (mine.length < 2 || mine.length > 25) continue;
      for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) { const k = `${mine[i]}|${mine[j]}`; co.set(k, (co.get(k) ?? 0) + 1); }
    }
    for (const [k, n] of co) {
      if (n < 2 || direct.has(k) || keep.has(k)) continue;
      const [a, b] = k.split("|");
      edges.push({ from: a, to: b, kind: "cocitation", weight: n });
    }
  }

  const nodes: MapNode[] = works.map((w) => { const id = shortId(w.id); return { id, sourceId: w.sourceId, title: w.title, year: w.year, citedByCount: w.cited_by_count ?? 0, inDegree: inD.get(id) ?? 0, outDegree: outD.get(id) ?? 0, topic: w.topic ?? null }; });
  const clusters = clusterize(nodes, edges);
  const candidates = [...ext.entries()].filter(([, n]) => n >= minRefs).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, maxCandidates).map(([id, refCount]) => ({ id, refCount }));
  return { nodes, edges, candidates, isolated: nodes.filter((n) => !n.degree).length, clusters };
}

const edgeWeight = (e: MapEdge) => (e.kind === "coupling" ? 1 + 4 * (e.weight ?? 0) : e.kind === "cocitation" ? Math.min(3, 0.6 * (e.weight ?? 1)) : 1.5);

/** Etiket yayılımıyla kümeler (düğümlere cluster, degree, bridge yazar); küçük kümeler “bağlantısız” sayılmaz, tek düğümler kümesizdir */
export function clusterize(nodes: MapNode[], edges: MapEdge[]): MapCluster[] {
  const adj = new Map<string, Map<string, number>>();
  for (const n of nodes) adj.set(n.id, new Map());
  for (const e of edges) {
    if (!adj.has(e.from) || !adj.has(e.to) || e.from === e.to) continue;
    const w = edgeWeight(e);
    adj.get(e.from)!.set(e.to, (adj.get(e.from)!.get(e.to) ?? 0) + w);
    adj.get(e.to)!.set(e.from, (adj.get(e.to)!.get(e.from) ?? 0) + w);
  }
  const order = [...nodes].sort((a, b) => (a.id < b.id ? -1 : 1)).map((n) => n.id);
  const label = new Map(order.map((id) => [id, id]));
  for (let it = 0; it < 30; it++) {
    let changed = false;
    for (const id of order) {
      const nb = adj.get(id)!;
      if (!nb.size) continue;
      const score = new Map<string, number>();
      for (const [m, w] of nb) score.set(label.get(m)!, (score.get(label.get(m)!) ?? 0) + w);
      let bestL = label.get(id)!, bestS = score.get(bestL) ?? -1;
      for (const [l, s] of score) if (s > bestS + 1e-9 || (Math.abs(s - bestS) < 1e-9 && l < bestL)) { bestL = l; bestS = s; }
      if (bestL !== label.get(id)) { label.set(id, bestL); changed = true; }
    }
    if (!changed) break;
  }
  const groups = new Map<string, string[]>();
  for (const id of order) if (adj.get(id)!.size) groups.set(label.get(id)!, [...(groups.get(label.get(id)!) ?? []), id]);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const sorted = [...groups.values()].filter((g) => g.length >= 2).sort((a, b) => b.length - a.length || (a[0] < b[0] ? -1 : 1));
  const clusters: MapCluster[] = sorted.map((members, i) => {
    const topicCount = new Map<string, number>();
    for (const m of members) { const t = byId.get(m)?.topic; const k = t?.name ?? t?.subfield; if (k) topicCount.set(k, (topicCount.get(k) ?? 0) + 1); }
    const top = [...topicCount.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
    const years = members.map((m) => byId.get(m)?.year).filter((y): y is number => !!y);
    return { id: i + 1, label: top && top[1] >= 2 ? top[0] : "", size: members.length, members, years: [years.length ? Math.min(...years) : null, years.length ? Math.max(...years) : null] };
  });
  const clusterOf = new Map<string, number>();
  for (const c of clusters) for (const m of c.members) clusterOf.set(m, c.id);
  for (const n of nodes) {
    n.cluster = clusterOf.get(n.id) ?? 0;
    n.degree = adj.get(n.id)!.size;
    const touched = new Set([...adj.get(n.id)!.keys()].map((m) => clusterOf.get(m) ?? 0).filter(Boolean));
    n.bridge = touched.size >= 2;
  }
  return clusters;
}

/** Kuvvet yönelimli yerleşim; ağırlıklı kenarlar ve küme çekimi. Aynı girdi → aynı çıktı. */
export function layout(nodes: { id: string; cluster?: number }[], edges: MapEdge[], w = 760, h = 460, iterations = 260): Record<string, { x: number; y: number }> {
  const n = nodes.length;
  const pos: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
  nodes.forEach((nd, i) => { const a = (2 * Math.PI * i) / Math.max(1, n); pos[nd.id] = { x: w / 2 + Math.cos(a) * w * 0.35, y: h / 2 + Math.sin(a) * h * 0.35, vx: 0, vy: 0 }; });
  const k = Math.sqrt((w * h) / Math.max(1, n)) * 0.75;
  const cl = new Map(nodes.map((nd) => [nd.id, nd.cluster ?? 0]));
  for (let it = 0; it < iterations; it++) {
    const temp = (1 - it / iterations) * 18;
    const cent = new Map<number, { x: number; y: number; c: number }>();
    for (const nd of nodes) { const c = cl.get(nd.id)!; if (!c) continue; const p = pos[nd.id]; const o = cent.get(c) ?? { x: 0, y: 0, c: 0 }; cent.set(c, { x: o.x + p.x, y: o.y + p.y, c: o.c + 1 }); }
    for (const a of nodes) {
      const p = pos[a.id]; let fx = 0, fy = 0;
      for (const b of nodes) { if (a === b) continue; const q = pos[b.id]; const dx = p.x - q.x, dy = p.y - q.y; const d2 = Math.max(0.01, dx * dx + dy * dy); const f = (k * k) / d2; fx += dx * f; fy += dy * f; }
      fx += (w / 2 - p.x) * 0.02; fy += (h / 2 - p.y) * 0.02;
      const c = cl.get(a.id)!;
      const ce = c ? cent.get(c) : null;
      if (ce && ce.c > 1) { fx += (ce.x / ce.c - p.x) * 0.03; fy += (ce.y / ce.c - p.y) * 0.03; }
      p.vx = fx; p.vy = fy;
    }
    for (const e of edges) {
      const p = pos[e.from], q = pos[e.to]; if (!p || !q) continue;
      const dx = q.x - p.x, dy = q.y - p.y; const d = Math.max(0.01, Math.hypot(dx, dy)); const f = ((d * d) / k / d) * Math.min(2, edgeWeight(e) / 1.5);
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

/** Zaman çizelgesi: x = yıl, y = küme şeridi (kümesizler en altta); aynı yıl/şeritte üst üste binmesin diye dağıtılır */
export function timelineLayout(nodes: MapNode[], clusters: MapCluster[], w = 760, h = 460): { pos: Record<string, { x: number; y: number }>; years: number[]; lanes: { cluster: number; y: number }[] } {
  const ys = nodes.map((n) => n.year).filter((y): y is number => !!y);
  const minY = ys.length ? Math.min(...ys) : 2000, maxY = ys.length ? Math.max(...ys) : 2025;
  const laneIds = [...clusters.map((c) => c.id), 0];
  const laneH = (h - 60) / Math.max(1, laneIds.length);
  const lanes = laneIds.map((c, i) => ({ cluster: c, y: 30 + laneH * (i + 0.5) }));
  const x = (y: number | null) => (y == null ? w - 30 : 50 + ((y - minY) / Math.max(1, maxY - minY)) * (w - 100));
  const slot = new Map<string, number>();
  const pos: Record<string, { x: number; y: number }> = {};
  for (const n of [...nodes].sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || (a.id < b.id ? -1 : 1))) {
    const lane = lanes.find((l) => l.cluster === (n.cluster ?? 0)) ?? lanes[lanes.length - 1];
    const k = `${lane.cluster}|${n.year}`;
    const i = slot.get(k) ?? 0;
    slot.set(k, i + 1);
    const off = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * Math.min(14, laneH / 4);
    pos[n.id] = { x: Math.round(x(n.year)), y: Math.round(lane.y + off) };
  }
  const span = maxY - minY;
  const step = span > 40 ? 10 : span > 16 ? 5 : span > 6 ? 2 : 1;
  const years: number[] = [];
  for (let y = Math.ceil(minY / step) * step; y <= maxY; y += step) years.push(y);
  return { pos, years, lanes };
}

export interface TopicRow { field: string; subfield: string; topic: string; mine: number; related: number }
/** Konu haritası: kaynaklarınızın ve önerilen/yeni yayınların OpenAlex konuları. “related” > 0 ve “mine” = 0 → eksik alt konu adayı */
export function topicMap(mine: (OATopic | null | undefined)[], related: (OATopic | null | undefined)[]): TopicRow[] {
  const rows = new Map<string, TopicRow>();
  const add = (t: OATopic | null | undefined, k: "mine" | "related") => {
    if (!t) return;
    const r = rows.get(t.name) ?? { field: t.field ?? "—", subfield: t.subfield ?? "—", topic: t.name, mine: 0, related: 0 };
    r[k]++;
    rows.set(t.name, r);
  };
  mine.forEach((t) => add(t, "mine"));
  related.forEach((t) => add(t, "related"));
  return [...rows.values()].sort((a, b) => b.mine - a.mine || b.related - a.related || (a.topic < b.topic ? -1 : 1));
}

export interface Insight { kind: "recency" | "old" | "isolated" | "split" | "bridge" | "gap_topic" | "core"; level: "info" | "warn"; values: Record<string, string | number> }
/** Kural tabanlı boşluk ve yapı analizi (yapay zekâ kullanılmaz) */
export function insights(g: { nodes: MapNode[]; edges: MapEdge[]; clusters?: MapCluster[] }, topics: TopicRow[], nowYear: number): Insight[] {
  const out: Insight[] = [];
  const ys = g.nodes.map((n) => n.year).filter((y): y is number => !!y);
  if (ys.length >= 3) {
    const recent = ys.filter((y) => y >= nowYear - 5).length;
    const share = Math.round((recent / ys.length) * 100);
    out.push({ kind: "recency", level: share < 25 ? "warn" : "info", values: { share, recent, total: ys.length, newest: Math.max(...ys) } });
  }
  const isolated = g.nodes.filter((n) => !n.degree).length;
  if (g.nodes.length >= 4 && isolated / g.nodes.length >= 0.3) out.push({ kind: "isolated", level: "warn", values: { n: isolated, total: g.nodes.length } });
  const cl = g.clusters ?? [];
  if (cl.length >= 2) {
    const clusterOf = new Map(g.nodes.map((n) => [n.id, n.cluster ?? 0]));
    const linked = new Set<string>();
    for (const e of g.edges) { const a = clusterOf.get(e.from) ?? 0, b = clusterOf.get(e.to) ?? 0; if (a && b && a !== b) linked.add([a, b].sort().join("|")); }
    const pairs = (cl.length * (cl.length - 1)) / 2;
    if (linked.size < pairs) out.push({ kind: "split", level: "info", values: { clusters: cl.length, linked: linked.size, pairs } });
  }
  const bridges = g.nodes.filter((n) => n.bridge).sort((a, b) => (b.degree ?? 0) - (a.degree ?? 0));
  if (bridges[0]) out.push({ kind: "bridge", level: "info", values: { title: bridges[0].title, n: bridges.length } });
  const core = [...g.nodes].sort((a, b) => b.inDegree - a.inDegree)[0];
  if (core && core.inDegree >= 2) out.push({ kind: "core", level: "info", values: { title: core.title, n: core.inDegree } });
  const gaps = topics.filter((t) => !t.mine && t.related >= 2);
  if (gaps.length) out.push({ kind: "gap_topic", level: "warn", values: { topics: gaps.slice(0, 3).map((t) => t.topic).join("; "), n: gaps.length } });
  // “En yeni kaynak eski” yalnızca güncellik uyarısı zaten verilmediyse (aynı şeyi iki kez söylemesin)
  if (ys.length >= 3 && Math.max(...ys) < nowYear - 3 && !out.some((i) => i.kind === "recency" && i.level === "warn")) out.push({ kind: "old", level: "warn", values: { newest: Math.max(...ys) } });
  return out;
}

/** Önbellek imzası için kısa, deterministik özet (güvenlik amaçlı değildir) */
export function simpleHash(s: string): string { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
