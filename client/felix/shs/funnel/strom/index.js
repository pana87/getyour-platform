import { SelectionField } from "../../../../js/SelectionField.js"
import { ButtonField } from "../../../../js/ButtonField.js"
import { TextField } from "../../../../js/TextField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { FileField } from "../../../../js/FileField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/technisches/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/heizung/"
function errorInputMessage() {alert("Es fehlen noch wichtige Angaben, um dein Angebot erstellen zu können.")}

const stromversorger = new SelectionField("div[class*=stromversorger]").withOptions(["Netze - BW", "Andere"]).withSHSDefaultStyle().withSync()
const stromhauptzaehler = new SelectionField("div[class*=stromhauptzaehler]").withOptions(["1", "2", "Mehr als 2"]).withSHSDefaultStyle().withSync()
const stromzusatzverbrauch = new SelectionField("div[class*=stromzusatzverbrauch]").withOptions(["Haushaltsstrom", "Nachtspeicheröfen", "Elektroheizung", "Sauna", "Klimaanlage", "Poolheizung", "E-Auto", "Andere"]).withSHSDefaultStyle().withSync()

const stromhauptzaehlernummer = new TextField("div[class*=stromhauptzaehlernummer]").withPlaceholder("44600637").withSHSDefaultStyle().withSync().withRequired().withValidity()
const stromnebenzaehlernummer = new TextField("div[class*=stromnebenzaehlernummer]").withPlaceholder("33104800").withSHSDefaultStyle().withSync()

const stromjahresverbrauch = new NumberField("div[class*=stromjahresverbrauch]").withMin(0).withMax(1000000).withPlaceholder("in kWh").withSHSDefaultStyle().withSync()
const stromnebenzaehlerfunktion = new NumberField("div[class*=stromnebenzaehlerfunktion]").withMin(0).withMax(1000000).withPlaceholder("in kWh").withSHSDefaultStyle().withSync()
const stromarbeitspreis = new NumberField("div[class*=stromarbeitspreis]").withMin(0).withMax(1000000).withPlaceholder("in cent").withSHSDefaultStyle().withSync()
const stromgrundpreis = new NumberField("div[class*=stromgrundpreis]").withMin(0).withMax(1000000).withPlaceholder("in euro").withSHSDefaultStyle().withSync()
const stromarbeitspreiswaerme = new NumberField("div[class*=stromarbeitspreiswaerme]").withMin(0).withMax(1000000).withPlaceholder("in cent").withSHSDefaultStyle().withSync()
const stromagrundpreiswaerme = new NumberField("div[class*=stromagrundpreiswaerme]").withMin(0).withMax(1000000).withPlaceholder("in euro").withSHSDefaultStyle().withSync()

const dateihochladenzaehlerschrank = new FileField("div[class*=dateihochladenzaehlerschrank]").withAccept("image/*").withSync().withSHSDefaultStyle().withRequired().withValidity()
const dateihochladenzaeehler = new FileField("div[class*=dateihochladenzaeehler]").withAccept("image/*").withSync().withSHSDefaultStyle()

new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())
new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())


function storeAndProceed() {

  if (!inputsValid()) {
    errorInputMessage()
    return
  }

  stromversorger.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  stromhauptzaehler.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  stromzusatzverbrauch.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  stromhauptzaehlernummer.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  stromnebenzaehlernummer.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  stromjahresverbrauch.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  stromnebenzaehlerfunktion.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  stromarbeitspreis.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  stromgrundpreis.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  stromarbeitspreiswaerme.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  stromagrundpreiswaerme.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  dateihochladenzaehlerschrank.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  dateihochladenzaeehler.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  window.location.assign(NEXT_FUNNEL_PATHNAME)
}

function inputsValid() {
  let valid = true

  if (Number(stromhauptzaehler.value) === 1) {
    if (stromhauptzaehlernummer.value === undefined) {
      stromhauptzaehlernummer.withNotValidStyle()
      valid = false
    }
  }

  if (Number(stromhauptzaehler.value) !== 1) {
    if (stromnebenzaehlernummer.value === undefined) {
      stromnebenzaehlernummer.withRequired().withValidity().withNotValidStyle()
      valid = false
    }
  }

  if (dateihochladenzaehlerschrank.files === undefined) {
    dateihochladenzaehlerschrank.withNotValidStyle()
    valid = false
  }
  return valid
}
