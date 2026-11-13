/**
 * Akademik tutarlılık zinciri (D171, referans 10.1–10.2). Problem → soru → yaklaşım/desen → örneklem → araç →
 * analiz → bulgu → tartışma zincirindeki kopuklukları deterministik olarak gösterir. Kalite PUANINI ETKİLEMEZ
 * (puan yazılımı aynen kalır); yalnızca öneridir. Otomatik düzeltme yapmaz: sorunu, kanıtını ve önerilen
 * çözümü gösterir, karar kullanıcınındır. Yapay zekâ kullanmaz.
 */
import { buildTemplate, EMPIRICAL_METHODS, LITERATURE_STAGES, type TemplateInput } from "@/lib/workflows";

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

export interface ChainStage { key: string; title: string; text: string; hidden?: boolean; /** Bölümde atıf yapılan farklı kaynak sayısı */ citations?: number; /** Atıf yapılan kaynakların yayın yılları */ citedYears?: number[]; /** Bölümdeki alt başlıklar */ headings?: string[]; /** Atıflı paragraflardan tek kaynağa dayananların oranı (0–1) ve atıflı paragraf sayısı */ singleSourceShare?: number; citedParagraphs?: number }

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const HYPOTHESIS = /\bH[0-9₀-₉]\b|\bhipotez|\bhypothes|\bHypothese/i;
const STATS = /t[- ]?test|anova|ancova|manova|regresyon|regression|korelasyon|correlation|ki[- ]?kare|chi[- ]?square|mann|wilcoxon|kruskal|faktör analizi|factor analysis|sem\b|yapısal eşitlik/i;
const QUAL = /tema|theme|kodla|coding|içerik analizi|content analysis|betimsel analiz|thematic|söylem|discourse|fenomenoloj|phenomenolog|gömülü teori|grounded/i;

export function consistencyChain(input: TemplateInput & { stages: ChainStage[]; now?: number }): ChainItem[] {
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

  // Literatür kapsamı (referans 6.2–6.4): kaynak sayısı tek başına ölçüt değildir; yalnızca yüzeysellik işareti olarak İyileştirme düzeyinde
  const minSources = input.workType === "thesis" ? (input.level === "doctorate" ? 15 : input.level === "master" ? 10 : 5) : 5;
  const litKeys = input.workType === "research_article" || input.workType === "journal_article" ? new Set(["introduction", "article_body"]) : LITERATURE_STAGES;
  for (const s of visible.filter((x) => litKeys.has(x.key) && x.key !== "gaps" && words(x.text) > 0 && x.citations !== undefined)) {
    if ((s.citations ?? 0) < minSources)
      add({ level: "improvement", title: "Literatür kapsamı sınırlı görünüyor", evidence: "“{s}” bölümünde {n} farklı kaynağa atıf var.", vars: { s: s.title, n: s.citations ?? 0 }, suggestion: "Eksik alt temaları, temel ve güncel çalışmaları, yöntem farklılıklarını ve çelişen bulguları karşılaştırmalı olarak ekleyin; uzunluğu dolgu metniyle değil sentezle artırın.", stageKey: s.key });
  }
  if (input.workType === "thesis" && (input.level === "master" || input.level === "doctorate") && filled("literature") && byKey("gaps") && !filled("gaps"))
    add({ level: "improvement", title: "Araştırma boşluğu gösterilmemiş", evidence: "Literatür yazılmış, ancak araştırma boşluğu bölümü boş.", suggestion: "Literatürdeki boşluğu kaynaklara dayanarak gösterin ve çalışmanızın konumunu gerekçelendirin.", stageKey: "gaps" });

  // Sentez mi ardışık özet mi (referans 6.4): atıflı paragrafların büyük çoğunluğu tek kaynağa dayanıyorsa
  for (const s of visible.filter((x) => litKeys.has(x.key) && (x.citedParagraphs ?? 0) >= 5 && (x.singleSourceShare ?? 0) >= 0.75))
    add({ level: "improvement", title: "Kaynaklar sentezlenmek yerine ardışık özetlenmiş olabilir", evidence: "“{s}” bölümündeki atıflı paragrafların %{p}’i yalnızca tek bir kaynağa dayanıyor.", vars: { s: s.title, p: Math.round((s.singleSourceShare ?? 0) * 100) }, suggestion: "Paragrafları kaynak kaynak değil tema tema kurun; aynı paragrafta birden çok çalışmayı karşılaştırın.", stageKey: s.key });
  // Çelişkili bulgular ve yöntem farklılıkları (referans 6.1/6.4)
  const CONTRAST = /çeliş|tutarsız|farklı sonuç|aksine|buna karşın|bununla birlikte|öte yandan|desteklememekte|however|in contrast|contrary|inconsistent|mixed findings|jedoch|im gegensatz|widersprüchlich/i;
  for (const s of visible.filter((x) => (x.key === "literature" || x.key === "review_synthesis") && words(x.text) > 600 && !CONTRAST.test(x.text)))
    add({ level: "improvement", title: "Çelişkili bulgular ele alınmamış görünüyor", evidence: "“{s}” bölümünde çalışmalar arasındaki farklılık veya çelişkiye işaret eden bir ifade bulunamadı.", vars: { s: s.title }, suggestion: "Uzlaşan ve çelişen bulguları, yöntem farklılıklarını ve olası nedenlerini karşılaştırın.", stageKey: s.key });

  // Temel ve güncel çalışmaların dengesi (referans 6.4): literatür bölümlerinde son 5 yılın çalışması hiç yoksa
  const nowYear = input.now ?? new Date().getFullYear();
  for (const s of visible.filter((x) => litKeys.has(x.key) && (x.citedYears?.length ?? 0) >= 3)) {
    if (!s.citedYears!.some((y) => y >= nowYear - 5))
      add({ level: "improvement", title: "Güncel çalışmalar temsil edilmiyor", evidence: "“{s}” bölümünde atıf yapılan kaynakların hiçbiri son 5 yıla ait değil (en yenisi {y}).", vars: { s: s.title, y: Math.max(...s.citedYears!) }, suggestion: "Temel çalışmaların yanında alanın güncel ampirik çalışmalarını da ekleyin (Literatür araştır).", stageKey: s.key });
  }
  // Yinelenen başlıklar (referans 7.3): aynı başlık bir bölümde veya bölümler arasında tekrar etmemeli
  const normH = (x: string) => x.toLocaleLowerCase("tr").replace(/^[\d.\s]+/, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const seenH = new Map<string, string>();
  const dup = new Set<string>();
  for (const s of visible) {
    const inStage = (s.headings ?? []).map(normH).filter((k) => k.length >= 3);
    const twice = inStage.find((k, i) => inStage.indexOf(k) !== i);
    if (twice && !dup.has(twice)) { dup.add(twice); add({ level: "improvement", title: "Yinelenen başlık", evidence: "“{h}” başlığı birden fazla yerde geçiyor.", vars: { h: (s.headings ?? []).find((h) => normH(h) === twice) ?? twice }, suggestion: "Aynı işlevi gören başlıkları birleştirin veya içeriğe özgü, ayırt edici adlar verin.", stageKey: s.key }); }
  }
  for (const s of visible) for (const h of [s.title, ...(s.headings ?? [])]) {
    const k = normH(h);
    if (k.length < 3) continue;
    if (seenH.has(k) && seenH.get(k) !== s.key && !dup.has(k)) { dup.add(k); add({ level: "improvement", title: "Yinelenen başlık", evidence: "“{h}” başlığı birden fazla yerde geçiyor.", vars: { h }, suggestion: "Aynı işlevi gören başlıkları birleştirin veya içeriğe özgü, ayırt edici adlar verin.", stageKey: s.key }); }
    else seenH.set(k, s.key);
  }

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
