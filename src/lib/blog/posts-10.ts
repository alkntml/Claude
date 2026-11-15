import type { BlogPost } from "./types";

/**
 * D200: Başvuru rehberleri (TÜBİTAK yazılarının arama başarısı üzerine). Türkiye: TÜBİTAK 1001, BAP, 2214-A/2219;
 * yurt dışı: NSF GRFP, MSCA Doktora Sonrası Burs, Fulbright. Tutar, tarih, puan eşiği gibi çağrıdan çağrıya değişen
 * ayrıntılar yazılmaz (tests/blog-d200.test.ts denetler). Kaynaklar programların resmî sayfaları ve gerçek eserlerdir.
 */
const PUNCH = { text: "Punch, K. F. (2016). Developing effective research proposals (3rd ed.). SAGE." };
const TUBITAK = { text: "TÜBİTAK. Destek programları ve çağrı duyuruları.", url: "https://www.tubitak.gov.tr/" };
const CALL = "\n\n## Güncel çağrı belgesini esas alın\n\nBaşvuru takvimi, destek tutarları, başvuru koşulları ve form şablonları çağrıdan çağrıya değişebilir. Bu rehber genel yazım ilkelerini anlatır; tarih, tutar ve şartlar için her zaman programın resmî sayfasındaki güncel çağrı duyurusunu ve başvuru kılavuzunu okuyun.\n";

export const POSTS_10: BlogPost[] = [
  {
    slug: "tubitak-1001-arastirma-projesi-nasil-yazilir",
    title: "TÜBİTAK 1001 Araştırma Projesi Nasıl Yazılır? Özgün Değer, Yöntem ve Proje Yönetimi",
    seoTitle: "TÜBİTAK 1001 Proje Önerisi Nasıl Yazılır? Rehber",
    description: "TÜBİTAK 1001 araştırma projesi önerisi: özgün değer, yöntem, proje yönetimi, yaygın etki ve bütçe bölümlerini panelin değerlendirdiği biçimde yazma rehberi.",
    category: "Başvuru ve savunma",
    keywords: ["TÜBİTAK 1001", "1001 proje önerisi", "1001 proje yazma", "ARDEB proje başvurusu", "özgün değer nasıl yazılır", "iş paketi ve risk tablosu"],
    date: "2026-11-15",
    cta: { text: "“TÜBİTAK / BAP proje önerisi” çalışma türünde 1001’i seçin; özgün değerden bütçeye kadar bölümler hazır gelsin.", href: "/kayit", label: "1001 önerimi hazırla" },
    body: `TÜBİTAK 1001 Bilimsel ve Teknolojik Araştırma Projelerini Destekleme Programı, Türkiye’de akademisyenlerin en çok başvurduğu araştırma destek programlarından biridir. Başvurular TÜBİTAK’ın Araştırma Destek Programları Başkanlığı (ARDEB) tarafından alanında uzman panelistlerce değerlendirilir. Değerlendirmede genellikle önerinin ana bölümleri esas alınır: **özgün değer, yöntem, proje yönetimi ve yaygın etki**. Bu rehber, her bölümü panelistin bakış açısıyla nasıl yazacağınızı anlatır.

## Panelist öneriyi nasıl okur?

Panelistler kısa sürede çok sayıda öneri okur. İyi bir öneri, panelistin şu sorulara ilk sayfalarda cevap bulmasını sağlar:

- Bu proje hangi soruyu cevaplıyor ve bu soru neden önemli?
- Literatürde bu soruya neden henüz cevap verilmemiş?
- Önerilen yöntem bu soruyu gerçekten cevaplayabilir mi?
- Ekip bu projeyi süresi ve bütçesi içinde bitirebilir mi?
- Proje bittiğinde ortaya somut olarak ne çıkacak?

Her bölümü bu sorulardan birine cevap verecek şekilde kurun.

## Özgün değer

Özgün değer bölümü önerinin kalbidir. Üç parçadan oluşur:

1. **Konunun önemi:** Problemi ve neden önemli olduğunu güncel ve güvenilir kaynaklarla anlatın.
2. **Literatürdeki boşluk:** Bu konuda neyin bilindiğini ve neyin bilinmediğini açıkça gösterin. “Bu konuda çalışma yoktur” gibi iddialar yerine “mevcut çalışmalar … örneklemlerle sınırlıdır” gibi kanıtlanabilir ifadeler kullanın.
3. **Araştırma sorusu ve hipotezler:** Boşluğu dolduracak somut soruları yazın.

Özgün değer “yeni bir konu” demek değildir; yeni bir yöntem, örneklem, bağlam veya kuramsal bakış da özgün değer olabilir. Önemli olan farkın açıkça gösterilmesidir. Araştırma sorusu yazımı için [araştırma sorusu ve hipotez rehberimize](/blog/arastirma-sorusu-ve-hipotez-nasil-yazilir), boşluğu göstermek için [literatür matrisi rehberimize](/blog/literatur-matrisi-nasil-hazirlanir) bakın.

## Yöntem

Yöntem bölümü, her araştırma sorusunun nasıl cevaplanacağını gösterir. Panelist, soru ile yöntem arasındaki bağı arar:

- Desen ve gerekçesi
- Örneklem ve örneklem büyüklüğünün hesabı ([örneklem büyüklüğü rehberi](/blog/orneklem-buyuklugu-nasil-hesaplanir))
- Veri toplama araçları ve geçerlik–güvenirlik bilgisi
- Analiz yöntemi ve hangi sorunun hangi analizle cevaplanacağı
- Etik kurul ve izin süreçleri

Yöntemin uygulanabilirliğini gösterin: gerekli laboratuvar, yazılım veya katılımcı erişimi var mı? Ön çalışma yaptıysanız sonuçlarını kısaca verin; bu, uygulanabilirliğin güçlü bir kanıtıdır.

## Proje yönetimi: iş paketleri ve risk

Projeyi iş paketlerine bölün ve her iş paketinin süresini, sorumlusunu ve başarı ölçütünü yazın:

| İş paketi | Süre | Sorumlu | Başarı ölçütü |
| --- | --- | --- | --- |
| Literatür ve tasarım | 1.–3. ay | Yürütücü | Veri toplama protokolü hazır |
| Veri toplama | 4.–12. ay | Araştırmacı, bursiyer | Planlanan örnekleme ulaşıldı |
| Analiz | 13.–16. ay | Yürütücü, araştırmacı | Analiz raporu tamamlandı |
| Yayın ve raporlama | 17.–18. ay | Tüm ekip | Makale gönderildi, sonuç raporu teslim edildi |

Bu tablo bir örnektir; süreler projenize ve çağrının izin verdiği süreye göre belirlenir. Her önemli risk için bir B planı yazın: veri toplama gecikirse, bir cihaz bozulursa, bir ekip üyesi ayrılırsa ne olacak?

## Yaygın etki

Yaygın etki, projenin sonuçlarının kimlere ve nasıl ulaşacağıdır. Beklenen çıktıları somut yazın:

- Bilimsel: makale, bildiri, lisansüstü tez
- Ekonomik veya toplumsal: uygulayıcılar için kılavuz, politika önerisi, ürün veya yazılım
- Kapasite: projede yetişecek lisansüstü öğrenciler, kurulacak altyapı
- Yeni projeler: bu projenin açacağı ulusal veya uluslararası proje başvuruları

“Önemli katkı sağlayacaktır” gibi genel ifadeler yerine ölçülebilir hedefler yazın.

## Bütçe gerekçesi

Her bütçe kalemini yöntemle ilişkilendirin. Panelist “Bu cihaz yöntemde nerede kullanılıyor?”, “Bu kadar seyahat neden gerekli?” diye sorar. Yöntemde karşılığı olmayan kalemler kesintiye uğrar ve önerinin güvenilirliğini zedeler.

## Sık yapılan hatalar

- Özgün değerde boşluğu kaynakla göstermemek
- Araştırma soruları ile yöntem arasındaki bağı kurmamak
- Gerçekçi olmayan bir takvim ve risk planı vermemek
- Ekibin uzmanlığını projeyle ilişkilendirmemek
- Panel yorumlarına ret sonrası bakmadan aynı öneriyi yeniden göndermek

Reddedilen bir öneri yeniden geliştirilip gönderilebilir; panel yorumlarını bir hakem raporu gibi okuyun ve her eleştiriye öneride cevap verin. Kısa ve odaklı bir ön çalışma için [1002-A Hızlı Destek rehberimize](/blog/tubitak-1002-a-hizli-destek-basvurusu) bakabilirsiniz.${CALL}
## Academiana ile 1001 önerisi

Academiana’da “TÜBİTAK / BAP proje önerisi” çalışma türünü seçip programı “TÜBİTAK 1001 Araştırma Projeleri” olarak belirlediğinizde özgün değer, yöntem, proje yönetimi, yaygın etki ve bütçe bölümleri hazır gelir. Asistan literatür boşluğunu projenize eklediğiniz gerçek kaynaklarla göstermenize yardımcı olur, iş paketi ve risk tablolarını taslaklar. Bütçe tutarı, süre ve program kuralı uydurmaz; bunları sizin çağrı duyurusundan kontrol edip girmeniz istenir.`,
    sources: [TUBITAK, PUNCH],
  },
  {
    slug: "bap-projesi-nasil-hazirlanir",
    title: "BAP Projesi Nasıl Hazırlanır? Üniversite Bilimsel Araştırma Projesi Rehberi",
    seoTitle: "BAP Projesi Nasıl Hazırlanır? Başvuru Rehberi",
    description: "Üniversite BAP (Bilimsel Araştırma Projeleri) başvurusu: proje türleri, tez projesi, yönerge, form bölümleri, bütçe gerekçesi ve sık yapılan hatalar.",
    category: "Başvuru ve savunma",
    keywords: ["BAP projesi nasıl yazılır", "BAP başvurusu", "BAP tez projesi", "bilimsel araştırma projeleri", "BAP proje önerisi örneği", "BAP bütçe"],
    date: "2026-11-15",
    cta: { text: "“TÜBİTAK / BAP proje önerisi” çalışma türünde BAP’ı seçin; özet, amaç, yöntem, iş-zaman çizelgesi ve bütçe gerekçesi bölümleri hazır gelsin.", href: "/kayit", label: "BAP önerimi hazırla" },
    body: `BAP (Bilimsel Araştırma Projeleri), üniversitelerin kendi bütçeleriyle öğretim elemanlarının ve lisansüstü öğrencilerin araştırmalarını desteklediği proje sistemidir. Özellikle lisansüstü tezlerin malzeme, cihaz, yazılım, saha çalışması ve analiz giderleri çoğu zaman BAP ile karşılanır. TÜBİTAK projelerine göre daha erişilebilir olduğu için ilk proje deneyimi için iyi bir başlangıçtır.

## Her üniversitenin kuralı farklıdır

BAP’ın en önemli özelliği, kuralların üniversiteden üniversiteye değişmesidir. Proje türleri, başvuru takvimi, destek üst sınırları, form şablonu ve değerlendirme süreci her üniversitenin **BAP yönergesinde** ve BAP koordinasyon biriminin duyurularında yer alır. Başvurudan önce:

- Üniversitenizin BAP yönergesini baştan sona okuyun.
- Başvuru sistemindeki güncel form şablonunu indirin.
- Proje türünüze özgü koşulları (yürütücü kim olabilir, tez projesinde danışmanın rolü, süre) not edin.
- Gerekirse BAP birimine soru sorun; belirsiz bir koşul yüzünden başvurunun iade edilmesi zaman kaybettirir.

## Yaygın BAP proje türleri

Adlar üniversiteye göre değişse de çoğu üniversitede şu türlere benzer projeler bulunur:

| Proje türü | Kimler için | Tipik amaç |
| --- | --- | --- |
| Lisansüstü tez projesi | Yüksek lisans ve doktora öğrencileri (danışman yürütücü) | Tezin veri toplama ve analiz giderleri |
| Araştırma projesi | Öğretim elemanları | Bağımsız bir araştırma sorusunun incelenmesi |
| Başlangıç / genç araştırmacı projesi | Yeni doktorasını tamamlamış araştırmacılar | İlk bağımsız projenin desteklenmesi |
| Altyapı projesi | Araştırma grupları | Cihaz ve laboratuvar altyapısı |
| Dış kaynaklı projelere katkı | TÜBİTAK vb. desteği alan projeler | Eş finansman veya ek gider |

Tez projelerinde yürütücü genellikle danışmandır, öğrenci araştırmacı olarak yer alır; bu kural yönergeye göre değişebilir.

## Önerinin bölümleri

BAP formları genellikle TÜBİTAK önerilerine benzer ama daha kısadır:

1. **Özet ve anahtar kelimeler:** Projenin amacı, yöntemi ve beklenen çıktısı tek paragrafta.
2. **Amaç ve kapsam:** Araştırma sorusu ve projenin sınırları.
3. **Literatür ve özgün değer:** Konunun önemi ve projenin farkı, kaynaklarla.
4. **Yöntem:** Desen, örneklem, veri toplama, analiz. Tez projesinde tez önerisinin yöntem bölümü burada kullanılabilir; bkz. [tez önerisi rehberi](/blog/tez-onerisi-nasil-hazirlanir).
5. **İş-zaman çizelgesi:** Aşamalar ve süreleri.
6. **Bütçe ve gerekçesi:** Her kalem ve neden gerekli olduğu.
7. **Beklenen çıktılar:** Tez, makale, bildiri.

## Bütçeyi gerekçelendirmek

BAP değerlendirmelerinde en sık sorun bütçededir. Kurallar:

- Her kalemi yöntemdeki bir işe bağlayın: “Bu kit, yöntemde anlatılan … analizi için … örnek kadar gereklidir.”
- Fiyat için güncel teklif veya katalog fiyatı ekleyin; birçok üniversite proforma fatura ister.
- Yönergede desteklenmeyen kalemleri (bazı üniversitelerde bilgisayar, mobilya, kişisel giderler gibi) bütçeye koymayın.
- Mevcut altyapıyla karşılanabilecek kalemleri tekrar istemeyin; bunun yerine mevcut altyapıyı öneride belirtin.

## Etik kurul ve izinler

İnsan katılımcı veya hayvan deneyi içeren projelerde etik kurul onayı genellikle başvurudan önce veya proje başlamadan istenir. Yönergenizde hangi aşamada istendiğini kontrol edin ve takvime yansıtın: [etik kurul rehberi](/blog/etik-kurul-basvurusu-nasil-yapilir).

## Proje sürerken ve bittikten sonra

Onaylanan projede satın alma süreçleri üniversitenin mevzuatına göre yürür ve zaman alabilir; satın almayı takvimin başına koyun. Ara rapor ve sonuç raporu istenebilir. Proje sonunda üretilen yayınlarda BAP desteğinin belirtilmesi (proje numarasıyla teşekkür) çoğu yönergede zorunludur. BAP deneyimi, daha sonra yapacağınız [TÜBİTAK 1001](/blog/tubitak-1001-arastirma-projesi-nasil-yazilir) veya [2209-A](/blog/tubitak-2209-a-basvurusu-nasil-hazirlanir) başvurularında proje yürütme yeterliğinizin göstergesidir.

## Sık yapılan hatalar

- Yönergeyi okumadan başka bir üniversitenin şablonunu kullanmak
- Tez önerisini hiç uyarlamadan BAP formuna kopyalamak
- Gerekçesiz veya şişirilmiş bütçe
- Satın alma süresini takvimde hesaba katmamak
- Proje çıktılarında BAP desteğini belirtmeyi unutmak${CALL.replace("programın resmî sayfasındaki", "üniversitenizin BAP biriminin")}
## Academiana ile BAP önerisi

Academiana’da “TÜBİTAK / BAP proje önerisi” çalışma türünü seçip programı “Üniversite BAP projesi” olarak belirlediğinizde özet, amaç, yöntem, iş-zaman çizelgesi ve bütçe gerekçesi bölümleri hazır gelir. Tez projeniz Academiana’daysa yöntem bölümünüzü öneriye uyarlamanıza yardımcı olur. Bütçe tutarı ve yönerge kuralı uydurmaz; bunları üniversitenizin yönergesinden kontrol edip girmeniz istenir.`,
    sources: [PUNCH],
  },
  {
    slug: "tubitak-2214-a-2219-yurt-disi-arastirma-bursu",
    title: "TÜBİTAK 2214-A ve 2219 Yurt Dışı Araştırma Bursu: Araştırma Planı Nasıl Yazılır?",
    seoTitle: "TÜBİTAK 2214-A ve 2219 Başvurusu: Araştırma Planı",
    description: "TÜBİTAK 2214-A (doktora sırası) ve 2219 (doktora sonrası) yurt dışı araştırma bursları: davet mektubu, araştırma planı ve ev sahibi kurum seçimi.",
    category: "Başvuru ve savunma",
    keywords: ["TÜBİTAK 2214-A", "TÜBİTAK 2219", "yurt dışı doktora sırası araştırma bursu", "doktora sonrası araştırma bursu", "davet mektubu", "araştırma planı nasıl yazılır"],
    date: "2026-11-15",
    cta: { text: "“TÜBİTAK / BAP proje önerisi” çalışma türünde “Burs başvurusu için araştırma önerisi”ni seçin; amaç, yöntem, takvim ve beklenen katkı bölümleri hazır gelsin.", href: "/kayit", label: "Araştırma planımı hazırla" },
    body: `TÜBİTAK’ın yurt dışı araştırma bursları, Türkiye’deki araştırmacıların bir süre yurt dışındaki bir kurumda araştırma yapmasını destekler. Bu yazı en çok başvurulan iki programı ele alır: **2214-A Yurt Dışı Doktora Sırası Araştırma Burs Programı** (doktora öğrencileri için) ve **2219 Yurt Dışı Doktora Sonrası Araştırma Burs Programı** (doktorasını tamamlamış araştırmacılar için). İki programda da başvurunun merkezinde, yurt dışında ne yapacağınızı anlatan bir **araştırma planı** ve ev sahibi kurumdan alınan bir **davet mektubu** bulunur.

## İki program arasındaki fark

| | 2214-A | 2219 |
| --- | --- | --- |
| Kimler için | Doktora öğrencileri | Doktorasını tamamlamış araştırmacılar |
| Amaç | Tez araştırmasının bir kısmını yurt dışında yürütmek | Bağımsız bir araştırmayı yurt dışında yürütmek |
| Araştırma planının odağı | Tezle bağlantı ve tezin hangi kısmının yurt dışında yapılacağı | Araştırmacının kendi projesi ve kariyerine katkısı |
| Kilit belge | Danışman onayı ve ev sahibinin daveti | Ev sahibinin daveti |

Burs süresi, aylık tutarlar, yabancı dil belgesi gibi koşullar çağrıda belirtilir ve değişebilir.

## Ev sahibi kurum ve danışman seçimi

Başvurunun gücü büyük ölçüde doğru ev sahibine bağlıdır:

1. **Uyum:** Araştırma sorunuzla doğrudan ilgili yayınları olan bir araştırmacı veya grup seçin. Değerlendiriciler “Neden bu kurum?” sorusunun cevabını arar.
2. **Katma değer:** Ev sahibinin size Türkiye’de erişemeyeceğiniz bir yöntem, veri, cihaz veya uzmanlık sunduğunu gösterin.
3. **İletişim:** İlk e-postanızda kısa bir tanıtım, araştırma fikrinizin bir paragraflık özeti, neden onlarla çalışmak istediğiniz ve özgeçmişiniz bulunsun. Toplu ve kişiselleştirilmemiş e-postalar genellikle cevapsız kalır.
4. **Zamanlama:** Davet mektubu almak haftalar sürebilir; iletişime çağrıdan aylar önce başlayın.

## Davet mektubunda olması gerekenler

İyi bir davet mektubu yalnızca “kabul ediyoruz” demez. Şunları içermesi başvurunuzu güçlendirir:

- Araştırmanın konusu ve ev sahibinin araştırmaya katkısı
- Araştırma süresi ve tarihleri
- Sağlanacak olanaklar (ofis, laboratuvar, veri, kütüphane)
- Ev sahibi araştırmacının imzası ve kurum bilgileri

Mektubu ev sahibinizden isterken bu maddeleri içeren bir taslak paylaşmak işini kolaylaştırır; mektubun içeriği ev sahibinin onayladığı gerçek bilgileri yansıtmalıdır.

## Araştırma planının yapısı

1. **Amaç ve önem:** Araştırma sorusu ve alana katkısı.
2. **Literatür ve boşluk:** Kısa, kaynaklı ve güncel. Boşluğu göstermek için [literatür matrisi rehberimize](/blog/literatur-matrisi-nasil-hazirlanir) bakın.
3. **Yöntem:** Yurt dışında hangi verinin, yöntemin veya cihazın kullanılacağı. 2214-A’da tezin bu kısmının neden yurt dışında yapılması gerektiğini açıkça yazın.
4. **İş-zaman çizelgesi:** Ay ay neler yapılacağı.
5. **Beklenen çıktılar:** Makale, ortak yayın, tezin bölümü, yeni iş birlikleri.
6. **Dönüş sonrası katkı:** Edinilen bilgi ve bağlantıların Türkiye’deki çalışmalarınıza ve kurumunuza nasıl yansıyacağı.

## Değerlendiricinin aradığı tutarlılık

Araştırma planı, davet mektubu, özgeçmiş ve (2214-A’da) tez önerisi birbiriyle tutarlı olmalıdır. Planda adı geçen cihaz mektupta da geçmeli; takvim, mektuptaki tarihlerle uyuşmalı; planda vaat edilen yöntem, özgeçmişinizdeki deneyimle desteklenmelidir.

## Sık yapılan hatalar

- Ev sahibini yalnızca kurumun ününe göre seçmek
- Yurt dışında yapılacak işi somutlaştırmamak (“literatür taraması yapılacaktır” yeterli değildir)
- Çok geniş bir plan: kısa sürede bitirilebilecek odaklı bir iş paketi önerin
- Dönüş sonrası katkıyı yazmamak
- Davet mektubunu son haftaya bırakmak

Yurt dışındaki diğer burs ve destekler için [Fulbright](/blog/fulbright-bursu-basvurusu-nasil-yapilir) ve [Marie Skłodowska-Curie doktora sonrası burs](/blog/marie-curie-msca-doktora-sonrasi-burs-basvurusu) rehberlerimize bakabilirsiniz.${CALL}
## Academiana ile araştırma planı

Academiana’da “TÜBİTAK / BAP proje önerisi” çalışma türünde “Burs başvurusu için araştırma önerisi”ni seçtiğinizde amaç, literatür, yöntem, takvim ve beklenen katkı bölümleri hazır gelir. 2214-A için tez projeniz Academiana’daysa yöntem ve literatürünüzü plana uyarlamanıza yardımcı olur. Ev sahibi kurum, tarih ve burs koşulu uydurmaz; bunları sizin girmeniz istenir.`,
    sources: [TUBITAK, PUNCH],
  },
  {
    slug: "nsf-grfp-basvurusu-nasil-yazilir",
    title: "NSF GRFP Başvurusu: Personal Statement ve Research Plan Nasıl Yazılır?",
    seoTitle: "NSF GRFP Başvurusu: Kişisel Beyan ve Araştırma Planı",
    description: "ABD’nin NSF Graduate Research Fellowship Program (GRFP) başvurusu: uygunluk, Intellectual Merit ve Broader Impacts ölçütleri, iki beyan metni ve referanslar.",
    category: "Başvuru ve savunma",
    keywords: ["NSF GRFP", "NSF GRFP personal statement", "NSF research plan", "intellectual merit broader impacts", "ABD lisansüstü bursu", "graduate research fellowship"],
    date: "2026-11-15",
    cta: { text: "“TÜBİTAK / BAP proje önerisi” çalışma türünde “Diğer kurum / fon”u seçin; araştırma planınızı amaç, yöntem ve etki bölümleriyle yazın.", href: "/kayit", label: "Araştırma planımı yaz" },
    body: `NSF GRFP (National Science Foundation Graduate Research Fellowship Program), ABD Ulusal Bilim Vakfı’nın bilim, teknoloji, mühendislik ve matematik (STEM) alanları ile STEM eğitimi ve bazı sosyal bilim alanlarında lisansüstü öğrencileri desteklediği köklü bir burs programıdır. ABD’deki en bilinen lisansüstü araştırma burslarından biri olduğu için başvuru metinleri pek çok programın beyan yazımında örnek alınır. Bu rehber, başvurunun yapısını ve iki temel metnin nasıl yazılacağını anlatır.

## Önce uygunluğu kontrol edin

GRFP’ye yalnızca belirli koşulları taşıyan adaylar başvurabilir. Program duyurusuna göre başvuranların **ABD vatandaşı, ABD uyruklu veya ABD’de daimi oturum sahibi** olması gerekir; ayrıca lisansüstü eğitimin hangi aşamasında başvurulabileceği ve hangi alanların desteklendiği sınırlandırılmıştır. Türkiye vatandaşı olup ABD’de daimi oturumu olmayan öğrenciler bu programa başvuramaz; onlar için [Fulbright](/blog/fulbright-bursu-basvurusu-nasil-yapilir) gibi uluslararası programlar daha uygundur. Koşulların güncel hâlini mutlaka programın resmî duyurusundan (program solicitation) okuyun.

Yine de GRFP’nin değerlendirme mantığı, ABD’de lisansüstü programlara ve laboratuvarlara başvururken yazacağınız beyan metinleri için de iyi bir modeldir.

## İki değerlendirme ölçütü

NSF, tüm başvuruları iki ana ölçütle değerlendirir:

- **Intellectual Merit (Bilimsel değer):** Önerilen araştırmanın bilgi birikimine katkısı, adayın araştırma potansiyeli ve hazırlığı.
- **Broader Impacts (Geniş etki):** Araştırmanın ve adayın topluma katkısı: eğitim, bilimin yaygınlaştırılması, bilimde katılımın genişletilmesi, toplumsal fayda gibi.

İki ölçüt **eşit önemdedir**. En sık yapılan hata, geniş etkiyi metnin sonuna eklenmiş bir paragrafa indirgemektir. Değerlendiriciler her iki ölçütün de somut kanıtlarla, metnin bütününde desteklendiğini görmek ister.

## Personal statement (kişisel beyan)

Kişisel beyan bir hayat öyküsü değildir; araştırmacı olarak hazırlığınızı ve geniş etki potansiyelinizi kanıtlarla gösteren bir metindir:

1. **Araştırma deneyimi:** Hangi projelerde ne yaptınız, hangi sorunla karşılaştınız ve nasıl çözdünüz? Sonuç (poster, makale, bildiri) neydi?
2. **Geniş etki geçmişi:** Mentorluk, öğretim, bilim iletişimi, topluluk çalışmaları. Ne yaptığınızı ve sonucunu sayılarla yazın (“… öğrenciye haftalık çalışma grubu düzenledim”).
3. **Gelecek hedefleri:** Lisansüstü eğitim ve kariyer hedefleriniz ve bursun bu hedeflere nasıl katkı sağlayacağı.

Her paragrafta iki ölçütten birine veya ikisine bağlantı kurun. Değerlendiricilerin aradığı kelimeleri (Intellectual Merit, Broader Impacts) alt başlık olarak kullanmak, metnin taranmasını kolaylaştırır.

## Graduate research plan (araştırma planı)

Araştırma planı, lisansüstü eğitiminizde yapmak istediğiniz araştırmayı anlatır. Bağlayıcı bir proje değildir ama uygulanabilir ve özgün olmalıdır:

- **Giriş ve önem:** Problem ve neden önemli olduğu, kaynaklarla.
- **Araştırma sorusu ve hipotez:** Somut ve sınanabilir.
- **Yöntem:** Hangi deney, veri veya modelle sınanacağı; olası sorunlar ve alternatif yaklaşımlar.
- **Intellectual Merit:** Bu araştırma bilgi birikimine ne katar?
- **Broader Impacts:** Araştırmanın sonuçları topluma nasıl ulaşır, siz bu süreçte ne yapacaksınız?

Araştırma sorusu ve hipotez yazımı için [araştırma sorusu ve hipotez rehberimize](/blog/arastirma-sorusu-ve-hipotez-nasil-yazilir) bakın. Kaynakları gerçek ve doğrulanmış olmalıdır; değerlendiriciler alanın uzmanlarıdır.

## Referans mektupları

Başvuru, adayı tanıyan kişilerden alınan referans mektuplarıyla tamamlanır. Mektup yazacak kişilere erkenden ulaşın; özgeçmişinizi, beyan taslaklarınızı ve özellikle vurgulamalarını istediğiniz araştırma ve geniş etki deneyimlerini kısa bir notla iletin.

## Sık yapılan hatalar

- Uygunluk koşullarını kontrol etmeden hazırlanmak
- Broader Impacts’i genel ifadelerle geçiştirmek (“bilimi topluma anlatacağım”)
- Kişisel beyanı duygusal bir hikâyeye dönüştürüp araştırma kanıtı vermemek
- Araştırma planında yöntemi belirsiz bırakmak
- Sayfa sınırı ve biçim kurallarına uymamak${CALL}
## Academiana ile araştırma planı

Academiana’da “TÜBİTAK / BAP proje önerisi” çalışma türünde programı “Diğer kurum / fon” olarak seçip araştırma planınızı yazabilirsiniz; arayüzü İngilizce de kullanabilirsiniz. Asistan yalnızca projenize eklediğiniz gerçek kaynaklara atıf yapar, kaynak gereken yerleri işaretler; program kuralı, sayfa sınırı veya tarih uydurmaz.`,
    sources: [
      { text: "U.S. National Science Foundation. NSF Graduate Research Fellowship Program (GRFP).", url: "https://www.nsfgrfp.org/" },
      { text: "U.S. National Science Foundation. Broader impacts.", url: "https://www.nsf.gov/" },
    ],
  },
  {
    slug: "marie-curie-msca-doktora-sonrasi-burs-basvurusu",
    title: "Marie Skłodowska-Curie (MSCA) Doktora Sonrası Burs Başvurusu Nasıl Yazılır?",
    seoTitle: "MSCA Doktora Sonrası Burs Başvurusu Nasıl Yazılır?",
    description: "Horizon Europe MSCA Postdoctoral Fellowships başvurusu: hareketlilik kuralı, ev sahibi ve danışman seçimi, Excellence, Impact ve Implementation bölümleri.",
    category: "Başvuru ve savunma",
    keywords: ["MSCA postdoctoral fellowship", "Marie Curie bursu", "MSCA PF başvurusu", "Horizon Europe burs", "doktora sonrası yurt dışı burs", "Avrupa araştırma bursu"],
    date: "2026-11-15",
    cta: { text: "“TÜBİTAK / BAP proje önerisi” çalışma türünde “Diğer kurum / fon”u seçin; Excellence, Impact ve Implementation bölümlerini başlıklarla kurun.", href: "/kayit", label: "Başvurumu hazırla" },
    body: `Marie Skłodowska-Curie Eylemleri (MSCA), Avrupa Birliği’nin araştırma ve yenilik çerçeve programı **Horizon Europe** kapsamında araştırmacıların hareketliliğini ve kariyer gelişimini destekleyen programlardır. **MSCA Postdoctoral Fellowships (PF)**, doktorasını tamamlamış araştırmacıların başka bir ülkedeki bir ev sahibi kurumda kendi projelerini yürütmesini destekler ve Avrupa’daki en rekabetçi doktora sonrası burslardan biridir. Türkiye Horizon Europe’a ilişkili ülke olarak katıldığı için Türkiye’deki araştırmacılar ve kurumlar bu programlarda yer alabilir; güncel durumu programın resmî sayfasından kontrol edin.

## Başvurmadan önce: uygunluk ve hareketlilik

İki temel koşula dikkat edin:

- **Deneyim:** Başvuru tarihinde doktora derecesine sahip olmak ve doktoradan sonra belirli bir süreyi aşmamış olmak gerekir. Süre ve istisnalar (ör. ebeveyn izni) her çağrıda tanımlanır.
- **Hareketlilik kuralı:** Araştırmacının, başvuru tarihinden önceki belirli bir dönemde ev sahibi kurumun bulunduğu ülkede belirli bir süreden fazla yaşamamış veya çalışmamış olması gerekir. Bu kural nedeniyle bulunduğunuz ülkedeki bir kuruma başvuramazsınız.

Burs türleri (Avrupa bursu, küresel burs), süreler ve koşulların ayrıntısı çağrı belgesinde ve başvuru kılavuzunda yer alır.

## Ev sahibi ve danışman (supervisor) seçimi

Başvuru, araştırmacı ile ev sahibi kurumdaki danışman tarafından birlikte hazırlanır. İyi bir eşleşme:

- Araştırma konunuzla güçlü bağı olan ama sizinle aynı uzmanlığa sahip olmayan bir danışman: değerlendiriciler **iki yönlü bilgi aktarımı** arar. Siz ev sahibine ne getireceksiniz, ondan ne öğreneceksiniz?
- Danışmanın projeyi destekleyecek yayın, proje ve mentorluk geçmişi
- Kurumun sağlayacağı altyapı ve eğitim olanakları

Danışmanlara başvurudan aylar önce kısa ve kişiselleştirilmiş bir e-postayla ulaşın: projenizin bir paragraflık özeti, neden onlarla çalışmak istediğiniz ve özgeçmişiniz.

## Başvurunun yapısı: üç değerlendirme ölçütü

Önerinin teknik kısmı, değerlendirme ölçütleriyle aynı üç başlıkla yazılır:

| Bölüm | Değerlendiricinin aradığı |
| --- | --- |
| **Excellence (Mükemmeliyet)** | Araştırmanın özgünlüğü ve güncel bilginin ötesine geçmesi, yöntemin sağlamlığı, iki yönlü bilgi aktarımı, danışmanlık ve eğitimin niteliği |
| **Impact (Etki)** | Araştırmacının kariyerine katkı, sonuçların yaygınlaştırılması ve iletişimi, bilimsel ve toplumsal etkinin büyüklüğü |
| **Implementation (Uygulama)** | İş planı ve iş paketleri, riskler ve önlemler, ev sahibi kurumun uygunluğu ve olanakları |

Değerlendiriciler puanlamayı bu başlıklara göre yaptığı için kılavuzdaki alt başlıkları atlamadan ve aynı sırayla kullanın.

### Excellence

Araştırma hedeflerini, alandaki boşluğu ve yaklaşımınızın neden yenilikçi olduğunu yazın. Yöntemde disiplinlerarası boyut, açık bilim uygulamaları (veri yönetimi, açık erişim) ve araştırmada cinsiyet boyutu gibi kılavuzun sorduğu başlıkları ele alın. Literatür boşluğunu kaynaklarla gösterin: [literatür matrisi rehberi](/blog/literatur-matrisi-nasil-hazirlanir).

### Impact

Bursun kariyerinize katkısını somut yazın: hangi yeni beceriyi kazanacaksınız, burs sonrası hedefiniz ne? Yaygınlaştırma (bilimsel yayın, konferans) ile iletişimi (genel kamuoyuna yönelik faaliyetler) ayrı ayrı planlayın ve ölçülebilir hedefler verin.

### Implementation

İş paketlerini, kilometre taşlarını ve çıktıları bir Gantt şemasıyla gösterin. Riskleri olasılık ve etkileriyle birlikte yazıp her biri için önlem belirtin. Ev sahibi kurumun altyapısını ve size sağlayacağı desteği açıklayın.

## Sık yapılan hatalar

- Hareketlilik kuralını kontrol etmeden ev sahibi seçmek
- Excellence bölümünü yalnızca literatür özetine dönüştürmek
- Bilgi aktarımını tek yönlü anlatmak (yalnızca “öğreneceğim”)
- Impact bölümünde genel ifadeler kullanmak
- Kılavuzdaki başlık yapısını ve sayfa sınırını değiştirmek

Reddedilen başvurular değerlendirme raporuyla birlikte döner; rapordaki eleştirileri ele alıp sonraki çağrıya güçlendirilmiş bir öneriyle başvurmak yaygındır. Yurt dışı araştırma için TÜBİTAK seçenekleri [2214-A ve 2219 rehberimizde](/blog/tubitak-2214-a-2219-yurt-disi-arastirma-bursu).${CALL}
## Academiana ile MSCA önerisi

Academiana’da “TÜBİTAK / BAP proje önerisi” çalışma türünde programı “Diğer kurum / fon” olarak seçip Excellence, Impact ve Implementation başlıklarıyla önerinizi kurabilirsiniz; arayüzü İngilizce de kullanabilirsiniz. Asistan iş paketi ve risk tablolarını taslaklar, yalnızca projenize eklediğiniz gerçek kaynaklara atıf yapar; uygunluk kuralı, tutar veya tarih uydurmaz.`,
    sources: [
      { text: "European Commission. Marie Skłodowska-Curie Actions: Postdoctoral Fellowships.", url: "https://marie-sklodowska-curie-actions.ec.europa.eu/" },
      { text: "European Commission. Funding & tenders portal: Horizon Europe calls and guides for applicants.", url: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/" },
    ],
  },
  {
    slug: "fulbright-bursu-basvurusu-nasil-yapilir",
    title: "Fulbright Bursu Başvurusu: Kişisel Beyan ve Araştırma Amacı Nasıl Yazılır?",
    seoTitle: "Fulbright Bursu Başvurusu ve Niyet Mektubu Rehberi",
    description: "Fulbright Türkiye lisansüstü ve araştırma bursları: program türleri, kişisel beyan ve çalışma/araştırma amacı metinleri, referanslar ve mülakata hazırlık.",
    category: "Başvuru ve savunma",
    keywords: ["Fulbright bursu", "Fulbright başvurusu", "Fulbright niyet mektubu", "Fulbright personal statement", "ABD yüksek lisans bursu", "Fulbright mülakat"],
    date: "2026-11-15",
    cta: { text: "“TÜBİTAK / BAP proje önerisi” çalışma türünde “Burs başvurusu için araştırma önerisi”ni seçin; çalışma/araştırma amacı metninizi bölüm bölüm yazın.", href: "/kayit", label: "Başvuru metnimi yaz" },
    body: `Fulbright, ABD ile diğer ülkeler arasında eğitim değişimini destekleyen uluslararası bir burs programıdır. Türkiye’de program, **Türk-Amerikan Eğitim Komisyonu (Fulbright Türkiye)** tarafından yürütülür ve yüksek lisans, doktora araştırması, doktora sonrası araştırma ve öğretim gibi farklı burs türleri sunar. Başvurunun en belirleyici parçaları, adayın kendini ve hedeflerini anlattığı **kişisel beyan** ile ABD’de ne çalışacağını anlattığı **çalışma veya araştırma amacı** metinleridir.

## Program türleri

Fulbright Türkiye’nin burs türleri dönemden döneme değişebilir; genel olarak şu gruplar bulunur:

| Tür | Kimler için | Başvuru metninin odağı |
| --- | --- | --- |
| Yüksek lisans / doktora eğitimi | ABD’de lisansüstü program yapmak isteyenler | Neden bu alan, neden ABD, dönüşte katkı |
| Doktora sırası araştırma | Türkiye’de doktorasını sürdürenler | Tezin ABD’de yürütülecek kısmı |
| Doktora sonrası ve kıdemli araştırma | Doktoralı araştırmacılar ve akademisyenler | Araştırma projesi ve ev sahibi kurum |

Hangi türlerin açık olduğu, uygunluk koşulları (vatandaşlık, dil belgesi, mezuniyet durumu) ve takvim her dönem Fulbright Türkiye’nin resmî sayfasında duyurulur.

## Kişisel beyan (personal statement)

Kişisel beyan, kim olduğunuzu ve sizi bu başvuruya getiren yolu anlatır; ama bir özgeçmiş tekrarı değildir:

1. **Açılış:** Sizi alana yönelten somut bir deneyim veya soru. Klişe girişlerden (“Çocukluğumdan beri…”) kaçının.
2. **Gelişim:** Akademik ve mesleki deneyimlerinizden, hedefinize doğrudan bağlanan iki üç örnek. Her örnekte ne yaptığınızı ve ne öğrendiğinizi yazın.
3. **Değerler ve topluluk:** Fulbright’ın kültürlerarası değişim amacına uygun olarak, farklı topluluklarla çalışma deneyimleriniz ve katkınız.
4. **Gelecek:** Bursun sizi nereye götüreceği ve Türkiye’ye dönüşte nasıl bir katkı sunacağınız.

## Çalışma veya araştırma amacı (study/research objective)

Bu metin, ABD’de tam olarak ne yapacağınızı anlatır:

- **Yüksek lisans adayları için:** Hangi alanda, hangi tür programlarda okumak istediğiniz; bu programların sizin hedefinize neden uygun olduğu; derslerden, laboratuvarlardan veya öğretim üyelerinden somut örnekler.
- **Araştırma adayları için:** Araştırma sorusu, yöntem, ev sahibi kurum ve danışmanla ilişki, takvim ve beklenen çıktılar. Yapı olarak bir araştırma önerisine benzer: [tez önerisi rehberi](/blog/tez-onerisi-nasil-hazirlanir).

Her iki metinde de “Neden ABD?” sorusuna somut cevap verin: Türkiye’de bulunmayan bir program, yöntem, veri veya uzmanlık.

## Kişisel beyan ile amaç metni arasındaki denge

İki metin birbirini tekrar etmemeli, tamamlamalıdır. Kişisel beyan “neden siz?” sorusuna, amaç metni “ne ve nasıl?” sorusuna cevap verir. İkisini birlikte okuyan değerlendirici, geçmişinizden hedefinize uzanan tutarlı bir yol görmelidir.

## Referans mektupları

Referans mektuplarını sizi akademik veya mesleki olarak yakından tanıyan kişilerden isteyin. Mektup yazacak kişilere başvuru metinlerinizin taslağını ve vurgulamalarını istediğiniz özellikleri iletin; böylece mektuplar başvurunuzla aynı hikâyeyi destekler.

## Mülakata hazırlık

Ön elemeyi geçen adaylar mülakata çağrılabilir. Hazırlanırken:

- Başvuru metinlerinizi yeniden okuyun; mülakatta onlardan sorular gelir.
- “Neden bu alan, neden ABD, dönüşte ne yapacaksınız?” sorularına kısa ve somut cevaplar hazırlayın.
- Kendi alanınızla ilgili güncel bir gelişme hakkında konuşabilecek durumda olun.
- Kültürlerarası deneyim ve katkı sorularına örneklerle cevap verin.

## Sık yapılan hatalar

- Aynı metni hem kişisel beyan hem amaç metni olarak kullanmak
- “Neden ABD?” sorusuna genel cevaplar (“dünyanın en iyi üniversiteleri”)
- Dönüşte katkıyı belirsiz bırakmak
- İngilizce metni Türkçeden kelime kelime çevirmek; akademik İngilizce için [özet ve abstract rehberimizdeki](/blog/ozet-ve-abstract-nasil-yazilir) çeviri uyarılarına bakın
- Kelime veya karakter sınırını aşmak

ABD’deki NSF bursunun değerlendirme mantığı için [NSF GRFP rehberimize](/blog/nsf-grfp-basvurusu-nasil-yazilir), TÜBİTAK’ın yurt dışı araştırma bursları için [2214-A ve 2219 rehberimize](/blog/tubitak-2214-a-2219-yurt-disi-arastirma-bursu) bakabilirsiniz.${CALL}
## Academiana ile başvuru metni

Academiana’da “TÜBİTAK / BAP proje önerisi” çalışma türünde “Burs başvurusu için araştırma önerisi”ni seçerek çalışma/araştırma amacı metninizi bölüm bölüm yazabilir, arayüzü İngilizce de kullanabilirsiniz. Asistan metninizi kısaltmanıza ve netleştirmenize yardım eder; deneyim, başarı, kurum veya kaynak uydurmaz.`,
    sources: [
      { text: "Türk-Amerikan Eğitim Komisyonu (Fulbright Türkiye). Burs programları.", url: "https://www.fulbright.org.tr/" },
      { text: "U.S. Department of State. Fulbright Program.", url: "https://fulbrightprogram.org/" },
    ],
  },
];
