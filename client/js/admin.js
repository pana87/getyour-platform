import {Helper, addLoading} from "/js/Helper.js"
import {button} from "/js/button.js"
import {post} from "/js/request.js"
import {br} from "/js/html-tags.js"

if (!isValidURL()) throw new Error("unknown location")
Helper.render("text/h1", "Admin", document.body)
button.append("go-back", document.body)
const app = button.append("up", document.body)
app.onclick = () => {
  Helper.overlay("pop", async o1 => {
    const buttons = o1.content
    const res = await Helper.request("/verify/user/admin/")
    if (res && res.status === 200) {
      const dbMigration = Helper.render("button/left-right", {left: ".db-migration"}, buttons)
      dbMigration.onclick = () => {
        Helper.overlay("lock", o2 => {
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
      Helper.render("button/login", "/login/", buttons)
      const logs = Helper.render("button/left-right", {left: ".logs", right: "Logbuch"}, buttons)
      logs.onclick = () => {
        Helper.overlay("pop", o4 => {
          const content = o4.content
          const open = Helper.render("button/left-right", {left: ".open", right: "Logbuch öffnen"}, content)
          open.onclick = () => {
            Helper.overlay("pop", async o5 => {
              const content = o5.content
              const loader = addLoading(content)
              const res = await Helper.request("/admin/get/logs/")
              content.textContent = ""
              if (res.status === 200) {
                const logs = JSON.parse(res.response)
                const fragment = document.createDocumentFragment()
                for (let i = 0; i < logs.length; i++) {
                  const log = logs[i]
                  const button = Helper.create("button/left-right", content)
                  if (log.it?.name && log.it?.stack) {
                    Helper.render("text/div", log.it.name, button.left)
                    button.addEventListener("click", () => {
                      Helper.overlay("pop", o6 => {
                        const pre = document.createElement("pre")
                        pre.className = "fs8 monospace color-theme mlr34 mtb21"
                        pre.textContent = log.it.stack
                        o6.content.appendChild(pre)
                      })
                    })
                  }
                  Helper.render("text/div", log.method, button.right)
                  Helper.render("text/div", `an: ${log.path}`, button.right)
                  Helper.render("text/div", `von: ${log.url}`, button.right)
                  br("", button.right)
                  Helper.render("text/div", `entstanden vor: ${Helper.convert("millis/since", log.created)}`, button.right)
                }
              } else {
                Helper.render("text/note", "Keine Fehler gefunden", content)
              }
            })
          }
          const empty = Helper.render("button/left-right", {left: ".empty", right: "Logbuch leeren"}, content)
          empty.onclick = async () => {
            const confirm = window.confirm("Möchtest du wirklich die Logbücher leeren?")
            if (confirm === true) {
              Helper.overlay("lock", async lock => {
                const res = await Helper.request("/admin/remove/logs/")
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
      const registerDomain = Helper.render("button/left-right", {left: ".register-domain", right: "Neue Domain registrieren"}, buttons)
      registerDomain.onclick = () => {

        Helper.overlay("pop", async o2 => {
          const content = o2.content
          const nameField = Helper.create("input/tag", content)
          nameField.input.placeholder = "Domain Name"
          const emailField = Helper.create("input/email", content)
          emailField.classList.add("mtb21", "mlr34")
          const button = Helper.create("button/action", content)
          button.textContent = "Domain jetzt registrieren"
          button.onclick = async () => {

            await Helper.verify("input/value", nameField.input)
            await Helper.verify("input/value", emailField.input)
            const name = nameField.input.value
            const email = emailField.input.value
            await verifyExpertNameExist(nameField.input)
            Helper.overlay("lock", async o3 => {
              const res = await Helper.request("/admin/register/email/expert/", {name, email})
              if (res.status === 200) {
                const res = await Helper.request("/admin/invite/expert/", {email})
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
      Helper.create("button/start", buttons)
      const terminal = Helper.render("button/left-right", {left: ".terminal", right: "Dein Terminal von überall"}, buttons)
      terminal.onclick = () => {
        Helper.overlay("pop", async o2 => {
          const content = o2.content
          const text = Helper.create("input/text", content)
          text.input.placeholder = "command"
          const runBtn = Helper.render("button/action", ">>", content)
          const output = Helper.div("m34", content)
          function sendCommand() {
            let command = text.input.value
            if (command === "") command = "ls"
            const resDiv = Helper.div("mtb21 fs13 monospace", output)
            Helper.create("div/loading", resDiv)
            post('/admin/exec/command/', {command})
            .then(res => {
              resDiv.textContent = res.response
              output.insertBefore(resDiv, output.firstChild)
            })
            .catch(err => console.error(err))
            text.input.focus()
          }
          Helper.on('click', runBtn, sendCommand)
          Helper.on('enter', text.input, sendCommand)
        })
      }
      const updateChildrenBtn = Helper.render("button/left-right", {left: ".update-children", right: "Beziehungen korrigieren"}, buttons)
      updateChildrenBtn.onclick = () => {
        Helper.overlay("lock", async lock => {
          const res = await post("/admin/update/children/")
          if (res.status === 200) {
            lock.alert.ok()
          } else {
            lock.alert.nok()
          }
          lock.remove()
        })
      }
      const users = Helper.render("button/left-right", {left: ".users", right: "Nutzer Liste"}, buttons)
      users.onclick = () => {
        Helper.overlay("pop", async o2 => {
          const res = await Helper.request("/admin/get/users/")
          if (res.status === 200) {
            const users = JSON.parse(res.response)
            users.sort((a, b) => b.counter - a.counter)
            o2.addInfo(users.length)
            const buttons = o2.content
            for (let i = 0; i < users.length; i++) {
              const user = users[i]
              const button = Helper.create("button/left-right", buttons)
              Helper.add("hover-outline", button)
              button.right.remove()
              button.left.style.margin = "0"
              const message = document.createElement("div")
              message.style.margin = "21px 34px"
              {
                const prefix = document.createElement("div")
                prefix.textContent = "Email: "
                Helper.style(prefix, {fontSize: "13px"})
                message.appendChild(prefix)
                const value = document.createElement("div")
                value.textContent = user.email
                message.appendChild(value)
              }
              {
                const prefix = document.createElement("div")
                prefix.textContent = "Verifiziert: "
                Helper.style(prefix, {fontSize: "13px"})
                message.appendChild(prefix)
                const value = document.createElement("div")
                value.textContent = user.verified
                message.appendChild(value)
              }
              {
                const prefix = document.createElement("div")
                prefix.textContent = "Anmeldungen: "
                Helper.style(prefix, {fontSize: "13px"})
                message.appendChild(prefix)
                const value = document.createElement("div")
                value.textContent = user.counter
                message.appendChild(value)
              }
              button.onclick = ev => {
                ev.stopPropagation()
                Helper.overlay("pop", o3 => {
                  o3.addInfo(user.email)
                  const buttons = o3.content

                  const addContact = Helper.render("button/left-right", {left: ".add-contact", right: "Diesen Nutzer als Kontakt anlegen"}, buttons)
                  addContact.onclick = () => {

                    const confirm = window.confirm("Möchtest du diesen Nutzer wirklich in deine Kontakte speichern?")
                    if (confirm === true) {
                      Helper.overlay("lock", async o4 => {
                        const res = await Helper.request("/jwt/register/email/contacts/", {email: user.email})
                        if (res.status === 200) {
                          o4.alert.saved()
                        } else {
                          o4.alert.nok()
                        }
                        o4.remove()
                      })
                    }
                  }

                  const jsonButton = Helper.render("button/left-right", {left: ".json", right: "Nutzer Datenspiegel"}, buttons)
                  jsonButton.onclick = () => {

                    Helper.overlay("pop", async o4 => {
                      o4.addInfo(user.email)
                      const res = await Helper.request("/admin/get/user/json/", {email: user.email})
                      if (res.status === 200) {
                        const div = Helper.convert("json/div", res.response)
                        Helper.append(div, o4.content)
                      }
                    })
                  }

                  const keysButton = Helper.render("button/left-right", {left: ".keys", right: "Einzelne Datenfelder des Nutzers"}, buttons)
                  keysButton.onclick = () => {

                    Helper.overlay("pop", async o4 => {
                      o4.addInfo(user.email)
                      o4.load()
                      const content = o4.content
                      const res = await Helper.request("/admin/get/user/keys/", {id: user.id})
                      content.textContent = ""
                      if (res.status === 200) {
                        const keys = JSON.parse(res.response)
                        Helper.render("user-keys/update-buttons", {user, keys}, content)
                      } else {
                        Helper.render("text/note", "Keine Daten gefunden", content)
                      }
                    })
                  }

                  const treeValue = Helper.render("button/left-right", {left: ".tree-value", right: "Datenfeld aktualisieren"}, buttons)
                  treeValue.onclick = () => {

                    Helper.overlay("pop", async o4 => {
                      o4.addInfo(user.email)
                      const content = o4.content
                      const keyValueField = Helper.create("input/text", content)
                      keyValueField.input.setAttribute("required", "true")
                      keyValueField.input.placeholder = "tree = value"
                      Helper.add("style/not-valid", keyValueField.input)
                      const submit = Helper.create("button/action", content)
                      submit.textContent = "Datenfeld jetzt aktualisieren"
                      submit.onclick = async () => {

                        await Helper.verify("input/value", keyValueField.input)
                        const userInput = keyValueField.input.value
                        const userSplit = userInput.split("=")
                        const tree = userSplit[0].trim()
                        const value = userSplit[1].trim()
                        Helper.add("style/not-valid", keyValueField.input)
                        if (userSplit.length === 2) {
                          if (!Helper.verifyIs("text/empty", tree) && !Helper.verifyIs("text/empty", value)) {
                            Helper.add("style/valid", keyValueField.input)
                            Helper.overlay("lock", async o5 => {
                              const res = await Helper.request("/admin/register/tree/value/", {tree, value, id: user.id})
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

                  const verifiedButton = Helper.render("button/left-right", {left: ".verified", right: "Nutzer aktivieren/deaktivieren"}, buttons)
                  verifiedButton.onclick = () => {

                    Helper.overlay("pop", o4 => {
                      o4.addInfo(user.email)
                      const content = o4.content
                      Helper.render("text/h1", "Nutzer aktivieren/deaktivieren", content)
                      const verified = Helper.create("input/bool", content)
                      verified.setInput(user.verified)
                      verified.input.addEventListener("input", () => {

                        Helper.overlay("lock", async o5 => {
                          const value = verified.input.value === "true"
                          const res = await Helper.request("/admin/register/user/verified/", {email: user.email, verified: value})
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
      const usersBulk = Helper.render("button/left-right", {left: ".users-bulk", right: "Aktionen für eine Liste von Nutzern auf einmal"}, buttons)
      usersBulk.onclick = () => {
        Helper.overlay("pop", async o4 => {
          o4.info.textContent = ".users-bulk"
          const funnel = o4.content
          Helper.render("text/h1", "Mengen Funktionen", funnel)
          const buttons = Helper.div("flex mtb21 mlr34", funnel)
          function registerUsersVerified(ids, verified) {

            if (Helper.verifyIs("array/empty", ids)) {
              window.alert("Wähle mindestens eine E-Mail Adresse.")
              Helper.add("style/not-valid", selectField.input)
              return
            }
            Helper.overlay("lock", async o5 => {
              const res = await Helper.request("/admin/register/users/verified/", {ids, verified})
              if (res.status === 200) {
                o5.alert.saved()
              } else {
                o5.alert.nok()
              }
              o5.remove()
            })
          }
          const activateButton = Helper.render("text/link", "verified: true", buttons)
          activateButton.onclick = () => {
            const ids = selectField.selectedIds()
            registerUsersVerified(ids, true)
          }
          const deactivateButton = Helper.render("text/link", "verified: false", buttons)
          deactivateButton.onclick = () => {
            const ids = selectField.selectedIds()
            registerUsersVerified(ids, false)
          }
          const selectField = Helper.create("select/emails", funnel)
          Helper.request("/admin/get/users/").then(async res => {
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
  const res = await Helper.request("/admin/verify/expert/name/exist/", {name})
  if (res.status === 200) {
    window.alert("Domain existiert bereits.")
    Helper.add("style/not-valid", input)
    throw new Error("domain exist")
  }
}
