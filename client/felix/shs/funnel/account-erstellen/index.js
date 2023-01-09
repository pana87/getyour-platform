import { ButtonField } from "../../../../js/ButtonField.js"
import { EmailField } from "../../../../js/EmailField.js"
import { TextField } from "../../../../js/TextField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const PATH_TO_PRODUCER_MATCH_MAKER = "/felix/shs/hersteller/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/technisches/"
const MAX_INPUT_LENGTH = 34
function errorInputMessage() {alert("Es fehlen noch wichtige Angaben, um dein Angebot erstellen zu können.")}

const persoenlichesvorname = new TextField("div[class*=persoenlichesvorname]").withPlaceholder("Max").withSHSDefaultStyle().withSync().withRequired().withMaxLength(MAX_INPUT_LENGTH).withValidity()
const persoenlichesnachname = new TextField("div[class*=persoenlichesnachname]").withPlaceholder("Müller").withSHSDefaultStyle().withSync().withRequired().withMaxLength(MAX_INPUT_LENGTH).withValidity()
const persoenlichesadresse = new TextField("div[class*=persoenlichesadresse]").withPlaceholder("Hauptstr. 43a").withSHSDefaultStyle().withSync().withRequired().withMaxLength(MAX_INPUT_LENGTH).withValidity()
const persoenlichesstadt = new TextField("div[class*=persoenlichesstadt]").withPlaceholder("74679 Weißbach").withSHSDefaultStyle().withSync().withRequired().withPattern("[1-9][0-9]{4}\\s.[^\\s]+").withMaxLength(MAX_INPUT_LENGTH).withValidity()
const persoenlichesbundesland = new TextField("div[class*=persoenlichesbundesland]").withPlaceholder("Baden-Württemberg").withSHSDefaultStyle().withSync().withRequired().withMaxLength(MAX_INPUT_LENGTH).withValidity()
const persoenlichesland = new TextField("div[class*=persoenlichesland]").withPlaceholder("Deutschland").withSHSDefaultStyle().withSync().withRequired().withMaxLength(MAX_INPUT_LENGTH).withValidity()

const persoenlichesemailadresse = new EmailField("div[class*=persoenlichesemailadresse]").withPlaceholder("max.mueller@web.de").withSHSDefaultStyle().withSync().withRequired().withMaxLength(MAX_INPUT_LENGTH).withValidity()

new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
new ButtonField("div[class*=angeboterhaltenbutton]").withOnclick(() => storeAndProceed())

function storeAndProceed() {

  if (!inputsValid()) {
    errorInputMessage()
    return
  }

  persoenlichesvorname.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesnachname.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesadresse.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesstadt.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesbundesland.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesland.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesemailadresse.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  window.location.assign(PATH_TO_PRODUCER_MATCH_MAKER)
}

function inputsValid() {
  let valid = true

  if (persoenlichesvorname.value === undefined) {
    persoenlichesvorname.withNotValidStyle()
    valid = false
  }
  if (persoenlichesnachname.value === undefined) {
    persoenlichesnachname.withNotValidStyle()
    valid = false
  }
  if (persoenlichesadresse.value === undefined) {
    persoenlichesadresse.withNotValidStyle()
    valid = false
  }
  if (persoenlichesstadt.value === undefined) {
    persoenlichesstadt.withNotValidStyle()
    valid = false
  }
  if (persoenlichesbundesland.value === undefined) {
    persoenlichesbundesland.withNotValidStyle()
    valid = false
  }
  if (persoenlichesland.value === undefined) {
    persoenlichesland.withNotValidStyle()
    valid = false
  }
  if (persoenlichesemailadresse.value === undefined) {
    persoenlichesemailadresse.withNotValidStyle()
    valid = false
  }

  return valid
}
