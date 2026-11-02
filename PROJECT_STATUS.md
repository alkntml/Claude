# Proje Durumu

_Son güncelleme: 1 Kasım 2026 (gece) — her büyük değişiklik commit’inde güncellenir_

## Canlı ortam
| Bileşen | Durum | Ayrıntı |
|---|---|---|
| Site | ✅ Yayında | https://akademi-ai-umber.vercel.app (Vercel projesi `akademi-ai`, Hobby plan, bölge fra1) |
| Veritabanı | ✅ Kuruldu | Supabase `akademi_ai`, Free plan, Frankfurt. `supabase/setup.sql` çalıştırıldı (ilk 4 migration). Migration 7 (`20261104000007_orgs_referrals.sql`) kullanıcı tarafından çalıştırıldı ✅ (Success). Migration 5 (`no_placeholder_claims`) ve 6 (`source_summary`) için kullanıcı “daha önce de çalıştırdım” dedi ama hangisi olduğu net değil — emin olmak için ikisi de tekrar çalıştırılabilir (güvenli: 5 `replace`, 6 `if not exists`) |
| Kimlik doğrulama | ✅ Çalışıyor | Site URL ve Redirect URL (`/api/auth/callback`) ayarlandı. Sahip kayıt oldu |
| Yönetici | ✅ | Sahibin hesabı `role = admin`, `plan_id = premium` |
| Claude API | ✅ Çalışıyor | Opus 5.5 ve Haiku 5.5 canlı anahtarla test edildi. Asistan canlı sitede yanıt veriyor |
| Akademik veri tabanı araması | ✅ Kullanıcı canlıda çalıştığını doğruladı | Otomatik araştırma ve yazım çalışıyor. Sonraki eklenen özellikler (Türkiye kaynakları, sunum, istatistik, dergi önerisi, kurum lisansı, davet) canlıda henüz denenmedi |
| Ödeme | ❌ Yapılandırılmadı | Stripe kodu hazır, anahtar yok. iyzico uygulanmadı |
| E-posta | ⚠️ Supabase varsayılanı | Saatlik gönderim limiti düşük; özel SMTP (Resend vb.) önerildi |
| Demo | ✅ | Sunucusuz tarayıcı demosu: https://claude.ai/artifact/6ckTR9LQUpjPv2jNnnrhgG (AI, arama ve dışa aktarma kapalı) |

- Migration 8 (`20261105000008_grants_surveys.sql`) canlı veritabanında çalıştırıldı (2026-11-02, Success).

## Tamamlanan özellikler
**Akademik süreç**
- 8 çalışma türü; seviye ve yönteme göre dinamik yol haritası (35 aşama şablonu)
- Aşama ekleme, silme, yeniden adlandırma, sürükle-bırak sıralama, ilerleme yüzdesi
- Her aşamada rehber: amaç, adımlar, yazım kuralları, örnek metin, asistan soruları
- Üniversite kılavuzu yükleme → AI ile bölüm yapısı ve biçim kuralı önerisi

**Yapay zekâ**
- Streaming asistan, 13 akademik eylem (yaz, genişlet, kısalt, akademik dil, sentez, hipotez, yöntem, tutarlılık…)
- Proje hafızası (`:::hafiza` bloklarıyla otomatik + elle)
- RAG: tam metin parçaları ve yüklenen dosyalar (Postgres FTS)
- **Sohbet içi otomatik literatür araştırması:** Haiku araştırma gerekip gerekmediğine karar verir, sorgu üretir, veri tabanlarında arar, en iyi 8 kaynağı doğrulayıp projeye ekler ve aynı yanıtta atıf yapar
- Ayrı "Literatür araştır" penceresi (kullanıcı seçerek ekler)
- Sistem talimatı: listede olmayan eser adı önerilerde bile anılmaz
- **Bölüm/alt başlık bazlı kaynak taraması:** her yeni alt konuda ilgili kaynak yetersizse yeniden arar (tez başına 50+ kaynak), yazmadan önce açık erişimli tam metinleri okur ve atıflara yayındaki sayfa numarasını ekler
- **Türk kaynakları:** Türkçe/Türkiye adresli yayın araması (DergiPark etiketi), DergiPark/TR Dizin/YÖK Tez bağlantıları, YÖK tez künyesi (APA 7)
- **Zotero/Mendeley/EndNote:** BibTeX, RIS, CSL-JSON içe aktarma; BibTeX/RIS dışa aktarma
- **İstatistik analizleri:** t testleri, ANOVA, korelasyon, regresyon, ki-kare, Cronbach α, Mann-Whitney, Kruskal-Wallis; APA 7 tablo ve cümle belgeye eklenir
- **Savunma sunumu (.pptx), Özet + İngilizce Abstract, etik kurul belgeleri, dergi önerisi + ön yazı + kılavuz kontrol listesi**
- **Kurum lisansı** (katılım kodu, kurum yöneticisi paneli), **öğrenci indirimi**, **davet programı** (kredi), **uzman desteği** (dermanlik.com.tr)
- **Alt başlıklarla yaz:** alt başlık listesi (asistan önerebilir) sırayla araştırılıp okunup yazılır, sonunda özet; adımlı ilerleme çubuğu (Karar → Arama → Doğrulama → Okuma → Yazım → Eksikler)
- **Atıf doğrulama:** atfa tıkla → "Kaynakta doğrula": kaynaktaki ilgili bölümler sayfasıyla ve AI değerlendirmesi (destekliyor/kısmen/desteklemiyor/yetersiz)
- **Toplu [KAYNAK GEREKLİ] düzeltme:** projedeki tüm işaretli paragraflar için kaynak arama + onaylı düzeltme
- **Literatür matrisi** (amaç/yöntem/örneklem/bulgular; CSV ve belgeye tablo), **PDF hatırlatma** (kapalı erişimli kaynağa PDF bağlama)
- **Danışman yorumunu asistanla uygulama**, **sesle not** (mikrofon), **çevrimdışı kayıt güvencesi**, **rehberli tur**
- **Word/PDF biçim şablonu ve tez kapağı**, **haftalık hedef + teslim takvimi**, **%80 limit uyarıları**
- **Kaynakçada kullanım yerleri:** kayda tıklayınca hangi bölüm/alt başlıkta, hangi cümlede ve hangi sayfayla atıf yapıldığı görünür; "Git" ile metindeki atfa gidilir
- **Desteksiz kesin iddia yazılmaz:** `[KAYNAK GEREKLİ]` yer tutucusu yerine model eksik konuları `:::eksik` ile bildirir; sunucu bu konular için ikinci bir arama yapıp kaynak ekler, "Taslağı yeni kaynaklarla güncelle" düğmesi çıkar

**Kaynaklar**
- 10 adaptör: OpenAlex, Crossref, Semantic Scholar, Europe PMC/PubMed, arXiv, DOAJ, CORE, OpenAIRE, Google Books, Unpaywall
- Birleştirme ve yinelenen ayıklama, alaka puanı
- DOI (Crossref → DataCite), PMID, arXiv doğrulama; eksik künye tamamlama
- Açık erişimli tam metin, arka planda (`after()`) analiz

**Yazım**
- Atıf motoru: APA 7/6, Chicago ve Turabian (yazar-tarih), MLA, Harvard, Vancouver, IEEE, AMA; TR/EN terimler; 2020a/b ayrıştırma
- Stil değişince tüm metin ve kaynakça anında dönüşür
- TipTap editör: başlık numaralandırma, tablo, şekil başlığı, dipnot, yorum, revizyon geçmişi, otomatik kayıt
- Dışa aktarma: DOCX (içindekiler, dipnot, sayfa no), PDF (Türkçe font, sayfa numaralı içindekiler), MD, TXT
- Kalite kontrol: kural tabanlı + isteğe bağlı AI incelemesi

**Platform**
- **İki dil (TR/EN):** ziyaretçi Türkiye dışından geliyorsa site İngilizce, Türkiye’den geliyorsa Türkçe açılır; TR/EN düğmesi. ~1100 metinlik sözlük (`src/i18n/en.ts`)
- **Mobil çalışma alanı:** alt gezinme çubuğu, kaydırmalı araç çubuğu, sade asistan giriş kutusu, ⋯ menüsü
- Kontrol paneli, kaynak kütüphanesi, dosyalar (PDF/DOCX/XLSX/CSV/TXT + deterministik istatistik)
- Danışman paylaşım bağlantısı (salt okunur, süreli, iptal edilebilir, yorum)
- Paketler ve limitler (AI isteği, token, arama, proje, depolama, dışa aktarma biçimi), dakikalık hız sınırı
- Yönetici paneli: genel bakış/maliyet, kullanıcılar, paketler, model ve prompt ayarları, veri kaynakları, duyurular, geri bildirim, yardım, hata kayıtları
- KVKK: veri dışa aktarma (JSON), hesap silme
- **Sık sorulan sorular:** `/sss` (7 grup, 38 soru, TR/EN, FAQPage JSON-LD), ana sayfada 8 öne çıkan soru; içerik `src/lib/faq.ts`
- **Adım adım akış:** çalışma ilk açıldığında başlık önerileri + seçim (`context.titleChosen`); önerilen yazım sırası (özet/abstract en son), “Sıradaki” etiketi, “Bölümü tamamladım” → sıradaki bölüme geçiş, tamamlanan bölümlerde yeşil tik ve “x/y bölüm tamamlandı”; özet erken açılırsa uyarı. Rehberli tur başlık penceresinden sonra açılır. “Bölümü tamamladım” önce bölüm kontrolü yapar (kaynak/veri yer tutucuları, tekrar, dil + yapay zekânın amaç/kurallara uygunluk incelemesi): uygunsa tamamlanır; değilse sorunlar, “Asistanla düzelt” veya “Yine de tamamlandı işaretle”. Tamamlanan bölümlerde kelime sayısı da görünür. Bölüm kontrolü tüm paketlerde Haiku ile; Ücretsiz ve Basic’te aylık haktan düşmez (günde 40 sınırı), Pro ve Premium’da 1 istek sayılır.
- **TÜBİTAK / BAP proje önerisi:** yeni çalışma türü `grant_proposal` (özet, özgün değer, yöntem, proje yönetimi, yaygın etki, bütçe); program seçimi (2209-A/B, 1001, 3501, BAP, burs) `projects.context.program`
- **Hakem yorumlarına cevap:** Araçlar → yorumları yapıştır → `reviewer_response` eylemi, madde madde cevap mektubu ([YAPILACAK: …] işaretleri)
- **Savunma provası:** Araçlar → yapay zekâ jüri soruları (tutum/sayı/odak), yazılı veya sesli cevap, puan + güçlü/eksik yönler + iskelet + takip sorusu
- **Anket oluşturucu:** `/anketler`; tek/çoklu seçim, Likert (5/7, ters madde), sayı, metin, bilgi; onam metni; herkese açık bağlantı `/a/[token]`; cevap özeti; CSV (ham / ters kodlanmış), kod kitabı; tek tıkla projeye veri dosyası olarak aktarım
- **Grafik oluşturucu:** Araçlar → sütun (ortalama+hata çubuğu / sıklık), çizgi (tekrarlı ölçüm), histogram, saçılım (+regresyon), kutu; APA tarzı; editöre şekil olarak eklenir; Word/PDF’e gömülür
- **Konu bulma:** `/konu-bul`; OpenAlex yıllık yayın, son 3 yıl/önceki 3 yıl, alt konu büyümesi, Türkiye payı, çok atıf alanlar + verilere dayalı 5 öneri → “Bu konuyla tez başlat”
- **Tekrar önleme:** yazım kurallarında üslup/tekrar maddesi; bölümde ve çalışmada sık geçen kalıplar modele “TEKRARDAN KAÇIN” listesi olarak verilir (`src/lib/quality/repetition.ts`); taslakta tekrar varsa uyarı + “Tekrarları azalt” eylemi; alt başlıklarla yazımda bütün kontrolü; kalite raporunda bölüm içi tekrar uyarısı
- **Google / Apple ile giriş:** düğmeler yalnızca Supabase’de sağlayıcı etkinse görünür (`src/lib/auth-providers.ts`, 5 dk önbellek); davet kodu OAuth dönüşünde `attachReferral` ile bağlanır. Sağlayıcılar henüz Supabase’de açılmadı (TODO)
- **Abonelik yönetimi:** Hesap sayfasında “Aboneliği yönet / iptal et” → Stripe müşteri portalı (`/api/billing/portal`)
- Güvenlik: RLS + sahiplik tetikleyicileri, CSRF köken kontrolü, SSRF koruması, dosya imza kontrolü, güvenlik başlıkları

**Kalite güvencesi**
- 164 test (atıf, kaynak ayrıştırıcıları, yol haritası, kalite, dışa aktarma, Stripe imzası, istatistik, PGlite üzerinde RLS)
- Next.js 15.5.28 / React 19.1.10 (güvenlik yaması)

## Commit geçmişi (özet)
| Commit | İçerik |
|---|---|
| 57aab32 | Çekirdek kütüphaneler ve şema |
| bea5c1b | Sunucu katmanı ve API'ler |
| 36e7524 | Arayüz |
| 4ed230b | PGlite DB testleri, yönetici atama düzeltmesi |
| 2f479d3 | Arka plan tam metin, danışman paylaşımı, PDF içindekiler |
| f5cf115 | Tarayıcı demosu, asistan sohbet sıfırlanma düzeltmesi |
| a654059 | PR #2 main'e birleştirildi |
| 752d451 | vercel.json (fra1) |
| c4dc4d5 | Next.js güvenlik güncellemesi |
| 96b9088 | Asistanın kendi literatür araştırması |
| ac53543 | Proje belgeleri (CLAUDE.md vb.) |
| 82dd38f | Desteksiz iddia yok + eksik konu araması, İngilizce arayüz (ülkeye göre), mobil çalışma alanı |
| 78b169f | Bölüm bazlı kaynak taraması, tam metin okuma + yayındaki sayfa no, kaynakçada kullanım yerleri |
| b4c3c85 | UX paketi: alt başlıklarla yaz, atıf doğrulama, [KAYNAK GEREKLİ] toplu düzeltme, literatür matrisi, Word şablonu/kapak, hedef/takvim, sesle not, çevrimdışı kayıt, tur, limit uyarıları |
| 5045fef | Türk kaynakları, BibTeX/RIS, istatistik (APA), savunma sunumu, Abstract, etik, dergi önerisi, kurum lisansı, öğrenci indirimi, davet, uzman desteği (dermanlik.com.tr) |
| 3222759 | SSS sayfası, Stripe abonelik yönetim portalı |
| 1c2e94f | Ana sayfa veri kaynaklarında Türkiye kaynakları |
| 5fff0aa | Google ve Apple ile giriş/kayıt |
| 1414657 | Akademik yazı tipi (Source Serif) |
| 91f3d6d | Tekrar eden ifadelerin önlenmesi |
| 636d42b | Proje önerisi, hakem cevabı, savunma provası, anket, grafik, konu bulma (migration 8) |
| b167ff3 | Başlık seçimiyle başlayan adım adım akış, bölüm tamamlama işaretleri |
| f2fca12 | Bölüm tamamlama kontrolü |
| d9712a0 | Bölüm kontrolü hak dışı + ücretsizde ekonomik model |
| d2c265c | Bölüm kontrolü: tüm paketlerde Haiku, yalnız Basic’te haktan düşmez |
| (bu commit) | Bölüm kontrolü Ücretsiz pakette de haktan düşmez |

## Oturum dışı üretilen teslimler (depoda değil)
- **Reels tanıtım videosu** (40 sn, 1080×1920, altyazılı, müzikli, seslendirmesiz — ortamda Türkçe TTS yok, HuggingFace engelli). Kullanıcıya sohbetten gönderildi; seslendirme metni ve SRT de verildi. Yeniden üretmek gerekirse: demo ekranlarından Playwright ile kare kare HTML animasyonu + ffmpeg (yöntem bu oturumda kullanıldı).

## Çalışma şekli (kullanıcıyla)
- Kullanıcı teknik değil; sade Türkçe, adım adım. Ekran görüntüleriyle ilerler.
- Kod: Claude yazar, test eder, `main`’e push eder; Vercel otomatik yayınlar. PR açılmaz (istenmedikçe).
- Veritabanı: yeni migration’ın SQL’i sohbette verilir; kullanıcı Supabase → SQL Editor → **+ New query** → yapıştır → **Run** yapar (Save gerekmez).
- Claude’un oturumundan canlı siteye ve akademik API’lere ağ erişimi yok; canlı doğrulama kullanıcının ekran görüntüleriyle.
- Kullanıcı bağlam penceresi dolmadan “yedekle” diyebilir: bu dosyalar (PROJECT_STATUS, TODO, DECISIONS, CLAUDE.md) güncellenip commit edilir.
