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

Aşağıdakiler bilinçli olarak yapılmadı veya doğrulanamadı:

1. **Canlı entegrasyon testleri:** Geliştirme ortamında akademik API'lere ağ erişimi yoktu. Adaptörlerin ayrıştırıcıları belgelenmiş yanıt şemalarıyla birim testlerinden geçti, ancak canlı çağrılar (OpenAlex, Crossref vb.), Anthropic API, Supabase RLS politikaları ve Stripe akışı gerçek bir ortamda uçtan uca test edilmedi. Yayına almadan önce bir staging ortamında doğrulanmalıdır.
2. **iyzico:** Uygulanmadı (`implemented: false`). Abonelik ürün/fiyat planı referansları ve imzalama (HMAC) eklenmelidir.
3. **İntihal:** Entegre değil. Lisanslı bir servis (ör. iThenticate/Turnitin API) bağlanana kadar yüzde gösterilmez.
4. **Asenkron görevler:** Tam metin içe aktarma ve AI incelemeleri istek içinde çalışır (`maxDuration`). Yüksek trafikte bir iş kuyruğuna (Inngest, QStash, Supabase Queues) taşınmalıdır.
5. **Anlamsal arama:** RAG şu an anahtar kelime tabanlıdır (Postgres FTS). `pgvector` ile anlamsal arama eklenebilir.
6. **Atıf stilleri:** Chicago ve Turabian için yazar-tarih sistemi uygulanmıştır (notlu kaynakça sistemi yok). Vancouver/AMA'da dergi adı kısaltmaları uygulanmaz. Stiller yaygın kaynak türlerini (makale, kitap, bölüm, tez, bildiri, ön baskı, rapor, web) kapsar; uç durumlar için CSL (citeproc) entegrasyonu düşünülebilir.
7. **Şablonlar:** Kılavuzdan çıkarılan yazı tipi, punto ve satır aralığı DOCX çıktısına uygulanır. Kullanıcının yüklediği `.dotx` şablonunu doğrudan kullanma özelliği yoktur.
8. **PDF içindekiler:** Sayfa numarası içermez (yer imleri vardır). DOCX içindekiler tablosu Word'de açılışta güncellenir.
9. **Gerçek zamanlı ortak çalışma:** Yok. Yorumlar tek kullanıcılıdır; danışman paylaşımı ileride eklenebilir.
10. **Arayüz dili:** Yalnızca Türkçe. Çalışma dili Türkçe veya İngilizce olabilir ve atıf terimleri buna göre değişir (vd./et al., s./p.).
11. **Yedekleme:** Supabase'in yönetilen yedeklerine güvenilir. Üretimde Point-in-Time Recovery (ücretli plan) etkinleştirilmelidir.
12. **KVKK metinleri:** `/gizlilik` ve `/kosullar` şablondur ve hukuki inceleme gerektirir.
