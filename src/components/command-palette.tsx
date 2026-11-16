"use client";
/**
 * D213: Her yerden komut arama (Ctrl/⌘+K) ve klavye kısayolları listesi (“?”).
 * Temel komutlar sayfalar ve çalışmalarınızdır; çalışma alanı kendi komutlarını (araçlar, bölümler, kaynaklar) `extra` ile ekler.
 * Arama büyük/küçük harf ve aksan duyarsızdır; Türkçe adın yanında arayüz dilindeki ad ve anahtar kelimelerle de eşleşir.
 */
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, ClipboardList, Compass, CornerDownLeft, FileText, FolderOpen, HelpCircle, Home, Keyboard, Library, Plus, Search, ShieldCheck, Sparkles, UserRound, Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WithMarks } from "@/components/brand-mark";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { matchesAll } from "@/lib/search-norm";

export interface Command { id: string; group: string; label: string; hint?: string; keywords?: string; icon?: typeof Search; run: () => void; translate?: boolean }

export const PALETTE_EVENT = "acd:palette";
/** Komut aramasını koddan açar (ör. üst çubuktaki “Ara” düğmesi) */
export const openCommandPalette = () => window.dispatchEvent(new CustomEvent(PALETTE_EVENT));

const isTyping = (el: EventTarget | null) => {
  const n = el as HTMLElement | null;
  return !!n && (n.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(n.tagName));
};
const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export function CommandPalette({ extra = [], projects = true }: { extra?: Command[]; projects?: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [list, setList] = useState<{ id: string; title: string }[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === "k" || e.key === "K")) { e.preventDefault(); setOpen((o) => !o); return; }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !isTyping(e.target)) { e.preventDefault(); setKeys(true); }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(PALETTE_EVENT, onOpen); };
  }, []);

  useEffect(() => {
    if (!open) { setQ(""); setSel(0); return; }
    const id = setTimeout(() => inputRef.current?.focus(), 20);
    if (projects && list === null) api<{ projects: { id: string; title: string }[] }>("/api/projects").then((r) => setList(r.projects ?? [])).catch(() => setList([]));
    return () => clearTimeout(id);
  }, [open, projects, list]);

  const go = useCallback((href: string) => () => router.push(href), [router]);
  const base: Command[] = useMemo(() => [
    { id: "p-panel", group: "Sayfalar", label: "Kontrol paneli", icon: Home, run: go("/panel"), keywords: "dashboard panel ana sayfa" },
    { id: "p-new", group: "Sayfalar", label: "Yeni çalışma", icon: Plus, run: go("/yeni"), keywords: "new project tez makale oluştur" },
    { id: "p-sources", group: "Sayfalar", label: "Kaynak araştırması", icon: Library, run: go("/kaynaklar"), keywords: "literatür search sources" },
    { id: "p-files", group: "Sayfalar", label: "Dosyalarım", icon: FolderOpen, run: go("/dosyalar"), keywords: "files pdf veri" },
    { id: "p-surveys", group: "Sayfalar", label: "Anketlerim", icon: ClipboardList, run: go("/anketler"), keywords: "survey anket" },
    { id: "p-topic", group: "Sayfalar", label: "Konu bulma", icon: Compass, run: go("/konu-bul"), keywords: "topic tez konusu" },
    { id: "p-account", group: "Sayfalar", label: "Hesap ve abonelik", icon: UserRound, run: go("/hesap"), keywords: "account plan paket fatura kvkk veri indir sil" },
    { id: "p-news", group: "Sayfalar", label: "Yenilikler", icon: Sparkles, run: go("/yenilikler"), keywords: "changelog what's new güncelleme" },
    { id: "p-help", group: "Yardım", label: "Yardım ve kullanım rehberi", icon: BookOpen, run: go("/yardim"), keywords: "help guide nasıl" },
    { id: "p-faq", group: "Yardım", label: "Sık sorulan sorular", icon: HelpCircle, run: go("/sss"), keywords: "faq sss" },
    { id: "p-trust", group: "Yardım", label: "Güven merkezi", icon: ShieldCheck, run: go("/guven"), keywords: "trust security gizlilik güvenlik" },
    { id: "p-status", group: "Yardım", label: "Sistem durumu", icon: Activity, run: go("/durum"), keywords: "status çalışıyor mu" },
    { id: "k-keys", group: "Yardım", label: "Klavye kısayolları", icon: Keyboard, run: () => setKeys(true), keywords: "shortcuts kısayol tuş" },
  ], [go]);

  const all = useMemo(() => [
    ...extra,
    ...(list ?? []).map((p) => ({ id: `w-${p.id}`, group: "Çalışmalarım", label: p.title, icon: FileText, run: go(`/proje/${p.id}`), translate: false } as Command)),
    ...base,
  ], [extra, list, base, go]);

  const shown = useMemo(() => {
    const label = (c: Command) => (c.translate === false ? c.label : t(c.label));
    const hits = all.filter((c) => matchesAll(q, [c.label, label(c), c.hint ?? "", c.hint ? t(c.hint) : "", c.group, t(c.group), c.keywords ?? ""].join(" ")));
    // Arama yokken çalışma listesi kısa tutulur
    return q.trim() ? hits.slice(0, 60) : hits.filter((c, i, arr) => c.group !== "Çalışmalarım" || arr.slice(0, i).filter((x) => x.group === "Çalışmalarım").length < 5);
  }, [all, q, t]);
  const groups = useMemo(() => [...new Set(shown.map((c) => c.group))], [shown]);
  const ordered = useMemo(() => groups.flatMap((g) => shown.filter((c) => c.group === g)), [groups, shown]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" }); }, [sel]);

  function run(c: Command | undefined) {
    if (!c) return;
    setOpen(false);
    setTimeout(c.run, 0);
  }

  return (
    <>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[70] flex items-start justify-center p-3 pt-[12vh] sm:p-6 sm:pt-[14vh]">
              <motion.div className="absolute inset-0 bg-ink-950/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
              <motion.div role="dialog" aria-modal="true" aria-label={t("Komut arama")} initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl">
                <label className="flex items-center gap-3 border-b border-ink-100 px-4">
                  <Search className="h-4 w-4 shrink-0 text-ink-400" />
                  <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Sayfa, çalışma, bölüm, kaynak veya araç arayın…")} aria-label={t("Komut arama")}
                    className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(ordered.length - 1, s + 1)); }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
                      else if (e.key === "Enter") { e.preventDefault(); run(ordered[sel]); }
                      else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
                    }} />
                  <kbd className="hidden rounded-md border border-ink-200 px-1.5 py-0.5 text-[11px] text-ink-400 sm:block">Esc</kbd>
                </label>
                <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-1.5">
                  {ordered.length === 0 && <p className="px-3 py-8 text-center text-[13.5px] text-ink-500">{t("Sonuç yok. Başka bir kelime deneyin.")}</p>}
                  {groups.map((g) => (
                    <div key={g}>
                      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400"><WithMarks text={t(g)} className="normal-case tracking-normal" /></p>
                      {shown.filter((c) => c.group === g).map((c) => {
                        const i = ordered.indexOf(c);
                        const I = c.icon ?? Search;
                        return (
                          <button key={c.id} data-i={i} onMouseMove={() => setSel(i)} onClick={() => run(c)}
                            className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left", i === sel ? "bg-brand-50 text-brand-800" : "text-ink-800")}>
                            <I className={cn("h-4 w-4 shrink-0", i === sel ? "text-brand-600" : "text-ink-400")} />
                            <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-medium">{c.translate === false ? c.label : t(c.label)}</span>{c.hint && <span className="block truncate text-[12px] text-ink-500">{t(c.hint)}</span>}</span>
                            {i === sel && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand-500" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 border-t border-ink-100 px-4 py-2 text-[11.5px] text-ink-400">
                  <span>↑↓ {t("seç")}</span><span>↵ {t("aç")}</span><button className="ml-auto hover:text-ink-700" onClick={() => { setOpen(false); setKeys(true); }}>? {t("Klavye kısayolları")}</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>, document.body)}
      <ShortcutsDialog open={keys} onClose={() => setKeys(false)} />
    </>
  );
}

const SHORTCUTS: { group: string; items: [string[], string][] }[] = [
  { group: "Genel", items: [[["Mod", "K"], "Komut arama: sayfa, çalışma, bölüm, kaynak ve araç bulun"], [["?"], "Bu kısayol listesini açar"], [["Esc"], "Açık pencereyi veya menüyü kapatır"]] },
  { group: "Editör", items: [
    [["Mod", "B"], "Kalın"], [["Mod", "I"], "İtalik"], [["Mod", "U"], "Altı çizili"],
    [["Mod", "Z"], "Geri al"], [["Mod", "Shift", "Z"], "Yinele"],
    [["Mod", "F"], "Bul ve değiştir"],
  ] },
  { group: "Zenit otomatik tamamlama", items: [[["Tab"], "Gri öneriyi tümüyle kabul eder"], [["Mod", "→"], "Önerinin yalnızca bir sonraki kelimesini kabul eder"], [["Esc"], "Öneriyi kapatır"]] },
  { group: "Asistan ve kaynağa sor", items: [[["Enter"], "Mesajı gönderir"], [["Shift", "Enter"], "Yeni satır"]] },
  { group: "Bul ve değiştir", items: [[["Enter"], "Sonraki eşleşme"], [["Shift", "Enter"], "Önceki eşleşme"]] },
  { group: "Rehberli tur", items: [[["→"], "Sonraki adım"], [["←"], "Önceki adım"]] },
];

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const [mac, setMac] = useState(false);
  useEffect(() => { setMac(isMac()); }, []);
  const key = (k: string) => (k === "Mod" ? (mac ? "⌘" : "Ctrl") : k === "Shift" ? (mac ? "⇧" : "Shift") : k);
  return (
    <Modal open={open} onClose={onClose} title={t("Klavye kısayolları")} wide>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {SHORTCUTS.map((g) => (
          <section key={g.group}>
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-400"><WithMarks text={t(g.group)} className="normal-case tracking-normal" /></h3>
            <ul className="space-y-1.5">
              {g.items.map(([keys, label]) => (
                <li key={label + keys.join()} className="flex items-center justify-between gap-3 text-[13.5px] text-ink-700">
                  <span>{t(label)}</span>
                  <span className="flex shrink-0 gap-1">{keys.map((k) => <kbd key={k} className="min-w-[1.75rem] rounded-md border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-center font-sans text-[11.5px] font-semibold text-ink-600">{key(k)}</kbd>)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-5 text-[12.5px] text-ink-500">{mac ? t("Mac’te Ctrl yerine ⌘ (Command) kullanılır.") : t("Mac’te Ctrl yerine ⌘ (Command) kullanılır.")}</p>
    </Modal>
  );
}
