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
