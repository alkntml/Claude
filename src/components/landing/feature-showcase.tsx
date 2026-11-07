"use client";
/**
 * Ana sayfa “Özellikler” vitrini (D135): altı alan (yazım, literatür, atıf doğruluğu, sistematik derleme, veri analizi,
 * kalite ve teslim), her alan için özellik listesi + temsilî arayüz görseli, paket rozetleri (FEATURE_MIN_PLAN ile
 * tutarlı) ve altyapı bölümü (mimari şema + güvenlik/güvenilirlik). Tüm içerik DOM’da kalır (arama motorları için);
 * sekme yalnızca görünürlüğü değiştirir. Sayı ve iddialar ürünün gerçek davranışına dayanır.
 */
import { motion } from "framer-motion";
import {
  Activity, BarChart3, BookCheck, Bot, CheckCircle2, ClipboardList, Cloud, Database, FileCheck2, FileDown, FileSearch2, FileText, GitFork,
  Globe2, Languages, Layers, Library, Lock, MessagesSquare, Network, PenLine, Quote, ScanSearch, Server, ShieldCheck, Sparkles, Table2, TestTube2,
  Users, Workflow,
} from "lucide-react";
import { useState } from "react";
import Link from "@/components/l-link";
import { cn } from "@/components/ui/cn";
import { FadeIn } from "@/components/ui/fade-in";
import { useT } from "@/i18n/client";
import { FEATURE_MIN_PLAN, type FeatureId } from "@/lib/features";

type Icon = typeof Activity;
type Plan = "basic" | "pro" | null;
interface Feature { icon: Icon; title: string; text: string; plan?: Plan | FeatureId }
interface Category { id: string; icon: Icon; title: string; lead: string; features: Feature[]; Visual: () => React.ReactNode }

const planOf = (p?: Plan | FeatureId): Plan => (!p ? null : p === "basic" || p === "pro" ? p : (FEATURE_MIN_PLAN[p] as Plan));

function PlanBadge({ plan }: { plan: Plan }) {
  const { t } = useT();
  if (!plan) return null;
  return <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold", plan === "pro" ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-600")}>{plan === "pro" ? t("Pro ve üstü") : t("Basic ve üstü")}</span>;
}

/* ---------------- Temsilî görseller ---------------- */
function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  const { t } = useT();
  return (
    <div className="relative h-full rounded-3xl border border-ink-100 bg-white p-5 shadow-[0_30px_60px_-30px_rgb(21_24_41/0.35)]">
      <div className="mb-4 flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /><span className="ml-2 text-[11px] font-medium text-ink-400">{label}</span></div>
      {children}
      <p className="absolute bottom-3 right-4 text-[10px] text-ink-300">{t("Temsilî görsel")}</p>
    </div>
  );
}

function WritingVisual() {
  const { t } = useT();
  const stages = ["Kurgu", "Giriş", "Kuramsal çerçeve", "Yöntem", "Bulgular", "Tartışma"];
  return (
    <Frame label={t("Çalışma alanı")}>
      <div className="flex gap-1">{stages.map((s, i) => <span key={s} className={cn("flex-1 truncate rounded-lg px-1.5 py-1.5 text-center text-[10.5px] font-semibold", i < 2 ? "bg-emerald-50 text-emerald-700" : i === 2 ? "bg-brand-600 text-white" : "bg-ink-50 text-ink-400")}>{t(s)}</span>)}</div>
      <div className="mt-4 rounded-2xl border border-ink-100 p-4">
        <p className="text-[11px] font-semibold text-ink-400">2.1 {t("Kuramsal çerçeve")}</p>
        <p className="mt-2 font-serif text-[14px] leading-7 text-ink-800">{t("Öz düzenleme, uzaktan eğitimde başarının güçlü bir yordayıcısıdır")} <span className="rounded-md border border-brand-100 bg-brand-50 px-1.5 font-sans text-[11px] text-brand-700">(Kaya, 2021, s. 211)</span>. {t("Geri bildirimin zamanlaması bu ilişkide")}<span className="text-ink-300"> {t("aracı rol üstlenir…")}</span><span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-brand-500" /></p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        {[[Bot, "Yazım asistanı"], [Users, "2 ortak yazar çevrim içi"], [FileText, "Sürüm geçmişi"]].map(([I, l]) => { const C = I as Icon; return <span key={l as string} className="flex items-center gap-1.5 rounded-xl bg-ink-50 px-2 py-2 text-ink-600"><C className="h-3.5 w-3.5 text-brand-600" />{t(l as string)}</span>; })}
      </div>
    </Frame>
  );
}

function SourcesVisual() {
  const { t } = useT();
  const dbs = ["OpenAlex", "Crossref", "PubMed", "DergiPark", "arXiv", "ERIC", "DOAJ", "HAL", "PLOS", "Zenodo", "DataCite", "DBLP"];
  return (
    <Frame label={t("Literatür araştırması")}>
      <div className="flex flex-wrap gap-1.5">{dbs.map((d) => <span key={d} className="rounded-lg border border-brand-100 bg-brand-50/70 px-2 py-1 text-[10.5px] font-medium text-brand-700">{d}</span>)}<span className="rounded-lg bg-ink-100 px-2 py-1 text-[10.5px] text-ink-500">+4</span></div>
      <div className="my-3 flex items-center gap-2 text-[11px] text-ink-500"><span className="h-px flex-1 bg-ink-100" />{t("tekrarlar ayıklanır, kimlikler doğrulanır")}<span className="h-px flex-1 bg-ink-100" /></div>
      <ul className="space-y-2">
        {[["Kaya, E. (2021). Uzaktan eğitimde öz düzenleme…", "Tam metin okundu", "bg-emerald-50 text-emerald-700"], ["Lee, S. vd. (2020). Feedback timing and self-regulation", "Özet okundu", "bg-amber-50 text-amber-800"], ["Zimmerman, B. (2000). Self-regulated learning", "Yalnızca künye", "bg-ink-100 text-ink-600"]].map(([a, b, c]) => (
          <li key={a} className="flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2"><BookCheck className="h-4 w-4 shrink-0 text-ink-400" /><span className="min-w-0 flex-1 truncate font-serif text-[12.5px] text-ink-800">{a}</span><span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold", c)}>{t(b)}</span></li>
        ))}
      </ul>
      <div className="mt-3 rounded-xl bg-ink-900 px-3 py-2.5 text-[11.5px] text-white/90"><MessagesSquare className="mr-1.5 inline h-3.5 w-3.5 text-sky-300" />{t("Kaynağa sor: “Örneklem nasıl seçilmiş?”")} <span className="text-white/50">→ {t("cevap s. 205’ten")}</span></div>
    </Frame>
  );
}

function CitationVisual() {
  const { t } = useT();
  const s = [["Öz düzenleme, başarının güçlü bir yordayıcısıdır.", "decoration-emerald-400", "Destekliyor"], ["Bu etki tüm öğrenciler için geçerlidir.", "decoration-amber-400", "Kısmen"], ["Canlı dersler başarıyı iki katına çıkarır.", "decoration-rose-500", "Kaynakla çelişiyor"]];
  return (
    <Frame label={t("İddia denetimi")}>
      <div className="space-y-2.5">
        {s.map(([x, c, l]) => <p key={x} className="flex items-baseline justify-between gap-3 font-serif text-[13.5px] text-ink-800"><span className={cn("underline decoration-[3px] underline-offset-[6px]", c)}>{t(x)}</span><span className="shrink-0 font-sans text-[10.5px] font-semibold text-ink-500">{t(l)}</span></p>)}
      </div>
      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-3 text-[12px]">
        <p className="font-semibold text-rose-800">{t("Kaynak bunun tersini söylüyor")} · Kaya (2021), s. 214</p>
        <p className="mt-1 font-serif italic text-ink-700">“{t("İki grubun başarı puanları arasında anlamlı bir fark bulunmamıştır.")}”</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">{["APA 7", "ISNAD 2", "MLA 9", "Chicago", "IEEE", "Vancouver", "Harvard", "+3"].map((x) => <span key={x} className="rounded-lg bg-ink-50 px-2 py-1 text-[10.5px] font-medium text-ink-600">{x}</span>)}</div>
    </Frame>
  );
}

function ReviewVisual() {
  const { t } = useT();
  const rows: [string, string, string?][] = [["Belirlenen kayıtlar", "412", "Yinelenen 94"], ["Taranan", "318", "Hariç 254"], ["Tam metin değerlendirilen", "64", "Uygun değil 43"], ["Dahil edilen", "21"]];
  return (
    <Frame label="PRISMA 2020">
      <div className="space-y-1.5">
        {rows.map(([a, n, side], i) => (
          <div key={a} className="flex items-center gap-2">
            <span className={cn("flex flex-1 items-center justify-between rounded-lg border px-3 py-1.5 text-[11.5px]", i === rows.length - 1 ? "border-brand-300 bg-brand-50 font-semibold text-brand-800" : "border-ink-200 text-ink-700")}>{t(a)}<b className="tabular-nums">{n}</b></span>
            {side ? <span className="w-24 shrink-0 rounded-lg border border-dashed sm:w-28 border-ink-200 px-2 py-1.5 text-[10.5px] text-ink-500">{t(side)}</span> : <span className="w-24 shrink-0 sm:w-28" />}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[["κ = 0,81", "Değerlendiriciler arası uyum"], ["21/21", "Veri çıkarma"], ["Düşük", "Yanlılık riski"]].map(([a, b]) => <div key={b} className="rounded-xl bg-ink-50 px-2 py-2"><p className="text-[13px] font-semibold text-ink-900">{t(a)}</p><p className="text-[10px] text-ink-500">{t(b)}</p></div>)}
      </div>
      <p className="mt-2 text-[10.5px] text-ink-400">{t("Örnek sayılar")}</p>
    </Frame>
  );
}

function DataVisual() {
  const { t } = useT();
  return (
    <Frame label={t("Veri analizi")}>
      <p className="font-serif text-[12px] italic text-ink-700">{t("Tablo 1. Gruplara göre başarı puanları")}</p>
      <table className="mt-1 w-full font-serif text-[12px] text-ink-800">
        <thead><tr className="border-y-2 border-ink-800"><th className="py-1 text-left font-normal">{t("Grup")}</th><th className="text-right font-normal italic">n</th><th className="text-right font-normal italic">M</th><th className="text-right font-normal italic">SD</th></tr></thead>
        <tbody className="border-b-2 border-ink-800"><tr><td className="py-1">{t("Canlı ders")}</td><td className="text-right">60</td><td className="text-right">78.4</td><td className="text-right">9.1</td></tr><tr><td className="py-1">{t("Kayıtlı video")}</td><td className="text-right">60</td><td className="text-right">74.2</td><td className="text-right">10.0</td></tr></tbody>
      </table>
      <p className="mt-2 font-serif text-[12px] text-ink-700"><i>t</i>(118) = 2.41, <i>p</i> = .018, <i>d</i> = 0.44</p>
      <div className="mt-3 flex h-24 items-end gap-3 border-b-2 border-ink-300 px-3">{[86, 68, 74, 52].map((h, i) => <span key={i} className={cn("flex-1 rounded-t-lg", i % 2 ? "bg-brand-300" : "bg-brand-500")} style={{ height: `${h}%` }} />)}</div>
      <p className="mt-2 text-[10.5px] text-ink-400">{t("Örnek veri")}</p>
    </Frame>
  );
}

function QualityVisual() {
  const { t } = useT();
  const r = 42, c = 2 * Math.PI * r;
  return (
    <Frame label={t("Teslim öncesi kontrol")}>
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90"><circle cx="50" cy="50" r={r} className="fill-none stroke-ink-100" strokeWidth="10" /><circle cx="50" cy="50" r={r} className="fill-none stroke-emerald-500" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.14} /></svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center"><b className="text-2xl text-ink-900">86</b><span className="text-[9.5px] text-ink-500">{t("Kalite puanı")}</span></span>
        </div>
        <ul className="space-y-1.5 text-[12px] text-ink-700">
          {[[true, "Bütün bölümler yazıldı"], [true, "Her kaynağa metinde atıf var"], [true, "Tablo ve şekil başlıkları stile uygun"], [false, "2 kaynağın künyesi eksik"]].map(([ok, l]) => <li key={l as string} className="flex items-center gap-1.5">{ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700">!</span>}{t(l as string)}</li>)}
        </ul>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{[[FileDown, "Word"], [FileDown, "PDF"], [Layers, "Savunma sunumu (.pptx)"], [Languages, "TR ↔ EN çeviri"]].map(([I, l]) => { const C = I as Icon; return <span key={l as string} className="inline-flex items-center gap-1.5 rounded-xl border border-ink-100 px-2.5 py-1.5 text-[11px] font-medium text-ink-700"><C className="h-3.5 w-3.5 text-brand-600" />{t(l as string)}</span>; })}</div>
    </Frame>
  );
}

/* ---------------- Alanlar ---------------- */
const CATEGORIES: Category[] = [
  { id: "yazim", icon: PenLine, title: "Planlama ve yazım", lead: "Çalışma türünüze göre kurulan yol haritası ve her bölümün kendi asistanı.", Visual: WritingVisual, features: [
    { icon: Workflow, title: "Çalışma türüne özel yol haritası", text: "Tez, makale, derleme, araştırma önerisi, TÜBİTAK/BAP dahil 9 çalışma türü; her aşamanın kuralları, soruları ve asistanı ayrı." },
    { icon: ClipboardList, title: "Kurgu modülü", text: "Problem, amaç, araştırma soruları, yöntem ve bölüm bazında hedef uzunluk; asistan bütün bölümleri bu kurguya göre yazar." },
    { icon: Bot, title: "Bölüm bölüm yazım asistanı", text: "Taslak, genişletme, yeniden yazma ve sentez; işin zorluğuna göre model seçilir, her sürüm geçmişte saklanır." },
    { icon: Sparkles, title: "Yazarken otomatik tamamlama", text: "Paragraf sonunda gri öneri belirir, Tab ile kabul edilir; metninizin üslubunu sürdürür." },
    { icon: FileText, title: "Word’den içe aktarma", text: "Hazır tezinizi veya makalenizi yükleyin; bölümler, kaynakça ve atıflar otomatik bağlanır." },
    { icon: Users, title: "Ortak yazım", text: "Ortak yazarlar rolleriyle aynı çalışmada; kim hangi bölümde görünür, çakışmalar önlenir.", plan: "coauthors" },
  ] },
  { id: "literatur", icon: Library, title: "Kaynak ve literatür", lead: "16 akademik veri tabanında 250 milyondan fazla yayın; her kaynağın ne kadarının okunduğu açıkça yazar.", Visual: SourcesVisual, features: [
    { icon: Database, title: "16 veri tabanında eşzamanlı arama", text: "OpenAlex, Crossref, PubMed, arXiv, ERIC, DOAJ, HAL, PLOS ve diğerleri; sonuçlar birleştirilir, tekrarlar ayıklanır." },
    { icon: Globe2, title: "Türkiye kaynakları", text: "DergiPark dergileri dahil Türkçe ve Türkiye adresli yayınlar; TR Dizin ve YÖK Tez Merkezi’nde tek tıkla arama." },
    { icon: FileSearch2, title: "Tam metin okuma", text: "Açık erişimli metinler otomatik okunur, PDF’iniz yüklenebilir; bölümler tanınır, alıntılar yayındaki sayfa numarasıyla gelir." },
    { icon: MessagesSquare, title: "Kaynağa sor", text: "Bir makaleye soru sorun; cevap yalnızca o makaleden, sayfa numaralarıyla gelir." },
    { icon: Layers, title: "Birlikte analiz et", text: "2–8 makaleyi karşılaştırın: uyuşan noktalar, çelişen bulgular ve araştırma boşlukları tek tabloda.", plan: "matrix" },
    { icon: Network, title: "Literatür haritası ve matrisi", text: "Kaynaklarınızın atıf ağı, eksik olabilecek temel çalışmalar ve amaç–yöntem–bulgu matrisi.", plan: "litmap" },
    { icon: Table2, title: "Konu bulma ve kütüphane aktarımı", text: "Yıllara göre yayın eğilimleri ve konu önerileri; Zotero, Mendeley, EndNote içe/dışa aktarma.", plan: "topics" },
  ] },
  { id: "dogruluk", icon: ShieldCheck, title: "Atıf ve doğruluk", lead: "Bir kaynağın var olması, cümlenizi desteklediği anlamına gelmez. Academiana ikisini de denetler.", Visual: CitationVisual, features: [
    { icon: Quote, title: "Canlı atıflar, 10 atıf stili", text: "APA 7, ISNAD 2, MLA, Chicago, IEEE ve diğerleri; stil değiştiğinde metin ve kaynakça birlikte dönüşür." },
    { icon: ScanSearch, title: "İddia denetimi", text: "Atıflı her cümle kaynağın metniyle karşılaştırılır: destekliyor, kısmen, desteklemiyor veya çelişiyor; birebir alıntı ve sayfa." },
    { icon: GitFork, title: "Kaynaklar arası destek ve çelişki", text: "Atıfsız cümleleri destekleyen kaynaklarınızı önerir, cümlenizle çelişen bulguları alıntısıyla uyarır." },
    { icon: BookCheck, title: "Uydurma kaynak kontrolü", text: "Kaynakçadaki her satır gerçek kayıtlarla eşleştirilir; var olmayan kaynak ve hatalı DOI bulunur." },
    { icon: ShieldCheck, title: "Uydurma yok ilkesi", text: "Yapay zekâ yalnızca projenize eklenmiş kaynaklara atıf yapabilir; kaynak yoksa [KAYNAK GEREKLİ] diye işaretler." },
  ] },
  { id: "derleme", icon: GitFork, title: "Sistematik derleme", lead: "PRISMA 2020’ye uygun, uçtan uca sistematik derleme: protokolden yöntem metnine.", Visual: ReviewVisual, features: [
    { icon: ClipboardList, title: "Protokol ve arama kaydı", text: "Araştırma sorusu, dahil etme/hariç tutma ölçütleri ve her veri tabanındaki arama ifadesi kayıt altında.", plan: "prisma" },
    { icon: Database, title: "Kayıt toplama ve yinelenen ayıklama", text: "16 veri tabanında arama veya Scopus, Web of Science, PubMed’den RIS/BibTeX; benzer başlıklı yinelenenler de yakalanır.", plan: "prisma" },
    { icon: Users, title: "Çift değerlendirici ve uyum", text: "Ekip üyeleri bağımsız oy verir; anlaşmazlıklar listelenir, Cohen’in kappası hesaplanır. Yapay zekâ yalnızca öneri verir.", plan: "prisma" },
    { icon: Table2, title: "Veri çıkarma ve kalite değerlendirmesi", text: "Standart form dayanak alıntısıyla doldurulur; 7 maddelik listeyle yanlılık riski değerlendirilir.", plan: "prisma" },
    { icon: FileText, title: "Akış şeması ve yöntem metni", text: "PRISMA akış şeması ile sayıları, gerekçeleri ve arama tablosunu içeren yöntem metni kararlarınızdan otomatik oluşur.", plan: "prisma" },
  ] },
  { id: "veri", icon: BarChart3, title: "Veri ve analiz", lead: "Bulgular sizin verinize dayanır; hesaplamalar yapay zekâya değil, istatistik motoruna yaptırılır.", Visual: DataVisual, features: [
    { icon: ClipboardList, title: "Anket oluşturucu", text: "Yapay zekâ destekli taslak, paylaşım bağlantısı, analize hazır veri tablosu ve kod kitabı.", plan: "surveys" },
    { icon: BarChart3, title: "İstatistik analizleri", text: "t testleri, ANOVA ve Bonferroni, korelasyon, regresyon, ki-kare, Mann–Whitney, Kruskal–Wallis, Cronbach alfa; APA biçiminde rapor.", plan: "stats" },
    { icon: Activity, title: "APA biçiminde grafikler", text: "Verinizden grafik çizilir ve numaralı şekil olarak belgeye eklenir.", plan: "stats" },
    { icon: TestTube2, title: "Ücretsiz araçlar", text: "Örneklem büyüklüğü, Cronbach alfa, kaynakça oluşturucu ve atıf dönüştürücü üyeliksiz kullanılabilir." },
  ] },
  { id: "teslim", icon: FileCheck2, title: "Kalite, dil ve teslim", lead: "Teslim etmeden önce eksikleri görün; çalışmanızı istediğiniz biçimde ve dilde çıkarın.", Visual: QualityVisual, features: [
    { icon: FileCheck2, title: "Şeffaf kalite puanı ve kontrol listesi", text: "Puan sabit ve herkese açık bir formülle hesaplanır; teslim öncesi liste eksik künyeden tablo başlığına kadar her şeyi gösterir." },
    { icon: Languages, title: "Dil denetimi ve akademik çeviri", text: "Türkçe ↔ İngilizce çeviride atıflar ve dipnotlar korunur; terim sözlüğü ve üslup önerileri." },
    { icon: FileDown, title: "Word ve PDF çıktısı", text: "Kapak, içindekiler, numaralandırma ve kaynakça hazır; kurum biçim şablonları." },
    { icon: Globe2, title: "Dergi önerisi ve hakem yanıtı", text: "Çalışmanıza uygun dergiler, ön yazı ve hakem yorumlarına madde madde cevap.", plan: "journals" },
    { icon: Layers, title: "Savunma sunumu ve provası", text: "Tezinizden sunum dosyası ve yapay zekâ jüriyle soru–cevap provası.", plan: "defense" },
  ] },
];

const INFRA: { icon: Icon; title: string; text: string }[] = [
  { icon: Server, title: "Avrupa’da barındırma", text: "Uygulama ve veritabanı Avrupa Birliği’nde, Frankfurt veri merkezinde çalışır." },
  { icon: Lock, title: "Satır düzeyinde erişim denetimi", text: "Her kullanıcının verisi veritabanı düzeyinde ayrılır; çalışmanızı yalnızca siz ve davet ettikleriniz görür." },
  { icon: ShieldCheck, title: "Uygulama güvenliği", text: "Zorunlu HTTPS (HSTS), içerik güvenlik politikası, istek kökeni denetimi ve dış bağlantılarda iç ağ koruması." },
  { icon: Activity, title: "İzleme ve dayanıklılık", text: "Veri tabanı bağlantıları geçici hatalarda yeniden denenir; kaynak sağlığı ve yapay zekâ yanıt süreleri sürekli izlenir." },
  { icon: TestTube2, title: "Otomatik test güvencesi", text: "450’den fazla otomatik test her güncellemeden önce çalışır; veri izolasyonu gerçek veritabanı üzerinde sınanır." },
  { icon: FileCheck2, title: "KVKK ve şeffaflık", text: "Verilerinizi indirme ve silme talebi; kaynak doğrulama ve puanlama yöntemi herkese açık." },
];

function Architecture() {
  const { t } = useT();
  const box = "rounded-2xl border bg-white p-3.5 text-left shadow-sm";
  return (
    <div className="relative rounded-3xl border border-ink-100 bg-ink-50/60 p-5 sm:p-7">
      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)_auto_minmax(0,1fr)]">
        <div className={cn(box, "border-ink-100")}>
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900"><Database className="h-4 w-4 text-brand-600" /> {t("Kaynak katmanı")}</p>
          <p className="mt-1 text-[12px] text-ink-500">{t("16 akademik veri tabanı, 250 milyon+ yayın; DOI, PMID ve arXiv doğrulaması; açık erişimli tam metin.")}</p>
        </div>
        <Connector />
        <div className={cn(box, "border-brand-200 bg-gradient-to-b from-white to-brand-50/60")}>
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900"><Cloud className="h-4 w-4 text-brand-600" /> {t("Academiana çalışma alanı")}</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11.5px] text-ink-600">{["Yol haritası ve kurgu", "Canlı atıf motoru", "İddia denetimi", "PRISMA modülü", "İstatistik motoru", "Kalite ve teslim"].map((x) => <span key={x} className="rounded-lg bg-white/80 px-2 py-1">{t(x)}</span>)}</div>
        </div>
        <Connector />
        <div className={cn(box, "border-ink-100")}>
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900"><Bot className="h-4 w-4 text-brand-600" /> {t("Yapay zekâ katmanı")}</p>
          <p className="mt-1 text-[12px] text-ink-500">{t("Anthropic Claude modelleri; işin zorluğuna göre hızlı, dengeli veya derin model. Yalnızca okunan metne dayanır.")}</p>
        </div>
      </div>
      <div className="mx-auto my-2 h-6 w-px bg-ink-200" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={cn(box, "border-ink-100")}><p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900"><ScanSearch className="h-4 w-4 text-emerald-600" /> {t("Doğrulama katmanı")}</p><p className="mt-1 text-[12px] text-ink-500">{t("Künye kayıtla eşleşir, alıntı kaynak metninde birebir aranır; doğrulanamayan hiçbir şey kesin bilgi gibi gösterilmez.")}</p></div>
        <div className={cn(box, "border-ink-100")}><p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900"><Lock className="h-4 w-4 text-emerald-600" /> {t("Veri katmanı")}</p><p className="mt-1 text-[12px] text-ink-500">{t("AB’de (Frankfurt) veritabanı ve dosya deposu; satır düzeyinde erişim denetimi, şifreli bağlantı.")}</p></div>
      </div>
    </div>
  );
}
function Connector() {
  return <div className="hidden items-center lg:flex"><span className="h-px w-6 bg-ink-300" /><span className="-ml-1 h-0 w-0 border-y-4 border-l-[6px] border-y-transparent border-l-ink-300" /></div>;
}

export function FeatureShowcase() {
  const { t } = useT();
  const [active, setActive] = useState(CATEGORIES[0].id);
  const stats: [string, string][] = [["16", "akademik veri tabanı"], ["250M+", "akademik yayın"], ["10", "atıf stili"], ["9", "çalışma türü"], ["14", "istatistik analizi"], ["450+", "otomatik test"]];
  return (
    <section id="ozellikler" className="relative scroll-mt-24 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("Özellikler")}</p>
          <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{t("Akademik çalışmanın her adımı,")} <span className="italic">{t("tek ve güvenilir")}</span> {t("bir çalışma alanında")}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-500">{t("Fikirden teslime kadar: literatür taraması, yazım, atıf denetimi, sistematik derleme, veri analizi ve kalite kontrolü. Her biri gerçek kaynaklara ve doğrulanabilir yöntemlere dayanır.")}</p>
        </FadeIn>

        <FadeIn className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink-100 bg-ink-100 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map(([n, l]) => <div key={l} className="bg-white px-4 py-5 text-center"><p className="font-serif text-3xl font-semibold tracking-tight text-ink-950">{n}</p><p className="mt-1 text-[12px] text-ink-500">{t(l)}</p></div>)}
        </FadeIn>

        <div className="mt-12 -mx-6 overflow-x-auto px-6 pb-1">
          <div className="flex min-w-max gap-2" role="tablist">
            {CATEGORIES.map((c) => (
              <button key={c.id} role="tab" aria-selected={active === c.id} onClick={() => setActive(c.id)} className={cn("relative inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[14px] font-medium transition", active === c.id ? "text-white" : "bg-white text-ink-600 ring-1 ring-ink-100 hover:text-ink-900")}>
                {active === c.id && <motion.span layoutId="feature-tab" className="absolute inset-0 -z-0 rounded-2xl bg-ink-900" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <c.icon className="relative h-4 w-4" /><span className="relative">{t(c.title)}</span>
              </button>
            ))}
          </div>
        </div>

        {CATEGORIES.map((c) => (
          <div key={c.id} role="tabpanel" hidden={active !== c.id} className="mt-8">
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] [&>*]:min-w-0">
              <div>
                <h3 className="font-serif text-3xl font-medium tracking-tight text-ink-950">{t(c.title)}</h3>
                <p className="mt-2 text-[15.5px] text-ink-500">{t(c.lead)}</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {c.features.map((f) => (
                    <li key={f.title} className="group rounded-2xl border border-ink-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
                      <div className="flex items-start justify-between gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"><f.icon className="h-4 w-4" /></span><PlanBadge plan={planOf(f.plan)} /></div>
                      <p className="mt-3 text-[14.5px] font-semibold text-ink-900">{t(f.title)}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{t(f.text)}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:sticky lg:top-28"><c.Visual /></div>
            </div>
          </div>
        ))}

        <FadeIn className="mt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("Altyapı")}</p>
            <h3 className="mt-3 font-serif text-3xl font-medium tracking-tight text-ink-950 sm:text-4xl">{t("Akademik güven için kurulmuş sağlam bir altyapı")}</h3>
            <p className="mt-3 text-[15.5px] text-ink-500">{t("Kaynak, yapay zekâ, doğrulama ve veri katmanları birbirinden ayrıdır: yapay zekâ hiçbir zaman kaynak üretmez, yalnızca doğrulanmış ve okunmuş metinle çalışır.")}</p>
          </div>
          <div className="mt-10"><Architecture /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INFRA.map((x) => (
              <div key={x.title} className="flex gap-3 rounded-2xl border border-ink-100 bg-white p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><x.icon className="h-4 w-4" /></span>
                <div><p className="text-[14px] font-semibold text-ink-900">{t(x.title)}</p><p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">{t(x.text)}</p></div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-ink-500">{t("Kaynakların nasıl doğrulandığını ve puanların nasıl hesaplandığını herkese açık anlatıyoruz.")} <Link href="/yontem" className="font-medium text-brand-700 hover:underline">{t("Yöntem ve şeffaflık →")}</Link></p>
        </FadeIn>
      </div>
    </section>
  );
}
