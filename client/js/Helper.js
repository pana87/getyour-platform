export class Helper {

  static add(event, input) {
    // add event to input
    // no dom creation, events only

    if (event === "background/node/hover") {

      input.addEventListener("mouseover", () => {
        input.style.backgroundColor = "#999"
      })

      input.addEventListener("mouseout", () => {
        input.style.backgroundColor = null
      })

    }

    if (event === "id/total-amount") {

      return new Promise(async(resolve, reject) => {
        try {

          const node = await this.verifyIs("id/loaded", input)

          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i]

            const input = child.querySelector("input.quantity")

            input.oninput = (ev) => {

              const price = child.querySelector("span.single-price")

              const target = child.querySelector("span.total-amount")

              const result = parseFloat(price.textContent) * parseInt(ev.target.value)

              target.textContent = result.toFixed(2).replace(".", ",")

            }

          }

        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "selected/node") {
      input.setAttribute("selected-node", "true")
      input.style.outline = "3px solid #777"
    }

    if (event === "selector/reputation-self") {
      const node = document.querySelector(input)

      if (node) {

        this.request("/verify/user/closed/").then((res) => {

          if (res.status === 200) {
            this.request("/get/user/reputation-self/").then((res) => {

              if (this.verifyIs("text/int", res.response)) {
                node.textContent = res.response
              }

            })
          }

        }).catch(() => node.textContent = 0)

      }

    }

    if (event === "element/selected-node") {
      input.setAttribute("selected-node", "true")
      input.style.outline = "3px solid #777"
    }

    if (event === "node/onbody") {

      return new Promise(async(resolve, reject) => {

        try {
          if (document) {
            if (document.body) {
              document.body.append(input)
              resolve()
            }
          }
        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "oninput/verify-positive-integer") {

      input.addEventListener("input", () => {
        if (this.verifyIs("text/+int", input.value)) {
          this.add("style/node/valid", input)
        } else {
          this.add("style/node/not-valid", input)
        }
      })

    }

    if (event === "onclick/overlay-owner-funnel") {

      input.addEventListener("click", () => {

        this.overlay("toolbox", async overlay => {

          this.removeOverlayButton(overlay)

          const res = await this.request("/get/owner/closed/")
          if (res.status === 200) {
            const owner = JSON.parse(res.response)
            this.render("field-funnel/owner", owner, overlay)
          }

          if (res.status !== 200) {
            this.render("field-funnel/owner", overlay)
          }

        })

      })

    }

    if (event === "onclick/assign-expert-home") {

      input.addEventListener("click", async () => {

        const res = await this.request("/get/expert/name-self/")
        if (res.status === 200) {
          const name = res.response
          window.location.assign(`/${name}/`)
        }

      })

    }

    if (event === "onclick/selector/contact-location-expert") {
      document.querySelectorAll(input).forEach(node => {
        this.add("outline-hover", node)
        node.onclick = () => {

          this.overlay("popup", overlay => {
            this.render("text/h1", "Kontakt anfragen", overlay)

            const funnel = this.create("div/scrollable", overlay)

            const preferenceField = this.create("field/select", funnel)
            preferenceField.label.textContent = "Wie möchten Sie gerne kontaktiert werden"
            preferenceField.input.add(["E-Mail", "Telefon", "Webcall"])
            this.add("outline-hover", preferenceField.input)
            this.verify("input/value", preferenceField.input)

            const emailField = this.create("field/email", funnel)
            this.add("outline-hover", emailField.input)
            this.verify("input/value", emailField.input)
            emailField.input.oninput = () => this.verify("input/value", emailField.input)

            const subjectField = this.create("field/textarea", funnel)
            subjectField.label.textContent = "Betreff"
            subjectField.input.style.height = "89px"
            subjectField.input.placeholder = "Für eine schnelle Bearbeitung, können Sie uns hier den Grund Ihrer Kontaktanfrage nennen."
            subjectField.input.setAttribute("required", "true")
            this.add("outline-hover", subjectField.input)
            this.verify("input/value", subjectField.input)
            subjectField.input.oninput = () => this.verify("input/value", subjectField.input)

            const placeholderDiv = this.create("div", funnel)
            let telField
            preferenceField.input.oninput = () => {
              const value = preferenceField.input.value
              placeholderDiv.textContent = ""
              if (value === "Telefon") {
                telField = this.create("field/tel", placeholderDiv)
                telField.label.textContent = "Telefon Nummer"
                telField.input.placeholder = "+49.."
                telField.input.setAttribute("required", "true")
                telField.input.setAttribute("accept", "text/tel")
                telField.input.oninput = () => this.verify("input/value", telField.input)
                this.add("outline-hover", telField.input)
                this.verify("input/value", telField.input)
              } else {
                telField = undefined
              }

            }

            const submit = this.create("button/action", funnel)
            submit.textContent = "Kontakt jetzt anfragen"
            this.add("outline-hover", submit)
            submit.onclick = async () => {
              await this.verify("field-funnel", funnel)

              const preference = preferenceField.input.value
              const email = emailField.input.value
              const subject = subjectField.input.value
              if (subject.length > 144) {
                this.add("style/node/not-valid", subjectField.input)
                window.alert("Betreff darf nur 144 Zeichen enthalten.")
                return
              }
              let tel
              if (telField) {
                tel = telField.input.value
              } else {
                tel = undefined
              }

              this.callback("email/pin-verified", email, async overlay => {
                const res = await this.request("/register/contacts/lead-location-expert/", {preference, email, subject, tel})
                if (res.status === 200) {
                  window.alert(`Ihre Anfrage wurde erfolgreich weitergeleitet.\n\nIhr Ansprechpartner wird sich, per ${preference}, bei Ihnen melden.`)
                  overlay.remove()
                } else {
                  window.alert("Fehler.. Bitte wiederholen.")
                }
              })

            }

          })
        }
      })
    }

    if (event === "field/image-url") {
      const field = this.create("field/url", input)
      field.input.setAttribute("required", "true")
      field.input.accept = "text/https"
      field.label.textContent = "Gebe hier die Quell-Url für dein Bild ein"
      field.input.placeholder = "https://www.meine-quelle.de"
      this.verify("input/value", field.input)
      field.input.addEventListener("input", () => this.verify("input/value", field.input))

      if (input) input.append(field)
      return field
    }

    if (event === "field/image-url") {
      const field = this.create("field/url")
      field.input.setAttribute("required", "true")
      field.input.accept = "text/https"
      field.label.textContent = "Gebe hier die Quell-Url für dein Bild ein"
      field.input.placeholder = "https://www.meine-quelle.de"

      this.verify("input/value", field.input)
      field.input.oninput = () => this.verify("input/value", field.input)

      if (input) input.append(field)
      return field
    }

    if (event === "observer/id-mutation") {

      const cache = {}

      const observer = new MutationObserver((mutations, observer) => {
        for (let i = 0; i < mutations.length; i++) {
          const mutation = mutations[i]

          if (mutation.type === "childList") {

            mutation.removedNodes.forEach(node => {


              if (!this.verifyIs("text/empty", node.id)) {

                const borderStyle = "2px dashed rgb(176, 53, 53)"

                const ids = document.querySelectorAll(`#${node.id}`)

                if (ids[1] !== undefined) {
                  cache.id = node.id
                  document.querySelectorAll(`#${ids[1].id}`).forEach(id => {
                    id.style.border = borderStyle
                  })
                }

                if (ids[1] === undefined) {

                  if (cache.id !== undefined) {

                    const oldIds = document.querySelectorAll(`#${cache.id}`)

                    if (oldIds[1] !== undefined) {
                      document.querySelectorAll(`#${oldIds[1].id}`).forEach(id => {
                        id.style.border = borderStyle
                      })
                    }

                    if (oldIds[1] === undefined) {

                      oldIds.forEach(id => {

                        if (id.style.border === borderStyle) {
                          id.style.border = null
                        }

                      })

                    }


                  }

                  ids.forEach(id => {

                    if (id.style.border === borderStyle) {
                      id.style.border = null
                    }

                  })

                }

              }


            })

            mutation.addedNodes.forEach(node => {

              if (!this.verifyIs("text/empty", node.id)) {

                const borderStyle = "2px dashed rgb(176, 53, 53)"

                const ids = document.querySelectorAll(`#${node.id}`)

                if (ids[1] !== undefined) {
                  cache.id = node.id
                  document.querySelectorAll(`#${ids[1].id}`).forEach(id => {
                    id.style.border = borderStyle
                  })
                }

                if (ids[1] === undefined) {

                  if (cache.id !== undefined) {

                    const oldIds = document.querySelectorAll(`#${cache.id}`)

                    if (oldIds[1] !== undefined) {
                      document.querySelectorAll(`#${oldIds[1].id}`).forEach(id => {
                        id.style.border = borderStyle
                      })
                    }

                    if (oldIds[1] === undefined) {

                      oldIds.forEach(id => {

                        if (id.style.border === borderStyle) {
                          id.style.border = null
                        }

                      })

                    }


                  }

                  ids.forEach(id => {

                    if (id.style.border === borderStyle) {
                      id.style.border = null
                    }

                  })

                }

              }


            })

          }

          if (mutation.type === 'attributes' && mutation.attributeName === 'id') {

            if (!this.verifyIs("text/empty", mutation.target.id)) {


              const borderStyle = "2px dashed rgb(176, 53, 53)"

              const ids = document.querySelectorAll(`#${mutation.target.id}`)

              if (ids[1] !== undefined) {
                cache.id = mutation.target.id
                document.querySelectorAll(`#${ids[1].id}`).forEach(id => {
                  id.style.border = borderStyle
                })
              }

              if (ids[1] === undefined) {

                if (cache.id !== undefined) {

                  const oldIds = document.querySelectorAll(`#${cache.id}`)

                  if (oldIds[1] !== undefined) {
                    document.querySelectorAll(`#${oldIds[1].id}`).forEach(id => {
                      id.style.border = borderStyle
                    })
                  }

                  if (oldIds[1] === undefined) {

                    oldIds.forEach(id => {

                      if (id.style.border === borderStyle) {
                        id.style.border = null
                      }

                    })

                  }


                }

                ids.forEach(id => {

                  if (id.style.border === borderStyle) {
                    id.style.border = null
                  }

                })

              }


            }
          }

        }
      })
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
      })

    }

    if (event === "toolbox/buttons") {


      const back = this.create("toolbox/back")
      const toolbox = this.create("toolbox/getyour")

      toolbox.style.zIndex = "2"

      back.setAttribute("data-id", "toolbox")
      toolbox.setAttribute("data-id", "toolbox")

      document.body.insertBefore(back, document.querySelector("#toolbox"))
      document.body.insertBefore(toolbox, document.querySelector("#toolbox"))

      toolbox.addEventListener("click", () => {

        this.overlay("toolbox", async overlay => {

          const buttons = this.create("div/scrollable", overlay)

          {
            const button = this.create("toolbox/left-right", buttons)
            button.left.textContent = "document.children"
            button.right.textContent = "Dokumenten Inhalt"
            button.addEventListener("click", () => {
              this.overlay("toolbox", overlay => {
                overlay.info.textContent = "document.children"
                const childrenContainer = this.create("div/scrollable", overlay)
                this.render("children", document.documentElement, childrenContainer)
              })
            })
          }

          {

            const button = this.create("toolbox/left-right", buttons)
            button.left.textContent = "document.write"
            button.right.textContent = "Aktuelles Dokument ersetzen"
            button.addEventListener("click", () => {

              this.overlay("toolbox", overlay => {

                this.removeOverlayButton(overlay)

                const funnel = this.create("div/scrollable", overlay)

                const htmlField = this.create("field/textarea", funnel)
                htmlField.label.textContent = "HTML Dokument"
                htmlField.input.style.fontFamily = "monospace"
                htmlField.input.style.fontSize = "13px"
                htmlField.input.style.height = "89px"
                htmlField.input.placeholder = `<html>..</html>`
                this.verify("input/value", htmlField.input)
                htmlField.input.oninput = () => this.verify("input/value", htmlField.input)

                const button = this.create("button/action", funnel)
                button.textContent = "Dokument jetzt ersetzen"
                button.addEventListener("click", async () => {
                  const confirm = window.confirm("Achtung! Diese Funktion wird dein aktuelles HTML Dokument mit deinem neuen HTML Import ersetzen. Der Inhalt deines aktuellen Dokuments wird unwideruflich gelöscht, sobald du deine Werteinheit abspeicherst.\n\nMöchtest du dein aktuelles HTML Dokument wirklich ersetzen?")
                  if (confirm === true) {
                    await this.verify("input/value", htmlField.input)
                    const html = htmlField.input.value
                    await this.convert("text/document", html)
                    await this.add("script/toolbox-getter")
                    overlay.remove()
                  }
                })

              })


            })

          }

          {
            const button = this.create("toolbox/left-right", buttons)
            button.left.textContent = "document.copy"
            button.right.textContent = "Aktuelles Dokument kopieren"
            button.onclick = () => {
              this.convert("text/clipboard", document.documentElement.outerHTML)
              .then(() => window.alert("Dokument erfolgreich in die Zwischenablage kopiert."))
            }
          }

          {
            const button = this.create("toolbox/left-right", buttons)
            button.left.textContent = "update.toolbox"
            button.right.textContent = "Mit nur einem Klick erhälst du die aktuellste Version unserer Toolbox"
            button.addEventListener("click", async () => {
              await this.update("toolbox-getter", document.body)
              window.alert("Deine Toolbox ist jetzt auf dem neuesten Stand.\n\nUm sicherzustellen, dass Deine wertvollen Änderungen nicht verloren gehen und dauerhaft im Dokument gespeichert werden, vergiss bitte nicht, den Speichervorgang durchzuführen. Das Speichern Deiner Arbeit ist wie das Bewahren eines Kunstwerks. Denke daran, auf die 'Speichern'-Schaltfläche in Deiner Anwendungssoftware zu klicken. Andernfalls könnten Deine Anpassungen beim Schließen des Fensters verschwinden.")
            })
          }

          {
            const button = this.create("toolbox/left-right", buttons)
            button.left.textContent = "document.designMode"
            if (document.designMode === "on") {
              const green = this.create("div/green-flag", button.right)
              green.textContent = "on"
            } else {
              const red = this.create("div/red-flag", button.right)
              red.textContent = "off"
            }
            button.onclick = () => {
              this.convert("doc/design-mode")
              overlay.remove()
            }
          }

          {
            const button = this.create("toolbox/left-right", buttons)
            button.left.textContent = ".start"
            button.right.textContent = "Schnell zum Start zurück"
            button.addEventListener("click", async () => window.open("/", "_blank"))
          }


        })

      })


    }

    if (event === "toolbox/onbody") {

      return new Promise(async(resolve, reject) => {

        try {

          const res = await this.request("/verify/user/closed/")
          if (res.status === 200) {
            const res = await this.request("/verify/user/location-expert/")
            if (res.status === 200) {
              this.add("toolbox/buttons")
              this.add("observer/id-mutation")
              resolve()
            }

            if (res.status !== 200) {
              const res = await this.request("/verify/user/location-writable/")
              if (res.status === 200) {
                this.add("toolbox/buttons")
                this.add("observer/id-mutation")
                resolve()
              }
            }
          }

          reject()

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "field-funnel/oninput-sign-support") {
      input.querySelectorAll(".field").forEach(field => {
        const input = field.querySelector(".field-input")
        input.oninput = () => this.verify("input/value", input)
      })
    }

    if (event === "ms/timeout") {
      return new Promise(resolve => {
        setTimeout(() => {
          return resolve()
        }, input)
      })
    }

    if (event === "event/service-creator") {

      return new Promise(async(resolve, reject) => {
        try {

          const companyName = document.querySelector("div.company-name")
          const totalPrice = document.querySelector("span.total-price")
          const singlePrice = document.querySelector("span.single-price")
          const serviceUnits = document.querySelectorAll("span.service-unit")
          const quantityInput = document.querySelector("input.quantity")
          const serviceSelect = document.querySelector("div.service-select").firstChild

          let selectedServices
          serviceSelect.oninput = (ev) => {
            const selected = ev.target.value

            companyName.textContent = "Firma"
            singlePrice.textContent = "0,00"
            totalPrice.textContent = "0,00"
            selectedServices = []

            this.overlay("toolbox", async roleListOverlay => {
              // this.removeOverlayButton(roleListOverlay)

              const buttons = this.create("info/loading", roleListOverlay)

              const res = await this.request("/get/user/trees-open/", {trees: [`${window.location.pathname.split("/")[2]}.${selected}`, `${window.location.pathname.split("/")[2]}.company.name`, `${window.location.pathname.split("/")[2]}.services`, "reputation"]})
              if (res.status === 200) {
                const users = JSON.parse(res.response)

                this.sort("array/reputation/descending", users)

                this.convert("parent/scrollable", buttons)

                this.render("text/h1", `${this.convert("text/capital-first-letter", selected)} auswählen`, buttons)

                for (let i = 0; i < users.length; i++) {
                  const user = users[i]

                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = user[`${window.location.pathname.split("/")[2]}.company.name`]
                  button.right.textContent = `${user[`${window.location.pathname.split("/")[2]}.services`].length} Dienstleistungen`
                  button.onclick = () => {
                    this.overlay("toolbox", selectServicesOverlay => {
                      overlay.registerHtmlButton.onclick = () => {

                        if (selectedServices === undefined || selectedServices.length === 0) {
                          window.alert("Es wurde keine Leistung ausgewählt.")
                        }

                        if (selectedServices !== undefined && selectedServices.length > 0) {
                          const serviceOptions = document.querySelector("div.service-options")
                          const serviceBox = this.create("div/service-box", serviceOptions)
                          serviceBox.checkbox.checked = true
                          serviceBox.quantity.textContent = document.querySelector("input.quantity").value
                          const company = document.createElement("p")
                          company.style.fontWeight = "bold"
                          company.textContent = document.querySelector("div.company-name").textContent
                          serviceBox.service.appendChild(company)
                          for (let i = 0; i < selectedServices.length; i++) {
                            const service = selectedServices[i]
                            const serviceDiv = document.createElement("div")
                            serviceDiv.textContent = service.name
                            serviceBox.service.append(serviceDiv)
                          }
                          serviceBox.singlePrice.textContent = document.querySelector("div.single-price").textContent
                          serviceBox.totalPrice.textContent = document.querySelector("div.total-price").textContent
                          this.remove("overlays")
                        }

                      }

                      const serviceButtons = this.create("div/scrollable", selectServicesOverlay)

                      this.render("text/h1", `Leistungen auswählen`, serviceButtons)

                      for (let i = 0; i < user[`${window.location.pathname.split("/")[2]}.services`].length; i++) {
                        const locationList = user[`${window.location.pathname.split("/")[2]}.services`][i]

                        const button = this.create("button/left-right", serviceButtons)

                        const checkbox = this.create("input/checkbox", button.left)
                        checkbox.style.transform = "scale(2)"
                        checkbox.style.margin = "0 21px"
                        checkbox.style.cursor = "pointer"
                        for (let i = 0; i < selectedServices.length; i++) {
                          const selectedService = selectedServices[i]
                          if (selectedService.name === locationList.funnel.name) {
                            checkbox.checked = true
                          }
                        }
                        checkbox.addEventListener("click", () => checkbox.checked = !checkbox.checked)

                        button.left.style.display = "flex"
                        button.left.style.alignItems = "center"
                        button.left.style.width = "233px"
                        button.left.append(locationList.funnel.name)
                        button.right.textContent = `${locationList.funnel.price} €`
                        button.right.style.fontSize = "34px"
                        if (locationList.funnel.unit !== undefined) {
                          button.right.textContent = `${locationList.funnel.price} ${locationList.funnel.unit}`
                        }

                        button.onclick = () => {
                          this.remove("node/sign", serviceSelect)
                          checkbox.checked = !checkbox.checked

                          const service = {}
                          service.name = locationList.funnel.name
                          service.price = locationList.funnel.price

                          companyName.textContent = user[`${window.location.pathname.split("/")[2]}.company.name`]

                          if (checkbox.checked === true) {
                            selectedServices.push(service)
                          }

                          if (checkbox.checked === false) {
                            const index = selectedServices.findIndex(it => it.name === service.name)
                            if (index !== -1) {
                              selectedServices.splice(index, 1)
                            }
                          }

                          const sum = selectedServices.reduce((accumulator, current) => {
                            return accumulator + Number(current.price)
                          }, 0)

                          singlePrice.textContent = `${sum.toFixed(2).replace(".", ",")} `
                          totalPrice.textContent = `${sum.toFixed(2).replace(".", ",")} `
                          quantityInput.value = 1

                          if (locationList.funnel.unit !== undefined) {
                            serviceUnit.textContent = locationList.funnel.unit
                          }

                        }


                      }

                    })
                  }

                }

              }

              if (res.status !== 200) {
                this.convert("parent/info", buttons)
                buttons.textContent = `Keine ${this.convert("text/capital-first-letter", selected)} gefunden.`
              }

            })
          }

          const res = await this.request("/get/user/trees-open/", {trees: ["getyour.expert.platforms"]})
          if (res.status === 200) {
            const users = JSON.parse(res.response)
            for (let i = 0; i < users.length; i++) {
              const user = users[i]
              if (user["getyour.expert.platforms"] !== undefined) {
                for (let i = 0; i < user["getyour.expert.platforms"].length; i++) {
                  const platform = user["getyour.expert.platforms"][i]
                  if (platform.name === window.location.pathname.split("/")[2]) {
                    if (platform.roles !== undefined) {
                      serviceSelect.textContent = ""
                      for (let i = 0; i < platform.roles.length; i++) {
                        const role = platform.roles[i]
                        const option = document.createElement("option")
                        option.text = this.convert("text/capital-first-letter", role.name)
                        option.value = role.name
                        serviceSelect.append(option)
                      }
                    }
                  }
                }
              }
            }
          }

          quantityInput.oninput = (ev) => {
            const totalPrice = document.querySelector("span.total-price")
            const singlePrice = document.querySelector("span.single-price")
            totalPrice.textContent = `${(Number(singlePrice.textContent.replace(",", ".")) * ev.target.value).toFixed(2).replace(".", ",")} `
          }

          const addService = document.querySelector("div.add-service")
          addService.style.cursor = "pointer"
          addService.onclick = () => {

            if (selectedServices === undefined || selectedServices.length === 0) {
              window.alert("Es wurde keine Leistung ausgewählt.")
              this.add("style/node/not-valid", serviceSelect)
            }

            if (selectedServices !== undefined && selectedServices.length > 0) {
              const serviceOptions = document.querySelector("div.service-options")
              const serviceBox = this.create("div/service-box", serviceOptions)
              serviceBox.checkbox.checked = true
              serviceBox.quantity.textContent = document.querySelector("input.quantity").value
              const company = document.createElement("p")
              company.style.fontWeight = "bold"
              company.textContent = document.querySelector("div.company-name").textContent
              serviceBox.service.appendChild(company)
              for (let i = 0; i < selectedServices.length; i++) {
                const service = selectedServices[i]
                const serviceDiv = document.createElement("div")
                serviceDiv.textContent = service.name
                serviceBox.service.append(serviceDiv)
              }
              serviceBox.singlePrice.textContent = document.querySelector("div.single-price").textContent
              serviceBox.totalPrice.textContent = document.querySelector("div.total-price").textContent
            }

          }

        } catch (error) {
          reject(error)
        }
      })


    }

    if (event === "event/role-apps") {

      const button = document.querySelector(".role-apps-button")

      if (button !== null) {

        button.onclick = async () => {

          this.overlay("toolbox", overlay => {
            this.removeOverlayButton(overlay)
            const info = this.create("header/info", overlay)
            info.append(this.convert("text/span", input.tag))

            this.get("role-apps/closed", overlay, input.id)

          })

        }

      }

    }

    if (event === "event/location-list-funnel") {

      const button = document.getElementById(`${input.tag}-mirror-button`)

      if (button !== null) {
        button.onclick = () => {

          this.overlay("toolbox", async overlay => {

            this.removeOverlayButton(overlay)
            const info = this.create("header/info", overlay)
            info.textContent = "." + input.tag

            const create = this.create("button/left-right", overlay)
            create.left.textContent = ".create"
            create.right.textContent = this.convert("text/capital-first-letter", input.tag) + " definieren"
            create.addEventListener("click", () => {

              this.overlay("toolbox", async overlay => {
                this.removeOverlayButton(overlay)
                const info = this.create("header/info", overlay)
                info.append(this.convert("text/span", input.tag + ".create"))

                const content = this.create("div/scrollable", overlay)
                const fieldFunnel = await this.convert("path/field-funnel", input.path)
                content.append(fieldFunnel)

                this.verifyIs("field-funnel/valid", fieldFunnel)

                const submitButton = fieldFunnel.querySelector(".submit-field-funnel-button")

                if (submitButton) {

                  submitButton.textContent = `${this.convert("text/capital-first-letter", input.tag)} jetzt speichern`
                  submitButton.onclick = async () => {

                    await this.verify("field-funnel", fieldFunnel)

                    const map = await this.convert("field-funnel/map", fieldFunnel)

                    this.overlay("security", async securityOverlay => {

                      const register = {}
                      register.tag = input.tag
                      register.map = map
                      const res = await this.request("register/location/list-self/", register)

                      if (res.status === 200) {
                        window.alert("Daten erfolgreich gespeichert.")

                        const res = await this.request("/get/location/tag-self/", {tag: input.tag})
                        if (res.status === 200) {
                          const tag = JSON.parse(res.response)
                          this.render("location-list/node/closed", {list: tag[input.tag], tag: input.tag, path: input.path}, locationList)
                        }
                        if (res.status !== 200) {
                          this.convert("parent/info", locationList)
                          locationList.textContent = `Keine ${this.comvert("text/capital-first-letter", input.tag)} gefunden`
                        }
                        securityOverlay.remove()
                      }

                      if (res.status !== 200) {
                        window.alert("Fehler.. Bitte wiederholen.")
                        securityOverlay.remove()
                      }

                    })

                  }

                } else {
                  window.alert("Field Funnel besitzt keinen Button mit der Klasse 'submit-field-funnel-button'")
                }


              })

            })

            this.render("text/hr", "Meine " + this.convert("text/capital-first-letter", input.tag), overlay)

            const locationList = this.create("info/loading", overlay)
            const res = await this.request("/get/location/tag-self/", {tag: input.tag})
            if (res.status === 200) {
              const tag = JSON.parse(res.response)
              this.render("location-list/node/closed", {list: tag[input.tag], tag: input.tag, path: input.path}, locationList)
            }
            if (res.status !== 200) {
              this.convert("parent/info", locationList)
              locationList.textContent = `Keine ${this.comvert("text/capital-first-letter", input.tag)} gefunden`
            }

          })

        }
      }

    }

    if (event === "prefill-field-funnel") {

      document.querySelectorAll(".field-funnel").forEach(async funnel => {
        const trees = await this.convert("field-funnel/trees", funnel)
        const res = await this.request("/get/user/trees-closed/", trees)
        if (res.status === 200) {
          const keys = JSON.parse(res.response)
          this.render("tree-map/field-funnel", keys, funnel)
        }
      })
    }

    if (event === "submit-field-funnel") {

      document.querySelectorAll(".field-funnel").forEach(funnel => {
        this.add("outline-hover/field-funnel", funnel)
        const submitButton = funnel.querySelector(".submit-field-funnel-button")
        if (submitButton !== null) {
          if (submitButton.onclick === null) {
            submitButton.onclick = async () => {
              if (this.verifyIs("tag/empty", funnel.id)) {
                window.alert("Funnel ist nicht gültig: id ist kein tag")
                throw new Error("funnel tag is empty")
              }
              const map = await this.convert("field-funnel/map", funnel)
              if (map !== undefined) {
                this.overlay("security", async securityOverlay => {
                  const res = await this.request("/register/location/list-self/", {tag: funnel.id, map})
                  if (res.status === 200) {
                    window.alert("Daten wurden erfolgreich gespeichert.")
                    if (funnel.hasAttribute("next-path")) {
                      window.location.assign(funnel.getAttribute("next-path"))
                    }
                    securityOverlay.remove()
                  } else {
                    window.alert("Fehler.. Bitte wiederholen.")
                    securityOverlay.remove()
                  }
                })
              }
            }
          }
        }
      })
    }

    if (event === "on-info-click") {

      document.querySelectorAll(".field").forEach(field => {
        if (field.hasAttribute("on-info-click")) {
          this.convert("field/on-info-click", field)
        }
      })
    }

    if (event === "event/dbltouch") {
      let lastTapTime = 0

      input.node.addEventListener("touchend", ev => {
        const currentTime = new Date().getTime()
        const timeDifference = currentTime - lastTapTime

        if (timeDifference < 300 && timeDifference > 0) {
          input.callback(ev)
        }

        lastTapTime = currentTime
      })
    }

    if (event === "field-funnel-sign-support") {

      document.querySelectorAll(".field-funnel").forEach(funnel => {
        this.verifyIs("field-funnel/valid", funnel)
      })

      document.querySelectorAll(".field-funnel").forEach(funnel => {
        funnel.querySelectorAll(".field").forEach(field => {
          const input = field.querySelector(".field-input")
          input.addEventListener("input", () => this.verify("input/value", input))
        })
      })

    }

    if (event === "event/soundbox") {

      return new Promise(async(resolve, reject) => {
        try {

          const fileImport = document.querySelector("[soundbox-file-import]")
          fileImport.oninput = async () => {

            const promises = []
            for (let i = 0; i < fileImport.files.length; i++) {
              const file = fileImport.files[i]
              const promise = this.verifyIs("file/mp3", file)
              promises.push(promise)
            }

            const results = await Promise.all(promises)

            if (results.every(result => result === true)) {
              this.add("style/node/valid", fileImport)

              this.overlay("security", async securityOverlay => {

                const progress = this.create("div/progress-bar", securityOverlay)

                for (var i = 0; i < fileImport.files.length; i++) {
                  const file = fileImport.files[i]

                  // nginx file too large error
                  // mit salih klären todo

                  await new Promise(async(resolve, reject) => {
                    const formdata = new FormData()
                    formdata.append('mp3-file', file)

                    const res = await fetch('/upload/mp3-file/self/', {
                      method: 'POST',
                      body: formdata,
                    })

                    if (res.status === 200) {

                      progress.bar.style.backgroundColor = '#4CAF50'
                      progress.bar.style.width = ((i + 1) / fileImport.files.length) * 100 + '%'

                      resolve()
                    }


                    if (res.status !== 200) {

                      progress.bar.style.backgroundColor = '#FF5733'
                      progress.bar.style.width = ((i + 1) / fileImport.files.length) * 100 + '%'

                      resolve()
                    }

                  })

                }

                window.alert("Sound erfolgreich gespeichert.")
                securityOverlay.remove()

              })

            } else {
              window.alert("Nicht alle Uploads sind mp3 Dateien.")
              console.error("Not all files are mp3")
              this.add("style/node/not-valid", fileImport)
            }


          }

          const audioList = document.querySelector("[soundbox-audio-list]")
          if (audioList !== null) {

            const res = await this.request("/get/sounds/cids-self/")

            if (res.status === 200) {
              const sounds = JSON.parse(res.response)

              for (let i = 0; i < sounds.length; i++) {
                const sound = sounds[i]

                const audioField = this.create("field/audio", audioList)
                audioField.audio.id = sound.created
                audioField.audio.src = `https://ipfs.io/ipfs/${sound.cid}/`

                const track = document.createElement("div")
                track.classList.add("track")
                track.textContent = sound.track
                audioField.label.append(track)

                const creator = document.createElement("div")
                creator.classList.add("creator")
                creator.textContent = `${sound.creator} - ${sound.album}`
                audioField.label.append(creator)

                const played = document.createElement("div")
                played.classList.add("played")

                if (sound.played) {
                  played.textContent = sound.played
                } else {
                  played.textContent = "0"
                }

                played.style.position = "absolute"
                played.style.top = "0"
                played.style.right = "0"
                played.style.margin = "21px 34px 0 0"
                audioField.label.append(played)

                const reloadTimeout = setTimeout(audioField.audio.load(), 3000)
                audioField.audio.addEventListener("canplay", () => {
                  clearTimeout(reloadTimeout)
                })
                audioField.audio.addEventListener("error", () => {
                  audioField.remove()
                })

                audioField.label.style.cursor = "pointer"
                audioField.label.addEventListener("click", () => {
                  console.log(audioField.audio.id)

                  this.overlay("toolbox", overlay => {
                    this.removeOverlayButton(overlay)

                    const funnel = this.create("div/scrollable", overlay)

                    const trackField = this.create("field/textarea", funnel)
                    trackField.label.textContent = "Track"
                    trackField.input.style.fontSize = "13px"
                    trackField.input.setAttribute("required", "true")
                    if (sound.track) trackField.input.value = sound.track
                    trackField.input.oninput = () => this.verify("input/value", trackField.input)
                    this.verify("input/value", trackField.input)

                    const creatorField = this.create("field/textarea", funnel)
                    creatorField.label.textContent = "Schöpfer"
                    creatorField.input.style.fontSize = "13px"
                    creatorField.input.setAttribute("required", "true")
                    if (sound.creator) creatorField.input.value = sound.creator
                    creatorField.input.oninput = () => this.verify("input/value", creatorField.input)
                    this.verify("input/value", creatorField.input)

                    const albumField = this.create("field/textarea", funnel)
                    albumField.label.textContent = "Album"
                    albumField.input.style.fontSize = "13px"
                    albumField.input.setAttribute("required", "true")
                    if (sound.album) albumField.input.value = sound.album
                    albumField.input.oninput = () => this.verify("input/value", albumField.input)
                    this.verify("input/value", albumField.input)

                    const submit = this.create("button/action", funnel)
                    submit.textContent = "Daten jetzt speichern"
                    submit.onclick = async () => {
                      await this.verify("input/value", trackField.input)
                      await this.verify("input/value", creatorField.input)
                      await this.verify("input/value", albumField.input)

                      this.overlay("security", async securityOverlay => {

                        const register = {}
                        register.id = audioField.audio.id
                        register.track = trackField.input.value
                        register.creator = creatorField.input.value
                        register.album = albumField.input.value
                        const res = await this.request("/register/sounds/meta-self/", register)

                        if (res.status === 200) {
                          window.alert("Metadaten erfolgreich gespeichert.")
                          window.location.reload()
                        }

                        if (res.status !== 200) {
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }
                      })

                    }




                  })

                })

                audioField.audio.addEventListener("ended", () => {
                  this.request("/register/sounds/played/", audioField.audio.id, "beacon").then(res => {
                    if (res.status === 200) {
                      played.textContent = parseInt(played.textContent) + 1
                    }
                  })

                })


              }



            }

          }

        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "register-html") {

      this.overlay("security", async securityOverlay => {

        // prepare html state
        this.remove("element/selector", {element: document, selector: "[data-id]"})
        this.remove("element/selector", {element: document, selector: "#toolbox"})
        this.remove("element/selector", {element: document, selector: ".overlay"})
        const html = document.documentElement.outerHTML.replace(/<html>/, "<!DOCTYPE html><html>")

        // save html state
        const res = await this.request("/register/platform/value-html-location-expert/", {html})
        if (res.status === 200) {
          window.alert("Dokument erfolgreich gespeichert.")
          window.location.reload()
        }

        if (res.status !== 200) {

          const res = await this.request("/register/platform/value-html-writable/", {html})
          if (res.status === 200) {
            window.alert("Dokument erfolgreich gespeichert.")
            window.location.reload()
          }

          if (res.status !== 200) {

            window.alert("Fehler.. Bitte wiederholen.")
            await this.add("toolbox/onbody")
            securityOverlay.remove()

          }

        }

      })

    }

    if (event === "lazy-loading") {

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            input.src = input.dataset.src
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0 })
      observer.observe(input)
    }

    if (event === "html-creator") {

      return new Promise(async(resolve, reject) => {
        try {
          const button = this.create("button/bottom-right", document.body)
          button.classList.add(event)
          const icon = await this.convert("path/icon", "/public/pencil-ruler.svg")
          button.appendChild(icon)
          this.add("outline-hover", button)
          button.onclick = () => {
            this.overlay(event, async overlay => {
              const body = document.body
              let selectedNode = body
              body.onkeydown = (ev) => {

                if (ev.metaKey && ev.key === 'c') {
                  ev.preventDefault()
                  if (selectedNode) {
                    this.convert("text/clipboard", selectedNode.outerHTML).then(() => window.alert("Dein HTML Element wurde erfolgreich in die Zwischenablage gespeichert."))
                  }
                }

                if (ev.metaKey && ev.key === 'v') {
                  ev.preventDefault()
                  if (selectedNode) {
                    this.convert("clipboard/text").then(text => {
                      const node = this.convert("text/first-child", text)
                      selectedNode.append(node)
                    })
                  }
                }

                let rememberSelectedNodes = []
                if (ev.metaKey && ev.key === 'Backspace') {
                  ev.preventDefault()
                  if (selectedNode) {
                    rememberSelectedNodes.push({ node: selectedNode, parent: selectedNode.parentElement, index: Array.from(selectedNode.parentElement.children).indexOf(selectedNode)})
                    selectedNode.remove()
                  }
                }

                if (ev.metaKey && ev.key === 'z') {
                  ev.preventDefault()
                  if (selectedNode) {
                    if (rememberSelectedNodes.length > 0) {
                      const { node, parent, index } = rememberSelectedNodes.pop()
                      const children = Array.from(parent.children)
                      if (index >= 0 && index < children.length) {
                        parent.insertBefore(node, children[index])
                      } else {
                        parent.appendChild(node)
                      }
                    }

                  }
                }

              }

              for (let i = 0; i < body.children.length; i++) {
                const child = body.children[i]

                if (child.classList.contains(event)) continue
                if (child.classList.contains("overlay")) continue
                if (this.verifyIs("class/closest-node", {node: child, class: "overlay"})) continue

                this.add("event/dbltouch", {node: child, callback: async ev => {
                  ev.preventDefault()
                  ev.stopPropagation()
                  await this.remove("element/selected-node", body)
                  selectedNode = ev.target.parentElement
                  this.add("element/selected-node", selectedNode)
                }})

                child.ondblclick = async (ev) => {
                  ev.preventDefault()
                  ev.stopPropagation()
                  await this.remove("element/selected-node", body)
                  selectedNode = ev.target.parentElement
                  this.add("element/selected-node", selectedNode)
                }

                child.onclick = async (ev) => {
                  ev.preventDefault()
                  ev.stopPropagation()

                  if (ev.target.hasAttribute("selected-node")) {
                    await this.remove("element/selected-node", body)
                    selectedNode = body
                    this.add("element/selected-node", selectedNode)
                  } else {
                    await this.remove("element/selected-node", body)
                    selectedNode = ev.target
                    this.add("element/selected-node", selectedNode)
                  }

                }

              }

              const observer = new MutationObserver((mutationsList) => {
                mutationsList.forEach((mutation) => {
                  if (mutation.type === "childList" && mutation.addedNodes.length > 0) {


                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                      const node = mutation.addedNodes[i]

                      if (node) {
                        if (node.classList) {
                          if (node.classList.contains("overlay")) continue
                        }
                      }

                      if (this.verifyIs("class/closest-node", {node, class: "overlay"})) continue

                      if (node.nodeType === Node.ELEMENT_NODE) {

                        this.add("event/dbltouch", {node: node, callback: async ev => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          await this.remove("element/selected-node", body)
                          selectedNode = ev.target.parentElement
                          this.add("element/selected-node", selectedNode)
                        }})

                        node.ondblclick = async (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          await this.remove("element/selected-node", body)
                          selectedNode = ev.target.parentElement
                          this.add("element/selected-node", selectedNode)
                        }

                        node.onclick = async (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()

                          if (ev.target.hasAttribute("selected-node")) {
                            await this.remove("element/selected-node", body)
                            selectedNode = body
                            this.add("element/selected-node", selectedNode)
                          } else {
                            await this.remove("element/selected-node", body)
                            selectedNode = ev.target
                            this.add("element/selected-node", selectedNode)
                          }

                        }

                      }

                    }

                  }
                })
              })
              observer.observe(body, { childList: true, subtree: true })

              const buttons = this.fn("creator-buttons", {parent: overlay})

              buttons.duckDuckGoButton.onclick = () => buttons.duckDuckGoButton.convertNode(selectedNode)
              buttons.sourcesButton.onclick = () => buttons.openSourcesOverlay(selectedNode)
              buttons.createFlexButton.onclick = () => buttons.createFlexWidthWithPrompt(selectedNode)
              buttons.createGridButton.onclick = () => buttons.createGridMatrixWithPrompt(selectedNode)
              buttons.rowContainerButton.onclick = () => buttons.createFlexRow(selectedNode)
              buttons.columnContainerButton.onclick = () => buttons.createFlexColumn(selectedNode)
              buttons.imageTextButton.onclick = () => buttons.createImageText(selectedNode)
              buttons.keyValueButton.onclick = () => buttons.createKeyValue(selectedNode)
              buttons.actionBtnButton.onclick = () => buttons.createActionButton(selectedNode)
              buttons.horizontalHrButton.onclick = () => buttons.createHr(selectedNode)
              buttons.simpleHeaderButton.onclick = () => buttons.createLeftImageHeader(selectedNode)
              buttons.h1Button.onclick = () => buttons.createH1withPrompt(selectedNode)
              buttons.h2Button.onclick = () => buttons.createH2withPrompt(selectedNode)
              buttons.h3Button.onclick = () => buttons.createH3withPrompt(selectedNode)
              buttons.pButton.onclick = () => buttons.createPwithPrompt(selectedNode)
              buttons.imageButton.onclick = () => buttons.createImagePlaceholder(selectedNode)
              buttons.tableHeaderButton.onclick = () => buttons.createTableWithMatrixPrompt(selectedNode)
              buttons.pdfLinkButton.onclick = async () => await buttons.createPdfLinkWithPrompt(selectedNode)
              buttons.aLinkButton.onclick = () => buttons.createAnchorWithPrompt(selectedNode)
              buttons.spanButton.onclick = () => buttons.createSpanWithTextContent(selectedNode)
              buttons.changeSiButton.onclick = () => buttons.createSpanWithSiPrompt(selectedNode)
              buttons.addSpaceButton.onclick = () => buttons.createSpaceWithHeightPrompt(selectedNode)
              buttons.arrowRightButton.onclick = () => buttons.createArrowRightWithColorPrompt(selectedNode)
              buttons.divScrollableButton.onclick = () => buttons.createScrollableY(selectedNode)
              buttons.packDivButton.onclick = () => buttons.createDivPackOuter(selectedNode)
              buttons.textInputButton.onclick = () => buttons.createTextInput(selectedNode)
              buttons.numberInputButton.onclick = () => buttons.createTelInput(selectedNode)
              buttons.checkboxInputButton.onclick = () => buttons.createCheckboxInput(selectedNode)
              buttons.passwordInputButton.onclick = () => buttons.createPasswordInput(selectedNode)
              buttons.selectInputButton.onclick = () => buttons.createSelectInput(selectedNode)
              buttons.growWidthButton.onclick = () => buttons.toggleStyle({key: "width", value: "100%", node: selectedNode})
              buttons.maxWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "maxWidth", node: selectedNode, message: "Gebe die maximale Breite deines Elements ein: (z.B., 900px)"})
              buttons.minWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "minWidth", node: selectedNode, message: "Gebe die minimale Breite deines Elements ein: (z.B., 300px)"})
              buttons.exactWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "width", node: selectedNode, message: "Gebe die exakte Breite deines Elements ein: (z.B., 350px)"})
              buttons.increaseWidthButton.onclick = () => buttons.incrementStyle({key: "width", node: selectedNode, delta: 1})
              buttons.decreaseWidthButton.onclick = () => buttons.decrementStyle({key: "width", node: selectedNode, delta: 1})
              buttons.growHeightButton.onclick = () => buttons.toggleStyle({key: "height", value: "100%", node: selectedNode})
              buttons.maxHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "maxHeight", node: selectedNode, message: "Gebe die maximale Höhe deines Elements ein: (z.B., 89vh)"})
              buttons.minHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "minHeight", node: selectedNode, message: "Gebe die minimale Höhe deines Elements ein: (z.B., 21px)"})
              buttons.exactHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "height", node: selectedNode, message: "Gebe die exakte Höhe deines Elements ein: (z.B., 21vh)"})
              buttons.increaseHeightButton.onclick = () => buttons.incrementStyle({key: "height", node: selectedNode, delta: 1})
              buttons.decreaseHeightButton.onclick = () => buttons.decrementStyle({key: "height", node: selectedNode, delta: 1})
              buttons.exactDisplayButton.onclick = () => buttons.setStyleWithPrompt({key: "display", node: selectedNode, message: "Gebe den exakten Display Wert ein: (z.B., flex)"})
              buttons.displayBlockButton.onclick = () => buttons.toggleStyle({key: "display", value: "block", node: selectedNode})
              buttons.displayInlineButton.onclick = () => buttons.toggleStyle({key: "display", value: "inline", node: selectedNode})
              buttons.toggleDisplayGridButton.onclick = () => buttons.toggleStyle({key: "display", value: "grid", node: selectedNode})
              buttons.toggleDisplayFlexButton.onclick = () => buttons.toggleStyle({key: "display", value: "flex", node: selectedNode})
              buttons.toggleDisplayTableButton.onclick = () => buttons.toggleStyle({key: "display", value: "table", node: selectedNode})
              buttons.gridMobileButton.onclick = () => buttons.toggleStyles({styles: {display: "grid", gridTemplateColumns: "1fr", gridGap: "21px"}, node: selectedNode})
              buttons.gridFullDisplayButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
              buttons.gridTwoColumnsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr 1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
              buttons.gridThreeColumnsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
              buttons.gridFixedButton.onclick = () => buttons.fixedGridPrompt({node: selectedNode})
              buttons.gridListRowsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "89px 1fr", gridTemplateRows: `repeat(auto-fit, 55px)`, gridGap: "21px"}, childrenStyle: {height: "55px"}, node: selectedNode})
              buttons.gridSpanColumnButton.onclick = () => buttons.spanColumnWithPrompt(selectedNode)
              buttons.gridSpanRowButton.onclick = () => buttons.spanRowWithPrompt(selectedNode)
              buttons.exactGridGapButton.onclick = () => buttons.setStyleWithPrompt({key: "gap", node: selectedNode, message: "Gebe den exakten Abstand zwischen deinen Grid Elementen ein: (z.B., 13px)"})
              buttons.gridAddColumnButton.onclick = () => buttons.addGridColumn(selectedNode)
              buttons.gridRemoveColumnButton.onclick = () => buttons.removeGridColumn(selectedNode)
              buttons.gridAddRowButton.onclick = () => buttons.addGridRow(selectedNode)
              buttons.gridRemoveRowButton.onclick = () => buttons.removeGridRow(selectedNode)
              buttons.alignColumnButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexDirection: "column", flexWrap: null}, node: selectedNode})
              buttons.alignLeftButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "flex-start"}, node: selectedNode})
              buttons.alignCenterButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "center"}, node: selectedNode})
              buttons.alignRightButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "flex-end"}, node: selectedNode})
              buttons.alignRowButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexDirection: null, flexWrap: "wrap"}, node: selectedNode})
              buttons.alignTopButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "flex-start"}, node: selectedNode})
              buttons.alignVerticalButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "center"}, node: selectedNode})
              buttons.alignBottomButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "flex-end"}, node: selectedNode})
              buttons.flexButton.onclick = () => buttons.setStyleWithPrompt({key: "flex", node: selectedNode, message: "Gebe die Flex Matrix für dein Element ein: (z.B., 1 1 55px)"})
              buttons.spaceBetweenButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap", justifyContent: "space-between"}, node: selectedNode})
              buttons.spaceAroundButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap", justifyContent: "space-around"}, node: selectedNode})
              buttons.toggleWrapButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap"}, node: selectedNode})
              const onLayerClick = async layer => {
                await this.remove("element/selected-node", preview)
                selectedNode = layer
                this.add("selected/node", layer)
              }
              buttons.layerButton.onclick = () => buttons.openLayerOverlay(onLayerClick, selectedNode)
              buttons.positiveLayerButton.onclick = () => buttons.addLayerAbove(selectedNode)
              buttons.negativeLayerButton.onclick = () => buttons.addLayerBelow(selectedNode)
              buttons.exactLayerButton.onclick = async () => buttons.addLayerPrompt(selectedNode)
              buttons.removeLayerButton.onclick = () => buttons.removeAllLayer(selectedNode)
              buttons.positionAbsoluteButton.onclick = () => buttons.toggleStyle({key: "position", value: "absolute", node: selectedNode})
              buttons.positionTopButton.onclick = () => buttons.setStyleWithPrompt({key: "top", node: selectedNode, message: "Geben den exakten Abstand nach oben ein: (z.B., 300px)"})
              buttons.positionRightButton.onclick = () => buttons.setStyleWithPrompt({key: "right", node: selectedNode, message: "Geben den exakten Abstand nach rechts ein: (z.B., 300px)"})
              buttons.positionBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "bottom", node: selectedNode, message: "Geben den exakten Abstand nach unten ein: (z.B., 300px)"})
              buttons.positionLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "left", node: selectedNode, message: "Geben den exakten Abstand nach links ein: (z.B., 300px)"})
              buttons.transformTranslateButton.onclick = () => buttons.translateWithPrompt(selectedNode)
              buttons.transformTranslateXButton.onclick = () => buttons.translateXWithPrompt(selectedNode)
              buttons.transformTranslateYButton.onclick = () => buttons.translateYWithPrompt(selectedNode)
              buttons.zIndexButton.onclick = () => buttons.setStyleWithPrompt({key: "zIndex", node: selectedNode, message: "Gebe deinen Z-Index ein: (z.B., -1)"})
              buttons.scaleButton.onclick = () => buttons.scaleWithPrompt(selectedNode)
              buttons.rotateRightButton.onclick = () => buttons.rotateNode({degree: 90, node: selectedNode})
              buttons.exactRotateRightButton.onclick = () => buttons.rotateNodeRightWithPrompt(selectedNode)
              buttons.rotateLeftButton.onclick = () => buttons.rotateNode({degree: -90, node: selectedNode})
              buttons.exactRotateLeftButton.onclick = () => buttons.rotateNodeLeftWithPrompt(selectedNode)
              buttons.whiteSpaceNoWrapButton.onclick = () => buttons.toggleStyle({key: "whiteSpace", value: "nowrap", node: selectedNode})
              buttons.fontFamilyButton.onclick = () => buttons.toggleStyle({key: "fontFamily", value: "sans-serif", node: selectedNode})
              buttons.fontWeightNormalButton.onclick = () => buttons.toggleStyle({key: "fontWeight", value: "normal", node: selectedNode})
              buttons.fontWeightButton.onclick = () => buttons.toggleStyle({key: "fontWeight", value: "bold", node: selectedNode})
              buttons.fontStyleButton.onclick = () => buttons.toggleStyle({key: "fontStyle", value: "italic", node: selectedNode})
              buttons.textDecorationButton.onclick = () => buttons.toggleStyle({key: "textDecoration", value: "underline", node: selectedNode})
              buttons.fontSizeButton.onclick = () => buttons.setStyleWithPrompt({key: "fontSize", node: selectedNode, message: "Gebe deine Schriftgröße ein: (z.B., 34px)"})
              buttons.fontColorButton.onclick = () => buttons.setStyleWithPrompt({key: "color", node: selectedNode, message: "Gebe deine Schriftfarbe ein: (z.B., (#888, grey, rgb(88, 88, 88), rgba(0, 0, 0, 0.5)))"})
              buttons.fontColorButton.onclick = () => buttons.setStyleWithPrompt({key: "backgroundColor", node: selectedNode, message: "Gebe deine Hintergrundfarbe ein: (z.B., (#888, grey, rgb(88, 88, 88), rgba(0, 0, 0, 0.5)))"})
              buttons.unorderedListButton.onclick = () => buttons.appendUnorderedListItem(selectedNode)
              buttons.orderedListButton.onclick = () => buttons.appendOrderedListItem(selectedNode)
              buttons.lineHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "lineHeight", node: selectedNode, message: "Gebe die exakte Linien Höhe ein: (z.B., 1.8)"})
              buttons.overflowYButton.onclick = () => buttons.toggleStyle({key: "overflowY", value: "auto", node: selectedNode})
              buttons.overflowXButton.onclick = () => buttons.toggleStyle({key: "overflowX", value: "auto", node: selectedNode})
              buttons.toggleDisplayNoneButton.onclick = () => buttons.toggleStyle({key: "display", value: "none", node: selectedNode})
              buttons.toggleVisibilityHiddenButton.onclick = () => buttons.toggleStyle({key: "visibility", value: "hidden", node: selectedNode})
              buttons.exactOpacityButton.onclick = () => buttons.addOpacityWithPrompt(selectedNode)
              buttons.toggleMarginButton.onclick = () => buttons.toggleStyle({key: "margin", value: "21px 34px", node: selectedNode})
              buttons.toggleMarginTopButton.onclick = () => buttons.toggleStyle({key: "marginTop", value: "21px", node: selectedNode})
              buttons.toggleMarginRightButton.onclick = () => buttons.toggleStyle({key: "marginRight", value: "34px", node: selectedNode})
              buttons.toggleMarginTopButton.onclick = () => buttons.toggleStyle({key: "marginBottom", value: "21px", node: selectedNode})
              buttons.toggleMarginLeftButton.onclick = () => buttons.toggleStyle({key: "marginLeft", value: "34px", node: selectedNode})
              buttons.exactMarginButton.onclick = () => buttons.setStyleWithPrompt({key: "margin", node: selectedNode, message: "Gebe den exakten Außenabstand ein: (z.B., 21px 34px 13px 144px)"})
              buttons.exactMarginTopButton.onclick = () => buttons.setStyleWithPrompt({key: "marginTop", node: selectedNode, message: "Gebe den exakten Außenabstand nach oben ein: (z.B., 21px)"})
              buttons.exactMarginRightButton.onclick = () => buttons.setStyleWithPrompt({key: "marginRight", node: selectedNode, message: "Gebe den exakten Außenabstand nach rechts ein: (z.B., 21px)"})
              buttons.exactMarginBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "marginRight", node: selectedNode, message: "Gebe den exakten Außenabstand nach unten ein: (z.B., 21px)"})
              buttons.exactMarginLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "marginLeft", node: selectedNode, message: "Gebe den exakten Außenabstand nach links ein: (z.B., 21px)"})
              buttons.togglePaddingButton.onclick = () => buttons.toggleStyle({key: "padding", value: "21px 34px", node: selectedNode})
              buttons.togglePaddingTopButton.onclick = () => buttons.toggleStyle({key: "paddingTop", value: "21px", node: selectedNode})
              buttons.togglePaddingRightButton.onclick = () => buttons.toggleStyle({key: "paddingRight", value: "34px", node: selectedNode})
              buttons.togglePaddingBottomButton.onclick = () => buttons.toggleStyle({key: "paddingBottom", value: "21px", node: selectedNode})
              buttons.togglePaddingLeftButton.onclick = () => buttons.toggleStyle({key: "paddingLeft", value: "34px", node: selectedNode})
              buttons.exactPaddingButton.onclick = () => buttons.setStyleWithPrompt({key: "padding", node: selectedNode, message: "Gebe den exakten Innenabstand ein: (z.B., 21px 34px 13px 144px)"})
              buttons.exactPaddingTopButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingTop", node: selectedNode, message: "Gebe den exakten Innenabstand nach oben ein: (z.B., 21px)"})
              buttons.exactPaddingRightButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingRight", node: selectedNode, message: "Gebe den exakten Innenabstand nach rechts ein: (z.B., 21px)"})
              buttons.exactPaddingBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingRight", node: selectedNode, message: "Gebe den exakten Innenabstand nach unten ein: (z.B., 21px)"})
              buttons.exactPaddingLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingLeft", node: selectedNode, message: "Gebe den exakten Innenabstand nach links ein: (z.B., 21px)"})
              buttons.toggleBorderButton.onclick = () => buttons.toggleStyle({key: "border", value: "1px solid black", node: selectedNode})
              buttons.toggleBorderTopButton.onclick = () => buttons.toggleStyle({key: "borderTop", value: "1px solid black", node: selectedNode})
              buttons.toggleBorderRightButton.onclick = () => buttons.toggleStyle({key: "borderTop", value: "1px solid black", node: selectedNode})
              buttons.toggleBorderBottomButton.onclick = () => buttons.toggleStyle({key: "borderBottom", value: "1px solid black", node: selectedNode})
              buttons.toggleBorderLeftButton.onclick = () => buttons.toggleStyle({key: "borderLeft", value: "1px solid black", node: selectedNode})
              buttons.exactBorderButton.onclick = () => buttons.setStyleWithPrompt({key: "border", node: selectedNode, message: "Gebe die exakten Grenzlinien ein: (z.B., 3px solid red)"})
              buttons.exactBorderTopButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTop", node: selectedNode, message: "Gebe die exakten Grenzlinien nach oben ein: (z.B., 3px solid red)"})
              buttons.exactBorderRightButton.onclick = () => buttons.setStyleWithPrompt({key: "borderRight", node: selectedNode, message: "Gebe die exakten Grenzlinien nach rechts ein: (z.B., 3px solid red)"})
              buttons.exactBorderBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottom", node: selectedNode, message: "Gebe die exakten Grenzlinien nach unten ein: (z.B., 3px solid red)"})
              buttons.exactBorderLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "borderLeft", node: selectedNode, message: "Gebe die exakten Grenzlinien nach links ein: (z.B., 3px solid red)"})
              buttons.toggleBorderRadiusButton.onclick = () => buttons.toggleStyle({key: "borderRadius", value: "3px", node: selectedNode})
              buttons.toggleBorderTopLeftRadiusButton.onclick = () => buttons.toggleStyle({key: "borderTopLeftRadius", value: "3px", node: selectedNode})
              buttons.toggleBorderTopRightRadiusButton.onclick = () => buttons.toggleStyle({key: "borderTopRightRadius", value: "3px", node: selectedNode})
              buttons.toggleBorderBottomRightRadiusButton.onclick = () => buttons.toggleStyle({key: "borderBottomRightRadius", value: "3px", node: selectedNode})
              buttons.toggleBorderBottomLeftRadiusButton.onclick = () => buttons.toggleStyle({key: "borderBottomLeftRadius", value: "3px", node: selectedNode})
              buttons.exactBorderRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderRadius", node: selectedNode, message: "Gebe den exakten Radius, für alle Ecken, ein: (z.B. 13px)"})
              buttons.exactBorderTopLeftRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTopLeftRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Oben-Links, ein: (z.B., 13px)"})
              buttons.exactBorderTopRightRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTopRightRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Oben-Rechts, ein: (z.B., 13px)"})
              buttons.exactBorderBottomLeftRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottomRightRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Unten-Links, ein: (z.B., 13px)"})
              buttons.exactBorderBottomRightRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottomLeftRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Unten-Rechts, ein: (z.B., 13px)"})
              buttons.toggleBorderNoneButton.onclick = () => buttons.toggleStyle({key: "border", value: "none", node: selectedNode})
              buttons.boxButton.onclick = () => buttons.toggleStyles({styles: {margin: "21px 34px", padding: "8px", borderRadius: "3px", boxShadow: "rgba(0, 0, 0, 0.13) 0px 1px 3px"}, node: selectedNode})
              buttons.exactBoxShadowButton.onclick = () => buttons.setStyleWithPrompt({key: "boxShadow", node: selectedNode, message: "Geben den exakten Schatten ein: (z.B., rgba(0, 0, 0, 0.13) 0px 1px 3px)"})
              buttons.mediaQueriesOverviewButton.onclick = () => buttons.openMediaQueriesOverlay()
              buttons.largeDeviceButton.onclick = () => buttons.addLargeStyle(selectedNode)
              buttons.middleDeviceButton.onclick = () => buttons.addMiddleStyle(selectedNode)
              buttons.smallDeviceButton.onclick = () => buttons.addSmallStyle(selectedNode)
              buttons.printerDeviceButton.onclick = () => buttons.addPrinterStyle(selectedNode)

              let rememberCuttedNodes = []
              buttons.insertAfterButton.onclick =  () => buttons.insertAfter(selectedNode, rememberCuttedNodes)
              buttons.insertBeforeButton.onclick =  () => buttons.insertBefore(selectedNode, rememberCuttedNodes)
              buttons.insertLeftButton.onclick =  () => buttons.insertLeft(selectedNode, rememberCuttedNodes)
              buttons.insertRightButton.onclick =  () => buttons.insertRight(selectedNode, rememberCuttedNodes)
              buttons.cutOuterHtmlButton.onclick = () => {
                if (selectedNode) {
                  rememberCuttedNodes.push({ node: selectedNode, parent: selectedNode.parentElement, index: this.convert("node/index", selectedNode)})
                  selectedNode.remove()
                }
              }
              buttons.copyOuterHtmlButton.onclick = () => buttons.addOuterHtmlToClipboard(selectedNode)
              buttons.pasteOuterHtmlButton.onclick = () => buttons.appendClipboardToNode(selectedNode)
              buttons.copyStyleButton.onclick = () => buttons.addStyleToClipboard(selectedNode)
              buttons.pasteStyleButton.onclick = () => buttons.addClipboardToStyle(selectedNode)
              buttons.removeStyleButton.onclick = () => buttons.toggleAttribute("style", selectedNode)
              buttons.removeInnerButton.onclick = () => buttons.toggleTextContent(selectedNode)
              buttons.removeInnerWithTextButton.onclick = () => buttons.replaceTextContentWithPrompt(selectedNode)
              buttons.removeNodeButton.onclick = () => buttons.toggleNode(selectedNode)
              buttons.idButton.onclick = () => buttons.setIdWithPrompt(selectedNode)
              buttons.addClassButton.onclick = () => buttons.setClassWithPrompt(selectedNode)
              buttons.setAttributeButton.onclick = () => buttons.setAttributeWithPrompt(selectedNode)
              buttons.appendStyleButton.onclick = () => buttons.appendStyleWithPrompt(selectedNode)
              buttons.fontSizeForEachChildButton.onclick = () => buttons.setChildrenStyleWithPrompt("fontSize", selectedNode, "Gebe die Schriftgrüße für alle Kind Elemente: (z.B., 21px)")

              const svgIconsFragment = await buttons.svgIcons.appendSvgIconsFragment(buttons.svgPickerOptions, (button) => {
                selectedNode.appendChild(button.querySelector(".icon").cloneNode(true))
              })

            })
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "html-feedback") {

      const feedback = this.fn("feedback")
      feedback.bodyButton()
    }

    if (event === "event/click-funnel") {

      document.querySelectorAll(".click-funnel").forEach(funnel => {

        const startButton = funnel.querySelector(".start-click-funnel-button")

        if (startButton.onclick === null) {
          startButton.onclick = () => {

            startButton.style.display = "none"

            const questions = []
            for (let i = 0; i < funnel.children.length; i++) {
              const child = funnel.children[i]
              if (child.classList.contains("click-field")) {
                questions.push(child)
                child.style.display = "flex"
                break
              }
            }

            if (questions.length <= 0) {
              this.add("click-funnel/end", funnel)
              return
            }
          }
        }

        for (let i = 0; i < funnel.children.length; i++) {
          const child = funnel.children[i]

          if (child.classList.contains("click-field")) {

            child.querySelectorAll(".answer-box").forEach(box => {

              if (box.onclick === null) {

                box.onclick = () => {

                  child.style.display = "none"

                  box.querySelectorAll(".answer").forEach(answer => {
                    answer.setAttribute("clicked", true)
                  })

                  if (child.nextSibling === null) {

                    this.add("click-funnel/end", funnel)

                    return

                  }

                  if (box.hasAttribute("onclick-condition")) {
                    const condition = JSON.parse(box.getAttribute("onclick-condition"))

                    if (condition.action === "skip") {
                      try {
                        this.skipSiblings(parseInt(condition.skip) + 1, child)

                        return
                      } catch (error) {

                        this.add("click-funnel/end", funnel)

                        return

                      }
                    }

                    if (condition.action === "path") {
                      window.location.assign(condition.path)
                      return
                    }

                  }

                  child.nextSibling.style.display = "flex"

                }

              }



            })

          }

        }

      })

    }

    if (event === "underline-hover/node") {
      input.addEventListener("mouseover", () => {
        input.style.textDecoration = "underline"
      })

      input.addEventListener("mouseout", () => {
        input.style.textDecoration = null
      })
    }

    if (event === "click-funnel/end") {

      const endButton = input.querySelector(".end-click-funnel-button")
      const buttonIcon = endButton.children[0]
      const buttonText = endButton.children[1]

      if (endButton.onclick === null) {

        endButton.onclick = () => {

          const funnelTag = input.id

          if (!this.verifyIs("text/tag", funnelTag)) {
            window.alert("Funnel Id ist ungültig.")
            throw new Error("id not a tag")
          }

          const map = {}
          input.querySelectorAll(".click-field").forEach(field => {
            field.querySelectorAll(".answer").forEach(answer => {
              if (answer.getAttribute("clicked") === "true") {
                map[field.id] = answer.textContent
              }
            })
          })

          this.overlay("toolbox", async securityOverlay => {
            this.create("info/loading", securityOverlay)

            const res = await this.request("/register/location/list-self/", {tag: funnelTag, map})

            if (res.status === 200) {

              buttonIcon.textContent = ""
              this.render("icon/node/path", "/public/check-animated.svg", buttonIcon)
              buttonText.textContent = "Erfolgreich"

              endButton.onclick = () => window.location.reload()

              window.alert("Ihre Daten wurden erfolgreich gespeichert.")

              if (input.hasAttribute("next-path")) {
                window.location.assign(input.getAttribute("next-path"))
              }

              securityOverlay.remove()


            } else {
              window.alert("Fehler.. Bitte wiederholen.")

              buttonIcon.textContent = ""
              this.render("icon/node/path", "/public/exclamation-triangle.svg", buttonIcon)
              buttonText.textContent = "Fehler"

              endButton.onclick = () => window.location.reload()

              securityOverlay.remove()
            }
          })


        }

      }

      endButton.style.display = "flex"

    }

    if (event === "icon/touch") {
      this.render("icon/node/path", "/public/touch.svg").then(icon => {
        icon.classList.add("touch")
        icon.style.marginLeft = "21px"
        input?.querySelectorAll(".icon.touch").forEach(it => it.remove())
        input?.append(icon)
      })
    }

    if (event === "id-onbody") {
      const node = document.getElementById(input.id)
      if (!node) {
        document.body.appendChild(input)
        window.alert("Element wurde erfolgreich anhgehängt.")
      } else {
        window.alert("Element existiert bereits.")
      }
    }

    if (event === "role-login") {

      const submit = document.querySelector(".start-login-event")
      const emailInput = document.querySelector(".email-input")
      const dsgvoInput = document.querySelector(".dsgvo-input")
      const emailField = emailInput.closest(".field")
      const dsgvoField = dsgvoInput.closest(".field")
      this.convert("dark-light", emailField)
      this.convert("dark-light", dsgvoField)
      this.verify("input/value", emailInput)
      this.verify("input/value", dsgvoInput)
      this.add("input/value", emailInput)
      this.add("oninput/verify-input", emailInput)
      this.add("oninput/verify-input", dsgvoInput)
      this.add("outline-hover", emailInput)
      this.add("outline-hover", submit)
      for (let i = 0; i < dsgvoField.querySelectorAll(".button").length; i++) {
        const child = dsgvoField.querySelectorAll(".button")[i]
        this.add("outline-hover", child)
      }
      submit.onclick = async () => {
        await this.verify("input/value", emailInput)
        await this.verify("input/value", dsgvoInput)
        await this.callback("email/pin-verified", emailInput.value, async () => {
          const res = await this.request("/register/email/location/", {id: input.id, email: emailInput.value, name: input.name})
          {
            const res = await this.request("/register/session/")
            if (res.status === 200) {
              const res = await this.request("/redirect/user/closed/")
              if (res.status === 200) window.location.assign(res.response)
            } else {
              window.history.back()
            }
          }
        })
      }
    }

    if (event === "script/click-funnel-event") {

      const script = this.create(event)

      if (input !== undefined) {
        document.querySelectorAll(`#${script.id}`).forEach(script => script.remove())
        input.append(script)
      }

      return script

    }

    if (event === "script/toolbox-getter") {

      return new Promise(async(resolve) => {
        const script = document.createElement("script")
        script.id = "toolbox-getter"
        script.type = "module"
        script.textContent = 'import {Helper} from "/js/Helper.js"\nawait Helper.add("toolbox/onbody")'
        if (document.body) {
          document.querySelectorAll("#toolbox-getter").forEach(getter => getter.remove())
          document.body.appendChild(script)
          resolve(script)
        } else {
          await this.add("ms/timeout", 3000)
          await this.add("script/toolbox-getter")
        }
      })
    }

    if (event === "script-onbody") {
      const exist = document.getElementById(input.id)
      if (exist) {
        exist.remove()
        document.body.appendChild(input)
      } else {
        document.body.appendChild(input)
      }
    }

    if (event === "session-login") {

      this.convert("dark-light", input)
      const backButton = this.create("back-button", input)
      this.convert("dark-light", backButton)
      const app = this.create("button/getyour", input)
      this.convert("dark-light", app)
      app.addEventListener("click", () => {
        this.overlay("popup", overlay => {
          const content = this.create("div/scrollable", overlay)
          this.render("nav/open", content)
        })
      })
      this.render("text/h1", "Login", input)
      const info = this.create("info/success", input)
      info.style.fontSize = "21px"
      const div1 = this.createNode("div", info, "Unser Login Prozess ist intuitiv gestaltet und erfordert nur wenige Klicks. Du musst lediglich Deine E-Mail Adresse eingeben, um dich einzuloggen. Wir möchten, dass Du den Login Prozess als einfach und stressfrei erlebst.")
      const a1 = this.createNode("a", div1, "Wenn Du Probleme hast oder Hilfe benötigst, stehen wir Dir jederzeit zur Verfügung, um Dir schnell und effektiv weiter zu helfen.")
      a1.className = "button"
      a1.href = "mailto:datenschutz@get-your.de"
      const div2 = this.createNode("div", info, "Die Plattform von getyour soll ein sicheres und vertrauenswürdiges Umfeld bieten, damit Du dich auf Deine Daten verlassen kannst.")
      div2.style.marginTop = "13px"
      const funnel = this.create("field-funnel/login", input)
      for (let i = 0; i < document.links.length; i++) {
        const link = document.links[i]
        this.convert("link-colors", link)
      }
      const emailInput = funnel.querySelector(".email-input")
      const dsgvoInput = funnel.querySelector(".dsgvo-input")
      this.verify("input/value", emailInput)
      this.verify("input/value", dsgvoInput)
      this.add("oninput/verify-input", emailInput)
      this.add("oninput/verify-input", dsgvoInput)
      this.add("input/value", emailInput)
      funnel.submit.onclick = async () => {
        await this.verify("input/value", emailInput)
        await this.verify("input/value", dsgvoInput)
        this.callback("email/pin-verified", emailInput.value, async () => {
          const res = await this.request("/register/session/")
          if (res.status === 200) {
            const res = await this.request("/redirect/user/closed/")
            if (res.status === 200) {
              window.location.assign(res.response)
            } else if (!Helper.verifyIs("text/empty", document.referrer)) {
              window.location.assign(document.referrer)
            } else {
              window.history.back()
            }
          } else {
            window.history.back()
          }
        })
      }
    }

    if (event === "style/node/not-valid") {

      const color = this.colors.light.error
      input.style.border = `2px solid ${color}`
      if (input.type === "checkbox") {
        input.style.outline = `2px solid ${color}`
      }
      input.style.borderRadius = "3px"
      const signs = input.parentNode.querySelectorAll("div[class='sign']")
      if (signs.length === 0) {
        const sign = document.createElement("div")
        sign.classList.add("sign")
        sign.textContent = "x"
        sign.style.position = "absolute"
        sign.style.right = "34px"
        sign.style.color = color
        sign.style.fontSize = "34px"
        sign.style.fontFamily = "sans-serif"
        input.parentNode.append(sign)
        return input
      }
      if (signs.length > 0) {
        signs.forEach(sign => sign.remove())
        const sign = document.createElement("div")
        sign.classList.add("sign")
        sign.textContent = "x"
        sign.style.position = "absolute"
        sign.style.right = "34px"
        sign.style.color = color
        sign.style.fontSize = "34px"
        sign.style.fontFamily = "sans-serif"
        input.parentNode.append(sign)
        return input
      }
      return input
    }

    if (event === "style/node/valid") {
      input.style.border = "2px solid #00c853"
      if (input.type === "checkbox") {
        input.style.outline = "2px solid #00c853"
      }
      input.style.borderRadius = "3px"
      const signs = input.parentNode.querySelectorAll("div[class='sign']")
      if (signs.length === 0) {
        const sign = document.createElement("div")
        sign.classList.add("sign")

        sign.textContent = "✓"
        sign.style.position = "absolute"
        sign.style.right = "34px"
        sign.style.color = "#00c853"
        sign.style.fontSize = "34px"
        sign.style.fontFamily = "sans-serif"
        input.parentNode.append(sign)
        return input
      }
      if (signs.length > 0) {
        signs.forEach(sign => sign.remove())
        const sign = document.createElement("div")
        sign.classList.add("sign")

        sign.textContent = "✓"
        sign.style.position = "absolute"
        sign.style.right = "34px"
        sign.style.color = "#00c853"
        sign.style.fontSize = "34px"
        sign.style.fontFamily = "sans-serif"
        input.parentNode.append(sign)
        return input
      }
      return input
    }

    if (event === "button/network") {

      const button = this.create("button/left-right")
      button.left.textContent = ".network"
      button.right.textContent = "Nutze die Macht deines Netzwerks"
      button.onclick = () => {
        this.overlay("popup", async nextStepOverlay => {
          this.render("text/bottom-left", ".network", nextStepOverlay)
          this.render("text/h1", "Nächste Schritte", nextStepOverlay)
          const updateNext = this.render("text/link", "Aktualisieren", nextStepOverlay)
          updateNext.style.justifyContent = "flex-start"
          updateNext.style.width = "233px"
          updateNext.style.margin = "0 34px"

          const nextList = this.create("div/scrollable", nextStepOverlay)
          this.render("contacts/node/next-list", nextList)
          updateNext.onclick = async () => {
            await this.render("contacts/node/next-list", nextList)
          }
          const app = this.create("button/getyour", nextStepOverlay)

          app.onclick = () => {
            this.overlay("popup", async networkFunctionsOverlay => {
              this.render("text/bottom-left", ".network.functions", networkFunctionsOverlay)
              const buttons = this.create("div/scrollable", networkFunctionsOverlay)
              {
                const button = this.create("button/left-right", buttons)
                button.left.textContent = ".contacts"
                button.right.textContent = "Meine Kontakte"
                button.onclick = () => {
                  this.overlay("popup", async overlay => {
                    const searchField = this.create("field/text", overlay)
                    searchField.label.textContent = "Filter nach E-Mail Adresse oder Notizen"
                    searchField.input.placeholder = "text jetzt suchen.."
                    searchField.style.margin = "21px 34px 5px 34px"
                    this.verify("input/value", searchField.input)
                    this.add("outline-hover", searchField.input)

                    const container = this.create("div", overlay)
                    container.style.display = "flex"
                    container.style.flexWrap = "wrap"
                    container.style.margin = "5px 34px"
                    const importButton = this.render("text/link", "Importieren", container)
                    const exportButton = this.render("text/link", "Exportieren", container)
                    const sendTemplateButton = this.render("text/link", "Template senden", container)

                    importButton.onclick = () => {
                      this.overlay("popup", overlay => {
                        const funnel = this.create("div/scrollable", overlay)

                        const contactsField = this.create("field/textarea", funnel)
                        contactsField.label.textContent = "Meine JavaScript Kontaktliste"
                        contactsField.input.style.fontFamily = "monospace"
                        contactsField.input.style.height = "55vh"
                        contactsField.input.setAttribute("required", "true")
                        contactsField.input.oninput = () => this.verify("input/value", contactsField.input)
                        this.add("outline-hover", contactsField.input)
                        this.verify("input/value", contactsField.input)
                        contactsField.input.placeholder = `[
{
  created: 1706575455693, // id, einzigartig
  email: "neuer@kontakt.de", // id, einzigartig
  alias: "Kontakt Name",  // optional
  birthday: "1999-03-21", // optional
  status: "kontakt status", // optional
  notes: "Kontakt Notizen", // optional
  phone: "+123456789", // optional
  website: "https://www.kontakt-webseite.de/" // optional
},

.
.

]
                        `

                        const submit = this.render("text/node/action-button", "Kontakte jetzt importieren", funnel)
                        submit.onclick = async () => {
                          await this.verify("input/value", contactsField.input)

                          const contacts = JSON.parse(contactsField.input.value)

                          for (let i = 0; i < contacts.length; i++) {
                            const contact = contacts[i]
                            if (!contact.created || !contact.email) {
                              this.add("style/node/not-valid", contactsField.input)
                              window.alert("Deine Kontaktliste ist in einem ungültigen Format.")
                              throw new Error("contact list not valid")
                            }
                          }

                          this.overlay("security", async securityOverlay => {
                            const res = await this.request("/register/contacts/js-list-self/", {contacts})
                            if (res.status === 200) {
                              window.alert("Deine Kontakte wurden erfolgreich importiert.")
                              this.convert("parent/loading", contactsDiv)
                              await getAndRenderContacts(contactsDiv)
                              overlay.remove()
                              securityOverlay.remove()
                            }
                          })


                        }

                      })
                    }

                    sendTemplateButton.onclick = () => {
                      this.overlay("popup", async overlay => {
                        const searchField = this.create("field/text", overlay)
                        const h2 = this.createNode("h2", searchField.label, "Wähle ein Template")
                        h2.style.margin = "0"
                        searchField.input.placeholder = "Suche nach Text in deinem Template"
                        searchField.style.margin = "21px 34px"
                        this.verify("input/value", searchField.input)
                        this.add("outline-hover", searchField.input)
                        const contactsDiv = this.create("div/scrollable", overlay)
                        const res = await this.request("/get/templates/closed/")
                        if (res.status === 200) {
                          const templates = JSON.parse(res.response)
                          let filtered
                          searchField.input.oninput = async (ev) => {
                            filtered = templates.filter(it => it.html.toLowerCase().includes(ev.target.value.toLowerCase()))
                            const highlighted = filtered.map(it => {
                              const highlightedHtml = it.html.replace(new RegExp(ev.target.value, 'i'), `<mark>${ev.target.value}</mark>`)
                              return { ...it, html: highlightedHtml }
                            })
                            await this.render("templates/node/send-html", highlighted, contactsDiv)
                          }
                          await this.render("templates/node/send-html", templates, contactsDiv)
                        } else {
                          this.convert("parent/info", contactsDiv)
                          contactsDiv.textContent = "Keine Templates gefunden"
                        }
                      })
                    }
                    const contactsDiv = this.create("div/scrollable", overlay)

                    async function getAndRenderContacts(parent) {
                      const res = await Helper.request("/get/contacts/self/")
                      if (res.status === 200) {
                        const contacts = JSON.parse(res.response)
                        renderContactButtons(contacts, parent)
                      } else {
                        Helper.convert("parent/info", parent)
                        parent.textContent = "Keine Kontakte gefunden"
                      }
                    }

                    function concatEmailAndNotes(array, key) {
                      return array.map(it => {
                        if (it.email && it.notes) {
                          return { ...it, [key]: `${it.email},${it.notes}` }
                        } else {
                          return it
                        }
                      })
                    }

                    const websiteIcon = await this.convert("path/icon", "/public/website.svg")
                    const phoneIcon = await this.convert("path/icon", "/public/phone-out.svg")
                    const emailIcon = await this.convert("path/icon", "/public/email-out.svg")
                    function renderContactButtons(contacts, parent = null, query = "") {
                      const fragment = document.createDocumentFragment()

                      Helper.convert("parent/scrollable", parent)
                      for (let i = 0; i < contacts.length; i++) {
                        const contact = contacts[i]
                        const contactButton = Helper.create("button/left-right", fragment)
                        contactButton.left.style.width = "55%"

                        let text = contact.email
                        if (contact.text) text = contact.text
                        if (query === "") text = contact.email

                        while (contactButton.left.firstChild) {
                          contactButton.left.removeChild(contactButton.left.firstChild)
                        }

                        Helper.convert("text/marked", {text, query, parent: contactButton.left})

                        if (contact.alias !== undefined) {
                          Helper.createNode("div", contactButton.left, contact.alias)
                          const div = Helper.createNode("div", contactButton.left, contact.email)
                          Helper.style(div, {fontSize: "13px"})
                        }
                        contactButton.right.style.display = "flex"
                        if (contact.website) {
                          const clone = websiteIcon.cloneNode(true)
                          clone.style.padding = "5px"
                          contactButton.right.appendChild(clone)
                          Helper.add("outline-hover", clone)
                          clone.onclick = () => {
                            window.open(contact.website, "_blank")
                          }
                        }
                        if (contact.phone) {
                          const clone = phoneIcon.cloneNode(true)
                          clone.style.padding = "5px"
                          contactButton.right.appendChild(clone)
                          Helper.add("outline-hover", clone)
                          clone.onclick = () => {
                            window.location.href = `tel:${contact.phone}`
                          }
                        }
                        if (contact.email) {
                          const clone = emailIcon.cloneNode(true)
                          clone.style.padding = "5px"
                          contactButton.right.appendChild(clone)
                          Helper.add("outline-hover", clone)
                          clone.onclick = () => {
                            window.location.href = `mailto:${contact.email}`
                          }
                        }
                        contactButton.onclick = () => {
                          Helper.overlay("popup", async updateOverlay => {
                            Helper.create("header/info", updateOverlay).textContent = contact.email
                            const buttons = Helper.create("div/scrollable", updateOverlay)

                            {
                              const button = Helper.create("button/left-right", buttons)
                              button.left.textContent = ".email"
                              button.right.textContent = "Aktualisiere die E-Mail Adresse deines Kontakts"
                              button.onclick = () => {
                                Helper.overlay("popup", overlay => {
                                  overlay.info.textContent = contact.email
                                  const funnel = Helper.create("div/scrollable", overlay)

                                  const emailField = Helper.create("field/text", funnel)
                                  emailField.label.textContent = "E-Mail Adresse"
                                  emailField.input.setAttribute("required", "true")
                                  if (contact.email !== undefined) {
                                    emailField.input.value = contact.email
                                  }
                                  Helper.verify("input/value", emailField.input)
                                  Helper.add("outline-hover", emailField.input)
                                  emailField.input.oninput = () => Helper.verify("input/value", emailField.input)

                                  const submit = Helper.create("button/action", funnel)
                                  Helper.add("outline-hover", submit)
                                  submit.textContent = "E-Mail jetzt speichern"
                                  submit.onclick = async () => {
                                    await Helper.verify("input/value", emailField.input)

                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/contacts/email-update/", {id: contact.created, email: emailField.input.value})
                                      if (res.status === 200) {
                                        window.alert("E-Mail erfolgreich gespeichert.")
                                        await getAndRenderContacts(parent)
                                        overlay.remove()
                                        updateOverlay.remove()
                                        securityOverlay.remove()
                                      } else {
                                        window.alert("Fehler.. Bitte wiederholen.")
                                        securityOverlay.remove()
                                      }
                                    })

                                  }

                                })
                              }
                            }

                            {
                              const button = Helper.create("button/left-right", buttons)
                              button.left.textContent = ".alias"
                              button.right.textContent = "Gib deinem Kontakt einen alternativen Namen"
                              button.onclick = () => {
                                Helper.overlay("popup", overlay => {
                                  Helper.create("header/info", overlay).textContent = contact.email

                                  const funnel = Helper.create("div/scrollable", overlay)

                                  const aliasField = Helper.create("field/text", funnel)
                                  aliasField.label.textContent = "Alternative Bezeichnung für deinen Kontakt"
                                  aliasField.input.setAttribute("required", "true")
                                  if (contact.alias !== undefined) {
                                    aliasField.input.value = contact.alias
                                  }
                                  Helper.verify("input/value", aliasField.input)
                                  Helper.add("outline-hover", aliasField.input)
                                  aliasField.input.oninput = () => Helper.verify("input/value", aliasField.input)


                                  const submit = Helper.create("button/action", funnel)
                                  Helper.add("outline-hover", submit)
                                  submit.textContent = "Alias jetzt speichern"
                                  submit.onclick = async () => {

                                    await Helper.verify("input/value", aliasField.input)

                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/contacts/alias-self/", {id: contact.created, alias: aliasField.input.value})
                                      if (res.status === 200) {
                                        window.alert("Alias erfolgreich gespeichert.")
                                        await getAndRenderContacts(parent)
                                        overlay.remove()
                                        updateOverlay.remove()
                                        securityOverlay.remove()
                                      } else {
                                        window.alert("Fehler.. Bitte wiederholen.")
                                        securityOverlay.remove()
                                      }
                                    })

                                  }

                                })
                              }
                            }

                            {
                              const button = Helper.create("button/left-right", buttons)
                              button.left.textContent = ".character"
                              button.right.textContent = "Erfahre mehr über deinen Kontakt"
                              button.onclick = () => {
                                Helper.overlay("popup", overlay => {
                                  Helper.create("header/info", overlay).textContent = contact.email
                                  const funnel = Helper.create("div", overlay)

                                  const dateField = Helper.create("field/date", funnel)
                                  dateField.label.textContent = "Gebe das Geburtsdatum deines Kontakts ein"
                                  dateField.input.placeholder = "yyyy-mm-dd"
                                  Helper.add("outline-hover", dateField.input)
                                  let birthday
                                  if (contact.birthday) {
                                    const split = contact.birthday.split("T")
                                    dateField.input.value = split[0]
                                    birthday = split[0]
                                  }
                                  dateField.input.setAttribute("required", "true")
                                  Helper.verify("input/value", dateField.input)

                                  const submit = Helper.render("text/node/action-button", "Geburtsdatum jetzt speichern", funnel)
                                  Helper.add("outline-hover", submit)
                                  submit.onclick = async () => {
                                    await Helper.verify("input/value", dateField.input)

                                    const date = new Date(dateField.input.value)

                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/contacts/birthday-self/", {id: contact.created, birthday: date.toISOString()})
                                      if (res.status === 200) {
                                        window.alert("Geburtsdatum erfolgreich gespeichert.")
                                        await getAndRenderContacts(parent)
                                        overlay.remove()
                                        updateOverlay.remove()
                                        securityOverlay.remove()
                                      } else {
                                        window.alert("Fehler.. Bitte wiederholen.")
                                        securityOverlay.remove()
                                      }
                                    })

                                  }

                                  if (!Helper.verifyIs("text/empty", birthday)) {
                                    const numerology = Helper.create("div/scrollable", overlay)

                                    if (contact.alias) {
                                      Helper.render("text/hr", `Numerologie von ${contact.alias}`, numerology)
                                    } else {
                                      Helper.render("text/hr", `Numerologie von ${contact.email}`, numerology)
                                    }

                                    const date = birthday.split("T")[0]
                                    const master = Helper.convert("date/master", date)

                                    highlightResult(`Lebensweg: ${Helper.convert("date/life-path-calc-text", date)} = ${master.toString().split('').join(' + ')} =`, Helper.convert("date/life-path", date), numerology)
                                    function highlightResult(prefix, result, parent) {
                                      const fragment = document.createDocumentFragment()
                                      const div = document.createElement("div")
                                      Helper.style(div, {fontSize: "21px", margin: "21px 34px", fontFamily: "sans-serif"})
                                      Helper.convert("text/dark-light", div)
                                      fragment.appendChild(div)
                                      const span1 = document.createElement("span")
                                      div.appendChild(span1)
                                      span1.textContent = prefix
                                      const span2 = document.createElement("span")
                                      div.appendChild(span2)
                                      span2.style.fontSize = "34px"
                                      span2.style.marginLeft = "8px"
                                      span2.textContent = result
                                      parent?.appendChild(fragment)
                                      return fragment
                                    }
                                    if (master === 11 || master === 22 || master === 33) {
                                      highlightResult("Masterzahl:", master, numerology)
                                    }
                                    const dateNumbers = date.match(/\d/g).map(Number)
                                    dateNumbers.push(Helper.convert("date/life-path", date))
                                    master.toString().split("").forEach(digit => dateNumbers.push(parseInt(digit)))
                                    const missingNumbers = [];
                                    for (let i = 1; i <= 9; i++) {
                                      if (!dateNumbers.includes(i)) {
                                        missingNumbers.push(i);
                                      }
                                    }
                                    if (missingNumbers.length > 0) {
                                      highlightResult("Fehlende Zahlen:", missingNumbers.join(", "), numerology)
                                    }
                                  }

                                })
                              }
                            }

                            {
                              const button = Helper.create("button/left-right", buttons)
                              button.left.textContent = ".status"
                              button.right.textContent = "Gib deinem Kontakt einen Status"
                              button.onclick = () => {
                                Helper.overlay("popup", overlay => {
                                  Helper.create("header/info", overlay).textContent = contact.email

                                  const funnel = Helper.create("div/scrollable", overlay)

                                  const statusField = Helper.create("field/text", funnel)
                                  Helper.add("outline-hover", statusField.input)
                                  statusField.label.textContent = "Vergebe einen Status Wert"
                                  statusField.input.setAttribute("required", "true")
                                  if (contact.status !== undefined) {
                                    statusField.input.value = contact.status
                                  }
                                  Helper.verify("input/value", statusField.input)
                                  statusField.input.oninput = () => Helper.verify("input/value", statusField.input)

                                  const submit = Helper.create("button/action", funnel)
                                  Helper.add("outline-hover", submit)
                                  submit.textContent = "Status jetzt speichern"
                                  submit.onclick = async () => {

                                    await Helper.verify("input/value", statusField.input)

                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/contacts/status-self/", {id: contact.created, status: statusField.input.value})
                                      if (res.status === 200) {
                                        window.alert("Status erfolgreich gespeichert.")
                                        await getAndRenderContacts(parent)
                                        overlay.remove()
                                        updateOverlay.remove()
                                        securityOverlay.remove()
                                      } else {
                                        window.alert("Fehler.. Bitte wiederholen.")
                                        securityOverlay.remove()
                                      }
                                    })
                                  }

                                })
                              }
                            }

                            {
                              const button = Helper.create("button/left-right", buttons)
                              button.left.textContent = ".notes"
                              button.right.textContent = "Mache dir Notizen zu deinem Kontakt"
                              button.onclick = () => {
                                Helper.overlay("popup", overlay => {
                                  overlay.info.textContent = contact.email

                                  const funnel = Helper.create("div/scrollable", overlay)

                                  const notesField = Helper.create("field/textarea", funnel)
                                  Helper.add("outline-hover", notesField.input)
                                  notesField.label.textContent = "Notizen"
                                  notesField.input.style.height = "55vh"
                                  if (contact.notes !== undefined) {
                                    notesField.input.value = contact.notes
                                  }
                                  Helper.verify("input/value", notesField.input)
                                  notesField.input.oninput = () => Helper.verify("input/value", notesField.input)

                                  const submit = Helper.create("button/action", funnel)
                                  Helper.add("outline-hover", submit)
                                  submit.textContent = "Notizen jetzt speichern"
                                  submit.onclick = async () => {

                                    await Helper.verify("input/value", notesField.input)

                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/contacts/notes-self/", {id: contact.created, notes: notesField.input.value})

                                      if (res.status === 200) {
                                        window.alert("Notizen erfolgreich gespeichert.")
                                        await getAndRenderContacts(parent)
                                        overlay.remove()
                                        updateOverlay.remove()
                                        securityOverlay.remove()
                                      } else {
                                        window.alert("Fehler.. Bitte wiederholen.")
                                        securityOverlay.remove()
                                      }
                                    })

                                  }

                                })
                              }
                            }

                            {
                              const button = Helper.create("button/left-right", buttons)
                              button.left.textContent = ".phone"
                              button.right.textContent = "Gib die Telefon Nummer deines Kontakts ein"
                              button.onclick = () => {
                                Helper.overlay("popup", overlay => {
                                  Helper.create("header/info", overlay).textContent = contact.email

                                  const funnel = Helper.create("div/scrollable", overlay)

                                  const phoneField = Helper.create("field/tel", funnel)
                                  phoneField.label.textContent = "Telefon Nummer"
                                  phoneField.input.setAttribute("required", "true")
                                  phoneField.input.setAttribute("accept", "text/tel")
                                  if (contact.phone !== undefined) {
                                    phoneField.input.value = contact.phone
                                  }
                                  Helper.verify("input/value", phoneField.input)
                                  Helper.add("outline-hover", phoneField.input)
                                  phoneField.input.oninput = () => Helper.verify("input/value", phoneField.input)


                                  const submit = Helper.create("button/action", funnel)
                                  Helper.add("outline-hover", submit)
                                  submit.textContent = "Nummer jetzt speichern"
                                  submit.onclick = async () => {

                                    await Helper.verify("input/value", phoneField.input)

                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/contacts/phone-self/", {id: contact.created, phone: phoneField.input.value})

                                      if (res.status !== 200) {
                                        window.alert("Fehler.. Bitte wiederholen.")
                                        securityOverlay.remove()
                                      }

                                      if (res.status === 200) {
                                        window.alert("Telefon Nummer erfolgreich gespeichert.")

                                        const res = await Helper.request("/get/contacts/self/")
                                        if (res.status !== 200) {
                                          Helper.convert("parent/info", parent)
                                          parent.textContent = "Keine Kontakte gefunden"
                                        }
                                        if (res.status === 200) {
                                          const contacts = JSON.parse(res.response)
                                          Helper.render(event, contacts, parent)
                                        }

                                        overlay.remove()
                                        updateOverlay.remove()
                                        securityOverlay.remove()
                                      }
                                    })

                                  }

                                })
                              }
                            }

                            {
                              const button = Helper.create("button/left-right", buttons)
                              button.left.textContent = ".website"
                              button.right.textContent = "Gib die Webseite deines Kontakts ein"
                              button.onclick = () => {
                                Helper.overlay("popup", overlay => {
                                  Helper.create("header/info", overlay).textContent = contact.email

                                  const funnel = Helper.create("div/scrollable", overlay)

                                  const websiteField = Helper.create("field/text", funnel)
                                  websiteField.label.textContent = "Webseite"
                                  websiteField.input.setAttribute("required", "true")
                                  if (contact.website !== undefined) {
                                    websiteField.input.value = contact.website
                                  }
                                  Helper.verify("input/value", websiteField.input)
                                  Helper.add("outline-hover", websiteField.input)
                                  websiteField.input.oninput = () => Helper.verify("input/value", websiteField.input)


                                  const submit = Helper.create("button/action", funnel)
                                  Helper.add("outline-hover", submit)
                                  submit.textContent = "Webseite jetzt speichern"
                                  submit.onclick = async () => {

                                    await Helper.verify("input/value", websiteField.input)

                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/contacts/website-self/", {id: contact.created, website: websiteField.input.value})

                                      if (res.status !== 200) {
                                        window.alert("Fehler.. Bitte wiederholen.")
                                        securityOverlay.remove()
                                      }

                                      if (res.status === 200) {
                                        window.alert("Webseite erfolgreich gespeichert.")
                                        await getAndRenderContacts(parent)
                                        overlay.remove()
                                        updateOverlay.remove()
                                        securityOverlay.remove()
                                      }
                                    })

                                  }

                                })
                              }
                            }

                            {
                              const res = await Helper.request("/verify/user/expert/")
                              if (res.status === 200) {
                                const button = Helper.create("button/left-right", buttons)
                                button.left.textContent = ".promote"
                                button.right.textContent = "Erhalte Zugang zu unendlich vielen Möglichkeiten"
                                button.onclick = () => {
                                  Helper.overlay("popup", async overlay => {
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
                                    Helper.add("outline-hover", searchField.input)
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
                                        Helper.overlay("popup", async overlay => {
                                          overlay.info.textContent = contact.email + "." + fieldFunnel.id
                                          const create = Helper.create("button/left-right", overlay)
                                          create.left.textContent = ".create"
                                          create.right.textContent = Helper.convert("text/capital-first-letter", fieldFunnel.id) + " definieren"
                                          create.onclick = () => {
                                            Helper.overlay("popup", async overlay => {
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
                                                  Helper.overlay("security", async securityOverlay => {
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
                                          const locationList = Helper.create("info/loading", overlay)
                                          await Helper.render("location-list/node/email-expert", {tag: fieldFunnel.id, email: contact.email, path: pathField.input.value}, locationList)
                                        })
                                      }
                                    }
                                  })
                                }
                              }
                            }
                            {
                              const button = Helper.create("button/left-right", buttons)
                              button.left.textContent = ".delete"
                              button.right.textContent = "Kontakt entfernen"
                              button.onclick = () => {
                                const confirm = window.confirm("Möchtest du deinen Kontakt wirklich entfernen?")
                                if (confirm === true) {
                                  Helper.overlay("security", async securityOverlay => {
                                    const res = await Helper.request("/remove/contacts/id-self/", {id: contact.created})
                                    if (res.status === 200) {
                                      window.alert("Kontakt erfolgreich entfernt.")
                                      contactButton.remove()
                                      updateOverlay.remove()
                                      securityOverlay.remove()
                                    }
                                    if (res.status !== 200) {
                                      window.alert("Fehler.. Bitte wiederholen.")
                                      securityOverlay.remove()
                                    }
                                  })
                                }
                              }
                            }
                          })
                        }
                      }

                      parent?.appendChild(fragment)
                    }

                    const res = await this.request("/get/contacts/self/")
                    let filtered
                    if (res.status === 200) {
                      const contacts = JSON.parse(res.response)

                      exportButton.onclick = () => {
                        if (filtered) {
                          this.convert("text/clipboard", JSON.stringify(filtered))
                          .then(() => window.alert("JavaScript Kontaktliste wurde erfolgreich in die Zwischenablage gespeichert."))
                        } else {
                          this.convert("text/clipboard", JSON.stringify(contacts))
                          .then(() => window.alert("JavaScript Kontaktliste wurde erfolgreich in die Zwischenablage gespeichert."))
                        }
                      }

                      searchField.input.oninput = (ev) => {
                        const prepared = concatEmailAndNotes(contacts, "text")
                        filtered = prepared.filter(it => {
                          const check = it.text ? it.text : it.email
                          return check.toLowerCase().includes(ev.target.value.toLowerCase())
                        })
                        renderContactButtons(filtered, contactsDiv, ev.target.value)
                      }

                      renderContactButtons(contacts, contactsDiv)
                    } else {
                      this.convert("parent/info", contactsDiv)
                      parent.textContent = "Keine Kontakte gefunden"
                    }

                    const addButton = this.create("button/add", overlay)
                    addButton.onclick = () => {

                      this.overlay("popup", overlay => {
                        this.render("text/h1", "Neuen Kontakt erstellen", overlay)

                        const funnel = this.create("div/scrollable", overlay)

                        const emailField = this.create("field/email", funnel)
                        emailField.label.textContent = "Welche E-Mail Adresse möchtest du zu deiner Kontaktliste hinzufügen"
                        emailField.input.placeholder = "neue@email.de"
                        this.verify("input/value", emailField.input)
                        emailField.input.oninput = () => this.verify("input/value", emailField.input)

                        const submit = this.create("button/action", funnel)
                        submit.textContent = "Kontakt jetzt speichern"
                        submit.onclick = async () => {
                          await this.verify("input/value", emailField.input)

                          this.overlay("security", async securityOverlay => {
                            const res = await this.request("/register/contacts/email-self/", {email: emailField.input.value})
                            if (res.status === 200) {
                              window.alert("Kontakt erfolgreich gespeichert.")
                              await getAndRenderContacts(parent)
                              securityOverlay.remove()
                              overlay.remove()
                            } else {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }
                          })

                        }

                      })
                    }

                  })
                }
              }
              {
                const button = this.create("button/left-right", buttons)
                button.left.textContent = ".calendar"
                button.right.textContent = "Dein persönlicher Kalender"
                button.onclick = () => {
                  window.alert("Bald verfügbar..")
                  // mond calender app
                  // termin calendar app
                }
              }
              {
                const button = this.create("button/left-right", buttons)
                button.left.textContent = ".groups"
                button.right.textContent = "Schnell, einfach und sicher Kontakte gruppieren"
                button.onclick = () => {
                  this.overlay("popup", async overlay => {

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

                    async function defineNewGroup(overlay) {
                      Helper.render("text/h1", "Neue Gruppe definieren", overlay)
                      const funnel = Helper.create("div/scrollable", overlay)
                      const emailSelect = Helper.create("email-select", funnel)
                      const res = await Helper.request("/get/user/tree-closed/", {tree: "contacts"})
                      if (res.status === 200) {
                        const contacts = JSON.parse(res.response)
                        emailSelect.renderEmails(contacts)
                        emailSelect.filterEmailsOnSearch(contacts)
                      }
                      emailSelect.submit = Helper.create("toolbox/action", funnel)
                      emailSelect.submit.textContent = "Gruppe jetzt speichern"
                      return emailSelect
                    }

                    const addGroup = this.create("button/add", overlay)
                    addGroup.onclick = () => {
                      this.overlay("popup", async overlay => {
                        const emailSelect = await defineNewGroup(overlay)
                        emailSelect.submit.onclick = () => {
                          const emails = emailSelect.selectedEmails()
                          if (this.verifyIs("array/empty", emails)) {
                            window.alert("Wähle mindestens eine E-Mail Adresse.")
                            this.add("style/node/not-valid", emailSelect.field.input)
                            return
                          }
                          this.overlay("security", async securityOverlay => {
                            const res = await this.request("/register/groups/self/", {emails})
                            if (res.status === 200) {
                              window.alert("Deine Gruppe wurde erfolgreich gespeichert.")
                              await getAndRenderGroups(groupsContainer)
                              securityOverlay.remove()
                              overlay.remove()
                            }
                          })
                        }
                      })
                    }

                    this.render("text/h1", "Meine Gruppen", overlay)

                    const searchField = this.create("field/text", overlay)
                    searchField.label.textContent = "Filter nach E-Mail Adresse oder Alias"
                    searchField.input.placeholder = "..@domain.de.."
                    searchField.style.margin = "0 34px"
                    this.add("outline-hover", searchField.input)
                    this.verify("input/value", searchField.input)

                    const groupsContainer = this.create("info/loading", overlay)
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

                      Helper.convert("parent/scrollable", parent)
                      for (let i = 0; i < groups.length; i++) {
                        const group = groups[i]

                        const groupButton = Helper.create("toolbox/left-right", fragment)
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
                          Helper.overlay("popup", buttonsOverlay => {
                            renderGroupEmails(group, buttonsOverlay.info)
                            const buttons = Helper.create("div/scrollable", buttonsOverlay)
                            {
                              const button = Helper.create("toolbox/left-right", buttons)
                              button.left.textContent = ".alias"
                              button.right.textContent = "Gebe deiner Gruppe einen alternativen Namen"
                              button.onclick = () => {
                                Helper.overlay("popup", overlay => {
                                  overlay.info.textContent = group.alias ? `${group.alias}.alias` : ".alias"
                                  const funnel = Helper.create("div/scrollable", overlay)
                                  const aliasField = Helper.create("field/text", funnel)
                                  aliasField.label.textContent = "Alternative Bezeichnung für deine Gruppe"
                                  aliasField.input.placeholder = "Family, Friends, Work.."
                                  aliasField.input.setAttribute("required", "true")
                                  if (group.alias !== undefined) {
                                    aliasField.input.value = group.alias
                                  }
                                  Helper.verify("input/value", aliasField.input)
                                  Helper.add("outline-hover", aliasField.input)
                                  aliasField.input.oninput = () => Helper.verify("input/value", aliasField.input)
                                  const submit = Helper.create("button/action", funnel)
                                  Helper.add("outline-hover", submit)
                                  submit.textContent = "Alias jetzt speichern"
                                  submit.onclick = async () => {
                                    await Helper.verify("input/value", aliasField.input)
                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/groups/alias/", {id: group.created, alias: aliasField.input.value})
                                      if (res.status === 200) {
                                        window.alert("Alias erfolgreich gespeichert.")
                                        await getAndRenderGroups(groupsContainer)
                                        overlay.remove()
                                        buttonsOverlay.remove()
                                        securityOverlay.remove()
                                      } else {
                                        window.alert("Fehler.. Bitte wiederholen.")
                                        securityOverlay.remove()
                                      }
                                    })
                                  }
                                })
                              }
                            }
                            {
                              const button = Helper.create("toolbox/left-right", buttons)
                              button.left.textContent = ".emails"
                              button.right.textContent = "Aktualisiere die Mitglieder deiner Gruppe"
                              button.onclick = () => {
                                Helper.overlay("popup", async overlay => {
                                  const emailSelect = await defineNewGroup(overlay, (emails) => Helper.request("/register/groups/emails-self/", {id: group.created, emails}))
                                  for (let i = 0; i < emailSelect.field.input.options.length; i++) {
                                    const option = emailSelect.field.input.options[i]
                                    if (group.emails.includes(option.value)) {
                                      option.selected = true
                                    }
                                  }
                                  emailSelect.submit.onclick = () => {
                                    const emails = emailSelect.selectedEmails()
                                    if (Helper.verifyIs("array/empty", emails)) {
                                      window.alert("Wähle mindestens eine E-Mail Adresse.")
                                      Helper.add("style/node/not-valid", emailSelect.field.input)
                                      return
                                    }
                                    Helper.overlay("security", async securityOverlay => {
                                      const res = await Helper.request("/register/groups/emails-self/", {id: group.created, emails})
                                      if (res.status === 200) {
                                        window.alert("Deine Gruppe wurde erfolgreich gespeichert.")
                                        await getAndRenderGroups(groupsContainer)
                                        overlay.remove()
                                        buttonsOverlay.remove()
                                        securityOverlay.remove()
                                      }
                                    })
                                  }
                                })
                              }
                            }
                            // render a button only when
                            // the jwt user is in the contacts emails
                            // onclick create signaling server
                            // connect browser with webrtc
                            // the create walkie talkie app
                            {
                              const button = Helper.create("toolbox/left-right", buttons)
                              button.left.textContent = ".remove"
                              button.right.textContent = "Gruppe entfernen"
                              button.onclick = () => {

                                const confirm = window.confirm("Möchtest du deine Gruppe wirklich entfernen?")
                                if (confirm === true) {
                                  Helper.overlay("security", async securityOverlay => {
                                    const res = await Helper.request("/remove/groups/id-self/", {id: group.created})
                                    if (res.status === 200) {
                                      window.alert("Gruppe erfolgreich entfernt.")
                                      groupButton.remove()
                                      buttonsOverlay.remove()
                                      securityOverlay.remove()
                                    } else {
                                      window.alert("Fehler.. Bitte wiederholen.")
                                      securityOverlay.remove()
                                    }
                                  })
                                }
                              }
                            }

                            // todo webrtc features




                            console.log(group);
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
              }
            })
          }


        })
      }
      input?.appendChild(button)
      return button
    }

    if (event === "button/assign-expert-home") {

      return new Promise(async(resolve, reject) => {
        try {

          const res = await this.request("/get/expert/name-self/")
          if (res.status === 200) {
            const name = res.response

            const button = this.create("button/left-right")
            button.left.textContent = ".expert"
            button.right.textContent = "Der Bereich für Experten"
            button.onclick = () => window.open(`/${name}/`, "_blank")

            if (input) input.append(button)
            resolve(button)
          }

        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "button/conflicts") {
      const button = this.create("button/left-right", input)
      button.left.textContent = ".conflicts"
      button.right.textContent = "Konflikte"

      button.addEventListener("click", () => {

        this.overlay("toolbox", overlay => {

          this.removeOverlayButton(overlay)

          const buttons = this.create("div/scrollable", overlay)

          {
            // const buttons = document.createElement("div")
            // buttons.style.overflowY = "auto"
            // buttons.style.overscrollBehavior = "none"
            // buttons.style.paddingBottom = "144px"
            // overlay.append(buttons)

            {
              const infoBox = document.createElement("div")

              infoBox.style.display = "flex"

              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                infoBox.style.color = this.colors.matte.black
                infoBox.style.backgroundColor = this.colors.matte.celadon
                infoBox.style.border = `2px solid ${this.colors.matte.forest}`
              } else {
                infoBox.style.color = this.colors.matte.black
                infoBox.style.backgroundColor = this.colors.matte.celadon
                infoBox.style.border = `2px solid ${this.colors.matte.forest}`
              }

              infoBox.style.fontSize = "13px"
              infoBox.style.margin = "21px 34px"
              infoBox.style.padding = "21px"
              infoBox.style.borderRadius = "13px"

              this.render("icon/node/path", "/public/smiling-bear.svg", infoBox).then(icon => {
                icon.style.width = "144px"
                icon.style.marginRight = "8px"
              })

              const message = document.createElement("div")
              message.style.fontSize = "13px"
              this.createNode("p", message, "In unserer Gemeinschaft legen wir großen Wert auf Offenheit, Transparenz und ein harmonisches Miteinander. Wir möchten betonen, dass es vollkommen in Ordnung ist, Konflikte zu melden, und wir ermutigen dies sogar ausdrücklich. Konflikte sind ein natürlicher Bestandteil des menschlichen Zusammenlebens und können uns dabei helfen, Missverständnisse aufzuklären, Probleme zu lösen und eine Veränderung herbeizuführen, bei der sich alle Parteien verstanden fühlen.")

              infoBox.append(message)

              buttons.append(infoBox)
            }

            {
              const button = document.createElement("div")
              button.style.display = "flex"
              button.style.flexWrap = "wrap"
              button.style.justifyContent = "space-between"
              button.style.alignItems = "center"
              button.style.margin = "21px 34px"
              button.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
              button.style.borderRadius = "13px"
              button.style.border = "0.3px solid black"
              button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
              button.style.cursor = "pointer"
              // button.addEventListener("click", () => window.location.assign("/getyour/pana/impressum/"))

              const icon = document.createElement("img")
              icon.style.margin = "13px 34px"
              icon.style.width = "34px"
              icon.src = "/public/add.svg"
              icon.alt = "Hinzufügen"
              button.append(icon)

              const title = document.createElement("div")
              title.textContent = "Neuen Konflikt melden"
              title.style.margin = "21px 34px"
              title.style.fontSize = "21px"
              button.append(title)

              buttons.append(button)
            }

            {
              const button = document.createElement("div")
              button.style.display = "flex"
              button.style.flexWrap = "wrap"
              button.style.justifyContent = "space-between"
              button.style.alignItems = "center"
              button.style.margin = "21px 34px"
              button.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
              button.style.borderRadius = "13px"
              button.style.border = "0.3px solid black"
              button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
              button.style.cursor = "pointer"

              const icon = document.createElement("img")
              icon.style.margin = "13px 34px"
              icon.style.width = "34px"
              icon.src = "/public/open.svg"
              icon.alt = "Offen"
              button.append(icon)

              const title = document.createElement("div")
              title.textContent = "Offene Konflikte"
              title.style.margin = "21px 34px"
              title.style.fontSize = "21px"
              button.append(title)

              buttons.append(button)
            }

            {
              const button = document.createElement("div")
              button.style.display = "flex"
              button.style.flexWrap = "wrap"
              button.style.justifyContent = "space-between"
              button.style.alignItems = "center"
              button.style.margin = "21px 34px"
              button.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
              button.style.borderRadius = "13px"
              button.style.border = "0.3px solid black"
              button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
              button.style.cursor = "pointer"
              // button.addEventListener("click", () => window.location.assign("/getyour/pana/impressum/"))

              const icon = document.createElement("img")
              icon.style.margin = "13px 34px"
              icon.style.width = "34px"
              icon.src = "/public/solved.svg"
              icon.alt = "Gelöst"
              button.append(icon)

              const title = document.createElement("div")
              title.textContent = "Gelöste Konflikte"
              title.style.margin = "21px 34px"
              title.style.fontSize = "21px"
              button.append(title)

              buttons.append(button)
            }

          }

        })

      })

    }

    if (event === "admin-login") {

      const emailInput = document.querySelector(".email-input")
      const dsgvoInput = document.querySelector(".dsgvo-input")
      const submit = document.querySelector(".start-login-event")
      submit.onclick = async () => {
        await this.verify("input/value", emailInput)
        await this.verify("input/value", dsgvoInput)
        this.callback("email/pin-verified", emailInput.value, async () => {
          const res = await this.request("/register/user/super-admin", {email: emailInput.value})
          if (res.status === 200) {
            window.alert("Du kannst dich ab sofort auf deiner Plattform anmelden")
            window.location.assign("/login/")
          } else {
            window.alert("Fehler.. Bitte wiederholen.")
            this.add("style/node/not-valid", emailInput)
          }
        })
      }
    }

    if (event === "oninput/verify-input") {

      if (input.type === "email") {
        input.addEventListener("input", (ev) => {
          this.verify("input/value", ev.target)
        })
      }
      if (input.type === "checkbox") {
        input.addEventListener("input", (ev) => {
          if (ev.target.checked === true) {
            ev.target.setAttribute("checked", "true")
          } else {
            ev.target.removeAttribute("checked")
          }
          this.verify("input/value", ev.target)
        })
      }
    }

    if (event === "outline-hover") {
      input.addEventListener("mouseover", () => {
        input.style.outline = "3px solid #999"
      })

      input.addEventListener("mouseout", () => {
        input.style.outline = null
      })
    }

    if (event === "outline-hover/field-funnel") {
      for (let i = 0; i < input.querySelectorAll("*").length; i++) {
        const node = input.querySelectorAll("*")[i]
        if (node.classList.contains("field-input") || node.classList.contains("submit-field-funnel-button")) {
          this.add("outline-hover", node)
        }
      }
    }

    if (event === "input/value") {

      if (input.type === "email") {

        if (window.localStorage.getItem("email") !== null) {
          input.value = window.localStorage.getItem("email")
          this.verify("input/value", input)
        }

      }

    }

    if (event === "user-json/keydown-event") {

      if (input.classList.contains("user-json")) {

        input.onkeydown = (ev) => {
          if (ev.key === 'Enter') {
            ev.preventDefault()
            if (input.onenter !== undefined) input.onenter(ev)
          }
        }

      }

    }

  }

  static animate(event, input) {
    // event = input/animation

    if (event === "fade-up") {
      return input?.animate([
        { opacity: 0, transform: 'translateY(13px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 233,
        easing: 'ease-in-out',
        fill: "forwards"
      })
    }

    if (event === "node/pulsate") {
      return input?.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.1)' },
          { transform: 'scale(1)' }
        ],
        {
          duration: 3000,
          easing: 'ease-in-out',
          iterations: Infinity
        }
      )
    }

    if (event === "node/border-ripple-out") {

      input.style.position = "relative"

      const rippleNode = input.cloneNode("true")
      rippleNode.classList.add("ripple-out")
      rippleNode.textContent = ""
      rippleNode.style.position = "absolute"
      rippleNode.style.top = "-8px"
      rippleNode.style.left = "-8px"
      input.querySelectorAll(".ripple-out").forEach(it => it.remove())
      input.appendChild(rippleNode)

      rippleNode.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(2)', opacity: 0 }
        ],
        {
          duration: 3000,
          easing: 'ease-in-out',
          iterations: Infinity,
        }
      )

    }

  }

  static callback(event, input, callback) {
    // event = input/algo

    if (event === "email/pin-verified") {

      return new Promise(async(resolve, reject) => {
        try {

          this.overlay("security", async overlay => {

            const content = document.createElement("div")
            content.style.display = "flex"
            content.style.flexDirection = "column"
            content.style.justifyContent = "center"
            content.style.alignItems = "center"
            content.style.height = `${window.innerHeight}px`
            overlay.append(content)

            try {
              const res = await this.request("/send/email/with/pin/", {email: input})
              if (res.status === 200) {
                overlay.info.remove()
                this.convert("element/reset", content)
                content.style.overflowY = "auto"
                const pinField = this.create("field/hex", content)
                pinField.label.textContent = "Meine PIN"
                this.add("style/node/not-valid", pinField.input)
                pinField.input.addEventListener("input", () => {
                  this.verify("input/value", pinField.input)
                })
                const button = this.create("button/action", content)
                button.style.fontSize = "34px"
                button.textContent = "PIN bestätigen"
                this.add("outline-hover", button)
                button.addEventListener("click", async () => {

                  this.overlay("security", async securityOverlay => {
                    try {
                      await this.verify("input/value", pinField.input)
                      const res = await this.request("/verify/pin/", {userPin: pinField.input.value})
                      if (res.status === 200) {
                        window.localStorage.setItem("email", input)
                        window.localStorage.setItem("localStorageId", await this.convert("text/digest", JSON.stringify({email: input, verified: true})))
                        await callback(overlay)
                      }
                    } catch (error) {
                      EventTarget.prototype.addEventListener = function(type, listener, options) {
                        console.log('Event listeners blocked')
                      }
                      window.XMLHttpRequest = function() {
                        console.log('XHR blocked')
                      }
                      window.alert("Es tut uns sehr leid, dass ein Fehler aufgetreten ist. Wir verstehen, wie frustrierend es sein kann, wenn Dinge nicht so funktionieren, wie sie sollten. Wir möchten Sie gerne beruhigen und Ihnen versichern, dass unser Team hart daran arbeitet, diesen Fehler so schnell wie möglich zu beheben. Wir hoffen, dass Sie uns die Gelegenheit geben werden, das Problem zu lösen. Falls der Fehler noch einmal auftritt, stehen wir Ihnen gerne zur Verfügung. Bitte zögern Sie nicht, uns unter 'datenschutz@get-your.de' zu kontaktieren, damit wir Ihnen helfen können. In der Zwischenzeit möchten wir Sie ermutigen, es einfach noch einmal zu versuchen. Vielen Dank für Ihr Verständnis und Ihre Geduld.")
                      reject(error)
                    }
                  })
                })
                const infoBox = this.create("info/success", content)
                infoBox.style.fontSize = "21px"
                const p1 = this.createNode("p", infoBox, `PIN erfolgreich an '${input}' gesendet.`)
                const span1 = this.createNode("span", p1, "✓")
                span1.style.fontSize = "34px"
                this.createNode("p", infoBox, "Es ist wichtig, dass deine PIN geheim gehalten wird, da sie als persönliches Kennwort dient und den Zugriff auf sensible Informationen oder Ressourcen ermöglicht. Teile deine PIN niemals mit anderen Personen. Das gilt selbst für enge Freunde, Familienmitglieder oder Mitarbeiter. Deine PIN sollte nur dir bekannt sein.")
                this.createNode("p", infoBox, "Bitte bestätige deine PIN um fortzufahren.")
              }
            } catch (error) {
              EventTarget.prototype.addEventListener = function(type, listener, options) {
                console.log('Event listeners blocked')
              }
              window.XMLHttpRequest = function() {
                console.log('XHR blocked')
              }
              window.alert(`Es konnte keine E-Mail an '${input}' verschickt werden.`)
              reject(error)
            }
          })

        } catch (error) {
          reject(error)
        }
      })

    }

    // oninput throttle

    // if (event === "onenter") {
    //   input.onkeypress = (ev) => {
    //     if (ev.keyCode === 13 || ev.key === 'Enter') {
    //       callback?.(ev)
    //     }
    //   }
    // }

  }

  static create(event, input) {

    // no events, only creation
    // event = thing/algo


    if (event === "email-select") {

      function renderEmails(array, select) {
        const fragment = document.createDocumentFragment()
        field.input.textContent = ""
        for (let i = 0; i < array.length; i++) {
          const it = array[i]
          if (it.email !== undefined) {
            const option = document.createElement("option")
            option.text = it.email
            option.value = it.email
            fragment.appendChild(option)
          }
        }
        field.input.appendChild(fragment)
      }

      const searchField = this.create("field/text", input)
      searchField.label.textContent = "Suche nach E-Mail Adresse"
      searchField.input.placeholder = "Filter nach Text.."
      searchField.style.margin = "21px 34px 5px 34px"
      this.verify("input/value", searchField.input)
      this.add("outline-hover", searchField.input)

      function filterEmailsOnSearch(array) {
        searchField.input.oninput = (ev) => {
          const filtered = array.filter(it => it.email.toLowerCase().includes(ev.target.value.toLowerCase()))
          renderEmails(filtered, field.input)
        }
      }

      function selectedEmails() {
        return Array.from(field.input.selectedOptions).map(it => it.value)
      }

      const field = this.create("field/select", input)
      field.label.textContent = "E-Mails auswählen"
      field.input.setAttribute("multiple", "true")
      field.input.style.height = "34vh"
      this.add("outline-hover", field.input)
      this.verify("input/value", field.input)
      field.input.oninput = () => this.verify("input/value", field.input)
      return {field, renderEmails, filterEmailsOnSearch, selectedEmails}
    }

    if (event === "overlay/security") {
      const overlay = document.createElement("div")
      overlay.classList.add("overlay")
      overlay.style.height = "100%"
      overlay.style.overscrollBehavior = "none"
      overlay.style.width = "100%"
      overlay.style.zIndex = "99999999999999"
      overlay.style.position = "fixed"
      overlay.style.top = "0"
      overlay.style.left = "0"
      overlay.style.display = "flex"
      overlay.style.flexDirection = "column"
      overlay.style.background = this.colors.light.background

      this.create("info/loading", overlay)

      input?.append(overlay)
      return overlay
    }

    if (event === "template/checklist") {

      const items = []
      items.push({title: "Angebotsübersicht", description: "Hier können Sie ihr Angebot prüfen und anpassen, nähere Produktinformationen erhalten, Allgemeine Geschäftsbedingungen aufrufen und mehr über den Hersteller erfahren."})
      items.push({title: "Angebot hochladen", description: "Wenn Sie noch Fragen haben, finden Sie hier einen kompetenten Ansprechpartner. Haben Sie ihr Angebot geprüft und ggf. geändert, können Sie es hier drucken, hochladen und somit zur Prüfung freigeben."})
      items.push({title: "Baugo", description: "Ihr Angebot wird geprüft und ggf. freigegeben. Hier finden Sie ihren Projektbericht."})
      items.push({title: "Projektvorbereitung", description: "Um einen einwandfreien Aufbau ihres Energiekonzeptes zu ermöglichen, finden Sie hier eine Liste von Aufgaben, die Sie noch vor der Montage erledigen müssen."})
      items.push({title: "Bestätigen Sie die Warenlieferung", description: "Damit zusätzliche Kosten leicht vermieden werden können, prüfen Sie bitte mit Sorgfalt, ob alle gekauften Artikel angeliefert wurden. Die Bestätigung der Ware ist unerlässlich, um weitere Schritte des Aufbaus abzuschließen."})
      items.push({title: "DC-Ansprechpartner", description: "Ihren persönlichen Ansprechpartner für technische Fragen während der Montage finden Sie hier."})
      items.push({title: "Dachmontage - Termin vereinbaren", description: "Über den Terminkalender können Sie einfach und bequem ihren Wunschtermin mit dem Montageteam vereinbaren."})
      items.push({title: "Abnahmeprotokoll DC hochladen", description: "Nachdem unser Monteur das Abnahmeprotokoll aufgenommen hat, prüfen wir es zu ihrem Schutz."})
      items.push({title: "AC-Ansprechpartner", description: "Ihren persönlichen Ansprechpartner für technische Fragen während der Montage finden Sie hier."})
      items.push({title: "Hauselektrik - Termin vereinbaren", description: "Über den Terminkalender können Sie einfach und bequem ihren Wunschtermin mit dem Montageteam vereinbaren."})
      items.push({title: "Abnahmeprotokoll AC hochladen", description: "Nachdem unser Monteur das Abnahmeprotokoll aufgenommen hat, prüfen wir es zu ihrem Schutz."})
      items.push({title: "WP-Ansprechpartner", description: "Ihren persönlichen Ansprechpartner für technische Fragen während der Montage finden Sie hier."})
      items.push({title: "Wärmepumpe - Termin vereinbaren", description: "Über den Terminkalender können Sie einfach und bequem ihren Wunschtermin mit dem Montageteam vereinbaren."})
      items.push({title: "Abnahmeprotokoll WP hochladen", description: "Nachdem unser Monteur das Abnahmeprotokoll aufgenommen hat, prüfen wir es zu ihrem Schutz."})
      items.push({title: "Feedback", description: "Um uns stetig verbessern zu können, brauchen wir ihre Mithilfe. Geben Sie uns ihr Feedback zur Montage, damit unsere Prozesse noch einfacher und schneller werden."})

      this.create("header/left-right", input)
      this.create("header/nav", input)

      this.render("text/title", "Essentielles zum Anlagenaufbau", input)

      const info = this.create("info/success", input)
      info.textContent = "Bitte befolgen Sie diese Schritte, um den einwandfreien Aufbau ihres Energiesystems vorzubereiten."

      const checklist = this.render("checklist/items", items, input)

      return checklist

    }

    if (event === "soundbox") {

      const fileImportField = this.create("field/file", input)
      fileImportField.label.textContent = "MP3 to CID"
      fileImportField.input.setAttribute("accept", "audio/mp3")
      fileImportField.input.setAttribute("required", "true")
      fileImportField.input.setAttribute("multiple", "true")
      fileImportField.input.setAttribute("soundbox-file-import", "")
      this.verify("input/value", fileImportField.input)

      this.create("script/soundbox", input)

      const div = this.create("div/top-bottom", input)
      div.top.setAttribute("soundbox-tools", "")
      div.bottom.setAttribute("soundbox-audio-list", "")

    }

    if (event === "input/select") {
      const select = document.createElement("select")
      select.add = (options) => {
        select.textContent = ""
        for (let i = 0; i < options.length; i++) {
          const option = document.createElement("option")
          option.value = options[i]
          option.text = options[i]
          select.appendChild(option)
        }
      }
      input?.append(select)
      return select
    }

    if (event === "input/password") {

      const password = document.createElement("input")
      password.type = "password"

      if (input) input.append(password)
      return password
    }

    if (event === "input/checkbox") {

      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"

      if (input) input.append(checkbox)
      return checkbox
    }

    if (event === "input/tel") {

      const tel = document.createElement("input")
      tel.type = "tel"

      if (input) input.append(tel)
      return tel
    }

    if (event === "input/number") {

      const number = document.createElement("input")
      number.type = "number"

      if (input) input.append(number)
      return number
    }

    if (event === "input/text") {

      const text = document.createElement("input")
      text.type = "text"
      input?.appendChild(text)
      return text

    }

    if (event === "img") {

      const img = document.createElement("img")
      img.src = "/public/image-placeholder.svg"
      img.style.width = "34px"
      img.style.margin = "21px 34px"

      input?.append(img)
      return img
    }

    if (event === "p") {

      const p = document.createElement("p")
      p.style.margin = "21px 34px"
      p.style.fontFamily = "sans-serif"
      p.style.fontWeight = "normal"
      p.style.fontSize = "21px"
      input?.appendChild(p)
      return p

    }

    if (event === "h3") {

      const h3 = document.createElement("h3")
      h3.style.margin = "21px 34px"
      h3.style.fontFamily = "sans-serif"
      h3.style.fontWeight = "normal"

      input?.append(h3)
      return h3
    }

    if (event === "h2") {

      const h2 = document.createElement("h2")
      h2.style.margin = "21px 34px"
      h2.style.fontFamily = "sans-serif"
      h2.style.fontWeight = "normal"

      input?.append(h2)
      return h2
    }

    if (event === "h1") {

      const h1 = document.createElement("h1")
      h1.style.margin = "21px 34px"
      h1.style.fontFamily = "sans-serif"
      h1.style.fontWeight = "normal"

      input?.append(h1)
      return h1
    }

    if (event === "hr") {

      const hr = document.createElement("hr")

      if (input) input.append(hr)
      return hr
    }

    if (event === "field-funnel/source") {

      const funnel = this.create("div/scrollable", input)
      funnel.id = "source"

      funnel.authorsField = this.create("field/textarea", funnel)
      funnel.authorsField.id = "authors"
      funnel.authorsField.label.textContent = "Authoren (mit Komma trennen)"
      funnel.authorsField.input.placeholder = "author1, author2, .., authorN"
      funnel.authorsField.input.setAttribute("required", "true")
      funnel.authorsField.input.oninput = () => this.verify("input/value", funnel.authorsField.input)
      this.verify("input/value", funnel.authorsField.input)
      this.add("outline-hover", funnel.authorsField.input)

      funnel.titleField = this.create("field/textarea", funnel)
      funnel.titleField.id = "title"
      funnel.titleField.label.textContent = "Titel der Quelle"
      funnel.titleField.input.placeholder = "JavaScript für Anfänger"
      funnel.titleField.input.setAttribute("required", "true")
      funnel.titleField.input.oninput = () => this.verify("input/value", funnel.titleField.input)
      this.verify("input/value", funnel.titleField.input)
      this.add("outline-hover", funnel.titleField.input)

      funnel.editionField = this.create("field/tel", funnel)
      funnel.editionField.id = "edition"
      funnel.editionField.label.textContent = "Auflage"
      funnel.editionField.input.placeholder = "0"
      funnel.editionField.input.oninput = () => this.verify("input/value", funnel.editionField.input)
      this.verify("input/value", funnel.editionField.input)
      this.add("outline-hover", funnel.editionField.input)

      funnel.publisherField = this.create("field/textarea", funnel)
      funnel.publisherField.id = "publisher"
      funnel.publisherField.label.textContent = "Herausgeber (mit Komma trennen)"
      funnel.publisherField.input.placeholder = "publisher1, publisher2, .., publisherN"
      funnel.publisherField.input.setAttribute("required", "true")
      funnel.publisherField.input.oninput = () => this.verify("input/value", funnel.publisherField.input)
      this.verify("input/value", funnel.publisherField.input)
      this.add("outline-hover", funnel.publisherField.input)

      funnel.publishedField = this.create("field/tel", funnel)
      funnel.publishedField.id = "published"
      funnel.publishedField.label.textContent = "Jahr der Herausgabe"
      funnel.publishedField.input.placeholder = "2019"
      funnel.publishedField.input.setAttribute("required", "true")
      funnel.publishedField.input.oninput = () => this.verify("input/value", funnel.publishedField.input)
      this.verify("input/value", funnel.publishedField.input)
      this.add("outline-hover", funnel.publishedField.input)

      funnel.isbnField = this.create("field/text", funnel)
      funnel.isbnField.id = "isbn"
      funnel.isbnField.label.textContent = "ISBN Nummern (mit Komma trennen)"
      funnel.isbnField.input.placeholder = "isbn1, isbn2, .., isbnN"
      funnel.isbnField.input.oninput = () => this.verify("input/value", funnel.isbnField.input)
      this.verify("input/value", funnel.isbnField.input)
      this.add("outline-hover", funnel.isbnField.input)

      funnel.weblinkField = this.create("field/text", funnel)
      funnel.weblinkField.id = "weblink"
      funnel.weblinkField.label.textContent = "Web Link zur Quelle"
      funnel.weblinkField.input.placeholder = "https://www.meine-infos.de/meine-quelle/"
      funnel.weblinkField.input.oninput = () => this.verify("input/value", funnel.weblinkField.input)
      this.verify("input/value", funnel.weblinkField.input)
      this.add("outline-hover", funnel.weblinkField.input)

      funnel.languageField = this.create("field/text", funnel)
      funnel.languageField.id = "language"
      funnel.languageField.label.textContent = "Sprachen erste 2 Buchstaben (mit Komma trennen)"
      funnel.languageField.input.placeholder = "de, en, fr, .."
      funnel.languageField.input.oninput = () => this.verify("input/value", funnel.languageField.input)
      this.verify("input/value", funnel.languageField.input)
      this.add("outline-hover", funnel.languageField.input)

      funnel.typeField = this.create("field/text", funnel)
      funnel.typeField.id = "type"
      funnel.typeField.label.textContent = "Art der Quelle"
      funnel.typeField.input.placeholder = "text/book"
      funnel.typeField.input.oninput = () => this.verify("input/value", funnel.typeField.input)
      this.verify("input/value", funnel.typeField.input)
      this.add("outline-hover", funnel.typeField.input)

      funnel.keywordsField = this.create("field/textarea", funnel)
      funnel.keywordsField.id = "keywords"
      funnel.keywordsField.label.textContent = "Schlüsselwörter deiner Quelle (mit Komma trennen)"
      funnel.keywordsField.input.placeholder = "keyword1, keyword2, .., keywordN"
      funnel.keywordsField.input.style.height = "144px"
      funnel.keywordsField.input.oninput = () => this.verify("input/value", funnel.keywordsField.input)
      this.verify("input/value", funnel.keywordsField.input)
      this.add("outline-hover", funnel.keywordsField.input)

      funnel.descriptionField = this.create("field/textarea", funnel)
      funnel.descriptionField.id = "description"
      funnel.descriptionField.label.textContent = "Beschreibung oder Notizen zu deiner Quelle"
      funnel.descriptionField.input.placeholder = "Hier findest du mehr Informationen über deine Quelle .."
      funnel.descriptionField.input.style.height = "144px"
      funnel.descriptionField.input.oninput = () => this.verify("input/value", funnel.descriptionField.input)
      this.verify("input/value", funnel.descriptionField.input)
      this.add("outline-hover", funnel.descriptionField.input)

      funnel.imageField = this.create("field/text", funnel)
      funnel.imageField.id = "image"
      funnel.imageField.label.textContent = "Bild URL deiner Quelle"
      funnel.imageField.input.placeholder = "https://www.meine-infos.de/meine-quellbild.jpg"
      funnel.imageField.input.oninput = () => this.verify("input/value", funnel.imageField.input)
      this.verify("input/value", funnel.imageField.input)
      this.add("outline-hover", funnel.imageField.input)

      funnel.submit = this.create("button/action", funnel)
      funnel.submit.className = "submit-field-funnel-button"
      this.add("outline-hover", funnel.submit)
      funnel.submit.textContent = "Quelle jetzt speichern"
      return funnel

    }

    if (event === "funnel/condition") {

      const funnel = this.create("div/scrollable")

      funnel.leftField = this.create("field/tree", funnel)
      funnel.leftField.label.textContent = "Nach welcher Datenstruktur soll die Plattform suchen"
      funnel.leftField.input.maxLength = "55"
      funnel.leftField.input.placeholder = "getyour.expert.name"
      this.verify("input/value", funnel.leftField.input)
      funnel.leftField.input.oninput = () => this.verify("input/value", funnel.leftField.input)

      funnel.operatorField = this.create("field/operator", funnel)
      this.verify("input/value", funnel.operatorField.input)
      funnel.operatorField.input.oninput = () => this.verify("input/value", funnel.operatorField.input)

      funnel.rightField = this.create("field/text", funnel)
      funnel.rightField.label.textContent = "Vergleichswert"
      funnel.rightField.input.maxLength = "55"
      funnel.rightField.input.setAttribute("required", "true")
      funnel.rightField.input.placeholder = "any"
      this.verify("input/value", funnel.rightField.input)
      funnel.rightField.input.oninput = () => this.verify("input/value", funnel.rightField.input)

      funnel.submit = this.create("button/action", funnel)
      funnel.submit.textContent = "Bedingung jetzt speichern"


      if (input !== undefined) input.append(funnel)
      return funnel
    }

    if (event === "header/sticky-nav") {

      const header = document.createElement("header")
      header.style.display = "flex"
      header.style.flexDirection = "column"
      header.style.justifyContent = "space-between"

      const headerLogo = document.createElement("img")
      headerLogo.src = "/public/image-placeholder.svg"
      // headerLogo.alt = "SHS Express Logo"
      headerLogo.style.margin = "8px 34px"
      headerLogo.style.width = "144px"
      headerLogo.style.cursor = "pointer"
      // headerLogo.addEventListener("click", () => window.history.back())
      header.append(headerLogo)


      const navContainer = document.createElement("div")
      navContainer.style.display = "flex"
      navContainer.style.justifyContent = "space-evenly"
      navContainer.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"

      const button1 = document.createElement("div")
      button1.classList.add("button-1")
      button1.style.display = "flex"
      button1.style.flexDirection = "column"
      button1.style.alignItems = "center"
      button1.style.justifyContent = "center"
      button1.style.width = "89px"
      button1.style.margin = "13px"
      button1.style.cursor = "pointer"
      // button1.addEventListener("click", async() => await checkAndProceed("/felix/shs/abfrage-haus/"))

      const title1 = document.createElement("div")
      title1.textContent = "Haus"
      button1.append(title1)

      const index1 = document.createElement("div")
      index1.textContent = "1"
      index1.style.color = "white"

      const state1 = document.createElement("div")
      state1.style.display = "flex"
      state1.style.justifyContent = "center"
      state1.style.alignItems = "center"
      state1.style.width = "55px"
      state1.style.height = "34px"
      state1.style.margin = "13px 0"
      state1.style.backgroundColor = "#11841e"
      button1.append(state1)

      state1.append(index1)

      navContainer.append(button1)


      const button2 = document.createElement("div")
      button2.classList.add("button-1")
      button2.style.display = "flex"
      button2.style.flexDirection = "column"
      button2.style.justifyContent = "center"
      button2.style.alignItems = "center"
      button2.style.width = "89px"
      button2.style.margin = "13px"
      button2.style.cursor = "pointer"
      // button2.addEventListener("click", async() => await checkAndProceed("/felix/shs/abfrage-heizung/"))

      const title2 = document.createElement("div")
      title2.textContent = "Heizung"
      button2.append(title2)

      const index2 = document.createElement("div")
      index2.textContent = "2"
      index2.style.color = "white"

      const state2 = document.createElement("div")
      state2.style.display = "flex"
      state2.style.justifyContent = "center"
      state2.style.alignItems = "center"
      state2.style.width = "55px"
      state2.style.height = "34px"
      state2.style.margin = "13px 0"
      state2.style.backgroundColor = "#11841e"
      button2.append(state2)

      state2.append(index2)

      navContainer.append(button2)



      const button3 = document.createElement("div")
      button3.classList.add("button-1")
      button3.style.display = "flex"
      button3.style.flexDirection = "column"
      button3.style.justifyContent = "center"
      button3.style.alignItems = "center"
      button3.style.width = "89px"
      button3.style.margin = "13px"
      button3.style.cursor = "pointer"
      // button3.addEventListener("click", async() => await checkAndProceed("/felix/shs/abfrage-strom/"))

      const title3 = document.createElement("div")
      title3.textContent = "Strom"
      button3.append(title3)

      const index3 = document.createElement("div")
      index3.textContent = "3"
      index3.style.color = "white"

      const state3 = document.createElement("div")
      state3.style.display = "flex"
      state3.style.justifyContent = "center"
      state3.style.alignItems = "center"
      state3.style.width = "55px"
      state3.style.height = "34px"
      state3.style.margin = "13px 0"
      state3.style.backgroundColor = "#11841e"
      button3.append(state3)

      state3.append(index3)

      navContainer.append(button3)



      const button4 = document.createElement("div")
      button4.classList.add("button-1")
      button4.style.display = "flex"
      button4.style.flexDirection = "column"
      button4.style.justifyContent = "center"
      button4.style.alignItems = "center"
      button4.style.width = "89px"
      button4.style.margin = "13px"
      button4.style.cursor = "pointer"
      // button4.addEventListener("click", async() => await checkAndProceed("/felix/shs/abfrage-technisches/"))

      const title4 = document.createElement("div")
      title4.textContent = "Technisches"
      button4.append(title4)

      const index4 = document.createElement("div")
      index4.textContent = "4"
      index4.style.color = "white"

      const state4 = document.createElement("div")
      state4.style.display = "flex"
      state4.style.justifyContent = "center"
      state4.style.alignItems = "center"
      state4.style.width = "55px"
      state4.style.height = "34px"
      state4.style.margin = "13px 0"
      state4.style.backgroundColor = "#11841e"
      button4.append(state4)

      state4.append(index4)

      navContainer.append(button4)


      header.append(navContainer)

      let observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting === false) {
            navContainer.style.position = "fixed"
            navContainer.style.top = "0"
            navContainer.style.left = "0"
            navContainer.style.zIndex = "1"
            navContainer.style.backgroundColor = "white"
            navContainer.style.width = "100%"
          }

          if (entry.isIntersecting === true) {
            navContainer.style.position = "static"
          }

        })
      }, {threshold: 0})
      observer.observe(headerLogo)


      input?.append(header)
      return header

    }

    if (event === "header/info") {

      const header = document.createElement("div")
      header.style.fontFamily = "monospace"
      header.style.fontSize = "13px"
      header.style.position = "fixed"
      header.style.left = "0"
      header.style.bottom = "0"
      header.style.zIndex = "1"
      header.style.maxWidth = "100%"
      header.style.maxHeight = "21px"
      header.style.overflow = "auto"
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = this.colors.dark.boxShadow
        header.style.border = this.colors.dark.border
        header.style.backgroundColor = this.colors.dark.foreground
        header.style.color = this.colors.dark.text
      } else {
        header.style.boxShadow = this.colors.light.boxShadow
        header.style.border = this.colors.light.border
        header.style.backgroundColor = this.colors.light.foreground
        header.style.color = this.colors.light.text
      }
      input?.append(header)
      return header

    }

    if (event === "header/nav") {

      const header = document.createElement("div")
      header.style.display = "flex"
      header.style.justifyContent = "space-around"
      header.style.alignItems = "center"
      header.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"

      header.nav = document.createElement("div")
      header.nav.style.display = "flex"
      header.nav.style.flexDirection = "column"
      header.nav.style.alignItems = "center"
      header.nav.style.width = "89px"
      header.nav.style.cursor = "pointer"
      header.append(header.nav)

      header.nav.text = document.createElement("div")
      header.nav.text.textContent = "Mein Link"
      header.nav.append(header.nav.text)

      header.nav.state = document.createElement("div")
      header.nav.state.style.display = "flex"
      header.nav.state.style.justifyContent = "center"
      header.nav.state.style.alignItems = "center"
      header.nav.state.style.width = "55px"
      header.nav.state.style.height = "34px"
      header.nav.state.style.margin = "13px 0"
      header.nav.state.style.backgroundColor = "#cfd4e2"
      header.nav.append(header.nav.state)

      header.nav.state.index = document.createElement("div")
      header.nav.state.index.textContent = "1"
      header.nav.state.index.style.color = "white"
      header.nav.state.append(header.nav.state.index)

      if (input !== undefined) input.append(header)
      return header
    }

    if (event === "header/left-right") {

      const header = document.createElement("div")
      header.style.display = "flex"
      header.style.justifyContent = "space-between"
      header.style.alignItems = "center"
      // header.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"

      header.left = document.createElement("div")
      header.left.classList.add("left")
      header.left.style.margin = "21px 34px"
      header.left.style.width = "55px"
      header.append(header.left)

      header.left.image = document.createElement("img")
      header.left.image.src = "https://bafybeiefo3y5hr4yb7gad55si2x6ovvoqteqlbxaoqyvlc37bm2ktrruu4.ipfs.nftstorage.link"
      header.left.image.alt = "Mein Logo"
      header.left.image.style.width = "100%"
      header.left.append(header.left.image)

      header.right = document.createElement("div")
      header.right.classList.add("right")
      header.right.style.margin = "21px 34px"
      header.right.textContent = "Login"
      header.append(header.right)

      if (input !== undefined) input.append(header)
      return header
    }

    if (event === "header/right") {

      const header = document.createElement("div")
      header.classList.add("header")
      header.style.display = "flex"
      header.style.justifyContent = "flex-end"

      header.right = document.createElement("div")
      header.right.classList.add("right")
      header.right.style.margin = "21px 34px"
      header.right.textContent = "Login"
      header.append(header.right)

      if (input !== undefined) input.append(header)
      return header
    }

    if (event === "header/left") {

      const header = document.createElement("header")
      header.style.display = "flex"
      header.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"
      header.left = document.createElement("div")
      header.left.classList.add("left")
      header.left.style.margin = "21px 34px"
      header.left.style.width = "55px"
      header.append(header.left)
      header.left.image = document.createElement("img")
      header.left.image.classList.add("logo")
      header.left.image.src = "/public/image.svg"
      header.left.image.alt = "Mein Logo"
      header.left.image.style.width = "100%"
      header.left.append(header.left.image)
      input?.append(header)
      return header

    }

    if (event === "div/timer") {

      var timer = duration, minutes, seconds
      const timerDiv = document.createElement("div")
      const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10)

        minutes = minutes < 10 ? "0" + minutes : minutes
        seconds = seconds < 10 ? "0" + seconds : seconds

        timerDiv.textContent = minutes + ":" + seconds

        if (--timer < 0) {
          timerDiv.textContent = "pin abgelaufen"
          clearInterval(interval)
        }
      }, 1000)

      return interval
    }

    if (event === "div/item-template") {

      const item = document.createElement("div")
      item.classList.add("checklist-item")
      item.style.margin = "34px"

      const itemHeader = document.createElement("div")
      itemHeader.classList.add("item-header")
      itemHeader.style.display = "flex"
      itemHeader.style.borderTopRightRadius = "21px"
      itemHeader.style.borderTopLeftRadius = "21px"
      itemHeader.style.borderBottomLeftRadius = "21px"
      itemHeader.style.backgroundColor = "#d1d0d0"
      itemHeader.style.cursor = "pointer"

      const itemState = document.createElement("div")
      itemState.classList.add("item-state")
      itemState.style.display = "flex"
      itemState.style.justifyContent = "center"
      itemState.style.alignItems = "center"
      itemState.style.width = "89px"
      itemState.style.height = "89px"
      itemState.style.backgroundColor = "#c6c6c6"
      itemState.style.fontSize = "34px"

      itemState.style.borderTopLeftRadius = "21px"
      itemState.style.borderBottomLeftRadius = "21px"

      const itemIndex = document.createElement("div")
      itemIndex.classList.add("item-index")
      itemIndex.textContent = "client.reputation"
      itemIndex.style.fontSize = "21px"

      itemState.append(itemIndex)


      const itemTitle = document.createElement("div")
      itemTitle.classList.add("item-title")
      itemTitle.style.alignSelf = "center"
      itemTitle.style.marginLeft = "13px"
      itemTitle.textContent = "`${client.firstname} ${client.lastname}`"
      itemTitle.style.fontSize = "21px"

      itemHeader.append(itemState, itemTitle)
      item.append(itemHeader)


      const itemBody = document.createElement("div")
      itemBody.classList.add("item-body")
      itemBody.style.marginLeft = "8%"
      itemBody.style.backgroundColor = "#dbdbdb"
      itemBody.style.borderBottomRightRadius = "21px"
      itemBody.style.borderBottomLeftRadius = "21px"
      itemBody.style.padding = "21px"
      itemBody.style.display = "flex"
      itemBody.style.flexDirection = "column"
      itemBody.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"

      const buttons = document.createElement("div")
      buttons.style.display = "flex"
      buttons.style.alignItems = "center"

      {
        const button = document.createElement("img")
        button.src = "/public/phone-out.svg"
        button.alt = "Anrufen"
        button.style.width = "55px"
        button.style.padding = "13px"
        button.style.cursor = "pointer"
        buttons.append(button)
      }

      {
        const button = document.createElement("img")
        button.src = "/public/mailto.svg"
        button.alt = "E-Mail schreiben"
        button.style.width = "55px"
        button.style.padding = "13px"
        button.style.cursor = "pointer"
        buttons.append(button)
      }

      {
        const button = document.createElement("img")
        button.src = "/public/maps.svg"
        button.alt = "Navigieren"
        button.style.width = "55px"
        button.style.padding = "13px"
        button.style.cursor = "pointer"
        buttons.append(button)
      }

      itemBody.append(buttons)
      item.append(itemBody)

      input?.append(item)
      return item


    }

    if (event === "div/offer-template") {

      const div = this.create("div/scrollable")
      console.log(div);

      const offer = document.createElement("div")
      offer.style.backgroundColor = "white"
      offer.style.borderRadius = "13px"
      offer.style.margin = "34px"
      offer.style.padding = "34px"
      offer.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"

      const alignLogo = document.createElement("div")
      alignLogo.style.display = "flex"
      alignLogo.style.justifyContent = "flex-end"

      const logo = document.createElement("img")
      logo.src = "/public/image-placeholder.svg"
      logo.alt = "Bestprime Logo"
      logo.style.width = "55vw"
      logo.style.maxWidth = "377px"

      alignLogo.append(logo)

      offer.append(alignLogo)

      const company = document.createElement("div")
      company.textContent = "offers[i].producer.company"
      company.style.margin = "21px 0"
      company.style.fontSize = "21px"

      offer.append(company)

      const website = document.createElement("div")
      website.style.display = "flex"
      website.style.alignItems = "center"

      const websiteIcon = document.createElement("img")
      websiteIcon.src = "/felix/shs/public/website-icon.svg"
      websiteIcon.alt = "Website Icon"

      const websiteText = document.createElement("a")
      websiteText.textContent = "Website"
      websiteText.href = "offers[i].producer.website"
      websiteText.target = "_blank"
      websiteText.style.textDecoration = "underline"
      websiteText.style.margin = "8px"
      websiteText.style.cursor = "pointer"

      website.append(websiteIcon, websiteText)

      offer.append(website)


      const product = document.createElement("div")
      product.textContent = "offers[i].producer.product"
      product.style.marginTop = "34px"
      product.style.fontSize = "21px"


      offer.append(product)


      const description = document.createElement("div")
      description.textContent = "offers[i].producer.description"
      description.style.marginTop = "13px"

      offer.append(description)


      const alignContainer = document.createElement("div")
      alignContainer.style.display = "flex"
      alignContainer.style.justifyContent = "flex-end"

      const priceContainer = document.createElement("div")
      priceContainer.style.width = "300px"
      priceContainer.style.marginTop = "21px"

      const priceTitle = document.createElement("div")
      priceTitle.textContent = "Preisübersicht"
      priceTitle.style.fontSize = "21px"
      priceTitle.style.margin = "21px 0"


      priceContainer.append(priceTitle)

      const netContainer = document.createElement("div")
      netContainer.style.display = "flex"
      netContainer.style.justifyContent = "space-between"
      netContainer.style.margin = "13px 0"

      const priceNetTitle = document.createElement("div")
      priceNetTitle.textContent = "Nettobetrag"

      const priceNetAmount = document.createElement("div")
      priceNetAmount.textContent = "netto price"// `${offers[i].grossAmount.toFixed(2).replace(".", ",")} €`

      netContainer.append(priceNetTitle, priceNetAmount)

      priceContainer.append(netContainer)



      const vatContainer = document.createElement("div")
      vatContainer.style.display = "flex"
      vatContainer.style.justifyContent = "space-between"
      vatContainer.style.margin = "13px 0"


      const priceVatTitle = document.createElement("div")
      priceVatTitle.textContent = "vat price" // `USt. ${(offers[i].vat * 100).toFixed(2).replace(".", ",")} %`

      const priceVatAmount = document.createElement("div")
      priceVatAmount.textContent = "vat price amount" // `${(offers[i].grossAmount * 0.19).toFixed(2).replace(".", ",")} €`

      vatContainer.append(priceVatTitle, priceVatAmount)

      priceContainer.append(vatContainer)

      const line = document.createElement("hr")

      priceContainer.append(line)


      const grossContainer = document.createElement("div")
      grossContainer.style.display = "flex"
      grossContainer.style.justifyContent = "space-between"
      grossContainer.style.margin = "21px 0"

      const priceGrossTitle = document.createElement("div")
      priceGrossTitle.textContent = "Gesamt"

      const priceGrossAmount = document.createElement("div")
      priceGrossAmount.textContent = "gross amount" // `${(offers[i].grossAmount * 1.19).toFixed(2).replace(".", ",")} €`

      grossContainer.append(priceGrossTitle, priceGrossAmount)

      priceContainer.append(grossContainer)


      const button = document.createElement("div")
      button.textContent = "Weiter zum Angebot"
      button.style.marginTop = "34px"
      button.style.height = "55px"
      button.style.backgroundColor = "#f7aa20"
      button.style.borderRadius = "13px"
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.cursor = "pointer"
      button.addEventListener("mouseover", () => button.style.backgroundColor = "#f19d08")
      button.addEventListener("mouseout", () => button.style.backgroundColor = "#f7aa20")

      // button.addEventListener("click", () => {
      //
      //   for (let i = 0; i < offers.length; i++) {
      //     offers[i].selected = false
      //   }
      //
      //   offers[i].selected = true
      //   window.localStorage.setItem("offers", JSON.stringify(offers))
      //   window.location.assign("/felix/shs/abfrage-persoenliches/")
      // })

      priceContainer.append(button)
      alignContainer.append(priceContainer)
      offer.append(alignContainer)
      div.append(offer)

      input?.append(div)
      return div

    }

    if (event === "div/bottom-left") {

      const div = document.createElement("div")
      div.style.fontFamily = "monospace"
      div.style.fontSize = "13px"
      div.style.position = "fixed"
      div.style.left = "0"
      div.style.bottom = "0"
      div.style.zIndex = "1"
      div.style.maxWidth = "100%"
      div.style.maxHeight = "21px"
      div.style.overflow = "auto"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        div.style.boxShadow = this.colors.dark.boxShadow
        div.style.border = this.colors.dark.border
        div.style.backgroundColor = this.colors.dark.foreground
        div.style.color = this.colors.dark.text
      } else {
        div.style.boxShadow = this.colors.light.boxShadow
        div.style.border = this.colors.light.border
        div.style.backgroundColor = this.colors.light.foreground
        div.style.color = this.colors.light.text
      }

      if (input !== undefined) input.append(div)
      return div
    }

    if (event === "div/progress-bar") {

      const progress = document.createElement("div")
      progress.classList.add("progress-container")
      progress.style.display = "flex"
      progress.style.height = "21px"
      progress.style.margin = "21px"
      progress.style.position = "relative"
      input?.append(progress)

      progress.bar = document.createElement("div")
      progress.bar.classList.add("progress-bar")
      progress.bar.style.height = "21px"
      progress.bar.style.backgroundColor = "#4CAF50"
      progress.bar.style.width = "0%"
      progress.bar.style.position = "absolute"
      progress.bar.style.transition = "width 0.3s ease"
      progress.append(progress.bar)

      return progress

    }

    if (event === "div/top-bottom") {

      const field = document.createElement("div")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.top = document.createElement("div")
      field.top.classList.add("top")
      field.top.style.display = "flex"
      field.top.style.alignItems = "center"
      field.top.style.margin = "21px 89px 0 34px"
      field.append(field.top)

      field.bottom = document.createElement("div")
      field.bottom.classList.add("bottom")
      field.bottom.type = "text"
      field.bottom.style.margin = "21px 89px 21px 34px"
      field.bottom.style.fontSize = "21px"
      field.append(field.bottom)

      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text
      field.bottom.style.backgroundColor = this.colors.light.background
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        field.style.backgroundColor = this.colors.dark.foreground
        field.style.border = this.colors.dark.border
        field.style.boxShadow = this.colors.dark.boxShadow
        field.style.color = this.colors.dark.text
        field.bottom.style.backgroundColor = this.colors.dark.background
      }

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "div/match-maker-list") {

      return new Promise(async(resolve, reject) => {
        try {

          const sorted = input.list
          sorted.sort((a, b) => {
            return b.reputation - a.reputation // Descending order, for ascending use: a.reputation - b.reputation
          })

          const userList = this.create("div/scrollable")
          userList.setAttribute("id", `match-maker-list-${input.name}`)

          const matchMaker = document.querySelector(`[match-maker="${input.name}"]`)

          if (matchMaker !== null) {

            const tags = []
            matchMaker.querySelectorAll("*").forEach(element => {
              if (element.hasAttribute("user-data")) {
                tags.push(element.getAttribute("user-data"))
              }
            })

            const ids = []
            for (let i = 0; i < sorted.length; i++) {
              const map = sorted[i]

              const clone = document.createElement("div")
              clone.textContent = matchMaker.textContent
              clone.setAttribute("id", map.id)
              clone.setAttribute("style", this.convert("styles/text", matchMaker))

              ids.push(map.id)

              Object.entries(map.funnel).forEach(([key, value]) => {
                clone.querySelectorAll(`.${key}`).forEach(element => {

                  if (element.tagName === "IMG") {
                    element.src = value
                  } else {
                    element.textContent = value
                  }

                })

              })

              userList.append(clone)

            }

            const res = await this.request("/get/location/lists/", {tags, ids})
            if (res.status === 200) {
              const data = JSON.parse(res.response)

              for (let i = 0; i < userList.children.length; i++) {
                const child = userList.children[i]


                Object.entries(data).forEach(([key, value]) => {

                  if (child.id === key) {

                    Object.entries(value).forEach(([key, value]) => {

                      child.querySelectorAll("[user-data]").forEach(element => {
                        if (element.getAttribute("user-data") === key) {

                          if (element.tagName === "IMG") {
                            element.src = value
                          } else {
                            element.textContent = value
                          }

                        }
                      })

                    })

                  }

                })

              }

            }

            const userLists = document.querySelectorAll(`#match-maker-list-${input.name}`)

            if (userLists.length === 0) {
              matchMaker.before(userList)
              matchMaker.style.display = "none"
            }

            if (userList.children.length === 0) {
              this.convert("parent/info", userList)
              userList.textContent = "Keine Daten gefunden."
              throw new Error("list is empty")
            }

            resolve(userList)

          }

        } catch (error) {
          reject(error)
        }
      })


    }

    if (event === "div/key-value") {

      const div = document.createElement("div")
      div.classList.add("key-value")
      div.style.display = "flex"
      div.style.justifyContent = "space-between"
      div.style.width = "144px"
      div.key = document.createElement("div")
      div.key.classList.add("key")
      div.key.textContent = "Schlüssel:"
      div.key.style.fontFamily = "sans-serif"
      div.append(div.key)
      div.value = document.createElement("div")
      div.value.classList.add("value")
      div.value.textContent = "Wert"
      div.value.style.fontFamily = "sans-serif"
      div.value.style.fontWeight = "bold"
      div.append(div.value)
      input?.appendChild(div)
      return div

    }

    if (event === "div/image") {
      const div = document.createElement("div")
      div.className = "image"
      div.style.width = "144px"
      div.image = document.createElement("img")
      div.image.src = input
      div.image.style.width = "100%"
      div.appendChild(div.image)
      return div
    }

    if (event === "div/image-text") {
      const div = document.createElement("div")
      div.classList.add("image-text")
      div.style.display = "flex"
      div.style.flexDirection = "column"
      div.style.alignItems = "center"
      div.image = document.createElement("img")
      div.image.src = "/public/image.svg"
      div.image.style.width = "144px"
      div.appendChild(div.image)
      div.text = document.createElement("p")
      div.text.textContent = "Titel"
      div.text.style.fontFamily = "sans-serif"
      div.text.style.fontWeight = "bold"
      div.appendChild(div.text)
      input?.appendChild(div)
      return div
    }

    if (event === "div/flex-row") {
      const div = document.createElement("div")
      div.style.display = "flex"
      div.style.justifyContent = "space-around"
      div.style.flexWrap = "wrap"
      div.style.margin = "21px 34px"

      if (input !== undefined) input.append(div)

      return div
    }

    if (event === "div/box-overview") {

      const offer = document.createElement("div")
      offer.classList.add("box")
      offer.style.backgroundColor = "white"
      offer.style.borderRadius = "13px"
      offer.style.margin = "34px"
      offer.style.padding = "34px"
      offer.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"

      const alignLogo = document.createElement("div")
      alignLogo.classList.add("image-container")
      alignLogo.style.display = "flex"
      alignLogo.style.justifyContent = "flex-end"

      const logo = document.createElement("img")
      logo.classList.add("image")
      logo.src = "meine-quell-url.de"
      logo.alt = "Mein Logo Image"
      logo.style.width = "55vw"
      logo.style.maxWidth = "377px"

      alignLogo.append(logo)

      offer.append(alignLogo)

      const company = document.createElement("div")
      company.classList.add("company")
      company.textContent = "Meine Firma"
      company.style.margin = "21px 0"
      company.style.fontSize = "21px"

      offer.append(company)

      const website = document.createElement("div")
      website.style.display = "flex"
      website.style.alignItems = "center"

      const websiteIcon = document.createElement("img")
      websiteIcon.src = "mein-icon-url.de"
      websiteIcon.alt = "Website Icon"

      const websiteText = document.createElement("a")
      websiteText.textContent = "Website"
      websiteText.href = "www.website.de"
      websiteText.target = "_blank"
      websiteText.style.textDecoration = "underline"
      websiteText.style.margin = "8px"
      websiteText.style.cursor = "pointer"

      website.append(websiteIcon, websiteText)

      offer.append(website)


      const product = document.createElement("div")
      product.textContent = "Produkt Titel"
      product.style.marginTop = "34px"
      product.style.fontSize = "21px"


      offer.append(product)


      const description = document.createElement("div")
      description.textContent = "Produktbeschreibung"
      description.style.marginTop = "13px"

      offer.append(description)


      const alignContainer = document.createElement("div")
      alignContainer.style.display = "flex"
      alignContainer.style.justifyContent = "flex-end"

      const priceContainer = document.createElement("div")
      priceContainer.style.width = "300px"
      priceContainer.style.marginTop = "21px"

      const priceTitle = document.createElement("div")
      priceTitle.textContent = "Preisübersicht"
      priceTitle.style.fontSize = "21px"
      priceTitle.style.margin = "21px 0"


      priceContainer.append(priceTitle)

      const netContainer = document.createElement("div")
      netContainer.style.display = "flex"
      netContainer.style.justifyContent = "space-between"
      netContainer.style.margin = "13px 0"

      const priceNetTitle = document.createElement("div")
      priceNetTitle.textContent = "Nettobetrag"

      const priceNetAmount = document.createElement("div")
      priceNetAmount.textContent = `100 €`

      netContainer.append(priceNetTitle, priceNetAmount)

      priceContainer.append(netContainer)



      const vatContainer = document.createElement("div")
      vatContainer.style.display = "flex"
      vatContainer.style.justifyContent = "space-between"
      vatContainer.style.margin = "13px 0"


      const priceVatTitle = document.createElement("div")
      priceVatTitle.textContent = `USt. 19 %`

      const priceVatAmount = document.createElement("div")
      priceVatAmount.textContent = `10 €`

      vatContainer.append(priceVatTitle, priceVatAmount)

      priceContainer.append(vatContainer)

      const line = document.createElement("hr")

      priceContainer.append(line)


      const grossContainer = document.createElement("div")
      grossContainer.style.display = "flex"
      grossContainer.style.justifyContent = "space-between"
      grossContainer.style.margin = "21px 0"

      const priceGrossTitle = document.createElement("div")
      priceGrossTitle.textContent = "Gesamt"

      const priceGrossAmount = document.createElement("div")
      priceGrossAmount.classList.add("price")
      priceGrossAmount.textContent = `10€`

      grossContainer.append(priceGrossTitle, priceGrossAmount)

      priceContainer.append(grossContainer)


      const button = document.createElement("div")
      button.classList.add("submit")
      button.textContent = "Weiter zum Angebot"
      button.style.marginTop = "34px"
      button.style.height = "55px"
      button.style.backgroundColor = "#f7aa20"
      button.style.borderRadius = "13px"
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.cursor = "pointer"
      button.addEventListener("mouseover", () => button.style.backgroundColor = "#f19d08")
      button.addEventListener("mouseout", () => button.style.backgroundColor = "#f7aa20")

      priceContainer.append(button)
      alignContainer.append(priceContainer)
      offer.append(alignContainer)
      //div.append(offer)

      if (input !== undefined) input.append(offer)

      return offer



    }

    if (event === "div/user-list") {

      return new Promise(async(resolve, reject) => {
        try {

          const userList = document.createElement("div")
          userList.classList.add("user-list")
          document.querySelectorAll(`[match-maker="${parent}"]`).forEach(matchMaker => {

            for (let i = 0; i < input.length; i++) {
              const mirror = input[i]

              const clone = document.createElement("div")
              clone.textContent = matchMaker.textContent
              clone.classList.add(`user-${i + 1}`)

              for (let i = 0; i < mirror.treeValues.length; i++) {
                const treeValuePair = mirror.treeValues[i]
                clone.querySelectorAll(`#${treeValuePair.tree}`).forEach(container => {
                  container.textContent = treeValuePair.value
                })
              }

              userList.append(clone.cloneNode())

            }

          })
          console.log("inside promise", userList);

          // resolve(userList)

        } catch (error) {
          reject(error)
        }
      })


    }

    if (event === "div/action") {
      const div = document.createElement("div")

      div.style.backgroundColor = this.colors.matte.sunflower
      div.style.color = this.colors.matte.black
      div.style.boxShadow = this.colors.light.boxShadow
      div.style.cursor = "pointer"
      div.style.fontSize = "21px"
      div.style.fontFamily = "sans-serif"
      div.style.borderRadius = "13px"
      div.style.margin = "21px 34px"
      div.style.display = "flex"
      div.style.justifyContent = "center"
      div.style.alignItems = "center"
      div.style.height = "55px"
      div.style.width = "89px"

      if (input !== undefined) input.append(div)
      return div
    }

    if (event === "div") {
      const div = document.createElement("div")
      input?.appendChild(div)
      return div
    }

    if (event === "div/green-flag") {

      const div = document.createElement("div")
      div.style.width = "34px"
      div.style.padding = "8px 34px"
      div.style.display = "flex"
      div.style.justifyContent = "center"
      div.style.alignItems = "center"
      div.style.borderRadius = "13px"
      div.style.background = "green"
      input?.appendChild(div)
      return div

    }

    if (event === "div/red-flag") {

      const div = document.createElement("div")
      div.style.width = "34px"
      div.style.padding = "8px 34px"
      div.style.display = "flex"
      div.style.justifyContent = "center"
      div.style.alignItems = "center"
      div.style.borderRadius = "13px"
      div.style.background = "red"
      input?.appendChild(div)
      return div

    }

    if (event === "div/overlay") {
      const div = document.createElement("div")
      div.classList.add("overlay")
      div.style.display = "flex"
      div.style.flexDirection = "column"
      div.style.height = "100%"
      div.style.width = "100%"
      div.style.zIndex = Number.MAX_SAFE_INTEGER.toString()
      div.style.overscrollBehavior = "none"
      div.style.position = "fixed"
      div.style.top = "0"
      div.style.left = "0"
      div.style.background = this.colors.light.background
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        div.style.background = this.colors.dark.background
      }
      input?.append(div)
      return div
    }

    if (event === "div/scrollable") {
      const div = document.createElement("div")
      div.style.overflowY = "auto"
      div.style.overscrollBehavior = "none"
      div.style.paddingBottom = "144px"

      if (input !== undefined) input.append(div)

      return div
    }

    if (event === "div/service-box") {

      const div = document.createElement("div")
      div.className = "service-box"
      div.style.display = "flex"
      div.style.flexWrap = "wrap"
      div.style.margin = "21px 34px"
      div.style.padding = "8px"
      div.style.borderRadius = "3px"
      div.style.boxShadow = "rgba(0, 0, 0, 0.16) 0px 1px 4px"

      const checkboxWrapper = document.createElement("div")
      checkboxWrapper.className = "checkbox-wrapper"
      checkboxWrapper.style.width = "89px"
      checkboxWrapper.style.display = "flex"
      checkboxWrapper.style.justifyContent = "center"
      checkboxWrapper.style.alignItems = "center"
      div.checkbox = document.createElement("input")
      div.checkbox.type = "checkbox"
      div.checkbox.style.transform = "scale(2)"
      checkboxWrapper.append(div.checkbox)
      div.append(checkboxWrapper)

      div.service = document.createElement("div")
      div.service.className = "service"
      div.service.style.minWidth = "233px"
      div.service.style.display = "flex"
      div.service.style.flexDirection = "column"
      div.service.style.margin = "21px 34px"
      div.service.style.fontSize = "21px"
      div.service.style.fontFamily = "sans-serif"
      div.service.style.flex = "1 1 0px"
      div.appendChild(div.service)

      div.quantity = document.createElement("div")
      div.quantity.className = "quantity"
      div.quantity.style.fontFamily = "sans-serif"
      div.quantity.style.fontSize = "34px"
      div.quantity.style.display = "flex"
      div.quantity.style.alignItems = "center"
      div.quantity.style.justifyContent = "flex-end"
      div.quantity.style.margin = "21px 34px"
      div.appendChild(div.quantity)

      div.singlePrice = document.createElement("div")
      div.singlePrice.className = "single-price"
      div.singlePrice.style.width = "233px"
      div.singlePrice.style.fontFamily = "sans-serif"
      div.singlePrice.style.fontSize = "34px"
      div.singlePrice.style.display = "flex"
      div.singlePrice.style.alignItems = "center"
      div.singlePrice.style.justifyContent = "flex-end"
      div.singlePrice.style.margin = "21px 34px"
      div.appendChild(div.singlePrice)

      div.totalPrice = document.createElement("div")
      div.totalPrice.className = "total-price"
      div.totalPrice.style.width = "233px"
      div.totalPrice.style.fontFamily = "sans-serif"
      div.totalPrice.style.fontSize = "34px"
      div.totalPrice.style.display = "flex"
      div.totalPrice.style.alignItems = "center"
      div.totalPrice.style.justifyContent = "flex-end"
      div.totalPrice.style.margin = "21px 34px"
      div.appendChild(div.totalPrice)

      input?.append(div)
      return div
    }

    if (event === "button/key-value-color") {

      const button = this.create("div")
      button.classList.add("color")
      button.style.display = "flex"
      button.style.flexDirection = "column"
      button.style.justifyContent = "space-between"
      button.style.fontFamily = "sans-serif"
      button.style.width = "89px"
      button.style.height = "55px"
      button.style.margin = "3px"
      button.style.overflow = "auto"
      button.style.padding = "5px"
      button.style.cursor = "pointer"
      button.style.borderRadius = "3px"
      button.style.backgroundColor = input.value

      button.key = this.create("div", button)
      button.key.classList.add("key")
      button.key.style.color = this.colors.light.text
      button.key.textContent = input.key

      button.value = this.create("div", button)
      button.value.classList.add("value")
      button.value.style.fontFamily = "monospace"
      button.value.style.color = this.colors.dark.text
      button.value.textContent = input.value

      return button
    }

    if (event === "button/thumb-down") {

      const button = document.createElement("div")
      button.textContent = "👎"
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.width = "89px"
      button.style.height = "55px"
      button.style.background = "rgb(204,50,50)"
      button.style.borderRadius = "8px"
      button.style.fontSize = "21px"

      input?.append(button)
      return button
    }

    if (event === "button/thumb-up") {

      const button = document.createElement("div")
      button.textContent = "👍"
      button.style.background = "rgb(45,201,55)"
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.height = "55px"
      button.style.width = "89px"
      button.style.color = "white"
      button.style.borderRadius = "8px"
      button.style.fontSize = "21px"

      input?.append(button)
      return button
    }

    if (event === "button/bottom-left") {

      const button = document.createElement("div")
      button.className = "button"
      button.style.position = "fixed"
      button.style.bottom = "0"
      button.style.left = "0"
      button.style.width = "34px"
      button.style.height = "34px"
      button.style.borderRadius = "50%"
      button.style.margin = "34px"
      button.style.padding = "21px"
      button.style.zIndex = "1"
      button.style.cursor = "pointer"
      this.convert("dark-light", button)
      input?.append(button)
      return button
    }

    if (event === "button/bottom-right") {

      const button = document.createElement("div")
      button.className = "button"
      button.style.position = "fixed"
      button.style.bottom = "0"
      button.style.right = "0"
      button.style.width = "34px"
      button.style.height = "34px"
      button.style.borderRadius = "50%"
      button.style.margin = "34px"
      button.style.padding = "21px"
      button.style.zIndex = "1"
      button.style.cursor = "pointer"
      button.style.boxShadow = this.colors.light.boxShadow
      button.style.border = this.colors.light.border
      button.style.backgroundColor = this.colors.light.foreground
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.style.boxShadow = this.colors.dark.boxShadow
        button.style.border = this.colors.dark.border
        button.style.backgroundColor = this.colors.dark.foreground
      }
      input?.append(button)
      return button

    }

    if (event === "button/icon") {

      const button = this.create("div")
      button.classList.add("button")
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.width = "55px"
      button.style.height = "55px"
      button.style.margin = "21px"
      button.style.padding = "13px"
      button.style.cursor = "pointer"
      button.style.borderRadius = "13px"
      button.style.boxShadow = this.colors.light.boxShadow
      button.style.border = this.colors.light.border
      button.style.backgroundColor = this.colors.light.foreground
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.style.boxShadow = this.colors.dark.boxShadow
        button.style.border = this.colors.dark.border
        button.style.backgroundColor = this.colors.dark.foreground
      }
      input?.appendChild(button)
      return button

    }

    if (event === "button/icon-text") {

      const button = document.createElement("div")
      button.style.display = "flex"
      button.style.flexDirection = "column"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.cursor = "pointer"
      button.style.borderRadius = "50%"
      button.style.width = "144px"
      button.style.height = "144px"
      button.style.background = this.colors.light.foreground
      button.style.border = this.colors.light.border
      button.style.boxShadow = this.colors.light.boxShadow
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.style.background = this.colors.dark.foreground
        button.style.border = this.colors.dark.border
        button.style.boxShadow = this.colors.dark.boxShadow
      }
      button.icon = document.createElement("div")
      button.icon.classList.add("icon")
      button.icon.style.width = "55px"
      button.append(button.icon)
      button.text = document.createElement("div")
      button.text.classList.add("text")
      button.text.style.fontFamily = "sans-serif"
      button.text.style.fontSize = "21px"
      button.text.style.margin = "13px"
      button.text.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.text.style.color = this.colors.dark.text
      }
      button.append(button.text)
      input?.append(button)
      return button

    }

    if (event === "button/image-text") {

      const button = this.create("button/top-bottom")
      button.image = document.createElement("img")
      button.image.style.width = "100%"
      button.image.className = "image"
      button.image.src = "/public/image.svg"
      button.top.appendChild(button.image)
      button.text = this.create("div", button.bottom)
      button.text.style.margin = "21px 34px"
      button.text.style.fontSize = "21px"
      button.text.style.fontFamily = "sans-serif"
      input?.appendChild(button)
      return button
    }

    if (event === "button/getyour") {

      const button = this.create("button/bottom-right")
      this.render("icon/node/path", "/public/logo-getyour-red.svg", button)
      input?.append(button)
      return button

    }

    if (event === "button/add") {

      const button = this.create("button/bottom-right")
      button.classList.add("add")
      this.render("icon/node/path", "/public/add.svg", button)
      input?.append(button)
      return button

    }

    if (event === "back-button") {

      const button = this.create("button/bottom-left")
      button.classList.add("back")
      this.render("icon/node/path", "/public/arrow-back.svg", button)
      button.setAttribute("onclick", "window.goBack()")
      this.add("outline-hover", button)
      input?.appendChild(button)
      return button
    }

    if (event === "button/action") {
      const div = document.createElement("div")
      div.className = "button"
      div.style.backgroundColor = this.colors.matte.sunflower
      div.style.color = this.colors.matte.black
      div.style.boxShadow = this.colors.light.boxShadow
      div.style.cursor = "pointer"
      div.style.fontSize = "21px"
      div.style.fontFamily = "sans-serif"
      div.style.borderRadius = "13px"
      div.style.margin = "21px 34px"
      div.style.display = "flex"
      div.style.justifyContent = "center"
      div.style.alignItems = "center"
      div.style.height = "89px"
      input?.appendChild(div)
      return div
    }

    if (event === "button/top-bottom") {

      const button = document.createElement("div")
      button.className = "button"
      button.style.display = "flex"
      button.style.flexDirection = "column"
      button.style.margin = "21px 34px"
      button.style.borderRadius = "13px"
      button.style.overflow = "hidden"
      button.style.cursor = "pointer"
      button.top = document.createElement("div")
      button.top.classList.add("top")
      button.append(button.top)
      button.bottom = document.createElement("div")
      button.bottom.classList.add("bottom")
      button.append(button.bottom)
      button.style.backgroundColor = this.colors.gray[0]
      button.style.border = this.colors.light.border
      button.style.color = this.colors.light.text
      button.style.boxShadow = this.colors.light.boxShadow
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.style.backgroundColor = this.colors.matte.black
        button.style.border = this.colors.dark.border
        button.style.boxShadow = this.colors.dark.boxShadow
        button.style.color = this.colors.dark.text
      }
      input?.append(button)
      return button
    }

    if (event === "button/left-right") {

      const button = document.createElement("div")
      button.classList.add("button")
      button.style.display = "flex"
      button.style.flexWrap = "wrap"
      button.style.justifyContent = "space-between"
      button.style.alignItems = "center"
      button.style.margin = "21px 34px"
      button.style.borderRadius = "13px"
      button.style.cursor = "pointer"

      button.left = document.createElement("div")
      button.left.classList.add("left")
      button.left.style.margin = "21px 34px"
      button.left.style.fontSize = "21px"
      button.left.style.fontFamily = "sans-serif"
      button.left.style.overflow = "auto"
      button.append(button.left)

      button.right = document.createElement("div")
      button.right.classList.add("right")
      button.right.style.margin = "21px 34px"
      button.right.style.fontSize = "13px"
      button.right.style.fontFamily = "sans-serif"
      button.append(button.right)

      button.style.backgroundColor = this.colors.gray[0]
      button.style.border = this.colors.light.border
      button.style.color = this.colors.light.text
      button.style.boxShadow = this.colors.light.boxShadow
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.style.backgroundColor = this.colors.matte.black
        button.style.border = this.colors.dark.border
        button.style.boxShadow = this.colors.dark.boxShadow
        button.style.color = this.colors.dark.text
      }

      if (input !== undefined) input.append(button)

      return button
    }

    if (event === "counter") {
      input.counter = document.createElement("div")
      input.appendChild(input.counter)
      input.counter.classList.add("counter")
      input.counter.style.position = "absolute"
      input.counter.style.display = "flex"
      input.counter.style.justifyContent = "center"
      input.counter.style.alignItems = "center"
      input.counter.style.top = "-8px"
      input.counter.style.right = "-5px"
      input.counter.style.fontFamily = "monospace"
      input.counter.style.fontSize = "21px"
      input.counter.style.borderRadius = "50%"
      input.counter.style.padding = "3px 5px"
      input.counter.textContent = "0"
      this.convert("dark-light", input.counter)
      return input
    }

    if (event === "icon/branch") {

      return new Promise(async(resolve, reject) => {
        try {
          const icon = await this.convert("path/icon", "/public/branch.svg")
          icon.style.width = "55px"
          const svg = icon.firstChild
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            svg.children[0].setAttribute("fill", this.colors.dark.text)
            svg.children[1].setAttribute("fill", this.colors.light.text)
          } else {
            svg.children[0].setAttribute("fill", this.colors.light.text)
            svg.children[1].setAttribute("fill", this.colors.dark.text)
          }
          input?.appendChild(icon)
          resolve(icon)
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "button/html-feedback") {

      const button = document.createElement("div")
      input?.appendChild(button)
      button.classList.add("button")
      button.style.position = "fixed"
      button.style.bottom = "0"
      button.style.right = "0"
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.boxShadow = this.colors.light.boxShadow
      button.style.border = this.colors.light.border
      button.style.backgroundColor = this.colors.light.foreground
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.style.backgroundColor = this.colors.dark.foreground
        button.style.border = this.colors.dark.border
        button.style.boxShadow = this.colors.dark.boxShadow
      }
      button.style.borderRadius = "50%"
      button.style.margin = "34px"
      button.style.padding = "8px"
      button.style.zIndex = "1"
      button.style.cursor = "pointer"
      this.create("icon/branch", button)
      this.create("counter", button)
      return button
    }

    if (event === "button/remove-overlay") {

      const button = this.create("button/bottom-left")
      return new Promise(async(resolve, reject) => {
        try {
          const icon = await this.convert("path/icon", "/public/arrow-back.svg")
          resolve((node) => {
            const clone = button.cloneNode(true)
            clone.appendChild(icon.cloneNode(true))
            this.add("outline-hover", clone)
            this.convert("dark-light", clone)
            clone.onclick = () => node?.remove()
            node?.appendChild(clone)
            return clone
          })
        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "button/role-apps") {


      const button = document.createElement("div")
      button.classList.add("role-apps-button")
      button.style.position = "fixed"
      button.style.bottom = "0"
      button.style.right = "0"
      button.style.boxShadow = this.colors.light.boxShadow
      button.style.border = this.colors.light.border
      button.style.backgroundColor = this.colors.light.foreground
      button.style.width = "34px"
      button.style.height = "34px"
      button.style.borderRadius = "50%"
      button.style.margin = "34px"
      button.style.padding = "21px"
      button.style.cursor = "pointer"

      if (input !== undefined) {
        if (document.querySelector(".role-apps-button") === null) {
          input.append(button)
        }
      }

      return button
    }

    if (event === "field-funnel/login") {

      const funnel = this.create("div/scrollable")
      funnel.emailField = this.create("field/email", funnel)
      funnel.dsgvoField = this.create("field/dsgvo", funnel)
      funnel.submit = this.create("button/action", funnel)
      funnel.submit.style.fontSize = "34px"
      funnel.submit.classList.add("start-login-event")
      funnel.submit.textContent = "Jetzt anmelden"
      this.add("outline-hover", funnel.submit)
      input?.appendChild(funnel)
      return funnel

    }

    if (event === "script/contact-location-expert") {

      const text = `
        <script id="contact-location-expert" type="module">
import {Helper} from "/js/Helper.js"
Helper.add("onclick/selector/contact-location-expert", ".contact-location-expert")
        </script>
      `
      const script = this.convert("text/first-child", text)
      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent
      input?.append(create)
      return create

    }

    if (event === "script/dark-light-body") {

      const text = `
        <script id="dark-light-body" type="module">
import {Helper} from "/js/Helper.js"
Helper.convert("dark-light", document.body)
        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      input?.append(create)
      return create

    }

    if (event === "script/soundbox") {

      const text = /*html*/`
        <script id="soundbox" type="module">
import {Helper} from "/js/Helper.js"

await Helper.add("event/soundbox")
        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      if (input !== undefined) input.append(create)
      return create

    }

    if (event === "script/open-popup-list-mirror-event") {

      const scriptText = `
        <script id="${input.tag}-list-mirror-event" type="module">
import {Helper} from "/js/Helper.js"

const map = {}
map.tag = '${input.tag}'
map.path = \`${input.path}\`

await Helper.add("event/location-list-funnel", map)
        </script>
      `

      const script = this.convert("text/first-child", scriptText)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/empty-helper") {

      const text = /*html*/`
        <script id="${input.id}" type="module">
import {Helper} from "/js/Helper.js"

${input.js}

        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/match-maker-onload") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-onload-${input.name}" type="module">
          import {Helper} from "/js/Helper.js"

          const res = await Helper.request("/verify/match-maker/conditions/", ${conditionsString})

          if (res.status === 200) {

            ${input.js}

          }

        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/match-maker-onclick") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-onclick-${input.name}" type="module">
          import {Helper} from "/js/Helper.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.request("/verify/match-maker/conditions/", ${conditionsString})

          if (res.status === 200) {

            elements.forEach(matchMaker => {
              matchMaker.onclick = async (event) => {
                ${input.js}
              }
            })

          }

        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/match-maker-show") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-show-${input.name}" type="module">
          import {Helper} from "/js/Helper.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          elements.forEach(element => element.style.display = "none")

          const res = await Helper.request("/verify/match-maker/conditions/", ${conditionsString})

          if (res.status === 200) {

            elements.forEach(matchMaker => {
              matchMaker.style.display = null
            })

          }

        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/match-maker-get-list") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-get-list-${input.name}" type="module">
          import {Helper} from "/js/Helper.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.request("/get/match-maker/list/", ${conditionsString}, "${input.tree}")

          if (res.status === 200) {
            const mirror = JSON.parse(res.response)
            await Helper.render("mirror/match-maker-get-list", mirror, "${input.name}")
          }

        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/match-maker-get-keys") {

      const conditionsString = JSON.stringify(input.conditions)
      const mirrorString = JSON.stringify(input.mirror)

      const text = /*html*/`
        <script id="match-maker-get-keys-${input.name}" type="module">
          import {Helper} from "/js/Helper.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.request("/get/match-maker/keys/", ${conditionsString}, ${mirrorString})

          if (res.status === 200) {
            const mirror = JSON.parse(res.response)

            await Helper.render("mirror/match-maker-get-keys", mirror, "${input.name}")

          }

        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/match-maker-get-users") {

      const conditionsString = JSON.stringify(input.conditions)
      const mirrorString = JSON.stringify(input.mirror)

      const text = /*html*/`
        <script id="match-maker-get-users-${input.name}" type="module">
          import {Helper} from "/js/Helper.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.request("/get/match-maker/mirror/", ${conditionsString}, ${mirrorString})
          if (res.status === 200) {
            const mirror = JSON.parse(res.response)
            await Helper.render("mirror/match-maker-get-users", mirror, "${input.name}")
          }

        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/match-maker-remove") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-remove-${input.name}" type="module">
          import {Helper} from "/js/Helper.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.request("/verify/match-maker/conditions/", ${conditionsString})

          if (res.status === 200) {
            elements.forEach(element => element.remove())
          }

        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script/click-funnel-event") {

      const text = `
        <script id="click-funnel-event" type="module">
import {Helper} from "/js/Helper.js"
await Helper.add("event/click-funnel")
        </script>
      `

      const script = this.convert("text/first-child", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.textContent = script.textContent

      return create
    }

    if (event === "script") {
      const script = document.createElement("script")
      script.id = input.id
      script.type = "module"
      script.textContent = `import {Helper} from "/js/Helper.js"\nif (Helper.verifyIs("script-id/disabled", "${script.id}")) throw new Error("'script#${script.id}' disabled")\n`
      script.append(input.js)
      return script
    }

    if (event === "toolbox/action") {

      const button = this.create("button/action")
      button.removeAttribute("class")
      this.add("outline-hover", button)
      input?.appendChild(button)
      return button
    }

    if (event === "toolbox/bottom-right") {

      const button = this.create("button/bottom-right")
      button.removeAttribute("class")
      this.add("outline-hover", button)
      this.convert("dark-light", button)
      input?.appendChild(button)
      return button
    }

    if (event === "toolbox/back") {

      const button = this.create("button/bottom-left")
      button.removeAttribute("class")
      this.render("icon/node/path", "/public/arrow-back.svg", button)
      button.setAttribute("onclick", "window.goBack()")
      this.add("outline-hover", button)
      this.convert("dark-light", button)
      input?.appendChild(button)
      return button
    }

    if (event === "toolbox/getyour") {

      const button = this.create("button/bottom-right")
      button.removeAttribute("class")
      this.render("icon/node/path", "/public/logo-getyour-red.svg", button)
      this.add("outline-hover", button)
      this.convert("dark-light", button)
      input?.appendChild(button)
      return button
    }

    if (event === "toolbox/icon") {

      const button = this.create("button/icon")
      button.removeAttribute("class")
      this.add("outline-hover", button)
      this.convert("dark-light", button)
      input?.appendChild(button)
      return button
    }

    if (event === "toolbox/left-right") {

      const button = this.create("button/left-right")
      button.removeAttribute("class")
      this.add("outline-hover", button)
      this.convert("dark-light", button)
      input?.appendChild(button)
      return button

    }

    if (event === "toolbox/register-html") {

      return new Promise(async(resolve, reject) => {
        try {
          const button = this.create("button/bottom-right")
          button.removeAttribute("class")
          const icon = await this.convert("path/icon", "/public/disk-floppy.svg")
          resolve((node) => {
            const clone = button.cloneNode(true)
            clone.appendChild(icon.cloneNode(true))
            this.convert("dark-light", clone)
            this.add("outline-hover", clone)
            clone.onclick = () => this.add("register-html")
            node?.appendChild(clone)
            return clone
          })
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "field/closed-contacts-email-select") {

      return new Promise(async(resolve, reject) => {
        try {
          const field = this.create("field/select", input)
          field.label.textContent = "Gebe einer Liste von E-Mails aus deinen Kontakten, Schreibrechte"
          const defaultOption = document.createElement("option")
          defaultOption.text = "Bitte warten.."
          field.input.appendChild(defaultOption)
          const res = await this.request("/get/user/tree-closed/", {tree: "contacts"})
          if (res.status === 200) {
            const contacts = JSON.parse(res.response)
            field.input.textContent = ""
            for (let i = 0; i < contacts.length; i++) {
              const contact = contacts[i]
              if (contact.email !== undefined) {
                const option = document.createElement("option")
                option.text = contact.email
                option.value = contact.email
                field.input.appendChild(option)
              }
            }
            resolve(field)
          }
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "field/open-expert-values-path-select") {

      return new Promise(async(resolve, reject) => {
        try {
          const field = this.create("field/select", input)
          field.label.textContent = "Wähle deinen passenden Funnel, aus Werteinheiten aller Experten"

          const defaultOption = document.createElement("option")
          defaultOption.text = "Bitte warten.."
          field.input.append(defaultOption)

          const res = await this.request("/get/user/trees-open/", {trees: ["getyour.expert.platforms"]})
          if (res.status === 200) {
            const users = JSON.parse(res.response)

            field.input.textContent = ""
            for (let i = 0; i < users.length; i++) {
              const user = users[i]
              if (user["getyour.expert.platforms"] !== undefined) {
                for (let i = 0; i < user["getyour.expert.platforms"].length; i++) {
                  const platform = user["getyour.expert.platforms"][i]
                  if (platform.values !== undefined) {
                    for (let i = 0; i < platform.values.length; i++) {
                      const value = platform.values[i]
                      const option = document.createElement("option")
                      option.text = this.convert("text/capital-first-letter", value.path)
                      option.value = value.path
                      field.input.append(option)
                    }
                  }
                }
              }
            }
            resolve(field)
          }

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "field/select") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"
      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.appendChild(field.labelContainer)
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.appendChild(field.label)
      field.input = document.createElement("select")
      field.input.classList.add("field-input")
      field.input.add = (options) => {
        field.input.textContent = ""
        for (let i = 0; i < options.length; i++) {
          const option = document.createElement("option")
          option.classList.add("field-option")
          option.value = options[i]
          option.text = options[i]
          field.input.appendChild(option)
        }
      }
      field.input.select = (options) => {
        for (let i = 0; i < field.input.options.length; i++) {
          const option = field.input.options[i]
          option.selected = false
          for (let z = 0; z < options.length; z++) {
            if (options[z] === option.value) {
              option.selected = true
            }
          }
        }
      }
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.appendChild(field.input)
      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text
      field.label.style.color = this.colors.light.text
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        field.style.backgroundColor = this.colors.dark.foreground
        field.style.border = this.colors.dark.border
        field.style.boxShadow = this.colors.dark.boxShadow
        field.style.color = this.colors.dark.text
        field.label.style.color = this.colors.dark.text
        field.input.style.backgroundColor = this.colors.dark.background
        field.input.style.color = this.colors.dark.text
      }
      input?.appendChild(field)
      return field

    }

    if (event === "field/operator") {

      const field = this.create("field/text")

      field.label.textContent = "Operator"
      field.input.placeholder = ">="
      field.input.maxLength = "2"

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/operator")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/name") {

      const field = this.create("field/text")

      field.label.textContent = "Name"

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/tag")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/js") {

      const field = this.create("field/textarea")

      field.input.style.fontSize = "13px"
      field.input.style.height = "55px"
      field.input.placeholder = "document.querySelector..."

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/js")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/script") {

      const field = this.create("field/textarea")

      field.label.textContent = "HTML Skript"
      field.input.style.fontSize = "13px"
      field.input.placeholder = "<script>..</script>"

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/script")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/field-funnel") {

      const field = this.create("field/textarea")

      field.label.textContent = "Welche Daten soll dein Nutzer, in die Liste, speichern können (field-funnel)"
      field.input.style.fontSize = "13px"
      field.input.placeholder = `<div class="field-funnel">..</div>`

      field.input.setAttribute("accept", "text/field-funnel")
      field.input.setAttribute("required", "true")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/textarea") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)
      field.append(field.labelContainer)

      field.input = document.createElement("textarea")
      field.input.classList.add("field-input")
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)

      this.convert("dark-light", field)

      input?.append(field)
      return field
    }

    if (event === "field/url") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.textContent = "Quell-URL"
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)
      field.append(field.labelContainer)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "url"
      field.input.placeholder = "https://www.meine-quell-url.de/"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/url")

      field.append(field.input)

      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text
      field.label.style.color = this.colors.light.text
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        field.style.backgroundColor = this.colors.dark.foreground
        field.style.border = this.colors.dark.border
        field.style.boxShadow = this.colors.dark.boxShadow
        field.style.color = this.colors.dark.text
        field.label.style.color = this.colors.dark.text
        field.input.style.backgroundColor = this.colors.dark.background
        field.input.style.color = this.colors.dark.text
      }



      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/checkbox") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"
      field.style.alignItems = "flex-start"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.image = document.createElement("div")
      field.image.classList.add("field-label-image")
      field.image.style.minWidth = "34px"
      field.image.style.maxWidth = "34px"
      field.image.style.marginRight = "21px"
      field.labelContainer.append(field.image)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"

      field.labelContainer.append(field.label)

      field.inputContainer = document.createElement("div")
      field.inputContainer.classList.add("field-input-container")
      field.inputContainer.style.display = "flex"
      field.inputContainer.style.alignItems = "center"
      field.inputContainer.style.margin = "21px 89px 21px 34px"
      field.append(field.inputContainer)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "checkbox"
      field.input.style.marginRight = "34px"
      field.input.style.width = "21px"
      field.input.style.height = "21px"
      field.inputContainer.append(field.input)

      field.afterInput = document.createElement("div")
      field.afterInput.classList.add("field-after-input")

      field.afterInput.style.fontFamily = "sans-serif"
      field.afterInput.style.fontSize = "21px"
      field.inputContainer.append(field.afterInput)

      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text
      field.label.style.color = this.colors.light.text
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      field.afterInput.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        field.style.backgroundColor = this.colors.dark.foreground
        field.style.border = this.colors.dark.border
        field.style.boxShadow = this.colors.dark.boxShadow
        field.style.color = this.colors.dark.text
        field.label.style.color = this.colors.dark.text
        field.input.style.backgroundColor = this.colors.dark.background
        field.input.style.color = this.colors.dark.text
        field.afterInput.style.color = this.colors.dark.text
      }

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/dsgvo") {

      const field = this.create("field/checkbox")
      field.input.classList.add("dsgvo-input")
      const label = this.createNode("div", field.label)
      this.createNode("span", label, "Ich habe die")
      const a1 = this.createNode("a", label, "Nutzervereinbarungen")
      a1.style.margin = "0 5px"
      a1.className = "button"
      a1.href = "/nutzervereinbarung/"
      this.createNode("span", label, "und die")
      const a2 = this.createNode("a", label, "Datenschutz Richtlinien")
      a2.style.margin = "0 5px"
      a2.className = "button"
      a2.href = "/datenschutz/"
      this.createNode("span", label, "gelesen und verstanden. Durch meine Anmeldung stimme ich ihnen zu.")
      this.render("icon/node/path", "/public/info-circle.svg", field.image)
      field.input.setAttribute("required", "true")
      field.input.style.transform = "scale(1.4)"
      if (input !== undefined) input.append(field)
      return field

    }

    if (event === "field/trees") {

      const field = this.create("field/textarea")
      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/trees")
      input?.appendChild(field)
      return field
    }

    if (event === "field/tree") {

      const field = this.create("field/text")

      field.input.setAttribute("accept", "text/tree")
      field.input.setAttribute("required", "true")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/path") {

      const field = this.create("field/text")

      field.input.setAttribute("accept", "text/path")
      field.input.setAttribute("required", "true")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/hex") {

      const field = this.create("field/text")

      field.input.setAttribute("accept", "text/hex")
      field.input.setAttribute("required", "true")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/tag") {

      const field = this.create("field/text")
      field.input.setAttribute("accept", "text/tag")
      field.input.setAttribute("required", "true")
      input?.appendChild(field)
      return field
    }

    if (event === "field/pdf-file") {

      const field = this.create("field/file")
      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "application/pdf")

      input?.append(field)
      return field

    }

    if (event === "field/file") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "file"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)

      this.convert("dark-light", field)

      input?.append(field)
      return field
    }

    if (event === "field/tel") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "tel"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)

      this.convert("dark-light", field)

      input?.append(field)
      return field
    }

    if (event === "field/date") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "date"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)

      this.convert("dark-light", field)

      input?.append(field)
      return field
    }

    if (event === "field/number") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "number"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)

      this.convert("dark-light", field)

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/password") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "password"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)

      this.convert("dark-light", field)

      input?.append(field)
      return field
    }

    if (event === "field/range") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "range"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)

      this.convert("dark-light", field)

      input?.append(field)
      return field
    }

    if (event === "field/text") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "text"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)

      this.convert("dark-light", field)

      input?.append(field)
      return field
    }

    if (event === "field/emails") {

      const field = this.create("field/textarea")
      field.input.style.fontFamily = "monospace"
      field.input.style.fontSize = "13px"
      field.input.style.height = "89px"
      field.input.placeholder = `[\n  "meine-erste@email.de",\n  "meine-zweite@email.de"\n]`

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "email/array")

      input?.append(field)
      return field
    }

    if (event === "field/email") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.textContent = "E-Mail Adresse"
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.append(field.label)
      field.append(field.labelContainer)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.classList.add("email-input")
      field.input.type = "email"
      field.input.placeholder = "meine@email.de"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.append(field.input)
      this.add("outline-hover", field.input)

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/email")

      this.convert("dark-light", field)

      input?.append(field)
      return field
    }

    if (event === "field/id") {

      const field = this.create("field/tag")
      field.label.textContent = "Identifikationsname (text/tag)"
      field.input.placeholder = "meine-id"
      this.verify("input/value", field.input)
      this.add("outline-hover", field.input)
      field.input.oninput = () => {
        this.verify("input/value", field.input)
        if (this.verifyIs("id/unique", field.input.value) && this.verifyIs("text/tag", field.input.value)) {
          this.add("style/node/valid", field.input)
        } else {
          this.add("style/node/not-valid", field.input)
        }
      }
      input?.appendChild(field)
      return field
    }

    if (event === "field/lang") {

      const langField = this.create("field/select")
      langField.label.textContent = "Sprache"
      const options = ["aa","ab","ae","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bh","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","io","is","it","iu","ja","jv","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu"]
      for (let i = 0; i < options.length; i++) {
        const option = document.createElement("option")
        option.value = options[i]
        option.text = options[i]
        langField.input.append(option)
      }
      langField.input.value = "de"
      this.add("style/node/valid", langField.input)

      input?.append(langField)
      return langField

    }

    if (event === "field-funnel") {
      const fieldFunnel = this.create("div/scrollable")
      fieldFunnel.classList.add("field-funnel")

      fieldFunnel.submitButton = this.create("button/action", fieldFunnel)
      fieldFunnel.submitButton.classList.add("submit-field-funnel-button")
      fieldFunnel.submitButton.textContent = "Jetzt speichern"

      if (input !== undefined) input.append(fieldFunnel)

      return fieldFunnel
    }

    if (event === "field/audio") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 21px 34px"
      field.labelContainer.style.overflow = "auto"
      field.append(field.labelContainer)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "13px"
      field.labelContainer.append(field.label)

      field.audio = document.createElement("audio")
      field.audio.classList.add("field-audio")
      field.audio.style.fontSize = "21px"
      field.audio.style.width = "100%"
      field.audio.style.borderRadius = "13px"
      field.audio.setAttribute("controls", "")
      field.append(field.audio)

      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        field.style.backgroundColor = this.colors.dark.foreground
        field.style.border = this.colors.dark.border
        field.style.boxShadow = this.colors.dark.boxShadow
      }

      input?.append(field)
      return field
    }

    if (event === "field-funnel/role") {

      const funnel = this.create("div/scrollable")
      funnel.nameField = this.create("field/tag", funnel)
      funnel.nameField.label.textContent = "Rolle"
      funnel.nameField.input.placeholder = "meine-neue-rolle"
      this.verify("input/value", funnel.nameField.input)
      funnel.nameField.input.addEventListener("input", () => this.verify("input/value", funnel.nameField.input))
      funnel.homeField = this.create("field/select", funnel)
      funnel.homeField.label.textContent = "Wohin soll diese Rolle, nach dem Login, weitergeleitet werden"
      funnel.appsField = this.create("field/textarea", funnel)
      funnel.appsField.label.textContent = "Schalte Apps für deine Rolle frei (mit einer Javascript String Liste)"
      funnel.appsField.input.style.height = "144px"
      funnel.appsField.input.placeholder = `["owner", "funnel", ..]`
      funnel.appsField.input.setAttribute("accept", `string/array`)
      funnel.appsField.input.setAttribute("required", "true")
      funnel.appsField.input.value = JSON.stringify([])
      this.verify("input/value", funnel.appsField.input)
      funnel.appsField.input.addEventListener("input", () => this.verify("input/value", funnel.appsField.input))
      funnel.submit = this.create("button/action", funnel)
      funnel.submit.textContent = "Rolle jetzt speichern"
      input?.appendChild(funnel)
      return funnel
    }

    if (event === "answer-box") {

      const answerBox = document.createElement("div")
      answerBox.classList.add("answer-box")

      answerBox.answer = document.createElement("div")
      answerBox.answer.classList.add("answer")
      answerBox.append(answerBox.answer)

      if (input !== undefined) input.append(answerBox)

      answerBox.style.cursor = "pointer"
      answerBox.style.display = "flex"
      answerBox.style.flexDirection = "column"
      answerBox.style.borderRadius = "13px"
      answerBox.style.margin = "8px 0"
      answerBox.style.overflow = "hidden"

      answerBox.style.border = `1px solid ${this.colors.light.text}`

      answerBox.answer.style.fontFamily = "sans-serif"
      answerBox.answer.style.overflow = "auto"
      answerBox.answer.style.margin = "21px 34px"
      answerBox.answer.style.maxHeight = "89px"
      answerBox.answer.style.textAlign = "center"

      return answerBox
    }

    if (event === "title") {
      const title = document.createElement("div")
      title.style.margin = "21px 34px"
      title.style.fontSize = "21px"
      title.style.fontFamily = "sans-serif"


      title.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        title.style.color = this.colors.dark.text
      }

      if (input !== undefined) input.append(title)

      return title
    }

    if (event === "click-funnel") {
      const clickFunnel = this.create("div/scrollable")
      clickFunnel.classList.add("click-funnel")
      if (input !== undefined) input.append(clickFunnel)

      clickFunnel.style.display = "flex"
      clickFunnel.style.justifyContent = "center"
      clickFunnel.style.position = "relative"
      clickFunnel.style.margin = "21px 34px"

      {
        const button = this.create("button/icon-text", clickFunnel)
        button.classList.add("start-click-funnel-button")
        this.render("icon/node/path", "/public/touch-index-finger.svg", button.icon)
        button.text.textContent = "Start"
      }

      {
        const button = this.create("button/icon-text", clickFunnel)
        button.classList.add("end-click-funnel-button")
        button.style.display = "none"
        this.render("icon/node/path", "/public/touch-index-finger.svg", button.icon)
        button.text.textContent = "Speichern"
      }


      return clickFunnel
    }

    if (event === "image-left/text-right") {

      const box = document.createElement("div")
      box.style.display = "flex"
      box.style.borderRadius = "13px"
      box.style.margin = "8px 0"

      box.style.border = `1px solid ${this.colors.light.text}`
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   box.style.border = `1px solid ${this.colors.dark.text}`
      // } else {
      // }

      box.image = document.createElement("div")
      box.image.classList.add("image")
      box.image.style.display = "flex"
      box.image.style.width = "144px"
      box.image.style.borderTopLeftRadius = "13px"
      box.image.style.borderBottomLeftRadius = "13px"
      box.image.style.overflow = "hidden"
      box.append(box.image)

      box.text = document.createElement("div")
      box.image.classList.add("text")
      box.text.style.fontFamily = "sans-serif"
      box.text.style.width = "100%"
      box.text.style.overflow = "auto"
      box.text.style.padding = "8px"
      box.append(box.text)

      if (input !== undefined) input.append(box)

      return box

    }

    if (event === "click-field") {

      const field = document.createElement("div")
      field.classList.add("click-field")

      field.question = document.createElement("label")
      field.question.classList.add("question")
      field.append(field.question)

      field.answers = document.createElement("div")
      field.answers.classList.add("answers")
      field.append(field.answers)

      if (input !== undefined) input.append(field)


      // flexible css

      field.style.borderRadius = "13px"
      field.style.flexDirection = "column"
      field.style.justifyContent = "center"
      field.style.width = "100%"

      field.style.display = "none"


      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   field.style.backgroundColor = this.colors.dark.foreground
      //   field.style.border = this.colors.dark.border
      //   field.style.boxShadow = this.colors.dark.boxShadow
      //   field.style.color = this.colors.dark.text
      // } else {
      // }

      field.question.style.margin = "21px 34px"
      field.question.style.fontFamily = "sans-serif"
      field.question.style.fontSize = "21px"

      field.question.style.color = this.colors.light.text
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   field.question.style.color = this.colors.dark.text
      // } else {
      // }

      field.answers.style.display = "flex"
      field.answers.style.flexDirection = "column"
      field.answers.style.margin = "21px 34px"

      return field
    }

    if (event === "click/field") {


      const field = document.createElement("div")
      field.classList.add("click-field")
      field.style.borderRadius = "13px"
      field.style.flexDirection = "column"
      field.style.justifyContent = "center"
      field.style.width = "100%"

      field.style.display = "none"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        field.style.backgroundColor = this.colors.dark.foreground
        field.style.border = this.colors.dark.border
        field.style.boxShadow = this.colors.dark.boxShadow
        field.style.color = this.colors.dark.text
      } else {
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text
      }

      field.question = document.createElement("label")
      field.question.classList.add("question")
      field.question.style.margin = "21px 34px"
      field.question.style.fontFamily = "sans-serif"
      field.question.style.fontSize = "21px"
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        field.question.style.color = this.colors.dark.text
      } else {
        field.question.style.color = this.colors.light.text
      }
      field.append(field.question)

      field.answers = document.createElement("div")
      field.answers.classList.add("answers")
      field.answers.style.display = "flex"
      field.answers.style.flexDirection = "column"
      field.answers.style.margin = "21px 34px"
      field.append(field.answers)

      if (input !== undefined) input.append(field)

      return field
    }

    if (event === "info/loading") {

      const header = document.createElement("div")
      header.style.display = "flex"
      header.style.flexDirection = "column"
      header.style.justifyContent = "center"
      header.style.alignItems = "center"
      header.style.height = "100%"
      header.loading = this.create("div", header)
      this.render("icon/node/path", "/public/loading.svg", header.loading).then(icon => {
        const svg = icon.querySelector("svg")
        svg.style.fill = this.colors.light.error
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          svg.style.fill = this.colors.dark.error
        }
      })
      header.loading.style.width = "55px"
      header.loading.style.margin = "8px"
      header.info = this.create("div", header)
      header.info.textContent = "Das kann einen Moment dauern .."
      header.info.style.color = this.colors.light.error
      header.info.style.fontSize = "21px"
      header.info.style.fontFamily = "sans-serif"
      input?.append(header)
      return header

    }

    if (event === "info/warning") {
      const element = document.createElement("div")
      element.style.fontSize = "13px"
      element.style.fontFamily = "sans-serif"
      element.style.margin = "21px 34px"
      element.style.padding = "21px 34px"
      element.style.borderRadius = "13px"

      element.style.color = this.colors.light.text
      element.style.backgroundColor = this.colors.light.error

      if (input !== undefined) input.append(element)

      return element
    }

    if (event === "info/success") {
      const element = document.createElement("div")
      element.style.fontSize = "13px"
      element.style.fontFamily = "sans-serif"
      element.style.margin = "21px 34px"
      element.style.padding = "21px 34px"
      element.style.borderRadius = "13px"

      element.style.color = this.colors.light.text
      element.style.backgroundColor = this.colors.light.success

      if (input !== undefined) input.append(element)

      return element
    }

    if (event === "start-button") {

      const button = this.create("button/left-right")
      button.left.textContent = ".start"
      button.right.textContent = "Beginne deine Reise in die digitale Freiheit"
      button.setAttribute("onclick", "window.open('/', '_blank')")
      input?.append(button)
      return button

    }

    if (event === "node") {

    }

  }

  static colors = {
    matte: {
      green: '#00C853',
      lightGray: '#EAEAEA',
      orange: '#E8A435',
      sunflower: '#EFA514',
      apricot: '#FBCEB1',
      red: '#EE7A7A',
      mint: '#72E6CB',
      seaGreen: '#277E71',
      black: '#303030',
      charcoal: '#444444',
      slate: '#555555',
      deepBlue: '#003366',
      forest: '#09443C',
      maroon: '#801515',
      mustard: '#9A8700',
      plum: '#4F2D56',
      chocolate: '#3D1F0D',
      steel: '#555B6E',
      white: '#F0F0F0',
      snow: '#FAFAFA',
      ash: '#C0C0C0',
      skyBlue: '#A3C1D1',
      mintGreen: '#84B082',
      coral: '#D46A6A',
      lemon: '#FFEB99',
      lavender: '#D8C8EA',
      almond: '#E9D6AF',
      pearl: '#F2F2F2',
      chartreuse: '#B5E288',
      celadon: '#ACE1Af',
      royalBlue: '#4169E1',
      olive: '#808000',
      teal: '#008080',
      raspberry: '#B5014E',
      sand: '#CDB79E',
      navy: '#000080',
      emerald: '#50C878',
      tangerine: '#FFA500',
      lilac: '#C8A2C8',
      taupe: '#483C32',
      lime: '#9FCB8D',
      lightYellow: "#F7AA20"
    },
    gray: {
      0: "#EAEAEA",
      1: "#DCDCDC",
      2: "#CDCDCD",
      3: "#C6C6C6",
      4: "#ADADAD",
      5: "#939393",
    },
    dark: {
      foreground: '#303030',
      background: '#28282B',
      boxShadow: `0 1px 3px ${this.convert("hex/rgba", {hex: "#FFFFFF", alpha: "0.13"})}`,
      border: '0.3px solid #2E4369',
      primary: '#2E4369',
      secondary: '#4E6172',
      accent: '#6D8898',
      text: '#CDD9E5',
      error: '#9B3C38',
      success: '#285D34',
    },
    light: {
      foreground: '#FAFAFA',
      background: '#F0F0F0',
      border: '0.3px solid #A0A0A0',
      boxShadow: `0 1px 3px ${this.convert("hex/rgba", {hex: "#000000", alpha: "0.13"})}`,
      primary: '#A0A0A0',
      secondary: '#7C7C7C',
      accent: '#595959',
      text: '#333333',
      error: '#B03535',
      success: '#9FCB8D',
    },
    link: {
      color: "#4169E1",
      active: "#D46A6A"
    },
    key: "#2E95D3",
    value: "#CE9178",
  }

  static convert(event, input) {
    // event = input/to

    if (event === "query/css") {
      const match = input.match(/{([^{}]*)}/)

      if (match && match[1]) {
        return match[1].trim()
      }

    }

    if (event === "query/selector") {
      const match = input.match(/{(.*?){/)

      if (match && match[1]) {
        return match[1].trim()
      }

    }

    if (event === "api/sources") {
      return new Promise(async(resolve, reject) => {
        try {

          const response = await fetch(input)
          const data = await response.json()

          if (input.startsWith("https://www.googleapis.com/")) {
            // console.log("from googleapis.com")
            // console.log(data)
            if (data.items !== undefined) {
              const sources = []
              for (let i = 0; i < data.items.length; i++) {
                const source = data.items[i]

                const map = {}
                map.api = input
                map.keywords = []

                if (source.volumeInfo) {
                  if (source.volumeInfo.title) {
                    map.title = source.volumeInfo.title
                    const titleWords = map.title.split(" ")
                    for (let i = 0; i < titleWords.length; i++) {
                      map.keywords.push(titleWords[i])
                    }
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.authors) {
                    map.authors = source.volumeInfo.authors
                    for (let i = 0; i < map.authors.length; i++) {
                      map.keywords.push(map.authors[i])
                    }
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.subtitle) {
                    const subTitleWords = source.volumeInfo.subtitle.split(" ")
                    for (let i = 0; i < subTitleWords.length; i++) {
                      map.keywords.push(subTitleWords[i])
                    }
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.categories) {
                    for (let i = 0; i < source.volumeInfo.categories.length; i++) {
                      map.keywords.push(source.volumeInfo.categories[i])
                    }
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.printType) {
                    if (source.volumeInfo.printType.toLowerCase() === "book") {
                      map.type = "text/book"
                      map.keywords.push(map.type)
                    }
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.description) {
                    map.description = source.volumeInfo.description
                    const descriptionWords = source.volumeInfo.description.split(" ")
                    for (let i = 0; i < descriptionWords.length; i++) {
                      map.keywords.push(descriptionWords[i])
                    }
                  }
                }

                if (source.searchInfo) {
                  if (source.searchInfo.textSnippet) {
                    const searchInfoWords = source.searchInfo.textSnippet.split(" ")
                    for (let i = 0; i < searchInfoWords.length; i++) {
                      map.keywords.push(searchInfoWords[i])
                    }
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.language) {
                    map.language = []
                    map.language.push(source.volumeInfo.language.slice(0, 2))
                    map.keywords.push(map.language)
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.imageLinks) {
                    if (source.volumeInfo.imageLinks.thumbnail) {
                      map.image = source.volumeInfo.imageLinks.thumbnail
                    }
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.publishedDate) {
                    if (source.volumeInfo.publishedDate) {
                      map.published = new Date(source.volumeInfo.publishedDate).getTime()
                      map.keywords.push(this.convert("millis/yyyy", map.published))
                    }
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.publisher) {
                    map.publisher = []
                    map.publisher.push(source.volumeInfo.publisher)
                    map.keywords.push(source.volumeInfo.publisher)
                  }
                }

                if (source.volumeInfo) {
                  if (source.volumeInfo.industryIdentifiers) {
                    map.isbn = []
                    for (let i = 0; i < source.volumeInfo.industryIdentifiers.length; i++) {
                      const it = source.volumeInfo.industryIdentifiers[i]
                      map.isbn.push(it.identifier)
                    }
                  }
                }

                sources.push(map)
              }

              resolve(sources)
            }
          }

          if (input.startsWith("https://openlibrary.org/")) {
            // console.log("from openlibrary.org")
            // console.log(data)
            if (data.docs !== undefined) {
              const sources = []
              for (let i = 0; i < data.docs.length; i++) {
                const source = data.docs[i]

                const map = {}
                map.api = input
                map.keywords = []

                if (source.title) {
                  map.title = source.title
                  const titleWords = map.title.split(" ")
                  for (let i = 0; i < titleWords.length; i++) {
                    map.keywords.push(titleWords[i])
                  }
                }

                if (source.author_name) {
                  map.authors = source.author_name
                  for (let i = 0; i < map.authors.length; i++) {
                    map.keywords.push(map.authors[i])
                  }
                }

                if (source.seed) {
                  for (let i = 0; i < source.seed.length; i++) {
                    const seed = source.seed[i]
                    if (seed.includes("book")) {
                      map.type = "text/book"
                    }
                  }
                }

                if (source.publisher) {
                  map.publisher = source.publisher
                  for (let i = 0; i < source.publisher.length; i++) {
                    const publisher = source.publisher[i]
                    map.keywords.push(publisher)
                  }
                }

                if (source.contributer) {
                  for (let i = 0; i < source.contributer.length; i++) {
                    const contributer = source.contributer[i]
                    map.keywords.push(contributer)
                  }
                }

                if (source.subject) {
                  for (let i = 0; i < source.subject.length; i++) {
                    const subject = source.subject[i]
                    map.keywords.push(subject)
                  }
                }

                if (source.first_publish_year) {
                  if (source.first_publish_year) {
                    map.published = new Date(source.first_publish_year, 0, 1).getTime()
                    map.keywords.push(this.convert("millis/yyyy", map.published))
                  }
                }

                if (source.isbn) {
                  map.isbn = source.isbn
                }

                if (source.language) {
                  map.language = []
                  for (let i = 0; i < source.language.length; i++) {
                    const language = source.language[i]
                    map.language.push(language.slice(0, 2))
                  }
                }

                sources.push(map)
              }

              resolve(sources)
            }
          }

          if (input.startsWith("https://archive.org/")) {
            // console.log("from archive.org")
            // console.log(data)
            if (data.response !== undefined) {
              if (data.response.docs !== undefined) {
                const sources = []
                for (let i = 0; i < data.response.docs.length; i++) {
                  const source = data.response.docs[i]

                  const map = {}
                  map.api = input
                  map.keywords = []

                  if (source.title) {
                    map.title = source.title
                    const titleWords = map.title.split(" ")
                    for (let i = 0; i < titleWords.length; i++) {
                      map.keywords.push(titleWords[i])
                    }
                  }

                  if (source.subject) {
                    for (let i = 0; i < source.subject.length; i++) {
                      const subject = source.subject[i]
                      map.keywords.push(subject)
                    }
                  }

                  if (source.mediatype) {
                    if (source.mediatype === "texts") {
                      map.type = "text/book"
                      map.keywords.push(map.type)
                    }
                  }

                  if (source.publisher) {
                    map.publisher = []
                    map.publisher.push(source.publisher)
                    map.keywords.push(source.publisher)
                  }

                  if (source.date) {
                    map.published = new Date(source.date).getTime()
                    map.keywords.push(this.convert("millis/yyyy", map.published))
                  }

                  if (source.creator) {
                    map.authors = []
                    map.authors.push(source.creator)
                    map.keywords.push(source.creator)
                  }

                  if (source.description) {
                    if (this.verifyIs("text", source.description)) {
                      map.description = source.description
                      const descriptionWords = source.description.split(" ")
                      for (let i = 0; i < descriptionWords.length; i++) {
                        map.keywords.push(descriptionWords[i])
                      }
                    }

                    if (this.verifyIs("array", source.description)) {
                      map.description = ""
                      for (let i = 0; i < source.description.length; i++) {
                        const description = source.description[i]
                        map.keywords.push(description)
                        map.description += description
                      }
                    }
                  }

                  if (source.genre) {
                    map.keywords.push(source.genre)
                  }

                  sources.push(map)
                }

                resolve(sources)
              }
            }
          }

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "array/reduce-selected-price") {
      return input.filter(it => it.selected === true).reduce((prev, curr) => prev + curr.price, 0)
    }

    if (event === "canvas/file") {
      return new Promise(async(resolve, reject) => {
        try {
          input.toBlob(blob => {
            resolve({
              created: Date.now(),
              type: blob.type,
              size: blob.size,
              dataURL: input.toDataURL()
            })
          })
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "rgb/luminance") {
      const rgb = input.match(/\d+/g).map(Number)
      const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
      return luminance
    }

    if (event === "hex/rgba") {
      const hex = input.hex.replace('#', '')

      var r = parseInt(hex.substring(0, 2), 16)
      var g = parseInt(hex.substring(2, 4), 16)
      var b = parseInt(hex.substring(4, 6), 16)

      if (input.alpha < 0 || input.alpha > 1) {
        throw new Error('The alpha value must be between 0 and 1.');
      }

      var rgba = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + input.alpha + ')';

      return rgba
    }

    if (event === "markdown/div") {

      // test the convert results
      // convert(markdown/html)
      // Convert '#' at the beginning of a line to <h1> tag
      input = input.replace(/^# (.+)$/gm, '<h1>$1</h1>')

      // Convert '##' at the beginning of a line to <h2> tag
      input = input.replace(/^## (.+)$/gm, '<h2>$1</h2>')
      input = input.replace(/^### (.+)$/gm, '<h3>$1</h3>')

      // Convert '*' and '_' for emphasis to <em> tags
      input = input.replace(/(\*|_)(.+?)\1/g, '<em>$2</em>')

      // Convert '**' and '__' for strong emphasis to <strong> tags
      input = input.replace(/(\*\*|__)(.+?)\1/g, '<strong>$2</strong>')

      // Convert lists
      input = input.replace(/^\* (.+)$/gm, '<li>$1</li>')
      input = input.replace(/<li>(.+)<\/li>/g, '<ul>$&</ul>')

      // Convert paragraphs
      input = input.replace(/(.+)$/gm, '<p>$1</p>')

      // Convert fenced code blocks (```)
      input = input.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

      // Convert blockquotes
      // input = input.replace(/>(.+)/gm, '<blockquote>$1</blockquote>')

      // Convert links ([text](url))
      input = input.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

      // Convert inline code (`code`)
      input = input.replace(/`([^`]+)`/g, '<code>$1</code>')

      // Convert images (![alt text](url))
      input = input.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">')

      // Convert horizontal rules (--- or *** or ___)
      input = input.replace(/(\*\*\*|---|___)/g, '<hr>')

      // Convert tables
      input = input.replace(/^[|].*[|]$/gm, function(match) {
        // Extract table headers and rows
        const rows = match.split('\n').filter(Boolean)
        const headers = rows[0].split('|').filter(Boolean)

        // Create the table HTML
        let tableHTML = '<table><thead><tr>'
        headers.forEach(header => {
          tableHTML += `<th>${header.trim()}</th>`
        })
        tableHTML += '</tr></thead><tbody>'

        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].split('|').filter(Boolean)
          tableHTML += '<tr>'
          cells.forEach(cell => {
            tableHTML += `<td>${cell.trim()}</td>`
          })
          tableHTML += '</tr>'
        }

        tableHTML += '</tbody></table>'
        return tableHTML
      })

      // Convert strikethrough (~~text~~)
      input = input.replace(/~~(.+?)~~/g, '<del>$1</del>')

      // Convert task lists
      input = input.replace(/\[ \]/g, '<input type="checkbox" disabled>')
      input = input.replace(/\[x\]/g, '<input type="checkbox" checked disabled>')

      // convert(html/div)
      const div = document.createElement("div")
      div.textContent = input

      return div
    }

    if (event === "tag/capital-first-letter") {
      if (input.includes("-")) {
        const array = input.split("-")

        const results = []
        for (var i = 0; i < array.length; i++) {
          const item = array[i]

          const result = this.convert("text/capital-first-letter", item)
          results.push(result)

        }
        return results.join(" ")

      } else {
        return this.convert("text/capital-first-letter", input)
      }

    }

    if (event === "file/data-url") {
      return new Promise(async(resolve, reject) => {
        try {

          const reader = new FileReader()
          reader.addEventListener("loadend", () => {
            resolve(reader.result)
          })
          reader.readAsDataURL(input)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "file/image-size") {
      return new Promise(async(resolve, reject) => {
        try {

          const reader = new FileReader()
          reader.addEventListener("loadend", () => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            const image = document.createElement("img")
            image.src = reader.result
            image.onload = () => {
              const width = input.size
              const height = input.size * image.height / image.width
              canvas.width = width
              canvas.height = height
              ctx.drawImage(image, 0, 0, width, height)
              resolve(canvas.toDataURL(input.file.type))
            }
          })
          reader.readAsDataURL(input.file)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "file/pdf") {
      return new Promise(async(resolve, reject) => {
        try {
          const fileReader = new FileReader()
          fileReader.onload = async(event) => {

            const dataUrlSize = fileReader.result.length
            if (dataUrlSize > 5 * 1024 * 1024) {
              alert("PDF ist zu groß.")
              throw new Error("pdf too large")
            }

            const newFile = {}
            newFile.name = file.name
            newFile.type = file.type
            newFile.size = dataUrlSize
            newFile.modified = Date.now()
            newFile.dataUrl = fileReader.result

            resolve(newFile)
          }
          fileReader.readAsDataURL(input)
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "file/html") {
      return new Promise(async(resolve, reject) => {
        try {

          const fileReader = new FileReader()
          fileReader.onload = async () => {

            const newFile = {}
            newFile.name = input.name
            newFile.type = input.type
            newFile.size = input.size
            newFile.modified = Date.now()
            newFile.svg = fileReader.result

            resolve(newFile)
          }
          fileReader.readAsText(input)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "file/svg+xml") {
      return new Promise(async(resolve, reject) => {
        try {

          const fileReader = new FileReader()
          fileReader.onload = async () => {

            const newFile = {}
            newFile.name = input.name
            newFile.type = input.type
            newFile.size = input.size
            newFile.modified = Date.now()
            newFile.svg = fileReader.result

            resolve(newFile)
          }
          fileReader.readAsText(input)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "file/binary") {
      return new Promise(async(resolve, reject) => {
        try {

          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsArrayBuffer(input)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "files/binaries") {
      return new Promise(async(resolve, reject) => {
        try {

          const promises = []
          for (var i = 0; i < input.length; i++) {
            const file = input[i]
            const promise = this.convert("file/binary", file)
            promises.push(promise)
          }

          const results = await Promise.all(promises)

          resolve(results)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "select/selected") {

      for (let i = 0; i < input.options.length; i++) {
        const option = input.options[i]
        if (option.selected === true) {
          return option.value
        }
      }

    }

    if (event === "input/image") {

      return new Promise(async(resolve, reject) => {
        const file = input.files[0]

        const allowedMimeTypes = ["image/jpeg", "image/png"]
        const allowedExtensions = ["jpg", "jpeg", "png"]

        if (allowedMimeTypes !== undefined) {
          await this.verifyIs("file/types", {file, types: allowedMimeTypes})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            this.add("style/node/not-valid", input)
            throw error
          })
        }

        if (allowedExtensions !== undefined) {
          await this.verifyIs("file/extensions", {file, extensions: allowedExtensions})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            this.add("style/node/not-valid", input)
            throw error
          })
        }

        const dataUrl = await this.convert("file/image-size", {file, size: 2584})
        const dataUrlSize = this.convert("text/length", dataUrl)
        if (dataUrlSize > 1024 * 1024) {
          alert("Datei ist zu groß.")
          this.add("style/node/not-valid", input)
          throw new Error("image too large")
        }

        const image = {}
        image.name = file.name
        image.type = file.type
        image.size = dataUrlSize
        image.modified = Date.now()
        image.dataUrl = dataUrl
        this.add("style/node/valid", input)
        return resolve(image)

      })


    }

    if (event === "map/div") {

      return new Promise((resolve, reject) => {

        const div = this.create("info/loading", )
        div.classList.add("json")
        div.style.margin = "21px 34px"

        const buttons = document.createElement("div")
        buttons.classList.add("buttons")
        buttons.style.display = "flex"
        buttons.style.justifyContent = "space-between"
        buttons.style.alignItems = "center"
        div.append(buttons)

        const foldAllButton = this.create("div/action", buttons)
        foldAllButton.textContent = "fold"

        foldAllButton.addEventListener("click", function() {
          toggleAllValues("none");
        });

        const unfoldAllButton = this.create("div/action", buttons)
        unfoldAllButton.textContent = "unfold"
        unfoldAllButton.addEventListener("click", function() {
          toggleAllValues("block");
        });

        function toggleAllValues(displayValue) {
          const valueElements = div.querySelectorAll(".key-value");
          valueElements.forEach(element => {
            element.style.display = displayValue;
          });
        }

        function toggleValue(event) {
          const element = event.target.nextSibling
          if (element !== null) {
            element.style.display = element.style.display === "none" ? "block" : "none";
          }
        }

        function processObject(container, obj) {
          for (const key in obj) {
            const value = obj[key];

            const keyElement = Helper.convert("key/div", key)
            const valueElement = Helper.convert("value/div", value)


            if (Helper.verifyIs("string", value)) {
              valueElement.setAttribute("value-type", "string")
            }


            if (Helper.verifyIs("boolean", value)) {
              valueElement.setAttribute("value-type", "boolean")
            }

            const keyName = document.createElement("div")
            keyName.classList.add("key-name")
            keyName.textContent = key

            keyElement.appendChild(keyName)
            container.appendChild(keyElement);
            keyElement.appendChild(valueElement);

            keyElement.addEventListener("click", toggleValue);

            if (typeof value === "object") {
              processObject(valueElement, value);
              valueElement.addEventListener("click", toggleValue);

            } else {
              valueElement.textContent = JSON.stringify(value);
              // return resolve(div)
              // see render map/div
            }
          }
        }

        processObject(div, input);

        // return div
        // return resolve(div)

      })


    }

    if (event === "div/map") {


      if (input.classList.contains("user-json")) {

        const map = {}

        function processJsonKey(container) {
            container.querySelectorAll('.json-key').forEach(element => {

              const keyName = element.querySelector(".key-name")
              const keyValue = element.querySelector(".key-value")

              // check key value
              // if not json key inside

              // if json key inside
              // do it again
              // break until there is no json key inside
              // console.log(keyName.textContent);
              // console.log(JSON.parse(keyName.textContent));
              // let key
              if (keyValue.querySelector(".json-key") !== null) {
                const json = `{${keyName.textContent}: {}}`
                // const json = `{${keyName.textContent}: {${keyValue.textContent}: }}`
                // console.log("value has key", json);

                // try json parse here
                key = JSON.parse(keyName.textContent)
                map[key] = {}
                // console.log("map has key", map);

                // try {
                //   const test = JSON.parse(json)
                //   console.log(test);
                //   processJsonKey(keyValue.querySelector(".json-key"))
                // } catch (error) {
                //   console.log(error);
                // }

              } else {
                const json = `{${keyName.textContent}:${keyValue.textContent}}`
                // console.log("value has value", json);

                if (key !== undefined) {
                  map[key] = keyValue.textContent

                }
                // console.log("map has value", map);
                // map[JSON.parse(keyName.textContent)] = keyValue.textContent

              }

              // tell the json key what type he contains

            })
        }

        // console.log("key", key);
        // console.log("value", value);

        processJsonKey(input)

        console.log("map", map);


      }

    }

    if (event === "key/div") {
      const div = document.createElement("div");
      div.classList.add("json-key")
      div.style.fontFamily = "monospace";
      div.style.cursor = "pointer";
      div.style.fontWeight = "bold";
      div.style.color = "#2e95d3";
      div.style.fontSize = "21px";

      return div
    }

    if (event === "value/div") {
      const div = document.createElement("div");
      div.classList.add("key-value")
      div.style.display = "none";
      div.style.marginLeft = "21px";
      div.style.whiteSpace = "pre-wrap";
      div.style.color = "#ce9178"
      div.style.fontFamily = "monospace"

      return div
    }

    if (event === "json/div") {

      const div = this.create("div/scrollable")
      div.classList.add("json")
      div.style.margin = "21px 34px"
      // div.style.height = "100%"

      const buttons = document.createElement("div")
      buttons.classList.add("buttons")
      buttons.style.display = "flex"
      buttons.style.justifyContent = "space-between"
      buttons.style.alignItems = "center"
      div.append(buttons)

      const foldAllButton = this.create("div/action", buttons)
      foldAllButton.textContent = "fold"

      foldAllButton.addEventListener("click", function() {
        toggleAllValues("none");
      });

      const unfoldAllButton = this.create("div/action", buttons)
      unfoldAllButton.textContent = "unfold"
      unfoldAllButton.addEventListener("click", function() {
        toggleAllValues("block");
      });

      function toggleAllValues(displayValue) {
        const valueElements = div.querySelectorAll(".key-value");
        valueElements.forEach(element => {
          element.style.display = displayValue;
        });
      }

      const jsonObject = JSON.parse(input);

      function toggleValue(event) {
        const element = event.target.nextSibling
        if (element !== null) {
          element.style.display = element.style.display === "none" ? "block" : "none";
        }
      }

      function processObject(container, obj) {
        for (const key in obj) {
          const value = obj[key];

          const keyElement = Helper.convert("key/div", key)
          const valueElement = Helper.convert("value/div", value)


          if (Helper.verifyIs("string", value)) {
            valueElement.setAttribute("value-type", "string")
          }


          if (Helper.verifyIs("boolean", value)) {
            valueElement.setAttribute("value-type", "boolean")
          }

          const keyName = document.createElement("div")
          keyName.classList.add("key-name")
          keyName.textContent = key

          keyElement.appendChild(keyName)
          container.appendChild(keyElement);
          keyElement.appendChild(valueElement);

          keyElement.addEventListener("click", toggleValue);

          if (typeof value === "object") {
            processObject(valueElement, value);
            valueElement.addEventListener("click", toggleValue);

          } else {
            valueElement.textContent = JSON.stringify(value);
          }
        }
      }

      processObject(div, jsonObject);

      return div

    }

    if (event === "map/json") {
      return JSON.stringify(input, null, 2)
    }

    if (event === "field/value") {
      return new Promise(async(resolve, reject) => {

        if (input.fieldInput.tagName === "INPUT") {

          if (input.fieldInput.type === "text") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "email") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "tel") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "range") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "password") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "number") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "file") {

            const promises = []
            for (let i = 0; i < input.fieldInput.files.length; i++) {
              const file = input.fieldInput.files[i]
              const promise = this.convert("file/type", file)

              promises.push(promise)
            }

            const results = await Promise.all(promises)

            const map = {}
            map[input.fieldId] = results
            return resolve(map)
          }

          if (input.fieldInput.type === "date") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "checkbox") {
            const map = {}
            map[input.fieldId] = input.fieldInput.checked
            return resolve(map)
          }

        }

        if (input.fieldInput.tagName === "TEXTAREA") {
          const map = {}
          map[input.fieldId] = input.fieldInput.value
          return resolve(map)
        }

        if (input.fieldInput.tagName === "SELECT") {
          const selected = []
          for (let i = 0; i < input.fieldInput.options.length; i++) {
            const option = input.fieldInput.options[i]
            if (option.selected === true) {
              selected.push(option.value)
            }
          }
          const map = {}
          map[input.fieldId] = selected
          return resolve(map)
        }

      })
    }

    if (event === "field/on-info-click") {

      const labelContainer = input.querySelector(".field-label-container")
      this.add("outline-hover", labelContainer)
      const label = input.querySelector(".field-label")
      if (input.querySelector(".field-image") === null) {
        const image = document.createElement("div")
        image.classList.add("field-image")
        image.style.width = "34px"
        image.style.marginRight = "21px"
        this.render("icon/node/path", "/public/info-circle.svg", image)
        label.before(image)
      }
      labelContainer.style.cursor = "pointer"
      labelContainer.childNodes.forEach(child => child.style.cursor = "pointer")
      labelContainer.onclick = () => {

        this.overlay("info", async overlay => {
          const content = this.create("div/scrollable", overlay)
          content.innerHTML = await Helper.convert("text/purified", input.getAttribute("on-info-click"))
        })
      }
    }

    if (event === "field-input/key-value") {
      return new Promise(async(resolve, reject) => {

        if (input.fieldInput.tagName === "INPUT") {

          if (input.fieldInput.type === "text") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "email") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "tel") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "range") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "password") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "number") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "file") {

            const promises = []
            for (let i = 0; i < input.fieldInput.files.length; i++) {
              const file = input.fieldInput.files[i]
              const promise = this.convert("file/type", file)

              promises.push(promise)
            }

            const results = await Promise.all(promises)

            const map = {}
            map[input.fieldId] = results
            return resolve(map)
          }

          if (input.fieldInput.type === "date") {
            const map = {}
            map[input.fieldId] = input.fieldInput.value
            return resolve(map)
          }

          if (input.fieldInput.type === "checkbox") {
            const map = {}
            map[input.fieldId] = input.fieldInput.checked
            return resolve(map)
          }

        }

        if (input.fieldInput.tagName === "TEXTAREA") {
          const map = {}
          map[input.fieldId] = input.fieldInput.value
          return resolve(map)
        }

        if (input.fieldInput.tagName === "SELECT") {
          const selected = []
          for (let i = 0; i < input.fieldInput.options.length; i++) {
            const option = input.fieldInput.options[i]
            if (option.selected === true) {
              selected.push(option.value)
            }
          }
          const map = {}
          map[input.fieldId] = selected
          return resolve(map)
        }

      })
    }

    if (event === "field-funnel/trees") {
      return new Promise(async(resolve, reject) => {

        try {

          if (this.verifyIs("tag/empty", input.id)) {
            window.alert("Field Funnel ist nicht gültig: id ist kein tag")
            throw new Error("field funnel id is empty")
          }

          const trees = []
          input.querySelectorAll(".field").forEach(field => {


            if (this.verifyIs("tag/empty", field.id)) {
              window.alert("Datenfeld ist nicht gültig: id ist kein tag")
              throw new Error("field id is empty")
            }

            trees.push(`${window.location.pathname.split("/")[2]}.${input.id}.${field.id}`)

          })

          resolve(trees)

        } catch (error) {
          return reject(error)
        }

      })
    }

    if (event === "field-funnel/map") {
      return new Promise(async(resolve, reject) => {

        try {

          const res = await this.verifyIs("field-funnel/valid", input)

          if (res === true) {

            const promises = []
            input.querySelectorAll(".field").forEach(field => {

              if (this.verifyIs("tag/empty", field.id)) {
                window.alert("Datenfeld ist nicht gültig: id ist kein tag")
                return reject(new Error("field tag is empty"))
              }

              field.querySelectorAll(".field-input").forEach(fieldInput => {

                const map = {}
                map.fieldId = field.id
                map.fieldInput = fieldInput

                const promise = this.convert("field-input/key-value", map)

                promises.push(promise)

              })

            })

            const results = await Promise.all(promises)

            const map = results.reduce((result, keyValue) => {
              return { ...result, ...keyValue }
            }, {})

            return resolve(map)

          } else {
            return reject(new Error("funnel invalid"))
          }

        } catch (error) {
          return reject(error)
        }

      })
    }

    if (event === "file/type") {

      if (input.type === "image/png") {
        return new Promise(async (resolve, reject) => {
          const allowedMimeTypes = ["image/png"]
          const allowedExtensions = ["png"]

          await this.verifyIs("file/types", {file: input, types: allowedMimeTypes})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          const fileReader = new FileReader()
          fileReader.onload = () => {

            const dataUrlSize = this.convert("text/length", fileReader.result)
            if (dataUrlSize > 5 * 1024 * 1024) {
              window.alert("Datei ist zu groß: max 5MB")
              return reject(new Error("file too large"))
            }

            const map = {}
            map.name = input.name
            map.type = input.type
            map.size = dataUrlSize
            map.modified = Date.now()
            map.dataUrl = fileReader.result

            return resolve(map)
          }
          fileReader.readAsDataURL(input)

        })
      }

      if (input.type === "image/jpeg") {
        return new Promise(async (resolve, reject) => {
          const allowedMimeTypes = ["image/jpeg"]
          const allowedExtensions = ["jpg", "jpeg"]

          await this.verifyIs("file/types", {file: input, types: allowedMimeTypes})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          const fileReader = new FileReader()
          fileReader.onload = () => {

            const dataUrlSize = this.convert("text/length", fileReader.result)
            if (dataUrlSize > 5 * 1024 * 1024) {
              window.alert("Datei ist zu groß: max 5MB")
              return reject(new Error("file too large"))
            }

            const map = {}
            map.name = input.name
            map.type = input.type
            map.size = dataUrlSize
            map.modified = Date.now()
            map.dataUrl = fileReader.result

            return resolve(map)
          }
          fileReader.readAsDataURL(input)

        })
      }

      if (input.type === "application/pdf") {
        return new Promise(async (resolve, reject) => {
          const allowedMimeTypes = ["application/pdf"]
          const allowedExtensions = ["pdf"]

          await this.verifyIs("file/types", {file: input, types: allowedMimeTypes})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          const fileReader = new FileReader()
          fileReader.onload = () => {

            const dataUrlSize = this.convert("text/length", fileReader.result)
            if (dataUrlSize > 5 * 1024 * 1024) {
              window.alert("Datei ist zu groß: max 5MB")
              return reject(new Error("file too large"))
            }

            const map = {}
            map.name = input.name
            map.type = input.type
            map.size = dataUrlSize
            map.modified = Date.now()
            map.dataUrl = fileReader.result

            return resolve(map)
          }
          fileReader.readAsDataURL(input)

        })
      }

      if (input.type === "text/html") {
        return new Promise(async (resolve, reject) => {
          const allowedMimeTypes = ["text/html"]
          const allowedExtensions = ["html"]

          await this.verifyIs("file/types", {file: input, types: allowedMimeTypes})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          const fileReader = new FileReader()
          fileReader.onload = () => {

            const map = {}
            map.name = input.name
            map.type = input.type
            map.size = input.size
            map.modified = Date.now()
            map.html = this.convert("text/sanitized-html", fileReader.result)

            return resolve(map)
          }
          fileReader.readAsText(input)

        })
      }

      if (input.type === "image/svg+xml") {
        return new Promise(async (resolve, reject) => {
          const allowedMimeTypes = ["image/svg+xml"]
          const allowedExtensions = ["svg"]

          await this.verifyIs("file/types", {file: input, types: allowedMimeTypes})
          .catch(error => {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})
          .catch(error => {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          const fileReader = new FileReader()
          fileReader.onload = () => {

            const map = {}
            map.name = input.name
            map.type = input.type
            map.size = input.size
            map.modified = Date.now()
            map.svg = this.convert("text/sanitized-html", fileReader.result)

            return resolve(map)
          }
          fileReader.readAsText(input)

        })
      }
    }

    if (event === "date/life-path") {
      const digits = [...input.toString()].map(digit => parseInt(digit))

      let sum = 0
      for (let i = 0; i < digits.length; i++) {
        const digit = digits[i]
        if (this.verifyIs("number/empty", digit)) continue
        sum += digit
      }

      while (sum > 9) {
        sum = [...sum.toString()].reduce((acc, digit) => acc + parseInt(digit), 0)
      }

      return sum
    }

    if (event === "date/master") {
      const digits = [...input.toString()].map(digit => parseInt(digit, 10)).filter(Number.isFinite)

       let sum = digits.reduce((acc, digit) => acc + digit, 0)
       let prevSum = sum
       const seenSums = new Set()

       while (![11, 22, 33].includes(sum) && ![0, 1, 4, 6, 7, 9].includes(sum) && !seenSums.has(sum)) {
         seenSums.add(sum)
         prevSum = sum
         sum = [...sum.toString()].map(digit => parseInt(digit, 10)).reduce((acc, digit) => acc + digit, 0)
         if (![11, 22, 33].includes(sum) && ![0, 1, 4, 6, 7, 9].includes(sum)) {
           break
         }
       }

       return ![11, 22, 33].includes(sum) ? prevSum : sum
    }

    if (event === "date/life-path-calc-text") {
      const digits = [...input.toString()].map(digit => parseInt(digit))

      let text
      for (let i = 0; i < digits.length; i++) {
        const digit = digits[i]
        if (this.verifyIs("number/empty", digit)) continue
        if (text === undefined) {
          text = digit
        } else {
          text = text + " + " + digit
        }
      }
      return text
    }

    if (event === "doc/design-mode") {

      const currentMode = document.designMode
      document.designMode = currentMode === "on" ? "off" : "on"
      window.alert("Design Modus wurde erfolgreich umgeschaltet.")

    }

    if (event === "styles/text") {
      const styles = input.style
      const div = document.createElement("div")
      for (let i = 0; i < styles.length; i++) {
        const key = styles[i]
        const value = styles.getPropertyValue(key)
        div.append(`${key}: ${value};\n`)
      }
      return div.textContent

    }

    if (event === "clipboard/text") {
      return navigator.clipboard.readText()
    }

    if (event === "node-text/width") {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      context.font = window.getComputedStyle(input.node).getPropertyValue("font")
      const metrics = context.measureText(input.text)
      return metrics.width
    }

    if (event === "node-text/slice-width") {

      let node = input.node
      let text = input.text
      let width = this.convert("node-text/width", {node, text})
      let greaterThanWidth = false

      while (width > input.width) {
        text = text.slice(0, -1)
        node.textContent = text
        width = this.convert("node-text/width", {node, text})
        greaterThanWidth = true
      }

      if (greaterThanWidth) {
        node.textContent = `${text} ..`
      } else {
        node.textContent = text
      }
      return text

    }

    if (event === "path/field-funnel") {
      return new Promise(async(resolve, reject) => {
        try {
          const text = await this.convert("path/text", input)
          const doc = this.convert("text/doc", text)
          const fieldFunnel = doc.querySelector(".field-funnel")
          if (fieldFunnel) {
            resolve(fieldFunnel)
          }

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "path/icon") {

      return new Promise(async(resolve, reject) => {
        try {
          const text = await this.convert("path/text", input)
          const icon = this.create("div")
          icon.className = "icon"
          icon.style.display = "flex"
          icon.style.justifyContent = "center"
          icon.style.alignItems = "center"
          icon.style.width = "34px"
          const svg = await this.convert("text/first-child", text)
          svg.setAttribute("width", "100%")
          for (let i = 0; i < svg.querySelectorAll("*").length; i++) {
            const node = svg.querySelectorAll("*")[i]
            if (node.hasAttribute("fill")) {
              if (node.getAttribute("fill").includes("#000")) {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  node.setAttribute("fill", this.colors.dark.text)
                } else {
                  node.setAttribute("fill", this.colors.light.text)
                }
              }
            }
            if (node.hasAttribute("stroke")) {
              if (node.getAttribute("stroke").includes("#000")) {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  node.setAttribute("stroke", this.colors.dark.text)
                } else {
                  node.setAttribute("stroke", this.colors.light.text)
                }
              }
            }
          }
          if (svg.hasAttribute("fill")) {
            if (svg.getAttribute("fill").includes("#000")) {
              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                svg.setAttribute("fill", this.colors.dark.text)
              } else {
                svg.setAttribute("fill", this.colors.light.text)
              }
            }
          }
          if (svg.hasAttribute("stroke")) {
            if (svg.getAttribute("stroke").includes("#000")) {
              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                svg.setAttribute("stroke", this.colors.dark.text)
              } else {
                svg.setAttribute("stroke", this.colors.light.text)
              }
            }
          }
          icon.append(svg)
          resolve(icon)
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "path/text") {
      return new Promise(async(resolve, reject) => {
        try {
          const response = await fetch(input)
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
          }
          const result = await response.text()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "text/clipboard") {
      return navigator.clipboard.writeText(input)
    }

    if (event === "text/dark-light") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.color = this.colors.dark.text
      } else {
        input.style.color = this.colors.light.text
      }
    }

    if (event === "text/digest") {
      return new Promise(async(resolve, reject) => {
        try {
          const data = new TextEncoder().encode(input)
          const hashBuffer = await crypto.subtle.digest('SHA-256', data)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
          resolve(hashHex)
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "text/js") {
      return new Promise((resolve, reject) => {
        try {
          eval(input)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "text/marked") {

      const fragment = document.createDocumentFragment()
      input.text.split(new RegExp(`(${input.query})`, 'gi')).forEach(part => {
        const span = document.createElement('span')
        if (part.toLowerCase() === input.query.toLowerCase()) {
          span.style.background = this.colors.matte.orange
        }
        span.appendChild(document.createTextNode(part))
        fragment.appendChild(span)
      })
      if (input.parent) {
        input.parent.textContent = ""
        input.parent.appendChild(fragment)
      }
      return fragment
    }

    if (event === "text/number") {
      return Number(input)
    }

    if (event === "text/doc") {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, "text/html")
      return doc
    }

    if (event === "text/document") {
      return new Promise((resolve, reject) => {

        try {
          document.open()
          document.write(input)
          document.close()
          return resolve()
        } catch (error) {
          return reject(error)
        }

      })
    }

    if (event === "text/first-child") {

      return new Promise(async(resolve, reject) => {
        try {
          const parser = document.createElement("div")
          parser.innerHTML = await Helper.convert("text/purified", input)
          resolve(parser.children[0])
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "text/fragment") {
      const fragment = document.createDocumentFragment()
      const parser = document.createElement("div")
      parser.innerHTML = input
      fragment.appendChild(parser.firstChild)
      return fragment
    }

    if (event === "text/purified") {

      return new Promise(async(resolve, reject) => {
        try {
          await import("/js/purify.min.js")
          const purified = DOMPurify.sanitize(input)
          resolve(purified)
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "text/sanitized") {
      const parser = document.createElement("div")
      parser.textContent = input
      return parser.innerHTML
    }

    if (event === "text/script") {
      const fragment = this.convert("text/fragment", input)
      return fragment.querySelector("script")
    }

    if (event === "js/script") {

      const script = document.createElement("script")
      script.textContent = input
      return script

    }

    if (event === "uri/text") {

      input.replace(/%20/g, "-")
      input.replace(/u%CC%88/g, "ue")
      input.replace(/a%CC%88/g, "ae")
      input.replace(/o%CC%88/g, "oe")
      input.replace(/%2F/g, "-")
      input.replace(/%C3%A4/g, "ae")
      input.replace(/%C3%BC/g, "ue")
      input.replace(/\(/g, "")
      input.replace(/\)/g, "")
      input.replace(/%C3%B6/g, "oe")
      input.replace(/%C3%96/g, "Oe")
      input.replace(/\./g, "-")
      input.replace(/%C3%9F/g, "ss")
      input.replace(/%3F/g, "")
      input.replace(/-$/g, "")

      return input
    }

    if (event === "text/uri") {
      return encodeURIComponent(input)
    }

    if (event === "text/sanitized-html") {
      // events
      input = input.replace(/on\w+="[^"]*"/gi, "")

      // chars
      input = input.replace(/{{(.*?)}}/g, "")
      input = input.replace(/\[\[(.*?)\]\]/g, "")

      // attributes
      input = input.replace(/src=["'`](.*?)["'`]/gi, "")
      input = input.replace(/href=["'`](.*?)["'`]/gi, "")

      // css
      input = input.replace(/expression\([^)]*\)/gi, "")
      input = input.replace(/url\((['"]?)(.*?)\1\)/gi, "")

      // js
      input = input.replace(/javascript:/gi, "")

      // tags
      input = input.replace(/<img\b[^>]*>/gi, "")
      input = input.replace(/<link\b[^>]*>/gi, "")
      input = input.replace(/<input\b[^>]*>/gi, "")
      input = input.replace(/<a\b[^>]*>/gi, "")
      input = input.replace(/<meta\b[^>]*>/gi, "")
      input = input.replace(/<datalist\b[^>]*>/gi, "")
      input = input.replace(/<source\b[^>]*>/gi, "")
      input = input.replace(/<progress\b[^>]*>/gi, "")
      input = input.replace(/<details\b[^>]*>/gi, "")
      input = input.replace(/<summary\b[^>]*>/gi, "")
      input = input.replace(/<script\b[^>]*>/gi, "")
      input = input.replace(/<iframe\b[^>]*>/gi, "")
      input = input.replace(/<object\b[^>]*>/gi, "")
      input = input.replace(/<embed\b[^>]*>/gi, "")
      input = input.replace(/<form\b[^>]*>/gi, "")
      input = input.replace(/<textarea\b[^>]*>/gi, "")
      input = input.replace(/<select\b[^>]*>/gi, "")
      input = input.replace(/<button\b[^>]*>/gi, "")
      input = input.replace(/<base\b[^>]*>/gi, "")
      input = input.replace(/<frame\b[^>]*>/gi, "")
      input = input.replace(/<frameset\b[^>]*>/gi, "")
      input = input.replace(/<applet\b[^>]*>/gi, "")
      input = input.replace(/<audio\b[^>]*>/gi, "")
      input = input.replace(/<video\b[^>]*>/gi, "")
      input = input.replace(/<source\b[^>]*>/gi, "")
      input = input.replace(/<track\b[^>]*>/gi, "")
      input = input.replace(/<canvas\b[^>]*>/gi, "")
      input = input.replace(/<svg\b[^>]*>/gi, "")
      input = input.replace(/<math\b[^>]*>/gi, "")
      input = input.replace(/<template\b[^>]*>/gi, "")
      input = input.replace(/<noscript\b[^>]*>/gi, "")
      input = input.replace(/<noembed\b[^>]*>/gi, "")
      input = input.replace(/<plaintext\b[^>]*>/gi, "")
      input = input.replace(/<marquee\b[^>]*>/gi, "")
      input = input.replace(/<blink\b[^>]*>/gi, "")
      input = input.replace(/<layer\b[^>]*>/gi, "")
      input = input.replace(/<ilayer\b[^>]*>/gi, "")
      input = input.replace(/<basefont\b[^>]*>/gi, "")
      input = input.replace(/<isindex\b[^>]*>/gi, "")
      input = input.replace(/<keygen\b[^>]*>/gi, "")
      input = input.replace(/<command\b[^>]*>/gi, "")

      return input
    }

    if (event === "text/length") {
      return input.length
    }

    if (event === "text/child-nodes") {

      const parser = new DOMParser()
      const doc = parser.parseFromString(input, "text/html")
      return Array.from(doc.body.childNodes)
    }

    if (event === "text/html") {

      const parser = new DOMParser()
      const doc = parser.parseFromString(input, "text/html")
      return doc.body.firstChild
    }

    if (event === "text/field") {

      if (input === "text") {
        return this.create("field/text")
      }

      if (input === "textarea") {
        return this.create("field/textarea")
      }

      if (input === "email") {
        return this.create("field/email")
      }

      if (input === "tel") {
        return this.create("field/tel")
      }

      if (input === "range") {
        return this.create("field/range")
      }

      if (input === "password") {
        return this.create("field/password")
      }

      if (input === "number") {
        return this.create("field/number")
      }

      if (input === "file") {
        return this.create("field/file")
      }

      if (input === "date") {
        return this.create("field/date")
      }

      if (input === "checkbox") {
        return this.create("field/checkbox")
      }

      if (input === "select") {
        return this.create("field/select")
      }

    }

    if (event === "text/h2") {

      const h2 = document.createElement("h2")
      h2.textContent = input
      h2.style.fontFamily = "sans-serif"

      h2.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        h2.style.color = this.colors.dark.text
      }

      return h2
    }

    if (event === "text/span") {
      const span = document.createElement("span")
      span.textContent = input

      return span
    }

    if (event === "text/capital-first-letter") {
      return input.charAt(0).toUpperCase() + input.slice(1)
    }

    if (event === "tree/class") {
      return input.replace(/\./g, "-")
    }

    if (event === "parent/box") {

      if (input.classList.contains("box")) {
        input.classList.toggle("box")

        input.style.margin = null
        input.style.padding = null
        input.style.borderRadius = null
        input.style.boxShadow = null

      } else {

        input.style.margin = "21px 34px"
        input.style.padding = "8px"
        input.style.borderRadius = "3px"
        input.style.boxShadow = "rgba(0, 0, 0, 0.16) 0px 1px 4px"
      }

      return input
    }

    if (event === "parent/space-around") {

      input.style.display = "flex"
      input.style.flexWrap = "wrap"
      input.style.justifyContent = "space-around"

      return input
    }

    if (event === "parent/space-between") {

      input.style.display = "flex"
      input.style.flexWrap = "wrap"
      input.style.justifyContent = "space-between"

      return input
    }

    if (event === "parent/flex-shrink-height") {

      input.style.alignSelf = null

      return input
    }

    if (event === "parent/flex-shrink-width") {

      input.style.width = null

      return input
    }

    if (event === "parent/flex-grow-height") {

      input.style.alignSelf = "stretch"

      return input
    }

    if (event === "parent/flex-grow-width") {

      input.style.width = "100%"

      return input
    }

    if (event === "parent/flex-bottom") {

      input.style.display = "flex"
      input.style.alignItems = "flex-end"

      return input
    }

    if (event === "parent/flex-vertical") {

      input.style.display = "flex"
      input.style.alignItems = "center"

      return input
    }

    if (event === "parent/flex-top") {

      input.style.display = "flex"
      input.style.alignItems = "flex-start"

      return input
    }

    if (event === "parent/flex-right") {

      input.style.display = "flex"
      input.style.alignItems = "flex-end"
      input.style.flexWrap = "wrap"

      return input
    }

    if (event === "parent/flex-center") {

      input.style.display = "flex"
      input.style.alignItems = "center"
      input.style.flexWrap = "wrap"

      return input
    }

    if (event === "parent/flex-left") {

      input.style.display = "flex"
      input.style.alignItems = "flex-start"
      input.style.flexWrap = "wrap"

      return input
    }

    if (event === "parent/flex-column") {

      input.style.flexWrap = null

      input.style.display = "flex"
      input.style.flexDirection = "column"

      return input
    }

    if (event === "parent/flex-row") {

      input.style.flexDirection = null

      input.style.display = "flex"
      input.style.flexWrap = "wrap"

      return input
    }

    if (event === "parent/dark") {


      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (input.tagName === "BODY") {
          input.style.background = this.colors.dark.background
        }
      }


    }

    if (event === "parent/loading") {

      this.convert("element/reset", input)
      input.style.display = "flex"
      input.style.flexDirection = "column"
      input.style.justifyContent = "center"
      input.style.alignItems = "center"
      input.style.height = "100%"
      input.loading = this.create("div", input)
      this.render("icon/node/path", "/public/loading.svg", input.loading)
      input.loading.style.fill = this.colors.light.error
      input.loading.style.width = "55px"
      input.loading.style.margin = "8px"
      input.info = this.create("div", input)
      input.info.textContent = "Das kann einen Moment dauern .."
      input.info.style.color = this.colors.light.error
      input.info.style.fontSize = "13px"
      input.info.style.fontFamily = "sans-serif"
      return input

    }

    if (event === "parent/scrollable") {
      this.convert("element/reset", input)
      input.style.overflowY = "auto"
      input.style.overscrollBehavior = "none"
      input.style.paddingBottom = "144px"
      return input
    }

    if (event === "parent/info") {
      this.convert("element/reset", input)
      input.style.position = "absolute"
      input.style.top = "0"
      input.style.left = "0"
      input.style.height = "89vh"
      input.style.width = "100%"
      input.style.display = "flex"
      input.style.justifyContent = "center"
      input.style.alignItems = "center"
      input.style.zIndex = "-1"
      input.style.fontFamily = "sans-serif"
      input.style.textAlign = "center"

      input.style.color = "gray"

      return input
    }

    if (event === "script/disabled-aware") {

      if (this.verifyIs("text/empty", input.id)) {
        const confirm = window.confirm("Dein Skript hat keine Id. Möchtest du deinem Skript eine Id vergeben?")
        if (confirm) {
          const prompt = window.prompt("Gebe eine Id ein:")
          if (!this.verifyIs("text/empty", prompt)) {
            input.id = prompt
          }
        } else {
          window.alert("Dein Skript braucht eine Id um es schaltbar zu machen.")
          throw new Error("script id required")
        }
      }

      const first = `import {Helper} from "/js/Helper.js"`
      const second = `if (Helper.verifyIs("script-id/disabled", "${input.id}")) throw new Error("script#${input.id} disabled")`

      if (!input.textContent.includes(second)) {
        let text = input.textContent

        if (input.textContent.includes(first)) {
          const regex = new RegExp(`.*${first}.*\n`, "g")
          text = text.replace(regex, "")
        }

        text = first + "\n" + second + "\n" + text
        input.textContent = text
      }

      if (input.textContent.includes("Helper")) {
        input.type = "module"
      } else {
        input.type = "text/javascript"
      }

      return input
    }

    if (event === "script/disabled") {

      this.convert("script/disabled-aware", input)

      const scripts = JSON.parse(window.localStorage.getItem("scripts")) || []
      const map = {}
      map.id = input.id
      map.disabled = true
      scripts.unshift(map)
      window.localStorage.setItem("scripts", JSON.stringify(scripts))
      window.alert("Skript wurde ausgeschaltet.")
    }

    if (event === "script/enabled") {

      this.convert("script/disabled-aware", input)

      const scripts = JSON.parse(window.localStorage.getItem("scripts")) || []
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i]
        if (script.id === input.id) {
          scripts.splice(i, 1)
          window.localStorage.setItem("scripts", JSON.stringify(scripts))
          window.alert("Skript wurde eingeschaltet.")
        }
      }

    }

    if (event === "selector/dark-light") {
      const node = document.querySelector(input)
      if (node) {
        this.convert("dark-light", node)
      }
    }

    if (event === "style/info") {

      input.removeAttribute("style")
      input.textContent = ""
      input.style.margin = "21px 34px"
      input.style.display = "flex"
      input.style.justifyContent = "center"
      input.style.alignItems = "center"
      input.style.fontFamily = "sans-serif"
      input.style.fontSize = "21px"
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.color = this.colors.dark.text
      } else {
        input.style.color = this.colors.light.text
      }
      return input
    }

    if (event === "element/button-right") {
      this.convert("element/reset", input)
      input.style.margin = "21px 34px"
      input.style.fontSize = "13px"
      input.style.fontFamily = "sans-serif"

      input.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.color = this.colors.dark.text
      }

      return input
    }

    if (event === "element/checked") {
      this.convert("element/reset", input)
      input.textContent = "✓"
      input.style.margin = "21px 34px"
      input.style.color = "#00c853"
      input.style.fontSize = "34px"
      input.style.fontFamily = "sans-serif"
      return input
    }

    if (event === "element/scrollable") {
      this.convert("element/reset", input)
      input.style.overflowY = "auto"
      input.style.overscrollBehavior = "none"
      input.style.paddingBottom = "144px"
      return input
    }

    if (event === "millis/dd.mm.yyyy hh:mm") {
      const date = new Date(input)

      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear().toString()
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")

      return `${day}.${month}.${year} ${hours}:${minutes}`
    }

    if (event === "millis/dd.mm.yyyy") {
      const date = new Date(input)

      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear().toString()

      return `${day}.${month}.${year}`
    }

    if (event === "millis/yyyy") {
      const date = new Date(input)
      return date.getFullYear()
    }

    if (event === "element/center") {
      this.convert("element/reset", input)
      input.style.position = "absolute"
      input.style.top = "0"
      input.style.left = "0"
      input.style.height = "89vh"
      input.style.width = "100%"
      input.style.display = "flex"
      input.style.justifyContent = "center"
      input.style.alignItems = "center"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.color = this.colors.dark.text
      } else {
        input.style.color = this.colors.light.text
      }

      return input
    }

    if (event === "text/img") {
      const img = document.createElement("img")
      img.src = input
      return img
    }

    if (event === "text/sources") {

      return new Promise(async(resolve, reject) => {
        try {
          let apis
          if (this.verifyIs("text/isbn", input)) {
            apis = [
              `https://openlibrary.org/isbn/${input}.json`,
              `https://www.googleapis.com/books/v1/volumes?q=isbn:${input}`,
            ]
          } else {
            apis = [
              `https://openlibrary.org/search.json?title=${encodeURIComponent(input)}`,
              `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(input)}`,
              `https://archive.org/advancedsearch.php?q=title:(${encodeURIComponent(input)})&output=json`,
            ]
          }
          const promises = []
          for (let i = 0; i < apis.length; i++) {
            const api = apis[i]
            try {
              const promise = this.convert("api/sources", api)
              promises.push(promise)
            } catch (error) {
              continue
            }

          }
          const results = await Promise.all(promises)
          const sources = [].concat(...results)
          sources.map(it => {
            if (it.published && it.title) {
              it.title = `${it.title} (${this.convert("millis/yyyy", it.published)})`
            }
            return it
          })
          resolve(sources)
        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "element/zero-z-index-child") {
      return new Promise(async(resolve, reject) => {
        try {

          const nodes = Array.from(input.querySelectorAll("*"))
          // const minZIndex = Math.min(...nodes.map(item => parseInt(item.style.zIndex) || 0))

          for (var i = 0; i < nodes.length; i++) {
            const item = nodes[i]

            const itemZIndex = parseInt(item.style.zIndex)

            if (itemZIndex === 0) {
              resolve(item)
            }

          }

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "element/min-z-index-child") {
      return new Promise(async(resolve, reject) => {
        try {

          const nodes = Array.from(input.querySelectorAll("*"))
          const minZIndex = Math.min(...nodes.map(item => parseInt(item.style.zIndex) || 0))

          for (var i = 0; i < nodes.length; i++) {
            const item = nodes[i]

            const itemZIndex = parseInt(item.style.zIndex) || 0

            if (itemZIndex === minZIndex) {
              resolve(item)
            }

          }



        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "element/max-z-index-child") {
      return new Promise(async(resolve, reject) => {
        try {

          const nodes = Array.from(input.querySelectorAll("*"))
          const maxZIndex = Math.max(...nodes.map(item => parseInt(item.style.zIndex) || 0))

          for (var i = 0; i < nodes.length; i++) {
            const item = nodes[i]

            const itemZIndex = parseInt(item.style.zIndex) || 0

            if (itemZIndex === maxZIndex) {
              resolve(item)
            }

          }



        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "element/selector") {
      return new Promise(async(resolve, reject) => {
        try {

          if (!(input instanceof Element)) throw new Error("not an input")

          const tagName = input.tagName.toLowerCase()

          const id = input.id ? `#${input.id}` : ''

          const classes = input.className
            ? `.${input.className.split(' ').join('.')}`
            : ''

          const selector = `${tagName}${id}${classes}`

          resolve(selector)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "element/alias") {

      const output = document.createElement("div")
      output.style.fontFamily = "monospace"
      output.style.fontSize = "13px"
      output.style.overflow = "auto"
      output.style.display = "inline"
      output.textContent = `<${input.tagName.toLowerCase()}`

      if (input.id !== "") {
        const id = document.createElement("span")
        id.style.fontSize = "21px"
        id.textContent = `#${input.id}`
        output.append(id)
      }

      if (input.id === "") {
        if (input.getAttribute("data-id") !== null) {
          const id = document.createElement("span")
          id.style.fontSize = "21px"
          id.textContent = `#${input.getAttribute("data-id")}`
          output.append(id)
        }
      }

      if (input.classList.length > 0) {

        for (let i = 0; i < input.classList.length; i++) {
          const className = input.classList[i]
          const span = document.createElement("span")
          span.style.fontSize = "21px"
          span.textContent = `.${className}`
          output.append(span)
        }

      }

      return output
    }

    if (event === "element/reset") {
      input.removeAttribute("style")
      input.innerHTML = ""
    }

    if (event === "element/textarea") {

      const create = document.createElement("textarea")

      if (input.hasAttribute("id")) {
        create.setAttribute("id", input.getAttribute("id"))
      }

      if (input.hasAttribute("class")) {
        create.setAttribute("class", input.getAttribute("class"))
      }

      if (input.hasAttribute("style")) {
        create.setAttribute("style", input.getAttribute("style"))
      }

      if (input.hasAttribute("required")) {
        create.setAttribute("required", input.getAttribute("required"))
      }

      if (input.hasAttribute("on-info-click")) {
        create.setAttribute("on-info-click", input.getAttribute("on-info-click"))
      }

      input.before(create)
      input.remove()
    }

    if (event === "element/select") {

      const create = document.createElement("select")

      if (input.hasAttribute("id")) {
        create.setAttribute("id", input.getAttribute("id"))
      }

      if (input.hasAttribute("class")) {
        create.setAttribute("class", input.getAttribute("class"))
      }

      if (input.hasAttribute("style")) {
        create.setAttribute("style", input.getAttribute("style"))
      }

      if (input.hasAttribute("on-info-click")) {
        create.setAttribute("on-info-click", input.getAttribute("on-info-click"))
      }

      input.before(create)
      input.remove()
    }

    if (event === "dark-light") {

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.color = this.colors.dark.text
        input.style.background = this.colors.dark.foreground
      } else {
        input.style.color = this.colors.light.text
        input.style.background = this.colors.light.foreground
      }

      if (input.classList.contains("button")) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          input.style.boxShadow = this.colors.dark.boxShadow
          input.style.border = this.colors.dark.border
          input.style.backgroundColor = this.colors.dark.foreground
          input.style.color = this.colors.dark.text
        } else {
          input.style.color = this.colors.light.text
          input.style.boxShadow = this.colors.light.boxShadow
          input.style.border = this.colors.light.border
          input.style.backgroundColor = this.colors.light.foreground
        }
      }

      if (input.tagName === "BODY") {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          input.style.backgroundColor = this.colors.dark.background
          input.style.color = this.colors.dark.text
        } else {
          input.style.color = this.colors.light.text
          input.style.backgroundColor = this.colors.light.background
        }
      }

      if (input.classList.contains("field")) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          input.style.backgroundColor = this.colors.dark.foreground
          input.style.border = this.colors.dark.border
          input.style.boxShadow = this.colors.dark.boxShadow
          input.style.color = this.colors.dark.text
          input.querySelector(".field-label").style.color = this.colors.dark.text
          input.querySelector(".field-input").style.backgroundColor = this.colors.dark.background
          input.querySelector(".field-input").style.color = this.colors.dark.text
          for (let i = 0; i < input.querySelectorAll("*").length; i++) {
            const child = input.querySelectorAll("*")[i]
            if (child.tagName === "A") {
              child.style.color = this.colors.link.active
            }
            if (child.hasAttribute("fill")) {
              child.setAttribute("fill", this.colors.dark.text)
            }
          }
        } else {
          input.style.backgroundColor = this.colors.light.foreground
          input.style.border = this.colors.light.border
          input.style.boxShadow = this.colors.light.boxShadow
          input.style.color = this.colors.light.text
          input.querySelector(".field-label").style.color = this.colors.light.text
          input.querySelector(".field-input").style.backgroundColor = this.colors.light.background
          input.querySelector(".field-input").style.color = this.colors.light.text
          for (let i = 0; i < input.querySelectorAll("*").length; i++) {
            const child = input.querySelectorAll("*")[i]
            if (child.tagName === "A") {
              child.style.color = this.colors.link.color
            }
            if (child.hasAttribute("fill")) {
              child.setAttribute("fill", this.colors.light.text)
            }
          }
        }
      }

      if (input.classList.contains("html-feedback-button")) {

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          input.style.boxShadow = this.colors.dark.boxShadow
          input.style.border = this.colors.dark.border
          input.style.backgroundColor = this.colors.dark.foreground
        } else {
          input.style.boxShadow = this.colors.light.boxShadow
          input.style.border = this.colors.light.border
          input.style.backgroundColor = this.colors.light.foreground
        }
        for (let i = 0; i < input.querySelectorAll("*").length; i++) {
          const child = input.querySelectorAll("*")[i]
          if (child.hasAttribute("fill")) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              if (child.getAttribute("fill") === this.colors.light.text) {
                child.setAttribute("fill", this.colors.dark.text)
              }
              if (child.getAttribute("fill") === this.colors.light.background) {
                child.setAttribute("fill", this.colors.dark.background)
              }
              continue
            } else {
              if (child.getAttribute("fill") === this.colors.dark.text) {
                child.setAttribute("fill", this.colors.light.text)
              }
              if (child.getAttribute("fill") === this.colors.dark.background) {
                child.setAttribute("fill", this.colors.light.background)
              }
              continue
            }
          }
          if (child.classList.contains("feedback-counter")) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              child.style.color = this.colors.dark.text
              child.style.background = this.colors.dark.foreground
            } else {
              child.style.color = this.colors.light.text
              child.style.background = this.colors.light.foreground
            }
          }
        }
      }

      if (input.classList.contains("back-button")) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          input.style.boxShadow = this.colors.dark.boxShadow
          input.style.border = this.colors.dark.border
          input.style.backgroundColor = this.colors.dark.foreground
        } else {
          input.style.boxShadow = this.colors.light.boxShadow
          input.style.border = this.colors.light.border
          input.style.backgroundColor = this.colors.light.foreground
        }
        input.querySelectorAll("*").forEach((child, i) => {
          if (child.hasAttribute("stroke")) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              child.setAttribute("stroke", `${this.colors.dark.text}`)
            } else {
              child.setAttribute("stroke", `${this.colors.light.text}`)
            }
          }
        })
      }

    }

    if (event === "link-colors") {
      input.style.color = this.colors.link.color
      input.addEventListener("click", () => input.style.color = this.colors.link.active)
    }

    if (event === "node/dark-light-toggle") {

      const textColor = window.getComputedStyle(input).color
      const luminance = this.convert("rgb/luminance", textColor)

      if (luminance > 0.5) {
        // text color ist sehr hell

        if (input.classList.contains("field")) {
          input.style.backgroundColor = this.colors.light.foreground
          input.style.border = this.colors.light.border
          input.style.boxShadow = this.colors.light.boxShadow
          input.style.color = this.colors.light.text
          input.querySelector(".field-label").style.color = this.colors.light.text
          input.querySelector(".field-input").style.backgroundColor = this.colors.light.background
          input.querySelector(".field-input").style.color = this.colors.light.text
          for (let i = 0; i < input.querySelectorAll("*").length; i++) {
            const child = input.querySelectorAll("*")[i]
            if (child.tagName === "A") {
              child.style.color = this.colors.link.color
            }
            if (child.hasAttribute("fill")) {
              child.setAttribute("fill", this.colors.light.text)
            }
          }
        }

      } else {
        // text ist sehr dunkel

      }

    }

    if (event === "node/index") {
      return Array.from(input.parentElement.children).indexOf(input)
    }

    if (event === "node/marked") {

      const fragment = document.createDocumentFragment()
      if (input.node) {
        input.node.textContent.split(new RegExp(`(${input.query})`, 'gi')).forEach(part => {
          const span = document.createElement('span')
          if (part.toLowerCase() === input.query.toLowerCase()) {
            span.style.background = this.colors.matte.orange
          }
          span.appendChild(document.createTextNode(part))
          fragment.appendChild(span)
        })
        input.node.textContent = ""
        input.node.appendChild(fragment)
      }
      return fragment
    }

    if (event === "node/max-z-index") {

      let maxZIndex = 0
      for (let i = 0; i < input.children.length; i++) {
        const child = input.children[i]
        const zIndex = getComputedStyle(child).zIndex
        if (zIndex !== 'auto') {
          const zIndexValue = parseInt(zIndex)
          if (!isNaN(zIndexValue)) {
            maxZIndex = Math.max(maxZIndex, zIndexValue)
          }
        }
      }
      return maxZIndex

    }

    if (event === "node/min-z-index") {

      let minZIndex = 0
      for (let i = 0; i < input.children.length; i++) {
        const child = input.children[i]
        const zIndex = getComputedStyle(child).zIndex
        if (zIndex !== 'auto') {
          const zIndexValue = parseInt(zIndex)
          if (!isNaN(zIndexValue)) {
            minZIndex = Math.min(minZIndex, zIndexValue)
          }
        }
      }
      return minZIndex

    }

    if (event === "node/selected") {
      input = document.querySelector("[selected-node='true']")
    }

    if (event === "node/selector") {

      if (!(input instanceof Element)) throw new Error("not an element")
      const tagName = input.tagName.toLowerCase()
      const id = input.id ? `#${input.id}` : ''
      const classes = input.className
      ? `.${input.className.split(' ').join('.')}`
      : ''
      return `${tagName}${id}${classes}`

    }

    if (event === "node/sort-children-by-z-index") {
      Array.from(input.children)
      .sort((a, b) => {
        const zIndexA = parseInt(a.style.zIndex) || 0
        const zIndexB = parseInt(b.style.zIndex) || 0
        return zIndexB - zIndexA
      })
      .forEach(child => input.appendChild(child))
    }

    if (event === "number/k-M") {
      if (input < 1000) return input.toString()
      if (input >= 1000000) return (input / 1000000).toFixed(1) + 'M'
      return (input / 1000).toFixed(1) + 'T'
    }

  }

  static fn(event, input) {

    if (event === "addLargeStyle") {

      return (node) => {
        const query = "(min-width: 1025px)"
        const prompt = window.prompt("Gebe die CSS Eigenschaft, nur für Bildschirme größer als 1025px, ein: (z.B., color: red;)")
        if (!this.verifyIs("text/empty", prompt)) {
          let largeStyle = document.querySelector("style[id='large-device']")
          if (largeStyle === null) {
            const style = document.createElement("style")
            style.type = "text/css"
            style.id = "large-device"
            document.head.appendChild(style)
          }
          largeStyle = document.querySelector("style[id='large-device']")
          const selector = this.convert("node/selector", node)
          largeStyle.append(`\n@media only screen and ${query} {${selector}{${prompt} !important;}}`)
        }
      }
    }

    if (event === "addGridColumn") {

      return (node) => {
        node.style.gridTemplateColumns = `${node.style.gridTemplateColumns} 1fr`
        if (node.lastElementChild) {
          node.appendChild(node.lastElementChild.cloneNode(true))
        }
      }
    }

    if (event === "addGridRow") {

      return (node) => {
        node.style.gridTemplateRows = `${node.style.gridTemplateRows} 1fr`
        if (node.lastElementChild) {
          node.appendChild(node.lastElementChild.cloneNode(true))
        }
      }
    }

    if (event === "addLayerAbove") {

      return (node) => {
        node.style.position = "relative"
        const layer = document.createElement("div")
        layer.classList.add("layer")
        layer.style.position = "absolute"
        layer.style.top = "0"
        layer.style.left = "0"
        layer.style.borderRadius = node.style.borderRadius
        layer.style.backgroundColor = node.style.backgroundColor
        layer.style.width = `${node.offsetWidth}px`
        layer.style.height = `${node.offsetHeight}px`
        let maxZIndex = this.convert("node/max-z-index", node)
        maxZIndex++
        layer.style.zIndex = maxZIndex
        node.appendChild(layer)
        this.convert("node/sort-children-by-z-index", node)
        window.alert("Layer erfolgreich angehängt.")
      }
    }

    if (event === "addLayerBelow") {

      return (node) => {
        node.style.position = "relative"
        const layer = document.createElement("div")
        layer.classList.add("layer")
        layer.style.position = "absolute"
        layer.style.top = "0"
        layer.style.left = "0"
        layer.style.borderRadius = node.style.borderRadius
        layer.style.backgroundColor = node.style.backgroundColor
        layer.style.width = `${node.offsetWidth}px`
        layer.style.height = `${node.offsetHeight}px`
        let minZIndex = this.convert("node/min-z-index", node)
        minZIndex--
        layer.style.zIndex = minZIndex
        node.appendChild(layer)
        this.convert("node/sort-children-by-z-index", node)
        window.alert("Layer erfolgreich angehängt.")
      }
    }

    if (event === "addLayerPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die exakte Ebene für deinen Layer ein: (z.B., 3, -1)")
        if (this.verifyIs("text/int", prompt)) {
          node.style.position = "relative"
          const layer = document.createElement("div")
          layer.classList.add("layer")
          layer.removeAttribute("id")
          layer.style.position = "absolute"
          layer.style.top = "0"
          layer.style.left = "0"
          layer.style.borderRadius = node.style.borderRadius
          layer.style.backgroundColor = node.style.backgroundColor
          layer.style.width = `${node.offsetWidth}px`
          layer.style.height = `${node.offsetHeight}px`
          layer.style.zIndex = prompt
          node.appendChild(layer)
          this.convert("node/sort-children-by-z-index", node)
          window.alert("Layer erfolgreich angehängt.")
        }
      }
    }

    if (event === "addOpacityWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die Sichtbarkeit in Prozent ein: (z.B., 50)")
        const opacity = parseInt(prompt)
        if (opacity >= 0 && opacity <= 100) {
          node.style.opacity = `${prompt / 100}`
        }
      }
    }

    if (event === "addMiddleStyle") {

      return (node) => {
        const query = "(min-width: 601px) and (max-width: 1024px)"
        const prompt = window.prompt("Gebe die CSS Eigenschaft, nur für Bildschirme zwischen 601px und 1024px, ein: (z.B., color: red;)")
        if (!this.verifyIs("text/empty", prompt)) {
          let middleStyle = document.querySelector("style[id='middle-device']")
          if (middleStyle === null) {
            const style = document.createElement("style")
            style.type = "text/css"
            style.id = "middle-device"
            document.head.appendChild(style)
          }
          middleStyle = document.querySelector("style[id='middle-device']")
          const selector = this.convert("node/selector", node)
          middleStyle.append(`\n@media only screen and ${query} {${selector}{${prompt} !important;}}`)
        }
      }
    }

    if (event === "addOuterHtmlToClipboard") {

      return (node) => {
        this.convert("text/clipboard", node.outerHTML).then(() => {
          window.alert("Element wurde erfolgreich in deine Zwischenablage gespeichert.")
        })
      }
    }

    if (event === "addStyleToClipboard") {

      return (node) => {
        if (node.hasAttribute("style")) {
          this.convert("text/clipboard", node.getAttribute("style")).then(() => {
            window.alert("Style wurde erfolgreich in deine Zwischenablage gespeichert.")
          })
        }
      }
    }

    if (event === "addClipboardToStyle") {

      return (node) => {
        this.convert("clipboard/text").then(text => {
          node.setAttribute("style", text)
        })
      }
    }

    if (event === "addPrinterStyle") {

      return (node) => {
        const query = "(max-width: 600px)"
        const prompt = window.prompt("Gebe die CSS Eigenschaft, nur für Drucker, ein: (z.B., color: red;)")
        if (!this.verifyIs("text/empty", prompt)) {
          let printerStyle = document.querySelector("style[id='printer-device']")
          if (printerStyle === null) {
            const style = document.createElement("style")
            style.type = "text/css"
            style.id = "printer-device"
            document.head.appendChild(style)
          }
          printerStyle = document.querySelector("style[id='printer-device']")
          const selector = this.convert("node/selector", node)
          printerStyle.append(`\n@media print {${selector}{${prompt} !important;}}`)
        }
      }
    }

    if (event === "addSmallStyle") {

      return (node) => {
        const query = "(max-width: 600px)"
        const prompt = window.prompt("Gebe die CSS Eigenschaft, nur für Bildschirme kleiner als 600px, ein: (z.B., color: red;)")
        if (!this.verifyIs("text/empty", prompt)) {
          let smallStyle = document.querySelector("style[id='small-device']")
          if (smallStyle === null) {
            const style = document.createElement("style")
            style.type = "text/css"
            style.id = "small-device"
            document.head.appendChild(style)
          }
          smallStyle = document.querySelector("style[id='small-device']")
          const selector = this.convert("node/selector", node)
          smallStyle.append(`\n@media only screen and ${query} {${selector}{${prompt} !important;}}`)
        }
      }
    }

    if (event === "appendAllSvgIcons") {

      async function appendSvgIconsFragment(node, callback, start = 0, end = 8) {
        const fragment = document.createDocumentFragment()
        const res = await Helper.request("/get/svg/list-open/")
        if (res.status === 200) {
          const list = JSON.parse(res.response)
          for (let i = start; i < Math.min(start + end, list.length); i++) {
            const svgName = list[i]
            const button = Helper.create("toolbox/icon")
            const icon = await Helper.convert("path/icon", `/public/${svgName}`)
            button.dataset.src = `/public/${svgName}`
            button.appendChild(icon)
            fragment.appendChild(button)
          }
          node.appendChild(fragment.cloneNode(true))
          const observer = new IntersectionObserver(async (entries) => {
            entries.forEach(async (entry) => {
              const isLast = (start + end - 1) > list.length
              if (isLast) {
                observer.disconnect()
                return
              }
              if (entry.isIntersecting) {
                await appendSvgIconsFragment(node, callback, end, end + end)
                onButtonClick(node, callback)
                observer.unobserve(entry.target)
              }
            })
          })
          const lastIcon = node.lastElementChild
          if (lastIcon) {
            observer.observe(lastIcon)
          }
          onButtonClick(node, callback)
          return fragment
        }
      }

      function onButtonClick(node, callback) {
        for (let i = 0; i < node.children.length; i++) {
          const button = node.children[i]
          Helper.add("outline-hover", button)
          button.onclick = () => callback(button)
        }
      }

      return {appendSvgIconsFragment}
    }

    if (event === "appendClipboardToNode") {

      return (node) => {
        this.convert("clipboard/text").then(text => {
          const html = this.convert("text/first-child", text)
          node.appendChild(html)
        })
      }
    }

    if (event === "appendOrderedListItem") {

      let inner
      return (node) => {

        const ul = document.createElement("ol")
        const li = document.createElement("li")
        ul.appendChild(li)

        if (node.firstChild.tagName === "OL") {
          li.textContent = inner
          node.firstChild.appendChild(li)
        } else {
          inner = node.textContent
          li.textContent = inner
          node.textContent = ""
          node.appendChild(ul)
        }

      }

    }

    if (event === "appendStyleWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Füge deinem Element einen individuellen CSS Befehl hinzu: (z.B., color: red;)")
        if (!this.verifyIs("text/empty", prompt)) {
          if (node.hasAttribute("style")) {
            const result = node.getAttribute("style") + prompt
            node.setAttribute("style", result)
          } else {
            node.setAttribute("style", prompt)
          }
        }
      }
    }

    if (event === "appendUnorderedListItem") {

      let inner
      return (node) => {
        const ul = document.createElement("ul")
        const li = document.createElement("li")
        ul.appendChild(li)
        if (node.firstChild.tagName === "UL") {
          li.textContent = inner
          node.firstChild.appendChild(li)
        } else {
          inner = node.textContent
          li.textContent = inner
          node.textContent = ""
          node.appendChild(ul)
        }
      }
    }

    if (event === "creator-buttons") {

      function toggleDisplayFlexNone(node) {
        if (node.style.display === "none") {
          node.style.display = "flex"
          return
        }
        if (node.style.display === "flex") {
          node.style.display = "none"
          return
        }
      }

      const optionsContainer = this.create("div/scrollable", input.parent)
      optionsContainer.style.marginTop = "21px"
      optionsContainer.style.height = `${window.innerHeight * 0.4}px`

      const valueUnitsTitle = this.render("text/hr", "Meine Werteinheiten", optionsContainer)
      valueUnitsTitle.style.cursor = "pointer"
      this.add("outline-hover", valueUnitsTitle)
      valueUnitsTitle.onclick = () => toggleDisplayFlexNone(valueUnitsOptions)

      const valueUnitsOptions = this.create("div/flex-row", optionsContainer)
      valueUnitsOptions.style.display = "none"
      this.add("outline-hover", valueUnitsOptions)
      const sourcesButton = this.create("toolbox/icon", valueUnitsOptions)
      this.render("icon/node/path", "/public/doc-clip.svg", sourcesButton)
      const addScriptButton = this.create("toolbox/icon", valueUnitsOptions)
      this.render("icon/node/path", "/public/doc-js.svg", addScriptButton)
      const templatesButton = this.create("toolbox/icon", valueUnitsOptions)
      this.render("icon/node/path", "/public/doc-html.svg", templatesButton)
      const pdfsButton = this.create("toolbox/icon", valueUnitsOptions)
      this.render("icon/node/path", "/public/doc-pdf.svg", pdfsButton)
      const imagesButton = this.create("toolbox/icon", valueUnitsOptions)
      this.render("icon/node/path", "/public/doc-image.svg", imagesButton)
      const audiosButton = this.create("toolbox/icon", valueUnitsOptions)
      this.render("icon/node/path", "/public/doc-audio.svg", audiosButton)
      const videosButton = this.create("toolbox/icon", valueUnitsOptions)
      this.render("icon/node/path", "/public/doc-video.svg", videosButton)

      const templatesTitle = this.render("text/hr", "Anwendungen für Vorlagen einsetzen", optionsContainer)
      templatesTitle.style.cursor = "pointer"
      this.add("outline-hover", templatesTitle)
      templatesTitle.onclick = () => toggleDisplayFlexNone(templateOptions)
      const templateOptions = this.create("div/flex-row", optionsContainer)
      templateOptions.style.display = "none"
      this.add("outline-hover", templateOptions)
      const createFlexButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/bars-two.svg", createFlexButton)
      const wrapButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/arrow-wrap.svg", wrapButton)
      const createGridButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/grid-pencil.svg", createGridButton)
      const rowContainerButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/window-half-y.svg", rowContainerButton)
      const columnContainerButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/window-half-x.svg", columnContainerButton)
      const imageTextButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/display-text.svg", imageTextButton)
      const keyValueButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/lines-two-columns.svg", keyValueButton)
      const actionBtnButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/button.svg", actionBtnButton)
      const horizontalHrButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/window-half-x-overline.svg", horizontalHrButton)
      const simpleHeaderButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/window-header-top-1.svg", simpleHeaderButton)
      const h1Button = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/H1.svg", h1Button)
      const h2Button = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/H2.svg", h2Button)
      const h3Button = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/H3.svg", h3Button)
      const pButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/paragraph.svg", pButton)
      const imageButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/image.svg", imageButton)
      const tableHeaderButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/table-header-top.svg", tableHeaderButton)
      const pdfLinkButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/download-pdf.svg", pdfLinkButton)
      const aLinkButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/chain.svg", aLinkButton)
      const spanButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/window-span-x.svg", spanButton)
      const changeSiButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/change-si.svg", changeSiButton)
      const addSpaceButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/arrow-down-two-lines.svg", addSpaceButton)
      const arrowRightButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/arrow-right.svg", arrowRightButton)
      const divScrollableButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/arrow-top-bottom.svg", divScrollableButton)
      const packDivButton = this.create("toolbox/icon", templateOptions)
      this.render("icon/node/path", "/public/arrow-compress-window.svg", packDivButton)

      const inputTitle = this.render("text/hr", "Anwendungen für Eingabe Felder einsetzen", optionsContainer)
      inputTitle.style.cursor = "pointer"
      this.add("outline-hover", inputTitle)
      inputTitle.onclick = () => toggleDisplayFlexNone(inputOptions)
      const inputOptions = this.create("div/flex-row", optionsContainer)
      inputOptions.style.display = "none"
      this.add("outline-hover", inputOptions)
      const textInputButton = this.create("toolbox/icon", inputOptions)
      this.render("icon/node/path", "/public/input-text.svg", textInputButton)
      const numberInputButton = this.create("toolbox/icon", inputOptions)
      this.render("icon/node/path", "/public/input-number.svg", numberInputButton)
      const checkboxInputButton = this.create("toolbox/icon", inputOptions)
      this.render("icon/node/path", "/public/input-checkbox.svg", checkboxInputButton)
      const passwordInputButton = this.create("toolbox/icon", inputOptions)
      this.render("icon/node/path", "/public/input-password.svg", passwordInputButton)
      const selectInputButton = this.create("toolbox/icon", inputOptions)
      this.render("icon/node/path", "/public/input-select.svg", selectInputButton)

      const widthTitle = this.render("text/hr", "Anwendungen für die Breite", optionsContainer)
      widthTitle.style.cursor = "pointer"
      this.add("outline-hover", widthTitle)
      widthTitle.onclick = () => toggleDisplayFlexNone(widthOptions)
      const widthOptions = this.create("div/flex-row", optionsContainer)
      widthOptions.style.display = "none"
      this.add("outline-hover", widthOptions)
      const growWidthButton = this.create("toolbox/icon", widthOptions)
      this.render("icon/node/path", "/public/lines-100-x.svg", growWidthButton)
      const maxWidthButton = this.create("toolbox/icon", widthOptions)
      this.render("icon/node/path", "/public/arrow-left-right-with-lines.svg", maxWidthButton)
      const minWidthButton = this.create("toolbox/icon", widthOptions)
      this.render("icon/node/path", "/public/window-with-arrow-left-right.svg", minWidthButton)
      const exactWidthButton = this.create("toolbox/icon", widthOptions)
      this.render("icon/node/path", "/public/arrow-point-x.svg", exactWidthButton)
      const increaseWidthButton = this.create("toolbox/icon", widthOptions)
      this.render("icon/node/path", "/public/w-up.svg", increaseWidthButton)
      const decreaseWidthButton = this.create("toolbox/icon", widthOptions)
      this.render("icon/node/path", "/public/w-down.svg", decreaseWidthButton)

      const heightTitle = this.render("text/hr", "Anwendungen für die Höhe", optionsContainer)
      heightTitle.style.cursor = "pointer"
      this.add("outline-hover", heightTitle)
      heightTitle.onclick = () => toggleDisplayFlexNone(heightOptions)
      const heightOptions = this.create("div/flex-row", optionsContainer)
      heightOptions.style.display = "none"
      this.add("outline-hover", heightOptions)
      const growHeightButton = this.create("toolbox/icon", heightOptions)
      this.render("icon/node/path", "/public/lines-100-y.svg", growHeightButton)
      const maxHeightButton = this.create("toolbox/icon", heightOptions)
      this.render("icon/node/path", "/public/arrow-top-down-with-lines.svg", maxHeightButton)
      const minHeightButton = this.create("toolbox/icon", heightOptions)
      this.render("icon/node/path", "/public/window-with-arrow-top-down.svg", minHeightButton)
      const exactHeightButton = this.create("toolbox/icon", heightOptions)
      this.render("icon/node/path", "/public/arrow-point-y.svg", exactHeightButton)
      const increaseHeightButton = this.create("toolbox/icon", heightOptions)
      this.render("icon/node/path", "/public/H-up.svg", increaseHeightButton)
      const decreaseHeightButton = this.create("toolbox/icon", heightOptions)
      this.render("icon/node/path", "/public/H-down.svg", decreaseHeightButton)

      const displayTitle = this.render("text/hr", "Anwendungen für Display Elemente", optionsContainer)
      displayTitle.style.cursor = "pointer"
      this.add("outline-hover", displayTitle)
      displayTitle.onclick = () => toggleDisplayFlexNone(displayOptions)
      const displayOptions = this.create("div/flex-row", optionsContainer)
      displayOptions.style.display = "none"
      this.add("outline-hover", displayOptions)
      const exactDisplayButton = this.create("toolbox/icon", displayOptions)
      this.render("icon/node/path", "/public/window-layout-1.svg", exactDisplayButton)
      const displayBlockButton = this.create("toolbox/icon", displayOptions)
      this.render("icon/node/path", "/public/window-header-top-2.svg", displayBlockButton)
      const displayInlineButton = this.create("toolbox/icon", displayOptions)
      this.render("icon/node/path", "/public/window-layout-2.svg", displayInlineButton)
      const toggleDisplayGridButton = this.create("toolbox/icon", displayOptions)
      this.render("icon/node/path", "/public/window-layout-3.svg", toggleDisplayGridButton)
      const toggleDisplayFlexButton = this.create("toolbox/icon", displayOptions)
      this.render("icon/node/path", "/public/window-layout-4.svg", toggleDisplayFlexButton)
      const toggleDisplayTableButton = this.create("toolbox/icon", displayOptions)
      this.render("icon/node/path", "/public/window-layout-5.svg", toggleDisplayTableButton)

      const gridTitle = this.render("text/hr", "Anwendungen für Grid Elemente", optionsContainer)
      gridTitle.style.cursor = "pointer"
      this.add("outline-hover", gridTitle)
      gridTitle.onclick = () => toggleDisplayFlexNone(gridOptions)
      const gridOptions = this.create("div/flex-row", optionsContainer)
      gridOptions.style.display = "none"
      this.add("outline-hover", gridOptions)
      const gridMobileButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-layout-6.svg", gridMobileButton)
      const gridFullDisplayButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-layout-7.svg", gridFullDisplayButton)
      const gridTwoColumnsButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-layout-8.svg", gridTwoColumnsButton)
      const gridThreeColumnsButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-layout-9.svg", gridThreeColumnsButton)
      const gridFixedButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-layout-10.svg", gridFixedButton)
      const gridListRowsButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-layout-11.svg", gridListRowsButton)
      const gridSpanColumnButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-span-x.svg", gridSpanColumnButton)
      const gridSpanRowButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-span-y.svg", gridSpanRowButton)
      const exactGridGapButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/window-layout-12.svg", exactGridGapButton)
      const gridAddColumnButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/dots-plus-line-right.svg", gridAddColumnButton)
      const gridRemoveColumnButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/dots-plus-line-left.svg", gridRemoveColumnButton)
      const gridAddRowButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/dots-plus-line-bottom.svg", gridAddRowButton)
      const gridRemoveRowButton = this.create("toolbox/icon", gridOptions)
      this.render("icon/node/path", "/public/dots-plus-line-top.svg", gridRemoveRowButton)

      const flexTitle = this.render("text/hr", "Anwendungen für Flex Elemente", optionsContainer)
      flexTitle.style.cursor = "pointer"
      this.add("outline-hover", flexTitle)
      flexTitle.onclick = () => toggleDisplayFlexNone(flexOptions)
      const flexOptions = this.create("div/flex-row", optionsContainer)
      flexOptions.style.display = "none"
      this.add("outline-hover", flexOptions)
      const alignColumnButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-y-between-lines.svg", alignColumnButton)
      const alignLeftButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-x-line-left.svg", alignLeftButton)
      const alignCenterButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-x-line-middle.svg", alignCenterButton)
      const alignRightButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-x-line-right.svg", alignRightButton)
      const alignRowButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-x-between-lines.svg", alignRowButton)
      const alignTopButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-y-line-top.svg", alignTopButton)
      const alignVerticalButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-y-line-middle.svg", alignVerticalButton)
      const alignBottomButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-y-line-bottom.svg", alignBottomButton)
      const flexButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/arrow-left-right-lines-between.svg", flexButton)
      const spaceBetweenButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-x-space-between.svg", spaceBetweenButton)
      const spaceAroundButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/bars-x-space-around.svg", spaceAroundButton)
      const toggleWrapButton = this.create("toolbox/icon", flexOptions)
      this.render("icon/node/path", "/public/lines-x-with-arrow.svg", toggleWrapButton)

      const layerTitle = this.render("text/hr", "Anwendungen für die Layer Elemente", optionsContainer)
      layerTitle.style.cursor = "pointer"
      this.add("outline-hover", layerTitle)
      layerTitle.onclick = () => toggleDisplayFlexNone(layerOptions)
      const layerOptions = this.create("div/flex-row", optionsContainer)
      layerOptions.style.display = "none"
      this.add("outline-hover", layerOptions)
      const layerButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/layer.svg", layerButton)
      const positiveLayerButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/layer-plus.svg", positiveLayerButton)
      const negativeLayerButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/layer-minus.svg", negativeLayerButton)
      const exactLayerButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/layer-pencil.svg", exactLayerButton)
      const removeLayerButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/layer-x.svg", removeLayerButton)
      const positionAbsoluteButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/window-with-top-left-arrow-inside.svg", positionAbsoluteButton)
      const positionTopButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/arrow-down-lines-top.svg", positionTopButton)
      const positionRightButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/arrow-left-lines-right.svg", positionRightButton)
      const positionBottomButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/arrow-top-lines-bottom.svg", positionBottomButton)
      const positionLeftButton = this.create("toolbox/icon", layerOptions)
      this.render("icon/node/path", "/public/arrow-right-lines-left.svg", positionLeftButton)

      const transformationTitle = this.render("text/hr", "Anwendungen für die Transformation", optionsContainer)
      transformationTitle.style.cursor = "pointer"
      this.add("outline-hover", transformationTitle)
      transformationTitle.onclick = () => toggleDisplayFlexNone(transformationOptions)
      const transformationOptions = this.create("div/flex-row", optionsContainer)
      transformationOptions.style.display = "none"
      this.add("outline-hover", transformationOptions)
      const transformTranslateButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/window-plus-x-y.svg", transformTranslateButton)
      const transformTranslateXButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/arrow-x-point-y-z.svg", transformTranslateXButton)
      const transformTranslateYButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/arrow-y-point-x-z.svg", transformTranslateYButton)
      const zIndexButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/arrow-z-point-x-y.svg", zIndexButton)
      const scaleButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/window-scale.svg", scaleButton)
      const rotateRightButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/arrow-rotate-right.svg", rotateRightButton)
      const exactRotateRightButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/arrow-rotate-right-x.svg", exactRotateRightButton)
      const rotateLeftButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/arrow-rotate-right.svg", rotateLeftButton).then(icon => {
        icon.style.transform = "rotateY(180deg)"
      })
      const exactRotateLeftButton = this.create("toolbox/icon", transformationOptions)
      this.render("icon/node/path", "/public/arrow-rotate-right-x.svg", exactRotateLeftButton).then(icon => {
        icon.style.transform = "rotateY(180deg)"
      })

      const editTextTitle = this.render("text/hr", "Anwendungen für die Textverarbeitung", optionsContainer)
      editTextTitle.style.cursor = "pointer"
      this.add("outline-hover", editTextTitle)
      editTextTitle.onclick = () => toggleDisplayFlexNone(textManipulationOptions)
      const textManipulationOptions = this.create("div/flex-row", optionsContainer)
      textManipulationOptions.style.display = "none"
      this.add("outline-hover", textManipulationOptions)
      const whiteSpaceNoWrapButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/lines-broken-left.svg", whiteSpaceNoWrapButton)
      const fontFamilyButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/T-sans-serif.svg", fontFamilyButton)
      const fontWeightNormalButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/window-with-N.svg", fontWeightNormalButton)
      const fontWeightButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/B.svg", fontWeightButton)
      const fontStyleButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/I.svg", fontStyleButton)
      const textDecorationButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/underline-U.svg", textDecorationButton)
      const fontSizeButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/T-small-big.svg", fontSizeButton)
      const fontColorButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/underline-A.svg", fontColorButton)
      const backgroundColorButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/window-can-drop.svg", backgroundColorButton)
      const unorderedListButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/dots-3-lines.svg", unorderedListButton)
      const orderedListButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/lines-with-numbers.svg", orderedListButton)
      const lineHeightButton = this.create("toolbox/icon", textManipulationOptions)
      this.render("icon/node/path", "/public/arrow-top-down-3-lines.svg", lineHeightButton)

      const visibilityTitle = this.render("text/hr", "Anwendungen für die Sichtbarkeit", optionsContainer)
      visibilityTitle.style.cursor = "pointer"
      this.add("outline-hover", visibilityTitle)
      visibilityTitle.onclick = () => toggleDisplayFlexNone(visibilityOptions)
      const visibilityOptions = this.create("div/flex-row", optionsContainer)
      visibilityOptions.style.display = "none"
      this.add("outline-hover", visibilityOptions)
      const overflowYButton = this.create("toolbox/icon", visibilityOptions)
      this.render("icon/node/path", "/public/arrow-top-down-with-hand.svg", overflowYButton)
      const overflowXButton = this.create("toolbox/icon", visibilityOptions)
      this.render("icon/node/path", "/public/arrow-left-right-with-hand.svg", overflowXButton)
      const toggleDisplayNoneButton = this.create("toolbox/icon", visibilityOptions)
      this.render("icon/node/path", "/public/row-disappear.svg", toggleDisplayNoneButton)
      const toggleVisibilityHiddenButton = this.create("toolbox/icon", visibilityOptions)
      this.render("icon/node/path", "/public/eye-open.svg", toggleVisibilityHiddenButton)
      const exactOpacityButton = this.create("toolbox/icon", visibilityOptions)
      this.render("icon/node/path", "/public/drop-half-full.svg", exactOpacityButton)

      const spacingTitle = this.render("text/hr", "Anwendungen für die Abstände", optionsContainer)
      spacingTitle.style.cursor = "pointer"
      this.add("outline-hover", spacingTitle)
      spacingTitle.onclick = () => toggleDisplayFlexNone(spacingOptions)
      const spacingOptions = this.create("div/flex-row", optionsContainer)
      spacingOptions.style.display = "none"
      this.add("outline-hover", spacingOptions)
      const toggleMarginButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin.svg", toggleMarginButton)
      const toggleMarginTopButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-top.svg", toggleMarginTopButton)
      const toggleMarginRightButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-right.svg", toggleMarginRightButton)
      const toggleMarginBottomButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-bottom.svg", toggleMarginBottomButton)
      const toggleMarginLeftButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-left.svg", toggleMarginLeftButton)
      const exactMarginButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-x.svg", exactMarginButton)
      const exactMarginTopButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-x-top.svg", exactMarginTopButton)
      const exactMarginRightButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-x-right.svg", exactMarginRightButton)
      const exactMarginBottomButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-x-bottom.svg", exactMarginBottomButton)
      const exactMarginLeftButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/margin-x-left.svg", exactMarginLeftButton)
      const togglePaddingButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding.svg", togglePaddingButton)
      const togglePaddingTopButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-top.svg", togglePaddingTopButton)
      const togglePaddingRightButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-right.svg", togglePaddingRightButton)
      const togglePaddingBottomButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-bottom.svg", togglePaddingBottomButton)
      const togglePaddingLeftButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-left.svg", togglePaddingLeftButton)
      const exactPaddingButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-x.svg", exactPaddingButton)
      const exactPaddingTopButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-x-top.svg", exactPaddingTopButton)
      const exactPaddingRightButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-x-right.svg", exactPaddingRightButton)
      const exactPaddingBottomButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-x-bottom.svg", exactPaddingBottomButton)
      const exactPaddingLeftButton = this.create("toolbox/icon", spacingOptions)
      this.render("icon/node/path", "/public/padding-x-left.svg", exactPaddingLeftButton)

      const borderTitle = this.render("text/hr", "Anwendungen für die Grenzlinien", optionsContainer)
      borderTitle.style.cursor = "pointer"
      this.add("outline-hover", borderTitle)
      borderTitle.onclick = () => toggleDisplayFlexNone(borderOptions)
      const borderOptions = this.create("div/flex-row", optionsContainer)
      borderOptions.style.display = "none"
      this.add("outline-hover", borderOptions)
      const toggleBorderButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/border.svg", toggleBorderButton)
      const toggleBorderTopButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/border-top.svg", toggleBorderTopButton)
      const toggleBorderRightButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/border-right.svg", toggleBorderRightButton)
      const toggleBorderBottomButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/border-bottom.svg", toggleBorderBottomButton)
      const toggleBorderLeftButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/border-left.svg", toggleBorderLeftButton)
      const exactBorderButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/border-point.svg", exactBorderButton)
      const exactBorderTopButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-line-top.svg", exactBorderTopButton)
      const exactBorderRightButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-line-right.svg", exactBorderRightButton)
      const exactBorderBottomButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-line-bottom.svg", exactBorderBottomButton)
      const exactBorderLeftButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-line-left.svg", exactBorderLeftButton)
      const toggleBorderRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/window-rounded.svg", toggleBorderRadiusButton)
      const toggleBorderTopLeftRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-top-left-rounded.svg", toggleBorderTopLeftRadiusButton)
      const toggleBorderTopRightRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-top-right-rounded.svg", toggleBorderTopRightRadiusButton)
      const toggleBorderBottomRightRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-bottom-right-rounded.svg", toggleBorderBottomRightRadiusButton)
      const toggleBorderBottomLeftRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-bottom-left-rounded.svg", toggleBorderBottomLeftRadiusButton)
      const exactBorderRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/window-rounded-with-point.svg", exactBorderRadiusButton)
      const exactBorderTopLeftRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-top-left-rounded-point.svg", exactBorderTopLeftRadiusButton)
      const exactBorderTopRightRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-top-right-rounded-point.svg", exactBorderTopRightRadiusButton)
      const exactBorderBottomRightRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-bottom-right-rounded-point.svg", exactBorderBottomRightRadiusButton)
      const exactBorderBottomLeftRadiusButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/dots-bottom-left-rounded-point.svg", exactBorderBottomLeftRadiusButton)
      const toggleBorderNoneButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/wall-minus.svg", toggleBorderNoneButton)
      const boxButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/box.svg", boxButton)
      const exactBoxShadowButton = this.create("toolbox/icon", borderOptions)
      this.render("icon/node/path", "/public/lines-shadow.svg", exactBoxShadowButton)

      const mediaQueriesTitle = this.render("text/hr", "Anwendungen für Media Queries", optionsContainer)
      mediaQueriesTitle.style.cursor = "pointer"
      this.add("outline-hover", mediaQueriesTitle)
      mediaQueriesTitle.onclick = () => toggleDisplayFlexNone(mediaQueriesOptions)
      const mediaQueriesOptions = this.create("div/flex-row", optionsContainer)
      mediaQueriesOptions.style.display = "none"
      this.add("outline-hover", mediaQueriesOptions)
      const mediaQueriesOverviewButton = this.create("toolbox/icon", mediaQueriesOptions)
      this.render("icon/node/path", "/public/desktop-and-tablet.svg", mediaQueriesOverviewButton)
      const largeDeviceButton = this.create("toolbox/icon", mediaQueriesOptions)
      this.render("icon/node/path", "/public/desktop.svg", largeDeviceButton)
      const middleDeviceButton = this.create("toolbox/icon", mediaQueriesOptions)
      this.render("icon/node/path", "/public/tablet.svg", middleDeviceButton)
      const smallDeviceButton = this.create("toolbox/icon", mediaQueriesOptions)
      this.render("icon/node/path", "/public/mobile.svg", smallDeviceButton)
      const printerDeviceButton = this.create("toolbox/icon", mediaQueriesOptions)
      this.render("icon/node/path", "/public/printer.svg", printerDeviceButton)

      const optimizeWorkTitle = this.render("text/hr", "Anwendungen für schnelle Korrekturen", optionsContainer)
      optimizeWorkTitle.style.cursor = "pointer"
      this.add("outline-hover", optimizeWorkTitle)
      optimizeWorkTitle.onclick = () => toggleDisplayFlexNone(optimizeWorkOptions)
      const optimizeWorkOptions = this.create("div/flex-row", optionsContainer)
      optimizeWorkOptions.style.display = "none"
      this.add("outline-hover", optimizeWorkOptions)
      const insertAfterButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/arrow-under-bar.svg", insertAfterButton)
      const insertBeforeButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/arrow-over-bar.svg", insertBeforeButton)
      const insertLeftButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/arrow-before-bar.svg", insertLeftButton)
      const insertRightButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/arrow-after-bar.svg", insertRightButton)
      const cutOuterHtmlButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/scissor.svg", cutOuterHtmlButton)
      const copyOuterHtmlButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/window-behind-window.svg", copyOuterHtmlButton)
      const pasteOuterHtmlButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/window-pencil.svg", pasteOuterHtmlButton)
      const copyStyleButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/brush.svg", copyStyleButton)
      const pasteStyleButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/mobile-swing.svg", pasteStyleButton)
      const removeStyleButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/rubber.svg", removeStyleButton)
      const removeInnerButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/window-x-right.svg", removeInnerButton)
      const removeInnerWithTextButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/underline-T-with-x.svg", removeInnerWithTextButton)
      const removeNodeButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/image-blocked.svg", removeNodeButton)
      const idButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.style(idButton, {fontFamily: "monospace", fontSize: "34px"})
      idButton.textContent = "id"
      const addClassButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.style(addClassButton, {fontFamily: "monospace", fontSize: "34px"})
      addClassButton.textContent = "cl"
      const setAttributeButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/flag-plus.svg", setAttributeButton)
      const appendStyleButton = this.create("toolbox/icon", optimizeWorkOptions)
      this.render("icon/node/path", "/public/doc-css.svg", appendStyleButton)

      const converterTitle = this.render("text/hr", "Anwendungen für Konverter", optionsContainer)
      converterTitle.style.cursor = "pointer"
      this.add("outline-hover", converterTitle)
      converterTitle.onclick = () => toggleDisplayFlexNone(converterOptions)
      const converterOptions = this.create("div/flex-row", optionsContainer)
      converterOptions.style.display = "none"
      this.add("outline-hover", converterOptions)
      const textConverterButton = this.create("toolbox/icon", converterOptions)
      this.render("icon/node/path", "/public/focus-text.svg", textConverterButton)
      textConverterButton.onclick = () => this.fn("overlay-text-converter")
      const duckDuckGoButton = this.create("toolbox/icon", converterOptions)
      this.render("icon/node/path", "/public/logo-duck-duck-go.svg", duckDuckGoButton)
      duckDuckGoButton.convertNode = this.fn("convertTextContentToDuckDuckGoLink")

      const forEachChildTitle = this.render("text/hr", "Anwendungen für jedes Kind Element", optionsContainer)
      forEachChildTitle.style.cursor = "pointer"
      this.add("outline-hover", forEachChildTitle)
      forEachChildTitle.onclick = () => toggleDisplayFlexNone(forEachChildrenOptions)
      const forEachChildrenOptions = this.create("div/flex-row", optionsContainer)
      forEachChildrenOptions.style.display = "none"
      this.add("outline-hover", forEachChildrenOptions)
      const fontSizeForEachChildButton = this.create("toolbox/icon", forEachChildrenOptions)
      this.render("icon/node/path", "/public/T-small-big.svg", fontSizeForEachChildButton)

      const pickColorTitle = this.render("text/hr", "Anwendungen für Code und Farben wählen", optionsContainer)
      pickColorTitle.style.cursor = "pointer"
      this.add("outline-hover", pickColorTitle)
      pickColorTitle.onclick = () => toggleDisplayFlexNone(colorPickerOptions)
      const colorPickerOptions = this.create("div/flex-row", optionsContainer)
      colorPickerOptions.style.display = "none"
      this.add("outline-hover", colorPickerOptions)
      this.style(colorPickerOptions, {height: "377px", overflow: "auto"})
      for (const [key, value] of Object.entries(this.colors)) {
        if (typeof value === "string") {
          if (!this.verifyIs("text/empty", value)) {
            const color = this.create("button/key-value-color", {key, value})
            this.add("outline-hover", color)
            color.onclick = () => {
              this.convert("text/clipboard", value).then(() => {
                window.alert("Der Hex-Code deiner Farbe wurde erfolgreich in die Zwischenablage gespeichert.")
              })
            }
            colorPickerOptions.append(color)
          }
        }
        if (typeof value === "object") {
          this.render("text/hr", key, colorPickerOptions)
          for (const [key, val] of Object.entries(value)) {
            if (typeof val === "string") {
              if (!this.verifyIs("text/empty", val)) {
                const color = this.create("button/key-value-color", {key, value: val})
                this.add("outline-hover", color)
                color.onclick = () => {
                  this.convert("text/clipboard", val).then(() => {
                    window.alert("Code wurde erfolgreich in die Zwischenablage gespeichert.")
                  })
                }
                colorPickerOptions.append(color)
              }
            }
          }
        }
      }

      const pickSvgTitle = this.render("text/hr", "Anwendungen für SVG einsetzen", optionsContainer)
      pickSvgTitle.style.cursor = "pointer"
      this.add("outline-hover", pickSvgTitle)
      pickSvgTitle.onclick = () => toggleDisplayFlexNone(svgPickerOptions)
      const svgPickerOptions = this.create("div/flex-row", optionsContainer)
      svgPickerOptions.style.display = "none"
      this.add("outline-hover", svgPickerOptions)
      svgPickerOptions.style.paddingBottom = "144px"
      const svgIcons = this.fn("appendAllSvgIcons")

      const buttons = {duckDuckGoButton, svgIcons, templateOptions, inputOptions, widthOptions, heightOptions, displayOptions, gridOptions, flexOptions, layerOptions, transformationOptions, textManipulationOptions, visibilityOptions, spacingOptions, borderOptions, mediaQueriesOptions, optimizeWorkOptions, converterOptions, forEachChildrenOptions, colorPickerOptions, svgPickerOptions, createFlexButton, wrapButton, createGridButton, rowContainerButton, columnContainerButton, imageTextButton, keyValueButton, actionBtnButton, horizontalHrButton, simpleHeaderButton, h1Button, h2Button, h3Button, pButton, imageButton, tableHeaderButton, pdfLinkButton, aLinkButton, spanButton, changeSiButton, addSpaceButton, arrowRightButton, divScrollableButton, packDivButton, textInputButton, numberInputButton, checkboxInputButton, passwordInputButton, selectInputButton, growWidthButton, maxWidthButton, minWidthButton, exactWidthButton, increaseWidthButton, decreaseWidthButton, growHeightButton, maxHeightButton, minHeightButton, exactHeightButton, increaseHeightButton, decreaseHeightButton, exactDisplayButton, displayBlockButton, displayInlineButton, toggleDisplayGridButton, toggleDisplayFlexButton, toggleDisplayTableButton, gridMobileButton, gridFullDisplayButton, gridTwoColumnsButton, gridThreeColumnsButton, gridFixedButton, gridListRowsButton, gridSpanColumnButton, gridSpanRowButton, exactGridGapButton, gridAddColumnButton, gridRemoveColumnButton, gridAddRowButton, gridRemoveRowButton, alignColumnButton, alignLeftButton, alignCenterButton, alignRightButton, alignRowButton, alignTopButton, alignVerticalButton, alignBottomButton, flexButton, spaceBetweenButton, spaceAroundButton, toggleWrapButton, layerButton, positiveLayerButton, negativeLayerButton, exactLayerButton, removeLayerButton, positionAbsoluteButton, positionTopButton, positionRightButton, positionBottomButton, positionLeftButton, transformTranslateButton, transformTranslateXButton, transformTranslateYButton, zIndexButton, scaleButton, rotateRightButton, exactRotateRightButton, rotateLeftButton, exactRotateLeftButton, whiteSpaceNoWrapButton, fontFamilyButton, fontWeightNormalButton, fontWeightButton, fontStyleButton, textDecorationButton, fontSizeButton, fontColorButton, backgroundColorButton, unorderedListButton, orderedListButton, lineHeightButton, sourcesButton, overflowYButton, overflowXButton, toggleDisplayNoneButton, toggleVisibilityHiddenButton, exactOpacityButton, toggleMarginButton, toggleMarginTopButton, toggleMarginRightButton, toggleMarginBottomButton, toggleMarginLeftButton, exactMarginButton, exactMarginTopButton, exactMarginRightButton, exactMarginBottomButton, exactMarginLeftButton, togglePaddingButton, togglePaddingTopButton, togglePaddingRightButton, togglePaddingBottomButton, togglePaddingLeftButton, exactPaddingButton, exactPaddingTopButton, exactPaddingRightButton, exactPaddingBottomButton, exactPaddingLeftButton, toggleBorderButton, toggleBorderTopButton, toggleBorderRightButton, toggleBorderBottomButton, toggleBorderLeftButton, exactBorderButton, exactBorderTopButton, exactBorderRightButton, exactBorderBottomButton, exactBorderLeftButton, toggleBorderRadiusButton, toggleBorderTopLeftRadiusButton, toggleBorderTopRightRadiusButton, toggleBorderBottomRightRadiusButton, toggleBorderBottomLeftRadiusButton, exactBorderRadiusButton, exactBorderTopLeftRadiusButton, exactBorderTopRightRadiusButton, exactBorderBottomRightRadiusButton, exactBorderBottomLeftRadiusButton, toggleBorderNoneButton, boxButton, exactBoxShadowButton, mediaQueriesOverviewButton, largeDeviceButton, middleDeviceButton, smallDeviceButton, printerDeviceButton, insertAfterButton, insertBeforeButton, insertLeftButton, insertRightButton, cutOuterHtmlButton, copyOuterHtmlButton, pasteOuterHtmlButton, copyStyleButton, pasteStyleButton, removeStyleButton, removeInnerButton, removeInnerWithTextButton, removeNodeButton, idButton, addClassButton, setAttributeButton, addScriptButton, appendStyleButton, templatesButton, fontSizeForEachChildButton, textConverterButton}

      buttons.toggleStyle = this.fn("toggleStyle")
      buttons.toggleStyles = this.fn("toggleStyles")
      buttons.toggleNodeAndChildrenStyles = this.fn("toggleNodeAndChildrenStyles")
      buttons.setStyleWithPrompt = this.fn("setStyleWithPrompt")
      buttons.incrementStyle = this.fn("incrementStyle")
      buttons.decrementStyle = this.fn("decrementStyle")
      buttons.fixedGridPrompt = this.fn("fixedGridPrompt")
      buttons.rotateNode = this.fn("rotateNode")
      buttons.appendUnorderedListItem = this.fn("appendUnorderedListItem")
      buttons.appendOrderedListItem = this.fn("appendOrderedListItem")
      buttons.toggleAttribute = this.fn("toggleAttribute")
      buttons.toggleInnerHtml = this.fn("toggleInnerHtml")
      buttons.toggleTextContent = this.fn("toggleTextContent")
      buttons.toggleNode = this.fn("toggleNode")
      buttons.setChildrenStyleWithPrompt = this.fn("setChildrenStyleWithPrompt")
      buttons.openLayerOverlay = this.fn("openLayerOverlay")
      buttons.createFlexWidthWithPrompt = this.fn("createFlexWidthWithPrompt")
      buttons.createGridMatrixWithPrompt = this.fn("createGridMatrixWithPrompt")
      buttons.createFlexRow = this.fn("createFlexRow")
      buttons.createFlexColumn = this.fn("createFlexColumn")
      buttons.createImageText = this.fn("createImageText")
      buttons.createKeyValue = this.fn("createKeyValue")
      buttons.createActionButton = this.fn("createActionButton")
      buttons.createHr = this.fn("createHr")
      buttons.createLeftImageHeader = this.fn("createLeftImageHeader")
      buttons.createH1withPrompt = this.fn("createH1withPrompt")
      buttons.createH2withPrompt = this.fn("createH2withPrompt")
      buttons.createH3withPrompt = this.fn("createH3withPrompt")
      buttons.createPwithPrompt = this.fn("createPwithPrompt")
      buttons.createImagePlaceholder = this.fn("createImagePlaceholder")
      buttons.createTableWithMatrixPrompt = this.fn("createTableWithMatrixPrompt")
      buttons.createPdfLinkWithPrompt = this.fn("createPdfLinkWithPrompt")
      buttons.createAnchorWithPrompt = this.fn("createAnchorWithPrompt")
      buttons.createSpanWithTextContent = this.fn("createSpanWithTextContent")
      buttons.createSpanWithSiPrompt = this.fn("createSpanWithSiPrompt")
      buttons.createSpaceWithHeightPrompt = this.fn("createSpaceWithHeightPrompt")
      buttons.createArrowRightWithColorPrompt = this.fn("createArrowRightWithColorPrompt")
      buttons.createScrollableY = this.fn("createScrollableY")
      buttons.createDivPackOuter = this.fn("createDivPackOuter")
      buttons.createTextInput = this.fn("createTextInput")
      buttons.createTelInput = this.fn("createTelInput")
      buttons.createCheckboxInput = this.fn("createCheckboxInput")
      buttons.createPasswordInput = this.fn("createPasswordInput")
      buttons.createSelectInput = this.fn("createSelectInput")
      buttons.spanColumnWithPrompt = this.fn("spanColumnWithPrompt")
      buttons.spanRowWithPrompt = this.fn("spanRowWithPrompt")
      buttons.addGridColumn = this.fn("addGridColumn")
      buttons.removeGridColumn = this.fn("removeGridColumn")
      buttons.addGridRow = this.fn("addGridRow")
      buttons.removeGridRow = this.fn("removeGridRow")
      buttons.addLayerAbove = this.fn("addLayerAbove")
      buttons.addLayerBelow = this.fn("addLayerBelow")
      buttons.addLayerPrompt = this.fn("addLayerPrompt")
      buttons.removeAllLayer = this.fn("removeAllLayer")
      buttons.translateWithPrompt = this.fn("translateWithPrompt")
      buttons.translateXWithPrompt = this.fn("translateXWithPrompt")
      buttons.translateYWithPrompt = this.fn("translateYWithPrompt")
      buttons.scaleWithPrompt = this.fn("scaleWithPrompt")
      buttons.rotateNodeRightWithPrompt = this.fn("rotateNodeRightWithPrompt")
      buttons.rotateNodeLeftWithPrompt = this.fn("rotateNodeLeftWithPrompt")
      buttons.addOpacityWithPrompt = this.fn("addOpacityWithPrompt")
      buttons.openMediaQueriesOverlay = this.fn("openMediaQueriesOverlay")
      buttons.addLargeStyle = this.fn("addLargeStyle")
      buttons.addMiddleStyle = this.fn("addMiddleStyle")
      buttons.addSmallStyle = this.fn("addSmallStyle")
      buttons.addPrinterStyle = this.fn("addPrinterStyle")
      buttons.insertAfter = this.fn("insertAfter")
      buttons.insertBefore = this.fn("insertBefore")
      buttons.insertLeft = this.fn("insertLeft")
      buttons.insertRight = this.fn("insertRight")
      buttons.addOuterHtmlToClipboard = this.fn("addOuterHtmlToClipboard")
      buttons.appendClipboardToNode = this.fn("appendClipboardToNode")
      buttons.addStyleToClipboard = this.fn("addStyleToClipboard")
      buttons.addClipboardToStyle = this.fn("addClipboardToStyle")
      buttons.replaceInnerHtmlWithPrompt = this.fn("replaceInnerHtmlWithPrompt")
      buttons.replaceTextContentWithPrompt = this.fn("replaceTextContentWithPrompt")
      buttons.setIdWithPrompt = this.fn("setIdWithPrompt")
      buttons.setClassWithPrompt = this.fn("setClassWithPrompt")
      buttons.setAttributeWithPrompt = this.fn("setAttributeWithPrompt")
      buttons.openScriptsOverlay = this.fn("openScriptsOverlay")
      buttons.appendStyleWithPrompt = this.fn("appendStyleWithPrompt")
      buttons.openTemplatesOverlay = this.fn("openTemplatesOverlay")
      buttons.openSourcesOverlay = this.fn("openSourcesOverlay")

      return buttons
    }

    if (event === "createNode") {

      return (tag, parent, text = "") => {
        const node = document.createElement(tag)
        node.textContent = text
        parent.appendChild(node)
        return node
      }
    }

    if (event === "createTextNode") {

      return (parent, text = "") => {
        const node = document.createTextNode(text)
        parent.appendChild(node)
        return node
      }
    }

    if (event === "debounce") {

      let lastExecutionTime = 0
      let isBlocked = false
      return async (fn, millis) => {
        if (isBlocked) return
        const currentTime = Date.now()
        const timeSinceLastExecution = currentTime - lastExecutionTime
        if (timeSinceLastExecution >= millis) {
          try {
            fn()
          } catch (error) {
            console.error(error)
          } finally {
            lastExecutionTime = Date.now()
            isBlocked = true
            setTimeout(() => {
                isBlocked = false
            }, millis)
          }
        }
      }
    }

    if (event === "feedback") {

      function updateButtonCounter(button) {
        if (parseInt(button.counter.textContent) > 0) {
          button.counter.style.background = "green"
        } else {
          Helper.convert("dark-light", button.counter)
        }
      }

      async function icon() {
        const icon = await Helper.create("icon/branch")
        return icon
      }

      function renderFeedback(type, feedback, container, button, overlay, script) {

        Helper.convert("parent/scrollable", container)
        container.style.margin = "21px 34px"
        container.style.overscrollBehavior = "none"
        container.style.fontFamily = "monospace"
        container.style.fontSize = "21px"
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          container.style.color = Helper.colors.dark.text
        } else {
          container.style.color = Helper.colors.light.text
        }

        for (let i = 0; i < feedback.length; i++) {
          const it = feedback[i]

          const div = document.createElement("div")
          Helper.add("outline-hover", div)
          div.style.display = "flex"
          div.style.justifyContent = "space-between"
          div.style.alignItems = "center"

          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            if (i % 2 === 0) {
              div.style.background = Helper.colors.light.foreground
              div.style.color = Helper.colors.light.text
            } else {
              div.style.background = Helper.colors.dark.foreground
              div.style.color = Helper.colors.dark.text
            }
          } else {
            if (i % 2 === 1) {
              div.style.background = Helper.colors.light.foreground
              div.style.color = Helper.colors.light.text
            } else {
              div.style.background = Helper.colors.dark.foreground
              div.style.color = Helper.colors.dark.text
            }
          }

          const left = document.createElement("span")
          left.textContent = `${Helper.convert("millis/dd.mm.yyyy hh:mm", it.created)}`
          div.appendChild(left)

          const nextToLeft = document.createElement("span")
          nextToLeft.style.width = "100%"
          nextToLeft.style.padding = "8px"
          nextToLeft.textContent = it.text
          div.appendChild(nextToLeft)

          const right = document.createElement("span")
          right.style.padding = "13px"
          right.textContent = it.importance
          div.appendChild(right)

          container.appendChild(div)

          div.style.cursor = "pointer"
          div.onclick = () => {
            Helper.overlay("popup", updateFeedbackOverlay => {
              const removeButton = Helper.create("button/left-right", updateFeedbackOverlay)
              Helper.add("outline-hover", removeButton)
              Helper.render("icon/node/path", "/public/bucket.svg", removeButton.left).then(icon => {
                icon.style.width = "34px"
              })
              removeButton.right.textContent = "Feedback entfernen"
              removeButton.onclick = async () => {
                const confirm = window.confirm("Möchtest du diesen Beitrag wirklich entfernen?")
                if (confirm === true) {

                  let res
                  if (type === "html-value") {
                    res = await Helper.request(`/remove/feedback/${type}/`, {id: it.created})
                  }
                  if (type === "script") {
                    res = await Helper.request(`/remove/feedback/${type}/`, {scriptId: script.created, feedbackId: it.created})
                  }

                  if (res && res.status === 200) {
                    window.alert("Dieser Beitrag wurde erfolgreich entfernt.")
                    button.counter.textContent = parseInt(button.counter.textContent) - 1
                    div.remove()
                    updateFeedbackOverlay.remove()
                    overlay.remove()
                    updateButtonCounter(button)
                  } else {
                    window.alert("Fehler.. Bitte wiederholen.")
                    updateFeedbackOverlay.remove()
                  }
                }
              }
            })
          }
        }

      }

      function createFeedbackFields(node) {
        const fields = {}
        fields.textField = Helper.create("field/textarea", node)
        fields.textField.label.textContent = "Feedback"
        fields.textField.input.setAttribute("required", "true")
        fields.textField.input.maxLength = "377"
        fields.textField.input.style.fontSize = "13px"
        fields.textField.input.placeholder = "Schreibe ein anonymes Feedback, wenn du möchtest.."
        Helper.verify("input/value", fields.textField.input)
        Helper.add("outline-hover", fields.textField.input)
        fields.textField.input.addEventListener("input", () => Helper.verify("input/value", fields.textField.input))
        fields.importanceField = Helper.create("field/range", node)
        fields.importanceField.input.min = "0"
        fields.importanceField.input.max = "13"
        fields.importanceField.input.step = "1"
        fields.importanceField.input.value = "0"
        fields.importanceField.label.textContent = `Wichtigkeit - ${fields.importanceField.input.value}`
        fields.importanceField.input.style.cursor = "pointer"
        Helper.add("outline-hover", fields.importanceField.input)
        Helper.verify("input/value", fields.importanceField.input)
        fields.importanceField.input.addEventListener("input", (event) => {
          Helper.verify("input/value", fields.importanceField.input)
          fields.importanceField.label.textContent = `Wichtigkeit - ${event.target.value}`
        })
        fields.submit = Helper.create("toolbox/action", node)
        fields.submit.textContent = "Feedback jetzt speichern"
        return fields
      }

      function bodyButton() {
        const button = Helper.create("button/html-feedback", document.body)
        Helper.convert("dark-light", button)
        Helper.add("outline-hover", button)
        button.counter.textContent = "0"
        Helper.request("/get/feedback/length-html-value/").then((res) => {
          if (res.status === 200) {
            button.counter.textContent = res.response
            updateButtonCounter(button)
          }
        })
        button.onclick = () => openLocationOverlay(button)
      }

      async function initScriptCounter(id, button) {
        const res = await Helper.request("/get/feedback/length-script/", {id})
        if (res.status === 200) {
          button.counter.textContent = res.response
          updateButtonCounter(button)
        }
      }

      async function getLocationFeedback(container, button, overlay) {
        const res = await Helper.request(`/get/feedback/html-value/`)
        if (res && res.status === 200) {
          const feedback = JSON.parse(res.response)
          renderFeedback("html-value", feedback, container, button, overlay)
        } else {
          Helper.convert("style/info", container)
          container.textContent = "Kein Feedback gefunden"
          Helper.style(container, {margin: "21px 34px"})
        }
      }

      function openLocationOverlay(button) {
        Helper.overlay("popup", async overlay => {
          overlay.info.textContent = `html.feedback`
          const funnel = Helper.create("div/scrollable", overlay)
          const fields = createFeedbackFields(funnel)
          fields.submit.onclick = async () => {
            await Helper.verify("field-funnel", funnel)
            Helper.overlay("security", async securityOverlay => {
              const res = await Helper.request(`/register/feedback/html-value/`, {text: fields.textField.input.value, importance: fields.importanceField.input.value})
              if (res.status === 200) {
                window.alert("Vielen Dank für dein Feedback.\n\nDein Feedback ist vollkommen anonym, dynamisch und hilft dabei diese Webseite, noch besser für dich, zu optimieren.")
                securityOverlay.remove()
                overlay.remove()
                button.counter.textContent = parseInt(button.counter.textContent) + 1
                await getLocationFeedback(feedbackContainer, button, overlay)
                updateButtonCounter(button)
              } else {
                window.alert("Fehler.. Bitte wiederholen.")
                securityOverlay.remove()
              }
            })
          }
          const feedbackContainer = Helper.create("info/loading", funnel)
          await getLocationFeedback(feedbackContainer, button, overlay)
        })
      }

      function openScriptOverlay(button, script) {

        Helper.overlay("popup", async overlay => {
          overlay.info.textContent = `${script.name}.feedback`
          const funnel = Helper.create("div/scrollable", overlay)
          const fields = createFeedbackFields(funnel)
          fields.submit.onclick = async () => {
            await Helper.verify("field-funnel", funnel)
            Helper.overlay("security", async securityOverlay => {
              const res = await Helper.request("/register/feedback/script/", {id: script.created, text: fields.textField.input.value, importance: fields.importanceField.input.value})
              if (res.status === 200) {
                window.alert("Vielen Dank für dein Feedback.\n\nDein Feedback ist vollkommen anonym, dynamisch und hilft dabei dieses Skript, noch besser für dich, zu optimieren.")
                securityOverlay.remove()
                overlay.remove()
                button.counter.textContent = parseInt(button.counter.textContent) + 1
                updateButtonCounter(button)
              } else {
                window.alert("Fehler.. Bitte wiederholen.")
                securityOverlay.remove()
              }
            })
          }
          const feedbackContainer = Helper.create("info/loading", funnel)
          const res = await Helper.request("/get/feedback/script/", {id: script.created})
          if (res && res.status === 200) {
            const feedback = JSON.parse(res.response)
            renderFeedback("script", feedback, feedbackContainer, button, overlay, script)
          } else {
            Helper.convert("style/info", feedbackContainer)
            feedbackContainer.textContent = "Kein Feedback gefunden"
            Helper.style(feedbackContainer, {margin: "21px 34px"})
          }
        })
      }

      return {open, icon, openScriptOverlay, bodyButton, initScriptCounter}
    }

    if (event === "incrementStyle") {

      return ({key, node, delta}) => {
        if (node.style[key]) {
          const match = node.style[key].match(/(\d+(\.\d+)?)(\D.*)/)
          if (match) {
            let number = parseFloat(match[1])
            number = number + delta
            const remainingChars = match[3]
            node.style[key] = `${number}${remainingChars}`
          }
        }
      }

    }

    if (event === "insertAfter") {

      return (selectedNode, cache) => {
        if (selectedNode) {
          if (cache.length > 0) {
            const { node } = cache.pop()
            selectedNode.after(node)
          } else {
            this.convert("clipboard/text").then(text => {
              const node = this.convert("text/first-child", text)
              selectedNode.after(node)
            })
          }
        }
      }
    }

    if (event === "insertBefore") {

      return (selectedNode, cache) => {
        if (selectedNode) {
          if (cache.length > 0) {
            const { node } = cache.pop()
            selectedNode.before(node)
          } else {
            this.convert("clipboard/text").then(text => {
              const node = this.convert("text/first-child", text)
              selectedNode.before(node)
            })
          }
        }
      }
    }

    if (event === "insertLeft") {

      return (selectedNode, cache) => {
        if (selectedNode) {
          if (cache.length > 0) {
            const { node, parent, index } = cache.pop()
            if (selectedNode.firstChild) {
              selectedNode.insertBefore(node, selectedNode.firstChild)
            } else {
              selectedNode.appendChild(node)
            }
          } else {
            this.convert("clipboard/text").then(text => {
              const node = this.convert("text/first-child", text)
              if (selectedNode.firstChild) {
                selectedNode.insertBefore(node, selectedNode.firstChild)
              } else {
                selectedNode.appendChild(node)
              }
            })
          }
        }
      }
    }

    if (event === "insertRight") {

      return (selectedNode, cache) => {
        if (selectedNode) {
          if (cache.length > 0) {
            const { node, parent, index } = cache.pop()
            selectedNode.appendChild(node)
          } else {
            this.convert("clipboard/text").then(text => {
              const node = this.convert("text/first-child", text)
              selectedNode.appendChild(node)
            })
          }
        }
      }
    }

    if (event === "decrementStyle") {

      return ({key, node, delta}) => {
        if (node.style[key]) {
          const match = node.style[key].match(/(\d+(\.\d+)?)(\D.*)/)
          if (match) {
            let number = parseFloat(match[1])
            number = number - delta
            const remainingChars = match[3]
            node.style[key] = `${number}${remainingChars}`
          }
        }
      }

    }

    if (event === "openLayerOverlay") {

      return (layer, node) => {
        this.overlay("popup", async layerOverlay => {
          this.render("text/title", "Wähle einen Layer aus", layerOverlay)
          const buttons = this.create("div/scrollable", layerOverlay)
          const fatherButton = this.create("button/left-right", buttons)
          fatherButton.classList.add("father-button")
          this.add("outline-hover", fatherButton)

          let selectedNode
          if (node.classList.contains("layer")) {
            selectedNode = node.parentElement
          } else {
            selectedNode = node
          }

          let fatherZIndex = 0
          if (selectedNode.style.zIndex) fatherZIndex = selectedNode.style.zIndex
          fatherButton.left.textContent = "Ebene " + fatherZIndex
          fatherButton.style.backgroundColor = this.colors.light.error
          fatherButton.right.textContent = this.convert("node/selector", selectedNode)
          fatherButton.onclick = async () => {
            await this.remove("element/selected-node", selectedNode.parentElement)
            this.add("element/selected-node", selectedNode)
            layerOverlay.remove()
          }

          for (let i = 0; i < selectedNode.querySelectorAll("*").length; i++) {
            const child = selectedNode.querySelectorAll("*")[i]
            if (child.classList.contains("layer")) {
              const button = this.create("button/left-right")
              button.left.textContent = "Ebene " + child.style.zIndex
              button.right.textContent = this.convert("node/selector", child)
              this.add("outline-hover", button)

              button.onclick = async () => {
                await layer(child)
                layerOverlay.remove()
              }
              if (child.style.zIndex >= fatherZIndex) {
                fatherButton.before(button)
              }
              if (child.style.zIndex < fatherZIndex) {
                buttons.append(button)
              }
            }
          }
        })
      }
    }

    if (event === "openMediaQueriesOverlay") {

      return () => {
        this.overlay("toolbox", queriesOverlay => {
          const content = this.create("div/scrollable", queriesOverlay)
          document.head.querySelectorAll("style").forEach((style, i) => {
            if (style.id === "large-device") this.render("text/hr", "Für Bildschirme breiter als 1025 Pixel", content)
            if (style.id === "middle-device") this.render("text/hr", "Für Bildschirme zwischen 601 und 1024 Pixel", content)
            if (style.id === "small-device") this.render("text/hr", "Für Bildschirme kleiner als 600 Pixel", content)
            if (style.id === "printer-device") this.render("text/hr", "Für Drucker", content)
            const queries = style.textContent.split("@")
            for (var i = 0; i < queries.length; i++) {
              const query = queries[i]
              if (query.trim() === "") continue
              const queryButton = this.create("toolbox/left-right", content)
              queryButton.left.textContent = this.convert("query/selector", query)
              queryButton.right.textContent = `Media Query ${i}`
              queryButton.onclick = () => {
                this.overlay("toolbox", queryOverlay => {
                  queryOverlay.info.textContent = currentSelector
                  const buttons = this.create("div/scrollable", queryOverlay)
                  const currentSelector = this.convert("query/selector", query)
                  const cssSplit = this.convert("query/css", query).split(" ")
                  const currentCss = cssSplit[0] + " " + cssSplit[1]
                  {
                    const button = this.create("toolbox/left-right", buttons)
                    this.add("outline-hover", button)
                    button.left.textContent = ".selector"
                    button.right.textContent = "Ziel Element ändern"
                    button.onclick = () => {
                      this.overlay("toolbox", selectorOverlay => {
                        selectorOverlay.info.textContent = `${currentSelector}.selector`
                        const funnel = this.create("div/scrollable", selectorOverlay)
                        const selectorField = this.create("field/textarea", funnel)
                        selectorField.label.textContent = "CSS Selektor"
                        selectorField.input.style.fontSize = "13px"
                        selectorField.input.value = currentSelector
                        this.verify("input/value", selectorField.input)
                        const submit = this.create("button/action", funnel)
                        submit.textContent = "Selektor jetzt speichern"
                        submit.onclick = () => {
                          try {
                            const newSelector = selectorField.input.value
                            style.textContent = style.textContent.replace(currentSelector, newSelector)
                            window.alert("Selektor erfolgreich gespeichert.")
                            queriesOverlay.remove()
                            queryOverlay.remove()
                            selectorOverlay.remove()
                          } catch (error) {
                            console.error(error)
                            window.alert("Fehler.. Bitte wiederholen.")
                          }
                        }
                      })
                    }
                  }
                  {
                    const button = this.create("toolbox/left-right", buttons)
                    button.left.textContent = ".css"
                    button.right.textContent = "Style anpassen"
                    button.onclick = () => {
                      this.overlay("toolbox", cssOverlay => {
                        cssOverlay.info.textContent = `${currentSelector}.css`
                        const funnel = this.create("div/scrollable", cssOverlay)
                        const cssField = this.create("field/textarea", funnel)
                        cssField.label.textContent = "CSS Regel"
                        cssField.input.style.fontSize = "13px"
                        cssField.input.value = currentCss
                        this.verify("input/value", cssField.input)
                        const submit = this.create("button/action", funnel)
                        submit.textContent = "CSS jetzt speichern"
                        submit.onclick = () => {
                          try {
                            const newCss = cssField.input.value
                            style.textContent = style.textContent.replace(currentCss, newCss)
                            window.alert("CSS erfolgreich gespeichert.")
                            queriesOverlay.remove()
                            queryOverlay.remove()
                            cssOverlay.remove()
                          } catch (error) {
                            console.error(error)
                            window.alert("Fehler.. Bitte wiederholen.")
                          }
                        }
                      })
                    }
                  }
                  {
                    const button = this.create("toolbox/left-right", buttons)
                    button.left.textContent = ".remove"
                    button.right.textContent = "Media Query entfernen"
                    button.onclick = () => {
                      try {
                        style.textContent = style.textContent.replace(`@${query}`, "")
                        queriesOverlay.remove()
                        queryOverlay.remove()
                        window.alert("Media Query erfolgreich entfernt.")
                      } catch (error) {
                        console.error(error)
                        window.alert("Fehler.. Bitte wiederholen.")
                      }
                    }
                  }
                })
              }
            }
          })
        })
      }
    }

    if (event === "openNodeLayerOverlay") {

      return async ({node}) => {
        const result = await this.verifyIs("class/found", {node: node, class: "layer" })
        if (result === true) {

          this.overlay("popup", async layerOverlay => {
            this.render("text/title", "Wähle einen Layer aus", layerOverlay)

            const layers = this.create("div/scrollable", layerOverlay)

            const fatherButton = this.create("button/left-right", layers)
            this.add("outline-hover", fatherButton)
            fatherButton.classList.add("father-button")

            let fatherZIndex = 0
            if (node.style.zIndex) fatherZIndex = node.style.zIndex
            fatherButton.left.textContent = "Ebene " + fatherZIndex

            fatherButton.style.backgroundColor = this.colors.light.error

            const fatherSelector = await this.convert("element/selector", node)
            fatherButton.right.textContent = fatherSelector

            fatherButton.onclick = async () => {
              await this.remove("element/selected-node", node.parentElement)
              this.add("element/selected-node", node)
              layerOverlay.remove()
            }

            node.querySelectorAll("*").forEach(async(item, i) => {
              if (item.classList.contains("layer")) {

                const selector = await this.convert("element/selector", item)

                const button = this.create("button/left-right")
                this.add("outline-hover", button)
                button.left.textContent = "Ebene " + item.style.zIndex
                button.right.textContent = selector
                button.onclick = async () => {
                  console.log(node);
                  console.log(item);
                  // onclick the cached selectedNode is not changing
                  await this.remove("element/selected-node", node.parentElement)
                  // node = item
                  this.add("selected/node", item)
                  this.convert("node/selected", node)
                  layerOverlay.remove()
                }

                if (item.style.zIndex >= fatherZIndex) {
                  fatherButton.before(button)
                }

                if (item.style.zIndex < fatherZIndex) {
                  layers.append(button)
                }

              }
            })

          })

        }
        if (result === false) {
          window.alert("In diesem Element sind keine Layer enthalten.")
        }

      }
    }

    if (event === "openScriptsOverlay") {

      return () => {
        this.overlay("popup", async overlay => {
          overlay.info.textContent = `.scripts`
          const create = this.create("toolbox/left-right", overlay)
          create.left.textContent = ".create"
          create.right.textContent = "Neues Skript hochladen"
          create.onclick = () => {
            this.overlay("popup", overlay => {
              overlay.info.textContent = ".script"
              const funnel = this.create("div/scrollable", overlay)
              const nameField = this.create("field/tag", funnel)
              nameField.label.textContent = "Skript Identifikation (text/tag)"
              nameField.input.placeholder = "mein-skript"
              this.verify("input/value", nameField.input)
              this.add("outline-hover", nameField.input)
              nameField.input.oninput = () => this.verify("input/value", nameField.input)
              const scriptField = this.create("field/script", funnel)
              scriptField.input.style.height = "100vh"
              this.verify("input/value", scriptField.input)
              this.add("outline-hover", scriptField.input)
              scriptField.input.oninput = () => this.verify("input/value", scriptField.input)
              const button = this.create("toolbox/action", funnel)
              button.textContent = "Skript jetzt speichern"
              button.onclick = async () => {
                await this.verify("field-funnel", funnel)
                this.overlay("security", async securityOverlay => {
                  const res = await this.request("/register/scripts/closed", {name: nameField.input.value, html: scriptField.input.value})
                  if (res.status === 200) {
                    this.convert("parent/loading", content)
                    await this.render("scripts/update-buttons", content)
                    securityOverlay.remove()
                    overlay.remove()
                    window.alert("Dein Skript wurde erfolgreich gespeichert.")
                  } else {
                    window.alert("Fehler.. Bitte wiederholen.")
                    securityOverlay.remove()
                  }
                })
              }
            })
          }
          this.render("text/hr", "Meine Skripte", overlay)
          const content = this.create("info/loading", overlay)
          await this.render("scripts/update-buttons", content)
        })
      }
    }

    if (event === "openSourcesOverlay") {

      return (selectedNode) => {
        this.overlay("popup", async sourcesOverlay => {
          sourcesOverlay.info.textContent = ".sources"
          const create = this.create("toolbox/left-right", sourcesOverlay)
          create.left.textContent = ".create"
          create.right.textContent = "Neue Quelle definieren"
          create.onclick = () => {

            this.overlay("popup", async overlay => {
              overlay.info.textContent = ".source.create"
              const searchField = this.create("field/text", overlay)
              searchField.label.textContent = "Suche nach dem Titel deiner Quelle"
              searchField.input.placeholder = "Mein Lieblingsbuch, .."
              this.verify("input/value", searchField.input)
              searchField.input.onkeypress = (ev) => {
                if (ev.keyCode === 13 || ev.key === 'Enter') {
                  this.overlay("popup", async overlay => {
                    overlay.info.textContent = ".sources"
                    const h1 = this.render("text/h1", `Quellen werden gesucht..`, overlay)
                    const filterTitleField = this.create("field/text", overlay)
                    filterTitleField.label.textContent = "Filter genauer nach Titel"
                    filterTitleField.input.placeholder = "Titel"
                    filterTitleField.style.margin = "0 34px"
                    this.verify("input/value", filterTitleField.input)
                    this.add("outline-hover", filterTitleField.input)
                    const buttons = this.create("info/loading", overlay)
                    this.convert("text/sources", ev.target.value).then(async sources => {
                      if (sources.length === 0) {
                        window.alert("Es wurden keine Quellen gefunden.")
                        this.add("style/node/not-valid", searchField.input)
                        overlay.remove()
                      } else if (sources.length === 1) {
                        h1.textContent = `Es wurde ${sources.length} Quelle gefunden`
                      } else {
                        h1.textContent = `Es wurden ${sources.length} Quellen gefunden`
                      }
                      async function renderButtons(array, node, query = "", key = "title", max = 8) {
                        const filtered = array?.filter(item => item[key]?.toLowerCase().includes(query))
                        Helper.convert("parent/scrollable", node)
                        for (let i = 0; i < Math.min(filtered.length, max); i++) {
                          const source = filtered[i]
                          const button = await renderSourceButton(source, node, query)
                          button.onclick = () => {
                            Helper.render("source/field-funnel", source, funnel)
                            Helper.verify("field-funnel", funnel)
                            overlay.remove()
                          }
                        }
                      }
                      filterTitleField.input.oninput = async (ev) => {
                        await renderButtons(sources, buttons, ev.target.value)
                      }
                      await renderButtons(sources, buttons)
                    })
                  })
                }
              }
              this.render("text/hr", "Neue Quelle anlegen", overlay)
              const funnel = this.create("field-funnel/source", overlay)
              funnel.submit.onclick = async () => {
                await this.verify("field-funnel", funnel)
                const map = await this.convert("field-funnel/map", funnel)
                this.overlay("security", async securityOverlay => {
                  const res = await this.request("/register/sources/closed/", {source: map})
                  if (res.status === 200) {
                    window.alert("Daten erfolgreich gespeichert.")
                    await renderSourceOptionButtons(sourceList)
                    securityOverlay.remove()
                  }
                  if (res.status !== 200) {
                    window.alert("Fehler.. Bitte wiederholen.")
                    securityOverlay.remove()
                  }
                })
              }
            })
          }
          this.render("text/hr", "Meine Quellen", sourcesOverlay)
          const sourceList = this.create("info/loading", sourcesOverlay)
          async function renderSourceButton(source, node, query = "") {

            const button = Helper.create("toolbox/left-right", node)
            button.left.style.flex = "1 1 0"
            Helper.render("text/node/bottom-right-onhover", "Auwählen", button)

            if (source.title) {
              const node = Helper.create("div", button.left)
              node.style.fontSize = "34px"
              let text = source.title
              const title = text.slice(0, -6)
              const date = text.slice(-6)

              let width = Helper.convert("node-text/width", {node, text})
              let greaterThanWidth = false

              while (width > 987) {
                text = text.slice(0, -1)
                node.textContent = text
                width = Helper.convert("node-text/width", {node, text})
                greaterThanWidth = true
              }

              if (greaterThanWidth) {
                const markedText = `${title} .. ${date}`.replace(new RegExp(query, 'i'), match => `<mark>${match}</mark>`)
                node.innerHTML = await Helper.convert("text/purified", markedText)
              } else {
                const markedText = text.replace(new RegExp(query, 'i'), match => `<mark>${match}</mark>`)
                node.innerHTML = await Helper.convert("text/purified", markedText)
              }

            }

            if (source.authors) {
              const authors = Helper.create("div", button.left)
              authors.style.fontSize = "21px"
              authors.style.fontWeight = "bold"
              authors.style.color = Helper.colors.matte.sunflower
              authors.textContent = source.authors.join(", ")
            }

            if (source.publisher) {
              const publisher = Helper.create("div", button.left)
              publisher.style.fontSize = "13px"
              publisher.textContent = source.publisher.join(", ")
            }

            if (source.isbn) {
              const isbn = Helper.create("div", button.left)
              isbn.style.fontSize = "13px"
              isbn.textContent = `ISBN: ${source.isbn.join(", ")}`
            }

            if (source.image) {
              const img = document.createElement("img")
              img.style.width = "100%"
              img.src = source.image
              button.right.append(img)
              button.right.style.width = "128px"
            }

            return button
          }
          async function renderSourceOptionButtons(node) {
            const res = await Helper.request("/get/sources/closed/")
            if (res.status === 200) {
              const sources = JSON.parse(res.response)
              Helper.convert("parent/scrollable", node)
              for (let i = 0; i < sources.length; i++) {
                const source = sources[i]
                const button = await renderSourceButton(source, node)
                button.onclick = () => {
                  Helper.overlay("popup", overlay => {
                    overlay.info.textContent = source.title
                    Helper.convert("node-text/slice-width", {node: overlay.info, text: source.title, width: 89})
                    const buttons = Helper.create("div/scrollable", overlay)

                    const updateButton = Helper.create("toolbox/left-right", buttons)
                    updateButton.left.textContent = ".update"
                    updateButton.right.textContent = "Quelle aktualisieren"
                    updateButton.onclick = () => {
                      Helper.overlay("popup", overlay => {
                        overlay.info.textContent = source.title
                        Helper.convert("node-text/slice-width", {node: overlay.info, text: source.title, width: 89})
                        overlay.info.append(".update")
                        const funnel = Helper.create("field-funnel/source", overlay)
                        Helper.render("source/field-funnel", source, funnel)
                        Helper.verify("field-funnel", funnel)
                        funnel.submit.onclick = async () => {
                          await Helper.verify("field-funnel", funnel)
                          const map = await Helper.convert("field-funnel/map", funnel)
                          Helper.overlay("security", async securityOverlay => {
                            const res = await Helper.request("/update/sources/id-self/", {id: source.created, source: map})
                            if (res.status === 200) {
                              window.alert("Quelle erfolgreich gespeichert.")
                              overlay.remove()
                              securityOverlay.remove()
                              resolve()
                            } else {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }
                          })
                        }
                      })
                    }

                    const inlineButton = Helper.create("toolbox/left-right", buttons)
                    inlineButton.left.textContent = ".inline-cite"
                    inlineButton.right.textContent = "Füge einen Verweise im Text ein"
                    inlineButton.onclick = () => {
                      Helper.render("inline-cite/node/mla", source, selectedNode)
                      overlay.remove()
                      sourcesOverlay.remove()
                    }

                    const fullButton = Helper.create("toolbox/left-right", buttons)
                    fullButton.left.textContent = ".full-cite"
                    fullButton.right.textContent = "Füge einen Block Verweis ein"
                    fullButton.onclick = () => {
                      Helper.render("full-cite/node/mla", source, selectedNode)
                      overlay.remove()
                      sourcesOverlay.remove()
                    }

                    const removeButton = Helper.create("toolbox/left-right", buttons)
                    removeButton.left.textContent = ".remove"
                    removeButton.right.textContent = "Quelle entfernen"
                    removeButton.onclick = async () => {
                      const confirm = window.confirm("Möchtest du deine Quelle wirklich entfernen?")
                      if (confirm === true) {
                        Helper.overlay("security", async securityOverlay => {
                          const res = await Helper.request("/remove/sources/id-self/", {id: source.created})
                          if (res.status === 200) {
                            window.alert("Deine Quelle wurde erfolgreich entfernt.")
                            button.remove()
                            overlay.remove()
                            securityOverlay.remove()
                          } else {
                            window.alert("Fehler.. Bitte wiederholen.")
                            securityOverlay.remove()
                          }
                        })
                      }
                    }
                  })
                }
              }
            } else {
              Helper.convert("parent/info", node)
              node.textContent = `Keine Quellen gefunden`
            }
          }
          await renderSourceOptionButtons(sourceList)
        })
      }
    }

    if (event === "openTemplatesOverlay") {

      return (node) => {
        this.overlay("popup", async templatesOverlay => {
          const searchField = this.create("field/text", templatesOverlay)
          searchField.label.textContent = "Suche nach Text in deinem Template"
          searchField.input.placeholder = "Mein Button"
          searchField.style.margin = "21px 34px"
          this.verify("input/value", searchField.input)
          this.add("outline-hover", searchField.input)
          if (node) {
            const registerTemplateButton = this.create("toolbox/bottom-right", templatesOverlay)
            this.render("icon/node/path", "/public/add.svg", registerTemplateButton)
            registerTemplateButton.onclick = async () => {
              if (node.hasAttribute("contenteditable")) {
                node.removeAttribute("contenteditable")
              }
              if (node.hasAttribute("id")) {
                node.removeAttribute("id")
              }
              await this.remove("element/selected-node", node)
              const confirm = window.confirm("Möchtest du das ausgewählte Element als Template speichern?")
              if (confirm === true) {
                this.overlay("security", async securityOverlay => {
                  const res = await this.request("/register/templates/html-self/", {html: node.outerHTML})
                  if (res.status === 200) {
                    window.alert("Template erfolgreich gespeichert.")
                    await renderTemplateClosed(node, content)
                    securityOverlay.remove()
                  } else {
                    window.alert("Fehler.. Bitte wiederholen.")
                    securityOverlay.remove()
                  }
                })
              }
            }
          }
          const content = this.create("info/loading", templatesOverlay)
          const res = await this.request("/get/templates/closed/")
          if (res.status === 200) {
            const templates = JSON.parse(res.response)
            let filtered
            searchField.input.oninput = async (ev) => {
              const query = ev.target.value
              if (!this.verifyIs("text/empty", query)) {
                filtered = templates.filter(it => it.html.toLowerCase().includes(query.toLowerCase()))
                const highlighted = filtered.map(it => {
                  const highlightedHtml = it.html.replace(new RegExp(query, 'ig'), `<mark>${query}</mark>`)
                  return { ...it, html: highlightedHtml }
                })
                await renderTemplateFeatureButtons(highlighted, node, content)
              } else {
                await renderTemplateFeatureButtons(templates, node, content)
              }
            }
            await renderTemplateFeatureButtons(templates, node, content)

            async function renderTemplateClosed(selectedNode, container) {
              const res = await Helper.request("/get/templates/closed/")
              if (res.status === 200) {
                const templates = JSON.parse(res.response)
                await renderTemplateFeatureButtons(templates, selectedNode, container)
              } else {
                Helper.convert("parent/info", container)
                container.textContent = "Keine Templates gefunden"
              }
            }

            async function renderTemplateFeatureButtons(templates, selectedNode, container, max = 5) {
              Helper.convert("parent/scrollable", container)
              for (let i = 0; i < Math.min(templates.length, max); i++) {
                const template = templates[i]
                const templateButton = Helper.create("toolbox/left-right", container)
                templateButton.left.innerHTML = await Helper.convert("text/purified", template.html)
                templateButton.left.style.height = "34vh"
                templateButton.left.style.overflow = "auto"
                templateButton.right.style.fontSize = "21px"
                if (template.alias) templateButton.right.textContent = template.alias
                templateButton.onclick = async () => {
                  Helper.overlay("popup", buttonsOverlay => {
                    if (template.alias) buttonsOverlay.info.textContent = template.alias
                    const buttons = Helper.create("div/scrollable", buttonsOverlay)
                    {
                      const button = Helper.create("toolbox/left-right", buttons)
                      button.left.textContent = ".append-to-selected-node"
                      button.right.textContent = "Hänge dein Template an das ausgewählte Element"
                      button.onclick = async () => {
                        const parser = document.createElement("div")
                        parser.innerHTML = await Helper.convert("text/purified", template.html)
                        selectedNode.appendChild(parser.firstChild)
                        window.alert("Templete erfolgreich angehängt.")
                        buttonsOverlay.remove()
                        templatesOverlay.remove()
                      }
                    }
                    {
                      const button = Helper.create("toolbox/left-right", buttons)
                      button.left.textContent = ".alias"
                      button.right.textContent = "Gebe deinem Template einen alternativen Namen"
                      button.onclick = () => {
                        Helper.overlay("popup", overlay => {
                          if (template.alias) overlay.info.textContent = template.alias
                          const funnel = Helper.create("div/scrollable", overlay)
                          const aliasField = Helper.create("field/text", funnel)
                          aliasField.label.textContent = "Alternative Bezeichnung für deine Template"
                          aliasField.input.setAttribute("required", "true")
                          if (template.alias !== undefined) {
                            aliasField.input.value = template.alias
                          }
                          Helper.verify("input/value", aliasField.input)
                          Helper.add("outline-hover", aliasField.input)
                          aliasField.input.oninput = () => Helper.verify("input/value", aliasField.input)
                          const submit = Helper.create("button/action", funnel)
                          Helper.add("outline-hover", submit)
                          submit.textContent = "Alias jetzt speichern"
                          submit.onclick = async () => {
                            await Helper.verify("input/value", aliasField.input)
                            Helper.overlay("security", async securityOverlay => {
                              const res = await Helper.request("/register/templates/alias-self/", {id: template.created, alias: aliasField.input.value})
                              if (res.status === 200) {
                                window.alert("Alias erfolgreich gespeichert.")
                                await renderTemplateClosed(selectedNode, container)
                                overlay.remove()
                                buttonsOverlay.remove()
                                securityOverlay.remove()
                              } else {
                                window.alert("Fehler.. Bitte wiederholen.")
                                securityOverlay.remove()
                              }
                            })
                          }
                        })
                      }
                    }
                    {
                      const button = Helper.create("toolbox/left-right", buttons)
                      button.left.textContent = ".remove"
                      button.right.textContent = "Template entfernen"
                      button.onclick = () => {

                        const confirm = window.confirm("Möchtest du dein Template wirklich entfernen?")
                        if (confirm === true) {
                          Helper.overlay("security", async securityOverlay => {
                            const res = await Helper.request("/remove/templates/id-self/", {id: template.created})
                            if (res.status === 200) {
                              window.alert("Template erfolgreich entfernt.")
                              templateButton.remove()
                              buttonsOverlay.remove()
                              securityOverlay.remove()
                            } else {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }
                          })
                        }
                      }
                    }
                  })
                }
              }
            }

          } else {
            Helper.convert("parent/info", content)
            content.textContent = "Keine Templates gefunden"
          }
        })
      }
    }

    if (event === "replaceInnerHtmlWithPrompt") {

      return async (node) => {
        const prompt = window.prompt("Ersetze den Inhalt deines Elements mit folgendem HTML: (z.B., Hallo HTML)")
        node.innerHTML = await Helper.convert("text/purified", prompt)
      }
    }

    if (event === "replaceTextContentWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Ersetze den Inhalt deines Elements mit folgendem HTML: (z.B., Hallo HTML)")
        node.textContent = prompt
      }
    }

    if (event === "scaleWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die Höhe deiner Skalierung ein: (z.B., 2)")
        if (!this.verifyIs("text/empty", prompt)) {
          node.style.transform = `scale(${prompt})`
        }
      }
    }

    if (event === "setAttributeWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Markiere dein Element mit einem Attribut: (z.B., id=neue-id)")
        if (!this.verifyIs("text/empty", prompt)) {
          try {
            const promptSplit = prompt.split("=")
            if (promptSplit.length === 2) {
              node.setAttribute(promptSplit[0], promptSplit[1])
            }
          } catch (error) {
            window.alert("Du musst ein 'Gleichheitszeichen =' nutzen, um dein Attribut vom Wert zu trennen.")
          }
        }
      }
    }

    if (event === "setChildrenStyleWithPrompt") {

      return (key, node, message) => {
        const prompt = window.prompt(message)
        for (var i = 0; i < node.children.length; i++) {
          const child = node.children[i]
          child.style[key] = prompt
        }
      }

    }

    if (event === "setClassWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Füge deinem Element einen Klassen Namen hinzu:")
        if (!this.verifyIs("text/empty", prompt)) {
          node.classList.add(prompt)
          window.alert("Klasse wurde erfolgreich angehängt.")
        }
      }
    }

    if (event === "setIdWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe deinem Element einen eindeutige Id: (z.B., mein-html)")
        if (!this.verifyIs("text/empty", prompt)) {
          const found = document.getElementById(prompt)
          if (found === null) {
            node.setAttribute("id", prompt)
            window.alert("Id wurde erfolgreich gesetzt.")
          } else {
            window.alert("Diese Id existiert bereits.")
          }
        }
      }
    }

    if (event === "setStyleWithPrompt") {

      return ({key, node, message}) => {
        const prompt = window.prompt(message)
        node.style[key] = prompt
      }

    }

    if (event === "toggleAttribute") {

      let cache
      return (attribute, node) => {
        if (!node.hasAttribute(attribute)) {
          if (cache) {
            node.setAttribute(attribute, cache)
          } else {
            node.removeAttribute(attribute)
          }
        } else {
          cache = node.getAttribute(attribute)
          node.removeAttribute(attribute)
        }
      }

    }

    if (event === "toggleInnerHtml") {
      let cache
      return async (node) => {
        if (this.verifyIs("text/empty", node.innerHTML)) {
          if (cache) {
            node.innerHTML = await Helper.convert("text/purified", cache)
          } else {
            node.innerHTML = ""
          }
        } else {
          cache = node.innerHTML
          node.innerHTML = ""
        }
      }

    }

    if (event === "toggleTextContent") {

      let cache
      return (node) => {
        if (this.verifyIs("text/empty", node.textContent)) {
          if (cache) {
            node.textContent = cache
          } else {
            node.textContent = ""
          }
        } else {
          cache = node.textContent
          node.textContent = ""
        }
      }

    }

    if (event === "toggleNodeAndChildrenStyles") {

      let originalNodeStyle
      let originalChildrenStyles = []
      return ({nodeStyle, childrenStyle, node}) => {
        if (originalNodeStyle) {
          node.setAttribute("style", originalNodeStyle)
          originalNodeStyle = null
        } else {
          originalNodeStyle = node.getAttribute("style")
          for (const [key, value] of Object.entries(nodeStyle)) {
            node.style[key] = value
          }
        }
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i]
          if (originalChildrenStyles[i]) {
            child.setAttribute("style", originalChildrenStyles[i])
            originalChildrenStyles[i] = null
          } else {
            originalChildrenStyles[i] = child.getAttribute("style")
            for (const [key, value] of Object.entries(childrenStyle)) {
              child.style[key] = value
            }
          }
        }
      }

    }

    if (event === "translateWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den X und Y Wert ein und bewege dein Element in die gewünschte Richtung: (z.B., (21px, -34px))")
        if (!this.verifyIs("text/empty", prompt)) {
          node.style.transform = `translate(${prompt})`
        } else {
          node.style.transform = null
        }
      }
    }

    if (event === "translateXWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den X-Wert ein und bewege dein Element in die gewünschte Richtung: (z.B., 34px)")
        if (!this.verifyIs("text/empty", prompt)) {
          node.style.transform = `translateX(${prompt})`
        } else {
          node.style.transform = null
        }
      }
    }

    if (event === "translateYWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den Y-Wert ein und bewege dein Element in die gewünschte Richtung: (z.B., -34px)")
        if (!this.verifyIs("text/empty", prompt)) {
          node.style.transform = `translateY(${prompt})`
        } else {
          node.style.transform = null
        }
      }
    }

    if (event === "fixedGridPrompt") {

      let originalGridFixedStyle
      let originalGridFixedChildrenStyle = []
      return ({node}) => {
        if (originalGridFixedStyle) {
          node.setAttribute("style", originalGridFixedStyle)
          originalGridFixedStyle = null
          for (var i = 0; i < node.children.length; i++) {
            const child = node.children[i]
            const style = originalGridFixedChildrenStyle.shift()
            if (style) {
              child.setAttribute("style", style)
            } else {
              child.removeAttribute("style")
            }
          }
        } else {
          const prompt = window.prompt("Gebe die exakte Dimension deiner Grid Elemente ein: (z.B., 144px)")
          originalGridFixedStyle = node.getAttribute("style")
          node.style.display = "grid"
          node.style.gridTemplateColumns = `repeat(auto-fit, minmax(${prompt}, 1fr))`
          node.style.gridTemplateRows = `repeat(auto-fit, minmax(0, ${prompt}))`
          node.style.gridGap = "21px"
          for (var i = 0; i < node.children.length; i++) {
            const child = node.children[i]
            originalGridFixedChildrenStyle.push(child.getAttribute("style"))
            child.style.height = prompt
          }
        }
      }

    }

    if (event === "removeAllLayer") {

      return (node) => {
        node.querySelectorAll("*").forEach((item, i) => {
          if (item.classList.contains("layer")) {
            item.remove()
          }
        })
        window.alert("Alle Layer wurden erfolgreich entfernt.")
      }
    }

    if (event === "removeGridColumn") {

      return (node) => {
        const templateColumns = node.style.gridTemplateColumns.split(" ")
        templateColumns.pop()
        node.style.gridTemplateColumns = templateColumns.join(" ")
        if (node.lastElementChild) {
          node.lastElementChild.remove()
        }
      }
    }

    if (event === "removeGridRow") {

      return (node) => {
        const templateRows = node.style.gridTemplateRows.split(" ")
        templateRows.pop()
        node.style.gridTemplateRows = templateRows.join(" ")
        if (node.lastElementChild) {
          node.lastElementChild.remove()
        }
      }
    }

    if (event === "rotateNode") {

      let rotationDegree = 0
      return ({degree, node}) => {
        rotationDegree += degree
        if (rotationDegree === 360) rotationDegree = 0
        node.style.transform = `rotate(${rotationDegree}deg)`
      }

    }

    if (event === "rotateNodeLeftWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den exakten Winkel für deine Rotation, nach links, ein: (z.B., 45)")
        if (this.verifyIs("text/+int", prompt)) {
          let degree = parseInt(prompt)
          if (degree >= 0) {
            if (degree === 360) degree = 0
            if (degree > 360) degree = degree - 360
            node.style.transform = `rotate(-${degree}deg)`
          }
        } else {
          node.style.transform = null
        }
      }
    }

    if (event === "rotateNodeRightWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den exakten Winkel für deine Rotation, nach rechts, ein: (z.B., 45)")
        if (this.verifyIs("text/+int", prompt)) {
          let degree = parseInt(prompt)
          if (degree >= 0) {
            if (degree === 360) degree = 0
            if (degree > 360) degree = degree - 360
            node.style.transform = `rotate(${degree}deg)`
          }
        } else {
          node.style.transform = null
        }
      }
    }

    if (event === "toggleNode") {

      let originalRemoveNode
      let originalParentNode
      let originalIndex
      return (node) => {
        if (originalRemoveNode) {
          if (originalParentNode) {
            originalParentNode.insertBefore(originalRemoveNode, originalParentNode.childNodes[originalIndex])
          }
          node = originalRemoveNode
          originalRemoveNode = null
          originalParentNode = null
          originalIndex = null
        } else {
          originalParentNode = node.parentElement
          originalIndex = Array.from(originalParentNode.childNodes).indexOf(node)
          originalRemoveNode = node.cloneNode(true)
          node.remove()
        }
      }

    }

    if (event === "toggleStyle") {

      let cache
      return ({key, value, node}) => {
        if (node.style[key] === value) {
          if (cache) {
            node.style[key] = cache
          } else {
            node.style[key] = null
          }
        } else {
          cache = node.style[key]
          node.style[key] = value
        }
      }

    }

    if (event === "toggleStyles") {

      let cache
      return ({styles, node}) => {
        if (cache) {
          node.setAttribute("style", cache)
          cache = undefined
        } else {
          cache = node.getAttribute("style");
          for (const [key, value] of Object.entries(styles)) {
            node.style[key] = value
          }
        }
      }

    }

    if (event === "spanColumnWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die Anzahl an Spalten ein, die dein Grid Element einnehmen soll: (z.B., 5)")
        if (this.verifyIs("text/+int", prompt)) {
          const columns = parseInt(prompt)
          if (columns > 0) {
            node.style.gridColumn = `span ${columns}`
          }
        }
      }
    }

    if (event === "spanRowWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die Anzahl an Zeilen ein, die dein Grid Elemente einnehmen soll: (z.B., 3)")
        if (this.verifyIs("text/+int", prompt)) {
          const rows = parseInt(prompt)
          if (rows > 0) {
            node.style.gridRow = `span ${rows}`
            node.style.height = "100%"
          }
        }
      }
    }

    if (event === "createAnchorWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die Quell-Url deines Links ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          const a = document.createElement("a")
          a.textContent = "(z.B., Startseite)"
          a.style.margin = "21px 34px"
          a.style.cursor = "pointer"
          a.href = prompt
          node.appendChild(a)
        }
      }
    }

    if (event === "createPdfLinkWithPrompt") {

      return async (node) => {
        const prompt = window.prompt("Gebe die Quell-Url deiner PDF ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          const a = document.createElement("a")
          input.node.appendChild(a)
          a.classList.add("pdf-link")
          a.href = prompt
          a.style.margin = "21px 34px"
          a.style.display = "flex"
          a.style.alignItems = "center"
          a.style.cursor = "pointer"
          const icon = await this.render("icon/node/path", "/public/pdf-doc.svg", a)
          icon.firstChild.style.fill = this.colors.light.error
          icon.style.width = "34px"
          const text = this.create("p", a)
          text.textContent = "(z.B., produkt.pdf)"
        }
      }
    }

    if (event === "createActionButton") {

      return (node) => {
        const button = this.create("button/action", node)
        button.classList.add("button")
        button.textContent = "(z.B., Daten jetzt speichern)"
      }
    }

    if (event === "createArrowRightWithColorPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die Farbe deines Pfeils ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          const arrow = document.createElement("div")
          arrow.style.display = "flex"
          arrow.style.justifyContent = "center"
          arrow.style.alignItems = "center"
          arrow.style.width = "100%"
          arrow.style.height = "34px"
          node.appendChild(arrow)
          const line = document.createElement("div")
          line.style.height = "3px"
          line.style.backgroundColor = prompt
          line.style.width = "100%"
          arrow.appendChild(line)
          const symbol = document.createElement("span")
          symbol.style.display = "flex"
          symbol.style.justifyContent = "center"
          symbol.style.alignItems = "center"
          symbol.style.fontSize = "21px"
          symbol.style.color = prompt
          symbol.textContent = "➤"
          arrow.appendChild(symbol)
        }
      }
    }

    if (event === "createFlexRow") {

      return (node) => {
        node.style.display = "flex"
        node.style.flexDirection = null
        node.style.flexWrap = "wrap"
        const div = document.createElement("div")
        div.style.margin = "21px 34px"
        div.textContent = "div"
        node.appendChild(div)
      }

    }

    if (event === "createFlexColumn") {

      return (node) => {
        node.style.display = "flex"
        node.style.flexDirection = "column"
        node.style.flexWrap = null
        const div = document.createElement("div")
        div.style.margin = "21px 34px"
        div.textContent = "div"
        node.appendChild(div)
      }

    }

    if (event === "create/div/flex-matrix-prompt/node") {

      const prompt = window.prompt("Gebe deine Zeilenmatrix ein: (z.B, 1 2 2)")
      const regex = /^([1-9] )*[1-9]$/
      if (regex.test(prompt)) {
        const rows = prompt.split(" ")
        const wrapContainer = document.createElement("div")
        wrapContainer.classList.add("flex-container")
        wrapContainer.style.display = "flex"
        wrapContainer.style.flexWrap = "wrap"
        wrapContainer.style.margin = "21px 34px"
        for (var i = 0; i < rows.length; i++) {
          const row = rows[i]
          const rowNumber = parseInt(row)
          if (rowNumber >= 1 && rowNumber <= 9) {
            const rowDiv = document.createElement("div")
            rowDiv.classList.add(`row-${i + 1}`)
            rowDiv.style.width = "300px"
            rowDiv.style.display = "flex"
            rowDiv.style.flexWrap = "wrap"
            wrapContainer.append(rowDiv)
            for (let i = 0; i < rowNumber; i++) {
              const rowPart = document.createElement("div")
              rowPart.classList.add("row-part")
              rowPart.textContent = `(z.B., flex-item-${i + 1})`
              rowPart.style.width = `${100 / rowNumber}%`
              rowDiv.append(rowPart)
            }
          }
        }
        input.node.appendChild(wrapContainer)
        if (wrapContainer.children.length === 0) {
          wrapContainer.remove()
        }
      }

    }

    if (event === "createFlexWidthWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die Breite deiner Flex Elemente ein: (z.B., 20% 300px 20vw)")
        if (!this.verifyIs("text/empty", prompt)) {
          const widths = prompt.split(" ")
          const flexContainer = document.createElement("div")
          flexContainer.classList.add("flex-container")
          flexContainer.style.display = "flex"
          flexContainer.style.margin = "21px 34px"
          flexContainer.style.flexWrap = "wrap"
          for (var i = 0; i < widths.length; i++) {
            const width = widths[i]
            const flexItem = document.createElement("div")
            flexItem.classList.add("flex-item")
            flexItem.textContent = `(z.B., flex-item-${i + 1})`
            flexItem.style.flex = `1 1 ${width}`
            flexContainer.appendChild(flexItem)
          }
          node.appendChild(flexContainer)
        }
      }

    }

    if (event === "createGridMatrixWithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe die Matrix deiner Grid Elemente ein: (z.B., 2 3 3)")
        if (!this.verifyIs("text/empty", prompt)) {
          const columnsPerRow = prompt.split(" ").map(Number)
          const gridContainer = document.createElement("div")
          gridContainer.classList.add("grid-container")
          gridContainer.style.display = "grid"
          gridContainer.style.margin = "21px 34px"
          columnsPerRow.forEach(columns => {
            const gridRow = document.createElement("div")
            gridRow.classList.add("grid-row")
            gridRow.style.display = "grid"
            gridRow.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`
            for (let i = 0; i < columns; i++) {
              const gridItem = document.createElement("div")
              gridItem.classList.add("grid-item")
              gridItem.textContent = `(z.B., grid-item-${i + 1})`
              gridRow.appendChild(gridItem)
            }
            gridContainer.appendChild(gridRow)
          })
          node.appendChild(gridContainer)
        }
      }

    }

    if (event === "createHr") {

      return (node) => {
        const div = document.createElement("div")
        div.classList.add("hr")
        div.style.border = "0.5px solid black"
        node.appendChild(div)
      }
    }

    if (event === "createImageText") {

      return (node) => this.create("div/image-text", node)
    }

    if (event === "createKeyValue") {

      return (node) => this.create("div/key-value", node)
    }

    if (event === "createSafeDivPackOuter") {

      return (node) => {
        const div = this.create("div")
        div.setAttribute("style", node.getAttribute("style"))
        div.textContent = node.textContent
        node.parentElement.insertBefore(div, node)
        node.remove()
      }
    }

    if (event === "createDivPackOuter") {

      return (node) => {
        const div = this.create("div")
        div.textContent = node.outerHTML
        node.parentElement.insertBefore(div, node)
        node.remove()
      }
    }

    if (event === "createScrollableY") {

      return node => this.create("div/scrollable", node)
    }

    if (event === "createSpaceWithHeightPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den Abstand deines Leerraums, in px, ein: (z.B., 350)")
        if (!this.verifyIs("text/empty", prompt)) {
          const space = document.createElement("div")
          space.classList.add("space")
          space.style.width = "100%"
          space.style.height = `${prompt}px`
          node.appendChild(space)
        }
      }
    }

    if (event === "createH1withPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den HTML Inhalt deiner Überschrift ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          const h1 = this.create("h1")
          h1.textContent = prompt
          node.appendChild(h1)
        }
      }
    }

    if (event === "createH2withPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den HTML Inhalt deiner Überschrift ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          const h2 = this.create("h2")
          h2.textContent = prompt
          node.appendChild(h2)
        }
      }
    }

    if (event === "createH3withPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den HTML Inhalt deiner Überschrift ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          const h3 = this.create("h3")
          h3.textContent = prompt
          node.appendChild(h3)
        }
      }
    }

    if (event === "createLeftImageHeader") {

      return (node) => {
        const header = this.create("header/left", node)
        header.left.style.width = "34px"
      }
    }

    if (event === "createImagePlaceholder") {

      return (node) => {
        const image = document.createElement("img")
        image.src = "/public/image.svg"
        image.style.width = "100%"
        node.appendChild(image)
      }
    }

    if (event === "createCheckboxInput") {

      return node => this.create("input/checkbox", node)
    }

    if (event === "createPasswordInput") {

      return node => this.create("input/password", node)
    }

    if (event === "createSelectInput") {

      return node => this.create("input/select", node)
    }

    if (event === "createTelInput") {

      return node => this.create("input/tel", node)
    }

    if (event === "createTextInput") {

      return node => this.create("input/text", node)
    }

    if (event === "createPwithPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe den HTML Inhalt deines Paragraphen ein:")
        const p = this.create("p", node)
        p.textContent = prompt
        return p
      }
    }

    if (event === "createSpanWithTextContent") {

      return (node) => {
        Array.from(node.childNodes).forEach(it => {
          if (it.nodeType === Node.TEXT_NODE) {
            const span = document.createElement("span")
            span.textContent = it.textContent
            input.node.replaceChild(span, it)
          }
        })
      }
    }

    if (event === "createSpanWithSiPrompt") {

      return (node) => {
        const prompt = window.prompt("Gebe deine SI-Einheit ein:")
        const si = document.createElement("span")
        si.classList.add("si")
        si.textContent = node.textContent
        if (prompt === "kWh" || prompt.startsWith("ct")) si.textContent = "0"
        if (
          prompt === "€" ||
          prompt.startsWith("EURO") ||
          prompt.startsWith("Euro") ||
          prompt === "%"
        ) si.textContent = "0,00"
        const unit = document.createElement("span")
        unit.classList.add("unit")
        unit.textContent = prompt
        unit.style.margin = "0 5px"
        node.textContent = ""
        node.appendChild(si)
        node.appendChild(unit)
      }
    }

    if (event === "createTableWithMatrixPrompt") {

      return (node) => {
        const prompt = window.prompt("Trenne Spalten mit Leerzeichen und bistimme die Breite deiner Tabelle von 1-9: (z.B., 4 1 1 4 (= 10))")
        if (!this.verifyIs("text/empty", prompt)) {
          const columns = prompt.split(" ")
          const table = document.createElement("table")
          table.style.width = "100%"
          table.row = document.createElement("tr")
          table.row.style.display = "flex"
          table.row.style.width = "100%"
          for (let i = 0; i < columns.length; i++) {
            const width = columns[i]
            const number = parseInt(width)
            if (number >= 1 && number <= 9) {
              table.header = document.createElement("th")
              table.header.textContent = `(z.B., th-${i + 1})`
              table.header.style.flex = `1 1 ${number * 10}%`
              table.row.appendChild(table.header)
            }
          }
          table.appendChild(table.row)
          node.appendChild(table)
          if (table.row.children.length === 0) {
            table.remove()
          }
        }
      }
    }

    if (event === "convertTextContentToDuckDuckGoLink") {
      return (node) => {
        const duckDuckGoUrl = "https://duckduckgo.com/?q="
        const textContent = node.textContent
        const encoded = encodeURIComponent(textContent)
        const searchUrl = duckDuckGoUrl + encoded
        const link = document.createElement("a")
        link.href = searchUrl
        link.target = "_blank"
        link.textContent = `DuckDuckGo-Suche für ' ${textContent} ' öffnen.`
        Helper.style(link, {fontFamily: "sans-serif"})
        Helper.convert("link-colors", link)
        node.textContent = ""
        node.appendChild(link)
      }
    }

    if (event === "overlay-text-converter") {
      this.overlay("popup", overlay => {
        this.render("text/h1", "Text Konverter Funktionen", overlay)

        const converter = this.create("div/scrollable", overlay)

        {
          const field = this.create("field/textarea", converter)
          field.label.textContent = "Eine mit Komma getrennte Liste in geschweiften Klammern, wird auf eine Zeile konvertiert"
          field.input.style.height = "233px"
          field.input.style.fontSize = "13px"
          field.input.style.fontFamily = "monospace"
          field.input.placeholder = `Fügen Sie Ihren Text im angegebenen Format ein und klicken Sie dann auf 'Konvertieren', um ihn in eine einzelne Zeile umzuwandeln.

          Zum Beispiel:
          {
            svgPickerOptions,
            createFlexButton,
            wrapButton,
            ...
          }

          Klicken Sie auf 'Text jetzt konvertieren', um:

          {svgPickerOptions, createFlexButton, wrapButton, ...}

          zu erhalten`
          const convert = this.create("button/action", field)
          convert.textContent = "Text jetzt konvertieren"
          convert.onclick = () => {

            let text = field.input.value
            try {
              if (text.startsWith("{")) {
                if (text.endsWith("}")) {
                  text = text.slice(1, -1).trim()
                  const textArray = text.split(",").map(text => text.trim())
                  const filtered = textArray.filter(text => !this.verifyIs("text/empty", text))
                  const singleLine = filtered.join(", ")
                  field.input.value = `{${singleLine}}`
                  this.convert("text/clipboard", field.input.value).then(() => {
                    window.alert("Dein konvertierter Text wurde erfolgreich in deine Zwischenablage gespeichert.")
                    this.add("style/node/valid", field.input)
                  })
                }
              }
              throw new Error("text not supported")
            } catch (error) {
              this.add("style/node/not-valid", field.input)
            }
          }
        }

        {
          const field = this.create("field/textarea", converter)
          field.label.textContent = "Eine mit Komma getrennte Liste, wird auf eine Zeile konvertiert"
          field.input.style.height = "233px"
          field.input.style.fontSize = "13px"
          field.input.style.fontFamily = "monospace"
          field.input.placeholder = `Fügen Sie Ihren Text im angegebenen Format ein und klicken Sie dann auf 'Konvertieren', um ihn in eine einzelne Zeile umzuwandeln.

          Zum Beispiel:

          svgPickerOptions,
          createFlexButton,
          wrapButton,
          ...

          Klicken Sie auf 'Text jetzt konvertieren', um:

          svgPickerOptions, createFlexButton, wrapButton, ...

          zu erhalten`
          const convert = this.create("button/action", field)
          convert.textContent = "Text jetzt konvertieren"
          convert.onclick = () => {

            let text = field.input.value
            try {
              const textArray = text.split(",").map(text => text.trim())
              const filtered = textArray.filter(text => !this.verifyIs("text/empty", text))
              const singleLine = filtered.join(", ")
              field.input.value = singleLine
              this.convert("text/clipboard", field.input.value).then(() => {
                window.alert("Dein konvertierter Text wurde erfolgreich in deine Zwischenablage gespeichert.")
                this.add("style/node/valid", field.input)
              })
              throw new Error("text not supported")
            } catch (error) {
              this.add("style/node/not-valid", field.input)
            }
          }
        }

      })
    }


  }

  static get(event, parent, input) {
    // event = thing/from/algorithm

    // no parent needed to get data
    if (arguments.length === 2) {
      input = parent
    }


    if (event === "funnel/select-option") {

      const optionField = this.create("field/text", parent)
      optionField.label.textContent = "Antwortmöglichkeit"
      optionField.input.setAttribute("required", "true")
      this.verify("input/value", optionField.input)
      optionField.input.addEventListener("input", () => {

        const value = optionField.input.value

        if (input !== undefined) {
          if (input.tagName === "OPTION") {
            input.value = value
            input.text = value
          }
        }

      })

      if (input !== undefined) {
        if (input.tagName === "OPTION") {
          optionField.input.value = input.value
          this.verify("input/value", optionField.input)
          // optionField.value(() => input.value)
          // optionField.verifyValue()
        }
      }

      if (input !== undefined) {
        if (input.tagName !== "OPTION") {
          const submitButton = this.create("button/action", parent)
          submitButton.textContent = "Option jetzt anhängen"
          submitButton.addEventListener("click", async () => {

            await this.verify("input/value", optionField.input)

            const value = optionField.input.value

            const option = document.createElement("option")
            option.value = value
            option.text = value

            input.append(option)

            if (input.ok !== undefined) await input.ok()
          })


        }
      }



    }

    if (event === "field-funnel/fields") {

      if (input.classList.contains("field-funnel")) {


        parent.textContent = ""
        for (let i = 0; i < input.children.length; i++) {
          const field = input.children[i]

          if (field.classList.contains("submit-field-funnel-button")) continue

          if (field.classList.contains("field")) {
            const fieldInput = field.querySelector(".field-input")


            const button = this.create("button/left-right", parent)
            button.left.textContent = field.id

            button.right.append(this.convert("element/alias", fieldInput))
            button.addEventListener("click", () => {
              this.overlay("toolbox", overlay => {
                overlay.info.append(this.convert("element/alias", fieldInput))
                const content = this.create("div/scrollable", overlay)
                if (fieldInput.tagName === "SELECT") {
                  {
                    const button = this.create("button/left-right", content)
                    button.left.textContent = ".options"
                    button.right.textContent = "Antwortmöglichkeiten definieren"
                    button.addEventListener("click", () => {
                      this.overlay("toolbox", overlay => {
                        this.removeOverlayButton(overlay)

                        const info = this.create("header/info", overlay)
                        info.append(this.convert("element/alias", fieldInput))
                        info.append(this.convert("text/span", ".options"))

                        {
                          const button = this.create("button/left-right", overlay)
                          button.left.textContent = ".append"
                          button.right.textContent = "Neue Antwortmöglichkeit anhängen"
                          button.addEventListener("click", () => {

                            this.overlay("toolbox", overlay => {
                              this.removeOverlayButton(overlay)

                              const info = this.create("header/info", overlay)
                              info.append(this.convert("element/alias", fieldInput))
                              info.append(this.convert("text/span", ".option.append"))

                              const optionFunnel = this.create("div/scrollable", overlay)

                              const optionField = this.create("field/textarea", optionFunnel)
                              optionField.label.textContent = "Antwortmöglichkeit"
                              optionField.input.setAttribute("required", "true")
                              this.verify("input/value", optionField.input)
                              optionField.input.addEventListener("input", () => this.verify("input/value", optionField.input))

                              const submitButton = this.create("button/action", optionFunnel)
                              submitButton.textContent = "Option jetzt anhängen"
                              submitButton.addEventListener("click", async () => {

                                const value = optionField.input.value

                                const option = document.createElement("option")
                                option.value = value
                                option.text = value
                                fieldInput.appendChild(option)

                                this.render("select/options", fieldInput, options)

                                overlay.remove()

                              })



                            })
                          })
                        }

                        this.render("text/hr", "Optionen", overlay)

                        const options = this.create("div/scrollable", overlay)
                        this.render("select/options", fieldInput, options)

                      })
                    })
                  }

                }

                field.ok = () => {
                  this.get(event, parent, input)
                  overlay.remove()
                }

                this.get("funnel/field", content, field)






              })
            })
          }

        }





      }

    }

    if (event === "funnel/field") {

      const funnel = this.create("div/scrollable", parent)

      const idField = this.create("field/tag", funnel)
      idField.label.textContent = "Gebe deinem Datenfeld eine Id"
      this.verify("input/value", idField.input)
      idField.input.addEventListener("input", () => {

        this.verify("input/value", idField.input)

        const id = idField.input.value

        if (document.getElementById(id) !== null) {
          this.add("style/node/not-valid", idField.input)
        }

        if (input !== undefined) {
          if (input.classList.contains("field")) {
            if (document.getElementById(id) === null) {
              input.setAttribute("id", id)
            }
          }
        }

      })

      if (input !== undefined) {
        if (input.classList.contains("field")) {
          if (input.hasAttribute("id")) {
            idField.input.value = input.getAttribute("id")
            this.verify("input/value", idField.input)
          }
        }
      }


      const labelField = this.create("field/textarea", funnel)
      labelField.label.textContent = "Beschreibe das Datenfeld für dein Netzwerk"
      labelField.input.setAttribute("required", "true")
      this.verify("input/value", labelField.input)
      labelField.input.addEventListener("input", () => {

        const label = input.querySelector(".field-label")
        const value = labelField.input.value
        if (input !== undefined) {
          if (input.classList.contains("field")) {
            if (label !== null) {
              label.textContent = value
            }
          }
        }
        this.verify("input/value", labelField.input)

      })

      if (input !== undefined) {
        if (input.classList.contains("field")) {
          if (input.querySelector(".field-label") !== null) {
            labelField.input.value = input.querySelector(".field-label").textContent
            this.verify("input/value", labelField.input)
          }
        }
      }

      const infoField = this.create("field/textarea", funnel)
      infoField.label.textContent = "Hier kannst du, wenn du möchtest, mehr Informationen zu diesem Datenfeld, als HTML, für deine Nutzer, bereitstellen"
      infoField.input.style.height = "144px"
      infoField.input.placeholder = "<div>..</div>"
      infoField.input.style.fontFamily = "monospace"
      infoField.input.style.fontSize = "13px"
      this.verify("input/value", infoField.input)

      infoField.input.addEventListener("input", () => {
        const info = infoField.input.value

        const script = this.create("script", {id: "on-info-click", js: 'Helper.add("on-info-click")'})
        this.add("script-onbody", script)

        if (this.verifyIs("text/empty", info)) return input.removeAttribute("on-info-click")

        if (input !== undefined) {
          if (input.classList.contains("field")) {
            input.setAttribute("on-info-click", info)
          }
        }
        this.verify("input/value", infoField.input)

      })

      if (input !== undefined) {
        if (input.classList.contains("field")) {
          if (input.hasAttribute("on-info-click")) {
            infoField.input.value = input.getAttribute("on-info-click")
            this.verify("input/value", infoField.input)
          }
        }
      }

      const typeField = this.create("field/select", funnel)
      typeField.label.textContent = "Welchen Datentyp soll dein Netzwerk eingeben können"
      typeField.input.add(["text", "textarea", "email", "tel", "range", "password", "number", "file", "date", "checkbox", "select"])
      this.verify("input/value", typeField.input)
      typeField.input.addEventListener("input", () => {
        const value = typeField.input.value

        if (input !== undefined) {
          if (input.classList.contains("field")) {
            const fieldInput = input.querySelector(".field-input")

            if (fieldInput !== null) {

              this.update("field-input/type", fieldInput, value)

            }
          }
        }

        this.render("funnel/field-input", {type: value, field: input})

        if (input.classList.contains("field-funnel")) {
          this.render("field-funnel/fields", input)
        } else {
          this.render("field-funnel/fields", input.parentElement)
        }

      })

      if (input !== undefined) {

        if (input.classList.contains("field")) {
          const fieldInput = input.querySelector(".field-input")

          let type
          if (fieldInput.tagName === "INPUT") {
            type = fieldInput.getAttribute("type")
          }
          if (fieldInput.tagName === "SELECT") {
            type = "select"
          }
          if (fieldInput.tagName === "TEXTAREA") {
            type = "textarea"
          }

          if (fieldInput !== null) {
            typeField.input.add([type])

            const fieldInputFunnel = this.create("div", funnel)
            this.render("funnel/field-input", {type, field: input}, fieldInputFunnel)

          }
        }
      }

      if (input !== undefined) {
        if (input.classList.contains("field-funnel")) {

          const button = this.create("button/action", funnel)
          button.textContent = "Datenfeld jetzt anhängen"
          button.addEventListener("click", async () => {

            await this.verify("field-funnel", funnel)

            const id = idField.input.value
            const type = typeField.input.value
            const label = labelField.input.value
            const info = infoField.input.value

            if (document.getElementById(id) !== null) {
              window.alert("Id existiert bereits.")
              idField.scrollIntoView({behavior: "smooth"})
              this.add("style/node/not-valid", idField.input)
              throw new Error("id exist")
            }

            if (document.getElementById(id) === null) {

              const field = this.convert("text/field", type)
              field.id = id
              field.label.textContent = label

              if (!this.verifyIs("text/empty", info)) {
                field.setAttribute("on-info-click", info)
                const script = this.create("script", {id: "on-info-click", js: 'Helper.add("on-info-click")'})
                this.add("script-onbody", script)
              }

              input.querySelector(".submit-field-funnel-button").before(field)
              if (input.ok !== undefined) await input.ok()

            }

          })

        }
      }


      if (input !== undefined) {
        if (input.classList.contains("field")) {

          const button = this.create("button/action", funnel)
          button.style.backgroundColor = this.colors.dark.error
          button.style.color = this.colors.light.text
          button.textContent = "Datenfeld entfernen"
          button.addEventListener("click", async () => {

            input.remove()
            if (input.ok !== undefined) await input.ok()


          })

        }
      }

    }

    if (event === "role-apps/closed") {

      return new Promise(async (resolve, reject) => {

        const content = this.create("info/loading", parent)

        const res = await this.request("/verify/user/closed/")
        if (res.status === 200) {

          const res = await this.request("/get/platform/role-apps/", {id: input})
          if (res.status === 200) {
            const apps = JSON.parse(res.response)

            this.convert("parent/scrollable", content)

            for (let i = 0; i < apps.length; i++) {
              const app = apps[i]

              const button = this.create("button/left-right", content)
              button.left.textContent = `.${app}`

              if (app === "scripts") {
                button.right.textContent = "Meine HTML Skripte"


                button.addEventListener("click", () => {
                  this.overlay("toolbox", async overlay => {

                    this.removeOverlayButton(overlay)
                    const info = this.create("header/info", overlay)
                    info.textContent = `.scripts`

                    const create = this.create("button/left-right", overlay)
                    create.left.textContent = ".create"
                    create.right.textContent = "Neues Skript hochladen"
                    create.addEventListener("click", () => {

                      this.overlay("toolbox", overlay => {
                        this.removeOverlayButton(overlay)
                        const info = this.create("header/info", overlay)
                        info.append(this.convert("text/span", ".script"))

                        const funnel = this.create("div/scrollable", overlay)

                        const nameField = this.create("field/tag", funnel)
                        nameField.input.placeholder = "mein-skript"
                        this.verify("input/value", nameField.input)
                        nameField.input.addEventListener("input", () => this.verify("input/value", nameField.input))

                        const scriptField = this.create("field/script", funnel)
                        scriptField.input.style.height = "100vh"
                        this.verify("input/value", scriptField.input)
                        scriptField.input.addEventListener("input", () => this.verify("input/value", scriptField.input))

                        const button = this.create("button/action", funnel)
                        button.textContent = "Skript jetzt speichern"
                        button.addEventListener("click", async () => {

                          await this.verify("field-funnel", funnel)

                          const map = {}
                          map.script = scriptField.input.value
                          map.id = nameField.input.value

                          this.overlay("security", async securityOverlay => {

                            const res = await this.request("/register/script/closed", map)

                            if (res.status === 200) {

                              this.convert("parent/loading", content)
                              await this.render("scripts/update-buttons", content)

                              securityOverlay.remove()
                              overlay.remove()

                            }

                            if (res.status !== 200) {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }

                          })

                        })

                      })

                    })

                    this.render("text/hr", "Meine Skripte", overlay)

                    const content = this.create("info/loading", overlay)

                    await this.render("scripts/update-buttons", content)


                  })
                })

              }


            }

            return resolve(content)

          }

          if (res.status !== 200) {
            this.convert("element/reset", content)
            this.render("nav/open", content)
          }
        } else {
          this.convert("element/reset", content)
          this.render("nav/open", content)
        }
      })
    }

  }

  static overlay(event, callback) {

    if (event === "html-creator") {

      const overlay = document.createElement("div")
      overlay.classList.add("overlay")
      overlay.style.height = "55vh"
      overlay.style.overscrollBehavior = "none"
      overlay.style.width = "100%"
      overlay.style.zIndex = "99999999999999"
      overlay.style.position = "fixed"
      overlay.style.bottom = "0"
      overlay.style.left = "0"
      overlay.style.background = this.colors.light.background
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        overlay.style.background = this.colors.dark.background
      }
      overlay.style.display = "flex"
      overlay.style.flexDirection = "column"
      overlay.style.opacity = 0
      this.removeOverlayButton(overlay)
      if (callback) callback(overlay)
      document.body.append(overlay)
      this.animate("fade-up", overlay)
      return overlay
    }

    if (event === "toolbox") {

      const overlay = this.create("div/overlay")
      overlay.removeOverlayButton = this.removeOverlayButton(overlay)
      overlay.removeOverlayButton.removeAttribute("class")
      overlay.removeOverlayButton.onclick = () => overlay.remove()
      this.add("outline-hover", overlay.removeOverlayButton)
      overlay.registerHtmlButton = this.registerHtmlButton(overlay)
      overlay.info = this.create("header/info", overlay)
      overlay.style.opacity = 0
      if (callback) callback(overlay)
      document.body.append(overlay)

      this.animate("fade-up", overlay)

      // const animation = overlay.animate([
      //   { opacity: 0, transform: 'translateY(13px)' },
      //   { opacity: 1, transform: 'translateY(0)' },
      // ], {
      //   duration: 233,
      //   easing: 'ease-in-out',
      //   fill: "forwards"
      // })
      return overlay

    }

    if (event === "popup") {

      const overlay = this.create("div/overlay")
      overlay.style.opacity = 0
      overlay.info = this.create("header/info", overlay)
      this.removeOverlayButton(overlay)
      if (callback) callback(overlay)
      document.body.append(overlay)

      this.animate("fade-up", overlay)

      // const animation = overlay.animate([
      //   { opacity: 0, transform: 'translateY(13px)' },
      //   { opacity: 1, transform: 'translateY(0)' },
      // ], {
      //   duration: 233,
      //   easing: 'ease-in-out',
      //   fill: "forwards"
      // })
      return overlay

    }

    if (event === "info") {

      const overlay = document.createElement("div")
      overlay.classList.add("overlay")
      overlay.style.height = "100%"
      overlay.style.overscrollBehavior = "none"
      overlay.style.width = "100%"
      overlay.style.zIndex = "99999999999999"
      overlay.style.position = "fixed"
      overlay.style.top = "0"
      overlay.style.left = "0"
      overlay.style.background = this.colors.light.background
      overlay.style.display = "flex"
      overlay.style.flexDirection = "column"
      overlay.style.opacity = 0

      this.removeOverlayButton(overlay)

      if (callback) callback(overlay)

      document.body.append(overlay)

      this.animate("fade-up", overlay)

      // const animation = overlay.animate([
      //   { opacity: 0, transform: 'translateY(13px)' },
      //   { opacity: 1, transform: 'translateY(0)' },
      // ], {
      //   duration: 344,
      //   easing: 'ease-in-out',
      //   fill: "forwards"
      // })

      return overlay

    }

    if (event === "security") {

      const overlay = this.create("div/overlay")
      overlay.info = this.create("info/loading", overlay)
      if (callback) callback(overlay)
      document.body.append(overlay)
      return overlay

    }

  }

  static render(event, input, parent) {

    if (event === "text/node/action-button") {
      const button = this.create("button/action")
      button.textContent = input
      parent?.append(button)
      return button
    }

    if (event === "left-right/local-script-toggle") {

      const scripts = JSON.parse(window.localStorage.getItem("scripts")) || []

      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i]

        if (script.id === input) {
          if (script.disabled) {
            parent.right.textContent = ""
            const red = this.create("div/red-flag", parent.right)
            red.textContent = "Disabled"
            return parent
          }
        }
      }

      parent.right.textContent = ""
      const green = this.create("div/green-flag", parent.right)
      green.textContent = "OK"

      return parent
    }

    if (event === "left-right/disable-script-local") {
      parent.left.textContent = ".disable"
      parent.right.textContent = "Schalte dein Skript aus"
      parent.onclick = () => {
        this.convert("script/disabled", input.script)
        this.render("left-right/enable-script-local", {script: input.script}, parent)
        input?.ok()
      }
      return parent
    }

    if (event === "left-right/enable-script-local") {
      parent.left.textContent = ".enable"
      parent.right.textContent = "Schalte dein Skript an"
      parent.onclick = () => {
        this.convert("script/enabled", input.script)
        this.render("left-right/disable-script-local", {script: input.script}, parent)
        input?.ok()
      }
      return parent
    }

    if (event === "location-list/node/closed") {

      this.convert("parent/scrollable", parent)
      for (let i = 0; i < input.list.length; i++) {
        const item = input.list[i]

        const itemButton = this.create("button/left-right", parent)
        itemButton.left.textContent = item.titel
        itemButton.right.textContent = item.created
        itemButton.addEventListener("click", () => {

          this.overlay("toolbox", overlay => {

            this.removeOverlayButton(overlay)

            const buttons = this.create("div/scrollable", overlay)

            {
              const button = this.create("button/left-right", buttons)
              button.left.textContent = ".update"
              button.onclick = () => {

                this.overlay("toolbox", async overlay => {
                  this.removeOverlayButton(overlay)

                  this.render("text/title", `${this.convert("text/capital-first-letter", input.tag)}-${i + 1}`, overlay)

                  const fieldFunnel = await this.convert("path/field-funnel", input.path)
                  overlay.append(fieldFunnel)

                  fieldFunnel.querySelectorAll(".field").forEach(field => {
                    Object.entries(item).forEach(([key, value]) => {
                      if (field.id === key) {
                        field.querySelector(".field-input").value = value
                      }
                    })
                  })

                  this.verify("field-funnel", fieldFunnel)

                  const submitButton = fieldFunnel.querySelector(".submit-field-funnel-button")
                  submitButton.textContent = `${this.convert("text/capital-first-letter", input.tag)} jetzt speichern`
                  submitButton.onclick = async () => {

                    await this.verify("field-funnel", fieldFunnel)

                    const map = await this.convert("field-funnel/map", fieldFunnel)

                    this.overlay("security", async securityOverlay => {

                      const res = await this.request("/update/location/list-self/", {id: item.created, tag: input.tag, map})
                      if (res.status === 200) {
                        window.alert("Daten erfolgreich gespeichert.")

                        const res = await this.request("/get/location/tag-self/", {tag: input.tag})
                        if (res.status === 200) {
                          const tag = JSON.parse(res.response)
                          this.render("location-list/node/closed", {list: tag[input.tag], tag: input.tag, path: input.path}, parent)
                        }
                        if (res.status !== 200) {
                          this.convert("parent/info", parent)
                          parent.textContent = `Keine ${this.comvert("text/capital-first-letter", input.tag)} gefunden`
                        }

                        securityOverlay.remove()
                      }

                      if (res.status !== 200) {
                        window.alert("Fehler.. Bitte wiederholen.")
                        securityOverlay.remove()
                      }

                    })

                  }


                })
              }
            }

            {
              const button = this.create("button/left-right", buttons)
              button.left.textContent = ".delete"
              button.onclick = () => {
                this.overlay("security", async securityOverlay => {

                  const res = await this.request("/remove/location/tag-self/", {id: item.created, tag: input.tag})
                  if (res.status === 200) {
                    window.alert("Daten erfolgreich entfernt.")
                    itemButton.remove()
                    overlay.remove()
                    securityOverlay.remove()
                  }
                  if (res.status !== 200) {
                    window.alert("Fehler.. Bitte wiederholen.")
                    securityOverlay.remove()
                  }

                })
              }
            }


          })

        })

      }

    }

    if (event === "location-list/node/email-expert") {

      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/get/location/tag-expert/", {tag: input.tag, email: input.email, path: input.path})
          if (res.status === 200) {
            const tag = JSON.parse(res.response)
            this.convert("parent/scrollable", parent)
            for (let i = 0; i < tag[input.tag].length; i++) {
              const item = tag[input.tag][i]
              const itemButton = this.create("button/left-right", parent)
              itemButton.left.textContent = `${input.tag}-${i + 1}`
              itemButton.right.textContent = item.created
              itemButton.onclick = () => {
                this.overlay("popup", updateButtonsOverlay => {
                  const buttons = this.create("div/scrollable", updateButtonsOverlay)
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".update"
                    button.onclick = () => {
                      this.overlay("popup", async overlay => {
                        this.render("text/title", `${this.convert("text/capital-first-letter", input.tag)}-${i + 1}`, overlay)
                        const fieldFunnel = await this.convert("path/field-funnel", input.path)
                        overlay.append(fieldFunnel)
                        fieldFunnel.querySelectorAll(".field").forEach(field => {
                          Object.entries(item).forEach(([key, value]) => {
                            if (field.id === key) {
                              field.querySelector(".field-input").value = value
                            }
                          })
                        })
                        this.verify("field-funnel", fieldFunnel)
                        const submitButton = fieldFunnel.querySelector(".submit-field-funnel-button")
                        submitButton.textContent = `${this.convert("text/capital-first-letter", input.tag)} jetzt speichern`
                        submitButton.onclick = async () => {
                          await this.verify("field-funnel", fieldFunnel)
                          const map = await this.convert("field-funnel/map", fieldFunnel)
                          this.overlay("security", async securityOverlay => {
                            const update = {}
                            update.email = input.email
                            update.id = item.created
                            update.map = map
                            update.path = input.path
                            update.tag = input.tag
                            const res = await this.request("/update/location/list-email-expert/", update)
                            if (res.status === 200) {
                              window.alert("Daten erfolgreich gespeichert.")
                              await this.render(event, input, parent)
                              overlay.remove()
                              updateButtonsOverlay.remove()
                              securityOverlay.remove()
                            } else {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }
                          })
                        }
                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".delete"
                    button.onclick = () => {
                      this.overlay("security", async securityOverlay => {
                        const res = await this.request("/remove/location/email-expert/", {id: item.created, tag: input.tag, path: input.path, email: input.email})
                        if (res.status === 200) {
                          window.alert("Daten erfolgreich entfernt.")
                          this.render(event, input, parent).catch(error => {
                            this.convert("parent/info", parent)
                            parent.textContent = `Keine ${this.convert("text/capital-first-letter", input.tag)} gefunden`
                          })
                          itemButton.remove()
                          updateButtonsOverlay.remove()
                          securityOverlay.remove()
                        }
                        if (res.status !== 200) {
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }
                      })
                    }
                  }
                })
              }
            }
            resolve()
          } else {
            this.convert("parent/info", parent)
            parent.textContent = `Keine ${this.convert("text/capital-first-letter", input.tag)} gefunden`
          }
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "color/node/foreground") {

      parent.style.position = "relative"

      const foreground = parent.cloneNode("true")
      foreground.classList.add("foreground")
      foreground.textContent = ""
      foreground.style.position = "absolute"
      foreground.style.background = input
      parent.querySelectorAll(".foreground").forEach(it => it.remove())
      parent.appendChild(foreground)

      return foreground
    }

    if (event === "color/node/border") {

      parent.style.position = "relative"

      const border = parent.cloneNode("true")
      border.classList.add("border")
      border.textContent = ""
      border.style.position = "absolute"
      border.style.background = "transparent"
      border.style.border = `8px solid ${input}`
      parent.querySelectorAll(".border").forEach(it => it.remove())
      parent.appendChild(border)

    }

    if (event === "cart/node/open") {

      const cart = this.create("div/scrollable")
      cart.className = "cart"
      parent?.append(cart)

      for (let i = 0; i < input.length; i++) {
        const item = input[i]

        const container = this.create("div", cart)

        const itemDiv = this.create("div", container)
        itemDiv.className = "item"
        itemDiv.style.display = "flex"
        itemDiv.style.margin = "21px 34px"
        itemDiv.style.justifyContent = "space-between"

        const left = this.create("div", itemDiv)
        left.style.width = "144px"
        const img = document.createElement("img")
        img.src = item.image
        img.style.width = "100%"
        left.appendChild(img)
        const middle = this.create("div", itemDiv)
        middle.style.flex = "1 1 0"
        this.render("text/h2", item.titel, middle)

        if (Number(item.stocked) > 21) {
          const text = this.create("div", middle)
          text.textContent = "Auf Lager"
          text.style.fontFamily = "sans-serif"
          text.style.color = this.colors.light.success
          text.style.margin = "0 34px"
        } else if (Number(item.stocked) === 0) {
          const text = this.create("div", middle)
          text.textContent = "Ausverkauft"
          text.style.fontFamily = "sans-serif"
          text.style.color = this.colors.light.error
          text.style.margin = "0 34px"
        } else if (Number(item.stocked) < 21) {
          const text = this.create("div", middle)
          text.textContent = `Nur noch ${item.stocked} Artikel vorhanden`
          text.style.fontFamily = "sans-serif"
          text.style.color = this.colors.matte.orange
          text.style.margin = "0 34px"
        }

        if (Number(item.shipping) === 0) {
          const text = this.create("div", middle)
          text.textContent = "Dieser Hersteller bietet KOSTENLOSEN Versand"
          text.style.fontFamily = "sans-serif"
          text.style.color = "#999"
          text.style.margin = "0 34px"

        } else if (Number(item.shipping) > 0) {
          const text = this.create("div", middle)
          text.textContent = `Versandkosten: ${Number(item.shipping).toFixed(2).replace(".", ",")} €`
          text.style.fontFamily = "sans-serif"
          text.style.color = "#999"
          text.style.margin = "0 34px"
        }

        const tools = this.create("div", middle)
        tools.style.display = "flex"

        const quantity = this.create("div", tools)

        const select = this.create("input/select", quantity)
        this.add("outline-hover", select)


        if (Number(item.quantity) >= 10) {
          select.add(["0 - Löschen", "1", "2", "3", "4", "5", "6", "7", "8", "9", `${item.quantity}`, `${item.quantity}+`])
        } else {
          select.add(["0 - Löschen", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"])
        }

        if (Number(item.quantity) > Number(item.stocked)) {
          select.add(["0 - Löschen", "1", "2", "3", "4", "5", "6", "7", "8", "9", `${item.stocked}`, `${item.stocked}+`])
        }

        if (Number(item.quantity) > Number(item.stocked)) {
          select.value = item.stocked
        } else {
          select.value = item.quantity
        }

        select.style.margin = "21px 34px"
        select.style.fontSize = "21px"
        select.style.padding = "21px 34px"
        select.oninput = (ev) => {

          if (ev.target.value.startsWith("0")) {
            const cart = JSON.parse(window.localStorage.getItem("cart"))
            for (let i = 0; i < cart.length; i++) {
              const cartItem = cart[i]
              if (item.id === cartItem.id) {
                cart.splice(i, 1)
                window.localStorage.setItem("cart", JSON.stringify(cart))
                container.remove()

                const localCart = JSON.parse(window.localStorage.getItem("cart"))
                if (localCart.length <= 0) {
                  rightHr.remove()
                  parent.remove()
                }

                if (localCart.length > 0) {
                  const totalQuantity = localCart.reduce((acc, cur) => acc + cur.quantity, 0)

                  let totalPrice = 0
                  for (let i = 0; i < localCart.length; i++) {
                    const cartItem = localCart[i]
                    totalPrice = totalPrice + (cartItem.quantity * Number(cartItem.price))
                  }

                  rightHr.text.textContent = `Zusammenfassung (${totalQuantity} Artikel): ${totalPrice.toFixed(2).replace(".", ",")} €`
                }


              }

            }
          }

          if (ev.target.value.includes("+")) {
            quantity.textContent = ""
            quantity.style.display = "flex"
            quantity.style.justifyContent = "center"
            quantity.style.alignItems = "center"
            const tel = this.create("input/tel", quantity)
            this.add("outline-hover", tel)

            const cart = JSON.parse(window.localStorage.getItem("cart"))
            for (let i = 0; i < cart.length; i++) {
              const cartItem = cart[i]
              if (item.id === cartItem.id) {
                tel.value = cartItem.quantity
              }
            }
            tel.style.borderRadius = "8px"
            tel.style.border = "none"
            tel.style.margin = "21px 34px"
            tel.style.width = "89px"
            tel.style.fontSize = "34px"
            const submit = this.render("text/link", "Aktualisieren", quantity)
            submit.style.margin = "0"
            submit.textContent = "Aktualisieren"
            submit.onclick = () => {

              const cart = JSON.parse(window.localStorage.getItem("cart"))
              for (let i = 0; i < cart.length; i++) {
                const cartItem = cart[i]
                if (item.id === cartItem.id) {
                  if (this.verifyIs("text/+int", tel.value)) {

                    if (Number(tel.value) > Number(item.stocked)) {
                      cartItem.quantity = Number(item.stocked)
                    } else {
                      cartItem.quantity = Number(tel.value)
                    }
                    window.localStorage.setItem("cart", JSON.stringify(cart))
                  }
                }
              }


              quantity.textContent = ""
              quantity.append(select)
              select.textContent = ""
              if (this.verifyIs("text/+int", tel.value)) {

                if (tel.value >= 10) {
                  if (Number(tel.value) > Number(item.stocked)) {
                    select.add(["0 - Löschen", "1", "2", "3", "4", "5", "6", "7", "8", "9", `${item.stocked}`, `${item.stocked}+`])
                  } else {
                    select.add(["0 - Löschen", "1", "2", "3", "4", "5", "6", "7", "8", "9", `${tel.value}`, `${tel.value}+`])
                  }

                } else {
                  select.add(["0 - Löschen", "1", "2", "3", "4", "5", "6", "7", "8", "9", `10+`])
                }

              } else {
                const cart = JSON.parse(window.localStorage.getItem("cart"))
                for (let i = 0; i < cart.length; i++) {
                  const cartItem = cart[i]
                  if (item.id === cartItem.id) {
                    select.add(["0 - Löschen", "1", "2", "3", "4", "5", "6", "7", "8", "9", `${cartItem.quantity}`, `${cartItem.quantity}+`])
                  }
                }
              }

              let result = 0
              if (Number(tel.value) > Number(item.stocked)) {
                result = Number(item.stocked)
              } else {
                result = Number(tel.value)
              }
              select.value = result



              const localCart = JSON.parse(window.localStorage.getItem("cart"))
              if (localCart.length > 0) {
                const totalQuantity = localCart.reduce((acc, cur) => acc + Number(cur.quantity), 0)

                let totalPrice = 0
                for (let i = 0; i < localCart.length; i++) {
                  const cartItem = localCart[i]
                  totalPrice = totalPrice + (cartItem.quantity * Number(cartItem.price))
                }

                rightHr.text.textContent = `Zusammenfassung (${totalQuantity} Artikel): ${totalPrice.toFixed(2).replace(".", ",")} €`
              }



            }

          }

          if (Number(ev.target.value) > 0 && Number(ev.target.value) < 10) {

            let result = 0
            if (Number(ev.target.value) > Number(item.stocked)) {
              result = Number(item.stocked)
            } else {
              result = Number(ev.target.value)
            }
            select.value = result


            let cart = JSON.parse(window.localStorage.getItem("cart"))
            for (let i = 0; i < cart.length; i++) {
              const cartItem = cart[i]
              if (item.id === cartItem.id) {
                if (this.verifyIs("text/+int", Number(ev.target.value))) {
                  if (Number(ev.target.value) > Number(item.stocked)) {
                    cartItem.quantity = Number(item.stocked)
                  } else {
                    cartItem.quantity = Number(ev.target.value)
                  }
                  window.localStorage.setItem("cart", JSON.stringify(cart))
                }
              }
            }

            cart = JSON.parse(window.localStorage.getItem("cart"))
            if (cart.length > 0) {
              const totalQuantity = cart.reduce((acc, cur) => acc + Number(cur.quantity), 0)
              let totalPrice = 0
              for (let i = 0; i < cart.length; i++) {
                const cartItem = cart[i]
                totalPrice = totalPrice + (Number(cartItem.quantity) * Number(cartItem.price))
              }
              rightHr.text.textContent = `Zusammenfassung (${totalQuantity} Artikel): ${totalPrice.toFixed(2).replace(".", ",")} €`
            }
          }

        }

        if (Number(item.quantity) > Number(item.stocked)) {
          const cart = JSON.parse(window.localStorage.getItem("cart"))
          for (let i = 0; i < cart.length; i++) {
            const cartItem = cart[i]
            if (item.id === cartItem.id) {
              cartItem.quantity = Number(item.stocked)
              window.localStorage.setItem("cart", JSON.stringify(cart))
            }
          }
        }

        const del = this.render("text/link", "Löschen", tools)
        del.onclick = () => {
          const cart = JSON.parse(window.localStorage.getItem("cart"))
          for (let i = 0; i < cart.length; i++) {
            const cartItem = cart[i]
            if (item.id === cartItem.id) {
              cart.splice(i, 1)
              window.localStorage.setItem("cart", JSON.stringify(cart))
              container.remove()

              const localCart = JSON.parse(window.localStorage.getItem("cart"))
              if (localCart.length <= 0) {
                rightHr.remove()
                parent.remove()
              }

              if (localCart.length > 0) {
                const totalQuantity = localCart.reduce((acc, cur) => acc + Number(cur.quantity), 0)

                let totalPrice = 0
                for (let i = 0; i < localCart.length; i++) {
                  const cartItem = localCart[i]
                  totalPrice = totalPrice + (cartItem.quantity * Number(cartItem.price))
                }

                rightHr.text.textContent = `Zusammenfassung (${totalQuantity} Artikel): ${totalPrice.toFixed(2).replace(".", ",")} €`
              }


            }

          }
        }
        const more = this.render("text/link", "Weitere Artikel wie dieser", tools)

        const right = this.create("div", itemDiv)
        right.style.display = "flex"
        right.style.justifyContent = "flex-end"
        const title = this.render("text/title", `${Number(item.price).toFixed(2).replace(".", ",")} €`, right)
        title.style.margin = "21px 0"

      }


      const localCart = JSON.parse(window.localStorage.getItem("cart"))
      let rightHr
      if (localCart.length > 0) {
        const totalQuantity = localCart.reduce((acc, cur) => acc + Number(cur.quantity), 0)

        let totalPrice = 0
        for (let i = 0; i < localCart.length; i++) {
          const cartItem = localCart[i]
          totalPrice = totalPrice + (cartItem.quantity * Number(cartItem.price))
        }

        rightHr = this.render("text/right-hr", `Zusammenfassung (${totalQuantity} Artikel): ${totalPrice.toFixed(2).replace(".", ",")} €`, cart)
      }

    }

    if (event === "contacts/node/next-list") {
      if (arguments.length === 2) {
        parent = input
      }

      return new Promise(async(resolve, reject) => {
        try {

          const res = await this.request("/get/contacts/self/")
          if (res.status === 200) {
            const contacts = JSON.parse(res.response)

            parent.textContent = ""

            for (let i = 0; i < contacts.length; i++) {
              const contact = contacts[i]

              if (contact.notes) {
                const regex = /next:(\w+)(?:\+(\d+[dm]))?\(([^)]+)\)/g
                let match

                while ((match = regex.exec(contact.notes)) !== null) {
                  const action = match[1]
                  const duration = match[2] || ''
                  const content = match[3]

                  const button = this.create("button/left-right", parent)

                  if (contact.status === "lead-new") {
                    button.style.border = `3px solid ${this.colors.matte.green}`
                    this.animate("node/border-ripple-out", button)
                    this.render("text/node/bottom-right-onhover", "Neuer Kontakt", button)
                  }

                  if (contact.status === "lead-update") {
                    button.style.border = `3px solid ${this.colors.matte.sunflower}`
                    this.animate("node/border-ripple-out", button)
                    this.render("text/node/bottom-right-onhover", "Neue Kontaktanfrage", button)
                  }


                  if (action === "tel" || action === "webcall") {
                    let title
                    if (contact.alias) {
                      title = this.render("text/div", `${contact.alias} anrufen.`, button.left)
                    } else {
                      title = this.render("text/div", `${contact.email} anrufen.`, button.left)
                    }

                    if (contact.phone) {
                      this.render("icon/node/path", "/public/phone-out.svg", button.right).then(icon => {
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
                      title = this.render("text/div", `${contact.alias} schreiben.`, button.left)
                    } else {
                      title = this.render("text/div", `${contact.email} schreiben.`, button.left)
                    }

                    if (contact.email) {
                      this.render("icon/node/path", "/public/email-out.svg", button.right).then(icon => {
                        icon.style.width = "34px"
                        icon.style.padding = "0 13px"
                      })
                      button.onclick = () => {
                        window.location.href = `mailto:${contact.email}`
                      }
                    }
                  }

                  const contentDiv = this.create("div")
                  contentDiv.textContent = content
                  contentDiv.style.fontSize = "13px"
                  button.left.appendChild(contentDiv)


                }
              }
            }
            resolve(parent)
          }

        } catch (error) {
          reject(error)
        }
      })




    }

    if (event === "icon/node/path") {

      return new Promise(async(resolve, reject) => {
        try {
          const icon = await this.convert("path/icon", input)
          parent?.append(icon)
          resolve(icon)
        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "image-url/selector/self") {

      return new Promise(async(resolve, reject) => {
        try {
          const parentNode = document.querySelector(parent)
          if (parentNode === null) throw new Error("selector not found")
          const res = await this.request("/get/user/tree-closed/", {tree: input})
          if (res.status === 200) {
            const oldHtml = parentNode.innerHTML
            parentNode.innerHTML = ""
            parentNode.style.display = "flex"
            parentNode.style.justifyContent = "center"
            parentNode.style.alignItems = "center"
            const image = document.createElement("img")
            parentNode.append(image)
            image.src = res.response
            image.style.width = "300px"
            image.style.margin = "34px"
            parentNode.onclick = async () => {
              parentNode.innerHTML = await Helper.convert("text/purified", oldHtml)
              parentNode.onclick = null
              const urlInput = parentNode.querySelector(".field-input")
              urlInput.oninput = () => this.verify("input/value", urlInput)
              const submitButton = parentNode.querySelector(".submit-field-funnel-button")
              submitButton.addEventListener("click", async () => {
                await this.verify("input/value", urlInput)
                const res = await this.request("/register/user/text-tree-self", {text: urlInput.value, tree: input})
                if (res.status === 200) {
                  window.alert("Daten erfolgreich gespeichert.")
                  if (submitButton.hasAttribute("next-path")) {
                    window.location.assign(submitButton.getAttribute("next-path"))
                  } else {
                    window.location.reload()
                  }
                }
              })
            }
          } else {
            const urlInput = parentNode.querySelector(".field-input")
            urlInput.oninput = () => this.verify("input/value", urlInput)
            const submitButton = parentNode.querySelector(".submit-field-funnel-button")
            submitButton.addEventListener("click", async () => {
              await this.verify("input/value", urlInput)
              const res = await this.request("/register/user/text-tree-self", {text: urlInput.value, tree: input})
              if (res.status === 200) {
                window.alert("Daten erfolgreich gespeichert.")
                window.location.reload()
              }
            })
          }
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "field-funnel/owner") {

      const funnel = this.create("div/scrollable", parent)

      const firstnameField = this.create("field/text", funnel)
      if (input.firstname) firstnameField.input.value = input.firstname
      firstnameField.label.textContent = "Vorname"
      firstnameField.input.placeholder = "Max"
      firstnameField.input.setAttribute("required", "true")
      firstnameField.input.maxLength = "55"
      firstnameField.input.addEventListener("input", () => this.verify("input/value", firstnameField.input))
      this.verify("input/value", firstnameField.input)

      const lastnameField = this.create("field/text", funnel)
      if (input.lastname) lastnameField.input.value = input.lastname
      lastnameField.label.textContent = "Nachname"
      lastnameField.input.placeholder = "Muster"
      lastnameField.input.setAttribute("required", "true")
      lastnameField.input.maxLength = "55"
      lastnameField.input.addEventListener("input", () => this.verify("input/value", lastnameField.input))
      this.verify("input/value", lastnameField.input)

      const streetField = this.create("field/text", funnel)
      if (input.street) streetField.input.value = input.street
      streetField.label.textContent = "Straße und Hausnummer"
      streetField.input.setAttribute("required", "true")
      streetField.input.placeholder = "Wiesentalstr. 21"
      streetField.input.maxLength = "55"
      streetField.input.addEventListener("input", () => this.verify("input/value", streetField.input))
      this.verify("input/value", streetField.input)

      const zipField = this.create("field/text", funnel)
      if (input.zip) zipField.input.value = input.zip
      zipField.label.textContent = "Postleitzahl und Ort"
      zipField.input.placeholder = "70184 Stuttgart"
      zipField.input.setAttribute("required", "true")
      zipField.input.maxLength = "55"
      zipField.input.addEventListener("input", () => this.verify("input/value", zipField.input))
      this.verify("input/value", zipField.input)

      const stateField = this.create("field/select", funnel)
      stateField.label.textContent = "Bundesland oder Kanton"

      const countryField = this.create("field/select", funnel)
      countryField.label.textContent = "Land"
      countryField.input.add(["Deutschland", "Österreich", "Schweiz"])
      if (input.country) countryField.input.select([input.country])
      if (countryField.input.value === "Deutschland") stateField.input.add(["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"])
      if (countryField.input.value === "Österreich") stateField.input.add(["Burgenland", "Kärnten", "Niederösterreich", "Oberösterreich", "Salzburg", "Steiermark", "Tirol", "Vorarlberg", "Wien"])
      if (countryField.input.value === "Schweiz") stateField.input.add(["Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Land", "Basel-Stadt", "Bern", "Fribourg Freiburg", "Genève Geneva", "Glarus", "Graubünden Grischuns Grigioni", "Jura", "Luzern Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "St.Gallen", "Schaffhausen", "Schwyz", "Solothurn", "Thurgau", "Ticino", "Uri", "Vaud", "Valais Wallis", "Zug", "Zürich"])
      if (input.state) stateField.input.select([input.state])
      countryField.input.addEventListener("input", () => {

        if (countryField.input.value === "Deutschland") stateField.input.add(["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"])
        if (countryField.input.value === "Österreich") stateField.input.add(["Burgenland", "Kärnten", "Niederösterreich", "Oberösterreich", "Salzburg", "Steiermark", "Tirol", "Vorarlberg", "Wien"])
        if (countryField.input.value === "Schweiz") stateField.input.add(["Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Land", "Basel-Stadt", "Bern", "Fribourg Freiburg", "Genève Geneva", "Glarus", "Graubünden Grischuns Grigioni", "Jura", "Luzern Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "St.Gallen", "Schaffhausen", "Schwyz", "Solothurn", "Thurgau", "Ticino", "Uri", "Vaud", "Valais Wallis", "Zug", "Zürich"])

      })
      this.verify("input/value", stateField.input)
      this.verify("input/value", countryField.input)

      const phoneField = this.create("field/tel", funnel)
      if (input.phone) phoneField.input.value = input.phone
      phoneField.label.textContent = "Telefon"
      phoneField.input.setAttribute("required", "true")
      phoneField.input.maxLength = "21"
      phoneField.input.accept = "text/tel"
      phoneField.input.placeholder = "+49.."
      phoneField.input.addEventListener("input", () => this.verify("input/value", phoneField.input))
      this.verify("input/value", phoneField.input)

      const submit = this.create("button/action", funnel)
      submit.textContent = "Besitzerdaten jetzt speichern"
      submit.addEventListener("click", async () => {

        await this.verify("field-funnel", funnel)

        this.overlay("security", async securityOverlay => {

          const map = {}
          map.firstname = firstnameField.input.value
          map.lastname = lastnameField.input.value
          map.street = streetField.input.value
          map.zip = zipField.input.value
          map.country = countryField.input.value
          map.state = stateField.input.value
          map.phone = phoneField.input.value
          const res = await this.request("/register/owner/closed/", map)

          if (res.status === 200) {
            window.alert("Besitzerdaten erfolgreich gespeichert.")
            securityOverlay.remove()
            parent.remove()
          }

          if (res.status !== 200) {
            window.alert("Fehler.. Bitte wiederholen.")
            securityOverlay.remove()
          }


        })

      })

    }

    if (event === "image/node/src") {
      const image = this.create("div/image", input)
      parent?.appendChild(image)
      return image
    }

    if (event === "full-cite/node/mla") {
      let authorStr = input.authors.join(", ")
      let publisherStr = input.publisher[0]
      if (input.publisher.length > 1) {
        publisherStr = `${input.publisher[0]} et al.`
      }
      const cite = document.createElement("div")
      cite.className = "full cite"
      cite.style.fontFamily = "sans-serif"
      cite.style.margin = "21px 34px"
      input.title = input.title.slice(0, -7)
      cite.textContent = `${authorStr}, ${input.title}, ${publisherStr}, (${this.convert("millis/yyyy", input.published)})`
      const citationCounter = document.querySelectorAll(".cite").length
      cite.setAttribute("citation-counter", citationCounter + 1)
      parent?.append(cite)
      return cite

    }

    if (event === "inline-cite/node/mla") {

      let author = input.authors[0]
      if (input.authors.length > 1) {
        author += " et al."
      }
      const cite = document.createElement("span")
      cite.className = "inline cite"
      cite.style.fontFamily = "sans-serif"
      cite.style.margin = "0 5px"
      cite.textContent = `(${author} ${this.convert("millis/yyyy", input.published)})`
      const citationCounter = document.querySelectorAll(".cite").length
      cite.setAttribute("citation-counter", citationCounter + 1)
      parent?.append(cite)
      return cite

    }

    if (event === "object-node") {

      function getNodeWithClass(name, node) {
        if (node.classList && node.classList.contains(name)) {
          return node
        }
        for (let i = 0; i < node.children.length; i++) {
          const result = getNodeWithClass(name, node.children[i])
          if (result) {
            return result
          }
        }
        return null
      }

      function renderObjectInNode(object, node) {
        Object.entries(object).forEach(([key, value]) => {
          for (let i = 0; i < node.querySelectorAll("*").length; i++) {
            const child = node.querySelectorAll("*")[i]

            if (key === "website") {
              const websiteNode = getNodeWithClass(key, node)
              if (websiteNode) {
                websiteNode.style.cursor = "pointer"
                websiteNode.onclick = () => window.open(value, "_blank")
                Helper.add("outline-hover", websiteNode)
              }
            }

            if (key === "logo" || key === "image") {
              const imageNode = getNodeWithClass(key, node)
              if (imageNode) {
                imageNode.src = "#"
                imageNode.dataset.src = value
                imageNode.loading = "lazy"
                Helper.add("lazy-loading", imageNode)
                imageNode.onerror = () => imageNode.src = "/public/image.svg"
              }
            }

            if (key === "name") {
              const nameNode = getNodeWithClass(key, node)
              if (nameNode) {
                nameNode.textContent = value
              }
            }
          }
        })
      }
      renderObjectInNode(input, parent)
      Object.entries(input).forEach(([key, value]) => {
        renderObjectInNode(value, parent)
      })
      return parent

    }

    if (event === "user-keys/update-buttons") {


      parent.textContent = ""
      for (let i = 0; i < input.keys.length; i++) {
        const key = input.keys[i]

        const keysButton = this.create("button/left-right", parent)
        keysButton.left.textContent = `.${key}`

        keysButton.onclick = () => {
          this.overlay("popup", overlay => {

            const info = this.create("header/info", overlay)
            info.textContent = input.user.email
            info.append(this.convert("text/span", `/keys/${key}`))

            const content = this.create("div/scrollable", overlay)

            {

              const button = this.create("button/left-right", content)
              button.left.textContent = ".body"
              button.right.textContent = "Datensatz Inhalt"
              button.onclick = () => {


                this.overlay("popup", async overlay => {

                  const info = this.create("header/info", overlay)
                  info.textContent = input.user.email
                  info.append(this.convert("text/span", `/keys/${key}/body`))

                  const content = this.create("info/loading", overlay)

                  const res = await this.request("/get/user/key-admin/", {id: input.user.id, key})

                  if (res.status === 200) {

                    let body
                    try {
                      body = JSON.parse(res.response)
                    } catch (error) {
                      body = res.response
                    }



                    if (typeof body === "number") {

                      this.convert("parent/scrollable", content)

                      const numberField = this.create("field/tel", content)
                      numberField.label.textContent = "Dieser Datensatz enthält eine Nummer"
                      numberField.input.style.fontFamily = "monospace"
                      numberField.input.style.fontSize = "13px"
                      numberField.input.setAttribute("required", "true")
                      numberField.input.setAttribute("accept", "text/number")
                      numberField.input.value = body
                      this.verify("input/value", numberField.input)
                      numberField.oninput = () => this.verify("input/value", numberField.input)

                      const submit = this.create("button/action", content)
                      submit.textContent = "Zeichenkette jetzt speichern"
                      submit.onclick = async () => {

                        await this.verify("input/value", numberField.input)

                        const number = numberField.input.value

                        this.overlay("security", async securityOverlay => {

                          const res = await this.request("/update/user/number-tree-admin/", {number, id: input.user.id, tree: key})

                          if (res.status === 200) {
                            window.alert("Datensatz erfolgreich gespeichert.")
                            overlay.remove()
                            securityOverlay.remove()
                          }

                          if (res.status !== 200) {
                            window.alert("Fehler.. Bitte wiederholen.")
                            securityOverlay.remove()
                          }

                        })


                      }
                    }

                    if (typeof body === "string") {

                      this.convert("parent/scrollable", content)

                      const textField = this.create("field/textarea", content)
                      textField.label.textContent = "Dieser Datensatz enthält eine Zeichenkette"
                      textField.input.style.height = "55vh"
                      textField.input.style.fontFamily = "monospace"
                      textField.input.style.fontSize = "13px"
                      textField.input.value = body
                      this.verify("input/value", textField.input)

                      const submit = this.create("button/action", content)
                      submit.textContent = "Zeichenkette jetzt speichern"
                      submit.onclick = () => {

                        const text = textField.input.value

                        this.overlay("security", async securityOverlay => {

                          const res = await this.request("/update/user/text-tree-admin/", {text, id: input.user.id, tree: key})
                          if (res.status === 200) {
                            window.alert("Datensatz erfolgreich gespeichert.")
                            overlay.remove()
                            securityOverlay.remove()
                          }

                          if (res.status !== 200) {
                            window.alert("Fehler.. Bitte wiederholen.")
                            securityOverlay.remove()
                          }

                        })


                      }
                    }

                    if (typeof body === "object") {

                      this.convert("parent/scrollable", content)

                      const keys = []
                      for (let i = 0; i < Object.keys(body).length; i++) {
                        const item = Object.keys(body)[i]
                        keys.push(`${key}.${item}`)
                      }

                      this.render(event, {user: input.user, keys}, content)

                    }

                  }

                  if (res.status !== 200) {
                    this.convert("parent/info", content)
                    content.textContent = "Dieser Datensatz ist leer."
                  }

                })




              }

            }

            {

              const button = this.create("button/left-right", content)
              button.left.textContent = ".key"
              button.right.textContent = "Schlüssel Name ändern"
              button.onclick = () => {

                this.overlay("popup", async keyOverlay => {

                  const info = this.create("header/info", keyOverlay)
                  info.textContent = input.user.email
                  info.append(this.convert("text/span", `/${key}`))

                  const content = this.create("div/scrollable", keyOverlay)

                  const textField = this.create("field/text", content)
                  textField.label.textContent = "Schlüssel Name"
                  textField.input.style.fontFamily = "monospace"
                  textField.input.style.fontSize = "13px"
                  textField.input.setAttribute("required", "true")
                  textField.input.setAttribute("accept", "text/tag")
                  textField.input.value = key.split(".")[key.split(".").length - 1]
                  this.verify("input/value", textField.input)

                  const submit = this.create("button/action", content)
                  submit.textContent = "Name jetzt speichern"
                  submit.onclick = async () => {

                    await this.verify("input/value", textField.input)

                    this.overlay("security", async securityOverlay => {

                      const res = await this.request("/update/user/key-name-tree-admin/", {name: textField.input.value, id: input.user.id, tree: key})

                      if (res.status === 200) {
                        window.alert("Datensatz erfolgreich gespeichert.")
                        overlay.previousSibling.remove()
                        overlay.remove()
                        keyOverlay.remove()
                        securityOverlay.remove()
                      }

                      if (res.status !== 200) {
                        window.alert("Fehler.. Bitte wiederholen.")
                        securityOverlay.remove()
                      }

                    })


                  }

                })

              }

            }

            {

              const button = this.create("button/left-right", content)
              button.left.textContent = ".delete"
              button.right.textContent = "Datensatz entfernen"

              button.onclick = () => {

                const confirm = window.confirm("Du bist gerade dabei einen Datensatz aus der persönlichen Datenbank des Nuzters zu löschen. Diese Daten werden gelöscht und können nicht mehr wiederhergestellt werden.\n\nMöchtest du diesen Datensatz wirklich löschen?")
                if (confirm === true) {

                  this.overlay("security", async securityOverlay => {

                    const res = await this.request("/remove/user/tree-admin/", {tree: key, id: input.user.id})
                    if (res.status === 200) {
                      alert("Datensatz erfolgreich gelöscht.")
                      keysButton.remove()
                      overlay.remove()
                      securityOverlay.remove()
                    } else {
                      alert("Fehler.. Bitte wiederholen.")
                      overlay.remove()
                      securityOverlay.remove()
                    }

                  })

                }

              }

            }


          })
        }

      }



    }

    if (event === "role/role-apps-button-onbody") {

      const button = this.create("button/left-right")
      button.classList.add("role-button")
      button.left.textContent = input.name
      button.left.classList.add("left")
      button.right.textContent = "Rolle"
      button.right.classList.add("right")
      button.onclick = () => {

        parent.querySelectorAll(".role-button").forEach(button => {

          const right = button.querySelector(".right")
          this.convert("element/button-right", right)
          right.textContent = "Rolle"

        })

        this.convert("element/checked", button.right)

        this.create("button/role-apps", document.body)

        this.render("script/role-apps-event", input, document.body)

      }

      if (parent) parent.append(button)
      return button

    }

    if (event === "roles/toolbox-access") {

      const renderRoleButtons = (roles, child, node) => {
        this.convert("parent/scrollable", node)
        for (let i = 0; i < roles.length; i++) {
          const role = roles[i]
          const button = this.create("button/left-right", node)
          button.left.textContent = role.name
          button.right.textContent = `Rolle ${i + 1}`
          this.add("outline-hover", button)
          button.onclick = () => {
            this.create("field-funnel/login", child)
            const script = this.create("script", {id: "role-login", js: `Helper.add("role-login", {"id":${role.created},"name":"${role.name}"})`})
            this.add("script-onbody", script)
            window.alert("Zugang wurde erfolgreich angehängt.")
          }
        }
      }
      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/get/platform/roles-location-expert/")
          if (res.status === 200) {
            const roles = JSON.parse(res.response)
            renderRoleButtons(roles, input, parent)
          } else {
            const res = await this.request("/get/platform/roles-location-writable/")
            if (res.status === 200) {
              const roles = JSON.parse(res.response)
              renderRoleButtons(roles, input, parent)
            } else {
              this.convert("parent/info", parent)
              content.textContent = "Es wurden keine Rollen gefunden."
            }
          }
        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "script/role-apps-event") {

      if (input !== undefined) {

        const text = /*html*/`
        <script id="role-apps-event" type="module">
          import {Helper} from "/js/Helper.js"

          await Helper.add("event/role-apps", {id: ${input.id}, tag: "${input.name}"})
        </script>
        `

        const script = this.convert("text/first-child", text)

        const create = document.createElement("script")
        create.id = script.id
        create.type = script.type
        create.textContent = script.textContent

        if (parent !== undefined) {

          if (parent.querySelector(`#${create.id}`) !== null) {
            parent.querySelector(`#${create.id}`).remove()
          }

          if (parent.querySelector(`#${create.id}`) === null) {
            parent.append(create)
          }

        }

        return create
      }

    }

    if (event === "match-maker/buttons") {

      parent.textContent = ""
      for (let i = 0; i < input.length; i++) {
        const matchMaker = input[i]

        const button = this.create("button/left-right", parent)
        button.right.textContent = matchMaker.id
        button.left.textContent = matchMaker.name

        button.onclick = () => {

          this.overlay("toolbox", async overlay => {
            overlay.info.textContent = `.match-maker.${matchMaker.name}`

            {
              const button = this.create("button/left-right", overlay)
              button.left.textContent = ".action"
              button.right.textContent = "Optimiere deinen Match Maker"

              button.onclick = () => {
                this.overlay("toolbox", overlay => {
                  overlay.info.textContent = `.${matchMaker.name}.action`

                  const content = this.create("div/scrollable", overlay)
                  const actionField = this.create("field/select", content)
                  actionField.label.textContent = "Wenn alle Bedingungen erfüllt sind dann .."
                  actionField.input.add(["get users", "remove", "show", "onclick", "onload", "get list", "get keys"])
                  this.verify("input/value", actionField.input)

                  const dataMirrorField = this.create("field/trees", content)
                  dataMirrorField.label.textContent = "Gebe eine JavaScript Liste mit Datenstrukturen ein und spiegel deine Nutzerliste mit den angefragten Daten"
                  dataMirrorField.input.style.fontSize = "13px"
                  dataMirrorField.input.placeholder = `["getyour.expert.name", "getyour.funnel.name"]`
                  dataMirrorField.input.oninput = () => this.verify("input/value", dataMirrorField.input)
                  this.verify("input/value", dataMirrorField.input)

                  const jsField = this.create("field/js")
                  jsField.label.textContent = "JavaScript Browser Funktionen + Plattform Helper Funktionen (javascript)"
                  jsField.input.oninput = () => this.verify("input/value", jsField.input)

                  const treeField = this.create("field/tree")
                  treeField.input.placeholder = "getyour.expert.platforms"
                  treeField.label.textContent = "Welche Liste möchtest du anzeigen lassen (text/tree)"
                  treeField.input.oninput = () => this.verify("input/value", treeField.input)


                  actionField.input.oninput = (event) => {
                    const selected = this.convert("select/selected", event.target)

                    dataMirrorField.remove()
                    jsField.remove()
                    treeField.remove()


                    if (selected === "get users") {
                      actionField.after(dataMirrorField)
                      this.verify("input/value", dataMirrorField.input)
                    }

                    if (selected === "onclick") {
                      actionField.after(jsField)
                      this.verify("input/value", jsField.input)
                    }

                    if (selected === "onload") {
                      actionField.after(jsField)
                      this.verify("input/value", jsField.input)
                    }

                    if (selected === "get keys") {
                      actionField.after(dataMirrorField)
                      this.verify("input/value", dataMirrorField.input)
                    }

                    if (selected === "get list") {
                      actionField.after(treeField)
                      this.verify("input/value", treeField.input)
                    }
                  }


                  const submit = this.create("button/action", content)
                  submit.textContent = "Match Maker jetzt anhängen"
                  submit.onclick = async () => {

                    const selected = this.convert("select/selected", actionField.input)

                    if (selected === "onload") {

                      await this.verify("input/value", jsField.input)

                      const map = {}
                      map.name = matchMaker.name
                      map.conditions = conditions
                      map.js = jsField.input.value

                      const onloadScript = this.create("script/match-maker-onload", map)

                      this.add("script-onbody", onloadScript)

                    }

                    if (selected === "onclick") {

                      await this.verify("input/value", jsField.input)

                      const map = {}
                      map.name = matchMaker.name
                      map.conditions = conditions
                      map.js = jsField.input.value

                      const onclickScript = this.create("script/match-maker-onclick", map)

                      this.add("script-onbody", onclickScript)

                    }


                    if (selected === "show") {

                      const map = {}
                      map.name = matchMaker.name
                      map.conditions = conditions

                      const showScript = this.create("script/match-maker-show", map)

                      this.add("script-onbody", showScript)

                    }

                    if (selected === "remove") {

                      const map = {}
                      map.name = matchMaker.name
                      map.conditions = conditions

                      const removeScript = this.create("script/match-maker-remove", map)

                      this.add("script-onbody", removeScript)

                    }

                    if (selected === "get list") {

                      await this.verify("input/value", treeField.input)

                      const map = {}
                      map.name = matchMaker.name
                      map.conditions = conditions
                      map.tree = treeField.input.value

                      const getterScript = this.create("script/match-maker-get-list", map)

                      this.add("script-onbody", getterScript)

                    }

                    if (selected === "get keys") {

                      await this.verify("input/value", dataMirrorField.input)

                      const map = {}
                      map.name = matchMaker.name
                      map.conditions = conditions

                      try {
                        map.mirror = JSON.parse(dataMirrorField.input.value)
                        if (map.mirror.length === 0) throw new Error("mirror is empty")
                      } catch (error) {
                        this.add("style/node/not-valid", dataMirrorField.input)
                        throw error
                      }

                      const getterScript = this.create("script/match-maker-get-keys", map)

                      this.add("script-onbody", getterScript)

                    }

                    if (selected === "get users") {

                      await this.verify("input/value", dataMirrorField.input)

                      const map = {}
                      map.name = matchMaker.name
                      map.conditions = conditions

                      try {
                        map.mirror = JSON.parse(dataMirrorField.input.value)
                        if (map.mirror.length === 0) throw new Error("mirror is empty")
                      } catch (error) {
                        this.add("style/node/not-valid", dataMirrorField.input)
                        throw error
                      }

                      const getterScript = this.create("script/match-maker-get-users", map)

                      this.add("script-onbody", getterScript)

                    }

                    window.alert("Skript wurde erfolgreich angehängt.")

                  }

                })
              }


            }

            const conditionsContainer = this.create("info/loading", overlay)

            const res = await this.request("/get/match-maker/conditions-expert/", {id: matchMaker.created})

            let conditions
            if (res.status === 200) {
              conditions = JSON.parse(res.response)

              this.convert("element/reset", conditionsContainer)
              this.render("text/hr", `Bedingungen von ${matchMaker.name}`, conditionsContainer)
              for (let i = 0; i < conditions.length; i++) {
                const condition = conditions[i]
                this.render("text/code", `(${condition.left} ${condition.operator} ${condition.right})`, conditionsContainer)
              }

            }

            if (res.status !== 200) {
              const res = await this.request("/get/match-maker/conditions-writable/", {id: matchMaker.id})

              if (res.status === 200) {
                conditions = JSON.parse(res.response)

                this.convert("element/reset", conditionsContainer)
                this.render("text/hr", `Bedingungen von ${matchMaker.name}`, conditionsContainer)
                for (let i = 0; i < conditions.length; i++) {
                  const condition = conditions[i]
                  this.render("text/code", `(${condition.left} ${condition.operator} ${condition.right})`, conditionsContainer)
                }

              }

              if (res.status !== 200) {
                this.convert("parent/info", conditionsContainer)
                conditionsContainer.textContent = "Keine Bedingungen definiert."
                throw new Error("conditions not found")
              }
            }




          })

        }


      }

    }

    if (event === "match-maker/conditions-expert") {

      return new Promise(async(resolve, reject) => {
        try {
          this.convert("element/reset", parent)
          const res = await this.request("/get/match-maker/conditions-expert/", {id: input})
          if (res.status === 200) {
            const array = JSON.parse(res.response)
            for (let i = 0; i < array.length; i++) {
              const condition = array[i]
              const conditionButton = this.create("button/left-right", parent)
              conditionButton.left.textContent = `condition-${array.length - i}`
              conditionButton.right.textContent = condition.created
              conditionButton.onclick = () => {
                this.overlay("popup", buttonsOverlay => {
                  buttonsOverlay.info.textContent = `.condition.${condition.created}`
                  const buttons = this.create("div/scrollable", buttonsOverlay)
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".update"
                    button.right.textContent = "Bedingungen ändern"
                    button.onclick = () => {
                      this.overlay("popup", async overlay => {
                        overlay.info.textContent = `.update.${condition.created}`
                        const funnel = this.create("funnel/condition", overlay)
                        funnel.leftField.input.value = condition.left
                        funnel.operatorField.input.value = condition.operator
                        funnel.rightField.input.value = condition.right
                        this.verifyIs("field-funnel/valid", funnel)
                        funnel.submit.onclick = async () => {
                          await this.verify("field-funnel", funnel)
                          this.overlay("security", async securityOverlay => {
                            const res = await this.request("/update/match-maker/condition/", {id: condition.created, left: funnel.leftField.input.value, operator: funnel.operatorField.input.value, right: funnel.rightField.input.value})
                            if (res.status === 200) {
                              window.alert("Bedingung erfolgreich gespeichert.")
                              await this.render(event, input, parent)
                              buttonsOverlay.remove()
                              overlay.remove()
                              securityOverlay.remove()
                            } else {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }
                          })
                        }
                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".delete"
                    button.right.textContent = "Bedingung entfernen"
                    button.onclick = () => {
                      this.overlay("security", async securityOverlay => {
                        const res = await this.request("/remove/match-maker/condition/", {id: condition.created})
                        if (res.status === 200) {
                          window.alert("Bedingung erfolgreich entfernt.")
                          await this.render(event, input, parent)
                          buttonsOverlay.remove()
                          securityOverlay.remove()
                        }
                        if (res.status !== 200) {
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }
                      })
                    }
                  }
                })
              }
            }
          } else {
            this.convert("parent/info", parent)
            parent.textContent = "Keine Bedingungen gefunden"
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "match-maker/expert") {

      return new Promise(async(resolve, reject) => {
        try {
          this.convert("element/reset", parent)
          const res = await this.request("/get/match-maker/expert-self/", {platform: input})
          if (res.status === 200) {
            const array = JSON.parse(res.response)
            for (let i = 0; i < array.length; i++) {
              const matchMaker = array[i]
              const matchMakerButton = this.create("button/left-right", parent)
              matchMakerButton.right.textContent = `match-maker-${array.length - i}`
              matchMakerButton.left.textContent = matchMaker.name
              matchMakerButton.onclick = () => {
                this.overlay("popup", overlay => {
                  overlay.info.textContent = `.${matchMaker.name}`
                  const buttons = this.create("div/scrollable", overlay)
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".conditions"
                    button.right.textContent = "Bedingungen hinzufügen"
                    button.onclick = () => {
                      this.overlay("popup", async overlay => {
                        overlay.info.textContent = `.conditions`
                        const create = this.create("button/left-right", overlay)
                        create.left.textContent = ".create"
                        create.right.textContent = "Neue Bedingung definieren"
                        create.onclick = () => {
                          this.overlay("popup", async overlay => {
                            overlay.info.textContent = ".condition"
                            const funnel = this.create("funnel/condition", overlay)
                            funnel.submit.onclick = async () => {
                              await this.verify("field-funnel", funnel)
                              this.overlay("security", async securityOverlay => {
                                const res = await this.request("/register/match-maker/condition/", {id: matchMaker.created, left: funnel.leftField.input.value, operator: funnel.operatorField.input.value, right: funnel.rightField.input.value})
                                if (res.status === 200) {
                                  window.alert("Deine Bedingung wurde erfolgreich gespeichert.")
                                  await this.render("match-maker/conditions-expert",  matchMaker.created, conditionsContainer)
                                  overlay.remove()
                                  securityOverlay.remove()
                                } else {
                                  window.alert("Fehler.. Bitte wiederholen.")
                                  securityOverlay.remove()
                                }
                              })
                            }
                          })
                        }
                        this.render("text/hr", "Meine Bedingungen", overlay)
                        const conditionsContainer = this.create("div/scrollable", overlay)
                        await this.render("match-maker/conditions-expert",  matchMaker.created, conditionsContainer)
                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".delete"
                    button.right.textContent = "Match Maker entfernen"
                    button.onclick = () => {
                      this.overlay("security", async securityOverlay => {
                        const res = await this.request("/remove/match-maker/expert/", {id: matchMaker.created})
                        if (res.status === 200) {
                          window.alert("Match Maker erfolgreich entfernt.")
                          matchMakerButton.remove()
                          overlay.remove()
                          securityOverlay.remove()
                        } else {
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }
                      })
                    }
                  }
                })
              }
            }
          } else {
            this.convert("parent/info", parent)
            parent.textContent = "Keine Match Maker gefunden"
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "value/input") {

      if (parent.tagName === "INPUT") {

        if (parent.type === "text") {
          parent.value = input
        }

        if (parent.type === "email") {
          parent.value = input
        }

        if (parent.type === "tel") {
          parent.value = input
        }

        if (parent.type === "range") {
          parent.value = input
        }

        if (parent.type === "password") {
          parent.value = input
        }

        if (parent.type === "number") {
          parent.value = input
        }

        if (parent.type === "date") {
          parent.value = input
        }

        if (parent.type === "checkbox") {
          parent.checked = input
        }

      }

      if (parent.tagName === "TEXTAREA") {
        parent.value = input
      }

      if (parent.tagName === "SELECT") {
        for (let i = 0; i < input.length; i++) {
          const text = input[i]

          for (let i = 0; i < parent.options.length; i++) {
            const option = parent.options[i]

            if (option.value === text) option.selected = true
          }

        }
      }

    }

    if (event === "mirror/match-maker-get-keys") {

      return new Promise(async(resolve, reject) => {

        try {

          document.querySelectorAll(`[match-maker="${parent}"]`).forEach(matchMaker => {

            Object.entries(input).forEach(([key, value]) => {
              matchMaker.querySelectorAll(`.${key}`).forEach(element => {

                if (element.classList.contains(key)) {
                  element.textContent = value
                }

              })

            })

          })

          resolve()

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "mirror/match-maker-get-list") {

      return new Promise(async(resolve, reject) => {

        try {

          const map = {}
          map.list = input
          map.name = parent
          const mirror = await this.create("div/match-maker-list", map)

          // add events to the mirror
          for (let i = 0; i < mirror.children.length; i++) {
            const child = mirror.children[i]

            // default events
            const quantityInput = child.querySelector("input.quantity")
            this.add("oninput/verify-positive-integer", quantityInput)

            // search and find events
            child.querySelectorAll("*").forEach(element => {

              if (element.hasAttribute("write-details")) {

                const funnel = input.filter(it => `${it.id}` === child.id)[0].funnel

                this.render("object/node/write-details", funnel, element)

              }

              if (element.hasAttribute("popup-details")) {

                const design = document.querySelector(`[popup-details-design="${parent}"]`)
                if (design !== null) design.style.display = "none"

                element.style.cursor = "pointer"
                element.onclick = () => {

                  const funnel = input.filter(it => `${it.id}` === child.id)[0].funnel

                  if (design === null) {

                    this.overlay("toolbox", overlay => {

                      this.removeOverlayButton(overlay)

                      this.render("text/title", "Detailansicht", overlay)

                      const content = this.create("div/scrollable", overlay)
                      content.style.display = "grid"
                      content.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))"
                      content.style.gap = "21px"
                      content.style.margin = "21px 34px"

                      Object.entries(funnel).forEach(([key, value]) => {

                        const keyValuePair = document.createElement("div")
                        keyValuePair.classList.add("key-value-pair")

                        keyValuePair.style.backgroundColor = this.colors.gray[0]
                        keyValuePair.style.border = this.colors.light.border
                        keyValuePair.style.color = this.colors.light.text
                        keyValuePair.style.boxShadow = this.colors.light.boxShadow
                        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                          keyValuePair.style.backgroundColor = this.colors.matte.black
                          keyValuePair.style.border = this.colors.dark.border
                          keyValuePair.style.boxShadow = this.colors.dark.boxShadow
                          keyValuePair.style.color = this.colors.dark.text
                        }
                        keyValuePair.style.display = "flex"
                        keyValuePair.style.flexDirection = "column"
                        keyValuePair.style.padding = "1rem"
                        keyValuePair.style.borderRadius = "5px"
                        content.append(keyValuePair)

                        const keyDiv = document.createElement("key")
                        keyDiv.classList.add("key")
                        keyDiv.style.fontWeight = "bold"
                        keyDiv.style.marginBottom = "0.5rem"
                        keyDiv.textContent = key
                        keyDiv.style.color = this.colors.key
                        keyValuePair.append(keyDiv)

                        const valueDiv = document.createElement("div")
                        valueDiv.textContent = value
                        valueDiv.classList.add("value")
                        valueDiv.style.color = this.colors.value
                        keyValuePair.append(valueDiv)


                      })


                    })

                  }

                  if (design !== null) {

                    this.overlay("popup", overlay => {

                      this.removeOverlayButton(overlay)

                      const content = this.create("div/scrollable", overlay)

                      const clone = design.cloneNode(true)

                      clone.style.display = null

                      content.append(clone)

                      Object.entries(funnel).forEach(([key, value]) => {
                        content.querySelectorAll(`.${key}`).forEach(element => {

                          if (element.tagName === "IMG") {
                            element.src = value
                          } else {
                            element.textContent = value
                          }

                        })

                      })


                    })

                  }

                }

              }

              if (element.hasAttribute("add-to-cart")) {

                element.style.cursor = "pointer"
                element.onclick = () => {

                  const quantityInput = child.querySelector("input.quantity")

                  const quantity = quantityInput.value

                  if (this.verifyIs("text/+int", quantity)) {

                    this.add("style/node/valid", quantityInput)

                  } else {
                    this.add("style/node/not-valid", quantityInput)
                  }


                }

              }

            })
          }

          resolve(mirror)

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "mirror/match-maker-get-users") {

      return new Promise(async(resolve, reject) => {

        try {

          const sortedUsers = input
          sortedUsers.sort((a, b) => {
            return b.reputation - a.reputation // Descending order, for ascending use: a.reputation - b.reputation
          })

          const userList = this.create("div/scrollable")
          userList.setAttribute("id", `user-list-${parent}`)

          document.querySelectorAll(`[match-maker="${parent}"]`).forEach(matchMaker => {

            for (let i = 0; i < sortedUsers.length; i++) {
              const user = sortedUsers[i]

              const clone = document.createElement("div")
              clone.textContent = matchMaker.textContent
              clone.setAttribute("id", `user-${i + 1}`)
              clone.style.marginBottom = "34px"

              for (let i = 0; i < user.treeValues.length; i++) {
                const treeValuePair = user.treeValues[i]

                const className = treeValuePair.tree.replace(/\./g, "-")

                for (let i = 0; i < clone.children.length; i++) {
                  const child = clone.children[i]
                  if (child.classList.contains(className)) {
                    child.textContent = treeValuePair.value
                  }
                }

              }

              userList.append(clone)

            }

            const userLists = document.querySelectorAll(`#user-list-${parent}`)

            if (userLists.length === 0) {
              matchMaker.before(userList)
              matchMaker.style.display = "none"
            }

            userLists.forEach(list => {
              this.convert("parent/scrollable", list)
              list.textContent = userList.textContent
              matchMaker.style.display = "none"
            })


          })

          resolve(userList)

        } catch (error) {
          reject(error)
        }

      })





    }

    if (event === "object/node/svg") {
      const object = document.createElement("object")
      object.type = "image/svg+xml"
      object.data = input
      parent?.appendChild(object)
      return object
    }

    if (event === "id-map/field-funnel") {

      return new Promise(async(resolve, reject) => {

        try {

          Object.entries(input).forEach(([key, value]) => {
            parent.querySelectorAll(`#${key}`).forEach(async field => {

              const input = field.querySelector(".field-input")

              this.render("value/input", value, input)

            })

          })

          this.verifyIs("field-funnel/valid", parent)

          resolve()

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "tree-map/field-funnel") {

      return new Promise(async(resolve, reject) => {

        try {

          Object.entries(input).forEach(([key, value]) => {
            const fieldId = key.split(".")[2]
            parent.querySelectorAll(`#${fieldId}`).forEach(async field => {

              const input = field.querySelector(".field-input")

              this.render("value/input", value, input)

            })

          })

          this.verifyIs("field-funnel/valid", parent)

          resolve()

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "map/div") {

      return new Promise(async(resolve, reject) => {

        const div = this.create("div", parent)
        div.classList.add("json")
        div.style.margin = "21px 34px"

        const buttons = document.createElement("div")
        buttons.classList.add("buttons")
        buttons.style.display = "flex"
        buttons.style.justifyContent = "space-between"
        buttons.style.alignItems = "center"
        div.append(buttons)

        const foldAllButton = this.create("div/action", buttons)
        foldAllButton.textContent = "fold"

        foldAllButton.addEventListener("click", function() {
          toggleAllValues("none");
        });

        const unfoldAllButton = this.create("div/action", buttons)
        unfoldAllButton.textContent = "unfold"
        unfoldAllButton.addEventListener("click", function() {
          toggleAllValues("block");
        });

        function toggleAllValues(displayValue) {
          const valueElements = div.querySelectorAll(".key-value");
          valueElements.forEach(element => {
            element.style.display = displayValue;
          });
        }

        function toggleValue(event) {
          const element = event.target.nextSibling
          if (element !== null) {
            element.style.display = element.style.display === "none" ? "block" : "none";
          }
        }

        function processObject(container, obj) {
          for (const key in obj) {
            const value = obj[key];

            const keyElement = Helper.convert("key/div", key)
            const valueElement = Helper.convert("value/div", value)


            if (Helper.verifyIs("string", value)) {
              valueElement.setAttribute("value-type", "string")
            }


            if (Helper.verifyIs("boolean", value)) {
              valueElement.setAttribute("value-type", "boolean")
            }

            const keyName = document.createElement("div")
            keyName.classList.add("key-name")
            keyName.textContent = key

            keyElement.appendChild(keyName)
            container.appendChild(keyElement);
            keyElement.appendChild(valueElement);

            keyElement.addEventListener("click", toggleValue);

            if (typeof value === "object") {
              processObject(valueElement, value);
              valueElement.addEventListener("click", toggleValue);

            } else {
              valueElement.textContent = JSON.stringify(value);
            }
          }
        }


        try {

          processObject(div, input);

          return resolve(div)
        } catch (error) {
          await this.add("ms/timeout", 3000)
          await this.render(event, input, parent)
        }

      })


    }

    if (event === "nav/open") {

      this.create("start-button", input)
      {
        const button = this.create("button/left-right", input)
        button.left.textContent = ".login"
        button.right.textContent = "Dein Zugang zur personalisierten Erfahrung"
        button.addEventListener("click", () => window.location.assign("/login/"))
      }
      {
        const button = this.create("button/left-right", input)
        button.left.textContent = ".user-agreement"
        button.right.textContent = "Für Klarheit und Fairness im Umgang miteinander"
        button.addEventListener("click", () => window.location.assign("/nutzervereinbarung/"))
      }
      {
        const button = this.create("button/left-right", input)
        button.left.textContent = ".data-protection"
        button.right.textContent = "Fördert Vertrauen in digitale Interaktionen"
        button.addEventListener("click", () => window.location.assign("/datenschutz/"))
      }
    }

    if (event === "script-onbody") {

      return new Promise(async resolve => {

        if (document.body) {
          document.querySelectorAll(`#${input.id}`).forEach(script => script.remove())
          if (document.getElementById(`#${input.id}`) === null) {
            document.body.append(input)
            return resolve(input)
          }
        } else {
          await this.add("ms/timeout", 3000)
          await this.add(event, input)
        }


      })

    }

    if (event === "checklist/items") {
      const checklist = this.create("div/scrollable", parent)
      checklist.id = "checklist"

      for (let i = 0; i < input.length; i++) {
        const item = input[i]

        item.index = i + 1
        this.render("checklist/item", item, checklist)

      }


      return checklist
    }

    if (event === "checklist/item") {

      const item = document.createElement("div")
      item.classList.add("item")
      item.style.margin = "34px"

      item.header = document.createElement("div")
      item.header.classList.add("header")
      item.header.style.display = "flex"
      item.header.style.borderTopRightRadius = "21px"
      item.header.style.borderTopLeftRadius = "21px"
      item.header.style.borderBottomLeftRadius = "21px"
      item.header.style.backgroundColor = "#d1d0d0"
      item.append(item.header)

      item.header.state = document.createElement("div")
      item.header.state.classList.add("state")
      item.header.state.style.display = "flex"
      item.header.state.style.justifyContent = "center"
      item.header.state.style.alignItems = "center"
      item.header.state.style.width = "89px"
      item.header.state.style.height = "89px"
      item.header.state.style.backgroundColor = "#c6c6c6"
      item.header.state.style.fontSize = "34px"
      item.header.state.style.borderTopLeftRadius = "21px"
      item.header.state.style.borderBottomLeftRadius = "21px"
      item.header.append(item.header.state)

      item.header.state.index = document.createElement("div")
      item.header.state.index.classList.add("index")
      item.header.state.index.textContent = input.index
      item.header.state.append(item.header.state.index)

      item.header.text = document.createElement("div")
      item.header.text.classList.add("title")
      item.header.text.style.alignSelf = "center"
      item.header.text.style.marginLeft = "13px"
      item.header.text.textContent = input.title
      item.header.text.style.fontSize = "21px"
      item.header.append(item.header.text)

      item.body = document.createElement("div")
      item.body.classList.add("body")
      item.body.style.marginLeft = "8%"
      item.body.style.backgroundColor = "#dbdbdb"
      item.body.style.borderBottomRightRadius = "21px"
      item.body.style.borderBottomLeftRadius = "21px"
      item.body.style.padding = "21px"
      item.body.style.display = "flex"
      item.body.style.flexDirection = "column"
      item.body.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"
      item.append(item.body)

      item.body.text = document.createElement("div")
      item.body.text.classList.add("description")
      item.body.text.textContent = input.description
      item.body.text.style.marginBottom = "34px"
      item.body.append(item.body.text)

      item.body.button = document.createElement("div")
      item.body.button.classList.add("button")
      item.body.button.textContent = "Zur Übersicht"
      item.body.button.style.borderRadius = "13px"
      item.body.button.style.width = "233px"
      item.body.button.style.height = "55px"
      item.body.button.style.display = "flex"
      item.body.button.style.justifyContent = "center"
      item.body.button.style.alignItems = "center"
      item.body.button.style.alignSelf = "flex-end"
      item.body.button.style.backgroundColor = "#f7aa20"
      item.body.button.style.fontSize = "21px"
      item.body.button.style.margin = "8px"
      item.body.button.style.cursor = "pointer"
      item.body.append(item.body.button)

      parent?.append(item)
      return item
    }

    if (event === "scripts/update-buttons") {

      if (arguments.length === 2) {
        parent = input
      }

      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/get/scripts/closed/")
          if (res.status === 200) {
            const scripts = JSON.parse(res.response)
            this.convert("parent/scrollable", parent)
            for (let i = 0; i < scripts.length; i++) {
              const script = scripts[i]
              const scriptButton = this.create("toolbox/left-right", parent)
              scriptButton.right.textContent = script.name
              scriptButton.left.textContent = `Skript ${scripts.length - i}`
              scriptButton.onclick = () => {
                this.overlay("popup", overlay => {
                  overlay.info.textContent = `.${script.name}`
                  const content = this.create("div/scrollable", overlay)
                  {
                    const button = this.create("toolbox/left-right", content)
                    button.left.textContent = ".update"
                    button.right.textContent = "Skript bearbeiten"
                    button.onclick = () => {
                      this.overlay("popup", overlay => {
                        overlay.info.textContent = `.${script.name}.update`
                        const funnel = this.create("div/scrollable", overlay)
                        const nameField = this.create("field/tag", funnel)
                        nameField.input.placeholder = "mein-skript"
                        nameField.input.value = script.name
                        this.verify("input/value", nameField.input)
                        nameField.input.oninput = () => this.verify("input/value", nameField.input)
                        const scriptField = this.create("field/script", funnel)
                        scriptField.input.style.height = "100vh"
                        scriptField.input.value = script.html
                        this.verify("input/value", scriptField.input)
                        scriptField.input.oninput = () => this.verify("input/value", scriptField.input)
                        const button = this.create("toolbox/action", funnel)
                        button.textContent = "Skript jetzt speichern"
                        button.onclick = async () => {
                          await this.verify("field-funnel", funnel)
                          this.overlay("security", async securityOverlay => {
                            const res = await this.request("/update/scripts/closed", {id: script.created, html: scriptField.input.value, name: nameField.input.value})
                            if (res.status === 200) {
                              window.alert("Skript erfolgreich gespeichert.")
                              this.convert("parent/loading", parent)
                              await this.render(event, parent)
                              securityOverlay.remove()
                              overlay.previousSibling.remove()
                              overlay.remove()
                            } else {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }
                          })
                        }
                      })
                    }
                  }
                  {
                    const button = this.create("toolbox/left-right", content)
                    button.left.textContent = ".remove"
                    button.right.textContent = "Skript entfernen"
                    button.onclick = () => {
                      this.overlay("security", async securityOverlay => {
                        const res = await this.request("/remove/scripts/closed/", {id: script.created})
                        if (res.status === 200) {
                          window.alert("Skript erfolgreich entfernt.")
                          scriptButton.remove()
                          securityOverlay.remove()
                          overlay.remove()
                        } else {
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }
                      })
                    }
                  }
                })
              }
            }
          } else {
            this.convert("parent/info", parent)
            parent.textContent = "Keine Skripte gefunden."
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "toolbox-scripts") {

      return new Promise(async(resolve, reject) => {
        try {
          const executeOnceIcon = await this.convert("path/icon", "/public/arrow-repeat-1.svg")
          executeOnceIcon.style.width = "55px"
          const executeAlwaysIcon = await this.convert("path/icon", "/public/arrow-repeat.svg")
          executeAlwaysIcon.style.width = "55px"
          const feedback = this.fn("feedback")
          const feedbackIcon = await feedback.icon()
          const fragment = document.createDocumentFragment()
          this.convert("parent/scrollable", parent)
          for (let i = 0; i < input.length; i++) {
            const script = input[i]
            const scriptButton = this.create("toolbox/left-right", fragment)
            scriptButton.left.textContent = script.name
            if (document.getElementById(script.name) !== null) {
              scriptButton.style.border = `3px solid ${Helper.colors.matte.orange}`
            }
            const buttons = document.createElement("div")
            scriptButton.right.appendChild(buttons)
            buttons.style.display = "flex"
            buttons.style.alignItems = "center"
            buttons.style.justifyContent = "space-around"
            {
              const button = executeOnceIcon.cloneNode(true)
              buttons.appendChild(button)
              this.add("outline-hover", button)
              button.onclick = () => {
                const executer = document.createElement("script")
                const clone = this.convert("text/script", script.html)
                executer.id = script.name
                executer.type = "module"
                executer.textContent = clone.textContent
                document.body.appendChild(executer)
                setTimeout(() => executer.remove(), 34)
              }
            }
            {
              const button = executeAlwaysIcon.cloneNode(true)
              buttons.appendChild(button)
              this.add("outline-hover", button)
              button.onclick = async () => {
                if (document.getElementById(script.name) !== null) {
                  window.alert("Skript existiert bereits.")
                  return
                }
                const clone = this.convert("text/script", script.html)
                const executer = this.create("script", {id: script.name, js: clone.textContent})
                document.body.appendChild(executer)
                updateBorder(scriptButton)
                scriptButton.style.border = `3px solid ${Helper.colors.matte.orange}`
              }
            }
            {
              const button = feedbackIcon.cloneNode(true)
              button.style.position = "relative"
              Helper.create("counter", button)
              feedback.initScriptCounter(script.created, button)
              buttons.appendChild(button)
              this.add("outline-hover", button)
              button.onclick = () => feedback.openScriptOverlay(button, script)
            }
          }
          parent.appendChild(fragment)
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "select/options") {

      if (parent === undefined) {
        document.querySelectorAll(".select-options").forEach(div => {
          this.render(event, input, div)
        })
      }

      if (parent !== undefined) {
        if (!parent.classList.contains("select-options")) {
          parent.classList.add("select-options")
        }
      }

      if (parent !== undefined) {
        parent.textContent = ""
      }

      for (let i = 0; i < input.children.length; i++) {
        const option = input.children[i]

        const button = this.create("button/left-right", parent)
        button.left.textContent = `Option ${i + 1}`
        button.right.textContent = option.value

        button.addEventListener("click", () => {
          this.overlay("toolbox", overlay => {
            overlay.info.append(this.convert("element/alias", option))

            option.ok = () => {
              this.render("select/options", input)
              overlay.remove()
            }

            this.get("funnel/select-option", overlay, option)

          })
        })

      }


    }

    if (event === "templates/node/send-html") {

      return new Promise(async(resolve, reject) => {
        try {
          this.convert("parent/scrollable", parent)
          for (let i = 0; i < input.length; i++) {
            const template = input[i]
            const templateButton = this.create("button/left-right", parent)
            templateButton.left.innerHTML = await Helper.convert("text/purified", template.html)
            templateButton.right.style.fontSize = "21px"
            templateButton.onclick = () => {
              this.overlay("popup", async overlay => {
                const funnel = this.create("div/scrollable", overlay)
                const searchField = this.create("field/text", funnel)
                searchField.label.textContent = "Filter deine Kontakte nach E-Mail Adressen"
                searchField.input.placeholder = "domain.de"
                searchField.style.margin = "21px 34px"
                this.verify("input/value", searchField.input)
                this.add("outline-hover", searchField.input)
                const selectField = this.create("field/select", funnel)
                selectField.label.textContent = "An welche E-Mail Adressen möchtest du dein Template senden"
                selectField.input.setAttribute("multiple", "true")
                selectField.input.style.height = "34vh"
                this.verify("input/value", selectField.input)
                this.add("outline-hover", selectField.input)
                const res = await this.request("/get/contacts/self/")
                if (res.status !== 200) {
                  this.convert("parent/info", contactsDiv)
                  parent.textContent = "Keine Kontakte gefunden"
                }
                if (res.status === 200) {
                  const contacts = JSON.parse(res.response)
                  let filtered
                  searchField.input.oninput = (ev) => {
                    filtered = contacts.filter(it => it.email.toLowerCase().includes(ev.target.value.toLowerCase()))
                    let emails
                    if (filtered) {
                      emails = filtered.map(it => it.email)
                    } else {
                      emails = contacts.map(it => it.email)
                    }
                    selectField.input.add(emails)
                  }
                  selectField.input.add(contacts.map(it => it.email))
                  let selectedEmails
                  let sendTemplateButton
                  selectField.oninput = (ev) => {
                    selectedEmails = Array.from(ev.target.selectedOptions).map(option => option.value)
                    if (!sendTemplateButton) {
                      sendTemplateButton = this.create("button/action", buttons)
                      sendTemplateButton.className = "send-template-button"
                      this.add("outline-hover", sendTemplateButton)
                      sendTemplateButton.textContent = "Template senden"
                      sendTemplateButton.style.width = "34vw"
                      sendTemplateButton.onclick = async () => {
                        await this.verify("input/value", subjectField.input)
                        const emails = Array.from(selectField.input.selectedOptions).map(option => option.value)
                        this.overlay("security", async securityOverlay => {
                          try {
                            securityOverlay.textContent = ""
                            securityOverlay.style.display = "flex"
                            securityOverlay.style.flexDirection = "column"
                            securityOverlay.style.justifyContent = "center"
                            const promises = []
                            for (let i = 0; i < emails.length; i++) {
                              const email = emails[i]
                              const container = this.create("div", securityOverlay)
                              container.style.display = "flex"
                              container.style.margin = "21px 34px"
                              container.style.fontSize = "21px"
                              container.style.fontFamily = "sans-serif"
                              container.style.color = this.colors.light.text
                              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                container.style.color = this.colors.dark.text
                              }
                              const emailDiv = this.create("div", container)
                              emailDiv.textContent = email
                              const signDiv = this.create("div", container)
                              signDiv.style.marginLeft = "34px"
                              this.render("icon/node/path", "/public/loading.svg", signDiv)
                              const promise = this.request("/send/email/send-template/", {email, template: template.html, subject: subjectField.input.value})
                              .then((res) => {
                                if (res.status === 200) {
                                  signDiv.style.color = this.colors.dark.success
                                  signDiv.textContent = "Erfolgreich gesendet.."
                                } else {
                                  signDiv.style.color = this.colors.dark.error
                                  signDiv.textContent = "Fehler beim Senden.."
                                }
                              })
                              .catch((error) => {
                                signDiv.style.color = this.colors.dark.error
                                signDiv.textContent = "Fehler beim Senden.."
                              })
                              promises.push(promise)
                            }
                            await Promise.all(promises)
                            this.removeOverlayButton(securityOverlay)
                          } catch (error) {
                            window.alert("sadf")
                          }
                        })
                      }
                    }
                  }
                  const subjectField = this.create("field/text", funnel)
                  subjectField.label.textContent = "Betreff"
                  subjectField.input.setAttribute("required", "true")
                  subjectField.style.margin = "21px 34px"
                  subjectField.input.oninput = () => this.verify("input/value", subjectField.input)
                  this.verify("input/value", subjectField.input)
                  this.add("outline-hover", subjectField.input)
                  const buttons = this.create("div", funnel)
                  buttons.style.display = "flex"
                  buttons.style.justifyContent = "space-between"
                  buttons.style.width = "100%"
                  const testTemplateButton = this.create("button/action", buttons)
                  this.add("outline-hover", testTemplateButton)
                  testTemplateButton.textContent = "Test senden"
                  testTemplateButton.style.background = this.colors.light.success
                  testTemplateButton.style.width = "34vw"
                  testTemplateButton.onclick = async () => {
                    await this.verify("input/value", subjectField.input)
                    this.overlay("security", async securityOverlay => {
                      securityOverlay.remove()
                      const res = await this.request("/send/email/test-template/", {template: template.html, subject: subjectField.input.value})
                      if (res.status === 200) {
                        window.alert("Template erfolgreich gesendet.")
                        securityOverlay.remove()
                      }
                    })
                  }
                }
              })
            }
          }

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "text/bottom-left") {

      let bottomLeft = parent.querySelector(".bottom-left-text")

      if (bottomLeft !== null) {
        bottomLeft.append(input)
      }

      if (bottomLeft === null) {
        bottomLeft = this.create("div/bottom-left", parent)
        bottomLeft.classList.add("bottom-left-text")
        bottomLeft.textContent = input
      }

      return bottomLeft

    }

    if (event === "text/info") {
      this.convert("parent/info", parent)
      parent.textContent = input
    }

    if (event === "text/code") {

      const code = document.createElement("div")
      code.textContent = input
      code.style.fontSize = "21px"
      code.style.fontFamily = "monospace"
      code.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        code.style.color = this.colors.dark.text
      }
      parent?.append(code)
      return code

    }

    if (event === "text/link") {

      const link = this.create("div")
      link.textContent = input
      link.style.fontFamily = "sans-serif"
      link.style.padding = "13px 21px"
      link.style.display = "flex"
      link.style.justifyContent = "center"
      link.style.alignItems = "center"
      link.style.cursor = "pointer"
      link.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        link.style.color = this.colors.dark.text
      }
      link.onmouseover = () => {
        link.style.outline = "3px solid #999"
      }
      link.onmouseout = () => {
        link.style.outline = null
      }
      parent?.append(link)
      return link

    }

    if (event === "text/div") {
      const div = this.create("div")
      div.textContent = input
      div.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        div.style.color = this.colors.dark.text
      }
      parent?.append(div)
      return div
    }

    if (event === "text/h3") {

      const h3 = this.create("h3")
      h3.textContent = input

      h3.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        h3.style.color = this.colors.dark.text
      }

      if (parent !== undefined) parent.append(h3)
      return h3
    }

    if (event === "text/h2") {

      const h2 = this.create("h2")
      h2.textContent = input

      h2.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        h2.style.color = this.colors.dark.text
      }

      if (parent !== undefined) parent.append(h2)
      return h2
    }

    if (event === "text/h1") {

      const h1 = this.create("h1")
      h1.textContent = input

      h1.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        h1.style.color = this.colors.dark.text
      }

      if (parent !== undefined) parent.append(h1)
      return h1
    }

    if (event === "text/hr") {

      const container = document.createElement("div")
      const text = document.createElement("div")
      text.textContent = input
      container.append(text)
      const hr = document.createElement("hr")
      container.append(hr)
      text.style.fontFamily = "sans-serif"
      text.style.fontSize = "21px"
      text.style.margin = "0 34px"
      hr.style.margin = "0 21px"
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        text.style.color = this.colors.dark.text
        hr.style.border = `1px solid ${this.colors.dark.text}`
      } else {
        text.style.color = this.colors.light.text
        hr.style.border = `1px solid ${this.colors.light.text}`
      }
      parent?.append(container)
      return container

    }

    if (event === "text/node/bottom-right-onhover") {

      const text = document.createElement("div")
      text.textContent = input
      text.style.opacity = "0"
      text.style.position = "absolute"
      text.style.bottom = "0"
      text.style.right = "0"
      text.style.margin = "3px 13px"
      parent.style.position = "relative"
      parent.style.fontFamily = "sans-serif"
      parent.append(text)
      parent.addEventListener("mouseover", () => {
        text.style.opacity = "1"
      })
      parent.addEventListener("mouseout", () => {
        text.style.opacity = "0"
      })
      return parent

    }

    if (event === "text/right-hr") {

      const container = document.createElement("div")

      container.text = document.createElement("div")
      container.text.textContent = input
      container.text.style.display = "flex"
      container.text.style.justifyContent = "flex-end"
      container.append(container.text)

      container.hr = document.createElement("hr")
      container.append(container.hr)

      container.text.style.fontFamily = "sans-serif"
      container.text.style.fontSize = "21px"
      container.text.style.margin = "0 34px"

      container.hr.style.margin = "0 21px"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        container.text.style.color = this.colors.dark.text
        container.hr.style.border = `1px solid ${this.colors.dark.text}`
      } else {
        container.text.style.color = this.colors.light.text
        container.hr.style.border = `1px solid ${this.colors.light.text}`
      }

      parent?.append(container)
      return container
    }

    if (event === "visibility/platform-value-closed") {

      this.convert("parent/scrollable", parent)

      const visibilityField = this.create("field/select", parent)
      visibilityField.label.textContent = "Sichtbarkeit"
      this.verify("input/value", visibilityField.input)
      visibilityField.input.addEventListener("input", () => {
        const value = visibilityField.input.value
        input.visibility = value
        this.render(event, input, parent)
      })

      if (input.visibility === "open") {
        visibilityField.input.add(["open", "closed"])

        const button = this.create("button/action", parent)
        button.textContent = "Sichtbarkeit jetzt ändern"
        button.addEventListener("click", async () => {

          const visibility = visibilityField.input.value

          this.overlay("security", async securityOverlay => {

            const res = await this.request("/register/platform/value-visibility-location-expert/", {path: input.path, visibility})
            if (res.status === 200) {
              window.alert("Sichtbarkeit erfolgreich geändert.")
              parent.parentElement.previousSibling.previousSibling.remove()
              parent.parentElement.previousSibling.remove()
              parent.parentElement.remove()
              securityOverlay.remove()
            } else {
              window.alert("Fehler.. Bitte wiederholen.")
              securityOverlay.remove()
            }

          })

        })

      }

      if (input.visibility === "closed") {

        visibilityField.input.add(["closed", "open"])

        const rolesField = this.create("field/select", parent)
        rolesField.label.textContent = "Nutzer mit diesen Rollen dürfen mit deiner Werteinheit interagieren"
        rolesField.input.multiple = true

        const array = []

        if (input.roles !== undefined) {
          if (input.roles.available !== undefined) {

            for (let i = 0; i < input.roles.available.length; i++) {
              const role = input.roles.available[i]
              array.push(role.name)
            }

          }
        }


        rolesField.input.add(array)

        this.verify("input/value", rolesField.input)

        const selected = []
        for (let i = 0; i < input.roles.selected.length; i++) {
          const roleId = input.roles.selected[i]

          if (input.roles !== undefined) {
            if (input.roles.available !== undefined) {
              for (let i = 0; i < input.roles.available.length; i++) {
                const role = input.roles.available[i]

                if (role.id === roleId) {
                  selected.push(role.name)
                }

              }
            }
          }


        }

        for (let i = 0; i < selected.length; i++) {
          const value = selected[i]

          for (let i = 0; i < rolesField.input.options.length; i++) {
            const option = rolesField.input.options[i]

            if (option.value === value) {
              option.selected = true
            }

          }

        }

        const authorizedField = this.create("field/emails", parent)
        authorizedField.label.textContent = "Nutzer mit diesen E-Mail Adressen dürfen mit deiner Werteinheit interagieren"
        authorizedField.input.value = JSON.stringify(input.authorized)
        this.verify("input/value", authorizedField.input)
        authorizedField.input.addEventListener("input", () => this.verify("input/value", authorizedField.input))

        const button = this.create("button/action", parent)
        button.textContent = "Sichtbarkeit jetzt ändern"
        button.addEventListener("click", async () => {

          await this.verify("field-funnel", parent)

          const visibility = visibilityField.input.value

          const roles = []
          for (let i = 0; i < rolesField.input.options.length; i++) {
            const option = rolesField.input.options[i]

            if (option.selected === true) {
              if (input.roles !== undefined) {
                if (input.roles.available !== undefined) {
                  for (let i = 0; i < input.roles.available.length; i++) {
                    const role = input.roles.available[i]
                    if (role.name === option.value) {
                      roles.push(role.id)
                    }
                  }
                }
              }
            }


          }

          const authorized = JSON.parse(authorizedField.input.value)

          this.overlay("security", async securityOverlay => {

            const res = await this.request("/register/platform/value-visibility-location-expert/", {visibility, roles, authorized, path: input.path})
            if (res.status === 200) {
              window.alert("Sichtbarkeit erfolgreich geändert.")
              parent.parentElement.previousSibling.previousSibling.remove()
              parent.parentElement.previousSibling.remove()
              parent.parentElement.remove()
              securityOverlay.remove()

            } else {
              window.alert("Fehler.. Bitte wiederholen.")
              securityOverlay.remove()
            }

          })


        })
      }

    }

    if (event === "text/p") {
      const p = document.createElement("p")
      p.textContent = input
      p.style.margin = "21px 34px"
      p.style.fontFamily = "sans-serif"

      p.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        p.style.color = this.colors.dark.text
      }

      if (parent !== undefined) parent.append(p)

      return p
    }

    if (event === "text/title") {
      const title = document.createElement("div")
      title.textContent = input
      title.style.margin = "21px 34px"
      title.style.fontSize = "21px"
      title.style.fontFamily = "sans-serif"

      title.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        title.style.color = this.colors.dark.text
      }

      if (parent !== undefined) parent.append(title)

      return title
    }

    if (event === "platform-values/closed") {

      new Promise(async(resolve, reject) => {
        try {
          const copyPathIcon = await this.convert("path/icon", "/public/chain.svg")
          copyPathIcon.style.width = "55px"
          const openPathIcon = await this.convert("path/icon", "/public/window-layout-14.svg")
          openPathIcon.style.width = "55px"
          const pathProtectedIcon = await this.convert("path/icon", "/public/shield-locked.svg")
          pathProtectedIcon.children[0].style.fill = this.colors.light.text
          const pathOpenIcon = await this.convert("path/icon", "/public/eye-open.svg")
          const pathClosedIcon = await this.convert("path/icon", "/public/eye-crossed.svg")
          this.convert("parent/scrollable", parent)
          const fragment = document.createDocumentFragment()
          for (let i = 0; i < input.length; i++) {
            const value = input[i]
            const item = document.createElement("div")
            item.classList.add("checklist-item")
            item.style.margin = "34px"
            const itemHeader = document.createElement("div")
            itemHeader.classList.add("item-header")
            this.add("outline-hover", itemHeader)
            itemHeader.style.display = "flex"
            itemHeader.style.borderTopRightRadius = "21px"
            itemHeader.style.borderTopLeftRadius = "21px"
            itemHeader.style.borderBottomLeftRadius = "21px"
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              itemHeader.style.backgroundColor = this.colors.matte.charcoal
            } else {
              itemHeader.style.backgroundColor = this.colors.gray[1]
            }
            itemHeader.style.cursor = "pointer"
            itemHeader.onclick = async () => {

              this.overlay("popup", buttonsOverlay => {
                buttonsOverlay.info.textContent = value.path

                const buttons = this.create("div/scrollable", buttonsOverlay)
                {
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".path"
                    button.right.textContent = "Pfad ändern"
                    button.onclick = () => {

                      this.overlay("popup", async overlay => {
                        overlay.info.textContent = ".value.path"
                        const funnel = this. create("div/scrollable", overlay)
                        {
                          const pathField = this.create("field/tag", funnel)
                          pathField.input.value = value.path.split("/")[3]
                          pathField.label.textContent = "Pfad"
                          pathField.input.maxLength = "144"
                          pathField.input.placeholder = "Meine Werteinheit"
                          pathField.input.addEventListener("input", (event) => this.verify("input/value", pathField.input))
                          this.verify("input/value", pathField.input)

                          const button = this.create("button/action", funnel)
                          button.textContent = "Pfad jetzt ändern"
                          button.addEventListener("click", async () => {

                            await this.verify("input/value", pathField.input)
                            const path = pathField.input.value

                            this.overlay("security", async securityOverlay => {

                              {
                                const res = await this.request("/verify/platform/value-path-exist/", {path: `/${value.path.split("/")[1]}/${value.path.split("/")[2]}/${path}/`})
                                if (res.status === 200) {
                                  window.alert("Pfad existiert bereits.")
                                  this.add("style/node/not-valid", pathField.input)
                                  pathField.scrollIntoView({behavior: "smooth"})
                                  securityOverlay.remove()
                                  throw new Error("path exist")
                                }
                              }

                              const res = await this.request("/register/platform/value-path-location-expert/", {old: value.path, new: path})
                              if (res.status === 200) {
                                window.alert("Pfad erfolgreich geändert.")
                                overlay.previousSibling.previousSibling.remove()
                                overlay.previousSibling.remove()
                                overlay.remove()
                                securityOverlay.remove()
                              } else {
                                window.alert("Fehler.. Bitte wiederholen.")
                                securityOverlay.remove()
                              }
                            })

                          })

                        }

                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".alias"
                    button.right.textContent = "Alias ändern"
                    button.onclick = () => {

                      this.overlay("popup", async overlay => {
                        overlay.info.textContent = ".value.alias"
                        {
                          const funnel = this.create("div/scrollable", overlay)

                          const valueAliasField = this.create("field/text", funnel)
                          valueAliasField.input.value = value.alias
                          valueAliasField.label.textContent = "Alias"
                          valueAliasField.input.maxLength = "144"
                          valueAliasField.input.setAttribute("required", "true")
                          valueAliasField.input.placeholder = "Meine Werteinheit"
                          valueAliasField.input.addEventListener("input", () => this.verify("input/value", valueAliasField.input))
                          this.verify("input/value", valueAliasField.input)

                          const button = this.create("button/action", funnel)
                          button.textContent = "Alias jetzt ändern"
                          button.addEventListener("click", async () => {

                            await this.verify("input/value", valueAliasField.input)
                            const alias = valueAliasField.input.value

                            this.overlay("security", async securityOverlay => {

                              const res = await this.request("/register/platform/value-alias-location-expert/", {alias, path: value.path})
                              if (res.status === 200) {
                                window.alert("Alias erfolgreich geändert..")
                                overlay.previousSibling.previousSibling.remove()
                                overlay.previousSibling.remove()
                                overlay.remove()
                                securityOverlay.remove()
                              } else {
                                alert("Fehler.. Bitte wiederholen.")
                                securityOverlay.remove()
                              }
                            })


                          })
                        }

                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".image"
                    button.right.textContent = "Bild ändern"
                    button.onclick = () => {

                      this.overlay("popup", overlay => {
                        overlay.info.append(this.convert("text/span", ".value.image"))
                        const funnel = this.create("div/scrollable", overlay)
                        const urlField = this.create("field/url", funnel)
                        urlField.input.setAttribute("required", "true")
                        urlField.input.accept = "text/https"
                        urlField.label.textContent = "Gebe hier die Quell-Url für dein Bild ein"
                        urlField.input.placeholder = "https://www.meine-quelle.de/mein-bild.svg"
                        urlField.input.value = value.image ?? "";
                        this.verify("input/value", urlField.input)
                        urlField.input.addEventListener("input", () => this.verify("input/value", urlField.input))
                        const submit = this.create("button/action", funnel)
                        submit.textContent = "Bild jetzt ändern"
                        submit.onclick = async () => {
                          await this.verify("input/value", urlField.input)
                          this.overlay("security", async securityOverlay => {
                            const res = await this.request("/register/platform/value-image-expert", {path: value.path, image: urlField.input.value})
                            if (res.status === 200) {
                              window.alert("Bild erfolgreich gespeichert..")
                              overlay.previousSibling.previousSibling.remove()
                              overlay.previousSibling.remove()
                              overlay.remove()
                              securityOverlay.remove()
                            } else {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }
                          })
                        }

                      })

                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".lang"
                    button.right.textContent = "Sprache ändern"
                    button.onclick = () => {

                      this.overlay("popup", async overlay => {
                        overlay.info.textContent = ".value.lang"
                        const funnel = this.create("div/scrollable", overlay)
                        const langField = this.create("field/lang", funnel)
                        langField.input.value = value.lang ?? "";
                        const button = this.create("button/action", funnel)
                        button.textContent = "Sprache jetzt ändern"
                        button.addEventListener("click", async () => {
                          await this.verify("input/value", langField.input)
                          this.overlay("security", async securityOverlay => {
                            const res = await this.request("/register/platform/value-lang-location-expert/", {lang: langField.input.value, path: value.path})
                            if (res.status === 200) {
                              window.alert("Sprache erfolgreich geändert..")
                              overlay.previousSibling.previousSibling.remove()
                              overlay.previousSibling.remove()
                              overlay.remove()
                              securityOverlay.remove()
                            } else {
                              window.alert("Fehler.. Bitte wiederholen.")
                              securityOverlay.remove()
                            }
                          })
                        })
                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".visibility"
                    button.right.textContent = "Sichtbarkeit der Werteinheit"
                    button.onclick = () => {
                      this.overlay("popup", async overlay => {
                        overlay.info.textContent = ".visibility"
                        const funnel = this.create("div/scrollable", overlay)
                        const res = await this.request("/get/platform/value-visibility-location-expert/", {path: value.path})
                        if (res.status === 200) {
                          const map = JSON.parse(res.response)
                          map.path = value.path
                          this.render("visibility/platform-value-closed", map, funnel)
                        }
                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.right.textContent = "Schreibrechte an Teammitglieder vergeben"
                    button.left.textContent = ".writability"
                    button.onclick = () => {
                      this.overlay("popup", async overlay => {
                        overlay.info.textContent = `.${value.path}.writability`
                        const funnel = this.create("div/scrollable", overlay)
                        const searchField = this.create("field/text", funnel)
                        searchField.label.textContent = "Suche nach E-Mail Adressen"
                        searchField.input.placeholder = "get-your.de"
                        searchField.style.margin = "21px 34px"
                        this.verify("input/value", searchField.input)
                        this.add("outline-hover", searchField.input)
                        const emailsField = await this.create("field/closed-contacts-email-select", funnel)
                        const originalOptions = Array.from(emailsField.input.options).map(option => option.cloneNode(true))
                        searchField.input.oninput = (ev) => {
                          const searchTerm = ev.target.value.toLowerCase()
                          const options = originalOptions.map(it => it.value)
                          const filtered = options.filter(it => it.toLowerCase().includes(searchTerm))
                          emailsField.input.add(filtered)
                        }
                        emailsField.input.style.height = "21vh"
                        emailsField.input.setAttribute("multiple", "true")
                        for (let i = 0; i < emailsField.input.options.length; i++) {
                          const option = emailsField.input.options[i]
                          option.selected = false
                        }
                        const submit = this.create("button/action", funnel)
                        submit.textContent = "Schreibrechte jetzt vergeben"
                        let clickCounter = 0
                        submit.onclick = () => {
                          try {
                            const array = Array.from(emailsField.input.selectedOptions).map(it => it.value)
                            for (let i = 0; i < array.length; i++) {
                              const item = array[i]
                              if (!this.verifyIs("text/email", item)) throw new Error("not an email")
                            }
                            this.add("style/node/valid", emailsField.input)
                            this.overlay("security", async securityOverlay => {
                              const res = await this.request("/register/platform/value-writability-location-expert/", {path: value.path, writability: array})
                              if (res.status === 200) {
                                window.alert("Schreibrechte erfolgreich gespeichert.")
                                overlay.previousSibling.previousSibling.remove()
                                overlay.previousSibling.remove()
                                overlay.remove()
                                securityOverlay.remove()
                              }
                              if (res.status !== 200) {
                                window.alert("Fehler.. Bitte wiederholen.")
                                securityOverlay.remove()
                              }
                            })
                          } catch (error) {
                            this.add("style/node/not-valid", emailsField.input)
                            if (clickCounter === 3) {
                              window.alert("Deine E-Mail Liste ist ungültig.")
                              clickCounter = 0
                            }
                            clickCounter++
                          }
                        }
                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.right.textContent = "Aktualisiere deine Toolbox"
                    button.left.textContent = ".update-toolbox"
                    button.onclick = async () => {
                      const res = await this.request("/update/toolbox/path-location-expert/", {path: value.path})
                      if (res.status === 200) {
                        window.alert("Toolbox wurde erfolgreich aktualisiert.")
                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")
                      }
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".remove"
                    button.right.textContent = "Werteinheit entfernen"
                    button.onclick = async () => {

                      const confirm = window.confirm("Möchtest du deine Werteinheit wirklich löschen? Alle enthaltenen Daten werden ebenfalls gelöscht.")
                      if (confirm === true) {
                        this.overlay("security", async securityOverlay => {
                          const res = await this.request("/remove/platform/value-expert/", {path: value.path})
                          if (res.status === 200) {
                            window.alert("Werteinheit erfolgreich entfernt.")
                            buttonsOverlay.previousSibling.remove()
                            buttonsOverlay.remove()
                            securityOverlay.remove()
                          } else {
                            window.alert("Fehler.. Bitte wiederholen.")
                            securityOverlay.remove()
                          }
                        })
                      }
                    }
                  }
                }
              })
            }
            const itemState = document.createElement("div")
            itemState.classList.add("item-state")
            itemState.style.display = "flex"
            itemState.style.justifyContent = "center"
            itemState.style.alignItems = "center"
            itemState.style.width = "89px"
            itemState.style.height = "89px"
            itemState.style.fontSize = "34px"
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              itemState.style.backgroundColor = this.colors.matte.black
            } else {
              itemState.style.backgroundColor = this.colors.gray[2]
            }
            if (value.visibility === "closed") {
              if (value.roles.length === 0) {
                if (value.authorized.length === 0) {
                  itemState.appendChild(pathClosedIcon.cloneNode(true))
                }
              }
            }
            if (value.visibility === "open") {
              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                itemState.style.backgroundColor = this.colors.matte.seaGreen
              } else {
                itemState.style.backgroundColor = this.colors.matte.lime
              }
              itemState.appendChild(pathOpenIcon.cloneNode(true))
            }
            if (value.visibility === "closed") {
              if (value.roles.length !== 0 || value.authorized.length !== 0) {
                itemState.style.backgroundColor = "#eed202"
                itemState.appendChild(pathProtectedIcon.cloneNode(true))
              }
            }
            itemState.style.borderTopLeftRadius = "21px"
            itemState.style.borderBottomLeftRadius = "21px"
            const itemTitle = document.createElement("div")
            itemTitle.classList.add("item-title")
            itemTitle.style.padding = "21px 34px"
            itemTitle.style.fontSize = "21px"
            itemTitle.style.overflow = "auto"
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              itemTitle.style.color = this.colors.dark.text
            } else {
              itemTitle.style.color = this.colors.light.text
            }
            {
              const alias = document.createElement("div")
              alias.textContent = `${value.alias}`
              alias.style.fontSize = "21px"
              itemTitle.append(alias)
            }
            {
              const path = document.createElement("div")
              path.textContent = `${value.path}`
              path.style.fontSize = "13px"
              itemTitle.append(path)
            }
            itemHeader.append(itemState, itemTitle)
            item.append(itemHeader)
            const itemBody = document.createElement("div")
            itemBody.classList.add("item-body")
            itemBody.style.marginLeft = "8%"
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              itemBody.style.backgroundColor = this.colors.matte.slate
              itemBody.style.boxShadow = `0 1px ${this.colors.gray[4]}`
            } else {
              itemBody.style.boxShadow = `0 1px ${this.colors.gray[2]}`
              itemBody.style.backgroundColor = this.colors.gray[0]
            }
            itemBody.style.borderBottomRightRadius = "21px"
            itemBody.style.borderBottomLeftRadius = "21px"
            itemBody.style.padding = "21px"
            itemBody.style.display = "flex"
            itemBody.style.flexDirection = "column"
            const buttons = document.createElement("div")
            buttons.style.display = "flex"
            buttons.style.alignItems = "center"
            {
              const button = this.create("div", buttons)
              button.appendChild(openPathIcon.cloneNode(true))
              button.className = "button"
              button.style.margin = "8px"
              button.style.cursor = "pointer"
              button.onclick = () => window.open(value.path, "_blank")
            }
            {
              const button = this.create("div")
              button.className = "button"
              button.style.margin = "8px"
              button.appendChild(copyPathIcon.cloneNode(true))
              buttons.appendChild(button)
              button.style.cursor = "pointer"
              button.onclick = () => {

                navigator.clipboard.writeText(value.path)
                .then(() => window.alert(`Der Pfad '${value.path}' wurde erfolgreich in den Zwischenspeicher kopiert.`))
                .catch(() => window.alert("Fehler.. Bitte wiederholen."))

              }
            }
            itemBody.appendChild(buttons)
            if (value.requested) {
              const requested = document.createElement("div")
              requested.textContent = `Angefordert: ${this.convert("number/k-M", value.requested.length)} Mal`
              requested.style.fontSize = "21px"
              requested.style.color = this.colors.matte.orange
              itemBody.append(requested)
            }
            if (value.writability) {
              const writability = document.createElement("div")
              writability.textContent = `Schreibrechte: ${value.writability.join(", ")}`
              writability.style.fontSize = "21px"
              writability.style.color = this.colors.matte.orange
              itemBody.append(writability)
            }
            item.appendChild(itemBody)
            fragment.appendChild(item)
          }
          parent.appendChild(fragment)
          resolve()
        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "platform-values/location") {

      this.convert("parent/scrollable", parent)
      for (let i = 0; i < input.length; i++) {
        const value = input[i]
        const button = this.create("button/image-text", parent)
        button.text.textContent = this.convert("text/capital-first-letter", value.alias)
        if (!this.verifyIs("text/empty", value.image)) {
          button.image.style.maxHeight = "89vh"
          button.image.style.objectFit = "cover"
          button.image.src = value.image
        } else {
          button.image.remove()
        }
        button.onclick = () => window.open(value.path, "_blank")
      }

    }

    if (event === "platforms/closed") {

      this.convert("element/reset", parent)
      for (let i = 0; i < input.length; i++) {
        const platform = input[i]
        const button = this.create("button/image-text", parent)
        button.text.textContent = this.convert("text/capital-first-letter", platform.name)
        if (!this.verifyIs("text/empty", platform.image)) {
          button.image.style.maxHeight = "89vh"
          button.image.style.objectFit = "cover"
          button.image.src = platform.image
        } else {
          button.image.remove()
        }
        button.onclick = () => {
          this.overlay("popup", async buttonsOverlay => {
            buttonsOverlay.info.textContent = platform.name
            const buttons = this.create("div/scrollable", buttonsOverlay)
            {
              const button = this.create("button/left-right", buttons)
              button.left.textContent = ".create"
              button.right.textContent = "Neue Werteinheit erstellen"
              button.onclick = () => {
                this.overlay("popup", overlay => {
                  overlay.info.textContent = `${platform.name}.value`
                  const funnel = this.create("div/scrollable", overlay)
                  const valuePathField = this.create("field/tag", funnel)
                  valuePathField.label.textContent = "Pfad"
                  valuePathField.input.maxLength = "144"
                  valuePathField.input.placeholder = "meine-werteinheit"
                  this.verify("input/value", valuePathField.input)
                  valuePathField.input.addEventListener("input", () => this.verify("input/value", valuePathField.input))
                  const valueAliasField = this.create("field/text", funnel)
                  valueAliasField.label.textContent = "Alias"
                  valueAliasField.input.maxLength = "144"
                  valueAliasField.input.setAttribute("required", "true")
                  valueAliasField.input.placeholder = "Meine Werteinheit"
                  valueAliasField.input.addEventListener("input", () => this.verify("input/value", valueAliasField.input))
                  this.verify("input/value", valueAliasField.input)
                  const button = this.create("button/action", funnel)
                  button.textContent = "Werteinheit jetzt speichern"
                  button.onclick = async () => {
                    await this.verify("field-funnel", funnel)
                    const path = valuePathField.input.value
                    const alias = valueAliasField.input.value
                    const res = await this.request("/verify/platform/value-path-exist/", {path: `/${window.location.pathname.split("/")[1]}/${platform.name}/${path}/`})
                    if (res.status === 200) {
                      window.alert("Pfad existiert bereits.")
                      this.add("style/node/not-valid", valuePathField.input)
                      valuePathField.scrollIntoView({behavior: "smooth"})
                      throw new Error("path exist")
                    }
                    this.overlay("security", async securityOverlay => {
                      const res = await this.request("/register/platform/value-expert/", {path, alias, platform: platform.name})
                      if (res.status === 200) {
                        alert("Werteinheit erfolgreich gespeichert.")
                        overlay.remove()
                        securityOverlay.remove()
                      } else {
                        alert("Fehler.. Bitte wiederholen.")
                        securityOverlay.remove()
                      }
                    })
                  }
                })
              }
            }
            {
              const button = this.create("button/left-right", buttons)
              button.left.textContent = ".values"
              button.right.textContent = "Meine HTML Werteinheiten"
              button.onclick = () => {
                this.overlay("popup", async overlay => {
                  overlay.info.textContent = `${platform.name}.values`
                  const searchField = this.create("field/text", overlay)
                  searchField.label.textContent = "Suche nach Alias"
                  searchField.input.placeholder = "Meine Werteinheiten"
                  this.verify("input/value", searchField.input)
                  const units = this.create("info/loading", overlay)
                  const res = await this.request("/get/platform/values-self/", {platform: platform.name})
                  if (res.status === 200) {
                    const values = JSON.parse(res.response)
                    searchField.input.oninput = (ev) => {
                      const filtered = values.filter(it => it.alias.toLowerCase().includes(ev.target.value.toLowerCase()))
                      const highlighted = filtered.map(it => {
                        const highlightedAlias = it.alias.replace(new RegExp(ev.target.value, 'i'), `<mark>${ev.target.value}</mark>`)
                        return { ...it, alias: highlightedAlias }
                      })
                      this.render("platform-values/closed", highlighted, units)
                    }
                    this.render("platform-values/closed", values, units)
                  } else {
                    this.convert("parent/info", units)
                    searchField.remove()
                    units.textContent = `Es wurden keine Werteinheiten gefunden.`
                    throw new Error("platform values is empty")
                  }
                })
              }
            }
            {
              const button = this.create("button/left-right", buttons)
              button.left.textContent = ".roles"
              button.right.textContent = "Rollen definieren"
              button.onclick = () => {
                this.overlay("popup", async overlay => {
                  overlay.info.textContent = `${platform.name}.roles`
                  const create = this.create("button/left-right", overlay)
                  create.left.textContent = ".create"
                  create.right.textContent = "Neue Rolle definieren"
                  create.onclick = () => {
                    this.overlay("popup", async overlay => {
                      overlay.info.textContent = "create.role"
                      const funnel = this.create("field-funnel/role", overlay)
                      const res = await this.request("/get/platform/value-paths-location-expert/", {platform: platform.name})
                      if (res.status === 200) {
                        const paths = JSON.parse(res.response)
                        funnel.homeField.input.add(paths)
                        this.verify("input/value", funnel.homeField.input)
                      } else {
                        window.alert("Es wurden keine Werteinheiten definiert")
                        this.add("style/node/not-valid", funnel.homeField.input)
                      }
                      funnel.submit.onclick = async () => {
                        await this.verify("field-funnel", funnel)
                        const name = funnel.nameField.input.value
                        const home = funnel.homeField.input.value
                        const apps = JSON.parse(funnel.appsField.input.value)
                        const res = await this.request("/verify/platform/role-name/", {platform: platform.name, name})
                        if (res.status === 200) {
                          window.alert("Diese Rolle existiert bereits.")
                          this.add("style/node/not-valid", funnel.nameField.input)
                          throw new Error("name exist")
                        }
                        this.overlay("security", async securityOverlay => {
                          const res = await this.request("/register/platform/role-expert/", {platform: platform.name, name, apps, home})
                          if (res.status === 200) {
                            window.alert("Rolle erfolgreich gespeichert.")
                            await this.render("roles-expert", platform.name, roleList)
                            overlay.remove()
                            securityOverlay.remove()
                          }
                        })
                      }
                    })
                  }
                  this.render("text/hr", "Meine Rollen", overlay)
                  const roleList = this.create("info/loading", overlay)
                  await this.render("roles-expert", platform.name, roleList)
                })
              }
            }
            {
              const button = this.create("button/left-right", buttons)
              button.left.textContent = ".match-maker"
              button.right.textContent = "Match Maker definieren"
              button.onclick = () => {
                this.overlay("popup", async overlay => {
                  overlay.info.textContent = `.match-maker`

                  const create = this.create("button/left-right", overlay)
                  create.left.textContent = ".create"
                  create.right.textContent = "Neuen Match Maker definieren"
                  create.addEventListener("click", () => {
                    this.overlay("popup", async overlay => {
                      overlay.info.textContent = `.${platform.name}.match-maker`
                      const funnel = this.create("div/scrollable", overlay)
                      funnel.nameField = this.create("field/tag", funnel)
                      funnel.nameField.label.textContent = "Gebe deinem Match Maker einen einzigartigen Namen (text/tag)"
                      funnel.nameField.input.placeholder = "mein-match-maker"
                      this.verify("input/value", funnel.nameField.input)
                      funnel.nameField.input.oninput = () => this.verify("input/value", funnel.nameField.input)
                      funnel.submit = this.create("button/action", funnel)
                      funnel.submit.textContent = "Match Maker jetzt speichern"
                      funnel.submit.onclick = async () => {
                        await this.verify("input/value", funnel.nameField.input)
                        const name = funnel.nameField.input.value
                        const res = await this.request("/verify/match-maker/name/", {name})
                        if (res.status === 200) {
                          window.alert("Name existiert bereits.")
                          this.add("style/node/not-valid", funnel.nameField.input)
                          throw new Error("name exist")
                        }
                        this.overlay("security", async securityOverlay => {
                          const res = await this.request("/register/platform/match-maker-location-expert/", {platform: platform.name, name})
                          if (res.status === 200) {
                            window.alert("Match Maker wurde erfolgreich gespeichert.")
                            await this.render("match-maker/expert", platform.name, matchMakerContainer)
                            overlay.remove()
                            securityOverlay.remove()
                          } else {
                            window.alert("Fehler.. Bitte wiederholen")
                            securityOverlay.remove()
                          }
                        })
                      }
                    })
                  })
                  this.render("text/hr", "Meine Match Maker", overlay)
                  const matchMakerContainer = this.create("div/scrollable", overlay)
                  await this.render("match-maker/expert", platform.name, matchMakerContainer)
                })
              }
            }
            {
              const button = this.create("button/left-right", buttons)
              button.right.textContent = "Namen ändern"
              button.left.textContent = ".name"
              button.onclick = () => {
                this.overlay("popup", async overlay => {
                  overlay.info.textContent = `${platform.name}.name`
                  const funnel = this.create("div/scrollable", overlay)
                  const platformNameField = this.create("field/tag", funnel)
                  platformNameField.input.value = platform.name
                  platformNameField.label.textContent = "Plattform"
                  platformNameField.input.maxLength = "21"
                  platformNameField.input.placeholder = "meine-plattform"
                  platformNameField.input.oninput = () => this.verify("input/value", platformNameField.input)
                  this.verify("input/value", platformNameField.input)
                  const button = this.create("button/action", funnel)
                  button.textContent = "Namen jetzt speichern"
                  button.onclick = async () => {
                    await this.verify("input/value", platformNameField.input)
                    const platformName = platformNameField.input.value
                    this.overlay("security", async securityOverlay => {
                      {
                        const res = await this.request("/verify/platform/exist/", {platform: platformName})
                        if (res.status === 200) {
                          window.alert("Plattform existiert bereits.")
                          this.add("style/node/not-valid", platformNameField.input)
                          securityOverlay.remove()
                          throw new Error("platform exist")
                        }
                      }
                      const res = await this.request("/register/platform/name-location-expert/", {old: platform.name, new: platformName})
                      if (res.status === 200) {
                        window.alert("Plattform Name erfolgreich gespeichert.")
                        window.location.reload()
                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")
                        securityOverlay.remove()
                      }
                    })
                  }
                })
              }
            }
            {
              const button = this.create("button/left-right", buttons)
              button.right.textContent = "Bild ändern"
              button.left.textContent = ".image"
              button.onclick = () => {
                this.overlay("popup", async overlay => {
                  overlay.info.textContent = `${platform.name}.image`
                  const funnel = this.create("div/scrollable", overlay)
                  const urlField = this.create("field/text", funnel)
                  urlField.label.textContent = "Gebe hier die Quell-Url für dein Bild ein"
                  urlField.input.placeholder = "https://www.meine-quelle.de/mein-bild.svg"
                  urlField.input.value = platform.image
                  this.verify("input/value", urlField.input)
                  urlField.input.addEventListener("input", () => this.verify("input/value", urlField.input))
                  const submit = this.create("button/action", funnel)
                  submit.textContent = "Bild jetzt speichern"
                  submit.onclick = async () => {
                    await this.verify("input/value", urlField.input)
                    this.overlay("security", async securityOverlay => {
                      const res = await this.request("/register/platform/image-expert/", {platform: platform.name, image: urlField.input.value})
                      if (res.status === 200) {
                        window.alert("Bild erfolgreich gespeichert.")
                        window.location.reload()
                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")
                        securityOverlay.remove()
                      }
                    })

                  }

                })
              }
            }

            {
              const button = this.create("button/left-right", buttons)
              button.right.textContent = "Sichtbarkeit der Plattform"
              button.left.textContent = ".visibility"
              button.onclick = () => {
                this.overlay("popup", async overlay => {
                  overlay.info.textContent = `${platform.name}.visibility`
                  const funnel = this.create("div/scrollable", overlay)
                  {
                    const visibilityField = this.create("field/select", funnel)
                    visibilityField.label.textContent = "Sichtbarkeit"
                    if (platform.visibility === "open") {
                      visibilityField.input.add(["open", "closed"])
                    }
                    if (platform.visibility === "closed") {
                      visibilityField.input.add(["closed", "open"])
                    }
                    this.verify("input/value", visibilityField.input)
                    const button = this.create("button/action", funnel)
                    button.textContent = "Sichtbarkeit jetzt speichern"
                    button.onclick = async () => {
                      const visibility = visibilityField.input.value
                      this.overlay("security", async securityOverlay => {
                        const res = await this.request("/register/platform/visibility-location-expert/", {platform: platform.name, visibility})
                        if (res.status === 200) {
                          window.alert("Sichtbarkeit erfolgreich geändert.")
                          window.location.reload()
                        } else {
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }
                      })
                    }
                  }
                })
              }
            }
            {
              const button = this.create("button/left-right", buttons)
              button.right.textContent = "Plattform entfernen"
              button.left.textContent = ".remove"
              button.onclick = () => {
                const confirm = window.confirm("Möchtest du deine Plattform wirklich entfernen? Alle enthaltenen Werteinheiten werden ebenfalls gelöscht.")
                if (confirm === true) {
                  this.overlay("security", async securityOverlay => {
                    const res = await this.request("/remove/platform/expert/", {platform: platform.name})
                    if (res.status === 200) {
                      window.alert("Plattform erfolgreich entfernt.")
                      window.location.reload()
                    } else {
                      window.alert("Fehler.. Bitte wiederholen.")
                      securityOverlay.remove()
                    }
                  })
                }
              }
            }
          })
        }
      }
    }

    if (event === "platforms/location") {

      this.convert("element/reset", parent)
      for (let i = 0; i < input.length; i++) {
        const platform = input[i]
        const button = this.create("button/image-text", parent)
        button.text.textContent = this.convert("text/capital-first-letter", platform.name)
        if (!this.verifyIs("text/empty", platform.image)) {
          button.image.style.maxHeight = "89vh"
          button.image.style.objectFit = "cover"
          button.image.src = platform.image
        } else {
          button.image.remove()
        }
        button.onclick = () => {
          this.overlay("popup", async overlay => {
            const content = this.create("info/loading", overlay)
            const res = await this.request("/get/platform/values-location-expert/", {platform: platform.name})
            if (res.status === 200) {
              const values = JSON.parse(res.response)
              this.render("platform-values/location", values, content)
            }
          })
        }
      }
    }

    if (event === "roles-expert") {

      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/get/platform/roles-expert/", {platform: input})
          if (res.status === 200) {
            const roles = JSON.parse(res.response)
            this.convert("parent/scrollable", parent)
            for (let i = 0; i < roles.length; i++) {
              const role = roles[i]
              const button = this.create("button/left-right", parent)
              button.left.textContent = role.name
              button.right.textContent = "Rolle bearbeiten"
              button.onclick = () => {
                this.overlay("popup", async roleButtons => {
                  roleButtons.info.textContent = `${input}.roles.${role.name}`
                  const buttons = this.create("div/scrollable", roleButtons)
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".update"
                    button.right.textContent = "Aktualisiere deine Rolle"
                    button.onclick = () => {
                      this.overlay("popup", async overlay => {
                        const funnel = this.create("field-funnel/role", overlay)
                        funnel.nameField.input.value = role.name
                        const res = await this.request("/get/platform/value-paths-location-expert/", {platform: input})
                        if (res.status === 200) {
                          const paths = JSON.parse(res.response)
                          funnel.homeField.input.add(paths)
                          funnel.homeField.input.select([role.home])
                          this.verify("input/value", funnel.homeField.input)
                        } else {
                          window.alert("Es wurden keine Werteinheiten definiert")
                          this.add("style/node/not-valid", funnel.homeField.input)
                        }
                        funnel.appsField.input.value = JSON.stringify(role.apps)
                        this.verify("field-funnel", funnel)
                        funnel.submit.onclick = async () => {
                          await this.verify("field-funnel", funnel)
                          const name = funnel.nameField.input.value
                          const home = funnel.homeField.input.value
                          const apps = JSON.parse(funnel.appsField.input.value)
                          const res = await this.request("/verify/platform/role-name/", {platform: input, name})
                          if (res.status === 200) {
                            window.alert("Diese Rolle existiert bereits.")
                            this.add("style/node/not-valid", funnel.nameField.input)
                            throw new Error("name exist")
                          }
                          this.overlay("security", async securityOverlay => {
                            const res = await this.request("/update/platform/role-expert/", {id: role.created, platform: input, name, apps, home})
                            if (res.status === 200) {
                              window.alert("Rolle erfolgreich gespeichert.")
                              await this.render(event, input, parent)
                              roleButtons.remove()
                              overlay.remove()
                              securityOverlay.remove()
                            }
                          })
                        }
                      })
                    }
                  }
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".remove"
                    button.right.textContent = "Entferne deine Rolle"
                    button.onclick = () => {
                      this.overlay("security", async securityOverlay => {
                        const res = await this.request("/remove/platform/role-expert/", {platform: input, id: role.created})
                        if (res.status === 200) {
                          window.alert("Deine Rolle wurde erfolgreich entfernt.")
                          await this.render(event, input, parent)
                          roleButtons.remove()
                          securityOverlay.remove()
                        }
                      })
                    }
                  }
                })
              }
            }
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "source/field-funnel") {
      if (input.authors) parent.authorsField.input.value = input.authors.join(", ")
      if (input.title) parent.titleField.input.value = input.title
      if (input.edition) parent.editionField.input.value = input.edition
      if (input.publisher) parent.publisherField.input.value = input.publisher.join(", ")
      if (input.published) parent.publishedField.input.value = this.convert("millis/yyyy", input.published)
      if (input.isbn) parent.isbnField.input.value = input.isbn.join(", ")
      if (input.weblink) parent.weblinkField.input.value = input.weblink
      if (input.language) parent.languageField.input.value = input.language.join(", ")
      if (input.type) parent.typeField.input.value = input.type
      if (input.keywords) parent.keywordsField.input.value = input.keywords.join(", ")
      if (input.description) parent.descriptionField.input.value = input.description
      if (input.image) parent.imageField.input.value = input.image
    }

    if (event === "field-funnel-fields-update") {

      if (input.classList.contains("field-funnel")) {
        this.convert("parent/scrollable", parent)
        for (let i = 0; i < input.children.length; i++) {
          const field = input.children[i]
          if (field.classList.contains("submit-field-funnel-button")) continue
          if (field.classList.contains("field")) {
            const fieldInput = field.querySelector(".field-input")
            const button = this.create("button/left-right", parent)
            button.left.textContent = field.id
            button.right.append(this.convert("element/alias", fieldInput))
            this.add("outline-hover", button)
            button.onclick = () => {
              this.overlay("toolbox", overlay => {
                overlay.info.append(this.convert("element/alias", fieldInput))
                const buttons = this.create("div/scrollable", overlay)
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".id"
                  button.right.textContent = "Datenfeld Id aktualisieren"
                  this.add("outline-hover", button)
                  button.onclick = () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.textContent = `${this.convert("element/alias", fieldInput)}.id`
                      const idField = this.create("field/id", overlay)
                      idField.input.value = field.id
                      idField.input.oninput = () => {
                        this.verify("input/value", idField.input)
                        const id = idField.input.value
                        if (this.verifyIs("id/unique", id) && this.verifyIs("text/tag", id)) {
                          field.setAttribute("id", id)
                          this.render(event, input, parent)
                        } else {
                          this.add("style/node/not-valid", idField.input)
                        }
                      }
                    })
                  }
                }
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".on-info-click"
                  button.right.textContent = "Erweitere dein Datenfeld mit mehr Informationen"
                  this.add("outline-hover", button)
                  button.onclick = () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.append(this.convert("element/alias", fieldInput))
                      overlay.info.append(".on-info-click")
                      const infoField = this.create("field/textarea", overlay)
                      infoField.label.textContent = "Hier kannst du, wenn du möchtest, mehr Informationen zu diesem Datenfeld, als HTML, für deine Nutzer, bereitstellen"
                      infoField.input.style.height = "144px"
                      infoField.input.placeholder = "<div>..</div>"
                      infoField.input.style.fontFamily = "monospace"
                      infoField.input.style.fontSize = "13px"
                      if (field.hasAttribute("on-info-click")) {
                        infoField.input.value = field.getAttribute("on-info-click")
                      }
                      this.verify("input/value", infoField.input)
                      infoField.input.oninput = () => {
                        field.setAttribute("on-info-click", infoField.input.value)
                        const script = this.create("script", {id: "on-info-click", js: 'Helper.add("on-info-click")'})
                        this.add("script-onbody", script)
                      }
                    })
                  }
                }
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".remove"
                  button.right.textContent = "Datenfeld entfernen"
                  this.add("outline-hover", button)
                  button.onclick = () => {
                    try {
                      field.remove()
                      this.render(event, input, parent)
                      overlay.remove()
                      window.alert("Datenfeld erfolgreich entfernt.")
                    } catch (error) {
                      window.alert("Fehler.. Bitte wiederholen.")
                      console.error(error)
                    }
                  }
                }
              })
            }
          }
        }
      }
    }

    if (event === "field-funnel/fields") {

      if (parent === undefined) {
        document.querySelectorAll(".field-funnel-fields").forEach(div => {
          this.render(event, input, div)
        })
      }

      if (parent !== undefined) {
        if (!parent.classList.contains("field-funnel-fields")) {
          parent.classList.add("field-funnel-fields")
        }
      }

      if (parent !== undefined) {
        parent.textContent = ""
      }


      if (input.classList.contains("field-funnel")) {

        for (let i = 0; i < input.children.length; i++) {
          const field = input.children[i]

          if (field.classList.contains("submit-field-funnel-button")) continue

          if (field.classList.contains("field")) {
            const fieldInput = field.querySelector(".field-input")


            const button = this.create("button/left-right", parent)
            button.left.textContent = field.id

            button.right.append(this.convert("element/alias", fieldInput))
            button.addEventListener("click", () => {
              this.overlay("toolbox", overlay => {
                overlay.info.append(this.convert("element/alias", fieldInput))
                const content = this.create("div/scrollable", overlay)


                field.ok = () => {
                  this.get(event, parent, input)
                  overlay.remove()
                }

                this.get("funnel/field", content, field)






              })
            })
          }

        }





      }

    }

    if (event === "children") {

      if (parent === undefined) {
        if (input.tagName === "BODY") {
          document.querySelectorAll(".body-children").forEach(div => {
            this.render(event, input, div)
          })
        }
      }

      if (input.tagName === "BODY") {
        if (parent !== undefined) {
          if (!parent.classList.contains("body-children")) {
            parent.classList.add("body-children")
          }
        }
      }

      if (parent !== undefined) {
        parent.textContent = ""
      }

      childrenLoop: for (let i = 0; i < input.children.length; i++) {
        const child = input.children[i]

        if (child.id === "toolbox") continue
        if (child.id === "toolbox-getter") continue
        if (child.getAttribute("data-id") === "toolbox") continue
        if (child.classList.contains("overlay")) continue

        for (let i = 0; i < child.classList.length; i++) {
          if (child.classList[i].startsWith("overlay")) continue childrenLoop
        }

        const childrenButton = this.create("toolbox/left-right", parent)
        // const childrenButton = button
        childrenButton.left.append(this.convert("element/alias", child))
        childrenButton.right.textContent = "Element bearbeiten"

        if (child.tagName === "SCRIPT") {
          this.render("left-right/local-script-toggle", child.id, childrenButton)
        }

        childrenButton.onclick = () => {

          this.overlay("toolbox", async overlay => {
            overlay.info.textContent = `<${this.convert("node/selector", child)}`

            {
              const buttons = this.create("div/scrollable", overlay)

              if (child.tagName !== "SCRIPT") {

                const button = this.create("toolbox/left-right", buttons)
                button.left.textContent = ".children"
                button.right.textContent = "Element Inhalt"

                button.addEventListener("click", async () => {

                  if (child.children.length > 0) {

                    this.overlay("toolbox", overlay => {

                      overlay.info.append(this.convert("element/alias", child))
                      overlay.info.append(this.convert("text/span", ".children"))

                      const childrenContainer = this.create("div/scrollable", overlay)
                      this.render(event, child, childrenContainer)

                    })

                  } else alert("Das HTML Element ist leer.")

                })

              }

              if (child.tagName === "DIV") {

                const button = this.create("toolbox/left-right", buttons)
                button.left.textContent = ".div-creator"
                button.right.textContent = "Bearbeite dein Element schnell und einfach"
                button.onclick = () => {

                  this.overlay("toolbox", async overlay => {
                    overlay.registerHtmlButton.onclick = async () => {
                      await this.remove("element/selected-node", preview)
                      clone.removeAttribute("contenteditable")
                      child.replaceWith(clone.cloneNode(true))
                      this.add("register-html")
                    }

                    overlay.info.append(this.convert("element/alias", child))
                    overlay.info.append(this.convert("text/span", ".clone"))

                    const content = this.create("div", overlay)
                    content.style.height = "100vh"
                    content.style.touchAction = "manipulation"

                    const preview = document.createElement("div")
                    preview.style.height = `${window.innerHeight * 0.4}px`
                    preview.style.overflow = "auto"
                    content.append(preview)

                    const backgroundColor = child.parentElement.style.backgroundColor
                    if (!backgroundColor || backgroundColor === "transparent") {
                      preview.style.backgroundColor = "white"
                    } else {
                      preview.style.backgroundColor = backgroundColor
                    }

                    const clone = child.cloneNode(true)
                    clone.setAttribute("contenteditable", "true")
                    preview.append(clone)

                    let selectedNode = clone


                    preview.addEventListener("keydown", ev => {
                      if (ev.metaKey && ev.key === 'c') {
                        ev.preventDefault()
                        if (selectedNode) {
                          this.convert("text/clipboard", selectedNode.outerHTML).then(() => window.alert("Dein HTML Element wurde erfolgreich in die Zwischenablage gespeichert."))
                        }
                      }
                    })

                    preview.addEventListener("keydown", ev => {
                      if (ev.metaKey && ev.key === 'v') {
                        ev.preventDefault()
                        if (selectedNode) {
                          this.convert("clipboard/text").then(text => {
                            const node = this.convert("text/first-child", text)
                            selectedNode.append(node)
                          })
                        }
                      }
                    })

                    let rememberSelectedNodes = []
                    preview.addEventListener("keydown", ev => {
                      if (ev.metaKey && ev.key === 'Backspace') {
                        ev.preventDefault()
                        if (selectedNode) {
                          rememberSelectedNodes.push({ node: selectedNode, parent: selectedNode.parentElement, index: Array.from(selectedNode.parentElement.children).indexOf(selectedNode)})
                          selectedNode.remove()
                        }
                      }
                    })

                    preview.addEventListener("keydown", ev => {
                      if (ev.metaKey && ev.key === 'z') {
                        ev.preventDefault()
                        if (selectedNode) {
                          if (rememberSelectedNodes.length > 0) {
                            const { node, parent, index } = rememberSelectedNodes.pop()
                            const children = Array.from(parent.children)
                            if (index >= 0 && index < children.length) {
                              parent.insertBefore(node, children[index])
                            } else {
                              parent.appendChild(node)
                            }
                          }

                        }
                      }
                    })

                    selectedNode.onclick = async (ev) => {
                      ev.preventDefault()
                      ev.stopPropagation()
                      await this.remove("element/selected-node", preview)
                      selectedNode = clone
                      this.add("element/selected-node", selectedNode)
                    }

                    preview.onclick = async (ev) => {
                      ev.preventDefault()
                      ev.stopPropagation()
                      await this.remove("element/selected-node", preview)
                      selectedNode = clone
                    }

                    for (let i = 0; i < clone.children.length; i++) {
                      const cloneChild = clone.children[i]

                      this.add("event/dbltouch", {node: cloneChild, callback: async ev => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        await this.remove("element/selected-node", preview)
                        selectedNode = ev.target.parentElement
                        this.add("element/selected-node", selectedNode)
                      }})

                      cloneChild.ondblclick = async (ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()
                        await this.remove("element/selected-node", preview)
                        selectedNode = ev.target.parentElement
                        this.add("element/selected-node", selectedNode)
                      }

                      cloneChild.onclick = async (ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()

                        if (ev.target.hasAttribute("selected-node")) {
                          await this.remove("element/selected-node", preview)
                          selectedNode = clone
                          this.add("element/selected-node", selectedNode)
                        } else {
                          await this.remove("element/selected-node", preview)
                          selectedNode = ev.target
                          this.add("element/selected-node", selectedNode)
                        }

                      }

                    }

                    const observer = new MutationObserver((mutationsList) => {
                      mutationsList.forEach((mutation) => {
                        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {

                          mutation.addedNodes.forEach(async (node) => {

                            if (node.nodeType === Node.ELEMENT_NODE) {


                              this.add("event/dbltouch", {node: node, callback: async ev => {
                                ev.preventDefault()
                                ev.stopPropagation()
                                await this.remove("element/selected-node", preview)
                                selectedNode = ev.target.parentElement
                                this.add("element/selected-node", selectedNode)
                              }})

                              node.ondblclick = async (ev) => {
                                ev.preventDefault()
                                ev.stopPropagation()
                                await this.remove("element/selected-node", preview)
                                selectedNode = ev.target.parentElement
                                this.add("element/selected-node", selectedNode)
                              }

                              node.onclick = async (ev) => {
                                ev.preventDefault()
                                ev.stopPropagation()

                                if (ev.target.hasAttribute("selected-node")) {
                                  await this.remove("element/selected-node", preview)
                                  selectedNode = clone
                                  this.add("element/selected-node", selectedNode)
                                } else {
                                  await this.remove("element/selected-node", preview)
                                  selectedNode = ev.target
                                  this.add("element/selected-node", selectedNode)
                                }

                              }

                            }
                          })
                        }
                      })
                    })
                    observer.observe(selectedNode, { childList: true, subtree: true })

                    const buttons = this.fn("creator-buttons", {parent: content})

                    buttons.duckDuckGoButton.onclick = () => buttons.duckDuckGoButton.convertNode(selectedNode)
                    buttons.sourcesButton.onclick = () => buttons.openSourcesOverlay(selectedNode)
                    buttons.createFlexButton.onclick = () => buttons.createFlexWidthWithPrompt(selectedNode)
                    buttons.createGridButton.onclick = () => buttons.createGridMatrixWithPrompt(selectedNode)
                    buttons.rowContainerButton.onclick = () => buttons.createFlexRow(selectedNode)
                    buttons.columnContainerButton.onclick = () => buttons.createFlexColumn(selectedNode)
                    buttons.imageTextButton.onclick = () => buttons.createImageText(selectedNode)
                    buttons.keyValueButton.onclick = () => buttons.createKeyValue(selectedNode)
                    buttons.actionBtnButton.onclick = () => buttons.createActionButton(selectedNode)
                    buttons.horizontalHrButton.onclick = () => buttons.createHr(selectedNode)
                    buttons.simpleHeaderButton.onclick = () => buttons.createLeftImageHeader(selectedNode)
                    buttons.h1Button.onclick = () => buttons.createH1withPrompt(selectedNode)
                    buttons.h2Button.onclick = () => buttons.createH2withPrompt(selectedNode)
                    buttons.h3Button.onclick = () => buttons.createH3withPrompt(selectedNode)
                    buttons.pButton.onclick = () => buttons.createPwithPrompt(selectedNode)
                    buttons.imageButton.onclick = () => buttons.createImagePlaceholder(selectedNode)
                    buttons.tableHeaderButton.onclick = () => buttons.createTableWithMatrixPrompt(selectedNode)
                    buttons.pdfLinkButton.onclick = async () => await buttons.createPdfLinkWithPrompt(selectedNode)
                    buttons.aLinkButton.onclick = () => buttons.createAnchorWithPrompt(selectedNode)
                    buttons.spanButton.onclick = () => buttons.createSpanWithTextContent(selectedNode)
                    buttons.changeSiButton.onclick = () => buttons.createSpanWithSiPrompt(selectedNode)
                    buttons.addSpaceButton.onclick = () => buttons.createSpaceWithHeightPrompt(selectedNode)
                    buttons.arrowRightButton.onclick = () => buttons.createArrowRightWithColorPrompt(selectedNode)
                    buttons.divScrollableButton.onclick = () => buttons.createScrollableY(selectedNode)
                    buttons.packDivButton.onclick = () => buttons.createDivPackOuter(selectedNode)
                    buttons.textInputButton.onclick = () => buttons.createTextInput(selectedNode)
                    buttons.numberInputButton.onclick = () => buttons.createTelInput(selectedNode)
                    buttons.checkboxInputButton.onclick = () => buttons.createCheckboxInput(selectedNode)
                    buttons.passwordInputButton.onclick = () => buttons.createPasswordInput(selectedNode)
                    buttons.selectInputButton.onclick = () => buttons.createSelectInput(selectedNode)
                    buttons.growWidthButton.onclick = () => buttons.toggleStyle({key: "width", value: "100%", node: selectedNode})
                    buttons.maxWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "maxWidth", node: selectedNode, message: "Gebe die maximale Breite deines Elements ein: (z.B., 900px)"})
                    buttons.minWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "minWidth", node: selectedNode, message: "Gebe die minimale Breite deines Elements ein: (z.B., 300px)"})
                    buttons.exactWidthButton.onclick = () => buttons.setStyleWithPrompt({key: "width", node: selectedNode, message: "Gebe die exakte Breite deines Elements ein: (z.B., 350px)"})
                    buttons.increaseWidthButton.onclick = () => buttons.incrementStyle({key: "width", node: selectedNode, delta: 1})
                    buttons.decreaseWidthButton.onclick = () => buttons.decrementStyle({key: "width", node: selectedNode, delta: 1})
                    buttons.growHeightButton.onclick = () => buttons.toggleStyle({key: "height", value: "100%", node: selectedNode})
                    buttons.maxHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "maxHeight", node: selectedNode, message: "Gebe die maximale Höhe deines Elements ein: (z.B., 89vh)"})
                    buttons.minHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "minHeight", node: selectedNode, message: "Gebe die minimale Höhe deines Elements ein: (z.B., 21px)"})
                    buttons.exactHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "height", node: selectedNode, message: "Gebe die exakte Höhe deines Elements ein: (z.B., 21vh)"})
                    buttons.increaseHeightButton.onclick = () => buttons.incrementStyle({key: "height", node: selectedNode, delta: 1})
                    buttons.decreaseHeightButton.onclick = () => buttons.decrementStyle({key: "height", node: selectedNode, delta: 1})
                    buttons.exactDisplayButton.onclick = () => buttons.setStyleWithPrompt({key: "display", node: selectedNode, message: "Gebe den exakten Display Wert ein: (z.B., flex)"})
                    buttons.displayBlockButton.onclick = () => buttons.toggleStyle({key: "display", value: "block", node: selectedNode})
                    buttons.displayInlineButton.onclick = () => buttons.toggleStyle({key: "display", value: "inline", node: selectedNode})
                    buttons.toggleDisplayGridButton.onclick = () => buttons.toggleStyle({key: "display", value: "grid", node: selectedNode})
                    buttons.toggleDisplayFlexButton.onclick = () => buttons.toggleStyle({key: "display", value: "flex", node: selectedNode})
                    buttons.toggleDisplayTableButton.onclick = () => buttons.toggleStyle({key: "display", value: "table", node: selectedNode})
                    buttons.gridMobileButton.onclick = () => buttons.toggleStyles({styles: {display: "grid", gridTemplateColumns: "1fr", gridGap: "21px"}, node: selectedNode})
                    buttons.gridFullDisplayButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
                    buttons.gridTwoColumnsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr 1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
                    buttons.gridThreeColumnsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridGap: "21px"}, childrenStyle: {height: "89vh"}, node: selectedNode})
                    buttons.gridFixedButton.onclick = () => buttons.fixedGridPrompt({node: selectedNode})
                    buttons.gridListRowsButton.onclick = () => buttons.toggleNodeAndChildrenStyles({nodeStyle: {display: "grid", gridTemplateColumns: "89px 1fr", gridTemplateRows: `repeat(auto-fit, 55px)`, gridGap: "21px"}, childrenStyle: {height: "55px"}, node: selectedNode})
                    buttons.gridSpanColumnButton.onclick = () => buttons.spanColumnWithPrompt(selectedNode)
                    buttons.gridSpanRowButton.onclick = () => buttons.spanRowWithPrompt(selectedNode)
                    buttons.exactGridGapButton.onclick = () => buttons.setStyleWithPrompt({key: "gap", node: selectedNode, message: "Gebe den exakten Abstand zwischen deinen Grid Elementen ein: (z.B., 13px)"})
                    buttons.gridAddColumnButton.onclick = () => buttons.addGridColumn(selectedNode)
                    buttons.gridRemoveColumnButton.onclick = () => buttons.removeGridColumn(selectedNode)
                    buttons.gridAddRowButton.onclick = () => buttons.addGridRow(selectedNode)
                    buttons.gridRemoveRowButton.onclick = () => buttons.removeGridRow(selectedNode)
                    buttons.alignColumnButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexDirection: "column", flexWrap: null}, node: selectedNode})
                    buttons.alignLeftButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "flex-start"}, node: selectedNode})
                    buttons.alignCenterButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "center"}, node: selectedNode})
                    buttons.alignRightButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", justifyContent: "flex-end"}, node: selectedNode})
                    buttons.alignRowButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexDirection: null, flexWrap: "wrap"}, node: selectedNode})
                    buttons.alignTopButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "flex-start"}, node: selectedNode})
                    buttons.alignVerticalButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "center"}, node: selectedNode})
                    buttons.alignBottomButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", alignItems: "flex-end"}, node: selectedNode})
                    buttons.flexButton.onclick = () => buttons.setStyleWithPrompt({key: "flex", node: selectedNode, message: "Gebe die Flex Matrix für dein Element ein: (z.B., 1 1 55px)"})
                    buttons.spaceBetweenButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap", justifyContent: "space-between"}, node: selectedNode})
                    buttons.spaceAroundButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap", justifyContent: "space-around"}, node: selectedNode})
                    buttons.toggleWrapButton.onclick = () => buttons.toggleStyles({styles: {display: "flex", flexWrap: "wrap"}, node: selectedNode})
                    const onLayerClick = async layer => {
                      await this.remove("element/selected-node", preview)
                      selectedNode = layer
                      this.add("selected/node", layer)
                    }
                    buttons.layerButton.onclick = () => buttons.openLayerOverlay(onLayerClick, selectedNode)
                    buttons.positiveLayerButton.onclick = () => buttons.addLayerAbove(selectedNode)
                    buttons.negativeLayerButton.onclick = () => buttons.addLayerBelow(selectedNode)
                    buttons.exactLayerButton.onclick = async () => buttons.addLayerPrompt(selectedNode)
                    buttons.removeLayerButton.onclick = () => buttons.removeAllLayer(selectedNode)
                    buttons.positionAbsoluteButton.onclick = () => buttons.toggleStyle({key: "position", value: "absolute", node: selectedNode})
                    buttons.positionTopButton.onclick = () => buttons.setStyleWithPrompt({key: "top", node: selectedNode, message: "Geben den exakten Abstand nach oben ein: (z.B., 300px)"})
                    buttons.positionRightButton.onclick = () => buttons.setStyleWithPrompt({key: "right", node: selectedNode, message: "Geben den exakten Abstand nach rechts ein: (z.B., 300px)"})
                    buttons.positionBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "bottom", node: selectedNode, message: "Geben den exakten Abstand nach unten ein: (z.B., 300px)"})
                    buttons.positionLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "left", node: selectedNode, message: "Geben den exakten Abstand nach links ein: (z.B., 300px)"})
                    buttons.transformTranslateButton.onclick = () => buttons.translateWithPrompt(selectedNode)
                    buttons.transformTranslateXButton.onclick = () => buttons.translateXWithPrompt(selectedNode)
                    buttons.transformTranslateYButton.onclick = () => buttons.translateYWithPrompt(selectedNode)
                    buttons.zIndexButton.onclick = () => buttons.setStyleWithPrompt({key: "zIndex", node: selectedNode, message: "Gebe deinen Z-Index ein: (z.B., -1)"})
                    buttons.scaleButton.onclick = () => buttons.scaleWithPrompt(selectedNode)
                    buttons.rotateRightButton.onclick = () => buttons.rotateNode({degree: 90, node: selectedNode})
                    buttons.exactRotateRightButton.onclick = () => buttons.rotateNodeRightWithPrompt(selectedNode)
                    buttons.rotateLeftButton.onclick = () => buttons.rotateNode({degree: -90, node: selectedNode})
                    buttons.exactRotateLeftButton.onclick = () => buttons.rotateNodeLeftWithPrompt(selectedNode)
                    buttons.whiteSpaceNoWrapButton.onclick = () => buttons.toggleStyle({key: "whiteSpace", value: "nowrap", node: selectedNode})
                    buttons.fontFamilyButton.onclick = () => buttons.toggleStyle({key: "fontFamily", value: "sans-serif", node: selectedNode})
                    buttons.fontWeightNormalButton.onclick = () => buttons.toggleStyle({key: "fontWeight", value: "normal", node: selectedNode})
                    buttons.fontWeightButton.onclick = () => buttons.toggleStyle({key: "fontWeight", value: "bold", node: selectedNode})
                    buttons.fontStyleButton.onclick = () => buttons.toggleStyle({key: "fontStyle", value: "italic", node: selectedNode})
                    buttons.textDecorationButton.onclick = () => buttons.toggleStyle({key: "textDecoration", value: "underline", node: selectedNode})
                    buttons.fontSizeButton.onclick = () => buttons.setStyleWithPrompt({key: "fontSize", node: selectedNode, message: "Gebe deine Schriftgröße ein: (z.B., 34px)"})
                    buttons.fontColorButton.onclick = () => buttons.setStyleWithPrompt({key: "color", node: selectedNode, message: "Gebe deine Schriftfarbe ein: (z.B., (#888, grey, rgb(88, 88, 88), rgba(0, 0, 0, 0.5)))"})
                    buttons.fontColorButton.onclick = () => buttons.setStyleWithPrompt({key: "backgroundColor", node: selectedNode, message: "Gebe deine Hintergrundfarbe ein: (z.B., (#888, grey, rgb(88, 88, 88), rgba(0, 0, 0, 0.5)))"})
                    buttons.unorderedListButton.onclick = () => buttons.appendUnorderedListItem(selectedNode)
                    buttons.orderedListButton.onclick = () => buttons.appendOrderedListItem(selectedNode)
                    buttons.lineHeightButton.onclick = () => buttons.setStyleWithPrompt({key: "lineHeight", node: selectedNode, message: "Gebe die exakte Linien Höhe ein: (z.B., 1.8)"})
                    buttons.overflowYButton.onclick = () => buttons.toggleStyle({key: "overflowY", value: "auto", node: selectedNode})
                    buttons.overflowXButton.onclick = () => buttons.toggleStyle({key: "overflowX", value: "auto", node: selectedNode})
                    buttons.toggleDisplayNoneButton.onclick = () => buttons.toggleStyle({key: "display", value: "none", node: selectedNode})
                    buttons.toggleVisibilityHiddenButton.onclick = () => buttons.toggleStyle({key: "visibility", value: "hidden", node: selectedNode})
                    buttons.exactOpacityButton.onclick = () => buttons.addOpacityWithPrompt(selectedNode)
                    buttons.toggleMarginButton.onclick = () => buttons.toggleStyle({key: "margin", value: "21px 34px", node: selectedNode})
                    buttons.toggleMarginTopButton.onclick = () => buttons.toggleStyle({key: "marginTop", value: "21px", node: selectedNode})
                    buttons.toggleMarginRightButton.onclick = () => buttons.toggleStyle({key: "marginRight", value: "34px", node: selectedNode})
                    buttons.toggleMarginTopButton.onclick = () => buttons.toggleStyle({key: "marginBottom", value: "21px", node: selectedNode})
                    buttons.toggleMarginLeftButton.onclick = () => buttons.toggleStyle({key: "marginLeft", value: "34px", node: selectedNode})
                    buttons.exactMarginButton.onclick = () => buttons.setStyleWithPrompt({key: "margin", node: selectedNode, message: "Gebe den exakten Außenabstand ein: (z.B., 21px 34px 13px 144px)"})
                    buttons.exactMarginTopButton.onclick = () => buttons.setStyleWithPrompt({key: "marginTop", node: selectedNode, message: "Gebe den exakten Außenabstand nach oben ein: (z.B., 21px)"})
                    buttons.exactMarginRightButton.onclick = () => buttons.setStyleWithPrompt({key: "marginRight", node: selectedNode, message: "Gebe den exakten Außenabstand nach rechts ein: (z.B., 21px)"})
                    buttons.exactMarginBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "marginRight", node: selectedNode, message: "Gebe den exakten Außenabstand nach unten ein: (z.B., 21px)"})
                    buttons.exactMarginLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "marginLeft", node: selectedNode, message: "Gebe den exakten Außenabstand nach links ein: (z.B., 21px)"})
                    buttons.togglePaddingButton.onclick = () => buttons.toggleStyle({key: "padding", value: "21px 34px", node: selectedNode})
                    buttons.togglePaddingTopButton.onclick = () => buttons.toggleStyle({key: "paddingTop", value: "21px", node: selectedNode})
                    buttons.togglePaddingRightButton.onclick = () => buttons.toggleStyle({key: "paddingRight", value: "34px", node: selectedNode})
                    buttons.togglePaddingBottomButton.onclick = () => buttons.toggleStyle({key: "paddingBottom", value: "21px", node: selectedNode})
                    buttons.togglePaddingLeftButton.onclick = () => buttons.toggleStyle({key: "paddingLeft", value: "34px", node: selectedNode})
                    buttons.exactPaddingButton.onclick = () => buttons.setStyleWithPrompt({key: "padding", node: selectedNode, message: "Gebe den exakten Innenabstand ein: (z.B., 21px 34px 13px 144px)"})
                    buttons.exactPaddingTopButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingTop", node: selectedNode, message: "Gebe den exakten Innenabstand nach oben ein: (z.B., 21px)"})
                    buttons.exactPaddingRightButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingRight", node: selectedNode, message: "Gebe den exakten Innenabstand nach rechts ein: (z.B., 21px)"})
                    buttons.exactPaddingBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingRight", node: selectedNode, message: "Gebe den exakten Innenabstand nach unten ein: (z.B., 21px)"})
                    buttons.exactPaddingLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "paddingLeft", node: selectedNode, message: "Gebe den exakten Innenabstand nach links ein: (z.B., 21px)"})
                    buttons.toggleBorderButton.onclick = () => buttons.toggleStyle({key: "border", value: "1px solid black", node: selectedNode})
                    buttons.toggleBorderTopButton.onclick = () => buttons.toggleStyle({key: "borderTop", value: "1px solid black", node: selectedNode})
                    buttons.toggleBorderRightButton.onclick = () => buttons.toggleStyle({key: "borderTop", value: "1px solid black", node: selectedNode})
                    buttons.toggleBorderBottomButton.onclick = () => buttons.toggleStyle({key: "borderBottom", value: "1px solid black", node: selectedNode})
                    buttons.toggleBorderLeftButton.onclick = () => buttons.toggleStyle({key: "borderLeft", value: "1px solid black", node: selectedNode})
                    buttons.exactBorderButton.onclick = () => buttons.setStyleWithPrompt({key: "border", node: selectedNode, message: "Gebe die exakten Grenzlinien ein: (z.B., 3px solid red)"})
                    buttons.exactBorderTopButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTop", node: selectedNode, message: "Gebe die exakten Grenzlinien nach oben ein: (z.B., 3px solid red)"})
                    buttons.exactBorderRightButton.onclick = () => buttons.setStyleWithPrompt({key: "borderRight", node: selectedNode, message: "Gebe die exakten Grenzlinien nach rechts ein: (z.B., 3px solid red)"})
                    buttons.exactBorderBottomButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottom", node: selectedNode, message: "Gebe die exakten Grenzlinien nach unten ein: (z.B., 3px solid red)"})
                    buttons.exactBorderLeftButton.onclick = () => buttons.setStyleWithPrompt({key: "borderLeft", node: selectedNode, message: "Gebe die exakten Grenzlinien nach links ein: (z.B., 3px solid red)"})
                    buttons.toggleBorderRadiusButton.onclick = () => buttons.toggleStyle({key: "borderRadius", value: "3px", node: selectedNode})
                    buttons.toggleBorderTopLeftRadiusButton.onclick = () => buttons.toggleStyle({key: "borderTopLeftRadius", value: "3px", node: selectedNode})
                    buttons.toggleBorderTopRightRadiusButton.onclick = () => buttons.toggleStyle({key: "borderTopRightRadius", value: "3px", node: selectedNode})
                    buttons.toggleBorderBottomRightRadiusButton.onclick = () => buttons.toggleStyle({key: "borderBottomRightRadius", value: "3px", node: selectedNode})
                    buttons.toggleBorderBottomLeftRadiusButton.onclick = () => buttons.toggleStyle({key: "borderBottomLeftRadius", value: "3px", node: selectedNode})
                    buttons.exactBorderRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderRadius", node: selectedNode, message: "Gebe den exakten Radius, für alle Ecken, ein: (z.B. 13px)"})
                    buttons.exactBorderTopLeftRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTopLeftRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Oben-Links, ein: (z.B., 13px)"})
                    buttons.exactBorderTopRightRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderTopRightRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Oben-Rechts, ein: (z.B., 13px)"})
                    buttons.exactBorderBottomLeftRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottomRightRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Unten-Links, ein: (z.B., 13px)"})
                    buttons.exactBorderBottomRightRadiusButton.onclick = () => buttons.setStyleWithPrompt({key: "borderBottomLeftRadius", node: selectedNode, message: "Gebe den exakten Radius, für die Ecke Unten-Rechts, ein: (z.B., 13px)"})
                    buttons.toggleBorderNoneButton.onclick = () => buttons.toggleStyle({key: "border", value: "none", node: selectedNode})
                    buttons.boxButton.onclick = () => buttons.toggleStyles({styles: {margin: "21px 34px", padding: "8px", borderRadius: "3px", boxShadow: "rgba(0, 0, 0, 0.13) 0px 1px 3px"}, node: selectedNode})
                    buttons.exactBoxShadowButton.onclick = () => buttons.setStyleWithPrompt({key: "boxShadow", node: selectedNode, message: "Geben den exakten Schatten ein: (z.B., rgba(0, 0, 0, 0.13) 0px 1px 3px)"})
                    buttons.mediaQueriesOverviewButton.onclick = () => buttons.openMediaQueriesOverlay()
                    buttons.largeDeviceButton.onclick = () => buttons.addLargeStyle(selectedNode)
                    buttons.middleDeviceButton.onclick = () => buttons.addMiddleStyle(selectedNode)
                    buttons.smallDeviceButton.onclick = () => buttons.addSmallStyle(selectedNode)
                    buttons.printerDeviceButton.onclick = () => buttons.addPrinterStyle(selectedNode)

                    let rememberCuttedNodes = []
                    buttons.insertAfterButton.onclick =  () => buttons.insertAfter(selectedNode, rememberCuttedNodes)
                    buttons.insertBeforeButton.onclick =  () => buttons.insertBefore(selectedNode, rememberCuttedNodes)
                    buttons.insertLeftButton.onclick =  () => buttons.insertLeft(selectedNode, rememberCuttedNodes)
                    buttons.insertRightButton.onclick =  () => buttons.insertRight(selectedNode, rememberCuttedNodes)
                    buttons.cutOuterHtmlButton.onclick = () => {
                      if (selectedNode) {
                        rememberCuttedNodes.push({ node: selectedNode, parent: selectedNode.parentElement, index: this.convert("node/index", selectedNode)})
                        selectedNode.remove()
                      }
                    }
                    buttons.copyOuterHtmlButton.onclick = () => buttons.addOuterHtmlToClipboard(selectedNode)
                    buttons.pasteOuterHtmlButton.onclick = () => buttons.appendClipboardToNode(selectedNode)
                    buttons.copyStyleButton.onclick = () => buttons.addStyleToClipboard(selectedNode)
                    buttons.pasteStyleButton.onclick = () => buttons.addClipboardToStyle(selectedNode)
                    buttons.removeStyleButton.onclick = () => buttons.toggleAttribute("style", selectedNode)
                    buttons.removeInnerButton.onclick = () => buttons.toggleInnerHtml(selectedNode)
                    buttons.removeInnerWithTextButton.onclick = async () => await buttons.replaceInnerHtmlWithPrompt(selectedNode)
                    buttons.removeNodeButton.onclick = () => buttons.toggleNode(selectedNode)
                    buttons.idButton.onclick = () => buttons.setIdWithPrompt(selectedNode)
                    buttons.addClassButton.onclick = () => buttons.setClassWithPrompt(selectedNode)
                    buttons.setAttributeButton.onclick = () => buttons.setAttributeWithPrompt(selectedNode)
                    buttons.appendStyleButton.onclick = () => buttons.appendStyleWithPrompt(selectedNode)
                    buttons.fontSizeForEachChildButton.onclick = () => buttons.setChildrenStyleWithPrompt("fontSize", selectedNode, "Gebe die Schriftgrüße für alle Kind Elemente: (z.B., 21px)")
                    buttons.templatesButton.onclick = () => buttons.openTemplatesOverlay(selectedNode)
                    buttons.addScriptButton.onclick = () => buttons.openScriptsOverlay()

                    const svgIconsFragment = await buttons.svgIcons.appendSvgIconsFragment(buttons.svgPickerOptions, (button) => {
                      selectedNode.appendChild(button.querySelector(".icon").cloneNode(true))
                    })

                  })

                }

              }

              if (child.tagName === "BODY") {

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".scripts"
                  button.right.textContent = "Nutze geprüfte HTML Skripte"
                  button.onclick = () => {

                    this.overlay("toolbox", async overlay => {
                      overlay.info.textContent = ".scripts"
                      const content = this.create("info/loading", overlay)
                      const res = await this.request("/get/scripts/toolbox/")
                      if (res.status === 200) {
                        const scripts = JSON.parse(res.response)
                        await this.render("toolbox-scripts", scripts, content)
                      } else {
                        const res = await this.request("/get/scripts/writable/")
                        if (res.status === 200) {
                          const scripts = JSON.parse(res.response)
                          await this.render("toolbox-scripts", scripts, content)
                        } else {
                          this.convert("parent/info", content)
                          content.textContent = "Keine Skripte gefunden"
                          this.style(content, {margin: "21px 34px"})
                        }
                      }
                    })

                  }
                }

                {

                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".match-maker"
                  button.right.textContent = "Match Maker Skripte anhängen"
                  button.onclick = () => {
                    this.overlay("toolbox", async overlay => {
                      overlay.info.textContent = ".match-maker"

                      const content = this.create("info/loading", overlay)

                      const res = await this.request("/get/platform/match-maker-location-expert/")

                      if (res.status === 200) {
                        const matchMaker = JSON.parse(res.response)

                        this.convert("parent/scrollable", content)

                        this.render("match-maker/buttons", matchMaker, content)
                      }

                      if (res.status !== 200) {
                        const res = await this.request("/get/platform/match-maker-location-writable/")

                        if (res.status === 200) {
                          const matchMaker = JSON.parse(res.response)

                          this.convert("parent/scrollable", content)

                          this.render("match-maker/buttons", matchMaker, content)
                        }

                        if (res.status !== 200) {
                          this.convert("parent/info", content)
                          content.textContent = "Es wurden keine Match Maker gefunden."
                          throw new Error("match maker not found")
                        }
                      }


                    })
                  }

                }

                {

                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".role-apps"
                  button.right.textContent = "Rollenapps Freigabe Button anhängen"
                  button.addEventListener("click", () => {

                    this.overlay("toolbox", async overlay => {
                      this.render("text/title", "Für welche Rolle möchtest du den Button anhängen?", overlay)

                      const content = this.create("info/loading", overlay)

                      const res = await this.request("/get/platform/roles-location-expert/")

                      if (res.status === 200) {
                        const roles = JSON.parse(res.response)

                        this.convert("parent/scrollable", content)

                        for (let i = 0; i < roles.length; i++) {
                          const role = roles[i]

                          this.render("role/role-apps-button-onbody", role, content)

                        }
                      }

                      if (res.status !== 200) {
                        const res = await this.request("/get/platform/roles-location-writable/")

                        if (res.status === 200) {
                          const roles = JSON.parse(res.response)

                          this.convert("parent/scrollable", content)

                          for (let i = 0; i < roles.length; i++) {
                            const role = roles[i]

                            this.render("role/role-apps-button-onbody", role, content)

                          }

                        }

                        if (res.status !== 200) {
                          this.convert("parent/info", content)
                          content.textContent = "Keine Rollen gefunden."
                        }
                      }


                    })
                  })

                }

                {

                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".script"
                  button.right.textContent = "JavaScript anhängen"
                  button.onclick = () => {
                    this.overlay("toolbox", overlay => {
                      const funnel = this.create("div/scrollable", overlay)
                      const nameField = this.create("field/id", funnel)
                      const jsField = this.create("field/js", funnel)
                      jsField.label.textContent = "JavaScript Browser Funktionen + Plattform Helper Funktionen"
                      jsField.input.oninput = () => this.verify("input/value", jsField.input)
                      this.verifyIs("field-funnel/valid", funnel)
                      const submit = this.create("button/action", funnel)
                      submit.textContent = "Skript jetzt anhängen"
                      submit.onclick = async () => {
                        await this.verify("field-funnel", funnel)
                        const script = this.create("script", {id: nameField.input.value, js: jsField.input.value})
                        if (!this.verifyIs("id/unique", script.id)) {
                          this.add("style/node/not-valid", nameField.input)
                        }
                        this.add("id-onbody", script)
                      }
                    })
                  }
                }

                {

                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".soundbox"
                  button.right.textContent = "Speicher deine Lieblingslieder direkt als Quell-URL"
                  button.onclick = () => {
                    try {

                      this.create("soundbox", document.body)

                      window.alert("Soundbox erfolgreich angehängt.")

                    } catch (error) {
                      window.alert("Fehler.. Bitte wiederholen.\n\nMehr Infos findest du in der Browser Konsole unter den Entwickler Tools. mac(cmd + opt + c)")
                      console.error(error)
                    }
                  }

                }

                {

                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".style"
                  button.right.textContent = "CSS Import"
                  button.addEventListener("click", () => {

                    this.overlay("toolbox", overlay => {
                      overlay.info.append(this.convert("element/alias", child))
                      overlay.info.append(this.convert("text/span", ".style"))

                      const content = this.create("div/scrollable", overlay)

                      const cssField = this.create("field/textarea", content)
                      cssField.label.textContent = "CSS Eigenschaften"
                      cssField.input.style.height = "55vh"
                      cssField.input.style.fontFamily = "monospace"
                      cssField.input.style.fontSize = "13px"
                      cssField.input.placeholder = "color: blue;\nborder: 1px solid black;\n\n  ..\n\nkey: value;"

                      if (child.hasAttribute("style")) {
                        cssField.input.value = this.convert("styles/text", child)
                      }

                      this.verify("input/value", cssField.input)

                      cssField.input.oninput = async () => {

                        await this.verify("input/value", cssField.input)

                        const css = cssField.input.value

                        if (this.verifyIs("text/empty", css)) {
                          child.removeAttribute("style")
                        } else {
                          child.setAttribute("style", css)
                        }


                      }

                    })
                  })

                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".innerHTML"
                  button.right.textContent = "Body Inhalt ersetzen"
                  button.onclick = async () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.append(this.convert("element/alias", document.body))
                      overlay.info.append(this.convert("text/span", ".innerHTML"))
                      const funnel = this.create("div/scrollable", overlay)
                      const htmlField = this.create("field/textarea", funnel)
                      htmlField.label.textContent = "Body Inhalt"
                      htmlField.input.style.height = "55vh"
                      htmlField.input.style.fontFamily = "monospace"
                      htmlField.input.style.fontSize = "13px"
                      htmlField.input.placeholder = "<body>..</body>"
                      htmlField.input.value = child.textContent
                      this.verify("input/value", htmlField.input)
                      const submit = this.create("button/action", funnel)
                      submit.textContent = "Inhalte jetzt ersetzen"
                      submit.onclick = async () => {
                        await this.verify("input/value", htmlField.input)
                        child.innerHTML = await Helper.convert("text/purified", htmlField.input.value)
                        await this.remove("toolbox", child)
                        await this.add("script/toolbox-getter")
                        overlay.remove()
                      }
                    })
                  }
                }
                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".html-feedback"
                  button.right.textContent = "Lass dir Feedback für deine Werteinheiten geben"
                  button.onclick = () => {
                    const script = this.create("script", {id: "html-feedback", js: 'Helper.add("html-feedback")'})
                    this.add("script-onbody", script)
                    window.alert("Feedback Taste wurde erfolgreich angehängt.")
                  }

                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".back-button"
                  button.right.textContent = "Hänge eine Zurück Taste an"
                  button.onclick = () => {
                    const script = this.create("script", {id: "back-button", js: 'Helper.create("back-button", document.body)'})
                    this.add("script-onbody", script)
                    window.alert("Zurück Taste wurde erfolgreich angehängt.")
                  }
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".contact-location-expert"
                  button.right.textContent = "Nutzer dürfen dir Kontaktanfragen per E-Mail senden"
                  button.onclick = () => {
                    const script = this.create("script/contact-location-expert")
                    const exist = document.getElementById(script.id)
                    if (exist === null) {
                      document.body.append(script)
                    } else {
                      exist.remove()
                      document.body.append(script)
                    }
                    window.alert("Skript erfolgreich angehängt.")
                  }
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".html-creator"
                  button.right.textContent = "Erlaube Nutzer deine Werteinheit zu bearbeiten"
                  button.onclick = async () => {
                    const script = this.create("script", {id: "html-creator", js: `await Helper.add("html-creator")`})
                    this.add("script-onbody", script)
                    window.alert("HTML Creator wurde erfolgreich angehängt.")
                  }
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".location-list-funnel-button"
                  button.right.textContent = "Definiere Listen, mit der sich deine Nutzer selber markieren können"
                  button.onclick = () => {

                    this.overlay("toolbox", async overlay => {

                      const funnel = this.create("div/scrollable", overlay)

                      const pathField = await this.create("field/open-expert-values-path-select", funnel)

                      const submitButton = this.create("button/action", funnel)
                      submitButton.textContent = "Button jetzt anhängen"
                      submitButton.onclick = async () => {

                        const fieldFunnel = await this.convert("path/field-funnel", pathField.input.value)

                        const map = {}
                        map.tag = fieldFunnel.id
                        map.path = pathField.input.value

                        const script = this.create("script/open-popup-list-mirror-event", map)

                        this.add("script-onbody", script)

                        const button = this.create("button/image-text", document.body)
                        button.text.textContent = this.convert("text/capital-first-letter", map.tag)
                        button.id = `${map.tag}-mirror-button`
                        overlay.remove()
                        window.alert("Location List Funnel Button wurde erfolgreich angehängt.")
                      }

                    })

                  }

                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".users-trees-open"
                  button.right.textContent = "Hol dir eine Liste mit Nutzern"
                  button.onclick = () => {
                    this.overlay("toolbox", overlay => {
                      const funnel = this.create("div/scrollable", overlay)
                      createIdTreesFunnel(funnel)
                      funnel.submit.onclick = async () => {
                        await this.verify("field-funnel", funnel)
                        const script = this.create("script", {id: funnel.idField.input.value, js: `await Helper.render("users-trees-open", ${funnel.treesField.input.value}, ".${funnel.idField.input.value}")`})
                        if (!this.verifyIs("id/unique", script.id)) {
                          this.add("style/node/not-valid", funnel.idField.input)
                        }
                        this.add("id-onbody", script)
                      }
                    })
                  }
                }

                function createIdTreesFunnel(node) {
                  const fragment = document.createDocumentFragment()
                  node.idField = Helper.create("field/tag", fragment)
                  node.idField.label.textContent = "Vordefiniertes Design mit einer Id finden"
                  node.idField.input.placeholder = "meine-element"
                  Helper.add("outline-hover", node.idField.input)
                  Helper.verify("input/value", node.idField.input)
                  node.idField.input.oninput = () => Helper.verify("input/value", node.idField.input)
                  node.treesField = Helper.create("field/trees", fragment)
                  node.treesField.label.textContent = "Liste mit Datenstrukturen eingeben"
                  node.treesField.input.placeholder = `[\n  "getyour.expert.name",\n  "platform.company.name",\n  "email"\n]`
                  node.treesField.input.style.height = "144px"
                  Helper.add("outline-hover", node.treesField.input)
                  Helper.verify("input/value", node.treesField.input)
                  node.treesField.input.oninput = () => Helper.verify("input/value", node.treesField.input)
                  node.submit = Helper.create("toolbox/action", fragment)
                  node.submit.textContent = "Skript jetzt anhängen"
                  node?.appendChild(fragment)
                  return node
                }


                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".user-trees-closed"
                  button.right.textContent = "Hol dir Datensätze vom Nutzer"
                  button.onclick = () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.textContent = "script.user-trees-closed"
                      const funnel = this.create("div/scrollable", overlay)
                      createIdTreesFunnel(funnel)
                      funnel.submit.onclick = async () => {
                        await this.verify("field-funnel", funnel)
                        const script = this.create("script", {id: funnel.idField.input.value, js: `await Helper.render("user-trees-closed", ${funnel.treesField.input.value}, ".${funnel.idField.input.value}")`})
                        if (!this.verifyIs("id/unique", script.id)) {
                          this.add("style/node/not-valid", funnel.idField.input)
                        }
                        this.add("id-onbody", script)
                      }
                    })
                  }
                }

              }

              if (child.tagName === "SCRIPT") {
                {
                  const button = this.create("toolbox/left-right", buttons)
                  this.render("left-right/disable-script-local", {script: child, ok: () => {
                    this.render("left-right/local-script-toggle", child.id, childrenButton)
                    overlay.remove()
                  }}, button)

                  const scripts = JSON.parse(window.localStorage.getItem("scripts")) || []
                  for (let i = 0; i < scripts.length; i++) {
                    const script = scripts[i]
                    if (script.id === child.id) {
                      if (script.disabled) {
                        this.render("left-right/enable-script-local", {script: child, ok: () => {
                          this.render("left-right/local-script-toggle", child.id, childrenButton)
                          overlay.remove()
                        }}, button)
                      }
                    }
                  }
                }
              }

              if (child.tagName === "HEAD") {

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".title"
                  button.right.textContent = "Dokument Titel definieren"
                  button.onclick = async () => {

                    this.overlay("toolbox", async overlay => {
                      overlay.info.textContent = `<${this.convert("node/selector", child)}.title`
                      const funnel = this.create("div/scrollable", overlay)
                      const titleField = this.create("field/text", funnel)
                      titleField.label.textContent = "Dokument Titel"
                      titleField.input.placeholder = "Meine Werteinheit"
                      titleField.input.setAttribute("required", "true")
                      this.add("outline-hover", titleField.input)
                      this.verify("input/value", titleField.input)
                      titleField.input.oninput = () => this.verify("input/value", titleField.input)
                      const submit = this.create("toolbox/action", funnel)
                      submit.textContent = "Titel jetzt speichern"
                      submit.onclick = async () => {
                        await this.verify("input/value", titleField.input)
                        const title = titleField.input.value
                        const titleTag = document.head.querySelector("title")
                        if (titleTag) {
                          titleTag.textContent = title
                        } else {
                          const newTitle = document.createElement("title")
                          newTitle.textContent = title
                          document.head.appendChild(newTitle)
                        }
                        window.alert("Dein Titel wurde erfolgreich aktualisiert.")
                      }
                    })
                  }
                }
                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".style"
                  button.right.textContent = "Design als Style Tag anhängen"
                  button.onclick = () => {

                    this.overlay("toolbox", overlay => {
                      overlay.info.textContent = `<${this.convert("node/selector", child)}.style`
                      const funnel = this.create("div/scrollable", overlay)
                      const cssField = this.create("field/textarea", funnel)
                      cssField.label.textContent = "CSS Import"
                      cssField.input.placeholder = `.class {..}`
                      cssField.input.style.fontFamily = "monospace"
                      cssField.input.style.fontSize = "13px"
                      cssField.input.style.height = "55vh"
                      cssField.input.setAttribute("required", "true")
                      cssField.input.oninput = () => this.verify("input/value", cssField.input)
                      this.add("outline-hover", cssField.input)
                      this.verify("input/value", cssField.input)
                      const submit = this.create("toolbox/action", funnel)
                      submit.textContent = "Style jetzt anhängen"
                      submit.onclick = async () => {
                        await this.verify("input/value", cssField.input)
                        const style = document.createElement("style")
                        style.textContent = cssField.input.value
                        child.appendChild(style)
                        overlay.remove()
                        window.alert(`'${style.tagName}' wurde erfolgreich in '${child.tagName}' angehängt.`)
                      }
                    })
                  }
                }

              }

              {
                const button = this.create("toolbox/left-right", buttons)
                button.left.textContent = ".html"
                button.right.textContent = "HTML anhängen"
                button.onclick = () => {

                  this.overlay("toolbox", overlay => {
                    overlay.info.textContent = `<${this.convert("node/selector", child)}.html`
                    const funnel = this.create("div/scrollable", overlay)
                    const field = this.create("field/textarea", funnel)
                    field.label.textContent = "HTML Text"
                    field.input.placeholder = `<div>..</div>`
                    field.input.style.fontSize = "13px"
                    field.input.style.fontFamily = `monospace`
                    field.input.style.height = "55vh"
                    field.input.setAttribute("required", "true")
                    this.add("outline-hover", field.input)
                    this.verify("input/value", field.input)
                    field.input.oninput = () => this.verify("input/value", field.input)
                    const submit = this.create("toolbox/action", funnel)
                    submit.textContent = "HTML jetzt anhängen"
                    submit.onclick = async () => {
                      await this.verify("input/value", field.input)
                      const text = field.input.value
                      const nodes = this.convert("text/child-nodes", text)
                      for (let i = 0; i < nodes.length; i++) {
                        const node = nodes[i]
                        child.appendChild(node)
                      }
                      window.alert(`Dein HTML wurde erfolgreich in '${child.tagName}' angehängt.`)
                    }
                  })
                }
              }

              {
                const button = this.create("toolbox/left-right", buttons)
                button.left.textContent = ".id"
                button.right.textContent = "Element Id definieren"
                button.onclick = async () => {

                  this.overlay("toolbox", async overlay => {
                    overlay.info.textContent = `<${this.convert("node/selector", child)}.id`
                    const idField = this.create("field/text", overlay)
                    idField.label.textContent = "Identifikationsname (text/tag)"
                    idField.input.setAttribute("accept", "text/tag")
                    idField.input.placeholder = "meine-id"
                    if (child.hasAttribute("id")) {
                      idField.input.value = child.getAttribute("id")
                    }
                    this.add("outline-hover", idField.input)
                    this.verify("input/value", idField.input)
                    idField.input.oninput = async () => {
                      await this.verify("input/value", idField.input)
                      const value = idField.input.value
                      if (this.verifyIs("text/empty", value)) {
                        child.removeAttribute("id")
                      } else {
                        if (!document.getElementById(value)) {
                          child.setAttribute("id", value)
                        } else {
                          this.add("style/node/not-valid", idField.input)
                        }
                      }
                      overlay.info.textContent = `<${this.convert("node/selector", child)}.id`
                      this.render(event, input, parent)
                    }
                  })



                }
              }

              {
                const button = this.create("toolbox/left-right", buttons)
                button.left.textContent = ".class"
                button.right.textContent = "Element Klassen definieren"
                button.onclick = () => {

                  this.overlay("toolbox", overlay => {
                    overlay.info.textContent = `<${this.convert("node/selector", child)}.class`
                    const classField = this.create("field/textarea", overlay)
                    classField.label.textContent = "Klassen Namen"
                    classField.input.placeholder = "mehrere klassen werden mit einem leerzeichen getrennt"
                    classField.input.style.fontFamily = "monospace"
                    classField.input.style.height = "55vh"
                    if (child.hasAttribute("class")) {
                      classField.input.value = child.getAttribute("class")
                    }
                    this.add("outline-hover", classField.input)
                    this.verify("input/value", classField.input)
                    classField.input.oninput = () => {
                      const value = classField.input.value
                      if (this.verifyIs("text/empty", value)) {
                        child.removeAttribute("class")
                      } else {
                        child.setAttribute("class", value)
                      }
                      overlay.info.textContent = `<${this.convert("node/selector", child)}.class`
                      this.render(event, input, parent)
                    }
                  })
                }
              }

              if (!["SCRIPT", "BODY", "HEAD"].includes(child.tagName)) {

                const button = this.create("toolbox/left-right", buttons)
                button.left.textContent = ".style"
                button.right.textContent = "CSS Import mit Vorschau bearbeiten"
                button.onclick = () => {

                  this.overlay("toolbox", overlay => {
                    overlay.info.textContent = `<${this.convert("node/selector", child)}.style`
                    const content = this.create("div/scrollable", overlay)
                    const preview = document.createElement("div")
                    preview.style.height = `${window.innerHeight * 0.4}px`
                    preview.style.overflow = "auto"
                    const clone = child.cloneNode(true)
                    clone.id = Date.now()
                    clone.name = `${Date.now()}`
                    preview.append(clone)
                    content.append(preview)
                    this.render("text/hr", "Vorschau", content)
                    const cssField = this.create("field/textarea", content)
                    cssField.label.textContent = "CSS Eigenschaften"
                    cssField.input.style.height = "233px"
                    cssField.input.style.fontFamily = "monospace"
                    cssField.input.style.fontSize = "13px"
                    cssField.input.placeholder = "color: blue;\nborder: 1px solid black;\n\n  ..\n\nkey: value;"
                    this.add("outline-hover", cssField.input)
                    if (child.hasAttribute("style")) {
                      cssField.input.value = this.convert("styles/text", child)
                    }
                    this.verify("input/value", cssField.input)
                    cssField.input.oninput = () => {
                      const css = cssField.input.value
                      clone.setAttribute("style", css)
                      child.setAttribute("style", css)
                    }
                  })
                }

              }

              if (child.tagName !== "BODY") {

                const button = this.create("toolbox/left-right", buttons)
                button.left.textContent = ".innerHTML"
                button.right.textContent = "Element Inhalt aktualisieren"
                button.onclick = () => {

                  this.overlay("toolbox", overlay => {
                    overlay.info.textContent = `<${this.convert("node/selector", child)}.innerHTML`
                    const htmlField = this.create("field/textarea", overlay)
                    htmlField.label.textContent = "Element Inhalt"
                    htmlField.input.style.height = "55vh"
                    htmlField.input.style.fontFamily = "monospace"
                    htmlField.input.style.fontSize = "13px"
                    htmlField.input.placeholder = "<div>..</div>"
                    htmlField.input.value = child.innerHTML
                    this.add("outline-hover", htmlField.input)
                    this.verify("input/value", htmlField.input)
                    htmlField.input.oninput = async () => {
                      child.innerHTML = await Helper.convert("text/purified", htmlField.input.value)
                    }
                  })
                }

              }

              if (child.tagName === "DIV") {

                const button = this.create("toolbox/left-right", buttons)
                button.left.textContent = ".assign"
                button.right.textContent = "Klick Weiterleitung definieren"
                button.onclick = () => {

                  this.overlay("toolbox", overlay => {
                    overlay.info.textContent = `<${this.convert("node/selector", child)}.assign`
                    const pathField = this.create("field/text", overlay)
                    pathField.input.setAttribute("accept", "text/path")
                    this.add("outline-hover", pathField.input)
                    pathField.label.textContent = "Definiere einen Pfad für deine Weiterleitung, sobald auf dieses Element geklickt wird"
                    pathField.input.placeholder = "/meine/weiterleitung/pfad/"
                    if (child.hasAttribute("onclick")) {
                      if (child.getAttribute("onclick").startsWith("window.location.assign")) {
                        const match = child.getAttribute("onclick").match(/"([^"]*)"/)
                        if (match) {
                          pathField.input.value = match[1]
                        }
                      }
                    }
                    this.verify("input/value", pathField.input)
                    pathField.input.oninput = async () => {
                      await this.verify("input/value", pathField.input)
                      const path = pathField.input.value
                      if (this.verifyIs("text/empty", path)) {
                        child.removeAttribute("onclick")
                      } else {
                        if (this.verifyIs("text/path", path)) {
                          child.setAttribute("onclick", `window.location.assign("${path}")`)
                        }
                      }
                    }
                  })
                }

              }

              if (!["BODY", "HEAD"].includes(child.tagName)) {

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".remove"
                  button.right.textContent = "Element entfernen"
                  button.onclick = async () => {
                    child.remove()
                    overlay.remove()
                    this.render(event, input, parent)
                  }
                }
                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".copy"
                  button.right.textContent = "Element kopieren"
                  button.onclick = async () => {
                    await this.convert("text/clipboard", child.outerHTML)
                    window.alert(`${child.tagName} wurde erfolgreich in deine Zwischenablage kopiert.`)
                  }
                }

              }

              if (!["SCRIPT", "HEAD"].includes(child.tagName)) {

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".paste"
                  button.right.textContent = "Kopiertes Element anhängen"
                  button.onclick = async () => {

                    const elementString = await this.convert("clipboard/text")
                    if (this.verifyIs("text/empty", elementString)) {
                      window.alert("Es wurde kein Element in deiner Zwischenablage gefunden.")
                      throw new Error("copied element not found")
                    }
                    const element = this.convert("text/first-child", elementString)
                    if (element.hasAttribute("id")) {
                      const id = element.getAttribute("id")
                      const counter = document.querySelectorAll(`[id*='${id}']`).length
                      let copyId
                      if (!this.verifyIs("number/empty", counter)) {
                        copyId = `${id}-${counter}`
                      }
                      if (copyId !== undefined) {
                        element.setAttribute("id", copyId)
                      }
                    }
                    child.appendChild(element)
                    window.alert(`'${element.tagName}' wurde erfolgreich in '${child.tagName}' angehängt.`)
                  }
                }
                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".dark-light-toggle"
                  button.right.textContent = "Dark Light Modus auf dein Element umschalten"
                  button.onclick = () => {
                    this.convert("node/dark-light-toggle", child)
                    window.alert("Dark Light Modus erfolgreich umgeschaltet.")
                  }
                }

              }

              if (["BODY", "DIV"].includes(child.tagName)) {

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".dark-light-aware"
                  button.right.textContent = "Dark Light Skript für dein Element anhängen"
                  button.onclick = async () => {
                    const selector = await this.convert("element/selector", child)
                    const script = document.createElement("script")
                    script.id = "dark-light-aware"
                    script.type = "module"
                    script.textContent = `import {Helper} from "/js/Helper.js"\nHelper.convert("selector/dark-light", "${selector}")`
                    if (!document.getElementById(script.id)) document.body.appendChild(script)
                    window.alert("Dark Light Skript erfolgreich angehängt.")
                  }
                }
                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".access"
                  button.right.textContent = "Zugang anhängen"
                  button.onclick = () => {
                    this.overlay("toolbox", async overlay => {
                      overlay.info.textContent = `<${this.convert("node/selector", child)}.access`
                      this.render("text/title", "Für welche Rolle möchtest du einen Zugang anhängen?", overlay)
                      const content = this.create("info/loading", overlay)
                      await this.render("roles/toolbox-access", child, content)
                    })
                  }
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".field-funnel"
                  button.right.textContent = "Datenfeld Funnel anhängen"
                  button.onclick = () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.textContent = `<${this.convert("node/selector", child)}.field-funnel`
                      const content = this.create("div/scrollable", overlay)
                      const idField = this.create("field/id", content)
                      const submit = this.create("toolbox/action", content)
                      submit.textContent = "Datenfeld Funnel jetzt anhängen"
                      submit.onclick = async () => {
                        await this.verify("input/value", idField.input)
                        const id = idField.input.value
                        if (this.verifyIs("id/unique", id)) {
                          const element = this.create("field-funnel", child)
                          element.id = id
                          const script = this.create("script", {id: "submit-field-funnel", js: `await Helper.add("submit-field-funnel")`})
                          document.body.appendChild(script)
                          window.alert(`Field Funnel erfolgreich in ${child.tagName} angehängt.`)
                        } else {
                          this.add("style/node/not-valid", idField.input)
                          window.alert("Id existiert bereits.")
                        }

                      }
                    })

                  }
                }

                {

                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".click-funnel"
                  button.right.textContent = "Klick Funnel anhängen"
                  button.addEventListener("click", () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.append(this.convert("element/alias", child))
                      overlay.info.append(".click-funnel.append")

                      const content = this.create("div/scrollable", overlay)

                      const idField = this.create("field/id", content)

                      const submitButton = this.create("button/action", content)
                      submitButton.textContent = "Klick Funnel jetzt anhängen"
                      submitButton.addEventListener("click", async () => {

                        await this.verify("input/value", idField.input)

                        const id = idField.input.value

                        const ids = document.querySelectorAll(`#${id}`)

                        if (ids.length === 0) {
                          const element = this.create("click-funnel", child)
                          element.id = id

                          this.add("script/click-funnel-event", document.body)

                          overlay.remove()
                        }

                        if (ids.length > 0) {
                          this.add("style/node/not-valid", idField.input)
                          window.alert("Id existiert bereits.")
                        }

                      })

                    })

                  })

                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".md-to-div"
                  button.right.textContent = "Markdown konvertieren und anhängen"
                  button.onclick = async () => {
                    this.overlay("toolbox", markdownToHtmlOverlay => {
                      const funnel = this.create("div/scrollable", markdownToHtmlOverlay)
                      const markdownField = this.create("field/textarea", funnel)
                      markdownField.label.textContent = "Markdown zu HTML konvertieren (md/html)"
                      markdownField.input.placeholder = " # Hello, Markdown! .. "
                      markdownField.input.style.fontSize = "13px"
                      markdownField.input.style.height = "55vh"
                      markdownField.input.setAttribute("required", "true")
                      markdownField.input.oninput = () => this.verify("input/value", markdownField.input)
                      this.verify("input/value", markdownField.input)
                      const submit = this.create("button/action", funnel)
                      submit.textContent = "Markdown jetzt anhängen"
                      submit.onclick = async () => {
                        await this.verify("input/value", markdownField.input)
                        const markdown = markdownField.input.value
                        const markdownContainer = this.convert("markdown/div", markdown)
                        markdownContainer.classList.add("markdown-container")
                        child.appendChild(markdownContainer)
                        window.alert(`Markdown erfolgreich konvertiert und im ${child.tagName} angehängt.`)
                      }
                    })
                  }
                }
                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".image"
                  button.right.textContent = "Neues Bild anhängen"
                  button.addEventListener("click", () => {
                    this.overlay("toolbox", async overlay => {
                      overlay.info.append(this.convert("element/alias", child))
                      overlay.info.append(this.convert("text/span", ".image"))
                      const content = this.create("div/scrollable", overlay)
                      const urlField = this.add("field/image-url", content)
                      const button = this.create("toolbox/action", content)
                      button.textContent = "Bild jetzt anhängen"
                      button.addEventListener("click", async () => {
                        await this.verify("input/value", urlField.input)
                        const url = urlField.input.value
                        child.append(this.convert("text/img", url))
                      })
                    })
                  })

                }

                {

                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".background-image"
                  button.right.textContent = "Hintergrund Bild anhängen"
                  button.addEventListener("click", () => {

                    this.overlay("toolbox", async overlay => {
                      overlay.info.append(this.convert("element/alias", child))
                      overlay.info.append(this.convert("text/span", ".image"))

                      const content = this.create("div/scrollable", overlay)

                      const urlField = this.add("field/image-url", content)

                      const button = this.create("toolbox/action", content)
                      button.textContent = "Bild jetzt anhängen"
                      button.addEventListener("click", async () => {

                        await this.verify("input/value", urlField.input)
                        const url = urlField.input.value
                        child.style.background = `url("${url}")`

                      })

                    })
                  })

                }


                {

                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".div-scrollable"
                  button.right.textContent = "Scrollbares DIV-Element anhängen"
                  button.addEventListener("click", () => {
                    try {
                      this.create("div/scrollable", child)
                      window.alert("Element erfolgreich angehängt.")
                    } catch (error) {
                      window.alert("Fehler.. Bitte wiederholen.")
                    }
                  })

                }

              }

              if (child.classList.contains("click-funnel")) {

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".questions"
                  button.right.textContent = "Klick Funnel bearbeiten"
                  button.onclick = () => {

                    this.overlay("toolbox", questionsOverlay => {
                      overlay.info.textContent = `<${this.convert("node/selector", child)}.questions`
                      const button = this.create("toolbox/left-right", questionsOverlay)
                      button.left.textContent = ".append"
                      button.right.textContent = "Neue Frage anhängen"
                      button.onclick = () => {

                        this.overlay("toolbox", appendQuestionOverlay => {
                          overlay.info.append(this.convert("element/alias", child))
                          {
                            const span = document.createElement("span")
                            span.textContent = ".append"
                            info.append(span)
                          }

                          const appendQuestionFunnel = this.create("div/scrollable", appendQuestionOverlay)

                          const idField = this.create("field/tag", appendQuestionFunnel)
                          idField.label.textContent = "Gebe deiner Frage eine Id"
                          this.verify("input/value", idField.input)
                          idField.input.addEventListener("input", async () => {

                            await this.verify("input/value", idField.input)

                            try {
                              const value = idField.input.value
                              if (document.querySelectorAll(`#${value}`).length === 0) {
                                this.add("style/node/valid", idField.input)
                              } else this.add("style/node/not-valid", idField.input)
                            } catch (error) {
                              this.add("style/node/not-valid", idField.input)
                            }

                          })

                          const questionField = this.create("field/textarea", appendQuestionFunnel)
                          questionField.label.textContent = "Stelle eine Frage an dein Netzwerk"
                          questionField.input.setAttribute("required", "true")
                          this.verify("input/value", questionField.input)
                          questionField.input.addEventListener("input", () => this.verify("input/value", questionField.input))

                          const appendQuestionButton = this.create("toolbox/action", appendQuestionFunnel)
                          appendQuestionButton.textContent = "Jetzt anhängen"
                          appendQuestionButton.addEventListener("click", async () => {

                            await this.verify("field-funnel", appendQuestionFunnel)

                            const question = questionField.input.value
                            const id = idField.input.value

                            if (document.getElementById(id) === null) {
                              const clickField = this.create("click-field", child)
                              clickField.id = id
                              clickField.question.textContent = question
                              appendQuestionOverlay.remove()
                              this.render("click-funnel/questions", child, questions)
                            } else {
                              window.alert("Id existiert bereits.")
                              this.add("style/node/not-valid", idField.input)
                              idField.scrollIntoView({behavior: "smooth"})
                            }


                          })




                        })
                      }
                      const questions = this.create("div/scrollable", questionsOverlay)
                      this.render("click-funnel/questions", child, questions)
                    })
                  }
                }


                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".next-path"
                  button.right.textContent = "Nach Abschluss, zur Werteinheit"
                  button.addEventListener("click", () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.append(this.convert("element/alias", child))
                      overlay.info.append(this.convert("text/span", ".next-path"))

                      const content = this.create("div/scrollable", overlay)

                      const pathField = this.create("field/text", content)
                      pathField.input.placeholder = "/mein/pfad/"
                      pathField.input.setAttribute("required", "true")
                      pathField.label.textContent = "https://www.get-your.de"
                      if (child.hasAttribute("next-path")) {
                        pathField.input.value = child.getAttribute("next-path")
                        pathField.label.textContent = `https://www.get-your.de${child.getAttribute("next-path")}`
                      }
                      this.verify("input/value", pathField.input)
                      pathField.input.addEventListener("input", (event) => {

                        if (this.verifyIs("text/empty", event.target.value)) {
                          this.add("style/node/not-valid", event.target)
                          child.removeAttribute("next-path")
                        }

                        if (!this.verifyIs("text/empty", event.target.value)) {
                          this.add("style/node/valid", event.target)
                          pathField.label.textContent = `https://www.get-your.de${event.target.value}`
                          child.setAttribute("next-path", event.target.value)
                        }

                      })



                    })
                  })
                }


                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".reset"
                  button.right.textContent = "Klick Funnel zurücksetzen"
                  button.addEventListener("click", () => {

                    for (let i = 0; i < child.children.length; i++) {
                      const element = child.children[i]

                      element.style.display = "none"

                      if (element.classList.contains("start-click-funnel-button")) {
                        element.style.display = "flex"
                      }

                    }
                    window.alert("Funnel erfolgreich zurückgesetzt.")

                  })
                }


              }

              if (child.classList.contains("field-funnel")) {

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".fields"
                  button.right.textContent = "Datenfelder anhängen"
                  button.onclick = () => {

                    this.overlay("toolbox", overlay => {
                      overlay.info.textContent = `<${this.convert("node/selector", child)}.fields`
                      const button = this.create("toolbox/left-right", overlay)
                      button.left.textContent = ".create"
                      button.right.textContent = "Neues Datenfeld erzeugen"
                      button.onclick = () => {

                        this.overlay("toolbox", overlay => {
                          overlay.info.textContent = `<${this.convert("node/selector", child)}.field.create`
                          const funnel = this.create("div/scrollable", overlay)
                          const idField = this.create("field/id", funnel)
                          const labelField = this.create("field/textarea", funnel)
                          labelField.label.textContent = "Beschreibe das Datenfeld für dein Netzwerk"
                          labelField.input.setAttribute("required", "true")
                          this.verify("input/value", labelField.input)
                          this.add("outline-hover", labelField.input)
                          labelField.input.addEventListener("input", () => this.verify("input/value", labelField.input))
                          const typeField = this.create("field/select", funnel)
                          typeField.label.textContent = "Welchen Datentyp soll dein Netzwerk eingeben können"
                          typeField.input.add(["text", "textarea", "email", "tel", "range", "password", "number", "file", "date", "checkbox", "select"])
                          this.add("outline-hover", typeField.input)
                          this.verify("input/value", typeField.input)
                          const submit = this.create("toolbox/action", funnel)
                          submit.textContent = "Datenfeld jetzt anhängen"
                          submit.onclick = async () => {
                            await this.verify("field-funnel", funnel)
                            const id = idField.input.value
                            const label = labelField.input.value
                            const type = typeField.input.value
                            if (document.querySelectorAll(`#${id}`).length !== 0) {
                              window.alert("Id existiert bereits.")
                              idField.scrollIntoView({behavior: "smooth"})
                              this.add("style/node/not-valid", idField.input)
                              throw new Error("id exist")
                            }
                            if (this.verifyIs("id/unique", id)) {
                              const field = this.convert("text/field", type)
                              field.id = id
                              field.label.textContent = label
                              child.querySelector(".submit-field-funnel-button").before(field)
                              this.render("field-funnel-fields-update", child, fieldsContainer)
                              overlay.remove()
                            }
                          }
                        })
                      }
                      this.render("text/hr", "Meine Datenfelder", overlay)
                      const fieldsContainer = this.create("div/scrollable", overlay)
                      this.render("field-funnel-fields-update", child, fieldsContainer)
                    })
                  }
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".next-path"
                  button.right.textContent = "Nach Abschluss, zur Werteinheit"
                  button.addEventListener("click", () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.append(this.convert("element/alias", child))
                      overlay.info.append(this.convert("text/span", ".next-path"))

                      const content = this.create("div/scrollable", overlay)

                      const pathField = this.create("field/text", content)
                      pathField.input.placeholder = "/mein/pfad/"
                      pathField.input.setAttribute("required", "true")
                      pathField.label.textContent = "https://www.get-your.de"
                      if (child.hasAttribute("next-path")) {
                        pathField.input.value = child.getAttribute("next-path")
                          pathField.label.textContent = `https://www.get-your.de${child.getAttribute("next-path")}`
                      }
                      this.verify("input/value", pathField.input)
                      pathField.input.addEventListener("input", (event) => {

                        if (this.verifyIs("text/empty", event.target.value)) {
                          this.add("style/node/not-valid", event.target)
                          child.removeAttribute("next-path")
                        }

                        if (!this.verifyIs("text/empty", event.target.value)) {
                          this.add("style/node/valid", event.target)
                          pathField.label.textContent = `https://www.get-your.de${event.target.value}`
                          child.setAttribute("next-path", event.target.value)
                        }

                      })



                    })
                  })
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".submit-field-funnel"
                  button.right.textContent = "Field Funnel Submit Skript anhängen"
                  button.onclick = () => {
                    const script = this.create("script", {id: "submit-field-funnel", js: 'Helper.add("submit-field-funnel")'})
                    this.add("script-onbody", script)
                    window.alert("Skript wurde erfolgreich angehängt.")
                  }
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".prefill-field-funnel"
                  button.right.textContent = "Fülle die Datenfelder mit den eigenen Nutzerdaten"
                  button.onclick = () => {
                    const script = this.create("script", {id: "prefill-field-funnel", js: `Helper.add("prefill-field-funnel")`})
                    this.add("script-onbody", script)
                    window.alert("Skript wurde erfolgreich angehängt.")
                  }
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".on-info-click"
                  button.right.textContent = "Dieses Skript sucht und öffnet deine Tags im Field Funnel"
                  button.onclick = () => {
                    const script = this.create("script", {id: "on-info-click", js: 'Helper.add("on-info-click")'})
                    this.add("script-onbody", script)
                    window.alert("Skript wurde erfolgreich angehängt.")
                  }
                }

                {
                  const button = this.create("toolbox/left-right", buttons)
                  button.left.textContent = ".field-funnel-sign-support"
                  button.right.textContent = "Unterstütze deine Nutzer bei der Eingabe mit Symbole und Farben"
                  button.onclick = () => {
                    const script = this.create("script", {id: "field-funnel-sign-support", js: 'Helper.add("field-funnel-sign-support")'})
                    this.add("script-onbody", script)
                    window.alert("Skript wurde erfolgreich angehängt.")
                  }
                }

              }

            }

          })

        }

        // drag and drop
        childrenButton.draggable = true

        childrenButton.addEventListener("dragstart", (event) => {

          event.dataTransfer.setData("id", child.id)

        })

        childrenButton.addEventListener("dragenter", (event) => {
          event.target.style.border = `2px dashed ${this.colors.matte.red}`
        })

        childrenButton.addEventListener("dragleave", (event) => {

          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            event.target.style.border = this.colors.dark.border
          } else {
            event.target.style.border = this.colors.light.border
          }

        })

        childrenButton.addEventListener("dragover", (event) => {
          event.preventDefault()
        })

        childrenButton.addEventListener("drop", (event) => {

          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            event.target.style.border = this.colors.dark.border
          } else {
            event.target.style.border = this.colors.light.border
          }

          const draggedId = event.dataTransfer.getData("id")

          let droppedId = child.id

          if (this.verifyIs("text/empty", draggedId)) {
            alert("Das ausgewählte Element hat keine Id. Wenn du es verschieben möchtest, dann vergebe dem Element eine Id.")
            throw new Error("dragged id is empty")
          }

          if (this.verifyIs("text/empty", droppedId)) {
            alert("Das zu tauschende Element hat keine Id. Wenn du es verschieben möchtest, dann vergebe dem Element eine Id.")
            throw new Error("dropped id is empty")
          }

          let draggedElement = document.getElementById(draggedId)

          let droppedElement = document.getElementById(droppedId)

          droppedElement.before(draggedElement)

          this.render("children", input, parent)

        })
        ///

      }


    }

    if (event === "click-field/answers") {

      if (input.classList.contains("click-field")) {

        const container = input.querySelector(".answers")
        if (container !== null) {
          parent.textContent = ""
          for (let i = 0; i < container.children.length; i++) {
            const child = container.children[i]

            if (child.classList.contains("answer-box")) {
              const answer = child.querySelector(".answer")

              const button = this.create("button/left-right", parent)
              button.left.textContent = `Option ${i + 1}`
              button.right.textContent = answer.textContent
              button.addEventListener("click", () => {
                this.overlay("toolbox", answersFunnelOverlay => {
                  overlay.info.append(this.convert("element/alias", child))
                  const answerFunnel = this.create("div/scrollable", answersFunnelOverlay)
                  const answerField = this.create("field/textarea", answerFunnel)
                  answerField.input.value = answer.textContent
                  answerField.label.textContent = "Antwortmöglichkeit ändern"
                  answerField.input.setAttribute("required", "true")
                  this.verify("input/value", answerField.input)
                  answerField.input.addEventListener("input", async () => {
                    await this.verify("input/value", answerField.input)
                    try {
                      const value = answerField.input.value
                      answer.textContent = value
                    } catch (error) {
                      this.add("style/node/not-valid", answerField.input)
                    }
                    this.render(event, input, parent)
                  })
                  const selectedConditionButton = this.create("button/left-right", answerFunnel)
                  selectedConditionButton.left.textContent = ".onclick"
                  selectedConditionButton.right.textContent = "Klick Bedingung definieren"
                  selectedConditionButton.addEventListener("click", () => {
                    this.overlay("toolbox", conditionFunnelOverlay => {
                      overlay.info.append(this.convert("element/alias", child))
                      overlay.info.append(".onclick")
                      const content = this.create("div/scrollable", conditionFunnelOverlay)
                      const actionField = this.create("field/select", content)
                      actionField.label.textContent = "Wähle ein Event"
                      actionField.input.add(["skip", "path"])
                      if (answer.hasAttribute("onclick-condition")) {
                        const condition = JSON.parse(answer.getAttribute("onclick-condition"))
                        actionField.input.select([condition.event])
                      }
                      this.verify("input/value", actionField.input)
                      actionField.input.addEventListener("input", () => {

                        if (actionField.input.value === "skip") {

                          skipNumberField.input.disabled = false
                          skipNumberField.input.setAttribute("required", "true")
                          this.add("style/node/not-valid", skipNumberField.input)

                          pathField.input.disabled = true
                          pathField.input.required = false
                          pathField.input.value = ""
                          this.add("style/node/valid", pathField.input)

                        }

                        if (actionField.input.value === "path") {

                          skipNumberField.input.disabled = true
                          skipNumberField.input.required = false
                          skipNumberField.input.value = ""
                          this.add("style/node/valid", skipNumberField.input)

                          pathField.input.disabled = false
                          pathField.input.setAttribute("required", "true")
                          this.add("style/node/not-valid", pathField.input)

                        }

                      })

                      const skipNumberField = this.create("field/tel", content)
                      skipNumberField.input.disabled = false
                      skipNumberField.input.required = true
                      skipNumberField.input.pattern = "[1-9]"
                      skipNumberField.label.textContent = "Wieviele Fragen möchtest du überspringen"
                      if (answer.hasAttribute("onclick-condition")) {
                        const condition = JSON.parse(answer.getAttribute("onclick-condition"))
                        if (condition.event === "skip") {
                          skipNumberField.input.value = condition.skip
                        }
                      }
                      this.verify("input/value", skipNumberField.input)
                      skipNumberField.input.addEventListener("input", () => this.verify("input/value", skipNumberField.input))

                      const pathField = this.create("field/text", content)
                      pathField.input.disabled = true
                      pathField.input.setAttribute("required", "false")
                      pathField.input.accept = "text/path"
                      pathField.input.placeholder = "/meine-platform/mein-username/meine-werteinheit/"
                      pathField.label.textContent = "Gebe eine Pfad ein"
                      if (answer.hasAttribute("onclick-condition")) {
                        const condition = JSON.parse(answer.getAttribute("onclick-condition"))
                        if (condition.event === "path") {
                          pathField.input.value = condition.path
                        }
                      }
                      this.add("style/node/valid", pathField.input)
                      pathField.input.addEventListener("input", () => this.verify("input/value", pathField.input))

                      const conditionSubmitButton = this.create("button/action", content)
                      conditionSubmitButton.textContent = "Klick Bedingung hinzufügen"
                      conditionSubmitButton.addEventListener("click", async () => {

                        await this.verify("field-funnel", content)

                        const condition = {}
                        condition.event = actionField.input.value

                        if (condition.event === "skip") {
                          condition.skip = skipNumberField.input.value
                        }

                        if (condition.event === "path") {
                          condition.path = pathField.input.value
                        }

                        answer.setAttribute("onclick-condition", JSON.stringify(condition))

                        conditionFunnelOverlay.remove()
                      })

                    })



                  })

                })
              })
            }

          }
        }



      }

    }

    if (event === "click-funnel/questions") {

      if (input.classList.contains("click-funnel")) {



        parent.textContent = ""
        for (let i = 0; i < input.children.length; i++) {
          const child = input.children[i]

          if (child.classList.contains("start-click-funnel-button")) continue
          if (child.classList.contains("end-click-funnel-button")) continue

          if (child.classList.contains("click-field")) {
            const button = this.create("button/left-right", parent)
            button.left.textContent = child.id
            button.right.textContent = "Frage bearbeiten"
            button.addEventListener("click", () => {
              this.overlay("toolbox", questionsFunnelOverlay => {
                overlay.info.append(this.convert("element/alias", child))
                const questionsFunnel = this.create("div/scrollable", questionsFunnelOverlay)
                const idField = this.create("field/tag", questionsFunnel)
                idField.input.value = child.id
                idField.label.textContent = "Id"
                this.verify("input/value", idField.input)
                idField.input.addEventListener("input", async () => {

                  await this.verify("input/value", idField.input)
                  try {
                    const value = idField.input.value
                    if (document.querySelectorAll(`#${value}`).length === 0) {
                      child.id = value
                    } else this.add("style/node/not-valid", idField.input)

                    info.textContent = ""
                    info.append(this.convert("element/alias", child))

                    this.render(event, input, parent)

                  } catch (error) {
                    this.add("style/node/not-valid", idField.input)
                  }

                })


                const question = child.querySelector(".question")
                const labelField = this.create("field/textarea", questionsFunnel)
                labelField.input.value = question.textContent
                labelField.label.textContent = "Frage"
                labelField.input.setAttribute("required", "true")
                this.verify("input/value", labelField.input)

                labelField.input.addEventListener("input", async () => {

                  await this.verify("input/value", labelField.input)

                  try {
                    const value = labelField.input.value
                    question.textContent = value
                  } catch (error) {
                    this.add("style/node/not-valid", labelField.input)
                  }

                })

                const button = this.create("button/left-right", questionsFunnel)
                button.left.textContent = ".options"
                button.right.textContent = "Antworten bearbeiten"
                button.addEventListener("click", () => {
                  this.overlay("toolbox", answersOverlay => {
                    overlay.info.textContent = `${this.convert("element/alias", child)}.options`

                    {
                      const button = this.create("button/left-right", answersOverlay)
                      button.left.textContent = ".append"
                      button.right.textContent = "Neue Antwortmöglichkeit anhängen"
                      button.addEventListener("click", () => {
                        const answerBox = this.create("answer-box")
                        this.overlay("toolbox", appendAnswerOverlay => {
                          overlay.info.append(this.convert("element/alias", child))
                          overlay.info.append(".append")
                          const answerFunnel = this.create("div/scrollable", appendAnswerOverlay)
                          const answerField = this.create("field/textarea", answerFunnel)
                          answerField.label.textContent = "Antwortmöglichkeit"
                          answerField.input.setAttribute("required", "true")
                          this.verify("input/value", answerField.input)
                          answerField.input.addEventListener("input", () => this.verify("input/value", answerField.input))

                          const selectedConditionButton = this.create("button/left-right", answerFunnel)
                          selectedConditionButton.left.textContent = ".onclick"
                          selectedConditionButton.right.textContent = "Klick Bedingung definieren"
                          selectedConditionButton.addEventListener("click", () => {
                            this.overlay("toolbox", conditionFunnelOverlay => {
                              overlay.info.append(this.convert("element/alias", child))
                              overlay.info.append(".onclick")
                              const content = this.create("div/scrollable", conditionFunnelOverlay)
                              const actionField = this.create("field/select", content)
                              actionField.label.textContent = "Wähle ein Event"
                              actionField.input.add(["skip", "path"])
                              this.verify("input/value", actionField.input)
                              actionField.input.addEventListener("input", () => {
                                if (actionField.input.value === "skip") {
                                  skipNumberField.input.disabled = false
                                  skipNumberField.input.required = true
                                  this.add("style/node/not-valid", skipNumberField.input)
                                  pathField.input.disabled = true
                                  pathField.input.required = false
                                  pathField.input.value = ""
                                  this.add("style/node/valid", pathField.input)
                                }

                                if (actionField.input.value === "path") {

                                  skipNumberField.input.disabled = true
                                  skipNumberField.input.required = false
                                  skipNumberField.input.value = ""
                                  this.add("style/node/valid", skipNumberField.input)

                                  pathField.input.disabled = false
                                  pathField.input.required = true
                                  this.add("style/node/not-valid", pathField.input)

                                }

                              })

                              const skipNumberField = this.create("field/tel", content)
                              skipNumberField.input.setAttribute("required", "true")
                              skipNumberField.input.pattern = "[1-9]"
                              skipNumberField.label.textContent = "Wieviele Fragen möchtest du überspringen"
                              this.verify("input/value", skipNumberField.input)
                              skipNumberField.input.addEventListener("input", () => this.verify("input/value", skipNumberField.input))

                              const pathField = this.create("field/text", content)
                              pathField.input.disabled = true
                              pathField.input.accept = "text/path"
                              pathField.input.placeholder = "/meine-platform/mein-username/meine-werteinheit/"
                              pathField.label.textContent = "Gebe eine Pfad ein"
                              this.add("style/node/valid", pathField.input)
                              pathField.input.addEventListener("input", () => this.verify("input/value", pathField.input))

                              const conditionSubmitButton = this.create("button/action", content)
                              conditionSubmitButton.textContent = "Klick Bedingung hinzufügen"
                              conditionSubmitButton.addEventListener("click", async () => {

                                const condition = {}
                                condition.event = actionField.input.value

                                if (condition.event === "skip") {
                                  await this.verify("input/value", skipNumberField.input)
                                  condition.skip = skipNumberField.input.value
                                  answerBox.answer.setAttribute("onclick-condition", JSON.stringify(condition))
                                }

                                if (condition.event === "path") {
                                  await this.verify("input/value", pathField.input)
                                  condition.path = pathField.input.value
                                  answerBox.answer.setAttribute("onclick-condition", JSON.stringify(condition))
                                }

                                conditionFunnelOverlay.remove()
                              })

                            })



                          })

                          const appendAnswerButton = this.create("button/action", answerFunnel)
                          appendAnswerButton.textContent = "Option jetzt anhängen"
                          appendAnswerButton.addEventListener("click", async () => {

                            await this.verify("input/value", answerField.input)
                            const answer = answerField.input.value

                            answerBox.answer.textContent = answer

                            child.querySelector(".answers").append(answerBox)

                            this.render("click-field/answers", document.getElementById(child.id), answers)

                            appendAnswerOverlay.remove()

                          })



                        })
                      })
                    }

                    const answers = this.create("div/scrollable", answersOverlay)
                    this.render("click-field/answers", document.getElementById(child.id), answers)

                  })
                })




              })
            })
          }

        }





      }

    }

    if (event === "question/answers") {

      const output = document.createElement("div")
      for (let i = 0; i < input.length; i++) {
        const element = input[i]
        const button = this.create("button/left-right")
        button.left.textContent = `Option: ${i + 1}`
        button.right.textContent = element.value
        output.appendChild(button)
      }
      parent?.appendChild(output)
      return output
    }

    if (event === "funnel/field-input") {

      if (parent === undefined) {
        document.querySelectorAll(".funnel-field-input").forEach(div => {
          this.render(event, {type: input.type, field: input.field}, div)
        })
      }

      if (parent !== undefined) {
        if (!parent.classList.contains("funnel-field-input")) {
          parent.classList.add("funnel-field-input")
        }
      }

      if (parent !== undefined) {
        parent.textContent = ""
      }


      if (input !== undefined) {

        if (input.type !== "select") {

          const requiredField = this.create("field/checkbox", parent)
          requiredField.label.textContent = "Dieses Datenfeld ist notwendig"
          this.verify("input/value", requiredField.input)
          if (input.field !== undefined) {
            if (input.field.classList.contains("field")) {
              const fieldInput = input.field.querySelector(".field-input")
              if (fieldInput.hasAttribute("required")) {
                requiredField.input.checked = true
              }
            }
          }
          requiredField.input.addEventListener("input", (event) => {

            if (input.field !== undefined) {
              if (input.field.classList.contains("field")) {
                const fieldInput = input.field.querySelector(".field-input")

                if (event.target.checked === true) {
                  fieldInput.setAttribute("required", true)
                }

                if (event.target.checked === false) {
                  fieldInput.removeAttribute("required")
                }

              }
            }


          })

        }

        if (input.type === "select") {

          {
            const button = this.create("button/left-right", parent)
            button.left.textContent = ".options"
            button.right.textContent = "Antwortmöglichkeiten definieren"
            button.addEventListener("click", () => {
              const fieldInput = input.field.querySelector(".field-input")
              this.overlay("toolbox", overlay => {
                overlay.info.textContent = `${this.convert("element/alias", input.field)}.options`
                {
                  const button = this.create("button/left-right", overlay)
                  button.left.textContent = ".append"
                  button.right.textContent = "Neue Antwortmöglichkeit anhängen"
                  button.addEventListener("click", () => {
                    this.overlay("toolbox", overlay => {
                      overlay.info.append(this.convert("element/alias", fieldInput))
                      overlay.info.append(this.convert("text/span", ".option.append"))

                      fieldInput.ok = () => {
                        this.render("select/options", fieldInput)
                        overlay.remove()
                      }

                      this.get("funnel/select-option", overlay, fieldInput)

                    })
                  })
                }

                this.render("text/hr", "Meine Optionen", overlay)

                const options = this.create("div/scrollable", overlay)
                this.render("select/options", fieldInput, options)

              })
            })
          }

        }

        // add more input dom functions


      }

    }

    if (event === "funnel/questions") {

      const output = document.createElement("div")
      for (let i = 0; i < input.length; i++) {
        const element = input[i]

        const button = this.create("button/left-right")
        button.left.textContent = `Frage: ${i + 1}`
        button.right.textContent = element.id

        // on click
        // change id and value
        //
        // delete
        // change answers if exist
        output.append(button)


      }

      if (parent !== undefined) parent.append(output)
      return output
    }

    if (event === "object/selector/write-details") {

      const node = document.querySelector(parent)

      for (let i = 0; i < document.querySelectorAll("*").length; i++) {
        const child = document.querySelectorAll("*")[i]

        if (child.hasAttribute("write-details")) {

          child.removeAttribute("style")
          child.textContent = ""
          child.style.display = "flex"
          child.style.flexDirection = "column"
          child.style.gap = "8px"
          child.style.maxHeight = "144px"
          child.style.overflow = "auto"

          Object.entries(input).forEach(([key, value]) => {

            const keyValuePair = document.createElement("div")
            keyValuePair.classList.add("key-value-pair")
            keyValuePair.style.display = "flex"
            keyValuePair.style.flexWrap = "wrap"
            keyValuePair.style.borderRadius = "5px"
            child.append(keyValuePair)

            const keyDiv = document.createElement("key")
            keyDiv.classList.add("key")
            keyDiv.textContent = this.convert("tag/capital-first-letter", key) + ":"
            keyValuePair.append(keyDiv)

            const valueDiv = document.createElement("div")
            valueDiv.textContent = value
            valueDiv.classList.add("value")
            valueDiv.style.fontWeight = "bold"
            valueDiv.style.marginLeft = "5px"
            keyValuePair.append(valueDiv)

          })

        }

      }

    }

    if (event === "object/node/write-details") {

      if (parent.hasAttribute("write-details")) {

        parent.removeAttribute("style")
        parent.textContent = ""
        parent.style.display = "flex"
        parent.style.flexDirection = "column"
        parent.style.gap = "8px"
        parent.style.maxHeight = "144px"
        parent.style.overflow = "auto"

        Object.entries(input).forEach(([key, value]) => {

          const keyValuePair = document.createElement("div")
          keyValuePair.classList.add("key-value-pair")
          keyValuePair.style.display = "flex"
          keyValuePair.style.flexWrap = "wrap"
          keyValuePair.style.borderRadius = "5px"
          parent.append(keyValuePair)

          const keyDiv = document.createElement("key")
          keyDiv.classList.add("key")
          keyDiv.textContent = this.convert("tag/capital-first-letter", key) + ":"
          keyValuePair.append(keyDiv)

          const valueDiv = document.createElement("div")
          valueDiv.textContent = value
          valueDiv.classList.add("value")
          valueDiv.style.fontWeight = "bold"
          valueDiv.style.marginLeft = "5px"
          keyValuePair.append(valueDiv)

        })

      }

    }

    if (event === "object/node/popup-details") {
      if (parent.hasAttribute("popup-details")) {

        parent.style.cursor = "pointer"
        parent.onclick = () => {
          this.overlay("popup", overlay => {
            this.render("text/title", "Detailansicht", overlay)

            const content = this.create("div/scrollable", overlay)
            content.style.display = "grid"
            content.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))"
            content.style.gap = "21px"
            content.style.margin = "21px 34px"

            Object.entries(input).forEach(([key, value]) => {

              const keyValuePair = document.createElement("div")
              keyValuePair.classList.add("key-value-pair")

              keyValuePair.style.backgroundColor = this.colors.gray[0]
              keyValuePair.style.border = this.colors.light.border
              keyValuePair.style.color = this.colors.light.text
              keyValuePair.style.boxShadow = this.colors.light.boxShadow
              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                keyValuePair.style.backgroundColor = this.colors.matte.black
                keyValuePair.style.border = this.colors.dark.border
                keyValuePair.style.boxShadow = this.colors.dark.boxShadow
                keyValuePair.style.color = this.colors.dark.text
              }
              keyValuePair.style.display = "flex"
              keyValuePair.style.flexDirection = "column"
              keyValuePair.style.padding = "1rem"
              keyValuePair.style.borderRadius = "5px"
              content.append(keyValuePair)

              const keyDiv = document.createElement("key")
              keyDiv.classList.add("key")
              keyDiv.style.fontWeight = "bold"
              keyDiv.style.marginBottom = "0.5rem"
              keyDiv.textContent = key
              keyDiv.style.color = this.colors.key
              keyValuePair.append(keyDiv)

              const valueDiv = document.createElement("div")
              valueDiv.textContent = value
              valueDiv.classList.add("value")
              valueDiv.style.color = this.colors.value
              keyValuePair.append(valueDiv)

            })

          })
        }

      }

    }

    if (event === "object/selector/class") {

      const node = document.querySelector(parent)

      if (node) {

        Object.entries(input).forEach(([key, value]) => {
          for (let i = 0; i < node.querySelectorAll("*").length; i++) {
            const child = node.querySelectorAll("*")[i]

            if (child.classList.contains(key)) {
              child.textContent = value
            }
          }
        })

      }

    }

    if (event === "object/selector/all") {

      const node = document.querySelector(parent)

      if (node) {

        Object.entries(input).forEach(([key, value]) => {
          for (let i = 0; i < node.querySelectorAll("*").length; i++) {
            const child = node.querySelectorAll("*")[i]

            this.render("object/node/write-details", input, child)
            this.render("object/node/popup-details", input, child)

            if (child.classList.contains(key)) {

              if (key === "bild") {
                child.src = value
              } else {
                child.textContent = value
              }

            }
          }
        })

      }

    }

    if (event === "object/node/all") {

      Object.entries(input).forEach(([key, value]) => {
        for (let i = 0; i < parent.querySelectorAll("*").length; i++) {
          const child = parent.querySelectorAll("*")[i]

          this.render("object/node/write-details", input, child)
          this.render("object/node/popup-details", input, child)

          if (child.classList.contains(key)) {

            if (key === "image") {
              child.src = value
            } else {
              child.textContent = value
            }

          }
        }
      })

    }

    if (event === "html-values-writable") {

      function renderHtmlValuesOverlay(values) {
        Helper.overlay("popup", async overlay => {
          const searchField = Helper.create("field/text", overlay)
          searchField.label.textContent = "Suche nach Alias"
          searchField.input.placeholder = "Werteinheiten mit Schreibrechte"
          Helper.verify("input/value", searchField.input)
          Helper.add("outline-hover", searchField.input)
          const buttons = Helper.create("div/scrollable", overlay)
          searchField.input.oninput = async (ev) => {
            const filtered = values.filter(it => it.alias.toLowerCase().includes(ev.target.value.toLowerCase()))
            const highlighted = filtered.map(it => {
              const highlightedAlias = it.alias.replace(new RegExp(ev.target.value, 'i'), `<mark>${ev.target.value}</mark>`)
              return { ...it, alias: highlightedAlias }
            })
            await renderHtmlValueButtons(highlighted, buttons)
          }
          await renderHtmlValueButtons(values, buttons)
        })
      }

      function renderHtmlValueButtons(values, node) {
        return new Promise(async(resolve, reject) => {
          try {
            const icon = await Helper.convert("path/icon", "/public/window-chain.svg")
            icon.style.width = "55px"
            icon.style.margin = "0 5px"
            Helper.convert("parent/scrollable", node)
            for (let i = 0; i < values.length; i++) {
              const value = values[i]
              const iconClone = icon.cloneNode(true)
              Helper.add("outline-hover", iconClone)
              const button = Helper.create("button/left-right", node)
              button.right.style.display = "flex"
              button.right.appendChild(iconClone)
              Helper.createNode("span", button.left, value.alias)
              Helper.createNode("br", button.left)
              Helper.createNode("span", button.left, value.path)
              button.onclick = () => window.open(value.path, "_blank")
              iconClone.onclick = (ev) => {
                ev.stopPropagation()
                navigator.clipboard.writeText(value.path)
                .then(() => window.alert(`Der Pfad '${value.path}' wurde erfolgreich in deinen Zwischenspeicher kopiert.`))
                .catch(() => window.alert("Fehler.. Bitte wiederholen."))
              }
            }
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      }
      renderHtmlValuesOverlay(input)
    }

    if (event === "user/selector/all") {

      const node = document.querySelector(parent)

      if (node) {

        let list = document.querySelector(`.${node.className}-list`)
        if (!list) {
          list = this.create("div", document.body)
          list.className = `${node.className}-list`
        }
        list.style.paddingBottom = "144px"

        const clone = node.cloneNode(true)
        node.style.display = "none"

        Object.entries(input).forEach(([key, value]) => {
          if (this.verifyIs("array", value)) {
            for (let i = 0; i < value.length; i++) {
              const item = value[i]
              if (item.created) clone.id = item.created

              this.render("object-node", item, clone)

              const itemNode = clone.cloneNode(true)
              list.append(itemNode)

            }
          }
        })


        for (let i = 0; i < list.children.length; i++) {
          const item = list.children[i]

          const singlePrice = item.querySelector("span.single-price")
          const totalAmount = item.querySelector("span.total-amount")
          const quantityInput = item.querySelector("input.quantity")
          if (singlePrice && totalAmount && quantityInput) {
            quantityInput.value = 1
            totalAmount.textContent = `${Number(singlePrice.textContent) * Number(quantityInput.value)}`

            quantityInput.oninput = () => {
              totalAmount.textContent = `${Number(singlePrice.textContent) * Number(quantityInput.value)}`

              if (this.verifyIs("text/+int", quantityInput.value)) {
                this.add("style/node/valid", quantityInput)
              } else {
                this.add("style/node/not-valid", quantityInput)
              }

            }
          }



          for (let i = 0; i < item.querySelectorAll("*").length; i++) {
            const child = item.querySelectorAll("*")[i]

            if (child.tagName === "INPUT") {
              this.add("outline-hover", child)
            }

            if (child.hasAttribute("popup-details")) {

              this.add("outline-hover", child)
              Object.entries(input).forEach(([key, value]) => {
                if (this.verifyIs("array", value)) {
                  for (let i = 0; i < value.length; i++) {
                    const locationListItem = value[i]
                    if (item.id === `${locationListItem.created}`) {
                      if (locationListItem["pdf-product"] !== undefined) {
                        child.onclick = () => window.open(locationListItem["pdf-product"], "_blank")
                      } else {
                        this.render("object/node/popup-details", locationListItem, child)
                      }
                    }
                  }
                }
              })

            }

            if (child.hasAttribute("open-cart")) {

              this.add("outline-hover", child)
              child.onclick = () => {

                const quantityInput = item.querySelector("input.quantity")
                if (this.verifyIs("text/+int", quantityInput.value)) {

                  const cart = JSON.parse(window.localStorage.getItem("cart")) || []

                  let found = false
                  for (let i = 0; i < cart.length; i++) {
                    const cartItem = cart[i]

                    if (item.id === `${cartItem.id}`) {
                      cartItem.quantity = Number(cartItem.quantity) + Number(quantityInput.value)
                      window.localStorage.setItem("cart", JSON.stringify(cart))
                      found = true
                    }

                  }

                  if (found === false) {
                    const map = {}
                    map.id = item.id
                    map.quantity = Number(quantityInput.value)
                    map.titel = item.querySelector(".titel").textContent
                    map.image = item.querySelector(".image").src
                    map.price = item.querySelector(".price").textContent
                    cart.unshift(map)
                  }
                  window.localStorage.setItem("cart", JSON.stringify(cart))

                  this.overlay("popup", overlay => {
                    this.render("text/h1", "Mein Angebot", overlay)
                    this.render("text/right-hr", "Preis", overlay)
                    const cart = JSON.parse(window.localStorage.getItem("cart")) || []
                    this.render("cart/node/open", cart, overlay)
                  })

                } else {
                  this.add("style/node/not-valid", quantityInput)
                }

              }
            }

          }

        }

      }
    }

    if (event === "user-trees-closed") {

      function renderUserInNode(user, node) {
        for (let i = 0; i < Object.keys(user).length; i++) {
          const key = Object.keys(user)[i]
          if (node.classList.contains(key)) {
            if (node.tagName === "IMG") {
              node.src = user[key]
              continue
            }
            node.textContent = user[key]
          }
        }
      }

      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/get/user/trees-closed/", {trees: input})
          if (res.status === 200) {
            const user = JSON.parse(res.response)
            const nodes = document.querySelectorAll(parent)
            if (nodes) {
              for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i]
                renderUserInNode(user, node)
                for (let i = 0; i < node.querySelector("*").length; i++) {
                  const child = node.querySelector("*")[i]
                  renderUserInNode(user, child)
                }
              }
            }
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "user-trees-open") {

      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/get/user/trees-open/", {trees: input})
          if (res.status === 200) {
            const users = JSON.parse(res.response)
            for (let i = 0; i < users.length; i++) {
              const user = users[i]
              this.render("user/selector/all", user, parent)
            }
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })


    }

    if (event === "users-trees-open") {

      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/get/user/trees-open/", {trees: input})
          if (res.status === 200) {
            const users = JSON.parse(res.response)
            const parentNode = document.querySelector(parent)
            if (parentNode) {
              const childNode = parentNode.querySelector(".user")
              const fragment = document.createDocumentFragment()
              for (let i = 0; i < users.length; i++) {
                const user = users[i]
                const userNode = this.render("object-node", user, childNode.cloneNode(true))
                fragment.appendChild(userNode)
              }
              parentNode.appendChild(fragment)
              childNode.style.display = "none"
            }
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }

  }

  static remove(event, input) {

    if (event === "element/selector") {
      return new Promise(async(resolve, reject) => {
        try {

          const promises = []
          input.element.querySelectorAll(input.selector).forEach(it => {
            const promise = new Promise(innerResolve => {
              it.remove()
              innerResolve()
            })
            promises.push(promise)
          })
          await Promise.all(promises)

          resolve()

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "toolbox") {

      return new Promise(async(resolve, reject) => {
        try {

          await this.remove("element/selector", {element: input, selector: "#toolbox-getter"})
          await this.remove("element/selector", {element: input, selector: "[data-id]"})
          await this.remove("element/selector", {element: input, selector: "#toolbox"})
          await this.remove("element/selector", {element: input, selector: ".overlay"})

          resolve()

        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "element/selected-node") {

      return new Promise(async(resolve, reject) => {
        try {

          const promises = []
          input.querySelectorAll("*").forEach(element => {
            const promise = new Promise(innerResolve => {
              element.style.outline = null
              element.removeAttribute("selected-node")
              innerResolve()
            })
            promises.push(promise)
          })
          await Promise.all(promises)

          input.style.outline = null
          input.removeAttribute("selected-node")

          resolve()

        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "event-listener") {
      Array.from(document.querySelectorAll('*')).forEach(element => element.replaceWith(element.cloneNode(true)));
    }

    if (event === "overlays") {
      document.querySelectorAll(".overlay").forEach(it => it.remove())
    }

    if (event === "node/sign") {
      input.style.border = ""
      input.parentElement.querySelectorAll("div.sign").forEach(it => it.remove())
    }

  }

  static request(event, input, type = "json") {

    if (type === "json") {
      return new Promise(async(resolve, reject) => {
        try {
          if (input === undefined) input = {}
          input.location = window.location.href
          input.referer = document.referrer
          input.localStorageEmail = window.localStorage.getItem("email")
          input.localStorageId = window.localStorage.getItem("localStorageId")
          const xhr = new XMLHttpRequest()
          xhr.open("POST", event)
          xhr.setRequestHeader("Accept", "application/json")
          xhr.setRequestHeader("Content-Type", "application/json")
          xhr.overrideMimeType("text/html")
          xhr.withCredentials = true
          xhr.onload = () => resolve(xhr)
          xhr.send(JSON.stringify(input))
        } catch (error) {
          reject(error)
        }
      })
    }

    if (type === "beacon") {

      const url = new URL(event, window.location.origin)
      url.searchParams.append("id", input)
      return navigator.sendBeacon(url.href)
    }

  }

  static sort(event, input) {
    // event = input/by/algorithm

    // sort by text
    // if (event === "property-query") {
    //   const filtered = input.array.filter(it => it[input.property].toLowerCase().includes(input.query.toLowerCase()))
    //   return filtered.map(it => { ...it })
    // }

    if (event === "array/reputation/descending") {
      return input?.sort((a, b) => b.reputation - a.reputation)
    }

  }

  static style(node, input) {
    if (node) {
      if (input.fontFamily) node.style.fontFamily = input.fontFamily
      if (input.fontSize) node.style.fontSize = input.fontSize
      if (input.height) node.style.height = input.height
      if (input.width) node.style.width = input.width
      if (input.overflow) node.style.overflow = input.overflow
      if (input.margin) node.style.margin = input.margin
      if (input.marginLeft) node.style.marginLeft = input.marginLeft
      if (input.color) node.style.color = input.color
      if (input.display) node.style.display = input.display
    }
  }

  static update(event, parent, input) {
    // event = tag/on/algorithm

    // no parent needed to get data
    if (arguments.length === 2) {
      input = parent
    }


    if (event === "toolbox-getter") {

      return new Promise(async resolve => {

        document.querySelectorAll("#toolbox-getter").forEach(getter => getter.remove())
        document.querySelectorAll("#toolbox").forEach(toolbox => toolbox.remove())
        document.querySelectorAll("[data-id='toolbox']").forEach(toolbox => toolbox.remove())

        if (document.getElementById("#toolbox-getter") === null) {
          await this.add("script/toolbox-getter")
          return resolve()
        }

      })

    }

    if (event === "input/type") {

      const create = document.createElement("input")

      if (parent.hasAttribute("id")) {
        create.setAttribute("id", parent.getAttribute("id"))
      }

      create.setAttribute("type", input)

      if (parent.hasAttribute("class")) {
        create.setAttribute("class", parent.getAttribute("class"))
      }

      if (parent.hasAttribute("style")) {
        create.setAttribute("style", parent.getAttribute("style"))
      }

      if (parent.hasAttribute("required")) {
        create.setAttribute("required", parent.getAttribute("required"))
      }

      if (parent.hasAttribute("on-info-click")) {
        create.setAttribute("on-info-click", parent.getAttribute("on-info-click"))
      }

      parent.before(create)
      parent.remove()
    }

    if (event === "field-input/type") {

      if (parent.tagName !== "TEXTAREA") {

        if (input === "textarea") {
          this.convert("element/textarea", parent)
        }

      }

      if (parent.tagName !== "SELECT") {
        if (input === "select") {
          this.convert("element/select", parent)
        }
      }

      this.update("input/type", parent, input)

    }

  }

  static skipSiblings(index, sibling) {

    let count = 0
    let currentSibling = sibling

    while (currentSibling) {
      if (count >= index) break

      const nextSibling = currentSibling.nextSibling

      if (currentSibling.nodeType === Node.ELEMENT_NODE) {
        count++
        currentSibling.style.visibility = 'hidden'
        currentSibling.style.position = 'absolute'
      }

      currentSibling = nextSibling
    }

    if (currentSibling && currentSibling.nodeType === Node.ELEMENT_NODE) {
      currentSibling.style.visibility = 'visible'
      currentSibling.style.position = 'static'
    }

    if (count < index) throw new Error("out of bounds")

  }

  static verify(event, input, check) {
    // promises only
    // event = input/algo

    if (event === "any/key/exist") {

      if (!this.verifyIs("object", input)) return false
      if (input.hasOwnProperty(check)) return true
      for (const key in input) {
        if (input.hasOwnProperty(key) && typeof input[key] === 'object') {
          if (this.verify(event, input[key], check)) {
            return true
          }
        }
      }
      return false

    }

    if (event === "field-funnel") {
      return new Promise(async(resolve, reject) => {
        try {

          const promises = []
          input.querySelectorAll(".field").forEach(async field => {
            const fieldInput = field.querySelector(".field-input")
            const promise = this.verifyIs("input/valid", fieldInput)

            promises.push(promise)
          })

          const results = await Promise.all(promises)

          if (results.every((element) => element === true)) {
            resolve()
          } else {
            for (let i = 0; i < input.querySelectorAll(".field").length; i++) {
              const field = input.querySelectorAll(".field")[i]
              const fieldInput = field.querySelector(".field-input")
              const res = await this.verifyIs("input/valid", fieldInput)
              if (res === false) {
                field.scrollIntoView({ behavior: "smooth", block: "start" })
                break
              }
            }
          }

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "input/value") {

      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.verifyIs("input/valid", input)
          if (res === true) resolve()
          if (res === false) throw new Error("input invalid")
        } catch (error) {
          reject(error)
        }
      })
    }

  }

  static verifyIs(event, input) {
    // return boolean only

    if (event === "array") {
      if (typeof input === "object") {
        if (Array.isArray(input)) return true
      }
      return false
    }

    if (event === "array/empty") {
      return !Array.isArray(input) || input.length === 0
    }

    if (event === "object") {
      if (typeof input === "object") return true
      return false
    }

    if (event === "object/empty") {
      return typeof input !== "object" ||
      input === undefined ||
      input === null ||
      Object.getOwnPropertyNames(input).length <= 0
    }

    if (event === "file/extension") {
      try {

        const fileExtension = input.file.name.split('.').pop()
        if (fileExtension === input.extension) return true
        return false

      } catch (error) {
        return false
      }
    }

    if (event === "file/extensions") {
      return new Promise((resolve, reject) => {
        try {
          const fileExtension = input.file.name.split('.').pop()
          for (let i = 0; i < input.extensions.length; i++) {
            const extension = input.extensions[i]

            if (this.verifyIs("file/extension", {file: input.file, extension})) {
              resolve()
            }

          }
          throw new Error("file extension not allowed")
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "file/type") {
      if (input.file.type === input.type) return true
      return false
    }

    if (event === "file/types") {
      return new Promise((resolve, reject) => {
        try {
          for (let i = 0; i < input.types.length; i++) {
            const type = input.types[i]
            if (this.verifyIs("file/type", {file: input.file, type })) {
              resolve()
            }
          }
          throw new Error("mime type not allowed")
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "file/image") {

      return new Promise(async(resolve, reject) => {
        try {

          const allowedMimeTypes = ["image/jpeg", "image/png", "image/svg+xml"]
          const allowedExtensions = ["jpg", "jpeg", "png", "svg"]

          const types = await this.verifyIs("file/mime-types", {file: input, types: allowedMimeTypes})

          if (types === false) {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            throw new Error("no image")
          }

          const extensions = await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})

          if (extensions === false) {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            throw new Error("no image")
          }

          resolve(true)

        } catch (error) {
          resolve(false)
        }
      })


    }

    if (event === "file/pdf") {

      return new Promise(async(resolve, reject) => {
        try {

          const allowedMimeTypes = ["application/pdf"]
          const allowedExtensions = ["pdf"]

          const types = await this.verifyIs("file/mime-types", {file: input, types: allowedMimeTypes})

          if (types === false) {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            throw new Error("no pdf")
          }

          const extensions = await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})

          if (extensions === false) {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            throw new Error("no pdf")
          }

          resolve(true)

        } catch (error) {
          resolve(false)
        }
      })


    }

    if (event === "file/html") {

      return new Promise(async(resolve, reject) => {
        try {

          const allowedMimeTypes = ["text/html"]
          const allowedExtensions = ["html"]

          const types = await this.verifyIs("file/mime-types", {file: input, types: allowedMimeTypes})

          if (types === false) {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            throw new Error("no html")
          }

          const extensions = await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})

          if (extensions === false) {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            throw new Error("no html")
          }

          resolve(true)

        } catch (error) {
          resolve(false)
        }
      })


    }

    if (event === "file/svg+xml") {

      return new Promise(async(resolve, reject) => {
        try {

          const allowedMimeTypes = ["image/svg+xml"]
          const allowedExtensions = ["svg"]

          const types = await this.verifyIs("file/mime-types", {file: input, types: allowedMimeTypes})

          if (types === false) {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            throw new Error("no svg")
          }

          const extensions = await this.verifyIs("file/extensions", {file: input, extensions: allowedExtensions})

          if (extensions === false) {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            throw new Error("no svg")
          }

          resolve(true)

        } catch (error) {
          resolve(false)
        }
      })


    }

    if (event === "file/mp3") {
      return new Promise(async(resolve, reject) => {
        try {
          const reader = new FileReader()

          const blobSlice = input.slice(0, 4)

          reader.onloadend = () => {
            const arrayBuffer = new Uint8Array(reader.result)

            const bytes = []
            arrayBuffer.forEach(byte => {
              bytes.push(byte.toString(16))
            })
            const fileType = bytes.join('').toUpperCase()

            const mp3Signature = "494433"

            if (fileType.startsWith(mp3Signature)) {
              resolve(true)
            } else {
              resolve(false)
            }

          }

          reader.readAsArrayBuffer(blobSlice)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "key/object-array") {
      for (const object of input.array) {
        if (object.hasOwnProperty(input.key)) {
          return true
        }
      }
      return false
    }

    if (event === "number/empty") {
      return input === undefined ||
      input === null ||
      Number.isNaN(input) ||
      typeof input !== "number" ||
      input === ""
    }

    if (event === "script-id/disabled") {
      if (!this.verifyIs("text/empty", input)) {
        const scripts = JSON.parse(window.localStorage.getItem("scripts")) || []
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i]
          if (script.id === input) {
            if (script.disabled) {
              return true
            }
          }
        }
      }
      return false
    }

    if (event === "tag/empty") {
      return this.verifyIs("text/empty", input) || !/^[a-z](?:-?[a-z]+)*$/.test(input)
    }

    if (event === "text/json") {
      try {
        JSON.parse(input)
        return true
      } catch (error) {
        return false
      }
      return false
    }

    if (event === "text/operator") {
      if (input === "=") return true
      if (input === ">=") return true
      if (input === "<=") return true
      if (input === "!=") return true
      if (input === "<") return true
      if (input === ">") return true
      return false
    }

    if (event === "text/url") {
      try {
        new URL(input)
        return true
      } catch (error) {
        return false
      }
    }

    if (event === "text/email") {
      if (typeof input !== "string") return false
      if (input === undefined) return false
      if (input === null) return false
      if (input === "") return false
      if (input === "null") return false
      if (input.replace(/\s/g, "") === "") return false
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) === false) return false
      if (/^(.+)@(.+)$/.test(input) === true) return true
      return false
    }

    if (event === "text/empty") {
      return typeof input !== "string" ||
        input === "undefined" ||
        input === undefined ||
        input === null ||
        input === "null" ||
        input === "" ||
        input.replace(/\s/g, "") === ""
    }

    if (event === "text/js") {

      try {
        if (this.verifyIs("text/empty", input) === true) throw new Error("text is empty")
        new Function(input)
        return true
      } catch (error) {
        return false
      }

    }

    if (event === "text/script") {
      try {
        const fragment = this.convert("text/fragment", input)
        const script = fragment.querySelector("script")
        return script !== null && script.tagName === "SCRIPT"
      } catch {}
      return false
    }

    if (event === "text/tree") {

      if (/^(?!.*[-.]{2,})(?!.*^-)(?!.*\.$)(?!.*\.\.$)[a-z]+([-.][a-z]+|\.\d+)*$/.test(input)) {
        return true
      } else {
        return false
      }
    }

    if (event === "text/trees") {

      if (!input.startsWith("[")) return false
      if (!input.endsWith("]")) return false
      try {
        const array = JSON.parse(input)
        for (let i = 0; i < array.length; i++) {
          const text = array[i]
          if (this.verifyIs("text/tree", text)) return true
        }
      } catch {}
      return false
    }

    if (event === "text/tel") {
      if (typeof input !== "string") return false
      if (/^\+[0-9]+$/.test(input) === true) return true
      return false
    }

    if (event === "field-funnel/valid") {
      return new Promise(async(resolve, reject) => {
        try {

          const promises = []
          input.querySelectorAll(".field").forEach(async field => {
            const fieldInput = field.querySelector(".field-input")
            const promise = this.verifyIs("input/valid", fieldInput)

            promises.push(promise)
          })

          const results = await Promise.all(promises)

          if (results.every((element) => element === true)) {
            resolve(true)
          } else {
            resolve(false)
          }

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "text/number") {

      try {
        return !isNaN(Number(input))
      } catch (error) {
        return false
      }

    }

    if (event === "text/int") {

      try {
        const number = Number(input)
        return Number.isInteger(number)
      } catch (error) {
        return false
      }

    }

    if (event === "text/+int") {

      try {
        const number = Number(input)
        return Number.isInteger(number) && number > 0
      } catch (error) {
        return false
      }

    }

    if (event === "text/isbn") {
      return /^\d{9}[\dXx]$/.test(input.replace(/-/g, '')) || /^\d{13}$/.test(input.replace(/-/g, ''))
    }

    if (event === "text/path") {

      if (input.length === 1) {
        if (input.startsWith("/")) return true
      }
      if (/^\/[\w\-._~!$&'()*+,;=:@/]+\/$/.test(input) === true) return true
      return false
    }

    if (event === "input/valid") {

      return new Promise((resolve) => {


        // required, no accept
        if (input.hasAttribute("required") && !input.hasAttribute("accept")) {
          if (this.verifyIs("input/required", input)) {
            this.add("style/node/valid", input)
            return resolve(true)
          } else {
            this.add("style/node/not-valid", input)
            if (input.parentElement) input.parentElement.scrollIntoView({behavior: "smooth"})
            return resolve(false)
          }
        }

        // accept, no required
        if (input.hasAttribute("accept") && !input.hasAttribute("required")) {

          if (input.value === "") {

            this.add("style/node/valid", input)
            return resolve(true)

          } else {

            if (this.verifyIs("input/accepted", input)) {

              this.add("style/node/valid", input)
              return resolve(true)

            } else {
              this.add("style/node/not-valid", input)
              if (input.parentElement) input.parentElement.scrollIntoView({behavior: "smooth"})
              return resolve(false)
            }

          }

        }

        // no accept, no required
        if (!input.hasAttribute("accept") && !input.hasAttribute("required")) {
          this.add("style/node/valid", input)
          return resolve(true)
        }

        // accept and required
        if (input.hasAttribute("required") && input.hasAttribute("accept")) {
          if (this.verifyIs("input/required", input)) {
            if (this.verifyIs("input/accepted", input)) {
              this.add("style/node/valid", input)
              return resolve(true)
            }
          }
          this.add("style/node/not-valid", input)
          if (input.parentElement) input.parentElement.scrollIntoView({behavior: "smooth"})
          return resolve(false)
        }


      })

    }

    if (event === "input/accepted") {

      if (input.getAttribute("accept") === "application/pdf") {

        return new Promise(async(resolve, reject) => {

          try {

            const promises = []
            for (var i = 0; i < input.files.length; i++) {
              const file = input.files[i]
              const promise = this.verifyIs("file/pdf", file)
              promises.push(promise)
            }

            const results = await Promise.all(promises)

            if (results.every((element) => element === true)) {
              resolve(true)
            } else {
              resolve(false)
            }

          } catch (error) {
            resolve(false)
          }

        })

      }

      if (input.getAttribute("accept") === "text/js") {

        try {
          return this.verifyIs("text/js", input.value)
        } catch (error) {
          return false
        }
      }

      if (input.getAttribute("accept") === "text/trees") {
        if (this.verifyIs("text/trees", input.value)) return true
        return false
      }

      if (input.getAttribute("accept") === "text/tree") {
        input.value = input.value.replace(/ /g, ".")

        if (this.verifyIs("text/tree", input.value) === true) return true

        return false

      }

      if (input.getAttribute("accept") === "text/operator") {
        return this.verifyIs("text/operator", input.value)
      }

      if (input.getAttribute("accept") === "text/email") {
        if (typeof input.value !== "string") return false
        if (/^(.+)@(.+)$/.test(input.value) === true) return true
        return false
      }

      if (input.getAttribute("accept") === "text/url") {
        if (this.verifyIs("text/url", input.value)) return true
        return false
      }

      if (input.getAttribute("accept") === "text/number") {
        if (this.verifyIs("text/number", input.value)) return true
        return false
      }

      if (input.requiredIndex !== undefined) {
        let selected = []
        for (let i = 0; i < input.options.length; i++) {
          const option = input.options[i]
          if (option.selected === true) {
            selected.push(option)
          }
        }
        for (let i = 0; i < selected.length; i++) {
          if (selected[i].value === input.options[input.requiredIndex].value) {
            return true
          }
        }
      }

      if (input.getAttribute("accept") === "text/tel") {
        if (this.verifyIs("text/tel", input.value)) return true
        return false
      }

      if (input.getAttribute("accept") === "text/id") {
        if (typeof input.value !== "string") return false
        input.value = input.value.replace(/ /g, "-")
        if (/^[a-z](?:-?[a-z]+)*$/.test(input.value) === true) {
          if (document.querySelectorAll(`#${input.value}`).length === 0) {
            return true
          } else {
            return false
          }
        }
        return false
      }

      if (input.getAttribute("accept") === "text/path") {
        if (this.verifyIs("text/path", input.value)) return true
        return false
      }

      if (input.getAttribute("accept") === "text/hex") {
        if (typeof input.value !== "string") return false
        if (/^[0-9A-Fa-f]+$/.test(input.value) === true) return true
        return false
      }

      if (input.getAttribute("accept") === "text/tag") {
        if (typeof input.value !== "string") return false
        input.value = input.value.replace(/ /g, "-")
        if (/^[a-z](?:-?[a-z]+)*$/.test(input.value) === true) return true
        return false
      }

      if (input.getAttribute("accept") === "text/https") {

        if (input.value.startsWith("https://")) return true
        return false

      }

      if (input.getAttribute("accept") === "email/array") {

        if (!input.value.startsWith("[")) return false
        if (!input.value.endsWith("]")) return false
        try {
          const array = JSON.parse(input.value)
          for (let i = 0; i < array.length; i++) {
            const email = array[i]

            if (Helper.verifyIs("email/empty", email)) return false

          }
          return true
        } catch (error) {
          return false
        }


      }

      if (input.getAttribute("accept") === "string/array") {

        if (!input.value.startsWith("[")) return false
        if (!input.value.endsWith("]")) return false
        try {
          const array = JSON.parse(input.value)
          for (let i = 0; i < array.length; i++) {
            const string = array[i]

            if (Helper.verifyIs("text/empty", string)) return false

          }
          return true
        } catch (error) {
          return false
        }


      }

      if (input.getAttribute("accept") === "text/script") {
        if (this.verifyIs("text/script", input.value)) return true
        return false
      }

      if (input.getAttribute("accept") === "text/field-funnel") {
        const funnel = this.convert("text/first-child", input.value)
        if (funnel === undefined) return false
        if (funnel.tagName === "DIV") {
          if (funnel.classList.contains("field-funnel")) return true
        }
        return false
      }


      return false
    }

    if (event === "input/required") {


      // input required
      if (
        input.hasAttribute("required") ||
        input.getAttribute("required") === "true" ||
        input.required === true
      ) {

        if (input.getAttribute("type") === "checkbox") {

          if (input.getAttribute("checked") === "true") return true
          if (input.checked === true) return true

          return false
        }

        if (!this.verifyIs("text/empty", input.value)) return true
        return false

      }

      // select required
      if (input.requiredIndex !== undefined) {
        for (let i = 0; i < input.options.length; i++) {
          const option = input.options[i]
          if (option.selected === true) {
            if (option.value !== input.options[input.requiredIndex].value) {
              return true
            }
          }
        }
      }
      return false
    }

    if (event === "id/unique") {
      return document.getElementById(input) === null
    }

    if (event === "text/id") {
      if (this.verifyIs("text/tag", input)) {
        if (document.querySelectorAll(`#${input}`).length === 0) {
          return true
        } else {
          return false
        }
      }
    }

    if (event === "class/closest-node") {

      try {

        const result = input.node.closest(`.${input.class}`)

        if (result === null) {
          return false
        } else {
          return true
        }

      } catch (error) {
        return false
      }
    }

    if (event === "class/found") {
      return new Promise(async(resolve, reject) => {
        try {
          let found = false
          input.node.querySelectorAll("*").forEach((item, i) => {
            if (item.classList.contains(input.class)) {
              found = true
            }
          })
          resolve(found)

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "class/loaded") {
     return new Promise(async (resolve, reject) => {
        try {
          const observer = new MutationObserver((mutations, observer) => {
            for (let i = 0; i < mutations.length; i++) {
              const mutation = mutations[i]

              if (mutation.type === "childList") {

                if (mutation.target.classList.contains(input)) {
                  resolve(mutation.target)
                }

              }
            }
          })
          observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
          })

        } catch (error) {
          reject(error)
        }
     })
    }

    if (event === "id/loaded") {

      return new Promise(async(resolve, reject) => {
        try {

          const observer = new MutationObserver((mutations, observer) => {
            for (let i = 0; i < mutations.length; i++) {
              const mutation = mutations[i]

              if (mutation.type === "childList") {

                mutation.addedNodes.forEach(node => {

                  if (node.id === input) {
                    resolve(node)
                  }

                })

              }

            }
          })
          observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
          })

        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "element/loaded") {

      return new Promise(async(resolve, reject) => {
        try {

          const observer = new MutationObserver((mutations, observer) => {
            for (let i = 0; i < mutations.length; i++) {
              const mutation = mutations[i]

              if (mutation.type === "childList") {

                mutation.addedNodes.forEach(node => {

                  if (node.id === input) {
                    resolve(node)
                  }

                })

              }

            }
          })
          observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
          })

        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "element/html") {
      const htmlString = input.outerHTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, 'text/html')

      const parsedElement = doc.body.firstChild
      if (!parsedElement) {
        return false
      }

      for (let i = 0; i < parsedElement.children.length; i++) {
        const child = parsedElement.children[i]
        if (!this.verifyIs("element/html", child)) {
          return false
        }
      }

      return true
    }

    if (event === "email/empty") {
      return this.verifyIs("text/empty", input) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
    }

    if (event === "text/hex") {
      if (typeof input !== "string") return false
      if (/^[0-9A-Fa-f]+$/.test(input) === true) return true
      return false
    }

    if (event === "text/tag") {
      if (typeof input !== "string") return false
      if (/^[a-z](?:-?[a-z]+)*$/.test(input) === true) return true
      return false
    }

  }

}


Helper.registerHtmlButton = await Helper.create("toolbox/register-html")
Helper.removeOverlayButton = await Helper.create("button/remove-overlay")
Helper.createNode = Helper.fn("createNode")

let lastPage = document.referrer
window.goBack = () => {
  if (window.history.length === 1) {
    window.close()
    return
  }
  if (Helper.verifyIs("text/empty", document.referrer)) {
    window.history.back()
  }
  if (lastPage === window.location.href) {
    window.close()
    return
  }
  window.history.back()
  setTimeout(() => {
    window.close()
  }, 34)
}
