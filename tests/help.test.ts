import { describe, expect, it } from "vitest";
import { APP_GUIDE, HELP_SYSTEM, isHelpQuestion } from "@/lib/ai/help";

describe("isHelpQuestion (D93)", () => {
  it.each([
    "Nereden grafik oluşturabilirim?",
    "grafiği nerede oluşturuyorum",
    "Çalışmamı Word olarak nasıl indiririm?",
    "Kaynakları Zotero'dan nasıl içe aktarırım?",
    "Danışmanımla nasıl paylaşabilirim projeyi?",
    "Atıf stilini nereden değiştiririm?",
    "Anket cevaplarını çalışmaya nasıl aktarırım?",
    "Where can I create a chart?",
    "How do I export my thesis to PDF?",
    "Hangi menüden istatistik analizi yapılıyor?",
    "Grafik oluşturmak istiyorum",
    "grafik oluşturabilir misin?",
    "Bu çalışma için grafik çizmek istiyorum, nasıl yapacağım?",
    "Grafiği nasıl yapabilirim",
    "grafik nerede",
    "Bulgular için anket hazırlamak istiyorum",
    "pdf olarak indirmek istiyorum",
  ])("kullanım sorusu: %s", (m) => expect(isHelpQuestion(m)).toBe(true));

  it.each([
    "Bu bölümü yazar mısın?",
    "Bu bilgiyi nereden aldın?",
    "Girişte nerede kaynak eksik?",
    "Yöntem bölümünde hangi analizi kullanmalıyım?",
    "Öz yeterlik kavramını tanımla",
    "Bu paragrafı akademik dile çevir",
    "Araştırmanın amacı nasıl olmalı?",
    "Bulguları tablodaki değerlere göre yorumla",
    "Grafikteki sonuçları akademik dille açıkla",
  ])("kullanım sorusu değil: %s", (m) => expect(isHelpQuestion(m)).toBe(false));

  it("rehber temel menüleri içerir ve uydurmayı yasaklar", () => {
    for (const k of ["Grafik oluştur", "Dışa aktar", "Literatür matrisi", "Belgeden öğren", "Word’den içe aktar", "Danışmanla paylaş"]) expect(APP_GUIDE).toContain(k);
    expect(HELP_SYSTEM).toContain("UYDURMA");
  });
});
