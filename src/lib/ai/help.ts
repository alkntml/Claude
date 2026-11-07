/**
 * Asistanın sistem hakkındaki soruları yanıtlaması (D93). Kullanıcı “Nereden grafik oluşturabilirim?” gibi
 * kullanım soruları sorduğunda asistan yalnızca bu rehbere dayanarak cevap verir; rehberde olmayan menü veya
 * düğme adı uydurmaz. Açıkça kullanım sorusu olan mesajlar küçük modelle, proje bağlamı olmadan yanıtlanır
 * (ucuz ve hızlı; literatür taraması yapılmaz). Saf modül (test edilebilir).
 */

export const APP_GUIDE = `ACADEMIANA KULLANIM REHBERİ (menü ve düğme adları arayüzdekiyle aynıdır; tırnak içindekiler düğme/menü adıdır)

A) GİRİŞ YAPMADAN (herkese açık site)
- Üst menü: “Özellikler”, “Nasıl çalışır”, “Veri kaynakları”, “Ücretsiz araçlar”, “Örnekler”, “Fiyatlar”, “Kurumlar”, “Blog”, “SSS”; sağda “Giriş yap” ve “Ücretsiz başla” (kayıt). Giriş yapmışsanız “Çalışma alanım”.
- Alt bilgide ayrıca: Yardım merkezi, Akademik dürüstlük, Gizlilik, Kullanım koşulları.
- Şifre unutulduysa: “Giriş yap” sayfasında “Şifremi unuttum” → e-postanıza gelen bağlantıyla yeni şifre.
- Ücretsiz araçlar (giriş gerekmez; “Ücretsiz araçlar” menüsü): Kaynakça oluşturucu (DOI veya başlıktan), Atıf stili dönüştürücü (düz metin, BibTeX, RIS), Örneklem hesaplayıcı (Cochran, Yamane), Cronbach alfa hesaplayıcı, Anket oluşturucu, Uydurma kaynak kontrolü.
- “Davet et, kazan”: davet bağlantınızla biri kaydolduğunda size Ücretsiz paket kadar ek hak (yapay zekâ isteği ve kaynak taraması) tanımlanır.

B) UYGULAMA İÇİ SOL MENÜ (giriş yaptıktan sonra; telefonda sol üstteki “Menü” simgesi)
- “Yeni çalışma” (en üstteki mavi düğme): çalışma türü (tez, makale, literatür taraması, araştırma önerisi, TÜBİTAK/BAP proje önerisi vb.) → akademik seviye → araştırma konusu, disiplin, anahtar kelimeler, yazım dili, atıf stili, üniversite/hedef dergi → “Çalışma alanını oluştur”.
- “Kontrol paneli”: “Bugün ne yapmak istiyorsunuz?” (görev kartları: tez, makale, literatür taraması/sistematik derleme, kanıtla cevap, metin düzeltme/çeviri, kaynakça kontrolü, konu bulma, TÜBİTAK/BAP), devam eden ve tamamlanan çalışmalar, son düzenlenen belgeler, son asistan sohbetleri, “Kullanım durumu” (bu ayki haklar), haftalık kelime hedefi. Çalışma kartındaki menüden “Çalışmayı sil”.
- “Kaynak araştırması”: tüm çalışmalardaki “Kayıtlı kaynaklarım” ve “Veri tabanında ara”; bulunan kaynak “Eklenecek proje” seçilerek bir çalışmaya eklenir.
- “Dosyalarım”: PDF, DOCX, XLSX, CSV, TXT yükleme (sürükle-bırak, dosya başına 25 MB). Yüklemeden ÖNCE sağdaki “Proje” kutusundan dosyanın hangi çalışmaya ait olduğunu seçin (“Projeye bağlama” seçeneği hiçbir çalışmaya bağlamaz); çalışmadaki grafik, istatistik ve asistan yalnızca o çalışmaya bağlı veri dosyalarını görür. Bağlantı sonradan değiştirilemez: yanlış çalışmaya yüklenen dosyayı silip doğru çalışmayı seçerek yeniden yükleyin. “Dosya türü” de seçilebilir (CSV/XLSX otomatik “Veri tablosu”); veri dosyalarında “İstatistik” (betimsel istatistikler, Pearson korelasyonları); makale PDF’ini “Makaleyi kaynak olarak ekle” (DOI ile künye doğrulanır); “İndir”, “Dosyayı sil”.
- “Anketlerim”: “Yeni anket” → “Boş anket” veya “Yapay zekâ ile” (amaç, hedef kitle, değişkenler, uzunluk). Anket düzenleyicide: “Sorular”, “Ayarlar” (onam metni, kapanış tarihi, en fazla cevap), “Cevaplar”; “Demografik sorular ekle”, “Madde öner”, “Yapay zekâ ile iyileştir”, “Anketi incele”, ters puanlanan maddeler; “Yayına al” → “Katılımcı bağlantısı” paylaşılır; “Anketi kapat”, “Kopya oluştur”. Cevaplar: “Ham veri (CSV)”, “Ters maddeler kodlanmış (CSV)”, “Kod kitabı”, “Cevapları çalışmaya veri dosyası olarak aktar” → çalışmayı seç → “Aktar”. Ücretsiz araçta hazırlanan anket “Hesabıma aktar” ile buraya alınır.
- “Konu bulma”: konu/anahtar kelime ve isteğe bağlı bilim dalı → “Keşfet”: yıllara göre yayın sayısı, alt konular ve eğilimleri, Türkiye’den yayınlar, en çok atıf alan çalışmalar, “Verilere dayalı konu önerileri” → “Bu konuyla tez başlat”.
- “Hesap ve abonelik”: “Profil” (ad soyad, varsayılan atıf stili), “Şifremi değiştir”, “Bu ayki kullanım” (yapay zekâ istekleri, kaynak taramaları, depolama, aktif projeler), “Paketler” → “Yükselt” → “WhatsApp ile yükselt” (ödeme WhatsApp üzerinden), “Süreyi uzat”, “Arkadaşını davet et” (davet bağlantısı), “Kurum kodu” ile kurum lisansına katılma / “Kurumdan ayrıl”, “Verilerim (KVKK / GDPR)”: “Verilerimi indir”, “Veri talebi oluştur (KVKK)”, “Hesabımı sil”.
- “Kurumum” (yalnızca kurum yöneticilerine görünür): katılım kodu, bu ayki özet (etkin üye, yapay zekâ isteği, tarama, dışa aktarma), üyeler ve kullanımları, “Yönetici yap” / “Üyeliğe al”, “Kurumdan çıkar”, “Kullanım raporu (CSV)”, “Denetim kaydı” (katılma, ayrılma, çıkarma, rol değişikliği). Kurumun tek yöneticisi ayrılamaz.
- Logonun yanındaki zil simgesi (telefonda üst çubukta): “Bildirimler” (ör. davet ödülü kazandığınızda); kırmızı sayı okunmamış bildirimleri gösterir.
- Menünün altında: dil seçici (Türkçe/English), ay/güneş simgesi (gece/gündüz modu), “Davet et, kazan”, “Geri bildirim” (görüş ve hata bildirimi), dişli simgesi (Hesap), “Çıkış yap”.

C) ÇALIŞMA ALANI (bir çalışmayı açınca)
İlk açılışta: “Adım 1: Çalışmanızın başlığını seçin” (başlık önerileri; “Sonra seçeceğim” ile atlanabilir).
Sol taraf — “Yol haritası” ve bölümler:
- “Haftalık hedef ve teslim tarihi belirle”: haftalık kelime hedefi, teslim tarihi, önerilen takvim.
- “Başlangıç: Kurguyu oluştur” (çalışmanın kurgusu): problem, amaç, araştırma soruları/hipotezler, yöntem, bölüm bölüm yol haritası ve hedef kelime sayıları → “Kurguyu yapay zekâ ile oluştur” → düzenle → “Kurguyu onayla ve başla”. Onaylanınca asistan buna göre yazar.
- “Başlık seçildi” satırından başlık değiştirilir.
- Bölümler numarasıyla listelenir (1 GİRİŞ → 1.1, 1.2 …). Bir bölüme veya alt başlığa tıklayınca editörde yalnızca o kısım açılır. Alt başlığın yanındaki “+”: aynı düzeyde yeni alt başlık. En altta “Bölüm ekle” (hazır bölüm şablonları veya kendi bölümünüz). Bölümler akademik sıraya göre dizilir.
Orta — editör:
- Bölümün üstünde: durum (Taslak / Tamamlandı), kelime sayısı, “Word’den içe aktar” düğmesi. Alt başlıktayken başlığı yeniden adlandırma ve “Alt başlığı sil”.
- Araç çubuğu: geri al, yinele, H2/H3/H4 (alt başlık düzeyleri), kalın, italik, altı çizili, madde listesi, numaralı liste, blok alıntı, ayırıcı, “Dipnot ekle”, “Tablo ekle” (sonra “Satır ekle”, “Sütun ekle”, “Tabloyu sil”, “Tablo 1. Başlık”), görsel/şekil ekleme (“Şekil başlığı ekle”).
- Atıf ekleme: imleci atıf yapılacak yere koyun → sağdaki Kaynaklar sekmesi → kaynağın “Atıf ekle” düğmesi. Atfa tıklayınca: sayfa numarası (doğrudan alıntı), anlatı atfı “Yazar (Yıl)”, “Kaynağı göster”, “Kaynakta doğrula” (iddianın kaynakla karşılaştırılması), “Atfı kaldır”.
- Metin seçince üstünde küçük bir menü (seçim balonu) çıkar: “Çevir”, “Dil denetimi”, “Akademikleştir”, “Kısalt”, “Genişlet”, “Asistana sor”. Asistan işlemleri seçili metne uygulanır; yorum eklemek için metni seçip Yorum sekmesine geçin.
- Otomatik tamamlama: paragrafın sonunda yazmayı bırakınca (≈1 sn) gri renkte bir cümlelik öneri çıkar; “Tab” tümünü, “Ctrl/⌘ + →” bir kelimeyi kabul eder, “Esc” kapatır; telefonda öneriye dokunmak kabul eder. Araç çubuğundaki sihirli değnek düğmesi açar/kapatır. Öneriler sayı, yıl, ad veya atıf içermez; aylık yapay zekâ hakkından düşmez (günlük sınırı vardır).
- “Bölümü tamamladım”: bölüm kontrolü yapılır (“Tamamla ve sıradakine geç”, “Asistanla düzelt” veya “Yine de tamamlandı işaretle”).
- Projede “[KAYNAK GEREKLİ]” işareti varsa üstte uyarı çıkar → “Kaynak bul ve düzelt” (toplu düzeltme).
Sağ taraf — sekmeler (simgelerle): Asistan, Kaynaklar (sayıyla), Hafıza (beyin), Yorum (konuşma balonu), Geçmiş (saat):
- Asistan: mesaj kutusu (Enter gönderir, Shift+Enter yeni satır), mikrofon “Sesle yaz”, “Veri dosyası ekle” (veri özetini asistana verir), “Bu bölümün rehberi”, kısayol düğmeleri bölüme göre değişir: “Alt başlık oluştur” (kaç adet istendiği sorulur; alt başlık içindeyken “Alt-alt başlık oluştur”), “Bölümü yaz”, “Çalışma planı öner”, “Literatür araştır”, “Word’den içe aktar”, genişlet/kısalt, akademik dile çevir, “Tekrarları azalt”, literatür sentezi, araştırma soruları, hipotezler, yöntem, bulguları yorumla, tartışma, özet (abstract), etik kurul belgeleri, ön yazı, tutarlılık kontrolü vb. Asistan cevabındaki taslak “Belgeye ekle” veya “Seçili metnin yerine koy” ile metne alınır. “Sohbeti sil” sohbeti kaldırır.
- Kaynaklar: her kaynakta “Sor” (Kaynağa sor): o makaleye soru sorulur, cevap sayfa numarasıyla gelir; hazır sorular “Kısa özet”, “Yöntem”, “Örneklem”, “Temel bulgular”, “Sınırlılıklar”, “Çalışmamla ilişkisi”, “Alıntılanabilir cümleler”, “Kavram tanımları”; cevap “Atıfla metne ekle” veya “Hafızaya ekle” ile kullanılır. Tam metin yoksa “Açık erişim tam metni getir” veya “PDF’ini yükle”.
- Kaynaklar: “Kaynak ara” → “Literatür araştırması” (konu analizi; “Filtreler”: başlangıç/bitiş yılı, açık erişim) → seçip “Seçilenleri projeye ekle”; “DOI / elle ekle” (DOI, PMID veya arXiv kimliği ya da elle künye); her kaynakta “Atıf ekle”, “Doğrula”, “PDF yükle”, “Tam metni analiz et”, “Kaynağı sil”; “Kaynaklarda filtrele…”; “Literatür matrisi” (kaynak özet tablosu; “Excel için indir (CSV)”, “Belgeye tablo olarak ekle”); Zotero/Mendeley/EndNote için “İçe aktar” ve “Dışa aktar” (BibTeX, RIS, CSL-JSON). Türk veri tabanları (DergiPark, TR Dizin, YÖK Tez) için arama bağlantıları da burada.
- Hafıza: asistanın hatırladığı kararlar, kavramlar, değişkenler, hipotezler; elle kayıt ekleme/silme; “Belgeden öğren” (PDF/Word yükleyip bilgileri hafızaya ekletme).
- Yorum: kendi ve danışman yorumları (“Yorum ekle…”), “Asistanla uygula”, “Çözüldü”.
- Geçmiş: bölümün sürümleri; “Şimdiki hâli sürüm olarak kaydet”, “Geri yükle”, “Sürümü sil”.
Üst çubuk (soldan sağa):
- Sol ok: kontrol paneline dön. Altında kayıt durumu (“Tüm değişiklikler kaydedildi”; kayıt otomatiktir).
- Atıf stili seçimi (APA 7, APA 6, ISNAD 2 (metin içi), Chicago, Turabian, Harvard, MLA 9, Vancouver, IEEE, AMA 11; değişince tüm atıflar ve kaynakça yeniden biçimlenir).
- “Kalite kontrol”: akademik kalite kontrolü sayfası (“Kontrolü başlat”, yapay zekâ incelemesi, metin içi atıf ve doğrulanmış kaynak sayıları; “Puan nasıl hesaplanır?”; “Teslim ve yayın öncesi kontrol listesi” — boş bölüm, [KAYNAK GEREKLİ] işaretleri, iddia denetimi, doğrulanmamış kaynak, özet, anahtar kelimeler, biçim; her maddede “Düzelt →”).
- “Ortak yazarlar”: çalışmayı birlikte yazacağınız kişileri e-postayla davet edin (Pro, Premium ve Tek Proje; en fazla 5 kişi). Roller: “Ortak yazar” (yazar, kaynak ekler, yapay zekâyı kendi paketiyle kullanır) ve “Yorumcu” (okur, yorum yazar). “Davet bağlantısı oluştur” → bağlantı kopyalanır, WhatsApp/e-postayla iletilir; kişi aynı e-postayla giriş yapıp “Daveti kabul et”e basar. Kim hangi bölümdeyse adı bölüm listesinde ve editörün üstünde görünür. Aynı bölümü aynı anda kaydederseniz “Onun sürümünü yükle” / “Benim sürümümle devam et” sorulur; diğer sürüm Geçmiş’te saklanır. Paylaşılan çalışmalar kontrol panelinde “Benimle paylaşılan çalışmalar” altındadır.
- “Paylaş” → “Danışmanla paylaş”: süreli, salt okunur bağlantı; “Yorumlara izin ver”; “Bağlantı oluştur”, “Kopyala”, “İptal et”. Danışmanın yorumları Yorum sekmesine düşer.
- “Araçlar”: “İddia denetimi” (bölümdeki atıflı her cümle kaynağın okunan metniyle karşılaştırılır: destekleniyor / kısmen / desteklenmiyor / okunamadı; pasaj ve sayfa; atıfsız kesin ifadeler işaretlenir; “Cümleye git”, “Asistanla düzelt”, “Sorunlu cümleleri metinde işaretle”; bölüm başlığının yanında da “İddia denetimi” düğmesi var), “Sistematik derleme (PRISMA)” (sekmeler: “1. Protokol”, “2. Kayıt toplama” — Academiana’da ara veya RIS/BibTeX içe aktar, “3. Başlık/özet tarama” — “Yapay zekâ önerisi al”, “Dahil (tam metne geç)”, “Hariç tut” + gerekçe, “4. Tam metin” — “Dahil et”, “Tam metne ulaşılamadı”, “Kaynaklara ekle”, “5. Akış şeması” — “Belgeye şekil olarak ekle”, PNG, CSV), “Literatür haritası” (atıf ağı, “Eksik olabilecek temel çalışmalar” → “Ekle”), “Dil ve çeviri” (sekmeler: “Çeviri” — Türkçe ↔ İngilizce akademik çeviri, Amerikan/İngiliz İngilizcesi, atıf/dipnot/şekil korunur, “Seçimin yerine koy”/“Metni çeviriyle değiştir”/“Sonuna ekle”; “Dil denetimi” — yazım, dil bilgisi, noktalama, üslup önerileri, “Uygula”/“Tümünü uygula”; “Terim sözlüğü” — çalışmaya özel terim karşılıkları), “Araştırmalar ne diyor?” (bir araştırma sorusuna gerçek makale özetlerinden numaralı cevap, uzlaşı göstergesi ve makaleleri çalışmaya ekleme), “Word’den içe aktar”, “Grafik oluştur”, “İstatistik analizi”, “Anket oluştur”, “Hakem yorumlarına cevap” (makale türlerinde), “Savunma provası”. Pakete göre kilitli araçta yükseltme penceresi açılır.
- “Dışa aktar”: “Tüm çalışma” veya “Seçili bölümler” → Word (.docx), PDF, “Düz metin (.txt)” (kapak, içindekiler, numaralandırma, dipnotlar ve kaynakça otomatik); “Savunma sunumu (.pptx)”; “Dergi önerisi ve ön yazı”; “Biçim ve kapak ayarları”.
- “?” simgesi: “Rehberli tur”. Ayar (sürgü) simgesi: “Proje ayarları” (başlık, araştırma konusu, disiplin, anahtar kelimeler, dil; “Kılavuz yükle” ile üniversite/dergi yazım kılavuzu; “Bölüm yapısı öner”; “Proje durumu”: “Tamamlandı olarak işaretle”, “Arşivle”; “Projeyi sil”).
- Telefonda: alttaki sekmeler “Bölümler”, “Metin”, “Asistan”, “Kaynaklar”, “Diğer”; üstteki “Daha fazla” (⋯) menüsünde atıf stili, kalite kontrol, araçlar, proje ayarları ve rehberli tur.

D) ADIM ADIM SIK İŞLER
- Grafik: “Araçlar” → “Grafik oluştur” → “Veri dosyası” seçin (önce Dosyalarım’a yükleyin ya da anket cevaplarını aktarın) → “Grafik türü”, eksen/değişkenler, isteğe bağlı gruplama, hata çubuğu, regresyon doğrusu → “Grafiği oluştur” → “Belgeye ekle” (APA tarzı şekil, imlecin olduğu yere).
- İstatistik analizi: “Araçlar” → “İstatistik analizi” → veri dosyası, analiz (t testleri, ANOVA, korelasyon, regresyon, ki-kare, güvenirlik vb.) ve değişkenler → “Analizi çalıştır” → APA biçimli sonucu “Belgeye ekle” veya “Kopyala”.
- Tablo: editörde “Tablo ekle”; literatür özeti tablosu: Kaynaklar → “Literatür matrisi” → “Belgeye tablo olarak ekle”.
- Şekil/görsel: editör araç çubuğundaki görsel simgesi; başlık için “Şekil başlığı ekle”.
- Dipnot: imleci koyup araç çubuğunda “Dipnot ekle”.
- Word belgesini aktarma: “Araçlar” → “Word’den içe aktar” (veya bölüm başlığındaki düğme) → .docx seçin → “İçe aktar”; başlıklar, tablolar korunur, kaynakça doğrulanıp kaynaklara eklenir, atıflar bağlanır.
- Alt başlık: bölüme girin → Asistan’da “Alt başlık oluştur” → sayı girin; ya da soldaki “+”; ya da editörde H2/H3/H4.
- Kaynak bulma: Kaynaklar sekmesi → “Kaynak ara” ya da Asistan’da “Literatür araştır”; elinizdeki kaynak için “DOI / elle ekle”.
- Kaynakça: ayrıca yazılmaz; atıf yapılan kaynaklardan dışa aktarmada otomatik oluşur. Atıf almayan kaynak kaynakçaya girmez.
- İndirme: “Dışa aktar” → Word veya PDF. Yalnızca bazı bölümler için “Seçili bölümler”.
- Biçim (yazı tipi, punto, satır aralığı, kenar boşlukları, sayfa numarası, kapak, “T.C.” başlığı, her bölüm yeni sayfada): “Dışa aktar” → “Biçim ve kapak ayarları” → “Hazır şablon” veya elle → “Kaydet”.
- Üniversite yazım kılavuzu: Proje ayarları → “Kılavuz yükle”.
- Danışmana gönderme: “Paylaş” → “Danışmanla paylaş” → “Bağlantı oluştur”; ya da Word olarak indirip gönderin.
- Savunma: “Dışa aktar” → “Savunma sunumu (.pptx)”; prova için “Araçlar” → “Savunma provası” (jüri soruları, sesli veya yazılı cevap, puan ve geri bildirim).
- Dergi seçimi: “Dışa aktar” → “Dergi önerisi ve ön yazı” → dergi arayın → “Bu dergi için ön yazı hazırla”, “Derginin yazar kılavuzunu yükle” → “Kılavuza uygunluk kontrol listesi”.
- Hakem yorumları: “Araçlar” → “Hakem yorumlarına cevap” → yorumları yapıştırın → “Cevap mektubu hazırla”.
- Anket verisini analize almak: Anketlerim → anketi açın → “Cevaplar” → “Cevapları çalışmaya veri dosyası olarak aktar” → çalışmayı seçip “Aktar”.
- Eski sürüme dönmek: sağdaki Geçmiş sekmesi → sürüm → “Geri yükle”.
- Kaynak doğrulamak: atfa tıklayıp “Kaynakta doğrula” ya da Kaynaklar’da “Doğrula”.
- Hak/kota: Kontrol paneli → “Kullanım durumu” veya Hesap ve abonelik → “Bu ayki kullanım”; haklar her ayın başında yenilenir; üretilen metni sonradan silmek kullanılan hakkı geri vermez; hak dolsa da çalışmalar açılır, düzenlenir ve indirilir.
- Paket başına aylık yazım (yaklaşık, Türk tez biçiminde ana metin sayfası): Ücretsiz 5 sayfa deneme, Basic 25, Pro 50, Premium 85 sayfa. Literatür matrisi istek hakkından düşmez.
- Paket yükseltme: Hesap ve abonelik → “Paketler” → “Yükselt” → “WhatsApp ile yükselt”.
- “Tek Proje” paketi: tek ödeme (3.999 TL), süresiz; tek bir çalışmada tüm özellikler ve sınırsız yapay zekâ. Pakete bağlı çalışma silinemez, türü değiştirilemez, ikinci çalışma açılamaz.
- Dil ve görünüm: sol menünün altındaki dil seçici ve ay/güneş simgesi.
- Hesabı silme: Hesap ve abonelik → “Hesabımı sil”.
- Sorun bildirme veya öneri: sol menüde “Geri bildirim”.`;

/**
 * Ana asistana giden kısa rehber (D96): tam rehber (~12 bin karakter) yalnızca kullanım sorusu yolunda gider; yazım
 * isteklerinde bu özet yeterlidir ve maliyeti düşürür. Özet, en sık sorulan yerleri arayüzdeki adlarıyla verir.
 */
export const APP_GUIDE_SHORT = `ACADEMIANA KISA REHBER (adlar arayüzdekiyle aynı):
- Üst çubuk: atıf stili seçimi, “Kalite kontrol”, “Ortak yazarlar” (davet, roller), “Paylaş” → “Danışmanla paylaş”, “Araçlar” (“İddia denetimi”, “Sistematik derleme (PRISMA)”, “Literatür haritası”, “Dil ve çeviri”, “Araştırmalar ne diyor?”, “Word’den içe aktar”, “Grafik oluştur”, “İstatistik analizi”, “Anket oluştur”, “Hakem yorumlarına cevap”, “Savunma provası”), “Dışa aktar” (Word, PDF, “Tüm çalışma” / “Seçili bölümler”, “Savunma sunumu (.pptx)”, “Dergi önerisi ve ön yazı”, “Biçim ve kapak ayarları”), “?” Rehberli tur, ayar simgesi Proje ayarları (“Kılavuz yükle”).
- Sol: bölümler ve alt başlıklar (“+” aynı düzeyde alt başlık, “Bölüm ekle”), “Başlangıç: Kurguyu oluştur”, “Haftalık hedef ve teslim tarihi belirle”.
- Sağ sekmeler: Asistan, Kaynaklar (“Kaynak ara”, “DOI / elle ekle”, “Atıf ekle”, “Sor” (kaynağa soru), “Literatür matrisi”, Zotero için “İçe aktar”/“Dışa aktar”), Hafıza (“Belgeden öğren”), Yorum, Geçmiş (“Geri yükle”).
- Editör: metin seçince balon (“Çevir”, “Dil denetimi”, “Akademikleştir”…); paragraf sonunda gri öneri, “Tab” ile kabul.
- Editör: “Tablo ekle”, “Dipnot ekle”, şekil başlığı, H2/H3/H4. Grafik ve analiz için veri dosyası önce sol menüdeki “Dosyalarım”a çalışma seçilerek yüklenir.
- Sol menü (uygulama): “Yeni çalışma”, “Kontrol paneli”, “Kaynak araştırması”, “Dosyalarım”, “Anketlerim”, “Konu bulma”, “Hesap ve abonelik” (paket, “Yükselt”, şifre).`;

export const HELP_SYSTEM = `Sen Academiana’nın kullanım asistanısın. Kullanıcı platformun nasıl kullanılacağını soruyor.
KURALLAR:
- YALNIZCA aşağıdaki rehbere dayanarak cevap ver. Rehberde olmayan menü, düğme, özellik veya sayfa adı UYDURMA. Rehberde cevap yoksa bunu açıkça söyle ve “Rehberli tur” (çalışma alanında “?” simgesi) ile sol menüdeki “Geri bildirim” düğmesini öner.
- Kısa ve adım adım cevap ver: “Üstte Araçlar → Grafik oluştur → …” gibi; yerini de söyle (sol menü, üst çubuk, sağ sekme, editör araç çubuğu). Düğme adlarını tırnak içinde, arayüzdeki gibi yaz. En fazla 7 adım.
- Yönetici paneli veya yöneticiye özel ayarlar sorulursa bunların kullanıcıya açık olmadığını söyle; ayrıntı verme.
- Akademik metin yazma, kaynak üretme veya taslak verme; :::taslak, :::eksik, :::hafiza blokları KULLANMA.
- Kullanıcının dilinde yanıt ver (Türkçe soruya Türkçe, İngilizce soruya İngilizce; İngilizce yanıtta menü adlarını Türkçe adıyla birlikte ver).

${APP_GUIDE}`;

const fold = (s: string) => s.toLocaleLowerCase("tr").replace(/\s+/g, " ").trim();

const WHERE = /(nereden|nerden|nerede|nereye|hangi (menü|sekme|düğme|buton|tuş|ekran|sayfa)|where (can|do|is|are)|which (menu|button|tab|page))/;
const HOW = /(nasıl|how (do|can|to)|how i)/;
const VERB = /(indir|geri dön|dönerim|dönebil|gönder|bağla|değiş|dışa aktar|içe aktar|aktar(ı|a)?r|yükle|ekle|oluştur|sil(e|i)|paylaş|değiştir|kullan|kaydet|geri al|ayarla|açabil|açarım|açılır|bulabil|bulurum|ulaş|export|download|import|upload|create|add|share|change|delete|remove|use|save|open|find)/;
const FEATURE = /(grafi[kğ]|tablo|şekil|anket|kayna[kğ]|atıf|kaynakça|pdf|word|docx|dosya|hafıza|kalite|danışman|sunum|alt başlık|bölüm|stil|apa|isnad|şablon|kapak|içindekiler|istatistik|analiz|hesa[pb]|paket|şifre|gece modu|tema|dil |proje|çalışma|matris|dipnot|zotero|mendeley|endnote|bibtex|kurgu|sürüm|yorum|chart|graph|table|figure|survey|source|citation|reference|bibliography|export|template|account|plan|password|memory|footnote|çevir|çeviri|dil denetim|terim sözlü|ortak yazar|yorumcu|otomatik tamamla|kaynağa sor|araştırmalar ne diyor|uzlaşı|translat|proofread|glossary|co-?author|autocomplete|consensus|iddia denetim|prisma|sistematik derleme|literatür harita|kontrol listesi|claim audit|systematic review|literature map)/;
const UI = /(düğme|buton|tuş|menü|sekme|ekran|araçlar|ayarlar|sistem|site|platform|uygulama|academiana|button|menu|tab|settings)/;
/** Yalnızca platformdaki bir araçla yapılabilen işler (asistan sohbette grafik çizemez, dosya indiremez) */
const TOOL = /(grafi[kğ]|şekil oluştur|anket|istatistik|analiz yap|dışa aktar|indir|pdf|word|docx|içe aktar|şablon|kapak|içindekiler|atıf stil|paylaş|matris|sunum|zotero|mendeley|endnote|dil ve çeviri|araştırmalar ne diyor|chart|graph|survey|export|download)/;
const MAKE = /(yap|çiz|hazırla|çıkar|koy|oluştur|ekle|indir|aktar|paylaş|make|draw|build|create|add|get)/;
const ASKY = /(\?|istiyorum|isterim|lazım|gerek|\bm[iı]\b|\bm[iı]s[iı]n|\bm[iı]y[iı]m|nasıl|want|need|can i|how)/;
/** Metindeki içerikle ilgili sorular (ör. “bu bilgiyi nereden aldın?”, “nerede eksik var?”) kullanım sorusu değildir */
const NOT_HELP = /(nereden (aldın|buldun|geliyor|çıkardın)|kaynağı ne|eksik|hata(lı)?|yanlış|tutarsız|zayıf|yaz(ar mısın|abilir misin|ar mısın)|düzelt)/;

/** Mesaj açıkça bir kullanım sorusu mu? (asistan bunu küçük modelle rehbere göre yanıtlar) */
export function isHelpQuestion(message: string): boolean {
  const m = fold(message);
  if (m.length > 300 || NOT_HELP.test(m)) return false;
  const asks = WHERE.test(m) || (HOW.test(m) && VERB.test(m));
  if (asks && (FEATURE.test(m) || UI.test(m))) return true;
  // “Grafik oluşturmak istiyorum”, “grafik çizebilir misin?” gibi araç gerektiren istekler
  return TOOL.test(m) && MAKE.test(m) && ASKY.test(m);
}
