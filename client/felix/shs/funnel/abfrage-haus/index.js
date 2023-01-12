import { CheckboxField } from "../../../../js/CheckBoxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

// const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
// const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/heizung/"
// function errorInputMessage() {alert("Es fehlen noch wichtige Angaben, um dein Angebot erstellen zu können.")}

const hausbaujahr = new NumberField("div[class*='hausbaujahr']")
  .withMin("1800")
  .withMax("2100")
  .withPlaceholder("1920")

const hausumbau = new NumberField("div[class*='hausumbau']")
  .withMin("1800")
  .withMax("2100")
  .withPlaceholder("1920")

const hausetage = new SelectionField("div[class*='hausetage']")
  .withOptions(["Keller", "Erdgeschoss", "1. Obergeschoss", "Dachgeschoss", "Andere"])

const hausflaeche = new NumberField("div[class*='hausflaeche']")
  .withMin("0")
  .withMax("10000")
  .withPlaceholder("in qm")

const hausdckabelfuehrung = new SelectionField("div[class*='hausdckabelfuehrung']")
  .withOptions(["Ja", "Nein"])

const hausverkabelungdc = new SelectionField("div[class*='hausverkabelungdc']")
  .withOptions(["Ja", "Nein"])

const hausaussenfasadegedaemmt = new SelectionField("div[class*='hausaussenfasadegedaemmt']")
  .withOptions(["Ja", "Nein"])

const hausdenkmal = new SelectionField("div[class*='hausdenkmal']")
  .withOptions(["Ja", "Nein"])

const hausenergievorhanden = new SelectionField("div[class*='hausenergievorhanden']")
  .withOptions(["Nein", "Ja, ich habe schon eine Photovoltaikanlage", "Ja, ich habe schon eine Wärmepumpe", "Ja, ich habe schon eine Solarthermie", "Ja, ich habe schon ein Stromspeicher"])
  .withMultiple()
  // .withSize(1)

const hausenergiesystementsorgen = new SelectionField("div[class*='hausenergiesystementsorgen']")
  .withOptions(["Ja", "Nein"])

const hauslager = new SelectionField("div[class*='hauslager']")
  .withOptions(["Ja", "Nein", "nicht bei mir zu Hause"])

const hausdacheindeckung = new SelectionField("div[class*='hausdacheindeckung']")
  .withOptions(["gelegt", "geschraubt", "geklebt", "gebohrt"])

const hausukueberstand = new SelectionField("div[class*='hausukueberstand']")
  .withOptions(["Ja", "Nein"])

const hausandereshausabstand = new SelectionField("div[class*='hausandereshausabstand']")
  .withOptions(["Ja", "Nein"])

const hausentlueftungsrohre = new SelectionField("div[class*='hausentlueftungsrohre']")
  .withOptions(["Ja", "Nein"])

const hausblitzschutzanlage = new SelectionField("div[class*='hausblitzschutzanlage']")
  .withOptions(["Ja", "Nein"])

const hausbesonderheiten = new SelectionField("div[class*='hausbesonderheiten']")
  .withOptions(["SAT Antennen", "Blitzableiter", "Schneefanggitter", "Dachfenster", "Dachgauben", "Freileitung", "Andere"])

const hausabstandsparren = new NumberField("div[class*='hausabstandsparren']")
  .withMin("0").withMax("100").withPlaceholder("in cm")

const haussparrenbreite = new NumberField("div[class*='haussparrenbreite']")
  .withMin("0").withMax("100").withPlaceholder("in cm")

const haussparrenhoehe = new NumberField("div[class*='haussparrenhoehe']")
  .withMin("0").withMax("100").withPlaceholder("in cm")

const hausmaterialsparren = new SelectionField("div[class*='hausmaterialsparren']")
  .withOptions(["Holz", "Metall", "Sonstiges"])

const hausgeruestoeffentlich = new SelectionField("div[class*='hausgeruestoeffentlich']")
  .withOptions(["Ja", "Nein"])

const hausgeruestselbstgestellt = new SelectionField("div[class*='hausgeruestselbstgestellt']")
  .withOptions(["Ja", "Nein"])

const hausverankerungcheckbox = new CheckboxField("div[class*='hausverankerungcheckbox']")

const geruestaufstellungcheckboxnord = new CheckboxField("div[class*='geruestaufstellungcheckboxnord']")
const geruestaufstellungcheckboxsued = new CheckboxField("div[class*='geruestaufstellungcheckboxsued']")
const geruestaufstellungcheckboxost = new CheckboxField("div[class*='geruestaufstellungcheckboxost']")
const geruestaufstellungcheckboxwest = new CheckboxField("div[class*='geruestaufstellungcheckboxwest']")

const hausbreitedesgeruest = new NumberField("div[class*='hausbreitedesgeruest']")
  .withMin("0").withMax("100").withPlaceholder("in m")

const hauslaengedesgeruest = new NumberField("div[class*='hauslaengedesgeruest']")
  .withMin("0").withMax("100").withPlaceholder("in m")

const hauswievielegerueste = new NumberField("div[class*='hauswievielegerueste']")
  .withMin("0").withMax("100").withPlaceholder("in m")

const hausgesamtgeruestflaeche = new NumberField("div[class*='hausgesamtgeruestflaeche']")
  .withMin("0").withMax("100").withPlaceholder("in m")

const hausattikavorhanden = new SelectionField("div[class*='hausattikavorhanden']")
  .withOptions(["Ja", "Nein"])

const hausattikabreite = new NumberField("div[class*='hausattikabreite']")
  .withMin("0").withMax("100").withPlaceholder("in cm")

const hausattikahoehe = new NumberField("div[class*='hausattikahoehe']")
  .withMin("0").withMax("100").withPlaceholder("in cm")

const flachdachneigungbekanntcheckbo = new CheckboxField("div[class*='flachdachneigungbekanntcheckbo']")
const flachdachnordcheckbox = new CheckboxField("div[class*='flachdachnordcheckbox']")
const flachdachostcheckbox = new CheckboxField("div[class*='flachdachostcheckbox']")
const flachdachsuedcheckbox = new CheckboxField("div[class*='flachdachsuedcheckbox']")
const flachdachwestcheckbox = new CheckboxField("div[class*='flachdachwestcheckbox']")

const haustrapezdachalu = new NumberField("div[class*='haustrapezdachalu']")
  .withMin("0").withMax("100").withPlaceholder("in mm")

const haustrapezdachstahl = new NumberField("div[class*='haustrapezdachstahl']")
  .withMin("0").withMax("100").withPlaceholder("in mm")

const icopalnichtcheckbox = new CheckboxField("div[class*='icopalnichtcheckbox']")

const dachtraufhoehe = new NumberField("div[class*='dachtraufhoehe']")
  .withMin("0").withMax("100").withPlaceholder("in m")

const hausdachbreite = new NumberField("div[class*='hausdachbreite']")
  .withMin("0").withMax("100").withPlaceholder("in m")

const hausdachlaenge = new NumberField("div[class*='hausdachlaenge']")
  .withMin("0").withMax("100").withPlaceholder("in m")

const hausfirsthoehe = new NumberField("div[class*='hausfirsthoehe']")
  .withMin("0").withMax("100").withPlaceholder("in m")

const hausdachausrichtung = new SelectionField("div[class*='hausdachausrichtung']")
  .withOptions(["Nord", "Nord-Ost", "Ost", "Süd-Ost", "Süd-West", "West", "Nord-West"])

const hausdachneigung = new NumberField("div[class*='hausdachneigung']")
  .withMin("0").withMax("100").withPlaceholder("in Grad")

const hausfrontbildbildupload = new FileField("div[class*='hausfrontbildbildupload']").withAccept("image/*")
const haussuedansichtbildbildupload = new FileField("div[class*='haussuedansichtbildbildupload']").withAccept("image/*")
const hausgerueststandortbildbildupl = new FileField("div[class*='hausgerueststandortbildbildupl']").withAccept("image/*")
const hausortgangbildbildupload = new FileField("div[class*='hausortgangbildbildupload']").withAccept("image/*")
const haussparrenansichtbildbilduplo = new FileField("div[class*='haussparrenansichtbildbilduplo']").withAccept("image/*")
const hausziegelbildbildupload = new FileField("div[class*='hausziegelbildbildupload']").withAccept("image/*")

const hausdeckmasslaenge = new NumberField("div[class*='hausdeckmasslaenge']")
  .withMin("0").withMax("100").withPlaceholder("in mm")

const hausdeckmassbreite = new NumberField("div[class*='hausdeckmassbreite']")
  .withMin("0").withMax("100").withPlaceholder("in mm")



const speichernundweiterbutton = new DivField("div[class*='speichernundweiterbutton']")
  .withClickEventListener(() => {
    // save in storage
    // window.location.assign("/felix/shs/funnel/abfrage-strom/")
  })

const impresum = new DivField("div[class*='impressum']")
  .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

const datenschutz = new DivField("div[class*='datenschutz']")
  .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))




// new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())
// new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())

// async function storeAndProceed() {

//   if (!inputsValid()) {
//     errorInputMessage()
//     return
//   }

//   hausbaujahr.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausumbau.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausflaeche.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   dachtraufhoehe.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausdachlaenge.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausfirsthoehe.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausdachbreite.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausdeckmasslaenge.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausdeckmassbreite.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   hausetage.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hauskabel.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausdenkmal.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausenergie.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hauslager.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausdacheindeckung.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausuk.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausgeruest.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   hausbesonderheiten.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   frontansicht.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   sueden.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   geruest.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   ortgang.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   sparrenansicht.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   dachziegel.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   window.location.assign(NEXT_FUNNEL_PATHNAME)
// }

// function inputsValid() {
//   let valid = true

//   if (hausdeckmasslaenge.value === undefined) {
//     hausdeckmasslaenge.withNotValidStyle()
//     valid = false
//   }

//   if (hausdeckmassbreite.value === undefined) {
//     hausdeckmassbreite.withNotValidStyle()
//     valid = false
//   }

//   if (frontansicht.files === undefined) {
//     frontansicht.withNotValidStyle()
//     valid = false
//   }

//   if (geruest.files === undefined) {
//     geruest.withNotValidStyle()
//     valid = false
//   }

//   if (hausdachlaenge.value === undefined) {
//     hausdachlaenge.withNotValidStyle()
//     valid = false
//   }

//   if (hausdachbreite.value === undefined) {
//     hausdachbreite.withNotValidStyle()
//     valid = false
//   }

//   return valid
// }
