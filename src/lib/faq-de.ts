/**
 * Sık sorulan soruların Almancası (D143). Anahtar: faq.ts’teki soru kimliği. Türkçe/İngilizce metin değişince
 * buradaki karşılığı da güncellenmeli; tests/faq.test.ts eksik kimliği yakalar.
 */
export const FAQ_GROUP_DE: Record<string, string> = {
  genel: "Allgemein",
  neden: "Warum Academiana?",
  kaynaklar: "Quellen und Genauigkeit",
  yazim: "Schreiben, Formatierung und Export",
  intihal: "Plagiat und Originalität",
  gizlilik: "Datenschutz und Sicherheit",
  odeme: "Tarife und Zahlung",
  teknik: "Nutzung und Technik",
};

export const FAQ_DE: Record<string, { q: string; a: string }> = {
  "ayiran": {
    q: "Was unterscheidet Academiana von anderen KI-Tools?",
    a: "Academiana ist kein allgemeiner Chatbot, sondern ein Arbeitsbereich, der **von Grund auf für wissenschaftliches Arbeiten entwickelt** wurde. Quellen stammen aus echten wissenschaftlichen Datenbanken, und die KI zitiert nur Quellen, die Ihrem Projekt hinzugefügt wurden und deren bibliografische Angaben überprüfbar sind; keine Quellen, DOIs oder Daten zu erfinden, ist eine Grundregel des Systems. Bei jeder Quelle wird klar angezeigt, ob die Angaben, das Abstract oder der Volltext gelesen wurden. Alle Schritte – von der Themenwahl über Konzept, Recherche, Schreiben und Statistik bis zur Prüfung vor der Abgabe – laufen an einem Ort und greifen ineinander.",
  },
  "veri-tabanlari": {
    q: "In welchen wissenschaftlichen Datenbanken wird gesucht?",
    a: "Eine einzige Suche durchsucht **16 wissenschaftliche Quellen** gleichzeitig: OpenAlex, Crossref, PubMed / Europe PMC, arXiv, DOAJ, OpenAIRE, ERIC, DBLP, DataCite, PLOS, Zenodo, HAL, INSPIRE-HEP, Unpaywall, Google Books und Open Library. Sind Zugangsschlüssel hinterlegt, kommen Springer Nature, IEEE Xplore und NASA ADS hinzu. Die Ergebnisse werden zusammengeführt, Dubletten entfernt und nach Relevanz für Ihr Thema sortiert; für türkischsprachige und in der Türkei verortete Publikationen gibt es eine eigene Option. DOIs werden über Crossref und DataCite, PMIDs über Europe PMC und arXiv-Kennungen über arXiv verifiziert.",
  },
  "altyapi": {
    q: "Wie sicher und zuverlässig ist Ihre Infrastruktur?",
    a: "Anwendung, Datenbank und Dateispeicher laufen **innerhalb der Europäischen Union, in der Rechenzentrumsregion Frankfurt**. Die Daten jeder Nutzerin und jedes Nutzers werden auf Datenbankebene durch zeilenbasierte Zugriffsregeln (RLS) voneinander getrennt; diese Regeln werden durch automatisierte Tests überprüft. Verbindungen sind mit HTTPS und HSTS verschlüsselt; eine Content Security Policy (CSP), Prüfungen der Anfrageherkunft und Schutz vor Angriffen auf interne Netze sind aktiv. Hochgeladene Dateien liegen in privatem Speicher und öffnen sich nur über zeitlich begrenzte Links; geheime Schlüssel werden nie an den Browser gesendet. Die Funktionsweise der Plattform wird durch mehr als 500 automatisierte Tests überprüft. Einzelheiten finden Sie in der Datenschutzinformation nach KVKK und auf der Seite Methode und Transparenz.",
  },
  "modeller": {
    q: "Welche KI-Modelle verwenden Sie?",
    a: "Academiana nutzt die **Claude**-Modellfamilie von Anthropic und wählt das Modell nach dem Anspruch der Aufgabe: das leistungsstärkste Modell für komplexe Arbeiten wie das Schreiben von Abschnitten und eingehende Prüfungen, ein ausgewogenes Modell für mittlere Aufgaben und ein schnelles Modell für kurze, einfache Aufgaben. So erhalten Sie bei jeder Aufgabe passende Qualität und Geschwindigkeit. Der Assistent nutzt das Konzept Ihrer Arbeit, das Projektgedächtnis und die Ihrem Projekt hinzugefügten Quellen als Kontext; er schreibt nicht nur aus allgemeinem Wissen.",
  },
  "tek-yerde": {
    q: "Was kann ich alles an einem Ort erledigen?",
    a: "Von der Themenfindung und Titelvorschlägen über das Konzept Ihrer Arbeit und die Quellenrecherche bis zum abschnittsweisen Schreiben geschieht alles im selben Arbeitsbereich. Hinzu kommen **statistische Analysen** (t-Tests, ANOVA, Korrelation, Regression, Chi-Quadrat, Cronbachs Alpha, Mann-Whitney, Kruskal-Wallis – mit Tabellen und Sätzen nach APA 7), Erstellung und Durchführung von Umfragen, systematische Reviews nach PRISMA 2020, eine Literaturkarte, die Aussagenprüfung, die zeigt, ob zitierte Sätze von ihren Quellen gestützt werden, Verteidigungsprobe und Präsentationserstellung, gemeinsames Live-Schreiben mit Mitautorinnen und Mitautoren sowie schreibgeschützte Freigabe an die Betreuung. Ihre Arbeit können Sie als Word, PDF oder LaTeX herunterladen und mit einem Klick an Overleaf senden.",
  },
  "bicim-guclu": {
    q: "Was bietet es bei wissenschaftlicher Formatierung und Zitation?",
    a: "Unterstützt werden **10 Zitierstile**, darunter APA 7 und 6, ISNAD 2, Chicago, Turabian, MLA, Harvard, Vancouver, IEEE und AMA. Zitate werden nicht als einfacher Text, sondern als mit der Quelle verknüpfte Elemente gespeichert; wechseln Sie den Stil, werden der gesamte Text und das Literaturverzeichnis sofort umgestellt. Auch Tabellen- und Abbildungsbeschriftungen werden passend zum gewählten Stil formatiert. Sie können die Schreibrichtlinie Ihrer Hochschule hochladen, um eine Gliederung und Formatierungsregeln vorgeschlagen zu bekommen, und Ihre Arbeit mit Titelblatt, Inhaltsverzeichnis, nummerierten Überschriften, Fußnoten und Literaturverzeichnis exportieren.",
  },
  "seffaflik": {
    q: "Warum ist Ihnen Transparenz so wichtig?",
    a: "Weil Vertrauen in wissenschaftliche Arbeit davon abhängt, nachvollziehen zu können, was getan wurde. Auf der Seite **Methode und Transparenz** erklären wir offen, woher die Quellen stammen, wie sie verifiziert werden, wie der Qualitätswert berechnet wird und wo die Grenzen des Systems liegen; KI-Befunde beeinflussen den Qualitätswert nicht. Da wir keinen lizenzierten Plagiatsdienst nutzen, zeigen wir keinen Plagiatsprozentsatz an und erwecken nicht den Anschein, etwas zu tun, was wir nicht tun. Was unsere Nutzerinnen und Nutzer in ihren eigenen Worten sagen, lesen Sie auf der Startseite.",
  },
  nedir: {
    q: "Was ist Academiana?",
    a: "Ein Arbeitsbereich für alle, die eine Abschlussarbeit, einen Fachartikel, eine Literaturübersicht oder ein Forschungsexposé erstellen. Academiana erstellt für Ihre Art von Arbeit einen Fahrplan Abschnitt für Abschnitt, findet und verifiziert Quellen in echten wissenschaftlichen Datenbanken, formatiert Zitate automatisch im gewählten Stil und stellt Ihnen beim Schreiben einen wissenschaftlichen Assistenten zur Seite. Am Ende laden Sie Ihre Arbeit mit Titelblatt und Inhaltsverzeichnis als Word oder PDF herunter.",
  },
  kimler: {
    q: "Für wen ist es geeignet?",
    a: "Für Studierende, die eine Bachelorarbeit oder ein Abschlussprojekt schreiben, für Master- und Promotionsstudierende sowie für Forschende und Lehrende, die Zeitschriftenartikel vorbereiten. Unterstützt werden Arbeiten auf Türkisch, Englisch und Deutsch; für die Formatvorgaben türkischer Hochschulen gibt es eigene Einstellungen. Die Oberfläche ist auf Türkisch, Englisch und Deutsch verfügbar.",
  },
  "tamamen-yazar-mi": {
    q: "Schreibt die KI meine ganze Abschlussarbeit oder meinen Artikel?",
    a: "Nein, und das ist Absicht. Der Assistent schlägt Abschnittsentwürfe vor, findet Quellen und verbessert Ihre Sprache, aber **Sie** entscheiden, was in den Text kommt: Kein Entwurf gelangt in Ihr Dokument, bevor Sie auf „Zum Dokument hinzufügen“ klicken, und der vorherige Stand wird jedes Mal im Versionsverlauf gespeichert.\nSie sind die Autorin bzw. der Autor. Die Entwürfe zu lesen und mit eigenen Gedanken weiterzuentwickeln, ist sowohl für die wissenschaftliche Integrität als auch für die Fragen in Ihrer Verteidigung notwendig.",
  },
  "etik-mi": {
    q: "Ist der Einsatz von KI wissenschaftlich zulässig? Kann ich Probleme bekommen?",
    a: "Das hängt von der Institution ab. Viele Hochschulen und Zeitschriften erlauben den Einsatz von KI, verlangen aber, dass er **offengelegt** wird; manche untersagen bestimmte Nutzungen. Lesen Sie zuerst die KI-Richtlinie Ihrer Hochschule, Ihrer Graduiertenschule oder Ihrer Zielzeitschrift und sprechen Sie mit Ihrer Betreuung.\nDie Plattform ist darauf ausgelegt, Sie dabei zu unterstützen: Sie erfindet keine Quellen oder Daten, verknüpft jedes Zitat mit einer überprüfbaren Quelle und hilft Ihnen, eine Offenlegungserklärung zu formulieren. Reichen Sie vom Assistenten geschriebenen Text nicht ein, ohne ihn zu prüfen und Ihren eigenen Beitrag einzubringen.",
  },
  "uydurur-mu": {
    q: "Erfindet die KI Quellen, die es nicht gibt?",
    a: "Nein. Das ist das größte Problem allgemeiner Chatbots, und Academiana verhindert es auf Systemebene. Der Assistent kann **nur Quellen zitieren, die Ihrem Projekt hinzugefügt wurden**; diese stammen aus echten Datenbanken, und solche mit DOI, PubMed- oder arXiv-ID werden mit den offiziellen Datensätzen abgeglichen. Eine Quelle, die nicht in Ihrer Liste steht, kann nicht zitiert werden.\nAußerdem schreibt er keine gesicherten Aussagen, die er nicht belegen kann: Er markiert das Thema und sucht weiter nach Quellen.",
  },
  nereden: {
    q: "Woher stammen die Quellen?",
    a: "Aus 16 wissenschaftlichen Datenbanken – nach Entfernen der Dubletten über 250 Millionen verschiedene Publikationen. Die wichtigsten sind OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, OpenAIRE, ERIC, PLOS, HAL und Zenodo; durchsuchbar sind auch türkischsprachige und Türkei-bezogene Publikationen (einschließlich DergiPark-Zeitschriften). Über Links lässt sich dieselbe Suche in TR Dizin und im nationalen Thesenzentrum YÖK ausführen. Eigene Quellen fügen Sie per DOI, manuell, durch Hochladen eines PDFs oder aus einer Zotero-/Mendeley-/EndNote-Datei hinzu.",
  },
  dogrulanmadi: {
    q: "Bei einer Quelle steht „Nicht verifiziert“. Ist sie gefälscht?",
    a: "Nein, das heißt nicht, dass sie gefälscht ist. Es bedeutet, dass die Quelle keine persistente Kennung wie DOI, PubMed- oder arXiv-ID hat oder die Kennung nicht dem offiziellen Datensatz zugeordnet werden konnte; das ist bei Büchern, älteren Publikationen und einigen türkischen Zeitschriften häufig. Prüfen Sie die bibliografischen Angaben; wenn es eine DOI gibt, ergänzen Sie sie und klicken Sie auf „Verifizieren“. Nicht verifizierte Quellen werden auch im Qualitätsbericht markiert.",
  },
  erisim: {
    q: "Was bedeuten „Nur bibliografische Angaben“, „Abstract gelesen“ und „Volltext gelesen“?",
    a: "Es zeigt, wie viel von der Quelle der Assistent tatsächlich gelesen hat. **Nur bibliografische Angaben:** Bekannt sind nur Autor:in, Titel, Jahr usw.; über den Inhalt werden keine Aussagen gemacht. **Abstract gelesen:** Nur das Abstract wurde gelesen; keine Aussagen über detaillierte Methoden oder Ergebnisse. **Volltext gelesen:** Der Open-Access-Volltext oder ein von Ihnen hochgeladenes PDF wurde gelesen; wörtliche Zitate und Seitenzahlen gibt es nur aus solchen Quellen.",
  },
  "ucretli-makale": {
    q: "Kann es kostenpflichtige Artikel lesen?",
    a: "Nein; es liest nur rechtmäßig frei zugängliche Volltexte und lädt keine kostenpflichtigen Inhalte herunter. Ein PDF, das Sie über das Abonnement Ihrer Hochschule heruntergeladen haben, können Sie im Tab „Quellen“ mit „PDF hochladen“ an die Quelle anhängen; diese Quelle unterstützt dann ebenfalls Zitate mit Seitenzahl und Verifizierung. Hochgeladene Dateien sind nur für Sie sichtbar.",
  },
  sayfa: {
    q: "Stimmen die Seitenzahlen in den Zitaten?",
    a: "Seitenzahlen werden nur bei Quellen angegeben, deren Volltext gelesen wurde, und zwar mit der echten Seite des gelesenen Textes – der Seite in der Zeitschrift, nicht dem Seitenindex des PDFs. Ist die Zuordnung nicht zuverlässig, wird keine Seite angegeben: Wir lassen sie lieber leer, als eine falsche Seite zu schreiben. Prüfen Sie dennoch vor der Abgabe: Klicken Sie auf ein Zitat und nutzen Sie „In der Quelle prüfen“, um die Passage mit ihrer Seite zu sehen.",
  },
  dogrula: {
    q: "Wie kann ich sicher sein, dass ein Satz wirklich von der Quelle gestützt wird?",
    a: "Für einen ganzen Abschnitt nutzen Sie die Schaltfläche **Aussagenprüfung** neben dem Abschnittstitel (oder Werkzeuge → Aussagenprüfung): Jeder zitierte Satz wird mit dem gelesenen Text seiner Quelle verglichen; das Ergebnis (gestützt / teilweise / nicht gestützt / nicht lesbar) wird mit belegender Passage und Seite aufgelistet, problematische Sätze werden im Text unterstrichen und lassen sich mit einem Klick mit dem Assistenten korrigieren. Auch starke Aussagen ohne Zitat werden markiert. Für ein einzelnes Zitat klicken Sie es im Text an und wählen **In der Quelle prüfen**. Das System findet die relevanten Passagen im gelesenen Text der Quelle, zeigt sie mit Seitenzahlen und bewertet, ob der Satz gestützt wird (stützt / teilweise / stützt nicht / zu wenig Text). Das angezeigte Zitat wird wörtlich mit dem Quellentext abgeglichen und ausgeblendet, wenn es nicht gefunden wird. Die endgültige Entscheidung liegt bei Ihnen. Ist „Auch mit meinen anderen Quellen vergleichen“ aktiviert, werden Sätze ohne Zitat oder Beleg auch mit den übrigen Quellen Ihres Projekts verglichen: Eine Quelle, die den Satz stützt, aber nicht zitiert ist, wird vorgeschlagen, und eine Quelle, deren Befunde dem Satz **widersprechen**, wird mit Zitat markiert. „Widerspricht der Quelle“ erscheint als eigenes Urteil, und die Ergebnisse lassen sich als CSV herunterladen.",
  },
  prisma: {
    q: "Kann ich ein systematisches Review (PRISMA) durchführen?",
    a: "Ja, in Pro und höheren Tarifen (Premium, Unbegrenzt). Werkzeuge → **Systematisches Review (PRISMA)**: Formulieren Sie Ihr Protokoll (Frage, Ein- und Ausschlusskriterien); sammeln Sie Einträge mit der Academiana-Suche oder durch Import von RIS/BibTeX aus Datenbanken wie Scopus, Web of Science oder PubMed (Dubletten werden automatisch abgetrennt). Beim Titel-/Abstract-Screening macht die KI nur Vorschläge; Entscheidung und Grund wählen Sie. Nach der Volltextprüfung wird das PRISMA-2020-Flussdiagramm mit den Zahlen automatisch gezeichnet; Sie können es als Abbildung einfügen, die Einträge als CSV herunterladen und die eingeschlossenen Studien mit einem Klick zu Ihren Quellen hinzufügen. Außerdem: Wahrscheinliche Dubletten werden über ähnlichen Titel und Jahr automatisch abgetrennt; im **Modus mit zwei Gutachtenden** stimmt jede Person im Team unabhängig ab, Abweichungen werden aufgelistet und Cohens Kappa wird berechnet; im Tab **Daten und Qualität** füllt die KI ein Standardformular für die eingeschlossenen Studien als Entwurf aus (mit belegenden Zitaten), das Verzerrungsrisiko wird mit einer Checkliste aus 7 Items bewertet, und eine Tabelle der Studienmerkmale kann eingefügt werden; der letzte Tab erstellt einen **Methoden- und Ergebnistext** nach PRISMA 2020 mit den Zahlen und einer Suchtabelle.",
  },
  "coklu-belge": {
    q: "Kann ich mehrere Artikel gleichzeitig vergleichen?",
    a: "Ja, in Pro und höheren Tarifen. Quellen → **Gemeinsam analysieren**: Wählen Sie 2–8 Quellen und stellen Sie allen dieselbe Frage oder nutzen Sie **Vergleichen**, um Ziel, Design, Stichprobe, Ergebnisse und Limitationen jeder Studie nebeneinander zu sehen – mit Übereinstimmungen, **abweichenden/widersprüchlichen Befunden** (mit wahrscheinlichem Grund) und Forschungslücken. Jede Aussage ist mit Quelle und Seite verknüpft; Tabelle oder Synthese fügen Sie mit lebendigen Zitaten ein. Verwendet wird nur gelesener Text (Volltext oder Abstract).",
  },
  "pdf-okuma": {
    q: "Wie werden hochgeladene oder abgerufene PDFs gelesen?",
    a: "Beim Extrahieren des Textes aus einem PDF werden der auf jeder Seite wiederholte Zeitschriftenkopf und die Seitenzahlen entfernt, am Zeilenende getrennte Wörter wieder zusammengefügt und die Abschnitte des Artikels (Abstract, Methode, Ergebnisse, Diskussion …) erkannt; das Literaturverzeichnis bleibt aus der Belegsuche heraus. Fragen wie „Welche Methode wurde verwendet?“ schauen daher zuerst im richtigen Abschnitt nach, und Zitate erscheinen mit der veröffentlichten Seitenzahl. Bei gescannten PDFs (Bildern), deren Text sich nicht markieren lässt, wird dies klar angegeben.",
  },
  latex: {
    q: "Kann ich meine Arbeit nach LaTeX oder Overleaf exportieren?",
    a: "Ja. Exportieren → **LaTeX (.tex + .bib, ZIP)** lädt Ihre Arbeit als main.tex, references.bib und Abbildungen herunter; Ihre Zitate werden zu biblatex-Befehlen (\\parencite, \\textcite), und Seitenzahlen bleiben erhalten. **In Overleaf öffnen** öffnet dieselben Dateien als Overleaf-Projekt in einem neuen Tab. APA, IEEE, MLA, Vancouver und Autor-Jahr-Stile nutzen ihre biblatex-Entsprechungen; bei Stilen ohne Entsprechung wie ISNAD wird der nächstliegende Stil gewählt und in der Datei vermerkt. Kompiliert wird mit pdfLaTeX + Biber (Overleaf-Standard).",
  },
  harita: {
    q: "Wozu dient die Literaturkarte?",
    a: "Werkzeuge → **Literaturkarte** zeigt die Quellen Ihrer Arbeit als Netzwerk aus OpenAlex-Datensätzen: direkte Zitationen, gemeinsame Literatur und Kozitationen durch andere Artikel. Ähnliche Quellen bilden farbige Cluster, die nach ihrem Thema benannt werden; Brücken- und zentrale Quellen, isolierte Quellen sowie Quellen, die Sie im Text noch nicht zitiert haben, werden markiert. Die **Zeitleiste** zeigt, wie sich Ihre Literatur über die Jahre entwickelt hat; die **Themenkarte** zeigt, welche Unterthemen Sie abdecken und welche in verwandter Literatur vorkommen, bei Ihnen aber fehlen. **Fehlende Schlüsselwerke** (von mindestens zwei Ihrer Quellen zitiert) und **Neue Arbeiten** (Artikel aus den letzten 6 Jahren, die mindestens zwei Ihrer Quellen zitieren) lassen sich mit einem Klick hinzufügen. Hinweise wie Aktualität und Lücken zwischen Clustern sind regelbasiert; es wird keine KI verwendet. Die Karte lässt sich als PNG/SVG herunterladen. Berücksichtigt werden Quellen mit DOI; verfügbar in Pro und höheren Tarifen.",
  },
  "kalite-puani": {
    q: "Was misst der Qualitätswert?",
    a: "Der Wert beginnt bei 100, und jeder regelbasierte Befund senkt ihn je nach Schwere (kritisch, Warnung, Hinweis). Gemessen werden die Konsistenz zwischen Zitaten und Literaturverzeichnis, die Überprüfbarkeit der Quellen, fehlende Abschnitte, Regeln der Wissenschaftssprache und Wiederholungen; Befunde der KI-Prüfungskommission werden angezeigt, verändern den Wert aber nicht, sodass derselbe Text immer denselben Wert erhält. Wissenschaftliche Qualität, Originalität oder Plagiate werden nicht gemessen. Die Qualitätsseite enthält den Abschnitt „Wie wird der Wert berechnet?“ und eine Checkliste vor der Abgabe; Details stehen auf der Seite **Methode und Transparenz**.",
  },
  "kendi-kaynak": {
    q: "Kann ich meine Quellen aus Zotero, Mendeley oder EndNote importieren?",
    a: "Ja. Exportieren Sie Ihre Literaturangaben aus Ihrem Programm als BibTeX (.bib), RIS (.ris) oder CSL-JSON (.json) und laden Sie sie im Tab „Quellen“ mit „Importieren“ hoch. Es werden bis zu 300 Einträge auf einmal importiert, solche mit DOI werden verifiziert, und Dubletten werden übersprungen. Auch der Export in diesen Formaten ist möglich.",
  },
  stiller: {
    q: "Welche Zitierstile werden unterstützt? Kann ich später wechseln?",
    a: "APA 7, APA 6, ISNAD 2 (im Text), MLA 9, Chicago (Autor-Jahr), Turabian, Harvard, Vancouver, IEEE und AMA. Sie können jederzeit wechseln: Zitate werden nicht als einfacher Text, sondern als mit der Quelle verknüpfte Elemente eingefügt, daher stellen sich alle Zitate im Text und das Literaturverzeichnis sofort um. Das Literaturverzeichnis entsteht automatisch aus den im Text zitierten Quellen.",
  },
  kilavuz: {
    q: "Hält es sich an die Richtlinien meiner Hochschule für Abschlussarbeiten?",
    a: "Weitgehend ja. Laden Sie Ihre Richtlinie (PDF/DOCX) in den Projekteinstellungen hoch: Der Assistent schlägt die Abschnittsstruktur und die Formatierungsregeln vor und hält sich daran. Unter „Exportieren → Format- und Titelblatteinstellungen“ legen Sie Schriftart, Schriftgröße, Zeilenabstand, Ränder, Seitenzahlen und ein Titelblatt mit Angaben zu Hochschule, Institut und Betreuung fest. Da jede Hochschule kleine Unterschiede hat, prüfen Sie das Format abschließend anhand der Richtlinie Ihrer Graduiertenschule.",
  },
  formatlar: {
    q: "In welchen Formaten kann ich meine Arbeit herunterladen?",
    a: "Word (.docx), PDF, Markdown und reiner Text – mit Titelblatt, Inhaltsverzeichnis, Überschriftennummerierung, Fußnoten und Literaturverzeichnis. Außerdem können Sie eine Präsentation für die Verteidigung (.pptx), Ihr Literaturverzeichnis (BibTeX/RIS) und die Literaturmatrix (CSV für Excel) herunterladen. Einige Formate hängen von Ihrem Tarif ab; siehe Seite „Preise“.",
  },
  bulgular: {
    q: "Kann es den Ergebnisteil schreiben? Macht es Statistik?",
    a: "Der Assistent erfindet nie Daten, Zahlen oder Ergebnisse. Wenn Sie Ihre eigenen Daten (CSV oder Excel) hochladen, führt die **Statistische Analyse** t-Tests, ANOVA, Korrelation, Regression, Chi-Quadrat, Cronbachs Alpha, Mann-Whitney und Kruskal-Wallis mit echten Berechnungen auf dem Server aus (dieselben Formeln wie in SPSS) und fügt das Ergebnis als APA-7-Tabelle und -Satz ein. Anschließend hilft Ihnen der Assistent, diese echten Ergebnisse zu interpretieren.",
  },
  dil: {
    q: "Kann ich meine Abschlussarbeit oder meinen Artikel auf Englisch oder Deutsch schreiben?",
    a: "Ja. Jede Arbeit hat eine eigene Sprache (Türkisch, Englisch oder Deutsch); der Assistent schreibt in dieser Sprache, Zitierbegriffe (vd./et al./et al., s./p./S.) sowie Tabellen- und Abbildungsbeschriftungen passen sich an, und auch der Export als Word, PDF und LaTeX erfolgt in dieser Sprache. Bei türkischen Arbeiten erstellt „Abstract auf Türkisch und Englisch“ die wissenschaftliche englische Fassung, bei deutschen Arbeiten eine Zusammenfassung und ein englisches Abstract. Die Oberfläche ist auf Türkisch, Englisch und Deutsch verfügbar.",
  },
  ceviri: {
    q: "Kann ich meinen türkischen Text ins wissenschaftliche Englisch übersetzen? Gehen meine Zitate dabei kaputt?",
    a: "Ja. Im Arbeitsbereich übersetzt **Werkzeuge → Sprache & Übersetzung** (oder **Übersetzen** in der Blase, die beim Markieren von Text erscheint) einen Abschnitt, eine Unterüberschrift oder eine Auswahl wissenschaftlich zwischen Türkisch, Englisch und Deutsch. Zitate, Fußnoten, Abbildungen, Tabellen und Überschriftenebenen bleiben erhalten; Dezimal- und Statistiknotation (Ort./SS ↔ M/SD) wird angepasst, Zahlen ändern sich nie. Sie können amerikanisches oder britisches Englisch wählen. Das **Glossar** hält die Entsprechungen Ihres Fachgebiets (z. B. öz yeterlik → self-efficacy) einheitlich. Die Fassung vor der Übersetzung bleibt im Verlauf erhalten. Der Tab **Sprachprüfung** schlägt Korrekturen zu Rechtschreibung, Grammatik, Zeichensetzung und wissenschaftlichem Ton einzeln vor, die Sie mit einem Klick übernehmen können. Übersetzung und Prüfungen werden Ihrem monatlichen KI-Kontingent angerechnet.",
  },
  "kaynaga-sor": {
    q: "Kann ich Fragen zu einem bestimmten Artikel stellen (Methode, Stichprobe, Ergebnisse)?",
    a: "Ja. Im Tab **Quellen** öffnet die Schaltfläche **Fragen** neben jeder Quelle einen Chat mit diesem Artikel. Nutzen Sie vorbereitete Fragen wie „Methode“, „Stichprobe“, „Zentrale Ergebnisse“, „Limitationen“, „Zitierfähige Sätze“ oder eigene; die Antworten stützen sich nur auf den gelesenen Text dieser Quelle und enthalten Seitenzahlen, wenn der Volltext gelesen wurde. **Mit Zitat in den Text einfügen** übernimmt die Antwort mit einem Zitat samt Seitenzahl. Wurde nur das Abstract gelesen, wird das klar angegeben; Sie können den Open-Access-Volltext abrufen oder Ihr eigenes PDF hochladen.",
  },
  "arastirmalar-ne-diyor": {
    q: "Was ist „Was sagt die Forschung?“",
    a: "Sie geben eine Forschungsfrage ein (z. B. „Beeinflusst die Schlafdauer die akademische Leistung?“); das System findet echte Artikel in wissenschaftlichen Datenbanken, liest ihre Abstracts und gibt eine kurze Antwort, in der jeder Satz mit einem nummerierten Artikel verknüpft ist. Bei Ja/Nein-Fragen zeigt die **Konsensanzeige**, wie viele Studien in dieselbe Richtung weisen. Gelesen werden nur Abstracts, und das wird klar angegeben; es ist keine Literaturübersicht. Die Funktion steht ohne Anmeldung bei den kostenlosen Tools bereit und im Arbeitsbereich unter **Werkzeuge**, wo Sie die Artikel mit einem Klick Ihrer Arbeit hinzufügen können.",
  },
  "ozgun-mu": {
    q: "Ist die Arbeit originell?",
    a: "Ja. Jeder Text wird in diesem Moment neu geschrieben, auf Grundlage von Thema, Methode und den Quellen Ihres Projekts. Informationen aus Quellen werden nie kopiert, sondern in wissenschaftlicher Sprache umformuliert, und jede Aussage ist per Zitat mit ihrer Quelle verknüpft. Ist ein wörtliches Zitat nötig, steht es in Anführungszeichen, mit Seitenzahl, wenn der Volltext der Quelle gelesen wurde. Für andere Nutzende erzeugter Text wird nie wiederverwendet, und Ihre Arbeit wird mit niemandem geteilt.",
  },
  benzerlik: {
    q: "Welchen Ähnlichkeitswert (Plagiat) kann ich erwarten?",
    a: "Da Texte originär geschrieben und nicht aus Quellen übernommen werden, fallen Ähnlichkeitswerte niedrig aus; nach unserer Erfahrung bleibt der Wert ohne Literaturverzeichnis und wörtliche Zitate meist unter 5 %. Der genaue Wert hängt von der Software Ihrer Institution (Turnitin, iThenticate usw.), dem Vergleichsarchiv und den Berichtseinstellungen ab. Etablierte Fachformulierungen in Methodenteil und Begriffsdefinitionen können kleine Übereinstimmungen erzeugen; das ist normal.",
  },
  "intihal-orani": {
    q: "Kann ich auf der Plattform einen Ähnlichkeitsbericht erhalten?",
    a: "Ein Ähnlichkeitsbericht lässt sich zuverlässig nur mit lizenzierten Diensten mit großen Publikationsarchiven wie Turnitin oder iThenticate erstellen, daher zeigen wir auf der Plattform keinen geschätzten Wert. Wir empfehlen, Ihre Arbeit vor der Abgabe mit der Ähnlichkeitssoftware Ihrer Hochschule zu prüfen.",
  },
  "dogrudan-alinti": {
    q: "Wie werden wörtliche Zitate behandelt?",
    a: "Jede wörtlich aus einer Quelle übernommene Formulierung steht in Anführungszeichen mit Autor:in und Jahr, dazu die Seitenzahl, wenn der Volltext gelesen wurde; lange Zitate folgen der Blockzitat-Regel des gewählten Zitierstils (APA 7, ISNAD usw.). Zitate, die in einem Ähnlichkeitsbericht auftauchen, sind daher korrekt belegt.",
  },
  "kim-gorur": {
    q: "Kann jemand anderes meine Arbeit sehen?",
    a: "Andere Nutzende nicht: Projekte, Quellen, Dateien und Unterhaltungen jeder Person sind auf Datenbankebene nur für sie selbst zugänglich. Ausnahmen: **(1)** Wenn Sie über „Mit der Betreuung teilen“ einen Link erstellen, kann die Person mit diesem Link Ihre Arbeit nur lesen; Sie können den Link jederzeit widerrufen. **(2)** Wenn Sie einer Institutionslizenz beigetreten sind, sieht der Admin der Institution nur Ihren Namen, Ihre E-Mail-Adresse und Ihre Nutzungszahlen, nicht Ihre Arbeit. **(3)** Die Plattformadministration hat technischen Zugriff, der nur für Ihre Supportanfrage, eine Sicherheitsprüfung oder eine rechtliche Pflicht genutzt wird.",
  },
  egitim: {
    q: "Wird mein Text zum Training von KI-Modellen verwendet?",
    a: "Nein. Wenn Sie den Assistenten nutzen, wird nur der zur Beantwortung Ihrer Anfrage nötige Text an den KI-Anbieter (Anthropic, Claude) gesendet; nach den kommerziellen API-Bedingungen des Anbieters werden diese Daten standardmäßig nicht zum Modelltraining verwendet. Auch wir nutzen Ihre Daten nicht zum Training, verkaufen sie nicht und geben sie nicht an Dritte weiter.",
  },
  nerede: {
    q: "Wo werden meine Daten gespeichert?",
    a: "In der Europäischen Union, auf Servern in Frankfurt; Datenbank und Anwendung liegen in derselben Region. Die Verbindungen sind verschlüsselt, und Ihre hochgeladenen Dateien liegen in einem privaten Speicher, auf den nur Sie zugreifen können. Details finden Sie auf der Seite zum Datenschutz.",
  },
  silme: {
    q: "Kann ich mein Konto und alle meine Daten löschen?",
    a: "Ja. Auf der Kontoseite exportiert „Meine Daten herunterladen“ alle Ihre Projekte, Quellen und Unterhaltungen in einem portablen Format (JSON), und „Mein Konto löschen“ löscht Ihr Konto samt allen Daten endgültig. Denken Sie daran, Ihre Arbeit vorher auch als Word/PDF herunterzuladen.",
  },
  "ortak-yazar": {
    q: "Kann ich meine Arbeit gemeinsam mit einer Freundin, einem Freund oder Mitautor:innen schreiben?",
    a: "Ja. Mit der Schaltfläche **Mitautor:innen** in der oberen Leiste des Arbeitsbereichs laden Sie bis zu 5 Personen per E-Mail ein (in Pro, Premium und Unbegrenzt). Eine **Mitautorin bzw. ein Mitautor** schreibt Abschnitte, fügt Quellen hinzu und nutzt die KI mit dem eigenen Tarif; **Kommentator:innen** lesen und kommentieren nur. Sie sehen sofort, wer in welchem Abschnitt und Absatz ist und ob gerade geschrieben wird („Live“). Wenn Sie im selben Abschnitt schreiben, erreichen Änderungen einander in Sekunden, und Bearbeitungen in verschiedenen Absätzen werden automatisch zusammengeführt. Bearbeiten Sie denselben Absatz im selben Moment, wird eine Version übernommen und die andere im Versionsverlauf gespeichert, nie gelöscht. Dateien und Assistenten-Chats von Mitautor:innen bleiben privat. Eingeladene brauchen keinen kostenpflichtigen Tarif; sie können mit einem kostenlosen Konto beitreten.",
  },
  "bul-degistir": {
    q: "Kann ich in einem Abschnitt ein Wort suchen und ersetzen?",
    a: "Ja. Im Editor öffnet **Strg+F** (auf dem Mac ⌘+F) oder die Lupe in der Werkzeugleiste die Leiste **Suchen und Ersetzen**. Treffer werden hervorgehoben; Enter springt zum nächsten, Umschalt+Enter zum vorherigen. „Aa“ beachtet Groß-/Kleinschreibung, „ab“ sucht nur ganze Wörter; das türkische İ/ı wird korrekt behandelt. Ersetzen Sie einzeln oder mit **Alle ersetzen** (Rückgängig funktioniert). Gesucht wird im geöffneten Abschnitt (bzw. in der Unterüberschrift, auf die Sie fokussiert sind).",
  },
  "otomatik-tamamlama": {
    q: "Was ist der graue Vorschlag beim Schreiben? Wie schalte ich ihn aus?",
    a: "Das ist die Autovervollständigung: Wenn Sie am Ende eines Absatzes kurz innehalten, schlägt sie in Grau eine mögliche Fortsetzung vor. **Tab** übernimmt alles, **Strg/⌘ + →** ein Wort, **Esc** verwirft den Vorschlag; auf dem Smartphone tippen Sie auf den Vorschlag. Vorschläge enthalten nie Zahlen, Jahreszahlen, Namen oder Zitate; sie helfen nur, Ihren eigenen Gedanken in wissenschaftlicher Sprache fortzuführen. Sie werden Ihrem monatlichen KI-Kontingent nicht angerechnet (es gibt ein Tageslimit). Mit dem Zauberstab in der Werkzeugleiste schalten Sie die Funktion ein oder aus.",
  },
  danisman: {
    q: "Wie teile ich meine Arbeit mit meiner Betreuung? Braucht sie ein Konto?",
    a: "Erstellen Sie im Arbeitsbereich über „Teilen“ (auf dem Smartphone im Menü ⋯) einen Link nur zum Lesen; Ihre Betreuung braucht kein Konto. Sie können Kommentare erlauben; sie erscheinen im betreffenden Abschnitt und lassen sich mit „Mit Assistent umsetzen“ in einen Überarbeitungsvorschlag verwandeln. Sie können ein Ablaufdatum festlegen oder den Link jederzeit widerrufen.",
  },
  ucretsiz: {
    q: "Kann ich es kostenlos nutzen?",
    a: "Ja, Sie starten ohne Kreditkarte mit dem kostenlosen Tarif. Der Free-Tarif begrenzt die Zahl der Projekte, die Quellensuchen und einige Werkzeuge; vergleichen Sie die Tarifleistungen auf der Seite „Preise“. Über das Empfehlungsprogramm können Sie außerdem zusätzliche Nutzung erhalten.",
  },
  "ne-kadar-yazabilirim": {
    q: "Wie viel kann ich pro Monat mit einem Tarif schreiben?",
    a: "Im Free-Tarif ein Probeentwurf von 5 Seiten, **25 Seiten pro Monat in Basic**, **50 in Pro** und **85 in Premium** KI-gestützter wissenschaftlicher Text; diese Zahlen sind die tatsächliche Grenze Ihres Tarifs. Gezählt werden die Wörter der von der KI geschriebenen Entwürfe (1 Seite = 344 Wörter: Format einer türkischen Abschlussarbeit, 12 pt, Zeilenabstand 1,5). Selbst geschriebener Text, Fragen und Antworten, Kürzen und Stilkorrekturen zählen nicht zum Seitenkontingent; lassen Sie markierten Text neu schreiben, zählen nur die hinzugekommenen Wörter. Was noch übrig ist, sehen Sie auf der Kontoseite; ist das Seitenkontingent aufgebraucht, können Sie Ihre Arbeiten bis zum Upgrade oder zur Erneuerung des Kontingents nur ansehen und herunterladen. Der Haupttext einer Masterarbeit (etwa 80 Seiten) lässt sich in Pro zum Beispiel in 1–2 Monaten schreiben.",
  },
  limit: {
    q: "Was passiert, wenn ich mein Monatslimit erreiche? Wird meine Arbeit gelöscht?",
    a: "Ihre Arbeit wird nie gelöscht. Ist Ihr monatliches Seiten- oder KI-Kontingent aufgebraucht, können Sie Ihre Arbeiten und Quellen bis zum Upgrade oder zur Erneuerung im nächsten Monat nur ansehen und kostenlos in den Formaten Ihres Tarifs herunterladen; alle anderen Funktionen, auch das Bearbeiten von Hand, sind geschlossen. Die kostenlosen Tools bleiben immer verfügbar. Ist nur das Kontingent für Quellensuchen aufgebraucht, stoppt nur die Suche. Kurz vor dem Limit werden Sie gewarnt.",
  },
  "tek-proje": {
    q: "Was ist der Tarif „Unbegrenzt“? (früher Einzelprojekt)",
    a: "**Unbegrenzt** ist unser höchster Tarif: Die einzige Grenze ist die Zahl der Projekte: **bei monatlicher Zahlung höchstens 5, bei jährlicher Zahlung höchstens 60 aktive Projekte**; alles andere ist unbegrenzt: KI-Nutzung, Seitenentwürfe, Quellensuche, Speicher und alle Funktionen einschließlich Premium sowie gemeinsames Schreiben mit Mitautorinnen und Mitautoren. Bei monatlicher Zahlung gilt er 1 Monat, bei jährlicher Zahlung (20 % Rabatt) 1 Jahr; er verlängert sich nicht automatisch, danach wechseln Sie in den kostenlosen Tarif, und Ihre Arbeiten werden nicht gelöscht. „Unbegrenzt“ bedeutet die übliche Nutzung einer Person für ihre eigenen wissenschaftlichen Arbeiten; das Teilen des Kontos oder Massenproduktion im Auftrag anderer verstößt gegen die Fair-Use-Regeln. Wer früher den unbefristeten Tarif „Einzelprojekt“ gekauft hat, behält seine Bedingungen.",
  },
  "silme-hak": {
    q: "Bekomme ich mein Kontingent zurück, wenn ich erzeugten Text lösche?",
    a: "Nein. Ihr Kontingent wird verbraucht, wenn die KI den Text erzeugt; späteres Löschen des Textes, eines Abschnitts oder der ganzen Arbeit erstattet es nicht. Zur Klärung von Streitfällen wird ein Protokoll Ihrer Ausgaben und Löschungen **12 Monate** lang aufbewahrt (nur für berechtigte Administrator:innen sichtbar, mit Ihrem Konto gelöscht).",
  },
  yukseltme: {
    q: "Wie upgrade und bezahle ich?",
    a: "Drücken Sie auf der Kontoseite unter dem gewünschten Tarif auf „Upgrade“. Es öffnet sich eine vorbereitete WhatsApp-Nachricht mit Ihrem aktuellen und dem gewählten Tarif; sobald Sie sie senden, teilen wir Ihnen die Zahlungsdetails mit, und Ihr Tarif wird nach der Zahlung in Ihrem Konto freigeschaltet. Kartendaten geben Sie auf unserer Website nie ein.",
  },
  yillik: {
    q: "Gibt es eine jährliche Zahlung? Wie funktioniert mein Kontingent?",
    a: "Ja. Bei Basic, Pro, Premium und Unbegrenzt gibt es bei jährlicher Zahlung **20 % Rabatt auf den aktuellen Preis**; auf der Preisseite sehen Sie sowohl den monatlichen Gegenwert als auch den Jahresbetrag. Ihr Kontingent wird nicht reduziert: **das 12-Fache des Monatskontingents** (Seiten, KI-Anfragen, Quellensuchen) wird zu Beginn freigeschaltet und kann innerhalb des Jahres beliebig genutzt werden, ohne monatliche Begrenzung. Der Jahresrabatt ist nicht mit einem Rabattcode oder dem Akademischen Teamrabatt kombinierbar. Auch der Tarif „Unbegrenzt“ hat eine jährliche Option.",
  },
  iptal: {
    q: "Gibt es eine Vertragsbindung? Wie kündige ich?",
    a: "Es gibt keine Vertragsbindung. Um zu kündigen oder den Tarif zu wechseln, schreiben Sie uns einfach per WhatsApp. Ihr Tarif bleibt bis zum Ende des bezahlten Zeitraums aktiv, danach wechseln Sie in den kostenlosen Tarif; Ihre Arbeit wird nicht gelöscht.",
  },
  ekip: {
    q: "Gibt es einen Rabatt für akademische Teams oder Forschungsgruppen?",
    a: "Ja. Mit dem Rabatt für akademische Teams erhalten Lehrstuhlgruppen, Forschungsteams, Labore und Fachbereiche ab 3 Personen 30 % auf alle kostenpflichtigen Tarife. Eine Obergrenze für die Teamgröße gibt es nicht. Kontaktieren Sie uns über den Link „Per WhatsApp anfragen“ auf der Seite „Preise“.",
  },
  kurum: {
    q: "Kann meine Hochschule oder mein Institut eine Gruppenlizenz erhalten?",
    a: "Ja. Mit einer Institutionslizenz wechselt eine festgelegte Zahl von Nutzenden auf einer Rechnung in einen höheren Tarif; Studierende treten mit einem Institutionscode bei. Der Admin der Institution sieht nur Nutzungszahlen, nicht die Arbeiten der Studierenden. Details und ein Angebot finden Sie auf der Seite „Für Institutionen“.",
  },
  iade: {
    q: "Erhalte ich eine Rückerstattung, wenn ich nicht zufrieden bin?",
    a: "Schreiben Sie uns bei Zahlungs- oder Erstattungsanliegen über „Feedback“ oder unsere Kontaktadresse; sie werden nach den Nutzungsbedingungen und dem geltenden Recht geprüft. Wir empfehlen, die Plattform vor dem Kauf mit dem kostenlosen Tarif auszuprobieren.",
  },
  telefon: {
    q: "Kann ich es auf Smartphone oder Tablet nutzen?",
    a: "Ja. Die Website ist für Smartphones gestaltet: Die untere Leiste wechselt zwischen Abschnitten, Text, Assistent und Quellen, und mit der Diktierfunktion können Sie Notizen sprechen und in wissenschaftliche Absätze umwandeln lassen. Sie können die Website auch wie eine App installieren: Unter Android tippen Sie im Menü auf „App installieren“; auf dem iPhone in Safari auf Teilen → „Zum Home-Bildschirm“. Das Symbol erscheint auf Ihrem Startbildschirm und öffnet die Website im Vollbild. Für längeres Schreiben und die abschließende Formatierung ist ein Computer bequemer.",
  },
  kayit: {
    q: "Verliere ich meinen Text, wenn die Verbindung abbricht?",
    a: "Nein. Ihr Text wird automatisch gespeichert; bricht die Verbindung ab, bleibt er auf Ihrem Gerät und wird auf dem Server gespeichert, sobald Sie wieder online sind (oben erscheint der Hinweis „Offline“). Selbst wenn Sie die Seite neu laden, wird nicht gespeicherter Text wiederhergestellt.",
  },
  surum: {
    q: "Ich habe versehentlich etwas gelöscht oder der Text des Assistenten gefällt mir nicht. Kann ich das rückgängig machen?",
    a: "Ja. Der Stand vor jeder Einfügung durch den Assistenten und die Versionen, die Sie manuell speichern, werden im Tab „Verlauf“ aufbewahrt; Sie können jede Version mit einem Klick wiederherstellen. Für die letzten Änderungen nutzen Sie „Rückgängig“ in der Werkzeugleiste.",
  },
  yavas: {
    q: "Warum ist der Assistent manchmal langsam?",
    a: "Beim Schreiben eines Abschnitts entscheidet der Assistent zuerst, ob Quellen nötig sind, durchsucht gegebenenfalls Datenbanken, verifiziert die Quellen und liest Open-Access-Volltexte, bevor er schreibt. Diese Schritte verbessern Qualität und Genauigkeit, können aber 1–2 Minuten dauern. Der aktuelle Schritt wird mit einem Fortschrittsbalken angezeigt.",
  },
  "geri-bildirim": {
    q: "Ich habe einen Fehler gefunden oder einen Vorschlag. Wo kann ich schreiben?",
    a: "Nach der Anmeldung nutzen Sie „Feedback“ im linken Menü; jede Nachricht wird gelesen. Wenn Sie beschreiben, auf welcher Seite Sie waren und was Sie getan haben – am besten mit einem Screenshot –, geht die Behebung schneller.",
  },
};
