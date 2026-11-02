"use client";
import { ArrowDown, ArrowUp, Check, Copy, Download, ExternalLink, FileSpreadsheet, Plus, Save, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { LIKERT_PRESETS, newId, QuestionsSchema, type Answers, type Question } from "@/lib/surveys";

/* eslint-disable @typescript-eslint/no-explicit-any */
type QType = Question["type"];
const TYPES: { id: QType; label: string }[] = [
  { id: "single", label: "Tek seçimli" },
  { id: "multi", label: "Çoklu seçim" },
  { id: "likert", label: "Likert ölçeği" },
  { id: "number", label: "Sayı" },
  { id: "text", label: "Açık uçlu metin" },
  { id: "info", label: "Bilgi metni" },
];

const DEFAULT_CONSENT_TR = "Bu araştırma [ARAŞTIRMACI ADI] tarafından [KURUM] bünyesinde [AMAÇ] amacıyla yürütülmektedir. Anketi doldurmak yaklaşık [SÜRE] dakika sürer. Katılım tamamen gönüllüdür; istediğiniz an bırakabilirsiniz. Ad, e-posta veya IP adresi gibi kimliğinizi belirleyen hiçbir bilgi toplanmaz. Cevaplar yalnızca bilimsel amaçla, toplu olarak analiz edilecektir. Sorularınız için: [E-POSTA]";

function blank(type: QType, n: number, lang: "tr" | "en"): Question {
  const id = newId();
  const base = { id, code: type === "likert" ? `L${n}_` : `S${n}`, title: "", help: "", required: type !== "info" };
  switch (type) {
    case "single": return { ...base, type, options: lang === "tr" ? ["Seçenek 1", "Seçenek 2"] : ["Option 1", "Option 2"] } as Question;
    case "multi": return { ...base, type, options: lang === "tr" ? ["Seçenek 1", "Seçenek 2"] : ["Option 1", "Option 2"] } as Question;
    case "likert": return { ...base, type, items: [], points: 5, labels: [...LIKERT_PRESETS[lang][5]], reverse: [] } as Question;
    case "number": return { ...base, type, min: null, max: null } as Question;
    case "text": return { ...base, type, long: false } as Question;
    case "info": return { ...base, type, code: `B${n}`, required: false } as Question;
  }
}

export function SurveyEditor({ initial, projects }: { initial: any; projects: { id: string; title: string }[] }) {
  const { t, locale } = useT();
  const toast = useToast();
  const router = useRouter();
  const lang = locale === "en" ? "en" : "tr";
  const [s, setS] = useState<any>(initial);
  const [qs, setQs] = useState<Question[]>(initial.questions ?? []);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"questions" | "settings" | "responses">("questions");
  const locked = s.response_count > 0;
  const link = typeof window !== "undefined" ? `${window.location.origin}/a/${s.token}` : `/a/${s.token}`;
  const closed = !!s.closes_at && new Date(s.closes_at) < new Date();

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setField = (k: string, v: unknown) => { setS((x: any) => ({ ...x, [k]: v })); setDirty(true); };
  const upd = (i: number, patch: Partial<Question>) => { setQs((l) => l.map((q, k) => (k === i ? ({ ...q, ...patch } as Question) : q))); setDirty(true); };
  const move = (i: number, d: number) => { setQs((l) => { const n = [...l]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); return n; }); setDirty(true); };
  const add = (type: QType) => { setQs((l) => [...l, blank(type, l.length + 1, lang)]); setDirty(true); };
  function addDemographics() {
    const n = qs.length;
    const g: Question = { id: newId(), code: "Cinsiyet", title: lang === "tr" ? "Cinsiyetiniz" : "Gender", help: "", required: true, type: "single", options: lang === "tr" ? ["Kadın", "Erkek", "Belirtmek istemiyorum"] : ["Female", "Male", "Prefer not to say"] };
    const a: Question = { id: newId(), code: "Yas", title: lang === "tr" ? "Yaşınız" : "Age", help: "", required: true, type: "number", min: 15, max: 100 };
    if (qs.some((q) => q.code === "Cinsiyet" || q.code === "Yas")) { toast({ tone: "info", title: t("Demografik sorular zaten ekli") }); return; }
    setQs((l) => [...l.slice(0, n), g, a]); setDirty(true);
  }

  const validation = useMemo(() => {
    const untitled = qs.findIndex((q) => !q.title.trim() || (q.type === "likert" && !q.items.length));
    if (untitled >= 0) return t("{n}. sorunun metni veya maddeleri eksik.", { n: untitled + 1 });
    const r = QuestionsSchema.safeParse(qs);
    return r.success ? null : t(r.error.issues[0]?.message ?? "Sorularda hata var");
  }, [qs, t]);

  async function save(extra: Record<string, unknown> = {}) {
    if (validation) { toast({ tone: "warning", title: t("Kaydedilemedi"), detail: validation }); return false; }
    setBusy(true);
    try {
      const r = await api<{ survey: any }>(`/api/surveys/${s.id}`, { method: "PATCH", json: { title: s.title, description: s.description, consent: s.consent, questions: qs, maxResponses: s.max_responses ?? null, closesAt: s.closes_at ?? null, projectId: s.project_id ?? null, ...extra } });
      setS(r.survey); setQs(r.survey.questions); setDirty(false);
      return true;
    } catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); return false; } finally { setBusy(false); }
  }
  async function toggleOpen() {
    const ok = await save({ isOpen: !s.is_open });
    if (ok) toast({ tone: "success", title: s.is_open ? t("Anket kapatıldı") : t("Anket yayında"), detail: s.is_open ? undefined : t("Bağlantıyı katılımcılarla paylaşabilirsiniz.") });
  }
  async function duplicate() {
    try {
      const r = await api<{ survey: { id: string } }>("/api/surveys", { method: "POST", json: { title: `${s.title} (${t("kopya")})`, projectId: s.project_id, copyFrom: s.id } });
      router.push(`/anketler/${r.survey.id}`);
    } catch (e) { toast({ tone: "error", title: t("Kopyalanamadı"), detail: (e as Error).message }); }
  }
  async function remove() {
    if (!confirm(t("Anket ve tüm cevapları kalıcı olarak silinecek. Emin misiniz?"))) return;
    await api(`/api/surveys/${s.id}`, { method: "DELETE" }).catch(() => {});
    router.push("/anketler");
  }
  function share() {
    const text = t("Araştırmama katılır mısınız? Anket yaklaşık birkaç dakika sürüyor:");
    if (navigator.share) navigator.share({ title: s.title, text, url: link }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`, "_blank", "noopener");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href="/anketler" className="text-sm text-ink-500 hover:text-ink-800">← {t("Anketlerim")}</Link>
          <input className="mt-1 w-full bg-transparent font-serif text-3xl font-medium tracking-tight text-ink-950 outline-none" value={s.title} onChange={(e) => setField("title", e.target.value)} aria-label={t("Anket başlığı")} />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-500">
            {s.is_open && !closed ? <Badge tone="green">{t("Yayında")}</Badge> : <Badge>{closed ? t("Süresi doldu") : t("Taslak / kapalı")}</Badge>}
            <span>{t("{n} cevap", { n: s.response_count })}</span>
            {dirty && <span className="text-amber-700">· {t("Kaydedilmemiş değişiklikler")}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => save()} loading={busy} disabled={!dirty}><Save className="h-4 w-4" /> {t("Kaydet")}</Button>
          <Button onClick={toggleOpen} loading={busy} variant={s.is_open ? "ghost" : "primary"}>{s.is_open ? t("Anketi kapat") : t("Yayına al")}</Button>
        </div>
      </div>

      {s.is_open && (
        <div className="card flex flex-wrap items-center gap-2 p-4">
          <span className="text-sm font-medium text-ink-800">{t("Katılımcı bağlantısı:")}</span>
          <input className="input min-w-0 flex-1 !text-[13px]" readOnly value={link} onFocus={(e) => e.target.select()} />
          <Button size="sm" variant="secondary" className="!h-10" onClick={() => { navigator.clipboard.writeText(link); toast({ tone: "success", title: t("Kopyalandı") }); }}><Copy className="h-4 w-4" /></Button>
          <Button size="sm" className="!h-10" onClick={share}><Share2 className="h-4 w-4" /></Button>
          <a href={`/a/${s.token}?onizleme=1`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm text-brand-700 hover:bg-brand-50">{t("Önizle")} <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      )}

      <Tabs value={tab} onChange={(v) => setTab(v)} tabs={[{ id: "questions", label: t("Sorular") }, { id: "settings", label: t("Ayarlar") }, { id: "responses", label: t("Cevaplar") }]} />

      {tab === "questions" && (
        <div className="space-y-4">
          {locked && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{t("Bu anket cevap almaya başladı. Veri sütunları bozulmasın diye soru ekleyip çıkaramaz, seçenek sayısını değiştiremezsiniz; yalnızca yazım düzeltmesi yapabilirsiniz. Yeni sorular için anketin kopyasını oluşturun.")} <button onClick={duplicate} className="font-medium underline">{t("Kopya oluştur")}</button></p>}
          {qs.length === 0 && <p className="card p-6 text-center text-sm text-ink-500">{t("Aşağıdaki düğmelerle soru ekleyin. Hazır bir ölçek kullanacaksanız maddelerini “Likert ölçeği” ile tek seferde yapıştırabilirsiniz.")}</p>}
          {qs.map((q, i) => <QuestionCard key={q.id} q={q} i={i} n={qs.length} locked={locked} lang={lang} onChange={(p) => upd(i, p)} onMove={(d) => move(i, d)} onDelete={() => { setQs((l) => l.filter((_, k) => k !== i)); setDirty(true); }} />)}
          {!locked && (
            <div className="flex flex-wrap gap-2">
              {TYPES.map((x) => <Button key={x.id} size="sm" variant="secondary" onClick={() => add(x.id)}><Plus className="h-3.5 w-3.5" /> {t(x.label)}</Button>)}
              <Button size="sm" variant="ghost" onClick={addDemographics}>{t("Demografik sorular ekle")}</Button>
            </div>
          )}
          {validation && qs.length > 0 && <p className="text-sm text-rose-600">{validation}</p>}
          <p className="text-xs text-ink-400">{t("Başkasına ait bir ölçeği kullanıyorsanız (ör. uyarlanmış ölçekler), çoğu zaman ölçek sahibinden yazılı kullanım izni almanız gerekir. Anketi uygulamadan önce kurumunuzun etik kurul onayını almayı unutmayın.")}</p>
        </div>
      )}

      {tab === "settings" && (
        <div className="card space-y-4 p-5">
          <label className="block"><span className="label">{t("Açıklama (katılımcılar formun başında görür)")}</span><textarea className="input min-h-[90px]" value={s.description} onChange={(e) => setField("description", e.target.value)} /></label>
          <label className="block">
            <span className="label">{t("Bilgilendirilmiş onam metni")}</span>
            <textarea className="input min-h-[140px]" value={s.consent} onChange={(e) => setField("consent", e.target.value)} placeholder={t("Boş bırakılırsa onam adımı gösterilmez.")} />
            {!s.consent && <button type="button" className="mt-1 text-xs text-brand-700 hover:underline" onClick={() => setField("consent", lang === "tr" ? DEFAULT_CONSENT_TR : "This research is conducted by [RESEARCHER] at [INSTITUTION] for [PURPOSE]. It takes about [TIME] minutes. Participation is voluntary and you may stop at any time. No identifying information (name, email or IP address) is collected. Responses will be analysed only in aggregate for scientific purposes. Contact: [EMAIL]")}>{t("Örnek onam metni ekle")}</button>}
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block"><span className="label">{t("En fazla cevap (isteğe bağlı)")}</span><input className="input" inputMode="numeric" value={s.max_responses ?? ""} onChange={(e) => setField("max_responses", e.target.value ? Math.max(1, Math.min(100000, Number(e.target.value.replace(/\D/g, "")) || 1)) : null)} /></label>
            <label className="block"><span className="label">{t("Kapanış tarihi (isteğe bağlı)")}</span><input type="date" className="input" value={s.closes_at ? String(s.closes_at).slice(0, 10) : ""} onChange={(e) => setField("closes_at", e.target.value ? new Date(`${e.target.value}T23:59:59`).toISOString() : null)} /></label>
            <label className="block"><span className="label">{t("Cevapların kullanılacağı çalışma")}</span><select className="input" value={s.project_id ?? ""} onChange={(e) => setField("project_id", e.target.value || null)}><option value="">{t("Yok")}</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-ink-100 pt-4">
            <Button variant="secondary" onClick={() => save()} loading={busy} disabled={!dirty}><Save className="h-4 w-4" /> {t("Kaydet")}</Button>
            <Button variant="ghost" onClick={duplicate}><Copy className="h-4 w-4" /> {t("Kopya oluştur")}</Button>
            <Button variant="ghost" className="text-rose-600" onClick={remove}><Trash2 className="h-4 w-4" /> {t("Anketi sil")}</Button>
          </div>
        </div>
      )}

      {tab === "responses" && <Responses survey={s} questions={qs} projects={projects} onCount={(c) => setS((x: any) => ({ ...x, response_count: c }))} />}
    </div>
  );
}

function QuestionCard({ q, i, n, locked, lang, onChange, onMove, onDelete }: { q: Question; i: number; n: number; locked: boolean; lang: "tr" | "en"; onChange: (p: Partial<Question>) => void; onMove: (d: number) => void; onDelete: () => void }) {
  const { t } = useT();
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">{i + 1}</span>
        <Badge tone="brand">{t(TYPES.find((x) => x.id === q.type)!.label)}</Badge>
        <div className="ml-auto flex items-center gap-1">
          {!locked && <>
            <button onClick={() => onMove(-1)} disabled={i === 0} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label={t("Yukarı taşı")}><ArrowUp className="h-4 w-4" /></button>
            <button onClick={() => onMove(1)} disabled={i === n - 1} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label={t("Aşağı taşı")}><ArrowDown className="h-4 w-4" /></button>
            <button onClick={onDelete} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50" aria-label={t("Soruyu sil")}><Trash2 className="h-4 w-4" /></button>
          </>}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_150px]">
        <label className="block"><span className="label">{q.type === "likert" ? t("Ölçek yönergesi") : q.type === "info" ? t("Bilgi metni") : t("Soru")}</span><textarea className="input min-h-[60px]" value={q.title} onChange={(e) => onChange({ title: e.target.value })} placeholder={q.type === "likert" ? t("ör. Aşağıdaki ifadelere ne ölçüde katıldığınızı belirtiniz.") : ""} /></label>
        {q.type !== "info" && <label className="block"><span className="label" title={t("Veri dosyasındaki sütun adı")}>{q.type === "likert" ? t("Madde kodu ön eki") : t("Değişken adı")}</span><input className="input font-mono !text-[13px]" value={q.code} disabled={locked} onChange={(e) => onChange({ code: e.target.value.replace(/[^\p{L}\p{N}_.-]/gu, "").slice(0, 40) })} /></label>}
      </div>
      {(q.type === "single" || q.type === "multi") && (
        <label className="block"><span className="label">{t("Seçenekler (her satıra bir tane)")}</span><textarea className="input min-h-[90px]" defaultValue={q.options.join("\n")} onBlur={(e) => { const o = lines(e.target.value); if (!locked || o.length === q.options.length) onChange({ options: o }); else e.target.value = q.options.join("\n"); }} /></label>
      )}
      {q.type === "likert" && (
        <>
          <label className="block"><span className="label">{t("Maddeler (her satıra bir madde; ölçekten kopyalayıp yapıştırabilirsiniz)")}</span><textarea className="input min-h-[140px]" defaultValue={q.items.join("\n")} onBlur={(e) => { const it = lines(e.target.value).map((x) => x.replace(/^\d+[.)]\s*/, "")); if (!locked || it.length === q.items.length) onChange({ items: it, reverse: q.reverse.filter((r) => r < it.length) }); else e.target.value = q.items.join("\n"); }} /></label>
          <div className="flex flex-wrap items-center gap-3">
            <span className="label !mb-0">{t("Derece")}</span>
            {[5, 7].map((p) => <button key={p} type="button" disabled={locked} onClick={() => onChange({ points: p as 5 | 7, labels: [...LIKERT_PRESETS[lang][p as 5 | 7]] })} className={cn("rounded-lg border px-3 py-1 text-sm", q.points === p ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-700")}>{p}</button>)}
          </div>
          <label className="block"><span className="label">{t("Seçenek etiketleri (1’den {k}’ye, her satıra bir tane)", { k: q.points })}</span><textarea className="input min-h-[90px] !text-[13px]" defaultValue={q.labels.join("\n")} key={q.points} onBlur={(e) => onChange({ labels: lines(e.target.value) })} /></label>
          {q.items.length > 0 && (
            <div>
              <span className="label">{t("Ters puanlanan maddeler")}</span>
              <div className="flex flex-wrap gap-1.5">{q.items.map((it, k) => { const on = q.reverse.includes(k); return <button key={k} type="button" title={it} onClick={() => onChange({ reverse: on ? q.reverse.filter((x) => x !== k) : [...q.reverse, k].sort((a, b) => a - b) })} className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[12px]", on ? "border-violet-400 bg-violet-50 text-violet-700" : "border-ink-200 text-ink-500")}>{q.code}{k + 1}</button>; })}</div>
              <p className="mt-1 text-xs text-ink-400">{t("Ters maddeler projeye aktarılırken otomatik ters kodlanır (k + 1 − x); ham veri indirmesinde olduğu gibi kalır.")}</p>
            </div>
          )}
        </>
      )}
      {q.type === "number" && (
        <div className="grid max-w-sm grid-cols-2 gap-3">
          <label className="block"><span className="label">{t("En az")}</span><input className="input" inputMode="decimal" defaultValue={q.min ?? ""} onBlur={(e) => onChange({ min: e.target.value.trim() ? Number(e.target.value.replace(",", ".")) : null })} /></label>
          <label className="block"><span className="label">{t("En fazla")}</span><input className="input" inputMode="decimal" defaultValue={q.max ?? ""} onBlur={(e) => onChange({ max: e.target.value.trim() ? Number(e.target.value.replace(",", ".")) : null })} /></label>
        </div>
      )}
      {q.type === "text" && <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={q.long} onChange={(e) => onChange({ long: e.target.checked })} /> {t("Uzun cevap (paragraf)")}</label>}
      {q.type !== "info" && <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={q.required} onChange={(e) => onChange({ required: e.target.checked } as any)} /> {t("Zorunlu")}</label>}
    </div>
  );
}

function Responses({ survey, questions, projects, onCount }: { survey: any; questions: Question[]; projects: { id: string; title: string }[]; onCount: (n: number) => void }) {
  const { t } = useT();
  const toast = useToast();
  const [rows, setRows] = useState<{ id: string; answers: Answers; created_at: string }[] | null>(null);
  const [projectId, setProjectId] = useState<string>(survey.project_id ?? projects[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const load = () => api<{ responses: any[] }>(`/api/surveys/${survey.id}/responses`).then((r) => { setRows(r.responses); onCount(r.responses.length); }).catch(() => setRows([]));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toProject() {
    setBusy(true);
    try {
      const r = await api<{ file: { name: string }; rows: number }>(`/api/surveys/${survey.id}/to-project`, { method: "POST", json: { projectId, reverse: true } });
      setDone(projectId);
      toast({ tone: "success", title: t("{n} cevap projeye aktarıldı", { n: r.rows }), detail: t("Çalışma alanında Araçlar → İstatistik analizi veya Grafik oluştur ile kullanabilirsiniz.") });
    } catch (e) { toast({ tone: "error", title: t("Aktarılamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function clearAll() {
    if (!confirm(t("Tüm cevaplar kalıcı olarak silinecek. Emin misiniz?"))) return;
    const r = await api<{ count: number }>(`/api/surveys/${survey.id}/responses`, { method: "DELETE" }).catch(() => null);
    if (r) { setRows([]); onCount(r.count); }
  }
  if (!rows) return <p className="text-sm text-ink-500">{t("Yükleniyor…")}</p>;
  const n = rows.length;
  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-5">
        <p className="text-2xl font-semibold text-ink-900">{n}</p><p className="text-sm text-ink-500">{t("cevap")}</p>
        <div className="ml-auto flex flex-wrap gap-2">
          <a className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-[13px] font-medium text-ink-700 hover:border-ink-300", !n && "pointer-events-none opacity-40")} href={`/api/surveys/${survey.id}/responses?format=csv`}><Download className="h-4 w-4" /> {t("Ham veri (CSV)")}</a>
          <a className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-[13px] font-medium text-ink-700 hover:border-ink-300", !n && "pointer-events-none opacity-40")} href={`/api/surveys/${survey.id}/responses?format=csv&reverse=1`}><Download className="h-4 w-4" /> {t("Ters maddeler kodlanmış (CSV)")}</a>
          <a className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-[13px] font-medium text-ink-700 hover:border-ink-300" href={`/api/surveys/${survey.id}/responses?format=codebook`}><Download className="h-4 w-4" /> {t("Kod kitabı")}</a>
        </div>
      </div>
      {n > 0 && projects.length > 0 && (
        <div className="card flex flex-wrap items-center gap-2 p-5">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium text-ink-800">{t("Cevapları çalışmaya veri dosyası olarak aktar:")}</span>
          <select className="input max-w-xs" value={projectId} onChange={(e) => setProjectId(e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
          <Button onClick={toProject} loading={busy} disabled={!projectId}>{t("Aktar")}</Button>
          {done && <Link href={`/proje/${done}`} className="inline-flex items-center gap-1 text-sm text-emerald-700"><Check className="h-4 w-4" /> {t("Çalışmayı aç")}</Link>}
        </div>
      )}
      {n > 0 && <Summary questions={questions} rows={rows} />}
      {n > 0 && <button onClick={clearAll} className="text-sm text-rose-600 hover:underline">{t("Tüm cevapları sil (ör. deneme cevaplarından sonra)")}</button>}
    </div>
  );
}

function Summary({ questions, rows }: { questions: Question[]; rows: { answers: Answers }[] }) {
  const { t } = useT();
  return (
    <div className="space-y-3">
      {questions.filter((q) => q.type === "single" || q.type === "multi" || q.type === "likert" || q.type === "number").map((q) => {
        if (q.type === "single" || q.type === "multi") {
          const counts = q.options.map((_, k) => rows.filter((r) => (q.type === "single" ? r.answers[q.id] === k : Array.isArray(r.answers[q.id]) && (r.answers[q.id] as number[]).includes(k))).length);
          const total = q.type === "single" ? counts.reduce((a, b) => a + b, 0) : rows.filter((r) => Array.isArray(r.answers[q.id])).length;
          return (
            <div key={q.id} className="card p-4">
              <p className="font-medium text-ink-900">{q.title} <span className="font-mono text-xs text-ink-400">{q.code}</span></p>
              <div className="mt-2 space-y-1.5">{q.options.map((o, k) => { const pct = total ? (100 * counts[k]) / total : 0; return <div key={k} className="text-[13px]"><div className="flex justify-between text-ink-700"><span>{o}</span><span>{counts[k]} ({pct.toFixed(0)}%)</span></div><div className="h-1.5 rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} /></div></div>; })}</div>
            </div>
          );
        }
        if (q.type === "number") {
          const v = rows.map((r) => r.answers[q.id]).filter((x): x is number => typeof x === "number");
          const m = v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
          return <div key={q.id} className="card p-4 text-[13.5px]"><p className="font-medium text-ink-900">{q.title} <span className="font-mono text-xs text-ink-400">{q.code}</span></p><p className="mt-1 text-ink-600">n = {v.length} · {t("ortalama")} = {Number.isFinite(m) ? m.toFixed(2) : "—"} · min = {v.length ? Math.min(...v) : "—"} · max = {v.length ? Math.max(...v) : "—"}</p></div>;
        }
        if (q.type === "likert") {
          return (
            <div key={q.id} className="card overflow-x-auto p-4">
              <p className="font-medium text-ink-900">{q.title}</p>
              <table className="mt-2 w-full text-[13px]"><tbody>{q.items.map((it, k) => { const v = rows.map((r) => r.answers[`${q.id}:${k}`]).filter((x): x is number => typeof x === "number"); const m = v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN; return <tr key={k} className="border-t border-ink-100"><td className="py-1.5 pr-2 font-mono text-xs text-ink-400">{q.code}{k + 1}{q.reverse.includes(k) ? "*" : ""}</td><td className="py-1.5 pr-3 text-ink-700">{it}</td><td className="whitespace-nowrap py-1.5 text-right text-ink-600">{t("ort.")} {Number.isFinite(m) ? m.toFixed(2) : "—"} (n = {v.length})</td></tr>; })}</tbody></table>
              {q.reverse.length > 0 && <p className="mt-1 text-xs text-ink-400">{t("* ters madde (burada ham değerler gösterilir)")}</p>}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
