"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { effectiveFormat, FONT_CHOICES, FORMAT_PRESETS, resolveLayout, workTypeLabel, type DocFormat } from "@/lib/export/format";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Word/PDF biçim şablonu ve kapak bilgileri */
export function FormatModal({ open, onClose, project, patch }: { open: boolean; onClose: () => void; project: any; patch: (u: Record<string, unknown>) => Promise<any> }) {
  const { t } = useT();
  const toast = useToast();
  // D178: üniversite adı proje oluştururken yazıldıysa kapağa önceden doldurulur
  const [f, setF] = useState<DocFormat>(() => { const r = effectiveFormat(project); return { ...r, cover: { ...r.cover, university: r.cover.university || project.context?.university || "" } }; });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof DocFormat>(k: K, v: DocFormat[K]) => setF((x) => ({ ...x, [k]: v }));
  const setM = (k: keyof DocFormat["margins"], v: number) => setF((x) => ({ ...x, margins: { ...x.margins, [k]: v } }));
  const setC = (k: keyof DocFormat["cover"], v: string | boolean) => setF((x) => ({ ...x, cover: { ...x.cover, [k]: v } }));
  const applyPreset = (id: string) => setF((x) => ({ ...x, ...FORMAT_PRESETS[id].format, preset: id }));

  async function save() {
    setSaving(true);
    const ok = await patch({ context: { format: { ...f, v: 2 } } });
    setSaving(false);
    if (ok) { toast({ tone: "success", title: t("Biçim ayarları kaydedildi"), detail: t("Word ve PDF çıktısında kullanılacak.") }); onClose(); }
  }

  const num = (label: string, value: number, onChange: (v: number) => void, step = 0.1, suffix = "") => (
    <label className="block"><span className="label">{label}</span>
      <span className="relative block"><input type="number" step={step} className="input pr-10" value={value} onChange={(e) => onChange(Number(e.target.value))} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400">{suffix}</span></span>
    </label>
  );
  const text = (label: string, key: keyof DocFormat["cover"], ph = "") => (
    <label className="block"><span className="label">{label}</span><input className="input" placeholder={ph} value={String(f.cover[key] ?? "")} onChange={(e) => setC(key, e.target.value)} /></label>
  );

  return (
    <Modal open={open} onClose={onClose} title={t("Word / PDF biçimi ve kapak")} wide footer={<><Button variant="ghost" onClick={onClose}>{t("Vazgeç")}</Button><Button onClick={save} loading={saving}>{t("Kaydet")}</Button></>}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block"><span className="label">{t("Hazır şablon")}</span>
            <select className="input" value={f.preset} onChange={(e) => applyPreset(e.target.value)}>{Object.entries(FORMAT_PRESETS).map(([id, p]) => <option key={id} value={id}>{t(p.label)}</option>)}</select>
          </label>
          <p className="text-xs text-ink-400">{t("Varsayılan şablon çalışma türünüze ve yazım stilinize göre seçilir (tez ve bitirme projesinde Türk üniversitesi tez düzeni; diğerlerinde APA, MLA, Chicago, Harvard, IEEE, Vancouver/AMA veya ISNAD öğrenci biçimi). Yazım kılavuzunuzu yüklerseniz kılavuzdaki kurallar kendiliğinden uygulanır.")}</p>
          {project.context?.guide?.fields?.length > 0 && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-800">{t("Yazım kılavuzunuzdan ({name}) alınan kurallar:", { name: project.context.guide.fileName ?? "" })} {project.context.guide.fields.map((x: string) => t(x)).join(", ")}</p>}
          <div className="grid grid-cols-2 gap-2">
            <label className="col-span-2 block"><span className="label">{t("Yazı tipi")}</span><select className="input" value={f.fontFamily} onChange={(e) => set("fontFamily", e.target.value)}>{[...new Set([f.fontFamily, ...FONT_CHOICES])].map((x) => <option key={x}>{x}</option>)}</select></label>
            {num(t("Punto"), f.fontSizePt, (v) => set("fontSizePt", v), 0.5, "pt")}
            {num(t("Satır aralığı"), f.lineSpacing, (v) => set("lineSpacing", v), 0.05, "×")}
            {num(t("Üst kenar"), f.margins.top, (v) => setM("top", v), 0.1, "cm")}
            {num(t("Alt kenar"), f.margins.bottom, (v) => setM("bottom", v), 0.1, "cm")}
            {num(t("Sol kenar (cilt payı)"), f.margins.left, (v) => setM("left", v), 0.1, "cm")}
            {num(t("Sağ kenar"), f.margins.right, (v) => setM("right", v), 0.1, "cm")}
            {num(t("Paragraf girintisi"), f.firstLineIndentCm, (v) => set("firstLineIndentCm", v), 0.05, "cm")}
            {num(t("Paragraf sonrası boşluk"), f.paragraphAfterPt, (v) => set("paragraphAfterPt", v), 1, "pt")}
            <label className="col-span-2 block"><span className="label">{t("Sayfa numarası")}</span><select className="input" value={f.pageNumber} onChange={(e) => set("pageNumber", e.target.value as DocFormat["pageNumber"])}><option value="bottom-center">{t("Alt orta")}</option><option value="bottom-right">{t("Alt sağ")}</option><option value="top-right">{t("Üst sağ")}</option></select></label>
          </div>
          <div className="space-y-1.5 text-[13px] text-ink-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.justify} onChange={(e) => set("justify", e.target.checked)} /> {t("İki yana yasla")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.chapterOnNewPage} onChange={(e) => set("chapterOnNewPage", e.target.checked)} /> {t("Her bölüm yeni sayfada başlasın")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.chapterTitleUppercase} onChange={(e) => set("chapterTitleUppercase", e.target.checked)} /> {t("Bölüm başlıkları BÜYÜK HARF")}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.chapterTitleCenter} onChange={(e) => set("chapterTitleCenter", e.target.checked)} /> {t("Bölüm başlıkları ortalı")}</label>
          </div>
        </div>
        <div className="space-y-3">
          <label className="block"><span className="label">{t("Belge düzeni")}</span>
            <select className="input" value={resolveLayout(f, { workType: project.work_type, documentPurpose: project.context?.documentPurpose })} onChange={(e) => set("layout", e.target.value as DocFormat["layout"])}>
              <option value="submission">{t("Üniversite / ders teslimi: kapak, içindekiler, tablo ve şekil listeleri")}</option>
              <option value="journal">{t("Dergi gönderimi: kapaksız, başlık ilk sayfada")}</option>
            </select>
          </label>
          <p className="font-medium text-ink-900">{t("Kapak sayfası")}</p>
          <label className="flex items-center gap-2 text-[13px] text-ink-700"><input type="checkbox" checked={f.cover.logoSpace !== false} onChange={(e) => setC("logoSpace", e.target.checked)} /> {t("Üniversite logosu için yer bırak (3 × 3 cm)")}</label>
          <label className="flex items-center gap-2 text-[13px] text-ink-700"><input type="checkbox" checked={!!f.cover.showTC} onChange={(e) => setC("showTC", e.target.checked)} /> {t("En üstte “T.C.” yazsın")}</label>
          {text(t("Üniversite"), "university", t("ör. Hacettepe Üniversitesi"))}
          {text(t("Fakülte"), "faculty", t("ör. İletişim Fakültesi"))}
          {text(t("Enstitü (lisansüstü)"), "institute", t("ör. Sosyal Bilimler Enstitüsü"))}
          {text(t("Anabilim dalı / bölüm"), "department", t("ör. Psikoloji Anabilim Dalı"))}
          {text(t("Program"), "programme", t("ör. Klinik Psikoloji Programı"))}
          {text(t("Çalışma türü"), "thesisType", t(workTypeLabel(project.work_type, project.academic_level, "tr")) || t("ör. Yüksek Lisans Tezi"))}
          {text(t("Danışman"), "advisor", t("ör. Prof. Dr. Ad Soyad"))}
          <div className="grid grid-cols-3 gap-2">{text(t("Şehir"), "city", t("ör. Ankara"))}{text(t("Ay"), "month", new Date().toLocaleDateString("tr-TR", { month: "long" }))}{text(t("Yıl"), "year", new Date().getFullYear().toString())}</div>
          <p className="text-xs text-ink-400">{t("Boş bırakılan üniversite, fakülte, bölüm ve danışman alanları kapakta köşeli parantezli doldurma alanı olarak görünür; ay ve yıl boşsa indirme tarihinden alınır.")}</p>
        </div>
      </div>
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
