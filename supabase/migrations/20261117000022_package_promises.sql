-- Paket vaatleri (D96, analiz D95): kartlarda aylık yazım miktarı (Türk tez biçiminde sayfa), Pro/Premium’da
-- “sınırsız kaynak taraması (adil kullanım)”, belirsiz Premium ifadesi kaldırıldı. Tarama sınırları (2.000 / 8.000)
-- adil kullanım koruması olarak veritabanında kalır. limits.pages_month yalnızca bilgi amaçlıdır (yükseltme penceresi).
-- Yönetim panelinden elle yapılmış kart düzenlemeleri korunur: satırlar yalnızca eklenir/değiştirilir; tekrar çalıştırmak güvenlidir.
-- Ortalama istek maliyeti varsayımı 0,07 → 0,09 $ (ölçülen ortalama).

-- 1) Aylık sayfa satırı: kartın ilk satırından hemen sonra (zaten varsa eklenmez)
update public.plans set features = features[1:1] || array['Yapay zekâ ile yaklaşık 5 sayfa deneme taslağı'] || features[2:], updated_at = now()
where id = 'free' and not ('Yapay zekâ ile yaklaşık 5 sayfa deneme taslağı' = any(features));
update public.plans set features = features[1:1] || array['Ayda yaklaşık 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)'] || features[2:], updated_at = now()
where id = 'basic' and not ('Ayda yaklaşık 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)' = any(features));
update public.plans set features = features[1:1] || array['Ayda yaklaşık 50 sayfa yapay zekâ destekli akademik metin (ör. 2 makale; yüksek lisans tezi 1–2 ayda)'] || features[2:], updated_at = now()
where id = 'pro' and not ('Ayda yaklaşık 50 sayfa yapay zekâ destekli akademik metin (ör. 2 makale; yüksek lisans tezi 1–2 ayda)' = any(features));
update public.plans set features = features[1:1] || array['Ayda yaklaşık 85 sayfa yapay zekâ destekli akademik metin (yüksek lisans tezi ayda bir; doktora tezi yaklaşık 2 ayda)'] || features[2:], updated_at = now()
where id = 'premium' and not ('Ayda yaklaşık 85 sayfa yapay zekâ destekli akademik metin (yüksek lisans tezi ayda bir; doktora tezi yaklaşık 2 ayda)' = any(features));

-- 2) Tarama ifadesi ve belirsiz Premium satırı
update public.plans set features = array_replace(features, 'Aylık 2.000 kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'), updated_at = now() where id = 'pro';
update public.plans set features = array_remove(array_replace(features, 'Aylık 8.000 kaynak taraması', 'Sınırsız kaynak taraması (adil kullanım)'), 'En yüksek yapay zekâ kullanım hakkı'), updated_at = now() where id = 'premium';

-- 3) Yükseltme penceresi için sayfa bilgisi
update public.plans set limits = limits || '{"pages_month": 5}'::jsonb where id = 'free';
update public.plans set limits = limits || '{"pages_month": 25}'::jsonb where id = 'basic';
update public.plans set limits = limits || '{"pages_month": 50}'::jsonb where id = 'pro';
update public.plans set limits = limits || '{"pages_month": 85}'::jsonb where id = 'premium';

-- 4) Kur hatırlatıcısı ayarın son değişme tarihine bakar; bu güncelleme onu değiştirmez (updated_at dokunulmaz)
update public.app_settings set value = value || '{"avg_request_usd": 0.09}'::jsonb where key = 'billing.margin';

select id, limits->>'pages_month' as sayfa_ay, features from public.plans order by sort_order;
