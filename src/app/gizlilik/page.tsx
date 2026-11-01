import { StaticPage } from "@/components/static-page";
export const metadata = { title: "Gizlilik ve KVKK" };
export default function Page() {
  return (
    <StaticPage title="Gizlilik ve KVKK aydınlatma metni" lead="Kişisel verileriniz ve akademik çalışmalarınız nasıl işlenir?">
      <p>Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) kapsamında hazırlanmış bir şablondur. Yayına almadan önce veri sorumlusu bilgileriyle güncellenmeli ve hukuki inceleme yapılmalıdır.</p>
      <h2>İşlenen veriler</h2>
      <ul><li>Hesap bilgileri: ad soyad, e-posta, kurum.</li><li>Akademik içerik: projeler, bölüm metinleri, kaynaklar, yüklenen dosyalar, yapay zekâ sohbetleri.</li><li>Kullanım verileri: istek sayıları, token kullanımı, hata kayıtları.</li><li>Ödeme bilgileri: ödeme sağlayıcısı tarafından işlenir; kart bilgileri sunucularımızda saklanmaz.</li></ul>
      <h2>İşleme amaçları</h2>
      <p>Hizmetin sunulması, kullanım limitlerinin uygulanması, güvenliğin sağlanması ve yasal yükümlülüklerin yerine getirilmesi.</p>
      <h2>Yapay zekâ sağlayıcılarına aktarım</h2>
      <p>Yapay zekâ özellikleri kullanıldığında ilgili bölüm metni, proje bağlamı ve seçili kaynak özetleri yapılandırılmış yapay zekâ sağlayıcısına (ör. Anthropic) iletilir. Bu aktarım yalnızca isteğinizi yanıtlamak için yapılır.</p>
      <h2>Haklarınız</h2>
      <p>Hesap sayfanızdan tüm verilerinizi taşınabilir biçimde (JSON) indirebilir ve hesabınızı tüm verilerinizle birlikte kalıcı olarak silebilirsiniz. KVKK md. 11 kapsamındaki diğer talepleriniz için veri sorumlusuna başvurabilirsiniz.</p>
      <h2>Güvenlik</h2>
      <p>Veriler satır düzeyinde erişim politikalarıyla (RLS) korunur. Hiçbir kullanıcı başka bir kullanıcının çalışmasına erişemez. Dosyalar özel depolama alanında tutulur ve yalnızca süreli imzalı bağlantılarla indirilebilir.</p>
    </StaticPage>
  );
}

export const dynamic = "force-dynamic";
