# CLAUDE.md — Akademi AI

Bu dosya her yeni Claude oturumunun ilk okuması gereken proje kılavuzudur. Ayrıntılar:
- `PROJECT_STATUS.md`: şu ana kadar yapılanlar ve canlı ortam bilgileri
- `TODO.md`: kalan işler ve öncelikler
- `DECISIONS.md`: alınan teknik kararlar ve gerekçeleri
- `docs/ARCHITECTURE.md`: ayrıntılı mimari

## Oturum sürekliliği
Bağlam sıfırlanınca önce bu dosyayı, sonra `PROJECT_STATUS.md` (canlı durum + çalışma şekli), `TODO.md` ve `DECISIONS.md`’yi oku. Her büyük değişiklik commit’inde ve kullanıcı “yedekle” dediğinde bu dört dosyayı güncelle.

## Proje
Yapay zekâ destekli akademik araştırma ve yazım platformu (tez, makale, literatür taraması, araştırma önerisi). Türkçe arayüz, Türk kullanıcı kitlesi. Sahibi teknik değil; adım adım, sade Türkçe ile iletişim kurulmalı. Ekran görüntüleriyle ilerler.

- **Canlı site:** https://akademi-ai-umber.vercel.app
- **Depo:** github.com/alkntml/Claude, dal `main`. `main`'e her push Vercel'de otomatik yayın başlatır.
- **Veritabanı:** Supabase (Vercel entegrasyonu ile kuruldu), bölge Frankfurt (eu-central-1). Vercel sunucu bölgesi de `fra1` (`vercel.json`).

## Temel ilkeler (pazarlık konusu değil)
1. **Uydurma yok.** AI kaynak, yazar, DOI, veri, istatistik veya bulgu üretmez. Yalnızca projeye eklenmiş kaynaklara `[[kaynak:S1]]` işaretiyle atıf yapar; yoksa `[KAYNAK GEREKLİ]`, veri yoksa `[VERİ GİRİLECEK]`.
2. **Erişim seviyesi şeffaflığı.** `sources.access_level`: `metadata` | `abstract` | `full_text`. `full_text` yalnızca sunucuda, tam metin gerçekten okunduğunda atanır.
3. **İntihal yüzdesi gösterilmez** (lisanslı servis yok).
4. **Gizli anahtarlar** asla koda, commit'e veya istemci paketine girmez. Yalnızca Vercel ortam değişkenleri. Kullanıcı sohbette anahtar paylaşırsa dosyaya yazılmaz; yenilemesi önerilir.
5. Kullanıcı verisi RLS ile izole. Service role (`adminClient`) yalnızca sunucuda; kullanırken her zaman açık `user_id`/`project_id` filtresi.

## Teknoloji
Next.js 15.5 (App Router, Node runtime) · React 19.1 · TypeScript (strict) · Tailwind 3 · Framer Motion · TipTap 2 (tüm @tiptap paketleri aynı sürümde tutulmalı) · Supabase (Postgres + Auth + Storage) · `@anthropic-ai/sdk` (Claude) + OpenAI (REST, isteğe bağlı) · docx · pdfkit (DejaVu fontları `assets/fonts`) · unpdf · mammoth · Vitest · PGlite (DB testleri).

## Komutlar
```bash
npm run dev          # geliştirme
npm run build        # üretim derlemesi (push öncesi çalıştır)
npm run typecheck    # tsc --noEmit
npm test             # 133 test: birim + PGlite üzerinde RLS entegrasyon
npx next lint
npm run build:demo   # tarayıcı demosu -> demo/dist/index.html (Artifact olarak yayınlanır)
```
Push öncesi asgari kontrol: `npx tsc --noEmit && npm test && npx next lint` (büyük değişikliklerde `npm run build`).

## Dizin haritası
```
src/app/                 Sayfalar + API rotaları
  (app)/                 Oturum gerektiren: panel, yeni, kaynaklar, dosyalar, hesap, yonetim
  proje/[id]/            Çalışma alanı (+ /kalite)
  paylasim/[token]/      Danışman salt okunur görünümü
  api/                   REST uçları (aşağıda)
src/components/          landing, dashboard, workspace, admin, share, ui
src/lib/
  citations/             Atıf motoru (9 stil), checks.ts (eksik künye, yinelenen, tutarlılık)
  sources/               providers.ts (10 veri tabanı), aggregate.ts, verify.ts, fulltext.ts, input.ts, row.ts
  research.ts            Araştırma planlama (Haiku), arama yürütme, kaynakları projeye ekleme
  ai/                    registry (model katmanları), anthropic, openai, context (RAG + hafıza), prompts
  workflows/             Çalışma türleri + 35 aşama şablonu (stages.ts)
  editor/doc.ts          TipTap JSON yardımcıları, markdownToDoc ([[kaynak:S1]] -> citation düğümü)
  quality/checks.ts      Kural tabanlı kalite kontrol
  export/                model.ts + render-docx/pdf/text
  files/                 extract, chunk, stats (deterministik istatistik)
  payments/              Stripe (uygulandı), iyzico (iskelet)
  stats/                 dist.ts (dağılımlar), tests.ts (t, ANOVA, regresyon…), apa.ts (APA rapor)
  sources/bib.ts         BibTeX/RIS/CSL-JSON; sources/journals.ts dergi önerisi
  export/presentation.ts Savunma sunumu (.pptx); export/format.ts biçim şablonları
  faq.ts                 SSS içeriği (TR/EN) — /sss ve ana sayfa; özellik değişince güncelle
  growth.ts pricing.ts expert.ts  Kurum lisansı, krediler, davet; öğrenci indirimi; uzman desteği bağlantıları
  auth-providers.ts      Supabase’de etkin sosyal giriş sağlayıcıları (Google/Apple)
  usage.ts settings.ts auth.ts api.ts env.ts projects.ts shares.ts
src/i18n/                index.ts (t, ülke→dil), server.ts (getT), client.tsx (useT, LanguageSwitch), en.ts (sözlük)
supabase/migrations/     Sıralı SQL migration'ları
supabase/setup.sql       Tüm migration'ların birleşimi (sıfırdan kurulum)
demo/                    Sunucusuz tarayıcı demosu (mock API + Next shim'leri)
tests/                   Vitest
```

API uçları: `projects`, `projects/[id]` (+ `stages`, `stages/suggest`, `sources`, `memory`, `quality`, `export`, `shares`), `stages/[id]` (+ `revisions`, `comments`), `sources/search|lookup|[id]|[id]/verify|[id]/fulltext`, `ai/chat` (SSE), `ai/research`, `files` (+ `[id]`, `stats`, `to-source`), `account`, `feedback`, `announcements`, `billing/checkout|webhook|portal`, `admin/[resource]`, `admin/stats`, `share/[token]/comments`, `auth/callback`, `projects/[id]/sources/import|export`, `projects/[id]/matrix|journals|presentation`, `files/[id]/analyze`, `sources/[id]/evidence|attach-file`, `org/join|leave|members`, `account/growth`, `admin/org-member`.

## Kodlama kuralları
- Tüm API rotaları `route(name, handler)` sarmalayıcısını kullanır (CSRF köken kontrolü + hata kaydı). Gövde doğrulaması `parseBody(req, zodSchema)`.
- Route dosyalarından yalnızca HTTP metotları ve Next config (`maxDuration` vb.) export edilir; yardımcılar `src/lib`'e.
- Sunucuya özel modüller `import "server-only"` ile başlar.
- Kullanıcıya dönük tüm metinler Türkçe yazılır ve `t("…")` ile sarılır (istemci: `useT()`, sunucu: `getT()`, API: `makeT(localeFromRequest(req))`). Her yeni metnin İngilizcesi `src/i18n/en.ts`'e eklenir; `tests/i18n.test.ts` eksikleri yakalar. Türkçe eklerde apostrof için `’` kullan (ESLint `no-unescaped-entities`).
- Atıflar editörde `citation` düğümüdür; asla düz metin "(Yazar, Yıl)" üretme.
- Yeni AI özelliği: model katmanı `resolveModel(planId, tier)`, kullanım `recordUsage`, limit `assertWithinLimits`.
- Claude modelleri: `claude-opus-5-5` (default/premium), `claude-sonnet-5-5` (balanced), `claude-haiku-5-5` (fast). Sampling parametresi (temperature) gönderme; `output_config.effort` kullan. Opus/Sonnet'te `fallbacks: "default"` açık.
- Commit/PR metinlerine model kimliği yazma.

## Veritabanı değişikliği yaparken
1. `supabase/migrations/` altına yeni, sıralı dosya ekle (`2026MMDDhhmmss_ad.sql`); mevcut migration'ları değiştirme.
2. `supabase/setup.sql`'i yeniden üret (tüm migration'ların birleşimi).
3. `tests/db.test.ts` ile doğrula (PGlite).
4. Canlı veritabanı otomatik güncellenmez: kullanıcıya yalnızca YENİ migration dosyasının içeriğini Supabase → SQL Editor'de çalıştırmasını adım adım anlat.

## Ortam değişkenleri (Vercel → Settings → Environment Variables)
Zorunlu: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (veya `..._PUBLISHABLE_KEY`), `SUPABASE_SERVICE_ROLE_KEY` (veya `SUPABASE_SECRET_KEY`). Supabase değişkenleri Vercel entegrasyonu tarafından otomatik eklendi.
Önerilen: `ACADEMIC_CONTACT_EMAIL`, `NEXT_PUBLIC_APP_URL`. İsteğe bağlı: `OPENAI_API_KEY`, `SEMANTIC_SCHOLAR_API_KEY`, `CORE_API_KEY`, `STRIPE_*`, `IYZICO_*`. Değişiklikten sonra Vercel'de Redeploy gerekir.

## Geliştirme ortamı notu
Claude'un bulut oturumunda akademik API'lere (OpenAlex, Crossref vb.) ağ erişimi yok; adaptörler fixture testleriyle doğrulanır, canlı davranış kullanıcının ekran görüntüleriyle kontrol edilir. Anthropic API ve npm erişilebilir. Dışarıya tünel açmak yasak/engelli.
