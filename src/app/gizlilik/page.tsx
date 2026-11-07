import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo-server";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  return pageMeta("/gizlilik");
}

const H3 = ({ children }: { children: React.ReactNode }) => <h3 className="mt-6 text-lg font-semibold text-ink-900">{children}</h3>;

export default async function Page() {
  if ((await getLocale()) === "en") {
    return (
      <StaticPage path="/gizlilik" title="Security and Privacy Policy" lead="How we protect your personal data, academic work and uploaded documents.">
        <p className="text-sm text-ink-500">Last updated: 08.11.2026</p>

        <h2>1. Purpose and scope</h2>
        <p>At Academiana, we consider the privacy and security of our users’ personal data, academic work, uploaded documents and the content they create on the platform among our core priorities.</p>
        <p>This Security and Privacy Policy sets out the principles for protecting information obtained through the use of the Academiana website, applications, academic workspaces, AI-assisted services, database integrations and related digital services.</p>
        <p>Our core approach is to prevent users’ academic work from being viewed, modified, copied or used by unauthorised persons.</p>

        <h2>2. Information and data protected</h2>
        <p>The following categories of information and data are protected within Academiana:</p>
        <ul>
          <li>Users’ name, surname, email address and account information.</li>
          <li>Theses, articles, research proposals and other academic work created by users.</li>
          <li>Project sections, texts, bibliographies, citations and literature records.</li>
          <li>PDF, Word and other files uploaded by users.</li>
          <li>Conversations with AI assistants and the outputs generated.</li>
          <li>Statistical analyses, surveys, data tables and research files.</li>
          <li>Usage, transaction, security and error logs.</li>
          <li>Information on subscriptions, plans and payment transactions.</li>
          <li>Co-authoring, advisor sharing and team membership information.</li>
        </ul>
        <p>Academic content uploaded by users may contain personal data, including personal data or special categories of personal data belonging to third parties. Users must comply with the applicable legislation when uploading such data to the platform.</p>

        <h2>3. Data security and technical safeguards</h2>
        <p>Academiana applies technical and administrative measures to keep personal data and academic content secure.</p>
        <H3>3.1. Encrypted communication</H3>
        <p>Data communication between the platform and the user takes place over HTTPS. Secure connection configurations and related security policies are used to reduce the risk of data being intercepted by unauthorised persons in transit.</p>
        <H3>3.2. Isolation of data between users</H3>
        <p>User data is protected by Row Level Security (RLS) policies applied at the database level.</p>
        <p>Each user’s projects, documents, sources and AI conversations are kept within that user’s own access rights.</p>
        <p>Technical access policies are designed to prevent any user from gaining unauthorised access to another user’s academic work.</p>
        <H3>3.3. File security</H3>
        <p>Documents uploaded by users are kept in private storage.</p>
        <p>Files are accessed through authorisation checks and time-limited signed links. Files are not, as a rule, accessible through public links.</p>
        <H3>3.4. Application security</H3>
        <p>The following mechanisms are used to support the platform’s application security:</p>
        <ul>
          <li>HTTPS and HTTP Strict Transport Security (HSTS).</li>
          <li>Content Security Policy (CSP).</li>
          <li>Request origin and authorisation checks.</li>
          <li>Security checks on outbound connections targeting internal networks.</li>
          <li>Database access policies.</li>
          <li>Error and system health monitoring.</li>
          <li>Automated software and regression tests.</li>
        </ul>
        <p>Security measures may be updated in line with technological developments and identified risks.</p>

        <h2>4. Privacy of academic work</h2>
        <p>Users’ academic work is, by default, accessible only to the user concerned. The following exceptions apply:</p>
        <p><strong>4.1. Co-authors:</strong> Co-authors invited to a project by the user may access the relevant sections, sources and comments within the permissions assigned to them.</p>
        <p><strong>4.2. Sharing with an advisor:</strong> Through a sharing link created at the user’s own request, an advisor or third parties may view, or comment on, the content permitted by that link. The user can revoke the link using the available sharing features.</p>
        <p><strong>4.3. Institution administrators:</strong> Under an institutional licence, institution administrators may be shown member information and usage statistics within the administrative permissions assigned to them. Institution administrators have no access to the content of users’ academic work.</p>
        <p><strong>4.4. Authorised platform staff:</strong> Platform administrators and authorised technical staff may obtain technical access only to the extent necessary to respond to a support request, carry out a security review, operate the system or fulfil legal obligations.</p>

        <h2>5. AI services and data privacy</h2>
        <p>Academiana uses Claude models provided by Anthropic for academic writing, text editing, source evaluation and other AI-assisted operations.</p>
        <p>When a user uses an AI feature, the text, project context and selected source content needed to carry out that operation may be sent to the relevant AI service provider.</p>
        <p>This transfer is made to deliver the requested service and is limited to the data required.</p>
        <p>Academiana does not intend to use users’ academic work to train its own AI models. The data processing and model training practices of AI providers are assessed within the framework of the relevant commercial API agreements and terms of service.</p>
        <p>User data is not sold for advertising purposes or made available to third parties for that purpose.</p>

        <h2>6. Where data is stored and infrastructure</h2>
        <p>Within the platform’s publicly disclosed infrastructure, the application, database and file storage services are hosted within the European Union, in the Frankfurt data centre region.</p>
        <p>Access to the infrastructure where data is stored is restricted by authorisation mechanisms.</p>
        <p>Data processing and cross-border transfers that third-party service providers may carry out on their own infrastructure are assessed separately under the relevant legislation and agreements.</p>

        <h2>7. Usage and security records</h2>
        <p>Certain transaction records may be kept to ensure the platform operates securely, calculate plan usage, resolve technical issues and prevent abuse.</p>
        <p>These records may include the date of the transaction, the related project or section, the amount of usage, AI outputs, deletions and security events.</p>
        <p>Certain transaction records kept to resolve disputes about plan usage are, under current practice, retained for 12 months. Access to these records is limited to authorised staff.</p>
        <p>A random device identifier may be used in the browser to prevent abuse. This identifier is not used for advertising or marketing.</p>

        <h2>8. Data retention and deletion</h2>
        <p>Personal data and academic content are kept for as long as required by the purposes for which they are processed and within the retention obligations set out in the applicable legislation.</p>
        <p>Using the features available in the account and subscription area, users can:</p>
        <ul>
          <li>Export their personal data and academic work in JSON format.</li>
          <li>Request deletion of their account and the data associated with it.</li>
        </ul>
        <p>Deletion may be subject to the relevant retention and destruction procedures for records that must be kept under the applicable legislation and for backups that cannot technically be deleted immediately.</p>

        <h2>9. Cookies and device identifiers</h2>
        <p>Academiana may use necessary cookies and device identifiers for session management, account security, operation of the service and prevention of abuse.</p>
        <p>If non-essential analytics, advertising or marketing cookies are used, the information and explicit consent mechanisms required by the applicable legislation will be applied.</p>
        <p>The types, purposes and retention periods of cookies are explained in the Cookie Policy (see <a href="#ayrintilar" className="text-brand-700 underline">Detailed information</a> below).</p>

        <h2>10. Data breaches and security incidents</h2>
        <p>If unlawful acquisition of personal data, unauthorised access or an event affecting data security is detected, the necessary investigation and response processes are carried out according to the nature of the incident and the legislation in force.</p>
        <p>Notifications required to be made to the persons concerned and the competent authorities are made in accordance with the legal time limits and procedures.</p>

        <h2>11. Updates to this policy</h2>
        <p>Academiana may update this policy in line with changes to its technological infrastructure, services, data processing activities or the relevant legislation.</p>
        <p>The current policy is published on the website.</p>

        <h2 id="ayrintilar">Detailed information</h2>
        <H3>Account data and sign-in</H3>
        <p>If you sign in with Google or Apple, we receive only your name and email address from that service (with Apple, possibly a private relay address); we never see your Google or Apple password. Payment details are processed by the payment provider; card details are never stored on our servers.</p>
        <H3>Visit statistics (no cookies)</H3>
        <p>To measure how many people visit the site, page views are counted without cookies. IP addresses and browser details are not stored; only an anonymous code that changes every day is kept, so a visitor cannot be identified or followed across days. Nothing is counted if your browser sends a “Do Not Track” or Global Privacy Control signal.</p>
        <H3>Usage records</H3>
        <p>To resolve disputes about plan usage, the AI outputs you receive (date, work and section title, word count and output text) and your deletions of works, sections or large parts of text are recorded. This record is kept for 12 months, is visible only to authorised administrators, is not used for any other purpose and is deleted together with your account.</p>
        <p>On the Single Project plan, a fingerprint of each full download is also stored: the word count, a 64-number summary from which the text cannot be reconstructed, and the cover details (author, university, department, supervisor). It is used only to detect whether different works are written within the plan, under the same retention and access rules.</p>
        <H3>Cookies and device identifier</H3>
        <p>Session cookies are used to keep you signed in. Your browser also stores a random device identifier that contains no personal information (in browser storage and a first-party cookie). Only its one-way summary (SHA-256) is saved with your account. It is used only to prevent abuse: if an account created with an invitation link signs up from a device the inviter has used, no referral reward is granted; on the Single Project plan, use of one account from many devices is reported to administrators as possible account sharing. It is not used for advertising or tracking and is deleted together with your account. No advertising or third-party analytics cookies are used.</p>
        <H3>Co-authors</H3>
        <p>Co-authors see the work’s sections, sources and comments; they never see the owner’s files or assistant chats. The email address entered for an invitation is stored only to deliver the invitation to the right person.</p>
        <H3>Your rights</H3>
        <p>From your account page you can download all your data in a portable format (JSON) and permanently delete your account with all its data. For your other rights under KVKK Article 11 and the GDPR, you can contact the data controller.</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage path="/gizlilik" title="Güvenlik ve Gizlilik Politikası" lead="Kişisel verilerinizi, akademik çalışmalarınızı ve yüklediğiniz belgeleri nasıl koruyoruz?">
      <p className="text-sm text-ink-500">Son güncelleme: 08.11.2026</p>

      <h2>1. Amaç ve Kapsam</h2>
      <p>Academiana olarak kullanıcılarımızın kişisel verilerinin, akademik çalışmalarının, yükledikleri belgelerin ve platform üzerinden oluşturdukları içeriklerin gizliliğini ve güvenliğini temel önceliklerimiz arasında kabul ediyoruz.</p>
      <p>İşbu Güvenlik ve Gizlilik Politikası; Academiana internet sitesi, uygulamaları, akademik çalışma alanları, yapay zekâ destekli hizmetleri, veri tabanı entegrasyonları ve bunlarla bağlantılı dijital hizmetlerin kullanımı sırasında elde edilen bilgilerin korunmasına ilişkin esasları düzenlemektedir.</p>
      <p>Platformumuzun temel yaklaşımı, kullanıcıların akademik çalışmalarının yetkisiz kişiler tarafından görüntülenmesini, değiştirilmesini, kopyalanmasını veya kullanılmasını önlemektir.</p>

      <h2>2. Korunan Bilgi ve Veri Türleri</h2>
      <p>Academiana kapsamında aşağıdaki bilgi ve veri kategorileri korunmaktadır:</p>
      <ul>
        <li>Kullanıcıların ad, soyad, e-posta adresi ve hesap bilgileri.</li>
        <li>Kullanıcıların oluşturduğu tez, makale, araştırma önerisi ve diğer akademik çalışmalar.</li>
        <li>Proje bölümleri, metinler, kaynakçalar, atıflar ve literatür kayıtları.</li>
        <li>Kullanıcılar tarafından yüklenen PDF, Word ve diğer dosyalar.</li>
        <li>Yapay zekâ asistanlarıyla gerçekleştirilen görüşmeler ve oluşturulan çıktılar.</li>
        <li>İstatistiksel analizler, anketler, veri tabloları ve araştırma dosyaları.</li>
        <li>Kullanım, işlem, güvenlik ve hata kayıtları.</li>
        <li>Abonelik, paket ve ödeme işlemlerine ilişkin bilgiler.</li>
        <li>Ortak çalışma, danışmanla paylaşım ve ekip üyeliği bilgileri.</li>
      </ul>
      <p>Kullanıcıların yükledikleri akademik içerikler, kişisel veri içerebileceği gibi üçüncü kişilere ait kişisel verileri veya özel nitelikli kişisel verileri de içerebilir. Kullanıcıların bu tür verileri platforma yüklerken ilgili mevzuata uygun hareket etmesi gerekir.</p>

      <h2>3. Veri Güvenliği ve Teknik Koruma Önlemleri</h2>
      <p>Academiana, kişisel verilerin ve akademik içeriklerin güvenliğini sağlamak amacıyla teknik ve idari tedbirler uygular.</p>
      <H3>3.1. Şifreli İletişim</H3>
      <p>Platform ile kullanıcı arasındaki veri iletişimi HTTPS protokolü üzerinden gerçekleştirilir. Güvenli bağlantı yapılandırmaları ve ilgili güvenlik politikaları kullanılarak iletişim sırasında verilerin yetkisiz kişiler tarafından ele geçirilmesi riskinin azaltılması hedeflenir.</p>
      <H3>3.2. Kullanıcılar Arası Veri İzolasyonu</H3>
      <p>Kullanıcı verileri, veritabanı seviyesinde uygulanan satır düzeyinde erişim denetimi (Row Level Security – RLS) politikalarıyla korunur.</p>
      <p>Her kullanıcının projeleri, belgeleri, kaynakları ve yapay zekâ görüşmeleri kendi erişim yetkileri kapsamında tutulur.</p>
      <p>Bir kullanıcının başka bir kullanıcının akademik çalışmalarına yetkisiz erişim sağlaması teknik erişim politikalarıyla engellenmeye çalışılır.</p>
      <H3>3.3. Dosya Güvenliği</H3>
      <p>Kullanıcıların yüklediği belgeler özel erişimli depolama alanlarında muhafaza edilir.</p>
      <p>Dosyalara erişim, yetkilendirme kontrolleri ve süreli imzalı bağlantılar aracılığıyla sağlanır. Dosyaların herkese açık bağlantılar üzerinden erişilebilir olması esas değildir.</p>
      <H3>3.4. Uygulama Güvenliği</H3>
      <p>Platformun uygulama güvenliğini desteklemek amacıyla aşağıdaki mekanizmalar kullanılmaktadır:</p>
      <ul>
        <li>HTTPS ve HTTP Strict Transport Security (HSTS).</li>
        <li>İçerik Güvenlik Politikası (Content Security Policy – CSP).</li>
        <li>İstek kaynağı ve yetkilendirme kontrolleri.</li>
        <li>İç ağlara yönelik dış bağlantı güvenlik kontrolleri.</li>
        <li>Veritabanı erişim politikaları.</li>
        <li>Hata ve sistem sağlığı izleme mekanizmaları.</li>
        <li>Otomatik yazılım ve regresyon testleri.</li>
      </ul>
      <p>Güvenlik önlemleri, teknolojik gelişmeler ve tespit edilen riskler doğrultusunda güncellenebilir.</p>

      <h2>4. Akademik Çalışmaların Gizliliği</h2>
      <p>Kullanıcıların akademik çalışmaları varsayılan olarak yalnızca ilgili kullanıcıya açıktır. Bununla birlikte aşağıdaki istisnalar geçerlidir:</p>
      <p><strong>4.1. Ortak yazarlar:</strong> Kullanıcı tarafından projeye davet edilen ortak yazarlar, kendilerine tanımlanan yetkiler kapsamında ilgili çalışma bölümlerine, kaynaklara ve yorumlara erişebilir.</p>
      <p><strong>4.2. Danışmanla paylaşım:</strong> Kullanıcının kendi isteğiyle oluşturduğu paylaşım bağlantısı üzerinden danışman veya üçüncü kişiler, bağlantı kapsamında izin verilen içerikleri görüntüleyebilir veya yorum yapabilir. Kullanıcı, mevcut paylaşım özellikleri çerçevesinde bağlantıyı iptal edebilir.</p>
      <p><strong>4.3. Kurum yöneticileri:</strong> Kurum lisansı kapsamında kurum yöneticilerine, kendilerine tanımlanan yönetim yetkileri çerçevesinde üye bilgileri ve kullanım istatistikleri gösterilebilir. Kurum yöneticilerinin kullanıcıların akademik çalışma içeriklerine erişimi bulunmaz.</p>
      <p><strong>4.4. Yetkili platform personeli:</strong> Platform yöneticileri ve yetkilendirilmiş teknik personel, yalnızca destek talebinin karşılanması, güvenlik incelemesi, sistemin işletilmesi veya hukuki yükümlülüklerin yerine getirilmesi için gerekli olduğu ölçüde teknik erişim sağlayabilir.</p>

      <h2>5. Yapay Zekâ Hizmetleri ve Veri Gizliliği</h2>
      <p>Academiana, akademik yazım, metin düzenleme, kaynak değerlendirme ve diğer yapay zekâ destekli işlemlerde Anthropic tarafından sunulan Claude modellerinden yararlanır.</p>
      <p>Kullanıcının bir yapay zekâ özelliğini kullanması durumunda, ilgili işlemin gerçekleştirilmesi için gerekli olan metin, proje bağlamı ve seçilmiş kaynak içerikleri ilgili yapay zekâ hizmet sağlayıcısına iletilebilir.</p>
      <p>Bu aktarım, talep edilen hizmetin yerine getirilmesi amacıyla ve gerekli veriyle sınırlı olarak gerçekleştirilir.</p>
      <p>Academiana, kullanıcıların akademik çalışmalarını kendi yapay zekâ modellerini eğitmek amacıyla kullanmayı amaçlamaz. Yapay zekâ sağlayıcılarının veri işleme ve model eğitimi uygulamaları, ilgili ticari API sözleşmeleri ve hizmet koşulları çerçevesinde değerlendirilir.</p>
      <p>Kullanıcı verileri, reklam amacıyla satılmaz veya bu amaçla üçüncü kişilere sunulmaz.</p>

      <h2>6. Verilerin Saklandığı Yer ve Altyapı</h2>
      <p>Platformun kamuya açıklanan altyapısı kapsamında uygulama, veri tabanı ve dosya depolama hizmetleri Avrupa Birliği sınırları içerisinde, Frankfurt veri merkezi bölgesinde barındırılmaktadır.</p>
      <p>Verilerin saklandığı altyapıya erişim yetkilendirme mekanizmalarıyla sınırlandırılır.</p>
      <p>Üçüncü taraf hizmet sağlayıcıların kendi altyapılarında gerçekleştirebileceği veri işleme ve yurt dışına aktarım faaliyetleri ayrıca ilgili mevzuat ve sözleşmeler çerçevesinde değerlendirilir.</p>

      <h2>7. Kullanım ve Güvenlik Kayıtları</h2>
      <p>Platformun güvenli çalışmasını sağlamak, paket kullanım haklarını hesaplamak, teknik sorunları gidermek ve kötüye kullanımı önlemek amacıyla belirli işlem kayıtları tutulabilir.</p>
      <p>Bu kayıtlar; işlem tarihi, ilgili proje veya bölüm bilgisi, kullanım miktarı, yapay zekâ çıktısı, silme işlemleri ve güvenlik olayları gibi bilgileri içerebilir.</p>
      <p>Paket kullanımına ilişkin anlaşmazlıkların çözümü amacıyla tutulan belirli işlem kayıtları, mevcut uygulama kapsamında 12 ay süreyle saklanır. Bu kayıtların erişimi yetkili personelle sınırlandırılır.</p>
      <p>Kötüye kullanımın önlenmesi amacıyla tarayıcıda rastgele bir cihaz tanımlayıcısı kullanılabilir. Bu tanımlayıcı, reklam veya pazarlama amacıyla kullanılmaz.</p>

      <h2>8. Veri Saklama ve Silme</h2>
      <p>Kişisel veriler ve akademik içerikler, işlenme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen saklama yükümlülükleri çerçevesinde muhafaza edilir.</p>
      <p>Kullanıcılar hesap ve abonelik alanındaki mevcut özellikler üzerinden:</p>
      <ul>
        <li>Kişisel verilerini ve akademik çalışmalarını JSON formatında dışa aktarabilir.</li>
        <li>Hesaplarının ve hesapla ilişkili verilerinin silinmesini talep edebilir.</li>
      </ul>
      <p>Silme işlemleri, ilgili mevzuat kapsamında saklanması zorunlu olan kayıtlar ve teknik olarak derhal silinemeyen yedekler bakımından ilgili saklama ve imha prosedürlerine tabi olabilir.</p>

      <h2>9. Çerezler ve Cihaz Tanımlayıcıları</h2>
      <p>Academiana, oturum yönetimi, hesap güvenliği, hizmetin çalışması ve kötüye kullanımın önlenmesi amacıyla gerekli çerezler ve cihaz tanımlayıcılarından yararlanabilir.</p>
      <p>Zorunlu olmayan analitik, reklam veya pazarlama çerezleri kullanılması hâlinde, ilgili mevzuatın gerektirdiği bilgilendirme ve açık rıza mekanizmaları uygulanır.</p>
      <p>Çerezlerin türleri, amaçları ve saklama süreleri ilgili Çerez Politikası kapsamında açıklanır (aşağıdaki <a href="#ayrintilar" className="text-brand-700 underline">Ayrıntılı bilgilendirme</a> bölümüne bakınız).</p>

      <h2>10. Veri İhlalleri ve Güvenlik Olayları</h2>
      <p>Kişisel verilerin hukuka aykırı şekilde elde edilmesi, yetkisiz erişim veya veri güvenliğini etkileyen bir olayın tespit edilmesi durumunda, olayın niteliğine ve yürürlükteki mevzuata uygun olarak gerekli inceleme ve müdahale süreçleri yürütülür.</p>
      <p>İlgili kişilere ve yetkili kurumlara yapılması gereken bildirimler yasal süre ve usullere uygun şekilde gerçekleştirilir.</p>

      <h2>11. Politikanın Güncellenmesi</h2>
      <p>Academiana, teknolojik altyapısında, hizmetlerinde, veri işleme süreçlerinde veya ilgili mevzuatta meydana gelen değişiklikler doğrultusunda bu politikayı güncelleyebilir.</p>
      <p>Güncel politika internet sitesi üzerinden yayımlanır.</p>

      <h2 id="ayrintilar">Ayrıntılı bilgilendirme</h2>
      <H3>Hesap bilgileri ve giriş</H3>
      <p>Google veya Apple ile giriş yaparsanız bu hizmetten yalnızca adınızı ve e-posta adresinizi (Apple’da gizli yönlendirme adresi olabilir) alırız; Google veya Apple şifrenizi hiçbir zaman görmeyiz. Ödeme bilgileri ödeme sağlayıcısı tarafından işlenir; kart bilgileri sunucularımızda saklanmaz.</p>
      <H3>Ziyaret istatistikleri (çerezsiz)</H3>
      <p>Sitenin kaç kişi tarafından ziyaret edildiğini ölçmek için sayfa görüntülemeleri çerez kullanılmadan sayılır. IP adresi ve tarayıcı bilgisi saklanmaz; yalnızca her gün değişen anonim bir kod tutulur, bu nedenle ziyaretçi kimliği belirlenemez ve günler arasında izlenemez. Tarayıcınız “izleme yapma” (Do Not Track / Global Privacy Control) sinyali gönderiyorsa hiçbir sayım yapılmaz.</p>
      <H3>Kullanım kaydı</H3>
      <p>Paket kullanımına ilişkin anlaşmazlıkların çözümü için aldığınız yapay zekâ çıktıları (tarih, çalışma ve bölüm adı, kelime sayısı ve çıktı metni) ile çalışma, bölüm veya büyük metin silmeleriniz kaydedilir. Bu kayıt 12 ay saklanır, yalnızca yetkili yöneticiler görebilir, başka bir amaçla kullanılmaz ve hesabınızla birlikte silinir.</p>
      <p>Tek Proje paketinde ayrıca her tam indirmenin parmak izi saklanır: kelime sayısı, metnin geri elde edilemeyeceği 64 sayılık bir özet ve kapak bilgileri (yazar, üniversite, bölüm, danışman). Yalnızca paket içinde farklı çalışmalar yazılıp yazılmadığını anlamak için, aynı saklama ve erişim kurallarıyla kullanılır.</p>
      <H3>Çerezler ve cihaz kimliği</H3>
      <p>Oturumunuzun açık kalması için oturum çerezleri kullanılır. Ayrıca tarayıcınızda kişisel bilgi içermeyen rastgele bir cihaz kimliği saklanır (tarayıcı belleği ve birinci taraf çerez). Hesabınızla birlikte yalnızca bu kimliğin geri çözülemeyen özeti (SHA-256) kaydedilir. Yalnızca kötüye kullanımı önlemek için kullanılır: davet bağlantısıyla açılan hesap, davet edenin kullandığı bir cihazdan kaydolursa davet ödülü verilmez; Tek Proje paketinde tek hesabın çok sayıda cihazdan kullanılması olası hesap paylaşımı olarak yöneticilere bildirilir. Reklam veya izleme için kullanılmaz; hesabınızla birlikte silinir. Reklam veya üçüncü taraf analitik çerezi kullanılmaz.</p>
      <H3>Ortak yazarlar</H3>
      <p>Ortak yazarlar çalışmanın bölümlerini, kaynaklarını ve yorumlarını görür; sahibin dosyalarını ve asistan sohbetlerini göremez. Davet için girilen e-posta adresi yalnızca daveti doğru kişiye ulaştırmak için saklanır.</p>
      <H3>Haklarınız</H3>
      <p>Hesap sayfanızdan tüm verilerinizi taşınabilir biçimde (JSON) indirebilir ve hesabınızı tüm verilerinizle birlikte kalıcı olarak silebilirsiniz. 6698 sayılı KVKK md. 11 ve GDPR kapsamındaki diğer talepleriniz için veri sorumlusuna başvurabilirsiniz.</p>
    </StaticPage>
  );
}

export const dynamic = "force-dynamic";
