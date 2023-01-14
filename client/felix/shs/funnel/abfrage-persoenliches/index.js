import { DivField } from "../../../../js/DivField.js"
import { TextField } from "../../../../js/TextField.js"
import { EmailField } from "../../../../js/EmailField.js"
import { PasswordField } from "../../../../js/PasswordField.js"
import { Helper } from "../../../../js/Helper.js"
import { Request } from "../../../../js/Request.js"

const NEXT_PATHNAME = `/felix/shs/checkliste/${Request.userId()}`

if (window.sessionStorage.getItem("shsFunnel") !== null) {

  const registrierenvorname = new TextField("div[class*='registrierenvorname']")
    .withInput((input) => {
      input.placeholder = "Max"
      input.required = true
    })

  const registrierennachname = new TextField("div[class*='registrierennachname']")
  .withInput((input) => {
    input.placeholder = "Muster"
    input.required = true
  })

  const registrierenstrasseundhausnumm = new TextField("div[class*='registrierenstrasseundhausnumm']")
  .withInput((input) => {
    input.placeholder = "Hauptstr. 21"
    input.required = true
  })

  const registrierenpostleitzahl = new TextField("div[class*='registrierenpostleitzahl']")
  .withInput((input) => {
    input.placeholder = "70190 Stuttgart"
    input.required = true
    input.pattern = "[1-9][0-9]{4}\\s.[^\\s]+"
  })

  const registrierenbundeslaender = new TextField("div[class*='registrierenbundeslaender']")
  .withInput((input) => {
    input.placeholder = "Baden-Württemberg"
    input.required = true
  })

  const registrierendeutschland = new TextField("div[class*='registrierendeutschland']")
  .withInput((input) => {
    input.placeholder = "Deutschland"
    input.required = true
  })

  const registrierenemail = new EmailField("div[class*='registrierenemail']")
  .withInput((input) => {
    input.placeholder = "max.mustermann@web.de"
    input.required = true
  })

  const registrierenpasswortfestlegen = new PasswordField("div[class*='registrierenpasswortfestlegen']")
  .withInput((input) => {
    input.placeholder = "Passwort.."
    input.minlength = 6
    input.required = true
  })

  const registrierenpasswortbestaetige = new PasswordField("div[class*='registrierenpasswortbestaetige']")
  .withInput((input) => {
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

  fields.forEach(field => field.withValidValue())
  fields.forEach(field => field.withInputEventListener(() => field.withValidValue()))

  const jetztzurappbutton = new DivField("div[class*='jetztzurappbutton']")
    .withOverlayClickEventListener(async (event) => {

      const firstName = await registrierenvorname.withValidValue()
      const lastName = await registrierennachname.withValidValue()
      const street = await registrierenstrasseundhausnumm.withValidValue()
      const zip = await registrierenpostleitzahl.withValidValue()
      const state = await registrierenbundeslaender.withValidValue()
      const country = await registrierendeutschland.withValidValue()
      const email = await registrierenemail.withValidValue()
      const password = await registrierenpasswortfestlegen.withValidValue()
      const confirmPassword = await registrierenpasswortbestaetige.withValidValue()
      const shsFunnel = JSON.parse(window.sessionStorage.getItem("shsFunnel"))

      const passwordHash = await Helper.digest(password)
      const confirmPasswordHash = await Helper.digest(confirmPassword)

      if (passwordHash === confirmPasswordHash) {
        registrierenpasswortbestaetige.withValidStyle()
        event.addOverlay()

        const registerIdRx = await Request.registerId(email)

        const sendEmailWithPinRx = await Request.sendEmailWithPin(email)
        if (sendEmailWithPinRx.status === 200) {
          const verifyPinRx = await Request.verifyPin(email)
          if (verifyPinRx.status === 200) {
            const verifyIdRx = await Request.verifyId(email)
            if (verifyIdRx.status === 200) {
              const registerOperatorRx = await Request.registerOperator({
                firstName,
                lastName,
                street,
                zip,
                state,
                country,
                email,
                password: passwordHash,
                shsFunnel,
              })
              if (registerOperatorRx.status === 200) {
                const sessionTokenRx = await Request.sessionToken()
                if (sessionTokenRx.status === 200) {
                  window.location.assign(NEXT_PATHNAME)
                }
              }
            }
          }
        }
        event.removeOverlay()
        return
      }
      registrierenpasswortbestaetige.withNotValidStyle()
    })


  const impressum = new DivField("div[class*='impressum']")
    .withClickEventListener(() => window.location.assign("/felix/shs/impressum/"))

  const datenschutz = new DivField("div[class*='datenschutz']")
    .withClickEventListener(() => window.location.assign("/felix/shs/datenschutz/"))
} else {
  window.location.assign("/felix/shs/funnel/qualifizierung/")
}
