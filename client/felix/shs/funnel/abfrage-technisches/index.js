import { CheckboxField } from "../../../../js/CheckBoxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { SelectionField } from "../../../../js/SelectionField.js"
import { TextAreaField } from "../../../../js/TextAreaField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/hersteller/"
const START_FUNNEL_PATHNAME = "/felix/shs/funnel/qualifizierung/"

if (window.sessionStorage.getItem("shsFunnel") !== null) {
  const technischeswlan = new SelectionField("div[class*='technischeswlan']")
    .withOptions(["Ja", "Nein"])
    .withSelected(0)

  const technischeserdkabel = new SelectionField("div[class*='technischeserdkabel']")
    .withOptions(["Erdkabel", "Freileitung"])

  const technischespotentialausgleich = new SelectionField("div[class*='technischespotentialausgleich']")
    .withOptions(["Nein", "Ja"])
    .withSelected(1)

  const technischeshakbildupload = new FileField("div[class*='technischeshakbildupload']")
    .withInput((input) => {
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
    .withCheckbox((box) => box.required = true)

  const zusatzinfosinput = new TextAreaField("div[class*='zusatzinfosinput']")
  .withInput((input) => {
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

  fields.forEach(field => field.withValidValue())
  fields.forEach(field => field.withInputEventListener(() => field.withValidValue()))

  const saveAndProceed = new DivField("div[class*='angeboterhaltenbutton']")
    .withClickEventListener(async () => {

      await technischeswlan.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await technischeserdkabel.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await technischespotentialausgleich.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await technischeshakbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await technischesanzahlhaks.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await technischeshakstandort.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await technischeshakfreicheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await zusatzinfosinput.withStorage(SHS_FUNNEL_STORAGE_NAME)

      window.location.assign(NEXT_FUNNEL_PATHNAME)
    })

  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))
} else {
  window.location.assign(START_FUNNEL_PATHNAME)
}


