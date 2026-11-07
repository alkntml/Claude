/**
 * Metin parmak izi (D109): MinHash ile iki metnin ne kadar örtüştüğü, metnin kendisi saklanmadan tahmin edilir.
 * Kelimeler küçük harfe çevrilir, 5 kelimelik kaydırmalı parçalar (shingle) özetlenir; 64 farklı özetin en küçükleri saklanır.
 * İki imzadaki eşit değerlerin oranı, metinlerin Jaccard benzerliğinin tahminidir.
 */
export const SIG_SIZE = 64;
const SHINGLE = 5;

/** FNV-1a 32 bit */
function fnv(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
/** Murmur3 son karıştırma adımı */
function mix(h: number): number {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}
const SEEDS = Array.from({ length: SIG_SIZE }, (_, i) => mix(0x9e3779b9 + i * 0x7f4a7c15));

export function words(text: string): string[] {
  return (text.toLocaleLowerCase("tr").match(/[\p{L}\p{N}]+/gu) ?? []);
}

/** Metnin MinHash imzası (64 tam sayı). Çok kısa metinde de tek parça üzerinden imza üretilir. */
export function minhash(text: string): number[] {
  const w = words(text);
  const sig = new Array<number>(SIG_SIZE).fill(0xffffffff);
  const n = Math.max(1, w.length - SHINGLE + 1);
  for (let i = 0; i < n; i++) {
    const h = fnv(w.slice(i, i + SHINGLE).join(" "));
    for (let k = 0; k < SIG_SIZE; k++) {
      const v = mix(h ^ SEEDS[k]);
      if (v < sig[k]) sig[k] = v;
    }
  }
  // Postgres int4 aralığına sığması için işaretli 32 bit
  return sig.map((v) => v | 0);
}

/** İki imzanın benzerliği (0–1) */
export function similarity(a: number[], b: number[]): number {
  if (a.length !== SIG_SIZE || b.length !== SIG_SIZE) return 0;
  let eq = 0;
  for (let i = 0; i < SIG_SIZE; i++) if (a[i] === b[i]) eq++;
  return eq / SIG_SIZE;
}

/** Kapak/yazar bilgisini karşılaştırmak için sadeleştirme */
export const normName = (s: string | null | undefined) => (s ?? "").toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
