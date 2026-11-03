-- ISNAD 2. edisyon (metin içi) atıf stili (D73).
alter type public.citation_style add value if not exists 'isnad';

-- Paket kartlarındaki özellik metni: 9 → 10 atıf stili
update public.plans set features = array_replace(features, '9 atıf stili ve otomatik kaynakça', '10 atıf stili ve otomatik kaynakça'), updated_at = now()
where '9 atıf stili ve otomatik kaynakça' = any(features);
