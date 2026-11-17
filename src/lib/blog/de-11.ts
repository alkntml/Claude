import type { BlogPostEn } from "./types";

/** D224: Deutsche versions, file 11 (statistics tests and meta-analysis). */
export const DE_11: Record<string, BlogPostEn> = {
  "shapiro-wilk-testi-nasil-yapilir-ve-yorumlanir": {
    slug: "shapiro-wilk-test-durchfuehren-und-interpretieren",
    title: "Shapiro-Wilk-Test auf Normalverteilung: Durchführen und Interpretieren",
    seoTitle: "Shapiro-Wilk-Test: Durchführung und Interpretation",
    description: "Was der Shapiro-Wilk-Test ist, wie man W und p liest und was bei kleinen und großen Stichproben gilt. Mit Rechenbeispiel und APA-7-Berichtssatz.",
    keywords: ["Shapiro-Wilk-Test", "Normalverteilung testen", "Shapiro Wilk p-Wert interpretieren", "Test auf Normalverteilung", "Shapiro-Wilk APA berichten", "Normalverteilungsannahme"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und wählen Sie „Werkzeuge“ → „Statistische Analyse“ → „Deskriptive Statistik und Normalverteilung“: Sie erhalten Shapiro-Wilk W und p je Variable, mit Schiefe und Kurtosis.", label: "Normalverteilung prüfen" },
    body: `Der Shapiro-Wilk-Test prüft, ob eine Variable **normalverteilt** ist. Parametrische Verfahren wie t-Test, ANOVA und Regression setzen Normalverteilung voraus; deshalb begegnet Ihnen dieser Test vor vielen Analysen. Die Prüfung über Schiefe und Kurtosis haben wir in unserem [Leitfaden zur Normalverteilung](/de/blog/normalverteilung-pruefen-schiefe-kurtosis) beschrieben; dieser Beitrag behandelt den Shapiro-Wilk-Test für sich.

Alle Zahlen in diesem Beitrag wurden aus den folgenden Beispieldaten mit der Statistik-Engine von Academiana berechnet; sie liefert dasselbe Ergebnis wie \`shapiro.test\` in R.

## Was prüft der Test?

- **Nullhypothese (H0):** Die Daten stammen aus einer normalverteilten Grundgesamtheit.
- **Die W-Statistik:** Sie liegt zwischen 0 und 1; je näher an 1, desto näher ist die Verteilung an der Normalverteilung.
- **Der p-Wert:** Bei p < .05 ist die Abweichung signifikant, die Annahme wird verworfen. Bei p ≥ .05 konnte keine Abweichung gezeigt werden.

> p ≥ .05 beweist nicht, dass die Daten „exakt normalverteilt“ sind; es besagt nur, dass in dieser Stichprobe keine Abweichung feststellbar war. Bei sehr kleinen Stichproben kann der Test selbst deutliche Abweichungen übersehen.

## Rechenbeispiel: zwei unterschiedliche Verteilungen

Wir haben zwei Variablen gleicher Größe (n = 12):

- **Variable N:** 4.1, 5.3, 4.8, 5.9, 5.1, 4.6, 5.5, 4.9, 5.2, 6.1, 4.4, 5
- **Variable S:** 1, 1, 2, 2, 2, 3, 3, 4, 5, 8, 12, 25

| Variable | n | Schiefe | W | p | Entscheidung |
| --- | --- | --- | --- | --- | --- |
| N | 12 | 0.20 | .985 | .997 | Keine Abweichung |
| S | 12 | 2.38 | .684 | < .001 | Signifikante Abweichung |

Bei **N** gilt W = .985 und p = .997: Die Normalverteilung bleibt bestehen. **S** ist wegen eines Extremwerts (25) rechtsschief; W = .684, p < .001, die Normalverteilung wird verworfen. Hier sollten Sie eine [nichtparametrische Alternative](/de/blog/nichtparametrische-tests-wilcoxon-friedman-dunn) oder eine Transformation erwägen.

## Wie wirkt sich der Stichprobenumfang aus?

- **Kleine Stichproben (n < 20):** Der Test hat wenig Power und kann Abweichungen übersehen. Betrachten Sie zusätzlich Histogramm und Q-Q-Plot.
- **Große Stichproben (n > 300):** Der Test ist sehr empfindlich und kann Bagatellabweichungen als „signifikant“ melden. Betrachten Sie Schiefe/Kurtosis und Diagramme gemeinsam.
- **Bereich:** Der Test funktioniert bei 3 bis 5000 Beobachtungen. Power-Vergleiche zeigten ihn bei kleinen und mittleren Stichproben als einen der stärksten Normalitätstests (Razali & Wah, 2011).

## Worauf wendet man ihn an?

- **Beim t-Test und bei der ANOVA** auf die Werte jeder Gruppe getrennt.
- **Beim t-Test für abhängige Stichproben** auf die **Differenzen** der beiden Messungen.
- **Bei der Regression** auf die **Residuen** (die Vorhersagefehler des Modells), nicht auf die Variablen.

## Berichten nach APA 7

„Der Shapiro-Wilk-Test zeigte für Variable N keine signifikante Abweichung von der Normalverteilung, W(12) = .985, p = .997; die Verteilung von Variable S wich signifikant von der Normalverteilung ab, W(12) = .684, p < .001. Für Variable S wurde daher ein nichtparametrischer Test verwendet.“

W wird kursiv gesetzt, der Stichprobenumfang steht in Klammern; vor W und p steht keine Null.

## Häufige Fehler

- **Alle Daten auf einmal testen:** Prüfen Sie bei Gruppenanalysen jede Gruppe einzeln.
- **p > .05 als „Normalverteilung bewiesen“ lesen.**
- **Allein nach dem Test entscheiden:** Bewerten Sie ihn gemeinsam mit Diagrammen und Schiefe/Kurtosis.
- **Die Analyse bei Abweichung aufgeben:** Bei großen, ausgewogenen Stichproben sind t-Test und ANOVA gegenüber leichten Abweichungen robust; begründen Sie Ihre Wahl trotzdem.

## In Academiana

Wenn Sie eine Datendatei in Ihr Projekt hochladen und unter „Werkzeuge“ → „Statistische Analyse“ die deskriptive Statistik wählen, erhält jede Variable Shapiro-Wilk W und p, zusammen mit Schiefe und Kurtosis. In Berichten zu t-Test und ANOVA wird das Shapiro-Wilk-Ergebnis je Gruppe als Anmerkung ergänzt. Die Zahlen erzeugt nicht die KI; die Statistik-Engine der Website berechnet sie aus Ihren Daten.`,
  },
  "tukey-hsd-games-howell-post-hoc-testleri": {
    slug: "tukey-hsd-und-games-howell-post-hoc-tests",
    title: "Tukey-HSD und Games-Howell: Welcher Post-hoc-Test nach der ANOVA?",
    seoTitle: "Tukey-HSD und Games-Howell: Post-hoc-Tests nach ANOVA",
    description: "Die ANOVA war signifikant, aber welche Gruppen unterscheiden sich? Unterschied zwischen Tukey-HSD und Games-Howell, Auswahl, Rechenbeispiel und APA-7-Bericht.",
    keywords: ["Tukey-HSD", "Games-Howell-Test", "welcher Post-hoc-Test", "Vergleiche nach ANOVA", "Tukey-Test interpretieren", "Post-hoc bei ungleichen Varianzen"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und wählen Sie „Werkzeuge“ → „Statistische Analyse“ → „Einfaktorielle Varianzanalyse (ANOVA)“: Tukey-HSD oder Games-Howell wird anhand des Levene-Tests automatisch gewählt.", label: "Meine ANOVA rechnen" },
    body: `Eine einfaktorielle ANOVA sagt nur „mindestens eine Gruppe unterscheidet sich“; **welche** Gruppen sich unterscheiden, sagt sie nicht. Dafür verwendet man nach der ANOVA **Post-hoc-Tests** (Mehrfachvergleiche). Zwei stehen im Vordergrund: **Tukey-HSD** bei gleichen Varianzen und **Games-Howell** bei ungleichen. Die ANOVA selbst haben wir in unserem [ANOVA-Leitfaden](/de/blog/einfaktorielle-anova-durchfuehren-und-berichten) erklärt.

Alle Zahlen in diesem Beitrag wurden aus den folgenden Beispieldaten mit der Statistik-Engine von Academiana berechnet; die Ergebnisse von Tukey und Games-Howell stimmen mit \`TukeyHSD\` und \`rstatix::games_howell_test\` in R überein.

## Warum braucht man einen Post-hoc-Test?

Würden Sie drei Gruppen mit drei t-Tests paarweise vergleichen, jeweils mit 5 % Fehlerrate, stiege die Gesamtwahrscheinlichkeit eines falsch-positiven Ergebnisses auf etwa 14 %. Post-hoc-Tests halten diese **familienweise Fehlerrate** bei 5 %.

## Welchen Test wählen?

| Situation | Test |
| --- | --- |
| Gleiche Varianzen (Levene p ≥ .05) | **Tukey-HSD** |
| Ungleiche Varianzen (Levene p < .05) | **Games-Howell** |
| Sehr unterschiedliche Gruppengrößen | Games-Howell ist sicherer |
| Vergleich nur mit einer Kontrollgruppe | Dunnett (statt Tukey) |

Tukey-HSD verwendet für alle Paare einen gemeinsamen (gepoolten) Fehlerterm und kann daher bei ungleichen Varianzen in die Irre führen. Games-Howell berechnet für jedes Paar eine eigene Varianz und eigene Freiheitsgrade (Welch-Ansatz).

## Beispiel 1: Gleiche Varianzen — Tukey-HSD

Prüfungsergebnisse von je acht Studierenden in drei Lehrmethoden:

- **A:** 62, 70, 75, 58, 68, 73, 66, 79
- **B:** 70, 66, 78, 74, 81, 69, 72, 85
- **C:** 75, 82, 71, 88, 79, 84, 69, 90

ANOVA: F(2, 21) = 4.78, p = .019. Der Levene-Test ergibt p = .830, die Varianzen sind also homogen; es wird Tukey-HSD verwendet.

| Vergleich | Mittelwertdifferenz | 95 %-KI | p (Tukey) |
| --- | --- | --- | --- |
| B – A | 5.50 | [-3.36, 14.36] | .283 |
| C – A | 10.88 | [2.01, 19.74] | .015 |
| C – B | 5.38 | [-3.49, 14.24] | .298 |

Nur die Differenz **C – A** ist signifikant (Differenz = 10.88, p = .015). B unterscheidet sich weder von A noch von C signifikant.

## Beispiel 2: Ungleiche Varianzen — Games-Howell

Drei Gruppen (je acht Personen): **D:** 50, 52, 51, 53, 50, 52, 51, 54; **E:** 48, 55, 61, 45, 66, 52, 70, 43; **F:** 57, 59, 58, 60, 58, 59, 61, 57.

Die Gruppen D und F sind sehr einheitlich, Gruppe E streut stark. Levene-Test: F(2, 21) = 14.75, p < .001; die Varianzen sind ungleich. Wir wenden beide Tests auf dieselben Daten an:

| Vergleich | Mittelwertdifferenz | p (Tukey) | p (Games-Howell) |
| --- | --- | --- | --- |
| E – D | 3.38 | .490 | .624 |
| F – D | 7.00 | .063 | < .001 |
| F – E | 3.63 | .441 | .584 |

Die Differenz **F – D** (7.00 Punkte) ist bei Games-Howell signifikant (p < .001), weil berücksichtigt wird, dass beide Gruppen sehr einheitlich sind; Tukey übersieht sie (p = .063), weil es die Varianz der streuenden Gruppe E auf alle Paare überträgt. Bei ungleichen Varianzen kann die falsche Testwahl das Ergebnis verändern.

## Berichten nach APA 7

**Für Tukey:** „Der Tukey-HSD-Test zeigte, dass Methode C signifikant höhere Werte erzielte als Methode A (Differenz = 10.88, 95 %-KI [2.01, 19.74], p = .015); die übrigen Paarvergleiche waren nicht signifikant.“

**Für Games-Howell:** „Da der Levene-Test ungleiche Varianzen anzeigte (p < .001), wurde für die Post-hoc-Vergleiche der Games-Howell-Test verwendet. Gruppe F unterschied sich signifikant von Gruppe D (Differenz = 7.00, p < .001).“

## Häufige Fehler

- **Tukey verwenden, ohne zuvor den Levene-Test anzusehen.**
- **Post-hoc-Tests bei nicht signifikanter ANOVA:** Ist das globale F nicht signifikant, gehen Sie nicht zu Paarvergleichen über (außer in Sonderfällen, in denen Games-Howell allein verwendet wird; begründen Sie das in der Methode).
- **Bonferroni stets für am sichersten halten:** Es ist konservativ; mit wachsender Gruppenzahl verlieren Sie Power.
- **Rohe p-Werte berichten:** Post-hoc-p-Werte müssen für Mehrfachvergleiche adjustiert sein.

## In Academiana

Im ANOVA-Bericht führt die Engine den Levene-Test aus; bei homogenen Varianzen ergänzt sie Tukey-HSD-Vergleiche, sonst Games-Howell-Vergleiche, mit 95 %-Konfidenzintervallen als Anmerkung. Die Zahlen erzeugt nicht die KI.`,
  },
  "fisher-kesin-testi-yates-duzeltmesi": {
    slug: "exakter-test-nach-fisher-und-yates-korrektur",
    title: "Exakter Test nach Fisher und Yates-Korrektur: Reicht Chi-Quadrat bei 2×2-Tafeln?",
    seoTitle: "Exakter Test nach Fisher und Yates-Korrektur bei 2×2",
    description: "Wann bei kleinen 2×2-Tafeln statt Chi-Quadrat der exakte Test nach Fisher gilt. Regel für erwartete Häufigkeiten, Yates-Korrektur, Beispiel und APA-7-Bericht.",
    keywords: ["exakter Test nach Fisher", "Yates-Korrektur", "2x2-Tafel Chi-Quadrat", "erwartete Häufigkeit 5", "wann Fisher-Test", "Chi-Quadrat kleine Stichprobe"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und führen Sie „Werkzeuge“ → „Statistische Analyse“ → „Chi-Quadrat-Unabhängigkeitstest“ aus: Bei 2×2-Tafeln werden Yates und Fisher automatisch berechnet; liegt eine erwartete Häufigkeit unter 5, gilt Fisher.", label: "Chi-Quadrat rechnen" },
    body: `Den Zusammenhang zweier kategorialer Variablen prüft man mit dem [Chi-Quadrat-Unabhängigkeitstest](/de/blog/chi-quadrat-unabhaengigkeitstest). Chi-Quadrat ist jedoch eine **Näherung** und versagt bei kleinen Stichproben. Bei 2×2-Tafeln greifen dann die **Yates-Korrektur** oder der **exakte Test nach Fisher**.

Alle Zahlen in diesem Beitrag wurden aus der folgenden Beispieltafel mit der Statistik-Engine von Academiana berechnet; die Ergebnisse für Fisher und Yates stimmen mit \`fisher.test\` und \`chisq.test\` in R überein.

## Wann ist Chi-Quadrat unzuverlässig?

Chi-Quadrat setzt ausreichend große erwartete Häufigkeiten voraus. Die übliche Regel: **keine Zelle darf eine erwartete Häufigkeit unter 5 haben** (SPSS und die meisten Lehrbücher sehen es als Problem, wenn mehr als 20 % der Zellen unter 5 liegen; bei einer 2×2-Tafel genügt eine einzige Zelle). Die erwartete Häufigkeit ist Zeilensumme × Spaltensumme ÷ Gesamtsumme.

## Drei Ansätze

| Test | Was er tut | Wann |
| --- | --- | --- |
| Pearson-Chi-Quadrat | Nähert die stetige Chi-Quadrat-Verteilung an | Erwartete Häufigkeiten ≥ 5 |
| Chi-Quadrat mit Yates-Korrektur | Zieht 0,5 von der Differenz beobachtet–erwartet ab | 2×2-Tafel, grenzwertige Stichprobe |
| **Exakter Test nach Fisher** | Berechnet die Wahrscheinlichkeit direkt (keine Näherung) | 2×2-Tafel, erwartete Häufigkeit < 5 |

## Rechenbeispiel

In einer Pilotstudie mit 20 Personen: zwei Gruppen (Intervention / Kontrolle) und ein Ergebnis (gebessert / nicht gebessert):

| Gruppe | Gebessert | Nicht gebessert | Gesamt |
| --- | --- | --- | --- |
| Kontrolle | 1 | 9 | 10 |
| Intervention | 7 | 3 | 10 |

Die erwarteten Häufigkeiten betragen 4, 6, 4 und 6: zwei Zellen liegen unter 5. Die drei Tests ergeben:

| Test | Statistik | p |
| --- | --- | --- |
| Pearson-Chi-Quadrat | χ²(1, N = 20) = 7.50 | .006 |
| Chi-Quadrat mit Yates-Korrektur | χ²(1, N = 20) = 5.21 | .022 |
| Exakter Test nach Fisher | — | .020 |

Alle drei sind signifikant, die p-Werte unterscheiden sich aber: Die Pearson-Näherung lässt p bei kleiner Stichprobe **kleiner erscheinen, als es ist** (.006); der exakte Wert beträgt .020. Nahe der Entscheidungsgrenze kann dieser Unterschied die Entscheidung ändern. Da eine erwartete Häufigkeit unter 5 liegt, ist hier der exakte Test nach Fisher zu berichten.

Aus der Tafel lässt sich auch das **Odds Ratio** berechnen (Stichproben-Odds-Ratio): Die Chance auf Besserung ist in der Interventionsgruppe etwa 21.0-mal so hoch wie in der Kontrollgruppe (Odds Ratio = 21.0; in Gegenrichtung 0.05).

## Berichten nach APA 7

„Da einige Zellen erwartete Häufigkeiten unter 5 aufwiesen, wurde der Zusammenhang zwischen Gruppe und Besserung mit dem exakten Test nach Fisher geprüft. Der Zusammenhang war signifikant, p = .020 (zweiseitig), N = 20; in der Kontrollgruppe besserten sich 1 von 10 Personen, in der Interventionsgruppe 7 von 10.“

Der Fisher-Test hat keine Chi-Quadrat-Statistik; berichtet werden nur p (und bei Bedarf das Odds Ratio).

## Häufige Fehler

- **Chi-Quadrat berichten, ohne die erwarteten Häufigkeiten zu prüfen.**
- **Die Yates-Korrektur automatisch bei jeder 2×2-Tafel anwenden:** Sie kann übermäßig konservativ sein; bei ausreichenden erwarteten Häufigkeiten empfehlen die meisten Quellen unkorrigiertes Chi-Quadrat.
- **Meinen, Fisher lasse sich bei größeren Tafeln nicht berechnen:** Es gibt eine erweiterte Variante (Freeman-Halton); meist ist das Zusammenfassen von Kategorien einfacher.
- **Einseitiges und zweiseitiges p verwechseln:** Berichten Sie das zweiseitige p, sofern Ihre Hypothese nicht gerichtet ist.

## In Academiana

Wählen Sie im „Chi-Quadrat-Unabhängigkeitstest“ eine 2×2-Tafel, werden Pearson-Chi-Quadrat, Chi-Quadrat mit Yates-Korrektur und der exakte Test nach Fisher gemeinsam berechnet. Liegt eine erwartete Häufigkeit unter 5, wird der Berichtssatz nach dem Fisher-Test formuliert. Die Zahlen erzeugt nicht die KI.`,
  },
  "parametrik-olmayan-testler-wilcoxon-friedman-dunn": {
    slug: "nichtparametrische-tests-wilcoxon-friedman-dunn",
    title: "Nichtparametrische Tests: Wilcoxon, Friedman und Dunn durchführen",
    seoTitle: "Wilcoxon-, Friedman- und Dunn-Test: Durchführung",
    description: "Was tun bei nicht normalverteilten Daten: t-Test für abhängige Stichproben, Messwiederholung und Post-hoc nach Kruskal-Wallis? Wilcoxon, Friedman, Dunn, APA 7.",
    keywords: ["Wilcoxon-Vorzeichen-Rang-Test", "Friedman-Test", "Dunn-Test", "nichtparametrische Tests", "Post-hoc nach Kruskal-Wallis", "nicht normalverteilte Daten analysieren"],
    cta: { text: "Laden Sie Ihre Datendatei hoch; unter „Werkzeuge“ → „Statistische Analyse“ erhalten Sie Wilcoxon-Vorzeichen-Rang-, Friedman- und Kruskal-Wallis-Test (mit Dunn-Vergleichen) im APA-Format.", label: "Meinen Test rechnen" },
    body: `Sind Ihre Daten nicht normalverteilt oder Ihre Messungen ordinal, verwendet man die **nichtparametrischen** Gegenstücke der parametrischen Tests (t-Test, ANOVA). Dieser Beitrag behandelt drei Tests gemeinsam: den **Wilcoxon-Vorzeichen-Rang-Test** für zwei verbundene Messungen, den **Friedman-Test** für drei oder mehr Messungen an denselben Personen und den **Dunn-Test** für Paarvergleiche nach Kruskal-Wallis bei unabhängigen Gruppen. Wie man die Normalverteilung prüft, haben wir in unserem [Shapiro-Wilk-Leitfaden](/de/blog/shapiro-wilk-test-durchfuehren-und-interpretieren) beschrieben.

Alle Zahlen in diesem Beitrag wurden aus den folgenden Beispieldaten mit der Statistik-Engine von Academiana berechnet; die Ergebnisse stimmen mit \`wilcox.test\`, \`friedman.test\` und \`rstatix::dunn_test\` in R überein.

## Welcher Test für welche Situation?

| Datenstruktur | Parametrisch | Nichtparametrisch |
| --- | --- | --- |
| 2 Messungen an denselben Personen | t-Test für abhängige Stichproben | **Wilcoxon-Vorzeichen-Rang** |
| 3+ Messungen an denselben Personen | ANOVA mit Messwiederholung | **Friedman** |
| 2 unabhängige Gruppen | t-Test für unabhängige Stichproben | Mann-Whitney-U |
| 3+ unabhängige Gruppen | Einfaktorielle ANOVA | Kruskal-Wallis (+ **Dunn**) |

Diese Tests vergleichen **Ränge**, nicht Mittelwerte; sie sind robust gegenüber Ausreißern, bei normalverteilten Daten aber etwas weniger trennscharf als parametrische Tests.

## 1. Wilcoxon-Vorzeichen-Rang-Test

Prä- und Post-Werte von zwölf Personen:

- **Prä:** 18, 22, 15, 27, 20, 24, 16, 29, 21, 19, 25, 17
- **Post:** 21, 26, 14, 32, 26, 26, 23, 37, 12, 29, 36, 29

Der Test bildet die Differenz jedes Paares (Prä – Post), **rangiert die Absolutbeträge** und summiert die Ränge der Paare, bei denen der Prä-Wert höher ist, also der Personen, die sich verschlechterten (V). Hier verschlechterten sich nur zwei Personen (Differenzen 1 und 9, Ränge 1 und 9); V = 10.0 ist daher klein, und je kleiner V, desto deutlicher der Unterschied zugunsten der Post-Messung.

| Messung | Median | V | z | p | r |
| --- | --- | --- | --- | --- | --- |
| Prä – Post | 20.5 / 26.0 | 10.0 | -2.27 | .021 | .66 |

Der Unterschied ist signifikant (p = .021, exakter p-Wert; bei n < 50 und ohne Bindungen ist keine Normalapproximation nötig). Die Effektstärke r = |z| / √n = .66 ist groß.

**APA 7:** „Ein Wilcoxon-Vorzeichen-Rang-Test zeigte, dass die Post-Werte (Mdn = 26.0) signifikant höher waren als die Prä-Werte (Mdn = 20.5), V = 10.0, z = -2.27, p = .021, r = .66.“

## 2. Friedman-Test

Zehn Personen wurden dreimal gemessen:

- **Messung 1:** 12, 15, 11, 14, 13, 16, 12, 15, 14, 13
- **Messung 2:** 14, 13, 13, 16, 15, 18, 14, 16, 12, 15
- **Messung 3:** 17, 18, 16, 15, 17, 20, 15, 19, 18, 17

Der Friedman-Test rangiert die Werte jeder Person innerhalb der Person und vergleicht die mittleren Ränge der Messungen: mittlere Ränge 1.2, 1.9, 2.9; χ²(2, N = 10) = 14.60, p < .001. **Kendalls W** = .73 zeigt die Übereinstimmung der Messungen (eine Effektstärke): 0 bedeutet keinen Unterschied, 1 eine völlig konsistente Rangfolge.

Nach einem signifikanten Friedman-Test zeigen Holm-adjustierte Wilcoxon-Vergleiche, welche Messungen sich unterscheiden:

| Vergleich | V | p | p (Holm) | r |
| --- | --- | --- | --- | --- |
| Messung 1 – Messung 2 | 12.0 | .096 | .096 | .54 |
| Messung 1 – Messung 3 | 0.0 | .005 | .016 | .90 |
| Messung 2 – Messung 3 | 1.5 | .009 | .018 | .84 |

Messung 1 und 3 sowie Messung 2 und 3 unterscheiden sich signifikant; Messung 1 und 2 nicht (nach Adjustierung).

**APA 7:** „Der Friedman-Test zeigte einen signifikanten Unterschied zwischen den Messungen, χ²(2, N = 10) = 14.60, p < .001, Kendalls W = .73. Nach Holm-adjustierten Wilcoxon-Vergleichen unterschied sich Messung 3 signifikant sowohl von Messung 1 (p = .016) als auch von Messung 2 (p = .018).“

## 3. Dunn-Test nach Kruskal-Wallis

Die Werte dreier unabhängiger Gruppen (je acht Personen) sind rechtsschief:

- **G1:** 3, 5, 4, 6, 2, 8, 4, 5
- **G2:** 6, 9, 7, 12, 8, 10, 7, 15
- **G3:** 11, 14, 9, 18, 13, 20, 12, 25

Kruskal-Wallis: H(2) = 16.68, p < .001, ε² = .73. Der Gesamtunterschied ist signifikant; der **Dunn-Test** zeigt, welche Paare sich unterscheiden. Dunn vergleicht die mittleren Ränge der Gruppen mit Bindungskorrektur; die p-Werte werden nach Holm adjustiert:

| Vergleich | z | p | p (Holm) |
| --- | --- | --- | --- |
| G1 – G2 | 2.30 | .021 | .043 |
| G1 – G3 | 4.07 | < .001 | < .001 |
| G2 – G3 | 1.77 | .077 | .077 |

G1 unterscheidet sich von G2 und von G3; G2 und G3 unterscheiden sich nicht signifikant.

**APA 7:** „Der Kruskal-Wallis-Test zeigte einen signifikanten Unterschied zwischen den Gruppen, H(2) = 16.68, p < .001. Nach Holm-adjustierten Dunn-Vergleichen unterschied sich G1 signifikant sowohl von G2 (z = 2.30, p = .043) als auch von G3 (z = 4.07, p < .001).“

## Häufige Fehler

- **Nichtparametrische Tests als „bequemen Ausweg“ sehen:** Bei normalverteilten Daten sind parametrische Tests trennschärfer; begründen Sie Ihre Wahl.
- **Nach Kruskal-Wallis unadjustierte Mann-Whitney-Tests verwenden:** Nutzen Sie Dunn (oder adjustierte Mann-Whitney-Tests).
- **Mittelwerte und Standardabweichungen berichten:** Bei diesen Tests berichtet man Mediane (bei Bedarf mit Interquartilsabstand).
- **Friedman auf unabhängige Gruppen anwenden:** Friedman ist für Messwiederholungen an denselben Personen gedacht.

## In Academiana

Die „Statistische Analyse“ enthält Wilcoxon-Vorzeichen-Rang-, Friedman- und Kruskal-Wallis-Test. Ist Friedman signifikant, werden Holm-adjustierte Wilcoxon-Vergleiche als Anmerkung im Bericht ergänzt; ist Kruskal-Wallis signifikant, Dunn-Vergleiche. Die Zahlen erzeugt nicht die KI.`,
  },
  "iki-yonlu-anova-nasil-yapilir-ve-yorumlanir": {
    slug: "zweifaktorielle-anova-durchfuehren-und-interpretieren",
    title: "Zweifaktorielle ANOVA: Haupteffekte, Interaktion und Interpretation (Rechenbeispiel)",
    seoTitle: "Zweifaktorielle ANOVA: Interaktion richtig interpretieren",
    description: "Zweifaktorielle ANOVA: Was sie ist, wie man Haupteffekte und Interaktion interpretiert, was Quadratsummen Typ III bedeuten. Mit Beispiel und APA 7.",
    keywords: ["zweifaktorielle ANOVA", "faktorielle ANOVA", "ANOVA Interaktionseffekt", "Haupteffekte interpretieren", "zweifaktorielle Varianzanalyse", "zweifaktorielle ANOVA APA"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und führen Sie „Werkzeuge“ → „Statistische Analyse“ → „Zweifaktorielle Varianzanalyse (ANOVA)“ aus: Haupteffekte, Interaktion, partielles Eta-Quadrat und Levene-Test im APA-Format.", label: "Zweifaktorielle ANOVA rechnen" },
    body: `Eine [einfaktorielle ANOVA](/de/blog/einfaktorielle-anova-durchfuehren-und-berichten) betrachtet den Effekt einer unabhängigen Variablen (eines Faktors). Eine **zweifaktorielle ANOVA** untersucht zwei Faktoren gemeinsam und beantwortet zusätzlich eine dritte Frage: **Verändert** sich der Effekt des einen Faktors mit der Stufe des anderen? Das nennt man **Interaktion**.

Alle Zahlen in diesem Beitrag wurden aus den folgenden Beispieldaten mit der Statistik-Engine von Academiana berechnet; die Ergebnisse stimmen mit \`car::Anova(type = 3)\` in R überein.

## Eine Analyse, drei Fragen

1. **Haupteffekt des ersten Faktors:** Unterscheiden sich die Stufen von A, wenn man den anderen Faktor ignoriert?
2. **Haupteffekt des zweiten Faktors:** Unterscheiden sich die Stufen von B?
3. **Interaktion (A × B):** Hängt der Effekt von A von der Stufe von B ab?

Ist die Interaktion signifikant, werden Haupteffekte nicht für sich interpretiert; zuerst wird die Interaktion beschrieben.

## Rechenbeispiel: Lehrmethode × Klassenstufe

Eine Forscherin vergleicht zwei Lehrmethoden (traditionell, projektbasiert) in drei Klassenstufen (9., 10., 11.). Jede Zelle enthält fünf Schülerinnen und Schüler (insgesamt 30). Prüfungswerte:

- **Traditionell, Klasse 9:** 62, 66, 60, 64, 68
- **Traditionell, Klasse 10:** 64, 68, 63, 70, 65
- **Traditionell, Klasse 11:** 66, 71, 65, 69, 72
- **Projektbasiert, Klasse 9:** 70, 74, 69, 73, 76
- **Projektbasiert, Klasse 10:** 78, 82, 77, 80, 84
- **Projektbasiert, Klasse 11:** 85, 88, 83, 90, 87

Zellmittelwerte (Standardabweichungen):

| Klasse | Traditionell | Projektbasiert | Differenz |
| --- | --- | --- | --- |
| 9. | 64.0 (3.2) | 72.4 (2.9) | 8.4 |
| 10. | 66.0 (2.9) | 80.2 (2.9) | 14.2 |
| 11. | 68.6 (3.0) | 86.6 (2.7) | 18.0 |

Die projektbasierte Methode erzielt in jeder Stufe höhere Werte, aber **der Abstand wächst**: 8.4 Punkte in Klasse 9, 14.2 in Klasse 10 und 18.0 in Klasse 11. Genau das ist eine Interaktion.

| Quelle | QS | df | MQS | F | p | ηp² |
| --- | --- | --- | --- | --- | --- | --- |
| Methode | 1373.63 | 1 | 1373.63 | 159.72 | < .001 | .87 |
| Klassenstufe | 442.07 | 2 | 221.03 | 25.70 | < .001 | .68 |
| Methode × Klassenstufe | 116.87 | 2 | 58.43 | 6.79 | .005 | .36 |
| Fehler | 206.40 | 24 | 8.60 | | | |

Levene-Test: F(5, 24) = 0.06, p = .998; die Varianzhomogenität ist gegeben.

## Wie interpretiert man das?

- **Der Haupteffekt der Methode** ist signifikant (F(1, 24) = 159.72, p < .001, ηp² = .87): Die projektbasierte Methode erzielt insgesamt höhere Werte.
- **Der Haupteffekt der Klassenstufe** ist signifikant (F(2, 24) = 25.70, p < .001, ηp² = .68): Die Werte steigen mit der Klassenstufe.
- **Die Interaktion** ist signifikant (F(2, 24) = 6.79, p = .005, ηp² = .36): Der Vorteil der Methode wächst in den höheren Klassen. Die Haupteffekte allein zu interpretieren, wäre daher irreführend; man muss sagen: „Der Methodenunterschied hängt von der Klassenstufe ab.“

Eine Interaktion zeigt man am klarsten mit einem **Zellmittelwert-Diagramm** (zwei Linien, Klassenstufe auf der X-Achse): Sind die Linien nicht parallel, liegt eine Interaktion vor. Nach einer signifikanten Interaktion betrachtet man **einfache Haupteffekte**: Die beiden Methoden werden in jeder Klassenstufe getrennt verglichen (t-Tests für unabhängige Stichproben, adjustiert).

## Was sind Quadratsummen vom Typ III?

Bei **gleichen** Zellbesetzungen (balanciertes Design, wie hier) liefern Typ I, II und III dasselbe Ergebnis. Bei ungleichen Besetzungen weichen die Ergebnisse voneinander ab. Der SPSS-Standard und die häufigste Wahl ist **Typ III**; Academiana verwendet Typ III und liefert dasselbe Ergebnis wie \`car::Anova(type = 3)\` in R.

## Voraussetzungen

- Die Beobachtungen sind voneinander unabhängig.
- In jeder Zelle ist die abhängige Variable annähernd normalverteilt (bei wenigen Beobachtungen je Zelle die Normalverteilung der Residuen prüfen).
- Die Zellvarianzen sind homogen (Levene).
- Jede Zelle enthält mindestens eine Beobachtung; bei nur einer Beobachtung lässt sich die Varianz der Zelle nicht berechnen.

## Berichten nach APA 7

„Die Effekte von Lehrmethode und Klassenstufe auf die Prüfungswerte wurden mit einer zweifaktoriellen ANOVA untersucht. Der Haupteffekt der Methode, F(1, 24) = 159.72, p < .001, ηp² = .87; der Haupteffekt der Klassenstufe, F(2, 24) = 25.70, p < .001, ηp² = .68; sowie die Interaktion Methode × Klassenstufe waren signifikant, F(2, 24) = 6.79, p = .005, ηp² = .36. Der Vorteil der projektbasierten Methode stieg von 8.4 Punkten in Klasse 9 auf 18.0 Punkte in Klasse 11.“

## Häufige Fehler

- **Die Interaktion überspringen und nur Haupteffekte berichten.**
- **Einen Haupteffekt als „Gesamtergebnis“ darstellen, obwohl die Interaktion signifikant ist.**
- **Bei ungleichen Zellen Quadratsummen vom Typ I (sequenziell) verwenden.**
- **Zwei Faktoren mit zwei getrennten einfaktoriellen ANOVAs untersuchen:** Die Interaktion bleibt verborgen, die Fehlerrate steigt.
- **Messwiederholungen wie unabhängige Gruppen analysieren:** Werden dieselben Personen erneut gemessen, ist eine [ANOVA mit Messwiederholung](/de/blog/anova-mit-messwiederholung-sphaerizitaet-mauchly) nötig.

## In Academiana

Wählen Sie unter „Statistische Analyse“ → „Zweifaktorielle Varianzanalyse (ANOVA)“ die abhängige Variable und die beiden Faktoren. Der Bericht enthält Zellmittelwerte, die ANOVA-Tabelle (Typ III), das partielle Eta-Quadrat und den Levene-Test und ergänzt einen Hinweis, wenn die Interaktion signifikant ist. Die Zahlen erzeugt nicht die KI.`,
  },
  "tekrarli-olcumler-anova-kuresellik-mauchly": {
    slug: "anova-mit-messwiederholung-sphaerizitaet-mauchly",
    title: "ANOVA mit Messwiederholung: Sphärizität, Mauchly und Greenhouse-Geisser",
    seoTitle: "ANOVA mit Messwiederholung: Mauchly, Greenhouse-Geisser",
    description: "Wie analysiert man drei oder mehr Messungen an denselben Personen? ANOVA mit Messwiederholung, Sphärizität, Mauchly-Test, Greenhouse-Geisser-Korrektur, APA 7.",
    keywords: ["ANOVA mit Messwiederholung", "Mauchly-Test Sphärizität", "Greenhouse-Geisser-Korrektur", "Sphärizitätsannahme", "Messwiederholung interpretieren", "Prä Post Follow-up Analyse"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und führen Sie „Werkzeuge“ → „Statistische Analyse“ → „ANOVA mit Messwiederholung“ aus: Mauchly, Greenhouse-Geisser, partielles Eta-Quadrat und Holm-adjustierte Vergleiche im APA-Format.", label: "Meine Messwiederholung analysieren" },
    body: `Messen Sie dieselben Personen dreimal oder öfter (Prä-, Post-, Follow-up-Messung), ist die [einfaktorielle ANOVA](/de/blog/einfaktorielle-anova-durchfuehren-und-berichten) für unabhängige Gruppen nicht geeignet, weil die Messungen nicht unabhängig sind. Das richtige Verfahren ist die **ANOVA mit Messwiederholung** (Within-Subjects-ANOVA). Für zwei Messungen genügt ein [t-Test für abhängige Stichproben](/de/blog/t-test-durchfuehren-und-interpretieren).

Alle Zahlen in diesem Beitrag wurden aus den folgenden Beispieldaten mit der Statistik-Engine von Academiana berechnet; die Ergebnisse für Mauchly, Greenhouse-Geisser und Huynh-Feldt stimmen mit \`rstatix::anova_test\` in R überein.

## Warum eine eigene ANOVA?

Die Werte derselben Person sind über die Messungen hinweg korreliert. Die ANOVA mit Messwiederholung trennt die Unterschiede zwischen Personen (wer insgesamt hoch punktet) vom Fehlerterm ab und ist daher **trennschärfer**, als dieselben Daten als unabhängige Gruppen zu analysieren.

## Die Sphärizitätsannahme

Die kennzeichnende Annahme dieser Analyse ist die **Sphärizität**: Die Varianzen der Differenzen zwischen allen Messungspaaren müssen gleich sein. Wird sie verletzt, wird der F-Test **zu liberal** (der Fehler 1. Art steigt). Die Sphärizität prüft der **Mauchly-Test**:

- **p ≥ .05:** Die Sphärizität ist gegeben; berichten Sie die unkorrigierten Ergebnisse.
- **p < .05:** Die Sphärizität ist verletzt; korrigieren Sie die Freiheitsgrade durch Multiplikation mit ε (Epsilon): **Greenhouse-Geisser** (konservativ, bei kleinem ε) oder **Huynh-Feldt** (bei hohem ε). Übliche Regel: Greenhouse-Geisser, wenn ε < .75.
- Bei zwei Messungen ist die Sphärizität automatisch gegeben; der Mauchly-Test entfällt.

## Rechenbeispiel

Werte von zehn Personen zu drei Zeitpunkten (zum Beispiel vor, während und nach einer Intervention):

- **Messung 1:** 22, 19, 25, 21, 24, 20, 23, 18, 26, 22
- **Messung 2:** 25, 24, 26, 27, 25, 26, 28, 23, 27, 26
- **Messung 3:** 29, 26, 33, 28, 31, 27, 32, 26, 34, 30

| Messung | M | SD |
| --- | --- | --- |
| Messung 1 | 22.00 | 2.58 |
| Messung 2 | 25.70 | 1.49 |
| Messung 3 | 29.60 | 2.88 |

**Mauchly-Test:** W = .261, χ²(2) = 10.74, p = .005. Die Sphärizität ist verletzt; Greenhouse-Geisser ε = .575 (Huynh-Feldt ε = .605). Da ε klein ist (< .75), wird das Greenhouse-Geisser-korrigierte Ergebnis berichtet:

| Quelle | QS | df (korrigiert) | F | p | ηp² |
| --- | --- | --- | --- | --- | --- |
| Messung | 288.87 | 1.15 | 89.24 | < .001 | .91 |
| Fehler | 29.13 | 10.35 | | | |

Der Unterschied zwischen den Messungen ist signifikant. Die unkorrigierten df waren (2, 18); die Korrektur senkte sie auf 1.15 und 10.35. F ändert sich nicht, nur der p-Wert wird konservativer.

## Welche Messungen unterscheiden sich? Paarvergleiche

| Vergleich | Mittelwertdifferenz | t | df | p | p (Holm) |
| --- | --- | --- | --- | --- | --- |
| Messung 1 – Messung 2 | -3.70 | -5.69 | 9 | < .001 | < .001 |
| Messung 1 – Messung 3 | -7.60 | -34.37 | 9 | < .001 | < .001 |
| Messung 2 – Messung 3 | -3.90 | -5.52 | 9 | < .001 | < .001 |

Jede Messung ist signifikant höher als die vorherige; über die drei Vergleiche wurde nach Holm adjustiert.

## Berichten nach APA 7

„Der Mauchly-Test auf Sphärizität zeigte, dass die Sphärizität verletzt war, χ²(2) = 10.74, p = .005; daher wurde die Greenhouse-Geisser-Korrektur angewendet (ε = .575). Die Werte veränderten sich über die Zeit signifikant, F(1.15, 10.35) = 89.24, p < .001, ηp² = .91. Holm-adjustierte t-Tests für abhängige Stichproben zeigten, dass jede Messung signifikant höher war als die vorherige (alle p < .001 oder kleiner).“

## Häufige Fehler

- **Den Mauchly-Test überspringen und das unkorrigierte F berichten.**
- **Drei Messungen mit paarweisen t-Tests ohne Adjustierung vergleichen.**
- **Personen mit fehlenden Daten stillschweigend löschen:** Die ANOVA mit Messwiederholung nutzt Personen mit vollständigen Daten in jeder Messung; nennen Sie, wie viele ausgeschlossen wurden.
- **Eine ANOVA mit Messwiederholung bei nicht normalverteilten Daten erzwingen:** Der [Friedman-Test](/de/blog/nichtparametrische-tests-wilcoxon-friedman-dunn) ist die nichtparametrische Alternative.
- **Ein gemischtes Design (Gruppe und Zeit) mit einer einfaktoriellen Messwiederholung analysieren:** Für die Interaktion Gruppe × Zeit braucht man eine gemischte ANOVA.

## In Academiana

Wählen Sie unter „Statistische Analyse“ → „ANOVA mit Messwiederholung“ die Messungen der Reihe nach. Der Bericht enthält den Mauchly-Test, die ε-Werte nach Greenhouse-Geisser und Huynh-Feldt, die korrigierte ANOVA-Tabelle und die Holm-adjustierten Paarvergleiche; bei verletzter Sphärizität wird das Greenhouse-Geisser-korrigierte, sonst das unkorrigierte Ergebnis berichtet. Die Zahlen erzeugt nicht die KI.`,
  },
  "lojistik-regresyon-nasil-yapilir-ve-raporlanir": {
    slug: "logistische-regression-durchfuehren-und-berichten",
    title: "Logistische Regression: Durchführen und das Odds Ratio interpretieren",
    seoTitle: "Logistische Regression: Odds Ratio und Berichten",
    description: "Logistische Regression bei zwei Kategorien (bestanden–nicht bestanden): Odds Ratio, Nagelkerkes R², Klassifikation, Rechenbeispiel, APA 7.",
    keywords: ["logistische Regression", "Odds Ratio interpretieren", "binäre logistische Regression", "Nagelkerkes R-Quadrat", "logistische Regression APA", "logistische Regression Beispiel"],
    cta: { text: "Laden Sie Ihre Datendatei hoch und führen Sie „Werkzeuge“ → „Statistische Analyse“ → „Binäre logistische Regression“ aus: Koeffizienten, Odds Ratios mit Konfidenzintervallen, Modell-χ², Nagelkerkes R² und Klassifikation im APA-Format.", label: "Logistische Regression rechnen" },
    body: `Die [lineare Regression](/de/blog/regressionsanalyse-nach-apa-7-berichten) sagt ein stetiges Ergebnis vorher. Hat Ihr Ergebnis **zwei Kategorien** (bestanden–nicht bestanden, Erkrankung vorhanden–nicht vorhanden, ja–nein), ist die lineare Regression ungeeignet; man verwendet die **binäre logistische Regression**. Die Prädiktoren können numerisch sein.

Alle Zahlen in diesem Beitrag wurden aus den folgenden Beispieldaten mit der Statistik-Engine von Academiana berechnet; Koeffizienten, Standardfehler, Devianzen und Nagelkerkes R² stimmen mit \`glm(family = binomial)\` in R überein.

## Was sagt die logistische Regression vorher?

Das Modell sagt nicht die **Wahrscheinlichkeit** des Ereignisses (z. B. „bestanden“) vorher, sondern dessen **Log-Odds** mit einer linearen Gleichung: ln(p / (1 − p)) = b₀ + b₁X. Zur Interpretation potenziert man den Koeffizienten: das **Odds Ratio** (OR) = e^b.

- **OR > 1:** Die Odds des Ereignisses steigen mit dem Prädiktor.
- **OR < 1:** Die Odds des Ereignisses sinken mit dem Prädiktor.
- **OR = 1:** Kein Effekt. Enthält das Konfidenzintervall die 1, ist der Effekt nicht signifikant.

## Rechenbeispiel: Lernstunden und Bestehen einer Prüfung

Wöchentliche Lernstunden von 24 Studierenden und ob sie bestanden haben (1 = bestanden, 0 = nicht bestanden):

- **Stunden:** 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 12, 13, 14, 15
- **Ergebnis:** 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1

13 Studierende haben bestanden (11 nicht).

| Prädiktor | B | SE | Wald z | p | OR | OR 95 %-KI |
| --- | --- | --- | --- | --- | --- | --- |
| (Konstante) | -2.92 | 1.31 | -2.23 | .026 | | |
| Lernstunden | 0.45 | 0.18 | 2.45 | .014 | 1.57 | [1.09, 2.24] |

**Modell:** χ²(1, N = 24) = 10.18, p = .001; Nagelkerkes R² = .46.

## Wie interpretiert man das?

- **Odds Ratio:** Eine Lernstunde mehr pro Woche multipliziert die Odds des Bestehens mit etwa 1.57, erhöht sie also um etwa 57 % (OR = 1.57, 95 %-KI [1.09, 2.24]). Das Intervall schließt 1 aus, der Effekt ist also signifikant.
- **Umrechnung in Wahrscheinlichkeiten:** Die vorhergesagte Wahrscheinlichkeit zu bestehen beträgt laut Gleichung 12 % bei 2 Stunden, 66 % bei 8 Stunden und 97 % bei 14 Stunden.
- **Modellgüte:** Das Modell ist signifikant besser als das Modell nur mit Konstante (χ²-Test). **Nagelkerkes R²** = .46 ähnelt der „erklärten Varianz“, sollte aber nicht wie das R² der linearen Regression gelesen werden; Cox & Snell R² = .35, McFadden R² = .31.
- **Klassifikation:** Mit der Schwelle .50 werden 75.0 % der Studierenden richtig klassifiziert; die Sensitivität (tatsächlich Bestandene finden) beträgt 76.9 %, die Spezifität (tatsächlich Durchgefallene finden) 72.7 %. Die Fläche unter der ROC-Kurve (AUC) = .85: Die Chance, dass eine zufällig gewählte bestandene Person eine höhere vorhergesagte Wahrscheinlichkeit erhält als eine durchgefallene, beträgt etwa 85 %.

## Wie viele Beobachtungen braucht man?

Die übliche Regel lautet: **mindestens 10 Ereignisse pro Prädiktor** in der selteneren Kategorie (Peduzzi et al., 1996). Hier hat die seltenere Kategorie 11 Beobachtungen bei 1 Prädiktor; die Regel ist erfüllt. Viele Prädiktoren bei kleiner Stichprobe machen die Schätzungen instabil.

## Voraussetzungen und Probleme

- Das Ergebnis hat genau zwei Kategorien, die Beobachtungen sind unabhängig.
- Zwischen den Prädiktoren sollte keine starke Multikollinearität bestehen.
- **Vollständige Separation:** Trennt ein Prädiktor das Ergebnis perfekt (z. B. alle Bestandenen lernten mehr als 5 Stunden, alle Durchgefallenen weniger), laufen die Schätzungen gegen unendlich, und das Modell lässt sich nicht anpassen. Academiana gibt in diesem Fall einen verständlichen Hinweis.
- Ein stetiger Prädiktor soll linear mit den Log-Odds zusammenhängen.

## Berichten nach APA 7

„Eine binäre logistische Regression prüfte, ob die wöchentlichen Lernstunden die Wahrscheinlichkeit des Bestehens der Prüfung vorhersagen. Das Modell war signifikant, χ²(1, N = 24) = 10.18, p = .001, Nagelkerkes R² = .46. Die Lernstunden waren ein signifikanter Prädiktor, B = 0.45, SE = 0.18, Wald z = 2.45, p = .014, OR = 1.57, 95 %-KI [1.09, 2.24]: Eine Lernstunde mehr pro Woche erhöhte die Odds des Bestehens um etwa 57 %. Das Modell klassifizierte 75.0 % der Studierenden richtig (AUC = .85).“

## Häufige Fehler

- **Das Odds Ratio als Wahrscheinlichkeit oder Risikoverhältnis lesen:** OR = 1.57 heißt nicht „die Wahrscheinlichkeit steigt auf das 1.57-Fache“.
- **Lineare Regression auf ein Ergebnis mit zwei Kategorien anwenden:** Wahrscheinlichkeiten liegen außerhalb von 0–1, Annahmen brechen.
- **Viele Prädiktoren bei sehr wenigen Ereignissen verwenden.**
- **R² und Klassifikationsrate allein als Erfolgsmaß sehen:** Bei unausgewogenen Kategorien kann hohe Genauigkeit täuschen; betrachten Sie auch Sensitivität und Spezifität.
- **Vollständige Separation übersehen:** Ein riesiger Koeffizient und Standardfehler sind Warnzeichen.

## In Academiana

Wählen Sie unter „Statistische Analyse“ → „Binäre logistische Regression“ die abhängige Variable (zwei Kategorien) und numerische Prädiktoren. Der Bericht enthält Koeffizienten, Wald-Tests, Odds Ratios mit 95 %-Konfidenzintervallen, das Modell-χ², Nagelkerkes/Cox-&-Snell-/McFaddens R² und die Klassifikationsgüte (Sensitivität, Spezifität, AUC). Die Zahlen erzeugt nicht die KI.`,
  },
  "meta-analiz-nasil-yapilir-birlesik-etki-i2": {
    slug: "metaanalyse-durchfuehren-gepoolter-effekt-i2",
    title: "Metaanalyse durchführen: gepoolter Effekt, I² und Publikationsbias",
    seoTitle: "Metaanalyse durchführen: gepoolter Effekt und I²",
    description: "Wie Studien in einer Metaanalyse zusammengeführt werden: Hedges g, Fixed-/Random-Effects, I², Forest- und Funnel-Plot, Egger-Test, Rechenbeispiel.",
    keywords: ["Metaanalyse durchführen", "I-Quadrat Heterogenität", "Random-Effects-Modell", "Forest-Plot", "Funnel-Plot Egger-Test", "gepoolte Effektstärke"],
    cta: { text: "Öffnen Sie im Assistenten für systematische Reviews den Tab „7. Metaanalyse“ und tragen Sie n, Mittelwert und SD jeder Studie ein: gepoolter Effekt, I², Forest- und Funnel-Plot sowie der Methodentext liegen vor.", label: "Metaanalyse rechnen" },
    body: `Eine Metaanalyse ist das statistische Verfahren, das die Ergebnisse mehrerer Studien zur selben Frage in **einem gepoolten Effekt** zusammenfasst. Sie ist der Syntheseschritt eines [systematischen Reviews](/de/blog/systematisches-review-metaanalyse-prisma-2020); jede Metaanalyse sollte auf einem systematischen Review beruhen, aber nicht jedes systematische Review enthält eine Metaanalyse.

Alle Zahlen in diesem Beitrag wurden aus den folgenden Beispielstudien mit der Engine von Academiana berechnet und mit dem R-Paket \`metafor\` abgeglichen. Die Studien sind für diesen Beitrag erfundene Beispieldaten und stehen nicht für reale Literatur.

## Schritt 1: Aus jeder Studie eine Effektstärke gewinnen

Um Studien auf derselben Skala zu vergleichen, braucht man ein gemeinsames Effektmaß:

- **Mittelwerte zweier Gruppen:** Hedges g (die um kleine Stichproben korrigierte standardisierte Mittelwertdifferenz), eine korrigierte Form von Cohens d.
- **Korrelation:** r, gepoolt nach Fishers z-Transformation.
- **Binäres Ergebnis:** Das Odds Ratio, gepoolt auf dem Logarithmus.

## Schritt 2: Die Studien gewichten

Eine genauere Studie (kleinere Varianz, meist größere Stichprobe) erhält mehr Gewicht. Das **Fixed-Effect-Modell** nimmt an, dass alle Studien denselben wahren Effekt schätzen. Das **Random-Effects-Modell** (DerSimonian & Laird, 1986) lässt den wahren Effekt zwischen den Studien variieren und addiert die Varianz zwischen den Studien (τ²) zu den Gewichten. Unterscheiden sich die Studien in Methoden, Stichproben und Kontext, ist Random-Effects meist realistischer.

## Rechenbeispiel: 6 Studien, 447 Teilnehmende

Sechs Studien zur Wirkung einer Intervention auf einen Ergebniswert (Interventionsgruppe / Kontrollgruppe):

| Studie | n (Intervention / Kontrolle) | Hedges g | 95 %-KI | Gewicht (%) |
| --- | --- | --- | --- | --- |
| S1 | 30 / 30 | 0.73 | [0.21, 1.25] | 14.3 |
| S2 | 45 / 44 | 0.14 | [-0.28, 0.55] | 19.7 |
| S3 | 28 / 27 | 0.50 | [-0.04, 1.03] | 13.8 |
| S4 | 60 / 61 | 0.64 | [0.28, 1.01] | 23.1 |
| S5 | 22 / 22 | 0.77 | [0.16, 1.39] | 11.2 |
| S6 | 38 / 40 | 0.15 | [-0.29, 0.60] | 18.0 |

**Gepoolter Effekt (Random-Effects):** g = 0.46, 95 %-KI [0.23, 0.69], z = 3.95, p < .001. Mit dem Fixed-Effect-Modell g = 0.46, 95 %-KI [0.27, 0.64].

## Schritt 3: Heterogenität beurteilen

Unterscheiden sich die Studien zufällig oder tatsächlich?

- **Q-Test:** Q(5) = 7.17, p = .209. Nicht signifikant; Q hat aber bei wenigen Studien geringe Power und ist allein kein Beleg für „keine Heterogenität“.
- **I²:** Der Anteil der Gesamtvariabilität, der auf echten Unterschieden statt auf Zufall beruht: I² = 30.2 %. Higgins und Thompson (2002) nennen etwa 25 % gering, 50 % mittel, 75 % hoch; hier gering bis mittel.
- **τ²** = 0.025 (Varianz zwischen den Studien), τ = 0.16.

Bei hohem I² kann eine einzelne gepoolte Zahl irreführen; suchen Sie die Ursache (Altersgruppe, Interventionsdauer, Instrument) mit Subgruppenanalyse oder Metaregression.

## Schritt 4: Mit Grafiken darstellen

- **Forest-Plot:** Effekt und Konfidenzintervall jeder Studie sind eine Linie; die Quadratgröße zeigt das Gewicht; unten steht der gepoolte Effekt als Raute. Kreuzen Linie und Raute die Nulllinie nicht, ist der Effekt signifikant.
- **Funnel-Plot:** Effekt (horizontal) gegen Präzision (vertikal). Ohne Verzerrung bilden die Punkte einen symmetrischen Trichter um den gepoolten Effekt.

## Schritt 5: Publikationsbias prüfen

Signifikante Ergebnisse werden leichter veröffentlicht, daher können kleine Studien ohne Effekt fehlen. Der **Egger-Regressionstest** prüft die Asymmetrie des Funnel-Plots: Achsenabschnitt t(4) = 0.64, p = .555. Es gibt keine signifikante Asymmetrie. Bei **weniger als 10 Studien** ist der Test jedoch unzuverlässig; hier ist k = 6, das Ergebnis ist also nur informativ und mit Vorsicht zu lesen.

## Berichten nach APA 7

„Sechs Studien (N = 447) wurden mit einem Random-Effects-Modell nach DerSimonian und Laird gepoolt. Der gepoolte Effekt war klein bis mittel und signifikant, g = 0.46, 95 %-KI [0.23, 0.69], p < .001. Die Heterogenität zwischen den Studien war gering bis mittel, Q(5) = 7.17, p = .209, I² = 30.2 %, τ² = 0.025. Der Egger-Test zeigte keine signifikante Funnel-Asymmetrie, p = .555 (k = 6; der Test hat geringe Power).“

## Häufige Fehler

- **Studien ungewichtet mitteln:** Eine kleine Studie zählt so viel wie eine große.
- **Das Modell nach Sicht der Ergebnisse wählen:** Die Entscheidung für Fixed- oder Random-Effects gehört vorab in die Methoden.
- **Heterogenität ignorieren, weil Q nicht signifikant ist.**
- **Unähnliche Studien poolen:** Äpfel und Birnen werden durch einen gepoolten Effekt nicht gleich.
- **Dem Egger-Test bei wenigen Studien vertrauen.**
- **Zahlen inkonsistent zum PRISMA-Flussdiagramm lassen:** Die Zahl der Studien in der Metaanalyse muss mit dem Flussdiagramm übereinstimmen.

## In Academiana

Öffnen Sie im Assistenten für systematische Reviews den Tab **„7. Metaanalyse“**. Wählen Sie das Effektmaß (Mittelwerte zweier Gruppen, Korrelation, Odds Ratio oder fertiger Effekt mit Standardfehler) und das Modell (Random oder Fixed) und tragen Sie die Werte der Studien ein. Berechnet werden gepoolter Effekt, Q, I², τ², Egger-Test, Forest- und Funnel-Plot sowie der Methoden- und Ergebnistext; die Synthese-Punkte der PRISMA-2020-Checkliste werden entsprechend abgehakt. Die Zahlen erzeugt nicht die KI; Sie tragen die Werte ein.`,
  },
};
