import type { BlogPost } from "./types";

/**
 * D199: SEO planındaki 2 (korelasyon), 6 (etki büyüklüğü), 4 (ki-kare), 16 (DOI) ve 26 (yapay zekâ kullanım beyanı) numaralı
 * yazılar. Korelasyon ve ki-kare örneklerindeki sayılar Academiana’nın istatistik motoruyla üretildi; etki büyüklüğü yazısı
 * önceki yazılarda motorla hesaplanmış değerleri kullanır. tests/blog-d199.test.ts denetler. Kaynak listeleri gerçek eserlerdir.
 */
const APA = { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" };
const COHEN = { text: "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates." };
const FIELD = { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." };

export const POSTS_9: BlogPost[] = [
  {
    slug: "korelasyon-analizi-pearson-spearman",
    title: "Korelasyon Analizi: Pearson ve Spearman Ne Zaman Kullanılır, Nasıl Yorumlanır?",
    seoTitle: "Pearson ve Spearman Korelasyonu: Seçim ve Yorumlama",
    description: "Pearson ve Spearman korelasyonu arasındaki fark, hangisinin ne zaman seçileceği, r değerinin yorumu, aykırı değerin etkisi ve APA 7 raporlama, çözümlü örnekle.",
    category: "Araştırma ve yöntem",
    keywords: ["korelasyon analizi nasıl yapılır", "Pearson korelasyonu yorumlama", "Spearman korelasyonu", "korelasyon katsayısı yorumu", "korelasyon APA raporlama", "Pearson Spearman farkı"],
    date: "2026-11-15",
    updated: "2026-11-15",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “Korelasyon analizi” ile Pearson veya Spearman katsayılarını APA biçiminde belgenize ekleyin.", href: "/kayit", label: "Korelasyonumu hesapla" },
    body: `Korelasyon analizi, iki değişkenin birlikte değişip değişmediğini ve bu ilişkinin **yönünü** ve **gücünü** gösterir. “Okuma süresi arttıkça kelime bilgisi de artıyor mu?”, “Kaygı ile sınav başarısı arasında ilişki var mı?” gibi sorular tezlerde en sık korelasyonla incelenir. En yaygın iki türü **Pearson** ve **Spearman** korelasyonlarıdır. Bu rehberde ikisinin farkını, hangisini ne zaman seçeceğinizi ve sonuçları nasıl raporlayacağınızı aynı örnek veri üzerinde gösteriyoruz.

Bu yazıdaki bütün sayılar, aşağıdaki örnek veriden Academiana’nın istatistik motoruyla hesaplanmıştır.

## Korelasyon katsayısı neyi anlatır?

Korelasyon katsayısı −1 ile +1 arasında değer alır:

- **Pozitif değer:** Bir değişken artarken diğeri de artma eğilimindedir.
- **Negatif değer:** Bir değişken artarken diğeri azalma eğilimindedir.
- **Sıfıra yakın değer:** Doğrusal (Pearson) veya tekdüze (Spearman) bir ilişki yoktur.

Katsayının büyüklüğü ilişkinin gücünü gösterir. Cohen’in (1988) yaygın kullanılan ölçütlerine göre .10 küçük, .30 orta, .50 büyük bir ilişkidir. Bu ölçütler kaba rehberlerdir; alanınızdaki tipik değerlerle birlikte yorumlayın.

> Korelasyon nedensellik değildir. İki değişkenin ilişkili olması birinin diğerine neden olduğunu göstermez; üçüncü bir değişken her ikisini de etkiliyor olabilir.

## Pearson mı, Spearman mı?

| Özellik | Pearson | Spearman |
| --- | --- | --- |
| Ne ölçer? | Doğrusal ilişki | Tekdüze (sıralı) ilişki |
| Veri türü | Sürekli (aralık/oran) | Sıralı veya sürekli |
| Normallik | İki değişkenin normale yakın olması beklenir | Gerekmez |
| Aykırı değerlere duyarlılık | Yüksek | Düşük |
| Hesaplama | Ham puanlar | Puanların sıraları |

Pratik kural: İki sürekli değişken normale yakın dağılıyorsa ve saçılım grafiğinde ilişki doğrusal görünüyorsa **Pearson**; değişkenlerden biri sıralıysa, dağılım belirgin biçimde çarpıksa veya aykırı değerler varsa **Spearman** kullanın. Normalliği nasıl kontrol edeceğinizi [normallik testi rehberimizde](/blog/normallik-testi-carpiklik-basiklik) anlattık.

## Çözümlü örnek: okuma süresi ve kelime bilgisi

Bir araştırmacı 12 öğrencinin haftalık okuma süresini (saat) ve bir kelime testindeki puanını kaydediyor:

- **Okuma süresi:** 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 20
- **Kelime testi puanı:** 52, 61, 54, 57, 58, 66, 60, 70, 62, 65, 73, 59

Son öğrenci haftada 20 saat okuyor; diğerlerinden çok farklı bir değer (aykırı değer).

### 1. Önce saçılım grafiğine bakın

Korelasyon hesaplamadan önce saçılım grafiği çizmek, ilişkinin biçimini ve aykırı değerleri görmenin en hızlı yoludur. Bu veride on bir öğrenci yukarı doğru bir çizgi oluştururken 20 saatlik öğrenci grafiğin sağ alt köşesinde tek başına durur.

### 2. Pearson ve Spearman sonuçları

| Analiz | Katsayı | sd | p | %95 GA |
| --- | --- | --- | --- | --- |
| Pearson (12 öğrenci) | r = .24 | 10 | .443 | [−.38, .72] |
| Spearman (12 öğrenci) | rs = .64 | 10 | .025 | |
| Pearson (aykırı değer çıkarılınca, 11 öğrenci) | r = .84 | 9 | .001 | [.47, .96] |
| Spearman (aykırı değer çıkarılınca, 11 öğrenci) | rs = .81 | 9 | .002 | |

### 3. Ne oldu?

- **Pearson, tek bir aykırı değer yüzünden ilişkiyi kaçırdı.** On iki öğrenciyle r = .24 ve anlamlı değil (p = .443). Oysa aykırı değer çıkarıldığında r = .84 ile güçlü ve anlamlı bir ilişki ortaya çıkıyor.
- **Spearman aykırı değerden çok daha az etkilendi.** Sıralarla çalıştığı için 20 saatlik değer yalnızca “en yüksek sıra” olarak hesaba girdi; rs = .64 ile ilişkiyi yakaladı (p = .025).

Bu örnek, korelasyondan önce veriye bakmanın ve doğru katsayıyı seçmenin neden önemli olduğunu gösteriyor.

### 4. Aykırı değerle ne yapmalı?

Bir değeri yalnızca sonucu beğenmediğiniz için çıkaramazsınız. Önce değerin bir **veri giriş hatası** olup olmadığını kontrol edin. Gerçek bir değerse:

- Spearman gibi aykırı değere dayanıklı bir yöntem kullanın, ya da
- Analizi aykırı değerle ve aykırı değer olmadan ayrı ayrı raporlayın ve bunu yöntem bölümünde gerekçelendirin.

## Belirleme katsayısı: r²

Pearson katsayısının karesi (r²), bir değişkendeki varyansın ne kadarının diğeriyle ortak olduğunu gösterir. Örnekteki r = .84 için r² ≈ .70’tir: kelime puanlarındaki varyansın yaklaşık %70’i okuma süresiyle ortaktır. Bu, ilişkinin pratik önemini anlatmanın kolay bir yoludur.

## Korelasyon matrisi

Birden fazla değişkeniniz varsa tüm ikili korelasyonları tek bir tabloda verin. Tablonun alt üçgenini doldurmak ve anlamlılığı yıldızla göstermek yaygındır. Çok sayıda korelasyon hesapladığınızda bazılarının tesadüfen anlamlı çıkabileceğini unutmayın; hangi ilişkileri önceden hipotez olarak belirlediğinizi yöntemde yazın.

## APA 7’ye göre raporlama

**Pearson için:** “Haftalık okuma süresi ile kelime testi puanı arasında güçlü ve pozitif bir ilişki bulunmuştur, r(9) = .84, p = .001, %95 GA [.47, .96].”

**Spearman için:** “Değişkenlerden birinin dağılımında aykırı değer bulunduğundan Spearman sıra korelasyonu kullanılmıştır. Okuma süresi ile kelime puanı arasında pozitif ve anlamlı bir ilişki bulunmuştur, rs(10) = .64, p = .025.”

**Yazım kuralları:**

- r ve p italik yazılır; parantez içinde serbestlik derecesi (n − 2) verilir.
- Korelasyon ve p değerlerinin başına sıfır konmaz (.84, .025).
- p .001’den küçükse “p < .001” yazılır.

## Sık yapılan hatalar

- Saçılım grafiğine bakmadan korelasyon hesaplamak
- Korelasyonu nedensellik diliyle yorumlamak (“okuma süresi kelime bilgisini artırır”)
- Doğrusal olmayan bir ilişkiyi Pearson ile ölçüp “ilişki yok” demek
- Aykırı değerleri gerekçesiz çıkarmak
- Yalnızca anlamlılığı raporlayıp katsayının büyüklüğünü yorumlamamak

Bir değişkenin diğerini ne kadar yordadığını sınamak istiyorsanız korelasyondan regresyona geçmeniz gerekir: [regresyon rehberimiz](/blog/regresyon-analizi-apa-7-raporlama). Hangi analizin hangi soruya uygun olduğu için [analiz seçme rehberimize](/blog/hangi-istatistik-analizi-secilmeli) bakın.

## Academiana ile korelasyon

Veri dosyanızı çalışmanıza yükledikten sonra “Araçlar” → “İstatistik analizi” → “Korelasyon analizi” bölümünde değişkenleri seçin ve Pearson veya Spearman yöntemini belirleyin. Sonuçta katsayılar, serbestlik dereceleri ve p değerleri APA biçiminde gelir; tablo olarak belgenize eklenir. İlişkinin biçimini görmek için “Grafik oluştur” → “Saçılım grafiği” ile regresyon doğrulu bir grafik ekleyebilirsiniz. Sayılar yapay zekâ tarafından üretilmez; sitenin istatistik motoru verinizden hesaplar.`,
    sources: [
      { text: "Pearson, K. (1896). Mathematical contributions to the theory of evolution. III. Regression, heredity, and panmixia. Philosophical Transactions of the Royal Society of London. Series A, 187, 253–318." },
      { text: "Spearman, C. (1904). The proof and measurement of association between two things. The American Journal of Psychology, 15(1), 72–101." },
      COHEN, FIELD, APA,
    ],
  },
  {
    slug: "etki-buyuklugu-rehberi-cohen-d-eta-kare",
    title: "Etki Büyüklüğü Nedir? Cohen d, Eta Kare, r ve R² ile Yorumlama Rehberi",
    seoTitle: "Etki Büyüklüğü Rehberi: Cohen d, Eta Kare, r ve R²",
    description: "Etki büyüklüğü nedir, neden p değerinden önemlidir? Cohen d, eta kare, omega kare, r, R² ve Cramér V nasıl yorumlanır ve APA 7’ye göre nasıl raporlanır?",
    category: "Araştırma ve yöntem",
    keywords: ["etki büyüklüğü nedir", "Cohen d yorumlama", "eta kare yorumlama", "etki büyüklüğü hesaplama", "omega kare", "etki büyüklüğü APA"],
    date: "2026-11-15",
    updated: "2026-11-15",
    cta: { text: "Academiana’nın istatistik analizi aracı her testle birlikte uygun etki büyüklüğünü (Cohen d, η², R², Cramér V) hesaplar ve APA biçiminde raporlar.", href: "/kayit", label: "Analizimi yap" },
    body: `Bir araştırmada “anlamlı fark bulundu” demek, sonucun yalnızca yarısını anlatır. Farkın ya da ilişkinin **ne kadar büyük** olduğunu söyleyen ölçü **etki büyüklüğüdür**. APA 7, istatistiksel testlerle birlikte etki büyüklüğünün ve mümkünse güven aralığının raporlanmasını ister. Bu rehberde en sık kullanılan etki büyüklüklerini, nasıl yorumlanacaklarını ve hangi testle hangisinin raporlanacağını anlatıyoruz.

Bu yazıdaki örnek değerler, blogumuzdaki çözümlü örneklerde Academiana’nın istatistik motoruyla hesaplanmış sonuçlardır.

## p değeri neden yetmez?

p değeri, gözlenen farkın veya ilişkinin yalnızca tesadüfle ortaya çıkma olasılığına dair bir ölçüdür. İki önemli sınırlılığı vardır:

- **Örneklem büyüklüğüne bağlıdır.** Çok büyük örneklemlerde önemsiz derecede küçük farklar bile anlamlı çıkabilir.
- **Büyüklük hakkında bilgi vermez.** p = .001 ile p = .04 arasındaki fark, etkinin büyüklüğü hakkında doğrudan bir şey söylemez.

Etki büyüklüğü ise örneklem büyüklüğünden büyük ölçüde bağımsızdır ve farklı çalışmaları karşılaştırmayı, meta-analizde birleştirmeyi mümkün kılar.

## Etki büyüklüğü türleri

### Cohen d (iki ortalama arasındaki fark)

İki grup ortalaması arasındaki farkın, standart sapma birimiyle ifadesidir. Bağımsız ve eşleştirilmiş t testleriyle raporlanır. [t testi rehberimizdeki](/blog/t-testi-nasil-yapilir-ve-yorumlanir) örnekte deney ve kontrol grubu arasında **d = 1.46** bulunmuştu: iki grubun ortalaması yaklaşık bir buçuk standart sapma farklıdır.

Eşleştirilmiş testte fark puanlarının standart sapmasıyla hesaplanan **dz** kullanılır; aynı rehberdeki ön test–son test örneğinde dz = 2.79 idi.

### Eta kare (η²) ve omega kare (ω²)

ANOVA’da bağımlı değişkendeki toplam varyansın gruplar tarafından açıklanan oranıdır. [ANOVA rehberimizdeki](/blog/tek-yonlu-anova-nasil-yapilir-ve-raporlanir) örnekte **η² = .33** bulunmuştu: puanlardaki değişkenliğin %33’ü öğretim yöntemiyle açıklanıyordu. η², özellikle küçük örneklemlerde etkiyi olduğundan büyük gösterme eğilimindedir; daha az yanlı bir tahmin olan **ω²** aynı örnekte .28’dir.

### r (korelasyon katsayısı)

Korelasyon katsayısı kendisi bir etki büyüklüğüdür. [Korelasyon rehberimizdeki](/blog/korelasyon-analizi-pearson-spearman) örnekte aykırı değer çıkarıldığında **r = .84** bulunmuştu.

### R² ve düzeltilmiş R²

Regresyonda modelin açıkladığı varyans oranıdır. [Regresyon rehberimizdeki](/blog/regresyon-analizi-apa-7-raporlama) iki yordayıcılı modelde **R² = .65**, düzeltilmiş **R² = .60** idi.

### Cramér V

İki kategorik değişken arasındaki ilişkinin gücüdür ve ki-kare testiyle raporlanır. [Ki-kare rehberimizdeki](/blog/ki-kare-bagimsizlik-testi-nasil-yapilir) örnekte **V = .31** bulunmuştur.

## Yorumlama ölçütleri

| Etki büyüklüğü | Küçük | Orta | Büyük | Kullanıldığı test |
| --- | --- | --- | --- | --- |
| Cohen d | 0.20 | 0.50 | 0.80 | t testleri |
| η² | .01 | .06 | .14 | ANOVA |
| r | .10 | .30 | .50 | Korelasyon |
| f² | .02 | .15 | .35 | Regresyon |

Bu eşikler Cohen’in (1988) davranış bilimleri için önerdiği kaba ölçütlerdir. Cohen’in kendisi de bu değerlerin alanın bağlamıyla birlikte yorumlanması gerektiğini vurgular. Örneğin eğitim müdahalelerinde “küçük” görünen bir etki, binlerce öğrenciye uygulandığında önemli bir pratik kazanç anlamına gelebilir. Mümkünse kendi alanınızdaki benzer çalışmaların etki büyüklükleriyle karşılaştırın. Cramér V için ölçütler tablonun boyutuna (serbestlik derecesine) göre değişir.

## Hangi testle hangi etki büyüklüğü?

| Analiz | Raporlanacak etki büyüklüğü |
| --- | --- |
| Bağımsız örneklem t testi | Cohen d (ve farkın güven aralığı) |
| Eşleştirilmiş örneklem t testi | dz |
| Tek yönlü ANOVA | η² veya ω² |
| Korelasyon | r (veya rs) ve gerekirse r² |
| Regresyon | R², düzeltilmiş R², standardize β |
| Ki-kare | Cramér V (2 × 2 tabloda φ) |
| Mann–Whitney U | r (z / √N) |

## Etki büyüklüğü ve örneklem büyüklüğü

Etki büyüklüğü, çalışmayı planlarken de kullanılır. Güç analizinde beklenen etki büyüklüğünü girerek gerekli örneklem büyüklüğünü hesaplarsınız: beklenen etki küçüldükçe daha büyük örneklem gerekir. Bu hesaplama için [örneklem büyüklüğü rehberimize](/blog/orneklem-buyuklugu-nasil-hesaplanir) ve ücretsiz [örneklem hesaplayıcımıza](/araclar/orneklem-hesaplayici) bakın.

## APA 7’ye göre raporlama

Etki büyüklüğünü test istatistiğinin hemen ardından verin:

- “… t(22) = 3.57, p = .002, d = 1.46, %95 GA [3.66, 13.84].”
- “… F(2, 27) = 6.74, p = .004, η² = .33.”

d ve R² italik yazılır; η², ω² ve β gibi Yunan harfleri italik yazılmaz. 1’den büyük olamayan değerlerin (η², r, R²) başına sıfır konmaz; d 1’den büyük olabileceği için başına sıfır konur (0.45 gibi).

## Sık yapılan hatalar

- Yalnızca p değerini raporlamak
- Anlamlı olmayan sonuçlarda etki büyüklüğünü atlamak (anlamsız sonuçlarda da raporlanmalıdır)
- Cohen’in eşiklerini bağlamdan bağımsız, kesin sınırlar gibi kullanmak
- Eşleştirilmiş testte dz ile bağımsız d’yi karıştırmak
- Küçük örneklemde η²’yi düzeltmeden yorumlamak

## Academiana ile etki büyüklüğü

Academiana’nın istatistik analizi aracı her testle birlikte uygun etki büyüklüğünü hesaplar: t testlerinde Cohen d ve güven aralığı, ANOVA’da η², regresyonda R² ve standardize β, ki-karede Cramér V. Sonuçlar APA biçiminde gelir ve tek tıkla belgenize tablo olarak eklenir; asistandan yorum istediğinizde etki büyüklüğü de yorumlanır, yeni sayı üretilmez.`,
    sources: [
      COHEN,
      { text: "Lakens, D. (2013). Calculating and reporting effect sizes to facilitate cumulative science: A practical primer for t-tests and ANOVAs. Frontiers in Psychology, 4, 863." },
      { text: "Cumming, G. (2014). The new statistics: Why and how. Psychological Science, 25(1), 7–29." },
      { text: "Sullivan, G. M., & Feinn, R. (2012). Using effect size—or why the P value is not enough. Journal of Graduate Medical Education, 4(3), 279–282." },
      APA,
    ],
  },
  {
    slug: "ki-kare-bagimsizlik-testi-nasil-yapilir",
    title: "Ki-Kare Bağımsızlık Testi Nasıl Yapılır? Çapraz Tablo, Cramér V ve APA Raporlama",
    seoTitle: "Ki-Kare Bağımsızlık Testi Nasıl Yapılır ve Yorumlanır?",
    description: "Ki-kare bağımsızlık testi adım adım: çapraz tablo, beklenen frekanslar, varsayımlar, Cramér V etki büyüklüğü ve APA 7 raporlama, çözümlü örnek ve sık hatalarla.",
    category: "Araştırma ve yöntem",
    keywords: ["ki-kare testi nasıl yapılır", "ki-kare bağımsızlık testi", "çapraz tablo yorumlama", "Cramér V", "ki kare APA raporlama", "kategorik değişken analizi"],
    date: "2026-11-15",
    updated: "2026-11-15",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “Ki-kare bağımsızlık testi” ile çapraz tabloyu, χ² değerini ve Cramér V’yi APA biçiminde alın.", href: "/kayit", label: "Ki-karemi hesapla" },
    body: `Ki-kare (χ²) bağımsızlık testi, **iki kategorik değişken arasında ilişki olup olmadığını** sınar. “Öğrenme biçimi tercihi cinsiyete göre farklılaşıyor mu?”, “Mezuniyet durumu ile çalışma durumu arasında ilişki var mı?” gibi sorular, anket verisiyle çalışan tezlerde sıkça ki-kare ile incelenir. Bu rehberde testi çapraz tablodan APA raporlamasına kadar bir örnek üzerinde anlatıyoruz.

Bu yazıdaki bütün sayılar, aşağıdaki örnek veriden Academiana’nın istatistik motoruyla hesaplanmıştır.

## Ne zaman kullanılır?

- İki değişken de **kategoriktir** (cinsiyet, tercih, evet/hayır, eğitim düzeyi gibi).
- Gözlemler **bağımsızdır**: her katılımcı tabloda yalnızca bir hücrede yer alır.
- Veriler **frekans** (kişi sayısı) olarak sayılır; yüzde veya ortalama değil.

Bağımlı değişkeniniz sürekli bir puansa ki-kare değil, [t testi](/blog/t-testi-nasil-yapilir-ve-yorumlanir) veya [ANOVA](/blog/tek-yonlu-anova-nasil-yapilir-ve-raporlanir) kullanılır.

## Hipotezler

- **H0 (sıfır hipotezi):** İki değişken birbirinden bağımsızdır; tercih cinsiyete göre farklılaşmaz.
- **H1 (alternatif hipotez):** İki değişken arasında ilişki vardır.

## Çözümlü örnek: cinsiyet ve öğrenme biçimi tercihi

120 üniversite öğrencisine yüz yüze, çevrim içi ve karma (hibrit) öğrenme biçimlerinden hangisini tercih ettikleri soruluyor.

### 1. Gözlenen frekanslar (çapraz tablo)

| Cinsiyet | Yüz yüze | Çevrim içi | Karma | Toplam |
| --- | --- | --- | --- | --- |
| Kadın | 18 | 10 | 32 | 60 |
| Erkek | 28 | 18 | 14 | 60 |
| Toplam | 46 | 28 | 46 | 120 |

### 2. Beklenen frekanslar

Beklenen frekans, iki değişken bağımsız olsaydı her hücrede görülecek sayıdır: satır toplamı × sütun toplamı / genel toplam. Örneğin “Kadın – Karma” hücresi için 60 × 46 / 120 = 23.

| Cinsiyet | Yüz yüze | Çevrim içi | Karma |
| --- | --- | --- | --- |
| Kadın | 23 | 14 | 23 |
| Erkek | 23 | 14 | 23 |

Kadınlarda karma öğrenmeyi tercih edenler beklenenden fazla (32’ye karşı 23), erkeklerde ise yüz yüze (28’e karşı 23) ve çevrim içi (18’e karşı 14) tercih beklenenden fazladır.

### 3. Test sonucu

- **χ²(2, N = 120) = 11.50, p = .003:** Öğrenme biçimi tercihi ile cinsiyet arasında anlamlı bir ilişki vardır.
- **Serbestlik derecesi:** (satır sayısı − 1) × (sütun sayısı − 1) = (2 − 1) × (3 − 1) = 2.
- **Cramér V = .31:** İlişkinin gücüdür. 0 ile 1 arasında değer alır; bu tablo boyutunda orta düzey bir ilişkiye karşılık gelir. Etki büyüklüklerinin genel yorumu için [etki büyüklüğü rehberimize](/blog/etki-buyuklugu-rehberi-cohen-d-eta-kare) bakın.

### 4. Varsayım kontrolü: beklenen frekanslar

Ki-kare testinin güvenilir olması için beklenen frekansların yeterince büyük olması gerekir. Yaygın kural: **hücrelerin en az %80’inde beklenen frekans 5 veya üzeri olmalı ve hiçbir hücrede 1’in altında olmamalıdır.** Bu örnekte en küçük beklenen frekans 14 olduğu için varsayım karşılanmaktadır.

Beklenen frekanslar küçükse:

- 2 × 2 tablolarda **Fisher’in kesin testi** kullanılır.
- Daha büyük tablolarda, anlamlı biçimde birleştirilebilecek kategoriler birleştirilir (ör. az seçilen iki seçeneği “diğer” altında toplamak). Bu kararı yöntem bölümünde gerekçelendirin.

## APA 7’ye göre raporlama

“Öğrenme biçimi tercihinin cinsiyete göre farklılaşıp farklılaşmadığı ki-kare bağımsızlık testiyle incelenmiştir. Tercih ile cinsiyet arasında anlamlı bir ilişki bulunmuştur, χ²(2, N = 120) = 11.50, p = .003, Cramér V = .31. Kadın öğrenciler karma öğrenmeyi (%53.3), erkek öğrenciler ise yüz yüze öğrenmeyi (%46.7) daha çok tercih etmiştir.”

**Yazım kuralları:**

- χ² sembolünden sonra parantez içinde serbestlik derecesi ve örneklem büyüklüğü verilir.
- Çapraz tabloyu frekans ve satır yüzdeleriyle birlikte sunun; okur ilişkinin yönünü tablodan görebilmelidir.
- p değerinin başına sıfır konmaz.

Tablo biçimi için [APA 7 tablo ve şekil rehberimize](/blog/tez-tablo-ve-sekil-apa-7) bakın.

## Uyum iyiliği ki-karesi ile farkı

Ki-kare testinin iki yaygın kullanımı vardır:

- **Bağımsızlık testi** (bu yazının konusu): İki kategorik değişken arasında ilişki var mı?
- **Uyum iyiliği testi:** Tek bir kategorik değişkenin dağılımı beklenen bir dağılıma uyuyor mu? (Ör. “Seçenekler eşit oranda mı tercih edildi?”)

İkisinin hesaplaması benzer olsa da sordukları soru farklıdır; raporlarken hangisini kullandığınızı açıkça yazın.

## Sık yapılan hatalar

- Yüzdelerle veya ortalamalarla ki-kare hesaplamak (frekans kullanılmalıdır)
- Aynı kişinin birden fazla hücrede yer aldığı verilere (çoklu seçim soruları) ki-kare uygulamak
- Beklenen frekans varsayımını kontrol etmemek
- Anlamlı sonuçta ilişkinin yönünü tablodan yorumlamamak
- Etki büyüklüğünü (Cramér V) raporlamamak

## Academiana ile ki-kare

Veri dosyanızı çalışmanıza yükledikten sonra “Araçlar” → “İstatistik analizi” → “Ki-kare bağımsızlık testi” bölümünde iki kategorik değişkeni seçin. Sonuçta gözlenen frekanslar satır yüzdeleriyle birlikte, χ² değeri, serbestlik derecesi, p değeri ve Cramér V APA biçiminde gelir; 2×2 tablolarda Yates düzeltmeli χ² ve Fisher’in kesin testi de hesaplanır; beklenen frekansı 5’in altında göze varsa sonuç Fisher testine göre yazılır. Tablo tek tıkla belgenize eklenir. Hangi testin hangi soruya uygun olduğunu [analiz seçme rehberimizde](/blog/hangi-istatistik-analizi-secilmeli) bulabilirsiniz.`,
    sources: [
      { text: "Pearson, K. (1900). On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling. The London, Edinburgh, and Dublin Philosophical Magazine and Journal of Science, 50(302), 157–175." },
      { text: "Cramér, H. (1946). Mathematical methods of statistics. Princeton University Press." },
      { text: "Agresti, A. (2019). An introduction to categorical data analysis (3rd ed.). Wiley." },
      COHEN, APA,
    ],
  },
  {
    slug: "doi-nedir-nasil-bulunur",
    title: "DOI Nedir, Nasıl Bulunur ve Doğrulanır? Kaynakçada DOI Kullanım Rehberi",
    seoTitle: "DOI Nedir, Nasıl Bulunur? Kaynakçada DOI Rehberi",
    description: "DOI nedir, bir makalenin DOI numarası nasıl bulunur, nasıl doğrulanır ve kaynakçaya nasıl yazılır? APA 7 kuralları, DOI’siz kaynaklar, uydurma DOI riski.",
    category: "Kaynak ve atıf",
    keywords: ["DOI nedir", "DOI nasıl bulunur", "DOI numarası sorgulama", "kaynakçada DOI yazımı", "APA 7 DOI", "DOI doğrulama"],
    date: "2026-11-15",
    updated: "2026-11-15",
    cta: { text: "Academiana kaynakları DOI üzerinden doğrular; eksik DOI ve künyeleri bulur, kaynakçaya seçtiğiniz stilde ekler.", href: "/kayit", label: "Kaynaklarımı doğrula" },
    body: `Kaynakçanızdaki makalelerin sonunda sıkça “https://doi.org/10…” ile başlayan bir bağlantı görürsünüz. Bu, yayının **DOI**’sidir. DOI, bir yayına verilen ve hiç değişmeyen kimlik numarasıdır. Doğru kullanıldığında okurun kaynağa tek tıkla ulaşmasını sağlar ve kaynağın gerçekten var olduğunu doğrulamayı kolaylaştırır. Bu rehberde DOI’nin ne olduğunu, nasıl bulunup doğrulanacağını ve kaynakçaya nasıl yazılacağını anlatıyoruz.

## DOI nedir?

DOI (Digital Object Identifier, sayısal nesne tanımlayıcısı), bir yayına veya veri setine atanan kalıcı bir kimliktir. Yayının internet adresi değişse, dergi başka bir yayıncıya geçse bile DOI aynı kalır ve her zaman yayının güncel sayfasına yönlendirir. Sistemi Uluslararası DOI Vakfı yönetir; akademik yayınlarda DOI’lerin büyük kısmı **Crossref**, veri setlerinin önemli bir kısmı **DataCite** üzerinden kaydedilir.

## Bir DOI’nin yapısı

Her DOI iki parçadan oluşur ve “10.” ile başlar:

- **Önek (prefix):** “10.” ile başlayan ve yayıncıyı veya kayıt yapan kuruluşu gösteren kısım.
- **Sonek (suffix):** Eğik çizgiden sonra gelen ve yayıncının belirlediği, yayına özgü kısım.

DOI’yi bağlantıya çevirmek için başına **https://doi.org/** eklenir. Tarayıcıda bu bağlantıyı açtığınızda yayının sayfasına yönlendirilirsiniz.

## Hangi yayınların DOI’si olur?

- Uluslararası hakemli dergilerdeki makalelerin büyük çoğunluğu
- DergiPark’taki pek çok dergi makalesi (DOI kullanımı dergiye göre değişir)
- Akademik kitapların ve kitap bölümlerinin bir kısmı
- Konferans bildirileri, raporlar ve veri setleri (yayıncı kaydettiyse)

Tezlerin, eski yayınların ve bazı ulusal dergilerin DOI’si olmayabilir. DOI’si olmayan bir kaynak geçersiz değildir; künye eksiksiz yazılır ve varsa kalıcı bir adres eklenir.

## DOI nasıl bulunur?

1. **Makalenin kendisine bakın.** DOI genellikle makalenin ilk sayfasında, başlığın altında veya üstbilgide yazar.
2. **Derginin web sayfasına bakın.** Makalenin dergi sayfasında künye bilgileriyle birlikte DOI verilir.
3. **Crossref’te arayın.** Crossref’in arama sayfasına makale başlığını yazarak DOI’yi bulabilirsiniz.
4. **Kaynak yönetim programını kullanın.** Zotero ve Mendeley, makale sayfasından künye alırken DOI’yi de kaydeder; [Zotero ve Mendeley rehberimize](/blog/zotero-mendeley-ile-kaynak-yonetimi) bakın.
5. **Ücretsiz aracımızı kullanın.** [Kaynakça oluşturucumuz](/araclar/kaynakca-olusturucu) DOI veya başlıktan künyeyi bulur.

## DOI nasıl doğrulanır?

Bir DOI’nin gerçek ve doğru olduğunu iki adımda kontrol edin:

1. **Bağlantıyı açın:** https://doi.org/ ile başlayan bağlantı bir yayın sayfasına yönlendirmeli. “DOI bulunamadı” hatası alıyorsanız DOI yanlış yazılmış veya uydurulmuş olabilir.
2. **Künyeyi karşılaştırın:** Açılan sayfadaki başlık, yazarlar, yıl ve dergi adı kaynakçanızdaki bilgilerle birebir uyuşmalıdır. DOI açılıyor ama **başka bir makaleye** gidiyorsa künye ile DOI eşleşmemiştir.

## Yapay zekâ ve uydurma DOI’ler

Yapay zekâ sohbet araçları gerçekçi görünen ama var olmayan kaynaklar üretebilir; bu kaynaklarda DOI de uydurulmuş olabilir. Uydurma DOI’ler ya hiçbir yere yönlendirmez ya da tamamen farklı bir yayına gider. Bu yüzden yapay zekânın önerdiği her kaynağı DOI ile doğrulayın ve okumadığınız bir kaynağa atıf yapmayın. Kaynakçanızı toplu kontrol etmek için ücretsiz [uydurma kaynak kontrolü](/araclar/uydurma-kaynak-kontrolu) aracını kullanabilir, ayrıntılar için [uydurma kaynak tespiti rehberimizi](/blog/yapay-zeka-uydurma-kaynak-tespiti) okuyabilirsiniz.

## Kaynakçada DOI nasıl yazılır?

APA 7’nin DOI kuralları:

- DOI, **https://doi.org/** ile başlayan bağlantı biçiminde yazılır.
- Eski biçimler (“doi:” veya “DOI:” ön eki, “dx.doi.org”) kullanılmaz.
- DOI’den önce “Retrieved from” veya “Erişim adresi” yazılmaz.
- DOI’nin sonuna nokta konmaz.
- DOI’si olan bir kaynakta ayrıca veri tabanı adı veya web adresi yazılmaz.

Diğer stillerde DOI yazımı farklılaşabilir: IEEE ve Vancouver “doi:” ön ekiyle de kullanabilir; ISNAD bağlantı biçimini kabul eder. Aynı kaynağın yedi stildeki karşılaştırmalı örnekleri için [kaynakça rehberimize](/blog/kaynakca-nasil-hazirlanir) bakın.

## DOI’si olmayan kaynaklar

- **Dergi makalesi, DOI yok:** Künyeyi eksiksiz yazın (yazarlar, yıl, başlık, dergi, cilt, sayı, sayfa). Makale çevrim içi erişilebiliyorsa APA 7’de derginin makale sayfasının adresi eklenebilir.
- **Tez:** Tez türü, üniversite ve varsa tez merkezi numarası yazılır.
- **Web sayfası:** Kalıcı adres ve içerik değişebiliyorsa erişim tarihi verilir.

## Sık yapılan hatalar

- DOI’yi “doi:10…” gibi eski biçimde yazmak
- DOI’nin sonuna nokta koymak (bağlantı bozulabilir)
- Kopyalarken DOI’nin bir kısmını eksik almak
- DOI’yi açıp künyeyle karşılaştırmamak
- Kitap bölümünde kitabın, makalede derginin DOI’sini yazmak

## Academiana ile DOI

Academiana’da kaynak eklediğinizde DOI, Crossref, DataCite veya PubMed üzerinden doğrulanır ve doğrulama durumu her kaynağın yanında görünür. Eksik DOI ve künyeler veri tabanlarından tamamlanır; kaynakça seçtiğiniz stilde DOI’yi doğru biçimde yazar. Kalite kontrolü, DOI’si olması gerektiği hâlde eksik olan ve doğrulanamayan kaynakları listeler.`,
    sources: [
      { text: "International DOI Foundation. DOI Handbook.", url: "https://www.doi.org/" },
      { text: "Crossref. Crossref display guidelines.", url: "https://www.crossref.org/" },
      APA,
    ],
  },
  {
    slug: "yapay-zeka-kullanim-beyani-nasil-yazilir",
    title: "Yapay Zekâ Kullanım Beyanı Nasıl Yazılır? Tez ve Makale İçin Örnek Metinler",
    seoTitle: "Yapay Zekâ Kullanım Beyanı Nasıl Yazılır? Örneklerle",
    description: "Tez ve makalede yapay zekâ kullanım beyanı nereye ve nasıl yazılır? Beyanda olması gerekenler, kullanım türüne göre örnek metinler ve APA’da yapay zekâya atıf.",
    category: "Etik ve yapay zekâ",
    keywords: ["yapay zekâ kullanım beyanı", "yapay zeka beyanı örneği", "ChatGPT kullanım beyanı", "tezde yapay zeka beyanı", "yapay zekaya APA atıf", "dergi yapay zeka politikası"],
    date: "2026-11-15",
    updated: "2026-11-15",
    cta: { text: "Academiana kaynak, veri veya bulgu uydurmaz; yaptığı her işi sürüm geçmişinde kaydeder. Yapay zekâyı şeffaf ve beyan edilebilir biçimde kullanın.", href: "/kayit", label: "Şeffaf çalış" },
    body: `Yapay zekâ araçları akademik yazımda yaygınlaştıkça, birçok dergi ve üniversite bu araçların kullanımının **açıkça beyan edilmesini** istemeye başladı. Doğru yazılmış bir beyan, hem akademik dürüstlüğü korur hem de ileride çıkabilecek soruların önüne geçer. Bu rehberde beyanın nereye yazılacağını, neleri içermesi gerektiğini ve farklı kullanım türleri için örnek metinleri veriyoruz. Yapay zekâ kullanımının etik sınırlarını genel olarak [yapay zekâ ile tez yazmanın etiği rehberimizde](/blog/yapay-zeka-ile-tez-yazmak-etik-mi) ele aldık.

## Neden beyan gerekir?

- **Şeffaflık:** Okur ve değerlendirici, metnin hangi kısımlarında hangi aracın ne amaçla kullanıldığını bilmelidir.
- **Sorumluluk:** Yayın etiği kuruluşu COPE ve tıp dergisi editörlerinin ortak kurulu ICMJE, yapay zekâ araçlarının yazar olarak gösterilemeyeceğini, çünkü çalışmanın sorumluluğunu üstlenemeyeceklerini vurgular. Sorumluluk, aracı kullanan yazardadır.
- **Kurallara uyum:** Birçok dergi ve enstitü beyanı zorunlu tutar; beyan edilmeyen kullanım etik ihlal olarak değerlendirilebilir.

## Önce kuralları okuyun

Beyanın biçimi ve yeri kurumdan kuruma değişir. Yazmaya başlamadan önce şunları kontrol edin:

- **Tez için:** Enstitünüzün tez yazım kılavuzu ve varsa yapay zekâ kullanım yönergesi.
- **Makale için:** Hedef derginin yazar kılavuzu ve yayıncının yapay zekâ politikası.
- **Danışman:** Tezde yapay zekâyı hangi aşamada kullanacağınızı baştan danışmanınızla konuşun.

Bazı kurumlar dil düzeltme gibi sınırlı kullanımları beyan dışında tutar, bazıları her kullanımın beyanını ister. Bağlayıcı olan kurumunuzun kuralıdır.

## Beyanda olması gerekenler

1. **Araç:** Kullanılan aracın adı ve mümkünse sürümü.
2. **Amaç:** Hangi iş için kullanıldığı (dil düzeltme, çeviri, arama stratejisi, kod yazımı, taslak oluşturma gibi).
3. **Kapsam:** Hangi bölümlerde kullanıldığı.
4. **Denetim:** Çıktıların yazar tarafından kontrol edildiği, düzenlendiği ve kaynakların doğrulandığı.
5. **Sorumluluk:** Çalışmanın içeriğinden yazarın sorumlu olduğu.

## Nereye yazılır?

- **Makalede:** Dergiler genellikle beyanı yöntem bölümünde, teşekkür bölümünde veya kaynakçadan önce ayrı bir “Yapay zekâ kullanım beyanı” başlığında ister.
- **Tezde:** Kılavuz bir yer belirtmiyorsa, etik beyan sayfasının yanında veya yöntem bölümünün sonunda ayrı bir paragraf olarak yazılabilir.
- **Kodda ve veri analizinde:** Yapay zekâ kod yazımında kullanıldıysa bu, yöntem bölümündeki analiz kısmında belirtilir.

## Kullanım türüne göre örnek beyanlar

Aşağıdaki metinler örnektir; köşeli parantez içindeki yerleri kendi bilgilerinizle doldurun ve kurumunuzun kurallarına göre uyarlayın.

**Dil ve yazım düzeltme:**
“Bu çalışmanın yazımında, metnin dil ve yazım denetimi amacıyla [araç adı, sürümü] kullanılmıştır. Araç yalnızca dil bilgisi ve ifade düzeltmeleri için kullanılmış; içerik, bulgular ve yorumlar yazara aittir. Önerilen tüm düzeltmeler yazar tarafından gözden geçirilmiştir.”

**Literatür taramasında arama desteği:**
“Literatür taramasında anahtar kelime ve arama dizesi önerileri almak için [araç adı] kullanılmıştır. Kaynakların tamamı yazar tarafından veri tabanlarında bulunmuş, okunmuş ve doğrulanmıştır.”

**Taslak oluşturma ve düzenleme:**
“[Bölüm adları] bölümlerinin ilk taslaklarının oluşturulmasında [araç adı] kullanılmıştır. Taslaklar yazar tarafından kapsamlı biçimde düzenlenmiş, tüm atıflar özgün kaynaklarla karşılaştırılarak doğrulanmıştır. Çalışmanın içeriğinden yazar sorumludur.”

**Veri analizinde kod yazımı:**
“Veri analizi için kullanılan [yazılım] kodlarının yazımında [araç adı] kullanılmıştır. Kodların doğruluğu yazar tarafından test edilmiş, analiz sonuçları bağımsız olarak kontrol edilmiştir.”

**Çeviri:**
“İngilizce özetin ilk çevirisi [araç adı] ile yapılmış, yazar tarafından düzeltilmiştir.”

## APA’da yapay zekâya atıf

Bir yapay zekâ aracının ürettiği bir çıktıyı metinde doğrudan aktarıyorsanız (ör. yöntem bölümünde aracın verdiği bir cevabı örnek olarak gösteriyorsanız) APA, aracı geliştiren kuruluşu yazar, aracın sürüm tarihini yıl olarak kabul eden bir atıf biçimi önerir. Kullandığınız istemi (prompt) metinde veya ekte vermeniz de önerilir. Ancak yapay zekâ çıktısı **akademik bir kaynak değildir**: bir bilgiyi desteklemek için yapay zekâya değil, bilginin özgün kaynağına atıf yapın.

## Beyanda kaçınılması gerekenler

- Kullanımı olduğundan az göstermek
- “Yapay zekâ ile yazılmıştır” gibi belirsiz, kapsamı belli olmayan ifadeler
- Yapay zekâyı yazar listesine veya teşekkür bölümüne “katkı veren” olarak eklemek
- Beyanı yalnızca bir intihal raporu sorun çıkardığında eklemek

## Süreç kaydı tutun

Beyanınızı destekleyecek kayıtlar saklayın: kullandığınız istemler, sürüm geçmişi, düzeltmelerinizi gösteren taslaklar. Yapay zekâ tespit araçlarının yanlış işaretleme yapabildiği düşünüldüğünde bu kayıtlar sizi korur; ayrıntılar için [yapay zekâ tespit araçları rehberimize](/blog/yapay-zeka-tespit-araclari) bakın.

## Academiana ile şeffaf kullanım

Academiana kaynak, veri veya bulgu uydurmaz: atıflar yalnızca kütüphanenizdeki gerçek kaynaklara yapılır, bilinmeyen bilgi “veri girilecek” olarak işaretlenir. Asistanın metne eklediği her taslak sürüm geçmişinde “yapay zekâ” etiketiyle kaydedilir; böylece hangi bölümün hangi aşamada yapay zekâ desteğiyle yazıldığını sonradan görebilir, beyanınızı buna göre hazırlayabilirsiniz.`,
    sources: [
      { text: "Committee on Publication Ethics (COPE). (2023). Authorship and AI tools: COPE position statement.", url: "https://publicationethics.org/" },
      { text: "International Committee of Medical Journal Editors (ICMJE). Recommendations for the conduct, reporting, editing, and publication of scholarly work in medical journals.", url: "https://www.icmje.org/recommendations/" },
      { text: "McAdoo, T. (2023). How to cite ChatGPT. APA Style Blog.", url: "https://apastyle.apa.org/blog/how-to-cite-chatgpt" },
      { text: "Hosseini, M., Rasmussen, L. M., & Resnik, D. B. (2023). Using AI to write scholarly publications. Accountability in Research." },
    ],
  },
];
