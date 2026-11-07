import Link from "@/components/l-link";
import { pageMeta } from "@/lib/seo-server";
import { StaticPage } from "@/components/static-page";
import { getT } from "@/i18n/server";
import { getSetting } from "@/lib/settings";
import { TEAM_DISCOUNT, whatsappLink } from "@/lib/pricing";

export async function generateMetadata() {
  return pageMeta("/kurumlar");
}
export const dynamic = "force-dynamic";

/** Kurumsal lisans tanıtımı: üniversiteler, enstitüler, araştırma grupları */
export default async function Institutions() {
  const [{ t }, contact] = await Promise.all([getT(), getSetting("site.contact")]);
  const waHref = whatsappLink(t("Merhaba, Academiana kurum lisansı / Akademik Ekip İndirimi için teklif almak istiyorum.\nKurum / bölüm / ekip adı: \nKişi sayısı: \nİlgilendiğimiz paket: "));
  const items = [
    ["Toplu lisans", "Belirlediğiniz sayıda kullanıcıya Pro veya Premium paket; tek fatura, yıllık sözleşme."],
    ["Kolay katılım", "Öğrencileriniz kurum koduyla katılır. İsterseniz yalnızca kurum e-posta uzantısıyla (ör. @universite.edu.tr) katılıma izin verilir."],
    ["Kurum yöneticisi paneli", "Üye sayısı, katılım kodu ve aylık kullanım özeti; başka üyelere yönetici rolü verme, CSV raporu ve kimin katılıp ayrıldığını gösteren işlem kaydı. Gizlilik gereği öğrencilerin çalışma içerikleri kurumla paylaşılmaz."],
    ["Araştırma yöntemine uygun araçlar", "İddia denetimi (atıflı her cümle kaynağıyla karşılaştırılır), PRISMA 2020 sistematik derleme, literatür haritası ve teslim öncesi kontrol listesi. Kalite puanının yöntemi herkese açıktır."],
    ["Akademik dürüstlük", "Uydurma kaynak yok, erişim seviyesi şeffaflığı, her atıf doğrulanabilir kaynağa bağlı. Kurumunuzun yapay zekâ politikasıyla uyumlu kullanım."],
    ["Veri güvenliği", "Avrupa Birliği’nde (Frankfurt) barındırma, satır düzeyinde erişim denetimi, KVKK uyumlu veri silme ve dışa aktarma."],
  ];
  return (
    <StaticPage path="/kurumlar" title={t("Kurumlar için Academiana")} lead={t("Üniversiteler, enstitüler ve araştırma grupları için toplu lisans.")}>
      <div className="card mb-4 border-brand-200 bg-brand-50/60 p-5">
        <p className="font-semibold text-ink-900">{t("Akademik Ekip İndirimi: %{p}", { p: TEAM_DISCOUNT.percent })}</p>
        <p className="mt-1 text-[14.5px] text-ink-600">{t("Akademisyen grupları, araştırma ekipleri, laboratuvarlar ve bölümler için: en az {n} kişilik ekiplerde tüm ücretli paketlerde %{p} indirim.", { n: TEAM_DISCOUNT.minMembers, p: TEAM_DISCOUNT.percent })}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([h, b]) => <div key={h} className="card p-5"><p className="font-semibold text-ink-900">{t(h)}</p><p className="mt-1 text-[14.5px] text-ink-600">{t(b)}</p></div>)}
      </div>
      <p className="text-sm text-ink-500">{t("Kaynak doğrulama, iddia denetimi ve kalite puanının nasıl çalıştığı:")} <Link href="/yontem" className="font-medium text-brand-700 hover:underline">{t("Yöntem ve şeffaflık →")}</Link></p>
      <h2>{t("Nasıl başlarız?")}</h2>
      <ol className="space-y-1 [&>li]:ml-5 [&>li]:list-decimal">
        <li>{t("Kullanıcı sayısını ve paketi bize iletin; teklif hazırlayalım.")}</li>
        <li>{t("Kurumunuz için bir katılım kodu ve kurum yöneticisi hesabı tanımlarız.")}</li>
        <li>{t("Öğrencileriniz Hesap sayfasında kodu girerek kuruma katılır; paketleri anında yükselir.")}</li>
      </ol>
      <div className="card mt-6 p-5">
        <p className="font-semibold text-ink-900">{t("Teklif isteyin")}</p>
        <p className="mt-1 text-ink-600">{t("WhatsApp:")} <a className="font-medium text-brand-700 hover:underline" href={waHref} target="_blank" rel="noopener noreferrer">0542 526 66 50</a></p>
        {contact.email
          ? <p className="mt-1 text-ink-600">{t("E-posta:")} <a className="font-medium text-brand-700 hover:underline" href={`mailto:${contact.email}?subject=${encodeURIComponent(t("Kurum lisansı teklif talebi"))}`}>{contact.email}</a></p>
          : <p className="mt-1 text-ink-600">{t("Giriş yaptıktan sonra sol menüdeki “Geri bildirim” ile kurum adınızı, kullanıcı sayısını ve iletişim bilginizi gönderin; size dönelim.")} <Link href="/giris" className="font-medium text-brand-700 hover:underline">{t("Giriş yap")}</Link></p>}
      </div>
      <p className="text-sm text-ink-500">{t("Kurum kodunuz varsa: Hesap ve abonelik sayfasında “Kurum lisansı” bölümünden katılabilirsiniz.")}</p>
    </StaticPage>
  );
}
