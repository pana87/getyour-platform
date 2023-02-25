import { CheckboxField } from "../../../../js/CheckboxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { Helper } from "../../../../js/Helper.js"
import { NumberField } from "../../../../js/NumberField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

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

  const heizungheizen = new SelectionField("div[class*='heizungheizen']")
    .withOptions(["Erdgas", "Heizöl", "Wärmepumpe", "Holz/Kohle", "Pellets", "Flüssiggas", "Strom", "Andere"])

  const heizungwie = new SelectionField("div[class*='heizungwie']")
    .withOptions(["Radiatoren/Konvektoren", "Flachheizkörper", "Fußboden-/Wandheizung", "Andere"])
    .withType((select) => {
      select.disabled = true
      const q9 = funnel.value.q9
      if (q9 === 0) {
        select.disabled = false
      }
    })

  const heizungvorlauf = new NumberField("div[class*='heizungvorlauf']")
    .withType((input) => {
      input.disabled = true
      const q9 = funnel.value.q9
      if (q9 === 0) {
        input.disabled = false
        input.min = "0"
        input.max = "1000"
        input.placeholder = "in Grad"
        input.required = true
      }
    })

  const heizungwarm = new SelectionField("div[class*='heizungwarm']")
    .withOptions(["Zentral über Heizung", "Separat (z.B. Durchlauferhitzer)", "Solarthermie", "Andere"])

  const heizungkosten = new NumberField("div[class*='heizungkosten']")
  .withType(input => {
    input.min = 0
    input.max = 1000000
    input.placeholder = "in Euro"
  })

  const heizungwaermepumpebildupload = new FileField("div[class*='heizungwaermepumpebildupload']")
    .withType((input) => {
      input.disabled = true
      const q9 = funnel.value.q9
      if (q9 === 0) {
        input.disabled = false
        input.required = true
        input.accept = "image/*"
      }
    })

  const heizungwasserspeicherbilduploa = new FileField("div[class*='heizungwasserspeicherbilduploa']")
  .withType((input) => {
    input.disabled = true
    const q9 = funnel.value.q9
    if (q9 === 0) {
      input.disabled = false
      input.required = true
      input.accept = "image/*"
    }
  })

  const heizungstromspeicherbildupload = new FileField("div[class*='heizungstromspeicherbildupload']")
  .withType((input) => {
    input.disabled = true
    const q8 = funnel.value.q8
    if (q8 === 0) {
      input.disabled = false
      input.required = true
      input.accept = "image/*"
    }
  })

  const traufhoeheviermetercheckbox = new CheckboxField("div[class*='traufhoeheviermetercheckbox']")
  .withType((box) => {
    box.disabled = true
    const q8 = funnel.value.q8
    if (q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })

  const speicherdritteetagecheckbox = new CheckboxField("div[class*='speicherdritteetagecheckbox']")
    .withType((box) => {
      box.disabled = true
      const q7 = funnel.value.q7
      const q8 = funnel.value.q8
      if (q7 === 0 || q8 === 0) {
        box.disabled = false
      }
    })

  const speicherzweiteetagecheckbox = new CheckboxField("div[class*='speicherzweiteetagecheckbox']")
  .withType((box) => {
    box.disabled = true
    const q7 = funnel.value.q7
    const q8 = funnel.value.q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
    }
  })

  const speichererdgeschosscheckbox = new CheckboxField("div[class*='speichererdgeschosscheckbox']")
  .withType((box) => {
    box.disabled = true
    const q7 = funnel.value.q7
    const q8 = funnel.value.q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
    }
  })

  const speicherkellercheckbox = new CheckboxField("div[class*='speicherkellercheckbox']")
  .withType((box) => {
    box.disabled = true
    const q7 = funnel.value.q7
    const q8 = funnel.value.q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
    }
  })

  const zaehlerdritteetagecheckbox = new CheckboxField("div[class*='zaehlerdritteetagecheckbox']")
  .withType((box) => {
    box.disabled = true
    const q7 = funnel.value.q7
    const q8 = funnel.value.q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
    }
  })

  const zaehlerzweiteetagecheckbox = new CheckboxField("div[class*='zaehlerzweiteetagecheckbox']")
  .withType((box) => {
    box.disabled = true
    const q7 = funnel.value.q7
    const q8 = funnel.value.q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
    }
  })

  const zaehlererdgeschosscheckbox = new CheckboxField("div[class*='zaehlererdgeschosscheckbox']")
  .withType((box) => {
    box.disabled = true
    const q7 = funnel.value.q7
    const q8 = funnel.value.q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
    }
  })

  const zaehlerkellercheckbox = new CheckboxField("div[class*='zaehlerkellercheckbox']")
  .withType((box) => {
    box.disabled = true
    const q7 = funnel.value.q7
    const q8 = funnel.value.q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
    }
  })

  const heizungeintrittzehnmeter = new SelectionField("div[class*='heizungeintrittzehnmeter']")
    .withOptions(["Nein", "Ja"])
    .withSelected(0)
    .withType((select) => {
      select.disabled = true
      const q7 = funnel.value.q7
      const q8 = funnel.value.q8
      const q9 = funnel.value.q9
      if (q7 === 0 || q8 === 0 || q9 === 0) {
        select.disabled = false
      }
    })

  const heizunggleichesgebaeude = new SelectionField("div[class*='heizunggleichesgebaeude']")
    .withOptions(["Ja", "Nein"])
    .withSelected(0)
    .withType((select) => {
      select.disabled = true
      const q7 = funnel.value.q7
      const q8 = funnel.value.q8
      const q9 = funnel.value.q9
      if (q7 === 0 || q8 === 0 || q9 === 0) {
        select.disabled = false
      }
    })

  const heizunggleicherraum = new SelectionField("div[class*='heizunggleicherraum']")
    .withOptions(["Ja", "Nein, 1 - 2 Räume entfernt", "Nein, mehr als 2 Räume entfernt"])
    .withSelected(0)
    .withType((select) => {
      select.disabled = true
      const q7 = funnel.value.q7
      const q8 = funnel.value.q8
      if (q7 === 0 || q8 === 0) {
        select.disabled = false
      }
    })

  const heizungmehralszwanzigmeter = new SelectionField("div[class*='heizungmehralszwanzigmeter']")
    .withOptions(["Nein", "20-30m", "30-40m", "40-50m", "mehr als 50m"])
    .withSelected(0)
    .withType((select) => {
      select.disabled = true
      const q7 = funnel.value.q7
      const q8 = funnel.value.q8
      if (q7 === 0 || q8 === 0) {
        select.disabled = false
      }
    })

  const fields = [
    heizungheizen,
    heizungwie,
    heizungvorlauf,
    heizungwarm,
    heizungkosten,
    heizungwaermepumpebildupload,
    heizungwasserspeicherbilduploa,
    heizungstromspeicherbildupload,
    traufhoeheviermetercheckbox,
    speicherdritteetagecheckbox,
    speicherzweiteetagecheckbox,
    speichererdgeschosscheckbox,
    speicherkellercheckbox,
    zaehlerdritteetagecheckbox,
    zaehlerzweiteetagecheckbox,
    zaehlererdgeschosscheckbox,
    zaehlerkellercheckbox,
    heizungmehralszwanzigmeter,
    heizunggleichesgebaeude,
    heizungeintrittzehnmeter,
    heizunggleicherraum,
  ]

  fields.forEach(async field => {
    field.withType(type => type.fromStorage(funnel.storage))
    field.withStorage(funnel.storage)
    field.withInputEventListener(() => field.withStorage(funnel.storage))
  })

  const angeboterhaltenbutton = new DivField("div[class*='angeboterhaltenbutton']")
    .withClickEventListener(async() => {
      await saveToStorage()
      Helper.nextFunnel(funnel.paths)
    })

  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))

  async function saveToStorage() {
    await heizungheizen.withStorage(funnel.storage)
    await heizungwie.withStorage(funnel.storage)
    await heizungvorlauf.withStorage(funnel.storage)
    await heizungwarm.withStorage(funnel.storage)
    await heizungkosten.withStorage(funnel.storage)
    await heizungwaermepumpebildupload.withStorage(funnel.storage)
    await heizungwasserspeicherbilduploa.withStorage(funnel.storage)
    await heizungstromspeicherbildupload.withStorage(funnel.storage)
    await traufhoeheviermetercheckbox.withStorage(funnel.storage)
    await speicherdritteetagecheckbox.withStorage(funnel.storage)
    await speicherzweiteetagecheckbox.withStorage(funnel.storage)
    await speichererdgeschosscheckbox.withStorage(funnel.storage)
    await speicherkellercheckbox.withStorage(funnel.storage)
    await zaehlerdritteetagecheckbox.withStorage(funnel.storage)
    await zaehlerzweiteetagecheckbox.withStorage(funnel.storage)
    await zaehlererdgeschosscheckbox.withStorage(funnel.storage)
    await zaehlerkellercheckbox.withStorage(funnel.storage)
    await heizungmehralszwanzigmeter.withStorage(funnel.storage)
    await heizunggleichesgebaeude.withStorage(funnel.storage)
    await heizungeintrittzehnmeter.withStorage(funnel.storage)
    await heizunggleicherraum.withStorage(funnel.storage)
  }

}

