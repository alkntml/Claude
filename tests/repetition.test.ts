import { describe, expect, it } from "vitest";
import { analyzeRepetition, avoidListForPrompt, isRepetitive } from "@/lib/quality/repetition";

const REPETITIVE = [
  "Bu bağlamda lityum iyon bataryaların kapasite kaybı önemli bir rol oynamaktadır.",
  "Bu bağlamda katot malzemesinin seçimi önemli bir rol oynamaktadır.",
  "Bu bağlamda elektrolit katkı maddeleri de önemli bir rol oynamaktadır.",
  "Bu bağlamda sıcaklık yönetimi batarya ömrü açısından önemli bir rol oynamaktadır.",
  "Anot yüzeyinde oluşan katı elektrolit ara fazı zamanla kalınlaşarak kapasite kaybına yol açmaktadır.",
  "Anot yüzeyinde oluşan katı elektrolit ara fazı zamanla kalınlaşarak kapasite kaybına neden olmaktadır.",
].join(" ");

const VARIED = [
  "Lityum iyon hücrelerde kapasite kaybı birden fazla mekanizmanın ortak sonucudur.",
  "Katot kimyası, özellikle nikel oranı, enerji yoğunluğu ile çevrim ömrü arasında bir denge kurar.",
  "Elektrolit katkı maddeleri ara faz katmanının kararlılığını artırabilir.",
  "Yüksek sıcaklıklar yan tepkimeleri hızlandırırken düşük sıcaklıklar lityum kaplamasına zemin hazırlar.",
  "Grafit anotlarda hacim değişimi sınırlıdır; silisyum katkısı ise kapasiteyi artırsa da mekanik gerilmeyi büyütür.",
].join(" ");

describe("tekrar analizi", () => {
  it("tekrarlı metni yakalar: geçiş ifadesi, kalıp yüklem, benzer cümle", () => {
    const r = analyzeRepetition(REPETITIVE);
    expect(r.openers[0]).toEqual({ opener: "bu bağlamda", count: 4 });
    expect(r.phrases.some((p) => p.phrase.includes("önemli bir rol oynamaktadır"))).toBe(true);
    expect(r.nearDuplicates.length).toBeGreaterThanOrEqual(1);
    expect(isRepetitive(r)).toBe(true);
    expect(avoidListForPrompt(r).join(" ")).toContain("bu bağlamda");
  });
  it("çeşitli metni temiz sayar", () => {
    const r = analyzeRepetition(VARIED);
    expect(isRepetitive(r)).toBe(false);
    expect(r.nearDuplicates).toHaveLength(0);
  });
  it("konunun anahtar terimleri tekrar sayılmaz", () => {
    const text = Array(5).fill("Elektrikli araç bataryalarının ömrü farklı koşullarda incelenmiştir.").map((s, i) => s.replace("farklı", ["soğuk", "sıcak", "nemli", "kuru", "değişken"][i])).join(" ");
    const r = analyzeRepetition(text, { keepTerms: ["elektrikli araç bataryalarının ömrü"] });
    expect(r.phrases.find((p) => p.phrase.startsWith("elektrikli araç"))).toBeUndefined();
  });
  it("atıf işaretleri kelime sayılmaz", () => {
    const r = analyzeRepetition("Kapasite azalır [[kaynak:S1]]. Kapasite azalır [[kaynak:S1]]. Kapasite azalır [[kaynak:S1]].");
    expect(r.phrases.some((p) => p.phrase.includes("kaynak"))).toBe(false);
  });
});
