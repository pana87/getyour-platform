import { CheckboxField } from "../../../../js/CheckBoxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_PATHNAME = "/felix/shs/funnel/abfrage-heizung/"

if (window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME) !== null) {

  const clickzumhausknopf = new DivField("div[class*='clickzumhausknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-haus/"))

  const clickzurheizungknopf = new DivField("div[class*='clickzurheizungknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-heizung/"))

  const clickzumzaehlerknopf = new DivField("div[class*='clickzumzaehlerknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-strom/"))

  const clicktechnischesknopf = new DivField("div[class*='clicktechnischesknopf']")
    .withClickEventListener(async() => await saveAndProceed("/felix/shs/funnel/abfrage-technisches/"))




  const hausbaujahr = new NumberField("div[class*='hausbaujahr']")
  .withType((input) => {
    input.min = "1800"
    input.max = "2100"
    input.placeholder = "1922"
    input.required = true
    // input.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME)
    // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausbaujahr"]
    // if (value !== undefined) input.value = value
  })
  // .withInputEventListener(() => {
  //   hausbaujahr.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })

  const hausumbau = new NumberField("div[class*='hausumbau']")
  .withType((input) => {
    input.min = "1800"
    input.max = "2100"
    input.placeholder = "1962"
    input.required = true
    // input.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME)

    // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausumbau"]
    // if (value !== undefined) input.value = value
  })
  // .withInputEventListener(() => {
  //   hausumbau.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })

    // .withMin("1800")
    // .withMax("2100")
    // .withPlaceholder("1920")
    // .withRequired()

  const hausetage = new SelectionField("div[class*='hausetage']")
  .withOptions(["Keller", "Erdgeschoss", "1. Obergeschoss", "Dachgeschoss", "Andere"])
  // .withSelect((select) => {
  //   // select.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME)
  //   // const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausetage"]
  //   // if (options !== undefined) select.setSelected(options)
  // })
  // .withInputEventListener(() => {
  //   hausetage.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })
  // hausetage.withStorage(SHS_FUNNEL_STORAGE_NAME)

  const hausflaeche = new NumberField("div[class*='hausflaeche']")
  .withType((input) => {
    input.min = "0"
    input.max = "10000"
    input.placeholder = "in qm"
    input.required = true
    // input.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME)

    // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausflaeche"]
    // if (value !== undefined) input.value = value
  })
  // .withInputEventListener(() => {
  //   hausflaeche.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })

  // return

    // .withMin("0")
    // .withMax("10000")
    // .withPlaceholder("in qm")
    // .withRequired()

  const hausdckabelfuehrung = new SelectionField("div[class*='hausdckabelfuehrung']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  // .withSelect((select) => {
  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausdckabelfuehrung"]
  //   if (options !== undefined) select.setSelected(options)

  //   // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausdckabelfuehrung"]
  //   // if (value !== undefined) select.value = value
  // })
  // .withInputEventListener(() => {
  //   hausdckabelfuehrung.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })
  // hausdckabelfuehrung.withStorage(SHS_FUNNEL_STORAGE_NAME)


  const hausverkabelungdc = new SelectionField("div[class*='hausverkabelungdc']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  // .withSelect((select) => {
  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausverkabelungdc"]
  //   if (options !== undefined) select.setSelected(options)

  //   // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausverkabelungdc"]
  //   // if (value !== undefined) select.value = value
  // })
  // .withInputEventListener(() => {
  //   hausverkabelungdc.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })
  // hausverkabelungdc.withStorage(SHS_FUNNEL_STORAGE_NAME)


  const hausaussenfasadegedaemmt = new SelectionField("div[class*='hausaussenfasadegedaemmt']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  // .withSelect((select) => {
  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausaussenfasadegedaemmt"]
  //   if (options !== undefined) select.setSelected(options)

  //   // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausaussenfasadegedaemmt"]
  //   // if (value !== undefined) select.value = value
  // })
  // .withInputEventListener(() => {
  //   hausaussenfasadegedaemmt.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })
  // hausaussenfasadegedaemmt.withStorage(SHS_FUNNEL_STORAGE_NAME)



  const hausdenkmal = new SelectionField("div[class*='hausdenkmal']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  // .withSelect((select) => {
  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausdenkmal"]
  //   if (options !== undefined) select.setSelected(options)

  //   // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausdenkmal"]
  //   // if (value !== undefined) select.value = value
  // })
  // .withInputEventListener(() => {
  //   hausdenkmal.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })
  // hausdenkmal.withStorage(SHS_FUNNEL_STORAGE_NAME)


  const hausenergiesystementsorgen = new SelectionField("div[class*='hausenergiesystementsorgen']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  // .withSelect((select) => {

  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausenergiesystementsorgen"]
  //   if (options !== undefined) select.setSelected(options)

  //   // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausenergiesystementsorgen"]
  //   // if (value !== undefined) select.value = value
  // })
  // .withInputEventListener(() => {
  //   hausenergiesystementsorgen.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })
  // hausenergiesystementsorgen.withStorage(SHS_FUNNEL_STORAGE_NAME)



  const hausenergievorhanden = new SelectionField("div[class*='hausenergievorhanden']")
  .withOptions(["Nein", "Ja, ich habe schon eine Photovoltaikanlage", "Ja, ich habe schon eine Wärmepumpe", "Ja, ich habe schon eine Solarthermie", "Ja, ich habe schon ein Stromspeicher"])
  .withType((select) => {
    select.multiple = true

    // const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausenergievorhanden"]
    // if (options !== undefined) select.setSelected(options)
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
    // hausenergievorhanden.withStorage(SHS_FUNNEL_STORAGE_NAME)
  })
  // hausenergievorhanden.withStorage(SHS_FUNNEL_STORAGE_NAME)


  const hauslager = new SelectionField("div[class*='hauslager']")
  .withOptions(["Ja", "Nein", "nicht bei mir zu Hause"])
  // .withSelect((select) => {
  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hauslager"]
  //   if (options !== undefined) select.setSelected(options)
  // })
  // .withInputEventListener(() => {
  //   hauslager.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })


  const hausdacheindeckung = new SelectionField("div[class*='hausdacheindeckung']")
  .withOptions(["gelegt", "geschraubt", "geklebt", "gebohrt"])
  .withType((select) => {
    select.disabled = true
    // const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausdacheindeckung"]
    // if (options !== undefined) select.setSelected(options)
    const q6 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q6
    if (q6 === 4) {
      select.disabled = false
    }
  })
  // .withInputEventListener(() => {
  //   hausdacheindeckung.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })


  const hausukueberstand = new SelectionField("div[class*='hausukueberstand']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  .withRequired(0)
  .withType((select) => {
    // const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausukueberstand"]
    // if (options !== undefined) select.setSelected(options)
    const q7 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q7
    if (q7 !== 0) {
      select.disabled = true
    }
  })
  // .withInputEventListener(() => {
  //   hausukueberstand.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })

  const hausandereshausabstand = new SelectionField("div[class*='hausandereshausabstand']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  .withRequired(0)
  .withType((select) => {
    // const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausandereshausabstand"]
    // if (options !== undefined) select.setSelected(options)
    const q7 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q7
    if (q7 !== 0) {
      select.disabled = true
    }
  })
  // .withInputEventListener(() => {
  //   hausandereshausabstand.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })

  const hausentlueftungsrohre = new SelectionField("div[class*='hausentlueftungsrohre']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  // .withSelect((select) => {
  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausentlueftungsrohre"]
  //   if (options !== undefined) select.setSelected(options)
  // })
  // .withInputEventListener(() => {
  //   hausentlueftungsrohre.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })


  const hausblitzschutzanlage = new SelectionField("div[class*='hausblitzschutzanlage']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  // .withSelect((select) => {
  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausblitzschutzanlage"]
  //   if (options !== undefined) select.setSelected(options)
  // })
  // .withInputEventListener(() => {
  //   hausblitzschutzanlage.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })


  const hausbesonderheiten = new SelectionField("div[class*='hausbesonderheiten']")
  .withOptions(["Nein", "SAT Antennen", "Blitzableiter", "Schneefanggitter", "Dachfenster", "Dachgauben", "Freileitung", "Andere"])
  // .withSelect((select) => {
  //   const options = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausbesonderheiten"]
  //   if (options !== undefined) select.setSelected(options)
  // })
  // .withInputEventListener(() => {
  //   hausbesonderheiten.withStorage(SHS_FUNNEL_STORAGE_NAME)
  // })

  const hausabstandsparren = new NumberField("div[class*='hausabstandsparren']")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.required = true
    // input.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME)
    // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausabstandsparren"]
    // if (value !== undefined) input.value = value
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 === 2 || q5 === 4) {
      input.disabled = true
    }
  })

  const haussparrenbreite = new NumberField("div[class*='haussparrenbreite']")
  // .withMin("0").withMax("100").withPlaceholder("in cm")
  // .withRequired()
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.required = true
    // input.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME)
    // const value = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME))["hausabstandsparren"]
    // if (value !== undefined) input.value = value
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 === 2 || q5 === 4) {
      input.disabled = true
    }
  })

  const haussparrenhoehe = new NumberField("div[class*='haussparrenhoehe']")
    // .withMin("0").withMax("100").withPlaceholder("in cm")
    // .withRequired()
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.required = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 === 2 || q5 === 4) {
      input.disabled = true
    }
  })

  const hausmaterialsparren = new SelectionField("div[class*='hausmaterialsparren']")
  .withOptions(["Holz", "Metall", "Sonstiges"])
  .withType((select) => {
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    // .withMin("0").withMax("100").withPlaceholder("in m")

  const hauslaengedesgeruest = new NumberField("div[class*='hauslaengedesgeruest']")
  .withType(number => {
    number.min = 0
    number.max = 100
    number.placeholder = "in m"
  })
    // .withMin("0").withMax("100").withPlaceholder("in m")

  const hauswievielegerueste = new NumberField("div[class*='hauswievielegerueste']")
  .withType(number => {
    number.min = 0
    number.max = 100
    number.placeholder = "1"
    number.required = true
  })
    // .withMin("0").withMax("100").withPlaceholder("1")
    // .withRequired()

  const hausgesamtgeruestflaeche = new NumberField("div[class*='hausgesamtgeruestflaeche']")
  .withType(number => {
    number.min = 0
    number.max = 100
    number.placeholder = "in m^2"
  })
    // .withMin("0").withMax("100").withPlaceholder("in m^2")

  const hausattikavorhanden = new SelectionField("div[class*='hausattikavorhanden']")
  .withOptions(["Ja", "Nein"])
  .withSelected(1)
  .withType((select) => {
    select.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 === 2 || q5 === 4) {
      select.disabled = false
    }
  })

  const hausattikabreite = new NumberField("div[class*='hausattikabreite']")
    // .withMin("0").withMax("100").withPlaceholder("in cm")
    // .withRequired()
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 === 2 || q5 === 4) {
      input.required = true
      input.disabled = false
    }
  })

  const hausattikahoehe = new NumberField("div[class*='hausattikahoehe']")
    // .withMin("0").withMax("100").withPlaceholder("in cm")
    // .withRequired()
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 === 2 || q5 === 4) {
      input.required = true
      input.disabled = false
    }
  })

  const hausgradzahlflachdach = new NumberField("div[class*='hausgradzahlflachdach']")
    // .withMin("0").withMax("100").withPlaceholder("in m")
    // .withRequired()
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in cm"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 === 2 || q5 === 4) {
      input.required = true
      input.disabled = false
    }
  })

  const flachdachneigungbekanntcheckbo = new CheckboxField("div[class*='flachdachneigungbekanntcheckbo']")
  // .withRequired()
  .withType((box) => {
    box.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 === 2 || q5 === 4) {
      box.required = true
      box.disabled = false
    }
  })

  const flachdachnordcheckbox = new CheckboxField("div[class*='flachdachnordcheckbox']")
  .withType((box) => {
    box.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
  // .withMin("0").withMax("100").withPlaceholder("in mm")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in mm"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    const q6 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q6
    if (q5 === 2 && (q6 === 1 || q6 === 2)) {
      input.disabled = false
    }
  })

  const haustrapezdachstahl = new NumberField("div[class*='haustrapezdachstahl']")
  // .withMin("0").withMax("100").withPlaceholder("in mm")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in mm"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    const q6 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q6
    if (q5 === 2 && (q6 === 1 || q6 === 2)) {
      input.disabled = false
    }
  })

  const icopalnichtcheckbox = new CheckboxField("div[class*='icopalnichtcheckbox']")
    // .withRequired()
  .withType((box) => {
    box.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    const q6 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q6
    if (q5 === 2 && (q6 === 1 || q6 === 2)) {
      box.disabled = false
      box.required = true
    }
  })

  const dachtraufhoehe = new NumberField("div[class*='dachtraufhoehe']")
    // .withMin("0").withMax("100").withPlaceholder("in m")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in m"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausdachbreite = new NumberField("div[class*='hausdachbreite']")
  // .withMin("0").withMax("100").withPlaceholder("in m")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in m"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausdachlaenge = new NumberField("div[class*='hausdachlaenge']")
  // .withMin("0").withMax("100").withPlaceholder("in m")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in m"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausfirsthoehe = new NumberField("div[class*='hausfirsthoehe']")
    // .withMin("0").withMax("100").withPlaceholder("in m")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in m"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausdachausrichtung = new SelectionField("div[class*='hausdachausrichtung']")
  .withOptions(["Süd", "Nord", "Nord-Ost", "Ost", "Süd-Ost", "Süd-West", "West", "Nord-West"])
  .withType((select) => {
    select.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 !== 2) {
      select.disabled = false
    }
  })

  const hausdachneigung = new NumberField("div[class*='hausdachneigung']")
    // .withMin("0").withMax("100").withPlaceholder("in Grad")
  .withType((input) => {
    input.min = 0
    input.max = 100
    input.placeholder = "in Grad"
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
    if (q5 !== 2) {
      input.disabled = false
      input.required = true
    }
  })

  const hausfrontbildbildupload = new FileField("div[class*='hausfrontbildbildupload']")
  .withType((input) => {
    input.disabled = true
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    const q5 = JSON.parse(window.sessionStorage.getItem(SHS_FUNNEL_STORAGE_NAME)).q5
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
    field.withType(type => type.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME))
    field.withStorage(SHS_FUNNEL_STORAGE_NAME)
    field.withInputEventListener(() => field.withStorage(SHS_FUNNEL_STORAGE_NAME))
  })

  const speichernundweiterbutton = new DivField("div[class*='speichernundweiterbutton']")
    .withClickEventListener(async () => await saveAndProceed(NEXT_PATHNAME))

  const impresum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))

  async function saveAndProceed(pathname) {
    await hausbaujahr.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausumbau.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausetage.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausflaeche.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdckabelfuehrung.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausverkabelungdc.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausaussenfasadegedaemmt.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdenkmal.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausenergievorhanden.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausenergiesystementsorgen.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hauslager.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdacheindeckung.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausukueberstand.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausandereshausabstand.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausentlueftungsrohre.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausblitzschutzanlage.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausbesonderheiten.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausabstandsparren.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await haussparrenbreite.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await haussparrenhoehe.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausmaterialsparren.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausgeruestoeffentlich.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausgeruestselbstgestellt.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausverankerungcheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await geruestaufstellungcheckboxnord.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await geruestaufstellungcheckboxsued.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await geruestaufstellungcheckboxost.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await geruestaufstellungcheckboxwest.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausbreitedesgeruest.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hauslaengedesgeruest.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hauswievielegerueste.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausgesamtgeruestflaeche.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausattikavorhanden.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausattikabreite.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausattikahoehe.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausgradzahlflachdach.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await flachdachneigungbekanntcheckbo.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await flachdachnordcheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await flachdachostcheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await flachdachsuedcheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await flachdachwestcheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await haustrapezdachalu.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await haustrapezdachstahl.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await icopalnichtcheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await dachtraufhoehe.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdachbreite.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdachlaenge.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausfirsthoehe.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdachausrichtung.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdachneigung.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausfrontbildbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await haussuedansichtbildbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausgerueststandortbildbildupl.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausortgangbildbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await haussparrenansichtbildbilduplo.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausziegelbildbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdeckmasslaenge.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausdeckmassbreite.withStorage(SHS_FUNNEL_STORAGE_NAME)
    await hausersatzsiegel.withStorage(SHS_FUNNEL_STORAGE_NAME)

    window.location.assign(pathname)
  }
} else {
  window.location.assign("/felix/shs/funnel/qualifizierung/")
}


