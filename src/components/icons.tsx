import { BookOpenText, FlaskConical, GraduationCap, Landmark, Library, Lightbulb, PenLine, Rocket, SearchCheck, type LucideIcon } from "lucide-react";

export const WORK_ICONS: Record<string, LucideIcon> = { GraduationCap, FlaskConical, BookOpenText, Rocket, Library, Lightbulb, PenLine, SearchCheck, Landmark };

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-brand-500 via-indigo-500 to-sky-400 text-white shadow-glow">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 19.5V6a2 2 0 0 1 2-2h11l3 3v12.5a.5.5 0 0 1-.5.5H6a2 2 0 0 1-2-2Z" />
          <path d="M8 9h7M8 13h8M8 17h5" />
        </svg>
      </span>
      <span className="text-[17px]">Academi<span className="text-brand-600">ana</span></span>
    </span>
  );
}
