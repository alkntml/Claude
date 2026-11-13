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

-- ---------- 20261120000025_referral_device_guard ----------
-- Davet ödülü kötüye kullanım önlemi (D101): davet koduyla açılan hesap, davet edenin daha önce kullandığı bir
-- cihazdan kaydolursa ödül verilmez. Cihaz kimliği tarayıcıda üretilen rastgele bir değerdir (kişisel bilgi içermez);
-- veritabanına yalnızca SHA-256 özeti (64 hex) yazılır. Kayıtta özet auth meta verisinden (“did”) gelir.

alter table public.profiles add column if not exists signup_device text check (signup_device is null or signup_device ~ '^[0-9a-f]{64}$');

create table if not exists public.user_devices (
  user_id uuid not null references public.profiles(id) on delete cascade,
  device text not null check (device ~ '^[0-9a-f]{64}$'),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (user_id, device)
);
create index if not exists user_devices_device_idx on public.user_devices (device);
alter table public.user_devices enable row level security;
-- Politika yok: yalnızca sunucu (service role) ve tetikleyiciler okur/yazar

-- Kayıt: davet kodu + cihaz özeti profile yazılır, cihaz kullanıcının cihazlarına eklenir
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare ref_id uuid; did text;
begin
  select p.id into ref_id from public.profiles p
   where p.referral_code = upper(nullif(trim(new.raw_user_meta_data->>'ref'), '')) limit 1;
  did := lower(nullif(trim(new.raw_user_meta_data->>'did'), ''));
  if did is not null and did !~ '^[0-9a-f]{64}$' then did := null; end if;
  insert into public.profiles (id, email, full_name, referred_by, signup_device)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), ref_id, did);
  if did is not null then
    insert into public.user_devices (user_id, device) values (new.id, did) on conflict do nothing;
  end if;
  return new;
end $$;

-- Davet ödülü: cihaz bilgisi yoksa karar ilk girişe bırakılır (sunucu cihazı okuyup aynı kuralla karar verir);
-- davet edenin cihazıyla aynıysa ödül verilmez ve davet edene bilgi verilir
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
  if new.signup_device is null then
    return new;
  end if;
  select value into cfg from public.app_settings where key = 'referral';
  if cfg is not null and coalesce((cfg->>'enabled')::boolean, true) = false then
    return new;
  end if;
  if exists (select 1 from public.user_devices d where d.user_id = new.referred_by and d.device = new.signup_device) then
    insert into public.notifications (user_id, kind, data) values (new.referred_by, 'referral_same_device', '{}'::jsonb);
    new.referral_rewarded_at := now();
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

select count(*) as kayitli_cihaz from public.user_devices;

-- ---------- 20261121000026_activity_log ----------
-- Kullanım kanıt kaydı (D102): paket kullanımı anlaşmazlıklarında yönetici, kullanıcının ne kadar yapay zekâ çıktısı
-- aldığını ve neyi sildiğini görebilsin. Kullanıcı çalışmasını veya metnini silse de kayıt kalır (12 ay saklanır;
-- hesap silinince silinir). Kullanıcılar bu tabloyu göremez; yalnızca sunucu ve tetikleyiciler yazar, yönetici okur.

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('ai_output', 'project_deleted', 'stage_deleted', 'text_removed')),
  action text,
  project_id uuid,
  project_title text,
  stage_title text,
  words int not null default 0,
  words_before int,
  model text,
  output text,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_user_idx on public.activity_log (user_id, created_at desc);
alter table public.activity_log enable row level security;
-- Politika yok: yalnızca sunucu (service role) ve tetikleyiciler

-- Çalışma silinince: başlık ve toplam kelime
create or replace function public.log_project_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.activity_log (user_id, kind, project_id, project_title, words)
  values (old.user_id, 'project_deleted', old.id, old.title,
          coalesce((select sum(word_count) from public.project_stages where project_id = old.id), 0));
  return old;
end $$;
drop trigger if exists projects_log_delete on public.projects;
create trigger projects_log_delete before delete on public.projects for each row execute function public.log_project_delete();

-- Bölüm silinince (çalışmanın tamamı silinirken ayrıca yazılmaz)
create or replace function public.log_stage_delete()
returns trigger language plpgsql security definer set search_path = public as $$
declare ptitle text;
begin
  select title into ptitle from public.projects where id = old.project_id;
  if ptitle is null then return old; end if;
  if coalesce(old.word_count, 0) > 0 then
    insert into public.activity_log (user_id, kind, project_id, project_title, stage_title, words)
    values (old.user_id, 'stage_deleted', old.project_id, ptitle, old.title, old.word_count);
  end if;
  return old;
end $$;
drop trigger if exists stages_log_delete on public.project_stages;
create trigger stages_log_delete before delete on public.project_stages for each row execute function public.log_stage_delete();

-- Bölümden 300 kelime veya daha fazla metin silinince
create or replace function public.log_text_removed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(old.word_count, 0) - coalesce(new.word_count, 0) >= 300 then
    insert into public.activity_log (user_id, kind, project_id, project_title, stage_title, words, words_before)
    values (new.user_id, 'text_removed', new.project_id, (select title from public.projects where id = new.project_id), new.title,
            coalesce(old.word_count, 0) - coalesce(new.word_count, 0), old.word_count);
  end if;
  return new;
end $$;
drop trigger if exists stages_log_text_removed on public.project_stages;
create trigger stages_log_text_removed after update of word_count on public.project_stages for each row execute function public.log_text_removed();

select count(*) as kayit_sayisi from public.activity_log;

-- ---------- 20261122000027_single_project_plan ----------
-- Tek Proje paketi (D103): tek ödeme 3.999 TL, süresiz, tüm özellikler ve yapay zekâ kullanımı sınırsız; yalnızca
-- TEK bir çalışma. Kötüye kullanıma karşı: (1) engelleme — ikinci çalışma açılamaz, pakete bağlı çalışma kullanıcı
-- tarafından silinemez, çalışma türü değiştirilemez; (2) uyarı — indirdikten sonra büyük silme, toplu silme, konu
-- değişikliği ve olağan dışı üretimde yöneticilere bildirim ve kullanıcının kanıt kaydına (activity_log) not düşülür.

-- 0) Düzeltme (D102): hesap silinirken çalışmalar da silinir; kanıt kaydı silinen hesaba kayıt yazmaya çalışınca
-- hesap silme başarısız oluyordu. Hesap artık yoksa (silme sırasında) kayıt yazılmaz.
create or replace function public.log_project_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = old.user_id) then return old; end if;
  insert into public.activity_log (user_id, kind, project_id, project_title, words)
  values (old.user_id, 'project_deleted', old.id, old.title,
          coalesce((select sum(word_count) from public.project_stages where project_id = old.id), 0));
  return old;
end $$;

-- 1) Paket
insert into public.plans (id, name, description, price_monthly, price_yearly, currency, limits, features, sort_order, is_active)
values ('single', 'Tek Proje', 'Tek bir çalışma için tek ödeme: süresiz ve sınırsız kullanım.', 3999, 3999, 'TRY',
  '{"ai_requests_month": null, "tokens_month": null, "source_searches_month": null, "projects": 1, "storage_mb": 15000, "export_formats": ["txt","md","docx","pdf"], "cost_usd_month": null, "one_time": true}'::jsonb,
  array['Tek seferlik ödeme, süre sınırı yok','1 çalışma (tez, makale, proje önerisi…)','Sınırsız yapay zekâ kullanımı ve sınırsız sayfa','Sınırsız kaynak taraması','Tüm özellikler (Premium dahil)','15 GB depolama'],
  4, true)
on conflict (id) do update set name = excluded.name, description = excluded.description, price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly, limits = excluded.limits, features = excluded.features, sort_order = excluded.sort_order, is_active = true, updated_at = now();

-- 2) Pakete bağlı çalışma
alter table public.profiles add column if not exists single_project_id uuid references public.projects(id) on delete set null;

-- Kullanıcı ayrıcalıklı alanları (pakete bağlı çalışma ve kayıt cihazı dahil) kendisi değiştiremez
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
     or new.work_locked is distinct from old.work_locked
     or new.single_project_id is distinct from old.single_project_id
     or new.signup_device is distinct from old.signup_device then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

-- 3) Uyarılar: kanıt kaydına not + yöneticilere bildirim (aynı kural için 24 saatte bir)
alter table public.activity_log drop constraint if exists activity_log_kind_check;
alter table public.activity_log add constraint activity_log_kind_check check (kind in ('ai_output', 'project_deleted', 'stage_deleted', 'text_removed', 'abuse_alert'));

create or replace function public.raise_abuse_alert(p_user uuid, p_rule text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare em text;
begin
  if exists (select 1 from public.activity_log where user_id = p_user and kind = 'abuse_alert' and action = p_rule and created_at > now() - interval '24 hours') then
    return;
  end if;
  select email into em from public.profiles where id = p_user;
  insert into public.activity_log (user_id, kind, action, project_id, project_title, words, output)
  values (p_user, 'abuse_alert', p_rule, nullif(p_data->>'project_id', '')::uuid, p_data->>'project_title', coalesce((p_data->>'words')::int, 0), p_data::text);
  insert into public.notifications (user_id, kind, data)
  select a.id, 'abuse_alert', p_data || jsonb_build_object('rule', p_rule, 'user_id', p_user, 'email', coalesce(em, ''))
  from public.profiles a where a.role = 'admin';
end $$;
revoke all on function public.raise_abuse_alert(uuid, text, jsonb) from public, anon, authenticated;

-- 4) Engelleme (veritabanı düzeyinde; uygulama arayüzü kullanıcıya açıklamayı ve uyarıyı ayrıca verir)
create or replace function public.single_project_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare pr record;
begin
  -- Yalnızca kullanıcının kendi işlemleri (yönetici ve sunucu serbest)
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if tg_op = 'INSERT' then
    select plan_id, single_project_id into pr from public.profiles where id = new.user_id;
    if pr.plan_id = 'single' and pr.single_project_id is not null then
      raise exception 'Tek Proje paketinde yalnızca bir çalışma yapılabilir.';
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    select plan_id, single_project_id into pr from public.profiles where id = old.user_id;
    if pr.plan_id = 'single' and pr.single_project_id = old.id then
      raise exception 'Tek Proje paketine bağlı çalışma silinemez.';
    end if;
    return old;
  else
    select plan_id, single_project_id into pr from public.profiles where id = new.user_id;
    if pr.plan_id = 'single' and pr.single_project_id = new.id and new.work_type is distinct from old.work_type then
      raise exception 'Tek Proje paketinde çalışma türü değiştirilemez.';
    end if;
    return new;
  end if;
end $$;
drop trigger if exists projects_single_guard_ins on public.projects;
create trigger projects_single_guard_ins before insert on public.projects for each row execute function public.single_project_guard();
drop trigger if exists projects_single_guard_del on public.projects;
create trigger projects_single_guard_del before delete on public.projects for each row execute function public.single_project_guard();
drop trigger if exists projects_single_guard_upd on public.projects;
create trigger projects_single_guard_upd before update of work_type on public.projects for each row execute function public.single_project_guard();

-- İlk çalışma pakete bağlanır
create or replace function public.single_project_bind()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set single_project_id = new.id where id = new.user_id and plan_id = 'single' and single_project_id is null;
  return new;
end $$;
drop trigger if exists projects_single_bind on public.projects;
create trigger projects_single_bind after insert on public.projects for each row execute function public.single_project_bind();

-- Yönetici Tek Proje paketini atadığında: kullanıcının en son çalıştığı çalışma pakete bağlanır (yoksa ilk açacağı)
create or replace function public.single_project_bind_on_plan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.plan_id = 'single' and new.single_project_id is null then
    select id into new.single_project_id from public.projects where user_id = new.id order by updated_at desc limit 1;
  end if;
  return new;
end $$;
drop trigger if exists profiles_single_bind on public.profiles;
create trigger profiles_single_bind before update of plan_id on public.profiles for each row execute function public.single_project_bind_on_plan();

-- 5) Uyarı kuralları
-- Eklentisiz kelime benzerliği (0–1, Jaccard): iki metnin ortak kelime oranı
create or replace function public.word_overlap(a text, b text)
returns numeric language sql immutable set search_path = public as $$
  with x as (select distinct w from regexp_split_to_table(lower(coalesce(a, '')), '[^[:alnum:]]+') w where length(w) > 2),
       y as (select distinct w from regexp_split_to_table(lower(coalesce(b, '')), '[^[:alnum:]]+') w where length(w) > 2)
  select case when (select count(*) from (select w from x union select w from y) u) = 0 then 1
              else (select count(*) from x join y using (w))::numeric / (select count(*) from (select w from x union select w from y) u) end
$$;

-- Başlık/konu belirgin biçimde değişirse (çalışmada en az 3.000 kelime varken)
create or replace function public.single_project_topic_watch()
returns trigger language plpgsql security definer set search_path = public as $$
declare pr record; w int;
begin
  select plan_id, single_project_id into pr from public.profiles where id = new.user_id;
  if pr.plan_id is distinct from 'single' or pr.single_project_id is distinct from new.id then return new; end if;
  select coalesce(sum(word_count), 0) into w from public.project_stages where project_id = new.id;
  if w >= 3000 and (
       (new.title is distinct from old.title and public.word_overlap(old.title, new.title) < 0.25)
    or (new.topic is distinct from old.topic and coalesce(old.topic, '') <> '' and public.word_overlap(old.topic, new.topic) < 0.25)) then
    perform public.raise_abuse_alert(new.user_id, 'topic_change', jsonb_build_object('project_id', new.id, 'project_title', new.title, 'old_title', old.title, 'old_topic', old.topic, 'new_topic', new.topic, 'words', w));
  end if;
  return new;
end $$;
drop trigger if exists projects_single_topic_watch on public.projects;
create trigger projects_single_topic_watch after update of title, topic on public.projects for each row execute function public.single_project_topic_watch();

-- Silme ve üretim kayıtları (kanıt kaydı) üzerinden: indirdikten sonra büyük silme, toplu silme, olağan dışı üretim
create or replace function public.single_project_activity_watch()
returns trigger language plpgsql security definer set search_path = public as $$
declare pr record; last_export timestamptz; del_after int; del_total int; gen_total int;
begin
  if new.kind = 'abuse_alert' then return new; end if;
  select plan_id, single_project_id into pr from public.profiles where id = new.user_id;
  if pr.plan_id is distinct from 'single' then return new; end if;
  if new.kind in ('text_removed', 'stage_deleted') then
    select max(created_at) into last_export from public.usage_events
     where user_id = new.user_id and kind = 'export' and meta->>'projectId' = coalesce(new.project_id::text, '');
    if last_export is not null then
      select coalesce(sum(words), 0) into del_after from public.activity_log
       where user_id = new.user_id and project_id = new.project_id and kind in ('text_removed', 'stage_deleted') and created_at > last_export;
      if del_after >= 3000 then
        perform public.raise_abuse_alert(new.user_id, 'delete_after_export', jsonb_build_object('project_id', new.project_id, 'project_title', new.project_title, 'words', del_after, 'exported_at', last_export));
      end if;
    end if;
    select coalesce(sum(words) filter (where kind in ('text_removed', 'stage_deleted')), 0), coalesce(sum(words) filter (where kind = 'ai_output'), 0)
      into del_total, gen_total from public.activity_log where user_id = new.user_id;
    if del_total >= 10000 and del_total >= gen_total * 0.6 then
      perform public.raise_abuse_alert(new.user_id, 'mass_delete', jsonb_build_object('project_id', new.project_id, 'project_title', new.project_title, 'words', del_total, 'generated', gen_total));
    end if;
  elsif new.kind = 'ai_output' then
    select coalesce(sum(words), 0) into gen_total from public.activity_log where user_id = new.user_id and kind = 'ai_output';
    -- Her 120.000 kelimede bir (≈ 4 yüksek lisans tezi ana metni)
    if gen_total >= 120000 and (gen_total - new.words) / 120000 < gen_total / 120000 then
      perform public.raise_abuse_alert(new.user_id, 'heavy_generation', jsonb_build_object('project_id', new.project_id, 'project_title', new.project_title, 'words', gen_total));
    end if;
  end if;
  return new;
end $$;
drop trigger if exists activity_single_watch on public.activity_log;
create trigger activity_single_watch after insert on public.activity_log for each row execute function public.single_project_activity_watch();

select id, name, price_monthly, limits->>'projects' as proje from public.plans where id = 'single';

-- ---------- 20261123000028_single_cost_alert ----------
-- Tek Proje maliyet uyarısı (D104): paketin atandığı andan bu yana yapay zekâ maliyeti, paket gelirinin (KDV hariç,
-- dolar kuruyla) %40’ını geçince yöneticilere bir kez bildirim. Kullanım KISITLANMAZ. Yalnızca Tek Proje paketi.

alter table public.profiles add column if not exists single_started_at timestamptz;
update public.profiles set single_started_at = now() where plan_id = 'single' and single_started_at is null;

-- Paket atanınca başlangıç zamanı ve bağlı çalışma
create or replace function public.single_project_bind_on_plan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.plan_id = 'single' and old.plan_id is distinct from 'single' then
    new.single_started_at := now();
  end if;
  if new.plan_id = 'single' and new.single_project_id is null then
    select id into new.single_project_id from public.projects where user_id = new.id order by updated_at desc limit 1;
  end if;
  return new;
end $$;

-- Kullanıcı başlangıç zamanını da değiştiremez
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
     or new.work_locked is distinct from old.work_locked
     or new.single_project_id is distinct from old.single_project_id
     or new.single_started_at is distinct from old.single_started_at
     or new.signup_device is distinct from old.signup_device then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

-- Toplam maliyet ve %40 sınırı (yönetim ekranı da kullanır)
create or replace function public.single_cost_status(p_user uuid)
returns table (cost_usd numeric, budget_usd numeric, pct numeric, started_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare st timestamptz; price numeric; m jsonb; revenue_usd numeric; total numeric;
begin
  select single_started_at into st from public.profiles where id = p_user;
  select price_monthly into price from public.plans where id = 'single';
  select value into m from public.app_settings where key = 'billing.margin';
  revenue_usd := coalesce(price, 0) / (1 + coalesce((m->>'vat_rate')::numeric, 0.2)) / greatest(1, coalesce((m->>'usd_try')::numeric, 48));
  select coalesce(sum(e.cost_usd), 0) into total from public.usage_events e where e.user_id = p_user and (st is null or e.created_at >= st);
  return query select round(total, 4), round(revenue_usd * 0.4, 2), case when revenue_usd > 0 then round(total / revenue_usd * 100, 1) else 0 end, st;
end $$;
revoke all on function public.single_cost_status(uuid) from public, anon, authenticated;

create or replace function public.single_cost_watch()
returns trigger language plpgsql security definer set search_path = public as $$
declare pr record; s record;
begin
  if coalesce(new.cost_usd, 0) <= 0 then return new; end if;
  select plan_id, single_started_at, single_project_id into pr from public.profiles where id = new.user_id;
  if pr.plan_id is distinct from 'single' then return new; end if;
  -- Bu paket dönemi için yalnızca bir kez
  if exists (select 1 from public.activity_log where user_id = new.user_id and kind = 'abuse_alert' and action = 'cost_40'
             and (pr.single_started_at is null or created_at >= pr.single_started_at)) then
    return new;
  end if;
  select * into s from public.single_cost_status(new.user_id);
  if s.cost_usd >= s.budget_usd and s.budget_usd > 0 then
    perform public.raise_abuse_alert(new.user_id, 'cost_40', jsonb_build_object('project_id', pr.single_project_id, 'cost', s.cost_usd, 'budget', s.budget_usd, 'pct', s.pct));
  end if;
  return new;
end $$;
drop trigger if exists usage_single_cost_watch on public.usage_events;
create trigger usage_single_cost_watch after insert on public.usage_events for each row execute function public.single_cost_watch();

select count(*) as tek_proje_kullanici from public.profiles where plan_id = 'single';

-- ---------- 20261124000029_referral_email_guard ----------
-- Davet ödülü açığı kapatıldı (D106):
--  1) Ödül, davet edilen kişi e-postasını DOĞRULADIĞINDA verilir (sahte/uydurma adreslerle ödül toplanamaz).
--     Doğrulama kayıttan sonra gelirse auth.users tetikleyicisi bekleyen ödülü o anda değerlendirir.
--  2) Tek kullanımlık (geçici) e-posta servisleriyle açılan hesaplar ödül kazandırmaz; davet edene bilgi verilir.
-- Aynı cihaz kuralı (D101) ve aylık sınır aynen geçerlidir. Tekrar çalıştırmak güvenlidir.

create table if not exists public.disposable_email_domains (domain text primary key);
alter table public.disposable_email_domains enable row level security;
-- Politika yok: yalnızca sunucu ve tetikleyiciler okur
insert into public.disposable_email_domains (domain) values
  ('10minutemail.com'),
  ('10minutemail.net'),
  ('20minutemail.com'),
  ('anonbox.net'),
  ('burnermail.io'),
  ('discard.email'),
  ('dispostable.com'),
  ('emailfake.com'),
  ('emailondeck.com'),
  ('fakeinbox.com'),
  ('fakemail.net'),
  ('getairmail.com'),
  ('getnada.com'),
  ('grr.la'),
  ('guerrillamail.biz'),
  ('guerrillamail.com'),
  ('guerrillamail.de'),
  ('guerrillamail.info'),
  ('guerrillamail.net'),
  ('guerrillamail.org'),
  ('guerrillamailblock.com'),
  ('inboxkitten.com'),
  ('jetable.org'),
  ('mail.tm'),
  ('mailcatch.com'),
  ('maildrop.cc'),
  ('mailinator.com'),
  ('mailinator.net'),
  ('mailnesia.com'),
  ('mintemail.com'),
  ('mohmal.com'),
  ('moakt.com'),
  ('mytemp.email'),
  ('nada.email'),
  ('sharklasers.com'),
  ('spam4.me'),
  ('spamgourmet.com'),
  ('temp-mail.io'),
  ('temp-mail.org'),
  ('tempail.com'),
  ('tempmail.com'),
  ('tempmail.dev'),
  ('tempmail.net'),
  ('tempmailo.com'),
  ('tempr.email'),
  ('throwawaymail.com'),
  ('tmpmail.net'),
  ('tmpmail.org'),
  ('trashmail.com'),
  ('trashmail.de'),
  ('trashmail.net'),
  ('yopmail.com'),
  ('yopmail.fr'),
  ('yopmail.net')
on conflict do nothing;

create or replace function public.is_disposable_email(p_email text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.disposable_email_domains d
     where lower(split_part(coalesce(p_email, ''), '@', 2)) = d.domain
        or lower(split_part(coalesce(p_email, ''), '@', 2)) like '%.' || d.domain
  );
$$;
revoke all on function public.is_disposable_email(text) from public, anon, authenticated;

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
  em text;
  confirmed timestamptz;
begin
  if new.referred_by is null or new.referral_rewarded_at is not null or new.referred_by = new.id then
    return new;
  end if;
  -- E-posta doğrulanmadan ödül yok: karar doğrulama anına (auth.users tetikleyicisi) bırakılır
  select u.email, u.email_confirmed_at into em, confirmed from auth.users u where u.id = new.id;
  if confirmed is null then
    return new;
  end if;
  if new.signup_device is null then
    return new;
  end if;
  select value into cfg from public.app_settings where key = 'referral';
  if cfg is not null and coalesce((cfg->>'enabled')::boolean, true) = false then
    return new;
  end if;
  -- Tek kullanımlık e-posta: ödül verilmez
  if public.is_disposable_email(coalesce(em, new.email)) then
    insert into public.notifications (user_id, kind, data) values (new.referred_by, 'referral_disposable_email', '{}'::jsonb);
    new.referral_rewarded_at := now();
    return new;
  end if;
  if exists (select 1 from public.user_devices d where d.user_id = new.referred_by and d.device = new.signup_device) then
    insert into public.notifications (user_id, kind, data) values (new.referred_by, 'referral_same_device', '{}'::jsonb);
    new.referral_rewarded_at := now();
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

-- E-posta doğrulandığında bekleyen davet ödülü değerlendirilir
create or replace function public.referral_on_email_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.profiles set referred_by = referred_by
     where id = new.id and referred_by is not null and referral_rewarded_at is null;
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed after update of email_confirmed_at on auth.users
  for each row execute function public.referral_on_email_confirmed();

select count(*) as gecici_eposta_alani from public.disposable_email_domains;

-- ---------- 20261124000030_free_pdf_no_priority ----------
-- Paket özellikleri (D106): Ücretsiz pakete PDF dışa aktarma eklendi; Premium’dan “Öncelikli destek” kaldırıldı;
-- Basic kartında PDF artık ayrıcalık olmadığından satır “Word dışa aktarma” oldu. Tekrar çalıştırmak güvenlidir.

update public.plans
   set limits = jsonb_set(limits, '{export_formats}', coalesce(limits->'export_formats', '["txt","md"]'::jsonb) || '["pdf"]'::jsonb),
       updated_at = now()
 where id = 'free' and not coalesce(limits->'export_formats', '[]'::jsonb) ? 'pdf';

update public.plans set features = array_replace(features, 'TXT / Markdown dışa aktarma', 'TXT / PDF / Markdown dışa aktarma'), updated_at = now()
 where id = 'free' and 'TXT / Markdown dışa aktarma' = any(features);
update public.plans set features = array_replace(features, 'Word / PDF dışa aktarma', 'Word dışa aktarma'), updated_at = now()
 where id = 'basic' and 'Word / PDF dışa aktarma' = any(features);
update public.plans set features = array_remove(features, 'Öncelikli destek'), updated_at = now()
 where 'Öncelikli destek' = any(features);

select id, limits->'export_formats' as disa_aktarma, features from public.plans order by sort_order;

-- ---------- 20261125000031_single_watch ----------
-- Tek Proje gözetimi ve yönetim kararları (D109). Tekrar çalıştırmak güvenlidir.
--  1) export_fingerprints: tam indirmelerin parmak izi (metnin kendisi saklanmaz; 64 sayılık MinHash imzası + kelime sayısı +
--     kapak bilgisi). Ardışık indirmeler karşılaştırılır: içerik değişimi ve yazar/üniversite/danışman değişimi uyarısı.
--  2) plan_purchases: paket tanımlanırken ödeyen kişinin adı, telefonu, tutar ve not (ödeme WhatsApp üzerinden alındığı için).
--  3) abuse_decisions: yönetici her kötüye kullanım uyarısı için karar verir (sorun yok / kullanıcıyı uyar / askıya al).
-- Tablolara yalnızca sunucu (service role) erişir; kullanıcılar göremez.

create table if not exists public.export_fingerprints (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null,
  words int not null default 0,
  sig int[] not null check (cardinality(sig) = 64),
  author text not null default '',
  university text not null default '',
  department text not null default '',
  advisor text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists export_fingerprints_idx on public.export_fingerprints (user_id, project_id, created_at desc);
alter table public.export_fingerprints enable row level security;

create table if not exists public.plan_purchases (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null,
  payer_name text not null default '' check (char_length(payer_name) <= 200),
  payer_phone text not null default '' check (char_length(payer_phone) <= 40),
  amount_try numeric check (amount_try is null or amount_try >= 0),
  note text not null default '' check (char_length(note) <= 1000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists plan_purchases_user_idx on public.plan_purchases (user_id, created_at desc);
alter table public.plan_purchases enable row level security;

create table if not exists public.abuse_decisions (
  alert_id bigint primary key references public.activity_log(id) on delete cascade,
  decision text not null check (decision in ('ok', 'warn', 'suspend')),
  note text not null default '' check (char_length(note) <= 2000),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz not null default now()
);
alter table public.abuse_decisions enable row level security;

select
  to_regclass('public.export_fingerprints') is not null as parmak_izi,
  to_regclass('public.plan_purchases') is not null as satin_alma,
  to_regclass('public.abuse_decisions') is not null as kararlar;

-- ---------- 20261126000032_coauthors_autocomplete.sql ----------
-- D113 + D115: Satır içi otomatik tamamlama kullanım türü ve ortak yazım (ortak yazarlar).
-- Tekrar çalıştırmak güvenlidir.

-- 1) Otomatik tamamlama ayrı kullanım türüdür: aylık yapay zekâ istek/token hakkından düşmez, maliyet sınırına dahildir.
alter type public.usage_kind add value if not exists 'autocomplete';

-- 2) Ortak yazarlar: çalışma sahibinin davet ettiği kişiler (editor = yazabilir, commenter = okur ve yorum yazar).
--    Çalışmanın içeriği (bölümler, kaynaklar, hafıza, sürümler) sahibinin kaydı olarak kalır; ortak yazarın erişimini
--    sunucu üyelik kontrolüyle verir. Ortak yazarın yapay zekâ kullanımı kendi paketinden düşer.
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('editor', 'commenter')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index if not exists project_members_user_idx on public.project_members (user_id);
alter table public.project_members enable row level security;
drop policy if exists project_members_read on public.project_members;
create policy project_members_read on public.project_members for select
  using (user_id = auth.uid() or exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

create table if not exists public.project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 320),
  role text not null check (role in ('editor', 'commenter')),
  token text not null unique check (char_length(token) >= 32),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null
);
create index if not exists project_invites_project_idx on public.project_invites (project_id);
alter table public.project_invites enable row level security;
drop policy if exists project_invites_owner_read on public.project_invites;
create policy project_invites_owner_read on public.project_invites for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));

-- Kim hangi bölümde (çalışma alanında “Ayşe bu bölümde” göstergesi). Yalnızca sunucu yazar ve okur.
create table if not exists public.project_presence (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stage_id uuid references public.project_stages(id) on delete set null,
  seen_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
alter table public.project_presence enable row level security;

-- Bölümü en son kim kaydetti (çakışma uyarısı), sürümü ve yorumu kim oluşturdu
alter table public.project_stages add column if not exists last_editor uuid references public.profiles(id) on delete set null;
alter table public.stage_revisions add column if not exists actor_id uuid references public.profiles(id) on delete set null;
alter table public.stage_comments add column if not exists actor_id uuid references public.profiles(id) on delete set null;

-- 3) Sahiplik denetimi: alt kayıtlar çalışma sahibine aittir. Tek istisna: ortak yazarın kendi asistan sohbeti
--    (ai_conversations) kendi adına tutulur; sohbetler kişiseldir, sahibi göremez.
create or replace function public.assert_project_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.project_id is not null
     and not exists (select 1 from public.projects p where p.id = new.project_id and p.user_id = new.user_id)
     and not (tg_table_name = 'ai_conversations'
              and exists (select 1 from public.project_members m where m.project_id = new.project_id and m.user_id = new.user_id))
  then
    raise exception 'Proje bu kullanıcıya ait değil';
  end if;
  return new;
end $$;

-- 4) Paket kartları: Pro, Premium ve Tek Proje’de ortak yazar daveti
update public.plans set features = array_append(features, 'Ortak yazarlarla birlikte yazım'), updated_at = now()
 where id in ('pro', 'premium', 'single') and not ('Ortak yazarlarla birlikte yazım' = any(features));

-- Ücretsiz paket kartı (tüm paketlerde açık yeni özellikler): çeviri/dil denetimi ve kaynağa sor
update public.plans
   set features = array_cat(features[1:array_position(features, '10 atıf stili ve otomatik kaynakça')],
                  array['Atıfları koruyan akademik İngilizce çeviri ve dil denetimi', 'Kaynağa sor: makaleyle sayfa numaralı sohbet'])
                  || features[array_position(features, '10 atıf stili ve otomatik kaynakça') + 1:],
       updated_at = now()
 where id = 'free' and '10 atıf stili ve otomatik kaynakça' = any(features)
   and not ('Kaynağa sor: makaleyle sayfa numaralı sohbet' = any(features));
update public.plans set features = features || array['Atıfları koruyan akademik İngilizce çeviri ve dil denetimi', 'Kaynağa sor: makaleyle sayfa numaralı sohbet'], updated_at = now()
 where id = 'free' and not ('Kaynağa sor: makaleyle sayfa numaralı sohbet' = any(features));

select id, features from public.plans order by sort_order;

-- ---------- 20261127000033_competitive_upgrade.sql ----------
-- D118–D125: Rakip analizi sonrası iyileştirmeler. Tekrar çalıştırmak güvenlidir.

-- 1) Paket kartı tutarlılığı (D118): eski sayısal tarama ifadeleri kalmışsa adil kullanım ifadesine çevrilir;
--    Tek Proje’de “sınırsız” ifadeleri adil kullanım ve tek çalışma koşuluyla netleştirilir.
update public.plans
   set features = array_replace(array_replace(features, 'Aylık 2.000 kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'),
                                'Aylık 8.000 kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'),
       updated_at = now()
 where features && array['Aylık 2.000 kaynak taraması', 'Aylık 8.000 kaynak taraması'];

update public.plans
   set features = array_replace(array_replace(features,
                    'Sınırsız yapay zekâ kullanımı ve sınırsız sayfa', 'Sınırsız yapay zekâ kullanımı ve sayfa (yalnızca bu çalışmada, adil kullanım)'),
                    'Sınırsız kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'),
       description = 'Tek bir çalışma için tek ödeme: süresiz erişim, adil kullanımla sınırsız yapay zekâ.',
       updated_at = now()
 where id = 'single';

-- 2) Kaynak destekli iddia denetimi (D119): bölüm başına denetim sonuçları. Değişmeyen cümle + kaynak çifti bir sonraki
--    denetimde yeniden yapay zekâya gönderilmez. Kayıt çalışma sahibinindir; ortak yazarlar sunucu üzerinden görür.
create table if not exists public.claim_audits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage_id uuid not null references public.project_stages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  scope text not null default 'stage',
  summary jsonb not null default '{}'::jsonb,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists claim_audits_stage_idx on public.claim_audits (stage_id, created_at desc);
alter table public.claim_audits enable row level security;
drop policy if exists claim_audits_owner on public.claim_audits;
create policy claim_audits_owner on public.claim_audits for select using (user_id = auth.uid());
drop trigger if exists claim_audits_owner_guard on public.claim_audits;
create trigger claim_audits_owner_guard before insert or update on public.claim_audits for each row execute function public.assert_project_owner();

-- 3) Sistematik derleme / PRISMA 2020 (D122): taranan kayıtlar ve eleme kararları. Protokol projects.context.review’da.
create table if not exists public.review_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null check (char_length(key) <= 600),
  origin text not null default 'manual' check (char_length(origin) between 1 and 60),
  stage text not null default 'identified' check (stage in ('identified','duplicate','excluded_screening','sought','not_retrieved','excluded_eligibility','included')),
  reason text check (char_length(reason) <= 300),
  record jsonb not null,
  ai jsonb,
  source_id uuid references public.sources(id) on delete set null,
  decided_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists review_records_project_idx on public.review_records (project_id, stage);
alter table public.review_records enable row level security;
drop policy if exists review_records_owner on public.review_records;
create policy review_records_owner on public.review_records for select using (user_id = auth.uid());
drop trigger if exists review_records_owner_guard on public.review_records;
create trigger review_records_owner_guard before insert or update on public.review_records for each row execute function public.assert_project_owner();

-- 4) Gözlemlenebilirlik (D125): yapay zekâ çağrılarının süresi, hata ve token bilgisi (metin içermez). Yalnızca sunucu yazar/okur.
create table if not exists public.ai_calls (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  model text not null check (char_length(model) <= 120),
  ms integer not null,
  ttft_ms integer,
  ok boolean not null,
  error text check (char_length(error) <= 120),
  stop_reason text check (char_length(stop_reason) <= 40),
  input_tokens integer not null default 0,
  output_tokens integer not null default 0
);
create index if not exists ai_calls_created_idx on public.ai_calls (created_at desc);
alter table public.ai_calls enable row level security;

-- 5) Kurumsal yönetim (D125): kurum denetim kaydı (katılma, ayrılma, çıkarma, rol değişikliği). Yalnızca sunucu yazar;
--    kurum yöneticisi kendi kurumunun kaydını sunucu üzerinden görür.
create table if not exists public.org_audit_log (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  target_user uuid references public.profiles(id) on delete set null,
  action text not null check (char_length(action) <= 40),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists org_audit_log_org_idx on public.org_audit_log (org_id, created_at desc);
alter table public.org_audit_log enable row level security;

-- ---------- 20261128000034_plan_features_assurance ----------
-- D126: Paket kartlarında yeni özellikler görünsün. Tekrar çalıştırmak güvenlidir (eklenmişse yeniden eklemez).
-- Ücretsiz: iddia denetimi ve teslim öncesi kontrol listesi (“Başlık önerisi ve bölüm kontrolü” satırından sonra).
update public.plans
   set features = case
         when array_position(features, 'Başlık önerisi ve bölüm kontrolü') is null
           then features || array['İddia denetimi ve teslim öncesi kontrol listesi']
         else features[1:array_position(features, 'Başlık önerisi ve bölüm kontrolü')]
              || array['İddia denetimi ve teslim öncesi kontrol listesi']
              || features[array_position(features, 'Başlık önerisi ve bölüm kontrolü') + 1:]
       end,
       updated_at = now()
 where id = 'free' and not ('İddia denetimi ve teslim öncesi kontrol listesi' = any(features));

-- Basic: PRISMA ve literatür haritası (“Yapay zekâ destekli kalite raporu” satırından sonra).
update public.plans
   set features = case
         when array_position(features, 'Yapay zekâ destekli kalite raporu') is null
           then features || array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi']
         else features[1:array_position(features, 'Yapay zekâ destekli kalite raporu')]
              || array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi']
              || features[array_position(features, 'Yapay zekâ destekli kalite raporu') + 1:]
       end,
       updated_at = now()
 where id = 'basic' and not ('PRISMA 2020 sistematik derleme' = any(features));

-- ---------- 20261129000035_prisma_litmap_pro ----------
-- D128: PRISMA 2020 sistematik derleme ve literatür haritası Pro ve üstü paketlerde. Tekrar çalıştırmak güvenlidir.
-- Basic kartından çıkarılır (migration 34 çalıştırıldıysa eklenmişti).
update public.plans
   set features = array_remove(array_remove(features, 'PRISMA 2020 sistematik derleme'), 'Literatür haritası ve eksik kaynak önerisi'),
       updated_at = now()
 where id = 'basic' and features && array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi'];

-- Pro kartına “Literatür matrisi” satırının hemen arkasına eklenir (Premium ve Tek Proje “Pro paketteki her şey” / “Tüm özellikler” ile kapsar).
update public.plans
   set features = case
         when array_position(features, 'Literatür matrisi') is null
           then features || array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi']
         else features[1:array_position(features, 'Literatür matrisi')]
              || array['PRISMA 2020 sistematik derleme', 'Literatür haritası ve eksik kaynak önerisi']
              || features[array_position(features, 'Literatür matrisi') + 1:]
       end,
       updated_at = now()
 where id = 'pro' and not ('PRISMA 2020 sistematik derleme' = any(features));

-- ---------- 20261130000036_review_pdf_upgrade ----------
-- D132–D134: Gelişmiş PDF okuma ve sistematik derleme geliştirmeleri. Tekrar çalıştırmak güvenlidir.

-- 1) PDF parçalarında bölüm bilgisi (Özet, Yöntem, Bulgular…): kanıt ararken ilgili bölüm öne alınır.
alter table public.source_chunks add column if not exists section text check (section is null or char_length(section) <= 30);

-- 2) Sistematik derleme: bağımsız oylar (çift değerlendirici), veri çıkarma formu, kalite (yanlılık riski) değerlendirmesi.
alter table public.review_records add column if not exists votes jsonb not null default '{}'::jsonb;
alter table public.review_records add column if not exists extraction jsonb;
alter table public.review_records add column if not exists appraisal jsonb;

-- ---------- 20261201000037_realtime_collab ----------
-- 37: Gerçek zamanlı ortak yazım (D140)
-- Supabase Realtime’ın özel (private) yayın kanalı “project:<çalışma kimliği>” yalnızca çalışmanın sahibine ve
-- ortak yazarlarına açılır. Kanal üzerinden “kim burada / hangi bölümde / yazıyor mu” bilgisi ve bölüm içeriğinin
-- anlık kopyası iletilir; kalıcı kayıt yine normal kayıt ucuyla yapılır. Yorumcular dinleyebilir, yazamaz.

create or replace function public.collab_project_access(p_topic text, p_write boolean)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_topic is null or p_topic !~ '^project:[0-9a-fA-F-]{36}$' then false
    else exists (
      select 1 from public.projects p
      where p.id = split_part(p_topic, ':', 2)::uuid
        and (
          p.user_id = auth.uid()
          or exists (
            select 1 from public.project_members m
            where m.project_id = p.id and m.user_id = auth.uid()
              and (not p_write or m.role = 'editor')
          )
        )
    )
  end
$$;
revoke all on function public.collab_project_access(text, boolean) from public, anon;
grant execute on function public.collab_project_access(text, boolean) to authenticated;

-- Realtime şeması yalnızca Supabase’de vardır (yerel testlerde sahte şema kurulur)
do $$
begin
  if to_regclass('realtime.messages') is not null then
    execute 'drop policy if exists academiana_collab_read on realtime.messages';
    execute 'create policy academiana_collab_read on realtime.messages for select to authenticated using (public.collab_project_access(realtime.topic(), false))';
    execute 'drop policy if exists academiana_collab_write on realtime.messages';
    execute 'create policy academiana_collab_write on realtime.messages for insert to authenticated with check (public.collab_project_access(realtime.topic(), true))';
  end if;
end $$;

-- ---------- 20261202000038_discount_codes_pages ----------
-- D145: İndirim kodları ve sayfa hakkı
-- 1) Yöneticinin oluşturduğu indirim kodları: kayıtta kodu girenin hesabına bağlanır, ücretli paket fiyatı indirimli gösterilir
--    (ödeme WhatsApp üzerinden; yönetici paket atarken kullanıcının kodunu ve indirimli fiyatı görür).
-- 2) Paket kartlarındaki sayfa sayısı gerçek sınırdır: yapay zekânın yazdığı taslak kelimeleri sayılır (1 sayfa = 344 kelime,
--    Türk tez biçimi; D95). İstek sınırı sayfadan önce engellemesin diye adil kullanım düzeyine çekilir; maliyet tavanı korunur.
-- 3) Davet ödülü: davet eden, Ücretsiz paketin aylık hakları kadar (istek, tarama ve sayfa) — daha fazla değil.

-- ---------- 1) İndirim kodları ----------
create table if not exists public.discount_codes (
  code text primary key check (code ~ '^[A-Z0-9_-]{3,32}$'),
  kind text not null check (kind in ('percent', 'amount_try')),
  value numeric(10,2) not null check (value > 0),
  plans text[] not null default '{}',
  active boolean not null default true,
  max_uses int check (max_uses is null or max_uses > 0),
  uses int not null default 0,
  expires_at timestamptz,
  note text not null default '',
  created_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 100)
);
-- Yalnızca sunucu (service role) erişir: politika yok, RLS açık → kullanıcılar kodları okuyamaz
alter table public.discount_codes enable row level security;

alter table public.profiles add column if not exists discount_code text references public.discount_codes(code) on update cascade on delete set null;

-- Kodu kullanıcıya bağlar (yalnızca bir kez; etkin, süresi dolmamış, kullanım sınırı aşılmamışsa) ve kullanım sayısını artırır
create or replace function public.claim_discount_code(p_user uuid, p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if p_code is null or btrim(p_code) = '' then return null; end if;
  if exists (select 1 from public.profiles where id = p_user and discount_code is not null) then return null; end if;
  update public.discount_codes set uses = uses + 1
   where code = upper(btrim(p_code)) and active and (expires_at is null or expires_at > now()) and (max_uses is null or uses < max_uses)
   returning code into c;
  if c is not null then
    update public.profiles set discount_code = c where id = p_user and discount_code is null;
  end if;
  return c;
end $$;
revoke all on function public.claim_discount_code(uuid, text) from public, anon, authenticated;

-- Yeni kullanıcı: davet kodu, cihaz ve (varsa) indirim kodu
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare ref_id uuid; did text;
begin
  select p.id into ref_id from public.profiles p
   where p.referral_code = upper(nullif(trim(new.raw_user_meta_data->>'ref'), '')) limit 1;
  did := lower(nullif(trim(new.raw_user_meta_data->>'did'), ''));
  if did is not null and did !~ '^[0-9a-f]{64}$' then did := null; end if;
  insert into public.profiles (id, email, full_name, referred_by, signup_device)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), ref_id, did);
  if did is not null then
    insert into public.user_devices (user_id, device) values (new.id, did) on conflict do nothing;
  end if;
  perform public.claim_discount_code(new.id, nullif(trim(new.raw_user_meta_data->>'discount'), ''));
  return new;
end $$;

-- Kullanıcı kendi indirim kodunu değiştiremez
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
     or new.work_locked is distinct from old.work_locked
     or new.single_project_id is distinct from old.single_project_id
     or new.single_started_at is distinct from old.single_started_at
     or new.signup_device is distinct from old.signup_device
     or new.discount_code is distinct from old.discount_code then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

-- ---------- 2) Sayfa hakkı ----------
-- Bu ay yapay zekânın yazdığı taslak kelimeleri (usage_events.meta.words)
create or replace function public.usage_words(p_user uuid, p_since timestamptz)
returns bigint language sql stable security definer set search_path = public as $$
  select coalesce(sum(nullif(e.meta->>'words', '')::bigint), 0)
  from public.usage_events e
  where e.user_id = p_user and e.kind = 'ai_request' and e.created_at >= p_since and e.meta ? 'words'
$$;
revoke all on function public.usage_words(uuid, timestamptz) from public, anon, authenticated;

-- Kredi türlerine sayfa eklenir (davet ödülü)
alter table public.usage_credits drop constraint if exists usage_credits_kind_check;
alter table public.usage_credits add constraint usage_credits_kind_check check (kind in ('ai_requests', 'source_searches', 'pages'));

-- İstek sınırı adil kullanım düzeyine (maliyet tavanı ayrıca korur): sayfa hakkı dolmadan istek bitmesin
update public.plans set limits = limits || '{"ai_requests_month": 50}'::jsonb, updated_at = now() where id = 'basic';
update public.plans set limits = limits || '{"ai_requests_month": 90}'::jsonb, updated_at = now() where id = 'pro';
update public.plans set limits = limits || '{"ai_requests_month": 150}'::jsonb, updated_at = now() where id = 'premium';

-- Kartlardaki sayfa satırı artık kesin sınırdır (“yaklaşık” kalkar)
update public.plans set features = array_replace(features, 'Yapay zekâ ile yaklaşık 5 sayfa deneme taslağı', 'Yapay zekâ ile 5 sayfa deneme taslağı'), updated_at = now() where id = 'free';
update public.plans set features = array_replace(features, 'Ayda yaklaşık 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)', 'Ayda 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)'), updated_at = now() where id = 'basic';
update public.plans set features = array_replace(features, 'Ayda yaklaşık 50 sayfa yapay zekâ destekli akademik metin (ör. 2 makale; yüksek lisans tezi 1–2 ayda)', 'Ayda 50 sayfa yapay zekâ destekli akademik metin (ör. 2 makale; yüksek lisans tezi 1–2 ayda)'), updated_at = now() where id = 'pro';
update public.plans set features = array_replace(features, 'Ayda yaklaşık 85 sayfa yapay zekâ destekli akademik metin (yüksek lisans tezi ayda bir; doktora tezi yaklaşık 2 ayda)', 'Ayda 85 sayfa yapay zekâ destekli akademik metin (yüksek lisans tezi ayda bir; doktora tezi yaklaşık 2 ayda)'), updated_at = now() where id = 'premium';

-- ---------- 3) Davet ödülü: Ücretsiz paketin aylık hakları (istek + tarama + sayfa) ----------
create or replace function public.grant_referral_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cfg jsonb;
  lim jsonb;
  ai int;
  ss int;
  pg int;
  days int;
  cap int;
  cnt int;
  month_start timestamptz;
  em text;
  confirmed timestamptz;
begin
  if new.referred_by is null or new.referral_rewarded_at is not null or new.referred_by = new.id then
    return new;
  end if;
  select u.email, u.email_confirmed_at into em, confirmed from auth.users u where u.id = new.id;
  if confirmed is null then
    return new;
  end if;
  if new.signup_device is null then
    return new;
  end if;
  select value into cfg from public.app_settings where key = 'referral';
  if cfg is not null and coalesce((cfg->>'enabled')::boolean, true) = false then
    return new;
  end if;
  if public.is_disposable_email(coalesce(em, new.email)) then
    insert into public.notifications (user_id, kind, data) values (new.referred_by, 'referral_disposable_email', '{}'::jsonb);
    new.referral_rewarded_at := now();
    return new;
  end if;
  if exists (select 1 from public.user_devices d where d.user_id = new.referred_by and d.device = new.signup_device) then
    insert into public.notifications (user_id, kind, data) values (new.referred_by, 'referral_same_device', '{}'::jsonb);
    new.referral_rewarded_at := now();
    return new;
  end if;
  select limits into lim from public.plans where id = 'free';
  ai := coalesce(nullif(lim->>'ai_requests_month', '')::int, 10);
  ss := coalesce(nullif(lim->>'source_searches_month', '')::int, 7);
  pg := coalesce(nullif(lim->>'pages_month', '')::int, 5);
  days := coalesce(nullif(cfg->>'valid_days', '')::int, 60);
  cap := coalesce(nullif(cfg->>'monthly_cap', '')::int, 20);
  month_start := date_trunc('month', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul';
  select count(*) into cnt from public.usage_credits
   where user_id = new.referred_by and reason = 'referral_inviter' and kind = 'ai_requests' and created_at >= month_start;
  if cnt < cap then
    insert into public.usage_credits (user_id, kind, amount, reason, expires_at) values
      (new.referred_by, 'ai_requests', ai, 'referral_inviter', now() + make_interval(days => days)),
      (new.referred_by, 'source_searches', ss, 'referral_inviter', now() + make_interval(days => days)),
      (new.referred_by, 'pages', pg, 'referral_inviter', now() + make_interval(days => days));
    insert into public.notifications (user_id, kind, data)
      values (new.referred_by, 'referral_reward', jsonb_build_object('ai', ai, 'ss', ss, 'pg', pg, 'days', days));
  else
    insert into public.notifications (user_id, kind, data)
      values (new.referred_by, 'referral_cap', jsonb_build_object('cap', cap));
  end if;
  new.referral_rewarded_at := now();
  return new;
end $$;

select id, price_monthly, limits->>'pages_month' as sayfa_ay, limits->>'ai_requests_month' as istek_ay from public.plans order by sort_order;

-- ---------- 20261203000039_legal_acceptances.sql ----------
-- =====================================================================
-- D154: Hukuki belge kabul kayıtları
-- Kullanıcının hangi hukuki belgenin hangi sürümünü, ne zaman ve hangi yolla
-- (e-posta kaydı, Google, Apple, onay sayfası, satın alma öncesi) kabul ettiğini
-- veya hangi bilgilendirmenin kendisine gösterildiğini saklar.
--   kind = 'accept' : sözleşme kabulü (ör. Kullanım Koşulları)
--   kind = 'notice' : bilgilendirme gösterildi / okundu (ör. KVKK Aydınlatma Metni) — açık rıza DEĞİLDİR
-- Kayıtları yalnızca sunucu (service role) ve kayıt tetikleyicisi yazar; kullanıcı yalnızca kendi kayıtlarını,
-- yönetici tümünü okur. Kayıtlar sonradan değiştirilemez (UPDATE her rol için engellenir).
-- Hesap silindiğinde kayıtlar da silinir (on delete cascade).
-- =====================================================================

create table if not exists public.legal_acceptances (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  doc text not null check (doc in ('kvkk', 'terms', 'fair_use', 'cookies', 'integrity', 'distance', 'gdpr')),
  version text not null check (version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  kind text not null default 'accept' check (kind in ('accept', 'notice')),
  source text not null check (source in ('email', 'google', 'apple', 'consent_page', 'purchase')),
  context jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object' and pg_column_size(context) < 2000),
  accepted_at timestamptz not null default now()
);

create index if not exists legal_acceptances_user_idx on public.legal_acceptances (user_id, doc, accepted_at desc);

alter table public.legal_acceptances enable row level security;

drop policy if exists legal_acceptances_select on public.legal_acceptances;
create policy legal_acceptances_select on public.legal_acceptances for select
  using (user_id = auth.uid() or public.is_admin());
-- Bilerek INSERT/UPDATE/DELETE politikası yok: istemci doğrudan yazamaz, sürüm ve zamanı sunucu belirler.

-- Değiştirilemezlik: kabul kaydı hiçbir rol tarafından güncellenemez
create or replace function public.legal_acceptances_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'Hukuki kabul kayıtları değiştirilemez';
end $$;

drop trigger if exists legal_acceptances_no_update on public.legal_acceptances;
create trigger legal_acceptances_no_update before update on public.legal_acceptances
  for each row execute function public.legal_acceptances_immutable();

-- E-posta ile kayıt: kayıt formundaki kabul, kullanıcı meta verisinde { "legal": { "terms": "2026-11-13", "kvkk": "2026-11-13" } }
-- olarak gelir; profil oluşturulduktan sonra (tetikleyiciler ada göre sırayla çalışır: on_auth_user_created → on_auth_user_legal)
-- kayda dönüştürülür. Google/Apple girişinde bu alan olmadığından kayıt oluşmaz; kabul ilk girişte onay sayfasında alınır.
create or replace function public.record_signup_legal()
returns trigger language plpgsql security definer set search_path = public as $$
declare k text; v text;
begin
  if jsonb_typeof(new.raw_user_meta_data->'legal') <> 'object' then return new; end if;
  for k, v in select key, value from jsonb_each_text(new.raw_user_meta_data->'legal') loop
    if k in ('terms', 'kvkk') and v ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      insert into public.legal_acceptances (user_id, doc, version, kind, source)
      values (new.id, k, v, case when k = 'terms' then 'accept' else 'notice' end, 'email');
    end if;
  end loop;
  return new;
end $$;

drop trigger if exists on_auth_user_legal on auth.users;
create trigger on_auth_user_legal after insert on auth.users
  for each row execute function public.record_signup_legal();

-- ---------- 20261204000040_yearly_billing_single_month.sql ----------
-- =====================================================================
-- D157: Aylık / yıllık ödeme ve yeni Tek Proje
-- 1) Yıllık ödeme: profilde ödeme dönemi (plan_period) ve paket başlangıcı (plan_started_at).
--    Yıllık pakette aylık hakların 12 katı paket başında tanımlanır ve 1 yıl içinde kullanılır (sunucu hesaplar).
-- 2) Tek Proje → “Sınırsız Kullanım” (D158): en fazla 5 proje, geri kalan her şey sınırsız; aylık (1 ay) veya yıllık.
--    Eski koşullarla (süresiz, tek çalışma) atanmış Tek Proje paketleri bitiş tarihi olmadığından tanınır ve
--    eski kurallarıyla aynen devam eder (geriye dönük değişiklik yok).
-- Mevcut veri silinmez.
-- =====================================================================

alter table public.profiles add column if not exists plan_period text not null default 'monthly';
alter table public.profiles drop constraint if exists profiles_plan_period_check;
alter table public.profiles add constraint profiles_plan_period_check check (plan_period in ('monthly', 'yearly'));
alter table public.profiles add column if not exists plan_started_at timestamptz;

-- Kullanıcı ödeme dönemini ve başlangıcını kendisi değiştiremez
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
     or new.work_locked is distinct from old.work_locked
     or new.single_project_id is distinct from old.single_project_id
     or new.single_started_at is distinct from old.single_started_at
     or new.signup_device is distinct from old.signup_device
     or new.discount_code is distinct from old.discount_code
     or new.plan_period is distinct from old.plan_period
     or new.plan_started_at is distinct from old.plan_started_at then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;

-- Tek çalışma kuralları yalnızca eski (süresiz = bitiş tarihi yok) Tek Proje paketlerinde
create or replace function public.single_project_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare pr record;
begin
  if auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if tg_op = 'INSERT' then
    select plan_id, single_project_id, plan_expires_at into pr from public.profiles where id = new.user_id;
    if pr.plan_id = 'single' and pr.plan_expires_at is null and pr.single_project_id is not null then
      raise exception 'Tek Proje paketinde yalnızca bir çalışma yapılabilir.';
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    select plan_id, single_project_id, plan_expires_at into pr from public.profiles where id = old.user_id;
    if pr.plan_id = 'single' and pr.plan_expires_at is null and pr.single_project_id = old.id then
      raise exception 'Tek Proje paketine bağlı çalışma silinemez.';
    end if;
    return old;
  else
    select plan_id, single_project_id, plan_expires_at into pr from public.profiles where id = new.user_id;
    if pr.plan_id = 'single' and pr.plan_expires_at is null and pr.single_project_id = new.id and new.work_type is distinct from old.work_type then
      raise exception 'Tek Proje paketinde çalışma türü değiştirilemez.';
    end if;
    return new;
  end if;
end $$;

-- Çalışmayı pakete bağlama yalnızca eski Tek Proje’de
create or replace function public.single_project_bind()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set single_project_id = new.id
   where id = new.user_id and plan_id = 'single' and plan_expires_at is null and single_project_id is null;
  return new;
end $$;

create or replace function public.single_project_bind_on_plan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.plan_id = 'single' and old.plan_id is distinct from 'single' then
    new.single_started_at := now();
  end if;
  if new.plan_id = 'single' and new.plan_expires_at is null and new.single_project_id is null then
    select id into new.single_project_id from public.projects where user_id = new.id order by updated_at desc limit 1;
  end if;
  -- Yeni (süreli) Tek Proje çalışmaya bağlı değildir
  if new.plan_id = 'single' and new.plan_expires_at is not null then
    new.single_project_id := null;
  end if;
  return new;
end $$;

-- D158: “Sınırsız Kullanım” (eski adı Tek Proje; iç kimlik single): tek sınır en fazla 5 proje, geri kalan her şey sınırsız
-- (yapay zekâ, sayfa, tarama, depolama, maliyet tavanı yok; adil kullanım). Aylık (1 ay) veya yıllık (%20 indirimli) ödenir.
update public.plans set
  name = 'Sınırsız Kullanım',
  description = 'En fazla 5 proje dışında her şey sınırsız: yapay zekâ, sayfa yazımı, kaynak taraması, depolama ve tüm özellikler (adil kullanım).',
  price_yearly = round(price_monthly * 0.8) * 12,
  limits = '{"pages_month": null, "ai_requests_month": null, "tokens_month": null, "source_searches_month": null, "projects": 5, "storage_mb": null, "cost_usd_month": null, "export_formats": ["txt","md","docx","pdf"]}'::jsonb,
  features = array['Premium paketteki her şey', 'En fazla 5 proje', 'Sınırsız yapay zekâ kullanımı ve sayfa (adil kullanım)', 'Sınırsız kaynak taraması (adil kullanım)', 'Sınırsız depolama', 'Ortak yazarlarla birlikte yazım', 'Tüm özellikler sınırsız'],
  updated_at = now()
where id = 'single';

select id, name, price_monthly, price_yearly, limits->>'projects' as proje from public.plans where id = 'single';

-- ---------- 20261205000041_unlimited_project_name.sql ----------
-- D162: “Sınırsız Kullanım” paketinin adı “Sınırsız Proje” oldu (iç kimlik single; limitler ve fiyat değişmez)
update public.plans set name = 'Sınırsız Proje', updated_at = now() where id = 'single';

select id, name, price_monthly, limits->>'projects' as proje from public.plans where id = 'single';


-- ---------- 20261206000042_yearly_price_sync ----------
-- D168: Yıllık fiyat tutarlılığı
-- Fiyatlar sayfası yıllık toplamı (aylık fiyat × 0,8, yuvarlanır) × 12 olarak gösterir. Veritabanındaki price_yearly
-- eski kuralla (aylık × 10) kalmıştı (Basic 7.490 TL; ekranda 7.188 TL). Bu dosya mevcut fiyatları düzeltir ve bundan sonra
-- aylık fiyat değiştiğinde yıllık fiyatın kendiliğinden aynı kuralla hesaplanmasını sağlar (yönetim panelinden ayrıca girilemez).

create or replace function public.plans_sync_yearly_price()
returns trigger language plpgsql as $$
begin
  new.price_yearly := round(new.price_monthly * 0.8) * 12;
  return new;
end $$;

drop trigger if exists plans_sync_yearly_price on public.plans;
create trigger plans_sync_yearly_price before insert or update of price_monthly, price_yearly on public.plans
  for each row execute function public.plans_sync_yearly_price();

update public.plans set price_yearly = round(price_monthly * 0.8) * 12, updated_at = now();

select id, name, price_monthly, price_yearly from public.plans order by sort_order;


-- ---------- 20261207000043_dynamic_templates ----------
-- =====================================================================
-- D171: Dinamik akademik yol haritası — bölüm ayarları, kullanıcı şablonları, değişiklik geçmişi
-- 1) project_stages: zorunluluk (zorunlu/koşullu/isteğe bağlı), kapsam (kısa/orta/ayrıntılı), gizli, gerekçe,
--    kritiklik ve kullanıcı değiştirdi bilgisi. Var olan bölümler “zorunlu / orta / görünür” olarak kalır (içerik değişmez).
-- 2) user_templates: kullanıcının kaydettiği yapı (yalnızca sahibi görür ve değiştirir).
-- 3) template_change_logs: yapı değişikliklerinin geçmişi (proje sahibi okur; ortak yazarlara sunucu gösterir; yalnızca sunucu yazar).
-- Mevcut veri silinmez.
-- =====================================================================

alter table public.project_stages add column if not exists requirement text not null default 'required';
alter table public.project_stages drop constraint if exists project_stages_requirement_check;
alter table public.project_stages add constraint project_stages_requirement_check check (requirement in ('required', 'conditional', 'optional'));
alter table public.project_stages add column if not exists scope text not null default 'standard';
alter table public.project_stages drop constraint if exists project_stages_scope_check;
alter table public.project_stages add constraint project_stages_scope_check check (scope in ('brief', 'standard', 'detailed'));
alter table public.project_stages add column if not exists hidden boolean not null default false;
alter table public.project_stages add column if not exists why text not null default '';
alter table public.project_stages add column if not exists critical boolean not null default false;
alter table public.project_stages add column if not exists modified boolean not null default false;

create table if not exists public.user_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  work_type text not null,
  methodology text,
  template_version int not null default 1,
  sections jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array' and pg_column_size(sections) < 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_templates_user_idx on public.user_templates (user_id, updated_at desc);
alter table public.user_templates enable row level security;
drop policy if exists user_templates_own on public.user_templates;
create policy user_templates_own on public.user_templates for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.template_change_logs (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null check (char_length(action) <= 40),
  detail jsonb not null default '{}'::jsonb check (jsonb_typeof(detail) = 'object' and pg_column_size(detail) < 20000),
  created_at timestamptz not null default now()
);
create index if not exists template_change_logs_project_idx on public.template_change_logs (project_id, created_at desc);
alter table public.template_change_logs enable row level security;
drop policy if exists template_change_logs_read on public.template_change_logs;
create policy template_change_logs_read on public.template_change_logs for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()) or public.is_admin());
-- Bilerek INSERT/UPDATE/DELETE politikası yok: kayıtları yalnızca sunucu (service role) yazar.

select 'D171 tamam' as durum;
