import type { Usage } from "./types";

/** Saf maliyet hesabı (D78): önbellekten okuma girdi fiyatının %10’u, önbelleğe yazma %125’i */
export function costFor(price: { in: number; out: number } | undefined, input: number, output: number, cache?: Pick<Usage, "cacheRead" | "cacheWrite">) {
  if (!price) return 0;
  const read = Math.max(0, cache?.cacheRead ?? 0), write = Math.max(0, cache?.cacheWrite ?? 0);
  const plain = Math.max(0, input - read - write);
  return ((plain + read * 0.1 + write * 1.25) * price.in + output * price.out) / 1_000_000;
}
