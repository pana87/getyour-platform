import { ButtonField } from "../../../../js/ButtonField.js"
import { FileField } from "../../../../js/FileField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/heizung/"
function errorInputMessage() {alert("Es fehlen noch wichtige Angaben, um dein Angebot erstellen zu können.")}

const hausbaujahr = new NumberField("div[class*=hausbaujahr]").withMin("1800").withMax("2100").withPlaceholder("1920").withSHSDefaultStyle().withSync()
const hausumbau = new NumberField("div[class*=hausumbau]").withMin("1800").withMax("2100").withPlaceholder("1920").withSHSDefaultStyle().withSync()
const hausflaeche = new NumberField("div[class*=hausflaeche]").withMin("0").withMax("10000").withPlaceholder("in qm").withSHSDefaultStyle().withSync()
const dachtraufhoehe = new NumberField("div[class*=dachtraufhoehe]").withMin("0").withMax("100").withPlaceholder("in m").withSHSDefaultStyle().withSync()
const hausdachlaenge = new NumberField("div[class*=hausdachlaenge]").withMin("0").withMax("100").withPlaceholder("in m").withSHSDefaultStyle().withSync().withRequired().withValidity()
const hausfirsthoehe = new NumberField("div[class*=hausfirsthoehe]").withMin("0").withMax("100").withPlaceholder("in m").withSHSDefaultStyle().withSync()
const hausdachbreite = new NumberField("div[class*=hausdachbreite]").withMin("0").withMax("100").withPlaceholder("in m").withSHSDefaultStyle().withSync().withRequired().withValidity()
const hausdeckmasslaenge = new NumberField("div[class*=hausdeckmasslaenge]").withMin("0").withMax("100").withPlaceholder("in mm").withSHSDefaultStyle().withSync().withRequired().withValidity()
const hausdeckmassbreite = new NumberField("div[class*=hausdeckmassbreite]").withMin("0").withMax("100").withPlaceholder("in mm").withSHSDefaultStyle().withSync().withRequired().withValidity()

const hausetage = new SelectionField("div[class*=hausetage]").withOptions(["Keller", "Erdgeschoss", "1. Obergeschoss", "Dachgeschoss", "Andere"]).withSHSDefaultStyle().withSync()
const hauskabel = new SelectionField("div[class*=hauskabel]").withOptions(["Innen", "Außen", "Andere"]).withSHSDefaultStyle().withSync()
const hausdenkmal = new SelectionField("div[class*=hausdenkmal]").withOptions(["Ja", "Nein"]).withSHSDefaultStyle().withSync()
const hausenergie = new SelectionField("div[class*=hausenergie]").withOptions(["Nein", "Ja, ich habe schon eine Photovoltaikanlage", "Ja, ich habe schon eine Wärmepumpe", "Ja, ich habe schon eine Solarthermie", "Ja, ich habe schon ein Stromspeicher"]).withSHSDefaultStyle().withSync()
const hauslager = new SelectionField("div[class*=hauslager]").withOptions(["Ja", "Nein", "nicht bei mir zu Hause"]).withSHSDefaultStyle().withSync()
const hausdacheindeckung = new SelectionField("div[class*=hausdacheindeckung]").withOptions(["gelegt", "geschraubt", "geklebt", "gebohrt"]).withSHSDefaultStyle().withSync()
const hausuk = new SelectionField("div[class*=hausuk]").withOptions(["Ja", "Nein"]).withSHSDefaultStyle().withSync()
const hausgeruest = new SelectionField("div[class*=hausgeruest]").withOptions(["Ja", "Nein"]).withSHSDefaultStyle().withSync()
const hausbesonderheiten = new SelectionField("div[class*=hausbesonderheiten]").withOptions(["SAT Antennen", "Blitzableiter", "Schneefanggitter", "Dachfenster", "Dachgauben", "Freileitung", "Andere"]).withSHSDefaultStyle().withSync()

const frontansicht = new FileField("div[class*=dateihochladenfrontansicht]").withAccept("image/*").withSync().withSHSDefaultStyle().withValidity()
const sueden = new FileField("div[class*=dateihochladensueden]").withAccept("image/*").withSync().withSHSDefaultStyle()
const geruest = new FileField("div[class*=dateihochladengeruest]").withAccept("image/*").withSync().withSHSDefaultStyle().withValidity()
const ortgang = new FileField("div[class*=dateihochladenortgang]").withAccept("image/*").withSync().withSHSDefaultStyle()
const sparrenansicht = new FileField("div[class*=dateihochladensparrenansicht]").withAccept("image/*").withSync().withSHSDefaultStyle()
const dachziegel = new FileField("div[class*=dateihochladendachziegel]").withAccept("image/*").withSync().withSHSDefaultStyle()

new ButtonField("div[class*=ueberspringen]").withOnclick(() => storeAndProceed())
new ButtonField("div[class*=speichern]").withOnclick(() => storeAndProceed())

async function storeAndProceed() {

  if (!inputsValid()) {
    errorInputMessage()
    return
  }

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

function inputsValid() {
  let valid = true

  if (hausdeckmasslaenge.value === undefined) {
    hausdeckmasslaenge.withNotValidStyle()
    valid = false
  }

  if (hausdeckmassbreite.value === undefined) {
    hausdeckmassbreite.withNotValidStyle()
    valid = false
  }

  if (frontansicht.files === undefined) {
    frontansicht.withNotValidStyle()
    valid = false
  }

  if (geruest.files === undefined) {
    geruest.withNotValidStyle()
    valid = false
  }

  if (hausdachlaenge.value === undefined) {
    hausdachlaenge.withNotValidStyle()
    valid = false
  }

  if (hausdachbreite.value === undefined) {
    hausdachbreite.withNotValidStyle()
    valid = false
  }

  return valid
}
