import {Helper} from "/js/Helper.js"

const id = "role-apps"
const script = document.querySelector(`script#${id}`)
if (!script && !script.hasAttribute("name") && script.hasAttribute("created")) throw new Error(`'${id}' invalid`)
const roleName = script.getAttribute("role-name")
const roleId = script.getAttribute("role-id")
console.log(roleId);


let button = document.querySelector(`div.${id}-button`)
if (!button) {
  button = Helper.create("button/role-apps", document.body)
}

// todo

button.onclick = async () => {

  Helper.overlay("pop", async overlay => {
    overlay.addInfo()
    // Helper.removeOverlayButton(overlay)
    const info = Helper.create("header/info", overlay)
    info.append(Helper.convert("text/span", input.tag))


    const content = Helper.create("div/loading", parent)
    const res = await Helper.request("/verify/user/closed/")
    if (res.status === 200) {

      const res = await Helper.request("/get/platform/role-apps/", {id: input})
      if (res.status === 200) {
        const apps = JSON.parse(res.response)

        Helper.convert("parent/scrollable", content)

        for (let i = 0; i < apps.length; i++) {
          const app = apps[i]

          const button = Helper.create("button/left-right", content)
          button.left.textContent = `.${app}`

          if (app === "scripts") {
            button.right.textContent = "Meine HTML Skripte"


            button.addEventListener("click", () => {
              Helper.overlay("pop", async overlay => {

                Helper.removeOverlayButton(overlay)
                const info = Helper.create("header/info", overlay)
                info.textContent = `.scripts`

                const create = Helper.create("button/left-right", overlay)
                create.left.textContent = ".create"
                create.right.textContent = "Neues Skript hochladen"
                create.addEventListener("click", () => {

                  Helper.overlay("pop", overlay => {
                    Helper.removeOverlayButton(overlay)
                    const info = Helper.create("header/info", overlay)
                    info.append(Helper.convert("text/span", ".script"))

                    const funnel = Helper.create("div/scrollable", overlay)

                    const nameField = Helper.create("field/tag", funnel)
                    nameField.input.placeholder = "mein-skript"
                    Helper.verify("input/value", nameField.input)
                    nameField.input.addEventListener("input", () => Helper.verify("input/value", nameField.input))

                    const scriptField = Helper.create("field/script", funnel)
                    scriptField.input.style.height = "100vh"
                    Helper.verify("input/value", scriptField.input)
                    scriptField.input.addEventListener("input", () => Helper.verify("input/value", scriptField.input))

                    const button = Helper.create("button/action", funnel)
                    button.textContent = "Skript jetzt speichern"
                    button.addEventListener("click", async () => {

                      await Helper.verify("field-funnel", funnel)

                      const map = {}
                      map.script = scriptField.input.value
                      map.id = nameField.input.value

                      Helper.overlay("lock", async securityOverlay => {

                        const res = await Helper.request("/register/script/closed", map)

                        if (res.status === 200) {

                          Helper.convert("parent/loading", content)
                          await Helper.render("scripts/update-buttons", content)

                          securityOverlay.remove()
                          overlay.remove()

                        }

                        if (res.status !== 200) {
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }

                      })

                    })

                  })

                })

                Helper.render("text/hr", "Meine Skripte", overlay)

                const content = Helper.create("div/loading", overlay)

                await Helper.render("scripts/update-buttons", content)


              })
            })

          }


        }

        return resolve(content)

      }

      if (res.status !== 200) {
        Helper.convert("element/reset", content)
        Helper.render("nav/open", content)
      }
    } else {
      Helper.convert("element/reset", content)
      Helper.render("nav/open", content)
    }

  })

}


const roleAppsButton = Helper.render("button/left-right", {left: ".role-apps", right: "Rollenapps Freigabe Button anhängen"})
roleAppsButton.onclick = () => {

  Helper.overlay("pop", async overlay => {
    overlay.load()
    const content = overlay.content
    Helper.render("text/title", "Für welche Rolle möchtest du den Button anhängen?", content)
    const div = Helper.create("div/loading", content)
    const res = await Helper.request("/location-expert/get/platform/roles/")
    overlay.loading.remove()
    if (res.status === 200) {
      const roles = JSON.parse(res.response)
      Helper.convert("parent/scrollable", div)
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]
        Helper.render("button/role", role, div)
      }
    } else {
      const res = await Helper.request("/location-writable/get/platform/roles/text-value/")
      if (res.status === 200) {
        const roles = JSON.parse(res.response)
        Helper.convert("parent/scrollable", div)
        for (let i = 0; i < roles.length; i++) {
          const role = roles[i]
          Helper.render("button/role", role, div)
        }
      } else {
        Helper.convert("parent/info", div)
        content.textContent = "Keine Rollen gefunden."
      }
    }
  })
}
