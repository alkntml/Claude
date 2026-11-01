# Teknik Kararlar

Her karar: ne, neden, alternatifler. Yeni karar alındığında sona ekle.

### D1 — Next.js App Router + Supabase + Vercel
Tek kod tabanında arayüz ve API; Supabase Auth/Postgres/Storage/RLS hazır; Vercel'de `main`'e push ile otomatik yayın. Ayrı backend servisi gereksiz bulundu.

### D2 — Atıflar metin değil, düğüm
Editörde atıf `{ type: "citation", attrs: { ids, locator, narrative } }`. Görüntü `CitationEngine` ile anlık üretilir. Neden: stil değişince tüm metin ve kaynakça otomatik dönüşür; numaralı stillerde sıra bütün bölümlerde hesaplanır; silinen kaynağa atıf tespit edilir. AI `[[kaynak:S3]]` yazar; kısa kimlikler istek başına `sourceMap` ile gerçek uuid'lere çevrilir, listede olmayan kimlik `[KAYNAK DOĞRULANAMADI]` olur.

### D3 — Atıf motoru kendi kodumuz (citeproc/CSL değil)
9 stil, yaygın kaynak türleri, TR/EN terimler, deterministik ve testli. CSL stil dosyalarını paketlemek ağır ve dış bağımlılık. Bedel: uç durumlar ve Chicago notlu sistem yok. Gerekirse ileride citeproc-js eklenebilir.

### D4 — Erişim seviyesi üç kademe ve yalnızca sunucu yükseltir
`metadata` / `abstract` / `full_text`. İstemci `full_text` atayamaz. AI bağlamında her kaynağın seviyesi ve doğrulama durumu yazılı; doğrudan alıntı yalnızca tam metin parçalarından.

### D5 — Doğrulama: Crossref → DataCite, PMID → Europe PMC, arXiv API
Başlık Jaccard benzerliği ≥ 0,6 ise `verified`. Doğrulanan kayıttan eksik künye tamamlanır.

### D6 — RAG için Postgres tam metin araması (embedding yok)
`source_chunks.tsv` + `search_project_chunks` (security invoker, RLS uygulanır). Ek servis/maliyet yok. Anthropic embedding sunmuyor; ileride pgvector + Voyage eklenebilir.

### D7 — Sağlayıcıdan bağımsız AI katmanı ve model katmanları
`AiProvider.stream()`; Anthropic resmi SDK, OpenAI REST. Paket → katman eşlemesi (`free: fast`, `basic: balanced`, `pro: default`, `premium: premium`) ve fiyat tablosu `app_settings`'te; yönetici panelinden değişir (30 sn önbellek). Temperature gönderilmez (yeni API'de 400), `output_config.effort` kullanılır. Opus/Sonnet'te sunucu taraflı güvenlik yedeği `fallbacks: "default"`.

### D8 — Asistanın kendi literatür araştırması (Haiku karar verir)
Her uygun sohbet mesajında hızlı model JSON şemasıyla `needsSearch` + sorgular üretir; gerekirse arama yapılır, en iyi 8 kaynak (DOI/özet önceliği) doğrulanıp projeye **otomatik eklenir**, ardından ana model yanıtı yazar. Neden: kullanıcı "kaynakları sen bul" beklentisinde; anahtar kelime eşleştirme kırılgandı. Bedel: mesaj başına ~2-5 sn ve ~0,0005$. Karar adımı ayrı AI isteği sayılmaz (`quantity: 0`), token/maliyet kaydedilir. Seçili metin düzenleme ve veri yorumlama eylemlerinde çalışmaz. Kullanıcı istemediği kaynağı silebilir.

### D9 — Sistem talimatı: listede olmayan eser adı anılmaz
Canlı testte model notlarda gerçek ama listede olmayan bir eser önerdi. Kural 8 eklendi; ek kaynak gerekiyorsa "Literatür araştır" önerilir.

### D10 — Hız sınırı veritabanı tabanlı
`usage_events` son 60 sn sayımı. Birden çok sunucu örneğinde tutarlı; Redis gerekmez. Yüksek trafikte Upstash'e geçilebilir.

### D11 — Uzun işler için `after()` (kuyruk değil)
Tam metin analizi yanıt döndükten sonra arka planda; durum `sources.fulltext_status`, istemci yoklar. Basit ve ek servis yok. Kalıcı/yeniden denenebilir kuyruk ileride.

### D12 — Profil ayrıcalık koruması tetikleyicisi
Kullanıcı kendi `role/plan_id/is_suspended/email` alanlarını değiştiremez. `auth.uid()` boşsa (SQL Editor, migration, service role) izin verilir; aksi hâlde ilk yönetici SQL Editor'den atanamıyordu (PGlite testi yakaladı).

### D13 — Danışman paylaşımı token + service role ile çözülür
`project_shares` tablosuna anonim erişim yok; token (24 bayt base64url) sunucuda çözülür, veri açık `project_id` filtresiyle okunur. Yorumlar paylaşım başına günde 60 ile sınırlı.

### D14 — Ödeme sağlayıcı arayüzü
Stripe REST ile (SDK yok), Checkout'ta dinamik `price_data` (Stripe'ta önceden ürün gerekmez), imza doğrulamalı webhook. iyzico yalnızca iskelet (`implemented: false`); arayüz "uygulanmadı" der, sahte akış yok.

### D15 — PDF için gömülü DejaVu Serif
pdfkit standart fontları Türkçe karakterleri (ğ, ş, ı, İ) desteklemiyor. `assets/fonts` + `outputFileTracingIncludes`.

### D16 — Bölge: Frankfurt
Supabase eu-central-1 ve Vercel fra1. KVKK açısından AB'de veri, Türkiye'ye yakınlık, sunucu-veritabanı aynı bölge.

### D17 — Supabase anahtar adları için geriye uyumluluk
Kod hem `ANON_KEY/SERVICE_ROLE_KEY` hem yeni `PUBLISHABLE_KEY/SECRET_KEY` adlarını okur (Vercel entegrasyonu hangisini verirse).

### D18 — Tek seferlik kurulum dosyası
`supabase/setup.sql` = tüm migration'ların birleşimi; teknik olmayan sahip tek yapıştırmayla kurabilsin diye. Yeni migration eklenince yeniden üretilir; canlıya yalnızca yeni migration çalıştırılır.

### D19 — Demo: gerçek bileşenler + tarayıcı içi mock API
claude.ai Artifact CSP'si dış API'leri ve indirmeyi engellediği için demoda AI/arama/dışa aktarma kapalı ve açıkça belirtiliyor. Örnek kaynaklar yalnızca künyesinden emin olunan gerçek eserler; özet eklenmedi.

### D20 — Next.js 15.5.28
15.5.4'teki güvenlik açığı nedeniyle Vercel yayını engelleyebiliyordu; yükseltildi. Sürüm seçerken en az iki haftalık, kullanımdan kaldırılmamış yamalar tercih edilir.

### D21 — Desteksiz kesin iddia yazılmaz; eksik konular için ikinci arama
`[KAYNAK GEREKLİ]` yer tutucusu kullanıcıyı rahatsız etti ("net şeylere kaynak gerekir"). Yeni ilke: model listede desteği olmayan olgusal iddiayı yazmaz (cümleyi çıkarır veya çerçeveleyici ifadeye çevirir) ve bu konuları gizli `:::eksik` bloğunda en fazla 4 İngilizce sorgu olarak bildirir. Yanıt bitince sunucu bu sorgularla veri tabanlarında arar, en iyi 6 kaynağı doğrulayıp ekler (`gap_sources` SSE olayı); arayüz "Taslağı yeni kaynaklarla güncelle" düğmesi sunar. Bulunamazsa konu listesi kullanıcıya gösterilir. Sistem talimatı migration `20261102000005_no_placeholder_claims.sql` ile güncellendi. Bedel: eksik konu varsa mesaj başına ek arama süresi ve kaynak tarama hakkı.

### D22 — Çok dillilik: Türkçe anahtar + İngilizce sözlük, ülkeye göre varsayılan
Kütüphane yerine hafif `t("Türkçe metin")` (gettext tarzı). Türkçe kaynak metin anahtar olduğu için kod okunur kalır ve eksik çeviri Türkçeye düşer. Sözlük `src/i18n/en.ts`; `tests/i18n.test.ts` koddaki her `t("…")` için İngilizce karşılık olduğunu denetler. Varsayılan dil middleware'de `x-vercel-ip-country` başlığından belirlenir (TR veya bilinmiyor → Türkçe, diğer ülkeler → İngilizce) ve `lang` çerezine yazılır; kullanıcı TR/EN düğmesiyle değiştirir (çerez 1 yıl). API hata mesajları `route()` sarmalayıcısında çevrilir. Yönetim paneli yalnızca Türkçe. Kullanıcı içeriği (bölüm başlıkları, metin) çevrilmez; yeni projede aşama başlıkları arayüz dilinde oluşturulur.

### D23 — Mobil çalışma alanı: alt gezinme çubuğu
Mobilde üç sütun yerine tek panel + alt çubuk (Bölümler, Metin, Asistan, Kaynaklar, Diğer). İkincil işlemler (atıf stili, kalite, paylaşım, ayarlar, dil) "⋯" alt sayfasında (portal ile; `backdrop-blur` sabit konumlu çocukları bozduğu için). Araç çubuğu tek satır yatay kaydırmalı, asistan giriş kutusu içeriğe göre büyür ve gönder düğmesi içinde.

