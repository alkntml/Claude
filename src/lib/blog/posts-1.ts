import type { BlogPost } from "./types";

export const POSTS_1: BlogPost[] = [
  {
    slug: "tez-nasil-yazilir",
    title: "Tez Nasıl Yazılır? Konu Seçiminden Savunmaya Adım Adım Rehber",
    description: "Yüksek lisans ve doktora tezi yazarken izlemeniz gereken adımlar: konu, literatür, yöntem, bulgular, tartışma, biçim ve savunma. Pratik bir yol haritası.",
    category: "Tez yazımı",
    keywords: ["tez nasıl yazılır", "yüksek lisans tezi yazma", "tez yazım aşamaları", "tez bölümleri"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Tez türünüze göre hazır yol haritası, bölüm bölüm rehberlik ve gerçek kaynaklarla çalışan bir asistanla başlayın.", href: "/kayit", label: "Tezime başla" },
    body: `Tez yazmak çoğu öğrenciye ilk bakışta dağ gibi görünür. Oysa tez, birbirine bağlı ve her biri tek başına yönetilebilir küçük adımlardan oluşur. Bu rehberde bir tezi baştan sona hangi sırayla yazmanız gerektiğini ve her aşamada nelere dikkat etmeniz gerektiğini anlatıyoruz.

## 1. Konuyu daraltın

İyi bir tez konusu **tek cümleyle** ifade edilebilir: neyi, kimde ve hangi bağlamda incelediğinizi söyler. "Eğitimde teknoloji" bir alan; "Ortaokul öğretmenlerinin dijital ölçme araçlarını kullanma düzeyi ile mesleki kıdem arasındaki ilişki" ise bir tez konusudur. Konuyu seçerken veri toplayıp toplayamayacağınızı, süreyi ve etik izin gerekip gerekmediğini de düşünün.

## 2. Ön literatür taraması yapın

Konunun ne kadar çalışıldığını görmeden araştırma sorusu yazmayın. Son beş-on yılın temel çalışmalarını bulun, hangi yöntemlerin kullanıldığını ve nerede boşluk kaldığını not edin. Boşluk, tezinizin "neden gerekli" sorusunun cevabıdır.

## 3. Araştırma sorularını ve yöntemi belirleyin

Araştırma soruları tezin omurgasıdır: her bölüm bu sorulara hizmet eder. Sorularınız ilişki arıyorsa nicel, deneyim ve anlam arıyorsa nitel, ikisini birden istiyorsa karma yöntem uygun olabilir. Yöntemi seçerken danışmanınızla mutlaka görüşün.

## 4. Bölümleri doğru sırayla yazın

Tezler genellikle şu bölümlerden oluşur:

- **Giriş:** problem, amaç, önem, araştırma soruları, sınırlılıklar ve tanımlar
- **Kuramsal çerçeve ve literatür:** kavramlar ve ilgili çalışmalar
- **Yöntem:** desen, örneklem, veri toplama araçları, analiz
- **Bulgular:** analiz sonuçları, yorum katmadan
- **Tartışma, sonuç ve öneriler:** bulguların literatürle karşılaştırılması
- **Özet / Abstract:** en son yazılır

Özeti en başta yazmaya çalışmak sık yapılan bir hatadır. Özet bütün çalışmayı özetler; bu yüzden diğer bölümler bittikten sonra yazılmalıdır.

## 5. Her iddiayı kaynakla destekleyin

Bilimsel bir iddia ya sizin verinize ya da güvenilir bir kaynağa dayanmalıdır. Kaynakları okurken hangi bilgiyi hangi sayfadan aldığınızı not edin; doğrudan alıntılarda sayfa numarası zorunludur.

## 6. Biçim kurallarını baştan uygulayın

Her enstitünün bir tez yazım kılavuzu vardır: kenar boşlukları, yazı tipi, satır aralığı, başlık numaralandırması, kapak ve onay sayfası. Bu kuralları sona bırakmak, teslimden önce günlerinizi alabilir.

## 7. Kontrol edin ve savunmaya hazırlanın

Teslimden önce atıf–kaynakça tutarlılığını, tablo ve şekil numaralarını, yazım ve noktalamayı kontrol edin. Ardından jürinin sorabileceği sorulara cevap hazırlayın.


## Tez türleri ve beklentiler

Tezler düzeye ve yönteme göre farklı beklentiler taşır:

- **Yüksek lisans tezi:** Bir araştırma sorusunu bilimsel yöntemle cevaplayabildiğinizi gösterir. Özgün katkı beklenir ama bu katkı yeni bir örneklem, bağlam veya yöntem uygulaması olabilir.
- **Doktora tezi:** Alana kalıcı ve özgün bir katkı bekler. Kuramsal tartışma daha derin, yöntem daha sağlam, literatür daha kapsamlı olmalıdır.
- **Nicel, nitel ve karma tezler:** Bölüm adları benzer olsa da içerik değişir. Nicel tezde örneklem ve istatistik, nitel tezde çalışma grubu, veri toplama süreci ve inandırıcılık (geçerlik–güvenirlik) ön plandadır.

Tez yazım kılavuzunuz bölüm adlarını ve sırasını belirleyebilir; her zaman kılavuzu esas alın.

## Tezin omurgası: tutarlılık zinciri

Jürilerin en çok dikkat ettiği konu, bölümler arasındaki tutarlılıktır. Şu zincir baştan sona kopmamalıdır:

1. **Problem:** Hangi boşluğu veya sorunu ele alıyorsunuz?
2. **Amaç:** Bu sorunla ilgili neyi ortaya koymak istiyorsunuz?
3. **Araştırma soruları veya hipotezler:** Amacı sınanabilir parçalara bölüyor mu?
4. **Yöntem:** Her soru için uygun desen, örneklem ve analiz var mı?
5. **Bulgular:** Her soru için bir sonuç raporlanmış mı?
6. **Tartışma ve sonuç:** Her bulgu literatürle karşılaştırılmış ve amaca geri dönülmüş mü?

Örneğin üç araştırma sorunuz varsa bulgular bölümünde de üç başlık, tartışmada da üç tartışma ekseni görmek beklenir. Sorulardan birinin yöntemi yoksa ya da bulgularda bir sorunun cevabı unutulmuşsa bu, savunmada ilk sorulacak konudur.

## Gerçekçi bir zaman planı

Bir yüksek lisans tezinin yazım süreci kabaca şu aşamalara ayrılır: konu ve öneri, literatür, yöntem ve etik kurul, veri toplama, analiz, yazım ve düzeltmeler. Veri toplama ve etik kurul süreleri genellikle en çok sapan kalemlerdir; takvimi teslim tarihinden geriye doğru planlayın. Ayrıntılı bir planlama yöntemi için [tez yazım takvimi rehberimize](/blog/tez-yazim-takvimi-zaman-yonetimi) bakabilirsiniz.

## Danışmanla verimli çalışmak

- Her görüşmeden önce kısa bir gündem ve son görüşmeden beri yaptıklarınızı gönderin.
- Taslakları bölüm bölüm paylaşın; tezin tamamını tek seferde göndermek geri bildirimi geciktirir.
- Aldığınız geri bildirimleri bir listede tutun ve hangisini nasıl uyguladığınızı not edin.
- Yöntemle ilgili kararları (örneklem, ölçek, analiz) veri toplamaya başlamadan danışmanınızla onaylayın.

## Sık yapılan hatalar

- Konuyu çok geniş tutup her şeyi kapsamaya çalışmak
- Literatürü kaynak kaynak özetlemek, temalara göre sentezlememek: bunun için [literatür taraması rehberimize](/blog/literatur-taramasi-nasil-yapilir) bakın
- Araştırma soruları ile analizleri eşleştirmemek
- Bulgular bölümünde yorum yapmak, tartışmada yeni bulgu vermek
- Kaynakçayı ve biçim kurallarını teslimden önceki son haftaya bırakmak
- Özeti en başta yazıp sonra güncellemeyi unutmak

## Teslimden önce kontrol listesi

- Her araştırma sorusunun yöntemde bir analizi, bulgularda bir cevabı var mı?
- Metindeki her atıf kaynakçada, kaynakçadaki her kaynak metinde var mı? Ayrıntı için [kaynakça rehberimize](/blog/kaynakca-nasil-hazirlanir) bakın.
- Tablo ve şekil numaraları sıralı ve metinde anılıyor mu?
- Özet, tezin son hâlini mi anlatıyor?
- Kapak, onay, beyan sayfaları enstitü kılavuzuna uygun mu?
- Sınırlılıklar ve öneriler bulgularla tutarlı mı?

## Academiana bu süreçte nasıl yardımcı olur?

Academiana’da çalışma türünüzü seçtiğinizde yukarıdaki adımlar hazır bir yol haritası olarak gelir. Önce konu ve başlık seçimi yapılır, sonra bölümler sırayla ilerler; özet en sona bırakılır. Asistan gerçek veri tabanlarından kaynak bulur, her bölüm tamamlandığında amacına uygun olup olmadığını kontrol eder ve tezinizi enstitü biçimine yakın bir Word dosyası olarak indirmenizi sağlar. Yazar her zaman sizsiniz; sistem yol gösterir.`,
  },
  {
    slug: "tez-konusu-nasil-secilir",
    title: "Tez Konusu Nasıl Seçilir? İyi Bir Konunun 6 Özelliği",
    description: "Yüksek lisans ve doktora için tez konusu seçerken nelere bakmalısınız? Özgünlük, uygulanabilirlik, veri erişimi ve danışman uyumu üzerine pratik öneriler.",
    category: "Tez yazımı",
    keywords: ["tez konusu nasıl seçilir", "tez konusu önerileri", "yüksek lisans tez konusu", "araştırma konusu belirleme"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Alanınızdaki yayın eğilimlerini, yükselen alt konuları ve Türkiye’de ne kadar çalışıldığını gerçek verilerle görün.", href: "/konu-bul", label: "Konu bulma aracını dene" },
    body: `Tez sürecinin en kritik kararı konudur. Yanlış seçilmiş bir konu aylar sonra veri bulunamadığı ya da kapsam büyüdüğü için yeniden başlamanıza yol açabilir. İyi bir konu ise yazım sürecini kendiliğinden kolaylaştırır.

## İyi bir tez konusunun 6 özelliği

1. **İlgi çekici olmalı.** Bir yılı aşkın süre bu konuyla yaşayacaksınız. Sizi meraklandırmayan bir konu motivasyonunuzu hızla tüketir.
2. **Yeterince dar olmalı.** "Sosyal medya ve gençler" bir alan; "Üniversite öğrencilerinde sosyal medyada karşılaştırma eğilimi ile benlik saygısı arasındaki ilişki" bir konudur.
3. **Literatürde bir boşluğa denk gelmeli.** Tamamen yeni olması gerekmez; farklı bir örneklem, bağlam veya yöntemle bilinen bir soruyu yeniden ele almak da özgün katkıdır.
4. **Uygulanabilir olmalı.** Katılımcılara, verilere, cihazlara veya arşivlere erişebilecek misiniz? Etik kurul izni gerekecek mi ve ne kadar sürer?
5. **Süreye sığmalı.** Yüksek lisans tezi için genellikle bir-iki dönemlik bir çalışma planlanır. Uzun boylamsal tasarımlar çoğu zaman doktoraya daha uygundur.
6. **Danışmanınızın alanıyla örtüşmeli.** Danışmanınızın uzmanlığına yakın bir konu, daha nitelikli geri bildirim almanızı sağlar.

## Konu bulmak için pratik yöntemler

- **Son yılların tez ve makalelerinin "öneriler" bölümlerini okuyun.** Araştırmacılar çoğu zaman yapılmasını önerdikleri çalışmaları açıkça yazar.
- **Yayın eğilimlerine bakın.** Bir alt konuda son yıllarda yayın sayısı hızla artıyorsa güncel bir tartışma var demektir. Hiç çalışılmamışsa bunun bir nedeni olabilir; veri erişimini kontrol edin.
- **Türkiye bağlamını düşünün.** Uluslararası literatürde çok çalışılmış ama Türkiye’de az incelenmiş konular, yerel katkı açısından değerlidir.
- **Bir cümle testi yapın.** Konunuzu "Bu çalışma, … ile … arasındaki ilişkiyi … örnekleminde incelemektedir." kalıbıyla yazabiliyorsanız doğru yoldasınız.

## Sık yapılan hatalar

- Konuyu çok geniş tutmak ve her şeyi kapsamaya çalışmak
- Yöntemi konudan önce seçmek ("Kesin anket yapacağım" diye konu aramak)
- Literatüre bakmadan "Bu konu hiç çalışılmamış" demek
- Veri toplama ve etik kurul sürelerini hesaba katmamak


## Konudan araştırma sorusuna: daraltma örneği

Geniş bir ilgi alanı birkaç adımda tez konusuna dönüşür:

1. **Alan:** Sosyal medya
2. **Konu:** Sosyal medya ve akademik başarı
3. **Odak:** Sosyal medya kullanımı ile akademik erteleme
4. **Örneklem ve bağlam:** Türkiye’de devlet üniversitelerinde öğrenim gören lisans öğrencileri
5. **Araştırma sorusu:** “Lisans öğrencilerinin problemli sosyal medya kullanımı akademik erteleme düzeylerini yordamakta mıdır?”

Her adımda kapsam daralır ve hangi veriyi, kimden, nasıl toplayacağınız netleşir. Araştırma sorusu ve hipotez yazımı için [araştırma sorusu ve hipotez rehberimize](/blog/arastirma-sorusu-ve-hipotez-nasil-yazilir) bakabilirsiniz.

## Konunuzu sınayacak 8 soru

Bir konuya karar vermeden önce şu sorulara dürüstçe cevap verin:

1. Konuyu tek cümleyle anlatabiliyor musunuz?
2. Son beş yılda bu konuda yayımlanmış en az birkaç çalışma bulabiliyor musunuz?
3. Bu çalışmalardan farkınız ne olacak: örneklem mi, bağlam mı, yöntem mi?
4. Veriye nasıl ulaşacaksınız ve bu gerçekçi mi?
5. Etik kurul onayı gerekecek mi? Gerekiyorsa süresini planladınız mı?
6. Kullanacağınız ölçme aracı Türkçeye uyarlanmış mı, geçerlik ve güvenirlik çalışması var mı?
7. Tezi teslim süresi içinde bitirebilir misiniz?
8. Danışmanınız bu konuda size yol gösterebilir mi?

Cevaplarınızdan ikisi veya üçü belirsizse, konuyu daraltmak veya veri kaynağını değiştirmek gerekebilir.

## Nicel mi, nitel mi?

Konu seçimi ile yöntem birbirini etkiler ama yöntem konudan önce gelmemelidir:

- **Nicel çalışma** değişkenler arasındaki ilişkiyi, farkı veya etkiyi ölçmek istediğinizde uygundur. Yeterli sayıda katılımcıya ve geçerli ölçeklere ihtiyaç duyar; örneklem büyüklüğünü önceden hesaplamak için [örneklem rehberimize](/blog/orneklem-buyuklugu-nasil-hesaplanir) bakın.
- **Nitel çalışma** bir deneyimin nasıl yaşandığını, anlamını veya sürecini derinlemesine anlamak istediğinizde uygundur. Daha az katılımcıyla ama daha uzun görüşmelerle çalışılır; ayrıntılar [nitel araştırma rehberimizde](/blog/nitel-arastirma-gorusme-ve-tematik-analiz).
- **Karma yöntem** her iki tür soruyu birlikte sorduğunuzda kullanılır; iş yükü daha fazladır.

## Konu önerisini danışmana sunmak

Danışmanınızla görüşmeye boş gitmeyin. Kısa bir öneri hazırlayın:

- Önerdiğiniz başlık (geçici olabilir)
- Problemi anlatan bir paragraf ve 3–5 temel kaynak
- Araştırma sorusu ve olası yöntem
- Veri toplama planı ve olası güçlükler

Bu bir sayfalık not, görüşmeyi “ne çalışsam?” sorusundan “bunu nasıl çalışırım?” sorusuna taşır. Komiteye sunulacak tam öneri için [tez önerisi rehberimize](/blog/tez-onerisi-nasil-hazirlanir) bakın.

## Academiana ile konu bulma

Academiana’nın **Konu bulma** aracı, yazdığınız alanla ilgili OpenAlex’teki gerçek yayın kayıtlarını analiz eder: yıllara göre yayın sayısı, son üç yılda yükselen alt konular, Türkiye’den yayınların oranı ve en çok atıf alan çalışmalar. Yapay zekâ yalnızca bu verilere dayanarak size tez konusu önerileri sunar; beğendiğiniz öneriyle tek tıkla tez çalışması başlatabilirsiniz.`,
  },
  {
    slug: "literatur-taramasi-nasil-yapilir",
    title: "Literatür Taraması Nasıl Yapılır? Arama Dizesinden Sentez Yazımına Adım Adım Rehber",
    seoTitle: "Literatür Taraması Nasıl Yapılır? Adım Adım Rehber",
    description: "Literatür taraması adım adım: araştırma sorusu, arama dizesi, veri tabanları, eleme ölçütleri, kaynak değerlendirme ve temalara göre sentez yazımı.",
    category: "Araştırma ve yöntem",
    keywords: ["literatür taraması nasıl yapılır", "literatür taraması örneği", "arama dizesi oluşturma", "literatür taraması aşamaları", "kaynak tarama", "literatür sentezi"],
    date: "2026-11-02",
    updated: "2026-11-14",
    cta: { text: "OpenAlex, Crossref, PubMed, DergiPark dahil 16 veri tabanında aynı anda arayın; kaynaklar otomatik doğrulanır.", href: "/kayit", label: "Kaynak aramaya başla" },
    body: `Literatür taraması, konunuzla ilgili mevcut bilgiyi **bulmak, değerlendirmek ve sentezlemek** demektir. Amaç kaynakları tek tek özetlemek değil; alandaki bilginin bugün nerede durduğunu, nerede uzlaşıldığını, nerede tartışıldığını ve sizin çalışmanızın bu tabloya nereden eklendiğini göstermektir. İyi bir literatür taraması tezin gerekçesini kurar, yöntem seçimlerinizi destekler ve tartışma bölümünde bulgularınızı karşılaştıracağınız zemini hazırlar.

Bu rehberde bir literatür taramasını baştan sona, uygulanabilir adımlarla anlatıyoruz: soruyu netleştirmekten arama dizesi kurmaya, kaynakları elemekten temalara göre yazmaya kadar.

## Literatür taraması türleri

Hepsine “literatür taraması” denir, ama amaçları ve kuralları farklıdır:

- **Anlatı (geleneksel) derleme:** Tez ve makalelerin giriş ve kuramsal bölümlerinde en sık görülen türdür. Konunun çerçevesini çizer; arama süreci ayrıntılı raporlanmaz.
- **Bütünleştirici derleme:** Farklı yöntemlerle yapılmış çalışmaları birlikte değerlendirerek yeni bir çerçeve önerir.
- **Kapsam (scoping) derlemesi:** Bir alanda neyin, ne kadar çalışıldığını haritalar; çalışmaların kalitesini değerlendirmek birincil amaç değildir.
- **Sistematik derleme:** Önceden yazılmış bir protokolle, tekrarlanabilir bir arama ve eleme süreciyle yapılır; genellikle PRISMA akış şemasıyla raporlanır. Ayrıntı için [sistematik derleme ve PRISMA rehberimize](/blog/sistematik-derleme-meta-analiz-prisma) bakın.
- **Meta-analiz:** Sistematik derlemedeki nicel sonuçları istatistiksel olarak birleştirir.

Bir tezin literatür bölümü çoğunlukla anlatı derlemedir; ama aşağıdaki adımları sistematik bir disiplinle uygulamak, “önemli bir çalışmayı kaçırdınız” eleştirisini büyük ölçüde önler.

## 1. Araştırma sorusunu netleştirin

Taramanın sınırlarını araştırma sorusu çizer. Soru belirsizse tarama da dağılır. Soruyu bileşenlerine ayırın:

- **Kim?** Örneklem veya bağlam (ör. üniversite öğrencileri, Türkiye’deki lise öğretmenleri)
- **Ne?** İncelenen değişken, müdahale veya olgu (ör. sosyal medya kullanımı)
- **Hangi sonuç?** İlgilendiğiniz çıktı (ör. akademik erteleme)

Sağlık bilimlerinde bu yapı PICO (popülasyon, müdahale, karşılaştırma, sonuç), sosyal bilimlerde çoğu zaman PEO (popülasyon, maruziyet, sonuç) olarak bilinir. Bileşenlerin her biri arama dizenizde bir blok olacaktır.

## 2. Anahtar kelimeler ve arama dizesi

Her bileşen için eş anlamlıları, yakın kavramları ve İngilizce karşılıkları listeleyin. Uluslararası literatürün büyük kısmı İngilizcedir; yalnızca Türkçe aramak önemli çalışmaları kaçırmanıza yol açar.

- Bir bileşenin eş anlamlılarını **OR** ile birleştirin.
- Farklı bileşenleri **AND** ile bağlayın.
- Kelime öbeklerini tırnak içine alın: "social media".
- Kök aramada yıldız kullanın: procrastinat* (procrastination, procrastinating…).

Örnek arama dizesi:

- ("social media" OR "social networking sites") AND (procrastinat*) AND ("university students" OR undergraduate*)

Türkçe veri tabanları için aynı mantıkla ikinci bir dize hazırlayın: ("sosyal medya" OR "sosyal ağ") AND erteleme AND ("üniversite öğrencileri"). Arama dizelerini bir yere kaydedin; yöntem bölümünde veya sistematik bir derlemede bunları raporlamanız gerekebilir.

## 3. Doğru veri tabanlarını seçin

- **Genel ve disiplinler arası:** OpenAlex, Crossref, Semantic Scholar, Google Scholar
- **Sağlık ve yaşam bilimleri:** PubMed, Europe PMC
- **Eğitim:** ERIC
- **Açık erişim:** DOAJ, CORE
- **Türkçe kaynaklar:** DergiPark, TR Dizin, YÖK Ulusal Tez Merkezi

Tek bir veri tabanında kalmak önemli çalışmaları kaçırmanıza neden olur. Google Scholar geniş kapsamlıdır ama sonuçları tekrarlanabilir değildir ve hakemsiz kaynakları da içerir; tek kaynak olarak kullanmayın. Türkçe kaynaklara nasıl ulaşacağınızı [DergiPark, TR Dizin ve YÖK Tez rehberimizde](/blog/dergipark-tr-dizin-yok-tez-kaynak-arama) anlattık.

## 4. Dahil etme ve hariç tutma ölçütlerini önceden yazın

Hangi çalışmaları alacağınıza okumaya başlamadan karar verin. Ölçütleri sonradan, sonuçlara bakarak belirlemek seçici bir literatür oluşturur.

| Ölçüt | Dahil | Hariç |
| --- | --- | --- |
| Yayın yılı | Son 10 yıl (kuramsal temel eserler hariç) | Daha eski ampirik çalışmalar |
| Dil | Türkçe ve İngilizce | Diğer diller |
| Yayın türü | Hakemli makale, tez | Konferans özeti, blog yazısı |
| Örneklem | Üniversite öğrencileri | Çocuk ve ergen örneklemleri |
| Yöntem | Nicel ve nitel ampirik çalışmalar | Görüş yazıları |

Bu tablo bir örnektir; ölçütleri kendi sorunuza göre kurun ve gerekçelendirin.

## 5. Tarayın, eleyin ve kayıt tutun

Eleme iki aşamada yapılır: önce **başlık ve özet**, sonra uygun görünenlerin **tam metni**. Her aşamada kaç kaydın elendiğini ve nedenini not edin. Basit bir arama kaydı, aylar sonra “Bu çalışmayı neden almamıştım?” sorusunu cevaplar:

- Arama tarihi, veri tabanı, kullanılan dize, bulunan kayıt sayısı
- Başlık–özet aşamasında elenen kayıt sayısı ve başlıca nedenler
- Tam metni okunan ve dahil edilen çalışma sayısı

Bir çalışmanın tam metnine erişemediyseniz bunu da kaydedin. **Yalnızca özetini okuduğunuz bir çalışmayı, tam metnini okumuş gibi ayrıntılı yorumlamayın.**

## 6. Okurken not alın: literatür matrisi

Her kaynak için aynı ölçütlerle not alın: amaç, örneklem, yöntem, ölçme aracı, temel bulgular, sınırlılıklar ve sizin çalışmanızla ilişkisi. Doğrudan alıntı yapacağınız cümlelerin sayfa numarasını mutlaka yazın. Bu notları tek bir tabloda toplamak (literatür matrisi) yazma aşamasını çok hızlandırır; matrisin nasıl kurulacağını ve örnek bir matrisi [literatür matrisi rehberimizde](/blog/literatur-matrisi-nasil-hazirlanir) bulabilirsiniz. Künyeleri ise baştan bir kaynak yönetim programına kaydedin: [Zotero ve Mendeley rehberi](/blog/zotero-mendeley-ile-kaynak-yonetimi).

## 7. Kaynakları değerlendirin

Her yayın aynı ağırlıkta değildir. Bir kaynağı kullanmadan önce şunlara bakın:

- **Hakem süreci:** Hakemli bir dergide mi yayımlanmış? Yağmacı dergilerden nasıl kaçınacağınızı [bu rehberde](/blog/yagmaci-dergiler-nasil-anlasilir) anlattık.
- **Yöntemin uygunluğu:** Örneklem büyüklüğü, ölçme araçlarının geçerlik ve güvenirliği, analiz seçimi yeterli mi?
- **Güncellik:** Alanınızda bilgi ne kadar hızlı değişiyor? Temel kuramsal eserler eski olabilir; ampirik bulgular için güncel çalışmalar tercih edilir.
- **Birincil kaynak:** Bir bulguyu başka bir yazarın aktarımından değil, mümkünse özgün çalışmadan okuyun.

## 8. Kaynakları tek tek değil, temalara göre yazın

Zayıf bir literatür bölümü “A şunu buldu. B şunu buldu. C de şunu buldu.” şeklinde ilerler. Güçlü bir literatür bölümü temalar etrafında örgütlenir: hangi bulgular birbirini destekliyor, hangileri çelişiyor, hangi sorular hâlâ cevapsız?

Bir tema paragrafı için kullanışlı bir kalıp: **genel iddia → destekleyen çalışmalar → ayrışan çalışma → değerlendirme.**

- **Zayıf:** “Yılmaz (2019) sosyal medya kullanımı ile erteleme arasında ilişki buldu. Kaya (2021) da benzer bir sonuca ulaştı. Demir (2022) ise ilişki bulamadı.”
- **Güçlü:** “Sosyal medya kullanımı ile akademik erteleme arasındaki ilişki çalışmaların çoğunda pozitif bulunmuştur (Yılmaz, 2019; Kaya, 2021). İlişki bulamayan çalışmanın (Demir, 2022) yalnızca kullanım süresini ölçmesi, ilişkinin süreden çok kullanım biçimiyle ilgili olabileceğini düşündürmektedir.”

Buradaki yazar adları biçimi göstermek için verilmiş örneklerdir. İkinci paragraf aynı çalışmaları kullanır ama okura bir **sonuç** verir ve farkın olası nedenini tartışır.

## 9. Boşluğu açıkça belirtin

Literatür bölümünüzün sonunda okuyucu şu soruya cevap bulmalıdır: “Bu çalışmaya neden ihtiyaç var?” Boşluk şunlardan biri olabilir:

- Az çalışılmış bir **örneklem veya bağlam** (ör. Türkiye’deki lisansüstü öğrenciler)
- **Çelişkili bulgular** ve bu çelişkiyi açıklayacak bir değişkenin eksikliği
- **Yöntemsel eksiklik** (ör. yalnızca kesitsel çalışmalar var, boylamsal çalışma yok)
- **Güncelliğini yitirmiş bulgular** (ör. ölçme araçları ya da teknoloji değişmiş)

Boşluğu yazarken “bu konuda hiç çalışma yok” gibi kesin ifadelerden kaçının; “erişilebilen literatürde sınırlı sayıda çalışma bulunmaktadır” gibi taradığınız alanla sınırlı bir ifade kullanın.

## 10. Literatür bölümünün iskeleti

1. **Kısa giriş:** Bölümün kapsamı ve temaların sırası
2. **Tema başlıkları:** Her tema ayrı bir alt başlık; genelden özele doğru
3. **Değerlendirme ve boşluk:** Literatürün genel durumu ve çalışmanızın katkısı

Literatür taraması ile kuramsal çerçeve arasındaki farkı [kuramsal ve kavramsal çerçeve rehberimizde](/blog/kuramsal-cerceve-kavramsal-cerceve-farki), bölümü tezin geri kalanıyla bağlamayı [tez nasıl yazılır rehberimizde](/blog/tez-nasil-yazilir) bulabilirsiniz.

## Taramayı ne zaman bitirmeli?

Yeni bulduğunuz kaynaklar artık yeni bir tema veya bulgu getirmiyor, hep aynı çalışmalara atıf yapıyorsa doygunluğa yaklaşmışsınız demektir. Yine de taramayı tez teslimine kadar güncel tutun: yazım sürecinde yayımlanan önemli bir çalışmayı atlamak jüride sık eleştirilen bir eksiktir.

## Sık yapılan hatalar

- Yalnızca özetini okuduğunuz bir çalışmayı tam metnini okumuş gibi yorumlamak
- Tek bir veri tabanında, yalnızca Türkçe anahtar kelimelerle aramak
- Dahil etme ölçütlerini sonuçlara bakarak sonradan belirlemek
- Eski ve güncelliğini yitirmiş kaynaklarla yetinmek
- İkincil kaynağı birincil kaynakmış gibi göstermek
- Kaynakları tek tek özetleyip art arda dizmek
- Künye bilgilerini sona bırakıp sonra bulamamak

## Academiana ile literatür taraması

Academiana, yazdığınız konu için arama stratejisini planlar ve OpenAlex, Crossref, Semantic Scholar, PubMed, DergiPark dahil 16 veri tabanında aynı anda arama yapar. Bulunan kaynaklar DOI üzerinden doğrulanır; her kaynağın yanında künye, özet veya tam metin düzeyinde mi okunduğu açıkça yazar. Literatür matrisi ile kaynaklarınızı tablo hâlinde karşılaştırabilir, literatür haritası ile kaynaklar arasındaki atıf bağlarını ve eksik temel çalışmaları görebilir, açık erişimli tam metinlerden sayfa numaralı alıntılar yapabilirsiniz. Asistan literatür bölümünü yazarken kaynakları tek tek özetlemez, temalara göre sentezler ve yalnızca kütüphanenizdeki kaynaklara atıf yapar.`,
    sources: [
      { text: "Grant, M. J., & Booth, A. (2009). A typology of reviews: An analysis of 14 review types and associated methodologies. Health Information & Libraries Journal, 26(2), 91–108." },
      { text: "Snyder, H. (2019). Literature review as a research methodology: An overview and guidelines. Journal of Business Research, 104, 333–339." },
      { text: "Webster, J., & Watson, R. T. (2002). Analyzing the past to prepare for the future: Writing a literature review. MIS Quarterly, 26(2), xiii–xxiii." },
      { text: "Torraco, R. J. (2005). Writing integrative literature reviews: Guidelines and examples. Human Resource Development Review, 4(3), 356–367." },
      { text: "Page, M. J., McKenzie, J. E., Bossuyt, P. M., Boutron, I., Hoffmann, T. C., Mulrow, C. D., … Moher, D. (2021). The PRISMA 2020 statement: An updated guideline for reporting systematic reviews. BMJ, 372, n71." },
      { text: "Booth, A., Sutton, A., & Papaioannou, D. (2016). Systematic approaches to a successful literature review (2nd ed.). SAGE." },
    ],
  },
  {
    slug: "apa-7-atif-kurallari",
    title: "APA 7 Atıf Kuralları: Metin İçi Atıf ve Kaynakça Örnekleri",
    description: "APA 7’ye göre metin içi atıf, doğrudan alıntı, çok yazarlı kaynaklar ve kitap, makale, web sayfası kaynakça örnekleri: Türkçe çalışmalar için rehber.",
    category: "Kaynak ve atıf",
    keywords: ["APA 7 kuralları", "APA kaynak gösterme", "APA 7 kaynakça örnekleri", "metin içi atıf"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Atıfları APA 7 dahil 10 stilde otomatik biçimlendirin; stili değiştirdiğinizde bütün atıflar ve kaynakça kendiliğinden dönüşür.", href: "/kayit", label: "Atıfları otomatik yap" },
    body: `APA (American Psychological Association) stili, sosyal bilimlerde ve eğitim alanında en yaygın kullanılan atıf sistemidir. Güncel sürüm 7. baskıdır. Aşağıda en sık ihtiyaç duyulan kuralları örneklerle özetledik. Türkçe çalışmalarda bazı ifadeler Türkçeleştirilir; enstitünüzün kılavuzunda farklı bir uygulama varsa o geçerlidir.

## Metin içi atıf

APA, **yazar–tarih** sistemini kullanır.

- **Parantez içi atıf:** Sosyal medya kullanımı benlik algısını etkileyebilir (Yılmaz, 2021).
- **Anlatı atfı:** Yılmaz (2021), sosyal medya kullanımının benlik algısını etkileyebileceğini belirtmiştir.

### Yazar sayısına göre

- **İki yazar:** (Yılmaz ve Kaya, 2021) — İngilizce metinlerde (Smith & Lee, 2021)
- **Üç ve daha fazla yazar:** İlk atıftan itibaren ilk yazar ve "vd." kullanılır: (Yılmaz vd., 2021) — İngilizcede *et al.*
- **Kurum yazar:** (Türkiye İstatistik Kurumu [TÜİK], 2023), sonraki atıflarda (TÜİK, 2023)
- **Birden fazla kaynak:** Alfabetik sırayla, noktalı virgülle ayrılır: (Kaya, 2019; Yılmaz, 2021)

## Doğrudan alıntı

Doğrudan alıntılarda **sayfa numarası zorunludur**.

- **Kısa alıntı (40 kelimeden az):** tırnak içinde verilir: "…" (Yılmaz, 2021, s. 45).
- **Uzun alıntı (40 kelime ve üzeri):** tırnaksız, ayrı bir paragraf olarak ve soldan girintili yazılır; atıf noktadan sonra gelir.

Doğrudan alıntıyı az kullanın. Akademik metinlerde esas olan, bilgiyi kendi cümlelerinizle aktarmak (parafraz) ve kaynağı göstermektir.

## Kaynakça örnekleri

Kaynakça, yazar soyadına göre alfabetik sıralanır ve asılı girinti (ilk satır dışarıda) kullanılır.

**Dergi makalesi:**
Yılmaz, A., & Kaya, B. (2021). Üniversite öğrencilerinde sosyal medya kullanımı ve benlik saygısı. *Eğitim ve Bilim, 46*(205), 123–140. https://doi.org/10.xxxx/xxxxx

**Kitap:**
Yılmaz, A. (2020). *Araştırma yöntemleri* (3. bs.). Yayınevi Adı.

APA 7’de kitaplar için yayın yeri artık yazılmaz.

**Kitap bölümü:**
Kaya, B. (2019). Ölçek uyarlama süreci. A. Yılmaz (Ed.), *Eğitimde ölçme* içinde (ss. 45–67). Yayınevi Adı.

**Web sayfası:**
Kurum Adı. (2023, 5 Mart). *Sayfanın başlığı*. Site Adı. https://…

**Tez:**
Yılmaz, A. (2022). *Tezin başlığı* [Yüksek lisans tezi, Üniversite Adı]. YÖK Ulusal Tez Merkezi.

## APA 7’deki önemli değişiklikler

- DOI’ler bağlantı biçiminde yazılır: https://doi.org/…
- "Retrieved from" ifadesi yalnızca içeriği değişebilen kaynaklarda kullanılır.
- Kaynakçada 20 yazara kadar bütün yazarlar yazılır.
- Kitaplarda yayın yeri kaldırılmıştır.

## En sık yapılan hatalar

- Metinde geçen bir kaynağın kaynakçada olmaması (veya tersi)
- Yıl uyuşmazlıkları: metinde 2020, kaynakçada 2021
- Doğrudan alıntıda sayfa numarasını unutmak
- Aynı yazarın aynı yıldaki iki çalışmasını ayırmamak (2021a, 2021b)


## Metin içi atıfta ayrıntılı kurallar

### Parantez içi ve anlatı içi atıf

APA 7’de iki atıf biçimi vardır. **Parantez içi atıfta** yazar adı ve yıl cümlenin sonunda parantez içinde verilir. **Anlatı içi atıfta** yazar adı cümlenin öznesi olur ve yalnızca yıl parantez içinde yazılır. İkisi arasındaki tercih üsluba bağlıdır; bir paragrafta aynı kaynağı arka arkaya parantez içinde vermek yerine anlatı içi atıf kullanmak metni akıcı kılar.

### Birden fazla kaynağa aynı anda atıf

Aynı parantezde birden fazla kaynak gösterilecekse kaynaklar **ilk yazarın soyadına göre alfabetik** sıralanır ve noktalı virgülle ayrılır. Aynı yazarın birden fazla çalışması yıl sırasıyla verilir.

### Aynı yazar, aynı yıl

Aynı yazarın aynı yıl yayımlanmış iki çalışmasına atıf yapıyorsanız yılın yanına harf eklenir (2021a, 2021b). Harfler kaynakçadaki başlık sırasına göre verilir ve metinde de aynı biçimde kullanılır.

### Kurum yazarlar

Bir kurumun yazar olduğu belgelerde (ör. bir bakanlık raporu) kurumun tam adı yazılır. Kısaltması yaygınsa ilk atıfta tam ad ve kısaltma birlikte verilir, sonraki atıflarda yalnızca kısaltma kullanılır.

### İkincil kaynak (aktaran)

Özgün kaynağa ulaşamadığınız durumda, okuduğunuz kaynak üzerinden atıf yapılır: metinde özgün çalışma ile okuduğunuz çalışma birlikte anılır, **kaynakçaya yalnızca okuduğunuz kaynak** yazılır. APA, ikincil kaynağın yalnızca özgün kaynağa gerçekten ulaşılamadığında kullanılmasını önerir.

## Doğrudan alıntının ayrıntıları

- **40 kelimeden kısa alıntılar** tırnak içinde metne yerleştirilir ve sayfa numarası verilir.
- **40 kelime ve üzeri alıntılar** blok alıntı olarak, tırnaksız ve girintili yazılır; sayfa numarası alıntının sonunda verilir.
- Sayfa numarası olmayan kaynaklarda paragraf numarası, bölüm başlığı veya zaman damgası (video için) kullanılabilir.
- Alıntının içinden bir bölümü çıkardıysanız üç nokta, kendi eklediğiniz kelimeleri köşeli parantez içinde gösterin.

Doğrudan alıntıyı az kullanın; düşünceyi kendi cümlelerinizle aktarmak (parafraz) ve atıf vermek akademik yazımda tercih edilir. Parafrazda da atıf zorunludur; ayrıntı için [intihalden kaçınma rehberimize](/blog/intihal-nasil-onlenir) bakın.

## Kaynakça biçiminin genel kuralları

- Kaynakça **ilk yazarın soyadına göre alfabetik** sıralanır.
- Her girdi **asılı girinti** ile yazılır: ilk satır sola dayalı, sonraki satırlar içeride.
- Makale başlıklarında yalnızca ilk kelimenin ve özel adların baş harfi büyük yazılır; dergi adları her kelimenin baş harfi büyük ve italik yazılır.
- Dergi cilt numarası italik, sayı numarası parantez içinde düz yazılır.
- DOI varsa https://doi.org/ ile başlayan bağlantı biçiminde eklenir; “Retrieved from” ifadesi kullanılmaz.
- 21 veya daha fazla yazarlı bir kaynakta ilk 19 yazar, üç nokta ve son yazar yazılır.

Aynı kaynağın APA 7 ve diğer stillerdeki karşılaştırmalı örneklerini [kaynakça rehberimizde](/blog/kaynakca-nasil-hazirlanir) bulabilirsiniz.

## Tablo ve şekillerde atıf

Başka bir çalışmadan uyarladığınız tablo veya şekiller için tablonun altındaki nota kaynak bilgisi eklenir ve gerekiyorsa telif izni alınır. Tablo ve şekil biçimi için [APA 7 tablo ve şekil rehberimize](/blog/tez-tablo-ve-sekil-apa-7) bakın.

## Academiana ile otomatik APA 7

Academiana’da atıflar metne düz yazı olarak değil, kaynağa bağlı bir işaret olarak eklenir. Kaynakça bu işaretlerden otomatik oluşur; metinden bir atıfı sildiğinizde kaynakçadan da kalkar. APA 7, ISNAD, MLA, Chicago, IEEE, Vancouver ve Harvard dahil 10 stil arasında tek tıkla geçiş yapabilirsiniz. Kalite kontrolü, eksik künye bilgilerini ve metin–kaynakça uyumsuzluklarını sizin yerinize bulur.`,
    sources: [
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "kaynakca-nasil-hazirlanir",
    title: "Kaynakça Nasıl Hazırlanır? APA, MLA, Chicago, IEEE ve ISNAD Örnekleriyle Rehber",
    seoTitle: "Kaynakça Nasıl Hazırlanır? 7 Stilde Örneklerle Rehber",
    description: "Kaynakça nasıl hazırlanır: aynı kaynağın APA 7, MLA, Chicago, IEEE, Vancouver ve ISNAD örnekleri, DOI, sıralama kuralları ve kontrol listesi.",
    category: "Kaynak ve atıf",
    keywords: ["kaynakça nasıl hazırlanır", "kaynakça örneği", "kaynakça nasıl yazılır", "ISNAD kaynakça", "MLA kaynak gösterme", "Chicago atıf", "IEEE kaynakça"],
    date: "2026-11-02",
    updated: "2026-11-14",
    cta: { text: "Zotero, Mendeley veya EndNote’tan kaynaklarınızı içe aktarın; kaynakça seçtiğiniz stilde otomatik oluşsun.", href: "/kayit", label: "Kaynakçamı otomatik oluştur" },
    body: `Kaynakça, çalışmanızda atıf yaptığınız bütün kaynakların listesidir. Okuyucunun bir bilgiyi kaynağına kadar takip edebilmesini sağlar ve akademik dürüstlüğün temelidir. Jüri üyeleri ve hakemler kaynakçaya ilk bakışta çalışmanın ne kadar özenli hazırlandığına dair güçlü bir izlenim edinir: eksik künyeler, metinde olup kaynakçada olmayan atıflar ya da karışık biçimler en sık düzeltme istenen konular arasındadır.

Bu rehberde kaynakçanın nasıl hazırlanacağını, en yaygın atıf stillerinin farklarını ve aynı kaynağın her stilde nasıl yazıldığını örneklerle anlatıyoruz.

## Kaynakça ile bibliyografya farkı

- **Kaynakça:** Yalnızca metinde atıf yaptığınız kaynaklar.
- **Bibliyografya:** Okuduğunuz ama atıf yapmadığınız kaynaklar da dahil olabilir.

Tezlerde ve makalelerde genellikle **kaynakça** istenir. Metindeki her atıfın kaynakçada, kaynakçadaki her kaynağın metinde bir karşılığı olmalıdır.

## Stili kim belirler?

Hangi stili kullanacağınızı çoğu zaman siz değil, enstitünüzün tez yazım kılavuzu veya dergi belirler. Kılavuz bir stil adı verip bazı noktalarda ondan ayrılabilir (ör. “APA 7, ancak kaynakçada yazar adları tam yazılır”). Böyle durumlarda **kılavuzun kendi kuralı önceliklidir**. Yazmaya başlamadan önce kılavuzu okuyun; stil değiştirmek ileride çok zaman alır.

## Aynı kaynak yedi stilde

Farkları en iyi gösteren yol, tek bir kaynağı farklı stillerde yan yana görmektir. Aşağıdaki örnekler **kurgusal** bir dergi makalesinin (Demir ve Kaya, 2022, *Örnek Eğitim Dergisi*, cilt 12, sayı 3, sayfa 45–62) 50. sayfasına yapılan atıfı ve kaynakça girdisini gösterir. Tüm örnekler Academiana’nın atıf motoruyla üretilmiştir.

### APA 7

- **Metin içi:** (Demir & Kaya, 2022, s. 50)
- **Kaynakça:** Demir, M., & Kaya, E. (2022). Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme. Örnek Eğitim Dergisi, 12(3), 45–62.

### MLA 9

- **Metin içi:** (Demir ve Kaya 50)
- **Kaynakça:** Demir, Mehmet, ve Elif Kaya. “Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme.” Örnek Eğitim Dergisi, vol. 12, no. 3, 2022, pp. 45–62.

### Chicago (yazar-tarih)

- **Metin içi:** (Demir ve Kaya 2022, 50)
- **Kaynakça:** Demir, Mehmet, ve Elif Kaya. 2022. “Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme.” Örnek Eğitim Dergisi 12 (3): 45–62.

### IEEE

- **Metin içi:** [1, s. 50]
- **Kaynakça:** M. Demir ve E. Kaya, “Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme,” Örnek Eğitim Dergisi, vol. 12, no. 3, pp. 45–62, 2022.

### Vancouver

- **Metin içi:** [1, s. 50]
- **Kaynakça:** Demir M, Kaya E. Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme. Örnek Eğitim Dergisi. 2022;12(3):45-62.

### ISNAD 2 (metin içi)

- **Metin içi:** (Demir - Kaya, 2022, 50)
- **Kaynakça:** Demir, Mehmet - Kaya, Elif. “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”. Örnek Eğitim Dergisi 12/3 (2022), 45-62.

### ISNAD 2 (dipnotlu)

- **İlk dipnot:** Mehmet Demir - Elif Kaya, “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”, Örnek Eğitim Dergisi 12/3 (2022), 45-62/50.
- **Sonraki dipnotlar:** Demir - Kaya, “Üniversite Öğrencilerinde Sosyal”, 52.
- **Kaynakça:** Demir, Mehmet - Kaya, Elif. “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”. Örnek Eğitim Dergisi 12/3 (2022), 45-62.


## Stillerin farkı tek bakışta

| Stil | Yaygın alan | Metin içi atıf | Kaynakça sırası | Kaynakça adı |
| --- | --- | --- | --- | --- |
| APA 7 | Psikoloji, eğitim, sosyal bilimler | Yazar, yıl | Alfabetik | Kaynakça |
| MLA 9 | Dil, edebiyat, beşerî bilimler | Yazar, sayfa | Alfabetik | Works Cited |
| Chicago (yazar-tarih) | Tarih, sanat, sosyal bilimler | Yazar yıl, sayfa | Alfabetik | Kaynakça |
| IEEE | Mühendislik, bilgisayar | Köşeli parantezde numara | Metinde ilk geçiş sırası | Kaynakça |
| Vancouver | Tıp, sağlık bilimleri | Numara | Metinde ilk geçiş sırası | Kaynakça |
| ISNAD 2 (metin içi) | İlahiyat ve bazı sosyal bilimler | Yazar, yıl, sayfa | Alfabetik | Kaynakça |
| ISNAD 2 (dipnotlu) | İlahiyat, tarih | Dipnot | Alfabetik | Kaynakça |

ISNAD’ın ayrıntılarını [ISNAD atıf sistemi rehberimizde](/blog/isnad-atif-sistemi-rehberi), APA’nın metin içi kurallarını [APA 7 atıf kuralları rehberimizde](/blog/apa-7-atif-kurallari) bulabilirsiniz.

## Kaynak türüne göre gereken bilgiler

Stil ne olursa olsun, bir kaynakça girdisi için şu bilgileri baştan kaydedin:

- **Dergi makalesi:** Yazarlar, yıl, makale başlığı, dergi adı, cilt, sayı, sayfa aralığı, DOI
- **Kitap:** Yazarlar veya editörler, yıl, kitap adı, baskı (ikinci ve sonrası), yayınevi; bazı stillerde basım yeri
- **Kitap bölümü:** Bölüm yazarları, bölüm başlığı, editörler, kitap adı, sayfa aralığı, yayınevi
- **Tez:** Yazar, yıl, tez başlığı, tez türü (yüksek lisans/doktora), üniversite; erişildiyse veri tabanı ve tez numarası
- **Web sayfası:** Yazar veya kurum, tarih, sayfa başlığı, site adı, adres; içerik değişebiliyorsa erişim tarihi

Bu bilgilerden biri eksikse kaynakça girdisi de eksik kalır. En sık unutulanlar sayı numarası, sayfa aralığı ve DOI’dir.

## DOI nedir ve neden önemlidir?

DOI (Digital Object Identifier), bir yayına verilen kalıcı kimliktir. Yayının internet adresi değişse bile DOI aynı kalır ve her zaman doğru sayfaya yönlendirir. APA 7, DOI’nin kaynakçada https://doi.org/ ile başlayan bağlantı biçiminde yazılmasını ister. DOI’si olan bir kaynakta DOI’yi eklemek, okurun kaynağa tek tıkla ulaşmasını sağlar ve kaynağın gerçekten var olduğunu doğrulamayı kolaylaştırır. Bir kaynağın DOI’sini veya eksik künyesini ücretsiz [kaynakça oluşturucumuzla](/araclar/kaynakca-olusturucu) bulabilirsiniz. DOI’nin nasıl bulunup doğrulanacağını [DOI rehberimizde](/blog/doi-nedir-nasil-bulunur) ayrıntılı anlattık.

## Sıralama ve biçim kuralları

- **Alfabetik stillerde** (APA, MLA, Chicago, ISNAD) sıralama ilk yazarın soyadına göre yapılır. Türkçe soyadlarında Ç, Ğ, İ, Ö, Ş, Ü harflerinin sırasına dikkat edin.
- **Aynı yazarın aynı yıldaki iki çalışması** APA’da yıla harf eklenerek ayrılır: 2021a, 2021b.
- **Numaralı stillerde** (IEEE, Vancouver) kaynaklar metinde ilk geçtikleri sırayla numaralanır; aynı kaynağa tekrar atıf yapıldığında aynı numara kullanılır.
- **Asılı girinti:** APA, MLA ve Chicago’da her girdinin ilk satırı sola dayalı, sonraki satırları içeride yazılır.
- **Büyük harf kullanımı:** APA makale başlıklarında yalnızca ilk kelimenin ve özel adların baş harfini büyük yazar; ISNAD ve Chicago başlıkta her kelimenin baş harfini büyütür. Yukarıdaki örneklerde bu farkı görebilirsiniz.

## İyi bir kaynakça için kontrol listesi

- Metindeki **her** atıfın kaynakçada karşılığı var mı?
- Kaynakçadaki **her** kaynağa metinde atıf yapılmış mı?
- Yazar adları ve yıllar metinle birebir uyuşuyor mu?
- Dergi adı, cilt, sayı ve sayfa bilgileri eksiksiz mi?
- DOI varsa eklenmiş mi?
- Sıralama doğru mu (alfabetik stillerde soyadı, numaralı stillerde ilk geçiş sırası)?
- Biçim tutarlı mı (italik, noktalama, asılı girinti, büyük harf kullanımı)?
- Her kaynak gerçekten var mı ve okuduğunuz bilgiyi gerçekten içeriyor mu?

## Uydurma kaynak riskine dikkat

Yapay zekâ sohbet araçları, var olmayan ama gerçekçi görünen kaynaklar üretebilir: gerçek yazar adları, gerçek dergi adları ve inandırıcı DOI’lerle. Bu tür bir kaynağın kaynakçada bulunması akademik dürüstlük açısından ciddi bir sorundur. Kaynakçanızdaki her kaynağı kendiniz bulup okuyun; kaynakçanızı ücretsiz [uydurma kaynak kontrolü](/araclar/uydurma-kaynak-kontrolu) aracıyla taratabilirsiniz. Ayrıntılar için [yapay zekânın uydurduğu kaynakları tespit etme rehberimize](/blog/yapay-zeka-uydurma-kaynak-tespiti) bakın.

## Kaynak yönetim programları

Zotero, Mendeley ve EndNote gibi programlar kaynaklarınızı tek bir yerde toplar ve kaynakçayı otomatik oluşturur. Kaydettiğiniz kaynakları BibTeX, RIS veya CSL-JSON biçiminde dışa aktarıp başka araçlara taşıyabilirsiniz. Kurulum ve kullanım için [Zotero ve Mendeley rehberimize](/blog/zotero-mendeley-ile-kaynak-yonetimi) bakın. Program ne kadar iyi olursa olsun, otomatik üretilen girdileri mutlaka kontrol edin: eksik sayfa aralığı veya yanlış büyük harf kullanımı sık görülür.

## Sık yapılan hatalar

- Metinde atıf yapılan bir kaynağın kaynakçada unutulması (veya tersi)
- Aynı kaynağın metinde ve kaynakçada farklı yıl veya yazım ile geçmesi
- Okunmayan bir kaynağı başka bir yazarın aktarımından alıp birincil kaynak gibi göstermek: [intihalden kaçınma rehberimiz](/blog/intihal-nasil-onlenir) aktarma kurallarını anlatır
- Farklı stilleri aynı kaynakçada karıştırmak
- Kaynakçayı tezin sonunda tek seferde hazırlamaya çalışmak

## Academiana ile kaynakça

Academiana’da kaynakça elle yazılmaz; metindeki atıflardan otomatik oluşur ve her zaman metinle uyumludur. Metinden bir atıfı sildiğinizde kaynak kaynakçadan da kalkar. APA 7, ISNAD 2 (metin içi ve dipnotlu), MLA, Chicago, IEEE, Vancouver ve Harvard dahil 11 stil arasında tek tıkla geçiş yapabilirsiniz; ISNAD dipnotlu seçildiğinde Word, PDF ve LaTeX çıktılarında atıflar gerçek dipnot olarak yerleşir. Zotero, Mendeley ve EndNote’tan kaynaklarınızı içe aktarabilir, kaynakçanızı bu programların okuyabileceği biçimlerde dışa aktarabilirsiniz. Kalite kontrolü eksik künyeleri, doğrulanamayan kaynakları ve metin–kaynakça uyumsuzluklarını sizin yerinize bulur.`,
    sources: [
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
      { text: "Modern Language Association of America. (2021). MLA handbook (9th ed.)." },
      { text: "University of Chicago Press. (2017). The Chicago manual of style (17th ed.)." },
      { text: "Patrias, K. (2007). Citing medicine: The NLM style guide for authors, editors, and publishers (2nd ed.). National Library of Medicine." },
      { text: "İSNAD Atıf Sistemi. (2018). İSNAD Atıf Sistemi Kılavuzu (2. edisyon).", url: "https://www.isnadsistemi.org/" },
    ],
  },
  {
    slug: "intihal-nasil-onlenir",
    title: "İntihalden Nasıl Kaçınılır? Doğru Alıntı, Parafraz ve Atıf Rehberi",
    description: "Tezde ve makalede intihale düşmemek için doğru alıntı, parafraz ve atıf teknikleri. Benzerlik raporu nasıl okunur, kendi kendine intihal nedir?",
    category: "Etik ve yapay zekâ",
    keywords: ["intihal nasıl önlenir", "intihal oranı düşürme", "intihalden kurtulma", "parafraz nasıl yapılır", "benzerlik raporu"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Her bilgiyi kaynağına bağlayan, sayfa numaralı alıntı yapan ve kaynaksız iddia yazmayan bir asistanla çalışın.", href: "/kayit", label: "Doğru atıfla yazmaya başla" },
    body: `"İntihal oranımı nasıl düşürürüm?" sorusu, öğrencilerin en çok aradığı sorulardan biridir. Ancak asıl hedef bir yazılımın oranını düşürmek değil, **intihal yapmamaktır**. Doğru atıf ve parafraz alışkanlığı kazandığınızda benzerlik raporu kendiliğinden bir sorun olmaktan çıkar.

## İntihal nedir?

Başkasının fikrini, verisini, metnini veya yapısını kaynak göstermeden kendinizinmiş gibi sunmak intihaldir. Kasıtlı olması gerekmez; dikkatsizlikle yapılan intihal de intihaldir. Başlıca türleri:

- **Doğrudan kopyalama:** Bir metni tırnak ve atıf olmadan aktarmak
- **Yamalı (mozaik) intihal:** Kaynak cümlelerin birkaç kelimesini değiştirip aynı yapıyı korumak
- **Fikir intihali:** Bir başkasının özgün fikrini kendi cümlelerinizle ama kaynaksız anlatmak
- **Kendi kendine intihal:** Daha önce yayımladığınız bir metni belirtmeden yeniden kullanmak

## Benzerlik raporu = intihal oranı değil

Turnitin, iThenticate veya İntihal.net gibi programlar metninizin başka metinlerle ne kadar **benzediğini** gösterir; intihal olup olmadığına karar vermez. Doğru gösterilmiş alıntılar, kaynakça, yaygın kalıp ifadeler ve ölçek maddeleri de benzerlik olarak çıkabilir. Bu yüzden raporu yorumlayan danışman ve jüridir. Kabul edilen üst sınırlar kurumdan kuruma değişir; kendi enstitünüzün yönergesine bakın.

## İntihalden kaçınmanın 7 yolu

1. **Okurken not alın, kopyalamayın.** Kaynaktan kopyaladığınız cümleleri kendi notlarınızla karıştırmak, istemsiz intihalin en sık nedenidir. Kopyaladıklarınızı tırnak içinde ve sayfa numarasıyla saklayın.
2. **Gerçek parafraz yapın.** Kaynağı okuyun, kapatın, anladığınızı kendi cümle yapınızla yazın, sonra karşılaştırın. Yalnızca eş anlamlı kelime değiştirmek parafraz değildir.
3. **Parafrazda da atıf yapın.** Kendi cümlelerinizle yazmanız, fikrin size ait olduğu anlamına gelmez.
4. **Doğrudan alıntıyı az ve doğru kullanın.** Tırnak, atıf ve sayfa numarası birlikte olmalıdır.
5. **Ortak bilgiyi ayırt edin.** "Türkiye’nin başkenti Ankara’dır" kaynak gerektirmez; bir araştırma bulgusu ise gerektirir.
6. **Kendi önceki çalışmalarınıza da atıf yapın.** Yayımlanmış bir makalenizi teze dahil ediyorsanız bunu belirtin.
7. **Teslimden önce kendiniz kontrol edin.** Üniversitenizin sağladığı benzerlik programıyla taslağınızı tarayın ve çıkan eşleşmeleri tek tek inceleyin.

## Benzerlik raporunda yüksek oran çıktıysa ne yapmalı?

- Eşleşen bölümleri tek tek açın: Bunlar doğru gösterilmiş alıntılar mı, kaynakça mı, yoksa atıfsız aktarımlar mı?
- Atıfsız aktarımları gerçekten yeniden yazın ve kaynağını ekleyin.
- Uzun doğrudan alıntıları kısaltın veya parafraza çevirin.
- Danışmanınızdan, raporda kaynakça ve alıntıların hariç tutulduğu bir sürüm isteyin.

Metni anlamsız hâle getiren kelime değiştirme araçları veya karakter hileleri gibi yöntemler hem etik değildir hem de jüri tarafından kolayca fark edilir. Bunlar disiplin sürecine yol açabilir.


## İntihal türleri

İntihal yalnızca bir metni kopyalayıp yapıştırmak değildir. Akademik dünyada farklı biçimleri vardır:

- **Doğrudan intihal:** Başkasının cümlelerini tırnak işareti ve atıf olmadan kullanmak.
- **Parafraz intihali:** Cümleleri birkaç kelime değiştirerek yeniden yazmak ama kaynak göstermemek. Kelimeleri değiştirmek fikri sizin yapmaz.
- **Mozaik (yama) intihal:** Farklı kaynaklardan cümle parçalarını birleştirip yeni bir metin gibi sunmak.
- **Kendi kendini intihal:** Daha önce yayımladığınız bir metni ya da ödevi atıf yapmadan yeniden kullanmak. Tezden üretilen makalelerde tezinize atıf yapmanız beklenir.
- **Kaynak intihali:** Başka bir yazarın kaynakçasındaki kaynakları okumadan kendi okumuş gibi göstermek.
- **Fikir ve veri intihali:** Başkasının özgün fikrini, araştırma tasarımını veya verisini kaynak göstermeden kullanmak.

## İyi bir parafraz nasıl yazılır?

Parafraz, kaynağın fikrini kendi cümle yapınızla ve kendi kelimelerinizle aktarmaktır. Kullanışlı bir yöntem:

1. Kaynaktaki paragrafı okuyun ve ana fikri anlayana kadar tekrar okuyun.
2. Kaynağı kapatın ve fikri kendi cümlelerinizle not alın.
3. Notunuzu kaynakla karşılaştırın: aynı cümle yapısını veya özgün ifadeleri kullanmışsanız yeniden yazın.
4. Atıf ekleyin. Parafrazda da atıf zorunludur.

Alana özgü teknik terimleri değiştirmeniz gerekmez; “öz yeterlik” gibi bir kavramın eş anlamlısını aramak anlamı bozabilir. Değiştirilmesi gereken cümle yapısı ve anlatımdır.

## Tezden makale üretirken

Tezinizden makale hazırladığınızda metnin bir kısmı doğal olarak tezle benzer olacaktır. Dergiye gönderirken makalenin bir tezden üretildiğini belirtin, teze atıf yapın ve yöntem gibi bölümleri dergi biçimine göre yeniden yazın. Aynı veriden birden fazla makale üretiyorsanız her makalenin farklı bir soruya cevap verdiğinden emin olun; aynı bulguları farklı dergilerde yayımlamak (dilimleme, yinelenen yayın) da etik ihlaldir.

## Yapay zekâ ve intihal

Yapay zekâ araçlarının ürettiği metinler de akademik dürüstlük kurallarına tabidir. Birçok kurum yapay zekâyla üretilen metnin yazara aitmiş gibi sunulmasını kabul etmez ve kullanımın beyan edilmesini ister. Ayrıca yapay zekâ var olmayan kaynaklar üretebilir; bu, kaynak intihalinden daha ciddi bir sorundur. Ayrıntılar için [yapay zekâ ile tez yazmanın etiği](/blog/yapay-zeka-ile-tez-yazmak-etik-mi) ve [uydurma kaynak tespiti](/blog/yapay-zeka-uydurma-kaynak-tespiti) rehberlerimize bakın.

## Gönderim öncesi kontrol listesi

- Her doğrudan alıntı tırnak içinde mi ve sayfa numarası var mı?
- Her parafrazın sonunda atıf var mı?
- Okumadığınız bir kaynağı birincil kaynak gibi göstermediniz mi?
- Daha önceki çalışmalarınızdan aldığınız bölümlere atıf yaptınız mı?
- Tablo, şekil ve ölçek maddeleri için kaynak gösterdiniz ve gerekiyorsa izin aldınız mı?
- Kaynakçadaki her kaynağa metinde atıf var mı?

## Academiana yaklaşımı

Academiana bir intihal yüzdesi göstermez; çünkü güvenilir bir oran ancak lisanslı ve büyük arşivlere sahip servislerle hesaplanabilir. Bunun yerine intihale düşmemeniz için çalışır: asistan yalnızca projenize eklenmiş gerçek kaynaklara atıf yapar, kaynağı olmayan kesin iddia yazmaz, tam metni okunan kaynaklardan aktarımlarda sayfa numarası verir ve metinde tekrar eden ifadeleri işaretler.`,
    sources: [
      { text: "Roig, M. (2015). Avoiding plagiarism, self-plagiarism, and other questionable writing practices: A guide to ethical writing. Office of Research Integrity." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "yapay-zeka-ile-tez-yazmak-etik-mi",
    title: "Yapay Zekâ ile Tez Yazmak Etik mi? Doğru ve Yanlış Kullanım",
    description: "Tez ve makalede yapay zekâ kullanımı ne zaman meşru, ne zaman etik ihlaldir? Üniversitelerin yaklaşımı, beyan zorunluluğu ve sorumlu kullanım ilkeleri.",
    category: "Etik ve yapay zekâ",
    keywords: ["yapay zeka ile tez yazmak", "ChatGPT ile tez yazılır mı", "yapay zeka akademik etik", "yapay zeka beyanı"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Uydurma kaynak üretmeyen, her iddiayı gerçek kaynağa bağlayan ve yazarlığı size bırakan bir asistanla çalışın.", href: "/akademik-durustluk", label: "Akademik dürüstlük ilkelerimiz" },
    body: `Yapay zekâ araçları akademik çalışmada hızla yaygınlaşıyor. Öğrencilerin aklındaki soru da açık: "Bunu kullanırsam başım derde girer mi?" Kısa cevap: **Nasıl kullandığınıza bağlı.** Yapay zekâ bir yardımcı olarak kullanıldığında meşru olabilir; yazarın yerine geçtiğinde ise ciddi bir etik sorundur.

## Kurumların yaklaşımı

Üniversiteler ve dergiler yapay zekâ kullanımına dair yönergeler yayımlıyor ve bunlar hızla güncelleniyor. Ortak noktalar şunlar:

- Yapay zekâ **yazar** olarak gösterilemez; sorumluluk her zaman insandadır.
- Kullanıldıysa bu durumun çoğu zaman **beyan edilmesi** beklenir (hangi araç, hangi amaçla).
- Üretilen içeriğin doğruluğundan yazar sorumludur.

Kendi enstitünüzün ve hedef derginizin güncel yönergesini mutlaka okuyun.

## Genellikle kabul gören kullanımlar

- Konu ve araştırma sorusu üzerine beyin fırtınası yapmak
- Literatür taramasında arama terimleri üretmek
- Kendi yazdığınız metnin dilini ve akışını düzeltmek
- Bir kavramı veya istatistik yöntemini anlamak
- Taslağınıza eleştirel geri bildirim almak

## Etik sorun doğuran kullanımlar

- Tezin bölümlerini yapay zekâya yazdırıp okumadan teslim etmek
- Yapay zekânın ürettiği **kaynakları doğrulamadan** kullanmak
- Veri, bulgu veya istatistik uydurtmak
- Kullanımı, beyan istenen yerde gizlemek

## En büyük risk: uydurma kaynaklar

Genel amaçlı sohbet botları gerçekte var olmayan makaleler, yazarlar ve DOI numaraları üretebilir. Bu kaynaklar ilk bakışta inandırıcıdır; ama jüri veya hakem kontrol ettiğinde bulunamaz. Uydurma bir kaynak, akademik dürüstlük açısından ciddi bir sorundur.

## Sorumlu kullanım için 5 ilke

1. **Yazar sizsiniz.** Her cümlenin arkasında durabilmelisiniz; savunmada sorulduğunda açıklayabilmelisiniz.
2. **Her kaynağı doğrulayın.** Bir kaynağı ancak gerçekten bulup okuduysanız kullanın.
3. **Veri asla üretilmez.** Bulgular yalnızca sizin topladığınız verilerden gelir.
4. **Taslakları dönüştürün.** Yapay zekâ önerilerini kendi düşüncenizle yeniden yazın ve geliştirin.
5. **Beyan edin.** Kurumunuz istiyorsa hangi aracı ne amaçla kullandığınızı açıkça yazın.


## Yapay zekâ kullanımını beyan etmek

Pek çok dergi ve üniversite, yapay zekâ araçlarının kullanıldığı durumlarda bunun açıkça beyan edilmesini ister. Uluslararası yayın etiği kuruluşu COPE, yapay zekâ araçlarının yazar olarak gösterilemeyeceğini, çünkü bir çalışmanın sorumluluğunu üstlenemeyeceklerini vurgular. Beyan genellikle şunları içerir:

- Hangi aracın kullanıldığı
- Hangi amaçla kullanıldığı (ör. dil düzeltme, literatür taramasında arama stratejisi, kod yazımı)
- Çıktıların yazar tarafından kontrol edildiği ve sorumluluğun yazara ait olduğu

Örnek beyan metinleri ve beyanın nereye yazılacağı için [yapay zekâ kullanım beyanı rehberimize](/blog/yapay-zeka-kullanim-beyani-nasil-yazilir) bakın.

Beyanın nereye ve nasıl yazılacağı kurumdan kuruma değişir: yöntem bölümü, teşekkür bölümü veya ayrı bir beyan. Teslimden önce enstitünüzün ve hedef derginizin güncel politikasını mutlaka okuyun.

## Kullanım alanlarına göre risk haritası

| Kullanım | Genel değerlendirme | Dikkat edilecek nokta |
| --- | --- | --- |
| Dil ve yazım düzeltme | Çoğu kurumda kabul görür | Anlam değişmemeli, beyan gerekebilir |
| Arama stratejisi ve anahtar kelime önerisi | Genellikle kabul görür | Kaynakları siz bulup okumalısınız |
| Okuduğunuz kaynağı özetleme | Dikkatli kullanılmalı | Özet kaynağa sadık mı, kontrol edin |
| Bölüm taslağı oluşturma | Kuruma göre değişir | Beyan ve yoğun düzeltme gerekir |
| Kaynak, veri veya bulgu üretme | Kabul edilmez | Uydurma, akademik sahtekârlıktır |

Bu tablo genel bir değerlendirmedir; bağlayıcı olan kurumunuzun kuralıdır.

## Danışmanla açık konuşun

Yapay zekâyı hangi aşamada ve nasıl kullanmayı düşündüğünüzü danışmanınızla baştan konuşun. Bazı danışmanlar dil düzeltmeyi serbest bırakırken taslak üretimini istemeyebilir. Bu konuşma, savunmada veya intihal incelemesinde yaşanabilecek sürprizleri önler.

## Savunmada ne sorulabilir?

Yapay zekâ ile yazılmış bir tezin en büyük riski, yazarın metnine hâkim olmamasıdır. Jüri, tezdeki bir kavramı, yöntem kararını veya bir kaynağın bulgusunu sorduğunda cevap veremeyen öğrenci, metni kendisinin yazmadığı izlenimini verir. Tezinizdeki her cümleyi açıklayabilecek durumda olmalısınız. Savunmaya hazırlık için [tez savunması rehberimize](/blog/tez-savunmasina-nasil-hazirlanilir) bakın.

## Kaynak doğrulama alışkanlığı

Yapay zekâ ile çalışırken edinmeniz gereken en önemli alışkanlık her kaynağı doğrulamaktır:

1. Kaynağı bir veri tabanında (DergiPark, Crossref, OpenAlex, Google Scholar) arayın.
2. DOI varsa açın ve künyenin tuttuğunu kontrol edin.
3. Kaynağın gerçekten iddia edilen bilgiyi içerdiğini, ilgili bölümü okuyarak doğrulayın.

Kaynakçanızı toplu kontrol etmek için ücretsiz [uydurma kaynak kontrolü](/araclar/uydurma-kaynak-kontrolu) aracını kullanabilirsiniz.

## Academiana bu ilkeler üzerine kuruldu

Academiana’da asistan sistem düzeyinde kaynak uyduramaz: yalnızca gerçek veri tabanlarından bulunup projenize eklenmiş kaynaklara atıf yapabilir. Kaynağı olmayan kesin iddia yazmaz; veri gereken yerde "[VERİ GİRİLECEK]" işareti bırakır. Hiçbir taslak siz "Belgeye ekle" demeden metninize girmez ve her değişiklik sürüm geçmişinde saklanır. Ayrıntılar için [akademik dürüstlük ilkelerimize](/akademik-durustluk) göz atabilirsiniz.`,
    sources: [
      { text: "Committee on Publication Ethics (COPE). (2023). Authorship and AI tools: COPE position statement.", url: "https://publicationethics.org/" },
      { text: "Hosseini, M., Rasmussen, L. M., & Resnik, D. B. (2023). Using AI to write scholarly publications. Accountability in Research." },
    ],
  },
  {
    slug: "yapay-zeka-tespit-araclari",
    title: "Yapay Zekâ Tespit Araçları Güvenilir mi? Öğrenciler İçin Gerçekler",
    description: "Turnitin ve benzeri yapay zekâ tespit araçları nasıl çalışır, ne kadar güvenilir? Yanlış pozitif sonuç alırsanız ne yapmalısınız? Dürüst bir rehber.",
    category: "Etik ve yapay zekâ",
    keywords: ["yapay zeka tespit", "Turnitin yapay zeka", "AI detector güvenilir mi", "yapay zeka tespitinden kurtulma"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Yazım sürecinizi sürüm geçmişiyle kayıt altında tutun; kendi emeğinizi her zaman gösterebilin.", href: "/kayit", label: "Ücretsiz başla" },
    body: `Pek çok üniversite artık teslim edilen metinleri yapay zekâ tespit araçlarından geçiriyor. Bu da öğrencilerde iki soru doğuruyor: "Bu araçlar nasıl çalışıyor?" ve "Kendi yazdığım metin yanlışlıkla işaretlenirse ne olacak?"

## Tespit araçları nasıl çalışır?

Bu araçlar bir metnin kesin olarak kim tarafından yazıldığını bilemez. Metindeki kelime seçimlerinin ne kadar "tahmin edilebilir" olduğuna, cümle uzunluklarının ne kadar düzenli olduğuna ve benzeri istatistiksel özelliklere bakarak bir **olasılık** tahmini yapar.

## Ne kadar güvenilirler?

- **Yanlış pozitifler olur.** İnsan tarafından yazılmış metinler de yapay zekâ olarak işaretlenebilir. Özellikle kalıplaşmış akademik dil, kısa metinler ve ana dili İngilizce olmayan yazarların İngilizce metinleri bu riske daha açıktır.
- **Sonuçlar araçtan araca değişir.** Aynı metin farklı araçlarda çok farklı skorlar alabilir.
- **Tek başına kanıt değildir.** Pek çok kurum, tespit skorunu tek başına karar gerekçesi olarak kullanmamayı önerir; skor bir inceleme başlatma sinyali olarak değerlendirilir.

## Yanlış pozitif riskine karşı ne yapabilirsiniz?

1. **Yazım sürecinizi belgeleyin.** Taslaklarınız, notlarınız, sürüm geçmişiniz ve okuma kayıtlarınız, metni sizin yazdığınızı gösteren en güçlü kanıttır.
2. **Kendi sesinizi koruyun.** Kendi örneklerinizi, gözlemlerinizi ve çalışmanıza özgü ayrıntıları kullanın.
3. **Kurumunuzun kurallarını bilin.** Yapay zekâ kullandıysanız ve beyan isteniyorsa açıkça beyan edin. Beyan edilmiş, sınırlı ve meşru bir kullanım çoğu zaman sorun yaratmaz.
4. **İtiraz hakkınızı kullanın.** Haksız yere işaretlendiğinizi düşünüyorsanız danışmanınızla görüşün ve süreç kayıtlarınızı sunun.

## "Tespit edilmeyen" metin vaatlerine dikkat

İnternette yapay zekâ metnini "insanlaştıran" veya tespitten "kurtaran" araçlar reklam ediliyor. Bu yaklaşımın iki sorunu var: Birincisi, akademik dürüstlük ihlalini gizlemeye yöneliktir. İkincisi, metni çoğu zaman anlamsız ve bozuk bir dile dönüştürür; jüri bunu kolayca fark eder.

## Doğru yaklaşım

Yapay zekâyı yazarın yerine değil, araştırma ve düzeltme yardımcısı olarak kullanmak. Taslakları okuyup kendi düşüncenizle yeniden yazdığınızda metin hem daha nitelikli olur hem de sizin olur.


## Yanlış pozitif kimleri daha çok etkiler?

Araştırmalar, yapay zekâ tespit araçlarının ana dili İngilizce olmayan yazarların metinlerini daha sık “yapay zekâ üretimi” olarak işaretleyebildiğini göstermiştir. Bunun nedeni, araçların metnin “tahmin edilebilirliğine” bakmasıdır: daha sınırlı kelime dağarcığı ve kalıplaşmış akademik ifadeler kullanan metinler, insan tarafından yazılmış olsa bile yapay zekâ metnine benzetilebilir. Türkçe metinlerde ise bu araçların doğruluğu hakkında yeterli bağımsız çalışma yoktur. Bu nedenle tespit sonucu tek başına bir yaptırım gerekçesi olarak kullanılmamalıdır.

## Tespit skoru ne anlama gelir, ne anlama gelmez?

- **Anlama gelir:** Aracın kendi modeline göre metnin istatistiksel olarak yapay zekâ çıktısına benzediği.
- **Anlama gelmez:** Metnin yapay zekâ ile yazıldığının kanıtı. Skor bir olasılık tahminidir.
- **Anlama gelmez:** İntihal. Tespit araçları kaynak eşleştirmesi yapmaz; benzerlik raporundan farklıdır. Benzerlik raporunun nasıl okunacağını [intihal rehberimizde](/blog/intihal-nasil-onlenir) anlattık.

## Yazım sürecinizi belgelemek

Bir tespit aracının yanlış işaretlemesine karşı en güçlü savunma, yazım sürecinizi gösterebilmektir:

- **Sürüm geçmişi:** Word, Google Dokümanlar veya kullandığınız editörün sürüm geçmişi, metnin zaman içinde nasıl geliştiğini gösterir.
- **Notlar ve taslaklar:** Okuma notlarınız, literatür matrisiniz ve el yazısı taslaklarınız saklayın.
- **Kaynak kayıtları:** Kaynak yönetim programınızdaki kayıt tarihleri, kaynakları ne zaman bulduğunuzu gösterir.
- **Danışman yazışmaları:** Bölüm bölüm gönderdiğiniz taslaklar ve aldığınız geri bildirimler.

## Kurumlar için öneriler

Tespit araçlarını kullanan bir enstitü veya öğretim üyesiyseniz:

- Skoru tek başına karar gerekçesi yapmayın; öğrenciyle görüşme ve süreç belgeleriyle birlikte değerlendirin.
- Yapay zekâ kullanım politikanızı açıkça yazın: neye izin verildiğini, neyin beyan edilmesi gerektiğini belirtin.
- Değerlendirmede metnin içeriğine hâkimiyeti ölçen yöntemler (sözlü sunum, savunma, süreç dosyası) kullanın.

## Öğrenciler için kısa yol haritası

1. Kurumunuzun yapay zekâ politikasını okuyun.
2. Kullandığınız aracı ve amacını not edin; gerekiyorsa beyan edin. Beyanın nasıl yazılacağını [yapay zekâ etiği rehberimizde](/blog/yapay-zeka-ile-tez-yazmak-etik-mi) anlattık.
3. Metninizi kendi sözlerinizle yazın ve her kaynağı okuyun.
4. Sürüm geçmişinizi ve notlarınızı saklayın.
5. Bir işaretleme olursa sakin kalın; süreç belgelerinizle görüşmeye gidin.

## Academiana’nın tutumu

Academiana tespit araçlarını atlatmaya yönelik bir özellik sunmaz ve böyle bir vaatte bulunmaz. Bunun yerine sürecin şeffaf olmasını sağlar: her asistan eklemesinden önceki hâl ve elle kaydettiğiniz sürümler geçmişte saklanır, böylece metninizin nasıl geliştiğini her zaman gösterebilirsiniz. Asistanın önerileri yalnızca siz eklediğinizde metne girer.`,
    sources: [
      { text: "Liang, W., Yuksekgonul, M., Mao, Y., Wu, E., & Zou, J. (2023). GPT detectors are biased against non-native English writers. Patterns, 4(7), 100779." },
      { text: "Weber-Wulff, D., Anohina-Naumeca, A., Bjelobaba, S., Foltýnek, T., Guerrero-Dib, J., Popoola, O., Šigut, P., & Waddington, L. (2023). Testing of detection tools for AI-generated text. International Journal for Educational Integrity, 19, 26." },
    ],
  },
];
