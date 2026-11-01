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

## 🟠 Ticari hazırlık
- [ ] iyzico entegrasyonu (kullanıcı satıcı hesabı + sandbox anahtarları sağlayınca): abonelik checkout form, webhook/callback, HMAC imza
- [ ] Stripe anahtarları + webhook (`/api/billing/webhook`)
- [ ] KVKK, gizlilik, kullanım koşulları avukat incelemesi (şu an şablon)
- [ ] Supabase Pro + Point-in-Time Recovery (yedekleme)

## 🟢 Sonraki geliştirmeler
- [ ] Chicago/Turabian notlu (dipnot) atıf sistemi
- [ ] Vancouver/AMA dergi adı kısaltmaları
- [ ] İngilizce arayüz (i18n)
- [ ] Anlam tabanlı arama (pgvector + embedding servisi)
- [ ] Kalıcı iş kuyruğu (Inngest/QStash) — trafik artınca
- [ ] Danışmanla eşzamanlı düzenleme
- [ ] `.dotx` üniversite şablonu desteği
- [ ] Lisanslı intihal servisi (iThenticate/Turnitin) — anlaşma gerekir

## Bilinen küçük konular
- Artifact yayın aracı demoda "indirme bağlantısı" uyarısı veriyor (demoda erişilemeyen dışa aktarma kodu; zararsız)
- npm audit uyarıları (bağımlılıklar) gözden geçirilmeli
