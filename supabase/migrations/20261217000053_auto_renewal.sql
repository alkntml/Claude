-- =====================================================================
-- D234: Otomatik yenileme. Abonelik iptal edilmedikçe dönem sonunda kayıtlı kartla yenilenir.
-- Kart bilgisi Academiana’da tutulmaz; yalnızca ödeme kuruluşunun (PayTR) verdiği kullanıcı/kart referans anahtarları ve
-- kartın görünen etiketi saklanır (payment_methods: yalnızca sunucu okur, RLS’de hiçbir politika yoktur).
-- Tekrar çalıştırılabilir.
-- =====================================================================

alter table public.profiles add column if not exists auto_renew boolean not null default false;
alter table public.profiles add column if not exists renewal_attempts int not null default 0;
alter table public.profiles add column if not exists renewal_last_attempt_at timestamptz;
alter table public.profiles add column if not exists renewal_notice_for timestamptz;
alter table public.profiles add column if not exists renewal_notice_at timestamptz;
alter table public.profiles add column if not exists renewal_notice_amount numeric(12, 2);

create table if not exists public.payment_methods (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  utoken text not null check (char_length(utoken) between 8 and 64),
  ctoken text check (ctoken is null or char_length(ctoken) <= 200),
  card_label text check (card_label is null or char_length(card_label) <= 80),
  user_ip text check (user_ip is null or char_length(user_ip) <= 45),
  payer jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payment_methods enable row level security;
-- Bilerek politika yok: yalnızca sunucu (service role) okur ve yazar.

alter table public.payment_orders add column if not exists renewal boolean not null default false;
alter table public.payment_orders add column if not exists auto_renew_consent boolean not null default false;

select 'D234 tamam' as durum;
