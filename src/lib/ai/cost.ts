import type { Usage } from "./types";

/**
 * Model fiyatları (USD / milyon token) ve maliyet hesabı (D78, D94).
 * - Önbellekten okuma modele göre değişir: Opus 5.5’te girdi fiyatının %5’i ($0.20), diğerlerinde %10’u.
 * - Önbelleğe yazma (5 dakikalık) girdi fiyatının %125’i.
 * - Haiku 5.5: istem 100 bin tokeni aşarsa tüm istek $0.50 / $2.50 fiyatından.
 * - Düşünme tokenları çıktı olarak faturalanır (API çıktı sayısına dahil eder).
 * Yönetici ayarındaki fiyat tablosu girdi/çıktı fiyatını geçersiz kılabilir; önbellek ve uzun istem kuralları buradan gelir.
 */
export interface Price {
  in: number;
  out: number;
  /** Önbellekten okuma çarpanı (girdi fiyatına göre); verilmezse 0.1 */
  cacheRead?: number;
  /** Bu tokendan uzun istemlerde uzun istem fiyatı uygulanır */
  longAbove?: number;
  longIn?: number;
  longOut?: number;
}

export const KNOWN_PRICES: Record<string, Price> = {
  "claude-opus-5-5": { in: 4, out: 20, cacheRead: 0.05 },
  "claude-sonnet-5-5": { in: 2, out: 10, cacheRead: 0.1 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5, cacheRead: 0.1, longAbove: 100_000, longIn: 0.5, longOut: 2.5 },
  // Yedek (fallback) veya eski model olarak sunulabilecekler
  "claude-opus-5": { in: 5, out: 25, cacheRead: 0.1 },
  "claude-sonnet-5": { in: 2, out: 10, cacheRead: 0.1 },
  "claude-fable-5-1": { in: 10, out: 50, cacheRead: 0.025 },
  "claude-fable-5": { in: 10, out: 50, cacheRead: 0.1 },
};

export type PriceMatch = "exact" | "alias" | "family" | "unknown";

/**
 * Sunulan modelin fiyatı. Önce tam ad, sonra tarih ekli sürüm (claude-x-YYYYMMDD), sonra aile (opus/sonnet/haiku/fable)
 * aranır. Hiçbiri yoksa maliyet sıfır yazılmaz: bilinen en pahalı fiyat kullanılır (eksik değil fazla tahmin) ve “unknown” döner.
 */
export function resolvePrice(model: string | null | undefined, table: Record<string, Partial<Price>> = {}): { price: Price | undefined; match: PriceMatch } {
  const merged: Record<string, Price> = { ...KNOWN_PRICES };
  for (const [k, v] of Object.entries(table)) {
    if (v && Number.isFinite(Number(v.in)) && Number.isFinite(Number(v.out))) merged[k] = { ...(KNOWN_PRICES[k] ?? {}), ...v, in: Number(v.in), out: Number(v.out) } as Price;
  }
  const m = String(model ?? "").trim();
  if (!m) return { price: undefined, match: "unknown" };
  if (merged[m]) return { price: merged[m], match: "exact" };
  const base = m.replace(/-\d{8}$/, "").replace(/@.*$/, "").replace(/^(anthropic\.|us\.anthropic\.)/, "").replace(/-v\d+(:\d+)?$/, "");
  if (merged[base]) return { price: merged[base], match: "alias" };
  const family = ["opus", "sonnet", "haiku", "fable"].find((f) => base.includes(f));
  if (family) {
    // Aynı ailenin tabloda bulunan en yeni sürümü (anahtar sırası: güncel modeller önce)
    const key = Object.keys(merged).find((k) => k.includes(family) && k.startsWith("claude-"));
    if (key) return { price: merged[key], match: "family" };
  }
  const priciest = Object.values(merged).reduce<Price | undefined>((a, p) => (!a || p.out > a.out ? p : a), undefined);
  return { price: priciest, match: "unknown" };
}

/** Saf maliyet hesabı: `input` önbellek okuma/yazma dahil toplam girdi tokenıdır */
export function costFor(price: Price | { in: number; out: number } | undefined, input: number, output: number, cache?: Pick<Usage, "cacheRead" | "cacheWrite">) {
  if (!price) return 0;
  const p = price as Price;
  const long = p.longAbove != null && input > p.longAbove;
  const pin = long ? p.longIn ?? p.in : p.in;
  const pout = long ? p.longOut ?? p.out : p.out;
  const readMult = p.cacheRead ?? 0.1;
  const read = Math.max(0, cache?.cacheRead ?? 0), write = Math.max(0, cache?.cacheWrite ?? 0);
  const plain = Math.max(0, input - read - write);
  return ((plain + read * readMult + write * 1.25) * pin + Math.max(0, output) * pout) / 1_000_000;
}

/** Önbellek sayesinde kazanılan tutar (önbelleksiz maliyet − gerçek maliyet; yazma primi düşülür) */
export function cacheSavings(price: Price | undefined, input: number, output: number, cache?: Pick<Usage, "cacheRead" | "cacheWrite">) {
  if (!price || !(cache?.cacheRead || cache?.cacheWrite)) return 0;
  return costFor(price, input, output) - costFor(price, input, output, cache);
}
