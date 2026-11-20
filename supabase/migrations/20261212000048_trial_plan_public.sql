-- =====================================================================
-- D229: 1 TL’lik “Deneme (1 TL)” paketi herkese açılır: fiyatlar sayfasında ve yükseltme penceresinde
-- normal paketlerin arasında (Ücretsiz ile Basic arasında) görünür. Haklar Basic ile aynı, süre 30 gün, yalnızca aylık.
-- Tekrar çalıştırılabilir.
-- =====================================================================

update public.plans set
  description = 'Kartla ödemeyi 1 TL ile deneyin: Basic paketin hakları, 30 gün.',
  features = array['Basic paketin hakları, 30 gün','Kartla 1 TL ile ödeme denemesi'],
  is_active = true, updated_at = now()
where id = 'deneme';

-- Sıralama: Ücretsiz, Deneme, Basic, Pro, Premium, Sınırsız Proje
update public.plans set sort_order = case id
  when 'free' then 0 when 'deneme' then 1 when 'basic' then 2 when 'pro' then 3 when 'premium' then 4 when 'single' then 5 else sort_order end
where id in ('free','deneme','basic','pro','premium','single');

select 'D229 tamam' as durum;
