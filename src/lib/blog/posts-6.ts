import type { BlogPost } from "./types";

/** D153: TÜBİTAK program rehberleri (1002-A, 2204-A, 2242, 3005). Tutar, süre ve takvim gibi değişebilen ayrıntılar verilmez. */
export const POSTS_6: BlogPost[] = [
  {
    slug: "tubitak-1002-a-hizli-destek-basvurusu",
    title: "TÜBİTAK 1002-A Hızlı Destek Başvurusu: Kısa Süreli Proje Önerisi Rehberi",
    seoTitle: "TÜBİTAK 1002-A Hızlı Destek Başvuru Rehberi",
    description: "TÜBİTAK 1002-A Hızlı Destek Modülü için proje önerisi: kapsamı daraltma, özgün değer, yöntem, iş paketleri, risk ve bütçeyi kısa süreye göre yazma ipuçları.",
    category: "Başvuru ve savunma",
    keywords: ["TÜBİTAK 1002-A", "1002 hızlı destek", "hızlı destek modülü başvurusu", "1002-A proje önerisi örneği", "ARDEB proje yazma"],
    date: "2026-11-12",
    updated: "2026-11-15",
    cta: { text: "TÜBİTAK 1002-A programını seçin; özgün değerden bütçeye bölümler hazır gelsin, kısa süreye uygun iş-zaman çizelgesini birlikte kurun.", href: "/kayit", label: "1002-A önerimi hazırla" },
    body: `TÜBİTAK 1002-A Hızlı Destek Modülü, kısa sürede tamamlanabilecek, kapsamı dar ve odaklı araştırmalar için tasarlanmış bir ARDEB programıdır. Bir ön çalışma, fizibilite, yöntemin denenmesi ya da büyük bir projeye hazırlık niteliğindeki araştırmalar bu programa uygundur.

Proje süresi, destek üst sınırı, başvuru koşulları ve takvim çağrıdan çağrıya değişebilir. Başvurmadan önce TÜBİTAK’ın güncel çağrı duyurusunu ve başvuru formunu mutlaka inceleyin.

## 1002-A’yı diğer programlardan ayıran nokta

1002-A önerisinde değerlendiricinin ilk sorusu şudur: “Bu araştırma, bu kısa sürede ve bu bütçeyle gerçekten tamamlanabilir mi?” Bu yüzden başarılı bir öneri, büyük bir araştırma programını sıkıştırmaya çalışmaz; tek bir soruya odaklanır.

- **Tek ve net bir araştırma sorusu** belirleyin.
- Hedefleri, kısa sürede ölçülebilir çıktılara bağlayın.
- Neden **hızlı desteğe** ihtiyaç duyduğunuzu gerekçelendirin: ön veri ihtiyacı, zamana duyarlı bir olgu ya da büyük bir başvurudan önce yöntemin sınanması gibi.

## Önerinin bölümleri

### Özgün değer

Konunun önemini güncel literatürle gösterin ve mevcut çalışmaların bıraktığı boşluğu açıkça yazın. Kısa süreli bir projede bile özgün katkı net olmalıdır.

### Yöntem

Yöntemi hedeflere tek tek bağlayın. Örneklem, veri toplama araçları ve analiz yöntemini, sürenin gerçekçi kılacağı biçimde sınırlayın.

### Proje yönetimi

- **İş paketleri:** Az sayıda, kısa ve birbirini izleyen iş paketleri yazın.
- **Başarı ölçütü:** Her iş paketinin sonunda neyin elde edilmiş olacağını belirtin.
- **Risk ve B planı:** Kısa sürede gecikmeyi telafi etmek zordur; olası riskleri ve alternatifleri önceden gösterin.

### Yaygın etki

Beklenen çıktıları gerçekçi yazın: bildiri, makale ya da daha kapsamlı bir projeye (ör. 1001) temel oluşturacak ön bulgular.

### Bütçe

Her kalemi yöntemdeki bir işe bağlayın. Kısa süreli bir projede gerekçesiz cihaz veya uzun süreli personel talebi değerlendirmede olumsuz izlenim bırakır.

## Sık yapılan hatalar

- Kapsamı 1001 projesi kadar geniş tutmak
- Süreyle uyumsuz iş-zaman çizelgesi
- Hızlı destek gerekçesini boş geçmek
- Ölçülemeyen, genel hedefler

Benzer yapıdaki öğrenci programı için [TÜBİTAK 2209-A rehberimize](/blog/tubitak-2209-a-basvurusu-nasil-hazirlanir) de göz atabilirsiniz.


## Kısa süreli projede kapsamı daraltmak

Hızlı destek programlarında en sık yapılan hata, kısa sürede bitirilemeyecek kadar geniş bir proje önermektir. Kapsamı daraltmak için:

- Tek bir ana araştırma sorusuna odaklanın.
- Veri toplama sürecinin proje süresinin yarısını aşmamasına dikkat edin.
- Gerekli altyapının (laboratuvar, yazılım, katılımcı erişimi) hazır olduğunu gösterin.

## Amaç ve hedefleri ölçülebilir yazmak

“Konuyu incelemek” bir amaç olabilir ama ölçülebilir bir hedef değildir. Hedefleri somut çıktılarla yazın: “… ilişkisini … katılımcıyla sınamak”, “… prototipini geliştirip … ölçütüne göre test etmek”. Değerlendirici, proje sonunda hedefe ulaşılıp ulaşılmadığını bu ifadelerden anlayabilmelidir.

## İş paketi ve risk tablosu

| İş paketi | Süre | Çıktı | Olası risk | B planı |
| --- | --- | --- | --- | --- |
| Literatür ve tasarım | 1. ay | Tasarım raporu | — | — |
| Veri toplama | 2.–4. ay | Veri seti | Katılımcıya ulaşılamaması | İkinci kurumla iş birliği |
| Analiz ve raporlama | 5.–6. ay | Sonuç raporu | Analizin gecikmesi | Önceden hazırlanmış analiz planı |

Bu tablo bir örnektir; süreleri programın ve çağrının izin verdiği süreye göre düzenleyin.

## Bütçe gerekçesi

Her bütçe kalemini yöntemle ilişkilendirerek gerekçelendirin: “Bu cihaz, yöntem bölümünde anlatılan ölçümler için gereklidir.” Yöntemde karşılığı olmayan kalemler değerlendiricinin dikkatini çeker ve bütçe kesintisine yol açabilir.

## Çıktılar ve yaygın etki

Projeden beklenen somut çıktıları listeleyin: makale, bildiri, lisansüstü tez, veri seti, yazılım. Hızlı destek projelerinin çoğu zaman daha büyük bir projenin ön çalışması olduğunu belirtmek, projenin devam potansiyelini gösterir.


## Güncel çağrı belgesini esas alın

Başvuru takvimi, bütçe üst sınırları, başvuru koşulları ve form şablonları çağrıdan çağrıya değişebilir. Bu rehber genel yazım ilkelerini anlatır; tarih, tutar ve şartlar için her zaman TÜBİTAK’ın güncel çağrı duyurusunu ve başvuru kılavuzunu okuyun.

## Academiana ile 1002-A önerisi

Academiana’da “TÜBİTAK / BAP proje önerisi” türünü ve 1002-A programını seçtiğinizde özet, özgün değer, yöntem, proje yönetimi, yaygın etki ve bütçe bölümleri hazır gelir. Asistan, programın kısa süreli yapısını bilerek kapsamı daraltmanıza yardım eder, literatür boşluğunu gerçek kaynaklarla gösterir, iş paketlerini ve risk tablosunu tablo hâlinde taslaklar. Destek tutarı ve süre gibi program kurallarını uydurmaz; bunları çağrı duyurusundan sizin kontrol etmeniz istenir.`,
  },
  {
    slug: "tubitak-2204-a-lise-proje-nasil-hazirlanir",
    title: "TÜBİTAK 2204-A Lise Araştırma Projesi Nasıl Hazırlanır? Adım Adım Rehber",
    seoTitle: "TÜBİTAK 2204-A Lise Projesi Nasıl Hazırlanır?",
    description: "TÜBİTAK 2204-A Lise Öğrencileri Araştırma Projeleri Yarışması için konu seçimi, bilimsel yöntem, proje raporu bölümleri, etik kurallar ve sık yapılan hatalar.",
    category: "Başvuru ve savunma",
    keywords: ["TÜBİTAK 2204-A", "2204 lise proje", "2204-A proje örnekleri", "lise araştırma projesi nasıl yazılır", "TÜBİTAK proje raporu"],
    date: "2026-11-12",
    updated: "2026-11-15",
    cta: { text: "2204-A programını seçin; problemden önerilere kadar proje raporunuzun bölümleri hazır gelsin, gerçek kaynaklarla yazın.", href: "/kayit", label: "2204-A raporumu hazırla" },
    body: `TÜBİTAK 2204-A Lise Öğrencileri Araştırma Projeleri Yarışması, lise öğrencilerinin bir danışman öğretmen eşliğinde bilimsel yöntemle kendi araştırmalarını yürütmesini ve sunmasını amaçlar. Projeler alanlara göre değerlendirilir; bölge ve final aşamalarında jüri karşısında sunulur.

Başvuru koşulları, alanlar, rapor şablonu ve takvim her yıl güncellenebilir. Başvurmadan önce TÜBİTAK’ın güncel yarışma kılavuzunu mutlaka okuyun.

## İyi bir konu nasıl seçilir?

- Gündelik hayatta gözlemlediğiniz **somut bir problemden** yola çıkın.
- Konuyu, okul imkânlarıyla deney veya gözlem yapabileceğiniz kadar daraltın.
- Konunun daha önce nasıl çalışıldığını literatürde araştırın; benzer bir proje varsa sizin farkınızı belirleyin.
- Cevabı internette tek bir aramayla bulunabilen soruları seçmeyin; sizin veri toplamanızı gerektiren bir soru seçin.

## Proje raporunun bölümleri

### Problem ve amaç

Araştırdığınız problemi tek cümleyle yazabilmelisiniz. Amacı ve varsa hipotezinizi açık ve ölçülebilir biçimde belirtin.

### Giriş

Konunun önemini ve önceki çalışmaları kaynak göstererek anlatın. Bilgileri kaynaklarına bağlayın; kaynaksız iddia yazmayın.

### Yöntem

Deney düzeneğini, kullandığınız malzemeleri, ölçümleri ve kontrol gruplarını başka biri tekrar yapabilecek kadar ayrıntılı yazın. Ölçümleri tekrarlayın ve ortalamalarını kullanın.

### Bulgular

Elde ettiğiniz verileri tablo ve grafiklerle gösterin. Yorumu bu bölüme karıştırmayın; ne bulduğunuzu yazın.

### Sonuç, tartışma ve öneriler

Bulguların amaca ve hipoteze göre ne anlama geldiğini, sınırlılıklarınızı ve ileride yapılabilecekleri yazın.

### Kaynaklar

Yararlandığınız her kaynağı tek bir atıf stiline göre listeleyin.

## Etik kurallar

İnsan, hayvan veya sağlıkla ilgili çalışmalarda gerekli izinler ve etik kurallar kılavuzda ayrıca düzenlenir. Bu tür çalışmalara başlamadan önce kılavuzu ve danışman öğretmeninizi mutlaka dinleyin.

## Sık yapılan hatalar

- Çok geniş, okul imkânlarıyla yapılamayacak konular
- Tek ölçüme dayanan sonuçlar
- Bulgular ile yorumun birbirine karışması
- Kaynaksız bilgi ve kopyalanmış metin

Üniversite düzeyindeki benzer program için [TÜBİTAK 2209-A rehberimizi](/blog/tubitak-2209-a-basvurusu-nasil-hazirlanir) inceleyebilirsiniz.


## Araştırma sorusundan deneye

Lise projelerinde iyi bir proje, gözlemlenebilir bir sorundan başlar ve ölçülebilir bir soruya dönüşür:

1. **Gözlem:** “Okulumuzda öğrenciler teneffüslerde çok fazla telefon kullanıyor.”
2. **Soru:** “Teneffüste telefon kullanımı, sonraki dersteki dikkat düzeyini etkiliyor mu?”
3. **Değişkenler:** Bağımsız değişken (telefon kullanımı), bağımlı değişken (dikkat testi puanı), kontrol edilecek değişkenler (sınıf düzeyi, ders saati).
4. **Yöntem:** İki grup, aynı dikkat testi, aynı koşullar.

Bu adımlar projenizin bilimsel yöntemle kurulduğunu gösterir.

## Ölçme ve kayıt tutma

- Ölçümlerinizi her seferinde aynı koşullarda yapın ve tekrarlayın.
- Bir proje günlüğü tutun: tarih, yapılan işlem, gözlem, sonuç ve karşılaşılan sorunlar.
- Fotoğraf ve videolarla süreci belgeleyin; jüri sunumunda kullanabilirsiniz.
- Ham verilerinizi saklayın; tablolar ve grafikler bu verilerden üretilmelidir.

## Grafik ve tablo hazırlama

Bulgularınızı sade grafiklerle gösterin: grupları karşılaştırmak için sütun grafiği, zaman içindeki değişim için çizgi grafiği. Her grafiğe başlık, eksen adları ve birimler ekleyin. Tablolarda ortalama ve standart sapma gibi temel istatistikleri verin. Grafik ve tablo biçimi için [APA 7 tablo ve şekil rehberimiz](/blog/tez-tablo-ve-sekil-apa-7) lise projeleri için de yol gösterir.

## Sergi ve jüri sunumu

- Projenizi iki dakikada anlatabileceğiniz kısa bir konuşma hazırlayın: problem, yöntem, sonuç, önem.
- Posterinizde metin yerine görseller ve kısa cümleler kullanın.
- Jürinin “Bunu neden böyle yaptınız?” sorusuna hazırlıklı olun; yöntem kararlarınızın gerekçesini bilin.
- Projenizin sınırlılıklarını dürüstçe söyleyin ve nasıl geliştirilebileceğini anlatın.

## Danışman öğretmenle çalışma

Danışman öğretmeniniz projenizi yönlendirir ama projeyi sizin yürütmeniz beklenir. Düzenli görüşmeler planlayın, proje günlüğünüzü paylaşın ve kararlarınızı birlikte değerlendirin.


## Güncel çağrı belgesini esas alın

Başvuru takvimi, bütçe üst sınırları, başvuru koşulları ve form şablonları çağrıdan çağrıya değişebilir. Bu rehber genel yazım ilkelerini anlatır; tarih, tutar ve şartlar için her zaman TÜBİTAK’ın güncel çağrı duyurusunu ve başvuru kılavuzunu okuyun.

## Academiana ile 2204-A raporu

Academiana’da “TÜBİTAK / BAP proje önerisi” türünü ve 2204-A programını seçtiğinizde rapor bölümleri hazır gelir; bütçe bölümü bu yarışmada yer almadığı için çıkarılır. Asistan konunuzu daraltmanıza, gerçek kaynaklar bulmanıza ve bulgularınızı tablo ve grafiğe dönüştürmenize yardım eder. Sizin yapmadığınız bir deneyin sonucunu ya da veriyi uydurmaz; veri gereken yerde boşluk bırakır.`,
  },
  {
    slug: "tubitak-2242-proje-yarismasi-rehberi",
    title: "TÜBİTAK 2242 Üniversite Öğrencileri Proje Yarışması Rehberi",
    seoTitle: "TÜBİTAK 2242 Proje Yarışması Rehberi",
    description: "TÜBİTAK 2242 Üniversite Öğrencileri Araştırma Proje Yarışmaları için fikir seçimi, proje özeti, yöntem, uygulanabilirlik, yaygın etki ve sunum hazırlığı.",
    category: "Başvuru ve savunma",
    keywords: ["TÜBİTAK 2242", "2242 proje yarışması", "2242 proje fikirleri", "üniversite öğrencileri proje yarışması", "2242 proje örnekleri"],
    date: "2026-11-12",
    updated: "2026-11-15",
    cta: { text: "2242 programını seçin; problemden yaygın etkiye proje dosyanızı adım adım yazın, sunumunuzu da aynı metinden hazırlayın.", href: "/kayit", label: "2242 projemi hazırla" },
    body: `TÜBİTAK 2242 Üniversite Öğrencileri Araştırma Proje Yarışmaları, ön lisans ve lisans öğrencilerinin tematik alanlarda geliştirdikleri proje fikirlerini ve projelerini sergilediği bir yarışmadır. Projeler önce yazılı olarak, ardından bölge ve final aşamalarında sunumla değerlendirilir.

Tematik alanlar, katılım koşulları, değerlendirme ölçütleri ve takvim her dönem güncellenebilir. Başvurmadan önce TÜBİTAK’ın güncel çağrı duyurusunu ve kılavuzunu mutlaka okuyun.

## Kazanan bir fikrin özellikleri

- **Gerçek bir problem:** Kimin, hangi sorununu çözdüğünüz açık olmalı.
- **Özgünlük:** Benzer çözümleri araştırın ve sizin farkınızı somut olarak yazın.
- **Uygulanabilirlik:** Fikir, teknik ve maliyet açısından hayata geçirilebilir olmalı.
- **Tematik uyum:** Seçtiğiniz tematik alanla ilişkisi doğrudan görünmeli.

## Proje dosyasının bölümleri

### Özet

Problemi, önerdiğiniz çözümü, yöntemi ve beklenen sonucu kısa ve anlaşılır biçimde yazın. Özeti en son yazın.

### Problem ve amaç

Problemin önemini verilerle ve kaynaklarla gösterin. Amacı ölçülebilir hedeflere bölün.

### Literatür ve özgün değer

Benzer çalışmaları ve ürünleri karşılaştırın; projenizin hangi eksikliği giderdiğini gösterin.

### Yöntem

Çözümü nasıl geliştireceğinizi veya geliştirdiğinizi adım adım anlatın: tasarım, prototip, deney, test ve değerlendirme.

### Uygulanabilirlik ve proje yönetimi

İş-zaman planını, ekip içi görev dağılımını ve olası riskleri yazın.

### Yaygın etki

Projenin bilimsel, ekonomik ve toplumsal etkisini gerçekçi biçimde belirtin. Abartılı ve kanıtsız etki iddialarından kaçının.

## Sunuma hazırlık

Jüri karşısında kısa sürede problemi, çözümü ve kanıtınızı anlatmanız gerekir. Sunumu proje dosyanızdan üretin; her slayt tek bir mesaj taşısın. Jürinin sorabileceği soruları önceden çalışın.

## Sık yapılan hatalar

- Problem yerine teknolojiden yola çıkmak
- Benzer çözümleri araştırmamak
- Prototip veya test olmadan kesin sonuç iddia etmek
- Tematik alanla zayıf bağ

Benzer başvuru yapısı için [TÜBİTAK 2209-A rehberimize](/blog/tubitak-2209-a-basvurusu-nasil-hazirlanir) de bakabilirsiniz.


## Problem cümlesini netleştirmek

Kazanan projelerin ortak özelliği, çözdükleri sorunun açık ve önemli olmasıdır. Problem cümlenizi şu soruları cevaplayacak şekilde yazın: Sorun kimi etkiliyor? Ne kadar yaygın? Mevcut çözümler neden yetersiz? Sorunun büyüklüğünü gösteren veriyi güvenilir kaynaklarla destekleyin.

## Mevcut çözümlerle karşılaştırma

Özgün değeri göstermenin en etkili yolu, benzer çözümlerle karşılaştırmadır:

| Ölçüt | Mevcut çözüm A | Mevcut çözüm B | Önerilen proje |
| --- | --- | --- | --- |
| Maliyet | … | … | … |
| Kullanım kolaylığı | … | … | … |
| Erişilebilirlik | … | … | … |
| Temel eksik | … | … | Bu eksiği nasıl gideriyor? |

Tabloyu kendi alanınızdaki gerçek çözümlerle ve kaynaklarıyla doldurun; karşılaştırmayı abartmadan, ölçülebilir ölçütlerle yapın.

## Prototip ve test planı

Bir ürün veya sistem geliştiriyorsanız prototipin hangi aşamada olduğunu ve nasıl test edileceğini açıkça yazın. Test planında: neyin ölçüleceği, hangi koşullarda, kaç tekrarla ve başarının hangi ölçüte göre değerlendirileceği yer almalıdır. Kullanıcı testi yapacaksanız katılımcıların onamını almayı ve gerekiyorsa etik kurul onayını unutmayın: [etik kurul rehberi](/blog/etik-kurul-basvurusu-nasil-yapilir).

## Ekip ve görev dağılımı

Ekip projelerinde her üyenin rolünü ve sorumlu olduğu iş paketini belirtin. Değerlendiriciler ekibin projeyi yürütme kapasitesine bakar; üyelerin bilgi ve becerilerini proje ihtiyaçlarıyla ilişkilendirin.

## Fikri mülkiyet ve sürdürülebilirlik

Projenizin ticarileşme veya yaygınlaşma potansiyeli varsa bunu somut adımlarla anlatın: hedef kullanıcılar, olası iş birlikleri, patent veya faydalı model araştırması. Yarışmadan sonra projenin nasıl devam edeceğini göstermek, yaygın etkinin güçlü bir kanıtıdır.


## Güncel çağrı belgesini esas alın

Başvuru takvimi, bütçe üst sınırları, başvuru koşulları ve form şablonları çağrıdan çağrıya değişebilir. Bu rehber genel yazım ilkelerini anlatır; tarih, tutar ve şartlar için her zaman TÜBİTAK’ın güncel çağrı duyurusunu ve başvuru kılavuzunu okuyun.

## Academiana ile 2242 projesi

Academiana’da “TÜBİTAK / BAP proje önerisi” türünü ve 2242 programını seçtiğinizde proje dosyasının bölümleri hazır gelir; bütçe bölümü bu yarışmada yer almadığı için çıkarılır. Asistan özgün değeri gerçek kaynaklarla göstermenize yardım eder; savunma sunumu aracıyla metninizden sunum taslağı, savunma provasıyla da jüri soruları hazırlayabilirsiniz.`,
  },
  {
    slug: "tubitak-3005-sosyal-bilimler-proje-onerisi",
    title: "TÜBİTAK 3005 Sosyal ve Beşeri Bilimler Proje Önerisi Nasıl Yazılır?",
    seoTitle: "TÜBİTAK 3005 Proje Önerisi Nasıl Yazılır?",
    description: "TÜBİTAK 3005 Sosyal ve Beşeri Bilimlerde Yenilikçi Çözümler programı için toplumsal problem, yenilikçi çözüm, yöntem, proje yönetimi ve yaygın etki rehberi.",
    category: "Başvuru ve savunma",
    keywords: ["TÜBİTAK 3005", "3005 proje önerisi", "sosyal bilimler TÜBİTAK projesi", "sosyal ve beşeri bilimlerde yenilikçi çözümler", "SOBAG proje yazma"],
    date: "2026-11-12",
    updated: "2026-11-15",
    cta: { text: "3005 programını seçin; toplumsal problemden yaygın etkiye proje önerinizi gerçek kaynaklarla yazın.", href: "/kayit", label: "3005 önerimi hazırla" },
    body: `TÜBİTAK 3005 Sosyal ve Beşeri Bilimlerde Yenilikçi Çözümler Araştırma Projeleri Destek Programı, sosyal ve beşeri bilimler alanındaki araştırmacıların toplumsal sorunlara yenilikçi çözümler geliştiren projelerini destekler.

Başvuru koşulları, süre, destek üst sınırı ve form şablonu çağrıdan çağrıya değişebilir. Başvurmadan önce TÜBİTAK’ın güncel çağrı duyurusunu ve başvuru formunu mutlaka inceleyin.

## 3005 önerisinin odağı: problem ve çözüm

Bu programda değerlendiricinin aradığı, yalnızca bir olguyu betimlemek değil, **toplumsal bir soruna uygulanabilir ve yenilikçi bir çözüm** önermektir.

- Problemi ve bundan etkilenen kesimi verilerle ve güncel literatürle tanımlayın.
- Önerdiğiniz çözümün mevcut uygulamalardan farkını açıkça yazın.
- Çözümün kim tarafından, nasıl uygulanabileceğini gösterin.

## Önerinin bölümleri

### Özgün değer

Problemin önemini ve literatürdeki boşluğu kaynaklarla gösterin. Yenilikçi yönü somut olarak tanımlayın: yeni bir model, araç, müdahale programı ya da politika önerisi gibi.

### Yöntem

Nitel, nicel veya karma yöntemi araştırma sorusuna göre gerekçelendirin. Örneklemi, veri toplama araçlarını, analiz yöntemini ve geçerlik-güvenirlik önlemlerini yazın. İnsan katılımcı varsa etik kurul sürecini planlayın.

### Proje yönetimi

İş paketlerini, sorumluları, süreleri ve başarı ölçütlerini tablo hâlinde verin. Saha çalışması, katılımcıya erişim ve izin süreçleri için risk ve B planı yazın.

### Yaygın etki

Bilimsel çıktıların yanında toplumsal etkiyi ve kamu politikalarına olası katkıyı gerçekçi biçimde belirtin. Sonuçların hangi paydaşlarla, nasıl paylaşılacağını planlayın.

### Bütçe

Her kalemi yöntemdeki bir işe bağlayın; saha, anket, transkripsiyon gibi giderleri gerekçelendirin.

## Sık yapılan hatalar

- Problemi betimleyip çözüm önermemek
- “Yenilikçi” iddiasını mevcut uygulamalarla karşılaştırmamak
- Yöntemi soruya göre gerekçelendirmemek
- Etik kurul ve saha izinlerini planlamamak

Öğrenci düzeyindeki benzer başvuru yapısı için [TÜBİTAK 2209-A rehberimizi](/blog/tubitak-2209-a-basvurusu-nasil-hazirlanir) inceleyebilirsiniz.


## Toplumsal sorunu tanımlamak

Sosyal bilimlerde yenilikçi çözüm odaklı projelerin çıkış noktası, toplumsal bir sorundur. Sorunu tanımlarken:

- Sorunun kimleri, hangi ölçekte etkilediğini güvenilir verilerle gösterin.
- Sorunun nedenlerine ilişkin literatürü özetleyin.
- Mevcut politika ve uygulamaların neden yetersiz kaldığını açıklayın.
- Önerdiğiniz çözümün bu boşluğu nasıl dolduracağını belirtin.

## Yöntemi çözümle ilişkilendirmek

Yöntem bölümünde yalnızca veri toplama ve analiz değil, çözümün nasıl geliştirileceği ve sınanacağı da anlatılmalıdır. Örneğin bir eğitim programı öneriyorsanız programın nasıl tasarlanacağını, hangi grupla uygulanacağını ve etkisinin nasıl ölçüleceğini (ön test–son test, kontrol grubu) açıklayın. Nitel ve nicel yöntemleri birlikte kullanmak çözümün hem etkisini hem de nasıl işlediğini göstermeye yardımcı olur. Nitel boyut için [nitel araştırma rehberimize](/blog/nitel-arastirma-gorusme-ve-tematik-analiz), örneklem için [örneklem büyüklüğü rehberimize](/blog/orneklem-buyuklugu-nasil-hesaplanir) bakın.

## Paydaşlar ve iş birlikleri

Sosyal bilim projelerinde çözümün uygulanacağı kurumlar (okullar, belediyeler, sivil toplum kuruluşları) projenin başarısı için kritiktir. Bu kurumlarla iş birliğinin nasıl kurulacağını ve gerekiyorsa niyet mektubu alınıp alınmadığını belirtin. Uygulama izni ve etik kurul onayı süreçlerini takvime yansıtın: [etik kurul rehberi](/blog/etik-kurul-basvurusu-nasil-yapilir).

## Ölçülebilir başarı ölçütleri

Her iş paketi için başarı ölçütü tanımlayın: “Programın uygulandığı grupta hedeflenen değişkende anlamlı bir iyileşme”, “Geliştirilen ölçme aracının güvenirlik katsayısının kabul edilebilir düzeyde olması” gibi. Ölçütler, projenin sonunda neyin başarıldığını nesnel olarak göstermelidir.

## Yaygınlaştırma planı

Bulguların kimlere, nasıl ulaştırılacağını planlayın: akademik yayın, politika notu, uygulayıcılar için kılavuz, çalıştay. Sosyal bilim projelerinde politika yapıcılara ve uygulayıcılara yönelik çıktılar, yaygın etkinin en güçlü göstergesidir.


## Güncel çağrı belgesini esas alın

Başvuru takvimi, bütçe üst sınırları, başvuru koşulları ve form şablonları çağrıdan çağrıya değişebilir. Bu rehber genel yazım ilkelerini anlatır; tarih, tutar ve şartlar için her zaman TÜBİTAK’ın güncel çağrı duyurusunu ve başvuru kılavuzunu okuyun.

## Academiana ile 3005 önerisi

Academiana’da “TÜBİTAK / BAP proje önerisi” türünü ve 3005 programını seçtiğinizde özet, özgün değer, yöntem, proje yönetimi, yaygın etki ve bütçe bölümleri hazır gelir. Asistan programın problem–çözüm odağını bilerek yazar, literatür boşluğunu DergiPark ve uluslararası veri tabanlarındaki gerçek kaynaklarla gösterir, anket ve ölçek hazırlamanıza yardım eder. Toplumsal etkiyi veya veriyi uydurmaz; bunları sizin belirlemeniz istenir.`,
  },
];
