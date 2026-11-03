-- Fiyatlar %50 artırıldı (D60); haklar (limits) aynı. Maliyet tavanı fiyattan hesaplandığı için kendiliğinden yükselir.
update public.plans set price_monthly = 749,  price_yearly = 7490,  updated_at = now() where id = 'basic';
update public.plans set price_monthly = 1349, price_yearly = 13490, updated_at = now() where id = 'pro';
update public.plans set price_monthly = 2249, price_yearly = 22490, updated_at = now() where id = 'premium';

select id, price_monthly, limits->>'ai_requests_month' as yz_istek from public.plans order by sort_order;
