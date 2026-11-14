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

### D98 — Davet ödülü = Ücretsiz paket hakları; krediler tek seferlik
- Kullanıcı kararı: “Davet et, kazan” ödülü Ücretsiz paketle aynı. `referralReward()` ödülü her seferinde Ücretsiz paketin `limits`’inden okur (şu an 10 yapay zekâ isteği + 7 kaynak taraması, ≈5 sayfa); yönetimdeki ödül miktarı alanları kaldırıldı (geçerlilik günü ve aylık sınır kaldı).
- Hata düzeltmesi: 60 gün geçerli kredi, aktif olduğu her takvim ayında aylık sınıra yeniden ekleniyordu (50 istek → 100–150). `creditPool`: kredi tek seferlik bakiye; her ay paketin aylık hakkını aşan kullanım krediden düşer, kalan bu ayki sınıra eklenir; süresi dolanın kalanı silinir.
- Hata düzeltmesi: token sınırı kredilerle artmıyordu (ücretsiz davetli ~18–20 istekte “token limiti”). Artık kredi isteği başına 50 bin token sınıra eklenir.
- Maliyet (D95 modeli, temel): taraf başı ~$0,86 ≈ 41 TL, davet başı ~$1,71 ≈ 82 TL (önce amaçlanan 411 TL, hatalarla 820 TL’ye kadar). En kötü kötüye kullanım (ayda 20 ödül): ~$17/ay ≈ 820 TL.

### D99 — Davet ödülü yalnızca davet edene, kayıt anında
- Kullanıcı kararı: yeni kaydolan zaten Ücretsiz paketin haklarını alır; ödül (Ücretsiz paket hakları, D98) yalnızca davet edene verilir ve davet edilen kişi kaydolduğu anda tanımlanır (e-posta doğrulaması beklenmez).
- Migration 23: `profiles` üzerinde BEFORE INSERT / UPDATE OF referred_by tetikleyicisi `grant_referral_on_signup` (kayıt ve sosyal girişte sonradan bağlanan davet kodu); `referral_rewarded_at` ile tek seferlik; davet edenin aylık sınırı (`referral.monthly_cap`, ödül sayısı) ve geçerlilik (`valid_days`) ayardan. Bekleyen eski davetler migration’da bir kez işlenir. `grantReferralReward` tetikleyici kurulmamışsa ilk girişte aynı kuralla yedek çalışır.
- Maliyet: davet başı ≈ $0,86 ≈ 41 TL (önce iki taraf ≈ 82 TL). Kötüye kullanım (doğrulanmamış sahte kayıtlar) aylık sınırla ≈ $17/ay ≈ 820 TL ile sınırlı.

### D100 — Bildirim kutusu (ilk tür: davet ödülü)
- Kullanıcı kararı: davetle ödül kazanan kişinin bildirim kutusuna ödül bildirimi düşsün. Uygulamada bildirim kutusu yoktu; eklendi: sol menüde logonun yanında (telefonda üst çubukta) zil simgesi, okunmamış sayısı, açılınca liste ve tümü okundu (`components/notifications.tsx`, `/api/notifications`).
- Migration 24: `notifications` (user_id, kind, data, read_at); RLS: yalnızca kendi bildirimini görür ve okundu işaretler (diğer alanlar tetikleyiciyle korunur); yazma yalnızca sunucu/tetikleyici. Metin istemcide `kind`+`data`’dan iki dilde üretilir.
- `grant_referral_on_signup` ödülle birlikte `referral_reward` bildirimi; aylık sınır dolduysa `referral_cap` bildirimi (ödül verilmedi, ay başında yenilenir). TS yedeği de aynısını yazar. Son 60 gündeki davet ödülleri için geriye dönük bildirim migration’da bir kez oluşturulur.

### D101 — Davet ödülünde aynı cihaz önlemi
- Kullanıcı kararı: davet koduyla açılan hesap, davet edenin kullandığı cihazdan kaydolursa ödül verilmez (kişinin kendi e-postalarıyla ödül toplamasını önlemek).
- Cihaz kimliği: tarayıcıda üretilen rastgele UUID (`device-client.ts`), localStorage ve birinci taraf çerez `acd_did` (biri silinirse diğerinden geri yüklenir). Sunucuya ve veritabanına yalnızca SHA-256 özeti gider; parmak izi (ekran, yazı tipi vb.) kullanılmaz (farklı kişilerin aynı model telefonlarında yanlış eşleşme olmasın; KVKK).
- Kayıt: davet koduyla kayıtta özet auth meta verisine (`did`) eklenir; `handle_new_user` bunu `profiles.signup_device`’a ve `user_devices`’a yazar. Oturum açan her kullanıcının cihazı günde bir `/api/account/device` ile kaydedilir (davet edenin cihazları bilinsin).
- Karar: `grant_referral_on_signup` davet edenin cihazlarında bu özet varsa ödül vermez, davet edene `referral_same_device` bildirimi bırakır. Cihaz bilgisi gelmezse (ör. sosyal giriş, betik engeli) karar ilk girişe kalır: sunucu çerezdeki cihazı kaydeder, `sharesDevice` ile aynı kuralı uygular.
- Sınırlar: gizli pencere veya başka tarayıcı yeni cihaz sayılır; bu yüzden aylık ödül sınırı (20) ikinci savunma olarak kalır. Gizlilik metnine eklendi.

### D102 — Kullanım kanıt kaydı
- Kullanıcı kararı: kullanıcı paket hakkını kullanıp yazdıklarını silerek “paketimi kullanmadım” diyememeli; yönetici veri geçmişini görebilmeli.
- Migration 26 `activity_log` (RLS açık, politika yok: kullanıcı göremez; yazma sunucu/tetikleyici). `logAiOutput` her sohbet/yazım yanıtını (tarih, eylem, çalışma ve bölüm adı, taslak kelimesi, model, çıktı metni ≤200 bin karakter) yazar; yarıda kesilen yanıtlar da (`eylem:yarım`). Tetikleyiciler: çalışma silme (toplam kelime), bölüm silme (çalışma silinirken ayrıca yazılmaz), bölümden ≥300 kelime silme (önceki/sonraki).
- Yönetim → Kullanıcılar → kullanıcı → “Kullanım geçmişi (kanıt kaydı)”: toplam çıktı, üretilen kelime ve tez biçiminde sayfa, bu ay, silinen, ay dökümü, kayıt listesi ve tam metin.
- Saklama 12 ay (okunurken eskiler silinir); hesap silinince silinir. Kullanım koşulları, gizlilik ve SSS’ye eklendi: üretilen metni silmek kullanılan hakkı geri vermez. Kayıt migration 26’dan sonraki kullanımla başlar.

### D103 — Tek Proje paketi
- Kullanıcı kararı: “Tek Proje” — tek ödeme 3.999 TL, süresiz, tüm özellikler ve yapay zekâ/sayfa/tarama sınırsız; yalnızca TEK çalışma. Plan `single` (migration 27): limits null (cost_usd_month null: maliyet tavanı yok), projects 1, one_time true; PLAN_RANK = Premium (tüm özellikler). Kartlarda ve pencerelerde “tek ödeme”; aylık gelir hesabına girmez; yönetici atayınca süre yok.
- Bağlama: `profiles.single_project_id` — paket atanırken en son çalışılan çalışma, yoksa ilk açılan. Kullanıcı değiştiremez (protect_profile_privileged_columns).
- Engelleme: ikinci çalışma (API `assertCanCreateProject`; DB tetikleyicisi yedek), bağlı çalışmayı silme ve çalışma türünü değiştirme (API + DB), yapay zekâ ve tarama yalnızca bağlı çalışmada (13 uçta `assertSingleProject`). Sohbet/anket/konu bulma gibi çalışmaya bağlı olmayan araçlar açık. Dakika başı hız sınırı korunur.
- Uyarı (yöneticilere bildirim + kullanıcının kanıt kaydına not, kural başına 24 saatte bir): engellenen denemeler; indirdikten sonra ≥3.000 kelime silme; toplam silme ≥10.000 ve üretilenin ≥%60’ı; 3.000+ kelimelik çalışmada başlık/konunun belirgin değişmesi (eklentisiz kelime örtüşmesi <0,25); her 120.000 kelimelik üretim.
- Maliyet notu (D95): 3.999 TL ≈ 69 $ KDV hariç; tipik YL tezi 8–12 $, doktora 15–23 $ (kötümser 31 $). Sınırsızlık ve süresizlik nedeniyle uç kullanım ve kur riski yöneticide; uyarılar ve kanıt kaydı izlemeyi sağlar.
- Hata düzeltmesi (migration 27): migration 26’daki çalışma silme kaydı, hesap silinirken silinen hesaba kayıt yazmaya çalışıp hesap silmeyi başarısız kılıyordu; hesap yoksa yazılmıyor.

### D104 — Tek Proje maliyet uyarısı (%40)
- Kullanıcı kararı: Tek Proje paketinde maliyet paket gelirinin %40’ını geçince yönetici uyarılsın; kullanım kısıtlanmasın. Yalnızca Tek Proje.
- Migration 28: `profiles.single_started_at` (paket atanınca; kullanıcı değiştiremez). `single_cost_status(user)`: paket başından beri usage_events maliyeti, bütçe = fiyat / (1+KDV) / kur × 0,40 (3.999 TL, %20, 48 TL → ≈ 27,8 $). `usage_events` AFTER INSERT tetikleyicisi sınır geçilince `raise_abuse_alert('cost_40')` — paket dönemi başına bir kez; yöneticilere “Tek Proje maliyet uyarısı” bildirimi. Sınırlar null kalır (kısıtlama yok).
- Yönetim → kullanıcı ayrıntısı: Tek Proje kullanıcısında paket başından beri maliyet, gelirin yüzdesi ve %40 sınırı.

### D105 — 10 uzun rehber blog yazısı
- Kullanıcı isteği: “kaliteli, işe yarar, kısa bilgi gibi olmasın.” Her yazı ≈1.200–1.600 kelime; hesaplı örnekler, yöntem bölümüne yazılabilecek örnek paragraflar, sık yapılan hatalar ve iç bağlantılar içerir.
- Dosyalar: `blog/posts-4.ts`, `posts-5.ts` (Türkçe), `en-4.ts`, `en-5.ts` (İngilizce, ayrı adresler). Konular: örneklem büyüklüğü, Cronbach alfa, ölçek geçerlik-güvenirlik, nitel görüşme/tematik analiz, uydurma kaynak tespiti, APA 7 tablo-şekil, giriş bölümü, kuramsal/kavramsal çerçeve, sistematik derleme/PRISMA 2020, yağmacı dergiler.
- Araç sayfalarına yönlendirme (örneklem hesaplayıcı, Cronbach alfa, uydurma kaynak kontrolü). Doğrulanamayan güncel kurallar (ör. doçentlik ölçütleri) yazılmadı; okuyucu resmî kaynağa yönlendirildi.
- `tests/blog-links.test.ts`: yazılardaki her bağlantı var olan bir yazıya (TR/EN) veya herkese açık sayfaya gitmeli.

### D106 — Site denetimi sonrası güvenlik ve tutarlılık düzeltmeleri
- **Davet ödülü:** ödül, davet edilen kişi e-postasını doğruladığında verilir (DB tetikleyicisi `auth.users.email_confirmed_at`; doğrulama sonradan gelirse `on_auth_user_email_confirmed`). Geçici e-posta servisleri (`disposable_email_domains`, kodda `disposable-email.ts`; iki liste testle eşit tutulur) ödül kazandırmaz; davet edene “referral_disposable_email” bildirimi. Gizli pencereyle cihaz kontrolü aşılabildiği için asıl engel e-posta doğrulamasıdır; Supabase’de “Confirm email” açık olmalı. Migration 29.
- **Tablo/şekil başlıkları:** `citations/captions.ts` 10 stilin kuralını tutar (APA 7: üstte, kalın numara + alt satırda italik başlık; APA 6: şekil altta, “Şekil 1.” italik; Chicago/Turabian/Vancouver/ISNAD: “Tablo 1. Başlık” üstte, şekil altta; MLA: tablo iki satır, şekil “Fig. 1.”; IEEE: TABLO I + büyük harf başlık, ortalı; AMA: kalın numara; Harvard: “Tablo 1: Başlık”). Harvard ve ISNAD 2 kesin kural koymadığı için yaygın uygulama seçildi; enstitü kılavuzu önceliklidir. Editöre o anki stille eklenir; dışa aktarma ve danışman görünümü başlığı yeniden çözümleyip GÜNCEL stile göre biçimlendirir ve şeklin üstüne/altına taşır. Bir paragraf ancak tablo/şeklin hemen yanında duruyorsa başlık sayılır (“Tablo 1’de görüldüğü gibi” başlık değildir). “Not.”/“Not:” etiketi de stile uyarlanır.
- **Paketler:** Ücretsiz pakette PDF dışa aktarma; Premium’dan “Öncelikli destek” kaldırıldı (sağlayan bir düzenek yoktu); Basic kartında “Word dışa aktarma”. Migration 30.
- **Bağımlılıklar:** zod 3 → 4.6.7 (bellek tüketme açığı); `overrides`: postcss ^8.5.32, sharp ^0.35.5, image-size ^2.1.0. Yüksek seviyeli açık kalmadı; orta seviyedekiler (TipTap 2 zinciri) TipTap 3’e geçişi gerektirir.
- **SSRF:** `safeFetch` yönlendirmeleri elle izler; her adımda adres biçimi (port, kullanıcı bilgisi, tamsayı/onaltılık IP) ve DNS çözümlemesi (tüm adresler herkese açık olmalı; IPv4/IPv6 özel aralıklar) denetlenir. Tam metin indirme bunu kullanır.
- **CSP:** default-src self; betik/stil self + inline (Next.js gereği); bağlantı yalnızca self + Supabase; çerçeve, object yok; form-action self. Üretim derlemesinde 11 sayfa tarayıcıda ihlalsiz doğrulandı.

### D107 — SEO ve meta etiketleri iyileştirmesi
- Denetim (106 adres, Googlebot gibi tarandı): 49 başlık >62, 18 açıklama >160 karakter, araç sayfalarında 200–290 kelime, site haritasında her gün “bugün” lastmod, oturumlu sayfalarda noindex yoktu.
- Başlık: `fitTitle` (seo.ts) — sığarsa marka eklenir, uzun başlık ayırıcıya (?, :, —) kadar kısaltılır; paylaşım kartlarında tam başlık kalır. İki başlık için elle `seoTitle`. Ana sayfa başlıkları kısaltıldı.
- 24 meta açıklama elle yeniden yazıldı (≤155). Testler sınırları denetler.
- Araç sayfaları: nasıl çalışır, sonuç nasıl yorumlanır, sık sorulanlar (TR/EN; yalnızca aracın gerçekten yaptığı işler, kodla karşılaştırıldı). WebApplication (ücretsiz teklif) + FAQPage şeması. Araçlar sayfasında ItemList.
- Blog RSS beslemesi (iki dil) ve sayfa başında RSS bağlantısı. Site haritası lastmod sabit tarih (SITE_CONTENT_UPDATED), blogda yazı tarihi.
- Oturumlu uygulama, proje, davet, şifre ve kurulum sayfaları noindex. Organization şemasına herkese açık WhatsApp destek hattı (contactPoint).
- Sıralama Google’ın kararıdır; Search Console’a site haritası gönderilmesi ve düzenli içerik en etkili adımlardır.

### D108 — Hakkımızda sayfası
- `/hakkimizda` (TR/EN): hikâyemiz (yapay zekâya eğitimde doğru rol, zaman kazandırma; rakip veya açık kapatma dili kullanılmaz — kullanıcı isteği), misyon, vizyon, değerler, kurucu (Alkın Mert Temel, Kurucu ve CEO), iletişim (herkese açık WhatsApp hattı; ACADEMIC_CONTACT_EMAIL tanımlıysa e-posta). Sayı veya kullanıcı iddiası yok; kurucu hakkında doğrulanmamış biyografi yazılmadı.
- Şema: AboutPage + Person (kurucu); Organization’a `founder`. Alt bilgide “Hakkımızda” bağlantısı, site haritası, PAGE_SEO.

### D109 — Tek Proje kötüye kullanım önlemleri (ikinci aşama)
- **Çalışma dışı sınır:** Sohbet her zaman bir çalışmaya bağlı (ön denetimdeki “projesiz sohbet” tespiti yanlıştı). Bağlı olmayanlar: anket yapay zekâsı, konu bulma, çalışma dışından kaynak arama. Tek Proje’de bunlar ayda Ücretsiz paket kadar (`singleScope`; kayıtta `meta.offProject`). Çalışmanın içinden yapılan arama `projectId` gönderir ve sınırsız kalır.
- **Süre hatası:** Tek Proje’ye süre uzatma ve bitiş tarihi verilemez (API 422, arayüzde kapalı); genel kullanıcı güncellemesinde bitiş tarihi sıfırlanır; auth.ts Tek Proje’yi tarih geçse de düşürmez.
- **Gözetim (engellemez, yöneticiye uyarı; kural başına 24 saatte bir):** tam indirmelerin parmak izi (64 sayılık MinHash, metin saklanmaz) — ardışık iki indirme ≥3.000 kelime ve benzerlik <%30 → `content_replaced`; yazar/üniversite/bölüm/danışman değişimi → `cover_change`; 30 günde ≥5 farklı tarayıcı/cihaz → `many_devices`; bölüm sayısı şablonun 2 katını aşarsa → `many_sections`; ≥800 kelimelik yazım çıktısında konu terimlerinden (başlık/konu/anahtar kelime, 5 harf kökü) hiçbiri yoksa → `off_topic`. Seçili bölüm indirmeleri karşılaştırılmaz.
- **Satın alma kaydı:** paket atanırken ödeyen adı, telefon, tutar, not (`plan_purchases`); Tek Proje’de ad zorunlu, hızlı atama kullanıcı ayrıntısına yönlendirir.
- **Karar ekranı:** Yönetim → Uyarılar: sorun yok / kullanıcıyı uyar (bildirim `admin_warning`, isteğe bağlı mesaj) / askıya al (`is_suspended`); kararlar `abuse_decisions`; askıyı kaldırma.
- **Hukuki:** Kullanım koşullarına “Tek Proje paketi” ve “Adil kullanım” maddeleri (hukuki inceleme gerekir); gizlilik metninde cihaz kimliği ve parmak izi amacı güncellendi; SSS güncellendi.
- Migration 31: export_fingerprints, plan_purchases, abuse_decisions (RLS açık, politika yok).

### D110 — Kullanıcı kararı: bazı denetim maddeleri olduğu gibi kalacak
- Kullanıcı şunların değiştirilmemesine karar verdi: ana sayfadaki “10.000’den fazla araştırmacı” ifadesi, “DergiPark’ta doğrudan arama” ifadesi, ödemenin WhatsApp üzerinden alınması (kartla ödeme eklenmeyecek). Ücretsiz araçlara IP başına kullanım sınırı konmayacak.
- Bu konular yeniden önerilmez; kullanıcı kendisi isterse ele alınır.

### D111 — Dil ve çeviri (akademik TR↔EN çeviri, dil denetimi, terim sözlüğü)
- Yer: Araçlar → “Dil ve çeviri” (sekmeler Çeviri / Dil denetimi / Terim sözlüğü) ve metin seçince çıkan seçim balonu (Çevir, Dil denetimi, Akademikleştir, Kısalt, Genişlet, Asistana sor).
- Atıflar ⟦Cn⟧, dipnotlar ⟦Fn⟧, şekiller ⟦Gn⟧ belirteçleriyle korunur; yerine oturmayan belirteç metnin sonuna eklenir ve kullanıcı uyarılır. Ondalık/istatistik gösterimi hedef dile çevrilir, sayılar değişmez. Değiştirmeden önce sürüm alınır.
- Terim sözlüğü `projects.context.glossary` (çalışmaya özel; ortak yazarlar paylaşır). Model: balanced (Sonnet), parçalı (6.000 karakter); kullanım ai_request, adet = çağrı sayısı.

### D112 — Kaynağa sor
- Kaynaklar sekmesinde her kaynakta “Sor”. Cevap yalnızca o kaynağın okunan metnine dayanır (tam metin parçaları `rankChunks` ile; yoksa özet), sayfa “(s. N)” ile; erişim seviyesi rozetle gösterilir. “Atıfla metne ekle” sayfa numaralı atıf düğümü üretir. Hazır sorular: özet, yöntem, örneklem, bulgular, sınırlılıklar, ilişki, alıntılar, tanımlar.

### D113 — Satır içi otomatik tamamlama
- Paragraf sonunda ≈1 sn duraklamada en fazla bir cümle gri öneri (Haiku, 80 token). Tab / Ctrl+→ / Esc; dokunmatikte dokunma. Tablo ve listede yok.
- Öneri sayı, yıl, %, parantez, [[, bağlantı içeriyorsa gösterilmez (uydurma riski). Kullanım türü `autocomplete`: aylık istek/token hakkından düşmez, maliyet tavanına dahil; günlük sınır (Ücretsiz 30, Basic 150, Pro 300, Premium/Tek Proje 500) ve dakikada 30.

### D114 — Araştırmalar ne diyor?
- Ücretsiz araç (/araclar/arastirmalar-ne-diyor; ziyaretçi saatte 5, üye 20) ve çalışma alanı Araçlar menüsü. Haiku arama ifadesi → OpenAlex/Europe PMC/ERIC/Crossref (+Türkiye kaynakları) → özeti ≥200 karakter olan en fazla 14 makale → Sonnet sentez (her cümle [n]); geçersiz numaralar silinir. Evet/hayır sorusunda ≥3 ilgili çalışma varsa uzlaşı göstergesi. Yalnızca özet okunduğu açıkça yazılır; “literatür taraması değildir”.

### D115 — Ortak yazım
- Sahip (Pro, Premium, Tek Proje) en fazla 5 kişiyi e-postayla davet eder; davet 14 gün, yalnızca aynı e-postayla giriş yapan kabul eder (`/ortak/[token]`, noindex). Geçici e-posta engelli. Kayıtlı kişiye bildirim.
- Roller: editor (yazar, kaynak/hafıza ekler, yapay zekâyı KENDİ paketiyle kullanır) ve commenter (okur, yorum yazar). Silme, arşiv/durum, paylaşım bağlantısı, ortak yazar yönetimi, bölüm silme yalnız sahipte.
- Veri modeli: içerik sahibin kaydı olarak kalır (`user_id = sahip`); erişim `src/lib/project-access.ts` (`projectAccess`, `childAccess`): sahip RLS ile, ortak yazar sunucu anahtarıyla ve her sorguda açık `project_id`/sahip `user_id` filtresiyle. RLS politikaları genişletilmedi. Tek istisna: ortak yazarın asistan sohbeti kendi adına (`assert_project_owner` ai_conversations için üyeye izin verir). Dosyalar kişisel kalır.
- Eşzamanlılık: `project_presence` (25 sn sinyal; bölüm listesinde ve editör üstünde baş harfler), başkası kaydettiyse ve yerelde değişiklik yoksa bölüm otomatik yenilenir. Kayıtta `baseUpdatedAt`; arada başkası kaydettiyse 409 → “Onun sürümünü yükle” (sizinki sürüme) / “Benim sürümümle devam et” (onunki sürüme). Hiçbir metin kaybolmaz.
- Sürüm ve yorumlarda `actor_id`; panelde “Benimle paylaşılan çalışmalar”. Migration 32: project_members, project_invites, project_presence, last_editor/actor_id sütunları, usage_kind autocomplete, paket kartı satırları.

### D116 — Bağımlılık açıkları sıfırlandı (TipTap 3, vitest 5)
- `npm audit`: 41 açık (39 orta, 2 kritik) → 0. TipTap 2.27 → 3.33 (mergeAttributes prototip açığı yalnızca 3.x’te kapalı); mammoth güncellendi (dizin geçişi); vitest 3 → 5 (tinypool/mocker kritik açıkları; yalnızca geliştirme aracı); typescript-eslint içindeki minimatch `overrides` ile 11.x.
- TipTap 3 uyarlamaları: Link ve Underline artık StarterKit içinde (ayrı paketler kaldırıldı); tablo uzantıları `@tiptap/extension-table` içinden adlı içe aktarma; `trailingNode: false` (kayıtlı belgelere boş paragraf eklenmesin); `setContent(..., { emitUpdate: false })`; BubbleMenu `@tiptap/react/menus`, tippy yerine floating-ui `options`; araç çubuğu için `shouldRerenderOnTransaction: true`.
- Kritik ders: TipTap 3 `useEditor` ayarlarını ve BubbleMenu’nün `options`/`shouldShow` değerlerini her çizimde karşılaştırır; her çizimde yeni nesne verilirse editör yeniden ayarlanır → işlem → yeniden çizim → sonsuz döngü (React #185, boş ekran). Uzantılar/içerik/editorProps ilk çizimde bir kez oluşturulur (useRef), BubbleMenu değerleri modül düzeyinde sabittir.
- vitest 5 ile esbuild artık dolaylı gelmediği için demo derlemesine açık geliştirme bağımlılığı olarak eklendi. Tarayıcıda (demo) yazma, geri al, kalın, tablo, atıf görünümü, seçim balonu ve bölüm değiştirme denendi.

### D117 — Uzman desteği kaldırıldı
- Kullanıcı kararı: “Uzman desteği” (dermanlik.com.tr yönlendirmesi) siteden tamamen kaldırıldı: /uzman-destegi sayfası, üst menü, alt bilgi, uygulama sol menüsü, çalışma alanı mobil menüsü, Dışa aktar menüsündeki bağlantı, istatistik penceresindeki “İstatistik danışmanlığı” bağlantısı, SSS maddesi ve SSS/blog içindeki atıflar, asistan rehberi, SEO/site haritası kayıtları, lib/expert.ts ve testi.
- Eski adres (/uzman-destegi, /en/uzman-destegi) ana sayfaya kalıcı (308) yönlenir; arama motoru kaydı boşa düşmez.

### D118 — Fiyat ve limit tutarlılığı (rakip analizi, kritik madde)
- Ana sayfa ve Fiyatlar aynı bileşen (PricingCards) ve aynı kaynakla (publicPlans → plans tablosu) çalışır; `tests/pricing-consistency.test.ts` sabit fiyat/tarama sayısını ve koşulsuz “sınırsız” ifadesini yakalar. Migration 33 canlıda kalmış “Aylık 2.000/8.000 kaynak taraması” satırlarını ve Tek Proje’deki koşulsuz “sınırsız” ifadelerini adil kullanım ifadesine çevirir.
- Fiyat sayfasına “Paket ölçüleri nasıl belirlendi?” kutusu (44 tam metin, yaklaşık sayfa, adil kullanım bağlantısı #adil-kullanim). Tek Proje iş modeli değiştirilmedi (D103 kullanıcı kararı); yalnızca ifade netleştirildi.

### D119 — Kaynak destekli iddia denetimi (rakip analizi öncelik 1)
- `lib/claims.ts` bölümü cümlelere böler (kısaltma koruması, cümle başına kayan atıf önceki cümleye), atıflı / atıfsız kesin iddia (sayı, yüzde, “araştırmalar göstermektedir”…) / [KAYNAK GEREKLİ] cümlelerini çıkarır.
- `lib/claim-audit.ts`: kaynağa göre gruplanmış toplu denetim (kaynak başına ≤2 Haiku çağrısı: anahtar kelime + toplu karar; 6’lık partiler); alıntı kaynak metninde birebir yoksa gizlenir; yalnızca künyesi bilinen kaynak yapay zekâya gitmez (“yetersiz”). Değişmeyen cümle–kaynak çifti önceki denetimden yeniden kullanılır; tek seferde ≤40 yeni çift.
- `claim_audits` tablosu (bölüm başına sonuç). Arayüz: bölüm başlığının yanında ve Araçlar’da “İddia denetimi”; süzgeçli liste, pasaj+sayfa, “Cümleye git”, “Asistanla düzelt”; editörde renkli alt çizgi (ProseMirror dekorasyonu `claim-marks.ts`).

### D120 — Kalite puanı yöntemi ve Yöntem ve şeffaflık sayfası
- Puan yalnızca kural tabanlı bulgulardan: 100 − Σ (Kritik 6 / Uyarı 2,5 / Bilgi 0,6 × çarpan) (`lib/quality/score.ts`); yapay zekâ jürisi bulguları puanı değiştirmez. Kalite sayfasında “Puan nasıl hesaplanır?” ve kategori başına düşülen puan.
- Herkese açık `/yontem` (TR/EN): kaynak zinciri, künye doğrulaması, erişim seviyeleri, iddia denetimi, asistan kuralları, puan yöntemi, Araştırmalar ne diyor? sınırları, paket ölçüleri, bilinen sınırlamalar, bağımsız değerlendirme çağrısı. Performans iddiası veya sahte vaka çalışması yok.

### D121 — Teslim / yayın öncesi kontrol listesi
- `lib/quality/checklist.ts` (deterministik, yapay zekâsız): boş bölüm, [KAYNAK GEREKLİ]/[VERİ GİRİLECEK], iddia denetimi (desteklenmeyen/denetlenmemiş), atıfsız iddia, doğrulanmamış/eksik/okunmamış/atıfsız kaynak, özet, anahtar kelime, kalite puanı, biçim/kapak, dergi kılavuzu, dil denetimi. Kalite sayfasında, her maddede “Düzelt →”.

### D122 — Sistematik derleme (PRISMA 2020)
- `review_records` tablosu + protokol `projects.context.review`. Akış: Protokol → Kayıt toplama (Academiana araması veya RIS/BibTeX; yinelenen anahtarı DOI ya da sadeleştirilmiş başlık+yıl, yinelenenler “duplicate” olarak saklanır) → Başlık/özet tarama (Haiku yalnızca ÖNERİ; karar ve gerekçe kullanıcıda) → Tam metin uygunluğu → Akış şeması (PRISMA 2020 SVG; belgeye şekil, PNG, CSV) → dahil edilenleri kaynaklara ekleme. Aşama atlama engellenir (`canMove`). Özellik: Basic+ (`prisma`).

### D123 — Literatür haritası
- OpenAlex’ten toplu (50’lik) çekim; çalışma içi atıf ağı + en az iki kaynağın atıf yaptığı ama çalışmada olmayan yayınlar (“eksik olabilecek temel çalışmalar”, tek tıkla ekle). Bağımlılıksız kuvvet yönelimli yerleşim (`litmap-graph.ts`, deterministik). 24 saat `context.litmap` önbelleği; kaynak tarama hakkından 1 sayılır. Özellik: Basic+ (`litmap`).

### D124 — Görev bazlı başlangıç
- Panelde “Bugün ne yapmak istiyorsunuz?” (8 görev kartı → doğru akış; `/yeni?tur=…`, araçlar). Yeni kullanıcıda açık. Otomatik örnek proje oluşturulmadı (Ücretsiz paketin tek proje hakkını tüketirdi); bunun yerine /ornekler bağlantısı.

### D125 — Ürün analitiği, gözlemlenebilirlik, kurumsal yönetim
- `ai_calls` tablosu: her yapay zekâ çağrısının süresi, ilk parça süresi, başarı/hata, token (metin yok); registry `streamWith` sarmalayıcısı, yazma hatası çağrıyı etkilemez. Yönetim → Genel bakış: aktivasyon hunisi (kayıt → çalışma → 300+ kelime → YZ → dışa aktarma → 2. gün), YZ güvenilirliği (hata oranı, medyan/%95 süre, en sık hatalar), yeni modüllerin kullanımı.
- Kurum: `org_audit_log` (katılma, ayrılma, çıkarma, rol değişikliği), rol yönetimi (son yönetici korunur, tek yönetici ayrılamaz), bu ayki özet, kullanım raporu CSV. İçerik paylaşılmaz. SSO bu turda yapılmadı (Supabase SAML ücretli plan gerektirir).
- Migration 33: plan ifadeleri, claim_audits, review_records, ai_calls, org_audit_log.


### D126 — Vitrinde yeni özellikler (ana sayfa, paket kartları, kurumlar)
- Ana sayfaya “Teslim etmeden önce emin olun” bölümü (`components/landing/assurance.tsx`, `#guvence`): iddia denetimi, kalite puanı + kontrol listesi, PRISMA 2020, literatür haritası; /yontem bağlantısı. Görseller temsilî ve öyle etiketli; sayı/başarı iddiası yok.
- Hero rozeti “Atıflar kaynağında denetlenir”; Nasıl çalışır 5. adım “Teslimden önce denetleyin”; Ekip kartı ve /kurumlar yönetici paneli metni güncel; menüye “Yöntem”; ana sayfa SSS öne çıkanlarına `dogrula`; ana sayfa meta açıklaması iddia denetimi ve PRISMA’yı anar.
- Migration 34: paket kartları — Ücretsiz’e “İddia denetimi ve teslim öncesi kontrol listesi”, Basic’e “PRISMA 2020 sistematik derleme” ve “Literatür haritası ve eksik kaynak önerisi” (ilgili satırın hemen arkasına, tekrar çalıştırılabilir).

### D127 — Tanıtım videosu ana sayfada
- 68 sn, 1920×1080, sessiz tanıtım (`public/video/academiana-tanitim.mp4`, 5,4 MB, H.264 + faststart; kapak `academiana-tanitim.jpg`). Kaynağı HTML animasyon (oturum çalışma alanında üretildi; repoya girmedi). Örnek veri/kaynaklar ekranda “örnek” diye etiketli.
- `components/landing/promo-video.tsx`: hero’nun hemen altında, yalnız Türkçe sayfada (video Türkçe). Sayfa açılırken yalnızca kapak yüklenir; video tıklanınca indirilir (preload="none"). Oynat düğmesi köşede (kapaktaki başlığı kapatmasın).
- VideoObject JSON-LD (`promoVideoLd`, sabit `PROMO_VIDEO` site.ts’de). Ara katman eşleyicisi mp4/webm/vtt dosyalarını atlar (gereksiz oturum yenileme olmasın).
- Seslendirme gelirse aynı dosya adıyla değiştirilir; `uploadDate` güncellenir.

### D128 — PRISMA ve literatür haritası Pro ve üstü
- Kullanıcı kararı: Sistematik derleme (PRISMA 2020) ve literatür haritası yalnız Pro, Premium ve Tek Proje’de (`features.ts` prisma/litmap: "pro"). Ücretsiz ve Basic erişemez.
- Sunucu: derleme uçlarının tamamı (GET/POST/PATCH/PUT/DELETE, screen, include) ve litmap `assertFeature`; arayüzde araç menüsü yükseltme penceresini açar.
- Migration 35: Basic kartından iki satır çıkarılır, Pro kartına “Literatür matrisi”nin arkasına eklenir. SSS, yardım rehberi ve ana sayfa vitrini (“Pro ve üstü” rozeti) güncel.

### D129 — Kaynak kapsamı genişletildi (17 veri tabanı + 3 anahtarlı)
- Yeni anahtarsız kaynaklar (varsayılan açık): **PLOS** (tamamı açık erişim), **Zenodo** (yalnız “publication” türü: makale, tez, rapor, ön baskı, kitap bölümü), **HAL** (Fransa ulusal açık arşivi, çok dilli), **Open Library** (kitap künyesi; okunabilir e-kitap bağlantısı), **INSPIRE-HEP** (fizik). Toplam 17 anahtarsız veri tabanı (pazarlama metinleri güncel).
- Ücretsiz anahtarla çalışan kaynaklar: **NASA ADS** (`ADS_API_KEY`), **Springer Nature** (`SPRINGER_API_KEY`, meta/v2), **IEEE Xplore** (`IEEE_API_KEY`). Varsayılan açık ama anahtar yoksa `silentWhenUnavailable` ile sessizce atlanır (arama sonucunda hata çipi çıkmaz). Anahtar Vercel’e eklenince kendiliğinden devreye girer.
- Kullanıcı metni Solr/Lucene sözdizimi olarak yorumlanmasın diye `solrEscape`. “Araştırmalar ne diyor?” (consensus.ts) artık PLOS, HAL ve anahtar varsa Springer/IEEE/ADS’de de arar.
- Consensus.app bağlanmadı: herkese açık bir API’si yok (yalnız kurumsal/ortaklık başvurusuyla). Benzeri işi kendi “Araştırmalar ne diyor?” özelliğimiz yapıyor. Semantic Scholar D93 yönetici kararıyla kapalı kalır. TR Dizin ve DergiPark’ın resmî arama API’si yok; bağlantıyla arama (labels.ts) sürer, DergiPark kayıtları OpenAlex/Crossref üzerinden gelir.
- Ayrıştırıcılar fixture testli (`tests/providers-more.test.ts`); canlı yanıt biçimi bulut oturumunda denenemedi — yönetim → Veri kaynağı sağlığı ve kullanıcı ekran görüntüleriyle doğrulanacak.

### D130 — CORE kaldırıldı
- Yönetici kararı: CORE veri kaynağı tamamen kaldırıldı (sağlayıcı, ayrıştırıcı, ayar, `CORE_API_KEY`, kurulum satırı). Veritabanındaki eski `sources.enabled` kaydında kalan `core` anahtarı zararsızdır (arama yalnızca tanımlı sağlayıcıları çağırır); daha önce CORE’dan eklenmiş kaynaklar olduğu gibi kalır. Anahtarsız veri tabanı sayısı 16 (metinler güncel).

### D131 — Kapsam ifadesi: “16 veri tabanında 250 milyondan fazla yayın”
- Kullanıcı kararı (A seçeneği). “400 milyon” önerisi dayanaksız olduğu için kullanılmadı: tekrarlar ayıklandığında farklı yayın sayısı ~250–300 milyon (OpenAlex ~250 milyon üst küme); veri tabanlarındaki kayıtların toplamı 750 milyonu aşar ama aynı yayını birden çok kez sayar.
- Güncellenen yerler: ana sayfa rozeti ve onay listesi, karşılaştırma tablosu, veri kaynakları bölümü, örnekler sayfası, SSS “Kaynaklar nereden geliyor?”, Yöntem sayfası (sayının tekrarsız olduğu açıklaması), kaynak araştırması ekranı. Veri tabanı eklenir/çıkarılırsa bu yerler birlikte güncellenmeli.

### D132 — Gelişmiş PDF okuma ve çoklu belge analizi
- `lib/files/pdf-clean.ts` (saf): her sayfada tekrar eden üst/alt bilgi ve sayfa numarası temizliği (yalnız kısa ve cümle gibi bitmeyen kenar satırları; gövde metni silinmez), satır sonu tire birleştirme, bitişik harf (ﬁ, ﬂ) düzeltme, paragraf içi satır birleştirme, taranmış PDF tespiti (sayfa başına <150 karakter), bölüm başlığı tanıma (TR/EN, numaralı) ve bölümlere ayırma; kaynakça ve ekler parçalara alınmaz.
- `chunkText` bölüm (segments) alır; parçalar `section` taşır (`source_chunks.section`, migration 36). Yazma `insertChunks`, okuma `loadChunks` (sütun yoksa bölümsüz devam). `rankChunks` istenen bölümü öne alır (`SECTION_PREFS`: yöntem sorusu → method…), kaynakça parçalarını geri iter. Kaynağa sor, veri çıkarma ve çoklu analiz bunu kullanır.
- Çoklu belge (`lib/multi-ask.ts`, `api/projects/[id]/sources/analyze`, `workspace/multi-analyze.tsx`, Kaynaklar → “Birlikte analiz et”): 2–8 kaynak; “Hepsine birlikte sor” (Markdown, [[kaynak:S2|s. 5]] atıflı; listede olmayan etiketler `sanitizeCitations` ile atılır) veya “Karşılaştır” (satır tablosu + uyuşma, ayrışma/çelişki + olası neden, boşluklar; JSON şema). Yalnız okunan metin; künye düzeyindeki kaynak seçilemez. Paket: `matrix` (Pro+). Model balanced; karşılaştırma 2 hak sayar.

### D133 — Atıf destek / çelişki analizi
- Yeni karar `contradicts` (“Kaynakla çelişiyor”): `not_supported` (değinmiyor) ile ayrıldı; sıralamada en altta. Karışık kanıt (`isMixed`: bir kaynak destekliyor, diğeri çelişiyor) ayrıca işaretlenir.
- Kaynaklar arası kontrol (`crossCheckSources`, varsayılan açık, “Diğer kaynaklarımla da karşılaştır”): atıfsız/desteklenmeyen cümleler (önce atıfsızlar) için projedeki atıf yapılmamış kaynaklar kelime örtüşmesiyle seçilir (`relatedCandidates`, en fazla 2/cümle, 15 cümle, 24 çift), kaynak başına tek küçük model çağrısı; sonuç `related` (destekliyor/çelişiyor + birebir doğrulanmış alıntı). Alıntısı doğrulanamayan “çelişiyor” gösterilmez. Bakılan cümleler `relatedChecked` ile önbelleğe alınır.
- Arayüz: çelişki/destek uyarı şeritleri, “Diğer kaynaklar” filtresi, “Atıf olarak ekle” ve “Çelişkiyi metne işle” (asistan), CSV dışa aktarma (`auditCsv`). Kalite kontrol listesi çelişkiyi sorunlu sayar.

### D134 — Sistematik derleme (PRISMA) geliştirmeleri
- Bulanık yinelenen: DOI anahtarına ek olarak başlık Dice benzerliği ≥0,93 ve yıl ±1 (yıl bilinmiyorsa ≥0,97); “Olası yinelenen” gerekçesiyle ayrılır, geri alınabilir.
- Çift değerlendirici modu (`protocol.dual`): ekipteki her kişi (ortak yazarlar dahil) tarama ve tam metin aşamasında bağımsız oy verir (`review_records.votes`, `api/.../review/vote`); oylar kararı değiştirmez. Cohen’in kappası (en çok oy veren iki kişi), uyuşma oranı, Landis–Koch yorumu ve anlaşmazlık filtresi.
- Veri çıkarma (`extraction`, `api/.../review/extract`, en fazla 5/istek): desen, ülke/bağlam, örneklem, müdahale/değişkenler, sonuç ölçümleri, bulgular; yalnız okunan metinden (yöntem/bulgular bölümleri öncelikli), birebir doğrulanmış alıntıyla; elle düzeltilebilir (`api/.../review/record`).
- Kalite değerlendirmesi (`appraisal`): JBI ve CASP’tan sadeleştirilmiş 7 madde (evet/hayır/belirsiz/uygulanamaz); evet oranı ≥%75 düşük, %50–74 orta, altı yüksek yanlılık riski (≥3 yanıtlı madde gerekir).
- Yöntem ve sonuç metni (`methodsMarkdown`, yapay zekâsız): PRISMA 2020 ifadesi, veri tabanları ve son tarama tarihi, ölçütler, seçim süreci, sayılar, hariç tutma gerekçeleri, kappa, veri çıkarma ve kalite cümleleri, dahil edilen çalışmalara canlı atıf, arama stratejisi tablosu. Özellikler tablosu (`characteristicsMarkdown`). Belgeye `insertMarkdown` ile eklenir.
- Migration 36: `source_chunks.section`, `review_records.votes/extraction/appraisal`. Migration öncesi okuma eski sütunlarla sürer (`upgraded: false`), yeni yazma uçları 409 “migration 36” döner.

### D135 — Ana sayfa “Özellikler” vitrini
- Kullanıcı kararı: ayrı sayfa yok; menüdeki “Özellikler” (`/#ozellikler`) bölümü kapsamlı vitrine dönüştürüldü (`components/landing/feature-showcase.tsx`; eski üç kartlık `Pillars` kaldırıldı).
- Yapı: başlık + altı rakamlık şerit (16 veri tabanı, 250M+ yayın, 10 atıf stili, 9 çalışma türü, 14 istatistik analizi, 450+ otomatik test) → altı sekmeli alan (Planlama ve yazım, Kaynak ve literatür, Atıf ve doğruluk, Sistematik derleme, Veri ve analiz, Kalite/dil/teslim); her sekmede özellik kartları ve temsilî arayüz görseli (“Temsilî görsel”, örnek sayı/veri etiketli) → “Altyapı” bölümü (katman şeması + 6 güvenlik/güvenilirlik kartı) → /yontem bağlantısı.
- Paket rozetleri `FEATURE_MIN_PLAN`’dan hesaplanır (elle yazılmaz). Sekme yalnız görünürlüğü değiştirir; tüm içerik sayfada (arama motorları için). Rakamlar değişince (veri tabanı, test sayısı, analiz sayısı) bu bileşen de güncellenmeli.

### D136 — LaTeX ve Overleaf çıktısı
- Kullanıcı kararı: global entegrasyonlardan yalnız LaTeX/Overleaf yapıldı (ORCID ve Zotero eşitleme ertelendi).
- `lib/export/render-latex.ts`: dışa aktarma modeli `latexCitations` seçeneğiyle atıfları biçimlemeden `cite` run’ı olarak verir; main.tex (başlık, içindekiler, bölümler, liste, alıntı, booktabs tablo, şekil, dipnot, `\parencite`/`\textcite`/`\parencite*`, sayfa `[170]`, ön ek), references.bib (`bibKeyMap` ile metindeki anahtarlarla aynı), figures/*.png, README.txt; ZIP (`jszip`). Biçim: `export?format=latex` (Markdown izni olan her pakette), `&target=overleaf` → ZIP 15 dk imzalı bağlantıyla depoya konur (kullanıcının önceki Overleaf dosyaları silinir), arayüz yeni sekmede `overleaf.com/docs?snip_uri=…&engine=pdflatex` açar.
- Stil eşlemesi (`BIBLATEX_STYLE`): APA 7/6 → apa, MLA → mla, IEEE → ieee, Vancouver → vancouver, AMA → nature, Harvard/Chicago/Turabian/ISNAD → authoryear (not dosyada).
- Türkçe belgede (`biblatexSetup`): TeX Live’da turkish-apa.lbx hata veriyor ve yazar–yıl stillerinde Türkçe babel altında kaynakça takılıyor. APA’da Türkçe → american-apa eşlenir; diğer stillerde biblatex İngilizce dil dosyasıyla (autolang=none) çalışır, kaynakça `otherlanguage{english}` içinde basılır; kısaltmalar Türkçeleştirilir (ve, vd., s., ss., C., S., Ed., bs., t.y., İçinde). csquotes `style=english` (Türkçe tırnak stili yok, “?” çıkıyordu).
- Doğrulama: 10 stil × TR/EN = 20 örnek pdfLaTeX + Biber ile derlendi; 0 LaTeX hatası, 0 Biber hatası, 0 tanımsız atıf (Türkçe karakter, özel karakter, dipnot, tablo, şekil, çoklu atıf içeren örnek). `tests/latex.test.ts` (LATEX_OUT=dizin ile derleme dosyalarını yazar).

### D137 — Yalnızca sunucunun yazdığı tablolara yazma (iddia denetimi / PRISMA kayıt hatası)
- Sorun: `claim_audits` ve `review_records` tablolarında RLS yalnızca SELECT politikası içeriyor; sahip için `childAccess`/`projectAccess` RLS istemcisi döndüğünden ekleme reddediliyor, güncelleme sessizce 0 satır etkiliyordu. İddia denetimi kaydı hatayı yanlışlıkla “migration 33 gerekli” diye gösteriyordu.
- Çözüm: `lib/server-db.ts` → `serverDb()` (sunucu anahtarı). İddia denetimi ve tüm PRISMA uçları (`review`, `screen`, `include`, `vote`, `extract`, `record`) yazmayı bununla, açık `project_id`/`user_id` filtresiyle yapar; erişim denetimi önceden `childAccess`/`projectAccess` ile yapılmış olmalı. Okumalar RLS istemcisinde kalır.
- Migration mesajı yalnızca tablo gerçekten yoksa gösterilir; diğer hatalar olduğu gibi kaydedilir. Veritabanı değişikliği yok.

### D138 — İddia denetiminde aşırı “çelişiyor” kararı
- Gözlem: “VVIQ yalnızca görsel modaliteyi kapsar” cümlesi “Kaynakla çelişiyor” işaretlendi, oysa açıklama “karar kısmi kalır” diyordu. Neden: şemada karar alanı gerekçeden önce geliyordu (model gerekçeyi yazmadan karar veriyordu) ve “yalnızca” gibi aşırı genelleme çelişki sayılabiliyordu.
- Çözüm: şema sırası alıntı → sayfa → açıklama → karar; istemde “daha güçlü ifade veya kaynağın belirtmediği ayrıntı çelişki değildir; şüphede contradicts seçme; karar açıklamayla tutarlı olmalı”. `guardVerdict`: kaynakta birebir doğrulanmış alıntı yoksa “contradicts” → “not_supported”.
- `AUDIT_VERSION` (2): önceki sürümle verilmiş kararlar önbellekten kullanılmaz; “Yeniden denetle” eski sonuçları yeni kurallarla değerlendirir.

### D139 — İddia denetimi kalibrasyonu (aşırı “kısmen” kararları)
- Gözlem (gerçek çalışma, 9 iddia): 5 cümle “kısmen” işaretlendi; çoğu yerinde atıftı (eş anlamlı anlatım: “çok uluslu topluluk örneklemi” → “klinik olmayan örneklem”; yazarın temkinli yorumu). Ayrıca sayfa yerine iç parça etiketleri (“s. P1”, “s. ÖZET”) gösteriliyordu, açıklamalar uzundu ve bir cümle “Karar verilemedi.” olarak kaldı (yanıt sığmadı) — bu başarısız sonuç önbelleğe giriyordu.
- Çözüm: soru “Bu cümleye bu kaynakla atıf yapmak akademik olarak doğru mu?”; “supports” ana bilgi (bulgu, sayı, yön, örneklem) kaynaktaysa — anlatım farkı, çeviri, eş anlamlı nitelendirme, temkinli yazar yorumu düşürmez; “partial” yalnızca danışmanın düzeltme isteyeceği bir sorun varsa (yanlış nitelenen sayı, nedensellik, genelleme, kesinleştirme) ve açıklama neyin düzeltileceğini söyler. Açıklama ≤30 kelime, parça etiketi yok (`cleanExplanation`).
- Sayfa sunucuda bulunur (`locateQuote`: alıntıyı birebir içeren parçanın `page_hint`’i; özetteki alıntıya sayfa yazılmaz); şemadan quotePage kalktı (iddia + kaynaklar arası).
- Yanıt token sınırı artırıldı (800 + 350/çift); yanıtı gelmeyen cümle “yanıt alınamadı, yeniden denetleyin” der ve önbelleğe alınmaz. `AUDIT_VERSION` = 3.

### D140 — Gerçek zamanlı ortak yazım ve editör geliştirmeleri
- Sorun: ortak yazım 25 sn’de bir yoklamaydı; aynı bölümü kaydeden iki kişi her seferinde “hangi sürüm?” penceresi görüyordu.
- Aktarım: Supabase Realtime özel kanalı `project:<id>` (migration 37: `collab_project_access` + `realtime.messages` RLS; sahip ve ortak yazar okur/yazar, yorumcu yalnızca okur; konu biçimi doğrulanır). Kanal açılamazsa eski yoklama yöntemi sürer. Vercel’de kalıcı WebSocket sunucusu olmadığından Yjs/CRDT yerine bu yol seçildi; mevcut editör mimarisi (tek editör, alt başlığa odak, setContent ile bölüm değişimi) korunur.
- Varlık (presence): kim, hangi bölüm, hangi paragraf, yazıyor mu — anında. Editörde diğer yazarın paragrafı renkli çizgi + ad etiketiyle (`collab-ext.ts` RemotePeers).
- İçerik: yazarken bölümün tam belgesi ~0,4 sn’de bir yayınlanır (≤180 KB; büyükse yalnızca “saved” sinyali ve sunucudan çekme). Alan taraf `mergeDocs` (lib/editor/merge.ts) ile üç yollu PARAGRAF düzeyinde birleştirir (taban: `syncBase`, son ortak sürüm). Editöre `applyDocPatch` ile yalnızca değişen kısım uygulanır; imleç korunur, geri alma geçmişine girmez, “remote” işaretli olduğundan yeniden yayınlanmaz.
- Aynı paragraf aynı anda değiştiyse iki tarafın aynı sonuca varması için sabit kural: kullanıcı kimliği küçük olanın metni kalır; kaybeden taraf sürüm geçmişine kaydedilir ve bildirilir (en çok dakikada bir).
- Sunucu 409 (bölüm başkası tarafından kaydedildi): önce otomatik birleştirme; yalnızca aynı paragraf çakışırsa eski seçim penceresi.
- Editör: “Bul ve değiştir” (find-replace.ts + find-bar.tsx; Ctrl/⌘+F, Türkçe büyük/küçük harf, tam kelime, biçim sınırını aşan eşleşme, tümünü değiştir).

### D141 — Literatür ağı ve araştırma haritası
- Ağ türleri: doğrudan atıf + ortak kaynakça (Salton kosinüsü, en az 2 ortak kaynak, düğüm başına en güçlü 4 bağ) + birlikte atıf (son 6 yılda kaynaklarınıza atıf yapan yayınlar üzerinden, en az 2 kez).
- Kümeler: ağırlıklı etiket yayılımı (deterministik), küme adı üyelerin en sık OpenAlex `primary_topic`’i; köprü kaynak (iki+ kümeye bağlı), merkezi kaynak.
- Yeni: “Yeni çalışmalar” (OpenAlex `cites:` filtresi, kaynaklarınızın en az ikisine atıf yapanlar), zaman çizelgesi (yıl × küme şeridi), konu haritası (kaynaklarınız vs ilgili literatür; eksik alt konu), kural tabanlı boşluk analizi (güncellik, bağlantısız kaynak, kümeler arası boşluk, köprü, eksik konu). Yapay zekâ kullanılmaz.
- Arayüz: sekmeler, kenar türü filtreleri, renk küme/yıl, arama, yakınlaştırma/kaydırma, PNG/SVG, metinde atıf yapılmamış kaynak (kesikli halka).
- Önbellek imzası `v2:` + kaynak kimlik/DOI özeti; eski önbellek yeniden kurulur. OpenAlex çağrıları: DOI başına 50’lik gruplar (paralel), ileri atıf 1–2, öneri kayıtları 1.

### D142 — Kullanım rehberi ve genişletilmiş rehberli tur
- Yeni üyeler için: `/yardim` artık kod içindeki kapsamlı rehberi gösterir (`lib/guide.ts`, TR/EN): “6 adımda ilk çalışmanız” hızlı başlangıç + 10 bölüm, 58 konu (Başlarken, İlk çalışmanız, Yazma ve düzenleme, Kaynaklar ve atıflar, Doğruluk ve kalite, Araştırma araçları, Birlikte çalışma, Teslim ve sonrası, Hesap ve ayarlar, Sorun giderme). Her konuda “Nerede:”, numaralı adımlar, ipucu ve paket rozeti (FEATURE_MIN_PLAN). Arama (Türkçe harf duyarsız), içindekiler, `#bolum-konu` çıpasıyla doğrudan açılır. Yönetimden eklenen `help_articles` altta kalır.
- Rehberli tur 7 → 15 adım, 5 bölüm (ilerleme çubuğu), ok tuşları/Esc; her adımda “Ayrıntılı anlatım” → rehberdeki konu. Yeni çıpalar: blueprint, style, quality, coauthors, share, tools, help. Tur anahtarı değişmedi (mevcut kullanıcılara yeniden açılmaz; “?” ile açılır).
- Sol menüye “Kullanım rehberi” bağlantısı. Menü/özellik değişince `guide.ts` ve `ai/help.ts` birlikte güncellenmeli; `tests/guide.test.ts` tur bağlantılarının var olan konulara gittiğini denetler.

### D143 — Almanca dil desteği
- `Locale = "tr" | "en" | "de"`. Almanca arayüz sözlüğü `src/i18n/de.ts` (anahtar Türkçe metin; 3.549 metin). Terimler: tez → Abschlussarbeit, kaynakça → Literaturverzeichnis, atıf stili → Zitierstil, kurgu → Konzept, iddia denetimi → Aussagenprüfung, ortak yazar → Mitautor:in, danışman → Betreuung; hitap „Sie“. Metindeki işaretler ([KAYNAK GEREKLİ], [VERİ GİRİLECEK]) olduğu gibi kalır, yanında Almanca açıklama.
- Adresler: herkese açık sayfalar `/de` önekiyle; hreflang yalnızca Almanca başlığı olan sayfada. Almanya, Avusturya, İsviçre ve Lihtenştayn’dan gelen insan ziyaretçi `/de`’ye yönlenir (botlar yönlenmez). Fiyatlar Almancada USD, Alman sayı biçimiyle.
- İçerik: SSS `lib/faq-de.ts`, kullanım rehberi `lib/guide-de.ts`, araç rehberleri `lib/tools/guides-de.ts`, örnek çıktılar `lib/samples-de.ts` (hepsi Türkçe metne bağlı; testler eksik/fazla çeviriyi yakalar: faq, guide, de-content). Yasal ve sabit sayfalar (gizlilik, koşullar, akademik dürüstlük, hakkımızda, yöntem) sayfa içinde Almanca dal; yasal metinlerde “maßgeblich ist die türkische Fassung” notu.
- Yapay zekâ cevap dili `AI_LANGUAGE[locale]`; yalnızca TR/EN olan motor çıktıları (APA istatistik, grafik, PRISMA şeması, anket şablonu, örnek sayfadaki tablolar) Almancada İngilizce (`contentLang`). Yazım dili (project.language) hâlâ tr/en; Almanca yazım dili ayrı bir adım.
- Blog: 34 yazının Almancası `lib/blog/de-1..5.ts` (Almanca adresler, ≤60 başlık, ≤160 açıklama; iç bağlantılar /de/blog). Araç rehberleri ve altbilgi Almanca yazılara bağlanır.
- SEO (2026-11-12): hreflang x-default artık İngilizce sayfa (küresel ziyaretçi için); robots /de/ açık, /de/giris kapalı; PWA manifest ziyaretçi dilinde; Türkçe tanıtım videosu yalnızca Türkçe sayfada.

### D144 — Almanca yazım dili (project.language = de)
- Çalışmanın yazım dili artık `tr | en | de` (`lib/writing-lang.ts`: writingLang, LANG_NAME, LANG_TAG). Veritabanı değişikliği yok (sütun serbest metin); API şemaları de kabul eder.
- Atıf motoru (CiteLocale de): DGPs/APA’nın Almanca uygulaması — S., o. J., Hrsg., Aufl., „Zugriff am“, Almanca ay adları, Literaturverzeichnis; Harvard “In: … (Hrsg.)”, MLA/IEEE “S.”. ISNAD’da Almanca başlıklar özgün büyük/küçük harfiyle kalır (isGermanTitle).
- Tablo/şekil: Tabelle, Abbildung (IEEE/MLA: Abb.), Anmerkung; Almanca başlıklar da ayrıştırılır. Bölüm başlıkları (EINLEITUNG, METHODE, Problemstellung …) ve dışa aktarma etiketleri (Inhaltsverzeichnis, Betreuung) Almanca; Word/PDF/Markdown/LaTeX (babel ngerman, biblatex ngerman-apa, csquotes german).
- Yapay zekâ: bağlamda “ALMANCA YAZIM” kuralı; Özet eylemi Almanca çalışmada Zusammenfassung + English Abstract (ABSTRACT_INSTRUCTION_DE). Başlık, kurgu, savunma, sunum, hafıza, otomatik tamamlama Almanca.
- İstatistik (APA raporları) ve grafikler Almanca; PRISMA şeması, yöntem metni, veri çıkarma/kalite etiketleri Almanca; anket Likert ifadeleri ve onam şablonu Almanca.
- Dil ve çeviri: TR ↔ EN ↔ DE (kaynak ve hedef seçilir), Almanca dil denetimi (Duden), terim sözlüğüne isteğe bağlı Almanca sütun (satır en az iki dilde dolu). detectLang Almancayı tanır.
- Düzeltilen hata: Almanca arayüzde Konu bulma isteği (dil = de) sunucuda reddediliyordu.
- Kullanıcının değiştirmediği aşama adları dışa aktarmada çalışmanın diline çevrilir (EN için de geçerli; önceden Türkçe kalıyordu).

## D145 — İndirim kodları, sayfa hakkı ve davet ödülü (2026-11-14, migration 38)
**İndirim kodları.** Yönetim → “İndirim kodları” (yalnızca yönetici): kod, yüzde veya TL tutarı, geçerli paketler (boş = tüm ücretli paketler), son kayıt tarihi, kullanım sınırı, not. Her paket için liste/indirim/indirimli fiyatın TL ve dolar karşılığı (kur: billing.margin.usd_try) önizlenir; kod başına kullanım sayısı, kayıt bağlantısı (`/kayit?kod=KOD`) ve kodla kaydolanların listesi. Kod kayıt formundaki “İndirim kodu (varsa)” alanından veya bağlantıdan gelir; e-posta kaydında `options.data.discount` → `handle_new_user` → `claim_discount_code` (tek seferlik, etkin, süresi dolmamış, sınır aşılmamış; `uses` artar); Google/Apple ile kayıtta geri dönüş adresindeki `kod` → `attachDiscount` (15 dk penceresi). Kod `profiles.discount_code`’a kalıcı bağlanır (kullanıcı değiştiremez; `discount_codes` tablosunda politika yok → kullanıcı kodları okuyamaz). Ödeme WhatsApp’tan olduğundan indirimli fiyat yükseltme penceresinde, Hesap sayfasında ve hazır WhatsApp mesajında (kod + liste fiyatı) görünür; yönetici kullanıcı ayrıntısında kodu ve paket başına indirimli fiyatı görür. Pasif/son tarih/sınır yalnızca yeni kayıtları etkiler; kod silinirse bağlı kullanıcılardan da kalkar (ON DELETE SET NULL). Saf kurallar `lib/discount.ts`, sunucu `lib/discount-server.ts`, uç `api/admin/discounts`.

**Sayfa hakkı paket kartıyla birebir.** Paket kartlarındaki “ayda N sayfa” (Ücretsiz 5, Basic 25, Pro 50, Premium 85) artık gerçek sınırdır (“yaklaşık” kalktı). Yapay zekânın yazdığı `:::taslak` kelimeleri her istekte `usage_events.meta.words`’e yazılır (seçili metin yeniden yazılınca yalnızca net artış: `chargedWords`); `usage_words` RPC aylık toplamı verir; 1 sayfa = 344 kelime (D95 Türk tez biçimi; `lib/pages.ts`). Yeni metin yazan eylemler (`PAGE_ACTIONS`: draft, expand, synthesize, methodology, discussion, interpret, abstract, from_notes, ethics_docs, cover_letter, reviewer_response) hak dolunca 402 `limit_pages` alır; soru-cevap, kısaltma, üslup, kontrol açık kalır (hak bitince modele “taslak yazma” talimatı). Kurgudaki hedef uzunluk kalan kelimeyle sınırlanır. Hesap ve panelde “Yapay zekâ ile yazılan sayfa” sayacı, %80 uyarısı. Tek Proje ve yönetici sınırsız.
Maliyet–gelir bağı korunur: sayfa vaatleri D95’te 1/3 maliyet bütçesinden hesaplandı; maliyet tavanı (costCapUsd) güvenlik ağı olarak kalır. İstek sınırı sayfa dolmadan engellemesin diye adil kullanım düzeyine çekildi (Basic 50, Pro 90, Premium 150; Ücretsiz 10).

**Davet ödülü = bir Ücretsiz paket, daha fazlası değil.** Yalnızca davet eden, davet edilen kayıt olup e-postasını doğruladığında bir kez: Ücretsiz paketin aylık hakları kadar istek + tarama + **sayfa** (yeni kredi türü `pages`, 60 gün, tek seferlik bakiye — creditPool). Metinler (fiyatlar, hediye kutusu, hesap, bildirim, rehber, SSS, asistan) güncellendi; yönetim Davetler ekranındaki eski “ikisine de” ifadesi ve aylık sayaç düzeltildi.

## D146 — Kullanıcıya özel yönetici bildirimi (2026-11-14)
Yönetim → Kullanıcılar → kullanıcı ayrıntısı → “Bildirim gönder”: başlık (≤120), mesaj (≤2000), isteğe bağlı site içi bağlantı. `notifications` tablosuna `admin_message` türüyle yazılır (yeni migration gerekmez; tablo migration 24). Kullanıcı zil simgesindeki kutuda görür; mesaj yazıldığı gibi (çevrilmeden, satır sonlarıyla) gösterilir, bağlantı varsa “Aç”. Bağlantı yalnızca `/` ile başlayan site içi yol olabilir (`lib/notify.ts` INTERNAL_LINK_RE; dış adres, `//`, ters eğik çizgi reddedilir — açık yönlendirme/oltalama önlemi), hem sunucuda hem gösterimde denetlenir. Ayrıntı ekranında gönderilen mesajlar okundu/okunmadı bilgisiyle listelenir. Aynı ekrandaki “Ek kullanım hakkı ver”e sayfa alanı eklendi (D145 sayfa kredisi; migration 38 gerekir).

## D147 — Ana sayfada akademisyen görüşleri (2026-11-14)
Site sahibinin ilettiği 7 görüş (`lib/testimonials.ts`, bileşen `components/landing/testimonials.tsx`) ana sayfada İlkeler’den sonra, paketlerden önce (`#gorusler`). Metinler özgün dilinde ve değiştirilmeden; her dilde aynı görüşler gösterilir (çevrilip kişinin sözü gibi sunulmaz). Yıldızlar yalnızca görsel; Review/AggregateRating yapılandırılmış verisi EKLENMEZ (Google kendi ürününe ait yorum işaretlemesini kabul etmez; D107 ilkesi). Görüşlerin gerçekliği ve kişilerin ad/unvanla yayın izni site sahibinin sorumluluğundadır; yeni görüş yalnızca site sahibi iletirse eklenir, uydurulmaz.

## D148 — Sade ve zarif arayüz (2026-11-14)
Kullanıcı, rakip bir yazım uygulamasının ekranlarını örnek gösterip “kibar, zarif renkler ve metin tarzı” istedi. Ekranlar kopyalanmadı; yalnızca genel tasarım dili uygulandı, kendi düzenimiz korundu:
- Renk: ink ölçeği nötr griye (mavi alt ton kaldırıldı), marka mavisi indigoya (#4f46e5) çevrildi; zemin beyaza yakın (252 252 253), çalışma alanı beyaz. Gece modu nötr koyu grilerle.
- Düğmeler: birincil düz indigo (degrade ve ağır gölge yok); siyah dolgu düğmeler (bg-ink-900 + beyaz yazı) global CSS ile indigoya döner; çalışma alanı üst çubuğundaki düğmeler çerçevesiz.
- Kartlar: daha hafif gölge (shadow-soft), ince çizgi.
- Editör: Inter (sade) yazı tipi 16,5 px, satır aralığı 1,8, sola yaslı (iki yana yaslama kaldırıldı); atıflar kutucuk yerine metin içinde indigo bağlantı gibi. Word/PDF çıktı biçimi DEĞİŞMEDİ.
- Araç çubuğu: kart/gölge yerine düz satır, alt çizgiyle ayrılır; etkin düğme açık indigo zemin.
- Uygulama içinde (.app-ui: AppShell ve çalışma alanı) serif başlıklar sade yazı tipine döner; logo yazısı (.wordmark) ve tanıtım sayfası serif başlıkları korunur.
- Gece modunda beyaz degradeler (from/via/to-white) koyu yüzeye döner. Servis çalışanı sürümü v5.
- D148 ek (2. tur, kullanıcı “hâlâ aynı” dedi): yerleşim de sadeleşti — kenar menüsü üstte kullanıcı adı + açılır menü (hesap, dil, tema, çıkış), “Yeni çalışma” indigo bağlantı, düz menü satırları, altta “Paketi yükselt”; çalışma alanında yol haritası ince ilerleme çubuğu, bölüm listesi gölgesiz/açık gri seçili, rozetler sade metin; araç çubuğunda metin biçimi açılır listesi (Metin/Alt başlık 1–3) ve üst satırda “Otomatik tamamlama” anahtarı; asistan panelinde kabarcıksız yanıt, açık gri kullanıcı mesajı, tek tip kısayol düğmeleri; sekmeler ve pencereler düz; kontrol panelinde sakin başlık, tek kartta istatistik satırı, düz proje kartları. Servis çalışanı v6.

## D149 — İçe aktarma, kaynak tercihleri ve seçim menüsü (2026-11-14)
Kullanıcı bir rakip uygulamanın ekranlarındaki özellikleri istedi (ekranlar kopyalanmadı; işlevler kendi tasarımımızla):
- **Seçim menüsü** “Yapay zekâ ile düzenle”: Yazıyı güçlendir (akıcılık, yeniden ifade, basitleştir, argümanı güçlendir, karşı argüman), Akademik üslup (resmîlik, teknik hassasiyet, iddia güvenini artır/yumuşat), Dönüştür (geçmiş/şimdiki zaman, madde/numaralı liste, tablo, düzyazı). Yeni ASSISTANT_ACTIONS (çoğu Haiku, argüman/karşı argüman/teknik Sonnet); atıflar korunur, yeni kaynak/veri uydurulmaz, karşı argüman yalnızca projedeki kaynaklarla ya da [KAYNAK GEREKLİ]. Sonuç asistan panelinde, “Seçimin yerine koy”.
- **Kaynak tercihleri** (`lib/research-prefs.ts`, project.context.research): veri tabanı taraması Otomatik / Her seferinde sor / Kapalı; yayın yılı (Tümü, Son 5/10 yıl, Özel); en az atıf (atıf sayısı bilinmeyen kayıtlar elenmez — DergiPark); ön baskılar. Sohbette arama sonuçlarına filterByPrefs; “Kapalı”da yalnızca açık istekte tarama; “Her seferinde sor”da planlayıcı tarama gerektiğini söylerse `research_permission` olayı ve izin kartı (Atla / Her zaman izin ver / Bu sefer izin ver); karar `research: allow|skip` ile yeniden gönderilir (kullanıcı mesajı ikinci kez kaydedilmez, geçmişten düşülür). Eksik konu araması da tercihe uyar. Proje ayarları’nda aynı form (`components/research-prefs-form.tsx`). Etki faktörü filtresi yok (lisanslı veri yok; uydurulmaz).
- **Yeni çalışma sihirbazı** 5 adım: tür (+ “Mevcut çalışmamı içe aktar”), akademik profil, araştırma bilgileri (konu tanımı gücü göstergesi — `promptStrength`, yapay zekâsız), kaynak tercihleri (atıf stili burada), yapı (Standart bölümler / Akıllı bölüm planı — kurgu modülü / Serbest — tek “Metin” bölümü + kaynakça). context.structure; standard/free/imported’da kurgu penceresi kendiliğinden açılmaz. Proje oluşturma `lib/project-create.ts` (ortak).
- **Mevcut çalışmamı içe aktar** (`api/projects/import`): Word/PDF/TXT → düğümler (Word: mammoth; PDF: pdf-clean + `textToNodes` sezgisel başlık) → kaynakça ayrılır → yapay zekâ (Haiku, JSON şema) yalnızca künyeyi çıkarır (tür, seviye, yöntem, disiplin, dil, konu, anahtar kelimeler, atıf stili; metin yeniden yazılmaz) → proje oluşturulur → kaynakça doğrulanıp eklenir (`addReferenceLines`, Word içe aktarmayla ortak) → en üst düzey başlıklara göre bölümler (`splitIntoSections`, yaygın bölüm adları aşama anahtarına eşlenir) → atıflar bağlanır → çalışma ekranı açılır. Kullanıcının kendi metni sayfa hakkından düşmez; künye analizi 1 yapay zekâ isteği sayılır.
- **İçe aktarma merkezi** (çalışma ekranında üstte “İçe aktar”, her an): Tüm çalışmamı içe aktar (`api/projects/[id]/import-work`: boş aynı tür bölümü doldurur, gerisini yeni bölüm ekler, dolu bölümün üzerine yazmaz; kaynakça sonda kalır), Bu bölüme Word’den aktar, PDF dosyaları yükle (files → to-source), Zotero (`api/projects/[id]/sources/zotero`: Zotero Web API, kullanıcı/grup kimliği + okuma izinli anahtar, anahtar saklanmaz, en fazla 300 kayıt, CSL-JSON), Mendeley (resmî API OAuth uygulama kaydı istediğinden BibTeX/RIS dosyasıyla — kullanıcıya açıkça söylenir), DOI/PMID/arXiv, .bib/.ris. Kaynak listesi içe aktarma ortak `lib/sources/import-refs.ts`.

## D150 — İddia denetiminde “kısmen/desteklemiyor” oranı (2026-11-14)
Kullanıcı sonuçların çoğunlukla “kısmen” veya “desteklemiyor” çıktığını bildirdi. Denetim ölçütü GEVŞETİLMEDİ (sonuç zorla “destekliyor” yapılırsa denetim anlamsızlaşır, öğrenci yanıltılır); iki kök neden düzeltildi:
1. Yazım: sabit bağlama “ATIF DOĞRULUĞU” kuralı — cümleye yalnızca ana bilgisini açıkça söyleyen kaynakla atıf; sayı/yön/örneklem aynen; “ilişkili” → “etkiler” yapılmaz; kaynaktaki temkin korunur; yalnızca künyesi bilinen kaynağa bulgu atfedilmez; her bilgi kendi kaynağına.
2. Denetim: cümle başına 3 yerine 4 parça okunur; “kısmen / desteklemiyor / yetersiz” çıkanlar (kaynakta 4’ten fazla parça varsa) 9 parçayla yeniden okunur. Yeni karar yalnızca daha iyiyse, “destekliyor” ise de kaynaktan birebir doğrulanan alıntıyla alınır. “Çelişiyor” kararları değişmez. AUDIT_VERSION 4 (eski sonuçlar yeniden denetlenir).

## D151 — Ana sayfa manşeti: resmî, ortalanmış; temel mesaj (2026-11-14)
Manşet ortalandı; eğik ve renkli degrade vurgu kaldırıldı (dik serif, kalın). Temel mesaj: “Yapay zekâ destekli eksiksiz akademik araştırma ve çalışma alanı” — bütün araçlar bir arada, süreç baştan sona tek yerden yönetilir, tekrarlayan işleri sistem üstlenir ve kullanıcı zihnini araştırmaya ayırır. Manşet altında 6 adımlık süreç şeridi (konu → kurgu → kaynaklar → yazım → analiz → denetim ve teslim). Ana sayfa meta açıklaması aynı mesaja göre (TR/EN/DE). Diğer eğik yazılar (özellik başlığı, adım numaraları) dikleştirildi. Kullanıcının istediği “yaklaşık 20 kat hızlandırır” ifadesi ölçüme dayanmadığı için eklenmedi (ticari reklam mevzuatı: sayısal performans iddiası kanıtlanabilir olmalı); ölçüm yapılırsa eklenebilir.

## D152 — “20 kat” ifadesi (2026-11-14)
Site sahibi kendi kullanımında yaklaşık 20 kat hızlandığını beyan etti. Manşet altına kurucunun kendi deneyimi olarak, kişiye bağlı tırnaklı beyan biçiminde eklendi (genel performans garantisi olarak değil). Ölçümlü kullanıcı testi yapılırsa genel ifadeye çevrilebilir.
Güncelleme: site sahibinin isteğiyle ifade kaldırıldı.

## D153 — Yeni TÜBİTAK programları + program rehberleri (2026-11-12)
2209-A rehberinin ilgi görmesi üzerine benzer dört program eklendi: 1002-A Hızlı Destek, 3005 Sosyal ve Beşeri Bilimlerde Yenilikçi Çözümler, 2204-A Lise Öğrencileri Araştırma Projeleri, 2242 Üniversite Öğrencileri Araştırma Proje Yarışmaları (`GRANT_PROGRAMS`). Her programın yapay zekâ bağlamına giren kısa notu var (`PROGRAM_NOTES` → context.ts). 2204-A ve 2242 yarışma olduğu için bütçe bölümü çıkarılır (burs gibi). Sihirbaz `?program=` parametresini okur. Her program için TR/EN/DE blog rehberi (posts-6, en-6, de-6); 2209-A yazısından bu rehberlere iç bağlantı, alt bilgiye 2242 bağlantısı. Tutar, süre, takvim gibi çağrıya göre değişen ayrıntılar yazılmadı; metinler güncel çağrı duyurusunun kontrol edilmesini söyler (uydurma yok ilkesi). Test: tests/grant-programs.test.ts.

## D154 — Hukuki metinler ve uyumlu uygulama davranışı (2026-11-13)
Hukukçunun hazırladığı yedi metin (PDF, 13 Kasım 2026) yayımlandı ve uygulama bu metinlerle uyumlu hâle getirildi.
- **Sayfalar:** /kvkk, /kosullar, /adil-kullanim, /cerez-politikasi, /akademik-durustluk, /mesafeli-sozlesmeler, /gdpr; TR öneksiz, /en, /de. Türkçe metinler ve GDPR’ın İngilizce aslı PDF’ten kelimesi kelimesine alındı (kaynak `docs/legal/yasal-metinler-2026-11-13.txt`; tests/legal.test.ts denetler). Diğer diller çeviridir ve sayfada “aslı Türkçedir/İngilizcedir; bu sayfa çevirisidir” yazar — PDF bağlayıcı dili belirlemediği için hangi dilin bağlayıcı olduğu söylenmez. Eski /gizlilik (üç dilde) 308 ile /kvkk’ya. İçerik `lib/legal/content-*.ts` (yalnızca sunucu bileşenleri), meta `lib/legal/docs.ts`. Metinlerdeki “yayımdan önce eklenmelidir” notları PDF’in kendi ifadesi olduğu için olduğu gibi yayımlandı.
- **Sürüm ve kabul:** `legal_acceptances` (migration 39): user_id, doc, version, kind (accept = sözleşme kabulü / notice = bilgilendirme gösterildi; açık rıza değildir), source (email/google/apple/consent_page/purchase), context, accepted_at. Yalnızca sunucu ve kayıt tetikleyicisi yazar; kullanıcı kendi kayıtlarını okur; UPDATE her rol için yasak. Sürümü ve zamanı sunucu belirler. Belgenin `version` değeri değişince `requiresAcceptance` olan belgeler (bugün yalnız Kullanım Koşulları) uygulama sayfalarından önce /sozlesme-onayi’nde yeniden sorulur.
- **Kayıt/giriş:** e-posta kaydında ayrı ve zorunlu “Kullanım Koşulları’nı okudum ve kabul ediyorum” kutusu; KVKK Aydınlatma Metni yalnızca bağlantı (onay kutusu yok); pazarlama izni yok. Kabul kullanıcı meta verisinde (`legal`) gelir, `on_auth_user_legal` tetikleyicisi kaydeder. Google/Apple’da örtülü kabul metni kaldırıldı; ilk girişte onay sayfası.
- **Hesap:** “Gizlilik ve Veri Yönetimi” — JSON indirme (export artık KVKK metnindeki tüm kayıtları içerir), veri talebi her zaman, danışman paylaşım bağlantılarını listeleme/iptal, kabul edilen belge sürümleri, silme öncesi/sonrası açık bilgi. Hesap silme alt klasördeki ve 1000’den fazla dosyayı da siler (önceden Overleaf ZIP’leri kalıyordu). Ayrıntı docs/ACCOUNT_DELETION.md.
- **Çerezler:** envanter `lib/consent.ts`; politika ile kod aynı (tests/consent.test.ts). İzin gerektiren teknoloji yok → şerit gösterilmez. Eklenirse `ConsentGate`/`hasConsent` ile izin olmadan çalışmaz. Cihaz kimliği için hukuki karar bekleniyor: `SECURITY_REQUIRES_CONSENT = false` (bugünkü davranış), true yapılırsa izinle çalışır.
- **Satın alma:** yükseltme penceresinde WhatsApp’tan önce “Okudum: Mesafeli Sözleşmeler ve Ön Bilgilendirme ve Adil Kullanım Politikası” kutusu; kayıt kind=notice, source=purchase, context.plan. Cayma hakkından feragat/anında ifa onayı EKLENMEDİ (hukuki karar).
- **Yönetim:** kullanıcı ayrıntısında hukuki kayıtlar ve KVKK talepleri; Kilitler’de son veri talepleri ve hesap silmeler.
- **Güvenlik:** hata kayıtlarında e-posta, telefon, IP ve belirteçler maskelenir (`lib/pii.ts`).

## D155 — Ücretli indirme kaldırıldı; hak dolunca salt okunur kullanım (2026-11-13)
Site sahibinin isteği. (1) 100 TL “mevcut çalışmayı indir” hakkı (D50) kaldırıldı: yönetim ekranı, POST/DELETE admin/locks, hasDownloadPass, DOWNLOAD_PRICE_TL. `download_passes` tablosu silinmedi (yıkıcı migration yok; eski kayıtlar veri dışa aktarımında görünür). Herkes çalışmasını paket biçimlerinde ücretsiz indirir (biçim sınırları aynı — site sahibinin kararı). (2) Aylık sayfa veya yapay zekâ hakkı (istek; token ve maliyet tavanı da) dolunca kullanıcı salt okunur: yalnızca görüntüleme, indirme, hesap/KVKK işlemleri, bildirim, geri bildirim, paylaşım iptali ve herkese açık ücretsiz araçlar. Elle düzenleme dâhil her şey kapalı (site sahibinin kararı). Yalnızca tarama hakkı dolarsa yalnızca tarama durur (değişmedi). D81’in “çalışma her zaman düzenlenebilir” kuralı bu kadarıyla değişti.
Uygulama: `lib/read-only.ts` (izinli uç listesi — varsayılan yasak; yeni API uçları salt okunur kullanıcıya kendiliğinden kapalı), `route()` istek bağlamına uç adını yazar, `requireUser` → `assertNotReadOnly` (402 `work_locked`, 15 sn önbellek). Arayüz: çalışma alanı salt okunur açılır (asistan/araçlar gizli, yerel taslak geri yükleme beklemede), üst şerit ve yükseltme penceresi metinleri, SSS/rehber/asistan yardımı güncellendi. Veritabanı düzeyinde (RLS) yazma kilidi eklenmedi: tarayıcı tablolara doğrudan yazmıyor; eski RLS kilidi okumayı da kapattığı için kullanılmadı.
Kullanım Koşulları’ndaki “hak dolduğunda … düzenleyebilir” cümlesi bu davranışla çelişiyor; hukuki metin değiştirilmedi, hukukçuya not: docs/legal/HUKUKCU_NOTU_D155.md. Test: tests/read-only.test.ts.

## D156 — Krem tema ve SSS “Neden Academiana?” (2026-11-13)
Site sahibi mavi (indigo) vurguyu beğenmedi. `brand` ölçeği krem tonlarına çevrildi (50–400 krem dolgu, 500 karamel, 600–900 okunur karamel-kahve, 950 koyu kahve). Beyaz yazılı mavi dolgular (birincil düğme, numaralı adımlar, rozetler) krem zemin + `text-brand-950` oldu; yazısız dolgular (çubuk, anahtar) `bg-brand-500`. Siyah düğmeler (`bg-ink-900 text-white`) CSS ile krem + koyu yazı; gece modunda koyu kahve yazılar açık kreme döner. indigo/sky/blue sınıfları ve sabit mavi renkler (globals.css, litmap, hero/fiyat arka planları, tarayıcı tema rengi) kaldırıldı; mor rozetler (violet) ve grafik veri paleti (viz-*) değişmedi. Logo görseli değiştirilmedi. SSS’ye 7 soruluk “Neden Academiana?” grubu (TR/EN/DE): yalnızca doğrulanabilir güçlü yanlar (16 veri tabanı, doğrulama, altyapı, model seçimi, araçlar, 10 atıf stili, şeffaflık); uydurma kullanıcı yorumu, puan veya kanıtlanamaz üstünlük iddiası yok (D147). Testlerin her yayında zorunlu çalıştığı yazılmadı (CI yok).

## D157 — Aylık/yıllık ödeme; Tek Proje 1 ay, her şey sınırsız (2026-11-13)
Site sahibinin isteği. **Yıllık ödeme** (Basic/Pro/Premium): güncel aylık fiyata %20 indirim (`yearlyMonthlyPrice` = round(aylık × 0,8), yıllık toplam = aylık karşılık × 12; fiyat kartında ikisi de görünür). Haklar düşmez: aylık hakların 12 katı (sayfa, istek, token, tarama, maliyet tavanı; proje/depolama aynı) paket başında tanımlanır ve 1 yıl kullanılır (`scaleForPeriod`, `periodFor`/`usagePeriod`: yıllık ve etkin pakette sayaç `plan_started_at`’ten, aksi hâlde takvim ayından). Profil: `plan_period` (monthly|yearly), `plan_started_at` (migration 40; kullanıcı değiştiremez). Yönetici “Paket ata”da Aylık/Yıllık seçer; yıllık 365 gün. Yıllık indirim indirim kodu ve ekip indirimiyle birleştirilmez (karar: tek indirim). Yükseltme penceresinde ve fiyat kartlarında Aylık/Yıllık seçimi; WhatsApp mesajı dönemi ve tutarları içerir. **Tek Proje**: tek ödeme, 1 ay (`SINGLE_PLAN_DAYS`), her şey sınırsız (çalışma, istek, sayfa, tarama, depolama, maliyet tavanı yok; adil kullanım), çalışmaya bağlanmaz. Bitiş tarihi olmayan eski Tek Proje’ler eski kurallarla sürer (`isLegacySingle`; DB tetikleyicileri `plan_expires_at is null` koşuluyla). Süresi dolan her paket (Tek Proje dâhil) ücretsize düşer. Hukuki metinler değiştirilmedi; hukukçu notu docs/legal/HUKUKCU_NOTU_D157.md. Test: tests/billing.test.ts, db.test (migration 40).

## D158 — Tek Proje → “Sınırsız Kullanım” (2026-11-13)
Site sahibinin isteği. Paket adı “Sınırsız Kullanım” (iç kimlik `single` değişmedi; mevcut kayıtlar ve eski süresiz Tek Proje’ler bozulmasın). Tek sınır en fazla 5 proje (`assertProjectQuota`); yapay zekâ, sayfa, token, tarama, depolama, maliyet tavanı sınırsız; tüm özellikler ve ortak yazarlar açık (`PLAN_RANK.single = 4`, en üst paket). Artık tek ödemeli değil: aylık (30 gün) veya yıllık (%20 indirimli, 365 gün) atanır; yıllıkta ₺3.199/ay, toplam ₺38.388 (`price_yearly` de yazılır). Yönetim gelir hesabı artık bu paketi sayar. Migration 40 henüz canlıda çalıştırılmadığı için yeni migration açılmadı, 40 güncellendi. Eski süresiz Tek Proje (bitiş tarihi yok) kuralları değişmedi. Hukukçu notu: docs/legal/HUKUKCU_NOTU_D157.md (D158 bölümü).

## D159 — Sınırsız Kullanım yıllıkta 60 proje (2026-11-13)
Site sahibinin isteği: Sınırsız Kullanım (single) aylık ödemede en fazla 5, yıllık ödemede en fazla 60 aktif proje; diğer her şey her iki dönemde sınırsız. `projectLimitFor` (pricing.ts) yalnızca bu pakette ve yalnızca yıllıkta 60 döndürür; `effectiveLimits` (scaleForPeriod) ve `assertProjectQuota` dönemi dikkate alır. Diğer paketlerin proje sınırı dönemle değişmez. Veritabanı değişikliği yok (paket kaydında 5 kalır; 60 kodda hesaplanır). Fiyat kartı ve yükseltme penceresi yıllıkta “En fazla 60 proje” gösterir.

## D160 — Akademik Ekip İndirimi %20 (2026-11-13)
Site sahibinin isteği: `TEAM_DISCOUNT.percent` 30 → 20 (en az 3 kişi aynı). Ekip kartı, kurumlar ve hesap sayfası, WhatsApp mesajları sabitten okur; SSS (TR/EN/DE) ve fiyatlar sayfası arama açıklaması güncellendi. Hukukçunun Mesafeli Sözleşmeler metnindeki “(%30)” değiştirilmedi; hukukçu notuna eklendi.

## D161 — Sınırsız Kullanım kart açıklaması yıllıkta 60 proje (2026-11-13)
Paket açıklaması veritabanından gelir (“En fazla 5 proje dışında…”); yıllık görünümde `yearlyDescription` bu paket için “En fazla 60 proje dışında…” gösterir (TR/EN/DE). Veritabanı değişikliği yok.

## D162 — “Sınırsız Proje” adı, ekip indirimi kapsamı, ücretsiz araçlar, Adil Kullanım metni (2026-11-13)
Site sahibinin isteği: (1) Paketin adı her yerde “Sınırsız Proje” (EN Unlimited Project, DE Projekt Unbegrenzt); migration 41 veritabanındaki adı değiştirir. (2) Akademik Ekip İndirimi yalnızca Basic, Pro, Premium (`TEAM_PLANS`, ekip kartı ve metinler). (3) Sınırsız Proje üyeleri ücretsiz araçları saatlik sınır olmadan kullanır (`hasUnlimitedTools`; consensus, fake-check, lookup). (4) Adil Kullanım Politikası’nda “Tek Proje paketi” bölümü site sahibinin talimatıyla “Sınırsız Proje paketi” olarak yeniden yazıldı: 1 ay geçerli (yıllıkta 1 yıl), proje sayısı (aylıkta 5, yıllıkta 60) dışında her şey ve ücretsiz araçlar tamamen sınırsız; eski Tek Proje satın alımları eski koşullarla sürer. “İhlal sayılabilecek davranışlar” giriş cümlesi eski Tek Proje’ye daraltıldı. TR/EN/DE. Bu bölümler hukukçunun PDF metninden farklıdır; tests/legal.test.ts diğer bölümlerin PDF ile aynı olduğunu denetler.

## D163 — Krem tema geri alındı, indigo maviye dönüldü (2026-11-13)
Site sahibi krem rengi beğenmedi; D156’nın renk değişiklikleri birebir geri alındı (marka ölçeği indigo, beyaz yazılı dolgu düğmeler, gece modu kuralları, tarayıcı tema rengi #0f1d3d). D156’daki SSS “Neden Academiana?” bölümü korundu. Sonradan eklenen Aylık/Yıllık seçici de indigo dolguya çevrildi.

## D164 — Kapsamlı SEO: teknik düzeltmeler, yeni rehberler, mobil hız (2026-11-13)
Site sahibinin “Kapsamlı SEO optimizasyonu” talimatı. Denetim, plan ve ölçümler: `docs/seo/SEO_PLAN.md`.
(1) `next.config.ts` `htmlLimitedBots`: botlar meta verileri `<head>` içinde alır (önce akışla `<body>`’ye düşüyordu). (2) `relatedPosts` kategori içi döngüsel komşular + ortak anahtar kelime: her yazı ≥3 iç bağlantı. (3) `BlogPost.updated` / `sources`: görünür “Güncellendi” ve “Kaynaklar”, JSON-LD `dateModified` / `citation`, site haritası `lastmod`; yazar Organization olarak kaldı (sahte kişi yazar yok). (4) Üç yeni rehber TR/EN/DE (`posts-7.ts`, `en-7.ts`, `de-7.ts`): t testi, normallik, ISNAD; sayılar ve atıf örnekleri ürünün kendi motorlarıyla üretildi, `tests/seo-d164.test.ts` metni motorla karşılaştırır; ISNAD örnek künyeleri kurgusal olarak belirtildi; Academiana’nın Shapiro–Wilk hesaplamadığı açıkça yazıldı. (5) `/araclar` sayfasına aşama → araç → rehber bölümleri. (6) EN/DE arayüz sözlüğü HTML’e gömülmüyor; `I18nProvider` sözlüğü ayrı, önbelleğe alınan JS parçasından yükler (`use`, kancasız dış bileşen — kancalı bileşende React #467 hatası verdi). Sayfa ~148 KB → ~17 KB (sıkıştırılmış), mobil laboratuvar FCP 2,85 → 1,40 sn. Demo paketi `dict` prop’unu vermeye devam eder. (7) Logo/amblem gösterim boyutuna küçültüldü (`-web.png`; 140 KB → 11 KB); büyük asıllar OG görseli ve yapılandırılmış veri için duruyor. Sayısal arama hacmi verisine erişim olmadığı için anahtar kelime önceliği nitel tahmindir.

## D165 — Yeni uygulama simgesi ve favicon (2026-11-13)
Site sahibinin gönderdiği simge (lacivert zemin, “A” + açık kitap + turkuaz onay işareti) uygulama kurulum simgesi (PWA 192/512, maskable — %80 güvenli alanda), Apple dokunmatik simgesi, favicon (ico, 32/48/96) ve Google arama sonucundaki site simgesi olarak kullanılır; yapılandırılmış verideki Organization logosu da `icons/icon-512.png` olduğundan güncellendi. Önbellek için adreslere `?v=2`, service worker `academiana-v8`; kurulum açılış ekranı rengi lacivert (#020d2d). Sitedeki üst bilgi/alt bilgi logoları değişmedi.

## D166 — Hukuki metinlerden taslak / çalışma notları kaldırıldı (2026-11-13)
Site sahibinin talimatı: hukuki metinler yürürlükteki gerçek metinlerdir; “taslak”, “yayımdan önce eklenmelidir”, “bilgi notuna göre / bildirilmiştir”, “…ayrıca değerlendirilmelidir”, “teyit edilmemiştir” gibi çalışma notu cümleleri yedi belgede üç dilde kaldırıldı veya düz hüküm cümlesine çevrildi (ör. “Veri talebine 30 gün içinde ücretsiz yanıt verilir.”). Kullanıcı yükümlülükleri (ör. “Kullanıcı … uymalıdır”) korundu. GDPR’daki 2FA/ihlal prosedürü/bağımsız test bulunmadığına dair not ve OpenAI “teyit edilmedi” cümleleri de kaldırıldı. Çerez envanterinde “taslak yedeği” → “yazı yedeği”. Belgelerin sürümü 2026-11-14 (Kullanım Koşulları’nda kullanıcılar bir kez yeniden onaylar). CLAUDE.md ilke 7’deki “Türkçe metin değiştirilmez” kuralının istisnası site sahibinin bu talimatıdır; `tests/legal.test.ts` artık bölüm başlıklarını hukukçu metniyle, metinlerde taslak ifadesi olmadığını denetler.

## D167 — Kullanım Koşulları ve Mesafeli Sözleşmeler’de güncel paketler (2026-11-13)
Site sahibinin talimatı: paket listesi aylık/yıllık ödeme (Basic, Pro, Premium, Sınırsız Proje), yıllıkta %20 indirim ve 12 aylık hak, Akademik Ekip İndirimi %20 (yalnızca Basic, Pro, Premium) olarak güncellendi; Mesafeli Sözleşmeler’deki “Tek Proje paketi” bölümü “Sınırsız Proje paketi” oldu (aylıkta 1 ay/en fazla 5 proje, yıllıkta 1 yıl/en fazla 60 proje); yenileme bölümü aylık ve yıllık paketleri kapsar. Eski koşullarla alınmış Tek Proje paketlerine ilişkin cümleler (kazanılmış haklar, indirme kayıtları) korundu. TR/EN/DE; sürüm 2026-11-14 (D166 ile aynı gün yayımlanan revizyon).

## D168 — Denetim düzeltmeleri: salt okunur koşul metni, yıllık fiyat, CDN önbelleği, çeviri ve hitap (2026-11-13)
Site sahibinin talimatı (denetim raporu sonrası): (1) Kullanım Koşulları: sayfa veya yapay zekâ hakkı dolunca çalışmalar yalnızca görüntülenip indirilebilir, düzenleme ve diğer özellikler kapalı, ücretsiz araçlar açık, yalnızca tarama hakkı dolunca sadece tarama durur (TR/EN/DE; altyapı D155’te zaten bunu uyguluyordu; SSS aynı). Koşulların sürümü 2026-11-15 (kullanıcılar yeniden onaylar). (2) Migration 42: `price_yearly` her zaman round(aylık × 0,8) × 12 (tetikleyici; mevcut fiyatlar düzeltildi; yönetim panelinde yıllık alan salt okunur; yedek fiyat listesi güncellendi). (3) SSS güvenlik cevabına yapay zekâ işlemlerinin ABD’deki Anthropic’e gittiği eklendi; test sayısı her yerde “500’den fazla”. (4) Tanıtım sayfaları giriş yapmamış ziyaretçiye Vercel CDN’inden sunulur (`Vercel-CDN-Cache-Control: s-maxage=300, stale-while-revalidate=86400`, ara katmanda; oturum çerezi varsa eklenmez); önbellekteki HTML herkese aynı olsun diye `htmlLimitedBots: /.*/` (meta veriler herkese <head> içinde) ve giriş durumuna bağlı düğmeler tarayıcıda `useSignedIn` ile düzeltilir. (5) EN/DE’de Türkçe kalanlar: “Araştırmalar ne diyor?” metinleri, “Yapay zekâ kullanılır” rozeti, örneklem hesaplayıcı hata mesajları ve sayı biçimi, ana sayfa örnek atıfları, örnek çalışmanın kurgusal kaynakları (`sampleSources`), Türkçe özet yalnızca TR’de; Türkçe görüşler EN/DE’de gösterilmez (görüşler çevrilmez); Almanca sayfalarda işaretler „[QUELLE ERFORDERLICH]“ / „[DATEN EINZUTRAGEN]“, İngilizcede “[CITATION NEEDED]”. (6) Ana sayfa karşılaştırma tablosunda “sen” dili “siz” oldu. (7) TODO’daki eski (D154 öncesi) işaretsiz maddeler kapatıldı; tekrar eden ve ileriye dönük maddeler açık.

## D169 — Gündüz modu varsayılan; kaynak seçimi ve atıf doğruluğu (2026-11-13)
Site sahibinin talimatı. (1) Tema: site her zaman gündüz moduyla açılır; yalnızca kullanıcı gece modunu seçtiyse koyu (sistem ayarı artık izlenmez; D61 yerine). Ay/güneş düğmesi telefonda tanıtım sayfalarının ve uygulamanın üst çubuğunda görünür. (2) Kaynaklar (kalite kontrol yazılımı değişmedi): otomatik seçimde (`pickForAutoAdd`) tam metni açık erişimle okunabilecek (PDF/PMC/arXiv), kalıcı tanımlayıcıyla doğrulanabilir ve künyesi eksiksiz kaynaklar öne alınır; yeterli doğrulanabilir sonuç varsa tanımlayıcısız kayıt eklenmez; sorgu başına 10 sonuç. Projeye eklemede aynı eser (aynı DOI veya aynı yıl + benzer başlık, kalite kontrolündeki ölçüt) ikinci kez eklenmez; doğrulamada DOI, adres, açık erişim bağlantısı, PMC/arXiv kimliği ve özet de kayıt otoritesinden tamamlanır. Yapay zekâ bağlamında her kaynağa “atıf önceliği” yazılır (1 tam metin, 2 özet, 3 künyesi eksik, 4 okunmamış/doğrulanmamış), kaynaklar bu sırayla verilir; en az 3 iyi kaynak varsa öncelik 4 kaynaklar “ATIF YAPMA” olarak işaretlenir; tam metin parçası sayısı 14 → 18. Amaç kalite kontrolünde “doğrulanmamış kaynak”, “eksik künye”, “yinelenen kaynak”, “yalnızca künye” bulgularının çıkmaması ve atıfların okunan içeriğe dayanması.

## D170 — Makale yapısı, veri kuralı, makale dışa aktarma düzeni, otomatik çalışmada en iyi hâli koruma (2026-11-13)
Site sahibinin otomatik çalışma testinde (dergi makalesi) bulduğu sorunlar: Giriş’ten sonra doğrudan Yöntem’e geçilmesi, konu başlığı olmaması, Yöntem/Bulgular ve özette [VERİ GİRİLECEK], belgede “Başlık, özet ve anahtar kelimeler” başlığı, özetin sayfa arasında bölünmesi, düzeltme turunun puanı düşürmesi (66 → 61).
(1) Yapı: Bilimsel dergi makalesi = Özet/Abstract → Giriş (en az 2 alt başlık) → Konu bölümleri (`article_body`, kendi başlığı yok; içindeki her ## başlık makalede ayrı numaralı ana bölüm: 2, 3, 4…; içeriğe özgü 3–6 başlık, genel IMRaD başlıkları yasak) → Sonuç (`conclusion_article`) → Beyanlar → Kaynakça. Araştırma makalesi kuramsal/sistematik derleme yaklaşımında aynı yapıda, nicel/nitel/karmada IMRaD. (2) Veri kuralı: `stageNeedsData` — “gerçek veri gerekir” işareti yalnızca tez, araştırma makalesi ve bitirme projesinde nicel/nitel/karma yöntemde (ve bütçede) geçerli; dergi makalesi, derleme, kuramsal çalışma ve özet veri istemez; kaynaklara dayalı çalışmalarda yapay zekâya [VERİ GİRİLECEK] kullanmaması söylenir. Özet istemi çalışma türüne göre (amaç–kapsam–ana tartışma–sonuç). (3) Özet aşamasının adı “Özet ve anahtar kelimeler”; belgede iş adı yerine “Özet/Abstract” numarasız başlıkları. (4) Makale dışa aktarma (PDF, Word, LaTeX): kapak ve içindekiler yok, başlık ve yazar ilk sayfanın üstünde, bölümler kesintisiz; özet ve abstract tek satır aralığı, bir punto küçük, girintisiz ve sayfa arasında bölünmez; başlıklar sayfa sonunda yalnız kalmaz (Word’de keepNext). (5) Otomatik çalışma: veri dosyası yüklenmeden makale kaynaklara dayalı (kuramsal) kurulur; konu ve giriş başlıkları içeriğe özgü planlanır; bir düzeltme turu puanı düşürürse değiştirilen bölümler tur öncesi hâline döndürülür. Kalite kontrol yazılımı değişmedi.

## D171 — Dinamik akademik yol haritası, bölüm yönetimi, kullanıcı şablonları, tutarlılık zinciri (2026-11-13)
Site sahibinin “Academiana Dinamik Akademik Yol Haritası ve Metodoloji Referansı” (v1.0) belgesine göre. Mevcut mimari korunarak genişletildi; mevcut projelerin bölümleri ve içerikleri değişmez.
(1) Motor (`lib/workflows/templates.ts`, `TEMPLATE_VERSION = 2`): yol haritası çalışma türü + düzey + yaklaşım (nicel, nitel, karma, kuramsal, sistematik derleme, meta-analiz) + desen (18 desen; yöntem rehberi ve raporlama standardı: APA JARS, STROBE, CONSORT, COREQ, SRQR, GRAMMS, PRISMA 2020) + bitirme projesi türü (araştırma, yazılım/mühendislik, işletme/vaka, eğitim/uygulama) + fon programından kurulur. Her bölümün zorunluluğu (Zorunlu/Koşullu/İsteğe bağlı), gerekçesi, kritikliği ve kapsamı (Kısa/Orta/Ayrıntılı) vardır. Nitelde “Çalışma grubu” + “İnandırıcılık”, karmada “Entegrasyon”, nicelde “Örneklem” + “Ölçme araçları”; uygulama projelerinde hipotez/örneklem/istatistik başlığı yok; araştırma önerisinde bulgu/tartışma yok; dergi makalesinde “Dergi gereklilikleri” ve “Kapak mektubu” (makale metnine ve dışa aktarmaya girmez). 22 yeni aşama (kapsam ve sınırlılıklar, etik, inandırıcılık, entegrasyon, veri çıkarımı, meta-analiz, kaynak matrisi, fon amaçları/riskleri, gereksinim analizi, uygulama, vaka bağlamı, stratejik öneriler, ihtiyaç analizi, program tasarımı, değerlendirme…). Belgedeki örnek başlıklar kopyalanmadı; başlıklar işlevine göre adlandırıldı ve yapay zekâ alt başlıkları konuya özgü üretir.
(2) Yeni proje akışı: bitirme projesi türü, yaklaşım, isteğe bağlı desen, “Yönteminizi henüz bilmiyor musunuz?” (hızlı model; gerekçe, sınırlılık ve alternatiflerle öneri; karar kullanıcının), “Kayıtlı şablonum”; önizlemede zorunluluk etiketi ve gerekçe.
(3) Çalışma alanı: bölüm ayarları (ad, açıklama, zorunluluk, kapsam, gizle, kopyala — alt başlıklar kopyalanır metin kopyalanmaz —, varsayılana döndür); kritik bölüm silinirken gerekçeli uyarı (silme yine kullanıcıda); “Yapıyı yönet”: güncel Academiana şablonu veya kayıtlı şablonla fark (eklenecek / yeniden adlandırılacak / şablonda olmayan), yalnızca seçilenler ve onayla uygulanır, metni olan bölüm silinmez; şablon sürümü eskiyse uyarı (sessiz güncelleme yok); yapıyı şablon olarak kaydetme/silme; yapı değişiklik geçmişi. Gizli bölüm dışa aktarmaya, otomatik çalışmaya, yapay zekâ bağlamına ve kalite kontrol girdisine girmez.
(4) Migration 43: `project_stages` + requirement, scope, hidden, why, critical, modified (varsayılan zorunlu/orta/görünür); `user_templates` (RLS: yalnızca sahibi); `template_change_logs` (sahibi okur, yalnızca sunucu yazar). Migration çalıştırılmadan site çalışır (yeni sütunlar olmadan yeniden denenir; şablon kaydı “güncelleme yapılmamış” der).
(5) Yapay zekâ: desen rehberi ve raporlama standardı (eksik bilgi uydurulmaz, [VERİ GİRİLECEK]), uygulama projesi kuralı, literatür bölümlerinde işlevler (6.1) ve düzeye göre derinlik (6.3; dolgu yasak, eksik alt temalar :::eksik ile bildirilir), bölümün gerekçesi ve kullanıcının seçtiği kapsam; proje hafızasında onaylı karar / bilgi / doğrulanmamış varsayım ayrımı.
(6) Kalite kontrol: puan yazılımı ve ağırlıklar değişmedi; seviye adları Kritik / Önemli / İyileştirme oldu. Yeni “Akademik tutarlılık zinciri” (`lib/quality/consistency-chain.ts`, belge 10.1): soru–yaklaşım, hipotez–analiz, örneklem/araç–bulgu, analiz–yaklaşım, tartışma–bulgu, karma–entegrasyon ve eksik/gizli kritik bölüm; kanıt ve öneriyle gösterilir, puanı etkilemez, otomatik düzeltme yapmaz. Kalite kontrol girdisinden gizli bölümler ve kapak mektubu/dergi gereklilikleri çıkarıldı.
Desteklenmeyen/kısmi: ayrı `template_definitions`/`template_versions`/`section_rules` tabloları yerine şablonlar kodda sürümlü tutulur (proje bağlamında `templateVersion`; bölüm satırları projeye özgü bağımsız kopyadır); tek tek değişikliği geri alma yok (geçmiş gösterilir, varsayılana/şablona dönüş seçilerek yapılır); resmi kılavuzdan otomatik şablon çıkarma yok (kılavuz yapay zekâ bağlamında kullanılmaya devam eder); alt başlık düzeyinde zorunluluk yok.

## D172 — Referans belgesine ikinci tur uyum: makale, yaklaşım kuralları, literatür kapsamı, şablon aktarma (2026-11-13)
Site sahibinin “belgedeki her şeyi dikkate aldın mı, makale için de bir şeyler vardı” sorusu üzerine belge yeniden karşılaştırıldı ve eksikler tamamlandı.
(1) Makale (4.2/4.3): araştırma makalesinde “Yöntem” ve “Bulgular” başlıkları doğal kalır (D171’deki parantezli uzun başlıklar belgede başlık olarak çıkacaktı, 7.1’e aykırıydı); yaklaşım farkı gerekçede ve yapay zekâ kurallarında: nicel makalede ölçüm/örneklem/istatistiksel raporlama, nitel makalede bağlam/katılımcı seçimi/veri üretimi/analiz/refleksivite, karma makalede entegrasyon ve meta-çıkarımlar. İsteğe bağlı “Ek materyal” eklendi. Makale tez kopyası değildir: bağımsız kuramsal çerçeve eklenmez (yapay zekâya da söylenir). Dergi makalesi varsayılan olarak “Kaynaklara dayalı (veri toplanmadı)”; nicel/nitel/karma seçilirse IMRaD ve veri kuralları geçerli (önceden yapay zekâya bu durumda bile “yöntem/bulgu anlatma” deniyordu). Dergi uyarlamasında derginin yazar rehberi ve zorunlu başlıkları önceliklidir. Tez ve makalede analiz/bulgu/yöntem adımları yalnızca nicel çalışmaya göre yazılmıştı (nitelde “normallik”, “istatistik”); yaklaşıma göre ayrıştırıldı.
(2) Yaklaşım kuralları (5, 5.1): nicel/nitel/karma için hipotez, örnekleme, veri, analiz, kalite ölçütleri, bulgu ve tartışma kuralları ile bölüme özgü yönergeler yapay zekâ bağlamına girer (nitelde hipotez/normallik yok, katılımcı alıntısı asla uydurulmaz; karmada normallik yalnızca nicel, temalar yalnızca nitel aşamada; meta-çıkarımlar entegrasyondan).
(3) Literatür kapsamı (6.4, 12.3): tutarlılık zincirinde “Literatür kapsamı sınırlı görünüyor” (bölümdeki farklı kaynak sayısı düzeye göre az: lisans 5, yüksek lisans 10, doktora 15, makale girişi 5) ve “Araştırma boşluğu gösterilmemiş”; İyileştirme düzeyinde, puanı etkilemez.
(4) Kullanıcı işlemleri (3.1): şablonu dosya olarak indirme ve dosyadan içe aktarma (metin içermez, bölümler temizlenir); özel bölüm eklerken açıklama, zorunluluk ve kapsam seçimi.
(5) Şablon sürümü 3: mevcut projeler değişmez; “Yapıyı yönet” sürüm uyarısıyla farkları gösterir.

## D173 — Referans belgesinin tamamına uyum (üçüncü tur, madde madde) (2026-11-13)
Site sahibi “belgede yüzlerce bilgi verdim, tamamını oku ve dikkate al” dedi. Belge baştan sona yeniden okundu; her madde `docs/roadmap/REFERANS_UYUM.md` tablosunda kodla eşleştirildi ve eksikler tamamlandı:
(1) 4.1–4.9: Belgedeki alt başlık listeleri (nicel/nitel/karma tez, meta-analizin 7 adımı, öneri, fon, kaynak araştırması, metin düzenleme) `sectionFunctions` ile bölüm bazında “beklenen işlevler” olarak yapay zekâya ve bölüm ayarlarına verilir; başlık olarak birebir kopyalanmaz. Tezde “Ön sayfalar (onay, beyan, önsöz)” (koşullu, numarasız) ve “Özet ve Abstract”; Word/PDF/LaTeX’te tezde tablo ve şekil listeleri (sayfa numaralı). Fon başvurusuna isteğe bağlı ekler. Öneri, fon ve metin düzenleme için ayrı yapay zekâ yönergesi (veri yok/güncel çağrı belirleyici/anlam değiştiren müdahale ayrıca listelenir).
(2) 1.1 ve 2: disiplin yönergesi (sağlık, eğitim, mühendislik, işletme, sosyal, beşeri), akademik düzey yönergesi (akademisyen dâhil; literatür derinliğinde akademisyen doktora düzeyinde), belge amacı (enstitü, dergi, ders, fon, kongre). “Neden bazı bölümler yok?” gerekçe listesi.
(3) 2.1 ve 14: disipline uygun olmayan desen gösterilmez (kohort/vaka-kontrol yalnızca sağlıkta); yönetim panelinden yeni desen eklenebilir (`workflows.designs`); raporlama standardı disipline göre (sağlık dışı alanda STROBE/CONSORT/COREQ dayatılmaz), güncel sürüm kontrolü hatırlatılır.
(4) 7 ve 13: başlıklandırma kuralları (işlev, tekrar yok, hiyerarşi, kılavuz terimleri öncelikli, onaysız yeniden adlandırma yok, belirsizlikte sor); kalite kontrolde “Yinelenen başlık”.
(5) 8: yeni projede araştırma soruları (ortak hafızaya “soru” olarak yazılır), oluşturmadan önce yol haritasını yeniden adlandırma/sıralama/kaldırma/ekleme ve varsayılana dönme.
(6) 9 ve 3.3: her bölümün sorumlu asistanı (belgedeki 11 asistan) yapay zekâya rol olarak verilir ve bölüm ayarlarında görünür; araştırma sorusu/amaç değişince yöntem–bulgu zinciri için hatırlatma.
(7) 6.4: tutarlılık zincirinde ardışık özet (atıflı paragrafların %75+’ı tek kaynağa dayanıyorsa), son 5 yılın çalışması yoksa ve çelişkili bulgu ifadesi yoksa İyileştirme uyarısı.
(8) 10.2: kullanıcı öneriyi reddedebilir, reddedilenler geri alınabilir (proje bağlamında `dismissedChecks`, ortak yazarlar da görür).
(9) 11.2/12.2: yapı geçmişinde “Geri al” (bölüm ekleme/kopyalama, ayar değişikliği, sıralama, boş bölüm silme, şablon uygulama); metin içeren bölüm hiçbir zaman silinmez.
Puan yazılımı değişmedi. Veritabanı değişikliği yok (migration 43 yeterli). Kısmi kalanlar uyum tablosunun “Bilinen sınırlar” kısmında.

## D174 — Çalışma oluşturma hatası düzeltildi: toplu eklemede varsayılan değerler (2026-11-13)
Site sahibi araştırma makalesi oluştururken “Çalışma oluşturulamadı — Beklenmeyen bir hata oluştu” aldı. Neden: Supabase’e birden çok satır tek seferde eklenirken bir satırda olmayan alan (ör. `critical`, `why`, `hidden`; içe aktarmada `content_text`, `word_count`, `status`) diğer satırlarda NULL gönderiliyordu; migration 43 ile gelen “boş olamaz” sütunlar bunu reddetti. Düzeltme: tüm toplu eklemelerde `{ defaultToNull: false }` (eksik alan veritabanı varsayılanını alır): bölümler (`insertStageRows`; yeni çalışma, şablon uygulama, geri alma), kaynaklar, kaynak parçaları, hafıza, derleme kayıtları, hukuki kabul kayıtları, kullanım kredileri. Bölümler oluşturulamazsa yarım çalışma silinir, teknik ayrıntı hata kaydına yazılır ve kullanıcıya anlaşılır mesaj gösterilir. Test: `tests/roadmap-reference.test.ts`.

## D175 — Kaynak numaraları sabit; metne “[KAYNAK DOĞRULANAMADI]” düşmesi giderildi (2026-11-13)
Site sahibi araştırma makalesinde metin içinde “[KAYNAK DOĞRULANAMADI]” gördü. Neden: yapay zekâya verilen kaynak numaraları (S1, S2…) her istekte o isteğe seçilen kaynaklara göre yeniden veriliyordu; düzeltme isteklerinde model önceki mesajlardaki numaraları kullanınca atıf çözülemiyor ve işaret ekleniyordu (asistanın kendi notunda “atıf kimlikleri yanlış verilmişti”). Ayrıca sohbet sırasında eklenen kaynak ekranın listesinde henüz yoksa atıf reddediliyordu. Düzeltme: (1) S numaraları projeye eklenme sırasına göre sabit (`buildContext`); (2) dönen kaynak haritası projenin tüm kaynaklarını içerir (sunucuda doğrulanmış gerçek kaynaklar), böylece önceki mesajlardaki atıflar da çözülür; (3) ekranda yüklenmemiş kaynak varsa liste yenilenir, atıf yine eklenir; (4) yapay zekâ projede olmayan bir numara uydurursa atıf eklenmez, “[KAYNAK GEREKLİ]” konur (Kaynakla düzelt bunu giderir; eski “[KAYNAK DOĞRULANAMADI]” işaretleri de “Kaynakla düzelt” kapsamında); (5) istemde numaraların sabit olduğu ve yalnızca listedeki numaraların kullanılacağı söylenir. Uydurma yok ilkesi korunur.

## D176 — Yazan ile denetleyen aynı ölçütleri kullanır; özet sırası (2026-11-13)
Site sahibi “Bölümü yaz” sonrası bölüm kontrolünde (özet) üç sorun gördü: sonuç bildirilmemiş, kelime sayısı doğrulanmamış, özetin ana metinle tutarlılığı doğrulanamıyor. Nedenler ve düzeltmeler: (1) Denetleyici öbür bölümlerin yalnızca ilk 300 karakterini görüyor ve kelime sayamıyordu → kelime sayısı sistemce sayılıp “ölçülen değerler” olarak verilir; özet, sonuç, tartışma ve kapak mektubunda öbür bölümlerin tam metni (bölüm başına 6000, toplam 40000 karakter) verilir; “doğrulanamıyor/kontrol edilmemiş” türü boş sorun yazmak yasak; henüz yazılmamış bölümlere bağlı eksikler en fazla tek bilgi notu. (2) Özet uzunluğu kural olarak denetlenir (Özet ve Abstract ayrı, anahtar kelime satırları hariç, 150–250). (3) Özet yazım talimatı denetleyicinin ölçütleriyle aynı: her biri 150–250 kelime ve yazınca sayılır; son cümle ana metindeki sonucu sonuç diliyle verir (beklenti dili yok); ana metinde olmayan bilgi yok; iki dil aynı. (4) Özet en son yazılır: ana bölümler yazılmadan “Özet ve Abstract” istenirse yazılmamış bölümler listelenip onay istenir.

## D177 — Kaynak işaretleri gerçekten çözülür; eklenen kaynakların en az %60’ı tam metin (2026-11-13)
Site sahibi: “Kaynak bul ve düzelt” üç kez çalıştı, düzeltmiş gibi yaptı ama işaretler kalmadı; 80+ kaynak varken çözemiyor. Kontrol mekanizması korunacak (sorunlar görünür kalır), ama sorunlar çözülecek; gerekirse yeni kaynak bulunacak, kısmi erişim ve son çare özet kullanılacak; bundan sonra eklenen kaynakların en az %60’ı tam metni okunan kaynaklar olacak.
Nedenler: (1) düzeltme önerisi hiç denetlenmiyordu, işaret kalsa da “uygula” sunuluyordu; (2) istek yalnızca “[KAYNAK GEREKLİ]” diyordu, metindeki işaret “[KAYNAK DOĞRULANAMADI]”ydı; (3) 80+ kaynak olduğu için planlayıcı arama yapmayabiliyordu, oysa iddianın temel çalışmaları kütüphanede yoktu; (4) kaynakların çoğu yalnızca özet düzeyindeydi ve “ATIF YAPMA” notlu kaynaklar hiç kullanılamıyordu.
Düzeltmeler: (a) “Kaynakla düzelt” her zaman o iddia için veri tabanlarında arama yapar (`researchGate` → force) ve yeni eklenen kaynakların tam metnini yazımdan önce okur; (b) talimat iki işareti de kapsar ve kaynak sırasını belirler: tam metin → kısmi erişim/özet → son çare yalnızca konu düzeyinde genel atıf (bu görevde “ATIF YAPMA” notlu kaynaklar da yalnızca bu genel kullanım için); desteklenemeyen iddia temkinli genel ifadeye çevrilir veya çıkarılır, asla uydurulmaz; (c) her öneri denetlenir (`lib/sources/fix-check.ts`: kalan işaret, listede olmayan numara, kaybolan mevcut atıf); temiz değilse daha kesin talimatla en fazla iki kez yeniden istenir; yalnızca temiz öneri uygulanabilir; (d) yapay zekâ metni belgeye eklenirken işaret kalan paragraflar kendiliğinden düzeltilir (kalite kontrol algılaması aynen; düzeltilemeyen görünür kalır); (e) otomatik eklemede ve literatür araştırması ön seçiminde eklenenlerin en az %60’ı tam metni okunabilen (açık erişim PDF, PMC, arXiv) kaynaklar (`lib/sources/fulltext-share.ts`); yeni eklenenlerin hepsinin tam metni hemen okunur; araştırma penceresinde seçimin tam metin oranı gösterilir.

## D178 — Kapak, içindekiler ve listeler; sola yaslı başlıklar; numarasız Giriş; kalite kontrol sonucu doğrudan (2026-11-14)
Site sahibi: makaleyi indirince içindekiler yoktu; kapak yoktu/kurallara uymuyordu (logo yeri, fakülte, üniversite, bölüm, çalışma türü, ay-yıl eksik; boşluk ve puntolar yanlış); bölüm başlıkları ortalıydı (kural sola yaslı); Girişin yanına “1.” yazılmıştı; kalite kontrolde sonuç en altta kalıyor, üstte kontrol listesi duruyordu.
(1) Belge düzeni (`DocFormat.layout`, `resolveLayout`): “submission” = kapak + içindekiler + (başlıklı tablo/şekil varsa) Tablolar ve Şekiller Listesi; “journal” = kapaksız dergi düzeni. Seçilmediyse dergi makalesinde ve belge amacı “dergi” olanda dergi düzeni, diğerlerinde (lisans araştırma makalesi dâhil) teslim düzeni. Yeni projede lisans araştırma makalesinin varsayılan amacı “ders projesi”. (2) Kapak (Word, PDF): 3×3 cm kesikli çerçeveli logo alanı, T.C., ÜNİVERSİTE, FAKÜLTE, ENSTİTÜ, BÖLÜM/ANABİLİM DALI, program (12 pt kalın, tek aralık), başlık 14 pt kalın büyük harf, çalışma türü (boşsa çalışma türü ve düzeyden: Araştırma Makalesi, Lisans Bitirme Tezi, Yüksek Lisans Tezi…), yazar (kalın), Danışman, en altta ŞEHİR – AY YIL; kapakta sayfa numarası yok. Üniversite proje bilgisinden gelir; boş üniversite/fakülte/bölüm/danışman köşeli parantezli doldurma alanı (uydurulmaz). Biçim penceresine fakülte, ay, logo yeri ve belge düzeni eklendi. (3) Bölüm başlıkları varsayılan sola yaslı (tüm şablonlar); eski kayıtlardaki şablondan gelen “ortalı” uygulanmaz, kullanıcı biçim penceresinde bilerek seçerse (v2) uygulanır. (4) Giriş ve alt başlıkları numarasız (`UNNUMBERED_GROUPS`, `introduction`); numaralandırma sonraki ana bölümle 1’den başlar; sol liste ve belge aynı. Makalede “SONUÇ” → “Sonuç” (başlık biçimi tutarlı). (5) Kalite kontrol: üstteki kontrol listesi kaldırıldı; kontrol bitince ekran sonuca kayar: puan göstergesi, kategorilere göre düşülen puan grafiği (tek renk çubuk, değer etiketli, “Tamam” işaretli), önem seviyelerine göre sayılar, “Doğru olanlar” (sorunsuz kategoriler, tamamlanan teslim maddeleri, yapay zekâ güçlü yanları), sorunlar ve “Teslim öncesi eksikler”; tutarlılık zinciri en sonda. Puan yazılımı değişmedi.
D178 eki: LaTeX/Overleaf çıktısına da aynı kapak (`titlepage`: logo alanı, kurum satırları, başlık, tür, yazar, danışman, ŞEHİR – AY YIL) eklendi; satırlar `\par` ile ayrılır (“\\ [” derlemeyi bozar). Word çıktısı LibreOffice ile PDF’e çevrilerek kapak, içindekiler, tablolar listesi, sola yaslı başlıklar ve numarasız Giriş gözle doğrulandı.

## D179 — Yazım stiline göre varsayılan biçim; kılavuz kendiliğinden tanınır ve uygulanır; kapak/içindekiler her türde doğrulandı (2026-11-14)
Site sahibi: önce her yazım stilinin kurallarıyla başlanmalı; müşteri kılavuzunu dosyalara eklerse çalışma o kılavuza göre (sağ-sol boşluklar dâhil bütün ayrıntılar) şekil almalı; kapak ve içindekiler bütün projelerde hatasız ve projeye özgü olmalı.
Bulunanlar: (1) her proje türü ve stilden bağımsız tek şablonla (“tez-tr”) başlıyordu; (2) kılavuz yalnızca Proje ayarlarındaki alandan tanınıyor, dosyalara eklenen kılavuz tanınmıyordu; (3) analiz elle düğmeyle başlıyordu ve kılavuzdan yalnızca yazı tipi, punto, satır aralığı ve atıf stili alınıyordu (kenar boşlukları, girinti, başlık, sayfa numarası, kapak hiç); (4) LaTeX çıktısında kenar boşluğu, punto ve satır aralığı sabitti.
Düzeltmeler: (a) `defaultPreset`/`effectiveFormat`: tez ve bitirme projesi Türk üniversitesi tez düzeni; dergi gönderimi dergi taslağı; diğerleri stilin öğrenci biçimi (APA 7, MLA 9, Chicago 17/Turabian 9, Harvard, IEEE, Vancouver/AMA, ISNAD 2 şablonları eklendi). Bölüm başlıkları site sahibinin kuralıyla varsayılan sola yaslı (APA 7’nin resmî kuralı 1. düzey başlığı ortalar; kılavuz ortalı derse kılavuz uygulanır). Kullanıcının kaydettiği şablon korunur. (b) `lib/guideline.ts`: kılavuz Proje ayarlarından yüklenince hemen, projenin dosyalarına eklenince (adı veya içeriği kılavuz gibiyse, proje henüz kılavuzsuzsa) arka planda analiz edilir; kılavuzda AÇIKÇA yazan yazı tipi, punto, satır aralığı, dört kenar boşluğu, girinti, paragraf aralığı, iki yana yaslama, bölümün yeni sayfada başlaması, başlık büyük harf/hizası, sayfa numarası yeri, atıf stili, kapak/içindekiler, T.C., logo ve kurum adları uygulanır; yazmayanlar stilin varsayılanında kalır (null → uydurulmaz; aralık dışı değerler uygulanmaz). Bölüm yapısı önerisi onayla eklenir. Çalışma ekranında “kılavuz uygulandı” şeridi ve biçim penceresinde kılavuzdan alınan kurallar görünür. Pro paket özelliği; alt paketlerde stilin varsayılanları uygulanır ve bu açıkça yazılır. (c) LaTeX: punto, yazı tipi, kenar boşlukları, satır aralığı, girinti, paragraf aralığı ve hizalama biçimden. (d) `tests/export-all-types.test.ts`: her çalışma türü × düzey (32 durum) için gerçek yol haritasıyla Word, PDF ve LaTeX üretilir; kapak/içindekiler (dergi makalesi hariç), numarasız Giriş, 1’den boşluksuz numaralandırma, sola yaslı başlık, makaleye girmeyen yazışmalar denetlenir.
