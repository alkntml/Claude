"use client";
/**
 * Grafik seti (D90): çizgi/alan zaman serisi, yatay çubuk listesi, halka ve kıvılcım grafikli gösterge kutusu.
 * Kurallar: tek eksen; kategorik renkler sabit sırada (--viz-1…5); 2px çizgi, ~%10 alan dolgusu; ince yatay
 * kılavuz çizgileri; ≥2 seride gösterge; değerler her zaman yazıyla da görünür; üzerine gelince ayrıntı.
 */
import { useMemo, useState } from "react";
import { cn } from "./cn";

export const VIZ = ["rgb(var(--viz-1))", "rgb(var(--viz-2))", "rgb(var(--viz-3))", "rgb(var(--viz-4))", "rgb(var(--viz-5))"];
const GRID = "rgb(var(--ink-100))";
const AXIS = "rgb(var(--ink-400))";
const fmtDefault = (v: number) => v.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

function dayLabel(day: string) {
  const d = new Date(`${day}T00:00:00`);
  return Number.isNaN(d.getTime()) ? day : d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export interface Series { key: string; label: string }

/** Günlük zaman serisi: tek seride alan, birden çok seride çizgiler; artı imleçli ipucu */
export function TimeSeries({ data, series, title, subtitle, format = fmtDefault, height = 200, empty = "Bu dönemde veri yok." }: {
  data: { day: string; [k: string]: number | string }[];
  series: Series[];
  title: string;
  subtitle?: string;
  format?: (v: number) => string;
  height?: number;
  empty?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = height, P = { l: 44, r: 12, t: 12, b: 24 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const vals = (k: string) => data.map((d) => Number(d[k]) || 0);
  const max = niceMax(Math.max(0, ...series.flatMap((s) => vals(s.key))));
  const x = (i: number) => P.l + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => P.t + ih - (v / max) * ih;
  const single = series.length === 1;
  const step = Math.max(1, Math.ceil(data.length / 6));
  const totals = series.map((s) => vals(s.key).reduce((a, b) => a + b, 0));
  return (
    <figure className="relative">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span>
          <span className="block text-sm font-semibold text-ink-900">{title}</span>
          {subtitle && <span className="block text-xs text-ink-500">{subtitle}</span>}
        </span>
        {!single && (
          <span className="flex flex-wrap gap-3 text-xs text-ink-600">
            {series.map((s, k) => <span key={s.key} className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm" style={{ background: VIZ[k] }} />{s.label} <b className="font-semibold text-ink-900">{format(totals[k])}</b></span>)}
          </span>
        )}
      </figcaption>
      {data.length === 0 ? <p className="py-12 text-center text-sm text-ink-400">{empty}</p> : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label={title}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const i = data.length <= 1 ? 0 : Math.round(((px - P.l) / iw) * (data.length - 1));
            setHover(Math.max(0, Math.min(data.length - 1, i)));
          }}>
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line x1={P.l} x2={W - P.r} y1={y(max * f)} y2={y(max * f)} stroke={GRID} strokeWidth={1} />
              <text x={P.l - 8} y={y(max * f) + 3.5} textAnchor="end" fontSize="10.5" fill={AXIS}>{format(max * f)}</text>
            </g>
          ))}
          {data.map((d, i) => (i % step === 0 || i === data.length - 1) && (
            <text key={d.day} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10.5" fill={AXIS}>{dayLabel(String(d.day))}</text>
          ))}
          {series.map((s, k) => {
            const v = vals(s.key);
            const line = v.map((val, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(val).toFixed(1)}`).join(" ");
            return (
              <g key={s.key}>
                {single && <path d={`${line} L${x(v.length - 1)},${P.t + ih} L${x(0)},${P.t + ih} Z`} fill={VIZ[k]} opacity={0.1} />}
                <path d={line} fill="none" stroke={VIZ[k]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                {data.length === 1 && <circle cx={x(0)} cy={y(v[0])} r={4} fill={VIZ[k]} />}
              </g>
            );
          })}
          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={P.t + ih} stroke="rgb(var(--ink-300))" strokeWidth={1} />
              {series.map((s, k) => <circle key={s.key} cx={x(hover)} cy={y(Number(data[hover][s.key]) || 0)} r={4.5} fill={VIZ[k]} stroke="rgb(var(--surface))" strokeWidth={2} />)}
            </g>
          )}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 min-w-[140px] rounded-xl border border-ink-100 bg-white px-3 py-2 text-xs shadow-lg">
          <p className="mb-1 font-medium text-ink-500">{new Date(`${data[hover].day}T00:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" })}</p>
          {series.map((s, k) => (
            <p key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-ink-600">{!single && <span className="h-2 w-2 rounded-full" style={{ background: VIZ[k] }} />}{s.label}</span>
              <b className="text-ink-900">{format(Number(data[hover][s.key]) || 0)}</b>
            </p>
          ))}
        </div>
      )}
    </figure>
  );
}

/** Sıralı yatay çubuk listesi (ör. özelliğe göre maliyet, en çok ziyaret edilen sayfalar) */
export function BarList({ items, title, subtitle, format = fmtDefault, limit = 10, empty = "Veri yok.", color = 0 }: {
  items: { label: string; value: number; sub?: string }[];
  title: string;
  subtitle?: string;
  format?: (v: number) => string;
  limit?: number;
  empty?: string;
  color?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => b.value - a.value), [items]);
  const shown = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((a, b) => a + b.value, 0);
  const list = rest > 0 ? [...shown, { label: "Diğer", value: rest, sub: `${sorted.length - limit} kalem` }] : shown;
  const max = Math.max(1e-9, ...list.map((i) => i.value));
  const total = sorted.reduce((a, b) => a + b.value, 0);
  return (
    <figure>
      <figcaption className="mb-3">
        <span className="block text-sm font-semibold text-ink-900">{title}</span>
        {subtitle && <span className="block text-xs text-ink-500">{subtitle}</span>}
      </figcaption>
      {list.length === 0 || total === 0 ? <p className="py-6 text-center text-sm text-ink-400">{empty}</p> : (
        <ul className="space-y-2.5">
          {list.map((it, i) => (
            <li key={`${it.label}-${i}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="group">
              <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate text-ink-700" title={it.label}>{it.label}{it.sub && <span className="ml-1.5 text-xs text-ink-400">{it.sub}</span>}</span>
                <span className="shrink-0 tabular-nums text-ink-900"><b className="font-semibold">{format(it.value)}</b>{hover === i && <span className="ml-1.5 text-xs text-ink-400">%{Math.round((it.value / total) * 100)}</span>}</span>
              </div>
              <div className="h-2 rounded-full bg-ink-100">
                <div className="h-2 rounded-full transition-all" style={{ width: `${Math.max(1.5, (it.value / max) * 100)}%`, background: VIZ[color], opacity: hover === null || hover === i ? 1 : 0.55 }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

/** Halka grafik: en fazla 5 dilim (fazlası “Diğer”), ortada toplam, yanda değerli gösterge */
export function Donut({ parts, title, subtitle, format = fmtDefault, centerLabel = "Toplam" }: {
  parts: { label: string; value: number }[];
  title: string;
  subtitle?: string;
  format?: (v: number) => string;
  centerLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const sorted = [...parts].filter((p) => p.value > 0).sort((a, b) => b.value - a.value);
  const list = sorted.length > 5 ? [...sorted.slice(0, 4), { label: "Diğer", value: sorted.slice(4).reduce((a, b) => a + b.value, 0) }] : sorted;
  const total = list.reduce((a, b) => a + b.value, 0);
  const R = 52, r = 36, C = 64;
  let acc = 0;
  const arcs = list.map((p) => {
    const a0 = (acc / total) * Math.PI * 2, a1 = ((acc + p.value) / total) * Math.PI * 2;
    acc += p.value;
    const gap = list.length > 1 ? 0.025 : 0;
    const s = a0 + gap, e = Math.max(s + 0.001, a1 - gap);
    const pt = (rad: number, ang: number) => `${C + rad * Math.sin(ang)},${C - rad * Math.cos(ang)}`;
    const large = e - s > Math.PI ? 1 : 0;
    return list.length === 1
      ? `M${C},${C - R} A${R},${R} 0 1 1 ${C - 0.01},${C - R} L${C - 0.01},${C - r} A${r},${r} 0 1 0 ${C},${C - r} Z`
      : `M${pt(R, s)} A${R},${R} 0 ${large} 1 ${pt(R, e)} L${pt(r, e)} A${r},${r} 0 ${large} 0 ${pt(r, s)} Z`;
  });
  return (
    <figure>
      <figcaption className="mb-3">
        <span className="block text-sm font-semibold text-ink-900">{title}</span>
        {subtitle && <span className="block text-xs text-ink-500">{subtitle}</span>}
      </figcaption>
      {total === 0 ? <p className="py-6 text-center text-sm text-ink-400">Veri yok.</p> : (
        <div className="flex flex-wrap items-center gap-5">
          <svg viewBox="0 0 128 128" className="h-32 w-32 shrink-0" role="img" aria-label={title}>
            {arcs.map((d, i) => <path key={i} d={d} fill={VIZ[i]} opacity={hover === null || hover === i ? 1 : 0.35} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />)}
            <text x={C} y={C - 2} textAnchor="middle" fontSize="15" fontWeight="600" fill="rgb(var(--ink-900))">{format(hover === null ? total : list[hover].value)}</text>
            <text x={C} y={C + 13} textAnchor="middle" fontSize="8.5" fill={AXIS}>{hover === null ? centerLabel : `%${Math.round((list[hover].value / total) * 100)}`}</text>
          </svg>
          <ul className="min-w-[140px] flex-1 space-y-1.5 text-[13px]">
            {list.map((p, i) => (
              <li key={p.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={cn("flex items-center justify-between gap-3 rounded-lg px-1.5 py-0.5", hover === i && "bg-ink-50")}>
                <span className="flex min-w-0 items-center gap-2 text-ink-700"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: VIZ[i] }} /><span className="truncate">{p.label}</span></span>
                <span className="shrink-0 tabular-nums"><b className="font-semibold text-ink-900">{format(p.value)}</b> <span className="text-xs text-ink-400">%{Math.round((p.value / total) * 100)}</span></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}

/** Gösterge kutusu: büyük değer, açıklama ve isteğe bağlı kıvılcım (son günlerin eğilimi) */
export function StatTile({ label, value, sub, spark, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; spark?: number[]; tone?: "good" | "bad" }) {
  const W = 96, H = 28;
  const max = Math.max(1e-9, ...(spark ?? [0]));
  const pts = (spark ?? []).map((v, i, a) => `${(a.length <= 1 ? W / 2 : (i / (a.length - 1)) * W).toFixed(1)},${(H - 2 - (v / max) * (H - 4)).toFixed(1)}`);
  return (
    <div className="card flex flex-col justify-between gap-2 p-4">
      <p className="text-[12.5px] font-medium text-ink-500">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className={cn("truncate text-[26px] font-semibold leading-none tracking-tight", tone === "bad" ? "text-rose-600" : "text-ink-950")}>{value}</p>
          {sub && <p className="mt-1.5 truncate text-xs text-ink-400">{sub}</p>}
        </div>
        {pts.length > 1 && (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-7 w-24 shrink-0" aria-hidden="true">
            <path d={`M${pts.join(" L")} L${W},${H} L0,${H} Z`} fill={VIZ[0]} opacity={0.1} />
            <path d={`M${pts.join(" L")}`} fill="none" stroke={VIZ[0]} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

/** Dönem seçici (grafiklerin üstünde tek satır) */
export function RangePicker({ value, onChange, options = [7, 30, 90] }: { value: number; onChange: (v: number) => void; options?: number[] }) {
  return (
    <div className="inline-flex rounded-xl bg-ink-100 p-0.5" role="tablist" aria-label="Dönem">
      {options.map((n) => (
        <button key={n} role="tab" aria-selected={value === n} onClick={() => onChange(n)} className={cn("rounded-[10px] px-3 py-1 text-[13px] font-medium transition", value === n ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800")}>{n} gün</button>
      ))}
    </div>
  );
}
