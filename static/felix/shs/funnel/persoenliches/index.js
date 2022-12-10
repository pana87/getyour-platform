import { ButtonField } from "../../../../js/ButtonField.js"
import { TextField } from "../../../../js/TextField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/success/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/technisches/"

const persoenlichesvorname = new TextField("div[class*=persoenlichesvorname]").withPlaceholder("Max").withSHSDefault().sync()
const persoenlichesnachname = new TextField("div[class*=persoenlichesnachname]").withPlaceholder("Müller").withSHSDefault().sync()
const persoenlichesadresse = new TextField("div[class*=persoenlichesadresse]").withPlaceholder("Hauptstr. 43a").withSHSDefault().sync()
const persoenlichesstadt = new TextField("div[class*=persoenlichesstadt]").withPlaceholder("74679 Weißbach").withSHSDefault().sync()
const persoenlichesbundesland = new TextField("div[class*=persoenlichesbundesland]").withPlaceholder("Baden-Württemberg").withSHSDefault().sync()
const persoenlichesland = new TextField("div[class*=persoenlichesland]").withPlaceholder("Deutschland").withSHSDefault().sync()
const persoenlichesemailadresse = new TextField("div[class*=persoenlichesemailadresse]").withPlaceholder("max.mueller@web.de").withSHSDefault().sync()

new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
new ButtonField("div[class*=angeboterhaltenbutton]").withOnclick(() => storeAndProceed())

function storeAndProceed() {

  persoenlichesvorname.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesnachname.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesadresse.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesstadt.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesbundesland.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesland.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  persoenlichesemailadresse.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)


  /// CALCULATE ANGEBOT


  window.location.assign(NEXT_FUNNEL_PATHNAME)

}
