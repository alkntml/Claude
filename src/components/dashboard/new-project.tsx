"use client";
import { useT } from "@/i18n/client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { WORK_ICONS } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { STYLES, STYLE_IDS } from "@/lib/citations/styles";
import { api } from "@/lib/client";
import { buildRoadmap, GRANT_PROGRAMS, type GrantProgram, LEVEL_LABELS, METHODOLOGY_LABELS, WORK_TYPES, type AcademicLevel, type Methodology, type WorkType } from "@/lib/workflows";

const STEPS = ["Çalışma türü", "Akademik profil", "Araştırma bilgileri"];

export function NewProjectWizard({ defaultStyle }: { defaultStyle: string }) {
  const { t, locale } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const initialType = WORK_TYPES.find((w) => w.id === params.get("tur"))?.id;
  const [step, setStep] = useState(initialType ? 1 : 0);
  const [workType, setWorkType] = useState<WorkType>(initialType ?? "thesis");
  const [level, setLevel] = useState<AcademicLevel>("master");
  const [methodology, setMethodology] = useState<Methodology>("quantitative");
  const [discipline, setDiscipline] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(() => (params.get("konu") ?? "").slice(0, 4000));
  const [keywords, setKeywords] = useState("");
  const [language, setLanguage] = useState<"tr" | "en">(locale);
  const [style, setStyle] = useState(defaultStyle);
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState<GrantProgram>("tubitak_2209a");
  const [loading, setLoading] = useState(false);

  const wt = WORK_TYPES.find((w) => w.id === workType)!;
  const roadmap = useMemo(() => buildRoadmap({ workType, level, methodology, program }), [workType, level, methodology, program]);
  const showMethod = ["thesis", "research_proposal", "research_article", "journal_article"].includes(workType);

  async function create() {
    setLoading(true);
    try {
      const { project } = await api<{ project: { id: string } }>("/api/projects", {
        method: "POST",
        json: { title: title.trim() || topic.slice(0, 120) || t(wt.title), workType, level, methodology, discipline, language, citationStyle: style, topic, keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean), university: university || undefined, ...(workType === "grant_proposal" ? { program } : {}) },
      });
      router.push(`/proje/${project.id}`);
    } catch (e) {
      toast({ tone: "error", title: t("Çalışma oluşturulamadı"), detail: t((e as Error).message) });
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-8 flex items-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <button onClick={() => i < step && setStep(i)} className={cn("flex items-center gap-2 text-sm font-medium transition", i === step ? "text-ink-900" : i < step ? "text-brand-600" : "text-ink-400")}>
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs transition", i < step ? "bg-brand-600 text-white" : i === step ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-500")}>{i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                <span className="hidden sm:inline">{t(s)}</span>
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-8 bg-ink-200" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && (
              <>
                <h1 className="font-serif text-3xl font-medium tracking-tight">{t("Bugün hangi akademik çalışmayı hazırlamak istiyorsunuz?")}</h1>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {WORK_TYPES.map((w) => {
                    const Icon = WORK_ICONS[w.icon];
                    const sel = w.id === workType;
                    return (
                      <button key={w.id} onClick={() => { setWorkType(w.id); if (!w.levels.includes(level)) setLevel(w.levels[0]); }} className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left transition duration-200", sel ? "border-brand-300 bg-brand-50/60 ring-4 ring-brand-100" : "border-ink-100 bg-white hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-soft")}>
                        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition", sel ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600")}><Icon className="h-5 w-5" /></span>
                        <span><span className="block font-semibold text-ink-900">{t(w.title)}</span><span className="mt-0.5 block text-[13px] leading-snug text-ink-500">{t(w.description)}</span></span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {step === 1 && (
              <div className="space-y-6">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{t("{w}: akademik profil", { w: t(wt.title) })}</h1>
                <div>
                  <span className="label">{t("Akademik seviye")}</span>
                  <div className="flex flex-wrap gap-2">
                    {wt.levels.map((l) => <button key={l} onClick={() => setLevel(l)} className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition", level === l ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-ink-300")}>{t(LEVEL_LABELS[l])}</button>)}
                  </div>
                </div>
                {workType === "grant_proposal" && (
                  <div>
                    <label className="label" htmlFor="program">{t("Başvurulacak program")}</label>
                    <select id="program" className="input" value={program} onChange={(e) => setProgram(e.target.value as GrantProgram)}>{GRANT_PROGRAMS.map((p) => <option key={p.id} value={p.id}>{t(p.label)}</option>)}</select>
                    <p className="mt-1.5 text-xs text-ink-400">{t("Bölümler TÜBİTAK başvuru formlarındaki düzene göre hazırlanır. Kelime sınırları, destek üst sınırları ve form ayrıntıları dönemden döneme değişebilir; başvurmadan önce güncel çağrı duyurusunu kontrol edin.")}</p>
                  </div>
                )}
                {showMethod && (
                  <div>
                    <span className="label">{t("Araştırma yaklaşımı")}</span>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(METHODOLOGY_LABELS) as Methodology[]).map((m) => <button key={m} onClick={() => setMethodology(m)} className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition", methodology === m ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-700 hover:border-ink-300")}>{t(METHODOLOGY_LABELS[m])}</button>)}
                    </div>
                    <p className="mt-2 text-xs text-ink-400">{t("Yaklaşım, yol haritasındaki aşamaları değiştirir (ör. nitel çalışmalarda “Evren ve örneklem” yerine “Çalışma grubu”).")}</p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="disc">{t("Bilim dalı / disiplin")}</label><input id="disc" className="input" placeholder={t("ör. Klinik Psikoloji")} value={discipline} onChange={(e) => setDiscipline(e.target.value)} /></div>
                  <div><label className="label" htmlFor="uni">{t("Üniversite / hedef dergi (isteğe bağlı)")}</label><input id="uni" className="input" placeholder={t("ör. Hacettepe Üniversitesi")} value={university} onChange={(e) => setUniversity(e.target.value)} /></div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{t("Araştırmanızı tanımlayın")}</h1>
                <div><label className="label" htmlFor="topic">{t("Araştırma konusu")}</label><textarea id="topic" className="input min-h-[110px]" placeholder={t("ör. Kişilik özellikleri, ebeveyn tutumları ve ilişki odaklı obsesif kompulsif belirtiler arasındaki ilişkinin incelenmesi")} value={topic} onChange={(e) => setTopic(e.target.value)} /><p className="mt-1.5 text-xs text-ink-400">{t("Konu henüz net değilse boş bırakabilirsiniz. İlk aşamadaki asistan konuyu belirlemenize yardım eder.")}</p></div>
                <div><label className="label" htmlFor="title">{t("Çalışma başlığı (geçici)")}</label><input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Boş bırakılırsa konudan oluşturulur")} /></div>
                <div><label className="label" htmlFor="kw">{t("Anahtar kelimeler (virgülle ayırın)")}</label><input id="kw" className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t("ilişki odaklı OKB, ebeveyn tutumları, beş faktör kişilik")} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="lang">{t("Yazım dili")}</label><select id="lang" className="input" value={language} onChange={(e) => setLanguage(e.target.value as "tr" | "en")}><option value="tr">{t("Türkçe")}</option><option value="en">{t("İngilizce")}</option></select></div>
                  <div><label className="label" htmlFor="style">{t("Atıf stili")}</label><select id="style" className="input" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLE_IDS.map((s) => <option key={s} value={s}>{t(STYLES[s].label)}</option>)}</select><p className="mt-1.5 text-xs text-ink-400">{t("Sonradan değiştirdiğinizde tüm atıflar otomatik dönüşür.")}</p></div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> {t("Geri")}</Button>
          {step < 2 ? <Button onClick={() => setStep((s) => s + 1)}>{t("Devam")} <ArrowRight className="h-4 w-4" /></Button> : <Button size="lg" onClick={create} loading={loading}>{t("Çalışma alanını oluştur")}</Button>}
        </div>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="card overflow-hidden">
          <div className="border-b border-ink-100 bg-gradient-to-br from-ink-900 to-ink-800 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-wider text-white/50">{t("Oluşturulacak yol haritası")}</p>
            <p className="mt-1 font-semibold">{t(wt.title)} · {t(LEVEL_LABELS[level])}</p>
          </div>
          <ol className="max-h-[60vh] space-y-0.5 overflow-y-auto p-3">
            <AnimatePresence initial={false}>
              {roadmap.map((r, i) => (
                <motion.li key={r.key} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-medium text-ink-600">{i + 1}</span>
                  <span className="text-ink-700">{t(r.title)}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          <p className="border-t border-ink-100 px-5 py-3 text-xs text-ink-400">{t("Aşamaları sonradan ekleyebilir, silebilir ve sıralayabilirsiniz. Üniversite kılavuzu yüklerseniz yeni bir düzen önerilir.")}</p>
        </div>
      </aside>
    </div>
  );
}
