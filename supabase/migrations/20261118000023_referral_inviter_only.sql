-- Davet ödülü (D99): yalnızca davet edene verilir ve davet edilen kişi KAYDOLDUĞU anda tanımlanır (e-posta
-- doğrulaması beklenmez). Yeni kaydolan zaten Ücretsiz paketin haklarını alır. Ödül miktarı Ücretsiz paketin aylık
-- haklarıdır (D98); geçerlilik ve davet edenin aylık ödül sınırı yönetimdeki “referral” ayarından okunur.
-- Kayıtta (insert) ve sosyal girişte davet kodu sonradan bağlandığında (referred_by güncellemesi) çalışır; tek seferliktir.

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
  select value into cfg from public.app_settings where key = 'referral';
  if cfg is not null and coalesce((cfg->>'enabled')::boolean, true) = false then
    return new;
  end if;
  select limits into lim from public.plans where id = 'free';
  ai := coalesce(nullif(lim->>'ai_requests_month', '')::int, 10);
  ss := coalesce(nullif(lim->>'source_searches_month', '')::int, 7);
  days := coalesce(nullif(cfg->>'valid_days', '')::int, 60);
  cap := coalesce(nullif(cfg->>'monthly_cap', '')::int, 20);
  -- Ay başı Türkiye saatiyle (sayaçlarla aynı dönem)
  month_start := date_trunc('month', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul';
  select count(*) into cnt from public.usage_credits
   where user_id = new.referred_by and reason = 'referral_inviter' and kind = 'ai_requests' and created_at >= month_start;
  if cnt < cap then
    insert into public.usage_credits (user_id, kind, amount, reason, expires_at) values
      (new.referred_by, 'ai_requests', ai, 'referral_inviter', now() + make_interval(days => days)),
      (new.referred_by, 'source_searches', ss, 'referral_inviter', now() + make_interval(days => days));
  end if;
  new.referral_rewarded_at := now();
  return new;
end $$;

drop trigger if exists profiles_referral_reward on public.profiles;
create trigger profiles_referral_reward before insert or update of referred_by on public.profiles
  for each row execute function public.grant_referral_on_signup();

-- Bekleyen davetler (kaydolmuş ama e-postasını henüz doğrulamamış kişiler): davet edene şimdi verilir (aylık sınırla)
update public.profiles set referred_by = referred_by where referred_by is not null and referral_rewarded_at is null;

select count(*) as odul_bekleyen_kalmadi from public.profiles where referred_by is not null and referral_rewarded_at is null;
