import type { BlogPostEn } from "./types";

/** Almanca sürümler, 7. dosya (D164) */
export const DE_7: Record<string, BlogPostEn> = {
  "t-testi-nasil-yapilir-ve-yorumlanir": {
    slug: "t-test-durchfuehren-und-interpretieren",
    title: "t-Test durchführen und interpretieren: unabhängige und verbundene Stichproben",
    seoTitle: "t-Test durchführen, interpretieren und nach APA berichten",
    description: "t-Test für unabhängige und verbundene Stichproben: Auswahl, Levene und Welch, Effektstärke, Konfidenzintervall und APA-7-Bericht mit Rechenbeispiel.",
    keywords: ["t-Test durchführen", "t-Test unabhängige Stichproben interpretieren", "t-Test verbundene Stichproben", "t-Test APA berichten", "Welch-Test", "Cohens d"],
    cta: { text: "Laden Sie Ihre Datendatei in Ihre Arbeit hoch und führen Sie den t-Test unter „Werkzeuge“ → „Statistische Analyse“ aus; Sie erhalten einen APA-Bericht mit Levene-Test und Effektstärke.", label: "Analyse starten" },
    body: `Der t-Test ist der gebräuchlichste parametrische Test, um zu prüfen, ob sich zwei Mittelwerte signifikant unterscheiden. In Abschlussarbeiten kommen vor allem zwei Varianten vor: der **t-Test für unabhängige Stichproben** (zwei getrennte Gruppen) und der **t-Test für verbundene Stichproben** (zwei Messungen derselben Personen). Dieser Leitfaden geht beide Schritt für Schritt durch und deutet jede Zahl.

Alle Zahlen in diesem Artikel wurden mit der Statistik-Engine von Academiana aus den unten angegebenen Beispieldaten berechnet; Sie können die Daten in Ihr eigenes Programm eingeben und erhalten dieselben Ergebnisse.

## Welchen t-Test wähle ich?

- **t-Test für unabhängige Stichproben:** vergleicht die Mittelwerte zweier verschiedener Gruppen. Beispiel: Prüfungsergebnisse einer Experimental- und einer Kontrollgruppe.
- **t-Test für verbundene (abhängige) Stichproben:** vergleicht zwei Messungen derselben Teilnehmenden. Beispiel: Werte vor und nach einem Training.
- **Einstichproben-t-Test:** vergleicht einen Gruppenmittelwert mit einem bekannten Wert (z. B. dem Skalenmittelpunkt).

Bei drei oder mehr Gruppen verwenden Sie stattdessen eine einfaktorielle ANOVA. Einen Überblick gibt unser [Leitfaden zur Wahl des statistischen Tests](/de/blog/welcher-statistische-test).

## Voraussetzungen

1. **Die abhängige Variable ist metrisch** (Punktwerte, Zeiten, Skalensummen).
2. **Die Beobachtungen sind unabhängig:** Der Wert einer Person beeinflusst nicht den einer anderen.
3. **Normalverteilung:** Beim unabhängigen Test sollte jede Gruppe, beim verbundenen Test die Differenzwerte annähernd normalverteilt sein. Siehe unseren [Leitfaden zum Normalverteilungstest](/de/blog/normalverteilung-pruefen-schiefe-kurtosis).
4. **Varianzhomogenität** (nur beim unabhängigen Test): wird mit dem Levene-Test geprüft.

## Rechenbeispiel 1: t-Test für unabhängige Stichproben

Eine Studie untersucht die Wirkung einer Lehrmethode auf die Prüfungsleistung. Die beiden Gruppen erzielten:

- **Experimentalgruppe (n = 12):** 72, 85, 78, 90, 66, 81, 77, 88, 74, 83, 79, 86
- **Kontrollgruppe (n = 12):** 68, 74, 70, 79, 62, 71, 73, 76, 65, 72, 69, 75

### 1. Deskriptive Statistik

Experimentalgruppe M = 79.92 (SD = 7.04), Kontrollgruppe M = 71.17 (SD = 4.76). Die Rohdifferenz beträgt 8.75 Punkte.

### 2. Levene-Test: Welche Zeile lese ich?

Der Levene-Test ergab F(1, 22) = 1.87, p = .185. Da p über .05 liegt, wird die Varianzgleichheit nicht verworfen, und Sie lesen die **Zeile mit gleichen Varianzen (Student)**. Wäre der Levene-Test signifikant (p < .05), läsen Sie die **Welch-Zeile**. Hier liefern beide Zeilen fast dasselbe: Student t(22) = 3.57, p = .002; Welch t(19.33) = 3.57, p = .002.

> Manche Methodiker empfehlen, standardmäßig den Welch-Test zu verwenden, weil er bei gleichen Varianzen ähnlich wie der Student-Test abschneidet und bei ungleichen Varianzen zuverlässiger ist. Geben Sie im Methodenteil an, welchen Test Sie verwendet haben.

### 3. Signifikanz, Konfidenzintervall und Effektstärke

- **t(22) = 3.57, p = .002:** Der Unterschied ist statistisch signifikant.
- **95-%-KI der Differenz [3.66, 13.84]:** Das Intervall schließt null aus; die wahre Differenz liegt wahrscheinlich zwischen 3.7 und 13.8 Punkten.
- **Cohens d = 1.46:** Nach Cohens (1988) groben Richtwerten (0.2 klein, 0.5 mittel, 0.8 groß) ein großer Effekt.

Der p-Wert sagt nur, ob der Unterschied durch Zufall erklärbar ist; wie groß er ist, zeigen Effektstärke und Konfidenzintervall. Deshalb verlangt APA 7 beides.

### 4. Bericht nach APA 7

„Die Prüfungsergebnisse der Experimentalgruppe (M = 79.92, SD = 7.04) waren signifikant höher als die der Kontrollgruppe (M = 71.17, SD = 4.76), t(22) = 3.57, p = .002, d = 1.46, 95-%-KI [3.66, 13.84].“

Im APA-Stil werden statistische Symbole (M, SD, t, p, d) kursiv gesetzt; p erhält keine führende Null (.002), und Werte unter .001 werden als „p < .001“ berichtet.

## Rechenbeispiel 2: t-Test für verbundene Stichproben

Werte von zehn Teilnehmenden vor und nach einem Trainingsprogramm:

- **Prätest:** 12, 15, 11, 14, 10, 13, 16, 12, 14, 11
- **Posttest:** 14, 18, 13, 15, 13, 15, 19, 14, 17, 12

Prätest M = 12.80 (SD = 1.93), Posttest M = 15.00 (SD = 2.31). Mittlere Differenz −2.20 (SD = 0.79). Ergebnis: **t(9) = −8.82, p < .001**, 95-%-KI der Differenz [−2.76, −1.64], Effektstärke **dz = 2.79**. Die beiden Messungen korrelieren mit r = .95.

Das negative t spiegelt nur die Reihenfolge der Subtraktion (Prä − Post) wider; deuten Sie die Mittelwerte: Die Posttestwerte sind höher.

Berichtsbeispiel: „Die Posttestwerte (M = 15.00, SD = 2.31) waren signifikant höher als die Prätestwerte (M = 12.80, SD = 1.93), t(9) = −8.82, p < .001, dz = 2.79.“

> Beim verbundenen Test beruht die Effektstärke auf der Standardabweichung der Differenzen (dz). Sind die beiden Messungen stark korreliert, kann dz deutlich größer sein als d für unabhängige Gruppen; geben Sie an, welche Größe Sie berichten.

## Häufige Fehler

- Einen **unabhängigen** t-Test auf zwei Messungen derselben Personen anwenden
- Eine beliebige Zeile lesen, ohne den Levene-Test zu prüfen
- Nur p berichten und Effektstärke sowie Konfidenzintervall weglassen
- „p = .000“ schreiben (richtig: p < .001)
- Bei kleinen, nicht normalverteilten Stichproben die nichtparametrische Alternative (Mann-Whitney-U oder Wilcoxon) übersehen
- Die nötige Stichprobengröße nicht vorab berechnen: siehe unseren [Leitfaden zur Stichprobengröße](/de/blog/stichprobengroesse-berechnen) und den kostenlosen [Stichprobenrechner](/de/araclar/orneklem-hesaplayici).

## Einordnung im Ergebnisteil

Berichten Sie t-Test-Ergebnisse in der Reihenfolge Ihrer Forschungsfragen; bei mehreren Vergleichen fassen Sie Mittelwerte, SD, t, df, p und d in einer APA-Tabelle zusammen. Interpretiert wird in der Diskussion zusammen mit der Literatur, nicht im Ergebnisteil. Siehe unseren [Leitfaden zu Ergebnissen und Diskussion](/de/blog/ergebnisse-und-diskussion-schreiben).

## t-Test mit Academiana

Laden Sie Ihre Datendatei (CSV oder XLSX) in Ihre Arbeit hoch und wählen Sie unter „Werkzeuge“ → „Statistische Analyse“ den t-Test für unabhängige, verbundene oder eine Stichprobe. Sie erhalten deskriptive Statistik, Levene-Test, Student- und Welch-Zeile, Konfidenzintervall und Cohens d zusammen; die empfohlene Zeile ist klar gekennzeichnet. Der Bericht lässt sich im APA-Stil in den Text einfügen. Die KI erzeugt keine Zahlen: Jeder Wert wird aus Ihren hochgeladenen Daten berechnet.`,
  },
  "normallik-testi-carpiklik-basiklik": {
    slug: "normalverteilung-pruefen-schiefe-kurtosis",
    title: "Normalverteilung prüfen: Leitfaden zu Schiefe, Kurtosis und Shapiro-Wilk",
    seoTitle: "Normalverteilung prüfen: Schiefe, Kurtosis, Shapiro-Wilk",
    description: "Sind Ihre Daten normalverteilt? z-Werte für Schiefe und Kurtosis, Shapiro-Wilk und Kolmogorov-Smirnov, Grafiken und was bei Abweichung zu tun ist.",
    keywords: ["Normalverteilung prüfen", "Schiefe und Kurtosis Werte", "Schiefe Kurtosis interpretieren", "Shapiro-Wilk-Test", "Normalverteilungsannahme", "parametrisch oder nichtparametrisch"],
    cta: { text: "Laden Sie Ihre Datendatei hoch; die deskriptive Statistik zeigt Schiefe und Kurtosis mit z-Werten, damit Sie zwischen parametrischem und nichtparametrischem Test wählen können.", label: "Daten prüfen" },
    body: `Parametrische Tests wie t-Test, ANOVA, Pearson-Korrelation und Regression setzen voraus, dass die Daten (bzw. Residuen) annähernd normalverteilt sind. Die Prüfung der Normalverteilung gehört daher zu den Fragen, die Prüfungskommissionen und Gutachter am häufigsten stellen. Dieser Leitfaden zeigt drei Wege der Prüfung und wie Sie danach den Test wählen.

Die Zahlen in diesem Artikel wurden mit der Statistik-Engine von Academiana aus den Beispieldaten berechnet.

## Drei Wege zur Prüfung der Normalverteilung

1. **Kennzahlen:** Schiefe und Kurtosis sowie deren z-Werte.
2. **Normalverteilungstests:** Shapiro-Wilk und Kolmogorov-Smirnov (mit Lilliefors-Korrektur).
3. **Grafiken:** Histogramm, Q-Q-Diagramm und Boxplot.

Besser ist es, alle drei gemeinsam zu betrachten, statt sich auf eines zu verlassen. In großen Stichproben werden selbst unbedeutende Abweichungen signifikant; in kleinen Stichproben können deutliche Abweichungen übersehen werden.

## Was sind Schiefe und Kurtosis?

- **Schiefe** beschreibt die Symmetrie. 0 bedeutet vollkommen symmetrisch. Ein positiver Wert zeigt einen längeren rechten Ausläufer (zu hohen Werten), ein negativer einen längeren linken.
- **Kurtosis** beschreibt, wie schwer die Ränder im Vergleich zur Normalverteilung sind. Bei der von Programmen wie SPSS ausgegebenen „Exzess-Kurtosis“ liegt die Normalverteilung bei 0.

Rohwerte der Schiefe und Kurtosis hängen von der Stichprobengröße ab; daher wird jeder Wert durch seinen Standardfehler geteilt und ein **z-Wert** gebildet: z = Schiefe / Standardfehler.

## Welche Grenzwerte gelten?

Einen universellen Grenzwert gibt es nicht. Eine häufig zitierte Empfehlung (Kim, 2013):

- **Kleine Stichproben (n < 50):** Die Verteilung gilt nicht als normal, wenn der Betrag des z-Werts von Schiefe oder Kurtosis 1.96 übersteigt.
- **Mittlere Stichproben (50 ≤ n < 300):** Grenzwert z = 3.29.
- **Große Stichproben (n ≥ 300):** statt z die Rohwerte und Grafiken betrachten; eine absolute Schiefe über 2 oder eine absolute Kurtosis über 7 weist auf deutliche Abweichung hin.

In den Sozialwissenschaften gelten in manchen Quellen Schiefe und Kurtosis im Bereich ±1 oder ±2 als akzeptabel. Nennen Sie das verwendete Kriterium mit Quelle im Methodenteil.

## Rechenbeispiel

### Beispiel 1: Annähernd normalverteilt

Punktwerte (n = 12): 72, 85, 78, 90, 66, 81, 77, 88, 74, 83, 79, 86

- Mittelwert 79.92, Standardabweichung 7.04
- Schiefe −0.47, z = −0.73
- Kurtosis −0.21, z = −0.17

Beide z-Werte liegen betragsmäßig unter 1.96. Eine deutliche Abweichung von der Normalverteilung liegt nicht vor; ein parametrischer Test (z. B. t-Test) kann verwendet werden.

### Beispiel 2: Rechtsschief

Wöchentliche Stunden in der Bibliothek (n = 18): 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 8, 9, 12, 15, 21

- Mittelwert 6.89, Standardabweichung 4.80
- Schiefe 1.89, z = 3.52
- Kurtosis 3.64, z = 3.51

Beide z-Werte überschreiten 1.96 deutlich. Einige hohe Werte ziehen die Verteilung nach rechts. Mittelwert und Standardabweichung können hier irreführen; berichten Sie Median und Interquartilsabstand und erwägen Sie für Vergleiche nichtparametrische Tests.

## Shapiro-Wilk oder Kolmogorov-Smirnov?

- **Shapiro-Wilk** erwies sich vor allem in kleinen und mittleren Stichproben meist als teststärker (Razali & Wah, 2011). In Abschlussarbeiten wird er am häufigsten berichtet.
- **Kolmogorov-Smirnov** sollte mit Lilliefors-Korrektur verwendet werden, wenn Mittelwert und Standardabweichung aus den Daten geschätzt werden.

Bei beiden Tests gilt: **p > .05** – Normalverteilung wird nicht verworfen; **p < .05** – die Verteilung weicht signifikant ab. Berichtsbeispiel: „Die Werte erfüllten die Normalverteilungsannahme, W(12) = …, p = ….“ (Werte aus Ihrer eigenen Ausgabe übernehmen.)

## Was tun, wenn die Daten nicht normalverteilt sind?

- **Nichtparametrisches Gegenstück verwenden:** Mann-Whitney-U statt unabhängigem t-Test, Wilcoxon-Vorzeichen-Rang-Test statt verbundenem t-Test, Kruskal-Wallis statt einfaktorieller ANOVA, Spearman statt Pearson.
- **Ausreißer prüfen:** Eingabefehler oder echte Beobachtung? Echte Beobachtungen nicht ohne Begründung löschen.
- **Stichprobengröße beachten:** In großen Stichproben nähert sich die Stichprobenverteilung des Mittelwerts der Normalverteilung; t-Test und ANOVA sind robust gegenüber leichten Abweichungen.
- **Transformation:** Log- oder Wurzeltransformation kann Rechtsschiefe verringern; die Ergebnisse gelten dann auf der transformierten Skala.

Welcher Test in welcher Situation passt, zeigt unser [Leitfaden zur Testwahl](/de/blog/welcher-statistische-test); den Vergleich zweier Mittelwerte unser [t-Test-Leitfaden](/de/blog/t-test-durchfuehren-und-interpretieren).

## Normalverteilung von Skalenwerten

Einzelne Likert-Items sind ordinal; geprüft wird meist der Skalensummen- oder Mittelwert. Prüfen Sie vorher die Reliabilität der Skala: Unser [Leitfaden zu Cronbachs Alpha](/de/blog/cronbachs-alpha-erklaert) und der kostenlose [Cronbach-Alpha-Rechner](/de/araclar/cronbach-alfa) helfen dabei.

## Normalverteilung mit Academiana prüfen

Wenn Sie eine Datendatei in Ihre Arbeit hochladen, liefert die deskriptive Statistik unter „Statistische Analyse“ für jede Variable Mittelwert, Standardabweichung, Schiefe und Kurtosis mit z-Werten. Den Shapiro-Wilk-Test berechnet Academiana in dieser Version nicht; führen Sie ihn in einem Programm wie SPSS, R oder JASP durch und fügen Sie das Ergebnis in Ihren Text ein. Für nicht normalverteilte Daten können Sie Mann-Whitney-U und Kruskal-Wallis direkt in Academiana rechnen.`,
  },
  "isnad-atif-sistemi-rehberi": {
    slug: "isnad-zitierstil-leitfaden",
    title: "ISNAD-Zitierstil: Leitfaden mit Beispielen für Kurzbeleg und Literatur",
    seoTitle: "ISNAD-Zitierstil: Beispiele für Kurzbeleg und Literatur",
    description: "ISNAD 2. Auflage, Autor-Jahr-Format: Regeln für Kurzbelege und Literaturverzeichnis, Beispiele für Buch, Artikel, mehrere Autoren, Seitenzahl und DOI.",
    keywords: ["ISNAD Zitierstil", "ISNAD Literaturverzeichnis Beispiele", "ISNAD Kurzbeleg", "ISNAD 2. Auflage", "türkischer Zitierstil", "ISNAD Zeitschriftenartikel"],
    cta: { text: "Fügen Sie Ihre Quellen Ihrer Arbeit hinzu und wählen Sie ISNAD; Kurzbelege und Literaturverzeichnis entstehen automatisch, der Stilwechsel ist ein Klick.", label: "Mit ISNAD schreiben" },
    body: `Das ISNAD-Zitiersystem wurde in der Türkei entwickelt und ist bei vielen DergiPark-Zeitschriften vorgeschrieben, besonders in Theologie, Geschichte, Literatur und Teilen der Sozialwissenschaften. Aktuell ist die **2. Auflage** mit zwei Formaten: **Fußnoten** und **Autor-Jahr im Text**. Dieser Leitfaden behandelt das Autor-Jahr-Format mit Beispielen.

Die Beispiele wurden mit der Zitier-Engine von Academiana im Stil „ISNAD 2 (im Text)“ erzeugt. Autorinnen, Werke und Zeitschriften in den Beispielen sind **fiktiv** und dienen nur der Veranschaulichung; die DOI ist ein Platzhalter. Prüfen Sie vor der Einreichung immer die aktuellen Regeln auf der offiziellen Website (isnadsistemi.org) und die Autorenrichtlinien der Zeitschrift.

## Die zwei ISNAD-Formate

- **Fußnotenformat:** Belege stehen in Fußnoten; beim ersten Beleg die vollständige Angabe, danach eine Kurzform. Am Ende steht zusätzlich ein Literaturverzeichnis.
- **Autor-Jahr-Format:** Belege stehen in Klammern im Satz, mit Nachname und Jahr. Das Literaturverzeichnis am Ende ist wie im Fußnotenformat aufgebaut.

Welches Format gilt, entscheidet die Zeitschrift oder Hochschule. Steht in den Richtlinien nur „ISNAD“, klären Sie, welches gemeint ist.

## Regeln für Kurzbelege im Text

### Ein Autor und Seitenzahl

Nachname, Jahr und ggf. Seitenzahl in Klammern. Die Seitenzahl folgt nach einem Komma, ohne „S.“:

- (Yılmaz, 2021, 45)

### Zwei Autoren

Im Kurzbeleg werden die beiden Nachnamen mit einem Bindestrich verbunden:

- (Demir - Kaya, 2022)

Sind die Namen Teil des Satzes (narrativer Beleg), bleibt nur das Jahr in Klammern. In türkischen Texten steht dabei „ve“:

- Demir ve Kaya (2022), öğretmen öz yeterliğinin tükenmişlikle ilişkisini incelemiştir.

### Mehrere Autoren

Bei Werken mit vielen Autoren folgt auf den ersten Nachnamen in türkischen Texten „vd.“ (ve diğerleri), in englischen Texten „et al.“. Das Beispiel mit vier Autoren:

- (Smith vd., 2020)

### Mehrere Quellen in einer Klammer

Mit Semikolon trennen:

- (Yılmaz, 2021; Demir - Kaya, 2022)

## Regeln für das Literaturverzeichnis

ISNAD-Verzeichnisse werden alphabetisch nach Nachnamen sortiert. Anders als bei APA wird der **Vorname ausgeschrieben**, nicht abgekürzt. Titel werden großgeschrieben (außer Konjunktionen und Präpositionen).

### Buch

Nachname, Vorname. Buchtitel (kursiv). Ort: Verlag, Jahr.

- Yılmaz, Ayşe. *Örnek Eğitim Araştırmaları*. Ankara: Örnek Yayınları, 2021.

### Zeitschriftenartikel

Nachname, Vorname. „Artikeltitel“ (in Anführungszeichen). Zeitschrift (kursiv) Band/Heft (Jahr), Seiten. DOI.

- Demir, Mehmet - Kaya, Elif. “Öğretmen Öz Yeterliği ve Tükenmişlik: Bir Örnek Çalışma”. *Örnek Eğitim Dergisi* 14/2 (2022), 45-67. https://doi.org/10.0000/ornek.2022.002

Band und Heft werden mit Schrägstrich getrennt (14/2), das Jahr steht in Klammern. Eine vorhandene DOI wird als Link angefügt.

### Artikel mit mehreren Autoren

- Smith, John vd. “An Example Study”. *Example Journal* 8/1 (2020), 1-20.

## Wichtige Unterschiede zwischen APA 7 und ISNAD

Derselbe Artikel in beiden Stilen:

- **APA 7 im Text:** (Demir & Kaya, 2022)
- **ISNAD im Text:** (Demir - Kaya, 2022)
- **APA 7 Verzeichnis:** Demir, M., & Kaya, E. (2022). … *Örnek Eğitim Dergisi, 14*(2), 45–67.
- **ISNAD Verzeichnis:** Demir, Mehmet - Kaya, Elif. “…”. *Örnek Eğitim Dergisi* 14/2 (2022), 45-67.

Kurz: ISNAD schreibt Vornamen aus, setzt das Jahr nach Band/Heft, stellt Artikeltitel in Anführungszeichen und verwendet zwischen zwei Autoren einen Bindestrich statt „&“. APA-Regeln finden Sie in unserem [APA-7-Leitfaden](/de/blog/apa-7-zitierregeln), einen Stilvergleich in unserem [Leitfaden zum Literaturverzeichnis](/de/blog/literaturverzeichnis-erstellen-zitierstile).

## Häufige Fehler

- Autor-Jahr-Format verwenden, obwohl die Zeitschrift Fußnoten verlangt (oder umgekehrt)
- Vornamen aus APA-Gewohnheit abkürzen („Yılmaz, A.“)
- Band und Heft als „14(2)“ schreiben; ISNAD verwendet „14/2“
- Ein Beleg im Text fehlt im Verzeichnis oder umgekehrt
- Beim Stilwechsel Belege von Hand korrigieren und Inkonsistenzen hinterlassen

## Literaturverzeichnis schnell erstellen

Mit einer DOI oder einer Angabe in einem anderen Stil erstellen Sie mit unserem kostenlosen [Literaturverzeichnis-Generator](/de/araclar/kaynakca-olusturucu) eine ISNAD-Angabe oder wandeln ein bestehendes Verzeichnis mit dem [Zitierkonverter](/de/araclar/atif-donusturucu) um. Wenn Sie Ihre Quellen in Zotero oder Mendeley verwalten, erklärt unser [Leitfaden zur Literaturverwaltung](/de/blog/zotero-mendeley-literaturverwaltung) den Import.

## ISNAD mit Academiana

In Academiana werden Belege nicht als Klartext getippt, sondern als mit der Quelle verknüpfte Marker eingefügt. Wählen Sie „ISNAD 2 (im Text)“, entstehen Kurzbelege und Literaturverzeichnis nach den Regeln dieses Artikels; verlangt eine Zeitschrift APA, wechseln Sie den Stil mit einem Klick. Für eine Seitenzahl geben Sie beim Beleg einfach eine Fundstelle an. Bei Zeitschriften, die ISNAD mit Fußnoten verlangen, gleichen Sie Ihr Verzeichnis mit den Richtlinien der Zeitschrift ab.`,
  },
};
