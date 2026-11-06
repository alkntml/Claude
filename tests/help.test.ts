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

import { APP_GUIDE_SHORT } from "@/lib/ai/help";
import { FALLBACK_PLANS } from "@/lib/plans-fallback";

describe("paket vaatleri ve kısa rehber (D96)", () => {
  it("ana asistana giden kısa rehber tam rehberin küçük bir kısmı ve temel menüleri içerir", () => {
    expect(APP_GUIDE_SHORT.length).toBeLessThan(APP_GUIDE.length / 5);
    for (const k of ["Grafik oluştur", "Dışa aktar", "Dosyalarım", "Kaynak ara"]) expect(APP_GUIDE_SHORT).toContain(k);
  });
  it("paket kartları aylık sayfa vaadini içerir; belirsiz ve sayısal tarama ifadeleri yok", () => {
    const f = Object.fromEntries(FALLBACK_PLANS.map((p) => [p.id, p.features.join(" | ")]));
    expect(f.free).toContain("5 sayfa");
    expect(f.basic).toContain("25 sayfa");
    expect(f.pro).toContain("50 sayfa");
    expect(f.premium).toContain("85 sayfa");
    expect(f.pro + f.premium).not.toMatch(/2\.000|8\.000|En yüksek yapay zekâ/);
    expect(f.pro).toContain("Sınırsız kaynak taraması (adil kullanım)");
  });
  it("rehber paket başına sayfa bilgisini verir", () => expect(APP_GUIDE).toContain("Premium 85 sayfa"));
});
