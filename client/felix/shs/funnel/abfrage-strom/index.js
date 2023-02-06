import { SelectionField } from "../../../../js/SelectionField.js"
import { TextField } from "../../../../js/TextField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { FileField } from "../../../../js/FileField.js"
import { DivField } from "../../../../js/DivField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_PATHNAME = "/felix/shs/funnel/abfrage-technisches/"


if (window.sessionStorage.getItem("shsFunnel") !== null) {

  const clickzumhausknopf = new DivField("div[class*='clickzumhausknopf']")
  .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-haus/"))

  const clickzurheizungknopf = new DivField("div[class*='clickzurheizungknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-heizung/"))

  const clickzumzaehlerknopf = new DivField("div[class*='clickzumzaehlerknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-strom/"))

  const clicktechnischesknopf = new DivField("div[class*='clicktechnischesknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-technisches/"))


  const stromversorger = new TextField("div[class*='stromversorger']")
  .withType(input => {
    input.placeholder = "zb Netze - BW.."
  })

  const stromzaehlerschrankverbaut = new SelectionField("div[class*='stromzaehlerschrankverbaut']")
    .withOptions(["Ja", "Nein"])
    .withSelected(1)
    .withChangeEventListener((event) => {
      if (event.target.value === "Ja") {
        document.querySelectorAll(stromplatzzaehlerschrank.selectSelector).forEach(field => field.disabled = true)
      }
      if (event.target.value === "Nein") {
        document.querySelectorAll(stromplatzzaehlerschrank.selectSelector).forEach(field => field.disabled = false)
      }
      stromplatzzaehlerschrank.withValidValue()
    })

  const stromplatzzaehlerschrank = new SelectionField("div[class*='stromplatzzaehlerschrank']")
    .withOptions(["Ja", "Nein"])
    .withSelected(1)
    .withRequired(0)

  const stromhauptzaehleranzahl = new SelectionField("div[class*='stromhauptzaehleranzahl']")
    .withOptions(["1", "2", "3", "mehr"])

  const stromwievieleneuezaehler = new SelectionField("div[class*='stromwievieleneuezaehler']")
    .withOptions(["1", "2", "3"])

  const stromunterzaehlernotwendig = new SelectionField("div[class*='stromunterzaehlernotwendig']")
    .withOptions(["Ja", "Nein"])
    .withSelected(1)
    .withChangeEventListener((event) => {
      if (event.target.value === "Ja") {
        document.querySelectorAll(stromwievieleneuezaehler.selectSelector)
          .forEach(select => select.disabled = false)
      }
      if (event.target.value === "Nein") {
        document.querySelectorAll(stromwievieleneuezaehler.selectSelector)
          .forEach(select => select.disabled = true)
      }
    })
    .withType((select) => {
      if (select.value === "Nein") {
        document.querySelectorAll(stromwievieleneuezaehler.selectSelector)
          .forEach(select => select.disabled = true)
      }
    })


  const stromhauptzaehlernummer = new TextField("div[class*='stromhauptzaehlernummer']")
  .withType((input) => {
    input.placeholder = "44600637"
    const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
    if (q7 === 0) {
      input.required = true
    }
  })

  const stromnebenzaehlernummer = new TextField("div[class*='stromnebenzaehlernummer']")
  .withType((input) => {
    input.placeholder = "33104800"
  })

  const stromszaehlerkonzeptzusammen = new SelectionField("div[class*='stromszaehlerkonzeptzusammen']")
  .withOptions(["Nein", "Ja", "E-Auto", "Wärmepumpe", "Pool", "Durchlauferhitzer", "Nachtspeicherheizung", "Sonstige"])
  .withSelected(0)
  .withType((select) => {
    select.multiple = true
  })

  const stromjahresverbrauch = new NumberField("div[class*='stromjahresverbrauch']")
  .withType(input => {
    input.min = 0
    input.max = 1000000
    input.placeholder = "in kWh"
  })

  const stromnebenzaehlerfunktion = new NumberField("div[class*='stromnebenzaehlerfunktion']")
  .withType(input => {
    input.min = 0
    input.max = 1000000
    input.placeholder = "in kWh"
  })

  const stromarbeitspreis = new NumberField("div[class*='stromarbeitspreis']")
  .withType(input => {
    input.min = 0
    input.max = 1000000
    input.placeholder = "in cent"
  })

  const stromgrundpreis = new NumberField("div[class*='stromgrundpreis']")
  .withType(input => {
    input.min = 0
    input.max = 1000000
    input.placeholder = "in euro"
  })

  const stromarbeitspreiswaerme = new NumberField("div[class*='stromarbeitspreiswaerme']")
  .withType(input => {
    input.min = 0
    input.max = 1000000
    input.placeholder = "in cent"
  })

  const stromagrundpreiswaerme = new NumberField("div[class*='stromagrundpreiswaerme']")
  .withType(input => {
    input.min = 0
    input.max = 1000000
    input.placeholder = "in euro"
  })

  const stromzaehlerschrankbildupload = new FileField("div[class*='stromzaehlerschrankbildupload']")
    .withType((input) => {
      input.accept = "image/*"
      const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
      if (q7 === 0) {
        input.required = true
      }
    })

  const stromallezaehlerbildupload = new FileField("div[class*='stromallezaehlerbildupload']")
    .withType((input) => {
      input.accept = "image/*"
      input.multiple = true
      const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
      if (q7 === 0) {
        input.required = true
      }
    })

  const fields = [
    stromversorger,
    stromzaehlerschrankverbaut,
    stromplatzzaehlerschrank,
    stromhauptzaehleranzahl,
    stromunterzaehlernotwendig,
    stromwievieleneuezaehler,
    stromhauptzaehlernummer,
    stromnebenzaehlernummer,
    stromszaehlerkonzeptzusammen,
    stromjahresverbrauch,
    stromnebenzaehlerfunktion,
    stromarbeitspreis,
    stromgrundpreis,
    stromarbeitspreiswaerme,
    stromagrundpreiswaerme,
    stromzaehlerschrankbildupload,
    stromallezaehlerbildupload,
  ]

  fields.forEach(async field => {
    field.withType(type => type.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME))
    field.withStorage(SHS_FUNNEL_STORAGE_NAME)
    field.withInputEventListener(() => field.withStorage(SHS_FUNNEL_STORAGE_NAME))
  })

  const speichernundweiterrrbutton = new DivField("div[class*='speichernundweiterrrbutton']")
    .withClickEventListener(async () => await saveAndProceed(NEXT_PATHNAME))


  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))


  async function saveAndProceed(pathname) {
    await stromversorger.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromzaehlerschrankverbaut.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromplatzzaehlerschrank.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromhauptzaehleranzahl.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromunterzaehlernotwendig.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromwievieleneuezaehler.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromhauptzaehlernummer.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromnebenzaehlernummer.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromszaehlerkonzeptzusammen.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromjahresverbrauch.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromnebenzaehlerfunktion.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromarbeitspreis.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromgrundpreis.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromarbeitspreiswaerme.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromagrundpreiswaerme.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromzaehlerschrankbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await stromallezaehlerbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)

    window.location.assign(pathname)
  }
} else {
  window.location.assign("/felix/shs/funnel/qualifizierung/")
}
