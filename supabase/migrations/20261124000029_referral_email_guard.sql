-- Davet ödülü açığı kapatıldı (D106):
--  1) Ödül, davet edilen kişi e-postasını DOĞRULADIĞINDA verilir (sahte/uydurma adreslerle ödül toplanamaz).
--     Doğrulama kayıttan sonra gelirse auth.users tetikleyicisi bekleyen ödülü o anda değerlendirir.
--  2) Tek kullanımlık (geçici) e-posta servisleriyle açılan hesaplar ödül kazandırmaz; davet edene bilgi verilir.
-- Aynı cihaz kuralı (D101) ve aylık sınır aynen geçerlidir. Tekrar çalıştırmak güvenlidir.

create table if not exists public.disposable_email_domains (domain text primary key);
alter table public.disposable_email_domains enable row level security;
-- Politika yok: yalnızca sunucu ve tetikleyiciler okur
insert into public.disposable_email_domains (domain) values
  ('10minutemail.com'),
  ('10minutemail.net'),
  ('20minutemail.com'),
  ('anonbox.net'),
  ('burnermail.io'),
  ('discard.email'),
  ('dispostable.com'),
  ('emailfake.com'),
  ('emailondeck.com'),
  ('fakeinbox.com'),
  ('fakemail.net'),
  ('getairmail.com'),
  ('getnada.com'),
  ('grr.la'),
  ('guerrillamail.biz'),
  ('guerrillamail.com'),
  ('guerrillamail.de'),
  ('guerrillamail.info'),
  ('guerrillamail.net'),
  ('guerrillamail.org'),
  ('guerrillamailblock.com'),
  ('inboxkitten.com'),
  ('jetable.org'),
  ('mail.tm'),
  ('mailcatch.com'),
  ('maildrop.cc'),
  ('mailinator.com'),
  ('mailinator.net'),
  ('mailnesia.com'),
  ('mintemail.com'),
  ('mohmal.com'),
  ('moakt.com'),
  ('mytemp.email'),
  ('nada.email'),
  ('sharklasers.com'),
  ('spam4.me'),
  ('spamgourmet.com'),
  ('temp-mail.io'),
  ('temp-mail.org'),
  ('tempail.com'),
  ('tempmail.com'),
  ('tempmail.dev'),
  ('tempmail.net'),
  ('tempmailo.com'),
  ('tempr.email'),
  ('throwawaymail.com'),
  ('tmpmail.net'),
  ('tmpmail.org'),
  ('trashmail.com'),
  ('trashmail.de'),
  ('trashmail.net'),
  ('yopmail.com'),
  ('yopmail.fr'),
  ('yopmail.net')
on conflict do nothing;

create or replace function public.is_disposable_email(p_email text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.disposable_email_domains d
     where lower(split_part(coalesce(p_email, ''), '@', 2)) = d.domain
        or lower(split_part(coalesce(p_email, ''), '@', 2)) like '%.' || d.domain
  );
$$;
revoke all on function public.is_disposable_email(text) from public, anon, authenticated;

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
  em text;
  confirmed timestamptz;
begin
  if new.referred_by is null or new.referral_rewarded_at is not null or new.referred_by = new.id then
    return new;
  end if;
  -- E-posta doğrulanmadan ödül yok: karar doğrulama anına (auth.users tetikleyicisi) bırakılır
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
  -- Tek kullanımlık e-posta: ödül verilmez
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

-- E-posta doğrulandığında bekleyen davet ödülü değerlendirilir
create or replace function public.referral_on_email_confirmed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.profiles set referred_by = referred_by
     where id = new.id and referred_by is not null and referral_rewarded_at is null;
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed after update of email_confirmed_at on auth.users
  for each row execute function public.referral_on_email_confirmed();

select count(*) as gecici_eposta_alani from public.disposable_email_domains;
