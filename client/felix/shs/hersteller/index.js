import { DivField } from "../../../js/DivField.js"

const angebotdatenaendern = new DivField("div[class*='angebotdatenaendern']")
  .withClickEventListener(() => window.location.assign("/felix/shs/funnel/abfrage-haus/"))

const zumangebotbutton = new DivField("div[class*='zumangebotbutton']")
  .withOverlayClickEventListener((event) => {
    // event.addOverlay()
    // get funnel info
    const shsFunnel = JSON.parse(sessionStorage.getItem("shsFunnel"))
    if (shsFunnel !== null) {
      // create offer from funnel
      // save it in sessionStorage
      window.sessionStorage.setItem("offers", JSON.stringify([]))
      window.location.assign("/felix/shs/funnel/abfrage-persoenliches/")
      return
    }

    window.location.assign("/felix/shs/funnel/qualifizierung/")
  })

const impressum = new DivField("div[class*='impressum']")
  .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

const datenschutz = new DivField("div[class*='datenschutz']")
  .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))
