import {Helper} from "/js/Helper.js"

const it = {}
it.addEvent = (name, node) => {
  Helper.add("hover-outline", node)
  if (name === "go-back") {

    node.onclick = Helper.goBack
  }
  if (name === "home") {

    node.onclick = () => {

      Helper.overlay("pop", async o1 => {
        const content = o1.content
        Helper.render("text/hr", "open apps", content)

        const communityButton = Helper.render("button/left-right", {left: ".community", right: "Dein Raum für Innovationen"}, content)
        communityButton.onclick = async () => {

          const community = await Helper.community()
          community.openOverlay()
        }

        Helper.add("nav/open", content)
        Helper.request("/verify/user/closed/").then(res => {

          if (res.status === 200) {
            Helper.render("text/hr", "closed apps", content)


            const contactsButton = Helper.render("button/left-right", {left: ".contacts", right: "Deine Kontakte"}, content)
            contactsButton.onclick = async () => {

              const contacts = await Helper.contacts()
              contacts.openOverlay()
            }

            const deadlinesButton = Helper.render("button/left-right", {left: `.deadlines`, right: "Nie wieder vergessen"}, content)
            deadlinesButton.onclick = async () => {

              const deadlines = await Helper.deadlines()
              deadlines.openOverlay()
            }

            const groupsButton = Helper.render("button/left-right", {left: ".groups", right: "Schnell, einfach und sicher Kontakte gruppieren"}, content)
            groupsButton.onclick = async () => {

              const groups = await Helper.groups()
              groups.openOverlay()
            }

            const nextStepsButton = Helper.render("button/left-right", {left: `.next-steps`, right: "Was sind deine nächsten Schritte"}, content)
            nextStepsButton.onclick = async () => {

              const nextSteps = await Helper.nextSteps()
              nextSteps.openOverlay()
            }

            const removeButton = Helper.render("button/left-right", {left: ".remove", right: "Mein Konto dauerhaft entfernen"}, content)
            Helper.add("style/red", removeButton)
            Helper.render("text/node/bottom-right-onhover", "Achtung!", removeButton)
            removeButton.onclick = () => {

              const confirm = window.confirm("Du bist gerade dabei deine persönliche Datenbank zu entfernen. Deine Daten werden gelöscht und können nicht mehr wiederhergestellt werden. Du wirst abgemeldet und musst dich erneut registrieren.\n\nMöchtest du alle deine Daten wirklich löschen?")
              if (confirm === true) {
                const email = window.prompt("Bitte bestätige deine E-Mail Adresse, um fortzufahren.")
                if (Helper.verifyIs("text/empty", email)) {
                  window.alert("Fehler.. Bitte wiederholen.")
                  throw new Error("not found")
                }
                Helper.overlay("lock", async o2 => {
                  const res = await Helper.request("/jwt/verify/email/", {email})
                  if (res.status === 200) {
                    const res = await Helper.request("/jwt/remove/user/", {email})
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

            Helper.request("/jwt/get/expert/name/").then(res => {
              if (res.status === 200) {
                const name = res.response
                const button = Helper.render("button/left-right", {left: ".expert", right: "Der Bereich für Experten"}, content)
                button.onclick = () => window.open(`/${name}/`, "_blank")
              }
            })

            Helper.request("/verify/user/admin/").then(res => {
              if (res.status === 200) {
                const button = Helper.render("button/left-right", {left: ".admin", right: "Der Bereich für Admins"}, content)
                button.onclick = () => window.open("/admin/", "_blank")
              }
            })
          }
        })
      })
    }
  }
}
it.append = (name, node) => {
  const button = it.div(name)
  it.addEvent(name, button)
  node.appendChild(button)
  return button
}
it.map = name => {
  const map = {}
  map[name] = it.div(name)
  return map
}
it.div = name => {
  if (name === "action") {
    const button = document.createElement("div")
    button.className = "fs21 sans-serif br13 mtb21 mlr34 flex align center ptb21 plr34 bs-light color-light bg-sunflower"
    return button
  }
  if (name === "add") {
    const button = it.div("bottom-right")
    button.className += " flex align center fs21 btn-theme color-theme"
    button.textContent = "+"
    return button
  }
  if (name === "back") {
    const button = it.div("bottom-left")
    button.className += " flex align center fs21 dark-light-reverse"
    button.textContent = "<<"
    return button
  }
  if (name === "bottom-left") {
    const button = document.createElement("div")
    button.className = "fixed bottom left w34 h34 br55 m34 p21"
    return button
  }
  if (name === "bottom-right") {
    const button = document.createElement("div")
    button.className = "fixed bottom right w34 h34 br55 m34 p21"
    return button
  }
  if (name === "dark-light") {
    const button = document.createElement("div")
    button.className = "sans-serif btn-theme color-theme flex align center wrap mtb21 mlr34 br13"
    return button
  }
  if (name === "go-back") {
    const button = it.div("back")
    button.className += " go-back no-save hover zmax"
    return button
  }
  if (name === "home") {
    return it.div("up")
  }
  if (name === "remove-overlay") {
    const button = it.div("bottom-left")
    button.className += " flex align center fs21 dark-light-reverse"
    button.textContent = "↓"
    return button
  }
  if (name === "save") {
    const btn = it.div("toolbox")
    btn.textContent = "save"
    Helper.add("hover-outline", btn)
    return btn
  }
  if (name === "toolbox") {
    const button = it.div("bottom-right")
    button.className += " zmax hover flex align center fs13 btn-theme color-theme monospace no-save"
    button.textContent = "toolbox"
    return button
  }
  if (name === "up") {
    const button = it.div("bottom-right")
    button.className += " flex align center fs21 btn-theme"
    button.textContent = "↑"
    return button
  }
}
it.render = (name, input, parent) => {
  const btn = it.div(name)
  btn.textContent = input.textContent
  Helper.add("hover-outline", btn)
  if (parent) Helper.append(btn, parent)
  return btn
}
export const action = (text, node) => {
  const div = document.createElement("div")
  div.className = "action"
  div.textContent = text
  if (node) node.appendChild(div)
  return div
}
export const add = (text, node) => {
  const div = document.createElement("div")
  div.className = "add color-theme bg-theme no-save"
  div.textContent = text
  if (node) node.appendChild(div)
  return div
}
export const left = (text, node) => {
  const div = document.createElement("div")
  div.className = "fixed bottom left w34 h34 br55 m34 p21 flex align center fs21 dark-light-reverse hover"
  div.textContent = text
  if (node) node.appendChild(div)
  return div
}
export const button = it
