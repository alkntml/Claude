-- =====================================================================
-- D171: Dinamik akademik yol haritası — bölüm ayarları, kullanıcı şablonları, değişiklik geçmişi
-- 1) project_stages: zorunluluk (zorunlu/koşullu/isteğe bağlı), kapsam (kısa/orta/ayrıntılı), gizli, gerekçe,
--    kritiklik ve kullanıcı değiştirdi bilgisi. Var olan bölümler “zorunlu / orta / görünür” olarak kalır (içerik değişmez).
-- 2) user_templates: kullanıcının kaydettiği yapı (yalnızca sahibi görür ve değiştirir).
-- 3) template_change_logs: yapı değişikliklerinin geçmişi (proje sahibi ve ortak yazarlar okur; sunucu yazar).
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
