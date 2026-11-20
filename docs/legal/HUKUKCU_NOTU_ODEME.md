# Hukukçu için not — kartla ödeme (PayTR) (20 Kasım 2026)

**Güncelleme (20 Kasım 2026, D226):** Site sahibinin talimatıyla KVKK Aydınlatma Metni, Çerez Politikası, Mesafeli Sözleşmeler ve Ön Bilgilendirme ile GDPR bildirimi aşağıdaki konularda güncellendi (sürüm 2026-11-20): satıcı/veri sorumlusu bilgileri (vergi levhası; T.C. kimlik no yazılmadı), PayTR ile kartla ödeme ve aktarılan veriler, ödeme kayıtlarının hesap silinse de yasal süre saklanması, sözleşmenin ödeme onayıyla kurulması, tek çekim ve TL tahsilat, aylık 30 / yıllık 365 gün ve süre ekleme kuralı, dijital hizmetin hemen başlaması için ayrı onay (ödeme ekranında zorunlu kutu), karta iade, Tüketici Hakem Heyeti/Mahkemesi, sipariş özetinin Hesap → Siparişlerim’den indirilebilir belge olarak verilmesi. Kullanım Koşulları değiştirilmedi. Aşağıdaki sorular ve bu değişikliklerin incelenmesi rica olunur.

Ödeme ekranındaki onay metni: “Hizmetin ödeme onaylanır onaylanmaz başlamasını talep ediyorum. Elektronik ortamda anında ifa edilen bu dijital hizmette, ifaya başlandıktan sonra cayma hakkının mevzuatın öngördüğü ölçüde kullanılamayacağını okudum.”

## Yeni hizmet

**PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş. (Türkiye)** — lisanslı ödeme kuruluşu.
- Kullanıcı kart bilgilerini PayTR’nin güvenli ödeme sayfasında (sitemizde bir çerçeve içinde) girer. Kart bilgisi Academiana’ya gelmez ve saklanmaz.
- PayTR’ye aktarılan veriler: ad soyad, e-posta, telefon, fatura adresi, IP adresi, sipariş numarası, paket adı ve tutar.
- Academiana’da saklananlar (`payment_orders`): sipariş numarası, paket, dönem, tutar, ödeme durumu, ad soyad, telefon, fatura adresi, ödeme türü (ör. kart), başarısızlık nedeni.
- Ödeme yöntemi: tek çekim (taksit yok), otomatik yenileme yok. Aylık paket 30 gün, yıllık paket 365 gün geçerli.
- WhatsApp ile ödeme seçeneği sürüyor.

## Kontrol edilmesi önerilen metinler

- **KVKK Aydınlatma Metni ve Gizlilik Politikası**
  - Aktarım alıcıları arasında Supabase, Vercel ve Anthropic sayılıyor. Ödeme kuruluşu (PayTR) eklenmeli mi?
  - Ödeme sırasında toplanan fatura bilgileri (ad soyad, telefon, adres) için işleme amacı ve hukuki sebep yeterince kapsanıyor mu?
- **Mesafeli Sözleşmeler ve Ön Bilgilendirme**
  - Ödeme yöntemi “kartla (PayTR) veya WhatsApp üzerinden bildirilen yöntemle” olarak yazılmalı mı?
  - Paket süreleri ve bitiş kuralı: aynı paket süresi bitmeden yeniden alınırsa süre kalan sürenin üstüne eklenir; başka pakete geçişte yeni süre o gün başlar, önceki paketin kalan süresi için iade/kıst hesap yapılmaz. Bu kural metinde yer almalı mı?
  - Cayma hakkı ve iade: dijital hizmetin ifasına onayla başlanması durumu ve iadenin PayTR üzerinden karta yapılması.
- **Çerez Politikası**
  - Sitemiz yeni çerez veya tarayıcı belleği kullanmıyor. PayTR’nin ödeme çerçevesi kendi alan adında (paytr.com) kendi çerezlerini kullanabilir; bunun politikada belirtilmesi gerekir mi?
- **Fatura**
  - Ödeme sonrası e-Arşiv faturanın kim tarafından ve hangi bilgilerle (T.C. kimlik no gerekip gerekmediği) kesileceği.

Metinlerde değişiklik gerekirse `docs.ts` içindeki sürüm numarası artırılacak; Kullanım Koşulları değişirse kullanıcılardan yeniden onay istenecek.
