import {Helper} from "/js/Helper.js"
import {button} from "/js/button.js"

button.append("go-back", document.body)
document.body.className = "pb144 sans-serif"
Helper.render("text/h1", "Datenschutz Richtlinien", document.body)
Helper.render("text/h2", `Stand: ${Helper.convert("millis/dd.mm.yyyy", Date.now())}`, document.body)

{
  const box = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Geltungsbereich", box)
  Helper.render("text/p", "Diese Datenschutz-Richtilinien sollen dich als Nutzer gemäß Bundesdatenschutzgesetz und Telemediengesetz über die Art, den Umfang und den Zweck der Erhebung und Verwendung personenbezogener Daten durch uns informieren.", box)
  Helper.render("text/p", "Wir nehmen deinen Datenschutz sehr ernst und behandeln deine personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Vorschriften.", box)
  Helper.render("text/p", "Bedenke, dass die Datenübertragung im Internet grundsätzlich mit Sicherheitslücken bedacht sein kann. Ein vollumfänglicher Schutz vor dem Zugriff durch Fremde ist nicht realisierbar.", box)
}

{
  const box = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Datenschutzbeauftragter", box)
  Helper.render("text/p", "Unseren Datenschutzbeauftragten erreichst du unter folgenden Kontaktdaten:", box)
  Helper.render("div/mailto", "mailto:datenschutz@get-your.de?subject=[Datenschutz]", box)
}

{
  const box = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Cookies", box)
  Helper.render("text/p", "Diese Webseite verwendet Cookies. Dabei handelt es sich um verschlüsselte Textbausteine, welche auf deinem Endgerät gespeichert werden und dich als Nutzer authentifizieren und authorisieren sollen. Dein Browser greift auf diese Cookies zu, solange du angemeldet bist. Ohne diese Cookies hast du nur Zugang zu den öffentlichen Anwendungen.", box)
  Helper.render("text/p", "Es werden keine personenbezogene Daten über diese Cookies gespeichert. Diese Cookies sind Notwendig, sobald du unsere geschlossenen Dienste verwenden möchtest. Du musst bei jeder Anmeldung, die Speicherung von Cookies akzeptieren. Nach 2 Stunden werden diese Cookies automatisch gelöscht und verfallen.", box)
  Helper.render("text/a", {text: "Klicke hier um aktive Cookies in deinem Browser anzuzeigen.", href: "/get/cookies/", target: "_blank"}, box)
  Helper.render("text/p", "Achtung: Solltest du angemeldet sein, wirst du automatisch abgemeldet, sobald du deine Cookies entfernst.", box)
  Helper.render("text/a", {text: "Klicke hier um alle Cookies aus deinem Browser zu entfernen.", href: "/remove/cookies/", target: "_blank"}, box)
  Helper.render("text/p", "Wenn du auf 'Cookies jetzt anzeigen' klickst, dann siehst du alle Cookies, die in deinem Browser gespeichert sind.", box)
  Helper.render("text/p", "Wir speichern nur 2 verschiedene Cookies in deinem Browser,", box)
  Helper.render("text/p", "{", box)
  const jwtDiv = Helper.render("text/p", "jwtToken: 'Token für deine Authentifizierung',", box)
  jwtDiv.className = "mlr55 mtb8"
  const sessionDiv = Helper.render("text/p", "sessionToken: 'Token für deine Session'", box)
  sessionDiv.className = "mlr55 mtb8"
  Helper.render("text/p", "}", box)
  Helper.render("text/a", {text: "Du kannst dir sicher sein, dass keine davon personenbezogen sind. Unser Code ist Open Source und kann hier jeder Zeit überprüft werden.", href: "https://github.com/pana87/getyour-platform/", target: "_blank"}, box)
}

{
  const box = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Umgang mit personenbezogenen Daten", box)
  Helper.render("text/p", "Als personenbezogene Daten gelten sämtliche Informationen, welche dazu dienen, deine Person zu bestimmen und welche zu dir zurückverfolgt werden können – also beispielsweise dein Name, deine E-Mail-Adresse oder Telefonnummer.", box)
  Helper.render("text/p", "Wir erheben, nutzen und geben deine personenbezogenen Daten nur dann weiter, wenn du in die Datenerhebung einwilligst. Wir werden dich informieren, sollten Anfragen, über Dritte, bei uns eingehen.", box)
}

{
  const box = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Konto", box)
  Helper.render("text/p", "Wir übernehmen keine Haftung für Kontomissbrauch, sofern dieser nicht von uns selbst verursacht wurde. Um ein Konto zu erstellen, brauchen wir folgende personenbezogene Daten von dir:", box)
  Helper.render("text/p", "- E-Mail-Adresse", box)
  Helper.render("text/p", "Für weitere personenbezogene Daten, werden wir immer vorher nach deiner Zustimmung fragen.", box)
  Helper.render("text/p", "Sowie die Aufbewahrung deiner Daten nicht mehr erforderlich oder gesetzlich geboten sind, werden diese gelöscht.", box)
}

{
  const box = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Rechte des Nutzers: Auskunft, Berichtigung und Löschung", box)
  Helper.render("text/p", "Du als Nutzer erhälst, auf Antrag, kostenlose Auskunft darüber, welche personenbezogenen Daten über dich gespeichert wurden. Du hast ein Anrecht auf Berichtigung falscher Daten und auf die Sperrung oder Löschung deiner personenbezogenen Daten.", box)
}

{
  const box = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Weitere Informationen findest du hier:", box)
  Helper.render("text/a", {text: "Telemediengesetz (TMG)", href: "https://www.gesetze-im-internet.de/tmg/", target: "_blank"}, box)
  Helper.render("text/a", {text: "Bundesdatenschutzgesetz (BDSG)", href: "https://www.gesetze-im-internet.de/bdsg_2018/", target: "_blank"}, box)
  Helper.render("text/a", {text: "EU Datenschutz Grundverordnung (DSGVO)", href: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016L0680/", target: "_blank"}, box)
}
