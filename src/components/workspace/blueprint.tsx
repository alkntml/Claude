"use client";
import { ArrowRight, Check, Compass, Loader2, PenLine, Plus, RefreshCw, Save, Sparkles, Undo2, Wand2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { alignChapters, BLUEPRINT_FIELDS, blueprintGaps, emptyBlueprint, readBlueprint, type Blueprint, type BlueprintFieldKey } from "@/lib/blueprint";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Stage = { id: string; key: string; title: string };

/**
 * Kurgu modülü (D67): çalışmaya başlamadan önce araştırmanın planı tek ekranda.
 * Öğrenci yapay zekâya kurgulatır veya kendisi yazar, istediği alanı değiştirir, farklı bir girişle
 * yeniden kurgulatır; onaylayınca çalışma mevcut adımlarla (başlık → bölümler) ilerler.
 */
export function BlueprintScreen({ open, onClose, project, stages, onSaved, onApproved }: {
  open: boolean; onClose: () => void; project: any; stages: Stage[];
  onSaved: (project: any) => void; onApproved: () => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const saved = readBlueprint(project.context?.blueprint);
  const [bp, setBp] = useState<Blueprint | null>(saved ? { ...saved, chapters: alignChapters(saved, stages) } : null);
  const [input, setInput] = useState(saved?.input ?? "");
  const [inputOpen, setInputOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldBusy, setFieldBusy] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ key: string; bp: Blueprint } | null>(null);
  const [saving, setSaving] = useState<"save" | "approve" | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  if (!open) return null;

  const set = (patch: Partial<Blueprint>) => { setBp((b) => ({ ...(b ?? emptyBlueprint()), ...patch })); setDirty(true); };

  async function generate(text = input) {
    if (bp && dirty && !confirm(t("Kurgu, yazdığınız girişe göre yeniden oluşturulacak. Mevcut taslaktaki değişiklikler değişebilir. Devam edilsin mi?"))) return;
    setBusy(true);
    try {
      const r = await api<{ blueprint: Blueprint }>(`/api/projects/${project.id}/blueprint`, { method: "POST", json: { mode: "generate", input: text } });
      setUndo(bp ? { key: "all", bp } : null);
      setBp(r.blueprint); setDirty(true); setInputOpen(false);
    } catch (e) { toast({ tone: "error", title: t("Kurgu oluşturulamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }

  async function refine(field: BlueprintFieldKey | "questions") {
    if (!bp) return;
    setFieldBusy(field);
    try {
      const r = await api<{ text: string; questions: string[] }>(`/api/projects/${project.id}/blueprint`, { method: "POST", json: { mode: "field", field, blueprint: bp } });
      setUndo({ key: field, bp });
      if (field === "questions") { if (r.questions.length) set({ questions: r.questions }); }
      else if (r.text) set({ [field]: r.text } as Partial<Blueprint>);
    } catch (e) { toast({ tone: "error", title: t("Öneri alınamadı"), detail: (e as Error).message }); } finally { setFieldBusy(null); }
  }

  async function save(approve: boolean) {
    if (!bp) return;
    if (approve) {
      const gaps = blueprintGaps(bp);
      if (gaps.length && !confirm(t("Şu kısımlar boş: {list}. Yine de onaylansın mı? Daha sonra da tamamlayabilirsiniz.", { list: gaps.map((g) => t(g)).join(", ") }))) return;
    }
    setSaving(approve ? "approve" : "save");
    try {
      const r = await api<{ project: any }>(`/api/projects/${project.id}/blueprint`, { method: "PUT", json: { blueprint: { ...bp, input }, ...(approve ? { approve: true } : {}) } });
      onSaved(r.project); setDirty(false);
      if (approve) { toast({ tone: "success", title: t("Kurgu onaylandı"), detail: t("Çalışmanız bu plana göre adım adım ilerleyecek. Kurguyu istediğiniz zaman sol menüden açıp değiştirebilirsiniz.") }); onApproved(); }
      else { toast({ tone: "success", title: t("Kurgu kaydedildi") }); onClose(); }
    } catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); } finally { setSaving(null); }
  }

  function close() {
    if (dirty && !confirm(t("Kaydedilmemiş değişiklikler var. Kaydetmeden kapatılsın mı?"))) return;
    onClose();
  }

  const approved = !!saved?.approvedAt;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-50" role="dialog" aria-modal aria-label={t("Çalışmanın kurgusu")}>
      {/* Üst çubuk */}
      <header className="flex flex-wrap items-center gap-3 border-b border-ink-100 bg-white px-4 py-3 sm:px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Compass className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{t("Başlangıç · Çalışmanın kurgusu")}</p>
          <p className="truncate font-serif text-lg text-ink-950">{project.title}</p>
        </div>
        {bp && (approved && !dirty ? <Badge tone="green"><Check className="h-3 w-3" /> {t("Onaylandı")}</Badge> : <Badge tone="amber">{t("Taslak")}</Badge>)}
        {bp && <Button size="sm" variant="secondary" onClick={() => setInputOpen((v) => !v)} disabled={busy}><PenLine className="h-3.5 w-3.5" /> {t("Farklı bir giriş yap")}</Button>}
        <button onClick={close} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100" aria-label={t("Kapat")}><X className="h-5 w-5" /></button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {busy ? (
            <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              <p className="mt-4 font-semibold text-ink-900">{t("Çalışmanızın kurgusu hazırlanıyor…")}</p>
              <p className="mt-1 text-sm text-ink-500">{t("Problem, amaç, sorular, yöntem ve her bölümün planı birbiriyle uyumlu olacak şekilde kuruluyor. Bu işlem 20–60 saniye sürebilir.")}</p>
            </div>
          ) : !bp ? (
            /* Başlangıç: nasıl kurgulanacağını seç */
            <div className="mx-auto max-w-3xl">
              <h1 className="font-serif text-3xl font-medium tracking-tight text-ink-950 sm:text-4xl">{t("Yazmaya başlamadan önce çalışmanızı kurgulayalım")}</h1>
              <p className="mt-3 text-ink-600">{t("Kurgu; araştırma probleminizi, amacınızı, sorularınızı, yöntemi ve her bölümde ne yazılacağını tek ekranda gösterir. İstediğiniz yeri değiştirebilirsiniz. Onayladığınızda çalışma bu plana göre adım adım ilerler.")}</p>
              <div className="card mt-6 space-y-3 p-5">
                <label className="block">
                  <span className="label">{t("Aklınızdaki fikir (isteğe bağlı)")}</span>
                  <textarea className="input min-h-[110px]" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("ör. Lise öğretmenleriyle görüşme yaparak nitel bir çalışma yapmak istiyorum; özellikle uzaktan eğitimde yaşadıkları zorluklara odaklanacağım.")} />
                  <span className="mt-1 block text-xs text-ink-400">{t("Yöntem tercihiniz, örnekleminiz, danışmanınızın önerileri veya kısıtlarınız varsa yazın; kurgu buna göre kurulur. Boş bırakırsanız çalışma bilgilerinizden kurgulanır.")}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => generate()}><Sparkles className="h-4 w-4" /> {t("Kurguyu yapay zekâ ile oluştur")}</Button>
                  <Button variant="ghost" onClick={() => { setBp({ ...emptyBlueprint(), input, chapters: alignChapters(emptyBlueprint(), stages) }); setDirty(true); }}><PenLine className="h-4 w-4" /> {t("Kendim yazacağım")}</Button>
                </div>
              </div>
              <ol className="mt-6 grid gap-3 sm:grid-cols-3">
                {[["1", "Kurgu", "Planı görün, düzenleyin, onaylayın"], ["2", "Başlık", "Kurguya uygun başlığı seçin"], ["3", "Bölümler", "Çalışma adım adım ilerler"]].map(([n, a, b]) => (
                  <li key={n} className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">{n}</span><span><span className="block font-medium text-ink-900">{t(a)}</span><span className="text-[13px] text-ink-500">{t(b)}</span></span></li>
                ))}
              </ol>
            </div>
          ) : (
            <>
              {inputOpen && (
                <div className="card mb-6 space-y-3 border-brand-200 p-5">
                  <p className="font-semibold text-ink-900">{t("Farklı bir giriş yap")}</p>
                  <textarea className="input min-h-[96px]" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("ör. Nicel değil nitel yöntem kullanmak istiyorum; örneklemi 15 öğretmenle sınırla.")} />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => generate()} disabled={!input.trim()}><RefreshCw className="h-4 w-4" /> {t("Kurguyu buna göre yeniden oluştur")}</Button>
                    <Button variant="ghost" onClick={() => setInputOpen(false)}>{t("Vazgeç")}</Button>
                  </div>
                </div>
              )}
              {undo && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
                  <Check className="h-4 w-4" /> {undo.key === "all" ? t("Kurgu yeniden oluşturuldu.") : t("Yeni öneri yazıldı.")}
                  <button className="ml-auto inline-flex items-center gap-1 font-medium hover:underline" onClick={() => { setBp(undo.bp); setUndo(null); }}><Undo2 className="h-3.5 w-3.5" /> {t("Geri al")}</button>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                {/* Araştırmanın planı */}
                <section className="space-y-4">
                  <h2 className="font-serif text-2xl text-ink-950">{t("Araştırmanın planı")}</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {BLUEPRINT_FIELDS.map((f) => (
                      <div key={f.key} className={cn("card p-4", (f.key === "problem" || f.key === "aim") && "md:col-span-2")}>
                        <div className="mb-1.5 flex items-center gap-2">
                          <p className="font-semibold text-ink-900">{t(f.label)}</p>
                          <FieldAi busy={fieldBusy === f.key} disabled={!!fieldBusy} onClick={() => refine(f.key)} />
                        </div>
                        <textarea className="input min-h-[92px] !text-[14px] leading-relaxed" value={bp[f.key]} onChange={(e) => set({ [f.key]: e.target.value } as Partial<Blueprint>)} placeholder={t(f.hint)} maxLength={2000} />
                      </div>
                    ))}
                    <div className="card p-4 md:col-span-2">
                      <div className="mb-1.5 flex items-center gap-2">
                        <p className="font-semibold text-ink-900">{t("Araştırma soruları / hipotezler")}</p>
                        <FieldAi busy={fieldBusy === "questions"} disabled={!!fieldBusy} onClick={() => refine("questions")} />
                      </div>
                      <div className="space-y-2">
                        {bp.questions.map((q, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="mt-2.5 w-5 shrink-0 text-right text-[13px] font-semibold text-ink-400">{i + 1}.</span>
                            <textarea rows={1} className="input min-h-[42px] !text-[14px]" value={q} onChange={(e) => set({ questions: bp.questions.map((x, k) => (k === i ? e.target.value : x)) })} maxLength={500} />
                            <button onClick={() => set({ questions: bp.questions.filter((_, k) => k !== i) })} className="mt-2 rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600" aria-label={t("Soruyu kaldır")}><X className="h-4 w-4" /></button>
                          </div>
                        ))}
                        {bp.questions.length < 12 && <button onClick={() => set({ questions: [...bp.questions, ""] })} className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:underline"><Plus className="h-3.5 w-3.5" /> {t("Soru ekle")}</button>}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Bölüm bölüm yol haritası */}
                <section className="space-y-4">
                  <h2 className="font-serif text-2xl text-ink-950">{t("Bölüm bölüm yol haritası")}</h2>
                  <p className="-mt-2 text-[13px] text-ink-500">{t("Bölümler sabittir; her bölümde ne yazılacağını buradan değiştirebilirsiniz. Asistan her bölümü bu plana göre yazar.")}</p>
                  <ol className="relative space-y-3 border-l-2 border-brand-100 pl-5">
                    {bp.chapters.map((c, i) => (
                      <li key={c.stageId} className="relative">
                        <span className="absolute -left-[31px] top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">{i + 1}</span>
                        <div className="card p-3.5">
                          <p className="text-[14px] font-semibold text-ink-900">{c.title}</p>
                          <textarea className="input mt-1.5 min-h-[64px] !text-[13.5px]" value={c.plan} onChange={(e) => set({ chapters: bp.chapters.map((x, k) => (k === i ? { ...x, plan: e.target.value } : x)) })} placeholder={t("Bu bölümde ne anlatılacak?")} maxLength={1200} />
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
              <p className="mt-6 text-xs text-ink-400">{t("Kurgu bir plandır: kaynak, bulgu veya istatistik içermez. Önerilen örneklem ve analizleri danışmanınızla birlikte kesinleştirin.")}</p>
            </>
          )}
        </div>
      </div>

      {bp && !busy && (
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-100 bg-white px-4 py-3 sm:px-6">
          {!approved && <span className="mr-auto hidden text-[13px] text-ink-500 sm:block">{t("Onayladıktan sonra sırasıyla başlık ve bölümler gelir.")}</span>}
          <Button variant="ghost" onClick={() => save(false)} loading={saving === "save"} disabled={!!saving}><Save className="h-4 w-4" /> {t("Taslak olarak kaydet")}</Button>
          <Button onClick={() => save(true)} loading={saving === "approve"} disabled={!!saving}>{approved ? <><Check className="h-4 w-4" /> {t("Değişiklikleri onayla")}</> : <>{t("Kurguyu onayla ve başla")} <ArrowRight className="h-4 w-4" /></>}</Button>
        </footer>
      )}
    </div>
  );
}

function FieldAi({ busy, disabled, onClick }: { busy: boolean; disabled: boolean; onClick: () => void }) {
  const { t } = useT();
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[12px] font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50" title={t("Bu kısmı yapay zekâ yeniden önersin")}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} {t("Yeniden öner")}
    </button>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
