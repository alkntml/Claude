-- =====================================================================
-- D233: 1 TL “Deneme (1 TL)” paketi ve ödeme testi kaldırıldı. Pakete bağlı hesaplar Ücretsiz’e alınır, paket silinir.
-- Sipariş kayıtları (payment_orders, plan_purchases) silinmez; plan kimliği kayıtta kalır. Tekrar çalıştırılabilir.
-- =====================================================================

update public.profiles set plan_id = 'free', plan_expires_at = null, plan_period = 'monthly' where plan_id = 'deneme';
delete from public.plans where id = 'deneme';

select 'D233 tamam' as durum;
