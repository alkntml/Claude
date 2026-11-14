/**
 * D182: Çalışmanın bütünlüğü — bölümler birbirini desteklemeli, amaç, araştırma soruları ve hipotezlerle uyumlu olmalı.
 * - Omurga (spine): amaç, araştırma soruları/hipotezler, temel kavramlar, yöntem; her yazımda yapay zekâya verilir.
 * - Bölüm türüne göre bütünlük kuralı: bölümün bütüne nasıl bağlanacağı.
 * - Ana hat: bütün bölümlerin başlık yapısı (tekrar ve kopukluk olmasın).
 * - Deterministik denetimler (tutarlılık zincirinde kullanılır): anahtar terim kapsaması ve hipotez etiketleri.
 * Saf modül (istemci, sunucu ve test ortak).
 */

export interface SpineInput {
  title: string;
  topic?: string | null;
  keywords?: string[];
  methodologyLabel?: string | null;
  designLabel?: string | null;
  blueprint?: { purpose?: string; problem?: string; questions?: string[] } | null;
  researchQuestions?: string | null;
  memory?: { kind: string; content: string }[];
  stages: { key: string; title: string; text: string; hidden?: boolean; headings?: string[] }[];
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s);
const firstPara = (s: string) => s.split(/\n{2,}|\n/).map((x) => x.trim()).find((x) => x.length > 40) ?? s.trim();

/** Araştırma soruları ve hipotezler: kurgudan, “sorular” bölümünden, oluştururken yazılanlardan veya hafızadan */
export function researchQuestionsOf(p: SpineInput): string[] {
  if (p.blueprint?.questions?.filter((q) => q.trim()).length) return p.blueprint.questions.filter((q) => q.trim()).slice(0, 12);
  const qText = p.stages.find((s) => s.key === "questions" && !s.hidden)?.text ?? "";
  const fromStage = qText.split(/\n|(?<=\?)\s+/).map((x) => x.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter((x) => x.length > 12 && (/\?$/.test(x) || /^(H\s?\d|H₀|H₁|Hipotez)/i.test(x)));
  if (fromStage.length) return fromStage.slice(0, 12);
  if (p.researchQuestions?.trim()) return p.researchQuestions.split(/\n+/).map((x) => x.trim()).filter(Boolean).slice(0, 12);
  return (p.memory ?? []).filter((m) => m.kind === "question" || m.kind === "hypothesis").map((m) => m.content).slice(0, 12);
}

/** Amaç: kurgudan, “amaç” bölümünden veya (makalede) girişin son paragrafından */
export function aimOf(p: SpineInput): string {
  if (p.blueprint?.purpose?.trim()) return p.blueprint.purpose.trim();
  const purpose = p.stages.find((s) => s.key === "purpose" && !s.hidden)?.text?.trim();
  if (purpose) return firstPara(purpose);
  const intro = p.stages.find((s) => s.key === "introduction" && !s.hidden)?.text?.trim();
  if (intro) { const paras = intro.split(/\n+/).map((x) => x.trim()).filter((x) => x.length > 40); const aim = [...paras].reverse().find((x) => /amac|amaç|aim|purpose|ziel/i.test(x)); if (aim) return aim; }
  return p.topic?.trim() ?? "";
}

/** Yapay zekâ bağlamındaki “omurga” bloğu (sabit kısma girer) */
export function spineBlock(p: SpineInput): string {
  const aim = aimOf(p);
  const rqs = researchQuestionsOf(p);
  const concepts = (p.memory ?? []).filter((m) => m.kind === "concept" || m.kind === "variable").map((m) => m.content).slice(0, 10);
  const lines = ["## ÇALIŞMANIN OMURGASI (her bölüm buna hizmet eder)", `Başlık: ${p.title}`];
  if (aim) lines.push(`Amaç: ${clip(aim, 700)}`);
  if (rqs.length) lines.push(`Araştırma soruları / hipotezler:\n${rqs.map((q, i) => `  ${i + 1}. ${clip(q, 300)}`).join("\n")}`);
  if (concepts.length) lines.push(`Temel kavramlar / değişkenler: ${concepts.map((c) => clip(c, 160)).join(" · ")}`);
  else if (p.keywords?.length) lines.push(`Temel kavramlar: ${p.keywords.join(", ")}`);
  if (p.methodologyLabel) lines.push(`Yöntem: ${p.methodologyLabel}${p.designLabel ? ` · ${p.designLabel}` : ""}`);
  lines.push("BÜTÜNLÜK KURALI: Yazdığın her bölüm bu amaca ve araştırma sorularına/hipotezlere açıkça hizmet etmeli; kavramları burada ve önceki bölümlerde tanımlandığı adlarla, aynı anlamda kullan; başka bölümlerde söylenenlerle çelişme, onları tekrar etme, gerektiğinde kısa göndermelerle bağ kur. Bir bölüm yalnızca bir konuyu anlatıyorsa bile o konunun çalışmanın amacına neden gerekli olduğunu belli et. Omurga bilgileri bir kaynak veya bulgu değildir; atıf ve uydurma yasağı kuralları geçerlidir.");
  return lines.join("\n");
}

/** Bölüm türüne göre bütünlük görevi (değişken kısma girer) */
export function coherenceRule(key: string): string {
  const R: Record<string, string> = {
    problem: "Problemi, amaç ve araştırma sorularına doğal olarak varacak biçimde kur; sorularda yer alan kavramları burada tanıt.",
    purpose: "Amacı problem durumundan türet; araştırma soruları/hipotezler bu amacın alt parçaları olmalı; önem kısmında çalışmanın sonunda verilecek katkıyı önceden belirt.",
    questions: "Her soru/hipotez amacın bir parçasını karşılamalı; kullanılan değişken ve kavram adları literatür ve yöntemde aynen kullanılacak biçimde net olmalı.",
    concepts: "Araştırma sorularındaki her kavramı tanımla; tanımlar sonraki bölümlerde kullanılacak terimlerle birebir aynı olmalı.",
    theory: "Kuramsal çerçeveyi araştırma sorularını/hipotezleri açıklayacak biçimde kur; hangi kuramın hangi soruya/hipoteze dayanak olduğunu belli et.",
    literature: "Literatürü araştırma sorularının/hipotezlerin değişkenlerine ve kavramlarına göre tematik düzenle; her tema sonunda bu çalışmayla ilişkisini kur; bölümü araştırma boşluğuna ve bu çalışmanın amacına bağlayarak bitir.",
    gaps: "Boşluğu literatür bölümünde sentezlenen çalışmalara dayandır ve bu çalışmanın amacının bu boşluğu nasıl kapattığını göster.",
    method: "Her yöntem kararını (yaklaşım, desen) araştırma sorularına/hipotezlere dayanarak gerekçelendir.",
    methods_article: "Her yöntem kararını giriş bölümünde belirtilen amaç ve sorulara/hipotezlere dayanarak gerekçelendir; analizleri sorularla eşleştir.",
    sample: "Örneklem/katılımcı seçimini araştırma sorularının gerektirdiği gruba göre gerekçelendir.",
    participants: "Katılımcı seçimini araştırma sorularının gerektirdiği deneyim ve bağlama göre gerekçelendir.",
    instruments: "Her aracın hangi değişkeni/soruyu ölçtüğünü veya hangi soruya veri ürettiğini belirt.",
    analysis: "Her araştırma sorusu/hipotez için hangi analizin yapılacağını eşleştir; soruların sırasını koru.",
    findings: "Bulguları araştırma sorusu/hipotez sırasıyla sun; her alt başlıkta hangi soruyu yanıtladığını belli et.",
    results_article: "Bulguları girişteki sorular/hipotezler sırasıyla sun; hangi soruyu yanıtladığını belli et.",
    integration: "Nicel ve nitel bulguları araştırma sorularına göre birleştir; karma soruyu yanıtla.",
    discussion: "Her temel bulguyu, ilgili araştırma sorusu/hipotez ve literatür bölümünde ele alınan çalışmalarla karşılaştırarak tartış; kuramsal çerçeveye geri dön; çalışmanın amacına göre ne anlama geldiğini söyle.",
    discussion_article: "Her temel bulguyu girişteki sorular/hipotezler ve girişte anılan literatürle karşılaştırarak tartış.",
    conclusion: "Her araştırma sorusunu/hipotezi sırasıyla kısaca yanıtla; amacın ne ölçüde karşılandığını ve önem kısmında vaat edilen katkıyı söyle; öneriler bulgulardan türemeli, yeni bilgi ekleme.",
    conclusion_article: "Girişte belirtilen amacı ve konu bölümlerinin ana çıkarımlarını birleştirerek sonuca bağla; yeni bilgi ekleme.",
    introduction: "Girişi, makalenin sonraki bölümlerinin (konu bölümleri veya yöntem–bulgular) ele alacağı konulara ve amaca bağlanacak biçimde kur; amaç ve (varsa) sorular net olmalı.",
    article_body: "Her ana başlık girişte belirtilen amacın bir parçasını işlemeli; başlıklar mantıksal sırayla birbirini izlemeli ve sonuca hazırlamalı; aynı konu iki başlıkta tekrar etmemeli.",
    title_abstract: "Özet, çalışmanın amacını, yöntemini/kapsamını ve ana bölümlerde gerçekten ulaşılan sonucu yansıtmalı.",
    review_synthesis: "Sentezi derleme sorusuna göre düzenle; her tema derleme sorusunun bir boyutunu yanıtlamalı.",
    grant_method: "Yöntem ve iş paketlerini proje amaçlarına ve ölçülebilir hedeflere bire bir bağla.",
    grant_impact: "Beklenen çıktı ve etkileri proje amaçlarından ve yöntemden türet.",
  };
  return R[key] ? `BÜTÜNLÜK GÖREVİ (bu bölüm): ${R[key]}` : "BÜTÜNLÜK GÖREVİ (bu bölüm): Bölümün içeriğini çalışmanın amacına ve önceki bölümlere bağla; kavramları aynı adlarla kullan.";
}

/** Çalışmanın ana hattı: her bölümün başlığı ve alt başlıkları (tekrar ve kopukluk olmasın; değişken kısma girer) */
export function outlineBlock(stages: SpineInput["stages"], currentKey?: string): string {
  const rows = stages.filter((s) => !s.hidden && s.key !== "references").map((s) => {
    const heads = (s.headings ?? []).slice(0, 12);
    return `- ${s.title}${s.key === currentKey ? " ← ÜZERİNDE ÇALIŞILAN" : ""}${s.text.trim() ? "" : " (henüz yazılmadı)"}${heads.length ? `: ${heads.join(" · ")}` : ""}`;
  });
  return rows.length ? `## ÇALIŞMANIN ANA HATTI (başlıklar; aynı konuyu başka bölümde tekrar etme, sırayı gözet)\n${rows.join("\n")}` : "";
}

// ---------------------------------------------------------------------------
// Deterministik denetimler
// ---------------------------------------------------------------------------

const STOP = new Set(["ve", "ile", "bir", "bu", "için", "olan", "olarak", "gibi", "daha", "çok", "arasındaki", "ilişkisi", "ilişkinin", "üzerine", "üzerindeki", "etkisi", "rolü", "incelenmesi", "değerlendirilmesi", "örneği", "bağlamında", "açısından", "yönelik", "the", "and", "of", "in", "on", "for", "with", "between", "effect", "role", "study", "analysis", "araştırma", "çalışma", "çalışmanın", "araştırmanın"]);
/** Türkçe ekleri kabaca atarak karşılaştırılabilir kök (ilk 6 harf) */
const stem = (w: string) => w.toLocaleLowerCase("tr").normalize("NFC").slice(0, 6);
const words = (s: string) => (s.match(/[\p{L}]{5,}/gu) ?? []).map((w) => w.toLocaleLowerCase("tr")).filter((w) => !STOP.has(w));

/** Çalışmanın anahtar terimleri: başlık, amaç ve araştırma sorularındaki içerik sözcükleri (kök) */
export function keyTerms(p: SpineInput): string[] {
  const src = [p.title, aimOf(p), ...researchQuestionsOf(p), ...(p.keywords ?? [])].join(" ");
  const counts = new Map<string, { n: number; word: string }>();
  for (const w of words(src)) { const k = stem(w); const c = counts.get(k); counts.set(k, { n: (c?.n ?? 0) + 1, word: c?.word ?? w }); }
  return [...counts.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 12).map(([k]) => k);
}

/** Bir metnin anahtar terimleri kapsama oranı ve eksik terimler (kök) */
export function termCoverage(text: string, terms: string[]): { share: number; missing: string[] } {
  if (!terms.length) return { share: 1, missing: [] };
  const have = new Set(words(text).map(stem));
  const missing = terms.filter((t) => !have.has(t));
  return { share: (terms.length - missing.length) / terms.length, missing };
}

/** Hipotez etiketleri (H1, H2 …) */
export function hypothesisLabels(text: string): string[] {
  return [...new Set((text.match(/\bH\s?([1-9]\d?)[a-z]?\b/g) ?? []).map((x) => x.replace(/\s/g, "")))].sort();
}
