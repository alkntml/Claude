# Hukukçu için not — kurumsal e-posta ve e-posta gönderim hizmeti (14 Kasım 2026)

Hukuki metinler değiştirilmedi. Aşağıdaki yeni hizmetlerin mevcut metinlerle uyumunu değerlendirmenizi rica ederiz.

## Yeni hizmetler

1. **E-posta gönderim hizmeti: Resend (Resend, Inc., ABD; gönderim bölgesi AB/İrlanda)**
   - Supabase’in kimlik doğrulama e-postaları bu hizmet üzerinden gönderilecek:
     - kayıt doğrulama,
     - parola sıfırlama,
     - e-posta değişikliği,
     - davet.
   - Hizmete aktarılan veriler: alıcının e-posta adresi ve e-postanın içeriği (doğrulama bağlantısı).
2. **Kurumsal e-posta kutusu: Google Workspace / Gmail (Google LLC, ABD)**
   - Örnek adres: iletisim@academiana.com.tr.
   - Kullanıcıların ve kurumların bize yazdığı e-postalar burada saklanacak.

## Kontrol edilmesi önerilen metinler

- **KVKK Aydınlatma Metni ve Gizlilik Politikası**
  - “Verilerin aktarıldığı alıcı grupları ve yurt dışına aktarım” bölümünde Supabase, Vercel ve Anthropic sayılıyor.
  - E-posta gönderim hizmeti (Resend) ve kurumsal e-posta sağlayıcısı (Google Workspace) eklenmeli mi?
- **Yurt dışına aktarım dayanağı**
  - Her iki şirket de yurt dışında.
  - Mevcut aktarım güvencesi ifadeleri bu hizmetleri de kapsıyor mu?
- **Başvuru kanalı**
  - Veri sahibi başvuruları için metinlerde iletişim e-posta adresi yer alacaksa yeni adres eklenmeli.

Metinlerde değişiklik gerekirse `docs.ts` içindeki sürüm numarası artırılacak. Kullanım Koşulları değişirse kullanıcılardan yeniden onay istenecek.
