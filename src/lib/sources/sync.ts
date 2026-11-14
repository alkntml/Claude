import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { open, seal } from "@/lib/secret-box";
import { importReferenceText } from "@/lib/sources/import-refs";
import { fetchOrcidWorks } from "@/lib/sources/orcid";
import { fetchZoteroSince } from "@/lib/sources/zotero";
import { adminClient } from "@/lib/supabase/admin";

/**
 * D192: Zotero ve ORCID eşitlemesi. Bağlantı çalışmaya kaydedilir (source_links; yalnızca sunucu okur ve yazar, her sorguda
 * açık project_id filtresi). Zotero API anahtarı şifreli saklanır. Eşitleme tek yönlüdür: yeni ve değişen kayıtlar eklenir,
 * projede zaten olanlar atlanır; projeden kaynak silinmez. Çalışma açılınca en fazla AUTO_SYNC_HOURS saatte bir kendiliğinden çalışır.
 */
export type SyncProvider = "zotero" | "orcid";
export const AUTO_SYNC_HOURS = 6;

export interface ZoteroConfig { library: "user" | "group"; libraryId: string; collection: string | null }
export interface OrcidConfig { orcid: string; name?: string | null }
export interface LinkInfo { provider: SyncProvider; config: ZoteroConfig | OrcidConfig; lastSyncedAt: string | null; lastResult: { added: number; duplicates: number; error?: string } | null }

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function saveLink(p: { projectId: string; ownerId: string; provider: SyncProvider; config: ZoteroConfig | OrcidConfig; apiKey?: string; version?: number | null; result?: { added: number; duplicates: number } }) {
  const { error } = await adminClient().from("source_links").upsert({
    project_id: p.projectId, user_id: p.ownerId, provider: p.provider, config: p.config,
    secret: p.apiKey ? seal(p.apiKey) : null, last_version: p.version ?? null,
    last_synced_at: new Date().toISOString(), last_result: p.result ?? null,
  }, { onConflict: "project_id,provider" });
  if (error) throw new Error("Bağlantı kaydedilemedi (veritabanı güncellemesi 44 çalıştırıldı mı?)");
}

export async function listLinks(projectId: string): Promise<LinkInfo[]> {
  const { data } = await adminClient().from("source_links").select("provider, config, last_synced_at, last_result").eq("project_id", projectId);
  return (data ?? []).map((r: any) => ({ provider: r.provider, config: r.config, lastSyncedAt: r.last_synced_at, lastResult: r.last_result }));
}

export async function removeLink(projectId: string, provider: SyncProvider) {
  await adminClient().from("source_links").delete().eq("project_id", projectId).eq("provider", provider);
}

/** Tek bağlantıyı eşitler; sonuç bağlantı kaydına yazılır */
export async function syncLink(db: SupabaseClient, projectId: string, ownerId: string, provider: SyncProvider) {
  const admin = adminClient();
  const { data: link } = await admin.from("source_links").select("*").eq("project_id", projectId).eq("provider", provider).maybeSingle();
  if (!link) throw new Error("Bu çalışmada kayıtlı bir bağlantı yok");
  let text = "[]", version: number | null = link.last_version ?? null;
  try {
    if (provider === "zotero") {
      const key = open(link.secret);
      if (!key) throw new Error("Zotero anahtarı okunamadı; bağlantıyı yeniden kurun");
      const c = link.config as ZoteroConfig;
      const r = await fetchZoteroSince({ library: c.library, libraryId: c.libraryId, collection: c.collection, apiKey: key }, link.last_version ?? null);
      text = r.text; version = r.version ?? version;
    } else {
      text = (await fetchOrcidWorks((link.config as OrcidConfig).orcid)).text;
    }
  } catch (e) {
    const result = { added: 0, duplicates: 0, error: (e as Error).message.slice(0, 300) };
    await admin.from("source_links").update({ last_synced_at: new Date().toISOString(), last_result: result }).eq("project_id", projectId).eq("provider", provider);
    throw e;
  }
  const out = await importReferenceText(db, projectId, ownerId, text, "csljson", provider);
  const result = { added: out.added.length, duplicates: out.duplicates };
  await admin.from("source_links").update({ last_version: version, last_synced_at: new Date().toISOString(), last_result: result }).eq("project_id", projectId).eq("provider", provider);
  return { ...out, provider };
}

/** Çalışma açılınca: son eşitlemesi AUTO_SYNC_HOURS saatten eski bağlantılar eşitlenir (hatalar bağlantı kaydına yazılır) */
export async function autoSync(db: SupabaseClient, projectId: string, ownerId: string) {
  const since = Date.now() - AUTO_SYNC_HOURS * 3600_000;
  const links = (await listLinks(projectId)).filter((l) => !l.lastSyncedAt || new Date(l.lastSyncedAt).getTime() < since);
  const added: any[] = [];
  for (const l of links) {
    try { added.push(...(await syncLink(db, projectId, ownerId, l.provider)).added); } catch { /* sonuç kayıtta */ }
  }
  return { synced: links.map((l) => l.provider), added };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
