import { DivField } from "../../../js/DivField.js"

const angebotdatenaendern = new DivField("div[class*='angebotdatenaendern']")
  .withClickEventListener(() => window.location.assign("/felix/shs/funnel/abfrage-haus/"))

const zumangebotbutton = new DivField("div[class*='zumangebotbutton']")
  .withClickEventListener(() => window.location.assign("/felix/shs/funnel/abfrage-persoenliches/"))

const impressum = new DivField("div[class*='impressum']")
  .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

const datenschutz = new DivField("div[class*='datenschutz']")
  .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))
