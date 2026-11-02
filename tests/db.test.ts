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
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon') $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security; -- Supabase varsayılanı
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
grant usage on schema auth, storage to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
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
  it("paketleri ve ayarları oluşturur", async () => {
    const plans = await db.query<{ id: string }>("select id from public.plans order by sort_order");
    expect(plans.rows.map((r) => r.id)).toEqual(["free", "basic", "pro", "premium"]);
    const p = await db.query<{ id: string; price_monthly: string; limits: Record<string, number | null> }>("select id, price_monthly, limits from public.plans order by sort_order");
    const by = Object.fromEntries(p.rows.map((r) => [r.id, r]));
    expect(by.free.limits.ai_requests_month).toBe(20);
    expect(by.free.limits.source_searches_month).toBe(7);
    expect(by.basic.limits).toMatchObject({ projects: 3, ai_requests_month: 150, source_searches_month: 100 });
    expect(Number(by.basic.price_monthly)).toBe(499);
    expect(by.pro.limits.projects).toBe(10);
    expect(Number(by.pro.price_monthly)).toBe(899);
    expect(Number(by.premium.price_monthly)).toBe(1499);
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
    const [p] = await as<{ id: string }>(A, "insert into public.projects (user_id, title, work_type) values (auth.uid(), 'Tezim', 'thesis') returning id");
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
    expect((await as(null, "select id from public.plans")).length).toBe(4);
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
    await db.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, 'c@ornek.com', $2)", [C, JSON.stringify({ ref: a.referral_code.toLowerCase() })]);
    const [c] = await as<{ referred_by: string; referral_code: string }>(C, "select referred_by, referral_code from public.profiles where id = auth.uid()");
    expect(c.referred_by).toBe(A);
    expect(c.referral_code).not.toBe(a.referral_code);
  });
  it("kullanıcı davet alanlarını kendisi değiştiremez", async () => {
    await expectError(as(C, "update public.profiles set referred_by = null where id = auth.uid()"), /yetkiniz yok/);
    await expectError(as(C, "update public.profiles set referral_code = 'AAAAAAAA' where id = auth.uid()"), /yetkiniz yok/);
    await expectError(as(C, "update public.profiles set referral_rewarded_at = now() where id = auth.uid()"), /yetkiniz yok/);
  });
  it("krediler: kullanıcı yalnızca kendininkini görür, yazamaz", async () => {
    await db.query("insert into public.usage_credits (user_id, kind, amount, reason) values ($1, 'ai_requests', 50, 'davet')", [A]);
    expect(await as(A, "select * from public.usage_credits")).toHaveLength(1);
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
  it("proje önerisi çalışma türü kullanılabilir", async () => {
    await as(A, "insert into public.projects (user_id, title, work_type) values (auth.uid(), 'TÜBİTAK', 'grant_proposal')");
    expect(await as(A, "select id from public.projects where work_type = 'grant_proposal'")).toHaveLength(1);
  });
});
