-- Varsayılan paketler. Limitler yönetici panelinden kod değişikliği olmadan güncellenebilir.
-- Limit anahtarları: ai_requests_month, tokens_month, source_searches_month, projects, storage_mb, export_formats
insert into public.plans (id, name, description, price_monthly, price_yearly, currency, limits, features, sort_order) values
('free', 'Ücretsiz', 'Platformu tanımak için sınırlı kullanım.', 0, 0, 'TRY',
  '{"ai_requests_month": 30, "tokens_month": 60000, "source_searches_month": 40, "projects": 1, "storage_mb": 50, "export_formats": ["txt","md"]}',
  array['1 proje','Aylık 30 yapay zekâ isteği','Aylık 40 kaynak taraması','TXT / Markdown dışa aktarma'], 0),
('basic', 'Basic', 'Bireysel öğrenciler için temel akademik çalışma.', 249, 2490, 'TRY',
  '{"ai_requests_month": 300, "tokens_month": 800000, "source_searches_month": 400, "projects": 5, "storage_mb": 500, "export_formats": ["txt","md","docx","pdf"]}',
  array['5 proje','Aylık 300 yapay zekâ isteği','Aylık 400 kaynak taraması','DOCX / PDF dışa aktarma','Kalite kontrol'], 1),
('pro', 'Pro', 'Gelişmiş araştırma, kaynak analizi ve yüksek limitler.', 549, 5490, 'TRY',
  '{"ai_requests_month": 1500, "tokens_month": 4000000, "source_searches_month": 2000, "projects": 20, "storage_mb": 3000, "export_formats": ["txt","md","docx","pdf"]}',
  array['20 proje','Aylık 1.500 yapay zekâ isteği','Tam metin analizi (RAG)','Kılavuz yükleme','Öncelikli modeller'], 2),
('premium', 'Premium', 'Yoğun çalışan lisansüstü öğrenciler ve araştırmacılar için.', 999, 9990, 'TRY',
  '{"ai_requests_month": 5000, "tokens_month": 15000000, "source_searches_month": 8000, "projects": null, "storage_mb": 15000, "export_formats": ["txt","md","docx","pdf"]}',
  array['Sınırsız proje','Aylık 5.000 yapay zekâ isteği','En güçlü modeller','15 GB depolama','Öncelikli destek'], 3)
on conflict (id) do nothing;

-- Yapay zekâ yapılandırması
insert into public.app_settings (key, value) values
('ai.models', '{
  "default": {"provider": "anthropic", "model": "claude-opus-5-5"},
  "balanced": {"provider": "anthropic", "model": "claude-sonnet-5-5"},
  "fast": {"provider": "anthropic", "model": "claude-haiku-5-5"},
  "premium": {"provider": "anthropic", "model": "claude-opus-5-5"},
  "plan_tiers": {"free": "fast", "basic": "balanced", "pro": "default", "premium": "premium"},
  "pricing_per_mtok": {
    "claude-haiku-5-5": {"in": 0.1, "out": 0.5},
    "claude-sonnet-5-5": {"in": 2, "out": 10},
    "claude-opus-5-5": {"in": 4, "out": 20},
    "gpt-4.1": {"in": 2, "out": 8},
    "gpt-4.1-mini": {"in": 0.4, "out": 1.6}
  },
  "max_output_tokens": 16000,
  "effort": "medium"
}'),
('ai.system_prompt', '{"text": "Sen titiz, dürüst ve deneyimli bir akademik danışmansın. Kullanıcının akademik çalışmasını bilimsel standartlara uygun şekilde geliştirmesine yardım edersin.\n\nTemel kurallar:\n1. Asla kaynak, yazar, DOI, yıl, sayfa numarası, veri, istatistik ya da bulgu UYDURMA.\n2. Bilimsel iddiaları YALNIZCA sana sağlanan KAYNAKLAR listesindeki çalışmalarla destekle ve atıfı [[kaynak:ID]] işaretiyle ver (ID listede verilen kısa kimliktir). Listede desteği olmayan kesin veya olgusal bir iddia YAZMA: o cümleyi çıkar ya da kaynak gerektirmeyen çerçeveleyici bir ifadeye dönüştür. Metne [KAYNAK GEREKLİ] yer tutucusu koyma; desteklenemeyen konuları belirtilen biçimde ayrıca bildir.\n3. Her kaynağın erişim seviyesine dikkat et: \"metadata\" yalnızca künye, \"abstract\" yalnızca özet, \"full_text\" tam metin demektir. Yalnızca özeti okunmuş bir çalışmayı tam metni okunmuş gibi ayrıntılandırma.\n4. Kullanıcının gerçekte yapmadığı analizleri, toplamadığı verileri veya elde etmediği bulguları yazma. Bulgular bölümünde kullanıcının verisi yoksa [VERİ GİRİLECEK] gibi yer tutucular kullan.\n5. Doğrudan alıntı gerekiyorsa yalnızca tam metinden ve sayfa bilgisiyle yap.\n6. Akademik, nesnel, açık ve tutarlı bir dil kullan; çalışmanın dilinde yaz.\n7. Önceki proje kararlarını (PROJE BAĞLAMI) koru; çelişki görürsen kullanıcıyı uyar.\n8. KAYNAKLAR listesinde olmayan hiçbir yazar, eser veya yayın adını notlarda ya da önerilerde bile anma. Ek kaynak gerekiyorsa kullanıcıya \"Literatür araştır\" özelliğini kullanmasını ve hangi konuda arama yapılması gerektiğini öner."}'),
('ai.stage_prompts', '{}'),
('sources.enabled', '{
  "openalex": true, "crossref": true, "semantic_scholar": true, "europepmc": true,
  "arxiv": true, "doaj": true, "core": false, "openaire": true, "google_books": false, "unpaywall": true
}'),
('limits.rate', '{"ai_per_minute": 12, "search_per_minute": 30}'),
('plagiarism', '{"provider": null, "note": "Lisanslı bir intihal servisi entegre edilmeden intihal yüzdesi gösterilmez."}')
on conflict (key) do nothing;

insert into public.help_articles (slug, title, body, category, is_published, sort_order) values
('baslarken', 'Platforma başlarken', 'Ana sayfadan çalışma türünüzü seçin, temel bilgileri girin ve oluşturulan yol haritasındaki aşamalarda ilerleyin. Her aşamada o bölüme özel asistan sizi yönlendirir.', 'genel', true, 0),
('erisim-seviyeleri', 'Kaynak erişim seviyeleri ne anlama gelir?', 'Künye: yalnızca bibliyografik bilgi. Özet: yalnızca özet okundu. Tam metin: açık erişimli tam metin veya yüklediğiniz PDF analiz edildi. Yapay zekâ yalnızca erişebildiği kadarını kullanır.', 'kaynaklar', true, 1),
('dogrulama', 'Kaynak doğrulama nasıl çalışır?', 'DOI içeren kaynaklar Crossref üzerinden, PMID içerenler PubMed/Europe PMC üzerinden, arXiv kimliği olanlar arXiv üzerinden doğrulanır. Doğrulanamayan kaynaklar uyarı ile gösterilir.', 'kaynaklar', true, 2),
('intihal', 'İntihal kontrolü', 'Platform kendi başına intihal yüzdesi hesaplamaz. Lisanslı bir intihal hizmeti entegre edildiğinde sonuçlar kalite kontrol modülünde gösterilir. Kendi tekrar eden ifade analizimiz intihal kontrolü değildir.', 'kalite', true, 3)
on conflict (slug) do nothing;
