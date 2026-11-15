import type { BlogPostEn } from "./types";

/** Almanca sürümler, 9. dosya (D199). Sayılar Türkçe yazılarla aynıdır (tests/blog-d199.test.ts). */
export const DE_9: Record<string, BlogPostEn> = {
  "korelasyon-analizi-pearson-spearman": {
    slug: "korrelation-pearson-oder-spearman",
    title: "Korrelationsanalyse: Pearson oder Spearman – Auswahl, Interpretation und APA-Bericht",
    seoTitle: "Korrelation: Pearson oder Spearman? Auswahl und Deutung",
    description: "Unterschied zwischen Pearson- und Spearman-Korrelation, wann welche passt, r deuten, Ausreißer und APA-7-Bericht mit Rechenbeispiel.",
    keywords: ["Korrelationsanalyse durchführen", "Pearson-Korrelation interpretieren", "Spearman-Korrelation", "Korrelationskoeffizient deuten", "Korrelation APA berichten", "Pearson oder Spearman"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und fügen Sie Pearson- oder Spearman-Koeffizienten im APA-Format über „Werkzeuge“ → „Statistische Analyse“ → „Korrelationsanalyse“ in Ihr Dokument ein.", label: "Korrelation berechnen" },
    body: `Eine Korrelationsanalyse zeigt, ob zwei Variablen gemeinsam variieren, und gibt **Richtung** und **Stärke** des Zusammenhangs an. Fragen wie „Wächst der Wortschatz mit der Lesezeit?“ oder „Hängt Prüfungsangst mit der Leistung zusammen?“ werden in Abschlussarbeiten meist mit einer Korrelation untersucht. Die beiden häufigsten Varianten sind die **Pearson**- und die **Spearman**-Korrelation. Dieser Leitfaden zeigt an denselben Beispieldaten den Unterschied, die Auswahl und den Bericht.

Alle Zahlen in diesem Artikel wurden mit der Statistik-Engine von Academiana aus den Beispieldaten berechnet.

## Was sagt ein Korrelationskoeffizient?

Ein Korrelationskoeffizient liegt zwischen −1 und +1:

- **Positiver Wert:** Steigt die eine Variable, steigt tendenziell auch die andere.
- **Negativer Wert:** Steigt die eine Variable, sinkt tendenziell die andere.
- **Wert nahe null:** Kein linearer (Pearson) bzw. monotoner (Spearman) Zusammenhang.

Die Größe des Koeffizienten zeigt die Stärke. Nach den verbreiteten Richtwerten von Cohen (1988) gilt .10 als klein, .30 als mittel und .50 als groß. Das sind grobe Orientierungen; deuten Sie sie im Vergleich mit typischen Werten Ihres Fachs.

> Korrelation ist keine Kausalität. Zwei zusammenhängende Variablen zeigen nicht, dass die eine die andere verursacht; eine dritte Variable kann beide beeinflussen.

## Pearson oder Spearman?

| Merkmal | Pearson | Spearman |
| --- | --- | --- |
| Was gemessen wird | Linearer Zusammenhang | Monotoner (Rang-)Zusammenhang |
| Datenniveau | Metrisch (Intervall/Verhältnis) | Ordinal oder metrisch |
| Normalverteilung | Beide Variablen annähernd normal | Nicht nötig |
| Empfindlichkeit für Ausreißer | Hoch | Gering |
| Berechnet aus | Rohwerten | Rangplätzen |

Faustregel: Sind beide Variablen metrisch, annähernd normalverteilt und ist das Streudiagramm linear, nehmen Sie **Pearson**; ist eine Variable ordinal, die Verteilung deutlich schief oder gibt es Ausreißer, nehmen Sie **Spearman**. Zur Prüfung siehe unseren Leitfaden zur [Prüfung der Normalverteilung](/de/blog/normalverteilung-pruefen-schiefe-kurtosis).

## Rechenbeispiel: Lesezeit und Wortschatz

Eine Forscherin erhebt bei 12 Studierenden die wöchentliche Lesezeit (Stunden) und einen Wortschatztestwert:

- **Lesezeit:** 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 20
- **Wortschatz:** 52, 61, 54, 57, 58, 66, 60, 70, 62, 65, 73, 59

Die letzte Person liest 20 Stunden pro Woche und liegt weit von allen anderen entfernt (Ausreißer).

### 1. Zuerst das Streudiagramm ansehen

Ein Streudiagramm vor der Berechnung zeigt am schnellsten die Form des Zusammenhangs und Ausreißer. Hier bilden elf Personen eine ansteigende Linie, während die Person mit 20 Stunden allein unten rechts liegt.

### 2. Ergebnisse nach Pearson und Spearman

| Analyse | Koeffizient | df | p | 95-%-KI |
| --- | --- | --- | --- | --- |
| Pearson (12 Personen) | r = .24 | 10 | .443 | [−.38, .72] |
| Spearman (12 Personen) | rs = .64 | 10 | .025 | |
| Pearson (ohne Ausreißer, 11 Personen) | r = .84 | 9 | .001 | [.47, .96] |
| Spearman (ohne Ausreißer, 11 Personen) | rs = .81 | 9 | .002 | |

### 3. Was ist passiert?

- **Pearson übersah den Zusammenhang wegen eines Ausreißers.** Mit zwölf Personen ist r = .24 nicht signifikant (p = .443). Ohne den Ausreißer zeigt sich ein starker, signifikanter Zusammenhang, r = .84.
- **Spearman war kaum betroffen.** Weil mit Rangplätzen gerechnet wird, zählte der Wert 20 nur als „höchster Rang“; der Zusammenhang wurde erkannt, rs = .64 (p = .025).

Deshalb sollten Sie Ihre Daten ansehen und den passenden Koeffizienten wählen, bevor Sie berichten.

### 4. Umgang mit Ausreißern

Ein Wert darf nicht entfernt werden, nur weil das Ergebnis nicht gefällt. Prüfen Sie zuerst, ob es sich um einen **Eingabefehler** handelt. Ist der Wert echt:

- verwenden Sie ein robustes Verfahren wie Spearman, oder
- berichten Sie die Analyse mit und ohne Ausreißer und begründen Sie dies im Methodenteil.

## Determinationskoeffizient r²

Das Quadrat von Pearsons r ist der gemeinsame Varianzanteil. Für r = .84 ergibt sich r² ≈ .70: Rund 70 % der Varianz im Wortschatz teilen sich mit der Lesezeit. So lässt sich die praktische Bedeutung gut vermitteln.

## Korrelationsmatrix

Bei mehreren Variablen werden alle paarweisen Korrelationen in einer Tabelle angegeben, meist im unteren Dreieck mit Sternchen für Signifikanz. Bei vielen Korrelationen werden einige zufällig signifikant; nennen Sie im Methodenteil, welche Zusammenhänge Sie vorab erwartet haben.

## Bericht nach APA 7

**Pearson:** „Zwischen wöchentlicher Lesezeit und Wortschatz bestand ein starker positiver Zusammenhang, r(9) = .84, p = .001, 95 % KI [.47, .96].“

**Spearman:** „Da eine Variable einen Ausreißer enthielt, wurde die Rangkorrelation nach Spearman berechnet. Die Lesezeit hing positiv und signifikant mit dem Wortschatz zusammen, rs(10) = .64, p = .025.“

**Formatregeln:**

- r und p kursiv; die Freiheitsgrade (n − 2) in Klammern.
- Keine führende Null bei Korrelationen und p-Werten (.84, .025).
- Ist p kleiner als .001, schreiben Sie „p < .001“.

## Häufige Fehler

- Korrelation ohne Blick auf das Streudiagramm berechnen
- Korrelation kausal deuten („Lesezeit erhöht den Wortschatz“)
- Nicht lineare Zusammenhänge mit Pearson messen und „kein Zusammenhang“ folgern
- Ausreißer ohne Begründung entfernen
- Nur die Signifikanz berichten, nicht die Größe des Koeffizienten

Um zu prüfen, wie gut eine Variable eine andere vorhersagt, geht man von der Korrelation zur Regression über: siehe unseren [Leitfaden zur Regressionsanalyse](/de/blog/regressionsanalyse-nach-apa-7-berichten). Welche Analyse zu welcher Frage passt, zeigt unser Leitfaden [welcher statistische Test](/de/blog/welcher-statistische-test).

## Korrelation mit Academiana

Nach dem Hochladen Ihrer Datendatei wählen Sie unter „Werkzeuge“ → „Statistische Analyse“ → „Korrelationsanalyse“ die Variablen und Pearson oder Spearman. Sie erhalten Koeffizienten, Freiheitsgrade und p-Werte im APA-Format und können sie als Tabelle einfügen. Für die Form des Zusammenhangs fügen Sie über „Diagramm erstellen“ → „Streudiagramm“ ein Streudiagramm mit Regressionsgerade hinzu. Die Zahlen erzeugt keine KI; die Statistik-Engine berechnet sie aus Ihren Daten.`,
  },
  "etki-buyuklugu-rehberi-cohen-d-eta-kare": {
    slug: "effektstaerke-cohens-d-eta-quadrat",
    title: "Was ist die Effektstärke? Cohens d, Eta-Quadrat, r und R² richtig deuten",
    seoTitle: "Effektstärke: Cohens d, Eta-Quadrat, r und R² deuten",
    description: "Was die Effektstärke ist und warum sie mehr sagt als p. Cohens d, Eta- und Omega-Quadrat, r, R² und Cramérs V deuten und nach APA 7 berichten.",
    keywords: ["Effektstärke", "Cohens d interpretieren", "Eta-Quadrat interpretieren", "Effektstärke berechnen", "Omega-Quadrat", "Effektstärke APA"],
    cta: { text: "Das Statistikwerkzeug von Academiana berechnet zu jedem Test die passende Effektstärke (Cohens d, η², R², Cramérs V) und berichtet sie im APA-Format.", label: "Analyse durchführen" },
    body: `„Es wurde ein signifikanter Unterschied gefunden“ erzählt nur die halbe Geschichte. Das Maß dafür, **wie groß** ein Unterschied oder Zusammenhang ist, ist die **Effektstärke**. APA 7 verlangt Effektstärken und, wo möglich, Konfidenzintervalle zu statistischen Tests. Dieser Leitfaden zeigt die häufigsten Effektstärken, ihre Deutung und welche zu welchem Test gehört.

Die Beispielwerte stammen aus den Rechenbeispielen unseres Blogs und wurden mit der Statistik-Engine von Academiana berechnet.

## Warum reicht der p-Wert nicht?

Der p-Wert misst, wie gut der beobachtete Unterschied oder Zusammenhang mit reinem Zufall vereinbar ist. Er hat zwei wichtige Grenzen:

- **Er hängt von der Stichprobengröße ab.** In sehr großen Stichproben werden auch winzige Unterschiede signifikant.
- **Er sagt nichts über die Größe.** Der Unterschied zwischen p = .001 und p = .04 zeigt nicht direkt, wie groß ein Effekt ist.

Effektstärken sind weitgehend unabhängig von der Stichprobengröße und machen Studien vergleichbar und metaanalytisch kombinierbar.

## Arten von Effektstärken

### Cohens d (Unterschied zweier Mittelwerte)

Der Mittelwertsunterschied in Standardabweichungseinheiten, berichtet zu t-Tests. Im Beispiel unseres [Leitfadens zum t-Test](/de/blog/t-test-durchfuehren-und-interpretieren) unterschieden sich Experimental- und Kontrollgruppe um **d = 1.46**, also um rund anderthalb Standardabweichungen.

Bei abhängigen Stichproben wird **dz** mit der Standardabweichung der Differenzen berechnet; im Vorher-nachher-Beispiel desselben Leitfadens dz = 2.79.

### Eta-Quadrat (η²) und Omega-Quadrat (ω²)

In der ANOVA der Anteil der Gesamtvarianz, der durch die Gruppen erklärt wird. In unserem [ANOVA-Leitfaden](/de/blog/einfaktorielle-anova-durchfuehren-und-berichten) ist **η² = .33**: 33 % der Variabilität wurden durch die Lehrmethode erklärt. η² überschätzt den Effekt vor allem in kleinen Stichproben; das weniger verzerrte **ω²** beträgt im selben Beispiel .28.

### r (Korrelationskoeffizient)

Ein Korrelationskoeffizient ist selbst eine Effektstärke. In unserem [Korrelationsleitfaden](/de/blog/korrelation-pearson-oder-spearman) ist **r = .84** nach Entfernen eines Ausreißers.

### R² und korrigiertes R²

In der Regression der durch das Modell erklärte Varianzanteil. Im Modell mit zwei Prädiktoren in unserem [Regressionsleitfaden](/de/blog/regressionsanalyse-nach-apa-7-berichten) ist **R² = .65**, korrigiert **R² = .60**.

### Cramérs V

Die Stärke des Zusammenhangs zweier kategorialer Variablen, berichtet zum Chi-Quadrat-Test. In unserem [Chi-Quadrat-Leitfaden](/de/blog/chi-quadrat-unabhaengigkeitstest) ist **V = .31**.

## Richtwerte zur Deutung

| Effektstärke | Klein | Mittel | Groß | Verwendet bei |
| --- | --- | --- | --- | --- |
| Cohens d | 0.20 | 0.50 | 0.80 | t-Tests |
| η² | .01 | .06 | .14 | ANOVA |
| r | .10 | .30 | .50 | Korrelation |
| f² | .02 | .15 | .35 | Regression |

Diese Schwellen sind grobe Richtwerte, die Cohen (1988) für die Verhaltenswissenschaften vorschlug; er selbst betonte, dass sie im Kontext zu deuten sind. Ein „kleiner“ Effekt einer Bildungsmaßnahme kann bei Tausenden Lernenden einen bedeutsamen Gewinn bedeuten. Vergleichen Sie, wo möglich, mit Effektstärken ähnlicher Studien Ihres Fachs. Richtwerte für Cramérs V hängen von der Tabellengröße (Freiheitsgraden) ab.

## Welche Effektstärke zu welchem Test?

| Analyse | Zu berichtende Effektstärke |
| --- | --- |
| t-Test für unabhängige Stichproben | Cohens d (und KI der Differenz) |
| t-Test für abhängige Stichproben | dz |
| Einfaktorielle ANOVA | η² oder ω² |
| Korrelation | r (oder rs), ggf. r² |
| Regression | R², korrigiertes R², standardisiertes β |
| Chi-Quadrat | Cramérs V (φ bei 2 × 2-Tabellen) |
| Mann-Whitney-U | r (z / √N) |

## Effektstärke und Stichprobengröße

Effektstärken braucht man auch bei der Planung. In der Poweranalyse gibt man den erwarteten Effekt ein und erhält die nötige Stichprobengröße: Je kleiner der erwartete Effekt, desto größer die Stichprobe. Siehe unseren [Leitfaden zur Stichprobengröße](/de/blog/stichprobengroesse-berechnen) und den kostenlosen [Stichprobenrechner](/de/araclar/orneklem-hesaplayici).

## Bericht nach APA 7

Geben Sie die Effektstärke direkt nach der Teststatistik an:

- „… t(22) = 3.57, p = .002, d = 1.46, 95 % KI [3.66, 13.84].“
- „… F(2, 27) = 6.74, p = .004, η² = .33.“

d und R² kursiv; griechische Buchstaben wie η², ω² und β nicht kursiv. Werte, die 1 nicht überschreiten können (η², r, R²), ohne führende Null; d kann größer als 1 sein und erhält daher eine (z. B. 0.45).

## Häufige Fehler

- Nur den p-Wert berichten
- Bei nicht signifikanten Ergebnissen keine Effektstärke angeben (sie gehört trotzdem dazu)
- Cohens Schwellen unabhängig vom Kontext als feste Grenzen behandeln
- dz bei abhängigen Stichproben mit d für unabhängige Gruppen verwechseln
- η² in kleinen Stichproben unkorrigiert deuten

## Effektstärken mit Academiana

Das Statistikwerkzeug von Academiana berechnet zu jedem Test die passende Effektstärke: Cohens d mit Konfidenzintervall beim t-Test, η² bei der ANOVA, R² und standardisiertes β bei der Regression, Cramérs V beim Chi-Quadrat-Test. Die Ergebnisse kommen im APA-Format und lassen sich mit einem Klick als Tabelle einfügen; wenn Sie den Assistenten um eine Deutung bitten, wird auch die Effektstärke gedeutet, ohne neue Zahlen zu erzeugen.`,
  },
  "ki-kare-bagimsizlik-testi-nasil-yapilir": {
    slug: "chi-quadrat-unabhaengigkeitstest",
    title: "Chi-Quadrat-Unabhängigkeitstest: Kreuztabelle, Cramérs V und APA-Bericht",
    seoTitle: "Chi-Quadrat-Unabhängigkeitstest durchführen und deuten",
    description: "Chi-Quadrat-Unabhängigkeitstest Schritt für Schritt: Kreuztabelle, erwartete Häufigkeiten, Voraussetzungen, Cramérs V und APA-7-Bericht im Beispiel.",
    keywords: ["Chi-Quadrat-Test durchführen", "Chi-Quadrat-Unabhängigkeitstest", "Kreuztabelle interpretieren", "Cramérs V", "Chi-Quadrat APA berichten", "kategoriale Daten analysieren"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und erhalten Sie Kreuztabelle, χ²-Wert und Cramérs V im APA-Format über „Werkzeuge“ → „Statistische Analyse“ → „Chi-Quadrat-Unabhängigkeitstest“.", label: "Chi-Quadrat berechnen" },
    body: `Der Chi-Quadrat-Unabhängigkeitstest (χ²) prüft, **ob zwei kategoriale Variablen zusammenhängen**. Fragen wie „Unterscheidet sich die bevorzugte Lernform nach Geschlecht?“ werden in Abschlussarbeiten mit Fragebogendaten häufig mit Chi-Quadrat untersucht. Dieser Leitfaden führt mit einem Beispiel von der Kreuztabelle bis zum APA-Bericht.

Alle Zahlen in diesem Artikel wurden mit der Statistik-Engine von Academiana aus den Beispieldaten berechnet.

## Wann wird er verwendet?

- Beide Variablen sind **kategorial** (Geschlecht, Präferenz, ja/nein, Bildungsstand).
- Die Beobachtungen sind **unabhängig**: Jede Person fällt in genau eine Zelle.
- Die Daten sind **Häufigkeiten** (Personenzahlen), keine Prozente oder Mittelwerte.

Ist das Ergebnis ein metrischer Wert, nehmen Sie stattdessen einen [t-Test](/de/blog/t-test-durchfuehren-und-interpretieren) oder eine [ANOVA](/de/blog/einfaktorielle-anova-durchfuehren-und-berichten).

## Hypothesen

- **H0 (Nullhypothese):** Die Variablen sind unabhängig; die Präferenz unterscheidet sich nicht nach Geschlecht.
- **H1 (Alternativhypothese):** Die Variablen hängen zusammen.

## Rechenbeispiel: Geschlecht und bevorzugte Lernform

120 Studierende werden gefragt, ob sie Präsenz-, Online- oder hybrides Lernen bevorzugen.

### 1. Beobachtete Häufigkeiten (Kreuztabelle)

| Geschlecht | Präsenz | Online | Hybrid | Gesamt |
| --- | --- | --- | --- | --- |
| Weiblich | 18 | 10 | 32 | 60 |
| Männlich | 28 | 18 | 14 | 60 |
| Gesamt | 46 | 28 | 46 | 120 |

### 2. Erwartete Häufigkeiten

Die erwartete Häufigkeit ist die Zahl, die eine Zelle bei Unabhängigkeit hätte: Zeilensumme × Spaltensumme / Gesamtsumme. Für „Weiblich – Hybrid“: 60 × 46 / 120 = 23.

| Geschlecht | Präsenz | Online | Hybrid |
| --- | --- | --- | --- |
| Weiblich | 23 | 14 | 23 |
| Männlich | 23 | 14 | 23 |

Mehr Frauen als erwartet bevorzugen hybrides Lernen (32 statt 23), mehr Männer als erwartet Präsenz- (28 statt 23) und Online-Lernen (18 statt 14).

### 3. Testergebnis

- **χ²(2, N = 120) = 11.50, p = .003:** Die bevorzugte Lernform hängt signifikant mit dem Geschlecht zusammen.
- **Freiheitsgrade:** (Zeilen − 1) × (Spalten − 1) = (2 − 1) × (3 − 1) = 2.
- **Cramérs V = .31:** Stärke des Zusammenhangs zwischen 0 und 1; für eine Tabelle dieser Größe ein mittlerer Zusammenhang. Allgemein zur Deutung siehe unseren [Leitfaden zur Effektstärke](/de/blog/effektstaerke-cohens-d-eta-quadrat).

### 4. Voraussetzungen prüfen: erwartete Häufigkeiten

Damit der Test zuverlässig ist, müssen die erwarteten Häufigkeiten groß genug sein. Übliche Regel: **Mindestens 80 % der Zellen sollten eine erwartete Häufigkeit von 5 oder mehr haben, keine Zelle unter 1.** Hier ist die kleinste erwartete Häufigkeit 14; die Voraussetzung ist erfüllt.

Bei kleinen erwarteten Häufigkeiten:

- bei 2 × 2-Tabellen den **exakten Test nach Fisher** verwenden;
- bei größeren Tabellen Kategorien sinnvoll zusammenfassen (z. B. zwei selten gewählte Optionen als „Sonstiges“) und dies im Methodenteil begründen.

## Bericht nach APA 7

„Mit einem Chi-Quadrat-Unabhängigkeitstest wurde geprüft, ob sich die bevorzugte Lernform nach Geschlecht unterscheidet. Die Präferenz hing signifikant mit dem Geschlecht zusammen, χ²(2, N = 120) = 11.50, p = .003, Cramérs V = .31. Studentinnen bevorzugten häufiger hybrides Lernen (53.3 %), Studenten häufiger Präsenzlernen (46.7 %).“

**Formatregeln:**

- Nach χ² Freiheitsgrade und Stichprobengröße in Klammern angeben.
- Die Kreuztabelle mit Häufigkeiten und Zeilenprozenten zeigen, damit die Richtung sichtbar wird.
- Keine führende Null bei p.

Zum Tabellenformat siehe unseren [Leitfaden zu APA-7-Tabellen und -Abbildungen](/de/blog/apa-7-tabellen-und-abbildungen).

## Unterschied zum Anpassungstest

Chi-Quadrat wird auf zwei Arten verwendet:

- **Unabhängigkeitstest** (dieser Artikel): Hängen zwei kategoriale Variablen zusammen?
- **Anpassungstest:** Entspricht die Verteilung einer Variable einer erwarteten Verteilung? (z. B. „Wurden alle Optionen gleich oft gewählt?“)

Die Berechnung ist ähnlich, die Frage aber verschieden; geben Sie klar an, welchen Test Sie verwendet haben.

## Häufige Fehler

- Chi-Quadrat mit Prozenten oder Mittelwerten rechnen (es braucht Häufigkeiten)
- Mehrfachantworten verwenden, bei denen eine Person in mehreren Zellen steht
- Die Voraussetzung der erwarteten Häufigkeiten nicht prüfen
- Die Richtung eines signifikanten Zusammenhangs nicht aus der Tabelle deuten
- Die Effektstärke (Cramérs V) nicht berichten

## Chi-Quadrat mit Academiana

Nach dem Hochladen Ihrer Datendatei wählen Sie unter „Werkzeuge“ → „Statistische Analyse“ → „Chi-Quadrat-Unabhängigkeitstest“ zwei kategoriale Variablen. Sie erhalten beobachtete Häufigkeiten mit Zeilenprozenten, χ²-Wert, Freiheitsgrade, p-Wert und Cramérs V im APA-Format; haben mehr als 20 % der Zellen erwartete Häufigkeiten unter 5, erscheint ein Hinweis auf den exakten Test nach Fisher oder das Zusammenfassen von Kategorien. Welcher Test zu welcher Frage passt, zeigt unser Leitfaden [welcher statistische Test](/de/blog/welcher-statistische-test).`,
  },
  "doi-nedir-nasil-bulunur": {
    slug: "doi-was-ist-das-und-wie-finden",
    title: "Was ist eine DOI, wie findet und prüft man sie? DOIs im Literaturverzeichnis",
    seoTitle: "Was ist eine DOI und wie findet man sie? Leitfaden",
    description: "Was eine DOI ist, wie man sie findet, prüft und im Literaturverzeichnis angibt: APA-7-Regeln, Quellen ohne DOI und das Risiko erfundener DOIs.",
    keywords: ["was ist eine DOI", "DOI finden", "DOI suchen", "DOI im Literaturverzeichnis", "APA 7 DOI", "DOI prüfen"],
    cta: { text: "Academiana prüft Quellen per DOI, ergänzt fehlende DOIs und Angaben und schreibt sie korrekt im gewählten Zitierstil.", label: "Quellen prüfen" },
    body: `Am Ende vieler Literaturangaben steht ein Link, der mit „https://doi.org/10…“ beginnt. Das ist die **DOI** der Publikation: eine Kennung, die sich nie ändert. Richtig verwendet, führt sie Leserinnen und Leser mit einem Klick zur Quelle und erleichtert die Prüfung, ob die Quelle existiert. Dieser Leitfaden erklärt, was eine DOI ist, wie man sie findet und prüft und wie man sie im Literaturverzeichnis angibt.

## Was ist eine DOI?

Eine DOI (Digital Object Identifier) ist eine dauerhafte Kennung für eine Publikation oder einen Datensatz. Auch wenn sich die Webadresse ändert oder die Zeitschrift den Verlag wechselt, bleibt die DOI gleich und führt immer zur aktuellen Seite der Publikation. Das System wird von der International DOI Foundation betrieben; die meisten DOIs wissenschaftlicher Artikel werden über **Crossref** registriert, viele Datensatz-DOIs über **DataCite**.

## Aufbau einer DOI

Jede DOI besteht aus zwei Teilen und beginnt mit „10.“:

- **Präfix:** der Teil mit „10.“, der Verlag oder registrierende Stelle kennzeichnet.
- **Suffix:** der Teil nach dem Schrägstrich, vom Verlag vergeben und eindeutig für die Publikation.

Als Link schreibt man **https://doi.org/** davor. Im Browser geöffnet, führt er zur Seite der Publikation.

## Welche Publikationen haben eine DOI?

- Die meisten Artikel in internationalen begutachteten Zeitschriften
- Viele Zeitschriftenartikel in nationalen Plattformen (je nach Zeitschrift)
- Manche wissenschaftlichen Bücher und Buchkapitel
- Tagungsbeiträge, Berichte und Datensätze (sofern registriert)

Abschlussarbeiten, ältere Publikationen und manche nationale Zeitschriften haben oft keine DOI. Eine Quelle ohne DOI ist nicht ungültig; geben Sie die vollständige Literaturangabe und, falls vorhanden, eine stabile Adresse an.

## So finden Sie eine DOI

1. **Im Artikel nachsehen.** Die DOI steht meist auf der ersten Seite unter dem Titel oder in der Kopfzeile.
2. **Auf der Zeitschriftenseite nachsehen.** Die Artikelseite nennt die DOI bei den bibliografischen Angaben.
3. **Bei Crossref suchen.** Geben Sie den Artikeltitel in die Crossref-Suche ein.
4. **Literaturverwaltung nutzen.** Zotero und Mendeley übernehmen die DOI beim Erfassen einer Artikelseite; siehe unseren [Leitfaden zu Zotero und Mendeley](/de/blog/zotero-mendeley-literaturverwaltung).
5. **Unser kostenloses Werkzeug nutzen.** Unser [Literaturverzeichnis-Generator](/de/araclar/kaynakca-olusturucu) findet Angaben anhand von DOI oder Titel.

## So prüfen Sie eine DOI

Prüfen Sie in zwei Schritten, ob eine DOI echt und korrekt ist:

1. **Link öffnen:** Ein Link mit https://doi.org/ muss zu einer Publikationsseite führen. Erscheint „DOI not found“, ist sie falsch abgeschrieben oder erfunden.
2. **Angaben vergleichen:** Titel, Autorinnen und Autoren, Jahr und Zeitschrift müssen exakt mit Ihrer Angabe übereinstimmen. Führt die DOI zu **einem anderen Artikel**, passen Angabe und DOI nicht zusammen.

## KI und erfundene DOIs

KI-Chatwerkzeuge können realistisch wirkende, aber nicht existierende Quellen erzeugen, mitunter mit erfundenen DOIs. Solche DOIs führen ins Leere oder zu einer ganz anderen Publikation. Prüfen Sie jede von einer KI vorgeschlagene Quelle per DOI und zitieren Sie nichts, was Sie nicht gelesen haben. Ihre ganze Liste können Sie mit unserer kostenlosen [Prüfung auf erfundene Quellen](/de/araclar/uydurma-kaynak-kontrolu) checken; mehr dazu in unserem Leitfaden [KI-erfundene Quellen erkennen](/de/blog/ki-erfundene-quellen-erkennen).

## DOI im Literaturverzeichnis angeben

APA-7-Regeln für DOIs:

- Die DOI als Link mit **https://doi.org/** schreiben.
- Ältere Formate vermeiden („doi:“ oder „DOI:“, „dx.doi.org“).
- Kein „Abgerufen von“ vor der DOI.
- Kein Punkt nach der DOI.
- Hat eine Quelle eine DOI, keine Datenbank und keine weitere URL angeben.

Andere Stile weichen ab: IEEE und Vancouver verwenden teils auch „doi:“. Dieselbe Quelle in sieben Stilen nebeneinander zeigt unser [Leitfaden zum Literaturverzeichnis](/de/blog/literaturverzeichnis-erstellen-zitierstile).

## Quellen ohne DOI

- **Zeitschriftenartikel ohne DOI:** Vollständige Angabe (Autorinnen und Autoren, Jahr, Titel, Zeitschrift, Band, Heft, Seiten). Ist der Artikel online, erlaubt APA 7 die URL der Artikelseite.
- **Abschlussarbeit:** Art der Arbeit, Hochschule und, falls vorhanden, die Repositoriumsnummer.
- **Webseite:** Stabile Adresse und, wenn sich der Inhalt ändern kann, das Abrufdatum.

## Häufige Fehler

- Die DOI im alten Format „doi:10…“ schreiben
- Einen Punkt nach der DOI setzen (kann den Link brechen)
- Nur einen Teil der DOI kopieren
- Die DOI nicht öffnen und mit der Angabe vergleichen
- Für ein Kapitel die DOI des Buches oder für einen Artikel die der Zeitschrift verwenden

## DOIs mit Academiana

Wenn Sie in Academiana eine Quelle hinzufügen, wird ihre DOI über Crossref, DataCite oder PubMed geprüft und der Prüfstatus neben jeder Quelle angezeigt. Fehlende DOIs und Angaben werden aus Datenbanken ergänzt, und das Literaturverzeichnis schreibt die DOI korrekt im gewählten Stil. Die Qualitätsprüfung listet Quellen, denen eine DOI fehlt, und Quellen, die nicht geprüft werden konnten.`,
  },
  "yapay-zeka-kullanim-beyani-nasil-yazilir": {
    slug: "ki-nutzungserklaerung-schreiben",
    title: "KI-Nutzungserklärung schreiben: Beispiele für Abschlussarbeiten und Artikel",
    seoTitle: "KI-Nutzungserklärung schreiben – mit Beispielen",
    description: "Wo und wie Sie eine KI-Nutzungserklärung in Abschlussarbeit oder Artikel schreiben: Pflichtangaben, Beispieltexte je Nutzungsart und KI-Zitation nach APA.",
    keywords: ["KI-Nutzungserklärung", "Erklärung KI Nutzung Beispiel", "ChatGPT angeben Abschlussarbeit", "KI Erklärung Masterarbeit", "KI zitieren APA", "KI-Richtlinie Zeitschrift"],
    cta: { text: "Academiana erfindet keine Quellen, Daten oder Ergebnisse und hält jeden Schritt in der Versionsgeschichte fest. Nutzen Sie KI transparent und so, dass Sie es offenlegen können.", label: "Transparent arbeiten" },
    body: `Mit der Verbreitung von KI-Werkzeugen beim wissenschaftlichen Schreiben verlangen viele Zeitschriften und Hochschulen, dass ihre Nutzung **klar offengelegt** wird. Eine gut geschriebene Erklärung schützt die wissenschaftliche Integrität und beugt späteren Fragen vor. Dieser Leitfaden zeigt, wohin die Erklärung gehört, was sie enthalten muss, und gibt Beispieltexte für verschiedene Nutzungsarten. Die ethischen Grenzen der KI-Nutzung allgemein behandeln wir im Leitfaden [Ist KI für die Abschlussarbeit ethisch?](/de/blog/ki-fuer-abschlussarbeit-ethisch)

## Warum offenlegen?

- **Transparenz:** Leser und Gutachterinnen sollen wissen, welches Werkzeug wofür und in welchen Teilen verwendet wurde.
- **Verantwortung:** Das Publikationsethik-Gremium COPE und das International Committee of Medical Journal Editors (ICMJE) betonen, dass KI-Werkzeuge keine Autoren sein können, weil sie keine Verantwortung übernehmen können. Die Verantwortung liegt bei der Person, die das Werkzeug nutzt.
- **Regelkonformität:** Viele Zeitschriften und Hochschulen verlangen eine Erklärung; nicht offengelegte Nutzung kann als Verstoß gewertet werden.

## Zuerst die Regeln lesen

Form und Ort der Erklärung sind unterschiedlich. Prüfen Sie vor dem Schreiben:

- **Bei Abschlussarbeiten:** die Prüfungsordnung, Richtlinien des Instituts und eine etwaige KI-Richtlinie (oft ist die Erklärung Teil der eidesstattlichen Versicherung).
- **Bei Artikeln:** die Autorenhinweise der Zielzeitschrift und die KI-Richtlinie des Verlags.
- **Ihre Betreuung:** Sprechen Sie früh ab, in welchen Phasen Sie KI nutzen wollen.

Manche Einrichtungen nehmen begrenzte Nutzungen wie Sprachkorrektur aus, andere verlangen die Offenlegung jeder Nutzung. Maßgeblich ist die Regel Ihrer Einrichtung.

## Was eine Erklärung enthalten muss

1. **Werkzeug:** Name und möglichst Version.
2. **Zweck:** wofür es genutzt wurde (Sprachkorrektur, Übersetzung, Suchstrategie, Programmierung, Entwurf).
3. **Umfang:** in welchen Abschnitten.
4. **Kontrolle:** dass die Ausgaben geprüft und bearbeitet und die Quellen verifiziert wurden.
5. **Verantwortung:** dass die verfassende Person für den Inhalt verantwortlich ist.

## Wohin gehört sie?

- **Im Artikel:** meist im Methodenteil, in der Danksagung oder unter einer eigenen Überschrift „Erklärung zur KI-Nutzung“ vor dem Literaturverzeichnis.
- **In der Abschlussarbeit:** wenn nicht geregelt, neben der Eigenständigkeitserklärung oder als eigener Absatz am Ende des Methodenkapitels.
- **Bei Code und Datenanalyse:** Wurde KI für Code genutzt, im Analyseteil der Methoden angeben.

## Beispieltexte je Nutzungsart

Die Texte sind Beispiele; ersetzen Sie die Angaben in Klammern und passen Sie sie an die Regeln Ihrer Einrichtung an.

**Sprachkorrektur:**
„[Werkzeug, Version] wurde zur Prüfung von Sprache und Grammatik dieser Arbeit verwendet. Das Werkzeug diente nur der Grammatik und Formulierung; Inhalt, Ergebnisse und Interpretationen stammen von der Verfasserin bzw. dem Verfasser. Alle Vorschläge wurden geprüft.“

**Suchunterstützung in der Literaturrecherche:**
„[Werkzeug] wurde genutzt, um Schlagwörter und Suchstrings für die Literaturrecherche vorzuschlagen. Alle Quellen wurden in Datenbanken gefunden, gelesen und verifiziert.“

**Entwurf und Überarbeitung:**
„[Werkzeug] wurde genutzt, um erste Entwürfe der Kapitel [Kapitelnamen] zu erstellen. Die Entwürfe wurden umfassend überarbeitet, alle Zitate an den Originalquellen geprüft. Die Verantwortung für den Inhalt liegt bei der verfassenden Person.“

**Code für die Datenanalyse:**
„[Werkzeug] wurde genutzt, um den [Software]-Code für die Datenanalyse zu schreiben. Der Code wurde getestet und die Ergebnisse unabhängig geprüft.“

**Übersetzung:**
„Die erste Übersetzung des englischen Abstracts wurde mit [Werkzeug] erstellt und anschließend korrigiert.“

## KI nach APA zitieren

Wird eine KI-Ausgabe wörtlich im Text wiedergegeben (etwa als Beispiel im Methodenteil), schlägt APA ein Zitierformat mit der entwickelnden Organisation als Autor und dem Versionsdatum als Jahr vor. Empfohlen wird außerdem, den verwendeten Prompt im Text oder Anhang anzugeben. KI-Ausgaben sind jedoch **keine wissenschaftliche Quelle**: Um eine Aussage zu belegen, zitieren Sie die Originalquelle, nicht das KI-Werkzeug.

## Was Sie vermeiden sollten

- Die Art der Nutzung herunterspielen
- Vage Erklärungen wie „mit KI geschrieben“ ohne Umfang
- Das KI-Werkzeug als Autor oder als „Mitwirkenden“ in der Danksagung nennen
- Die Erklärung erst nachträglich einfügen, wenn ein Plagiatsbericht Fragen aufwirft

## Den Prozess dokumentieren

Bewahren Sie Belege für Ihre Erklärung auf: verwendete Prompts, Versionsgeschichte und Entwürfe mit Ihren Änderungen. Da KI-Detektoren Fehlalarme erzeugen können, schützen diese Belege Sie; mehr dazu in unserem Leitfaden [Sind KI-Detektoren zuverlässig?](/de/blog/ki-detektoren-zuverlaessig)

## Transparente Nutzung mit Academiana

Academiana erfindet keine Quellen, Daten oder Ergebnisse: Zitate verweisen nur auf echte Quellen Ihrer Bibliothek, unbekannte Angaben werden als „Daten einzutragen“ markiert. Jeder Entwurf, den der Assistent einfügt, wird in der Versionsgeschichte mit „KI“-Kennzeichnung gespeichert, sodass Sie später sehen, welcher Abschnitt in welcher Phase mit KI-Unterstützung entstand, und Ihre Erklärung danach verfassen können.`,
  },
};
