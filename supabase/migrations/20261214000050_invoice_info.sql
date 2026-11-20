-- =====================================================================
-- D231: Fatura bilgisi — bireysel veya ticari. Ödeme alınırken alıcı fatura türünü seçer:
--   Bireysel: ad, soyad, telefon, e-posta.
--   Ticari: şirket unvanı, vergi numarası (VKN 10 / T.C. kimlik no 11 hane), vergi dairesi, açık adres, telefon, e-posta.
-- Bilgiler sipariş kaydında saklanır (vergi mevzuatı gereği hesap silinse de, D226). Mevcut siparişler “bireysel” sayılır.
-- Tekrar çalıştırılabilir.
-- =====================================================================

alter table public.payment_orders add column if not exists invoice_type text not null default 'individual';
alter table public.payment_orders drop constraint if exists payment_orders_invoice_type_check;
alter table public.payment_orders add constraint payment_orders_invoice_type_check check (invoice_type in ('individual', 'commercial'));
alter table public.payment_orders add column if not exists buyer_first_name text check (buyer_first_name is null or char_length(buyer_first_name) <= 40);
alter table public.payment_orders add column if not exists buyer_last_name text check (buyer_last_name is null or char_length(buyer_last_name) <= 40);
alter table public.payment_orders add column if not exists company_title text check (company_title is null or char_length(company_title) <= 150);
alter table public.payment_orders add column if not exists tax_number text check (tax_number is null or tax_number ~ '^[0-9]{10,11}$');
alter table public.payment_orders add column if not exists tax_office text check (tax_office is null or char_length(tax_office) <= 60);
-- Ad ve unvan için sütun sınırları geniştir (unvan 150 karakter)
alter table public.payment_orders drop constraint if exists payment_orders_payer_name_check;
alter table public.payment_orders add constraint payment_orders_payer_name_check check (char_length(payer_name) <= 200);

select 'D231 tamam' as durum;
