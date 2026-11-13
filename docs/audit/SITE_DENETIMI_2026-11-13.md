# Academiana — Site Denetimi (13 Kasım 2026)

Kapsam: kod ve testler, üretim derlemesinin yerelde taranması (203 herkese açık sayfa, mobil tarayıcıyla), canlı sitenin başlık/güvenlik/hız kontrolleri, sayfalarda yazan bilgilerin kod ve veritabanı (tüm migration’lar test veritabanında çalıştırılarak) ile karşılaştırılması, hukuki metinlerin sistem davranışıyla karşılaştırılması, açık işler listesi.

Önem dereceleri: **KRİTİK** (hukuki risk veya kullanıcıya verilen sözün altyapıyla tutmaması) · **ÖNEMLİ** · **ORTA** · **KÜÇÜK**.

## A. Kritik

1. **Hukuki metinlerde işletmeci/satıcı kimliği ve başvuru kanalı yok.** KVKK Aydınlatma Metni veri sorumlusunun kimliğini, Mesafeli Sözleşmeler satıcının unvanını/adresini/iletişimini, GDPR bildirimi veri sorumlusunu ve hakların kullanılacağı kanalı belirtmiyor (taslak notları kaldırıldı, ancak bilginin kendisi hiç eklenmedi). KVKK m.10 ve Mesafeli Sözleşmeler Yönetmeliği bu bilgileri zorunlu tutar. “Hakkımızda” sayfası kurucuyu adıyla anıyor, hukuki metinler kimseyi anmıyor. → Hukukçudan unvan, adres, MERSİS/vergi no, KEP ve KVKK başvuru e-postası alınıp eklenmeli.
2. **Kullanım Koşulları, “hak dolunca salt okunur” kuralıyla çelişiyor.** Koşullarda: “Hak dolduğunda yalnızca ilgili özellik durur; … kullanıcı çalışmasını görüntüleyebilir, **düzenleyebilir**…”. Sistem (D155) ve SSS ise hak dolunca yalnızca görüntüleme ve indirmeye izin veriyor. (TODO’da bu madde hukukçu notu olarak açık duruyor.)
3. **Depolama sözü altyapıyla tutmuyor.** Premium’da “15 GB depolama”, Sınırsız Proje’de “Sınırsız depolama” vaat ediliyor; PROJECT_STATUS’a göre Supabase **Free** planda (toplam depolama 1 GB civarı; ücretsiz projeler uzun süre kullanılmazsa duraklatılır, otomatik günlük yedek yok). Birkaç Premium kullanıcı bu kotayı doldurur.
4. **Barındırma planı ticari kullanıma uygun değil.** Vercel projesi **Hobby** planında; Hobby planı Vercel koşullarına göre kişisel/ticari olmayan kullanım içindir ve sunucu işlevlerinin süre sınırı düşüktür (uzun yapay zekâ yanıtları kesilebilir). Ücretli satış yapılan bir site için Pro plan gerekir.
5. **Migration 39 (hukuki kabul kayıtları) çalıştırıldı mı belirsiz.** TODO’da işaretsiz. Çalıştırılmadıysa: kabul kayıtları hiç tutulmaz ve onay sayfasında “Kabul ediyorum” kaydı yazılırken hata oluşabilir. → Supabase’de `supabase/check_status.sql` çalıştırılıp tüm satırların “YAPILMIŞ” olduğu doğrulanmalı (TODO’da 14–19 numaralı migration’lar da hâlâ işaretsiz görünüyor; liste güncel değil).
6. **E-posta gönderimi Supabase’in varsayılan sunucusunda.** Saatte birkaç e-postayla sınırlı; kayıt doğrulama ve şifre sıfırlama e-postaları yoğunlukta gitmez. Pazarlama/duyurudan önce özel SMTP (Resend vb.) bağlanmalı. Şifre sıfırlama şablonunun Türkçeleştirilmesi ve “Akademi AI” adının şablonlardan kaldırılması da TODO’da açık.

## B. Önemli

7. **Veritabanındaki yıllık fiyatlar ekranda gösterilenle uyuşmuyor.** Fiyatlar sayfası yıllık toplamı aylık×0,8×12 hesaplıyor (Basic: 599×12 = 7.188 TL). Veritabanında `price_yearly` Basic 7.490, Pro 13.490, Premium 22.490 (eski 10 aylık kuralı). Yönetim panelinde bu alan düzenlenebilir görünüyor ama ekrana yansımıyor; ileride kartla ödeme (Stripe kodu) açılırsa müşteriden ekranda yazandan farklı tutar çekilir.
8. **“Sınırsız kaynak taraması” yazan paketlerde gizli üst sınır var.** Pro kartında “Sınırsız kaynak taraması (adil kullanım)” yazıyor, sistemde aylık 2.000; Premium’da 8.000. Sınıra ulaşan kullanıcı “sınırsız” sözüyle çelişen bir uyarı görür. Ya sınır kartta yazılmalı ya da kart metni “yüksek limit” olarak değişmeli.
9. **KVKK/GDPR metinlerindeki veri alıcıları listesi eksik.** Kod, arama terimlerini OpenAIRE ve Google Books’a da gönderiyor; metinlerdeki listede bu ikisi yok.
10. **SSS’deki güvenlik cevabı eksik bilgi veriyor.** “Uygulama, veritabanı ve dosya depolama AB içinde, Frankfurt’ta” deniyor; yapay zekâ kullanıldığında metnin ABD’deki Anthropic’e gittiği bu cevapta yazmıyor (KVKK metninde yazıyor). Aynı cevapta “500’ü aşkın otomatik test” deniyor, ana sayfada “450+” (gerçek sayı 571).
11. **“Araştırmalar ne diyor?” aracı İngilizce ve Almanca sitede Türkçe kalıyor.** Araç kartındaki açıklama (“Bir araştırma sorusuna gerçek makalelerin…”) tüm EN/DE araç sayfalarında ve araçlar listesinde Türkçe görünüyor; aracın sayfa girişi ve “Cevap yalnızca bulunan makalelerin özetlerinden…” notu da çevrilmemiş. Ayrıca araç kartlarındaki “Yapay zekâ kullanılır” rozeti ve örneklem hesaplayıcının hata mesajları (“Evren büyüklüğü gerekli” vb.) EN/DE’de Türkçe çıkar. (Otomatik çeviri testi yalnızca doğrudan `t("…")` içine yazılan metinleri denetlediği için yakalayamamış.)
12. **Ana sayfadaki sayılar doğrulanamıyor veya tutarsız.** “14 istatistik analizi” yazıyor, analiz menüsünde 11 analiz var. “10.000’den fazla araştırmacı tarafından tercih edildi” ifadesi önceki işinizin müşteri sayısına dayanıyor (D63, sizin kararınız); bu sitenin kullanıcı sayısı gibi okunduğu için reklam mevzuatı bakımından ispat gerektirebilir. SSS’deki “benzerlik oranı genellikle %5’in altında kalır” ifadesi de ölçüme dayanmayan bir taahhüt gibi okunuyor.
13. **Ana sayfa görüşleri için yazılı izin.** TODO’da açık: görüşü yayımlanan her kişiden ad, unvan ve yayın izni alınıp saklanmalı.

## C. Orta

14. **Sayfalar önbelleğe alınmıyor.** Tüm herkese açık sayfalar her istekte sunucuda yeniden üretiliyor (canlıda `x-vercel-cache: MISS`, ilk bayt 0,33–0,55 sn). Blog, araçlar, hukuki sayfalar gibi değişmeyen sayfalar önbelleklenebilir; hem hız hem Vercel maliyeti iyileşir.
15. **Yazı tipi yükü.** Her sayfada 6 yazı tipi dosyası (~590 KB) önceden indiriliyor; ana sayfa (~366 KB HTML) ve SSS (~309 KB) mobilde en yavaş sayfalar (laboratuvar ölçümünde ilk görüntü ~2,7–3,2 sn). (SEO raporunda da var.)
16. **İngilizce/Almanca sitede Türkçe içerik.** Ana sayfadaki görüşler ve örnek atıflar, “Örnekler” sayfasındaki örnek çalışmalar Türkçe. Bilinçli olabilir; ancak İngilizce ziyaretçi için bir cümlelik “örnekler Türkçe çalışmalardan alınmıştır” notu faydalı olur. Almanca “Hakkımızda” ve yardım sayfalarında “[KAYNAK GEREKLİ]” işareti çevrilmeden geçiyor; İngilizce “Hakkımızda” ise “[SOURCE NEEDED]” diyor — ürünün gerçekte hangi işareti yazdığıyla tutarlı olmalı.
17. **Dil yönlendirmesi.** Dil çerezi İngilizce/Almanca olan ziyaretçi, Türkçe bir bağlantıya tıkladığında otomatik olarak /en veya /de sürümüne yönlendiriliyor; Türkçe metni görmek için önce dili değiştirmesi gerekiyor. Arama motorları etkilenmiyor (çerezsiz geliyorlar), ama paylaşılan Türkçe bağlantıyı açan yabancı dil kullanıcıları şaşırabilir.
18. **“DergiPark” ayrı bir veri tabanı gibi listeleniyor.** Ana sayfadaki kaynak listesinde DergiPark var; sistem DergiPark’ı doğrudan değil, OpenAlex üzerinden (Türkçe ve Türkiye adresli yayınlar) ve yeni sekmede arama bağlantısıyla kapsıyor. (Bu ifadenin kalmasına daha önce siz karar vermiştiniz; bilgi olarak not edildi.)
19. **Ton tutarsızlığı.** Ana sayfadaki karşılaştırma tablosu “doğrulamak sana kalır”, “elle düzenlersin” gibi “sen” diliyle yazılmış; sitenin geri kalanı “siz” diliyle.
20. **Eski vercel.app adresinin yönlendirmesi.** TODO’da “REDIRECT_TO_DOMAIN=1” açık; eski adres hâlâ siteyi ayrı bir adreste sunuyorsa yinelenen içerik oluşur. Bu oturumdan eski adrese erişilemediği için doğrulanamadı.
21. **Bağımlılıklar.** Güvenlik açığı yok (`npm audit`: 0). Bazı paketler gerideki sürümlerde (Supabase istemcisi 2.57 → 2.119, Anthropic SDK 1.3 → 1.8, TipTap 3.33 → 3.34); planlı bir güncelleme turu önerilir.

## D. Küçük

22. Hukuki belgelerin sürümü ve `SITE_CONTENT_UPDATED` 14 Kasım 2026 (yarın) olarak görünüyor.
23. `/.well-known/security.txt` ve `llms.txt` yok (isteğe bağlı).
24. İçerik güvenlik politikası satır içi betiklere izin veriyor (`'unsafe-inline'`); Next.js’te yaygın, ileride nonce’a geçilebilir.
25. Yönetim panelinde ve bazı eski uyarı metinlerinde “Tek Proje” adı geçiyor (eski koşullu paketler için doğru; yalnızca yönetici görüyor).
26. TODO.md’de eskiden kalan, büyük olasılıkla tamamlanmış ama işaretlenmemiş çok sayıda madde var (migration 14–19, ilk canlı denemeler); liste gerçek durumu yansıtmıyor.

## E. Temiz çıkan kontroller

- TypeScript, lint ve 571 test geçiyor; üretim derlemesi başarılı.
- 203 herkese açık sayfanın tamamı açılıyor (yalnızca bilinçli 404 sayfası 404); sayfalarda JavaScript hatası yok; 170 iç bağlantının hiçbiri kırık değil.
- Telefonda yana taşan sayfa yok; adı olmayan düğme/bağlantı, alt metni olmayan görsel, etiketsiz form alanı bulunmadı; her sayfada tek H1.
- Başlık, açıklama, canonical, hreflang, site haritası, robots, yapılandırılmış veri ve sosyal paylaşım görseli düzgün.
- Canlı güvenlik başlıkları tam: HSTS (preload), CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy; http→https ve alan adı yönlendirmesi çalışıyor.
- 98 API ucunun tamamı ortak güvenlik sarmalayıcısını kullanıyor (yalnızca giriş geri dönüş uçları hariç, bu doğru); “salt okunur” izin listesindeki her uç gerçekten var.
- Çerez/tarayıcı belleği envanteri kodla uyumlu; analitik çerezsiz.
- Paket adları, %20 yıllık indirim, %20 ekip indirimi, Sınırsız Proje (aylık 5 / yıllık 60 proje) SSS, fiyat sayfası, Adil Kullanım, Kullanım Koşulları ve Mesafeli Sözleşmeler’de tutarlı; “16 veri tabanı” ve “10 atıf stili” kodla uyumlu.

## F. Bu oturumda denetlenemeyenler

- Giriş gerektiren uygulama ekranları (çalışma alanı, hesap, yönetim): yerelde Supabase olmadığı için açılamadı; yalnızca kod düzeyinde incelendi.
- Akademik veri tabanı aramaları, e-posta gönderimi, Google/Apple girişi, WhatsApp satış akışı (bu ortamdan dış servislere erişim yok).
- Canlı veritabanının gerçek migration durumu (check_status.sql’i sizin çalıştırmanız gerekir).
