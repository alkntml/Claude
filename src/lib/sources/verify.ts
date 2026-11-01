/**
 * Kaynak doğrulama: bir kaydın kalıcı tanımlayıcısı (DOI / PMID / arXiv) ilgili kayıt
 * otoritesinde sorgulanır ve dönen başlık kayıttaki başlıkla karşılaştırılır.
 * Doğrulanamayan kaynaklar arayüzde uyarıyla gösterilir ve AI'ye "doğrulanmamış" olarak iletilir.
 */
import { titleSimilarity } from "@/lib/citations/checks";
import { normalizeDoi } from "@/lib/citations/util";
import { getJson, getText, HttpError, stripTags } from "./http";
import { parseArxiv, parseCrossrefItem, parseEuropePmc } from "./providers";
import type { ProviderConfig, SourceRecord } from "./types";

export type VerificationStatus = "verified" | "mismatch" | "not_found" | "no_identifier" | "error";

export interface VerificationResult {
  status: VerificationStatus;
  authority?: "crossref" | "datacite" | "europepmc" | "arxiv";
  identifier?: string;
  similarity?: number;
  /** Otoriteden gelen kayıt — eksik künye alanlarını tamamlamak için kullanılabilir */
  record?: SourceRecord;
  checkedAt: string;
  message?: string;
}

const MATCH_THRESHOLD = 0.6;

function result(status: VerificationStatus, extra: Partial<VerificationResult> = {}): VerificationResult {
  return { status, checkedAt: new Date().toISOString(), ...extra };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function viaCrossref(doi: string, cfg: ProviderConfig, signal: AbortSignal): Promise<SourceRecord | null> {
  const q = cfg.contactEmail ? `?mailto=${encodeURIComponent(cfg.contactEmail)}` : "";
  try {
    const json = await getJson<any>(`https://api.crossref.org/works/${encodeURIComponent(doi)}${q}`, { signal });
    return parseCrossrefItem(json.message);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}

/** arXiv, Zenodo vb. DOI'leri DataCite'tadır. */
async function viaDatacite(doi: string, signal: AbortSignal): Promise<SourceRecord | null> {
  try {
    const json = await getJson<any>(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`, { signal });
    const a = json?.data?.attributes ?? {};
    return {
      type: a.types?.resourceTypeGeneral === "Preprint" ? "preprint" : "other",
      title: stripTags(a.titles?.[0]?.title ?? ""),
      authors: (a.creators ?? []).map((c: any) => (c.familyName ? { family: c.familyName, given: c.givenName } : { literal: c.name })),
      year: a.publicationYear ? Number(a.publicationYear) : null,
      publisher: typeof a.publisher === "string" ? a.publisher : a.publisher?.name ?? null,
      doi,
      url: a.url ?? null,
      abstract: a.descriptions?.find((d: any) => d.descriptionType === "Abstract")?.description ?? null,
      origins: [],
      accessLevel: "metadata",
    };
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function verifySource(rec: Pick<SourceRecord, "title" | "doi" | "pmid" | "arxivId">, cfg: ProviderConfig, timeoutMs = 10000): Promise<VerificationResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const compare = (found: SourceRecord | null, authority: VerificationResult["authority"], identifier: string) => {
    if (!found) return result("not_found", { authority, identifier, message: "Tanımlayıcı kayıt otoritesinde bulunamadı." });
    const similarity = Math.round(titleSimilarity(rec.title, found.title) * 100) / 100;
    if (similarity >= MATCH_THRESHOLD) return result("verified", { authority, identifier, similarity, record: found });
    return result("mismatch", { authority, identifier, similarity, record: found, message: `Tanımlayıcıya ait başlık farklı: "${found.title}"` });
  };
  try {
    const doi = normalizeDoi(rec.doi);
    if (doi) {
      const cr = await viaCrossref(doi, cfg, ctrl.signal);
      if (cr) return compare(cr, "crossref", doi);
      return compare(await viaDatacite(doi, ctrl.signal), "datacite", doi);
    }
    if (rec.pmid) {
      const p = new URLSearchParams({ query: `EXT_ID:${rec.pmid} AND SRC:MED`, format: "json", resultType: "core" });
      const found = parseEuropePmc(await getJson(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${p}`, { signal: ctrl.signal }))[0] ?? null;
      return compare(found, "europepmc", rec.pmid);
    }
    if (rec.arxivId) {
      const xml = await getText(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(rec.arxivId)}`, { signal: ctrl.signal });
      return compare(parseArxiv(xml)[0] ?? null, "arxiv", rec.arxivId);
    }
    return result("no_identifier", { message: "Kalıcı tanımlayıcı (DOI/PMID/arXiv) yok; kaynak elle doğrulanmalıdır." });
  } catch (e) {
    return result("error", { message: ctrl.signal.aborted ? "Doğrulama zaman aşımına uğradı" : e instanceof Error ? e.message : "Doğrulama hatası" });
  } finally {
    clearTimeout(timer);
  }
}
