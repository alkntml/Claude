import type { BlogPostEn } from "./types";

const CALL = "\n\n## Maßgeblich ist die aktuelle Ausschreibung\n\nTermine, Förderbeträge, Voraussetzungen und Formularvorlagen können sich von Ausschreibung zu Ausschreibung ändern. Dieser Leitfaden beschreibt allgemeine Schreibprinzipien; für Termine, Beträge und Bedingungen lesen Sie immer die aktuelle Ausschreibung und den Antragsleitfaden auf der offiziellen Website des Programms.\n";

/** Almanca sürümler, 10. dosya (D200). Tutar ve tarih yok (tests/blog-d200.test.ts). */
export const DE_10: Record<string, BlogPostEn> = {
  "tubitak-1001-arastirma-projesi-nasil-yazilir": {
    slug: "tubitak-1001-forschungsantrag-schreiben",
    title: "TÜBİTAK-1001-Forschungsantrag schreiben: Originalität, Methode und Projektmanagement",
    seoTitle: "TÜBİTAK-1001-Forschungsantrag schreiben – Leitfaden",
    description: "TÜBİTAK-1001-Forschungsantrag: Originalität, Methode, Projektmanagement, Wirkung und Budget so schreiben, wie Gutachterpanels sie bewerten.",
    keywords: ["TÜBİTAK 1001", "1001 Projektantrag", "ARDEB Forschungsförderung", "Forschungsförderung Türkei", "Originalität im Antrag", "Arbeitspakete und Risiken"],
    cta: { text: "Wählen Sie im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das Programm 1001; alle Abschnitte von der Originalität bis zum Budget stehen bereit.", label: "1001-Antrag vorbereiten" },
    body: `Das TÜBİTAK-Programm 1001 zur Förderung wissenschaftlicher und technologischer Forschungsprojekte gehört zu den Förderprogrammen, bei denen Forschende in der Türkei am häufigsten Anträge stellen. Die Anträge werden von Fachgutachterinnen und -gutachtern der TÜBİTAK-Abteilung für Forschungsförderung (ARDEB) in Panels bewertet. Grundlage sind meist die Hauptabschnitte des Antrags: **Originalität, Methode, Projektmanagement und Wirkung**. Dieser Leitfaden zeigt, wie Sie jeden Abschnitt aus Sicht des Panels schreiben.

## Wie Gutachtende einen Antrag lesen

Gutachtende lesen viele Anträge in kurzer Zeit. Ein guter Antrag beantwortet auf den ersten Seiten:

- Welche Frage beantwortet das Projekt, und warum ist sie wichtig?
- Warum hat die Literatur sie noch nicht beantwortet?
- Kann die Methode sie wirklich beantworten?
- Kann das Team das Projekt in Zeit und Budget abschließen?
- Welche konkreten Ergebnisse gibt es am Ende?

Bauen Sie jeden Abschnitt so, dass er eine dieser Fragen beantwortet.

## Originalität

Die Originalität ist das Herz des Antrags. Sie hat drei Teile:

1. **Bedeutung des Themas:** Problem und Relevanz mit aktuellen, verlässlichen Quellen.
2. **Forschungslücke:** Zeigen Sie klar, was bekannt ist und was nicht. Statt „dazu gibt es keine Studien“ schreiben Sie überprüfbar: „Bisherige Studien beschränken sich auf … Stichproben.“
3. **Forschungsfragen und Hypothesen:** Konkrete Fragen, die die Lücke schließen.

Originalität heißt nicht „neues Thema“; auch eine neue Methode, Stichprobe, ein neuer Kontext oder theoretischer Blick kann originell sein. Entscheidend ist, den Unterschied klar zu zeigen. Siehe unseren [Leitfaden zu Forschungsfrage und Hypothese](/de/blog/forschungsfrage-und-hypothesen-formulieren) und zum Aufzeigen der Lücke unseren [Leitfaden zur Literaturmatrix](/de/blog/literaturmatrix-erstellen).

## Methode

Die Methode zeigt, wie jede Forschungsfrage beantwortet wird. Gutachtende suchen die Verbindung zwischen Frage und Methode:

- Design und Begründung
- Stichprobe und Berechnung der Stichprobengröße ([Leitfaden zur Stichprobengröße](/de/blog/stichprobengroesse-berechnen))
- Instrumente mit Angaben zu Validität und Reliabilität
- Analyse und welche Frage mit welcher Analyse beantwortet wird
- Ethikvotum und Genehmigungen

Zeigen Sie die Machbarkeit: Sind Labor, Software oder Zugang zu Teilnehmenden vorhanden? Ergebnisse einer Vorstudie sind ein starker Beleg.

## Projektmanagement: Arbeitspakete und Risiken

Teilen Sie das Projekt in Arbeitspakete mit Dauer, Verantwortlichen und Erfolgskriterium:

| Arbeitspaket | Dauer | Verantwortlich | Erfolgskriterium |
| --- | --- | --- | --- |
| Literatur und Design | Monat 1–3 | Projektleitung | Erhebungsprotokoll fertig |
| Datenerhebung | Monat 4–12 | Mitarbeitende, Stipendiat | Geplante Stichprobe erreicht |
| Analyse | Monat 13–16 | Projektleitung, Mitarbeitende | Analysebericht fertig |
| Publikation und Bericht | Monat 17–18 | Gesamtes Team | Artikel eingereicht, Abschlussbericht abgegeben |

Die Tabelle ist ein Beispiel; die Dauer richtet sich nach Projekt und Ausschreibung. Schreiben Sie für jedes wichtige Risiko einen Plan B: Was, wenn sich die Erhebung verzögert, ein Gerät ausfällt oder jemand das Team verlässt?

## Wirkung

Wirkung beschreibt, wen die Ergebnisse wie erreichen. Nennen Sie konkrete Ergebnisse:

- Wissenschaftlich: Artikel, Tagungsbeiträge, Abschlussarbeiten
- Wirtschaftlich oder gesellschaftlich: Leitfäden für die Praxis, Politikempfehlungen, Produkte oder Software
- Kapazität: im Projekt ausgebildete Nachwuchsforschende, aufgebaute Infrastruktur
- Folgeprojekte: nationale oder internationale Anträge, die das Projekt ermöglicht

Schreiben Sie messbare Ziele statt allgemeiner Sätze wie „wird einen wichtigen Beitrag leisten“.

## Budgetbegründung

Verknüpfen Sie jeden Budgetposten mit der Methode. Gutachtende fragen: „Wo wird dieses Gerät in der Methode genutzt?“ oder „Warum so viele Reisen?“. Posten ohne Gegenstück in der Methode werden gekürzt und schwächen die Glaubwürdigkeit.

## Häufige Fehler

- Die Lücke in der Originalität nicht mit Quellen belegen
- Forschungsfragen nicht mit der Methode verknüpfen
- Unrealistischer Zeitplan, kein Risikoplan
- Expertise des Teams nicht auf das Projekt beziehen
- Nach einer Ablehnung denselben Antrag ohne Blick auf die Panelkommentare erneut einreichen

Ein abgelehnter Antrag kann verbessert und erneut eingereicht werden; lesen Sie Panelkommentare wie ein Gutachten und gehen Sie im Antrag auf jede Kritik ein. Für eine kurze, fokussierte Vorstudie siehe unseren [Leitfaden zur 1002-A-Schnellförderung](/de/blog/tubitak-1002-a-schnellfoerderung-leitfaden).${CALL}
## 1001-Antrag mit Academiana

Wählen Sie in Academiana den Arbeitstyp „Projektantrag TÜBİTAK / BAP“ und das Programm „TÜBİTAK 1001 Forschungsprojekte“: Originalität, Methode, Projektmanagement, Wirkung und Budget stehen als Abschnitte bereit. Der Assistent hilft, die Lücke mit den echten Quellen Ihres Projekts zu zeigen, und entwirft Arbeitspaket- und Risikotabellen. Budgetbeträge, Laufzeiten und Programmregeln erfindet er nicht; diese prüfen und tragen Sie aus der Ausschreibung ein.`,
  },
  "bap-projesi-nasil-hazirlanir": {
    slug: "bap-projektantrag-hochschule-tuerkei",
    title: "BAP-Projekt beantragen: Leitfaden zur hochschulinternen Forschungsförderung in der Türkei",
    seoTitle: "BAP-Projekt beantragen: Forschungsförderung der Hochschule",
    description: "BAP-Anträge an türkischen Hochschulen: Projektarten, Projekte für Abschlussarbeiten, Richtlinien, Antragsabschnitte und Budgetbegründung.",
    keywords: ["BAP Projekt", "BAP Antrag", "BAP Abschlussarbeit", "Forschungsförderung Hochschule Türkei", "hochschulinterne Forschungsförderung", "Budgetbegründung"],
    cta: { text: "Wählen Sie im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das BAP-Programm; Zusammenfassung, Ziele, Methode, Zeitplan und Budget stehen bereit.", label: "BAP-Antrag vorbereiten" },
    body: `BAP (wissenschaftliche Forschungsprojekte) ist das System, mit dem türkische Hochschulen Forschung ihres Personals und ihrer Promovierenden aus eigenen Mitteln fördern. Material-, Geräte-, Software-, Feld- und Analysekosten von Abschlussarbeiten werden häufig über BAP gedeckt. Weil BAP zugänglicher ist als TÜBİTAK-Förderung, eignet es sich gut für ein erstes eigenes Projekt.

## Jede Hochschule hat eigene Regeln

Das Wichtigste an BAP: Die Regeln unterscheiden sich von Hochschule zu Hochschule. Projektarten, Termine, Fördergrenzen, Formulare und Begutachtung stehen in der **BAP-Richtlinie** der Hochschule und in den Mitteilungen der BAP-Koordinierungsstelle. Vor dem Antrag:

- Lesen Sie die BAP-Richtlinie Ihrer Hochschule vollständig.
- Laden Sie die aktuelle Formularvorlage aus dem Antragssystem.
- Notieren Sie die Bedingungen Ihrer Projektart (wer leiten darf, Rolle der Betreuung bei Projekten zu Abschlussarbeiten, Laufzeit).
- Fragen Sie bei Unklarheiten bei der BAP-Stelle nach; ein zurückgegebener Antrag kostet Zeit.

## Häufige BAP-Projektarten

Die Namen variieren, doch die meisten Hochschulen haben ähnliche Arten:

| Projektart | Für wen | Typischer Zweck |
| --- | --- | --- |
| Projekt zur Abschlussarbeit | Master- und Promotionsstudierende (Betreuung als Leitung) | Erhebungs- und Analysekosten der Arbeit |
| Forschungsprojekt | Wissenschaftliches Personal | Eigenständige Forschungsfrage |
| Einstiegsprojekt | Frisch Promovierte | Erstes eigenständiges Projekt |
| Infrastrukturprojekt | Forschungsgruppen | Geräte und Laborausstattung |
| Ergänzung extern geförderter Projekte | Von TÜBİTAK u. a. geförderte Projekte | Kofinanzierung oder Zusatzkosten |

Bei Projekten zu Abschlussarbeiten leitet meist die Betreuung, die oder der Studierende ist Mitarbeitende; das kann je nach Richtlinie abweichen.

## Abschnitte des Antrags

BAP-Formulare ähneln TÜBİTAK-Anträgen, sind aber kürzer:

1. **Zusammenfassung und Schlagwörter:** Ziel, Methode und erwartetes Ergebnis in einem Absatz.
2. **Ziel und Umfang:** Forschungsfrage und Grenzen des Projekts.
3. **Literatur und Originalität:** Bedeutung und Neuheit, mit Quellen.
4. **Methode:** Design, Stichprobe, Erhebung, Analyse. Bei Projekten zu Abschlussarbeiten lässt sich die Methode des Exposés anpassen; siehe [Leitfaden zum Exposé](/de/blog/forschungsexpose-schreiben).
5. **Zeitplan:** Phasen und Dauer.
6. **Budget und Begründung:** Jeder Posten und warum er nötig ist.
7. **Erwartete Ergebnisse:** Abschlussarbeit, Artikel, Tagungsbeiträge.

## Das Budget begründen

Das Budget ist das häufigste Problem bei BAP-Begutachtungen. Regeln:

- Verknüpfen Sie jeden Posten mit einer Aufgabe der Methode: „Dieses Kit wird für … Proben der im Methodenteil beschriebenen … Analyse benötigt.“
- Fügen Sie ein aktuelles Angebot oder einen Katalogpreis bei; viele Hochschulen verlangen eine Proformarechnung.
- Nehmen Sie keine Posten auf, die die Richtlinie nicht fördert (an manchen Hochschulen Computer, Möbel oder persönliche Ausgaben).
- Beantragen Sie nichts, was vorhandene Infrastruktur abdeckt; nennen Sie diese stattdessen im Antrag.

## Ethikvotum und Genehmigungen

Projekte mit menschlichen Teilnehmenden oder Tierversuchen brauchen meist vor dem Antrag oder vor Projektbeginn ein Ethikvotum. Prüfen Sie, wann Ihre Richtlinie es verlangt, und planen Sie es ein: [Leitfaden zum Ethikantrag](/de/blog/ethikantrag-stellen).

## Während und nach dem Projekt

Beschaffungen folgen dem Vergaberecht der Hochschule und dauern; planen Sie sie früh ein. Zwischen- und Abschlussberichte können verlangt werden. Die meisten Richtlinien verlangen, die BAP-Förderung (mit Projektnummer) in Publikationen anzugeben. BAP-Erfahrung belegt Ihre Fähigkeit zur Projektleitung bei späteren Anträgen für [TÜBİTAK 1001](/de/blog/tubitak-1001-forschungsantrag-schreiben) oder [2209-A](/de/blog/tubitak-2209-a-antrag-leitfaden).

## Häufige Fehler

- Die Vorlage einer anderen Hochschule nutzen, ohne die eigene Richtlinie zu lesen
- Das Exposé unverändert ins BAP-Formular kopieren
- Unbegründetes oder überhöhtes Budget
- Beschaffungszeit im Zeitplan vergessen
- Die BAP-Förderung in Ergebnissen nicht angeben${CALL.replace("auf der offiziellen Website des Programms", "bei der BAP-Stelle Ihrer Hochschule")}
## BAP-Antrag mit Academiana

Wählen Sie in Academiana den Arbeitstyp „Projektantrag TÜBİTAK / BAP“ und das Programm „Projekt aus dem Forschungsfonds der Hochschule (BAP)“: Zusammenfassung, Ziele, Methode, Zeitplan und Budgetbegründung stehen bereit. Liegt Ihre Abschlussarbeit in Academiana, hilft der Assistent, den Methodenteil an den Antrag anzupassen. Budgetbeträge und Richtlinienregeln erfindet er nicht; diese prüfen und tragen Sie selbst ein.`,
  },
  "tubitak-2214-a-2219-yurt-disi-arastirma-bursu": {
    slug: "tubitak-2214-a-2219-forschungsstipendium-ausland",
    title: "TÜBİTAK 2214-A und 2219 Auslandsforschungsstipendien: So schreiben Sie den Forschungsplan",
    seoTitle: "TÜBİTAK 2214-A und 2219: Forschungsplan schreiben",
    description: "TÜBİTAK-Auslandsstipendien 2214-A (Promotion) und 2219 (Postdoc): Einladungsschreiben, Forschungsplan und Wahl der Gastinstitution.",
    keywords: ["TÜBİTAK 2214-A", "TÜBİTAK 2219", "Forschungsstipendium Ausland", "Postdoc-Stipendium", "Einladungsschreiben", "Forschungsplan schreiben"],
    cta: { text: "Wählen Sie im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das „Forschungsexposé für eine Stipendienbewerbung“; Ziel, Methode, Zeitplan und erwarteter Beitrag stehen bereit.", label: "Forschungsplan vorbereiten" },
    body: `Die Auslandsforschungsstipendien von TÜBİTAK ermöglichen Forschenden aus der Türkei einen Forschungsaufenthalt an einer ausländischen Einrichtung. Dieser Leitfaden behandelt die zwei gefragtesten Programme: **2214-A** für Promovierende und **2219** für promovierte Forschende. In beiden stehen ein **Forschungsplan**, der beschreibt, was Sie im Ausland tun, und ein **Einladungsschreiben** der Gastinstitution im Mittelpunkt.

## Unterschied der beiden Programme

| | 2214-A | 2219 |
| --- | --- | --- |
| Für wen | Promovierende | Promovierte Forschende |
| Ziel | Einen Teil der Dissertationsforschung im Ausland durchführen | Eigenständige Forschung im Ausland |
| Fokus des Forschungsplans | Bezug zur Dissertation und welcher Teil im Ausland erfolgt | Eigenes Projekt und Karriereentwicklung |
| Zentrale Unterlagen | Zustimmung der Betreuung und Einladung des Gastgebers | Einladung des Gastgebers |

Dauer, monatliche Beträge und Bedingungen wie Sprachnachweise stehen in der Ausschreibung und können sich ändern.

## Gastinstitution und Gastgeber wählen

Die Stärke der Bewerbung hängt stark vom richtigen Gastgeber ab:

1. **Passung:** Wählen Sie Forschende oder Gruppen mit Publikationen direkt zu Ihrer Forschungsfrage. Gutachtende fragen: „Warum diese Einrichtung?“
2. **Mehrwert:** Zeigen Sie, dass der Gastgeber Methode, Daten, Geräte oder Expertise bietet, die Sie zu Hause nicht haben.
3. **Kontakt:** Die erste E-Mail enthält eine kurze Vorstellung, eine einabsätzige Zusammenfassung der Idee, warum Sie gerade dort arbeiten wollen, und Ihren Lebenslauf. Serien-E-Mails bleiben meist unbeantwortet.
4. **Zeitpunkt:** Ein Einladungsschreiben kann Wochen dauern; beginnen Sie Monate vor der Ausschreibung.

## Was ins Einladungsschreiben gehört

Ein gutes Einladungsschreiben sagt mehr als „wir nehmen an“. Es stärkt die Bewerbung, wenn es enthält:

- Forschungsthema und Beitrag des Gastgebers
- Dauer und Zeitraum des Aufenthalts
- Bereitgestellte Ressourcen (Büro, Labor, Daten, Bibliothek)
- Unterschrift des Gastgebers und Angaben zur Einrichtung

Ein Entwurf mit diesen Punkten erleichtert dem Gastgeber die Arbeit; der Brief muss echte, vom Gastgeber bestätigte Angaben enthalten.

## Aufbau des Forschungsplans

1. **Ziel und Bedeutung:** Forschungsfrage und Beitrag zum Fach.
2. **Literatur und Lücke:** Kurz, belegt und aktuell. Siehe [Leitfaden zur Literaturmatrix](/de/blog/literaturmatrix-erstellen).
3. **Methode:** Welche Daten, Methoden oder Geräte im Ausland genutzt werden. Bei 2214-A klar begründen, warum dieser Teil der Dissertation im Ausland erfolgen muss.
4. **Zeitplan:** Was Monat für Monat geschieht.
5. **Erwartete Ergebnisse:** Artikel, gemeinsame Publikationen, ein Dissertationskapitel, neue Kooperationen.
6. **Beitrag nach der Rückkehr:** Wie Wissen und Kontakte in Ihre Arbeit und Einrichtung in der Türkei einfließen.

## Die Stimmigkeit, die Gutachtende suchen

Forschungsplan, Einladungsschreiben, Lebenslauf und (bei 2214-A) Exposé der Dissertation müssen zusammenpassen. Im Plan genannte Geräte sollten im Brief vorkommen, der Zeitplan zu den Daten im Brief passen und die versprochenen Methoden durch Ihre Erfahrung gedeckt sein.

## Häufige Fehler

- Gastgeber nur nach dem Ruf der Einrichtung wählen
- Die Arbeit im Ausland nicht konkretisieren („Literaturrecherche“ reicht nicht)
- Zu breiter Plan: Schlagen Sie ein fokussiertes, in der Zeit machbares Arbeitspaket vor
- Den Beitrag nach der Rückkehr nicht beschreiben
- Das Einladungsschreiben auf die letzte Woche verschieben

Weitere Möglichkeiten im Ausland zeigen unsere Leitfäden zu [Fulbright](/de/blog/fulbright-stipendium-bewerbung-schreiben) und zum [Marie-Skłodowska-Curie-Postdoc-Stipendium](/de/blog/msca-postdoctoral-fellowship-antrag-schreiben).${CALL}
## Forschungsplan mit Academiana

Wählen Sie in Academiana im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das „Forschungsexposé für eine Stipendienbewerbung“: Ziel, Literatur, Methode, Zeitplan und erwarteter Beitrag stehen bereit. Liegt Ihre Dissertation in Academiana, hilft der Assistent, Methode und Literatur an den Plan anzupassen. Gastinstitutionen, Termine und Stipendienbedingungen erfindet er nicht; diese tragen Sie selbst ein.`,
  },
  "nsf-grfp-basvurusu-nasil-yazilir": {
    slug: "nsf-grfp-bewerbung-personal-statement",
    title: "NSF-GRFP-Bewerbung: Personal Statement und Research Plan schreiben",
    seoTitle: "NSF GRFP: Personal Statement und Research Plan",
    description: "Bewerbung für das US-Stipendium NSF GRFP: Voraussetzungen, Intellectual Merit und Broader Impacts, die zwei Statements und Empfehlungsschreiben.",
    keywords: ["NSF GRFP", "NSF GRFP Personal Statement", "NSF Research Plan", "Intellectual Merit Broader Impacts", "Graduiertenstipendium USA", "Stipendium Bewerbung USA"],
    cta: { text: "Wählen Sie im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das Programm „Andere Institution / anderer Fonds“ und schreiben Sie Ihren Forschungsplan mit Ziel, Methode und Wirkung.", label: "Forschungsplan schreiben" },
    body: `Das NSF GRFP (National Science Foundation Graduate Research Fellowship Program) ist ein traditionsreiches Stipendium der US-amerikanischen National Science Foundation für Graduierte in Naturwissenschaften, Technik, Ingenieurwesen und Mathematik (MINT), MINT-Didaktik und einigen Sozialwissenschaften. Als eines der bekanntesten US-Graduiertenstipendien gilt seine Bewerbung als Vorbild für Bewerbungstexte vieler Programme. Dieser Leitfaden erklärt den Aufbau der Bewerbung und die beiden zentralen Texte.

## Zuerst die Voraussetzungen prüfen

Bewerben können sich nur Personen, die bestimmte Bedingungen erfüllen. Laut Ausschreibung müssen sie **US-Staatsangehörige, US Nationals oder Personen mit dauerhaftem Aufenthaltsrecht in den USA** sein; auch Studienphase und geförderte Fächer sind eingeschränkt. Internationale Studierende ohne dauerhaftes Aufenthaltsrecht können sich nicht bewerben; für sie eignen sich internationale Programme wie [Fulbright](/de/blog/fulbright-stipendium-bewerbung-schreiben). Lesen Sie die aktuellen Bedingungen immer in der offiziellen Ausschreibung (program solicitation).

Die Bewertungslogik des GRFP ist dennoch ein gutes Modell für Statements bei Bewerbungen an US-Graduiertenprogramme und Labore.

## Zwei Bewertungskriterien

Die NSF bewertet alle Bewerbungen nach zwei Kriterien:

- **Intellectual Merit:** Potenzial der Forschung, das Wissen voranzubringen, sowie Forschungspotenzial und Vorbereitung der Person.
- **Broader Impacts:** Nutzen von Forschung und Person für die Gesellschaft: Bildung, Wissenschaftskommunikation, breitere Teilhabe an der Wissenschaft, gesellschaftlicher Nutzen.

Beide Kriterien sind **gleich gewichtet**. Der häufigste Fehler ist, Broader Impacts auf einen angehängten Schlussabsatz zu reduzieren. Gutachtende wollen beide Kriterien durchgängig mit konkreten Belegen sehen.

## Personal Statement

Das Personal Statement ist keine Lebensgeschichte, sondern belegt Ihre Vorbereitung als Forschende und Ihr Potenzial für Broader Impacts:

1. **Forschungserfahrung:** Was haben Sie in welchen Projekten getan, welche Probleme gelöst? Was war das Ergebnis (Poster, Artikel, Vortrag)?
2. **Broader Impacts bisher:** Mentoring, Lehre, Wissenschaftskommunikation, Engagement. Beschreiben Sie Tätigkeit und Ergebnis mit Zahlen („wöchentliche Lerngruppe für … Studierende“).
3. **Ziele:** Studien- und Karriereziele und wie das Stipendium dabei hilft.

Verknüpfen Sie jeden Absatz mit einem oder beiden Kriterien. Die Begriffe Intellectual Merit und Broader Impacts als Zwischenüberschriften erleichtern das Lesen.

## Graduate Research Plan

Der Research Plan beschreibt die Forschung, die Sie im Graduiertenstudium vorhaben. Er ist nicht bindend, muss aber machbar und originell sein:

- **Einleitung und Bedeutung:** Problem und Relevanz, mit Quellen.
- **Forschungsfrage und Hypothese:** Konkret und prüfbar.
- **Methode:** Mit welchen Experimenten, Daten oder Modellen geprüft wird; mögliche Probleme und Alternativen.
- **Intellectual Merit:** Was trägt die Forschung zum Wissen bei?
- **Broader Impacts:** Wie erreichen die Ergebnisse die Gesellschaft, und was tun Sie dafür?

Siehe unseren [Leitfaden zu Forschungsfrage und Hypothese](/de/blog/forschungsfrage-und-hypothesen-formulieren). Quellen müssen echt und geprüft sein; Gutachtende sind Fachleute.

## Empfehlungsschreiben

Die Bewerbung wird durch Empfehlungsschreiben von Personen ergänzt, die Sie kennen. Sprechen Sie sie früh an und schicken Sie Lebenslauf, Entwürfe Ihrer Statements und einen kurzen Hinweis, welche Forschungs- und Engagementerfahrungen sie hervorheben sollten.

## Häufige Fehler

- Ohne Prüfung der Voraussetzungen vorbereiten
- Broader Impacts mit allgemeinen Sätzen abhandeln („Ich werde Wissenschaft vermitteln“)
- Das Personal Statement zur emotionalen Geschichte ohne Forschungsbelege machen
- Die Methode im Research Plan vage lassen
- Seitenbegrenzung und Formatregeln nicht einhalten${CALL}
## Forschungsplan mit Academiana

Wählen Sie in Academiana im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das Programm „Andere Institution / anderer Fonds“ und schreiben Sie Ihren Forschungsplan; die Oberfläche gibt es auch auf Englisch. Der Assistent zitiert nur die echten Quellen Ihres Projekts und markiert Stellen, an denen eine Quelle fehlt; Programmregeln, Seitenbegrenzungen oder Termine erfindet er nicht.`,
  },
  "marie-curie-msca-doktora-sonrasi-burs-basvurusu": {
    slug: "msca-postdoctoral-fellowship-antrag-schreiben",
    title: "Marie-Skłodowska-Curie-Postdoc-Stipendium (MSCA PF): So schreiben Sie den Antrag",
    seoTitle: "MSCA Postdoctoral Fellowship: Antrag schreiben",
    description: "Horizon Europe MSCA Postdoctoral Fellowships: Mobilitätsregel, Wahl von Gastinstitution und Betreuung, Abschnitte Excellence, Impact und Implementation.",
    keywords: ["MSCA Postdoctoral Fellowship", "Marie-Curie-Stipendium", "MSCA PF Antrag", "Horizon Europe Stipendium", "Postdoc-Stipendium Europa", "Excellence Impact Implementation"],
    cta: { text: "Wählen Sie im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das Programm „Andere Institution / anderer Fonds“ und gliedern Sie Ihren Antrag nach Excellence, Impact und Implementation.", label: "Antrag vorbereiten" },
    body: `Die Marie-Skłodowska-Curie-Maßnahmen (MSCA) fördern im Rahmen von **Horizon Europe**, dem EU-Rahmenprogramm für Forschung und Innovation, die Mobilität und Karriereentwicklung von Forschenden. **MSCA Postdoctoral Fellowships (PF)** finanzieren promovierten Forschenden ein eigenes Projekt an einer Gastinstitution in einem anderen Land und gehören zu den kompetitivsten Postdoc-Stipendien Europas. Auch die Türkei ist als assoziiertes Land an Horizon Europe beteiligt; prüfen Sie den aktuellen Stand auf der offiziellen Programmseite.

## Vor dem Antrag: Voraussetzungen und Mobilität

Zwei Bedingungen sind zentral:

- **Erfahrung:** Zum Stichtag ist eine Promotion nötig, und seit der Promotion darf eine festgelegte Zeit nicht überschritten sein. Zeitraum und Ausnahmen (z. B. Elternzeit) legt jede Ausschreibung fest.
- **Mobilitätsregel:** Die forschende Person darf in einem festgelegten Zeitraum vor dem Stichtag nicht länger als eine bestimmte Zeit im Land der Gastinstitution gelebt oder gearbeitet haben. Deshalb können Sie sich nicht an einer Einrichtung in Ihrem aktuellen Land bewerben.

Stipendienarten (European, Global), Laufzeiten und Details stehen in Ausschreibung und Antragsleitfaden.

## Gastinstitution und Betreuung wählen

Der Antrag wird von der forschenden Person und der Betreuung an der Gastinstitution gemeinsam erstellt. Eine gute Passung bietet:

- Eine Betreuung mit starkem Bezug zu Ihrem Thema, aber nicht derselben Expertise: Gutachtende suchen **Wissenstransfer in beide Richtungen**. Was bringen Sie mit, was lernen Sie?
- Publikationen, Projekte und Mentoring-Erfahrung der Betreuung, die das Projekt stützen
- Infrastruktur und Weiterbildungsangebote der Einrichtung

Kontaktieren Sie mögliche Betreuende Monate vor dem Stichtag mit einer kurzen, persönlichen E-Mail: Projektzusammenfassung in einem Absatz, warum gerade dort, Lebenslauf.

## Aufbau: drei Bewertungskriterien

Der fachliche Teil folgt den drei Bewertungskriterien:

| Abschnitt | Worauf Gutachtende achten |
| --- | --- |
| **Excellence** | Originalität und Fortschritt über den Stand der Forschung hinaus, solide Methodik, Wissenstransfer in beide Richtungen, Qualität von Betreuung und Weiterbildung |
| **Impact** | Beitrag zur Karriere, Verbreitung und Kommunikation der Ergebnisse, Umfang der wissenschaftlichen und gesellschaftlichen Wirkung |
| **Implementation** | Arbeitsplan und Arbeitspakete, Risiken und Gegenmaßnahmen, Eignung und Ressourcen der Gastinstitution |

Da nach diesen Überschriften bewertet wird, verwenden Sie die Unterüberschriften der Vorlage vollständig und in derselben Reihenfolge.

### Excellence

Beschreiben Sie Forschungsziele, Lücke und warum Ihr Ansatz innovativ ist. Gehen Sie in der Methodik auf die Punkte der Vorlage ein, etwa Interdisziplinarität, Open-Science-Praktiken (Datenmanagement, Open Access) und die Geschlechterdimension in der Forschung. Belegen Sie die Lücke mit Quellen: [Leitfaden zur Literaturmatrix](/de/blog/literaturmatrix-erstellen).

### Impact

Beschreiben Sie konkret den Karrierenutzen: Welche neuen Fähigkeiten gewinnen Sie, was ist Ihr Ziel nach dem Stipendium? Planen Sie Verbreitung (Publikationen, Konferenzen) und Kommunikation (Aktivitäten für die Öffentlichkeit) getrennt und mit messbaren Zielen.

### Implementation

Zeigen Sie Arbeitspakete, Meilensteine und Ergebnisse in einem Gantt-Diagramm. Nennen Sie Risiken mit Wahrscheinlichkeit und Auswirkung und je eine Gegenmaßnahme. Beschreiben Sie Infrastruktur und Unterstützung der Gastinstitution.

## Häufige Fehler

- Gastgeber wählen, ohne die Mobilitätsregel zu prüfen
- Excellence zur Literaturzusammenfassung machen
- Wissenstransfer nur in eine Richtung beschreiben („ich werde lernen“)
- Allgemeine Sätze im Impact-Teil
- Überschriftenstruktur oder Seitenzahl der Vorlage ändern

Abgelehnte Anträge erhalten einen Bewertungsbericht; viele gehen auf die Kritik ein und bewerben sich in der nächsten Runde erneut. TÜBİTAK-Optionen für Forschung im Ausland zeigt unser [Leitfaden zu 2214-A und 2219](/de/blog/tubitak-2214-a-2219-forschungsstipendium-ausland).${CALL}
## MSCA-Antrag mit Academiana

Wählen Sie in Academiana im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das Programm „Andere Institution / anderer Fonds“ und gliedern Sie den Antrag nach Excellence, Impact und Implementation; die Oberfläche gibt es auch auf Englisch. Der Assistent entwirft Arbeitspaket- und Risikotabellen und zitiert nur die echten Quellen Ihres Projekts; Voraussetzungen, Beträge oder Termine erfindet er nicht.`,
  },
  "fulbright-bursu-basvurusu-nasil-yapilir": {
    slug: "fulbright-stipendium-bewerbung-schreiben",
    title: "Fulbright-Bewerbung: Personal Statement und Study/Research Objective schreiben",
    seoTitle: "Fulbright-Stipendium: Bewerbungstexte schreiben",
    description: "Fulbright-Stipendien für Studium und Forschung in den USA: Programmarten, Personal Statement, Study/Research Objective, Gutachten und Auswahlgespräch.",
    keywords: ["Fulbright Stipendium", "Fulbright Bewerbung", "Fulbright Personal Statement", "Fulbright Study Objective", "Fulbright Auswahlgespräch", "Stipendium USA Master"],
    cta: { text: "Wählen Sie im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das „Forschungsexposé für eine Stipendienbewerbung“ und schreiben Sie Ihr Study/Research Objective Abschnitt für Abschnitt.", label: "Bewerbungstext schreiben" },
    body: `Fulbright ist ein internationales Stipendienprogramm für den Bildungsaustausch zwischen den USA und anderen Ländern. Es wird in jedem Land von einer binationalen Kommission oder der US-Botschaft getragen, in Deutschland von der Deutsch-Amerikanischen Fulbright-Kommission, in der Türkei von der Türkisch-Amerikanischen Bildungskommission (Fulbright Türkiye). Es gibt Programme für Master- und Promotionsstudium, Forschungsaufenthalte während der Promotion, Postdoc-Forschung und Lehre. Am wichtigsten sind das **Personal Statement**, in dem Sie sich und Ihre Ziele vorstellen, und das **Study bzw. Research Objective**, das beschreibt, was Sie in den USA tun werden.

## Programmarten

Die Stipendienarten unterscheiden sich nach Land und Jahr; meist gibt es diese Gruppen:

| Art | Für wen | Fokus der Texte |
| --- | --- | --- |
| Master-/Promotionsstudium | Wer ein Graduiertenprogramm in den USA absolvieren will | Warum dieses Fach, warum die USA, Beitrag nach der Rückkehr |
| Forschung während der Promotion | Promovierende im Heimatland | Der Teil der Dissertation, der in den USA erfolgt |
| Postdoc- und Seniorforschung | Promovierte und Hochschullehrende | Forschungsprojekt und Gastinstitution |

Welche Programme offen sind, die Voraussetzungen (Staatsangehörigkeit, Sprachtest, Studienstand) und Termine veröffentlicht jedes Jahr die offizielle Fulbright-Website Ihres Landes.

## Personal Statement

Das Personal Statement erzählt, wer Sie sind und welcher Weg Sie zu dieser Bewerbung geführt hat, ohne den Lebenslauf zu wiederholen:

1. **Einstieg:** Eine konkrete Erfahrung oder Frage, die Sie zum Fach geführt hat. Vermeiden Sie Klischees („Schon als Kind …“).
2. **Entwicklung:** Zwei, drei Beispiele aus Studium und Beruf, die direkt zu Ihrem Ziel führen. Beschreiben Sie jeweils, was Sie getan und gelernt haben.
3. **Werte und Gemeinschaft:** Passend zum interkulturellen Ziel von Fulbright Ihre Erfahrungen mit verschiedenen Gemeinschaften und Ihr Beitrag.
4. **Zukunft:** Wohin das Stipendium Sie führt und welchen Beitrag Sie nach der Rückkehr leisten.

## Study oder Research Objective

Dieser Text beschreibt genau, was Sie in den USA tun:

- **Für Studienbewerbungen:** Welches Fach und welche Art von Programm; warum diese Programme zu Ihrem Ziel passen; konkrete Beispiele für Kurse, Labore oder Lehrende.
- **Für Forschungsbewerbungen:** Forschungsfrage, Methode, Gastinstitution und Verhältnis zum Gastgeber, Zeitplan und erwartete Ergebnisse. Der Aufbau ähnelt einem Exposé: [Leitfaden zum Exposé](/de/blog/forschungsexpose-schreiben).

Beantworten Sie in beiden Fällen „Warum die USA?“ konkret: ein Programm, eine Methode, Daten oder Expertise, die es zu Hause nicht gibt.

## Balance zwischen beiden Texten

Die Texte sollen sich ergänzen, nicht wiederholen. Das Personal Statement beantwortet „warum Sie?“, das Objective „was und wie?“. Zusammen gelesen zeigen sie einen stimmigen Weg von Ihrer Vergangenheit zu Ihrem Ziel.

## Gutachten

Bitten Sie Personen um Gutachten, die Sie akademisch oder beruflich gut kennen. Schicken Sie ihnen Entwürfe Ihrer Texte und die Eigenschaften, die sie hervorheben sollten, damit die Gutachten dieselbe Geschichte stützen.

## Vorbereitung auf das Auswahlgespräch

Wer in die engere Wahl kommt, wird eventuell zum Gespräch eingeladen. Zur Vorbereitung:

- Lesen Sie Ihre Texte erneut; Fragen beziehen sich darauf.
- Bereiten Sie kurze, konkrete Antworten vor: Warum dieses Fach, warum die USA, was tun Sie nach der Rückkehr?
- Seien Sie bereit, über eine aktuelle Entwicklung in Ihrem Fach zu sprechen.
- Beantworten Sie Fragen zu interkultureller Erfahrung mit Beispielen.

## Häufige Fehler

- Denselben Text als Personal Statement und Objective verwenden
- Allgemeine Antworten auf „Warum die USA?“ („die besten Universitäten der Welt“)
- Den Beitrag nach der Rückkehr vage lassen
- Wort für Wort aus der Muttersprache übersetzen; siehe die Übersetzungstipps in unserem [Leitfaden zum Abstract](/de/blog/abstract-schreiben)
- Wort- oder Zeichengrenzen überschreiten

Zur Bewertungslogik des US-Stipendiums der NSF siehe unseren [Leitfaden zum NSF GRFP](/de/blog/nsf-grfp-bewerbung-personal-statement), zu den Auslandsstipendien von TÜBİTAK unseren [Leitfaden zu 2214-A und 2219](/de/blog/tubitak-2214-a-2219-forschungsstipendium-ausland).${CALL}
## Bewerbungstext mit Academiana

Wählen Sie in Academiana im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das „Forschungsexposé für eine Stipendienbewerbung“ und schreiben Sie Ihr Study/Research Objective Abschnitt für Abschnitt; die Oberfläche gibt es auch auf Englisch. Der Assistent hilft beim Kürzen und Schärfen; Erfahrungen, Erfolge, Einrichtungen oder Quellen erfindet er nicht.`,
  },
  "tubitak-2204-b-ortaokul-proje-nasil-hazirlanir": {
    slug: "tubitak-2204-b-forschungsprojekt-mittelstufe",
    title: "TÜBİTAK 2204-B: Forschungsprojekt in der Mittelstufe vorbereiten – Leitfaden für Schüler und Lehrkräfte",
    seoTitle: "TÜBİTAK 2204-B: Schülerforschungsprojekt vorbereiten",
    description: "TÜBİTAK-2204-B-Wettbewerb für die Mittelstufe: Frage finden, einfaches Experiment, Projekttagebuch, Berichtsteile und die Rolle der Erwachsenen.",
    keywords: ["TÜBİTAK 2204-B", "Schülerforschungsprojekt", "Experiment planen Schule", "Projekttagebuch", "Forschungsbericht Schule", "betreuende Lehrkraft"],
    cta: { text: "Wählen Sie im Arbeitstyp „Projektantrag TÜBİTAK / BAP“ das Programm 2204-B; die Berichtsteile stehen bereit, Messwerte werden zu Tabellen und Diagrammen.", label: "2204-B-Bericht vorbereiten" },
    body: `Der TÜBİTAK-Wettbewerb 2204-B ist ein türkischer Wissenschaftswettbewerb, bei dem Schülerinnen und Schüler der Mittelstufe mit einer betreuenden Lehrkraft eigene Forschungsprojekte erarbeiten und ausstellen. In diesem Alter sucht die Jury keine große Erfindung, sondern **eine neugierige Frage, die Schritt für Schritt mit wissenschaftlicher Methode beantwortet wird**. Dieser Leitfaden richtet sich an Schülerinnen und Schüler, Lehrkräfte und Eltern. Für den Wettbewerb der Oberstufe siehe unseren [Leitfaden zu 2204-A](/de/blog/tubitak-2204-a-schuelerforschungsprojekt-leitfaden).

## Woher kommt eine gute Projektfrage?

Die besten Fragen kommen aus dem Alltag. Lassen Sie das Kind den Satz ergänzen: „Ich wollte schon immer wissen, ob …“

- „… dieselbe Pflanze im Schulgarten im Schatten und in der Sonne gleich schnell wächst?“
- „… Kinder, die frühstücken, in der ersten Stunde aufmerksamer sind als Kinder ohne Frühstück?“
- „… Tee in Bechern aus unterschiedlichem Material gleich schnell abkühlt?“

Eine gute Frage hat drei Merkmale:

1. **Messbar:** Die Antwort lässt sich mit einer Zahl, Beobachtung oder einem Vergleich finden.
2. **Machbar:** In Schule oder zu Hause, sicher, mit einfachen Materialien, in wenigen Wochen.
3. **Die eigene Frage:** Das Kind kann sie in eigenen Worten erklären und will die Antwort wirklich wissen.

## Ein einfaches Experiment aufbauen

So lässt sich die wissenschaftliche Methode in der Mittelstufe umsetzen:

| Schritt | Was tun? | Beispiel (Becher und Tee) |
| --- | --- | --- |
| Frage | Aufschreiben, was man herausfinden will | In welchem Becher kühlt Tee am schnellsten ab? |
| Vermutung (Hypothese) | Ergebnis vorher schätzen | Im Metallbecher am schnellsten |
| Was verändert wird | Nur eine Sache verändern | Material des Bechers |
| Was gemessen wird | Was, womit? | Temperatur nach 10 Minuten, mit Thermometer |
| Was gleich bleibt | Bei jedem Versuch gleich | Teemenge, Anfangstemperatur, Raum |
| Wiederholung | Wie oft? | Dreimal pro Becher |

Der häufigste Fehler: mehrere Dinge gleichzeitig verändern. Ändert sich **nur eine Sache**, versteht man, warum das Ergebnis so ausfällt.

## Ein Projekttagebuch führen

Das Projekttagebuch ist das Dokument, dem die Jury am meisten vertraut; es zeigt, dass das Kind selbst gearbeitet hat. An jedem Arbeitstag wird notiert:

- Datum und was getan wurde
- Messwerte (als Tabelle)
- Beobachtungen und Unerwartetes
- Probleme und wie sie gelöst wurden
- Fotos

Es darf handschriftlich sein; wichtig ist, dass es echt und regelmäßig geführt ist, nicht ordentlich.

## Teile des Projektberichts

Der Bericht soll kurz und einfach sein. Meist werden diese Teile erwartet; prüfen Sie die aktuelle Vorlage der Ausschreibung:

1. **Projekttitel:** Ein kurzer Titel, der die Frage nennt.
2. **Ziel:** Was man herausfinden will, in ein, zwei Sätzen.
3. **Einleitung:** Was man zum Thema gelesen hat und warum die Frage wichtig ist. Quellen (Bücher, Lexika, verlässliche Websites) angeben.
4. **Methode:** Was getan wurde, welche Materialien, was wie gemessen wurde, so klar, dass andere es wiederholen können.
5. **Ergebnisse:** Messwerte in Tabellen und einfachen Diagrammen.
6. **Fazit und Diskussion:** Stimmte die Vermutung? Warum könnte es so gekommen sein? Welche Schwächen hatte das Projekt, wie lässt es sich verbessern?
7. **Quellen**

Diagramme brauchen Titel, Achsenbeschriftung und Einheiten. Säulendiagramme eignen sich für Vergleiche, Liniendiagramme für Veränderungen über die Zeit.

## Rolle von Lehrkräften und Eltern

- Die **betreuende Lehrkraft** hilft beim Eingrenzen der Frage, beim sicheren Aufbau des Experiments und beim Ordnen des Berichts; sie macht das Projekt nicht anstelle des Kindes.
- **Eltern** unterstützen mit Material und Zeit. Ein von Eltern geschriebener Bericht fällt bei den Fragen der Jury sofort auf.
- Die Jury spricht mit dem Kind: „Warum hast du das so gemacht?“, „Was hättest du gedacht, wenn das Ergebnis anders gewesen wäre?“ Die wichtigste Vorbereitung ist, alles in eigenen Worten erklären zu können.

## Sicherheit und Ethik

- Versuche mit Strom, Feuer, Chemikalien oder scharfen Werkzeugen nur unter Aufsicht Erwachsener oder lieber gar nicht.
- Werden Menschen befragt oder gemessen, braucht es ihre Zustimmung und gegebenenfalls die der Eltern; Namen gehören nicht in den Bericht.
- Vermeiden Sie Versuche, die Tieren schaden könnten; Pflanzen und unbelebte Materialien sind für die Mittelstufe am besten geeignet.

Lesen Sie die Ethikregeln des Wettbewerbs in der Ausschreibung.

## Ausstellung und Präsentation

Kommt das Projekt in die Ausstellung, bereiten Sie eine Zwei-Minuten-Erklärung vor: meine Frage, was ich getan habe, was ich herausgefunden habe, was ich gelernt habe. Auf dem Poster wenig Text, große Diagramme und Fotos. Das Projekttagebuch mitbringen.

## Häufige Fehler

- Eine zu große Frage wählen („Wie stoppen wir den Klimawandel?“)
- Den Versuch nur einmal durchführen
- Mehrere Dinge gleichzeitig verändern
- Ein Projekt aus dem Internet genau nachmachen
- Das Ergebnis ändern, weil es nicht zur Vermutung passt: Auch unerwartete Ergebnisse sind wertvoll${CALL}
## 2204-B-Bericht mit Academiana

Wählen Sie in Academiana den Arbeitstyp „Projektantrag TÜBİTAK / BAP“ und das Programm 2204-B: Die Berichtsteile stehen bereit, der Budgetteil entfällt, weil der Wettbewerb keinen hat. Der Assistent schreibt in einfacher Sprache und hilft, die Frage einzugrenzen und Messwerte in Tabellen und Diagramme zu verwandeln. Er erstellt das Projekt nicht anstelle des Kindes und erfindet keine Ergebnisse oder Daten eines nicht durchgeführten Versuchs; wo Daten fehlen, bleibt eine Lücke.`,
  },
};

