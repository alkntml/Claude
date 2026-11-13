import type { BlogPost } from "./types";

/**
 * D164: SEO içerik planındaki ilk üç yazı (t testi, normallik, ISNAD). Örnek sayılar ve atıf biçimleri
 * Academiana’nın kendi istatistik (lib/stats) ve atıf (lib/citations) motoruyla üretilip doğrulandı; kaynaklar gerçek eserlerdir.
 */
export const POSTS_7: BlogPost[] = [
  {
    slug: "t-testi-nasil-yapilir-ve-yorumlanir",
    title: "t Testi Nasıl Yapılır ve Yorumlanır? Bağımsız ve Eşleştirilmiş Örneklem Rehberi",
    seoTitle: "t Testi Nasıl Yapılır, Yorumlanır ve APA ile Raporlanır?",
    description: "Bağımsız ve eşleştirilmiş örneklem t testi: hangisi ne zaman seçilir, Levene ve Welch, etki büyüklüğü, güven aralığı ve APA 7 raporlama, çözümlü örnekle.",
    category: "Araştırma ve yöntem",
    keywords: ["t testi nasıl yapılır", "bağımsız örneklem t testi yorumlama", "eşleştirilmiş örneklem t testi", "t testi APA raporlama", "Welch t testi", "Cohen d"],
    date: "2026-11-13",
    updated: "2026-11-13",
    cta: { text: "Veri dosyanızı çalışmanıza yükleyin; “Araçlar” → “İstatistik analizi” ile t testini çalıştırın, Levene sonucu ve etki büyüklüğüyle birlikte APA biçiminde rapor alın.", href: "/kayit", label: "Analizimi yap" },
    body: `t testi, iki ortalamanın birbirinden anlamlı biçimde farklı olup olmadığını sınayan en yaygın parametrik testtir. Tezlerde en sık kullanılan iki türü vardır: **bağımsız örneklem t testi** (iki ayrı grup) ve **eşleştirilmiş örneklem t testi** (aynı kişilerin iki ölçümü). Bu rehberde iki testi de aynı adımlarla, sayıları tek tek yorumlayarak anlatıyoruz.

Bu yazıdaki tüm sayılar, aşağıda verilen örnek verilerden Academiana’nın istatistik motoruyla hesaplanmıştır; verileri kendi programınıza girerek aynı sonuçları elde edebilirsiniz.

## Hangi t testini seçmeliyim?

- **Bağımsız örneklem t testi:** İki farklı grubun ortalamasını karşılaştırır. Örnek: deney ve kontrol grubunun sınav puanları.
- **Eşleştirilmiş (bağımlı) örneklem t testi:** Aynı katılımcıların iki ölçümünü karşılaştırır. Örnek: eğitim öncesi ve sonrası puanlar.
- **Tek örneklem t testi:** Bir grubun ortalamasını bilinen bir değerle (ör. ölçeğin orta noktası) karşılaştırır.

Üç veya daha fazla grup varsa t testi yerine tek yönlü ANOVA kullanılır. Hangi testin ne zaman seçileceğine dair genel bir tablo için [hangi istatistik analizi seçilmeli rehberimize](/blog/hangi-istatistik-analizi-secilmeli) bakabilirsiniz.

## Varsayımlar

1. **Bağımlı değişken sürekli** olmalıdır (puan, süre, ölçek toplamı gibi).
2. **Gözlemler bağımsız** olmalıdır: bir katılımcının puanı diğerininkini etkilememelidir.
3. **Normallik:** Bağımsız testte her grubun, eşleştirilmiş testte fark puanlarının dağılımı normale yakın olmalıdır. Nasıl kontrol edeceğinizi [normallik testi rehberimizde](/blog/normallik-testi-carpiklik-basiklik) anlattık.
4. **Varyansların eşitliği** (yalnızca bağımsız testte): Levene testiyle sınanır.

## Çözümlü örnek 1: Bağımsız örneklem t testi

Bir öğretim yönteminin sınav başarısına etkisini inceleyen bir çalışmada iki grubun puanları şöyle olsun:

- **Deney grubu (n = 12):** 72, 85, 78, 90, 66, 81, 77, 88, 74, 83, 79, 86
- **Kontrol grubu (n = 12):** 68, 74, 70, 79, 62, 71, 73, 76, 65, 72, 69, 75

### 1. Betimsel istatistikler

Deney grubunun ortalaması M = 79.92 (SS = 7.04), kontrol grubunun ortalaması M = 71.17 (SS = 4.76). Gruplar arasındaki ham fark 8.75 puandır.

### 2. Levene testi: hangi satırı okuyacağım?

Levene testi F(1, 22) = 1.87, p = .185 çıktı. p değeri .05’ten büyük olduğu için varyansların eşit olduğu varsayımı reddedilmez ve **eşit varyans varsayan (Student) satırı** okunur. Levene anlamlı çıksaydı (p < .05) **Welch** düzeltmeli satır okunurdu. Bu örnekte iki satır neredeyse aynı sonucu veriyor: Student t(22) = 3.57, p = .002; Welch t(19.33) = 3.57, p = .002.

> Bazı yöntem yazarları, varyanslar eşit olsa bile Welch testinin varsayılan olarak kullanılmasını önerir; çünkü eşit varyans durumunda Student testine yakın sonuç verir, eşit olmadığında ise daha güvenilirdir. Hangisini kullandığınızı yöntem bölümünde belirtin.

### 3. Anlamlılık, güven aralığı ve etki büyüklüğü

- **t(22) = 3.57, p = .002:** Fark istatistiksel olarak anlamlıdır.
- **Farkın %95 güven aralığı [3.66, 13.84]:** Aralık sıfırı içermiyor; gerçek farkın büyük olasılıkla 3.7 ile 13.8 puan arasında olduğunu gösterir.
- **Cohen d = 1.46:** Cohen’in (1988) kaba ölçütlerine göre (0.2 küçük, 0.5 orta, 0.8 büyük) büyük bir etkidir.

p değeri yalnızca farkın tesadüfle açıklanıp açıklanamayacağını söyler; farkın ne kadar büyük olduğunu etki büyüklüğü ve güven aralığı gösterir. APA 7 bu yüzden ikisinin de raporlanmasını ister.

### 4. APA 7’ye göre raporlama

“Deney grubunun sınav puanları (M = 79.92, SS = 7.04) kontrol grubunun puanlarından (M = 71.17, SS = 4.76) anlamlı düzeyde yüksektir, t(22) = 3.57, p = .002, d = 1.46, %95 GA [3.66, 13.84].”

APA biçiminde istatistik simgeleri (M, SS, t, p, d) italik yazılır; p değerinin başına sıfır konmaz (.002) ve p .001’den küçükse “p < .001” yazılır.

## Çözümlü örnek 2: Eşleştirilmiş örneklem t testi

On katılımcının bir eğitim programından önce ve sonra aldığı puanlar:

- **Ön test:** 12, 15, 11, 14, 10, 13, 16, 12, 14, 11
- **Son test:** 14, 18, 13, 15, 13, 15, 19, 14, 17, 12

Ön test ortalaması M = 12.80 (SS = 1.93), son test ortalaması M = 15.00 (SS = 2.31). Fark puanlarının ortalaması −2.20 (SS = 0.79). Sonuç: **t(9) = −8.82, p < .001**, farkın %95 güven aralığı [−2.76, −1.64], etki büyüklüğü **dz = 2.79**. İki ölçüm arasındaki korelasyon r = .95’tir.

t değerinin eksi çıkması yalnızca çıkarma sırasından (ön test − son test) kaynaklanır; yorumlarken ortalamalara bakın: son test puanları daha yüksektir.

Raporlama örneği: “Katılımcıların son test puanları (M = 15.00, SS = 2.31) ön test puanlarından (M = 12.80, SS = 1.93) anlamlı düzeyde yüksektir, t(9) = −8.82, p < .001, dz = 2.79.”

> Eşleştirilmiş testte etki büyüklüğü fark puanlarının standart sapmasıyla hesaplanır (dz). İki ölçüm güçlü biçimde ilişkili olduğunda dz, bağımsız gruplar için hesaplanan d’den çok daha büyük çıkabilir; hangisini raporladığınızı belirtin.

## Sık yapılan hatalar

- Aynı kişilerin iki ölçümüne **bağımsız** t testi uygulamak
- Levene sonucuna bakmadan rastgele bir satırı okumak
- Yalnızca p değerini raporlayıp etki büyüklüğünü ve güven aralığını atlamak
- “p = .000” yazmak (doğrusu: p < .001)
- Normal dağılmayan küçük örneklemlerde parametrik olmayan alternatifi (Mann–Whitney U veya Wilcoxon) düşünmemek
- Çalışma öncesinde gerekli örneklem büyüklüğünü hesaplamamak: bunun için [örneklem büyüklüğü rehberimize](/blog/orneklem-buyuklugu-nasil-hesaplanir) ve ücretsiz [örneklem hesaplayıcımıza](/araclar/orneklem-hesaplayici) bakabilirsiniz.

## Bulgular bölümüne yerleştirme

t testi sonuçlarını bulgular bölümünde araştırma sorusu sırasıyla verin; birden fazla karşılaştırma varsa ortalama, standart sapma, t, sd, p ve d değerlerini tek bir APA tablosunda toplayın. Yorumu bulgular bölümünde değil, tartışma bölümünde literatürle birlikte yapın. Ayrıntılar için [bulgular ve tartışma rehberimize](/blog/bulgular-ve-tartisma-bolumu) göz atın.

## Academiana ile t testi

Veri dosyanızı (CSV veya XLSX) çalışmanıza yükledikten sonra “Araçlar” → “İstatistik analizi” bölümünden bağımsız, eşleştirilmiş veya tek örneklem t testini seçin. Sonuçta betimsel istatistikler, Levene testi, Student ve Welch satırları, güven aralığı ve Cohen d birlikte gelir; hangi satırın önerildiği açıkça yazılır. Rapor APA biçiminde metne eklenebilir. Yapay zekâ sayı üretmez: tüm değerler yüklediğiniz veriden hesaplanır.`,
    sources: [
      { text: "Student. (1908). The probable error of a mean. Biometrika, 6(1), 1–25.", url: "https://doi.org/10.1093/biomet/6.1.1" },
      { text: "Welch, B. L. (1947). The generalization of “Student’s” problem when several different population variances are involved. Biometrika, 34(1–2), 28–35.", url: "https://doi.org/10.1093/biomet/34.1-2.28" },
      { text: "Levene, H. (1960). Robust tests for equality of variances. In I. Olkin (Ed.), Contributions to probability and statistics (pp. 278–292). Stanford University Press." },
      { text: "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates." },
      { text: "Delacre, M., Lakens, D., & Leys, C. (2017). Why psychologists should by default use Welch’s t-test instead of Student’s t-test. International Review of Social Psychology, 30(1), 92–101.", url: "https://doi.org/10.5334/irsp.82" },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "normallik-testi-carpiklik-basiklik",
    title: "Normallik Testi Nasıl Yapılır? Çarpıklık, Basıklık ve Shapiro–Wilk Rehberi",
    seoTitle: "Normallik Testi: Çarpıklık, Basıklık ve Shapiro–Wilk",
    description: "Verim normal dağılıyor mu? Çarpıklık ve basıklık z değerleri, Shapiro–Wilk ve Kolmogorov–Smirnov, grafikler ve normal değilse ne yapılacağı, çözümlü örnekle.",
    category: "Araştırma ve yöntem",
    keywords: ["normallik testi", "çarpıklık basıklık değerleri", "çarpıklık basıklık yorumlama", "Shapiro-Wilk testi", "normal dağılım varsayımı", "parametrik mi nonparametrik mi"],
    date: "2026-11-13",
    updated: "2026-11-13",
    cta: { text: "Veri dosyanızı yükleyin; betimsel istatistiklerde çarpıklık ve basıklık değerleri z puanlarıyla gelsin, parametrik ya da parametrik olmayan teste buna göre karar verin.", href: "/kayit", label: "Verimi incele" },
    body: `t testi, ANOVA, Pearson korelasyonu ve regresyon gibi parametrik testler, verinin (ya da artıkların) normal dağılıma yakın olduğunu varsayar. Bu nedenle analizden önce normalliği kontrol etmek, tezlerde jüri ve hakemlerin en sık sorduğu konulardan biridir. Bu rehberde normalliğin üç yolla nasıl incelendiğini ve sonuca göre hangi testin seçileceğini anlatıyoruz.

Yazıdaki sayılar, verilen örnek verilerden Academiana’nın istatistik motoruyla hesaplanmıştır.

## Normalliği incelemenin üç yolu

1. **Sayısal göstergeler:** Çarpıklık (skewness) ve basıklık (kurtosis) değerleri ile bunların z puanları.
2. **Normallik testleri:** Shapiro–Wilk ve Kolmogorov–Smirnov (Lilliefors düzeltmeli).
3. **Grafikler:** Histogram, Q–Q grafiği ve kutu grafiği.

Tek bir göstergeye dayanmak yerine bu üçünü birlikte değerlendirmek önerilir. Özellikle büyük örneklemlerde normallik testleri, pratikte önemsiz sapmaları bile anlamlı bulur; küçük örneklemlerde ise belirgin sapmaları kaçırabilir.

## Çarpıklık ve basıklık nedir?

- **Çarpıklık:** Dağılımın simetrisini gösterir. 0 tam simetri demektir. Pozitif değer sağa (yüksek değerlere doğru) uzayan bir kuyruğu, negatif değer sola uzayan bir kuyruğu gösterir.
- **Basıklık:** Dağılımın kuyruklarının normal dağılıma göre ne kadar ağır olduğunu gösterir. SPSS gibi programların verdiği “fazlalık basıklık” değerinde normal dağılım 0’dır.

Ham çarpıklık ve basıklık değerleri örneklem büyüklüğünden etkilenir. Bu yüzden değeri kendi standart hatasına bölerek **z puanı** elde edilir: z = çarpıklık / standart hata.

## Hangi eşik değerleri kullanılır?

Literatürde tek bir evrensel eşik yoktur. Sık başvurulan bir öneri (Kim, 2013) şöyledir:

- **Küçük örneklem (n < 50):** Çarpıklık ve basıklığın z puanı mutlak değerce 1.96’dan büyükse dağılım normal kabul edilmez.
- **Orta örneklem (50 ≤ n < 300):** Eşik z = 3.29 alınır.
- **Büyük örneklem (n ≥ 300):** z puanları yerine ham değerlere ve grafiklere bakılır; mutlak çarpıklık 2’den, mutlak basıklık 7’den büyükse belirgin sapma vardır.

Sosyal bilimlerde çarpıklık ve basıklığın ±1 ya da ±2 aralığında olmasının yeterli görüldüğü kaynaklar da vardır. Hangi ölçütü kullandığınızı kaynağıyla birlikte yöntem bölümünde yazın.

## Çözümlü örnek

### Örnek 1: Normale yakın dağılım

Puanlar (n = 12): 72, 85, 78, 90, 66, 81, 77, 88, 74, 83, 79, 86

- Ortalama 79.92, standart sapma 7.04
- Çarpıklık −0.47, z = −0.73
- Basıklık −0.21, z = −0.17

Her iki z puanı da mutlak değerce 1.96’dan küçüktür. Bu veride normallikten belirgin bir sapma yoktur; parametrik test (ör. t testi) kullanılabilir.

### Örnek 2: Sağa çarpık dağılım

Bir haftada kütüphanede geçirilen saatler (n = 18): 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 8, 9, 12, 15, 21

- Ortalama 6.89, standart sapma 4.80
- Çarpıklık 1.89, z = 3.52
- Basıklık 3.64, z = 3.51

İki z puanı da 1.96’yı açıkça aşıyor. Birkaç yüksek değer dağılımı sağa çekmiştir. Bu veride ortalama ve standart sapma yanıltıcı olabilir; medyan ve çeyrekler arası aralık raporlanmalı, karşılaştırma için parametrik olmayan testler düşünülmelidir.

## Shapiro–Wilk mi, Kolmogorov–Smirnov mu?

- **Shapiro–Wilk** testi, özellikle küçük ve orta örneklemlerde normallikten sapmayı yakalamada genellikle daha güçlü bulunmuştur (Razali ve Wah, 2011). Tezlerde çoğunlukla bu test raporlanır.
- **Kolmogorov–Smirnov** testi, ortalama ve standart sapma veriden tahmin edildiğinde Lilliefors düzeltmesiyle kullanılmalıdır.

Her iki testte de **p > .05** ise normallik varsayımı reddedilmez; **p < .05** ise dağılım normalden anlamlı biçimde farklıdır. Raporlama örneği: “Puanların dağılımı normallik varsayımını karşılamaktadır, W(12) = …, p = ….” (Değerleri kendi analiz çıktınızdan yazın.)

## Veri normal değilse ne yapmalı?

- **Parametrik olmayan karşılığı kullanın:** Bağımsız t testi yerine Mann–Whitney U, eşleştirilmiş t testi yerine Wilcoxon işaretli sıralar, tek yönlü ANOVA yerine Kruskal–Wallis, Pearson yerine Spearman.
- **Uç değerleri inceleyin:** Veri giriş hatası mı, gerçek bir gözlem mi? Gerçek gözlemleri gerekçesiz silmeyin.
- **Örneklem büyüklüğünü dikkate alın:** Büyük örneklemlerde ortalamaların örnekleme dağılımı normale yaklaştığından, t testi ve ANOVA hafif sapmalara karşı dayanıklıdır.
- **Dönüştürme:** Logaritma veya karekök dönüşümü sağa çarpıklığı azaltabilir; ancak sonuçların dönüştürülmüş ölçekte yorumlanacağını unutmayın.

Hangi testin hangi koşulda seçileceğini [hangi istatistik analizi seçilmeli rehberimizde](/blog/hangi-istatistik-analizi-secilmeli), iki ortalamanın karşılaştırılmasını ise [t testi rehberimizde](/blog/t-testi-nasil-yapilir-ve-yorumlanir) ayrıntılı anlattık.

## Ölçek puanlarında normallik

Likert tipi ölçeklerde tek tek maddeler sıralı veridir; normallik genellikle madde toplamı veya ortalaması üzerinden incelenir. Ölçek puanını kullanmadan önce güvenirliğini kontrol edin: [Cronbach alfa rehberimiz](/blog/cronbach-alfa-nedir-nasil-yorumlanir) ve ücretsiz [Cronbach alfa hesaplayıcımız](/araclar/cronbach-alfa) bu adımda yardımcı olur.

## Academiana ile normallik incelemesi

Veri dosyanızı çalışmanıza yüklediğinizde “İstatistik analizi” bölümündeki betimsel istatistikler, her değişken için ortalama, standart sapma, çarpıklık ve basıklık değerlerini z puanlarıyla birlikte verir. Academiana bu sürümde Shapiro–Wilk testini hesaplamaz; bu testi SPSS, R veya JASP gibi bir programla yapıp sonucunu metninize ekleyebilirsiniz. Normal dağılmayan veride Mann–Whitney U ve Kruskal–Wallis testlerini doğrudan Academiana’da çalıştırabilirsiniz.`,
    sources: [
      { text: "Shapiro, S. S., & Wilk, M. B. (1965). An analysis of variance test for normality (complete samples). Biometrika, 52(3–4), 591–611.", url: "https://doi.org/10.1093/biomet/52.3-4.591" },
      { text: "Kim, H.-Y. (2013). Statistical notes for clinical researchers: Assessing normal distribution (2) using skewness and kurtosis. Restorative Dentistry & Endodontics, 38(1), 52–54.", url: "https://doi.org/10.5395/rde.2013.38.1.52" },
      { text: "Ghasemi, A., & Zahediasl, S. (2012). Normality tests for statistical analysis: A guide for non-statisticians. International Journal of Endocrinology and Metabolism, 10(2), 486–489.", url: "https://doi.org/10.5812/ijem.3505" },
      { text: "Razali, N. M., & Wah, Y. B. (2011). Power comparisons of Shapiro–Wilk, Kolmogorov–Smirnov, Lilliefors and Anderson–Darling tests. Journal of Statistical Modeling and Analytics, 2(1), 21–33." },
    ],
  },
  {
    slug: "isnad-atif-sistemi-rehberi",
    title: "ISNAD Atıf Sistemi Rehberi: Metin İçi Atıf ve Kaynakça Örnekleri",
    seoTitle: "ISNAD Atıf Sistemi: Metin İçi Atıf ve Kaynakça Örnekleri",
    description: "ISNAD 2. edisyon metin içi (yazar-tarih) atıf ve kaynakça kuralları: kitap, makale, çok yazarlı eser, sayfa numarası ve DOI örnekleri, sık yapılan hatalar.",
    category: "Kaynak ve atıf",
    keywords: ["ISNAD atıf sistemi", "ISNAD kaynakça örnekleri", "ISNAD metin içi atıf", "ISNAD 2. edisyon", "ISNAD makale kaynak gösterme", "ISNAD kitap kaynak gösterme"],
    date: "2026-11-13",
    updated: "2026-11-13",
    cta: { text: "Kaynaklarınızı çalışmanıza ekleyin, atıf stilini ISNAD seçin; metin içi atıflar ve kaynakça otomatik oluşsun, stil değiştirmek tek tık olsun.", href: "/kayit", label: "ISNAD ile yaz" },
    body: `ISNAD Atıf Sistemi, Türkiye’de geliştirilmiş ve özellikle ilahiyat, tarih, edebiyat ve sosyal bilimlerin bazı alanlarında, pek çok DergiPark dergisinde zorunlu tutulan bir kaynak gösterme sistemidir. Güncel kılavuz **2. edisyondur** ve iki biçim sunar: **dipnotlu** ve **metin içi (yazar-tarih)**. Bu rehber metin içi biçimi örneklerle anlatır.

Yazıdaki atıf ve kaynakça örnekleri, Academiana’nın atıf motoruyla “ISNAD 2 (metin içi)” stilinde üretilmiştir. Örneklerdeki yazar, eser ve dergi adları gösterim amaçlı **kurgusaldır**; DOI de örnek biçimdir. Dergiye göndermeden önce kılavuzun resmî sitesindeki (isnadsistemi.org) güncel kuralları ve derginin yazım kurallarını mutlaka kontrol edin.

## ISNAD’ın iki biçimi

- **Dipnotlu biçim:** Atıf sayfa altına dipnot olarak yazılır; ilk atıfta eserin tam künyesi, sonraki atıflarda kısaltılmış künye verilir. Kaynakça ayrıca yazının sonunda yer alır.
- **Metin içi biçim:** Atıf, cümle içinde parantez içinde yazar soyadı ve yılla yapılır. Kaynakça yine yazının sonundadır ve dipnotlu biçimdekiyle aynı yapıdadır.

Hangi biçimin kullanılacağına dergi veya enstitü karar verir. Yazım kılavuzunuzda “ISNAD” yazıyorsa hangi biçimin istendiğini mutlaka kontrol edin.

## Metin içi atıf kuralları

### Tek yazar ve sayfa numarası

Atıf parantez içinde soyadı, yıl ve gerekirse sayfa numarasıyla yazılır. Sayfa numarası yıldan sonra virgülle eklenir ve önüne “s.” konmaz:

- (Yılmaz, 2021, 45)

### İki yazar

Metin içi atıfta iki yazarın soyadı arasına kısa çizgi konur:

- (Demir - Kaya, 2022)

Yazar adları cümlenin parçası olarak geçiyorsa (anlatı içi atıf) yalnızca yıl parantez içinde kalır:

- Demir ve Kaya (2022), öğretmen öz yeterliğinin tükenmişlikle ilişkisini incelemiştir.

### Çok yazarlı eserler

Çok yazarlı eserlerde ilk yazarın soyadından sonra “vd.” (ve diğerleri) yazılır. Örnekteki dört yazarlı makalenin atfı:

- (Smith vd., 2020)

### Aynı parantezde birden fazla kaynak

Kaynaklar noktalı virgülle ayrılır:

- (Yılmaz, 2021; Demir - Kaya, 2022)

## Kaynakça kuralları

ISNAD kaynakçasında eserler yazar soyadına göre alfabetik sıralanır. APA’dan farklı olarak yazarın **adı kısaltılmaz**, tam yazılır. Başlıklarda her kelimenin ilk harfi büyük yazılır (bağlaçlar ve edatlar hariç).

### Kitap

Yazar soyadı, adı. Kitap adı (italik). Basım yeri: Yayınevi, yıl.

- Yılmaz, Ayşe. *Örnek Eğitim Araştırmaları*. Ankara: Örnek Yayınları, 2021.

### Dergi makalesi

Yazar soyadı, adı. “Makale başlığı” (tırnak içinde). Dergi adı (italik) cilt/sayı (yıl), sayfa aralığı. DOI.

- Demir, Mehmet - Kaya, Elif. “Öğretmen Öz Yeterliği ve Tükenmişlik: Bir Örnek Çalışma”. *Örnek Eğitim Dergisi* 14/2 (2022), 45-67. https://doi.org/10.0000/ornek.2022.002

Cilt ve sayının eğik çizgiyle (14/2), yılın parantez içinde yazıldığına dikkat edin. DOI varsa bağlantı biçiminde eklenir.

### Çok yazarlı makale

- Smith, John vd. “An Example Study”. *Example Journal* 8/1 (2020), 1-20.

## APA 7 ile ISNAD arasındaki temel farklar

Aynı makalenin iki stildeki görünümü:

- **APA 7 metin içi:** (Demir & Kaya, 2022)
- **ISNAD metin içi:** (Demir - Kaya, 2022)
- **APA 7 kaynakça:** Demir, M., & Kaya, E. (2022). … *Örnek Eğitim Dergisi, 14*(2), 45–67.
- **ISNAD kaynakça:** Demir, Mehmet - Kaya, Elif. “…”. *Örnek Eğitim Dergisi* 14/2 (2022), 45-67.

Farklar özetle: ISNAD’da yazar adı tam yazılır, yıl künyenin sonuna doğru cilt/sayıdan sonra gelir, makale başlığı tırnak içindedir ve iki yazar arasında “&” yerine kısa çizgi kullanılır. APA kuralları için [APA 7 atıf rehberimize](/blog/apa-7-atif-kurallari), stillerin genel karşılaştırması için [kaynakça hazırlama rehberimize](/blog/kaynakca-nasil-hazirlanir) bakabilirsiniz.

## Sık yapılan hatalar

- Dergi kılavuzu dipnotlu biçimi isterken metin içi biçim kullanmak (veya tersi)
- Kaynakçada yazar adını APA alışkanlığıyla kısaltmak (“Yılmaz, A.”)
- Cilt ve sayıyı “14(2)” biçiminde yazmak; ISNAD’da “14/2” yazılır
- Metindeki bir atıfın kaynakçada, kaynakçadaki bir eserin metinde bulunmaması
- Stil değiştirirken atıfları elle düzeltmeye çalışıp tutarsızlık bırakmak

## Kaynakçayı hızlı oluşturmak

Elinizde DOI veya başka bir stilde yazılmış künye varsa, ücretsiz [kaynakça oluşturucumuz](/araclar/kaynakca-olusturucu) ile ISNAD künyesi üretebilir, [atıf dönüştürücümüz](/araclar/atif-donusturucu) ile mevcut bir kaynakçayı başka bir stile çevirebilirsiniz. Kaynaklarınızı Zotero veya Mendeley’de tutuyorsanız [kaynak yönetimi rehberimiz](/blog/zotero-mendeley-ile-kaynak-yonetimi) içe aktarma adımlarını anlatır.

## Academiana ile ISNAD

Academiana’da atıflar metne düz yazı olarak değil, kaynağa bağlı bir işaret olarak eklenir. Atıf stilini “ISNAD 2 (metin içi)” olarak seçtiğinizde metin içi atıflar ve kaynakça bu yazıdaki kurallarla otomatik oluşur; dergi APA isterse stili tek tıkla değiştirirsiniz. Sayfa numarası eklemek için atıfa konum bilgisi girmeniz yeterlidir. Dipnotlu ISNAD biçimi isteyen dergilerde kaynakçanızı dergi kılavuzuyla karşılaştırın.`,
    sources: [
      { text: "İSNAD Atıf Sistemi. (2018). İSNAD Atıf Sistemi Kılavuzu (2. edisyon).", url: "https://www.isnadsistemi.org/" },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
];
