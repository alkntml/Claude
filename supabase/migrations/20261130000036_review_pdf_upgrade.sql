-- D132–D134: Gelişmiş PDF okuma ve sistematik derleme geliştirmeleri. Tekrar çalıştırmak güvenlidir.

-- 1) PDF parçalarında bölüm bilgisi (Özet, Yöntem, Bulgular…): kanıt ararken ilgili bölüm öne alınır.
alter table public.source_chunks add column if not exists section text check (section is null or char_length(section) <= 30);

-- 2) Sistematik derleme: bağımsız oylar (çift değerlendirici), veri çıkarma formu, kalite (yanlılık riski) değerlendirmesi.
alter table public.review_records add column if not exists votes jsonb not null default '{}'::jsonb;
alter table public.review_records add column if not exists extraction jsonb;
alter table public.review_records add column if not exists appraisal jsonb;
