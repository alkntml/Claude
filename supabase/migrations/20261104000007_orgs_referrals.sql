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
