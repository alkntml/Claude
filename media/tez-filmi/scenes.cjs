const TOPIC = "Üniversite öğrencilerinde akıllı telefon bağımlılığı, akademik erteleme ve uyku kalitesi arasındaki ilişkiler";
async function openStage(pg, d, title) {
  const pt = await pg.evaluate((title) => {
    const els = [...document.querySelectorAll("button, a, li, div")].filter((e) => { const r = e.getBoundingClientRect(); return r.left < 280 && r.width > 0 && r.height > 0 && r.height < 80 && (e.textContent || "").includes(title); });
    els.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height);
    const e = els[0]; if (!e) return null;
    e.scrollIntoView({ block: "center" }); const r = e.getBoundingClientRect(); return [r.left + Math.min(r.width / 2, 120), r.top + r.height / 2];
  }, title);
  if (!pt) throw new Error("stage not found: " + title);
  await d.f("move", pt[0], pt[1]); await d.w(650); await d.f("click"); await pg.mouse.click(pt[0], pt[1]);
  await pg.waitForTimeout(700);
}
async function review(pg, d) {
  const prev = await pg.evaluate(() => document.getElementById("film-cap")?.innerHTML ?? "");
  await d.cap("Bölüm kontrolü", "Bölüm tamamlanınca kontrol edilir: kaynak işaretleri, tekrarlar, amaca uygunluk.");
  await d.click(d.btn("Bölümü tamamladım"));
  await pg.waitForFunction(() => /Tamamla ve sıradakine geç/.test(document.body.innerText), null, { timeout: 20000 });
  await d.w(3800);
  await d.click(d.btn("Tamamla ve sıradakine geç"));
  await pg.waitForTimeout(800);
  await pg.evaluate((h) => { const c = document.getElementById("film-cap"); if (c) c.innerHTML = h; }, prev);
}
async function writeStage(pg, d, title, prompt, opts = {}) {
  if (title) await openStage(pg, d, title);
  if (!(await pg.locator('button[aria-label="Asistan"]').filter({ visible: true }).first().getAttribute("aria-selected").catch(() => null))) {}
  await d.click(pg.locator('button[aria-label="Asistan"],button[title="Asistan"]'));
  const ta = pg.locator("textarea").filter({ visible: true }).last();
  await d.type(ta, prompt, { delay: 30 });
  await pg.keyboard.press("Enter");
  await pg.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => /Belgeye ekle/.test(b.textContent || "") && !b.disabled), null, { timeout: 120000 });
  await d.w(opts.read ?? 1500);
  await d.click(d.btn(/Belgeye ekle/).last());
  await pg.waitForTimeout(900);
  if (opts.review) await review(pg, d);
}
const V = { screen: "Ekran süresi (saat)", dep: "Akıllı telefon bağımlılığı", proc: "Akademik erteleme", sleep: "Uyku kalitesi (PUKİ)" };
async function tool(pg, d, name) {
  await d.click(d.btn("Araçlar", true));
  await pg.waitForTimeout(400);
  await d.click(d.btn(new RegExp("^" + name)));
  await pg.waitForTimeout(1000);
}
async function pickSelect(pg, d, dlg, labelText, option) {
  const sel = dlg.locator("label").filter({ hasText: labelText }).locator("select").first();
  await d.click(sel); await sel.selectOption({ label: option }); await d.w(500);
}
async function chips(pg, d, dlg, names) { for (const n of names) await d.click(dlg.getByRole("button", { name: n, exact: true }), { wait: 300, after: 200 }); }
async function analysis(pg, d, kind, setup, read = 3000) {
  await tool(pg, d, "İstatistik analizi");
  const dlg = pg.getByRole("dialog");
  await pg.waitForFunction(() => !/Değişkenler okunuyor/.test(document.body.innerText));
  await pickSelect(pg, d, dlg, "Analiz", kind);
  await setup(dlg);
  await d.click(dlg.getByRole("button", { name: "Analizi çalıştır" }));
  await dlg.getByRole("button", { name: "Belgeye ekle" }).waitFor({ timeout: 20000 });
  await d.f("move", 800, 600); await pg.mouse.move(800, 600);
  await pg.mouse.wheel(0, 500); await d.w(read);
  await d.click(dlg.getByRole("button", { name: "Belgeye ekle" }));
  await pg.waitForTimeout(900);
}
async function chart(pg, d, kind, setup, title) {
  await tool(pg, d, "Grafik oluştur");
  const dlg = pg.getByRole("dialog");
  await pg.waitForTimeout(800);
  await pickSelect(pg, d, dlg, "Grafik türü", kind);
  await setup(dlg);
  await d.click(dlg.getByRole("button", { name: "Grafiği oluştur" }));
  await dlg.getByRole("button", { name: "Belgeye ekle" }).waitFor({ timeout: 20000 });
  const t = dlg.locator("label").filter({ hasText: "Şekil başlığı" }).locator("input");
  await d.type(t, title, { clear: true, delay: 25 });
  await d.w(2500);
  await d.click(dlg.getByRole("button", { name: "Belgeye ekle" }));
  await pg.waitForTimeout(1500);
}
module.exports.scenes = [
  ["wizard", async (pg, d) => {
    await d.f("card", "Academiana · canlı kayıt", "Bir nicel tez, baştan sona", "Her adım sitenin kendi ekranlarında, sırayla yapılır. İstatistik, grafik, atıf ve kalite hesapları sitenin motorlarıyla anında çalışır. Kaynaklar, veri ve yapay zekâ yanıtları film için hazırlanmıştır.");
    await d.w(5500); await d.f("card", "", "", ""); await d.w(900);
    await d.cap("1 · Yeni çalışma", "Boş bir hesapla başlıyoruz: yüksek lisans tezi, nicel araştırma.");
    await d.click(pg.getByRole("link", { name: "Yeni çalışma" }).first());
    await d.click(d.txt("Tez hazırlama", true));
    await d.click(d.btn("Devam"));
    await d.click(d.btn("Yüksek lisans", true));
    await d.click(d.btn("Nicel", true));
    await d.click(pg.locator("select").first()); await pg.locator("select").first().selectOption({ label: "İlişkisel tarama / korelasyonel desen" }); await d.w(400);
    await d.type(pg.getByPlaceholder("ör. Klinik Psikoloji"), "Eğitim Bilimleri / Rehberlik ve Psikolojik Danışmanlık");
    await d.type(pg.getByPlaceholder("ör. Hacettepe Üniversitesi"), "Örnek Üniversitesi");
    await d.snap("profil");
    await d.click(d.btn("Devam"));
    await pg.waitForTimeout(900);
    await d.type(pg.getByPlaceholder(/ör. Kişilik özellikleri/), TOPIC);
    await d.type(pg.getByPlaceholder(/ilişki odaklı OKB/), "akıllı telefon bağımlılığı, akademik erteleme, uyku kalitesi, üniversite öğrencileri");
    await d.snap("arastirma");
    await d.click(d.btn("Devam")); await pg.waitForTimeout(900);
    await d.click(d.btn("Son 10 yıl", true));
    await d.click(d.btn("20+", true));
    await d.snap("kaynak");
    await d.click(d.btn("Devam")); await pg.waitForTimeout(900);
    await d.click(d.btn(/Standart bölümler/));
    await d.snap("yapi");
    await d.click(d.btn("Yazmaya başla")); await pg.waitForTimeout(2500);
  }],
  ["kurgu", async (pg, d) => {
    await d.cap("2 · Kurgu", "Fikrini iki cümleyle yaz; yapay zekâ problem, amaç, yöntem ve bölüm planını çıkarsın. (Film kısa olsun diye hedef 3.100 kelime.)");
    await d.type(pg.getByPlaceholder(/Lise öğretmenleriyle/), "Bir devlet üniversitesinde her sınıftan öğrencilere çevrim içi anket uygulayacağım. Akıllı telefon bağımlılığı ve akademik ertelemenin, ekran süresi kontrol edildiğinde uyku kalitesini yordayıp yordamadığını görmek istiyorum.", { delay: 22 });
    await d.type(pg.getByPlaceholder("ör. 25000"), "3100");
    await d.click(d.btn("Kurguyu yapay zekâ ile oluştur"));
    await pg.waitForTimeout(3500);
    await d.snap("kurgu");
    await pg.mouse.move(560, 500); await d.f("move", 560, 500);
    for (let i = 0; i < 5; i++) { await pg.mouse.wheel(0, 420); await d.w(900); }
    await d.click(d.btn(/Kurguyu onayla ve başla/));
    await pg.waitForTimeout(1500);
  }],
  ["baslik", async (pg, d) => {
    await d.cap("3 · Başlık", "Kurguya göre başlık önerileri geldi. Her birinin gerekçesi var; biri seçilip düzenlenebilir.");
    await d.move(d.btn(/Ekranın Ötesinde/), { wait: 1400 });
    await d.click(d.btn(/^Üniversite Öğrencilerinde Akıllı Telefon Bağımlılığı, Akademik/));
    await d.w(800);
    await d.click(d.btn("Bu başlıkla devam et"));
    await pg.waitForTimeout(1200);
  }],
  ["kaynak", async (pg, d) => {
    await d.cap("4 · Kaynak araması", "Kaynaklar uydurulmaz: yedi veri tabanında aranır, künyeler kütüphaneye eklenir.");
    await d.click(pg.locator(`button[aria-label="Kaynaklar"],button[title="Kaynaklar"]`));
    await pg.waitForTimeout(800);
    await d.click(d.btn("Veri tabanında ara"));
    await pg.waitForTimeout(600);
    await d.type(pg.getByPlaceholder("Konu, kavram veya başlık ara…"), "akıllı telefon bağımlılığı akademik erteleme uyku");
    await d.click(d.btn("Ara", true));
    await pg.waitForTimeout(2000);
    const addAll = async (n) => { for (let i = 0; i < n; i++) { const b = d.btn("Projeye ekle").nth(i); await pg.waitForFunction(() => ![...document.querySelectorAll("button")].some((x) => x.disabled && /Projeye ekle/.test(x.textContent || "") && x.querySelector(".animate-spin"))); await d.click(b, { wait: 380, after: 700 }); } await pg.waitForTimeout(700); };
    await addAll(9);
    await d.cap("4 · Kaynak araması", "Ölçek ve yöntem kaynakları için ikinci arama. Erişim düzeyi her kaynakta açıkça yazar: künye, özet veya tam metin.");
    await d.type(pg.getByPlaceholder("Konu, kavram veya başlık ara…"), "ölçek uyarlama geçerlik güvenirlik yöntem", { clear: true });
    await d.click(d.btn("Ara", true));
    await pg.waitForTimeout(1800);
    await addAll(5);
    await d.click(d.btn(/Projedeki kaynaklar/));
    await pg.waitForTimeout(800);
    await d.snap("liste");
  }],
  ["sor", async (pg, d) => {
    await d.cap("5 · Kaynağa sor", "Tam metni okunan bir kaynağa soru sorulur; cevap sayfa numaralı kanıtla gelir.");
    const card = pg.locator("div").filter({ has: pg.getByText("Akademik erteleme: Kavramsal bir çözümleme", { exact: true }) }).filter({ has: d.btn("Sor", true) }).last();
    await d.click(card.getByRole("button", { name: "Sor", exact: true }));
    await pg.waitForTimeout(800);
    await d.click(d.btn("Kavram tanımları", true));
    await pg.waitForTimeout(2200);
    await d.click(d.btn(/Dayandığı yerler/));
    await d.w(2600);
    await d.snap("sor");
    await d.click(pg.getByRole("dialog").getByRole("button", { name: "Kapat" }));
  }],
  ["matris", async (pg, d) => {
    await d.cap("6 · Literatür matrisi", "Her kaynağın amacı, yöntemi, örneklemi ve bulguları tek tabloda; tabloya neyin okunarak yazıldığı da belli.");
    await d.click(d.btn("Literatür matrisi"));
    await pg.waitForTimeout(2500);
    await d.click(d.btn(/Eksik \d+ kaynağı özetle/));
    await pg.waitForTimeout(6000);
    await d.f("move", 800, 500); await pg.mouse.move(800, 500);
    for (let i = 0; i < 3; i++) { await pg.mouse.wheel(0, 300); await d.w(800); }
    await d.snap("matris");
    await d.click(pg.getByRole("dialog").getByRole("button", { name: "Kapat" }));
  }],
  ["harita", async (pg, d) => {
    await d.cap("7 · Literatür haritası", "Kaynakların atıf ağı: konu kümeleri, merkezdeki çalışmalar ve eksik kalan temel eserler.");
    await d.click(d.btn("Araçlar", true));
    await pg.waitForTimeout(600);
    await d.click(d.btn(/^Literatür haritası/));
    await pg.waitForTimeout(3500);
    await d.click(pg.getByRole("dialog").getByText("Konu haritası")); await d.w(2500);
    await d.click(pg.getByRole("dialog").getByText("Eksik temel çalışmalar")); await d.w(2500);
    await d.click(pg.getByRole("dialog").getByRole("button", { name: "Kapat" }));
  }],
  ["konu", async (pg, d) => {
    await d.cap("8 · Bölüm yazımı", "Her bölümde asistana ne istediğini yaz. Metin kurguya ve yalnızca kütüphanedeki kaynaklara dayanır.");
    await writeStage(pg, d, "Araştırma konusu", "Kurguya göre araştırma konusunu ve neden seçildiğini yaz.");
  }],
  ["giris", async (pg, d) => {
    await d.cap("8 · Giriş bölümleri", "Problem, amaç ve önem: atıflar metne gerçek atıf olarak girer, kaynakça kendiliğinden oluşur.");
    await writeStage(pg, d, "Araştırma proble", "Problem durumunu yaz; üç değişkenin ilişkisini kaynaklarla temellendir ve problem cümlesiyle bitir.", { review: true });
    await writeStage(pg, d, "Araştırmanın ama", "Genel amacı ve araştırmanın önemini yaz.");
    await d.cap("8 · Hipotezler", "Hipotezler kurgudaki sorulardan türetilir; her biri bir analizle eşleşecek.");
    await writeStage(pg, d, "Araştırma soruları", "Kurgudaki sorulara göre sınanabilir hipotezler yaz.");
    await writeStage(pg, d, "Kapsam, varsayım", "Varsayımları, sınırlılıkları ve tanımları yaz.");
  }],
  ["kuram", async (pg, d) => {
    await d.cap("9 · Kuram ve literatür", "Literatür kaynak kaynak özetlenmez; temalara göre sentezlenir.");
    await writeStage(pg, d, "Kavramsal çer", "Üç temel kavramı tanımla.");
    await writeStage(pg, d, "Kuramsal çer", "Öz düzenleme yaklaşımını kuramsal çerçeve olarak yaz.");
    await writeStage(pg, d, "Literatür tara", "Kaynakları temalara göre sentezle; uyuşan ve ayrışan bulguları göster.");
    await writeStage(pg, d, "Boşluklar", "Literatürdeki boşlukları ve bu çalışmanın katkısını yaz.");
  }],
  ["yontem", async (pg, d) => {
    await d.cap("10 · Yöntem", "Desen, örneklem, güç analizi, ölçekler ve analiz planı: her karar gerekçesiyle.");
    await writeStage(pg, d, "Araştırmanın yön", "Araştırma modelini ve neden seçildiğini yaz.");
    await writeStage(pg, d, "Evren ve örnek", "Evren, örneklem, güç analizi ve katılımcı özelliklerini yaz.");
    await writeStage(pg, d, "Veri toplama", "Kişisel bilgi formunu ve üç ölçeği tanıt.");
    await writeStage(pg, d, "Veri analizi", "Varsayım kontrollerini ve hangi hipotezin hangi analizle sınanacağını yaz.");
    await writeStage(pg, d, "Etik ilkeler", "Etik kurul, izinler ve gizlilik bölümünü yaz.");
  }],
  ["veri", async (pg, d) => {
    await d.cap("11 · Veri", "Anket bitti: 384 öğrencinin yanıtları CSV olarak yükleniyor. (Veri kurgusaldır.)");
    await d.click(pg.getByRole("link", { name: "Panele dön" }));
    await pg.waitForTimeout(900);
    await d.click(pg.getByRole("link", { name: "Dosyalarım" }));
    await pg.waitForTimeout(900);
    const [fc] = await Promise.all([pg.waitForEvent("filechooser"), d.click(pg.getByText("Dosyaları sürükleyip bırakın veya seçin"))]);
    await fc.setFiles(__dirname + "/veri.csv");
    await pg.waitForTimeout(2500);
    await d.cap("11 · Veri", "Yükleme anında 384 satır ve 21 değişken okunur; betimsel özet kendiliğinden çıkar.");
    await d.click(d.btn("İstatistik", true));
    await pg.waitForTimeout(1200);
    await d.f("move", 800, 500); await pg.mouse.move(800, 500);
    for (let i = 0; i < 3; i++) { await pg.mouse.wheel(0, 350); await d.w(1300); }
    await d.snap("ozet");
    await d.click(pg.getByRole("dialog").getByRole("button", { name: "Kapat" }));
    await d.click(pg.getByRole("link", { name: "Kontrol paneli" }));
    await pg.waitForTimeout(900);
    await d.click(pg.getByText(/^Üniversite Öğrencilerinde Akıllı Telefon Bağımlılığı/).first());
    await pg.waitForTimeout(1500);
  }],
  ["guvenirlik", async (pg, d) => {
    await d.cap("12 · Güvenirlik", "Cronbach alfa sitenin istatistik motoruyla hesaplanır; yapay zekâ sayı üretmez.");
    await openStage(pg, d, "Veri toplama");
    await analysis(pg, d, "Güvenirlik (Cronbach alfa)", async (dlg) => {
      await chips(pg, d, dlg, ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10"]);
      await d.type(dlg.locator("label").filter({ hasText: "Ölçek adı" }).locator("input"), "Akıllı Telefon Bağımlılığı Ölçeği");
    });
    await analysis(pg, d, "Güvenirlik (Cronbach alfa)", async (dlg) => {
      await chips(pg, d, dlg, ["E1", "E2", "E3", "E4", "E5"]);
      await d.type(dlg.locator("label").filter({ hasText: "Ölçek adı" }).locator("input"), "Akademik Erteleme Ölçeği");
    });
    await d.snap("alfa");
  }],
  ["bulgular", async (pg, d) => {
    await d.cap("13 · Bulgular", "Betimsel istatistikler ve normallik: tablo APA biçiminde, numarasıyla belgeye girer.");
    await openStage(pg, d, "Bulgular");
    await analysis(pg, d, "Betimsel istatistikler ve normallik", async (dlg) => { await chips(pg, d, dlg, [V.screen, V.dep, V.proc, V.sleep]); });
    await d.cap("13 · Bulgular", "H1–H3: Pearson korelasyonu. Anlamlılık yıldızları ve df otomatik.");
    await analysis(pg, d, "Korelasyon analizi", async (dlg) => { await chips(pg, d, dlg, [V.screen, V.dep, V.proc, V.sleep]); });
    await d.cap("13 · Bulgular", "H4: Çoklu doğrusal regresyon — ekran süresi kontrol değişkeni.");
    await analysis(pg, d, "Doğrusal regresyon", async (dlg) => { await pickSelect(pg, d, dlg, "Bağımlı değişken", V.sleep); await chips(pg, d, dlg, [V.dep, V.proc, V.screen]); });
    await d.cap("13 · Bulgular", "H4’ün şekli: bağımlılık ve uyku kalitesi, regresyon doğrusuyla.");
    await chart(pg, d, "Saçılım grafiği", async (dlg) => { await pickSelect(pg, d, dlg, "Yatay eksen", V.dep); await pickSelect(pg, d, dlg, "Dikey eksen", V.sleep); }, "Akıllı telefon bağımlılığı ile PUKİ puanları arasındaki ilişki");
    await d.cap("13 · Bulgular", "H5: Cinsiyete göre bağımsız örneklemler t testi; Cohen d ve güven aralığıyla.");
    await analysis(pg, d, "Bağımsız örneklemler t testi", async (dlg) => { await pickSelect(pg, d, dlg, "Bağımlı değişken", V.dep); await pickSelect(pg, d, dlg, "Gruplama", "Cinsiyet"); });
    await d.cap("13 · Bulgular", "H6: Sınıf düzeyine göre tek yönlü ANOVA ve grafiği.");
    await analysis(pg, d, "Tek yönlü varyans analizi (ANOVA)", async (dlg) => { await pickSelect(pg, d, dlg, "Bağımlı değişken", V.proc); await pickSelect(pg, d, dlg, "Gruplama", "Sınıf"); });
    await chart(pg, d, "Gruplara göre ortalama (sütun grafiği)", async (dlg) => { await pickSelect(pg, d, dlg, "Bağımlı değişken", V.proc); await pickSelect(pg, d, dlg, "Gruplama", "Sınıf"); }, "Sınıf düzeyine göre akademik erteleme ortalamaları");
    await d.cap("13 · Bulgular", "Tablolar hazır. Asistan bu sayıları yorumlar; yeni sayı uydurmaz.");
    await writeStage(pg, d, null, "Eklediğim analiz çıktılarını hipotez sırasıyla yorumla.");
    await d.snap("bulgular");
  }],
  ["tartisma", async (pg, d) => {
    await d.cap("14 · Tartışma ve sonuç", "Her bulgu ilgili hipotez ve literatürle karşılaştırılır; kuramsal çerçeveye geri dönülür.");
    await writeStage(pg, d, "Tartışma", "Bulguları hipotez sırasıyla literatür ve öz düzenleme yaklaşımıyla tartış.");
    await writeStage(pg, d, "Sonuç ve öneri", "Sonuçları ve uygulamaya/araştırmaya yönelik önerileri yaz.");
    await d.cap("14 · Özet", "Özet en son yazılır ve yalnızca yazılmış bölümlerden derlenir.");
    await writeStage(pg, d, "Özet ve Abstract", "Türkçe özet ve İngilizce abstract yaz; anahtar kelimeleri ekle.");
    await writeStage(pg, d, "Ön sayfalar", "Kısa bir önsöz yaz.");
  }],
  ["iddia", async (pg, d) => {
    await d.cap("15 · İddia denetimi", "Atıflı her cümle, kaynağın okunan metniyle karşılaştırılır. Yalnızca künyesi olan kaynakta “doğrulanamadı” denir.");
    await openStage(pg, d, "Tartışma");
    await d.click(d.btn("İddia denetimi", true));
    await pg.waitForTimeout(900);
    await d.click(d.btn("Denetimi başlat"));
    await pg.waitForFunction(() => /Yeniden denetle/.test(document.body.innerText), null, { timeout: 30000 });
    await d.w(2500);
    await d.f("move", 800, 500); await pg.mouse.move(800, 500);
    for (let i = 0; i < 4; i++) { await pg.mouse.wheel(0, 380); await d.w(1600); }
    await d.snap("iddia"); await d.dump("iddia");
    await d.click(pg.getByRole("dialog").getByRole("button", { name: "Kapat" }));
  }],
  ["isnad", async (pg, d) => {
    await d.cap("16 · Atıf stili", "Tek tıkla ISNAD 2 dipnotlu: atıflar dipnota, ilk atıf tam künye, sonrakiler kısa atıf olur.");
    const sel = pg.locator("select").filter({ hasText: "ISNAD 2 (dipnotlu)" }).first();
    await d.click(sel); await sel.selectOption({ label: "ISNAD 2 (dipnotlu)" });
    await pg.waitForTimeout(2500);
    await d.f("move", 700, 500); await pg.mouse.move(700, 500);
    for (let i = 0; i < 3; i++) { await pg.mouse.wheel(0, 400); await d.w(1500); }
    await d.snap("isnad"); await d.dump("isnad");
    await d.cap("16 · Atıf stili", "Geri APA 7’ye: metindeki atıflar ve kaynakça yeniden biçimlenir, hiçbir atıf kaybolmaz.");
    await d.click(sel); await sel.selectOption({ label: "APA 7" });
    await pg.waitForTimeout(1500);
  }],
  ["kalite", async (pg, d) => {
    await d.cap("17 · Kalite kontrolü", "Atıf–kaynakça tutarlılığı, eksik bölümler, akademik dil ve doldurulmamış veri alanları tek raporda.");
    await d.click(pg.getByRole("link", { name: "Kalite kontrol" }));
    await pg.waitForTimeout(1200);
    await d.click(d.btn(/Kontrolü başlat|Yeniden kontrol et/));
    await pg.waitForFunction(() => /Kategorilere göre sonuç/.test(document.body.innerText), null, { timeout: 20000 });
    await d.w(3000);
    await d.cap("17 · Kalite kontrolü", "Puan şişirilmez. Filmdeki kaynaklar kurgusal ve DOI’siz olduğu için yalnızca DOI doğrulaması rapordan çıkarıldı; bu raporda açıkça yazar.");
    await d.f("move", 800, 500); await pg.mouse.move(800, 500);
    for (let i = 0; i < 3; i++) { await pg.mouse.wheel(0, 380); await d.w(2200); }
    await d.snap("kalite"); await d.dump("kalite");
  }],
  ["duzelt", async (pg, d) => {
    await d.cap("18 · Eksik veri", "Kritik: etik kurul tarihi ve sayısı. Asistan uydurmadı, [VERİ GİRİLECEK] bıraktı. Bilgiyi öğrenci girer.");
    await d.click(pg.getByRole("link", { name: /^Üniversite Öğrencilerinde/ }).first());
    await pg.waitForTimeout(1500);
    await openStage(pg, d, "Etik ilkeler");
    await d.click(d.btn("Bul ve değiştir (Ctrl+F)"));
    await d.type(pg.getByPlaceholder("Bu bölümde bul…"), "[VERİ GİRİLECEK: etik kurul karar tarihi ve sayısı]", { delay: 18 });
    await d.click(pg.locator('button[title="Değiştir"]'));
    await d.type(pg.getByPlaceholder("Yerine yazılacak…"), "(12.03.2026 tarihli ve 2026/04 sayılı karar)", { delay: 30 });
    await d.click(d.btn(/Tümünü değiştir/));
    await pg.waitForTimeout(1200);
    await d.snap("duzelt");
    await d.click(pg.getByRole("search").getByRole("button", { name: "Kapat" }));
    await d.cap("18 · Eksik veri", "Kontrol yeniden çalıştırılır.");
    await d.click(pg.getByRole("link", { name: "Kalite kontrol" }));
    await pg.waitForTimeout(1200);
    await d.click(d.btn(/Yeniden kontrol et|Kontrolü başlat/));
    await pg.waitForTimeout(3000);
    await d.w(2500);
    await d.snap("kalite2"); await d.dump("kalite2");
  }],
  ["savunma", async (pg, d) => {
    await d.cap("19 · Savunma provası", "Yapay zekâ jüri, yalnızca tezde yazılı olanlardan soru sorar ve cevabı değerlendirir.");
    await d.click(pg.getByRole("link", { name: /^Üniversite Öğrencilerinde/ }).first());
    await pg.waitForTimeout(1500);
    await tool(pg, d, "Savunma provası");
    await d.click(d.btn("Provayı başlat"));
    await pg.waitForFunction(() => /Jüri bunu neden soruyor/.test(document.body.innerText), null, { timeout: 20000 });
    await d.w(3000);
    await d.type(pg.getByPlaceholder(/Cevabınızı yazın/), "Hayır, telefon kullanımının uykuyla ilişkisiz olduğu anlamına gelmiyor. Ekran süresi tek başına uyku kalitesiyle ilişkili; ancak bağımlılık ve erteleme modele girdiğinde katkısı kayboluyor. Bu da belirleyici olanın sürenin kendisinden çok kullanımın kontrolsüz niteliği olduğunu düşündürüyor.", { delay: 14 });
    await d.click(d.btn("Cevabımı değerlendir"));
    await pg.waitForFunction(() => /Güçlü yönler/.test(document.body.innerText), null, { timeout: 20000 });
    await d.w(2000);
    await d.f("move", 800, 500); await pg.mouse.move(800, 500);
    for (let i = 0; i < 2; i++) { await pg.mouse.wheel(0, 380); await d.w(2200); }
    await d.snap("savunma");
    await d.click(pg.getByRole("dialog").getByRole("button", { name: "Kapat" }));
  }],
  ["danisman", async (pg, d) => {
    await d.cap("20 · Danışman", "Danışman her pakette davet edilir: okur, yorum yazar, metni değiştiremez; ilerlemeyi izler.");
    await d.click(d.btn("Ortak yazarlar"));
    await pg.waitForTimeout(800);
    await d.type(pg.getByPlaceholder("ornek@universite.edu.tr"), "danisman@ornek.edu.tr");
    await d.click(pg.getByRole("dialog").locator("label").filter({ hasText: "Danışman" }).first());
    await d.click(d.btn("Davet bağlantısı oluştur"));
    await pg.waitForTimeout(1500);
    await d.snap("davet");
    await d.click(pg.getByRole("dialog").getByRole("button", { name: "Kapat" }));
    await d.cap("20 · İlerleme", "Danışmanın gördüğü panel: bölüm bölüm kelime/hedef, son düzenleme, açık yorumlar, kalite puanı.");
    await d.click(d.btn("İlerleme", true));
    await pg.waitForTimeout(1200);
    await d.f("move", 800, 500); await pg.mouse.move(800, 500);
    for (let i = 0; i < 2; i++) { await pg.mouse.wheel(0, 380); await d.w(2000); }
    await d.snap("ilerleme"); await d.dump("ilerleme");
    await d.click(pg.getByRole("dialog").getByRole("button", { name: "Kapat" }));
  }],
  ["pdf", async (pg, d) => {
    await d.cap("21 · Teslim", "Dışa aktar → PDF: kapak, içindekiler, tablo ve şekil listeleri, numaralı başlıklar ve kaynakça kendiliğinden.");
    await d.click(d.btn("Dışa aktar", true));
    await pg.waitForTimeout(600);
    await d.click(pg.getByText("PDF", { exact: true }));
    await pg.waitForTimeout(2200);
    await d.cap("", "");
    const n = await pg.evaluate(() => window.__FILM_PAGES__ || 0);
    for (let i = 0; i < n; i++) { await d.f("scrollPdf", i < 3 ? 520 : 700); await d.w(i < 4 ? 2600 : 1500); }
    await d.w(1500);
    await d.snap("pdf");
    await d.f("card", "Örnek tez çalışması", "Fikirden teslime, tek ekranda.", "Kurgu · kaynak araması · literatür matrisi ve haritası · bölüm bölüm yazım · istatistik ve grafikler · iddia denetimi · ISNAD dipnot · kalite kontrolü · savunma provası · danışman · PDF");
    await d.w(6000);
    await d.f("card", "Academiana", "academiana.com.tr", "Yapay zekâ destekli akademik çalışma alanı. Kaynak uydurmaz, veri uydurmaz.");
    await d.w(5000);
  }],
];
