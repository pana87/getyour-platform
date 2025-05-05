import {aliasFunnel} from "/js/funnel.js"
import {div} from "/js/html-tags.js"
import {goBack, registerHtml} from "/js/events.js"
import {textToAction, srcToImg} from "/js/convert.js"
import {pathIsValid, verifyFunnel, verifyInputs} from "/js/verify.js"
import {alertSaved, alertNok} from "/js/alert.js"

const it = {}
it.append = (name, node) => {
  const button = it.div(name)
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
  parent?.appendChild(btn)
  return btn
}
export const add = (text, node) => {
  const it = right()
  it.textContent = text
  node?.appendChild(it)
  return it
}
export const addSubmitButton = node => {
  node.submit = div("action", node)
  node.submit.classList.add("submit")
  node.submit.textContent = "Daten jetzt speichern"
}
export const aliasIt = (it, node) => {
  const button = leftRight({left: ".alias", right: "Verwende einen alternativen Namen"}, node)
  button.onclick = () => {
    pop(o1 => {
      if (it.alias) o1.addInfo(it.alias)
      const content = o1.content
      const funnel = aliasFunnel(content)
      if (it.alias) {
        funnel.alias.input.value = it.alias
      }
      const submit = textToAction("Alias jetzt speichern", content)
      verifyInputs(funnel)
      submit.onclick = async () => {
        await verifyFunnel(funnel)
        overlay.registerKey(it, {alias: funnel.alias.input.value})
        overlay.tabs.meine.click()
        o1.remove()
        o.remove()
      }
    })
  }
  return button
}
export const bashButton = (text, node) => {
  const btn = div("of-auto flex wrap align between m13 p13 bg-btn color-light br5 hover")
  btn.left = div("monospace fs13 bash", btn)
  btn.left.textContent = text
  btn.right = div("sans-serif", btn)
  btn.right.textContent = "Kopieren"
  node?.appendChild(btn)
  return btn
}
export const copyToClipboardButton = (text, node) => {
  const button = leftRight({left: ".copy", right: "Pfad kopieren"}, node)
  button.onclick = () => {
    navigator.clipboard.writeText(text).then(alertSaved).catch(alertNok)
  }
}
export const darkLightButton = node => {
  const button = document.createElement("div")
  button.className = "sans-serif hover btn-theme color-theme flex align center wrap mtb21 mlr34 br13"
  node?.appendChild(button)
  return button
}
export const left = (text, node) => {
  const div = document.createElement("div")
  div.className = "fixed bottom left w34 h34 br55 m34 p21 flex align center fs34 dark-light-reverse hover"
  div.textContent = text
  node?.appendChild(div)
  return div
}
export const leftRight = (input = {}, node = null) => {
  if (input instanceof Node) node = input
  const btn = div("left-right hover btn-theme color-theme")
  btn.left = div("of-auto mtb21 mlr34 fs21", btn)
  if (input.left) btn.left.textContent = input.left
  btn.right = div("of-auto mtb21 mlr34 fs13", btn)
  if (input.right) btn.right.textContent = input.right
  node?.appendChild(btn)
  return btn
}
export const right = (node) => {
  const div = document.createElement("div")
  div.className = "add hover color-theme btn-theme no-save zmax"
  node?.appendChild(div)
  return div
}
export const addSaveButton = (type, node) => {
  if (type === "expert") {
    const btn = div("toolbox btn-theme color-theme hover no-save zmax")
    btn.textContent = "save"
    btn.onclick = registerHtml
    node?.appendChild(btn)
    return btn
  }
}
export const getyourButton = (node) => {
  const rightBtn = right(node)
  const logo = srcToImg("/public/logo-getyour-red.svg", rightBtn)
  node.appendChild(rightBtn)
  return rightBtn
}
export const goBackButton = (node) => {
  const btn = div("fixed bottom left w34 h34 br55 m34 p21 flex align center fs21 dark-light-reverse go-back no-save hover zmax")
  btn.textContent = "<<"
  btn.onclick = goBack
  node?.appendChild(btn)
  return btn
}
export const imgToBodyButton = (src, node) => {
  if (!pathIsValid()) return 
  const button = leftRight({left: ".append", right: "Bild anhängen"}, node)
  button.onclick = () => {
    const imgDiv = div("", document.body)
    srcToImg(src, imgDiv)
    removeOverlays()
  }
}
export const loginButton = node => {
  const login = leftRight({left: ".login", right: "Dein Zugang zur personalisierten Erfahrung"}, node)
  login.onclick = () => window.open("/login/", "_blank")
  return login
}
export const startButton = node => {
  const start = leftRight({left: ".start", right: "Beginne deine Reise in die digitale Freiheit"}, node)
  start.onclick = () => window.open("/", "_blank")
  node?.appendChild(start)
  return start
}
export const toolboxButton = (node) => {
  const div = document.createElement("div")
  div.className = "toolbox hover no-save zmax color-theme btn-theme"
  div.textContent = "toolbox"
  node?.appendChild(div)
  return div
}
export const button = it
