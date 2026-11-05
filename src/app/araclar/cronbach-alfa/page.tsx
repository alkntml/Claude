import { pageMeta } from "@/lib/seo-server";
import { ToolShell } from "@/components/tools/tool-shell";
import { AlphaTool } from "@/components/tools/alpha";

export async function generateMetadata() {
  return pageMeta("/araclar/cronbach-alfa");
}

export default function Page() {
  return (
    <ToolShell path="/araclar/cronbach-alfa" intro="Ölçek verilerinizi Excel veya SPSS’ten yapıştırın; Cronbach alfa, madde-toplam korelasyonları ve madde silinirse alfa değerleri anında hesaplansın. Verileriniz bilgisayarınızdan çıkmaz." faq={[{ q: "Kaç alfa değeri yeterlidir?", a: "Yaygın kabul .70 ve üzeridir; .80 iyi, .90 ve üzeri mükemmel kabul edilir (George ve Mallery, 2003). Çok yüksek değerler (.95 üstü) maddelerin birbirini tekrar ettiğini gösterebilir." }, { q: "Ters maddeler ne olacak?", a: "Ters puanlanan maddeleri seçin ve ölçek aralığını girin; hesap ters çevrilmiş puanlarla yapılır." }]}>
      <AlphaTool />
    </ToolShell>
  );
}
