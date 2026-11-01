import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/faq";

/** **kalın** ve satır sonlarını paragraflara çeviren küçük biçimlendirici (HTML enjekte etmez) */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").filter((p) => p.trim()).map((p, i) => (
        <p key={i} className="mt-2 first:mt-0">
          {p.split(/(\*\*[^*]+\*\*)/g).map((part, k) => (part.startsWith("**") && part.endsWith("**") ? <b key={k} className="font-semibold text-ink-900">{part.slice(2, -2)}</b> : part))}
        </p>
      ))}
    </>
  );
}

export function FaqList({ items, locale }: { items: FaqItem[]; locale: "tr" | "en" }) {
  return (
    <div className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
      {items.map((i) => (
        <details key={i.id} id={i.id} className="group scroll-mt-28">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left font-medium text-ink-900 hover:bg-ink-50/60 [&::-webkit-details-marker]:hidden">
            <span>{i.q[locale]}</span>
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-ink-400 transition group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5 text-[15px] leading-relaxed text-ink-600"><Rich text={i.a[locale]} /></div>
        </details>
      ))}
    </div>
  );
}
