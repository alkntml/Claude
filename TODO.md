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
