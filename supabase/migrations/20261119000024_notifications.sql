-- Bildirim kutusu (D100): kullanıcıya özel bildirimler (ilk tür: davet ödülü). Metin istemcide kullanıcının
-- diline göre `kind` + `data`’dan üretilir. Kullanıcı yalnızca kendi bildirimlerini görür ve okundu işaretler;
-- bildirimleri yalnızca sunucu ve veritabanı tetikleyicileri yazar.

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (char_length(kind) between 1 and 40),
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select using (user_id = auth.uid());
drop policy if exists notifications_mark_read on public.notifications;
create policy notifications_mark_read on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Kullanıcı yalnızca okundu bilgisini değiştirebilir
create or replace function public.protect_notification_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' then return new; end if;
  if new.user_id is distinct from old.user_id or new.kind is distinct from old.kind or new.data is distinct from old.data or new.created_at is distinct from old.created_at then
    raise exception 'Bu alanları değiştirme yetkiniz yok';
  end if;
  return new;
end $$;
drop trigger if exists notifications_protect on public.notifications;
create trigger notifications_protect before update on public.notifications for each row execute function public.protect_notification_columns();

-- Davet ödülü (D99) artık davet edene bildirim de bırakır (ödül verildi / aylık sınır doldu)
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

-- Daha önce (migration 23 ile) ödül kazananlara geriye dönük bildirim: son 60 gündeki davet ödülleri
insert into public.notifications (user_id, kind, data, created_at)
select c.user_id, 'referral_reward', jsonb_build_object('ai', c.amount, 'ss', coalesce(s.amount, 0), 'days', coalesce(greatest(1, round(extract(epoch from (c.expires_at - c.created_at)) / 86400)::int), 60)), c.created_at
from public.usage_credits c
left join public.usage_credits s on s.user_id = c.user_id and s.reason = 'referral_inviter' and s.kind = 'source_searches' and s.created_at = c.created_at
where c.reason = 'referral_inviter' and c.kind = 'ai_requests' and c.created_at > now() - interval '60 days'
  and not exists (select 1 from public.notifications n where n.user_id = c.user_id and n.kind = 'referral_reward' and n.created_at = c.created_at);

select count(*) as bildirim_sayisi from public.notifications;
