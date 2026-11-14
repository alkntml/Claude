# Uzun tanıtım filmi: örnek nicel tez, baştan sona (D194)

Sitenin gerçek ekranlarında bir yüksek lisans tezinin baştan sona yazılışı. Kayıt, demo derlemesinin film sürümü üzerinde Playwright ile yapılır: imleç, yazma ve tıklamalar canlıdır.

## Ne gerçek, ne hazırlanmış?

- **Gerçek (sitenin kendi kodu):**
  - Tüm arayüz: sihirbaz, kurgu, çalışma alanı, araçlar, kalite sayfası.
  - Hesaplamalar tarayıcıda sitenin motorlarıyla anında yapılır:
    - istatistik (`lib/stats/apa`), grafikler (`lib/stats/charts`), veri özeti (`lib/files/stats`);
    - atıf biçimleme ve ISNAD dipnotları;
    - iddia çıkarma (`lib/claims`), kalite kontrolü (`lib/quality`), ilerleme (`lib/progress`), literatür haritası (`lib/litmap-graph`).
  - PDF, filmdeki çalışmadan sitenin PDF motoruyla üretilir.
- **Film için hazırlanmış (ekranda yazılıdır):**
  - Kaynaklar kurgusaldır: “Örnek …/Sample …” dergileri, DOI yok (`demo/film/sources.ts`).
  - Veri kurgusaldır: 384 satır, sabit tohumla üretilir (`demo/film/dataset.ts`).
  - Yapay zekâ yanıtları önceden yazılmıştır (`demo/film/answers.ts`), çünkü API anahtarı tarayıcıya konamaz. Kuralları sistemle aynıdır: yalnızca projedeki kaynaklara atıf, bilinmeyen bilgi `[VERİ GİRİLECEK]`.
  - Metinlerdeki her sayı motorun hesapladığı değerdir; `tests/film-thesis.test.ts` bunu denetler.
- **Kalite raporu:** Kaynaklar DOI’siz olduğu için yalnızca “Doğrulanmamış kaynak / DOI eksik” bulguları rapordan çıkarılır. Bu, raporda “Film notu” olarak yazar. Diğer bulgular ve puan motorun kendisidir.

## Yeniden üretme

```bash
node demo/film/build.mjs                                   # demo/film/dist/index.html
cd media/tez-filmi && mkdir -p www/pages && ln -sf ../../../demo/film/dist/index.html www/index.html
FILM_OUT=$PWD npx vitest run tests/film-thesis.test.ts     # (depo kökünden) veri.csv
(cd www && python3 -m http.server 8790 &)
node run.cjs                                               # hızlı deneme; db.json yazar
FILM_DB=$PWD/db.json npx vitest run tests/film-thesis.test.ts   # (depo kökünden) tez.pdf
pdftoppm -jpeg -jpegopt quality=88 -r 110 tez.pdf www/pages/p
MODE=record node record.cjs                                # film.mp4 (1920×1080, 30 fps)
```

- `run.cjs`'te `START=sahne` ile kaydedilmiş bir sahneden devam edilir, `UNTIL=sahne` ile orada durulur.
- Sahneler `scenes.cjs` içindedir.
