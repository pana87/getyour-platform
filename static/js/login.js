import {Helper} from "/js/Helper.js"
import {textToH1} from "/js/convert.js"
import {post} from "/js/request.js"
import {pop} from "/js/overlay.js"
import {addOpenNav, goBack} from "/js/events.js"
import {email, checkbox} from "/js/input.js"
import {goBackButton, getyourButton} from "/js/button.js"
import {loginFunnel} from "/js/funnel.js"
import {verifyEmailPin, verifyFunnel, verifyInputs} from "/js/verify.js"

goBackButton(document.body)
const content = document.body
content.className = "pb144"
textToH1("Login", content)
const openButton = getyourButton(content)
openButton.onclick = () => {
  pop(o1 => addOpenNav(o1.content))
}
const funnel = loginFunnel(content)
if (window.localStorage.getItem("email") !== null) {
  funnel.email.input.value = window.localStorage.getItem("email")
}
verifyInputs(funnel)
funnel.submit.onclick = async () => {
  await verifyFunnel(funnel)
  const email = funnel.email.input.value
  verifyEmailPin(email, async () => {
    await post("/register/email/admin/", {email})
    const res = await post("/register/session/")
    if (res.status === 200) {
      goBack()
      window.opener?.location?.reload()
    } else {
      window.alert("Fehler.. Bitte wiederholen.")
      window.location.reload()
    }
  })
}
