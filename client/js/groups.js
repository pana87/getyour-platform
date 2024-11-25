import {Helper} from "/js/Helper.js"

export const groups = {}
groups.openOverlay = () => {

  Helper.overlay("pop", async o1 => {
    o1.onlyClosedUser()
    o1.addInfo(`.${event}`)
    const content = o1.content
    async function renderInfo(prefix, path, postfix, parent) {

      const fragment = document.createDocumentFragment()
      const info = Helper.createNode("div", fragment)
      info.style.margin = "21px 34px"
      const span1 = Helper.createNode("span", info, prefix)
      const span2 = Helper.createNode("span", info)
      Helper.style(span2, {width: "34px", margin: "0 5px"})
      const icon = await Helper.convert("path/icon", path)
      Helper.style(icon, {display: "inline-block", width: "34px"})
      span2.appendChild(icon)
      Helper.createNode("span", info, postfix)
      parent?.appendChild(fragment)
      return fragment
    }
    const addGroup = Helper.create("button/add", content)
    addGroup.onclick = () => {

      Helper.overlay("pop", async o2 => {
        const content = o2.content
        const emailSelect = Helper.create("input/contacts", content)
        const submit = Helper.create("button/action", content)
        submit.textContent = "Gruppe jetzt speichern"
        submit.onclick = () => {

          const emails = emailSelect.selectedEmails()
          if (Helper.verifyIs("array/empty", emails)) {
            window.alert("Wähle mindestens eine E-Mail Adresse.")
            Helper.add("style/not-valid", emailSelect.field.input)
            return
          }
          Helper.overlay("lock", async o3 => {
            const res = await Helper.request("/register/groups/self/", {emails})
            if (res.status === 200) {
              window.alert("Deine Gruppe wurde erfolgreich gespeichert.")
              await getAndRenderGroups(groupsContainer)
              o2.remove()
            }
            o3.remove()
          })
        }
      })
    }
    const searchField = Helper.create("input/text", content)
    searchField.input.placeholder = "Filter nach E-Mail Adresse oder Alias"
    const groupsContainer = Helper.create("div/loading", content)
    await getAndRenderGroups(groupsContainer)
    function renderGroupEmails(group, parent) {
      const fragment = document.createDocumentFragment()
      for (let i = 0; i < group.emails.length; i++) {
        const email = group.emails[i]
        const div = Helper.create("div", fragment)
        div.textContent = email
        fragment.appendChild(div)
      }
      parent?.appendChild(fragment)
      return fragment
    }
    function filterGroupsByEmail(array, parent) {
      searchField.input.oninput = (ev) => {
        const filtered = array.filter(it => {
          const lowercase = ev.target.value.toLowerCase()
          if (it.emails && it.emails.length > 0) {
            return it.emails.some(email => email.includes(lowercase)) || (it.alias && it.alias.toLowerCase().includes(lowercase))
          } else {
            if (it.alias && it.alias.toLowerCase().includes(lowercase)) {
              return true
            }
            return false
          }
        })
        renderGroupButtons(filtered, parent, ev.target.value)
      }
    }
    function markQueryInNode(node, query) {
      if (node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i]
          markQueryInNode(child, query)
        }
      } else {
        Helper.convert("node/marked", {node, query})
      }

    }
    function renderGroupButtons(groups, parent, query = "") {

      const fragment = document.createDocumentFragment()
      Helper.reset("node", parent)
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const groupButton = Helper.create("button/left-right", fragment)
        if (Helper.verifyIs("text/empty", query)) {
          if (!Helper.verifyIs("text/empty", group.alias)) {
            Helper.createNode("span", groupButton.left, `${group.alias}`)
          } else {
            renderGroupEmails(group, groupButton.left)
          }
        } else {
          if (!Helper.verifyIs("text/empty", group.alias)) {
            Helper.createNode("span", groupButton.left, `${group.alias}:`)
            renderGroupEmails(group, groupButton.left)
          } else {
            renderGroupEmails(group, groupButton.left)
          }
        }
        markQueryInNode(groupButton.left, query)
        groupButton.onclick = () => {

          Helper.overlay("pop", async o2 => {
            o2.addInfo(group.emails.join(", "))
            const buttons = o2.content
            o2.load()

            const res = await Helper.request("/verify/group/creator/", {created: group.created})
            o2.loading.remove()
            if (res.status === 200) {
              const aliasButton = Helper.render("button/left-right", {left: ".alias", right: "Gebe deiner Gruppe einen alternativen Namen"}, buttons)
              aliasButton.onclick = () => {

                Helper.overlay("pop", o3 => {
                  o3.addInfo(group.emails.join(", "))
                  const content = o3.content
                  const funnel = Helper.funnel("alias", content)
                  funnel.alias.input.removeAttribute("required")
                  if (group.alias !== undefined) {
                    funnel.alias.input.value = group.alias
                  }
                  funnel.submit.onclick = async () => {

                    await Helper.verify("input/value", funnel.alias.input)
                    const alias = funnel.alias.input.value
                    const created = group.created
                    Helper.overlay("lock", async o4 => {
                      const res = await Helper.request("/update/groups/alias/", {created, alias})
                      if (res.status === 200) {
                        window.alert("Alias erfolgreich gespeichert.")
                        await getAndRenderGroups(groupsContainer)
                        o3.remove()
                        o2.remove()
                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")
                      }
                      o4.remove()
                    })
                  }
                })
              }
              const emailsButton = Helper.render("button/left-right", {left: ".emails", right: "Aktualisiere die Mitglieder deiner Gruppe"}, buttons)
              emailsButton.onclick = () => {

                Helper.overlay("pop", async o3 => {
                  const content = o3.content
                  const emailSelect = Helper.create("select/emails", content)
                  Helper.request("/jwt/get/user/contacts/").then(res => {
                    if (res.status === 200) {
                      const contacts = JSON.parse(res.response)
                      emailSelect.input.add(contacts)
                      emailSelect.input.select(group.emails)
                    }
                  })
                  const submit = Helper.create("button/action", content)
                  submit.textContent = "Gruppe jetzt speichern"
                  submit.onclick = () => {

                    const emails = emailSelect.selectedEmails()
                    if (Helper.verifyIs("array/empty", emails)) {
                      window.alert("Wähle mindestens eine E-Mail Adresse.")
                      Helper.add("style/not-valid", emailSelect.field.input)
                      return
                    }
                    Helper.overlay("lock", async o4 => {
                      const res = await Helper.request("/register/groups/emails-self/", {created: group.created, emails})
                      if (res.status === 200) {
                        o4.alert.saved()
                        await getAndRenderGroups(groupsContainer)
                        o3.remove()
                        o2.remove()
                      } else {
                        o4.alert.nok()
                      }
                      o4.remove()
                    })
                  }
                })
              }
            }

            const locationSharing = Helper.render("button/left-right", {left: ".location-sharing", right: "Teile deinen Standort mit deiner Gruppe"}, buttons)
            locationSharing.onclick = async () => {

              function getCoords() {

                return new Promise((resolve, reject) => {
                  function success(pos) {
                    resolve(pos.coords)
                  }
                  function error(err) {
                    reject(err)
                  }
                  navigator.geolocation.getCurrentPosition(success, error, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                  })
                })
              }
              const res = await Helper.request("/jwt/get/tree/", {tree: "email"})
              let userEmail
              if (res.status === 200) {
                userEmail = res.response
              }
              if (!userEmail) return window.alert("Fehler.. Bitte wiederholen.")
              Helper.overlay("pop", async o3 => {
                const content = o3.content
                await renderEmailStatus(userEmail, group.emails, content)
                o3.loading.remove()
                let coords
                try {
                  coords = await getCoords()
                } catch (error) {
                  window.alert("Fehler.. Bitte wiederholen.")
                  console.error(error)
                  o3.remove()
                  return
                }
                if (!coords) return
                for (let i = 0; i < group.emails.length; i++) {
                  const email = group.emails[i]
                  if (userEmail === email) continue
                  document.querySelectorAll(".email-status").forEach(emailStatus => {
                    if (emailStatus.textContent.includes(email)) {
                      const sign = emailStatus.querySelector(".sign")
                      Helper.request("/send/email/lat-lon/", {to: email, lat: coords.latitude, lon: coords.longitude})
                      .then((res) => {
                        if (res.status === 200) {
                          sign.style.color = Helper.colors.dark.success
                          sign.textContent = "Erfolgreich gesendet.."
                        } else {
                          sign.style.color = Helper.colors.dark.error
                          sign.textContent = "Fehler beim Senden.."
                        }
                      })
                      .catch((error) => {
                        sign.style.color = Helper.colors.dark.error
                        sign.textContent = "Fehler beim Senden.."
                      })
                    }
                  })
                }
              })
            }

            if (res.status === 200) {
              const removeButton = Helper.render("button/left-right", {left: ".remove", right: "Gruppe entfernen"}, buttons)
              removeButton.onclick = () => {

                const confirm = window.confirm("Möchtest du deine Gruppe wirklich entfernen?")
                if (confirm === true) {
                  Helper.overlay("lock", async o3 => {
                    const res = await Helper.request("/remove/groups/created/", {created: group.created})
                    if (res.status === 200) {
                      o3.alert.removed()
                      groupButton.remove()
                      o2.remove()
                    } else {
                      o3.alert.nok()
                    }
                    o3.remove()
                  })
                }
              }
            }

            const sendTemplate = Helper.render("button/left-right", {left: ".send-template", right: "Sende ein HTML Template an deine Gruppe"}, buttons)
            sendTemplate.onclick = () => {

              async function renderTemplates(templates, node) {
                Helper.convert("parent/scrollable", node)
                for (let i = 0; i < templates.length; i++) {
                  const template = templates[i]
                  const purifiedHtml = await Helper.convert("text/purified", template.html)
                  const templateButton = Helper.create("button/left-right", node)
                  templateButton.left.innerHTML = purifiedHtml
                  templateButton.right.style.fontSize = "21px"
                  templateButton.onclick = () => {

                    const html = Helper.convert("text/prompt", purifiedHtml)
                    Helper.overlay("pop", async o3 => {
                      o3.addInfo(group.emails.join(", "))
                      const content = o3.content
                      const subject = Helper.create("input/text", content)
                      subject.input.placeholder = "Betreff"
                      subject.input.setAttribute("required", "true")
                      Helper.verify("input/value", subject.input)
                      const emailSelect = Helper.create("select/emails", content)
                      await emailSelect.input.add(group.emails)
                      emailSelect.input.select(group.emails)
                      const buttons = Helper.create("div/flex-row", content)
                      const testButton = Helper.create("button/action", buttons)
                      testButton.textContent = "Test senden"
                      Helper.classes(testButton, {remove: "color-light bg-sunflower", add: "bg-green color-dark"})
                      testButton.onclick = async () => {

                        await Helper.verify("input/value", subject.input)
                        Helper.overlay("lock", async o4 => {
                          const res = await Helper.request("/send/email/test-html/", {html, subject: subject.input.value})
                          if (res.status === 200) {
                            window.alert("Template erfolgreich gesendet.")
                          }
                          o4.remove()
                        })
                      }
                      const sendTemplateButton = Helper.create("button/action", buttons)
                      sendTemplateButton.textContent = "Auswahl senden"
                      sendTemplateButton.onclick = async () => {

                        const res = await Helper.request("/jwt/get/tree/", {tree: "email"})
                        let userEmail
                        if (res.status === 200) {
                          userEmail = res.response
                        }
                        if (!userEmail) return window.alert("Fehler.. Bitte wiederholen.")
                        await Helper.verify("input/value", subject.input)
                        const selectedEmails = emailSelect.selectedEmails()
                        if (selectedEmails.length <= 0) {
                          Helper.add("style/not-valid", emailSelect.input)
                          return
                        }
                        Helper.overlay("pop", async o4 => {
                          const content = o4.content
                          await renderEmailStatus(userEmail, selectedEmails, content)
                          o4.loading.remove()
                          for (let i = 0; i < selectedEmails.length; i++) {
                            const email = selectedEmails[i]
                            if (userEmail === email) continue
                            document.querySelectorAll(".email-status").forEach(emailStatus => {
                              if (emailStatus.textContent.includes(email)) {
                                const sign = emailStatus.querySelector(".sign")
                                Helper.request("/send/email/send-html/", {email, html, subject: subject.input.value})
                                .then((res) => {
                                  if (res.status === 200) {
                                    sign.style.color = Helper.colors.dark.success
                                    sign.textContent = "Erfolgreich gesendet.."
                                  } else {
                                    sign.style.color = Helper.colors.dark.error
                                    sign.textContent = "Fehler beim Senden.."
                                  }
                                })
                                .catch((error) => {
                                  sign.style.color = Helper.colors.dark.error
                                  sign.textContent = "Fehler beim Senden.."
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                }
              }
              Helper.overlay("pop", async o3 => {
                o3.addInfo(group.emails.join(", "))
                const content = o3.content
                const searchField = Helper.create("input/text", content)
                searchField.input.placeholder = "Suche nach Text in deinem Template"
                searchField.style.margin = "21px 34px"
                Helper.verify("input/value", searchField.input)
                Helper.add("hover-outline", searchField.input)
                const contactsDiv = Helper.create("div/scrollable", content)
                const res = await Helper.request("/jwt/get/templates/")
                if (res.status === 200) {
                  const templates = JSON.parse(res.response)
                  let filtered
                  searchField.input.oninput = async (ev) => {
                    filtered = templates.filter(it => it.html.toLowerCase().includes(ev.target.value.toLowerCase()))
                    const highlighted = filtered.map(it => {
                      const highlightedHtml = it.html.replace(new RegExp(ev.target.value, 'i'), `<mark>${ev.target.value}</mark>`)
                      return { ...it, html: highlightedHtml }
                    })
                    await renderTemplates(highlighted, contactsDiv)
                  }
                  await renderTemplates(templates, contactsDiv)
                } else {
                  Helper.convert("parent/info", contactsDiv)
                  contactsDiv.textContent = "Keine Templates gefunden"
                }
              })
            }

            function renderEmailStatus(except, emails, node) {

              return new Promise((resolve, reject) => {
                try {
                  let iterations = 0
                  for (let i = 0; i < emails.length; i++) {
                    const email = emails[i]
                    if (except && except === email) continue
                    const container = Helper.create("div", node)
                    container.className = "email-status"
                    Helper.style(container, {wordBreak: "break-word", display: "flex", flexWrap: "wrap", margin: "21px 34px", fontSize: "21px", fontFamily: "sans-serif", alignItems: "center"})
                    container.style.color = Helper.colors.light.text
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      container.style.color = Helper.colors.dark.text
                    }
                    const emailDiv = Helper.create("div", container)
                    emailDiv.textContent = `${email}: `
                    const signDiv = Helper.create("div", container)
                    signDiv.className = "sign"
                    signDiv.style.marginLeft = "34px"
                    Helper.render("icon/node/path", "/public/loading.svg", signDiv)
                    iterations++
                  }
                  if (iterations === emails.length - 1) {
                    return resolve()
                  } else {
                    throw new Error("iterations mismatch")
                  }
                } catch (error) {
                  console.error(error)
                  reject(error)
                }
              })
            }

          })

        }

      }
      parent?.appendChild(fragment)
      return fragment
    }
    async function getAndRenderGroups(parent) {

      const res = await Helper.request("/get/groups/self/")
      if (res.status === 200) {
        const groups = JSON.parse(res.response)
        renderGroupButtons(groups, parent)
        filterGroupsByEmail(groups, parent)
      } else {
        Helper.convert("parent/info", parent)
        renderInfo("Deine E-Mail Adresse wurde in keiner Gruppe gefunden. Erstelle eine neue Gruppe in dem du auf", "/public/add.svg", "klickst.", parent)
      }
    }
  })
}
