import { cn } from "./cn";

/**
 * Hafif giriş animasyonu (D57): yalnızca CSS; sunucu bileşeni olarak çalışır, JavaScript
 * paketine framer-motion eklemez ve içerik sayfa yüklenir yüklenmez görünür.
 */
export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  // Bölüm başlıklarında animasyon yok: kaydırırken takılma olmasın (D58). Parametreler geriye uyumluluk için.
  void delay;
  return <div className={cn(className)}>{children}</div>;
}
