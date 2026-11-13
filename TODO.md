## Kullanıcının yapması gereken (öncelikli)
- [x] (2026-11-13) (D157/D158) Supabase SQL Editor’de migration 40’ı çalıştır (yıllık ödeme + “Sınırsız Kullanım” paketi); kullanıcı “belki değişiklik olur” diye bekletiyor. Çalıştırılana kadar paket kartı eski adı/metni gösterir ve yıllık paket atanamaz
- [ ] (D157) docs/legal/HUKUKCU_NOTU_D157.md’yi hukukçuya ilet (Kullanım Koşulları, Adil Kullanım, Mesafeli Sözleşmeler; yıllık ödeme ve yeni Tek Proje)
- [ ] (D155) docs/legal/HUKUKCU_NOTU_D155.md’yi hukukçuya ilet: Kullanım Koşulları’ndaki “hak dolduğunda … düzenleyebilir” cümlesi yeni salt okunur kuralla çelişiyor; yeni metin gelince sürüm artırılıp yayımlanacak. Hukukçunun yeni metni gelmeden main’e alınmamalı
- [ ] (D155) Canlıda dene: hakkı dolmuş bir hesapla çalışma salt okunur açılıyor mu, “Dışa aktar” çalışıyor mu, yeni çalışma/bölüm/kaynak eklemede “hakkınız doldu” penceresi çıkıyor mu, ücretsiz araçlar açık mı
- [ ] (D154) Supabase SQL Editor’de migration 39’u çalıştır (`supabase/migrations/20261203000039_legal_acceptances.sql`, hukuki kabul kayıtları); check_status.sql’de “39” YAPILMIŞ görünmeli. Çalıştırılmadan önce site çalışır ama kabul kayıtları tutulmaz
- [ ] (D154) Hukukçudan: veri sorumlusu/satıcı unvanı, adres, MERSİS/vergi no, KEP ve KVKK başvuru e-postası → metinlerin “yayımdan önce eklenmelidir” yazan yerlerine eklenecek (yeni sürüm = yeniden kabul)
- [ ] (D154) Hukukçu kararları: bağlayıcı dil; cihaz kimliği (acd_did) için izin gerekir mi (gerekirse lib/consent.ts SECURITY_REQUIRES_CONSENT = true); cayma hakkı ve anında ifa onayı; ödeme ve kabul kayıtları hesap silinince saklanmalı mı; saklama süreleri (12 ay kanıt kaydı, geri bildirim, hata kayıtları, ziyaret istatistiği); yaş sınırı
- [ ] (D154) Supabase → Database → Backups: yedek türü ve saklama süresini docs/ACCOUNT_DELETION.md’ye yazdır
- [ ] (D154) Canlıda dene: yeni e-posta kaydı (Koşullar kutusu zorunlu), Google ve Apple ile ilk giriş (onay sayfası), Hesap → Gizlilik ve Veri Yönetimi (JSON indir, paylaşım bağlantısı iptal, kabul kayıtları), Yükselt penceresinde bilgilendirme kutusu, /gizlilik → /kvkk yönlendirmesi. Mevcut kullanıcılar bir sonraki girişte Kullanım Koşulları’nı bir kez onaylayacak
- [x] (2026-11-12) Canlıda dene (D149): Yeni çalışma → “Mevcut çalışmamı içe aktar” ile kendi Word tezinizi yükleyin; bölümler, kaynakça ve atıflar doğru mu? Çalışma ekranında “İçe aktar” → Zotero (zotero.org/settings/security’den user ID + okuma izinli anahtar), Mendeley .bib, PDF; bir metin seçip “Yapay zekâ ile düzenle”; Proje ayarları → Kaynak tercihleri → “Her seferinde sor” ile izin kartı
- [ ] Ana sayfa görüşleri (D147): her kişiden ad, unvan ve görüşün yayımlanması için yazılı izin (e-posta yeterli) sakla
- [ ] Canlıda dene: Yönetim → Kullanıcılar → bir kullanıcı → “Bildirim gönder”; o hesapla girince zil simgesinde mesaj görünmeli, yönetimde “Okundu” olmalı (D146)
- [x] (2026-11-12) Supabase SQL Editor’de migration 38’i çalıştır (indirim kodları, sayfa hakkı, davet ödülüne sayfa; D145); check_status.sql’de “38” YAPILMIŞ görünmeli
- [x] (2026-11-12) Canlıda dene: Yönetim → İndirim kodları → kod oluştur; çıkış yapıp /kayit?kod=KOD ile yeni hesap aç; Hesap sayfasında indirimli fiyat ve WhatsApp mesajında kod görünmeli (D145)
- [ ] Canlıda dene: Ücretsiz hesapla bölüm yazdır; Hesap → “Yapay zekâ ile yazılan sayfa” sayacı artmalı, 5 sayfada yeni taslak durmalı (D145)
- [ ] Canlıda dene: /de sayfaları, Almanya’dan girişte otomatik Almanca, Almanca arayüzle asistan cevabı (D143)
- [ ] Canlıda dene: Almanca çalışma oluştur → bölüm yaz, atıf ekle, Word/PDF/LaTeX indir, istatistik ve çeviri (D144)
- [ ] Canlıda dene: /yardim (Kullanım rehberi) ve çalışma alanında “?” → 15 adımlı rehberli tur (D142)
- [x] (2026-11-12) Supabase SQL Editor’de migration 37’yi çalıştır (gerçek zamanlı ortak yazım kanalı, D140); check_status.sql’de “37” YAPILMIŞ görünmeli
- [x] (2026-11-12) Canlıda dene: iki tarayıcıda (sahip + ortak yazar) aynı bölümü aç; üstte yeşil “Canlı”, diğerinin paragrafında renkli çizgi; farklı paragraflara yazınca metin saniyeler içinde diğer tarafta görünmeli (D140)
- [x] (2026-11-12) Canlıda dene: Araçlar → Literatür haritası → Ağ / Zaman çizelgesi / Konu haritası / Yeni çalışmalar (D141)
- [ ] Canlıda dene: Dışa aktar → “LaTeX (.tex + .bib, ZIP)” ve “Overleaf’te aç” (Overleaf hesabıyla); derlenen PDF’in ekran görüntüsü (D136)
- [ ] (Ertelendi, D136) ORCID ile yayın aktarma ve Zotero canlı eşitleme
- [x] (2026-11-12) Supabase SQL Editor’de migration 36’yı çalıştır (PDF bölümleri, derleme oyları, veri çıkarma, kalite; D132–D134)
- [ ] Canlıda dene: Kaynaklar → “Birlikte analiz et” → Karşılaştır; İddia denetimi (Diğer kaynaklarımla da karşılaştır); PRISMA → Protokol’de çift değerlendirici, 5. Veri çıkarma ve kalite, 6. Yöntem metni → Belgeye ekle; yeni yüklenen bir PDF’te “Kaynağa sor → Yöntemi”
- [ ] (İsteğe bağlı, ücretsiz) Vercel’e `SPRINGER_API_KEY`, `IEEE_API_KEY`, `ADS_API_KEY` ekle → Redeploy (D129)
- [ ] Canlıda dene: Kaynak araştırmasında bir arama yap; sonuç çiplerinde PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP görünüyor mu (D129)
- [ ] Tanıtım videosu seslendirmesi: kaydı gönder; ses videoya eklenip `public/video/academiana-tanitim.mp4` aynı adla değiştirilecek (D127)
- [x] (2026-11-12) Supabase SQL Editor’de migration 35’i çalıştır (PRISMA ve literatür haritası Pro kartında, D128); 34’ten sonra
- [x] (2026-11-12) Supabase SQL Editor’de migration 34’ü çalıştır (paket kartlarında iddia denetimi, PRISMA, literatür haritası; D126). 32 ve 33 yapıldı (kullanıcı onayladı)
- [ ] Canlıda dene: atıflı bir bölümde “İddia denetimi”; Araçlar → Sistematik derleme (PRISMA) ile bir RIS dosyası içe aktar; Araçlar → Literatür haritası (DOI’li kaynaklarla); Kalite sayfasındaki kontrol listesi
- [ ] Sonraki adım önerisi (rapor): 3–5 pilot akademisyen/kurumla iddia denetimi ve PRISMA modülünü değerlendirt; sonuçları /yontem sayfasında yayımla (sahte vaka çalışması yazılmaz)
- [x] (2026-11-12) Canlıda dene: bir Pro hesabıyla ikinci bir hesabı ortak yazar olarak davet et, iki tarayıcıda aynı bölümü açıp “X bu bölümde” göstergesini ve çakışma penceresini kontrol et (D115)
- [ ] Canlıda dene: Araçlar → Dil ve çeviri ile atıflı bir paragrafı İngilizceye çevir; Kaynaklar → Sor; /araclar/arastirmalar-ne-diyor (canlı veri tabanı aramaları bulut oturumunda denenemedi)
- [x] (2026-11-12) Supabase SQL Editor’de migration 31’i çalıştır (Tek Proje gözetimi, D109); Kullanım koşullarındaki yeni Tek Proje ve Adil kullanım maddelerini hukukçuya incelet
- [x] (2026-11-12) Google Search Console: alan adını doğrula (NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) → Site haritaları → sitemap.xml gönder; Bing Webmaster Tools için de aynısı (D107)
- [x] (2026-11-12) Supabase SQL Editor’de migration 29 ve 30’u çalıştır (D106), sonra check_status.sql ile YAPILMIŞ olduğunu doğrula
- [ ] Supabase → Authentication → Sign In / Providers → Email → “Confirm email” AÇIK olmalı (davet ödülü e-posta doğrulamasına bağlı; kapalıysa doğrulama anında sayılır)
- [ ] Hukuki metinler ve satıcı bilgisi (hukukçu); 15 GB depolama vaadi için Supabase planını kontrol et
- [x] (2026-11-06) Migration 27 (Tek Proje + hesap silme düzeltmesi) ve 28 (%40 maliyet uyarısı) çalıştırıldı; Fiyatlar’da Tek Proje kartı doğrulandı
- [x] (2026-11-06) Migration 22–26 canlıda doğrulandı (check_status: hepsi YAPILMIŞ); 23/24 yeniden çalıştırılmamalı (25’teki cihaz önlemini geri alır)
- [x] (2026-11-06) Migration 24 (bildirim kutusu) ve Ücretsiz kart PDF metni geri yüklendi
- [x] (2026-11-06) Migration 22 (paket vaatleri) ve 23 (davet ödülü) çalıştırıldı
- [ ] Canlıda dene: kurgusu onaylı bir çalışmada alt başlığa girip “Bölümü yaz”; yanıtın altındaki “Taslak X kelime (hedef Y)” satırını kontrol et (D97)
- [ ] Yönetim → Ayarlar → Kârlılık’ta dolar kurunu güncelle (Maliyet sağlığı 30 günü geçince uyarır)
- [ ] Ay sonunda Yönetim → Maliyet sağlığı’ndaki “bu ay harcanan” ile Anthropic Console → Usage’daki gerçek faturayı karşılaştır (D94)
- [ ] Maliyet sağlığı “ortalama istek maliyeti” uyarı verirse Ayarlar → Kârlılık’taki varsayımı güncelle
- [ ] Asistana “Nereden grafik oluşturabilirim?” gibi bir soru sorup cevabı dene (D93)
- [ ] Canlıda ERIC, DBLP, DataCite aramalarını dene; Yönetim → Veri kaynağı sağlığı’ndan sonuçları kontrol et (D92)
- [x] (2026-11-12) Supabase SQL Editor’de `20261116000021_tools_analytics.sql` (ücretsiz araç sayacı + ziyaretçi ölçümü, D90)
- [x] (2026-11-12) Supabase SQL Editor’de `supabase/check_status.sql` çalıştır (salt okunur): EKSİK görünen migration’ları sırayla çalıştır. 17 (fiyat artışı) EKSİK görünürse önce Claude’a sor: fiyatlar yönetim panelinden elle değiştirildiyse yanlış EKSİK görünebilir.
- [x] (2026-11-12) Supabase SQL Editor’de `20261115000020_no_work_lock.sql` (çalışma kilidini kaldırma, D81)
- [x] (2026-11-02) Supabase SQL Editor’de migration 9’u çalıştır (`20261106000009_plans_whatsapp.sql`: yeni fiyat/limitler, öğrenci indirimi ayarını siler)
- [x] (2026-11-02) Supabase SQL Editor’de migration 10’u çalıştır (`20261106000010_plan_features.sql`: paket kartlarında özellik listeleri)
- [x] (2026-11-02) Supabase SQL Editor’de migration 11’i çalıştır (`20261107000011_work_lock.sql`: çalışma kilidi)
- [ ] KVKK veri talepleri: Yönetim → Kilitler’de bekleyenleri 30 gün içinde ücretsiz yanıtla
- [x] (2026-11-02) Supabase SQL Editor’de migration 12’yi çalıştır (`20261108000012_usage_integrity.sql`: sayaç güvenilirliği)
- [x] (2026-11-02) Token limitleri yükseltildi (migration 13; elle çalıştırıldı)
- [ ] Supabase SQL Editor’de migration 14’ü çalıştır (`20261109000014_cost_margin.sql`: yeni istek hakları + maliyet tavanı)
- [ ] Her ay: Yönetim → Ayarlar → Kârlılık → dolar kurunu güncelle
- [ ] Öneri: istem önbelleği (prompt caching) ile istek maliyetini düşürüp hakları artırmak
- [ ] Supabase SQL Editor’de migration 15’i çalıştır (`20261110000015_plan_expiry.sql`: paket bitiş tarihi)
- [ ] Supabase SQL Editor’de migration 16’yı çalıştır (`20261111000016_member_no.sql`: üye numarası)
- [ ] Supabase SQL Editor’de migration 17’yi çalıştır (`20261112000017_price_increase.sql`: %50 fiyat artışı)
- [ ] Supabase SQL Editor’de migration 18’i çalıştır (`20261113000018_unlimited_seats.sql`: kurum lisansında sınırsız kişi)
- [ ] Supabase SQL Editor’de migration 19’u çalıştır (`20261114000019_isnad.sql`: ISNAD atıf stili)
- [ ] Supabase → Authentication → Emails → “Reset Password” şablonunu Türkçeleştir; bağlantıyı `{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=recovery` yap (her cihazda çalışsın)
- [ ] Pazarlama öncesi: Supabase → Authentication → SMTP ile kendi e-posta sağlayıcısını bağla (varsayılan gönderim saatlik birkaç e-postayla sınırlı)
- [ ] İleride: ISNAD dipnotlu biçim (editörde dipnot altyapısı gerekir)
- [ ] Ödeme gelince: Yönetim → Kullanıcılar’dan kullanıcının paketini elle değiştir
- [ ] Alan adı: 2026-11-03’te hâlâ “Invalid Configuration” ise hosting.com.tr desteğine TRABIS iletimini sorun; gerekirse B planı (hosting.com.tr DNS + A @ 216.198.79.1, CNAME www → 4d8ff7a9ca75c5bb.vercel-dns-017.com)
- [x] (2026-11-02, DNS yayılımı bekleniyor) Alan adı: hosting.com.tr’de nameserver → ns1.vercel-dns.com / ns2.vercel-dns.com (yapıldıysa Vercel’de “Valid Configuration” bekleniyor)
- [x] (2026-11-02) Vercel env: `NEXT_PUBLIC_APP_URL=https://www.academiana.com.tr` + Redeploy
- [x] (2026-11-02) Supabase → Authentication → URL Configuration: Site URL `https://www.academiana.com.tr`; Redirect URLs `https://www.academiana.com.tr/**`, `https://academiana.com.tr/**` (eski vercel.app satırı bir süre kalsın)
- [ ] Supabase e-posta şablonlarında (Authentication → Emails) “Akademi AI” geçiyorsa “Academiana” yap
- [ ] Alan adı yeşile döndükten sonra Vercel env: `REDIRECT_TO_DOMAIN=1` (eski vercel.app adresi yeni adrese yönlenir) + Redeploy
- [x] (2026-11-12) Alan adı yeşile dönünce: Google Search Console’a `https://www.academiana.com.tr` ekle (HTML etiketi yöntemi → kodu Vercel’e `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` olarak gir, Redeploy, Doğrula) → Site haritaları: `sitemap.xml` gönder. İsteğe bağlı: Bing Webmaster (`NEXT_PUBLIC_BING_VERIFICATION`, ya da Search Console’dan içe aktar), Yandex Webmaster (`NEXT_PUBLIC_YANDEX_VERIFICATION`).
- [x] (2026-11-02) Google ile giriş açılırsa: Google Cloud OAuth “Authorized JavaScript origins”e `https://www.academiana.com.tr`
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
- [ ] D90 canlı deneme: /araclar araçları (özellikle uydurma kaynak kontrolü ve DOI ile kaynakça), Yönetim → Ziyaretçiler ve maliyet sayacı, ücretsiz pakette anket alt bilgisi
- [ ] D87/D88 canlı deneme: “Değişkenlerin Ölçülmesi” belgesini Araştırmanın yöntemi bölümüne “İçe aktar” ile aktar (kaynak doğrulama Crossref/DataCite canlı); hafıza panelinden aynı belgeyle “Belgeden öğren”
- [ ] D83 alt başlıklar: canlıda “Alt başlık oluştur” → alt başlığa gir → yaz → alt-alt başlık → Word indir (numara ve sayfa düzeni)
- [ ] D78 maliyet düşüşü: aynı boyutta bir otomatik çalışmayı yeniden dene, Yönetim → gelir-maliyet ekranında harcamayı önceki ($1,5 / 2000 kelime) ile karşılaştır; “Onayınız bekleniyor” ekranını dene
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
- [x] (2026-11-02, çalışıyor; uygulama “In production”) Google ile giriş: Google Cloud’da OAuth istemcisi (yönlendirme adresi: Supabase → Authentication → Providers → Google’da yazan callback URL) → Supabase’de Google’ı aç, Client ID/Secret gir. Supabase → Authentication → URL Configuration: Site URL ve Redirect URLs’e `https://akademi-ai-umber.vercel.app/**`
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
