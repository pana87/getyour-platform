import { DivField } from "../../../../js/DivField.js"
import { TextField } from "../../../../js/TextField.js"
import { EmailField } from "../../../../js/EmailField.js"
import { PasswordField } from "../../../../js/PasswordField.js"
import { Helper } from "../../../../js/Helper.js"
import { Request } from "../../../../js/Request.js"

const funnel = JSON.parse(window.localStorage.getItem("shsFunnel"))
const offer = JSON.parse(window.localStorage.getItem("bestprimeOffer"))
if (funnel === null) {
  window.location.assign("/felix/shs/funnel/qualifizierung/")
} else if (offer === null) {
  window.location.assign("/felix/shs/hersteller/")
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

  const registrierenvorname = new TextField("div[class*='registrierenvorname']")
  .withType((input) => {
    input.placeholder = "Max"
    input.required = true
  })

  const registrierennachname = new TextField("div[class*='registrierennachname']")
  .withType((input) => {
    input.placeholder = "Muster"
    input.required = true
  })

  const registrierenstrasseundhausnumm = new TextField("div[class*='registrierenstrasseundhausnumm']")
  .withType((input) => {
    input.placeholder = "Hauptstr. 21"
    input.required = true
  })

  const registrierenpostleitzahl = new TextField("div[class*='registrierenpostleitzahl']")
  .withType((input) => {
    input.placeholder = "70190 Stuttgart"
    input.required = true
    input.pattern = "[1-9][0-9]{4}\\s.[^\\s]+"
  })

  const registrierenbundeslaender = new TextField("div[class*='registrierenbundeslaender']")
  .withType((input) => {
    input.placeholder = "Baden-Württemberg"
    input.required = true
  })

  const registrierendeutschland = new TextField("div[class*='registrierendeutschland']")
  .withType((input) => {
    input.placeholder = "Deutschland"
    input.required = true
  })

  const registrierenemail = new EmailField("div[class*='registrierenemail']")
  .withType((input) => {
    input.placeholder = "max.mustermann@web.de"
    input.required = true
    input.fromStorage("email")
  })

  const registrierenpasswortfestlegen = new PasswordField("div[class*='registrierenpasswortfestlegen']")
  .withType((input) => {
    input.placeholder = "Passwort.."
    input.minlength = 6
    input.required = true
  })

  const registrierenpasswortbestaetige = new PasswordField("div[class*='registrierenpasswortbestaetige']")
  .withType((input) => {
    input.placeholder = "Passwort bestätigen.."
    input.required = true
    input.minlength = 6
  })

  const fields = [
    registrierenvorname,
    registrierennachname,
    registrierenstrasseundhausnumm,
    registrierenpostleitzahl,
    registrierenbundeslaender,
    registrierendeutschland,
    registrierenemail,
    registrierenpasswortfestlegen,
    registrierenpasswortbestaetige,
  ]

  fields.forEach(async field => {
    field.withType(type => type.fromStorage(funnel.storage))
    field.withStorage(funnel.storage)
    field.withInputEventListener(() => field.withStorage(funnel.storage))
  })

  const jetztzurappbutton = new DivField("div[class*='jetztzurappbutton']")
    .withOverlayClickEventListener(async (event) => await saveAndProceed(event))

  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))

  async function saveAndProceed(event) {

    const email = await registrierenemail.withValidValue()
    const password = await registrierenpasswortfestlegen.withValidValue()
    const confirmPassword = await registrierenpasswortbestaetige.withValidValue()
    const passwordHash = await Helper.digest(password)
    const confirmPasswordHash = await Helper.digest(confirmPassword)

    if (passwordHash !== confirmPasswordHash) {
      registrierenpasswortbestaetige.withType(input => Helper.setNotValidStyle(input))
    } else {
      event.addOverlay()
      const funnelStorage = JSON.parse(window.localStorage.getItem(funnel.storage))
      const offerStorage = JSON.parse(window.localStorage.getItem(offer.storage))
      await Request.withVerifiedEmail(email, async() => {
        const localStorageId = Request.localStorageId()

        const registerEmail = {}
        registerEmail.url = "/db/v1/"
        registerEmail.type = "id"
        registerEmail.method = "post"
        registerEmail.security = "open"
        registerEmail.name = "onoperator"
        registerEmail.email = email
        registerEmail.localStorageId = localStorageId
        await Request.sequence(registerEmail)

        const verifyUser = {}
        verifyUser.url = "/db/v1/"
        verifyUser.type = "verify"
        verifyUser.method = "put"
        verifyUser.security = "open"
        verifyUser.name = "onoperator"
        verifyUser.localStorageId = localStorageId
        await Request.sequence(verifyUser)

        const registerOperator = {}
        registerOperator.url = "/db/v1/"
        registerOperator.type = "role"
        registerOperator.method = "post"
        registerOperator.security = "open"
        registerOperator.name = "onoperator"
        registerOperator.localStorageId = localStorageId
        await Request.sequence(registerOperator)

        const registerSession = {}
        registerSession.url = "/request/register/session/"
        registerSession.type = "session"
        registerSession.method = "put"
        registerSession.security = "open"
        registerSession.name = "onoperator"
        registerSession.localStorageId = localStorageId
        await Request.sequence(registerSession)

        const registerFunnel = {}
        registerFunnel.url = "/db/v1/"
        registerFunnel.type = "funnel"
        registerFunnel.method = "post"
        registerFunnel.security = "closed"
        registerFunnel.name = "shs"
        registerFunnel.localStorageId = localStorageId
        registerFunnel.funnel = funnelStorage
        await Request.sequence(registerFunnel)

        const registerOffer = {}
        registerOffer.url = "/db/v1/"
        registerOffer.type = "offer"
        registerOffer.method = "post"
        registerOffer.security = "closed"
        registerOffer.name = "bestprime"
        registerOffer.localStorageId = localStorageId
        registerOffer.offer = offerStorage
        registerOffer.funnel = funnelStorage
        await Request.sequence(registerOffer)

        alert("Speichern erfolgreich..")
        window.location.assign(`/felix/shs/checkliste/${localStorageId}`)
        event.removeOverlay()
      })
    }
  }
}
