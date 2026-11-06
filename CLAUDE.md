# CLAUDE.md — Academiana (eski adı: Akademi AI)

Bu dosya her yeni Claude oturumunun ilk okuması gereken proje kılavuzudur. Ayrıntılar:
- `PROJECT_STATUS.md`: şu ana kadar yapılanlar ve canlı ortam bilgileri
- `TODO.md`: kalan işler ve öncelikler
- `DECISIONS.md`: alınan teknik kararlar ve gerekçeleri
- `docs/ARCHITECTURE.md`: ayrıntılı mimari
- `docs/cost-analysis/README.md`: **paket maliyet analizi (D95)** — 44 tam metinden ölçülen sayfa/kelime, istek/token/maliyet modeli, paket başına 1/3 maliyetle vaat edilebilecek sayfa. Paket, limit, fiyat veya yapay zekâ maliyetiyle ilgili her kararda önce bunu oku.

## Oturum sürekliliği
Bağlam sıfırlanınca önce bu dosyayı, sonra `PROJECT_STATUS.md` (canlı durum + çalışma şekli), `TODO.md` ve `DECISIONS.md`’yi oku. Her büyük değişiklik commit’inde ve kullanıcı “yedekle” dediğinde bu dört dosyayı güncelle.

## Proje
Yapay zekâ destekli akademik araştırma ve yazım platformu (tez, makale, literatür taraması, araştırma önerisi). Türkçe arayüz, Türk kullanıcı kitlesi. Sahibi teknik değil; adım adım, sade Türkçe ile iletişim kurulmalı. Ekran görüntüleriyle ilerler.

- **Canlı site:** https://www.academiana.com.tr (alan adı hosting.com.tr’den alındı, nameserver’lar Vercel DNS’e devredildi; www’siz adres www’ye 308 ile yönlenir). Eski adres: https://akademi-ai-umber.vercel.app
- **Marka:** Academiana. Ad ve adres `src/lib/site.ts` içinde (SITE_NAME, SITE_URL).
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
npm test             # 345 test: birim + PGlite üzerinde RLS entegrasyon
npx next lint
npm run build:demo   # tarayıcı demosu -> demo/dist/index.html (Artifact olarak yayınlanır)
```
Push öncesi asgari kontrol: `npx tsc --noEmit && npm test && npx next lint` (büyük değişikliklerde `npm run build`).

## Dizin haritası
```
src/app/                 Sayfalar + API rotaları
  (app)/                 Oturum gerektiren: panel, yeni, kaynaklar, dosyalar, anketler, konu-bul, hesap, kurum, yonetim
  a/[token]/             Herkese açık anket formu (kimlik bilgisi toplanmaz)
  blog/ + blog/[slug]/   Blog (24 yazı, statik üretim, BlogPosting + Breadcrumb JSON-LD)
  proje/[id]/            Çalışma alanı (+ /kalite)
  paylasim/[token]/      Danışman salt okunur görünümü
  api/                   REST uçları (aşağıda)
src/components/          landing, dashboard, workspace, admin, share, ui
src/lib/
  citations/             Atıf motoru (10 stil, ISNAD 2 metin içi dahil), checks.ts (eksik künye, yinelenen, tutarlılık)
  sources/               providers.ts (12 veri tabanı: +ERIC, DBLP, DataCite — D92; Semantic Scholar kaldırıldı — D93), aggregate.ts, verify.ts, fulltext.ts, input.ts, row.ts
  research.ts            Araştırma planlama (Haiku), arama yürütme, kaynakları projeye ekleme; researchGate: tarama yalnızca gerektiğinde (D75)
  ai/                    registry (model katmanları), anthropic, openai, context (RAG + hafıza; head önbellekte, tail değişken — D78), history (geçmiş kısaltma), cost (önbellekli maliyet), prompts (ACTION_TIER, ACTION_EFFORT)
  workflows/             Çalışma türleri + aşama şablonları (stages.ts); order.ts önerilen yazım sırası (özet en son); structure.ts akademik bölüm yapısı/başlık disiplini (D76); quick-actions.ts aşamaya özel kısayollar (D75)
  blueprint.ts + blueprint-ai.ts  Kurgu modülü (D67): çalışma başında problem/amaç/yöntem/bölüm planı; context.blueprint, yapay zekâ bağlamına girer
  titles.ts              Başlık önerileri (çalışmanın ilk adımı)
  editor/doc.ts          TipTap JSON yardımcıları, markdownToDoc ([[kaynak:S1]] -> citation düğümü)
  editor/sections.ts     Bölüm içi alt başlıklar (D83): sectionTree (numaralı ağaç), sectionDoc/replaceSectionBody (alt başlığa odaklanma), addSubheadings; arayüz components/workspace/subheadings.tsx
  import/                Word’den içe aktarma (D87): html-doc.ts (mammoth HTML → düğüm), references.ts (kaynakça ayrıştırma, atıf bağlama, başlık oturtma), server.ts
  memory-learn.ts        Hafızaya belgeden öğren (D88)
  ai/help.ts             Asistanın kullanım rehberi (APP_GUIDE yalnız kullanım sorusu yolunda; ana asistana APP_GUIDE_SHORT, D96) + kullanım sorusu tanıma (D93); menü/özellik değişince güncelle
  tools/                 Ücretsiz araçlar (D90): index (liste), sample-size, table-parse, server (künye bulma, uydurma kaynak kontrolü); arayüz components/tools, sayfalar app/araclar
  analytics.ts insights.ts  Çerezsiz ölçüm + araç kullanım kaydı; yönetim maliyet/ziyaret özetleri (D90); grafikler components/ui/charts.tsx
  quality/checks.ts      Kural tabanlı kalite kontrol
  export/                model.ts + render-docx/pdf/text
  files/                 extract, chunk, stats (deterministik istatistik)
  payments/              Stripe/iyzico kütüphanesi (şimdilik kullanılmıyor; rotalar kaldırıldı, D48)
  stats/                 dist.ts (dağılımlar), tests.ts (t, ANOVA, regresyon…), apa.ts (APA rapor)
  sources/bib.ts         BibTeX/RIS/CSL-JSON; sources/journals.ts dergi önerisi
  export/presentation.ts Savunma sunumu (.pptx); export/format.ts biçim şablonları
  blog/                  Blog yazıları (posts-1..3.ts; basit Markdown gövde), index.ts (liste, ayrıştırıcı, ilgili yazılar)
  seo.ts                 Dil bazlı adresler (/en öneki), localizedPath, bot tanıma
  seo-pages.ts           Herkese açık sayfaların TR/EN başlık, açıklama, anahtar kelimeleri
  seo-server.ts          buildMeta/pageMeta: canonical, hreflang, Open Graph, Twitter, robots
  structured-data.ts     JSON-LD: Organization, WebSite, SoftwareApplication, ItemList, BreadcrumbList, WebPage
  samples.ts             Örnek çıktılar sayfası içeriği (D72; kurgusal çalışma, örnek veri seti); görünüm components/samples
  faq.ts                 SSS içeriği (TR/EN) — /sss ve ana sayfa; özellik değişince güncelle
  growth.ts pricing.ts expert.ts  Kurum lisansı, krediler, davet; WhatsApp yükseltme bağlantısı + Akademik Ekip İndirimi %30, en az 3 kişi, sınırsız üye (pricing.ts, D70); uzman desteği bağlantıları
  auth-providers.ts      Supabase’de etkin sosyal giriş sağlayıcıları (Google/Apple)
  surveys.ts             Anket modeli: soru şeması, cevap doğrulama, analize hazır tablo, CSV, kod kitabı, hızlı kontrol (surveyLint), fromAiQuestions
  survey-ai.ts           Anket için yapay zekâ: taslak üretme, talimatla düzenleme, soru iyileştirme, inceleme (D66)
  stats/charts.ts + charts/svg.ts  Grafik verisi (deterministik) + APA tarzı SVG çizimi (istemcide PNG’ye çevrilir, editörde `figure` düğümü)
  defense.ts             Savunma provası (jüri soruları, cevap değerlendirme)
  topics.ts + topics-server.ts     Konu bulma: OpenAlex yıllık eğilim, alt konular, Türkiye payı + verilere dayalı öneriler
  quality/stage-review.ts  Bölüm tamamlama kontrolü (kural + yapay zekâ incelemesi)
  quality/repetition.ts  Tekrar analizi (kalıp ifadeler, cümle başlangıçları, benzer cümleler)
  features.ts            Pakete göre özellik kilitleri (FEATURE_MIN_PLAN, hasFeature); sunucu: usage.ts assertFeature; istemci: openUpgrade() → components/upgrade-dialog.tsx
  lock.ts                 getWorkLock: aylık hak durumu (D81: çalışma artık kilitlenmez, yalnızca “hak doldu” şeridi); scramble.ts eski, kullanılmıyor
  autopilot.ts           Yönetici “Otomatik çalışma” modülü kuralları (D77); motor components/admin/autopilot-engine.ts
  usage.ts settings.ts auth.ts api.ts env.ts projects.ts shares.ts
src/i18n/                core.ts (sözlüksüz çekirdek; istemci bunu kullanır), index.ts (core + EN, sunucu), server.ts (getT), client.tsx (useT, LanguageSwitch), en.ts (sözlük)
supabase/migrations/     Sıralı SQL migration'ları
supabase/setup.sql       Tüm migration'ların birleşimi (sıfırdan kurulum)
public/                  brand/ (logo ve amblem PNG), favicon.ico, icons/ (uygulama simgeleri; amblemden üretildi), sw.js (servis çalışanı; sürüm değişince VERSION artır)
demo/                    Sunucusuz tarayıcı demosu (mock API + Next shim'leri)
tests/                   Vitest
```

API uçları: `projects`, `projects/[id]` (+ `stages`, `stages/suggest`, `sources`, `memory`, `quality`, `export`, `shares`), `stages/[id]` (+ `revisions`, `comments`), `sources/search|lookup|[id]|[id]/verify|[id]/fulltext`, `ai/chat` (SSE), `ai/research`, `files` (+ `[id]`, `stats`, `to-source`), `account`, `feedback`, `announcements`, `billing/*` (kaldırıldı; ödeme WhatsApp üzerinden, D48), `admin/[resource]`, `admin/stats`, `share/[token]/comments`, `auth/callback`, `auth/confirm` (token_hash; şifre yenileme D74), `projects/[id]/sources/import|export`, `projects/[id]/matrix|journals|presentation`, `files/[id]/analyze`, `sources/[id]/evidence|attach-file`, `org/join|leave|members`, `account/growth`, `admin/org-member`, `projects/[id]/defense`, `files/[id]/chart`, `surveys` (+ `ai`, `[id]`, `[id]/ai`, `[id]/responses`, `[id]/to-project`), `public/survey/[token]`, `topics/explore`, `projects/[id]/titles`, `projects/[id]/blueprint` (POST yapay zekâ, PUT kaydet/onayla), `stages/[id]/review`, `account/plans` (yükseltme penceresi için sınırlar), `account/data-request` (KVKK talebi), `admin/locks`, `admin/user-export`, `admin/users-list`, `admin/user/[id]`, `admin/referrals`, `projects/[id]/import-doc` (Word içe aktarma), `projects/[id]/memory/learn` (belgeden hafıza), `public/track` (ölçüm), `public/tools/lookup|fake-check|use` (ücretsiz araçlar), `admin/insights` (maliyet ve ziyaret).

## Arama motoru (SEO) altyapısı
- Herkese açık sayfalar iki adreste: Türkçe öneksiz (`/fiyatlar`), İngilizce `/en` önekli (`/en/fiyatlar`). Ara katman `/en/*` isteğini öneksiz sayfaya yeniden yazar ve `x-locale` başlığını koyar; `getLocale()` önce bu başlığa bakar. Uygulama sayfaları (panel, proje…) çerezdeki dili kullanır, önek almaz.
- Tercihi İngilizce olan **insan** ziyaretçi öneksiz sayfadan `/en`’e 307 ile yönlenir; botlar yönlendirilmez (Google her dili ayrı adreste görsün).
- Herkese açık sayfa bağlantıları `@/components/l-link` ile verilir (dile göre /en ekler). Yeni herkese açık sayfa: `PUBLIC_PATHS` (seo.ts) + `PAGE_SEO` (seo-pages.ts) + `generateMetadata() { return pageMeta("/yol") }` + gerekirse JSON-LD + sitemap.
- Blog yazılarının İngilizcesi `blog/en-*.ts` (ayrı İngilizce adres); `postPath(post, locale)`. Paylaşım görseli `/api/og?t=&s=&l=`.
- Sahte puan/yorum (aggregateRating/review) yapılandırılmış veriye eklenmez.

## Kodlama kuralları
- Tüm API rotaları `route(name, handler)` sarmalayıcısını kullanır (CSRF köken kontrolü + hata kaydı). Gövde doğrulaması `parseBody(req, zodSchema)`.
- Route dosyalarından yalnızca HTTP metotları ve Next config (`maxDuration` vb.) export edilir; yardımcılar `src/lib`'e.
- Sunucuya özel modüller `import "server-only"` ile başlar.
- Kullanıcıya dönük tüm metinler Türkçe yazılır ve `t("…")` ile sarılır (istemci: `useT()` — istemci bileşeninde `@/i18n` içe aktarma, sözlük pakete girer; sunucu: `getT()`, API: `makeT(localeFromRequest(req))`). Her yeni metnin İngilizcesi `src/i18n/en.ts`'e eklenir; `tests/i18n.test.ts` eksikleri yakalar. Türkçe eklerde apostrof için `’` kullan (ESLint `no-unescaped-entities`).
- Renkleri `ink-*` / marka sınıflarıyla ver, sabit hex kullanma: gece modu (D61) CSS değişkenleriyle çalışır.
- Atıflar editörde `citation` düğümüdür; asla düz metin "(Yazar, Yıl)" üretme.
- API maliyeti (D78, D94): sabit bağlamı `context`, değişkeni `contextTail` ile ver (önbellek); maliyet `estimateCost(model, in, out, usage)` (fiyatlar `ai/cost.ts` KNOWN_PRICES); kayıt `recordUsage(..., { usage, costUsd })` (önbellek tokenları da yazılır); yanıt okunamazsa `throw await spentError(...)` (maliyet kaybolmaz); sohbet geçmişini `compactHistory` ile gönder.
- Model pakete göre değil işe göre seçilir (D47): basit → `fast` (Haiku), orta → `balanced` (Sonnet), karmaşık → `default` (Opus); asistan eylemleri `ACTION_TIER`’da.
- Yeni AI özelliği: model katmanı `resolveModel(planId, tier)`, kullanım `recordUsage`, limit `assertWithinLimits`.
- Claude modelleri: `claude-opus-5-5` (default/premium), `claude-sonnet-5-5` (balanced), `claude-haiku-5-5` (fast). Sampling parametresi (temperature) gönderme; `output_config.effort` kullan. Opus/Sonnet'te `fallbacks: "default"` açık.
- Commit/PR metinlerine model kimliği yazma.

## Veritabanı değişikliği yaparken
1. `supabase/migrations/` altına yeni, sıralı dosya ekle (`2026MMDDhhmmss_ad.sql`); mevcut migration'ları değiştirme.
2. `supabase/setup.sql`'i yeniden üret (tüm migration'ların birleşimi).
3. `tests/db.test.ts` ile doğrula (PGlite).
4. Canlı veritabanı otomatik güncellenmez: kullanıcıya yalnızca YENİ migration dosyasının içeriğini Supabase → SQL Editor'de çalıştırmasını adım adım anlat.
5. `supabase/check_status.sql`’e yeni migration için bir kontrol satırı ekle (salt okunur durum sorgusu; kullanıcı hangi migration’ların canlıda yapıldığını buradan görür).

## Ortam değişkenleri (Vercel → Settings → Environment Variables)
Zorunlu: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (veya `..._PUBLISHABLE_KEY`), `SUPABASE_SERVICE_ROLE_KEY` (veya `SUPABASE_SECRET_KEY`). Supabase değişkenleri Vercel entegrasyonu tarafından otomatik eklendi.
Önerilen: `ACADEMIC_CONTACT_EMAIL`, `NEXT_PUBLIC_APP_URL`. İsteğe bağlı: `OPENAI_API_KEY`, `CORE_API_KEY`, `STRIPE_*`, `IYZICO_*` (ödeme şimdilik kapalı). Değişiklikten sonra Vercel'de Redeploy gerekir.

## Geliştirme ortamı notu
Claude'un bulut oturumunda akademik API'lere (OpenAlex, Crossref vb.) ağ erişimi yok; adaptörler fixture testleriyle doğrulanır, canlı davranış kullanıcının ekran görüntüleriyle kontrol edilir. Anthropic API ve npm erişilebilir. Dışarıya tünel açmak yasak/engelli.
