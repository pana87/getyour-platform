import {renderKeyValue, renderTag} from "/js/render.js"
import {add, button, leftRight, goBackButton} from "/js/button.js"
import {img, div} from "/js/html-tags.js"
import {addOpenNav, addLoading} from "/js/events.js"
import {post} from "/js/request.js"
import {openContacts} from "/js/contacts.js"
import {textToP, textToHr, textToHoverBottomRight, millisToSince, srcToImg, textToH1, textToH2, tagToAllFirstUpper} from "/js/convert.js"
import {openGroups} from "/js/groups.js"
import {openDeadlines} from "/js/deadlines.js"
import {renderContactsWithNextSteps} from "/js/next-steps.js"
import {pop, lock} from "/js/overlay.js"
import {onlyClosedUser, textIsEmpty, numberIsEmpty} from "/js/verify.js"
import {openChat} from "/js/chat.js"

goBackButton(document.body)
const upBtn = add("↑", document.body)
upBtn.onclick = () => {
  pop(async o1 => {
    const content = o1.content
    addOpenNav(content)
    post("/verify/user/closed/").then(res => {
      if (res.status === 200) {
        textToHr("closed apps", content)
        const contactsButton = leftRight({left: ".contacts", right: "Deine Kontakte"}, content)
        contactsButton.onclick = openContacts
        const deadlinesButton = leftRight({left: `.deadlines`, right: "Nie wieder vergessen"}, content)
        deadlinesButton.onclick = openDeadlines
        const groupsButton = leftRight({left: ".groups", right: "Schnell, einfach und sicher Kontakte gruppieren"}, content)
        groupsButton.onclick = openGroups
        const removeButton = leftRight({left: ".remove", right: "Mein Konto dauerhaft entfernen"}, content)
        removeButton.classList.add("bg-red")
        removeButton.classList.remove("btn-theme")
        textToHoverBottomRight("Achtung!", removeButton)
        removeButton.onclick = () => {
          const confirm = window.confirm("Du bist gerade dabei deine persönliche Datenbank zu entfernen. Deine Daten werden gelöscht und können nicht mehr wiederhergestellt werden. Du wirst abgemeldet und musst dich erneut registrieren.\n\nMöchtest du alle deine Daten wirklich löschen?")
          if (confirm === true) {
            const email = window.prompt("Bitte bestätige deine E-Mail Adresse, um fortzufahren.")
            if (textIsEmpty(email)) {
              window.alert("Fehler.. Bitte wiederholen.")
              throw new Error("not found")
            }
            lock(async o2 => {
              const res = await post("/jwt/verify/email/", {email})
              if (res.status === 200) {
                // todo add 2fa here
                const res = await post("/jwt/remove/user/", {email})
                if (res.status === 200) {
                  o2.alert.removed()
                  window.location.assign("/")
                } else {
                  o2.alert.nok()
                  o2.remove()
                }
              } else {
                o2.alert.nok()
                o2.remove()
              }
            })
          }
        }
        post("/jwt/get/expert/name/").then(res => {
          if (res.status === 200) {
            const name = res.response
            const button = leftRight({left: ".expert", right: "Der Bereich für Experten"}, content)
            button.onclick = () => window.open(`/${name}/`, "_blank")
          }
        })
        post("/verify/user/admin/").then(res => {
          if (res.status === 200) {
            const button = leftRight({left: ".admin", right: "Der Bereich für Admins"}, content)
            button.onclick = () => window.open("/admin/", "_blank")
          }
        })
      }
    })
  })
}
const logoDiv = div("flex center vh89 pointer", document.body)
const logo = img("image", logoDiv)
logo.src = "/public/logo-getyour-red.svg"
post("/jwt/verify/chat/message/").then(res => {
  if (res.status === 200) {
    logoDiv.classList.add("pulsate")
  }
})
logoDiv.onclick = () => {
  logoDiv.classList.remove("pulsate")
  pop(async o1 => {
    await onlyClosedUser(o1)
    o1.addInfo(".chats")
    const content = o1.content
    const loader = addLoading(o1.content)
    const res = await post("/jwt/get/chats/")
    loader.remove()
    if (res.status === 200) {
      const chats = JSON.parse(res.response)
      chats.forEach(chat => {
        const chatBtn = leftRight({right: "chat"}, content)
        if (chat.alias) {
          chatBtn.right.textContent = chat.alias
        }
        if (!chat.latest) {
          chatBtn.left.classList.remove("circle-gray")
          chatBtn.left.classList.add("circle-green")
          chatBtn.left.classList.add("blur")
        }
        chatBtn.onclick = () => openChat(chat.id)
      })
    } else {
      window.alert("Keine Chats gefunden.")
      o1.remove()
    }
  })
}
const arrowDown = div("bounce absolute flex align center bottom21 left45p w34", document.body)
arrowDown.textContent = "▽"

const parent = div("pb144", document.body)
renderParentButton(parent)
const nextSteps = div("pb144", document.body)
renderContactsWithNextSteps(nextSteps)
const start = div("pb144", document.body)
renderPlatformStart(start)
const dev = div("pb144", document.body)
renderExperts(dev)

function createParentBox(user, node) {
  const {alias, created, id, image} = user
  const it = leftRight()
  it.classList.remove("between")
  it.classList.add("center")
  it.right.className = ""
  it.left.className = "w89 h89 m8"
  if (!textIsEmpty(image)) {
    const img = document.createElement("img")
    img.src = image
    img.className = "w89 h89 br50p obj-cover"
    it.left.appendChild(img)
  }
  if (!textIsEmpty(alias)) {
    it.alias = div("m8", it.right)
    it.alias.textContent = alias
  }
  if (!numberIsEmpty(created)) {
    it.created = div("m8", it.right)
    it.created.textContent = `Auf der Plattform seit: ${millisToSince(created)}`
  }
  it.onclick = ev => {
    pop(o1 => {
      const content = o1.content
      const chatBtn = leftRight({left: ".chat", right: "Meine Unterhaltungen"}, content)
      chatBtn.onclick = () => openChat(id)
    })
  }
  node?.appendChild(it)
  return it
}
function renderExperts(node) {
  node.textContent = ""
  const loading = addLoading(node)
  post("/get/users/getyour/expert/").then(res => {
    loading.remove()
    if (res.status === 200) {
      const users = JSON.parse(res.response)
      textToH2("Experten", node)
      const list = div("flex wrap around", node)
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
  post("/jwt/get/parent/").then(res => {
    if (res.status === 200) {
      const user = JSON.parse(res.response)
      textToH2("Dein Ansprechpartner", node)
      const box = createParentBox(user, node)
    } else {
      node.remove()
    }
  })
}
function renderPlatformStart(node) {
  node.textContent = ""
  const title = textToH2("Plattformen", node)
  const loading = addLoading(node)
  post("/get/platform/starts/").then(res => {
    loading.remove()
    if (res.status === 200) {
      const platforms = JSON.parse(res.response)
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        const button = leftRight({left: tagToAllFirstUpper(platform.name)}, node)
        button.onclick = () => window.open(platform.start, "_blank")
      }
    } else {
      title.remove()
      node.remove()
    }
  })
}
function renderUserBox(user, node) {
  const box = div("hover btn-theme w377 break-word m13 sans-serif br13", node)
  if (!textIsEmpty(user.alias)) {
    textToH1(user.alias, box)
  }
  if (!textIsEmpty(user.image)) {
    srcToImg(user.image, box)
  }
  if (!textIsEmpty(user.name)) {
    box.onclick = () => window.open(`/${user.name}/`, "_blank")
  }
  if (!textIsEmpty(user.description)) {
    textToP(user.description, box)
  }
  {
    const container = div("flex mtb21 mlr34", box)
    const leftDiv = div("flex align center", container)
    leftDiv.textContent = `Erfahrung:`
    const rightDiv = div("ml8 fs21", container)
    if (!numberIsEmpty(user.xp)) {
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
  renderKeyValue("Plattformen:", user.platforms, box)
  renderKeyValue("Webseiten:", user.values, box)
  return box
}
