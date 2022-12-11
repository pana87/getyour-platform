import { SHSInteraction } from "../../../js/SHSInteraction.js";

new SHSInteraction("img[class*=logo]").withClickAssign("/felix/shs/")
new SHSInteraction("div[class*=angeboterstellenbutton]").withClickAssign("/felix/shs/funnel/start/")
new SHSInteraction("div[class*=impressumgobutton]").withClickAssign("/felix/shs/impressum/")
new SHSInteraction("div[class*=datenschutzgobutton]").withClickAssign("/felix/shs/datenschutz/")
