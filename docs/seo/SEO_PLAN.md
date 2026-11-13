# Academiana — SEO denetimi, anahtar kelime haritası ve içerik planı (D164)

_Hazırlanma: 13 Kasım 2026. Bu belge her içerik dalgasından sonra güncellenir._

> **Veri dürüstlüğü:** Bu çalışmada Google Search Console, Google Ads Anahtar Kelime Planlayıcı, Ahrefs/Semrush gibi
> arama hacmi veren hiçbir kaynağa erişim yoktu. Bu yüzden belgede **sayısal arama hacmi yoktur.** “Öncelik” sütunu
> yalnızca (1) ürünün gerçek özelliğiyle ilişki, (2) kullanıcının arama niyeti ve (3) konunun tezlerde/derslerde ne sıklıkla
> karşılaşıldığına dair **nitel bir tahmindir**. Search Console verisi birikince (yayından 4–8 hafta sonra) gerçek
> gösterim/tıklama verisiyle yeniden sıralanmalıdır. Sıralama garantisi verilmez.

## 1. Başlangıç durumu (denetim, 13 Kasım 2026)

Yerel üretim derlemesi Googlebot kimliğiyle tarandı (`next build` + `next start`, tüm site haritası adresleri).

| Konu | Bulgu |
|---|---|
| Dizinlenebilir sayfa | 189 adres (site haritası), hepsi 200; site haritası dışında taranabilir herkese açık sayfa yok |
| Başlık / açıklama | Hepsinde var, benzersiz; başlık ≤60, açıklama 70–160 karakter (`tests/seo-quality.test.ts`) |
| Canonical / hreflang | Kendine işaret eden canonical; tr/en/de/x-default (Almanca yalnızca varsa) |
| Yapılandırılmış veri | Organization, WebSite, BreadcrumbList, WebPage, BlogPosting, FAQPage, WebApplication, SoftwareApplication, Offer |
| Görseller | Alt metni olmayan yalnızca dekoratif (alt="") görseller |
| **Sorun 1** | Arama motoru botlarına sayfa başlığı, açıklama ve canonical `<head>` yerine `<body>` içinde akıyordu (Next.js akışlı meta veri) |
| **Sorun 2** | 15 blog yazısı (dil başına 5) yalnızca 1 iç bağlantı alıyordu (ilgili yazılar hep kategorinin ilk üç yazısını seçiyordu) |
| **Sorun 3** | Blog yazılarında kaynak listesi ve güncellenme tarihi yoktu (E-E-A-T) |
| **Sorun 4** | “Ücretsiz araçlar” sayfası ince (~250 kelime), rehberlere bağlantı yok |
| **Sorun 5** | İngilizce/Almanca her sayfa tüm arayüz sözlüğünü HTML içinde taşıyordu: ~148 KB (sıkıştırılmış) yerine 17 KB olması gereken sayfa; mobilde ilk görüntü 1,4 sn → 2,85 sn |
| **Sorun 6** | Alt bilgideki logo her sayfada 140 KB’lık 960 px PNG olarak iniyordu (56 px gösteriliyor) |
| İnce sayfa | `/kayit` (~58 kelime) — form sayfası, bilinçli olarak kısa; dizinde kalması zararsız |

## 2. Yapılan düzeltmeler (D164)

1. `next.config.ts` → `htmlLimitedBots`: botlar (Google, Bing, Yandex, sosyal medya önizlemeleri, Lighthouse) meta verileri `<head>` içinde alır; normal ziyaretçi akışı değişmedi.
2. `relatedPosts`: kategori içinde döngüsel komşular + ortak anahtar kelime → her yazı en az 3 iç bağlantı alıyor (taramayla doğrulandı).
3. Blog yazılarına `updated` (JSON-LD `dateModified`, site haritası `lastmod`, görünür “Güncellendi”) ve `sources` (görünür “Kaynaklar” listesi, JSON-LD `citation`) alanları; yazarlık “Academiana Editör Ekibi” (Organization) olarak kaldı — sahte kişi yazar eklenmedi.
4. Üç yeni rehber (TR/EN/DE, 9 adres): t testi, normallik (çarpıklık/basıklık), ISNAD. Tüm sayılar ürünün istatistik motoruyla, tüm atıf örnekleri ürünün atıf motoruyla üretildi; `tests/seo-d164.test.ts` metindeki değerleri motorla karşılaştırır. ISNAD örneklerindeki yazar/eser adları açıkça “kurgusal” diye belirtildi.
5. `/araclar`: “Araştırmanın hangi adımında hangi araç?” (4 aşama → araç + rehber bağlantıları) ve “Araçlar nasıl çalışır?” bölümleri; ~250 → ~520 kelime.
6. Arayüz sözlüğü (EN/DE) HTML’den çıkarılıp ayrı, önbelleğe alınan bir JS parçasına taşındı (`src/i18n/client.tsx`). Sunucu HTML’i yine tamamen çevrilmiş gelir; etkileşim sözlük yüklenince başlar, Türkçe metin sızıntısı olmadığı yavaş ağda doğrulandı.
7. Logo ve amblem gösterim boyutunun ~2 katına küçültüldü (140 KB → 11 KB, 35 KB → 3,5 KB); alt bilgi logosu `loading="lazy"`.

## 3. Laboratuvar Core Web Vitals (yerel üretim derlemesi)

Koşullar: Playwright, Pixel 7 öykünmesi, 4× CPU yavaşlatma, ~1,6 Mbit/sn indirme + 150 ms gecikme (yavaş 4G’ye yakın), soğuk önbellek. **Saha verisi (CrUX) değildir**; gerçek kullanıcı değerleri Search Console → Core Web Vitals raporundan izlenmelidir.

| Sayfa | FCP önce | FCP sonra | LCP sonra | CLS | İndirilen (KB) önce → sonra |
|---|---|---|---|---|---|
| `/en/araclar` | 2840 ms | 1396 ms | 1396 ms | 0,001 | 1138 → ~977 |
| `/de/araclar` | 2836 ms | 1404 ms | 1404 ms | 0,001 | 1148 → 977 |
| `/en/fiyatlar` | 2872 ms | 1460 ms | 1460 ms | 0,001 | 1103 → 932 |
| `/araclar` | 1408 ms | 1432 ms | 1432 ms | 0,001 | 1010 → 839 |
| `/blog/…` (TR) | ~1500 ms | ~1540 ms | ~1540 ms | 0,001 | 978 → 803 |
| `/` | 2784 ms | ~2700 ms | ~2900 ms | 0,001 | 1112 → 941 |
| `/sss` | 3184 ms | ~3150 ms | ~3150 ms | 0,001 | 1048 → 877 |

Yatay kaydırma (mobil taşma) hiçbir ölçülen sayfada yok. CLS tüm sayfalarda ≈0.

**Kalan performans işleri (yapılmadı, risk/etki notuyla):**
- Yazı tipleri: 6 woff2 dosyası (~590 KB) her sayfada önceden yükleniyor (Inter + Source Serif 4, latin + latin-ext, normal + italik). Italik serif önden yüklenmesi gereksiz; ancak `next/font` tek çağrıda kısmi önyüklemeye izin vermiyor. Seçenekler: italik eksenini ayrı ve önyüklemesiz yüklemek (editörde italik görünümü test edilmeli) veya serif’i yalnız başlıklarda kullanmak. Etki: orta-yüksek; risk: görsel.
- Ana sayfa (366 KB ham HTML) ve SSS (309 KB): içerik HTML + RSC verisi + JSON-LD olarak üç kez taşınıyor. SSS cevaplarının istemci bileşenine prop olarak geçmesi yerine sunucu bileşeninde `<details>` ile çizilmesi incelenmeli.

## 4. Anahtar kelime haritası ve arama niyeti

Niyet: **B** bilgi, **T** ticari araştırma, **İ** işlem (araç kullanma/kayıt), **N** navigasyon.

| Küme (pillar) | Temsilî sorgular (TR) | Niyet | Karşılayan sayfa | Öncelik (tahmin) |
|---|---|---|---|---|
| Tez yazımı | tez nasıl yazılır, tez giriş bölümü, yöntem bölümü, bulgular ve tartışma, özet nasıl yazılır | B | `/blog/tez-nasil-yazilir` (pillar) + 9 küme yazısı | Yüksek |
| Kaynak ve atıf | APA 7 atıf, kaynakça nasıl yazılır, ISNAD kaynakça örnekleri, atıf dönüştürme | B + İ | `/blog/apa-7-atif-kurallari`, `/blog/isnad-atif-sistemi-rehberi`, `/araclar/kaynakca-olusturucu`, `/araclar/atif-donusturucu` | Yüksek |
| İstatistik ve yöntem | hangi istatistik testi, t testi yorumlama, normallik testi, çarpıklık basıklık, cronbach alfa, örneklem hesaplama | B + İ | `/blog/hangi-istatistik-analizi-secilmeli` (pillar), t testi, normallik, Cronbach, örneklem + 2 araç | Yüksek |
| Akademik dürüstlük ve YZ | yapay zeka ile tez yazmak etik mi, uydurma kaynak, yapay zeka tespit | B | 3 yazı + `/araclar/uydurma-kaynak-kontrolu` | Orta-yüksek |
| Makale ve yayın | makale nasıl yazılır, hakem yorumlarına cevap, yağmacı dergi | B | 3 yazı | Orta |
| Başvuru ve savunma | TÜBİTAK 2209-A, 1002-A, 2204-A, 2242, 3005, tez savunması | B | 6 yazı | Orta (dönemsel zirve) |
| Ürün | yapay zeka tez yazma programı, akademik yazım asistanı, academiana | T / N | `/`, `/fiyatlar`, `/ornekler`, `/kurumlar` | Yüksek (dönüşüm) |

İngilizce ve Almanca sayfalar aynı kümelerin çevirisidir; ayrı pazar araştırması yapılmadı (TR öncelikli).

## 5. 30 maddelik içerik planı

Kurallar: her yazı gerçek bir ürün özelliğine veya ücretsiz araca bağlanır; sayısal örnekler motorla hesaplanır ve testle denetlenir; kaynaklar yalnız doğrulanabilir eserlerdir; mevcut yazılarla aynı niyeti hedefleyen yazı açılmaz (yamyamlaştırma yok); her yazı TR + EN + DE.

| # | Başlık (çalışma adı) | Küme | Niyet | Bağlanan özellik / araç | Öncelik |
|---|---|---|---|---|---|
| 1 | Tek yönlü ANOVA nasıl yapılır ve raporlanır (Bonferroni ile) | İstatistik | B | İstatistik analizi (ANOVA + post hoc) | Yüksek |
| 2 | Pearson ve Spearman korelasyonu yorumlama | İstatistik | B | İstatistik analizi | Yüksek |
| 3 | Doğrusal regresyon sonuçları APA 7’ye göre nasıl raporlanır | İstatistik | B | İstatistik analizi (regresyon) | Yüksek |
| 4 | Ki-kare bağımsızlık testi: çapraz tablo yorumlama | İstatistik | B | İstatistik analizi | Orta |
| 5 | Mann–Whitney U ve Kruskal–Wallis: parametrik olmayan testler | İstatistik | B | İstatistik analizi | Orta |
| 6 | Etki büyüklüğü rehberi: Cohen d, eta kare, r | İstatistik | B | İstatistik analizi | Orta |
| 7 | p değeri ve güven aralığı nasıl yorumlanır | İstatistik | B | İstatistik analizi | Orta |
| 8 | Betimsel istatistik tablosu APA 7 örneği | İstatistik | B | Tablo/şekil + istatistik | Orta |
| 9 | Likert verisi: ortalama mı medyan mı, hangi test? | İstatistik | B | Anket oluşturucu + istatistik | Orta |
| 10 | Açımlayıcı ve doğrulayıcı faktör analizi: kavramsal rehber (ürün hesaplamaz, açıkça belirtilir) | İstatistik | B | Ölçek geçerlik yazısına bağlantı | Düşük-orta |
| 11 | Dipnotlu ISNAD: ilk ve sonraki atıflar (ürün metin içi biçimi destekler, açıkça belirtilir) | Atıf | B | Kaynakça oluşturucu | Orta |
| 12 | APA 7’de ikincil kaynak (aktaran) gösterimi | Atıf | B | Atıf düğümü / konum bilgisi | Orta |
| 13 | IEEE atıf stili örnekleri | Atıf | B | Kaynakça oluşturucu | Orta |
| 14 | Vancouver atıf stili örnekleri | Atıf | B | Kaynakça oluşturucu | Orta |
| 15 | Chicago: yazar-tarih ve dipnot biçimi | Atıf | B | Atıf dönüştürücü | Düşük-orta |
| 16 | DOI nedir, nasıl bulunur ve doğrulanır | Atıf | B + İ | Kaynakça oluşturucu, uydurma kaynak kontrolü | Yüksek |
| 17 | Harvard atıf stili örnekleri | Atıf | B | Kaynakça oluşturucu | Düşük |
| 18 | Tezde sınırlılıklar ve varsayımlar nasıl yazılır | Tez | B | Bölüm şablonları | Orta |
| 19 | Tez sonuç ve öneriler bölümü nasıl yazılır | Tez | B | Bölüm yazımı | Orta |
| 20 | Tez yazım kılavuzlarında ortak biçim kuralları (enstitüye özgü değerler verilmez) | Tez | B | Şablon / kapak / içindekiler | Orta |
| 21 | Literatür matrisi (karşılaştırma tablosu) nasıl hazırlanır | Tez | B | Literatür matrisi özelliği | Yüksek |
| 22 | Tez izleme komitesi raporu nasıl hazırlanır | Tez | B | Çalışma planı | Düşük-orta |
| 23 | Dergi seçimi: dizin türleri ve kontrol listesi | Makale | B | Dergi önerisi | Orta |
| 24 | Editöre mektup (cover letter) nasıl yazılır | Makale | B | Asistan | Orta |
| 25 | Makale reddedildiğinde ne yapılmalı | Makale | B | Hakem yanıtı yazısına bağlantı | Düşük-orta |
| 26 | Yapay zekâ kullanım beyanı nasıl yazılır (dergi politikalarına göre) | Etik/YZ | B | Akademik dürüstlük sayfası | Yüksek |
| 27 | Yapay zekâ araçları kaynak olarak gösterilir mi? (APA’nın resmi önerisiyle) | Etik/YZ | B | APA 7 yazısı | Orta |
| 28 | TÜBİTAK 1001 proje önerisi rehberi (tutar/takvim verilmez) | Başvuru | B | Başvuru şablonları | Orta |
| 29 | Doktora yeterlik sınavına hazırlık planı | Başvuru | B | Çalışma planı | Düşük |
| 30 | Örneklem büyüklüğü hazır tablosu (evren büyüklüğüne göre, hesaplayıcıdan üretilmiş) | İstatistik | B + İ | Örneklem hesaplayıcı | Yüksek |

İlk dalga (bu commit): t testi, normallik, ISNAD (planın dışında, önceden yapıldı). Sıradaki dalga önerisi: 16, 21, 1, 2, 3, 26, 30.

## 6. Programatik SEO değerlendirmesi

- **Yapılmadı ve önerilmiyor:** “<şehir> tez yazdırma”, “<üniversite> tez şablonu” gibi yüzlerce benzer sayfa — kapı (doorway) sayfası ve ölçekli içerik riski; ayrıca ürün enstitüye özgü kuralları doğrulamıyor.
- **Değerlendirilebilir (gerçek fayda varsa):** atıf stili başına “<stil> kaynakça oluşturucu” açılış sayfaları (motor 10 stili gerçekten destekliyor). Her sayfa yalnızca o stilin gerçek örneklerini motordan üretmeli ve aynı araca gitmeli; benzer metin tekrarı olmamalı. Search Console’da “isnad kaynakça oluşturucu”, “apa kaynakça oluşturucu” gibi sorgular görülürse açılmalı.

## 7. Search Console’da izlenecek ölçüler

1. Dizin kapsamı: gönderilen 198 adresin “Dizine eklendi” oranı; “Tarandı – şu anda dizine eklenmedi” listesi (özellikle EN/DE).
2. Performans → Sorgular: yeni üç yazının gösterim/tıklama/ortalama konumu (t testi, normallik, ISNAD) — 4, 8, 12. haftalarda.
3. Performans → Sayfalar: `/araclar` ve araç sayfalarının tıklama oranı (CTR).
4. Core Web Vitals (mobil): “İyi” URL oranı; özellikle `/en/*` ve `/de/*` grubunun bu değişiklikten sonraki 28 günlük saha verisi.
5. Uluslararası hedefleme: hreflang hataları (olmamalı).
6. Zenginleştirilmiş sonuçlar: SSS ve içerik haritası (Breadcrumb) geçerli öğe sayısı.
7. Dönüşüm (site içi analitik): blog → `/kayit` ve araç → `/kayit` tıklamaları.

## 8. 90 günlük yol haritası

| Dönem | İş |
|---|---|
| Gün 0–7 | Search Console’da site haritasını yeniden gönder; yeni 9 adres için “URL denetimi → Dizine eklenmesini iste”. Bing Webmaster Tools’u bağla. |
| Gün 7–30 | İçerik dalgası 2 (plan 16, 21, 1, 2, 3, 26, 30). Yazı tipi önyüklemesini azaltma denemesi (görsel test ile). SSS sayfasının HTML ağırlığını azaltma. |
| Gün 30–60 | Search Console verisiyle sıralama: gösterimi yüksek, CTR’si düşük sayfaların başlık/açıklamaları. Dalga 3 (plan 4–9, 12–14). |
| Gün 60–90 | Saha CWV kontrolü; kalan plan maddeleri; gerçek sorgu verisi varsa atıf stili açılış sayfaları (bölüm 6). Eski yazılarda `updated` + `sources` tamamlama (öncelik: en çok gösterim alan 10 yazı). |
