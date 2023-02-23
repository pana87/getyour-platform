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
.withType((input) => {
  input.placeholder = "E-Mail Adresse"
  input.required = true
  input.fromStorage("email")
})
.withInputEventListener(() => einloggeninput.withStorage("email"))
einloggeninput.withValidValue()

const loginbutton = new DivField("div[class*='loginbutton']")
.withOverlayClickEventListener(async (event) => {
  const email = await einloggeninput.withValidValue()

  event.addOverlay()
  await Request.withVerifiedEmail(email, async () => {
    const localStorageId = Request.localStorageId()

    const registerEmail = {}
    registerEmail.url = window.__DB_LOCATION__ + "/"
    registerEmail.type = "id"
    registerEmail.method = "post"
    registerEmail.security = "open"
    registerEmail.name = "onlogin"
    registerEmail.localStorageId = localStorageId
    registerEmail.email = email
    await Request.sequence(registerEmail)

    const verifyUser = {}
    verifyUser.url = window.__DB_LOCATION__ + "/"
    verifyUser.method = "put"
    verifyUser.security = "open"
    verifyUser.type = "verify"
    verifyUser.name = "onlogin"
    verifyUser.localStorageId = localStorageId
    await Request.sequence(verifyUser)

    const registerSession = {}
    registerSession.url = window.__AUTH_LOCATION__ + "/request/register/session/"
    registerSession.method = "put"
    registerSession.security = "open"
    registerSession.type = "session"
    registerSession.name = "onlogin"
    registerSession.localStorageId = localStorageId
    const res = await Request.middleware(registerSession)
    const {redirectPath} = JSON.parse(res.response)
    if (redirectPath !== undefined) return window.location.assign(redirectPath)
    window.history.back()
    event.removeOverlay()
  })
})
