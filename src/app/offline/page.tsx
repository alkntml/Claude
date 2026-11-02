import { Logo } from "@/components/icons";

export const dynamic = "force-static";
export const metadata = { title: "Çevrimdışı" };

/** Bağlantı yokken servis çalışanının gösterdiği sayfa (iki dilli, sunucu verisi kullanmaz) */
export default function Offline() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo />
      <h1 className="font-serif text-3xl font-medium text-ink-950">İnternet bağlantısı yok</h1>
      <p className="max-w-md text-ink-600">Bağlantınız geri geldiğinde sayfayı yenileyin. Çalışma alanında yazdığınız ve henüz kaydedilmemiş metin cihazınızda saklanır ve bağlantı gelince kaydedilir.</p>
      <p className="max-w-md text-sm text-ink-400">You are offline. Reload the page when your connection is back; unsaved text in the workspace is kept on your device.</p>
    </main>
  );
}
