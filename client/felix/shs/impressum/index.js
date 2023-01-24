import { DivField } from "../../../js/DivField.js"

const zumloginbutton = new DivField("div[class*='zumloginbutton']")
.withClickEventListener(() => window.location.assign("/felix/shs/anmelden/"))

const impressumgobutton = new DivField("div[class*='impressumgobutton']")
.withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

const datenschutzgobutton = new DivField("div[class*='datenschutzgobutton']")
.withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))
