-- Paketlerin yeniden düzenlenmesi (2026-11-02)
-- Ödeme altyapısı şimdilik kapalı; yükseltme talepleri WhatsApp üzerinden alınır.
-- Öğrenci indirimi kaldırıldı; yerine %20 Akademik Ekip İndirimi (talep üzerine, elle uygulanır).

update public.plans set
  limits = limits || '{"ai_requests_month": 20, "source_searches_month": 7}'::jsonb,
  features = array['1 proje','Aylık 20 yapay zekâ isteği','Aylık 7 kaynak taraması','TXT / Markdown dışa aktarma'],
  updated_at = now()
where id = 'free';

update public.plans set
  price_monthly = 499, price_yearly = 4990,
  limits = limits || '{"ai_requests_month": 150, "source_searches_month": 100, "projects": 3}'::jsonb,
  features = array['3 proje','Aylık 150 yapay zekâ isteği','Aylık 100 kaynak taraması','DOCX / PDF dışa aktarma','Kalite kontrol'],
  updated_at = now()
where id = 'basic';

update public.plans set
  price_monthly = 899, price_yearly = 8990,
  limits = limits || '{"projects": 10}'::jsonb,
  features = array['10 proje','Aylık 1.500 yapay zekâ isteği','Aylık 2.000 kaynak taraması','Tam metin analizi (RAG)','Kılavuz yükleme'],
  updated_at = now()
where id = 'pro';

update public.plans set
  price_monthly = 1499, price_yearly = 14990,
  features = array['Sınırsız proje','Aylık 5.000 yapay zekâ isteği','Aylık 8.000 kaynak taraması','15 GB depolama','Öncelikli destek'],
  updated_at = now()
where id = 'premium';

-- Öğrenci indirimi ayarı artık kullanılmıyor
delete from public.app_settings where key = 'billing.student';
