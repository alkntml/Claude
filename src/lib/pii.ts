/**
 * Hata kayıtlarında gereksiz kişisel veri tutulmaması için (D154): e-posta adresleri, telefon numarası benzeri
 * uzun rakam dizileri, JWT/erişim anahtarı benzeri uzun belirteçler ve IP adresleri maskelenir.
 * Hata ayıklamaya yetecek bilgi (mesajın geri kalanı, yığın izi) korunur.
 */
export function scrubPII(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[e-posta]")
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\b/g, "[belirteç]")
    .replace(/\b(?:sk|pk|rk)[-_][A-Za-z0-9_-]{16,}\b/g, "[anahtar]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[ip]")
    .replace(/(?<![\w.-])\+?\d[\d ()-]{8,}\d(?![\w.-])/g, (m) => (m.replace(/\D/g, "").length >= 10 ? "[telefon]" : m));
}

/** Nesne içindeki metin değerlerini maskeler (meta alanı için; yalnızca düz değerler) */
export function scrubMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) out[k] = typeof v === "string" ? scrubPII(v) : v;
  return out;
}
