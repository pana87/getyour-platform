import { SelectionField } from "../../../../js/SelectionField.js"
import { ButtonField } from "../../../../js/ButtonField.js"
import { TextField } from "../../../../js/TextField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { FileField } from "../../../../js/FileField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/technisches/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/heizung/"

const stromversorger = new SelectionField("div[class*=stromversorger]").withOptions(["Netze - BW", "Andere"]).withSHSDefault().sync()
const stromhauptzaehler = new SelectionField("div[class*=stromhauptzaehler]").withOptions(["1", "2", "3", "4"]).withSHSDefault().sync()
const stromzusatzverbrauch = new SelectionField("div[class*=stromzusatzverbrauch]").withOptions(["Haushaltsstrom", "Nachtspeicheröfen", "Elektroheizung", "Sauna", "Klimaanlage", "Poolheizung", "E-Auto", "Andere"]).withSHSDefault().sync()

const stromhauptzaehlernummer = new TextField("div[class*=stromhauptzaehlernummer]").withPlaceholder("44600637").withSHSDefault().sync()
const stromnebenzaehlernummer = new TextField("div[class*=stromnebenzaehlernummer]").withPlaceholder("33104800").withSHSDefault().sync()

const stromjahresverbrauch = new NumberField("div[class*=stromjahresverbrauch]").withMin(0).withMax(1000000).withPlaceholder("in kWh").withSHSDefault().sync()
const stromnebenzaehlerfunktion = new NumberField("div[class*=stromnebenzaehlerfunktion]").withMin(0).withMax(1000000).withPlaceholder("in kWh").withSHSDefault().sync()
const stromarbeitspreis = new NumberField("div[class*=stromarbeitspreis]").withMin(0).withMax(1000000).withPlaceholder("in cent").withSHSDefault().sync()
const stromgrundpreis = new NumberField("div[class*=stromgrundpreis]").withMin(0).withMax(1000000).withPlaceholder("in euro").withSHSDefault().sync()
const stromarbeitspreiswaerme = new NumberField("div[class*=stromarbeitspreiswaerme]").withMin(0).withMax(1000000).withPlaceholder("in cent").withSHSDefault().sync()
const stromagrundpreiswaerme = new NumberField("div[class*=stromagrundpreiswaerme]").withMin(0).withMax(1000000).withPlaceholder("in euro").withSHSDefault().sync()

const dateihochladenzaehlerschrank = new FileField("div[class*=dateihochladenzaehlerschrank]").withAccept("image/*").sync()
const dateihochladenzaeehler = new FileField("div[class*=dateihochladenzaeehler]").withAccept("image/*").sync()

new ButtonField("div[class*=zurueck]").withAssign(PREVIOUS_FUNNEL_PATHNAME)
new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())
new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())


function storeAndProceed() {

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
