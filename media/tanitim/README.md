# Tanıtım filmi (D184)

80 saniyelik, 1920×1080, 30 fps sessiz tanıtım filmi. Kaynak tek bir HTML animasyonudur. Her kare `render(t)` ile zamana göre çizilir, bu yüzden kayıt her seferinde aynı sonucu verir.

- Tarayıcıda canlı izlemek için `index.html` dosyasını açın.
- Belirli bir anı görmek için adrese `?t=31` ekleyin.

## Yeniden üretme

Gereken araçlar: Playwright (Chromium) ve ffmpeg.

```bash
cd media/tanitim
node rec.cjs
ffmpeg -framerate 30 -i frames/f%05d.jpg -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -tune animation -movflags +faststart ../../public/video/academiana-tanitim-80.mp4
```

`rec.cjs` kareleri `frames/` klasörüne yazar; bu klasör repoya girmez. Kontrol için tek kare almak isterseniz `node shots.cjs 12 31 58` kullanın.

## İçerik kuralları

- **Örnek veriler:** kaynaklar kurgusaldır (`lib/samples.ts` ile aynı) ve ekranda “Temsilî örnek” diye etiketlenir.
- **Motor çıktıları:** Kaynakça biçimleri ve korelasyon tablosu, sitenin kendi atıf ve istatistik motorlarından alınmıştır.
- **Sayılar:** test sayısı, veri tabanı sayısı, stil sayısı ve çalışma türü sayısı gerçek değerlerdir. Değişince güncelleyin.
- **Yazı tipleri:** Source Serif 4 ve Inter (OFL lisanslı).
