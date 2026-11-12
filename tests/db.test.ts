/**
 * Veritabanı entegrasyon testi: migration'lar gerçek bir PostgreSQL (PGlite) üzerinde çalıştırılır,
 * ardından RLS politikaları ve güvenlik tetikleyicileri farklı kullanıcı rolleriyle sınanır.
 * Supabase'e özgü `auth` ve `storage` şemaları minimal olarak taklit edilir.
 */
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { beforeAll, describe, expect, it } from "vitest";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
const ADMIN = "33333333-3333-3333-3333-333333333333";

const SUPABASE_STUBS = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb, email_confirmed_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon') $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security; -- Supabase varsayılanı
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
grant usage on schema auth, storage to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
create schema realtime;
create table realtime.messages (id bigserial primary key, topic text not null, extension text not null default 'broadcast', payload jsonb, event text, private boolean default true);
alter table realtime.messages enable row level security;
create function realtime.topic() returns text language sql stable as $$ select nullif(current_setting('realtime.topic', true), '') $$;
grant usage on schema realtime to authenticated, anon;
grant select, insert on realtime.messages to authenticated;
grant usage on sequence realtime.messages_id_seq to authenticated;
grant execute on all functions in schema realtime to anon, authenticated;
`;

let db: PGlite;

/** Belirtilen kullanıcı olarak (RLS etkin) sorgu çalıştırır. */
async function as<T = Record<string, unknown>>(uid: string | null, sql: string, params: unknown[] = []): Promise<T[]> {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${uid ? "authenticated" : "anon"}`);
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true)`, [uid ?? "", uid ? "authenticated" : "anon"]);
    const r = await tx.query<T>(sql, params);
    return r.rows;
  });
}

async function expectError(p: Promise<unknown>, pattern?: RegExp) {
  let err: unknown = null;
  try { await p; } catch (e) { err = e; }
  expect(err, "hata bekleniyordu").not.toBeNull();
  if (pattern) expect(String((err as Error).message)).toMatch(pattern);
}

beforeAll(async () => {
  db = await PGlite.create({ extensions: { pg_trgm } });
  await db.exec(SUPABASE_STUBS);
  const dir = path.resolve(__dirname, "../supabase/migrations");
  for (const f of fs.readdirSync(dir).sort()) {
    const sql = fs.readFileSync(path.join(dir, f), "utf8").replace(/create extension if not exists "pgcrypto";/g, "");
    await db.exec(sql);
  }
  // Supabase'in varsayılan yetkileri
  await db.exec(`
    grant usage on schema public to anon, authenticated, service_role;
    grant all on all tables in schema public to anon, authenticated, service_role;
    grant all on all sequences in schema public to anon, authenticated, service_role;
    grant all on all functions in schema public to anon, authenticated, service_role;
    grant all on all tables in schema storage to anon, authenticated;
  `);
  // Kayıt: auth.users'a ekleme profil tetikleyicisini çalıştırır
  await db.exec(`
    insert into auth.users (id, email, raw_user_meta_data) values
      ('${A}', 'a@ornek.com', '{"full_name":"Ayşe"}'), ('${B}', 'b@ornek.com', '{}'), ('${ADMIN}', 'admin@ornek.com', '{}');
    update public.profiles set role = 'admin' where id = '${ADMIN}';
  `);
}, 60_000);

describe("migration'lar ve seed", () => {
  it("rakip analizi iyileştirmeleri (migration 33): iddia denetimi, PRISMA kayıtları, gözlem ve kurum denetim tabloları izole", async () => {
    const [p] = (await db.query<{ id: string }>(`insert into public.projects (user_id, title, work_type, academic_level) values ('${A}', 'Derleme', 'literature_review', 'master') returning id`)).rows;
    const [st] = (await db.query<{ id: string }>(`insert into public.project_stages (project_id, user_id, key, title, position) values ($1, '${A}', 'intro', 'Giriş', 0) returning id`, [p.id])).rows;
    await db.query(`insert into public.claim_audits (project_id, stage_id, user_id, summary, results) values ($1, $2, '${A}', '{"total":1}', '[]')`, [p.id, st.id]);
    await db.query(`insert into public.review_records (project_id, user_id, key, origin, record) values ($1, '${A}', 'doi:10.1/x', 'Scopus', '{"title":"X"}')`, [p.id]);
    // Sahip görür, başkası görmez; doğrudan yazma yok (sunucu yazar)
    expect(await as(A, `select id from public.claim_audits where project_id = '${p.id}'`)).toHaveLength(1);
    expect(await as(B, `select id from public.claim_audits where project_id = '${p.id}'`)).toHaveLength(0);
    expect(await as(A, `select id from public.review_records where project_id = '${p.id}'`)).toHaveLength(1);
    expect(await as(B, `select id from public.review_records where project_id = '${p.id}'`)).toHaveLength(0);
    await expectError(as(A, `insert into public.review_records (project_id, user_id, key, record) values ('${p.id}', auth.uid(), 'k', '{}')`), /row-level security/);
    // Kayıt sahibi çalışma sahibi olmalı (ortak yazar adına yazılamaz)
    await expectError(db.query(`insert into public.review_records (project_id, user_id, key, record) values ($1, '${B}', 'k', '{}')`, [p.id]), /ait değil/);
    await expectError(db.query(`insert into public.review_records (project_id, user_id, key, record, stage) values ($1, '${A}', 'k', '{}', 'bilinmeyen')`, [p.id]), /check/i);
    // Gözlem ve kurum denetim kayıtları kullanıcıya kapalı
    await db.query(`insert into public.ai_calls (model, ms, ok) values ('claude-haiku-5-5', 900, true)`);
    expect(await as(A, `select id from public.ai_calls`)).toHaveLength(0);
    expect(await as(A, `select id from public.org_audit_log`)).toHaveLength(0);
    // Paket kartı: Tek Proje’de koşulsuz “sınırsız” kalmadı
    const single = (await db.query<{ features: string[]; description: string }>("select features, description from public.plans where id = 'single'")).rows[0];
    for (const f of single.features) if (/^Sınırsız (kaynak|yapay)/.test(f)) expect(f).toMatch(/adil kullanım/);
    expect(single.description).toMatch(/adil kullanım/);
    // Çalışma silinince denetim ve derleme kayıtları da silinir
    await db.query(`delete from public.projects where id = $1`, [p.id]);
    expect((await db.query(`select 1 from public.review_records where project_id = $1`, [p.id])).rows).toHaveLength(0);
    expect((await db.query(`select 1 from public.claim_audits where project_id = $1`, [p.id])).rows).toHaveLength(0);
    await db.exec(`delete from public.ai_calls; delete from public.activity_log where user_id = '${A}';`);
  });
  it("ortak yazım (migration 32): üyelik ve davetleri yalnızca sahip/üye görür, yazamaz; üyenin sohbeti kendi adına", async () => {
    const [p] = (await db.query<{ id: string }>(`insert into public.projects (user_id, title, work_type, academic_level) values ('${A}', 'Ortak çalışma', 'research_article', 'master') returning id`)).rows;
    // Sunucu (service role) üyelik ve davet yazar
    await db.query(`insert into public.project_members (project_id, user_id, role, invited_by) values ($1, '${B}', 'editor', '${A}')`, [p.id]);
    await db.query(`insert into public.project_invites (project_id, email, role, token, invited_by) values ($1, 'c@ornek.com', 'commenter', repeat('x', 40), '${A}')`, [p.id]);
    // Sahip üyeleri ve davetleri görür; üye yalnızca kendi üyeliğini görür, davetleri göremez; ikisi de doğrudan yazamaz
    expect(await as(A, `select user_id from public.project_members where project_id = '${p.id}'`)).toHaveLength(1);
    expect(await as(A, `select id from public.project_invites where project_id = '${p.id}'`)).toHaveLength(1);
    expect(await as(B, `select user_id from public.project_members where project_id = '${p.id}'`)).toHaveLength(1);
    expect(await as(B, `select id from public.project_invites where project_id = '${p.id}'`)).toHaveLength(0);
    expect(await as(ADMIN, `select user_id from public.project_members where project_id = '${p.id}'`)).toHaveLength(0);
    await expectError(as(B, `insert into public.project_members (project_id, user_id, role) values ('${p.id}', '${ADMIN}', 'editor')`), /row-level security/);
    await expectError(as(A, `insert into public.project_invites (project_id, email, role, token, invited_by) values ('${p.id}', 'd@ornek.com', 'editor', repeat('y', 40), auth.uid())`), /row-level security/);
    expect(await as(B, `select user_id from public.project_presence`)).toHaveLength(0);
    // Çalışma içeriği sahibin kaydıdır: üye kendi adına bölüm yazamaz; RLS ile sahibin bölümünü de göremez (erişim sunucudan)
    await expectError(db.query(`insert into public.project_stages (project_id, user_id, key, title, position) values ($1, '${B}', 'x', 'X', 0)`, [p.id]), /ait değil/);
    await db.query(`insert into public.project_stages (project_id, user_id, key, title, position, last_editor) values ($1, '${A}', 'intro', 'Giriş', 0, '${B}')`, [p.id]);
    expect(await as(B, `select id from public.project_stages where project_id = '${p.id}'`)).toHaveLength(0);
    // Üyenin asistan sohbeti kendi adına açılabilir; üye olmayan açamaz
    await db.query(`insert into public.ai_conversations (project_id, user_id, title) values ($1, '${B}', 'Üye sohbeti')`, [p.id]);
    await expectError(db.query(`insert into public.ai_conversations (project_id, user_id, title) values ($1, '${ADMIN}', 'Yabancı')`, [p.id]), /ait değil/);
    expect(await as(A, `select id from public.ai_conversations where project_id = '${p.id}' and user_id = '${B}'`)).toHaveLength(0);
    // Otomatik tamamlama kullanım türü
    await db.query(`insert into public.usage_events (user_id, kind) values ('${B}', 'autocomplete')`);
    // Paket kartı satırı
    const f = (await db.query<{ id: string }>(`select id from public.plans where 'Ortak yazarlarla birlikte yazım' = any(features) order by id`)).rows.map((r) => r.id);
    expect(f).toEqual(["premium", "pro", "single"]);
    // Ücretsiz paket kartı: yeni satırlar “10 atıf stili” satırının hemen ardından gelir (yedek liste ile aynı sıra)
    const free = (await db.query<{ features: string[] }>("select features from public.plans where id = 'free'")).rows[0].features;
    const i = free.indexOf("10 atıf stili ve otomatik kaynakça");
    expect(free.slice(i + 1, i + 3)).toEqual(["Atıfları koruyan akademik İngilizce çeviri ve dil denetimi", "Kaynağa sor: makaleyle sayfa numaralı sohbet"]);
    // Çalışma silinince üyelik/davet/varlık kayıtları da kalkar
    await db.query(`delete from public.projects where id = $1`, [p.id]);
    expect((await db.query(`select 1 from public.project_members where project_id = $1`, [p.id])).rows).toHaveLength(0);
    expect((await db.query(`select 1 from public.project_invites where project_id = $1`, [p.id])).rows).toHaveLength(0);
    await db.exec(`delete from public.usage_events where kind = 'autocomplete'; delete from public.activity_log where user_id = '${A}';`);
  });
  it("Tek Proje maliyet uyarısı (migration 28): %40 geçince yöneticiye bir kez, kısıtlama yok", async () => {
    const W = "00000000-0000-4000-8000-0000000000f3";
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${W}', 'maliyet@ornek.com', '{}'); update public.profiles set plan_id = 'single' where id = '${W}';`);
    const st = (await db.query<{ s: string | null }>(`select single_started_at as s from public.profiles where id = '${W}'`)).rows[0].s;
    expect(st).not.toBeNull();
    // Bütçe: 3999 / 1,2 / 48 ≈ 69,43 $; %40 ≈ 27,77 $
    const [b] = (await db.query<{ budget_usd: string }>(`select * from public.single_cost_status('${W}')`)).rows;
    expect(Number(b.budget_usd)).toBeCloseTo(27.77, 1);
    await db.query(`insert into public.usage_events (user_id, kind, cost_usd) values ('${W}', 'ai_request', 20)`);
    expect((await db.query(`select 1 from public.activity_log where user_id = '${W}' and action = 'cost_40'`)).rows).toHaveLength(0);
    await db.query(`insert into public.usage_events (user_id, kind, cost_usd) values ('${W}', 'ai_request', 9)`);
    await db.query(`insert into public.usage_events (user_id, kind, cost_usd) values ('${W}', 'ai_request', 5)`);
    expect((await db.query(`select 1 from public.activity_log where user_id = '${W}' and action = 'cost_40'`)).rows).toHaveLength(1);
    const n = (await db.query<{ data: { rule: string; pct: number } }>(`select data from public.notifications where user_id = '${ADMIN}' and kind = 'abuse_alert'`)).rows;
    expect(n.map((r) => r.data.rule)).toEqual(["cost_40"]);
    // Kullanım kısıtlanmaz: paket sınırları sınırsız kalır
    const lim = (await db.query<{ l: { ai_requests_month: null; cost_usd_month: null } }>("select limits as l from public.plans where id = 'single'")).rows[0].l;
    expect(lim.ai_requests_month).toBeNull();
    expect(lim.cost_usd_month).toBeNull();
    await db.exec(`delete from public.notifications where user_id = '${ADMIN}'; delete from auth.users where id = '${W}';`);
  });
  it("Tek Proje paketi (migration 27): tek çalışma, silme/tür değiştirme engeli, kötüye kullanım uyarıları", async () => {
    const U = "00000000-0000-4000-8000-0000000000f1";
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${U}', 'tek@ornek.com', '{}')`);
    // Kullanıcının paket öncesi bir çalışması var; yönetici paketi atayınca o çalışma pakete bağlanır
    // Çalışmaları sunucu oluşturur (kullanıcının doğrudan ekleme yetkisi yok, D51)
    const [p1] = (await db.query<{ id: string }>(`insert into public.projects (user_id, title, work_type, academic_level) values ('${U}', 'Öğretmen öz yeterliği ve tükenmişlik', 'thesis', 'master') returning id`)).rows;
    await db.exec(`update public.profiles set plan_id = 'single' where id = '${U}'`);
    const bound = (await db.query<{ s: string }>(`select single_project_id as s from public.profiles where id = '${U}'`)).rows[0].s;
    expect(bound).toBe(p1.id);
    const plan = (await db.query<{ limits: { ai_requests_month: null; projects: number; cost_usd_month: null; one_time: boolean } }>("select limits from public.plans where id = 'single'")).rows[0];
    expect(plan.limits).toMatchObject({ ai_requests_month: null, projects: 1, cost_usd_month: null, one_time: true });
    // Engeller (kullanıcı kendisi)
    await expectError(as(U, "insert into public.projects (user_id, title, work_type, academic_level) values (auth.uid(), 'İkinci', 'research_article', 'master')"), /row-level security|yalnızca bir çalışma/);
    await expectError(as(U, `delete from public.projects where id = '${p1.id}'`), /silinemez/);
    await expectError(as(U, `update public.projects set work_type = 'research_article' where id = '${p1.id}'`), /türü değiştirilemez/);
    await expectError(as(U, `update public.profiles set single_project_id = null where id = auth.uid()`), /yetkiniz yok/);
    // Uyarı: konu tamamen değişir (3.000+ kelime varken) → yöneticiye bildirim
    await db.query(`insert into public.project_stages (project_id, user_id, key, title, word_count, position) values ('${p1.id}', '${U}', 'introduction', 'Giriş', 5000, 0)`);
    await as(U, `update public.projects set title = 'Yapay zekâ destekli kanser tanısı' where id = '${p1.id}'`);
    // Uyarı: indirdikten sonra büyük silme
    await db.query(`insert into public.usage_events (user_id, kind, meta, created_at) values ('${U}', 'export', '{"projectId":"${p1.id}","format":"docx"}', now() - interval '1 second')`);
    await db.query(`update public.project_stages set word_count = 1000 where project_id = '${p1.id}'`);
    const rules = (await db.query<{ action: string }>(`select action from public.activity_log where user_id = '${U}' and kind = 'abuse_alert' order by id`)).rows.map((r) => r.action);
    expect(rules).toEqual(["topic_change", "delete_after_export"]);
    const admin = (await db.query<{ data: { rule: string; email: string } }>(`select data from public.notifications where user_id = '${ADMIN}' and kind = 'abuse_alert' order by id`)).rows.map((r) => [r.data.rule, r.data.email]);
    expect(admin).toEqual([["topic_change", "tek@ornek.com"], ["delete_after_export", "tek@ornek.com"]]);
    // Aynı kural 24 saatte bir kez
    await db.query(`update public.project_stages set word_count = 6000 where project_id = '${p1.id}'`);
    await db.query(`update public.project_stages set word_count = 100 where project_id = '${p1.id}'`);
    expect((await db.query(`select 1 from public.activity_log where user_id = '${U}' and action = 'delete_after_export'`)).rows).toHaveLength(1);
    // Paket atandığında çalışması olmayan kullanıcı: ilk açtığı çalışma pakete bağlanır
    const V = "00000000-0000-4000-8000-0000000000f2";
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${V}', 'yeni-tek@ornek.com', '{}'); update public.profiles set plan_id = 'single' where id = '${V}';`);
    const [v1] = (await db.query<{ id: string }>(`insert into public.projects (user_id, title, work_type, academic_level) values ('${V}', 'İlk', 'research_article', 'master') returning id`)).rows;
    expect((await db.query<{ s: string }>(`select single_project_id as s from public.profiles where id = '${V}'`)).rows[0].s).toBe(v1.id);
    await db.exec(`delete from public.profiles where id = '${V}'; delete from auth.users where id = '${V}';`);
    // Hesap silme (çalışmaları ve kanıt kaydıyla birlikte) hata vermeden çalışır
    await db.exec(`delete from auth.users where id = '${U}'`);
    expect((await db.query(`select 1 from public.profiles where id = '${U}'`)).rows).toHaveLength(0);
    // Yönetici silebilir; temizlik
    await db.exec(`delete from public.notifications where user_id = '${ADMIN}'; delete from public.profiles where id = '${U}'; delete from auth.users where id = '${U}';`);
  });
  it("kullanım kanıt kaydı (migration 26): metin/bölüm/çalışma silmeleri kaydedilir, kullanıcı göremez", async () => {
    const [p] = (await db.query<{ id: string }>(`insert into public.projects (user_id, title, work_type, academic_level) values ('${A}', 'Kanıt Tezi', 'thesis', 'master') returning id`)).rows;
    const [s1] = (await db.query<{ id: string }>(`insert into public.project_stages (project_id, user_id, key, title, word_count, position) values ('${p.id}', '${A}', 'introduction', 'Giriş', 2000, 0) returning id`)).rows;
    await db.query(`insert into public.project_stages (project_id, user_id, key, title, word_count, position) values ('${p.id}', '${A}', 'method', 'Yöntem', 1500, 1)`);
    await db.exec(`update public.project_stages set word_count = 1800 where id = '${s1.id}'`); // 200 kelime: kaydedilmez
    await db.exec(`update public.project_stages set word_count = 400 where id = '${s1.id}'`); // 1400 kelime silindi
    await db.exec(`delete from public.project_stages where id = '${s1.id}'`);
    await db.exec(`delete from public.projects where id = '${p.id}'`);
    const rows = (await db.query<{ kind: string; words: number; stage_title: string | null; project_title: string }>(`select kind, words, stage_title, project_title from public.activity_log where user_id = '${A}' order by id`)).rows;
    expect(rows).toEqual([
      { kind: "text_removed", words: 1400, stage_title: "Giriş", project_title: "Kanıt Tezi" },
      { kind: "stage_deleted", words: 400, stage_title: "Giriş", project_title: "Kanıt Tezi" },
      { kind: "project_deleted", words: 1500, stage_title: null, project_title: "Kanıt Tezi" },
    ]);
    expect(await as(A, "select * from public.activity_log")).toHaveLength(0);
    await db.exec(`delete from public.activity_log where user_id = '${A}'`);
  });
  it("davet ödülü aynı cihaz önlemi (migration 25)", async () => {
    const code = (await db.query<{ referral_code: string }>(`select referral_code from public.profiles where id = '${A}'`)).rows[0].referral_code;
    const dev = "a".repeat(64), other = "b".repeat(64);
    await db.exec(`insert into public.user_devices (user_id, device) values ('${A}', '${dev}')`);
    const [S, D, U] = ["00000000-0000-4000-8000-0000000000e1", "00000000-0000-4000-8000-0000000000e2", "00000000-0000-4000-8000-0000000000e3"];
    // Davet edenin cihazından kayıt → ödül yok, bilgi bildirimi
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${S}', 's@ornek.com', '{"ref":"${code}","did":"${dev}"}')`);
    // Başka cihazdan kayıt → ödül
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${D}', 'd@ornek.com', '{"ref":"${code}","did":"${other}"}')`);
    // Cihaz bilgisi yok → karar ilk girişe kalır (işaretlenmez)
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${U}', 'u@ornek.com', '{"ref":"${code}"}')`);
    const credits = (await db.query<{ n: number }>(`select count(*)::int as n from public.usage_credits where user_id = '${A}' and reason = 'referral_inviter'`)).rows[0].n;
    expect(credits).toBe(3);
    const kinds = (await db.query<{ kind: string }>(`select kind from public.notifications where user_id = '${A}' order by id`)).rows.map((r) => r.kind);
    expect(kinds).toEqual(["referral_same_device", "referral_reward"]);
    const u = (await db.query<{ referral_rewarded_at: string | null; signup_device: string | null }>(`select referral_rewarded_at, signup_device from public.profiles where id = '${U}'`)).rows[0];
    expect(u).toEqual({ referral_rewarded_at: null, signup_device: null });
    expect((await db.query(`select 1 from public.user_devices where user_id = '${D}' and device = '${other}'`)).rows).toHaveLength(1);
    // Geçersiz cihaz değeri yok sayılır
    await db.exec(`delete from public.usage_credits where user_id = '${A}' and reason = 'referral_inviter'; delete from public.notifications where user_id = '${A}'; delete from public.user_devices where user_id = '${A}';`);
    await db.exec(`delete from public.profiles where id in ('${S}','${D}','${U}'); delete from auth.users where id in ('${S}','${D}','${U}');`);
  });
  it("paket özellikleri (migration 30): ücretsizde PDF, Premium’da öncelikli destek yok, tekrar çalıştırmak güvenli", async () => {
    const q = async () => (await db.query<{ id: string; ef: string[]; features: string[] }>("select id, limits->'export_formats' as ef, features from public.plans where id in ('free','basic','premium') order by sort_order")).rows;
    const [free, basic, premium] = await q();
    expect(free.ef).toContain("pdf");
    expect(free.features).toContain("TXT / PDF / Markdown dışa aktarma");
    expect(basic.features).not.toContain("Word / PDF dışa aktarma");
    expect(premium.features).not.toContain("Öncelikli destek");
    const f = fs.readdirSync(path.resolve(__dirname, "../supabase/migrations")).find((x) => x.includes("free_pdf_no_priority"))!;
    await db.exec(fs.readFileSync(path.resolve(__dirname, "../supabase/migrations", f), "utf8"));
    const again = await q();
    expect(again[0].ef.filter((x) => x === "pdf")).toHaveLength(1);
  });
  it("Tek Proje gözetimi (migration 31): parmak izi, satın alma ve karar tabloları yalnızca sunucuya açık", async () => {
    const sig = `{${Array.from({ length: 64 }, (_, i) => i - 32).join(",")}}`;
    const [fp] = (await db.query<{ id: number }>(`insert into public.export_fingerprints (user_id, project_id, words, sig, author) values ('${A}', gen_random_uuid(), 3500, '${sig}', 'Ayşe') returning id`)).rows;
    expect(fp.id).toBeGreaterThan(0);
    await expectError(db.query(`insert into public.export_fingerprints (user_id, project_id, sig) values ('${A}', gen_random_uuid(), '{1,2,3}')`), /check/);
    await db.query(`insert into public.plan_purchases (user_id, plan_id, payer_name, payer_phone, amount_try, created_by) values ('${A}', 'single', 'Ayşe Yılmaz', '0555', 3999, '${ADMIN}')`);
    const [al] = (await db.query<{ id: number }>(`insert into public.activity_log (user_id, kind, action, output) values ('${A}', 'abuse_alert', 'content_replaced', '{}') returning id`)).rows;
    await db.query(`insert into public.abuse_decisions (alert_id, decision, decided_by) values (${al.id}, 'warn', '${ADMIN}')`);
    await expectError(db.query(`insert into public.abuse_decisions (alert_id, decision) values (${al.id}, 'ban')`), /duplicate|check/);
    // Kullanıcılar ve yönetici oturumu bile doğrudan göremez (yalnızca sunucu, service role)
    expect(await as(A, "select * from public.export_fingerprints")).toHaveLength(0);
    expect(await as(A, "select * from public.plan_purchases")).toHaveLength(0);
    expect(await as(A, "select * from public.abuse_decisions")).toHaveLength(0);
    await db.exec(`delete from public.activity_log where id = ${al.id}`);
    expect((await db.query(`select 1 from public.abuse_decisions where alert_id = ${al.id}`)).rows).toHaveLength(0);
    await db.exec(`delete from public.export_fingerprints where user_id = '${A}'; delete from public.plan_purchases where user_id = '${A}';`);
  });
  it("durum sorgusu (check_status.sql) tüm migration'ları YAPILMIŞ gösterir", async () => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/check_status.sql"), "utf8");
    const res = await db.exec(sql);
    const rows = res[res.length - 1].rows as Record<string, string>[];
    expect(rows.length).toBeGreaterThanOrEqual(10);
    const bad = rows.filter((r) => !Object.values(r).includes("YAPILMIŞ"));
    expect(bad).toEqual([]);
  });
  it("davet ödülü e-posta doğrulaması ve geçici e-posta (migration 29)", async () => {
    const code = (await db.query<{ referral_code: string }>(`select referral_code from public.profiles where id = '${A}'`)).rows[0].referral_code;
    const [P, T] = ["00000000-0000-4000-8000-00000000e9a1", "00000000-0000-4000-8000-00000000e9a2"];
    const credits = async () => (await db.query<{ n: number }>(`select count(*)::int as n from public.usage_credits where user_id = '${A}' and reason = 'referral_inviter'`)).rows[0].n;
    // Doğrulanmamış e-posta → ödül bekler
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at) values ('${P}', 'p@ornek.com', '{"ref":"${code}","did":"${"1".repeat(64)}"}', null)`);
    expect(await credits()).toBe(0);
    expect((await db.query(`select 1 from public.profiles where id = '${P}' and referral_rewarded_at is null`)).rows).toHaveLength(1);
    // Doğrulanınca verilir
    await db.exec(`update auth.users set email_confirmed_at = now() where id = '${P}'`);
    expect(await credits()).toBe(3);
    // Geçici e-posta (alt alan adı dahil) → ödül yok, bilgi bildirimi
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${T}', 'x@mail.yopmail.com', '{"ref":"${code}","did":"${"2".repeat(64)}"}')`);
    expect(await credits()).toBe(3);
    const kinds = (await db.query<{ kind: string }>(`select kind from public.notifications where user_id = '${A}' order by id`)).rows.map((r) => r.kind);
    expect(kinds).toEqual(["referral_reward", "referral_disposable_email"]);
    expect((await db.query(`select 1 from public.profiles where id = '${T}' and referral_rewarded_at is not null`)).rows).toHaveLength(1);
    await db.exec(`delete from public.usage_credits where user_id = '${A}' and reason = 'referral_inviter'; delete from public.notifications where user_id = '${A}'; delete from public.profiles where id in ('${P}','${T}'); delete from auth.users where id in ('${P}','${T}');`);
  });
  it("davet ödülü (migration 23): kayıt anında yalnızca davet edene, Ücretsiz paket kadar, bir kez", async () => {
    const code = (await db.query<{ referral_code: string }>(`select referral_code from public.profiles where id = '${A}'`)).rows[0].referral_code;
    const N = "00000000-0000-4000-8000-0000000000d1";
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${N}', 'yeni@ornek.com', '{"ref":"${code}","did":"${"c".repeat(64)}"}')`);
    const prof = (await db.query<{ referred_by: string; referral_rewarded_at: string | null }>(`select referred_by, referral_rewarded_at from public.profiles where id = '${N}'`)).rows[0];
    expect(prof.referred_by).toBe(A);
    expect(prof.referral_rewarded_at).not.toBeNull();
    const inviter = (await db.query<{ kind: string; amount: number }>(`select kind, amount from public.usage_credits where user_id = '${A}' and reason = 'referral_inviter' order by kind`)).rows;
    expect(inviter).toEqual([{ kind: "ai_requests", amount: 10 }, { kind: "pages", amount: 5 }, { kind: "source_searches", amount: 7 }]);
    expect((await db.query(`select 1 from public.usage_credits where user_id = '${N}'`)).rows).toHaveLength(0);
    // Aynı kişi için ikinci kez verilmez
    await db.exec(`update public.profiles set referred_by = referred_by where id = '${N}'`);
    expect((await db.query(`select 1 from public.usage_credits where user_id = '${A}' and reason = 'referral_inviter'`)).rows).toHaveLength(3);
    // Bildirim kutusu (D100): davet edene tek bildirim; davetliye yok; kullanıcı yalnızca okundu işaretleyebilir
    const notes = (await db.query<{ kind: string; data: { ai: number; ss: number; days: number } }>(`select kind, data from public.notifications where user_id = '${A}'`)).rows;
    expect(notes).toEqual([{ kind: "referral_reward", data: { ai: 10, ss: 7, pg: 5, days: 60 } }]);
    expect((await db.query(`select 1 from public.notifications where user_id = '${N}'`)).rows).toHaveLength(0);
    expect(await as(B, "select * from public.notifications")).toHaveLength(0);
    expect(await as(A, "update public.notifications set read_at = now() returning id")).toHaveLength(1);
    await expectError(as(A, "update public.notifications set data = '{}'::jsonb"), /yetkiniz yok/);
    await expectError(as(A, "insert into public.notifications (user_id, kind) values (auth.uid(), 'sahte')"), /row-level security/);    // Sonraki testler için temizlik
    await db.exec(`delete from public.usage_credits where user_id = '${A}' and reason = 'referral_inviter'; delete from public.notifications where user_id = '${A}'; delete from public.profiles where id = '${N}'; delete from auth.users where id = '${N}';`);
  });
  it("paket vaatleri (migration 22): sayfa satırı eklenir, tekrar çalıştırmak güvenli, elle yapılan düzenleme korunur", async () => {
    await db.exec("update public.plans set features = array_replace(features, 'TXT / Markdown dışa aktarma', 'TXT / PDF / Markdown dışa aktarma') where id = 'free'");
    const f = fs.readdirSync(path.resolve(__dirname, "../supabase/migrations")).find((x) => x.includes("package_promises"))!;
    await db.exec(fs.readFileSync(path.resolve(__dirname, "../supabase/migrations", f), "utf8"));
    const rows = await db.query<{ id: string; features: string[]; pages: string }>("select id, features, limits->>'pages_month' as pages from public.plans order by sort_order");
    const by = Object.fromEntries(rows.rows.map((r) => [r.id, r]));
    expect(by.free.features[1]).toBe("Yapay zekâ ile yaklaşık 5 sayfa deneme taslağı");
    expect(by.free.features).toContain("TXT / PDF / Markdown dışa aktarma");
    expect(by.pro.features.filter((x) => x.startsWith("Ayda yaklaşık 50 sayfa"))).toHaveLength(1);
    expect(by.pro.features).toContain("Sınırsız kaynak taraması (adil kullanım)");
    expect(by.premium.features.join()).not.toMatch(/8\.000|En yüksek yapay zekâ/);
    expect([by.free.pages, by.basic.pages, by.pro.pages, by.premium.pages]).toEqual(["5", "25", "50", "85"]);
  });
  it("paketleri ve ayarları oluşturur", async () => {
    const plans = await db.query<{ id: string }>("select id from public.plans order by sort_order");
    expect(plans.rows.map((r) => r.id)).toEqual(["free", "basic", "pro", "premium", "single"]);
    const p = await db.query<{ id: string; price_monthly: string; limits: Record<string, number | null> }>("select id, price_monthly, limits from public.plans order by sort_order");
    const by = Object.fromEntries(p.rows.map((r) => [r.id, r]));
    expect(by.free.limits.ai_requests_month).toBe(10); // D52: gelirin 1/3’ü maliyet
    expect(by.free.limits.source_searches_month).toBe(7);
    expect(by.basic.limits).toMatchObject({ projects: 3, ai_requests_month: 50, source_searches_month: 100, pages_month: 25 });
    expect(by.pro.limits.ai_requests_month).toBe(90);
    expect(by.premium.limits.ai_requests_month).toBe(150);
    expect(Number(by.basic.price_monthly)).toBe(749);
    expect(by.pro.limits.projects).toBe(10);
    expect(Number(by.pro.price_monthly)).toBe(1349);
    expect(Number(by.premium.price_monthly)).toBe(2249);
    // Paket kartları özellik listesi gösterir, yapay zekâ isteği sayısı göstermez (D49)
    const f = await db.query<{ features: string[] }>("select features from public.plans");
    for (const r of f.rows) expect(r.features.join(" ")).not.toMatch(/yapay zekâ isteği/);
    const s = await db.query<{ key: string }>("select key from public.app_settings order by key");
    expect(s.rows.map((r) => r.key)).toContain("ai.models");
  });
  it("kayıt tetikleyicisi ücretsiz paketli profil oluşturur", async () => {
    const [p] = await as<{ full_name: string; plan_id: string; role: string }>(A, "select full_name, plan_id, role from public.profiles where id = auth.uid()");
    expect(p).toEqual({ full_name: "Ayşe", plan_id: "free", role: "user" });
  });
});

describe("RLS: kullanıcı izolasyonu", () => {
  let projectId = "";
  let stageId = "";

  it("kullanıcı kendi projesini oluşturur ve görür", async () => {
    // Projeleri yalnızca sunucu oluşturur (kota kontrolü; D51)
    await expectError(as(A, "insert into public.projects (user_id, title, work_type) values (auth.uid(), 'x', 'thesis')"), /row-level security/);
    const [p] = (await db.query<{ id: string }>("insert into public.projects (user_id, title, work_type) values ($1, 'Tezim', 'thesis') returning id", [A])).rows;
    projectId = p.id;
    const [st] = await as<{ id: string }>(A, "insert into public.project_stages (project_id, user_id, key, title, position, content_text) values ($1, auth.uid(), 'topic', 'Konu', 0, 'gizli metin') returning id", [projectId]);
    stageId = st.id;
    expect((await as(A, "select id from public.projects")).length).toBe(1);
  });

  it("başka kullanıcı projeyi ve bölümleri göremez, değiştiremez, silemez", async () => {
    expect(await as(B, "select * from public.projects")).toHaveLength(0);
    expect(await as(B, "select * from public.project_stages")).toHaveLength(0);
    await as(B, "update public.projects set title = 'ele geçirildi' where id = $1", [projectId]);
    await as(B, "delete from public.project_stages where id = $1", [stageId]);
    const [p] = await as<{ title: string }>(A, "select title from public.projects where id = $1", [projectId]);
    expect(p.title).toBe("Tezim");
    expect(await as(A, "select id from public.project_stages")).toHaveLength(1);
  });

  it("anonim kullanıcı hiçbir proje göremez", async () => {
    expect(await as(null, "select * from public.projects")).toHaveLength(0);
  });

  it("başkasının projesine kendi user_id'siyle alt kayıt ekleyemez (tetikleyici)", async () => {
    await expectError(as(B, "insert into public.project_stages (project_id, user_id, key, title, position) values ($1, auth.uid(), 'x', 'X', 1)", [projectId]), /Proje bu kullanıcıya ait değil/);
    await expectError(as(B, "insert into public.sources (project_id, user_id, title, origin) values ($1, auth.uid(), 'Sahte', 'manual')", [projectId]), /Proje bu kullanıcıya ait değil/);
  });

  it("başkası adına kayıt ekleyemez (with check)", async () => {
    await expectError(as(B, "insert into public.projects (user_id, title, work_type) values ($1, 'x', 'thesis')", [A]), /row-level security/);
  });

  it("başkasının sohbetine mesaj ekleyemez", async () => {
    const [c] = await as<{ id: string }>(A, "insert into public.ai_conversations (project_id, user_id) values ($1, auth.uid()) returning id", [projectId]);
    await expectError(as(B, "insert into public.ai_messages (conversation_id, user_id, role, content) values ($1, auth.uid(), 'user', 'x')", [c.id]), /Sohbet bu kullanıcıya ait değil/);
  });

  it("RAG araması yalnızca kendi parçalarını döndürür", async () => {
    await as(A, "insert into public.source_chunks (file_id, project_id, user_id, chunk_index, content) select null, $1, auth.uid(), 0, 'bağlanma kuramı ebeveyn tutumları' where false", [projectId]);
    const [src] = await as<{ id: string }>(A, "insert into public.sources (project_id, user_id, title, origin) values ($1, auth.uid(), 'Bağlanma', 'manual') returning id", [projectId]);
    await as(A, "insert into public.source_chunks (source_id, project_id, user_id, chunk_index, content) values ($1, $2, auth.uid(), 0, 'bağlanma kuramı ebeveyn tutumları ile ilişkilidir')", [src.id, projectId]);
    expect(await as(A, "select * from public.search_project_chunks($1, 'bağlanma', 5)", [projectId])).toHaveLength(1);
    expect(await as(B, "select * from public.search_project_chunks($1, 'bağlanma', 5)", [projectId])).toHaveLength(0);
  });
});

describe("ayrıcalık ve yönetici politikaları", () => {
  it("kullanıcı kendi rolünü, paketini veya askı durumunu değiştiremez", async () => {
    await expectError(as(A, "update public.profiles set role = 'admin' where id = auth.uid()"), /yetkiniz yok/);
    await expectError(as(A, "update public.profiles set plan_id = 'premium' where id = auth.uid()"), /yetkiniz yok/);
    await as(A, "update public.profiles set full_name = 'Ayşe Y.' where id = auth.uid()");
    const [p] = await as<{ full_name: string }>(A, "select full_name from public.profiles where id = auth.uid()");
    expect(p.full_name).toBe("Ayşe Y.");
  });

  it("kullanıcılar birbirlerinin profilini göremez; yönetici görür", async () => {
    expect(await as(B, "select * from public.profiles")).toHaveLength(1);
    expect((await as(ADMIN, "select * from public.profiles")).length).toBe(3);
  });

  it("yönetici kullanıcı projelerini okuyabilir ve paket atayabilir", async () => {
    expect((await as(ADMIN, "select * from public.projects")).length).toBe(1);
    await as(ADMIN, `update public.profiles set plan_id = 'pro' where id = '${B}'`);
    const [p] = await as<{ plan_id: string }>(B, "select plan_id from public.profiles where id = auth.uid()");
    expect(p.plan_id).toBe("pro");
  });

  it("sistem promptları normal kullanıcıya kapalıdır; paketler herkese açıktır", async () => {
    expect(await as(A, "select * from public.app_settings")).toHaveLength(0);
    expect((await as(ADMIN, "select * from public.app_settings")).length).toBeGreaterThan(0);
    expect((await as(null, "select id from public.plans")).length).toBe(5);
    await expectError(as(A, "update public.plans set price_monthly = 0 where id = 'pro' returning id").then((r) => { if (!r.length) throw new Error("row-level security: güncellenmedi"); }), /row-level security/);
  });

  it("kullanım kayıtlarını kullanıcı yazamaz (yalnızca sunucu)", async () => {
    await expectError(as(A, "insert into public.usage_events (user_id, kind) values (auth.uid(), 'ai_request')"), /row-level security/);
  });

  it("hata kayıtlarını yalnızca yönetici okur", async () => {
    await db.exec("insert into public.error_logs (route, message) values ('test', 'hata')");
    expect(await as(A, "select * from public.error_logs")).toHaveLength(0);
    expect(await as(ADMIN, "select * from public.error_logs")).toHaveLength(1);
  });
});

describe("danışman paylaşımı", () => {
  it("paylaşım bağlantılarını yalnızca sahibi görür; başkasının projesine bağlantı oluşturulamaz", async () => {
    const [p] = await as<{ id: string }>(A, "select id from public.projects limit 1");
    await as(A, "insert into public.project_shares (project_id, user_id, token) values ($1, auth.uid(), repeat('a', 32))", [p.id]);
    expect(await as(A, "select * from public.project_shares")).toHaveLength(1);
    expect(await as(B, "select * from public.project_shares")).toHaveLength(0);
    expect(await as(null, "select * from public.project_shares")).toHaveLength(0);
    await expectError(as(B, "insert into public.project_shares (project_id, user_id, token) values ($1, auth.uid(), repeat('b', 32))", [p.id]), /Proje bu kullanıcıya ait değil/);
  });
});

describe("depolama politikaları", () => {
  it("kullanıcı yalnızca kendi klasörüne dosya yükleyebilir", async () => {
    await as(A, `insert into storage.objects (bucket_id, name) values ('user-files', '${A}/makale.pdf')`);
    await expectError(as(A, `insert into storage.objects (bucket_id, name) values ('user-files', '${B}/sizinti.pdf')`), /row-level security/);
    expect(await as(B, "select * from storage.objects")).toHaveLength(0);
    expect(await as(A, "select * from storage.objects")).toHaveLength(1);
  });
});

describe("kurumsal lisans, davet ve krediler", () => {
  const C = "44444444-4444-4444-4444-444444444444";
  it("her profilin tekil davet kodu var; kayıtta ref ile davet eden bağlanır", async () => {
    const [a] = await as<{ referral_code: string }>(A, "select referral_code from public.profiles where id = auth.uid()");
    expect(a.referral_code).toMatch(/^[0-9A-F]{8}$/);
    await db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, 'c@ornek.com', $2)", [C, JSON.stringify({ ref: a.referral_code.toLowerCase(), did: "d".repeat(64) })]);
    const [c] = await as<{ referred_by: string; referral_code: string }>(C, "select referred_by, referral_code from public.profiles where id = auth.uid()");
    expect(c.referred_by).toBe(A);
    expect(c.referral_code).not.toBe(a.referral_code);
  });
  it("kullanıcı davet alanlarını kendisi değiştiremez", async () => {
    await expectError(as(C, "update public.profiles set referred_by = null where id = auth.uid()"), /yetkiniz yok/);
    await expectError(as(C, "update public.profiles set referral_code = 'AAAAAAAA' where id = auth.uid()"), /yetkiniz yok/);
    await expectError(as(C, "update public.profiles set referral_rewarded_at = now() where id = auth.uid()"), /yetkiniz yok/);
  });
  it("indirim kodları (migration 38): kayıtta bağlanır, sınırlar uygulanır, kullanıcı göremez ve değiştiremez", async () => {
    await db.exec(`insert into public.discount_codes (code, kind, value, max_uses) values ('OGRENCI20', 'percent', 20, 1), ('ESKI', 'amount_try', 100, null)`);
    await db.exec(`update public.discount_codes set active = false where code = 'ESKI'`);
    await expectError(db.query(`insert into public.discount_codes (code, kind, value) values ('FAZLA', 'percent', 120)`), /check/);
    const [K1, K2, K3] = ["00000000-0000-4000-8000-00000000dc01", "00000000-0000-4000-8000-00000000dc02", "00000000-0000-4000-8000-00000000dc03"];
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${K1}', 'k1@ornek.com', '{"discount":" ogrenci20 "}')`);
    // Kullanım sınırı doldu → bağlanmaz; pasif kod → bağlanmaz
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${K2}', 'k2@ornek.com', '{"discount":"OGRENCI20"}')`);
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${K3}', 'k3@ornek.com', '{"discount":"ESKI"}')`);
    const codes = (await db.query<{ id: string; discount_code: string | null }>(`select id, discount_code from public.profiles where id in ('${K1}','${K2}','${K3}') order by id`)).rows.map((r) => r.discount_code);
    expect(codes).toEqual(["OGRENCI20", null, null]);
    expect((await db.query<{ uses: number }>(`select uses from public.discount_codes where code = 'OGRENCI20'`)).rows[0].uses).toBe(1);
    // Kullanıcı kodları okuyamaz ve kendi kodunu değiştiremez
    expect(await as(K1, "select * from public.discount_codes")).toHaveLength(0);
    await expectError(as(K1, "update public.profiles set discount_code = null where id = auth.uid()"), /yetkiniz yok/);
    await db.exec(`delete from public.profiles where id in ('${K1}','${K2}','${K3}'); delete from auth.users where id in ('${K1}','${K2}','${K3}'); delete from public.discount_codes;`);
  });
  it("sayfa hakkı (migration 38): yazılan kelimeler toplanır", async () => {
    await db.query(`insert into public.usage_events (user_id, kind, meta) values ($1, 'ai_request', '{"words": 1200}'), ($1, 'ai_request', '{"words": 300}'), ($1, 'ai_request', '{}')`, [B]);
    expect(Number((await db.query<{ w: string }>(`select public.usage_words($1, now() - interval '1 hour') as w`, [B])).rows[0].w)).toBe(1500);
    await db.exec(`delete from public.usage_events where user_id = '${B}'`);
    const plans = (await db.query<{ id: string; p: string; f: string[] }>(`select id, limits->>'pages_month' as p, features as f from public.plans where id in ('free','basic','pro','premium') order by sort_order`)).rows;
    expect(plans.map((x) => x.p)).toEqual(["5", "25", "50", "85"]);
    expect(plans[0].f).toContain("Yapay zekâ ile 5 sayfa deneme taslağı");
    expect(plans[1].f).toContain("Ayda 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)");
  });
  it("krediler: kullanıcı yalnızca kendininkini görür, yazamaz", async () => {
    await db.query("insert into public.usage_credits (user_id, kind, amount, reason) values ($1, 'ai_requests', 50, 'davet')", [A]);
    // A’nın ayrıca C’yi davet ettiği için kayıtta aldığı davet ödülü vardır (D99)
    expect(await as(A, "select * from public.usage_credits where reason = 'davet'")).toHaveLength(1);
    expect(await as(A, "select * from public.usage_credits where reason = 'referral_inviter'")).toHaveLength(3);
    expect(await as(B, "select * from public.usage_credits")).toHaveLength(0);
    await expectError(as(A, "insert into public.usage_credits (user_id, kind, amount, reason) values (auth.uid(), 'ai_requests', 9999, 'hile')"), /row-level security/);
  });
  it("kurum: üye kendi kurumunu görür, başkası göremez; üyeliği kendisi ekleyemez", async () => {
    const [org] = await as<{ id: string; join_code: string }>(ADMIN, "insert into public.organizations (name, plan_id, seats) values ('Örnek Üniversite', 'premium', 2) returning id, join_code");
    expect(org.join_code).toMatch(/^[0-9A-F]{10}$/);
    await as(ADMIN, "insert into public.organization_members (org_id, user_id, role) values ($1, $2, 'admin'), ($1, $3, 'member')", [org.id, A, C]);
    expect(await as(A, "select * from public.organizations")).toHaveLength(1);
    expect(await as(B, "select * from public.organizations")).toHaveLength(0);
    // Kurum yöneticisi üyeleri görür, sıradan üye yalnızca kendini
    expect(await as(A, "select * from public.organization_members")).toHaveLength(2);
    expect(await as(C, "select * from public.organization_members")).toHaveLength(1);
    await expectError(as(B, "insert into public.organization_members (org_id, user_id) values ($1, auth.uid())", [org.id]), /row-level security/);
    await expectError(as(A, "update public.organizations set plan_id = 'premium', seats = 9999 where id = $1", [org.id]).then((r) => { if (!r.length) throw new Error("row-level security: güncelleme engellendi"); }), /row-level security/);
    // Bir kullanıcı ikinci bir kuruma üye olamaz
    const [org2] = await as<{ id: string }>(ADMIN, "insert into public.organizations (name) values ('İkinci') returning id");
    await expectError(as(ADMIN, "insert into public.organization_members (org_id, user_id) values ($1, $2)", [org2.id, A]), /duplicate key|unique/);
  });
});

describe("anketler", () => {
  it("anketi ve cevaplarını yalnızca sahibi görür; cevap yazımı ve sayaç yalnızca sunucuda", async () => {
    const [p] = await as<{ id: string }>(A, "select id from public.projects limit 1");
    const [sv] = await as<{ id: string; token: string }>(A, "insert into public.surveys (user_id, project_id, title) values (auth.uid(), $1, 'Anket') returning id, token", [p.id]);
    expect(sv.token.length).toBeGreaterThanOrEqual(24);
    expect(await as(B, "select * from public.surveys")).toHaveLength(0);
    expect(await as(null, "select * from public.surveys")).toHaveLength(0);
    // Başkasının projesine anket bağlanamaz
    await expectError(as(B, "insert into public.surveys (user_id, project_id, title) values (auth.uid(), $1, 'X')", [p.id]), /Proje bu kullanıcıya ait değil/);
    // Kullanıcı ve anonim cevap ekleyemez (yalnızca service role)
    await expectError(as(A, "insert into public.survey_responses (survey_id, user_id, answers) values ($1, auth.uid(), '{}')", [sv.id]));
    await expectError(as(null, "insert into public.survey_responses (survey_id, user_id, answers) values ($1, $2, '{}')", [sv.id, A]));
    // Sayaç kullanıcı tarafından değiştirilemez
    await as(A, "update public.surveys set response_count = 999, title = 'Yeni' where id = $1", [sv.id]);
    const [row] = await as<{ response_count: number; title: string }>(A, "select response_count, title from public.surveys where id = $1", [sv.id]);
    expect(row).toEqual({ response_count: 0, title: "Yeni" });
  });
  it("çalışma kilidi kaldırıldı (D81): eski bayrak olsa bile kullanıcı içeriğini okur ve düzenler; bayrağı kendisi değiştiremez", async () => {
    const stageId = (await db.query<{ id: string }>("select id from public.project_stages where user_id = $1 and content_text = 'gizli metin' limit 1", [A])).rows[0].id;
    await db.query("update public.profiles set work_locked = true where id = $1", [A]);
    expect(await as(A, "select id from public.project_stages where id = $1", [stageId])).toHaveLength(1);
    expect((await as(A, "select id from public.sources")).length).toBeGreaterThanOrEqual(0);
    await expectError(as(A, "update public.profiles set work_locked = false where id = auth.uid()"), /yetkiniz yok/);
    await as(A, "update public.project_stages set content_text = 'gizli metin' where id = $1", [stageId]);
    await db.query("update public.profiles set work_locked = false where id = $1", [A]);
    expect(await as(B, "select * from public.download_passes")).toHaveLength(0);
  });

  it("sayaçlar: aylık toplam veritabanında doğru hesaplanır; arşivden çıkarma yalnızca sunucuda", async () => {
    const U = "33333333-3333-3333-3333-333333333333";
    await db.query("insert into auth.users (id, email) values ($1, 'u3@x.com') on conflict do nothing", [U]);
    const rows = Array.from({ length: 1500 }, (_, i) => `('${U}', 'ai_request', 1, 10, 5, 0.01, now() - interval '${i % 3} minutes')`).join(",");
    await db.query(`insert into public.usage_events (user_id, kind, quantity, tokens_in, tokens_out, cost_usd, created_at) values ${rows}`);
    await db.query(`insert into public.usage_events (user_id, kind, quantity, created_at) values ('${U}', 'source_search', 4, now()), ('${U}', 'source_search', 3, now() - interval '60 days')`);
    const [t] = (await db.query<{ ai_requests: string; tokens: string; source_searches: string }>("select * from public.usage_totals($1, date_trunc('month', now()))", [U])).rows;
    expect(Number(t.ai_requests)).toBe(1500); // 1000 satır sınırına takılmaz
    expect(Number(t.tokens)).toBe(1500 * 15);
    expect(Number(t.source_searches)).toBe(4); // önceki ayın kaydı sayılmaz
    expect(Number((t as unknown as { cost_usd: string }).cost_usd)).toBeCloseTo(15, 5); // aylık API maliyeti
    const other = await as<{ ai_requests: string }>(A, "select ai_requests from public.usage_totals($1, date_trunc('month', now()))", [U]);
    expect(Number(other[0]?.ai_requests ?? 0)).toBe(0); // başkasının sayacını göremez
    const [p] = (await db.query<{ id: string }>("insert into public.projects (user_id, title, work_type, status) values ($1, 'Eski', 'thesis', 'archived') returning id", [A])).rows;
    await expectError(as(A, "update public.projects set status = 'active' where id = $1", [p.id]), /Arşivden çıkarma/);
    await as(A, "update public.projects set status = 'archived' where id = $1", [p.id]); // arşive almak serbest
  });

  it("paket bitiş tarihini kullanıcı değiştiremez; yönetici/sunucu değiştirir", async () => {
    await expectError(as(A, "update public.profiles set plan_expires_at = now() + interval '1 year' where id = auth.uid()"), /yetkiniz yok/);
    await db.query("update public.profiles set plan_expires_at = now() + interval '30 days' where id = $1", [A]);
    const [p] = await as<{ plan_expires_at: string }>(A, "select plan_expires_at from public.profiles where id = auth.uid()");
    expect(new Date(p.plan_expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("her kullanıcının tekil, değiştirilemez üye numarası var", async () => {
    const rows = (await db.query<{ member_no: string }>("select member_no from public.profiles")).rows;
    expect(rows.every((r) => Number(r.member_no) >= 1001)).toBe(true);
    expect(new Set(rows.map((r) => r.member_no)).size).toBe(rows.length);
    await expectError(db.query("update public.profiles set member_no = 5 where id = $1", [A]));
  });

  it("proje önerisi çalışma türü kullanılabilir", async () => {
    await db.query("insert into public.projects (user_id, title, work_type) values ($1, 'TÜBİTAK', 'grant_proposal')", [A]);
    expect(await as(A, "select id from public.projects where work_type = 'grant_proposal'")).toHaveLength(1);
  });
  it("silme: kullanıcı kendi kayıtlarını gerçekten siler, başkası silemez; proje silinince alt kayıtlar da kalkar (D65)", async () => {
    const [p] = (await db.query<{ id: string }>("insert into public.projects (user_id, title, work_type) values ($1, 'Silinecek', 'thesis') returning id", [A])).rows;
    const [st] = await as<{ id: string }>(A, "insert into public.project_stages (project_id, user_id, key, title, position) values ($1, auth.uid(), 'intro', 'Giriş', 0) returning id", [p.id]);
    const [rev] = await as<{ id: string }>(A, "insert into public.stage_revisions (stage_id, project_id, user_id, note) values ($1, $2, auth.uid(), 'yedek') returning id", [st.id, p.id]);
    const [com] = await as<{ id: string }>(A, "insert into public.stage_comments (stage_id, project_id, user_id, body) values ($1, $2, auth.uid(), 'not') returning id", [st.id, p.id]);
    const [mem] = await as<{ id: string }>(A, "insert into public.project_memory (project_id, user_id, kind, content) values ($1, auth.uid(), 'note', 'hafıza') returning id", [p.id]);
    const [src] = await as<{ id: string }>(A, "insert into public.sources (project_id, user_id, title, origin) values ($1, auth.uid(), 'Kaynak', 'manual') returning id", [p.id]);
    await as(A, "insert into public.source_chunks (source_id, project_id, user_id, chunk_index, content) values ($1, $2, auth.uid(), 0, 'parça')", [src.id, p.id]);
    const [conv] = await as<{ id: string }>(A, "insert into public.ai_conversations (project_id, user_id) values ($1, auth.uid()) returning id", [p.id]);
    await as(A, "insert into public.ai_messages (conversation_id, user_id, role, content) values ($1, auth.uid(), 'user', 'merhaba')", [conv.id]);

    // Başkası hiçbirini silemez (0 satır döner, sunucu bunu “bulunamadı” hatasına çevirir)
    for (const [table, id] of [["sources", src.id], ["stage_revisions", rev.id], ["stage_comments", com.id], ["project_memory", mem.id], ["ai_conversations", conv.id], ["projects", p.id]] as const) {
      expect(await as(B, `delete from public.${table} where id = $1 returning id`, [id])).toHaveLength(0);
    }
    // Sahibi tek tek siler: satır gerçekten kalkar, bağlı parçalar/mesajlar da gider
    expect(await as(A, "delete from public.sources where id = $1 returning id", [src.id])).toHaveLength(1);
    expect(await as(A, "select id from public.source_chunks where source_id = $1", [src.id])).toHaveLength(0);
    expect(await as(A, "delete from public.ai_conversations where id = $1 returning id", [conv.id])).toHaveLength(1);
    expect(await as(A, "select id from public.ai_messages where conversation_id = $1", [conv.id])).toHaveLength(0);
    expect(await as(A, "delete from public.stage_revisions where id = $1 returning id", [rev.id])).toHaveLength(1);
    // Proje silinince geri kalan her şey (bölüm, yorum, hafıza) veritabanından kalkar
    expect(await as(A, "delete from public.projects where id = $1 returning id", [p.id])).toHaveLength(1);
    for (const table of ["project_stages", "stage_comments", "project_memory", "sources", "ai_conversations"]) {
      expect((await db.query(`select id from public.${table} where project_id = $1`, [p.id])).rows).toHaveLength(0);
    }
  });
  it("kurum lisansında kişi sayısı sınırsız olabilir (D70)", async () => {
    const [o] = (await db.query<{ seats: number | null }>("insert into public.organizations (name) values ('Sınırsız Ekip') returning seats")).rows;
    expect(o.seats).toBeNull();
    await db.query("insert into public.organizations (name, seats) values ('Sınırlı', 5)");
    await expectError(db.query("insert into public.organizations (name, seats) values ('Hatalı', 0)"), /check/);
  });
  it("ISNAD atıf stili kullanılabilir; paket özellik metni 10 stil (D73)", async () => {
    await db.query("insert into public.projects (user_id, title, work_type, citation_style) values ($1, 'ISNAD çalışma', 'thesis', 'isnad')", [A]);
    expect(await as(A, "select id from public.projects where citation_style = 'isnad'")).toHaveLength(1);
  });

  it("araç kullanımı ve ölçüm tablolarına kullanıcılar ve ziyaretçiler erişemez; sunucu yazar (D90)", async () => {
    await db.query("insert into public.tool_usage (tool, cost_usd) values ('fake_check', 0.0012)");
    await db.query("insert into public.analytics_events (kind, path, visitor, device) values ('pageview', '/', 'abc', 'mobile')");
    expect(await as(A, "select * from public.tool_usage")).toHaveLength(0);
    expect(await as(null, "select * from public.analytics_events")).toHaveLength(0);
    await expectError(as(null, "insert into public.analytics_events (kind, path) values ('pageview', '/x')"));
    await expectError(db.query("insert into public.analytics_events (kind, path) values ('click', '/x')"));
  });
  it("paket kartları yeni özellikleri doğru sırada gösterir; migration 34 tekrar çalıştırılabilir (D126)", async () => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20261128000034_plan_features_assurance.sql"), "utf8");
    await db.exec(sql);
    const rows = (await db.query<{ id: string; features: string[] }>(`select id, features from public.plans where id in ('free', 'basic')`)).rows;
    const free = rows.find((r) => r.id === "free")!.features;
    const basic = rows.find((r) => r.id === "basic")!.features;
    expect(free.filter((f) => f === "İddia denetimi ve teslim öncesi kontrol listesi")).toHaveLength(1);
    expect(free.indexOf("İddia denetimi ve teslim öncesi kontrol listesi")).toBe(free.indexOf("Başlık önerisi ve bölüm kontrolü") + 1);
    expect(basic.filter((f) => f === "PRISMA 2020 sistematik derleme")).toHaveLength(1);
    expect(basic.indexOf("PRISMA 2020 sistematik derleme")).toBe(basic.indexOf("Yapay zekâ destekli kalite raporu") + 1);
    expect(basic).toContain("Literatür haritası ve eksik kaynak önerisi");
  });
  it("PRISMA ve literatür haritası yalnız Pro kartında; migration 35 tekrar çalıştırılabilir (D128)", async () => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20261129000035_prisma_litmap_pro.sql"), "utf8");
    await db.exec(sql);
    const rows = (await db.query<{ id: string; features: string[] }>(`select id, features from public.plans where id in ('basic', 'pro')`)).rows;
    const basic = rows.find((r) => r.id === "basic")!.features;
    const pro = rows.find((r) => r.id === "pro")!.features;
    expect(basic).not.toContain("PRISMA 2020 sistematik derleme");
    expect(basic).not.toContain("Literatür haritası ve eksik kaynak önerisi");
    expect(pro.filter((f) => f === "PRISMA 2020 sistematik derleme")).toHaveLength(1);
    expect(pro.indexOf("PRISMA 2020 sistematik derleme")).toBe(pro.indexOf("Literatür matrisi") + 1);
    expect(pro).toContain("Literatür haritası ve eksik kaynak önerisi");
  });
  it("migration 36: parça bölümü, derleme oyları, veri çıkarma ve kalite sütunları; tekrar çalıştırılabilir (D132–D134)", async () => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20261130000036_review_pdf_upgrade.sql"), "utf8");
    await db.exec(sql);
    const [p] = (await db.query<{ id: string }>(`insert into public.projects (user_id, title, work_type, academic_level) values ('${A}', 'Derleme 36', 'literature_review', 'master') returning id`)).rows;
    const [r] = (await db.query<{ id: string; votes: unknown }>(`insert into public.review_records (project_id, user_id, key, origin, record) values ($1, '${A}', 't:x|2020', 'Scopus', '{"title":"X"}') returning id, votes`, [p.id])).rows;
    expect(r.votes).toEqual({});
    await db.query(`update public.review_records set votes = '{"screening":{"u1":{"decision":"include","at":"2026"}}}', extraction = '{"design":{"value":"Kesitsel"}}', appraisal = '{"answers":{"aim":"yes"}}' where id = $1`, [r.id]);
    const [row] = (await db.query<{ extraction: { design: { value: string } } }>(`select extraction from public.review_records where id = $1`, [r.id])).rows;
    expect(row.extraction.design.value).toBe("Kesitsel");
    await db.query(`insert into public.source_chunks (project_id, user_id, chunk_index, content, section, file_id) select $1, '${A}', 0, 'Yöntem metni', 'method', null where false`, [p.id]);
    const cols = (await db.query<{ column_name: string }>(`select column_name from information_schema.columns where table_name = 'source_chunks' and column_name = 'section'`)).rows;
    expect(cols).toHaveLength(1);
    // Sahibi okuyabilir, başkası göremez
    expect(await as(A, `select votes from public.review_records where id = '${r.id}'`)).toHaveLength(1);
    expect(await as(B, `select votes from public.review_records where id = '${r.id}'`)).toHaveLength(0);
  });
  it("migration 37: gerçek zamanlı kanal yalnızca sahibe ve ortak yazarlara açık; yorumcu yazamaz (D140)", async () => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20261201000037_realtime_collab.sql"), "utf8");
    await db.exec(sql);
    const [p] = (await db.query<{ id: string }>(`insert into public.projects (user_id, title, work_type, academic_level) values ('${A}', 'Canlı 37', 'research_article', 'master') returning id`)).rows;
    const topic = `project:${p.id}`;
    const onTopic = (uid: string, q: string, t = topic) => db.transaction(async (tx) => {
      await tx.exec("set local role authenticated");
      await tx.query(`select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', 'authenticated', true), set_config('realtime.topic', $2, true)`, [uid, t]);
      return (await tx.query(q)).rows;
    });
    const send = (uid: string, t = topic) => onTopic(uid, `insert into realtime.messages (topic, payload, event) values ('${t}', '{}', 'doc') returning id`, t);
    await send(A);
    expect(await onTopic(A, `select id from realtime.messages where topic = '${topic}'`)).toHaveLength(1);
    // Üye olmayan ne okuyabilir ne yazabilir
    expect(await onTopic(B, `select id from realtime.messages where topic = '${topic}'`)).toHaveLength(0);
    await expectError(send(B), /row-level security/);
    // Ortak yazar (editör) okur ve yazar; yorumcu yalnızca okur
    await db.query(`insert into public.project_members (project_id, user_id, role) values ($1, '${B}', 'editor')`, [p.id]);
    await send(B);
    expect(await onTopic(B, `select id from realtime.messages where topic = '${topic}'`)).toHaveLength(2);
    await db.query(`update public.project_members set role = 'commenter' where project_id = $1 and user_id = '${B}'`, [p.id]);
    expect(await onTopic(B, `select id from realtime.messages where topic = '${topic}'`)).toHaveLength(2);
    await expectError(send(B), /row-level security/);
    // Biçimi bozuk konu kabul edilmez
    await expectError(send(A, "project:x"), /row-level security/);
  });

  it("migration 39: hukuki kabul kayıtları — kayıtta otomatik, kullanıcıya salt okunur, değiştirilemez; hesap silinince tüm veriler gider (D154)", async () => {
    const D = "d1d1d1d1-0000-4000-8000-000000000039";
    const E = "e1e1e1e1-0000-4000-8000-000000000039";
    // E-posta ile kayıt: formdaki kabul meta veride gelir → Kullanım Koşulları “accept”, KVKK “notice”, kaynak e-posta
    await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'd@ornek.com', $2)`, [D, JSON.stringify({ full_name: "Deniz", legal: { terms: "2026-11-13", kvkk: "2026-11-13", gdpr: "2026-11-13", fair_use: "bozuk" } })]);
    const rows = (await db.query<{ doc: string; version: string; kind: string; source: string }>(`select doc, version, kind, source from public.legal_acceptances where user_id = $1 order by doc`, [D])).rows;
    expect(rows).toEqual([{ doc: "kvkk", version: "2026-11-13", kind: "notice", source: "email" }, { doc: "terms", version: "2026-11-13", kind: "accept", source: "email" }]);
    // Google/Apple ile kayıt: meta veride kabul yok → kayıt oluşmaz (ilk girişte onay sayfası)
    await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'e@ornek.com', '{"name":"Ece","avatar_url":"x"}')`, [E]);
    expect((await db.query(`select 1 from public.legal_acceptances where user_id = $1`, [E])).rows).toHaveLength(0);
    // Kullanıcı yalnızca kendi kayıtlarını görür; yönetici hepsini; başkası göremez
    expect(await as(D, `select doc from public.legal_acceptances`)).toHaveLength(2);
    expect(await as(E, `select doc from public.legal_acceptances`)).toHaveLength(0);
    expect((await as(ADMIN, `select doc from public.legal_acceptances where user_id = '${D}'`))).toHaveLength(2);
    // İstemci doğrudan yazamaz, silemez; kimse (sunucu dâhil) değiştiremez
    await expectError(as(E, `insert into public.legal_acceptances (user_id, doc, version, kind, source) values (auth.uid(), 'terms', '2026-11-13', 'accept', 'google')`), /row-level security/);
    await as(D, `delete from public.legal_acceptances`);
    expect((await db.query(`select 1 from public.legal_acceptances where user_id = $1`, [D])).rows).toHaveLength(2);
    await expectError(db.query(`update public.legal_acceptances set version = '2030-01-01' where user_id = $1`, [D]), /değiştirilemez/);
    // Kullanıcı güncellemesi RLS nedeniyle hiçbir satıra ulaşmaz (sessizce 0 satır); değer değişmez
    const before = (await db.query<{ v: string }>(`select string_agg(version || accepted_at::text, ',' order by doc) as v from public.legal_acceptances where user_id = $1`, [D])).rows[0].v;
    await as(D, `update public.legal_acceptances set version = '2020-01-01'`).catch(() => null);
    expect((await db.query<{ v: string }>(`select string_agg(version || accepted_at::text, ',' order by doc) as v from public.legal_acceptances where user_id = $1`, [D])).rows[0].v).toBe(before);
    // Sunucu (service role) onay sayfası kaydı yazabilir; geçersiz belge/sürüm/kaynak reddedilir
    await db.query(`insert into public.legal_acceptances (user_id, doc, version, kind, source, context) values ($1, 'distance', '2026-11-13', 'notice', 'purchase', '{"plan":"pro"}')`, [E]);
    await expectError(db.query(`insert into public.legal_acceptances (user_id, doc, version, kind, source) values ($1, 'pazarlama', '2026-11-13', 'accept', 'google')`, [E]), /check/i);
    await expectError(db.query(`insert into public.legal_acceptances (user_id, doc, version, kind, source) values ($1, 'terms', 'v2', 'accept', 'google')`, [E]), /check/i);
    await expectError(db.query(`insert into public.legal_acceptances (user_id, doc, version, kind, source) values ($1, 'terms', '2026-11-13', 'accept', 'sms')`, [E]), /check/i);

    // Hesap silme: kullanıcıya bağlı veriler zincirleme silinir; geri bildirim/hata kaydında kişi bağı kopar
    const [p] = (await db.query<{ id: string }>(`insert into public.projects (user_id, title, work_type, academic_level) values ($1, 'Silinecek', 'thesis', 'master') returning id`, [D])).rows;
    const [st] = (await db.query<{ id: string }>(`insert into public.project_stages (project_id, user_id, key, title, position) values ($1, $2, 'intro', 'Giriş', 0) returning id`, [p.id, D])).rows;
    await db.query(`insert into public.stage_revisions (stage_id, project_id, user_id) values ($1, $2, $3)`, [st.id, p.id, D]);
    await db.query(`insert into public.stage_comments (stage_id, project_id, user_id, body) values ($1, $2, $3, 'not')`, [st.id, p.id, D]);
    await db.query(`insert into public.sources (project_id, user_id, title, origin) values ($1, $2, 'Kaynak', 'manual')`, [p.id, D]);
    await db.query(`insert into public.project_memory (project_id, user_id, kind, content) values ($1, $2, 'note', 'hafıza')`, [p.id, D]);
    await db.query(`insert into public.files (user_id, name, mime_type, size_bytes, storage_path) values ($1, 'a.pdf', 'application/pdf', 1, $2)`, [D, `${D}/a.pdf`]);
    const [c] = (await db.query<{ id: string }>(`insert into public.ai_conversations (project_id, user_id) values ($1, $2) returning id`, [p.id, D])).rows;
    await db.query(`insert into public.ai_messages (conversation_id, user_id, role, content) values ($1, $2, 'user', 'merhaba')`, [c.id, D]);
    await db.query(`insert into public.activity_log (user_id, kind) values ($1, 'ai_output')`, [D]);
    await db.query(`insert into public.user_devices (user_id, device) values ($1, repeat('a', 64))`, [D]);
    await db.query(`insert into public.project_invites (project_id, email, role, token, invited_by) values ($1, 'f@ornek.com', 'editor', repeat('i', 40), $2)`, [p.id, D]);
    await db.query(`insert into public.project_shares (project_id, user_id, token) values ($1, $2, repeat('s', 40))`, [p.id, D]);
    await db.query(`insert into public.notifications (user_id, kind) values ($1, 'admin_message')`, [D]);
    await db.query(`insert into public.feedback (user_id, message) values ($1, 'geri bildirim')`, [D]);
    await db.query(`insert into public.error_logs (user_id, route, message) values ($1, 'test', 'hata')`, [D]);
    await db.query(`delete from auth.users where id = $1`, [D]);
    for (const t of ["profiles", "projects", "project_stages", "stage_revisions", "stage_comments", "sources", "project_memory", "files", "ai_conversations", "ai_messages", "activity_log", "user_devices", "project_shares", "notifications", "legal_acceptances"]) {
      const col = t === "profiles" ? "id" : "user_id";
      expect((await db.query(`select 1 from public.${t} where ${col} = $1`, [D])).rows, t).toHaveLength(0);
    }
    expect((await db.query(`select 1 from public.project_invites where invited_by = $1 or project_id = $2`, [D, p.id])).rows).toHaveLength(0);
    expect((await db.query(`select user_id from public.feedback where message = 'geri bildirim'`)).rows).toEqual([{ user_id: null }]);
    expect((await db.query(`select 1 from public.error_logs where user_id = $1`, [D])).rows).toHaveLength(0);
    await db.query(`delete from auth.users where id = $1`, [E]);
    expect((await db.query(`select 1 from public.legal_acceptances where user_id = $1`, [E])).rows).toHaveLength(0);
  });
});

