import { CheckboxField } from "../../../../js/CheckboxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { Helper } from "../../../../js/Helper.js"
import { SelectionField } from "../../../../js/SelectionField.js"
import { TextAreaField } from "../../../../js/TextAreaField.js"

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
      await savtToStorage()
      window.location.assign(funnel.paths[1])
    })

  const clickzurheizungknopf = new DivField("div[class*='clickzurheizungknopf']")
    .withClickEventListener(async() => {
      await savtToStorage()
      window.location.assign(funnel.paths[2])
    })

  const clickzumzaehlerknopf = new DivField("div[class*='clickzumzaehlerknopf']")
    .withClickEventListener(async() => {
      await savtToStorage()
      window.location.assign(funnel.paths[3])
    })

  const clicktechnischesknopf = new DivField("div[class*='clicktechnischesknopf']")
    .withClickEventListener(async() => {
      await savtToStorage()
      window.location.assign(funnel.paths[4])
    })

  const technischeswlan = new SelectionField("div[class*='technischeswlan']")
    .withOptions(["Ja", "Nein"])
    .withSelected(0)

  const technischeserdkabel = new SelectionField("div[class*='technischeserdkabel']")
    .withOptions(["Erdkabel", "Freileitung"])

  const technischespotentialausgleich = new SelectionField("div[class*='technischespotentialausgleich']")
    .withOptions(["Nein", "Ja"])
    .withSelected(1)

  const technischeshakbildupload = new FileField("div[class*='technischeshakbildupload']")
    .withType((input) => {
      input.accept = "image/*"
      input.required = true
    })

  const technischesanzahlhaks = new SelectionField("div[class*='technischesanzahlhaks']")
    .withOptions(["0", "1", "2", "mehr als 2"])
    .withSelected(1)

  const technischeshakstandort = new SelectionField("div[class*='technischeshakstandort']")
    .withOptions(["Keller", "Erdgeschoss", "Obergeschoss", "Dachgeschoss", "Treppenhaus", "Andere"])
    .withSelected(0)

  const technischeshakfreicheckbox = new CheckboxField("div[class*='technischeshakfreicheckbox']")
    .withType((box) => box.required = true)

  const zusatzinfosinput = new TextAreaField("div[class*='zusatzinfosinput']")
  .withType((input) => {
    input.placeholder = "Ich habe einen Wintergarten, der bei der Montage abgedeckt werden soll.."
    input.style.width = "90%"
    input.style.height = "300px"
  })

  const fields = [
    technischeswlan,
    technischeserdkabel,
    technischespotentialausgleich,
    technischeshakbildupload,
    technischesanzahlhaks,
    technischeshakstandort,
    technischeshakfreicheckbox,
    zusatzinfosinput,
  ]

  fields.forEach(async field => {
    field.withType(type => type.fromStorage(funnel.storage))
    field.withStorage(funnel.storage)
    field.withInputEventListener(() => field.withStorage(funnel.storage))
  })

  const angeboterhaltenbutton = new DivField("div[class*='angeboterhaltenbutton']")
    .withClickEventListener(async () => {
      await savtToStorage()
      Helper.nextFunnel(funnel.paths)
    })

  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))

  async function savtToStorage() {
    await technischeswlan.withStorage(funnel.storage)
    await technischeserdkabel.withStorage(funnel.storage)
    await technischespotentialausgleich.withStorage(funnel.storage)
    await technischeshakbildupload.withStorage(funnel.storage)
    await technischesanzahlhaks.withStorage(funnel.storage)
    await technischeshakstandort.withStorage(funnel.storage)
    await technischeshakfreicheckbox.withStorage(funnel.storage)
    await zusatzinfosinput.withStorage(funnel.storage)
  }
}


