-- D162: “Sınırsız Kullanım” paketinin adı “Sınırsız Proje” oldu (iç kimlik single; limitler ve fiyat değişmez)
update public.plans set name = 'Sınırsız Proje', updated_at = now() where id = 'single';

select id, name, price_monthly, limits->>'projects' as proje from public.plans where id = 'single';
