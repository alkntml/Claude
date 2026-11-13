/**
 * Akademik tutarlılık zinciri (D171, referans 10.1–10.2). Problem → soru → yaklaşım/desen → örneklem → araç →
 * analiz → bulgu → tartışma zincirindeki kopuklukları deterministik olarak gösterir. Kalite PUANINI ETKİLEMEZ
 * (puan yazılımı aynen kalır); yalnızca öneridir. Otomatik düzeltme yapmaz: sorunu, kanıtını ve önerilen
 * çözümü gösterir, karar kullanıcınındır. Yapay zekâ kullanmaz.
 */
import { buildTemplate, EMPIRICAL_METHODS, type TemplateInput } from "@/lib/workflows";

export type ChainLevel = "critical" | "important" | "improvement";
export const CHAIN_LEVEL_LABEL: Record<ChainLevel, string> = { critical: "Kritik", important: "Önemli", improvement: "İyileştirme" };

export interface ChainItem {
  id: string;
  level: ChainLevel;
  /** Çevrilebilir başlık / kanıt / öneri (Türkçe anahtar; {değişken} içerebilir) */
  title: string;
  evidence: string;
  suggestion: string;
  vars?: Record<string, string | number>;
  stageKey?: string;
}

export interface ChainStage { key: string; title: string; text: string; hidden?: boolean }

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const HYPOTHESIS = /\bH[0-9₀-₉]\b|\bhipotez|\bhypothes|\bHypothese/i;
const STATS = /t[- ]?test|anova|ancova|manova|regresyon|regression|korelasyon|correlation|ki[- ]?kare|chi[- ]?square|mann|wilcoxon|kruskal|faktör analizi|factor analysis|sem\b|yapısal eşitlik/i;
const QUAL = /tema|theme|kodla|coding|içerik analizi|content analysis|betimsel analiz|thematic|söylem|discourse|fenomenoloj|phenomenolog|gömülü teori|grounded/i;

export function consistencyChain(input: TemplateInput & { stages: ChainStage[] }): ChainItem[] {
  const out: ChainItem[] = [];
  const visible = input.stages.filter((s) => !s.hidden);
  const byKey = (k: string) => visible.find((s) => s.key === k);
  const filled = (k: string) => words(byKey(k)?.text ?? "") > 0;
  const text = (k: string) => byKey(k)?.text ?? "";
  const m = input.methodology ?? null;
  const empirical = !!m && EMPIRICAL_METHODS.has(m);
  const add = (x: Omit<ChainItem, "id">) => out.push({ id: `chain-${out.length + 1}`, ...x });

  // 1) Problem/amaç → araştırma soruları
  if ((filled("problem") || filled("purpose")) && byKey("questions") && !filled("questions"))
    add({ level: "important", title: "Araştırma soruları yazılmamış", evidence: "Problem ve amaç yazılmış, ancak araştırma soruları bölümü boş.", suggestion: "Amacı yanıtlanabilir sorulara (veya hipotezlere) dönüştürün; yöntem ve analiz bu sorulara göre planlanır.", stageKey: "questions" });

  // 2) Sorular ↔ yaklaşım
  const q = text("questions");
  if (m === "qualitative" && HYPOTHESIS.test(q))
    add({ level: "important", title: "Nitel yaklaşımda hipotez", evidence: "Yaklaşım nitel seçilmiş, ancak araştırma soruları bölümünde hipotez ifadesi geçiyor.", suggestion: "Nitel araştırmada hipotez yerine keşfedici araştırma soruları kullanın veya yaklaşımı yeniden değerlendirin.", stageKey: "questions" });

  // 3) Hipotez → analiz planı
  const hasHyp = HYPOTHESIS.test(q) || HYPOTHESIS.test(text("purpose"));
  if (hasHyp && empirical && !filled("analysis"))
    add({ level: "important", title: "Hipotez var fakat analiz planı yok", evidence: "Hipotez tanımlanmış, ancak veri analizi bölümü boş veya yok.", suggestion: "Her hipotezi hangi değişkenler ve hangi analizle test edeceğinizi veri analizi bölümünde belirtin.", stageKey: "analysis" });

  // 4–5) Örneklem ve araçlar → bulgular
  const findingsWritten = filled("findings") || filled("results_article");
  if (empirical && findingsWritten) {
    for (const k of ["sample", "participants"]) if (byKey(k) && !filled(k))
      add({ level: "important", title: "Bulgular var, örneklem tanımı yok", evidence: "Bulgular yazılmış, ancak “{s}” bölümü boş.", vars: { s: byKey(k)!.title }, suggestion: "Bulguların kimden/nereden elde edildiğini ve seçim stratejisini önce tanımlayın.", stageKey: k });
    if (byKey("instruments") && !filled("instruments"))
      add({ level: "important", title: "Bulgular var, veri toplama aracı tanımı yok", evidence: "Bulgular yazılmış, ancak veri toplama araçları bölümü boş.", suggestion: "Kullanılan ölçek, form veya görüşme protokolünü ve uygunluğunu açıklayın.", stageKey: "instruments" });
  }

  // 6) Analiz ↔ yaklaşım
  const an = text("analysis");
  if (m === "qualitative" && STATS.test(an) && !QUAL.test(an))
    add({ level: "important", title: "Analiz yöntemi yaklaşımla uyumsuz", evidence: "Yaklaşım nitel, ancak analiz bölümünde yalnızca istatistiksel test adları geçiyor.", suggestion: "Nitel veriye uygun analiz yöntemini (ör. tematik veya içerik analizi) açıklayın ya da yaklaşımı gözden geçirin.", stageKey: "analysis" });
  if (m === "quantitative" && words(an) > 40 && !STATS.test(an))
    add({ level: "improvement", title: "Analiz planında istatistiksel yöntem belirtilmemiş", evidence: "Nicel yaklaşım seçilmiş, ancak analiz bölümünde bir istatistiksel yöntem adı bulunamadı.", suggestion: "Hangi istatistiksel analizlerin, hangi varsayım kontrolleriyle yapılacağını yazın.", stageKey: "analysis" });

  // 7) Bulgular → yöntem
  if (empirical && findingsWritten && byKey("analysis") && !filled("analysis"))
    add({ level: "important", title: "Bulgular yöntemde belirtilen analize dayanmıyor", evidence: "Bulgular yazılmış, ancak veri analizi bölümü boş.", suggestion: "Bulguların hangi analizden geldiğini yöntem bölümünde tanımlayın.", stageKey: "analysis" });

  // 8) Tartışma → bulgular
  if (empirical && filled("discussion") && (byKey("findings") || byKey("results_article")) && !findingsWritten)
    add({ level: "important", title: "Tartışma bulgulardan önce yazılmış", evidence: "Tartışma bölümü dolu, ancak bulgular bölümü boş.", suggestion: "Tartışma bulguların ötesine geçmemeli; önce bulguları (gerçek verinizle) yazın.", stageKey: "discussion" });

  // 10) Karma yöntem → entegrasyon
  if (m === "mixed" && findingsWritten && !filled("integration"))
    add({ level: "critical", title: "Karma yöntemde veri entegrasyonu yok", evidence: "Karma yöntem seçilmiş, bulgular yazılmış; ancak nicel ve nitel sonuçların birleştirildiği entegrasyon bölümü boş veya yok.", suggestion: "Nicel ve nitel bulguları karşılaştıran ortak gösterim ve meta-çıkarımlar içeren bir entegrasyon bölümü ekleyin.", stageKey: "integration" });

  // Kritik bölüm eksik veya gizlenmiş
  let template: ReturnType<typeof buildTemplate> = [];
  try { template = buildTemplate(input); } catch { /* bilinmeyen tür */ }
  for (const t of template.filter((x) => x.critical)) {
    const st = input.stages.find((s) => s.key === t.key);
    if (!st) add({ level: "important", title: "Kritik bölüm yapıda yok", evidence: "“{s}” bu çalışma türü için kritik bir bölümdür ve projede bulunmuyor.", vars: { s: t.title }, suggestion: "“Yapıyı yönet” penceresinden bölümü geri ekleyebilirsiniz.", stageKey: t.key });
    else if (st.hidden) add({ level: "improvement", title: "Kritik bölüm gizlenmiş", evidence: "“{s}” bölümü gizli olduğu için dışa aktarılan belgeye girmiyor.", vars: { s: st.title }, suggestion: "Bilinçli bir tercih değilse bölüm ayarlarından yeniden görünür yapın.", stageKey: t.key });
  }
  return out;
}
