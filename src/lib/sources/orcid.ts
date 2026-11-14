import "server-only";
/**
 * D192: ORCID’den yayın aktarma ve eşitleme. ORCID genel API’si (pub.orcid.org, anahtarsız, yalnızca herkese açık kayıtlar).
 * Yayın özetleri alınır, ayrıntılar (yazarlar, dergi, DOI) toplu uçtan okunur ve CSL-JSON’a çevrilir; kaynaklar mevcut
 * içe aktarma hattından geçer (DOI doğrulaması, tekrar ayıklama). Yazar listesi kayıtta yoksa ORCID sahibinin adı yazılır
 * (kaydın sahibi eserin yazarıdır); başka bilgi uydurulmaz.
 */
const BASE = "https://pub.orcid.org/v3.0";
const MAX_WORKS = 200;

export class OrcidError extends Error { constructor(public status: number, message: string) { super(message); } }

/** 0000-0002-1825-0097 biçimi ve ISO 7064 11,2 sağlama basamağı */
export function normalizeOrcid(raw: string): string | null {
  const m = raw.trim().replace(/^https?:\/\/(www\.)?orcid\.org\//i, "").toUpperCase().match(/^(\d{4})-?(\d{4})-?(\d{4})-?(\d{3}[\dX])$/);
  if (!m) return null;
  const id = `${m[1]}-${m[2]}-${m[3]}-${m[4]}`;
  const digits = id.replace(/-/g, "");
  let total = 0;
  for (const ch of digits.slice(0, 15)) total = (total + Number(ch)) * 2;
  const check = (12 - (total % 11)) % 11;
  return (check === 10 ? "X" : String(check)) === digits[15] ? id : null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const TYPE: Record<string, string> = {
  "journal-article": "article-journal", "book": "book", "book-chapter": "chapter", "conference-paper": "paper-conference",
  "dissertation-thesis": "thesis", "dissertation": "thesis", "report": "report", "preprint": "article", "working-paper": "report",
};
const val = (x: any) => (typeof x === "string" ? x : x?.value ?? null);

function splitName(name: string): { family: string; given?: string } {
  const n = name.trim().replace(/\s+/g, " ");
  if (n.includes(",")) { const [family, given] = n.split(",").map((x) => x.trim()); return given ? { family, given } : { family }; }
  const parts = n.split(" ");
  return parts.length > 1 ? { family: parts.pop()!, given: parts.join(" ") } : { family: n };
}

/** ORCID “work” kaydı → CSL-JSON öğesi (yazar yoksa ORCID sahibi) */
export function workToCsl(w: any, owner: { family: string; given?: string } | null): Record<string, unknown> | null {
  const title = val(w?.title?.title);
  if (!title) return null;
  const ids: any[] = w?.["external-ids"]?.["external-id"] ?? [];
  const doi = ids.find((x) => String(x?.["external-id-type"]).toLowerCase() === "doi")?.["external-id-value"] ?? null;
  const year = Number(val(w?.["publication-date"]?.year));
  const contributors: any[] = w?.contributors?.contributor ?? [];
  const authors = contributors
    .filter((c) => !c?.["contributor-attributes"]?.["contributor-role"] || /author/i.test(String(c["contributor-attributes"]["contributor-role"])))
    .map((c) => val(c?.["credit-name"])).filter(Boolean).slice(0, 50).map((n: string) => splitName(n));
  return {
    type: TYPE[String(w?.type ?? "")] ?? "article-journal",
    title,
    author: authors.length ? authors : owner ? [owner] : [],
    ...(Number.isFinite(year) && year > 1000 ? { issued: { "date-parts": [[year]] } } : {}),
    ...(val(w?.["journal-title"]) ? { "container-title": val(w?.["journal-title"]) } : {}),
    ...(doi ? { DOI: String(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "") } : {}),
    ...(val(w?.url) ? { URL: val(w?.url) } : {}),
  };
}

async function get(path: string): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20_000), redirect: "error" });
  if (res.status === 404) throw new OrcidError(404, "Bu ORCID numarasıyla kayıt bulunamadı.");
  if (!res.ok) throw new OrcidError(502, "ORCID şu an yanıt vermiyor; biraz sonra tekrar deneyin.");
  return res.json();
}

/** Yayınlar (CSL-JSON metni) ve kayıt sahibinin adı */
export async function fetchOrcidWorks(orcid: string): Promise<{ text: string; count: number; name: string | null }> {
  const [works, person] = await Promise.all([get(`${orcid}/works`), get(`${orcid}/person`).catch(() => null)]);
  const given = val(person?.name?.["given-names"]), family = val(person?.name?.["family-name"]);
  const owner = family ? { family, ...(given ? { given } : {}) } : null;
  // Her grubun tercih edilen (ilk) özeti; ayrıntılar 100’erlik toplu isteklerle
  const codes: string[] = (works?.group ?? []).map((g: any) => g?.["work-summary"]?.[0]?.["put-code"]).filter(Boolean).slice(0, MAX_WORKS).map(String);
  const items: Record<string, unknown>[] = [];
  for (let i = 0; i < codes.length; i += 100) {
    const bulk = await get(`${orcid}/works/${codes.slice(i, i + 100).join(",")}`);
    for (const b of bulk?.bulk ?? []) { const c = workToCsl(b?.work, owner); if (c) items.push(c); }
  }
  return { text: JSON.stringify(items), count: items.length, name: owner ? [given, family].filter(Boolean).join(" ") : null };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
