"use client";
/**
 * Literatür haritası (D123): kaynaklarınızın birbirine atıf ağı ve kaynaklarınızın ortak atıf yaptığı ama çalışmanızda
 * olmayan temel çalışmalar. Düğüm boyutu: çalışma içinden aldığı atıf; renk: yayın yılı (açık = eski, koyu = yeni).
 */
import { Loader2, Network, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { layout, type MapEdge, type MapNode } from "@/lib/litmap-graph";
import { toSourceInput } from "@/lib/sources/to-input";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MapData { nodes: MapNode[]; edges: MapEdge[]; suggestions: any[]; mapped: number; unmapped: number; isolated: number; cachedAt?: number }
const W = 760, H = 460;

export function LitMapModal({ open, onClose, projectId, sourceCount, onSourcesAdded }: { open: boolean; onClose: () => void; projectId: string; sourceCount: number; onSourcesAdded: (rows: any[]) => void }) {
  const { t, dl } = useT();
  const toast = useToast();
  const [data, setData] = useState<MapData | null>(null);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const load = useCallback(async (refresh = false) => {
    setBusy(true);
    try { setData(await api<MapData>(`/api/projects/${projectId}/litmap`, { method: "POST", json: { refresh } })); }
    catch (e) { toast({ tone: "error", title: t("Harita oluşturulamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }, [projectId, toast, t]);
  useEffect(() => { if (open && sourceCount > 0) load(); }, [open, sourceCount, load]);

  const pos = useMemo(() => (data ? layout(data.nodes, data.edges, W, H) : {}), [data]);
  const years = (data?.nodes ?? []).map((n) => n.year).filter((y): y is number => !!y);
  const [minY, maxY] = [Math.min(...years, 2000), Math.max(...years, 2025)];
  const color = (y: number | null) => { const f = y ? (y - minY) / Math.max(1, maxY - minY) : 0.5; return `rgb(${Math.round(190 - 150 * f)} ${Math.round(205 - 140 * f)} ${Math.round(250 - 30 * f)})`; };
  const node = data?.nodes.find((n) => n.id === sel) ?? null;
  const top = [...(data?.nodes ?? [])].sort((a, b) => b.inDegree - a.inDegree)[0];

  async function add(r: any) {
    try {
      const { sources } = await api<{ sources: any[] }>(`/api/projects/${projectId}/sources`, { method: "POST", json: { sources: [toSourceInput(r)] } });
      onSourcesAdded(sources); setAdded((s) => new Set(s).add(r.openalexId ?? r.title));
      toast({ tone: "success", title: t("Kaynaklara eklendi") });
    } catch (e) { toast({ tone: "error", title: t("Eklenemedi"), detail: (e as Error).message }); }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Literatür haritası")} wide>
      <div className="space-y-4">
        <p className="text-[13px] text-ink-600">{t("Kaynaklarınızın birbirine atıf ilişkileri OpenAlex kaynakça kayıtlarından kurulur. Ok, atıf yapan çalışmadan atıf alana doğrudur. Daire büyüdükçe çalışmanızdaki diğer kaynaklardan daha çok atıf alıyor demektir; renk koyulaştıkça yayın yenidir.")}</p>
        {sourceCount === 0 ? <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-600">{t("Harita için önce çalışmanıza DOI’li kaynaklar ekleyin.")}</p> : busy && !data ? (
          <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Kaynakların kaynakçaları okunuyor…")}</p>
        ) : data && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-600">
              <span className="rounded-full bg-ink-100 px-2.5 py-1">{t("Haritadaki kaynak: {n}", { n: data.mapped })}</span>
              <span className="rounded-full bg-ink-100 px-2.5 py-1">{t("Bağlantı: {n}", { n: data.edges.length })}</span>
              {data.unmapped > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{t("DOI’siz veya bulunamayan: {n}", { n: data.unmapped })}</span>}
              {data.isolated > 0 && <span className="rounded-full bg-ink-100 px-2.5 py-1">{t("Bağlantısız: {n}", { n: data.isolated })}</span>}
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => load(true)} loading={busy}><RefreshCw className="h-3.5 w-3.5" /> {t("Yenile")}</Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
                <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[520px]" role="img" aria-label={t("Literatür haritası")}>
                  <defs><marker id="lm-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="rgb(148 155 180)" /></marker></defs>
                  {data.edges.map((e, i) => { const a = pos[e.from], b = pos[e.to]; if (!a || !b) return null; return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={sel && (e.from === sel || e.to === sel) ? "rgb(39 71 220)" : "rgb(200 205 220)"} strokeWidth={sel && (e.from === sel || e.to === sel) ? 1.8 : 1} markerEnd="url(#lm-a)" />; })}
                  {data.nodes.map((n) => { const p = pos[n.id]; if (!p) return null; const r = 6 + Math.min(14, n.inDegree * 3); return (
                    <g key={n.id} onClick={() => setSel(n.id === sel ? null : n.id)} className="cursor-pointer">
                      <circle cx={p.x} cy={p.y} r={r} fill={color(n.year)} stroke={n.id === sel ? "rgb(39 71 220)" : "white"} strokeWidth={n.id === sel ? 3 : 1.5}><title>{`${n.title} (${n.year ?? "?"})`}</title></circle>
                      {(n.inDegree >= 2 || n.id === sel) && <text x={p.x + r + 3} y={p.y + 4} fontSize="10" fill="rgb(60 64 80)">{n.title.slice(0, 28)}{n.title.length > 28 ? "…" : ""}</text>}
                    </g>
                  ); })}
                </svg>
              </div>
              <div className="space-y-3 text-[13px]">
                {node ? (
                  <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-3">
                    <p className="font-medium text-ink-900">{node.title}</p>
                    <p className="text-ink-500">{node.year ?? "—"} · {t("Toplam atıf: {n}", { n: node.citedByCount.toLocaleString(dl) })}</p>
                    <p className="mt-1 text-ink-600">{t("Çalışmanızdaki {a} kaynaktan atıf alıyor, {b} kaynağa atıf yapıyor.", { a: node.inDegree, b: node.outDegree })}</p>
                  </div>
                ) : <p className="rounded-2xl bg-ink-50 p-3 text-ink-600">{t("Ayrıntı için bir daireye tıklayın.")}</p>}
                {top && top.inDegree > 0 && <p className="text-ink-600"><b>{t("Merkezi kaynak:")}</b> {top.title} ({t("{n} iç atıf", { n: top.inDegree })})</p>}
                {data.cachedAt && <p className="text-[11.5px] text-ink-400">{t("Oluşturulma: {d}", { d: new Date(data.cachedAt).toLocaleString(dl) })}</p>}
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-ink-900"><Network className="h-4 w-4 text-brand-600" /> {t("Eksik olabilecek temel çalışmalar")}</h3>
              <p className="text-[12.5px] text-ink-500">{t("Kaynaklarınızdan en az ikisinin atıf yaptığı ama çalışmanızda olmayan yayınlar. Alanınızın temel çalışmaları olabilir; okuyup uygunsa ekleyin.")}</p>
              {data.suggestions.length === 0 ? <p className="mt-2 rounded-xl bg-ink-50 p-3 text-[13px] text-ink-600">{t("Şu an önerilecek ortak atıf bulunamadı. Daha çok DOI’li kaynak ekledikçe öneriler belirginleşir.")}</p> : (
                <ul className="mt-2 max-h-[34vh] space-y-2 overflow-y-auto pr-1">
                  {data.suggestions.map((r) => (
                    <li key={r.openalexId ?? r.title} className="flex items-start gap-3 rounded-xl border border-ink-100 p-3">
                      <span className="mt-0.5 shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11.5px] font-semibold text-brand-700">{t("{n} kaynağınız atıf yapıyor", { n: r.refCount })}</span>
                      <span className="min-w-0 flex-1"><span className="block font-medium text-ink-900">{r.title}</span><span className="block text-[12px] text-ink-500">{[(r.authors ?? []).slice(0, 2).map((a: any) => a.family ?? a.literal).filter(Boolean).join(", "), r.year, r.containerTitle].filter(Boolean).join(" · ")}{r.citedByCount ? ` · ${t("Toplam atıf: {n}", { n: Number(r.citedByCount).toLocaleString(dl) })}` : ""}</span></span>
                      {added.has(r.openalexId ?? r.title) ? <span className="text-[12px] text-emerald-700">{t("Eklendi")}</span> : <Button size="sm" variant="secondary" onClick={() => add(r)}><Plus className="h-3.5 w-3.5" /> {t("Ekle")}</Button>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
