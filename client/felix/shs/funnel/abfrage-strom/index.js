import { SelectionField } from "../../../../js/SelectionField.js"
import { ButtonField } from "../../../../js/ButtonField.js"
import { TextField } from "../../../../js/TextField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { FileField } from "../../../../js/FileField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/technisches/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/heizung/"
function errorInputMessage() {alert("Es fehlen noch wichtige Angaben, um dein Angebot erstellen zu können.")}


const stromversorger = new TextField("div[class*='stromversorger']")
  .withPlaceholder("zb Netze - BW..")

const stromzaehlerschrankverbaut = new SelectionField("div[class*='stromzaehlerschrankverbaut']")
  .withOptions(["Ja", "Nein"])
  .withSelect((select) => {
    if (select.value === "Ja") {
      document.querySelectorAll("div[class*='geeigneterzaehlerschrank']")
        .forEach(field => field.style.display = "none")
    }
  })
  .withInputEventListener((event) => {
    if (event.target.value === "Ja") {
      document.querySelectorAll("div[class*='geeigneterzaehlerschrank']")
        .forEach(field => field.style.display = "none")
    }
    if (event.target.value === "Nein") {
      document.querySelectorAll("div[class*='geeigneterzaehlerschrank']")
        .forEach(field => field.style.display = "block")
    }
  })

const stromplatzzaehlerschrank = new SelectionField("div[class*='stromplatzzaehlerschrank']")
  .withOptions(["Ja", "Nein"])

const stromhauptzaehleranzahl = new SelectionField("div[class*='stromhauptzaehleranzahl']")
  .withOptions(["1", "2", "3", "mehr"])

const stromunterzaehlernotwendig = new SelectionField("div[class*='stromunterzaehlernotwendig']")
  .withOptions(["Ja", "Nein"])
  .withInputEventListener((event) => {
    if (event.target.value === "Nein") {
      document.querySelectorAll("div[class*='stromwvneuezaehlercontainer']")
        .forEach(field => field.style.display = "none")
    }
    if (event.target.value === "Ja") {
      document.querySelectorAll("div[class*='stromwvneuezaehlercontainer']")
        .forEach(field => field.style.display = "block")
    }
  })

const stromwievieleneuezaehler = new SelectionField("div[class*='stromwievieleneuezaehler']")
  .withOptions(["1", "2", "3"])



const stromhauptzaehlernummer = new TextField("div[class*='stromhauptzaehlernummer']").withPlaceholder("44600637")
const stromnebenzaehlernummer = new TextField("div[class*='stromnebenzaehlernummer']").withPlaceholder("33104800")

const stromszaehlerkonzeptzusammen = new SelectionField("div[class*='stromszaehlerkonzeptzusammen']")
  .withOptions(["Ja", "E-Auto", "Wärmepumpe", "Pool", "Durchlauferhitzer", "Nachtspeicherheizung", "Sonstige", "Nein"])



const stromjahresverbrauch = new NumberField("div[class*='stromjahresverbrauch']").withMin(0).withMax(1000000).withPlaceholder("in kWh")
const stromnebenzaehlerfunktion = new NumberField("div[class*='stromnebenzaehlerfunktion']").withMin(0).withMax(1000000).withPlaceholder("in kWh")
const stromarbeitspreis = new NumberField("div[class*='stromarbeitspreis']").withMin(0).withMax(1000000).withPlaceholder("in cent")
const stromgrundpreis = new NumberField("div[class*='stromgrundpreis']").withMin(0).withMax(1000000).withPlaceholder("in euro")
const stromarbeitspreiswaerme = new NumberField("div[class*='stromarbeitspreiswaerme']").withMin(0).withMax(1000000).withPlaceholder("in cent")
const stromagrundpreiswaerme = new NumberField("div[class*='stromagrundpreiswaerme']").withMin(0).withMax(1000000).withPlaceholder("in euro")


const stromzaehlerschrankbildupload = new FileField("div[class*='stromzaehlerschrankbildupload']").withAccept("image/*")
const stromallezaehlerbildupload = new FileField("div[class*='stromallezaehlerbildupload']").withAccept("image/*")


// new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
// new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())
// new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())


// function storeAndProceed() {

//   if (!inputsValid()) {
//     errorInputMessage()
//     return
//   }

//   stromversorger.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   stromhauptzaehler.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   stromzusatzverbrauch.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   stromhauptzaehlernummer.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   stromnebenzaehlernummer.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   stromjahresverbrauch.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   stromnebenzaehlerfunktion.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   stromarbeitspreis.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   stromgrundpreis.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   stromarbeitspreiswaerme.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   stromagrundpreiswaerme.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   dateihochladenzaehlerschrank.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   dateihochladenzaeehler.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   window.location.assign(NEXT_FUNNEL_PATHNAME)
// }

// function inputsValid() {
//   let valid = true

//   if (Number(stromhauptzaehler.value) === 1) {
//     if (stromhauptzaehlernummer.value === undefined) {
//       stromhauptzaehlernummer.withNotValidStyle()
//       valid = false
//     }
//   }

//   if (Number(stromhauptzaehler.value) !== 1) {
//     if (stromnebenzaehlernummer.value === undefined) {
//       stromnebenzaehlernummer.withNotValidStyle()
//       valid = false
//     }
//   }

//   if (dateihochladenzaehlerschrank.files === undefined) {
//     dateihochladenzaehlerschrank.withNotValidStyle()
//     valid = false
//   }
//   return valid
// }
