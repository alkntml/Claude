"use client";
import { Check, Clock3, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

const EXAMPLES = [
  { purpose: "Üniversite öğrencilerinin sosyal medya kullanım süresi ile akademik erteleme ve uyku kalitesi arasındaki ilişkiyi incelemek", audience: "Lisans öğrencileri (18–25 yaş)", variables: "Sosyal medya kullanımı, akademik erteleme, uyku kalitesi" },
  { purpose: "Öğretmenlerin uzaktan eğitime yönelik tutumlarını ve teknoloji öz yeterliklerini belirlemek", audience: "Ortaokul ve lise öğretmenleri", variables: "Uzaktan eğitime tutum, teknoloji öz yeterliği, mesleki kıdem" },
  { purpose: "Hemşirelerde iş yükü, tükenmişlik ve işten ayrılma niyeti arasındaki ilişkiyi araştırmak", audience: "Hastanede çalışan hemşireler", variables: "Algılanan iş yükü, tükenmişlik, işten ayrılma niyeti" },
];
const STEPS = ["Araştırmanın amacı çözümleniyor", "Değişkenler için ölçek blokları kuruluyor", "Maddeler yazılıyor ve ters maddeler işaretleniyor", "Demografik sorular ve onam metni hazırlanıyor", "Değişken adları ve son kontrol"];

/** Yapay zekâ ile anket oluşturma kartı (D66): amaç + hedef kitle + değişkenler → hazır taslak */
export function SurveyAiCreate({ projects, projectId, setProjectId }: { projects: { id: string; title: string }[]; projectId: string; setProjectId: (v: string) => void }) {
  const { t, locale } = useT();
  const toast = useToast();
  const router = useRouter();
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [variables, setVariables] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [demographics, setDemographics] = useState(true);
  const [openEnded, setOpenEnded] = useState(false);
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4500);
    return () => clearInterval(id);
  }, [busy]);

  async function generate() {
    setBusy(true);
    try {
      const r = await api<{ survey: { id: string }; notes: string[] }>("/api/surveys/ai", { method: "POST", json: { purpose, audience, variables, length, demographics, openEnded, consent, lang: locale === "en" ? "en" : "tr", projectId: projectId || null } });
      try { sessionStorage.setItem(`survey-ai-notes:${r.survey.id}`, JSON.stringify(r.notes ?? [])); } catch { /* gizli pencere */ }
      toast({ tone: "success", title: t("Anket taslağınız hazır"), detail: t("Soruları inceleyip dilediğiniz gibi düzenleyebilirsiniz.") });
      router.push(`/anketler/${r.survey.id}`);
    } catch (e) {
      toast({ tone: "error", title: t("Anket oluşturulamadı"), detail: (e as Error).message });
      setBusy(false);
    }
  }

  if (busy) {
    return (
      <div className="py-6">
        <div className="mx-auto max-w-md space-y-3">
          <p className="flex items-center gap-2 font-semibold text-ink-900"><Sparkles className="h-4 w-4 animate-pulse text-brand-600" /> {t("Anketiniz hazırlanıyor…")}</p>
          {STEPS.map((s, i) => (
            <div key={s} className={cn("flex items-center gap-2.5 text-sm transition-opacity", i > step ? "opacity-35" : "opacity-100")}>
              {i < step ? <Check className="h-4 w-4 text-emerald-600" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-brand-600" /> : <span className="h-4 w-4 rounded-full border border-ink-200" />}
              <span className={i === step ? "font-medium text-ink-900" : "text-ink-600"}>{t(s)}</span>
            </div>
          ))}
          <p className="pt-2 text-xs text-ink-400">{t("Bu işlem genellikle 20–40 saniye sürer.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-500">{t("Örnekle dene:")}</span>
        {EXAMPLES.map((ex) => (
          <button key={ex.purpose} type="button" onClick={() => { setPurpose(t(ex.purpose)); setAudience(t(ex.audience)); setVariables(t(ex.variables)); }} className="rounded-full border border-ink-200 px-3 py-1 text-[12px] text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
            {t(ex.variables).split(",")[0]}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="label">{t("Araştırmanızın amacı nedir?")}</span>
        <textarea className="input min-h-[84px]" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={t("ör. Üniversite öğrencilerinin sosyal medya kullanımı ile akademik erteleme arasındaki ilişkiyi incelemek")} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="label">{t("Kimlere uygulanacak?")}</span><input className="input" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t("ör. Lisans öğrencileri, öğretmenler, hemşireler")} /></label>
        <label className="block"><span className="label">{t("Ölçmek istediğiniz değişkenler (isteğe bağlı)")}</span><input className="input" value={variables} onChange={(e) => setVariables(e.target.value)} placeholder={t("ör. Kaygı, öz yeterlik, akademik başarı")} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <span className="label">{t("Uzunluk")}</span>
          <div className="grid grid-cols-3 gap-2">
            {([["short", "Kısa", "~5 dk"], ["medium", "Orta", "~10 dk"], ["long", "Uzun", "~15 dk"]] as const).map(([id, l, d]) => (
              <button key={id} type="button" onClick={() => setLength(id)} className={cn("rounded-xl border px-3 py-2 text-left text-sm transition", length === id ? "border-brand-500 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-700 hover:border-ink-300")}>
                <span className="block font-medium">{t(l)}</span><span className="flex items-center gap-1 text-[11px] text-ink-500"><Clock3 className="h-3 w-3" />{d}</span>
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="label">{t("Bağlı çalışma (isteğe bağlı)")}</span>
          <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">{t("Şimdilik hiçbir çalışmaya bağlama")}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <span className="mt-1 block text-xs text-ink-400">{t("Seçerseniz çalışmanızın konusu, hipotezleri ve değişkenleri de dikkate alınır.")}</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-700">
        <label className="flex items-center gap-2"><input type="checkbox" checked={demographics} onChange={(e) => setDemographics(e.target.checked)} /> {t("Demografik sorular")}</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={openEnded} onChange={(e) => setOpenEnded(e.target.checked)} /> {t("Açık uçlu soru")}</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> {t("Onam metni taslağı")}</label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={generate} disabled={purpose.trim().length < 10}><Wand2 className="h-4 w-4" /> {t("Yapay zekâ ile anketi oluştur")}</Button>
        <span className="text-xs text-ink-400">{t("Maddeler özgün taslaktır; geçerlik-güvenirlik çalışması yapılmamıştır. Yerleşik bir ölçek kullanacaksanız izinli uyarlamasını ekleyin.")}</span>
      </div>
    </div>
  );
}
