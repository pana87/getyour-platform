import { Request } from "./Request.js"
import { SHSChecklistItem } from "../felix/shs/technician/checklist-item/SHSChecklistItem.js"
import { SHSFunnelQuestionList } from "../felix/shs/angebot/funnel/view/SHSFunnelQuestionList.js"
import { SHSFunnelStart } from "../felix/shs/start/SHSFunnelStart.js"

const pathToPNGFavicon = `${window.__PLATFORM_LOCATION__.origin}/img/favicon.png`
const pathToICOFavicon = `${window.__PLATFORM_LOCATION__.origin}/img/favicon.ico`
// const scriptLoader = new ScriptLoader()

const BROWSER_NOT_SUPPORTED = "Die Registrierung ist im Moment mit diesem Browser nicht möglich. Bitte versuche einen anderen Browser."

// OPEN PLATFORM Level 2 (Client)

function _testing() {
  const pathnames = window.location.pathname.split("/")

  if (pathnames[0] !== "") return
  if (pathnames[1] !== "testing") return
  if (pathnames[2] !== "" && pathnames[2] !== undefined) return

  document.body.insertBefore(new SHSFunnelStart(SHSFunnelQuestionList), document.scripts[0])
}
_testing()


// function uintToString(uintArray) {
//   var encodedString = String.fromCharCode.apply(null, uintArray),
//       decodedString = decodeURIComponent(escape(atob(encodedString)));
//   return decodedString;
// }

async function _authenticateUserWithBrowser(user) {
  const pathnames = window.location.pathname.split("/")

  if (pathnames[0] !== "") return
  if (pathnames[1] !== "login") return
  if (pathnames[2] !== "" && pathnames[2] !== undefined) return

  const userInput = {
    email: {
      value: user.email.value || "max.muster@get-your.de",
    }
  }

  // 1.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
  const publicKeyCredentialRequestOptionsRx = await Request.publicKeyCredentialRequestOptions(userInput)
  const {allowCredentials} = publicKeyCredentialRequestOptionsRx.publicKey
  // 2.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
  const assertion = await window.navigator.credentials.get(publicKeyCredentialRequestOptionsRx)
    .catch((error) => {
      alert(`Login ist fehlgeschlagen. \n\nError: ${error}`)
      return
    })
  // 5.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
  if (allowCredentials.length !== 0) {
    const decoder = new TextDecoder()
    if (decoder.decode(allowCredentials[0].id) !== decoder.decode(new Uint8Array(assertion.rawId))) {
      alert(`Login ist fehlgeschlagen. \n\nError: ASSERTION_ERROR`)
      return
    }
  }

  assertion.userInput = userInput
  const userAuthenticationVerificationRx = await Request.userAuthenticationVerification(assertion)
}

async function _registerUserWithBrowser(user) {
  const pathnames = window.location.pathname.split("/")

  if (pathnames[0] !== "") return
  if (pathnames[1] !== "registrieren") return
  if (pathnames[2] !== "" && pathnames[2] !== undefined) return

  if (!window.PublicKeyCredential) {
    return {
      status: 500,
      message: alert(BROWSER_NOT_SUPPORTED)
    }
  }

  const userInput = {
    email: {
      value: user.email.value || "max.muster@get-your.de",
    }
  }

  // 1.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
  const publicKeyCredentialCreationOptionsRx = await Request.publicKeyCredentialCreationOptions(userInput)

  // 2.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
  const attestation = await window.navigator.credentials.create(publicKeyCredentialCreationOptionsRx)
    .catch(error => {
      alert(`Das Anlegen eines Sicherheitsschlüssels ist erforderlich. \n\n${error}`)
      window.location.reload()
    })

  attestation.userInput = userInput
  const userRegistrationVerificationRx = await Request.userRegistrationVerification(attestation)
}

function requiredPathname(pathname) {
  const pathnames = window.location.pathname.split("/")
  const names = pathname.split("/")

  names.forEach((name, index, names) => {
    if (names[0] !== "" || names[0] !== pathnames[0]) return { status: 500, message: "PATHNAME_EMPTY", }
    if (names[index] !== pathnames[index]) return { status: 500, message: "PATHNAME_MISMATCH", }
    if (names[names.length - 1] !== "" && names[names.length - 1] !== undefined) return { status: 500, message: "PATHNAME_MISSING_SLASH", }
  })
  return { status: 200, message: "PATHNAME_SUCCESS", }
}

async function _beginUserSessionWithJWTToken(user) {

  const requiredPathnameRx = requiredPathname("/begin/user/session/with/jwt/token/")
  if (requiredPathnameRx.status !== 200) return

  const userInput = {
    name: "Max",
    roles: ["admin"],
    password: "secret",
    email: {
      value: "max.muster@get-your.de",
    }
  }

  const {token} = await Request.jwtToken(userInput)
  console.log(token);

  window.sessionStorage.setItem("token", token)
}
// _beginUserSessionWithJWTToken({})

function _renderFavicon() {
  const favicon1 = document.createElement("link")
  const favicon2 = document.createElement("link")
  const favicon3 = document.createElement("link")

  favicon1.rel = "shortcut icon"
  favicon2.rel = "icon"
  favicon3.rel = "apple-touch-icon"

  favicon1.href = pathToICOFavicon
  favicon2.href = pathToPNGFavicon
  favicon3.href = pathToPNGFavicon

  favicon1.type = "image/x-icon"
  favicon2.type = "image/png"
  favicon3.type = "image/png"

  favicon1.sizes = "180x180"
  favicon2.sizes = "192x192"
  favicon3.sizes = "180x180"

  document.head.appendChild(favicon1)
  document.head.appendChild(favicon2)
  document.head.appendChild(favicon3)
}
_renderFavicon()

function _renderSHSChecklistItems() {
  if (window.location.pathname !== "/felix/shs/techniker/ansicht/") return

  // THIS FUNCTION WILL BE ADOPTED BY THE TECHNICIAN VIEW
  // THERE WILL BE FILTER BUTTONS TO REQUEST THE CORRECT LIST
  // BY DEFAULT THERE WILL BE A LIST OF ALL DATES SORTED BY DATE

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  // FETCH LIST OF CALENDAR ENTRIES
  const calendarEntries = [
    { date: new Date(), name: "Panagiotis Tsivelekidis", street: "Schwarenbergstr. 188", zip: "70184 Stuttgart", phone: "017662409404", email: "p.tsivelekidis@get-your.de", done: false},
    { date: tomorrow, name: "Felix Steck", street: "Niedernhaller Str. 7", zip: "43222 Weißback", phone: "038941032901", email: "f.steck@get-your.de", done: false}
  ]

  // FOR EACH ENTRY INSERT A SHS CHECKLIST ITEM
  calendarEntries.forEach(entry => {
    document.body.insertBefore(new SHSChecklistItem(entry), document.scripts[0])
  })

}
_renderSHSChecklistItems()

// function _renderSecuredWithJwtToken() {
//   requiredPathname("/secured/with/jwt/token/")
//   // if (window.location.pathname !== "/felix/shs/techniker/ansicht/") return

//   // THIS FUNCTION WILL BE ADOPTED BY THE TECHNICIAN VIEW
//   // THERE WILL BE FILTER BUTTONS TO REQUEST THE CORRECT LIST
//   // BY DEFAULT THERE WILL BE A LIST OF ALL DATES SORTED BY DATE

//   const tomorrow = new Date()
//   tomorrow.setDate(tomorrow.getDate() + 1)

//   // FETCH LIST OF CALENDAR ENTRIES
//   const calendarEntries = [
//     { date: new Date(), name: "Panagiotis Tsivelekidis", street: "Schwarenbergstr. 188", zip: "70184 Stuttgart", phone: "017662409404", email: "p.tsivelekidis@get-your.de", done: false},
//     { date: tomorrow, name: "Felix Steck", street: "Niedernhaller Str. 7", zip: "43222 Weißback", phone: "038941032901", email: "f.steck@get-your.de", done: false}
//   ]

//   // FOR EACH ENTRY INSERT A SHS CHECKLIST ITEM
//   calendarEntries.forEach(entry => {
//     document.body.insertBefore(new SHSChecklistItem(entry), document.scripts[0])
//   })

// }
// _renderSHSChecklistItems()
