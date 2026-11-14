# Yönetici erişimi rehberi (D188, iç kullanım)

Bu, 5,5 dakikalık sessiz bir anlatım videosudur. Yönetim panelinde neyin, hangi veriye dayanarak görüldüğünü ve hangi önlemlerin alındığını 15 bölümde anlatır. Siteye konmaz.

## İçerik nereden geldi
Her madde koddan doğrulandı:

- **Panel ve erişim:** `components/admin/*`, `app/api/admin/*`, `lib/admin-resources.ts`, `lib/auth.ts` (`requireAdmin`)
- **Kayıt tutma:** `lib/analytics.ts` (ziyaretçi özeti), `lib/devices.ts`, `lib/single-watch.ts`, `lib/pii.ts` (maskeleme), `lib/data-export.ts`
- **Veritabanı kuralları:** `supabase/setup.sql` (`is_admin`, RLS, `protect_profile_privileged_columns`)

Ekrandaki kişi ve sayılar temsilîdir.

## Üretme
Yazı tipleri ve logo `media/tanitim/` klasöründen kopyalanır.

```bash
cp -r ../tanitim/fonts ../tanitim/academiana-logo-transparent.png ../tanitim/academiana-emblem.png .
node rec.cjs
ffmpeg -framerate 30 -i frames/f%05d.jpg -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -tune stillimage -movflags +faststart academiana-yonetici-rehberi.mp4
```

## Güncel tutma
Panelde bir sekme, bir erişim kuralı veya saklama süresi değişirse ilgili slaydı (`admin.html` → `S` dizisi) güncelleyin.
