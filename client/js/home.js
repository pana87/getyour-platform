import {Helper} from "/js/Helper.js"
import {button} from "/js/button.js"

button.append("go-back", document.body)
button.append("home", document.body)

const logoDiv = Helper.div("flex center vh89", document.body)
const logo = Helper.render("img", {src: "/public/logo-getyour-red.svg", className: "image"}, logoDiv)

const arrowDown = Helper.div("bounce absolute bottom21 left45p w34", document.body)
arrowDown.textContent = "▽"

const parent = Helper.div("pb144", document.body)
renderParentButton(parent)
const domain = Helper.div("pb144", document.body)
renderDomainNames(domain)
const start = Helper.div("pb144", document.body)
renderPlatformStart(start)
const dev = Helper.div("pb144", document.body)
renderGetyourWebEntwickler(dev)

function createParentBox(user, node) {

  const {alias, created, image} = user
  const it = Helper.create("button/left-right")
  it.right.className += " fs21"
  it.left.className += " w144 h144"
  if (!Helper.verifyIs("text/empty", image)) {
    const img = document.createElement("img")
    img.src = image
    img.className = "w100p h100p br50p cover"
    Helper.append(img, it.left)
  }
  if (!Helper.verifyIs("text/empty", alias)) {
    it.alias = Helper.render("text/h1", alias, it.right)
  }
  if (!Helper.verifyIs("number/empty", created)) {
    it.created = Helper.render("text/p", `Auf der Plattform seit: ${Helper.convert("millis/since", created)}`, it.right)
  }
  it.onclick = ev => openParentOverlay()

  if (node) Helper.append(it, node)
  return it
}
function openParentOverlay() {

  window.alert("Bald verfügbar.")
}
function renderDomainNames(node) {

  node.textContent = ""
  const title = Helper.render("text/h2", "Themen", node)
  const loading = Helper.create("div/loading", node)
  Helper.request("/get/expert/names/").then(res => {
    loading.remove()
    if (res.status === 200) {
      const names = JSON.parse(res.response)
      for (let i = 0; i < names.length; i++) {
        const name = names[i]
        const button = Helper.render("button/left-right", {left: Helper.convert("tag/capital-first-letter", name)}, node)
        button.onclick = () => window.open(`/${name}/`, "_blank")
      }
    } else {
      title.remove()
      node.remove()
    }
  })
}
function renderGetyourWebEntwickler(node) {

  node.textContent = ""
  const loading = Helper.create("div/loading", node)
  Helper.request("/get/users/getyour/expert/").then(res => {
    loading.remove()
    if (res.status === 200) {
      const users = JSON.parse(res.response)
      Helper.render("text/h2", "Experten", node)
      const list = Helper.div("flex wrap around", node)
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        renderUserBox(user, list)
      }
    } else {
      node.remove()
    }
  })
}
function renderParentButton(node) {

  Helper.request("/jwt/get/parent/").then(res => {
    if (res.status === 200) {
      const user = JSON.parse(res.response)
      Helper.render("text/h2", "Dein Ansprechpartner", node)
      const box = createParentBox(user, node)
    } else {
      node.remove()
    }
  })
}
function renderPlatformStart(node) {

  node.textContent = ""
  const title = Helper.render("text/h2", "Plattformen", node)
  const loading = Helper.create("div/loading", node)
  Helper.request("/get/platform/starts/").then(res => {
    loading.remove()
    if (res.status === 200) {
      const platforms = JSON.parse(res.response)
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        const button = Helper.render("button/left-right", {left: Helper.convert("tag/capital-first-letter", platform.name)}, node)
        button.onclick = () => window.open(platform.start, "_blank")
      }
    } else {
      title.remove()
      node.remove()
    }
  })
}
function renderUserBox(user, node) {

  const box = Helper.create("div/button", node)
  box.classList.add("w377", "break-word", "m13", "sans-serif")
  if (!Helper.verifyIs("text/empty", user.alias)) {
    Helper.render("text/h1", user.alias, box)
  }
  if (!Helper.verifyIs("text/empty", user.image)) {
    Helper.render("img", {src: user.image, className: "image"}, box)
  }
  {
    const container = Helper.div("flex mtb21 mlr34", box)
    const leftDiv = Helper.div("flex align center", container)
    leftDiv.textContent = `Erfahrung:`
    const rightDiv = Helper.div("ml8 fs21", container)
    if (!Helper.verifyIs("number/empty", user.xp)) {
      rightDiv.textContent = user.xp
    }
    if (user.xp === undefined || user.xp === 0) {
      rightDiv.textContent = "Keine"
      rightDiv.classList.add("color-key")
    }
    if (user.xp > 0 && user.xp <= 89) {
      rightDiv.textContent = "Beginner"
      rightDiv.classList.add("color-value")
    }
    if (user.xp > 89) {
      rightDiv.textContent = "Fortgeschritten"
      rightDiv.classList.add("color-green")
    }
  }
  const reputation = Helper.render("reputation", user.reputation, box)
  return box
}
