import { StaticPage } from "@/components/static-page";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getLocale()) === "en" ? "Privacy" : "Gizlilik ve KVKK" };
}

export default async function Page() {
  if ((await getLocale()) === "en") {
    return (
      <StaticPage title="Privacy notice" lead="How your personal data and academic work are processed.">
        <p>This notice is a template prepared under Turkey&apos;s Personal Data Protection Law (KVKK) and the EU General Data Protection Regulation (GDPR). It must be completed with the data controller&apos;s details and reviewed by a lawyer before publication.</p>
        <h2>Data we process</h2>
        <ul><li>Account data: name, email, institution. If you sign in with Google or Apple, we receive only your name and email address from that service (with Apple, possibly a private relay address); we never see your Google or Apple password.</li><li>Academic content: projects, section texts, sources, uploaded files, AI conversations.</li><li>Usage data: request counts, token usage, error logs.</li><li>Payment data: processed by the payment provider; card details are never stored on our servers.</li></ul>
        <h2>Purposes</h2>
        <p>Providing the service, enforcing usage limits, ensuring security and meeting legal obligations.</p>
        <h2>Transfer to AI providers</h2>
        <p>When you use AI features, the relevant section text, project context and selected source abstracts are sent to the configured AI provider (e.g. Anthropic) solely to answer your request.</p>
        <h2>Your rights</h2>
        <p>From your account page you can download all your data in a portable format (JSON) and permanently delete your account with all its data. For other requests, contact the data controller.</p>
        <h2>Security</h2>
        <p>Data is protected with row-level security (RLS) policies; no user can access another user&apos;s work. Files are kept in private storage and can only be downloaded through time-limited signed links.</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage title="Gizlilik ve KVKK aydınlatma metni" lead="Kişisel verileriniz ve akademik çalışmalarınız nasıl işlenir?">
      <p>Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) kapsamında hazırlanmış bir şablondur. Yayına almadan önce veri sorumlusu bilgileriyle güncellenmeli ve hukuki inceleme yapılmalıdır.</p>
      <h2>İşlenen veriler</h2>
      <ul><li>Hesap bilgileri: ad soyad, e-posta, kurum. Google veya Apple ile giriş yaparsanız bu hizmetten yalnızca adınızı ve e-posta adresinizi (Apple’da gizli yönlendirme adresi olabilir) alırız; Google veya Apple şifrenizi hiçbir zaman görmeyiz.</li><li>Akademik içerik: projeler, bölüm metinleri, kaynaklar, yüklenen dosyalar, yapay zekâ sohbetleri.</li><li>Kullanım verileri: istek sayıları, token kullanımı, hata kayıtları.</li><li>Ödeme bilgileri: ödeme sağlayıcısı tarafından işlenir; kart bilgileri sunucularımızda saklanmaz.</li></ul>
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
