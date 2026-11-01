import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { chunkText } from "@/lib/files/chunk";
import { extract } from "@/lib/files/extract";
import { isSafePublicUrl, stripTags } from "./http";
import { pdfPageLabels } from "./pages";
import { unpaywallLookup } from "./providers";
import type { ProviderConfig } from "./types";

const MAX_BYTES = 25 * 1024 * 1024;

export interface IngestResult {
  status: "ingested" | "no_open_access" | "failed";
  message: string;
  chunks?: number;
  url?: string;
}

async function fetchPdf(url: string, signal: AbortSignal): Promise<Buffer> {
  if (!isSafePublicUrl(url)) throw new Error("Güvenli olmayan URL");
  const res = await fetch(url, { signal, redirect: "follow", headers: { Accept: "application/pdf", "User-Agent": "AkademiAI/0.1" } });
  if (!res.ok) throw new Error(`İndirme hatası ${res.status}`);
  if (res.url && !isSafePublicUrl(res.url)) throw new Error("Yönlendirme güvenli değil");
  const len = Number(res.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES) throw new Error("Dosya çok büyük");
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error("Dosya çok büyük");
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error("Bağlantı PDF döndürmedi (yayıncı sayfası olabilir)");
  return buf;
}

/**
 * Açık erişimli tam metni içe aktarır. Yalnızca yasal olarak açık erişimli bağlantılar
 * (OpenAlex/Unpaywall/Europe PMC/arXiv/DOAJ/CORE'un bildirdiği) kullanılır; ücretli içerik indirilmez.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function ingestOpenAccess(db: SupabaseClient, source: any, cfg: ProviderConfig): Promise<IngestResult> {
  await db.from("sources").update({ fulltext_status: "processing", fulltext_message: null }).eq("id", source.id);
  const result = await ingestInner(db, source, cfg);
  const status = result.status === "ingested" ? "done" : result.status === "no_open_access" ? "unavailable" : "failed";
  await db.from("sources").update({ fulltext_status: status, fulltext_message: result.message }).eq("id", source.id);
  return result;
}

/** Açık erişimli kaynağı olanları arka plan kuyruğuna alınmaya uygun mu? */
export function hasOpenAccessCandidate(s: { oa_url?: string | null; arxiv_id?: string | null; pmcid?: string | null }) {
  return !!(s.oa_url || s.arxiv_id || s.pmcid);
}

async function ingestInner(db: SupabaseClient, source: any, cfg: ProviderConfig): Promise<IngestResult> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45_000);
  try {
    let pages: string[] | undefined;
    let text = "";
    let usedUrl: string | undefined;
    let license: string | null = source.license ?? null;

    if (source.pmcid) {
      // Europe PMC açık erişim alt kümesi: yapılandırılmış XML tam metin
      const r = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/${encodeURIComponent(source.pmcid)}/fullTextXML`, { signal: ctrl.signal });
      if (r.ok) {
        const xml = await r.text();
        const body = xml.match(/<body[\s\S]*<\/body>/)?.[0] ?? "";
        text = stripTags(body.replace(/<\/(p|sec|title)>/g, "\n\n"));
        usedUrl = `https://europepmc.org/article/PMC/${source.pmcid}`;
      }
    }

    if (text.length < 2000) {
      const candidates: string[] = [];
      if (source.oa_url) candidates.push(source.oa_url);
      if (source.arxiv_id) candidates.push(`https://arxiv.org/pdf/${source.arxiv_id}`);
      if (source.doi) {
        const up = await unpaywallLookup(source.doi, cfg, ctrl.signal).catch(() => null);
        if (up?.pdfUrl) { candidates.push(up.pdfUrl); license = license ?? up.license; }
      }
      for (const url of [...new Set(candidates)]) {
        try {
          const ex = await extract("pdf", await fetchPdf(url, ctrl.signal));
          if (ex.text.length >= 2000) { pages = ex.pages; text = ex.text; usedUrl = url; break; }
        } catch {
          // sonraki adayı dene
        }
      }
      if (!usedUrl && !candidates.length) return { status: "no_open_access", message: "Bu kaynak için açık erişimli tam metin bulunamadı. PDF'iniz varsa yükleyerek ekleyebilirsiniz." };
    }

    if (text.length < 2000) return { status: "failed", message: "Tam metin indirilemedi veya okunamadı (taranmış PDF ya da yayıncı engeli olabilir)." };

    // Sayfa ipuçları yayındaki gerçek sayfa numaralarıyla yazılır (atıfta sayfa gösterimi için)
    const chunks = chunkText({ pages, text, pageLabels: pages ? pdfPageLabels(source.pages, pages.length) : undefined });
    await db.from("source_chunks").delete().eq("source_id", source.id);
    for (let k = 0; k < chunks.length; k += 200) {
      const slice = chunks.slice(k, k + 200).map((c, idx) => ({ source_id: source.id, project_id: source.project_id, user_id: source.user_id, chunk_index: k + idx, page_hint: c.pageHint, content: c.content }));
      const { error } = await db.from("source_chunks").insert(slice);
      if (error) throw error;
    }
    await db.from("sources").update({ access_level: "full_text", license, oa_url: source.oa_url ?? usedUrl }).eq("id", source.id);
    return { status: "ingested", message: `${chunks.length} parça analiz için hazırlandı.`, chunks: chunks.length, url: usedUrl };
  } catch (e) {
    return { status: "failed", message: ctrl.signal.aborted ? "Zaman aşımı" : e instanceof Error ? e.message : "Hata" };
  } finally {
    clearTimeout(timer);
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
