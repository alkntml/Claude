-- D168: Yıllık fiyat tutarlılığı
-- Fiyatlar sayfası yıllık toplamı (aylık fiyat × 0,8, yuvarlanır) × 12 olarak gösterir. Veritabanındaki price_yearly
-- eski kuralla (aylık × 10) kalmıştı (Basic 7.490 TL; ekranda 7.188 TL). Bu dosya mevcut fiyatları düzeltir ve bundan sonra
-- aylık fiyat değiştiğinde yıllık fiyatın kendiliğinden aynı kuralla hesaplanmasını sağlar (yönetim panelinden ayrıca girilemez).

create or replace function public.plans_sync_yearly_price()
returns trigger language plpgsql as $$
begin
  new.price_yearly := round(new.price_monthly * 0.8) * 12;
  return new;
end $$;

drop trigger if exists plans_sync_yearly_price on public.plans;
create trigger plans_sync_yearly_price before insert or update of price_monthly, price_yearly on public.plans
  for each row execute function public.plans_sync_yearly_price();

update public.plans set price_yearly = round(price_monthly * 0.8) * 12, updated_at = now();

select id, name, price_monthly, price_yearly from public.plans order by sort_order;
