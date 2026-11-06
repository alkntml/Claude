-- Davet ödülü kötüye kullanım önlemi (D101): davet koduyla açılan hesap, davet edenin daha önce kullandığı bir
-- cihazdan kaydolursa ödül verilmez. Cihaz kimliği tarayıcıda üretilen rastgele bir değerdir (kişisel bilgi içermez);
-- veritabanına yalnızca SHA-256 özeti (64 hex) yazılır. Kayıtta özet auth meta verisinden (“did”) gelir.

alter table public.profiles add column if not exists signup_device text check (signup_device is null or signup_device ~ '^[0-9a-f]{64}$');

create table if not exists public.user_devices (
  user_id uuid not null references public.profiles(id) on delete cascade,
  device text not null check (device ~ '^[0-9a-f]{64}$'),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (user_id, device)
);
create index if not exists user_devices_device_idx on public.user_devices (device);
alter table public.user_devices enable row level security;
-- Politika yok: yalnızca sunucu (service role) ve tetikleyiciler okur/yazar

-- Kayıt: davet kodu + cihaz özeti profile yazılır, cihaz kullanıcının cihazlarına eklenir
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
  return new;
end $$;

-- Davet ödülü: cihaz bilgisi yoksa karar ilk girişe bırakılır (sunucu cihazı okuyup aynı kuralla karar verir);
-- davet edenin cihazıyla aynıysa ödül verilmez ve davet edene bilgi verilir
create or replace function public.grant_referral_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cfg jsonb;
  lim jsonb;
  ai int;
  ss int;
  days int;
  cap int;
  cnt int;
  month_start timestamptz;
begin
  if new.referred_by is null or new.referral_rewarded_at is not null or new.referred_by = new.id then
    return new;
  end if;
  if new.signup_device is null then
    return new;
  end if;
  select value into cfg from public.app_settings where key = 'referral';
  if cfg is not null and coalesce((cfg->>'enabled')::boolean, true) = false then
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
  days := coalesce(nullif(cfg->>'valid_days', '')::int, 60);
  cap := coalesce(nullif(cfg->>'monthly_cap', '')::int, 20);
  month_start := date_trunc('month', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul';
  select count(*) into cnt from public.usage_credits
   where user_id = new.referred_by and reason = 'referral_inviter' and kind = 'ai_requests' and created_at >= month_start;
  if cnt < cap then
    insert into public.usage_credits (user_id, kind, amount, reason, expires_at) values
      (new.referred_by, 'ai_requests', ai, 'referral_inviter', now() + make_interval(days => days)),
      (new.referred_by, 'source_searches', ss, 'referral_inviter', now() + make_interval(days => days));
    insert into public.notifications (user_id, kind, data)
      values (new.referred_by, 'referral_reward', jsonb_build_object('ai', ai, 'ss', ss, 'days', days));
  else
    insert into public.notifications (user_id, kind, data)
      values (new.referred_by, 'referral_cap', jsonb_build_object('cap', cap));
  end if;
  new.referral_rewarded_at := now();
  return new;
end $$;

select count(*) as kayitli_cihaz from public.user_devices;
