-- =====================================================================
-- D236: “İstatistik” paketi (1 TL, aylık). Yalnızca istatistik araçlarını açar (analizler ve APA grafikleri); diğer haklar
-- Ücretsiz paketle aynıdır, proje ve depolama biraz geniştir (veri dosyası yüklemek için). Fiyat sayfasında Ücretsiz ile Basic arasında görünür.
-- Tekrar çalıştırılabilir.
-- =====================================================================

insert into public.plans (id, name, description, price_monthly, price_yearly, currency, limits, features, sort_order, is_active)
select 'istatistik', 'İstatistik', 'Yalnızca istatistik araçlarına ihtiyacı olanlar için: analizler ve grafikler, 30 gün.', 1, 12, 'TRY',
  limits || '{"projects": 3, "storage_mb": 200}'::jsonb,
  array['Ücretsiz paketteki her şey','İstatistik analizleri ve grafikler','CSV / Excel veri dosyası yükleme ve APA biçiminde rapor','3 proje, 200 MB depolama'],
  1, true
from public.plans where id = 'free'
on conflict (id) do update set name = excluded.name, description = excluded.description, price_monthly = 1, limits = excluded.limits,
  features = excluded.features, is_active = true, updated_at = now();

-- Sıralama: Ücretsiz, İstatistik, Basic, Pro, Premium, Sınırsız Proje
update public.plans set sort_order = case id
  when 'free' then 0 when 'istatistik' then 1 when 'basic' then 2 when 'pro' then 3 when 'premium' then 4 when 'single' then 5 else sort_order end
where id in ('free','istatistik','basic','pro','premium','single');

select 'D236 tamam' as durum;
