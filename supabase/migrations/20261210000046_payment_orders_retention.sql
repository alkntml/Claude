-- =====================================================================
-- D226: Kartla ödeme siparişleri
-- 1) Vergi ve ticaret mevzuatı gereği sipariş/ödeme kayıtları hesap silinse de saklanır: kullanıcı silinince
--    sipariş silinmez, user_id boşaltılır (ad, telefon, fatura adresi, tutar ve tarih kayıtta kalır).
-- 2) Satın alma anında alınan onaylar: hizmetin hemen başlaması talebi (dijital hizmet, cayma hakkı bilgisi) ve
--    gösterilen Mesafeli Sözleşmeler sürümü.
-- Mevcut veri silinmez; tekrar çalıştırılabilir.
-- =====================================================================

alter table public.payment_orders add column if not exists immediate_start_consent boolean not null default false;
alter table public.payment_orders add column if not exists distance_version text check (distance_version is null or char_length(distance_version) <= 20);
alter table public.payment_orders add column if not exists buyer_email text check (buyer_email is null or char_length(buyer_email) <= 320);

alter table public.payment_orders alter column user_id drop not null;
alter table public.payment_orders drop constraint if exists payment_orders_user_id_fkey;
alter table public.payment_orders add constraint payment_orders_user_id_fkey foreign key (user_id) references public.profiles(id) on delete set null;

select 'D226 tamam' as durum;
