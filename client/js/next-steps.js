import {Helper} from "/js/Helper.js"

export const nextSteps = {}
nextSteps.openOverlay = () => {

  Helper.overlay("pop", async o2 => {
    const content = o2.content
    await renderContactsWithNextSteps(content)
  })
}

async function renderContactsWithNextSteps(node) {

  node.textContent = ""
  Helper.render("text/h1", "Nächste Schritte", node)
  const loading = Helper.create("div/loading", node)
  const parent = Helper.div("", node)
  const res = await Helper.request("/jwt/get/user/contacts/")
  loading.remove()
  if (res.status === 200) {
    const contacts = JSON.parse(res.response)
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]

      if (contact.notes) {
        const regex = /next:(\w+)(?:\+(\d+[dm]))?\(([^)]+)\)/g
        let match

        while ((match = regex.exec(contact.notes)) !== null) {
          const action = match[1]
          const duration = match[2] || ''
          const content = match[3]

          const button = Helper.create("button/left-right", parent)

          if (contact.status === "lead-new") {
            button.style.border = `3px solid ${Helper.colors.matte.green}`
            Helper.render("text/node/bottom-right-onhover", "Neuer Kontakt", button)
          }

          if (contact.status === "lead-update") {
            button.style.border = `3px solid ${Helper.colors.matte.sunflower}`
            Helper.render("text/node/bottom-right-onhover", "Neue Kontaktanfrage", button)
          }

          if (action === "tel" || action === "webcall") {
            let title
            if (contact.alias) {
              title = Helper.render("text/div", `${contact.alias} anrufen.`, button.left)
            } else {
              title = Helper.render("text/div", `${contact.email} anrufen.`, button.left)
            }

            if (contact.phone) {
              Helper.render("icon/node/path", "/public/phone-out.svg", button.right).then(icon => {
                icon.style.width = "34px"
                icon.style.padding = "0 13px"
              })
              button.onclick = () => {
                window.location.href = `tel:${contact.phone}`
              }
            }

          }

          if (action === "email") {
            let title
            if (contact.alias) {
              title = Helper.render("text/div", `${contact.alias} schreiben.`, button.left)
            } else {
              title = Helper.render("text/div", `${contact.email} schreiben.`, button.left)
            }

            if (contact.email) {
              Helper.render("icon/node/path", "/public/email-out.svg", button.right).then(icon => {
                icon.style.width = "34px"
                icon.style.padding = "0 13px"
              })
              button.onclick = () => {
                window.location.href = `mailto:${contact.email}`
              }
            }
          }

          const contentDiv = Helper.create("div")
          contentDiv.textContent = content
          contentDiv.style.fontSize = "13px"
          button.left.appendChild(contentDiv)
        }
      }
    }
  }
}
