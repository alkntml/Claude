/**
 * Erişilebilirlik beyanı (D213). Yalnızca yapılan denetimi ve gerçek durumu anlatır; tam uyum iddia edilmez.
 * Yeni bir denetim yapıldığında tarih ve kapsam güncellenir.
 */
export const A11Y = {
  tr: {
    title: "Erişilebilirlik beyanı",
    lead: "Academiana’yı engelli kullanıcılar dahil herkesin rahatça kullanabilmesi için çalışıyoruz. Hedefimiz Web İçeriği Erişilebilirlik Yönergeleri (WCAG) 2.1, AA düzeyidir.",
    sections: [
      { h: "Uyum durumu", p: ["Academiana WCAG 2.1 AA ile kısmen uyumludur: aşağıda yazan denetimde bulunan sorunlar giderildi, ancak bağımsız bir uzman denetimi henüz yapılmadı ve bazı içerikler (aşağıda) tam uyumlu değildir."] },
      { h: "Neyi, nasıl denetledik?", list: [
        "16 Kasım 2026’da herkese açık 15 sayfa ile kontrol paneli, çalışma alanı, kalite kontrol, kaynak araştırması ve hesap ekranları; açık ve gece modunda, bilgisayar ve telefon boyutunda otomatik erişilebilirlik testinden (axe-core, WCAG 2.1 A ve AA kuralları) geçirildi.",
        "Bulunan sorunlar giderildi: gri yazıların ve bağlantıların renk karşıtlığı en az 4,5:1’e çıkarıldı, gece modunda açık renkli zeminler koyu yüzeye uyarlandı, form alanları etiketlerine bağlandı, editöre ve kaydırılabilir tablolara ekran okuyucu adı ve klavye erişimi eklendi.",
        "Her sayfanın başına klavye kullanıcıları için “İçeriğe geç” bağlantısı eklendi; klavyeyle gezinirken odaklanılan öğe belirgin bir çerçeveyle gösterilir.",
        "Komut arama (Ctrl+K) ve klavye kısayolları listesi (?) ile özelliklere fare kullanmadan ulaşılabilir.",
      ] },
      { h: "Bilinen sınırlamalar", list: [
        "Literatür haritası ve grafikler görseldir; aynı bilgiler tablo ve listelerde de verilir, ancak harita ekran okuyucuyla tam olarak gezilemez.",
        "Taranmış (görüntüden oluşan) PDF’lerde seçilebilir metin olmadığı için kaynak okuyucu bu metinleri okutamaz.",
        "Tanıtım sayfalarındaki hareketli örnek ekranlar temsilîdir; işletim sisteminizde “hareketi azalt” açıksa hareket durur.",
        "Dışa aktarılan Word ve PDF belgelerinin erişilebilirliği henüz ayrıca denetlenmedi.",
      ] },
      { h: "Geri bildirim", p: ["Erişilebilirlikle ilgili bir sorunla karşılaşırsanız iletisim@academiana.com.tr adresine yazın; sorunu ve kullandığınız cihazı, tarayıcıyı ve yardımcı teknolojiyi belirtirseniz daha hızlı çözeriz."] },
    ],
    date: "Beyan tarihi: 16 Kasım 2026",
  },
  en: {
    title: "Accessibility statement",
    lead: "We work to make Academiana comfortable to use for everyone, including people with disabilities. Our target is the Web Content Accessibility Guidelines (WCAG) 2.1, level AA.",
    sections: [
      { h: "Conformance status", p: ["Academiana is partially conformant with WCAG 2.1 AA: the issues found in the review below have been fixed, but no independent expert audit has been carried out yet and some content (listed below) is not fully conformant."] },
      { h: "What we tested and how", list: [
        "On 16 November 2026, 15 public pages and the dashboard, workspace, quality check, source research and account screens were run through automated accessibility testing (axe-core, WCAG 2.1 A and AA rules) in light and dark mode, at desktop and phone sizes.",
        "The issues found were fixed: the colour contrast of grey text and links was raised to at least 4.5:1, light backgrounds were adapted to dark surfaces in dark mode, form fields were linked to their labels, and the editor and scrollable tables received screen-reader names and keyboard access.",
        "A “Skip to content” link was added at the top of every page for keyboard users; the focused element is shown with a clear outline while navigating by keyboard.",
        "Command search (Ctrl+K) and the keyboard shortcut list (?) make features reachable without a mouse.",
      ] },
      { h: "Known limitations", list: [
        "The literature map and charts are visual; the same information is also given in tables and lists, but the map cannot be fully navigated with a screen reader.",
        "Scanned (image-only) PDFs contain no selectable text, so the source reader cannot read them aloud.",
        "Animated example screens on the marketing pages are illustrations; if “reduce motion” is enabled on your system, the motion stops.",
        "The accessibility of exported Word and PDF documents has not yet been reviewed separately.",
      ] },
      { h: "Feedback", p: ["If you encounter an accessibility problem, write to iletisim@academiana.com.tr; telling us the issue and your device, browser and assistive technology helps us fix it faster."] },
    ],
    date: "Statement date: 16 November 2026",
  },
  de: {
    title: "Erklärung zur Barrierefreiheit",
    lead: "Wir arbeiten daran, dass Academiana für alle gut nutzbar ist, auch für Menschen mit Behinderungen. Unser Ziel sind die Richtlinien für barrierefreie Webinhalte (WCAG) 2.1, Stufe AA.",
    sections: [
      { h: "Stand der Vereinbarkeit", p: ["Academiana ist teilweise mit WCAG 2.1 AA vereinbar: Die bei der unten beschriebenen Prüfung gefundenen Probleme wurden behoben, eine unabhängige Expertenprüfung steht jedoch noch aus, und einige Inhalte (siehe unten) sind nicht vollständig barrierefrei."] },
      { h: "Was und wie wir geprüft haben", list: [
        "Am 16. November 2026 wurden 15 öffentliche Seiten sowie Übersicht, Arbeitsbereich, Qualitätsprüfung, Quellenrecherche und Konto im hellen und dunklen Modus, in Desktop- und Smartphone-Größe automatisiert geprüft (axe-core, WCAG-2.1-Regeln A und AA).",
        "Gefundene Probleme wurden behoben: Der Farbkontrast grauer Texte und Links wurde auf mindestens 4,5:1 erhöht, helle Hintergründe wurden im dunklen Modus angepasst, Formularfelder mit ihren Beschriftungen verknüpft, Editor und scrollbare Tabellen erhielten Namen für Screenreader und Tastaturzugang.",
        "Oben auf jeder Seite gibt es für Tastaturnutzer einen Link „Zum Inhalt springen“; das fokussierte Element wird bei der Tastaturnavigation deutlich umrandet.",
        "Befehlssuche (Strg+K) und die Liste der Tastenkürzel (?) machen Funktionen ohne Maus erreichbar.",
      ] },
      { h: "Bekannte Einschränkungen", list: [
        "Literaturkarte und Diagramme sind visuell; dieselben Informationen stehen auch in Tabellen und Listen, die Karte ist mit Screenreadern aber nicht vollständig bedienbar.",
        "Gescannte PDFs (nur Bilder) enthalten keinen markierbaren Text, daher kann der Quellenleser sie nicht vorlesen.",
        "Animierte Beispielbildschirme auf den Informationsseiten sind Illustrationen; ist „Bewegung reduzieren“ aktiviert, stoppt die Bewegung.",
        "Die Barrierefreiheit exportierter Word- und PDF-Dokumente wurde noch nicht gesondert geprüft.",
      ] },
      { h: "Rückmeldung", p: ["Wenn Sie auf ein Problem mit der Barrierefreiheit stoßen, schreiben Sie an iletisim@academiana.com.tr; Angaben zum Problem, zu Gerät, Browser und Hilfstechnologie helfen uns, es schneller zu beheben."] },
    ],
    date: "Datum der Erklärung: 16. November 2026",
  },
} as const;
