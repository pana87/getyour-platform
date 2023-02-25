import { DivField } from "../../js/DivField.js"
import { Helper } from "../../js/Helper.js"

document.querySelectorAll("img[class*='logo']").forEach(img => {
  img.src = "/felix/shs/img/shslogo.png"
  img.alt = "SHS Express Logo"
  img.style.cursor = "pointer"
  img.addEventListener("click", async() => {
    const res = await Helper.redirectOperatorToChecklist()
    if (res.status === 200) {
      window.location.assign(`/felix/shs/checkliste/${res.response}/`)
    }
  })
})

const zumloginbutton = new DivField("div[class*='zumloginbutton']")
.withClickEventListener(() => window.location.assign("/home/"))

const angeboterstellenbutton = new DivField("div[class*='angeboterstellenbutton']")
.withClickEventListener(() => window.location.assign("/felix/shs/funnel/qualifizierung/"))

const impressumgobutton = new DivField("div[class*='impressumgobutton']")
.withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

const datenschutzgobutton = new DivField("div[class*='datenschutzgobutton']")
.withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))


