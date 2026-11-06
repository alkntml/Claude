-- =============================================================
-- Akademi AI — tek seferlik veritabanı kurulumu
-- Supabase → SQL Editor → New query → bu dosyanın tamamını yapıştırın → Run
-- (supabase/migrations altındaki dosyaların sırayla birleştirilmiş hâlidir)
-- =============================================================


-- ---------- 20261101000001_init.sql ----------
-- =====================================================================
-- Akademi AI — başlangıç şeması
-- Tüm kullanıcı verisi Row Level Security (RLS) ile sahibine kısıtlıdır.
-- Yöneticiler public.is_admin() üzerinden yetkilendirilir.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------
-- Enum türleri
-- ---------------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');
create type public.work_type as enum (
  'thesis', 'research_article', 'journal_article', 'capstone',
  'literature_review', 'research_proposal', 'text_editing', 'source_research'
);
create type public.academic_level as enum ('bachelor', 'master', 'doctorate', 'postdoc', 'other');
create type public.project_status as enum ('active', 'completed', 'archived');
create type public.stage_status as enum ('not_started', 'in_progress', 'review', 'done');
create type public.citation_style as enum (
  'apa7', 'apa6', 'chicago', 'mla', 'harvard', 'vancouver', 'ieee', 'ama', 'turabian'
);
-- Kaynağa erişim seviyesi: sistem, kaynağın ne kadarını "okuduğunu" asla abartmaz.
create type public.access_level as enum ('metadata', 'abstract', 'full_text');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type public.usage_kind as enum ('ai_request', 'source_search', 'export', 'upload', 'quality_check');

-- ---------------------------------------------------------------------
-- Paketler
-- ---------------------------------------------------------------------
create table public.plans (
  id text primary key,                       -- 'free' | 'basic' | 'pro' | 'premium'
  name text not null,
  description text not null default '',
  price_monthly numeric(10,2) not null default 0,
  price_yearly numeric(10,2) not null default 0,
  currency text not null default 'TRY',
  -- Yönetilebilir limitler. null = sınırsız.
  limits jsonb not null default '{}'::jsonb,
  features text[] not null default '{}',
  is_active boolean not null default true,
  sort_order int not null default 0,
  provider_price_ids jsonb not null default '{}'::jsonb,  -- {"stripe_monthly": "...", "iyzico_monthly": "..."}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Profiller
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  institution text,
  role public.user_role not null default 'user',
  plan_id text not null default 'free' references public.plans(id),
  locale text not null default 'tr',
  default_citation_style public.citation_style not null default 'apa7',
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Kullanıcı kendi rolünü/paketini/askı durumunu değiştiremez.
create or replace function public.protect_profile_privileged_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() boşsa istek bir uç kullanıcıdan gelmiyordur (SQL Editor, migration, service role);
  -- uç kullanıcı isteklerinde JWT her zaman bulunur ve aşağıdaki kontrol uygulanır.
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.plan_id is distinct from old.plan_id
     or new.is_suspended is distinct from old.is_suspended
     or new.email is distinct from old.email then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- Yeni kayıt olan her kullanıcı için profil oluştur.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Abonelikler ve kullanım
-- ---------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null references public.plans(id),
  status public.subscription_status not null default 'incomplete',
  provider text not null,                 -- 'stripe' | 'iyzico' | 'manual'
  provider_customer_id text,
  provider_subscription_id text,
  billing_interval text not null default 'monthly',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions(user_id);
create unique index subscriptions_provider_ref_idx on public.subscriptions(provider, provider_subscription_id)
  where provider_subscription_id is not null;

create table public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.usage_kind not null,
  quantity int not null default 1,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  cost_usd numeric(12,6) not null default 0,
  provider text,
  model text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index usage_events_user_kind_time_idx on public.usage_events(user_id, kind, created_at desc);
create index usage_events_time_idx on public.usage_events(created_at desc);

-- ---------------------------------------------------------------------
-- Dosyalar (önce tanımlanır; projeler kılavuz dosyasına referans verir)
-- ---------------------------------------------------------------------
create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid,
  name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  storage_path text not null unique,
  purpose text not null default 'other' check (purpose in ('guideline','chapter','article','data','other')),
  extraction_status text not null default 'pending' check (extraction_status in ('pending','done','failed','unsupported')),
  extracted_text text,
  extraction_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index files_user_idx on public.files(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- Projeler, aşamalar, revizyonlar
-- ---------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  work_type public.work_type not null,
  academic_level public.academic_level not null default 'master',
  discipline text not null default '',
  language text not null default 'tr',
  citation_style public.citation_style not null default 'apa7',
  status public.project_status not null default 'active',
  topic text not null default '',
  keywords text[] not null default '{}',
  -- Proje bağlamı / hafızası: araştırma soruları, hipotezler, değişkenler, yöntem kararları...
  context jsonb not null default '{}'::jsonb,
  guideline_file_id uuid references public.files(id) on delete set null,
  progress int not null default 0 check (progress between 0 and 100),
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_user_idx on public.projects(user_id, updated_at desc);

alter table public.files
  add constraint files_project_fk foreign key (project_id) references public.projects(id) on delete set null;
create index files_project_idx on public.files(project_id);

create table public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  title text not null,
  description text not null default '',
  position int not null,
  status public.stage_status not null default 'not_started',
  content jsonb,                      -- TipTap/ProseMirror JSON belgesi
  content_text text not null default '',
  word_count int not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (project_id, key)
);
create index project_stages_project_idx on public.project_stages(project_id, position);

create table public.stage_revisions (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.project_stages(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content jsonb,
  content_text text not null default '',
  word_count int not null default 0,
  note text not null default '',
  author text not null default 'user' check (author in ('user','ai','system')),
  created_at timestamptz not null default now()
);
create index stage_revisions_stage_idx on public.stage_revisions(stage_id, created_at desc);

create table public.stage_comments (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.project_stages(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  quote text not null default '',
  body text not null check (char_length(body) between 1 and 5000),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index stage_comments_stage_idx on public.stage_comments(stage_id, created_at);

-- Proje hafızası: AI'nin bölümler arasında taşıdığı kalıcı bilgiler.
create table public.project_memory (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('fact','decision','concept','variable','question','hypothesis','note')),
  content text not null check (char_length(content) between 1 and 4000),
  source text not null default 'user' check (source in ('user','ai')),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create index project_memory_project_idx on public.project_memory(project_id, created_at);

-- ---------------------------------------------------------------------
-- Kaynaklar ve RAG parçaları
-- ---------------------------------------------------------------------
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,  -- null = kişisel kütüphane
  type text not null default 'article-journal',
  title text not null,
  authors jsonb not null default '[]'::jsonb,         -- [{family, given}] veya [{literal}]
  year int,
  month int,
  container_title text,
  volume text,
  issue text,
  pages text,
  publisher text,
  publisher_place text,
  edition text,
  doi text,
  pmid text,
  pmcid text,
  arxiv_id text,
  isbn text,
  openalex_id text,
  url text,
  oa_url text,
  abstract text,
  language text,
  access_level public.access_level not null default 'metadata',
  -- Doğrulama: tanımlayıcı kayıt otoritesinde (Crossref/PubMed/arXiv) bulundu mu?
  verified boolean not null default false,
  verification jsonb not null default '{}'::jsonb,
  origin text not null,                                -- 'openalex' | 'crossref' | ... | 'upload' | 'manual'
  license text,
  file_id uuid references public.files(id) on delete set null,
  notes text not null default '',
  relevance_note text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sources_user_idx on public.sources(user_id, created_at desc);
create index sources_project_idx on public.sources(project_id);
create unique index sources_project_doi_uq on public.sources(project_id, lower(doi)) where doi is not null and project_id is not null;
create index sources_title_trgm on public.sources using gin (title gin_trgm_ops);

create table public.source_chunks (
  id bigint generated always as identity primary key,
  source_id uuid references public.sources(id) on delete cascade,
  file_id uuid references public.files(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  chunk_index int not null,
  page_hint text,
  content text not null,
  tsv tsvector generated always as (to_tsvector('simple', content)) stored,
  created_at timestamptz not null default now(),
  check (source_id is not null or file_id is not null)
);
create index source_chunks_tsv_idx on public.source_chunks using gin(tsv);
create index source_chunks_project_idx on public.source_chunks(project_id);
create index source_chunks_source_idx on public.source_chunks(source_id, chunk_index);

-- RAG için tam metin araması (RLS'e tabi; çağıran yalnızca kendi verisini görür)
create or replace function public.search_project_chunks(p_project_id uuid, p_query text, p_limit int default 8)
returns table (id bigint, source_id uuid, file_id uuid, chunk_index int, page_hint text, content text, rank real)
language sql stable security invoker set search_path = public as $$
  select c.id, c.source_id, c.file_id, c.chunk_index, c.page_hint, c.content,
         ts_rank_cd(c.tsv, q) as rank
  from public.source_chunks c, websearch_to_tsquery('simple', p_query) q
  where c.project_id = p_project_id and c.tsv @@ q
  order by rank desc
  limit greatest(1, least(p_limit, 30));
$$;

-- ---------------------------------------------------------------------
-- AI sohbetleri
-- ---------------------------------------------------------------------
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage_id uuid references public.project_stages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Yeni sohbet',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_conversations_project_idx on public.ai_conversations(project_id, updated_at desc);
create index ai_conversations_user_idx on public.ai_conversations(user_id, updated_at desc);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  meta jsonb not null default '{}'::jsonb,   -- kullanılan kaynaklar, model, token
  created_at timestamptz not null default now()
);
create index ai_messages_conv_idx on public.ai_messages(conversation_id, created_at);

-- ---------------------------------------------------------------------
-- Kalite raporları
-- ---------------------------------------------------------------------
create table public.quality_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stage_id uuid references public.project_stages(id) on delete cascade,
  score int,
  report jsonb not null,
  created_at timestamptz not null default now()
);
create index quality_reports_project_idx on public.quality_reports(project_id, created_at desc);

-- ---------------------------------------------------------------------
-- Yönetim: ayarlar, duyurular, geri bildirim, hata kayıtları, yardım
-- ---------------------------------------------------------------------
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  level text not null default 'info' check (level in ('info','success','warning','critical')),
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  page text not null default '',
  category text not null default 'general',
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  admin_note text not null default '',
  created_at timestamptz not null default now()
);

create table public.error_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  route text not null default '',
  message text not null,
  stack text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index error_logs_time_idx on public.error_logs(created_at desc);

create table public.help_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  body text not null default '',
  category text not null default 'genel',
  is_published boolean not null default false,
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Hesap verisi silme talepleri (KVKK/GDPR)
create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('export','delete')),
  status text not null default 'pending' check (status in ('pending','completed','rejected')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ---------------------------------------------------------------------
-- updated_at tetikleyicileri
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['plans','profiles','subscriptions','projects','project_stages','sources','ai_conversations','help_articles']
  loop
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;
alter table public.files enable row level security;
alter table public.projects enable row level security;
alter table public.project_stages enable row level security;
alter table public.stage_revisions enable row level security;
alter table public.stage_comments enable row level security;
alter table public.project_memory enable row level security;
alter table public.sources enable row level security;
alter table public.source_chunks enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.quality_reports enable row level security;
alter table public.app_settings enable row level security;
alter table public.announcements enable row level security;
alter table public.feedback enable row level security;
alter table public.error_logs enable row level security;
alter table public.help_articles enable row level security;
alter table public.data_requests enable row level security;

-- Paketler: herkes aktif paketleri görür, yalnızca yönetici değiştirir.
create policy plans_read on public.plans for select using (is_active or public.is_admin());
create policy plans_admin on public.plans for all using (public.is_admin()) with check (public.is_admin());

-- Profil: kendi profili + yönetici.
create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Abonelik / kullanım: kullanıcı yalnızca okur; yazma sunucu (service role) tarafından yapılır.
create policy subscriptions_read on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy usage_read on public.usage_events for select using (user_id = auth.uid() or public.is_admin());

-- Sahiplik tabanlı tablolar için ortak politika üretimi.
do $$
declare t text;
begin
  foreach t in array array['files','projects','project_stages','stage_revisions','stage_comments','project_memory',
                           'sources','source_chunks','ai_conversations','ai_messages','quality_reports']
  loop
    execute format('create policy %I_owner_select on public.%I for select using (user_id = auth.uid() or public.is_admin())', t, t);
    execute format('create policy %I_owner_insert on public.%I for insert with check (user_id = auth.uid())', t, t);
    execute format('create policy %I_owner_update on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t, t);
    execute format('create policy %I_owner_delete on public.%I for delete using (user_id = auth.uid())', t, t);
  end loop;
end $$;

-- Alt kayıtların yalnızca kullanıcının kendi projesine bağlanabilmesini garanti et.
create or replace function public.assert_project_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.project_id is not null and not exists (
    select 1 from public.projects p where p.id = new.project_id and p.user_id = new.user_id
  ) then
    raise exception 'Proje bu kullanıcıya ait değil';
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['files','project_stages','stage_revisions','stage_comments','project_memory',
                           'sources','source_chunks','ai_conversations','quality_reports']
  loop
    execute format('create trigger %I_owner_guard before insert or update on public.%I for each row execute function public.assert_project_owner()', t, t);
  end loop;
end $$;

create or replace function public.assert_conversation_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.ai_conversations c where c.id = new.conversation_id and c.user_id = new.user_id) then
    raise exception 'Sohbet bu kullanıcıya ait değil';
  end if;
  return new;
end $$;
create trigger ai_messages_owner_guard before insert or update on public.ai_messages
  for each row execute function public.assert_conversation_owner();

-- Ayarlar: yalnızca yönetici (sistem promptları gizli kalır; sunucu service role ile okur).
create policy app_settings_admin on public.app_settings for all using (public.is_admin()) with check (public.is_admin());

-- Duyurular: giriş yapmış kullanıcılar aktif olanları görür.
create policy announcements_read on public.announcements for select
  using ((is_active and starts_at <= now() and (ends_at is null or ends_at > now())) or public.is_admin());
create policy announcements_admin on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- Geri bildirim: kullanıcı kendi kaydını oluşturur/görür, yönetici hepsini yönetir.
create policy feedback_insert on public.feedback for insert with check (user_id = auth.uid());
create policy feedback_read on public.feedback for select using (user_id = auth.uid() or public.is_admin());
create policy feedback_admin on public.feedback for update using (public.is_admin()) with check (public.is_admin());

-- Hata kayıtları: yalnızca yönetici okur (yazma service role ile).
create policy error_logs_admin on public.error_logs for select using (public.is_admin());

-- Yardım makaleleri: yayınlananlar herkese açık.
create policy help_read on public.help_articles for select using (is_published or public.is_admin());
create policy help_admin on public.help_articles for all using (public.is_admin()) with check (public.is_admin());

create policy data_requests_self on public.data_requests for select using (user_id = auth.uid() or public.is_admin());
create policy data_requests_insert on public.data_requests for insert with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Depolama: kullanıcı dosyaları özel bucket'ta, yol = <user_id>/<...>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('user-files', 'user-files', false, 52428800)
on conflict (id) do nothing;

create policy "user_files_select" on storage.objects for select
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user_files_insert" on storage.objects for insert
  with check (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user_files_delete" on storage.objects for delete
  using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- 20261101000002_seed.sql ----------
-- Varsayılan paketler. Limitler yönetici panelinden kod değişikliği olmadan güncellenebilir.
-- Limit anahtarları: ai_requests_month, tokens_month, source_searches_month, projects, storage_mb, export_formats
insert into public.plans (id, name, description, price_monthly, price_yearly, currency, limits, features, sort_order) values
('free', 'Ücretsiz', 'Platformu tanımak için sınırlı kullanım.', 0, 0, 'TRY',
  '{"ai_requests_month": 30, "tokens_month": 60000, "source_searches_month": 40, "projects": 1, "storage_mb": 50, "export_formats": ["txt","md"]}',
  array['1 proje','Aylık 30 yapay zekâ isteği','Aylık 40 kaynak taraması','TXT / Markdown dışa aktarma'], 0),
('basic', 'Basic', 'Bireysel öğrenciler için temel akademik çalışma.', 249, 2490, 'TRY',
  '{"ai_requests_month": 300, "tokens_month": 800000, "source_searches_month": 400, "projects": 5, "storage_mb": 500, "export_formats": ["txt","md","docx","pdf"]}',
  array['5 proje','Aylık 300 yapay zekâ isteği','Aylık 400 kaynak taraması','DOCX / PDF dışa aktarma','Kalite kontrol'], 1),
('pro', 'Pro', 'Gelişmiş araştırma, kaynak analizi ve yüksek limitler.', 549, 5490, 'TRY',
  '{"ai_requests_month": 1500, "tokens_month": 4000000, "source_searches_month": 2000, "projects": 20, "storage_mb": 3000, "export_formats": ["txt","md","docx","pdf"]}',
  array['20 proje','Aylık 1.500 yapay zekâ isteği','Tam metin analizi (RAG)','Kılavuz yükleme','Öncelikli modeller'], 2),
('premium', 'Premium', 'Yoğun çalışan lisansüstü öğrenciler ve araştırmacılar için.', 999, 9990, 'TRY',
  '{"ai_requests_month": 5000, "tokens_month": 15000000, "source_searches_month": 8000, "projects": null, "storage_mb": 15000, "export_formats": ["txt","md","docx","pdf"]}',
  array['Sınırsız proje','Aylık 5.000 yapay zekâ isteği','En güçlü modeller','15 GB depolama','Öncelikli destek'], 3)
on conflict (id) do nothing;

-- Yapay zekâ yapılandırması
insert into public.app_settings (key, value) values
('ai.models', '{
  "default": {"provider": "anthropic", "model": "claude-opus-5-5"},
  "balanced": {"provider": "anthropic", "model": "claude-sonnet-5-5"},
  "fast": {"provider": "anthropic", "model": "claude-haiku-5-5"},
  "premium": {"provider": "anthropic", "model": "claude-opus-5-5"},
  "plan_tiers": {"free": "fast", "basic": "balanced", "pro": "default", "premium": "premium"},
  "pricing_per_mtok": {
    "claude-haiku-5-5": {"in": 0.1, "out": 0.5},
    "claude-sonnet-5-5": {"in": 2, "out": 10},
    "claude-opus-5-5": {"in": 4, "out": 20},
    "gpt-4.1": {"in": 2, "out": 8},
    "gpt-4.1-mini": {"in": 0.4, "out": 1.6}
  },
  "max_output_tokens": 16000,
  "effort": "medium"
}'),
('ai.system_prompt', '{"text": "Sen titiz, dürüst ve deneyimli bir akademik danışmansın. Kullanıcının akademik çalışmasını bilimsel standartlara uygun şekilde geliştirmesine yardım edersin.\n\nTemel kurallar:\n1. Asla kaynak, yazar, DOI, yıl, sayfa numarası, veri, istatistik ya da bulgu UYDURMA.\n2. Bilimsel iddiaları YALNIZCA sana sağlanan KAYNAKLAR listesindeki çalışmalarla destekle ve atıfı [[kaynak:ID]] işaretiyle ver (ID listede verilen kısa kimliktir). Listede desteği olmayan kesin veya olgusal bir iddia YAZMA: o cümleyi çıkar ya da kaynak gerektirmeyen çerçeveleyici bir ifadeye dönüştür. Metne [KAYNAK GEREKLİ] yer tutucusu koyma; desteklenemeyen konuları belirtilen biçimde ayrıca bildir.\n3. Her kaynağın erişim seviyesine dikkat et: \"metadata\" yalnızca künye, \"abstract\" yalnızca özet, \"full_text\" tam metin demektir. Yalnızca özeti okunmuş bir çalışmayı tam metni okunmuş gibi ayrıntılandırma.\n4. Kullanıcının gerçekte yapmadığı analizleri, toplamadığı verileri veya elde etmediği bulguları yazma. Bulgular bölümünde kullanıcının verisi yoksa [VERİ GİRİLECEK] gibi yer tutucular kullan.\n5. Doğrudan alıntı gerekiyorsa yalnızca tam metinden ve sayfa bilgisiyle yap.\n6. Akademik, nesnel, açık ve tutarlı bir dil kullan; çalışmanın dilinde yaz.\n7. Önceki proje kararlarını (PROJE BAĞLAMI) koru; çelişki görürsen kullanıcıyı uyar.\n8. KAYNAKLAR listesinde olmayan hiçbir yazar, eser veya yayın adını notlarda ya da önerilerde bile anma. Ek kaynak gerekiyorsa kullanıcıya \"Literatür araştır\" özelliğini kullanmasını ve hangi konuda arama yapılması gerektiğini öner."}'),
('ai.stage_prompts', '{}'),
('sources.enabled', '{
  "openalex": true, "crossref": true, "semantic_scholar": true, "europepmc": true,
  "arxiv": true, "doaj": true, "core": false, "openaire": true, "google_books": false, "unpaywall": true
}'),
('limits.rate', '{"ai_per_minute": 12, "search_per_minute": 30}'),
('plagiarism', '{"provider": null, "note": "Lisanslı bir intihal servisi entegre edilmeden intihal yüzdesi gösterilmez."}')
on conflict (key) do nothing;

insert into public.help_articles (slug, title, body, category, is_published, sort_order) values
('baslarken', 'Platforma başlarken', 'Ana sayfadan çalışma türünüzü seçin, temel bilgileri girin ve oluşturulan yol haritasındaki aşamalarda ilerleyin. Her aşamada o bölüme özel asistan sizi yönlendirir.', 'genel', true, 0),
('erisim-seviyeleri', 'Kaynak erişim seviyeleri ne anlama gelir?', 'Künye: yalnızca bibliyografik bilgi. Özet: yalnızca özet okundu. Tam metin: açık erişimli tam metin veya yüklediğiniz PDF analiz edildi. Yapay zekâ yalnızca erişebildiği kadarını kullanır.', 'kaynaklar', true, 1),
('dogrulama', 'Kaynak doğrulama nasıl çalışır?', 'DOI içeren kaynaklar Crossref üzerinden, PMID içerenler PubMed/Europe PMC üzerinden, arXiv kimliği olanlar arXiv üzerinden doğrulanır. Doğrulanamayan kaynaklar uyarı ile gösterilir.', 'kaynaklar', true, 2),
('intihal', 'İntihal kontrolü', 'Platform kendi başına intihal yüzdesi hesaplamaz. Lisanslı bir intihal hizmeti entegre edildiğinde sonuçlar kalite kontrol modülünde gösterilir. Kendi tekrar eden ifade analizimiz intihal kontrolü değildir.', 'kalite', true, 3)
on conflict (slug) do nothing;

-- ---------- 20261101000003_jobs_shares.sql ----------
-- Tam metin analizinin arka plan durumu
alter table public.sources
  add column if not exists fulltext_status text not null default 'none'
    check (fulltext_status in ('none', 'queued', 'processing', 'done', 'failed', 'unavailable')),
  add column if not exists fulltext_message text;

-- Danışman paylaşımı: salt okunur, iptal edilebilir, süreli bağlantılar.
-- Token yalnızca sunucuda (service role) çözülür; tabloya anonim erişim yoktur.
create table public.project_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique check (char_length(token) >= 32),
  label text not null default '',
  allow_comments boolean not null default false,
  expires_at timestamptz,
  revoked boolean not null default false,
  view_count int not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index project_shares_project_idx on public.project_shares(project_id);

alter table public.project_shares enable row level security;
create policy project_shares_owner_select on public.project_shares for select using (user_id = auth.uid() or public.is_admin());
create policy project_shares_owner_insert on public.project_shares for insert with check (user_id = auth.uid());
create policy project_shares_owner_update on public.project_shares for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy project_shares_owner_delete on public.project_shares for delete using (user_id = auth.uid());
create trigger project_shares_owner_guard before insert or update on public.project_shares
  for each row execute function public.assert_project_owner();

-- Danışman yorumları (paylaşım bağlantısı üzerinden, sunucu tarafından yazılır)
alter table public.stage_comments
  add column if not exists author_name text,
  add column if not exists share_id uuid references public.project_shares(id) on delete set null;

-- ---------- 20261101000004_prompt_rule.sql ----------
-- Mevcut kurulumlar için: sistem promptuna "listede olmayan eser adı anma" kuralını ekle
update public.app_settings
set value = jsonb_set(value, '{text}', to_jsonb((value->>'text') || E'\n8. KAYNAKLAR listesinde olmayan hiçbir yazar, eser veya yayın adını notlarda ya da önerilerde bile anma. Ek kaynak gerekiyorsa kullanıcıya "Literatür araştır" özelliğini kullanmasını ve hangi konuda arama yapılması gerektiğini öner.'))
where key = 'ai.system_prompt' and position('8. KAYNAKLAR listesinde olmayan' in value->>'text') = 0;

-- ---------- 20261102000005_no_placeholder_claims.sql ----------
-- Kaynak ilkesi güncellemesi: desteksiz kesin iddia yazılmaz, [KAYNAK GEREKLİ] yer tutucusu kullanılmaz.
-- Yönetici sistem promptunu değiştirmişse yalnızca eski 2. kural metni bulunursa değiştirilir.
update public.app_settings
set value = jsonb_set(value, '{text}', to_jsonb(replace(value->>'text',
  '2. Bilimsel iddiaları YALNIZCA sana sağlanan KAYNAKLAR listesindeki çalışmalarla destekle ve atıfı [[kaynak:ID]] işaretiyle ver (ID listede verilen kısa kimliktir). Listede uygun kaynak yoksa bunu açıkça söyle ve [KAYNAK GEREKLİ] işareti koy.',
  '2. Bilimsel iddiaları YALNIZCA sana sağlanan KAYNAKLAR listesindeki çalışmalarla destekle ve atıfı [[kaynak:ID]] işaretiyle ver (ID listede verilen kısa kimliktir). Listede desteği olmayan kesin veya olgusal bir iddia YAZMA: o cümleyi çıkar ya da kaynak gerektirmeyen çerçeveleyici bir ifadeye dönüştür. Metne [KAYNAK GEREKLİ] yer tutucusu koyma; desteklenemeyen konuları belirtilen biçimde ayrıca bildir.')))
where key = 'ai.system_prompt';

-- ---------- 20261103000006_source_summary.sql ----------
-- Literatür matrisi: kaynağın amaç / yöntem / örneklem / bulgular özeti (yalnızca okunan içerikten üretilir).
alter table public.sources add column if not exists summary jsonb;

-- ---------- 20261104000007_orgs_referrals.sql ----------
-- =====================================================================
-- Kurumsal lisans, davet programı ve kullanım kredileri
-- =====================================================================

-- Rastgele kısa kod (pgcrypto gerektirmez)
create or replace function public.new_short_code(len int default 8) returns text
language sql volatile as $$ select upper(substr(md5(random()::text || clock_timestamp()::text), 1, len)) $$;

-- ---------------------------------------------------------------------
-- Kurumlar (üniversite / enstitü lisansı)
-- ---------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_id text not null default 'pro' references public.plans(id),
  seats int not null default 50 check (seats > 0),
  join_code text not null unique default public.new_short_code(10),
  email_domain text,                 -- ör. 'hacettepe.edu.tr' (boşsa her e-posta katılabilir)
  active boolean not null default true,
  expires_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.organization_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
-- Bir kullanıcı aynı anda tek kuruma üye olabilir
create unique index organization_members_one_per_user on public.organization_members(user_id);

create or replace function public.is_org_admin(o uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members m where m.org_id = o and m.user_id = auth.uid() and m.role = 'admin')
$$;

create or replace function public.is_org_member(o uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members m where m.org_id = o and m.user_id = auth.uid())
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Üyeler kendi kurumunu görür; yazma yalnızca platform yöneticisi (katılma/ayrılma sunucuda kontrollü yapılır)
create policy organizations_read on public.organizations for select using (public.is_admin() or public.is_org_member(id));
create policy organizations_admin_write on public.organizations for all using (public.is_admin()) with check (public.is_admin());
create policy org_members_read on public.organization_members for select using (user_id = auth.uid() or public.is_admin() or public.is_org_admin(org_id));
create policy org_members_admin_write on public.organization_members for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Davet programı
-- ---------------------------------------------------------------------
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists referred_by uuid references public.profiles(id) on delete set null;
alter table public.profiles add column if not exists referral_rewarded_at timestamptz;
update public.profiles set referral_code = public.new_short_code(8) where referral_code is null;
alter table public.profiles alter column referral_code set default public.new_short_code(8);

-- Kayıtta davet kodu (auth meta verisindeki "ref") davet edene bağlanır
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare ref_id uuid;
begin
  select p.id into ref_id from public.profiles p
   where p.referral_code = upper(nullif(trim(new.raw_user_meta_data->>'ref'), '')) limit 1;
  insert into public.profiles (id, email, full_name, referred_by)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), ref_id);
  return new;
end $$;

-- Kullanıcı ayrıcalıklı alanları (rol, paket, askı, e-posta, davet alanları) değiştiremez
create or replace function public.protect_profile_privileged_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.plan_id is distinct from old.plan_id
     or new.is_suspended is distinct from old.is_suspended
     or new.email is distinct from old.email
     or new.referral_code is distinct from old.referral_code
     or new.referred_by is distinct from old.referred_by
     or new.referral_rewarded_at is distinct from old.referral_rewarded_at then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Kullanım kredileri (davet ödülü vb.): süresi dolana kadar aylık limite eklenir
-- ---------------------------------------------------------------------
create table public.usage_credits (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('ai_requests', 'source_searches')),
  amount int not null check (amount > 0),
  reason text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index usage_credits_user_idx on public.usage_credits(user_id);
alter table public.usage_credits enable row level security;
create policy usage_credits_read on public.usage_credits for select using (user_id = auth.uid() or public.is_admin());
-- Kredi yazma yalnızca sunucu (service role)

-- ---------- 20261105000008_grants_surveys.sql ----------
-- 8) Proje önerisi çalışma türü ve anket oluşturucu

-- TÜBİTAK / BAP proje önerisi
alter type public.work_type add value if not exists 'grant_proposal';

-- Anketler: sahibi yönetir; herkese açık form token ile yalnızca sunucuda (service role) çözülür.
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  description text not null default '' check (char_length(description) <= 5000),
  consent text not null default '' check (char_length(consent) <= 8000),
  questions jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array'),
  token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')) check (char_length(token) >= 24),
  is_open boolean not null default false,
  max_responses int check (max_responses is null or max_responses between 1 and 100000),
  closes_at timestamptz,
  response_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists surveys_user_idx on public.surveys(user_id);
create index if not exists surveys_project_idx on public.surveys(project_id);

alter table public.surveys enable row level security;
create policy surveys_owner_select on public.surveys for select using (user_id = auth.uid());
create policy surveys_owner_insert on public.surveys for insert with check (user_id = auth.uid());
create policy surveys_owner_update on public.surveys for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy surveys_owner_delete on public.surveys for delete using (user_id = auth.uid());
create trigger surveys_owner_guard before insert or update on public.surveys
  for each row execute function public.assert_project_owner();

-- Cevap sayacını kullanıcı değiştiremez (yalnızca sunucu)
create or replace function public.protect_survey_counter()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and auth.role() <> 'service_role' and new.response_count is distinct from old.response_count then
    new.response_count := old.response_count;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger surveys_protect_counter before update on public.surveys
  for each row execute function public.protect_survey_counter();

-- Cevaplar: katılımcı kimliği tutulmaz (IP, e-posta yok). Yalnızca sunucu yazar; sahibi okur ve siler.
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  duration_seconds int,
  created_at timestamptz not null default now()
);
create index if not exists survey_responses_survey_idx on public.survey_responses(survey_id, created_at);

alter table public.survey_responses enable row level security;
create policy survey_responses_owner_select on public.survey_responses for select using (user_id = auth.uid());
create policy survey_responses_owner_delete on public.survey_responses for delete using (user_id = auth.uid());

-- ---------- 20261106000009_plans_whatsapp.sql ----------
-- Paketlerin yeniden düzenlenmesi (2026-11-02)
-- Ödeme altyapısı şimdilik kapalı; yükseltme talepleri WhatsApp üzerinden alınır.
-- Öğrenci indirimi kaldırıldı; yerine %20 Akademik Ekip İndirimi (talep üzerine, elle uygulanır).

update public.plans set
  limits = limits || '{"ai_requests_month": 20, "source_searches_month": 7}'::jsonb,
  features = array['1 proje','Aylık 20 yapay zekâ isteği','Aylık 7 kaynak taraması','TXT / Markdown dışa aktarma'],
  updated_at = now()
where id = 'free';

update public.plans set
  price_monthly = 499, price_yearly = 4990,
  limits = limits || '{"ai_requests_month": 150, "source_searches_month": 100, "projects": 3}'::jsonb,
  features = array['3 proje','Aylık 150 yapay zekâ isteği','Aylık 100 kaynak taraması','DOCX / PDF dışa aktarma','Kalite kontrol'],
  updated_at = now()
where id = 'basic';

update public.plans set
  price_monthly = 899, price_yearly = 8990,
  limits = limits || '{"projects": 10}'::jsonb,
  features = array['10 proje','Aylık 1.500 yapay zekâ isteği','Aylık 2.000 kaynak taraması','Tam metin analizi (RAG)','Kılavuz yükleme'],
  updated_at = now()
where id = 'pro';

update public.plans set
  price_monthly = 1499, price_yearly = 14990,
  features = array['Sınırsız proje','Aylık 5.000 yapay zekâ isteği','Aylık 8.000 kaynak taraması','15 GB depolama','Öncelikli destek'],
  updated_at = now()
where id = 'premium';

-- Öğrenci indirimi ayarı artık kullanılmıyor
delete from public.app_settings where key = 'billing.student';

-- ---------- 20261106000010_plan_features.sql ----------
-- Paket kartları: yapay zekâ isteği sayısı yerine özellikler (D49).
-- Kullanım sınırları (plans.limits) değişmez ve uygulanmaya devam eder; yalnızca paket yükseltirken gösterilir.

update public.plans set features = array[
  '1 proje','Aylık 7 kaynak taraması','Bölüm bölüm yapay zekâ yazım asistanı','Türk ve uluslararası veri tabanlarında gerçek kaynak arama','9 atıf stili ve otomatik kaynakça','Başlık önerisi ve bölüm kontrolü','TXT / Markdown dışa aktarma'
], updated_at = now() where id = 'free';

update public.plans set features = array[
  'Ücretsiz paketteki her şey','3 proje','Aylık 100 kaynak taraması','Word / PDF dışa aktarma','Yapay zekâ destekli kalite raporu','İstatistik analizleri ve grafikler','Anket oluşturucu','Tez konusu bulma','Zotero / Mendeley / EndNote aktarımı'
], updated_at = now() where id = 'basic';

update public.plans set features = array[
  'Basic paketteki her şey','10 proje','Aylık 2.000 kaynak taraması','Literatür matrisi','Dergi önerisi ve dergi kılavuzu kontrolü','Yazım kılavuzu yükleme','Hakem yorumlarına cevap asistanı','Savunma sunumu ve savunma provası'
], updated_at = now() where id = 'pro';

update public.plans set features = array[
  'Pro paketteki her şey','Sınırsız proje','Aylık 8.000 kaynak taraması','En yüksek yapay zekâ kullanım hakkı','15 GB depolama','Öncelikli destek'
], updated_at = now() where id = 'premium';

-- ---------- 20261107000011_work_lock.sql ----------
-- Çalışma kilidi (D50): aylık kullanım limitlerinden biri dolunca kullanıcının çalışma içeriği
-- (bölüm metinleri, kaynaklar, sohbetler…) yalnızca sunucu üzerinden, karartılmış olarak gösterilir.
-- Bayrağı sunucu (service role) yönetir; kullanıcı kendisi değiştiremez.

alter table public.profiles add column if not exists work_locked boolean not null default false;

create or replace function public.protect_profile_privileged_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.plan_id is distinct from old.plan_id
     or new.is_suspended is distinct from old.is_suspended
     or new.email is distinct from old.email
     or new.referral_code is distinct from old.referral_code
     or new.referred_by is distinct from old.referred_by
     or new.referral_rewarded_at is distinct from old.referral_rewarded_at
     or new.work_locked is distinct from old.work_locked then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

-- Oturumdaki kullanıcının çalışması kilitli mi? (yönetici hiçbir zaman kilitli değildir)
create or replace function public.work_locked() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.work_locked and p.role <> 'admin' from public.profiles p where p.id = auth.uid()), false)
$$;

-- Kilitliyken içerik tablolarına doğrudan erişim (okuma/yazma) kapalı. Kısıtlayıcı politika,
-- mevcut sahiplik politikalarıyla birlikte (VE) uygulanır; service role etkilenmez.
do $$
declare t text;
begin
  foreach t in array array['project_stages','stage_revisions','stage_comments','project_memory',
                           'sources','source_chunks','ai_messages','quality_reports']
  loop
    execute format('drop policy if exists %I_work_lock on public.%I', t, t);
    execute format('create policy %I_work_lock on public.%I as restrictive for all using (not public.work_locked()) with check (not public.work_locked())', t, t);
  end loop;
end $$;

-- “Mevcut çalışmayı indir” (100 TL) hakkı: yönetici ödemeyi aldıktan sonra tanımlar
create table if not exists public.download_passes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  expires_at timestamptz not null,
  note text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists download_passes_lookup on public.download_passes (user_id, project_id, expires_at);
alter table public.download_passes enable row level security;
drop policy if exists download_passes_read on public.download_passes;
create policy download_passes_read on public.download_passes for select using (user_id = auth.uid() or public.is_admin());

-- ---------- 20261108000012_usage_integrity.sql ----------
-- Ücretlendirme sayaçlarının güvenilirliği (D51)

-- 1) Aylık kullanım toplamı veritabanında hesaplanır (API’nin 1000 satır sınırına takılmaz)
create or replace function public.usage_totals(p_user uuid, p_since timestamptz)
returns table (ai_requests bigint, tokens bigint, source_searches bigint, exports bigint, storage_bytes bigint)
language sql stable security definer set search_path = public as $$
  -- Yalnızca sunucu, yönetici veya kullanıcının kendisi (başkasının toplamı sıfır döner)
  with ok as (select (auth.uid() is null or auth.role() = 'service_role' or p_user = auth.uid() or public.is_admin()) as v)
  select
    coalesce(sum(e.quantity) filter (where e.kind = 'ai_request'), 0),
    coalesce(sum(e.tokens_in + e.tokens_out) filter (where e.kind = 'ai_request'), 0),
    coalesce(sum(e.quantity) filter (where e.kind = 'source_search'), 0),
    coalesce(sum(e.quantity) filter (where e.kind = 'export'), 0),
    case when (select v from ok) then (select coalesce(sum(size_bytes), 0) from public.files where user_id = p_user) else 0 end
  from public.usage_events e
  where e.user_id = p_user and e.created_at >= p_since and (select v from ok)
$$;
revoke all on function public.usage_totals(uuid, timestamptz) from public, anon, authenticated;

-- 2) Proje kotası atlatılamasın: projeleri yalnızca sunucu oluşturur (kota kontrolünden sonra)
drop policy if exists projects_owner_insert on public.projects;

-- 3) Arşivden çıkarma yalnızca sunucu üzerinden (kota kontrolüyle) yapılabilir
create or replace function public.protect_project_unarchive()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status = 'archived' and new.status <> 'archived'
     and not (auth.uid() is null or auth.role() = 'service_role' or public.is_admin()) then
    raise exception 'Arşivden çıkarma yalnızca uygulama üzerinden yapılabilir';
  end if;
  return new;
end $$;
drop trigger if exists projects_protect_unarchive on public.projects;
create trigger projects_protect_unarchive before update on public.projects
  for each row execute function public.protect_project_unarchive();

-- ---------- 20261108000013_token_limits.sql ----------
-- Token sınırları istek sınırlarından önce dolmasın (D51; bir istek ≈ 10–20 bin token).
-- Canlı veritabanında 2026-11-02’de elle çalıştırıldı.
update public.plans set limits = limits || '{"tokens_month": 800000}'::jsonb where id = 'free';
update public.plans set limits = limits || '{"tokens_month": 6000000}'::jsonb where id = 'basic';
update public.plans set limits = limits || '{"tokens_month": 60000000}'::jsonb where id = 'pro';
update public.plans set limits = limits || '{"tokens_month": 200000000}'::jsonb where id = 'premium';

-- ---------- 20261109000014_cost_margin.sql ----------
-- Kârlılık (D52): fiyatlar aynı; API maliyeti, KDV hariç paket gelirinin en fazla 1/3’ü.
-- İstek hakları ortalama istek maliyetine (~0,07 $ ≈ 3,4 TL) göre; sunucu ayrıca aylık maliyet tavanı uygular.

-- 1) Aylık toplam artık API maliyetini de döndürür (dönüş tipi değiştiği için yeniden oluşturulur)
drop function if exists public.usage_totals(uuid, timestamptz);
create function public.usage_totals(p_user uuid, p_since timestamptz)
returns table (ai_requests bigint, tokens bigint, source_searches bigint, exports bigint, storage_bytes bigint, cost_usd numeric)
language sql stable security definer set search_path = public as $$
  with ok as (select (auth.uid() is null or auth.role() = 'service_role' or p_user = auth.uid() or public.is_admin()) as v)
  select
    coalesce(sum(e.quantity) filter (where e.kind = 'ai_request'), 0),
    coalesce(sum(e.tokens_in + e.tokens_out) filter (where e.kind = 'ai_request'), 0),
    coalesce(sum(e.quantity) filter (where e.kind = 'source_search'), 0),
    coalesce(sum(e.quantity) filter (where e.kind = 'export'), 0),
    case when (select v from ok) then (select coalesce(sum(size_bytes), 0) from public.files where user_id = p_user) else 0 end,
    -- Tüm yapay zekâ çağrılarının maliyeti (haktan düşmeyen bölüm kontrolleri dahil)
    coalesce(sum(e.cost_usd), 0)
  from public.usage_events e
  where e.user_id = p_user and e.created_at >= p_since and (select v from ok)
$$;
revoke all on function public.usage_totals(uuid, timestamptz) from public, anon, authenticated;

-- 2) İstek hakları (ortalama maliyetle gelirin 1/3’ü)
update public.plans set limits = limits || '{"ai_requests_month": 10, "cost_usd_month": 1}'::jsonb, updated_at = now() where id = 'free';
update public.plans set limits = limits || '{"ai_requests_month": 40}'::jsonb, updated_at = now() where id = 'basic';
update public.plans set limits = limits || '{"ai_requests_month": 75}'::jsonb, updated_at = now() where id = 'pro';
update public.plans set limits = limits || '{"ai_requests_month": 125}'::jsonb, updated_at = now() where id = 'premium';

-- 3) Kâr ayarları (yönetim panelinden değiştirilebilir): dolar kuru, KDV, maliyet payı, ortalama istek maliyeti
insert into public.app_settings (key, value) values
  ('billing.margin', '{"usd_try": 48, "vat_rate": 0.2, "cost_share": 0.3333, "avg_request_usd": 0.07}')
on conflict (key) do nothing;

select id, price_monthly, limits->>'ai_requests_month' as yz_istek from public.plans order by sort_order;

-- ---------- 20261110000015_plan_expiry.sql ----------
-- Paket süresi (D53): ücretli paketin bitiş tarihi. Süre dolunca kullanıcı ücretsiz pakete düşer.
-- Yalnızca yönetici / sunucu değiştirebilir.
alter table public.profiles add column if not exists plan_expires_at timestamptz;

create or replace function public.protect_profile_privileged_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.plan_id is distinct from old.plan_id
     or new.plan_expires_at is distinct from old.plan_expires_at
     or new.is_suspended is distinct from old.is_suspended
     or new.email is distinct from old.email
     or new.referral_code is distinct from old.referral_code
     or new.referred_by is distinct from old.referred_by
     or new.referral_rewarded_at is distinct from old.referral_rewarded_at
     or new.work_locked is distinct from old.work_locked then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

create index if not exists profiles_plan_expires_at on public.profiles (plan_expires_at) where plan_expires_at is not null;

-- ---------- 20261111000016_member_no.sql ----------
-- Üye numarası (D56): her kullanıcıya kısa, değiştirilemez bir numara (AC001001 biçiminde gösterilir).
-- Mevcut kullanıcılara da otomatik atanır; GENERATED ALWAYS olduğu için kimse elle değiştiremez.
alter table public.profiles add column if not exists member_no bigint generated always as identity (start with 1001);
create unique index if not exists profiles_member_no on public.profiles (member_no);

select member_no, email from public.profiles order by member_no limit 5;

-- ---------- 20261112000017_price_increase.sql ----------
-- Fiyatlar %50 artırıldı (D60); haklar (limits) aynı. Maliyet tavanı fiyattan hesaplandığı için kendiliğinden yükselir.
update public.plans set price_monthly = 749,  price_yearly = 7490,  updated_at = now() where id = 'basic';
update public.plans set price_monthly = 1349, price_yearly = 13490, updated_at = now() where id = 'pro';
update public.plans set price_monthly = 2249, price_yearly = 22490, updated_at = now() where id = 'premium';

select id, price_monthly, limits->>'ai_requests_month' as yz_istek from public.plans order by sort_order;

-- ---------- 20261113000018_unlimited_seats.sql ----------
-- Kurum lisansı / Akademik Ekip: kişi sayısı sınırsız (D70).
-- seats boş (null) = sınırsız. Mevcut kurumların sınırı da kaldırılır.
alter table public.organizations drop constraint if exists organizations_seats_check;
alter table public.organizations alter column seats drop not null;
alter table public.organizations alter column seats set default null;
alter table public.organizations add constraint organizations_seats_check check (seats is null or seats > 0);
update public.organizations set seats = null;

-- ---------- 20261114000019_isnad.sql ----------
-- ISNAD 2. edisyon (metin içi) atıf stili (D73).
alter type public.citation_style add value if not exists 'isnad';

-- Paket kartlarındaki özellik metni: 9 → 10 atıf stili
update public.plans set features = array_replace(features, '9 atıf stili ve otomatik kaynakça', '10 atıf stili ve otomatik kaynakça'), updated_at = now()
where '9 atıf stili ve otomatik kaynakça' = any(features);

-- ---------- 20261115000020_no_work_lock.sql ----------
-- D81: Çalışma kilidi kaldırıldı. Kullanıcı kendi çalışmasına erişimi hiçbir zaman kaybetmez;
-- aylık hak dolunca yalnızca yapay zekâ ve kaynak tarama durur (sunucuda kontrol edilir).
-- Eski bayraklar temizlenir ve içerik tablolarındaki kilit kuralı her zaman “kilitli değil” döner.
update public.profiles set work_locked = false where work_locked;

create or replace function public.work_locked() returns boolean
language sql stable security definer set search_path = public as $$
  select false
$$;

-- ---------- 20261116000021_tools_analytics.sql ----------
-- Ücretsiz araçlar ve ölçüm (D90).
-- tool_usage: ücretsiz araçların kullanımı ve (varsa) yapay zekâ maliyeti; giriş yapmamış ziyaretçiler de kullanır.
-- analytics_events: kişisel veri içermeyen ziyaret kaydı. IP ve tarayıcı bilgisi SAKLANMAZ; yalnızca her gün değişen,
-- geri çözülemeyen bir ziyaretçi karması tutulur (aynı kişi ertesi gün farklı görünür). Çerez kullanılmaz.
-- Her iki tabloya yalnızca sunucu (service role) yazar ve okur; kullanıcıların erişimi yoktur.
create table if not exists public.tool_usage (
  id bigint generated always as identity primary key,
  tool text not null check (char_length(tool) between 1 and 40),
  user_id uuid references public.profiles(id) on delete set null,
  visitor text check (char_length(visitor) <= 64),
  items int not null default 1,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  cost_usd numeric(12,6) not null default 0,
  model text,
  created_at timestamptz not null default now()
);
create index if not exists tool_usage_created_idx on public.tool_usage (created_at);
create index if not exists tool_usage_visitor_idx on public.tool_usage (visitor, created_at);
alter table public.tool_usage enable row level security;

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('pageview', 'tool')),
  path text not null default '' check (char_length(path) <= 300),
  referrer text check (char_length(referrer) <= 200),
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  visitor text check (char_length(visitor) <= 64),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  locale text check (char_length(locale) <= 5),
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
alter table public.analytics_events enable row level security;

-- ---------- 20261117000022_package_promises ----------
-- Paket vaatleri (D96, analiz D95): kartlarda aylık yazım miktarı (Türk tez biçiminde sayfa), Pro/Premium’da
-- “sınırsız kaynak taraması (adil kullanım)”, belirsiz Premium ifadesi kaldırıldı. Tarama sınırları (2.000 / 8.000)
-- adil kullanım koruması olarak veritabanında kalır. limits.pages_month yalnızca bilgi amaçlıdır (yükseltme penceresi).
-- Yönetim panelinden elle yapılmış kart düzenlemeleri korunur: satırlar yalnızca eklenir/değiştirilir; tekrar çalıştırmak güvenlidir.
-- Ortalama istek maliyeti varsayımı 0,07 → 0,09 $ (ölçülen ortalama).

-- 1) Aylık sayfa satırı: kartın ilk satırından hemen sonra (zaten varsa eklenmez)
update public.plans set features = features[1:1] || array['Yapay zekâ ile yaklaşık 5 sayfa deneme taslağı'] || features[2:], updated_at = now()
where id = 'free' and not ('Yapay zekâ ile yaklaşık 5 sayfa deneme taslağı' = any(features));
update public.plans set features = features[1:1] || array['Ayda yaklaşık 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)'] || features[2:], updated_at = now()
where id = 'basic' and not ('Ayda yaklaşık 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)' = any(features));
update public.plans set features = features[1:1] || array['Ayda yaklaşık 50 sayfa yapay zekâ destekli akademik metin (ör. 2 makale; yüksek lisans tezi 1–2 ayda)'] || features[2:], updated_at = now()
where id = 'pro' and not ('Ayda yaklaşık 50 sayfa yapay zekâ destekli akademik metin (ör. 2 makale; yüksek lisans tezi 1–2 ayda)' = any(features));
update public.plans set features = features[1:1] || array['Ayda yaklaşık 85 sayfa yapay zekâ destekli akademik metin (yüksek lisans tezi ayda bir; doktora tezi yaklaşık 2 ayda)'] || features[2:], updated_at = now()
where id = 'premium' and not ('Ayda yaklaşık 85 sayfa yapay zekâ destekli akademik metin (yüksek lisans tezi ayda bir; doktora tezi yaklaşık 2 ayda)' = any(features));

-- 2) Tarama ifadesi ve belirsiz Premium satırı
update public.plans set features = array_replace(features, 'Aylık 2.000 kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'), updated_at = now() where id = 'pro';
update public.plans set features = array_remove(array_replace(features, 'Aylık 8.000 kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'), 'En yüksek yapay zekâ kullanım hakkı'), updated_at = now() where id = 'premium';

-- 3) Yükseltme penceresi için sayfa bilgisi
update public.plans set limits = limits || '{"pages_month": 5}'::jsonb where id = 'free';
update public.plans set limits = limits || '{"pages_month": 25}'::jsonb where id = 'basic';
update public.plans set limits = limits || '{"pages_month": 50}'::jsonb where id = 'pro';
update public.plans set limits = limits || '{"pages_month": 85}'::jsonb where id = 'premium';

-- 4) Kur hatırlatıcısı ayarın son değişme tarihine bakar; bu güncelleme onu değiştirmez (updated_at dokunulmaz)
update public.app_settings set value = value || '{"avg_request_usd": 0.09}'::jsonb where key = 'billing.margin';

select id, limits->>'pages_month' as sayfa_ay, features from public.plans order by sort_order;

-- ---------- 20261118000023_referral_inviter_only ----------
-- Davet ödülü (D99): yalnızca davet edene verilir ve davet edilen kişi KAYDOLDUĞU anda tanımlanır (e-posta
-- doğrulaması beklenmez). Yeni kaydolan zaten Ücretsiz paketin haklarını alır. Ödül miktarı Ücretsiz paketin aylık
-- haklarıdır (D98); geçerlilik ve davet edenin aylık ödül sınırı yönetimdeki “referral” ayarından okunur.
-- Kayıtta (insert) ve sosyal girişte davet kodu sonradan bağlandığında (referred_by güncellemesi) çalışır; tek seferliktir.

create or replace function public.grant_referral_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cfg jsonb;
  lim jsonb;
  ai int;
  ss int;
  days int;
  cap int;
  cnt int;
  month_start timestamptz;
begin
  if new.referred_by is null or new.referral_rewarded_at is not null or new.referred_by = new.id then
    return new;
  end if;
  select value into cfg from public.app_settings where key = 'referral';
  if cfg is not null and coalesce((cfg->>'enabled')::boolean, true) = false then
    return new;
  end if;
  select limits into lim from public.plans where id = 'free';
  ai := coalesce(nullif(lim->>'ai_requests_month', '')::int, 10);
  ss := coalesce(nullif(lim->>'source_searches_month', '')::int, 7);
  days := coalesce(nullif(cfg->>'valid_days', '')::int, 60);
  cap := coalesce(nullif(cfg->>'monthly_cap', '')::int, 20);
  -- Ay başı Türkiye saatiyle (sayaçlarla aynı dönem)
  month_start := date_trunc('month', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul';
  select count(*) into cnt from public.usage_credits
   where user_id = new.referred_by and reason = 'referral_inviter' and kind = 'ai_requests' and created_at >= month_start;
  if cnt < cap then
    insert into public.usage_credits (user_id, kind, amount, reason, expires_at) values
      (new.referred_by, 'ai_requests', ai, 'referral_inviter', now() + make_interval(days => days)),
      (new.referred_by, 'source_searches', ss, 'referral_inviter', now() + make_interval(days => days));
  end if;
  new.referral_rewarded_at := now();
  return new;
end $$;

drop trigger if exists profiles_referral_reward on public.profiles;
create trigger profiles_referral_reward before insert or update of referred_by on public.profiles
  for each row execute function public.grant_referral_on_signup();

-- Bekleyen davetler (kaydolmuş ama e-postasını henüz doğrulamamış kişiler): davet edene şimdi verilir (aylık sınırla)
update public.profiles set referred_by = referred_by where referred_by is not null and referral_rewarded_at is null;

select count(*) as odul_bekleyen_kalmadi from public.profiles where referred_by is not null and referral_rewarded_at is null;

-- ---------- 20261119000024_notifications ----------
-- Bildirim kutusu (D100): kullanıcıya özel bildirimler (ilk tür: davet ödülü). Metin istemcide kullanıcının
-- diline göre `kind` + `data`’dan üretilir. Kullanıcı yalnızca kendi bildirimlerini görür ve okundu işaretler;
-- bildirimleri yalnızca sunucu ve veritabanı tetikleyicileri yazar.

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (char_length(kind) between 1 and 40),
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select using (user_id = auth.uid());
drop policy if exists notifications_mark_read on public.notifications;
create policy notifications_mark_read on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Kullanıcı yalnızca okundu bilgisini değiştirebilir
create or replace function public.protect_notification_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' then return new; end if;
  if new.user_id is distinct from old.user_id or new.kind is distinct from old.kind or new.data is distinct from old.data or new.created_at is distinct from old.created_at then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;
drop trigger if exists notifications_protect on public.notifications;
create trigger notifications_protect before update on public.notifications for each row execute function public.protect_notification_columns();

-- Davet ödülü (D99) artık davet edene bildirim de bırakır (ödül verildi / aylık sınır doldu)
create or replace function public.grant_referral_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cfg jsonb;
  lim jsonb;
  ai int;
  ss int;
  days int;
  cap int;
  cnt int;
  month_start timestamptz;
begin
  if new.referred_by is null or new.referral_rewarded_at is not null or new.referred_by = new.id then
    return new;
  end if;
  select value into cfg from public.app_settings where key = 'referral';
  if cfg is not null and coalesce((cfg->>'enabled')::boolean, true) = false then
    return new;
  end if;
  select limits into lim from public.plans where id = 'free';
  ai := coalesce(nullif(lim->>'ai_requests_month', '')::int, 10);
  ss := coalesce(nullif(lim->>'source_searches_month', '')::int, 7);
  days := coalesce(nullif(cfg->>'valid_days', '')::int, 60);
  cap := coalesce(nullif(cfg->>'monthly_cap', '')::int, 20);
  month_start := date_trunc('month', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul';
  select count(*) into cnt from public.usage_credits
   where user_id = new.referred_by and reason = 'referral_inviter' and kind = 'ai_requests' and created_at >= month_start;
  if cnt < cap then
    insert into public.usage_credits (user_id, kind, amount, reason, expires_at) values
      (new.referred_by, 'ai_requests', ai, 'referral_inviter', now() + make_interval(days => days)),
      (new.referred_by, 'source_searches', ss, 'referral_inviter', now() + make_interval(days => days));
    insert into public.notifications (user_id, kind, data)
      values (new.referred_by, 'referral_reward', jsonb_build_object('ai', ai, 'ss', ss, 'days', days));
  else
    insert into public.notifications (user_id, kind, data)
      values (new.referred_by, 'referral_cap', jsonb_build_object('cap', cap));
  end if;
  new.referral_rewarded_at := now();
  return new;
end $$;

-- Daha önce (migration 23 ile) ödül kazananlara geriye dönük bildirim: son 60 gündeki davet ödülleri
insert into public.notifications (user_id, kind, data, created_at)
select c.user_id, 'referral_reward', jsonb_build_object('ai', c.amount, 'ss', coalesce(s.amount, 0), 'days', coalesce(greatest(1, round(extract(epoch from (c.expires_at - c.created_at)) / 86400)::int), 60)), c.created_at
from public.usage_credits c
left join public.usage_credits s on s.user_id = c.user_id and s.reason = 'referral_inviter' and s.kind = 'source_searches' and s.created_at = c.created_at
where c.reason = 'referral_inviter' and c.kind = 'ai_requests' and c.created_at > now() - interval '60 days'
  and not exists (select 1 from public.notifications n where n.user_id = c.user_id and n.kind = 'referral_reward' and n.created_at = c.created_at);

select count(*) as bildirim_sayisi from public.notifications;
