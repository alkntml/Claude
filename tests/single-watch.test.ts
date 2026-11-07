import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { minhash, normName, similarity, SIG_SIZE } from "@/lib/fingerprint";
import { exportPlainText, isOffTopic, topicTerms } from "@/lib/single-watch";

const para = (n: number, seed: string) => Array.from({ length: n }, (_, i) => `${seed} cümlesi ${i} öğretmenlerin öz yeterlik algısı ile tükenmişlik düzeyleri arasındaki ilişki incelenmiştir`).join(". ");

describe("Tek Proje gözetimi (D109)", () => {
  it("parmak izi: aynı metin 1, küçük düzeltme yüksek, bambaşka metin düşük benzerlik verir", () => {
    const a = para(300, "birinci");
    const sig = minhash(a);
    expect(sig).toHaveLength(SIG_SIZE);
    expect(sig.every((v) => Number.isInteger(v) && v >= -(2 ** 31) && v < 2 ** 31)).toBe(true);
    expect(similarity(sig, minhash(a))).toBe(1);
    const edited = a.replace("birinci cümlesi 5", "değiştirilmiş cümle 5").replace("birinci cümlesi 120", "yeni ifade 120");
    expect(similarity(sig, minhash(edited))).toBeGreaterThan(0.8);
    const other = Array.from({ length: 300 }, (_, i) => `yapay zekâ destekli kanser tanısında derin öğrenme modelleri ${i} görüntü sınıflandırma başarımı`).join(". ");
    expect(similarity(sig, minhash(other))).toBeLessThan(0.3);
  });
  it("kapak karşılaştırması büyük-küçük harf ve noktalama farkını yok sayar", () => {
    expect(normName("Prof. Dr. Ayşe YILMAZ")).toBe(normName("prof dr ayşe yılmaz"));
    expect(normName("Ankara Üniversitesi")).not.toBe(normName("Hacettepe Üniversitesi"));
  });
  it("konu dışı metin: konu terimi hiç geçmeyen uzun çıktı işaretlenir, ekli Türkçe kelimeler eşleşir", () => {
    const terms = topicTerms({ title: "Öğretmenlerin öz yeterlik algısı ve tükenmişlik", keywords: ["mesleki doyum"] });
    expect(terms.size).toBeGreaterThanOrEqual(3);
    const onTopic = Array.from({ length: 200 }, () => "Katılımcı öğretmenlerden toplanan verilere göre tükenmişliğin alt boyutları").join(" ");
    expect(isOffTopic(onTopic, terms)).toBe(false);
    const offTopic = Array.from({ length: 200 }, () => "Derin öğrenme modelleri görüntü sınıflandırmada yüksek başarı gösterdi").join(" ");
    expect(isOffTopic(offTopic, terms)).toBe(true);
    // Kısa metin veya az terimli konu işaretlenmez (yanlış alarm önlemi)
    expect(isOffTopic("Derin öğrenme modelleri", terms)).toBe(false);
    expect(isOffTopic(offTopic, topicTerms({ title: "Bir araştırma" }))).toBe(false);
  });
  it("dışa aktarma metni başlık, paragraf, tablo ve başlıklardan oluşur", () => {
    const text = exportPlainText({ blocks: [
      { kind: "heading", level: 1, number: "1", runs: [{ text: "Giriş" }] },
      { kind: "paragraph", runs: [{ text: "Metin" }, { text: "", footnote: "dipnot" }] },
      { kind: "caption", lines: [[{ text: "Tablo 1" }], [{ text: "Başlık" }]], align: "left" },
      { kind: "table", rows: [[[{ text: "a" }], [{ text: "b" }]]], header: true },
    ] } as never);
    expect(text).toContain("Giriş");
    expect(text).toContain("Metin");
    expect(text).toContain("Tablo 1 Başlık");
    expect(text).toContain("a b");
    expect(text).not.toContain("dipnot");
  });
});
