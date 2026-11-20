-- =====================================================================
-- D228: 1 TL’lik ödeme deneme paketi (“deneme”). Herkese açık listelerde görünmez (is_active = false);
-- yalnızca yöneticiler ve PAYTR_TEST_EMAILS listesindekiler yükseltme penceresinde görür ve kartla satın alabilir.
-- Haklar Basic paketininkilerle aynıdır, süre 30 gündür. Tekrar çalıştırılabilir.
-- =====================================================================

insert into public.plans (id, name, description, price_monthly, price_yearly, currency, limits, features, sort_order, is_active)
select 'deneme', 'Deneme (1 TL)', 'Yalnızca kartla ödeme denemesi için; herkese açık listelerde görünmez.', 1, 12, 'TRY', limits,
  array['Kartla ödeme denemesi: Basic haklarıyla 30 gün'], 99, false
from public.plans where id = 'basic'
on conflict (id) do update set price_monthly = 1, is_active = false, updated_at = now();

select 'D228 tamam' as durum;
