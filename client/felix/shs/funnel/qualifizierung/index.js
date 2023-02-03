import { FunnelField } from "../../../../js/FunnelField.js"


function storageExistRedirect(storageName, url) {
  const storage = JSON.parse(window.sessionStorage.getItem(storageName))
  if (storage !== null) window.location.assign(url)
}
storageExistRedirect("shsFunnel", "/felix/shs/funnel/abfrage-haus/")

const pathToAssets = "/felix/shs/funnel/qualifizierung/"

const questions = [
  { question: "Um ein individuelles Angebot erstellen zu können, schenken Sie uns bitte vorab 10 Minuten Ihrer wertvollen Zeit für die Beantwortung der Fragen. Damit wir herausfinden können, ob unser Konzept auch etwas für Sie ist und um Ihre Bedürfnisse noch besser verstehen zu können. <br/><br/>Einverstanden und bereit?", answers: [
    { answer: "JA! Ich bin bereit!", image: `${pathToAssets}img/ja.svg`},
    { answer: "Nein, das ist mir zu aufwendig.", image: `${pathToAssets}img/nein.svg`}
  ]},
  { question: "Wo möchten Sie die Photovoltaik installieren?", answers: [
    { answer: "Ein-Zweifamilienhaus", image: `${pathToAssets}/img/einfamilienhaus.svg`},
    { answer: "Mehrfamilienhaus", image: `${pathToAssets}/img/mehrfamilien.svg`},
    { answer: "Firmengebäude", image: `${pathToAssets}/img/firmen.svg`},
    { answer: "Freilandfläche", image: `${pathToAssets}/img/freiland.svg`},
    { answer: "Sonstiges", image: `${pathToAssets}/img/sonstige.svg`}
  ]},
  { question: "Um welchen Gebäudetyp handelt es sich?", answers: [
    { answer: "freistehendes Haus", image: `${pathToAssets}/img/freistehend.svg`},
    { answer: "Doppelhaushälfte", image: `${pathToAssets}/img/doppelhaus.svg`},
    { answer: "Reihenhaus", image: `${pathToAssets}/img/reihenhaus.svg`}
  ]},
  { question: "Bewohnen Sie die Immobilie selbst?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/bewohnen.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/nichtbewohnen.svg`}
  ]},
  { question: "Sind Sie Eigentümer der Immobilie?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/eigentuemer.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/nichteigentuemer.svg`}
  ]},
  { question: "Welche Dachform hat das Haus?", answers: [
    { answer: "Satteldach", image: `${pathToAssets}/img/satteldach.svg`},
    { answer: "Pultdach", image: `${pathToAssets}/img/pultdach.svg`},
    { answer: "Flachdach", image: `${pathToAssets}/img/flachdach.svg`},
    { answer: "Walmdach", image: `${pathToAssets}/img/walmdach.svg`},
    { answer: "Sonstiges", image: `${pathToAssets}/img/sonstige.svg`}
  ]},
  { question: "Die Dacheindeckung ist..", answers: [
    { answer: "Steineindeckung", image: `${pathToAssets}/img/steineindeckung.svg`},
    { answer: "Faserzement", image: `${pathToAssets}/img/faserzement.svg`},
    { answer: "Blechdach", image: `${pathToAssets}/img/blechdach.svg`},
    { answer: "Schiefer", image: `${pathToAssets}/img/schiefer.svg`},
    { answer: "Dachpfannen", image: `${pathToAssets}/img/dachpfannen.svg`},
    { answer: "Bieberschwanz", image: `${pathToAssets}/img/bieberschwanz.svg`},
    { answer: "Sonstiges", image: `${pathToAssets}/img/sonstige.svg`},
  ]},
  { question: "Möchten Sie Ihr Energiekonzept durch eine Photovoltaikanlage ergänzen?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/photovoltaik.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/keinphotovoltaik.svg`}
  ]},
  { question: "Möchten Sie Ihr Energiekonzept durch einen Stromspeicher ergänzen?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/speicher.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/keinspeicher.svg`}
  ]},
  { question: "Möchten Sie Ihr Energiekonzept durch einen Wärmepumpe ergänzen?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/waermepumpe.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/keinewaermepumpe.svg`}
  ]},
  { question: "Möchten Sie Ihr Energiekonzept durch eine Solarthermie ergänzen?", answers: [
    { answer: "Ja", image: `${pathToAssets}/img/solar.svg`},
    { answer: "Nein", image: `${pathToAssets}/img/keinsolar.svg`}
  ]},
  { question: "Möchten Sie die Anlage mieten oder kaufen?", answers: [
    { answer: "Kaufen", image: `${pathToAssets}/img/kaufen.svg`},
    { answer: "Mieten", image: `${pathToAssets}/img/mieten.svg`}
  ]},
  { question: "Wollen Sie Bar bezahlen oder finanzieren?", answers: [
    { answer: "Bar bezahlen", image: `${pathToAssets}/img/bar.svg`},
    { answer: "Ich möchte finanzieren", image: `${pathToAssets}/img/finanzieren.svg`}
  ]},
  { question: "Wie alt sind Sie?", answers: [
    { answer: "20 - 40 Jahre", image: `${pathToAssets}/img/20jahre.svg`},
    { answer: "41 - 50 Jahre", image: `${pathToAssets}/img/41jahre.svg`},
    { answer: "51 - 70 Jahre", image: `${pathToAssets}/img/51jahre.svg`},
    { answer: "über 70 Jahre", image: `${pathToAssets}/img/ueber70.svg`},
  ]},
  { question: "Wann soll die Photovoltaik installiert werden?", answers: [
    { answer: "so schnell wie möglich", image: `${pathToAssets}/img/sofort.svg`},
    { answer: "in 1-3 Monate", image: `${pathToAssets}/img/ab1.svg`},
    { answer: "in 4-6 Monate", image: `${pathToAssets}/img/ab4.svg`},
    { answer: "mehr als 6 Monate", image: `${pathToAssets}/img/mehrals6.svg`},
  ]},
]

new FunnelField("div[class*='funnel-placeholder']")
  .withQuestions(questions)
  .withNextFunnelPath("/felix/shs/funnel/abfrage-haus/")
  .withStorage("shsFunnel")
