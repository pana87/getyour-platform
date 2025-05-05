import {Helper} from "/js/Helper.js"

(async() => {

  let button = document.querySelector("div.add-button")
  if (!button) {
    button = Helper.create("button/add", document.body)
  }
  Helper.add("hover-outline", button)
  button.onclick = () => {

    Helper.overlay("pop", o1 => {
      o1.onlyClosedUser()
      const content = o1.content
      const funnel = Helper.funnel("profile", content)
      funnel.submit.onclick = async () => {

        await Helper.verify("funnel", funnel)
        const aboutYou = funnel.aboutYou.input.value
        const whyThis = funnel.whyThis.input.value
        const motivation = funnel.motivation.input.value
        const visibility = funnel.visibility.input.value
        Helper.overlay("lock", async o2 => {
          const res = await Helper.request("/register/user/profile/", {aboutYou, whyThis, motivation, visibility})
          if (res.status === 200) {
            o2.alert.ok()
            window.location.reload()
          } else {
            o2.alert.nok()
            o2.remove()
          }
        })

      }
    })
  }
})();

function updateOpenProfiles(profiles, node) {

  Helper.convert("parent/flex-row", node)
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i]
    const button = Helper.div("button max-w610 br13 p13", node)
    Helper.add("hover-outline", button)
    Helper.render("div", {classes: "fs21", text: `Rollen auf der Plattform:`}, button)
    Helper.render("div", {classes: "fs13 color-orange", text: profile.roles.join(", ")}, button)

    const questions = [
      {question: "Erzähl etwas über dich ?", answer: profile.aboutYou},
      {question: "Was kannst du besonders gut ?", answer: profile.whyThis},
      {question: "Wie motivierst du dich ?", answer: profile.motivation},
    ]

    for (let i = 0; i < questions.length; i++) {
      const it = questions[i]
      const h2 = Helper.render("div", {classes: "mtb13", text: it.question}, button)
      const content = Helper.render("html/p", it.answer, button)
      content.classList.add("max-h89", "of-auto")
    }

    button.onclick = () => {
      Helper.overlay("pop", o1 => {
        const content = o1.content

        const conflicts = Helper.render("button/left-right", {left: ".conflicts", right: "Melde einen Konflikt"}, content)
        conflicts.onclick = () => {

          Helper.overlay("conflicts", profile)
        }

        const messages = Helper.render("button/left-right", {left: ".message", right: "Sende eine Nachricht"}, content)
        messages.onclick = () => {

          Helper.overlay("pop", o2 => {
            const content = o2.content
            const htmlField = Helper.create("input/textarea", content)
            htmlField.input.placeholder = `Text oder HTML Nachricht hier rein kopieren

            Bitte beachte, dass der Empfänger der Nachricht, keine Möglichkeit hat dich zu kontaktieren.
            `
            htmlField.input.style.height = "233px"
            htmlField.input.setAttribute("required", "true")
            Helper.verify("input/value", htmlField.input)
            htmlField.input.oninput = () => Helper.verify("input/value", htmlField.input)
            const submit = Helper.create("button/action", content)
            submit.textContent = "Nachricht jetzt senden"
            submit.onclick = async () => {

              await Helper.verify("input/value", htmlField.input)
              const message = await Helper.convert("text/purified", htmlField.input.value)
              if (Helper.verifyIs("text/empty", message)) {
                window.alert("Fehler.. Bitte wiederholen.")
                Helper.add("style/not-valid", htmlField.input)
                return
              }
              Helper.overlay("lock", async o3 => {
                const res = await Helper.request("/register/profile/message/", {created: profile.created, message})
                if (res.status === 200) {
                  o3.alert.ok()
                  o2.remove()
                  o1.remove()
                } else {
                  o3.alert.nok()
                }
                o3.remove()
              })
            }
          })
        }
      })
    }
  }

  return node
}

(async() => {

  let content = document.querySelector("div.profiles")
  if (!content) content = Helper.div("sans-serif color-theme profiles", document.body)
  content.textContent = ""
  content.search = Helper.create("input/text", content)
  Helper.add("style/valid", content.search.input)
  content.search.input.placeholder = "Suche nach Schlüsselwörter"
  const loading = Helper.create("div/loading", content)
  Helper.request("/get/users/profile/open/").then(res => {
    loading.remove()
    if (res.status === 200) {
      const profiles = JSON.parse(res.response)
      const csvParts = []
      for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i]
        profile.csv = ""
        for (const [key, value] of Object.entries(profile)) {
          if (key === "created" || key === "visibility" || key === "messages" || key === "weakness") continue
          if (!Helper.verifyIs("text/empty", value)) {
            csvParts.push(value)
          }
        }
        profile.csv = csvParts.join(", ")
      }

      const list = Helper.create("div", content)
      content.search.input.oninput = (ev) => {
        const userInput = ev.target.value.toLowerCase()

        if (Helper.verifyIs("text/empty", userInput)) {
          updateOpenProfiles(profiles, list)
          return
        }

        const filtered = profiles.filter(it => it.csv.toLowerCase().includes(userInput))
        const highlighted = filtered.map(it => {

          const highlightedProfile = {}
          const escapedTerm = userInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

          for (const [key, value] of Object.entries(it)) {
            if (typeof value === 'string') {
              const highlightedValue = value.replace(new RegExp(escapedTerm, 'gi'), match => `<mark>${match}</mark>`)
              highlightedProfile[key] = highlightedValue
            } else {
              highlightedProfile[key] = value
            }
          }

          return highlightedProfile
        })
        updateOpenProfiles(highlighted, list)
      }
      updateOpenProfiles(profiles, list)
    } else {
      Helper.render("text/note", `Es wurden keine Profile gefunden.`, content)
    }
  })
})();
