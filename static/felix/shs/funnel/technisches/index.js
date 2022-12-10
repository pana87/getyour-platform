import { ButtonField } from "../../../../js/ButtonField.js";
import { FileField } from "../../../../js/FileField.js";
import { SelectionField } from "../../../../js/SelectionField.js";

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/persoenliches/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/strom/"

const technischeswlan = new SelectionField("div[class*=technischeswlan]").withOptions(["Ja", "Nein"]).withSHSDefault().sync()
const technischesstandort = new SelectionField("div[class*=technischesstandort]").withOptions(["Keller", "Erdgeschoss", "Obergeschoss", "Dachgeschoss", "Treppenhaus", "Andere"]).withSHSDefault().sync()
const technischeshakstandort = new SelectionField("div[class*=technischeshakstandort]").withOptions(["Keller", "Erdgeschoss", "Obergeschoss", "Dachgeschoss", "Treppenhaus", "Andere"]).withSHSDefault().sync()
const technischeserdkabel = new SelectionField("div[class*=technischeserdkabel]").withOptions(["Erdkabel", "Freileitung"]).withSHSDefault().sync()
const technischespotentialausgleich = new SelectionField("div[class*=technischespotentialausgleich]").withOptions(["Ja", "Nein"]).withSHSDefault().sync()

const dateihochladenhak = new FileField("div[class*=dateihochladenhak]").withAccept("image/*").sync()

new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())
new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())

function storeAndProceed() {

  technischeswlan.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  technischesstandort.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  technischeshakstandort.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  technischeserdkabel.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  technischespotentialausgleich.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  dateihochladenhak.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  window.location.assign(NEXT_FUNNEL_PATHNAME)
}
