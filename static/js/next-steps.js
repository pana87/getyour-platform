import {Helper} from "/js/Helper.js"
import {pop} from "/js/overlay.js"
import {textToH2, textToHoverBottomRight, textToDiv} from "/js/convert.js"
import {addLoading} from "/js/events.js"
import {div} from "/js/html-tags.js"
import {post} from "/js/request.js"
import {leftRight} from "/js/button.js"

export const openNextSteps = () => {
  pop(async o2 => {
    const content = o2.content
    await renderContactsWithNextSteps(content)
  })
}
export const renderContactsWithNextSteps = async node => {
  node.textContent = ""
  textToH2("Nächste Schritte", node)
  const loading = addLoading(node)
  const parent = div("", node)
  const res = await post("/jwt/get/contacts/")
  loading.remove()
  if (res.status !== 200) node.remove()
  if (res.status === 200) {
    const contacts = JSON.parse(res.response)
    let buttonCreated = false
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i]
      if (contact.notes) {
        const regex = /next:(\w+)(?:\+(\d+[dm]))?\(([^)]+)\)/g
        let match
        while ((match = regex.exec(contact.notes)) !== null) {
          const action = match[1]
          const duration = match[2] || ''
          const content = match[3]
          const button = leftRight(parent)
          buttonCreated = true
          if (contact.status === "lead-new") {
            button.classList.add("border-green")
            textToHoverBottomRight("Neuer Kontakt", button)
          }
          if (contact.status === "lead-update") {
            button.classList.add("border-orange")
            textToHoverBottomRight("Neue Kontaktanfrage", button)
          }
          if (action === "tel" || action === "webcall") {
            let title
            if (contact.alias) {
              title = textToDiv(`${contact.alias} anrufen`, button.left)
            } else {
              title = textToDiv(`${contact.email} anrufen`, button.left)
            }
            if (contact.phone) {
              button.onclick = () => {
                window.location.href = `tel:${contact.phone}`
              }
            }
          }
          if (action === "email") {
            let title
            if (contact.alias) {
              title = textToDiv(`${contact.alias} schreiben`, button.left)
            } else {
              title = textToDiv(`${contact.email} schreiben`, button.left)
            }
            if (contact.email) {
              button.onclick = () => {
                window.location.href = `mailto:${contact.email}`
              }
            }
          }
          const contentDiv = div("fs13", button.left)
          contentDiv.textContent = content
        }
      }
    }
    if (!buttonCreated) node.remove()
  }
}
