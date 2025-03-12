import {Helper, renderTag, addLoading} from "/js/Helper.js"
import {button} from "/js/button.js"
import {img} from "/js/html-tags.js"
import {post} from "/js/request.js"

button.append("go-back", document.body)
button.append("home", document.body)

const logoDiv = Helper.div("flex center vh89 pointer", document.body)
const logo = img("image", logoDiv)
logo.src = "/public/logo-getyour-red.svg"
post("/jwt/verify/chat/message/").then(res => {
  if (res.status === 200) {
    logoDiv.classList.add("pulsate")
  }
})
logoDiv.onclick = () => {
  logoDiv.classList.remove("pulsate")
  Helper.overlay("pop", async o1 => {
    o1.onlyClosedUser()
    o1.addInfo(".chats")
    const content = o1.content
    const loader = addLoading(o1.content)
    const res = await post("/jwt/get/chats/")
    loader.remove()
    if (res.status === 200) {
      const chats = JSON.parse(res.response)
      chats.forEach(chat => {
        const chatBtn = Helper.create("button/left-right", content)
        chatBtn.right.textContent = "chat"
        if (chat.alias) {
          chatBtn.right.textContent = chat.alias
        }
        if (!chat.latest) {
          chatBtn.left.classList.remove("circle-gray")
          chatBtn.left.classList.add("circle-green")
          chatBtn.left.classList.add("blur")
        }
        chatBtn.onclick = () => Helper.fn("openChatOverlay")(chat.id)
      })
    }
  })
}
const arrowDown = Helper.div("bounce absolute flex align center bottom21 left45p w34", document.body)
arrowDown.textContent = "▽"

const parent = Helper.div("pb144", document.body)
renderParentButton(parent)
const start = Helper.div("pb144", document.body)
renderPlatformStart(start)
const dev = Helper.div("pb144", document.body)
renderExperts(dev)

function createParentBox(user, node) {
  const {alias, created, id, image} = user
  const it = Helper.create("button/left-right")
  it.classList.remove("between")
  it.classList.add("center")
  it.right.className = ""
  it.left.className = "w89 h89 m8"
  if (!Helper.verifyIs("text/empty", image)) {
    const img = document.createElement("img")
    img.src = image
    img.className = "w89 h89 br50p obj-cover"
    Helper.append(img, it.left)
  }
  if (!Helper.verifyIs("text/empty", alias)) {
    it.alias = Helper.div("m8", it.right)
    it.alias.textContent = alias
  }
  if (!Helper.verifyIs("number/empty", created)) {
    it.created = Helper.div("m8", it.right)
    it.created.textContent = `Auf der Plattform seit: ${Helper.convert("millis/since", created)}`
  }
  it.onclick = ev => {
    Helper.overlay("pop", o1 => {
      const content = o1.content
      const chatBtn = Helper.render("button/left-right", {left: ".chat", right: "Meine Unterhaltungen"}, content)
      chatBtn.onclick = () => Helper.fn("openChatOverlay")(id)
    })
  }
  if (node) Helper.append(it, node)
  return it
}
function renderExperts(node) {
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
  if (!Helper.verifyIs("text/empty", user.name)) {
    box.onclick = () => window.open(`/${user.name}/`, "_blank")
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
  Helper.render("key-value", {key: "Plattformen:", value: user.platforms}, box)
  Helper.render("key-value", {key: "Webseiten:", value: user.values}, box)
  return box
}
