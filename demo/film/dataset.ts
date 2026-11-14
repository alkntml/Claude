/**
 * Film (D194): örnek tezin KURGUSAL veri seti — 384 üniversite öğrencisi. Sabit tohumlu üreteçle her seferinde aynı.
 * Değişkenler: Cinsiyet, Sınıf, Ekran süresi (saat), B1–B10 (akıllı telefon bağımlılığı, 1–6), E1–E5 (akademik erteleme, 1–5),
 * ölçek puanları (madde ortalaması) ve PUKİ (Pittsburgh Uyku Kalitesi İndeksi küresel puanı, 0–21; yüksek = kötü uyku).
 */
export const FILM_VARS = {
  g: "Cinsiyet", f: "Kadın", m: "Erkek", cls: "Sınıf", screen: "Ekran süresi (saat)",
  dep: "Akıllı telefon bağımlılığı", proc: "Akademik erteleme", sleep: "Uyku kalitesi (PUKİ)",
} as const;

export function filmDataset(): string[][] {
  const V = FILM_VARS;
  let seed = 20261114;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const norm = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
  const B = Array.from({ length: 10 }, (_, i) => `B${i + 1}`), E = Array.from({ length: 5 }, (_, i) => `E${i + 1}`);
  const rows: string[][] = [[V.g, V.cls, V.screen, ...B, ...E, V.dep, V.proc, V.sleep]];
  for (let i = 0; i < 384; i++) {
    const female = i % 7 < 4;
    const cls = 1 + (i % 4);
    const screen = clamp(Math.round((5.1 + 1.8 * norm() + (female ? 0.25 : -0.2)) * 2) / 2, 1, 12);
    const depLatent = 0.42 * (screen - 5.1) + 0.85 * norm() + (female ? 0.18 : 0);
    const bItems = B.map(() => clamp(Math.round(3.1 + 0.9 * depLatent + 0.95 * norm()), 1, 6));
    const dep = bItems.reduce((a, b) => a + b, 0) / bItems.length;
    const procLatent = 0.48 * (dep - 3.1) + 0.8 * norm() - (cls === 4 ? 0.35 : cls === 1 ? -0.1 : 0);
    const eItems = E.map(() => clamp(Math.round(3 + 0.85 * procLatent + 0.55 * norm()), 1, 5));
    const proc = eItems.reduce((a, b) => a + b, 0) / eItems.length;
    const sleep = clamp(Math.round(6.2 + 1.05 * (dep - 3.1) + 0.95 * (proc - 3) + 0.15 * (screen - 5.1) + 2.4 * norm()), 0, 21);
    rows.push([female ? V.f : V.m, `${cls}. sınıf`, String(screen), ...bItems.map(String), ...eItems.map(String), dep.toFixed(2), proc.toFixed(2), String(sleep)]);
  }
  return rows;
}

export const toCsv = (rows: string[][]) => rows.map((r) => r.map((c) => (/[",;\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
