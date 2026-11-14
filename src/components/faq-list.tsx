import { faqA, faqQ, type FaqItem } from "@/lib/faq";
import type { Locale } from "@/i18n/core";

/** **kalın** ve satır sonlarını paragraflara çeviren küçük biçimlendirici (HTML enjekte etmez) */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").filter((p) => p.trim()).map((p, i) => (
        <p key={i}>
          {p.split(/(\*\*[^*]+\*\*)/g).map((part, k) => (part.startsWith("**") && part.endsWith("**") ? <b key={k} className="font-semibold text-ink-900">{part.slice(2, -2)}</b> : part))}
        </p>
      ))}
    </>
  );
}

/**
 * D193: sayfa ağırlığı — her madde HTML’de ve sayfa verisinde (RSC) iki kez taşındığı için biçim kısa CSS sınıflarıyla
 * (globals.css: .faq-*) verilir; ok simgesi SVG yerine CSS ile çizilir.
 */
export function FaqList({ items, locale }: { items: FaqItem[]; locale: Locale }) {
  return (
    <div className="faq-list">
      {items.map((i) => (
        <details key={i.id} id={i.id}>
          <summary><span>{faqQ(i, locale)}</span><i aria-hidden /></summary>
          <div><Rich text={faqA(i, locale)} /></div>
        </details>
      ))}
    </div>
  );
}
