import { BookOpenText, FlaskConical, GraduationCap, Landmark, Library, Lightbulb, PenLine, Rocket, SearchCheck, type LucideIcon } from "lucide-react";

export const WORK_ICONS: Record<string, LucideIcon> = { GraduationCap, FlaskConical, BookOpenText, Rocket, Library, Lightbulb, PenLine, SearchCheck, Landmark };

/* eslint-disable @next/next/no-img-element */
/**
 * Academiana logosu. Varsayılan: amblem (kep + A + kitap) ve kelime işareti; dar yerlerde yeterince okunaklı.
 * variant="full": “The Complete Academic Research Workspace” alt yazılı tam logo görseli (ör. alt bilgi, giriş ekranı).
 */
export function Logo({ className = "", variant = "mark" }: { className?: string; variant?: "mark" | "full" }) {
  if (variant === "full") {
    return <img src="/brand/academiana-logo-transparent.png" alt="Academiana — The Complete Academic Research Workspace" width={960} height={245} className={`h-12 w-auto ${className}`} />;
  }
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src="/brand/academiana-emblem.png" alt="" width={192} height={169} className="h-9 w-auto shrink-0" />
      <span className="font-serif text-[21px] font-semibold leading-none tracking-tight text-[#0f1d3d] dark:text-white">Academiana</span>
    </span>
  );
}
/* eslint-enable @next/next/no-img-element */
