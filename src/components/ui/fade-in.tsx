import { cn } from "./cn";

/**
 * Hafif giriş animasyonu (D57): yalnızca CSS; sunucu bileşeni olarak çalışır, JavaScript
 * paketine framer-motion eklemez ve içerik sayfa yüklenir yüklenmez görünür.
 */
export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  return <div className={cn("animate-rise", className)} style={delay ? { animationDelay: `${delay}s` } : undefined}>{children}</div>;
}
