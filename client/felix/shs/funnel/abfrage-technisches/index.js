import { CheckboxField } from "../../../../js/CheckBoxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { SelectionField } from "../../../../js/SelectionField.js"
import { TextAreaField } from "../../../../js/TextAreaField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_PATHNAME = "/felix/shs/hersteller/"
const START_FUNNEL_PATHNAME = "/felix/shs/funnel/qualifizierung/"

if (window.sessionStorage.getItem("shsFunnel") !== null) {
  const clickzumhausknopf = new DivField("div[class*='clickzumhausknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-haus/"))

  const clickzurheizungknopf = new DivField("div[class*='clickzurheizungknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-heizung/"))

  const clickzumzaehlerknopf = new DivField("div[class*='clickzumzaehlerknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-strom/"))

  const clicktechnischesknopf = new DivField("div[class*='clicktechnischesknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-technisches/"))

  const technischeswlan = new SelectionField("div[class*='technischeswlan']")
    .withOptions(["Ja", "Nein"])
    .withSelected(0)

  const technischeserdkabel = new SelectionField("div[class*='technischeserdkabel']")
    .withOptions(["Erdkabel", "Freileitung"])

  const technischespotentialausgleich = new SelectionField("div[class*='technischespotentialausgleich']")
    .withOptions(["Nein", "Ja"])
    .withSelected(1)

  const technischeshakbildupload = new FileField("div[class*='technischeshakbildupload']")
    .withType((input) => {
      input.accept = "image/*"
      input.required = true
    })

  const technischesanzahlhaks = new SelectionField("div[class*='technischesanzahlhaks']")
    .withOptions(["0", "1", "2", "mehr als 2"])
    .withSelected(1)

  const technischeshakstandort = new SelectionField("div[class*='technischeshakstandort']")
    .withOptions(["Keller", "Erdgeschoss", "Obergeschoss", "Dachgeschoss", "Treppenhaus", "Andere"])
    .withSelected(0)

  const technischeshakfreicheckbox = new CheckboxField("div[class*='technischeshakfreicheckbox']")
    .withType((box) => box.required = true)

  const zusatzinfosinput = new TextAreaField("div[class*='zusatzinfosinput']")
  .withType((input) => {
    input.placeholder = "Ich habe einen Wintergarten, der bei der Montage abgedeckt werden soll.."
  })

  const fields = [
    technischeswlan,
    technischeserdkabel,
    technischespotentialausgleich,
    technischeshakbildupload,
    technischesanzahlhaks,
    technischeshakstandort,
    technischeshakfreicheckbox,
    zusatzinfosinput,
  ]

  fields.forEach(async field => {
    field.withType(type => type.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME))
    field.withStorage(SHS_FUNNEL_STORAGE_NAME)
    field.withInputEventListener(() => field.withStorage(SHS_FUNNEL_STORAGE_NAME))
  })

  const angeboterhaltenbutton = new DivField("div[class*='angeboterhaltenbutton']")
    .withClickEventListener(async () => await saveAndProceed(NEXT_PATHNAME))

  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))

  async function saveAndProceed(pathname) {

    await technischeswlan.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await technischeserdkabel.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await technischespotentialausgleich.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await technischeshakbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await technischesanzahlhaks.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await technischeshakstandort.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await technischeshakfreicheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await zusatzinfosinput.withStorage(SHS_FUNNEL_STORAGE_NAME)

    window.location.assign(pathname)

  }
} else {
  window.location.assign(START_FUNNEL_PATHNAME)
}


