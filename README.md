# Akademi AI

Yapay zekâ destekli akademik araştırma ve yazım platformu. Tez, makale, literatür taraması ve araştırma önerisi gibi çalışmaları adım adım yönetir. Kaynakları gerçek akademik veri tabanlarında bulur ve doğrular. Atıf ve kaynakçayı seçilen stile göre kendisi oluşturur.

> **Temel ilke:** Platform kaynak, veri, istatistik veya bulgu uydurmaz. Her kaynağın erişim seviyesi (künye / özet / tam metin) açıkça gösterilir. Yapay zekâ yalnızca projeye eklenmiş kaynaklara atıf yapabilir.

## Özellikler

| Alan | Durum |
|---|---|
| 8 çalışma türü, türe / seviyeye / yönteme göre dinamik yol haritası (35 aşama şablonu) | ✅ |
| Aşama ekleme, silme, yeniden adlandırma, sürükle-bırak sıralama | ✅ |
| Bölüme özel asistan: amaç, adımlar, kurallar, örnek metin, sorular | ✅ |
| Streaming AI sohbet, 13 akademik eylem (yaz, genişlet, kısalt, sentez, hipotez…) | ✅ |
| Proje hafızası (kararlar, kavramlar, hipotezler bölümler arasında korunur) | ✅ |
| 9 akademik veri tabanı adaptörü + Unpaywall, birleştirme, alaka sıralaması | ✅ |
| DOI (Crossref/DataCite), PMID (Europe PMC), arXiv doğrulaması | ✅ |
| Açık erişimli tam metin içe aktarma + RAG (Postgres tam metin araması) | ✅ |
| Atıf motoru: APA 7/6, Chicago, Turabian, MLA, Harvard, Vancouver, IEEE, AMA | ✅ |
| Stil değişince tüm metnin ve kaynakçanın anında dönüşmesi | ✅ |
| Eksik künye, yinelenen kaynak, atıf–kaynakça tutarlılık kontrolü | ✅ |
| Zengin editör: başlıklar, otomatik numaralandırma, tablo, dipnot, yorum, revizyon geçmişi | ✅ |
| DOCX / PDF / Markdown / TXT dışa aktarma (kapak, içindekiler, sayfa no, kaynakça) | ✅ |
| Kalite kontrol: kural tabanlı + isteğe bağlı AI incelemesi | ✅ |
| Dosya yükleme (PDF, DOCX, XLSX, CSV, TXT), metin çıkarma, veri istatistikleri | ✅ |
| Üniversite kılavuzundan bölüm yapısı ve biçim kuralı önerisi | ✅ |
| Paketler, kullanım limitleri, dakikalık hız sınırı | ✅ |
| Stripe abonelik ödemeleri (imza doğrulamalı webhook) | ✅ (canlı test edilmedi) |
| iyzico | ⏳ Arayüz iskeleti var, uygulanmadı |
| Yönetici paneli: kullanıcılar, paketler, modeller, promptlar, veri kaynakları, duyurular, geri bildirim, yardım, hatalar, maliyet | ✅ |
| KVKK/GDPR: veri dışa aktarma, hesap silme | ✅ |
| İntihal kontrolü | ❌ Bilinçli olarak yok; lisanslı servis entegre edilmeden yüzde gösterilmez |

Ayrıntılı mimari ve bilinen sınırlamalar için: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Teknoloji

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · TipTap · Supabase (PostgreSQL, Auth, Storage, RLS) · Anthropic Claude (resmi SDK) + OpenAI (isteğe bağlı) · docx · pdfkit · unpdf · mammoth · Vitest

## Kurulum

### 1. Gereksinimler

- Node.js 20+
- Bir [Supabase](https://supabase.com) projesi
- Bir [Anthropic API](https://console.anthropic.com) anahtarı (veya OpenAI)

### 2. Bağımlılıklar

```bash
npm install
cp .env.example .env.local
```

`.env.local` dosyasını doldurun (tüm değişkenler `.env.example` içinde açıklanmıştır):

| Değişken | Zorunlu | Not |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **Yalnızca sunucuda.** Kullanım kayıtları, ayarlar, yönetim, webhook |
| `ANTHROPIC_API_KEY` | ✅* | *veya `OPENAI_API_KEY` (yönetici panelinde model sağlayıcısını değiştirin) |
| `ACADEMIC_CONTACT_EMAIL` | Önerilir | OpenAlex/Crossref "polite pool", Unpaywall için zorunlu |
| `SEMANTIC_SCHOLAR_API_KEY`, `CORE_API_KEY` | İsteğe bağlı | Yüksek limit / CORE erişimi |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | İsteğe bağlı | Ödemeler |

### 3. Veritabanı

Supabase CLI ile:

```bash
npx supabase link --project-ref <proje-ref>
npx supabase db push
```

veya `supabase/migrations/` altındaki iki SQL dosyasını sırayla Supabase SQL Editor'de çalıştırın. Bu dosyalar tabloları, RLS politikalarını, indeksleri, tetikleyicileri, `user-files` depolama alanını, varsayılan paketleri ve sistem ayarlarını oluşturur.

**Supabase Auth ayarları:** Authentication → URL Configuration bölümünde *Site URL* olarak uygulama adresinizi, *Redirect URLs* listesine `https://<alan-adınız>/api/auth/callback` adresini ekleyin.

### 4. İlk yönetici

Kayıt olduktan sonra SQL Editor'de:

```sql
update public.profiles set role = 'admin' where email = 'siz@ornek.com';
```

### 5. Çalıştırma

```bash
npm run dev        # geliştirme
npm run build && npm start   # üretim
npm test           # birim testleri (44 test)
npm run typecheck
```

Yapılandırma eksikse uygulama `/kurulum` sayfasında hangi değişkenlerin eksik olduğunu gösterir.

### 6. Stripe (isteğe bağlı)

Stripe Dashboard → Developers → Webhooks bölümünde `https://<alan-adınız>/api/billing/webhook` uç noktasını şu olaylarla ekleyin: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Fiyatlar veritabanındaki paketlerden alınır; Stripe'ta önceden ürün oluşturmanız gerekmez.

## Dağıtım

Vercel önerilir (Node.js runtime). Uzun süren rotalar (`/api/ai/chat` 300 sn, araştırma/kalite 120 sn) için planınızın `maxDuration` sınırını kontrol edin. PDF yazı tipleri `assets/fonts` klasöründen okunur ve `next.config.ts` içindeki `outputFileTracingIncludes` ile pakete dahil edilir.

## Proje yapısı

```
src/
  app/                  Sayfalar ve API rotaları
    (app)/              Oturum gerektiren sayfalar (panel, yeni, kaynaklar, dosyalar, hesap, yönetim)
    proje/[id]/         Çalışma alanı ve kalite kontrol
    api/                REST API (projeler, aşamalar, kaynaklar, AI, dosyalar, dışa aktarma, ödeme, yönetim)
  components/           Arayüz bileşenleri (landing, dashboard, workspace, admin, ui)
  lib/
    citations/          Atıf motoru (9 stil) ve tutarlılık kontrolleri
    sources/            Veri tabanı adaptörleri, birleştirme, doğrulama, tam metin
    ai/                 Sağlayıcı soyutlaması (Anthropic, OpenAI), bağlam/RAG, promptlar
    workflows/          Çalışma türleri ve aşama kütüphanesi
    editor/             Belge modeli (TipTap JSON) yardımcıları
    quality/            Kural tabanlı kalite kontrol
    export/             DOCX / PDF / MD / TXT işleyiciler
    files/              Metin çıkarma, parçalama, istatistik
    payments/           Ödeme sağlayıcı arayüzü (Stripe, iyzico iskeleti)
supabase/migrations/    Şema, RLS, seed
tests/                  Vitest birim testleri
```
