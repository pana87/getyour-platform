import {add, addSubmitButton, darkLightButton} from "/js/button.js"
import {addLoading} from "/js/events.js"
import {filterBy} from "/js/filter.js"
import {dateToLifePath, renderDateContent, renderNameContent} from "/js/numerology.js"
import {leftRight} from "/js/button.js"
import {alertNok, alertSaved} from "/js/alert.js"
import {div, labelFor} from "/js/html-tags.js"
import {flexRow} from "/js/create.js"
import {pop, lock} from "/js/overlay.js"
import {aliasFunnel, emailFunnel, statusFunnel, notesFunnel, websiteFunnel} from "/js/funnel.js"
import {post} from "/js/request.js"
import {tel, date, text, textarea} from "/js/input.js"
import {textToClipboard, textToNote, textToPurified, textToH1, textToLink, textToHr, textToAction} from "/js/convert.js"
import {textIsEmpty, addNotValidSign, verifyInputValue, onlyClosedUser, addValidSign, verifyInputs, arrayIsEmpty, verifyFunnel} from "/js/verify.js"

const it = {}
export const openContacts = () => {
  pop(async o1 => {
    onlyClosedUser()
    o1.addInfo(".contacts")
    const content = o1.content
    const searchField = text(content)
    searchField.input.placeholder = "Filter nach E-Mail oder Notizen"
    addValidSign(searchField.input)
    const container = flexRow(content)
    const exportButton = textToLink("Exportieren", container)
    const importButton = textToLink("Importieren", container)
    const retellButton = textToLink("Retell AI", container)
    importButton.onclick = () => {
      pop(o2 => {
        const funnel = o2.content
        const field = textarea(funnel)
        field.input.className += " monospace vh55 fs13"
        field.input.setAttribute("required", "true")
        field.input.placeholder = `[{\n  email: "string", // id\n  alias: "string",  // optional\n  birthday: "1999-03-21", // optional\n  status: "string", // optional\n  notes: "string", // optional\n  phone: "+123456789", // optional\n  website: "string" // optional\n}]`
        verifyInputs(funnel)
        const submit = textToAction("Kontakte jetzt importieren", funnel)
        submit.onclick = async () => {
          await verifyFunnel(funnel)
          try {
            const contacts = JSON.parse(field.input.value)
            if (arrayIsEmpty(contacts)) throw new Error("contacts is empty")
            for (let i = 0; i < contacts.length; i++) {
              const contact = contacts[i]
              if (!contact.email) {
                throw new Error("'contact.email' is missing")
              }
            }
            lock(async o3 => {
              const res = await post("/jwt/register/contact/import/", {contacts})
              if (res.status === 200) {
                alertSaved()
                await getAndRenderContactsClosed()
                o2.remove()
              } else {
                alertNok()
              }
              o3.remove()
            })
          } catch (error) {
            console.error(error)
            window.alert("Deine Kontaktliste ist in einem ungültigen Format.")
            addNotValidSign(field.input)
          }
        }
      })
    }
    textToHr("Meine Kontakte", content)
    const contactsDiv = div("", content)
    function concatEmailAndNotes(array, key) {
      return array.map(it => {
        if (it.email && it.notes) {
          return { ...it, [key]: `${it.email}<br>${it.notes}` }
        } else {
          return { ...it, [key]: it.email }
        }
      })
    }
    async function renderContactButtons(contacts) {
      const fragment = document.createDocumentFragment()
      contactsDiv.textContent = ""
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i]
        const contactButton = darkLightButton(fragment)
        if (contact.birthday){
          const birthdate = new Date(contact.birthday)
          const lifepath = dateToLifePath(birthdate)
          const lifepathDiv = div("flex align center circle bg-green w55 h55 m21 fs21")
          lifepathDiv.textContent = lifepath
          contactButton.prepend(lifepathDiv)
        }
        const textDiv = div("flex column flex1 mtb21 mlr34", contactButton)
        if (contact.alias) {
          const alias = div("fs21")
          alias.textContent = contact.alias
          textDiv.appendChild(alias)
        }
        const query = div("fs13 mtb8")
        textDiv.appendChild(query)
        if (contact.query) {
          let text = await textToPurified(contact.query)
          query.innerHTML = text
        } else {
          query.textContent = contact.email
        }
        const buttons = div("flex column", contactButton)
        if (contact.email) {
          const clone = textToLink("E-Mail schreiben", buttons)
          clone.classList.add("m8")
          clone.onclick = ev => {
            ev.stopPropagation()
            window.location.href = `mailto:${contact.email}`
            openNotes(contact)
          }
        }
        if (contact.phone) {
          const clone = textToLink("Telefon anrufen", buttons)
          clone.classList.add("m8")
          clone.onclick = ev => {

            ev.stopPropagation()
            window.location.href = `tel:${contact.phone}`
            openNotes(contact)
          }
        }
        if (contact.website) {
          const clone = textToLink("Webseite öffnen", buttons)
          clone.classList.add("m8")
          clone.onclick = ev => {

            ev.stopPropagation()
            window.open(contact.website, "_blank")
            openNotes(contact)
          }
        }
        function openNotes(contact, o){
          pop(o1 => {
            o1.addInfo(contact.email)
            const content = o1.content
            const f1 = notesFunnel(content)
            if (contact.notes) {
              f1.notes.input.value = contact.notes
            }
            f1.submit.onclick = async () => {

              await verifyInputValue(f1.notes.input)
              const notes = f1.notes.input.value
              lock(async o2 => {
                const res = await post("/jwt/register/contact/notes/", {created: contact.created, notes})
                if (res.status === 200) {
                  alertSaved()
                  await getAndRenderContactsClosed()
                  o1.remove()
                  if (o) o.remove()
                } else {
                  alertNok()
                }
                o2.remove()
              })
            }
          })
        }
        contactButton.onclick = () => {
          pop(async o2 => {
            o2.addInfo(contact.email)
            const buttons = o2.content
            const alias = leftRight({left: ".alias", right: "Gib deinem Kontakt einen alternativen Namen"}, buttons)
            alias.onclick = () => {
              pop(o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const funnel = aliasFunnel(content)
                if (contact.alias) {
                  funnel.alias.input.value = contact.alias
                }
                funnel.submit.onclick = async () => {
                  const alias = funnel.alias.input.value
                  lock(async lock => {
                    const res = await post("/jwt/register/contact/alias/", {created: contact.created, alias})
                    if (res.status === 200) {
                      alertSaved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    lock.remove()
                  })
                }
              })
            }
            const character = leftRight({left: ".character", right: "Erfahre mehr über deinen Kontakt"}, buttons)
            character.onclick = () => {
              pop(o3 => {
                onlyClosedUser()
                o3.addInfo(contact.email)
                const content = o3.content
                const funnel = createBirthdayFunnel()
                funnel.submit.onclick = async () => {
                  await verifyInputValue(funnel.date.input)
                  const birthday = new Date(funnel.date.input.value).toISOString()
                  lock(async lock => {
                    const res = await post("/jwt/register/contact/birthday/", {created: contact.created, birthday})
                    if (res.status === 200) {
                      alertSaved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    lock.remove()
                  })
                }
                const form = funnel.createForm()
                content.appendChild(form)
                if (contact.birthday) {
                  const split = contact.birthday.split("T")
                  funnel.date.input.value = split[0]
                  verifyInputValue(funnel.date.input)
                  const birthday = split[0]
                  const date = new Date(birthday)
                  renderDateContent(date, content)
                  if (contact.alias) renderNameContent(contact.alias, content)
                }
              })
            }
            const email = leftRight({left: ".email", right: "Aktualisiere die E-Mail Adresse deines Kontakts"}, buttons)
            email.onclick = () => {
              pop(o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const funnel = emailFunnel(content)
                if (contact.email) {
                  funnel.email.input.value = contact.email
                }
                verifyInputs(funnel.email.input)
                funnel.submit.onclick = async () => {
                  await verifyInputValue(funnel.email.input)
                  const email = funnel.email.input.value
                  lock(async lock => {
                    const res = await post("/jwt/register/contact/email/", {created: contact.created, email})
                    if (res.status === 200) {
                      alertSaved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    lock.remove()
                  })
                }
              })
            }
            const notes = leftRight({left: ".notes", right: "Mache dir Notizen zu deinem Kontakt"}, buttons)
            notes.onclick = () => {
              openNotes(contact, o2)
            }
            const phone = leftRight({left: ".phone", right: "Gib die Telefon Nummer deines Kontakts ein"}, buttons)
            phone.onclick = () => {
              pop(o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const number = tel(content)
                number.input.setAttribute("accept", "text/tel")
                number.input.placeholder = "Telefon Nummer (text/tel)"
                if (contact.phone) {
                  number.input.value = contact.phone
                }
                verifyInputs(content)
                const submit = textToAction("Daten jetzt speichern", content)
                submit.onclick = async () => {
                  await verifyInputValue(number.input)
                  const phone = number.input.value
                  lock(async lock => {
                    const res = await post("/jwt/register/contact/phone/", {created: contact.created, phone})
                    if (res.status === 200) {
                      alertSaved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    lock.remove()
                  })
                }
              })
            }
            const remove = leftRight({left: ".remove", right: "Kontakt entfernen"}, buttons)
            remove.onclick = () => {
              const confirm = window.confirm("Möchtest du deinen Kontakt wirklich entfernen?")
              if (confirm === true) {
                lock(async o3 => {
                  const res = await post("/jwt/remove/contact/", {created: contact.created})
                  if (res.status === 200) {
                    o3.alert.removed()
                    await getAndRenderContactsClosed()
                    o2.remove()
                  } else {
                    alertNok()
                  }
                  o3.remove()
                })
              }
            }
            const status = leftRight({left: ".status", right: "Gib deinem Kontakt einen Status"}, buttons)
            status.onclick = () => {
              pop(o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const f1 = statusFunnel(content)
                if (contact.status) {
                  f1.status.input.value = contact.status
                }
                verifyInputValue(f1.status.input)
                f1.submit.onclick = async () => {
                  await verifyInputValue(f1.status.input)
                  const status = f1.status.input.value
                  lock(async lock => {
                    const res = await post("/jwt/register/contact/status/", {created: contact.created, status})
                    if (res.status === 200) {
                      alertSaved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    lock.remove()
                  })
                  registerKey(contact, o3, {status: status.input.value})
                }
              })
            }
            const website = leftRight({left: ".website", right: "Gib die Webseite deines Kontakts ein"}, buttons)
            website.onclick = () => {
              pop(o3 => {
                o3.addInfo(contact.email)
                const content = o3.content
                const f1 = websiteFunnel(content)
                if (contact.website) {
                  f1.website.input.value = contact.website
                }
                verifyInputValue(f1.website.input)
                f1.submit.onclick = async () => {

                  await verifyInputValue(f1.website.input)
                  const website = f1.website.input.value
                  lock(async lock => {
                    const res = await post("/jwt/register/contact/website/", {created: contact.created, website})
                    if (res.status === 200) {
                      alertSaved()
                      await getAndRenderContactsClosed()
                      o3.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    lock.remove()
                  })
                }
              })
            }
            post("/verify/user/expert/").then(res => {
              if (res.status === 200) {
                textToHr("Nur Experten", buttons)
                const promote = leftRight({left: ".promote", right: "Unterstütze deinen Kontakt"}, buttons)
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


                  pop(async overlay => {
                    if (contact.alias) {
                      textToH1(`Promote ${contact.email}`, overlay)
                    } else {
                      textToH1(`Promote ${contact.email}`, overlay)
                    }
                    const funnel = div("", overlay)
                    const searchField = text(funnel)
                    searchField.label.textContent = "Suche nach Text im Pfad"
                    searchField.input.placeholder = "/experte/plattform/pfad"
                    searchField.style.margin = "0 34px"
                    verifyInputValue(searchField.input)
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
                        pop(async overlay => {
                          overlay.info.textContent = contact.email + "." + fieldFunnel.id
                          const create = Helper.create("button/left-right", overlay)
                          create.left.textContent = ".create"
                          create.right.textContent = Helper.convert("text/capital-first-letter", fieldFunnel.id) + " definieren"
                          create.onclick = () => {
                            pop(async overlay => {
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
                                  lock(async securityOverlay => {
                                    const register = {}
                                    register.email = contact.email
                                    register.map = map
                                    register.path = path
                                    register.id = fieldFunnel.id
                                    const res = await post("/register/location/email-expert", register)
                                    if (res.status === 200) {
                                      window.alert("Daten erfolgreich gespeichert.")
                                      await Helper.render("location-list/node/email-expert", {tag: fieldFunnel.id, email: contact.email, path: pathField.input.value}, locationList)
                                      securityOverlay.remove()
                                    } else {
                                      alertNok()
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
                            textToHr(Helper.convert("text/capital-first-letter", fieldFunnel.id) + " von " + contact.alias, overlay)
                          } else {
                            textToHr(Helper.convert("text/capital-first-letter", fieldFunnel.id) + " von " + contact.email, overlay)
                          }
                          const locationList = addLoading(overlay)
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
      contactsDiv.appendChild(fragment)
    }
    async function getAndRenderContactsClosed(){
      const loading = addLoading(contactsDiv)
      const res = await post("/jwt/get/contacts/")
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
          textToClipboard(JSON.stringify(dataToExport))
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
            const res = await post("/jwt/verify/retell/api-key/")
            if (res.status !== 200) {
              const apiKey = window.prompt("Für diese Anwendung wird ein API KEY benötigt. Mehr Informationen auf https://retellai.com\n\nRetell API KEY:")
              if (!textIsEmpty(apiKey)) {
                const res = await post("/jwt/register/retell/api-key/", {apiKey})
                if (res.status === 200) {
                  window.alert("Daten erfolgreich gespeichert.")
                } else {
                  alertNok()
                }
              }
              return
            }
          }
          await verifyRetellApi()
          const res = await post("/jwt/get/retell/api-key/")
          if (res.status === 200) {
            const retellApiKey = res.response
            pop(o1 => {
              const content = o1.content
              const title = textToH1("Retell AI API", content)
              const subTitle = document.createElement("a")
              subTitle.href = "https://www.retellai.com"
              subTitle.textContent = "Mehr Informationen zu Retell AI findest du hier."
              subTitle.className = "link-theme monospace mlr34 mtb21"
              subTitle.target = "_blank"
              content.appendChild(subTitle)
              const number = tel(content)
              number.input.placeholder = "Anrufende Telefon Nummer (text/tel)"
              number.input.setAttribute("required", "true")
              number.input.setAttribute("accept", "text/tel")
              verifyInputValue(number.input)
              number.input.oninput = () => verifyInputValue(number.input)
              textToP("Folgende Nummern werden angerufen:", content)
              const phonesDiv = div("mtb21 mlr34 color-theme", content)
              const contactsWithPhone = dataToRetell.filter(it => it && it.phone)
              contactsWithPhone.forEach(contact => {
                const phoneDiv = div("", phonesDiv)
                phoneDiv.textContent = contact.phone
              })
              textToP("Folgende Felder können in Retell als Post-Call-Analysis genutzt werden:", content)
              const retellFields = div("monospace", content)
              renderKeyValue({key: "scheduled - ", value: "boolean - ob ein Termin vereinbart wurde"}, retellFields)
              renderKeyValue({key: "summary - ", value: "text - eine kurze Termin Zusammenfassung"}, retellFields)
              renderKeyValue({key: "start - ", value: "Datumsformat: yyyymmddThhmmssZ"}, retellFields)
              renderKeyValue({key: "end - ", value: "Datumsformat: yyyymmddThhmmssZ"}, retellFields)
              renderKeyValue({key: "location - ", value: "text - Treffpunkt des Termins"}, retellFields)
              renderKeyValue({key: "description - ", value: "text - Beschreibung des Termins"}, retellFields)
              textToP("An welche E-Mail Adresse sollen die Terminbestätigungen geschickt werden?", content)
              const email = email(content)
              email.input.value = window.localStorage.getItem("email")
              verifyInputValue(email.input)
              const submit = textToAction("Nummern jetzt anrufen", content)
              submit.onclick = async () => {
                await verifyInputValue(number.input)
                await verifyInputValue(email.input)
                const emailReceiver = email.input.value
                const fromNumber = number.input.value
                const promises = {}
                const resultDiv = div("", content)
                contactsWithPhone.forEach(contact => {
                  const promise = post("/jwt/retell/call/contact/", {contact, fromNumber, emailReceiver})
                  promises[contact.phone] = promise
                  const responseButton = leftRight({left: `${contact.alias} wird angerufen`, right: ""}, resultDiv)
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
                  const div = div("fs21", node);
                  while (true) {
                    for (let i = 0; i < 3; i++) {
                      div.textContent += "."
                      await Helper.sleep(1000)
                    }
                    div.textContent = ""
                  }
                }
              }
              const log = div("monospace color-theme fs13", content)
            })
          } else {
            alertNok()
          }
        }
        searchField.input.oninput = async ev => {
          const query = ev.target.value
          if (!textIsEmpty(query)) {
            const prepared = concatEmailAndNotes(contacts, "query")
            const highlighted = filterBy("query", query, prepared)
            filtered = highlighted.map(it => {
              const {query, ...rest} = it
              return rest
            })
            await renderContactButtons(highlighted)
          } else {
            await renderContactButtons(contacts)
          }
        }
        await renderContactButtons(contacts)
      } else {
        textToNote("Keine Kontakte gefunden", contactsDiv)
      }
    }
    getAndRenderContactsClosed()
    const addButton = add("+", o1)
    addButton.onclick = () => {
      pop(o2 => {
        const content = o2.content
        textToH1("Neuer Kontakt", content)
        const funnel = emailFunnel(content)
        funnel.submit.onclick = async () => {

          await verifyInputValue(funnel.email.input)
          const email = funnel.email.input.value
          lock(async o3 => {
            const res = await post("/jwt/register/contact/", {email})
            if (res.status === 200) {
              alertSaved()
              await getAndRenderContactsClosed()
              o2.remove()
            } else {
              alertNok()
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
    node.classList.add("hover")
    node.onclick = it.openOverlay
  })
})();
function createBirthdayFunnel() {
  const funnel = div("")
  funnel.date = date()
  funnel.date.input.id = "date"
  funnel.date.input.setAttribute("required", "true")
  verifyInputValue(funnel.date.input)
  funnel.label = labelFor("date", "Geburtsdatum")
  funnel.date.input.oninput = () => verifyInputValue(funnel.date.input)
  funnel.date.prepend(funnel.label)
  addSubmitButton(funnel)
  funnel.createForm = () => {
    const form = document.createElement("form")
    form.id = "birthday"
    form.appendChild(funnel.date)
    form.appendChild(funnel.submit)
    return form
  }
  return funnel
}
export const contacts = it
