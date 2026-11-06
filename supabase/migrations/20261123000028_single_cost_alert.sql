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
