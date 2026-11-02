## Kullanıcının yapması gereken (öncelikli)
- [x] (2026-11-02) Supabase SQL Editor’de migration 9’u çalıştır (`20261106000009_plans_whatsapp.sql`: yeni fiyat/limitler, öğrenci indirimi ayarını siler)
- [x] (2026-11-02) Supabase SQL Editor’de migration 10’u çalıştır (`20261106000010_plan_features.sql`: paket kartlarında özellik listeleri)
- [x] (2026-11-02) Supabase SQL Editor’de migration 11’i çalıştır (`20261107000011_work_lock.sql`: çalışma kilidi)
- [ ] 100 TL ödemesi gelince: Yönetim → Kilitler → çalışma kodunu yapıştır → “Hakkı tanımla”
- [ ] KVKK veri talepleri: Yönetim → Kilitler’de bekleyenleri 30 gün içinde ücretsiz yanıtla
- [x] (2026-11-02) Supabase SQL Editor’de migration 12’yi çalıştır (`20261108000012_usage_integrity.sql`: sayaç güvenilirliği)
- [x] (2026-11-02) Token limitleri yükseltildi (migration 13; elle çalıştırıldı)
- [ ] Supabase SQL Editor’de migration 14’ü çalıştır (`20261109000014_cost_margin.sql`: yeni istek hakları + maliyet tavanı)
- [ ] Her ay: Yönetim → Ayarlar → Kârlılık → dolar kurunu güncelle
- [ ] Öneri: istem önbelleği (prompt caching) ile istek maliyetini düşürüp hakları artırmak
- [ ] Supabase SQL Editor’de migration 15’i çalıştır (`20261110000015_plan_expiry.sql`: paket bitiş tarihi)
- [ ] Supabase SQL Editor’de migration 16’yı çalıştır (`20261111000016_member_no.sql`: üye numarası)
- [ ] Ödeme gelince: Yönetim → Kullanıcılar’dan kullanıcının paketini elle değiştir
- [ ] Alan adı: 2026-11-03’te hâlâ “Invalid Configuration” ise hosting.com.tr desteğine TRABIS iletimini sorun; gerekirse B planı (hosting.com.tr DNS + A @ 216.198.79.1, CNAME www → 4d8ff7a9ca75c5bb.vercel-dns-017.com)
- [x] (2026-11-02, DNS yayılımı bekleniyor) Alan adı: hosting.com.tr’de nameserver → ns1.vercel-dns.com / ns2.vercel-dns.com (yapıldıysa Vercel’de “Valid Configuration” bekleniyor)
- [x] (2026-11-02) Vercel env: `NEXT_PUBLIC_APP_URL=https://www.academiana.com.tr` + Redeploy
- [x] (2026-11-02) Supabase → Authentication → URL Configuration: Site URL `https://www.academiana.com.tr`; Redirect URLs `https://www.academiana.com.tr/**`, `https://academiana.com.tr/**` (eski vercel.app satırı bir süre kalsın)
- [ ] Supabase e-posta şablonlarında (Authentication → Emails) “Akademi AI” geçiyorsa “Academiana” yap
- [ ] Alan adı yeşile döndükten sonra Vercel env: `REDIRECT_TO_DOMAIN=1` (eski vercel.app adresi yeni adrese yönlenir) + Redeploy
- [ ] Alan adı yeşile dönünce: Google Search Console’a `https://www.academiana.com.tr` ekle (HTML etiketi yöntemi → kodu Vercel’e `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` olarak gir, Redeploy, Doğrula) → Site haritaları: `sitemap.xml` gönder. İsteğe bağlı: Bing Webmaster (`NEXT_PUBLIC_BING_VERIFICATION`, ya da Search Console’dan içe aktar), Yandex Webmaster (`NEXT_PUBLIC_YANDEX_VERIFICATION`).
- [ ] Google ile giriş açılırsa: Google Cloud OAuth “Authorized JavaScript origins”e `https://www.academiana.com.tr`
- [x] (2026-11-02, kullanıcı “Success” onayladı) Supabase SQL Editor’de migration 8’i çalıştır: `supabase/migrations/20261105000008_grants_surveys.sql` (proje önerisi türü + anket tabloları). Çalıştırılmadan anketler ve TÜBİTAK türü hata verir.

# Yapılacaklar

_Son güncelleme: 1 Kasım 2026. Tamamlananı işaretle, yenisini ekle._

## 🔴 Şimdi: canlı ortam testleri
Kod hazır ama canlı sitede hiç denenmedi. Kullanıcı dener, ekran görüntüsü gönderir; hatalar düzeltilir.
- [ ] Sohbette "kaynakları sen bul ve bu bölümü yaz" → otomatik araştırma, kaynak ekleme, atıflı taslak
- [ ] "Literatür araştır" penceresi (veri tabanı sonuçları geliyor mu? hangi sağlayıcılar hata veriyor?)
- [ ] Kaynak doğrulama (Crossref) ve tam metin analizi (Unpaywall/arXiv/Europe PMC)
- [ ] DOCX ve PDF dışa aktarma (PDF fontları Vercel'de bulunuyor mu?)
- [ ] Dosya yükleme (Supabase Storage `user-files` bucket) ve PDF metin çıkarma
- [ ] Kalite kontrol (AI incelemesi dahil)
- [ ] Danışman paylaşım bağlantısı ve danışman yorumu
- [ ] Uzun AI yanıtlarında Vercel Hobby zaman sınırı (gerekirse Pro plan veya `maxDuration` ayarı)

## 🔴 Kullanıcının yapması gerekenler
- [x] Migration 7 çalıştırıldı (kullanıcı “Success” onayı verdi)
- [ ] Migration 5 ve 6 çalıştırıldığından emin ol (tekrar çalıştırmak güvenli)
- [ ] Yönetim → Kurumlar → “Öğrenci indirimi, davet ve iletişim”: iletişim e-postasını gir (Kurumlar sayfasındaki “Teklif isteyin” için); öğrenci indirimi %30 ve davet ödülü 50 AI isteği + 50 tarama varsayılan
- [ ] dermanlik.com.tr tarafında UTM’li gelen ziyaretleri karşılayan sayfanın hazır olduğunu kontrol et
- [ ] **Supabase SQL Editor’de `supabase/migrations/20261103000006_source_summary.sql` çalıştır** (literatür matrisi)
- [ ] Yeni özellikleri canlıda dene: Alt başlıklarla yaz, Kaynakta doğrula, [KAYNAK GEREKLİ] düzelt, Literatür matrisi, PDF yükle, biçim/kapak ile Word çıktısı, hedef/takvim, mikrofon
- [ ] **Supabase SQL Editor’de `supabase/migrations/20261102000005_no_placeholder_claims.sql` çalıştır** (sistem talimatından [KAYNAK GEREKLİ] kuralını kaldırır)
- [ ] Telefonda çalışma alanını dene (alt çubuk, asistan, ⋯ menüsü) ve İngilizce/Türkçe geçişini kontrol et
- [ ] Sohbette paylaşılan Claude API anahtarını Console'dan sil, yenisini oluştur, Vercel'e gir, Redeploy
- [ ] Anthropic Console'da aylık harcama limiti
- [ ] `ACADEMIC_CONTACT_EMAIL` Vercel'e eklendi mi kontrol et (OpenAlex/Crossref polite pool, Unpaywall için gerekli)
- [ ] `NEXT_PUBLIC_APP_URL` = https://akademi-ai-umber.vercel.app (Stripe dönüş adresleri için)

## 🟡 Yakın vade
- [ ] Özel SMTP (Resend vb.): Supabase → Authentication → SMTP Settings
- [ ] Alan adı (örneğin akademiai.com.tr) + Supabase Site URL/Redirect URL güncellemesi
- [ ] Paket fiyatlarının belirlenmesi (Yönetim → Paketler)
- [ ] Otomatik araştırma karar adımı her mesaja 2-5 sn ekliyor: yeterli kaynak varken ve mesaj kaynak istemiyorsa atlama optimizasyonu
- [ ] Sohbet geçmişi yüklendiğinde "eklenen kaynaklar" bilgisinin de gösterilmesi (şu an yalnızca canlı akışta)
- [ ] Bölüm bazlı tarama canlıda denenmeli: yeni alt başlıkta yeni kaynak ekleniyor mu, tam metin okunup sayfa numaralı atıf geliyor mu (Vercel süre sınırına dikkat)
- [ ] Daha önce tam metni okunmuş kaynaklarda sayfa ipuçları PDF sırasına göre; "Tam metni analiz et" ile yeniden okununca yayındaki sayfaya geçer
- [ ] Canlıda dene: Türkiye kaynakları araması, BibTeX/RIS içe aktarma, İstatistik analizi (gerçek CSV ile), Savunma sunumu, Dergi önerisi, kurum oluşturma → katılma, davet bağlantısıyla kayıt
- [ ] Normallik için Shapiro-Wilk testi (şimdilik çarpıklık/basıklık)
- [ ] Eksik konu araması canlıda denenmeli: taslakta `[KAYNAK GEREKLİ]` çıkmamalı, eksik konular için kaynak eklenmeli
- [ ] Eski metinlerde kalan `[KAYNAK GEREKLİ]` ifadeleri için toplu "kaynak bul ve düzelt" eylemi (şimdilik: metni seçip asistana "bu iddialara kaynak bul" yazılır)
- [ ] Yönetim panelinin İngilizce çevirisi (şu an yalnızca Türkçe)
- [ ] AI yanıt dili proje diline göre; arayüz İngilizce ama proje Türkçe ise sohbet Türkçe kalır (gerekirse ayrı ayar)

## 🟠 Ticari hazırlık
- [ ] iyzico entegrasyonu (kullanıcı satıcı hesabı + sandbox anahtarları sağlayınca): abonelik checkout form, webhook/callback, HMAC imza
- [ ] Google ile giriş: Google Cloud’da OAuth istemcisi (yönlendirme adresi: Supabase → Authentication → Providers → Google’da yazan callback URL) → Supabase’de Google’ı aç, Client ID/Secret gir. Supabase → Authentication → URL Configuration: Site URL ve Redirect URLs’e `https://akademi-ai-umber.vercel.app/**`
- [ ] Apple ile giriş: Apple Developer hesabı (yıllık ücretli) gerekir; Services ID + anahtar → Supabase’de Apple’ı aç
- [ ] Stripe anahtarları + webhook (`/api/billing/webhook`); Stripe panelinde “Customer portal” etkinleştir (abonelik iptal/kart değişikliği için)
- [ ] KVKK, gizlilik, kullanım koşulları avukat incelemesi (şu an şablon)
- [ ] Supabase Pro + Point-in-Time Recovery (yedekleme)

## 🟢 Sonraki geliştirmeler
- [ ] Chicago/Turabian notlu (dipnot) atıf sistemi
- [ ] Vancouver/AMA dergi adı kısaltmaları
- [x] İngilizce arayüz (i18n): ülkeye göre otomatik, TR/EN düğmesi
- [ ] Anlam tabanlı arama (pgvector + embedding servisi)
- [ ] Kalıcı iş kuyruğu (Inngest/QStash) — kullanıcı şimdilik istemedi; uzun işler sayfa açıkken istemciden sırayla yürütülüyor
- [ ] Danışmanla eşzamanlı düzenleme
- [ ] `.dotx` üniversite şablonu desteği
- [ ] Lisanslı intihal servisi (iThenticate/Turnitin) — anlaşma gerekir

## Bilinen küçük konular
- Artifact yayın aracı demoda "indirme bağlantısı" uyarısı veriyor (demoda erişilemeyen dışa aktarma kodu; zararsız)
- npm audit uyarıları (bağımlılıklar) gözden geçirilmeli
