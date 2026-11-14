/**
 * Film (D194): asistanın bölüm bölüm yazdığı metinler. Gerçek sistemde bu metinleri yapay zekâ, kurgu ve
 * kütüphanedeki kaynaklarla üretir; filmde API anahtarı tarayıcıya konamayacağı için önceden yazılmıştır.
 * Kurallar gerçek sistemle aynıdır: yalnızca projedeki kaynaklara [[kaynak:Sx]] ile atıf, bilinmeyen bilgi [VERİ GİRİLECEK].
 * Bulgu ve özetteki sayılar, sitenin istatistik motorunun filmDataset() üzerinde hesapladığı değerlerdir.
 */
export const INTRO: Record<string, string> = {
  draft: "Kurgudaki plana ve kütüphanenizdeki kaynaklara göre bölümü yazdım. Atıflar yalnızca projedeki kaynaklardan; doğrudan alıntılarda tam metni okunan kaynağın sayfası var.",
  hypotheses: "Amaç ve kavramsal çerçeveyle uyumlu, sınanabilir hipotezler önerdim. Her biri bir analizle eşleşiyor.",
  synthesize: "Kaynakları tek tek özetlemek yerine temalara göre sentezledim; uyuşan ve ayrışan bulguları birlikte verdim.",
  methodology: "Yöntem kararlarını araştırma sorularına dayanarak gerekçelendirdim.",
  interpret: "Eklediğiniz analiz çıktılarını hipotez sırasıyla yorumladım; sayılar tablolardakiyle aynı, yeni değer üretilmedi.",
  discussion: "Her temel bulguyu ilgili hipotez ve literatürle karşılaştırdım; kuramsal çerçeveye geri döndüm.",
  abstract: "Özet ve Abstract’ı yalnızca yazılmış bölümlerden derledim; metinde olmayan hiçbir bilgi eklenmedi.",
};

export const ANSWERS: Record<string, { action: string; text: string }> = {
  front_matter: { action: "draft", text: `## Önsöz

Bu tez çalışması, üniversite öğrencilerinin akıllı telefon kullanım alışkanlıklarının akademik yaşamları ve uyku düzenleriyle nasıl ilişkili olduğunu anlamaya yönelik bir merakın ürünüdür. Çalışmanın her aşamasında yol gösteren danışmanıma, ölçme araçlarının kullanımına izin veren araştırmacılara ve gönüllü olarak katılan öğrencilere teşekkür ederim.

Elif Aydın, Haziran 2026` },

  topic: { action: "draft", text: `Bu çalışmanın konusu, üniversite öğrencilerinde akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi arasındaki ilişkilerdir. Akıllı telefonlar öğrencilerin gündelik yaşamının ve akademik çalışmalarının ayrılmaz bir parçası hâline gelmiş; ancak günlük kullanım süresi uzadıkça bağımlılık belirtileri de belirginleşmiştir [[kaynak:S1]].

Gece yatmadan önceki telefon kullanımının uykuya dalma süresini uzattığı ve öznel uyku kalitesini düşürdüğü [[kaynak:S3]], problemli telefon kullanımının akademik ertelemeyle orta düzeyde ilişkili olduğu [[kaynak:S5]] bilinmektedir. Bu bulgular, üç değişkenin ayrı ayrı değil, aynı model içinde birlikte ele alınmasını gerekli kılmaktadır. Konu, öğrencilerin hem akademik işlevselliğini hem de sağlığını doğrudan ilgilendirdiği için seçilmiştir.` },

  problem: { action: "draft", text: `Akıllı telefon, iletişimden ders materyallerine erişime kadar pek çok işlevi tek cihazda topladığı için üniversite öğrencilerinin günün büyük bölümünde elinin altındadır. Kullanımın kontrol edilemediği, bırakıldığında huzursuzluk yaşandığı ve günlük işlevselliğin aksadığı durumlar akıllı telefon bağımlılığı olarak tanımlanmaktadır [[kaynak:S1]].

Akademik erteleme ise öğrencinin yapması gereken bir akademik görevi, olumsuz sonuçlarını bildiği hâlde gereksiz yere geciktirmesidir [[kaynak:S2|s. 24]]. Meta-analitik bulgular, problemli telefon kullanımı ile akademik erteleme arasında orta düzeyde pozitif bir ilişki olduğunu ve bu ilişkinin üniversite öğrencilerinde daha güçlü göründüğünü ortaya koymaktadır [[kaynak:S5]].

Telefon kullanımının etkisi yalnızca gündüzle sınırlı değildir. Yatmadan önceki kullanım uykuya dalmayı geciktirmekte [[kaynak:S3]], gece ekran kullananlarda uyku kalitesi puanları daha kötü bulunmaktadır [[kaynak:S4]]. Uyku kalitesi düşük öğrenciler de akademik görevlere başlamakta ve düzenli çalışmakta daha fazla güçlük yaşamaktadır [[kaynak:S8]].

Bu ilişkiler literatürde çoğunlukla ikili olarak incelenmiştir. Akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesinin, günlük ekran süresi kontrol edilerek aynı örneklemde birlikte ele alındığı çalışmalar sınırlıdır. Bu nedenle araştırmanın problemi şöyle ifade edilmiştir: Üniversite öğrencilerinde akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi arasında nasıl bir ilişki vardır?` },

  purpose: { action: "draft", text: `## Araştırmanın amacı

Bu araştırmanın genel amacı, üniversite öğrencilerinde akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi arasındaki ilişkileri incelemek ve akıllı telefon bağımlılığı ile akademik ertelemenin, günlük ekran süresi kontrol edildiğinde uyku kalitesini yordayıp yordamadığını belirlemektir. Bu genel amaç doğrultusunda değişkenlerin cinsiyet ve sınıf düzeyine göre farklılaşıp farklılaşmadığı da incelenmiştir.

## Araştırmanın önemi

Bağımlılık ve erteleme arasındaki ilişki meta-analitik olarak gösterilmiş olsa da [[kaynak:S5]], uyku kalitesinin bu ilişkiyle birlikte ele alındığı çalışmalar sınırlıdır. Uyku sorunlarının akademik işlevselliği bozduğu düşünüldüğünde [[kaynak:S8]], üç değişkeni aynı modelde incelemek öğrenci danışmanlığı ve önleyici programlar için daha bütüncül bir bakış sunacaktır. Araştırmanın bulgularının, üniversitelerin psikolojik danışma birimlerine dijital alışkanlıklar ve uyku hijyeni konusunda kanıta dayalı öneriler sağlaması beklenmektedir.` },

  questions: { action: "hypotheses", text: `Hipotezler, alanyazındaki bulgular [[kaynak:S5]] ve öz düzenleme yaklaşımı [[kaynak:S6]] doğrultusunda oluşturulmuştur. Pittsburgh Uyku Kalitesi İndeksinde (PUKİ) yüksek puan kötü uyku kalitesini gösterdiği için, uyku kalitesiyle ilgili hipotezler PUKİ puanları üzerinden ifade edilmiştir.

**H1:** Akıllı telefon bağımlılığı ile akademik erteleme arasında pozitif yönde anlamlı bir ilişki vardır.

**H2:** Akıllı telefon bağımlılığı ile PUKİ puanları arasında pozitif yönde anlamlı bir ilişki vardır.

**H3:** Akademik erteleme ile PUKİ puanları arasında pozitif yönde anlamlı bir ilişki vardır.

**H4:** Akıllı telefon bağımlılığı ve akademik erteleme, günlük ekran süresi kontrol edildiğinde PUKİ puanlarını anlamlı biçimde yordar.

**H5:** Akıllı telefon bağımlılığı puanları cinsiyete göre anlamlı biçimde farklılaşır.

**H6:** Akademik erteleme puanları sınıf düzeyine göre anlamlı biçimde farklılaşır.` },

  scope_limits: { action: "draft", text: `## Varsayımlar

Katılımcıların ölçme araçlarını içtenlikle ve kendi durumlarını yansıtacak biçimde yanıtladıkları varsayılmıştır.

## Sınırlılıklar

Araştırma, 2025–2026 eğitim-öğretim yılı bahar döneminde tek bir devlet üniversitesinde öğrenim gören 384 lisans öğrencisiyle sınırlıdır. Veriler öz bildirime dayalı ölçeklerle toplandığından sosyal beğenirlik etkisi göz ardı edilemez. İlişkisel tarama deseni nedensel çıkarım yapılmasına olanak vermez.

## Tanımlar

**Akıllı telefon bağımlılığı:** Akıllı telefon kullanımının kontrol edilememesi ve günlük işlevselliği aksatması [[kaynak:S1]].

**Akademik erteleme:** Akademik bir görevin, olumsuz sonuçları bilindiği hâlde gereksiz yere geciktirilmesi [[kaynak:S2|s. 24]].

**Uyku kalitesi:** Bireyin son bir aydaki öznel uyku değerlendirmesi; bu çalışmada PUKİ küresel puanıyla ölçülmüştür.` },

  concepts: { action: "draft", text: `## Akıllı telefon bağımlılığı

Akıllı telefon bağımlılığı, davranışsal bağımlılıklar içinde ele alınan; kullanımın kontrol edilememesi, cihazdan uzak kalındığında huzursuzluk yaşanması ve kullanımın günlük işlevleri aksatmasıyla tanımlanan bir örüntüdür. Üniversite öğrencileri üzerinde yapılan çalışmalar, günlük kullanım süresinin bağımlılığın en güçlü yordayıcısı olduğunu ve bağımlılık arttıkça yaşam doyumunun azaldığını göstermektedir [[kaynak:S1]].

## Akademik erteleme

Akademik erteleme, öğrencinin akademik bir görevi olumsuz sonuçlarını bildiği hâlde gereksiz yere geciktirmesi olarak tanımlanır [[kaynak:S2|s. 24]]. Güncel yaklaşımlar ertelemeyi bir zaman yönetimi sorunundan çok, öz düzenleme başarısızlığı olarak açıklamaktadır [[kaynak:S2]]. Bu bakış açısı, ertelemenin dikkat dağıtıcı uyaranlarla ilişkisini anlamak için önemli bir çerçeve sunar.

## Uyku kalitesi

Uyku kalitesi; uykuya dalma süresi, uyku süresi, uyku etkinliği ve gün içi işlevsellik gibi bileşenleri kapsayan çok boyutlu bir kavramdır. Bu çalışmada uyku kalitesi, yedi bileşenden oluşan ve küresel puanı 0–21 arasında değişen Pittsburgh Uyku Kalitesi İndeksiyle değerlendirilmiştir; puanın artması uyku kalitesinin kötüleştiğini gösterir.` },

  theory: { action: "draft", text: `Araştırmanın kuramsal temelini öz düzenleme yaklaşımı oluşturmaktadır. Bu yaklaşıma göre birey, uzun vadeli hedeflerine ulaşmak için dikkatini, duygularını ve davranışlarını izler ve düzenler; bu düzenleme kapasitesi sınırlıdır ve anlık ödül sunan uyaranlar karşısında kolayca tükenebilir [[kaynak:S6]].

Dijital ortamlar, sürekli bildirim ve kısa süreli ödüllerle öz düzenleme kapasitesini en sık zorlayan uyaranlar arasındadır [[kaynak:S9]]. Bu çerçevede akıllı telefon bağımlılığı, dikkatin akademik görevlerden kolayca uzaklaşmasına; akademik erteleme ise öz düzenlemenin görev başlatma aşamasındaki başarısızlığına karşılık gelmektedir [[kaynak:S2]].

Gelişmeleri kaçırma kaygısının gece telefon kontrolünü artırdığına ve bunun uyku bozukluklarıyla ilişkili olduğuna dair bulgular [[kaynak:S7]], öz düzenleme güçlüğünün gece saatlerine de uzandığını düşündürmektedir. Kuramsal model, bu nedenle akıllı telefon bağımlılığı ve akademik ertelemenin uyku kalitesiyle birlikte ele alınmasını öngörmektedir.` },

  literature: { action: "synthesize", text: `## Akıllı telefon bağımlılığı ve akademik erteleme

Literatürde akıllı telefon kullanımı ile akademik erteleme arasındaki ilişki tutarlı biçimde pozitif bulunmaktadır. 31 çalışmayı kapsayan bir meta-analiz, problemli telefon kullanımı ile akademik erteleme arasında orta düzeyde bir ilişki (r = .34) bildirmiş ve bu ilişkinin üniversite öğrencilerinde daha güçlü olduğunu göstermiştir [[kaynak:S5]]. Türkiye’de üniversite öğrencileriyle yapılan çalışmalarda da günlük kullanım süresinin bağımlılığın en güçlü yordayıcısı olduğu görülmüştür [[kaynak:S1]].

## Akıllı telefon kullanımı ve uyku

İkinci tema telefon kullanımının uyku üzerindeki etkisidir. Yatmadan önceki bir saatte telefon kullanan öğrencilerde uykuya dalma süresi uzamakta ve öznel uyku kalitesi düşmektedir; üstelik bu ilişki günlük toplam ekran süresinden bağımsızdır [[kaynak:S3]]. Gece ekran kullanan genç yetişkinlerde PUKİ puanlarının anlamlı biçimde daha yüksek olduğu bulunmuştur [[kaynak:S4]]. Gelişmeleri kaçırma kaygısının gece telefon kontrolünü ve buna bağlı uyku bozukluklarını artırdığı da gösterilmiştir [[kaynak:S7]].

## Uyku ve akademik işlevsellik

Üçüncü tema, uyku ile akademik davranış arasındaki ilişkidir. Uyku kalitesi kötü olan öğrenciler dikkat, ders çalışma düzeni ve görevlere başlama konusunda daha fazla güçlük yaşamakta; uyku sorunları erteleme davranışıyla birlikte artmaktadır [[kaynak:S8]].

## Değerlendirme

Literatür, üç değişkenin ikili ilişkilerini desteklemekle birlikte bu ilişkileri aynı modelde ve günlük ekran süresini kontrol ederek inceleyen çalışmaların sınırlı olduğunu göstermektedir. Ekran süresinin kendisinin mi, yoksa kullanımın kontrolsüz niteliğinin mi uykuyla ilişkili olduğu sorusu da yanıt beklemektedir [[kaynak:S3]].` },

  gaps: { action: "draft", text: `Literatür taraması üç boşluğa işaret etmektedir. Birincisi, akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi çoğunlukla ikili ilişkiler hâlinde incelenmiştir [[kaynak:S5]]. İkincisi, günlük ekran süresi kontrol edildiğinde bağımlılığın uyku kalitesiyle ilişkisinin sürüp sürmediği yeterince açık değildir [[kaynak:S3]]. Üçüncüsü, Türkiye’deki üniversite öğrencileriyle yapılan çalışmalar daha çok bağımlılığın yaşam doyumu gibi genel sonuçlarına odaklanmıştır [[kaynak:S1]]. Bu araştırma, üç değişkeni ekran süresini kontrol ederek aynı modelde inceleyerek bu boşlukları kapatmayı amaçlamaktadır. Gelecek araştırmalarda boylamsal desenlerle değişkenler arasındaki zamansal sıranın sınanması önerilmektedir.` },

  method: { action: "methodology", text: `Bu araştırma, nicel araştırma yaklaşımına dayalı ilişkisel tarama modelinde desenlenmiştir. İlişkisel tarama modeli, iki ya da daha fazla değişken arasındaki birlikte değişimin varlığını ve derecesini belirlemeyi amaçlar [[kaynak:S13]]. Araştırmanın amacı akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi arasındaki ilişkileri ve bu değişkenlerin yordayıcılığını incelemek olduğundan bu model uygun görülmüştür. Değişkenler arasında herhangi bir müdahale yapılmamış; veriler tek bir zaman noktasında toplanmıştır. Bu nedenle bulgular ilişki düzeyinde yorumlanmış, nedensel çıkarım yapılmamıştır.` },

  sample: { action: "draft", text: `Araştırmanın evrenini 2025–2026 eğitim-öğretim yılı bahar döneminde Örnek Üniversitesinde öğrenim gören lisans öğrencileri oluşturmaktadır. Örneklem, her sınıf düzeyinden eşit sayıda öğrenciye ulaşılacak biçimde kolay örnekleme yöntemiyle belirlenmiştir.

Gerekli örneklem büyüklüğü güç analiziyle hesaplanmıştır: üç yordayıcılı çoklu regresyonda orta etki büyüklüğü (f² = .15), .05 anlamlılık düzeyi ve .95 istatistiksel güç için en az 119 katılımcı gerekmektedir [[kaynak:S14]]. Araştırmaya 384 öğrenci katılmış; bu sayı gerekli büyüklüğün oldukça üzerindedir.

Katılımcıların 220’si (%57,3) kadın, 164’ü (%42,7) erkektir. Her sınıf düzeyinden 96 öğrenci (%25) yer almıştır. Katılımcıların günlük ortalama akıllı telefon kullanım süresi 5,22 saattir (SS = 1,83).` },

  instruments: { action: "draft", text: `## Kişisel bilgi formu

Araştırmacı tarafından hazırlanan formda cinsiyet, sınıf düzeyi ve günlük ortalama akıllı telefon kullanım süresine (saat) ilişkin sorular yer almaktadır.

## Akıllı Telefon Bağımlılığı Ölçeği – Kısa Form

On maddeden oluşan ölçek altılı derecelendirme ölçeğiyle yanıtlanmaktadır. Türkçe formun tek faktörlü yapısı doğrulayıcı faktör analiziyle desteklenmiş ve iç tutarlılık katsayısı .89 olarak bulunmuştur [[kaynak:S10|s. 148]]. Puanların artması bağımlılık düzeyinin arttığını gösterir.

## Akademik Erteleme Ölçeği

Beş maddelik ölçeğin Türkçe uyarlamasında tek boyutlu yapı doğrulanmış; Cronbach alfa katsayısı .86, test-tekrar test güvenirliği .81 olarak hesaplanmıştır [[kaynak:S11|s. 95]].

## Pittsburgh Uyku Kalitesi İndeksi

İndeks yedi bileşenden oluşmakta, küresel puan 0–21 arasında değişmektedir; yüksek puan kötü uyku kalitesini gösterir [[kaynak:S12|s. 304]]. Türkçe formun iç tutarlılık katsayısı .80’dir [[kaynak:S12]].

## Bu çalışmadaki güvenirlik

Ölçeklerin bu örneklemdeki iç tutarlılık katsayıları aşağıda sunulmuştur.` },

  analysis: { action: "methodology", text: `Veriler analiz edilmeden önce eksik ve hatalı girişler kontrol edilmiş, eksik verisi olan form bulunmamıştır. Ölçek puanları madde ortalamaları alınarak hesaplanmıştır. Normallik varsayımı çarpıklık ve basıklık değerleriyle incelenmiş; ±1,5 aralığındaki değerler normal dağılımdan aşırı sapma olmadığı biçiminde yorumlanmıştır [[kaynak:S14]].

Değişkenler arasındaki ilişkiler Pearson korelasyon analiziyle (H1–H3), akıllı telefon bağımlılığı ve akademik ertelemenin uyku kalitesini yordayıcılığı ekran süresi kontrol edilerek çoklu doğrusal regresyon analiziyle (H4) incelenmiştir. Cinsiyete göre fark bağımsız örneklemler t testiyle (H5), sınıf düzeyine göre fark tek yönlü varyans analiziyle (H6) sınanmıştır. Etki büyüklükleri Cohen d ve η² ile raporlanmış, anlamlılık düzeyi .05 olarak alınmıştır.` },

  ethics: { action: "draft", text: `Araştırma için Örnek Üniversitesi Sosyal ve Beşeri Bilimler Etik Kurulundan onay alınmıştır [VERİ GİRİLECEK: etik kurul karar tarihi ve sayısı]. Ölçeklerin kullanımı için geliştiren veya uyarlayan araştırmacılardan izin alınmıştır. Katılımcılara araştırmanın amacı açıklanmış, katılımın gönüllü olduğu ve istedikleri an ayrılabilecekleri bildirilmiş; bilgilendirilmiş onamları alınmıştır. Formlarda ad veya öğrenci numarası istenmemiş, veriler anonim olarak saklanmıştır.` },

  findings: { action: "interpret", text: `## Hipotez testlerinin özeti

Korelasyon analizi sonuçlarına göre akıllı telefon bağımlılığı ile akademik erteleme arasında orta düzeyde pozitif ve anlamlı bir ilişki vardır, r(382) = .39, p < .001; H1 desteklenmiştir. Akıllı telefon bağımlılığı ile PUKİ puanları arasında güçlü ve pozitif bir ilişki bulunmuştur, r(382) = .53, p < .001; H2 desteklenmiştir. Akademik erteleme ile PUKİ puanları arasındaki ilişki de pozitif ve anlamlıdır, r(382) = .49, p < .001; H3 desteklenmiştir.

Regresyon modeli anlamlıdır ve PUKİ puanlarındaki varyansın %37,4’ünü açıklamaktadır, F(3, 380) = 75.70, p < .001. Akıllı telefon bağımlılığı (β = .39) ve akademik erteleme (β = .33) anlamlı yordayıcılardır; ekran süresi ise diğer değişkenler kontrol edildiğinde anlamlı bir yordayıcı değildir (β = .02, p = .695). H4 desteklenmiştir.

Kadın öğrencilerin akıllı telefon bağımlılığı puanları erkek öğrencilerden anlamlı biçimde yüksektir, t(382) = -2.33, p = .020, d = 0.24; etki küçüktür ve H5 desteklenmiştir. Akademik erteleme puanları sınıf düzeyine göre farklılaşmaktadır, F(3, 380) = 3.86, p = .010, η² = .03; dördüncü sınıf öğrencilerinin erteleme puanları en düşüktür. H6 desteklenmiştir.` },

  discussion: { action: "discussion", text: `## Akıllı telefon bağımlılığı ve akademik erteleme

Araştırmada akıllı telefon bağımlılığı ile akademik erteleme arasında orta düzeyde pozitif bir ilişki bulunmuştur (r = .39). Bu bulgu, problemli telefon kullanımı ile erteleme arasındaki ilişkiyi r = .34 olarak bildiren meta-analizle büyük ölçüde örtüşmektedir [[kaynak:S5]]. İlişkinin meta-analitik ortalamadan biraz daha güçlü çıkması, meta-analizde de vurgulanan üniversite öğrencilerindeki daha güçlü etkiyle tutarlıdır [[kaynak:S5]]. Öz düzenleme yaklaşımı açısından bu sonuç, anlık ödül sunan dijital uyaranların görev başlatma aşamasındaki öz düzenlemeyi zorladığı görüşünü desteklemektedir [[kaynak:S2]].

## Akıllı telefon bağımlılığı, erteleme ve uyku kalitesi

Akıllı telefon bağımlılığı uyku kalitesindeki bozulmanın en güçlü yordayıcısıdır (β = .39). Ekran süresinin, bağımlılık ve erteleme kontrol edildiğinde anlamlı bir yordayıcı olmaması dikkat çekicidir. Bu sonuç, telefon kullanımının uykuyla ilişkisinin toplam süreden bağımsız olduğunu gösteren bulguyla uyumludur [[kaynak:S3]] ve sorunun kullanım süresinden çok kullanımın kontrolsüz niteliğinde olduğunu düşündürmektedir. Gece ekran kullananlarda PUKİ puanlarının daha yüksek bulunması [[kaynak:S4]] ve gelişmeleri kaçırma kaygısının gece telefon kontrolünü artırması [[kaynak:S7]] bu yorumu desteklemektedir.

Akademik ertelemenin de uyku kalitesini anlamlı biçimde yordaması (β = .33), uyku sorunları ile erteleme davranışının birlikte arttığını gösteren bulguyla tutarlıdır [[kaynak:S8]]. Ertelenen görevlerin gece saatlerine kayması, bu ilişkinin olası bir açıklaması olabilir; ancak ilişkisel desen nedeniyle bu yorum sınanmamıştır.

## Cinsiyet ve sınıf düzeyine göre farklılıklar

Kadın öğrencilerin bağımlılık puanlarının daha yüksek olması, etki büyüklüğü küçük olduğundan (d = 0.24) temkinle yorumlanmalıdır. Dördüncü sınıf öğrencilerinde ertelemenin daha düşük olması, mezuniyet aşamasındaki dışsal son tarihlerin görev başlatmayı kolaylaştırmasıyla açıklanabilir; bu açıklama gelecek çalışmalarda sınanmalıdır.` },

  conclusion: { action: "draft", text: `## Sonuç

Bu araştırmada üniversite öğrencilerinde akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi arasındaki ilişkiler incelenmiştir. Bağımlılık ile erteleme arasında orta düzeyde, her iki değişken ile kötü uyku kalitesi arasında ise orta ile güçlü düzeyde pozitif ilişkiler bulunmuştur. Akıllı telefon bağımlılığı ve akademik erteleme, uyku kalitesindeki varyansın yaklaşık üçte birini açıklamaktadır; günlük ekran süresi bu değişkenler kontrol edildiğinde anlamlı bir yordayıcı değildir. Bulgular, uyku açısından belirleyici olanın telefon kullanım süresinden çok kullanımın kontrolsüz niteliği olduğunu göstermektedir.

## Öneriler

**Uygulamaya yönelik:** Üniversitelerin psikolojik danışma birimlerinde dijital öz düzenleme ve uyku hijyenini birlikte ele alan grup çalışmaları planlanabilir. Kullanım süresini kısıtlamaya odaklanan müdahaleler yerine kontrol kaybını ve gece kullanımını hedefleyen programlar önerilmektedir.

**Araştırmaya yönelik:** Değişkenler arasındaki zamansal sıranın boylamsal desenlerle sınanması, uyku kalitesinin akıllı saat gibi nesnel ölçümlerle desteklenmesi ve farklı üniversitelerden örneklemlerle bulguların genellenebilirliğinin incelenmesi önerilmektedir.` },

  title_abstract: { action: "abstract", text: `## Özet

Bu araştırmada üniversite öğrencilerinde akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi arasındaki ilişkiler incelenmiştir. İlişkisel tarama modelindeki araştırmaya 384 lisans öğrencisi katılmıştır. Veriler Akıllı Telefon Bağımlılığı Ölçeği – Kısa Form, Akademik Erteleme Ölçeği ve Pittsburgh Uyku Kalitesi İndeksiyle toplanmıştır. Akıllı telefon bağımlılığı ile akademik erteleme arasında orta düzeyde (r = .39), her iki değişken ile kötü uyku kalitesi arasında orta ile güçlü düzeyde (r = .53; r = .49) pozitif ilişkiler bulunmuştur. Bağımlılık ve erteleme, ekran süresi kontrol edildiğinde uyku kalitesindeki varyansın %37,4’ünü açıklamış; ekran süresi anlamlı bir yordayıcı olmamıştır. Kadın öğrencilerin bağımlılık puanları daha yüksek, dördüncü sınıf öğrencilerinin erteleme puanları daha düşüktür. Bulgular, uyku açısından belirleyici olanın kullanım süresinden çok kullanımın kontrolsüz niteliği olduğunu göstermektedir.

**Anahtar Kelimeler:** akıllı telefon bağımlılığı, akademik erteleme, uyku kalitesi, üniversite öğrencileri

## Abstract

This study examined the relationships among smartphone addiction, academic procrastination and sleep quality in university students. A total of 384 undergraduates took part in this correlational survey. Data were collected with the Smartphone Addiction Scale – Short Form, the Academic Procrastination Scale and the Pittsburgh Sleep Quality Index. Smartphone addiction was moderately related to academic procrastination (r = .39), and both were related to poorer sleep quality (r = .53; r = .49). Controlling for screen time, addiction and procrastination explained 37.4% of the variance in sleep quality, while screen time was not a significant predictor. Female students reported higher addiction scores and fourth-year students reported lower procrastination. The findings suggest that the uncontrolled nature of use, rather than its duration, matters for sleep.

**Keywords:** smartphone addiction, academic procrastination, sleep quality, university students` },
};

export const TITLES = [
  { title: "Üniversite Öğrencilerinde Akıllı Telefon Bağımlılığı, Akademik Erteleme ve Uyku Kalitesi Arasındaki İlişkiler", note: "Üç değişkeni ve örneklemi açıkça söylüyor; ilişkisel desene uygun." },
  { title: "Akıllı Telefon Bağımlılığı ve Akademik Ertelemenin Uyku Kalitesini Yordama Gücü", note: "Regresyon odaklı; yordayıcı değişkenleri öne çıkarıyor." },
  { title: "Ekranın Ötesinde: Üniversite Öğrencilerinde Kontrolsüz Telefon Kullanımı, Erteleme ve Uyku", note: "Dikkat çekici; tez başlığında alt başlıkla dengelenmeli." },
  { title: "Üniversite Öğrencilerinde Dijital Öz Düzenleme Güçlükleri ve Uyku Kalitesi", note: "Kuramsal çerçeveyi yansıtıyor; değişken adları dolaylı." },
];

export const BLUEPRINT = {
  problem: "Üniversite öğrencilerinde akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi literatürde çoğunlukla ikili ilişkiler olarak incelenmiş; üçünün ekran süresi kontrol edilerek aynı modelde ele alındığı çalışmalar sınırlıdır.",
  aim: "Akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi arasındaki ilişkileri incelemek; bağımlılık ve ertelemenin ekran süresi kontrol edildiğinde uyku kalitesini yordayıp yordamadığını belirlemek.",
  method: "Nicel araştırma; ilişkisel tarama modeli. Veriler tek zaman noktasında, çevrim içi formla toplanacak.",
  sample: "Bir devlet üniversitesinin lisans öğrencileri; her sınıftan eşit sayıda, kolay örnekleme. Güç analizine göre en az 119; hedef 380 ve üzeri.",
  data: "Kişisel bilgi formu (cinsiyet, sınıf, günlük ekran süresi), Akıllı Telefon Bağımlılığı Ölçeği – Kısa Form, Akademik Erteleme Ölçeği, Pittsburgh Uyku Kalitesi İndeksi.",
  analysis: "Betimsel istatistikler ve normallik; Cronbach alfa; Pearson korelasyonu; çoklu doğrusal regresyon; bağımsız örneklemler t testi; tek yönlü ANOVA.",
  contribution: "Psikolojik danışma birimlerine dijital öz düzenleme ve uyku hijyenini birlikte ele alan kanıta dayalı öneriler.",
  questions: [
    "Akıllı telefon bağımlılığı ile akademik erteleme arasında anlamlı bir ilişki var mıdır?",
    "Akıllı telefon bağımlılığı ve akademik erteleme ile uyku kalitesi arasında anlamlı ilişkiler var mıdır?",
    "Bağımlılık ve erteleme, ekran süresi kontrol edildiğinde uyku kalitesini yordamakta mıdır?",
    "Değişkenler cinsiyete ve sınıf düzeyine göre farklılaşmakta mıdır?",
  ],
  plans: {
    topic: ["Konunun güncelliği ve neden seçildiği", 90],
    problem: ["Üç değişkenin tanımı, ikili ilişkiler ve problem cümlesi", 170],
    purpose: ["Genel amaç, alt amaçlar ve önem", 110],
    questions: ["Altı hipotez; her biri bir analizle eşleşir", 100],
    scope_limits: ["Varsayımlar, sınırlılıklar ve tanımlar", 90],
    concepts: ["Bağımlılık, erteleme ve uyku kalitesi kavramları", 140],
    theory: ["Öz düzenleme yaklaşımı ve modelin gerekçesi", 110],
    literature: ["Üç tema: bağımlılık–erteleme, telefon–uyku, uyku–akademik işlevsellik", 200],
    gaps: ["İkili ilişkilerin ötesine geçme gereği", 75],
    method: ["İlişkisel tarama modeli ve gerekçesi", 70],
    sample: ["Evren, örneklem, güç analizi, katılımcı özellikleri", 95],
    instruments: ["Kişisel bilgi formu ve üç ölçek; güvenirlik", 290],
    analysis: ["Varsayımlar ve hipotez–analiz eşleşmesi", 95],
    ethics: ["Etik kurul, izinler, gizlilik", 55],
    findings: ["Betimsel istatistikler, güvenirlik, H1–H6 sınamaları; tablo ve şekiller", 800],
    discussion: ["Bulguların literatür ve kuramla karşılaştırılması", 230],
    conclusion: ["Sonuç ve uygulamaya/araştırmaya yönelik öneriler", 130],
    title_abstract: ["Özet ve Abstract (150–250 kelime)", 250],
  } as Record<string, [string, number]>,
};

export const DEFENSE_QUESTIONS = [
  { q: "Ekran süresinin regresyonda anlamlı çıkmamasını nasıl yorumluyorsunuz? Bu, telefon kullanımının uykuyu etkilemediği anlamına mı geliyor?", category: "Bulgular", why: "Tezin en dikkat çekici bulgusu; jüri yorumun sınırlarını görmek ister." },
  { q: "Kolay örnekleme ve tek üniversite, bulgularınızın genellenebilirliğini nasıl etkiliyor?", category: "Yöntem", why: "Örneklem tercihi her savunmada sorulur." },
  { q: "İlişkisel desenle 'yordama' kavramını kullanmanız nedensellik çağrışımı yaratmıyor mu?", category: "Yöntem", why: "Nedensellik dili yaygın bir eleştiri konusudur." },
];
export const DEFENSE_ANSWER = "Hayır, telefon kullanımının uykuyla ilişkisiz olduğu anlamına gelmiyor. Ekran süresi tek başına uyku kalitesiyle ilişkili; ancak bağımlılık ve erteleme modele girdiğinde katkısı kayboluyor. Bu da belirleyici olanın sürenin kendisinden çok kullanımın kontrolsüz niteliği olduğunu düşündürüyor. Literatürdeki bulgu da ilişkinin toplam süreden bağımsız olduğunu gösteriyor.";
export const DEFENSE_FEEDBACK = {
  score: 4,
  strengths: ["Sonucu doğru yorumluyor ve aşırı genellemeden kaçınıyorsunuz.", "Literatürle bağlantı kuruyorsunuz."],
  improvements: ["Ekran süresinin tek başına korelasyonunu (r = .33) sayıyla belirtin.", "İlişkisel desen nedeniyle bunun bir aracılık testi olmadığını ekleyin."],
  outline: ["Ekran süresi tek başına ilişkili (r = .33)", "Bağımlılık ve erteleme kontrol edilince katkısı yok (β = .02)", "Yorum: kullanımın niteliği belirleyici", "Sınırlılık: aracılık sınanmadı"],
  followUp: "Aracılık analizi yapsaydınız hangi modeli kurardınız?",
};
