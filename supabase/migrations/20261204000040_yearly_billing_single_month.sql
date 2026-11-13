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
