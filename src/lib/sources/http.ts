const UA = "Academiana/1.0 (academic research platform; +https://www.academiana.com.tr)";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function getJson<T>(url: string, init: RequestInit & { signal: AbortSignal }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", "User-Agent": UA, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const err = new HttpError(res.status, `${new URL(url).hostname} ${res.status}`) as HttpError & { retryAfter?: number };
    const ra = res.headers.get("retry-after");
    if (ra) err.retryAfter = Number(ra);
    throw err;
  }
  return (await res.json()) as T;
}

/**
 * Geçici hatalarda (429 hız sınırı, 5xx) kısa bekleyip yeniden dener (D92). Retry-After başlığına uyar (en fazla 3 sn);
 * iptal sinyali gelince bekleme kesilir.
 */
export async function getJsonRetry<T>(url: string, init: RequestInit & { signal: AbortSignal }, opts: { retries?: number; baseDelayMs?: number } = {}): Promise<T> {
  const retries = opts.retries ?? 2;
  for (let attempt = 0; ; attempt++) {
    try {
      return await getJson<T>(url, init);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 0;
      const transient = status === 429 || status >= 500;
      if (!transient || attempt >= retries || init.signal.aborted) throw e;
      const ra = Number((e as HttpError & { retryAfter?: number }).retryAfter);
      const wait = Math.min(3000, Number.isFinite(ra) && ra > 0 ? ra * 1000 : (opts.baseDelayMs ?? 700) * 2 ** attempt);
      await new Promise<void>((r, j) => {
        const t = setTimeout(r, wait);
        init.signal.addEventListener("abort", () => { clearTimeout(t); j(new DOMException("aborted", "AbortError")); }, { once: true });
      });
    }
  }
}

export async function getText(url: string, init: RequestInit & { signal: AbortSignal }): Promise<string> {
  const res = await fetch(url, { ...init, headers: { "User-Agent": UA, ...(init.headers ?? {}) } });
  if (!res.ok) throw new HttpError(res.status, `${new URL(url).hostname} ${res.status}`);
  return res.text();
}

/** Özel, yerel veya ayrılmış bir IP adresi mi? (IPv4 ve IPv6; SSRF koruması) */
export function isPrivateIp(ip: string): boolean {
  const v = ip.trim().toLowerCase().replace(/^\[|\]$/g, "");
  const m4 = v.match(/^(?:::ffff:)?(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m4) {
    const [a, b, c] = [Number(m4[1]), Number(m4[2]), Number(m4[3])];
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0 && (c === 0 || c === 2)) || (a === 198 && (b === 18 || b === 19));
  }
  if (v.includes(":")) {
    if (v === "::" || v === "::1") return true;
    const first = parseInt(v.split(":")[0] || "0", 16);
    // fc00::/7 (yerel), fe80::/10 (bağlantı-yerel), ff00::/8 (çok noktaya yayın), ::ffff:x (eşlenmiş IPv4, yukarıda), 64:ff9b:: (NAT64)
    return (first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80 || (first & 0xff00) === 0xff00 || v.startsWith("64:ff9b:") || v.startsWith("::ffff:");
  }
  return false;
}

/** Harici URL'lerin güvenli olduğunu kontrol eder (SSRF koruması; adres biçimi). */
export function isSafePublicUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  if (u.username || u.password) return false;
  if (u.port && !["80", "443"].includes(u.port)) return false;
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal") || !h.includes(".")) return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h) && isPrivateIp(h)) return false;
  if (/^\d+$/.test(h) || /^0x/i.test(h)) return false; // tamsayı/onaltılık IP yazımları
  if (h.includes(":") || h.startsWith("[")) return false; // IPv6 literal
  return true;
}

/** Ad sunucusu çözümlemesi: alan adının gösterdiği TÜM adresler herkese açık olmalı (iç ağa yönlenen alan adlarına karşı) */
export async function resolvesToPublic(raw: string, lookup?: (h: string) => Promise<{ address: string }[]>): Promise<boolean> {
  const host = new URL(raw).hostname;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return !isPrivateIp(host);
  const look = lookup ?? (async (h: string) => (await import("node:dns")).promises.lookup(h, { all: true, verbatim: true }));
  try {
    const addrs = await look(host);
    return addrs.length > 0 && addrs.every((a) => !isPrivateIp(a.address));
  } catch {
    return false;
  }
}

/**
 * Güvenli dış istek: yönlendirmeler elle izlenir ve HER adım (adres biçimi + DNS çözümlemesi) denetlenir.
 * Yalnızca dışarıdan gelen bağlantılar (ör. açık erişim PDF bağlantısı) için kullanılır.
 */
export async function safeFetch(url: string, init: RequestInit & { signal: AbortSignal }, opts: { maxRedirects?: number; lookup?: (h: string) => Promise<{ address: string }[]> } = {}): Promise<Response> {
  let current = url;
  for (let hop = 0; hop <= (opts.maxRedirects ?? 5); hop++) {
    if (!isSafePublicUrl(current) || !(await resolvesToPublic(current, opts.lookup))) throw new Error("Güvenli olmayan bağlantı");
    const res = await fetch(current, { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      current = new URL(res.headers.get("location")!, current).toString();
      await res.body?.cancel().catch(() => undefined);
      continue;
    }
    return res;
  }
  throw new Error("Çok fazla yönlendirme");
}

export function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
