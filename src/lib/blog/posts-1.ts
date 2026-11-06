import type { BlogPost } from "./types";

export const POSTS_1: BlogPost[] = [
  {
    slug: "tez-nasil-yazilir",
    title: "Tez Nasıl Yazılır? Konu Seçiminden Savunmaya Adım Adım Rehber",
    description: "Yüksek lisans ve doktora tezi yazarken izlemeniz gereken adımlar: konu, literatür, yöntem, bulgular, tartışma, biçim ve savunma. Pratik bir yol haritası.",
    category: "Tez yazımı",
    keywords: ["tez nasıl yazılır", "yüksek lisans tezi yazma", "tez yazım aşamaları", "tez bölümleri"],
    date: "2026-11-02",
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

## Academiana ile konu bulma

Academiana’nın **Konu bulma** aracı, yazdığınız alanla ilgili OpenAlex’teki gerçek yayın kayıtlarını analiz eder: yıllara göre yayın sayısı, son üç yılda yükselen alt konular, Türkiye’den yayınların oranı ve en çok atıf alan çalışmalar. Yapay zekâ yalnızca bu verilere dayanarak size tez konusu önerileri sunar; beğendiğiniz öneriyle tek tıkla tez çalışması başlatabilirsiniz.`,
  },
  {
    slug: "literatur-taramasi-nasil-yapilir",
    title: "Literatür Taraması Nasıl Yapılır? Adım Adım Rehber",
    description: "Akademik literatür taraması için anahtar kelime belirleme, veri tabanı seçimi, kaynak eleme ve tematik sentez. Tez ve makale için uygulanabilir yöntem.",
    category: "Araştırma ve yöntem",
    keywords: ["literatür taraması nasıl yapılır", "literatür taraması örneği", "kaynak tarama", "sistematik derleme"],
    date: "2026-11-02",
    cta: { text: "OpenAlex, Crossref, PubMed, DergiPark dahil 10’dan fazla veri tabanında aynı anda arayın; kaynaklar otomatik doğrulanır.", href: "/kayit", label: "Kaynak aramaya başla" },
    body: `Literatür taraması, konunuzla ilgili mevcut bilgiyi bulmak, değerlendirmek ve sentezlemek demektir. Amaç kaynakları tek tek özetlemek değil, alandaki bilginin bugün nerede durduğunu ve sizin çalışmanızın nereye oturduğunu göstermektir.

## 1. Anahtar kelimeleri belirleyin

Konunuzdaki temel kavramları yazın ve her biri için eş anlamlıları ve İngilizce karşılıklarını ekleyin. Örneğin "benlik saygısı" için *self-esteem*, *self-worth*. Kavramları **AND** ile birleştirip eş anlamlıları **OR** ile genişletebilirsiniz:

- (self-esteem OR self-worth) AND (social media) AND (university students)

## 2. Doğru veri tabanlarını seçin

- **Genel ve disiplinler arası:** OpenAlex, Crossref, Semantic Scholar, Google Scholar
- **Sağlık ve yaşam bilimleri:** PubMed, Europe PMC
- **Açık erişim:** DOAJ, CORE
- **Türkçe kaynaklar:** DergiPark, TR Dizin, YÖK Ulusal Tez Merkezi

Tek bir veri tabanında kalmak önemli çalışmaları kaçırmanıza neden olabilir.

## 3. Kaynakları eleyin

Önce başlık ve özete bakın, sonra uygun olanların tam metnini okuyun. Dahil etme ölçütlerinizi baştan yazın: yayın yılı aralığı, dil, yöntem türü, örneklem. Sistematik derleme yapıyorsanız bu süreci kayıt altına almanız (ör. PRISMA akış şeması) beklenir.

## 4. Okurken not alın

Her kaynak için şunları not edin: amaç, örneklem, yöntem, temel bulgular, sınırlılıklar ve sizin çalışmanızla ilişkisi. Doğrudan alıntı yapacağınız cümlelerin sayfa numarasını mutlaka yazın. Bu notları bir tabloda toplamak (literatür matrisi) yazma aşamasını çok hızlandırır.

## 5. Kaynakları tek tek değil, temalara göre yazın

Zayıf bir literatür bölümü "A şunu buldu. B şunu buldu." şeklinde ilerler. Güçlü bir literatür bölümü ise temalar etrafında örgütlenir: hangi bulgular birbirini destekliyor, hangileri çelişiyor, hangi sorular hâlâ cevapsız?

## 6. Boşluğu açıkça belirtin

Literatür bölümünüzün sonunda okuyucu şu soruya cevap bulmalıdır: "Bu çalışmaya neden ihtiyaç var?" Boşluk; az çalışılmış bir örneklem, çelişkili bulgular ya da eksik bir yöntem olabilir.

## Sık yapılan hatalar

- Yalnızca özetini okuduğunuz bir çalışmayı tam metnini okumuş gibi yorumlamak
- Eski ve güncelliğini yitirmiş kaynaklarla yetinmek
- İkincil kaynağı birincil kaynakmış gibi göstermek
- Kaynak bilgilerini sona bırakıp sonra bulamamak

## Academiana ile literatür taraması

Academiana, yazdığınız konu için arama stratejisini planlar ve 10’dan fazla veri tabanında aynı anda arama yapar. Bulunan kaynaklar DOI üzerinden doğrulanır; her kaynağın yanında künye, özet veya tam metin düzeyinde mi okunduğu açıkça yazar. Literatür matrisi ile kaynaklarınızı tablo hâlinde karşılaştırabilir, açık erişimli tam metinlerden sayfa numaralı alıntılar yapabilirsiniz.`,
  },
  {
    slug: "apa-7-atif-kurallari",
    title: "APA 7 Atıf Kuralları: Metin İçi Atıf ve Kaynakça Örnekleri",
    description: "APA 7’ye göre metin içi atıf, doğrudan alıntı, çok yazarlı kaynaklar ve kitap, makale, web sayfası kaynakça örnekleri: Türkçe çalışmalar için rehber.",
    category: "Kaynak ve atıf",
    keywords: ["APA 7 kuralları", "APA kaynak gösterme", "APA 7 kaynakça örnekleri", "metin içi atıf"],
    date: "2026-11-02",
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

## Academiana ile otomatik APA 7

Academiana’da atıflar metne düz yazı olarak değil, kaynağa bağlı bir işaret olarak eklenir. Kaynakça bu işaretlerden otomatik oluşur; metinden bir atıfı sildiğinizde kaynakçadan da kalkar. APA 7, ISNAD, MLA, Chicago, IEEE, Vancouver ve Harvard dahil 10 stil arasında tek tıkla geçiş yapabilirsiniz. Kalite kontrolü, eksik künye bilgilerini ve metin–kaynakça uyumsuzluklarını sizin yerinize bulur.`,
  },
  {
    slug: "kaynakca-nasil-hazirlanir",
    title: "Kaynakça Nasıl Hazırlanır? APA, MLA, Chicago ve ISNAD Farkları",
    description: "Kaynakça hazırlarken hangi stili seçmelisiniz? APA, MLA, Chicago, IEEE ve ISNAD stillerinin farkları, örnekleri ve kaynakça hatalarından kaçınma yolları.",
    category: "Kaynak ve atıf",
    keywords: ["kaynakça nasıl yazılır", "kaynakça örneği", "ISNAD atıf sistemi", "MLA kaynak gösterme", "Chicago atıf"],
    date: "2026-11-02",
    cta: { text: "Zotero, Mendeley veya EndNote’tan kaynaklarınızı içe aktarın; kaynakça seçtiğiniz stilde otomatik oluşsun.", href: "/kayit", label: "Kaynakçamı otomatik oluştur" },
    body: `Kaynakça, çalışmanızda atıf yaptığınız bütün kaynakların listesidir. Okuyucunun bir bilgiyi kaynağına kadar takip edebilmesini sağlar ve akademik dürüstlüğün temelidir. Hangi stili kullanacağınızı çoğu zaman siz değil, enstitünüz veya dergi belirler.

## Kaynakça ile bibliyografya farkı

- **Kaynakça:** Yalnızca metinde atıf yaptığınız kaynaklar.
- **Bibliyografya:** Okuduğunuz ama atıf yapmadığınız kaynaklar da dahil olabilir.

Tezlerde ve makalelerde genellikle **kaynakça** istenir.

## Stiller ve kullanıldığı alanlar

### APA

Psikoloji, eğitim ve sosyal bilimlerde yaygındır. Metin içinde (Yazar, Yıl) kullanılır. Kaynakçada yıl, yazar adından hemen sonra gelir.

### MLA

Dil, edebiyat ve beşerî bilimlerde kullanılır. Metin içinde yazar ve sayfa yazılır: (Yılmaz 45). Kaynakçanın adı "Works Cited"tır.

### Chicago

Tarih ve sanat alanlarında yaygındır. İki biçimi vardır: **dipnot–bibliyografya** (atıflar dipnotta) ve **yazar–tarih**.

### IEEE ve Vancouver

Mühendislik (IEEE) ve tıp (Vancouver) alanlarında kullanılır. Atıflar köşeli parantez veya üst simge numaralarla verilir: [1]. Kaynakça, metinde ilk geçiş sırasına göre numaralandırılır.

### ISNAD

Türkiye’de özellikle ilahiyat ve sosyal bilimlerin bazı alanlarında kullanılan bir atıf sistemidir. Dipnotlu ve metin içi olmak üzere iki biçimi vardır. Türkiye’deki pek çok dergi ISNAD’ı zorunlu tutar. Academiana, ISNAD 2. edisyonun metin içi (yazar-tarih) biçimini destekler; dipnotlu biçim kullanan dergilerde kaynakçayı dergi kılavuzuyla karşılaştırın.

## İyi bir kaynakça için kontrol listesi

- Metindeki **her** atıfın kaynakçada karşılığı var mı?
- Kaynakçadaki **her** kaynağa metinde atıf yapılmış mı?
- Yazar adları ve yıllar metinle birebir uyuşuyor mu?
- Dergi adı, cilt, sayı ve sayfa bilgileri eksiksiz mi?
- DOI varsa eklenmiş mi?
- Sıralama doğru mu (APA ve MLA’da alfabetik, IEEE’de numara sırası)?
- Biçim tutarlı mı (italik, noktalama, asılı girinti)?

## Kaynak yönetim programları

Zotero, Mendeley ve EndNote gibi programlar kaynaklarınızı tek bir yerde toplar ve kaynakçayı otomatik oluşturur. Bu programlarda kaydettiğiniz kaynakları BibTeX, RIS veya CSL-JSON biçiminde dışa aktarıp başka araçlara taşıyabilirsiniz.

## Academiana ile kaynakça

Academiana’da kaynakça elle yazılmaz; metindeki atıflardan otomatik oluşur ve her zaman metinle uyumludur. Zotero, Mendeley ve EndNote’tan kaynaklarınızı içe aktarabilir, kaynakçanızı yine bu programların okuyabileceği biçimlerde dışa aktarabilirsiniz. Kaynakçada bir kaynağa tıkladığınızda o kaynağın metnin hangi bölümlerinde kullanıldığını görürsünüz. Stil değiştirmek tek tıktır.`,
  },
  {
    slug: "intihal-nasil-onlenir",
    title: "İntihalden Nasıl Kaçınılır? Doğru Alıntı, Parafraz ve Atıf Rehberi",
    description: "Tezde ve makalede intihale düşmemek için doğru alıntı, parafraz ve atıf teknikleri. Benzerlik raporu nasıl okunur, kendi kendine intihal nedir?",
    category: "Etik ve yapay zekâ",
    keywords: ["intihal nasıl önlenir", "intihal oranı düşürme", "intihalden kurtulma", "parafraz nasıl yapılır", "benzerlik raporu"],
    date: "2026-11-02",
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

## Academiana yaklaşımı

Academiana bir intihal yüzdesi göstermez; çünkü güvenilir bir oran ancak lisanslı ve büyük arşivlere sahip servislerle hesaplanabilir. Bunun yerine intihale düşmemeniz için çalışır: asistan yalnızca projenize eklenmiş gerçek kaynaklara atıf yapar, kaynağı olmayan kesin iddia yazmaz, tam metni okunan kaynaklardan aktarımlarda sayfa numarası verir ve metinde tekrar eden ifadeleri işaretler.`,
  },
  {
    slug: "yapay-zeka-ile-tez-yazmak-etik-mi",
    title: "Yapay Zekâ ile Tez Yazmak Etik mi? Doğru ve Yanlış Kullanım",
    description: "Tez ve makalede yapay zekâ kullanımı ne zaman meşru, ne zaman etik ihlaldir? Üniversitelerin yaklaşımı, beyan zorunluluğu ve sorumlu kullanım ilkeleri.",
    category: "Etik ve yapay zekâ",
    keywords: ["yapay zeka ile tez yazmak", "ChatGPT ile tez yazılır mı", "yapay zeka akademik etik", "yapay zeka beyanı"],
    date: "2026-11-02",
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

## Academiana bu ilkeler üzerine kuruldu

Academiana’da asistan sistem düzeyinde kaynak uyduramaz: yalnızca gerçek veri tabanlarından bulunup projenize eklenmiş kaynaklara atıf yapabilir. Kaynağı olmayan kesin iddia yazmaz; veri gereken yerde "[VERİ GİRİLECEK]" işareti bırakır. Hiçbir taslak siz "Belgeye ekle" demeden metninize girmez ve her değişiklik sürüm geçmişinde saklanır. Ayrıntılar için [akademik dürüstlük ilkelerimize](/akademik-durustluk) göz atabilirsiniz.`,
  },
  {
    slug: "yapay-zeka-tespit-araclari",
    title: "Yapay Zekâ Tespit Araçları Güvenilir mi? Öğrenciler İçin Gerçekler",
    description: "Turnitin ve benzeri yapay zekâ tespit araçları nasıl çalışır, ne kadar güvenilir? Yanlış pozitif sonuç alırsanız ne yapmalısınız? Dürüst bir rehber.",
    category: "Etik ve yapay zekâ",
    keywords: ["yapay zeka tespit", "Turnitin yapay zeka", "AI detector güvenilir mi", "yapay zeka tespitinden kurtulma"],
    date: "2026-11-02",
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

## Academiana’nın tutumu

Academiana tespit araçlarını atlatmaya yönelik bir özellik sunmaz ve böyle bir vaatte bulunmaz. Bunun yerine sürecin şeffaf olmasını sağlar: her asistan eklemesinden önceki hâl ve elle kaydettiğiniz sürümler geçmişte saklanır, böylece metninizin nasıl geliştiğini her zaman gösterebilirsiniz. Asistanın önerileri yalnızca siz eklediğinizde metne girer.`,
  },
];
