"use client";
/**
 * Rehberli tur (D142): yeni üyeye çalışma alanını ekran üzerinde adım adım tanıtır (≈3 dk). Adımlar bölümlere
 * ayrılır (Başlangıç, Yazma, Kaynaklar, Kontrol, Birlikte ve teslim); her adımdan kullanım rehberindeki ayrıntılı
 * konuya gidilebilir. Hedef öğe görünmüyorsa (ör. telefonda) sıradaki hedef veya ekran ortası kullanılır.
 */
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";

const KEY = "akademi:tour:v1";

interface Step { targets: string[]; group: string; title: string; body: string; more?: string }
const STEPS: Step[] = [
  { targets: [], group: "Başlangıç", title: "Çalışma alanına hoş geldiniz", body: "Bu kısa tur ekranın her bölümünü tanıtır. İstediğiniz an “Atla” diyebilir, sonra sağ üstteki “?” simgesiyle yeniden başlatabilirsiniz." },
  { targets: ['[data-tour="blueprint"]', '[data-tour="m-nav"]'], group: "Başlangıç", title: "Önce kurgu", body: "Problem, amaç, yöntem ve bölüm planını burada oluşturup onaylayın. Asistan bütün bölümleri bu plana göre yazar; 5 dakikanızı buraya ayırmak sonraki her adımı kolaylaştırır.", more: "ilk-calisma-kurgu" },
  { targets: ['[data-tour="nav"]', '[data-tour="m-nav"]'], group: "Başlangıç", title: "Bölümler ve alt başlıklar", body: "Çalışmanızın yol haritası. Bir bölüme veya alt başlığa tıklayınca editörde yalnızca o kısım açılır. “+” ile alt başlık, en altta “Bölüm ekle” ile yeni bölüm eklersiniz; sürükleyerek sıralayabilirsiniz.", more: "ilk-calisma-bolumler" },
  { targets: ['[data-tour="toolbar"]', '[data-tour="m-editor"]'], group: "Yazma", title: "Editör", body: "Alt başlık düzeyleri, listeler, tablo, dipnot ve şekil başlığı buradan. Büyüteç (Ctrl/⌘+F) bul ve değiştir; sihirli değnek otomatik tamamlamayı açıp kapatır. Kayıt otomatiktir.", more: "yazma-editor" },
  { targets: ['.prose-academic', '[data-tour="m-editor"]'], group: "Yazma", title: "Metin, atıflar ve seçim menüsü", body: "Bir cümle seçince “Çevir”, “Dil denetimi”, “Akademikleştir”, “Kısalt”, “Genişlet” menüsü çıkar. Atıflar kaynağa bağlı canlı öğelerdir: tıklayınca sayfa numarası ekleyebilir, “Kaynakta doğrula” ile kaynağın bunu gerçekten söyleyip söylemediğine bakabilirsiniz.", more: "yazma-secim" },
  { targets: ['[data-tour="panel-tabs"]', '[data-tour="m-assistant"]'], group: "Yazma", title: "Asistan", body: "Bölüme göre değişen kısayollar: “Alt başlık oluştur”, “Bölümü yaz”, “Literatür araştır”… Asistan yalnızca projedeki kaynaklara atıf yapar, kaynağı yoksa [KAYNAK GEREKLİ] yazar. Taslağı “Belgeye ekle” ile alıp kendi sözlerinizle düzenleyin.", more: "yazma-asistan" },
  { targets: ['[data-tour="panel-tabs"]', '[data-tour="m-sources"]'], group: "Kaynaklar", title: "Kaynaklar", body: "“Kaynak ara” 16 veri tabanını tarar; “DOI / elle ekle” ile kendi kaynağınızı eklersiniz. Her kaynakta ne kadarının okunduğu yazar (künye, özet, tam metin). Önemli makalelerin PDF’ini yükleyin: sayfa numaralı atıf ve denetimler tam metinle çok daha iyi çalışır.", more: "kaynaklar-erisim" },
  { targets: ['[data-tour="panel-tabs"]', '[data-tour="m-more"]'], group: "Kaynaklar", title: "Hafıza, yorumlar ve geçmiş", body: "Hafıza: asistanın hatırladığı kavram ve kararlar. Yorum: sizin ve danışmanınızın notları (“Asistanla uygula”). Geçmiş: bölümün eski sürümleri, “Geri yükle” ile dönülür.", more: "yazma-gecmis" },
  { targets: ['[data-tour="style"]', '[data-tour="stage-references"]', '[data-tour="m-more"]'], group: "Kaynaklar", title: "Atıf stili ve kaynakça", body: "APA 7, ISNAD 2, IEEE ve 7 stil daha. Stili değiştirince bütün atıflar ve kaynakça yeniden biçimlenir. Kaynakçayı ayrıca yazmazsınız: atıf yaptığınız kaynaklardan kendiliğinden oluşur.", more: "kaynaklar-kaynakca" },
  { targets: ['[data-tour="tools"]', '[data-tour="m-more"]'], group: "Kontrol", title: "Araçlar", body: "“İddia denetimi” atıflı her cümleyi kaynağın metniyle karşılaştırır. Ayrıca literatür haritası, sistematik derleme (PRISMA), dil ve çeviri, grafik, istatistik, anket, savunma provası ve daha fazlası burada.", more: "dogruluk-iddia" },
  { targets: ['[data-tour="quality"]', '[data-tour="m-more"]'], group: "Kontrol", title: "Kalite kontrol", body: "Atıf–kaynakça tutarlılığı, eksik künye, tekrarlar ve teslim öncesi kontrol listesi. Her maddedeki “Düzelt →” sizi ilgili yere götürür.", more: "dogruluk-kalite" },
  { targets: ['[data-tour="coauthors"]', '[data-tour="share"]', '[data-tour="m-more"]'], group: "Birlikte ve teslim", title: "Ortak yazarlar ve danışman", body: "“Ortak yazarlar” ile birlikte yazın: kimin hangi paragrafta olduğu canlı görünür, değişiklikler otomatik birleşir. “Paylaş” → “Danışmanla paylaş” ile danışmanınız hesap açmadan okur ve yorum yazar.", more: "birlikte-canli" },
  { targets: ['[data-tour="goal"]'], group: "Birlikte ve teslim", title: "Hedef ve takvim", body: "Haftalık kelime hedefi ve teslim tarihi belirleyin; kalan bölümler haftalara dağıtılır.", more: "ilk-calisma-hedef" },
  { targets: ['[data-tour="export"]', '[data-tour="m-more"]'], group: "Birlikte ve teslim", title: "Dışa aktarma", body: "Word, PDF, LaTeX/Overleaf; kapak, içindekiler, numaralandırma ve kaynakça otomatik. “Biçim ve kapak ayarları”nda üniversite şablonu; ayrıca savunma sunumu ve dergi önerisi.", more: "teslim-bicim" },
  { targets: ['[data-tour="help"]', '[data-tour="m-more"]'], group: "Birlikte ve teslim", title: "Takıldığınızda", body: "Bu turu “?” ile yeniden başlatabilirsiniz. Her özelliğin adım adım anlatımı Kullanım rehberinde; asistana da “Nereden grafik oluşturabilirim?” gibi sorular sorabilirsiniz.", more: "sorunlar-destek" },
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

/** Çalışma alanını tanıtan rehberli tur */
export function Tour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[i];

  const measure = useCallback(() => {
    if (!step) return;
    const el = step.targets.map(visible).find(Boolean) ?? null;
    if (el) el.scrollIntoView({ block: "nearest" });
    const r = el ? el.getBoundingClientRect() : null;
    // Çok büyük hedefte (editör metni) yalnızca üst kısmı vurgula
    setRect(r && r.height > window.innerHeight * 0.6 ? new DOMRect(r.left, r.top, r.width, Math.min(r.height, 220)) : r);
  }, [step]);

  useLayoutEffect(() => { if (open) measure(); }, [open, measure]);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", measure);
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && i < STEPS.length - 1) setI(i + 1);
      if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("keydown", key); };
  });

  function finish() {
    try { localStorage.setItem(KEY, "1"); } catch { /* yok */ }
    setI(0);
    onClose();
  }
  if (!open || typeof document === "undefined") return null;

  const pad = 6;
  const vw = window.innerWidth, vh = window.innerHeight;
  const boxW = Math.min(360, vw - 24);
  const boxH = 260;
  let top = vh / 2 - boxH / 2, left = vw / 2 - boxW / 2;
  if (rect) {
    const below = rect.bottom + 12 + boxH < vh;
    top = below ? rect.bottom + 12 : Math.max(12, rect.top - 12 - boxH);
    left = Math.min(Math.max(12, rect.left + rect.width / 2 - boxW / 2), vw - boxW - 12);
  }
  const groups = [...new Set(STEPS.map((x) => x.group))];

  return createPortal(
    <AnimatePresence>
      <motion.div key="tour" className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {rect
          ? <div className="pointer-events-none absolute rounded-2xl ring-2 ring-brand-400 transition-all duration-300" style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: "0 0 0 9999px rgb(10 12 28 / 0.55)" }} />
          : <div className="absolute inset-0 bg-ink-950/55" />}
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute rounded-2xl bg-white p-4 shadow-2xl" style={{ top, left, width: boxW }} role="dialog" aria-label={t("Rehberli tur")}>
          <button onClick={finish} className="absolute right-2.5 top-2.5 rounded-md p-1 text-ink-400 hover:text-ink-700" aria-label={t("Turu kapat")}><X className="h-4 w-4" /></button>
          <div className="flex gap-1 pr-7" aria-hidden>
            {groups.map((g) => { const idx = STEPS.map((x, k) => (x.group === g ? k : -1)).filter((k) => k >= 0); const done = idx.filter((k) => k <= i).length / idx.length; return (
              <span key={g} className="h-1 flex-1 overflow-hidden rounded-full bg-ink-100"><span className="block h-full rounded-full bg-brand-500 transition-all" style={{ width: `${done * 100}%` }} /></span>
            ); })}
          </div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-brand-600">{t(step.group)} · {i + 1} / {STEPS.length}</p>
          <p className="mt-1 font-semibold text-ink-900">{t(step.title)}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-600">{t(step.body)}</p>
          {step.more && <a href={`/yardim#${step.more}`} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-700 hover:underline"><BookOpen className="h-3.5 w-3.5" />{t("Ayrıntılı anlatım")}</a>}
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
