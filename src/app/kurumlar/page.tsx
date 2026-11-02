import Link from "next/link";
import { StaticPage } from "@/components/static-page";
import { getT } from "@/i18n/server";
import { getSetting } from "@/lib/settings";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Kurumlar için") };
}
export const dynamic = "force-dynamic";

/** Kurumsal lisans tanıtımı: üniversiteler, enstitüler, araştırma grupları */
export default async function Institutions() {
  const [{ t }, contact] = await Promise.all([getT(), getSetting("site.contact")]);
  const items = [
    ["Toplu lisans", "Belirlediğiniz sayıda kullanıcıya Pro veya Premium paket; tek fatura, yıllık sözleşme."],
    ["Kolay katılım", "Öğrencileriniz kurum koduyla katılır. İsterseniz yalnızca kurum e-posta uzantısıyla (ör. @universite.edu.tr) katılıma izin verilir."],
    ["Kurum yöneticisi paneli", "Kullanıcı sayısı, katılım kodu ve üyelerin aylık kullanım sayıları. Gizlilik gereği öğrencilerin çalışma içerikleri kurumla paylaşılmaz."],
    ["Akademik dürüstlük", "Uydurma kaynak yok, erişim seviyesi şeffaflığı, her atıf doğrulanabilir kaynağa bağlı. Kurumunuzun yapay zekâ politikasıyla uyumlu kullanım."],
    ["Veri güvenliği", "Avrupa Birliği’nde (Frankfurt) barındırma, satır düzeyinde erişim denetimi, KVKK uyumlu veri silme ve dışa aktarma."],
  ];
  return (
    <StaticPage title={t("Kurumlar için Academiana")} lead={t("Üniversiteler, enstitüler ve araştırma grupları için toplu lisans.")}>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([h, b]) => <div key={h} className="card p-5"><p className="font-semibold text-ink-900">{t(h)}</p><p className="mt-1 text-[14.5px] text-ink-600">{t(b)}</p></div>)}
      </div>
      <h2>{t("Nasıl başlarız?")}</h2>
      <ol className="space-y-1 [&>li]:ml-5 [&>li]:list-decimal">
        <li>{t("Kullanıcı sayısını ve paketi bize iletin; teklif hazırlayalım.")}</li>
        <li>{t("Kurumunuz için bir katılım kodu ve kurum yöneticisi hesabı tanımlarız.")}</li>
        <li>{t("Öğrencileriniz Hesap sayfasında kodu girerek kuruma katılır; paketleri anında yükselir.")}</li>
      </ol>
      <div className="card mt-6 p-5">
        <p className="font-semibold text-ink-900">{t("Teklif isteyin")}</p>
        {contact.email
          ? <p className="mt-1 text-ink-600">{t("E-posta:")} <a className="font-medium text-brand-700 hover:underline" href={`mailto:${contact.email}?subject=${encodeURIComponent(t("Kurum lisansı teklif talebi"))}`}>{contact.email}</a></p>
          : <p className="mt-1 text-ink-600">{t("Giriş yaptıktan sonra sol menüdeki “Geri bildirim” ile kurum adınızı, kullanıcı sayısını ve iletişim bilginizi gönderin; size dönelim.")} <Link href="/giris" className="font-medium text-brand-700 hover:underline">{t("Giriş yap")}</Link></p>}
      </div>
      <p className="text-sm text-ink-500">{t("Kurum kodunuz varsa: Hesap ve abonelik sayfasında “Kurum lisansı” bölümünden katılabilirsiniz.")}</p>
    </StaticPage>
  );
}
