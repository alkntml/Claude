/**
 * APA 7 tarzı grafik çizimi (SVG metni). Siyah-beyaz/gri tonlar, eksen başlıkları, ızgara yok,
 * şekil başlığı görselin içinde değil, belgede ayrı satırdadır. Saf fonksiyon: tarayıcıda PNG'ye çevrilir.
 */
import type { ChartData } from "@/lib/stats/charts";

const FONT = "'Times New Roman', Times, 'Liberation Serif', serif";
const FILLS = ["#bdbdbd", "#525252", "#ffffff", "#8c8c8c", "#e0e0e0", "#2b2b2b", "#a6a6a6", "#6b6b6b"];
const DASH = ["", "8 5", "2 4", "12 4 2 4", "4 3", "1 3", "10 3 3 3", ""];
const MARK = ["circle", "square", "triangle", "diamond", "circle-open", "square-open", "triangle-open", "diamond-open"] as const;

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Okunaklı eksen işaretleri (1, 2, 2.5, 5 × 10^k adımları) */
export function niceTicks(min: number, max: number, target = 5, minStep = 0): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) { min -= 1; max += 1; }
  const raw = (max - min) / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(minStep, [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw);
  const start = Math.floor(min / step + 1e-9) * step;
  const end = Math.ceil(max / step - 1e-9) * step;
  const out: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) out.push(+v.toPrecision(12));
  return out;
}

function fmt(v: number, locale: "tr" | "en"): string {
  const abs = Math.abs(v);
  const d = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const str = d > 0 ? v.toFixed(d).replace(/\.?0+$/, "") : v.toFixed(0);
  return locale === "tr" ? str.replace(".", ",") : str;
}

/** Kaba metin genişliği tahmini (DOM olmadan yerleşim için) */
const textW = (s: string, size: number) => s.length * size * 0.52;

function marker(kind: (typeof MARK)[number], x: number, y: number, r = 5): string {
  const open = kind.endsWith("-open");
  const fill = open ? "#fff" : "#000";
  const k = kind.replace("-open", "");
  if (k === "square") return `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" fill="${fill}" stroke="#000" stroke-width="1.4"/>`;
  if (k === "triangle") return `<path d="M${x},${y - r * 1.15} L${x + r * 1.1},${y + r * 0.8} L${x - r * 1.1},${y + r * 0.8} Z" fill="${fill}" stroke="#000" stroke-width="1.4"/>`;
  if (k === "diamond") return `<path d="M${x},${y - r * 1.25} L${x + r * 1.1},${y} L${x},${y + r * 1.25} L${x - r * 1.1},${y} Z" fill="${fill}" stroke="#000" stroke-width="1.4"/>`;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#000" stroke-width="1.4"/>`;
}

export function renderChartSvg(d: ChartData, opts: { width?: number; height?: number; locale?: "tr" | "en" } = {}): string {
  const W = opts.width ?? 900, H = opts.height ?? 560, loc = opts.locale ?? "tr";
  const fs = 17;
  const multi = d.series.length > 1;
  const legendW = multi ? Math.min(280, 52 + Math.max(...d.series.map((s) => textW(s.name, fs)))) : 0;

  // Y aralığı
  let yMin = 0, yMax = 1;
  let xMin = 0, xMax = 1;
  if (d.kind === "bar" || d.kind === "line") {
    const hi = d.series.flatMap((s) => s.values.map((v, i) => v + (s.errors?.[i] ?? 0)));
    const lo = d.series.flatMap((s) => s.values.map((v, i) => v - (s.errors?.[i] ?? 0)));
    yMax = Math.max(...hi); yMin = d.kind === "bar" ? Math.min(0, ...lo) : Math.min(...lo);
    if (d.kind === "line") { const pad = (yMax - yMin) * 0.1 || 1; yMin -= pad; yMax += pad; }
  } else if (d.kind === "histogram" && d.bins) {
    yMax = Math.max(...d.bins.map((b) => b.count)); xMin = d.bins[0].from; xMax = d.bins[d.bins.length - 1].to;
  } else if (d.kind === "scatter" && d.points) {
    const xs = d.points.map((p) => p[0]), ys = d.points.map((p) => p[1]);
    xMin = Math.min(...xs); xMax = Math.max(...xs); yMin = Math.min(...ys); yMax = Math.max(...ys);
  } else if (d.kind === "box" && d.boxes) {
    yMin = Math.min(...d.boxes.flatMap((b) => [b.min, ...b.outliers])); yMax = Math.max(...d.boxes.flatMap((b) => [b.max, ...b.outliers]));
    const pad = (yMax - yMin) * 0.06 || 1; yMin -= pad; yMax += pad;
  }
  const counts = d.kind === "histogram" || (d.kind === "bar" && d.series.every((x) => !x.errors && x.values.every(Number.isInteger)));
  const yt = niceTicks(yMin, yMax, 5, counts ? 1 : 0);
  const y0 = yt[0], y1 = yt[yt.length - 1];
  const ytLabelW = Math.max(...yt.map((v) => textW(fmt(v, loc), fs)));

  // Kategori etiketleri sığmazsa eğik yazılır
  const cats = d.kind === "bar" || d.kind === "line" || d.kind === "box" ? d.categories : [];
  const L = 34 + ytLabelW + 18, R = 24 + legendW, T = 24;
  const plotW0 = W - L - R;
  const slot = cats.length ? plotW0 / cats.length : plotW0;
  const rotate = cats.some((c) => textW(c, fs) > slot - 8);
  const catH = rotate ? Math.min(140, 16 + Math.max(...cats.map((c) => textW(c, fs))) * 0.7) : fs + 14;
  const B = 30 + catH + fs + 8;
  const pw = W - L - R, ph = H - T - B;
  const sy = (v: number) => T + ph - ((v - y0) / (y1 - y0 || 1)) * ph;

  const out: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${esc(FONT)}" font-size="${fs}">`, `<rect width="${W}" height="${H}" fill="#fff"/>`];
  // Y ekseni
  out.push(`<line x1="${L}" y1="${T}" x2="${L}" y2="${T + ph}" stroke="#000" stroke-width="1.4"/>`);
  for (const v of yt) out.push(`<line x1="${L - 6}" y1="${sy(v)}" x2="${L}" y2="${sy(v)}" stroke="#000" stroke-width="1.2"/><text x="${L - 10}" y="${sy(v) + fs * 0.35}" text-anchor="end">${esc(fmt(v, loc))}</text>`);
  out.push(`<text transform="translate(${20},${T + ph / 2}) rotate(-90)" text-anchor="middle" font-size="${fs + 1}">${esc(d.yLabel)}</text>`);
  // X ekseni
  const baseY = d.kind === "bar" ? sy(Math.max(y0, Math.min(0, y1))) : T + ph;
  out.push(`<line x1="${L}" y1="${T + ph}" x2="${L + pw}" y2="${T + ph}" stroke="#000" stroke-width="1.4"/>`);
  if (d.xLabel) out.push(`<text x="${L + pw / 2}" y="${H - 14}" text-anchor="middle" font-size="${fs + 1}">${esc(d.xLabel)}</text>`);

  const catLabel = (c: string, x: number) => rotate
    ? `<text transform="translate(${x},${T + ph + 14}) rotate(-35)" text-anchor="end">${esc(c)}</text>`
    : `<text x="${x}" y="${T + ph + fs + 8}" text-anchor="middle">${esc(c)}</text>`;
  const errBar = (x: number, v: number, e: number) => e > 0 ? `<line x1="${x}" y1="${sy(v - e)}" x2="${x}" y2="${sy(v + e)}" stroke="#000" stroke-width="1.4"/><line x1="${x - 7}" y1="${sy(v - e)}" x2="${x + 7}" y2="${sy(v - e)}" stroke="#000" stroke-width="1.4"/><line x1="${x - 7}" y1="${sy(v + e)}" x2="${x + 7}" y2="${sy(v + e)}" stroke="#000" stroke-width="1.4"/>` : "";

  if (d.kind === "bar") {
    const k = d.series.length, groupW = slot * 0.7, barW = groupW / k;
    cats.forEach((c, i) => {
      const gx = L + slot * i + (slot - groupW) / 2;
      d.series.forEach((s, j) => {
        const v = s.values[i]; if (!Number.isFinite(v)) return;
        const x = gx + barW * j, top = Math.min(sy(v), baseY), h = Math.abs(sy(v) - baseY);
        out.push(`<rect x="${x + 1}" y="${top}" width="${barW - 2}" height="${h}" fill="${FILLS[j % FILLS.length]}" stroke="#000" stroke-width="1.2"/>`);
        out.push(errBar(x + barW / 2, v, s.errors?.[i] ?? 0));
      });
      out.push(catLabel(c, L + slot * i + slot / 2));
    });
  } else if (d.kind === "line") {
    d.series.forEach((s, j) => {
      const pts = s.values.map((v, i) => [L + slot * i + slot / 2, sy(v)] as const);
      out.push(`<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#000" stroke-width="2"${DASH[j % DASH.length] ? ` stroke-dasharray="${DASH[j % DASH.length]}"` : ""}/>`);
      s.values.forEach((v, i) => out.push(errBar(pts[i][0] + (j - (d.series.length - 1) / 2) * 6, v, s.errors?.[i] ?? 0)));
      pts.forEach((p) => out.push(marker(MARK[j % MARK.length], p[0], p[1])));
    });
    cats.forEach((c, i) => out.push(catLabel(c, L + slot * i + slot / 2)));
  } else if (d.kind === "histogram" && d.bins) {
    const sx = (v: number) => L + ((v - xMin) / (xMax - xMin || 1)) * pw;
    for (const b of d.bins) out.push(`<rect x="${sx(b.from)}" y="${sy(b.count)}" width="${Math.max(0, sx(b.to) - sx(b.from))}" height="${T + ph - sy(b.count)}" fill="${FILLS[0]}" stroke="#000" stroke-width="1.2"/>`);
    for (const v of niceTicks(xMin, xMax, 8).filter((v) => v >= xMin - 1e-9 && v <= xMax + 1e-9)) out.push(`<line x1="${sx(v)}" y1="${T + ph}" x2="${sx(v)}" y2="${T + ph + 6}" stroke="#000" stroke-width="1.2"/><text x="${sx(v)}" y="${T + ph + fs + 8}" text-anchor="middle">${esc(fmt(v, loc))}</text>`);
  } else if (d.kind === "scatter" && d.points) {
    const xt = niceTicks(xMin, xMax, 6);
    const x0 = xt[0], x1 = xt[xt.length - 1];
    const sx = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * pw;
    for (const v of xt) out.push(`<line x1="${sx(v)}" y1="${T + ph}" x2="${sx(v)}" y2="${T + ph + 6}" stroke="#000" stroke-width="1.2"/><text x="${sx(v)}" y="${T + ph + fs + 8}" text-anchor="middle">${esc(fmt(v, loc))}</text>`);
    const r = d.points.length > 500 ? 2.5 : 4;
    for (const [x, y] of d.points) out.push(`<circle cx="${sx(x).toFixed(1)}" cy="${sy(y).toFixed(1)}" r="${r}" fill="none" stroke="#000" stroke-width="1.1"/>`);
    if (d.fit) out.push(`<line x1="${sx(x0)}" y1="${sy(d.fit.a + d.fit.b * x0)}" x2="${sx(x1)}" y2="${sy(d.fit.a + d.fit.b * x1)}" stroke="#000" stroke-width="2"/>`);
  } else if (d.kind === "box" && d.boxes) {
    d.boxes.forEach((b, i) => {
      const cx = L + slot * i + slot / 2, bw = Math.min(90, slot * 0.5);
      out.push(`<line x1="${cx}" y1="${sy(b.min)}" x2="${cx}" y2="${sy(b.q1)}" stroke="#000" stroke-width="1.3"/><line x1="${cx}" y1="${sy(b.q3)}" x2="${cx}" y2="${sy(b.max)}" stroke="#000" stroke-width="1.3"/>`);
      out.push(`<line x1="${cx - bw / 4}" y1="${sy(b.min)}" x2="${cx + bw / 4}" y2="${sy(b.min)}" stroke="#000" stroke-width="1.3"/><line x1="${cx - bw / 4}" y1="${sy(b.max)}" x2="${cx + bw / 4}" y2="${sy(b.max)}" stroke="#000" stroke-width="1.3"/>`);
      out.push(`<rect x="${cx - bw / 2}" y="${sy(b.q3)}" width="${bw}" height="${Math.max(1, sy(b.q1) - sy(b.q3))}" fill="${FILLS[0]}" stroke="#000" stroke-width="1.3"/><line x1="${cx - bw / 2}" y1="${sy(b.median)}" x2="${cx + bw / 2}" y2="${sy(b.median)}" stroke="#000" stroke-width="2.4"/>`);
      for (const o of b.outliers) out.push(`<circle cx="${cx}" cy="${sy(o)}" r="3.5" fill="none" stroke="#000" stroke-width="1.1"/>`);
      out.push(catLabel(b.name, cx));
    });
  }

  // Açıklama (lejant) — birden çok seri varsa sağda
  if (multi) {
    const lx = W - legendW + 4;
    d.series.forEach((s, j) => {
      const ly = T + 10 + j * (fs + 12);
      if (d.kind === "line") out.push(`<line x1="${lx}" y1="${ly}" x2="${lx + 26}" y2="${ly}" stroke="#000" stroke-width="2"${DASH[j % DASH.length] ? ` stroke-dasharray="${DASH[j % DASH.length]}"` : ""}/>${marker(MARK[j % MARK.length], lx + 13, ly, 4.5)}`);
      else out.push(`<rect x="${lx}" y="${ly - 8}" width="22" height="16" fill="${FILLS[j % FILLS.length]}" stroke="#000" stroke-width="1.2"/>`);
      out.push(`<text x="${lx + 34}" y="${ly + fs * 0.35}">${esc(s.name)}</text>`);
    });
  }
  out.push("</svg>");
  return out.join("");
}
