-- =====================================================================
-- D230: 1 TL “Deneme (1 TL)” paketi her yerden kaldırılır (fiyatlar, ana sayfa, yükseltme penceresi): is_active = false.
-- Yalnızca yönetici, Yönetim → Sistem durumu → “Ödeme testi (1 TL)” kartından satın alabilir. Tekrar çalıştırılabilir.
-- =====================================================================

update public.plans set
  description = 'Yalnızca yönetici ödeme testi için; herkese açık listelerde görünmez.',
  features = array['Ödeme testi: Basic haklarıyla 30 gün'],
  sort_order = 99, is_active = false, updated_at = now()
where id = 'deneme';

update public.plans set sort_order = case id
  when 'free' then 0 when 'basic' then 1 when 'pro' then 2 when 'premium' then 3 when 'single' then 4 else sort_order end
where id in ('free','basic','pro','premium','single');

select 'D230 tamam' as durum;
