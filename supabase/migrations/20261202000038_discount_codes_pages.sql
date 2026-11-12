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
