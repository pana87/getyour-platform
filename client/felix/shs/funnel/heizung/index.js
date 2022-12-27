import { ButtonField } from "../../../../js/ButtonField.js";
import { FileField } from "../../../../js/FileField.js";
import { NumberField } from "../../../../js/NumberField.js";
import { SelectionField } from "../../../../js/SelectionField.js";

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/strom/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/haus/"

const heizungheizen = new SelectionField("div[class*=heizungheizen]").withOptions(["Erdgas", "Heizöl", "Wärmepumpe", "Holz/Kohle", "Pellets", "Flüssiggas", "Strom", "Andere"]).withSHSDefaultStyle().withSync()
const heizungwie = new SelectionField("div[class*=heizungwie]").withOptions(["Radiatoren/Konvektoren", "Flachheizkörper", "Fußboden-/Wandheizung", "Andere"]).withSHSDefaultStyle().withSync()
const heizungwarm = new SelectionField("div[class*=heizungwarm]").withOptions(["Zentral über Heizung", "Separat (z.B. Durchlauferhitzer)", "Solarthermie", "Andere"]).withSHSDefaultStyle().withSync()

const heizungvorlauf = new NumberField("div[class*=heizungvorlauf]").withMin(0).withMax(1000).withPlaceholder("in Celsius").withSHSDefaultStyle().withSync()
const heizungkosten = new NumberField("div[class*=heizungkosten]").withMin(0).withMax(1000000).withPlaceholder("in Euro").withSHSDefaultStyle().withSync()

const dateihochladenwaermepumpe = new FileField("div[class*=dateihochladenwaermepumpe]").withSync().withAccept("image/*").withSHSDefaultStyle()
const dateihochladenwasserspeicher = new FileField("div[class*=dateihochladenwasserspeicher]").withSync().withAccept("image/*").withSHSDefaultStyle()
const dateihochladenstromspeicher = new FileField("div[class*=dateihochladenstromspeicher]").withSync().withAccept("image/*").withSHSDefaultStyle()

new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())
new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())

function storeAndProceed() {

  heizungheizen.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  heizungwie.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  heizungwarm.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  heizungvorlauf.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  heizungkosten.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  dateihochladenwaermepumpe.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  dateihochladenwasserspeicher.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  dateihochladenstromspeicher.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  window.location.assign(NEXT_FUNNEL_PATHNAME)
}
