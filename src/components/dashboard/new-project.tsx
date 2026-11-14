"use client";
import { useT } from "@/i18n/client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, FileUp, LayoutList, Loader2, PenLine, Plus, Sparkles, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { WORK_ICONS } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { STYLES, STYLE_IDS } from "@/lib/citations/styles";
import { api, handlePlanError } from "@/lib/client";
import { ResearchPrefsForm } from "@/components/research-prefs-form";
import { DEFAULT_RESEARCH_PREFS, promptStrength, type ResearchPrefs } from "@/lib/research-prefs";
import { buildRoadmap, CAPSTONE_KINDS, designById, designsFor, DOCUMENT_PURPOSES, omittedSections, type Design, EMPIRICAL, GRANT_PROGRAMS, type CapstoneKind, type GrantProgram, LEVEL_LABELS, METHODOLOGY_LABELS, REQUIREMENT_LABEL, WORK_TYPES, type AcademicLevel, type Methodology, type WorkType } from "@/lib/workflows";

/** D171: çalışma türüne göre sunulan araştırma yaklaşımları (uygun olmayanlar gösterilmez) */
function approachOptions(workType: WorkType, variant: CapstoneKind): Methodology[] {
  if (workType === "literature_review") return ["theoretical", "systematic_review", "meta_analysis"];
  if (workType === "capstone") return variant === "research" ? ["quantitative", "qualitative", "mixed", "theoretical"] : [];
  if (workType === "thesis") return ["quantitative", "qualitative", "mixed", "theoretical", "systematic_review", "meta_analysis"];
  // D172: dergi makalesi varsayılan olarak kaynaklara dayalıdır (kuramsal); veri toplanmışsa nicel/nitel/karma seçilir
  if (workType === "journal_article") return ["theoretical", "quantitative", "qualitative", "mixed", "systematic_review"];
  if (["research_article", "research_proposal"].includes(workType)) return ["quantitative", "qualitative", "mixed", "theoretical", "systematic_review"];
  return [];
}
const approachLabel = (workType: WorkType, m: Methodology) => (workType === "literature_review" && m === "theoretical" ? "Anlatı derleme" : workType === "journal_article" && m === "theoretical" ? "Kaynaklara dayalı (veri toplanmadı)" : METHODOLOGY_LABELS[m]);

interface Suggestion { approach: Methodology; design: string | null; why: string; limits: string; alternatives: string[] }

const STEPS = ["Çalışma türü", "Akademik profil", "Araştırma bilgileri", "Kaynak tercihleri", "Yapı"];
const LAST = STEPS.length - 1;

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
  const [language, setLanguage] = useState<"tr" | "en" | "de">(locale);
  const [style, setStyle] = useState(defaultStyle);
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState<GrantProgram>(() => GRANT_PROGRAMS.find((g) => g.id === params.get("program"))?.id ?? "tubitak_2209a");
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<ResearchPrefs>(DEFAULT_RESEARCH_PREFS);
  const [structure, setStructure] = useState<"standard" | "smart" | "free">("smart");
  // D171: desen, bitirme projesi türü, yöntem önerisi ve kullanıcı şablonu
  const [design, setDesign] = useState<string>("");
  const [variant, setVariant] = useState<CapstoneKind>("research");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [templates, setTemplates] = useState<{ id: string; name: string; work_type: string; count: number }[] | null>(null);
  const [templateId, setTemplateId] = useState<string>("");
  // D173: belge amacı, bilinen araştırma soruları, yönetimden eklenen desenler, oluşturmadan önce düzenlenen yol haritası
  const [documentPurpose, setDocumentPurpose] = useState<string>("");
  const [researchQuestions, setResearchQuestions] = useState("");
  const [extraDesigns, setExtraDesigns] = useState<Design[]>([]);
  const [edited, setEdited] = useState<{ key: string; title: string; requirement: string; critical?: boolean; why?: string }[] | null>(null);
  const [showOmitted, setShowOmitted] = useState(false);
  useEffect(() => { api<{ designs: Design[] }>("/api/designs").then((r) => setExtraDesigns(r.designs)).catch(() => {}); }, []);
  // D149: “Mevcut çalışmamı içe aktar”
  const [importing, setImporting] = useState<null | "upload" | "analyze">(null);
  const [importErr, setImportErr] = useState<string | null>(null);
  const strength = promptStrength(topic);

  const wt = WORK_TYPES.find((w) => w.id === workType)!;
  const options = approachOptions(workType, variant);
  // Dergi makalesine geçilince yaklaşım “kaynaklara dayalı” ile başlar (kullanıcı değiştirebilir)
  useEffect(() => { if (workType === "journal_article") setMethodology("theoretical"); }, [workType]);
  const effMethod: Methodology = options.length ? (options.includes(methodology) ? methodology : options[0]) : methodology;
  const designs = designsFor(effMethod, discipline, extraDesigns);
  const effDesign = designs.some((d) => d.id === design) ? design : "";
  const roadmap = useMemo(() => buildRoadmap({ workType, level, methodology: effMethod, program, design: effDesign || null, variant: workType === "capstone" ? variant : null }), [workType, level, effMethod, program, effDesign, variant]);
  const showMethod = options.length > 0;
  const purpose = documentPurpose || (workType === "thesis" ? "institute" : workType === "journal_article" || (workType === "research_article" && level !== "bachelor") ? "journal" : workType === "grant_proposal" ? "grant" : workType === "capstone" || workType === "research_article" ? "course" : "");
  const omitted = useMemo(() => omittedSections({ workType, level, methodology: effMethod, program, design: effDesign || null, variant: workType === "capstone" ? variant : null }), [workType, level, effMethod, program, effDesign, variant]);
  // Yol haritası değişirse (tür, yaklaşım, desen…) elle yapılan düzenleme sıfırlanır
  useEffect(() => setEdited(null), [roadmap]);
  const editable = structure !== "free" && !templateId;
  type Sec = { key: string; title: string; requirement: string; critical?: boolean; why?: string };
  const sections: Sec[] = edited ?? roadmap.map((r) => ({ key: r.key, title: t(r.title), requirement: r.requirement ?? "required", critical: r.critical, why: r.why }));
  const editSections = (fn: (list: Sec[]) => Sec[]) => setEdited(fn([...sections]));
  useEffect(() => {
    if (step !== LAST || templates) return;
    api<{ templates: { id: string; name: string; work_type: string; count: number }[] }>("/api/templates").then((r) => setTemplates(r.templates)).catch(() => setTemplates([]));
  }, [step, templates]);

  async function suggest() {
    setSuggesting(true);
    try {
      const r = await api<{ suggestion: Suggestion }>("/api/projects/suggest-approach", { method: "POST", json: { workType, level, discipline, topic } });
      setSuggestion(r.suggestion);
    } catch (e) {
      toast({ tone: "error", title: t("Öneri alınamadı"), detail: t((e as Error).message) });
    } finally { setSuggesting(false); }
  }

  async function create() {
    setLoading(true);
    try {
      const { project } = await api<{ project: { id: string } }>("/api/projects", {
        method: "POST",
        json: { title: title.trim() || topic.slice(0, 120) || t(wt.title), workType, level, methodology: effMethod, discipline, ...(effDesign ? { design: effDesign } : {}), ...(workType === "capstone" ? { variant } : {}), ...(templateId ? { templateId } : {}), ...(purpose ? { documentPurpose: purpose } : {}), ...(researchQuestions.trim() ? { researchQuestions: researchQuestions.trim() } : {}), ...(edited && editable ? { sections: edited.map((x) => ({ key: x.key, title: x.title, requirement: x.requirement as "required" | "conditional" | "optional" })) } : {}), language, citationStyle: style, topic, keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean), university: university || undefined, research: prefs, structure, ...(workType === "grant_proposal" ? { program } : {}) },
      });
      router.push(`/proje/${project.id}`);
    } catch (e) {
      toast({ tone: "error", title: t("Çalışma oluşturulamadı"), detail: t((e as Error).message) });
      setLoading(false);
    }
  }

  async function importWork(file: File) {
    setImportErr(null);
    setImporting("upload");
    const timer = setTimeout(() => setImporting("analyze"), 1500);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/projects/import", { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { handlePlanError(res.status, j); throw new Error(j.error ?? t("İçe aktarılamadı")); }
      toast({ tone: "success", title: t("Çalışmanız içe aktarıldı"), detail: t("{s} bölüm · {r} kaynak · {l} atıf bağlandı", { s: j.report.sections, r: j.report.refsAdded, l: j.report.linked }) });
      router.push(`/proje/${j.project.id}`);
    } catch (e) {
      setImportErr(t((e as Error).message));
      setImporting(null);
    } finally { clearTimeout(timer); }
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
                <label className={cn("mt-6 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed p-4 transition", importing ? "border-brand-300 bg-brand-50/60" : "border-ink-300 hover:border-brand-300 hover:bg-brand-50/40")}>
                  <input type="file" accept=".docx,.pdf,.txt,.md" className="hidden" disabled={!!importing} onChange={(e) => { const f = e.target.files?.[0]; if (f) importWork(f); e.target.value = ""; }} />
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">{importing ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileUp className="h-5 w-5" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink-900">{t("Mevcut çalışmamı içe aktar")}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-500">{importing === "upload" ? t("Dosya yükleniyor…") : importing === "analyze" ? t("Yapay zekâ çalışmanızı analiz ediyor; bölümler, kaynaklar ve atıflar hazırlanıyor… Büyük belgelerde bir dakika sürebilir.") : t("Word (.docx), PDF veya metin dosyası. Yapay zekâ türünü ve konusunu çıkarır, bölümlere ayırır, kaynakçayı ekler, atıfları bağlar ve çalışma ekranını açar. Metniniz yeniden yazılmaz.")}</span>
                  </span>
                </label>
                {importErr && <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[13px] text-rose-700">{importErr}</p>}
                <div className="mt-6 flex items-center gap-3 text-[12px] text-ink-400"><span className="h-px flex-1 bg-ink-100" />{t("veya yeni bir çalışma başlatın")}<span className="h-px flex-1 bg-ink-100" /></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                {workType === "capstone" && (
                  <div>
                    <span className="label">{t("Bitirme projesinin türü")}</span>
                    <div className="flex flex-wrap gap-2">
                      {CAPSTONE_KINDS.map((k) => <button key={k.id} onClick={() => setVariant(k.id)} className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition", variant === k.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-700 hover:border-ink-300")}>{t(k.label)}</button>)}
                    </div>
                    <p className="mt-2 text-xs text-ink-400">{t("Uygulama projelerine sırf akademik görünmesi için hipotez, örneklem veya istatistik başlıkları eklenmez.")}</p>
                  </div>
                )}
                {showMethod && (
                  <div>
                    <span className="label">{t("Araştırma yaklaşımı")}</span>
                    <div className="flex flex-wrap gap-2">
                      {options.map((m) => <button key={m} onClick={() => { setMethodology(m); setSuggestion(null); }} className={cn("rounded-xl border px-4 py-2 text-sm font-medium transition", effMethod === m ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-700 hover:border-ink-300")}>{t(approachLabel(workType, m))}</button>)}
                    </div>
                    <p className="mt-2 text-xs text-ink-400">{t("Yaklaşım; bölümleri, yöntem ve bulgu başlıklarını ve kalite ölçütlerini değiştirir (ör. nitel çalışmada “Çalışma grubu” ve “İnandırıcılık”, karma yöntemde “Entegrasyon”).")}</p>
                    {(EMPIRICAL as string[]).includes(effMethod) && designs.length > 0 && (
                      <div className="mt-4">
                        <label className="label" htmlFor="design">{t("Araştırma deseni (isteğe bağlı)")}</label>
                        <select id="design" className="input" value={effDesign} onChange={(e) => setDesign(e.target.value)}>
                          <option value="">{t("Henüz belirlemedim")}</option>
                          {designs.map((d) => <option key={d.id} value={d.id}>{t(d.label)}</option>)}
                        </select>
                        <p className="mt-1.5 text-xs text-ink-400">{t("Desen, yöntem ve bulgular bölümündeki alt başlıkları ve raporlama standardını belirler.")}</p>
                      </div>
                    )}
                    <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50/60 p-4">
                      <p className="text-[14px] font-medium text-ink-900">{t("Yönteminizi henüz bilmiyor musunuz?")}</p>
                      <p className="mt-1 text-[13px] text-ink-500">{t("Konunuzu, amacınızı ve elinizdeki veri olanaklarını birkaç cümleyle yazın; gerekçeli bir yaklaşım ve desen önerisi alın. Nihai karar sizin ve danışmanınızındır.")}</p>
                      <textarea className="input mt-2 min-h-[80px]" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t("ör. Öğretmenlerin uzaktan eğitim deneyimlerini ve bu deneyimin mesleki tükenmişlikle ilişkisini anlamak istiyorum; okullara erişimim var.")} />
                      <Button className="mt-2" size="sm" variant="secondary" onClick={suggest} loading={suggesting} disabled={topic.trim().length < 10}><Sparkles className="h-4 w-4" /> {t("Yöntem önerisi al")}</Button>
                      {suggestion && (
                        <div className="mt-3 space-y-1.5 rounded-lg bg-white p-3 text-[13px] text-ink-700">
                          <p><b>{t("Önerilen yaklaşım:")}</b> {t(approachLabel(workType, suggestion.approach))}{suggestion.design ? ` · ${t(designById(suggestion.design)?.label ?? "")}` : ""}</p>
                          <p><b>{t("Gerekçe:")}</b> {suggestion.why}</p>
                          {suggestion.limits && <p><b>{t("Sınırlılıklar:")}</b> {suggestion.limits}</p>}
                          {suggestion.alternatives.length > 0 && <p><b>{t("Alternatifler:")}</b> {suggestion.alternatives.join(" · ")}</p>}
                          {options.includes(suggestion.approach) && <Button size="sm" onClick={() => { setMethodology(suggestion.approach); setDesign(suggestion.design ?? ""); }}><Check className="h-4 w-4" /> {t("Öneriyi uygula")}</Button>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="disc">{t("Bilim dalı / disiplin")}</label><input id="disc" className="input" placeholder={t("ör. Klinik Psikoloji")} value={discipline} onChange={(e) => setDiscipline(e.target.value)} /></div>
                  <div><label className="label" htmlFor="uni">{t("Üniversite / hedef dergi (isteğe bağlı)")}</label><input id="uni" className="input" placeholder={t("ör. Hacettepe Üniversitesi")} value={university} onChange={(e) => setUniversity(e.target.value)} /></div>
                </div>
                <div>
                  <label className="label" htmlFor="purpose">{t("Belge amacı")}</label>
                  <select id="purpose" className="input" value={purpose} onChange={(e) => setDocumentPurpose(e.target.value)}>
                    <option value="">{t("Belirtmek istemiyorum")}</option>
                    {DOCUMENT_PURPOSES.map((d) => <option key={d.id} value={d.id}>{t(d.label)}</option>)}
                  </select>
                  <p className="mt-1.5 text-xs text-ink-400">{t("Biçim ve teslim gerekliliklerini belirler; kılavuzunuz (enstitü, dergi, çağrı) her zaman önceliklidir.")}</p>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{t("Araştırmanızı tanımlayın")}</h1>
                <div><label className="label" htmlFor="topic">{t("Araştırma konusu")}</label><textarea id="topic" className="input min-h-[110px]" placeholder={t("ör. Kişilik özellikleri, ebeveyn tutumları ve ilişki odaklı obsesif kompulsif belirtiler arasındaki ilişkinin incelenmesi")} value={topic} onChange={(e) => setTopic(e.target.value)} />
                  {strength.level === "empty" ? <p className="mt-1.5 text-xs text-ink-400">{t("Konu henüz net değilse boş bırakabilirsiniz. İlk aşamadaki asistan konuyu belirlemenize yardım eder.")}</p> : (
                    <div className="mt-2">
                      <div className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className={cn("h-1 flex-1 rounded-full", i < (strength.level === "strong" ? 3 : strength.level === "medium" ? 2 : 1) ? (strength.level === "strong" ? "bg-emerald-500" : strength.level === "medium" ? "bg-amber-400" : "bg-rose-400") : "bg-ink-100")} />)}</div>
                      <p className="mt-1.5 text-[13px] text-ink-500"><b className="text-ink-800">{strength.level === "strong" ? t("Güçlü konu tanımı") : strength.level === "medium" ? t("Orta konu tanımı") : t("Zayıf konu tanımı")}:</b> {strength.level === "strong" ? t("Yapay zekâ bölümleri bu bağlamla daha isabetli yazar.") : t("Daha isabetli üretim için şunları ekleyin: {x}", { x: strength.missing.map((m) => t({ length: "biraz daha ayrıntı", relation: "incelenen ilişki veya etki", context: "örneklem/bağlam (kimlerde, nerede)", method: "yöntem (ör. anket, görüşme)" }[m])).join(", ") })}</p>
                    </div>
                  )}
                </div>
                <div><label className="label" htmlFor="title">{t("Çalışma başlığı (geçici)")}</label><input id="title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Boş bırakılırsa konudan oluşturulur")} /></div>
                <div><label className="label" htmlFor="rq">{t("Araştırma sorularınız (varsa, isteğe bağlı)")}</label><textarea id="rq" className="input min-h-[70px]" maxLength={2000} value={researchQuestions} onChange={(e) => setResearchQuestions(e.target.value)} placeholder={t("Her satıra bir soru yazın. Henüz yoksa boş bırakın; asistan birlikte oluşturur.")} /></div>
                <div><label className="label" htmlFor="kw">{t("Anahtar kelimeler (virgülle ayırın)")}</label><input id="kw" className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t("ilişki odaklı OKB, ebeveyn tutumları, beş faktör kişilik")} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="label" htmlFor="lang">{t("Yazım dili")}</label><select id="lang" className="input" value={language} onChange={(e) => setLanguage(e.target.value as "tr" | "en" | "de")}><option value="tr">{t("Türkçe")}</option><option value="en">{t("İngilizce")}</option><option value="de">{t("Almanca")}</option></select></div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-5">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{t("Atıf ve kaynak tercihlerinizi ayarlayalım")}</h1>
                <div className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                    <p className="text-[14px] font-medium text-ink-900">{t("Atıf stili")}</p>
                    <select id="style" className="input !w-auto min-w-[220px]" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLE_IDS.map((s) => <option key={s} value={s}>{t(STYLES[s].label)}</option>)}</select>
                  </div>
                  <div className="border-t border-ink-100"><ResearchPrefsForm value={prefs} onChange={setPrefs} /></div>
                </div>
                <p className="text-xs text-ink-400">{t("Bu tercihleri sonradan Proje ayarları’ndan değiştirebilirsiniz. Kendi kaynaklarınızı (PDF, Zotero, Mendeley, .bib/.ris) çalışma ekranındaki “İçe aktar” düğmesiyle istediğiniz an ekleyebilirsiniz.")}</p>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-5">
                <h1 className="font-serif text-3xl font-medium tracking-tight">{t("Çalışmanızı nasıl yapılandırmak istersiniz?")}</h1>
                <div className="space-y-2.5">
                  {([
                    { id: "standard", icon: LayoutList, title: "Standart bölümler", desc: "Seçtiğiniz türün akademik bölüm düzeni (ör. Giriş, Yöntem, Bulgular, Tartışma)." },
                    { id: "smart", icon: Sparkles, title: "Akıllı bölüm planı", desc: "Yapay zekâ konunuza göre problem, amaç, yöntem ve bölüm planını hedef uzunluklarıyla önerir; onayladığınız plana göre yazılır." },
                    { id: "free", icon: PenLine, title: "Serbest", desc: "Tek bir metin bölümüyle başlayın; alt başlıkları kendiniz ekleyin." },
                  ] as const).map((o) => (
                    <button key={o.id} type="button" onClick={() => { setStructure(o.id); setTemplateId(""); }} className={cn("flex w-full items-start gap-3 rounded-xl border p-4 text-left transition", structure === o.id && !templateId ? "border-brand-500 ring-2 ring-brand-100" : "border-ink-200 hover:border-ink-300 hover:bg-ink-50")}>
                      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", structure === o.id && !templateId ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-600")}><o.icon className="h-5 w-5" /></span>
                      <span><span className="block font-semibold text-ink-900">{t(o.title)}</span><span className="mt-0.5 block text-[13px] text-ink-500">{t(o.desc)}</span></span>
                    </button>
                  ))}
                  {templates && templates.length > 0 && (
                    <div className={cn("rounded-xl border p-4", templateId ? "border-brand-500 ring-2 ring-brand-100" : "border-ink-200")}>
                      <p className="font-semibold text-ink-900">{t("Kayıtlı şablonum")}</p>
                      <p className="mt-0.5 text-[13px] text-ink-500">{t("Daha önce kaydettiğiniz bölüm yapısıyla başlayın (başlıklar, sıra, zorunluluk ve kapsam; metin kopyalanmaz).")}</p>
                      <select className="input mt-2" value={templateId} onChange={(e) => { setTemplateId(e.target.value); if (e.target.value) setStructure("standard"); }}>
                        <option value="">{t("Şablon kullanma")}</option>
                        {templates.map((x) => <option key={x.id} value={x.id}>{x.name} · {t("{n} bölüm", { n: x.count })}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                {editable && (
                  <div className="rounded-xl border border-ink-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink-900">{t("Yol haritasını inceleyin ve düzenleyin")}</p>
                      {edited && <Button size="sm" variant="ghost" onClick={() => setEdited(null)}>{t("Varsayılana dön")}</Button>}
                    </div>
                    <p className="mt-0.5 text-[13px] text-ink-500">{t("Başlıkları yeniden adlandırabilir, sıralayabilir, kaldırabilir veya yeni bölüm ekleyebilirsiniz. Önerilen yapı bir başlangıçtır; karar sizindir.")}</p>
                    <ul className="mt-3 space-y-1">
                      {sections.map((x, i) => (
                        <li key={x.key} className="flex items-center gap-1.5">
                          <span className="w-5 shrink-0 text-right text-[11px] text-ink-400">{i + 1}</span>
                          <input className="input !py-1.5 text-[13px]" value={x.title} maxLength={200} aria-label={t("Bölüm adı")} onChange={(e) => editSections((l) => l.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} />
                          <button type="button" disabled={i === 0} onClick={() => editSections((l) => { [l[i - 1], l[i]] = [l[i], l[i - 1]]; return l; })} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30" aria-label={t("Yukarı taşı")}><ArrowUp className="h-3.5 w-3.5" /></button>
                          <button type="button" disabled={i === sections.length - 1} onClick={() => editSections((l) => { [l[i + 1], l[i]] = [l[i], l[i + 1]]; return l; })} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 disabled:opacity-30" aria-label={t("Aşağı taşı")}><ArrowDown className="h-3.5 w-3.5" /></button>
                          <button type="button" disabled={x.key === "references"} onClick={() => { if (x.critical && !confirm(`${t("“{title}” bu çalışma türü için kritik bir bölümdür.", { title: x.title })} ${x.why ? t(x.why) : ""} ${t("Silerseniz çalışmanın akademik bütünlüğü zarar görebilir ve kalite kontrolünde eksik olarak görünebilir.")}`)) return; editSections((l) => l.filter((_, j) => j !== i)); }} className="rounded-md p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30" aria-label={t("Bölümü kaldır")}><X className="h-3.5 w-3.5" /></button>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-2" size="sm" variant="secondary" onClick={() => editSections((l) => { const ri = l.findIndex((y) => y.key === "references"); const n = { key: `custom_${Date.now().toString(36)}`, title: t("Yeni bölüm"), requirement: "optional" }; if (ri >= 0) l.splice(ri, 0, n); else l.push(n); return l; })}><Plus className="h-4 w-4" /> {t("Bölüm ekle")}</Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> {t("Geri")}</Button>
          {step < LAST ? <Button onClick={() => setStep((s) => s + 1)}>{t("Devam")} <ArrowRight className="h-4 w-4" /></Button> : <Button size="lg" onClick={create} loading={loading}>{t("Yazmaya başla")}</Button>}
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
              {(structure === "free" ? [{ key: "custom_text", title: "Metin" }, ...roadmap.filter((x) => x.key === "references")] : edited && editable ? edited : roadmap).map((r, i) => (
                <motion.li key={r.key} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[11px] font-medium text-ink-600">{i + 1}</span>
                  <span className="min-w-0 flex-1 text-ink-700" title={"why" in r && r.why ? t(r.why) : undefined}>{t(r.title)}</span>
                  {"requirement" in r && r.requirement && r.requirement !== "required" && <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] font-medium text-ink-500">{t(REQUIREMENT_LABEL[r.requirement as keyof typeof REQUIREMENT_LABEL])}</span>}
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {structure !== "free" && !templateId && omitted.length > 0 && (
            <div className="border-t border-ink-100 px-5 py-3 text-xs text-ink-500">
              <button type="button" onClick={() => setShowOmitted((v) => !v)} className="font-medium text-brand-700 hover:underline">{showOmitted ? t("Gösterilmeyen bölümleri gizle") : t("Neden bazı bölümler yok? ({n})", { n: omitted.length })}</button>
              {showOmitted && <ul className="mt-2 space-y-1.5">{omitted.map((o) => <li key={o.key}><b className="font-medium text-ink-700">{t(o.title)}:</b> {t(o.why)}</li>)}</ul>}
            </div>
          )}
          <p className="border-t border-ink-100 px-5 py-3 text-xs text-ink-400">{templateId ? t("Kayıtlı şablonunuzun bölüm yapısı kullanılacak.") : t("Aşamaları sonradan ekleyebilir, silebilir ve sıralayabilirsiniz. Üniversite kılavuzu yüklerseniz yeni bir düzen önerilir.")}</p>
        </div>
      </aside>
    </div>
  );
}
