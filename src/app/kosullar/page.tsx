import { StaticPage } from "@/components/static-page";
export const metadata = { title: "Kullanım koşulları" };
export default function Page() {
  return (
    <StaticPage title="Kullanım koşulları" lead="Şablon metin: yayına almadan önce hukuki inceleme yapılmalıdır.">
      <h2>Hizmetin niteliği</h2>
      <p>Akademi AI, akademik çalışmaların planlanması, kaynak bulunması, yazımı ve biçimlendirilmesi için yardımcı bir araçtır. Üretilen içeriğin bilimsel doğruluğu, özgünlüğü ve kurumunuzun kurallarına uygunluğu konusunda nihai sorumluluk kullanıcıya aittir.</p>
      <h2>Akademik dürüstlük</h2>
      <p>Platformu kurumunuzun yapay zekâ kullanım politikalarına uygun biçimde kullanmayı ve gerektiğinde yapay zekâ kullanımını beyan etmeyi kabul edersiniz.</p>
      <h2>Kullanım limitleri</h2>
      <p>Her paketin aylık limitleri hesap sayfanızda gösterilir. Kötüye kullanım tespit edilen hesaplar askıya alınabilir.</p>
    </StaticPage>
  );
}
