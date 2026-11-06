import type { BlogPost } from "./types";

export const POSTS_4: BlogPost[] = [
  {
    slug: "orneklem-buyuklugu-nasil-hesaplanir",
    title: "Örneklem Büyüklüğü Nasıl Hesaplanır? Cochran, Yamane ve Güç Analizi",
    description: "Tez ve makaleler için örneklem büyüklüğünü adım adım hesaplayın: Cochran ve Yamane formülleri, sonlu evren düzeltmesi, güç analizi ve yanıt oranı payı.",
    category: "Araştırma ve yöntem",
    keywords: ["örneklem büyüklüğü hesaplama", "cochran formülü", "yamane formülü", "güç analizi", "örneklem nasıl belirlenir"],
    date: "2026-11-06",
    cta: { text: "Evren büyüklüğünüzü ve hata payınızı girin; örneklem büyüklüğünü ve yöntem bölümüne yazabileceğiniz hazır cümleyi hemen alın. Giriş gerekmez.", href: "/araclar/orneklem-hesaplayici", label: "Örneklem hesaplayıcıyı aç" },
    body: `Yöntem bölümünde jürinin en sık sorduğu sorulardan biri şudur: "Bu kadar katılımcıya neden ulaştınız?" "Danışmanım 300 kişi yeter dedi" ya da "elimdeki anket bu kadar döndü" gibi cevaplar bu soruyu karşılamaz. Örneklem büyüklüğü bir tahmin değil, gerekçesi yazılabilen bir hesaptır. Bu yazıda nicel araştırmalarda en sık kullanılan üç yaklaşımı, hesaplı örneklerle ve yöntem bölümüne nasıl yazılacağıyla birlikte anlatıyoruz.

## Önce iki kavram: evren ve örneklem

**Evren**, araştırma sonuçlarını genellemek istediğiniz grubun tamamıdır. Örneğin "Ankara'daki devlet ortaokullarında görev yapan matematik öğretmenleri". **Örneklem** ise bu gruptan veri toplanan kısımdır. Örneklem büyüklüğü hesabı şu soruyu cevaplar: Evrene güvenle genelleme yapabilmek için en az kaç kişiye ulaşmalıyım?

Hesaba başlamadan önce üç şeye karar vermeniz gerekir:

- **Evren büyüklüğü (N):** Biliniyor mu? Biliniyorsa yaklaşık kaç kişi?
- **Hata payı (e):** Sosyal bilimlerde genellikle %5 (0,05) kullanılır. Daha kesin sonuç istiyorsanız %3 seçebilirsiniz; bu durumda gereken örneklem büyür.
- **Güven düzeyi:** Genellikle %95'tir. Bu düzeye karşılık gelen Z değeri 1,96'dır.

## 1. Yaklaşım: Cochran formülü

Cochran formülü, bir oranı (ör. "öğretmenlerin yüzde kaçı tükenmişlik yaşıyor") tahmin etmek isteyen betimsel ve tarama araştırmalarında en çok kullanılan yöntemdir.

Sonsuz (veya çok büyük) evren için:

**n₀ = Z² × p × q / e²**

Burada p, aranan özelliğin evrendeki tahmini oranıdır. Bilinmiyorsa en büyük örneklemi veren 0,5 alınır; q = 1 − p'dir.

%95 güven, %5 hata payı ve p = 0,5 için: n₀ = 1,96² × 0,5 × 0,5 / 0,05² = 384,16 → **385 kişi**.

Evren biliniyorsa ve çok büyük değilse **sonlu evren düzeltmesi** uygulanır:

**n = n₀ / (1 + (n₀ − 1) / N)**

**Örnek:** Evren 1.000 öğretmen olsun. n = 384,16 / (1 + 383,16 / 1.000) = 384,16 / 1,383 ≈ **278 öğretmen**.

Bu düzeltme evren küçüldükçe daha belirgin hâle gelir. 200 kişilik bir evrende yaklaşık 132 kişi yeterli olurken, 100.000 kişilik bir evrende sonuç 383'e çok yakındır. Büyük evrenlerde gereken örneklem neredeyse sabit kalır.

## 2. Yaklaşım: Yamane formülü

Türkiye'deki tezlerde sık görülen Yamane formülü, Cochran'ın %95 güven ve p = 0,5 için sadeleştirilmiş hâlidir:

**n = N / (1 + N × e²)**

1.000 kişilik evren ve %5 hata payı için: n = 1.000 / (1 + 1.000 × 0,0025) = 1.000 / 3,5 ≈ **286 kişi**.

Yamane'nin avantajı kolay hesaplanmasıdır. Sınırlılığı ise güven düzeyini ve oranı değiştirmenize izin vermemesidir. Jüri farklı bir güven düzeyi sorarsa Cochran ile hesaplamak daha esnektir.

## 3. Yaklaşım: Güç analizi (deneysel ve ilişkisel çalışmalar için)

Araştırmanız bir oran tahmin etmiyor da **iki grubu karşılaştırıyor** (ör. deney ve kontrol grubu) ya da **iki değişken arasındaki ilişkiyi** inceliyorsa, Cochran ve Yamane uygun değildir. Bu durumda **güç analizi** yapılır. Güç analizi, gerçekten var olan bir etkiyi yakalama olasılığınızı (istatistiksel güç) belirli bir düzeyde tutmak için gereken örneklemi hesaplar.

Güç analizi için dört bilgi gerekir:

1. **Etki büyüklüğü:** Beklediğiniz farkın veya ilişkinin büyüklüğü. Önceki çalışmalardan alınır; yoksa Cohen'in ölçütlerine göre "orta" etki varsayılır.
2. **Anlamlılık düzeyi (α):** Genellikle 0,05.
3. **Güç (1 − β):** Genellikle 0,80.
4. **Test türü:** t testi, ANOVA, korelasyon, regresyon…

Cohen'in ölçütleriyle sık karşılaşılan durumlar (α = 0,05, güç = 0,80, iki yönlü):

- **Bağımsız örneklemler t testi, orta etki (d = 0,5):** grup başına yaklaşık **64 kişi**, toplam 128.
- **Tek yönlü ANOVA, üç grup, orta etki (f = 0,25):** toplam yaklaşık **159 kişi** (grup başına 53).
- **Pearson korelasyonu, orta ilişki (r = 0,30):** yaklaşık **85 kişi**.

Bu hesapları G*Power gibi ücretsiz programlarla yapabilirsiniz. Yöntem bölümüne programın adını, sürümünü ve kullandığınız dört değeri yazmanız yeterlidir.

> Küçük bir etki bekliyorsanız gereken örneklem hızla büyür. Örneğin t testinde küçük etki (d = 0,2) için grup başına yaklaşık 394 kişi gerekir. Bu yüzden etki büyüklüğünü literatüre dayandırmak önemlidir.

## Yanıt oranı ve veri kaybı payı

Hesapladığınız sayı, **analize girecek** geçerli veri sayısıdır. Gerçekte bazı anketler dönmez, bazıları eksik veya özensiz doldurulur. Bu yüzden ulaşacağınız kişi sayısını yanıt oranına göre artırın:

**Ulaşılacak kişi = Gereken örneklem / Beklenen yanıt oranı**

278 kişilik örneklem ve %70 beklenen yanıt oranı için: 278 / 0,70 ≈ **398 kişiye** anket gönderilmelidir.

## Örnekleme yöntemi de en az sayı kadar önemli

Doğru sayıya ulaşmak, örneklemin evreni temsil ettiği anlamına gelmez. Yöntem bölümünde örnekleme yöntemini de açıklayın:

- **Basit seçkisiz örnekleme:** Evrendeki herkesin seçilme şansı eşittir; bunun için evrenin listesine ihtiyaç vardır.
- **Tabakalı örnekleme:** Evren alt gruplara (ör. okul türü, bölge) ayrılır ve her gruptan orantılı sayıda kişi seçilir.
- **Küme örnekleme:** Bireyler yerine okul, sınıf veya hastane gibi kümeler seçilir.
- **Kolay ulaşılabilir (uygun) örnekleme:** Ulaşabildiğiniz kişilerle çalışırsınız. Tezlerde çok yaygındır ama genellemeyi sınırlar; bunu sınırlılıklar bölümünde açıkça belirtin.

Kolay ulaşılabilir örneklem kullansanız bile hesapladığınız sayıya ulaşmak, sonuçların kararlılığı için yine önemlidir.

## Nitel araştırmalarda durum farklı

Görüşme veya odak grup çalışmalarında formül kullanılmaz. Örneklem büyüklüğü genellikle **veri doygunluğu** ile gerekçelendirilir: Yeni görüşmeler artık yeni kod veya tema üretmediğinde veri toplama sonlandırılır. Bu ilkeyi ve doygunluğa hangi görüşmede ulaştığınızı yöntem bölümüne yazmanız yeterlidir. Ayrıntılar için [nitel araştırmada görüşme ve tematik analiz](/blog/nitel-arastirma-gorusme-ve-tematik-analiz) yazımıza bakabilirsiniz.

## Yöntem bölümüne nasıl yazılır?

İyi bir örneklem paragrafı; evreni, hesap yöntemini, kullanılan değerleri, ulaşılan sayıyı ve örnekleme yöntemini içerir. Örnek:

"Araştırmanın evrenini 2025–2026 eğitim-öğretim yılında Ankara'daki devlet ortaokullarında görev yapan 1.000 matematik öğretmeni oluşturmaktadır. Örneklem büyüklüğü, %95 güven düzeyi ve %5 hata payı ile Cochran formülüne göre sonlu evren düzeltmesi uygulanarak en az 278 kişi olarak hesaplanmıştır. %70 yanıt oranı öngörülerek 400 öğretmene ulaşılmış, eksik ve özensiz doldurulan formlar çıkarıldıktan sonra 291 geçerli form analize alınmıştır. Katılımcılar okul türüne göre tabakalı örnekleme yöntemiyle belirlenmiştir."

## Sık yapılan hatalar

- **Evreni tanımlamadan sayı vermek:** Önce kimin hakkında genelleme yaptığınızı yazın.
- **Formülü yanlış yerde kullanmak:** Grupları karşılaştıran bir deneysel çalışmada Yamane yerine güç analizi gerekir.
- **Yanıt oranını hesaba katmamak:** Hesapladığınız sayıya kadar anket göndermek, genellikle eksik örneklemle sonuçlanır.
- **"Yeterli sayıya ulaşıldı" demekle yetinmek:** Hangi değerlerle hesaplandığını yazmazsanız jüri yeniden sorar.
- **Hesapladığınızdan çok az kişiyle analiz yapmak:** Eğer ulaşamadıysanız bunu saklamayın; sınırlılık olarak belirtin ve sonuçları buna göre temkinli yorumlayın.

## Özetle

Oran tahmin eden tarama çalışmalarında Cochran veya Yamane, grup karşılaştıran ve ilişki inceleyen çalışmalarda güç analizi kullanın. Hesapladığınız sayıyı yanıt oranına göre büyütün, örnekleme yöntemini açıklayın ve bütün bunları yöntem bölümüne kullandığınız değerlerle birlikte yazın. Hesabı elle yapmak yerine [ücretsiz örneklem hesaplayıcımızı](/araclar/orneklem-hesaplayici) kullanabilirsiniz; araç hem sayıyı hem de yöntem bölümüne uygun hazır cümleyi verir.`,
  },
  {
    slug: "cronbach-alfa-nedir-nasil-yorumlanir",
    title: "Cronbach Alfa Nedir, Nasıl Hesaplanır ve Yorumlanır?",
    description: "Cronbach alfa ne anlama gelir, kaç olmalı? Kabul edilebilir değerler, madde-toplam korelasyonu ve düşük alfa çıktığında yapılacaklar.",
    category: "Araştırma ve yöntem",
    keywords: ["cronbach alfa", "güvenirlik katsayısı", "iç tutarlılık", "madde toplam korelasyonu", "ölçek güvenirliği"],
    date: "2026-11-06",
    cta: { text: "Verinizi yapıştırın; Cronbach alfa, madde-toplam korelasyonları ve “madde silinirse alfa” değerleri tarayıcınızda hesaplansın. Giriş gerekmez, veri sunucuya gönderilmez.", href: "/araclar/cronbach-alfa", label: "Cronbach alfa hesapla" },
    body: `Likert tipi bir ölçek kullanan hemen her tezde "ölçeğin bu çalışmadaki Cronbach alfa katsayısı …" cümlesi bulunur. Ama bu sayının neyi gösterip neyi göstermediği çoğu zaman bilinmez. Sonuçta ya 0,70'in altında bir değer çıktığında panik yaşanır ya da 0,95 gibi çok yüksek bir değer hiç sorgulanmadan rapor edilir. Bu yazıda Cronbach alfanın mantığını, nasıl yorumlanacağını ve sorun çıktığında neler yapılabileceğini anlatıyoruz.

## Cronbach alfa neyi ölçer?

Cronbach alfa bir **iç tutarlılık** katsayısıdır. Aynı özelliği (ör. kaygı, öz yeterlik, iş doyumu) ölçmeye yönelik maddelerin birbiriyle ne kadar uyumlu cevaplandığını gösterir. Bir kişi kaygı maddelerinin birine "kesinlikle katılıyorum" diyorsa, diğer kaygı maddelerine de benzer cevaplar vermesi beklenir. Maddeler arasındaki bu tutarlılık arttıkça alfa da yükselir.

Formülü şöyledir:

**α = k / (k − 1) × (1 − Σσᵢ² / σₜ²)**

- **k:** madde sayısı
- **σᵢ²:** her maddenin varyansı
- **σₜ²:** toplam puanın varyansı

Formülden iki önemli sonuç çıkar. Birincisi, maddeler birbiriyle ilişkili oldukça toplam puanın varyansı büyür ve alfa yükselir. İkincisi, **madde sayısı arttıkça alfa da kendiliğinden yükselme eğilimindedir.** 30 maddelik bir ölçeğin yüksek alfası, 4 maddelik bir alt boyutun daha düşük alfasından her zaman daha "iyi" olduğu anlamına gelmez.

## Hangi değer kabul edilebilir?

Literatürde sık kullanılan kaba bir sınıflama şöyledir:

- **0,90 ve üzeri:** mükemmel
- **0,80–0,89:** iyi
- **0,70–0,79:** kabul edilebilir
- **0,60–0,69:** sınırda (şüpheli)
- **0,60'ın altı:** zayıf

Bu sınırlar mutlak kurallar değildir. Az maddeli alt boyutlarda (3–4 madde) 0,60'lı değerler görülebilir ve gerekçesiyle tartışılabilir. Bireyler hakkında karar verilecek klinik veya seçme amaçlı ölçümlerde ise daha yüksek değerler beklenir.

> **Çok yüksek alfa da sorun olabilir.** 0,95'in üzerindeki değerler, bazı maddelerin aynı şeyi neredeyse aynı kelimelerle sorduğuna (madde tekrarı) işaret edebilir. Bu durumda ölçek gereksiz uzun olabilir.

## Madde-toplam korelasyonu

Alfa tek başına hangi maddenin sorunlu olduğunu söylemez. Bunun için **düzeltilmiş madde-toplam korelasyonuna** bakılır. Bu değer, her maddenin o madde hariç diğer maddelerin toplamıyla ne kadar ilişkili olduğunu gösterir.

- **0,30 ve üzeri:** madde ölçekle uyumlu kabul edilir.
- **0,20–0,30 arası:** madde gözden geçirilmelidir.
- **0,20'nin altı veya negatif:** madde büyük olasılıkla sorunludur.

Negatif bir değer görürseniz ilk olarak **ters puanlanması gereken bir maddeyi düz puanlamış** olabileceğinizi kontrol edin. "Derslerde kendimi rahat hissederim" gibi olumlu ifade edilmiş bir madde kaygı ölçeğindeyse, analizden önce ters çevrilmelidir. 5'li Likert'te bu, puanı (6 − puan) olarak değiştirmek demektir.

## "Madde silinirse alfa" değeri

Analiz çıktılarında her madde için "bu madde silinirse alfa kaç olur" değeri yer alır. Bir maddeyi sildiğinizde alfa belirgin biçimde yükseliyorsa, o madde ölçeğin geri kalanıyla uyumsuz olabilir.

Ancak **sadece alfa yükseliyor diye madde silmeyin.** Uyarlanmış ve geçerliği gösterilmiş bir ölçekten madde çıkarmak, ölçeğin özgün yapısını bozar ve sonuçlarınızı diğer çalışmalarla karşılaştırılamaz hâle getirir. Madde silme kararını yalnızca kuramsal bir gerekçe varsa ve ölçek geliştirme sürecindeyseniz verin. Uyarlanmış bir ölçekte sorunlu bir madde görürseniz, bunu silmek yerine tartışma veya sınırlılıklar bölümünde belirtmek çoğu zaman daha doğrudur.

## Alfa düşük çıktı: ne yapmalı?

Panik yapmadan önce şu adımları sırayla kontrol edin:

1. **Ters maddeler doğru çevrildi mi?** Düşük alfanın en sık nedeni budur.
2. **Veri girişinde hata var mı?** 5'li ölçekte 6, 7 veya 55 gibi değerler olmamalıdır.
3. **Özensiz doldurulmuş formlar var mı?** Bütün maddelere aynı cevabı veren veya çok kısa sürede dolduran katılımcıları inceleyin. Bunları çıkarırsanız yöntem bölümünde bunu ve gerekçesini belirtin.
4. **Alfayı alt boyut düzeyinde mi hesapladınız?** Çok boyutlu ölçeklerde toplam puan yerine her alt boyut için ayrı alfa raporlanmalıdır. Birbirinden farklı yapıları ölçen maddelerin toplam alfası yanıltıcı olabilir.
5. **Örneklem çok mu küçük veya homojen?** Katılımcılar birbirine çok benziyorsa puanların varyansı düşer ve alfa da düşer.

Bu adımlardan sonra değer hâlâ düşükse, sonucu olduğu gibi rapor edin ve tartışmada ele alın. Değeri "düzeltmek" için madde seçmek veya katılımcı çıkarmak araştırma etiğine aykırıdır.

## Cronbach alfanın sınırlılıkları

- **Tek boyutluluğu kanıtlamaz.** Yüksek alfa, ölçeğin tek bir yapıyı ölçtüğünü göstermez; bunun için faktör analizi gerekir.
- **Geçerlik kanıtı değildir.** Bir ölçek tutarlı biçimde yanlış şeyi ölçebilir. Güvenirlik, geçerliğin ön koşuludur ama yerine geçmez.
- **Varsayımlara dayanır.** Alfa, bütün maddelerin yapıya eşit katkı yaptığını varsayar. Bu varsayım sağlanmadığında **McDonald omega** katsayısı daha doğru bir tahmin verebilir. Pek çok dergi artık omega raporlanmasını da önermektedir.

Ölçeğin geçerlik çalışmasının nasıl yapıldığını [ölçek geçerlik ve güvenirlik çalışması](/blog/olcek-gecerlik-guvenirlik-calismasi) yazımızda ayrıntılı olarak anlattık.

## Yöntem bölümüne nasıl yazılır?

İyi bir güvenirlik paragrafı, ölçeğin özgün çalışmadaki değerini ve sizin çalışmanızdaki değerini birlikte verir. Örnek:

"Öğretmen Öz Yeterlik Ölçeği'nin özgün uyarlama çalışmasında Cronbach alfa katsayısı .91 olarak bildirilmiştir. Bu çalışmada ölçeğin toplam puanı için Cronbach alfa .89, alt boyutlar için ise .82 (öğrenci katılımı), .85 (öğretim stratejileri) ve .87 (sınıf yönetimi) olarak hesaplanmıştır. Düzeltilmiş madde-toplam korelasyonları .38 ile .71 arasında değişmektedir."

APA stilinde, en fazla 1 olabilen katsayılar ondalık noktadan önce sıfır yazılmadan verilir (".89" gibi). Türkçe tezlerde enstitünüzün yazım kılavuzu farklı bir biçim istiyorsa ona uyun.

## Özetle

Cronbach alfa, maddelerin birbiriyle tutarlı cevaplanıp cevaplanmadığını gösterir; 0,70 ve üzeri genellikle yeterli kabul edilir. Düşük değerlerde önce ters maddeleri ve veri hatalarını kontrol edin, maddeleri yalnızca alfa yükselsin diye silmeyin ve alfayı geçerliğin kanıtı olarak sunmayın. Verinizi [ücretsiz Cronbach alfa aracımıza](/araclar/cronbach-alfa) yapıştırarak alfa, madde-toplam korelasyonları ve "madde silinirse alfa" değerlerini birkaç saniyede görebilirsiniz.`,
  },
  {
    slug: "olcek-gecerlik-guvenirlik-calismasi",
    title: "Ölçek Geçerlik ve Güvenirlik Çalışması Nasıl Yapılır? Uyarlama Rehberi",
    description: "Ölçek geliştirme ve uyarlamada kapsam geçerliği, açımlayıcı ve doğrulayıcı faktör analizi, uyum indeksleri ve güvenirlik adımlarını sade bir dille öğrenin.",
    category: "Araştırma ve yöntem",
    keywords: ["ölçek uyarlama", "geçerlik güvenirlik çalışması", "açımlayıcı faktör analizi", "doğrulayıcı faktör analizi", "uyum indeksleri"],
    date: "2026-11-06",
    cta: { text: "Ölçeğinizi Academiana’nın anket oluşturucusuyla hazırlayın, bağlantıyla veri toplayın ve cevapları tek tıkla analize aktarın.", href: "/kayit", label: "Ücretsiz başla" },
    body: `Yurt dışında geliştirilmiş bir ölçeği Türkçeye uyarlamak veya sıfırdan bir ölçek geliştirmek, yüksek lisans ve doktora tezlerinde en sık karşılaşılan çalışma türlerinden biridir. Bu süreç yalnızca maddeleri çevirmekten ibaret değildir. Ölçeğin yeni kültürde ve dilde de aynı yapıyı, tutarlı biçimde ölçtüğünü kanıtlarla göstermeniz gerekir. Bu yazıda geçerlik ve güvenirlik çalışmasının adımlarını sırasıyla anlatıyoruz.

## Geçerlik ve güvenirlik arasındaki fark

- **Güvenirlik:** Ölçeğin tutarlı sonuç verip vermediğidir. Aynı kişi benzer koşullarda ölçeği tekrar doldursa benzer puan alır mı? Maddeler birbiriyle uyumlu mu?
- **Geçerlik:** Ölçeğin ölçmek istediği özelliği gerçekten ölçüp ölçmediğidir.

Bir tartı her seferinde 2 kilo fazla gösteriyorsa güvenilirdir (hep aynı sonucu verir) ama geçerli değildir. Bu yüzden iki özellik ayrı ayrı kanıtlanır.

## Uyarlama çalışmasının adımları

### 1. İzin alın

Ölçeği geliştiren araştırmacıdan veya telif hakkı sahibinden yazılı izin alın ve bu yazışmayı saklayın. Pek çok etik kurul ve dergi bu izni ister.

### 2. Dil eşdeğerliği: çeviri ve geri çeviri

Yaygın yaklaşım şöyledir:

1. Maddeler en az iki bağımsız çevirmen tarafından Türkçeye çevrilir.
2. Çeviriler karşılaştırılarak ortak bir Türkçe form oluşturulur.
3. Bu form, özgün ölçeği görmemiş başka bir çevirmen tarafından yeniden İngilizceye çevrilir (geri çeviri).
4. Geri çeviri özgün maddelerle karşılaştırılır; anlam kayması olan maddeler düzeltilir.

Ardından her iki dili de bilen bir grupla **dil eşdeğerliği** sınanabilir: Aynı kişiler İngilizce ve Türkçe formları belirli aralıklarla doldurur ve iki formun puanları arasındaki korelasyon incelenir.

### 3. Kapsam geçerliği: uzman görüşü

Alan uzmanlarından her maddenin ölçülen yapıyı temsil edip etmediğini değerlendirmeleri istenir. Bu görüşler sayısallaştırılabilir. Yaygın yöntemlerden biri **Lawshe tekniğidir**: Her madde için "gerekli" diyen uzman sayısından kapsam geçerlik oranı hesaplanır ve uzman sayısına göre belirlenen ölçüt değerle karşılaştırılır.

Kültüre uymayan ifadeler (ör. Türkiye'de karşılığı olmayan bir okul uygulaması) bu aşamada uyarlanır.

### 4. Ön uygulama (pilot)

Hedef gruba benzeyen küçük bir gruba ölçek uygulanır ve maddelerin anlaşılırlığı sorulur. Anlaşılmayan veya yanlış yorumlanan maddeler düzeltilir.

### 5. Asıl uygulama ve örneklem

Faktör analizi için yeterli örneklem gerekir. Literatürde madde başına 5–10 katılımcı veya en az 200–300 kişi gibi kaba kurallar sık kullanılır; ancak bu kurallar yerine verinin özelliklerine bakmak daha doğrudur. Uyarlama çalışmalarında yeterli büyüklükte tek bir örneklem genellikle doğrulayıcı faktör analizi için kullanılır.

## Yapı geçerliği: faktör analizi

### Açımlayıcı faktör analizi (AFA)

AFA, maddelerin kaç boyut altında toplandığını **keşfetmek** için kullanılır. Ölçek geliştirme çalışmalarında temel yöntemdir.

Önce verinin faktör analizine uygun olup olmadığına bakılır:

- **KMO (Kaiser-Meyer-Olkin) değeri:** Örneklemin yeterliğini gösterir. Genellikle 0,60'ın üzeri kabul edilebilir, 0,80'in üzeri iyi sayılır.
- **Bartlett küresellik testi:** Anlamlı çıkması (p < .05), maddeler arasında faktör analizi yapmaya yetecek ilişki olduğunu gösterir.

Ardından şunlar raporlanır:

- **Faktör sayısı:** Özdeğerin 1'den büyük olması, yamaç-birikinti grafiği ve paralel analiz birlikte değerlendirilir.
- **Faktör yükleri:** Bir maddenin yük değeri genellikle en az 0,30–0,40 olmalıdır. İki faktöre de yüksek yük veren (binişik) maddeler incelenir.
- **Açıklanan varyans:** Faktörlerin toplam varyansın ne kadarını açıkladığı.

### Doğrulayıcı faktör analizi (DFA)

DFA, özgün çalışmada belirlenmiş yapının sizin verinizde de **doğrulanıp doğrulanmadığını** sınar. Ölçek uyarlamada temel yöntem budur.

DFA'da modelin veriye uyumu **uyum indeksleriyle** değerlendirilir. Sık kullanılan indeksler ve yaygın ölçütler:

- **χ²/sd (ki-kare / serbestlik derecesi):** 3'ün altı iyi, 5'in altı kabul edilebilir kabul edilir. Ki-kare büyük örneklemlerde kolayca anlamlı çıktığı için tek başına değerlendirilmez.
- **RMSEA:** 0,05–0,06'nın altı iyi, 0,08'in altı kabul edilebilir.
- **CFI ve TLI:** 0,95'in üzeri iyi, 0,90'ın üzeri kabul edilebilir.
- **SRMR:** 0,08'in altı kabul edilebilir.

Bu ölçütler kesin eşikler değil, yaygın kullanılan rehber değerlerdir. Yöntem bölümünde hangi ölçütleri kullandığınızı kaynak göstererek belirtin.

Uyum düşükse modifikasyon indeksleri ile hata terimleri arasında bağlantı (kovaryans) eklenebilir. Ancak bunu yalnızca kuramsal olarak gerekçelendirilebilen durumlarda, örneğin aynı alt boyutta benzer ifadeler içeren maddeler arasında yapın ve her değişikliği raporlayın.

## Güvenirlik kanıtları

- **İç tutarlılık:** Her alt boyut ve toplam puan için Cronbach alfa ve mümkünse McDonald omega. Ayrıntılar için [Cronbach alfa rehberimize](/blog/cronbach-alfa-nedir-nasil-yorumlanir) bakın.
- **Test-tekrar test güvenirliği:** Aynı gruba ölçek belirli bir aralıkla (genellikle 2–4 hafta) iki kez uygulanır ve iki puan arasındaki korelasyon hesaplanır.
- **Madde analizi:** Düzeltilmiş madde-toplam korelasyonları ve alt %27 ile üst %27'lik grupların madde ortalamalarının karşılaştırılması, maddelerin ayırt ediciliğini gösterir.

## Ölçüt geçerliği (isteğe bağlı ama güçlü)

Ölçeğinizin puanları, benzer yapıyı ölçen ve geçerliği bilinen başka bir ölçeğin puanlarıyla beklenen yönde ilişkiliyse (benzer ölçekler geçerliği), bu yapı geçerliğine ek bir kanıt sunar.

## Sık yapılan hatalar

- **Uyarlamada yalnızca AFA yapmak:** Yapısı bilinen bir ölçeği uyarlarken yapının doğrulanması (DFA) beklenir.
- **AFA ve DFA'yı aynı veride yapmak:** İki analiz aynı veride yapılırsa DFA, AFA'nın bulduğu yapıyı doğal olarak "doğrular". Mümkünse veriyi ikiye bölün veya iki ayrı örneklem kullanın.
- **Uyum indekslerini seçerek raporlamak:** İyi çıkanları değil, standart indekslerin hepsini raporlayın.
- **İzin almadan ölçek kullanmak:** Etik ve hukuki sorunlara yol açar.
- **Yalnızca toplam puanın alfasını vermek:** Çok boyutlu ölçeklerde her alt boyutun güvenirliği ayrıca verilmelidir.

## Özetle

Ölçek uyarlama; izin, çeviri ve geri çeviri, uzman görüşü, pilot uygulama, doğrulayıcı faktör analizi ve güvenirlik analizlerinden oluşan bir süreçtir. Her adımı kullandığınız ölçütlerle birlikte raporlamak, jüri ve hakemlerin en çok aradığı şeydir. Veri toplama aşamasında Academiana'nın anket oluşturucusunu kullanarak ölçeğinizi bağlantıyla dağıtabilir, ters maddeleri otomatik kodlayabilir ve cevapları doğrudan analize aktarabilirsiniz.`,
  },
  {
    slug: "nitel-arastirma-gorusme-ve-tematik-analiz",
    title: "Nitel Araştırmada Görüşme ve Tematik Analiz Nasıl Yapılır?",
    description: "Yarı yapılandırılmış görüşme formu hazırlama, kodlama, tema oluşturma ve inandırıcılık stratejileriyle nitel araştırmayı adım adım yürütün.",
    category: "Araştırma ve yöntem",
    keywords: ["nitel araştırma", "yarı yapılandırılmış görüşme", "tematik analiz", "içerik analizi", "kodlama nasıl yapılır"],
    date: "2026-11-06",
    cta: { text: "Görüşme sorularınızı ve kod listenizi proje hafızasına kaydedin; asistan bulgular bölümünü yalnızca sizin verdiğiniz temalar ve alıntılarla düzenlemenize yardım etsin.", href: "/kayit", label: "Ücretsiz başla" },
    body: `Nitel araştırma, "ne kadar?" sorusundan çok "nasıl?" ve "neden?" sorularına cevap arar. Öğretmenlerin uzaktan eğitim deneyimleri, hemşirelerin tükenmişliği nasıl yaşadığı ya da öğrencilerin yapay zekâ araçlarına bakışı gibi konularda derinlemesine bilgi sunar. Ancak nitel çalışmalar, "birkaç kişiyle konuşup söylediklerini yazmak" olarak görüldüğünde jüriden kolayca dönebilir. Bu yazıda görüşmeye dayalı bir nitel çalışmanın baştan sona nasıl yürütüleceğini anlatıyoruz.

## Doğru desen seçimi

Nitel araştırmalarda en sık kullanılan desenler şunlardır:

- **Olgubilim (fenomenoloji):** Bir olguyu yaşayan kişilerin deneyimlerini ve bu deneyime yükledikleri anlamı inceler. Örnek: "Sınav kaygısı yaşayan lise öğrencilerinin deneyimleri."
- **Durum çalışması:** Belirli bir okulu, programı veya uygulamayı kendi bağlamında derinlemesine inceler.
- **Temele dayalı kuram (gömülü teori):** Veriden yola çıkarak bir süreci açıklayan kuram geliştirmeyi amaçlar.
- **Temel nitel araştırma:** Belirli bir desene bağlı kalmadan bir konudaki görüş ve deneyimleri betimler. Tezlerde çok yaygındır.

Deseninizi araştırma sorunuza göre seçin ve yöntem bölümünde neden bu deseni seçtiğinizi açıklayın.

## Katılımcıların seçimi

Nitel araştırmada amaç genelleme değil derinliktir. Bu yüzden katılımcılar genellikle **amaçlı örnekleme** ile seçilir:

- **Ölçüt örnekleme:** Belirli ölçütleri taşıyan kişiler seçilir (ör. en az beş yıl kıdemi olan okul öncesi öğretmenleri).
- **Maksimum çeşitlilik:** Farklı özelliklerdeki kişiler bilinçli olarak seçilir (farklı okul türleri, cinsiyetler, kıdem grupları).
- **Kartopu örnekleme:** Ulaşılması zor gruplarda, görüşülen kişilerin önerdiği diğer kişilere ulaşılır.

Katılımcı sayısı formülle değil **veri doygunluğuyla** gerekçelendirilir. Yeni görüşmeler artık yeni kod veya tema getirmediğinde veri toplama sonlandırılır.

## Yarı yapılandırılmış görüşme formu hazırlama

Yarı yapılandırılmış görüşmede önceden hazırlanmış sorular vardır, ancak görüşmeci cevaplara göre ek sorular sorabilir. İyi bir form şu özellikleri taşır:

- **Açık uçlu sorular:** "Uzaktan eğitim sizce verimli miydi?" yerine "Uzaktan eğitim sürecindeki deneyimlerinizi anlatır mısınız?"
- **Yönlendirmeyen sorular:** "Yöneticinizin baskısı sizi nasıl etkiledi?" sorusu, baskı olduğunu varsayar. "Yöneticinizle ilişkinizi nasıl tanımlarsınız?" daha tarafsızdır.
- **Sondalar:** Her ana sorunun altında "Bir örnek verebilir misiniz?", "Bu sizi nasıl hissettirdi?" gibi derinleştirme soruları bulunur.
- **Makul uzunluk:** 6–10 ana soru çoğu çalışma için yeterlidir. Görüşme genellikle 30–60 dakika sürer.

Formu iki-üç alan uzmanına inceletin ve bir veya iki **pilot görüşme** yapın. Anlaşılmayan veya aynı cevabı üreten soruları düzeltin.

## Görüşmeleri yürütme ve kayıt

- **Bilgilendirilmiş onam:** Katılımcılara çalışmanın amacını, gönüllülüğü, istedikleri an ayrılabileceklerini ve kimliklerinin gizli tutulacağını açıklayın. Ses kaydı için ayrıca izin alın. Etik kurul onayını veri toplamadan önce alın.
- **Kod adları:** Katılımcılara K1, K2 veya Ö1, Ö2 gibi kodlar verin. Raporda kimliği belli edecek ayrıntıları (okul adı, nadir branş) çıkarın.
- **Döküm:** Ses kayıtlarını kelimesi kelimesine yazıya dökün. Bu aşama uzun sürer; bir saatlik görüşmenin dökümü birkaç saat alabilir. Dökümü yaparken veriyle tanışmış olursunuz.

## Tematik analiz: altı adım

Braun ve Clarke'ın (2006) tanımladığı tematik analiz, nitel verinin analizinde en çok kullanılan yaklaşımlardan biridir. Altı aşamadan oluşur:

1. **Veriyle tanışma:** Dökümleri birkaç kez okuyun ve ilk izlenimlerinizi not edin.
2. **İlk kodları oluşturma:** Anlamlı her veri parçasına kısa bir etiket (kod) verin. Örneğin "Ekran başında öğrencinin kamerayı kapatması" ifadesine "Etkileşim eksikliği" kodu verilebilir.
3. **Temaları arama:** Birbiriyle ilişkili kodları gruplayarak olası temalar oluşturun.
4. **Temaları gözden geçirme:** Her temanın verilerle desteklenip desteklenmediğini, temaların birbirinden yeterince farklı olup olmadığını kontrol edin. Gerekirse temaları birleştirin veya bölün.
5. **Temaları tanımlama ve adlandırma:** Her temanın neyi anlattığını bir iki cümleyle tanımlayın ve açıklayıcı bir ad verin.
6. **Raporu yazma:** Temaları, onları destekleyen doğrudan alıntılarla birlikte sunun.

Bu süreç doğrusal değildir; dördüncü aşamada ikinci aşamaya dönmeniz çok normaldir.

### Tümevarımsal mı, tümdengelimsel mi?

- **Tümevarımsal (veriden yola çıkan) kodlama:** Kodlar ve temalar veriden doğar. Konunun az çalışıldığı durumlarda uygundur.
- **Tümdengelimsel (kuramdan yola çıkan) kodlama:** Var olan bir kuram veya çerçevedeki kategoriler kullanılır.

Hangisini kullandığınızı yöntem bölümünde açıkça belirtin. İkisinin birlikte kullanıldığı karma yaklaşımlar da mümkündür.

## İnandırıcılık: nitel araştırmada geçerlik ve güvenirlik

Nitel araştırmada nicel anlamdaki geçerlik ve güvenirlik yerine genellikle Lincoln ve Guba'nın (1985) ölçütleri kullanılır:

- **İnandırıcılık (iç geçerlik karşılığı):** Uzun süreli etkileşim, katılımcı teyidi (bulguların katılımcılara okutulması), uzman incelemesi.
- **Aktarılabilirlik (dış geçerlik karşılığı):** Katılımcıları ve bağlamı ayrıntılı betimleme, doğrudan alıntılara yer verme.
- **Tutarlılık (güvenirlik karşılığı):** İkinci bir kodlayıcıyla birlikte kodlama ve kodlayıcılar arası uyumun hesaplanması.
- **Teyit edilebilirlik:** Ham verilerin, kodların ve analiz notlarının saklanması; araştırmacının kendi rolünü ve olası önyargılarını açıklaması.

Yöntem bölümünde bu stratejilerden hangilerini, nasıl kullandığınızı somut olarak yazın. "Geçerlik ve güvenirlik sağlanmıştır" gibi genel ifadeler yeterli değildir.

## Bulgular bölümünü yazma

- Her temayı ayrı bir alt başlık olarak sunun. Gerekirse alt temaları da kullanın.
- Temanın ne olduğunu kısaca açıklayın, ardından onu destekleyen **doğrudan alıntılara** yer verin: "Kamerayı açmalarını istediğimde çoğu internetinin yavaş olduğunu söylüyordu." (K4)
- Alıntıları seçerken tek bir katılımcıya yaslanmayın; farklı katılımcılardan örnekler verin.
- Kodların ve temaların sıklığını bir tabloyla göstermek okuyucuya yardımcı olur, ancak nitel araştırmanın amacının sayma olmadığını unutmayın.
- Bulguları tartışmayla karıştırmayın. Bulgularda katılımcıların söylediklerini sunun; literatürle karşılaştırmayı tartışma bölümüne bırakın.

## Sık yapılan hatalar

- **Görüşme sorularını araştırma sorularıyla aynı yazmak:** Araştırma sorusu sizin cevaplamak istediğiniz sorudur; görüşme soruları ise katılımcının anlayabileceği, deneyime dayalı sorulardır.
- **Kodları tema sanmak:** "Olumsuz görüşler" bir tema değil, bir kategoridir. Tema, veriye dair bir anlam ve yorum içerir.
- **Analiz sürecini anlatmamak:** Kodlamayı nasıl yaptığınızı, kaç kod ve tema elde ettiğinizi, kodlayıcı uyumunu raporlayın.
- **Yalnızca alıntı yığmak:** Her alıntıdan önce ve sonra onu temayla ilişkilendiren kısa bir yorum yazın.

## Özetle

Nitel bir çalışmanın gücü; iyi tasarlanmış açık uçlu sorulardan, dikkatli kodlamadan ve şeffaf raporlamadan gelir. Deseninizi gerekçelendirin, katılımcı sayısını doygunlukla açıklayın, tematik analizin altı adımını izleyin ve inandırıcılık stratejilerinizi somut olarak yazın. Örneklem konusundaki farkları merak ediyorsanız [örneklem büyüklüğü rehberimize](/blog/orneklem-buyuklugu-nasil-hesaplanir) de göz atabilirsiniz.`,
  },
  {
    slug: "yapay-zeka-uydurma-kaynak-tespiti",
    title: "Yapay Zekânın Uydurduğu Kaynaklar Nasıl Tespit Edilir?",
    description: "ChatGPT ve benzeri araçların ürettiği sahte kaynakları DOI, kayıt otoriteleri ve künye tutarlılığıyla nasıl yakalayacağınızı adım adım öğrenin.",
    category: "Etik ve yapay zekâ",
    keywords: ["uydurma kaynak", "yapay zeka sahte kaynak", "chatgpt kaynak uyduruyor mu", "doi kontrolü", "kaynak doğrulama"],
    date: "2026-11-06",
    cta: { text: "Kaynakçanızı yapıştırın; her kaynak DOI ve kayıt otoriteleriyle tek tek kontrol edilsin, uydurma olma ihtimali olanlar işaretlensin. Giriş gerekmez.", href: "/araclar/uydurma-kaynak-kontrolu", label: "Kaynakçamı kontrol et" },
    body: `Genel amaçlı yapay zekâ sohbet araçlarından "bu konuda 10 kaynak önerir misin?" diye istediğinizde, gerçekte var olmayan ama son derece inandırıcı görünen kaynaklar alabilirsiniz. Yazar adları gerçek araştırmacılara benzer, dergi adı gerçektir, yıl ve sayfa numaraları yerindedir; ama makalenin kendisi hiç yayımlanmamıştır. Bu durum literatürde "halüsinasyon" olarak adlandırılır ve tezlerde ciddi akademik dürüstlük sorunlarına yol açabilir. Bu yazıda uydurma kaynakların neden ortaya çıktığını ve nasıl tespit edileceğini anlatıyoruz.

## Yapay zekâ neden kaynak uydurur?

Büyük dil modelleri, bir veri tabanında arama yapmaz. Eğitim verisinde gördüğü metinlerden yola çıkarak "bir kaynağın nasıl görünmesi gerektiğini" üretir. Bu yüzden:

- Gerçek bir yazarın adını, alanına uygun bir dergi adıyla birleştirebilir.
- Var olan bir makalenin başlığını değiştirerek yeni bir başlık oluşturabilir.
- Gerçek bir DOI'yi başka bir makaleye ait gibi verebilir.
- Yıl, cilt, sayı ve sayfa numaralarını tutarlı görünecek şekilde uydurabilir.

Model bunu kötü niyetle yapmaz; yalnızca doğrulanmış bilgiye erişimi yoktur. Ancak sonuç, tezinizde var olmayan bir çalışmaya atıf yapmanızdır. Bu da jüri veya hakem tarafından fark edildiğinde ciddi bir güvenilirlik sorunudur.

## Uydurma kaynağın tipik işaretleri

Aşağıdaki işaretlerden biri tek başına bir kaynağın uydurma olduğunu kanıtlamaz, ama ek kontrol gerektirir:

- **DOI yok veya DOI başka bir yayına gidiyor.** Son yıllarda yayımlanan dergi makalelerinin büyük çoğunluğunun DOI'si vardır.
- **Başlık çok "mükemmel".** Araştırma sorunuzu kelimesi kelimesine karşılayan, konunuzun bütün anahtar kelimelerini içeren bir başlık şüphe uyandırmalıdır.
- **Yazar-alan uyumsuzluğu.** Yazar gerçekten var ama tamamen farklı bir alanda çalışıyor.
- **Dergi-konu uyumsuzluğu.** Bir mühendislik dergisinde eğitim politikası makalesi gibi.
- **Cilt ve yıl tutarsızlığı.** Derginin o yıl yayımladığı cilt numarası, kaynaktaki numarayla uyuşmuyor.
- **Hiçbir yerde bulunamaması.** Google Scholar'da, dergi arşivinde ve veri tabanlarında başlıkla arandığında sonuç çıkmıyor.

## Adım adım doğrulama

### 1. DOI'yi kontrol edin

Kaynakta DOI varsa, tarayıcınızda "doi.org/" adresinin sonuna DOI'yi ekleyerek açın. İki şeye bakın:

- DOI bir yayına gidiyor mu?
- Gittiği yayının başlığı, yazarları ve yılı sizin kaynağınızla aynı mı?

**DOI'nin çalışması yetmez.** Uydurma kaynaklarda sık görülen bir durum, gerçek bir DOI'nin tamamen farklı bir makaleye ait olmasıdır.

### 2. Başlıkla arama yapın

DOI yoksa başlığı tırnak içinde Google Scholar'da, Crossref'te ve alanınızın veri tabanlarında arayın. Türkçe kaynaklar için DergiPark ve TR Dizin, tezler için YÖK Ulusal Tez Merkezi'ni kullanın. Bu veri tabanlarında nasıl arama yapılacağını [DergiPark, TR Dizin ve YÖK Tez rehberimizde](/blog/dergipark-tr-dizin-yok-tez-kaynak-arama) anlattık.

### 3. Derginin arşivine bakın

Kaynakta belirtilen derginin web sitesine girin, ilgili yılın ilgili sayısını açın ve makalenin orada olup olmadığını kontrol edin. Bu, en kesin doğrulama yöntemidir.

### 4. Yazarın yayın listesini inceleyin

Yazarın kurum sayfasına, ORCID profiline veya Google Scholar profiline bakın. Makale yazarın yayın listesinde yoksa büyük olasılıkla uydurmadır.

### 5. İçeriği kontrol edin

Kaynak gerçek olsa bile, yapay zekâ ona **söylemediği bir bulguyu** atfedebilir. Atıf yaptığınız cümleyi kaynağın özetinde veya tam metninde doğrulayın. Özellikle sayı içeren iddialarda (ör. "katılımcıların %68'i…") bu kontrol kritik önem taşır.

## Kaynak gerçek ama künye yanlışsa

Bazen kaynak gerçektir, ama yapay zekâ yılı, yazar sırasını veya sayfa numaralarını yanlış verir. Bu durumda kaynağı silmenize gerek yoktur; künyeyi dergideki resmî kayıttan veya Crossref'teki bilgiden düzeltin. Doğru künyeyi elde ettikten sonra atıf stilinize göre biçimlendirmek için [ücretsiz kaynakça oluşturucumuzu](/araclar/kaynakca-olusturucu) kullanabilirsiniz.

## Yapay zekâyı kaynak bulmak için doğru kullanmak

Yapay zekâ, kaynak bulmak için değil; **bulduğunuz kaynaklarla çalışmak** için kullanıldığında çok daha güvenilirdir. Daha güvenli bir çalışma düzeni şöyledir:

1. Kaynakları gerçek akademik veri tabanlarında arayın (Google Scholar, DergiPark, OpenAlex, PubMed, ERIC…).
2. Bulduğunuz kaynakların özetlerini veya tam metinlerini okuyun.
3. Yapay zekâdan bu kaynakları özetlemesini, karşılaştırmasını veya literatür matrisi oluşturmasını isteyin.
4. Yazarken yalnızca gerçekten okuduğunuz ve doğruladığınız kaynaklara atıf yapın.

Bu yaklaşımın etik boyutunu [yapay zekâ ile tez yazmak etik mi](/blog/yapay-zeka-ile-tez-yazmak-etik-mi) yazımızda ayrıntılı olarak ele aldık.

## Danışmanlar ve jüri üyeleri için not

Bir öğrencinin kaynakçasında birkaç uydurma kaynak bulunması, metnin yapay zekâ ile denetimsiz üretildiğinin güçlü bir işaretidir. Kaynakçadan rastgele seçilen beş-on kaynağın DOI ve başlık kontrolü, birkaç dakikada fikir verir. Kaynakçanın tamamını kontrol etmek için toplu doğrulama araçları kullanılabilir.

## Özetle

Yapay zekânın önerdiği bir kaynağı, doğrulamadan asla tezinize eklemeyin. DOI'nin doğru yayına gittiğini, başlığın veri tabanlarında bulunduğunu, derginin arşivinde yer aldığını ve atıf yaptığınız bilginin kaynakta gerçekten bulunduğunu kontrol edin. Uzun bir kaynakçayı tek tek kontrol etmek yerine [uydurma kaynak kontrol aracımıza](/araclar/uydurma-kaynak-kontrolu) yapıştırabilirsiniz; her kaynak kayıt otoritelerinde aranır ve şüpheli olanlar işaretlenir. Academiana'nın yazım asistanı ise yalnızca projenize eklenmiş, doğrulanmış kaynaklara atıf yapar; kaynak uydurmaz.`,
  },
];
