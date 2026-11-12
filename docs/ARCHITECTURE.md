# Mimari

## Genel bakış

```
Tarayıcı (Next.js istemci bileşenleri, TipTap editör)
   │  fetch / SSE (aynı köken, çerez tabanlı oturum)
   ▼
Next.js sunucusu (App Router, Node.js runtime)
   ├─ middleware: Supabase oturum yenileme + korumalı rota yönlendirmesi
   ├─ /api/*: zod doğrulama → requireUser/requireAdmin → limit kontrolü → iş mantığı
   │     ├─ Supabase (kullanıcı oturumlu istemci → RLS uygulanır)
   │     ├─ Supabase service role (yalnızca kullanım/hata kayıtları, ayarlar, yönetim, webhook)
   │     ├─ AI sağlayıcıları (lib/ai/registry: Anthropic SDK, OpenAI REST)
   │     └─ Akademik API'ler (lib/sources/providers)
   ▼
Supabase: PostgreSQL (RLS) · Auth · Storage (özel bucket `user-files`)
```

## Temel tasarım kararları

### 1. Atıflar metin değil, düğümdür
Editörde atıflar `citation` düğümleridir (`{ ids: [kaynak uuid], locator, narrative }`). Görüntü, istemcideki `CitationEngine` ile o anki proje stiline göre üretilir. Bu sayede:
- Stil değişince bütün metin ve kaynakça anında yeniden biçimlenir.
- Numaralı stillerde (Vancouver, IEEE, AMA) numaralar ilk geçiş sırasına göre bütün bölümler boyunca hesaplanır.
- Kaynakça yalnızca metinde atıf alan kaynaklardan oluşur. Silinen kaynağa işaret eden atıflar kırmızı görünür.

Yapay zekâ atıfları `[[kaynak:S3]]` işaretiyle yazar. `S3` gibi kısa kimlikler istek bağlamındaki kaynak listesine aittir ve sunucu `sourceMap` ile gerçek kimliklere çevirir. Listede olmayan bir kimlik `[KAYNAK DOĞRULANAMADI]` olarak eklenir. Böylece model, projede bulunmayan bir kaynağa atıf yapamaz.

### 2. Erişim seviyesi (künye / özet / tam metin)
`sources.access_level` yalnızca sunucu tarafında yükseltilir:
- `abstract`: sağlayıcıdan anlamlı bir özet geldiyse
- `full_text`: açık erişimli PDF veya Europe PMC XML gerçekten indirilip parçalandıysa, ya da kullanıcı PDF yükleyip kaynağa bağladıysa

İstemci `full_text` atayamaz. AI bağlamında her kaynağın erişim seviyesi ve doğrulama durumu yazılıdır. Doğrudan alıntı ve sayfa numarası yalnızca tam metin parçalarından yapılabilir.

### 3. Doğrulama
`lib/sources/verify.ts`: DOI için önce Crossref, bulunamazsa DataCite (arXiv/Zenodo DOI'leri), PMID için Europe PMC, arXiv kimliği için arXiv API sorgulanır. Kayıt otoritesinin döndürdüğü başlık, Jaccard benzerliği ≥ 0,6 ise `verified`; değilse `mismatch` sonucu verilir. Doğrulanan kayıttan eksik künye alanları tamamlanır.

### 4. RAG
Tam metinler yaklaşık 1200 karakterlik, örtüşmeli ve sayfa bilgisi taşıyan parçalara bölünür (`source_chunks`). Arama, PostgreSQL `tsvector` + `websearch_to_tsquery` ile yapılır (`search_project_chunks`, `security invoker`; RLS uygulanır). Bu seçim harici bir embedding servisine bağımlılığı ortadan kaldırır. Anlamsal arama gerekirse `pgvector` sütunu eklenip aynı fonksiyon arayüzü korunabilir.

### 5. Proje hafızası
`project_memory` tablosu (karar, kavram, değişken, soru, hipotez, bilgi) her AI isteğine eklenir. Model, kullanıcının onayladığı kalıcı bilgileri `:::hafiza` bloğuyla döndürür ve sunucu bunları otomatik kaydeder. Kullanıcı hafızayı panelden düzenleyebilir. Diğer bölümlerin kısa özetleri de bağlama girer; böylece bölümler arası tutarlılık korunur.

### 6. Sağlayıcıdan bağımsız AI katmanı
`lib/ai/types.ts` → `AiProvider.stream()`. Anthropic resmi SDK ile, OpenAI REST ile uygulanmıştır. Yeni bir sağlayıcı eklemek için bir `AiProvider` uygulayıp `registry.ts`'e kaydetmek yeterlidir. Hangi paketin hangi model katmanını (`fast` / `balanced` / `default` / `premium`) kullanacağı, maliyet tablosu, sistem promptu ve bölüme özel talimatlar `app_settings` tablosundadır ve yönetici panelinden kod değişikliği olmadan değiştirilir (30 sn önbellek).

Varsayılan modeller: `claude-opus-5-5` (default/premium), `claude-sonnet-5-5` (balanced), `claude-haiku-5-5` (fast: araştırma sorgusu üretimi). Opus 5.5 ve Sonnet 5.5 isteklerinde sunucu taraflı güvenlik yedeği (`fallbacks: "default"`) etkindir.

### 7. Güvenlik
- **RLS:** Tüm kullanıcı tablolarında `user_id = auth.uid()` politikaları vardır. Ek olarak tetikleyiciler (`assert_project_owner`, `assert_conversation_owner`), alt kayıtların yalnızca kullanıcının kendi projesine bağlanmasını garanti eder.
- **Ayrıcalıklı alanlar:** `protect_profile_privileged_columns` tetikleyicisi, kullanıcının kendi `role`, `plan_id`, `is_suspended` alanlarını değiştirmesini engeller.
- **CSRF:** Durum değiştiren bütün API isteklerinde `Origin` ile `Host` karşılaştırılır. Çerezler SameSite=Lax'tır.
- **Girdi doğrulama:** Bütün gövdeler zod ile doğrulanır. Belge boyutu 2 MB, dosya boyutu 25 MB ile sınırlıdır. Dosya imzası (magic bytes) uzantıyla karşılaştırılır.
- **SSRF:** Tam metin indirmede yalnızca herkese açık http(s) adresleri kabul edilir (özel IP'ler, localhost ve yönlendirme hedefleri kontrol edilir).
- **XSS:** React kaçışı kullanılır. `dangerouslySetInnerHTML` yalnızca atıf motorunun kaçışlı çıktısında kullanılır (`richToHtml` → `escapeHtml`).
- **Gizli anahtarlar:** `lib/env.ts` ve `lib/supabase/admin.ts` `server-only` ile işaretlidir. İstemciye yalnızca `NEXT_PUBLIC_SUPABASE_*` gider.
- **Hız sınırı:** `usage_events` üzerinden son 60 saniye sayılır. Veritabanı tabanlı olduğu için birden çok sunucu örneğinde tutarlıdır.
- **Güvenlik başlıkları:** `next.config.ts` (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy).

### 8. Kullanım limitleri
`plans.limits` (JSON): `ai_requests_month`, `tokens_month`, `source_searches_month`, `projects`, `storage_mb`, `export_formats`. `null` sınırsız demektir. Kontroller `lib/usage.ts` içinde, işlemden önce yapılır. Aşımda 402 ve Türkçe mesaj döner.

### 9. Ödeme
`lib/payments` bir sağlayıcı arayüzü tanımlar. Stripe Checkout (dinamik `price_data`) ve imza doğrulamalı webhook uygulanmıştır; abonelik durumu `subscriptions` tablosuna, aktif paket `profiles.plan_id` alanına yazılır. iyzico yalnızca arayüz iskeletidir.

## Veri modeli (özet)

`profiles` · `plans` · `subscriptions` · `usage_events` · `projects` · `project_stages` · `stage_revisions` · `stage_comments` · `project_memory` · `sources` · `source_chunks` · `files` · `ai_conversations` · `ai_messages` · `quality_reports` · `app_settings` · `announcements` · `feedback` · `error_logs` · `help_articles` · `data_requests`

Ayrıntılar: `supabase/migrations/20261101000001_init.sql`

## Bilinen sınırlamalar ve sonraki adımlar

Tamamlananlar (önceki sürümde eksikti): veritabanı şeması ve RLS politikaları PGlite üzerinde gerçek PostgreSQL ile test edilir (`tests/db.test.ts`); tam metin analizi arka planda (`after()`) çalışır; danışman paylaşım bağlantıları; PDF içindekiler tablosunda sayfa numaraları.

Hâlâ açık olanlar:

1. **Canlı entegrasyon testleri:** Akademik API'ler, Anthropic API, Supabase Auth/Storage ve Stripe gerçek bir ortamda uçtan uca test edilmedi (geliştirme ortamında ağ erişimi yoktu). Yayından önce staging ortamında doğrulanmalıdır.
2. **iyzico:** Uygulanmadı. Abonelik ürün ve fiyat planı referans kodları, müşteri bilgileri (T.C. kimlik no, adres) ve imzalı istekler gerekir; satıcı hesabı ve sandbox anahtarları olmadan test edilemez.
3. **İntihal:** Entegre değil (lisanslı servis gerekir).
4. **İş kuyruğu:** Arka plan işleri `after()` ile aynı sunucu örneğinde çalışır. Kalıcı ve yeniden denenebilir kuyruk (Inngest, QStash, Supabase Queues) yüksek trafikte önerilir.
5. **Anlamsal arama:** RAG anahtar kelime tabanlıdır; `pgvector` ve bir embedding sağlayıcısı (ör. Voyage) ile genişletilebilir.
6. **Atıf stilleri:** Chicago ve Turabian yalnızca yazar-tarih sistemindedir (notlu sistem yok). Dergi adı kısaltmaları uygulanmaz.
7. **Şablonlar:** `.dotx` şablonu doğrudan kullanılamaz; kılavuzdan çıkarılan yazı tipi, punto ve satır aralığı uygulanır.
8. **Gerçek zamanlı ortak düzenleme:** Yok. Danışman salt okunur bağlantıyla görüntüleyip yorum bırakabilir.
9. **Arayüz dili:** Yalnızca Türkçe.
10. **Yedekleme:** Supabase yönetilen yedekleri; üretimde Point-in-Time Recovery etkinleştirilmelidir.
11. **Hukuki metinler:** `/gizlilik` ve `/kosullar` şablondur.

## Modül haritası (ayrıntılı)

CLAUDE.md’den taşındı. Yeni modül eklenince burayı güncelle.

```
src/app/                 Sayfalar + API rotaları
  (app)/                 Oturum gerektiren: panel, yeni, kaynaklar, dosyalar, anketler, konu-bul, hesap, kurum, yonetim
  a/[token]/             Herkese açık anket formu (kimlik bilgisi toplanmaz)
  blog/ + blog/[slug]/   Blog (38 yazı, statik üretim, BlogPosting + Breadcrumb JSON-LD)
  proje/[id]/            Çalışma alanı (+ /kalite)
  paylasim/[token]/      Danışman salt okunur görünümü
  api/                   REST uçları (aşağıda)
src/components/          landing, dashboard, workspace, admin, share, ui
src/lib/
  citations/             Atıf motoru (10 stil, ISNAD 2 metin içi dahil), checks.ts (eksik künye, yinelenen, tutarlılık), captions.ts (tablo/şekil başlığı her stile göre: konum, etiket, kalın/italik; dışa aktarmada güncel stile çevrilir — D106)
  sources/               http.ts (safeFetch: dış bağlantıda her yönlendirme + DNS denetimi, SSRF — D106), providers.ts (16 anahtarsız veri tabanı: +ERIC, DBLP, DataCite — D92; +PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP ve anahtarla NASA ADS, Springer Nature, IEEE Xplore — D129; Semantic Scholar kaldırıldı — D93; CORE kaldırıldı — D130), aggregate.ts, verify.ts, fulltext.ts, input.ts, row.ts
  research.ts            Araştırma planlama (Haiku), arama yürütme, kaynakları projeye ekleme; researchGate: tarama yalnızca gerektiğinde (D75)
  ai/                    registry (model katmanları), anthropic, openai, context (RAG + hafıza; head önbellekte, tail değişken — D78), history (geçmiş kısaltma), cost (önbellekli maliyet), prompts (ACTION_TIER, ACTION_EFFORT)
  workflows/length.ts    Kurgudaki hedef uzunluk (D97): draftTarget (alt başlığa eşit pay), lengthInstruction, taslak %85’in altındaysa devam (appendToDraft)
  workflows/             Çalışma türleri + aşama şablonları (stages.ts); order.ts önerilen yazım sırası (özet en son); structure.ts akademik bölüm yapısı/başlık disiplini (D76); quick-actions.ts aşamaya özel kısayollar (D75)
  blueprint.ts + blueprint-ai.ts  Kurgu modülü (D67): çalışma başında problem/amaç/yöntem/bölüm planı; context.blueprint, yapay zekâ bağlamına girer
  titles.ts              Başlık önerileri (çalışmanın ilk adımı)
  editor/doc.ts          TipTap JSON yardımcıları, markdownToDoc ([[kaynak:S1]] -> citation düğümü)
  editor/sections.ts     Bölüm içi alt başlıklar (D83): sectionTree (numaralı ağaç), sectionDoc/replaceSectionBody (alt başlığa odaklanma), addSubheadings; arayüz components/workspace/subheadings.tsx
  import/                Word’den içe aktarma (D87): html-doc.ts (mammoth HTML → düğüm), references.ts (kaynakça ayrıştırma, atıf bağlama, başlık oturtma), server.ts
  memory-learn.ts        Hafızaya belgeden öğren (D88)
  ai/help.ts             Asistanın kullanım rehberi (APP_GUIDE yalnız kullanım sorusu yolunda; ana asistana APP_GUIDE_SHORT, D96) + kullanım sorusu tanıma (D93); menü/özellik değişince güncelle
  tools/                 Ücretsiz araçlar (D90): index (liste), guides.ts (sayfa rehberi + SSS, TR/EN, D107), sample-size, table-parse, server (künye bulma, uydurma kaynak kontrolü); arayüz components/tools, sayfalar app/araclar
  analytics.ts insights.ts  Çerezsiz ölçüm + araç kullanım kaydı; yönetim maliyet/ziyaret özetleri (D90); grafikler components/ui/charts.tsx
  quality/checks.ts      Kural tabanlı kalite kontrol
  export/                model.ts + render-docx/pdf/text + render-latex (D136: LaTeX ZIP, biblatex, Overleaf’te aç; Türkçe biblatex ayarı biblatexSetup)
  files/                 extract, chunk, stats (deterministik istatistik)
  payments/              Stripe/iyzico kütüphanesi (şimdilik kullanılmıyor; rotalar kaldırıldı, D48)
  stats/                 dist.ts (dağılımlar), tests.ts (t, ANOVA, regresyon…), apa.ts (APA rapor)
  sources/bib.ts         BibTeX/RIS/CSL-JSON; sources/journals.ts dergi önerisi
  export/presentation.ts Savunma sunumu (.pptx); export/format.ts biçim şablonları
  blog/                  Blog yazıları (posts-1..6.ts, İngilizceleri en-1..6.ts, Almancaları de-1..6.ts; basit Markdown gövde), index.ts (liste, ayrıştırıcı, ilgili yazılar)
  seo.ts                 Dil bazlı adresler (/en öneki), localizedPath, bot tanıma
  seo-pages.ts           Herkese açık sayfaların TR/EN başlık, açıklama, anahtar kelimeleri
  seo-server.ts          buildMeta/pageMeta: canonical, hreflang, Open Graph, Twitter, robots
  structured-data.ts     JSON-LD: Organization, WebSite, SoftwareApplication, ItemList, BreadcrumbList, WebPage
  samples.ts             Örnek çıktılar sayfası içeriği (D72; kurgusal çalışma, örnek veri seti); görünüm components/samples
  faq.ts                 SSS içeriği (TR/EN; Almancası faq-de.ts) — /sss ve ana sayfa; özellik değişince güncelle
  guide.ts               Kullanım rehberi içeriği (D142, TR/EN; Almancası guide-de.ts) — /yardim (components/guide/guide-view.tsx); rehberli tur workspace/tour.tsx adımları buradaki konulara bağlanır; menü/özellik değişince ai/help.ts ile birlikte güncelle
  growth.ts pricing.ts  Kurum lisansı, krediler (tek seferlik bakiye: creditPool, D98), davet (ödül = Ücretsiz paket hakları: referralReward; yalnız davet edene, kayıt anında DB tetikleyicisiyle — D99); WhatsApp yükseltme bağlantısı + Akademik Ekip İndirimi %30, en az 3 kişi, sınırsız üye (pricing.ts, D70)
  auth-providers.ts      Supabase’de etkin sosyal giriş sağlayıcıları (Google/Apple)
  surveys.ts             Anket modeli: soru şeması, cevap doğrulama, analize hazır tablo, CSV, kod kitabı, hızlı kontrol (surveyLint), fromAiQuestions
  survey-ai.ts           Anket için yapay zekâ: taslak üretme, talimatla düzenleme, soru iyileştirme, inceleme (D66)
  stats/charts.ts + charts/svg.ts  Grafik verisi (deterministik) + APA tarzı SVG çizimi (istemcide PNG’ye çevrilir, editörde `figure` düğümü)
  defense.ts             Savunma provası (jüri soruları, cevap değerlendirme)
  topics.ts + topics-server.ts     Konu bulma: OpenAlex yıllık eğilim, alt konular, Türkiye payı + verilere dayalı öneriler
  quality/stage-review.ts  Bölüm tamamlama kontrolü (kural + yapay zekâ incelemesi)
  quality/repetition.ts  Tekrar analizi (kalıp ifadeler, cümle başlangıçları, benzer cümleler)
  features.ts            Pakete göre özellik kilitleri (FEATURE_MIN_PLAN, hasFeature); sunucu: usage.ts assertFeature; istemci: openUpgrade() → components/upgrade-dialog.tsx
  lock.ts                 getWorkLock: aylık hak durumu (D81: çalışma artık kilitlenmez, yalnızca “hak doldu” şeridi); scramble.ts eski, kullanılmıyor
  autopilot.ts           Yönetici “Otomatik çalışma” modülü kuralları (D77); motor components/admin/autopilot-engine.ts
  disposable-email.ts    Geçici e-posta alanları (D106; aynı liste migration 29’da). Davet ödülü yalnızca e-posta doğrulanınca ve gerçek adresle
  devices.ts + device-client.ts  Cihaz kimliği (D101): tarayıcıda rastgele kimlik (localStorage + çerez acd_did), sunucuya yalnızca SHA-256 özeti; user_devices; davet edenin cihazından kayıtta ödül yok
  single-project.ts      Tek Proje paketi (D103): assertSingleProject (yapay zekâ yalnızca bağlı çalışmada), assertCanCreateProject, assertSingleProjectChange; uyarılar raise_abuse_alert (DB); maliyet %40 uyarısı single_cost_status/single_cost_watch (D104, kısıtlama yok); pricing.ts isOneTimePlan. D109: singleScope (çalışma dışı yapay zekâ/tarama ayda Ücretsiz paket kadar, kayıtta meta.offProject); single-watch.ts (engellemez, uyarır: content_replaced, cover_change, many_devices, many_sections, off_topic) + fingerprint.ts (MinHash); yönetim → Uyarılar sekmesi karar (sorun yok / uyar / askıya al), paket atarken ödeyen bilgisi (plan_purchases)
  activity.ts + activity-summary.ts  Kullanım kanıt kaydı (D102): logAiOutput (her yapay zekâ çıktısı), DB tetikleyicileri silmeleri yazar; yönetim → kullanıcı → Kullanım geçmişi (components/admin/activity.tsx)
  project-access.ts      Ortak yazım erişimi (D115): projectAccess/childAccess (sahip RLS, ortak yazar sunucu anahtarı + açık filtre; içerik user_id = sahip). Çalışmaya bağlı YENİ uçlar requireProject yerine bunu kullanmalı; coauthors.ts saf kurallar (davet, roller)
  language.ts editor/translate-doc.ts  Dil ve çeviri (D111): belirteçli çeviri (⟦C/F/G⟧), dil denetimi, terim sözlüğü context.glossary; arayüz workspace/language-modal.tsx + selection-bubble.tsx
  claims.ts claim-audit.ts  İddia denetimi (D119): cümle/atıf çıkarımı (saf) + kaynağa göre toplu denetim; claim_audits; arayüz workspace/claim-audit.tsx + claim-marks.ts (editör işaretleri). D133: “contradicts” kararı, kaynaklar arası destek/çelişki (crossCheckSources, relatedCandidates), auditCsv
  quality/score.ts quality/checklist.ts  Kalite puanı yöntemi (D120; YZ bulguları puanı etkilemez) + teslim öncesi kontrol listesi (D121); herkese açık /yontem sayfası
  prisma.ts review-ai.ts  PRISMA 2020 (D122): aşamalar, yinelenen anahtarı, akış şeması SVG, CSV; YZ yalnızca eleme ÖNERİSİ; review_records; arayüz workspace/review-modal.tsx. D134: bulanık yinelenen, çift değerlendirici oyları + kappa (agreement), veri çıkarma (extractData), kalite (APPRAISAL_ITEMS), methodsMarkdown/characteristicsMarkdown
  files/pdf-clean.ts multi-ask.ts  Gelişmiş PDF okuma (D132: üst/alt bilgi, tire, bölüm tanıma, kaynakça ayırma; parça section; sources/chunk-insert.ts insertChunks/loadChunks) + çoklu belge analizi (Birlikte analiz et; workspace/multi-analyze.tsx)
  litmap.ts litmap-graph.ts  Literatür haritası (D123, D141): atıf + ortak kaynakça + birlikte atıf ağı, kümeler (clusterize), zaman çizelgesi, konu haritası, yeni çalışmalar (ileri atıf), boşluk analizi (insights); arayüz workspace/litmap-modal.tsx
  editor/merge.ts        Ortak yazımda paragraf düzeyinde üç yollu birleştirme (D140); canlı kanal workspace/live-collab.ts (Supabase Realtime `project:<id>`, migration 37), editör eklentileri workspace/collab-ext.ts (RemotePeers, applyDocPatch), bul-değiştir workspace/find-replace.ts + find-bar.tsx
  org-audit.ts           Kurum denetim kaydı (D125); ai/registry streamWith her çağrıyı ai_calls’a yazar (gözlemlenebilirlik); yönetim → ürün analitiği (api/admin/product)
  source-ask.ts          Kaynağa sor (D112); consensus.ts Araştırmalar ne diyor? (D114); autocomplete.ts satır içi öneri (D113, kullanım türü autocomplete) + workspace/inline-suggest.ts
  writing-lang.ts        Çalışmanın yazım dili tr/en/de (D144): writingLang, LANG_NAME, LANG_TAG — arayüz dilinden (Locale) ayrıdır
  discount.ts discount-server.ts  İndirim kodları (D145): indirimli fiyat, geçerlilik; userDiscount, attachDiscount (sosyal giriş); yönetim components/admin/discounts.tsx, uç api/admin/discounts
  notify.ts              Yönetici mesajı bağlantı denetimi (D146: yalnız site içi yol); bildirim türü admin_message, gönderim admin/user/[id] action notify
  testimonials.ts        Ana sayfa görüşleri (D147): özgün dilinde, değiştirilmeden; yapılandırılmış veriye yorum/puan eklenmez; yeni görüş yalnızca site sahibi iletirse
  research-prefs.ts      Kaynak tercihleri (D149): mode auto/ask/off, yearFrom, minCitations, preprints (context.research); filterByPrefs, promptStrength; form components/research-prefs-form.tsx; sohbette izin kartı (research_permission, research: allow|skip)
  project-create.ts      Çalışma oluşturma ortak yolu (D149): yol haritası / yapı (standard, smart, free, imported) / içe aktarılan bölümler
  import/whole.ts import/work.ts  Tüm çalışmayı içe aktarma (D149): splitIntoSections, textToNodes (PDF/TXT), analyzeWork (Haiku künye), buildSeeds; import/server.ts addReferenceLines + docxToNodes (Word içe aktarmayla ortak); arayüz workspace/import-hub.tsx (İçe aktar merkezi), sihirbazda “Mevcut çalışmamı içe aktar”
  sources/zotero.ts sources/import-refs.ts  Zotero Web API (anahtar saklanmaz) + BibTeX/RIS/CSL-JSON içe aktarma ortak işlevi
  pages.ts               Sayfa hakkı (D145): 1 sayfa = 344 kelime, PAGE_ACTIONS (hak dolunca duran yazım eylemleri), chargedWords; sınır usage.ts assertWithinLimits(..., { writes })
  legal/                 Hukuki metinler (D154): docs.ts (adres, başlık, sürüm, kabul kuralı), content-tr/en/de.ts (metinler), server.ts (requireLegalAcceptance, recordLegal); sayfalar components/legal/legal-page.tsx, onay /sozlesme-onayi (components/auth/consent-form.tsx), uç api/legal/accept
  consent.ts             Çerez/tarayıcı belleği envanteri ve izin altyapısı (D154); components/consent/consent.tsx (ConsentBanner, ConsentGate)
  account-delete.ts pii.ts  Hesap silmede depo dosyalarının tamamı (D154, docs/ACCOUNT_DELETION.md); hata kayıtlarında kişisel veri maskeleme
  usage.ts settings.ts auth.ts api.ts env.ts projects.ts shares.ts
src/i18n/                core.ts (sözlüksüz çekirdek: Locale tr/en/de, pick, contentLang, AI_LANGUAGE; istemci bunu kullanır), index.ts (core + sözlükler, sunucu; dictFor), server.ts (getT), client.tsx (useT, LanguageSwitch), en.ts + de.ts (sözlükler)
supabase/migrations/     Sıralı SQL migration'ları
supabase/setup.sql       Tüm migration'ların birleşimi (sıfırdan kurulum)
public/                  brand/ (logo ve amblem PNG), favicon.ico, icons/ (uygulama simgeleri; amblemden üretildi), sw.js (servis çalışanı; sürüm değişince VERSION artır)
demo/                    Sunucusuz tarayıcı demosu (mock API + Next shim'leri)
tests/                   Vitest
```

## API uçları

`projects`, `projects/[id]` (+ `stages`, `stages/suggest`, `sources`, `memory`, `quality`, `export`, `shares`), `stages/[id]` (+ `revisions`, `comments`), `sources/search|lookup|[id]|[id]/verify|[id]/fulltext`, `ai/chat` (SSE), `ai/research`, `files` (+ `[id]`, `stats`, `to-source`), `account`, `feedback`, `announcements`, `billing/*` (kaldırıldı; ödeme WhatsApp üzerinden, D48), `admin/[resource]`, `admin/stats`, `share/[token]/comments`, `auth/callback`, `auth/confirm` (token_hash; şifre yenileme D74), `projects/[id]/sources/import|export`, `projects/[id]/matrix|journals|presentation`, `files/[id]/analyze`, `sources/[id]/evidence|attach-file`, `org/join|leave|members`, `account/growth`, `admin/org-member`, `projects/[id]/defense`, `files/[id]/chart`, `surveys` (+ `ai`, `[id]`, `[id]/ai`, `[id]/responses`, `[id]/to-project`), `public/survey/[token]`, `topics/explore`, `projects/[id]/titles`, `projects/[id]/blueprint` (POST yapay zekâ, PUT kaydet/onayla), `stages/[id]/review`, `account/plans` (yükseltme penceresi için sınırlar), `account/data-request` (KVKK talebi), `admin/locks`, `admin/user-export`, `admin/users-list`, `admin/user/[id]`, `admin/referrals`, `projects/[id]/import-doc` (Word içe aktarma), `projects/[id]/memory/learn` (belgeden hafıza), `public/track` (ölçüm), `public/tools/lookup|fake-check|use` (ücretsiz araçlar), `admin/insights` (maliyet ve ziyaret), `notifications` (bildirim kutusu: GET liste, POST okundu — D100), `account/device` (cihaz özeti kaydı, D101), `admin/user/[id]/activity` (kullanım kanıt kaydı, D102), `admin/alerts` (kötüye kullanım uyarıları ve kararlar, D109), `projects/[id]/language` (çeviri/dil denetimi), `sources/[id]/ask`, `projects/[id]/complete` (otomatik tamamlama), `public/tools/consensus`, `projects/[id]/members` (ortak yazarlar), `coauthor/[token]` (davet kabul), `projects/[id]/presence`, `stages/[id]/claim-audit` (GET son denetim, POST çalıştır), `projects/[id]/review` (+ `screen`, `include`, `vote`, `extract`, `record`), `projects/[id]/sources/analyze` (çoklu belge), `projects/[id]/litmap`, `admin/product`, `admin/discounts` (indirim kodları), `projects/import` (mevcut çalışmayı içe aktar), `projects/[id]/import-work`, `projects/[id]/sources/zotero`. Herkese açık yeni sayfa: `/yontem`.

## SEO ayrıntıları

- Herkese açık sayfalar iki adreste: Türkçe öneksiz (`/fiyatlar`), İngilizce `/en` önekli (`/en/fiyatlar`). Ara katman `/en/*` isteğini öneksiz sayfaya yeniden yazar ve `x-locale` başlığını koyar; `getLocale()` önce bu başlığa bakar. Uygulama sayfaları (panel, proje…) çerezdeki dili kullanır, önek almaz.
- Tercihi İngilizce olan **insan** ziyaretçi öneksiz sayfadan `/en`’e 307 ile yönlenir; botlar yönlendirilmez (Google her dili ayrı adreste görsün).
- Herkese açık sayfa bağlantıları `@/components/l-link` ile verilir (dile göre /en ekler). Yeni herkese açık sayfa: `PUBLIC_PATHS` (seo.ts) + `PAGE_SEO` (seo-pages.ts) + `generateMetadata() { return pageMeta("/yol") }` + gerekirse JSON-LD + sitemap.
- Blog yazılarının İngilizcesi `blog/en-*.ts` (ayrı İngilizce adres); `postPath(post, locale)`. Paylaşım görseli `/api/og?t=&s=&l=`.
- Sahte puan/yorum (aggregateRating/review) yapılandırılmış veriye eklenmez.
- D107: `<title>` `fitTitle` ile ≤60 karakter (sığarsa “| Academiana” eklenir; gerekirse blogda `seoTitle`); meta açıklama ≤160 (tests/seo-quality.test.ts denetler). Araç sayfalarında rehber + SSS (`lib/tools/guides.ts`, WebApplication + FAQPage şeması). Blog RSS: `/blog/rss.xml`, `/en/blog/rss.xml`. Site haritası lastmod: `SITE_CONTENT_UPDATED` (seo.ts) — herkese açık sayfa metinleri değişince güncelle. Oturumlu ve teknik sayfalar noindex.
