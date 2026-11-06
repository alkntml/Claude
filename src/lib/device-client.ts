/**
 * Cihaz kimliği (D101, davet ödülü kötüye kullanım önlemi): tarayıcıda üretilen rastgele değer; kişisel bilgi
 * içermez. Tarayıcı belleği ve çerezde saklanır (biri silinirse diğerinden geri yüklenir). Sunucuya yalnızca
 * SHA-256 özeti gönderilir.
 */
const KEY = "acd_did";

function readCookie(): string | null {
  const m = document.cookie.match(/(?:^|; )acd_did=([0-9a-f-]{36})/);
  return m ? m[1] : null;
}

export function deviceId(): string | null {
  if (typeof window === "undefined") return null;
  let id: string | null = null;
  try { id = localStorage.getItem(KEY); } catch { /* yok say */ }
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) id = readCookie();
  if (!id) id = crypto.randomUUID?.() ?? null;
  if (!id) return null;
  try { localStorage.setItem(KEY, id); } catch { /* yok say */ }
  document.cookie = `${KEY}=${id}; path=/; max-age=34560000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  return id;
}

export async function deviceHash(): Promise<string | null> {
  const id = deviceId();
  if (!id || !crypto.subtle) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(id));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
