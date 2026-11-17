import type { BlogPost } from "./types";

/**
 * D224: Yeni istatistik testleri ve meta-analiz rehberleri. Örnek verilerdeki bütün sayılar ürünün kendi istatistik motorundan
 * üretilir (tests/blog-d224.test.ts aynı verilerle denetler); kaynaklar gerçek eserlerdir.
 */
export const POSTS_11: BlogPost[] = [
  {
    slug: "shapiro-wilk-testi-nasil-yapilir-ve-yorumlanir",
    title: "Shapiro–Wilk Normallik Testi: Nasıl Yapılır, Nasıl Yorumlanır?",
    seoTitle: "Shapiro–Wilk Normallik Testi: Yapılışı ve Yorumu",
    description: "Shapiro–Wilk testi nedir, W ve p değeri nasıl yorumlanır, küçük ve büyük örneklemde ne yapılır? Çözümlü örnek ve APA 7 raporlama cümlesiyle.",
    category: "Araştırma ve yöntem",
    keywords: ["Shapiro-Wilk testi", "normallik testi nasıl yapılır", "Shapiro Wilk p değeri yorumlama", "normal dağılım testi", "Shapiro Wilk APA raporlama", "normallik varsayımı"],
    date: "2026-11-17",
    updated: "2026-11-17",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “Betimsel istatistikler ve normallik” her değişken için Shapiro–Wilk W ve p değerini, çarpıklık ve basıklıkla birlikte verir.", href: "/kayit", label: "Normalliğimi test et" },
    body: `Shapiro–Wilk testi, bir değişkenin **normal dağılıma** uyup uymadığını sınayan testtir. t testi, ANOVA ve regresyon gibi parametrik yöntemler normallik varsayar; bu yüzden analizden önce çoğu zaman bu testle karşılaşırsınız. Çarpıklık ve basıklığa dayalı kontrolü [normallik testi rehberimizde](/blog/normallik-testi-carpiklik-basiklik) anlattık; bu yazı Shapiro–Wilk’i tek başına ele alıyor.

Bu yazıdaki bütün sayılar, aşağıdaki örnek verilerden Academiana’nın istatistik motoruyla hesaplanmıştır; motor R’deki \`shapiro.test\` ile aynı sonucu verir.

## Test neyi sınar?

- **Sıfır hipotezi (H0):** Veri normal dağılan bir kitleden gelmiştir.
- **W istatistiği:** 0 ile 1 arasındadır; 1’e ne kadar yakınsa dağılım normale o kadar yakındır.
- **p değeri:** p < .05 ise normallikten sapma anlamlıdır, yani normallik varsayımı reddedilir. p ≥ .05 ise normallikten sapma kanıtlanamamıştır.

> p ≥ .05, verinin “kesinlikle normal” olduğunu kanıtlamaz; yalnızca sapmanın bu örneklemde fark edilemediğini söyler. Çok küçük örneklemlerde test, ciddi sapmaları bile kaçırabilir.

## Çözümlü örnek: iki farklı dağılım

Aynı büyüklükte (n = 12) iki değişkenimiz var:

- **Değişken N:** 4.1, 5.3, 4.8, 5.9, 5.1, 4.6, 5.5, 4.9, 5.2, 6.1, 4.4, 5
- **Değişken S:** 1, 1, 2, 2, 2, 3, 3, 4, 5, 8, 12, 25

| Değişken | n | Çarpıklık | W | p | Karar |
| --- | --- | --- | --- | --- | --- |
| N | 12 | 0.20 | .985 | .997 | Normalden sapma yok |
| S | 12 | 2.38 | .684 | < .001 | Normalden anlamlı sapma |

**N** değişkeninde W = .985 ve p = .997: normallik varsayımı korunur. **S** değişkeni ise uç bir değer (25) yüzünden sağa çarpıktır; W = .684, p < .001, normallik reddedilir. Bu durumda parametrik test yerine [parametrik olmayan alternatifi](/blog/parametrik-olmayan-testler-wilcoxon-friedman-dunn) ya da dönüşüm düşünülmelidir.

## Örneklem büyüklüğü sonucu nasıl etkiler?

- **Küçük örneklem (n < 20):** Test güçsüzdür; normallikten sapmayı yakalayamayabilir. Histogram ve Q–Q grafiğine de bakın.
- **Büyük örneklem (n > 300):** Test aşırı duyarlıdır; pratikte önemsiz sapmaları bile “anlamlı” bulabilir. Çarpıklık/basıklık değerlerine ve grafiklere birlikte bakın.
- **Sınır:** Shapiro–Wilk 3 ile 5000 gözlem arasında çalışır. Karşılaştırmalı güç çalışmalarında küçük ve orta örneklemler için en güçlü normallik testlerinden biri olduğu gösterilmiştir (Razali ve Wah, 2011).

## Hangi veriye uygulanır?

- **t testi ve ANOVA’da** her grubun puanlarına ayrı ayrı uygulayın.
- **Eşleştirilmiş t testinde** iki ölçümün **farklarına** uygulayın.
- **Regresyonda** değişkenlere değil, **artıklara** (modelin tahmin hatalarına) uygulayın.

## APA 7’ye göre raporlama

“Shapiro–Wilk testi, değişken N için normallikten anlamlı bir sapma göstermemiştir, W(12) = .985, p = .997; değişken S için dağılım normalden anlamlı biçimde sapmıştır, W(12) = .684, p < .001. Bu nedenle S değişkeni için parametrik olmayan bir test kullanılmıştır.”

W italik yazılır, parantez içinde örneklem büyüklüğü verilir; W ve p değerlerinin başına sıfır konmaz.

## Sık yapılan hatalar

- **Tüm veriyi tek seferde sınamak:** Gruplu analizlerde normalliği her grup için ayrı kontrol edin.
- **p > .05’i “normal olduğu kanıtlandı” diye yorumlamak.**
- **Tek başına karar vermek:** Testi grafiklerle ve çarpıklık/basıklıkla birlikte değerlendirin.
- **Normal değilse analizi bırakmak:** Büyük ve dengeli örneklemlerde t testi ve ANOVA hafif sapmalara dayanıklıdır; yine de sonucu gerekçelendirin.

## Academiana’da

Veri dosyanızı çalışmanıza yükleyip “Araçlar” → “İstatistik analizi” bölümünden betimsel istatistikleri seçtiğinizde her değişken için Shapiro–Wilk W ve p değeri, çarpıklık ve basıklıkla birlikte tabloya gelir. t testi ve ANOVA raporlarında ise grup bazında Shapiro–Wilk sonucu not olarak eklenir. Sayıları yapay zekâ üretmez; site motoru verinizden hesaplar.`,
    sources: [
      { text: "Shapiro, S. S., & Wilk, M. B. (1965). An analysis of variance test for normality (complete samples). Biometrika, 52(3–4), 591–611.", url: "https://doi.org/10.1093/biomet/52.3-4.591" },
      { text: "Razali, N. M., & Wah, Y. B. (2011). Power comparisons of Shapiro–Wilk, Kolmogorov–Smirnov, Lilliefors and Anderson–Darling tests. Journal of Statistical Modeling and Analytics, 2(1), 21–33." },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "tukey-hsd-games-howell-post-hoc-testleri",
    title: "Tukey HSD ve Games–Howell: ANOVA Sonrası Hangi Post Hoc Test Seçilir?",
    seoTitle: "Tukey HSD ve Games–Howell: ANOVA Sonrası Post Hoc",
    description: "ANOVA anlamlı çıktı, peki hangi gruplar farklı? Tukey HSD ve Games–Howell testlerinin farkı, seçim kuralı, çözümlü örnek ve APA 7 raporlama.",
    category: "Araştırma ve yöntem",
    keywords: ["Tukey HSD", "Games-Howell testi", "post hoc test seçimi", "ANOVA sonrası karşılaştırma", "Tukey testi yorumlama", "varyanslar homojen değilse post hoc"],
    date: "2026-11-17",
    updated: "2026-11-17",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “Tek yönlü varyans analizi (ANOVA)”: Levene sonucuna göre Tukey HSD ya da Games–Howell kendiliğinden seçilir.", href: "/kayit", label: "ANOVA’mı çalıştır" },
    body: `Tek yönlü ANOVA yalnızca “gruplardan en az biri farklı” der; **hangi** grupların birbirinden ayrıldığını söylemez. Bunun için ANOVA’dan sonra **post hoc** (çoklu karşılaştırma) testleri kullanılır. İki test öne çıkar: varyanslar eşitken **Tukey HSD**, eşit değilken **Games–Howell**. ANOVA’nın kendisini [ANOVA rehberimizde](/blog/tek-yonlu-anova-nasil-yapilir-ve-raporlanir) anlattık.

Bu yazıdaki bütün sayılar, aşağıdaki örnek verilerden Academiana’nın istatistik motoruyla hesaplanmıştır; Tukey ve Games–Howell sonuçları R’deki \`TukeyHSD\` ve \`rstatix::games_howell_test\` ile aynıdır.

## Neden post hoc test gerekir?

Üç grubu iki iki karşılaştırmak için üç t testi yapsanız, her birinde %5 yanılma payıyla toplam yanılma olasılığı yaklaşık %14’e çıkar. Post hoc testler bu **ailesel hata oranını** %5’te tutar.

## Hangisini seçmeli?

| Durum | Test |
| --- | --- |
| Varyanslar homojen (Levene p ≥ .05) | **Tukey HSD** |
| Varyanslar homojen değil (Levene p < .05) | **Games–Howell** |
| Grup büyüklükleri çok farklı | Games–Howell daha güvenli |
| Yalnızca kontrol grubuyla karşılaştırma | Dunnett (Tukey yerine) |

Tukey HSD, tüm ikili farklar için ortak (havuzlanmış) bir hata terimi kullanır; bu yüzden varyanslar eşit değilse yanıltabilir. Games–Howell her çift için ayrı varyans ve serbestlik derecesi hesaplar (Welch yaklaşımı).

## Örnek 1: Varyanslar eşit — Tukey HSD

Üç öğretim yönteminden sekizer öğrencinin sınav puanları:

- **A:** 62, 70, 75, 58, 68, 73, 66, 79
- **B:** 70, 66, 78, 74, 81, 69, 72, 85
- **C:** 75, 82, 71, 88, 79, 84, 69, 90

ANOVA: F(2, 21) = 4.78, p = .019. Levene testi p = .830 olduğundan varyanslar homojendir; Tukey HSD kullanılır.

| Karşılaştırma | Ortalama farkı | %95 GA | p (Tukey) |
| --- | --- | --- | --- |
| B – A | 5.50 | [-3.36, 14.36] | .283 |
| C – A | 10.88 | [2.01, 19.74] | .015 |
| C – B | 5.38 | [-3.49, 14.24] | .298 |

Yalnızca **C – A** farkı anlamlıdır (fark = 10.88, p = .015). B ile A ve C arasındaki fark anlamlı değildir.

## Örnek 2: Varyanslar eşit değil — Games–Howell

Üç grup (sekizer kişi): **D:** 50, 52, 51, 53, 50, 52, 51, 54; **E:** 48, 55, 61, 45, 66, 52, 70, 43; **F:** 57, 59, 58, 60, 58, 59, 61, 57.

D ve F grupları çok tutarlı, E grubu ise çok dağınıktır. Levene testi: F(2, 21) = 14.75, p < .001; varyanslar eşit değildir. Aynı veriye iki testi uygulayalım:

| Karşılaştırma | Ortalama farkı | p (Tukey) | p (Games–Howell) |
| --- | --- | --- | --- |
| E – D | 3.38 | .490 | .624 |
| F – D | 7.00 | .063 | < .001 |
| F – E | 3.63 | .441 | .584 |

**F – D** farkı (7.00 puan) iki grubun da çok tutarlı olduğunu hesaba katan Games–Howell’de anlamlıdır (p < .001); Tukey ise dağınık E grubunun varyansını tüm çiftlere yaydığı için aynı farkı kaçırır (p = .063). Eşit olmayan varyanslarda yanlış testi seçmek sonucu değiştirebilir.

## APA 7’ye göre raporlama

**Tukey için:** “Tukey HSD testi, C yönteminin A yönteminden anlamlı biçimde yüksek puan getirdiğini göstermiştir (fark = 10.88, %95 GA [2.01, 19.74], p = .015); diğer ikili karşılaştırmalar anlamlı bulunmamıştır.”

**Games–Howell için:** “Levene testi varyansların homojen olmadığını gösterdiğinden (p < .001) post hoc karşılaştırmalar için Games–Howell testi kullanılmıştır. F grubu, D grubundan anlamlı biçimde farklıdır (fark = 7.00, p < .001).”

## Sık yapılan hatalar

- **Önce Levene’e bakmadan Tukey kullanmak.**
- **ANOVA anlamsızken post hoc yapmak:** Genel F anlamlı değilse ikili karşılaştırmalara geçmeyin (Games–Howell’in tek başına kullanıldığı özel durumlar dışında, bunu yöntemde gerekçelendirin).
- **Bonferroni’yi her zaman en güvenli sanmak:** Tutucudur; grup sayısı arttıkça güç kaybedersiniz.
- **p değerlerini ham yazmak:** Post hoc p değerleri çoklu karşılaştırma için düzeltilmiş olmalıdır.

## Academiana’da

ANOVA raporunda motor Levene testini çalıştırır; varyanslar homojense Tukey HSD, değilse Games–Howell karşılaştırmalarını %95 güven aralıklarıyla birlikte not olarak ekler. Sayıları yapay zekâ üretmez.`,
    sources: [
      { text: "Tukey, J. W. (1949). Comparing individual means in the analysis of variance. Biometrics, 5(2), 99–114.", url: "https://doi.org/10.2307/3001913" },
      { text: "Games, P. A., & Howell, J. F. (1976). Pairwise multiple comparison procedures with unequal n’s and/or variances: A Monte Carlo study. Journal of Educational Statistics, 1(2), 113–125.", url: "https://doi.org/10.2307/1164979" },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "fisher-kesin-testi-yates-duzeltmesi",
    title: "Fisher Kesin Testi ve Yates Düzeltmesi: 2×2 Tabloda Ki-Kare Yeterli mi?",
    seoTitle: "Fisher Kesin Testi ve Yates Düzeltmesi: 2×2 Tablo",
    description: "Küçük örneklemde 2×2 çapraz tabloda ki-kare yerine Fisher kesin testi ne zaman kullanılır? Beklenen değer kuralı, Yates düzeltmesi, çözümlü örnek, APA 7.",
    category: "Araştırma ve yöntem",
    keywords: ["Fisher kesin testi", "Yates düzeltmesi", "2x2 tablo ki-kare", "beklenen frekans 5", "Fisher exact test ne zaman", "küçük örneklem ki-kare"],
    date: "2026-11-17",
    updated: "2026-11-17",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “Ki-kare bağımsızlık testi”: 2×2 tabloda Yates ve Fisher sonuçları kendiliğinden hesaplanır, beklenen değer 5’in altındaysa Fisher esas alınır.", href: "/kayit", label: "Ki-kare testimi yap" },
    body: `İki kategorik değişken arasındaki ilişkiyi sınamak için [ki-kare bağımsızlık testi](/blog/ki-kare-bagimsizlik-testi-nasil-yapilir) kullanılır. Ancak ki-kare bir **yaklaşımdır** ve örneklem küçükken bozulur. 2×2 tablolarda bu durumda **Yates düzeltmesi** ya da **Fisher kesin testi** devreye girer.

Bu yazıdaki bütün sayılar, aşağıdaki örnek tablodan Academiana’nın istatistik motoruyla hesaplanmıştır; Fisher ve Yates sonuçları R’deki \`fisher.test\` ve \`chisq.test\` ile aynıdır.

## Ki-kare ne zaman güvenilmez?

Ki-kare, beklenen frekansların yeterince büyük olduğunu varsayar. Yaygın kural: **hiçbir gözenin beklenen frekansı 5’ten küçük olmamalı** (SPSS ve çoğu ders kitabı, gözelerin %20’sinden fazlasında 5’in altı olmasını sorun sayar; 2×2 tabloda tek bir göze bile yeterlidir). Beklenen frekans, ilgili satır toplamı × sütun toplamı ÷ genel toplamdır.

## Üç yaklaşım

| Test | Ne yapar? | Ne zaman? |
| --- | --- | --- |
| Pearson ki-kare | Sürekli ki-kare dağılımına yaklaşır | Beklenen frekanslar ≥ 5 |
| Yates düzeltmeli ki-kare | Gözlenen–beklenen farktan 0,5 çıkarır | 2×2 tablo, sınırda örneklem |
| **Fisher kesin testi** | Olasılığı doğrudan hesaplar (yaklaşım yok) | 2×2 tablo, beklenen frekans < 5 |

## Çözümlü örnek

20 kişilik bir pilot çalışmada iki grup (müdahale / kontrol) ve sonuç (iyileşti / iyileşmedi):

| Grup | İyileşti | İyileşmedi | Toplam |
| --- | --- | --- | --- |
| Kontrol | 1 | 9 | 10 |
| Müdahale | 7 | 3 | 10 |

Beklenen frekanslar 4, 6, 4 ve 6’dır: iki gözede 5’in altındadır. Üç testin sonucu:

| Test | İstatistik | p |
| --- | --- | --- |
| Pearson ki-kare | χ²(1, N = 20) = 7.50 | .006 |
| Yates düzeltmeli ki-kare | χ²(1, N = 20) = 5.21 | .022 |
| Fisher kesin testi | — | .020 |

Üçü de anlamlıdır ama p değerleri farklıdır: Pearson ki-kare yaklaşımı küçük örneklemde p’yi **olduğundan küçük** gösterir (.006); kesin değer .020’dir. Sınır değerlere yakın sonuçlarda bu fark karar değiştirebilir. Beklenen frekans 5’in altında olduğu için burada Fisher kesin testi raporlanmalıdır.

Tablodan **odds oranı** da hesaplanır (örnek odds oranı): müdahale grubunda iyileşme odds’u kontrol grubuna göre yaklaşık 21.0 kat daha yüksektir (odds oranı = 21.0; ters yönden 0.05).

## APA 7’ye göre raporlama

“Beklenen frekansı 5’ten küçük gözeler bulunduğundan gruplar ile iyileşme arasındaki ilişki Fisher kesin testiyle incelenmiştir. İlişki anlamlı bulunmuştur, p = .020 (iki yönlü), N = 20; kontrol grubunda 10 kişiden 1’i, müdahale grubunda 10 kişiden 7’si iyileşmiştir.”

Fisher testinde ki-kare istatistiği yoktur; yalnızca p (ve istenirse odds oranı) raporlanır.

## Sık yapılan hatalar

- **Beklenen frekansa bakmadan ki-kare raporlamak.**
- **Yates düzeltmesini her 2×2 tabloda otomatik uygulamak:** Aşırı tutucu olabilir; beklenen frekanslar yeterliyse çoğu kaynak düzeltmesiz ki-kareyi önerir.
- **2×2’den büyük tablolarda Fisher’i hesaplanamaz sanmak:** Genişletilmiş (Freeman–Halton) hâli vardır; çoğu durumda kategori birleştirmek daha kolaydır.
- **Tek yönlü p ile iki yönlü p’yi karıştırmak:** Hipotez yönlü değilse iki yönlü p’yi raporlayın.

## Academiana’da

“Ki-kare bağımsızlık testi”nde 2×2 tablo seçtiğinizde Pearson ki-kare, Yates düzeltmeli ki-kare ve Fisher kesin testi birlikte hesaplanır. Beklenen değeri 5’ten küçük göze varsa rapor cümlesi Fisher testine göre yazılır. Sayıları yapay zekâ üretmez.`,
    sources: [
      { text: "Fisher, R. A. (1922). On the interpretation of χ² from contingency tables, and the calculation of P. Journal of the Royal Statistical Society, 85(1), 87–94.", url: "https://doi.org/10.2307/2340521" },
      { text: "Yates, F. (1934). Contingency tables involving small numbers and the χ² test. Supplement to the Journal of the Royal Statistical Society, 1(2), 217–235.", url: "https://doi.org/10.2307/2983604" },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "parametrik-olmayan-testler-wilcoxon-friedman-dunn",
    title: "Parametrik Olmayan Testler: Wilcoxon, Friedman ve Dunn Nasıl Yapılır?",
    seoTitle: "Wilcoxon, Friedman ve Dunn Testleri: Nasıl Yapılır?",
    description: "Normal dağılmayan veride eşleştirilmiş t testi, tekrarlı ölçüm ve Kruskal–Wallis sonrası ne yapılır? Wilcoxon, Friedman ve Dunn testleri, çözümlü örnek, APA 7.",
    category: "Araştırma ve yöntem",
    keywords: ["Wilcoxon işaretli sıralar testi", "Friedman testi", "Dunn testi", "parametrik olmayan testler", "Kruskal-Wallis sonrası post hoc", "normal dağılmayan veri analizi"],
    date: "2026-11-17",
    updated: "2026-11-17",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” altında Wilcoxon işaretli sıralar, Friedman ve Kruskal–Wallis (Dunn karşılaştırmalı) testlerini APA biçiminde alın.", href: "/kayit", label: "Testimi çalıştır" },
    body: `Veriniz normal dağılmıyorsa ya da ölçümleriniz sıralıysa parametrik testlerin (t testi, ANOVA) **parametrik olmayan** karşılıkları kullanılır. Bu yazı üç testi bir arada anlatıyor: eşleştirilmiş iki ölçüm için **Wilcoxon işaretli sıralar**, aynı kişilerin üç ve daha fazla ölçümü için **Friedman**, bağımsız gruplarda Kruskal–Wallis sonrası ikili karşılaştırma için **Dunn**. Normalliği nasıl kontrol edeceğinizi [Shapiro–Wilk rehberimizde](/blog/shapiro-wilk-testi-nasil-yapilir-ve-yorumlanir) anlattık.

Bu yazıdaki bütün sayılar, aşağıdaki örnek verilerden Academiana’nın istatistik motoruyla hesaplanmıştır; sonuçlar R’deki \`wilcox.test\`, \`friedman.test\` ve \`rstatix::dunn_test\` ile aynıdır.

## Hangi test hangi durumda?

| Veri yapısı | Parametrik | Parametrik olmayan |
| --- | --- | --- |
| Aynı kişilerde 2 ölçüm | Eşleştirilmiş t testi | **Wilcoxon işaretli sıralar** |
| Aynı kişilerde 3+ ölçüm | Tekrarlı ölçümler ANOVA | **Friedman** |
| 2 bağımsız grup | Bağımsız t testi | Mann–Whitney U |
| 3+ bağımsız grup | Tek yönlü ANOVA | Kruskal–Wallis (+ **Dunn**) |

Bu testler ortalamaları değil **sıraları** karşılaştırır; bu yüzden aykırı değerlere dayanıklıdır, ama normal veride parametrik testten biraz daha az güçlüdür.

## 1. Wilcoxon işaretli sıralar testi

On iki kişinin ön ve son test puanları:

- **Ön test:** 18, 22, 15, 27, 20, 24, 16, 29, 21, 19, 25, 17
- **Son test:** 21, 26, 14, 32, 26, 26, 23, 37, 12, 29, 36, 29

Test her çiftin farkını (ön – son) alır, farkların **mutlak değerlerini sıralar** ve ön testin daha yüksek olduğu, yani gerileyen kişilerin sıra toplamını (V) hesaplar. Burada yalnızca 2 kişi geriledi (farkları 1 ve 9; sıraları 1 ve 9), bu yüzden V = 10.0 küçüktür; V ne kadar küçükse son test lehine fark o kadar belirgindir.

| Ölçüm | Medyan | V | z | p | r |
| --- | --- | --- | --- | --- | --- |
| Ön test – Son test | 20.5 / 26.0 | 10.0 | -2.27 | .021 | .66 |

Fark anlamlıdır (p = .021, kesin p değeri; n < 50 ve bağ olmadığı için normal yaklaşım gerekmez). Etki büyüklüğü r = |z| / √n = .66 büyük bir etkidir.

**APA 7:** “Wilcoxon işaretli sıralar testi, son test puanlarının (Mdn = 26.0) ön test puanlarından (Mdn = 20.5) anlamlı biçimde yüksek olduğunu göstermiştir, V = 10.0, z = -2.27, p = .021, r = .66.”

## 2. Friedman testi

On kişi üç kez ölçülmüş:

- **1. ölçüm:** 12, 15, 11, 14, 13, 16, 12, 15, 14, 13
- **2. ölçüm:** 14, 13, 13, 16, 15, 18, 14, 16, 12, 15
- **3. ölçüm:** 17, 18, 16, 15, 17, 20, 15, 19, 18, 17

Friedman testi her kişinin puanlarını kendi içinde sıralar ve ölçümlerin ortalama sıralarını karşılaştırır: ortalama sıralar 1.2, 1.9, 2.9; χ²(2, N = 10) = 14.60, p < .001. **Kendall W** = .73 ölçümler arasındaki uyumu (etki büyüklüğünü) gösterir: 0 hiç fark yok, 1 tam tutarlı sıralama demektir.

Anlamlı Friedman sonrası hangi ölçümlerin ayrıldığını görmek için Holm düzeltmeli Wilcoxon karşılaştırmaları yapılır:

| Karşılaştırma | V | p | p (Holm) | r |
| --- | --- | --- | --- | --- |
| 1. ölçüm – 2. ölçüm | 12.0 | .096 | .096 | .54 |
| 1. ölçüm – 3. ölçüm | 0.0 | .005 | .016 | .90 |
| 2. ölçüm – 3. ölçüm | 1.5 | .009 | .018 | .84 |

1. ve 3. ile 2. ve 3. ölçümler arasındaki fark anlamlıdır; 1. ve 2. ölçüm arasındaki fark (düzeltmeden sonra) anlamlı değildir.

**APA 7:** “Friedman testi ölçümler arasında anlamlı bir fark göstermiştir, χ²(2, N = 10) = 14.60, p < .001, Kendall W = .73. Holm düzeltmeli Wilcoxon karşılaştırmalarına göre 3. ölçüm hem 1. ölçümden (p = .016) hem 2. ölçümden (p = .018) anlamlı biçimde farklıdır.”

## 3. Kruskal–Wallis sonrası Dunn testi

Üç bağımsız grubun (sekizer kişi) puanları sağa çarpık:

- **G1:** 3, 5, 4, 6, 2, 8, 4, 5
- **G2:** 6, 9, 7, 12, 8, 10, 7, 15
- **G3:** 11, 14, 9, 18, 13, 20, 12, 25

Kruskal–Wallis: H(2) = 16.68, p < .001, ε² = .73. Genel fark anlamlıdır; hangi çiftlerin ayrıldığını **Dunn testi** gösterir. Dunn, grupların ortalama sıralarını karşılaştırır ve bağ düzeltmesi uygular; p değerlerine Holm düzeltmesi eklenir:

| Karşılaştırma | z | p | p (Holm) |
| --- | --- | --- | --- |
| G1 – G2 | 2.30 | .021 | .043 |
| G1 – G3 | 4.07 | < .001 | < .001 |
| G2 – G3 | 1.77 | .077 | .077 |

G1 ile G2 ve G1 ile G3 arasındaki farklar anlamlıdır; G2 ile G3 arasındaki fark anlamlı değildir.

**APA 7:** “Kruskal–Wallis testi gruplar arasında anlamlı fark göstermiştir, H(2) = 16.68, p < .001. Holm düzeltmeli Dunn karşılaştırmalarına göre G1, hem G2’den (z = 2.30, p = .043) hem G3’ten (z = 4.07, p < .001) anlamlı biçimde ayrılmıştır.”

## Sık yapılan hatalar

- **Parametrik olmayan testi “kolay yol” sanmak:** Normal veride parametrik test daha güçlüdür; seçimi gerekçelendirin.
- **Kruskal–Wallis sonrası ikili karşılaştırmada Mann–Whitney’i düzeltmesiz kullanmak:** Dunn (ya da düzeltmeli Mann–Whitney) kullanın.
- **Ortalama ve standart sapma raporlamak:** Bu testlerde medyan (ve gerekirse çeyrekler arası aralık) raporlanır.
- **Friedman’ı bağımsız gruplara uygulamak:** Friedman aynı kişilerin tekrarlı ölçümleri içindir.

## Academiana’da

“İstatistik analizi”nde Wilcoxon işaretli sıralar, Friedman ve Kruskal–Wallis testleri vardır. Friedman anlamlıysa Holm düzeltmeli Wilcoxon karşılaştırmaları, Kruskal–Wallis anlamlıysa Dunn karşılaştırmaları rapora not olarak eklenir. Sayıları yapay zekâ üretmez.`,
    sources: [
      { text: "Wilcoxon, F. (1945). Individual comparisons by ranking methods. Biometrics Bulletin, 1(6), 80–83.", url: "https://doi.org/10.2307/3001968" },
      { text: "Friedman, M. (1937). The use of ranks to avoid the assumption of normality implicit in the analysis of variance. Journal of the American Statistical Association, 32(200), 675–701.", url: "https://doi.org/10.1080/01621459.1937.10503522" },
      { text: "Dunn, O. J. (1964). Multiple comparisons using rank sums. Technometrics, 6(3), 241–252.", url: "https://doi.org/10.1080/00401706.1964.10490181" },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "iki-yonlu-anova-nasil-yapilir-ve-yorumlanir",
    title: "İki Yönlü ANOVA: Ana Etki, Etkileşim ve Yorumlama (Çözümlü Örnek)",
    seoTitle: "İki Yönlü ANOVA: Etkileşim Nasıl Yorumlanır?",
    description: "İki yönlü (faktöriyel) ANOVA nedir, ana etki ve etkileşim nasıl yorumlanır, Tip III kareler toplamı ne demek? Çözümlü örnek ve APA 7 raporlama.",
    category: "Araştırma ve yöntem",
    keywords: ["iki yönlü ANOVA", "faktöriyel ANOVA", "ANOVA etkileşim etkisi", "ana etki yorumlama", "iki faktörlü varyans analizi", "iki yönlü ANOVA APA"],
    date: "2026-11-17",
    updated: "2026-11-17",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “İki yönlü varyans analizi (ANOVA)”: ana etkiler, etkileşim, kısmi eta kare ve Levene sonucu APA biçiminde gelir.", href: "/kayit", label: "İki yönlü ANOVA’mı çalıştır" },
    body: `[Tek yönlü ANOVA](/blog/tek-yonlu-anova-nasil-yapilir-ve-raporlanir) bir bağımsız değişkenin (faktörün) etkisine bakar. **İki yönlü ANOVA** ise iki faktörü birlikte inceler ve üçüncü bir soruyu da yanıtlar: bir faktörün etkisi, diğer faktörün düzeyine göre **değişiyor mu?** Bu soruya **etkileşim** denir.

Bu yazıdaki bütün sayılar, aşağıdaki örnek veriden Academiana’nın istatistik motoruyla hesaplanmıştır; sonuçlar R’deki \`car::Anova(type = 3)\` ile aynıdır.

## Üç soruya tek analiz

1. **Birinci faktörün ana etkisi:** Diğer faktörü yok sayınca A faktörünün düzeyleri farklı mı?
2. **İkinci faktörün ana etkisi:** B faktörünün düzeyleri farklı mı?
3. **Etkileşim (A × B):** A’nın etkisi B’nin düzeyine bağlı mı?

Etkileşim anlamlıysa ana etkiler tek başına yorumlanmaz; önce etkileşim anlatılır.

## Çözümlü örnek: öğretim yöntemi × sınıf düzeyi

Bir araştırmacı iki öğretim yöntemini (geleneksel, proje tabanlı) üç sınıf düzeyinde (9., 10., 11.) karşılaştırıyor. Her hücrede beş öğrenci var (toplam 30). Sınav puanları:

- **Geleneksel, 9. sınıf:** 62, 66, 60, 64, 68
- **Geleneksel, 10. sınıf:** 64, 68, 63, 70, 65
- **Geleneksel, 11. sınıf:** 66, 71, 65, 69, 72
- **Proje, 9. sınıf:** 70, 74, 69, 73, 76
- **Proje, 10. sınıf:** 78, 82, 77, 80, 84
- **Proje, 11. sınıf:** 85, 88, 83, 90, 87

Hücre ortalamaları (standart sapma):

| Sınıf | Geleneksel | Proje tabanlı | Fark |
| --- | --- | --- | --- |
| 9. | 64.0 (3.2) | 72.4 (2.9) | 8.4 |
| 10. | 66.0 (2.9) | 80.2 (2.9) | 14.2 |
| 11. | 68.6 (3.0) | 86.6 (2.7) | 18.0 |

Proje tabanlı yöntem her düzeyde daha yüksek puan getiriyor, ama **fark büyüyor**: 9. sınıfta 8.4, 10. sınıfta 14.2, 11. sınıfta 18.0 puan. Etkileşim tam olarak budur.

| Varyans kaynağı | KT | sd | KO | F | p | ηp² |
| --- | --- | --- | --- | --- | --- | --- |
| Yöntem | 1373.63 | 1 | 1373.63 | 159.72 | < .001 | .87 |
| Sınıf düzeyi | 442.07 | 2 | 221.03 | 25.70 | < .001 | .68 |
| Yöntem × Sınıf düzeyi | 116.87 | 2 | 58.43 | 6.79 | .005 | .36 |
| Hata | 206.40 | 24 | 8.60 | | | |

Levene testi: F(5, 24) = 0.06, p = .998; varyans homojenliği sağlanmıştır.

## Nasıl yorumlanır?

- **Yöntem ana etkisi** anlamlıdır (F(1, 24) = 159.72, p < .001, ηp² = .87): proje tabanlı yöntem genel olarak daha yüksek puan getirir.
- **Sınıf düzeyi ana etkisi** anlamlıdır (F(2, 24) = 25.70, p < .001, ηp² = .68): puanlar sınıf düzeyiyle artar.
- **Etkileşim** anlamlıdır (F(2, 24) = 6.79, p = .005, ηp² = .36): yöntemin avantajı üst sınıflarda büyür. Bu yüzden ana etkileri tek başına yorumlamak yanıltıcıdır; “yöntem farkı sınıf düzeyine bağlıdır” demek gerekir.

Etkileşimi **hücre ortalamaları grafiğiyle** (iki çizgi, X ekseninde sınıf düzeyi) göstermek en açık yoldur: çizgiler paralel değilse etkileşim vardır. Anlamlı etkileşimden sonra **basit ana etkilere** bakılır: her sınıf düzeyinde iki yöntem ayrı ayrı karşılaştırılır (bağımsız t testi, düzeltmeli).

## Tip III kareler toplamı nedir?

Hücrelerdeki gözlem sayıları **eşitse** (dengeli tasarım, bu örnekteki gibi) Tip I, II ve III kareler toplamı aynı sonucu verir. Sayılar eşit değilse sonuçlar ayrışır. SPSS’in varsayılanı ve en yaygın tercih **Tip III**’tür; Academiana da Tip III kullanır ve sonucu R’deki \`car::Anova(type = 3)\` ile aynı verir.

## Varsayımlar

- Gözlemler birbirinden bağımsızdır.
- Her hücrede bağımlı değişken yaklaşık normal dağılır (hücre başına az gözlem varsa artıkların normalliğine bakın).
- Hücre varyansları homojendir (Levene).
- Her hücrede en az bir gözlem vardır; hücrede tek gözlem varsa o hücrenin varyansı hesaplanamaz.

## APA 7’ye göre raporlama

“Öğretim yöntemi ve sınıf düzeyinin sınav puanı üzerindeki etkisi iki yönlü ANOVA ile incelenmiştir. Yöntemin ana etkisi, F(1, 24) = 159.72, p < .001, ηp² = .87; sınıf düzeyinin ana etkisi, F(2, 24) = 25.70, p < .001, ηp² = .68; yöntem × sınıf düzeyi etkileşimi anlamlıdır, F(2, 24) = 6.79, p = .005, ηp² = .36. Proje tabanlı yöntemin avantajı 9. sınıfta 8.4 puanken 11. sınıfta 18.0 puana çıkmıştır.”

## Sık yapılan hatalar

- **Etkileşimi atlayıp yalnızca ana etkileri yazmak.**
- **Anlamlı etkileşim varken ana etkiyi “genel sonuç” diye sunmak.**
- **Eşit olmayan hücrelerde Tip I (sıralı) kareler toplamı kullanmak.**
- **İki faktörü iki ayrı tek yönlü ANOVA ile incelemek:** Etkileşimi yakalayamazsınız ve yanılma payı artar.
- **Tekrarlı ölçümü bağımsız grup gibi analiz etmek:** Aynı kişiler tekrar ölçülüyorsa [tekrarlı ölçümler ANOVA’sı](/blog/tekrarli-olcumler-anova-kuresellik-mauchly) gerekir.

## Academiana’da

“İstatistik analizi” → “İki yönlü varyans analizi (ANOVA)” bölümünde bağımlı değişkeni ve iki faktörü seçin. Rapor hücre ortalamalarını, Tip III ANOVA tablosunu, kısmi eta kareyi ve Levene sonucunu verir; etkileşim anlamlıysa yorum uyarısı ekler. Sayıları yapay zekâ üretmez.`,
    sources: [
      { text: "Maxwell, S. E., Delaney, H. D., & Kelley, K. (2018). Designing experiments and analyzing data: A model comparison perspective (3rd ed.). Routledge." },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "tekrarli-olcumler-anova-kuresellik-mauchly",
    title: "Tekrarlı Ölçümler ANOVA: Küresellik, Mauchly ve Greenhouse–Geisser",
    seoTitle: "Tekrarlı Ölçümler ANOVA: Mauchly ve Greenhouse–Geisser",
    description: "Aynı kişilerin üç ve daha fazla ölçümü nasıl analiz edilir? Tekrarlı ölçümler ANOVA, küresellik varsayımı, Mauchly testi, Greenhouse–Geisser düzeltmesi, APA 7.",
    category: "Araştırma ve yöntem",
    keywords: ["tekrarlı ölçümler ANOVA", "Mauchly küresellik testi", "Greenhouse-Geisser düzeltmesi", "küresellik varsayımı", "tekrarlı ölçümler ANOVA yorumlama", "ön test son test izleme testi analizi"],
    date: "2026-11-17",
    updated: "2026-11-17",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “Tekrarlı ölçümler ANOVA’sı”: Mauchly, Greenhouse–Geisser, kısmi eta kare ve Holm düzeltmeli karşılaştırmalar APA biçiminde gelir.", href: "/kayit", label: "Tekrarlı ölçümlerimi analiz et" },
    body: `Aynı kişileri üç ya da daha fazla kez ölçtüğünüzde (ön test, son test, izleme testi gibi) bağımsız gruplar için olan [tek yönlü ANOVA](/blog/tek-yonlu-anova-nasil-yapilir-ve-raporlanir) uygun değildir; çünkü ölçümler birbirinden bağımsız değildir. Doğru yöntem **tekrarlı ölçümler ANOVA’sıdır** (denek içi ANOVA). İki ölçüm için [eşleştirilmiş t testi](/blog/t-testi-nasil-yapilir-ve-yorumlanir) yeterlidir.

Bu yazıdaki bütün sayılar, aşağıdaki örnek verilerden Academiana’nın istatistik motoruyla hesaplanmıştır; Mauchly, Greenhouse–Geisser ve Huynh–Feldt sonuçları R’deki \`rstatix::anova_test\` ile aynıdır.

## Neden ayrı bir ANOVA?

Aynı kişinin puanları ölçümler arasında ilişkilidir. Tekrarlı ölçümler ANOVA’sı, kişiler arası farkları (kimin genel olarak yüksek puan aldığını) hata teriminden ayırır; bu yüzden aynı veriyi bağımsız gruplar gibi analiz etmekten **daha güçlüdür**.

## Küresellik varsayımı

Bu analizin ayırt edici varsayımı **küresellik**tir: ölçüm çiftleri arasındaki farkların varyansları birbirine eşit olmalıdır. Varsayım ihlal edilirse F testi **fazla anlamlı** çıkar (tip I hata artar). Küreselliği **Mauchly testi** sınar:

- **p ≥ .05:** Küresellik sağlanmıştır; düzeltmesiz sonuçları raporlayın.
- **p < .05:** Küresellik ihlal edilmiştir; serbestlik derecelerini ε (epsilon) ile çarparak düzeltin: **Greenhouse–Geisser** (ε küçükse, tutucu) ya da **Huynh–Feldt** (ε yüksekse). Yaygın kural: ε < .75 ise Greenhouse–Geisser.
- İki ölçümde küresellik kendiliğinden sağlanır; Mauchly testi yapılmaz.

## Çözümlü örnek

On kişinin üç zamanda puanları (örneğin bir müdahale öncesi, ortası ve sonu):

- **1. ölçüm:** 22, 19, 25, 21, 24, 20, 23, 18, 26, 22
- **2. ölçüm:** 25, 24, 26, 27, 25, 26, 28, 23, 27, 26
- **3. ölçüm:** 29, 26, 33, 28, 31, 27, 32, 26, 34, 30

| Ölçüm | Ort. | SS |
| --- | --- | --- |
| 1. ölçüm | 22.00 | 2.58 |
| 2. ölçüm | 25.70 | 1.49 |
| 3. ölçüm | 29.60 | 2.88 |

**Mauchly testi:** W = .261, χ²(2) = 10.74, p = .005. Küresellik ihlal edilmiştir; Greenhouse–Geisser ε = .575 (Huynh–Feldt ε = .605). ε küçük (< .75) olduğu için Greenhouse–Geisser düzeltmeli sonuç raporlanır:

| Varyans kaynağı | KT | sd (düzeltmeli) | F | p | ηp² |
| --- | --- | --- | --- | --- | --- |
| Ölçüm | 288.87 | 1.15 | 89.24 | < .001 | .91 |
| Hata | 29.13 | 10.35 | | | |

Ölçümler arasındaki fark anlamlıdır. Düzeltmesiz sd = (2, 18) idi; düzeltme serbestlik derecelerini 1.15 ve 10.35’ye indirdi. F değeri değişmez, yalnızca p değeri tutucu hâle gelir.

## Hangi ölçümler farklı? Eşleştirilmiş karşılaştırmalar

| Karşılaştırma | Ortalama farkı | t | sd | p | p (Holm) |
| --- | --- | --- | --- | --- | --- |
| 1. ölçüm – 2. ölçüm | -3.70 | -5.69 | 9 | < .001 | < .001 |
| 1. ölçüm – 3. ölçüm | -7.60 | -34.37 | 9 | < .001 | < .001 |
| 2. ölçüm – 3. ölçüm | -3.90 | -5.52 | 9 | < .001 | < .001 |

Her ölçüm bir öncekinden anlamlı biçimde yüksektir; üç karşılaştırma için Holm düzeltmesi uygulanmıştır.

## APA 7’ye göre raporlama

“Mauchly küresellik testi küreselliğin ihlal edildiğini göstermiştir, χ²(2) = 10.74, p = .005; bu nedenle Greenhouse–Geisser düzeltmesi uygulanmıştır (ε = .575). Puanlar zamana göre anlamlı biçimde değişmiştir, F(1.15, 10.35) = 89.24, p < .001, ηp² = .91. Holm düzeltmeli eşleştirilmiş t karşılaştırmaları, her ölçümün bir öncekinden anlamlı biçimde yüksek olduğunu göstermiştir (tümü p < .001 veya daha küçük).”

## Sık yapılan hatalar

- **Mauchly testini atlamak ve düzeltmesiz F’yi raporlamak.**
- **Üç ölçümü iki iki eşleştirilmiş t testiyle karşılaştırıp düzeltme yapmamak.**
- **Eksik verisi olan kişileri sessizce silmek:** Tekrarlı ölçümler ANOVA’sı her ölçümü tam olan kişilerle çalışır; kaç kişinin dışarıda kaldığını yazın.
- **Normal dağılmayan veride tekrarlı ölçümler ANOVA’sını zorlamak:** [Friedman testi](/blog/parametrik-olmayan-testler-wilcoxon-friedman-dunn) parametrik olmayan alternatiftir.
- **Karma tasarımı (hem grup hem zaman) tek yönlü tekrarlı ANOVA ile analiz etmek:** Grup × zaman etkileşimi için karma ANOVA gerekir.

## Academiana’da

“İstatistik analizi” → “Tekrarlı ölçümler ANOVA’sı” bölümünde ölçümleri sırayla seçin. Rapor Mauchly testini, Greenhouse–Geisser ve Huynh–Feldt ε değerlerini, düzeltmeli ANOVA tablosunu ve Holm düzeltmeli eşleştirilmiş karşılaştırmaları verir; küresellik ihlal edilmişse Greenhouse–Geisser düzeltmeli, sağlanmışsa düzeltmesiz sonucu raporlar. Sayıları yapay zekâ üretmez.`,
    sources: [
      { text: "Mauchly, J. W. (1940). Significance test for sphericity of a normal n-variate distribution. The Annals of Mathematical Statistics, 11(2), 204–209.", url: "https://doi.org/10.1214/aoms/1177731915" },
      { text: "Greenhouse, S. W., & Geisser, S. (1959). On methods in the analysis of profile data. Psychometrika, 24(2), 95–112.", url: "https://doi.org/10.1007/BF02289823" },
      { text: "Maxwell, S. E., Delaney, H. D., & Kelley, K. (2018). Designing experiments and analyzing data: A model comparison perspective (3rd ed.). Routledge." },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "lojistik-regresyon-nasil-yapilir-ve-raporlanir",
    title: "Lojistik Regresyon: Nasıl Yapılır, Odds Oranı Nasıl Yorumlanır?",
    seoTitle: "Lojistik Regresyon: Yapılışı, Odds Oranı ve Raporlama",
    description: "Sonuç iki kategorili (geçti–kaldı, var–yok) ise lojistik regresyon kullanılır. Odds oranı, Nagelkerke R², doğru sınıflama, çözümlü örnek ve APA 7 raporlama.",
    category: "Araştırma ve yöntem",
    keywords: ["lojistik regresyon", "odds oranı yorumlama", "ikili lojistik regresyon", "Nagelkerke R kare", "lojistik regresyon APA", "lojistik regresyon örnek"],
    date: "2026-11-17",
    updated: "2026-11-17",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “İkili lojistik regresyon”: katsayılar, odds oranları ve güven aralıkları, model χ², Nagelkerke R² ve sınıflama APA biçiminde gelir.", href: "/kayit", label: "Lojistik regresyonumu çalıştır" },
    body: `[Doğrusal regresyon](/blog/regresyon-analizi-apa-7-raporlama) sürekli bir sonucu yordar. Sonucunuz **iki kategorili** ise (sınavı geçti–kaldı, hastalık var–yok, evet–hayır) doğrusal regresyon uygun değildir; **ikili lojistik regresyon** kullanılır. Yordayıcılar sayısal olabilir.

Bu yazıdaki bütün sayılar, aşağıdaki örnek veriden Academiana’nın istatistik motoruyla hesaplanmıştır; katsayılar, standart hatalar, sapma değerleri ve Nagelkerke R² R’deki \`glm(family = binomial)\` ile aynıdır.

## Lojistik regresyon neyi yordar?

Model, olayın (ör. “geçti”) **olasılığını** değil, onun **log odds**’unu doğrusal bir denklemle yordar: ln(p / (1 − p)) = b₀ + b₁X. Katsayıyı yorumlamak için üstelini alırız: **odds oranı** (OR) = e^b.

- **OR > 1:** Yordayıcı arttıkça olayın odds’u artar.
- **OR < 1:** Yordayıcı arttıkça olayın odds’u azalır.
- **OR = 1:** Etki yok. Güven aralığı 1’i içeriyorsa etki anlamlı değildir.

## Çözümlü örnek: çalışma saati ve sınavı geçme

24 öğrencinin haftalık çalışma saati ve sınavı geçip geçmediği (1 = geçti, 0 = kaldı):

- **Saat:** 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 12, 13, 14, 15
- **Sonuç:** 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1

Öğrencilerin 13’ü geçmiş (11’i kalmış).

| Yordayıcı | B | SH | Wald z | p | OR | OR %95 GA |
| --- | --- | --- | --- | --- | --- | --- |
| (Sabit) | -2.92 | 1.31 | -2.23 | .026 | | |
| Çalışma saati | 0.45 | 0.18 | 2.45 | .014 | 1.57 | [1.09, 2.24] |

**Model:** χ²(1, N = 24) = 10.18, p = .001; Nagelkerke R² = .46.

## Nasıl yorumlanır?

- **Odds oranı:** Haftada bir saat daha fazla çalışmak, sınavı geçme odds’unu yaklaşık 1.57 ile çarpar; yani odds’u yaklaşık %57 artırır (OR = 1.57, %95 GA [1.09, 2.24]). Güven aralığı 1’i içermediği için etki anlamlıdır.
- **Olasılığa çevirme:** Denklemden tahmin edilen geçme olasılığı 2 saatte %12, 8 saatte %66, 14 saatte %97’dir.
- **Model uyumu:** Model, yalnızca sabitli modelden anlamlı biçimde iyidir (χ² testi). **Nagelkerke R²** = .46 “açıklanan varyans”a benzer, ama doğrusal regresyondaki R² gibi yorumlanmamalıdır; Cox ve Snell R² = .35, McFadden R² = .31.
- **Sınıflama:** .50 kesme noktasıyla öğrencilerin %75.0’i doğru sınıflanır; duyarlılık (gerçek geçenleri bulma) %76.9, özgüllük (gerçek kalanları bulma) %72.7. ROC eğrisi altındaki alan (AUC) = .85: rastgele seçilen bir geçen öğrenciye, kalan bir öğrenciden daha yüksek olasılık atama şansı yaklaşık %85’dir.

## Kaç gözleme ihtiyaç var?

Genel kural, az görülen kategoride **yordayıcı başına en az 10 olay** olmasıdır (Peduzzi ve ark., 1996). Bu örnekte az görülen kategoride 11 gözlem ve 1 yordayıcı var; kural sağlanıyor. Çok yordayıcıyı küçük örneklemle denemek tahminleri kararsızlaştırır.

## Varsayımlar ve sorunlar

- Sonuç iki kategoriyle sınırlıdır ve gözlemler bağımsızdır.
- Yordayıcılar arasında aşırı çoklu doğrusal bağlantı olmamalıdır.
- **Tam ayrışma:** Bir yordayıcı sonucu kusursuz ayırıyorsa (ör. tüm geçenler 5 saatin üstünde, hepsi kalanlar altında) tahminler sonsuza gider ve model kurulamaz. Academiana bu durumda anlaşılır bir uyarı verir.
- Sürekli yordayıcının log odds ile doğrusal ilişkili olduğu varsayılır.

## APA 7’ye göre raporlama

“Haftalık çalışma saatinin sınavı geçme olasılığını yordaması ikili lojistik regresyonla incelenmiştir. Model anlamlıdır, χ²(1, N = 24) = 10.18, p = .001, Nagelkerke R² = .46. Çalışma saati anlamlı bir yordayıcıdır, B = 0.45, SH = 0.18, Wald z = 2.45, p = .014, OR = 1.57, %95 GA [1.09, 2.24]: haftada bir saat fazla çalışma, geçme odds’unu yaklaşık %57 artırmaktadır. Model öğrencilerin %75.0’ini doğru sınıflamıştır (AUC = .85).”

## Sık yapılan hatalar

- **Odds oranını olasılık ya da risk oranı gibi yorumlamak:** OR = 1.57 “olasılık 1.57 kat artar” demek değildir.
- **İki kategorili sonuca doğrusal regresyon uygulamak:** Olasılıklar 0–1 dışına taşar, varsayımlar bozulur.
- **Çok az olayla çok yordayıcı kullanmak.**
- **R² ve doğru sınıflama oranını tek başına başarı ölçütü saymak:** Dengesiz kategorilerde yüksek doğruluk yanıltıcı olabilir; duyarlılık ve özgüllüğe de bakın.
- **Tam ayrışmayı fark etmemek:** Çok büyük katsayı ve standart hata uyarı işaretidir.

## Academiana’da

“İstatistik analizi” → “İkili lojistik regresyon” bölümünde bağımlı değişkeni (iki kategorili) ve sayısal yordayıcıları seçin. Rapor katsayıları, Wald testlerini, odds oranlarını ve %95 güven aralıklarını, model χ²’sini, Nagelkerke/Cox–Snell/McFadden R²’yi ve sınıflama doğruluğunu (duyarlılık, özgüllük, AUC) verir. Sayıları yapay zekâ üretmez.`,
    sources: [
      { text: "Hosmer, D. W., Lemeshow, S., & Sturdivant, R. X. (2013). Applied logistic regression (3rd ed.). Wiley.", url: "https://doi.org/10.1002/9781118548387" },
      { text: "Peduzzi, P., Concato, J., Kemper, E., Holford, T. R., & Feinstein, A. R. (1996). A simulation study of the number of events per variable in logistic regression analysis. Journal of Clinical Epidemiology, 49(12), 1373–1379.", url: "https://doi.org/10.1016/S0895-4356(96)00236-3" },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "meta-analiz-nasil-yapilir-birlesik-etki-i2",
    title: "Meta-Analiz Nasıl Yapılır? Birleşik Etki, I² ve Yayın Yanlılığı",
    seoTitle: "Meta-Analiz Nasıl Yapılır? Birleşik Etki ve I²",
    description: "Meta-analizde çalışmalar nasıl birleştirilir? Hedges g, sabit ve rastgele etkiler, I² heterojenliği, orman ve huni grafiği, Egger testi; çözümlü örnek.",
    category: "Araştırma ve yöntem",
    keywords: ["meta-analiz nasıl yapılır", "I kare heterojenlik", "rastgele etkiler modeli", "orman grafiği", "huni grafiği Egger testi", "birleşik etki büyüklüğü"],
    date: "2026-11-17",
    updated: "2026-11-17",
    cta: { text: "Sistematik derleme sihirbazında “7. Meta-analiz” sekmesine çalışmaların n, ortalama ve SS değerlerini girin: birleşik etki, I², orman ve huni grafiği ile yöntem metni hazır gelir.", href: "/kayit", label: "Meta-analizimi yap" },
    body: `Meta-analiz, aynı soruyu inceleyen birden çok çalışmanın sonuçlarını **tek bir birleşik etkide** özetleyen istatistiksel yöntemdir. [Sistematik derlemenin](/blog/sistematik-derleme-meta-analiz-prisma) sentez adımıdır; her meta-analiz sistematik bir derlemeye dayanmalıdır, her sistematik derleme meta-analiz içermez.

Bu yazıdaki bütün sayılar, aşağıdaki örnek çalışmalardan Academiana’nın motoruyla hesaplanmıştır ve R’deki \`metafor\` paketiyle karşılaştırılmıştır. Çalışmalar bu yazı için kurgulanmış örnek veridir, gerçek bir literatürü temsil etmez.

## Adım 1: Her çalışmadan bir etki büyüklüğü çıkarın

Çalışmaların aynı ölçekte karşılaştırılabilmesi için ortak bir etki ölçüsü gerekir:

- **İki grubun ortalamaları:** Hedges g (düzeltilmiş standartlaştırılmış ortalama farkı); [Cohen d](/blog/etki-buyuklugu-rehberi-cohen-d-eta-kare)’nin küçük örneklem düzeltmeli hâli.
- **Korelasyon:** r, Fisher z’ye çevrilerek birleştirilir.
- **İkili sonuç:** Odds oranı, logaritması üzerinden birleştirilir.

## Adım 2: Çalışmaları ağırlıklandırın

Daha kesin (varyansı küçük, genelde örneklemi büyük) çalışma daha çok ağırlık alır. **Sabit etki** modeli tüm çalışmaların aynı gerçek etkiyi ölçtüğünü varsayar. **Rastgele etkiler** modeli (DerSimonian ve Laird, 1986) gerçek etkinin çalışmalar arasında değişebileceğini kabul eder ve çalışmalar arası varyansı (τ²) ağırlığa ekler. Çalışmalar yöntem, örneklem ve bağlam bakımından farklıysa rastgele etkiler genellikle daha gerçekçidir.

## Çözümlü örnek: 6 çalışma, 447 katılımcı

Bir müdahalenin (müdahale grubu / kontrol grubu) sonuç puanına etkisini inceleyen 6 çalışma:

| Çalışma | n (müdahale / kontrol) | Hedges g | %95 GA | Ağırlık (%) |
| --- | --- | --- | --- | --- |
| Ç1 | 30 / 30 | 0.73 | [0.21, 1.25] | 14.3 |
| Ç2 | 45 / 44 | 0.14 | [-0.28, 0.55] | 19.7 |
| Ç3 | 28 / 27 | 0.50 | [-0.04, 1.03] | 13.8 |
| Ç4 | 60 / 61 | 0.64 | [0.28, 1.01] | 23.1 |
| Ç5 | 22 / 22 | 0.77 | [0.16, 1.39] | 11.2 |
| Ç6 | 38 / 40 | 0.15 | [-0.29, 0.60] | 18.0 |

**Birleşik etki (rastgele etkiler):** g = 0.46, %95 GA [0.23, 0.69], z = 3.95, p < .001. Sabit etki modeliyle g = 0.46, %95 GA [0.27, 0.64].

## Adım 3: Heterojenliği değerlendirin

Çalışmalar birbirinden tesadüfen mi, yoksa gerçekten mi ayrışıyor?

- **Q testi:** Q(5) = 7.17, p = .209. Anlamlı değil; ancak Q az sayıda çalışmada düşük güçlüdür, tek başına “heterojenlik yok” kanıtı sayılmaz.
- **I²:** Toplam değişkenliğin ne kadarının tesadüften değil gerçek farklılıktan geldiğini gösterir: I² = %30.2. Higgins ve Thompson (2002) yaklaşık %25 düşük, %50 orta, %75 yüksek heterojenlik der; burada düşük–orta düzey.
- **τ²** = 0.025 (çalışmalar arası varyans), τ = 0.16.

Yüksek I²’de birleşik tek sayı yanıltıcı olabilir; nedenini (yaş grubu, müdahale süresi, ölçüm aracı) alt grup analiziyle ya da meta-regresyonla araştırın.

## Adım 4: Grafiklerle gösterin

- **Orman grafiği:** Her çalışmanın etkisi ve güven aralığı bir çizgidir; kare büyüklüğü ağırlığı gösterir; en altta birleşik etki bir elmastır. Çizgi ve elmas sıfır çizgisini kesmiyorsa etki anlamlıdır.
- **Huni grafiği:** Etki (yatay) ile kesinlik (dikey) arasındadır. Yanlılık yoksa noktalar birleşik etki çevresinde simetrik bir huni oluşturur.

## Adım 5: Yayın yanlılığına bakın

Anlamlı sonuçlar daha kolay yayımlandığı için küçük ve etkisiz çalışmalar eksik kalabilir. **Egger regresyon testi** huni grafiğinin asimetrisini sınar: kesişim t(4) = 0.64, p = .555. Anlamlı bir asimetri yoktur. Ancak **10’dan az çalışmada** bu test güvenilir değildir; burada k = 6, bu yüzden sonuç yalnızca bilgi amaçlı ve temkinle yorumlanmalıdır.

## APA 7’ye göre raporlama

“Altı çalışma (N = 447) DerSimonian–Laird rastgele etkiler modeliyle birleştirilmiştir. Birleşik etki küçük–orta düzeydedir ve anlamlıdır, g = 0.46, %95 GA [0.23, 0.69], p < .001. Çalışmalar arası heterojenlik düşük–orta düzeydedir, Q(5) = 7.17, p = .209, I² = %30.2, τ² = 0.025. Egger testi anlamlı bir huni asimetrisi göstermemiştir, p = .555 (k = 6; test düşük güçlüdür).”

## Sık yapılan hatalar

- **Çalışmaları ağırlıksız ortalamak:** Küçük çalışma büyük çalışmayla eşit sayılır.
- **Modeli sonuca bakıp seçmek:** Sabit ya da rastgele etkiler kararı, sonuçlara bakmadan, yöntem bölümünde belirtilmelidir.
- **Q anlamlı değil diye heterojenliği yok saymak.**
- **Birbirine benzemeyen çalışmaları birleştirmek:** Elma ile armut birleşik etkiyle bir araya gelmez.
- **Az çalışmayla Egger testine güvenmek.**
- **Sayıları PRISMA akışıyla tutarsız bırakmak:** Meta-analize giren çalışma sayısı akış diyagramındaki sayıyla aynı olmalıdır.

## Academiana’da

Sistematik derleme sihirbazında **“7. Meta-analiz”** sekmesini açın. Etki ölçüsünü (iki grubun ortalamaları, korelasyon, odds oranı ya da hazır etki ve standart hata) ve modeli (rastgele ya da sabit) seçin, çalışmaların değerlerini girin. Birleşik etki, Q, I², τ², Egger testi, orman ve huni grafiği ile yöntem ve bulgular metni hesaplanır; PRISMA 2020 denetim listesinde sentez maddeleri buna göre işaretlenir. Sayıları yapay zekâ üretmez, değerleri siz girersiniz.`,
    sources: [
      { text: "DerSimonian, R., & Laird, N. (1986). Meta-analysis in clinical trials. Controlled Clinical Trials, 7(3), 177–188.", url: "https://doi.org/10.1016/0197-2456(86)90046-2" },
      { text: "Higgins, J. P. T., & Thompson, S. G. (2002). Quantifying heterogeneity in a meta-analysis. Statistics in Medicine, 21(11), 1539–1558.", url: "https://doi.org/10.1002/sim.1186" },
      { text: "Egger, M., Davey Smith, G., Schneider, M., & Minder, C. (1997). Bias in meta-analysis detected by a simple, graphical test. BMJ, 315(7109), 629–634.", url: "https://doi.org/10.1136/bmj.315.7109.629" },
      { text: "Borenstein, M., Hedges, L. V., Higgins, J. P. T., & Rothstein, H. R. (2009). Introduction to meta-analysis. Wiley.", url: "https://doi.org/10.1002/9780470743386" },
      { text: "Page, M. J., McKenzie, J. E., Bossuyt, P. M., et al. (2021). The PRISMA 2020 statement: An updated guideline for reporting systematic reviews. BMJ, 372, n71.", url: "https://doi.org/10.1136/bmj.n71" },
      { text: "Viechtbauer, W. (2010). Conducting meta-analyses in R with the metafor package. Journal of Statistical Software, 36(3), 1–48.", url: "https://doi.org/10.18637/jss.v036.i03" },
    ],
  },
];
