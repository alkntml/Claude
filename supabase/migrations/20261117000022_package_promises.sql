-- Paket vaatleri (D96, analiz D95): kartlarda aylık yazım miktarı (Türk tez biçiminde sayfa), Pro/Premium’da
-- “sınırsız kaynak taraması (adil kullanım)”, belirsiz Premium ifadesi kaldırıldı. Tarama sınırları (2.000 / 8.000)
-- adil kullanım koruması olarak veritabanında kalır. limits.pages_month yalnızca bilgi amaçlıdır (yükseltme penceresi).
-- Ortalama istek maliyeti varsayımı 0,07 → 0,09 $ (ölçülen ortalama).

update public.plans set features = array[
  '1 proje','Yapay zekâ ile yaklaşık 5 sayfa deneme taslağı','Aylık 7 kaynak taraması','Bölüm bölüm yapay zekâ yazım asistanı','Türk ve uluslararası veri tabanlarında gerçek kaynak arama','10 atıf stili ve otomatik kaynakça','Başlık önerisi ve bölüm kontrolü','TXT / Markdown dışa aktarma'
], limits = limits || '{"pages_month": 5}'::jsonb, updated_at = now() where id = 'free';

update public.plans set features = array[
  'Ücretsiz paketteki her şey','Ayda yaklaşık 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)','3 proje','Aylık 100 kaynak taraması','Word / PDF dışa aktarma','Yapay zekâ destekli kalite raporu','İstatistik analizleri ve grafikler','Anket oluşturucu','Tez konusu bulma','Zotero / Mendeley / EndNote aktarımı'
], limits = limits || '{"pages_month": 25}'::jsonb, updated_at = now() where id = 'basic';

update public.plans set features = array[
  'Basic paketteki her şey','Ayda yaklaşık 50 sayfa yapay zekâ destekli akademik metin (ör. 2 makale; yüksek lisans tezi 1–2 ayda)','10 proje','Sınırsız kaynak taraması (adil kullanım)','Literatür matrisi','Dergi önerisi ve dergi kılavuzu kontrolü','Yazım kılavuzu yükleme','Hakem yorumlarına cevap asistanı','Savunma sunumu ve savunma provası'
], limits = limits || '{"pages_month": 50}'::jsonb, updated_at = now() where id = 'pro';

update public.plans set features = array[
  'Pro paketteki her şey','Ayda yaklaşık 85 sayfa yapay zekâ destekli akademik metin (yüksek lisans tezi ayda bir; doktora tezi yaklaşık 2 ayda)','Sınırsız proje','Sınırsız kaynak taraması (adil kullanım)','15 GB depolama','Öncelikli destek'
], limits = limits || '{"pages_month": 85}'::jsonb, updated_at = now() where id = 'premium';

-- Kur hatırlatıcısı ayarın son değişme tarihine bakar; bu güncelleme onu değiştirmez (updated_at dokunulmaz)
update public.app_settings set value = value || '{"avg_request_usd": 0.09}'::jsonb where key = 'billing.margin';

select id, price_monthly, limits->>'pages_month' as sayfa_ay, features from public.plans order by sort_order;
