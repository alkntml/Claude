-- =====================================================================
-- D190–D192:
-- 1) ISNAD 2 dipnotlu atıf stili (citation_style: isnad_note)
-- 2) Danışman rolü: ortak yazar üyelikleri ve davetlerinde 'advisor' (okur, yorum yazar, ilerlemeyi görür)
-- 3) Zotero / ORCID eşitlemesi: source_links (yalnızca sunucu okur ve yazar; Zotero anahtarı şifreli)
-- Mevcut veri silinmez; tekrar çalıştırılabilir.
-- =====================================================================

alter type public.citation_style add value if not exists 'isnad_note';

alter table public.project_members drop constraint if exists project_members_role_check;
alter table public.project_members add constraint project_members_role_check check (role in ('editor', 'commenter', 'advisor'));
alter table public.project_invites drop constraint if exists project_invites_role_check;
alter table public.project_invites add constraint project_invites_role_check check (role in ('editor', 'commenter', 'advisor'));

create table if not exists public.source_links (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('zotero', 'orcid')),
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object' and pg_column_size(config) < 4000),
  secret text check (secret is null or char_length(secret) < 1000),
  last_version bigint,
  last_synced_at timestamptz,
  last_result jsonb,
  created_at timestamptz not null default now(),
  primary key (project_id, provider)
);
create index if not exists source_links_user_idx on public.source_links (user_id);
alter table public.source_links enable row level security;
-- Bilerek hiçbir politika yok: bağlantıları (şifreli anahtar dahil) yalnızca sunucu (service role) okur ve yazar.

select 'D190–D192 tamam' as durum;
