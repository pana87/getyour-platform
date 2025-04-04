import {button} from "/js/button.js"
import {funnel} from "/js/funnel.js"
import {renderTag, Helper} from "/js/Helper.js"
import {post} from "/js/request.js"

const it = {}
it.openOverlay = () => {
  Helper.overlay("pop", async o1 => {
    o1.onlyClosedUser()
    o1.addInfo(".contacts")
    const content = o1.content
    const searchField = Helper.create("input/text", content)
    searchField.input.placeholder = "Filter nach E-Mail oder Notizen"
    const container = Helper.create("div/flex-row", content)
    const exportButton = Helper.render("text/link", "Exportieren", container)
    const importButton = Helper.render("text/link", "Importieren", container)
    const retellButton = Helper.render("text/link", "Retell AI", container)
    importButton.onclick = () => {

      Helper.overlay("pop", o2 => {
        const funnel = o2.content
        const field = Helper.create("input/textarea", funnel)
        field.input.className += " monospace vh55 fs13"
        field.input.setAttribute("required", "true")
        field.input.placeholder = `[{\n  email: "string", // id\n  alias: "string",  // optional\n  birthday: "1999-03-21", // optional\n  status: "string", // optional\n  notes: "string", // optional\n  phone: "+123456789", // optional\n  website: "string" // optional\n}]`
        Helper.verify("inputs", funnel)
        const submit = Helper.create("button/action", funnel)
        submit.textContent = "Kontakte jetzt importieren"
        submit.onclick = async () => {
          await Helper.verify("funnel", funnel)
          try {
            const contacts = JSON.parse(field.input.value)
            if (Helper.verifyIs("array/empty", contacts)) throw new Error("contacts is empty")
            for (let i = 0; i < contacts.length; i++) {
              const contact = contacts[i]
              if (!contact.email) {
                throw new Error("'contact.email' is missing")
              }
            }
            Helper.overlay("lock", async o3 => {
              const res = await Helper.request("/jwt/register/contacts/import/", {contacts})
              if (res.status === 200) {
                o3.alert.saved()
                await getAndRenderContactsClosed()
                o2.remove()
              } else {
                o3.alert.nok()
              }
              o3.remove()
            })
          } catch (error) {
            console.error(error)
            window.alert("Deine Kontaktliste ist in einem ungültigen Format.")
            Helper.add("style/not-valid", field.input)
          }
        }
      })
    }
    Helper.render("text/hr", "Meine Kontakte", content)
    const contactsDiv = Helper.create("div", content)
    function concatEmailAndNotes(array, key) {

      return array.map(it => {
        if (it.email && it.notes) {
          return { ...it, [key]: `${it.email}<br>${it.notes}` }
        } else {
          return { ...it, [key]: it.email }
        }
      })
    }
    async function renderContactButtons(contacts, parent, query) {

      const numerology = await Helper.numerology()
      const fragment = document.createDocumentFragment()
      parent.textContent = ""
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i]
        const contactButton = button.append("dark-light", fragment)
        if (contact.birthday){
          const birthdate = new Date(contact.birthday)
          const lifepath = numerology.dateToLifePath(birthdate)
          const div = Helper.div("flex align center circle bg-green w55 h55 m21 fs21")
          div.textContent = lifepath
          contactButton.prepend(div)
        }
        const textDiv = Helper.div("flex column flex1 mtb21 mlr34", contactButton)
        if (contact.alias) {
          const alias = Helper.div("fs21")
          alias.textContent = contact.alias
          Helper.append(alias, textDiv)
        }
        const query = Helper.div("fs13 mtb8")
        Helper.append(query, textDiv)
        if (contact.query) {
          let text = await Helper.convert("text/purified", contact.query)
          query.innerHTML = text
        } else {
          query.textContent = contact.email
        }
        const buttons = Helper.div("flex column", contactButton)
        if (contact.email) {
          const clone = Helper.render("text/link", "E-Mail schreiben", buttons)
          clone.classList.add("m8")
          clone.onclick = ev => {

            ev.stopPropagation()
            window.location.href = `mailto:${contact.email}`
            openNotes(contact)
          }
        }
        if (contact.phone) {
          const clone = Helper.render("text/link", "Telefon anrufen", buttons)
          clone.classList.add("m8")
          clone.onclick = ev => {

            ev.stopPropagation()
            window.location.href = `tel:${contact.phone}`
            openNotes(contact)
          }
        }
        if (contact.website) {
          const clone = Helper.render("text/link", "Webseite öffnen", buttons)
          clone.classList.add("m8")
          clone.onclick = ev => {

            ev.stopPropagation()
            window.open(contact.website, "_blank")
            openNotes(contact)
          }
        }
        function openNotes(contact, o){

          Helper.overlay("pop", o1 => {
            o1.addInfo(contact.email)
            const content = o1.content
            const f1 = funnel.div("notes", content)
            if (contact.notes) {
              f1.notes.input.value = contact.notes
            }
            f1.submit.onclick = async () => {

              await Helper.verify("input/value", f1.notes.input)
              const notes = f1.notes.input.value
              Helper.overlay("lock", async o2 => {
                const res = await Helper.request("/jwt/update/contacts/notes/", {created: contact.created, notes})
                if (res.status === 200) {
                  o2.alert.saved()
                  await getAndRenderContactsClosed()
                  o1.remove()
                  if (o) o.remove()
                } else {
                  o2.alert.nok()
                }
                o2.remove()
              })
            }
          })
        }
        contactButton.onclick = () => {

          Helper.overlay("pop", async o2 => {
            o2.addInfo(contact.email)
            const buttons = o2.content

            const alias = Helper.render("button/left-right", {left: ".alias", right: "Gib deinem Kontakt einen alternativen Namen"}, buttons)
            alias.onclick = () => {

              Helper.overlay("pop", o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const funnel = Helper.funnel("alias", content)
                if (contact.alias) {
                  funnel.alias.input.value = contact.alias
                }
                funnel.submit.onclick = async () => {

                  const alias = funnel.alias.input.value
                  Helper.overlay("lock", async lock => {
                    const res = await Helper.request("/jwt/update/contacts/alias/", {created: contact.created, alias})
                    if (res.status === 200) {
                      lock.alert.saved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      lock.alert.nok()
                    }
                    lock.remove()
                  })
                }

              })
            }

            const character = Helper.render("button/left-right", {left: ".character", right: "Erfahre mehr über deinen Kontakt"}, buttons)
            character.onclick = () => {

              Helper.overlay("pop", o3 => {
                o3.onlyClosedUser()
                o3.addInfo(contact.email)
                const content = o3.content
                const funnel = createBirthdayFunnel()
                funnel.submit.onclick = async () => {

                  await Helper.verify("input/value", funnel.date.input)
                  const birthday = new Date(funnel.date.input.value).toISOString()
                  Helper.overlay("lock", async lock => {
                    const res = await Helper.request("/jwt/update/contacts/birthday/", {created: contact.created, birthday})
                    if (res.status === 200) {
                      lock.alert.saved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      lock.alert.nok()
                    }
                    lock.remove()
                  })
                }
                const form = funnel.createForm()
                content.appendChild(form)
                if (contact.birthday) {
                  const split = contact.birthday.split("T")
                  funnel.date.value = split[0]
                  const birthday = split[0]
                  const date = new Date(birthday)
                  numerology.renderDateContent(date, content)
                  if (contact.alias) numerology.renderNameContent(contact.alias, content)
                }
              })
            }

            const email = Helper.render("button/left-right", {left: ".email", right: "Aktualisiere die E-Mail Adresse deines Kontakts"}, buttons)
            email.onclick = () => {

              Helper.overlay("pop", o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const funnel = Helper.funnel("email", content)
                if (contact.email) {
                  funnel.email.input.value = contact.email
                }
                Helper.verify("input/value", email.input)
                funnel.submit.onclick = async () => {

                  await Helper.verify("input/value", funnel.email.input)
                  const email = funnel.email.input.value
                  Helper.overlay("lock", async lock => {
                    const res = await Helper.request("/jwt/update/contacts/email/", {created: contact.created, email})
                    if (res.status === 200) {
                      lock.alert.saved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      lock.alert.nok()
                    }
                    lock.remove()
                  })
                }
              })
            }

            const notes = Helper.render("button/left-right", {left: ".notes", right: "Mache dir Notizen zu deinem Kontakt"}, buttons)
            notes.onclick = () => {

              openNotes(contact, o2)
            }

            const phone = Helper.render("button/left-right", {left: ".phone", right: "Gib die Telefon Nummer deines Kontakts ein"}, buttons)
            phone.onclick = () => {

              Helper.overlay("pop", o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const tel = Helper.create("input/tel", content)
                tel.input.setAttribute("accept", "text/tel")
                tel.input.placeholder = "Telefon Nummer (text/tel)"
                if (contact.phone) {
                  tel.input.value = contact.phone
                }
                Helper.verify("input/value", tel.input)
                const submit = Helper.create("button/action", content)
                submit.textContent = "Daten jetzt speichern"
                submit.onclick = async () => {

                  await Helper.verify("input/value", tel.input)
                  const phone = tel.input.value
                  Helper.overlay("lock", async lock => {
                    const res = await Helper.request("/jwt/update/contacts/phone/", {created: contact.created, phone})
                    if (res.status === 200) {
                      lock.alert.saved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      lock.alert.nok()
                    }
                    lock.remove()
                  })
                }
              })
            }

            const remove = Helper.render("button/left-right", {left: ".remove", right: "Kontakt entfernen"}, buttons)
            remove.onclick = () => {

              const confirm = window.confirm("Möchtest du deinen Kontakt wirklich entfernen?")
              if (confirm === true) {
                Helper.overlay("lock", async o3 => {
                  const res = await Helper.request("/jwt/remove/user/contacts/item/", {created: contact.created})
                  if (res.status === 200) {
                    o3.alert.removed()
                    await getAndRenderContactsClosed()
                    o2.remove()
                  } else {
                    o3.alert.nok()
                  }
                  o3.remove()
                })
              }
            }

            const status = Helper.render("button/left-right", {left: ".status", right: "Gib deinem Kontakt einen Status"}, buttons)
            status.onclick = () => {

              Helper.overlay("pop", o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const f1 = funnel.div("status", content)
                if (contact.status) {
                  f1.status.input.value = contact.status
                }
                Helper.verify("input/value", f1.status.input)
                f1.submit.onclick = async () => {

                  await Helper.verify("input/value", f1.status.input)
                  const status = f1.status.input.value
                  Helper.overlay("lock", async lock => {
                    const res = await Helper.request("/jwt/update/contacts/status/", {created: contact.created, status})
                    if (res.status === 200) {
                      lock.alert.saved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      lock.alert.nok()
                    }
                    lock.remove()
                  })

                  registerKey(contact, o3, {status: status.input.value})
                }
              })
            }

            const website = Helper.render("button/left-right", {left: ".website", right: "Gib die Webseite deines Kontakts ein"}, buttons)
            website.onclick = () => {

              Helper.overlay("pop", o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const f1 = funnel.div("website", content)
                if (contact.website) {
                  f1.website.input.value = contact.website
                }
                Helper.verify("input/value", f1.website.input)
                f1.submit.onclick = async () => {

                  await Helper.verify("input/value", f1.website.input)
                  const website = f1.website.input.value
                  Helper.overlay("lock", async lock => {
                    const res = await Helper.request("/jwt/update/contacts/website/", {created: contact.created, website})
                    if (res.status === 200) {
                      lock.alert.saved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      lock.alert.nok()
                    }
                    lock.remove()
                  })
                }
              })
            }

            Helper.request("/verify/user/expert/").then(res => {
              if (res.status === 200) {
                Helper.render("text/hr", "Nur Experten", buttons)
                const promote = Helper.render("button/left-right", {left: ".promote", right: "Unterstütze deinen Kontakt"}, buttons)
                promote.onclick = () => {

                  return window.alert("Bald verfügbar.")

                  // hol dir ein datenbild vom req.jwt.user
                  // versuche das datenbild zu promoten
                  // eine function die eine map bekommt
                  // und darauf hin eine promotion strategie ausspuckt
                  // vielleicht doch eigene ki trainieren ??
                  // oder er spuckt dir prompts für kis aus ??
                  // funnels senden statt funnels für ihn ausfüllen
                  // req.jwt.user to promotion ready content in html
                  // promote contact function


                  Helper.overlay("pop", async overlay => {
                    if (contact.alias) {
                      Helper.render("text/h1", `Promote ${contact.email}`, overlay)
                    } else {
                      Helper.render("text/h1", `Promote ${contact.email}`, overlay)
                    }
                    const funnel = Helper.create("div/scrollable", overlay)
                    const searchField = Helper.create("field/text", funnel)
                    searchField.label.textContent = "Suche nach Text im Pfad"
                    searchField.input.placeholder = "/experte/plattform/pfad"
                    searchField.style.margin = "0 34px"
                    Helper.verify("input/value", searchField.input)
                    Helper.add("hover-outline", searchField.input)
                    // nur für experts
                    const pathField = await Helper.create("field/open-expert-values-path-select", funnel)
                    const originalOptions = Array.from(pathField.input.options).map(option => option.cloneNode(true))
                    searchField.input.oninput = (ev) => {
                      const searchTerm = ev.target.value.toLowerCase()
                      const options = originalOptions.map(it => it.value)
                      const filtered = options.filter(it => it.toLowerCase().includes(searchTerm))
                      pathField.input.add(filtered)
                    }
                    pathField.input.style.height = "55vh"
                    pathField.input.setAttribute("multiple", "true")
                    for (let i = 0; i < pathField.input.options.length; i++) {
                      const option = pathField.input.options[i]
                      option.selected = false
                    }
                    pathField.input.oninput = async () => {
                      const fieldFunnel = await Helper.convert("path/field-funnel", pathField.input.value)
                      if (fieldFunnel.id) {
                        Helper.overlay("pop", async overlay => {
                          overlay.info.textContent = contact.email + "." + fieldFunnel.id
                          const create = Helper.create("button/left-right", overlay)
                          create.left.textContent = ".create"
                          create.right.textContent = Helper.convert("text/capital-first-letter", fieldFunnel.id) + " definieren"
                          create.onclick = () => {
                            Helper.overlay("pop", async overlay => {
                              Helper.create("header/info", overlay).textContent = contact.email + "." + fieldFunnel.id + ".create"
                              overlay.append(fieldFunnel)
                              Helper.verifyIs("field-funnel/valid", fieldFunnel)
                              Helper.add("outline-hover/field-funnel", fieldFunnel)
                              const submitButton = fieldFunnel.querySelector(".submit-field-funnel-button")
                              if (submitButton) {
                                submitButton.textContent = `${Helper.convert("text/capital-first-letter", fieldFunnel.id)} jetzt speichern`
                                submitButton.onclick = async () => {
                                  const path = pathField.input.value
                                  await Helper.verify("field-funnel", fieldFunnel)
                                  const map = await Helper.convert("field-funnel/map", fieldFunnel)
                                  Helper.overlay("lock", async securityOverlay => {
                                    const register = {}
                                    register.email = contact.email
                                    register.map = map
                                    register.path = path
                                    register.id = fieldFunnel.id
                                    const res = await Helper.request("/register/location/email-expert", register)
                                    if (res.status === 200) {
                                      window.alert("Daten erfolgreich gespeichert.")
                                      await Helper.render("location-list/node/email-expert", {tag: fieldFunnel.id, email: contact.email, path: pathField.input.value}, locationList)
                                      securityOverlay.remove()
                                    } else {
                                      window.alert("Fehler.. Bitte wiederholen.")
                                      securityOverlay.remove()
                                    }
                                  })
                                }
                              } else {
                                window.alert("Field Funnel besitzt keinen Button mit der Klasse 'submit-field-funnel-button'")
                              }
                            })
                          }
                          if (contact.alias) {
                            Helper.render("text/hr", Helper.convert("text/capital-first-letter", fieldFunnel.id) + " von " + contact.alias, overlay)
                          } else {
                            Helper.render("text/hr", Helper.convert("text/capital-first-letter", fieldFunnel.id) + " von " + contact.email, overlay)
                          }
                          const locationList = Helper.create("div/loading", overlay)
                          await Helper.render("location-list/node/email-expert", {tag: fieldFunnel.id, email: contact.email, path: pathField.input.value}, locationList)
                        })
                      }
                    }
                  })
                }
              }
            })

          })
        }
      }
      parent?.appendChild(fragment)
    }
    async function getAndRenderContactsClosed(){

      contactsDiv.textContent = ""
      const loading = Helper.create("div/loading", contactsDiv)
      const res = await Helper.request("/jwt/get/user/contacts/")
      loading.remove()
      let filtered
      if (res.status === 200) {
        const contacts = JSON.parse(res.response)
        exportButton.onclick = () => {
          let dataToExport
          if (filtered) {
            dataToExport = filtered.map(it => {
              const {id, created, ...rest} = it
              return rest
            })
          } else {
            dataToExport = contacts.map(it => {
              const {id, created, ...rest} = it
              return rest
            })
          }
          Helper.convert("text/clipboard", JSON.stringify(dataToExport))
          .then(() => window.alert("JavaScript Kontaktliste wurde erfolgreich in die Zwischenablage gespeichert."))
        }
        retellButton.onclick = async () => {
          let dataToRetell 
          if (filtered) {
            dataToRetell = filtered
          } else {
            dataToRetell = contacts
          }
          async function verifyRetellApi() {
            const res = await Helper.request("/jwt/verify/retell/api-key/")
            if (res.status !== 200) {
              const apiKey = window.prompt("Für diese Anwendung wird ein API KEY benötigt. Mehr Informationen auf https://retellai.com\n\nRetell API KEY:")
              if (!Helper.verifyIs("text/empty", apiKey)) {
                const res = await Helper.request("/jwt/register/retell/api-key/", {apiKey})
                if (res.status === 200) {
                  window.alert("Daten erfolgreich gespeichert.")
                } else {
                  window.alert("Fehler.. Bitte wiederholen.")
                }
              }
              return
            }
          }
          await verifyRetellApi()
          const res = await Helper.request("/jwt/get/retell/api-key/")
          if (res.status === 200) {
            const retellApiKey = res.response
            Helper.overlay("pop", o1 => {
              const content = o1.content
              const title = Helper.render("text/h1", "Retell AI API", content)
              const subTitle = document.createElement("a")
              subTitle.href = "https://www.retellai.com"
              subTitle.textContent = "Mehr Informationen zu Retell AI findest du hier."
              subTitle.className = "link-theme monospace mlr34 mtb21"
              subTitle.target = "_blank"
              content.appendChild(subTitle)
              const number = Helper.create("input/tel", content)
              number.input.placeholder = "Anrufende Telefon Nummer (text/tel)"
              number.input.setAttribute("required", "true")
              number.input.setAttribute("accept", "text/tel")
              Helper.verify("input/value", number.input)
              number.input.oninput = () => Helper.verify("input/value", number.input)
              Helper.render("text/p", "Folgende Nummern werden angerufen:", content)
              const phonesDiv = Helper.div("mtb21 mlr34 color-theme", content)
              const contactsWithPhone = dataToRetell.filter(it => it && it.phone)
              contactsWithPhone.forEach(contact => {
                const phoneDiv = Helper.div("", phonesDiv)
                phoneDiv.textContent = contact.phone
              })
              Helper.render("text/p", "Folgende Felder können in Retell als Post-Call-Analysis genutzt werden:", content)
              const retellFields = Helper.div("monospace", content)
              Helper.render("key-value", {key: "scheduled - ", value: "boolean - ob ein Termin vereinbart wurde"}, retellFields)
              Helper.render("key-value", {key: "summary - ", value: "text - eine kurze Termin Zusammenfassung"}, retellFields)
              Helper.render("key-value", {key: "start - ", value: "Datumsformat: yyyymmddThhmmssZ"}, retellFields)
              Helper.render("key-value", {key: "end - ", value: "Datumsformat: yyyymmddThhmmssZ"}, retellFields)
              Helper.render("key-value", {key: "location - ", value: "text - Treffpunkt des Termins"}, retellFields)
              Helper.render("key-value", {key: "description - ", value: "text - Beschreibung des Termins"}, retellFields)
              Helper.render("text/p", "An welche E-Mail Adresse sollen die Terminbestätigungen geschickt werden?", content)
              const email = Helper.create("input/email", content)
              email.input.value = window.localStorage.getItem("email")
              Helper.verify("input/value", email.input)
              const submit = Helper.create("button/action", content)
              submit.textContent = "Nummern jetzt anrufen"
              submit.onclick = async () => {
                await Helper.verify("input/value", number.input)
                await Helper.verify("input/value", email.input)
                const emailReceiver = email.input.value
                const fromNumber = number.input.value
                const promises = {}
                const resultDiv = Helper.div("", content)
                contactsWithPhone.forEach(contact => {
                  const promise = Helper.request("/jwt/retell/call/contact/", {contact, fromNumber, emailReceiver})
                  promises[contact.phone] = promise
                  const responseButton = Helper.render("button/left-right", {left: `${contact.alias} wird angerufen`, right: ""}, resultDiv)
                  threePointsAnimation(responseButton.right)
                  promise.then(res => {
                    if (res.status === 200) {
                      responseButton.right.textContent = "Anfruf erfolgreich beendet"
                      responseButton.onclick = () => {
                        console.log(res.response)
                      }
                    } else {
                      responseButton.right.textContent = "Anruf fehlgeschlagen"
                    }
                  }).catch(err => {
                    responseButton.right.textContent = err.message
                  })
                })
                async function threePointsAnimation(node) {
                  const div = Helper.div("fs21", node);
                  while (true) {
                    for (let i = 0; i < 3; i++) {
                      div.textContent += "."
                      await Helper.sleep(1000)
                    }
                    div.textContent = ""
                  }
                }
              }
              const log = Helper.div("monospace color-theme fs13", content)
            })
          } else {
            window.alert("Fehler.. Bitte wiederholen.")
          }
        }
        searchField.input.oninput = async ev => {
          const query = ev.target.value
          if (!Helper.verifyIs("text/empty", query)) {
            const prepared = concatEmailAndNotes(contacts, "query")
            const highlighted = Helper.sort("query", {array: prepared, query, filter: "query"})
            filtered = highlighted.map(it => {
              const {query, ...rest} = it
              return rest
            })
            await renderContactButtons(highlighted, contactsDiv)
          } else {
            await renderContactButtons(contacts, contactsDiv)
          }
        }
        await renderContactButtons(contacts, contactsDiv)
      } else {
        Helper.render("text/note", "Keine Kontakte gefunden", contactsDiv)
      }
    }
    getAndRenderContactsClosed()
    o1.appendAddButton()
    o1.addButton.onclick = () => {

      Helper.overlay("pop", o2 => {
        const content = o2.content
        Helper.render("text/h1", "Neuer Kontakt", content)
        const funnel = Helper.funnel("email", content)
        funnel.submit.onclick = async () => {

          await Helper.verify("input/value", funnel.email.input)
          const email = funnel.email.input.value
          Helper.overlay("lock", async o3 => {
            const res = await Helper.request("/jwt/register/email/contacts/", {email})
            if (res.status === 200) {
              o3.alert.saved()
              await getAndRenderContactsClosed()
              o2.remove()
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

(() => {

  document.querySelectorAll(".contacts").forEach(node => {
    Helper.add("hover-outline", node)
    node.onclick = it.openOverlay
  })
})();

function createBirthdayFunnel() {

  const funnel = {}
  funnel.date = Helper.create("input/date")
  funnel.date.input.id = "date"
  funnel.date.input.setAttribute("required", "true")
  Helper.verify("input/value", funnel.date.input)
  funnel.label = Helper.create("label", {for: "date", text: "Geburtsdatum"})
  funnel.label.className += " mtb13 mlr34"
  funnel.submit = Helper.create("button/action")
  funnel.submit.classList.add("submit")
  funnel.submit.textContent = "Geburtsdatum jetzt speichern"
  funnel.createForm = () => {

    const form = document.createElement("form")
    form.id = "birthday"
    form.appendChild(funnel.label)
    form.appendChild(funnel.date)
    form.appendChild(funnel.submit)
    return form
  }
  return funnel
}
export const contacts = it
