import type { BlogPostEn } from "./types";

/** Almanca sürümler, 8. dosya (D197). Sayılar Türkçe yazılarla aynıdır (tests/blog-d197.test.ts). */
export const DE_8: Record<string, BlogPostEn> = {
  "tek-yonlu-anova-nasil-yapilir-ve-raporlanir": {
    slug: "einfaktorielle-anova-durchfuehren-und-berichten",
    title: "Einfaktorielle ANOVA durchführen, interpretieren und berichten (Rechenbeispiel mit Bonferroni)",
    seoTitle: "Einfaktorielle ANOVA durchführen und nach APA 7 berichten",
    description: "Einfaktorielle ANOVA Schritt für Schritt: Voraussetzungen, Levene-Test, F-Tabelle, Eta-Quadrat, Bonferroni-Post-hoc-Tests und APA-7-Bericht mit Rechenbeispiel.",
    keywords: ["einfaktorielle ANOVA durchführen", "ANOVA interpretieren", "ANOVA nach APA berichten", "Bonferroni Post-hoc", "Eta-Quadrat", "Varianzanalyse Abschlussarbeit"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und wählen Sie „Werkzeuge“ → „Statistische Analyse“ → „Einfaktorielle Varianzanalyse (ANOVA)“: F-Tabelle, Eta-Quadrat und Tukey-HSD- bzw. Games-Howell-Vergleiche im APA-Format.", label: "Meine ANOVA rechnen" },
    body: `Die einfaktorielle Varianzanalyse (ANOVA) vergleicht die Mittelwerte von **drei oder mehr unabhängigen Gruppen** in einem einzigen Test. Fragen wie „Welche von drei Lehrmethoden ist am erfolgreichsten?“ oder „Unterscheiden sich Angstwerte nach Studienjahr?“ werden in Abschlussarbeiten meist mit einer ANOVA geprüft. Dieser Leitfaden führt durch alle Schritte, von der Testauswahl bis zum Bericht nach APA 7, und interpretiert jede Zahl am selben Beispiel.

Alle Zahlen in diesem Artikel wurden mit der Statistik-Engine von Academiana aus den unten angegebenen Beispieldaten berechnet. Sie können die Daten in Ihr eigenes Programm eingeben und erhalten dieselben Ergebnisse.

## Wann verwendet man eine ANOVA?

- **Die abhängige Variable muss metrisch sein:** Prüfungspunkte, Skalensummen, Zeiten.
- **Die unabhängige Variable muss kategorial sein und mindestens drei Stufen haben:** Methode (A, B, C), Studienjahr (1, 2, 3, 4), Fakultät.
- **Die Gruppen müssen unabhängig sein:** Jede Person gehört nur zu einer Gruppe.

Bei zwei Gruppen verwendet man stattdessen den [t-Test für unabhängige Stichproben](/de/blog/t-test-durchfuehren-und-interpretieren) (bei zwei Gruppen entspricht F dem Quadrat von t). Wurden dieselben Personen drei- oder mehrmals gemessen, braucht man eine ANOVA mit Messwiederholung. Eine Übersicht, welcher Test wann passt, finden Sie in unserem Leitfaden [welcher statistische Test](/de/blog/welcher-statistische-test).

### Warum nicht drei einzelne t-Tests?

Drei Gruppen paarweise zu vergleichen bedeutet drei Tests. Wird jeder auf dem Niveau .05 gerechnet, steigt die Wahrscheinlichkeit für mindestens ein fälschlich „signifikantes“ Ergebnis auf etwa 14 % (1 − 0.95³). Die ANOVA stellt zuerst mit einem einzigen Test die Frage: „Gibt es überhaupt einen Unterschied zwischen den Gruppen?“ Wenn ja, zeigen korrigierte paarweise Vergleiche (Post-hoc-Tests), wo er liegt.

## Voraussetzungen und ihre Prüfung

1. **Unabhängige Beobachtungen:** Folgt aus dem Forschungsdesign und wird im Methodenteil begründet, nicht getestet.
2. **Normalverteilung:** Jede Gruppe sollte annähernd normalverteilt sein. Prüfen Sie Schiefe und Kurtosis je Gruppe; siehe unseren Leitfaden zur [Prüfung der Normalverteilung](/de/blog/normalverteilung-pruefen-schiefe-kurtosis). Bei gleich großen, ausreichend besetzten Gruppen ist die ANOVA gegenüber kleinen Abweichungen recht robust.
3. **Varianzhomogenität:** Die Gruppenvarianzen sollten ähnlich sein. Geprüft wird mit dem Levene-Test. Ist er signifikant (p < .05), sind die **Welch-ANOVA** und Games-Howell-Vergleiche vorzuziehen.

Ist die Normalverteilung stark verletzt und sind die Gruppen klein, kommt die nichtparametrische Alternative, der **Kruskal-Wallis-H-Test**, infrage.

## Rechenbeispiel: drei Lehrmethoden

Eine Forscherin untersucht die Wirkung dreier Lehrmethoden auf das Prüfungsergebnis. Jede Methode hat 10 Studierende (N = 30):

- **Frontalunterricht:** 62, 70, 75, 58, 68, 73, 66, 79, 64, 71
- **Frage-Antwort:** 70, 66, 78, 74, 81, 69, 72, 85, 63, 76
- **Projektbasiert:** 75, 82, 71, 88, 79, 84, 69, 90, 77, 80

Forschungsfrage: *Unterscheiden sich die Prüfungsergebnisse signifikant nach Lehrmethode?*

### 1. Deskriptive Statistik

| Gruppe | n | M | SD |
| --- | --- | --- | --- |
| Frontalunterricht | 10 | 68.60 | 6.33 |
| Frage-Antwort | 10 | 73.40 | 6.80 |
| Projektbasiert | 10 | 79.50 | 6.82 |

Die Mittelwerte steigen vom Frontalunterricht zur projektbasierten Methode, die Standardabweichungen sind sehr ähnlich, ein erster Hinweis, dass Varianzhomogenität wahrscheinlich gegeben ist.

### 2. Levene-Test

Der Levene-Test ergab F(2, 27) = 0.03, p = .969. Da p größer als .05 ist, wird die Annahme gleicher Varianzen nicht verworfen; die klassische ANOVA-Tabelle kann verwendet werden.

### 3. Die ANOVA-Tabelle

| Quelle | QS | df | MQS | F | p | η² |
| --- | --- | --- | --- | --- | --- | --- |
| Zwischen den Gruppen | 596.87 | 2 | 298.43 | 6.74 | .004 | .33 |
| Innerhalb der Gruppen | 1195.30 | 27 | 44.27 | | | |
| Gesamt | 1792.17 | 29 | | | | |

Zeile für Zeile gelesen:

- **QS (Quadratsumme):** Von der Gesamtvariabilität (1792.17) entfallen 596.87 auf Unterschiede zwischen den Gruppen und 1195.30 auf individuelle Unterschiede innerhalb der Gruppen.
- **df (Freiheitsgrade):** Zwischen den Gruppen = Gruppenzahl − 1 = 2; innerhalb = N − Gruppenzahl = 27.
- **MQS (mittlere Quadratsumme):** QS geteilt durch df. F ist das Verhältnis der MQS zwischen zur MQS innerhalb der Gruppen: 298.43 / 44.27 = 6.74.
- **F(2, 27) = 6.74, p = .004:** Der Unterschied ist zu groß, um durch Zufall erklärt zu werden. Mindestens zwei Gruppenmittelwerte unterscheiden sich.
- **η² = .33:** 33 % der Variabilität werden durch die Lehrmethode erklärt, nach Cohen (1988) ein großer Effekt (.01 klein, .06 mittel, .14 groß). Bei kleinen Stichproben kann zusätzlich das weniger verzerrte **ω² = .28** berichtet werden.

### 4. Post-hoc: Welche Gruppen unterscheiden sich?

Die ANOVA sagt nur, dass irgendwo ein Unterschied besteht. Bonferroni-korrigierte Paarvergleiche zeigen, wo:

| Vergleich | Mittelwertdifferenz | p (Bonferroni) |
| --- | --- | --- |
| Frontalunterricht – Frage-Antwort | −4.80 | .355 |
| Frontalunterricht – Projektbasiert | −10.90 | .003 |
| Frage-Antwort – Projektbasiert | −6.10 | .151 |

Signifikant ist nur der Unterschied zwischen **Frontalunterricht und projektbasierter Methode**. Die Frage-Antwort-Gruppe liegt dazwischen und unterscheidet sich von keiner signifikant.

> Die Bonferroni-Korrektur multipliziert jeden p-Wert mit der Zahl der Vergleiche (hier 3). Sie ist konservativ: Sie kontrolliert falsch-positive Ergebnisse gut, kann aber kleine Unterschiede übersehen. Bei mehr Gruppen sind Alternativen wie Tukey-HSD verbreitet; begründen Sie Ihre Wahl im Methodenteil.

### 5. Das Ergebnis richtig lesen

Hier gibt es nur 10 Studierende pro Gruppe. Dass die Vergleiche mit der Frage-Antwort-Gruppe nicht signifikant sind, bedeutet nicht „kein Unterschied“; bei kleiner Stichprobe hat der Test wenig Teststärke für Unterschiede dieser Größe. Deshalb sollte die nötige Gruppengröße vorab berechnet werden: siehe unseren Leitfaden zur [Stichprobengröße](/de/blog/stichprobengroesse-berechnen) und den kostenlosen [Stichprobenrechner](/de/araclar/orneklem-hesaplayici).

## Bericht nach APA 7

**Im Text:**

„Die Prüfungsergebnisse unterschieden sich signifikant nach Lehrmethode, F(2, 27) = 6.74, p = .004, η² = .33. Bonferroni-korrigierte Vergleiche zeigten, dass Studierende der projektbasierten Methode (M = 79.50, SD = 6.82) signifikant höhere Werte erzielten als Studierende im Frontalunterricht (M = 68.60, SD = 6.33), p = .003. Die Frage-Antwort-Gruppe (M = 73.40, SD = 6.80) unterschied sich von keiner der beiden anderen Gruppen signifikant.“

**Formregeln:**

- F, p, M und SD kursiv; griechische Buchstaben wie η² nicht kursiv.
- Nach F beide Freiheitsgrade in Klammern angeben: F(2, 27).
- Keine führende Null vor p (.004); bei p unter .001 „p < .001“ schreiben, nie „p = .000“.
- Bei mehreren abhängigen Variablen Mittelwerte, SD, F, p und η² in einer Tabelle zusammenfassen. Zum Tabellenformat siehe unseren Leitfaden zu [APA-7-Tabellen und -Abbildungen](/de/blog/apa-7-tabellen-und-abbildungen).

## Häufige Fehler

- Post-hoc-Ergebnisse interpretieren, obwohl die ANOVA nicht signifikant war
- Die klassische ANOVA berichten, ohne den Levene-Test zu prüfen
- Nur p berichten und die Effektstärke weglassen
- Eine einfaktorielle (unabhängige) ANOVA auf Messwiederholungen derselben Personen anwenden
- Unkorrigierte t-Tests als Post-hoc-Tests verwenden
- „Nicht signifikant“ als „die Gruppen sind gleich“ deuten
- Das Ergebnis schon im Ergebnisteil mit der Literatur diskutieren; die Deutung gehört in die [Diskussion](/de/blog/ergebnisse-und-diskussion-schreiben)

## ANOVA mit Academiana

Nachdem Sie Ihre Datendatei (CSV oder XLSX) in Ihre Arbeit hochgeladen haben, wählen Sie unter „Werkzeuge“ → „Statistische Analyse“ die „Einfaktorielle Varianzanalyse (ANOVA)“ sowie die abhängige und die Gruppierungsvariable. Sie erhalten Gruppenstatistiken, die ANOVA-Tabelle, η² mit 95 %-KI, den Levene-Test und, falls die ANOVA signifikant ist, Post-hoc-Vergleiche (Tukey-HSD bei Varianzhomogenität, sonst Games-Howell) im APA-Format; mit einem Klick als nummerierte Tabelle in Ihr Dokument. Gruppenmittelwerte mit Fehlerbalken zeigt das Werkzeug „Diagramm erstellen“. Die Zahlen erzeugt nicht die KI; die Statistik-Engine der Website berechnet sie aus Ihren Daten.`,
  },
  "regresyon-analizi-apa-7-raporlama": {
    slug: "regressionsanalyse-nach-apa-7-berichten",
    title: "Regressionsergebnisse nach APA 7 berichten: einfache und multiple lineare Regression",
    seoTitle: "Regressionsanalyse nach APA 7 berichten",
    description: "Einfache und multiple lineare Regression: R², F, B, β und Konfidenzintervalle lesen, APA-7-Tabelle und Textbeispiel, Multikollinearität und häufige Fehler.",
    keywords: ["Regression nach APA berichten", "multiple Regression interpretieren", "Regressionstabelle APA 7", "standardisiertes Beta", "R-Quadrat interpretieren", "lineare Regression Abschlussarbeit"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und fügen Sie über „Werkzeuge“ → „Statistische Analyse“ → „Lineare Regression“ eine APA-Tabelle mit B, β, Konfidenzintervallen und Modellzusammenfassung ein.", label: "Meine Regression rechnen" },
    body: `Die lineare Regression zeigt, wie gut eine oder mehrere Variablen (Prädiktoren) ein Ergebnis (die abhängige Variable) erklären und wie sich das Ergebnis mit ihnen verändert. Fragen wie „Sagt die Lernzeit die Prüfungsleistung vorher?“ oder „Wie viel erklären Selbstwirksamkeit und Angst gemeinsam am Burnout?“ werden mit Regression geprüft. Dieser Leitfaden zeigt, wie man die Ausgabe Zeile für Zeile liest und nach APA 7 berichtet, mit denselben Daten für einfache und multiple Regression.

Alle Zahlen in diesem Artikel wurden mit der Statistik-Engine von Academiana aus den unten angegebenen Beispieldaten berechnet.

## Korrelation und Regression

Die Korrelation zeigt, ob zwei Variablen gemeinsam variieren und wie stark; sie hat keine Richtung. Die Regression bestimmt eine Variable als **Kriterium** und die anderen als **Prädiktoren** und beantwortet: „Wie stark ändert sich das Kriterium, wenn ein Prädiktor um eine Einheit steigt?“

> „Vorhersagen“ heißt nicht „verursachen“. In einem korrelativen Design schätzt die Regression Größe und Richtung eines Zusammenhangs; kausale Schlüsse erfordern ein experimentelles Design. Machen Sie diese Unterscheidung im Methoden- und Diskussionsteil deutlich.

## Beispieldaten

Für 20 Studierende wurden die **durchschnittliche tägliche Lernzeit (Stunden)** in der Woche vor der Prüfung, der **durchschnittliche nächtliche Schlaf (Stunden)** und die **Prüfungspunktzahl** erfasst:

- **Lernzeit:** 2, 4, 3, 6, 5, 8, 7, 1, 9, 6, 4, 5, 7, 3, 8, 6, 2, 5, 7, 4
- **Schlaf:** 6, 7, 5, 8, 6, 7, 8, 5, 7, 6, 8, 7, 6, 5, 8, 7, 6, 6, 7, 5
- **Prüfungspunkte:** 64, 61, 62, 70, 75, 71, 79, 58, 75, 74, 65, 76, 65, 60, 83, 70, 52, 71, 80, 57

Zunächst die Korrelationen: Lernzeit und Prüfungspunkte r(18) = .78 (p < .001); Schlaf und Prüfungspunkte r(18) = .62 (p = .003). Achtung: **Lernzeit und Schlaf korrelieren ebenfalls**, r(18) = .61 (p = .004). Das wird in der multiplen Regression wichtig.

## Einfache lineare Regression: ein Prädiktor

Mit der Lernzeit als einzigem Prädiktor:

- **Modell:** F(1, 18) = 28.23, p < .001, R² = .61, korrigiertes R² = .59
- **Konstante:** B = 53.17
- **Lernzeit:** B = 2.99, β = .78, p < .001, 95-%-KI [1.81, 4.17]

Interpretation: Die tägliche Lernzeit erklärt 61 % der Varianz der Prüfungspunkte. **Jede zusätzliche Lernstunde geht im Mittel mit 2.99 Punkten mehr einher.** Mit nur einem Prädiktor entspricht das standardisierte β dem Pearson-r (.78).

## Multiple lineare Regression: zwei Prädiktoren

Nun nehmen wir den Schlaf ins Modell auf. Die Ausgabe:

| Prädiktor | B | SE | β | t | p | 95-%-KI |
| --- | --- | --- | --- | --- | --- | --- |
| (Konstante) | 43.52 | 8.00 | | 5.44 | < .001 | [26.65, 60.40] |
| Lernzeit | 2.44 | 0.70 | .64 | 3.50 | .003 | [0.97, 3.90] |
| Schlaf | 1.92 | 1.47 | .24 | 1.30 | .209 | [−1.18, 5.02] |

*Anmerkung.* R² = .65, korrigiertes R² = .60, F(2, 17) = 15.51, p < .001.

### 1. Modellzusammenfassung: R², korrigiertes R² und F

- **F(2, 17) = 15.51, p < .001:** Das Modell ist insgesamt signifikant; beide Prädiktoren zusammen erklären die Prüfungspunkte.
- **R² = .65:** Etwa 65 % (genau 64.6 %) der Varianz werden durch die beiden Prädiktoren erklärt.
- **Korrigiertes R² = .60:** Um Prädiktorenzahl und Stichprobengröße bereinigt. Bei kleinen Stichproben und vielen Prädiktoren immer berichten.

Der Schlaf erhöhte R² von .61 auf .65; er erklärt also über die Lernzeit hinaus nur etwa **4 Prozentpunkte zusätzlicher Varianz**.

### 2. B: der unstandardisierte Koeffizient

**B** ist die mittlere Veränderung des Kriteriums bei einer Einheit mehr im Prädiktor, wenn die übrigen Prädiktoren konstant gehalten werden. Bei konstantem Schlaf geht jede zusätzliche Lernstunde mit durchschnittlich **2.44 Punkten** mehr einher. B liegt in den Einheiten der Variablen vor und eignet sich daher nicht zum Vergleich unterschiedlich skalierter Prädiktoren.

### 3. β: der standardisierte Koeffizient

**β** wird auf standardisierten Werten berechnet und dient dem Vergleich der relativen Bedeutung der Prädiktoren. Das β der Lernzeit (.64) ist deutlich größer als das des Schlafs (.24).

### 4. t, p und Konfidenzintervall

- **Lernzeit:** t = 3.50, p = .003, 95-%-KI [0.97, 3.90]. Das Intervall schließt null aus: ein signifikanter Prädiktor.
- **Schlaf:** t = 1.30, p = .209, 95-%-KI [−1.18, 5.02]. Das Intervall schließt null ein: bei kontrollierter Lernzeit kein signifikanter Prädiktor.

### 5. Warum ist Schlaf allein korreliert, im Modell aber nicht signifikant?

Schlaf hing für sich genommen signifikant mit den Prüfungspunkten zusammen (r = .62), war in der multiplen Regression aber nicht signifikant. Der Grund: Schlaf korreliert auch mit der Lernzeit (r = .61). Der Großteil der Varianz, die Schlaf mit den Prüfungspunkten teilt, ist auch mit der Lernzeit geteilt; sobald die Lernzeit im Modell ist, schrumpft der **eigenständige** Beitrag des Schlafs. Das ist eine typische Folge korrelierter Prädiktoren (Multikollinearität). Formulieren Sie die Deutung immer „unter Kontrolle der übrigen Prädiktoren“.

## Voraussetzungen

1. **Linearität:** Der Zusammenhang zwischen Prädiktor und Kriterium sollte linear sein; Prüfung mit einem Streudiagramm.
2. **Unabhängigkeit der Residuen:** Beobachtungen sollten unabhängig sein (die Durbin-Watson-Statistik ist eine übliche Prüfung).
3. **Normalverteilung der Residuen:** Die Residuen sollten annähernd normalverteilt sein.
4. **Homoskedastizität:** Die Streuung der Residuen sollte über die vorhergesagten Werte ähnlich sein.
5. **Keine starke Multikollinearität:** Sehr hohe Korrelationen zwischen Prädiktoren (meist über .80) machen Koeffizienten instabil; VIF und Toleranz berichten.

Eine verbreitete Faustregel für die Stichprobengröße sind mindestens 10–15 Beobachtungen pro Prädiktor; robuster ist eine Poweranalyse. Das Beispiel mit 20 Personen dient nur der Veranschaulichung; eine echte Abschlussarbeit bräuchte eine größere Stichprobe.

## Bericht nach APA 7

**Im Text:**

„Mit einer multiplen linearen Regression wurde geprüft, ob die tägliche Lernzeit und der nächtliche Schlaf die Prüfungspunkte vorhersagen. Das Modell war signifikant, F(2, 17) = 15.51, p < .001, und erklärte 65 % der Varianz der Prüfungspunkte (R² = .65, korrigiertes R² = .60). Die Lernzeit war ein signifikanter Prädiktor, B = 2.44, β = .64, t = 3.50, p = .003, 95-%-KI [0.97, 3.90]; der Schlaf war bei kontrollierter Lernzeit kein signifikanter Prädiktor, B = 1.92, β = .24, t = 1.30, p = .209.“

**Tabelle:** Verwenden Sie eine Tabelle wie oben mit B, SE, β, t, p und Konfidenzintervall je Prädiktor und geben Sie die Modellzusammenfassung (R², korrigiertes R², F) in der Tabellenanmerkung an. Zu Titel und Nummerierung siehe unseren Leitfaden zu [APA-7-Tabellen und -Abbildungen](/de/blog/apa-7-tabellen-und-abbildungen).

**Formregeln:**

- B, t, p, F und R² kursiv; griechische Buchstaben wie β nicht kursiv.
- Keine führende Null bei Werten, die 1 nicht überschreiten können, etwa p und R² (.65, .003).
- Unstandardisierte (B) und standardisierte (β) Koeffizienten unterscheiden; beide zu berichten gibt die meiste Information.

## Häufige Fehler

- Regressionsergebnisse kausal formulieren („Lernzeit steigert die Leistung“)
- R² ohne korrigiertes R² berichten
- B und β verwechseln oder B-Werte unterschiedlicher Einheiten vergleichen
- Aus einer im multiplen Modell nicht mehr signifikanten Korrelation „kein Zusammenhang“ schließen
- Interkorrelationen der Prädiktoren und VIF nicht prüfen
- Viele Prädiktoren bei kleiner Stichprobe verwenden

## Regression mit Academiana

Nach dem Hochladen der Datendatei wählen Sie unter „Werkzeuge“ → „Statistische Analyse“ → „Lineare Regression“ Kriterium und Prädiktoren. Sie erhalten eine Tabelle mit B, Standardfehler, β, t, p und 95-%-Konfidenzintervallen sowie eine Modellzusammenfassung mit R², korrigiertem R² und F im APA-Format; mit einem Klick als nummerierte Tabelle in Ihr Dokument. Korrelationen zeigen Sie mit der „Korrelationsanalyse“ im selben Werkzeug, die Form des Zusammenhangs mit „Diagramm erstellen“ → „Streudiagramm“ (mit Regressionsgerade). Wenn Sie den Assistenten die Ergebnisse deuten lassen, bleibt jede Zahl im Text mit der Tabelle identisch; es werden keine neuen Werte erzeugt. Beim Schreiben hilft auch unser Leitfaden zu [Ergebnissen und Diskussion](/de/blog/ergebnisse-und-diskussion-schreiben).`,
  },
  "literatur-matrisi-nasil-hazirlanir": {
    slug: "literaturmatrix-erstellen",
    title: "Literaturmatrix erstellen: Schritt für Schritt zur Synthesetabelle für die Abschlussarbeit",
    seoTitle: "Literaturmatrix erstellen: Schritt-für-Schritt-Anleitung",
    description: "Was eine Literaturmatrix (Synthesetabelle) ist, welche Spalten sie braucht, wie man sie füllt und daraus Synthesetext für die Literaturübersicht schreibt.",
    keywords: ["Literaturmatrix erstellen", "Literaturmatrix Beispiel", "Synthesematrix", "Literaturübersicht Tabelle", "Konzeptmatrix", "Literaturvergleich Tabelle"],
    cta: { text: "Fügen Sie Ihre Quellen Ihrer Arbeit hinzu; unter „Quellen“ → „Literaturmatrix“ werden Ziel, Methode, Stichprobe und Befunde nur aus tatsächlich gelesenem Abstract oder Volltext gefüllt (Pro-Paket).", label: "Meine Matrix erstellen" },
    body: `Der häufigste Fehler in einer Literaturübersicht ist, **Quellen einzeln zusammenzufassen und aneinanderzureihen**: „Müller (2019) fand dies. Schmidt (2020) fand das.“ Daraus gewinnt niemand ein Bild des Forschungsstands. Das wirksamste Gegenmittel ist die **Literaturmatrix**: eine Vergleichstabelle, in der jede Quelle nach denselben Kriterien erfasst wird und in der man anschließend die Spalten statt der Zeilen liest. Dieser Leitfaden erklärt, was eine Matrix ist, welche Spalten sie braucht und wie man von der Tabelle zum Syntheseabsatz kommt.

## Was ist eine Literaturmatrix?

Eine Literaturmatrix (Synthesetabelle, Vergleichstabelle, „Matrix-Methode“) ist eine Tabelle mit einer Quelle pro Zeile und einem Vergleichskriterium pro Spalte. Die Kriterien ergeben sich aus der Forschungsfrage: Ziel, Methode, Stichprobe, Messinstrument, zentrale Befunde, Grenzen und Bezug zur eigenen Arbeit.

Die Methode wurde in den Gesundheitswissenschaften als „Matrix-Methode“ bekannt (Garrard). Die von Webster und Watson in der Wirtschaftsinformatik vorgeschlagene **Konzeptmatrix** folgt derselben Logik: Quellen nach Konzepten statt nach Autorinnen und Autoren ordnen. So wird die Übersicht **konzeptzentriert** statt **autorenzentriert**.

## Wozu eine Matrix?

- **Synthese wird leichter:** Wer eine Spalte von oben nach unten liest, sieht, welche Studien übereinstimmen und welche abweichen.
- **Lücken werden sichtbar:** Eine nicht untersuchte Stichprobe, Methode oder ein Kontext erscheint als leere Zelle und wird zur Begründung der eigenen Arbeit.
- **Weniger Nachlesen:** Man muss eine Quelle nach Monaten nicht erneut lesen, um sich zu erinnern.
- **Bessere Betreuungsgespräche:** Die Tabelle zeigt auf einen Blick, wie viel Literatur abgedeckt ist.

## Welche Spalten?

Eine Grundmatrix braucht diese Spalten:

1. **Quelle:** Autor und Jahr (die vollständige Angabe gehört ins Literaturverwaltungsprogramm).
2. **Ziel / Forschungsfrage:** Was wurde untersucht?
3. **Methode und Design:** Quantitativ, qualitativ, gemischt; Befragung, Experiment, Fallstudie …
4. **Stichprobe und Kontext:** Mit wem, wo, wie viele?
5. **Instrument / Datenerhebung:** Welche Skala, welcher Leitfaden, welche Datenbank?
6. **Zentrale Befunde:** Bei Zahlen mit Effektstärke.
7. **Grenzen:** Die von den Autoren genannten und die eigenen Beobachtungen.
8. **Bezug zu meiner Arbeit:** Wo und wofür wird die Quelle verwendet?

Ergänzen Sie spezifische Spalten: theoretischer Rahmen, Land, Altersgruppe, verwendete Statistik, Effektstärke. In einem systematischen Review wird die Matrix zum **Datenextraktionsformular**; siehe unseren Leitfaden zu [systematischem Review und PRISMA](/de/blog/systematisches-review-metaanalyse-prisma-2020).

## Schritt für Schritt zur Literaturmatrix

### 1. Forschungsfrage schärfen

Die Spalten folgen aus der Forschungsfrage. Für „Hängt die Social-Media-Nutzung von Studierenden mit akademischem Aufschieben zusammen?“ sind Stichprobe, Skala und Zusammenhangsstärke entscheidend.

### 2. Quellen sammeln und Suchentscheidungen festhalten

Notieren Sie Datenbanken, Suchbegriffe und Zeiträume. Zur Suchstrategie siehe unseren Leitfaden zur [Literaturrecherche](/de/blog/literaturrecherche-literaturuebersicht-schreiben).

### 3. Beim Lesen ausfüllen, nicht danach

Füllen Sie jede Zeile beim Lesen der Quelle aus. **Schreiben Sie nur, was Sie tatsächlich gelesen haben**: Raten Sie nicht die Stichprobengröße einer Studie, von der Sie nur das Abstract kennen; lassen Sie die Zelle leer und markieren Sie „Volltext lesen“. Das verhindert spätere Fehlzitate.

### 4. In eigenen Worten schreiben

Keine langen Zitate in die Zellen; kurz und in eigenen Worten. Direkte Zitate mit Seitenangabe in Anführungszeichen notieren. Das senkt auch das Plagiatsrisiko.

### 5. Spalten lesen, Themen finden

Ist die Matrix gefüllt, lesen Sie die Spalten statt der Zeilen. Suchen Sie wiederkehrende Muster in den Befunden, dominierende Designs in der Methodenspalte und Lücken in der Stichprobenspalte. Jedes Muster kann zu einer **Themenüberschrift** Ihrer Übersicht werden.

## Beispielmatrix

Die folgende Tabelle ist ein **fiktives** Beispiel zur Veranschaulichung; die Zeilen stehen nicht für echte Veröffentlichungen.

| Quelle | Ziel | Methode | Stichprobe | Zentraler Befund | Bezug zu meiner Arbeit |
| --- | --- | --- | --- | --- | --- |
| Studie A (2019) | Social-Media-Zeit und Aufschieben | Korrelative Befragung | 412 Bachelorstudierende | Mittlerer positiver Zusammenhang | Begründung von Hypothese 1 |
| Studie B (2021) | Wirkung von Benachrichtigungen auf Aufmerksamkeit | Experiment | 60 Studierende | Längere Bearbeitungszeit mit Benachrichtigungen | Diskussion des Mechanismus |
| Studie C (2022) | Erfahrungen mit Aufschieben | Qualitativ, Interviews | 18 Studierende | „Kurze Pausen“ in sozialen Medien werden länger | Bei der Deutung der Befunde |
| Studie D (2023) | Adaptation einer Aufschiebe-Skala | Validität und Reliabilität | 540 Studierende | Einfaktorielle Struktur, α = .86 | Erhebungsinstrument |

Beim Lesen der Spalten zeigen sich drei Dinge:

- **Befunde:** Korrelative, experimentelle und qualitative Studien weisen in dieselbe Richtung; diese Übereinstimmung kann ein Thema sein („übereinstimmende Befunde über Methoden hinweg“).
- **Methode:** Es gibt nur ein Experiment; kausale Evidenz ist begrenzt. Das ist eine Lücke.
- **Stichprobe:** Alle Studien arbeiteten mit Bachelorstudierenden; Masterstudierende wurden nicht untersucht. Das kann zum eigenen Beitrag der Arbeit werden.

## Von der Matrix zum Syntheseabsatz

Ein einfaches Muster macht aus einer Spalte einen Absatz: **allgemeine Aussage → stützende Studien → abweichende Studie → Deutung.**

Schwach (Quelle für Quelle): „Studie A fand einen Zusammenhang zwischen sozialen Medien und Aufschieben. Studie B zeigte, dass Benachrichtigungen ablenken. Studie C berichtete, dass Pausen länger wurden.“

Stark (Synthese): „Der Zusammenhang zwischen Social-Media-Nutzung und akademischem Aufschieben wurde über verschiedene Methoden hinweg übereinstimmend gezeigt: Korrelative Studien berichten einen mittleren Zusammenhang (Studie A), experimentelle Befunde eine längere Bearbeitungszeit durch Benachrichtigungen (Studie B) und qualitative Befunde, dass kurze Pausen in sozialen Medien länger werden (Studie C). Die kausale Evidenz beruht jedoch auf einem einzigen Experiment, und alle Studien wurden mit Bachelorstudierenden durchgeführt.“

Der zweite Absatz nutzt dieselben Quellen, liefert aber eine **Schlussfolgerung** und zeigt eine **Lücke**. Genau das ist die Aufgabe einer Literaturübersicht. Zum Unterschied zwischen theoretischem Rahmen und Literaturübersicht siehe unseren Leitfaden [theoretischer vs. konzeptioneller Rahmen](/de/blog/theoretischer-vs-konzeptioneller-rahmen).

## Häufige Fehler

- Die Matrix erst nach dem Lesen aus dem Gedächtnis füllen
- Nicht gelesene Informationen raten (z. B. Stichprobengröße aus dem Abstract)
- Zu viele Spalten anlegen und keine konsequent füllen
- Die Tabelle unverändert in die Literaturübersicht kopieren (sie ist ein Arbeitswerkzeug; erwartet wird Synthesetext, ggf. mit einer Übersichtstabelle)
- Die Spalte „Bezug zu meiner Arbeit“ leer lassen, sodass unklar bleibt, warum die Quelle in der Arbeit steht

## Mit welchem Werkzeug?

Excel, Google Tabellen oder eine Word-Tabelle genügen. Die Literaturangaben in einem Literaturverwaltungsprogramm zu führen, erleichtert die Arbeit: siehe unseren Leitfaden zu [Zotero und Mendeley](/de/blog/zotero-mendeley-literaturverwaltung).

## Literaturmatrix mit Academiana

Nachdem Sie Ihre Quellen einer Arbeit hinzugefügt haben, füllt die Schaltfläche „Literaturmatrix“ auf der Registerkarte „Quellen“ für jede Quelle Ziel, Methode, Stichprobe, Befunde und „Bezug zu unserer Arbeit“. Die Matrix wird **nur aus tatsächlich gelesenem Abstract oder Volltext** erstellt; Zeilen von Quellen mit bloßen Metadaten bleiben leer und werden so markiert, nie durch Raten gefüllt. Die Tabelle lässt sich als CSV für Excel herunterladen oder als Tabelle ins Dokument einfügen. Unter „Werkzeuge“ → „Literaturkarte“ sehen Sie außerdem Zitationsbeziehungen und Themencluster Ihrer Quellen. (Literaturmatrix und -karte sind im Pro-Paket enthalten.)`,
  },
};
