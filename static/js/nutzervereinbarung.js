import {Helper} from "/js/Helper.js"
import {button} from "/js/button.js"

button.append("go-back", document.body)
document.body.className = "pb144 sans-serif"
Helper.render("text/h1", "Nutzervereinbarung", document.body)
Helper.render("text/h2", `Stand: ${Helper.convert("millis/dd.mm.yyyy", Date.now())}`, document.body)
{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/p", "Vielen Dank, dass du die getyour plattform und ihre Funktionen nutzt (nachfolgend „Funktionen“, „Funktion“).", button)
  Helper.render("text/p", "getyour plattform hat es sich zur Aufgabe gemacht, Plattformentwickler mit Branchenexperten auf eine Art und Weise zu vernetzen, so dass der Nutzen für alle beteiligten aus der spezifischen Branche, im optimalen Fall, ständig wächst. Unsere Funktionen spezialisieren sich dabei auf die Erstellung von Plattformen und ermöglichen es dir als Nutzer, höhere Marktanteile aus deiner Branche zu erzielen.", button)
  Helper.render("text/a", {href: "/docs/release-notes/", text: "Eine Liste mit allen unseren aktuellen Funktionen findest du hier.", target: "_blank"}, button)
  Helper.render("text/p", "Bitte lies dir diese Vereinbarung sorgfältig durch und vergewissere dich, dass du sie verstanden hast. Wenn du einen Teil dieser Vereinbarung nicht verstehst oder akzeptierst, solltest du die Funktionen nicht nutzen.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Plattformanbieter", button)
  Helper.render("text/p", "getyour plattform", button)
  Helper.render("text/p", `Nachfolgend “getyour plattform”, “wir”, “uns”, “unser” oder “unsere”)`, button)
  Helper.render("text/p", " Diese Plattform ist ein nicht-kommerzielles, rein forschungsorientiertes Projekt. Sie verfolgt keinerlei gewerbliche Zwecke, bietet keine kostenpflichtigen Dienste oder Produkte an und wickelt keine geschäftlichen Transaktionen ab. Der Hauptzweck dieser Plattform liegt in der Unterstützung von Forschung und Entwicklung im Bereich Plattformtechnologie und Open Innovation. Jegliche Nutzung der Plattform erfolgt ausschließlich zu Forschungszwecken und zum freien Zugang zu technischen Entwicklungen im Web. Die Plattform steht für den offenen Austausch wissenschaftlicher Erkenntnisse zur Verfügung und richtet sich nicht an ein kommerziell ausgerichtetes Publikum.", button)
  Helper.render("text/a", {href: "mailto:datenschutz@get-your.de?subject=[Datenschutz]", text: "Bei Fragen zum Datenschutz oder zu dieser Plattform, kontaktiere uns bitte unter dieser Adresse."}, button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Verhaltensrichtlinien", button)
  Helper.render("text/h3", "Realistische Erwartungen:", button)
  Helper.render("text/p", "Akzeptiere die Plattform, ihre Möglichkeiten und Einschränkungen. Vermeide unrealistische Forderungen und versuche, konstruktiv mit den gegebenen Rahmenbedingungen umzugehen.", button)
  Helper.render("text/h3", "Positives Verhalten:", button)
  Helper.render("text/p", "Nimm Herausforderungen und Probleme an, ohne zu lamentieren oder andere zu beschuldigen. Sei lösungsorientiert und unterstütze andere dabei, Lösungen zu finden.", button)
  Helper.render("text/h3", "Anonymität und Diskretion:", button)
  Helper.render("text/p", "Respektiere die Privatsphäre der anderen Mitglieder. Teile keine persönlichen Daten ohne deren Zustimmung und vermeide es, andere zu identifizieren, wenn sie anonym bleiben möchten.", button)
  Helper.render("text/h3", "Inklusivität:", button)
  Helper.render("text/p", "Trage dazu bei, eine unterstützende und integrative Gemeinschaft zu schaffen. Jeder sollte sich willkommen und sicher fühlen, unabhängig von Herkunft, Geschlecht, Religion oder Meinungen.", button)
  Helper.render("text/h3", "Respektiere die Wahlfreiheit:", button)
  Helper.render("text/p", "Akzeptiere und respektiere Mitglieder, die sich entscheiden, nicht aktiv teilzunehmen. Jeder sollte das Recht haben, so aktiv oder passiv zu sein, wie er möchte, ohne Druck oder Zwang.", button)
  Helper.render("text/h3", "Keine Ausnutzung:", button)
  Helper.render("text/p", "Zwinge niemanden zu Aktivitäten oder Beiträgen, um persönliche Vorteile zu erzielen. Jeder Beitrag sollte auf Freiwilligkeit basieren.", button)
  Helper.render("text/h3", "Unterstützung ohne Druck:", button)
  Helper.render("text/p", "Setze dich aktiv dafür ein, anderen Mitgliedern und Partnern Hilfestellung zu bieten, ohne dabei Druck auszuüben oder unangemessene Erwartungen zu erzeugen.", button)
  Helper.render("text/h3", "Respekt und Höflichkeit:", button)
  Helper.render("text/p", "Begegne anderen Mitgliedern stets mit Respekt und Höflichkeit. Beleidigungen, Mobbing oder diskriminierendes Verhalten werden nicht toleriert.", button)
  Helper.render("text/h3", "Konstruktive Kritik:", button)
  Helper.render("text/p", "Kritik sollte stets konstruktiv und hilfreich sein. Vermeide destruktive oder abwertende Kommentare.", button)
  Helper.render("text/h3", "Inhaltliche Relevanz:", button)
  Helper.render("text/p", "Beiträge sollten relevant und themenbezogen sein. Vermeide Spam, Werbung oder irrelevante Inhalte.", button)
  Helper.render("text/h3", "Vertraulichkeit:", button)
  Helper.render("text/p", "Respektiere die Vertraulichkeit privater Nachrichten und Gespräche. Veröffentliche keine privaten Informationen ohne Zustimmung.", button)
  Helper.render("text/h3", "Meinungsfreiheit:", button)
  Helper.render("text/p", "Jeder hat das Recht, seine Meinung frei zu äußern, ohne Angst vor Konsequenzen.", button)
  Helper.render("text/h3", "Kritisches Denken:", button)
  Helper.render("text/p", "Ermutige dich und andere, alle Informationen zu hinterfragen und nicht blind zu akzeptieren.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Funktionen", button)
  Helper.render("text/p", "Die Funktionen von getyour plattform ermöglichen es dir, eine breite Pallete an Tools und Interaktionen zu benutzen, um deine eigene Plattform auf der Infrastruktur von getyour plattform zu errichten. Du bekommst Zugang zu anderen Plattformentwickler und Branchenexperten und kannst dich mit ihnen vernetzen und austauschen. Zusätzlich erhälst Zugang zu anderen Plattformen, die auf der getyour plattform errichtet wurden.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Nutzer", button)
  Helper.render("text/p", `Diese Nutzervereinbarung gilt für Mitglieder und Besucher (nachfolgend “Nutzer”, "Mitglied", "Mitglieder", "du", "dir", "euch", "eure").`, button)
  Helper.render("text/p", `Durch die Registrierung wirst du Mitglied von getyour plattform. Wenn du dich nicht registrierst, kannst du als Besucher auf bestimmte Funktionen zugreifen.`, button)
  Helper.render("text/p", `Wenn du unter 18 Jahre alt bist, musst du die Erlaubnis deiner Eltern oder deines Erziehungsberechtigten einholen, um die Funktionen zu nutzen.`, button)
  Helper.render("text/p", `Wenn du ein Elternteil oder Erziehungsberechtigter eines Nutzers unter 18 Jahren bist und deinem Kind die Nutzung der Funktionen gestattest, musst du dich an die Bedingungen dieser Vereinbarung halten und bist für die Handlungen deines Kindes im Rahmen des Funktionens verantwortlich.`, button)
  Helper.render("text/p", `Wenn du die Funktionen im Namen eines Unternehmens oder einer juristischen Person nutzt, bestätigst du, dass du berechtigt bist, im Namen dieser Organisation zu handeln, und dass diese juristische Person diese Vereinbarung akzeptiert.`, button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Allgemeines", button)
  Helper.render("text/p", "Du darfst diese Vereinbarung (oder deine Mitgliedschaft oder die Nutzung einer Funktion) nicht ohne unsere Zustimmung an eine andere Person abtreten.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Änderungen", button)
  Helper.render("text/p", "Wir behalten uns das Recht vor, diese Vereinbarung und unsere Datenschutzrichtlinien zu ändern. Wenn wir wesentliche Änderungen vornehmen, werden wir dich benachrichtigen oder dir anderweitig die Möglichkeit geben, die Änderungen zu überprüfen, bevor sie in Kraft treten. Wir stimmen zu, dass Änderungen nicht rückwirkend vorgenommen werden können. Wenn du Änderungen nicht zustimmst, kannst du dein Konto schließen. Die Fortsetzung der Nutzung unserer Funktionen, nachdem wir Änderungen an diesen Bedingungen veröffentlicht oder dich über solche Änderungen informiert haben, bedeutet, dass du den Bedingungen in ihrer jeweils gültigen Fassung zustimmst.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Vertragsgegenstand", button)
  Helper.render("text/p", "Durch die Nutzung unserer Funktionen stimmst du allen Bedingungen zu. Die Nutzung unserer Funktionen wird durch die Nutzervereinbarung und unsere Datenschutzrichtlinien geregelt. Sie beschreiben, wie wir deine personenbezogenen Daten erheben, verwenden, weitergeben und speichern.", button)
  Helper.render("text/p", "Wenn du dich bei getyour plattform anmeldest, indem du auf „Anmelden“ oder ähnliches klickst, gehst du keinen rechtsverbindlichen Vertrag mit uns ein. Das gilt auch für die Nutzung unserer Funktionen im Namen deines Unternehmens. Wenn du dieser Vereinbarung nicht zustimmen möchtest, klicke bitte nicht auf „Anmelden“ oder ähnliches. Wenn du diese Vereinbarung kündigen möchtest, kannst du dein Konto schließen und den Zugriff auf unserer Funktionen jederzeit einstellen.", button)

  Helper.request("/verify/user/closed/").then(res => {
    if (res.status === 200) {

      const deleteUserButton = Helper.render("text/link", "Konto jetzt schließen", button)
      deleteUserButton.style.margin = "8px"
    }
  })
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Konto", button)
  Helper.render("text/p", "Mitglied ist Kontoinhaber. Du teilst dein Konto nicht mit anderen und du hälst dich an das Gesetz, der Nutzervereinbarung von getyour plattform und die Verhaltensrichtlinien. Du bist für alle Handlungen verantwortlich, die unter deinem Benutzerkonto vorgenommen werden, es sei denn, du hast dein Konto gelöscht oder einen Verstoß gemeldet.", button)
  Helper.render("text/p", "Für Beziehungen zwischen dir und anderen Parteien (einschließlich deines Arbeitgebers oder teilhabende Geschäftsführer oder ähnliches) gilt dein Konto als dein Konto. Wenn die Funktion von einer anderen Partei für die Nutzung erworben wurde (z. B. eine Arbeitslizenz), hat die zahlende Partei nicht das Recht, den Zugriff und die Nutzung der Funktionen zu kontrollieren.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Mitteilungen", button)
  Helper.render("text/p", "Du stimmst zu, dass wir dir Mitteilungen über die von dir angegebenen Kontaktinformationen (z. B. E-Mail Adresse) senden dürfen. Du stimmst zu, deine Kontaktinformationen zu aktualisieren sobald sich eine Veränderung ergeben hat.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Sichtbarkeit", button)
  Helper.render("text/p", "Unser Funktionen ermöglichen es dir, Informationen, Inhalte, Logos, Texte, Bilder, Designs, Quellcode oder ähnliche persönliche oder unternehmensspezifische Daten (nachfolgend “Inhalt” oder “Inhalte”) auf verschiedene Art und Weise bereitzustellen (z. B. über dein Profil). Inhalte, die du zur Verfügung stellst, können für Mitglieder, Besucher oder andere Dritte (einschließlich außerhalb der getyour plattform) sichtbar sein. Die Entscheidungen darüber, wer welche Inhalte sehen kann, liegt ganz allein bei dir. Du hast volle Kontrolle über deine Daten und kannst sie jeder Zeit entfernen. Mit dem entfernen deiner Daten verschwindet auch die Sichtbarkeit.", button)
  Helper.render("text/p", "Wir sind nicht verpflichtet, Inhalte auf der getyour plattform bereitzustellen und können Inhalte ohne Vorankündigung entfernen.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Lizenz", button)
  Helper.render("text/p", "Du bist Eigentümer der Inhalte, die du an uns übermittelst und gewährst uns und Dritte die folgende nicht ausschließliche Lizenz:", button)
  Helper.render("text/p", "Das Recht, Inhalte, die du über uns bereitstellst, zu verwenden, zu kopieren, zu verarbeiten, zu speichern, zu verteilen und zu veröffentlichen, ohne dass deine Zustimmung oder weitere Benachrichtigung erforderlich sind. Dieses Recht ist wie folgt beschränkt:", button)
  Helper.render("text/p", "Du kannst diese Lizenz für bestimmte Inhalte kündigen, indem Du diese Inhalte aus den Funktionen entfernst oder dein Konto kündigst.", button)
  Helper.render("text/p", "Wir werden deine Inhalte, ohne deine ausdrückliche Zustimmung, nicht in Werbung für Produkte oder Dienstleistungen veröffentlichen. Wir behalten uns jedoch das Recht vor, mit deinen Inhalten zu werben, ohne dich oder Dritte dafür zu entschädigen. Wenn du eine Funktion nutzt, werden wir je nach deinen Vorlieben deine Inhalte promoten, um deine Sichtbarkeit zu erhöhen.", button)
  Helper.render("text/p", "Wir werden deine Zustimmung einholen, wenn wir anderen das Recht einräumen möchten, deine Inhalte außerhalb unserer Funktionen zu veröffentlichen.", button)
  Helper.render("text/p", "Wir können deine Inhalte bearbeiten und Formatierungsänderungen vornehmen (z. B. die Größe oder den Dateityp ändern), aber wir ändern nicht die Bedeutung deines Inhalts.", button)
  Helper.render("text/p", "Da du Eigentümer deiner Inhalte bist und wir nicht ausschließliche Rechte an diesen Inhalten haben, kannst du diese Inhalte mit anderen teilen.", button)
  Helper.render("text/p", "Du stimmst zu, dass wir auf alle, von dir bereitgestellten Inhalte, gemäß den Bestimmungen der Datenschutzrichtlinie und deinen Entscheidungen zugreifen, diese verwenden und speichern dürfen.", button)
  Helper.render("text/p", "Du stimmst zu, nur Inhalte bereitzustellen, die nicht gegen das Gesetz oder die Rechte (einschließlich geistiger Eigentumsrechte) anderer verstoßen. Du stimmst auch zu, dass die Informationen in deinem Profil korrekt sind.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Verfügbarkeit der Funktionen", button)
  Helper.render("text/p", "Wir behalten uns das Recht vor, Teile unserer Funktionen zu verändern, auszusetzen oder einzustellen.", button)
  Helper.render("text/p", "Wir sind nicht verpflichtet, deine Inhalte zu speichern oder anzuzeigen. Du stimmst zu, dass wir nicht verpflichtet sind, dir eine Kopie, Speicherung oder Archivierung von Inhalten bereitzustellen, es sei denn, dies ist gesetzlich vorgeschrieben und in Übereinstimmung mit unserer Datenschutzrichtlinie.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Einschränkungen", button)
  Helper.render("text/p", "Wir behalten uns das Recht vor, die Nutzung der Funktionen einzuschränken, einschließlich der Möglichkeit, andere Mitglieder zu kontaktieren. Wir behalten uns das Recht vor, dein Konto einzuschränken, auszusetzen oder zu kündigen, wenn du gegen diese Vereinbarung oder das Gesetz verstößt oder unsere Funktionen missbrauchst (z. B. Verstoß gegen die Verhaltensrichtlinien).", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Business Intelligence", button)
  Helper.render("text/p", "Wir verwenden die Inhalte, die du und andere Mitglieder bereitstellen, um Empfehlungen zu Mitgliedern, Inhalten, Funktionen und Interaktionen zu geben, die du möglicherweise nützlich findest.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Haftungsausschluss", button)
  Helper.render("text/p", "Die getyour plattform ermöglicht es Nutzern, Inhalte auf der Plattform zu erstellen, hochzuladen, anzuzeigen und zu teilen. Wir möchten darauf hinweisen, dass die von den Nutzern generierten Inhalte nicht von uns kontrolliert oder überprüft werden. Wir übernehmen keine Verantwortung oder Haftung für die Richtigkeit, Qualität, Sicherheit oder Legalität der von Nutzern erstellten Inhalte.", button)
  Helper.render("text/p", "Als Nutzer stimmst du zu, dass du allein für die von dir erstellten Inhalte verantwortlich bist. Du garantierst, dass du das Recht hast, diese Inhalte zu erstellen, hochzuladen, anzuzeigen und zu teilen und dass diese Inhalte nicht gegen geltende Gesetze, Rechte Dritter oder unsere Nutzungsbedingungen verstoßen.", button)
  Helper.render("text/p", "Wir übernehmen keine Verpflichtung, die Inhalte der Nutzer zu überwachen, zu überprüfen oder zu moderieren. Wir behalten uns jedoch das Recht vor, nach eigenem Ermessen Inhalte zu entfernen, die gegen unsere Nutzungsbedingungen verstoßen oder anderweitig unangemessen sind. Die Nutzung der von Nutzern generierten Inhalte erfolgt auf eigene Gefahr. Wir übernehmen keine Haftung für Schäden oder Verluste, die sich aus der Verwendung oder dem Vertrauen auf solche Inhalte ergeben.", button)
  Helper.render("text/p", "Dieser Haftungsausschluss gilt für alle Inhalte, einschließlich, aber nicht beschränkt auf Texte, Bilder, Videos, Links oder andere Materialien, die von Nutzern auf der getyour plattform erstellt, hochgeladen, angezeigt oder geteilt werden.", button)
  Helper.render("text/p", "Als Funktionenanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Funktionenanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Inhalte zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.", button)
  Helper.render("text/p", "Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Inhalten nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.", button)
  Helper.render("text/p", "Unsere Funktionen enthalten Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.", button)
  Helper.render("text/p", "Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.", button)
  Helper.render("text/p", "Im gesetzlich zulässigen Ausmass schließen wir jegliche Haftung für entgangene Gewinne oder Geschäftschancen, Rufschädigung (z. B. Anstössige Inhalte), Verlust von Daten oder jegliche Neben- oder Folgeschäden oder Strafschadensersatz in Verbindung mit dieser Nutzervereinbarung aus.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Beendigung", button)
  Helper.render("text/p", "Sowohl du als auch getyour plattform können diese Vereinbarung jederzeit durch Benachrichtigung der anderen Partei kündigen. Nach der Kündigung verlierst du dein Recht, auf die Funktionen zuzugreifen oder sie zu nutzen. Nach Ablauf deiner Kontoschließung gelten weiterhin folgende Bestimmungen:", button)
  Helper.render("text/p", "Wir behalten uns das Recht vor, dein Feedback zu verwenden und offenzulegen.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Urheberrecht", button)
  Helper.render("text/p", "Die durch uns erstellten Inhalte unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.", button)
  Helper.render("text/p", "Soweit die Inhalte nicht von uns erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Solltest du trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir dich um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.", button)
  Helper.render("text/p", "Wir halten alle geistigen Eigentumsrechte an den Funktionen. Marken und Logos, die in Verbindung mit den Funktionenn verwendet werden, sind Marken ihrer jeweiligen Eigentümer.", button)
}

{
  const button = Helper.create("div/box", document.body)
  Helper.render("text/h2", "Online Streitbeilegung", button)
  Helper.render("text/a", {text: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit", href: "https://ec.europa.eu/consumers/odr/", target: "_blank"}, button)
  Helper.render("text/p", "Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet.", button)
}
