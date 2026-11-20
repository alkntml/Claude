-- =====================================================================
-- D232: Yönetim → Faturalar (fatura kesilecekler listesi). Ticari fatura isteyen ödenmiş siparişler listelenir;
-- yönetici faturayı kesince siparişi “kesildi” olarak işaretler (invoiced_at). Tekrar çalıştırılabilir.
-- =====================================================================

alter table public.payment_orders add column if not exists invoiced_at timestamptz;
alter table public.payment_orders add column if not exists invoice_no text check (invoice_no is null or char_length(invoice_no) <= 60);
create index if not exists payment_orders_invoice_queue_idx on public.payment_orders (created_at desc) where invoice_type = 'commercial' and status = 'paid';

select 'D232 tamam' as durum;
