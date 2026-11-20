-- =====================================================================
-- D225: Kartla ödeme (PayTR iFrame API)
-- payment_orders: her ödeme denemesi bir sipariş. Sunucu (service role) yazar; kullanıcı yalnızca kendi
-- siparişlerini okur (ödeme sonucu ekranı). Kart bilgisi Academiana’ya hiç gelmez; PayTR’nin sayfasında girilir.
-- Paket, PayTR’nin imzalı bildirimi (Bildirim URL) gelince ve yalnızca bir kez tanımlanır (status pending → paid).
-- Mevcut veri silinmez; tekrar çalıştırılabilir.
-- =====================================================================

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  merchant_oid text not null unique check (merchant_oid ~ '^[A-Za-z0-9]{8,64}$'),
  provider text not null default 'paytr' check (provider in ('paytr')),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null check (char_length(plan_id) <= 40),
  period text not null check (period in ('monthly', 'yearly')),
  days int not null check (days between 1 and 3650),
  amount_try numeric(12, 2) not null check (amount_try > 0),
  list_price_try numeric(12, 2) check (list_price_try is null or list_price_try >= 0),
  discount_code text check (discount_code is null or char_length(discount_code) <= 32),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  payer_name text not null default '' check (char_length(payer_name) <= 200),
  payer_phone text not null default '' check (char_length(payer_phone) <= 40),
  payer_address text not null default '' check (char_length(payer_address) <= 400),
  iframe_token text check (iframe_token is null or char_length(iframe_token) <= 200),
  test_mode boolean not null default false,
  paid_amount_try numeric(12, 2),
  payment_type text check (payment_type is null or char_length(payment_type) <= 40),
  failed_reason text check (failed_reason is null or char_length(failed_reason) <= 500),
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payment_orders_user_idx on public.payment_orders (user_id, created_at desc);
create index if not exists payment_orders_status_idx on public.payment_orders (status, created_at desc);

alter table public.payment_orders enable row level security;
drop policy if exists payment_orders_select_own on public.payment_orders;
create policy payment_orders_select_own on public.payment_orders for select using (user_id = auth.uid() or public.is_admin());
-- Bilerek ekleme/güncelleme/silme politikası yok: siparişi yalnızca sunucu (service role) oluşturur ve günceller.

select 'D225 tamam' as durum;
