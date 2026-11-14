import type { BlogPost } from "./types";

/**
 * D197: SEO içerik planındaki 1 (ANOVA), 3 (regresyon raporlama) ve 21 (literatür matrisi) numaralı yazılar.
 * ANOVA ve regresyon örneklerindeki tüm sayılar Academiana’nın istatistik motoruyla (lib/stats) üretildi ve
 * tests/blog-d197.test.ts ile denetlenir. Literatür matrisi örneğindeki çalışmalar açıkça “örnek” olarak adlandırılmıştır;
 * kaynak listeleri gerçek eserlerdir.
 */
export const POSTS_8: BlogPost[] = [
  {
    slug: "tek-yonlu-anova-nasil-yapilir-ve-raporlanir",
    title: "Tek Yönlü ANOVA Nasıl Yapılır, Yorumlanır ve Raporlanır? Bonferroni ile Çözümlü Örnek",
    seoTitle: "Tek Yönlü ANOVA Nasıl Yapılır ve APA 7 ile Raporlanır?",
    description: "Tek yönlü ANOVA adım adım: varsayımlar, Levene testi, F tablosu, eta kare, Bonferroni post hoc ve APA 7 raporlama, çözümlü örnek ve sık hatalarla.",
    category: "Araştırma ve yöntem",
    keywords: ["tek yönlü ANOVA nasıl yapılır", "ANOVA yorumlama", "ANOVA APA raporlama", "Bonferroni post hoc", "eta kare", "varyans analizi tez"],
    date: "2026-11-14",
    updated: "2026-11-14",
    cta: { text: "Veri dosyanızı çalışmanıza yükleyin; “Araçlar” → “İstatistik analizi” → “Tek yönlü varyans analizi (ANOVA)” ile F tablosunu, eta kareyi ve Bonferroni karşılaştırmalarını APA biçiminde alın.", href: "/kayit", label: "ANOVA’mı çalıştır" },
    body: `Tek yönlü varyans analizi (ANOVA), **üç veya daha fazla bağımsız grubun ortalamasını** tek bir testte karşılaştırır. “Üç öğretim yönteminden hangisi daha başarılı?”, “Sınıf düzeyine göre kaygı puanları farklılaşıyor mu?” gibi sorular tezlerde en sık ANOVA ile sınanır. Bu rehberde testi seçmekten APA 7’ye göre raporlamaya kadar her adımı, aynı örnek veri üzerinde sayıları tek tek yorumlayarak anlatıyoruz.

Bu yazıdaki bütün sayılar, aşağıdaki örnek veriden Academiana’nın istatistik motoruyla hesaplanmıştır. Verileri kendi programınıza girerek aynı sonuçları elde edebilirsiniz.

## ANOVA ne zaman kullanılır?

- **Bağımlı değişken sürekli olmalıdır:** sınav puanı, ölçek toplamı, süre gibi.
- **Bağımsız değişken kategorik olmalı ve en az üç düzeyi bulunmalıdır:** yöntem (A, B, C), sınıf (1, 2, 3, 4), fakülte gibi.
- **Gruplar birbirinden bağımsız olmalıdır:** her katılımcı yalnızca bir grupta yer alır.

İki grup varsa ANOVA yerine [bağımsız örneklem t testi](/blog/t-testi-nasil-yapilir-ve-yorumlanir) kullanılır (iki grupta ANOVA’nın F değeri t değerinin karesine eşittir). Aynı kişiler üç veya daha fazla kez ölçüldüyse tekrarlı ölçümler ANOVA’sı gerekir. Hangi testin ne zaman seçileceğine dair genel bir harita için [hangi istatistik analizi seçilmeli rehberimize](/blog/hangi-istatistik-analizi-secilmeli) bakın.

### Neden üç ayrı t testi yapmıyoruz?

Üç grubu ikişer ikişer t testiyle karşılaştırmak üç ayrı test demektir. Her test .05 düzeyinde yapılırsa, en az birinde yanlışlıkla “anlamlı” sonuç bulma olasılığı yaklaşık %14’e çıkar (1 − 0.95³). ANOVA önce tek bir testle “gruplar arasında herhangi bir fark var mı?” sorusunu sorar; fark varsa hangi gruplar arasında olduğunu düzeltilmiş ikili karşılaştırmalarla (post hoc) bulursunuz.

## Varsayımlar ve nasıl kontrol edilir?

1. **Bağımsız gözlemler:** Araştırma deseninden gelir; istatistiksel test yerine yöntem bölümünde gerekçelendirilir.
2. **Normallik:** Her grubun dağılımı normale yakın olmalıdır. Grup başına çarpıklık ve basıklık değerlerine bakın; ayrıntı için [normallik testi rehberimize](/blog/normallik-testi-carpiklik-basiklik) göz atın. Grup büyüklükleri eşit ve yeterliyse ANOVA normallikten küçük sapmalara karşı oldukça dayanıklıdır.
3. **Varyansların homojenliği:** Grupların varyansları birbirine yakın olmalıdır. Levene testiyle sınanır. Levene anlamlıysa (p < .05) **Welch ANOVA’sı** ve Games–Howell karşılaştırmaları tercih edilir.

Normallik ciddi biçimde bozuksa ve gruplar küçükse parametrik olmayan karşılığı **Kruskal–Wallis H testi** düşünülmelidir.

## Çözümlü örnek: üç öğretim yöntemi

Bir araştırmacı üç farklı öğretim yönteminin sınav başarısına etkisini inceliyor. Her yöntemde 10 öğrenci var (toplam N = 30):

- **Düz anlatım:** 62, 70, 75, 58, 68, 73, 66, 79, 64, 71
- **Soru-cevap:** 70, 66, 78, 74, 81, 69, 72, 85, 63, 76
- **Proje tabanlı:** 75, 82, 71, 88, 79, 84, 69, 90, 77, 80

Araştırma sorusu: *Öğrencilerin sınav puanları öğretim yöntemine göre anlamlı biçimde farklılaşmakta mıdır?*

### 1. Betimsel istatistikler

| Grup | n | Ort. | SS |
| --- | --- | --- | --- |
| Düz anlatım | 10 | 68.60 | 6.33 |
| Soru-cevap | 10 | 73.40 | 6.80 |
| Proje tabanlı | 10 | 79.50 | 6.82 |

Ortalamalar düz anlatımdan proje tabanlı yönteme doğru artıyor; standart sapmalar ise birbirine çok yakın. Bu, varyans homojenliğinin büyük olasılıkla sağlandığına dair ilk ipucudur.

### 2. Levene testi

Levene testi F(2, 27) = 0.03, p = .969 çıktı. p değeri .05’ten büyük olduğu için varyansların eşit olduğu varsayımı reddedilmez; klasik ANOVA tablosu kullanılabilir.

### 3. ANOVA tablosu

| Varyans kaynağı | KT | sd | KO | F | p | η² |
| --- | --- | --- | --- | --- | --- | --- |
| Gruplar arası | 596.87 | 2 | 298.43 | 6.74 | .004 | .33 |
| Gruplar içi | 1195.30 | 27 | 44.27 | | | |
| Toplam | 1792.17 | 29 | | | | |

Tabloyu satır satır okuyalım:

- **KT (kareler toplamı):** Puanlardaki toplam değişkenliğin (1792.17) 596.87’si gruplar arasındaki farklardan, 1195.30’u grup içindeki bireysel farklardan geliyor.
- **sd (serbestlik derecesi):** Gruplar arası için grup sayısı − 1 = 2; gruplar içi için N − grup sayısı = 27.
- **KO (kareler ortalaması):** KT’nin sd’ye bölünmesidir. F değeri, gruplar arası KO’nun gruplar içi KO’ya oranıdır: 298.43 / 44.27 = 6.74.
- **F(2, 27) = 6.74, p = .004:** Gruplar arasındaki fark, tesadüfle açıklanamayacak kadar büyüktür. En az iki grubun ortalaması birbirinden farklıdır.
- **η² = .33:** Puanlardaki değişkenliğin %33’ü öğretim yöntemiyle açıklanmaktadır. Cohen’in (1988) ölçütlerine göre (.01 küçük, .06 orta, .14 büyük) büyük bir etkidir. Küçük örneklemlerde daha az yanlı bir tahmin olan **ω² = .28** de raporlanabilir.

### 4. Post hoc: hangi gruplar farklı?

ANOVA yalnızca “bir yerde fark var” der. Farkın nerede olduğunu Bonferroni düzeltmeli ikili karşılaştırmalar gösterir:

| Karşılaştırma | Ortalama farkı | p (Bonferroni) |
| --- | --- | --- |
| Düz anlatım – Soru-cevap | −4.80 | .355 |
| Düz anlatım – Proje tabanlı | −10.90 | .003 |
| Soru-cevap – Proje tabanlı | −6.10 | .151 |

Yalnızca **düz anlatım ile proje tabanlı yöntem** arasındaki fark anlamlıdır. Soru-cevap grubu iki grubun arasında kalıyor ve hiçbiriyle anlamlı biçimde ayrışmıyor.

> Bonferroni düzeltmesi her ikili karşılaştırmanın p değerini karşılaştırma sayısıyla çarpar (burada 3). Tutucu bir yöntemdir: yanlış pozitif riskini iyi kontrol eder ama küçük farkları kaçırabilir. Grup sayısı arttıkça Tukey HSD gibi alternatifler daha yaygın kullanılır; hangisini seçtiğinizi yöntem bölümünde gerekçelendirin.

### 5. Sonucu doğru okumak

Bu örnekte grup başına yalnızca 10 öğrenci var. Soru-cevap ile diğer gruplar arasındaki farkların anlamlı çıkmaması “fark yok” anlamına gelmez; küçük örneklem nedeniyle testin bu büyüklükteki farkları yakalama gücü düşüktür. Çalışmayı planlarken gerekli grup büyüklüğünü önceden hesaplamak bu yüzden önemlidir: [örneklem büyüklüğü rehberimize](/blog/orneklem-buyuklugu-nasil-hesaplanir) ve ücretsiz [örneklem hesaplayıcımıza](/araclar/orneklem-hesaplayici) bakabilirsiniz.

## APA 7’ye göre raporlama

**Metin içinde:**

“Sınav puanları öğretim yöntemine göre anlamlı biçimde farklılaşmaktadır, F(2, 27) = 6.74, p = .004, η² = .33. Bonferroni düzeltmeli karşılaştırmalara göre proje tabanlı yöntemle öğrenen öğrencilerin puanları (M = 79.50, SS = 6.82), düz anlatımla öğrenenlerden (M = 68.60, SS = 6.33) anlamlı düzeyde yüksektir (p = .003). Soru-cevap grubu (M = 73.40, SS = 6.80) diğer iki gruptan anlamlı biçimde ayrışmamıştır.”

**Yazım kuralları:**

- F, p, M ve SS italik yazılır; η² gibi Yunan harfleri italik yazılmaz.
- F değerinin yanında iki serbestlik derecesi parantez içinde verilir: F(2, 27).
- p değerinin başına sıfır konmaz (.004); .001’den küçükse “p < .001” yazılır, “p = .000” yazılmaz.
- Birden fazla bağımlı değişken için ANOVA yaptıysanız grup ortalamalarını, standart sapmaları, F, p ve η² değerlerini tek bir tabloda toplayın. Tablo biçimi için [APA 7 tablo ve şekil rehberimize](/blog/tez-tablo-ve-sekil-apa-7) bakın.

## Sık yapılan hatalar

- ANOVA anlamlı çıkmadığı hâlde post hoc sonuçlarını yorumlamak
- Levene sonucuna bakmadan klasik ANOVA’yı raporlamak
- Yalnızca p değerini verip etki büyüklüğünü atlamak
- Aynı kişilerin tekrarlı ölçümlerine tek yönlü (bağımsız) ANOVA uygulamak
- Post hoc için düzeltme yapılmamış t testleri kullanmak
- “Anlamlı değil” sonucunu “gruplar eşittir” diye yorumlamak
- Sonucu bulgular bölümünde literatürle tartışmaya başlamak: yorum [tartışma bölümünde](/blog/bulgular-ve-tartisma-bolumu) yapılır

## Academiana ile ANOVA

Veri dosyanızı (CSV veya XLSX) çalışmanıza yükledikten sonra “Araçlar” → “İstatistik analizi” bölümünden “Tek yönlü varyans analizi (ANOVA)” seçeneğini işaretleyin, bağımlı değişkeni ve gruplama değişkenini seçin. Sonuçta grup betimselleri, ANOVA tablosu, η² ve ANOVA anlamlıysa Bonferroni düzeltmeli ikili karşılaştırmalar APA biçiminde gelir; tek tıkla numaralı tablo olarak belgenize eklenir. Grupların ortalamasını hata çubuklu bir sütun grafiğiyle göstermek için “Grafik oluştur” aracını kullanabilirsiniz. Sayılar yapay zekâ tarafından üretilmez; sitenin istatistik motoru verinizden hesaplar.`,
    sources: [
      { text: "Fisher, R. A. (1925). Statistical methods for research workers. Oliver and Boyd." },
      { text: "Levene, H. (1960). Robust tests for equality of variances. In I. Olkin (Ed.), Contributions to probability and statistics (pp. 278–292). Stanford University Press." },
      { text: "Dunn, O. J. (1961). Multiple comparisons among means. Journal of the American Statistical Association, 56(293), 52–64." },
      { text: "Welch, B. L. (1951). On the comparison of several mean values: An alternative approach. Biometrika, 38(3–4), 330–336." },
      { text: "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates." },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "regresyon-analizi-apa-7-raporlama",
    title: "Regresyon Analizi Sonuçları APA 7’ye Göre Nasıl Raporlanır? Basit ve Çoklu Doğrusal Regresyon",
    seoTitle: "Regresyon Analizi APA 7’ye Göre Nasıl Raporlanır?",
    description: "Basit ve çoklu doğrusal regresyon: R², F, B, β, güven aralığı nasıl okunur, APA 7 tablosu ve metin örneği, çoklu doğrusallık ve sık hatalar, çözümlü örnekle.",
    category: "Araştırma ve yöntem",
    keywords: ["regresyon analizi nasıl raporlanır", "çoklu regresyon yorumlama", "regresyon APA 7 tablo", "standardize beta", "R kare yorumlama", "doğrusal regresyon tez"],
    date: "2026-11-14",
    updated: "2026-11-14",
    cta: { text: "Veri dosyanızı yükleyin; “Araçlar” → “İstatistik analizi” → “Doğrusal regresyon” ile B, β, güven aralıkları ve model özetini içeren APA tablosunu belgenize ekleyin.", href: "/kayit", label: "Regresyonumu çalıştır" },
    body: `Doğrusal regresyon, bir veya daha fazla değişkenin (yordayıcı) bir sonucu (bağımlı değişken) ne ölçüde açıkladığını ve sonucu nasıl değiştirdiğini gösterir. Tezlerde “Çalışma süresi sınav başarısını yordar mı?”, “Öz yeterlik ve kaygı birlikte tükenmişliği ne kadar açıklar?” gibi sorular regresyonla sınanır. Bu rehberde çıktıyı satır satır okumayı ve APA 7’ye göre raporlamayı, aynı veri üzerinde basit ve çoklu regresyonla anlatıyoruz.

Bu yazıdaki bütün sayılar, aşağıdaki örnek veriden Academiana’nın istatistik motoruyla hesaplanmıştır.

## Korelasyon ile regresyonun farkı

Korelasyon iki değişkenin birlikte değişip değişmediğini ve bu ilişkinin gücünü gösterir; değişkenler arasında yön yoktur. Regresyon ise bir değişkeni **bağımlı**, diğerlerini **yordayıcı** olarak tanımlar ve “yordayıcı bir birim arttığında bağımlı değişken ne kadar değişiyor?” sorusunu cevaplar.

> “Yordamak” nedensellik demek değildir. İlişkisel bir desende regresyon, değişkenler arasındaki ilişkinin büyüklüğünü ve yönünü tahmin eder; nedensel çıkarım için deneysel desen gerekir. Bu ayrımı yöntem ve tartışma bölümünde açıkça yazın.

## Örnek veri

20 öğrencinin sınavdan önceki hafta **günlük ortalama çalışma süresi (saat)**, **gecelik ortalama uyku süresi (saat)** ve **sınav puanı** kaydedilmiştir:

- **Çalışma süresi:** 2, 4, 3, 6, 5, 8, 7, 1, 9, 6, 4, 5, 7, 3, 8, 6, 2, 5, 7, 4
- **Uyku süresi:** 6, 7, 5, 8, 6, 7, 8, 5, 7, 6, 8, 7, 6, 5, 8, 7, 6, 6, 7, 5
- **Sınav puanı:** 64, 61, 62, 70, 75, 71, 79, 58, 75, 74, 65, 76, 65, 60, 83, 70, 52, 71, 80, 57

Önce korelasyonlara bakalım: çalışma süresi ile sınav puanı arasında r(18) = .78 (p < .001), uyku süresi ile sınav puanı arasında r(18) = .62 (p = .003) ilişki var. Dikkat: **çalışma süresi ile uyku süresi de birbiriyle ilişkili**, r(18) = .61 (p = .004). Bu ayrıntı çoklu regresyonda önemli olacak.

## Basit doğrusal regresyon: tek yordayıcı

Yalnızca çalışma süresini yordayıcı olarak alalım:

- **Model:** F(1, 18) = 28.23, p < .001, R² = .61, düzeltilmiş R² = .59
- **Sabit:** B = 53.17
- **Çalışma süresi:** B = 2.99, β = .78, p < .001, %95 GA [1.81, 4.17]

Yorum: Günlük çalışma süresi sınav puanlarındaki varyansın %61’ini açıklıyor. Çalışma süresindeki **her bir saatlik artış, sınav puanında ortalama 2.99 puanlık artışla** ilişkilidir. Tek yordayıcılı modelde standardize β, Pearson korelasyonuna eşittir (.78).

## Çoklu doğrusal regresyon: iki yordayıcı

Şimdi uyku süresini de modele ekleyelim. Analizin çıktısı şöyledir:

| Yordayıcı | B | SH | β | t | p | %95 GA |
| --- | --- | --- | --- | --- | --- | --- |
| (Sabit) | 43.52 | 8.00 | | 5.44 | < .001 | [26.65, 60.40] |
| Çalışma süresi | 2.44 | 0.70 | .64 | 3.50 | .003 | [0.97, 3.90] |
| Uyku süresi | 1.92 | 1.47 | .24 | 1.30 | .209 | [−1.18, 5.02] |

*Not.* R² = .65, düzeltilmiş R² = .60, F(2, 17) = 15.51, p < .001.

### 1. Model özeti: R², düzeltilmiş R² ve F

- **F(2, 17) = 15.51, p < .001:** Model bir bütün olarak anlamlıdır; iki yordayıcı birlikte sınav puanını açıklıyor.
- **R² = .65:** Sınav puanlarındaki varyansın yaklaşık %65’i (tam değer %64.6) iki yordayıcı tarafından açıklanıyor.
- **Düzeltilmiş R² = .60:** Yordayıcı sayısı ve örneklem büyüklüğü dikkate alınarak düzeltilmiş değerdir. Küçük örneklemlerde ve çok yordayıcılı modellerde mutlaka raporlayın.

Uyku süresini eklemek R²’yi .61’den .65’e çıkardı; yani uyku, çalışma süresinin ötesinde yalnızca yaklaşık **4 puanlık ek varyans** açıklıyor.

### 2. B: ham katsayı

**B**, diğer yordayıcılar sabit tutulduğunda yordayıcıdaki bir birimlik artışın bağımlı değişkende yarattığı ortalama değişimdir. Uyku süresi sabitken her ek çalışma saati sınav puanında ortalama **2.44 puanlık** artışla ilişkilidir. B değerleri değişkenlerin kendi ölçü birimindedir; bu yüzden farklı birimlerdeki yordayıcıları karşılaştırmak için kullanılmaz.

### 3. β: standardize katsayı

**β**, değişkenler standart puana çevrildiğinde hesaplanan katsayıdır ve yordayıcıların göreli önemini karşılaştırmaya yarar. Çalışma süresinin β’sı (.64) uyku süresininkinden (.24) belirgin biçimde büyüktür.

### 4. t, p ve güven aralığı

- **Çalışma süresi:** t = 3.50, p = .003, %95 GA [0.97, 3.90]. Aralık sıfırı içermiyor: anlamlı bir yordayıcıdır.
- **Uyku süresi:** t = 1.30, p = .209, %95 GA [−1.18, 5.02]. Aralık sıfırı içeriyor: çalışma süresi kontrol edildiğinde anlamlı bir yordayıcı değildir.

### 5. Neden uyku tek başına ilişkiliyken modelde anlamsız?

Uyku süresi sınav puanıyla tek başına anlamlı ilişkiliydi (r = .62), ama çoklu regresyonda anlamlı çıkmadı. Bunun nedeni, uykunun çalışma süresiyle de ilişkili olmasıdır (r = .61). Uykunun sınav puanıyla paylaştığı varyansın büyük kısmı, çalışma süresiyle de ortaktır; çalışma süresi modele girince uykunun **kendine özgü** katkısı küçülür. Bu durum yordayıcılar arası ilişkinin (çoklu doğrusallık) tipik sonucudur. Yorumu her zaman “diğer yordayıcılar kontrol edildiğinde” diye kurun.

## Varsayımlar

1. **Doğrusallık:** Yordayıcı ile bağımlı değişken arasındaki ilişki doğrusal olmalıdır; saçılım grafiğiyle kontrol edin.
2. **Hataların bağımsızlığı:** Gözlemler birbirinden bağımsız olmalıdır (Durbin–Watson istatistiği yaygın bir kontroldür).
3. **Hataların normalliği:** Artıkların dağılımı normale yakın olmalıdır.
4. **Eş varyanslılık:** Artıkların yayılımı yordanan değerler boyunca benzer olmalıdır.
5. **Aşırı çoklu doğrusallık olmamalıdır:** Yordayıcılar arasındaki çok yüksek korelasyonlar (genellikle .80 üzeri) katsayıları kararsızlaştırır; VIF ve tolerans değerleri raporlanır.

Örneklem büyüklüğü için sık kullanılan kaba kural yordayıcı başına en az 10–15 gözlemdir; daha sağlam bir yol güç analizidir. Bu yazıdaki 20 kişilik örnek yalnızca anlatım içindir; gerçek bir tezde bu kadar küçük örneklem yetersizdir.

## APA 7’ye göre raporlama

**Metin içinde:**

“Günlük çalışma süresi ve gecelik uyku süresinin sınav puanını yordama gücü çoklu doğrusal regresyon analiziyle incelenmiştir. Model anlamlıdır, F(2, 17) = 15.51, p < .001, ve sınav puanlarındaki varyansın %65’ini açıklamaktadır (R² = .65, düzeltilmiş R² = .60). Çalışma süresi sınav puanının anlamlı bir yordayıcısıdır, B = 2.44, β = .64, t = 3.50, p = .003, %95 GA [0.97, 3.90]; uyku süresi ise çalışma süresi kontrol edildiğinde anlamlı bir yordayıcı değildir, B = 1.92, β = .24, t = 1.30, p = .209.”

**Tablo:** Yukarıdaki gibi her yordayıcı için B, SH, β, t, p ve güven aralığını içeren bir tablo kullanın; model özetini (R², düzeltilmiş R², F) tablo notunda verin. Tablo başlığı ve numaralandırma için [APA 7 tablo ve şekil rehberimize](/blog/tez-tablo-ve-sekil-apa-7) bakın.

**Yazım kuralları:**

- B, t, p, F ve R² italik yazılır; β gibi Yunan harfleri italik yazılmaz.
- p ve R² gibi 1’den büyük olamayan değerlerin başına sıfır konmaz (.65, .003).
- Ham (B) ve standardize (β) katsayıları ayırt edin; ikisini de raporlamak okura en çok bilgiyi verir.

## Sık yapılan hatalar

- Regresyon sonucunu nedensellik diliyle yazmak (“çalışma süresi başarıyı artırır”)
- Yalnızca R² verip düzeltilmiş R²’yi atlamak
- B ile β’yı karıştırmak ya da farklı birimlerdeki B değerlerini karşılaştırmak
- Tek başına anlamlı korelasyonu, çoklu modelde anlamsız çıkınca “ilişki yok” diye yorumlamak
- Yordayıcılar arası korelasyonları ve VIF değerlerini kontrol etmemek
- Küçük örneklemde çok sayıda yordayıcı kullanmak

## Academiana ile regresyon

Veri dosyanızı çalışmanıza yükledikten sonra “Araçlar” → “İstatistik analizi” → “Doğrusal regresyon” seçeneğinde bağımlı değişkeni ve yordayıcıları seçin. Sonuçta B, standart hata, β, t, p ve %95 güven aralıklarını içeren tablo ile R², düzeltilmiş R² ve F değerlerini veren model özeti APA biçiminde gelir; tek tıkla belgenize numaralı tablo olarak eklenir. Değişkenler arası korelasyonları aynı araçtaki “Korelasyon analizi” ile, ilişkinin biçimini “Grafik oluştur” → “Saçılım grafiği” (regresyon doğrusuyla) ile gösterebilirsiniz. Asistandan sonuçları yorumlamasını istediğinizde metindeki her sayı tablodaki sayıyla aynı kalır; yeni değer üretilmez. Bulguları yazarken [bulgular ve tartışma rehberimiz](/blog/bulgular-ve-tartisma-bolumu) de yardımcı olur.`,
    sources: [
      { text: "Cohen, J., Cohen, P., West, S. G., & Aiken, L. S. (2003). Applied multiple regression/correlation analysis for the behavioral sciences (3rd ed.). Lawrence Erlbaum Associates." },
      { text: "Tabachnick, B. G., & Fidell, L. S. (2019). Using multivariate statistics (7th ed.). Pearson." },
      { text: "Field, A. (2018). Discovering statistics using IBM SPSS Statistics (5th ed.). SAGE." },
      { text: "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates." },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "literatur-matrisi-nasil-hazirlanir",
    title: "Literatür Matrisi Nasıl Hazırlanır? Tez İçin Adım Adım Karşılaştırma Tablosu",
    seoTitle: "Literatür Matrisi Nasıl Hazırlanır? Adım Adım Rehber",
    description: "Literatür matrisi (sentez tablosu) nedir, hangi sütunlar olmalı, nasıl doldurulur ve literatür taramasında sentez yazısına nasıl dönüştürülür? Örnekli rehber.",
    category: "Tez yazımı",
    keywords: ["literatür matrisi nasıl hazırlanır", "literatür matrisi örneği", "sentez tablosu", "literatür karşılaştırma tablosu", "kavram matrisi", "literatür taraması tablo"],
    date: "2026-11-14",
    updated: "2026-11-14",
    cta: { text: "Kaynaklarınızı çalışmanıza ekleyin; “Kaynaklar” → “Literatür matrisi” ile her kaynağın amacı, yöntemi, örneklemi ve bulguları, yalnızca okunan özet veya tam metinden doldurulsun (Pro paketinde).", href: "/kayit", label: "Matrisimi oluştur" },
    body: `Literatür taramasında en sık yapılan hata, kaynakları **tek tek özetleyip art arda dizmektir**: “Yılmaz (2019) şunu buldu. Kaya (2020) bunu buldu.” Okur bu yazıdan alanın genel resmini çıkaramaz. Bunu önlemenin en etkili aracı **literatür matrisidir**: okuduğunuz her kaynağı aynı ölçütlerle tek bir tabloya işlediğiniz, sonra satırlara değil sütunlara bakarak yazdığınız bir karşılaştırma tablosu. Bu rehberde matrisin ne olduğunu, hangi sütunlardan oluşması gerektiğini ve tablodan sentez paragrafına nasıl geçileceğini adım adım anlatıyoruz.

## Literatür matrisi nedir?

Literatür matrisi (sentez tablosu, karşılaştırma tablosu, “matrix method”), her satırında bir kaynak, her sütununda bir karşılaştırma ölçütü bulunan tablodur. Ölçütler araştırma sorunuza göre seçilir: amaç, yöntem, örneklem, kullanılan ölçme aracı, temel bulgular, sınırlılıklar ve sizin çalışmanızla ilişkisi gibi.

Yöntemin kökeni sağlık bilimlerinde yaygınlaşan “matris yöntemi”dir (Garrard). Bilgi sistemleri alanında Webster ve Watson’ın önerdiği **kavram matrisi** de aynı mantığa dayanır: kaynakları yazara göre değil, kavrama göre düzenlemek. Böylece literatür taraması **yazar merkezli** olmaktan çıkıp **kavram merkezli** hâle gelir.

## Matris neden işe yarar?

- **Sentez kolaylaşır:** Bir sütuna yukarıdan aşağı baktığınızda hangi çalışmaların uyuştuğunu, hangilerinin ayrıştığını görürsünüz.
- **Boşluk görünür olur:** Hiç çalışılmamış örneklem, yöntem veya bağlam tablo üzerinde boş hücre olarak belirir; bu, tezinizin gerekçesine dönüşür.
- **Tekrar okuma azalır:** Bir kaynağı aylar sonra hatırlamak için yeniden okumanız gerekmez.
- **Danışman görüşmeleri verimli geçer:** Tablo, literatürü ne kadar kapsadığınızı tek bakışta gösterir.

## Hangi sütunlar olmalı?

Temel bir matris için şu sütunlar yeterlidir:

1. **Kaynak:** Yazar ve yıl (tam künye kaynak yönetim programında dursun).
2. **Amaç / araştırma sorusu:** Çalışma neyi incelemiş?
3. **Yöntem ve desen:** Nicel, nitel, karma; tarama, deneysel, durum çalışması…
4. **Örneklem ve bağlam:** Kimlerle, nerede, kaç kişiyle?
5. **Ölçme aracı / veri toplama:** Hangi ölçek, görüşme formu veya veri tabanı?
6. **Temel bulgular:** Sayısal sonuçlar varsa etki büyüklüğüyle birlikte.
7. **Sınırlılıklar:** Yazarların belirttiği ve sizin fark ettiğiniz.
8. **Çalışmamla ilişkisi:** Bu kaynak tezimde nerede, ne için kullanılacak?

Araştırmanıza özgü sütunlar ekleyin: kuramsal çerçeve, ülke, yaş grubu, kullanılan istatistik, etki büyüklüğü gibi. Sistematik derleme yapıyorsanız matris, **veri çıkarma formuna** dönüşür; ayrıntılar için [sistematik derleme ve PRISMA rehberimize](/blog/sistematik-derleme-meta-analiz-prisma) bakın.

## Adım adım literatür matrisi hazırlama

### 1. Araştırma sorunuzu netleştirin

Sütunlar araştırma sorusundan türer. “Üniversite öğrencilerinde sosyal medya kullanımı akademik ertelemeyle ilişkili mi?” sorusu için örneklem, ölçek ve ilişki büyüklüğü sütunları kritiktir.

### 2. Kaynakları toplayın ve tarama kararlarını kaydedin

Hangi veri tabanlarında, hangi anahtar kelimelerle ve hangi yıllar arasında aradığınızı not edin. Tarama stratejisi için [literatür taraması rehberimize](/blog/literatur-taramasi-nasil-yapilir) bakabilirsiniz.

### 3. Okurken doldurun, sonradan değil

Her kaynağı okurken satırını hemen doldurun. **Yalnızca okuduğunuz kısımdan** yazın: özetini okuduğunuz bir çalışmanın örneklem sayısını tahmin etmeyin; bilmiyorsanız hücreyi boş bırakın ve “tam metin okunacak” diye işaretleyin. Bu, ileride yanlış atıf yapmanızı önler.

### 4. Kendi cümlelerinizle yazın

Hücreye uzun alıntı yapıştırmayın; kısa ve kendi ifadenizle yazın. Doğrudan alıntı gerekiyorsa sayfa numarasıyla tırnak içinde not edin. Bu alışkanlık intihal riskini de azaltır.

### 5. Sütunlara bakarak temaları çıkarın

Matris dolunca satırları değil sütunları okuyun. Bulgular sütununda tekrar eden örüntüler, yöntem sütununda baskın desenler, örneklem sütununda boşluklar arayın. Her örüntü, literatür taramanızda bir **tema** başlığı olabilir.

## Örnek matris

Aşağıdaki tablo yöntemi göstermek için hazırlanmış **kurgusal** bir örnektir; satırlar gerçek yayınları temsil etmez.

| Kaynak | Amaç | Yöntem | Örneklem | Temel bulgu | Çalışmamla ilişkisi |
| --- | --- | --- | --- | --- | --- |
| Çalışma A (2019) | Sosyal medya süresi ve erteleme | İlişkisel tarama | 412 lisans öğrencisi | Orta düzey pozitif ilişki | Hipotez 1’in gerekçesi |
| Çalışma B (2021) | Bildirimlerin dikkat üzerindeki etkisi | Deneysel | 60 öğrenci | Bildirim açık grupta görev süresi uzun | Mekanizma tartışması |
| Çalışma C (2022) | Öğrencilerin erteleme deneyimleri | Nitel, görüşme | 18 öğrenci | “Kısa mola” sosyal medyada uzuyor | Bulguları yorumlarken |
| Çalışma D (2023) | Erteleme ölçeği uyarlaması | Geçerlik–güvenirlik | 540 öğrenci | Tek boyutlu yapı, α = .86 | Veri toplama aracı |

Sütunlara baktığımızda üç şey görülüyor:

- **Bulgular sütunu:** İlişkisel, deneysel ve nitel çalışmalar aynı yönü işaret ediyor; bu tutarlılık bir tema olabilir (“yöntemler arası tutarlı bulgular”).
- **Yöntem sütunu:** Deneysel çalışma tek; nedensel sonuç için kanıt sınırlı. Bu bir boşluktur.
- **Örneklem sütunu:** Tüm çalışmalar lisans öğrencileriyle yapılmış; lisansüstü öğrenciler hiç çalışılmamış. Bu da tezin özgün değerine dönüşebilir.

## Matristen sentez paragrafına

Tablodaki bir sütunu paragrafa dönüştürmenin basit bir kalıbı var: **genel iddia → destekleyen çalışmalar → ayrışan çalışma → yorum.**

Kötü örnek (kaynak kaynak özet): “Çalışma A sosyal medya ile erteleme arasında ilişki buldu. Çalışma B bildirimlerin dikkati dağıttığını gösterdi. Çalışma C öğrencilerin molaların uzadığını söylediğini belirtti.”

İyi örnek (sentez): “Sosyal medya kullanımı ile akademik erteleme arasındaki ilişki farklı yöntemlerle tutarlı biçimde gösterilmiştir: ilişkisel çalışmalar orta düzeyde bir ilişki bildirirken (Çalışma A), deneysel bulgular bildirimlerin görev süresini uzattığını (Çalışma B), nitel bulgular ise kısa molaların sosyal medyada uzadığını ortaya koymaktadır (Çalışma C). Ancak nedensel kanıt tek bir deneysel çalışmaya dayanmaktadır ve araştırmaların tamamı lisans öğrencileriyle yürütülmüştür.”

İkinci paragraf aynı kaynakları kullanıyor ama okura bir **sonuç** veriyor ve bir **boşluk** gösteriyor. Literatür taramasının işi budur. Kuramsal çerçeve ile literatür taramasının farkı için [kuramsal ve kavramsal çerçeve rehberimize](/blog/kuramsal-cerceve-kavramsal-cerceve-farki) bakabilirsiniz.

## Sık yapılan hatalar

- Matrisi okumayı bitirdikten sonra, hafızadan doldurmak
- Okunmayan bilgiyi (ör. özetten örneklem sayısı) tahminle doldurmak
- Çok fazla sütun açıp hiçbirini düzenli doldurmamak
- Tabloyu literatür taramasına olduğu gibi yapıştırmak (tablo bir çalışma aracıdır; tezde sentez yazısı beklenir, gerekirse özet tablo eklenir)
- “Çalışmamla ilişkisi” sütununu boş bırakmak: kaynağın tezde neden yer aldığı belirsiz kalır

## Hangi araçla hazırlanır?

Excel, Google E-Tablolar veya Word tablosu yeterlidir. Kaynak künyelerini ayrıca bir kaynak yönetim programında tutmak işinizi kolaylaştırır: [Zotero ve Mendeley rehberimize](/blog/zotero-mendeley-ile-kaynak-yonetimi) bakabilirsiniz.

## Academiana ile literatür matrisi

Kaynaklarınızı çalışmanıza ekledikten sonra “Kaynaklar” sekmesindeki “Literatür matrisi” düğmesiyle her kaynak için amaç, yöntem, örneklem, bulgular ve “çalışmamızla ilişkisi” sütunları doldurulur. Matris **yalnızca okunan özetten veya tam metinden** çıkarılır; yalnızca künyesi bilinen kaynakların satırı boş kalır ve öyle işaretlenir, tahminle doldurulmaz. Tabloyu Excel için CSV olarak indirebilir ya da belgenize tablo olarak ekleyebilirsiniz. Kaynaklar arasındaki atıf bağlarını ve konu kümelerini görmek için “Araçlar” → “Literatür haritası” da işinize yarar. (Literatür matrisi ve haritası Pro paketindedir.)`,
    sources: [
      { text: "Garrard, J. (2017). Health sciences literature review made easy: The matrix method (5th ed.). Jones & Bartlett Learning." },
      { text: "Webster, J., & Watson, R. T. (2002). Analyzing the past to prepare for the future: Writing a literature review. MIS Quarterly, 26(2), xiii–xxiii." },
      { text: "Torraco, R. J. (2005). Writing integrative literature reviews: Guidelines and examples. Human Resource Development Review, 4(3), 356–367." },
      { text: "Booth, A., Sutton, A., & Papaioannou, D. (2016). Systematic approaches to a successful literature review (2nd ed.). SAGE." },
    ],
  },
];
