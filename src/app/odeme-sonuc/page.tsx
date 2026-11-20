import { getT } from "@/i18n/server";
import { PaymentResult } from "./result";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Ödeme sonucu"), robots: { index: false, follow: false } };
}

/**
 * D225: PayTR ödeme bitince bu adresi (merchant_ok_url / merchant_fail_url) kendi çerçevesinde açar. Sayfa önce
 * çerçeveden çıkar, sonra siparişin durumunu sunucudan sorar. Sonucu belirleyen adres değil, PayTR’nin imzalı bildirimidir.
 */
export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ siparis?: string; durum?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
      <PaymentResult oid={String(sp.siparis ?? "")} failedHint={sp.durum === "hata"} />
    </main>
  );
}
