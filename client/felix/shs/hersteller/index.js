import { DivField } from "../../../js/DivField.js"
import { Request } from "../../../js/Request.js"
import { AnchorField } from "../../../js/AnchorField.js"

const funnel = JSON.parse(window.localStorage.getItem("shsFunnel"))
if (funnel === null) {
  window.location.assign("/felix/shs/funnel/qualifizierung/")
} else {

  document.querySelectorAll("img[class*='logo-icon']").forEach(img => {
    img.src = "../../../felix/shs/img/shslogo.png"
    img.alt = "SHS Express Logo"
  })

  const angebotdatenaendern = new DivField("div[class*='angebotdatenaendern']")
    .withClickEventListener(() => window.location.assign("/felix/shs/funnel/abfrage-haus/"))

  const getOffer = {}
  getOffer.url = window.__DB_LOCATION__ + "/"
  getOffer.method = "get"
  getOffer.security = "open"
  getOffer.type = "offer"
  getOffer.name = "bestprime"
  getOffer.funnel = funnel
  const res = await Request.middleware(getOffer)

  if (res.status !== 200) {
    document.querySelectorAll("div[class*='herstelleritem']").forEach(div => div.remove())
  } else {

      const offer = JSON.parse(res.response)

      document.querySelectorAll("img[class*='herstellerlogobild-icon']").forEach(img => {
        img.src = `public/${offer.assets.logo}`
        img.alt = `${offer.name} Logo`
      })

      document.querySelectorAll("div[class*='herstellername1']").forEach(div => div.innerHTML = offer.name)

      const websitezumhersteller = new AnchorField("div[class*='websitezumhersteller']")
      .withType(a => {
        a.style.cursor = "pointer"
        a.href = offer.href
        a.target = "_blank"
        a.innerHTML = "Website"
      })

      document.querySelectorAll("div[class*='namedessystemsvomhersteller']").forEach(div => div.innerHTML = offer.title)
      document.querySelectorAll("div[class*='herstellerinfotext']").forEach(div => div.innerHTML = offer.description)
      document.querySelectorAll("div[class*='ust-1900']").forEach(div => div.innerHTML = `USt. ${(offer.vat * 100).toFixed(2).replace(".", ",")} %`)

      const herstellernettobeitrag = new DivField("div[class*='herstellernettobeitrag']")
      .withType(div => div.innerHTML = `${offer.grossAmount.toFixed(2).replace(".", ",")} €`)

      const herstellerust = new DivField("div[class*='herstellerust']")
      .withType(div => div.innerHTML = `${(offer.grossAmount * 0.19).toFixed(2).replace(".", ",")} €`)

      const herstellergesamtpreis = new DivField("div[class*='herstellergesamtpreis']")
      .withType(div => div.innerHTML = `${(offer.grossAmount * 1.19).toFixed(2).replace(".", ",")} €`)

      const zumangebotbutton = new DivField("div[class*='zumangebotbutton']")
        .withClickEventListener(() => {
          offer.value.selected = true
          window.localStorage.setItem(offer.storage, JSON.stringify(offer))
          window.location.assign(funnel.paths[5])
        })

      const impressum = new DivField("div[class*='impressum']")
        .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

      const datenschutz = new DivField("div[class*='datenschutz']")
        .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))
    }
}

