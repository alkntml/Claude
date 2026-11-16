import { describe, expect, it } from "vitest";
import { detectPrintedPages, resolvePageLabels } from "@/lib/sources/pages";

describe("Basılı sayfa numarası tespiti (D222)", () => {
  const page = (head: string, body: string, foot: string) => `${head}\n${body}\nsatır iki\nsatır üç\nsatır dört\n${foot}`;
  it("künyesiz dergi makalesinde basılı numaraları bulur; numarasız ilk sayfayı sıradan doldurur", () => {
    const raw = Array.from({ length: 12 }, (_, i) => page(i === 0 ? "Cilt 2, Sayı 1, 2024 • ss. 101-112" : "Dergi Adı 2024, 2(1)", "Metin (Yazar, 2019: 45).", i === 0 ? "Lisans: CC BY 4.0" : String(101 + i)));
    const got = detectPrintedPages(raw)!;
    expect(got[0]).toBe("101");
    expect(got[11]).toBe("112");
    expect(resolvePageLabels(null, 12, got)[5]).toBe("106");
  });
  it("künyedeki aralık yanlışsa PDF’e basılı numara kullanılır", () => {
    const raw = Array.from({ length: 10 }, (_, i) => page("Başlık", "metin", String(231 + i)));
    expect(resolvePageLabels("1359-1374", 10, detectPrintedPages(raw))[0]).toBe("231");
  });
  it("ekte yeniden başlayan numarayı tanır; kaynakçadaki ardışık yıllar karışmaz", () => {
    const raw = [
      ...Array.from({ length: 8 }, (_, i) => page("Makale", "metin", String(i + 1))),
      ...Array.from({ length: 4 }, (_, i) => page("Kaynakça", `Yazar (${2010 + i}). Başlık.`, `Diğer (${2011 + i}).`)),
      ...Array.from({ length: 5 }, (_, i) => page("Ek", "ek metin", String(i + 1))),
    ];
    const got = detectPrintedPages(raw)!;
    expect(got.slice(0, 8)).toEqual(Array.from({ length: 8 }, (_, i) => String(i + 1)));
    // numarasız kaynakça sayfaları iki farklı numaralandırmanın arasında: tahmin edilmez
    expect(got.slice(8, 12)).toEqual([null, null, null, null]);
    expect(got.slice(12)).toEqual(["1", "2", "3", "4", "5"]);
  });
  it("güvenilir ardışıklık yoksa null döner; künye de yoksa PDF sırası kullanılır", () => {
    const raw = Array.from({ length: 6 }, () => page("Başlık", "Tablo 3, %45, 2021", "Sonuç"));
    expect(detectPrintedPages(raw)).toBeNull();
    expect(resolvePageLabels(null, 6, null)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(resolvePageLabels("10-12", 6, null)).toEqual([null, null, null, null, null, null]);
  });
});
