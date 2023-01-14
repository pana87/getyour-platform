import { CheckboxField } from "../../../../js/CheckBoxField.js"
import { DivField } from "../../../../js/DivField.js"
import { FileField } from "../../../../js/FileField.js"
import { NumberField } from "../../../../js/NumberField.js"
import { SelectionField } from "../../../../js/SelectionField.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_FUNNEL_PATHNAME = "/felix/shs/funnel/abfrage-strom/"
const PREVIOUS_FUNNEL_PATHNAME = "/felix/shs/funnel/abfrage-haus/"

if (window.sessionStorage.getItem("shsFunnel") !== null) {


  const heizungheizen = new SelectionField("div[class*='heizungheizen']")
    .withOptions(["Erdgas", "Heizöl", "Wärmepumpe", "Holz/Kohle", "Pellets", "Flüssiggas", "Strom", "Andere"])


  const heizungwie = new SelectionField("div[class*='heizungwie']")
    .withOptions(["Radiatoren/Konvektoren", "Flachheizkörper", "Fußboden-/Wandheizung", "Andere"])
    .withSelect((select) => {
      select.disabled = true
      const q9 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q9
      if (q9 === 0) {
        select.disabled = false
      }
    })

  const heizungvorlauf = new NumberField("div[class*='heizungvorlauf']")
    .withInput((input) => {
      input.disabled = true
      const q9 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q9
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
    .withMin(0)
    .withMax(1000000)
    .withPlaceholder("in Euro")

  const heizungwaermepumpebildupload = new FileField("div[class*='heizungwaermepumpebildupload']")
    .withInput((input) => {
      input.disabled = true
      const q9 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q9
      if (q9 === 0) {
        input.disabled = false
        input.required = true
        input.accept = "image/*"
      }
    })

  const heizungwasserspeicherbilduploa = new FileField("div[class*='heizungwasserspeicherbilduploa']")
  .withInput((input) => {
    input.disabled = true
    const q9 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q9
    if (q9 === 0) {
      input.disabled = false
      input.required = true
      input.accept = "image/*"
    }
  })

  const heizungstromspeicherbildupload = new FileField("div[class*='heizungstromspeicherbildupload']")
  .withInput((input) => {
    input.disabled = true
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q8 === 0) {
      input.disabled = false
      input.required = true
      input.accept = "image/*"
    }
  })

  const traufhoeheviermetercheckbox = new CheckboxField("div[class*='traufhoeheviermetercheckbox']")
  .withCheckbox((box) => {
    box.disabled = true
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })

  const speicherdritteetagecheckbox = new CheckboxField("div[class*='speicherdritteetagecheckbox']")
    .withCheckbox((box) => {
      box.disabled = true
      const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
      const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
      if (q7 === 0 || q8 === 0) {
        box.disabled = false
        box.required = true
      }
    })
    .withChangeEventListener((event) => {
      if (event.target.checked) {
        document.querySelectorAll(speicherzweiteetagecheckbox.checkboxSelector).forEach(box => {
          box.checked = false
          box.required = false
        })
        document.querySelectorAll(speichererdgeschosscheckbox.checkboxSelector).forEach(box => {
          box.checked = false
          box.required = false
        })
        document.querySelectorAll(speicherkellercheckbox.checkboxSelector).forEach(box => {
          box.checked = false
          box.required = false
        })
        speicherdritteetagecheckbox.withValidValue()
        speicherzweiteetagecheckbox.withValidValue()
        speichererdgeschosscheckbox.withValidValue()
        speicherkellercheckbox.withValidValue()
        return
      }
      document.querySelectorAll(speicherdritteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
      document.querySelectorAll(speicherzweiteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
      document.querySelectorAll(speichererdgeschosscheckbox.checkboxSelector).forEach(box => box.required = true)
      document.querySelectorAll(speicherkellercheckbox.checkboxSelector).forEach(box => box.required = true)
      speicherdritteetagecheckbox.withValidValue()
      speicherzweiteetagecheckbox.withValidValue()
      speichererdgeschosscheckbox.withValidValue()
      speicherkellercheckbox.withValidValue()
    })

  const speicherzweiteetagecheckbox = new CheckboxField("div[class*='speicherzweiteetagecheckbox']")
  .withCheckbox((box) => {
    box.disabled = true
    const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(speicherdritteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(speichererdgeschosscheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(speicherkellercheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      speicherdritteetagecheckbox.withValidValue()
      speicherzweiteetagecheckbox.withValidValue()
      speichererdgeschosscheckbox.withValidValue()
      speicherkellercheckbox.withValidValue()
      return
    }
    document.querySelectorAll(speicherdritteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speicherzweiteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speichererdgeschosscheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speicherkellercheckbox.checkboxSelector).forEach(box => box.required = true)
    speicherdritteetagecheckbox.withValidValue()
    speicherzweiteetagecheckbox.withValidValue()
    speichererdgeschosscheckbox.withValidValue()
    speicherkellercheckbox.withValidValue()
  })

  const speichererdgeschosscheckbox = new CheckboxField("div[class*='speichererdgeschosscheckbox']")
  .withCheckbox((box) => {
    box.disabled = true
    const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(speicherdritteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(speicherzweiteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(speicherkellercheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      speicherdritteetagecheckbox.withValidValue()
      speicherzweiteetagecheckbox.withValidValue()
      speichererdgeschosscheckbox.withValidValue()
      speicherkellercheckbox.withValidValue()
      return
    }
    document.querySelectorAll(speicherdritteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speicherzweiteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speichererdgeschosscheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speicherkellercheckbox.checkboxSelector).forEach(box => box.required = true)
    speicherdritteetagecheckbox.withValidValue()
    speicherzweiteetagecheckbox.withValidValue()
    speichererdgeschosscheckbox.withValidValue()
    speicherkellercheckbox.withValidValue()
  })

  const speicherkellercheckbox = new CheckboxField("div[class*='speicherkellercheckbox']")
  .withCheckbox((box) => {
    box.disabled = true
    const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(speicherdritteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(speicherzweiteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(speichererdgeschosscheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      speicherdritteetagecheckbox.withValidValue()
      speicherzweiteetagecheckbox.withValidValue()
      speichererdgeschosscheckbox.withValidValue()
      speicherkellercheckbox.withValidValue()
      return
    }
    document.querySelectorAll(speicherdritteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speicherzweiteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speichererdgeschosscheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(speicherkellercheckbox.checkboxSelector).forEach(box => box.required = true)
    speicherdritteetagecheckbox.withValidValue()
    speicherzweiteetagecheckbox.withValidValue()
    speichererdgeschosscheckbox.withValidValue()
    speicherkellercheckbox.withValidValue()
  })

  const zaehlerdritteetagecheckbox = new CheckboxField("div[class*='zaehlerdritteetagecheckbox']")
  .withCheckbox((box) => {
    box.disabled = true
    const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(zaehlerzweiteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(zaehlererdgeschosscheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(zaehlerkellercheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      zaehlerdritteetagecheckbox.withValidValue()
      zaehlerzweiteetagecheckbox.withValidValue()
      zaehlererdgeschosscheckbox.withValidValue()
      zaehlerkellercheckbox.withValidValue()
      return
    }
    document.querySelectorAll(zaehlerdritteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlerzweiteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlererdgeschosscheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlerkellercheckbox.checkboxSelector).forEach(box => box.required = true)
    zaehlerdritteetagecheckbox.withValidValue()
    zaehlerzweiteetagecheckbox.withValidValue()
    zaehlererdgeschosscheckbox.withValidValue()
    zaehlerkellercheckbox.withValidValue()
  })

  const zaehlerzweiteetagecheckbox = new CheckboxField("div[class*='zaehlerzweiteetagecheckbox']")
  .withCheckbox((box) => {
    box.disabled = true
    const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(zaehlerdritteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(zaehlererdgeschosscheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(zaehlerkellercheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      zaehlerdritteetagecheckbox.withValidValue()
      zaehlerzweiteetagecheckbox.withValidValue()
      zaehlererdgeschosscheckbox.withValidValue()
      zaehlerkellercheckbox.withValidValue()
      return
    }
    document.querySelectorAll(zaehlerdritteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlerzweiteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlererdgeschosscheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlerkellercheckbox.checkboxSelector).forEach(box => box.required = true)
    zaehlerdritteetagecheckbox.withValidValue()
    zaehlerzweiteetagecheckbox.withValidValue()
    zaehlererdgeschosscheckbox.withValidValue()
    zaehlerkellercheckbox.withValidValue()
  })

  const zaehlererdgeschosscheckbox = new CheckboxField("div[class*='zaehlererdgeschosscheckbox']")
  .withCheckbox((box) => {
    box.disabled = true
    const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(zaehlerdritteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(zaehlerzweiteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(zaehlerkellercheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      zaehlerdritteetagecheckbox.withValidValue()
      zaehlerzweiteetagecheckbox.withValidValue()
      zaehlererdgeschosscheckbox.withValidValue()
      zaehlerkellercheckbox.withValidValue()
      return
    }
    document.querySelectorAll(zaehlerdritteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlerzweiteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlererdgeschosscheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlerkellercheckbox.checkboxSelector).forEach(box => box.required = true)
    zaehlerdritteetagecheckbox.withValidValue()
    zaehlerzweiteetagecheckbox.withValidValue()
    zaehlererdgeschosscheckbox.withValidValue()
    zaehlerkellercheckbox.withValidValue()
  })

  const zaehlerkellercheckbox = new CheckboxField("div[class*='zaehlerkellercheckbox']")
  .withCheckbox((box) => {
    box.disabled = true
    const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
    const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
    if (q7 === 0 || q8 === 0) {
      box.disabled = false
      box.required = true
    }
  })
  .withChangeEventListener((event) => {
    if (event.target.checked) {
      document.querySelectorAll(zaehlerdritteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(zaehlerzweiteetagecheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      document.querySelectorAll(zaehlererdgeschosscheckbox.checkboxSelector).forEach(box => {
        box.checked = false
        box.required = false
      })
      zaehlerkellercheckbox.withValidValue()
      zaehlererdgeschosscheckbox.withValidValue()
      zaehlerzweiteetagecheckbox.withValidValue()
      zaehlerdritteetagecheckbox.withValidValue()
      return
    }
    document.querySelectorAll(zaehlerdritteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlerzweiteetagecheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlererdgeschosscheckbox.checkboxSelector).forEach(box => box.required = true)
    document.querySelectorAll(zaehlerkellercheckbox.checkboxSelector).forEach(box => box.required = true)
    zaehlerdritteetagecheckbox.withValidValue()
    zaehlerzweiteetagecheckbox.withValidValue()
    zaehlererdgeschosscheckbox.withValidValue()
    zaehlerkellercheckbox.withValidValue()
  })

  const heizungeintrittzehnmeter = new SelectionField("div[class*='heizungeintrittzehnmeter']")
    .withOptions(["Nein", "Ja"])
    .withSelected(0)
    .withSelect((select) => {
      select.disabled = true
      const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
      const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
      const q9 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q9
      if (q7 === 0 || q8 === 0 || q9 === 0) {
        select.disabled = false
      }
    })

  const heizunggleichesgebaeude = new SelectionField("div[class*='heizunggleichesgebaeude']")
    .withOptions(["Ja", "Nein"])
    .withSelected(0)
    .withSelect((select) => {
      select.disabled = true
      const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
      const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
      const q9 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q9
      if (q7 === 0 || q8 === 0 || q9 === 0) {
        select.disabled = false
      }
    })

  const heizunggleicherraum = new SelectionField("div[class*='heizunggleicherraum']")
    .withOptions(["Ja", "Nein, 1 - 2 Räume entfernt", "Nein, mehr als 2 Räume entfernt"])
    .withSelected(0)
    .withSelect((select) => {
      select.disabled = true
      const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
      const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
      if (q7 === 0 || q8 === 0) {
        select.disabled = false
      }
    })

  const heizungmehralszwanzigmeter = new SelectionField("div[class*='heizungmehralszwanzigmeter']")
    .withOptions(["Nein", "20-30m", "30-40m", "40-50m", "mehr als 50m"])
    .withSelected(0)
    .withSelect((select) => {
      select.disabled = true
      const q7 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q7
      const q8 = JSON.parse(window.sessionStorage.getItem("shsFunnel")).q8
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

  fields.forEach(field => field.withValidValue())
  fields.forEach(field => field.withInputEventListener(() => field.withValidValue()))


  const saveAndProceed = new DivField("div[class*='angeboterhaltenbutton']")
    .withClickEventListener(async () => {
      // save in storage

      await heizungheizen.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungwie.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungvorlauf.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungwarm.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungkosten.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungwaermepumpebildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungwasserspeicherbilduploa.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungstromspeicherbildupload.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await traufhoeheviermetercheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await speicherdritteetagecheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await speicherzweiteetagecheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await speichererdgeschosscheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await speicherkellercheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await zaehlerdritteetagecheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await zaehlerzweiteetagecheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await zaehlererdgeschosscheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await zaehlerkellercheckbox.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungmehralszwanzigmeter.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizunggleichesgebaeude.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizungeintrittzehnmeter.withStorage(SHS_FUNNEL_STORAGE_NAME)
      await heizunggleicherraum.withStorage(SHS_FUNNEL_STORAGE_NAME)

      window.location.assign(NEXT_FUNNEL_PATHNAME)
    })


  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))
} else {
  window.location.assign("/felix/shs/funnel/qualifizierung/")
}

