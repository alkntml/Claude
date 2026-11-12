# Academiana — Yasal metinler için hukukçu bilgi notu

_12 Kasım 2026. Bilgiler sitenin kodundan, veritabanı yapısından ve yayındaki metinlerden derlendi. Hukuki değerlendirme hukukçuya aittir._

Yazılacak metinler (site menüsünde "Gizlilik ve Güvenlik" başlığı altında):
1. KVKK Aydınlatma Metni
2. Kullanım Koşulları
3. Adil Kullanım Politikası
4. Çerez Politikası
5. Akademik Dürüstlük
6. Mesafeli Sözleşmeler ve Ön Bilgilendirme
7. GDPR / Data Protection

---

## A. Ortak bilgiler (bütün metinler için)

**Hizmet:** Academiana (www.academiana.com.tr), yapay zekâ destekli akademik araştırma ve yazım platformu. Kullanıcılar tez, makale, proje önerisi ve literatür taramasını sitede yazar. Sitenin özellikleri:
- yapay zekâ ile metin önerisi ve düzenleme
- akademik veri tabanlarından gerçek kaynak bulma
- atıf ve kaynakça (APA, Chicago, ISNAD vb.)
- istatistik analizi
- anket hazırlama ve toplama
- Word, PDF ve LaTeX çıktısı
- ortak yazarlarla birlikte yazım
- danışmanla salt okunur paylaşım
- savunma provası, PRISMA sistematik derleme, iddia denetimi, çeviri

**Kullanıcı kitlesi:** Ağırlıkla Türkiye'deki lisansüstü öğrenciler ve akademisyenler. Arayüz Türkçe, İngilizce ve Almanca; yurt dışından da üye olunabiliyor. Almanya'dan gelen ziyaretçiye site otomatik Almanca açılıyor. Yaş sınırı yok ve yaş kontrol edilmiyor.

**Altyapı:**

| Hizmet sağlayıcı | Ne için | Verinin yeri |
|---|---|---|
| Supabase | Veritabanı, giriş, dosya deposu | Frankfurt (AB). Şirket ABD merkezli |
| Vercel | Barındırma | Sunucu Frankfurt. Şirket ABD merkezli, dünya geneli dağıtım ağı (CDN) kullanıyor |
| Anthropic (Claude) | Yapay zekâ | ABD |
| OpenAI | Yapay zekâ | Kodda isteğe bağlı olarak var (ABD); canlıda kullanılıp kullanılmadığı aşağıda soruluyor |

**Paketler:**
- Ücretsiz paket
- Aylık ücretli paketler
- Tek seferlik "Tek Proje" paketi: tek bir çalışma için, süresiz
- Kurum lisansı
- İndirimler: indirim kodları, davet programı (davet edene paket hakkı) ve Akademik Ekip İndirimi (%30, en az 3 kişi)

**Ödeme:** Sitede ödeme sayfası yok. Kullanıcı WhatsApp üzerinden yazıyor, ödeme sistem dışında alınıyor ve yönetici paketi elle tanımlıyor. Kart bilgisi sisteme hiç girmiyor. Sistemde yalnızca ödeyenin adı, telefonu, tutarı ve bir not tutuluyor.

**Kayıt ve onay şu an nasıl:**
- E-postayla kayıtta tek bir onay kutusu var: "Gizlilik politikasını ve kullanım koşullarını okudum, kabul ediyorum."
- Google veya Apple ile girişte onay kutusu yok. Altta "ilk girişte kabul etmiş olursunuz" notu yazıyor.
- Ayrı bir açık rıza ve pazarlama izni alınmıyor. Pazarlama e-postası veya SMS gönderilmiyor; bildirimler yalnızca site içinde.
- Metinler değişirse ekrana yeni onay kutuları ve sayfalar eklenebilir.

**Yayındaki eski metinler:** `/gizlilik`, `/kosullar` ve `/akademik-durustluk` sayfaları yeni metinlerle değiştirilecek. `/kosullar` sayfasının başında hâlâ "Şablon metin: hukuki inceleme yapılmalıdır" ibaresi görünüyor.

---

## 1. KVKK Aydınlatma Metni için

### İşlenen kişisel veriler, amaçları ve saklama süreleri
| Veri | İçerik | Amaç | Şu anki saklama |
|---|---|---|---|
| Kimlik ve iletişim | Ad soyad, e-posta, kurum (isteğe bağlı) | Üyelik, giriş, iletişim | Hesap silinene kadar |
| Giriş | Şifre (Supabase'de geri çözülemez biçimde, site şifreyi görmüyor). Google/Apple ile girişte yalnızca ad ve e-posta; Apple'da gizli e-posta olabilir | Kimlik doğrulama | Hesapla |
| Akademik içerik | Çalışmalar, bölümler, sürüm geçmişi, yorumlar, kaynaklar, notlar | Hizmetin kendisi | Hesapla |
| Yüklenen dosyalar | PDF, Word, Excel/CSV ve bunlardan çıkarılan metin | Okuma, analiz, istatistik | Hesapla. Dosyalar özel depoda tutuluyor ve yalnızca süreli bağlantıyla açılıyor |
| Yapay zekâ sohbetleri | Kullanıcının mesajları ve yanıtlar | Asistan hizmeti | Hesapla |
| Kullanım kanıt kaydı | Her yapay zekâ çıktısının **tam metni**, tarih, çalışma ve bölüm adı, kelime sayısı; silme kayıtları | Paket kullanımı anlaşmazlıkları, kötüye kullanımın önlenmesi | Metinde "12 ay" yazıyor, ancak **otomatik silme yok**: kayıt hesap silinene kadar duruyor. Hukukçu süre belirlerse otomatik silme eklenecek |
| Kullanım sayaçları | Token, maliyet, tarama sayısı, sayfa sayısı | Paket limitleri | Hesapla |
| Cihaz kimliği | Tarayıcıda rastgele bir kimlik. Sunucuda yalnızca geri çözülemeyen özeti ve ilk/son görülme tarihi tutuluyor | Davet ödülü suistimali, Tek Proje paketinde hesap paylaşımı tespiti | Hesapla |
| Tek Proje indirme izi | Kelime sayısı, metnin geri elde edilemeyen özeti, kapak bilgileri (yazar, üniversite, bölüm, **danışman adı**) | Paketin başka çalışmalar için kullanılmasını tespit | Hesapla |
| Ödeme kaydı | Ödeyenin adı, telefonu, tutar, not | Paket tanımlama | Hesapla (vergi mevzuatındaki saklama süresiyle çatışabilir) |
| Ortak yazar daveti | Davet edilen kişinin e-postası (üye olmasa da) | Daveti iletmek | Davet 14 günde geçersiz oluyor, kayıt çalışmayla birlikte duruyor |
| Danışman paylaşımı | Bağlantıyı açan kişi giriş yapmadan çalışmayı okuyup yorum yazabiliyor; yorumda ad yazılabiliyor | Danışman geri bildirimi | Kullanıcı bağlantıyı iptal edene kadar |
| Kurum üyeliği | Üyelik, kullanım istatistiği, kurum işlem kaydı | Kurum lisansı | Kurum yöneticisi içeriği göremiyor, yalnızca üye listesini ve istatistikleri görüyor |
| Geri bildirim ve hata kayıtları | Kullanıcının mesajı, hata bilgisi, kullanıcı kimliği | Destek, teknik sorun giderme | Süresiz. Hesap silinince kullanıcıyla bağı kopuyor, metin kalıyor |
| Ziyaret istatistiği | Sayfa, yönlendiren site, kampanya etiketi, cihaz türü, dil ve günlük değişen anonim kod. IP adresi kaydedilmiyor | Site istatistiği | Süresiz |
| Bildirimler | Yöneticinin site içi mesajları | İletişim | Hesapla |
| KVKK talepleri | Veri isteme ve silme talepleri | Başvuru takibi | Silme talebinin kaydı kişiyle bağı olmadan tutuluyor |

### Veri aktarılan alıcı grupları
Supabase, Vercel, Anthropic (ve kullanılıyorsa OpenAI), Google ve Apple (yalnızca giriş için). Bunların dışında akademik veri tabanları var:
- OpenAlex, Crossref, PubMed / Europe PMC, arXiv, DOAJ, DataCite, ERIC, DBLP, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP, Unpaywall
- anahtar tanımlıysa Springer Nature, IEEE ve NASA ADS

Bu veri tabanlarına yalnızca arama kelimeleri ve DOI gidiyor; kullanıcı kimliği gitmiyor.

Kullanıcı kendisi isterse veri şu yerlere de gidiyor: Overleaf (LaTeX dosyası), Zotero (kullanıcının girdiği anahtar saklanmıyor) ve WhatsApp (ödeme yazışması). Veri satılmıyor ve reklam amacıyla kullanılmıyor.

### Yurt dışına aktarım
Kullanıcı bir yapay zekâ özelliğini kullandığında metni, çalışma bağlamı ve seçtiği kaynak/dosya parçaları ABD'deki Anthropic'e gidiyor. Supabase ve Vercel ABD şirketleri; veriler Frankfurt'ta tutuluyor. Akademik veri tabanlarının çoğu yurt dışında.

### Toplama yöntemi
Kayıt formu, kullanıcının yazdıkları ve yükledikleri, otomatik kullanım kayıtları ve cihaz kimliği.

### İlgili kişi hakları (KVKK m. 11)
- Hesap sayfasından tüm veriler JSON olarak indirilebiliyor.
- Hesap sayfasından hesap tüm verilerle birlikte kalıcı olarak silinebiliyor.
- "Veri talebi" oluşturulabiliyor; yönetici 30 gün içinde ücretsiz yanıtlıyor.
- **Başvuru adresi ve yöntemi (e-posta, KEP, posta) belirlenmeli.**

### Özel durumlar
1. **Üçüncü kişi ve özel nitelikli veriler:** Kullanıcıların yüklediği içerikte bu tür veriler olabilir (tez katılımcıları, görüşme dökümleri, hasta verisi). Bu verilerde Academiana veri işleyen konumunda olabilir.
2. **Anketler:** Herkese açık anket formu ad, e-posta veya IP toplamıyor; doldurma süresi kaydediliyor. Cevaplar hassas olabilir. Katılımcıya karşı veri sorumlusu anketi yapan araştırmacı; site araştırmacıya örnek onam metni öneriyor.
3. **Otomatik izleme:** Kötüye kullanım olasılığı otomatik tespit ediliyor, ama kararı bir insan veriyor (ayrıntı 3. bölümde). Bu durum KVKK m. 11/1-g kapsamına girebilir.

---

## 2. Kullanım Koşulları için

**Hizmetin niteliği:** Akademik çalışmaya yardım eden bir araç. İçeriğin doğruluğu, özgünlüğü ve kurum kurallarına uygunluğu kullanıcının sorumluluğunda.

**Hesap:**
- Kayıt e-postayla ya da Google veya Apple ile yapılıyor.
- E-posta doğrulaması açık. Geçici e-posta adresleriyle davet ödülü verilmiyor.
- Hesap başkasıyla paylaşılamaz.

**Paketler ve hak dolması:**
- Paketler: Ücretsiz, aylık ücretli, Tek Proje (tek seferlik) ve kurum lisansı.
- Aylık haklar yapay zekâ kullanımı, kaynak tarama ve yapay zekâyla yazılan sayfa olarak sayılıyor. 1 sayfa 344 kelime sayılıyor.
- Hak dolunca yalnızca o özellik duruyor. Çalışma silinmiyor ve kilitlenmiyor; görüntülenip düzenlenebiliyor ve paketin izin verdiği biçimlerde indirilebiliyor.
- Yapay zekânın ürettiği metin silinse bile kullanılan hak geri verilmiyor.

**Kullanıcı içeriği ve fikrî mülkiyet:** Mevcut metinde bu konuda hüküm yok. Belirlenmesi gerekenler:
- Kullanıcının yüklediği içerik ve yapay zekâ çıktısı kime ait?
- Platform bu içeriği yalnızca hizmeti sunmak için mi işliyor?
- Kullanıcının yüklediği PDF'lerde telif sorumluluğu kimde?

**Paylaşım özellikleri:**
- **Ortak yazarlar:** "Düzenleyebilir" veya "yorum yapabilir" rolüyle davet ediliyor. Çalışmayı, kaynakları ve yorumları görüyorlar; sahibin dosyalarını ve asistan sohbetlerini göremiyorlar.
- **Danışman bağlantısı:** Bağlantıya sahip herkes giriş yapmadan okuyabiliyor.
- **Kurum lisansı:** Katılım koduyla üye olunuyor. Kurum yöneticisi içeriği göremiyor.

**Yönetici yetkileri:**
- Hesabı askıya alma
- Paket tanımlama
- Site içi bildirim gönderme
- Kullanım kaydını (yapay zekâ çıktı metinleri dâhil) görme
- Kullanıcının verisini dışa aktarma

**Eklenmesi gereken hükümler:**
- Taraflar
- Sorumluluğun sınırlandırılması
- Hizmetin kesintisi ve değişmesi
- Fiyat ve koşul değişikliğinin bildirimi
- Yasaklı kullanımlar (başkası adına tez yazdırma, akademik hile vb.)
- Askıya alma ve itiraz
- Uygulanacak hukuk ve yetkili mahkeme
- Yaş sınırı
- Hangi dildeki metnin bağlayıcı olduğu: Almanca metinde "bağlayıcı olan Türkçesidir" yazıyor, İngilizcede yazmıyor

---

## 3. Adil Kullanım Politikası için

**"Sınırsız"ın anlamı:** Bir kişinin bir akademik çalışma için olağan kullanımı.

**Tek Proje paketinin kuralları:**
- Paket tanımlanırken seçilen tek bir çalışma için geçerli; süre sınırı yok.
- Sınırsızlık yalnızca bu çalışmada geçerli. Çalışma dışındaki yapay zekâ kullanımı (anket yardımcısı, konu bulma vb.) ayda Ücretsiz paket kadar.
- Pakete bağlı çalışma silinemiyor ve türü değiştirilemiyor; ikinci çalışma açılamıyor.
- Şunlar ihlal sayılıyor: çalışmayı bitirip silmek veya üzerine yazarak başka çalışma yazmak, konuyu değiştirmek, başkaları için çalışma hazırlamak, hesabı paylaşmak.

**Otomatik izleme — sistem şu durumlarda yöneticiye uyarı gönderiyor:**
- indirmeden sonra büyük silme
- indirmeler arasında içeriğin büyük ölçüde değişmesi
- kapakta yazar, üniversite veya danışman bilgisinin değişmesi
- çok sayıda cihazdan kullanım
- çok sayıda bölüm
- çalışmanın konusuyla ilgisiz uzun yapay zekâ metni
- maliyetin paket ücretinin %40'ını geçmesi (yalnızca bilgi; kısıtlama yok)

**Karar süreci:**
- Hesap **otomatik olarak askıya alınmıyor**; uyarıyı bir insan inceliyor.
- Yöneticinin seçenekleri: "sorun yok", "kullanıcıyı uyar" veya "askıya al".
- Paketi koşullara aykırı kullanılan hesaba ücret iadesi yapılmıyor (mevzuatın zorunlu kıldığı durumlar hariç). Kullanıcı karara itiraz edebiliyor.

**Davet programı suistimali:** Davet edenin cihazından açılan hesaba ve geçici e-posta adresine ödül verilmiyor. Ödül yalnızca e-posta doğrulanınca veriliyor.

---

## 4. Çerez Politikası için

**Çerezler ve tarayıcı belleği:**

| Ad / tür | Amaç | Süre | Taraf |
|---|---|---|---|
| Supabase oturum çerezleri | Girişin açık kalması | Oturum ve yenileme süresi | Birinci taraf, zorunlu |
| `acd_did` çerezi + tarayıcı belleği | Rastgele cihaz kimliği. Yalnızca kötüye kullanımı önlemek için (davet suistimali, hesap paylaşımı); reklam için kullanılmıyor | 400 gün | Birinci taraf |
| `lang` çerezi | Arayüz dili | 1 yıl | Birinci taraf, işlevsel |
| Tarayıcı belleği (localStorage) | Gece modu, rehberli tur durumu, çevrimdışı taslak yedeği gibi tercihler | Kalıcı | Yalnızca kullanıcının cihazında |
| Servis çalışanı (PWA) | Sitenin çevrimdışı açılması | — | Birinci taraf |

- Analitik, reklam ve üçüncü taraf çerezi **yok**.
- Ziyaret sayımı çerezsiz yapılıyor. IP adresi ve tarayıcı bilgisi yalnızca o güne ait geri çözülemeyen bir kod üretmek için anlık kullanılıyor; saklanmıyor ve günler arasında aynı kişi izlenemiyor. Tarayıcı "izleme yapma" (DNT/GPC) sinyali gönderiyorsa hiç sayım yapılmıyor.
- **Hukukçunun değerlendirmesi gereken:** Cihaz kimliği çerezi zorunlu sayılır mı? Çerez onay şeridi gerekli mi? (Şu an onay şeridi yok.)

---

## 5. Akademik Dürüstlük için

Platformun gerçek davranışı:
- **Kaynaklar gerçek:** Kaynaklar yalnızca akademik veri tabanlarından geliyor. Yapay zekâ yalnızca projeye eklenmiş kaynaklara atıf yapabiliyor. Destekleyemediği yerlere "[KAYNAK GEREKLİ]", veri gereken yerlere "[VERİ GİRİLECEK]" yazıyor. Kaynak, yazar, DOI, istatistik veya bulgu uydurmamak tasarım kuralı; ancak yapay zekânın hata yapma ihtimali sıfır değil.
- **Erişim seviyesi gösteriliyor:** Her kaynakta yalnızca künyenin mi, özetin mi, tam metnin mi okunduğu yazıyor. Sayfa numarası ve doğrudan alıntı yalnızca tam metni okunan kaynaklarda kullanılıyor.
- **Doğrulama:** DOI'ler Crossref ve DataCite, PMID'ler Europe PMC, arXiv kimlikleri arXiv üzerinden doğrulanıyor. Doğrulanamayan kaynak uyarıyla gösteriliyor.
- **Ücretsiz uydurma kaynak kontrolü aracı:** Bir kaynakçadaki kayıtların gerçekten var olup olmadığını denetliyor.
- **İddia denetimi:** Metindeki atıflı cümlenin kaynakta desteklenip desteklenmediğini kontrol ediyor ve sonucu "destekliyor / kısmen / desteklemiyor / çelişiyor" diye gösteriyor.
- **Veri uydurulmuyor:** İstatistikler kullanıcının verisinden hesaplanıyor; yapay zekâ yalnızca yorumluyor.
- **İntihal yüzdesi gösterilmiyor:** Lisanslı bir intihal servisi yok.
- **Kullanıcının yükümlülüğü:** Kurumunun yapay zekâ politikasına uymak ve gerekirse yapay zekâ kullanımını beyan etmek.
- **Kalite puanı yöntemi:** `/yontem` sayfasında açıklanıyor; yapay zekâ bulguları puanı etkilemiyor.

---

## 6. Mesafeli Sözleşmeler ve Ön Bilgilendirme için

**Satış süreci:**
1. Kullanıcı Fiyatlar sayfasında veya uygulama içindeki "Yükselt" düğmesine basınca WhatsApp'ta hazır bir mesaj açılıyor; mesajda paket adı ve varsa indirim kodu yazıyor.
2. Ödeme yapılıyor (yöntemi aşağıda soruluyor).
3. Yönetici paketi sistemde tanımlıyor. Hizmet anında başlıyor (dijital hizmet).

**Satış türleri:**
- aylık paketler
- tek seferlik Tek Proje paketi (süresiz)
- kurum lisansı (kurumla ayrı anlaşma)
- indirimler: indirim kodu, öğrenci ekibi indirimi (%30, en az 3 kişi), davet ödülü

**Şu an olmayanlar:** Ön bilgilendirme formu, mesafeli satış sözleşmesi, cayma hakkı metni, iade politikası. Dijital içerikte "anında ifa" istisnası için kullanıcının onayı alınmıyor. Hukukçu karar verirse WhatsApp'a yönlendirmeden önce "okudum, onaylıyorum" adımı eklenebilir.

**Abonelik:** Aylık paketlerin otomatik yenilenmesi yok; yenileme elle yapılıyor.

---

## 7. GDPR / Data Protection için

- **AB'den kullanıcı:** Kabul ediliyor. Almanca arayüz var ve Almanya'dan gelen ziyaretçiye site otomatik Almanca açılıyor. Bu, AB'ye yönelik hizmet sayılabilir. GDPR m. 3/2 kapsamı ve AB temsilcisi (m. 27) gerekip gerekmediği değerlendirilmeli.
- **Veri işleyenler:** Supabase (AB-Frankfurt), Vercel (Frankfurt; ABD şirketi), Anthropic (ABD), kullanılıyorsa OpenAI (ABD). ABD'ye aktarım için hangi dayanak kullanılacak (Standart Sözleşme Maddeleri veya EU-US Data Privacy Framework)? Sağlayıcıların DPA'ları kontrol edilmeli.
- **Hukuki dayanak eşlemesi (öneri, hukukçu teyit etmeli):**
  - Hesap ve hizmet: sözleşme (6/1-b)
  - Kötüye kullanım izleme, kullanım kaydı, ziyaret istatistiği: meşru menfaat (6/1-f)
  - Ödeme ve fatura: hukuki yükümlülük (6/1-c)
- **Hakların teknik karşılığı:**
  - Erişim ve taşınabilirlik: JSON indirme
  - Silme: hesap silme
  - Düzeltme: hesap ayarları
  - İtiraz: başvuru adresi belirlenmeli
- **Güvenlik önlemleri (m. 32):**
  - Sitede: HTTPS, HSTS, içerik güvenlik politikası (CSP), kullanıcılar arası veri izolasyonu (otomatik testli), istek kaynağı denetimi (CSRF), iç ağa saldırı (SSRF) koruması, gizli anahtarların yalnızca sunucuda tutulması, süreli dosya bağlantıları, düzenli bağımlılık güvenlik taraması, 500'ü aşkın otomatik test
  - **Eksikler:** iki aşamalı giriş (2FA), yazılı veri ihlali prosedürü (72 saat içinde bildirim), bağımsız güvenlik testi
- **Kurumlar için:** Kurum lisansında Academiana veri işleyen olabilir; DPA şablonu gerekebilir.
- **Hesap silme ve yedekler:** Hesap silinince veriler hemen siliniyor; Supabase yedeklerindeki kopyalar, yedeklerin saklama süresi bitince yok oluyor.

---

## B. Hukukçunun sizden (site sahibinden) isteyeceği bilgiler

Bunlar kodda yok; sizin tamamlamanız gerekiyor:
1. Veri sorumlusu ve satıcı bilgileri: şahıs mı, şirket mi; unvan, adres, MERSİS / vergi numarası, KEP adresi, e-posta, telefon
2. KVKK başvuruları için kullanılacak e-posta veya KEP adresi
3. Ödeme yöntemi: havale/EFT mi, ödeme bağlantısı mı? Fatura veya e-arşiv kesiliyor mu? Fiyatlara KDV dâhil mi?
4. Güncel paket fiyatları ve her paketin limitleri (Fiyatlar sayfasındaki tablo iletilebilir)
5. İade konusundaki tercihiniz (ör. ilk X gün içinde ve az kullanıldıysa iade)
6. OpenAI anahtarı canlıda tanımlı mı? (Değilse metinlerde yalnızca Anthropic yazılır)
7. VERBİS için çalışan sayısı ve yıllık ciro; ETBİS kaydı var mı?
8. AB'deki kullanıcılara bilerek hizmet veriliyor mu, yoksa Almanca yalnızca dil seçeneği mi?
9. Kurumlarla yazılı sözleşme yapılıyor mu?
10. Ana sayfadaki görüşler için kişilerden alınan yazılı izinler
11. Sitede yaş sınırı olacak mı? (ör. 18 yaş veya veli izni)

## C. Metinler gelince sitede yapılacaklar
- Yedi metin ayrı sayfalar olarak üç dilde yayımlanacak; "Gizlilik ve Güvenlik" başlığı altında altbilgiye eklenecek.
- Kayıt ve sosyal giriş ekranında onay kutuları hukukçunun istediği şekilde ayrılacak.
- Gerekirse çerez onay şeridi eklenecek.
- Satın alma öncesine ön bilgilendirme ve sözleşme onayı adımı eklenecek.
- Saklama süreleri belirlenince eski kayıtları otomatik silen işlem eklenecek.
- Hukukçu isterse saklanan veri azaltılacak: indirme izinden danışman adı çıkarılabilir, kullanım kaydında tam metin yerine özet tutulabilir.
