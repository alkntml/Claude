"use client";
/**
 * Literatür haritası (D123, D141): kaynaklarınızın atıf / ortak kaynakça / birlikte atıf ağı, kümeleri, zaman çizelgesi,
 * konu haritası, boşluk analizi; eksik temel çalışmalar ve kaynaklarınıza atıf yapan yeni çalışmalar.
 */
import { AlertTriangle, CalendarRange, Download, ExternalLink, Info, Layers, Loader2, Minus, Network, Plus, RefreshCw, RotateCcw, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { layout, timelineLayout, type EdgeKind, type Insight, type MapCluster, type MapEdge, type MapNode, type TopicRow } from "@/lib/litmap-graph";
import { toSourceInput } from "@/lib/sources/to-input";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MapData { nodes: MapNode[]; edges: MapEdge[]; clusters?: MapCluster[]; suggestions: any[]; newWorks?: any[]; topics?: TopicRow[]; insights?: Insight[]; mapped: number; unmapped: number; isolated: number; cachedAt?: number }
type View = "network" | "timeline" | "topics" | "missing" | "new";
const W = 760, H = 460;
/** Küme renkleri (kategorik, sabit sıra); 0 = kümesiz */
const PALETTE = ["#2747dc", "#059669", "#d97706", "#e11d48", "#7c3aed", "#0284c7", "#0d9488", "#ea580c"];
const clusterColor = (c?: number) => (c ? PALETTE[(c - 1) % PALETTE.length] : "#9aa1b9");
const EDGE_STYLE: Record<EdgeKind, { dash?: string; color: string }> = { cites: { color: "rgb(120 128 160)" }, coupling: { dash: "4 3", color: "rgb(160 168 196)" }, cocitation: { dash: "1 3", color: "rgb(176 140 60)" } };

export function LitMapModal({ open, onClose, projectId, sourceCount, onSourcesAdded, citedSourceIds }: { open: boolean; onClose: () => void; projectId: string; sourceCount: number; onSourcesAdded: (rows: any[]) => void; citedSourceIds?: string[] }) {
  const { t, dl } = useT();
  const toast = useToast();
  const [data, setData] = useState<MapData | null>(null);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("network");
  const [kinds, setKinds] = useState<Record<EdgeKind, boolean>>({ cites: true, coupling: true, cocitation: true });
  const [colorBy, setColorBy] = useState<"cluster" | "year">("cluster");
  const [q, setQ] = useState("");
  const [vb, setVb] = useState({ x: 0, y: 0, w: W, h: H });
  const drag = useRef<{ x: number; y: number; vb: typeof vb } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cited = useMemo(() => new Set(citedSourceIds ?? []), [citedSourceIds]);

  const load = useCallback(async (refresh = false) => {
    setBusy(true);
    try { setData(await api<MapData>(`/api/projects/${projectId}/litmap`, { method: "POST", json: { refresh } })); }
    catch (e) { toast({ tone: "error", title: t("Harita oluşturulamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }, [projectId, toast, t]);
  useEffect(() => { if (open && sourceCount > 0) load(); }, [open, sourceCount, load]);

  const clusters = useMemo(() => data?.clusters ?? [], [data]);
  const edges = useMemo(() => (data?.edges ?? []).filter((e) => kinds[e.kind ?? "cites"]), [data, kinds]);
  const pos = useMemo(() => (data ? layout(data.nodes, data.edges, W, H) : {}), [data]);
  const tl = useMemo(() => (data ? timelineLayout(data.nodes, clusters, W, H) : null), [data, clusters]);
  const years = (data?.nodes ?? []).map((n) => n.year).filter((y): y is number => !!y);
  const [minY, maxY] = [Math.min(...years, 2000), Math.max(...years, 2025)];
  const yearColor = (y: number | null) => { const f = y ? (y - minY) / Math.max(1, maxY - minY) : 0.5; return `rgb(${Math.round(190 - 150 * f)} ${Math.round(205 - 140 * f)} ${Math.round(250 - 30 * f)})`; };
  const fill = (n: MapNode) => (colorBy === "cluster" ? clusterColor(n.cluster) : yearColor(n.year));
  const clusterName = (c?: number) => { const k = clusters.find((x) => x.id === c); return k ? (k.label || t("Küme {n}", { n: k.id })) : t("Kümesiz"); };
  const node = data?.nodes.find((n) => n.id === sel) ?? null;
  const match = useMemo(() => { const s = q.trim().toLocaleLowerCase("tr"); return s ? new Set((data?.nodes ?? []).filter((n) => n.title.toLocaleLowerCase("tr").includes(s)).map((n) => n.id)) : null; }, [q, data]);
  const neighbors = useMemo(() => { if (!sel) return null; const s = new Set([sel]); for (const e of edges) { if (e.from === sel) s.add(e.to); if (e.to === sel) s.add(e.from); } return s; }, [sel, edges]);

  async function add(r: any) {
    try {
      const { sources } = await api<{ sources: any[] }>(`/api/projects/${projectId}/sources`, { method: "POST", json: { sources: [toSourceInput(r)] } });
      onSourcesAdded(sources); setAdded((s) => new Set(s).add(r.openalexId ?? r.title));
      toast({ tone: "success", title: t("Kaynaklara eklendi") });
    } catch (e) { toast({ tone: "error", title: t("Eklenemedi"), detail: (e as Error).message }); }
  }

  // Yakınlaştırma / kaydırma (ağ görünümü)
  const zoom = (f: number) => setVb((v) => { const w = Math.min(W * 2, Math.max(W / 5, v.w * f)), h = (w * H) / W; return { x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h }; });
  const onWheel = (e: React.WheelEvent) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); zoom(e.deltaY > 0 ? 1.15 : 0.87); };
  const onDown = (e: React.PointerEvent) => { if ((e.target as Element).closest("g[data-node]")) return; drag.current = { x: e.clientX, y: e.clientY, vb }; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { const d = drag.current; const el = svgRef.current; if (!d || !el) return; const s = d.vb.w / el.clientWidth; setVb({ ...d.vb, x: d.vb.x - (e.clientX - d.x) * s, y: d.vb.y - (e.clientY - d.y) * s }); };
  const onUp = () => { drag.current = null; };

  function exportSvg(kind: "svg" | "png") {
    const el = svgRef.current; if (!el) return;
    const clone = el.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("viewBox", `0 0 ${W} ${H}`);
    clone.setAttribute("width", String(W * 2)); clone.setAttribute("height", String(H * 2));
    clone.insertAdjacentHTML("afterbegin", `<rect width="${W}" height="${H}" fill="white"/>`);
    const xml = new XMLSerializer().serializeToString(clone);
    const name = view === "timeline" ? "literatur-zaman-cizelgesi" : "literatur-agi";
    const save = (href: string, ext: string) => { const a = document.createElement("a"); a.href = href; a.download = `${name}.${ext}`; a.click(); };
    if (kind === "svg") { const u = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" })); save(u, "svg"); setTimeout(() => URL.revokeObjectURL(u), 2000); return; }
    const img = new Image();
    img.onload = () => { const c = document.createElement("canvas"); c.width = W * 2; c.height = H * 2; const ctx = c.getContext("2d"); if (!ctx) return; ctx.drawImage(img, 0, 0); save(c.toDataURL("image/png"), "png"); };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  }

  const insightText = (i: Insight): string => {
    const v = i.values;
    switch (i.kind) {
      case "recency": return t("Kaynaklarınızın %{share}’i son 5 yıldan ({recent}/{total}); en yeni kaynak {newest}.", v);
      case "old": return t("En yeni kaynağınız {newest} tarihli. Güncel çalışmaları “Yeni çalışmalar” sekmesinden inceleyin.", v);
      case "isolated": return t("{n}/{total} kaynağınız diğerleriyle hiçbir bağ kurmuyor; konuyla ilgisini ve yerini gözden geçirin.", v);
      case "split": return t("Literatürünüz {clusters} kümeye ayrılıyor ve bazı kümeler arasında hiç bağ yok. Bu akımların ilişkisini tartışmak özgün katkı fırsatı olabilir.", v);
      case "bridge": return t("Köprü kaynak: “{title}” farklı kümeleri birbirine bağlıyor; kuramsal çerçevede merkezi bir yer verebilirsiniz.", v);
      case "core": return t("Merkezi kaynak: “{title}” çalışmanızdaki {n} kaynaktan atıf alıyor.", v);
      case "gap_topic": return t("İlgili literatürde sık geçen ama kaynaklarınızda olmayan konu: {topics}.", v);
      default: return "";
    }
  };

  const newWorks = data?.newWorks ?? [];
  const topics = data?.topics ?? [];
  const TABS: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "network", label: t("Ağ"), icon: <Network className="h-3.5 w-3.5" /> },
    { id: "timeline", label: t("Zaman çizelgesi"), icon: <CalendarRange className="h-3.5 w-3.5" /> },
    { id: "topics", label: t("Konu haritası"), icon: <Layers className="h-3.5 w-3.5" />, badge: topics.filter((r) => !r.mine && r.related >= 2).length || undefined },
    { id: "missing", label: t("Eksik temel çalışmalar"), icon: <Sparkles className="h-3.5 w-3.5" />, badge: data?.suggestions.length || undefined },
    { id: "new", label: t("Yeni çalışmalar"), icon: <Sparkles className="h-3.5 w-3.5" />, badge: newWorks.length || undefined },
  ];

  const nodeEls = (P: Record<string, { x: number; y: number }>, labels: boolean) => (data?.nodes ?? []).map((n) => {
    const p = P[n.id]; if (!p) return null;
    const r = 5 + Math.min(13, n.inDegree * 2.5 + (n.degree ?? 0) * 0.6);
    const dim = (match && !match.has(n.id)) || (neighbors && !neighbors.has(n.id));
    const isCited = cited.has(n.sourceId);
    return (
      <g key={n.id} data-node onClick={() => setSel(n.id === sel ? null : n.id)} className="cursor-pointer" opacity={dim ? 0.25 : 1}>
        <circle cx={p.x} cy={p.y} r={r} fill={fill(n)} stroke={n.id === sel ? "#111827" : "white"} strokeWidth={n.id === sel ? 3 : 1.5} />
        {citedSourceIds && !isCited && <circle cx={p.x} cy={p.y} r={r + 3} fill="none" stroke="#9aa1b9" strokeWidth={1.2} strokeDasharray="2 2" />}
        {n.bridge && <circle cx={p.x} cy={p.y} r={2.2} fill="white" />}
        <title>{`${n.title} (${n.year ?? "?"})`}</title>
        {labels && (n.inDegree >= 2 || n.bridge || n.id === sel || match?.has(n.id)) && <text x={p.x + r + 3} y={p.y + 4} fontSize="10" fill="rgb(60 64 80)" stroke="white" strokeWidth={3} paintOrder="stroke">{n.title.slice(0, 30)}{n.title.length > 30 ? "…" : ""}</text>}
      </g>
    );
  });
  const edgeEls = (P: Record<string, { x: number; y: number }>, list: MapEdge[]) => list.map((e, i) => {
    const a = P[e.from], b = P[e.to]; if (!a || !b) return null;
    const k = e.kind ?? "cites"; const st = EDGE_STYLE[k];
    const hot = sel && (e.from === sel || e.to === sel);
    return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hot ? "#2747dc" : st.color} strokeOpacity={hot ? 0.95 : 0.55} strokeWidth={hot ? 1.8 : k === "coupling" ? 0.8 + 2 * (e.weight ?? 0) : 1} strokeDasharray={st.dash} markerEnd={k === "cites" ? "url(#lm-a)" : undefined} />;
  });

  return (
    <Modal open={open} onClose={onClose} title={t("Literatür haritası")} wide>
      <div className="space-y-4">
        <p className="text-[13px] text-ink-600">{t("Kaynaklarınızın birbirine atıfları, ortak kaynakçaları ve başka yayınlarda birlikte atıf almaları OpenAlex kayıtlarından kurulur; benzer kaynaklar kümelenir. Yapay zekâ kullanılmaz.")}</p>
        {sourceCount === 0 ? <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-600">{t("Harita için önce çalışmanıza DOI’li kaynaklar ekleyin.")}</p> : busy && !data ? (
          <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Kaynakların kaynakçaları ve onlara atıf yapan yayınlar okunuyor…")}</p>
        ) : data && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-600">
              <span className="rounded-full bg-ink-100 px-2.5 py-1">{t("Haritadaki kaynak: {n}", { n: data.mapped })}</span>
              <span className="rounded-full bg-ink-100 px-2.5 py-1">{t("Bağlantı: {n}", { n: data.edges.length })}</span>
              {clusters.length > 0 && <span className="rounded-full bg-ink-100 px-2.5 py-1">{t("Küme: {n}", { n: clusters.length })}</span>}
              {data.unmapped > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{t("DOI’siz veya bulunamayan: {n}", { n: data.unmapped })}</span>}
              {data.isolated > 0 && <span className="rounded-full bg-ink-100 px-2.5 py-1">{t("Bağlantısız: {n}", { n: data.isolated })}</span>}
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => load(true)} loading={busy}><RefreshCw className="h-3.5 w-3.5" /> {t("Yenile")}</Button>
            </div>

            {!!data.insights?.length && (
              <div className="grid gap-2 sm:grid-cols-2">
                {data.insights.map((i, k) => (
                  <div key={k} className={cn("flex gap-2 rounded-xl border p-2.5 text-[12.5px] leading-relaxed", i.level === "warn" ? "border-amber-200 bg-amber-50/70 text-amber-900" : "border-ink-100 bg-ink-50/60 text-ink-700")}>
                    {i.level === "warn" ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />}
                    <span>{insightText(i)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-1 rounded-xl bg-ink-100/70 p-1" role="tablist">
                {TABS.map((x) => (
                  <button key={x.id} role="tab" aria-selected={view === x.id} onClick={() => setView(x.id)} className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition", view === x.id ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800")}>
                    {x.icon}{x.label}{x.badge ? <span className="rounded-full bg-brand-50 px-1.5 text-[11px] text-brand-700">{x.badge}</span> : null}
                  </button>
                ))}
              </div>
            </div>

            {(view === "network" || view === "timeline") && (
              <>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-ink-600">
                  {view === "network" && (["cites", "coupling", "cocitation"] as EdgeKind[]).map((k) => (
                    <label key={k} className="inline-flex cursor-pointer items-center gap-1.5">
                      <input type="checkbox" checked={kinds[k]} onChange={(e) => setKinds((s) => ({ ...s, [k]: e.target.checked }))} className="h-3.5 w-3.5 accent-brand-600" />
                      <svg width="22" height="6" aria-hidden><line x1="0" y1="3" x2="22" y2="3" stroke={EDGE_STYLE[k].color} strokeWidth="2" strokeDasharray={EDGE_STYLE[k].dash} /></svg>
                      {k === "cites" ? t("Doğrudan atıf") : k === "coupling" ? t("Ortak kaynakça") : t("Birlikte atıf")}
                    </label>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-ink-100/70 p-0.5">
                    {(["cluster", "year"] as const).map((c) => <button key={c} onClick={() => setColorBy(c)} className={cn("rounded-md px-2 py-0.5", colorBy === c ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}>{c === "cluster" ? t("Renk: küme") : t("Renk: yıl")}</button>)}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-lg border border-ink-200 px-2">
                    <Search className="h-3.5 w-3.5 text-ink-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Haritada ara…")} className="h-7 w-36 bg-transparent text-[12.5px] outline-none" aria-label={t("Haritada ara")} />
                  </span>
                  {view === "network" && (
                    <span className="inline-flex items-center gap-0.5">
                      <button onClick={() => zoom(0.8)} className="rounded-md p-1 hover:bg-ink-100" aria-label={t("Yakınlaştır")}><Plus className="h-3.5 w-3.5" /></button>
                      <button onClick={() => zoom(1.25)} className="rounded-md p-1 hover:bg-ink-100" aria-label={t("Uzaklaştır")}><Minus className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setVb({ x: 0, y: 0, w: W, h: H })} className="rounded-md p-1 hover:bg-ink-100" aria-label={t("Görünümü sıfırla")}><RotateCcw className="h-3.5 w-3.5" /></button>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <button onClick={() => exportSvg("png")} className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-ink-100"><Download className="h-3.5 w-3.5" /> PNG</button>
                    <button onClick={() => exportSvg("svg")} className="rounded-md px-1.5 py-1 hover:bg-ink-100">SVG</button>
                  </span>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
                  <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
                    <svg ref={svgRef} viewBox={view === "network" ? `${vb.x} ${vb.y} ${vb.w} ${vb.h}` : `0 0 ${W} ${H}`} className="h-auto w-full touch-none select-none" role="img" aria-label={view === "network" ? t("Literatür ağı") : t("Zaman çizelgesi")}
                      onWheel={view === "network" ? onWheel : undefined} onPointerDown={view === "network" ? onDown : undefined} onPointerMove={view === "network" ? onMove : undefined} onPointerUp={onUp} onPointerLeave={onUp}>
                      <defs><marker id="lm-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="rgb(148 155 180)" /></marker></defs>
                      {view === "network" ? (
                        <>{edgeEls(pos, edges)}{nodeEls(pos, true)}</>
                      ) : tl && (
                        <>
                          {tl.lanes.map((l) => (
                            <g key={l.cluster}>
                              <line x1={40} x2={W - 20} y1={l.y} y2={l.y} stroke="rgb(230 232 240)" />
                              <text x={42} y={l.y - 8} fontSize="10" fill={clusterColor(l.cluster)} fontWeight={600}>{clusterName(l.cluster).slice(0, 40)}</text>
                            </g>
                          ))}
                          {tl.years.map((y) => { const x = 50 + ((y - minY) / Math.max(1, maxY - minY)) * (W - 100); return <g key={y}><line x1={x} x2={x} y1={18} y2={H - 26} stroke="rgb(240 241 246)" /><text x={x} y={H - 10} fontSize="10" textAnchor="middle" fill="rgb(120 128 160)">{y}</text></g>; })}
                          {edgeEls(tl.pos, edges.filter((e) => (e.kind ?? "cites") === "cites"))}
                          {nodeEls(tl.pos, false)}
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="space-y-3 text-[13px]">
                    {node ? (
                      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-3">
                        <p className="font-medium text-ink-900">{node.title}</p>
                        <p className="text-ink-500">{node.year ?? "—"} · {t("Toplam atıf: {n}", { n: node.citedByCount.toLocaleString(dl) })}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-ink-600"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: clusterColor(node.cluster) }} />{clusterName(node.cluster)}</p>
                        {node.topic && <p className="text-[12px] text-ink-500">{t("Konu:")} {node.topic.name}{node.topic.subfield ? ` · ${node.topic.subfield}` : ""}</p>}
                        <p className="mt-1 text-ink-600">{t("Çalışmanızdaki {a} kaynaktan atıf alıyor, {b} kaynağa atıf yapıyor.", { a: node.inDegree, b: node.outDegree })}</p>
                        {node.bridge && <p className="mt-1 text-[12px] text-brand-700">{t("Köprü kaynak: farklı kümeleri birbirine bağlıyor.")}</p>}
                        {citedSourceIds && <p className={cn("mt-1 text-[12px]", cited.has(node.sourceId) ? "text-emerald-700" : "text-amber-700")}>{cited.has(node.sourceId) ? t("Metninizde atıf yapılmış.") : t("Kaynaklarınızda var ama metinde henüz atıf yapılmamış.")}</p>}
                        <a href={`https://openalex.org/${node.id}`} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-brand-700 hover:underline">OpenAlex <ExternalLink className="h-3 w-3" /></a>
                      </div>
                    ) : <p className="rounded-2xl bg-ink-50 p-3 text-ink-600">{t("Ayrıntı için bir daireye tıklayın. Ctrl/⌘ + tekerlek ile yakınlaştırın, boş alanı sürükleyerek kaydırın.")}</p>}
                    {colorBy === "cluster" && clusters.length > 0 && (
                      <div className="space-y-1.5 rounded-2xl border border-ink-100 p-3">
                        <p className="text-[12px] font-semibold text-ink-800">{t("Kümeler")}</p>
                        {clusters.map((c) => (
                          <p key={c.id} className="flex items-start gap-2 text-[12px] text-ink-600">
                            <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: clusterColor(c.id) }} />
                            <span className="min-w-0"><span className="font-medium text-ink-800">{c.label || t("Küme {n}", { n: c.id })}</span> · {t("{n} kaynak", { n: c.size })}{c.years[0] ? ` · ${c.years[0]}–${c.years[1]}` : ""}</span>
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-[11.5px] leading-relaxed text-ink-400">{t("Daire büyüklüğü: çalışma içi atıf ve bağ sayısı. Ortası beyaz nokta: köprü kaynak.")}{citedSourceIds ? ` ${t("Kesikli halka: metinde henüz atıf yapılmamış kaynak.")}` : ""}</p>
                    {data.cachedAt && <p className="text-[11.5px] text-ink-400">{t("Oluşturulma: {d}", { d: new Date(data.cachedAt).toLocaleString(dl) })}</p>}
                  </div>
                </div>
              </>
            )}

            {view === "topics" && (
              topics.length === 0 ? <p className="rounded-xl bg-ink-50 p-3 text-[13px] text-ink-600">{t("Kaynaklarınız için konu bilgisi bulunamadı.")}</p> : (
                <div className="space-y-3">
                  <p className="text-[12.5px] text-ink-500">{t("OpenAlex konu sınıflamasına göre kaynaklarınız (mavi) ve ilgili literatür (sarı: önerilen ve kaynaklarınıza atıf yapan yayınlar). Sarı çubuğu olup mavisi olmayan konular, çalışmanızda eksik kalmış olabilir.")}</p>
                  {[...new Set(topics.map((r) => r.subfield))].map((sf) => {
                    const rows = topics.filter((r) => r.subfield === sf);
                    const max = Math.max(...topics.map((r) => Math.max(r.mine, r.related)), 1);
                    return (
                      <div key={sf} className="rounded-2xl border border-ink-100 p-3">
                        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-500">{sf}{rows[0]?.field && rows[0].field !== "—" ? ` · ${rows[0].field}` : ""}</p>
                        <div className="space-y-1.5">
                          {rows.map((r) => (
                            <div key={r.topic} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 text-[12.5px]">
                              <span className="truncate text-ink-800" title={r.topic}>{r.topic}{!r.mine && r.related >= 2 && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 text-[10.5px] font-medium text-amber-800">{t("eksik olabilir")}</span>}</span>
                              <span className="space-y-0.5">
                                <span className="flex items-center gap-1.5"><span className="h-2 rounded-full bg-brand-600" style={{ width: `${(r.mine / max) * 100}%`, minWidth: r.mine ? 4 : 0 }} /><span className="tabular-nums text-ink-500">{r.mine}</span></span>
                                <span className="flex items-center gap-1.5"><span className="h-2 rounded-full bg-amber-400" style={{ width: `${(r.related / max) * 100}%`, minWidth: r.related ? 4 : 0 }} /><span className="tabular-nums text-ink-400">{r.related}</span></span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {(view === "missing" || view === "new") && (() => {
              const list = view === "missing" ? data.suggestions : newWorks;
              return (
                <div>
                  <p className="text-[12.5px] text-ink-500">{view === "missing" ? t("Kaynaklarınızdan en az ikisinin atıf yaptığı ama çalışmanızda olmayan yayınlar. Alanınızın temel çalışmaları olabilir; okuyup uygunsa ekleyin.") : t("Son 6 yılda yayımlanmış ve kaynaklarınızın en az ikisine atıf yapan yayınlar. Literatürünüzün güncel devamını gösterir; okuyup uygunsa ekleyin.")}</p>
                  {list.length === 0 ? <p className="mt-2 rounded-xl bg-ink-50 p-3 text-[13px] text-ink-600">{view === "missing" ? t("Şu an önerilecek ortak atıf bulunamadı. Daha çok DOI’li kaynak ekledikçe öneriler belirginleşir.") : t("Kaynaklarınızın en az ikisine birlikte atıf yapan yeni yayın bulunamadı.")}</p> : (
                    <ul className="mt-2 max-h-[46vh] space-y-2 overflow-y-auto pr-1">
                      {list.map((r: any) => (
                        <li key={r.openalexId ?? r.title} className="flex items-start gap-3 rounded-xl border border-ink-100 p-3">
                          <span className="mt-0.5 shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11.5px] font-semibold text-brand-700">{view === "missing" ? t("{n} kaynağınız atıf yapıyor", { n: r.refCount }) : t("{n} kaynağınıza atıf yapıyor", { n: r.citesMine })}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-ink-900">{r.title}</span>
                            <span className="block text-[12px] text-ink-500">{[(r.authors ?? []).slice(0, 2).map((a: any) => a.family ?? a.literal).filter(Boolean).join(", "), r.year, r.containerTitle].filter(Boolean).join(" · ")}{r.citedByCount ? ` · ${t("Toplam atıf: {n}", { n: Number(r.citedByCount).toLocaleString(dl) })}` : ""}</span>
                            {r.topic?.name && <span className="mt-0.5 block text-[11.5px] text-ink-400">{t("Konu:")} {r.topic.name}</span>}
                          </span>
                          {added.has(r.openalexId ?? r.title) ? <span className="text-[12px] text-emerald-700">{t("Eklendi")}</span> : <Button size="sm" variant="secondary" onClick={() => add(r)}><Plus className="h-3.5 w-3.5" /> {t("Ekle")}</Button>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
