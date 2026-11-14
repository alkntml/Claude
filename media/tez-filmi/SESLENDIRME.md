# Uzun filmin seslendirmesi (D194)

- **Model:** Eleven Multilingual v2. Uzun Türkçe anlatımda en tutarlı modeldir. Metindeki `<break time="2.5s" />` duraklama etiketlerini de destekler.
- **Ses:** 80 saniyelik tanıtım filminde kullanılan ses (iki film aynı sesle anlatılsın).
- **Ayarlar:**
  - Speed: 1.0
  - Stability: 50
  - Similarity: 75
  - Style Exaggeration: 10
  - Speaker Boost: açık
- **Metin:** Dört parça halinde. Her parça ayrı üretilir ve ayrı indirilir.
  - Parçalardaki duraklamalar sahne geçişleridir.
  - Ses, her cümleyi ekranda o işin yapıldığı ana göre videoya yerleştirmek için bu duraklamalardan bölünür.
- **Okunuş:** Marka adı metinde “Akademiana” diye yazılır, doğru okunsun diye.

Sahne başlangıçları (saniye) `marks.json` ile aynıdır:

- Açılış 0
- Sihirbaz 6
- Kurgu 47
- Başlık 68
- Kaynak araması 75
- Kaynağa sor 114
- Matris 124
- Harita 139
- İlk bölüm 154
- Giriş 169
- Kuram ve literatür 236
- Yöntem 293
- Veri 360
- Güvenirlik 381
- Bulgular 423
- Tartışma 557
- İddia denetimi 617
- ISNAD 634
- Kalite 646
- Düzeltme 660
- Savunma 687
- Danışman 717
- PDF 734
- Kapanış 785

Metnin kendisi: aşağıdaki dört parça.

## Parça 1 (0:00–2:34)

```
Şimdi bir yüksek lisans tezini, Akademiana’da baştan sona birlikte yazalım. <break time="2.5s" />
Boş bir hesapla başlıyoruz. Yeni çalışma diyoruz ve tezi seçiyoruz: yüksek lisans, nicel araştırma, ilişkisel tarama. Bölümümüzü ve üniversitemizi yazıyoruz. Konuyu iki satırda anlatıyoruz: akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi. Sağ tarafa bakın; tezin yol haritası, siz seçtikçe kendiliğinden şekilleniyor. Atıf stili, kaynakların yılı, kaç kaynakla çalışacağınız… Hepsini baştan bir kez söylüyorsunuz, sonra sistem hatırlıyor. <break time="2.5s" />
Yazmaya geçmeden önce kurgu geliyor. Aklınızdakini birkaç cümleyle yazıyorsunuz; yapay zekâ problemi, amacı, yöntemi ve her bölümde ne yazılacağını çıkarıyor. Beğenmediğiniz yeri düzeltip onaylıyorsunuz. Bundan sonra her bölüm bu plana göre yazılıyor. <break time="2.5s" />
Başlık önerileri de gerekçesiyle geliyor. Birini seçip devam ediyoruz. <break time="2.5s" />
Şimdi kaynaklar. Burada size bir söz veriyoruz: kaynak uydurulmaz. Arama; OpenAlex, Crossref, TR Dizin, DergiPark gibi veri tabanlarında yapılıyor. Bu filmdeki kaynaklar örnek olsun diye kurgusal; sizin çalışmanızda gerçek kayıtlar gelir. Her kaynağın yanında erişim düzeyi açıkça yazıyor: yalnızca künye mi, özet mi, yoksa tam metin mi okundu. İkinci aramayla ölçek ve yöntem kaynaklarını da ekliyoruz. Kütüphanede on dört kaynak oldu. <break time="2.5s" />
Tam metni okunan bir kaynağa soru da sorabilirsiniz. Cevap, sayfa numarasıyla kanıtını gösteriyor. <break time="2.5s" />
Literatür matrisi, her kaynağın amacını, yöntemini, örneklemini ve bulgularını tek tabloya koyuyor. Yalnızca künyesi olan kaynak için özet uydurulmuyor; o satır boş kalıyor. <break time="2.5s" />
Literatür haritası da kaynaklarınızın birbirine nasıl bağlandığını gösteriyor: konu kümeleri, köprü kaynaklar ve henüz eklemediğiniz temel çalışmalar.
```

## Parça 2 (2:34–6:00)

```
Artık yazıyoruz. Asistana isteğinizi kendi cümlenizle yazıyorsunuz; metin, kurguya ve kütüphanenizdeki kaynaklara dayanıyor. Belgeye ekleyince atıflar gerçek atıf olarak giriyor. <break time="2.5s" />
Problem durumu, amaç ve önem… Her bölümde aynı sakin akış. Dikkat ederseniz metindeki her atıf, kütüphanedeki bir kaynağa bağlı; kaynakça da bu atıflardan kendiliğinden oluşuyor. Yani sonradan “bu kaynak nereden çıktı” diye uğraşmıyorsunuz.
Bir bölümü bitirince “Bölümü tamamladım” diyorsunuz ve sistem o bölümü kontrol ediyor: kaynak bekleyen cümle var mı, tekrar var mı, bölüm amacına uyuyor mu. İyi yanları da, geliştirilecek yerleri de açıkça söylüyor.
Hipotezlere geldik. Kurgudaki sorulardan altı hipotez çıktı ve her biri ileride bir analizle sınanacak. Ardından varsayımlar, sınırlılıklar ve tanımlar. <break time="2.5s" />
Kavramsal ve kuramsal çerçevede asistan, kavramları kaynaklarıyla tanımlıyor ve öz düzenleme yaklaşımını tezin omurgası olarak kuruyor.
Literatür taramasında güzel bir fark var: kaynaklar tek tek özetlenmiyor, temalara göre sentezleniyor. Hangi çalışmalar birbirini destekliyor, nerede ayrışıyorlar; hepsi aynı paragrafta. Ardından literatürdeki boşluk yazılıyor. Tezinizin neden gerekli olduğu da böylece ortaya çıkıyor. Danışmanınızın en çok sorduğu soru da genellikle budur. <break time="2.5s" />
Yöntem bölümü. Araştırma modeli, evren ve örneklem, güç analizi, ölçekler ve analiz planı… Her karar gerekçesiyle yazılıyor. Ölçeklerin geçerlik ve güvenirlik bilgileri, tam metni okunan kaynaktan sayfa numarasıyla geliyor.
Veri analizinde hangi hipotezin hangi testle sınanacağı tek tek eşleniyor. Jüride “bunu neden bu testle yaptınız” sorusuna cevabınız hazır.
Etik bölümünde önemli bir ayrıntı var: etik kurul tarihini ve sayısını asistan bilmiyor, bu yüzden uydurmuyor; yerine “veri girilecek” notu bırakıyor. Bunu biraz sonra birlikte dolduracağız.
```

## Parça 3 (6:00–9:17)

```
Anket bitti. Üç yüz seksen dört öğrencinin yanıtlarını veri dosyası olarak yüklüyoruz. Dosya yüklenir yüklenmez değişkenler okunuyor ve betimsel özet hazır. Bu veri de filmdeki örnek için kurgusal. <break time="2.5s" />
Çalışma alanına dönüp istatistik analizini açıyoruz. Önce ölçeğin güvenirliği: maddeleri seçiyoruz, analizi çalıştırıyoruz. Cronbach alfa, sıfır virgül doksan bir. Burada bir şeyin altını çizelim: bu sayıları yapay zekâ üretmiyor; sitenin istatistik motoru, verinizden hesaplıyor. Tablo, APA biçiminde ve numarasıyla belgeye giriyor. Aynısını ikinci ölçek için de yapıyoruz. <break time="2.5s" />
Bulgular bölümü. Önce betimsel istatistikler ve normallik: ortalama, standart sapma, çarpıklık, basıklık; tek tıkla.
Sonra ilk üç hipotez için korelasyon analizi. Akıllı telefon bağımlılığı ile akademik erteleme arasında orta düzeyde, uyku kalitesiyle ise daha güçlü bir ilişki çıkıyor. Anlamlılık değerleri tabloya kendiliğinden yazılıyor.
Dördüncü hipotez için regresyon: uyku kalitesini bağımlılık ve erteleme ile açıklıyoruz, ekran süresini de kontrol ediyoruz. Model, uyku kalitesindeki farkın yaklaşık yüzde otuz yedisini açıklıyor. İlginç olan şu: ekran süresi tek başına anlamlı değil. Yani mesele, telefonu ne kadar kullandığınız değil; nasıl kullandığınız.
Bunu bir grafikle de gösterelim. Saçılım grafiği, regresyon doğrusuyla birlikte şekil olarak ekleniyor.
Beşinci hipotez için cinsiyete göre te testi; etki büyüklüğü ve güven aralığı da hazır. Altıncı hipotez için sınıf düzeyine göre ANOVA, ardından sütun grafiği.
Tablolar ve şekiller kendiliğinden numaralanıyor; listeleri de dışa aktarırken oluşuyor.
Son olarak asistandan bu çıktıları yorumlamasını istiyoruz. Yorumdaki her sayı, tablodaki sayının aynısı. Asistan yeni bir değer uyduramıyor.
```

## Parça 4 (9:17–13:18)

```
Tartışmada her bulgu, kendi hipotezi ve literatürle karşılaştırılıyor. Uyuşan ve ayrışan çalışmalar açıkça gösteriliyor, sonunda kuramsal çerçeveye dönülüyor. Ardından sonuç ve öneriler.
Özet en sona bırakılıyor ve yalnızca yazılmış bölümlerden derleniyor; böylece metinde olmayan bir bilgi özete sızamıyor. Türkçe özetin yanında İngilizce abstract da hazır. Son olarak kısa bir önsöz. <break time="2.5s" />
İddia denetimi, atıflı her cümleyi kaynağın okunan metniyle karşılaştırıyor. Kaynağı olmayan kesin ifadeleri de işaretliyor; son kararı siz veriyorsunuz. <break time="2.5s" />
Enstitünüz İsnad dipnot mu istiyor? Tek tıkla atıflar dipnota dönüyor. İsterseniz geri alıyorsunuz. <break time="2.5s" />
Kalite kontrolü, tüm çalışmayı birlikte tarıyor. Puan şişirilmiyor. Bu filmde kaynaklar kurgusal olduğu için yalnızca kaynak doğrulaması rapordan çıkarıldı; raporda da bu açıkça yazıyor. <break time="2.5s" />
Rapor kritik bir eksik gösteriyor: etik kurul bilgisi. Hatırlarsanız asistan bunu uydurmamıştı. Bul ve değiştir ile gerçek bilgiyi yazıyoruz, kontrolü yeniden çalıştırıyoruz. Puan yükseliyor. <break time="2.5s" />
Sırada savunma provası. Yapay zekâ jüri, yalnızca tezinizde yazılı olanlardan soru soruyor ve neden sorduğunu da söylüyor. Cevabınızı yazıyorsunuz ya da konuşuyorsunuz; güçlü yanlarınızı, eksiklerinizi ve daha iyi bir cevabın iskeletini görüyorsunuz. Savunma günü sürpriz daha az. <break time="2.5s" />
Danışmanınızı her pakette davet edebilirsiniz. Danışman okur, yorum yazar ama metninizi değiştiremez. İlerleme panelinden hangi bölümün ne durumda olduğunu görür. <break time="2.5s" />
Ve teslim. Dışa aktar, PDF. Kapak, içindekiler, tablo ve şekil listeleri, numaralı başlıklar ve kaynakça kendiliğinden yerleşiyor. Aynı çalışmayı Word ya da LaTeX olarak da alabilirsiniz. Biçimle uğraşmak yerine, işin asıl kısmına, yani düşünmeye ve yazmaya zaman kalıyor. <break time="2.5s" />
Fikirden teslime, tek ekranda. Kaynak uydurmayan, veri uydurmayan bir çalışma alanı. Akademiana.
```
