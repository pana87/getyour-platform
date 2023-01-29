import { DivField } from "./../js/DivField.js"
import { EmailField } from "./../js/EmailField.js"
import { Request } from "./../js/Request.js"

const gotoimpressum = new DivField("div[class*='gotoimpressum']")
.withClickEventListener(() => window.location.assign("/impressum/"))

const gotodatenschutz = new DivField("div[class*='gotodatenschutz']")
.withClickEventListener(() => window.location.assign("/datenschutz/"))

const gotonutzervereinbarung = new DivField("div[class*='gotonutzervereinbarung']")
.withClickEventListener(() => window.location.assign("/nutzervereinbarung/"))

const einloggeninput = new EmailField("div[class*='einloggeninput']")
.withInput((input) => {
  input.placeholder = "E-Mail Adresse"
  input.required = true
})
.withInputEventListener(() => einloggeninput.withValidValue())

const loginbutton = new DivField("div[class*='loginbutton']")
.withOverlayClickEventListener(async (event) => {
  const email = await einloggeninput.withValidValue()

  event.addOverlay()
  await Request.withVerifiedEmail(email, async () => {
    const sessionTokenRx = await Request.sessionToken()

    const userViewRx = await Request.userView()
  })
  event.removeOverlay()
})
