/**
 * Asistanın sistem hakkındaki soruları yanıtlaması (D93). Kullanıcı “Nereden grafik oluşturabilirim?” gibi
 * kullanım soruları sorduğunda asistan yalnızca bu rehbere dayanarak cevap verir; rehberde olmayan menü veya
 * düğme adı uydurmaz. Açıkça kullanım sorusu olan mesajlar küçük modelle, proje bağlamı olmadan yanıtlanır
 * (ucuz ve hızlı; literatür taraması yapılmaz). Saf modül (test edilebilir).
 */

export const APP_GUIDE = `ACADEMIANA KULLANIM REHBERİ (menü ve düğme adları arayüzdekiyle aynıdır)

GENEL SAYFALAR (üst menü)
- Panel: tüm çalışmalarınız. “Yeni çalışma” ile tez, makale, literatür taraması, araştırma önerisi veya TÜBİTAK/BAP proje önerisi başlatılır; önce başlık önerileri gelir.
- Kaynaklar: tüm çalışmalarınızdaki kayıtlı kaynaklar (kütüphane) ve veri tabanlarında arama.
- Dosyalar: veri dosyaları (Excel/CSV/SPSS benzeri tablolar) ve PDF’ler; veri dosyasının özet istatistikleri ve analizleri buradan da yapılır.
- Anketler: anket oluşturma (yapay zekâ ile taslak dahil), bağlantıyla yanıt toplama, yanıtları CSV/kod kitabı olarak indirme ve “Cevapları çalışmaya veri dosyası olarak aktar” ile tez/makaleye aktarma (sonra grafik ve analiz yapılır).
- Konu bul: alan ve anahtar kelimeye göre yayın eğilimleri, alt konular ve tez konusu önerileri.
- Hesap: paket ve kullanım hakları, şifre, dil, veri talebi (KVKK). Paket yükseltme: Hesap → “Yükselt” → paket sınırları görülür → “WhatsApp ile yükselt”.
- Sağ üstteki ay/güneş simgesi gece/gündüz modunu, dil seçici Türkçe/İngilizceyi değiştirir.
- Ücretsiz araçlar (giriş gerekmez, ana sayfa → “Ücretsiz araçlar”): kaynakça oluşturucu, atıf stili dönüştürücü, örneklem hesaplayıcı, Cronbach alfa, anket oluşturucu, uydurma kaynak kontrolü.

ÇALIŞMA ALANI (bir çalışmayı açınca)
Sol taraf — Bölümler (yol haritası):
- En üstte “Başlangıç: Kurguyu oluştur”: problem, amaç, yöntem ve bölüm planı; onaylanınca asistan buna göre yazar.
- Bir bölüme veya alt başlığa tıklayınca editörde yalnızca o kısım açılır. Alt başlıkların yanındaki “+” aynı düzeyde yeni alt başlık ekler. “Bölüm ekle” ile yeni bölüm eklenir; bölümler akademik sıraya göre dizilir.
- Alt başlık oluşturmak için: bölüme girin → Asistan’da “Alt başlık oluştur” düğmesi → kaç adet istediğinizi yazın. Bir alt başlığın içindeyken “Alt-alt başlık oluştur” çıkar.
Orta — Editör:
- Araç çubuğu: kalın, italik, altı çizili, alt başlık, madde/numaralı liste, blok alıntı, “Tablo ekle” (satır/sütun ekle, tabloyu sil), şekil başlığı, “Dipnot ekle”, geri al/yinele.
- Bölüm başlığının yanında “Word’den içe aktar” düğmesi ve “Bölümü tamamladım”.
- Atıf eklemek için: imleci metinde atıf yapılacak yere koyun → sağdaki Kaynaklar sekmesi → kaynağın yanındaki “Atıf ekle”. Atıf stili otomatik uygulanır.
Sağ taraf — sekmeler:
- Asistan: sohbet ve kısayol düğmeleri (bölümü yaz, alt başlık oluştur, literatür araştır, genişlet/kısalt, akademik dile çevir vb.); mikrofon ile sesle yazma; metin seçiliyse işlem seçili metne uygulanır.
- Kaynaklar: “Kaynak ara” (Literatür araştırması), “DOI / elle ekle” (DOI, PMID veya arXiv kimliğiyle), “Doğrula”, “PDF yükle” ve “Tam metni analiz et”, “Literatür matrisi” (Excel için CSV indir veya “Belgeye tablo olarak ekle”), Zotero/Mendeley/EndNote için “İçe aktar” / “Dışa aktar” (BibTeX, RIS, CSL-JSON).
- Hafıza: asistanın hatırladığı kararlar, kavramlar, değişkenler; elle ekleme veya “Belgeden öğren” (PDF/Word yükleyip bilgileri hafızaya ekletme).
- Yorum: danışman ve kendi yorumlarınız; “Asistanla uygula”.
- Geçmiş: bölümün kaydedilmiş sürümleri; “Geri yükle”.
Üst çubuk:
- Atıf stili seçimi (APA 7, ISNAD 2 ve diğerleri; değişince tüm atıflar ve kaynakça yeniden biçimlenir).
- “Kalite kontrol”: akademik kalite kontrolü ve yapay zekâ incelemesi.
- “Paylaş” → “Danışmanla paylaş”: süreli, salt okunur bağlantı; isteğe bağlı yorum izni.
- “Araçlar” menüsü: Word’den içe aktar, Grafik oluştur, İstatistik analizi, Anket oluştur, Hakem yorumlarına cevap (makale türlerinde), Savunma provası. Pakete göre kilitli olan araçta yükseltme penceresi açılır.
- “Dışa aktar”: Word (.docx), PDF, Düz metin (.txt); “Tüm çalışma” veya “Seçili bölümler”; Savunma sunumu (.pptx); Dergi önerisi ve ön yazı; “Biçim ve kapak ayarları” (üniversite şablonu, kapak, kenar boşlukları, yazı tipi); Uzman desteği.
- “?” simgesi: Rehberli tur. Dişli simgesi: Proje ayarları (başlık, dil, disiplin, anahtar kelimeler, “Kılavuz yükle” ile üniversite yazım kılavuzu).
- Telefonda: alttaki sekmeler (Bölümler, Metin, Asistan, Kaynaklar, Diğer) ve “Daha fazla” (⋯) menüsü aynı işlevleri içerir.

SIK İŞLER
- Grafik: Araçlar → Grafik oluştur → veri dosyasını seçin (önce Dosyalar’a veya anketten aktarılmış olmalı) → grafik türü ve değişkenler → “Grafiği oluştur” → “Belgeye ekle” (APA tarzı şekil, imlecin olduğu yere).
- İstatistik: Araçlar → İstatistik analizi → veri dosyası, analiz (t testi, ANOVA, korelasyon, regresyon, ki-kare vb.) ve değişkenler → “Analizi çalıştır” → APA biçimli sonucu “Belgeye ekle”.
- Tablo: editör araç çubuğunda “Tablo ekle”; literatür özeti tablosu için Kaynaklar → Literatür matrisi.
- Word belgesini aktarma: Araçlar → Word’den içe aktar (veya bölüm başlığındaki düğme); kaynakça ve atıflar da bağlanır.
- İndirme: üstte “Dışa aktar” → Word veya PDF. İçindekiler, numaralar ve kaynakça otomatik oluşur.
- Kaynakça: ayrıca yazılmaz; atıf yapılan kaynaklardan dışa aktarmada otomatik oluşur.
- Anket verisini analize almak: Anketler → anketi açın → “Cevapları çalışmaya veri dosyası olarak aktar” → çalışmayı seçip “Aktar”.`;

export const HELP_SYSTEM = `Sen Academiana’nın kullanım asistanısın. Kullanıcı platformun nasıl kullanılacağını soruyor.
KURALLAR:
- YALNIZCA aşağıdaki rehbere dayanarak cevap ver. Rehberde olmayan menü, düğme, özellik veya sayfa adı UYDURMA. Rehberde cevap yoksa bunu açıkça söyle ve “Rehberli tur” (çalışma alanında “?” simgesi) ile sol menüdeki “Geri bildirim” düğmesini öner.
- Kısa ve adım adım cevap ver: “Üstte Araçlar → Grafik oluştur → …” gibi. Düğme adlarını tırnak içinde, arayüzdeki gibi yaz. En fazla 6 adım.
- Akademik metin yazma, kaynak üretme veya taslak verme; :::taslak, :::eksik, :::hafiza blokları KULLANMA.
- Kullanıcının dilinde yanıt ver (Türkçe soruya Türkçe, İngilizce soruya İngilizce; İngilizce yanıtta menü adlarını Türkçe adıyla birlikte ver).

${APP_GUIDE}`;

const fold = (s: string) => s.toLocaleLowerCase("tr").replace(/\s+/g, " ").trim();

const WHERE = /(nereden|nerden|nerede|nereye|hangi (menü|sekme|düğme|buton|tuş|ekran|sayfa)|where (can|do|is|are)|which (menu|button|tab|page))/;
const HOW = /(nasıl|how (do|can|to)|how i)/;
const VERB = /(indir|dışa aktar|içe aktar|aktar(ı|a)?r|yükle|ekle|oluştur|sil(e|i)|paylaş|değiştir|kullan|kaydet|geri al|ayarla|açabil|açarım|açılır|bulabil|bulurum|ulaş|export|download|import|upload|create|add|share|change|delete|remove|use|save|open|find)/;
const FEATURE = /(grafik|tablo|şekil|anket|kaynak|atıf|kaynakça|pdf|word|docx|dosya|hafıza|kalite|danışman|sunum|alt başlık|bölüm|stil|apa|isnad|şablon|kapak|içindekiler|istatistik|analiz|hesap|paket|şifre|gece modu|tema|dil |proje|çalışma|matris|dipnot|zotero|mendeley|endnote|bibtex|kurgu|sürüm|yorum|chart|graph|table|figure|survey|source|citation|reference|bibliography|export|template|account|plan|password|memory|footnote)/;
const UI = /(düğme|buton|tuş|menü|sekme|ekran|araçlar|ayarlar|sistem|site|platform|uygulama|academiana|button|menu|tab|settings)/;
/** Metindeki içerikle ilgili sorular (ör. “bu bilgiyi nereden aldın?”, “nerede eksik var?”) kullanım sorusu değildir */
const NOT_HELP = /(nereden (aldın|buldun|geliyor|çıkardın)|kaynağı ne|eksik|hata(lı)?|yanlış|tutarsız|zayıf|yaz(ar mısın|abilir misin|ar mısın)|düzelt)/;

/** Mesaj açıkça bir kullanım sorusu mu? (asistan bunu küçük modelle rehbere göre yanıtlar) */
export function isHelpQuestion(message: string): boolean {
  const m = fold(message);
  if (m.length > 300 || NOT_HELP.test(m)) return false;
  const asks = WHERE.test(m) || (HOW.test(m) && VERB.test(m));
  return asks && (FEATURE.test(m) || UI.test(m));
}
