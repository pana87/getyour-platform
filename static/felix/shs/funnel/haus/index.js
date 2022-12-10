import { ButtonField } from "../../../../js/ButtonField.js"
import { FileField } from "../../../../js/FileField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/heizung/"

const hausbaujahr = new NumberField("div[class*=hausbaujahr]").withMin("1800").withMax("2100").withPlaceholder("1920").withSHSDefault().sync()
const hausumbau = new NumberField("div[class*=hausumbau]").withMin("1800").withMax("2100").withPlaceholder("1920").withSHSDefault().sync()
const hausflaeche = new NumberField("div[class*=hausflaeche]").withMin("0").withMax("10000").withPlaceholder("in qm").withSHSDefault().sync()
const dachtraufhoehe = new NumberField("div[class*=dachtraufhoehe]").withMin("0").withMax("100").withPlaceholder("in m").withSHSDefault().sync()
const hausdachlaenge = new NumberField("div[class*=hausdachlaenge]").withMin("0").withMax("100").withPlaceholder("in m").withSHSDefault().sync()
const hausfirsthoehe = new NumberField("div[class*=hausfirsthoehe]").withMin("0").withMax("100").withPlaceholder("in m").withSHSDefault().sync()
const hausdachbreite = new NumberField("div[class*=hausdachbreite]").withMin("0").withMax("100").withPlaceholder("in m").withSHSDefault().sync()
const hausdeckmasslaenge = new NumberField("div[class*=hausdeckmasslaenge]").withMin("0").withMax("100").withPlaceholder("in mm").withSHSDefault().sync()
const hausdeckmassbreite = new NumberField("div[class*=hausdeckmassbreite]").withMin("0").withMax("100").withPlaceholder("in mm").withSHSDefault().sync()

const hausetage = new SelectionField("div[class*=hausetage]").withOptions(["Keller", "Erdgeschoss", "1. Obergeschoss", "Dachgeschoss", "Andere"]).withSHSDefault().sync()
const hauskabel = new SelectionField("div[class*=hauskabel]").withOptions(["Innen", "Außen", "Andere"]).withSHSDefault().sync()
const hausdenkmal = new SelectionField("div[class*=hausdenkmal]").withOptions(["Ja", "Nein"]).withSHSDefault().sync()
const hausenergie = new SelectionField("div[class*=hausenergie]").withOptions(["Nein", "Ja, ich habe schon eine Photovoltaikanlage", "Ja, ich habe schon eine Wärmepumpe", "Ja, ich habe schon eine Solarthermie", "Ja, ich habe schon ein Stromspeicher"]).withSHSDefault().sync()
const hauslager = new SelectionField("div[class*=hauslager]").withOptions(["Ja", "Nein", "nicht bei mir zu Hause"]).withSHSDefault().sync()
const hausdacheindeckung = new SelectionField("div[class*=hausdacheindeckung]").withOptions(["gelegt", "geschraubt", "geklebt", "gebohrt"]).withSHSDefault().sync()
const hausuk = new SelectionField("div[class*=hausuk]").withOptions(["Ja", "Nein"]).withSHSDefault().sync()
const hausgeruest = new SelectionField("div[class*=hausgeruest]").withOptions(["Ja", "Nein"]).withSHSDefault().sync()
const hausbesonderheiten = new SelectionField("div[class*=hausbesonderheiten]").withOptions(["SAT Antennen", "Blitzableiter", "Schneefanggitter", "Dachfenster", "Dachgauben", "Freileitung", "Andere"]).withSHSDefault().sync()

const frontansicht = new FileField("div[class*=dateihochladenfrontansicht]").withAccept("image/*").sync()
const sueden = new FileField("div[class*=dateihochladensueden]").withAccept("image/*").sync()
const geruest = new FileField("div[class*=dateihochladengeruest]").withAccept("image/*").sync()
const ortgang = new FileField("div[class*=dateihochladenortgang]").withAccept("image/*").sync()
const sparrenansicht = new FileField("div[class*=dateihochladensparrenansicht]").withAccept("image/*").sync()
const dachziegel = new FileField("div[class*=dateihochladendachziegel]").withAccept("image/*").sync()

new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())
new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())

async function storeAndProceed() {
  hausbaujahr.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausumbau.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausflaeche.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  dachtraufhoehe.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausdachlaenge.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausfirsthoehe.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausdachbreite.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausdeckmasslaenge.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausdeckmassbreite.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  hausetage.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hauskabel.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausdenkmal.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausenergie.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hauslager.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausdacheindeckung.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausuk.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausgeruest.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  hausbesonderheiten.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  frontansicht.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  sueden.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  geruest.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  ortgang.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  sparrenansicht.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)
  dachziegel.storeInputToLocalStorage(SHS_FUNNEL_STORAGE_NAME)

  window.location.assign(NEXT_FUNNEL_PATHNAME)
}
