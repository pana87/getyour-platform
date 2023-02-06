import { DivField } from "../../../../js/DivField.js"
import { TextField } from "../../../../js/TextField.js"
import { EmailField } from "../../../../js/EmailField.js"
import { PasswordField } from "../../../../js/PasswordField.js"
import { Helper } from "../../../../js/Helper.js"
import { Request } from "../../../../js/Request.js"

const SHS_FUNNEL_STORAGE_NAME = "shsFunnel"
const NEXT_PATHNAME = `/felix/shs/checkliste/${Request.localStorageId()}`

if (window.sessionStorage.getItem("shsFunnel") !== null) {

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
    field.withType(type => type.fromSessionStorage(SHS_FUNNEL_STORAGE_NAME))
    field.withStorage(SHS_FUNNEL_STORAGE_NAME)
    field.withInputEventListener(() => field.withStorage(SHS_FUNNEL_STORAGE_NAME))
  })

  const jetztzurappbutton = new DivField("div[class*='jetztzurappbutton']")
    .withOverlayClickEventListener(async (event) => await saveAndProceed(event))


  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))


  async function saveAndProceed(event) {

    const password = await registrierenpasswortfestlegen.withValidValue()
    const confirmPassword = await registrierenpasswortbestaetige.withValidValue()
    const passwordHash = await Helper.digest(password)
    const confirmPasswordHash = await Helper.digest(confirmPassword)

    if (passwordHash === confirmPasswordHash) {
      event.addOverlay()
      const shsFunnel = JSON.parse(window.sessionStorage.getItem("shsFunnel"))
      if (shsFunnel !== null) {
        const offers = JSON.parse(window.sessionStorage.getItem("offers"))
        if (offers !== null) {
          const email = await registrierenemail.withValidValue()
          await Request.withVerifiedEmail(email, async() => {
            const registerRx = await Request.register({
              object: {shsFunnel, offers},
              pathname: "/request/register/operator/",
            })
            if (registerRx.status === 200) {
              await Request.sessionToken()
              window.location.assign(NEXT_PATHNAME)
              return
            }
          })
        } else return window.location.assign("/felix/shs/hersteller/")
      } else return window.location.assign("/felix/shs/funnel/qualifizierung/")
    }
    event.removeOverlay()
  }
} else {
  window.location.assign("/felix/shs/funnel/qualifizierung/")
}
