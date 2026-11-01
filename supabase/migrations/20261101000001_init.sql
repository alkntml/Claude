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
