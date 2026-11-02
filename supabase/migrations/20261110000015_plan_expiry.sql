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
