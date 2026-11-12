import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Session } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { LEGAL_DOCS, legalDoc, pendingAcceptances, sourceFromProvider, type AcceptanceRow, type AcceptanceSource, type LegalDocId, type LegalDocMeta } from "./docs";

/** Kullanıcının kabul/bilgilendirme kayıtları (RLS: yalnızca kendi kayıtları) */
export async function loadAcceptances(s: Pick<Session, "supabase" | "user">): Promise<AcceptanceRow[]> {
  const { data, error } = await s.supabase.from("legal_acceptances").select("doc, version, kind, accepted_at").eq("user_id", s.user.id).order("accepted_at", { ascending: false }).limit(200);
  // Migration 39 henüz çalıştırılmadıysa tablo yoktur: kullanıcı engellenmez (canlıda çalıştırılana kadar)
  if (error && !/42P01|PGRST205/.test(String(error.code))) throw error;
  if (error) return LEGAL_DOCS.filter((d) => d.requiresAcceptance).map((d) => ({ doc: d.id, version: d.version, kind: "accept" as const, accepted_at: "" }));
  return (data ?? []) as AcceptanceRow[];
}

export async function pendingForSession(s: Pick<Session, "supabase" | "user">): Promise<LegalDocMeta[]> {
  return pendingAcceptances(await loadAcceptances(s));
}

/** Yalnızca site içi yol (açık yönlendirme yok) */
export function safeNext(next: string | null | undefined, fallback = "/panel"): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}

/**
 * Uygulama sayfaları açılmadan önce: güncel sürümü kabul edilmemiş zorunlu belge varsa onay sayfasına yönlendirir
 * (Google/Apple ile ilk giriş ve yeni sürüm yayımlandığında). `next` verilmezse ara katmanın eklediği x-pathname kullanılır.
 */
export async function requireLegalAcceptance(s: Pick<Session, "supabase" | "user">, next?: string): Promise<void> {
  const pending = await pendingForSession(s);
  if (!pending.length) return;
  const back = safeNext(next ?? (await headers()).get("x-pathname"));
  redirect(`/sozlesme-onayi?next=${encodeURIComponent(back)}`);
}

/** Kabul kaynağı: oturum açılan yönteme göre (e-posta / Google / Apple) */
export function acceptanceSource(user: Session["user"]): AcceptanceSource {
  return sourceFromProvider((user.app_metadata?.provider as string | undefined) ?? null);
}

/**
 * Kabul/bilgilendirme kayıtlarını yazar. Sürüm ve zaman SUNUCUDA belirlenir (istemci gönderemez);
 * kayıtlar değiştirilemez (DB tetikleyicisi). Yalnızca service role yazar (RLS’te ekleme politikası yok).
 */
export async function recordLegal(userId: string, items: { doc: LegalDocId; kind: "accept" | "notice" }[], source: AcceptanceSource, context: Record<string, string> = {}): Promise<void> {
  if (!items.length) return;
  const rows = items.map((i) => ({ user_id: userId, doc: i.doc, version: legalDoc(i.doc).version, kind: i.kind, source, context }));
  const { error } = await adminClient().from("legal_acceptances").insert(rows);
  if (error) throw error;
}
