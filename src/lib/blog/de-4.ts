import type { BlogPostEn } from "./types";

/** Almanca sürümler, 4. dosya (D143) */
export const DE_4: Record<string, BlogPostEn> = {
  "orneklem-buyuklugu-nasil-hesaplanir": {
    slug: "stichprobengroesse-berechnen",
    title: "Stichprobengröße berechnen: Cochran, Yamane und Poweranalyse",
    seoTitle: "Stichprobengröße berechnen: Cochran, Yamane, Power",
    description: "Stichprobengröße Schritt für Schritt berechnen: Formeln nach Cochran und Yamane, Endlichkeitskorrektur, Poweranalyse und Rücklaufquote.",
    keywords: ["Stichprobengröße berechnen", "Cochran Formel", "Yamane Formel", "Poweranalyse", "Stichprobenumfang bestimmen"],
    cta: { text: "Geben Sie Grundgesamtheit und Fehlermarge ein und erhalten Sie den Stichprobenumfang samt fertigem Satz für den Methodenteil. Ohne Registrierung.", label: "Stichprobenrechner öffnen" },
    body: `Eine der häufigsten Fragen Prüfender zum Methodenteil lautet: „Warum haben Sie genau so viele Teilnehmende befragt?“ Antworten wie „meine Betreuung meinte, 300 reichen“ oder „so viele Fragebögen kamen zurück“ genügen nicht. Der Stichprobenumfang ist keine Schätzung, sondern eine Berechnung, die Sie schriftlich begründen können. Dieser Leitfaden erklärt die drei in der quantitativen Forschung gängigsten Ansätze mit Rechenbeispielen und Formulierungen für den Methodenteil.

## Zuerst zwei Begriffe: Grundgesamtheit und Stichprobe

Die **Grundgesamtheit** ist die gesamte Gruppe, auf die Sie Ihre Befunde verallgemeinern wollen, zum Beispiel „Mathematiklehrkräfte an staatlichen Sekundarschulen in Ankara“. Die **Stichprobe** ist der Teil dieser Gruppe, von dem Sie Daten erheben. Eine Stichprobenberechnung beantwortet eine Frage: Wie viele Personen brauche ich mindestens, um verlässlich auf die Grundgesamtheit zu schließen?

Klären Sie vor der Berechnung drei Dinge:

- **Größe der Grundgesamtheit (N):** Ist sie bekannt? Wenn ja, wie viele Personen etwa?
- **Fehlermarge (e):** 5 % (0,05) ist in den Sozialwissenschaften üblich. Für mehr Genauigkeit können Sie 3 % wählen, dann wächst die nötige Stichprobe.
- **Konfidenzniveau:** meist 95 %. Der zugehörige Z-Wert ist 1,96.

## Ansatz 1: Formel nach Cochran

Die Cochran-Formel ist das verbreitetste Verfahren in deskriptiven Studien und Befragungen, die einen Anteil schätzen wollen (zum Beispiel „wie viel Prozent der Lehrkräfte erleben Burnout“).

Für eine unendliche (oder sehr große) Grundgesamtheit:

**n₀ = Z² × p × q / e²**

Dabei ist p der geschätzte Anteil des Merkmals in der Grundgesamtheit. Ist er unbekannt, verwenden Sie 0,5 – das ergibt die größte Stichprobe; q = 1 − p.

Bei 95 % Konfidenz, 5 % Fehlermarge und p = 0,5: n₀ = 1,96² × 0,5 × 0,5 / 0,05² = 384,16 → **385 Personen**.

Ist die Grundgesamtheit bekannt und nicht sehr groß, wenden Sie die **Endlichkeitskorrektur** an:

**n = n₀ / (1 + (n₀ − 1) / N)**

**Beispiel:** Bei einer Grundgesamtheit von 1.000 Lehrkräften: n = 384,16 / (1 + 383,16 / 1.000) = 384,16 / 1,383 ≈ **278 Lehrkräfte**.

Die Korrektur wirkt umso stärker, je kleiner die Grundgesamtheit ist. Bei 200 Personen genügen etwa 132; bei 100.000 liegt das Ergebnis sehr nahe bei 383. In großen Grundgesamtheiten ändert sich die nötige Stichprobe kaum.

## Ansatz 2: Formel nach Yamane

Die Yamane-Formel, in Abschlussarbeiten in der Türkei verbreitet, ist eine vereinfachte Cochran-Formel für 95 % Konfidenz und p = 0,5:

**n = N / (1 + N × e²)**

Für eine Grundgesamtheit von 1.000 und 5 % Fehlermarge: n = 1.000 / (1 + 1.000 × 0,0025) = 1.000 / 3,5 ≈ **286 Personen**.

Ihr Vorteil ist die Einfachheit. Ihre Grenze: Konfidenzniveau und Anteil lassen sich nicht verändern. Fragt die Kommission nach einem anderen Konfidenzniveau, ist Cochran flexibler.

## Ansatz 3: Poweranalyse (für experimentelle und korrelative Studien)

Schätzt Ihre Studie keinen Anteil, sondern **vergleicht Gruppen** (etwa Experimental- und Kontrollgruppe) oder untersucht **den Zusammenhang zweier Variablen**, sind Cochran und Yamane nicht geeignet. Dann führen Sie eine **Poweranalyse** durch: Sie berechnet die Stichprobe, die nötig ist, um die Wahrscheinlichkeit, einen tatsächlichen Effekt zu entdecken (Teststärke), auf einem gewählten Niveau zu halten.

Eine Poweranalyse braucht vier Angaben:

1. **Effektstärke:** die erwartete Größe des Unterschieds oder Zusammenhangs, aus früheren Studien; fehlen solche, wird nach Cohen ein „mittlerer“ Effekt angenommen.
2. **Signifikanzniveau (α):** meist 0,05.
3. **Teststärke (1 − β):** meist 0,80.
4. **Testart:** t-Test, ANOVA, Korrelation, Regression usw.

Häufige Fälle nach Cohens Konventionen (α = 0,05, Power = 0,80, zweiseitig):

- **t-Test für unabhängige Stichproben, mittlerer Effekt (d = 0,5):** etwa **64 pro Gruppe**, insgesamt 128.
- **Einfaktorielle ANOVA, drei Gruppen, mittlerer Effekt (f = 0,25):** etwa **159 insgesamt** (53 pro Gruppe).
- **Pearson-Korrelation, mittlerer Zusammenhang (r = 0,30):** etwa **85 Personen**.

Diese Berechnungen können Sie mit kostenloser Software wie G*Power durchführen. Nennen Sie im Methodenteil Programm, Version und die vier verwendeten Werte.

> Erwarten Sie einen kleinen Effekt, wächst die nötige Stichprobe rasch. Für einen t-Test mit kleinem Effekt (d = 0,2) brauchen Sie etwa 394 Personen pro Gruppe. Deshalb sollte die Effektstärke in der Literatur begründet sein.

## Rücklaufquote und Datenverlust einplanen

Die berechnete Zahl ist die Zahl gültiger Antworten, die **in die Analyse eingehen**. In der Praxis kommen manche Fragebögen nie zurück, andere sind unvollständig oder unsorgfältig ausgefüllt. Erhöhen Sie die Zahl der Angesprochenen entsprechend der erwarteten Rücklaufquote:

**Anzusprechende Personen = nötige Stichprobe / erwartete Rücklaufquote**

Bei einer nötigen Stichprobe von 278 und 70 % erwartetem Rücklauf: 278 / 0,70 ≈ **398 Personen** sollten den Fragebogen erhalten.

## Das Stichprobenverfahren ist so wichtig wie die Zahl

Die richtige Zahl zu erreichen, heißt nicht, dass die Stichprobe die Grundgesamtheit abbildet. Erläutern Sie auch das Verfahren:

- **Einfache Zufallsstichprobe:** Alle in der Grundgesamtheit haben die gleiche Auswahlchance; Sie brauchen eine Liste der Grundgesamtheit.
- **Geschichtete Stichprobe:** Die Grundgesamtheit wird in Untergruppen (Schulart, Region) geteilt, aus jeder wird anteilig gezogen.
- **Klumpenstichprobe:** Statt Einzelpersonen werden Klumpen wie Schulen, Klassen oder Kliniken ausgewählt.
- **Gelegenheitsstichprobe:** Sie arbeiten mit denen, die Sie erreichen. In Abschlussarbeiten sehr häufig, schränkt aber die Verallgemeinerbarkeit ein; benennen Sie das klar unter den Limitationen.

Auch bei einer Gelegenheitsstichprobe ist es für die Stabilität der Ergebnisse wichtig, die berechnete Zahl zu erreichen.

## Qualitative Forschung funktioniert anders

Interview- und Fokusgruppenstudien verwenden keine Formeln. Der Umfang wird meist mit der **theoretischen Sättigung** begründet: Die Erhebung endet, wenn neue Interviews keine neuen Codes oder Themen mehr liefern. Nennen Sie dieses Prinzip und das Interview, mit dem Sie die Sättigung erreicht haben. Details finden Sie in unserem Leitfaden zu [qualitativen Interviews und thematischer Analyse](/de/blog/qualitative-interviews-thematische-analyse).

## So schreiben Sie es im Methodenteil

Ein guter Absatz zur Stichprobe nennt Grundgesamtheit, Berechnungsverfahren, verwendete Werte, erreichte Zahl und Stichprobenverfahren. Zum Beispiel:

„Die Grundgesamtheit bilden 1.000 Mathematiklehrkräfte, die im Schuljahr 2025–2026 an staatlichen Sekundarschulen in Ankara tätig sind. Mit der Cochran-Formel einschließlich Endlichkeitskorrektur, einem Konfidenzniveau von 95 % und einer Fehlermarge von 5 % wurde ein Mindeststichprobenumfang von 278 berechnet. In Erwartung einer Rücklaufquote von 70 % wurden 400 Lehrkräfte angesprochen; nach Ausschluss unvollständiger und unsorgfältiger Bögen wurden 291 gültige Fragebögen ausgewertet. Die Auswahl erfolgte als nach Schulart geschichtete Stichprobe.“

## Häufige Fehler

- **Eine Zahl nennen, ohne die Grundgesamtheit zu definieren:** Klären Sie zuerst, auf wen Sie verallgemeinern.
- **Die falsche Formel verwenden:** Eine experimentelle Studie mit Gruppenvergleich braucht eine Poweranalyse, nicht Yamane.
- **Die Rücklaufquote ignorieren:** Wer genau die berechnete Zahl an Fragebögen verschickt, landet meist bei einer zu kleinen Stichprobe.
- **Nur „es wurde eine ausreichende Stichprobe erreicht“ schreiben:** Ohne die verwendeten Werte wird die Kommission nachfragen.
- **Deutlich weniger Personen auswerten als berechnet:** Wurde das Ziel verfehlt, verschweigen Sie es nicht; berichten Sie es als Limitation und interpretieren Sie vorsichtig.

## Kurz gesagt

Nutzen Sie Cochran oder Yamane für Befragungen, die Anteile schätzen, und die Poweranalyse für Studien, die Gruppen vergleichen oder Zusammenhänge untersuchen. Erhöhen Sie die Zahl um die erwartete Rücklaufquote, erläutern Sie Ihr Stichprobenverfahren und berichten Sie all dies mit den verwendeten Werten. Statt von Hand zu rechnen, können Sie unseren [kostenlosen Stichprobenrechner](/de/araclar/orneklem-hesaplayici) nutzen, der Zahl und fertigen Satz für den Methodenteil liefert.`,
  },
  "cronbach-alfa-nedir-nasil-yorumlanir": {
    slug: "cronbachs-alpha-erklaert",
    title: "Cronbachs Alpha: Was es ist, wie man es berechnet und interpretiert",
    seoTitle: "Cronbachs Alpha berechnen und interpretieren",
    description: "Was Cronbachs Alpha bedeutet, welche Werte akzeptabel sind, wie Sie Item-Skala-Korrelationen lesen und was zu tun ist, wenn Alpha niedrig ausfällt.",
    keywords: ["Cronbachs Alpha", "Reliabilitätskoeffizient", "interne Konsistenz", "Trennschärfe", "Reliabilität Skala"],
    cta: { text: "Fügen Sie Ihre Daten ein und berechnen Sie Cronbachs Alpha, Item-Skala-Korrelationen und Alpha bei Weglassen des Items direkt im Browser. Ohne Registrierung; Ihre Daten verlassen Ihr Gerät nicht.", label: "Cronbachs Alpha berechnen" },
    body: `Fast jede Abschlussarbeit mit Likert-Skala enthält den Satz „Cronbachs Alpha der Skala betrug in dieser Studie …“. Was diese Zahl zeigt und was nicht, bleibt dabei oft unklar. Entweder löst ein Wert unter 0,70 Panik aus, oder ein sehr hoher Wert wie 0,95 wird fraglos berichtet. Dieser Leitfaden erklärt die Logik von Cronbachs Alpha, seine Interpretation und was Sie tun können, wenn etwas schiefläuft.

## Was misst Cronbachs Alpha?

Cronbachs Alpha ist ein Koeffizient der **internen Konsistenz**. Er zeigt, wie einheitlich Personen Items beantworten, die dasselbe Merkmal messen sollen (Angst, Selbstwirksamkeit, Arbeitszufriedenheit). Wer einem Angst-Item stark zustimmt, sollte die übrigen Angst-Items ähnlich beantworten. Je konsistenter die Items, desto höher Alpha.

Die Formel lautet:

**α = k / (k − 1) × (1 − Σσᵢ² / σₜ²)**

- **k:** Anzahl der Items
- **σᵢ²:** Varianz jedes Items
- **σₜ²:** Varianz des Gesamtwerts

Daraus folgen zwei wichtige Konsequenzen. Erstens: Je stärker die Items korrelieren, desto größer die Varianz des Gesamtwerts und desto höher Alpha. Zweitens: **Alpha steigt tendenziell schon deshalb, weil die Zahl der Items wächst.** Ein hohes Alpha einer 30-Item-Skala ist nicht automatisch „besser“ als ein niedrigeres einer 4-Item-Subskala.

## Welche Werte sind akzeptabel?

Eine in der Literatur häufig verwendete grobe Einteilung:

- **0,90 und höher:** exzellent
- **0,80–0,89:** gut
- **0,70–0,79:** akzeptabel
- **0,60–0,69:** fragwürdig
- **unter 0,60:** schwach

Das sind keine absoluten Regeln. Kurze Subskalen (3–4 Items) können Werte um 0,60 zeigen, die sich mit Begründung diskutieren lassen. Für klinische oder Auswahlentscheidungen über Einzelpersonen werden höhere Werte erwartet.

> **Auch ein sehr hohes Alpha kann ein Problem sein.** Werte über 0,95 können darauf hindeuten, dass manche Items fast dasselbe mit fast denselben Worten fragen (Redundanz) – die Skala ist dann unnötig lang.

## Item-Skala-Korrelation (Trennschärfe)

Alpha allein verrät nicht, welches Item problematisch ist. Dafür betrachten Sie die **korrigierte Item-Skala-Korrelation**: wie stark jedes Item mit der Summe der übrigen Items zusammenhängt.

- **0,30 und höher:** Das Item passt zur Skala.
- **0,20–0,30:** Das Item sollte geprüft werden.
- **Unter 0,20 oder negativ:** Das Item ist vermutlich problematisch.

Sehen Sie einen negativen Wert, prüfen Sie zuerst, ob Sie **vergessen haben, ein Item umzupolen**. Ein positiv formuliertes Item wie „Im Unterricht fühle ich mich entspannt“ in einer Angstskala muss vor der Analyse umgepolt werden. Bei einer 5-stufigen Likert-Skala ersetzen Sie den Wert durch (6 − Wert).

## Alpha bei Weglassen des Items

Die Analyseausgabe zeigt für jedes Item, wie hoch Alpha ohne dieses Item wäre. Steigt Alpha beim Weglassen deutlich, passt das Item womöglich nicht zum Rest der Skala.

**Löschen Sie Items aber nicht nur, weil Alpha steigt.** Wer Items aus einer adaptierten Skala mit belegter Validität entfernt, verzerrt deren ursprüngliche Struktur und macht die Ergebnisse mit anderen Studien unvergleichbar. Löschen Sie Items nur mit theoretischer Begründung und nur, wenn Sie eine Skala entwickeln. Bei einer adaptierten Skala ist es meist besser, ein problematisches Item zu berichten und in Diskussion oder Limitationen aufzugreifen.

## Niedriges Alpha: was tun?

Prüfen Sie vor jeder Panik der Reihe nach:

1. **Wurden umgepolte Items umkodiert?** Das ist die häufigste Ursache für niedrige Werte.
2. **Gibt es Eingabefehler?** Bei einer 5-stufigen Skala darf es keine Werte wie 6, 7 oder 55 geben.
3. **Gibt es unsorgfältige Antworten?** Sehen Sie sich Personen an, die jedes Item gleich beantwortet oder unplausibel schnell abgeschlossen haben. Schließen Sie sie aus, begründen Sie das im Methodenteil.
4. **Haben Sie Alpha je Subskala berechnet?** Bei mehrdimensionalen Skalen berichten Sie Alpha für jede Subskala, nicht nur für den Gesamtwert. Das gemeinsame Alpha von Items, die verschiedene Konstrukte messen, kann irreführen.
5. **Ist die Stichprobe sehr klein oder homogen?** Sind sich die Teilnehmenden sehr ähnlich, sinkt die Varianz der Werte – und damit Alpha.

Ist der Wert nach diesen Prüfungen weiterhin niedrig, berichten Sie ihn wie er ist und gehen Sie in der Diskussion darauf ein. Items auszuwählen oder Teilnehmende zu entfernen, nur um den Wert zu „reparieren“, verstößt gegen die Forschungsethik.

## Grenzen von Cronbachs Alpha

- **Es beweist keine Eindimensionalität.** Ein hohes Alpha zeigt nicht, dass eine Skala ein einziges Konstrukt misst; dazu braucht es eine Faktorenanalyse.
- **Es ist kein Validitätsnachweis.** Eine Skala kann konsistent das Falsche messen. Reliabilität ist Voraussetzung der Validität, kein Ersatz.
- **Es beruht auf Annahmen.** Alpha setzt voraus, dass alle Items gleich zum Konstrukt beitragen. Gilt das nicht, liefert **McDonalds Omega** oft eine genauere Schätzung; viele Zeitschriften empfehlen inzwischen, Omega mitzuberichten.

Wie Validitätsstudien durchgeführt werden, erklären wir in unserem Leitfaden zu [Validität und Reliabilität bei der Skalenadaptation](/de/blog/skalenadaptation-validitaet-reliabilitaet).

## So schreiben Sie es im Methodenteil

Ein guter Absatz zur Reliabilität nennt den Wert der Originalstudie und den Wert in Ihren Daten. Zum Beispiel:

„In der Adaptationsstudie der Skala zur Selbstwirksamkeit von Lehrkräften wurde Cronbachs Alpha mit .91 angegeben. In der vorliegenden Studie betrug Alpha für den Gesamtwert .89 sowie .82 (Schülerbeteiligung), .85 (Unterrichtsstrategien) und .87 (Klassenführung) für die Subskalen. Die korrigierten Item-Skala-Korrelationen lagen zwischen .38 und .71.“

Im APA-Stil werden Koeffizienten, die 1 nicht überschreiten können, ohne führende Null berichtet („.89“). Verlangen die Vorgaben Ihrer Hochschule ein anderes Format (etwa „,89“), folgen Sie diesen.

## Kurz gesagt

Cronbachs Alpha zeigt, ob Items konsistent beantwortet werden; 0,70 und mehr gilt meist als ausreichend. Prüfen Sie bei niedrigen Werten zuerst umgepolte Items und Eingabefehler, löschen Sie keine Items nur zur Erhöhung von Alpha und stellen Sie Alpha nicht als Validitätsnachweis dar. Fügen Sie Ihre Daten in unser [kostenloses Werkzeug für Cronbachs Alpha](/de/araclar/cronbach-alfa) ein und sehen Sie Alpha, Item-Skala-Korrelationen und Alpha bei Weglassen des Items in Sekunden.`,
  },
  "olcek-gecerlik-guvenirlik-calismasi": {
    slug: "skalenadaptation-validitaet-reliabilitaet",
    title: "Validität und Reliabilität einer Skala prüfen: Leitfaden zur Skalenadaptation",
    seoTitle: "Skalenadaptation: Validität und Reliabilität prüfen",
    description: "Skalenadaptation Schritt für Schritt: Übersetzung, Inhaltsvalidität, explorative und konfirmatorische Faktorenanalyse, Fit-Indizes und Reliabilität.",
    keywords: ["Skalenadaptation", "Validität und Reliabilität", "explorative Faktorenanalyse", "konfirmatorische Faktorenanalyse", "Fit-Indizes"],
    cta: { text: "Erstellen Sie Ihre Skala mit dem Umfrage-Generator von Academiana, erheben Sie Daten per Link und übergeben Sie die Antworten mit einem Klick an die Analyse.", label: "Kostenlos starten" },
    body: `Eine im Ausland entwickelte Skala in eine andere Sprache zu adaptieren oder eine neue Skala zu entwickeln, gehört zu den häufigsten Formen von Master- und Doktorarbeiten. Der Prozess ist weit mehr als das Übersetzen von Items: Sie müssen belegen, dass die Skala in der neuen Sprache und Kultur dasselbe Konstrukt konsistent misst. Dieser Leitfaden führt der Reihe nach durch die Schritte einer Validitäts- und Reliabilitätsstudie.

## Der Unterschied zwischen Validität und Reliabilität

- **Reliabilität:** Liefert die Skala konsistente Ergebnisse? Würde dieselbe Person unter ähnlichen Bedingungen einen ähnlichen Wert erhalten? Stimmen die Items untereinander überein?
- **Validität:** Misst die Skala tatsächlich, was sie messen soll?

Eine Personenwaage, die immer 2 kg zu viel anzeigt, ist reliabel (sie zeigt immer dasselbe), aber nicht valide. Deshalb müssen beide Eigenschaften getrennt nachgewiesen werden.

## Schritte einer Adaptationsstudie

### 1. Erlaubnis einholen

Holen Sie die schriftliche Erlaubnis der Entwickler:innen oder Rechteinhaber ein und bewahren Sie die Korrespondenz auf. Viele Ethikkommissionen und Zeitschriften verlangen sie.

### 2. Sprachliche Äquivalenz: Übersetzung und Rückübersetzung

Ein verbreitetes Vorgehen:

1. Mindestens zwei unabhängige Übersetzer:innen übertragen die Items in die Zielsprache.
2. Die Übersetzungen werden verglichen und zu einer Fassung zusammengeführt.
3. Eine weitere Person, die das Original nicht kennt, übersetzt diese Fassung zurück in die Ausgangssprache (Rückübersetzung).
4. Die Rückübersetzung wird mit dem Original verglichen; Items mit verschobener Bedeutung werden überarbeitet.

Die **sprachliche Äquivalenz** lässt sich anschließend mit einer zweisprachigen Gruppe prüfen: Dieselben Personen füllen beide Sprachfassungen mit zeitlichem Abstand aus, und die Korrelation der Werte wird betrachtet.

### 3. Inhaltsvalidität: Expertenurteil

Fachleute beurteilen, ob jedes Item das Konstrukt abbildet. Ihre Urteile lassen sich quantifizieren. Verbreitet ist die **Lawshe-Methode**: Für jedes Item wird aus der Zahl der Fachleute, die es als „unverzichtbar“ einstufen, ein Inhaltsvaliditätsverhältnis berechnet und mit einem kritischen Wert verglichen, der von der Zahl der Fachleute abhängt.

Kulturell unpassende Formulierungen (etwa eine Schulpraxis, die es im neuen Kontext nicht gibt) werden in diesem Schritt angepasst.

### 4. Pilotstudie

Die Skala wird einer kleinen, der Zielgruppe ähnlichen Gruppe vorgelegt, die angibt, ob die Items verständlich sind. Missverstandene Items werden überarbeitet.

### 5. Haupterhebung und Stichprobe

Eine Faktorenanalyse braucht eine ausreichende Stichprobe. Oft werden Faustregeln wie 5–10 Teilnehmende pro Item oder mindestens 200–300 Personen genannt; besser ist es jedoch, die Eigenschaften der eigenen Daten zu betrachten statt sich nur auf diese Regeln zu stützen. In Adaptationsstudien wird für die konfirmatorische Faktorenanalyse meist eine ausreichend große Stichprobe verwendet.

## Konstruktvalidität: Faktorenanalyse

### Explorative Faktorenanalyse (EFA)

Mit der EFA wird **ermittelt**, zu wie vielen Dimensionen sich die Items gruppieren. Sie ist die Kernmethode der Skalenentwicklung.

Prüfen Sie zuerst, ob die Daten für eine Faktorenanalyse geeignet sind:

- **KMO (Kaiser-Meyer-Olkin):** zeigt die Eignung der Stichprobe. Werte über 0,60 gelten allgemein als akzeptabel, über 0,80 als gut.
- **Bartlett-Test auf Sphärizität:** Ein signifikantes Ergebnis (p < .05) zeigt, dass die Items ausreichend zusammenhängen.

Berichten Sie dann:

- **Anzahl der Faktoren:** Eigenwerte größer 1, Screeplot und Parallelanalyse gemeinsam betrachtet.
- **Faktorladungen:** Ein Item sollte in der Regel mindestens 0,30–0,40 laden. Items mit hohen Ladungen auf zwei Faktoren (Doppelladungen) werden geprüft.
- **Erklärte Varianz:** wie viel der Gesamtvarianz die Faktoren erklären.

### Konfirmatorische Faktorenanalyse (CFA)

Die CFA prüft, ob die in der Originalstudie gefundene Struktur in Ihren Daten **bestätigt** wird. Sie ist die Kernmethode der Skalenadaptation.

Die Modellgüte wird mit **Fit-Indizes** beurteilt. Gebräuchliche Indizes und typische Kriterien:

- **χ²/df (Chi-Quadrat / Freiheitsgrade):** unter 3 gut, unter 5 akzeptabel. Da Chi-Quadrat in großen Stichproben leicht signifikant wird, wird es nicht allein beurteilt.
- **RMSEA:** unter 0,05–0,06 gut, unter 0,08 akzeptabel.
- **CFI und TLI:** über 0,95 gut, über 0,90 akzeptabel.
- **SRMR:** unter 0,08 akzeptabel.

Das sind verbreitete Richtwerte, keine festen Grenzen. Nennen Sie im Methodenteil die verwendeten Kriterien und deren Quelle.

Ist der Fit schlecht, schlagen Modifikationsindizes mitunter Kovarianzen zwischen Fehlertermen vor. Tun Sie das nur mit theoretischer Begründung, etwa bei ähnlich formulierten Items derselben Subskala, und berichten Sie jede Änderung.

## Belege für die Reliabilität

- **Interne Konsistenz:** Cronbachs Alpha und nach Möglichkeit McDonalds Omega für jede Subskala und den Gesamtwert. Siehe unseren [Leitfaden zu Cronbachs Alpha](/de/blog/cronbachs-alpha-erklaert).
- **Test-Retest-Reliabilität:** Die Skala wird derselben Gruppe zweimal im Abstand (meist 2–4 Wochen) vorgelegt und die Korrelation der Werte berechnet.
- **Itemanalyse:** Korrigierte Item-Skala-Korrelationen und der Vergleich der Itemmittelwerte zwischen den unteren und oberen 27 % zeigen, wie gut die Items trennen.

## Kriteriumsvalidität (optional, aber aussagekräftig)

Hängen die Werte Ihrer Skala in erwarteter Richtung mit einer anderen validierten Skala für ein ähnliches Konstrukt zusammen (konvergente Validität), ist das ein zusätzlicher Beleg für die Konstruktvalidität.

## Häufige Fehler

- **Bei einer Adaptation nur eine EFA rechnen:** Bei einer Skala mit bekannter Struktur wird erwartet, dass diese per CFA bestätigt wird.
- **EFA und CFA auf denselben Daten rechnen:** Dann „bestätigt“ die CFA zwangsläufig, was die EFA gefunden hat. Teilen Sie die Daten oder nutzen Sie nach Möglichkeit zwei getrennte Stichproben.
- **Fit-Indizes selektiv berichten:** Berichten Sie alle Standardindizes, nicht nur die günstigen.
- **Eine Skala ohne Erlaubnis verwenden:** Das schafft ethische und rechtliche Probleme.
- **Nur das Alpha des Gesamtwerts berichten:** Bei mehrdimensionalen Skalen muss die Reliabilität jeder Subskala berichtet werden.

## Kurz gesagt

Skalenadaptation ist ein Prozess: Erlaubnis, Übersetzung und Rückübersetzung, Expertenurteil, Pilot, konfirmatorische Faktorenanalyse und Reliabilitätsanalysen. Jeden Schritt zusammen mit den verwendeten Kriterien zu berichten, ist das, worauf Kommissionen und Gutachtende am meisten achten. Für die Datenerhebung können Sie Ihre Skala mit dem Umfrage-Generator von Academiana per Link verteilen, Items automatisch umpolen und die Antworten direkt an die Analyse übergeben.`,
  },
  "nitel-arastirma-gorusme-ve-tematik-analiz": {
    slug: "qualitative-interviews-thematische-analyse",
    title: "Qualitative Interviews führen und thematisch auswerten",
    seoTitle: "Qualitative Interviews und thematische Analyse",
    description: "Eine qualitative Studie Schritt für Schritt: halbstrukturierten Leitfaden entwickeln, kodieren, Themen bilden und Gütekriterien anwenden.",
    keywords: ["qualitative Forschung", "halbstrukturiertes Interview", "thematische Analyse", "qualitative Inhaltsanalyse", "qualitative Daten kodieren"],
    cta: { text: "Speichern Sie Interviewfragen und Codeliste im Projektgedächtnis; der Assistent hilft Ihnen, die Befunde ausschließlich mit Ihren Themen und Zitaten zu ordnen.", label: "Kostenlos starten" },
    body: `Qualitative Forschung fragt eher „wie?“ und „warum?“ als „wie viel?“. Sie ermöglicht tiefe Einblicke in Themen wie die Erfahrungen von Lehrkräften im Distanzunterricht, das Erleben von Burnout in der Pflege oder die Sicht Studierender auf KI-Werkzeuge. Wird eine qualitative Studie aber als „mit ein paar Leuten reden und aufschreiben, was sie sagen“ verstanden, schickt die Kommission sie leicht zurück. Dieser Leitfaden zeigt, wie Sie eine interviewbasierte qualitative Studie von Anfang bis Ende durchführen.

## Das passende Design wählen

Die häufigsten qualitativen Designs sind:

- **Phänomenologie:** untersucht Erfahrungen von Menschen, die ein Phänomen erleben, und die Bedeutung, die sie ihm geben. Beispiel: „Erfahrungen von Oberstufenschüler:innen mit Prüfungsangst.“
- **Fallstudie:** untersucht eine bestimmte Schule, ein Programm oder eine Praxis vertieft und im Kontext.
- **Grounded Theory:** will aus den Daten heraus eine Theorie entwickeln, die einen Prozess erklärt.
- **Generische qualitative Forschung:** beschreibt Sichtweisen und Erfahrungen zu einem Thema, ohne sich auf ein bestimmtes Design festzulegen. In Abschlussarbeiten sehr häufig.

Wählen Sie das Design passend zu Ihrer Forschungsfrage und begründen Sie es im Methodenteil. Im deutschsprachigen Raum ist zudem die qualitative Inhaltsanalyse nach Mayring verbreitet.

## Teilnehmende auswählen

Ziel qualitativer Forschung ist Tiefe, nicht Verallgemeinerung; Teilnehmende werden daher meist **gezielt** ausgewählt:

- **Kriteriengeleitete Auswahl:** Personen, die bestimmte Kriterien erfüllen (z. B. Erzieher:innen mit mindestens fünf Jahren Berufserfahrung).
- **Maximale Variation:** Personen mit unterschiedlichen Merkmalen werden bewusst ausgewählt (verschiedene Schularten, Geschlechter, Erfahrungsstufen).
- **Schneeballverfahren:** In schwer erreichbaren Gruppen vermitteln Interviewte weitere Personen.

Die Zahl der Teilnehmenden wird nicht mit einer Formel, sondern mit der **theoretischen Sättigung** begründet: Die Erhebung endet, wenn neue Interviews keine neuen Codes oder Themen mehr bringen.

## Einen halbstrukturierten Leitfaden entwickeln

Ein halbstrukturiertes Interview hat vorbereitete Fragen, lässt aber je nach Antwort Nachfragen zu. Ein guter Leitfaden enthält:

- **Offene Fragen:** Statt „War der Distanzunterricht wirksam?“ fragen Sie „Können Sie Ihre Erfahrungen im Distanzunterricht beschreiben?“
- **Nicht suggestive Fragen:** „Wie hat Sie der Druck Ihrer Vorgesetzten beeinflusst?“ unterstellt Druck. „Wie würden Sie Ihr Verhältnis zu Ihren Vorgesetzten beschreiben?“ ist neutraler.
- **Nachfragen:** Zu jeder Hauptfrage gibt es Nachfragen wie „Können Sie ein Beispiel nennen?“ oder „Wie ging es Ihnen dabei?“
- **Eine vertretbare Länge:** 6–10 Hauptfragen genügen für die meisten Studien. Interviews dauern meist 30–60 Minuten.

Lassen Sie den Leitfaden von zwei oder drei Fachleuten prüfen und führen Sie ein oder zwei **Pilotinterviews** durch. Überarbeiten Sie unklare Fragen oder solche, die immer dieselbe Antwort erzeugen.

## Interviews führen und aufzeichnen

- **Informierte Einwilligung:** Erklären Sie Zweck, Freiwilligkeit, das jederzeitige Rücktrittsrecht und die vertrauliche Behandlung der Identität. Bitten Sie gesondert um die Erlaubnis zur Aufnahme. Holen Sie das Ethikvotum vor der Datenerhebung ein.
- **Pseudonyme:** Vergeben Sie Kürzel wie P1, P2 oder L1, L2. Entfernen Sie identifizierende Details (Schulname, seltene Spezialisierungen) aus dem Bericht.
- **Transkription:** Transkribieren Sie die Aufnahmen wörtlich. Das kostet Zeit – eine Stunde Interview kann mehrere Stunden Transkription bedeuten –, ist aber auch der Weg, Ihre Daten kennenzulernen.

## Thematische Analyse: sechs Phasen

Die thematische Analyse nach Braun und Clarke (2006) ist einer der verbreitetsten Ansätze für qualitative Daten. Sie umfasst sechs Phasen:

1. **Vertrautmachen:** Lesen Sie die Transkripte mehrmals und notieren Sie erste Eindrücke.
2. **Erste Codes bilden:** Geben Sie jedem bedeutungstragenden Abschnitt ein kurzes Etikett (Code). So könnte „Studierende schalten ihre Kameras aus“ mit „fehlende Interaktion“ kodiert werden.
3. **Themen suchen:** Fassen Sie zusammengehörige Codes zu vorläufigen Themen zusammen.
4. **Themen prüfen:** Prüfen Sie, ob jedes Thema durch die Daten gestützt wird und sich die Themen voneinander abgrenzen. Führen Sie Themen bei Bedarf zusammen oder teilen Sie sie.
5. **Themen definieren und benennen:** Beschreiben Sie in ein, zwei Sätzen, worum es in jedem Thema geht, und geben Sie ihm einen aussagekräftigen Namen.
6. **Bericht schreiben:** Stellen Sie die Themen mit stützenden direkten Zitaten dar.

Der Prozess ist nicht linear; von Phase vier zu Phase zwei zurückzukehren, ist völlig normal.

### Induktiv oder deduktiv?

- **Induktive (datengeleitete) Kodierung:** Codes und Themen entstehen aus den Daten. Geeignet, wenn ein Thema wenig erforscht ist.
- **Deduktive (theoriegeleitete) Kodierung:** Kategorien einer bestehenden Theorie oder eines Rahmens werden verwendet.

Geben Sie klar an, welchen Ansatz Sie gewählt haben. Auch Mischformen sind möglich.

## Vertrauenswürdigkeit: Gütekriterien qualitativer Forschung

Statt quantitativer Validität und Reliabilität werden in der qualitativen Forschung meist die Kriterien von Lincoln und Guba (1985) verwendet:

- **Glaubwürdigkeit (Credibility):** lange Feldphase, kommunikative Validierung (Teilnehmende prüfen die Befunde), Peer Debriefing.
- **Übertragbarkeit (Transferability):** dichte Beschreibung von Teilnehmenden und Kontext, einschließlich direkter Zitate.
- **Verlässlichkeit (Dependability):** Kodierung mit einer zweiten Person und Berechnung der Übereinstimmung.
- **Bestätigbarkeit (Confirmability):** Rohdaten, Codes und Analysenotizen aufbewahren; die eigene Rolle und mögliche Vorannahmen offenlegen.

Beschreiben Sie konkret, welche dieser Strategien Sie wie angewandt haben. Ein allgemeiner Satz wie „Validität und Reliabilität wurden sichergestellt“ genügt nicht.

## Die Befunde schreiben

- Stellen Sie jedes Thema unter einer eigenen Unterüberschrift dar, bei Bedarf mit Unterthemen.
- Erklären Sie das Thema kurz und belegen Sie es mit **direkten Zitaten**: „Als ich sie bat, die Kamera einzuschalten, sagten die meisten, ihr Internet sei zu langsam.“ (P4)
- Stützen Sie sich nicht auf eine einzige Person; ziehen Sie Beispiele verschiedener Teilnehmender heran.
- Eine Tabelle mit Codes und Themen kann helfen; Zählen ist aber nicht das Ziel qualitativer Forschung.
- Vermischen Sie Befunde und Diskussion nicht. Berichten Sie im Befundteil, was gesagt wurde; der Vergleich mit der Literatur gehört in die Diskussion.

## Häufige Fehler

- **Forschungsfragen als Interviewfragen verwenden:** Die Forschungsfrage ist, was Sie beantworten wollen; Interviewfragen sind erfahrungsnahe Fragen, die Teilnehmende verstehen.
- **Codes mit Themen verwechseln:** „Negative Ansichten“ ist eine Kategorie, kein Thema. Ein Thema trägt Bedeutung und Interpretation.
- **Die Analyse nicht beschreiben:** Berichten Sie, wie Sie kodiert haben, wie viele Codes und Themen entstanden und wie hoch die Übereinstimmung war.
- **Zitate aneinanderreihen:** Schreiben Sie vor und nach jedem Zitat einen kurzen Kommentar, der es mit dem Thema verbindet.

## Kurz gesagt

Die Stärke einer qualitativen Studie liegt in gut gestalteten offenen Fragen, sorgfältiger Kodierung und transparentem Berichten. Begründen Sie Ihr Design, erklären Sie die Zahl der Teilnehmenden über die Sättigung, folgen Sie den sechs Phasen der thematischen Analyse und beschreiben Sie Ihre Strategien zur Vertrauenswürdigkeit konkret. Wenn Sie wissen möchten, wie sich die Stichprobenbestimmung unterscheidet, lesen Sie unseren [Leitfaden zur Stichprobengröße](/de/blog/stichprobengroesse-berechnen).`,
  },
  "yapay-zeka-uydurma-kaynak-tespiti": {
    slug: "ki-erfundene-quellen-erkennen",
    title: "Von KI erfundene Quellen erkennen",
    seoTitle: "Von KI erfundene Quellen erkennen: so geht's",
    description: "Schritt für Schritt erfundene Quellen von ChatGPT und ähnlichen Werkzeugen entlarven: mit DOI, Registrierungsagenturen und Konsistenzprüfungen.",
    keywords: ["erfundene Quellen", "KI erfundene Zitate", "erfindet ChatGPT Quellen", "DOI prüfen", "Quellen verifizieren"],
    cta: { text: "Fügen Sie Ihr Literaturverzeichnis ein; jeder Eintrag wird über DOI und Registrierungsagenturen geprüft, wahrscheinlich erfundene Quellen werden markiert. Ohne Registrierung.", label: "Meine Quellen prüfen" },
    body: `Fragen Sie einen allgemeinen KI-Chatbot „Kannst du mir 10 Quellen zu diesem Thema nennen?“, erhalten Sie unter Umständen Literaturangaben, die es nicht gibt, die aber völlig überzeugend aussehen. Die Namen ähneln echten Forschenden, die Zeitschrift existiert, Jahr und Seiten stimmen scheinbar – doch der Artikel ist nie erschienen. Man spricht von „Halluzination“, und in einer Abschlussarbeit kann das zu ernsten Problemen der wissenschaftlichen Integrität führen. Dieser Leitfaden erklärt, warum erfundene Quellen entstehen und wie Sie sie erkennen.

## Warum erfindet KI Quellen?

Große Sprachmodelle durchsuchen keine Datenbank. Sie erzeugen auf Basis der Texte aus dem Training, „wie eine Literaturangabe aussehen sollte“. Dabei können sie:

- den Namen einer echten Person mit einer zu ihrem Fach passenden Zeitschrift kombinieren,
- den Titel eines vorhandenen Artikels abwandeln und so einen neuen erzeugen,
- eine echte DOI einem anderen Artikel zuordnen,
- stimmig wirkende Band-, Heft- und Seitenzahlen erfinden.

Das Modell tut das nicht böswillig; es hat schlicht keinen Zugriff auf geprüfte Informationen. Das Ergebnis ist aber, dass Sie eine nicht existierende Studie zitieren – ein ernstes Glaubwürdigkeitsproblem, sobald Prüfende oder Gutachtende es bemerken.

## Typische Anzeichen einer erfundenen Quelle

Keines dieser Anzeichen beweist allein eine Fälschung, aber jedes erfordert eine Prüfung:

- **Keine DOI, oder die DOI führt zu einer anderen Publikation.** Die meisten in den letzten Jahren erschienenen Zeitschriftenartikel haben eine DOI.
- **Ein zu „perfekter“ Titel.** Ein Titel, der Ihrer Forschungsfrage wortwörtlich entspricht und alle Ihre Schlüsselwörter enthält, sollte misstrauisch machen.
- **Autor:in passt nicht zum Fach.** Die Person existiert, arbeitet aber in einem ganz anderen Gebiet.
- **Zeitschrift passt nicht zum Thema.** Etwa ein bildungspolitischer Artikel in einer Ingenieurzeitschrift.
- **Band und Jahr widersprechen sich.** Der Band, den die Zeitschrift in diesem Jahr herausgab, passt nicht zur Angabe.
- **Nirgends auffindbar.** Eine Titelsuche in Google Scholar, im Zeitschriftenarchiv und in Datenbanken bleibt ergebnislos.

## Schritt-für-Schritt-Prüfung

### 1. Die DOI prüfen

Hat die Angabe eine DOI, öffnen Sie sie im Browser, indem Sie sie hinter „doi.org/“ setzen. Prüfen Sie zweierlei:

- Führt die DOI zu einer Publikation?
- Stimmen Titel, Autor:innen und Jahr dieser Publikation mit Ihrer Angabe überein?

**Eine funktionierende DOI reicht nicht.** Ein häufiges Muster erfundener Quellen ist eine echte DOI, die zu einem völlig anderen Artikel gehört.

### 2. Nach dem Titel suchen

Gibt es keine DOI, suchen Sie den Titel in Anführungszeichen in Google Scholar, Crossref und den Datenbanken Ihres Fachs. Für türkische Quellen nutzen Sie DergiPark und TR Dizin, für Abschlussarbeiten das nationale Thesenzentrum des YÖK. Wie Sie dort suchen, erklärt unser [Leitfaden zu DergiPark, TR Dizin und dem YÖK-Thesenzentrum](/de/blog/dergipark-tr-dizin-yok-recherche).

### 3. Das Archiv der Zeitschrift prüfen

Rufen Sie die Website der Zeitschrift auf, öffnen Sie das betreffende Heft des betreffenden Jahres und prüfen Sie, ob der Artikel dort steht. Das ist die eindeutigste Prüfung.

### 4. Die Publikationsliste der Person ansehen

Sehen Sie auf der Institutsseite, im ORCID- oder Google-Scholar-Profil nach. Steht der Artikel nicht in der Liste, ist er vermutlich erfunden.

### 5. Den Inhalt prüfen

Selbst wenn eine Quelle echt ist, kann die KI ihr **einen Befund zuschreiben, den sie nicht enthält**. Gleichen Sie den zitierten Satz mit Abstract oder Volltext ab. Das ist bei Aussagen mit Zahlen entscheidend (etwa „68 % der Teilnehmenden …“).

## Wenn die Quelle echt ist, die Angaben aber falsch

Manchmal existiert die Quelle, aber die KI irrt bei Jahr, Reihenfolge der Autor:innen oder Seitenzahlen. Dann müssen Sie die Quelle nicht streichen; korrigieren Sie die Angaben anhand des offiziellen Datensatzes der Zeitschrift oder von Crossref. Mit den richtigen Angaben formatieren Sie sie in unserem [kostenlosen Literaturverzeichnis-Generator](/de/araclar/kaynakca-olusturucu) im gewünschten Zitierstil.

## KI richtig einsetzen, wenn Sie mit Quellen arbeiten

KI ist weit verlässlicher, wenn Sie sie **zur Arbeit mit bereits gefundenen Quellen** einsetzen, nicht zum Finden von Quellen. Ein sichererer Ablauf:

1. Suchen Sie in echten Fachdatenbanken (Google Scholar, DergiPark, OpenAlex, PubMed, ERIC …).
2. Lesen Sie Abstracts oder Volltexte der Funde.
3. Lassen Sie die KI diese Quellen zusammenfassen oder vergleichen oder eine Literaturmatrix erstellen.
4. Zitieren Sie beim Schreiben nur Quellen, die Sie tatsächlich gelesen und geprüft haben.

Die ethische Seite dieses Vorgehens behandeln wir ausführlich in [Ist KI beim Schreiben der Abschlussarbeit ethisch?](/de/blog/ki-fuer-abschlussarbeit-ethisch)

## Hinweis für Betreuende und Prüfende

Einige erfundene Quellen im Literaturverzeichnis sind ein starkes Indiz dafür, dass der Text ohne Kontrolle mit KI erstellt wurde. DOI und Titel von fünf bis zehn zufällig gewählten Quellen zu prüfen, ergibt in wenigen Minuten ein Bild. Für die ganze Liste lassen sich Werkzeuge zur Sammelprüfung nutzen.

## Kurz gesagt

Übernehmen Sie nie eine von KI vorgeschlagene Quelle ungeprüft in Ihre Arbeit. Prüfen Sie, ob die DOI zur richtigen Publikation führt, ob der Titel in Datenbanken auftaucht, ob der Artikel im Archiv der Zeitschrift steht und ob die zitierte Information wirklich in der Quelle steht. Statt eine lange Liste einzeln zu prüfen, fügen Sie sie in unsere [Prüfung auf erfundene Quellen](/de/araclar/uydurma-kaynak-kontrolu) ein: Jede Angabe wird bei den Registrierungsagenturen nachgeschlagen, verdächtige werden markiert. Der Schreibassistent von Academiana zitiert nur verifizierte, Ihrem Projekt hinzugefügte Quellen; er erfindet keine Literaturangaben.`,
  },
};
