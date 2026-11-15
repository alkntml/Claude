import type { BlogPost } from "./types";

export const POSTS_3: BlogPost[] = [
  {
    slug: "hakem-yorumlarina-cevap-nasil-verilir",
    title: "Hakem Yorumlarına Nasıl Cevap Verilir? Örnek Cevap Mektubu Yapısı",
    description: "Dergiden düzeltme kararı geldiğinde hakem yorumlarına madde madde, nazik ve ikna edici cevap verme rehberi. Katılmadığınız yorumlara nasıl yanıt verilir?",
    category: "Makale ve yayın",
    keywords: ["hakem yorumlarına cevap", "response to reviewers", "revizyon mektubu", "makale düzeltme"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Hakem yorumlarını yapıştırın; çalışmanızı okuyan asistan madde madde cevap mektubu ve yapılacak değişiklik listesi hazırlasın.", href: "/kayit", label: "Cevap mektubu hazırla" },
    body: `"Büyük düzeltme" kararı ilk okumada moral bozucu gelebilir; ama aslında derginin makalenizle ilgilendiğini gösterir. Bu aşamada başarının anahtarı, hakemlerin her yorumunu ciddiye aldığınızı gösteren düzenli bir cevap mektubudur.

## Cevap mektubunun yapısı

1. **Kısa bir teşekkür paragrafı:** Editöre ve hakemlere zaman ayırdıkları için teşekkür edin.
2. **Her hakem için ayrı bölüm:** "Hakem 1", "Hakem 2"…
3. **Her yorum için üç parça:**
   - **Yorum:** Hakemin yorumunu (kısaltarak) alıntılayın.
   - **Yanıt:** Ne düşündüğünüzü ve ne yaptığınızı açıklayın.
   - **Değişiklik:** Metinde neyi, nerede değiştirdiğinizi belirtin (sayfa ve satır numarasıyla).

## Altın kurallar

- **Her yoruma cevap verin.** Atlanan bir yorum, hakemde "dikkate alınmadım" izlenimi bırakır.
- **Nazik ve profesyonel olun.** Yorum haksız görünse bile savunmacı veya alaycı bir dil kullanmayın.
- **Somut olun.** "Düzeltildi" yerine "Yöntem bölümüne örneklem büyüklüğünün gerekçesini içeren bir paragraf eklenmiştir (s. 8, satır 12–20)." yazın.
- **Değişiklikleri metinde görünür kılın.** Dergi istiyorsa değişiklikleri renkli veya izlenen değişikliklerle işaretleyin.

## Katılmadığınız bir yorum varsa

Her öneriyi kabul etmek zorunda değilsiniz. Ancak katılmadığınızda **bilimsel bir gerekçe** sunun:

"Hakemin önerisini dikkatle değerlendirdik. Ancak … nedeniyle bu analizin çalışmamızın amacı açısından uygun olmadığını düşünüyoruz. Bununla birlikte, bu konuyu sınırlılıklar bölümünde tartıştık (s. 15)."

Bu yaklaşım hem saygılıdır hem de editörün karar vermesini kolaylaştırır.

## Sık karşılaşılan yorumlar ve yaklaşımlar

- **"Örneklem küçük":** Güç analizi veya gerekçe ekleyin; değiştirilemiyorsa sınırlılık olarak tartışın.
- **"Literatür güncel değil":** Son yıllardaki ilgili çalışmaları ekleyin.
- **"Dil düzeltmesi gerekiyor":** Metni profesyonel bir redaksiyondan geçirin ve bunu belirtin.
- **"Bulgular aşırı yorumlanmış":** İlişkisel bulgularda nedensellik ima eden ifadeleri yumuşatın.

## Göndermeden önce kontrol listesi

- Bütün yorumlar cevaplandı mı?
- Mektupta "yapıldı" dediğiniz her değişiklik gerçekten metinde var mı?
- Sayfa ve satır numaraları son sürümle uyuşuyor mu?
- Kelime sınırı hâlâ aşılmıyor mu?


## Cevap mektubu için örnek kalıp

Her hakem yorumunu üç parçada ele alın: yorumun kendisi, cevabınız ve metinde yaptığınız değişiklik.

- **Hakem 1, Yorum 3:** “Örneklem büyüklüğünün nasıl belirlendiği açık değil.”
- **Cevap:** “Değerli yorumunuz için teşekkür ederiz. Örneklem büyüklüğü güç analiziyle belirlenmiştir; hesaplamaya ilişkin bilgiyi yöntem bölümüne ekledik.”
- **Değişiklik:** “Yöntem, Evren ve Örneklem başlığı, 2. paragraf (s. 7, satır 12–18).”

Değişiklikleri revize metinde renkli veya değişiklik izleme açık olarak gösterin; dergi hangisini istiyorsa onu kullanın.

## Yorum türlerine göre yaklaşım

| Yorum türü | Ne yapmalı? |
| --- | --- |
| Açık bir hata (yanlış istatistik, eksik atıf) | Teşekkür edip düzeltin, değişikliğin yerini gösterin |
| Ek analiz isteği | Mümkünse yapın; yapılamıyorsa nedenini gerekçeyle açıklayın |
| Kapsam dışı istek | Nazikçe kapsam dışında kaldığını açıklayın, sınırlılıklara ekleyin |
| Belirsiz yorum | Yorumu nasıl anladığınızı yazın ve buna göre yaptığınız değişikliği gösterin |
| İki hakemin çelişen istekleri | Editöre hangi yolu neden seçtiğinizi açıklayın |

## Editöre yazılacak ön mektup

Cevap mektubunun başına editöre kısa bir paragraf ekleyin: revizyon fırsatı için teşekkür, yapılan temel değişikliklerin iki üç maddelik özeti ve tüm yorumlara aşağıda madde madde cevap verildiği bilgisi. Bu paragraf editörün revizyonu hızla değerlendirmesini sağlar.

## Revizyon süresi ve iletişim

Derginin verdiği revizyon süresine uyun. Ek analizler veya veri toplama gerekiyorsa ve süre yetmeyecekse, süre dolmadan editöre yazarak ek süre isteyin. Sessiz kalmak, makalenin yeni gönderim gibi değerlendirilmesine yol açabilir.

## Reddedildiyseniz

Ret kararından sonra hakem yorumlarını dikkatle okuyun; çoğu zaman makaleyi güçlendirecek değerli öneriler içerir. Yorumları uygulayarak makaleyi kapsamına daha uygun bir dergiye gönderebilirsiniz. Dergi seçimi ve makale yapısı için [akademik makale rehberimize](/blog/akademik-makale-nasil-yazilir) bakın.

## Academiana ile cevap mektubu

Academiana’da Araçlar menüsündeki "Hakem yorumlarına cevap" ile editör ve hakem yorumlarını yapıştırırsınız. Asistan çalışmanızın mevcut hâlini okuyarak her yoruma Yorum–Yanıt–Değişiklik düzeninde bir taslak hazırlar ve metinde yapmanız gereken değişiklikleri öncelik sırasıyla listeler. Henüz yapmadığınız değişiklikleri "yapıldı" diye yazmaz; [YAPILACAK] olarak işaretler. Sayfa numaralarını sizin doldurmanız için boş bırakır.`,
    sources: [
      { text: "Noble, W. S. (2017). Ten simple rules for writing a response to reviewers. PLOS Computational Biology, 13(10), e1005730." },
      { text: "Committee on Publication Ethics (COPE). Ethical guidelines for peer reviewers.", url: "https://publicationethics.org/" },
    ],
  },
  {
    slug: "tez-savunmasina-nasil-hazirlanilir",
    title: "Tez Savunmasına Nasıl Hazırlanılır? Jürinin En Sık Sorduğu Sorular",
    description: "Yüksek lisans ve doktora tez savunması için sunum hazırlığı, prova ve jüri sorularına cevap verme teknikleri. Sık sorulan 12 savunma sorusu.",
    category: "Başvuru ve savunma",
    keywords: ["tez savunması", "tez savunma soruları", "tez savunma sunumu", "jüri soruları"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Yapay zekâ jüriyle prova yapın: tezinize özel sorular, sesli veya yazılı cevap ve puanlı geri bildirim.", href: "/kayit", label: "Savunma provası yap" },
    body: `Tez savunması, yıllarca süren emeğin son adımıdır ve çoğu öğrenciyi en çok heyecanlandıran aşamadır. İyi haber şu: Jüri sizi sınamak için değil, çalışmanızı gerçekten **sizin** yaptığınızı ve anladığınızı görmek için oradadır. Doğru hazırlıkla savunma, tezinizi anlatma fırsatına dönüşür.

## Sunumu hazırlamak

- **Süreyi öğrenin.** Sunum için genellikle 15–30 dakika verilir; enstitünüze sorun.
- **Slayt sayısı:** Kabaca dakikada bir slayt iyi bir başlangıçtır.
- **Akış:** Giriş ve problem → amaç ve sorular → kuramsal çerçeve (kısa) → yöntem → bulgular → tartışma → sonuç ve öneriler → sınırlılıklar
- **Az metin, çok görsel:** Slaytlara paragraf yazmayın; temel noktaları maddeler, tablolar ve grafiklerle verin.
- **Bulgulara zaman ayırın:** Jürinin en çok ilgilendiği kısım bulgular ve tartışmadır.

## Prova yapın

- Sunumu yüksek sesle, süre tutarak en az birkaç kez prova edin.
- Bir arkadaşınızdan veya danışmanınızdan soru sormasını isteyin.
- Zor sorulara verdiğiniz cevapları not edin ve geliştirin.

## Jürinin en sık sorduğu 12 soru

1. Bu konuyu neden seçtiniz?
2. Çalışmanızın literatüre özgün katkısı nedir?
3. Neden bu araştırma desenini seçtiniz?
4. Örneklem büyüklüğünüzü nasıl belirlediniz? Sonuçlar genellenebilir mi?
5. Ölçme araçlarınızın geçerlik ve güvenirliği nedir?
6. Bu istatistiksel analizi neden kullandınız? Varsayımları kontrol ettiniz mi?
7. En önemli bulgunuz nedir?
8. Beklenmeyen bir sonuç çıktı mı? Bunu nasıl açıklıyorsunuz?
9. Bulgularınız hangi çalışmalarla çelişiyor ve neden?
10. Çalışmanızın sınırlılıkları nelerdir?
11. Bu çalışmayı yeniden yapsaydınız neyi farklı yapardınız?
12. Gelecek araştırmalar için önerileriniz nelerdir?

## Soruya cevap verirken

- **Önce dinleyin.** Sorunun tamamını dinleyin; anlamadıysanız tekrar edilmesini isteyin.
- **Kısa ve net olun.** Önce doğrudan cevabı verin, sonra gerekçesini açıklayın.
- **Bilmediğinizi kabul edin.** Uydurmak yerine "Bu konuyu ayrıntılı incelemedim; ancak … açısından değerlendirebilirim" demek çok daha iyi bir izlenim bırakır.
- **Eleştiriyi kişisel algılamayın.** Jürinin önerilerini not edin; düzeltme istenirse bu olağan bir süreçtir.

## Savunma günü

- Sunum dosyanızı birden fazla yerde (USB, e-posta, bulut) yanınızda bulundurun.
- Tezin basılı bir kopyasını yanınıza alın; sayfa numarasıyla soru gelebilir.
- Erken gidin ve teknik düzeni kontrol edin.


## Sunum yapısı ve süre dağılımı

Savunma sunumu genellikle 15–30 dakika sürer; süreyi enstitünüze veya jüri başkanına sorun. 20 dakikalık bir sunum için örnek dağılım:

| Bölüm | Süre | İçerik |
| --- | --- | --- |
| Giriş ve problem | 3 dk | Konunun önemi, boşluk, amaç |
| Araştırma soruları | 1 dk | Soru veya hipotezler |
| Yöntem | 4 dk | Desen, örneklem, araçlar, analiz |
| Bulgular | 6 dk | Her soru için temel sonuç, tablo ve grafiklerle |
| Tartışma ve sonuç | 4 dk | Literatürle karşılaştırma, katkı, öneriler |
| Sınırlılıklar | 2 dk | Dürüst ve kısa |

Bulgular sunumun en önemli kısmıdır; yöntemi uzun anlatıp bulgulara zaman bırakmamak sık yapılan bir hatadır.

## Slayt tasarımı

- Her slaytta tek bir fikir verin; metin yerine anahtar kelimeler ve görseller kullanın.
- Tablolarda yalnızca önemli satırları gösterin; tam tablo tezde zaten var.
- Grafikleri büyük ve okunur tutun, eksen adlarını yazın.
- Slayt numaralarını gösterin; jüri soru sorarken slayta dönebilsin.
- Yedek slaytlar hazırlayın: ek analizler, ölçek maddeleri, ayrıntılı tablolar. Soru gelirse bunları gösterebilirsiniz.

## Soruları gruplara göre hazırlanın

Jüri soruları genellikle şu gruplarda toplanır:

- **Kuram ve literatür:** Neden bu kuram? Benzer çalışmalardan farkınız ne?
- **Yöntem:** Örneklem neden bu büyüklükte? Ölçek neden seçildi? Başka bir analiz neden yapılmadı?
- **Bulgular:** Beklenmeyen sonuç nasıl açıklanır? Etki büyüklüğü ne anlama geliyor?
- **Katkı ve sınırlılık:** Bu çalışma alana ne kattı? Tekrar yapsaydınız neyi değiştirirdiniz?

Her grup için olası soruları yazıp cevaplarını kısa maddelerle hazırlayın. Cevaplarınızın tezde yazılanlarla tutarlı olduğundan emin olun.

## Bilmediğiniz bir soru gelirse

Bilmediğinizi açıkça söylemek, yanlış bir cevap uydurmaktan çok daha iyidir. “Bu konuyu çalışmamda ele almadım; ancak şu şekilde düşünüyorum…” gibi bir cevap hem dürüst hem de düşünme becerinizi gösterir. Soruyu iyi anlamadıysanız tekrar edilmesini isteyin.

## Savunmadan sonra

Jüri düzeltme isteyebilir. Düzeltme isteklerini yazılı olarak alın, her birini nasıl uyguladığınızı bir listede gösterin ve verilen süre içinde teslim edin. Düzeltmeler bittikten sonra tezin son hâlini enstitünün istediği biçimde (genellikle PDF) ve YÖK Ulusal Tez Merkezi’ne yükleme kurallarına uygun olarak hazırlayın.

## Dil ve beden dili

Jüriye bakarak konuşun, slaytlardan okumayın. Sorulara savunmacı değil, açık bir tavırla cevap verin; eleştiri, çalışmanızı geliştirme fırsatıdır. Prova yaparken kendinizi kaydetmek, hızınızı ve dolgu kelimelerini fark etmenizi sağlar.

## Academiana ile savunma hazırlığı

Academiana iki araçla yardımcı olur: **Savunma sunumu**, tezinizin metninden PowerPoint taslağı ve konuşma notları üretir; metinde olmayan bilgi eklemez. **Savunma provası** ise tezinizi okuyup jürinin sorabileceği soruları hazırlar. Cevabınızı yazarak veya konuşarak verirsiniz; sistem cevabınızın güçlü ve eksik yönlerini, daha güçlü bir cevabın iskeletini ve jürinin sorabileceği takip sorusunu gösterir.`,
  },
  {
    slug: "tubitak-2209-a-basvurusu-nasil-hazirlanir",
    title: "TÜBİTAK 2209-A Başvurusu Nasıl Hazırlanır? Proje Önerisi Rehberi",
    description: "Üniversite öğrencileri için TÜBİTAK 2209-A araştırma projesi önerisi: özgün değer, yöntem, proje yönetimi, yaygın etki ve bütçe bölümlerini yazma ipuçları.",
    category: "Başvuru ve savunma",
    keywords: ["TÜBİTAK 2209-A", "2209-A başvurusu", "2209 proje önerisi örneği", "TÜBİTAK proje yazma", "BAP projesi"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "TÜBİTAK / BAP proje önerisi türüyle başvuru bölümleri hazır gelsin; özgün değerden bütçeye adım adım yazın.", href: "/kayit", label: "Proje önerimi hazırla" },
    body: `TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri Destekleme Programı, lisans öğrencilerinin bir danışman eşliğinde kendi araştırma projelerini yürütmelerini destekler. İyi hazırlanmış bir öneri, hem destek alma şansınızı artırır hem de size ilk ciddi araştırma deneyiminizi kazandırır.

Başvuru koşulları, form şablonu, destek üst sınırı ve takvim her çağrı döneminde güncellenebilir. Başvurmadan önce TÜBİTAK’ın güncel çağrı duyurusunu ve başvuru formunu mutlaka inceleyin.

## Önerinin temel bölümleri

TÜBİTAK proje önerilerinde genellikle şu bölümler yer alır:

### Özet ve anahtar kelimeler

Projenin amacını, yöntemini ve beklenen çıktılarını kısaca anlatın. Özeti en son yazın.

### Özgün değer

Değerlendirmede en belirleyici bölümlerden biridir.

- Konunun önemini ve güncelliğini literatürle gösterin.
- Mevcut çalışmaların eksik bıraktığı noktayı açıkça yazın.
- Projenizin bu boşluğa nasıl katkı sağlayacağını belirtin.
- Araştırma sorusunu veya hipotezi ve **ölçülebilir** hedefleri yazın.

### Yöntem

- Hedeflere ulaşmak için ne yapacağınızı adım adım anlatın.
- Yöntemi literatürle gerekçelendirin.
- Her yöntemin hangi hedefe hizmet ettiğini eşleştirin.

### Proje yönetimi

- **İş-zaman çizelgesi:** İş paketleri (İP1, İP2…), sorumlular, süreler ve başarı ölçütleri bir tablo hâlinde
- **Risk yönetimi:** Her kritik iş paketi için olası risk ve B planı
- **Araştırma olanakları:** Kullanılacak laboratuvar, cihaz ve yazılımlar

### Yaygın etki

Projeden beklenen bilimsel (bildiri, makale), ekonomik ve toplumsal çıktıları gerçekçi biçimde yazın.

### Bütçe

Talep ettiğiniz her kalemin yöntemdeki hangi iş için gerekli olduğunu gerekçelendirin. Tutarları güncel fiyat tekliflerine dayandırın ve programın desteklemediği kalemleri kontrol edin.

## Değerlendiricilerin dikkat ettikleri

- Hedeflerin net ve ölçülebilir olması
- Yöntemin hedeflerle tutarlılığı
- Takvimin gerçekçiliği
- Bütçenin gerekçeli ve orantılı olması
- Etik kurul onayı gerekiyorsa sürecin planlanmış olması

## Sık yapılan hatalar

- "İlk kez yapılacaktır" gibi iddiaları literatürle desteklememek
- Genel ve ölçülemeyen hedefler yazmak
- Risk tablosunu boş geçmek
- Gerekçesiz veya şişirilmiş bütçe


## Danışmanla iş birliği

2209-A başvurularında öğrenci projeyi bir akademik danışmanla birlikte hazırlar. Danışmanla erken görüşmek; konunun uygulanabilirliği, etik kurul gerekip gerekmediği ve bütçe kalemlerinin gerçekçiliği konusunda zaman kazandırır. Görüşmeye bir sayfalık bir proje fikriyle gidin: problem, amaç, yöntem taslağı ve beklenen çıktı.

## Araştırma sorusundan iş paketine

Proje yönetimi bölümünde işi küçük, ölçülebilir iş paketlerine bölün. Her iş paketi için ne yapılacağını, kimin sorumlu olduğunu, ne kadar süreceğini ve başarının nasıl ölçüleceğini yazın:

| İş paketi | Sorumlu | Süre | Başarı ölçütü |
| --- | --- | --- | --- |
| Literatür taraması | Öğrenci | 1. ay | Literatür matrisi tamamlandı |
| Etik kurul başvurusu | Öğrenci ve danışman | 1.–2. ay | Onay alındı |
| Veri toplama | Öğrenci | 3.–5. ay | Planlanan katılımcı sayısına ulaşıldı |
| Analiz ve rapor | Öğrenci | 6.–8. ay | Sonuç raporu hazır |

Bu tablo bir örnektir; süreleri ve iş paketlerini projenize ve güncel çağrının sınırlarına göre belirleyin.

## Risk yönetimi

Değerlendiriciler projenin aksayabileceği noktaları düşünüp düşünmediğinize bakar. Her önemli risk için bir B planı yazın: katılımcıya ulaşılamazsa ne yapılacak, etik kurul onayı gecikirse takvim nasıl değişecek, bir cihaz bozulursa ne olacak?

## Yöntemin uygulanabilirliği

Lisans düzeyindeki projelerde değerlendiricilerin en çok dikkat ettiği konu, yöntemin proje süresi ve bütçesiyle uyumudur. Çok sayıda değişken, ulaşılması zor örneklemler veya pahalı cihazlar içeren tasarımlar yerine sınırları net, tamamlanabilir bir tasarım tercih edin. Örneklem büyüklüğünü gerekçelendirin: [örneklem büyüklüğü rehberi](/blog/orneklem-buyuklugu-nasil-hesaplanir).

## Güncel çağrı belgesini esas alın

Başvuru takvimi, bütçe üst sınırları, başvuru koşulları ve form şablonları çağrıdan çağrıya değişebilir. Bu rehber genel yazım ilkelerini anlatır; tarih, tutar ve şartlar için her zaman TÜBİTAK’ın güncel çağrı duyurusunu ve başvuru kılavuzunu okuyun.

## Sonuç raporu ve yaygınlaştırma

Proje bittiğinde sonuç raporu hazırlanır. Bulguları bir öğrenci kongresinde sunmak veya bir makaleye dönüştürmek, projenin yaygın etkisini gösterir. Makale yazımı için [akademik makale rehberimize](/blog/akademik-makale-nasil-yazilir) bakın.

## Academiana ile proje önerisi

Academiana’da "TÜBİTAK / BAP proje önerisi" çalışma türünü seçip programınızı (2209-A, 2209-B, 1001, 1002-A, 3005, 3501, 2204-A, 2242, BAP veya burs) belirlediğinizde özet, özgün değer, yöntem, proje yönetimi, yaygın etki ve bütçe bölümleri hazır gelir. Asistan literatür boşluğunu gerçek kaynaklarla göstermenize yardımcı olur, iş-zaman çizelgesi ve risk tablosunu tablo hâlinde taslaklar. Bütçe tutarı ve program kuralı uydurmaz; bunları sizin girmeniz ve çağrı duyurusundan kontrol etmeniz istenir.

Diğer TÜBİTAK programları için rehberlerimiz: [1002-A Hızlı Destek](/blog/tubitak-1002-a-hizli-destek-basvurusu), [3005 Sosyal ve Beşeri Bilimler](/blog/tubitak-3005-sosyal-bilimler-proje-onerisi), [2242 Proje Yarışması](/blog/tubitak-2242-proje-yarismasi-rehberi) ve [2204-A Lise Araştırma Projeleri](/blog/tubitak-2204-a-lise-proje-nasil-hazirlanir).`,
  },
  {
    slug: "dergipark-tr-dizin-yok-tez-kaynak-arama",
    title: "DergiPark, TR Dizin ve YÖK Tez Merkezi’nde Kaynak Nasıl Aranır?",
    seoTitle: "DergiPark, TR Dizin ve YÖK Tez’de Kaynak Arama Rehberi",
    description: "Türkçe akademik kaynaklara ulaşma rehberi: DergiPark, TR Dizin ve YÖK Ulusal Tez Merkezi’nde etkili arama, erişim kısıtları ve doğru atıf.",
    category: "Kaynak ve atıf",
    keywords: ["DergiPark makale arama", "TR Dizin nedir", "YÖK Tez Merkezi arama", "Türkçe kaynak bulma"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Türkçe ve Türkiye adresli yayınları uluslararası veri tabanlarıyla birlikte tek aramada tarayın.", href: "/kayit", label: "Türk kaynaklarını ara" },
    body: `Türkiye’de yapılan bir araştırmada Türkçe literatürü göstermek hem bağlamı güçlendirir hem de jürinin sık sorduğu "Türkiye’de bu konuda ne yapılmış?" sorusunun cevabıdır. Bunun için üç temel kaynak var.

## DergiPark

TÜBİTAK ULAKBİM tarafından sağlanan DergiPark, Türkiye’deki akademik dergilerin büyük bölümüne ev sahipliği yapar. Makalelerin çoğu açık erişimlidir.

**Arama ipuçları:**

- Hem Türkçe hem İngilizce anahtar kelimelerle arayın; birçok makalenin İngilizce özeti vardır.
- Tırnak işaretiyle tam ifade araması yapın: "benlik saygısı"
- Sonuçları yıla ve dergiye göre filtreleyin.
- DergiPark’ta yer almak bir derginin belirli bir dizinde tarandığı anlamına gelmez; dizin bilgisini dergi sayfasından kontrol edin.

## TR Dizin

TR Dizin, yine TÜBİTAK ULAKBİM tarafından yürütülen ve belirli kalite ölçütlerini karşılayan Türk dergilerini tarayan ulusal bir dizindir. Akademik değerlendirmelerde TR Dizin’de taranan dergiler ayrıca dikkate alınabilir.

**Ne işe yarar?**

- Daha nitelikli Türkçe kaynaklara odaklanmak
- Makale göndereceğiniz bir Türk dergisinin dizin durumunu kontrol etmek

## YÖK Ulusal Tez Merkezi

Türkiye’de yapılmış yüksek lisans ve doktora tezlerinin aranabildiği resmî veri tabanıdır.

**Arama ipuçları:**

- Başlık, yazar, konu, üniversite ve yıl alanlarıyla gelişmiş arama yapın.
- Bazı tezlerin tam metnine erişim, yazarın izni doğrultusunda kısıtlı olabilir; bu durumda yalnızca künye ve özete ulaşabilirsiniz.
- Tezleri kaynak gösterirken tez türünü (yüksek lisans/doktora) ve üniversiteyi belirtin.

## Türkçe kaynakları kullanırken dikkat

- **Birincil kaynağa gidin.** Bir Türkçe derlemede geçen yabancı bir çalışmayı, okumadan doğrudan kaynak göstermeyin.
- **Yalnızca özetini okuduğunuz** bir çalışmanın ayrıntılı bulgularını aktarmayın.
- **Tezleri ölçülü kullanın.** Tezler değerli kaynaklardır; ancak aynı çalışma makale olarak yayımlandıysa genellikle makaleye atıf yapmak tercih edilir.
- **Künyeyi eksiksiz alın:** Dergi adı, cilt, sayı, sayfa ve DOI (varsa).


## Etkili arama ipuçları

- **Türkçe ve İngilizce birlikte arayın.** DergiPark’taki makalelerin çoğunda İngilizce başlık ve özet de bulunur; İngilizce terimlerle arama farklı sonuçlar getirebilir.
- **Eş anlamlıları deneyin.** “Akademik erteleme” ile “akademik ertelemecilik” gibi farklı kullanımlar vardır.
- **Tırnak kullanın.** Kelime öbeğini tırnak içinde aramak sonuçları daraltır.
- **Gelişmiş aramayı kullanın.** Yıl aralığı, dergi ve yayın türü filtreleri sonuç listesini yönetilebilir hâle getirir.
- **Atıf zincirini izleyin.** İyi bir kaynağın kaynakçası ve o kaynağa atıf yapan yeni çalışmalar, çoğu zaman en verimli arama yoludur.

## Tezlerden yararlanma

YÖK Ulusal Tez Merkezi’ndeki tezler hem literatür hem de yöntem açısından değerli bir kaynaktır:

- Benzer konudaki tezlerin **kullandığı ölçekleri** ve bu ölçeklerin Türkçe uyarlama kaynaklarını bulabilirsiniz.
- Tezlerin **öneriler bölümleri** yeni tez konuları için iyi bir başlangıçtır.
- Bazı tezlerin tam metnine erişim yazar tarafından kısıtlanmış olabilir; bu durumda yalnızca künye ve özet görüntülenir.

Tezlere atıf yaparken tez türünü (yüksek lisans/doktora), üniversiteyi ve tez numarasını yazmayı unutmayın. Kaynakça biçimi için [kaynakça rehberimize](/blog/kaynakca-nasil-hazirlanir) bakın.

## Dergi kalitesini değerlendirme

DergiPark bir yayın platformudur; burada yer alan her dergi aynı nitelikte değildir. Bir dergiyi değerlendirirken:

- TR Dizin veya uluslararası dizinlerde tarandığını dizinin kendi sitesinden doğrulayın.
- Yayın kurulunu ve hakem sürecini inceleyin.
- Düzenli yayımlanıp yayımlanmadığına bakın.

Şüpheli dergileri tanımak için [yağmacı dergiler rehberimize](/blog/yagmaci-dergiler-nasil-anlasilir) bakın.

## Uluslararası veri tabanlarıyla birlikte kullanın

Yalnızca Türkçe veri tabanlarıyla yapılan bir literatür taraması, uluslararası literatürü kaçırır. Türkçe kaynakları OpenAlex, Crossref, Semantic Scholar ve alanınıza özgü veri tabanlarıyla birlikte kullanın. Arama stratejisi kurmayı [literatür taraması rehberimizde](/blog/literatur-taramasi-nasil-yapilir) adım adım anlattık.

## Academiana ile Türk kaynakları

Academiana’nın kaynak aramasında Türkçe yayınlar ve Türkiye adresli yazarların yayınları (DergiPark dergilerinin büyük bölümü dahil) uluslararası veri tabanlarıyla birlikte otomatik taranır; DergiPark kaynakları etiketle gösterilir. "Yalnızca Türkiye kaynakları" seçeneğiyle aramayı daraltabilirsiniz. TR Dizin ve YÖK Tez Merkezi’nde aynı konuyla tek tıkla arama yapabilir, bulduğunuz tezi YÖK Tez numarasıyla birlikte kolayca ekleyebilirsiniz.`,
  },
  {
    slug: "akademik-yazim-dili-sik-yapilan-hatalar",
    title: "Akademik Yazım Dili: En Sık Yapılan 10 Hata ve Düzeltmeleri",
    description: "Tez ve makalede akademik dilin özellikleri: nesnellik, açıklık, tekrar, aşırı genelleme ve gündelik dil hataları. Örnekli düzeltmelerle.",
    category: "Tez yazımı",
    keywords: ["akademik yazım dili", "akademik dil özellikleri", "tez yazım hataları", "bilimsel yazım"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Seçtiğiniz metni akademik dile çevirin, tekrar eden ifadeleri tek tıkla azaltın.", href: "/kayit", label: "Metnimi düzelt" },
    body: `Akademik dil, süslü ve karmaşık cümleler kurmak değildir. Tam tersine; **açık, nesnel, kesin ve kanıta dayalı** bir dildir. Aşağıda tezlerde ve makalelerde en sık karşılaşılan hataları ve düzeltilmiş örneklerini derledik.

## 1. Gündelik dil

- **Hatalı:** Bence sosyal medya gençleri baya etkiliyor.
- **Doğru:** Sosyal medya kullanımının gençlerin benlik algısıyla ilişkili olduğu belirtilmektedir (Yazar, Yıl).

"Bence, sanırım, yani, aslında, baya" gibi ifadeler akademik metne uygun değildir.

## 2. Aşırı genelleme

- **Hatalı:** Herkes bilir ki teknoloji eğitimi olumlu etkiler.
- **Doğru:** Pek çok çalışma, teknoloji destekli öğretimin akademik başarıyla olumlu ilişkili olduğunu göstermektedir.

"Herkes, hiç kimse, her zaman, asla" gibi kesin genellemelerden kaçının.

## 3. Kanıtlanmamış kesinlik

- **Hatalı:** Bu çalışma, sosyal medyanın depresyona neden olduğunu kanıtlamıştır.
- **Doğru:** Bu çalışmada sosyal medya kullanım süresi ile depresif belirtiler arasında pozitif yönde bir ilişki bulunmuştur.

İlişkisel bir çalışma nedensellik kanıtlamaz; "kanıtlamıştır, şüphesiz, tartışmasız" ifadelerini dikkatli kullanın.

## 4. Kaynaksız iddia

Bilimsel bir bilgi veriyorsanız kaynağını gösterin. Kaynak bulamıyorsanız iddiayı yumuşatın veya çıkarın.

## 5. Tekrar eden kalıplar

Her paragrafı "Bu bağlamda…", "Sonuç olarak…" ile başlatmak ya da "önemli bir rol oynamaktadır" ifadesini art arda kullanmak metni monotonlaştırır. Bağlaçları çeşitlendirin ve her paragrafın yeni bir bilgi eklediğinden emin olun.

## 6. Çok uzun cümleler

Bir cümlede birden fazla ana fikir varsa bölün. Okuyucu cümlenin başını sonuna geldiğinde unutmamalıdır.

## 7. Anlatım bozuklukları

- **Özne–yüklem uyumsuzluğu:** "Öğrencilerin başarısı artmış ve derslere ilgi göstermişlerdir." → "Öğrencilerin başarısı artmış, öğrenciler derslere daha fazla ilgi göstermiştir."
- **Gereksiz sözcük:** "Geri iade etmek", "en optimum" gibi.

## 8. Tutarsız terim kullanımı

Bir kavramı bir yerde "öz yeterlik", başka yerde "kendine güven" diye anmayın. Tanımladığınız terimi bütün metinde aynı biçimde kullanın.

## 9. Zaman uyumsuzluğu

Yaygın bir uygulama: Literatür ve yöntem için geçmiş zaman veya edilgen yapı ("…bulunmuştur", "…toplanmıştır"), genel kabul gören bilgiler için geniş zaman kullanılır. Hangi uygulamayı seçerseniz seçin tutarlı olun.

## 10. Yazım ve noktalama

Türkçe metinlerde TDK yazım kurallarına uyun; özellikle "de/da" ve "ki" bağlaçlarının yazımı, kesme işareti ve büyük harf kullanımı sık hata yapılan konulardır.


## Önce ve sonra: düzeltme örnekleri

| Sorunlu ifade | Neden sorunlu? | Daha akademik ifade |
| --- | --- | --- |
| Herkes bilir ki sosyal medya zararlıdır. | Aşırı genelleme, kaynaksız | Bazı çalışmalar problemli sosyal medya kullanımının akademik ertelemeyle ilişkili olduğunu göstermektedir. |
| Bu çalışma konuyu kesin olarak kanıtlamıştır. | Kanıtlanmamış kesinlik | Bu çalışmanın bulguları hipotezi desteklemektedir. |
| Çok çok önemli bir sonuç bulduk. | Gündelik ve abartılı dil | Bulgular, … açısından önemli bir sonuca işaret etmektedir. |
| Öğrenciler ertelemeyi seviyor gibi gözüküyor. | Belirsiz ve gündelik | Öğrencilerin erteleme düzeyleri orta düzeydedir. |
| Yapılan analizler sonucunda elde edilen bulgular incelendiğinde… | Gereksiz uzun | Analiz sonuçlarına göre… |

## Akademik yazımda ölçülü dil

Bilimsel bulgular olasılık ve kanıt düzeyiyle ifade edilir. “Kanıtlamıştır”, “kesinlikle”, “her zaman” gibi ifadeler yerine “göstermektedir”, “işaret etmektedir”, “desteklemektedir”, “ilişkili bulunmuştur” gibi ifadeler kullanın. Bu ölçülü dil zayıflık değil, bilimsel dürüstlüktür.

## Edilgen ve etken çatı

Türkçe akademik metinlerde edilgen çatı yaygındır (“veriler toplanmıştır”). Ancak her cümleyi edilgen kurmak metni ağırlaştırır ve kimin ne yaptığını belirsizleştirir. Yöntemde edilgen çatı uygundur; tartışmada görüş bildirirken “bu bulgu … şeklinde yorumlanabilir” gibi yapılar kullanılabilir. Önemli olan tutarlılıktır.

## Paragraf yapısı

İyi bir akademik paragraf tek bir ana fikri işler:

1. **Konu cümlesi:** Paragrafın ana fikri
2. **Destek cümleleri:** Kanıt, örnek ve kaynaklar
3. **Bağlayıcı cümle:** Bir sonraki paragrafa geçiş veya ara sonuç

Bir paragrafta birden fazla ana fikir varsa bölün. Tek cümlelik paragraflardan da kaçının.

## Bağlaçlar ve geçişler

Paragraflar arasında mantıksal bağı gösteren ifadeler okumayı kolaylaştırır: karşıtlık için “bununla birlikte”, “öte yandan”; sonuç için “bu nedenle”, “dolayısıyla”; ekleme için “ayrıca”, “buna ek olarak”. Aynı bağlacı art arda kullanmaktan kaçının.

## Göndermeden önce son okuma

- Metni yüksek sesle veya bir gün ara verdikten sonra okuyun.
- Terimleri tutarlı kullanıp kullanmadığınızı kontrol edin.
- Kısaltmaların ilk kullanımda açıldığından emin olun.
- Her iddianın bir kaynağı veya verisi olup olmadığını kontrol edin. İntihal ve atıf için [intihal rehberimize](/blog/intihal-nasil-onlenir) bakın.
- Türk Dil Kurumu yazım kurallarına göre bitişik ve ayrı yazımları kontrol edin.

## Academiana ile dil düzeltme

Academiana’da metninizden bir bölümü seçip "Akademik dile çevir", "Kısalt", "Genişlet" veya "Yeniden yapılandır" eylemlerini kullanabilirsiniz; atıflarınız korunur. "Tekrarları azalt" eylemi tekrar eden kalıpları ve birbirine çok benzeyen cümleleri giderir. Kalite kontrolü ise gündelik ifadeleri, aşırı kesin iddiaları ve bölümler arası tekrarları otomatik bulur.`,
    sources: [
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
      { text: "Türk Dil Kurumu. Yazım kılavuzu.", url: "https://www.tdk.gov.tr/" },
    ],
  },
  {
    slug: "etik-kurul-basvurusu-nasil-yapilir",
    title: "Etik Kurul Başvurusu Nasıl Yapılır? Tez Öğrencileri İçin Rehber",
    description: "Anket, görüşme veya deney içeren tezlerde etik kurul onayı ne zaman gerekir? Başvuru dosyası, bilgilendirilmiş onam formu ve sık yapılan hatalar.",
    category: "Araştırma ve yöntem",
    keywords: ["etik kurul başvurusu", "etik kurul onayı tez", "bilgilendirilmiş onam formu", "etik kurul izni anket"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Projenizin yöntem bilgilerinden etik kurul başvuru metni ve bilgilendirilmiş onam formu taslağı oluşturun.", href: "/kayit", label: "Etik belgelerimi hazırla" },
    body: `İnsan katılımcılarla yapılan araştırmalarda (anket, görüşme, gözlem, deney) katılımcıların haklarını korumak için etik kurul değerlendirmesi gerekir. Pek çok üniversitede bu onay **veri toplamaya başlamadan önce** alınmak zorundadır; sonradan alınan onay genellikle geçerli sayılmaz.

## Etik kurul onayı ne zaman gerekir?

Genel olarak şu durumlarda gereklidir:

- Anket veya ölçek uygulaması
- Görüşme ve odak grup çalışmaları
- Gözlem, deney veya müdahale içeren araştırmalar
- Kişisel veya hassas verilerin kullanıldığı çalışmalar

Yalnızca yayımlanmış literatürü veya kamuya açık, kişisel veri içermeyen belgeleri inceleyen çalışmalarda genellikle gerekmez. Kendi kurumunuzun kurallarını mutlaka kontrol edin; bazı durumlarda kurumdan "etik kurul izni gerekmez" yazısı istenebilir.

## Hangi kurula başvurulur?

Üniversitelerde genellikle **sosyal ve beşerî bilimler**, **fen ve mühendislik** ile **klinik/girişimsel olmayan klinik araştırmalar** için ayrı etik kurullar bulunur. Araştırmanızın türüne uygun kurulu seçin. Okullarda veya kurumlarda veri toplayacaksanız ayrıca ilgili kurumdan **uygulama izni** gerekebilir.

## Başvuru dosyasında genellikle istenenler

- Başvuru formu
- Araştırmanın amacı, yöntemi ve önemi (kısa özet)
- Katılımcılar ve seçim ölçütleri
- Veri toplama araçları (anket, görüşme formu vb.)
- Bilgilendirilmiş onam formu
- Ölçek kullanım izinleri
- Danışman onayı
- Gerekiyorsa veli onam formu (18 yaş altı katılımcılar için)

## Bilgilendirilmiş onam formu

Katılımcının anlayacağı sade bir dille şunları içermelidir:

- Araştırmanın amacı ve kim tarafından yürütüldüğü
- Katılımın ne kadar süreceği ve ne yapılacağı
- Katılımın gönüllü olduğu ve istenildiği an bırakılabileceği
- Verilerin gizliliği, nasıl saklanacağı ve ne zaman imha edileceği
- Olası riskler ve faydalar
- Araştırmacının iletişim bilgileri

## Sık yapılan hatalar

- Veri toplamaya onaydan önce başlamak
- Onam formunda gereksiz teknik dil kullanmak
- Toplanacak verileri gereğinden fazla tutmak (ör. ad-soyad gerekmediği hâlde istemek)
- Ölçek izinlerini başvuruya eklememek
- Takvimde kurul toplantı sürelerini hesaba katmamak


## Başvuru zamanlaması

Etik kurul onayı veri toplamaya başlamadan alınmalıdır; onaysız toplanan veriler tezde kullanılamayabilir. Kurulların toplanma sıklığı ve değerlendirme süresi farklıdır; kurulunuzun takvimini öğrenin ve olası düzeltme istekleri için tampon süre bırakın. Tez takvimi planlarken etik kurulu kritik yol olarak düşünün: [tez yazım takvimi rehberi](/blog/tez-yazim-takvimi-zaman-yonetimi).

## Özel durumlar

- **Çocuklar ve ergenler:** Ebeveyn veya yasal temsilci onayı ile çocuğun kendi rızası birlikte alınır. Okullarda veri toplanacaksa ilgili kurumlardan uygulama izni de gerekebilir.
- **Kurum izinleri:** Hastane, okul veya şirkette veri toplanacaksa etik kurul onayının yanında kurumun izni de alınır.
- **Çevrim içi anketler:** Onam formu anketin ilk sayfasında yer alır; katılımcı onay vermeden sorulara geçememelidir.
- **İkincil veri:** Açık veri setleri veya kurum kayıtlarıyla çalışılacaksa etik kurul gerekip gerekmediğini kurulunuza danışın.
- **Ölçek izni:** Kullanacağınız ölçeklerin geliştiricilerinden veya uyarlayanlarından alınan izin yazıları dosyaya eklenir.

## Kişisel veriler ve gizlilik

Türkiye’de kişisel verilerin işlenmesi 6698 sayılı Kişisel Verilerin Korunması Kanunu’na tabidir. Etik kurul başvurusunda verilerin nasıl saklanacağını, kimlerin erişebileceğini, ne kadar süre tutulacağını ve nasıl anonimleştirileceğini açıklayın. Mümkünse ad, öğrenci numarası gibi kimlik bilgilerini hiç toplamayın; gerekiyorsa verilerle ayrı tutun.

## Onam formunda olması gerekenler

- Araştırmanın amacı ve süresi, sade bir dille
- Katılımcıdan ne istendiği ve tahmini süre
- Katılımın gönüllü olduğu ve istenildiği an bırakılabileceği
- Olası riskler ve yararlar
- Verilerin gizliliği ve nasıl kullanılacağı
- Araştırmacının iletişim bilgileri

## Onay sonrası

Onay belgesinin tarihini ve sayısını yöntem bölümünde belirtin. Onaydan sonra yöntemde önemli bir değişiklik yaparsanız (yeni ölçek, farklı örneklem) kurula değişiklik bildirimi yapmanız gerekebilir. Tezin etik bölümünü yazarken onay bilgisini uydurmayın; bilgi elinizde değilse yer tutucu bırakıp sonra doldurun.

## Academiana ile etik kurul belgeleri

Academiana’da yöntem bölümünde "Etik kurul belgeleri" eylemi, projenizdeki yöntem bilgilerinden bir başvuru metni taslağı ve bilgilendirilmiş onam formu hazırlar. Projede olmayan bilgileri (kurum adı, tarih, iletişim) uydurmaz, doldurmanız için işaretler. Anket oluşturucuya da hazır bir onam metni şablonu ekleyebilir, katılımcılar ankete başlamadan önce onam vermelerini sağlayabilirsiniz.`,
    sources: [
      { text: "World Medical Association. (2013). World Medical Association Declaration of Helsinki: Ethical principles for medical research involving human subjects. JAMA, 310(20), 2191–2194." },
      { text: "6698 sayılı Kişisel Verilerin Korunması Kanunu. (2016). Resmî Gazete, 29677.", url: "https://www.mevzuat.gov.tr/" },
    ],
  },
  {
    slug: "zotero-mendeley-ile-kaynak-yonetimi",
    title: "Zotero ve Mendeley ile Kaynak Yönetimi: Başlangıç Rehberi",
    description: "Kaynak yönetim programları neden kullanılır? Zotero, Mendeley ve EndNote karşılaştırması; BibTeX ve RIS ile kaynakları başka araçlara aktarma.",
    category: "Kaynak ve atıf",
    keywords: ["Zotero nasıl kullanılır", "Mendeley kullanımı", "kaynak yönetim programı", "BibTeX RIS"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Zotero, Mendeley veya EndNote kütüphanenizi tek tıkla içe aktarın; atıflarınız seçtiğiniz stilde otomatik biçimlensin.", href: "/kayit", label: "Kaynaklarımı aktar" },
    body: `Bir tez boyunca onlarca, bazen yüzlerce kaynak okursunuz. Bunları bir Word dosyasında veya klasörlerde tutmak, teslim günü yaklaştığında "Bu bilgiyi hangi makaleden almıştım?" sorusuna dönüşür. Kaynak yönetim programları bu sorunu çözer.

## Kaynak yönetim programları ne yapar?

- Kaynakların künye bilgilerini tek bir kütüphanede toplar
- Tarayıcıdan tek tıkla makale ekler
- PDF’leri kaynakla birlikte saklar, not ve vurgu yapmanızı sağlar
- Word ile birlikte çalışarak atıf ve kaynakçayı otomatik oluşturur
- Kaynakları etiket ve klasörlerle düzenler

## Zotero

- Ücretsiz ve açık kaynaklıdır.
- Tarayıcı eklentisiyle web sayfalarından ve veri tabanlarından künye toplar.
- Binlerce atıf stilini destekler.
- Grup kütüphaneleriyle ortak çalışmaya uygundur.

## Mendeley

- Elsevier’e aittir.
- PDF okuma ve not alma özellikleri öne çıkar.
- Web ve masaüstü sürümleri vardır.

## EndNote

- Ücretli bir programdır; bazı üniversiteler lisansını sağlar.
- Büyük kütüphaneleri yönetmek için güçlü özellikler sunar.

Hangisini seçeceğiniz çoğu zaman kişisel tercih ve üniversitenizin desteğine bağlıdır.

## Kaynakları taşımak: BibTeX, RIS, CSL-JSON

Bu programlar kaynakları standart dosya biçimlerinde dışa aktarabilir:

- **BibTeX (.bib):** LaTeX kullanıcılarının standart biçimi
- **RIS (.ris):** Neredeyse bütün programların okuyabildiği yaygın biçim
- **CSL-JSON:** Atıf stilleriyle çalışan modern araçların kullandığı biçim

Bir programdan diğerine geçerken veya kaynaklarınızı başka bir araçta kullanırken bu dosyaları kullanabilirsiniz.

## İyi bir kütüphane için alışkanlıklar

- Kaynağı eklerken künyeyi kontrol edin; otomatik çekilen bilgiler bazen eksik veya hatalı olur.
- DOI’yi mutlaka ekleyin.
- Okuduğunuz her kaynağa kısa bir not yazın: neden önemli, hangi bölümde kullanacaksınız?
- Kopya kayıtları düzenli olarak temizleyin.


## Zotero ile başlamak: adım adım

1. Zotero masaüstü uygulamasını ve tarayıcı eklentisini (Zotero Connector) kurun.
2. Ücretsiz bir Zotero hesabı açıp eşitlemeyi etkinleştirin; kütüphaneniz farklı bilgisayarlarda aynı kalır.
3. Bir makale sayfasındayken tarayıcı eklentisine tıklayın; künye ve varsa PDF kütüphanenize eklenir.
4. DOI’si olan bir kaynağı “Tanımlayıcı ile ekle” düğmesiyle DOI yapıştırarak ekleyin.
5. Her tez için ayrı bir koleksiyon açın; bölümler için alt koleksiyonlar veya etiketler kullanın.
6. Word için Zotero eklentisini kurun; metne atıf ekleyip kaynakçayı otomatik oluşturun.

## Kütüphane düzeni için öneriler

- **Etiketler:** “okundu”, “okunacak”, “yöntem”, “ölçek” gibi etiketler kaynakları hızla süzmenizi sağlar.
- **Notlar:** Her kaynağın altına okuma notu ekleyin; doğrudan alıntılarda sayfa numarasını yazın.
- **Yinelenenler:** Zotero’nun yinelenen öğeleri birleştirme özelliğini düzenli kullanın.
- **Künye kontrolü:** Otomatik eklenen künyelerde başlık büyük harfleri, eksik sayı/sayfa bilgileri ve yazar adları hatalı olabilir; tezden önce kontrol edin.

## Ortak çalışma

Zotero’da **grup kütüphaneleri**, Mendeley’de paylaşılan gruplar, ortak yazarlarla aynı kaynak listesi üzerinde çalışmayı sağlar. Danışmanınızla bir grup kütüphanesi paylaşmak, önerdiği kaynakları doğrudan kütüphanenize eklemesine olanak tanır.

## Hangi stili seçmeliyim?

Kaynak yönetim programları yüzlerce atıf stilini destekler. Kullanacağınız stil enstitünüzün veya derginizin kılavuzunda yazar; Türkiye’de özellikle APA 7 ve ISNAD yaygındır. Stiller arasındaki farkları aynı kaynak üzerinde gördüğünüz örnekler için [kaynakça rehberimize](/blog/kaynakca-nasil-hazirlanir), ISNAD ayrıntıları için [ISNAD rehberimize](/blog/isnad-atif-sistemi-rehberi) bakın.

## Yedekleme

Kütüphanenizi düzenli olarak dışa aktarın (ör. Zotero RDF veya BibTeX) ve ayrı bir yerde saklayın. Eşitleme hizmetleri iyi çalışsa da tez gibi uzun bir projede ek bir yedek, olası veri kayıplarına karşı güvencedir.

## Academiana ile birlikte kullanım

Academiana, Zotero, Mendeley ve EndNote’tan dışa aktardığınız BibTeX, RIS veya CSL-JSON dosyalarını içe aktarır; kaynaklarınız DOI üzerinden doğrulanır ve yinelenen kayıtlar ayıklanır. Çalışmanızdaki kaynakları da aynı biçimlerde dışa aktarabilirsiniz. Böylece alıştığınız programı bırakmadan Academiana’nın kaynak arama, atıf ve yazım özelliklerini birlikte kullanabilirsiniz.`,
    sources: [
      { text: "Zotero Documentation.", url: "https://www.zotero.org/support/" },
      { text: "American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).", url: "https://apastyle.apa.org/" },
    ],
  },
  {
    slug: "tez-yazim-takvimi-zaman-yonetimi",
    title: "Tez Ne Kadar Sürede Yazılır? Gerçekçi Bir Tez Takvimi Örneği",
    description: "Tez yazım sürecini planlama: aşamalara göre süre tahmini, haftalık hedefler, erteleme ile başa çıkma ve teslim tarihine yetişmek için pratik öneriler.",
    category: "Tez yazımı",
    keywords: ["tez ne kadar sürede yazılır", "tez takvimi", "tez yazma motivasyonu", "tez zaman planı"],
    date: "2026-11-02",
    updated: "2026-11-15",
    cta: { text: "Teslim tarihinizi ve kelime hedefinizi girin; haftalık hedefinizi ve ilerlemenizi her gün görün.", href: "/kayit", label: "Tez takvimimi oluştur" },
    body: `"Tezimi ne zaman bitiririm?" sorusunun tek bir cevabı yok; ama iyi bir plan, bitirme ihtimalinizi ciddi biçimde artırır. Tezi en çok geciktiren şey zor bir bölüm değil, planlanmamış süreçlerdir: etik kurul bekleyişi, veri toplama gecikmesi, danışman geri bildirimi.

## Aşamalara göre süre tahmini

Her tez farklıdır; aşağıdaki oranlar yüksek lisans tezleri için kabaca bir fikir vermek amacıyla verilmiştir:

1. **Konu, literatür ve öneri:** Sürecin önemli bir bölümünü alır; burada acele etmek sonraki aşamaları zorlaştırır.
2. **Etik kurul ve izinler:** Kurul toplantı takvimine bağlıdır; haftalar sürebilir. Bu sürede literatür bölümünü yazmaya devam edin.
3. **Veri toplama:** Katılımcılara ulaşma hızınıza bağlıdır; mutlaka pay bırakın.
4. **Analiz ve bulgular:** Veriler hazırsa en hızlı ilerleyen aşamalardan biridir.
5. **Tartışma, sonuç ve özet:** Düşünme gerektirir; tahmin ettiğinizden uzun sürebilir.
6. **Danışman düzeltmeleri ve biçim:** Genellikle birkaç tur sürer; en az birkaç haftalık pay bırakın.

## Takvimi geriye doğru planlayın

1. Teslim tarihini yazın.
2. Ondan önce düzeltmeler ve biçim için pay bırakın.
3. Kalan süreyi bölümlere dağıtın.
4. Her bölümü haftalık hedeflere bölün: "Bu hafta yöntem bölümünün örneklem kısmı" gibi.

## Kelime hedefi koymak

Tezinizin hedef uzunluğunu belirleyin ve haftalık bir kelime hedefine bölün. Her gün az da olsa yazmak, haftada bir gün çok yazmaktan çok daha etkilidir. Taslakta mükemmellik aramayın; önce yazın, sonra düzeltin.

## Ertelemeyle başa çıkmak

- **Küçük başlayın:** "Bugün yöntem bölümünü yazacağım" yerine "Bugün katılımcılar paragrafını yazacağım."
- **Belirli saatler ayırın:** Her gün aynı saatte yazmak alışkanlık oluşturur.
- **Boş sayfayla başlamayın:** Bir önceki gün kaldığınız yere kısa bir not bırakın.
- **İlerlemenizi görün:** Tamamladığınız bölümleri işaretlemek motivasyonu artırır.

## Danışmanla çalışma düzeni

- Düzenli görüşme takvimi belirleyin.
- Bölümleri parça parça gönderin; bütün tezi tek seferde göndermeyin.
- Geri bildirimleri bir listede toplayın ve hangilerini yaptığınızı işaretleyin.


## Örnek takvim: 12 aylık yüksek lisans tezi

| Ay | Aşama | Çıktı |
| --- | --- | --- |
| 1–2 | Konu, ön literatür, tez önerisi | Onaylanmış öneri |
| 2–3 | Etik kurul başvurusu, ölçek izinleri | Etik kurul onayı |
| 3–5 | Literatür ve kuramsal çerçeve yazımı | Giriş ve literatür taslağı |
| 4–6 | Veri toplama | Tamamlanmış veri seti |
| 6–7 | Analiz | Bulgular tabloları |
| 7–9 | Bulgular ve tartışma yazımı | Bulgular ve tartışma taslağı |
| 9–10 | Sonuç, özet, biçim düzenlemesi | Tam taslak |
| 10–11 | Danışman düzeltmeleri | Son taslak |
| 12 | Teslim ve savunmaya hazırlık | Savunma |

Bu tablo bir örnektir; süreler alanınıza, yönteminize ve enstitünüzün takvimine göre değişir. Literatür yazımı ile veri toplamanın aynı dönemde yürütülebildiğine dikkat edin.

## Haftalık çalışma düzeni

- **Sabit çalışma blokları:** Haftada belirli günlerde, belirli saatlerde tezle çalışın. Düzenli kısa bloklar, düzensiz uzun maratonlardan daha verimlidir.
- **Yazma ve okuma ayrımı:** Bir blokta yalnızca yazın, başka bir blokta okuyun. İkisini karıştırmak yazma akışını böler.
- **Haftalık hedef:** Kelime veya bölüm hedefi koyun ve hafta sonunda ilerlemenizi not edin.
- **Danışman ritmi:** Danışmanınızla iki üç haftada bir kısa görüşme planlayın.

## Mükemmeliyetçilik tuzağı

İlk taslak kusursuz olmak zorunda değildir. Bir bölümü bitirmeden öncekini sürekli düzeltmek ilerlemeyi durdurur. Önce kaba taslağı tamamlayın, düzeltmeleri sonraki tura bırakın. Eksik bilgileri metinde işaretleyip (ör. “[veri girilecek]”) yazmaya devam edin.

## Gecikmeyi erken fark etmek

Takvimden iki haftadan fazla geride kaldığınızda planı güncelleyin: hangi aşama kısaltılabilir, hangisi paralel yürütülebilir? Etik kurul ve veri toplama gibi sizin kontrolünüzde olmayan aşamalarda gecikme olursa, bu sürede literatür ve yöntem bölümlerini ilerletin. Teslim tarihine yaklaştıkça danışmanınızla gerçekçi bir son tarih konuşun.

## Uzun vadede motivasyon

Tez bir maraton gibidir. Küçük kazanımları kutlayın (bir bölümün bitmesi, etik kurul onayı), çalışma alanınızı ve saatlerinizi koruyun ve gerektiğinde mola verin. Erteleme ile ilgili araştırmalar, büyük görevleri küçük ve somut adımlara bölmenin başlamayı kolaylaştırdığını göstermektedir.

## Academiana ile planlama

Academiana’da teslim tarihinizi ve hedef kelime sayınızı girdiğinizde sistem haftalık hedefinizi hesaplar ve yol haritasında ilerlemenizi gösterir. Bölümler önerilen sırayla ilerler; tamamladığınız bölümler kontrol edilip yeşil işaretle gösterilir ve sıradaki bölüm otomatik açılır. Danışmanınızla salt okunur bir bağlantı paylaşabilir, yorumlarını doğrudan ilgili bölümde görüp asistanla uygulayabilirsiniz.`,
    sources: [
      { text: "Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review of quintessential self-regulatory failure. Psychological Bulletin, 133(1), 65–94." },
      { text: "Silvia, P. J. (2019). How to write a lot: A practical guide to productive academic writing (2nd ed.). American Psychological Association." },
    ],
  },
];
