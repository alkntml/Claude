/**
 * Kullanım rehberi (D142): /yardim sayfasının içeriği. Yeni üyeye sistemi baştan sona, adım adım anlatır.
 * Menü ve düğme adları arayüzdekiyle aynıdır (bkz. ai/help.ts APP_GUIDE); özellik değişince ikisi birlikte güncellenir.
 * plan: özelliğin açıldığı en düşük paket (features.ts FEATURE_MIN_PLAN anahtarı).
 */
import type { Locale } from "@/i18n/core";
import type { FeatureId } from "./features";
import { GUIDE_DE } from "./guide-de";

export interface L { tr: string; en: string }
export interface GuideArticle { id: string; title: L; where?: L; plan?: FeatureId; steps: L[]; tip?: L }
export interface GuideChapter { id: string; icon: GuideIcon; title: L; intro: L; articles: GuideArticle[] }
export type GuideIcon = "rocket" | "file" | "pen" | "book" | "shield" | "flask" | "users" | "download" | "user" | "wrench";

const s = (tr: string, en: string): L => ({ tr, en });

/** Rehber metninin seçilen dildeki hâli (Almanca: guide-de.ts; eksikse İngilizce) */
export function guideText(x: L, l: Locale): string {
  return l === "de" ? GUIDE_DE[x.tr] ?? x.en : x[l];
}

/** İlk gün: 6 adımda ilk çalışma */
export const QUICK_START: { title: L; text: L }[] = [
  { title: s("Çalışmayı oluşturun", "Create your work"), text: s("Sol menüde “Yeni çalışma” → tür, seviye, konu ve atıf stili → “Çalışma alanını oluştur”.", "Left menu “New work” → type, level, topic and citation style → “Create workspace”.") },
  { title: s("Başlığı seçin", "Pick a title"), text: s("İlk açılışta başlık önerileri gelir; birini seçin ya da “Sonra seçeceğim” deyin.", "Title suggestions appear on first open; pick one or choose “I’ll choose later”.") },
  { title: s("Kurguyu onaylayın", "Approve the blueprint"), text: s("Sol üstte “Başlangıç: Kurguyu oluştur” → problem, amaç, yöntem ve bölüm planı → “Kurguyu onayla ve başla”.", "Top left “Start: Create the blueprint” → problem, aim, method and chapter plan → “Approve and start”.") },
  { title: s("Kaynak ekleyin", "Add sources"), text: s("Sağda “Kaynaklar” → “Kaynak ara” ile 16 veri tabanında arayın; önemli makalelerin PDF’ini yükleyin.", "Right “Sources” → “Search sources” across 16 databases; upload PDFs of key papers.") },
  { title: s("Bölümü yazın", "Write a section"), text: s("Bir bölüme tıklayın → Asistan’da “Alt başlık oluştur”, sonra “Bölümü yaz”; taslağı “Belgeye ekle” ile alın ve düzenleyin.", "Click a section → in Assistant “Create subheadings”, then “Write section”; take the draft with “Add to document” and edit.") },
  { title: s("Kontrol edip indirin", "Check and download"), text: s("“Araçlar” → “İddia denetimi” ve üstte “Kalite kontrol”; sonra “Dışa aktar” → Word veya PDF.", "“Tools” → “Claim audit” and “Quality check” at the top; then “Export” → Word or PDF.") },
];

export const GUIDE: GuideChapter[] = [
  {
    id: "baslarken", icon: "rocket",
    title: s("Başlarken", "Getting started"),
    intro: s("Hesap, kontrol paneli ve aylık haklarınız.", "Your account, dashboard and monthly allowance."),
    articles: [
      { id: "hesap", title: s("Hesap açma ve giriş", "Signing up and signing in"), where: s("Sağ üst: “Ücretsiz başla” / “Giriş yap”", "Top right: “Start free” / “Sign in”"), steps: [
        s("“Ücretsiz başla” ile e-posta ve şifreyle ya da Google/Apple ile kaydolun.", "Sign up with email and password, or with Google/Apple, via “Start free”."),
        s("E-posta ile kaydolduysanız gelen kutunuzdaki doğrulama bağlantısına tıklayın.", "If you signed up with email, click the confirmation link in your inbox."),
        s("Şifrenizi unuttuysanız “Giriş yap” sayfasında “Şifremi unuttum” → e-postadaki bağlantıyla yeni şifre belirleyin.", "Forgot your password? On “Sign in”, use “Forgot password” and set a new one via the emailed link."),
      ] },
      { id: "panel", title: s("Kontrol paneli", "The dashboard"), where: s("Sol menü: “Kontrol paneli”", "Left menu: “Dashboard”"), steps: [
        s("“Bugün ne yapmak istiyorsunuz?” kartlarından işinizi seçin (tez, makale, sistematik derleme, kaynakça kontrolü…); sizi doğru adıma götürür.", "Pick your task from “What do you want to do today?” (thesis, article, systematic review, reference check…); it takes you to the right step."),
        s("Devam eden çalışmalar, son düzenlenen bölümler ve son asistan sohbetleri buradadır.", "Works in progress, recently edited sections and recent assistant chats are here."),
        s("“Kullanım durumu” bu ay kalan yapay zekâ isteklerinizi ve kaynak taramalarınızı gösterir.", "“Usage” shows your remaining AI requests and source searches this month."),
        s("Ortak yazar olarak davet edildiğiniz çalışmalar “Benimle paylaşılan çalışmalar” altındadır.", "Works you were invited to as a co-author are under “Shared with me”."),
      ] },
      { id: "haklar", title: s("Paketler ve aylık haklar", "Plans and monthly allowance"), where: s("Sol menü: “Hesap ve abonelik” → “Paketler”", "Left menu: “Account and subscription” → “Plans”"), steps: [
        s("Her paketin aylık yapay zekâ isteği ve kaynak taraması hakkı vardır; haklar her ayın başında yenilenir.", "Each plan has monthly AI requests and source searches; they reset at the start of each month."),
        s("Hakkınız dolsa da çalışmalarınız açılır, düzenlenir ve indirilir; yalnızca yeni yapay zekâ işlemleri durur.", "Even when your allowance runs out, your works still open, can be edited and downloaded; only new AI actions pause."),
        s("Pakete bağlı özelliklerde kilit simgesi görürsünüz; tıklayınca hangi pakette açıldığı gösterilir.", "Plan-gated features show a lock; clicking it shows which plan unlocks it."),
        s("Yükseltmek için “Yükselt” → “WhatsApp ile yükselt”.", "To upgrade: “Upgrade” → “Upgrade via WhatsApp”."),
      ], tip: s("Üretilen metni silmek kullanılan hakkı geri vermez; büyük işlerden önce kurguyu onaylamak hakkınızı verimli kullanmanızı sağlar.", "Deleting generated text does not refund the request; approving the blueprint first makes large jobs more efficient.") },
    ],
  },
  {
    id: "ilk-calisma", icon: "file",
    title: s("İlk çalışmanız", "Your first work"),
    intro: s("Çalışmayı kurmak, başlık, kurgu ve bölüm yapısı.", "Setting up a work: title, blueprint and chapter structure."),
    articles: [
      { id: "yeni", title: s("Yeni çalışma oluşturma", "Creating a new work"), where: s("Sol menü: mavi “Yeni çalışma”", "Left menu: blue “New work”"), steps: [
        s("Çalışma türünü seçin: tez, makale, literatür taraması, araştırma önerisi, TÜBİTAK/BAP proje önerisi, metin düzeltme…", "Choose the type: thesis, article, literature review, research proposal, TÜBİTAK/BAP proposal, text editing…"),
        s("Akademik seviyeyi, araştırma konusunu, disiplini ve anahtar kelimeleri girin; ne kadar açık yazarsanız öneriler o kadar isabetli olur.", "Enter the level, research topic, discipline and keywords; the clearer you are, the better the suggestions."),
        s("Yazım dilini ve atıf stilini (APA 7, ISNAD 2, IEEE…) seçin; üniversite veya hedef dergiyi yazın.", "Choose the writing language and citation style (APA 7, ISNAD 2, IEEE…); enter your university or target journal."),
        s("“Çalışma alanını oluştur”a basın; bölümler türünüze göre hazır gelir.", "Press “Create workspace”; sections are created for your work type."),
      ] },
      { id: "baslik", title: s("Başlık seçimi", "Choosing a title"), where: s("Çalışma alanı, ilk açılış: “Adım 1”", "Workspace, first open: “Step 1”"), steps: [
        s("Konunuza göre birkaç başlık önerisi gelir; birini seçin veya kendiniz yazın.", "You get several title suggestions; choose one or write your own."),
        s("Başlığı sonra değiştirmek için soldaki “Başlık seçildi” satırına tıklayın.", "To change it later, click the “Title chosen” row on the left."),
      ] },
      { id: "kurgu", title: s("Kurgu: çalışmanın planı", "Blueprint: the plan of your work"), where: s("Sol üst: “Başlangıç: Kurguyu oluştur”", "Top left: “Start: Create the blueprint”"), steps: [
        s("“Kurguyu yapay zekâ ile oluştur”: problem, amaç, araştırma soruları/hipotezler, yöntem ve bölüm bölüm hedef kelime sayıları hazırlanır.", "“Create with AI” drafts the problem, aim, research questions/hypotheses, method and target word counts per chapter."),
        s("Her alanı kendi çalışmanıza göre düzeltin; özellikle yöntem ve örneklem bilgisini kontrol edin.", "Edit every field to match your study; check the method and sample especially."),
        s("“Kurguyu onayla ve başla”ya basın. Asistan bundan sonra bütün bölümleri bu plana uygun yazar.", "Press “Approve and start”. From then on the assistant writes every section according to this plan."),
      ], tip: s("Kurgu onaylanmadan yazdırılan bölümler birbiriyle daha az tutarlı olur. 5 dakikanızı buraya ayırın.", "Sections written before the blueprint is approved are less consistent with each other. Spend five minutes here.") },
      { id: "bolumler", title: s("Bölümler, alt başlıklar ve yol haritası", "Sections, subheadings and roadmap"), where: s("Sol taraf: bölüm listesi", "Left side: section list"), steps: [
        s("Bölümler numarasıyla listelenir (1 GİRİŞ → 1.1, 1.2…). Bir bölüme veya alt başlığa tıklayınca editörde yalnızca o kısım açılır.", "Sections are numbered (1 INTRODUCTION → 1.1, 1.2…). Clicking a section or subheading opens only that part in the editor."),
        s("Alt başlık eklemek için Asistan’da “Alt başlık oluştur” (kaç tane olacağını sorar) ya da alt başlığın yanındaki “+”.", "To add subheadings use “Create subheadings” in the Assistant (it asks how many) or the “+” next to a subheading."),
        s("Listenin en altındaki “Bölüm ekle” ile hazır şablonlardan veya kendi adınızla bölüm eklersiniz.", "Use “Add section” at the bottom to add a template or custom section."),
        s("Önerilen yazım sırasıyla ilerleyin; özet en sona bırakılır. Biten bölümü “Bölümü tamamladım” ile işaretleyin.", "Follow the suggested order; the abstract comes last. Mark a finished section with “Section complete”."),
      ] },
      { id: "hedef", title: s("Haftalık hedef ve teslim tarihi", "Weekly goal and deadline"), where: s("Sol taraf: “Haftalık hedef ve teslim tarihi belirle”", "Left side: “Set weekly goal and deadline”"), steps: [
        s("Haftalık kelime hedefinizi ve teslim tarihinizi girin.", "Enter your weekly word goal and deadline."),
        s("Kalan bölümler haftalara dağıtılır; ilerlemeniz kontrol panelinde görünür.", "Remaining sections are spread across the weeks; progress shows on the dashboard."),
      ] },
      { id: "word-ice", title: s("Var olan Word belgenizi aktarma", "Importing an existing Word document"), where: s("“Araçlar” → “Word’den içe aktar” veya bölüm başlığındaki düğme", "“Tools” → “Import from Word” or the button on the section header"), steps: [
        s(".docx dosyanızı seçip “İçe aktar”a basın.", "Choose your .docx file and press “Import”."),
        s("Başlıklar bölüm ve alt başlıklara, tablolar tablolara dönüşür.", "Headings become sections and subheadings; tables stay tables."),
        s("Kaynakçanız ayrıştırılıp doğrulanır, kaynaklara eklenir ve metindeki atıflar bu kaynaklara bağlanır.", "Your reference list is parsed, verified and added to sources, and in-text citations are linked to them."),
      ], tip: s("Belgenizden öğrenilen kavram ve kararları asistanın hatırlaması için Hafıza sekmesinde “Belgeden öğren”i de kullanabilirsiniz.", "To let the assistant remember concepts and decisions from your document, also use “Learn from document” in the Memory tab.") },
    ],
  },
  {
    id: "yazma", icon: "pen",
    title: s("Yazma ve düzenleme", "Writing and editing"),
    intro: s("Editör, asistan, otomatik tamamlama, bul-değiştir, hafıza ve sürümler.", "Editor, assistant, autocomplete, find and replace, memory and versions."),
    articles: [
      { id: "editor", title: s("Editör araç çubuğu", "The editor toolbar"), where: s("Orta alan, metnin üstü", "Centre, above the text"), steps: [
        s("Geri al / yinele, H2–H3–H4 (alt başlık düzeyleri), kalın, italik, altı çizili, listeler, blok alıntı ve ayırıcı.", "Undo/redo, H2–H3–H4 (subheading levels), bold, italic, underline, lists, block quote and divider."),
        s("“Dipnot ekle”: imleci koyup dipnot metnini yazın; numaralar otomatik verilir.", "“Add footnote”: place the cursor and type the note; numbering is automatic."),
        s("“Tablo ekle” ile tablo; tablonun içindeyken “Satır ekle”, “Sütun ekle”, “Tabloyu sil”. “Şekil başlığı ekle” ile şekil başlığı.", "“Insert table” for tables; inside a table use “Add row”, “Add column”, “Delete table”. “Add figure caption” for captions."),
        s("Tablo ve şekil başlıkları dışa aktarırken seçtiğiniz atıf stiline göre biçimlenir.", "Table and figure captions are formatted for your citation style when exporting."),
        s("Kayıt otomatiktir; sol üstte “Tüm değişiklikler kaydedildi” yazar. Bağlantı koparsa metin cihazınızda saklanır ve bağlantı gelince gönderilir.", "Saving is automatic; top left shows “All changes saved”. If you go offline, text is kept on your device and sent when you reconnect."),
      ] },
      { id: "asistan", title: s("Asistanla bölüm yazma", "Writing a section with the assistant"), where: s("Sağ: “Asistan” sekmesi", "Right: “Assistant” tab"), steps: [
        s("Bölüme veya alt başlığa girin. Kısayollar bölüme göre değişir: “Alt başlık oluştur”, “Bölümü yaz”, “Literatür araştır”, “Tekrarları azalt”…", "Open a section or subheading. Shortcuts depend on the section: “Create subheadings”, “Write section”, “Research literature”, “Reduce repetition”…"),
        s("İsteğinizi mesaj kutusuna da yazabilirsiniz (Enter gönderir). Mikrofonla sesle de yazabilirsiniz.", "You can also type a request (Enter sends) or dictate with the microphone."),
        s("Asistan gerekirse kaynakları kendisi arar ve yalnızca projedeki kaynaklara atıf yapar; kaynağı yoksa [KAYNAK GEREKLİ] yazar, veri yoksa [VERİ GİRİLECEK].", "If needed, the assistant searches for sources itself and cites only sources in your project; otherwise it writes [SOURCE NEEDED] or [DATA TO BE ENTERED]."),
        s("Gelen taslağı “Belgeye ekle” veya “Seçili metnin yerine koy” ile metne alın, sonra kendi sözlerinizle düzenleyin.", "Take the draft into the text with “Add to document” or “Replace selection”, then edit it in your own words."),
      ], tip: s("Üretilen metin bir taslaktır. Bilimsel sorumluluk sizindir: her atıfı ve sayıyı kontrol edin (bkz. “Akademik dürüstlük”).", "Generated text is a draft. Scientific responsibility is yours: check every citation and number (see “Academic integrity”).") },
      { id: "secim", title: s("Metin seçince çıkan menü", "The selection menu"), where: s("Editörde metin seçin", "Select text in the editor"), steps: [
        s("Bir cümle veya paragraf seçin; üstünde küçük bir menü çıkar.", "Select a sentence or paragraph; a small menu appears above it."),
        s("“Çevir”, “Dil denetimi”, “Akademikleştir”, “Kısalt”, “Genişlet”, “Asistana sor” seçili metne uygulanır.", "“Translate”, “Language check”, “Make academic”, “Shorten”, “Expand”, “Ask the assistant” apply to the selection."),
        s("Atıflar ve dipnotlar bu işlemlerde korunur.", "Citations and footnotes are preserved."),
      ] },
      { id: "tamamlama", title: s("Otomatik tamamlama", "Autocomplete"), where: s("Araç çubuğundaki sihirli değnek", "Magic wand in the toolbar"), steps: [
        s("Paragrafın sonunda yazmayı bırakınca gri renkte bir cümlelik öneri çıkar.", "Pause at the end of a paragraph and a one-sentence suggestion appears in grey."),
        s("“Tab” tümünü, “Ctrl/⌘ + →” bir kelimeyi kabul eder, “Esc” kapatır; telefonda öneriye dokunun.", "“Tab” accepts all, “Ctrl/⌘ + →” one word, “Esc” dismisses; on phones tap the suggestion."),
        s("Öneriler sayı, yıl, ad veya atıf içermez; aylık hakkınızdan düşmez (günlük sınırı vardır).", "Suggestions never contain numbers, years, names or citations; they don’t count towards your monthly allowance (daily limit applies)."),
      ] },
      { id: "bul", title: s("Bul ve değiştir", "Find and replace"), where: s("Ctrl/⌘ + F veya araç çubuğundaki büyüteç", "Ctrl/⌘ + F or the magnifier in the toolbar"), steps: [
        s("Aradığınız kelimeyi yazın; eşleşmeler sarıyla vurgulanır. Enter sonraki, Shift+Enter önceki.", "Type the word; matches are highlighted. Enter = next, Shift+Enter = previous."),
        s("“Aa” büyük/küçük harfe duyarlı, “ab” yalnızca tam kelime arar.", "“Aa” matches case, “ab” matches whole words."),
        s("Değiştir simgesiyle ikinci satırı açın: “Değiştir” tek tek, “Tümünü değiştir” hepsini değiştirir (geri al çalışır).", "Open the second row with the replace icon: “Replace” one by one or “Replace all” (undo works)."),
        s("Arama açık bölümde (alt başlığa odaklandıysanız o alt başlıkta) yapılır.", "The search covers the open section (or the focused subheading)."),
      ] },
      { id: "hafiza", title: s("Hafıza", "Memory"), where: s("Sağ: beyin simgeli sekme", "Right: brain-icon tab"), steps: [
        s("Asistanın hatırladığı kararlar, kavram tanımları, değişkenler ve hipotezler burada listelenir.", "Decisions, concept definitions, variables and hypotheses the assistant remembers are listed here."),
        s("Elle kayıt ekleyip silebilirsiniz; asistan bundan sonra bunlara uyar.", "Add or delete entries yourself; the assistant follows them from then on."),
        s("“Belgeden öğren”: PDF/Word yükleyin, önemli bilgiler hafızaya eklensin.", "“Learn from document”: upload a PDF/Word file to add key facts to memory."),
      ] },
      { id: "gecmis", title: s("Sürüm geçmişi", "Version history"), where: s("Sağ: saat simgeli “Geçmiş” sekmesi", "Right: clock-icon “History” tab"), steps: [
        s("Her bölümün önemli anlardaki sürümleri saklanır (asistan metni değiştirdiğinde, içe aktarmada, çakışmada…).", "Versions of each section are kept at key moments (assistant edits, imports, conflicts…)."),
        s("“Şimdiki hâli sürüm olarak kaydet” ile elle sürüm alın.", "Use “Save current as version” to take a manual snapshot."),
        s("Eski bir sürüme dönmek için sürümü seçip “Geri yükle”.", "To go back, pick the version and press “Restore”."),
      ] },
    ],
  },
  {
    id: "kaynaklar", icon: "book",
    title: s("Kaynaklar ve atıflar", "Sources and citations"),
    intro: s("Kaynak bulma, tam metin, atıf ekleme, kaynakça ve kaynakları birlikte inceleme.", "Finding sources, full text, citing, the reference list and analysing sources together."),
    articles: [
      { id: "ara", title: s("Kaynak arama", "Searching for sources"), where: s("Sağ: “Kaynaklar” → “Kaynak ara”", "Right: “Sources” → “Search sources”"), steps: [
        s("Konunuzu yazın; 16 akademik veri tabanında (OpenAlex, Crossref, Europe PMC/PubMed, ERIC, DOAJ, arXiv…) 250 milyondan fazla yayın taranır.", "Type your topic; over 250 million publications across 16 academic databases (OpenAlex, Crossref, Europe PMC/PubMed, ERIC, DOAJ, arXiv…) are searched."),
        s("“Filtreler” ile yıl aralığı ve açık erişim seçin.", "Use “Filters” for year range and open access."),
        s("Uygun olanları işaretleyip “Seçilenleri projeye ekle”.", "Tick the relevant ones and press “Add selected to project”."),
        s("Asistan’daki “Literatür araştır” aynı aramayı konu analiziyle birlikte yapar.", "“Research literature” in the Assistant does the same search with a topic analysis."),
      ], tip: s("DergiPark, TR Dizin ve YÖK Tez için arama bağlantıları da Kaynaklar sekmesindedir.", "Search links for DergiPark, TR Dizin and YÖK Tez are also in the Sources tab.") },
      { id: "doi", title: s("DOI ile veya elle kaynak ekleme", "Adding a source by DOI or manually"), where: s("Kaynaklar → “DOI / elle ekle”", "Sources → “DOI / manual”"), steps: [
        s("DOI, PMID veya arXiv kimliğini yapıştırın; künye otomatik doldurulur ve doğrulanır.", "Paste a DOI, PMID or arXiv ID; the reference is filled in and verified automatically."),
        s("Kimliği olmayan kaynaklar (kitap bölümü, rapor) için künyeyi elle girin.", "For sources without an ID (book chapter, report) enter the details manually."),
      ] },
      { id: "erisim", title: s("Erişim seviyeleri ve PDF yükleme", "Access levels and PDF upload"), where: s("Her kaynağın kartında", "On each source card"), steps: [
        s("Her kaynakta ne kadarının okunduğu yazar: “Künye” (yalnızca bilgiler), “Özet” veya “Tam metin”.", "Each source shows how much was read: “Metadata”, “Abstract” or “Full text”."),
        s("Asistan ve denetimler yalnızca okunan kısma dayanır; tam metin olmayan kaynakta sayfa numarası verilemez.", "The assistant and audits rely only on what was read; without full text no page numbers can be given."),
        s("“Açık erişim tam metni getir” ya da elinizdeki PDF’i “PDF yükle” ile ekleyin. Üst/alt bilgiler temizlenir, bölümler (yöntem, bulgular…) tanınır.", "Use “Fetch open-access full text” or upload your PDF with “Upload PDF”. Headers/footers are cleaned and sections (method, results…) recognised."),
      ], tip: s("En çok atıf yaptığınız 10–15 kaynağın PDF’ini yüklemek, iddia denetimi ve sayfa numaralı atıfların kalitesini en çok artıran adımdır.", "Uploading PDFs of the 10–15 sources you cite most is the single biggest boost to claim audits and page-numbered citations.") },
      { id: "atif", title: s("Atıf ekleme", "Inserting a citation"), where: s("Kaynaklar sekmesi → “Atıf ekle”", "Sources tab → “Cite”"), steps: [
        s("İmleci atıf yapılacak yere koyun, kaynağın “Atıf ekle” düğmesine basın.", "Place the cursor where the citation goes and press the source’s “Cite” button."),
        s("Atfa tıklayınca: sayfa numarası (doğrudan alıntı), “Yazar (Yıl)” biçimi, “Kaynağı göster”, “Kaynakta doğrula”, “Atfı kaldır”.", "Click a citation for: page number (direct quote), “Author (Year)” form, “Show source”, “Verify in source”, “Remove”."),
        s("Atıflar canlıdır: atıf stilini değiştirince hepsi ve kaynakça yeniden biçimlenir.", "Citations are live: changing the style reformats all of them and the reference list."),
      ] },
      { id: "kaynakca", title: s("Kaynakça ve atıf stilleri", "Reference list and citation styles"), where: s("Üst çubuk: atıf stili seçimi", "Top bar: citation style"), steps: [
        s("Kaynakçayı ayrıca yazmazsınız: atıf yaptığınız kaynaklardan otomatik oluşur; atıf almayan kaynak kaynakçaya girmez.", "You don’t write the reference list: it is built from the sources you cite; uncited sources are left out."),
        s("10 stil: APA 7, APA 6, ISNAD 2 (metin içi), Chicago, Turabian, Harvard, MLA 9, Vancouver, IEEE, AMA 11.", "10 styles: APA 7, APA 6, ISNAD 2 (in-text), Chicago, Turabian, Harvard, MLA 9, Vancouver, IEEE, AMA 11."),
        s("Kaynakça bölümünde bir kayda tıklayınca kullanıldığı yerleri görür, “Git” ile metindeki atfa gidersiniz.", "In the references section click an entry to see where it is used and jump with “Go”."),
      ] },
      { id: "sor", title: s("Kaynağa sor", "Ask a source"), where: s("Kaynaklar → kaynağın “Sor” düğmesi", "Sources → the source’s “Ask” button"), steps: [
        s("Makaleye soru sorun ya da hazır sorulardan seçin: “Kısa özet”, “Yöntem”, “Örneklem”, “Temel bulgular”, “Sınırlılıklar”…", "Ask the paper a question or pick a ready one: “Short summary”, “Method”, “Sample”, “Key findings”, “Limitations”…"),
        s("Cevap okunan metne dayanır ve sayfa numarası verir.", "Answers are based on the text that was read and give page numbers."),
        s("“Atıfla metne ekle” veya “Hafızaya ekle” ile kullanın.", "Use it with “Insert with citation” or “Add to memory”."),
      ] },
      { id: "birlikte", title: s("Kaynakları birlikte analiz etme", "Analysing sources together"), plan: "matrix", where: s("Kaynaklar → “Birlikte analiz et”", "Sources → “Analyse together”"), steps: [
        s("Karşılaştırmak istediğiniz kaynakları seçin.", "Select the sources to compare."),
        s("“Karşılaştır”: uyuştukları, ayrıştıkları noktalar ve boşluklar tablo hâlinde gelir. “Hepsine birlikte sor”: tek soruya hepsinden cevap.", "“Compare” gives a table of agreements, disagreements and gaps. “Ask all together” answers one question from all of them."),
        s("“Tabloyu belgeye ekle” veya “Atıflarla metne ekle”.", "“Add table to document” or “Insert with citations”."),
      ] },
      { id: "matris", title: s("Literatür matrisi", "Literature matrix"), plan: "matrix", where: s("Kaynaklar → “Literatür matrisi”", "Sources → “Literature matrix”"), steps: [
        s("Her kaynak için amaç, yöntem, örneklem ve bulgular tek tabloda özetlenir.", "Aim, method, sample and findings of each source are summarised in one table."),
        s("“Excel için indir (CSV)” veya “Belgeye tablo olarak ekle”.", "“Download for Excel (CSV)” or “Add to document as a table”."),
      ] },
      { id: "zotero", title: s("Zotero / Mendeley / EndNote", "Zotero / Mendeley / EndNote"), plan: "bib_io", where: s("Kaynaklar → “İçe aktar” / “Dışa aktar”", "Sources → “Import” / “Export”"), steps: [
        s("Referans yöneticinizden BibTeX, RIS veya CSL-JSON dışa aktarıp buraya “İçe aktar” ile alın.", "Export BibTeX, RIS or CSL-JSON from your reference manager and bring it in with “Import”."),
        s("Projedeki kaynakları aynı biçimlerde “Dışa aktar” ile geri verebilirsiniz.", "Send project sources back in the same formats with “Export”."),
      ] },
    ],
  },
  {
    id: "dogruluk", icon: "shield",
    title: s("Doğruluk ve kalite", "Accuracy and quality"),
    intro: s("Atıfların kaynağı gerçekten söyleyip söylemediğini ve çalışmanın teslime hazır olup olmadığını kontrol edin.", "Check that citations really say what you claim and that the work is ready to submit."),
    articles: [
      { id: "dogrula", title: s("Tek bir atfı kaynakta doğrulama", "Verifying a single citation"), where: s("Atfa tıklayın → “Kaynakta doğrula”", "Click a citation → “Verify in source”"), steps: [
        s("Cümle, kaynağın okunan metniyle karşılaştırılır; dayanak pasaj ve sayfası gösterilir.", "The sentence is compared with the source text; the supporting passage and page are shown."),
        s("Kaynakların künyesini Kaynaklar sekmesindeki “Doğrula” ile Crossref/OpenAlex üzerinden kontrol edebilirsiniz.", "Check reference details against Crossref/OpenAlex with “Verify” in the Sources tab."),
      ] },
      { id: "kaynak-gerekli", title: s("[KAYNAK GEREKLİ] işaretlerini düzeltme", "Fixing [SOURCE NEEDED] markers"), where: s("Editörün üstündeki uyarı → “Kaynak bul ve düzelt”", "Banner above the editor → “Find sources and fix”"), steps: [
        s("Asistan uygun kaynak bulamadığı cümleleri [KAYNAK GEREKLİ] ile işaretler; uydurma atıf yapmaz.", "The assistant marks sentences it cannot support with [SOURCE NEEDED]; it never invents citations."),
        s("“Kaynak bul ve düzelt” bu cümleler için kaynak arar ve uygun olanlara atıf ekler; bulamazsa cümleyi yumuşatmanızı önerir.", "“Find sources and fix” searches for sources and cites suitable ones; otherwise it suggests softening the sentence."),
      ] },
      { id: "iddia", title: s("İddia denetimi", "Claim audit"), where: s("“Araçlar” → “İddia denetimi” veya bölüm başlığındaki düğme", "“Tools” → “Claim audit” or the section header button"), steps: [
        s("Bölümdeki atıflı her cümle, kaynağın okunan metniyle karşılaştırılır: destekleniyor / kısmen / desteklenmiyor / çelişiyor / okunamadı.", "Every cited sentence is checked against the source text: supported / partly / not supported / contradicts / could not be read."),
        s("Her sonuçta kısa gerekçe, kaynaktan birebir alıntı ve sayfa görünür. Atıfsız kesin ifadeler de işaretlenir.", "Each result shows a short reason, a verbatim quote and the page. Uncited definitive claims are flagged too."),
        s("“Cümleye git”, “Asistanla düzelt”; “Sorunlu cümleleri metinde işaretle” ile editörde altını çizin.", "Use “Go to sentence”, “Fix with assistant”; “Mark problem sentences in text” underlines them in the editor."),
        s("“Diğer kaynaklarımla da karşılaştır”: projedeki başka kaynakların cümlenizi destekleyip desteklemediği ya da çeliştiği gösterilir. Sonuçlar CSV olarak indirilebilir.", "“Also compare with my other sources” shows whether other project sources support or contradict the sentence. Results can be downloaded as CSV."),
      ], tip: s("“Kısmen” çoğu zaman cümlenin kaynaktan daha kesin konuştuğu anlamına gelir (ör. “yalnızca”, “kanıtlamıştır”). “Okunamadı” ise o kaynağın tam metni olmadığındandır: PDF’ini yükleyin.", "“Partly” usually means the sentence is stronger than the source (e.g. “only”, “proved”). “Could not be read” means no full text: upload the PDF.") },
      { id: "kalite", title: s("Kalite kontrol ve puan", "Quality check and score"), where: s("Üst çubuk: “Kalite kontrol”", "Top bar: “Quality check”"), plan: "quality_ai", steps: [
        s("“Kontrolü başlat”: atıf ve kaynakça tutarlılığı, eksik künye, yinelenen kaynak, bölüm uzunlukları ve tekrarlar kural tabanlı denetlenir.", "“Start check”: citation/reference consistency, incomplete entries, duplicates, section lengths and repetition are checked by rules."),
        s("Paketinize göre yapay zekâ incelemesi de eklenir; puanı etkilemez, öneri olarak gelir.", "Depending on your plan, an AI review is added; it doesn’t change the score and comes as suggestions."),
        s("“Puan nasıl hesaplanır?” bağlantısı yöntemi açıklar (herkese açık “Yöntem” sayfası).", "“How is the score calculated?” explains the method (public “Method” page)."),
      ] },
      { id: "kontrol-listesi", title: s("Teslim öncesi kontrol listesi", "Pre-submission checklist"), where: s("“Kalite kontrol” sayfası", "“Quality check” page"), steps: [
        s("Boş bölüm, kalan [KAYNAK GEREKLİ], iddia denetimi, doğrulanmamış kaynak, özet, anahtar kelimeler ve biçim maddeleri tek listede.", "Empty sections, remaining [SOURCE NEEDED], claim audit, unverified sources, abstract, keywords and formatting in one list."),
        s("Her maddedeki “Düzelt →” sizi ilgili yere götürür.", "“Fix →” on each item takes you to the right place."),
      ] },
      { id: "tamamla", title: s("Bölümü tamamlama kontrolü", "Section completion check"), where: s("Editörün üstü: “Bölümü tamamladım”", "Above the editor: “Section complete”"), steps: [
        s("Bölüm, şablonundaki beklentilere göre (uzunluk, atıf, alt başlıklar) kontrol edilir.", "The section is checked against its template (length, citations, subheadings)."),
        s("“Tamamla ve sıradakine geç”, “Asistanla düzelt” veya “Yine de tamamlandı işaretle”.", "“Complete and go to next”, “Fix with assistant” or “Mark complete anyway”."),
      ] },
    ],
  },
  {
    id: "arastirma", icon: "flask",
    title: s("Araştırma araçları", "Research tools"),
    intro: s("Literatür haritası, sistematik derleme, veri, istatistik, anket ve dil araçları.", "Literature map, systematic review, data, statistics, surveys and language tools."),
    articles: [
      { id: "harita", title: s("Literatür haritası", "Literature map"), plan: "litmap", where: s("“Araçlar” → “Literatür haritası”", "“Tools” → “Literature map”"), steps: [
        s("DOI’li kaynaklarınızdan bir ağ kurulur: doğrudan atıf, ortak kaynakça ve birlikte atıf bağları; benzer kaynaklar renkli kümelere ayrılır.", "A network is built from your DOI sources: direct citation, shared references and co-citation; similar sources form coloured clusters."),
        s("“Ağ”: bir daireye tıklayın (konu, küme, metinde atıf yapılıp yapılmadığı). Ctrl/⌘ + tekerlekle yakınlaştırın; PNG/SVG indirin.", "“Network”: click a circle (topic, cluster, whether cited in text). Zoom with Ctrl/⌘ + scroll; download PNG/SVG."),
        s("“Zaman çizelgesi” literatürün yıllara göre gelişimini, “Konu haritası” kapsadığınız ve eksik olabilecek alt konuları gösterir.", "“Timeline” shows how the literature developed; “Topic map” shows covered and possibly missing subtopics."),
        s("“Eksik temel çalışmalar” ve “Yeni çalışmalar” sekmelerinden okuyup uygun olanları “Ekle”.", "From “Missing key works” and “New works”, read and “Add” the relevant ones."),
      ], tip: s("Üstteki uyarı kartları (güncellik, kümeler arası boşluk, köprü kaynak) tartışma bölümü ve özgün katkı için iyi bir başlangıç noktasıdır.", "The hint cards at the top (recency, gaps between clusters, bridge source) are good starting points for the discussion and your original contribution.") },
      { id: "prisma", title: s("Sistematik derleme (PRISMA 2020)", "Systematic review (PRISMA 2020)"), plan: "prisma", where: s("“Araçlar” → “Sistematik derleme (PRISMA)”", "“Tools” → “Systematic review (PRISMA)”"), steps: [
        s("“1. Protokol”: soru, dahil etme/hariç tutma ölçütleri; iki kişi değerlendirecekseniz “Çift değerlendirici modu”.", "“1. Protocol”: question, inclusion/exclusion criteria; “Dual reviewer mode” if two people screen."),
        s("“2. Kayıt toplama”: Academiana’da arayın veya veri tabanlarından RIS/BibTeX içe aktarın; yinelenenler (benzer başlıklar dahil) ayıklanır.", "“2. Records”: search in Academiana or import RIS/BibTeX from databases; duplicates (including near-duplicates) are removed."),
        s("“3. Başlık/özet tarama” ve “4. Tam metin”: “Dahil”/“Hariç tut” + gerekçe. Yapay zekâ yalnızca öneri verir; karar sizindir. Çift değerlendiricide uyum (kappa) gösterilir.", "“3. Title/abstract” and “4. Full text”: include/exclude with reason. AI only suggests; you decide. Agreement (kappa) is shown in dual mode."),
        s("“5. Veri çıkarma ve kalite” ve “6. Akış şeması ve yöntem”: özellikler tablosu, kalite değerlendirmesi, PRISMA akış şeması ve yöntem metni belgeye eklenir.", "“5. Data extraction and quality” and “6. Flow diagram and methods”: characteristics table, quality appraisal, PRISMA diagram and methods text go into your document."),
      ] },
      { id: "ne-diyor", title: s("Araştırmalar ne diyor?", "What does research say?"), where: s("“Araçlar” → “Araştırmalar ne diyor?”", "“Tools” → “What does research say?”"), steps: [
        s("Bir araştırma sorusu yazın (ör. “Uyku süresi akademik başarıyı etkiler mi?”).", "Type a research question (e.g. “Does sleep duration affect academic performance?”)."),
        s("Gerçek makale özetlerinden numaralı kısa bir cevap ve uzlaşı göstergesi (evet / karışık / hayır) gelir.", "You get a short numbered answer from real paper abstracts and a consensus meter (yes / mixed / no)."),
        s("Uygun makaleleri tek tıkla çalışmanıza ekleyin.", "Add relevant papers to your work in one click."),
      ] },
      { id: "konu", title: s("Tez konusu bulma", "Finding a thesis topic"), plan: "topics", where: s("Sol menü: “Konu bulma”", "Left menu: “Topic finder”"), steps: [
        s("Konu veya anahtar kelime yazıp “Keşfet”e basın.", "Type a topic or keyword and press “Explore”."),
        s("Yıllara göre yayın sayısı, alt konular ve eğilimleri, Türkiye’den yayınlar ve en çok atıf alanlar gelir.", "You get publications per year, subtopics and trends, publications from Türkiye and most-cited works."),
        s("“Verilere dayalı konu önerileri” → “Bu konuyla tez başlat”.", "“Data-based topic ideas” → “Start a thesis on this”."),
      ] },
      { id: "dosyalar", title: s("Dosyalarım ve veri dosyaları", "My files and data files"), where: s("Sol menü: “Dosyalarım”", "Left menu: “My files”"), steps: [
        s("Yüklemeden ÖNCE sağdaki “Proje” kutusundan dosyanın hangi çalışmaya ait olduğunu seçin; grafik ve istatistik yalnızca o çalışmanın veri dosyalarını görür.", "BEFORE uploading, choose the work in the “Project” box; charts and statistics only see that work’s data files."),
        s("PDF, DOCX, XLSX, CSV, TXT (dosya başına 25 MB). CSV/XLSX “Veri tablosu” olarak tanınır.", "PDF, DOCX, XLSX, CSV, TXT (25 MB each). CSV/XLSX are recognised as “Data table”."),
        s("Makale PDF’ini “Makaleyi kaynak olarak ekle” ile kaynaklara alın.", "Turn a paper PDF into a source with “Add paper as source”."),
      ], tip: s("Yanlış çalışmaya yüklenen dosyanın bağlantısı sonradan değişmez: silip doğru çalışmayı seçerek yeniden yükleyin.", "A file’s project link can’t be changed: delete and re-upload it to the right work.") },
      { id: "istatistik", title: s("İstatistik analizi", "Statistical analysis"), plan: "stats", where: s("“Araçlar” → “İstatistik analizi”", "“Tools” → “Statistical analysis”"), steps: [
        s("Veri dosyasını, analizi (t testleri, ANOVA, korelasyon, regresyon, ki-kare, güvenirlik…) ve değişkenleri seçin.", "Choose the data file, the analysis (t-tests, ANOVA, correlation, regression, chi-square, reliability…) and variables."),
        s("“Analizi çalıştır”: sonuç APA biçiminde yazılır; hesaplamalar yapay zekâ ile değil, kesin formüllerle yapılır.", "“Run analysis”: results are written in APA format; calculations use exact formulas, not AI."),
        s("“Belgeye ekle” veya “Kopyala”.", "“Add to document” or “Copy”."),
      ] },
      { id: "grafik", title: s("Grafik oluşturma", "Creating a chart"), plan: "stats", where: s("“Araçlar” → “Grafik oluştur”", "“Tools” → “Create chart”"), steps: [
        s("Veri dosyasını ve grafik türünü seçin; eksenleri, gruplamayı, hata çubuğunu veya regresyon doğrusunu ayarlayın.", "Choose the data file and chart type; set axes, grouping, error bars or regression line."),
        s("“Grafiği oluştur” → “Belgeye ekle”: APA tarzı şekil imlecin olduğu yere eklenir.", "“Create chart” → “Add to document”: an APA-style figure is inserted at the cursor."),
      ] },
      { id: "anket", title: s("Anket oluşturucu", "Survey builder"), plan: "surveys", where: s("Sol menü: “Anketlerim”", "Left menu: “My surveys”"), steps: [
        s("“Yeni anket” → “Boş anket” veya “Yapay zekâ ile” (amaç, hedef kitle, değişkenler).", "“New survey” → “Blank” or “With AI” (aim, audience, variables)."),
        s("Soruları düzenleyin; “Madde öner”, “Anketi incele”, ters puanlanan maddeler; “Ayarlar”da onam metni ve kapanış tarihi.", "Edit questions; “Suggest items”, “Review survey”, reverse-scored items; consent text and closing date in “Settings”."),
        s("“Yayına al” → “Katılımcı bağlantısı”nı paylaşın. Katılımcılardan kimlik bilgisi toplanmaz.", "“Publish” → share the “Participant link”. No identifying data is collected from participants."),
        s("“Cevaplar” → CSV / kod kitabı veya “Cevapları çalışmaya veri dosyası olarak aktar” ile analize geçin.", "“Responses” → CSV / codebook or “Send responses to a work as a data file” to analyse them."),
      ] },
      { id: "dil", title: s("Dil ve çeviri", "Language and translation"), where: s("“Araçlar” → “Dil ve çeviri” veya seçim menüsü", "“Tools” → “Language and translation” or the selection menu"), steps: [
        s("“Çeviri”: Türkçe, İngilizce ve Almanca arasında akademik çeviri (Amerikan/İngiliz İngilizcesi); atıf, dipnot ve şekiller korunur.", "“Translation”: academic translation between Turkish, English and German (US/UK English); citations, footnotes and figures are preserved."),
        s("“Dil denetimi”: yazım, dil bilgisi, noktalama ve üslup önerileri; “Uygula” / “Tümünü uygula”.", "“Language check”: spelling, grammar, punctuation and style suggestions; “Apply” / “Apply all”."),
        s("“Terim sözlüğü”: çalışmanıza özel terim karşılıklarını kaydedin; çeviriler buna uyar.", "“Glossary”: save your own term pairs; translations follow them."),
      ] },
    ],
  },
  {
    id: "birlikte", icon: "users",
    title: s("Birlikte çalışma", "Working together"),
    intro: s("Ortak yazarlar, gerçek zamanlı yazım ve danışmanla paylaşım.", "Co-authors, real-time writing and sharing with your advisor."),
    articles: [
      { id: "ortak", title: s("Ortak yazar davet etme", "Inviting co-authors"), plan: "coauthors", where: s("Üst çubuk: “Ortak yazarlar”", "Top bar: “Co-authors”"), steps: [
        s("E-posta adresini yazın ve rolü seçin: “Ortak yazar” (yazar, kaynak ekler, yapay zekâyı kendi paketiyle kullanır) veya “Yorumcu” (okur, yorum yazar). En fazla 5 kişi.", "Enter the email and choose a role: “Co-author” (writes, adds sources, uses AI with their own plan) or “Commenter” (reads and comments). Up to 5 people."),
        s("“Davet bağlantısı oluştur” → bağlantıyı WhatsApp/e-postayla iletin; kişi aynı e-postayla giriş yapıp “Daveti kabul et”e basar.", "“Create invite link” → send it by WhatsApp/email; they sign in with the same email and press “Accept invite”."),
        s("Davet edilenin ücretli pakete ihtiyacı yoktur. Dosyalarınız ve asistan sohbetleriniz size özeldir.", "Invitees don’t need a paid plan. Your files and assistant chats stay private."),
      ] },
      { id: "canli", title: s("Gerçek zamanlı ortak yazım", "Real-time co-writing"), plan: "coauthors", where: s("Çalışma alanı, ortak yazar varken", "Workspace, with co-authors"), steps: [
        s("Bağlantı açıkken üst çubukta yeşil “Canlı” yazar; kimin hangi bölümde olduğu bölüm listesinde görünür.", "When connected, a green “Live” shows in the top bar; who is in which section shows in the list."),
        s("Aynı bölümdeyseniz diğer yazarın paragrafı renkli çizgi ve adıyla işaretlenir; yazıyorsa ✎ görünür.", "In the same section, the other author’s paragraph is marked with a coloured line and their name; ✎ while typing."),
        s("Değişiklikler saniyeler içinde yansır; farklı paragraflardaki değişiklikler otomatik birleşir.", "Changes appear within seconds; edits in different paragraphs merge automatically."),
        s("Aynı paragrafı aynı anda düzenlerseniz bir sürüm kalır, diğeri “Geçmiş”te saklanır.", "If you edit the same paragraph at the same moment, one version is kept and the other saved in “History”."),
      ], tip: s("En rahat yöntem: herkes farklı alt başlıkta çalışsın.", "Easiest approach: everyone works on a different subheading.") },
      { id: "danisman", title: s("Danışmanla paylaşım ve yorumlar", "Sharing with your advisor and comments"), where: s("Üst çubuk: “Paylaş” → “Danışmanla paylaş”", "Top bar: “Share” → “Share with advisor”"), steps: [
        s("Süreli, salt okunur bir bağlantı oluşturun; isterseniz “Yorumlara izin ver”.", "Create a time-limited, read-only link; optionally “Allow comments”."),
        s("Danışman hesap açmadan okur ve yorum yazar; yorumlar sağdaki “Yorum” sekmesine düşer.", "Your advisor reads and comments without an account; comments arrive in the “Comments” tab."),
        s("Yorumda “Asistanla uygula” ile düzeltmeyi yaptırın, “Çözüldü” ile kapatın. Bağlantıyı “İptal et” ile kapatabilirsiniz.", "Use “Apply with assistant” on a comment, close it with “Resolved”. Revoke the link with “Revoke”."),
      ] },
    ],
  },
  {
    id: "teslim", icon: "download",
    title: s("Teslim ve sonrası", "Submission and beyond"),
    intro: s("Word/PDF/LaTeX çıktısı, biçim şablonu, savunma ve dergi süreci.", "Word/PDF/LaTeX output, format template, defence and journal process."),
    articles: [
      { id: "disa", title: s("Word ve PDF olarak indirme", "Downloading as Word and PDF"), where: s("Üst çubuk: “Dışa aktar”", "Top bar: “Export”"), steps: [
        s("“Tüm çalışma” veya “Seçili bölümler”i seçin.", "Choose “Whole work” or “Selected sections”."),
        s("Word (.docx) veya PDF: kapak, içindekiler, başlık numaraları, dipnotlar, tablo/şekil başlıkları ve kaynakça otomatik.", "Word (.docx) or PDF: cover, table of contents, heading numbers, footnotes, captions and references are automatic."),
      ] },
      { id: "bicim", title: s("Biçim ve kapak ayarları", "Format and cover settings"), where: s("“Dışa aktar” → “Biçim ve kapak ayarları”", "“Export” → “Format and cover settings”"), steps: [
        s("“Hazır şablon” seçin ya da yazı tipi, punto, satır aralığı, kenar boşlukları, sayfa numarası, “T.C.” başlığı ve her bölümün yeni sayfada başlamasını elle ayarlayın.", "Pick a “Ready template” or set font, size, line spacing, margins, page numbers, “T.C.” header and new page per chapter manually."),
        s("Kapak bilgilerini (üniversite, enstitü, danışman) girin → “Kaydet”.", "Enter cover details (university, institute, advisor) → “Save”."),
        s("Üniversitenizin yazım kılavuzunu Proje ayarları → “Kılavuz yükle” ile ekleyin; asistan ve denetimler buna uyar.", "Add your university’s writing guide via Project settings → “Upload guide”; the assistant and checks follow it."),
      ] },
      { id: "latex", title: s("LaTeX ve Overleaf", "LaTeX and Overleaf"), where: s("“Dışa aktar” → “LaTeX (.tex + .bib, ZIP)” / “Overleaf’te aç”", "“Export” → “LaTeX (.tex + .bib, ZIP)” / “Open in Overleaf”"), steps: [
        s("ZIP: main.tex, references.bib ve şekiller; atıflar biblatex komutlarına dönüşür, sayfa numaraları korunur.", "ZIP: main.tex, references.bib and figures; citations become biblatex commands and keep page numbers."),
        s("“Overleaf’te aç” aynı dosyaları yeni sekmede Overleaf projesi olarak açar (pdfLaTeX + Biber).", "“Open in Overleaf” opens the same files as an Overleaf project (pdfLaTeX + Biber)."),
      ] },
      { id: "savunma", title: s("Savunma sunumu ve provası", "Defence slides and rehearsal"), plan: "defense", where: s("“Dışa aktar” → “Savunma sunumu (.pptx)”; “Araçlar” → “Savunma provası”", "“Export” → “Defence slides (.pptx)”; “Tools” → “Defence rehearsal”"), steps: [
        s("Sunum, çalışmanızın bölümlerinden otomatik hazırlanır; PowerPoint’te düzenleyebilirsiniz.", "Slides are generated from your sections; edit them in PowerPoint."),
        s("Provada jüri soruları sorulur; sesli veya yazılı cevap verirsiniz, puan ve geri bildirim alırsınız.", "In the rehearsal you get jury questions, answer by voice or text and receive a score and feedback."),
      ] },
      { id: "dergi", title: s("Dergi önerisi ve ön yazı", "Journal suggestions and cover letter"), plan: "journals", where: s("“Dışa aktar” → “Dergi önerisi ve ön yazı”", "“Export” → “Journal suggestions and cover letter”"), steps: [
        s("Çalışmanıza uygun dergiler önerilir; arama da yapabilirsiniz.", "Suitable journals are suggested; you can also search."),
        s("“Bu dergi için ön yazı hazırla”; “Derginin yazar kılavuzunu yükle” → “Kılavuza uygunluk kontrol listesi”.", "“Prepare cover letter for this journal”; “Upload author guidelines” → “Guideline compliance checklist”."),
      ] },
      { id: "hakem", title: s("Hakem yorumlarına cevap", "Responding to reviewers"), plan: "reviewer", where: s("“Araçlar” → “Hakem yorumlarına cevap”", "“Tools” → “Respond to reviewers”"), steps: [
        s("Hakem yorumlarını yapıştırın.", "Paste the reviewer comments."),
        s("“Cevap mektubu hazırla”: her yoruma madde madde, kibar ve gerekçeli cevap; yapılacak değişiklikler önerilir.", "“Prepare response letter”: point-by-point, polite, reasoned answers with suggested changes."),
      ] },
    ],
  },
  {
    id: "hesap", icon: "user",
    title: s("Hesap ve ayarlar", "Account and settings"),
    intro: s("Paket yükseltme, davet, kurum lisansı, verileriniz ve görünüm.", "Upgrades, invitations, institutional licence, your data and appearance."),
    articles: [
      { id: "abonelik", title: s("Hesap ve abonelik", "Account and subscription"), where: s("Sol menü: “Hesap ve abonelik”", "Left menu: “Account and subscription”"), steps: [
        s("“Profil”: ad soyad ve varsayılan atıf stili; “Şifremi değiştir”.", "“Profile”: name and default citation style; “Change password”."),
        s("“Bu ayki kullanım”: yapay zekâ istekleri, kaynak taramaları, depolama ve aktif projeler.", "“This month’s usage”: AI requests, source searches, storage and active projects."),
        s("“Paketler” → “Yükselt” → “WhatsApp ile yükselt”; “Süreyi uzat”.", "“Plans” → “Upgrade” → “Upgrade via WhatsApp”; “Extend”."),
      ] },
      { id: "davet", title: s("Davet et, kazan", "Invite and earn"), where: s("Sol menü altında: “Davet et, kazan”", "Bottom of left menu: “Invite & earn”"), steps: [
        s("Davet bağlantınızı paylaşın.", "Share your invite link."),
        s("Bağlantınızla kaydolan kişi e-postasını doğruladığında size ek yapay zekâ isteği ve kaynak taraması hakkı tanımlanır; zil simgesinde bildirim görürsünüz.", "When someone signs up via your link and confirms their email, you get extra AI requests and source searches; a notification appears under the bell."),
      ] },
      { id: "kurum", title: s("Kurum lisansı", "Institutional licence"), where: s("“Hesap ve abonelik” → “Kurum kodu”", "“Account and subscription” → “Institution code”"), steps: [
        s("Kurumunuzun verdiği kodu girerek kurum lisansına katılın; “Kurumdan ayrıl” ile ayrılın.", "Join with the code from your institution; leave with “Leave institution”."),
        s("Kurum yöneticisi yalnızca üye bilgilerini ve kullanım sayılarını görür; çalışmalarınızın içeriğini göremez.", "Institution admins only see member info and usage counts, never the content of your works."),
      ] },
      { id: "veriler", title: s("Verileriniz ve hesabı silme", "Your data and deleting your account"), where: s("“Hesap ve abonelik” → “Verilerim (KVKK / GDPR)”", "“Account and subscription” → “My data (KVKK / GDPR)”"), steps: [
        s("“Verilerimi indir”: tüm verileriniz JSON olarak.", "“Download my data”: all your data as JSON."),
        s("“Veri talebi oluştur (KVKK)” veya “Hesabımı sil”. Ayrıntılar “Güvenlik ve Gizlilik” sayfasında.", "“Create data request (KVKK)” or “Delete my account”. Details on the “Security & Privacy” page."),
      ] },
      { id: "gorunum", title: s("Dil, gece modu ve telefon", "Language, dark mode and phone"), where: s("Sol menünün altı", "Bottom of left menu"), steps: [
        s("Dil seçiciyle Türkçe/English/Deutsch; ay/güneş simgesiyle gece/gündüz modu.", "Switch between Türkçe, English and Deutsch with the language picker; dark/light mode with the moon/sun icon."),
        s("Telefonda alttaki sekmeler: “Bölümler”, “Metin”, “Asistan”, “Kaynaklar”, “Diğer”; “⋯” menüsünde atıf stili, araçlar ve ayarlar.", "On phones use the bottom tabs: “Sections”, “Text”, “Assistant”, “Sources”, “More”; the “⋯” menu has style, tools and settings."),
        s("“Uygulamayı yükle” ile siteyi telefonunuza uygulama gibi ekleyebilirsiniz.", "Use “Install app” to add the site to your phone like an app."),
      ] },
    ],
  },
  {
    id: "sorunlar", icon: "wrench",
    title: s("Sorun giderme", "Troubleshooting"),
    intro: s("Sık karşılaşılan durumlar ve ne yapmanız gerektiği.", "Common situations and what to do."),
    articles: [
      { id: "kaydedilemedi", title: s("“Kaydedilemedi” veya “Çevrim dışı”", "“Could not save” or “Offline”"), steps: [
        s("Metniniz kaybolmaz: cihazınızda saklanır ve bağlantı gelince otomatik gönderilir.", "Your text is not lost: it is kept on your device and sent automatically when you reconnect."),
        s("Sayfayı kapatmadan önce sol üstte “Tüm değişiklikler kaydedildi” yazısını bekleyin.", "Before closing, wait for “All changes saved” in the top left."),
      ] },
      { id: "okunamadi", title: s("Kaynağın tam metni okunamadı", "A source’s full text could not be read"), steps: [
        s("Ücretli dergilerdeki makalelerin tam metnine otomatik ulaşılamaz; kaynak “Özet” veya “Künye” seviyesinde kalır.", "Full texts behind paywalls cannot be fetched automatically; the source stays at “Abstract” or “Metadata”."),
        s("Kütüphanenizden indirdiğiniz PDF’i kaynağın “PDF yükle” düğmesiyle ekleyin. Taranmış (resim) PDF’lerde metin okunamayabilir.", "Upload the PDF from your library with “Upload PDF”. Scanned (image) PDFs may not be readable."),
      ] },
      { id: "hak", title: s("Hakkım doldu", "My allowance ran out"), steps: [
        s("Çalışmalarınızı açabilir, düzenleyebilir ve indirebilirsiniz; yeni yapay zekâ işlemleri ay başında açılır.", "You can still open, edit and download; new AI actions resume at the start of the month."),
        s("Hemen devam etmek için “Hesap ve abonelik” → “Yükselt”.", "To continue now: “Account and subscription” → “Upgrade”."),
      ] },
      { id: "destek", title: s("Bulamadığım bir şey var", "I can’t find something"), steps: [
        s("Asistana “Nereden grafik oluşturabilirim?” gibi kullanım soruları sorabilirsiniz; menü adlarıyla adım adım cevap verir.", "Ask the assistant usage questions like “Where do I create a chart?”; it answers step by step with menu names."),
        s("Çalışma alanında “?” simgesiyle “Rehberli tur”u yeniden başlatın.", "Restart the “Guided tour” with the “?” icon in the workspace."),
        s("Sol menüde “Geri bildirim” ile bize yazın.", "Write to us via “Feedback” in the left menu."),
      ] },
    ],
  },
];

export function guideArticleCount(): number { return GUIDE.reduce((n, c) => n + c.articles.length, 0); }
