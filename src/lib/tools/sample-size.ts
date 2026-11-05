/**
 * Örneklem büyüklüğü (D90). Saf fonksiyonlar.
 * - Oran tahmini (Cochran): n₀ = z²·p(1−p)/e²; sonlu evren düzeltmesi n = n₀ / (1 + (n₀ − 1)/N)
 * - Yamane (1967): n = N / (1 + N·e²) (yalnızca %95 güven ve p = 0,5 varsayımına denk gelir)
 * - Ortalama tahmini: n₀ = (z·σ/e)²
 * Beklenen yanıt oranı verilirse ulaşılması gereken kişi sayısı da hesaplanır.
 */
export const Z: Record<number, number> = { 90: 1.6449, 95: 1.96, 99: 2.5758 };

export interface SampleInput { population: number | null; confidence: 90 | 95 | 99; margin: number; p?: number; responseRate?: number }

export function cochran({ population, confidence, margin, p = 0.5 }: SampleInput): { n0: number; n: number } {
  const z = Z[confidence];
  const e = margin / 100;
  if (!(e > 0 && e < 1)) throw new Error("Hata payı %0 ile %100 arasında olmalı");
  if (!(p > 0 && p < 1)) throw new Error("Oran 0 ile 1 arasında olmalı");
  const n0 = (z * z * p * (1 - p)) / (e * e);
  const n = population && population > 0 ? n0 / (1 + (n0 - 1) / population) : n0;
  return { n0: Math.ceil(n0), n: Math.ceil(n) };
}

export function yamane(population: number, margin: number): number {
  const e = margin / 100;
  if (!(population > 0)) throw new Error("Evren büyüklüğü gerekli");
  return Math.ceil(population / (1 + population * e * e));
}

export function meanSample(sd: number, margin: number, confidence: 90 | 95 | 99, population?: number | null): number {
  if (!(sd > 0) || !(margin > 0)) throw new Error("Standart sapma ve hata payı pozitif olmalı");
  const n0 = Math.pow((Z[confidence] * sd) / margin, 2);
  return Math.ceil(population && population > 0 ? n0 / (1 + (n0 - 1) / population) : n0);
}

/** Beklenen yanıt oranına göre ulaşılması gereken kişi */
export const toReach = (n: number, responseRate: number) => (responseRate > 0 && responseRate < 100 ? Math.ceil(n / (responseRate / 100)) : n);
