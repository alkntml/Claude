# CLAUDE.md — Academiana

Yapay zekâ destekli akademik araştırma ve yazım platformu (tez, makale, literatür taraması). Arayüz Türkçe (+ İngilizce, Almanca). Sahibi teknik değil: adım adım, sade Türkçe ile anlat; ekran görüntüleriyle ilerlenir.

## Önce oku
- `PROJECT_STATUS.md` — yapılanlar, canlı ortam, çalışma şekli
- `TODO.md` — kalan işler · `DECISIONS.md` — kararlar (D1…D188)
- `docs/ARCHITECTURE.md` — mimari, **ayrıntılı modül haritası, API uçları, SEO ayrıntıları**
- `docs/cost-analysis/README.md` — paket/limit/fiyat/yapay zekâ maliyeti kararlarından önce (D95)

Büyük değişiklik commit’lerinde ve kullanıcı “yedekle” dediğinde bu dört dosyayı (CLAUDE, PROJECT_STATUS, TODO, DECISIONS) güncelle.

## Ortam
- **Canlı:** https://www.academiana.com.tr (Vercel, `fra1`). Ad/adres: `src/lib/site.ts`.
- **Depo:** github.com/alkntml/Claude, `main`’e push = otomatik yayın.
- **Yayın izni (13 Kasım 2026, kullanıcı):** “Yayınla dememi bekleme.” Her iş bittiğinde kontroller (tsc, test, lint, gerekiyorsa build) geçerse ayrıca sormadan `main`’e gönder ve kullanıcıya bildir. Veritabanı migration’ını kullanıcı Supabase’de elle çalıştırır (adımları yaz).
- **Çalışma şekli (13 Kasım 2026, kullanıcı):** “Ne dediysem o olsun, her şeyi yapıp en son bana sorma.” İsteneni aynen uygula; sonunda “ister misiniz / söyleyin” diye soru veya alternatif önerme. Yalnızca gerçekten engelleyici bir belirsizlik varsa işe başlamadan sor. Kullanıcının yapması gereken adımları (ör. SQL) yine yaz.
- **Veritabanı:** Supabase, Frankfurt.
- **Ortam değişkenleri** (yalnızca Vercel; değişince Redeploy): zorunlu `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; isteğe bağlı `OPENAI_API_KEY`, `SPRINGER_API_KEY`, `IEEE_API_KEY`, `ADS_API_KEY`, `ACADEMIC_CONTACT_EMAIL`, `NEXT_PUBLIC_APP_URL`.
- Bulut oturumunda akademik API’lere (OpenAlex, Crossref…) erişim yok: fixture testleri kullan. Anthropic API ve npm açık. Tünel açmak yasak.

## Temel ilkeler (pazarlık konusu değil)
1. **Uydurma yok.** AI kaynak, yazar, DOI, veri veya bulgu üretmez; yalnızca projedeki kaynaklara `[[kaynak:S1]]` ile atıf yapar, yoksa `[KAYNAK GEREKLİ]` / `[VERİ GİRİLECEK]`.
2. **Erişim şeffaflığı:** `sources.access_level` = `metadata` | `abstract` | `full_text`; `full_text` yalnızca sunucuda, metin gerçekten okununca.
3. **İntihal yüzdesi gösterilmez.**
4. **Gizli anahtarlar** koda/commit’e/istemciye girmez. Sohbette paylaşılırsa yazılmaz, yenilenmesi önerilir.
5. **RLS** ile izolasyon. `adminClient` yalnızca sunucuda ve her zaman açık `user_id`/`project_id` filtresiyle.
6. Yapılandırılmış veriye sahte puan/yorum eklenmez; görüşler değiştirilmez (D147).
7. **Hukuki metinler (D154)** `lib/legal/` içindedir; Türkçe metin hukukçunun metnidir, değiştirilmez/kısaltılmaz; metinlerde “taslak”, “yayımdan önce eklenmeli” gibi çalışma notu bulunmaz (D166). Metin değişince `docs.ts`’teki `version` artırılır (Kullanım Koşulları’nda yeniden kabul istenir). Veri işleme, çerez veya satış akışı değişirse ilgili metnin hâlâ doğru olduğu kontrol edilir; yeni çerez/tarayıcı belleği `lib/consent.ts` envanterine eklenir.

## Teknoloji
Next.js 15.5 (App Router) · React 19 · TypeScript strict · Tailwind 3 · TipTap 3 · Supabase · `@anthropic-ai/sdk` (+ isteğe bağlı OpenAI) · docx/pdfkit/unpdf/mammoth · Vitest + PGlite.

**TipTap tuzakları (D116):** tüm @tiptap paketleri aynı sürüm; `useEditor` ayarları ve BubbleMenu `options`/`shouldShow` her çizimde aynı nesne olmalı (yoksa sonsuz döngü); `setContent(doc, { emitUpdate: false })`.

## Komutlar
```bash
npm run dev
npm run build        # büyük değişikliklerde push öncesi
npm run build:demo   # demo/dist/index.html (Artifact olarak yayınlanır)
```
Push öncesi asgari: `npx tsc --noEmit && npm test && npx next lint`

## Dizin özeti
- `src/app/` — sayfalar (`(app)/` oturumlu, `proje/[id]` çalışma alanı, `blog`, `araclar`, `paylasim`) + `api/` uçları
- `src/components/` — landing, dashboard, workspace, admin, ui
- `src/lib/` — iş mantığı: `ai/` (model, bağlam, maliyet, istemler), `citations/`, `sources/`, `editor/`, `export/`, `quality/`, `stats/`, `workflows/`, `import/`, `usage.ts`, `features.ts`, `pricing.ts`, `pages.ts`, `project-access.ts` …
- `src/i18n/` — `core.ts` (istemci), `index.ts` (sunucu), `en.ts`, `de.ts`
- `supabase/migrations/`, `supabase/setup.sql`, `supabase/check_status.sql`
- `public/sw.js` (sürüm değişince `VERSION` artır), `demo/`, `tests/`

Hangi özelliğin hangi dosyada olduğu: `docs/ARCHITECTURE.md` → Modül haritası.

## Kodlama kuralları
- **API rotaları:** `route(name, handler)` sarmalayıcısı (CSRF + hata kaydı), gövde `parseBody(req, zodSchema)`. Route dosyasından yalnızca HTTP metotları ve Next config export edilir; yardımcılar `src/lib`’e. Çalışmaya bağlı yeni uçlar `projectAccess` kullanır (ortak yazım, D115).
- Sunucuya özel modüller `import "server-only"` ile başlar.
- **Metinler:** Türkçe yaz, `t("…")` ile sar (istemci `useT()`, sunucu `getT()`, API `makeT(localeFromRequest(req))`). İngilizcesi `src/i18n/en.ts`, Almancası `src/i18n/de.ts` (içerik dosyalarında `*-de.ts`); `tests/i18n.test.ts` denetler. Kesme işareti `’`.
- **Renkler:** `ink-*` / marka sınıfları, sabit hex yok (gece modu). Görünüm dili D148; vurgu rengi indigo mavi (D163: krem tema geri alındı): dolgu `bg-brand-600` + beyaz yazı, bağlantı `text-brand-600/700`.
- **Atıflar** editörde `citation` düğümüdür; düz metin “(Yazar, Yıl)” üretme.
- **Yapay zekâ:**
  - Model işe göre seçilir (D47): `fast` Haiku, `balanced` Sonnet, `default` Opus — `resolveModel(planId, tier)`, eylemler `ACTION_TIER`.
  - Modeller: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`. `temperature` gönderme, `output_config.effort` kullan; Opus/Sonnet’te `fallbacks: "default"`.
  - Maliyet (D78, D94): sabit bağlam `context`, değişken `contextTail`; `estimateCost` + `recordUsage(..., { usage, costUsd })`; yanıt okunamazsa `throw await spentError(...)`; geçmiş `compactHistory`.
  - Limit `assertWithinLimits`, özellik kilidi `assertFeature`.
- **Hak dolunca salt okunur (D155):** yeni bir API ucu salt okunur kullanıcıya kendiliğinden kapalıdır; yalnızca görüntüleme/indirme/hesap işlemi ise `lib/read-only.ts` → `READ_ONLY_ALLOWED_ROUTES`’a ekle.
- Menü/özellik değişince kullanım metinlerini güncelle: `ai/help.ts`, `guide.ts`, `faq.ts`.
- Tarayıcıdan yeni bir dış adrese bağlanılıyorsa `next.config.ts` CSP’ye ekle (D106).
- Commit/PR metinlerine model kimliği yazma.

## SEO (özet)
Herkese açık sayfalar Türkçe öneksiz, İngilizce `/en` önekli; bağlantılar `@/components/l-link`. Yeni herkese açık sayfa: `PUBLIC_PATHS` (seo.ts) + `PAGE_SEO` (seo-pages.ts) + `generateMetadata() { return pageMeta("/yol") }` + sitemap. Başlık ≤60, açıklama ≤160 karakter. Herkese açık metin değişince `SITE_CONTENT_UPDATED` güncelle. Ayrıntı: `docs/ARCHITECTURE.md`; denetim, içerik planı ve ölçümler `docs/seo/SEO_PLAN.md` (D164).
Blog yazısına sayı/atıf örneği konacaksa ürünün motoruyla üret ve testle denetle; kaynak (`sources`) yalnızca gerçek eser. EN/DE arayüz sözlüğünü layout’tan prop olarak geçirme (sayfa boyutu, D164). Tanıtım sayfaları CDN’den önbelleklenir (D168): sayfa HTML’i kişiye/çereze göre değişmemeli; giriş durumuna bağlı arayüz `useSignedIn` ile istemcide.

## Veritabanı değişikliği
1. `supabase/migrations/` altına yeni sıralı dosya (`2026MMDDhhmmss_ad.sql`); eskileri değiştirme.
2. `supabase/setup.sql`’i yeniden üret.
3. `tests/db.test.ts` (PGlite) ile doğrula.
4. `supabase/check_status.sql`’e kontrol satırı ekle.
5. Canlıya otomatik gitmez: kullanıcıya yalnızca YENİ dosyanın içeriğini Supabase → SQL Editor’de çalıştırmasını adım adım anlat.
