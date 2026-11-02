-- Kârlılık (D52): fiyatlar aynı; API maliyeti, KDV hariç paket gelirinin en fazla 1/3’ü.
-- İstek hakları ortalama istek maliyetine (~0,07 $ ≈ 3,4 TL) göre; sunucu ayrıca aylık maliyet tavanı uygular.

-- 1) Aylık toplam artık API maliyetini de döndürür (dönüş tipi değiştiği için yeniden oluşturulur)
drop function if exists public.usage_totals(uuid, timestamptz);
create function public.usage_totals(p_user uuid, p_since timestamptz)
returns table (ai_requests bigint, tokens bigint, source_searches bigint, exports bigint, storage_bytes bigint, cost_usd numeric)
language sql stable security definer set search_path = public as $$
  with ok as (select (auth.uid() is null or auth.role() = 'service_role' or p_user = auth.uid() or public.is_admin()) as v)
  select
    coalesce(sum(e.quantity) filter (where e.kind = 'ai_request'), 0),
    coalesce(sum(e.tokens_in + e.tokens_out) filter (where e.kind = 'ai_request'), 0),
    coalesce(sum(e.quantity) filter (where e.kind = 'source_search'), 0),
    coalesce(sum(e.quantity) filter (where e.kind = 'export'), 0),
    case when (select v from ok) then (select coalesce(sum(size_bytes), 0) from public.files where user_id = p_user) else 0 end,
    -- Tüm yapay zekâ çağrılarının maliyeti (haktan düşmeyen bölüm kontrolleri dahil)
    coalesce(sum(e.cost_usd), 0)
  from public.usage_events e
  where e.user_id = p_user and e.created_at >= p_since and (select v from ok)
$$;
revoke all on function public.usage_totals(uuid, timestamptz) from public, anon, authenticated;

-- 2) İstek hakları (ortalama maliyetle gelirin 1/3’ü)
update public.plans set limits = limits || '{"ai_requests_month": 10, "cost_usd_month": 1}'::jsonb, updated_at = now() where id = 'free';
update public.plans set limits = limits || '{"ai_requests_month": 40}'::jsonb, updated_at = now() where id = 'basic';
update public.plans set limits = limits || '{"ai_requests_month": 75}'::jsonb, updated_at = now() where id = 'pro';
update public.plans set limits = limits || '{"ai_requests_month": 125}'::jsonb, updated_at = now() where id = 'premium';

-- 3) Kâr ayarları (yönetim panelinden değiştirilebilir): dolar kuru, KDV, maliyet payı, ortalama istek maliyeti
insert into public.app_settings (key, value) values
  ('billing.margin', '{"usd_try": 48, "vat_rate": 0.2, "cost_share": 0.3333, "avg_request_usd": 0.07}')
on conflict (key) do nothing;

select id, price_monthly, limits->>'ai_requests_month' as yz_istek from public.plans order by sort_order;
