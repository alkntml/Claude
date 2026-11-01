"use client";
import { useState } from "react";

/** Tek seriden oluşan günlük çubuk grafik (tek renk, gösterge yok — başlık seriyi adlandırır). */
export function DailyBars({ data, valueKey, label, format = (v: number) => v.toLocaleString("tr-TR") }: { data: { day: string; [k: string]: number | string }[]; valueKey: string; label: string; format?: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 180, P = { l: 36, r: 8, t: 10, b: 22 };
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(1, ...values);
  const nice = Math.ceil(max / Math.pow(10, Math.floor(Math.log10(max)))) * Math.pow(10, Math.floor(Math.log10(max)));
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const bw = data.length ? iw / data.length : 0;
  const ticks = [0, nice / 2, nice];
  return (
    <figure className="relative">
      <figcaption className="mb-2 text-sm font-semibold text-ink-800">{label}</figcaption>
      {data.length === 0 ? <p className="py-10 text-center text-sm text-ink-400">Bu dönemde veri yok.</p> : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => {
            const y = P.t + ih - (t / nice) * ih;
            return <g key={t}><line x1={P.l} x2={W - P.r} y1={y} y2={y} stroke="#eceef6" strokeWidth={1} /><text x={P.l - 6} y={y + 3} textAnchor="end" fontSize="10" fill="#8089b0">{format(t)}</text></g>;
          })}
          {data.map((d, i) => {
            const v = values[i];
            const h = (v / nice) * ih;
            const x = P.l + i * bw + 1;
            const w = Math.max(1, bw - 2);
            const r = Math.min(4, w / 2, h);
            const y = P.t + ih - h;
            return (
              <g key={d.day} onMouseEnter={() => setHover(i)}>
                <rect x={P.l + i * bw} y={P.t} width={bw} height={ih} fill="transparent" />
                {h > 0 && <path d={`M${x},${P.t + ih} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${P.t + ih} Z`} fill="#3a64f2" opacity={hover === null || hover === i ? 1 : 0.45} />}
                {(i === 0 || i === data.length - 1 || i % 7 === 0) && <text x={x + w / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#8089b0">{String(d.day).slice(5)}</text>}
              </g>
            );
          })}
          <line x1={P.l} x2={W - P.r} y1={P.t + ih} y2={P.t + ih} stroke="#d6daea" />
        </svg>
      )}
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute right-2 top-0 rounded-xl border border-ink-100 bg-white px-3 py-1.5 text-xs shadow-lg">
          <span className="text-ink-500">{new Date(String(data[hover].day)).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</span> · <b className="text-ink-900">{format(values[hover])}</b>
        </div>
      )}
    </figure>
  );
}
