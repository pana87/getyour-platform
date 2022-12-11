import { SHSInteraction } from "../../../js/SHSInteraction.js";

new SHSInteraction("img[class*=logo]").withClickAssign("/felix/shs/")
new SHSInteraction("div[class*=impressumgobutton]").withClickAssign("/felix/shs/impressum/")
new SHSInteraction("div[class*=datenschutzgobutton]").withClickAssign("/felix/shs/datenschutz/")

const titelFields = document.querySelectorAll("div[class*='hier-knnen-sich-sie']")

if (titelFields.length !== 0) {
  titelFields.forEach(title => title.innerHTML = "Dieser Bereich<br/>wird gerade für dich<br/> aufgebaut.")
}
