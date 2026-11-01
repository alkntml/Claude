# Proje Durumu

_Son güncelleme: 1 Kasım 2026_

## Canlı ortam
| Bileşen | Durum | Ayrıntı |
|---|---|---|
| Site | ✅ Yayında | https://akademi-ai-umber.vercel.app (Vercel projesi `akademi-ai`, Hobby plan, bölge fra1) |
| Veritabanı | ✅ Kuruldu | Supabase `akademi_ai`, Free plan, Frankfurt. `supabase/setup.sql` çalıştırıldı (ilk 4 migration). **Migration 5 (`20261102000005_no_placeholder_claims.sql`) kullanıcı tarafından çalıştırılmalı** |
| Kimlik doğrulama | ✅ Çalışıyor | Site URL ve Redirect URL (`/api/auth/callback`) ayarlandı. Sahip kayıt oldu |
| Yönetici | ✅ | Sahibin hesabı `role = admin`, `plan_id = premium` |
| Claude API | ✅ Çalışıyor | Opus 5.5 ve Haiku 5.5 canlı anahtarla test edildi. Asistan canlı sitede yanıt veriyor |
| Akademik veri tabanı araması | ⚠️ Canlıda doğrulanmadı | Kod hazır; sohbet içi otomatik araştırma yeni eklendi (commit `96b9088`). Kullanıcının denemesi bekleniyor |
| Ödeme | ❌ Yapılandırılmadı | Stripe kodu hazır, anahtar yok. iyzico uygulanmadı |
| E-posta | ⚠️ Supabase varsayılanı | Saatlik gönderim limiti düşük; özel SMTP (Resend vb.) önerildi |
| Demo | ✅ | Sunucusuz tarayıcı demosu: https://claude.ai/artifact/6ckTR9LQUpjPv2jNnnrhgG (AI, arama ve dışa aktarma kapalı) |

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
- Güvenlik: RLS + sahiplik tetikleyicileri, CSRF köken kontrolü, SSRF koruması, dosya imza kontrolü, güvenlik başlıkları

**Kalite güvencesi**
- 73 test (atıf, kaynak ayrıştırıcıları, yol haritası, kalite, dışa aktarma, Stripe imzası, istatistik, PGlite üzerinde RLS)
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
| sonraki | Desteksiz iddia yok + eksik konu araması, İngilizce arayüz, mobil çalışma alanı |
