/**
 * D204: KVKK veri dışa aktarımının Türkçe okuma rehberi. Saf modül (testlenir). Alıcı, saklama ve haklar cümleleri
 * KVKK Aydınlatma Metni’nden (lib/legal/content-tr.ts) özetlenmiştir; metin değişirse burası da gözden geçirilir.
 */
export interface GuideSection { key: string; name: string; desc: string; group: string }

const S = (group: string, key: string, name: string, desc: string): GuideSection => ({ group, key, name, desc });

export const EXPORT_GUIDE = {
  header: {
    baslik: "Academiana kişisel veri dökümü",
    amac: "Bu dosya, KVKK’nın 11. maddesi kapsamındaki bilgi talebiniz üzerine hesabınıza bağlı olarak tuttuğumuz tüm kayıtları içerir. Biçim, verilerinizi başka bir sisteme de taşıyabilmeniz için makinece okunabilir JSON’dur; aşağıdaki “bolumler” listesi her bölümde ne olduğunu sade dille açıklar.",
    nasil_okunur: "Her bölüm bir kayıt listesidir. Tarihler UTC (Türkiye saatinden 3 saat geri) olarak yazılmıştır. “id” ile biten alanlar sistem içi kayıt numaralarıdır. Boş liste ([]) o türde kaydınız olmadığı anlamına gelir.",
    alicilar: "Hizmetin sunulması kapsamında veriler; veritabanı, kimlik doğrulama ve dosya depolama için Supabase’e; barındırma ve dağıtım için Vercel’e; yapay zekâ özellikleri kullanıldığında Anthropic’e (Claude) aktarılabilir. Google ve Apple yalnızca ilgili sosyal giriş seçildiğinde kimlik doğrulamaya dahil olur. Akademik kaynak aramalarında kaynak servislerine yalnızca arama terimleri ve DOI gönderilir; kullanıcı kimliği gönderilmez. Ayrıntı: KVKK Aydınlatma Metni.",
    saklama: "Hesap, akademik içerik, dosyalar, sohbetler, sayaçlar, cihaz kimliği özeti ve bildirimler kural olarak hesap silinene kadar saklanır. Tam metinli yapay zekâ kullanım kanıtları (silinen çalışmalara ait olanlar dahil) hesap silinene kadar saklanır. Geri bildirim ve hata kayıtları süresiz saklanabilir; hesap silindikten sonra kullanıcıyla bağlantısı kaldırılır.",
    haklariniz: "Verilerinizin düzeltilmesini veya silinmesini isteyebilir, hesabınızı Hesap → Gizlilik ve Veri Yönetimi’nden tüm verilerinizle birlikte silebilirsiniz. Veri talebine 30 gün içinde ücretsiz yanıt verilir.",
    disarida_kalanlar: "Yüklediğiniz dosyaların kendisi bu dökümde yer almaz (dosya listesi “files” bölümündedir; dosyaları çalışma alanından indirebilirsiniz). Parolanız platformda geri çözülemeyecek biçimde saklandığı için dökümde yoktur. Zotero anahtarınız şifreli tutulur ve güvenlik nedeniyle verilmez.",
    iletisim: "iletisim@academiana.com.tr · https://www.academiana.com.tr/kvkk",
  },
  sections: [
    S("Hesap", "profile", "Profil", "Ad, e-posta, kurum, paket ve süresi, arayüz dili, varsayılan atıf stili, üye numarası, kayıt tarihi."),
    S("Hesap", "legal_acceptances", "Hukuki kabuller", "Kabul ettiğiniz veya bilgilendirildiğiniz metinler (Kullanım Koşulları, KVKK), sürümleri ve tarihleri."),
    S("Hesap", "data_requests", "Veri talepleri", "Oluşturduğunuz KVKK veri talepleri ve durumları."),
    S("Hesap", "notifications", "Bildirimler", "Size gönderilen site içi bildirimler."),
    S("Hesap", "user_devices", "Cihaz kimlikleri", "Tarayıcınızda oluşturulan rastgele cihaz kimliğinin geri çözülemeyen özeti; ilk ve son görülme tarihleri. Hesap güvenliği ve kötüye kullanımın önlenmesi için tutulur."),
    S("Hesap", "organization_memberships", "Kurum üyelikleri", "Kurumsal lisans üyelikleriniz ve rolünüz."),
    S("Hesap", "org_audit_log", "Kurum işlem kaydı", "Kurum yöneticisi olarak yaptığınız veya sizi etkileyen kurum işlemleri (yalnızca işlem türü ve tarih)."),
    S("Çalışmalar", "projects", "Çalışmalar", "Oluşturduğunuz tez, makale ve diğer çalışmalar: başlık, konu, tür, düzey, ayarlar."),
    S("Çalışmalar", "project_stages", "Bölümler", "Çalışmalarınızın bölümleri ve bölüm metinleri."),
    S("Çalışmalar", "stage_revisions", "Sürüm geçmişi", "Bölümlerinizin kaydedilmiş önceki sürümleri."),
    S("Çalışmalar", "stage_comments", "Yorumlar", "Bölümlere yazdığınız yorumlar."),
    S("Çalışmalar", "project_memory", "Çalışma hafızası", "Yapay zekânın çalışmanızla ilgili hatırladığı notlar."),
    S("Çalışmalar", "files", "Dosyalar (liste)", "Yüklediğiniz dosyaların adı, türü ve boyutu. Dosyaların kendisi bu dökümde yoktur."),
    S("Çalışmalar", "quality_reports", "Kalite raporları", "Kalite kontrol sonuçları."),
    S("Çalışmalar", "claim_audits", "İddia denetimleri", "Atıflı cümlelerin kaynak metniyle karşılaştırılma sonuçları."),
    S("Çalışmalar", "review_records", "Derleme kayıtları", "Sistematik derleme (PRISMA) tarama ve eleme kayıtları."),
    S("Çalışmalar", "user_templates", "Kayıtlı şablonlar", "Kaydettiğiniz çalışma yapısı şablonları."),
    S("Çalışmalar", "template_change_logs", "Yapı değişiklikleri", "Çalışma yapısında (bölüm ekleme, gizleme, şablon uygulama) yaptığınız değişikliklerin kaydı."),
    S("Kaynaklar", "sources", "Kaynaklar", "Çalışmalarınıza eklediğiniz kaynaklar: künye, özet, doğrulama durumu, okuma düzeyi (tam metin / özet / künye), notlarınız."),
    S("Kaynaklar", "source_links", "Zotero / ORCID bağlantıları", "Bağladığınız kaynak hesapları ve son eşitleme bilgisi (anahtar hariç)."),
    S("Yapay zekâ", "ai_conversations", "Sohbetler", "Asistanla yaptığınız sohbetlerin listesi."),
    S("Yapay zekâ", "ai_messages", "Sohbet mesajları", "Sohbetlerdeki sizin ve asistanın mesajları."),
    S("Yapay zekâ", "activity_log", "Kullanım kanıt kaydı", "Yapay zekâ çıktılarının tam metni, tarih, çalışma ve bölüm adı, kelime sayısı ile silme kayıtları. Silinen çalışmalara ait kayıtlar da hesap silinene kadar saklanır."),
    S("Kullanım", "usage_events", "Kullanım kayıtları", "Yapay zekâ isteği, kaynak taraması, dışa aktarma gibi işlemler; kullanılan model, token ve maliyet sayaçları."),
    S("Kullanım", "tool_usage", "Ücretsiz araç kullanımı", "Giriş yapmışken kullandığınız ücretsiz araçlar (ör. uydurma kaynak kontrolü)."),
    S("Kullanım", "usage_credits", "Ek kullanım hakları", "Size tanımlanan ek haklar ve geçerlilik süreleri."),
    S("Kullanım", "subscriptions", "Abonelikler", "Ödeme sağlayıcısı üzerinden abonelik kayıtları."),
    S("Kullanım", "plan_purchases", "Paket tanımlama kayıtları", "Paket atamalarında kaydedilen ödeme bilgileri (ödeyen adı, telefon, tutar, not)."),
    S("Kullanım", "download_passes", "İndirme hakları", "Tek Proje paketinde tanımlanan indirme hakları."),
    S("Kullanım", "export_fingerprints", "İndirme izleri", "Tek Proje paketinde indirilen metinlerin kelime sayısı, geri elde edilemeyen özeti ve kapak bilgileri."),
    S("Paylaşım", "project_shares", "Danışman paylaşım bağlantıları", "Oluşturduğunuz salt okunur paylaşım bağlantıları."),
    S("Paylaşım", "project_memberships", "Ortak yazarlık", "Ortak yazar veya yorumcu olarak katıldığınız çalışmalar."),
    S("Paylaşım", "project_invites_sent", "Gönderdiğiniz davetler", "Çalışmalarınıza davet ettiğiniz kişilerin e-posta adresi, rolü ve davetin durumu."),
    S("Paylaşım", "project_invites_received", "Aldığınız davetler", "E-posta adresinize gelen ortak yazarlık davetleri."),
    S("Anketler", "surveys", "Anketler", "Oluşturduğunuz anketler ve soruları."),
    S("Anketler", "survey_responses", "Anket cevapları", "Anketlerinize gelen cevaplar."),
    S("Destek", "feedback", "Geri bildirimler", "Gönderdiğiniz geri bildirimler ve durumu."),
    S("Destek", "error_logs", "Hata kayıtları", "Hesabınızla yapılan işlemlerde oluşan hata kayıtları (sayfa ve hata mesajı; kişisel bilgiler maskelenir)."),
  ] as GuideSection[],
};
