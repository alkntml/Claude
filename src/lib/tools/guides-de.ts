/**
 * Ücretsiz araç rehberlerinin Almancası (D143). Yapı ve içerik guides.ts’teki Türkçe/İngilizce metinle birebir aynıdır;
 * blog bağlantıları Almanca yazı olmadığı için İngilizce yazılara gider. Metin değişince burası da güncellenmeli.
 */
import type { ToolGuide } from "./guides";

export const TOOL_GUIDES_DE: Record<string, ToolGuide> = {
  "/araclar/arastirmalar-ne-diyor": {
    sections: [
      { h: "Wie funktioniert es?", p: ["Ihre Frage wird zunächst in wissenschaftliche Suchbegriffe übersetzt; anschließend wird in **OpenAlex, Europe PMC, ERIC und Crossref** auf Englisch und in türkischen Quellen auf Türkisch gesucht. Die relevantesten Artikel mit lesbarem Abstract (höchstens 14) werden ausgewählt, und die Kurzantwort wird **ausschließlich aus diesen Abstracts** formuliert."], list: [
        "Jede Aussage der Antwort trägt die Nummer des Artikels, auf dem sie beruht, z. B. [3]; ein Klick darauf führt zum Artikel.",
        "Zu jedem Artikel sehen Sie das Hauptergebnis, den Studientyp (Metaanalyse, experimentell, korrelativ, qualitativ …) und seine Richtung in Bezug auf Ihre Frage.",
        "Bibliografische Angaben und DOI-Link sind einen Klick entfernt; wenn Sie angemeldet sind, können Sie den Artikel Ihrer Arbeit hinzufügen.",
      ] },
      { h: "Was zeigt die Konsensanzeige?", p: [
        "Bei Ja/Nein-Fragen wie „Beeinflusst X Y?“ zeigt sie, wie viele relevante Studien zu **ja**, **teilweise / unter Bedingungen**, **gemischt** oder **nein** gelangen. Die Anzeige erscheint ab mindestens 3 relevanten Studien.",
        "Die Anzeige ist keine Abstimmung: Eine einzige belastbare Metaanalyse kann mehr Gewicht haben als viele kleine Querschnittsstudien. Achten Sie deshalb auch auf die Studientypen.",
      ] },
      { h: "Grenzen", p: [
        "Die Antwort beruht nur auf Abstracts; Volltexte werden nicht gelesen. Die gefundenen Artikel sind Suchergebnisse der Datenbanken, nicht das gesamte Forschungsfeld. Lesen Sie einen Artikel selbst, bevor Sie seine Ergebnisse in Ihrer Arbeit verwenden. Für eine systematische Recherche siehe unseren [Leitfaden zur Literaturübersicht](/en/blog/how-to-write-a-literature-review) (Englisch) und den [Leitfaden zum systematischen Review](/en/blog/systematic-review-meta-analysis-prisma-2020) (Englisch).",
      ] },
    ],
    faq: [
      { q: "Sind die gefundenen Artikel echt?", a: "Ja. Die Artikel stammen direkt aus wissenschaftlichen Datenbanken; die KI erzeugt keine Artikel, sondern liest und fasst nur die Abstracts der gefundenen Artikel zusammen. Zu jedem Artikel wird der DOI- oder Datensatz-Link angezeigt." },
      { q: "Ist es kostenlos, und wie viele Fragen kann ich stellen?", a: "Ja, eine Registrierung ist nicht nötig. Besucher:innen können 5 Fragen pro Stunde stellen, Mitglieder 20." },
      { q: "Kann ich auf Deutsch fragen?", a: "Ja. Ihre Frage wird in der englischsprachigen Literatur sowie in türkischen und türkeibezogenen Publikationen gesucht; die Antwort erhalten Sie in der Sprache Ihrer Frage." },
      { q: "Kann ich die Antwort in meiner Abschlussarbeit zitieren?", a: "Nein, die Antwort selbst ist keine Quelle. Lesen Sie die aufgeführten Artikel und verwenden Sie sie in eigenen Worten mit Zitat. In Academiana können Sie die Artikel Ihrer Arbeit hinzufügen und automatisch ins Literaturverzeichnis übernehmen." },
    ],
  },
  "/araclar/uydurma-kaynak-kontrolu": {
    sections: [
      { h: "Wie funktioniert die Prüfung auf erfundene Quellen?", p: [
        "Allgemeine KI-Werkzeuge wie ChatGPT können Quellenangaben erzeugen, die völlig überzeugend aussehen, aber nicht existieren: Der Autor ähnelt einer echten Forscherin oder einem echten Forscher, die Zeitschrift gibt es, Jahr und Seiten stimmen scheinbar – doch der Artikel wurde nie veröffentlicht.",
        "Das Werkzeug nimmt jede Zeile Ihres Literaturverzeichnisses einzeln. Enthält sie eine DOI, wird geprüft, zu welcher Publikation die DOI gehört; andernfalls wird in **Crossref, DataCite und OpenAlex** nach Titel und Autor gesucht. Der gefundene Datensatz wird nach Titel, Autor und Jahr mit Ihrer Angabe verglichen.",
      ] },
      { h: "So lesen Sie die Ergebnisse", p: ["Jede Quelle erhält eines von drei Ergebnissen:"], list: [
        "**Verifiziert:** Die Quelle ist bei den Registrierungsagenturen verzeichnet, und die Angaben stimmen weitgehend überein.",
        "**Angaben weichen ab:** Die Quelle wurde gefunden, aber Autor, Jahr oder Titel unterscheiden sich, oder die DOI gehört zu einer anderen Publikation. Korrigieren Sie die Angaben anhand des offiziellen Datensatzes.",
        "**Nicht gefunden / verdächtig:** Kein Datensatz passt. Prüfen Sie die Quelle manuell im Zeitschriftenarchiv, in Google Scholar oder in der jeweiligen nationalen Datenbank.",
      ] },
      { h: "„Nicht gefunden“ heißt nicht immer „erfunden“", p: [
        "Bücher, Buchkapitel, Abschlussarbeiten, Konferenzbeiträge und manche nationale Zeitschriften sind in diesen Datenbanken möglicherweise gar nicht erfasst. Sie können als „nicht gefunden“ erscheinen; prüfen Sie sie dort, wo sie erschienen sind. Eine ausführliche Methode finden Sie in unserem [Leitfaden zum Erkennen KI-erfundener Quellen](/en/blog/detecting-ai-fabricated-references) (Englisch).",
      ] },
    ],
    faq: [
      { q: "Ist die Prüfung auf erfundene Quellen kostenlos?", a: "Ja, und eine Registrierung ist nicht nötig. Um Missbrauch zu verhindern, gilt ein Limit von 15 Prüfungen pro Stunde und höchstens 30 Quellen pro Prüfung." },
      { q: "Welche Zitierstile kann es lesen?", a: "Gelesen werden Literaturangaben in APA, ISNAD, MLA, Chicago, IEEE, Vancouver und ähnlich verbreiteten Stilen. Bei Zeilen, deren Format sich nicht auslesen lässt, trennt ein kleines KI-Modell ausschließlich die bibliografischen Felder." },
      { q: "Wird mein Literaturverzeichnis gespeichert?", a: "Nein. Ihr Text wird nicht gespeichert; nur Titel und DOI, die für die Prüfung nötig sind, werden in offenen wissenschaftlichen Datensätzen nachgeschlagen. Für den Nutzungszähler wird nur die Anzahl der geprüften Quellen festgehalten." },
      { q: "Können Betreuende und Prüfende es nutzen?", a: "Selbstverständlich. Fügen Sie eine Auswahl von Quellen aus einer Arbeit ein und Sie erhalten in wenigen Minuten ein Bild." },
    ],
  },
  "/araclar/kaynakca-olusturucu": {
    sections: [
      { h: "So nutzen Sie den Literaturverzeichnis-Generator", p: ["Bibliografische Angaben von Hand abzutippen ist langsam und fehleranfällig. Dieses Werkzeug übernimmt die Angaben aus offiziellen Datensätzen:"], list: [
        "Geben Sie die **DOI** der Publikation (z. B. 10.1037/0000165-000) oder ihren **Titel** ein.",
        "Der Datensatz wird aus **Crossref, DataCite und OpenAlex** abgerufen; Autor:innen, Jahr, Zeitschrift, Band, Heft und Seiten werden automatisch ergänzt.",
        "Wählen Sie einen **Zitierstil**: APA 7, APA 6, ISNAD 2, MLA 9, Chicago, Turabian, Harvard, Vancouver, IEEE oder AMA.",
        "Nicht auffindbare Quellen (z. B. ein Buchkapitel oder eine Abschlussarbeit) fügen Sie manuell hinzu; die Liste wird im gewählten Stil formatiert.",
      ] },
      { h: "Warum der Datensatz der Registrierungsagentur?", p: [
        "Die meisten Fehler im Literaturverzeichnis entstehen durch abgetippte Angaben: falsches Jahr, fehlende Mitautorin, falscher Band. Ein per DOI abgerufener Datensatz ist das, was der Verlag registriert hat. Prüfen Sie dennoch zum Schluss die Autorennamen und die Groß- und Kleinschreibung.",
        "Ausführliche Stilregeln finden Sie in unserem [APA-7-Zitierleitfaden](/en/blog/apa-7-citation-guide) (Englisch) und unter [Literaturverzeichnis richtig erstellen](/en/blog/how-to-write-a-bibliography-citation-styles) (Englisch).",
      ] },
    ],
    faq: [
      { q: "Welche Zitierstile werden unterstützt?", a: "APA 7, APA 6, ISNAD 2 (Autor-Jahr), MLA 9, Chicago (Autor-Jahr), Turabian, Harvard, Vancouver, IEEE und AMA 11." },
      { q: "Funktioniert es auch mit nicht englischsprachigen Quellen?", a: "Jeder Artikel mit DOI wird über die DOI gefunden, unabhängig von seiner Sprache. Quellen ohne DOI können Sie manuell hinzufügen." },
      { q: "Wie übernehme ich die Liste in Word?", a: "Kopieren Sie sie und fügen Sie sie in Word ein; Formatierungen wie Kursivschrift bleiben erhalten. Für einen hängenden Einzug wählen Sie in den Absatzeinstellungen von Word „Hängend“." },
      { q: "Ist es kostenlos?", a: "Ja. Eine Registrierung ist nicht nötig, und es wird keine KI eingesetzt; die Angaben stammen ausschließlich von den Registrierungsagenturen." },
    ],
  },
  "/araclar/atif-donusturucu": {
    sections: [
      { h: "Was macht der Zitierstil-Konverter?", p: [
        "Verlangt Ihre Betreuung oder Ihre Zielzeitschrift einen anderen Stil, müssen Sie nicht Hunderte von Quellen neu tippen. Fügen Sie Ihre Liste ein oder laden Sie eine aus Zotero, Mendeley oder EndNote exportierte **BibTeX**- oder **RIS**-Datei hoch – die Quellen werden in den gewählten Stil umgewandelt.",
      ] },
      { h: "Schritt für Schritt", p: [], list: [
        "Fügen Sie Ihr Literaturverzeichnis ein (eine Quelle pro Zeile) oder wählen Sie Ihre BibTeX-/RIS-Datei.",
        "Wählen Sie den Zielstil, z. B. von APA 7 zu ISNAD 2 oder von MLA zu APA.",
        "Prüfen Sie das Ergebnis; nicht lesbare Zeilen werden markiert, damit Sie sie von Hand korrigieren können.",
        "Kopieren Sie die Liste und fügen Sie sie in Ihr Dokument ein.",
      ] },
      { h: "Vergessen Sie die Zitate im Text nicht", p: [
        "Ein Stilwechsel betrifft nicht nur das Literaturverzeichnis, sondern auch die Zitate im Text: (Kaya, 2021) in APA, [1] in IEEE. Schreiben Sie Ihre Arbeit in Academiana, werden beim Wechsel des Zitierstils die Zitate im Text, das Literaturverzeichnis sowie Tabellen- und Abbildungsbeschriftungen automatisch angepasst.",
      ] },
    ],
    faq: [
      { q: "Werden BibTeX- und RIS-Dateien unterstützt?", a: "Ja. Aus Zotero, Mendeley und EndNote exportierte BibTeX- (.bib) und RIS-Dateien (.ris) werden gelesen." },
      { q: "Wie genau ist die Umwandlung?", a: "Bei strukturierten Dateien (BibTeX/RIS) wird jedes Feld einzeln gelesen, die Ergebnisse sind daher sehr zuverlässig. Bei Listen als reiner Text prüfen Sie Zeilen in ungewöhnlichen Formaten." },
      { q: "Zwischen welchen Stilen kann ich umwandeln?", a: "APA 7, APA 6, ISNAD 2, MLA 9, Chicago, Turabian, Harvard, Vancouver, IEEE und AMA." },
    ],
  },
  "/araclar/orneklem-hesaplayici": {
    sections: [
      { h: "Wie wird der Stichprobenumfang berechnet?", p: ["Das Werkzeug unterstützt drei gängige Verfahren; welches passt, hängt vom Ziel Ihrer Studie ab:"], list: [
        "**Formel nach Cochran:** Für Befragungen, die einen Anteil schätzen. Bei 95 % Konfidenz und 5 % Fehlermarge: 385 Personen für eine sehr große Grundgesamtheit; 278 für eine Grundgesamtheit von 1.000 mit Endlichkeitskorrektur.",
        "**Formel nach Yamane:** Eine vereinfachte Cochran-Formel für 95 % Konfidenz und p = 0,5. Für eine Grundgesamtheit von 1.000 und 5 % Fehlermarge: 286 Personen.",
        "**Stichprobenumfang für einen Mittelwert:** Wenn Sie einen Mittelwert mit einer bestimmten Fehlermarge schätzen wollen; erforderlich ist ein Schätzwert der Standardabweichung.",
      ] },
      { h: "Konfidenzniveau, Fehlermarge und Rücklaufquote", p: [
        "In den Sozialwissenschaften sind ein Konfidenzniveau von 95 % (Z = 1,96) und eine Fehlermarge von 5 % am gebräuchlichsten. Senken Sie die Marge für mehr Genauigkeit auf 3 %, steigt die erforderliche Stichprobe deutlich.",
        "Das Ergebnis ist die Zahl gültiger Antworten, die in die Analyse eingehen. Geben Sie die erwartete Rücklaufquote ein, nennt Ihnen das Werkzeug auch, wie viele Personen Sie ansprechen müssen: etwa 398 bei einer Stichprobe von 278 und 70 % Rücklauf.",
      ] },
      { h: "Experimentelle Studien brauchen eine Poweranalyse", p: [
        "Studien, die Gruppen vergleichen oder Zusammenhänge zwischen Variablen untersuchen, nutzen statt Cochran oder Yamane eine Poweranalyse. Wir erklären das mit Rechenbeispielen in unserem [Leitfaden zum Stichprobenumfang](/en/blog/how-to-calculate-sample-size) (Englisch).",
      ] },
    ],
    faq: [
      { q: "Was, wenn ich die Größe der Grundgesamtheit nicht kenne?", a: "Lassen Sie das Feld leer; das Werkzeug geht dann von einer unendlichen Grundgesamtheit aus: 385 Personen bei 95 % Konfidenz und 5 % Fehlermarge." },
      { q: "Cochran oder Yamane?", a: "Bei 95 % Konfidenz und 5 % Fehlermarge liefern beide ähnliche Ergebnisse. Brauchen Sie ein anderes Konfidenzniveau oder einen anderen Anteil, ist Cochran flexibler." },
      { q: "Wie berichte ich das im Methodenteil?", a: "Das Werkzeug liefert einen fertigen Satz mit Formel, Konfidenzniveau, Fehlermarge und Ergebnis, den Sie in Ihren Methodenteil übernehmen können." },
      { q: "Wie wird der Stichprobenumfang in qualitativer Forschung festgelegt?", a: "Qualitative Studien verwenden keine Formeln; die Zahl der Teilnehmenden wird meist mit der theoretischen Sättigung begründet." },
    ],
  },
  "/araclar/cronbach-alfa": {
    sections: [
      { h: "So berechnen Sie Cronbachs Alpha", p: ["Kopieren Sie Ihre Skalendaten aus Excel, SPSS oder Google Sheets und fügen Sie sie ein:"], list: [
        "Jede Zeile sollte eine teilnehmende Person und jede Spalte ein Item sein; die erste Zeile darf Itemnamen enthalten. Zeilen mit fehlenden Werten werden ausgeschlossen, ihre Anzahl wird angezeigt.",
        "Markieren Sie umgepolte Items; das Werkzeug polt sie vor der Berechnung um.",
        "Sie erhalten **Cronbachs Alpha**, für jedes Item die **korrigierte Item-Skala-Korrelation** und **Alpha bei Weglassen des Items**.",
      ] },
      { h: "So interpretieren Sie das Ergebnis", p: ["Eine in der Literatur häufig verwendete grobe Einteilung:"], list: [
        "**0,90 und höher:** exzellent (über 0,95 kann auf redundante Items hindeuten)",
        "**0,80–0,89:** gut",
        "**0,70–0,79:** akzeptabel",
        "**0,60–0,69:** fragwürdig; kann bei kurzen Subskalen vorkommen",
        "**Unter 0,60:** schwach; prüfen Sie zuerst umgepolte Items und die Dateneingabe",
      ] },
      { h: "Wenn Alpha niedrig ist", p: [
        "Die häufigste Ursache für ein niedriges Alpha ist ein nicht umgepoltes negativ formuliertes Item; suchen Sie nach einem Item mit negativer Item-Skala-Korrelation. Löschen Sie Items einer adaptierten Skala nicht nur, um Alpha zu erhöhen. Einzelheiten in unserem [Leitfaden zu Cronbachs Alpha](/en/blog/cronbach-alpha-explained) (Englisch).",
      ] },
    ],
    faq: [
      { q: "Werden meine Daten an einen Server gesendet?", a: "Nein. Die Berechnung läuft vollständig in Ihrem Browser; Ihre Daten verlassen Ihr Gerät nicht." },
      { q: "Wie viele Teilnehmende und Items kann ich eingeben?", a: "So viele, wie Ihr Browser verarbeiten kann; typische Daten einer Abschlussarbeit (einige Hundert Teilnehmende, Dutzende Items) werden sofort berechnet." },
      { q: "Sollte ich Alpha für jede Subskala berechnen?", a: "Ja. Bei mehrdimensionalen Skalen fügen Sie die Items jeder Subskala getrennt ein und berichten Alpha auf Ebene der Subskalen." },
      { q: "Stimmt das Ergebnis mit SPSS überein?", a: "Ja, es wird dieselbe Formel verwendet (nicht standardisiertes Alpha). Zeilen mit fehlenden Werten werden ausgeschlossen – wie beim standardmäßigen listenweisen Fallausschluss in SPSS." },
    ],
  },
  "/araclar/anket-olusturucu": {
    sections: [
      { h: "So erstellen Sie eine wissenschaftliche Umfrage", p: ["Der Umfrage-Generator ist für Befragungen in Abschlussarbeiten und Forschungsprojekten gedacht:"], list: [
        "**Fragetypen:** Likert (5- oder 7-stufig), Einfachauswahl, Mehrfachauswahl, Zahl und offene Fragen sowie Informationstext.",
        "**Schnellprüfung:** Markiert häufige Probleme wie fehlenden Einwilligungstext oder fehlende demografische Fragen, doppelläufige oder wiederholte Items, Skalen ohne umgepolte Items, Auswahlfragen ohne Option „Sonstiges“ und zu lange Umfragen.",
        "**Drucken:** Erhalten Sie einen sauberen Ausdruck, um die Umfrage auf Papier durchzuführen.",
        "**Online veröffentlichen:** Mit einem kostenlosen Konto teilen Sie die Umfrage per Link; von Teilnehmenden werden keine identifizierenden Angaben erhoben.",
      ] },
      { h: "Ein gutes Likert-Item formulieren", p: [
        "Jedes Item sollte nur eine Aussage enthalten und kurz und klar sein. Negativ formulierte Items werden umgepolt und müssen vor der Analyse umkodiert werden. Wenn Sie eine bestehende Skala verwenden, holen Sie die Erlaubnis der Entwickler:innen ein.",
        "Mehr dazu in unseren Leitfäden zur [Gestaltung einer Umfrage](/en/blog/how-to-design-a-survey-likert-scale) (Englisch) und zum [Stichprobenumfang](/en/blog/how-to-calculate-sample-size) (Englisch).",
      ] },
      { h: "Antworten kommen analysebereit an", p: [
        "Antworten auf Umfragen, die Sie mit Ihrem Academiana-Konto veröffentlichen, werden zu einer analysebereiten Tabelle mit bereits umkodierten umgepolten Items; laden Sie sie als CSV herunter oder übergeben Sie sie mit einem Klick an die statistische Analyse.",
      ] },
    ],
    faq: [
      { q: "Ist der Umfrage-Generator kostenlos?", a: "Erstellen, Prüfen und Drucken einer Umfrage ist kostenlos und ohne Registrierung möglich. Zum Veröffentlichen und Sammeln von Antworten genügt ein kostenloses Konto." },
      { q: "Werden personenbezogene Daten der Teilnehmenden erhoben?", a: "Nein. Das Umfrageformular erhebt weder Identitätsangaben noch IP-Adressen oder E-Mail-Adressen; gespeichert werden nur die Antworten." },
      { q: "Kann ich die Antworten nach SPSS exportieren?", a: "Ja. Die Antworten lassen sich als CSV herunterladen und in SPSS, Jamovi oder Excel öffnen; zusätzlich wird ein Codebuch erstellt." },
    ],
  },
};
