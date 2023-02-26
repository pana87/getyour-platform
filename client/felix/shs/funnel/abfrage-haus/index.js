import { CheckboxField } from "../../../../js/CheckboxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { Helper } from "../../../../js/Helper.js"
import { NumberField } from "../../../../js/NumberField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

// only you and your browser app feature
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

  const hausbaujahr = new NumberField("div[class*='hausbaujahr']")
  .withType((input) => {
    input.min = "1800"
    input.max = "2100"
    input.placeholder = "1922"
    input.required = true
  })

  const hausumbau = new NumberField("div[class*='hausumbau']")
  .withType((input) => {
    input.min = "1800"
    input.max = "2100"
    input.placeholder = "1962"
    input.required = true
  })

  const hausetage = new SelectionField("div[class*='hausetage']")
  .withOptions(["Keller", "Erdgeschoss", "1. Obergeschoss", "Dachgeschoss", "Andere"])

  const hausflaeche = new NumberField("div[class*='hausflaeche']")
  .withType((input) => {
    input.min = "0"
    input.max = "10000"
    input.placeholder = "in qm"
    input.required = true
  })

  const hausdckabelfuehrung = new SelectionField("div[class*='hausdckabelfuehrung']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausverkabelungdc = new SelectionField("div[class*='hausverkabelungdc']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausaussenfasadegedaemmt = new SelectionField("div[class*='hausaussenfasadegedaemmt']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausdenkmal = new SelectionField("div[class*='hausdenkmal']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausenergiesystementsorgen = new SelectionField("div[class*='hausenergiesystementsorgen']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausenergievorhanden = new SelectionField("div[class*='hausenergievorhanden']")
  .withOptions(["Nein", "Ja, ich habe schon eine Photovoltaikanlage", "Ja, ich habe schon eine Wärmepumpe", "Ja, ich habe schon eine Solarthermie", "Ja, ich habe schon ein Stromspeicher"])
  .withType((select) => {
    select.multiple = true
    if (select.value === "Nein") {
      document.querySelectorAll(hausenergiesystementsorgen.selectSelector).forEach(select => select.disabled = true)
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.value === "Nein") {
      document.querySelectorAll(hausenergiesystementsorgen.selectSelector).forEach(select => select.disabled = true)
    }
    if (event.target.value !== "Nein") {
      document.querySelectorAll(hausenergiesystementsorgen.selectSelector).forEach(select => select.disabled = false)
    }
  })

  const hauslager = new SelectionField("div[class*='hauslager']")
  .withOptions(["Ja", "Nein", "nicht bei mir zu Hause"])

  const hausdacheindeckung = new SelectionField("div[class*='hausdacheindeckung']")
  .withOptions(["gelegt", "geschraubt", "geklebt", "gebohrt"])
  .withType((select) => {
    select.disabled = true
    const q6 = funnel.value.q6
    if (q6 === 4) {
      select.disabled = false
    }
  })

  const hausukueberstand = new SelectionField("div[class*='hausukueberstand']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  .withRequired(0)
  .withType((select) => {
    const q7 = funnel.value.q7
    if (q7 !== 0) {
      select.disabled = true
    }
  })

  const hausandereshausabstand = new SelectionField("div[class*='hausandereshausabstand']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  .withRequired(0)
  .withType((select) => {
    const q7 = funnel.value.q7
    if (q7 !== 0) {
      select.disabled = true
    }
  })

  const hausentlueftungsrohre = new SelectionField("div[class*='hausentlueftungsrohre']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausblitzschutzanlage = new SelectionField("div[class*='hausblitzschutzanlage']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausbesonderheiten = new SelectionField("div[class*='hausbesonderheiten']")
  .withOptions(["Nein", "SAT Antennen", "Blitzableiter", "Schneefanggitter", "Dachfenster", "Dachgauben", "Freileitung", "Andere"])

  const hausabstandsparren = new NumberField("div[class*='hausabstandsparren']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.required = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      input.disabled = true
    }
  })

  const haussparrenbreite = new NumberField("div[class*='haussparrenbreite']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.required = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      input.disabled = true
    }
  })

  const haussparrenhoehe = new NumberField("div[class*='haussparrenhoehe']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.required = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      input.disabled = true
    }
  })

  const hausmaterialsparren = new SelectionField("div[class*='hausmaterialsparren']")
  .withOptions(["Holz", "Metall", "Sonstiges"])
  .withType((select) => {
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      select.disabled = true
    }
  })

  const hausgeruestoeffentlich = new SelectionField("div[class*='hausgeruestoeffentlich']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausgeruestselbstgestellt = new SelectionField("div[class*='hausgeruestselbstgestellt']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const hausverankerungcheckbox = new CheckboxField("div[class*='hausverankerungcheckbox']")
  .withType(checkbox => checkbox.required = true)

  const geruestaufstellungcheckboxnord = new CheckboxField("div[class*='geruestaufstellungcheckboxnord']")
  const geruestaufstellungcheckboxsued = new CheckboxField("div[class*='geruestaufstellungcheckboxsued']")
  const geruestaufstellungcheckboxost = new CheckboxField("div[class*='geruestaufstellungcheckboxost']")
  const geruestaufstellungcheckboxwest = new CheckboxField("div[class*='geruestaufstellungcheckboxwest']")

  const hausbreitedesgeruest = new NumberField("div[class*='hausbreitedesgeruest']")
  .withType(number => {
    number.min = 0
    number.max = 100
    number.placeholder = "in m"
  })

  const hauslaengedesgeruest = new NumberField("div[class*='hauslaengedesgeruest']")
  .withType(number => {
    number.min = 0
    number.max = 100
    number.placeholder = "in m"
  })

  const hauswievielegerueste = new NumberField("div[class*='hauswievielegerueste']")
  .withType(number => {
    number.min = 0
    number.max = 100
    number.placeholder = "1"
    number.required = true
  })

  const hausgesamtgeruestflaeche = new NumberField("div[class*='hausgesamtgeruestflaeche']")
  .withType(number => {
    number.min = 0
    number.max = 100
    number.placeholder = "in m^2"
  })

  const hausattikavorhanden = new SelectionField("div[class*='hausattikavorhanden']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  .withType((select) => {
    select.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      select.disabled = false
    }
  })

  const hausattikabreite = new NumberField("div[class*='hausattikabreite']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      input.required = true
      input.disabled = false
    }
  })

  const hausattikahoehe = new NumberField("div[class*='hausattikahoehe']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      input.required = true
      input.disabled = false
    }
  })

  const hausgradzahlflachdach = new NumberField("div[class*='hausgradzahlflachdach']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      input.required = true
      input.disabled = false
    }
  })

  const flachdachneigungbekanntcheckbo = new CheckboxField("div[class*='flachdachneigungbekanntcheckbo']")
  .withType((box) => {
    box.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      box.required = true
      box.disabled = false
    }
  })

  const flachdachnordcheckbox = new CheckboxField("div[class*='flachdachnordcheckbox']")
  .withType((box) => {
    box.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      box.disabled = false
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(flachdachostcheckbox.checkboxSelector).forEach(box => box.checked = false)
      document.querySelectorAll(flachdachsuedcheckbox.checkboxSelector).forEach(box => box.checked = false)
      document.querySelectorAll(flachdachwestcheckbox.checkboxSelector).forEach(box => box.checked = false)
    }
  })

  const flachdachostcheckbox = new CheckboxField("div[class*='flachdachostcheckbox']")
  .withType((box) => {
    box.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      box.disabled = false
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(flachdachnordcheckbox.checkboxSelector).forEach(box => box.checked = false)
      document.querySelectorAll(flachdachsuedcheckbox.checkboxSelector).forEach(box => box.checked = false)
      document.querySelectorAll(flachdachwestcheckbox.checkboxSelector).forEach(box => box.checked = false)
    }
  })

  const flachdachsuedcheckbox = new CheckboxField("div[class*='flachdachsuedcheckbox']")
  .withType((box) => {
    box.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      box.disabled = false
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(flachdachostcheckbox.checkboxSelector).forEach(box => box.checked = false)
      document.querySelectorAll(flachdachnordcheckbox.checkboxSelector).forEach(box => box.checked = false)
      document.querySelectorAll(flachdachwestcheckbox.checkboxSelector).forEach(box => box.checked = false)
    }
  })

  const flachdachwestcheckbox = new CheckboxField("div[class*='flachdachwestcheckbox']")
  .withType((box) => {
    box.disabled = true
    const q5 = funnel.value.q5
    if (q5 === 2 || q5 === 4) {
      box.disabled = false
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(flachdachostcheckbox.checkboxSelector).forEach(box => box.checked = false)
      document.querySelectorAll(flachdachsuedcheckbox.checkboxSelector).forEach(box => box.checked = false)
      document.querySelectorAll(flachdachnordcheckbox.checkboxSelector).forEach(box => box.checked = false)
    }
  })

  const haustrapezdachalu = new NumberField("div[class*='haustrapezdachalu']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in mm"
    input.disabled = true
    const q5 = funnel.value.q5
    const q6 = funnel.value.q6
    if (q5 === 2 && (q6 === 1 || q6 === 2)) {
      input.disabled = false
    }
  })

  const haustrapezdachstahl = new NumberField("div[class*='haustrapezdachstahl']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in mm"
    input.disabled = true
    const q5 = funnel.value.q5
    const q6 = funnel.value.q6
    if (q5 === 2 && (q6 === 1 || q6 === 2)) {
      input.disabled = false
    }
  })

  const icopalnichtcheckbox = new CheckboxField("div[class*='icopalnichtcheckbox']")
  .withType((box) => {
    box.disabled = true
    const q5 = funnel.value.q5
    const q6 = funnel.value.q6
    if (q5 === 2 && (q6 === 1 || q6 === 2)) {
      box.disabled = false
      box.required = true
    }
  })

  const dachtraufhoehe = new NumberField("div[class*='dachtraufhoehe']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in m"
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausdachbreite = new NumberField("div[class*='hausdachbreite']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in m"
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausdachlaenge = new NumberField("div[class*='hausdachlaenge']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in m"
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausfirsthoehe = new NumberField("div[class*='hausfirsthoehe']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in m"
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausdachausrichtung = new SelectionField("div[class*='hausdachausrichtung']")
  .withOptions(["Süd", "Nord", "Nord-Ost", "Ost", "Süd-Ost", "Süd-West", "West", "Nord-West"])
  .withType((select) => {
    select.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      select.disabled = false
    }
  })

  const hausdachneigung = new NumberField("div[class*='hausdachneigung']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in Grad"
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausfrontbildbildupload = new FileField("div[class*='hausfrontbildbildupload']")
  .withType((input) => {
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.accept = "image/*"
      input.required = true
      input.style.width = "100%"
      input.style.height = "100%"
    }
  })

  const haussuedansichtbildbildupload = new FileField("div[class*='haussuedansichtbildbildupload']")
  .withType((input) => {
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.accept = "image/*"
      input.style.width = "100%"
      input.style.height = "100%"
    }
  })

  const hausgerueststandortbildbildupl = new FileField("div[class*='hausgerueststandortbildbildupl']")
  .withType((input) => {
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.accept = "image/*"
      input.required = true
      input.multiple = true
      input.style.width = "100%"
      input.style.height = "100%"
    }
  })

  const hausortgangbildbildupload = new FileField("div[class*='hausortgangbildbildupload']")
  .withType((input) => {
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.accept = "image/*"
      input.required = true
      input.style.width = "100%"
      input.style.height = "100%"
    }
  })

  const haussparrenansichtbildbilduplo = new FileField("div[class*='haussparrenansichtbildbilduplo']")
  .withType((input) => {
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.accept = "image/*"
      input.required = true
      input.style.width = "100%"
      input.style.height = "100%"
    }
  })

  const hausziegelbildbildupload = new FileField("div[class*='hausziegelbildbildupload']")
  .withType((input) => {
    input.disabled = true
    const q5 = funnel.value.q5
    if (q5 !== 2) {
      input.disabled = false
      input.accept = "image/*"
      input.style.width = "100%"
      input.style.height = "100%"
    }
  })

  const hausdeckmasslaenge = new NumberField("div[class*='hausdeckmasslaenge']")
  .withType((input) => {
    input.min = "0"
    input.max = "100"
    input.placeholder = "in mm"
    input.required = true
  })

  const hausdeckmassbreite = new NumberField("div[class*='hausdeckmassbreite']")
  .withType((input) => {
    input.min = "0"
    input.max = "100"
    input.placeholder = "in mm"
    input.required = true
  })

  const hausersatzsiegel = new SelectionField("div[class*='hausersatzsiegel']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)

  const fields = [
    hausbaujahr,
    hausumbau,
    hausetage,
    hausflaeche,
    hausdckabelfuehrung,
    hausverkabelungdc,
    hausaussenfasadegedaemmt,
    hausdenkmal,
    hausenergievorhanden,
    hausenergiesystementsorgen,
    hauslager,
    hausdacheindeckung,
    hausukueberstand,
    hausandereshausabstand,
    hausentlueftungsrohre,
    hausblitzschutzanlage,
    hausbesonderheiten,
    hausabstandsparren,
    haussparrenbreite,
    haussparrenhoehe,
    hausmaterialsparren,
    hausgeruestoeffentlich,
    hausgeruestselbstgestellt,
    hausverankerungcheckbox,
    geruestaufstellungcheckboxnord,
    geruestaufstellungcheckboxsued,
    geruestaufstellungcheckboxost,
    geruestaufstellungcheckboxwest,
    hausbreitedesgeruest,
    hauslaengedesgeruest,
    hauswievielegerueste,
    hausgesamtgeruestflaeche,
    hausattikavorhanden,
    hausattikabreite,
    hausattikahoehe,
    hausgradzahlflachdach,
    flachdachneigungbekanntcheckbo,
    flachdachnordcheckbox,
    flachdachostcheckbox,
    flachdachsuedcheckbox,
    flachdachwestcheckbox,
    haustrapezdachalu,
    haustrapezdachstahl,
    icopalnichtcheckbox,
    dachtraufhoehe,
    hausdachbreite,
    hausdachlaenge,
    hausfirsthoehe,
    hausdachausrichtung,
    hausdachneigung,
    hausfrontbildbildupload,
    haussuedansichtbildbildupload,
    hausgerueststandortbildbildupl,
    hausortgangbildbildupload,
    haussparrenansichtbildbilduplo,
    hausziegelbildbildupload,
    hausdeckmasslaenge,
    hausdeckmassbreite,
    hausersatzsiegel,
  ]

  fields.forEach(async field => {
    field.withType(type => type.fromStorage(funnel.storage))
    field.withStorage(funnel.storage)
    field.withInputEventListener(() => field.withStorage(funnel.storage))
  })

  const speichernundweiterbutton = new DivField("div[class*='speichernundweiterbutton']")
    .withClickEventListener(async () => {
      await saveToStorage()
      Helper.nextFunnel(funnel.paths)
    })

  const impresum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))

  async function saveToStorage() {
    await hausbaujahr.withStorage(funnel.storage)
    await hausumbau.withStorage(funnel.storage)
    await hausetage.withStorage(funnel.storage)
    await hausflaeche.withStorage(funnel.storage)
    await hausdckabelfuehrung.withStorage(funnel.storage)
    await hausverkabelungdc.withStorage(funnel.storage)
    await hausaussenfasadegedaemmt.withStorage(funnel.storage)
    await hausdenkmal.withStorage(funnel.storage)
    await hausenergievorhanden.withStorage(funnel.storage)
    await hausenergiesystementsorgen.withStorage(funnel.storage)
    await hauslager.withStorage(funnel.storage)
    await hausdacheindeckung.withStorage(funnel.storage)
    await hausukueberstand.withStorage(funnel.storage)
    await hausandereshausabstand.withStorage(funnel.storage)
    await hausentlueftungsrohre.withStorage(funnel.storage)
    await hausblitzschutzanlage.withStorage(funnel.storage)
    await hausbesonderheiten.withStorage(funnel.storage)
    await hausabstandsparren.withStorage(funnel.storage)
    await haussparrenbreite.withStorage(funnel.storage)
    await haussparrenhoehe.withStorage(funnel.storage)
    await hausmaterialsparren.withStorage(funnel.storage)
    await hausgeruestoeffentlich.withStorage(funnel.storage)
    await hausgeruestselbstgestellt.withStorage(funnel.storage)
    await hausverankerungcheckbox.withStorage(funnel.storage)
    await geruestaufstellungcheckboxnord.withStorage(funnel.storage)
    await geruestaufstellungcheckboxsued.withStorage(funnel.storage)
    await geruestaufstellungcheckboxost.withStorage(funnel.storage)
    await geruestaufstellungcheckboxwest.withStorage(funnel.storage)
    await hausbreitedesgeruest.withStorage(funnel.storage)
    await hauslaengedesgeruest.withStorage(funnel.storage)
    await hauswievielegerueste.withStorage(funnel.storage)
    await hausgesamtgeruestflaeche.withStorage(funnel.storage)
    await hausattikavorhanden.withStorage(funnel.storage)
    await hausattikabreite.withStorage(funnel.storage)
    await hausattikahoehe.withStorage(funnel.storage)
    await hausgradzahlflachdach.withStorage(funnel.storage)
    await flachdachneigungbekanntcheckbo.withStorage(funnel.storage)
    await flachdachnordcheckbox.withStorage(funnel.storage)
    await flachdachostcheckbox.withStorage(funnel.storage)
    await flachdachsuedcheckbox.withStorage(funnel.storage)
    await flachdachwestcheckbox.withStorage(funnel.storage)
    await haustrapezdachalu.withStorage(funnel.storage)
    await haustrapezdachstahl.withStorage(funnel.storage)
    await icopalnichtcheckbox.withStorage(funnel.storage)
    await dachtraufhoehe.withStorage(funnel.storage)
    await hausdachbreite.withStorage(funnel.storage)
    await hausdachlaenge.withStorage(funnel.storage)
    await hausfirsthoehe.withStorage(funnel.storage)
    await hausdachausrichtung.withStorage(funnel.storage)
    await hausdachneigung.withStorage(funnel.storage)
    await hausfrontbildbildupload.withStorage(funnel.storage)
    await haussuedansichtbildbildupload.withStorage(funnel.storage)
    await hausgerueststandortbildbildupl.withStorage(funnel.storage)
    await hausortgangbildbildupload.withStorage(funnel.storage)
    await haussparrenansichtbildbilduplo.withStorage(funnel.storage)
    await hausziegelbildbildupload.withStorage(funnel.storage)
    await hausdeckmasslaenge.withStorage(funnel.storage)
    await hausdeckmassbreite.withStorage(funnel.storage)
    await hausersatzsiegel.withStorage(funnel.storage)
  }
}


