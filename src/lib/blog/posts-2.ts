import type { BlogPost } from "./types";

export const POSTS_2: BlogPost[] = [
  {
    slug: "tez-onerisi-nasil-hazirlanir",
    title: "Tez Önerisi Nasıl Hazırlanır? Komisyonun Onaylayacağı Bir Öneri",
    description: "Yüksek lisans ve doktora tez önerisi (proposal) bölümleri, yazım ipuçları ve tez izleme komitesinin en çok dikkat ettiği noktalar.",
    category: "Tez yazımı",
    keywords: ["tez önerisi nasıl yazılır", "tez önerisi örneği", "research proposal", "tez izleme komitesi"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Araştırma önerisi çalışma türüyle bölümler hazır gelsin; amaç, yöntem ve takvimi adım adım yazın.", href: "/kayit", label: "Önerimi hazırla" },
    body: `Tez önerisi, yapacağınız araştırmanın planıdır. Komisyon veya tez izleme komitesi bu belgeye bakarak çalışmanın **anlamlı**, **uygulanabilir** ve **süreye sığar** olup olmadığına karar verir. İyi bir öneri, tezin yarısını yazmış olmak demektir; çünkü giriş ve yöntem bölümlerinin taslağı buradan çıkar.

## Tez önerisinin bölümleri

Enstitülere göre küçük farklar olsa da öneriler genellikle şu bölümlerden oluşur:

1. **Başlık:** Değişkenleri, örneklemi ve bağlamı yansıtan, net bir başlık
2. **Problem ve önem:** Hangi sorunu ele aldığınız ve neden önemli olduğu
3. **Amaç ve araştırma soruları/hipotezler**
4. **Kısa literatür özeti:** Alandaki temel çalışmalar ve boşluk
5. **Yöntem:** Desen, örneklem, veri toplama araçları, analiz
6. **Etik:** Etik kurul izni gerekip gerekmediği
7. **Çalışma takvimi**
8. **Kaynakça**

## Komitenin en çok dikkat ettiği noktalar

- **Tutarlılık:** Problem, amaç, araştırma soruları ve yöntem birbirine bağlı mı? Örneğin ilişki sorusu soruyorsanız yöntem ilişkisel bir desen olmalı.
- **Uygulanabilirlik:** Katılımcılara ulaşabilecek misiniz? Ölçekler için izin aldınız mı?
- **Kapsam:** Konu bir tez süresine sığacak kadar dar mı?
- **Boşluk:** Çalışmanın neden gerekli olduğu açıkça gösterilmiş mi?

## Yazım ipuçları

- **Gelecek zaman kullanın:** "Veriler … ile toplanacaktır."
- **Kesin sonuç vaat etmeyin.** Henüz yapılmamış bir çalışmanın bulgularını yazamazsınız; "…beklenmektedir" ifadesi daha uygundur.
- **Yöntemi somutlaştırın:** "Uygun istatistiksel analizler yapılacaktır" yerine hangi analizin hangi soruya cevap vereceğini yazın.
- **Takvimi gerçekçi tutun:** Etik kurul, ölçek izni ve veri toplama genellikle beklenenden uzun sürer.

## Sık yapılan hatalar

- Araştırma sorularıyla yöntemin uyuşmaması
- Literatür özetinin kaynak listesine dönüşmesi
- Örneklem büyüklüğünün gerekçesiz bırakılması
- Etik kurul sürecinin hiç anılmaması


## Bölüm bölüm ne yazmalı?

### Problem durumu

Problem durumu, önerinin en çok okunan kısmıdır. Genelden özele ilerleyin: önce konunun neden önemli olduğunu, sonra literatürde neyin bilindiğini, en sonda neyin bilinmediğini anlatın. Paragrafın sonunda okuyucu “Bu çalışmaya neden ihtiyaç var?” sorusunun cevabını görmelidir. Her iddiayı bir kaynakla destekleyin.

### Amaç ve araştırma soruları

Genel amaç tek cümledir; alt amaçlar veya araştırma soruları bu cümleyi sınanabilir parçalara böler. Soruların her birinin yöntem bölümünde bir veri kaynağı ve analizle eşleşmesi gerekir. Nasıl yazılacağı için [araştırma sorusu ve hipotez rehberimize](/blog/arastirma-sorusu-ve-hipotez-nasil-yazilir) bakın.

### Yöntem

Öneride yöntem bölümü, tezdeki kadar ayrıntılı olmasa da şu soruları cevaplamalıdır: Hangi desen? Kimlerle (evren, örneklem, örneklem büyüklüğü)? Hangi araçlarla? Hangi analizle? Etik kurul onayı gerekecek mi? Yöntem bölümünün tezdeki tam hâli için [yöntem bölümü rehberimize](/blog/yontem-bolumu-nasil-yazilir) bakın.

### Çalışma takvimi

Takvimde literatür, etik kurul başvurusu, veri toplama, analiz, yazım ve düzeltme aşamalarını ay bazında gösterin. Komite, takvimin gerçekçi olup olmadığına bakar; etik kurul ve veri toplama için tampon süre bırakın.

## Önerinin uzunluğu ve biçimi

Uzunluk ve şablon enstitüden enstitüye değişir; kimi enstitü birkaç sayfalık bir form, kimi ayrıntılı bir metin ister. Enstitünüzün öneri formunu veya kılavuzunu esas alın. Biçimde tez yazım kılavuzunun kurallarını (yazı tipi, kenar boşlukları, atıf stili) şimdiden uygulamak, ileride önerinin tezin giriş bölümüne dönüşmesini kolaylaştırır.

## Komite sunumuna hazırlık

Öneriyi kısa bir sunumla savunmanız istenebilir. Sunumda şu sırayı izleyin: problem, amaç ve sorular, yöntem, beklenen katkı, takvim. Komite en çok yöntemin uygulanabilirliğini ve araştırma sorularının yöntemle uyumunu sorar. Olası soruları önceden yazıp cevaplarını hazırlayın:

- Bu örneklem neden seçildi, veriye nasıl ulaşacaksınız?
- Ölçme aracının geçerlik ve güvenirliği var mı?
- Literatürdeki benzer çalışmalardan farkınız ne?
- Etik kurul süreci takvime nasıl yansıdı?

## Öneri onaylandıktan sonra

Onaylanan öneri, tezinizin giriş ve yöntem bölümlerinin ilk taslağıdır. Komitenin istediği değişiklikleri hemen işleyin ve önemli bir yöntem değişikliği yapmanız gerekirse danışmanınızla birlikte enstitünün değişiklik prosedürünü izleyin. Tezin geri kalanını yazarken [tez yazım rehberimiz](/blog/tez-nasil-yazilir) ve [tez yazım takvimi rehberimiz](/blog/tez-yazim-takvimi-zaman-yonetimi) yol gösterir.

## Academiana ile tez önerisi

Academiana’da "Araştırma önerisi" çalışma türünü seçtiğinizde problem, amaç, araştırma soruları, literatür, yöntem, takvim ve riskler bölümleri hazır gelir. Asistan her bölümün amacını ve yazım kurallarını gösterir; "Tutarlılık kontrolü" ile amaç–soru–yöntem uyumunu denetleyebilir, etik kurul başvurusu için taslak metinler oluşturabilirsiniz.`,
    sources: [
      { text: "Creswell, J. W., & Creswell, J. D. (2018). Research design: Qualitative, quantitative, and mixed methods approaches (5th ed.). SAGE." },
      { text: "Punch, K. F. (2016). Developing effective research proposals (3rd ed.). SAGE." },
    ],
  },
  {
    slug: "arastirma-sorusu-ve-hipotez-nasil-yazilir",
    title: "Araştırma Sorusu ve Hipotez Nasıl Yazılır? Örneklerle",
    description: "İyi bir araştırma sorusunun özellikleri, sıfır ve alternatif hipotez farkı, yönlü ve yönsüz hipotez örnekleri. Tez ve makale için pratik rehber.",
    category: "Araştırma ve yöntem",
    keywords: ["araştırma sorusu nasıl yazılır", "hipotez nasıl kurulur", "hipotez örnekleri", "sıfır hipotezi"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Konunuza ve literatüre dayalı araştırma soruları ve test edilebilir hipotez önerileri alın.", href: "/kayit", label: "Sorularımı oluştur" },
    body: `Araştırma soruları ve hipotezler, çalışmanızın ne bulmak istediğini açıkça ortaya koyar. Yöntem, analiz ve tartışma bölümleri bu sorulara göre şekillenir. Bu yüzden belirsiz bir soru, bütün tezi belirsiz hâle getirir.

## İyi bir araştırma sorusunun özellikleri

- **Net:** Hangi değişkenleri ve hangi grubu incelediğiniz anlaşılır.
- **Cevaplanabilir:** Toplayacağınız verilerle cevap verilebilir.
- **Odaklı:** Tek bir soruda birden fazla şeyi sormaz.
- **Önemli:** Literatüre veya uygulamaya bir katkı sağlar.

**Zayıf:** Sosyal medya öğrencileri nasıl etkiler?

**Güçlü:** Üniversite öğrencilerinin günlük sosyal medya kullanım süresi ile benlik saygısı puanları arasında anlamlı bir ilişki var mıdır?

## Soru türleri

- **Betimsel:** "…düzeyi nedir?"
- **Karşılaştırmalı:** "…puanları cinsiyete göre farklılaşmakta mıdır?"
- **İlişkisel:** "…ile … arasında ilişki var mıdır?"
- **Yordayıcı:** "…, …’yı anlamlı olarak yordamakta mıdır?"

Nitel araştırmalarda sorular daha açık uçludur: "Öğretmenler uzaktan eğitim deneyimlerini nasıl anlamlandırmaktadır?"

## Hipotez nedir?

Hipotez, araştırma sorusuna verilen ve test edilebilir bir **ön cevaptır**. Nicel çalışmalarda istatistiksel olarak sınanır.

- **Sıfır hipotezi (H₀):** Fark veya ilişki yoktur. "Sosyal medya kullanım süresi ile benlik saygısı arasında anlamlı bir ilişki yoktur."
- **Alternatif hipotez (H₁):** Fark veya ilişki vardır.

### Yönlü ve yönsüz hipotez

- **Yönsüz:** "İki grup arasında anlamlı fark vardır."
- **Yönlü:** "Deney grubunun son test puanları kontrol grubundan anlamlı düzeyde yüksektir."

Yönlü hipotez kurmak için literatürde güçlü bir dayanağınız olmalıdır.

## Hipotezleri yazarken dikkat

- Her hipotez tek bir ilişkiyi veya farkı test etmeli
- Hipotezler numaralandırılmalı (H1, H2, H3…) ve bulgular bölümünde aynı numaralarla ele alınmalı
- Her hipotezin hangi analizle test edileceği yöntem bölümünde belirtilmeli


## Kötüden iyiye: araştırma sorusu örnekleri

| Zayıf soru | Sorunu | Güçlü soru |
| --- | --- | --- |
| Sosyal medya öğrencileri etkiler mi? | Çok geniş, değişkenler belirsiz | Lisans öğrencilerinde problemli sosyal medya kullanımı akademik ertelemeyi yordamakta mıdır? |
| Öğretmenler teknolojiyi seviyor mu? | Ölçülebilir değil | Ortaokul öğretmenlerinin teknoloji kabul düzeyi mesleki kıdeme göre farklılaşmakta mıdır? |
| Uzaktan eğitim iyi midir? | Değer yargısı içeriyor | Lisans öğrencileri uzaktan eğitim deneyimlerini nasıl anlamlandırmaktadır? |

İlk iki güçlü soru nicel, sonuncusu nitel bir sorudur. Nitel sorular genellikle “nasıl” ve “ne” ile başlar ve bir deneyimin anlamını arar; nicel sorular değişkenler arasındaki ilişkiyi veya farkı sınar.

## Soru ile analizi eşleştirmek

Her araştırma sorusu bir analize karşılık gelmelidir. Eşleşme kurulamıyorsa soru ya çok geniştir ya da yöntem uygun değildir:

| Soru türü | Örnek | Olası analiz |
| --- | --- | --- |
| Betimleme | Öğrencilerin erteleme düzeyi nedir? | Betimsel istatistikler |
| İlişki | Sosyal medya kullanımı ile erteleme ilişkili midir? | Korelasyon |
| Fark (iki grup) | Erteleme cinsiyete göre farklılaşır mı? | Bağımsız örneklem t testi |
| Fark (üç ve üzeri grup) | Erteleme sınıf düzeyine göre farklılaşır mı? | Tek yönlü ANOVA |
| Yordama | Sosyal medya kullanımı ertelemeyi yordar mı? | Regresyon |

Analizlerin nasıl yapılıp raporlandığını [t testi](/blog/t-testi-nasil-yapilir-ve-yorumlanir), [tek yönlü ANOVA](/blog/tek-yonlu-anova-nasil-yapilir-ve-raporlanir) ve [regresyon](/blog/regresyon-analizi-apa-7-raporlama) rehberlerimizde çözümlü örneklerle anlattık.

## Sıfır ve alternatif hipotez

İstatistiksel testler **sıfır hipotezini** (H0) sınar: “Gruplar arasında fark yoktur” veya “değişkenler arasında ilişki yoktur.” **Alternatif hipotez** (H1) sizin beklentinizdir. Tezlerde genellikle alternatif hipotezler yazılır ve bulgular bölümünde her hipotezin desteklenip desteklenmediği belirtilir. “Hipotez kanıtlandı” yerine “hipotez desteklendi” ifadesini kullanın; tek bir çalışma bir hipotezi kesin olarak kanıtlamaz.

## Hipotez ne zaman yazılmaz?

- **Nitel çalışmalarda** hipotez yazılmaz; araştırma soruları kullanılır.
- **Keşfedici nicel çalışmalarda**, literatürde yön belirtecek yeterli bulgu yoksa hipotez yerine araştırma sorusu tercih edilebilir.
- **Betimsel sorularda** (“düzeyi nedir?”) hipotez gerekmez.

## Soru sayısı

Bir yüksek lisans tezi için genellikle bir ana soru ve bunu açan birkaç alt soru yeterlidir. Çok sayıda soru, bulgular ve tartışma bölümünü dağıtır; her soruyu derinlemesine tartışmanız gerektiğini unutmayın.

## Academiana ile soru ve hipotez

Academiana’nın "Araştırma soruları" ve "Hipotez oluştur" eylemleri, projenizin konusuna ve eklediğiniz kaynaklara dayanarak öneriler sunar; her hipotezin dayanağını kaynakla gösterir. Kalite kontrolü ise analiz veya bulgular bölümünde ele alınmayan bir hipotez kaldıysa sizi uyarır.`,
    sources: [
      { text: "Creswell, J. W., & Creswell, J. D. (2018). Research design: Qualitative, quantitative, and mixed methods approaches (5th ed.). SAGE." },
      { text: "Punch, K. F. (2014). Introduction to social research: Quantitative and qualitative approaches (3rd ed.). SAGE." },
    ],
  },
  {
    slug: "yontem-bolumu-nasil-yazilir",
    title: "Yöntem Bölümü Nasıl Yazılır? Desen, Örneklem, Araçlar ve Analiz",
    description: "Tezde ve makalede yöntem bölümünün alt başlıkları: araştırma deseni, evren ve örneklem, veri toplama araçları, işlem ve veri analizi. Örnek ifadelerle.",
    category: "Araştırma ve yöntem",
    keywords: ["yöntem bölümü nasıl yazılır", "araştırma deseni", "evren ve örneklem", "veri toplama araçları"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Yöntem bölümünüzü alt başlıklarla yazdırın; etik kurul belgeleri için taslaklar oluşturun.", href: "/kayit", label: "Yöntemimi yaz" },
    body: `Yöntem bölümü, çalışmanızı bir başkasının aynı şekilde tekrarlayabileceği açıklıkta anlatır. Okuyucu bu bölümü okuduktan sonra **ne yaptığınızı, kiminle yaptığınızı ve nasıl analiz ettiğinizi** tam olarak bilmelidir.

## 1. Araştırma deseni (modeli)

Çalışmanızın türünü ve neden bu deseni seçtiğinizi yazın:

- **Nicel:** tarama, ilişkisel, nedensel karşılaştırma, deneysel/yarı deneysel
- **Nitel:** olgubilim (fenomenoloji), durum çalışması, gömülü kuram, etnografi
- **Karma:** açıklayıcı sıralı, keşfedici sıralı, eş zamanlı

Örnek: "Bu araştırmada, değişkenler arasındaki ilişkiyi incelemek amacıyla ilişkisel tarama modeli kullanılmıştır."

## 2. Evren ve örneklem (çalışma grubu)

- Evreni tanımlayın: Araştırmanın genellemek istediği grup kim?
- Örnekleme yöntemini yazın: seçkisiz, tabakalı, uygun (kolay ulaşılabilir), amaçlı vb.
- Örneklem büyüklüğünü gerekçelendirin.
- Katılımcıların demografik özelliklerini bir tabloyla verin.

Nitel çalışmalarda "örneklem" yerine genellikle "çalışma grubu" veya "katılımcılar" ifadesi kullanılır.

## 3. Veri toplama araçları

Her araç için şunları yazın:

- Aracın adı, kim tarafından geliştirildiği veya uyarlandığı
- Kaç madde ve kaç alt boyuttan oluştuğu, puanlama biçimi
- Geçerlik ve güvenirlik bilgileri (ör. orijinal çalışmadaki ve sizin örnekleminizdeki Cronbach alfa)
- Ölçek kullanım izninin alındığı

Kendi geliştirdiğiniz bir anket veya görüşme formu varsa geliştirme sürecini (uzman görüşü, ön uygulama) anlatın.

## 4. Veri toplama süreci (işlem)

Verileri ne zaman, nerede, nasıl topladığınızı yazın: yüz yüze mi çevrim içi mi, ne kadar sürdü, katılımcılara nasıl bilgi verildi. Etik kurul onay tarihini ve sayısını belirtin.

## 5. Veri analizi

- Hangi programın kullanıldığını
- Varsayımların (normallik, varyans homojenliği) nasıl kontrol edildiğini
- Her araştırma sorusu veya hipotez için hangi analizin yapıldığını
- Anlamlılık düzeyini (genellikle .05)

Nitel çalışmalarda kodlama sürecini, temaların nasıl oluşturulduğunu ve inandırıcılık (güvenilirlik) için alınan önlemleri anlatın.

## Sık yapılan hatalar

- Deseni adlandırıp gerekçesini yazmamak
- Ölçeklerin güvenirliğini yalnızca orijinal çalışmadan aktarmak
- Analiz yöntemini araştırma sorularıyla eşleştirmemek
- Bulguları yöntem bölümünde vermek


## Nicel ve nitel tezde yöntem bölümünün farkı

| Başlık | Nicel çalışma | Nitel çalışma |
| --- | --- | --- |
| Desen | Tarama, ilişkisel, deneysel, yarı deneysel | Olgubilim, durum çalışması, gömülü kuram, etnografi |
| Katılımcılar | Evren ve örneklem, örneklem büyüklüğü hesabı | Çalışma grubu, amaçlı örnekleme, katılımcı özellikleri |
| Veri toplama | Ölçek, anket, test; geçerlik ve güvenirlik | Görüşme, gözlem, doküman; görüşme formunun hazırlanması |
| Analiz | İstatistiksel testler ve varsayım kontrolleri | Kodlama, tema oluşturma, betimsel veya içerik analizi |
| Kalite | Geçerlik, güvenirlik | İnandırıcılık, aktarılabilirlik, tutarlılık, teyit edilebilirlik |
| Araştırmacının rolü | Genellikle ayrı başlık gerekmez | Araştırmacının konumu ve olası etkisi açıklanır |

Nitel tezlerde yöntem bölümünü yazarken [nitel araştırma rehberimize](/blog/nitel-arastirma-gorusme-ve-tematik-analiz) bakabilirsiniz.

## Örneklem büyüklüğünü gerekçelendirmek

“Örneklem 300 kişiden oluşmaktadır” demek yetmez; bu sayının neden yeterli olduğunu gösterin. Nicel çalışmalarda güç analizi veya evren büyüklüğüne göre hesaplama kullanılır. Hesaplamanın nasıl yapılacağı [örneklem büyüklüğü rehberimizde](/blog/orneklem-buyuklugu-nasil-hesaplanir), hızlı hesap için ücretsiz [örneklem hesaplayıcımızda](/araclar/orneklem-hesaplayici).

## Ölçme araçlarını tanıtmak

Her ölçek için şu bilgiler verilir: ölçeğin özgün geliştiricisi, Türkçe uyarlamasını yapan araştırmacılar, madde sayısı, boyutları, derecelendirme biçimi, puanların yorumu ve uyarlama çalışmasındaki geçerlik–güvenirlik değerleri. Ardından **kendi örnekleminizde** hesapladığınız güvenirlik katsayısını raporlayın. Cronbach alfa için [rehberimize](/blog/cronbach-alfa-nedir-nasil-yorumlanir) ve ücretsiz [Cronbach alfa hesaplayıcımıza](/araclar/cronbach-alfa) bakın. Ölçek geliştiriyor veya uyarlıyorsanız [ölçek geçerlik ve güvenirlik rehberimiz](/blog/olcek-gecerlik-guvenirlik-calismasi) adımları anlatır.

## Analiz bölümünü soru soru yazmak

Analiz kısmında her araştırma sorusunu veya hipotezi sırayla ele alıp hangi testle sınandığını yazın. Varsayım kontrollerini (normallik, varyans homojenliği) ve anlamlılık düzeyini belirtin. Normallik kontrolünün nasıl raporlanacağını [normallik testi rehberimizde](/blog/normallik-testi-carpiklik-basiklik) anlattık. Hangi testin hangi soruya uygun olduğunu bilmiyorsanız [hangi istatistik analizi seçilmeli rehberimize](/blog/hangi-istatistik-analizi-secilmeli) bakın.

## Zaman kipi ve üslup

Yöntem bölümü, tamamlanmış bir süreci anlattığı için genellikle geçmiş zamanla yazılır (“veriler … toplanmıştır”). Öneri aşamasında gelecek zaman kullanılır; tez yazılırken bu kipleri güncellemeyi unutmayın. Kararlarınızı gerekçesiyle yazın: “İlişkisel tarama deseni, değişkenler arasındaki ilişkiyi müdahale olmaksızın incelemeye uygun olduğu için seçilmiştir” gibi.

## Academiana ile yöntem bölümü

Academiana’da yöntem yaklaşımınızı (nicel, nitel, karma) seçtiğinizde yol haritası buna göre düzenlenir; örneğin nitel çalışmalarda "Evren ve örneklem" yerine "Çalışma grubu" bölümü gelir. Asistan bölümü alt başlıklarla yazabilir, "Yöntem önerisi" eylemiyle seçenekleri artı ve eksileriyle karşılaştırır, "Etik kurul belgeleri" ile başvuru metni ve onam formu taslağı hazırlar.`,
    sources: [
      { text: "Creswell, J. W., & Creswell, J. D. (2018). Research design: Qualitative, quantitative, and mixed methods approaches (5th ed.). SAGE." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
      { text: "Lincoln, Y. S., & Guba, E. G. (1985). Naturalistic inquiry. SAGE." },
    ],
  },
  {
    slug: "bulgular-ve-tartisma-bolumu",
    title: "Bulgular ve Tartışma Bölümü Nasıl Yazılır? Farkları ve Örnekler",
    description: "Bulgular bölümünde neler yazılır, tartışmada neler yazılır? APA tablo düzeni, istatistiksel raporlama ve bulguları literatürle karşılaştırma rehberi.",
    category: "Tez yazımı",
    keywords: ["bulgular bölümü nasıl yazılır", "tartışma bölümü nasıl yazılır", "bulgular ve tartışma farkı", "APA tablo"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Verinizi yükleyin; analizler gerçek hesaplamayla yapılsın, sonuçlar APA tablosu ve cümlesi olarak gelsin.", href: "/kayit", label: "Analizimi yap" },
    body: `Tezlerde en sık karıştırılan iki bölüm bulgular ve tartışmadır. Kısaca: **Bulgular "ne buldum?" sorusunu, tartışma ise "bu ne anlama geliyor?" sorusunu cevaplar.**

## Bulgular bölümü

Bu bölümde yalnızca analiz sonuçlarınızı, yorum katmadan sunarsınız.

### Düzen

- Bulguları araştırma soruları veya hipotezlerle **aynı sırada** verin.
- Her alt başlığı bir soruya veya hipoteze ayırın.
- Önce betimsel istatistikleri, sonra çıkarımsal analizleri sunun.

### Tablolar

APA biçiminde tablolar numaralandırılır, başlık tablonun üstünde yer alır ve dikey çizgi kullanılmaz. Metinde tablodaki her değeri tekrar etmeyin; en önemli sonucu cümleyle anlatıp tabloya yönlendirin: "Tablo 3’te görüldüğü gibi…"

### İstatistiksel raporlama

APA 7’ye göre test istatistiği, serbestlik derecesi, p değeri ve etki büyüklüğü birlikte verilir:

- *t*(98) = 2.45, *p* = .016, *d* = 0.49
- *F*(2, 147) = 5.12, *p* = .007, η² = .07
- *r* = .34, *p* < .001

Sıfırla başlayamayan değerlerde (p, r gibi) başta sıfır yazılmaz: .05 gibi. Türkçe metinlerde ondalık ayırıcı konusunda enstitünüzün kılavuzuna uyun.

## Tartışma bölümü

Burada bulgularınızı yorumlar ve literatürle karşılaştırırsınız.

### İyi bir tartışmanın yapısı

1. **Ana bulguyu hatırlatın:** Kısa ve net bir cümleyle.
2. **Literatürle karşılaştırın:** Hangi çalışmalarla tutarlı, hangileriyle çelişiyor?
3. **Açıklayın:** Tutarlılığın veya çelişkinin olası nedenleri neler? (örneklem, kültürel bağlam, ölçme aracı)
4. **Anlamını belirtin:** Kuram ve uygulama için ne ifade ediyor?

Bu döngüyü her ana bulgu için tekrarlayın.

### Sonuç, öneriler ve sınırlılıklar

- **Sonuç:** Bulguların kısa ve genel bir özeti
- **Öneriler:** Uygulayıcılara ve gelecekteki araştırmacılara somut öneriler
- **Sınırlılıklar:** Örneklem, yöntem ve ölçme araçlarından kaynaklanan sınırlar

## Sık yapılan hatalar

- Bulgular bölümünde yorum yapmak veya literatüre atıf yapmak (enstitünüz birleşik "Bulgular ve tartışma" istemiyorsa)
- Tartışmada yeni bulgu sunmak
- Anlamlı çıkmayan sonuçları gizlemek
- Korelasyonu nedensellik gibi yorumlamak


## Bulguları araştırma sorularına göre düzenlemek

Bulgular bölümünü araştırma sorularının veya hipotezlerin sırasıyla yazın. Her alt başlıkta önce soruyu hatırlatın, sonra analizin adını, ardından tabloyu ve tablonun kısa bir metin özetini verin. Tablodaki her sayıyı metinde tekrar etmeyin; en önemli sonucu ve istatistiği yazın. Tablo ve şekil biçimi için [APA 7 tablo ve şekil rehberimize](/blog/tez-tablo-ve-sekil-apa-7) bakın.

İstatistiksel sonuçların doğru raporlanmasını çözümlü örneklerle şu rehberlerimizde anlattık: [t testi](/blog/t-testi-nasil-yapilir-ve-yorumlanir), [tek yönlü ANOVA](/blog/tek-yonlu-anova-nasil-yapilir-ve-raporlanir), [regresyon](/blog/regresyon-analizi-apa-7-raporlama).

## Bulgu ile yorumun farkı

| Bulgular bölümünde | Tartışma bölümünde |
| --- | --- |
| “Gruplar arasındaki fark anlamlıdır, F(2, 27) = 6.74, p = .004.” | “Bu fark, proje tabanlı öğrenmenin etkin katılımı artırdığını gösteren çalışmalarla tutarlıdır.” |
| Sonucun ne olduğunu yazar | Sonucun ne anlama geldiğini ve neden öyle çıktığını tartışır |
| Literatüre atıf yapılmaz | Literatürle karşılaştırılır |
| Hipotezin desteklenip desteklenmediği belirtilir | Beklenmeyen sonuçların olası nedenleri tartışılır |

## Tartışma paragrafının yapısı

Her temel bulgu için bir tartışma ekseni kurun ve şu sırayı izleyin:

1. **Bulguyu kısaca hatırlatın:** “Araştırmada … bulunmuştur.”
2. **Literatürle karşılaştırın:** Destekleyen ve ayrışan çalışmaları birlikte verin.
3. **Açıklayın:** Sonucun olası nedenlerini kuramsal çerçeveye dayanarak tartışın.
4. **Sınırlayın:** Bu yorumun hangi koşullarda geçerli olduğunu belirtin.

Beklenmeyen veya hipotezi desteklemeyen sonuçlar tartışmanın en değerli kısmıdır; bunları geçiştirmeyin.

## Sonuç ve öneriler

Sonuç bölümü bulguları yeniden saymaz; araştırmanın amacına verdiği cevabı birkaç paragrafta özetler. Öneriler ikiye ayrılır:

- **Uygulamaya yönelik öneriler:** Bulgulardan doğrudan türeyen, uygulayıcılara (öğretmenler, yöneticiler, klinisyenler) yönelik öneriler.
- **Araştırmaya yönelik öneriler:** Sınırlılıklardan türeyen, gelecekteki çalışmalar için öneriler (farklı örneklem, boylamsal desen, nitel derinleştirme gibi).

Bulgularınızın desteklemediği öneriler yazmayın; her öneri bir bulguya veya sınırlılığa dayanmalıdır.

## Nedensellik diline dikkat

İlişkisel ve kesitsel çalışmalarda “etkiler”, “neden olur”, “artırır” gibi nedensellik bildiren ifadelerden kaçının; “ilişkilidir”, “yordamaktadır” gibi ifadeler kullanın. Nedensel çıkarım için deneysel desen gerekir. Bu ayrım jürilerin sık sorduğu konulardandır.

## Academiana ile bulgular ve tartışma

Academiana’nın istatistik aracı, yüklediğiniz CSV veya Excel dosyası üzerinde t testi, ANOVA, korelasyon, regresyon, ki-kare ve Cronbach alfa gibi analizleri gerçek hesaplamayla yapar; sonucu APA biçiminde tablo ve cümle olarak verir. Yapay zekâ hiçbir sayı üretmez. Grafik aracı ise APA kurallarına uygun şekiller çizer. Tartışma bölümünde "Tartışma geliştir" eylemi bulgularınızı projedeki kaynaklarla karşılaştırır.`,
    sources: [
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
    ],
  },
  {
    slug: "ozet-ve-abstract-nasil-yazilir",
    title: "Özet ve Abstract Nasıl Yazılır? Kelime Sınırı, Yapı ve Örnek",
    description: "Tez ve makale özeti (abstract) nasıl yazılır? Amaç–yöntem–bulgular–sonuç yapısı, anahtar kelime seçimi ve İngilizce abstract yazarken dikkat edilecekler.",
    category: "Tez yazımı",
    keywords: ["özet nasıl yazılır", "abstract nasıl yazılır", "tez özeti örneği", "anahtar kelime seçimi"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Bütün bölümleri yazdıktan sonra Türkçe özeti ve İngilizce abstract’ı tek tıkla, metninizdeki bilgilerle oluşturun.", href: "/kayit", label: "Özetimi oluştur" },
    body: `Özet, çalışmanızın en çok okunan bölümüdür. Veri tabanlarında araştırmacılar önce başlığa, sonra özete bakar; tam metni okuyup okumamaya özete göre karar verir. Bu yüzden kısa ama eksiksiz olmalıdır.

## Özet ne zaman yazılır?

**En son.** Özet bütün çalışmayı özetler; bulgular ve sonuçlar belli olmadan yazılamaz. Başta yazılan özetler çoğu zaman son hâliyle uyuşmaz.

## Yapısı

İyi bir özet dört temel soruya cevap verir:

1. **Amaç:** Çalışma neyi araştırdı?
2. **Yöntem:** Kimlerle, hangi desenle, hangi araçlarla?
3. **Bulgular:** En önemli sonuçlar neler?
4. **Sonuç:** Bulgular ne anlama geliyor?

Bazı dergiler yapılandırılmış özet ister: her bölüm "Amaç:", "Yöntem:" gibi başlıklarla ayrılır.

## Uzunluk

Tezlerde özet genellikle 150–250 kelime veya bir sayfa ile sınırlıdır; makalelerde derginin kuralına göre değişir. Kendi enstitünüzün veya derginizin sınırına mutlaka uyun.

## Anahtar kelimeler

- Genellikle 3–5 anahtar kelime istenir.
- Başlıkta zaten geçen kelimeleri tekrar etmek yerine, okuyucunun arayabileceği **farklı** terimleri seçin.
- Alanınızdaki yerleşik terimleri kullanın.

## Özette olmaması gerekenler

- Kaynak gösterme (atıf)
- Metinde olmayan bilgi veya bulgu
- Kısaltmaların açıklanmamış hâli
- Tablo, şekil veya uzun istatistik dökümleri
- "Bu çalışmada çok önemli sonuçlara ulaşılmıştır" gibi içi boş ifadeler

## İngilizce abstract

- Türkçe özetin kelimesi kelimesine çevirisi değil, aynı içeriğin akıcı akademik İngilizcesi olmalıdır.
- Yöntem ve bulgular için genellikle geçmiş zaman (*was conducted, were found*), genel sonuçlar için geniş zaman kullanılır.
- Alan terimlerinin İngilizce karşılıklarını literatürden kontrol edin.

## Kısa bir şablon

"Bu araştırmanın amacı, … ile … arasındaki ilişkiyi incelemektir. İlişkisel tarama modelindeki araştırmanın çalışma grubunu … oluşturmaktadır. Veriler … ve … ile toplanmıştır. Analizler sonucunda … bulunmuştur. Bulgular, … olduğunu göstermektedir."


## Özet ile genişletilmiş özet farkı

Bazı enstitüler Türkçe tezlerde İngilizce **genişletilmiş özet** (extended abstract) ister. Bu, birkaç sayfalık, giriş–yöntem–bulgular–tartışma yapısında ve kendi içinde atıf içerebilen ayrı bir metindir. Normal özetten farklı olarak tezin ana bulgularını ve tartışmasını daha ayrıntılı anlatır. Enstitünüzün kılavuzunda bu istenip istenmediğini kontrol edin.

## Kelime sınırı içinde kalmak

Özetler genellikle 150–250 kelimeyle sınırlıdır; sınır enstitüye ve dergiye göre değişir. Sınıra sığmak için:

- Problem kısmını tek cümleye indirin; literatür ayrıntısı özete girmez.
- Yöntemi “desen, örneklem, araç, analiz” sırasıyla tek veya iki cümlede verin.
- Bulgularda en önemli iki üç sonucu sayısal değerleriyle birlikte yazın; her bulguyu saymayın.
- Son cümlede sonucun anlamını ve en önemli öneriyi verin.

## Örnek özet çözümlemesi

Aşağıdaki kurgusal özet her cümlenin görevini gösterir:

1. **Amaç:** “Bu araştırmada lisans öğrencilerinde problemli sosyal medya kullanımı ile akademik erteleme arasındaki ilişki incelenmiştir.”
2. **Yöntem:** “İlişkisel tarama modelindeki araştırmaya bir devlet üniversitesinden lisans öğrencileri katılmış; veriler iki ölçekle toplanmış ve korelasyon ile regresyon analizleriyle çözümlenmiştir.”
3. **Bulgular:** “Problemli sosyal medya kullanımı ile akademik erteleme arasında pozitif ve anlamlı bir ilişki bulunmuştur.”
4. **Sonuç:** “Bulgular, üniversitelerin psikolojik danışma hizmetlerinde dijital alışkanlıkların ele alınması gerektiğini göstermektedir.”

Gerçek bir özette bulgu cümlesinde istatistiksel değerler de verilir (ör. korelasyon katsayısı ve açıklanan varyans).

## Anahtar kelime seçimi

Anahtar kelimeler, çalışmanızın veri tabanlarında bulunmasını sağlar. Başlıkta zaten geçen kelimeleri tekrar etmek yerine eş anlamlıları ve daha geniş kavramları ekleyin. Türkçe anahtar kelimeleri Türkçe Bilim Terimleri veya alanınızdaki yerleşik karşılıklarla, İngilizce olanları uluslararası literatürde kullanılan terimlerle seçin.

## Abstract yazarken çeviri hataları

- Türkçe özeti kelime kelime çevirmeyin; İngilizce akademik kalıpları kullanın.
- Zaman kiplerine dikkat edin: yöntem ve bulgular genellikle geçmiş zamanla, sonuçlar şimdiki zamanla yazılır.
- “Significant” kelimesini yalnızca istatistiksel anlamlılık için kullanın.
- Kısaltmaları ilk kullanımda açın.

## Academiana ile özet

Academiana’da özet bölümü yol haritasında en sona yerleştirilir. Diğer bölümler bittiğinde "Özet ve Abstract" eylemi, metninizdeki bilgilerle amaç–yöntem–bulgular–sonuç sırasında bir Türkçe özet ve İngilizce abstract taslağı hazırlar. Metinde olmayan bulgu eklemez; bulgular henüz yazılmadıysa "[VERİ GİRİLECEK]" bırakır.`,
    sources: [
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "anket-nasil-hazirlanir-likert-olcegi",
    title: "Anket Nasıl Hazırlanır? Likert Ölçeği, Soru Yazımı ve Güvenirlik",
    description: "Akademik araştırma için anket hazırlama rehberi: Likert ölçeği, ters maddeler, demografik sorular, ön uygulama ve Cronbach alfa güvenirliği.",
    category: "Araştırma ve yöntem",
    keywords: ["anket nasıl hazırlanır", "Likert ölçeği", "anket soruları örnekleri", "Cronbach alfa", "online anket"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Likert ölçekli anketinizi hazırlayın, bağlantıyla paylaşın, cevapları tek tıkla analize ve grafiklere aktarın.", href: "/kayit", label: "Anket oluştur" },
    body: `Anket, nicel araştırmalarda en sık kullanılan veri toplama aracıdır. Ancak kötü hazırlanmış bir anket, ne kadar çok katılımcıya ulaşırsa ulaşsın güvenilir sonuç vermez.

## Önce hazır ölçek var mı, bakın

Ölçmek istediğiniz kavram için geçerlik ve güvenirlik çalışması yapılmış bir ölçek varsa onu kullanmak çoğu zaman en doğru yoldur. Başkasının ölçeğini kullanacaksanız genellikle **yazılı kullanım izni** almanız gerekir. Yabancı bir ölçeği kullanacaksanız Türkçeye uyarlanmış bir sürümünün olup olmadığını araştırın.

## Likert ölçeği

Katılımcının bir ifadeye katılma düzeyini belirttiği derecelendirme türüdür.

- **5’li:** Kesinlikle katılmıyorum – Katılmıyorum – Kararsızım – Katılıyorum – Kesinlikle katılıyorum
- **7’li:** Daha ince ayrım sağlar.

### Ters maddeler

Bazı maddeler ters yönde yazılır ("Kendimi çoğu zaman yetersiz hissederim." gibi). Bunlar katılımcının dikkatsizce hep aynı seçeneği işaretlemesini fark etmeye yardımcı olur. Analizden önce ters kodlanmaları gerekir (5’li ölçekte 1→5, 2→4).

## İyi soru yazmanın kuralları

- **Tek bir şey sorun.** "Ders içeriği ilgi çekici ve faydalıydı" iki ayrı sorudur.
- **Yönlendirmeyin.** "Uzaktan eğitimin faydalarını düşündüğünüzde…" gibi girişler cevabı etkiler.
- **Sade dil kullanın.** Katılımcının bilmeyebileceği teknik terimlerden kaçının.
- **Olumsuz ve çift olumsuz yapılardan kaçının.** "…olmadığını düşünmüyorum" kafa karıştırır.
- **Seçenekler kapsayıcı ve ayrık olsun.** Yaş aralıkları çakışmamalı, "Diğer" seçeneği gerekiyorsa eklenmeli.

## Demografik sorular

Cinsiyet, yaş, sınıf, bölüm gibi sorular yalnızca analizde gerçekten kullanacaksanız sorulmalıdır. Gereksiz kişisel veri toplamak hem etik hem de KVKK açısından sorun yaratır.

## Onam ve etik

Anketin başında katılımcıya araştırmanın amacını, süresini, gönüllülüğü ve verilerin nasıl kullanılacağını anlatan bir **bilgilendirilmiş onam** metni sunun. İnsan katılımcılarla yapılan araştırmalarda veri toplamadan önce genellikle etik kurul onayı gerekir.

## Ön uygulama

Anketi asıl uygulamadan önce küçük bir grupla deneyin. Anlaşılmayan maddeleri, süreyi ve teknik sorunları bu aşamada yakalarsınız.

## Güvenirlik: Cronbach alfa

Bir ölçeğin maddelerinin aynı yapıyı tutarlı biçimde ölçüp ölçmediğini gösterir. Alanda yaygın olarak .70 ve üzeri değerler kabul edilebilir sayılır; ancak yorum, ölçeğin amacına ve madde sayısına göre değişebilir. Güvenirliği kendi örnekleminizde de hesaplayıp rapor edin.


## Kaç dereceli Likert kullanılmalı?

Beşli ve yedili Likert en yaygın kullanılan biçimlerdir. Beşli ölçek katılımcılar için daha kolaydır; yedili ölçek daha ince ayrım sağlar. Çift sayılı (dörtlü, altılı) ölçekler orta noktayı kaldırarak katılımcıyı bir yöne yönlendirir; “kararsızım” seçeneğinin anlamlı olmadığı durumlarda tercih edilebilir. Hazır bir ölçek kullanıyorsanız derecelendirmeyi değiştirmeyin; ölçeğin geçerlik ve güvenirlik çalışması o biçimle yapılmıştır.

## Likert verisi nasıl analiz edilir?

Tek bir Likert maddesi sıralama düzeyinde bir veridir. Ancak birden fazla maddenin toplamı veya ortalamasından oluşan **ölçek puanları** sosyal bilimlerde yaygın olarak sürekli veri kabul edilir ve parametrik testlerle analiz edilir. Tek madde düzeyinde analiz yapacaksanız frekans ve yüzdeler ile parametrik olmayan testler daha uygundur. Hangi testin seçileceği için [istatistik analizi seçme rehberimize](/blog/hangi-istatistik-analizi-secilmeli) bakın.

## Çevrim içi anket uygularken

- **Zorunlu soru ayarı:** Tüm maddeleri zorunlu yapmak eksik veriyi önler ama katılımcıyı yorabilir; onam ve demografik sorular dışında dikkatli kullanın.
- **Dikkat kontrol maddesi:** “Bu maddede lütfen ‘katılıyorum’u işaretleyin” gibi bir madde, rastgele işaretleme yapan katılımcıları belirlemenize yardım eder.
- **Süre:** Ön uygulamada anketin kaç dakika sürdüğünü ölçün ve onam formunda belirtin.
- **Tek yanıt:** Aynı kişinin birden fazla yanıt vermesini engelleyen ayarları kullanın.

## Veri temizleme

Analizden önce veri setini kontrol edin:

1. Eksik verileri ve nasıl ele alacağınızı belirleyin.
2. Ters maddeleri puanlamadan önce çevirin.
3. Dikkat kontrol maddesini yanlış cevaplayanları ve hep aynı seçeneği işaretleyenleri inceleyin.
4. Uç değerleri kontrol edin.
5. Bu adımları ve çıkarılan katılımcı sayısını yöntem bölümünde raporlayın.

## Örneklem büyüklüğü

Anketinize kaç kişinin katılması gerektiğini veri toplamadan önce hesaplayın. Evren büyüklüğüne göre hesaplama ve güç analizi için [örneklem büyüklüğü rehberimize](/blog/orneklem-buyuklugu-nasil-hesaplanir) ve ücretsiz [örneklem hesaplayıcımıza](/araclar/orneklem-hesaplayici) bakın. Ölçeğinizin bu örneklemdeki güvenirliğini ise ücretsiz [Cronbach alfa hesaplayıcımızla](/araclar/cronbach-alfa) bulabilirsiniz.

## Academiana ile anket

Academiana’nın anket oluşturucusunda tek ve çoklu seçim, 5’li ve 7’li Likert (ters madde işaretleme dahil), sayı ve açık uçlu sorular hazırlayabilir; onam metni ekleyip anketi bir bağlantıyla paylaşabilirsiniz. Katılımcılardan ad, e-posta veya IP adresi toplanmaz. Cevaplar Excel’de açılan bir dosya olarak indirilir veya tek tıkla çalışmanıza aktarılır; ters maddeler otomatik kodlanır ve Cronbach alfa dahil analizleri hemen yapabilirsiniz.`,
    sources: [
      { text: "Likert, R. (1932). A technique for the measurement of attitudes. Archives of Psychology, 22(140), 1–55." },
      { text: "DeVellis, R. F., & Thorpe, C. T. (2022). Scale development: Theory and applications (5th ed.). SAGE." },
      { text: "Dillman, D. A., Smyth, J. D., & Christian, L. M. (2014). Internet, phone, mail, and mixed-mode surveys: The tailored design method (4th ed.). Wiley." },
    ],
  },
  {
    slug: "hangi-istatistik-analizi-secilmeli",
    title: "Hangi İstatistik Analizini Seçmeliyim? t Testi, ANOVA, Korelasyon",
    description: "Hangi istatistik analizi seçilmeli? t testi, ANOVA, Mann-Whitney, Kruskal-Wallis, korelasyon, regresyon ve ki-kare ne zaman kullanılır?",
    category: "Araştırma ve yöntem",
    keywords: ["hangi istatistik analizi", "t testi ne zaman kullanılır", "ANOVA nedir", "SPSS analiz seçimi", "normallik testi"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "SPSS olmadan: verinizi yükleyin, analizi seçin, sonucu APA tablosu ve yorum cümlesiyle alın.", href: "/kayit", label: "Analizimi yap" },
    body: `İstatistik, birçok öğrencinin tezde en çok zorlandığı kısımdır. Oysa doğru analizi seçmek, birkaç soruya cevap vermekten ibarettir: **Ne soruyorsunuz, değişkenleriniz ne tür ve kaç grubunuz var?**

## 1. Değişken türlerini belirleyin

- **Sürekli (sayısal):** ölçek puanı, yaş, not ortalaması
- **Kategorik:** cinsiyet, bölüm, sınıf düzeyi

## 2. Sorunuzun türüne göre analiz

### Gruplar arasında fark mı arıyorsunuz?

- **İki bağımsız grup** (ör. kadın–erkek): Bağımsız örneklemler t testi
- **Aynı kişilerde iki ölçüm** (ör. ön test–son test): Eşleştirilmiş örneklemler t testi
- **Üç ve daha fazla grup** (ör. 1., 2., 3., 4. sınıf): Tek yönlü varyans analizi (ANOVA); anlamlı fark çıkarsa hangi gruplar arasında olduğunu bulmak için çoklu karşılaştırma (post hoc) testleri

### İlişki mi arıyorsunuz?

- **İki sürekli değişken:** Pearson korelasyonu
- **Sıralı veya normal dağılmayan veriler:** Spearman sıra farkları korelasyonu
- **İki kategorik değişken** (ör. cinsiyet ve tercih edilen ders): Ki-kare bağımsızlık testi

### Yordama mı yapıyorsunuz?

- **Bir veya daha fazla değişkenin bir sürekli değişkeni açıklaması:** Doğrusal (çoklu) regresyon

### Ölçeğin güvenirliği

- **Maddelerin iç tutarlılığı:** Cronbach alfa

## 3. Varsayımları kontrol edin

Parametrik testler (t testi, ANOVA, Pearson) verinin yaklaşık normal dağılmasını bekler.

- Çarpıklık ve basıklık değerlerine bakılır; alanda bazı kaynaklar ±1,5, bazıları ±2 aralığını ölçüt olarak alır.
- Örneklem küçükse normallik testleri ve grafikler de incelenir.
- Varsayım sağlanmıyorsa **parametrik olmayan** karşılıklar kullanılır:
  - Bağımsız t testi yerine **Mann-Whitney U**
  - ANOVA yerine **Kruskal-Wallis H**

## 4. Sonuçları doğru raporlayın

Yalnızca p değerini yazmak yetmez. Test istatistiği, serbestlik derecesi, p değeri ve **etki büyüklüğü** birlikte verilmelidir. Anlamlı bir sonuç, farkın büyük veya önemli olduğu anlamına gelmez; etki büyüklüğü bunu gösterir.

## Sık yapılan hatalar

- Üç grup için tekrar tekrar t testi yapmak (ANOVA kullanılmalı)
- Korelasyonu "neden-sonuç" olarak yorumlamak
- Ters maddeleri kodlamadan ölçek puanı hesaplamak
- Normallik varsayımını hiç kontrol etmemek


## Karar tablosu

| Amaç | Bağımlı değişken | Grup / değişken sayısı | Parametrik test | Parametrik olmayan karşılığı |
| --- | --- | --- | --- | --- |
| İki bağımsız grubu karşılaştırma | Sürekli | 2 grup | Bağımsız örneklem t testi | Mann–Whitney U |
| Aynı kişilerin iki ölçümü | Sürekli | 2 ölçüm | Eşleştirilmiş örneklem t testi | Wilcoxon işaretli sıralar |
| Üç ve üzeri bağımsız grup | Sürekli | 3+ grup | Tek yönlü ANOVA | Kruskal–Wallis H |
| İki sürekli değişken arasındaki ilişki | Sürekli | 2 değişken | Pearson korelasyonu | Spearman sıra korelasyonu |
| İki kategorik değişken arasındaki ilişki | Kategorik | 2 değişken | — | Ki-kare bağımsızlık testi |
| Bir sonucu yordama | Sürekli | 1+ yordayıcı | Doğrusal regresyon | — |
| Ölçek güvenirliği | Madde puanları | Ölçek maddeleri | Cronbach alfa | — |

## Örnek senaryolar

- **“Deney ve kontrol grubunun son test puanları farklı mı?”** İki bağımsız grup, sürekli puan: bağımsız örneklem t testi. Ayrıntı: [t testi rehberi](/blog/t-testi-nasil-yapilir-ve-yorumlanir).
- **“Eğitim programından önce ve sonra kaygı puanları değişti mi?”** Aynı kişiler, iki ölçüm: eşleştirilmiş örneklem t testi.
- **“Üç farklı öğretim yöntemi başarıyı farklılaştırıyor mu?”** Üç bağımsız grup: tek yönlü ANOVA. Ayrıntı: [ANOVA rehberi](/blog/tek-yonlu-anova-nasil-yapilir-ve-raporlanir).
- **“Çalışma süresi ve uyku birlikte sınav puanını yordar mı?”** Birden fazla yordayıcı: çoklu regresyon. Ayrıntı: [regresyon rehberi](/blog/regresyon-analizi-apa-7-raporlama).
- **“Cinsiyet ile tercih edilen öğrenme biçimi arasında ilişki var mı?”** İki kategorik değişken: ki-kare.

## Parametrik mi, parametrik olmayan mı?

Parametrik testler (t testi, ANOVA, Pearson) bağımlı değişkenin normal dağılıma yakın olmasını ve grup varyanslarının benzer olmasını varsayar. Varsayımlar ciddi biçimde bozulduğunda, özellikle küçük örneklemlerde parametrik olmayan karşılıklar tercih edilir. Normalliği çarpıklık ve basıklık değerleriyle nasıl kontrol edeceğinizi [normallik testi rehberimizde](/blog/normallik-testi-carpiklik-basiklik) anlattık. Büyük ve dengeli örneklemlerde parametrik testler küçük sapmalara karşı oldukça dayanıklıdır.

## Etki büyüklüğünü unutmayın

p değeri bir farkın veya ilişkinin tesadüfle açıklanıp açıklanamayacağını söyler; ne kadar büyük olduğunu söylemez. APA 7, her testle birlikte bir etki büyüklüğü (Cohen d, η², r, R²) ve mümkünse güven aralığı raporlanmasını ister. Büyük örneklemlerde çok küçük farklar bile anlamlı çıkabilir; yorumu etki büyüklüğüne göre yapın.

## Analizi önceden planlayın

Hangi analizi yapacağınıza veri toplamadan önce karar verin ve yöntem bölümünde yazın. Veriye baktıktan sonra “anlamlı çıkan” analizi seçmek, bulguların güvenilirliğini zedeler. Örneklem büyüklüğünü de planladığınız analize göre hesaplayın: [örneklem büyüklüğü rehberi](/blog/orneklem-buyuklugu-nasil-hesaplanir).

## Academiana ile istatistik

Academiana’nın istatistik aracında verinizi yükleyip analizi seçersiniz: betimsel istatistikler ve normallik, t testleri, ANOVA, Mann-Whitney, Kruskal-Wallis, korelasyon, regresyon, ki-kare ve Cronbach alfa. Hesaplamalar sunucuda, bilinen formüllerle yapılır ve sonuç APA 7 biçiminde tablo ve yorum cümlesi olarak gelir.`,
    sources: [
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "akademik-makale-nasil-yazilir",
    title: "Akademik Makale Nasıl Yazılır ve Dergiye Gönderilir?",
    description: "Tezden makale çıkarma, IMRAD yapısı, hedef dergi seçimi, yazar kılavuzu, ön yazı ve gönderim süreci. İlk makalesini yazacaklar için rehber.",
    category: "Makale ve yayın",
    keywords: ["akademik makale nasıl yazılır", "tezden makale çıkarma", "dergi seçimi", "makale gönderme", "IMRAD"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Konunuza uygun gerçek dergileri bulun, yazar kılavuzuna uygunluğu kontrol edin, editöre ön yazınızı hazırlayın.", href: "/kayit", label: "Makaleme başla" },
    body: `Bir tezi veya araştırmayı makaleye dönüştürmek, akademik kariyerin en önemli adımlarından biridir. Makale, tezden çok daha kısa ve odaklıdır; okuyucu ve hakem, sizden az sözle çok şey anlatmanızı bekler.

## Tezden makaleye

- Tezin bütün sorularını tek makaleye sığdırmaya çalışmayın. Çoğu zaman bir tezden, farklı sorulara odaklanan bir-iki makale çıkar.
- Literatür bölümünü ciddi biçimde kısaltın; yalnızca sorunuzla doğrudan ilgili çalışmaları tutun.
- Tezde yayımlanmış metni aynen kullanıyorsanız derginin bu konudaki kurallarını kontrol edin ve tezinize atıf yapın.

## IMRAD yapısı

Araştırma makalelerinin büyük çoğunluğu bu yapıyı izler:

- **Introduction (Giriş):** Problem, literatürdeki boşluk ve amaç
- **Method (Yöntem):** Katılımcılar, araçlar, işlem, analiz
- **Results (Bulgular):** Analiz sonuçları
- **Discussion (Tartışma):** Yorum, literatürle karşılaştırma, sınırlılıklar

Bunlara başlık, özet, anahtar kelimeler, beyanlar ve kaynakça eklenir.

## Hedef dergiyi seçmek

- **Kapsam:** Derginin yayımladığı son sayılara bakın; konunuza benzer makaleler var mı?
- **Dizinler:** Dergi hangi dizinlerde taranıyor? (TR Dizin, Web of Science, Scopus, DOAJ) Bu, akademik teşvik ve atama ölçütleri açısından önemli olabilir.
- **Süre ve ücret:** Değerlendirme süresi ve varsa yayın ücreti (APC)
- **Yağmacı dergiler:** Çok hızlı kabul vaat eden, e-postayla makale isteyen ve dizin bilgisi doğrulanamayan dergilerden uzak durun.

## Yazar kılavuzu

Her derginin bir yazar kılavuzu vardır: kelime sınırı, özet yapısı, atıf stili, tablo ve şekil kuralları, dosya biçimi, gerekli beyanlar. Kılavuza uymayan makaleler çoğu zaman hakeme gitmeden iade edilir.

## Gerekli beyanlar

Pek çok dergi şunları ister: etik kurul onayı, çıkar çatışması beyanı, finansman, yazar katkıları, veri erişilebilirliği ve son yıllarda giderek artan biçimde yapay zekâ kullanım beyanı.

## Ön yazı (cover letter)

Editöre hitaben kısa bir mektuptur: çalışmanın başlığı, kısa amacı ve katkısı, dergi kapsamına neden uygun olduğu, özgünlük ve başka bir yerde değerlendirmede olmadığı beyanı.

## Gönderimden sonra

Değerlendirme süreci haftalar veya aylar sürebilir. Sonuç genellikle kabul, küçük düzeltme, büyük düzeltme veya ret olur. Düzeltme kararı olumlu bir işarettir; hakem yorumlarına dikkatle ve madde madde cevap verin.


## Başlık ve özet: en çok okunan iki bölüm

Makalenizi okuyanların çoğu yalnızca başlığı ve özeti okur. Başlık; değişkenleri, örneklemi ve gerekiyorsa deseni içermeli, gereksiz kelimelerden arındırılmalıdır (“Bir inceleme”, “Üzerine bir çalışma” gibi). Özet, derginin istediği yapıda (yapılandırılmış veya tek paragraf) ve kelime sınırında yazılmalıdır. Ayrıntılar için [özet ve abstract rehberimize](/blog/ozet-ve-abstract-nasil-yazilir) bakın.

## Giriş bölümünü huni gibi kurun

Giriş, genelden özele daralan bir huni gibi ilerler:

1. Konunun önemi ve genel bağlam
2. Literatürde bilinenler (temalara göre, kısa)
3. Boşluk: neyin bilinmediği
4. Çalışmanın amacı ve araştırma soruları veya hipotezleri

Tezden farklı olarak makalede literatür ayrı bir bölüm değildir; girişin içinde ve kısa tutulur. Tezinizdeki uzun literatür bölümünü makaleye taşımayın; yalnızca araştırma sorusunu gerekçelendiren çalışmaları kullanın.

## Tartışmanın yapısı

Tartışma, ana bulguyu tek cümleyle hatırlatarak başlar, ardından bulguları literatürle karşılaştırır, olası açıklamaları sunar, sınırlılıkları dürüstçe belirtir ve uygulama ile gelecek araştırmalar için önerilerle biter. Bulgular bölümündeki sayıları tartışmada tekrar etmeyin. Ayrıntılı yapı için [bulgular ve tartışma rehberimize](/blog/bulgular-ve-tartisma-bolumu) bakın.

## Dergi seçerken güvenilirlik kontrolü

Hızlı yayın vaadiyle yüksek ücret talep eden, hakem süreci belirsiz dergilere dikkat edin. Bir derginin hangi dizinlerde tarandığını dizinin kendi sitesinden doğrulayın ve yayın kurulunu, hakem sürecini, yayın ücretlerini inceleyin. Yağmacı dergileri nasıl tanıyacağınızı [bu rehberde](/blog/yagmaci-dergiler-nasil-anlasilir) anlattık.

## Hakem süreci ve revizyon

Dergiler makaleleri genellikle masa reddi (editörün kapsam dışı bulması), büyük revizyon, küçük revizyon veya kabul kararıyla döndürür. Revizyon istendiğinde her hakem yorumuna madde madde cevap veren bir mektup hazırlarsınız. Bunun nasıl yazılacağını [hakem yorumlarına cevap rehberimizde](/blog/hakem-yorumlarina-cevap-nasil-verilir) anlattık. Ret kararı bir son değildir; hakem yorumlarını değerlendirip makaleyi geliştirerek başka bir dergiye gönderebilirsiniz.

## Yazarlık ve katkı beyanı

Yazar sırası ve yazarlık ölçütleri baştan konuşulmalıdır. Birçok dergi her yazarın katkısını tanımlayan bir beyan (ör. CRediT sınıflaması) ister. Çalışmaya önemli katkı vermeyen kişileri yazar olarak eklemek veya katkı veren birini yazar listesinden çıkarmak yayın etiği ihlalidir. Yapay zekâ araçları yazar olarak gösterilemez; kullanıldıysa derginin politikasına göre beyan edilir.

## Academiana ile makale

Academiana’da "Araştırma makalesi" veya "Bilimsel dergi makalesi" türü IMRAD yapısında hazır gelir. Dergi önerisi aracı, konunuza benzer makalelerin OpenAlex’te gerçekten yayımlandığı dergileri listeler; yapay zekâ dergi adı uydurmaz. Derginin yazar kılavuzunu yükleyip uygunluk kontrol listesi alabilir, ön yazı taslağı hazırlayabilir ve hakem yorumları geldiğinde madde madde cevap mektubu oluşturabilirsiniz.`,
    sources: [
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
      { text: "International Committee of Medical Journal Editors (ICMJE). Recommendations for the conduct, reporting, editing, and publication of scholarly work in medical journals.", url: "https://www.icmje.org/recommendations/" },
      { text: "Committee on Publication Ethics (COPE). Core practices.", url: "https://publicationethics.org/" },
    ],
  },
];
