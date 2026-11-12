import type { LegalContent } from "./types";

/** Hukuki metinler (DE). Türkçe asıldan (GDPR: İngilizce asıldan) çeviridir. Kaynak PDF metni: docs/legal/yasal-metinler-2026-11-13.txt (tests/legal.test.ts Türkçe metnin kelimesi kelimesine aynı olduğunu denetler). */
export const CONTENT: LegalContent = {
 "kvkk": [
  {
   "h": "Einleitung und Verantwortlicher",
   "b": [
    {
     "p": "Diese Datenschutzinformation wurde erstellt, um über die Verarbeitung personenbezogener Daten bei der Nutzung der unter www.academiana.com.tr angebotenen Plattform Academiana zu informieren. Academiana ist eine KI-gestützte Online-Plattform, die Prozesse der wissenschaftlichen Recherche und des wissenschaftlichen Schreibens unterstützt. Die Firma sowie die Zustellungs-/Antragsanschrift der natürlichen oder juristischen Person, die für den Betrieb der Plattform verantwortlich ist, sind nicht angegeben, da in diesem Entwurf keine verifizierten Angaben vorliegen. Vor der Veröffentlichung müssen die Identität des Verantwortlichen und der Antragsweg nach dem KVKK (türkisches Datenschutzgesetz) eindeutig ergänzt werden."
    }
   ]
  },
  {
   "h": "Kategorien verarbeiteter personenbezogener Daten",
   "b": [
    {
     "p": "Nach der derzeitigen Funktionsweise der Plattform können folgende Datenkategorien verarbeitet werden:"
    },
    {
     "ul": [
      "Identität und Kontakt: Vor- und Nachname, E-Mail-Adresse sowie die von der Nutzerin bzw. dem Nutzer freiwillig angegebene Institution.",
      "Konto und Authentifizierung: E-Mail-Konto, Daten zur Passwortprüfung sowie bei Anmeldung mit Google/Apple die vom jeweiligen Anbieter erhaltenen Angaben zu Name und E-Mail. Das Passwort wird in der Supabase-Infrastruktur in nicht umkehrbarer Form gespeichert; die Plattform zeigt das Passwort nicht im Klartext an.",
      "Wissenschaftliche Inhalte: Arbeiten, Abschnitte, Versionsverlauf, Kommentare, Quellen und Notizen.",
      "Dateien und Dateiinhalte: PDF-, Word-, Excel-/CSV-Dateien und daraus extrahierte Texte.",
      "KI-Interaktionen: Nachrichten der Nutzerin bzw. des Nutzers, Antworten des Assistenten und der zur Erbringung des Dienstes verwendete Arbeitskontext.",
      "Nutzungs- und Vorgangsprotokolle: der vollständige Text der KI-Ausgaben, Datum, Name der Arbeit/des Abschnitts, Wortzahl; Zähler für Token, Kosten, Recherchen und Seiten; Löschprotokolle.",
      "Geräte- und Sicherheitsdaten: eine im Browser erzeugte zufällige Gerätekennung, deren auf dem Server gespeicherter, nicht umkehrbarer Hashwert sowie das Datum der ersten/letzten Sichtung.",
      "Nutzungsprotokolle für den Tarif „Tek Proje“ (Einzelprojekt): Wortzahl beim Download, ein nicht wiederherstellbarer Hashwert des Textes und Angaben des Titelblatts (Autorin/Autor, Universität, Fachbereich und Name der Betreuungsperson).",
      "Zahlungs-/Tarifzuweisungsdaten: Name und Telefonnummer der zahlenden Person, Betrag und Notiz. Kartendaten werden nicht in das System von Academiana eingegeben.",
      "Einladungs- und Freigabedaten: E-Mail für Einladungen von Mitautorinnen und Mitautoren; Zugriffs- und Kommentarangaben über den Link für die Betreuung.",
      "Daten zur institutionellen Lizenz: institutionelle Mitgliedschaft, Nutzungsstatistiken und institutionelle Vorgangsprotokolle.",
      "Support- und technische Protokolle: Feedback-/Fehlermeldung der Nutzerin bzw. des Nutzers und zugehörige technische Fehlerinformationen.",
      "Besuchsstatistiken: besuchte Seite, verweisende Website, Kampagnenkennzeichen, Gerätetyp, Sprache der Oberfläche und ein täglich wechselnder anonymer Code.",
      "Benachrichtigungen innerhalb der Website und Antragsprotokolle."
     ]
    }
   ]
  },
  {
   "h": "Zwecke der Verarbeitung",
   "b": [
    {
     "p": "Personenbezogene Daten werden zu folgenden Zwecken verarbeitet: Begründung der Mitgliedschaft und Verwaltung des Kontos, Authentifizierung, Bereitstellung des wissenschaftlichen Arbeitsbereichs und der Dateidienste, Ausführung der KI-Funktionen, Bereitstellung der Quellensuche und Zitierfunktionen, Durchführung statistischer Analysen, Abwicklung der Freigabe an Mitautorinnen, Mitautoren und Betreuende, Verwaltung von Tarifen und Nutzungsrechten, Zuweisung des Tarifs nach der Zahlung, Kundensupport, Gewährleistung der Sicherheit und Verhinderung von Missbrauch, Erkennung technischer Probleme, Messung der Dienstleistung und Erfüllung rechtlicher Pflichten. Daten werden nicht verkauft und nicht zur gezielten Werbung verwendet. Es wurde mitgeteilt, dass auf der Plattform keine Drittanbieter-Cookies für Analyse- oder Werbezwecke verwendet werden."
    }
   ]
  },
  {
   "h": "Art der Datenerhebung",
   "b": [
    {
     "p": "Die Daten werden elektronisch erhoben über die Registrierungs- und Anmeldebildschirme, die Inhalte, die die Nutzerin bzw. der Nutzer auf der Plattform schreibt oder hochlädt, die von ihr bzw. ihm veranlasste Freigabe- und Zahlungskommunikation, die von der Plattform automatisch erzeugten Nutzungs-/Sicherheitsprotokolle sowie die im Gerätespeicher erzeugte zufällige Gerätekennung."
    }
   ]
  },
  {
   "h": "Speicherdauer",
   "b": [
    {
     "p": "Konto, wissenschaftliche Inhalte, Dateien, Unterhaltungen, Zähler, der Hashwert der Gerätekennung und Benachrichtigungen werden grundsätzlich bis zur Löschung des Kontos gespeichert. Eine Einladung als Mitautorin bzw. Mitautor wird innerhalb von 14 Tagen ungültig; der Einladungsdatensatz kann zusammen mit der Arbeit gespeichert bleiben. Der Freigabelink für die Betreuung bleibt zugänglich, bis die Nutzerin bzw. der Nutzer ihn widerruft. Nutzungsnachweise werden im derzeitigen System bis zur Löschung des Kontos gespeichert; es wurde mitgeteilt, dass für die in den Texten genannte Frist von 12 Monaten keine automatische Löschung angewendet wird. Feedback- und Fehlerprotokolle können unbefristet gespeichert werden; bei Löschung des Kontos wird ihre Verknüpfung mit der Person entfernt, der Textinhalt kann jedoch bestehen bleiben. Besuchsstatistiken werden unbefristet gespeichert. Die Aufbewahrung von Zahlungsdaten unterliegt den anwendbaren steuer- und handelsrechtlichen Pflichten. Ein rechtskonformer endgültiger Zeitplan für diese Fristen muss festgelegt und erforderlichenfalls ein automatischer Löschmechanismus eingerichtet werden."
    }
   ]
  },
  {
   "h": "Empfängergruppen und Übermittlung ins Ausland",
   "b": [
    {
     "p": "Im Rahmen der Erbringung des Dienstes können Daten übermittelt werden an Supabase für Datenbank-, Authentifizierungs- und Dateispeicherdienste, an Vercel für Hosting- und Auslieferungsdienste sowie bei Nutzung von KI-Funktionen an Anthropic (Claude). Eine OpenAI-Integration ist im Code optional vorhanden; da nicht bestätigt ist, ob sie in der Live-Umgebung genutzt wird, betrachtet dieser Text OpenAI nicht als aktiven Empfänger. Google und Apple sind nur dann am Authentifizierungsprozess beteiligt, wenn die betreffende Social-Login-Methode gewählt wird. Bei der Suche nach wissenschaftlichen Quellen können Suchbegriffe und DOIs an Quellendienste wie OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, DataCite, ERIC, DBLP, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP und Unpaywall gesendet werden; es wurde mitgeteilt, dass die Identität der Nutzerin bzw. des Nutzers nicht an diese Suchdienste übermittelt wird. Ist ein Schlüssel hinterlegt, können auch die Dienste Springer Nature, IEEE und NASA ADS genutzt werden. Auf Wunsch der Nutzerin bzw. des Nutzers kann eine LaTeX-Datei an Overleaf übermittelt werden; es wurde mitgeteilt, dass bei der Zotero-Integration der eingegebene Schlüssel nicht gespeichert wird. Die Zahlungskommunikation kann über WhatsApp erfolgen."
    }
   ]
  },
  {
   "h": "Datenstandorte im Ausland",
   "b": [
    {
     "p": "Laut Informationsnotiz werden die Supabase-Daten in der Region Frankfurt/Europäische Union und die Hosting-Server von Vercel in Frankfurt gehalten; zudem wird das globale CDN-Netz von Vercel genutzt. Supabase und Vercel sind Unternehmen mit Sitz in den USA. Bei Nutzung einer KI-Funktion werden der Text der Nutzerin bzw. des Nutzers, der Arbeitskontext und ausgewählte Quellen-/Dateiauszüge an Anthropic in den USA übermittelt. Ein Teil der wissenschaftlichen Datenbanken befindet sich im Ausland. Für jede dieser Übermittlungen muss ein rechtlicher Mechanismus eingerichtet werden, der den Vorschriften des KVKK zur Übermittlung ins Ausland entspricht."
    }
   ]
  },
  {
   "h": "Hinweis zu Daten Dritter und besonderen Kategorien personenbezogener Daten",
   "b": [
    {
     "p": "Von Nutzerinnen und Nutzern hochgeladene Abschlussarbeiten, Interviewtranskripte, Umfragen oder andere Dokumente können personenbezogene Daten Dritter oder besondere Kategorien personenbezogener Daten enthalten. Die Nutzerin bzw. der Nutzer sollte prüfen, ob sie bzw. er die erforderliche rechtliche Befugnis hat, diese Daten auf die Plattform hochzuladen und zu verarbeiten, die betroffenen Personen informiert hat und die erforderlichen rechtlichen Voraussetzungen erfüllt. Bei Forschungsumfragen kann gegenüber den Teilnehmenden die forschende Person, die die Untersuchung durchführt, Verantwortlicher sein; Academiana kann hinsichtlich des betreffenden Dienstes in der Position eines Auftragsverarbeiters sein. Die Rollen der Parteien sollten nach der konkreten Nutzung und dem Vertrag bestimmt werden. Unnötige Identitätsangaben, Gesundheitsdaten und andere sensible Informationen sollten nicht auf die Plattform hochgeladen werden."
    }
   ]
  },
  {
   "h": "Automatische Überwachung und menschliche Prüfung",
   "b": [
    {
     "p": "Um die Möglichkeit von Missbrauch zu erkennen, können Nutzungsmuster automatisch überwacht und Warnungen für Administratorinnen und Administratoren erzeugt werden. Das System trifft allein keine automatische Sperrentscheidung; die Warnung wird von einem Menschen geprüft und entschieden. Die betroffene Person kann dem Verantwortlichen einen Auskunfts- und Widerspruchsantrag zu der sie betreffenden Verarbeitung übermitteln."
    }
   ]
  },
  {
   "h": "Rechte der betroffenen Person und Antragstellung",
   "b": [
    {
     "p": "Betroffene Personen können ihre Rechte nach Artikel 11 KVKK ausüben. Auf der Plattform können Nutzerinnen und Nutzer über die Kontoseite ihre Daten im JSON-Format herunterladen, ihr Konto und die mit dem Konto verbundenen Daten löschen sowie eine Datenanfrage stellen. Es wurde mitgeteilt, dass Datenanfragen innerhalb von 30 Tagen kostenlos beantwortet werden. Die E-Mail-/KEP-/Postanschrift, an die Anträge zu richten sind, ist in diesem Entwurf nicht angegeben, da sie in der Informationsnotiz nicht enthalten ist; der Antragsweg muss vor der Veröffentlichung ergänzt werden."
    }
   ]
  },
  {
   "h": "Aktualisierung",
   "b": [
    {
     "p": "Dieser Text kann entsprechend den tatsächlichen Datenverarbeitungstätigkeiten der Plattform und Änderungen der Rechtslage aktualisiert werden. Wesentliche Änderungen werden der Nutzerin bzw. dem Nutzer auf geeignete Weise mitgeteilt. Erfordert ein neuer Zweck oder eine neue rechtliche Voraussetzung dies, werden die erforderlichen Informations- und Einwilligungsprozesse gesondert durchgeführt."
    }
   ]
  }
 ],
 "terms": [
  {
   "h": "Geltungsbereich und Art der Leistung",
   "b": [
    {
     "p": "Diese Bedingungen regeln die Nutzung der über www.academiana.com.tr angebotenen Plattform Academiana. Academiana bietet Werkzeuge zur Unterstützung wissenschaftlicher Arbeit, etwa KI-gestützte Textvorschläge und -bearbeitung, Suche nach wissenschaftlichen Quellen, Erstellung von Zitaten/Literaturverzeichnissen, statistische Analyse, Erstellung und Durchführung von Umfragen, Word-/PDF-/LaTeX-Ausgabe, gemeinsames Schreiben, schreibgeschützte Freigabe an die Betreuung, Verteidigungsprobe, systematische PRISMA-Übersichtsarbeit, Aussagenprüfung und Übersetzung. Die Plattform ersetzt keine akademische Betreuung, Universität, Begutachtung, keinen Verlag und keine Plagiatsprüfungsstelle."
    }
   ]
  },
  {
   "h": "Kontoerstellung und Sicherheit",
   "b": [
    {
     "p": "Die Registrierung kann per E-Mail oder über Google/Apple erfolgen. Es wird eine E-Mail-Bestätigung durchgeführt. Die Nutzerin bzw. der Nutzer ist verpflichtet, korrekte und aktuelle Angaben zu machen, die Sicherheit des Kontos zu wahren und das Konto nicht mit anderen zu teilen. Das Konto darf nicht auf andere übertragen oder zur gemeinsamen Nutzung überlassen werden. Für temporäre E-Mail-Adressen wird keine Einladungsprämie gewährt. Die Nutzerin bzw. der Nutzer haftet für Vorgänge in ihrem bzw. seinem Konto im Umfang des eigenen Verschuldens."
    }
   ]
  },
  {
   "h": "Tarife, Entgelte und Nutzungsrechte",
   "b": [
    {
     "p": "Auf der Plattform können ein kostenloser Tarif, monatliche kostenpflichtige Tarife, ein einmaliger Tarif „Tek Proje“ (Einzelprojekt) und eine institutionelle Lizenz angeboten werden. Umfang, Preis, Dauer, Nutzungsgrenzen und Download-Rechte der Tarife richten sich nach der aktuellen Tarifbeschreibung, die der Nutzerin bzw. dem Nutzer vor dem Kauf oder der Tarifzuweisung mitgeteilt wird. Monatliche Nutzungsrechte können anhand der KI-Nutzung, der Quellenrecherchen und der Anzahl der mit KI erstellten Seiten berechnet werden. Bei der Seitenberechnung gilt 1 Seite als 344 Wörter. Ist ein Kontingent aufgebraucht, stoppt nur die betreffende Funktion; die Arbeit wird weder gelöscht noch gesperrt. Die Nutzerin bzw. der Nutzer kann die Arbeit ansehen, bearbeiten und in den vom Tarif erlaubten Formaten herunterladen. Auch wenn der von der KI erzeugte Text später gelöscht wird, wird das entsprechende Nutzungsrecht nicht wiederhergestellt."
    }
   ]
  },
  {
   "h": "Nutzerinhalte und geistiges Eigentum",
   "b": [
    {
     "p": "Die Nutzerin bzw. der Nutzer erklärt, Inhaberin bzw. Inhaber der Rechte an den auf die Plattform hochgeladenen oder dort erstellten Inhalten zu sein oder über die zur Nutzung der Inhalte erforderlichen Genehmigungen zu verfügen. Es dürfen keine Materialien hochgeladen werden, die Urheber-, Persönlichkeits-, Privatsphäre- und Datenschutzrechte Dritter verletzen. Academiana darf Nutzerinhalte nur technisch verarbeiten, um den Dienst zu erbringen, die Sicherheit zu gewährleisten und die von der Nutzerin bzw. dem Nutzer angeforderten Funktionen auszuführen. Diese Bestimmung bedeutet nicht, dass die Plattform Eigentumsrechte an Nutzerinhalten erwirbt. Der rechtliche Status von KI-Ausgaben und Rechte Dritter werden nach dem anwendbaren Recht und dem konkreten Inhalt beurteilt; die Nutzerin bzw. der Nutzer ist verpflichtet, die Ausgabe vor der Verwendung zu prüfen."
    }
   ]
  },
  {
   "h": "Freigabe und Zusammenarbeit",
   "b": [
    {
     "p": "Die Inhaberin bzw. der Inhaber einer Arbeit kann Mitautorinnen und Mitautoren mit den Rollen „kann bearbeiten“ oder „kann kommentieren“ einladen. Mitautorinnen und Mitautoren sehen die Arbeit, die Quellen und die Kommentare; auf die privaten Dateien und Assistentenunterhaltungen der Inhaberin bzw. des Inhabers haben sie keinen Zugriff. Der Freigabelink für die Betreuung ermöglicht Personen, die den Link besitzen, die Arbeit ohne Anmeldung zu lesen und Kommentare zu schreiben. Daher sollte der Link nur mit Personen geteilt werden, die Zugriff haben sollen, und widerrufen werden, sobald er nicht mehr benötigt wird. Bei einer institutionellen Lizenz kann die Administration der Institution die Mitgliederliste und Nutzungsstatistiken sehen; die wissenschaftlichen Arbeitsinhalte der Nutzerinnen und Nutzer kann sie nicht sehen."
    }
   ]
  },
  {
   "h": "KI und wissenschaftliche Richtigkeit",
   "b": [
    {
     "p": "KI-Ausgaben sind probabilistischer Natur; sie können Fehler, Lücken, Fehlinterpretationen oder veraltete Informationen enthalten. Werkzeuge wie Quellenverifizierung, Prüfung von DOI-/PMID-/arXiv-Kennungen und Aussagenprüfung helfen, das Fehlerrisiko zu verringern; sie garantieren keine absolute Richtigkeit. Auf welcher Zugriffsstufe Quellen geprüft wurden, kann auf der Plattform angezeigt werden. Die Nutzerin bzw. der Nutzer muss bibliografische Angaben, Seitenzahlen, direkte Zitate, statistische Ergebnisse und wissenschaftliche Aussagen an der Originalquelle überprüfen. Da die Plattform keinen lizenzierten Plagiatsdienst anbietet, gibt sie weder einen Plagiatsprozentsatz noch eine Garantie auf Plagiatsfreiheit."
    }
   ]
  },
  {
   "h": "Verbotene und unzulässige Nutzungen",
   "b": [
    {
     "p": "Die Plattform darf nicht genutzt werden, um wissenschaftliche Arbeiten im Namen anderer zu erstellen oder wissenschaftliches Fehlverhalten zu erleichtern, Plagiate zu begehen, Quellen/Daten/Statistiken zu erfinden, das Konto einer anderen Person zu nutzen, Sicherheitsmaßnahmen zu umgehen, dem Dienst zu schaden, rechtswidrige Inhalte zu verarbeiten oder Rechte Dritter zu verletzen. Die Nutzerin bzw. der Nutzer muss die KI-Nutzungsregeln der eigenen Institution und des Verlags einhalten und die Nutzung von KI angeben, wo dies erforderlich ist."
    }
   ]
  },
  {
   "h": "Verwaltung, Kontrolle und Sperrung",
   "b": [
    {
     "p": "Die Administration des Dienstes kann Konten sperren, Tarife zuweisen, Benachrichtigungen innerhalb der Website senden, Nutzungsprotokolle und KI-Ausgabetexte prüfen sowie die von der Nutzerin bzw. dem Nutzer angeforderten Datenexporte durchführen. Im Rahmen von Sicherheits- und Missbrauchskontrollen können automatische Warnungen erzeugt werden; das Konto wird nicht automatisch gesperrt. Die Warnung wird von einem Menschen geprüft. Im Ergebnis kann entschieden werden, dass kein Problem vorliegt, die Nutzerin bzw. der Nutzer verwarnt oder das Konto gesperrt wird. Die Nutzerin bzw. der Nutzer kann die Begründung der Entscheidung verlangen und Einspruch über den Support-Kanal einlegen. Der Antragsweg muss vor der Veröffentlichung eindeutig angegeben werden."
    }
   ]
  },
  {
   "h": "Änderungen des Dienstes und Unterbrechungen",
   "b": [
    {
     "p": "Funktionen, technische Infrastruktur und Tarifumfang der Plattform können weiterentwickelt oder geändert werden. Aufgrund geplanter Wartung, Drittanbietern, der Internetinfrastruktur, Sicherheitsvorfällen oder höherer Gewalt kann es zu vorübergehenden Unterbrechungen des Dienstes kommen. Academiana trifft die erforderlichen Maßnahmen, um Unterbrechungen in angemessenem Umfang zu verringern und die Sicherheit der Nutzerdaten zu gewährleisten. Rechte aus zwingendem Verbraucher- und Datenschutzrecht bleiben unberührt."
    }
   ]
  },
  {
   "h": "Haftung",
   "b": [
    {
     "p": "Academiana bietet Werkzeuge zur Unterstützung wissenschaftlicher Arbeit; es garantiert keinen akademischen Erfolg, keine Annahme, Veröffentlichung, keinen Abschluss, keine Zustimmung einer Ethikkommission, keine bestimmte Note und kein bestimmtes Ergebnis. Die Nutzerin bzw. der Nutzer verwendet die Ausgaben nach eigener Prüfung und kontrolliert ihre Übereinstimmung mit den Regeln der eigenen Institution. Haftung, die gesetzlich nicht beschränkt werden kann, Haftung aus Vorsatz oder grober Fahrlässigkeit sowie zwingende Rechte aus dem Verbraucherrecht bleiben unberührt. Diese Bedingungen dürfen nicht so ausgelegt werden, dass sie die Rechte der Nutzerin bzw. des Nutzers in einem durch zwingendes Recht nicht erlaubten Umfang aufheben."
    }
   ]
  },
  {
   "h": "Änderungen von Entgelten und Bedingungen",
   "b": [
    {
     "p": "Tarifpreise und -bedingungen können geändert werden. Änderungen gelten für neue Käufe und Verlängerungen ab dem der Nutzerin bzw. dem Nutzer vorab mitgeteilten Datum des Inkrafttretens. Der Umfang eines bereits erworbenen Zeitraums oder des unbefristeten Rechts aus dem Tarif „Tek Proje“ wird vorbehaltlich zwingenden Rechts und der beim Kauf mitgeteilten Bedingungen nicht rückwirkend eingeschränkt."
    }
   ]
  },
  {
   "h": "Anwendbares Recht und Sprache",
   "b": [
    {
     "p": "Auf die Nutzungsbedingungen findet türkisches Recht Anwendung. Zwingende Zuständigkeitsregeln am Wohnsitz der Verbraucherin bzw. des Verbrauchers bleiben unberührt. Bei Streitigkeiten gilt das einschlägige Recht hinsichtlich der gesetzlich zuständigen Verbraucherschiedsstellen und Gerichte sowie der allgemein zuständigen Gerichte. Die Plattform kann über türkische, englische und deutsche Oberflächen verfügen. Da in diesem Entwurf keine verbindliche Sprachregelung festgelegt wurde, wird nicht behauptet, dass eine Sprache Vorrang vor den anderen hat; die Sprachregelung muss vor der Veröffentlichung festgelegt werden."
    }
   ]
  },
  {
   "h": "Alter und Annahme",
   "b": [
    {
     "p": "Es wurde mitgeteilt, dass für die Plattform derzeit keine Altersgrenze und kein Altersverifikationsmechanismus besteht. Daher sollten die Zustimmung von Eltern/Vormund und besondere Datenschutzanforderungen in Bezug auf minderjährige Nutzerinnen und Nutzer gesondert geprüft werden. Die Nutzerin bzw. der Nutzer ist verpflichtet, die bei der Registrierung oder Nutzung vorgelegten aktuellen Bedingungen zu prüfen."
    }
   ]
  }
 ],
 "fair_use": [
  {
   "h": "Zweck und Grundsatz",
   "b": [
    {
     "p": "Diese Richtlinie wurde erstellt, um die angemessene und persönliche Nutzung der Tarife zu schützen, die Nachhaltigkeit der Plattform zu gewährleisten und den Zugang anderer Nutzerinnen und Nutzer zum Dienst zu sichern. Der Begriff „unbegrenzt“ bezeichnet die übliche Nutzung einer Person für ihre eigene wissenschaftliche Arbeit; er bedeutet keine unbegrenzte Nutzung für Kontoteilung, Massenproduktion im Namen Dritter oder verschiedene Arbeiten über den Tarifumfang hinaus."
    }
   ]
  },
  {
   "h": "Tarif „Tek Proje“ (Einzelprojekt)",
   "b": [
    {
     "p": "Der Tarif „Tek Proje“ gilt für eine einzige, bei der Zuweisung ausgewählte wissenschaftliche Arbeit und ist zeitlich unbegrenzt. Die unbegrenzte Nutzung gilt nur für die Funktionen im Rahmen dieser Arbeit. KI-Nutzungen außerhalb der Arbeit (zum Beispiel der Umfrageassistent oder die Themensuche) sind auf monatliche Rechte in Höhe des kostenlosen Tarifs begrenzt. Die an den Tarif gebundene Arbeit kann nicht gelöscht und ihre Art nicht geändert werden; eine zweite Arbeit kann nicht angelegt werden."
    }
   ]
  },
  {
   "h": "Verhaltensweisen, die einen Verstoß darstellen können",
   "b": [
    {
     "p": "Folgende Verhaltensweisen sind mit dem Zweck des Tarifs „Tek Proje“ unvereinbar: die Arbeit abzuschließen und zu löschen, um eine neue Arbeit zu beginnen, oder durch Überschreiben derselben Arbeit ein anderes Thema bzw. eine andere Arbeit zu erstellen; das Thema der Arbeit wesentlich zu ändern; im Rahmen des Tarifs Arbeiten für andere zu erstellen; das Konto mit anderen Personen zu teilen; das Recht aus „Tek Proje“ für mehr als eine unabhängige wissenschaftliche Arbeit zu nutzen."
    }
   ]
  },
  {
   "h": "Missbrauchssignale",
   "b": [
    {
     "p": "Das System kann zur Prüfung Warnungen an die Administration erzeugen. Warnsignale können sein: Löschung einer großen Menge an Inhalten nach dem Download; wesentliche Änderung des Inhalts zwischen Downloads; Änderung der Angaben zu Autorin/Autor, Universität oder Betreuung auf dem Titelblatt; Nutzung von vielen Geräten; Erstellung einer ungewöhnlichen Anzahl von Abschnitten; Erzeugung langer KI-Texte ohne Bezug zum Thema der Arbeit. Überschreitet der Kostenindikator 40 % des Tarifentgelts, dient dies nur der Information; allein ist es kein Grund für eine Einschränkung."
    }
   ]
  },
  {
   "h": "Menschliche Prüfung und Entscheidung",
   "b": [
    {
     "p": "Eine Warnung bedeutet nicht, dass das Konto automatisch gesperrt wird. Jede Warnung wird von der Administration geprüft. Im Ergebnis kann entschieden werden, dass kein Verstoß vorliegt, die Nutzerin bzw. der Nutzer um eine Erklärung gebeten oder verwarnt wird. Je nach Art und Schwere des Verstoßes kann das Konto gesperrt werden. Die Nutzerin bzw. der Nutzer kann den Support-Kanal der Plattform nutzen, um die Begründung der Entscheidung zu erfahren und Einspruch einzulegen. Die Kontaktangaben für Support/Anträge müssen vor der Veröffentlichung eindeutig angegeben werden."
    }
   ]
  },
  {
   "h": "Rückerstattung",
   "b": [
    {
     "p": "Wird ein Tarif entgegen dieser Richtlinie genutzt, kann in Fällen, in denen keine gesetzliche Pflicht zur Rückerstattung besteht, eine Rückerstattung unterbleiben. Widerrufs-, Rückzahlungs- und sonstige Rechte der Verbraucherin bzw. des Verbrauchers aus zwingendem Recht bleiben unberührt. Diese Richtlinie hebt gesetzlich vorgeschriebene Rückerstattungen oder Verbraucherrechte nicht auf."
    }
   ]
  },
  {
   "h": "Einladungsprogramm",
   "b": [
    {
     "p": "Die Einladungsprämie wird unter der Bedingung gewährt, dass die eingeladene Person ihre E-Mail-Adresse bestätigt. Für Konten, die vom Gerät der einladenden Person aus erstellt werden, und für temporäre E-Mail-Adressen wird keine Prämie gewährt. Diese Kontrollen dienen der Verhinderung von Missbrauch des Einladungsprogramms."
    }
   ]
  },
  {
   "h": "Aktualisierung",
   "b": [
    {
     "p": "Die Kriterien der fairen Nutzung können entsprechend technischen und betrieblichen Erfordernissen aktualisiert werden. Änderungen, die die Rechte der Nutzerinnen und Nutzer wesentlich berühren, werden in geeigneter Weise bekannt gegeben."
    }
   ]
  }
 ],
 "cookies": [
  {
   "h": "Geltungsbereich",
   "b": [
    {
     "p": "Diese Richtlinie erläutert, zu welchen Zwecken Cookies, Browserspeicher und ähnliche Technologien auf der Website von Academiana verwendet werden. Cookies und ähnliche Technologien können zu Zwecken wie der Aufrechterhaltung der Sitzung, dem Speichern von Einstellungen und der Verhinderung von Missbrauch eingesetzt werden."
    }
   ]
  },
  {
   "h": "Verwendete Technologien",
   "b": [
    {
     "ul": [
      "Supabase-Sitzungscookies: Werden verwendet, um die Sitzung der Nutzerin bzw. des Nutzers offen zu halten und die Authentifizierung aufrechtzuerhalten. Sie sind Erstanbieter-Cookies und für den Betrieb des Dienstes zwingend erforderlich; ihre Dauer hängt vom Sitzungs- und Erneuerungsmechanismus ab.",
      "Cookie acd_did und Browserspeicher: Speichert eine zufällige Gerätekennung zur Verhinderung von Missbrauch (Erkennung von Missbrauch der Einladungsprämie und von Kontoteilung). Auf dem Server werden ein nicht umkehrbarer Hashwert dieser Kennung sowie das Datum der ersten/letzten Sichtung gespeichert. Die Dauer beträgt 400 Tage. Es wird nicht für Werbung verwendet.",
      "Cookie lang: Wird verwendet, um die Sprache der Oberfläche zu speichern; es ist ein funktionales Erstanbieter-Cookie und wird 1 Jahr gespeichert.",
      "localStorage: Kann Einstellungen wie Dunkelmodus, Status der geführten Tour und Offline-Sicherung von Entwürfen auf dem Gerät der Nutzerin bzw. des Nutzers speichern. Diese Daten werden nur im Browserspeicher auf dem Gerät der Nutzerin bzw. des Nutzers gespeichert.",
      "PWA-Service-Worker: Hilft dabei, dass sich die Website offline öffnen lässt."
     ]
    }
   ]
  },
  {
   "h": "Analyse- und Werbetechnologien",
   "b": [
    {
     "p": "Laut Informationsnotiz gibt es auf der Plattform keine Analyse-, Werbe- oder Drittanbieter-Werbecookies. Die Besuchszählung erfolgt ohne Cookies. IP-Adresse und Browserinformationen werden nur kurzzeitig verwendet, um den täglich wechselnden, nicht umkehrbaren Code zu erzeugen; sie werden nicht gespeichert und nicht in einer Weise vorgehalten, die eine Verfolgung derselben Person über mehrere Tage ermöglichen würde. Sendet der Browser ein Do-Not-Track-(DNT)- oder Global-Privacy-Control-(GPC)-Signal, erfolgt keine Besuchszählung."
    }
   ]
  },
  {
   "h": "Gerätekennung und Verwaltung von Einstellungen",
   "b": [
    {
     "p": "Die Gerätekennung wird nicht für Werbung oder zur Erstellung von Nutzerprofilen, sondern zur Sicherheit und zur Verhinderung von Missbrauch verwendet. Gleichwohl sollte gesondert anhand der konkreten technischen Struktur und der Rechtslage geprüft werden, ob die Gerätekennung rechtlich als zwingend erforderliche Technologie gilt und ob sie eine vorherige Einwilligung erfordert. Die Nutzerin bzw. der Nutzer kann Cookies in den Browsereinstellungen löschen oder blockieren; das Blockieren zwingend erforderlicher Sitzungscookies kann jedoch die Anmeldung und die Funktion einiger Plattformfunktionen beeinträchtigen."
    }
   ]
  },
  {
   "h": "Verbindungen zu Dritten",
   "b": [
    {
     "p": "Bei von der Nutzerin bzw. dem Nutzer veranlassten Vorgängen wie der Anmeldung mit Google oder Apple, der Verbindung zu Overleaf/Zotero oder der Zahlungskommunikation über WhatsApp können die eigenen Cookie- und Datenschutzrichtlinien der Dritten gelten. Academiana steuert die Datenverarbeitungstätigkeiten Dritter in deren eigenen Umgebungen nicht."
    }
   ]
  },
  {
   "h": "Änderungen der Richtlinie",
   "b": [
    {
     "p": "Wird ein neues Cookie oder eine ähnliche Technologie eingesetzt, wird diese Richtlinie aktualisiert. Wird eine Technologie eingeführt, für die rechtlich eine vorherige Einwilligung erforderlich ist, wird der erforderliche Einwilligungsmechanismus vor der Aktivierung der Technologie bereitgestellt."
    }
   ]
  }
 ],
 "integrity": [
  {
   "h": "Zweck und Grundprinzip",
   "b": [
    {
     "p": "Academiana ist ein Werkzeug zur Unterstützung von Prozessen der wissenschaftlichen Recherche und des wissenschaftlichen Schreibens. Die Plattform übernimmt keine wissenschaftliche Verantwortung anstelle der Nutzerin bzw. des Nutzers. Für Forschungsfrage, Methode, Daten, Analyse, Interpretation, Quellenauswahl und die Richtigkeit des endgültigen Textes ist die Nutzerin bzw. der Nutzer verantwortlich. Die Regeln der eigenen Universität, des Instituts, der Zeitschrift, des Fördergebers und der Ethikkommission sind einzuhalten."
    }
   ]
  },
  {
   "h": "Auffinden und Verifizieren von Quellen",
   "b": [
    {
     "p": "Die Plattform ist darauf ausgelegt, Quellen aus wissenschaftlichen Datenbanken abzurufen. Die KI kann auf Grundlage der dem Projekt hinzugefügten Quellen zitieren. Keine Quellen, Autorinnen und Autoren, DOIs, Statistiken oder Befunde zu erfinden, ist ein Gestaltungsprinzip; in Abschnitten, die nicht belegt werden können, können Hinweise „[KAYNAK GEREKLİ]“ (Quelle erforderlich) und an Stellen, die Daten erfordern, Hinweise „[VERİ GİRİLECEK]“ (Daten einzutragen) verwendet werden. Dennoch ist die Wahrscheinlichkeit, dass die KI Fehler macht, nicht null. Die Nutzerin bzw. der Nutzer sollte die bibliografischen Angaben und den betreffenden Inhalt jeder Quelle an der Originalquelle prüfen."
    }
   ]
  },
  {
   "h": "Anzeige der Zugriffsstufe",
   "b": [
    {
     "p": "Für Quellen kann angezeigt werden, ob nur der bibliografische Datensatz, das Abstract oder der Volltext geprüft wurde. Seitenzahlen und direkte Zitate sind so ausgelegt, dass sie nur bei Quellen verwendet werden, deren Volltext gelesen wurde. Die Nutzerin bzw. der Nutzer sollte direkte Zitate und Seitenzahlen an der Quelle selbst überprüfen."
    }
   ]
  },
  {
   "h": "Verifizierung von Kennungen und Aussagenprüfung",
   "b": [
    {
     "p": "DOI-Datensätze können über Crossref und DataCite, PMID-Datensätze über Europe PMC und arXiv-Kennungen über arXiv verifiziert werden. Ein nicht verifizierbarer Datensatz wird mit einem Warnhinweis angezeigt. Die Literaturverzeichnisprüfung hilft festzustellen, ob Datensätze tatsächlich existieren. Die Aussagenprüfung kann einordnen, ob ein zitierter Satz von der Quelle gestützt wird: „stützt“, „teilweise“, „stützt nicht“ oder „widerspricht“. Diese Prüfungen sind unterstützender Natur; sie ersetzen nicht die abschließende wissenschaftliche Beurteilung."
    }
   ]
  },
  {
   "h": "Statistische Analyse und Datenintegrität",
   "b": [
    {
     "p": "Statistische Berechnungen auf der Plattform werden anhand der von der Nutzerin bzw. dem Nutzer bereitgestellten Daten durchgeführt; die KI hilft bei der Interpretation der Ergebnisse. Die Nutzerin bzw. der Nutzer sollte die Richtigkeit des Datensatzes, die Variablendefinitionen, die Analyseannahmen, die Stichprobenmerkmale und die berichteten Ergebnisse prüfen. Daten zu erfinden, Ergebnisse zu verfälschen, unerwünschte Befunde zu verbergen oder Analysen wahrheitswidrig darzustellen, ist verboten."
    }
   ]
  },
  {
   "h": "Plagiat und Originalität",
   "b": [
    {
     "p": "Die Plattform bietet keinen lizenzierten Plagiatsprüfungsdienst an und erzeugt keinen Plagiatsprozentsatz. Die Literaturverzeichnisprüfung oder die Aussagenprüfung sollte nicht als Plagiatsprüfung angesehen werden. Die Nutzerin bzw. der Nutzer muss die Regeln zu Zitat, Paraphrase, Quellenangabe und eigenständigem Beitrag einhalten. Für mit KI erstellten Text besteht keine Garantie der Originalität oder Plagiatsfreiheit."
    }
   ]
  },
  {
   "h": "Angabe der KI-Nutzung",
   "b": [
    {
     "p": "Die Nutzerin bzw. der Nutzer muss die Nutzung von KI in geeigneter Weise angeben, wenn die eigene Institution oder der Verlag dies verlangt. Von KI erstellter oder bearbeiteter Text sollte nicht ohne Kontrolle und Verantwortung der Nutzerin bzw. des Nutzers als eigener originärer wissenschaftlicher Beitrag dargestellt werden. Ist die Richtlinie der Institution zur KI-Nutzung unklar, sollte die Nutzerin bzw. der Nutzer eine schriftliche Klarstellung der betreffenden Institution einholen."
    }
   ]
  },
  {
   "h": "Unzulässiges wissenschaftliches Verhalten",
   "b": [
    {
     "p": "Die Arbeit einer anderen Person als eigene auszugeben, eine Abschlussarbeit oder einen Artikel im Namen einer anderen Person zu erstellen, Quellen oder Daten zu erfinden, gefälschte Antworten von Teilnehmenden zu erzeugen, Analyseergebnisse zu verändern, Zitate wahrheitswidrig darzustellen, Anforderungen von Ethikkommission/Einwilligung zu umgehen und die wissenschaftliche Bewertung zu täuschen, ist mit den Zwecken der Plattform unvereinbar."
    }
   ]
  },
  {
   "h": "Qualitätswert",
   "b": [
    {
     "p": "Es wurde mitgeteilt, dass die Methode des Qualitätswerts der Plattform auf der Seite /yontem erläutert wird. KI-Befunde beeinflussen den Qualitätswert nicht. Der Qualitätswert sollte nicht als Garantie für akademische Anerkennung oder wissenschaftliche Gültigkeit ausgelegt werden."
    }
   ]
  },
  {
   "h": "Personenbezogene und sensible Forschungsdaten",
   "b": [
    {
     "p": "Bevor die Nutzerin bzw. der Nutzer Umfrage- oder Forschungsdaten um Identitätsangaben Dritter, Gesundheitsdaten oder andere besondere Kategorien von Daten ergänzt, muss sie bzw. er die erforderlichen Voraussetzungen hinsichtlich Ethikkommission, Information, ausdrücklicher Einwilligung und Datensicherheit erfüllen. Daten von Forschungsteilnehmenden sollten so weit wie möglich anonymisiert oder von identifizierenden Merkmalen befreit werden. Dass Academiana der forschenden Person einen Mustertext für die Einwilligung vorschlägt, hebt deren rechtliche und ethische Verantwortung nicht auf."
    }
   ]
  }
 ],
 "distance": [
  {
   "h": "Wichtiger Hinweis zum Geltungsbereich",
   "b": [
    {
     "p": "Der derzeitige Verkaufsablauf bei Academiana sieht so aus: Über die Preisseite oder die Schaltfläche „Upgrade“ in der Anwendung wird in WhatsApp eine vorbereitete Nachricht mit dem Tarifnamen und gegebenenfalls dem Rabattcode geöffnet; die Zahlung wird außerhalb der Plattform entgegengenommen und der Tarif von der Administration manuell zugewiesen. Es wurde mitgeteilt, dass es auf der Plattform keine Online-Zahlungsseite gibt und Kartendaten nicht in das System aufgenommen werden. Dieses Dokument ist ein Entwurf, der die allgemeinen vorvertraglichen Informationen und Vertragsgrundsätze nach dem derzeitigen Ablauf regelt. Da Identität des Verkäufers, Kontakt-/Antragsangaben, konkreter Preis, Zahlungsart, Umsatzsteuer, Rechnungs- und Rückerstattungsbedingungen nicht verifiziert wurden, wurden diese Angaben nicht erfunden."
    }
   ]
  },
  {
   "h": "Gegenstand der Leistung",
   "b": [
    {
     "p": "Academiana bietet Zugang zu einer digitalen Plattform zur Unterstützung von Prozessen der wissenschaftlichen Recherche und des wissenschaftlichen Schreibens sowie die zugehörigen Softwarefunktionen. Die Leistung kann KI-gestützte Textvorschläge und -bearbeitung, Suche nach wissenschaftlichen Quellen, Zitate/Literaturverzeichnisse, statistische Analyse, Umfragewerkzeuge, Dateiausgaben und Funktionen für die Zusammenarbeit umfassen. Der Leistungsumfang richtet sich nach der aktuellen Beschreibung des erworbenen Tarifs."
    }
   ]
  },
  {
   "h": "Verkauf und Vertragsschluss",
   "b": [
    {
     "p": "Die Nutzerin bzw. der Nutzer wählt den Tarif auf der Preisseite oder in der Anwendung und nimmt über WhatsApp Kontakt auf. Tarif-, Zahlungs- und Zuweisungsdetails werden mit der Nutzerin bzw. dem Nutzer gesondert bestätigt. Nach der Zahlung weist die Administration den Tarif im System zu und die Leistung beginnt. Der Zeitpunkt des Vertragsschlusses sowie Angaben zu Verkäufer, Tarif, Preis, Zahlung und Zuweisung sollten der Nutzerin bzw. dem Nutzer auf einem dauerhaften Datenträger bestätigt und festgehalten werden. Fehlt dieser Bestätigungsschritt im derzeitigen Ablauf, sollte er eingeführt werden."
    }
   ]
  },
  {
   "h": "Tarifarten",
   "b": [
    {
     "p": "Auf der Plattform können ein kostenloser Tarif, monatliche kostenpflichtige Tarife, ein einmaliger und für eine einzelne Arbeit unbefristeter Tarif „Tek Proje“ (Einzelprojekt) sowie eine institutionelle Lizenz angeboten werden. Institutionelle Lizenzen können einer gesonderten Vereinbarung mit der Institution unterliegen. Rabattcodes, Prämien aus dem Einladungsprogramm und der Akademische Teamrabatt (30 %) für mindestens drei Personen können angewendet werden. Umfang des Rabatts und der Preis, auf dessen Grundlage er berechnet wird, sollten der Nutzerin bzw. dem Nutzer vor dem Kauf deutlich mitgeteilt werden."
    }
   ]
  },
  {
   "h": "Preis, Steuern und Zahlung",
   "b": [
    {
     "p": "Der zu zahlende Gesamtbetrag, gegebenenfalls Steuern und Rabatte, die Zahlungsart und der Zahlungszeitpunkt sollten der Nutzerin bzw. dem Nutzer vor dem Vorgang deutlich mitgeteilt werden. Die vorliegende Informationsnotiz enthält weder die aktuellen Tarifpreise noch Angaben dazu, ob die Umsatzsteuer im Preis enthalten ist, zur Zahlungsart (Überweisung/EFT oder Zahlungslink), zur Rechnungs-/E-Archiv-Regelung oder zu den Verkäuferangaben. Daher sind in diesem Entwurf weder Betrag noch Zahlungsart angegeben. Bei jedem Verkauf sollte der Vertrag nicht als abgeschlossen gelten, bevor diese Angaben schriftlich bestätigt sind."
    }
   ]
  },
  {
   "h": "Verlängerung monatlicher Tarife",
   "b": [
    {
     "p": "Bei monatlichen Tarifen gibt es keine automatische Verlängerung. Wer am Ende des Zeitraums fortfahren möchte, veranlasst die Verlängerung selbst. Ohne gesonderte Zustimmung der Nutzerin bzw. des Nutzers wird kein Entgelt für einen neuen Zeitraum erhoben."
    }
   ]
  },
  {
   "h": "Beginn der Leistung und digitale Dienstleistung",
   "b": [
    {
     "p": "Es wurde mitgeteilt, dass die Leistung beginnt, sobald der Tarif nach der Zahlung von der Administration zugewiesen wird. Die Voraussetzungen des Verbraucherrechts hinsichtlich des sofortigen Beginns einer digitalen Dienstleistung, des Umfangs des Widerrufsrechts und möglicher Ausnahmen sollten nach der konkreten Vertragsart geprüft werden. Erforderlichenfalls sollte von der Nutzerin bzw. dem Nutzer ein gesondertes und ausdrückliches Verlangen/eine gesonderte Zustimmung dafür eingeholt werden, dass die Leistung vor Ablauf der Widerrufsfrist beginnt, und dessen bzw. deren rechtliche Folgen sollten gesondert erläutert werden. Die bloße Annahme der allgemeinen Nutzungsbedingungen sollte nicht in der Annahme verwendet werden, dass sie allein einen wirksamen Verzicht oder eine Ausnahme begründet."
    }
   ]
  },
  {
   "h": "Widerrufsrecht und Rückerstattung",
   "b": [
    {
     "p": "Das Widerrufsrecht der Verbraucherin bzw. des Verbrauchers und die auf digitale Dienstleistungen anwendbaren Ausnahmen richten sich nach der Art der Leistung, danach, ob mit der Erfüllung begonnen wurde, nach dem vorab erklärten ausdrücklichen Verlangen/der Zustimmung der Nutzerin bzw. des Nutzers und nach dem geltenden Recht. In dieser Informationsnotiz wird festgehalten, dass derzeit keine Widerrufsbelehrung, keine Rückerstattungsrichtlinie und keine gesonderte Zustimmung zum sofortigen Beginn der Leistung bestehen. Daher wird hier weder eine bestimmte Widerrufsfrist noch eine Bestimmung „keine Rückerstattung unter keinen Umständen“ festgelegt. Der Verkäufer sollte der Verbraucherin bzw. dem Verbraucher vor dem Vorgang die anzuwendenden Widerrufs-/Rückerstattungsbedingungen deutlich mitteilen und zwingende Verbraucherrechte wahren."
    }
   ]
  },
  {
   "h": "Tarif „Tek Proje“ (Einzelprojekt)",
   "b": [
    {
     "p": "Der Tarif „Tek Proje“ gilt für eine einzige, bei der Zuweisung ausgewählte Arbeit und ist zeitlich unbegrenzt. Die Einschränkungen des Tarifs hinsichtlich KI-Nutzung außerhalb der Arbeit, Löschen/Ändern der Arbeit und Anlegen einer zweiten Arbeit sind in der Richtlinie zur fairen Nutzung erläutert. Die Nutzerin bzw. der Nutzer sollte diese Einschränkungen vor dem Kauf prüfen."
    }
   ]
  },
  {
   "h": "Institutionelle Lizenz",
   "b": [
    {
     "p": "Die institutionelle Lizenz kann zu den Bedingungen einer gesonderten Vereinbarung mit der Institution angeboten werden. Es wurde mitgeteilt, dass die Administration der Institution die Mitgliederliste und Nutzungsstatistiken sehen kann, die wissenschaftlichen Arbeitsinhalte der Nutzerinnen und Nutzer jedoch nicht. Preis, Dauer, Anzahl der Nutzerinnen und Nutzer, Supportniveau und Datenverarbeitungsbestimmungen der institutionellen Lizenz sollten gesondert schriftlich festgelegt werden."
    }
   ]
  },
  {
   "h": "Beschwerden und Anträge",
   "b": [
    {
     "p": "Die Nutzerin bzw. der Nutzer kann Probleme im Zusammenhang mit dem Kauf oder der Leistung über den Support-Kanal der Plattform melden. Da die offiziellen Kontaktdaten des Verkäufers und die Antragsanschrift in der Informationsnotiz nicht enthalten sind, sind sie in diesem Entwurf nicht aufgeführt. Vor der Veröffentlichung sollten Firma, Anschrift, E-Mail-/Telefonangaben des Verkäufers und die anwendbaren verbraucherrechtlichen Antragswege ergänzt werden."
    }
   ]
  },
  {
   "h": "Bestellspezifische Bestätigung",
   "b": [
    {
     "p": "Bei jedem Kauf sollten der Nutzerin bzw. dem Nutzer vor dem Vorgang mindestens Verkäuferangaben, Nutzerangaben, Tarifname, Leistungsumfang, Dauer, Grenzen, Gesamtpreis, Steuern, Zahlungsart, Beginn der Leistung, das Bestehen oder Nichtbestehen einer automatischen Verlängerung sowie die anzuwendenden Widerrufs-/Rückerstattungsbedingungen vorgelegt werden; Bestellübersicht und Vertrag sollten der Nutzerin bzw. dem Nutzer auf einem dauerhaften Datenträger übermittelt werden."
    }
   ]
  }
 ],
 "gdpr": [
  {
   "h": "Geltungsbereich und Verantwortlicher",
   "b": [
    {
     "p": "Dieser Hinweis beschreibt die Verarbeitung personenbezogener Daten im Zusammenhang mit Academiana, einer KI-gestützten Plattform für wissenschaftliche Recherche und wissenschaftliches Schreiben, die unter www.academiana.com.tr verfügbar ist. Die Plattform ist für Nutzerinnen und Nutzer in der Türkei zugänglich und kann auch aus anderen Ländern aufgerufen werden. Identität sowie Post-/Kontaktangaben der natürlichen oder juristischen Person, die Academiana betreibt, wurden in den Quellinformationen nicht bereitgestellt und sind daher in diesem Entwurf bewusst nicht angegeben. Sie müssen vor der Veröffentlichung ergänzt werden. Ob Artikel 3 Absatz 2 DSGVO auf die Tätigkeiten der Plattform anwendbar ist und ob nach Artikel 27 ein Vertreter in der EU erforderlich ist, muss anhand der tatsächlichen Ausrichtung auf und Beobachtung von Personen in der EU beurteilt werden."
    }
   ]
  },
  {
   "h": "Kategorien personenbezogener Daten",
   "b": [
    {
     "p": "Je nach Nutzung des Dienstes kann Academiana verarbeiten: Konto- und Kontaktdaten (Name, E-Mail-Adresse und optional Institution); Authentifizierungsdaten (Daten zur Passwortprüfung oder über die Anmeldung mit Google oder Apple erhaltener Name bzw. erhaltene E-Mail-Adresse); Inhalte des wissenschaftlichen Arbeitsbereichs (Projekte, Abschnitte, Versionsverlauf, Kommentare, Quellen und Notizen); hochgeladene Dateien und extrahierter Text; KI-Eingaben und -Antworten; Nutzungsnachweise einschließlich des vollständigen Textes der KI-Ausgaben, Zeitstempel, Projekt-/Abschnittsnamen und Wortzahlen; Nutzungszähler (Token, Kosten, Recherchen und Seiten); eine zufällig erzeugte Gerätekennung und deren nicht umkehrbarer serverseitiger Hashwert; begrenzte Download-Nachweise für den Tarif „Tek Proje“ (Einzelprojekt), einschließlich Wortzahl, eines nicht umkehrbaren Inhalts-Hashwerts und Angaben des Titelblatts; Zahlungs- und Tarifzuweisungsdaten (Name und Telefonnummer der zahlenden Person, Betrag und Notiz); E-Mail-Adressen für Einladungen von Mitautorinnen und Mitautoren; Zugriffe und Kommentare über den Betreuungslink; institutionelle Mitgliedschaft und Nutzungsstatistiken; Supportnachrichten und technische Fehlerdaten; täglich wechselnde, nicht identifizierende Besuchsstatistiken; sowie Benachrichtigungen innerhalb der Anwendung und Protokolle von Anträgen betroffener Personen."
    }
   ]
  },
  {
   "h": "Zwecke und Rechtsgrundlagen",
   "b": [
    {
     "p": "Personenbezogene Daten werden verarbeitet, um Konten anzulegen und zu verwalten, Nutzerinnen und Nutzer zu authentifizieren, den wissenschaftlichen Arbeitsbereich und die Dateifunktionen bereitzustellen, KI-Funktionen zu erbringen, wissenschaftliche Quellen zu durchsuchen, Literaturangaben zu verwalten, Statistik- und Umfragewerkzeuge bereitzustellen, Zusammenarbeit und Freigabe an die Betreuung zu ermöglichen, Tarife und Nutzungsgrenzen zu verwalten, kostenpflichtige Tarife zuzuweisen, Support zu leisten, Missbrauch zu verhindern, die Plattformsicherheit aufrechtzuerhalten, Fehler zu beheben, die Leistung des Dienstes zu messen und rechtliche Pflichten zu erfüllen. Die voraussichtlichen Rechtsgrundlagen nach der DSGVO können umfassen: Vertragserfüllung (Artikel 6 Absatz 1 Buchstabe b) für das Konto und angeforderte Leistungen; berechtigte Interessen (Artikel 6 Absatz 1 Buchstabe f) für verhältnismäßige Sicherheit, Missbrauchsprävention und Dienststatistiken; und Erfüllung einer rechtlichen Verpflichtung (Artikel 6 Absatz 1 Buchstabe c) für gesetzlich vorgeschriebene Aufzeichnungen. Diese Grundlagen erfordern eine dokumentierte, zweckspezifische Bewertung durch den Verantwortlichen. Auf eine Einwilligung wird nur gestützt, wo sie tatsächlich erforderlich ist und wirksam eingeholt wurde."
    }
   ]
  },
  {
   "h": "Speicherdauer",
   "b": [
    {
     "p": "Kontodaten, wissenschaftliche Inhalte, Dateien, KI-Unterhaltungen, Nutzungszähler, Hashwerte der Gerätekennungen und Benachrichtigungen innerhalb der Anwendung werden grundsätzlich bis zur Löschung des Kontos gespeichert. Einladungen von Mitautorinnen und Mitautoren laufen nach 14 Tagen ab, der Einladungsdatensatz kann jedoch beim Projekt verbleiben. Die Freigabe an die Betreuung bleibt verfügbar, bis die Nutzerin bzw. der Nutzer den Link widerruft. Volltext-Nutzungsnachweise der KI werden derzeit bis zur Löschung des Kontos gespeichert; obwohl in bestehenden Formulierungen eine Frist von 12 Monaten genannt wird, ist eine automatische Löschung derzeit nicht umgesetzt. Feedback- und Fehlerprotokolle können unbefristet gespeichert werden, wobei die Verknüpfung mit der Person nach Löschung des Kontos entfernt wird, der Text jedoch bestehen bleiben kann. Besuchsstatistiken werden unbefristet gespeichert. Zahlungsdaten können gesetzlichen handels- und steuerrechtlichen Aufbewahrungspflichten unterliegen. Ein rechtskonformer Aufbewahrungsplan und automatisierte Löschregeln sollten festgelegt und dokumentiert werden."
    }
   ]
  },
  {
   "h": "Empfänger und internationale Übermittlungen",
   "b": [
    {
     "p": "Zu den Dienstleistern und Empfängern können gehören: Supabase für Datenbank, Authentifizierung und Dateispeicherung; Vercel für Hosting und Inhaltsauslieferung; Anthropic für die KI-Verarbeitung, wenn eine KI-Funktion genutzt wird; sowie Google oder Apple, wenn die Nutzerin bzw. der Nutzer die betreffende Anmeldemethode wählt. OpenAI ist als optionale Integration im Code vorhanden, seine Nutzung im Live-Betrieb wurde jedoch nicht bestätigt, und es wird in diesem Entwurf nicht als aktiver Empfänger behandelt. Wissenschaftliche Suchdienste können Suchbegriffe und DOI-Kennungen ohne die Kontoidentität der Nutzerin bzw. des Nutzers erhalten, darunter OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, DataCite, ERIC, DBLP, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP und Unpaywall; Springer Nature, IEEE und NASA ADS können ebenfalls genutzt werden, wenn API-Zugangsdaten hinterlegt sind. Auf Wunsch der Nutzerin bzw. des Nutzers können LaTeX-Dateien an Overleaf gesendet werden, und von der Nutzerin bzw. dem Nutzer veranlasste Zahlungskommunikation kann über WhatsApp erfolgen."
    }
   ]
  },
  {
   "h": "Datenstandorte und Garantien für Übermittlungen",
   "b": [
    {
     "p": "Nach den bereitgestellten technischen Informationen werden die Supabase-Daten in Frankfurt innerhalb der EU gehostet, und das Hosting von Vercel befindet sich ebenfalls in Frankfurt, wobei Vercel ein globales CDN nutzt. Supabase und Vercel sind Unternehmen mit Sitz in den USA. Wird eine KI-Funktion genutzt, werden die Eingabe der Nutzerin bzw. des Nutzers, der relevante Kontext des Arbeitsbereichs und ausgewählte Quellen-/Dateiauszüge an Anthropic in den Vereinigten Staaten übermittelt. Einige wissenschaftliche Suchdienste befinden sich ebenfalls außerhalb des Landes der Nutzerin bzw. des Nutzers. Der Verantwortliche muss für jede eingeschränkte Übermittlung einen geeigneten Übermittlungsmechanismus festlegen und dokumentieren, etwa anwendbare Angemessenheitsregelungen oder Standardvertragsklauseln mit erforderlichenfalls ergänzenden Maßnahmen. Auftragsverarbeitungsverträge der Anbieter, Unterauftragsverarbeiter, Transfer-Folgenabschätzungen und die tatsächlichen Dienstkonfigurationen müssen vor der Veröffentlichung überprüft werden."
    }
   ]
  },
  {
   "h": "Besondere Kategorien und Daten Dritter",
   "b": [
    {
     "p": "Nutzerinnen und Nutzer können Forschungsmaterialien hochladen, die personenbezogene Daten über Dritte enthalten, darunter Interviewtranskripte, Umfrageantworten oder gesundheitsbezogene Informationen. Die Nutzerin bzw. der Nutzer oder die Forschungseinrichtung kann für die Forschungstätigkeit Verantwortlicher sein, während Academiana für den Plattformdienst Auftragsverarbeiter sein kann, abhängig von den Tatsachen und vertraglichen Vereinbarungen. Nutzerinnen und Nutzer müssen vor dem Hochladen solcher Informationen eine gültige Rechtsgrundlage, angemessene Informationen, jede erforderliche ausdrückliche Einwilligung, eine Ethikgenehmigung und geeignete Garantien sicherstellen. Daten sollten minimiert und wo möglich anonymisiert oder pseudonymisiert werden."
    }
   ]
  },
  {
   "h": "Automatisierte Überwachung",
   "b": [
    {
     "p": "Die Plattform kann automatisch Nutzungsmuster erkennen, die auf Missbrauch hindeuten könnten, und eine Warnung zur menschlichen Prüfung erzeugen. Das System sperrt ein Konto nicht automatisch; eine menschliche Administratorin bzw. ein menschlicher Administrator prüft die Warnung und entscheidet, ob keine Maßnahme, eine Verwarnung oder eine Sperrung angemessen ist. Betroffene Personen können in Bezug auf diese Verarbeitung die anwendbaren Rechte ausüben, einschließlich des Widerspruchsrechts, sofern die gesetzlichen Voraussetzungen erfüllt sind."
    }
   ]
  },
  {
   "h": "Sicherheit",
   "b": [
    {
     "p": "Die bereitgestellten technischen Informationen beschreiben HTTPS, HSTS, Content Security Policy, Isolation von Nutzerdaten mit automatisierten Tests, Schutz vor CSRF und SSRF, serverseitige Verwaltung von Geheimnissen, zeitlich begrenzte Dateilinks, Sicherheitsprüfungen von Abhängigkeiten und mehr als 500 automatisierte Tests. Sie weisen auch auf das Fehlen einer Zwei-Faktor-Authentifizierung, eines schriftlichen Verfahrens für Verletzungen des Schutzes personenbezogener Daten und eines unabhängigen Sicherheitstests hin. Die Sicherheitsmaßnahmen sollten regelmäßig überprüft und mit Artikel 32 DSGVO in Einklang gebracht werden. Ein Verfahren zur Reaktion auf Datenschutzverletzungen sollte die Bewertung und, soweit erforderlich, die Meldung an die Aufsichtsbehörde binnen 72 Stunden nach Bekanntwerden der Verletzung sowie die Benachrichtigung betroffener Personen ermöglichen, wenn die gesetzliche Schwelle erreicht ist."
    }
   ]
  },
  {
   "h": "Rechte betroffener Personen",
   "b": [
    {
     "p": "Vorbehaltlich der Bedingungen und Beschränkungen der DSGVO können Personen Auskunft, Berichtigung, Löschung, Einschränkung und Datenübertragbarkeit verlangen sowie der Verarbeitung auf Grundlage berechtigter Interessen widersprechen. Nutzerinnen und Nutzer können derzeit ihre Daten im JSON-Format herunterladen, ihr Konto und die zugehörigen Kontodaten löschen und über die Plattform eine Datenanfrage stellen. Laut den bereitgestellten Informationen werden Datenanfragen innerhalb von 30 Tagen kostenlos beantwortet. Die Kontaktangaben des Verantwortlichen und der Weg zur Ausübung der Rechte wurden nicht bereitgestellt und müssen vor der Veröffentlichung ergänzt werden. Personen können außerdem Beschwerde bei einer zuständigen Datenschutz-Aufsichtsbehörde einlegen, insbesondere in dem EU-Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes."
    }
   ]
  },
  {
   "h": "Institutionelle Kunden",
   "b": [
    {
     "p": "Bei institutionellen Lizenzen kann Academiana je nach den tatsächlichen Zwecken und Mitteln der Verarbeitung als Auftragsverarbeiter im Auftrag der Institution handeln. Ein schriftlicher Auftragsverarbeitungsvertrag sollte Gegenstand, Dauer, Art und Zweck der Verarbeitung, Datenkategorien, Kategorien betroffener Personen, Sicherheitsmaßnahmen, Unterauftragsverarbeiter, Unterstützungspflichten, Löschung/Rückgabe von Daten und Prüfungsregelungen festlegen."
    }
   ]
  },
  {
   "h": "Kinder",
   "b": [
    {
     "p": "Laut den bereitgestellten Informationen hat die Plattform derzeit keine Altersgrenze und führt keine Altersverifikation durch. Der Verantwortliche sollte prüfen, ob der Dienst voraussichtlich Kindern angeboten wird, und, soweit nach anwendbarem Recht erforderlich, geeignete altersbezogene Schutzmaßnahmen und Verfahren zur elterlichen Zustimmung umsetzen."
    }
   ]
  },
  {
   "h": "Änderungen",
   "b": [
    {
     "p": "Dieser Hinweis kann aktualisiert werden, um Änderungen der Verarbeitungstätigkeiten, der Dienstleister oder des anwendbaren Rechts widerzuspiegeln. Wesentliche Änderungen werden über einen geeigneten Kanal mitgeteilt. Identität und Kontaktangaben des Verantwortlichen, gegebenenfalls Angaben zum EU-Vertreter und gegebenenfalls Angaben zur zuständigen Aufsichtsbehörde müssen ergänzt werden, bevor dieser Hinweis als endgültiger rechtlicher Hinweis veröffentlicht wird."
    }
   ]
  }
 ]
};
