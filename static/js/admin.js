import {onEnter, addLoading} from "/js/events.js"
import {alertOk, alertNok} from "/js/alert.js"
import {startButton, leftRight, loginButton, button, goBackButton, add} from "/js/button.js"
import {post} from "/js/request.js"
import {tag, email, text, selectEmails, selectBoolean} from "/js/input.js"
import {pop, lock} from "/js/overlay.js"
import {nodeToScrollable, textToLink, millisToSince, textToAction, textToDiv, textToH1, textToNote, jsonToDiv} from "/js/convert.js"
import {br, div} from "/js/html-tags.js"
import {renderUserKeys} from "/js/render.js"
import {textIsEmpty, arrayIsEmpty, addValidSign, addNotValidSign, verifyFunnel, verifyInputs, verifyInputValue} from "/js/verify.js"

if (!isValidURL()) throw new Error("unknown location")
textToH1("Admin", document.body)
goBackButton(document.body)
const app = add("↑", document.body)
app.onclick = () => {
  pop(async o1 => {
    const buttons = o1.content
    const res = await post("/verify/user/admin/")
    if (res && res.status === 200) {
      const dbMigration = leftRight({left: ".db-migration"}, buttons)
      dbMigration.onclick = () => {
        lock(o2 => {
          fetch("/db/migration/").then(res => {
            if (res.status === 200) {
              o2.alert.ok()
            } else {
              o2.alert.nok()
            }
            o2.remove()
          })
        })
      }
      loginButton(buttons)
      const logs = leftRight({left: ".logs", right: "Logbuch"}, buttons)
      logs.onclick = () => {
        pop(o4 => {
          const content = o4.content
          const open = leftRight({left: ".open", right: "Logbuch öffnen"}, content)
          open.onclick = () => {
            pop(async o5 => {
              const content = o5.content
              const loader = addLoading(content)
              const res = await post("/admin/get/logs/")
              content.textContent = ""
              if (res.status === 200) {
                const logs = JSON.parse(res.response)
                const fragment = document.createDocumentFragment()
                for (let i = 0; i < logs.length; i++) {
                  const log = logs[i]
                  const button = leftRight(content)
                  if (log.it?.name && log.it?.stack) {
                    textToDiv(log.it.name, button.left)
                    button.addEventListener("click", () => {
                      pop(o6 => {
                        const pre = document.createElement("pre")
                        pre.className = "fs8 monospace color-theme mlr34 mtb21"
                        pre.textContent = log.it.stack
                        o6.content.appendChild(pre)
                      })
                    })
                  }
                  textToDiv(log.method, button.right)
                  textToDiv(`an: ${log.path}`, button.right)
                  textToDiv(`von: ${log.url}`, button.right)
                  br("", button.right)
                  textToDiv(`entstanden vor: ${millisToSince(log.created)}`, button.right)
                }
              } else {
                textToNote("Keine Fehler gefunden", content)
              }
            })
          }
          const empty = leftRight({left: ".empty", right: "Logbuch leeren"}, content)
          empty.onclick = async () => {
            const confirm = window.confirm("Möchtest du wirklich die Logbücher leeren?")
            if (confirm === true) {
              lock(async lock => {
                const res = await post("/admin/remove/logs/")
                if (res.status === 200) {
                  lock.alert.removed()
                } else {
                  lock.alert.nok()
                }
                lock.remove()
              })
            }
          }
        })
      }
      const registerDomain = leftRight({left: ".register-domain", right: "Neue Domain registrieren"}, buttons)
      registerDomain.onclick = () => {
        pop(async o2 => {
          const content = o2.content
          const nameField = tag(content)
          nameField.input.placeholder = "Domain Name"
          const emailField = email(content)
          emailField.classList.add("mtb21", "mlr34")
          const submit = textToAction("Domain jetzt registrieren", content)
          verifyInputs(content)
          submit.onclick = async () => {
            await verifyFunnel(content)
            const name = nameField.input.value
            const email = emailField.input.value
            await verifyExpertNameExist(nameField.input)
            lock(async o3 => {
              const res = await post("/admin/register/email/expert/", {name, email})
              if (res.status === 200) {
                const res = await post("/admin/invite/expert/", {email})
                if (res.status === 200) {
                  o3.alert.saved()
                }
              } else {
                o3.alert.nok()
              }
              o3.remove()
            })
          }
        })
      }
      startButton(buttons)
      const terminal = leftRight({left: ".terminal", right: "Dein Terminal von überall"}, buttons)
      terminal.onclick = () => {
        pop(async o2 => {
          const content = o2.content
          const cmd = text(content)
          cmd.input.placeholder = "command"
          addValidSign(cmd.input)
          const runBtn = textToAction(">>", content)
          const output = div("m34", content)
          function sendCommand() {
            let command = cmd.input.value
            if (command === "") command = "ls"
            const resDiv = div("mtb21 fs13 monospace", output)
            addLoading(resDiv)
            post('/admin/exec/command/', {command})
            .then(res => {
              resDiv.textContent = res.response
              output.insertBefore(resDiv, output.firstChild)
            })
            .catch(err => console.error(err))
            cmd.input.focus()
          }
          runBtn.onclick = sendCommand
          onEnter(cmd.input, sendCommand)
        })
      }
      const updateChildrenBtn = leftRight({left: ".update-children", right: "Beziehungen korrigieren"}, buttons)
      updateChildrenBtn.onclick = () => {
        lock(async lock => {
          const res = await post("/admin/update/children/")
          if (res.status === 200) {
            lock.alert.ok()
          } else {
            lock.alert.nok()
          }
          lock.remove()
        })
      }
      const users = leftRight({left: ".users", right: "Nutzer Liste"}, buttons)
      users.onclick = () => {
        pop(async o2 => {
          const res = await post("/admin/get/users/")
          if (res.status === 200) {
            const users = JSON.parse(res.response)
            users.sort((a, b) => b.counter - a.counter)
            o2.addInfo(users.length)
            const buttons = o2.content
            for (let i = 0; i < users.length; i++) {
              const user = users[i]
              const button = leftRight(buttons)
              button.right.remove()
              button.left.style.margin = "0"
              const message = document.createElement("div")
              message.style.margin = "21px 34px"
              {
                const prefix = div("fs13")
                prefix.textContent = "Email: "
                message.appendChild(prefix)
                const value = document.createElement("div")
                value.textContent = user.email
                message.appendChild(value)
              }
              {
                const prefix = div("fs13")
                prefix.textContent = "Verifiziert: "
                message.appendChild(prefix)
                const value = document.createElement("div")
                value.textContent = user.verified
                message.appendChild(value)
              }
              {
                const prefix = div("fs13")
                prefix.textContent = "Anmeldungen: "
                message.appendChild(prefix)
                const value = document.createElement("div")
                value.textContent = user.counter
                message.appendChild(value)
              }
              button.onclick = ev => {
                ev.stopPropagation()
                pop(o3 => {
                  o3.addInfo(user.email)
                  const buttons = o3.content
                  const addContact = leftRight({left: ".add-contact", right: "Diesen Nutzer als Kontakt anlegen"}, buttons)
                  addContact.onclick = () => {
                    const confirm = window.confirm("Möchtest du diesen Nutzer wirklich in deine Kontakte speichern?")
                    if (confirm === true) {
                      lock(async o4 => {
                        const res = await post("/jwt/register/email/contacts/", {email: user.email})
                        if (res.status === 200) {
                          o4.alert.saved()
                        } else {
                          o4.alert.nok()
                        }
                        o4.remove()
                      })
                    }
                  }
                  const convertImages = leftRight({left: ".convert-array", right: "Array mit Zeitstempel umwandeln"}, buttons)
                  convertImages.onclick = () => {
                    const key = window.prompt("Gebe den Datenschlüssel ein:")
                    if (textIsEmpty(key)) return alertNok()
                    const confirm = window.confirm("Möchtest du die Datenstruktur wirklich ändern?")
                    if (!confirm) return
                    lock(async lock => {
                      const id = user.id
                      const res = await post("/admin/convert/array/", {key, id})
                      if (res.status === 200) {
                        alertOk()
                      } else {
                        alertNok()
                      }
                      lock.remove()
                    })
                  }
                  const jsonButton = leftRight({left: ".json", right: "Nutzer Datenspiegel"}, buttons)
                  jsonButton.onclick = () => {
                    pop(async o4 => {
                      o4.addInfo(user.email)
                      const res = await post("/admin/get/user/json/", {email: user.email})
                      if (res.status === 200) {
                        const div = jsonToDiv(res.response, o4.content)
                      }
                    })
                  }
                  const keysButton = leftRight({left: ".keys", right: "Einzelne Datenfelder des Nutzers"}, buttons)
                  keysButton.onclick = () => {
                    pop(async o4 => {
                      o4.addInfo(user.email)
                      const content = o4.content
                      addLoading(content)
                      const res = await post("/admin/get/user/keys/", {id: user.id})
                      content.textContent = ""
                      if (res.status === 200) {
                        const keys = JSON.parse(res.response)
                        renderUserKeys({user, keys}, content)
                      } else {
                        textToNote("Keine Daten gefunden", content)
                      }
                    })
                  }
                  const treeValue = leftRight({left: ".tree-value", right: "Datenfeld aktualisieren"}, buttons)
                  treeValue.onclick = () => {
                    pop(async o4 => {
                      o4.addInfo(user.email)
                      const content = o4.content
                      const keyValueField = text(content)
                      keyValueField.input.setAttribute("required", "true")
                      keyValueField.input.placeholder = "tree = value"
                      addNotValidSign(keyValueField.input)
                      const submit = textToAction("Datenfeld jetzt aktualisieren", content)
                      submit.onclick = async () => {

                        await verifyInputValue(keyValueField.input)
                        const userInput = keyValueField.input.value
                        const userSplit = userInput.split("=")
                        const tree = userSplit[0].trim()
                        const value = userSplit[1].trim()
                        addNotValidSign(keyValueField.input)
                        if (userSplit.length === 2) {
                          if (!textIsEmpty(tree) && !textIsEmpty(value)) {
                            addValidSign(keyValueField.input)
                            lock(async o5 => {
                              const res = await post("/admin/register/tree/value/", {tree, value, id: user.id})
                              if (res.status === 200) {
                                o5.alert.saved()
                              } else {
                                o5.alert.nok()
                              }
                              o5.remove()
                            })
                          }
                        }
                      }
                    })
                  }
                  const verifiedButton = leftRight({left: ".verified", right: "Nutzer aktivieren/deaktivieren"}, buttons)
                  verifiedButton.onclick = () => {
                    pop(o4 => {
                      o4.addInfo(user.email)
                      const content = o4.content
                      textToH1("Nutzer aktivieren/deaktivieren", content)
                      const verified = selectBoolean(content)
                      verified.setInput(user.verified)
                      addValidSign(verified.input)
                      verified.input.addEventListener("input", () => {
                        lock(async o5 => {
                          const value = verified.input.value === "true"
                          const res = await post("/admin/register/user/verified/", {email: user.email, verified: value})
                          if (res.status === 200) {
                            o5.alert.saved()
                            o2.remove()
                            o3.remove()
                            o4.remove()
                          } else {
                            o5.alert.nok()
                          }
                          o5.remove()
                        })
                      })
                    })
                  }
                })
              }
              button.left.append(message)
            }
          }
        })
      }
      const usersBulk = leftRight({left: ".users-bulk", right: "Aktionen für eine Liste von Nutzern auf einmal"}, buttons)
      usersBulk.onclick = () => {
        pop(async o4 => {
          o4.addInfo(".users-bulk")
          const funnel = o4.content
          textToH1("Mengen Funktionen", funnel)
          const buttons = div("flex mtb21 mlr34", funnel)
          function registerUsersVerified(ids, verified) {

            if (arrayIsEmpty(ids)) {
              window.alert("Wähle mindestens eine E-Mail Adresse.")
              addNotValidSign(selectField.input)
              return
            }
            lock(async o5 => {
              const res = await post("/admin/register/users/verified/", {ids, verified})
              if (res.status === 200) {
                o5.alert.saved()
              } else {
                o5.alert.nok()
              }
              o5.remove()
            })
          }
          const activateButton = textToLink("verified: true", buttons)
          activateButton.onclick = () => {
            const ids = selectField.selectedIds()
            registerUsersVerified(ids, true)
          }
          const deactivateButton = textToLink("verified: false", buttons)
          deactivateButton.onclick = () => {
            const ids = selectField.selectedIds()
            registerUsersVerified(ids, false)
          }
          const selectField = selectEmails(funnel)
          post("/admin/get/users/").then(async res => {
            if (res && res.status === 200) {
              const users = JSON.parse(res.response)
              await selectField.input.add(users)
            }
          })

        })
      }
    }
  })
}
function isValidURL() {
  const {host, pathname, protocol} = window.location
  const isLocalhost = host === "localhost:9999"
  const isGetYour = host === "get-your.de" || host === "www.get-your.de"
  return (isLocalhost || isGetYour) && pathname === "/admin/"
}
async function verifyExpertNameExist(input) {
  const name = input.value
  const res = await post("/admin/verify/expert/name/exist/", {name})
  if (res.status === 200) {
    window.alert("Domain existiert bereits.")
    addNotValidSign(input)
    throw new Error("domain exist")
  }
}
