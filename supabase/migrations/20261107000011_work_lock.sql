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
