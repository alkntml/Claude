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

### D24 — Kaynak taraması bölüm/alt başlık bazında; yazmadan önce tam metin okunur; sayfa numarası yayındaki sayfa
Önceki karar adımı projenin toplam kaynak sayısına bakıyordu (≈5 kaynaktan sonra yeni arama yapılmıyordu). Artık Haiku'ya projenin toplamı değil, bu istek/bölüm/alt başlıkla ilgili görünen en fazla 15 kaynak, bölümün alt başlıkları ve "toplam sınır değildir" bilgisi verilir; yeni bir alt konu kapsanmıyorsa yeniden arar (her aramada en fazla 8, proje başına üst sınır 150). Bağlama en alakalı 40 kaynak girer; bölümde zaten atıf yapılanlar her zaman dahil.
Yazımdan önce bu istekle en ilgili, açık erişimli ve henüz okunmamış en fazla 6 kaynağın tam metni paralel okunur (en fazla 15 sn beklenir; kalanlar arka planda biter). Tam metin parçalarındaki sayfa ipucu PDF sırası değil yayındaki sayfadır (`pdfPageLabels`: künyedeki aralık PDF sayfa sayısıyla eşleşirse; bir fazla sayfa = kapak; eşleşmezse sayfa verilmez). Model sayfayı yalnızca parçada yazandan alır; biçimi (p./s./pp.) atıf motoru stile göre üretir.
Kaynakça yalnızca metinde atıf yapılan kaynakları içerir (APA/MLA vb. kuralı); kaynak eklenince değil, metinde atıf yapılınca kaynakçaya girer ve anında güncellenir. Kaynakçada her kaydın kullanıldığı yerler (`citationUsages`) gösterilir; "Git" bölümü açıp atfı vurgular. Veritabanı değişikliği gerekmedi.

### D25 — Kullanıcı deneyimi paketi (kuyruk olmadan)
Uzun işler (alt başlıklarla yazım, toplu yer tutucu düzeltme, matris) sunucuda tek uzun istek yerine **istemcinin sırayla gönderdiği kısa isteklerle** yürütülür: Vercel süre sınırına takılmaz, ilerleme her adımda görünür, kullanıcı durdurabilir. Kalıcı iş kuyruğu kullanıcı isteğiyle yapılmadı; sayfa kapanırsa sıradaki adımlar çalışmaz.
- Sohbet akışı `phase` olayları gönderir (plan/search/verify/read/write/gaps); arayüz adım çubuğu gösterir. Ortak istemci `src/lib/ai/chat-client.ts`.
- Atıf doğrulama (`/api/sources/[id]/evidence`): Haiku iki dilde anahtar kelime üretir, tam metin parçaları sıralanır (atıftaki sayfaya ek puan), ikinci çağrı supports/partial/not_supported/insufficient kararı verir. Model alıntısı kaynak metninde birebir yoksa gösterilmez. Künye düzeyindeki kaynakta AI çağrılmaz.
- [KAYNAK GEREKLİ] düzeltme: paragraftaki mevcut atıflar ⟦C1⟧ işaretine çevrilip `fix_claim` eylemiyle gönderilir, dönüşte özgün atıf düğümleri geri konur; paragraf düz metniyle bulunup değiştirilir; her öneri onayla uygulanır.
- Literatür matrisi `sources.summary` (migration 6). Yalnızca okunan özet/tam metinden; boş alan uydurulmaz. Excel için CSV (TR'de `;` ayırıcı, BOM).
- Kapalı erişimli kaynağa PDF bağlama `/api/sources/[id]/attach-file`; yüklenen PDF'lerin sayfa ipuçları da yayındaki sayfaya eşlenir (`remapChunkPages`).
- Biçim şablonu `projects.context.format` (`src/lib/export/format.ts`: 3 hazır şablon, kenar/punto/aralık/girinti/sayfa no, Türk tezi kapak alanları). PDF gömülü DejaVu fontuyla kalır (Times gömülemez).
- Yazım hedefi `context.goal`, günlük kelime kaydı `context.wordLog` bölüm kaydında sunucuda tutulur; ilk kayıtta mevcut metin bu haftaya sayılmaz. Takvim deterministik (AI yok): kalan bölümler haftalara eşit dağıtılır, son hafta düzeltmeye bırakılır.
- Sesle not: tarayıcının Web Speech API'si (ses sunucuya gitmez); `from_notes` eylemi notları akademik metne çevirir.
- Çevrimdışı güvence: kaydedilmemiş bölüm `localStorage`'da; açılışta sunucudakinden yeniyse geri yüklenir; çevrimiçi olunca ve 15 sn'de bir yeniden denenir.
- Pencereler (`Modal`) her zaman `document.body`'ye portal ile çizilir: dönüşümlü/`backdrop-blur` üst öğeler sabit konumu bozuyordu. Üst çubuk `z-30`.
- Limit uyarıları: sohbet `done` olayında %80 üstü kalemler (oturum başına bir kez bildirim) ve panelde şerit.

### D26 — Türk kaynakları: gerçek API + bağlantı, kazıma yok
DergiPark'ın OAI-PMH arayüzü anahtar kelime araması sunmuyor; TR Dizin ve YÖK Tez Merkezi'nin herkese açık arama API'si yok (YÖK Tez kazımaya kapalı). Bu yüzden: yeni `turkiye` sağlayıcısı OpenAlex'te `language:tr` ve `institutions.country_code:tr` filtreleriyle arar (DergiPark/TR Dizin dergilerinin çoğu OpenAlex'te dizinli); DergiPark kayıtları bağlantıdan tanınıp etiketlenir; DergiPark/TR Dizin/YÖK Tez için aynı sorguyla yeni sekme bağlantıları verilir (YÖK Tez sorgu parametresi almadığı için sorgu panoya kopyalanır). Tezler `genre` (master/doctoral/art) ve `archive: "yok"` + `archiveId` ile `sources.verification` JSON'unda saklanır (şema değişikliği yok); APA 7'de "[Yüksek lisans tezi, Üniversite]. YÖK Ulusal Tez Merkezi (Tez No. …)" üretilir. Daha önce tez türü saklanmadığı için tüm tezler "Doktora tezi" görünüyordu; düzeltildi.

### D27 — Kaynak yöneticisi alışverişi: kendi ayrıştırıcımız
BibTeX/BibLaTeX (iç içe parantez, @string, # birleştirme, LaTeX Türkçe karakterleri, kurumsal yazar), RIS (satır devamı) ve CSL-JSON için bağımlılıksız ayrıştırıcı (`src/lib/sources/bib.ts`), gidiş-dönüş testli. İçe aktarmada en fazla 300 kayıt; DOI doğrulaması 8'li eşzamanlılıkla (`mapLimit`), aynı DOI veya ≥0,92 başlık benzerliği atlanır.

### D28 — İstatistik: kendi uygulamamız, bilinen değerlerle test
`src/lib/stats/dist.ts` (Lanczos log-gama, Numerical Recipes eksik beta/gama; t, F, χ², normal) ve `tests.ts` (Student/Welch t + Levene, eşleştirilmiş/tek örneklem t, ANOVA + η²/ω² + Bonferroni, Pearson/Spearman + Fisher z GA, OLS çoklu regresyon + β + VIF, χ² + Cramér V, Cronbach α, Mann-Whitney U, Kruskal-Wallis, SPSS çarpıklık/basıklık). Tablo değerleri ve elle hesaplanmış örneklerle doğrulandı. `apa.ts` APA 7 tablo (Markdown) + TR/EN sonuç cümlesi üretir; p < .001 ve başta sıfırsız gösterim. Yapay zekâ sayı üretmez. Shapiro-Wilk eklenmedi (karmaşık ve hataya açık); normallik için çarpıklık/basıklık ±1,5 ölçütü kullanılır ve kaynağın projeye eklenmesi gerektiği notu verilir.

### D29 — Sunum, Abstract, etik, dergi
Savunma sunumu: model yalnızca çalışma metninden JSON slayt planı üretir, `pptxgenjs` ile .pptx; atıflar [[kaynak:Sn]] → gerçek künyeye çevrilir, listede olmayan atıf silinir, son slayt(lar)da yalnızca kullanılan kaynakların kaynakçası. Özet/Abstract, etik kurul belgeleri, ön yazı ve dergi kılavuzu kontrol listesi asistan eylemleri (bilinmeyen bilgiler [DOLDURULACAK]); bu eylemlerde diğer bölümlerden 3500 karakter bağlama girer. Dergi önerisi yapay zekâdan değil, OpenAlex'te benzer makalelerin yayımlandığı dergilerden (son 6 yıl, Türkçe yayınlar dahil) çıkarılır; h-endeksi ve DOAJ bilgisi `/sources` uç noktasından.

### D30 — Büyüme: kurum lisansı, öğrenci indirimi, davet, uzman desteği
- Kurumlar `organizations` + `organization_members` (kullanıcı başına tek kurum). Katılma/ayrılma sunucuda service role ile ve açık kontrollerle (koltuk, alan adı, süre, e-posta doğrulaması). Etkin paket = kişisel ve kurum paketinin yükseği (`getSession`). Kurum yöneticisi üyelerin yalnızca kullanım sayılarını görür (içerik/başlık yok).
- Davet: `profiles.referral_code` (tekil, 8 hane), kayıtta `raw_user_meta_data.ref` ile `referred_by`; e-posta doğrulanınca (geri dönüş veya ilk panel ziyareti) önce `referral_rewarded_at` koşullu güncellenir (çift ödül yok), sonra `usage_credits` yazılır; davet edene aylık üst sınır. Krediler süresi dolana kadar aylık limite eklenir (`effectiveLimits`). Kullanıcı davet alanlarını değiştiremez (tetikleyici).
- Öğrenci indirimi: doğrulanmış e-posta + alan adı listesi (`billing.student`), ödeme sayfasında fiyat sunucuda düşürülür.
- Uzman desteği insan hizmeti olarak dermanlik.com.tr'ye UTM'li bağlantıyla yönlendirilir; kişisel veri gönderilmez.


### D31 — SSS ve abonelik iptali
- SSS içeriği tek kaynaktan (`src/lib/faq.ts`, TR/EN) hem `/sss` hem ana sayfada kullanılır; cevaplar platformun gerçek davranışını anlatır, vaat içermez (ör. AI tespitini atlatma vaadi yok, intihal oranı yok).
- “Kim görür” cevabı platform yöneticisinin teknik erişimini açıkça söyler (yalnızca destek, güvenlik, yasal zorunluluk). Yönetici erişimi kaldırılırsa bu cevap da güncellenmeli.
- İptal cevabının doğru olması için Stripe müşteri portalı eklendi; Stripe panelinde Customer portal etkinleştirilmelidir.

### D32 — Google / Apple ile giriş
- Supabase OAuth kullanılır; düğmeler Supabase `/auth/v1/settings` yanıtına göre yalnızca etkin sağlayıcılar için gösterilir (yapılandırılmamış düğme hata vermesin).
- Kayıt sayfasında sosyal giriş de KVKK/koşullar onayı ister; giriş sayfasında ilk girişin hesap açacağı ve onay anlamına geldiği yazılır.
- Davet kodu OAuth’ta meta veriyle taşınamadığından geri dönüş adresindeki `ref` ile, yalnızca 15 dk içinde açılmış ve davet edeni boş hesaplara bağlanır.

### D33 — Yazı tipleri
- Başlıklar ve editör metni: Source Serif 4 (optik boyutlu, latin-ext); serif + font-medium başlıklar CSS ile yarı kalın ve sıkı aralıklı. Arayüz metni: Inter. Amaç akademik yayın hissi.

### D34 — Tekrar önleme
- Üç katman: (1) OUTPUT_PROTOCOL’de üslup/tekrar kuralları, (2) deterministik analizle bulunan sık kalıplar ve cümle başlangıçları bağlama “TEKRARDAN KAÇIN” listesi olarak eklenir (teknik terimler hariç; proje başlığı/anahtar kelimeleri sayılmaz), (3) üretim sonrası deterministik kontrol: taslakta uyarı + `reduce_repetition` eylemi, kalite raporunda bölüm içi tekrar.
- Otomatik ikinci yazım turu yapılmadı (maliyet ve süre); düzeltme kullanıcının tek tıkıyla.

### D35 — Proje önerisi türü
- Yeni `work_type` değeri `grant_proposal` (enum’a migration 8 ile eklendi). Bölüm düzeni TÜBİTAK ARDEB formlarının genel yapısına göre; program ayrıntıları (kelime/bütçe sınırları) uydurulmaz, kullanıcıya çağrı duyurusunu kontrol etmesi söylenir. Burs önerisinde bütçe bölümü yok.

### D36 — Hakem cevabı ve savunma provası
- Hakem cevabı mevcut sohbet akışında bir eylem (`reviewer_response`); yorumlar `selection` alanıyla gider, bağlam “wholeWork” (diğer bölümler 3500 karakter). Yapılmamış değişiklik [YAPILACAK] ile işaretlenir.
- Savunma provası ayrı uç (`projects/[id]/defense`), JSON şemalı iki çağrı (sorular / değerlendirme); yalnızca çalışma metnine dayanır. Ses tarayıcıda yazıya çevrilir.

### D37 — Grafikler
- Değerler sunucuda deterministik hesaplanır (`stats/charts.ts`), çizim saf SVG (`charts/svg.ts`), tarayıcıda 2× PNG’ye çevrilip editörde `figure` düğümü (yalnızca `data:image/png;base64`) olarak saklanır. Dışa aktarımda PNG başlığı doğrulanır, dış adres kabul edilmez.

### D38 — Anketler
- Cevaplar yalnızca service role ile yazılır (herkese açık uç `public/survey/[token]`); RLS’te kullanıcı/anonim insert yok. IP/e-posta tutulmaz. Kötüye kullanım: bal küpü, <3 sn gönderim, anket başına 10 sn’de 30 cevap sınırı. Cevap gelmeye başlayınca soru yapısı kilitlenir (kopya önerilir). CSV `;` + BOM (Türkçe Excel), formül enjeksiyonu engeli. Projeye aktarımda ters maddeler kodlanır.

### D39 — Konu bulma
- İstatistikler OpenAlex group_by ile (yıl, topics.id); öneriler yalnızca bu sayılara/başlıklara dayanır, “balanced” model. Kaynak tarama hakkından 1 düşer; öneri için ayrıca 1 AI isteği.

### D40 — Adım adım akış
- Başlık seçimi ilk adım: seçilmediyse çalışma alanı açılışında öneri penceresi (yapay zekâ, “balanced”); “sonra” denirse o cihazda tekrar otomatik açılmaz, sol panelde “Adım 1: Başlık seç” kalır. Seçim `projects.context.titleChosen` ile saklanır (migration gerekmez).
- Yazım sırası yol haritası sırasıdır; `title_abstract` ve `grant_summary` en sona alınır (`lib/workflows/order.ts`). Bölüm tamamlama mevcut `status = done` alanını kullanır; yeni durum alanı eklenmedi.

### D41 — Bölüm tamamlama kontrolü
- `stages/[id]/review`: bu bölüme ait kural sonuçları (runQualityChecks tek bölümle) + “balanced” modelle amaç/kurallar/başlık uyumu incelemesi (JSON şema). Kural hatası (ör. [KAYNAK GEREKLİ]) yapay zekâ “ok” dese bile kararı düşürür. AI limiti/hatasında yalnızca kurallar gösterilir. Kullanıcı her durumda “Yine de tamamlandı işaretle” diyebilir (karar kullanıcının).
- (Güncelleme, kullanıcı kararı) Bölüm kontrolü tüm paketlerde “fast” (Haiku) modelle yapılır. Ücretsiz ve Basic pakette aylık yapay zekâ hakkından düşmez (`quality_check` olarak token/maliyetle kaydedilir, günde 40 sınırı); Pro ve Premium’da normal yapay zekâ isteği sayılır. Yönetim paneli maliyetleri `quality_check` kayıtlarını da içerir.

### D42 — PWA
- Servis çalışanı yalnızca uygulama kabuğunu ve `/offline` sayfasını önbelleğe alır; sayfalar ağdan gelir, `/api/` ve kullanıcı verisi hiç önbelleğe alınmaz (gizlilik + güncellik). `_next/static` karmalı dosyalar önbellekten. `sw.js` no-cache başlığıyla sunulur.
- Permissions-Policy’de mikrofon `self`: önceki `microphone=()` tarayıcının konuşma tanımasını engelliyordu.

### D43 — Marka ve alan adı
- Ad “Academiana”, resmî adres `https://www.academiana.com.tr` (Vercel’in varsayılanı www birincil). Sabitler `src/lib/site.ts`; `env.appUrl` üretimde NEXT_PUBLIC_APP_URL yoksa SITE_URL’e düşer.
- Eski vercel.app yönlendirmesi ortam değişkeniyle (`REDIRECT_TO_DOMAIN=1`) açılır; DNS doğrulanmadan açılırsa site erişilemez olurdu. API yönlendirilmez (webhook’lar bozulmasın).
- Yerel depolama anahtarları (`akademi:*`) kullanıcı ayarları kaybolmasın diye değiştirilmedi.

### D44 — Blog
- İçerik kodda (TS dosyaları), veritabanında değil: sürümlenir, statik üretilir, SEO için hızlıdır. Yeni yazı = `src/lib/blog/posts-*.ts`’e bir nesne; `tests/blog.test.ts` biçimi denetler.
- Yazılar yalnızca Türkçe; dış bağlantı yok (yalnız site içi). Kurallar/üst sınırlar gibi değişebilen bilgiler “kurumunuzun güncel yönergesine bakın” biçiminde, rakam uydurmadan yazıldı. “İntihalden kurtulma” konusu atlatma değil önleme olarak ele alındı.

### D45 — Çok dilli SEO
- Aynı adreste çerez/ülkeye göre dil değiştirmek arama motorları için yanlıştı (Googlebot ABD’den gelir → Türkçe sayfalar İngilizce dizinlenirdi). Çözüm: dil adreste (`/en` öneki), hreflang ile eşleştirme, x-default Türkçe.
- Coğrafi yönlendirme yalnızca insanlara (307) ve yalnızca herkese açık sayfalarda; botlar ve açık /en adresleri yönlendirilmez. Dil düğmesi sayfadaki hreflang bağlantısına gider.
- FAQPage verisi eklendi; ancak Google 2023’ten beri SSS zengin sonuçlarını çoğu site için göstermiyor. Asıl kazanç: BlogPosting/Breadcrumb, Organization/logo, site bağlantıları ve iki dilli dizinleme. HowTo ve puan (rating) kullanılmadı (kaldırıldı / sahte veri olurdu).
- Blog İngilizce yazıları çeviri değil uyarlama; İngilizce adres (ör. how-to-write-a-thesis) İngilizce aramalar için.

### D46 — Sayfa hızı
- `getSession` istek başına `cache()` ile bir kez çalışır; profil ve kurum sorguları paralel.
- Ara katman `/api` isteklerinde ve oturum çerezi olmayan ziyaretçilerde Supabase’e gitmez; oturum varsa `getUser` yerine `getClaims` (JWT yerel doğrulama).
- Herkese açık sayfalar giriş durumunu yalnızca çerezden anlar (`hasAuthCookie`), veritabanına gitmez. Paket listesi 5 dk önbellekte (`unstable_cache`, etiket `plans`; yönetim panelinde değişince yenilenir).
- Çalışma alanındaki pencereler (`next/dynamic`) ihtiyaç anında yüklenir.
- İngilizce sözlük (`en.ts`, ~180 KB) istemci paketinden çıkarıldı: istemci `@/i18n/core` (sözlüksüz) kullanır, sözlük yalnızca İngilizce sayfalarda kök düzenden `I18nProvider`’a prop olarak gelir. İstemci bileşeninde `makeT`/`@/i18n` içe aktarma; `useT()` kullan.
- Sonuç: `/proje/[id]` 438 → 360 kB. Tam statik herkese açık sayfalar daha büyük bir yeniden yapılanma gerektirir (henüz yapılmadı).

### D47 — Model işe göre seçilir, pakete göre değil
- Kullanıcı kararı: basit işler Haiku, orta işler Sonnet, karmaşık işler Opus; paket fark etmez. Paketler yalnızca kota/limitte ayrışır.
- Asistan eylemleri: `ACTION_TIER` (`src/lib/ai/prompts.ts`). Basit (Haiku): kısalt, akademik dil, tekrar azaltma, notlardan metin. Orta (Sonnet): sohbet, plan, bölüm yazımı, genişlet, yeniden yapılandır, özet/abstract, kaynakla düzelt, etik belgeler, ön yazı, araştırma soruları. Karmaşık (Opus): literatür sentezi, yöntem, hipotez, bulgu yorumu, tartışma, tutarlılık, hakem cevabı, dergi kılavuzu.
- Diğer: Haiku → araştırma planı, matris, kanıt, bölüm kontrolü; Sonnet → başlık, konu bulma, kılavuzdan bölüm önerisi, sunum; Opus → kalite raporu, savunma provası.
- `resolveModel(planId, tier)` artık katmanı zorunlu alır; `plan_tiers` ayarı kaldırıldı (veritabanında kalan değer yok sayılır).
- Not: Paket özellik listelerindeki “Öncelikli modeller / En güçlü modeller” ifadeleri artık geçerli değil; yönetim panelinden güncellenmeli (TODO).

### D48 — Paketler yeniden düzenlendi; ödeme WhatsApp üzerinden
- Kullanıcı kararı (2026-11-02): Ücretsiz 20 AI isteği / 7 tarama; Basic ₺499, 3 proje, 150 istek, 100 tarama; Pro ₺899, 10 proje; Premium ₺1.499. Yıllık fiyat = aylık × 10 (arayüzde gösterilmiyor). Migration 9.
- Ödeme altyapısı kaldırıldı: `api/billing/checkout|portal|webhook` silindi; `src/lib/payments` ve testleri ileride yeniden açmak için duruyor. “Yükselt” → `whatsappLink()` (`src/lib/pricing.ts`, 0542 526 66 50); mesajda mevcut paket, istenen paket, fiyat ve hesap e-postası var. Yönetici ödemeyi aldıktan sonra paketi Yönetim → Kullanıcılar’dan elle tanımlar.
- Öğrenci indirimi tamamen kaldırıldı (ayar, panel, kayıt notu, SSS). Yerine **Akademik Ekip İndirimi** %20 (`TEAM_DISCOUNT`, en az 3 kişi; akademisyen grupları, araştırma ekipleri, laboratuvarlar, bölümler); talep WhatsApp’tan, elle uygulanır.
- Bir “Literatür araştır” en fazla 4 sorgu = 4 tarama sayar; ücretsiz paketin 7 taraması ≈ 2 araştırma.

### D49 — Paket kartlarında özellikler; kullanım sınırları yalnızca yükseltirken
- Kullanıcı kararı: paket kartları yapay zekâ isteği sayısı değil özellik listesi gösterir; sınırlar aynen uygulanır ama kullanıcı ancak yükseltme gerektiğinde görür.
- Özellik kilitleri `src/lib/features.ts` (`FEATURE_MIN_PLAN`), sunucuda `assertFeature` (402 `feature_locked`). Basic: kalite raporu (YZ), istatistik + grafik, anket, konu bulma, Zotero/Mendeley/EndNote. Pro: literatür matrisi, dergi önerisi + kılavuz kontrolü, yazım kılavuzu önerisi, hakem cevabı, savunma sunumu + provası. Premium: sınırsız proje, en yüksek kullanım, 15 GB, öncelikli destek. Mevcut veriler (ör. eski anketler) okunabilir kalır; yalnızca yeni kullanım kilitlenir.
- Sınırlar `UpgradeDialogHost` (kök düzen) penceresinde gösterilir: 402 `limit_*`/`feature_locked` cevabında veya Hesap → “Yükselt”te açılır; veri `/api/account/plans` (yalnızca giriş yapmış kullanıcı). WhatsApp mesajına paket sınırları da yazılır.
- Hesap ve panelde yapay zekâ isteği/token satırları kaldırıldı; %80 uyarısı sayı vermeden “sonuna yaklaşıyorsunuz” der. Kaynak tarama, proje, depolama sayıları görünür kalır.
- Şeffaflık: Fiyatlar sayfasında “aylık adil kullanım sınırları uygulanır; sınırlar paket yükseltirken gösterilir” notu var (satın alma öncesi bilgilendirme). Migration 10 özellik listelerini yazar.

### D50 — Çalışma kilidi (aylık hak dolunca)
- Kullanıcı kararı: tüm paketlerde aylık limitlerden biri (yapay zekâ isteği, token, kaynak tarama) dolunca çalışma kilitlenir; metin ve kaynaklar buğulu, düzenleme ve tüm indirmeler kapalı. Seçenekler: “Mevcut çalışmayı indir — 100 TL” (WhatsApp, `DOWNLOAD_PRICE_TL`) veya abonelik (yükseltme penceresi).
- Üç katman: (1) Veritabanı: `profiles.work_locked` (yalnızca sunucu değiştirir; koruma tetikleyicisine eklendi) + içerik tablolarında kısıtlayıcı RLS (`work_locked()`), böylece istemci anahtarıyla doğrudan sorgu da boş döner; (2) Sunucu: `assertWithinLimits`/`assertProjectQuota`/`assertNotLocked` 402 `work_locked`; `getWorkLock()` (lib/lock.ts) sayfa yüklemesinde bayrağı eşitler (yeni ay / paket yükseltme → kalkar); (3) Ekran: `LockedProject` — metin ve kaynaklar sunucuda `scramble.ts` ile anlamsız harflere çevrilip gönderilir (asıl içerik sayfada yoktur), üstüne CSS buğu.
- Danışman paylaşım bağlantısı kilitliyken içerik göstermez. Kalite sayfası çalışmaya yönlenir.
- İndirme hakkı: yönetici ödemeyi alınca Yönetim → Kilitler’den çalışma koduyla `download_passes` tanımlar (varsayılan 7 gün); dışa aktarma ve kaynak dosyası (BibTeX/RIS) bu hakla açılır, sunucu içerik okumayı service role ile açık user_id filtresiyle yapar.
- KVKK: kilitliyken anında “Verilerimi indir” yerine `data_requests` talebi oluşturulur; yönetici Kilitler sekmesinden JSON indirip 30 gün içinde ücretsiz iletir (yasal zorunluluk; ücret alınamaz).
- Şeffaflık: SSS ve Kullanım Koşulları kilit kuralını, 100 TL seçeneğini ve KVKK hakkını açıkça yazar.

### D51 — Sayaç denetimi ve düzeltmeleri
- Aylık toplam artık veritabanında (`usage_totals` RPC) hesaplanır; önceki kod Supabase API’nin 1000 satır sınırı yüzünden yoğun kullanıcılarda eksik sayıyordu. RPC yoksa sayfalı yedek okuma.
- Dönem Türkiye saatine göre: haklar her ayın 1’i 00:00 TR’de yenilenir (önceden 03:00).
- Proje kotası atlatılamaz: kullanıcıların `projects` tablosuna doğrudan ekleme yetkisi kaldırıldı (sunucu kota kontrolünden sonra service role ile ekler); arşivden çıkarma kotaya tabi ve yalnızca sunucuda (tetikleyici).
- Yarıda kesilen/iptal edilen yapay zekâ yanıtı da 1 istek sayılır (token tahmini metin uzunluğundan).
- Çok sorgulu aramalar kalan tarama hakkına göre kırpılır (ücretsiz pakette 7 hakla 4 sorgu limiti aşmasın).
- Token limitleri istek limitlerinden önce dolmasın diye yükseltildi (migration 13): ücretsiz 800 bin, Basic 6 M, Pro 60 M, Premium 200 M; müşteriyi bağlayan sınır istek sayısıdır.

### D52 — Kârlılık: maliyet gelirin en fazla 1/3’ü
- Kullanıcı kararı: fiyatlar aynı (499 / 899 / 1.499 TL), API maliyeti KDV hariç gelirin 1/3’ü, 2/3 kazanç.
- Ortalama istek maliyeti ≈ 0,07 $ (Haiku/Sonnet/Opus karışımı, ~15 bin giriş + 4 bin çıkış token) ile yeni istek hakları: ücretsiz 10, Basic 40, Pro 75, Premium 125 (migration 14).
- Garanti: görünmez aylık maliyet tavanı `cost_usd_month` = fiyat / 1,2 / kur × 1/3 (Basic ≈ 2,89 $, Pro ≈ 5,20 $, Premium ≈ 8,67 $; ücretsiz 1 $ sabit). `usage_totals` artık `cost_usd` döndürür; tavan dolunca kilit nedeni `cost` (kullanıcıya “yapay zekâ hakkı” olarak görünür). Kur ve pay Yönetim → Ayarlar’da (`billing.margin`); kur ayda bir güncellenmeli.
- Maliyet ve token rakamları istemciye gönderilmez (`forClient`); yalnızca `ai_near` bayrağı.
- Not: Yalnızca pahalı (Opus) işleri kullanan biri tavana istek hakkından önce ulaşabilir; bu, 1/3 oranının garantisi için bilinçli bir tercih.

### D53 — Paket süresi ve genişletilmiş yönetim paneli
- `profiles.plan_expires_at` (yalnızca yönetici/sunucu değiştirir). Süre dolunca `getSession` kullanıcıyı ücretsiz pakete düşürür (kalıcı yazılır, tarih bilgi için kalır). Yönetimde ücretli paket atanınca varsayılan 30 gün başlar.
- Yönetim → Kullanıcılar: filtreler (ücretli, 7 günde bitecek, süresi dolan, kilitli, askıda), bitiş sütunu, ayrıntı penceresi (bu ayki kullanım ve maliyet payı, projeler, paket ata + gün, +7/+15/+30/+90/+365/özel gün, bitiş tarihi, süresiz, ek kullanım hakkı ver). API: `admin/users-list`, `admin/user/[id]` (GET + POST işlemleri).
- Genel bakış: bu ay gelir (KDV hariç) / API maliyeti / kâr / maliyet payı, 7 günde bitecekler, kilitli kullanıcı sayısı. İstatistikler artık sayfalı okunur (1000 satır sınırı düzeltildi).
- Kullanıcı tarafı: Hesap sayfasında bitiş tarihi ve kalan gün; son 3 günde uygulama genelinde uyarı; “Süreyi uzat” WhatsApp.

### D54 — Davet kampanyası hediye kutusu
- Uygulama sayfalarında sağ altta sabit hediye düğmesi (`components/gift-box.tsx`): görülmediyse veya yeni ödül kazanıldıysa kırmızı bildirim + sallanma; ilk ziyarette kısa baloncuk; açılınca davet bağlantısı, kopyala, WhatsApp, paylaş. Kenar çubuğunda “Davet et, kazan” bağlantısı da açar.

### D55 — Ücretsiz pakette tarama kilidi yok; davet ödülü sayaçları
- Ücretsiz pakette kaynak tarama hakkı dolunca yalnızca tarama kapanır (`limit_search`), çalışma kilitlenmez; kullanıcı diğer özellikleri denemeye devam eder. Yapay zekâ hakkı / maliyet tavanı dolunca kilit yine devreye girer. Ücretli paketlerde değişiklik yok. (`lockReasons(limits, usage, planId)`)
- Davet ödülü zaten otomatikti (onay gerekmez); artık uygulamanın herhangi bir sayfası açıldığında da verilir (yalnızca panel değil). Koşul: davet edilen e-postasını doğrulamış olmalı (sahte hesaplara karşı; Google/Apple ile kayıt otomatik doğrulanmış sayılır). Davet edenin aylık ödül sınırı (`monthly_cap`) sürer; aylık dönem TR saatine göre.
- Yönetim → Davetler: toplam/ödüllü/bekleyen davet, bu ayki ödül ve dağıtılan hak, sınıra takılanlar, en çok davet edenler, son davetler (`admin/referrals`).

### D56 — Üye numarası
- `profiles.member_no` (bigint, GENERATED ALWAYS identity, 1001’den başlar; mevcut kullanıcılara da atanır, kimse değiştiremez). Gösterim `memberCode()` → “AC001234” (`src/lib/member.ts`).
- Kullanıcı numarasını Hesap sayfasında ve sol menüde görür; tüm WhatsApp mesajlarında (yükseltme, 100 TL indirme, süre uzatma, ekip indirimi) “Üye no” satırı vardır.
- Yönetim → Kullanıcılar araması: üye no (AC001234 / ac-1234 / 1234), sistem kimliği (uuid) veya e-posta/ad. Listede “Üye no” sütunu, ayrıntıda üye no.

### D57 — Tanıtım sayfası hızı (ikinci tur)
- Ana sayfa animasyonları framer-motion’dan CSS’e taşındı (`animate-rise`, tailwind keyframes): içerik sunucu HTML’inde görünür gelir, JavaScript beklemez. Sürekli hareket eden 3 büyük `blur-3xl` top ve kaydırmaya bağlı parallax kaldırıldı; yerine sabit radyal geçiş. `backdrop-blur-xl` kartlardan kaldırıldı. `prefers-reduced-motion` desteklenir.
- `FadeIn` artık `components/ui/fade-in.tsx` (sunucu bileşeni, framer yok); başlık (site-header) ve çalışma türü kartları da framer’sız.
- Sonuç: `/` 176 → 131 kB, `/blog` 152 → 112 kB, `/fiyatlar` 161 → 117 kB (ilk yükleme JS).
- Ara katman tanıtım sayfalarında Supabase oturum yenilemesi yapmaz (giriş yapmış kullanıcıda her tıklamada ağ isteği vardı).
- `loading.tsx` (kök, (app), proje): sayfa geçişinde anında ilerleme çubuğu + iskelet; Next bağlantıları bu sınıra kadar önceden yükler.

### D58 — Takılmayı gideren üçüncü tur
- Sabit üst menüdeki `.glass` artık backdrop-blur kullanmıyor (kaydırmada her karede yeniden çizim); opak `bg-white/95`. Uygulama mobil üst çubuğunda da aynı.
- “Nasıl çalışır” bölümündeki ve çalışma türü kartlarındaki `blur-*` ışıklar radyal geçişe çevrildi.
- Giriş animasyonları tek bir hafif solmaya indirildi (yalnızca hero); bölüm başlıklarında (`FadeIn`) ve kartlarda animasyon yok. Başlıkta `transition-all` (padding) kaldırıldı.
- Ölçüm (390 px, işlemci 6× yavaşlatılmış): kaydırmada ~54 kare/sn, 3 sn’de 2 uzun kare.

### D59 — İngilizce sayfalarda dolar fiyatı
- Dolar fiyatı TL fiyattan yönetimdeki kurla (`billing.margin.usd_try`) hesaplanır ve yukarı yuvarlanır: `ceil(TL/kur) − 0,01` (48 TL kurla 499 → $10.99, 899 → $18.99, 1.499 → $31.99; 100 TL indirme → $2.99). Kur değişince otomatik güncellenir.
- `formatPrice` / `usdFromTry` (pricing.ts), `getUsdTry` (lib/fx.ts, 1 saat önbellek, `fx` etiketi; kur kaydedilince yenilenir), istemcide `PriceProvider` + `usePrice()` (kök düzen). Fiyat kartları, Hesap, yükseltme penceresi, kilit ekranı, WhatsApp mesajları ve JSON-LD (priceCurrency USD) dile göre.
- Kâr hesabı (maliyet tavanı) TL fiyat üzerinden kalır.

### D60 — Fiyatlar %50 artırıldı, haklar aynı
- Basic 749 TL, Pro 1.349 TL, Premium 2.249 TL (yıllık = aylık × 10); istek/tarama/proje hakları değişmedi (migration 17). Dolar fiyatları kurdan otomatik ($15.99 / $28.99 / $46.99 @48). Ortalama kullanımda maliyet payı ≈ %22’ye düştü; maliyet tavanı (gelirin 1/3’ü) fiyattan hesaplandığı için kendiliğinden yükseldi. 100 TL indirme ücreti değişmedi.

### D61 — Gece / gündüz modu
- `ink` paleti CSS değişkeni (`--ink-50…950`, tailwind `rgb(var(--ink-N) / <alpha-value>)`); `.dark` sınıfında ölçek ters çevrilir, `--bg`/`--surface` koyulaşır. `bg-white*` yüzeyleri, koyu düğmeler (`bg-ink-900/800` → marka mavisi; `bg-ink-950` koyu bant), açık rozetler (brand/emerald/amber/rose/violet-50 ve -700/800/900 yazılar), editör atıf düğümleri ve logo gece modunda `globals.css`’te geçersiz kılınır.
- Tercih `localStorage` (`academiana-theme`); yoksa sistem ayarı. `<head>` içindeki küçük betik ilk boyamadan önce sınıfı koyar (yanıp sönme yok). Düğme: `components/theme-toggle.tsx` (tanıtım başlığı, mobil menü, uygulama kenar çubuğu).
- Yeni bileşen yazarken renkleri `ink-*` ile ver; sabit hex renk kullanma (gece modunda dönmez).

### D62 — Ana sayfa: karşılaştırma, izlenebilirlik demosu, sosyal kanıt
- “Sıradan bir yapay zekâ değil” (`landing/compare.tsx`): Academiana ve “ChatGPT ve genel sohbet botları” 6 madde; rakip logosu kullanılmaz, iddialar ürünün gerçek davranışına dayanır.
- “Her iddianın izi sürülebilir” (`landing/trace-demo.tsx`): atıflar sırayla vurgulanır ve kaynak kartıyla eşleşir, son cümle [KAYNAK GEREKLİ]; yalnızca ekranda görünürken döner, tıklayınca durur; örnek kaynaklar gerçek yayınlar (Bowlby 1969, Hazan & Shaver 1987, Doron vd. 2014). “Her cümle” yerine “her iddia” denildi (geçiş cümlelerinin kaynağı olmaz).
- Hero rozeti “250 milyondan fazla akademik yayını tarar” (OpenAlex ölçeği; “tam metin” denmez, tam metin yalnızca açık erişimde okunur). Kullanıcı istediği “300 milyon tam metin” ve “10.000+ araştırmacı” uydurma/yanıltıcı olduğu için kullanılmadı.
- Sosyal kanıt yalnızca gerçek sayı: `publicUserCount()` (1 saat önbellek) ≥100 ise aşağı yuvarlanmış “{n}+ araştırmacı Academiana ile çalışıyor”; altındaysa gösterilmez.

### D63 — “10.000’den fazla araştırmacı tarafından tercih edildi”
- Sahibinin beyanı: önceki işindeki 10.000’i aşkın araştırmacı müşteri kitlesi bu siteye taşındı. Hero’daki gerçek kullanıcı sayacı (D62) kaldırıldı, sabit ifade yazıldı. `lib/public-stats.ts` kullanılmıyor (ileride gerekirse duruyor). Olası bir şikâyete karşı önceki işin müşteri kayıtlarının saklanması önerildi.

### D64 — Demo’da kaynak doğrulama paneli
- Atıfın veya kaynak kartının üzerine gelince (ya da tıklayınca) kart açılır ve doğrulama adım adım “çalışır”: DOI çözümlendi → Crossref/katalog kaydı eşleşti → (varsa) kaynaktaki pasaj, eşleşen cümle vurgulu; “Kaynağı aç · doi.org” bağlantısı gerçek DOI’ye gider.
- Kullanıcı kararı: pasajlar örnek metin olabilir. Gerçek yazarlara uydurma söz yüklememek için demodaki kaynaklar da kurgusal örnek kaynaklara çevrildi (Kaya 2021, Demir & Aksoy 2022, Lee vd. 2020; DOI’ler `10.xxxx/ornek…`, harici bağlantı yok) ve ekranda “örnek kaynak” / “kaynaklar ve pasajlar temsilidir” diye belirtilir.


### D65 — Kullanıcı kayıtları için gerçek silme
- Ortak `components/ui/delete-button.tsx`: onay sorar, sunucu “silindi” demeden listeden çıkarmaz, hata olursa bildirir. Kullanıldığı yerler: panel çalışma kartları (proje), Kaynaklar → Kayıtlı kaynaklarım, çalışma alanı kaynakları, Dosyalar, Anketlerim listesi, proje hafızası, yorumlar, sürümler (yeni), asistan sohbeti (yeni “Sohbeti sil”).
- Sunucu: tüm silme uçları `assertDeleted()` (lib/api.ts) kullanır; `.delete().select("id")` ile satırın gerçekten silindiği doğrulanır, silinmediyse 404 döner (önceden RLS engellese de “ok” dönüyordu). Dosyada önce depodaki nesne, sonra kayıt silinir (yetim dosya kalmaz).
- Silmeler kalıcıdır (yumuşak silme yok); alt kayıtlar veritabanındaki ON DELETE CASCADE ile kalkar (proje → bölüm, sürüm, yorum, hafıza, kaynak, parça, sohbet, mesaj). Yeni uçlar: `DELETE /api/stages/[id]/revisions`, `DELETE /api/ai/chat?conversationId=`. Migration gerekmedi. PGlite testi eklendi.

### D66 — Anketlerde yapay zekâ desteği
- **Yapay zekâ ile oluştur** (`POST /api/surveys/ai`): amaç, hedef kitle, değişkenler, uzunluk (kısa/orta/uzun), demografik / açık uçlu / onam seçenekleri ve isteğe bağlı bağlı çalışma (konu, anahtar kelimeler, hafızadaki hipotez/değişken notları) → tam anket taslağı kaydedilir; araştırmacıya notlar düzenleyicide bir kez gösterilir.
- **Düzenleyicide asistan** (`POST /api/surveys/[id]/ai`): `revise` serbest talimat + hazır komutlar (geri alınabilir, kaydedilene kadar taslak), `improve` tek soruyu iyileştirir / boş Likert bloğuna madde yazar, `review` hakem gözüyle sorun + önerilen ifade (tek tıkla uygulanır). Cevap almaya başlamış ankette yalnızca inceleme ve metin düzeltmesi (veri sütunları bozulmasın).
- **Hızlı kontrol + tahmini süre** (`surveyLint`, `estimateMinutes`; lib/surveys.ts): kural tabanlı, hak harcamaz.
- İlke: yapay zekâ çıktısı `fromAiQuestions` ile doğrulanır (tür, sınırlar, benzersiz değişken adları). Telifli/geçerlenmiş ölçek maddelerini birebir yazmaz, geçerlik iddia etmez, kimlik bilgisi sorusu üretmez, kaynak uydurmaz; arayüz “maddeler özgün taslaktır” uyarısı gösterir. Model: `balanced` (Sonnet). Paket kilidi `surveys` (Basic+), her çağrı 1 yapay zekâ isteği.

### D67 — Kurgu modülü (çalışmanın başında)
- Çalışmaya başlarken tek ekranda araştırmanın kurgusu: problem, amaç, araştırma soruları/hipotezler, yöntem ve desen, katılımcılar/kapsam, veri toplama, analiz/sentez, özgün katkı + **her aşama için bölüm planı**. Aşamalar değişmez; kurgu yalnızca her aşamada ne yazılacağını tutar (`alignChapters`, kaynakça hariç).
- Öğrenci yapay zekâya kurgulatır (isteğe bağlı kendi fikriyle), “Kendim yazacağım” ile boş başlar, “Farklı bir giriş yap” ile yeniden kurgulatır, tek alanı “Yeniden öner” ile değiştirir (geri alınabilir). Onaydan sonra mevcut akış: başlık → bölümler.
- Saklama: `projects.context.blueprint` (migration yok). Uçlar: `POST /api/projects/[id]/blueprint` (generate: `default`/Opus; field: `balanced`/Sonnet; 1 yapay zekâ isteği), `PUT` (kaydet/onayla).
- Onaylanan (veya taslak) kurgu `buildContext`’e eklenir; üzerinde çalışılan bölümün planı ayrıca verilir. Başlık önerileri de kurguyu kullanır. Kurgu bir plandır: kaynak, bulgu, istatistik içermez; bilinmeyen somut bilgi uydurulmaz.
- Otomatik açılış: henüz hiç yazı yazılmamış ve kurgusu onaylanmamış çalışmada ilk girişte açılır (kapatılırsa o cihazda tekrar açılmaz); sol menüde her zaman “Kurgu” düğmesi var.

### D68 — Kurguda hedef uzunluk ve bölüm başına kelime
- Kurgu: `targetWords` (toplam kelime), `wordsPerPage` (varsayılan 275: A4, 12 pt, 1,5 satır); her bölüm planında `words`. Kelime ↔ sayfa birbirinden hesaplanır.
- Dağıtım `distributeWords` (lib/blueprint.ts): yapay zekânın önerdiği oranlar > mevcut oranlar > varsayılan akademik ağırlıklar (literatür/kuram, bulgular, tartışma uzun; giriş, amaç, sorular kısa). Kaynakça ve ekler hariç; 50’lik (kısa çalışmada 10’luk) yuvarlama ve toplam tam eşitlenir. Toplam değişince bölümler oranla ölçeklenir; “Önerilen dağılım” baştan dağıtır, “Toplama eşitle” elle değişiklikten sonra eşitler.
- Yapay zekâ: öğrenci toplam verdiyse ona uyar, vermediyse tür/seviyeye uygun toplam önerir; bölüm kapsamını uzunluğa göre planlar.
- Yazım: `blueprintContext` bölümün hedefini verir (±%15, alt başlıklara dengeli dağıt). Alt başlıklarla toplu yazımda her alt başlığa düşen pay ayrıca iletilir. Sol menüde bölüm başına “yazılan / ~hedef kelime” görünür. Onay öncesi hedef uzunluk boşsa uyarılır.

### D69 — Uzunluk yalnızca kelimeyle (sayfa başına kelime kaldırıldı)
- Kullanıcı geri bildirimi: sayfa başına sığabilecek kelime sınırlıdır; aşmak için punto küçültmek akademik yazım kurallarına aykırıdır. Bu yüzden “sayfa” ve “sayfa başına kelime” girişleri kaldırıldı. Hedef = çalışmanın toplam kelimesi + her bölümün kelime sayısı.
- Sayfa yalnızca bilgi amaçlı, yaklaşık gösterilir (12 punto, 1,5 satır, ~275 kelime/sayfa; “kesin değildir”). Yapay zekâ bağlamına sayfa bilgisi verilmez. `wordsPerPage` alanı geriye dönük uyum için şemada kalır, arayüzde kullanılmaz.

### D70 — Akademik Ekip: %30 indirim, en az 3 kişi, kişi sınırı yok
- `TEAM_DISCOUNT = { percent: 30, minMembers: 3 }` (fiyatlar, kurumlar, SSS ve SEO metinleri buradan veya güncellenmiş metinlerden okunur).
- Kurum lisansında `organizations.seats` artık boş bırakılabilir: boş = sınırsız (migration 18; mevcut kurumların sınırı kaldırıldı). Katılımda sınır yalnızca `seats` doluysa uygulanır. Yönetim → Kurumlar’da kişi sınırı alanı isteğe bağlı.

### D71 — Akademik Ekip paketlerin yanında ayrı kart
- Fiyatlar sayfasında ve ana sayfadaki paket bölümünde Premium’un sağında “Akademik Ekip” kartı (`TeamCard`, components/landing/sections.tsx): %30 indirim, kişi başı aylık indirimli fiyatlar (Basic/Pro/Premium; paket fiyatlarından hesaplanır, İngilizcede dolar), en az 3 kişi / üst sınır yok, “Ekip teklifi al” → WhatsApp. Ödeme ve tanımlama süreci değişmedi (Yönetim → Kurumlar). Izgara xl’de 5 sütun; kapsayıcı max-w-7xl. Alttaki yinelenen “Akademik Ekip İndirimi” kutusu kaldırıldı.

### D72 — Örnek çıktılar sayfası (/ornekler)
- Herkese açık sayfa: 15 hizmetin her biri için örnek (kurgu, başlık, kaynak araştırması/doğrulama, bölüm taslağı, 9 atıf stili, literatür matrisi, anket, istatistik, grafik, kalite raporu, özet/abstract, hakem yanıtı, savunma provası, savunma sunumu, Word/PDF). Her örnekte hangi pakette olduğu yazar.
- Dürüstlük: tümü tek bir KURGUSAL çalışma üzerinden; kaynaklar/yazarlar kurgusal ve DOI’siz (gerçek yayına işaret etmez), sayfanın başında açıkça belirtilir. İstatistik tabloları (Cronbach α, korelasyon, t testi), grafik ve atıf biçimleri elle yazılmaz: sabit tohumlu örnek veri setinden (N = 120) sitenin kendi motorlarıyla (`runAnalysis`, `buildChart` + `renderChartSvg`, `CitationEngine`) canlı üretilir; özet/abstract ve sunumdaki sayılar bu sonuçlardan gelir. Atıf örneğinde 9 stil arasında geçiş yapılabilir.
- İçerik `src/lib/samples.ts` ({tr,en}), görünüm `components/samples/samples-view.tsx`. Menüde “Örnekler”, altbilgide “Örnek çıktılar”, ana sayfa ve fiyatlar altında bağlantı; site haritası ve SEO kayıtları eklendi.
- Ayrıca düzeltildi: sistemde olmayan ISNAD stili, “desteklenen stiller” listelerinden (ana sayfa karşılaştırması, SSS, yapılandırılmış veri, blog) çıkarıldı.

### D73 — ISNAD 2 (metin içi) atıf stili
- Yeni stil `isnad` (yazar-tarih ailesi), toplam 10 stil. İSNAD Atıf Sistemi 2. edisyonun metin içi biçimi: metin içinde (Kaya, 2021, 45), iki yazar (Demir - Aksoy, 2022), üç ve daha fazla (Lee vd., 2020); anlatı içinde “Demir ve Aksoy (2022)”; tarihsiz “ts.”.
- Kaynakça: Makale “Soyadı, Ad. “Başlık”. Dergi Cilt/Sayı (Yıl), sayfa. DOI”; kitap “Soyadı, Ad. Kitap Adı. Yer: Yayınevi, Yıl.”; bölüm “… Kitap. ed. Ad Soyad. sayfa. Yer: Yayınevi, Yıl.”; tez “… Yer: Kurum, Yüksek Lisans Tezi, Yıl.”; web “… Site. Erişim gün ay yıl. URL”. İki yazar “ - ” ile, üç ve daha fazla yazarda ilk yazar + vd. Başlıklar ISNAD’a göre kelime başları büyük (`isnadTitleCase`; bağlaçlar küçük, rakamlı kısaltmalar korunur).
- Dipnotlu ISNAD biçimi yok (editörde dipnot altyapısı gerekir); blog ve SSS bunu belirtir.
- Migration 19: `citation_style` enum’una `isnad`; paket kartı metni “10 atıf stili ve otomatik kaynakça”. Sitedeki “9 stil” ifadeleri 10’a çıkarıldı.

### D74 — Şifremi unuttum / şifre yenileme
- Giriş ekranında “Şifremi unuttum” → `/sifremi-unuttum` (e-posta; `resetPasswordForEmail`, dönüş `/api/auth/callback?next=/sifre-yenile`). Hesabın var olup olmadığı açık edilmez; yalnızca sık deneme hatası gösterilir.
- `/sifre-yenile`: bağlantıyla açılan oturumda yeni şifre (en az 8, tekrar alanı) → `updateUser`; giriş yapmış kullanıcı da Hesap → “Şifremi değiştir” ile aynı ekranı kullanır. Oturum yoksa “bağlantının süresi dolmuş” + yeni bağlantı iste.
- Geçersiz bağlantı: callback `/sifremi-unuttum?hata=baglanti`’ya döner. Farklı cihazda açılan bağlantılar için `GET /api/auth/confirm` (token_hash + verifyOtp) eklendi; Supabase “Reset Password” şablonu bu adrese yönlendirilirse bağlantı her cihazda çalışır.
- Sayfalar arama motorlarına kapalı (noindex).

### D75 — Kaynak taraması yalnızca gerektiğinde; aşamaya özel kısayollar
- Sorun: her asistan isteğinde (soru dahil) tarama kararı veriliyordu; Türkçe başlık–İngilizce kaynak adı kelime eşleşmesi tutmadığından neredeyse her seferinde tarama yapılıyordu.
- `researchGate` (lib/research.ts): açık istek (“kaynak bul”, “literatür tara”, “find papers”…) → her eylemde tarama; soru/plan/dil düzeltme/biçim → tarama YOK; yazım eylemlerinde (bölüm yaz, sentez, tartışma, kaynakla düzelt, soru/hipotez/yöntem önerisi) planlayıcı karar verir. Planlayıcının varsayılanı “tarama yok”: yalnızca odak alt konu (toplu yazımda yazılan alt başlık) mevcut kaynakların konusundan belirgin biçimde farklıysa veya projede çalışma türüne göre kapsam için kaynak azsa (`minSourcesFor`) tarar; başlıkları dile bakmadan anlamca değerlendirir. Aynı odak için 45 dk içinde tekrar tarama yok (asistan mesajı meta.research.focusKey). Eksik konu (:::eksik) araması ve yazım öncesi tam metin okuma da yalnızca yazım eylemlerinde.
- Kısayollar `quickActions` (lib/workflows/quick-actions.ts): her bölümde o bölümün işine yarayanlar; “Bölümü yaz” her yerde; “Literatür araştır” yalnızca literatüre dayanan bölümlerde (problem, kavramlar, kuram, literatür, boşluk, özgün değer/etki) veya kapsam için kaynak azken; “Alt başlıklarla yaz” yalnızca uzun bölümlerde; özet/abstract yalnızca sonuç ve özet bölümlerinde; etik kurul yalnızca yöntem/katılımcı/ek bölümlerinde.
- Tam metin sonuçları tek özet bildirimde toplanır; aynı başlıklı bildirimler üst üste binmez (toast tekilleştirme, en fazla 3).

### D76 — Akademik belge yapısı ve başlık disiplini
- Aşamalar belgede doğrudan ana bölüm olmaz: ardışık aşamalar usule uygun ana bölümlerde toplanır (lib/workflows/structure.ts): GİRİŞ (konu açılışı başlıksız, Problem Durumu, Amaç ve Önem, Araştırma Soruları), KURAMSAL ÇERÇEVE VE İLGİLİ ARAŞTIRMALAR (Temel Kavramlar, Kuramsal Çerçeve, İlgili Araştırmalar), YÖNTEM (Araştırma Modeli, Evren ve Örneklem, Veri Toplama Araçları, Verilerin Analizi…), BULGULAR, TARTIŞMA, SONUÇ VE ÖNERİLER. Aşama iş adları akademik başlığa dönüşür; kullanıcı aşamayı yeniden adlandırdıysa kendi adı kullanılır. Makale ve proje başvurusu aşamaları kendi bölümleridir.
- Dışa aktarmada: aşama adını tekrar eden ilk başlık atlanır; numaralandırmada düzey atlanmaz (“1.0.1” oluşmaz); içindekiler en fazla 3 düzey. Editördeki numaralar belgeyle aynı önek (`stagePrefixes`).
- Yapay zekâ: her bölüm bağlamında `structureRule` — aşama adını başlık yazma; kısa bölümlerde alt başlık açma; uzun bölümlerde en fazla ~her 950 kelimeye bir alt başlık (en fazla 6), her alt başlık en az 2–3 paragraf, tek alt-alt başlık ve düzey atlama yok. Alt başlık önerisi de bu bütçeyle sınırlı. Editöre eklenen taslakta bölüm adını tekrar eden ilk başlık ayıklanır.

### D77 — Yönetici modülü: otomatik çalışma (uçtan uca)
- Yönetim → “Otomatik çalışma” (yalnızca yönetici rolü; `/api/projects?autopilot=1` yönetici dışına 403). Yönetici kurgu bilgilerini verir: çalışma türü, seviye, yöntem, konu/kapsam, disiplin, üniversite, dil, atıf stili, hedef toplam kelime, fikir/danışman notları ve belgeler (makale PDF’leri → kaynak olarak eklenir; yazım kılavuzu ve diğer belgeler projede aranabilir metin olur; CSV/XLSX → bulgular için deterministik veri özeti). Kurgu yapay zekâyla hazırlanır ve mevcut kurgu ekranında (D67) yöneticiye gösterilir; onaydan sonra kalan her şey otomatik.
- Motor (`components/admin/autopilot-engine.ts`) tarayıcıda çalışır ve her adımı sitenin mevcut uçlarıyla yapar: başlık önerisi → önerilen yazım sırasıyla HER aşama (özet en son, kaynakça otomatik; uzun bölümlerde alt başlık bütçesi kadar alt başlık, her biri ayrı istek ve kelime payıyla) → kalite kontrolü (yapay zekâ jüri incelemesi dahil) → düzeltme turu (boş/kısa/atıfsız bölüm yeniden yazılır, [KAYNAK GEREKLİ] paragrafları kaynakla düzeltilir, dil/tekrar/tutarlılık sorunları bölüm bazında atıflar ⟦Cn⟧ ile korunarak giderilir, doğrulanmamış kaynaklar yeniden doğrulanır, atıf almayan doğrulanamayanlar çıkarılır) → puan ≥ 85 veya en fazla 3 tur → teslim. Böylece uydurma yok, gerektiğinde tarama (D75), başlık disiplini (D76) ve kelime hedefleri (D68) aynen geçerli.
- Veri yüklenmediyse bulgular uydurulmaz ([VERİ GİRİLECEK]); hedef puana ulaşılamazsa nedeni teslim notunda yazılır.
- Durum `projects.context.autopilot` (durum, aşama, tur, puan, son 40 günlük kaydı); sekme kapanırsa “Sürdür” ile kaldığı yerden devam eder (biten aşamalar atlanır; yarım bölüm “devam ediyor” olarak kaydedilir).
- Yönetici (site sahibi) paket sınırlarına, hız sınırına ve proje kotasına tabi değildir, oturumda premium özelliklerle çalışır; kullanım ve maliyet yine kaydedilir (`isAdminUser`).
- Saf kurallar `lib/autopilot.ts` (`planFixes`, `parseHeadingLines`); `docToTokenMarkdown` (editor/doc.ts) bölümün tamamını atıfları koruyarak düzeltmeye verir.

### D78 — Gereksiz API kullanımının önlenmesi (kaliteden ödün vermeden) ve otomatik çalışmada döngü önleme
- **Önbellek:** Yapay zekâ bağlamı iki parçaya ayrıldı (`buildContext` → `head` + `tail`). Sabit kısım (proje bilgisi, genel kurgu, kaynak listesi, hafıza) her istekte aynı sırada gelir ve Anthropic’te `cache_control` ile önbelleğe alınır; aynı çalışmadaki ardışık isteklerde bu kısım normal girdi fiyatının ~%10’una okunur. Değişken kısım (diğer bölümler, üzerinde çalışılan bölüm ve metni, bölüm notu/hedef uzunluğu, bölüme özel yönetici talimatı, yapı kuralı, tekrar listesi, “bu bölümde atıf yapılanlar”, tam metin parçaları) önbelleğe girmez. Sistem talimatı artık bölümden bölüme değişmez (bölüme özel talimat değişken kısımda).
- Kaynak listesi isteğe göre sıralanmaz (önbellek bozulmasın): ≤ 40 kaynakta hepsi eklenme sırasıyla; fazlasında çalışmanın konusuna en yakın 40’ı yine eklenme sırasıyla, isteğe özgü ilgili/atıf almış diğerleri (en fazla 12) değişken kısımda “ek kaynaklar” olarak (`selectContextSources`).
- **Sohbet geçmişi:** en fazla 12 mesaj; eski yanıtlardaki uzun taslaklar kısa bir notla özetlenir (bölümün güncel metni zaten bağlamda), en son yanıt aynen kalır (`lib/ai/history.ts`).
- Bölümün tamamı seçili metin olarak gönderildiyse mevcut metin bağlama ikinci kez eklenmez.
- **Düşünme seviyesi eylem başına** (`ACTION_EFFORT`): kısaltma, üslup, tekrar azaltma, nottan metin ve alt başlık önerisi `low`; yazım ve analiz eylemleri varsayılan (`medium`) — kalite düşürülmez. Alt başlık önerisi ayrı bir eylem (`outline`): kaynak taraması ve tam metin okuma tetiklemez.
- **Maliyet hesabı** önbelleği doğru fiyatlar: okunan %10, yazılan %125 (`lib/ai/cost.ts`, `estimateCost(model, in, out, usage)`); kullanım kaydında önbellek alanları da tutulur.
- **Otomatik çalışma:** yapay zekâ jüri incelemesi (Opus) yalnızca ilk kalite turunda; sonraki turlar kural tabanlıdır (puanı zaten kural tabanlı kontrol belirler). Her bulgu için otomatik düzeltme en fazla bir kez denenir (`issueKey`, sayılardan bağımsız). Düzeltilecek yeni bulgu kalmadıysa veya tur sınırı dolduysa iş “Onayınız bekleniyor” durumunda durur ve kalan bulgular listelenir: gerçek veri gerektirenler (düzeltilemez, uydurma yok), düzeltmesi denenip süren ve otomatik kapsam dışında kalanlar. Yönetici bir kez daha düzeltilecekleri işaretler, diğerleri “olduğu gibi kalır” ve bir daha sorulmaz; ya da “Bu hâliyle teslim et”. Böylece aynı kusur için tekrar tekrar kalite kontrolü ve düzeltme yapılmaz (`decideNext`, `applyReview`).

### D79 — Word içindekiler dosyaya hazır yazılır
- Eskiden DOCX’te yalnızca boş bir TOC alanı vardı; Word açılışta alanları güncellemezse (Mac Word’de “Hayır” denmesi, Pages, Google Dokümanlar, korumalı görünüm) içindekiler boş görünüyordu. Artık girişler (ilk üç düzey + Kaynakça) dosyaya doğrudan yazılır; her giriş başlıktaki yer imine (`_TocN`) bağlıdır ve sayfa numarası PAGEREF alanıyla gelir (Word/LibreOffice açılışta doldurur). Başlıklar sonradan Word’de elle değiştirilirse içindekiler kendiliğinden yenilenmez.

### D80 — Kalite kontrolünde cümle uzunluğu, noktalama ve boşluk
- Yönetici kararı: “Çok uzun cümle” ve noktalama (noktalama işaretinden önce boşluk) kontrolleri kaldırıldı; puanı etkilemez, rapora girmez, otomatik çalışmada düzeltme turu başlatmaz. Yapay zekâ jüri incelemesine de bu konuları bildirmemesi söylendi.
- Çift boşluk yalnızca bilgi notu (“Çift boşluk”) olarak kalır ve puanı normal bir bilgi notunun 1/7’si kadar etkiler (`QualityIssue.weight`).

### D81 — Çalışma kilidi kaldırıldı: kullanıcı kendi çalışmasına erişimi kaybetmez
- Yönetici kararı (D50’nin yerine geçer): aylık hak (yapay zekâ isteği, token, maliyet tavanı, kaynak tarama) dolunca çalışma kilitlenmez, içerik buğulanmaz. Yalnızca ilgili işlem durur (402 `limit_ai` / `limit_tokens` / `limit_search` → yükseltme penceresi). Görüntüleme, elle düzenleme, kaynaklar, kalite sayfası, danışman paylaşımı, BibTeX/RIS ve çalışma indirme her zaman açık; indirmede yalnızca paketin biçim izni geçerli (ücretsiz: TXT/Markdown).
- `syncWorkLock` her zaman `locked: false` döner ve eski bayrağı temizler; `reasons` yalnızca uygulama genelindeki “hakkınız doldu, çalışmalarınıza erişiminiz sürüyor” şeridi için. `assertNotLocked`, `WORK_LOCKED_MESSAGE`, kilitli çalışma görünümü (`LockedProject`) ve 100 TL’lik indirme seçeneği kaldırıldı (`download_passes` tablosu ve yönetici Kilitler sekmesi geriye dönük duruyor; KVKK talepleri aynen).
- Veritabanı: migration 20 eski bayrakları sıfırlar ve `work_locked()` her zaman false döner (kısıtlayıcı politikalar artık engellemez).
- SSS ve Kullanım Koşulları güncellendi.

### D82 — Yönetici için tüm sınırlar sınırsız görünür
- `effectiveLimits` yönetici (`role = admin`) için tüm sınırları `null` (sınırsız) döner: “hakkınız bitmek üzere” uyarıları, panel/hesap sayaç çubukları, “hak doldu” şeridi ve kalan tarama hakkı hesabı yöneticiye çıkmaz. Paket süresi uyarısı da gösterilmez. Kullanım ve maliyet yine kaydedilir (D77).

### D83 — Alt başlıklar ayrı çalışma birimi (bölüm içi odak)
- Asistandaki “Alt başlıklarla yaz” yerine “Alt başlık oluştur”: önce kaç alt başlık istendiği sorulur (1–8), yapay zekâ (outline eylemi) o sayıda öneri getirir, kullanıcı düzenler/onaylar; başlıklar bölümün sonuna ## olarak eklenir. Bir alt başlığa girilince düğme “Alt-alt başlık oluştur” olur ve başlıklar o başlığın altına (mevcut alt başlıklarından sonra) bir alt düzeyde eklenir. En derin düzey: gruplu aşamada ### (1.2.1.1), tek başına bölümde #### (3.1.1.1); Giriş’in başlıksız açılış metni (konu) alt başlık almaz.
- Veri modeli değişmedi: alt başlıklar aşamanın tek belgesinde kalır (dışa aktarma tek belge, numaralandırma D76 kurallarıyla, alt başlıklar arasında sayfa atlanmaz; yalnızca ana bölümler yeni sayfada başlar). Kullanıcı sol listede her alt başlığa ayrı girer: editörde yalnızca o başlığın kendi metni açılır (`sectionDoc`), değişiklik belgeye geri yazılır (`replaceSectionBody`); eklenen metindeki başlıklar atılır. Başlık adı üstteki alandan değiştirilir, alt başlık (alt başlıklarıyla) silinebilir. Saf kurallar `lib/editor/sections.ts`.
- Sol liste: ana bölüm başlıkları (ör. “1 GİRİŞ”), her aşamanın yuvarlak içinde adım numarası ve belgedeki numarası (1.2), altında alt başlık ağacı (2.1.3, 2.1.3.1…) ve kelime sayıları. Editör başlığında “Adım N” ve “Belgede X”.
- Asistan odaktaki alt başlığı bilir: yazım isteklerine “yalnızca bu alt başlığın metnini yaz; başlığı tekrar yazma, yeni alt başlık açma” notu eklenir. Eski toplu yazım penceresi (outline-writer) kaldırıldı.

### D84 — Bölüm sırası akademik düzende tutulur; editör yer tutucusu
- `academicOrder` (workflows/structure.ts): aynı ana bölüme ait aşamalar bitişik (ayrı düşen kısım grubunun arkasına alınır), kaynakça ve ekler en sonda; kullanıcının diğer sıralaması korunur. Çalışma açılışında, sürükleyip bırakmadan sonra ve “Bölüm ekle” ile yeni aşama eklenince uygulanıp kaydedilir. Böylece “3 YÖNTEM … 5 YÖNTEM” gibi ikinci kez açılan ana bölüm oluşmaz.
- Editörün boş bölüm yer tutucusu her çizimde güncel bölüm adını okur (önceden ilk açılan bölümün adı kalıyordu). Sol listede bölüm listesi üst kısımdan çizgiyle ayrıldı.

### D85 — İçindekiler tüm başlık düzeylerini içerir
- Yönetici kararı (D76’daki “içindekiler en fazla 3 düzey” kuralının yerine geçer): 4. düzey alt başlıklar (ör. 2.1.4.1) da Word, PDF ve metin dışa aktarmalarındaki içindekilere girer; Word’de her giriş başlığa yer imiyle bağlıdır. Bu, PDF’de 4. düzey başlık varken içindekiler sayfa numaralarının kaymasına yol açan eşleşme hatasını da giderdi (her başlık bir giriş).

### D86 — Sol listede “+” ile aynı düzeyde alt başlık
- Sol listedeki her alt başlığın yanında “+” düğmesi: o alt başlığın arkasına (kendi alt başlıklarından sonra) aynı düzeyde yeni bir alt başlık ekler (`addSiblingAfter`). Önce o alt başlığa girilir, ad küçük bir pencerede sorulur; ekledikten sonra yeni başlık açılır, numaralar kendiliğinden kayar. Alt başlıktayken editörün yer tutucusu alt başlığın adını gösterir.

### D87 — Word’den içe aktar (kaynaklar ve atıflarla)
- Bölüm veya alt başlık başlığındaki “İçe aktar” düğmesi: .docx yüklenir; metin yeniden yazılmadan (yapay zekâ kullanılmaz) mammoth HTML → TipTap düğümlerine çevrilir (`lib/import/html-doc.ts`; başlık, paragraf, kalın/italik, liste, tablo; görseller ve dipnot bağlantıları atlanıp raporlanır).
- Kaynakça (“Kaynakça/Kaynaklar/References” başlığından sonrası) ayrılır, her satır ayrıştırılır (`parseReference`: yazarlar, yıl, başlık, DOI). Projede aynı DOI/başlık varsa o kaynak kullanılır; DOI varsa künye kayıt otoritesinden alınır, yoksa satırdaki bilgilerle “doğrulanmadı” olarak eklenir (uydurma yok) — `lib/import/server.ts`, uç `POST /api/projects/[id]/import-doc`.
- Metin içi atıflar (`linkCitations`): “Yazar (Yıl)” → anlatı atfı; “Yazar’ın (Yıl)” → yazar metinde kalır + yalnızca yıl (`suppressAuthor`); “(Yazar, Yıl; Yazar vd., Yıl, s. 12)” → parantez atfı; “(akt. Yazar, Yıl; α = 0,79)” → ön ek/son ek korunur (`prefix`/`suffix`, atıf motoruna eklendi). Soyadı + yıl kaynakçadaki tek bir kayda uymuyorsa metin değişmez ve “kaynakçada karşılığı yok” olarak raporlanır (çoğunlukla “akt.” ile verilen ikincil kaynaklar).
- Başlıklar (`fitHeadings`): elle yazılmış numaralar silinir, yinelenen başlık tekilleşir, düzeyler hedefin altına kaydırılır (en derin düzey kurala göre); hedefin adıyla aynı ilk başlık atılır. Yerleştirme istemcide (`insertImported`): bölümün sonuna (boşsa yerine) ya da alt başlığın içine; sonuç raporu gösterilir. Erişim üç yerden: bölüm/alt başlık başlığındaki mavi “Word’den içe aktar” düğmesi, Araçlar menüsünün ilk satırı (her pakette açık) ve asistan kısayol düğmeleri.

### D88 — Hafızaya belgeden öğren
- Hafıza panelinde “Belgeden öğren”: PDF/Word/metin yüklenir, metin (ilk ~60 bin karakter) Sonnet’e düşük düşünme seviyesiyle verilir; çalışma için kalıcı bilgiler (karar, kavram, değişken, soru, hipotez, kaynaklı olgu) en fazla 20 kısa kayıt olarak `project_memory`’ye eklenir (source = ai). Yalnızca belgede açıkça yazanlar; sayı ve adlar belgedeki gibi; mevcut kayıtların tekrarı atılır. `lib/memory-learn.ts`, uç `POST /api/projects/[id]/memory/learn`. Dosya saklanmaz.

### D89 — Giriş’in başlıksız açılış metninde alt başlık
- Açılış metnine (konu aşaması) alt başlık eklenirse (ör. Word’den içe aktarma) bunlar ana bölümün 2. düzeyinde numaralanır (1.1, 1.1.1) ve sonraki kısımlar kayar (Problem Durumu 1.2…). `stagePrefixes` artık başlıksız gruplu aşamadaki üst düzey başlıkları sayar; dışa aktarma zaten böyle numaralıyordu, sol liste ve editör artık aynı numarayı gösterir (önceden iki “1.1” görünüyordu). Açılış metnindeki “alt başlık oluşturma” kısıtı kaldırıldı.

### D90 — Ücretsiz araçlar, ölçüm ve maliyet sayacı
- `/araclar` (girişsiz, herkese açık, TR/EN, site haritası ve SEO kayıtlı; ana sayfada “Ücretsiz akademik araçlar” bölümü ve menüde bağlantı): kaynakça oluşturucu (DOI/başlık → Crossref/DataCite/OpenAlex; elle giriş), atıf stili dönüştürücü (düz metin, BibTeX, RIS; isteğe bağlı resmî kayıttan tamamlama), örneklem hesaplayıcı (Cochran + sonlu evren, Yamane, ortalama; yanıt oranı; hazır yöntem cümlesi), Cronbach alfa (tarayıcıda; ters madde, madde-toplam r, silinirse α), anket oluşturucu (tarayıcıda; hızlı kontrol, yazdır; “çevrim içi yayınla” → kayıt → /anketler’de “Hesabıma aktar”). Bu beşi yapay zekâ KULLANMAZ.
- Uydurma kaynak kontrolü: her satır DOI ile doğrulanır (DOI başka yayına aitse “uydurma/hatalı DOI”), yoksa başlık+yazar+yıl ile Crossref ve OpenAlex’te aranır; yalnızca ayrıştırılamayan satırlar Haiku ile alanlarına ayrılır (bilgi üretmez). Saatte 15 kontrol × 30 kaynak (ziyaretçi karmasıyla).
- `tool_usage` (migration 21): her araç kullanımı ve varsa yapay zekâ maliyeti (giriş yapmamış ziyaretçi dahil). Yönetim → Genel bakış → “API maliyeti sayacı”: günlük maliyet (özellikler + ücretsiz araçlar), özelliğe göre maliyet (usage_events.meta.action → okunur ad, `lib/insights.ts`), araç kullanım/maliyet listesi.
- Ölçüm (migration 21 `analytics_events`): çerezsiz sayfa görüntüleme; IP/UA saklanmaz, günlük dönen anonim karma; DNT/GPC ve botlar sayılmaz; kimlik içeren yollar gruplanır, yönlendiren yalnızca alan adı. Yönetim → “Ziyaretçiler”: tekil ziyaretçi, görüntüleme, kayıt, dönüşüm, sayfalar, kaynaklar (utm_source), cihaz, huni. Gizlilik metnine eklendi.
- Grafik seti `components/ui/charts.tsx` (TimeSeries, BarList, Donut, StatTile, UsageMeter, RangePicker): sabit sıralı kategorik palet (`--viz-1…5`, açık/koyu ayrı doğrulandı), tek eksen, piksel doğru genişlik, imleç yanında ipucu; yönetim genel bakışı, ziyaretçiler, hesap ve panel kullanım göstergeleri bunlara geçti. ISNAD büyük harf kuralı artık başlığın diline göre (İngilizce başlıkta “I”).
- Ücretsiz paketteki kullanıcıların herkese açık anket formlarının altında logo + “Academiana ile oluşturuldu” (utm’li bağlantı); ücretli pakette logo ve ibare görünmez.

### D91 — Seçili bölümleri dışa aktarma
- Dışa aktar menüsünde “Tüm çalışma / Seçili bölümler”; seçimde başlık numaraları tüm çalışmadaki yerlerini korur, ana bölüm başlığı ilk seçilen kısmın önüne eklenir, kaynakça yalnızca seçilen bölümlerde atıf yapılan kaynakları içerir (`buildExportDoc` `onlyStageIds`, uç `?stages=`).

### D92 — Semantic Scholar sağlığı ve üç yeni veri tabanı
- Semantic Scholar “sağlık verisi yok” görünüyordu: sağlık yalnızca elle aramada kaydediliyordu ve anahtarsız S2 sık sık 429 (hız sınırı) veriyor. Artık otomatik araştırma ve boşluk aramaları da sağlık kaydeder (`providerHealthMeta`, son hata dahil; yönetimde başarı %90’ın altındaysa “son hata” görünür). `getJsonRetry`: 429/5xx’te üstel bekleme ile yeniden dener (Retry-After’a uyar, en fazla 3 sn). Anahtarsız S2 429 alırsa 30 sn bekleme süresine girer ve açık bir hata (“SEMANTIC_SCHOLAR_API_KEY önerilir”) verir; kalıcı çözüm Vercel’e ücretsiz `SEMANTIC_SCHOLAR_API_KEY` eklemek.
- Yeni anahtarsız kaynaklar: ERIC (eğitim; açık erişim PDF bağlantısı), DBLP (bilgisayar bilimleri; yazar ayırt etme numaraları atılır), DataCite (tez, veri seti, rapor, ön baskı DOI’leri; yazılım/görsel hariç). Varsayılan açık; Yönetim → Ayarlar → Veri kaynaklarından kapatılabilir. Ayrıştırıcılar fixture testli (`tests/providers-extra.test.ts`); canlı yanıt biçimi kullanıcının ekran görüntüleriyle doğrulanacak.

### D93 — Semantic Scholar kaldırıldı; asistan kullanım sorularını yanıtlar
- Yönetici kararı: Semantic Scholar veri kaynağı tamamen kaldırıldı (sağlayıcı, ayrıştırıcı, ayar, `SEMANTIC_SCHOLAR_API_KEY`). Veritabanındaki eski `sources.enabled` kaydında kalan anahtar zararsızdır (arama yalnızca tanımlı sağlayıcıları çağırır); yönetimdeki sağlık listesi yalnızca mevcut kaynakları gösterir. Toplam 12 veri tabanı.
- Asistan artık “Nereden grafik oluşturabilirim?” gibi kullanım sorularını yanıtlar: `lib/ai/help.ts` içindeki kullanım rehberi (menü ve düğme adları arayüzle aynı). Açıkça kullanım sorusu olan mesaj (`isHelpQuestion`: nereden/nasıl + işlem + özellik/arayüz kelimesi; “bu bilgiyi nereden aldın”, “nerede eksik” gibi içerik soruları hariç) Haiku ile, proje bağlamı ve literatür taraması olmadan yanıtlanır (ucuz, hızlı; maliyet “Asistan: kullanım sorusu” olarak sayılır). Kaçan karışık sorular için rehber ana sistem talimatında da var (önbellekte). Rehberde olmayan menü adı uydurulmaz. Özellik/menü değişince rehber güncellenmeli.
- (D93 düzeltme) Canlıda “grafik” isteği kullanım sorusu olarak tanınmadı ve asistan SPSS/Excel önerdi. Tanıma genişletildi: platform aracı gerektiren istekler (“grafik oluşturmak istiyorum”, “grafik çizebilir misin?”, “pdf olarak indirmek istiyorum”) de rehberle yanıtlanır; Türkçe ünsüz yumuşaması (grafik → grafiği, kaynak → kaynağı) dikkate alınır. Ana asistana da kural eklendi: araçla yapılan işlerde önce Academiana içindeki yol anlatılır, dış program (SPSS, Excel, R, Canva…) kullanıcı istemedikçe önerilmez.
- (D93 genişletme) Yönetici kararı: sistemdeki her şeyin yeri tarif edilebilmeli (yönetici paneli hariç). Rehber tüm kullanıcı ekranlarını kapsar: herkese açık site ve ücretsiz araçlar, sol menü (Yeni çalışma, Kontrol paneli, Kaynak araştırması, Dosyalarım, Anketlerim, Konu bulma, Hesap ve abonelik, Kurumum, Uzman desteği, dil/tema, davet, geri bildirim), çalışma alanının her bölgesi (yol haritası, kurgu, editör araç çubuğu, atıf işlemleri, sağ sekmeler, üst çubuk, telefon görünümü) ve adım adım sık işler. Yönetim paneli rehberde yoktur; sorulursa kullanıcıya açık olmadığı söylenir. Kapsam testi `tests/help.test.ts` (önemli düğme adları rehberde mi). Yeni özellik/menü eklenince rehber ve bu test güncellenir.

### D94 — Maliyet denetimi ve sayaç iyileştirmeleri
Denetimde bulunan ve düzeltilen sorunlar:
- **Fiyat hesabı:** Opus 5.5’te önbellekten okuma girdi fiyatının %5’i ($0.20/MTok), %10 sanılıyordu (fazla tahmin). Haiku 5.5’te istem 100 bin tokeni aşarsa $0.50/$2.50 fiyatı uygulanır (eksikti). Fiyatlar `lib/ai/cost.ts` `KNOWN_PRICES`’ta; yönetici fiyat tablosu girdi/çıktıyı geçersiz kılabilir, önbellek ve uzun istem kuralları korunur.
- **Sıfır maliyet riski:** Sunulan model adı (yedek model, tarih ekli sürüm) fiyat tablosunda yoksa maliyet 0 yazılıyordu. `resolvePrice`: tam ad → tarih eksiz ad → aile (opus/sonnet/haiku/fable) → bilinmiyorsa en pahalı fiyat (eksik değil fazla tahmin). Yönetimde “fiyatı tanımsız model” uyarısı.
- **Kesilen/iptal edilen sohbet yanıtları** maliyetsiz kaydediliyordu (yalnız token). Artık tahmini maliyetle kaydedilir; istek modele ulaştı ama hiç yanıt gelmeden kullanıcı iptal ettiyse maliyet yazılır, hak düşülmez (quantity 0). Kullanım sorusu yolu da aynı.
- **Yanıtı okunamayan çağrılar** (bozuk JSON: kurgu, anket, savunma, konu önerileri, sunum, hafıza, bölüm kontrolü, tarama kararı) hiç kaydedilmiyordu. `AiSpentError` + istek kapsamı (`requestCtx`, AsyncLocalStorage; `requireUser` kullanıcıyı yazar): `route()` bu hatada maliyeti kullanıcı hakkından düşmeden kaydeder (meta.failed) ve kullanıcıya anlaşılır mesaj (502) döner. Literatür matrisinde maliyet veritabanı yazımından önce kaydedilir.
- **Ücretsiz araç maliyeti** genel bakıştaki toplam maliyete, modele göre dağılıma ve aylık kâr hesabına girmiyordu; artık giriyor.
- **Önbellek verisi:** `recordUsage({ usage })` önbellek okuma/yazma tokenlarını meta.cache’e yazar.
Yeni “Maliyet sağlığı” kartı (Yönetim → Genel bakış): bu ay harcanan ve ay sonu tahmini (USD + TL), gerçek ortalama istek maliyeti ve paket sınırlarındaki varsayımla karşılaştırma (%15 fazlaysa uyarı), önbellek isabet oranı ve tasarrufu, yarım kalan ve okunamayan çağrıların maliyeti, bu ay en çok maliyet oluşturan 10 kullanıcı.
Bilinen sınır: akış hiç başlamadan API hatası verirse (ör. aşırı yük) Anthropic ücret almaz; kayıt da yapılmaz. Gerçek fatura ile karşılaştırma için Anthropic Console → Usage kullanılmalı (kur ve vergiler hariç birkaç % fark beklenir).

### D95 — Paket maliyet analizi (kalıcı referans)
- 44 gerçek tam metin (24 DergiPark, 12 Europe PMC, 8 arXiv tezi) ölçüldü; sistemin bağlam boyutu gerçek kodla, sayfa yoğunluğu sistemin Word çıktısıyla ölçüldü (Türk tez biçimi 344 kelime/sayfa). Veriler, betikler ve rapor `docs/cost-analysis/` (özet README.md).
- Temel sonuç: tez biçiminde sayfa başı $0,094–0,15; YL tezi $7,6–12,2, doktora $14,7–23,4; ortalama yazım isteği ~$0,086. 1/3 bütçeyle önerilen vaat: Basic ~25, Pro ~50, Premium ~85 sayfa/ay; mevcut istek sınırları (40/75/125) kötümser senaryoda bile bütçeyle uyumlu.
- Bulunan 7 tutarsızlık (matrisin kaynak başına istek sayması, kartlarda yazım miktarı olmaması, anlamsız tarama sayıları, belirsiz Premium ifadesi, düşük avg_request_usd, APP_GUIDE’ın her istekte gitmesi, kur bağımlılığı) README’de; paket değişiklikleri kullanıcı kararıyla yapılacak.

### D96 — Paket vaatleri ve analizdeki önerilerin uygulanması (D95)
- Paket kartları (migration 22 + `plans-fallback.ts`): aylık yazım miktarı Türk tez biçiminde sayfa olarak: Ücretsiz ~5 sayfa deneme, Basic ~25, Pro ~50, Premium ~85 sayfa/ay (yoğun kullanım profiline göre aşağı yuvarlanmış; 1/3 bütçeyi aşmaz). `limits.pages_month` bilgi amaçlı (yükseltme penceresi gösterir; yönetimden düzenlenebilir). Fiyat kartlarının altında “sayfa” tanımı; SSS’ye “Bir pakette ayda ne kadar yazabilirim?”.
- Pro/Premium: “Sınırsız kaynak taraması (adil kullanım)”; 2.000/8.000 sınırı adil kullanım koruması olarak veritabanında kalır. Premium’daki “En yüksek yapay zekâ kullanım hakkı” kaldırıldı.
- Literatür matrisi istek hakkından düşmez (quantity 0); yalnızca maliyet ve token tavanına bakılır (`assertWithinLimits(..., { costOnly: true })`). Maliyet yine kaydedilir.
- `billing.margin.avg_request_usd` 0,07 → 0,09 (ölçülen ortalama). Migration kur ayarının `updated_at` değerine dokunmaz.
- Ana asistana tam kullanım rehberi (~12 bin karakter) yerine kısa rehber (`APP_GUIDE_SHORT`, ~1,2 bin) gider; tam rehber yalnızca kullanım sorusu yolunda (Haiku). Yazım isteği başına ~%5–8 tasarruf.
- Kur hatırlatıcısı: Yönetim → Maliyet sağlığı, `billing.margin` 30 günden uzun süredir güncellenmediyse uyarır.
- İstek sınırları (40/75/125) değişmedi: analizde kötümser senaryoda bile 1/3 bütçeyle uyumlu bulundu.
- (D96 düzeltme) Migration 22 elle yapılmış kart düzenlemelerini ezmeyecek biçimde yeniden yazıldı (canlıda Ücretsiz kartta yönetimden girilmiş “TXT / PDF / Markdown” vardı): satırlar yalnızca eklenir/değiştirilir, tekrar çalıştırmak güvenli (PGlite testiyle doğrulandı).

### D97 — Kurgudaki hedef uzunluğa uyum
- Kullanıcı kararı: bölüm/alt başlık, kurguda belirlenen kelime sayısı kadar yazılmalı. Önceden hedef yalnızca “±%15” ricasıydı; alt başlıkta pay modele bırakılıyordu ve denetim yoktu.
- Artık (draft, discussion, methodology, synthesize, interpret; seçili metin yokken): `draftTarget` kesin hedefi hesaplar: alt başlığa odaklanıldıysa bölüm hedefi metin taşıyan (yaprak) alt başlıklara eşit bölünür; boş bölümde hedefin tamamı; dolu bölümde kalan kısım. Talimat kesin sayı ve alt/üst sınır verir (en az %90, en fazla %115); uzatma yalnızca kaynaklı derinleştirmeyle (uydurma yok).
- Çıktı sınırı hedefe göre büyütülür (Türkçe ~3,3 token/kelime + düşünme; en fazla 32 bin).
- Denetim: taslak hedefin %85’inin altında kalırsa sunucu kaldığı yerden devam ettirir (en fazla 2 kez); devam metni taslak bloğunun içine eklenir, istemciye `replace` olayıyla birleşik metin gider; kullanıcıya “Taslak X kelime (hedef Y)” bilgisi gösterilir. Devam çağrıları aynı istek sayılır (hak düşmez), maliyeti aynı kayda eklenir.
- İstemci odaklanılan alt başlığın sırasını (`focusIndex`) gönderir; otomatik çalışma modülü de `replace` olayını işler.
