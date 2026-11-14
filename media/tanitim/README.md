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

## Seslendirme (D185)
ElevenLabs’te (Multilingual v2) tek dosya hâlinde üretildi; metin `SESLENDIRME.md` dosyasında. Ses dosyası repoya girmez: `vo.mp3` adıyla bu klasöre koyun.

1. **Bölme:** `plan.py` sesin içindeki 11 cümle grubunun zamanlarını tutar. Bu zamanlar, sessizlik tespitiyle (`ffmpeg silencedetect`) bulunmuştur. Gruplar arasındaki boşluklar 0,45 sn’ye indirilir, ses %3 hızlandırılır. Sonuç `plan.json` dosyasına yazılır.
2. **Filmi eşleme:** `rec.cjs`, `plan.json` varsa her sahneyi kendi cümle grubuna eşler. Animasyon parça parça hızlanır ya da yavaşlar (×0,8–×1,3).
3. **Ses ve müzik:** `build_audio.py` sesi cümle gruplarına göre yerleştirir. Alta yumuşak bir pad müziği sentezler (C–Am–F–G); müzik konuşma sırasında kısılır.
4. **Birleştirme:**

```bash
ffmpeg -i vo.mp3 -af atempo=1.03 -ar 48000 -ac 1 vo_fast.wav && python3 plan.py && python3 build_audio.py
ffmpeg -i voice.wav -af "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 voice_n.wav
ffmpeg -i music.wav -af "lowpass=f=2200,aecho=0.8:0.6:120|260:0.25|0.15,loudnorm=I=-35:TP=-8" -ar 48000 music_n.wav
ffmpeg -i voice_n.wav -i music_n.wav -filter_complex "[0][1]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.9" -ac 2 mix.wav
node rec.cjs && ffmpeg -framerate 30 -i frames/f%05d.jpg -i mix.wav -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -tune animation -c:a aac -b:a 160k -shortest -movflags +faststart ../../public/video/academiana-tanitim-80-ses.mp4
```
