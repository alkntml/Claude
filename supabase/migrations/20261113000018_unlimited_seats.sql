-- Kurum lisansı / Akademik Ekip: kişi sayısı sınırsız (D70).
-- seats boş (null) = sınırsız. Mevcut kurumların sınırı da kaldırılır.
alter table public.organizations drop constraint if exists organizations_seats_check;
alter table public.organizations alter column seats drop not null;
alter table public.organizations alter column seats set default null;
alter table public.organizations add constraint organizations_seats_check check (seats is null or seats > 0);
update public.organizations set seats = null;
