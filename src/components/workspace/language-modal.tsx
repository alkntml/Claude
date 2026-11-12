"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Editor } from "@tiptap/react";
import { BookA, Check, ClipboardCopy, Languages, Plus, SpellCheck2, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { docToPlain, type JSONNode } from "@/lib/editor/doc";
import { detectLang } from "@/lib/editor/translate-doc";
import { DocPreview } from "./editor";

export type LanguageTab = "translate" | "proofread" | "glossary";
type Lang = "tr" | "en" | "de";
interface Gloss { tr: string; en: string; de?: string }
const LANG_LABEL: Record<Lang, string> = { tr: "Türkçe", en: "İngilizce", de: "Almanca" };
interface Issue { block: number; original: string; suggestion: string; category: string; reason: string; context: string }

const CAT: Record<string, { label: string; tone: string }> = {
  spelling: { label: "Yazım", tone: "bg-rose-50 text-rose-700" },
  grammar: { label: "Dil bilgisi", tone: "bg-amber-50 text-amber-800" },
  punctuation: { label: "Noktalama", tone: "bg-sky-50 text-sky-700" },
  style: { label: "Akademik üslup", tone: "bg-violet-50 text-violet-700" },
  consistency: { label: "Terim tutarlılığı", tone: "bg-emerald-50 text-emerald-700" },
  clarity: { label: "Anlam açıklığı", tone: "bg-ink-100 text-ink-700" },
};

/** Editörde öneriyi uygular: önce aralıkta (seçim), sonra bağlam paragrafında, en son tüm belgede birebir eşleşen ilk yeri değiştirir */
function applyIssue(editor: Editor, issue: Issue, range?: { from: number; to: number } | null): boolean {
  const doc = editor.state.doc;
  const ctx = issue.context.replace(/⟦C⟧/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  let hit: { from: number; to: number } | null = null, fallback: { from: number; to: number } | null = null;
  doc.descendants((node, pos, parent) => {
    if (hit || !node.isText || !node.text) return !hit;
    const i = node.text.indexOf(issue.original);
    if (i < 0) return false;
    const at = { from: pos + i, to: pos + i + issue.original.length };
    if (range && (at.from < range.from || at.to > range.to)) return false;
    const ptext = (parent?.textContent ?? "").replace(/\s+/g, " ");
    if (!ctx || ptext.includes(ctx)) hit = at; else if (!fallback) fallback = at;
    return false;
  });
  const target = hit ?? fallback;
  if (!target) return false;
  editor.chain().focus().insertContentAt(target, issue.suggestion).run();
  return true;
}

export function LanguageModal({ open, onClose, editor, projectId, projectLanguage, glossary: initialGlossary, stageTitle, scopeLabel, initialTab = "translate", selectionRange, onSnapshot, onGlossarySaved }: {
  open: boolean; onClose: () => void; editor: Editor; projectId: string; projectLanguage: string; glossary: Gloss[]; stageTitle: string;
  /** “Bu bölüm: Giriş” veya “Bu alt başlık: 2.1 Kavramlar” */
  scopeLabel: string;
  initialTab?: LanguageTab;
  /** Pencere açılırken editörde seçili aralık (varsa) */
  selectionRange: { from: number; to: number } | null;
  /** Değiştirmeden önce geri dönülebilir sürüm alır */
  onSnapshot: (note: string) => Promise<void> | void;
  onGlossarySaved: (g: Gloss[]) => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [tab, setTab] = useState<LanguageTab>(initialTab);
  const [scope, setScope] = useState<"selection" | "all">(selectionRange ? "selection" : "all");
  const scopeDoc = useMemo<JSONNode>(() => {
    if (scope === "selection" && selectionRange) return { type: "doc", content: (editor.state.doc.slice(selectionRange.from, selectionRange.to).content.toJSON() ?? []) as JSONNode[] };
    return editor.getJSON() as JSONNode;
  }, [scope, selectionRange, editor]);
  const scopeText = useMemo(() => docToPlain(scopeDoc), [scopeDoc]);
  const detected = useMemo(() => detectLang(scopeText), [scopeText]);
  const [from, setFrom] = useState<Lang>(detected);
  useEffect(() => setFrom(detected), [detected]);
  // Hedef dil: varsayılan olarak çalışmanın dili; kaynakla aynıysa Türkçe ↔ İngilizce
  const pl: Lang = projectLanguage === "en" || projectLanguage === "de" ? projectLanguage : "tr";
  const defaultTo = (f: Lang): Lang => (pl !== f ? pl : f === "tr" ? "en" : "tr");
  const [to, setTo] = useState<Lang>(defaultTo(detected));
  useEffect(() => setTo((cur) => (cur === from ? defaultTo(from) : cur)), [from]); // eslint-disable-line react-hooks/exhaustive-deps
  const showDe = pl === "de" || from === "de" || to === "de" || initialGlossary.some((g) => g.de);
  const [variant, setVariant] = useState<"us" | "uk">("us");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ doc: JSONNode; missing: { citations: number; footnotes: number; figures: number }; terms: Gloss[]; words: number } | null>(null);
  const [pickedTerms, setPickedTerms] = useState<Set<number>>(new Set());
  const [issues, setIssues] = useState<(Issue & { state?: "applied" | "ignored" | "missing" })[] | null>(null);
  const [gloss, setGloss] = useState<Gloss[]>(initialGlossary);
  const [savingGloss, setSavingGloss] = useState(false);
  const words = scopeText.split(/\s+/).filter(Boolean).length;
  const empty = !scopeText.trim();

  async function translate() {
    setBusy(true); setResult(null);
    try {
      const r = await api<any>(`/api/projects/${projectId}/language`, { method: "POST", json: { mode: "translate", doc: scopeDoc, from, to, variant, stageTitle } });
      setResult(r); setPickedTerms(new Set(r.terms.map((_: Gloss, i: number) => i)));
    } catch (e) { toast({ tone: "error", title: t("Çeviri yapılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  async function check() {
    setBusy(true); setIssues(null);
    try { setIssues((await api<{ issues: Issue[] }>(`/api/projects/${projectId}/language`, { method: "POST", json: { mode: "proofread", doc: scopeDoc, lang: detected, variant } })).issues); }
    catch (e) { toast({ tone: "error", title: t("Dil denetimi yapılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  async function saveGlossary(next: Gloss[]) {
    // Bir satır en az iki dilde dolu olmalı; Almanca sütun isteğe bağlıdır (D144)
    const clean = next.map((g) => ({ tr: g.tr.trim(), en: g.en.trim(), ...(g.de?.trim() ? { de: g.de.trim() } : {}) })).filter((g) => [g.tr, g.en, g.de].filter(Boolean).length >= 2).slice(0, 300);
    setSavingGloss(true);
    try { await api(`/api/projects/${projectId}`, { method: "PATCH", json: { context: { glossary: clean } } }); setGloss(clean); onGlossarySaved(clean); toast({ tone: "success", title: t("Terim sözlüğü kaydedildi") }); }
    catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); }
    finally { setSavingGloss(false); }
  }

  async function place(mode: "replace" | "after") {
    if (!result) return;
    const content = result.doc.content ?? [];
    if (mode === "replace") await onSnapshot(t("Çeviri öncesi sürüm"));
    const chain = editor.chain().focus();
    if (scope === "selection" && selectionRange) {
      if (mode === "replace") chain.insertContentAt(selectionRange, content).run();
      else { const $to = editor.state.doc.resolve(Math.min(selectionRange.to, editor.state.doc.content.size)); chain.insertContentAt($to.depth >= 1 ? $to.after(1) : $to.pos, content).run(); }
    } else if (mode === "replace") chain.setContent({ type: "doc", content }, { emitUpdate: true }).run();
    else chain.insertContentAt(editor.state.doc.content.size, content).run();
    // Önerilen terimler sözlüğe eklenir
    const add = result.terms.filter((_, i) => pickedTerms.has(i));
    if (add.length) await saveGlossary([...gloss, ...add.filter((a) => !gloss.some((g) => (g[from] ?? "").toLocaleLowerCase(from) === (a[from] ?? "").toLocaleLowerCase(from)))]);
    toast({ tone: "success", title: mode === "replace" ? t("Çeviri yerleştirildi") : t("Çeviri eklendi"), detail: mode === "replace" ? t("Önceki hâli Sürümler sekmesinde duruyor.") : undefined });
    onClose();
  }

  function apply(i: number) {
    if (!issues) return;
    const ok = applyIssue(editor, issues[i], scope === "selection" ? selectionRange : null);
    setIssues(issues.map((x, k) => (k === i ? { ...x, state: ok ? "applied" : "missing" } : x)));
  }
  function applyAll() {
    if (!issues) return;
    let n = 0;
    // Sondan başa uygulanır: önceki değişiklikler sonraki konumları kaydırmasın
    const next = [...issues];
    for (let i = next.length - 1; i >= 0; i--) {
      if (next[i].state) continue;
      const ok = applyIssue(editor, next[i], scope === "selection" ? selectionRange : null);
      next[i] = { ...next[i], state: ok ? "applied" : "missing" };
      if (ok) n++;
    }
    setIssues(next);
    toast({ tone: "success", title: t("{n} öneri uygulandı", { n }) });
  }
  const openIssues = (issues ?? []).filter((x) => !x.state).length;
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const x of issues ?? []) c[x.category] = (c[x.category] ?? 0) + 1;
    return c;
  }, [issues]);

  const tabBtn = (id: LanguageTab, label: string, Icon: typeof Languages) => (
    <button key={id} onClick={() => setTab(id)} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium transition", tab === id ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100")}><Icon className="h-4 w-4" /> {t(label)}</button>
  );
  const scopePicker = (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      <span className="text-ink-500">{t("Kapsam:")}</span>
      {selectionRange && <button onClick={() => { setScope("selection"); setResult(null); setIssues(null); }} className={cn("rounded-full border px-3 py-1", scope === "selection" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-600")}>{t("Seçili metin")}</button>}
      <button onClick={() => { setScope("all"); setResult(null); setIssues(null); }} className={cn("rounded-full border px-3 py-1", scope === "all" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-600")}>{scopeLabel}</button>
      <span className="text-ink-400">· {t("{n} kelime", { n: words.toLocaleString() })}</span>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={t("Dil ve çeviri")} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {tabBtn("translate", "Çeviri", Languages)}
          {tabBtn("proofread", "Dil denetimi", SpellCheck2)}
          {tabBtn("glossary", "Terim sözlüğü", BookA)}
        </div>

        {tab === "translate" && (
          <div className="space-y-4">
            {scopePicker}
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-ink-500">{t("Yön:")}</span>
              <select className="input !w-auto !py-1.5" value={from} aria-label={t("Kaynak dil")} onChange={(e) => { setFrom(e.target.value as Lang); setResult(null); }}>
                {(["tr", "en", "de"] as Lang[]).map((l) => <option key={l} value={l}>{t(LANG_LABEL[l])}</option>)}
              </select>
              <span className="text-ink-400">→</span>
              <select className="input !w-auto !py-1.5" value={to} aria-label={t("Hedef dil")} onChange={(e) => { setTo(e.target.value as Lang); setResult(null); }}>
                {(["tr", "en", "de"] as Lang[]).filter((l) => l !== from).map((l) => <option key={l} value={l}>{t(LANG_LABEL[l])}</option>)}
              </select>
              {to === "en" && (
                <select className="input !w-auto !py-1.5" value={variant} onChange={(e) => setVariant(e.target.value as "us" | "uk")} aria-label={t("İngilizce türü")}>
                  <option value="us">{t("Amerikan İngilizcesi")}</option>
                  <option value="uk">{t("İngiliz İngilizcesi")}</option>
                </select>
              )}
              {from !== detected && <span className="text-[12px] text-amber-700">{t("Metin {l} görünüyor; yönü kontrol edin.", { l: t(LANG_LABEL[detected]) })}</span>}
            </div>
            <ul className="space-y-1 rounded-xl bg-ink-50 p-3 text-[12.5px] text-ink-600">
              <li>{t("Atıflar, dipnotlar, şekiller, tablolar ve başlık düzeyleri korunur; içerik eklenmez veya özetlenmez.")}</li>
              <li>{t("Terim sözlüğünüzdeki karşılıklar her geçişte uygulanır ({n} terim).", { n: gloss.length })}</li>
              <li>{t("Ondalık ayırıcı, yüzde ve istatistik gösterimi (Ort./SS ↔ M/SD) hedef dile çevrilir; sayılar değişmez.")}</li>
            </ul>
            {!result && <Button onClick={translate} loading={busy} disabled={empty}><Languages className="h-4 w-4" /> {busy ? t("Çevriliyor…") : t("Çevir")}</Button>}
            {busy && <p className="text-[12.5px] text-ink-500">{t("Uzun bölümler parça parça çevrilir; birkaç dakika sürebilir. Bu pencereyi kapatmayın.")}</p>}
            {result && (
              <div className="space-y-3">
                {(result.missing.citations + result.missing.footnotes + result.missing.figures) > 0 && (
                  <p className="rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">{t("{n} atıf, dipnot veya şekil çeviride yerine oturtulamadı ve metnin sonuna eklendi. Yerleştirdikten sonra konumlarını kontrol edin.", { n: result.missing.citations + result.missing.footnotes + result.missing.figures })}</p>
                )}
                <div className="max-h-[45vh] overflow-y-auto rounded-2xl border border-ink-100 bg-white p-4"><DocPreview doc={result.doc} /></div>
                {result.terms.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[12.5px] font-medium text-ink-600">{t("Çeviride kullanılan terimler — işaretli olanlar terim sözlüğüne eklenir:")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.terms.map((g, i) => (
                        <label key={i} className={cn("flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]", pickedTerms.has(i) ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-ink-200 text-ink-500")}>
                          <input type="checkbox" className="sr-only" checked={pickedTerms.has(i)} onChange={() => { const n = new Set(pickedTerms); if (n.has(i)) n.delete(i); else n.add(i); setPickedTerms(n); }} />
                          {pickedTerms.has(i) && <Check className="h-3 w-3" />}{g[from]} → {g[to]}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => place("replace")}>{scope === "selection" ? t("Seçimin yerine koy") : t("Metni çeviriyle değiştir")}</Button>
                  <Button variant="secondary" onClick={() => place("after")}>{scope === "selection" ? t("Seçimin altına ekle") : t("Sonuna ekle")}</Button>
                  <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(docToPlain(result.doc)).then(() => toast({ tone: "success", title: t("Kopyalandı") }), () => toast({ tone: "error", title: t("Kopyalanamadı") })); }}><ClipboardCopy className="h-4 w-4" /> {t("Kopyala")}</Button>
                  <Button variant="ghost" onClick={() => setResult(null)}>{t("Yeniden çevir")}</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "proofread" && (
          <div className="space-y-4">
            {scopePicker}
            <p className="text-[12.5px] text-ink-500">{detected === "en" ? t("İngilizce metin: dil bilgisi, article, zaman tutarlılığı, akademik üslup ve Türkçeden aktarma kaynaklı yapılar denetlenir.") : detected === "de" ? t("Almanca metin: Duden yazımı, büyük harf ve virgül kuralları, çekim ve uyum, akademik üslup denetlenir.") : t("Türkçe metin: TDK yazımı (de/da, ki, mi), noktalama, anlatım bozuklukları ve akademik üslup denetlenir.")}</p>
            {!issues && <Button onClick={check} loading={busy} disabled={empty}><SpellCheck2 className="h-4 w-4" /> {busy ? t("Denetleniyor…") : t("Denetle")}</Button>}
            {issues && issues.length === 0 && <p className="rounded-xl bg-emerald-50 p-4 text-[13.5px] text-emerald-800">{t("Belirgin bir dil hatası bulunamadı.")}</p>}
            {issues && issues.length > 0 && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">{Object.entries(counts).map(([k, n]) => <span key={k} className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-medium", CAT[k]?.tone)}>{t(CAT[k]?.label ?? k)} {n}</span>)}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={check} loading={busy}>{t("Yeniden denetle")}</Button>
                    <Button size="sm" disabled={!openIssues} onClick={applyAll}>{t("Tümünü uygula ({n})", { n: openIssues })}</Button>
                  </div>
                </div>
                <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                  {issues.map((x, i) => (
                    <div key={i} className={cn("rounded-xl border p-3", x.state ? "border-ink-100 bg-ink-50/60 opacity-70" : "border-ink-100 bg-white")}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", CAT[x.category]?.tone)}>{t(CAT[x.category]?.label ?? x.category)}</span>
                        <span className="text-[12.5px] text-ink-500">{x.reason}</span>
                      </div>
                      <p className="mt-1.5 text-[14px] leading-relaxed"><span className="rounded bg-rose-50 px-1 text-rose-700 line-through decoration-rose-400">{x.original}</span> <span className="text-ink-400">→</span> <span className="rounded bg-emerald-50 px-1 text-emerald-800">{x.suggestion}</span></p>
                      <div className="mt-2 flex items-center gap-2 text-[12.5px]">
                        {!x.state && <><Button size="sm" variant="secondary" onClick={() => apply(i)}><Check className="h-3.5 w-3.5" /> {t("Uygula")}</Button><Button size="sm" variant="ghost" onClick={() => setIssues(issues.map((y, k) => (k === i ? { ...y, state: "ignored" } : y)))}><X className="h-3.5 w-3.5" /> {t("Yok say")}</Button></>}
                        {x.state === "applied" && <span className="font-medium text-emerald-700">{t("Uygulandı")}</span>}
                        {x.state === "ignored" && <span className="text-ink-400">{t("Yok sayıldı")}</span>}
                        {x.state === "missing" && <span className="text-amber-700">{t("Metin değişmiş; bu parça bulunamadı. Elle düzeltin.")}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "glossary" && (
          <div className="space-y-3">
            <p className="text-[13px] text-ink-500">{t("Alanınıza özgü terimlerin karşılıklarını belirleyin; çeviri bunları her geçişte aynı biçimde kullanır, dil denetimi de sapmaları bildirir. Örn. öz yeterlik → self-efficacy.")}</p>
            <div className="max-h-[45vh] space-y-1.5 overflow-y-auto pr-1">
              {gloss.length === 0 && <p className="rounded-xl bg-ink-50 p-4 text-center text-[13px] text-ink-400">{t("Henüz terim yok. Çeviri yaptığınızda önerilen terimleri tek tıkla ekleyebilirsiniz.")}</p>}
              {gloss.map((g, i) => (
                <div key={i} className={cn("grid items-center gap-2", showDe ? "grid-cols-[1fr_1fr_1fr_auto]" : "grid-cols-[1fr_1fr_auto]")}>
                  <input className="input !py-1.5" value={g.tr} placeholder={t("Türkçe terim")} onChange={(e) => setGloss(gloss.map((x, k) => (k === i ? { ...x, tr: e.target.value } : x)))} />
                  <input className="input !py-1.5" value={g.en} placeholder={t("İngilizce karşılığı")} onChange={(e) => setGloss(gloss.map((x, k) => (k === i ? { ...x, en: e.target.value } : x)))} />
                  {showDe && <input className="input !py-1.5" value={g.de ?? ""} placeholder={t("Almanca karşılığı")} onChange={(e) => setGloss(gloss.map((x, k) => (k === i ? { ...x, de: e.target.value } : x)))} />}
                  <button type="button" onClick={() => setGloss(gloss.filter((_, k) => k !== i))} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600" aria-label={t("Sil")}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setGloss([...gloss, { tr: "", en: "", ...(showDe ? { de: "" } : {}) }])}><Plus className="h-4 w-4" /> {t("Terim ekle")}</Button>
              <Button size="sm" loading={savingGloss} onClick={() => saveGlossary(gloss)}>{t("Kaydet")}</Button>
            </div>
            <p className="text-[12px] text-ink-400">{t("Sözlük bu çalışmaya özeldir; ortak yazarlar da aynı sözlüğü kullanır.")} {projectLanguage === "en" ? t("Çalışma dili İngilizce.") : projectLanguage === "de" ? t("Çalışma dili Almanca. Bir terim satırı en az iki dilde dolu olmalı.") : ""}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
