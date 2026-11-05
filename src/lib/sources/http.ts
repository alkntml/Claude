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

/** Harici URL'lerin güvenli olduğunu kontrol eder (SSRF koruması). */
export function isSafePublicUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const [a, b] = h.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return false;
  }
  if (h.includes(":") || h.startsWith("[")) return false; // IPv6 literal
  return true;
}

export function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
