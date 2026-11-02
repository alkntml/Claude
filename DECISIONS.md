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
