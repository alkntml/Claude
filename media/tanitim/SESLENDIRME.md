# Tanıtım filmi seslendirmesi (ElevenLabs)

Film 80 saniye sürer ve 11 sahneden oluşur. Ses ile görüntünün tam örtüşmesi için **her sahneyi ayrı ayrı seslendirin**. Toplam 11 kısa ses dosyası çıkacak. Metinlerdeki sayılar, doğru okunsun diye yazıyla yazıldı.

## 1. Ses seçimi

**Yöntem:** ElevenLabs → **Voices → Voice Design**.

**Açıklama kutusuna yapıştırılacak metin** (İngilizce açıklama daha iyi sonuç verir):

```
A warm, trustworthy, confident narrator voice in native Turkish with clear Istanbul pronunciation. Age 35–45. Calm, premium commercial / documentary tone: friendly and reassuring, never salesy or shouty. Medium pace, natural pauses, crisp studio-quality recording, no background noise.
```

Voice Library’den hazır bir ses seçecekseniz filtreleri şöyle ayarlayın:

- Language: **Turkish**
- Use case: **Narrative / Advertisement**

## 2. Ayarlar (Text to Speech ekranı)

| Ayar | Değer |
|---|---|
| Model | **Eleven Multilingual v2** |
| Speed | 1.0 (sahne süresine sığmazsa 1.05) |
| Stability | 50 % |
| Similarity | 75 % |
| Style Exaggeration | 15 % |
| Speaker boost | Açık |

## 3. Sahne metinleri

Her satırı ayrı ayrı “Generate” edin. İndirirken dosyalara sırasıyla `01.mp3`, `02.mp3` … `11.mp3` adını verin. Seslendirme, tabloda belirtilen süreyi geçmemeli; geçerse Speed’i biraz artırın.

| Dosya | Filmde | En fazla | Metin |
|---|---|---|---|
| 01 | 0:00–0:06 | 5,5 sn | Her şey bir fikirle başlar. <break time="0.4s" /> Peki o fikri savunmaya kim taşır? <break time="0.4s" /> Siz. Akademiana ile. |
| 02 | 0:06–0:14 | 7,5 sn | Konunuzu tek bir cümleyle yazın. Çalışma türünüze göre, amaçtan bölüm planına kadar yol haritanız hazır. |
| 03 | 0:14–0:23 | 8,5 sn | On altı veri tabanında, iki yüz elli milyondan fazla yayın taranır. Her kaynağın ne kadarının okunduğunu açıkça görürsünüz. |
| 04 | 0:23–0:32 | 9 sn | Asistan yalnızca sizin kaynaklarınıza atıf yapar. Kaynağı eksik cümleyi bulur, kendisi düzeltir ve her bölümü çalışmanızın amacına bağlar. |
| 05 | 0:32–0:39 | 6,5 sn | Kaynak var diye cümle doğru olmaz. <break time="0.3s" /> Her atıf, kaynağın kendi metniyle karşılaştırılır. |
| 06 | 0:39–0:45 | 5,5 sn | Hesabı yapay zekâ değil, istatistik motoru yapar. Tablolarınız APA biçiminde hazır. |
| 07 | 0:45–0:51 | 5,5 sn | On atıf stili. Tek tıkla, metin ve kaynakça birlikte dönüşür. |
| 08 | 0:51–0:59 | 7,5 sn | Teslimden önce şeffaf bir kalite raporu. Kapak, içindekiler ve biçim, kılavuzunuza göre hazır. |
| 09 | 0:59–1:07 | 7,5 sn | Ve kaynakçadan savunmaya: sunumunuz hazırlanır, yapay zekâ jüriyle provanızı yaparsınız. |
| 10 | 1:07–1:16 | 8,5 sn | Güveni sözle değil, kanıtla kazanırız. <break time="0.3s" /> Altı yüz yetmiş üç otomatik test. Sıfır uydurma kaynak. Verileriniz Avrupa’da ve yalnızca sizin erişiminizde. |
| 11 | 1:16–1:20 | 3,5 sn | Akademiana. <break time="0.3s" /> Fikirden savunmaya, tek yerde. |

## Telaffuz ve yazım notları

- **“Akademiana”:** marka bilerek “k” ile yazıldı; İngilizce okunmasın, Türkçe “a-ka-de-mi-a-na” diye okunsun.
- **`<break time="…" />`:** etiketi olduğu gibi bırakın; Multilingual v2 bunu kısa bir duraklama olarak uygular.
- **“zekâ”:** düzeltme işaretini (â) silmeyin.

## 4. Sonrası

11 ses dosyasını sohbete yükleyin. Her biri sahnesinin başlangıcına yerleştirilip filme eklenecek. İstenirse alttan çok hafif bir müzik de eklenip film sitede güncellenecek.
