-- Token sınırları istek sınırlarından önce dolmasın (D51; bir istek ≈ 10–20 bin token).
-- Canlı veritabanında 2026-11-02’de elle çalıştırıldı.
update public.plans set limits = limits || '{"tokens_month": 800000}'::jsonb where id = 'free';
update public.plans set limits = limits || '{"tokens_month": 6000000}'::jsonb where id = 'basic';
update public.plans set limits = limits || '{"tokens_month": 60000000}'::jsonb where id = 'pro';
update public.plans set limits = limits || '{"tokens_month": 200000000}'::jsonb where id = 'premium';
