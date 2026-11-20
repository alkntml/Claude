import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminClient } from "@/lib/supabase/admin";
import { EXPORT_GUIDE } from "@/lib/data-export-guide";

/** KVKK / GDPR: kullanıcının tüm verisi (taşınabilir JSON). Her tabloda açık user_id filtresi. */
export const EXPORT_TABLES = ["projects", "project_stages", "stage_revisions", "stage_comments", "project_memory", "sources", "ai_conversations", "ai_messages", "files", "quality_reports", "subscriptions", "usage_events", "feedback",
  // D154: KVKK Aydınlatma Metni’nde sayılan diğer kayıtlar (kullanıcının RLS ile okuyabildikleri)
  "surveys", "survey_responses", "project_shares", "notifications", "usage_credits", "claim_audits", "review_records", "download_passes", "data_requests", "legal_acceptances"];

/**
 * Yalnızca sunucunun yazıp okuduğu (kullanıcıya RLS ile kapalı) kayıtlar: kullanım kanıt kaydı, cihaz kimliği özetleri,
 * Tek Proje indirme izleri ve ödeme/paket tanımlama kayıtları. Service role ile ve açık user_id filtresiyle okunur.
 */
export const SERVER_EXPORT_TABLES = ["activity_log", "user_devices", "export_fingerprints", "plan_purchases"];

/**
 * D204: kullanıcıya bağlı diğer kayıtlar (önceden dışa aktarımda yoktu). Gizli alanlar (davet bağlantısı anahtarı,
 * hata yığını, başka kişilerin verisi) seçilmez; her sorguda açık kullanıcı filtresi vardır.
 */
async function extraRecords(admin: SupabaseClient, userId: string, email: string | null) {
  const rows = async (q: PromiseLike<{ data: unknown[] | null; error?: unknown }>) => { try { const { data, error } = await q; return error ? [] : (data ?? []); } catch { return []; } };
  const [errors, memberships, invitesSent, invitesReceived, orgs, tools, templates, templateLogs, orgAudit, orders] = await Promise.all([
    rows(admin.from("error_logs").select("route, message, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5000)),
    rows(admin.from("project_members").select("project_id, role, created_at, projects(title)").eq("user_id", userId).limit(5000)),
    rows(admin.from("project_invites").select("project_id, email, role, created_at, expires_at, accepted_at").eq("invited_by", userId).limit(5000)),
    email ? rows(admin.from("project_invites").select("project_id, role, created_at, expires_at, accepted_at").ilike("email", email).limit(5000)) : Promise.resolve([]),
    rows(admin.from("organization_members").select("org_id, role, joined_at, organizations(name)").eq("user_id", userId).limit(100)),
    rows(admin.from("tool_usage").select("tool, items, tokens_in, tokens_out, cost_usd, model, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50000)),
    rows(admin.from("user_templates").select("*").eq("user_id", userId).limit(1000)),
    rows(admin.from("template_change_logs").select("project_id, action, detail, created_at").eq("user_id", userId).limit(50000)),
    // Kurum işlem kaydında yalnızca kullanıcının rolü ve işlem türü (başka kişilerin bilgisi içeren ayrıntı verilmez)
    rows(admin.from("org_audit_log").select("org_id, action, actor_id, target_user, created_at").or(`actor_id.eq.${userId},target_user.eq.${userId}`).limit(5000)),
    // D231: kartla ödeme siparişleri ve fatura bilgileri (ödeme anahtarı iframe_token hariç)
    rows(admin.from("payment_orders").select("merchant_oid, plan_id, period, days, amount_try, status, invoice_type, payer_name, buyer_first_name, buyer_last_name, company_title, tax_number, tax_office, payer_address, payer_phone, buyer_email, payment_type, immediate_start_consent, created_at, applied_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1000)),
  ]);
  return {
    error_logs: errors,
    project_memberships: memberships,
    project_invites_sent: invitesSent,
    project_invites_received: invitesReceived,
    organization_memberships: orgs,
    tool_usage: tools,
    user_templates: templates,
    template_change_logs: templateLogs,
    payment_orders: orders,
    org_audit_log: (orgAudit as { org_id: string; action: string; actor_id: string | null; target_user: string | null; created_at: string }[])
      .map((r) => ({ org_id: r.org_id, action: r.action, your_role: r.actor_id === userId ? "işlemi yapan" : "işlemden etkilenen", created_at: r.created_at })),
  };
}

export async function buildUserExport(db: SupabaseClient, userId: string, profile: unknown) {
  const out: Record<string, unknown> = { _aciklama: null, exportedAt: new Date().toISOString(), profile };
  for (const t of EXPORT_TABLES) {
    const { data } = await db.from(t).select("*").eq("user_id", userId).limit(50000);
    out[t] = data ?? [];
  }
  let admin: SupabaseClient | null = null;
  try { admin = adminClient(); } catch { admin = null; }
  for (const t of SERVER_EXPORT_TABLES) {
    if (!admin) { out[t] = []; continue; }
    const { data } = await admin.from(t).select("*").eq("user_id", userId).limit(50000);
    out[t] = data ?? [];
  }
  // D192: Zotero/ORCID bağlantıları — şifreli anahtar dışa aktarılmaz
  out.source_links = admin ? ((await admin.from("source_links").select("project_id, provider, config, last_synced_at, last_result, created_at").eq("user_id", userId).limit(1000)).data ?? []) : [];
  const email = (profile as { email?: string | null } | null)?.email ?? null;
  Object.assign(out, admin ? await extraRecords(admin, userId, email) : {});
  // D204: dosyanın başında Türkçe okuma rehberi ve bölüm başına kayıt sayısı
  out._aciklama = { ...EXPORT_GUIDE.header, bolumler: EXPORT_GUIDE.sections.map((s) => ({ alan: s.key, ad: s.name, aciklama: s.desc, kayit: Array.isArray(out[s.key]) ? (out[s.key] as unknown[]).length : out[s.key] ? 1 : 0 })) };
  return out;
}
