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
    "Şifremi nereden değiştirebilirim?",
    "Dipnot nasıl eklerim?",
    "Danışmanıma nasıl gönderirim, paylaş düğmesi nerede?",
    "Eski sürüme nasıl geri dönerim?",
    "Hesabımı nasıl silerim?",
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

describe("rehber kapsamı (D93)", () => {
  it.each([
    "Yeni çalışma", "Kontrol paneli", "Kaynak araştırması", "Dosyalarım", "Anketlerim", "Konu bulma", "Hesap ve abonelik",
    "Şifremi değiştir", "Şifremi unuttum", "Verilerimi indir", "Hesabımı sil", "Davet et, kazan", "Kurum kodu",
    "Kurguyu onayla ve başla", "Haftalık hedef ve teslim tarihi belirle", "Bölüm ekle", "Dipnot ekle", "Tablo ekle",
    "Kaynakta doğrula", "Kaynak bul ve düzelt", "Bölümü tamamladım", "Seçili bölümler", "Biçim ve kapak ayarları",
    "Savunma sunumu (.pptx)", "Savunma provası", "Hakem yorumlarına cevap", "Dergi önerisi ve ön yazı", "Kılavuz yükle",
    "Rehberli tur", "Projeyi sil", "Geri yükle", "Ücretsiz araçlar", "Yayına al", "Ham veri (CSV)", "Bu konuyla tez başlat",
  ])("“%s” rehberde", (k) => expect(APP_GUIDE).toContain(k));
  it("yönetim paneli anlatılmaz", () => {
    expect(APP_GUIDE).not.toMatch(/Yönetim|yonetim|Otomatik çalışma/);
    expect(HELP_SYSTEM).toContain("yöneticiye özel");
  });
});
