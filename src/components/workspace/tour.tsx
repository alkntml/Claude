"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";

const KEY = "akademi:tour:v1";

interface Step { targets: string[]; title: string; body: string }
const STEPS: Step[] = [
  { targets: ['[data-tour="nav"]', '[data-tour="m-nav"]'], title: "Bölümler", body: "Çalışmanızın yol haritası. Bölümler arasında buradan geçersiniz; sürükleyerek sıralayabilir, yenisini ekleyebilirsiniz." },
  { targets: ['[data-tour="toolbar"]', '[data-tour="m-editor"]'], title: "Metin", body: "Bölümü burada yazarsınız. Atıflar kaynağa bağlı canlı öğelerdir: üstüne tıklayınca sayfa ekleyebilir ve “Kaynakta doğrula” ile kaynağın gerçekten bunu söyleyip söylemediğini kontrol edebilirsiniz." },
  { targets: ['[data-tour="panel-tabs"]', '[data-tour="m-assistant"]'], title: "Asistan", body: "Asistan gerektiğinde kaynakları kendisi arar, okur ve sayfa numarasıyla atıf yapar. “Alt başlıklarla yaz” ile bölümün tamamını alt başlık alt başlık yazdırabilir, mikrofonla sesli not verebilirsiniz." },
  { targets: ['[data-tour="panel-tabs"]', '[data-tour="m-sources"]'], title: "Kaynaklar", body: "Projedeki kaynaklar, erişim seviyeleri ve literatür matrisi burada. Tam metni okunamayan kaynaklar için PDF yükleyebilirsiniz." },
  { targets: ['[data-tour="stage-references"]', '[data-tour="m-nav"]'], title: "Kaynakça", body: "Kaynakça seçtiğiniz stile göre kendiliğinden oluşur. Bir kayda tıklayınca kullanıldığı yerleri görür, “Git” ile metindeki atfa gidersiniz." },
  { targets: ['[data-tour="goal"]'], title: "Hedef ve takvim", body: "Haftalık kelime hedefi ve teslim tarihi belirleyin; kalan bölümler haftalara dağıtılır." },
  { targets: ['[data-tour="export"]', '[data-tour="m-more"]'], title: "Dışa aktarma ve ayarlar", body: "Word/PDF çıktısı, üniversite biçim şablonu ve kapak bilgileri burada. Mobilde “⋯” menüsünde atıf stili, paylaşım ve dil seçimi de var." },
];

function visible(sel: string): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? el : null;
}

export function shouldShowTour(): boolean {
  try { return !localStorage.getItem(KEY); } catch { return false; }
}

/** İlk kullanımda çalışma alanını tanıtan kısa tur (yaklaşık 60 sn). */
export function Tour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[i];

  const measure = useCallback(() => {
    if (!step) return;
    const el = step.targets.map(visible).find(Boolean) ?? null;
    if (el) el.scrollIntoView({ block: "nearest" });
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(() => { if (open) measure(); }, [open, measure]);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, measure]);

  function finish() {
    try { localStorage.setItem(KEY, "1"); } catch { /* yok */ }
    setI(0);
    onClose();
  }
  if (!open || typeof document === "undefined") return null;

  const pad = 6;
  const vw = window.innerWidth, vh = window.innerHeight;
  const boxW = Math.min(340, vw - 24);
  let top = vh / 2 - 90, left = vw / 2 - boxW / 2;
  if (rect) {
    const below = rect.bottom + 12 + 190 < vh;
    top = below ? rect.bottom + 12 : Math.max(12, rect.top - 12 - 190);
    left = Math.min(Math.max(12, rect.left + rect.width / 2 - boxW / 2), vw - boxW - 12);
  }

  return createPortal(
    <AnimatePresence>
      <motion.div key="tour" className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {rect
          ? <div className="pointer-events-none absolute rounded-2xl ring-2 ring-brand-400 transition-all duration-300" style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: "0 0 0 9999px rgb(10 12 28 / 0.55)" }} />
          : <div className="absolute inset-0 bg-ink-950/55" />}
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute rounded-2xl bg-white p-4 shadow-2xl" style={{ top, left, width: boxW }} role="dialog" aria-label={t("Rehberli tur")}>
          <button onClick={finish} className="absolute right-2.5 top-2.5 rounded-md p-1 text-ink-400 hover:text-ink-700" aria-label={t("Turu kapat")}><X className="h-4 w-4" /></button>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{i + 1} / {STEPS.length}</p>
          <p className="mt-1 font-semibold text-ink-900">{t(step.title)}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-600">{t(step.body)}</p>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={finish} className="text-[13px] text-ink-500 hover:text-ink-800">{t("Atla")}</button>
            <div className="flex gap-2">
              {i > 0 && <Button size="sm" variant="ghost" onClick={() => setI(i - 1)}>{t("Geri")}</Button>}
              {i < STEPS.length - 1 ? <Button size="sm" onClick={() => setI(i + 1)}>{t("İleri")}</Button> : <Button size="sm" onClick={finish}>{t("Başlayalım")}</Button>}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
