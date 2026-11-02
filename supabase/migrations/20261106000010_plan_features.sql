-- Paket kartları: yapay zekâ isteği sayısı yerine özellikler (D49).
-- Kullanım sınırları (plans.limits) değişmez ve uygulanmaya devam eder; yalnızca paket yükseltirken gösterilir.

update public.plans set features = array[
  '1 proje','Aylık 7 kaynak taraması','Bölüm bölüm yapay zekâ yazım asistanı','Türk ve uluslararası veri tabanlarında gerçek kaynak arama','9 atıf stili ve otomatik kaynakça','Başlık önerisi ve bölüm kontrolü','TXT / Markdown dışa aktarma'
], updated_at = now() where id = 'free';

update public.plans set features = array[
  'Ücretsiz paketteki her şey','3 proje','Aylık 100 kaynak taraması','Word / PDF dışa aktarma','Yapay zekâ destekli kalite raporu','İstatistik analizleri ve grafikler','Anket oluşturucu','Tez konusu bulma','Zotero / Mendeley / EndNote aktarımı'
], updated_at = now() where id = 'basic';

update public.plans set features = array[
  'Basic paketteki her şey','10 proje','Aylık 2.000 kaynak taraması','Literatür matrisi','Dergi önerisi ve dergi kılavuzu kontrolü','Yazım kılavuzu yükleme','Hakem yorumlarına cevap asistanı','Savunma sunumu ve savunma provası'
], updated_at = now() where id = 'pro';

update public.plans set features = array[
  'Pro paketteki her şey','Sınırsız proje','Aylık 8.000 kaynak taraması','En yüksek yapay zekâ kullanım hakkı','15 GB depolama','Öncelikli destek'
], updated_at = now() where id = 'premium';
