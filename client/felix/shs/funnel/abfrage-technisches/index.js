import { ButtonField } from "../../../../js/ButtonField.js"
import { CheckboxField } from "../../../../js/CheckBoxField.js"
import { FileField } from "../../../../js/FileField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/persoenliches/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/strom/"

const technischeswlan = new SelectionField("div[class*='technischeswlan']").withOptions(["Ja", "Nein"])//.withSHSDefaultStyle()
const technischeserdkabel = new SelectionField("div[class*='technischeserdkabel']").withOptions(["Erdkabel", "Freileitung"])//.withSHSDefaultStyle()
const technischespotentialausgleich = new SelectionField("div[class*='technischespotentialausgleich']").withOptions(["Keller", "Erdgeschoss", "Obergeschoss", "Dachgeschoss", "Treppenhaus", "Andere"])//.withSHSDefaultStyle()

const technischeshakbildupload = new FileField("div[class*='technischeshakbildupload']").withAccept("image/*")

const technischesanzahlhaks = new SelectionField("div[class*='technischesanzahlhaks']").withOptions(["Keller", "Erdgeschoss", "Obergeschoss", "Dachgeschoss", "Treppenhaus", "Andere"])//.withSHSDefaultStyle()
const technischeshakstandort = new SelectionField("div[class*='technischeshakstandort']").withOptions(["Ja", "Nein"])//.withSHSDefaultStyle()

const technischeshakfreicheckbox = new CheckboxField("div[class*='technischeshakfreicheckbox']")




// new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
// new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())
// new ButtonField("div[class*=uebersprigen]").withOnclick(() => storeAndProceed())

// function storeAndProceed() {

//   technischeswlan.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   technischesstandort.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   technischeshakstandort.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   technischeserdkabel.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
//   technischespotentialausgleich.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   dateihochladenhak.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

//   window.location.assign(NEXT_FUNNEL_PATHNAME)
// }
