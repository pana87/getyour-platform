import {Helper} from "/js/Helper.js"

function stop() {throw new Error("404 Not Found")}
const script = document.querySelector("script#role-login")
if (!script) stop()
const roleCreated = script.getAttribute("role-created")
const roleName = script.getAttribute("role-name")
if (!roleCreated || !roleName) stop()

document.querySelectorAll("a").forEach(node => Helper.add("hover-outline", node))

const content = document.body
content.className = "pb144 dark-light"

async function registerUser(email, created, name) {

  await Helper.callback("email/pin-verified", email, async () => {
    const res1 = await Helper.request("/register/email/location/", {created, email, name})
    const res2 = await Helper.request("/register/session/")
    if (res2.status === 200) {
      Helper.goBack()
      window.opener?.location?.reload()
    } else {
      window.alert("Fehler.. Bitte wiederholen.")
      window.location.reload()
    }
  })
}

let funnel = document.querySelector("#login")
if (!funnel) {
  Helper.render("text/h1", `Login ${Helper.convert("tag/capital-first-letter", roleName)}`, content)
  funnel = Helper.funnel("login", content)
  if (window.localStorage.getItem("email")) {
    funnel.email.input.value = window.localStorage.getItem("email")
  }
  funnel.submit.onclick = async () => {

    await Helper.verify("funnel", funnel)
    const email = funnel.email.input.value
    await registerUser(email, roleCreated, roleName)
  }
} else {
  Helper.verify("funnel", funnel)
  const emailInput = funnel.querySelector("input.email")
  if (window.localStorage.getItem("email")) {
    emailInput.value = window.localStorage.getItem("email")
    Helper.verify("input/value", emailInput)
  }
  emailInput.oninput = () => Helper.verify("input/value", emailInput)
  const dsgvoInput = funnel.querySelector("input.dsgvo")
  dsgvoInput.oninput = () => Helper.verify("input/value", dsgvoInput)
  const submit = funnel.querySelector("div.submit")
  Helper.add("hover-outline", emailInput)
  Helper.add("hover-outline", submit)
  submit.onclick = async () => {

    await Helper.verify("input/value", emailInput)
    await Helper.verify("input/value", dsgvoInput)
    const email = emailInput.value
    await registerUser(email, roleCreated, roleName)
  }
}
