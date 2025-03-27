import {Helper} from "/js/Helper.js"
import {button} from "/js/button.js"

button.append("go-back", document.body)
const content = document.body
content.className = "pb144"
Helper.render("text/h1", "Login", content)
const openButton = Helper.create("button/getyour", content)
openButton.onclick = () => {
  Helper.overlay("pop", o1 => {
    Helper.render("nav/open", o1.content)
  })
}
const funnel = Helper.funnel("login", content)
if (window.localStorage.getItem("email") !== null) {
  funnel.email.input.value = window.localStorage.getItem("email")
}
Helper.verify("funnel", funnel)
funnel.submit.onclick = async () => {
  await Helper.verify("funnel", funnel)
  const email = funnel.email.input.value
  Helper.callback("email/pin-verified", email, async () => {
    await Helper.request("/register/email/admin/", {email})
    const res = await Helper.request("/register/session/")
    if (res.status === 200) {
      Helper.goBack()
      window.opener?.location?.reload()
    } else {
      window.alert("Fehler.. Bitte wiederholen.")
      window.location.reload()
    }
  })
}
