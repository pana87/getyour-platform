import { SelectionField } from "../../../../js/SelectionField.js"
import { TextField } from "../../../../js/TextField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { FileField } from "../../../../js/FileField.js"
import { DivField } from "../../../../js/DivField.js"
import { Helper } from "../../../../js/Helper.js"

const funnel = JSON.parse(window.localStorage.getItem("shsFunnel"))
if (funnel === null) {
  window.location.assign("/felix/shs/funnel/qualifizierung/")
} else {

  document.querySelectorAll("img[class*='logo-icon']").forEach(img => {
    img.src = `/felix/shs/img/shslogo.png`
    img.alt = "SHS Energie Express Logo"
    img.style.cursor = "pointer"
    img.addEventListener("click", async() => {
      const res = await Helper.redirectOperatorToChecklist()
      if (res.status === 200) {
        window.location.assign(`/felix/shs/checkliste/${res.response}/`)
      }
    })
  })

  const clickzumhausknopf = new DivField("div[class*='clickzumhausknopf']")
  .withClickEventListener(async() => {
    await saveToStorage()
    window.location.assign(funnel.paths[1])
  })

  const clickzurheizungknopf = new DivField("div[class*='clickzurheizungknopf']")
    .withClickEventListener(async() => {
      await saveToStorage()
      window.location.assign(funnel.paths[2])
    })

  const clickzumzaehlerknopf = new DivField("div[class*='clickzumzaehlerknopf']")
    .withClickEventListener(async() => {
      await saveToStorage()
      window.location.assign(funnel.paths[3])
    })

  const clicktechnischesknopf = new DivField("div[class*='clicktechnischesknopf']")
    .withClickEventListener(async() => {
      await saveToStorage()
      window.location.assign(funnel.paths[4])
    })


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
    const q7 = funnel.value.q7
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
      const q7 = funnel.value.q7
      if (q7 === 0) {
        input.required = true
      }
    })

  const stromallezaehlerbildupload = new FileField("div[class*='stromallezaehlerbildupload']")
    .withType((input) => {
      input.accept = "image/*"
      input.multiple = true
      const q7 = funnel.value.q7
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
    field.withType(type => type.fromStorage(funnel.storage))
    field.withStorage(funnel.storage)
    field.withInputEventListener(() => field.withStorage(funnel.storage))
  })

  const speichernundweiterrrbutton = new DivField("div[class*='speichernundweiterrrbutton']")
    .withClickEventListener(async () => {
      await saveToStorage()
      Helper.nextFunnel(funnel.paths)
    })

  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))

  async function saveToStorage() {
    await stromversorger.withStorage(funnel.storage)
    await stromzaehlerschrankverbaut.withStorage(funnel.storage)
    await stromplatzzaehlerschrank.withStorage(funnel.storage)
    await stromhauptzaehleranzahl.withStorage(funnel.storage)
    await stromunterzaehlernotwendig.withStorage(funnel.storage)
    await stromwievieleneuezaehler.withStorage(funnel.storage)
    await stromhauptzaehlernummer.withStorage(funnel.storage)
    await stromnebenzaehlernummer.withStorage(funnel.storage)
    await stromszaehlerkonzeptzusammen.withStorage(funnel.storage)
    await stromjahresverbrauch.withStorage(funnel.storage)
    await stromnebenzaehlerfunktion.withStorage(funnel.storage)
    await stromarbeitspreis.withStorage(funnel.storage)
    await stromgrundpreis.withStorage(funnel.storage)
    await stromarbeitspreiswaerme.withStorage(funnel.storage)
    await stromagrundpreiswaerme.withStorage(funnel.storage)
    await stromzaehlerschrankbildupload.withStorage(funnel.storage)
    await stromallezaehlerbildupload.withStorage(funnel.storage)
  }
}
