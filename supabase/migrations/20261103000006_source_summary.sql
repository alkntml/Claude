-- Literatür matrisi: kaynağın amaç / yöntem / örneklem / bulgular özeti (yalnızca okunan içerikten üretilir).
alter table public.sources add column if not exists summary jsonb;
