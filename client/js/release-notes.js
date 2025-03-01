import {Helper} from "/js/Helper.js"

Helper.create("button/goback", document.body)
const content = Helper.div("sans-serif pb144", document.body)
Helper.render("text/h1", "Release Notes", content)
Helper.render("text/h2", `Plattform Version: ${Helper.convert("millis/dd.mm.yyyy", Date.now())}`, content)
Helper.render("text/h3", "Neue Funktionen:", content)
function appendList(list, ul) {

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const li = document.createElement('li')
    li.textContent = item
    Helper.append(li, ul)
  }
}
const functions = [
  'Experten können ab jetzt ihre Plattformen an andere Experten versenden',
  'Standard CSS Design Klassen sind ab jetzt global verfügbar.',
  'Bildschirmaufnahmen sind ab jetzt in der Toolbox verfügbar.',
  'Toolbox ist jetzt für alle Web-Entwickler frei verfügbar.',
  'In-App Messanger ist ab jetzt für alle registrierte Nutzer verfügbar',
  'Meine Bilder sind ab jetzt in der Toolbox verfügbar',
  'IPFS Node für Experten ab jetzt verfügbar',
  'Zitat Prüfer ist ab jetzt in der Toolbox verfügbar',
  'Bulk Funktionen sind jetzt für Werteinheiten verfügbar',
  'Alle registrierte Nutzer haben ab jetzt Zugang zur Gruppen Funktion: WebRTC Peer to Peer WebCall',
  'Experten können ab jetzt Statistiken für ihre Werteinheiten auswählen',
  'Experten können jetzt Kontakte promoten',
  'Registrierte Nutzer können jetzt Kontakte erstellen',
  'Web-Entwickler können ab jetzt den HTML Creator nutzen',
  'DIV Elemente können ab jetzt mit der DIV Creator App in der Toolbox bearbeitet werden',
  'Soundbox ist ab jetzt für Experten verfügbar',
  'Experten können ab jetzt Schreibrechte für ihre Werteinheiten vergeben',
  'Experten Match Maker ist ab jetzt verfügbar',
  'Zurück Button ist ab jetzt als Skript verfügbar',
  'Feedback Button ist ab jetzt auch, als Skript, für HTML Werteinheiheiten verfügbar',
  'Experte kann ab jetzt, seinen Nutzern erlauben, Listen zu erstellen',
  'Experten Name kann jetzt geändert werden',
  'Rollen App: "scripts" ist jetzt verfügbar',
  'Web-Entwickler können ab jetzt Experten mit HTML Skripte unterstützen',
  'Bildupload ist ab jetzt in der Toolbox verfügbar',
  'Field Funnel ist ab jetzt in der Toolbox verfügbar',
  'Klick Funnel ist ab jetzt in der Toolbox verfügbar',
  'Rollen Apps Button kann jetzt über die Toolbox angehängt werden',
  'Rollen App: "services" ist jetzt verfügbar',
  'Rollen App: "offer" ist jetzt verfügbar',
  'Zugänge für bestimmte Rollen können jetzt mit der Toolbox gelegt werden',
  'Copy und Paste Funktion für HTML Elemente ist in der Toolbox ab jetzt verfügbar',
  'Experten können jetzt Rollen definieren',
  'Element Alias wird ab jetzt in der Toolbox für die Orientierung angezeigt',
  'Elemente können in der Toolbox ab jetzt mit Drag & Drop verschoben werden',
  'Style für jedes Element kann ab jetzt in der Toolbox angepasst werden',
  'Element id kann in der Toolbox ab jetzt gesetzt werden',
  'Rekursive Children Funktion ist in der Toolbox ab jetzt verfügbar',
  'HTML Import ist in der Toolbox unter \'document.write()\' ab jetzt verfügbar',
  'Experte erhält nun neue Version der Toolbox bei jeder Anfrage',
  'Toolbox ist jetzt verfügbar',
  'Werteinheitverwaltungssystem ist jetzt verfügbar',
  'Multi-Level Netzwerk jetzt verfügbar',
  'Registrierung als Experte nun möglich',
  'Ladeanimation ist ab jetzt verfügbar',
  'Direktes Matching ist ab sofort verfügbar',
  'Lazy Loading ist nun verfügbar',
  'Session Storage Sync ist nun verfügbar',
  'Nutzer erhält jetzt bei jeder Request die neueste Version der Plattform',
  'Release notes sind jetzt unter /docs/release-notes/ verfügbar',
  'Login ab jetzt verfügbar',
  'Major Release der Plattform'
]
const ul1 = Helper.create("ul", content)
appendList(functions, ul1)
Helper.render("text/h3", "Sicherheitsupdates:", content)
const securityUpdates = [
  'WebSocket mit SSL verschlüsselt',
  'Listen sind begrenzt auf 5MB pro Nutzer',
  'Es können ab jetzt keine Super Admins mehr entfernt werden',
  'Nutzer können ab jetzt vom Admin aktiviert/deaktiviert werden',
  'Location und Referer werden ab jetzt überprüft',
  'Konto kann jetzt gelöscht werden',
  'Einzelne Datensätze können jetzt gelöscht werden',
  'Login ist jetzt auch über Tablets möglich',
  'Alle Cookies werden jetzt vor der Session gelöscht',
  'Erweiterte Fehlerlogs sind ab jetzt verfügbar',
  'PIN Abfrage blockt jetzt Funktionen nach Fehler',
  'Loggerfunktion loggt jetzt in die Datenbank',
  'Uploads werden jetzt serverseitig überprüft'
]
const ul2 = Helper.create("ul", content)
appendList(securityUpdates, ul2)
