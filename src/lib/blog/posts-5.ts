import type { BlogPost } from "./types";

export const POSTS_5: BlogPost[] = [
  {
    slug: "tez-tablo-ve-sekil-apa-7",
    title: "Tezde Tablo ve Şekil Nasıl Hazırlanır? APA 7 Kuralları ve Örnekler",
    description: "APA 7’ye göre tablo ve şekil numarası, başlığı, notları ve çizgi kullanımı örneklerle; tezlerde en sık yapılan tablo hataları ve çözümleri.",
    category: "Tez yazımı",
    keywords: ["apa 7 tablo", "apa şekil formatı", "tezde tablo nasıl yapılır", "tablo notu", "apa tablo başlığı"],
    date: "2026-11-06",
    cta: { text: "Veri dosyanızdan analiz tablosunu ve APA tarzı grafiği oluşturun, tek tıkla bölümünüze ekleyin; numaralandırma ve başlık biçimi hazır gelsin.", href: "/kayit", label: "Ücretsiz başla" },
    body: `Bulgular bölümünü okuyan bir jüri üyesi, metnin tamamını okumadan önce genellikle tablolara ve şekillere göz atar. İyi hazırlanmış bir tablo sonuçlarınızı birkaç saniyede anlatır; kötü hazırlanmış bir tablo ise en doğru analizi bile şüpheli gösterir. Bu yazıda APA 7. baskıya göre tablo ve şekil hazırlamanın kurallarını, örnekleriyle ve tezlerde en sık görülen hatalarla birlikte anlatıyoruz.

## Tablo mu, şekil mi, metin mi?

Her bulgu tablo gerektirmez. Karar verirken şu soruyu sorun: Okuyucu bu bilgiyi en kolay hangi biçimde anlar?

- **Metin:** Üç-dört sayıdan oluşan bilgiler için yeterlidir. "Katılımcıların %62'si kadın, %38'i erkektir" cümlesi için tablo gerekmez.
- **Tablo:** Kesin sayıların karşılaştırılması gerektiğinde kullanılır. Betimsel istatistikler, korelasyon matrisleri, regresyon sonuçları ve grup karşılaştırmaları tipik tablo içerikleridir.
- **Şekil:** Eğilim, örüntü ve ilişkiyi göstermek için kullanılır. Zaman içindeki değişim, grupların karşılaştırılması, değişkenler arası ilişki veya araştırma modeli şekille daha iyi anlatılır.

Aynı veriyi hem tabloda hem şekilde vermeyin. Okuyucu için tekrar, jüri için de gereksiz uzunluk demektir.

## APA 7'ye göre tablonun bölümleri

APA 7'de her tablo aynı düzeni izler:

1. **Tablo numarası:** Tablonun üstünde, kalın yazılır: **Tablo 1**. Numaralar metinde ilk geçiş sırasına göre verilir.
2. **Tablo başlığı:** Numaranın bir satır altında, *italik* ve kelimelerin baş harfleri büyük yazılır. Başlık kısa ama açıklayıcı olmalıdır: *Katılımcıların Demografik Özellikleri* gibi.
3. **Başlık satırı (sütun başlıkları):** Her sütunun neyi gösterdiği yazılır. Kısaltma kullanıyorsanız (M, SS, n) bunları notta açıklayın veya standart istatistik kısaltmalarını kullanın.
4. **Tablo gövdesi:** Veriler. Ondalık basamak sayısı sütun boyunca aynı tutulur.
5. **Tablo notu:** Tablonun altında yer alır ve "Not." kelimesi italik yazılarak başlar.

### Çizgi kullanımı

APA tablolarında **dikey çizgi kullanılmaz.** Yatay çizgiler de en aza indirilir: Genellikle yalnızca tablonun en üstünde, başlık satırının altında ve tablonun en altında yatay çizgi bulunur. Satırları birbirinden ayırmak için çizgi yerine boşluk kullanılır. Word'de tabloyu oluşturduktan sonra "Kenarlıklar" menüsünden bütün çizgileri kaldırıp yalnızca bu üç yatay çizgiyi eklemek en kolay yoldur.

### Tablo notunun üç türü

- **Genel not:** Tablonun bütünüyle ilgili açıklamalar, kısaltmaların anlamı ve tablo başka bir kaynaktan alınmışsa telif bilgisi.
- **Özel not:** Belirli bir sütun, satır veya hücreye ait açıklamalar. Üst simge harflerle (ᵃ, ᵇ) gösterilir.
- **Olasılık notu:** Yıldızların anlamı: *p < .05. **p < .01. ***p < .001.

Notlar bu sırayla verilir; her tür yeni bir satırda başlar.

## Örnek: betimsel istatistik tablosu

Aşağıdaki düzen, tezlerde en sık kullanılan tablo türlerinden biri için iyi bir örnektir:

**Tablo 2**

*Ölçek Puanlarına İlişkin Betimsel İstatistikler (N = 291)*

Sütunlar: Değişken · M · SS · Çarpıklık · Basıklık

- Öz yeterlik · 3,84 · 0,61 · −0,42 · 0,18
- Tükenmişlik · 2,37 · 0,74 · 0,51 · −0,23
- İş doyumu · 3,52 · 0,69 · −0,30 · −0,11

*Not.* Puanlar 1–5 aralığındadır. M = ortalama; SS = standart sapma.

Burada dikkat edilmesi gerekenler: Örneklem büyüklüğü başlıkta veya notta verilmiştir, ondalıklar her sütunda aynı sayıdadır ve kısaltmalar notta açıklanmıştır. Türkçe tezlerde ondalık ayırıcı olarak virgül kullanılır; enstitünüzün kılavuzu nokta istiyorsa ona uyun ve bütün tezde tutarlı olun.

## APA 7'ye göre şekil hazırlama

Şekiller de tablolarla aynı mantığı izler:

1. **Şekil numarası:** Şeklin üstünde, kalın: **Şekil 1**.
2. **Şekil başlığı:** Bir satır altında, *italik* ve baş harfleri büyük.
3. **Görsel:** Grafik, diyagram, fotoğraf veya model.
4. **Lejant:** Gerekiyorsa şeklin içinde, görselin sınırları içinde yer alır.
5. **Şekil notu:** Şeklin altında, "Not." ile başlar.

İyi bir şekil için birkaç ilke:

- **Sade olun.** Üç boyutlu efektler, gölgeler ve gereksiz renkler okumayı zorlaştırır. İki boyutlu, temiz grafikler tercih edin.
- **Eksenleri adlandırın.** Her eksenin neyi gösterdiğini ve ölçü birimini yazın.
- **Gri tonlarında da okunabilir olsun.** Tez basılı olarak da teslim edilebilir; renkleri ayırt edemeyen okuyucular da vardır. Çizgi türleri (düz, kesikli) veya desenler kullanın.
- **Ölçeği dürüst tutun.** Y ekseninin sıfırdan başlamaması küçük farkları büyük gösterebilir. Böyle bir tercih yapıyorsanız eksende bunu açıkça gösterin.
- **Yazı tipi okunabilir olsun.** Şekildeki yazılar, küçültüldüğünde bile okunabilmelidir.

## Metinde tablo ve şekle atıf

Her tablo ve şekle metinde en az bir kez numarasıyla atıf yapılmalıdır. "Aşağıdaki tabloda görüldüğü gibi" yerine "Tablo 2'de görüldüğü gibi" yazın; çünkü sayfa düzeni değiştiğinde tablo aşağıda kalmayabilir.

Metin, tablonun tekrarı olmamalıdır. Tablodaki bütün sayıları cümleye dökmek yerine en önemli bulguyu vurgulayın: "Tablo 2'de görüldüğü gibi, katılımcıların öz yeterlik puanları ölçeğin orta noktasının üzerindedir (M = 3,84); tükenmişlik puanları ise görece düşüktür."

## Başka kaynaktan alınan tablo ve şekiller

Başka bir çalışmadan alınan veya uyarlanan tablo ve şekiller için notta kaynak belirtilir:

- Doğrudan alınmışsa: "*Not.* Yazar (Yıl, s. 45)'tan alınmıştır."
- Değiştirilerek kullanılmışsa: "*Not.* Yazar (Yıl)'dan uyarlanmıştır."

Telif hakkı korunan görsellerin tezde kullanılması için izin gerekebilir. Tezler genellikle açık erişimli olarak yayımlandığından bu konuyu önemsemek gerekir. Kaynak gösterme kuralları için [APA 7 atıf rehberimize](/blog/apa-7-atif-kurallari) bakabilirsiniz.

## Tablo ve şekil listeleri

Türkiye'deki enstitülerin çoğu, içindekiler sayfasından sonra **tablolar listesi** ve **şekiller listesi** ister. Bu listeleri elle yazmak yerine Word'ün "Resim Yazısı Ekle" ve "Şekiller Tablosu Ekle" özelliklerini kullanın. Böylece tablo eklendiğinde veya silindiğinde numaralar ve sayfa numaraları otomatik güncellenir.

## Sık yapılan hatalar

- **Dikey çizgiler ve tam ızgara kullanmak:** APA'da tablo bir hesap tablosu gibi görünmemelidir.
- **Başlığı tablonun altına yazmak:** APA 7'de tablo ve şekil başlıkları üstte yer alır.
- **Yazılım çıktısını olduğu gibi yapıştırmak:** İstatistik programlarının çıktı tabloları rapor için değil, analiz içindir. Gereksiz satırları çıkarın, yalnızca okuyucunun ihtiyacı olan değerleri bırakın.
- **Ondalık basamak tutarsızlığı:** Bir satırda 3,8, diğerinde 3,8412 yazmayın.
- **Metinde hiç değinilmeyen tablolar:** Her tablo bir amaca hizmet etmelidir.
- **Tabloyu sayfalar arasında bölmek:** Mümkünse tabloyu tek sayfada tutun. Bölmek zorundaysanız başlık satırını yeni sayfada tekrarlayın.
- **Enstitü kılavuzunu yok saymak:** Bazı enstitüler APA'dan farklı kurallar uygular (ör. tablo başlığının yazı tipi veya hizalaması). Enstitü kılavuzu her zaman önceliklidir.

## Özetle

APA 7'de tablo ve şekiller aynı düzeni izler: kalın numara, italik başlık, sade gövde ve "Not." ile başlayan açıklama. Dikey çizgi kullanmayın, ondalıkları tutarlı tutun, her tablo ve şekle metinde numarasıyla atıf yapın ve aynı veriyi iki kez sunmayın. Hangi analizin hangi tabloyla raporlanacağını merak ediyorsanız [hangi istatistik analizi seçilmeli](/blog/hangi-istatistik-analizi-secilmeli) ve [bulgular ve tartışma bölümü](/blog/bulgular-ve-tartisma-bolumu) yazılarımıza da göz atabilirsiniz.`,
  },
  {
    slug: "tez-giris-bolumu-nasil-yazilir",
    title: "Tezin Giriş Bölümü Nasıl Yazılır? Problem Durumu, Amaç ve Önem",
    description: "Tez giriş bölümü nasıl yazılır? Problem durumu, amaç, önem, araştırma soruları, varsayımlar, sınırlılıklar ve tanımlar örneklerle.",
    category: "Tez yazımı",
    keywords: ["tez giriş bölümü", "problem durumu nasıl yazılır", "araştırmanın önemi", "sınırlılıklar", "tez amacı nasıl yazılır"],
    date: "2026-11-06",
    cta: { text: "Kurgu modülüyle problem, amaç ve yöntem planınızı oluşturun; giriş bölümünü bu plana ve projenize eklediğiniz gerçek kaynaklara dayanarak yazın.", href: "/kayit", label: "Ücretsiz başla" },
    body: `Giriş bölümü, jürinin tezinizle ilk ciddi temasıdır. Burada okuyucuya neyi, neden ve nasıl araştırdığınızı anlatırsınız. Güçlü bir giriş, tezin geri kalanını okumaya değer kılar; dağınık bir giriş ise en iyi bulguların bile gölgede kalmasına neden olur. Bu yazıda Türkiye'deki tezlerde yaygın olan giriş bölümü yapısını, her alt başlığın amacını ve sık yapılan hataları anlatıyoruz.

## Giriş bölümü ne zaman yazılır?

Şaşırtıcı gelebilir ama giriş bölümünü **en son kesinleştirmek** en iyisidir. Tez önerisi aşamasında bir taslak yazarsınız; ancak bulgularınız netleştikçe problem tanımınız, amacınız ve önem bölümünüz de olgunlaşır. Tezi bitirdikten sonra girişi yeniden okuyup bulgularla uyumlu hâle getirin. Girişte vaat ettiğiniz her şeyin tezde karşılığı olmalıdır.

## Huni yapısı: genelden özele

İyi bir giriş bölümü huni gibi çalışır:

1. **Geniş bağlam:** Konunun neden önemli olduğu, alandaki genel durum.
2. **Daralan odak:** Bu alandaki belirli bir sorun veya tartışma.
3. **Boşluk:** Mevcut çalışmaların neyi açıklamadığı.
4. **Sizin çalışmanız:** Bu boşluğu nasıl dolduracağınız.

Akademik yazım literatüründe Swales'in (1990) önerdiği **CARS modeli** de benzer bir mantıkla çalışır: Önce alanı tanımlarsınız, sonra alandaki boşluğu gösterirsiniz, en sonunda da bu boşluğu kendi çalışmanızla doldurursunuz.

## Alt başlıklar ve her birinin amacı

Türkiye'deki enstitülerin çoğunda giriş bölümü şu alt başlıklardan oluşur. Sıra ve adlar enstitüye göre değişebilir; kendi yazım kılavuzunuzu kontrol edin.

### Problem durumu

Giriş bölümünün kalbidir ve genellikle en uzun kısımdır. Burada şunları anlatırsınız:

- Konunun genel çerçevesi ve neden önemli olduğu
- Bu konuda bugüne kadar yapılmış çalışmaların kısa bir özeti
- Mevcut çalışmaların eksik bıraktığı nokta (araştırma boşluğu)
- Bu boşluğun neden sorun olduğu

Problem durumu bir literatür taraması değildir. Amaç bütün çalışmaları özetlemek değil, okuyucuyu adım adım sizin araştırma probleminize götürmektir. Her paragraf bir öncekinden daha özel olmalıdır.

Bölüm genellikle **problem cümlesiyle** biter. Problem cümlesi araştırmanın ana sorusunu tek cümleyle ifade eder: "Ortaokul öğretmenlerinin dijital değerlendirme araçlarını kullanma düzeyleri ile mesleki kıdemleri arasında anlamlı bir ilişki var mıdır?"

### Araştırmanın amacı

Amaç, problem cümlesinin bir eylem cümlesine dönüştürülmüş hâlidir: "Bu araştırmanın amacı, ortaokul öğretmenlerinin dijital değerlendirme araçlarını kullanma düzeyleri ile mesleki kıdemleri arasındaki ilişkiyi incelemektir."

Ardından **alt amaçlar** veya **araştırma soruları** sıralanır. Her alt soru ölçülebilir ve cevaplanabilir olmalıdır:

1. Öğretmenlerin dijital değerlendirme araçlarını kullanma düzeyi nedir?
2. Kullanım düzeyi cinsiyete göre anlamlı farklılık göstermekte midir?
3. Kullanım düzeyi ile mesleki kıdem arasında anlamlı bir ilişki var mıdır?

Bu sorular yöntem ve bulgular bölümünüzün iskeletidir: Bulgular bölümündeki her alt başlık bir araştırma sorusuna karşılık gelmelidir. Araştırma sorusu ve hipotez yazımı için [ayrıntılı rehberimize](/blog/arastirma-sorusu-ve-hipotez-nasil-yazilir) bakabilirsiniz.

### Araştırmanın önemi

Bu kısım "Bu çalışma neden yapılmalı?" sorusuna cevap verir. İyi bir önem bölümü iki düzeyde katkıyı gösterir:

- **Kuramsal katkı:** Çalışma literatüre ne ekliyor? Hangi boşluğu dolduruyor, hangi tartışmaya veri sunuyor?
- **Uygulamaya katkı:** Sonuçlar kimin işine yarayacak? Öğretmenler, yöneticiler, politika yapıcılar, klinisyenler…

"Bu çalışmanın alana katkı sağlayacağı düşünülmektedir" gibi genel bir cümle önem bölümü değildir. Kime, nasıl bir katkı sağlayacağını somut olarak yazın: "Bulgular, il milli eğitim müdürlüklerinin hizmet içi eğitim programlarını kıdem gruplarına göre planlamasına veri sağlayabilir."

### Varsayımlar

Araştırmanın dayandığı, ancak sizin test etmediğiniz kabullerdir. Örneğin:

- Katılımcıların ölçek maddelerini içtenlikle cevapladığı varsayılmıştır.
- Kullanılan ölçeğin, ölçmek istenen özelliği geçerli biçimde ölçtüğü varsayılmıştır.

Varsayım sayısını az tutun ve yalnızca gerçekten araştırmanızı etkileyen kabulleri yazın. Varsayımlar, "kanıtlayamadığım şeyler" listesi değildir.

### Sınırlılıklar

Araştırmanın kapsamını ve genellenebilirliğini sınırlayan durumlardır:

- **Kapsam sınırlılıkları:** Belirli bir il, okul türü, zaman dilimi veya katılımcı grubu.
- **Yöntem sınırlılıkları:** Öz bildirime dayalı veri, kolay ulaşılabilir örneklem, kesitsel desen.

Sınırlılıkları dürüstçe yazmak bir zayıflık değil, bilimsel olgunluk göstergesidir. Jüri, sınırlılıklarını bilen bir araştırmacıya daha çok güvenir. Ancak sınırlılıkları savunmacı bir dille değil, araştırmanın doğal sınırları olarak sunun.

### Tanımlar

Tezde özel bir anlamda kullandığınız kavramların tanımlarıdır. Herkesin bildiği kavramları tanımlamayın; araştırmanızda belirli bir biçimde kullandığınız terimleri tanımlayın. Tanımlar mümkünse kaynağa dayanmalı veya işlevsel (operasyonel) olmalıdır: "Dijital değerlendirme aracı: Bu araştırmada, öğrenci performansını değerlendirmek amacıyla kullanılan çevrim içi sınav, anket ve geri bildirim uygulamalarını ifade etmektedir."

## Giriş bölümü ne kadar uzun olmalı?

Kesin bir kural yoktur, ama yüksek lisans tezlerinde giriş bölümü genellikle tezin toplam uzunluğunun yaklaşık %10'u civarındadır. Problem durumu bunun büyük kısmını oluşturur. Kuramsal çerçeve ve literatür ayrı bir bölüm olarak yazılıyorsa, girişte literatürü yalnızca problemi kurmaya yetecek kadar kullanın.

## Sık yapılan hatalar

- **Çok genel başlamak:** "Teknoloji hayatımızın her alanına girmiştir" gibi açılış cümleleri okuyucuya bir şey anlatmaz. Konunuza yakın, somut bir tespitle başlayın.
- **Boşluğu göstermemek:** Literatürü özetleyip "bu nedenle bu çalışma yapılmıştır" demek yeterli değildir. Neyin eksik olduğunu açıkça yazın.
- **Amaç ile araştırma soruları arasında uyumsuzluk:** Amaçta "ilişkiyi incelemek" yazıp sorularda yalnızca betimsel sorular sormak.
- **Kaynaksız iddialar:** "Öğretmenlerin çoğu dijital araçları kullanmamaktadır" gibi bir iddia mutlaka kaynağa veya veriye dayanmalıdır.
- **Sınırlılıkları yöntem eleştirisine dönüştürmek:** Sınırlılıklar, kendi tasarımınızı küçümsemek için değil, sonuçların nasıl okunacağını göstermek için yazılır.
- **Giriş bölümünü baştan güncellememek:** Tez bittiğinde girişte vaat edilen ama yapılmayan bir analiz kalmamalıdır.

## Özetle

Giriş bölümü; geniş bağlamdan başlayıp araştırma boşluğuna, oradan da sizin çalışmanıza uzanan bir yol çizer. Problem durumunu problem cümlesiyle bağlayın, amacı ölçülebilir araştırma sorularına dönüştürün, önem bölümünde somut katkıları yazın ve sınırlılıklarınızı dürüstçe belirtin. Tezin genel yol haritası için [tez nasıl yazılır](/blog/tez-nasil-yazilir) rehberimize, kuramsal çerçeveyi kurarken de [kuramsal ve kavramsal çerçeve](/blog/kuramsal-cerceve-kavramsal-cerceve-farki) yazımıza göz atabilirsiniz.`,
  },
  {
    slug: "kuramsal-cerceve-kavramsal-cerceve-farki",
    title: "Kuramsal Çerçeve ve Kavramsal Çerçeve Nedir? Farkları ve Yazım Rehberi",
    description: "Kuramsal ve kavramsal çerçeve farkı nedir? Doğru kuramı seçme, araştırma modelini çizme ve bu bölümü literatür özetinden ayırma.",
    category: "Araştırma ve yöntem",
    keywords: ["kuramsal çerçeve", "kavramsal çerçeve", "teorik çerçeve nasıl yazılır", "araştırma modeli", "kuram seçimi"],
    date: "2026-11-06",
    cta: { text: "Kaynaklarınızı projeye ekleyin, literatür matrisiyle kavramları ve bulguları karşılaştırın; asistan çerçeve bölümünüzü yalnızca bu kaynaklarla kurmanıza yardım etsin.", href: "/kayit", label: "Ücretsiz başla" },
    body: `"Kuramsal çerçeveniz nedir?" sorusu, tez savunmalarında öğrencileri en çok zorlayan sorulardan biridir. Çoğu tezde "Kuramsal Çerçeve" başlıklı bölüm aslında konuyla ilgili tanımların ve çalışmaların bir derlemesidir; araştırmayı yönlendiren bir kuram ya da model içermez. Bu yazıda kuramsal çerçeve ile kavramsal çerçevenin ne olduğunu, aralarındaki farkı ve bu bölümün nasıl yazılacağını anlatıyoruz.

## Kuram nedir?

Kuram (teori), bir olguyu açıklayan, kavramlar arasındaki ilişkileri tanımlayan ve sınanabilir öngörüler üreten sistemli bir düşünce yapısıdır. Örneğin:

- **Planlı Davranış Kuramı (Ajzen):** Bir davranışa yönelik niyetin; tutum, öznel norm ve algılanan davranışsal kontrol tarafından belirlendiğini öne sürer.
- **Teknoloji Kabul Modeli (Davis):** Bir teknolojiyi kullanma niyetinin, algılanan fayda ve algılanan kullanım kolaylığından etkilendiğini öne sürer.
- **Sosyal Bilişsel Kuram (Bandura):** Öğrenme ve davranışı kişisel, davranışsal ve çevresel etkenlerin karşılıklı etkileşimiyle açıklar; öz yeterlik kavramı bu kuramdan gelir.
- **Öz Belirleme Kuramı (Deci ve Ryan):** Motivasyonu özerklik, yeterlik ve ilişkili olma ihtiyaçlarının karşılanmasıyla açıklar.

Bu kuramların ortak özelliği, "hangi değişkenler önemlidir ve bunlar birbirini nasıl etkiler?" sorusuna cevap vermeleridir.

## Kuramsal çerçeve nedir?

Kuramsal çerçeve, araştırmanızı **var olan bir veya birkaç kurama dayandırmanızdır.** Seçtiğiniz kuram:

- Hangi değişkenleri incelediğinizi belirler,
- Değişkenler arasında hangi ilişkileri beklediğinizi (hipotezlerinizi) gerekçelendirir,
- Bulgularınızı yorumlarken bir referans noktası sunar.

Örneğin üniversite öğrencilerinin yapay zekâ araçlarını kullanma niyetini inceliyorsanız, Teknoloji Kabul Modeli doğal bir kuramsal çerçevedir. Modeldeki "algılanan fayda" ve "algılanan kullanım kolaylığı" değişkenleriniz olur; modelin öngördüğü ilişkiler de hipotezleriniz hâline gelir.

## Kavramsal çerçeve nedir?

Kavramsal çerçeve, araştırmacının **kendi oluşturduğu**, araştırmadaki temel kavramları ve aralarındaki varsayılan ilişkileri gösteren yapıdır. Tek bir kurama dayanmak zorunda değildir; birden fazla kuramdan, önceki araştırma bulgularından ve hatta araştırmacının gözlemlerinden beslenebilir.

Kavramsal çerçeve genellikle bir **araştırma modeli** diyagramıyla gösterilir: Kutular değişkenleri, oklar da beklenen ilişkileri temsil eder. Örneğin "Öz yeterlik → Öğrenme kaygısı → Akademik başarı" gibi bir aracılık modeli.

## Aradaki fark: kısa bir karşılaştırma

- **Kaynağı:** Kuramsal çerçeve var olan, sınanmış bir kurama dayanır. Kavramsal çerçeve araştırmacının birden çok kaynaktan sentezlediği bir yapıdır.
- **Kapsamı:** Kuramsal çerçeve geniştir ve birçok çalışmada kullanılabilir. Kavramsal çerçeve sizin araştırmanıza özgüdür.
- **Kullanım durumu:** Güçlü bir kuramın olduğu alanlarda kuramsal çerçeve, kuramların konuyu tek başına açıklamadığı veya yeni bir alanda çalıştığınız durumlarda kavramsal çerçeve daha uygundur.

Uygulamada ikisi sıklıkla birlikte kullanılır: Bir kurama dayanır, ardından onu kendi bağlamınıza uyarlayan bir kavramsal model kurarsınız. Bazı kaynaklar bu iki terimi birbirinin yerine de kullanır; önemli olan, tezinizde hangi anlamda kullandığınızı açıkça belirtmenizdir.

## Doğru kuramı nasıl seçersiniz?

1. **Araştırma sorunuzdan başlayın.** Sorunuz bir davranışı mı, bir tutumu mu, bir süreci mi açıklamaya çalışıyor?
2. **Alanınızdaki çalışmalara bakın.** Konunuzla ilgili son yıllarda yayımlanan makaleler hangi kuramları kullanıyor? Literatür taraması yaparken her çalışmanın dayandığı kuramı not edin. [Literatür taraması rehberimizde](/blog/literatur-taramasi-nasil-yapilir) bu notları matris hâlinde tutmayı anlattık.
3. **Kuramın değişkenlerinin ölçülebilir olup olmadığını kontrol edin.** Kuramdaki kavramlar için geçerli ve güvenilir ölçekler var mı?
4. **Kuramın eleştirilerini de okuyun.** Her kuramın sınırlılıkları vardır. Tartışma bölümünde bunlara değinmek, savunmada güçlü bir izlenim bırakır.
5. **Danışmanınızla tartışın.** Kuram seçimi, tezin bütün yapısını etkiler; erken aşamada netleştirilmelidir.

Nitel araştırmalarda kuram her zaman başlangıç noktası olmayabilir. Örneğin temele dayalı kuram yaklaşımında amaç, veriden yeni bir kuram geliştirmektir. Bu durumda çerçeve bölümünde hassaslaştırıcı kavramları ve araştırmacının bakış açısını açıklamanız yeterlidir.

## Bu bölüm nasıl yazılır?

İyi bir kuramsal veya kavramsal çerçeve bölümü şu sırayı izleyebilir:

1. **Kuramın tanıtımı:** Kuramın kim tarafından, hangi amaçla geliştirildiği ve temel önermeleri. Birincil kaynağa (kuramı ilk ortaya koyan çalışmaya) atıf yapın.
2. **Temel kavramların tanımı:** Kuramdaki her kavramın ne anlama geldiği ve sizin araştırmanızda nasıl ölçüleceği.
3. **Kuramın kullanıldığı çalışmalar:** Kuramın benzer bağlamlarda nasıl uygulandığı ve ne sonuç verdiği.
4. **Sizin araştırmanıza uyarlanması:** Kuramın hangi kısımlarını kullandığınız, hangi değişkenleri eklediğiniz veya çıkardığınız ve neden.
5. **Araştırma modeli ve hipotezler:** Diyagram ve her ok için kuramsal veya görgül gerekçe.

Son adım çok önemlidir: Modelinizdeki her ilişki için "bu ilişkiyi neden bekliyorum?" sorusuna kaynakla cevap verebilmelisiniz. Gerekçesiz oklar, jürinin ilk sorgulayacağı noktadır.

## Kuramsal çerçeve ile literatür taraması aynı şey mi?

Hayır. Literatür taraması konuyla ilgili **çalışmaların ne bulduğunu** özetler ve sentezler. Kuramsal çerçeve ise **araştırmanızın hangi düşünce yapısına dayandığını** gösterir. Literatür taraması "ne biliniyor?" sorusuna, kuramsal çerçeve "bu bilgiyi hangi mercekle okuyorum?" sorusuna cevap verir.

Pek çok tezde bu ikisi aynı bölümde yer alır; bu bir sorun değildir. Sorun, bölümün yalnızca tanımlar ve çalışma özetlerinden oluşması ve hiçbir kuramın araştırmayı yönlendirmemesidir.

## Kuramsal çerçeveyi tezin geri kalanına bağlamak

Kuram yalnızca ikinci bölümde kalmamalıdır:

- **Yöntem bölümünde:** Değişkenleri ölçmek için seçtiğiniz ölçekler kuramın kavramlarıyla uyumlu olmalıdır.
- **Bulgular bölümünde:** Hipotez testleri modelinizdeki ilişkileri izlemelidir.
- **Tartışma bölümünde:** Bulgularınızın kuramın öngörüleriyle uyuşup uyuşmadığını tartışın. Kuramı destekleyen bulgular kadar desteklemeyenler de değerlidir.

## Sık yapılan hatalar

- **Kuram adı verip kullanmamak:** İkinci bölümde bir kuram tanıtılıp tezin geri kalanında hiç anılmaması.
- **Çok fazla kuram:** Beş farklı kuramı kısa kısa özetlemek, hiçbirinin araştırmayı yönlendirmemesi anlamına gelir. Bir ana kuram ve gerekiyorsa bir-iki tamamlayıcı kuram yeterlidir.
- **İkincil kaynaktan kuram anlatmak:** Kuramı başka bir tezden aktarmak yerine kuramın özgün kaynağını okuyun.
- **Gerekçesiz araştırma modeli:** Değişkenleri kutulara koyup aralarına ok çizmek, model kurmak değildir.
- **Kavramları tutarsız kullanmak:** Bir bölümde "öz yeterlik", diğerinde "özgüven" demek. Kavramı bir kez tanımlayın ve bütün tezde aynı terimi kullanın.

## Özetle

Kuramsal çerçeve araştırmanızı var olan bir kurama dayandırır; kavramsal çerçeve ise kavramlarınızı ve beklediğiniz ilişkileri kendi modelinizle gösterir. Kuramınızı araştırma sorunuza göre seçin, özgün kaynağından okuyun, modelinizdeki her ilişkiyi gerekçelendirin ve kuramı yöntemden tartışmaya kadar tezin her bölümünde kullanın. Bu bölümü yazmadan önce [tez giriş bölümü](/blog/tez-giris-bolumu-nasil-yazilir) ve [araştırma sorusu ve hipotez](/blog/arastirma-sorusu-ve-hipotez-nasil-yazilir) rehberlerimize de göz atabilirsiniz.`,
  },
  {
    slug: "sistematik-derleme-meta-analiz-prisma",
    title: "Sistematik Derleme ve Meta-Analiz Nasıl Yapılır? PRISMA 2020 Rehberi",
    description: "Sistematik derleme ve meta-analiz adım adım: PICO, protokol kaydı, arama stratejisi, PRISMA 2020 akış şeması, yanlılık riski ve heterojenlik.",
    category: "Araştırma ve yöntem",
    keywords: ["sistematik derleme", "meta analiz nasıl yapılır", "prisma 2020", "pico", "prisma akış şeması"],
    date: "2026-11-06",
    cta: { text: "Birden çok akademik veri tabanında aynı anda arayın, sonuçları yinelenenlerden ayıklayıp projenize ekleyin ve literatür matrisiyle karşılaştırın.", href: "/kayit", label: "Ücretsiz başla" },
    body: `Sistematik derlemeler, bir konudaki bütün kanıtları önceden belirlenmiş ve şeffaf bir yöntemle toplayıp değerlendiren çalışmalardır. Kanıt hiyerarşisinin üst basamaklarında yer aldıkları için dergilerde yüksek ilgi görürler; doğru yürütüldüklerinde yüksek lisans ve doktora tezleri için de güçlü bir seçenektir. Ancak sistematik derleme "kapsamlı bir literatür taraması" değildir. Bu yazıda sistematik derlemenin ve meta-analizin adımlarını, PRISMA 2020 yönergesine göre anlatıyoruz.

## Geleneksel derleme, sistematik derleme ve meta-analiz

- **Geleneksel (anlatı) derleme:** Yazar konuyla ilgili çalışmaları seçer ve yorumlar. Seçim ölçütleri genellikle açık değildir; bu nedenle yanlılığa açıktır.
- **Sistematik derleme:** Açıkça tanımlanmış bir soru, önceden belirlenmiş ölçütler, tekrarlanabilir bir arama ve kalite değerlendirmesi içerir. Başka bir araştırmacı aynı adımları izlerse benzer çalışmalara ulaşmalıdır.
- **Meta-analiz:** Sistematik derlemeye dahil edilen çalışmaların sayısal sonuçlarını istatistiksel olarak birleştirir ve ortak bir etki büyüklüğü hesaplar. Her sistematik derleme meta-analiz içermez; ama her iyi meta-analiz bir sistematik derlemeye dayanır.

## 1. Adım: Soruyu PICO ile tanımlayın

Sistematik derlemenin başarısı, sorunun netliğine bağlıdır. Sağlık ve eğitim alanlarında yaygın olarak **PICO** çerçevesi kullanılır:

- **P (Population / Popülasyon):** Kimler? Ör. ilkokul öğrencileri.
- **I (Intervention / Müdahale):** Ne uygulanıyor? Ör. oyunlaştırılmış matematik öğretimi.
- **C (Comparison / Karşılaştırma):** Neyle karşılaştırılıyor? Ör. geleneksel öğretim.
- **O (Outcome / Sonuç):** Hangi çıktı ölçülüyor? Ör. matematik başarısı.

Örnek soru: "İlkokul öğrencilerinde oyunlaştırılmış matematik öğretimi, geleneksel öğretime kıyasla matematik başarısını ne ölçüde etkilemektedir?"

Müdahale içermeyen sorular için PECO (maruziyet) veya nitel çalışmalar için SPIDER gibi farklı çerçeveler de kullanılabilir.

## 2. Adım: Protokol yazın ve kaydedin

Protokol, derlemenin yöntemini **çalışmaya başlamadan önce** tanımlayan belgedir: soru, dahil etme ve hariç tutma ölçütleri, veri tabanları, arama stratejisi, kalite değerlendirme aracı ve analiz planı. Protokolün önceden yazılması, sonuçlara bakarak yöntemi değiştirme riskini azaltır.

Sağlık alanındaki sistematik derlemeler için **PROSPERO** en bilinen kayıt platformudur. Diğer alanlarda protokoller Open Science Framework (OSF) gibi platformlarda da kaydedilebilir. Kayıt numarasını makalede veya tezde belirtin.

## 3. Adım: Dahil etme ve hariç tutma ölçütleri

Ölçütler net ve uygulanabilir olmalıdır:

- **Çalışma deseni:** Yalnızca deneysel çalışmalar mı, gözlemsel çalışmalar da mı?
- **Yayın türü:** Hakemli makaleler, tezler, kongre bildirileri…
- **Dil:** Yalnızca Türkçe ve İngilizce mi? Dil kısıtlaması bir sınırlılıktır; gerekçelendirin.
- **Tarih aralığı:** Neden bu aralık? Ör. müdahalenin ilk kez tanımlandığı yıldan itibaren.
- **Sonuç ölçümü:** Hangi çıktıların raporlandığı çalışmalar dahil edilecek?

## 4. Adım: Kapsamlı ve tekrarlanabilir arama

Arama stratejisi derlemenin temelidir:

- **Birden fazla veri tabanı kullanın.** Alanınıza göre Web of Science, Scopus, PubMed, ERIC, PsycINFO gibi uluslararası veri tabanlarının yanında Türkçe çalışmalar için TR Dizin, DergiPark ve YÖK Ulusal Tez Merkezi. Bu kaynaklarda arama yapmayı [DergiPark, TR Dizin ve YÖK Tez rehberimizde](/blog/dergipark-tr-dizin-yok-tez-kaynak-arama) anlattık.
- **Anahtar kelimeleri sistemli birleştirin.** Her PICO bileşeni için eş anlamlıları OR ile, bileşenleri AND ile bağlayın: (oyunlaştırma OR "oyun tabanlı öğrenme") AND (matematik) AND (ilkokul OR "temel eğitim").
- **Gri literatürü unutmayın.** Yayımlanmamış tezler ve raporlar, yayın yanlılığını azaltır.
- **Kaynakça taraması yapın.** Dahil edilen çalışmaların kaynakçalarını inceleyin.
- **Her şeyi kaydedin.** Hangi veri tabanında, hangi tarihte, hangi arama ifadesiyle kaç sonuç bulduğunuzu not edin. PRISMA, en az bir veri tabanındaki tam arama ifadesinin raporlanmasını ister.

## 5. Adım: Tarama ve seçim

1. Bütün sonuçları bir kaynak yönetim programına aktarın ve **yinelenenleri ayıklayın**.
2. **Başlık ve özet taraması:** Ölçütleri açıkça karşılamayan çalışmaları eleyin.
3. **Tam metin değerlendirmesi:** Kalan çalışmaların tam metinlerini okuyarak son kararı verin. Tam metin aşamasında elenen her çalışma için **gerekçeyi** kaydedin.

İdeal olarak tarama iki bağımsız araştırmacı tarafından yapılır ve anlaşmazlıklar tartışmayla veya üçüncü bir araştırmacıyla çözülür. Tez çalışmalarında danışman veya bir meslektaş ikinci değerlendirici olabilir.

## PRISMA 2020 akış şeması

PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) 2020, sistematik derlemelerin nasıl raporlanacağını tanımlayan uluslararası yönergedir. 27 maddelik bir kontrol listesi ve bir **akış şeması** içerir. Akış şeması şu aşamalarda sayıları gösterir:

- **Belirleme:** Her veri tabanından ve diğer kaynaklardan bulunan kayıt sayısı; tarama öncesi çıkarılan kayıtlar (yinelenenler vb.).
- **Tarama:** Taranan kayıtlar, elenen kayıtlar; tam metni istenen ve ulaşılamayan raporlar; uygunluk açısından değerlendirilen raporlar ve **gerekçeleriyle** hariç tutulanlar.
- **Dahil edilen:** Derlemeye dahil edilen çalışma ve rapor sayısı.

Akış şemasındaki sayıların birbirini tutması gerekir. Hakemlerin ilk kontrol ettiği şeylerden biri budur.

## 6. Adım: Veri çıkarma

Her çalışmadan hangi bilgileri alacağınızı önceden belirleyin ve bir veri çıkarma formu oluşturun: yazar, yıl, ülke, örneklem, desen, müdahalenin süresi ve içeriği, ölçüm araçları ve sonuçlar (ortalamalar, standart sapmalar, örneklem büyüklükleri veya etki büyüklükleri). Formu birkaç çalışmada deneyip düzeltin.

## 7. Adım: Yanlılık riskini değerlendirin

Her çalışmanın yöntemsel kalitesi, kabul görmüş araçlarla değerlendirilir:

- **Randomize kontrollü çalışmalar için:** Cochrane'in RoB 2 aracı.
- **Randomize olmayan müdahale çalışmaları için:** ROBINS-I.
- **Diğer desenler için:** Joanna Briggs Institute (JBI) kontrol listeleri, Newcastle-Ottawa ölçeği gibi araçlar.

Kanıtın genel kesinliği için GRADE yaklaşımı kullanılabilir.

## 8. Adım: Sentez ve meta-analiz

Çalışmalar yeterince benzerse meta-analiz yapılır:

- **Etki büyüklüğü:** Sürekli sonuçlar için standartlaştırılmış ortalama farkı (Cohen's d veya Hedges' g), ikili sonuçlar için risk oranı veya odds oranı.
- **Model seçimi:** Çalışmalar farklı popülasyon ve koşullarda yapıldıysa **rastgele etkiler modeli** genellikle daha uygundur.
- **Heterojenlik:** Çalışmaların sonuçlarının ne kadar farklı olduğunu gösterir. Q testi ve **I²** istatistiği raporlanır. Yaygın bir yoruma göre I² için %25, %50 ve %75 sırasıyla düşük, orta ve yüksek heterojenliğe işaret eder. Yüksek heterojenlikte alt grup analizleri veya meta-regresyon ile kaynağı araştırılır.
- **Orman grafiği (forest plot):** Her çalışmanın etki büyüklüğünü ve güven aralığını, en altta da birleşik etkiyi gösterir.
- **Yayın yanlılığı:** Huni grafiği (funnel plot) ve Egger testi gibi yöntemlerle incelenir.

Çalışmalar meta-analiz için fazla farklıysa, sonuçları sistemli bir anlatı sentezi ile sunabilirsiniz. Bu da geçerli bir sistematik derlemedir.

## Sık yapılan hatalar

- **Protokolsüz başlamak:** Yöntemin sonradan şekillenmesi, yanlılık şüphesi doğurur.
- **Tek veri tabanında arama:** Kapsayıcılığı ciddi biçimde sınırlar.
- **Arama ifadesini raporlamamak:** Derleme tekrarlanamaz hâle gelir.
- **Eleme gerekçelerini kaydetmemek:** Akış şemasını tamamlamak imkânsızlaşır.
- **Kalite değerlendirmesini atlamak:** Zayıf çalışmalarla güçlü çalışmaları aynı ağırlıkla yorumlamak yanıltıcı sonuçlar verir.
- **Heterojenliği yok saymak:** Çok farklı çalışmaların ortalamasını almak anlamlı bir sonuç vermeyebilir.

## Özetle

Sistematik derleme; net bir PICO sorusu, önceden kaydedilmiş bir protokol, birden fazla veri tabanında tekrarlanabilir bir arama, iki aşamalı tarama, kalite değerlendirmesi ve PRISMA 2020'ye uygun raporlamadan oluşur. Meta-analiz ise çalışmalar yeterince benzer olduğunda bu sürecin sayısal sentez adımıdır. Genel literatür taraması teknikleri için [literatür taraması nasıl yapılır](/blog/literatur-taramasi-nasil-yapilir) yazımıza, kaynaklarınızı düzenli tutmak için de [Zotero ve Mendeley rehberimize](/blog/zotero-mendeley-ile-kaynak-yonetimi) göz atabilirsiniz.`,
  },
  {
    slug: "yagmaci-dergiler-nasil-anlasilir",
    title: "Yağmacı (Predatory) Dergiler Nasıl Anlaşılır? Makale Göndermeden Önce Kontrol Listesi",
    description: "Yağmacı (sahte) dergiler nasıl anlaşılır? Hakem süreci, dizin iddiaları, ücretler, ele geçirilmiş dergiler ve göndermeden önce kontrol listesi.",
    category: "Makale ve yayın",
    keywords: ["yağmacı dergi", "predatory journal", "sahte dergi nasıl anlaşılır", "think check submit", "güvenilir dergi seçimi"],
    date: "2026-11-06",
    cta: { text: "Makalenizin konusuna ve kaynaklarına göre dergi önerileri alın; önerilen her derginin dizin ve yayın bilgisini kendiniz doğrulayın.", href: "/kayit", label: "Ücretsiz başla" },
    body: `Akademik e-posta adresinize hiç "Değerli Profesör, son makalenizi çok beğendik; dergimizde yayımlamak isteriz, hakem süreci 7 gün" gibi bir davet geldi mi? Bu tür davetlerin önemli bir kısmı, yayın ücreti almak dışında bir amacı olmayan **yağmacı (predatory) dergilerden** gelir. Bu dergilerde yayımlanan bir makale; akademik yükseltme başvurularında sorun yaratabilir, araştırmanızın görünürlüğünü azaltabilir ve emeğinizin karşılıksız kalmasına neden olabilir. Bu yazıda yağmacı dergileri nasıl tanıyacağınızı ve makale göndermeden önce nelere bakmanız gerektiğini anlatıyoruz.

## Yağmacı dergi nedir?

Yağmacı dergiler, akademik bir dergi gibi görünen ama bilimsel yayıncılığın temel standartlarını, özellikle de **gerçek bir hakem değerlendirmesini** uygulamayan yayın organlarıdır. Asıl amaçları yazarlardan yayın ücreti almaktır. Gönderilen hemen her makaleyi, çoğu zaman çok kısa sürede ve anlamlı bir değerlendirme yapmadan kabul ederler.

Açık erişim ve yayın ücreti (APC) kendi başına bir sorun değildir. Pek çok saygın dergi açık erişimlidir ve yayın ücreti alır. Sorun, ücretin karşılığında editoryal ve bilimsel hizmetin verilmemesidir.

## Uyarı işaretleri

Aşağıdaki işaretlerin hiçbiri tek başına bir derginin yağmacı olduğunu kanıtlamaz, ama birkaçı bir aradaysa dikkatli olmanız gerekir.

### Davet ve iletişim

- **Toplu, kişiselleştirilmemiş e-postalar:** Alanınızla ilgisi olmayan bir dergiden, abartılı övgülerle gelen davetler.
- **Çok geniş kapsam:** Aynı dergide tıp, mühendislik, sosyal bilimler ve tarım makaleleri. Saygın dergilerin kapsamı genellikle belirli bir alanla sınırlıdır.
- **Baskıcı dil:** "Bu ayın sayısına yetişmek için son 3 gün" gibi aciliyet yaratan ifadeler.

### Hakem süreci

- **Gerçekçi olmayan süreler:** "Hakem süreci 72 saat", "Kabul garantili hızlı yayın". Gerçek bir hakem değerlendirmesi genellikle haftalar veya aylar sürer.
- **Anlamsız veya hiç olmayan hakem raporları:** Yalnızca biçim düzeltmesi isteyen veya hiçbir somut eleştiri içermeyen raporlar.
- **Kabulden hemen sonra ödeme talebi:** Ücret bilgisi gönderimden önce açıkça belirtilmemişse dikkatli olun.

### Dergi bilgileri

- **Şüpheli dizin iddiaları:** "Dizinlerimiz: Google Scholar, Index Copernicus, ResearchGate…" Google Scholar bir dizin değil, arama motorudur. Dergi Web of Science veya Scopus'ta dizinlendiğini iddia ediyorsa bunu doğrudan bu dizinlerin kendi listelerinde kontrol edin.
- **Uydurma etki faktörleri:** Resmî etki faktörü Clarivate'in Journal Citation Reports'unda yayımlanır. "Global Impact Factor", "Universal Impact Factor" gibi benzer adlı metrikler gerçek etki faktörü değildir.
- **Editör kurulunun doğrulanamaması:** Kurul üyelerinin kurum bilgisi yok, kişiler dergiden haberdar değil veya aynı adlar birçok ilgisiz dergide görünüyor.
- **Eksik iletişim ve yayıncı bilgisi:** Fiziksel adres yok veya yalnızca genel bir e-posta adresi var.
- **Düşük kaliteli yayımlanmış makaleler:** Yazım hataları, alan dışı konular, aynı sayıda çok sayıda ilgisiz makale.
- **ISSN sorunları:** ISSN yok, başka bir dergiye ait veya doğrulanamıyor. ISSN'yi ISSN Portal üzerinden kontrol edebilirsiniz.

## Ele geçirilmiş (hijacked) dergiler

Daha sinsi bir tür, **ele geçirilmiş dergilerdir.** Dolandırıcılar, gerçek ve saygın bir derginin adını, ISSN'sini ve hatta tasarımını kopyalayan sahte bir web sitesi kurar. Yazarlar gerçek dergiye gönderdiklerini düşünürken ücreti sahte siteye öderler ve makale hiçbir zaman gerçek dergide yayımlanmaz.

Korunmanın yolu: Derginin web adresine bir aramadan değil, **Web of Science, Scopus veya DOAJ'ın dergi kaydındaki bağlantıdan** ulaşın. Kayıtta verilen adresle sizin ulaştığınız adres aynı olmalıdır.

## Makale göndermeden önce kontrol listesi

Uluslararası bir girişim olan **Think. Check. Submit.**, yazarlara dergi seçerken sormaları gereken soruları sunar. Bunlardan yola çıkarak hazırladığımız kontrol listesi:

1. **Bu dergiyi ve yayıncısını tanıyor musunuz?** Siz veya meslektaşlarınız bu dergideki makaleleri okuyor ve atıf yapıyor musunuz?
2. **Dergi gerçekten iddia ettiği dizinlerde mi?** Web of Science'ın dergi listesini, Scopus'un kaynak listesini, açık erişim dergiler için **DOAJ**'ı (Directory of Open Access Journals) ve Türkçe dergiler için **TR Dizin**'in dergi listesini doğrudan kontrol edin.
3. **Hakem süreci açıkça tanımlanmış mı?** Kaç hakem, hangi tür değerlendirme (kör, çift kör), ortalama süre?
4. **Ücretler açık mı?** Yayın ücreti, ne zaman ve ne için ödeneceği web sitesinde açıkça yazıyor mu?
5. **Editör kurulu gerçek ve alanında tanınan kişilerden mi oluşuyor?** Birkaç üyenin kurum sayfasını kontrol edin.
6. **Yayıncı, yayın etiği kuruluşlarına üye mi?** COPE (Committee on Publication Ethics) üyeliği bir işarettir; üyeliği yine COPE'un kendi sitesinden doğrulayın.
7. **Arşiv ve kalıcılık:** Makaleler DOI alıyor mu? Dergi geçmiş sayılarına düzenli olarak erişilebiliyor mu?
8. **Telif ve lisans koşulları açık mı?** Makalenin hangi lisansla yayımlanacağı belirtilmiş mi?

## Türkiye'deki akademisyenler için ek notlar

Akademik yükseltme ve teşvik başvurularında hangi dergilerin dikkate alınacağı, ilgili kurumların güncel kurallarıyla belirlenir ve bu kurallar zaman içinde değişebilir. Bir dergiye makale göndermeden önce, hedeflediğiniz başvurunun **güncel** ölçütlerini resmî kaynaktan kontrol edin. Ulusal dergiler için TR Dizin'de dizinlenme, uluslararası dergiler için ise Web of Science ve Scopus kayıtları en sık bakılan ölçütlerdir.

DergiPark'ta yayımlanıyor olmak tek başına kalite göstergesi değildir; DergiPark bir yayın platformudur. Derginin ayrıca TR Dizin veya uluslararası dizinlerde yer alıp almadığına bakın.

## Yağmacı bir dergiye makale gönderdiyseniz

- **Henüz yayımlanmadıysa:** Makaleyi geri çektiğinizi yazılı olarak bildirin ve yanıtı saklayın. Ödeme yapmadıysanız yapmayın.
- **Yayımlandıysa:** Geri çekme talebinde bulunabilirsiniz, ancak bu dergiler genellikle işbirliği yapmaz. Makalenin başka bir dergiye gönderilmesi, yayın etiği açısından çift yayın sorununa yol açabileceği için bir danışmana veya kurumunuzun etik birimine danışın.
- **Deneyiminizi paylaşın:** Meslektaşlarınızı ve kurumunuzu bilgilendirmek, başkalarının aynı tuzağa düşmesini önler.

## Özetle

Yağmacı dergiler; hızlı kabul vaatleri, doğrulanamayan dizin ve etki faktörü iddiaları, belirsiz hakem süreçleri ve toplu davet e-postalarıyla tanınır. Bir dergiye makale göndermeden önce dizin kayıtlarını doğrudan dizinlerin kendi sitelerinden kontrol edin, derginin adresine bu kayıtlardaki bağlantıdan ulaşın ve Think. Check. Submit. sorularını kendinize sorun. Makalenizi hazırlarken [akademik makale nasıl yazılır](/blog/akademik-makale-nasil-yazilir) ve hakem sürecinde [hakem yorumlarına cevap](/blog/hakem-yorumlarina-cevap-nasil-verilir) rehberlerimiz de işinize yarayabilir.`,
  },
];
