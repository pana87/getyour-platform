import {Helper} from "/js/Helper.js"
import {greenInfo, aLink} from "/js/create.js"
import {div, labelFor, a} from "/js/html-tags.js"
import {verifyInputs} from "/js/verify.js"
import {checkbox, select, id, operator, email, text, textarea, tag, alias} from "/js/input.js"
import {addSubmitButton} from "/js/button.js"
import {textToSpan, textToDiv} from "/js/convert.js"

export const aliasFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.alias = text(it)
  it.alias.input.id = "alias"
  it.alias.input.maxLength = "55"
  it.alias.input.placeholder = "Alias"
  addSubmitButton(it)
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const conditionFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.left = id(it)
  it.left.input.id = "left"
  it.operator = operator(it)
  it.operator.input.id = "operator"
  it.right = text(it)
  it.right.input.id = "right"
  it.right.input.maxLength = "55"
  it.right.input.placeholder = "Vergleichswert (text/any)"
  it.right.input.setAttribute("required", "true")
  addSubmitButton(it)
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const descriptionFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.description = textarea(it)
  it.description.input.id = "description"
  it.description.input.maxLength = "233"
  it.description.input.placeholder = "Beschreibung"
  addSubmitButton(it)
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const emailFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.email = email(it)
  it.email.input.id = "email"
  addSubmitButton(it)
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const imageFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.image = text(it)
  it.image.input.id = "image"
  it.image.input.placeholder = "Bild-URL (text/url)"
  addSubmitButton(it)
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const loginFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.email = email(it)
  it.email.input.id = "email"
  it.dsgvo = checkbox(it)
  it.dsgvo.input.id = "dsgvo"
  it.dsgvo.input.classList.add("dsgvo")
  it.dsgvo.input.setAttribute("required", "true")
  it.label = div("sans-serif mtb21 mlr34", it)
  textToSpan("Ich habe die", it.label)
  const a1 = aLink("Nutzervereinbarungen", "/nutzervereinbarung/", it.label)
  textToSpan("und die", it.label)
  const a2 = aLink("Datenschutz Richtlinien", "/datenschutz/", it.label)
  textToSpan("gelesen und verstanden. Durch meine Anmeldung stimme ich ihnen zu.", it.label)
  it.submit = div("action", it)
  it.submit.textContent = "Jetzt anmelden"
  it.info = greenInfo(it)
  const div1 = textToDiv("Unser Login Prozess ist intuitiv gestaltet und erfordert nur wenige Klicks. Du musst lediglich Deine E-Mail Adresse eingeben, um dich einzuloggen. Wir möchten, dass Du den Login Prozess als einfach und stressfrei erlebst.", it.info)
  const mailto = aLink("Wenn Du Probleme hast oder Hilfe benötigst, stehen wir Dir jederzeit zur Verfügung, um Dir schnell und effektiv weiter zu helfen.", "mailto:datenschutz@get-your.de", div1)
  const div2 = textToDiv("Die Plattform von getyour soll ein sicheres und vertrauenswürdiges Umfeld bieten, damit Du dich auf Deine Daten verlassen kannst.", it.info)
  div2.classList.add("mt13")
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const nameFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.name = tag(it)
  it.name.input.id = "name"
  it.name.input.placeholder = "Name (text/tag)"
  addSubmitButton(it)
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const notesFunnel = node => {
  const div = document.createElement("div")
  div.className = "funnel"
  div.notes = textarea(div)
  div.notes.input.id = "notes"
  div.notes.input.className += " vh55"
  div.notes.input.placeholder = `next:email(Meine Notizen)\nnext:tel(Meine Notizen)\nnext:webcall(Meine Notizen)`
  addSubmitButton(div)
  verifyInputs(div)
  node?.appendChild(div)
  return div
}
export const platformFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.platform = tag(it)
  it.platform.input.id = "platform"
  it.platform.input.placeholder = "Plattform (text/tag)"
  addSubmitButton(it)
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const platformValueFunnel = node => {
  const div = document.createElement("div")
  div.className = "funnel"
  div.alias = alias(div)
  div.alias.input.id = "alias"
  div.alias.input.setAttribute("required", "true")
  div.path = tag(div)
  div.path.input.placeholder = "Pfad (text/tag)"
  div.appendChild(div.path)
  div.appendChild(div.alias)
  addSubmitButton(div)
  verifyInputs(div)
  node?.appendChild(div)
  return div
}
export const roleFunnel = node => {
  const it = document.createElement("div")
  it.className = "funnel"
  it.name = tag(it)
  it.name.input.id = "name"
  it.name.input.placeholder = "Rolle (text/tag)"
  const homeLabel = labelFor("home", "Startseite auswählen")
  it.home = select(it)
  it.home.input.id = "home"
  it.home.prepend(homeLabel)
  addSubmitButton(it)
  verifyInputs(it)
  node?.appendChild(it)
  return it
}
export const statusFunnel = node => {
  const div = document.createElement("div")
  div.className = "funnel"
  div.status = text(div)
  div.status.input.id = "status"
  div.status.input.placeholder = "Status"
  div.status.input.maxLength = "34"
  addSubmitButton(div)
  verifyInputs(div)
  node?.appendChild(div)
  return div
}
export const websiteFunnel = node => {
  const div = document.createElement("div")
  div.className = "funnel"
  div.website = text(div)
  div.website.input.id = "website"
  div.website.input.placeholder = "Webseite (text/url)"
  div.website.input.maxLength = "144"
  addSubmitButton(div)
  verifyInputs(div)
  node?.appendChild(div)
  return div
}
const it = {}
it.div = (id, node) => {
  const div = document.createElement("div")
  div.id = id
  div.submit = Helper.create("button/action")
  div.submit.classList.add("submit")
  div.submit.textContent = "Daten jetzt speichern"
  if (id === "alias") {
    div.alias = Helper.create("input/alias", div)
    div.alias.input.id = "alias"
    Helper.append(div.submit, div)
  }
  if (id === "condition") {
    div.left = Helper.create("input/id", div)
    div.left.input.id = "left"
    div.operator = Helper.create("input/operator", div)
    div.operator.input.id = "operator"
    div.right = Helper.create("input/text", div)
    div.right.input.id = "right"
    div.right.input.maxLength = "55"
    div.right.input.placeholder = "Vergleichswert (text/any)"
    div.right.input.setAttribute("required", "true")
    div.right.input.setAttribute("accept", "text/length")
    Helper.verify("input/value", div.right.input)
    div.right.input.oninput = () => Helper.verify("input/value", div.right.input)
    Helper.append(div.submit, div)
  }
  if (id === "conflict") {
    div.environment = Helper.create("input/textarea", div)
    div.environment.input.id = "environment"
    div.environment.input.setAttribute("required", "true")
    div.environment.input.setAttribute("accept", "text/length")
    div.environment.input.maxLength = "987"
    div.environment.input.placeholder = `Environments: Beschreibe deine Umgebung ?
      - URL Link
      - Browser
      - App
    `
    div.environment.input.style.height = "144px"
    div.environment.input.style.fontSize = "13px"
    Helper.verify("input/value", div.environment.input)
    div.reproduce = Helper.create("input/textarea", div)
    div.reproduce.input.id = "reproduce"
    div.reproduce.input.setAttribute("required", "true")
    div.reproduce.input.setAttribute("accept", "text/length")
    div.reproduce.input.maxLength = "987"
    div.reproduce.input.placeholder = `Steps to reproduce: Reproduziere den Konflikt ?`
    div.reproduce.input.style.height = "144px"
    div.reproduce.input.style.fontSize = "13px"
    Helper.verify("input/value", div.reproduce.input)
    div.expected = Helper.create("input/textarea", div)
    div.expected.input.id = "expected"
    div.expected.input.setAttribute("required", "true")
    div.expected.input.setAttribute("accept", "text/length")
    div.expected.input.maxLength = "987"
    div.expected.input.placeholder = `Expected behavior: Erwartetes Verhalten ?`
    div.expected.input.style.height = "144px"
    div.expected.input.style.fontSize = "13px"
    Helper.verify("input/value", div.expected.input)
    div.actual = Helper.create("input/textarea", div)
    div.actual.input.id = "actual"
    div.actual.input.setAttribute("required", "true")
    div.actual.input.setAttribute("accept", "text/length")
    div.actual.input.maxLength = "987"
    div.actual.input.placeholder = `Actual behavior: Wirkliches Verhalten ?`
    div.actual.input.style.height = "144px"
    div.actual.input.style.fontSize = "13px"
    Helper.verify("input/value", div.actual.input)
    div.visibility = Helper.create("input/visibility", div)
    div.visibility.input.id = "visibility"
    Helper.append(div.submit, div)
  }

  if (id === "description") {
    div.description = Helper.create("input/description", div)
    div.description.input.id = "description"
    Helper.append(div.submit, div)
  }

  if (id === "email") {
    div.email = Helper.create("input/email", div)
    div.email.input.id = "email"
    Helper.append(div.submit, div)
  }
  if (id === "feedback") {
    div.feedback = Helper.create("input/feedback", div)
    div.feedback.input.id = "feedback"
    div.importance = Helper.create("input/importance", div)
    div.importance.input.id = "importance"
    Helper.append(div.submit, div)
  }
  if (id === "name") {
    div.name = Helper.create("input/tag", div)
    div.name.input.id = "name"
    Helper.append(div.submit, div)
  }
  if (id === "platform") {
    div.platform = Helper.create("input/tag", div)
    div.platform.input.id = "platform"
    div.platform.input.placeholder = "Plattform (text/tag)"
    Helper.append(div.submit, div)
  }
  if (id === "getyour.web-entwickler") {
    div.alias = Helper.create("input/alias", div)
    div.type = Helper.create("input/text", div)
    div.type.input.id = "type"
    div.type.input.value = "role"
    div.type.input.disabled = true
    div.image = Helper.create("input/image", div)
    Helper.append(div.submit, div)
  }
  if (id === "image") {
    div.image = Helper.create("input/image", div)
    div.image.input.id = "image"
    Helper.append(div.submit, div)
  }
  if (id === "notes") {
    div.notes = Helper.create("input/textarea", div)
    div.notes.input.id = "notes"
    div.notes.input.className += " vh55"
    div.notes.input.placeholder = `next:email(Meine Notizen)
      next:tel(Meine Notizen)
      next:webcall(Meine Notizen)
    `
    Helper.append(div.submit, div)
  }
  if (id === "phone") {
    div.phone = Helper.create("input/phone", div)
    div.phone.input.id = "phone"
    Helper.append(div.submit, div)
  }
  if (id === "platform.value") {
    div.alias = Helper.create("input/alias", div)
    div.alias.input.id = "alias"
    div.alias.input.setAttribute("required", "true")
    div.path = Helper.create("input/tag", div)
    div.path.input.placeholder = "Pfad (text/tag)"
    Helper.append(div.submit, div)
  }
  if (id === "profile") {
    div.aboutYou = Helper.create("input/textarea", div)
    div.aboutYou.input.id = "aboutYou"
    div.aboutYou.input.placeholder = `Erzähl etwas über dich ?
      - was du gerade machst (beruflich oder privat)
      - etwas was dem anderen hilft
      - von jetzt sprechen
      - praktische Beispiele (beruflich oder privat)
      - Schlüsselwörter benutzen (IT, Beratung)

      z.b., ich bin ... (deine Person), das heißt ... (Vorteil), das bedeutet für dich ... (Nutzen für den anderen).
    `
    div.aboutYou.input.style.height = "144px"
    Helper.add("style/valid", div.aboutYou.input)
    div.aboutYou.input.style.fontSize = "13px"
    div.aboutYou.input.setAttribute("accept", "text/length")
    div.aboutYou.input.maxLength = "987"
    div.whyThis = Helper.create("input/textarea", div)
    div.whyThis.input.id = "whyThis"
    div.whyThis.input.placeholder = `Was kannst du besonders gut ?
      - Nicht in Bullet Points schreiben
      - Vollständige Sätze formulieren

      z.b., mit der STAR Methode:

      1. Situation
      2. Task
      3. Action
      4. Result
    `
    div.whyThis.input.style.height = "144px"
    Helper.add("style/valid", div.whyThis.input)
    div.whyThis.input.style.fontSize = "13px"
    div.whyThis.input.setAttribute("accept", "text/length")
    div.whyThis.input.maxLength = "987"
    div.motivation = Helper.create("input/textarea", div)
    div.motivation.input.id = "motivation"
    div.motivation.input.placeholder = `Wie motivierst du dich ?
      z.b., ich möchte das Web, für ... (Adressat), scheller und einfacher machen, ..
    `
    div.motivation.input.style.height = "144px"
    Helper.add("style/valid", div.motivation.input)
    div.motivation.input.style.fontSize = "13px"
    div.motivation.input.setAttribute("accept", "text/length")
    div.motivation.input.maxLength = "987"
    div.visibility = Helper.create("input/text", div)
    div.visibility.input.id = "visibility"
    div.visibility.input.placeholder = "Sichtbarkeit (open/closed)"
    div.visibility.input.value = "closed"
    div.visibility.input.setAttribute("required", "true")
    div.visibility.input.oninput = () => Helper.verify("input/value", div.visibility.input)
    div.visibility.input.setAttribute("accept", "text/length")
    div.visibility.input.maxLength = "6"
    Helper.verify("input/value", div.visibility.input)
    Helper.append(div.submit, div)
    Helper.request("/jwt/get/id/", {id: "profile"}).then(async res => {
      if (res.status === 200) {
        const profile = JSON.parse(res.response)
        const messagesDiv = document.createElement("div")
        Helper.style(messagesDiv, {display: "flex", flexWrap: "wrap", justifyContent: "space-around"})
        div.prepend(messagesDiv)
        if (profile.messages !== undefined) {
          for (let i = 0; i < profile.messages.length; i++) {
            const message = profile.messages[i]
            const box = Helper.create("box", messagesDiv)
            Helper.style(box, {fontFamily: "sans-serif", fontSize: "21px"})
            box.innerHTML = await Helper.convert("text/purified", message.html)
            box.onclick = () => {
              Helper.overlay("pop", o1 => {
                const content = Helper.create("div/scrollable", o1)
                const remove = Helper.render("button/left-right", {left: ".remove", right: "Nachricht entfernen"}, content)
                remove.onclick = () => {
                  const confirm = window.confirm("Möchtest du diese Nachricht wirklich entfernen?")
                  if (confirm === true) {
                    Helper.overlay("lock", async o2 => {
                      const res = await Helper.request("/remove/profile/message/", {created: message.created})
                      if (res.status === 200) {
                        o2.alert.ok()
                        box.remove()
                        o1.remove()
                      } else {
                        o2.alert.nok()
                      }
                      o2.remove()
                    })
                  }
                }
              })
            }
          }
        }
        const title = Helper.render("text/h2", "Meine Nachrichten")
        div.prepend(title)
        div.aboutYou.input.value = profile.aboutYou
        div.whyThis.input.value = profile.whyThis
        div.motivation.input.value = profile.motivation
        div.visibility.input.value = profile.visibility
      }
    })
  }
  if (id === "role") {
    div.name = Helper.create("input/tag", div)
    div.name.input.id = "name"
    div.name.input.placeholder = "Rolle (text/tag)"
    Helper.render("label", {for: "home", text: "Startseite auswählen"}, div)
    div.home = Helper.create("input/select", div)
    div.home.input.id = "home"
    Helper.append(div.submit, div)
  }
  if (id === "status") {
    div.status = Helper.create("input/text", div)
    div.status.input.id = "status"
    div.status.input.placeholder = "Status"
    div.status.input.maxLength = "34"
    div.status.input.setAttribute("required", "true")
    div.status.input.setAttribute("accept", "text/length")
    Helper.append(div.submit, div)
  }
  if (id === "website") {
    div.website = Helper.create("input/url", div)
    div.website.input.id = "website"
    div.website.input.placeholder = "Webseite (text/url)"
    div.website.input.maxLength = "144"
    div.website.input.setAttribute("accept", "text/length")
    Helper.append(div.submit, div)
  }
  Helper.verify("inputs", div)
  if (node) Helper.append(div, node)
  return div
}
export const funnel = it
