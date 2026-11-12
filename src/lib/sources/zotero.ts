import "server-only";
/**
 * Zotero’dan doğrudan içe aktarma (D149). Zotero Web API (api.zotero.org) — kullanıcı kendi kimliğini (userID) ve
 * yalnızca okuma izinli bir API anahtarını girer. Anahtar SAKLANMAZ; yalnızca bu istek için kullanılır.
 * Öğeler CSL-JSON olarak alınır ve mevcut içe aktarma hattından geçer. Ekler ve notlar alınmaz.
 */
const BASE = "https://api.zotero.org";
const PAGE = 100;
const MAX_ITEMS = 300;

export interface ZoteroInput { library: "user" | "group"; libraryId: string; apiKey: string; collection?: string | null }

export function zoteroItemsUrl(z: ZoteroInput, start: number): string {
  const lib = `${z.library === "group" ? "groups" : "users"}/${encodeURIComponent(z.libraryId)}`;
  const path = z.collection ? `${lib}/collections/${encodeURIComponent(z.collection)}/items/top` : `${lib}/items/top`;
  return `${BASE}/${path}?format=csljson&limit=${PAGE}&start=${start}&itemType=-attachment%20||%20note`;
}

/** CSL-JSON yanıtı (Zotero { items: [...] } döndürür) → birleşik CSL-JSON dizisi metni */
export function mergeCsl(pages: unknown[]): string {
  const items = pages.flatMap((p) => (Array.isArray(p) ? p : Array.isArray((p as { items?: unknown[] })?.items) ? (p as { items: unknown[] }).items : []));
  return JSON.stringify(items.slice(0, MAX_ITEMS));
}

export class ZoteroError extends Error { constructor(public status: number, message: string) { super(message); } }

export async function fetchZotero(z: ZoteroInput): Promise<string> {
  const pages: unknown[] = [];
  for (let start = 0; start < MAX_ITEMS; start += PAGE) {
    const res = await fetch(zoteroItemsUrl(z, start), { headers: { "Zotero-API-Key": z.apiKey, "Zotero-API-Version": "3" }, signal: AbortSignal.timeout(20_000), redirect: "error" });
    if (res.status === 403) throw new ZoteroError(403, "Zotero erişimi reddetti: API anahtarını ve kütüphane kimliğini kontrol edin (anahtarda “kütüphaneye erişim” izni olmalı).");
    if (res.status === 404) throw new ZoteroError(404, "Zotero kütüphanesi veya koleksiyon bulunamadı.");
    if (!res.ok) throw new ZoteroError(502, "Zotero şu an yanıt vermiyor; biraz sonra tekrar deneyin.");
    const page = await res.json();
    pages.push(page);
    const n = Array.isArray(page) ? page.length : Array.isArray(page?.items) ? page.items.length : 0;
    const total = Number(res.headers.get("Total-Results") ?? 0);
    if (n < PAGE || (total && start + PAGE >= total)) break;
  }
  return mergeCsl(pages);
}
