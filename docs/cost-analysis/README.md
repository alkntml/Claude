# Paket maliyet analizi (D95, Kasım 2026)

Amaç: abonelik paketlerinde müşteriye 1/3 maliyet payıyla (API maliyeti ≤ KDV hariç fiyatın 1/3’ü) ne vaat edilebileceğini gerçek verilerle bulmak. Tam rapor: `rapor.html` (Artifact: https://claude.ai/artifact/NxjWu7PUjmVLpdmUM6q8xq). Tüm sayılar `corpus/model_out.json`’dan üretilir; elle yazılmaz.

## Korpus (44 tam metin)
- **24 Türkçe makale** — DergiPark resmî OAI-PMH (`harvest_dp.py`, `fetch_dp.py`); eğitim, sağlık, psikoloji, işletme, hukuk, tarih, sanat, iletişim; araştırma, nitel, derleme, bibliyometri. Ölçüm `corpus/dp_measured.json`.
- **12 İngilizce tam metin** — Europe PMC REST JATS XML (`fetch_epmc.py`); nicel, nitel, ölçek geliştirme, sistematik derleme, meta-analiz, kapsam derlemesi. `corpus/epmc_measured.json`.
- **8 tez** — arXiv API (3 YL, 5 doktora; 11–15 sayfalık 2 “master thesis” makale özeti olduğu için dışarıda). `corpus/ax_measured.json`.
- Türkçe tez PDF’i okunamadı: YÖK Açık Bilim Türkiye dışı bağlantıyı kesiyor. Tez uzunluğu alan çalışmalarından: **YL ort. 167 sayfa, doktora ort. 344 sayfa** (kapak, kaynakça, ekler dahil); turist rehberliği tezlerinde ort. 167 sayfa, 145 kaynak.
- PDF’ler telif/boyut nedeniyle depoda yok; bağlantılar JSON’larda. Gerekirse betiklerle yeniden indirilir (ağ izni: arxiv.org, export.arxiv.org, dergipark.org.tr, www.ebi.ac.uk, europepmc.org, api.openalex.org — “Varsayılan” ortama eklendi). DergiPark arama sayfası bot doğrulaması ister: atlatılmaz, yalnızca OAI ve makale sayfaları kullanılır.

## Korpus bulguları (medyan)
| Tür | Belge | Ana metin (kelime) | Kaynak | Sayfa | Kelime/sayfa (yayın) |
|---|---|---|---|---|---|
| Araştırma makalesi | 27 | 5.356 (1.295–15.355) | 34 | 16 | 436 |
| Derleme | 9 | 5.879 (3.497–8.113) | 36 | 15 | 401 |
| YL tezi (arXiv) | 3 | 13.501 | ~120 | 65 | 241 |
| Doktora tezi (arXiv) | 5 | 46.201 | ~224 | 281 | 336 |

## Ölçülen sistem sabitleri
- **Sayfa yoğunluğu** (sistemin Word çıktısı, gerçek Türkçe metin, LibreOffice + Times eşdeğeri yazı tipi; `wpp.cjs`): Türk tez biçimi (12 pt, 1,5 satır, 3/2,5/3,5/2,5 cm) **344 kelime/sayfa**; APA çift satır 287; 1,15 satır makale 482; tek satır 502.
- **Türkçe**: 8,06 karakter/kelime (boşluk dahil). Token oranı varsayımı 3,0 karakter/token (iyimser 3,4, kötümser 2,6; ±%15 belirsiz). Haiku 5.5 tokenizer’ı ~%30 fazla sayar.
- **Bağlam boyutu** (gerçek `buildContext`, `corpus/context_sizes.json`): sistem talimatı 16.451 karakter (≈12 bini kullanım rehberi APP_GUIDE); proje bağlamı (head) 17–66 bin; değişken kısım (tail) 4–57 bin karakter. Makale başı toplam ~38 bin, tez ortası ~104 bin, tez sonu ~140 bin karakter.
- **Fiyatlar** ($/MTok): Sonnet 5.5 2/10 (önbellek okuma %10), Opus 5.5 4/20 (okuma %5), Haiku 5.5 0,10/0,50 (100 bin token üstü istem 0,50/2,50). Önbellek yazma %125.

## Model (`model.py`)
- Alt başlık başına bir “Bölümü yaz” ≈ 1.000 kalıcı kelime (Sonnet) + Haiku tarama kararı; düzeltmelerin yarısı Sonnet yarısı Haiku; soru/plan Sonnet; başlık, kurgu (tezde Opus), bölüm kontrolü (Haiku), kalite jürisi (Opus), özet, matris (kaynak başına Haiku).
- Profiller: **verimli** (taslakların %30’u yeniden, taslak başına 0,5 düzeltme, 0,3 soru, 1 kalite kontrol, matris yok) / **yoğun** (%80, 1,2, 0,6, 3 kalite, tüm kaynaklara matris).
- Senaryolar: iyimser (önbellek isabeti %70), temel (%50), kötümser (%30, çok düşünme).

## Sonuçlar (temel senaryo)
| Eser | Ana metin | Tez biçiminde sayfa | İstek (verimli–yoğun) | Maliyet verimli / yoğun / kötümser-yoğun |
|---|---|---|---|---|
| Lisans bitirme / ödev | 9.000 | 26 | 26–68 | $1,90 / $3,17 / $4,08 |
| Araştırma makalesi | 6.500 | 19 | 26–83 | $2,07 / $3,47 / $4,54 |
| Derleme | 7.000 | 20 | 24–79 | $1,97 / $3,12 / $4,07 |
| Araştırma önerisi / TÜBİTAK | 5.000 | 15 | 31–85 | $2,44 / $3,90 / $5,09 |
| **Yüksek lisans tezi** | 28.000 | 81 | 89–191 | **$7,63 / $12,22 / $16,21** |
| **Doktora tezi** | 55.000 | 160 | 173–335 | **$14,66 / $23,39 / $31,19** |

- Sayfa başı (tez biçimi): **$0,094 (verimli) – $0,15 (yoğun)**.
- Ortalama yazım isteği: **$0,086 temel**, ~$0,11 kötümser (sistem varsayımı `billing.margin.avg_request_usd` 0,07 → düşük).
- YL tezinde maliyetin ~%70’i taslak yazımı (52 çağrı $5,24); soru/plan $0,88; Sonnet düzeltme $0,82; kurgu $0,22; Opus kalite $0,22; Haiku işleri toplam <$0,15.

## Paket bütçeleri ve önerilen vaat (1 $ = 48 TL, KDV %20, pay 1/3)
| Paket | Fiyat | Aylık bütçe | Sayfa/ay (yoğun–verimli) | Önerilen vaat | Mevcut istek sınırı | Bütçeye uyan istek (kötümser–temel) |
|---|---|---|---|---|---|---|
| Ücretsiz | 0 | $1,00 (tavan) | 7–11 | ~5 sayfa deneme taslağı | 10 | 9–12 |
| Basic | 749 TL | $4,33 | 29–46 | **ayda ~25 sayfa** (1 makale veya tezin 2–3 bölümü; YL tezi ~3 ayda) | 40 | 38–51 |
| Pro | 1.349 TL | $7,81 | 52–83 | **ayda ~50 sayfa** (2 makale; YL tezi 1–2 ayda) | 75 | 69–91 |
| Premium | 2.249 TL | $13,02 | 86–138 | **ayda ~85 sayfa** (YL tezi ayda bir; doktora ~2 ayda) | 125 | 115–152 |

Vaatler yoğun profile göre 5’e aşağı yuvarlandı (sık yeniden yazdıran kullanıcıda bile bütçe aşılmaz). Sayfa = Türk tez biçiminde ana metin; kapak, içindekiler, kaynakça, ekler yapay zekâ maliyeti doğurmaz.

## Bulunan tutarsızlıklar (D96’da hepsi uygulandı, Kasım 2026)
1. Literatür matrisi kaynak başına 1 istek sayıyor: 40 kaynak = Pro hakkının %53’ü, gerçek maliyet < $0,05.
2. Paket kartlarında yazım miktarı yok (D49’dan beri istek sayısı da gösterilmiyor).
3. “Aylık 2.000 / 8.000 kaynak taraması” hiç dolmaz, Pro–Premium farkı yaratmaz (tarama ücretsiz veri tabanları; maliyeti ~0).
4. Premium “En yüksek yapay zekâ kullanım hakkı” belirsiz.
5. `avg_request_usd` 0,07 → gerçek ~0,09; maliyet tavanı korur ama kullanıcı istek bitmeden “hak doldu” görebilir.
6. APP_GUIDE (~12 bin karakter) her yazım isteğinde; önbellek kaçınca istek başına ~$0,01 (%5–8). Yalnız kullanım sorusu yolunda tutulabilir.
7. Kur: her %10 kur artışı vaat edilebilecek sayfayı ~%9 düşürür; kur her ay güncellenmeli.

## Mevcut paket verisi (Kasım 2026, veritabanı)
- Fiyatlar (migration 17): Basic 749, Pro 1.349, Premium 2.249 TL/ay. İstek (migration 14): Ücretsiz 10 (+$1 tavan), Basic 40, Pro 75, Premium 125. Token (migration 13): 0,8M / 6M / 60M / 200M. Tarama: 7 / 100 / 2.000 / 8.000. Proje: 1 / 3 / 10 / sınırsız. Depolama: 50 MB / 500 MB / 3 GB / 15 GB. Ücretsiz dışa aktarma TXT/MD.
- Maliyet tavanı `usage.ts costCapUsd`: fiyat / (1+KDV) / kur × 1/3 (paket sınırında açıkça yoksa).
- Özellik kilitleri `features.ts`: Basic+ kalite raporu, istatistik, anket, Zotero, konu bulma; Pro+ matris, dergi, kılavuz, hakem, savunma.

## Doğrulama
Model tahmindir. Yönetim → Maliyet sağlığı (D94) gerçek ortalama istek maliyeti ve önbellek isabetini gösterir; bir ay sonra katsayıları (`model.py` SCEN, WORDS_PER_DRAFT) gerçek veriyle düzelt ve raporu yeniden üret (`python3 -I model.py && python3 -I report.py`).

## Davet ödülleri maliyeti (Kasım 2026)
Ayar (`referral`, varsayılan): davet edilen e-postasını doğrulayınca **iki tarafa** 50 yapay zekâ isteği + 50 kaynak taraması; geçerlilik 60 gün; davet eden ayda en fazla 20 ödül. Kredi `effectiveLimits` ile aylık sınıra eklenir; maliyet tavanı da kredi × `avg_request_usd` kadar artar.

Birim değerler (model, YL tezi akışı): istek başı **$0,064 / $0,086 / $0,114** (iyimser/temel/kötümser), istek başı ~45 bin token, **istek başı ~0,91 sayfa** (tez biçimi). Kaynak taraması yapay zekâ maliyeti doğurmaz (~0).

| | İstek | Sayfa karşılığı | Maliyet (temel) | TL (48) |
|---|---|---|---|---|
| Tek taraf, tek sefer (amaçlanan) | 50 | ~45 | $4,29 (kötümser $5,68) | ~206 TL |
| Bir davet, iki taraf (amaçlanan) | 100 | ~90 | $8,57 (kötümser $11,36) | ~411 TL |
| Bir davet, gerçekte en fazla (hata 1) | 150–200 | ~135–180 | $12,9–17,1 | ~620–820 TL |
| Kötüye kullanım: 1 davet eden, ayda 20 ödül | 1.000/ay (çakışmayla 2.000–3.000) | — | $86/ay (çakışmayla $171–257) | ~4.100–12.300 TL/ay |

Karşılaştırma: tek tarafın ödülü (~45 sayfa) Basic’in aylık vaadinden (25 sayfa) fazla; bir davetin maliyeti (~411 TL) Basic’in KDV hariç aylık gelirinin (624 TL) %66’sı. Davet edilen Basic’e geçip ≥1 ay ödemezse program zarar eder.

Bulunan sorunlar:
1. **Kredi her ay yeniden sayılıyor:** 60 gün geçerli kredi, aktif olduğu her takvim ayında aylık sınıra eklenir (kullanım her ay sıfırlanır). Ödülün verildiği gün ayın ortasıysa 3 ayı kapsar → 50 istek yerine 100–150 istek.
2. **Ücretsiz davetli ödülü kullanamıyor:** Token sınırı (ücretsizde 800 bin/ay) kredilerle artmıyor; istek başı ~41–45 bin tokenla ayda ~18–20 istekte durur (10 temel + ~9 ödül). 50 isteklik vaat ücretsiz pakette fiilen ~9–10 istek; kullanıcı “token limiti” uyarısı görür.
3. **Kötüye kullanım açığı:** Yalnız e-posta doğrulaması yeterli; tek kullanımlık e-postalarla ayda 20 ödül toplanabilir.

Öneri (karar bekliyor): ödül tek seferlik bakiye olsun (her ay yeniden sayılmasın); boyut 10–15 istek/taraf (~9–14 sayfa, ~$0,9–1,3 ≈ 41–62 TL); token sınırı da kredi kadar artsın; aylık üst sınır 20 → 5; isteğe bağlı: davet edenin ödülü davetli ücretli pakete geçince verilsin.
