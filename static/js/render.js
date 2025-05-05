import {div} from "/js/html-tags.js"
import {addLoading} from "/js/events.js"
import {post} from "/js/request.js"
import {verifyInputValue} from "/js/verify.js"
import {flexRow} from "/js/create.js"
import {leftRight} from "/js/button.js"
import {pop, lock} from "/js/overlay.js"
import {selectBoolean, text, textarea} from "/js/input.js"
import {nodeToScrollable, textToLink, textToTag, textToAction} from "/js/convert.js"

export const renderKeyValue = (key, value, node) => {
  const it = div("flex mtb21 mlr34")
  it.key = div("flex align center", it)
  it.key.textContent = key
  it.value = div("ml8 fs21", it)
  it.value.textContent = value
  node?.appendChild(it)
  return it
}
export const renderNode = (tag, text, node) => {
  const element = document.createElement(tag)
  if (!element) {
    throw new Error("renderNode: no valid html element tag")
  }
  element.textContent = text
  node?.appendChild(element)
  return element
}
export const renderTabs = (input, node) => {
  const tabNames = input.split(" ")
  const container = flexRow(node)
  container.classList.add("flex-start")
  const tabs = {}
  tabNames.forEach((name, index) => {
    const button = textToLink(name, container)
    const tag = textToTag(name)
    tabs[tag] = button
    if (index === 0) button.classList.add("selected")
    button.onclick = ev => {
      Object.values(tabs).forEach(tab => tab.classList.remove("selected"))
      ev.target.classList.add("selected")
    }
  })
  return tabs
}
export const renderTag = (tag, input, node) => {
  const element = document.createElement(tag)
  if (!element) {
    throw new Error("renderTag: no valid html element tag")
  }
  element.textContent = input.textContent
  element.className = input.className
  node?.appendChild(element)
  return element
}
export const renderUserKeys = (input, node) => {
  const {user, keys} = input
  nodeToScrollable(node)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const keysButton = leftRight({left: `.${key}`}, node)
    keysButton.onclick = () => {

      pop(o1 => {
        o1.addInfo(`${user.email}/keys/${key}`)
        const content = o1.content

        const bodyButton = leftRight({left: ".body", right: "Datensatz Inhalt"}, content)
        bodyButton.onclick = () => {

          pop(async o2 => {
            o2.addInfo(`${user.email}/keys/${key}`)
            const content = o2.content
            addLoading(content)
            const res = await post("/jwt/get/key-admin/", {id: user.id, key})
            if (res.status === 200) {

              let body
              try {
                body = JSON.parse(res.response)
              } catch (error) {
                body = res.response
              }
              nodeToScrollable(content)

              if (typeof body === "boolean") {

                const boolField = selectBoolean(content)
                boolField.setInput(body)
                boolField.input.addEventListener("input", () => {

                  lock(async o5 => {
                    const bool = boolField.input.value === "true"
                    const res = await post("/update/user/bool-tree-admin/", {bool, id: user.id, tree: key})
                    if (res.status === 200) {
                      window.alert("Daten erfolgreich gespeichert.")
                    } else {
                      window.alert("Fehler.. Bitte wiederholen.")
                    }
                    o5.remove()
                  })
                })
              }

              if (typeof body === "number") {

                const numberField = tel(content)
                numberField.input.placeholder = "Dieser Datensatz enthält eine Nummer"
                numberField.input.style.fontFamily = "monospace"
                numberField.input.style.fontSize = "13px"
                numberField.input.setAttribute("required", "true")
                numberField.input.setAttribute("accept", "text/number")
                numberField.input.value = body
                verifyInputValue(numberField.input)
                const submit = textToAction("Nummer jetzt speichern", content)
                submit.onclick = async () => {
                  await verifyInputValue(numberField.input)
                  const number = numberField.input.value
                  lock(async o3 => {
                    const res = await post("/update/user/number-tree-admin/", {number, id: user.id, tree: key})
                    if (res.status === 200) {
                      window.alert("Datensatz erfolgreich gespeichert.")
                      o2.remove()
                    }
                    if (res.status !== 200) {
                      window.alert("Fehler.. Bitte wiederholen.")
                    }
                    o3.remove()
                  })
                }
              }

              if (typeof body === "string") {

                const textField = textarea(content)
                textField.input.placeholder = "Dieser Datensatz enthält eine Zeichenkette"
                textField.input.style.height = "55vh"
                textField.input.style.fontFamily = "monospace"
                textField.input.style.fontSize = "13px"
                textField.input.value = body
                verifyInputValue(textField.input)
                const submit = textToAction("Datensatz jetzt speichern", content)
                submit.onclick = () => {

                  const text = textField.input.value
                  lock(async o3 => {
                    const res = await post("/update/user/text-tree-admin/", {text, id: user.id, tree: key})
                    if (res.status === 200) {
                      window.alert("Datensatz erfolgreich gespeichert.")
                      o2.remove()
                    }
                    if (res.status !== 200) {
                      window.alert("Fehler.. Bitte wiederholen.")
                    }
                    o3.remove()
                  })
                }
              }

              if (typeof body === "object") {

                const keys = []
                for (let i = 0; i < Object.keys(body).length; i++) {
                  const item = Object.keys(body)[i]
                  keys.push(`${key}.${item}`)
                }
                renderUserKeys({user, keys}, content)
              }

            } else {
              textToNote("Dieser Datensatz ist leer.", content)
            }
          })
        }

        const keyButton = leftRight({left: ".key", right: "Schlüssel Name ändern"}, content)
        keyButton.onclick = () => {

          pop(async o2 => {
            o2.addInfo(`${user.email}/${key}`)
            const content = o2.content
            const textField = text(content)
            textField.input.className += " monospace fs13"
            textField.input.placeholder = "Schlüssel Name"
            textField.input.setAttribute("required", "true")
            textField.input.setAttribute("accept", "text/tag")
            textField.input.value = key.split(".")[key.split(".").length - 1]
            verifyInputValue(textField.input)
            const submit = textToAction("Name jetzt speichern", content)
            submit.onclick = async () => {
              await verifyInputValue(textField.input)
              lock(async o3 => {
                const res = await post("/update/user/key-name-tree-admin/", {name: textField.input.value, id: user.id, tree: key})
                if (res.status === 200) {
                  window.alert("Datensatz erfolgreich gespeichert.")
                  o1.previousSibling.remove()
                  o1.remove()
                  o2.remove()
                } else {
                  window.alert("Fehler.. Bitte wiederholen.")
                }
                o3.remove()
              })
            }
          })
        }
        const removeButton = leftRight({left: ".remove", right: "Datensatz entfernen"}, content)
        removeButton.onclick = () => {
          const confirm = window.confirm("Du bist gerade dabei einen Datensatz aus der persönlichen Datenbank des Nuzters zu löschen. Diese Daten werden gelöscht und können nicht mehr wiederhergestellt werden.\n\nMöchtest du diesen Datensatz wirklich löschen?")
          if (confirm === true) {
            lock(async o2 => {
              const res = await post("/remove/user/tree-admin/", {tree: key, id: user.id})
              if (res.status === 200) {
                alert("Datensatz erfolgreich gelöscht.")
                keysButton.remove()
              } else {
                alert("Fehler.. Bitte wiederholen.")
              }
              o1.remove()
              o2.remove()
            })
          }
        }
      })
    }
  }
}
