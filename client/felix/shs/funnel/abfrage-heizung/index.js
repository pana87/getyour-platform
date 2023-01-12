import { CheckboxField } from "../../../../js/CheckBoxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

// const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
// const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/strom/"
// const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/haus/"

const heizungheizen = new SelectionField("div[class*='heizungheizen']")
  .withOptions(["Erdgas", "Heizöl", "Wärmepumpe", "Holz/Kohle", "Pellets", "Flüssiggas", "Strom", "Andere"])

const heizungwie = new SelectionField("div[class*='heizungwie']")
  .withOptions(["Radiatoren/Konvektoren", "Flachheizkörper", "Fußboden-/Wandheizung", "Andere"])

const heizungvorlauf = new NumberField("div[class*='heizungvorlauf']")
  .withMin(0)
  .withMax(1000)
  .withPlaceholder("in min")

const heizungwarm = new SelectionField("div[class*='heizungwarm']")
  .withOptions(["Zentral über Heizung", "Separat (z.B. Durchlauferhitzer)", "Solarthermie", "Andere"])

const heizungkosten = new NumberField("div[class*='heizungkosten']")
  .withMin(0)
  .withMax(1000000)
  .withPlaceholder("in Euro")

const heizungwaermepumpebildupload = new FileField("div[class*='heizungwaermepumpebildupload']")
  .withAccept("image/*")

const heizungwasserspeicherbilduploa = new FileField("div[class*='heizungwasserspeicherbilduploa']")
  .withAccept("image/*")

const heizungstromspeicherbildupload = new FileField("div[class*='heizungstromspeicherbildupload']")
  .withAccept("image/*")

const traufhoeheviermetercheckbox = new CheckboxField("div[class*='traufhoeheviermetercheckbox']")

const speicherdritteetagecheckbox = new CheckboxField("div[class*='speicherdritteetagecheckbox']")
const speicherzweiteetagecheckbox = new CheckboxField("div[class*='speicherzweiteetagecheckbox']")
const speichererdgeschosscheckbox = new CheckboxField("div[class*='speichererdgeschosscheckbox']")
const speicherkellercheckbox = new CheckboxField("div[class*='speicherkellercheckbox']")
const zaehlerdritteetagecheckbox = new CheckboxField("div[class*='zaehlerdritteetagecheckbox']")
const zaehlerzweiteetagecheckbox = new CheckboxField("div[class*='zaehlerzweiteetagecheckbox']")
const zaehlererdgeschosscheckbox = new CheckboxField("div[class*='zaehlererdgeschosscheckbox']")
const zaehlerkellercheckbox = new CheckboxField("div[class*='zaehlerkellercheckbox']")

const heizunghheizungeintrittzehnmetereizen = new SelectionField("div[class*='heizungeintrittzehnmeter']")
  .withOptions(["Ja", "20-30m", "30-40m", "40-50m", "mehr als 50m"])

const heizunggleichesgebaeude = new SelectionField("div[class*='heizunggleichesgebaeude']")
  .withOptions(["Ja", "Nein"])

const heizungeintrittzehnmeter = new SelectionField("div[class*='heizungeintrittzehnmeter']")
  .withOptions(["Nein", "20-30m", "30-40m", "40-50m", "mehr als 50m"])



const saveAndProceed = new DivField("div[class*='angeboterhaltenbutton']")
  .withClickEventListener(() => {
    // save in storage

    // window.location.assign("/felix/shs/funnel/abfrage-strom/")
  })


const impresum = new DivField("div[class*='impressum']")
  .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

const datenschutz = new DivField("div[class*='datenschutz']")
  .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))





// new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
// new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())
// new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())

// function storeAndProceed() {

//   heizungheizen.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   heizungwie.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   heizungwarm.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   heizungvorlauf.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   heizungkosten.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   dateihochladenwaermepumpe.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   dateihochladenwasserspeicher.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   dateihochladenstromspeicher.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   window.location.assign(NEXT_FUNNEL_PATHNAME)
// }
