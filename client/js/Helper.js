import {button, action} from "/js/button.js"
import {postFormData, post, text} from "/js/request.js"
import {label} from "/js/html-tags.js"

export class Helper {
  static add(event, input) {
    // add event to input
    // no dom creation, events only
    if (event === "accept") {
      const accept = input.node.getAttribute("accept")
      input.node.setAttribute("accept", `${accept}, ${input.type}`)
    }
    if (event === "attributes-observer") {
      const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes') {
            const lockedAttributes = [
              "accept",
              "id",
              "maxlength",
              "required",
              "min",
              "max",
              "pattern",
              "step",
              "type",
              "value",
              "disabled",
              "readonly",
              "minlength",
            ]
            if (lockedAttributes.includes(mutation.attributeName)) {
              window.location.reload()
            }
          }
        }
      })
      input.forEach(node => {
        observer.observe(node, { attributes: true })
      })
      return observer
    }
    if (event === "cite-button") {
      let citeButton = document.querySelector("div.cite-button")
      if (!citeButton) {
        citeButton = this.create("cite-button", document.body)
      }
      citeButton.addEventListener("click", (ev) => {
        ev.stopPropagation()
        ev.preventDefault()
        navigator.clipboard.writeText(input).then(() => window.alert(`${input}\n\nQuelle wurde erfolgreich in deiner Zwischenablage gespeichert.`))
      })
    }
    if (event === "background/node/hover") {
      input.addEventListener("mouseover", () => {
        input.style.backgroundColor = "#999"
      })

      input.addEventListener("mouseout", () => {
        input.style.backgroundColor = null
      })
    }
    if (event === "cite-checker") {
      const cites = document.querySelectorAll(`[class*="cite"]`)
      cites.forEach(cite => {
        this.add("hover-outline", cite)
        cite.onclick = () => {
          const originalTextContent = cite.textContent

          function createIntegrations(text) {
            const webSearchEngines = [
              { name: 'Google', url: `https://www.google.com/search?q=${text}` },
              { name: 'Bing', url: `https://www.bing.com/search?q=${text}` },
              { name: 'Yahoo', url: `https://search.yahoo.com/search?p=${text}` },
              { name: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${text}` },
              { name: 'Baidu', url: `https://www.baidu.com/s?wd=${text}` },
              { name: 'Yandex', url: `https://yandex.com/search/?text=${text}` },
            ]

            const academicSearchEngines = [
              { name: 'Google Books', url: `https://books.google.com/books?q=${encodeURIComponent(text)}` },
              { name: 'WorldCat', url: `https://www.worldcat.org/search?q=${encodeURIComponent(text)}` },
              { name: 'Open Library', url: `https://openlibrary.org/search?q=${encodeURIComponent(text)}` },
              { name: 'Internet Archive', url: `https://archive.org/search.php?query=${encodeURIComponent(text)}` },
              { name: 'Library of Congress', url: `https://catalog.loc.gov/vwebv/search?searchArg=${encodeURIComponent(text)}&searchCode=GKEY%5E*&searchType=0&recCount=25` },
              { name: 'Google Scholar', url: `https://scholar.google.com/scholar?q=${text}` },
              { name: 'PubMed', url: `https://pubmed.ncbi.nlm.nih.gov/?term=${text}` },
              { name: 'CrossRef', url: `https://search.crossref.org/search/works?q=${text}&from_ui=yes` },
              { name: 'Semantic Scholar', url: `https://www.semanticscholar.org/search?q=${text}` },
              { name: 'IEEE Xplore', url: `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${text}` },
              { name: 'SpringerLink', url: `https://link.springer.com/search?query=${text}` },
              { name: 'Wiley Online Library', url: `https://onlinelibrary.wiley.com/action/doSearch?AllField=${text}` },
              { name: 'ResearchGate', url: `https://www.researchgate.net/search?q=${text}` },
            ]

            const codingPlatforms = [
              { name: 'GitHub', url: `https://github.com/search?q=${encodeURIComponent(text)}` },
              { name: 'CodePen', url: `https://codepen.io/search/pens?q=${encodeURIComponent(text)}` }
            ]

            const developerCommunities = [
              { name: 'Stack Overflow', url: `https://stackoverflow.com/search?q=${encodeURIComponent(text)}` },
              { name: 'Stack Exchange', url: `https://stackexchange.com/search?q=${text}` },
              { name: 'Dev.to', url: `https://dev.to/search?q=${encodeURIComponent(text)}` }
            ]

            const translationTools = [
              { name: 'DeepL', url: `https://www.deepl.com/translator#auto/de/${encodeURIComponent(text)}` },
              { name: 'Google Translate', url: `https://translate.google.com/?sl=auto&tl=de&text=${encodeURIComponent(text)}&op=translate` },
            ]

            const informationReference = [
              { name: 'Wikipedia', url: `https://www.wikipedia.org/wiki/Special:Search?search=${text}` },
              { name: 'Wikileaks', url: `https://wikileaks.org/wiki/Special:Search?search=${text}` },
              { name: 'Infoplease', url: `https://www.infoplease.com/search/${text}` },
            ]

            const integrations = [
              ...webSearchEngines,
              ...academicSearchEngines,
              ...codingPlatforms,
              ...developerCommunities,
              ...translationTools,
              ...informationReference,
            ]

            integrations.sort((a, b) => a.name.localeCompare(b.name))
            return integrations
          }

          function createIntegrationButton(text, node) {
            const button = Helper.create("button/left-right", node)
            button.right.remove()
            button.left.textContent = text
            button.onclick = () => {
              Helper.overlay("pop", overlay => {
                overlay.info.textContent = text
                const content = overlay.content
                const integrations = createIntegrations(text)
                const windowOpenButton = Helper.create("button/left-right", content)
                windowOpenButton.left.textContent = "window.open"
                windowOpenButton.right.textContent = "Öffne den Inhalt in einem neuen Tab"
                windowOpenButton.onclick = () => {
                  if (text.startsWith("www.")) {
                    window.open(`https://${text}`, "_blank")
                    return
                  }

                  if (text.startsWith("https://")) {
                    window.open(text, "_blank")
                    return
                  }
                  window.open(`https://www.${text}`, "_blank")
                }
                const copyToClipboardButton = Helper.create("button/left-right", content)
                copyToClipboardButton.left.textContent = ".copy-to-clipboard"
                copyToClipboardButton.right.textContent = "Inhalt in die Zwischenablage speichern"
                copyToClipboardButton.onclick = async () => {
                  try {
                    await navigator.clipboard.writeText(text)
                    window.alert("Inhalt wurde erfolgreich in die Zwischenablage gespeichert.")
                  } catch (error) {
                    console.error(error)
                    window.alert("Fehler.. Bitte wiederholen.")
                  }
                }
                for (let i = 0; i < integrations.length; i++) {
                  const integration = integrations[i]
                  const button = Helper.create("button/left-right", content)
                  button.left.textContent = integration.name
                  button.right.textContent = "Öffnet ein neues Fenster"
                  button.onclick = () => {
                    window.open(integration.url, "_blank")
                    Helper.remove("overlays")
                  }
                }
              })
            }
          }

          if (cite.classList.contains("full-cite")) {

            const parts = originalTextContent.split(', ')
            this.overlay("pop", overlay => {
              overlay.info.textContent = ".cite-checker"
              const content = overlay.content
              this.render("text/h2", "Inhalt wählen", content)
              createIntegrationButton(parts.join(", "), content)
              for (let i = 0; i < parts.length; i++) {
                const part = parts[i]
                createIntegrationButton(part, content)
              }
            })
          }

          if (cite.classList.contains("inline-cite")) {

            const splitString = window.prompt("Gebe ein Zeichen oder eine Zeichenkette ein, nach der du den Inhalt aufteilen möchtest.")
            if (splitString === null) return
            const splittedTextContent = originalTextContent.split(splitString)
            this.overlay("pop", overlay => {
              overlay.info.textContent = ".cite-checker"
              const content = overlay.content
              this.render("text/h2", "Inhalt wählen", content)
              for (let i = 0; i < splittedTextContent.length; i++) {
                const splittedText = splittedTextContent[i]
                const trimmedText = splittedText.trim()
                if (this.verifyIs("text/empty", splittedText)) continue
                createIntegrationButton(trimmedText, content)
              }
            })
          }

        }
      })
    }
    if (event === "class/dark-light") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.classList.add("bg-dark", "bs-dark", "border-dark", "color-dark")
      } else {
        input.classList.add("bg-light", "bs-light", "border-light", "color-light")
      }
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
    if (event === "select-options") {
      input.select.textContent = ""
      for (let i = 0; i < input.options.length; i++) {
        const option = document.createElement("option")
        option.value = input.options[i]
        option.text = input.options[i]
        input.select.appendChild(option)
      }
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
            this.request("/jwt/get/reputation/").then((res) => {

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
    if (event === "loading") {
      input.info = this.div("fs13 color-error sans-serif")
      input.info.textContent = "Das kann einen Moment dauern .."
      input.loading = this.render("icon/node/path", "/public/loading.svg").then(icon => {
        icon.classList.add("m13")
        const svg = icon.querySelector("svg")
        svg.classList.add("fill-error")
        this.append(icon, input)
        this.append(input.info, input)
      })
    }
    if (event === "my-value-units") {
      return new Promise(async(resolve, reject) => {
        try {
          const valueUnitsDiv = document.querySelector(".my-value-units")
          valueUnitsDiv.style.display = "flex"
          this.style(valueUnitsDiv, {display: "flex", overflowX: "auto", whiteSpace: "nowrap"})
          if (valueUnitsDiv) {
            const res = await this.request("/get/platform/values-writable/")
            if (res.status === 200) {
              const valueUnits = JSON.parse(res.response)
              valueUnitsDiv.textContent = ""
              for (let i = 0; i < valueUnits.length; i++) {
                const value = valueUnits[i]
                const valueBox = this.create("div")
                this.style(valueBox, {cursor: "pointer", width: "144px", borderRadius: "5px", margin: "21px 13px", fontFamily: "sans-serif", boxShadow: "rgba(0, 0, 0, 0.13) 0px 1px 3px"})
                valueUnitsDiv.appendChild(valueBox)
                this.add("hover-outline", valueBox)
                valueBox.onclick = () => {
                  window.open(value.path, "_blank")
                }
                const img = document.createElement("img")
                img.src = value.image
                if (value.image === undefined) img.src = "/public/image.svg"
                img.style.width = "100%"
                valueBox.appendChild(img)
                const title = document.createElement("div")
                title.textContent = value.alias
                this.style(title, {margin: "13px", overflow: "hidden", textOverflow: "ellipsis"})
                valueBox.appendChild(title)
                const requested = document.createElement("div")
                requested.textContent = `Angefordert: ${value.requested}`
                this.style(requested, {margin: "13px", whiteSpace: "break-word"})
                valueBox.appendChild(requested)
                function closedState(node) {
                  node.checked = false
                  Helper.add("style/not-valid", node)
                }
                function openState(node) {
                  node.checked = true
                  Helper.add("style/valid", node)
                }
                const openClosedField = this.create("input/checkbox", valueBox)
                openClosedField.input.onclick = (ev) => {
                  ev.stopPropagation()
                  if (openClosedField.input.checked === false) {
                    this.add("style/not-valid", openClosedField.input)
                    const confirm = window.confirm("Diese Werteinheit wird für keinen Sichtbar sein.\n\nMöchtest du fortfahren?")
                    if (confirm === false) {
                      if (openClosedField.input.checked === true) {
                        closedState(openClosedField.input)
                      }
                      if (openClosedField.input.checked === false) {
                        openState(openClosedField.input)
                      }
                      return
                    }
                    if (confirm === true) {
                      this.overlay("lock", async securityOverlay => {
                        const res = await this.request("/register/platform/value-visibility-writable/", {path: value.path, visibility: "closed"})
                        if (res.status === 200) {
                          closedState(openClosedField.input)
                          window.alert("Sichtbarkeit wurde gespeichert.")
                          securityOverlay.remove()
                        } else {
                          openState(openClosedField.input)
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }
                      })
                    }
                  }
                  if (openClosedField.input.checked === true) {
                    this.add("style/valid", openClosedField.input)
                    const confirm = window.confirm("Diese Werteinheit wird für alle Sichtbar sein.\n\nMöchtest du fortfahren?")
                    if (confirm === false) {
                      closedState(openClosedField.input)
                      return
                    }
                    if (confirm === true) {
                      this.overlay("lock", async securityOverlay => {
                        const res = await this.request("/register/platform/value-visibility-writable/", {path: value.path, visibility: "open"})
                        if (res.status === 200) {
                          openState(openClosedField.input)
                          window.alert("Sichtbarkeit wurde gespeichert.")
                          securityOverlay.remove()
                        } else {
                          closedState(openClosedField.input)
                          window.alert("Fehler.. Bitte wiederholen.")
                          securityOverlay.remove()
                        }
                      })
                    }
                  }
                }
                if (value.visibility === "open") {
                  openState(openClosedField.input)
                }
                if (openClosedField.input.checked === false) {
                  closedState(openClosedField.input)
                }
              }
            } else {
              valueUnitsDiv.textContent = "Es wurden keine Werteinheiten gefunden."

            }
            resolve()
          }
        } catch (error) {
          reject(error)
        }
      })
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
          this.add("style/valid", input)
        } else {
          this.add("style/not-valid", input)
        }
      })
    }
    if (event === "onclick/overlay-owner-funnel") {
      input.addEventListener("click", () => {

        this.overlay("pop", async overlay => {

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
    if (event === "onclick/selector/contact-location-expert") {
      document.querySelectorAll(input).forEach(node => {
        this.add("hover-outline", node)
        node.onclick = () => {

          this.overlay("pop", overlay => {
            this.render("text/h1", "Kontakt anfragen", overlay)

            const funnel = this.create("div/scrollable", overlay)

            const preferenceField = this.create("field/select", funnel)
            preferenceField.label.textContent = "Wie möchten Sie gerne kontaktiert werden"
            preferenceField.input.add(["E-Mail", "Telefon", "Webcall"])
            this.add("hover-outline", preferenceField.input)
            this.verify("input/value", preferenceField.input)

            const emailField = this.create("field/email", funnel)
            this.add("hover-outline", emailField.input)
            this.verify("input/value", emailField.input)
            emailField.input.oninput = () => this.verify("input/value", emailField.input)

            const subjectField = this.create("field/textarea", funnel)
            subjectField.label.textContent = "Betreff"
            subjectField.input.style.height = "89px"
            subjectField.input.placeholder = "Für eine schnelle Bearbeitung, können Sie uns hier den Grund Ihrer Kontaktanfrage nennen."
            subjectField.input.setAttribute("required", "true")
            this.add("hover-outline", subjectField.input)
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
                this.add("hover-outline", telField.input)
                this.verify("input/value", telField.input)
              } else {
                telField = undefined
              }

            }

            const submit = this.create("button/action", funnel)
            submit.textContent = "Kontakt jetzt anfragen"
            this.add("hover-outline", submit)
            submit.onclick = async () => {
              await this.verify("field-funnel", funnel)

              const preference = preferenceField.input.value
              const email = emailField.input.value
              const subject = subjectField.input.value
              if (subject.length > 144) {
                this.add("style/not-valid", subjectField.input)
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
    if (event === "open-toolbox") {
      const back = this.create("button/back")
      const toolbox = this.create("button/getyour")

      toolbox.style.zIndex = "2"

      back.setAttribute("data-id", "toolbox")
      toolbox.setAttribute("data-id", "toolbox")

      document.body.insertBefore(back, document.querySelector("#toolbox"))
      document.body.insertBefore(toolbox, document.querySelector("#toolbox"))

      toolbox.addEventListener("click", () => {
        this.overlay("tools")
      })
    }
    if (event === "oscillator") {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(input.stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      function draw(node) {
        requestAnimationFrame(() => draw(node))
        analyser.getByteTimeDomainData(dataArray)
        let canvas = node.querySelector("canvas")
        if (!canvas) {
          canvas = document.createElement("canvas")
          Helper.style(canvas, {position: "absolute", left: "0", top: "34%"})
          node.appendChild(canvas)
          canvas.width = node.offsetWidth
          canvas.height = 200
        }
        const canvasCtx = canvas.getContext("2d")
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
        canvasCtx.lineWidth = 2
        canvasCtx.strokeStyle = "rgb(0, 255, 0)"
        canvasCtx.beginPath()
        const sliceWidth = (canvas.width * 1.0) / bufferLength
        let x = 0
        for (let i = 0; i < bufferLength ;i++) {
          const v = dataArray[i] / 128.0
          const y = (v * canvas.height) / 2
          if (i === 0) {
            canvasCtx.moveTo(x, y)
          } else {
            canvasCtx.lineTo(x, y)
          }
          x += sliceWidth
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2)
        canvasCtx.stroke()
      }
      return {draw}
    }
    if (event === "pointer") {
      input.setAttribute("onmouseover", "this.style.cursor = 'pointer'; this.style.outline = '3px solid #999'")
      input.setAttribute("onmouseout", "this.style.cursor = null; this.style.outline = null")
    }
    if (event === "toolbox-getter") {
      const script = this.create("script/id", "toolbox-getter")
      this.add("script-onbody", script)
    }
    if (event === "toolbox/onbody") {
      return new Promise(async(resolve, reject) => {
        try {
          function addToolbox(){
            if (Helper.verifyIs("path/valid")) {
              function createToolboxButtons() {
                let back = document.querySelector("div.go-back")
                if (!back) back = button.div("go-back")
                button.addEvent("go-back", back)
                const toolbox = button.div("toolbox")
                back.setAttribute("data-id", "toolbox")
                toolbox.setAttribute("data-id", "toolbox")
                document.body.insertBefore(back, document.querySelector("#toolbox"))
                document.body.insertBefore(toolbox, document.querySelector("#toolbox"))
                toolbox.addEventListener("click", () => {
                  Helper.overlay("tools", {type: "expert"})
                })
              }
              createToolboxButtons()
              Helper.add("observer/id-mutation")
              const save = (ev) => {
                if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') {
                  ev.preventDefault()
                  Helper.add("register-html")
                }
              }
              window.addEventListener('keydown', save)
            }
          }
          const res = await this.request("/verify/user/closed/")
          if (res.status === 200) {
            const res = await this.request("/verify/user/location-expert/")
            if (res.status === 200) {
              addToolbox()
              resolve()
            }
            if (res.status !== 200) {
              const res = await this.request("/verify/user/location-writable/")
              if (res.status === 200) {
                addToolbox()
                resolve()
              }
            }
          }
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

            this.overlay("pop", async roleListOverlay => {
              // this.removeOverlayButton(roleListOverlay)

              const buttons = this.create("div/loading", roleListOverlay)

              // const res = await this.request("/get/users/trees/", {trees: [`${window.location.pathname.split("/")[2]}.${selected}`, `${window.location.pathname.split("/")[2]}.company.name`, `${window.location.pathname.split("/")[2]}.services`, "reputation"]})
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
                    this.overlay("pop", selectServicesOverlay => {
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

          // const res = await this.request("/get/users/trees/", {trees: ["getyour.expert.platforms"]})
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
              this.add("style/not-valid", serviceSelect)
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
    if (event === "funnel/hover") {
      input.querySelectorAll("*").forEach(node => {
        const shouldHover = (
          node.classList.contains("submit") ||
          node.tagName.toLowerCase() === "a" ||
          node.tagName.toLowerCase() === "select" ||
          node.tagName.toLowerCase() === "textarea" ||
          node.tagName.toLowerCase() === "input"
        )
        if (shouldHover) {
          this.add("hover-outline", node)
        }
      })
    }
    if (event === "register-html") {
      this.overlay("lock", async lock => {
        // prepare html state
        this.remove("element/selector", {element: document, selector: "[data-id]"})
        this.remove("element/selector", {element: document, selector: "#toolbox"})
        this.remove("element/selector", {element: document, selector: ".overlay"})
        this.remove("element/selector", {element: document, selector: ".no-save"})
        const html = document.documentElement.outerHTML.replace(/<html>/, "<!DOCTYPE html><html>")
        const successMessage = "Dokument erfolgreich gespeichert. +1 XP"
        // save html state
        const res = await this.request("/register/platform/value-html-location-expert/", {html})
        if (res.status === 200) {
          window.alert(successMessage)
          window.location.reload()
        } else {
          const res = await this.request("/register/platform/value-html-writable/", {html})
          if (res.status === 200) {
            window.alert(successMessage)
            window.location.reload()
          } else {
            window.alert("Fehler.. Bitte wiederholen.")
            await this.add("toolbox/onbody")
            lock.remove()
          }
        }
      })
    }
    if (event === "length-counter") {
      const length = input.maxLength
      const parent = input.parentElement
      const preview = this.div("monospace fs13", parent)
      preview.textContent = `0/${length}`
      input.addEventListener("input", ev => {
        const actualLength = ev.target.value.length
        preview.textContent = `${actualLength}/${length}`
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

          this.overlay("pop", async securityOverlay => {
            this.create("div/loading", securityOverlay)

            const res = await this.request("/register/location/list/", {tag: funnelTag, map})

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
    if (event === "nav/open") {
      {
        const button = this.create("button/left-right", input)
        button.left.textContent = ".data-protection"
        button.right.textContent = "Fördert Vertrauen in digitale Interaktionen"
        button.addEventListener("click", () => window.open("/datenschutz/", "_blank"))
      }
      this.render("button/login", "/login/", input)
      this.create("button/start", input)
      {
        const button = this.create("button/left-right", input)
        button.left.textContent = ".user-agreement"
        button.right.textContent = "Für Klarheit und Fairness im Umgang miteinander"
        button.addEventListener("click", () => window.open("/nutzervereinbarung/", "_blank"))
      }
    }
    if (event === "onbody") {
      document.body.appendChild(input)
    }
    if (event === "onbody-once") {
      if (input.id) document.querySelectorAll(`#${input.id}`).forEach(node => node.remove())
      this.append(input, document.body)
    }
    if (event === "onmouseout") {
      const onmouseout = input.node.getAttribute("onmouseout")
      input.node.setAttribute("onmouseout", `${onmouseout}; ${input.type}`)
    }
    if (event === "onmouseover") {
      const onmouseover = input.node.getAttribute("onmouseover")
      input.node.setAttribute("onmouseover", `${onmouseover}; ${input.type}`)
    }
    if (event === "recorder") {
      let mediaRecorder
      let chunks = []
      let timerInterval
      let seconds = 0
      const fragment = document.createDocumentFragment()
      const controls = Helper.create("div", fragment)
      controls.className = "controls"
      controls.timer = Helper.render("text/link", "Aufnahmezeit: 0s", controls)
      controls.pause = Helper.render("text/link", "Pause", controls)
      controls.stop = Helper.render("text/link", "Stop", controls)
      controls.pause.onclick = pause
      controls.stop.onclick = stop
      if (!document.querySelector("div.controls")) input?.node?.appendChild(fragment)
      function pause() {

        if (mediaRecorder.state === 'recording') {
          mediaRecorder.pause()
          clearInterval(timerInterval)
          Helper.add("style/green", controls.pause)
          return
        }
        if (mediaRecorder.state === 'paused') {
          mediaRecorder.resume()
          timerInterval = setInterval(updateTimer, 1000)
          Helper.add("style/dark-light", controls.pause)
          return
        }
      }
      function stop() {

        mediaRecorder.stop()
      }
      async function start(stream, o) {

        if (["audio"].includes(input.type)) {
          const oscillator = Helper.add("oscillator", {stream})
          oscillator.draw(o)
        }
        mediaRecorder = new MediaRecorder(stream)
        chunks = []
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }
        mediaRecorder.onstop = async () => {

          clearInterval(timerInterval)
          const file = new File(chunks, { type: input.type })
          const a = document.createElement("a")
          const hash = await Helper.digest(file)
          const url = URL.createObjectURL(file)
          a.href = url
          a.download = `${hash}.${Helper.convert("type/extension", input.type)}`
          document.body.appendChild(a)
          a.click()
          setTimeout(() => {
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            stream.getTracks().forEach(track => track.stop())
            controls.remove()
            o.remove()
          }, 100)
        }
        mediaRecorder.start()
        o.appendChild(controls)
        timerInterval = setInterval(updateTimer, 1000)
        Helper.add("style/red", controls.timer)
      }
      function updateTimer() {
        seconds++
        controls.timer.textContent = `Aufnahmezeit: ${Helper.convert("seconds/hh:mm:ss", seconds)}`
      }
      return {controls, pause, start, stop}
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

      if (window.localStorage.getItem("email") !== null) {
        emailInput.value = window.localStorage.getItem("email")
        this.verify("input/value", emailInput)
      }

      this.add("oninput/verify-input", emailInput)
      this.add("oninput/verify-input", dsgvoInput)
      this.add("hover-outline", emailInput)
      this.add("hover-outline", submit)
      for (let i = 0; i < dsgvoField.querySelectorAll(".button").length; i++) {
        const child = dsgvoField.querySelectorAll(".button")[i]
        this.add("hover-outline", child)
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
    if (event === "script/toolbox-getter") {
      return new Promise(async(resolve) => {
        const script = this.create("script/id", "toolbox-getter")
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
      }
      document.body.appendChild(input)
    }
    if (event === "signs") {
      input.querySelectorAll("input, select, textarea").forEach(node => {
        // console.log(node);
        this.verify("input/value", node)
        // this.addd("style/not-valid", node)
      })
    }
    if (event === "stream/cam") {
      return new Promise(async(resolve, reject) => {
        try {
          const {deviceId, video} = input
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } }
          })
          video.srcObject = stream
          resolve(stream)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "stream/vid") {
      return new Promise(async(resolve, reject) => {
        try {
          const {deviceId, video} = input
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
            audio: true
          })
          video.srcObject = stream
          resolve(stream)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "style/dark") {
      input.style.color = this.colors.dark.text
      input.style.background = this.colors.dark.background
      return input
    }
    if (event === "style/dark-light") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.add("style/dark", input)
      } else {
        this.add("style/light", input)
      }
    }
    if (event === "style/not-valid") {
      const color = this.colors.light.error
      input.style.border = `2px solid ${color}`
      if (input.type === "checkbox") {
        input.style.outline = `2px solid ${color}`
      }
      const signs = input.parentElement.querySelectorAll("div[class='sign']")
      signs.forEach(sign => sign.remove())
      if (signs.length === 0) {
        input.sign = document.createElement("div")
        input.sign.classList.add("sign")
        input.sign.textContent = "x"
        input.sign.style.position = "absolute"
        input.sign.style.right = "0"
        input.sign.style.top = "-5px"
        input.sign.style.color = color
        input.sign.style.fontSize = "34px"
        input.sign.style.fontFamily = "sans-serif"
        input.parentElement.appendChild(input.sign)
        return input
      }
      if (signs.length > 0) {
        input.sign = document.createElement("div")
        input.sign.classList.add("sign")
        input.sign.textContent = "x"
        input.sign.style.position = "absolute"
        input.sign.style.right = "0"
        input.sign.style.top = "-5px"
        input.sign.style.color = color
        input.sign.style.fontSize = "34px"
        input.sign.style.fontFamily = "sans-serif"
        input.parentElement.appendChild(input.sign)
        return input
      }
      return input
    }
    if (event === "style/selected") {
      this.add("style/circle", input)
      this.add("style/green", input)
    }
    if (event === "style/valid") {
      input.style.border = "2px solid #00c853"
      if (input.type === "checkbox") {
        input.style.outline = "2px solid #00c853"
      }
      input.style.borderRadius = "3px"
      const signs = input.parentElement.querySelectorAll("div[class='sign']")
      if (signs.length === 0) {
        input.sign = document.createElement("div")
        input.sign.classList.add("sign")
        input.sign.textContent = "✓"
        input.sign.style.position = "absolute"
        input.sign.style.right = "0"
        input.sign.style.top = "-5px"
        input.sign.style.color = "#00c853"
        input.sign.style.fontSize = "34px"
        input.sign.style.fontFamily = "sans-serif"
        input.parentElement.appendChild(input.sign)
        return input
      }
      if (signs.length > 0) {
        signs.forEach(sign => sign.remove())
        input.sign = document.createElement("div")
        input.sign.classList.add("sign")
        input.sign.textContent = "✓"
        input.sign.style.position = "absolute"
        input.sign.style.right = "0"
        input.sign.style.top = "-5px"
        input.sign.style.color = "#00c853"
        input.sign.style.fontSize = "34px"
        input.sign.style.fontFamily = "sans-serif"
        input.parentElement.appendChild(input.sign)
        return input
      }
      return input
    }
    if (event === "style/green") {
      input.style.background = "#71EEB8"
      input.style.color = this.colors.dark.background
      input.style.border = `3px solid ${this.colors.dark.background}`
      return input
    }
    if (event === "style/light") {
      input.style.color = this.colors.light.text
      input.style.background = this.colors.light.background
      return input
    }
    if (event === "style/new-message") {
      this.render("text/node/bottom-right-onhover", "Neue Nachrichten gefunden", input)
      const dot = this.render("text/top-right", "●", input)
      dot.style.color = "green"
      dot.style.fontSize = "21px"
      this.add("style/green", input)
      return input
    }
    if (event === "style/red") {
      input.style.background = "#FA503D"
      input.style.color = this.colors.dark.background
      input.style.border = `3px solid ${this.colors.dark.background}`
      return input
    }
    if (event === "style/circle") {
      this.style(input, {borderRadius: "50%", border: "3px solid black", width: "34px", height: "34px", backgroundColor: "black"})
    }
    if (event === "style/yellow") {
      input.style.background = "#EAC07F"
      input.style.color = this.colors.dark.background
      input.style.border = `3px solid ${this.colors.dark.background}`
      return input
    }
    if (event === "admin-login") {
      const emailInput = document.querySelector(".email-input")
      const dsgvoInput = document.querySelector(".dsgvo-input")
      const submit = document.querySelector(".start-login-event")
      submit.onclick = async () => {
        await this.verify("input/value", emailInput)
        await this.verify("input/value", dsgvoInput)
        this.callback("email/pin-verified", emailInput.value, async () => {
          const res = await this.request("/register/user/admin/", {email: emailInput.value})
          if (res.status === 200) {
            window.alert("Du kannst dich ab sofort auf deiner Plattform anmelden")
            window.location.assign("/login/")
          } else {
            window.alert("Fehler.. Bitte wiederholen.")
            this.add("style/not-valid", emailInput)
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
    if (event === "hover-outline") {
      this.on("hover", {node: input, class: "outline pointer"})
    }
    if (event === "outline-hover/field-funnel") {
      for (let i = 0; i < input.querySelectorAll("*").length; i++) {
        const node = input.querySelectorAll("*")[i]
        if (node.classList.contains("field-input") || node.classList.contains("submit-field-funnel-button")) {
          this.add("hover-outline", node)
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
  static append(node, to) {
    const fragment = document.createDocumentFragment()
    fragment.appendChild(node)
    to?.appendChild(fragment)
  }
  static async button() {
    if (!this._button) {
      const module = await import("/js/button.js")
      console.log(module);
      this._button = module.button
    }
    return this._button
  }
  static callback(event, input, callback) {
    // event = input/algo

    if (event === "email/pin-verified") {

      return new Promise(async(resolve, reject) => {
        try {

          this.overlay("lock", async o1 => {
            const content = o1.content
            try {
              const res = await this.request("/send/email/with/pin/", {email: input})
              if (res.status === 200) {
                o1.loading.remove()
                const pin = this.create("input/text", content)
                pin.input.setAttribute("required", "true")
                pin.input.placeholder = "Meine PIN"
                this.verify("input/value", pin.input)
                const button = this.create("button/action", content)
                button.style.fontSize = "34px"
                button.textContent = "PIN bestätigen"
                button.addEventListener("click", async () => {

                  await this.verify("input/value", pin.input)
                  this.overlay("lock", async o2 => {
                    try {
                      await this.verify("input/value", pin.input)
                      const res = await this.request("/verify/pin/", {userPin: pin.input.value})
                      if (res.status === 200) {
                        window.localStorage.setItem("email", input)
                        window.localStorage.setItem("localStorageId", await this.convert("text/digest", JSON.stringify({email: input, verified: true})))
                        await callback(o1)
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
              } else {
                window.alert("Fehler.. Bitte wiederholen.")
                window.location.reload()
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
  }
  static async community() {
    if (!this._community) {
      const module = await import("/js/community.js")
      this._community = module.community
    }
    return this._community
  }
  static design(tree, input, parent) {
    if (tree === "getyour.expert.platforms") {

      const key = Helper.convert("tree/key", tree)
      const it = input[key]

      if (!Helper.verifyIs("text/empty", it)) {
        const container = Helper.create("div", box.left)
        Helper.style(container, {fontFamily: "sans-serif", display: "flex"})
        const platformDiv = document.createElement("div")
        Helper.style(platformDiv, {display: "flex", justifyContent: "center", alignItems: "center"})
        platformDiv.textContent = `Plattformen:`
        container.appendChild(platformDiv)
        const platformLengthDiv = document.createElement("div")
        Helper.style(platformLengthDiv, {marginLeft: "8px", fontSize: "32px"})
        if (!Helper.verifyIs("number/empty", it.length)) {
          platformLengthDiv.textContent = it.length
        }
        container.appendChild(platformLengthDiv)
      }

      if (!Helper.verifyIs("text/empty", it)) {
        const container = Helper.create("div", box.left)
        Helper.style(container, {fontFamily: "sans-serif", display: "flex"})
        const platformDiv = document.createElement("div")
        Helper.style(platformDiv, {display: "flex", justifyContent: "center", alignItems: "center"})
        platformDiv.textContent = `Werteinheiten:`
        container.appendChild(platformDiv)
        const platformLengthDiv = document.createElement("div")
        Helper.style(platformLengthDiv, {marginLeft: "8px", fontSize: "32px"})
        let counter = 0
        try {
          for (let i = 0; i < it.length; i++) {
            const platform = it[i]
            if (platform.values) {
              for (let i = 0; i < platform.values.length; i++) {
                const value = platform.values[i]
                counter++
              }
            }
          }
          platformLengthDiv.textContent = counter
        } catch (error) {
          console.log(error)
          platformLengthDiv.textContent = 0
        }
        container.appendChild(platformLengthDiv)
      }

    }
  }
  static div(className, node) {
    const div = document.createElement("div")
    div.className = className
    if (this.verifyIs("text/empty", div.className)) div.removeAttribute("class")
    if (node) this.append(div, node)
    return div
  }
  static create(event, input) {
    // no events, only creation
    // event = thing/algo
    if (event === "arrow-down") {
      const fragment = document.createDocumentFragment()
      const img = document.createElement("img")
      img.src = "/public/arrow-down-without-line.svg"
      this.style(img, {position: "absolute", bottom: "0", left: "50%", width: "34px"})
      fragment.appendChild(img)
      input?.appendChild(fragment)
      return img
    }
    if (event === "cite-button") {
      const it = document.createElement("div")
      it.className = "cite-button"
      it.textContent = "Dieses Dokument zitieren."
      Helper.style(it, {display: "inline-block", textDecoration: "underline", fontSize: "21px", margin: "34px 0", fontFamily: "sans-serif"})
      Helper.add("pointer", it)
      Helper.convert("link/color", it)
      input?.appendChild(it)
      return it
    }
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
      this.add("hover-outline", searchField.input)

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
      this.add("hover-outline", field.input)
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

      this.create("div/loading", overlay)

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

      this.render("text/h1", "Essentielles zum Anlagenaufbau", input)

      const info = this.create("info/success", input)
      info.textContent = "Bitte befolgen Sie diese Schritte, um den einwandfreien Aufbau ihres Energiesystems vorzubereiten."

      const checklist = this.render("checklist/items", items, input)

      return checklist
    }
    if (event === "input/alias"){
      const alias = this.create("input/text")
      alias.input.id = "alias"
      alias.input.maxLength = "55"
      alias.input.placeholder = "Alternativer Name (text/any)"
      alias.input.setAttribute("accept", "text/length")
      if (input) this.append(alias, input)
      return alias
    }
    if (event === "input/description") {
      const it = this.create("input/textarea")
      it.input.maxLength = "233"
      it.input.setAttribute("accept", "text/length")
      it.input.placeholder = "Beschreibung"
      if (input) this.append(it, input)
      return it
    }
    if (event === "input/bool") {
      const select = this.create("input/select")
      select.setInput = bool => {
        if (bool === true) {
          select.input.add(["true", "false"])
        }
        if (bool === false) {
          select.input.add(["false", "true"])
        }
        this.verify("input/value", select.input)
      }
      if (input) this.append(select, input)
      return select
    }
    if (event === "input/feedback") {
      const it = this.create("input/textarea")
      it.input.setAttribute("required", "true")
      it.input.setAttribute("accept", "text/length")
      it.input.maxLength = "377"
      it.input.placeholder = "Schreibe hier gerne ein Feedback, anonym und sicher"
      this.verify("input/value", it.input)
      this.add("hover-outline", it.input)
      it.input.oninput = () => this.verify("input/value", it.input)
      if (input) this.append(it, input)
      return it
    }
    if (event === "input/importance") {
      const it = this.create("field/range")
      it.input.min = "0"
      it.input.max = "13"
      it.input.step = "1"
      it.input.value = "0"
      it.label.textContent = `Wichtigkeit - ${it.input.value}`
      it.input.style.cursor = "pointer"
      this.add("hover-outline", it.input)
      this.verify("input/value", it.input)
      it.input.oninput = ev => {
        this.verify("input/value", it.input)
        it.label.textContent = `Wichtigkeit - ${ev.target.value}`
      }
      if (input) this.append(it, input)
      return it
    }
    if (event === "input/path") {
      const fragment = document.createDocumentFragment()
      const field = this.create("input/text", fragment)
      field.input.placeholder = "/mein/pfad/../ (text/path)"
      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/path")
      input?.appendChild(fragment)
      return field
    }
    if (event === "input/script") {
      const field = this.create("input/textarea")
      field.input.placeholder = "<script>..</script>"
      this.style(field.input, {height: "55px", fontSize: "13px", fontFamily: "monospace"})
      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/script")
      this.verify("input/value", field.input)
      field.input.addEventListener("input", ev => this.verify("input/value", field.input))
      input?.appendChild(field)
      return field
    }
    if (event === "input/select") {
      const div = this.div("mtb21 mlr34 relative")
      div.input = document.createElement("select")
      this.append(div.input, div)
      div.search = this.create("input/text")
      div.search.input.placeholder = "Suche nach E-Mail Adresse"
      div.search.input.oninput = ev => {
        const query = ev.target.value.toLowerCase()
        let filtered
        if (this.verifyIs("text/empty", query)) {
          filtered = div.options
        } else {
          filtered = div.options.filter(it => it.text.toLowerCase().includes(query))
        }
        div.input.textValue(filtered)
      }
      div.add = it => {
        div.options = it
        div.input.textValue(it)
      }
      div.addOption = (text, value) => {
        const option = document.createElement("option")
        option.value = value
        option.text = text
        this.append(option, div.input)
      }
      div.append = options => {
        for (let i = 0; i < options.length; i++) {
          const option = document.createElement("option")
          option.value = options[i]
          option.text = options[i]
          this.append(option, div.input)
        }
      }
      div.input.add = options => {
        div.input.textContent = ""
        for (let i = 0; i < options.length; i++) {
          const option = document.createElement("option")
          option.value = options[i]
          option.text = options[i]
          this.append(option, div.input)
        }
      }
      div.input.select = options => {
        const set = new Set(options)
        Array.from(div.input.options).forEach(option => {
          if (set.has(option.textContent.trim())) {
            option.selected = true
          } else {
            option.selected = false
          }
        })
      }
      div.input.selectAll = () => {
        for (let i = 0; i < div.input.options.length; i++) {
          div.input.options[i].selected = true
        }
        this.add("style/valid", div.input)
      }
      div.selectByText = options => {
        const set = new Set(options)
        Array.from(div.input.options).forEach(option => {
          if (set.has(option.text)) {
            option.selected = true
          } else {
            option.selected = false
          }
        })
      }
      div.selectByValue = options => {
        const set = new Set(options)
        Array.from(div.input.options).forEach(option => {
          if (set.has(option.value)) {
            option.selected = true
          } else {
            option.selected = false
          }
        })
      }
      div.input.selectNone = () => {
        for (let i = 0; i < div.input.options.length; i++) {
          div.input.options[i].selected = false
        }
        this.add("style/not-valid", div.input)
      }
      div.selectedValues = () => {
        return Array.from(div.input.selectedOptions).map(it => it.value)
      }
      div.input.textValue = options => {
        div.input.textContent = ""
        for (let i = 0; i < options.length; i++) {
          const it = options[i]
          const option = document.createElement("option")
          if (it.value) option.value = it.value
          if (it.text) option.text = it.text
          this.append(option, div.input)
        }
      }
      div.input.addEventListener("input", ev => {
        if (ev.target.value.startsWith("--")) {
          this.add("style/not-valid", div.input)
          return
        }
        this.add("style/valid", div.input)
      })
      div.input.className = "w89p fs21 dark-light"
      this.add("hover-outline", div.input)
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/textarea") {
      const div = this.div("mtb21 mlr34 relative")
      div.input = document.createElement("textarea")
      div.input.className = "w89p dark-light"
      this.append(div.input, div)
      this.add("hover-outline", div.input)
      input?.appendChild(div)
      return div
    }
    if (event === "input/checkbox") {
      const div = document.createElement("div")
      div.className = "flex align start relative h34 w89 mtb21 mlr34"
      div.input = document.createElement("input")
      div.appendChild(div.input)
      div.input.type = "checkbox"
      div.input.style.transform = "scale(2)"
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/contacts") {
      const select = Helper.create("select/emails", input)
      Helper.request("/jwt/get/user/contacts/").then(res => {
        if (res.status === 200) {
          const contacts = JSON.parse(res.response)
          select.input.add(contacts)
        }
      })
      return select
    }
    if (event === "input/date") {
      const div = this.div("mtb21 mlr34 relative")
      div.input = document.createElement("input")
      this.append(div.input, div)
      div.input.className = "w89p fs21 dark-light"
      div.input.oninput = ev => this.verify("input/value", div.input)
      div.input.type = "date"
      div.input.setAttribute("value", this.convert("millis/yyyy-mm-dd", Date.now()))
      this.add("hover-outline", div.input)
      this.verify("input/value", div.input)
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/date-time") {
      const div = this.div("mtb21 mlr34 relative")
      div.input = document.createElement("input")
      this.append(div.input, div)
      div.input.className = "w89p fs21 dark-light"
      div.input.oninput = ev => this.verify("input/value", div.input)
      div.input.type = "datetime-local"
      div.input.setAttribute("required", "true")
      this.add("hover-outline", div.input)
      this.verify("input/value", div.input)
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/email") {
      const div = document.createElement("div")
      div.className = "relative mtb21 mlr34"
      div.input = document.createElement("input")
      div.appendChild(div.input)
      div.input.classList.add("email")
      div.input.type = "email"
      div.input.placeholder = "E-Mail Adresse"
      div.input.setAttribute("required", "true")
      div.input.setAttribute("accept", "text/email")
      this.style(div.input, {width: "89%", fontSize: "21px"})
      this.add("hover-outline", div.input)
      this.convert("dark-light", div.input)
      input?.appendChild(div)
      return div
    }
    if (event === "input/file") {
      const div = document.createElement("div")
      this.style(div, {margin: "21px 34px", position: "relative"})
      div.input = document.createElement("input")
      div.appendChild(div.input)
      div.input.type = "file"
      this.style(div.input, {width: "89%", fontSize: "21px"})
      this.add("hover-outline", div.input)
      this.verify("input/value", div.input)
      this.convert("dark-light", div.input)
      input?.appendChild(div)
      return div
    }
    if (event === "input/html") {
      const div = this.create("input/textarea")
      div.input.className += " monospace fs13 vh55"
      div.input.placeholder = `<html>..</html>`
      this.verify("input/value", div.input)
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/id") {
      const id = this.create("input/text", input)
      id.input.placeholder = "Id eingeben (text/tag)"
      id.input.setAttribute("required", "true")
      id.input.setAttribute("accept", "text/tag, text/length")
      id.input.maxLength = "34"
      id.input.addEventListener("input", ev => this.verify("input/value", id.input))
      this.verify("input/value", id.input)
      return id
    }
    if (event === "input/image") {
      const image = this.create("input/text")
      image.input.id = "image"
      image.input.placeholder = "Bild-URL (text/url)"
      image.input.oninput = () => this.verify("input/value", image.input)
      this.verify("input/value", image.input)
      if (input) this.append(image, input)
      return image
    }
    if (event === "input/number") {
      const div = document.createElement("div")
      this.style(div, {margin: "21px 34px", position: "relative"})
      div.input = document.createElement("input")
      div.appendChild(div.input)
      div.input.type = "number"
      this.style(div.input, {width: "89%", fontSize: "21px"})
      this.add("hover-outline", div.input)
      this.verify("input/value", div.input)
      this.convert("dark-light", div.input)
      input?.appendChild(div)
      return div
    }
    if (event === "input/operator") {
      const it = this.create("input/text")
      it.input.placeholder = "Operator (text/operator)"
      it.input.maxLength = "2"
      it.input.setAttribute("required", "true")
      it.input.setAttribute("accept", "text/operator, text/length")
      this.verify("input/value", it.input)
      if (input) this.append(it, input)
      return it
    }
    if (event === "input/password") {
      const div = document.createElement("div")
      this.style(div, {margin: "21px 34px", position: "relative"})
      div.input = document.createElement("input")
      div.appendChild(div.input)
      div.input.type = "password"
      this.style(div.input, {width: "89%", fontSize: "21px"})
      this.add("hover-outline", div.input)
      this.verify("input/value", div.input)
      this.convert("dark-light", div.input)
      input?.appendChild(div)
      return div
    }
    if (event === "input/range") {
      const div = document.createElement("div")
      this.style(div, {margin: "21px 34px", position: "relative"})
      div.input = document.createElement("input")
      div.appendChild(div.input)
      div.input.type = "range"
      this.style(div.input, {width: "89%", fontSize: "21px"})
      this.add("hover-outline", div.input)
      this.convert("dark-light", div.input)
      input?.appendChild(div)
      return div
    }
    if (event === "input/phone") {
      const div = document.createElement("div")
      this.style(div, {margin: "21px 34px", position: "relative"})
      div.input = document.createElement("input")
      this.append(div.input, div)
      div.input.type = "tel"
      div.input.placeholder = "Telefon Nummer"
      div.input.addEventListener("input", ev => this.verify("input/value", div.input))
      div.input.setAttribute("required", "true")
      div.input.setAttribute("accept", "text/tel")
      this.add("hover-outline", div.input)
      this.convert("dark-light", div.input)
      this.style(div.input, {width: "89%", fontSize: "21px"})
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/tag") {
      const tag = this.create("input/text")
      tag.input.maxLength = "21"
      tag.input.setAttribute("accept", "text/tag, text/length")
      tag.input.setAttribute("required", "true")
      if (input) this.append(tag, input)
      return tag
    }
    if (event === "input/tel") {
      const div = document.createElement("div")
      this.style(div, {margin: "21px 34px", position: "relative"})
      div.input = document.createElement("input")
      this.append(div.input, div)
      div.input.type = "tel"
      div.input.addEventListener("input", ev => this.verify("input/value", div.input))
      this.add("hover-outline", div.input)
      this.convert("dark-light", div.input)
      this.style(div.input, {width: "89%", fontSize: "21px"})
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/text") {
      const div = document.createElement("div")
      div.className = "mtb21 mlr34 relative"
      div.input = document.createElement("input")
      div.input.className = "w89p fs21 dark-light"
      this.append(div.input, div)
      div.input.type = "text"
      div.input.oninput = ev => this.verify("input/value", div.input)
      this.add("hover-outline", div.input)
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/tree"){
      const div = this.create("input/text")
      div.input.maxLength = "34"
      div.input.placeholder = "Datenstruktur (text/tree)"
      div.input.setAttribute("required", "true")
      div.input.setAttribute("accept", "text/tree, text/length")
      this.verify("input/value", div.input)
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/url"){
      const div = this.create("input/text")
      div.input.placeholder = "Webseiten URL (text/url)"
      div.input.setAttribute("required", "true")
      div.input.setAttribute("accept", "text/url")
      this.verify("input/value", div.input)
      if (input) this.append(div, input)
      return div
    }
    if (event === "input/visibility") {
      const label = this.create("label", {for: "visibility", text: "Sichtbarkeit auswählen"})
      const field = this.create("input/select", input)
      field.prepend(label)
      field.input.id = "visibility"
      field.input.add(["closed", "open"])
      field.input.setAttribute("required", "true")
      this.verify("input/value", field.input)
      return field
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
      h1.className = "mtb21 mlr34 sans-serif fw-normal color-theme"
      if (input) this.append(h1, input)
      return h1
    }
    if (event === "hr") {
      const hr = document.createElement("hr")

      if (input) input.append(hr)
      return hr
    }
    if (event === "funnel/source") {
      const fragment = document.createDocumentFragment()
      const funnel = this.create("div/scrollable", fragment)
      funnel.id = "source"
      funnel.authors = this.create("input/textarea", funnel)
      funnel.authors.id = "authors"
      funnel.authors.input.placeholder = "author1, author2, .., authorN"
      funnel.authors.input.setAttribute("required", "true")
      funnel.authors.input.oninput = () => this.verify("input/value", funnel.authors.input)
      this.verify("input/value", funnel.authors.input)
      funnel.titel = this.create("input/textarea", funnel)
      funnel.titel.id = "title"
      funnel.titel.input.placeholder = "JavaScript für Anfänger"
      funnel.titel.input.setAttribute("required", "true")
      funnel.titel.input.oninput = () => this.verify("input/value", funnel.titel.input)
      this.verify("input/value", funnel.titel.input)
      funnel.edition = this.create("input/tel", funnel)
      funnel.edition.id = "edition"
      funnel.edition.input.placeholder = "Auflage"
      funnel.edition.input.oninput = () => this.verify("input/value", funnel.edition.input)
      this.verify("input/value", funnel.edition.input)
      funnel.publisher = this.create("input/textarea", funnel)
      funnel.publisher.id = "publisher"
      funnel.publisher.input.placeholder = "publisher1, publisher2, .., publisherN"
      funnel.publisher.input.setAttribute("required", "true")
      funnel.publisher.input.oninput = () => this.verify("input/value", funnel.publisher.input)
      this.verify("input/value", funnel.publisher.input)
      funnel.published = this.create("input/tel", funnel)
      funnel.published.id = "published"
      funnel.published.input.placeholder = "Jahr der Herausgabe"
      funnel.published.input.setAttribute("required", "true")
      funnel.published.input.oninput = () => this.verify("input/value", funnel.published.input)
      this.verify("input/value", funnel.published.input)
      funnel.isbn = this.create("input/text", funnel)
      funnel.isbn.id = "isbn"
      funnel.isbn.input.placeholder = "isbn1, isbn2, .., isbnN"
      funnel.isbn.input.oninput = () => this.verify("input/value", funnel.isbn.input)
      this.verify("input/value", funnel.isbn.input)
      funnel.weblink = this.create("input/text", funnel)
      funnel.weblink.id = "weblink"
      funnel.weblink.input.placeholder = "Web URL zur Quelle"
      funnel.weblink.input.oninput = () => this.verify("input/value", funnel.weblink.input)
      this.verify("input/value", funnel.weblink.input)
      funnel.language = this.create("input/text", funnel)
      funnel.language.id = "language"
      funnel.language.input.placeholder = "de, en, fr, .."
      funnel.language.input.oninput = () => this.verify("input/value", funnel.language.input)
      this.verify("input/value", funnel.language.input)
      funnel.type = this.create("input/text", funnel)
      funnel.type.id = "type"
      funnel.type.input.placeholder = "text/book"
      funnel.type.input.oninput = () => this.verify("input/value", funnel.type.input)
      this.verify("input/value", funnel.type.input)
      funnel.keywords = this.create("input/textarea", funnel)
      funnel.keywords.id = "keywords"
      funnel.keywords.input.placeholder = "keyword1, keyword2, .., keywordN"
      funnel.keywords.input.style.height = "144px"
      funnel.keywords.input.oninput = () => this.verify("input/value", funnel.keywords.input)
      this.verify("input/value", funnel.keywords.input)
      funnel.description = this.create("input/textarea", funnel)
      funnel.description.id = "description"
      funnel.description.input.placeholder = "Beschreibung oder Notizen zu deiner Quelle"
      funnel.description.input.style.height = "144px"
      funnel.description.input.oninput = () => this.verify("input/value", funnel.description.input)
      this.verify("input/value", funnel.description.input)
      funnel.image = this.create("input/text", funnel)
      funnel.image.id = "image"
      funnel.image.input.placeholder = "Bild URL deiner Quelle"
      funnel.image.input.oninput = () => this.verify("input/value", funnel.image.input)
      this.verify("input/value", funnel.image.input)
      funnel.submit = this.create("button/action", funnel)
      funnel.submit.className = "submit-field-funnel-button"
      funnel.submit.textContent = "Quelle jetzt speichern"
      input?.appendChild(fragment)
      return funnel
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
      this.add("hover-outline", funnel.authorsField.input)

      funnel.titleField = this.create("field/textarea", funnel)
      funnel.titleField.id = "title"
      funnel.titleField.label.textContent = "Titel der Quelle"
      funnel.titleField.input.placeholder = "JavaScript für Anfänger"
      funnel.titleField.input.setAttribute("required", "true")
      funnel.titleField.input.oninput = () => this.verify("input/value", funnel.titleField.input)
      this.verify("input/value", funnel.titleField.input)
      this.add("hover-outline", funnel.titleField.input)

      funnel.editionField = this.create("field/tel", funnel)
      funnel.editionField.id = "edition"
      funnel.editionField.label.textContent = "Auflage"
      funnel.editionField.input.placeholder = "0"
      funnel.editionField.input.oninput = () => this.verify("input/value", funnel.editionField.input)
      this.verify("input/value", funnel.editionField.input)
      this.add("hover-outline", funnel.editionField.input)

      funnel.publisherField = this.create("field/textarea", funnel)
      funnel.publisherField.id = "publisher"
      funnel.publisherField.label.textContent = "Herausgeber (mit Komma trennen)"
      funnel.publisherField.input.placeholder = "publisher1, publisher2, .., publisherN"
      funnel.publisherField.input.setAttribute("required", "true")
      funnel.publisherField.input.oninput = () => this.verify("input/value", funnel.publisherField.input)
      this.verify("input/value", funnel.publisherField.input)
      this.add("hover-outline", funnel.publisherField.input)

      funnel.publishedField = this.create("field/tel", funnel)
      funnel.publishedField.id = "published"
      funnel.publishedField.label.textContent = "Jahr der Herausgabe"
      funnel.publishedField.input.placeholder = "2019"
      funnel.publishedField.input.setAttribute("required", "true")
      funnel.publishedField.input.oninput = () => this.verify("input/value", funnel.publishedField.input)
      this.verify("input/value", funnel.publishedField.input)
      this.add("hover-outline", funnel.publishedField.input)

      funnel.isbnField = this.create("field/text", funnel)
      funnel.isbnField.id = "isbn"
      funnel.isbnField.label.textContent = "ISBN Nummern (mit Komma trennen)"
      funnel.isbnField.input.placeholder = "isbn1, isbn2, .., isbnN"
      funnel.isbnField.input.oninput = () => this.verify("input/value", funnel.isbnField.input)
      this.verify("input/value", funnel.isbnField.input)
      this.add("hover-outline", funnel.isbnField.input)

      funnel.weblinkField = this.create("field/text", funnel)
      funnel.weblinkField.id = "weblink"
      funnel.weblinkField.label.textContent = "Web Link zur Quelle"
      funnel.weblinkField.input.placeholder = "https://www.meine-infos.de/meine-quelle/"
      funnel.weblinkField.input.oninput = () => this.verify("input/value", funnel.weblinkField.input)
      this.verify("input/value", funnel.weblinkField.input)
      this.add("hover-outline", funnel.weblinkField.input)

      funnel.languageField = this.create("field/text", funnel)
      funnel.languageField.id = "language"
      funnel.languageField.label.textContent = "Sprachen erste 2 Buchstaben (mit Komma trennen)"
      funnel.languageField.input.placeholder = "de, en, fr, .."
      funnel.languageField.input.oninput = () => this.verify("input/value", funnel.languageField.input)
      this.verify("input/value", funnel.languageField.input)
      this.add("hover-outline", funnel.languageField.input)

      funnel.typeField = this.create("field/text", funnel)
      funnel.typeField.id = "type"
      funnel.typeField.label.textContent = "Art der Quelle"
      funnel.typeField.input.placeholder = "text/book"
      funnel.typeField.input.oninput = () => this.verify("input/value", funnel.typeField.input)
      this.verify("input/value", funnel.typeField.input)
      this.add("hover-outline", funnel.typeField.input)

      funnel.keywordsField = this.create("field/textarea", funnel)
      funnel.keywordsField.id = "keywords"
      funnel.keywordsField.label.textContent = "Schlüsselwörter deiner Quelle (mit Komma trennen)"
      funnel.keywordsField.input.placeholder = "keyword1, keyword2, .., keywordN"
      funnel.keywordsField.input.style.height = "144px"
      funnel.keywordsField.input.oninput = () => this.verify("input/value", funnel.keywordsField.input)
      this.verify("input/value", funnel.keywordsField.input)
      this.add("hover-outline", funnel.keywordsField.input)

      funnel.descriptionField = this.create("field/textarea", funnel)
      funnel.descriptionField.id = "description"
      funnel.descriptionField.label.textContent = "Beschreibung oder Notizen zu deiner Quelle"
      funnel.descriptionField.input.placeholder = "Hier findest du mehr Informationen über deine Quelle .."
      funnel.descriptionField.input.style.height = "144px"
      funnel.descriptionField.input.oninput = () => this.verify("input/value", funnel.descriptionField.input)
      this.verify("input/value", funnel.descriptionField.input)
      this.add("hover-outline", funnel.descriptionField.input)

      funnel.imageField = this.create("field/text", funnel)
      funnel.imageField.id = "image"
      funnel.imageField.label.textContent = "Bild URL deiner Quelle"
      funnel.imageField.input.placeholder = "https://www.meine-infos.de/meine-quellbild.jpg"
      funnel.imageField.input.oninput = () => this.verify("input/value", funnel.imageField.input)
      this.verify("input/value", funnel.imageField.input)
      this.add("hover-outline", funnel.imageField.input)

      funnel.submit = this.create("button/action", funnel)
      funnel.submit.className = "submit-field-funnel-button"
      this.add("hover-outline", funnel.submit)
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
    if (event === "div/box") {
      const div = document.createElement("div")
      div.className = "btn-theme color-theme br13 mtb21 mlr34"
      this.add("hover-outline", div)
      if (input) this.append(div, input)
      return div
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
    if (event === "div/flex") {
      const div = document.createElement("div")
      div.style.display = "flex"
      div.style.flexWrap = "wrap"
      div.style.margin = "21px 34px"
      input?.appendChild(div)
      return div
    }
    if (event === "div/flex-around") {
      const div = this.div("flex wrap align space-around mtb21 mlr34")
      if (input) this.append(div, input)
      return div
    }
    if (event === "div/flex-between") {
      const div = document.createElement("div")
      div.style.display = "flex"
      div.style.flexWrap = "wrap"
      div.style.justifyContent = "space-between"
      div.style.margin = "21px 34px"
      input?.appendChild(div)
      return div
    }
    if (event === "div/flex-row") {
      const div = this.div("flex wrap mtb21 mlr34")
      if (input) this.append(div, input)
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
    if (event === "div/info") {
      const div = this.div("dark-light monospace fs13 fixed bottom left z1 max-w100p max-h21 of-auto btn-theme")
      if (input) this.append(div, input)
      return div
    }
    if (event === "div/note") {
      const div = this.div("ptb144 flex align center color-theme sans-serif")
      if (input) this.append(div, input)
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
      this.convert("parent/scrollable", div)
      if (input) this.append(div, input)
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
    if (event === "div/video") {
      const fragment = document.createDocumentFragment()
      const div = document.createElement("div")
      fragment.appendChild(div)
      div.style.display = "flex"
      div.video = document.createElement("video")
      div.appendChild(div.video)
      div.video.style.width = "100%"
      div.video.autoplay = true
      input?.appendChild(fragment)
      return div
    }
    if (event === "div/button") {
      const div = document.createElement("div")
      div.className = "btn-theme color-theme br13"
      this.add("hover-outline", div)
      if (input) this.append(div, input)
      return div
    }
    if (event === "button") {
      const div = this.div("btn-theme color-theme flex align center mtb21 mlr34")
      this.add("hover-outline", div)
      input?.appendChild(div)
      return div
    }
    if (event === "button/goback") {
      const button = this.create("button/back")
      button.classList.add("go-back")
      button.onclick = ev => this.goBack()
      if (input && !document.querySelector('div.go.back')) this.append(button, input)
      return button
    }
    if (event === "button/back") {
      const button = this.create("button/bottom-left")
      button.classList.add("back-button")
      this.render("icon/node/path", "/public/arrow-back.svg", button).then(icon => {
        this.convert("stroke/reverse", icon)
      })
      if (input) this.append(button, input)
      return button
    }
    if (event === "box") {
      const box = document.createElement("span")
      this.convert("parent/box", box)
      input?.appendChild(box)
      return box
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
      button.className = "fixed bottom left w34 h34 br55 m34 p21 z1"
      this.add("hover-outline", button)
      if (input) this.append(button, input)
      return button
    }
    if (event === "button/bottom-right") {
      const button = document.createElement("div")
      button.className = "fixed bottom right w34 h34 br55 m34 p21 z2"
      this.add("hover-outline", button)
      if (input) this.append(button, input)
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
    if (event === "button/getyour") {
      const button = this.create("button/bottom-right")
      this.render("icon/node/path", "/public/logo-getyour-red.svg", button)
      this.add("hover-outline", button)
      if (input) this.append(button, input)
      return button
    }
    if (event === "button/add") {
      const button = this.create("button/bottom-right")
      button.classList.add("add-button")
      this.render("icon/node/path", "/public/add.svg", button)
      if (input) this.append(button, input)
      return button
    }
    if (event === "button/action") {
      const div = document.createElement("div")
      div.className = "fs21 sans-serif br13 mtb21 mlr34 flex align center ptb21 plr34 bs-light color-light bg-sunflower"
      this.add("hover-outline", div)
      input?.appendChild(div)
      return div
    }
    if (event === "button/top-bottom") {
      const button = this.create("div/button")
      button.classList.add("flex", "column", "mtb21", "mlr34", "of-hidden")
      button.top = document.createElement("div")
      this.append(button.top, button)
      button.bottom = document.createElement("div")
      this.append(button.bottom, button)
      if (input) this.append(button, input)
      return button
    }
    if (event === "button/left-right") {
      const button = document.createElement("div")
      button.left = document.createElement("div")
      button.right = document.createElement("div")
      button.append(button.left)
      button.append(button.right)
      this.convert(event, button)
      this.on("hover", {node: button, class: "outline pointer"})
      if (input) this.append(button, input)
      return button
    }
    if (event === "counter") {
      input.counter = this.div("counter absolute flex align center monospace fs34 br50p p8 z1 dark-light top-21 right btn-theme")
      input.counter.textContent = "0"
      this.append(input.counter, input)
      return input
    }
    if (event === "icon/branch") {
      return new Promise(async(resolve, reject) => {
        try {
          const icon = await this.convert("path/icon", "/public/branch.svg")
          icon.svg = icon.firstChild
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            icon.svg.children[0].setAttribute("fill", this.colors.dark.text)
            icon.svg.children[1].setAttribute("fill", this.colors.light.text)
          } else {
            icon.svg.children[0].setAttribute("fill", this.colors.light.text)
            icon.svg.children[1].setAttribute("fill", this.colors.dark.text)
          }
          this.append(icon, input)
          resolve(icon)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "button/branch") {
      const button = this.create("button/bottom-right")
      button.className += " flex align center"
      this.convert("path/icon", "/public/branch.svg").then(icon => {
        icon.svg = icon.firstChild
        icon.svg.classList.add("w55")
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          icon.svg.children[0].setAttribute("fill", this.colors.dark.text)
          icon.svg.children[1].setAttribute("fill", this.colors.light.text)
        } else {
          icon.svg.children[0].setAttribute("fill", this.colors.light.text)
          icon.svg.children[1].setAttribute("fill", this.colors.dark.text)
        }
        this.append(icon, button)
      })
      this.create("counter", button)
      this.add("hover-outline", button)
      if (input) this.append(button, input)
      return button
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
      this.add("hover-outline", funnel.submit)
      input?.appendChild(funnel)
      return funnel
    }
    if (event === "pdf-preview") {
      return new Promise(async(resolve, reject) => {
        try {
          const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/+esm')
          pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs"
          const url = input
          const loadingTask = pdfjs.getDocument(url)
          const pdf = await loadingTask.promise
          const page = await pdf.getPage(1)
          const scale = 1.5
          const viewport = page.getViewport({ scale: scale })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width
          canvas.style.width='100%'
          canvas.style.height='100%'
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          }
          await page.render(renderContext).promise
          resolve(canvas)
        } catch (error) {
          reject(error)
        }
      })
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
    if (event === "script/id") {
      const script = document.createElement("script")
      script.id = input
      script.src = `/js/${input}.js`
      script.type = "module"
      return script
    }
    if (event === "select/cam") {
      return new Promise(async(resolve, reject) => {
        try {
          const select = this.create("input/select")
          select.input.add(["-- Kamera auswählen"])
          const devices = await navigator.mediaDevices.enumerateDevices()
          const videoDevices = devices.filter(device => device.kind === "videoinput")
          this.add("style/not-valid", select.input)
          videoDevices.forEach((device, index) => {
            const option = document.createElement("option")
            option.value = device.deviceId
            option.textContent = device.label || `Kamera ${index + 1}`
            select.input.appendChild(option)
          })
          resolve(select)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "select/emails") {
      const searchField = this.create("input/text", input)
      searchField.input.placeholder = "Suche nach E-Mail Adresse"
      const field = this.create("input/select", input)
      field.input.className += " vh34"
      field.input.setAttribute("multiple", "true")
      field.input.render = options => {

        field.input.textContent = ""
        for (let i = 0; i < options.length; i++) {
          const it = options[i]
          if (it.id && it.email) {
            const option = document.createElement("option")
            option.text = it.email
            option.value = it.id
            this.append(option, field.input)
          }
        }
      }
      let options
      field.input.add = async it => {

        options = await Promise.all(it.map(async item => {
          if (typeof item === "string") {
            const id = await this.digestId(item)
            return {email: item, id}
          } else if (typeof item === "object" && item !== null) {
            const id = await this.digestId(item.email)
            return {email: item.email, id}
          } else {
            return null
          }
        }))
        options = options.filter(it => it !== null)
        field.input.render(options)
      }
      searchField.input.oninput = ev => {

        const query = ev.target.value.toLowerCase()
        let filtered
        if (this.verifyIs("text/empty", query)) {
          filtered = options
        } else {
          filtered = options.filter(it => it.email.toLowerCase().includes(query))
        }
        field.input.render(filtered)
      }
      field.selectedEmails = () => {

        return Array.from(field.input.selectedOptions).map(it => it.text)
      }
      field.selectedIds = () => {

        return Array.from(field.input.selectedOptions).map(it => it.value)
      }
      this.verify("input/value", field.input)
      field.input.addEventListener("input", ev => this.verify("input/value", field.input))
      return field
    }
    if (event === "select/experts") {
      const field = this.create("input/select", input)
      this.request("/jwt/get/experts/").then(res => {
        if (res.status === 200) {
          const experts = JSON.parse(res.response)
          field.input.textContent = ""
          for (let i = 0; i < experts.length; i++) {
            const expert = experts[i]
            const option = document.createElement("option")
            option.value = expert.id
            option.text = expert.email
            if (expert.alias) option.text = expert.alias
            this.append(option, field.input)
          }
        }
      })
      return field
    }
    if (event === "toolbox/bottom-right") {
      const button = this.create("button/bottom-right")
      button.removeAttribute("class")
      this.add("hover-outline", button)
      this.convert("dark-light", button)
      input?.appendChild(button)
      return button
    }
    if (event === "toolbox/icon") {
      const button = this.create("button/icon")
      button.removeAttribute("class")
      this.add("hover-outline", button)
      this.convert("dark-light", button)
      input?.appendChild(button)
      return button
    }
    if (event === "field/closed-contacts-email-select") {
      return new Promise(async(resolve, reject) => {
        try {
          const field = this.create("field/select", input)
          field.label.textContent = "Gebe einer Liste von E-Mails aus deinen Kontakten, Schreibrechte"
          const defaultOption = document.createElement("option")
          defaultOption.text = "Bitte warten.."
          field.input.appendChild(defaultOption)
          const res = await this.request("/jwt/get/tree/", {tree: "contacts"})
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
      const field = this.create("field")
      const checkboxInput = this.create("input/checkbox", field)
      field.input = checkboxInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
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
      field.image = document.createElement("div")
      field.image.classList.add("field-label-image")
      field.image.style.minWidth = "34px"
      field.image.style.maxWidth = "34px"
      field.image.style.marginRight = "21px"
      this.render("icon/node/path", "/public/info-circle.svg", field.image)
      field.label.before(field.image)
      field.input.setAttribute("required", "true")
      input?.appendChild(field)
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
      const field = this.create("field")
      const fileInput = this.create("input/file", field)
      field.input = fileInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
      return field
    }
    if (event === "field/tel") {
      const field = this.create("field")
      const telInput = this.create("input/tel", field)
      field.input = telInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
      return field
    }
    if (event === "field/date") {
      const field = this.create("field")
      const dateInput = this.create("input/date", field)
      field.input = dateInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
      return field
    }
    if (event === "field/number") {
      const field = this.create("field")
      const numberInput = this.create("input/number", field)
      field.input = numberInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
      return field
    }
    if (event === "field/password") {
      const field = this.create("field")
      const passwordInput = this.create("input/password", field)
      field.input = passwordInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
      return field
    }
    if (event === "field/range") {
      const field = this.create("field")
      const rangeInput = this.create("input/range", field)
      field.input = rangeInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
      return field
    }
    if (event === "field/text") {
      const field = this.create("field")
      const textInput = this.create("input/text", field)
      field.input = textInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
      return field
    }
    if (event === "field") {
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
      field.labelContainer.style.wordBreak = "break-word"
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.appendChild(field.labelContainer)
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.labelContainer.appendChild(field.label)
      this.convert("dark-light", field)
      input?.appendChild(field)
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
      const field = this.create("field")
      field.label.textContent = "E-Mail Adresse"
      const emailInput = this.create("input/email", field)
      field.input = emailInput.input
      field.input.classList.add("field-input")
      input?.appendChild(field)
      return field
    }
    if (event === "field/id") {
      const field = this.create("field/tag")
      field.label.textContent = "Identifikationsname (text/tag)"
      field.input.placeholder = "meine-id"
      this.verify("input/value", field.input)
      this.add("hover-outline", field.input)
      field.input.oninput = () => {
        this.verify("input/value", field.input)
        if (this.verifyIs("id/unique", field.input.value) && this.verifyIs("text/tag", field.input.value)) {
          this.add("style/valid", field.input)
        } else {
          this.add("style/not-valid", field.input)
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
      this.add("style/valid", langField.input)

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
    if (event === "div/loading") {
      const div = this.div("flex column align")
      div.info = this.div("fs13 color-error sans-serif", div)
      div.info.textContent = "Das kann einen Moment dauern .."
      this.render("icon/node/path", "/public/loading.svg").then(icon => {
        const svg = icon.querySelector("svg")
        svg.classList.add("fill-error")
        this.append(icon, div)
      })
      if (input) this.append(div, input)
      return div
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
      const div = document.createElement("div")
      div.className = "fs13 sans-serif p13 br13 mtb21 mlr34 dark-text bg-success"
      if (input) this.append(div, input)
      return div
    }
    if (event === "button/start") {
      const button = this.create("button/left-right")
      button.left.textContent = ".start"
      button.right.textContent = "Beginne deine Reise in die digitale Freiheit"
      button.onclick = () => window.open("/", "_blank")
      if (input) this.append(button, input)
      return button
    }
    if (event === "label") {
      const it = document.createElement("label")
      it.className = "sans-serif fs21 color-theme block break-word"
      it.setAttribute("for", input.for)
      it.textContent = input.text
      return it
    }
    if (event === "ul") {
      const ul = document.createElement("ul")
      if (input) this.append(ul, input)
      return ul
    }
    if (event === "video") {
      const fragment = document.createDocumentFragment()
      const video = document.createElement("video")
      fragment.appendChild(video)
      video.style.width = "100%"
      video.autoplay = true
      input?.appendChild(fragment)
      return video
    }
    if (event === "visibility-button") {
      const fragment = document.createDocumentFragment()
      const button = Helper.create("button/left-right", fragment)
      button.left.textContent = ".visibility"
      button.right.textContent = "Sichtbarkeit ändern"
      input?.appendChild(fragment)
      return button
    }
  }
  static colors = {
    white: "#FFF",
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
  static async contacts() {
    if (!this._contacts) {
      const module = await import("/js/contacts.js")
      this._contacts = module.contacts
    }
    return this._contacts
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
    if (event === "array/table") {
      const table = document.createElement('table')
      table.setAttribute('border', '1')
      const thead = document.createElement('thead')
      const headerRow = document.createElement('tr')
      Object.keys(input[0]).forEach(key => {
        const th = document.createElement('th')
        th.textContent = key
        headerRow.appendChild(th)
      })
      thead.appendChild(headerRow)
      table.appendChild(thead)
      const tbody = document.createElement('tbody')
      input.forEach(item => {
        const row = document.createElement('tr')
        Object.values(item).forEach(value => {
          const td = document.createElement('td')
          td.textContent = value
          row.appendChild(td)
        })
        tbody.appendChild(row)
      })
      table.appendChild(tbody)
      return table
    }
    if (event === "button/back") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.boxShadow = this.colors.light.boxShadow
        input.style.border = this.colors.light.border
        input.style.backgroundColor = this.colors.light.foreground
      } else {
        input.style.boxShadow = this.colors.dark.boxShadow
        input.style.border = this.colors.dark.border
        input.style.backgroundColor = this.colors.dark.foreground
      }


      input.querySelectorAll("*").forEach((child, i) => {
        if (child.hasAttribute("stroke")) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            child.setAttribute("stroke", `${this.colors.light.text}`)
          } else {
            child.setAttribute("stroke", `${this.colors.dark.text}`)
          }
        }
      })
    }
    if (event === "border/dark-light") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.border = this.colors.dark.border
      } else {
        input.style.border = this.colors.light.border
      }
    }
    if (event === "box/dark-light") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.classList.add("dark-bg")
        input.classList.add("dark-border")
        input.classList.add("dark-bs")
        input.classList.add("light-text")
      } else {
        input.classList.add("light-bg")
        input.classList.add("light-border")
        input.classList.add("light-bs")
        input.classList.add("dark-text")
      }
    }
    if (event === "button/dark-light") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.backgroundColor = this.colors.dark.foreground
        input.style.border = this.colors.dark.border
        input.style.boxShadow = this.colors.dark.boxShadow
        input.style.color = this.colors.dark.text
      } else {
        input.style.backgroundColor = this.colors.light.foreground
        input.style.border = this.colors.light.border
        input.style.color = this.colors.light.text
        input.style.boxShadow = this.colors.light.boxShadow
      }
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
    if (event === "canvas/image") {
      return new Promise((resolve, reject) => {
        try {
          input.toBlob(async blob => {
            const hash = await this.digest(blob)
            const fileName = `${hash}.jpg`
            const file = new File([blob], fileName, { type: 'image/jpeg' })
            resolve(file)
          })
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "dark-light") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.color = this.colors.dark.text
        input.style.background = this.colors.dark.background
      } else {
        input.style.color = this.colors.light.text
        input.style.background = this.colors.light.background
      }

      if (input.classList.contains("icon")) {
        input.querySelectorAll("*").forEach((child, i) => {
          if (child.hasAttribute("stroke")) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              child.setAttribute("stroke", `${this.colors.light.text}`)
            } else {
              child.setAttribute("stroke", `${this.colors.dark.text}`)
            }
          }
        })
      }

      if (input.tagName === "A") {
        this.convert("link/color", input)
      }

      if (input.classList.contains("field")) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          input.style.backgroundColor = this.colors.dark.foreground
          input.style.border = this.colors.dark.border
          input.style.boxShadow = this.colors.dark.boxShadow
          input.style.color = this.colors.dark.text
          for (let i = 0; i < input.querySelectorAll("*").length; i++) {
            const child = input.querySelectorAll("*")[i]
            if (child.hasAttribute("fill")) {
              child.setAttribute("fill", this.colors.dark.text)
            }
          }
        } else {
          input.style.backgroundColor = this.colors.light.foreground
          input.style.border = this.colors.light.border
          input.style.boxShadow = this.colors.light.boxShadow
          input.style.color = this.colors.light.text
          for (let i = 0; i < input.querySelectorAll("*").length; i++) {
            const child = input.querySelectorAll("*")[i]
            if (child.hasAttribute("fill")) {
              child.setAttribute("fill", this.colors.light.text)
            }
          }
        }
      }

      // if (input.classList.contains("back") && input.classList.contains("button")) {
      //   this.convert("button/back", input)
      // }
    }
    if (event === "doc/inline") {
      function mergeStyles(it, dummy) {
        const result = {}
        for (let i = 0; i < it.length; i++) {
          const key = it[i]
          const value1 = it.getPropertyValue(key)
          const value2 = dummy.getPropertyValue(key)
          if (value1 !== value2) {
            result[key] = value1
          }
        }
        return result
      }
      const elements = input.querySelectorAll('*')
      elements.forEach(element => {
        const dummy = document.createElement(element.tagName)
        document.body.appendChild(dummy)
        const dummyStyle = window.getComputedStyle(dummy)
        const elementStyle = window.getComputedStyle(element)
        const style = mergeStyles(elementStyle, dummyStyle)
        let newStyle = ''
        if (!this.verifyIs("object/empty", style)) {
          for (const key in style) {
            newStyle += `${key}: ${style[key]}; `
          }
        }
        if (!this.verifyIs("text/empty", newStyle)) {
          element.setAttribute('style', newStyle.trim())
        }
      })
      return input
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
    if (event === "markdown/html") {
      input = input.replace(/^# (.+)$/gm, '<h1>$1</h1>')
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

      return input
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
    if (event === "file/svg") {
      return new Promise(async(resolve, reject) => {
        try {
          const fileReader = new FileReader()
          fileReader.onload = async () => {
            const svg = await this.convert("text/first-child", fileReader.result)
            resolve(svg)
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
    if (event === "icon/dark-light") {
      if (input.classList.contains("icon")) {
        input.querySelectorAll("*").forEach((child, i) => {
          if (child.hasAttribute("stroke")) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              child.setAttribute("stroke", `${this.colors.light.text}`)
            } else {
              child.setAttribute("stroke", `${this.colors.dark.text}`)
            }
          }
        })
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
            this.add("style/not-valid", input)
            throw error
          })
        }

        if (allowedExtensions !== undefined) {
          await this.verifyIs("file/extensions", {file, extensions: allowedExtensions})
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            this.add("style/not-valid", input)
            throw error
          })
        }

        const dataUrl = await this.convert("file/image-size", {file, size: 2584})
        const dataUrlSize = this.convert("text/length", dataUrl)
        if (dataUrlSize > 1024 * 1024) {
          alert("Datei ist zu groß.")
          this.add("style/not-valid", input)
          throw new Error("image too large")
        }

        const image = {}
        image.name = file.name
        image.type = file.type
        image.size = dataUrlSize
        image.modified = Date.now()
        image.dataUrl = dataUrl
        this.add("style/valid", input)
        return resolve(image)

      })
    }
    if (event === "it/map") {
      const {tree, it} = input
      let map
      const key = this.convert("tree/key", tree)
      try {
        map = JSON.parse(it)
      } catch (e) {
        map = {[key]: it}
      }
      return map
    }
    if (event === "text/line") {
      let text = input
      text = text.replace(/\s+/g, " ").trim()
      text = text.slice(1, -1).trim()
      const textArray = text.split(",").map(text => text.trim())
      const filtered = textArray.filter(text => !this.verifyIs("text/empty", text))
      const singleLine = filtered.join(", ")
      return `{${singleLine}}`
    }
    if (event === "map/form") {
      const form = document.createElement("form")
      form.setAttribute("role", "form")
      function createFormElements(it, node) {

        for (const key in it) {
          if (it.hasOwnProperty(key)) {
            const value = it[key]
            const div = document.createElement("div")
            const label = document.createElement("label")
            label.textContent = key
            label.setAttribute("for", key)
            if (Array.isArray(value)) {

              const select = Helper.create(`input/select`)
              select.input.add(value)
              select.input.name = key
              select.input.id = key
              select.input.setAttribute("aria-label", key)
              div.appendChild(label)
              div.appendChild(select)
            }
            else if (typeof value === "object") {

              createFormElements(value, div)
            }
            else {

              if (["checkbox", "date", "email", "file", "number", "password", "range", "tel", "text", "textarea"].includes(value)) {
                const it = Helper.create(`input/${value}`)
                if (value !== "textarea") it.input.type = value
                it.input.name = key
                it.input.id = key
                it.input.setAttribute("aria-label", key)
                div.appendChild(label)
                div.appendChild(it)
              }
            }
            node.appendChild(div)
          }
        }
      }
      createFormElements(input, form)
      return form
    }
    if (event === "html/blob") {
      return new Blob([input], { type: 'text/html' })
    }
    if (event === "json/div") {
      function blockAll(element) {
        element.classList.add("block")
        element.querySelectorAll(".key-value").forEach(node => {
          node.classList.add("block")
        })
      }
      function removeAllBlock(element) {
        element.classList.remove("block")
        element.querySelectorAll(".key-value").forEach(node => {
          node.classList.remove("block")
        })
      }

      function noneAll(element) {
        element.classList.add("none")
        element.querySelectorAll(".key-value").forEach(node => {
          node.classList.add("none")
        })
      }
      function removeAllNone(element) {
        element.classList.remove("none")
        element.querySelectorAll(".key-value").forEach(node => {
          node.classList.remove("none")
        })
      }

      const div = this.div("monospace fw-bold fs21 mtb21 mlr34")
      const buttons = this.div("flex align between", div)
      const foldAllButton = this.create("button/action", buttons)
      foldAllButton.classList.add("w89")
      foldAllButton.textContent = "fold"
      foldAllButton.onclick = ev => {
        toggleAllValues("none")
      }
      const unfoldAllButton = this.create("button/action", buttons)
      unfoldAllButton.classList.add("w89")
      unfoldAllButton.textContent = "unfold"
      unfoldAllButton.onclick = ev => {
        toggleAllValues("block")
      }
      function toggleAllValues(displayValue) {
        const valueElements = div.querySelectorAll(".key-value")
        valueElements.forEach(element => {
          if (displayValue === "none") {
            removeAllBlock(element)
            noneAll(element)
          }
          if (displayValue === "block") {
            removeAllNone(element)
            blockAll(element)
          }
        })
      }
      const jsonObject = JSON.parse(input)
      function toggleElement(element) {

        if (element) {
          if (element.classList.contains("none")) {
            element.classList.remove("none")
            element.classList.add("block")
            return
          }
          if (element.classList.contains("block")) {
            element.classList.remove("block")
            element.classList.add("none")
            return
          }
        }
      }
      function processObject(container, obj) {

        for (let key in obj) {
          const value = obj[key]
          if (key === "") key = "\"\""
          const keyElement = Helper.div("color-key")
          Helper.add("hover-outline", keyElement)
          const valueElement = Helper.div("key-value none ml21 color-value")
          keyElement.addEventListener("click", ev => {
            ev.stopPropagation()
            toggleElement(valueElement)
          })
          const keyName = document.createElement("div")
          keyName.classList.add("key-name")
          keyName.textContent = key
          keyElement.appendChild(keyName)
          container.appendChild(keyElement)
          keyElement.appendChild(valueElement)
          if (typeof value === "object") {
            processObject(valueElement, value)
          } else {
            valueElement.textContent = JSON.stringify(value)
          }
        }
      }
      processObject(div, jsonObject)
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
      this.add("hover-outline", labelContainer)
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
        this.overlay("pop", async overlay => {
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
    if (event === "funnel/map") {
      if (input.id) {
        const map = {}
        map[input.id] = {}
        input.querySelectorAll("*").forEach(node => {
          if (!this.verifyIs("tag/empty", node.id)) {
            const tagName = node.tagName.toLowerCase()
            if (tagName === "select") {
              map[input.id][node.id] = Array.from(node.selectedOptions).map(it => it.value)
            }
            if (tagName === "input" || tagName === "textarea") {
              if (node.type === "checkbox") {
                map[input.id][node.id] = node.checked
              } else {
                map[input.id][node.id] = node.value
              }
            }
          }
        })
        return map
      } else {
        window.alert("Funnel Id ist ungültig.")
      }
    }
    if (event === "funnel/values") {
      const it = {}
      const nodes = input.querySelectorAll("*")
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (this.verifyIs("tag/empty", node.id)) continue
        const tagName = node.tagName.toLowerCase()
        if (tagName === "select") {
          it[node.id] = Array.from(node.selectedOptions).map(it => it.value)
        }
        if (tagName === "input" || tagName === "textarea") {
          if (node.type === "checkbox") {
            it[node.id] = node.checked
          } else {
            it[node.id] = node.value
          }
        }
      }
      return it
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
    if (event === "nodelist/map") {
      function convertNodeListToMap(nodeList) {
        const map = {};

        for (const node of nodeList) {
          const tagName = node.tagName.toLowerCase();
          const id = node.id;
          if (!id || Helper.verifyIs("text/empty", id)) continue
          const type = node.type;
          const name = node.name;

          if (tagName === "input") {
            if (type === "checkbox") {
              map[id] = node.checked;
            } else if (type === "radio") {
              if (node.checked) {
                map[name] = node.value;
              }
            } else {
              map[id] = node.value;
            }
          } else if (tagName === "textarea") {
            map[id] = node.value;
          } else if (tagName === "select") {
            map[id] = Array.from(node.selectedOptions).map(option => option.value);
          }
        }

        return map;
      }
      return convertNodeListToMap(input)
    }
    if (event === "number/de") {
      const de = {
        1: "eins",
        2: "zwei",
        3: "drei",
        4: "vier",
        5: "fuenf",
        6: "sechs",
        7: "sieben",
        8: "acht",
        9: "neun",
      }
      return de[input] || undefined
    }
    if (event === "path/divs") {
      return new Promise(async(resolve, reject) => {
        try {
          const funnels = []
          const requestedText = await text(input)
          const doc = this.convert("text/doc", requestedText)
          const divs = Array.from(doc.querySelectorAll("div"))
          resolve(divs)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "path/ids") {
      return new Promise(async(resolve, reject) => {
        try {
          const funnels = []
          const requestedText = await text(input)
          const doc = this.convert("text/doc", requestedText)
          const ids = Array.from(doc.querySelectorAll("[id]"))
          resolve(ids)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "path/field-funnel") {
      return new Promise(async(resolve, reject) => {
        try {
          const requestedText = await text(input)
          const doc = this.convert("text/doc", requestedText)
          const fieldFunnel = doc.querySelector(".field-funnel")
          if (fieldFunnel) {
            resolve(fieldFunnel)
          }

        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "path/funnel") {
      const {path, tag} = input
      return new Promise(async(resolve, reject) => {
        try {
          const funnels = await Helper.convert("path/funnels", path)
          if (funnels.length <= 0) {
            window.alert(`Fehler: Pfad enthält kein Funnel. Bitte kontaktiere deinen Ansprechpartner.\n\nPfad: '${path}'`)
            throw new Error("funnel not found in path")
          }
          const funnel = funnels.find(it => it.id === tag)
          await Helper.verify("funnel/ids", funnel)
          .catch(error => {
            window.alert(`Fehler: Es fehlen Ids im Funnel. Bitte kontaktiere deinen Ansprechpartner.\n\nPfad: '${path}'`)
            throw error
          })
          Helper.add("funnel/hover", funnel)
          Helper.verify("funnel", funnel)
          funnel.submit = funnel.querySelector(".submit")
          if (!funnel.submit) {
            funnel.submit = Helper.create("button/action", funnel)
            funnel.submit.className += " submit"
            funnel.submit.textContent = "Daten jetzt speichern"
          }
          resolve(funnel)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "path/funnels") {
      return new Promise(async(resolve, reject) => {
        try {
          const funnels = []
          const requestedText = await text(input)
          const doc = this.convert("text/doc", requestedText)
          const divs = doc.querySelectorAll("div[id]")
          divs.forEach(div => {
            const isFunnel = div.querySelector("input, select, textarea")
            if (isFunnel) funnels.push(div)
          })
          resolve(funnels)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "path/icon") {
      return new Promise(async(resolve, reject) => {
        try {
          const requestedText = await text(input)
          const icon = this.div("icon flex align center")
          const svg = await this.convert("text/first-child", requestedText)
          svg.setAttribute("width", "100%")
          this.convert("svg/dark-light", svg)
          this.append(svg, icon)
          resolve(icon)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "path/id") {
      const it = input.split("/").pop()
      return it.split(".")[0]
    }
    if (event === "stroke/reverse") {
      input.querySelectorAll("[stroke]").forEach(node => {
        node.removeAttribute("stroke")
        node.classList.add("stroke-theme-reverse")
      })
    }
    if (event === "tag/tree") {
      return input.replaceAll("-", ".")
    }
    if (event === "text/boolean") {
      if (input === "true" || input === "false") {
        return true
      } else {
        return false
      }
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
    if (event === "text/prompt") {
      const promptRegex = /prompt\(([^)]+)\)/g
      let match
      const matches = []
      while ((match = promptRegex.exec(input)) !== null) {
        matches.push(match)
      }
      matches.forEach(match => {
        const id = match[1]
        const userInput = window.prompt(`Ersetze den Text für die Id: "${id}"`)
        input = input.replace(`prompt(${id})`, userInput)
      })
      return input
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
    if (event === "text/tag") {
      input = input.toLowerCase()
      input = input.replaceAll(" ", "-")
      input = input.replaceAll("ö", "oe")
      input = input.replaceAll("ä", "ae")
      input = input.replaceAll("ü", "ue")
      input = input.replace(/[^a-z-]/g, '')
      input = input.replace(/-+/g, '-')
      if (input.startsWith("-")) input = input.slice(1)
      if (input.endsWith("-")) input = input.slice(0, -1)
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
          resolve(sources)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "text/span") {
      const span = document.createElement("span")
      span.textContent = input

      return span
    }
    if (event === "text/capital-first-letter") {
      return input.charAt(0).toUpperCase() + input.slice(1)
    }
    if (event === "text/type") {
      if (this.verifyIs("text/boolean", input)) return "boolean"
      if (this.verifyIs("text/number", input)) return "number"
      if (!this.verifyIs("text/empty", input)) return "text"
    }
    if (event === "tree/class") {
      return input.replace(/\./g, "-")
    }
    if (event === "tree/key") {
      const keys = input.split(".")
      if (keys.length > 0) {
        return keys[keys.length - 1]
      } else {
        return input
      }
    }
    if (event === "user-tree") {
      let {user, tree} = input
      const pathArray = tree.split('.')
      for (let i = 0; i < pathArray.length; i++) {
        const key = pathArray[i]
        if (i + 1 === pathArray.length) {
          if (user[key] !== undefined) return user[key]
        }
        if (user[key] !== undefined) {
          user = user[key]
        }
      }
    }
    if (event === "parent/box") {
      input.removeAttribute("style")
      input.className = "br13 p13 pointer box"
      this.add("hover-outline", input)
      return input
    }
    if (event === "parent/space-between") {
      input.style.display = "flex"
      input.style.flexWrap = "wrap"
      input.style.justifyContent = "space-between"

      return input
    }
    if (event === "parent/flex-around") {
      this.reset("node", input)
      this.render("classes", "flex wrap around mlr34", input)
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
      this.reset("node", input)
      this.render("classes", "flex wrap mlr34", input)
    }
    if (event === "parent/dark") {
      input.style.color = this.colors.dark.text
      input.style.background = this.colors.dark.background
    }
    if (event === "button/left-right") {
      input.className = "br13 sans-serif pointer flex wrap align between mtb21 mlr34"
      input.left.className = "of-auto mtb21 mlr34 fs21"
      input.right.className = "of-auto mtb21 mlr34 fs13"
      this.add("class/dark-light", input)
    }
    if (event === "parent/light") {
      input.style.color = this.colors.light.text
      input.style.background = this.colors.light.background
    }
    if (event === "parent/loading") {
      input.textContent = ""
      input.removeAttribute("style")
      input.className = "flex column align center"
      this.add("loading", input)
      return input
    }
    if (event === "parent/scrollable") {
      input.textContent = ""
      input.removeAttribute("style")
      input.className = "ofy-auto overscroll-none pb144"
      return input
    }
    if (event === "parent/info") {
      input.textContent = ""
      input.removeAttribute("style")
      input.className = "flex align center z-1 sans-serif color-gray"
      return input
    }
    if (event === "parent/note") {
      this.reset("node", input)
      input.textContent = ""
      this.render("classes", "ptb144 flex align center color-theme sans-serif", input)
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
    if (event === "seconds/hh:mm:ss") {
      function formatTime(input) {

        const totalSeconds = Math.floor(input)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        const formattedHours = hours > 0 ? hours : ''
        const formattedMinutes = hours > 0 || minutes > 0 ? minutes : ''
        let timeString = ''
        if (formattedHours) {
          timeString += formattedHours + ':'
        }
        timeString += (formattedMinutes > 0 ? formattedMinutes.toString().padStart(2, '0') : '00') + ':'
        timeString += seconds.toString().padStart(2, '0')
        return timeString
      }
      return formatTime(input)
    }
    if (event === "seconds/millis") {
      return Number(input) * 1000
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
    if (event === "style/scrollable") {
      input.removeAttribute("style")
      input.style.overflow = "auto"
      input.style.overscrollBehavior = "none"
      input.style.paddingBottom = "144px"
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
    if (event === "millis/iso") {
      const millis = parseInt(input, 10)
      const date = new Date(millis)
      return date.toISOString()
    }
    if (event === "millis/since") {
      function formatTimeSince(milliseconds) {
        const now = Date.now()
        const elapsed = now - milliseconds
        const msInSecond = 1000
        const msInMinute = 60 * msInSecond
        const msInHour = 60 * msInMinute
        const msInDay = 24 * msInHour
        const msInMonth = 30 * msInDay
        const msInYear = 12 * msInMonth
        if (elapsed < msInMinute) {
          const seconds = Math.floor(elapsed / msInSecond)
          return `${seconds} Sekunde${seconds !== 1 ? 'n' : ''}`
        } else if (elapsed < msInHour) {
          const minutes = Math.floor(elapsed / msInMinute)
          return `${minutes} Minute${minutes !== 1 ? 'n' : ''}`
        } else if (elapsed < msInDay) {
          const hours = Math.floor(elapsed / msInHour)
          const minutes = Math.floor((elapsed % msInHour) / msInMinute)
          return `${hours} Stunde${hours !== 1 ? 'n' : ''} ${minutes} Minute${minutes !== 1 ? 'n' : ''}`
        } else if (elapsed < msInMonth) {
          const days = Math.floor(elapsed / msInDay)
          return `${days} Tag${days !== 1 ? 'en' : ''}`
        } else if (elapsed < msInYear) {
          const months = Math.floor(elapsed / msInMonth)
          return `${months} Monat${months !== 1 ? 'en' : ''}`
        } else {
          const years = Math.floor(elapsed / msInYear)
          return `${years} Jahr${years !== 1 ? 'en' : ''}`
        }
      }
      return formatTimeSince(input)
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
    if (event === "millis/yyyy-mm-ddThh:mm") {
      const date = new Date(input)
      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear().toString()
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    if (event === "millis/yyyy-mm-ddThh:mm:ss") {
      const date = new Date(input)
      const day = date.getDate().toString().padStart(2, "0")
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear().toString()
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")
      const seconds = date.getSeconds().toString().padStart(2, "0")
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
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
    if (event === "millis/yyyy-mm-dd") {
      const date = new Date(input)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear().toString()
      return `${year}-${month}-${day}`
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
    if (event === "selector/class") {
      const classMatches = input.match(/\.([a-zA-Z0-9-_]+)/g)
      const className = classMatches ? classMatches.map(cls => cls.slice(1)).join(' ') : undefined
      return className
    }
    if (event === "selector/id") {
      const idMatch = input.match(/#([a-zA-Z0-9-_]+)/)
      return idMatch ? idMatch[1] : undefined
    }
    if (event === "selector/tag") {
      const tagMatch = input.match(/^[a-zA-Z0-9]+/)
      return tagMatch ? tagMatch[0] : undefined
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
      if (input) {
        input.removeAttribute("style")
        input.innerHTML = ""
      }
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
    if (event === "svg/dark-light") {
      for (let i = 0; i < input.querySelectorAll("*").length; i++) {
        const node = input.querySelectorAll("*")[i]
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
      if (input.hasAttribute("fill")) {
        if (input.getAttribute("fill").includes("#000")) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            input.setAttribute("fill", this.colors.dark.text)
          } else {
            input.setAttribute("fill", this.colors.light.text)
          }
        }
      }
      if (input.hasAttribute("stroke")) {
        if (input.getAttribute("stroke").includes("#000")) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            input.setAttribute("stroke", this.colors.dark.text)
          } else {
            input.setAttribute("stroke", this.colors.light.text)
          }
        }
      }
      return input
    }
    if (event === "link") {
      this.convert("link/color", input)
      this.add("hover-outline", input)
      input.classList.add("td-u")
    }
    if (event === "link/color") {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.classList.add("dark-link")
      } else {
        input.classList.add("light-link")
      }
    }
    if (event === "node/dark-light-toggle") {
      function getLuminance(rgb) {
        const [r, g, b] = rgb.map(value => {
          const channel = value / 255;
          return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }

      function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) {
          r = parseInt(hex.slice(1, 3), 16);
          g = parseInt(hex.slice(3, 5), 16);
          b = parseInt(hex.slice(5, 7), 16);
        }
        return [r, g, b];
      }

      function colorToRgbArray(color) {
        if (color.startsWith("rgb")) {
          return color.match(/\d+/g).map(Number);
        } else if (color.startsWith("#")) {
          return hexToRgb(color);
        }
        return [0, 0, 0]
      }

      const style = getComputedStyle(input)
      const textColor = colorToRgbArray(style.color);
      const backgroundColor = colorToRgbArray(style.backgroundColor);
      const textLuminance = getLuminance(textColor);
      const backgroundLuminance = getLuminance(backgroundColor);

      if (textLuminance > backgroundLuminance) {
        input.classList.remove("dark")
        input.classList.add("light")
      } else {
        input.classList.remove("light")
        input.classList.add("dark")
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
      const id = input.getAttribute("id") ? `#${input.id}` : ''
      const classes = input.getAttribute("class")
      ? `.${input.getAttribute("class").split(' ').join('.')}`
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
    if (event === "node/text-color") {
      return input.style.color
    }
    if (event === "number/k-M") {
      if (input < 1000) return input.toString()
      if (input >= 1000000) return (input / 1000000).toFixed(1) + 'M'
      return (input / 1000).toFixed(1) + 'T'
    }
    if (event === "type/extension") {
      const mimeMapping = {
        "audio/mpeg": "mp3",
        "audio/ogg": "ogg",
        "audio/wav": "wav",
        "video/mp4": "mp4",
        "video/ogg": "ogv",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/svg+xml": "svg",
        "text/html": "html",
        "text/plain": "txt",
        "application/pdf": "pdf",
        "application/zip": "zip",
      }

      return mimeMapping[input]
    }
    if (event === "video/canvas") {
      const canvas = document.createElement("canvas")
      canvas.width = input.videoWidth
      canvas.height = input.videoHeight
      canvas.getContext('2d').drawImage(input, 0, 0, canvas.width, canvas.height)
      return canvas
    }
  }
  static async deadlines() {
    if (!this._deadlines) {
      const module = await import("/js/deadlines.js")
      this._deadlines = module.deadlines
    }
    return this._deadlines
  }
  static async digest(blob) {
    const arrayBuffer = await blob.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }
  static async digestId(email) {
    const text = JSON.stringify({email, verified: true})
    const encoder = new TextEncoder()
    const arrayBuffer = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }
  static async downloadFile(content, contentType) {
    const a = document.createElement("a")
    const file = new Blob([content], { type: contentType })
    const hash = await this.digest(file)
    a.href = URL.createObjectURL(file)
    a.download = `${hash}.${this.convert("type/extension", contentType)}`
    a.click()
  }
  static async dynamicImport(url, callback) {
    const scriptLoaded = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
    try {
      await scriptLoaded
      if (typeof callback === "function") await callback()
      const scriptToRemove = document.querySelector(`script[src="${url}"]`)
      if (scriptToRemove) document.head.removeChild(scriptToRemove)
    } catch (error) {
      window.alert(`Fehler beim Laden oder Ausführen des Skripts:\n\n${error}`)
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
    if (event === "addLocationAssign") {
      return (node) => {
        const prompt = window.prompt("Gebe die Quell-Url deiner Weiterleitung ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          node.style.cursor = "pointer"
          node.setAttribute("onmouseover", "this.style.outline='3px solid #888'")
          node.setAttribute("onmouseout", "this.style.outline=null")
          node.setAttribute("onclick", `window.location.assign("${prompt}")`)
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
    if (event === "addWindowOpenBlank") {
      return (node) => {
        const prompt = window.prompt("Gebe die Quell-Url deines neuen Tabs ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          node.style.cursor = "pointer"
          node.setAttribute("onmouseover", "this.style.outline='3px solid #888'")
          node.setAttribute("onmouseout", "this.style.outline=null")
          node.setAttribute("onclick", `window.open("${prompt}", "_blank")`)
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
          Helper.add("hover-outline", button)
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
    if (event === "appendDiv") {
      return (node) => {
        const div = document.createElement("div")
        div.style.margin = "21px 34px"
        div.textContent = "DIV"
        const fragment = document.createDocumentFragment()
        fragment.appendChild(div)
        node.appendChild(fragment)
      }
    }
    if (event === "appendImage") {
      return (node) => {
        const url = window.prompt("Gebe die Quelle des Bildes ein: (text/url)")
        if (this.verifyIs("text/url", url)) {
          const fragment = document.createDocumentFragment()
          const div = document.createElement("div")
          fragment.appendChild(div)
          div.className = "image"
          const img = document.createElement("img")
          div.appendChild(img)
          img.src = url
          img.style.width = "100%"
          fragment.appendChild(div)
          node.appendChild(fragment)
        } else {
          window.alert("Keine gültige URL.")
        }
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
    if (event === "openUrl") {
      return (node) => {
        const url = window.prompt("Gebe die URL ein:")
        if (this.verifyIs("text/url", url)) {
          node.setAttribute("onclick", `window.open('${url}', '_blank')`)
        } else {
          window.alert("Keine gültige URL.")
        }
      }
    }
    if (event === "creator-buttons") {
      const {type} = input
      const it = {}
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
      it.toggleStyle = this.fn("toggleStyle")
      it.toggleStyles = this.fn("toggleStyles")
      it.toggleNodeAndChildrenStyles = this.fn("toggleNodeAndChildrenStyles")
      it.setStyleWithPrompt = this.fn("setStyleWithPrompt")
      it.incrementStyle = this.fn("incrementStyle")
      it.decrementStyle = this.fn("decrementStyle")
      it.fixedGridPrompt = this.fn("fixedGridPrompt")
      it.rotateNode = this.fn("rotateNode")
      it.appendUnorderedListItem = this.fn("appendUnorderedListItem")
      it.appendOrderedListItem = this.fn("appendOrderedListItem")
      it.toggleAttribute = this.fn("toggleAttribute")
      it.toggleInnerHtml = this.fn("toggleInnerHtml")
      it.toggleTextContent = this.fn("toggleTextContent")
      it.toggleNode = this.fn("toggleNode")
      it.setChildrenStyleWithPrompt = this.fn("setChildrenStyleWithPrompt")

      it.optionsContainer = this.create("div/scrollable", input.parent)
      it.optionsContainer.style.marginTop = "21px"
      it.optionsContainer.style.height = `${window.innerHeight * 0.4}px`

      it.quickContentTitle = this.render("text/hr", "Anwendungen für schnellen Inhalt", it.optionsContainer)
      this.add("hover-outline", it.quickContentTitle)
      it.quickContentOptions = this.create("div/flex-row", it.optionsContainer)
      it.quickContentTitle.onclick = () => toggleDisplayFlexNone(it.quickContentOptions)
      it.quickContentOptions.style.display = "none"

      it.openFunnelOverlayButton = this.render("text/link", "Meine Funnel", it.quickContentOptions)

      it.sourcesButton = this.render("text/link", "Meine Quellen", it.quickContentOptions)
      it.openSourcesOverlay = this.fn("openSourcesOverlay")
      if (type === "expert") {
        it.openScriptsOverlayButton = this.render("text/link", "Meine Skripte", it.quickContentOptions)
        it.openScriptsOverlay = this.fn("openScriptsOverlay")
      }
      it.templatesButton = this.render("text/link", "Meine Templates", it.quickContentOptions)
      it.openTemplatesOverlay = this.fn("openTemplatesOverlay")
      it.openPdfOverlayButton = this.render("text/link", "Meine PDFs", it.quickContentOptions)
      it.openPdfOverlay = this.fn("openPdfOverlay")
      it.openImagesOverlayButton = this.render("text/link", "Meine Bilder", it.quickContentOptions)
      it.openImagesOverlay = this.fn("openImagesOverlay")
      it.openAudiosOverlayButton = this.render("text/link", "Meine Audios", it.quickContentOptions)
      it.openAudiosOverlay = this.fn("openAudiosOverlay")
      it.openVideosOverlayButton = this.render("text/link", "Meine Videos", it.quickContentOptions)
      it.openVideosOverlay = this.fn("openVideosOverlay")

      it.templatesTitle = this.render("text/hr", "Anwendungen für einfache Vorlagen", it.optionsContainer)
      this.add("hover-outline", it.templatesTitle)
      it.templatesTitle.onclick = () => toggleDisplayFlexNone(it.templateOptions)
      it.templateOptions = this.create("div/flex-row", it.optionsContainer)
      it.templateOptions.style.display = "none"

      it.myValueUnitsButton = this.render("text/link", "Meine Werteinheiten", it.templateOptions)
      it.createMyValueUnitsBox = this.fn("createMyValueUnitsBox")

      it.profileSurveysButton = this.render("text/link", "Profile Umfragen", it.templateOptions)
      it.createProfileSurveysBox = this.fn("createProfileSurveysBox")

      it.videoSeriesButton = this.render("text/link", "Video Serien Button", it.templateOptions)
      it.createVideoSeriesBox = this.fn("createVideoSeriesBox")

      it.imageTextAndActionButton = this.render("text/link", "Bild-Text-Action Box", it.templateOptions)
      it.createImageTextAndActionBox = this.fn("createImageTextAndActionBox")
      it.backgroundImageWithTitlesButton = this.render("text/link", "Hintergrund Bild mit Titel", it.templateOptions)
      it.createBackgroundImageWithTitles = this.fn("createBackgroundImageWithTitles")
      it.createFlexButton = this.render("text/link", "Flex Elemente erstellen", it.templateOptions)
      it.createFlexWidthWithPrompt = this.fn("createFlexWidthWithPrompt")
      it.createGridButton = this.render("text/link", "Grid Matrix erstellen", it.templateOptions)
      it.createGridMatrixWithPrompt = this.fn("createGridMatrixWithPrompt")
      it.appendDivButton = this.render("text/link", "Div anhängen", it.templateOptions)
      it.appendDiv = this.fn("appendDiv")
      it.rowContainerButton = this.render("text/link", "Div als Flex Zeile", it.templateOptions)
      it.createFlexRow = this.fn("createFlexRow")
      it.columnContainerButton = this.render("text/link", "Div als Flex Spalte", it.templateOptions)
      it.createFlexColumn = this.fn("createFlexColumn")
      it.appendImageButton = this.render("text/link", "Bild anhängen", it.templateOptions)
      it.appendImage = this.fn("appendImage")

      it.imageTextButton = this.render("text/link", "Bild mit Unterschrift", it.templateOptions)
      it.createImageText = this.fn("createImageText")
      it.keyValueButton = this.render("text/link", "Schlüsselpaar erstellen", it.templateOptions)
      it.createKeyValue = this.fn("createKeyValue")
      it.actionBtnButton = this.render("text/link", "Action Button erstellen", it.templateOptions)
      it.createActionButton = this.fn("createActionButton")


      it.styleBackgroundImageButton = this.render("text/link", "Hintergrundbild anhängen", it.templateOptions)
      it.styleBackgroundImage = this.fn("styleBackgroundImage")

      it.horizontalHrButton = this.render("text/link", "Horizontale Trennlinie", it.templateOptions)
      it.createHr = this.fn("createHr")



      it.simpleHeaderButton = this.render("text/link", "Kopfzeile mit Bild Links", it.templateOptions)
      it.createLeftImageHeader = this.fn("createLeftImageHeader")
      it.h1Button = this.render("text/link", "Überschrift 1", it.templateOptions)
      it.createH1withPrompt = this.fn("createH1withPrompt")
      it.h2Button = this.render("text/link", "Überschrift 2", it.templateOptions)
      it.createH2withPrompt = this.fn("createH2withPrompt")
      it.h3Button = this.render("text/link", "Überschrift 3", it.templateOptions)
      it.createH3withPrompt = this.fn("createH3withPrompt")
      it.pButton = this.render("text/link", "Paragraph erstellen", it.templateOptions)
      it.createPwithPrompt = this.fn("createPwithPrompt")
      it.imageButton = this.render("text/link", "Bild erstellen", it.templateOptions)
      it.createImagePlaceholder = this.fn("createImagePlaceholder")
      it.tableHeaderButton = this.render("text/link", "Tabellen Überschriften erstellen", it.templateOptions)
      it.createTableWithMatrixPrompt = this.fn("createTableWithMatrixPrompt")
      it.pdfLinkButton = this.render("text/link", "PDF Link erstellen", it.templateOptions)
      it.createPdfLinkWithPrompt = this.fn("createPdfLinkWithPrompt")
      it.aLinkButton = this.render("text/link", "Link erstellen", it.templateOptions)
      it.createAnchorWithPrompt = this.fn("createAnchorWithPrompt")
      it.wrapLinkButton = this.render("text/link", "Als Link einpacken", it.templateOptions)
      it.wrapAnchorWithPrompt = this.fn("wrapAnchorWithPrompt")
      it.locationAssignButton = this.render("text/link", "Weiterleitung einfügen", it.templateOptions)
      it.addLocationAssign = this.fn("addLocationAssign")
      it.windowOpenBlankButton = this.render("text/link", "Weiterleitung mit neuem Tab", it.templateOptions)
      it.addWindowOpenBlank = this.fn("addWindowOpenBlank")
      it.spanButton = this.render("text/link", "Text Inhalt als Span", it.templateOptions)
      it.createSpanWithTextContent = this.fn("createSpanWithTextContent")
      it.changeSiButton = this.render("text/link", "SI Einheit als Span", it.templateOptions)
      it.createSpanWithSiPrompt = this.fn("createSpanWithSiPrompt")
      it.addSpaceButton = this.render("text/link", "Abstand erstellen", it.templateOptions)
      it.createSpaceWithHeightPrompt = this.fn("createSpaceWithHeightPrompt")
      it.arrowRightButton = this.render("text/link", "Pfeil nach Rechts mit Farbe", it.templateOptions)
      it.createArrowRightWithColorPrompt = this.fn("createArrowRightWithColorPrompt")
      it.divScrollableButton = this.render("text/link", "Div Scrollbar in Y Richtung", it.templateOptions)
      it.createScrollableY = this.fn("createScrollableY")
      it.packDivButton = this.render("text/link", "Inhalt als Div einpacken", it.templateOptions)
      it.createDivPackOuter = this.fn("createDivPackOuter")

      it.eventTitle = this.render("text/hr", "Anwendungen für Events", it.optionsContainer)
      this.add("hover-outline", it.eventTitle)
      it.eventTitle.onclick = () => toggleDisplayFlexNone(it.eventOptions)
      it.eventOptions = this.create("div/flex-row", it.optionsContainer)
      it.eventOptions.style.display = "none"

      it.pointerButton = this.render("text/link", "Pointer-Event hinzufügen", it.eventOptions)
      it.pointer = this.fn("pointer")
      it.openUrlButton = this.render("text/link", "URL-Klick-Weiterleitung hinzufügen", it.eventOptions)
      it.openUrl = this.fn("openUrl")


      it.converterTitle = this.render("text/hr", "Anwendungen für Konverter", it.optionsContainer)
      this.add("hover-outline", it.converterTitle)
      it.converterTitle.onclick = () => toggleDisplayFlexNone(it.converterOptions)
      it.converterOptions = this.create("div/flex-row", it.optionsContainer)
      it.converterOptions.style.display = "none"

      it.textConverterButton = this.render("text/link", "Text konvertieren", it.converterOptions)
      it.textConverterButton.onclick = () => this.fn("overlay-text-converter")
      it.duckDuckGoButton = this.render("text/link", "DuckDuckGo Link erstellen", it.converterOptions)
      it.convertTextContentToDuckDuckGoLink = this.fn("convertTextContentToDuckDuckGoLink")
      it.convertTextContentToH1Button = this.render("text/link", "Textinhalt als Überschrift 1", it.converterOptions)
      it.convertTextContentToH1 = this.fn("convertTextContentToH1")
      it.convertTextContentToH2Button = this.render("text/link", "Textinhalt als Überschrift 2", it.converterOptions)
      it.convertTextContentToH2 = this.fn("convertTextContentToH2")
      it.convertTextContentToH3Button = this.render("text/link", "Textinhalt als Überschrift 3", it.converterOptions)
      it.convertTextContentToH3 = this.fn("convertTextContentToH3")
      it.convertToInlineCiteButton = this.render("text/link", "Als Inline-Zitat markieren", it.converterOptions)
      it.convertToInlineCite = this.fn("convertToInlineCite")
      it.convertToFullCiteButton = this.render("text/link", "Als Voll-Zitat markieren", it.converterOptions)
      it.convertToFullCite = this.fn("convertToFullCite")
      it.trimLinesButton = this.render("text/link", "Zeile trimmen", it.converterOptions)
      it.trimLines = this.fn("trimLines")
      it.removeCiteMarksButton = this.render("text/link", "Zitatmarkierung entfernen", it.converterOptions)
      it.removeCiteMarks = this.fn("removeCiteMarks")


      it.inputTitle = this.render("text/hr", "Anwendungen für Eingabe Felder einsetzen", it.optionsContainer)
      this.add("hover-outline", it.inputTitle)
      it.inputTitle.onclick = () => toggleDisplayFlexNone(it.inputOptions)
      it.inputOptions = this.create("div/flex-row", it.optionsContainer)
      it.inputOptions.style.display = "none"

      it.textInputButton = this.render("text/link", "Texteingabe erstellen", it.inputOptions)
      it.createTextInput = this.fn("createTextInput")
      it.numberInputButton = this.render("text/link", "Nummereingabe erstellen", it.inputOptions)
      it.createTelInput = this.fn("createTelInput")
      it.checkboxInputButton = this.render("text/link", "Checkbox erstellen", it.inputOptions)
      it.createCheckboxInput = this.fn("createCheckboxInput")
      it.passwordInputButton = this.render("text/link", "Passworteingabe erstellen", it.inputOptions)
      it.createPasswordInput = this.fn("createPasswordInput")
      it.selectInputButton = this.render("text/link", "Auswahleingabe erstellen", it.inputOptions)
      it.createSelectInput = this.fn("createSelectInput")
      it.createDateInputButton = this.render("text/link", "Datumeingabe erstellen", it.inputOptions)
      it.createDateInput = this.fn("createDateInput")

      it.widthTitle = this.render("text/hr", "Anwendungen für die Breite", it.optionsContainer)
      this.add("hover-outline", it.widthTitle)
      it.widthTitle.onclick = () => toggleDisplayFlexNone(it.widthOptions)
      it.widthOptions = this.create("div/flex-row", it.optionsContainer)
      it.widthOptions.style.display = "none"

      it.growWidthButton = this.render("text/link", "100% Breite umschalten", it.widthOptions)
      it.maxWidthButton = this.render("text/link", "Maximale Breite", it.widthOptions)
      it.minWidthButton = this.render("text/link", "Minimale Breite", it.widthOptions)
      it.exactWidthButton = this.render("text/link", "Exakte Breite", it.widthOptions)
      it.increaseWidthButton = this.render("text/link", "Breite +1", it.widthOptions)
      it.decreaseWidthButton = this.render("text/link", "Breite -1", it.widthOptions)

      it.heightTitle = this.render("text/hr", "Anwendungen für die Höhe", it.optionsContainer)
      this.add("hover-outline", it.heightTitle)
      it.heightTitle.onclick = () => toggleDisplayFlexNone(it.heightOptions)
      it.heightOptions = this.create("div/flex-row", it.optionsContainer)
      it.heightOptions.style.display = "none"

      it.growHeightButton = this.render("text/link", "100% Höhe umschalten", it.heightOptions)
      it.maxHeightButton = this.render("text/link", "Maximale Höhe", it.heightOptions)
      it.minHeightButton = this.render("text/link", "Minimale Höhe", it.heightOptions)
      it.exactHeightButton = this.render("text/link", "Exakte Höhe", it.heightOptions)
      it.increaseHeightButton = this.render("text/link", "Höhe +1", it.heightOptions)
      it.decreaseHeightButton = this.render("text/link", "Höhe -1", it.heightOptions)

      it.displayTitle = this.render("text/hr", "Anwendungen für Display Elemente", it.optionsContainer)
      this.add("hover-outline", it.displayTitle)
      it.displayTitle.onclick = () => toggleDisplayFlexNone(it.displayOptions)
      it.displayOptions = this.create("div/flex-row", it.optionsContainer)
      it.displayOptions.style.display = "none"

      it.exactDisplayButton = this.render("text/link", "Display Prompt", it.displayOptions)
      it.displayBlockButton = this.render("text/link", "Display Block umschalten", it.displayOptions)
      it.displayInlineButton = this.render("text/link", "Display Inline umschalten", it.displayOptions)
      it.toggleDisplayGridButton = this.render("text/link", "Display Grid umschalten", it.displayOptions)
      it.toggleDisplayFlexButton = this.render("text/link", "Display Flex umschalten", it.displayOptions)
      it.toggleDisplayTableButton = this.render("text/link", "Display Table umschalten", it.displayOptions)

      it.gridTitle = this.render("text/hr", "Anwendungen für Grid Elemente", it.optionsContainer)
      this.add("hover-outline", it.gridTitle)
      it.gridTitle.onclick = () => toggleDisplayFlexNone(it.gridOptions)
      it.gridOptions = this.create("div/flex-row", it.optionsContainer)
      it.gridOptions.style.display = "none"

      it.gridMobileButton = this.render("text/link", "Grid für Mobile Geräte", it.gridOptions)
      it.gridFullDisplayButton = this.render("text/link", "Grid Volle Breite", it.gridOptions)
      it.gridTwoColumnsButton = this.render("text/link", "Grid mit 2 Spalten", it.gridOptions)
      it.gridThreeColumnsButton = this.render("text/link", "Grid mit 3 Spalten", it.gridOptions)
      it.gridFixedButton = this.render("text/link", "Grid Dimension", it.gridOptions)
      it.gridListRowsButton = this.render("text/link", "Grid Liste", it.gridOptions)
      it.gridSpanColumnButton = this.render("text/link", "Grid Element in Spalten Richtung spannen", it.gridOptions)
      it.spanColumnWithPrompt = this.fn("spanColumnWithPrompt")
      it.gridSpanRowButton = this.render("text/link", "Grid Element in Zeilen Richtung spannen", it.gridOptions)
      it.spanRowWithPrompt = this.fn("spanRowWithPrompt")
      it.exactGridGapButton = this.render("text/link", "Exakter Grid Abstand", it.gridOptions)
      it.gridAddColumnButton = this.render("text/link", "Spalte hinzufügen", it.gridOptions)
      it.addGridColumn = this.fn("addGridColumn")
      it.gridRemoveColumnButton = this.render("text/link", "Spalte entfernen", it.gridOptions)
      it.removeGridColumn = this.fn("removeGridColumn")
      it.gridAddRowButton = this.render("text/link", "Zeile hinzufügen", it.gridOptions)
      it.addGridRow = this.fn("addGridRow")
      it.gridRemoveRowButton = this.render("text/link", "Zeile entfernen", it.gridOptions)
      it.removeGridRow = this.fn("removeGridRow")

      it.flexTitle = this.render("text/hr", "Anwendungen für Flex Elemente", it.optionsContainer)
      this.add("hover-outline", it.flexTitle)
      it.flexTitle.onclick = () => toggleDisplayFlexNone(it.flexOptions)
      it.flexOptions = this.create("div/flex-row", it.optionsContainer)
      it.flexOptions.style.display = "none"

      it.alignColumnButton = this.render("text/link", "Flex Spalte", it.flexOptions)
      it.alignLeftButton = this.render("text/link", "Links anordnen ", it.flexOptions)
      it.alignCenterButton = this.render("text/link", "Zentriert anordnen", it.flexOptions)
      it.alignRightButton = this.render("text/link", "Rechts anordnen", it.flexOptions)
      it.alignRowButton = this.render("text/link", "Flex Zeile", it.flexOptions)
      it.alignTopButton = this.render("text/link", "Oben anordnen", it.flexOptions)
      it.alignVerticalButton = this.render("text/link", "Mittig anordnen", it.flexOptions)
      it.alignBottomButton = this.render("text/link", "Unten anordnen", it.flexOptions)
      it.flexButton = this.render("text/link", "Flex Element erstellen", it.flexOptions)
      it.spaceBetweenButton = this.render("text/link", "Flex Abstand Zwischen", it.flexOptions)
      it.spaceAroundButton = this.render("text/link", "Flex Abstand Herum", it.flexOptions)
      it.toggleWrapButton = this.render("text/link", "Flex Wrap umschalten", it.flexOptions)

      it.layerTitle = this.render("text/hr", "Anwendungen für die Layer Elemente", it.optionsContainer)
      this.add("hover-outline", it.layerTitle)
      it.layerTitle.onclick = () => toggleDisplayFlexNone(it.layerOptions)
      it.layerOptions = this.create("div/flex-row", it.optionsContainer)
      it.layerOptions.style.display = "none"

      it.layerButton = this.render("text/link", "Layer Verwaltung öffnen", it.layerOptions)
      it.openLayerOverlay = this.fn("openLayerOverlay")
      it.positiveLayerButton = this.render("text/link", "Layer darüber hinzufügen", it.layerOptions)
      it.addLayerAbove = this.fn("addLayerAbove")
      it.negativeLayerButton = this.render("text/link", "Layer darunter hinzufügen", it.layerOptions)
      it.addLayerBelow = this.fn("addLayerBelow")
      it.exactLayerButton = this.render("text/link", "Layer mit exaktem Index", it.layerOptions)
      it.addLayerPrompt = this.fn("addLayerPrompt")
      it.removeLayerButton = this.render("text/link", "Alle Layer entfernen", it.layerOptions)
      it.removeAllLayer = this.fn("removeAllLayer")
      it.positionAbsoluteButton = this.render("text/link", "Position Absolut umschalten", it.layerOptions)
      it.positionTopButton = this.render("text/link", "Position Oben", it.layerOptions)
      it.positionRightButton = this.render("text/link", "Position Rechts", it.layerOptions)
      it.positionBottomButton = this.render("text/link", "Position Unten", it.layerOptions)
      it.positionLeftButton = this.render("text/link", "Position Links", it.layerOptions)

      it.transformationTitle = this.render("text/hr", "Anwendungen für die Transformation", it.optionsContainer)
      this.add("hover-outline", it.transformationTitle)
      it.transformationTitle.onclick = () => toggleDisplayFlexNone(it.transformationOptions)
      it.transformationOptions = this.create("div/flex-row", it.optionsContainer)
      it.transformationOptions.style.display = "none"

      it.transformTranslateButton = this.render("text/link", "Exakt versetzen", it.transformationOptions)
      it.translateWithPrompt = this.fn("translateWithPrompt")
      it.transformTranslateXButton = this.render("text/link", "Nach X versetzen", it.transformationOptions)
      it.translateXWithPrompt = this.fn("translateXWithPrompt")
      it.transformTranslateYButton = this.render("text/link", "Nach Y versetzen", it.transformationOptions)
      it.translateYWithPrompt = this.fn("translateYWithPrompt")
      it.zIndexButton = this.render("text/link", "Z-Index anpassen", it.transformationOptions)
      it.scaleButton = this.render("text/link", "", it.transformationOptions)
      it.scaleWithPrompt = this.fn("scaleWithPrompt")
      it.rotateRightButton = this.render("text/link", "90° nach Rechts drehen", it.transformationOptions)
      it.rotateNodeRightWithPrompt = this.fn("rotateNodeRightWithPrompt")
      it.exactRotateRightButton = this.render("text/link", "Exakt nach Rechts drehen", it.transformationOptions)
      it.rotateLeftButton = this.render("text/link", "90° nach Links drehen", it.transformationOptions)
      it.rotateNodeLeftWithPrompt = this.fn("rotateNodeLeftWithPrompt")
      it.exactRotateLeftButton = this.render("text/link", "Exakt nach Links drehen", it.transformationOptions)

      it.editTextTitle = this.render("text/hr", "Anwendungen für die Textverarbeitung", it.optionsContainer)
      this.add("hover-outline", it.editTextTitle)
      it.editTextTitle.onclick = () => toggleDisplayFlexNone(it.textManipulationOptions)
      it.textManipulationOptions = this.create("div/flex-row", it.optionsContainer)
      it.textManipulationOptions.style.display = "none"

      it.whiteSpaceNoWrapButton = this.render("text/link", "Leerzeichen nicht umbrechen", it.textManipulationOptions)
      it.fontFamilyButton = this.render("text/link", "Schriftart", it.textManipulationOptions)
      it.fontWeightNormalButton = this.render("text/link", "Schriftbreite Normal umschalten", it.textManipulationOptions)
      it.fontWeightButton = this.render("text/link", "Exakte Schriftbreite", it.textManipulationOptions)
      it.fontStyleButton = this.render("text/link", "Schriftstil", it.textManipulationOptions)
      it.textDecorationButton = this.render("text/link", "Textdekoration", it.textManipulationOptions)
      it.fontSizeButton = this.render("text/link", "Schriftgröße", it.textManipulationOptions)
      it.fontColorButton = this.render("text/link", "Schriftfarbe", it.textManipulationOptions)
      it.backgroundColorButton = this.render("text/link", "Hintergrundfarbe", it.textManipulationOptions)
      it.unorderedListButton = this.render("text/link", "Ungeordnete Liste erstellen", it.textManipulationOptions)
      it.orderedListButton = this.render("text/link", "Geordnete Liste erstellen", it.textManipulationOptions)
      it.lineHeightButton = this.render("text/link", "Zeilenhöhe", it.textManipulationOptions)

      it.visibilityTitle = this.render("text/hr", "Anwendungen für die Sichtbarkeit", it.optionsContainer)
      this.add("hover-outline", it.visibilityTitle)
      it.visibilityTitle.onclick = () => toggleDisplayFlexNone(it.visibilityOptions)
      it.visibilityOptions = this.create("div/flex-row", it.optionsContainer)
      it.visibilityOptions.style.display = "none"

      it.overflowYButton = this.render("text/link", "Überlauf Y", it.visibilityOptions)
      it.overflowXButton = this.render("text/link", "Überlauf X", it.visibilityOptions)
      it.toggleDisplayNoneButton = this.render("text/link", "Display None umschalten", it.visibilityOptions)
      it.toggleVisibilityHiddenButton = this.render("text/link", "Sichtbarkeit umschalten", it.visibilityOptions)
      it.exactOpacityButton = this.render("text/link", "Deckkraft in Prozent definieren", it.visibilityOptions)
      it.addOpacityWithPrompt = this.fn("addOpacityWithPrompt")

      it.spacingTitle = this.render("text/hr", "Anwendungen für die Abstände", it.optionsContainer)
      this.add("hover-outline", it.spacingTitle)
      it.spacingTitle.onclick = () => toggleDisplayFlexNone(it.spacingOptions)
      it.spacingOptions = this.create("div/flex-row", it.optionsContainer)
      it.spacingOptions.style.display = "none"

      it.toggleMarginButton = this.render("text/link", "Außenabstand umschalten", it.spacingOptions)
      it.toggleMarginTopButton = this.render("text/link", "Außenabstand Oben umschalten", it.spacingOptions)
      it.toggleMarginRightButton = this.render("text/link", "Außenabstand Rechts umschalten", it.spacingOptions)
      it.toggleMarginBottomButton = this.render("text/link", "Außenabstand Unten umschalten", it.spacingOptions)
      it.toggleMarginLeftButton = this.render("text/link", "Außenabstand Links umschalten", it.spacingOptions)
      it.exactMarginButton = this.render("text/link", "Exakter Außenabstand", it.spacingOptions)
      it.exactMarginTopButton = this.render("text/link", "Exakter Außenabstand Oben", it.spacingOptions)
      it.exactMarginRightButton = this.render("text/link", "Exakter Außenabstand Rechts", it.spacingOptions)
      it.exactMarginBottomButton = this.render("text/link", "Exakter Außenabstand Unten", it.spacingOptions)
      it.exactMarginLeftButton = this.render("text/link", "Exakter Außenabstand Links", it.spacingOptions)
      it.togglePaddingButton = this.render("text/link", "Innenabstand umschalten", it.spacingOptions)
      it.togglePaddingTopButton = this.render("text/link", "Innenabstand umschalten Oben", it.spacingOptions)
      it.togglePaddingRightButton = this.render("text/link", "Innenabstand umschalten Rechts", it.spacingOptions)
      it.togglePaddingBottomButton = this.render("text/link", "Innenabstand umschalten Unten", it.spacingOptions)
      it.togglePaddingLeftButton = this.render("text/link", "Innenabstand umschalten Links", it.spacingOptions)
      it.exactPaddingButton = this.render("text/link", "Exakter Innenabstand", it.spacingOptions)
      it.exactPaddingTopButton = this.render("text/link", "Exakter Innenabstand Oben", it.spacingOptions)
      it.exactPaddingRightButton = this.render("text/link", "Exakter Innenabstand Rechts", it.spacingOptions)
      it.exactPaddingBottomButton = this.render("text/link", "Exakter Innenabstand Unten", it.spacingOptions)
      it.exactPaddingLeftButton = this.render("text/link", "Exakter Innenabstand Links", it.spacingOptions)

      it.borderTitle = this.render("text/hr", "Anwendungen für die Grenzlinien", it.optionsContainer)
      this.add("hover-outline", it.borderTitle)
      it.borderTitle.onclick = () => toggleDisplayFlexNone(it.borderOptions)
      it.borderOptions = this.create("div/flex-row", it.optionsContainer)
      it.borderOptions.style.display = "none"

      it.toggleBorderButton = this.render("text/link", "Grenzlinien umschalten", it.borderOptions)
      it.toggleBorderTopButton = this.render("text/link", "Grenzlinie Oben umschalten", it.borderOptions)
      it.toggleBorderRightButton = this.render("text/link", "Grenzlinie Rechts umschalten", it.borderOptions)
      it.toggleBorderBottomButton = this.render("text/link", "Grenzlinie Unten umschalten", it.borderOptions)
      it.toggleBorderLeftButton = this.render("text/link", "Grenzlinie Links umschalten", it.borderOptions)
      it.exactBorderButton = this.render("text/link", "Exakte Grenzlinien", it.borderOptions)
      it.exactBorderTopButton = this.render("text/link", "Exakte Grenzlinien Oben", it.borderOptions)
      it.exactBorderRightButton = this.render("text/link", "Exakte Grenzlinien Rechts", it.borderOptions)
      it.exactBorderBottomButton = this.render("text/link", "Exakte Grenzlinien Unten", it.borderOptions)
      it.exactBorderLeftButton = this.render("text/link", "Exakte Grenzlinien Links", it.borderOptions)
      it.toggleBorderRadiusButton = this.render("text/link", "Grenzradius umschalten", it.borderOptions)
      it.toggleBorderTopLeftRadiusButton = this.render("text/link", "Grenzradius Oben-Links umschalten", it.borderOptions)
      it.toggleBorderTopRightRadiusButton = this.render("text/link", "Grenzradius Oben-Rechts umschalten", it.borderOptions)
      it.toggleBorderBottomRightRadiusButton = this.render("text/link", "Grenzradius Unten-Rechts umschalten", it.borderOptions)
      it.toggleBorderBottomLeftRadiusButton = this.render("text/link", "Grenzradius Unten-Links umschalten", it.borderOptions)
      it.exactBorderRadiusButton = this.render("text/link", "Exakter Grenzradius", it.borderOptions)
      it.exactBorderTopLeftRadiusButton = this.render("text/link", "Exakter Grenzradius Oben-Links", it.borderOptions)
      it.exactBorderTopRightRadiusButton = this.render("text/link", "Exakter Grenzradius Oben-Rechts", it.borderOptions)
      it.exactBorderBottomRightRadiusButton = this.render("text/link", "Exakter Grenzradius Unten-Rechts", it.borderOptions)
      it.exactBorderBottomLeftRadiusButton = this.render("text/link", "Exakter Grenzradius Unten-Links", it.borderOptions)
      it.toggleBorderNoneButton = this.render("text/link", "Grenzradius None umschalten", it.borderOptions)
      it.boxButton = this.render("text/link", "Box umschalten", it.borderOptions)
      it.exactBoxShadowButton = this.render("text/link", "Exakter Box Schatten", it.borderOptions)

      it.mediaQueriesTitle = this.render("text/hr", "Anwendungen für Media Queries", it.optionsContainer)
      this.add("hover-outline", it.mediaQueriesTitle)
      it.mediaQueriesTitle.onclick = () => toggleDisplayFlexNone(it.mediaQueriesOptions)
      it.mediaQueriesOptions = this.create("div/flex-row", it.optionsContainer)
      it.mediaQueriesOptions.style.display = "none"

      it.mediaQueriesOverviewButton = this.render("text/link", "Medien Abfragen öffnen", it.mediaQueriesOptions)
      it.openMediaQueriesOverlay = this.fn("openMediaQueriesOverlay")
      it.largeDeviceButton = this.render("text/link", "Style für große Geräte", it.mediaQueriesOptions)
      it.addLargeStyle = this.fn("addLargeStyle")
      it.middleDeviceButton = this.render("text/link", "Style für mittlere Geräte", it.mediaQueriesOptions)
      it.addMiddleStyle = this.fn("addMiddleStyle")
      it.smallDeviceButton = this.render("text/link", "Style für kleine Geräte", it.mediaQueriesOptions)
      it.addSmallStyle = this.fn("addSmallStyle")
      it.printerDeviceButton = this.render("text/link", "Style für Druck Geräte", it.mediaQueriesOptions)
      it.addPrinterStyle = this.fn("addPrinterStyle")

      it.optimizeWorkTitle = this.render("text/hr", "Anwendungen für schnelle Korrekturen", it.optionsContainer)
      this.add("hover-outline", it.optimizeWorkTitle)
      it.optimizeWorkTitle.onclick = () => toggleDisplayFlexNone(it.optimizeWorkOptions)
      it.optimizeWorkOptions = this.create("div/flex-row", it.optionsContainer)
      it.optimizeWorkOptions.style.display = "none"

      it.insertAfterButton = this.render("text/link", "Danach einfügen", it.optimizeWorkOptions)
      it.insertAfter = this.fn("insertAfter")
      it.insertBeforeButton = this.render("text/link", "Davor einfügen", it.optimizeWorkOptions)
      it.insertBefore = this.fn("insertBefore")
      it.insertLeftButton = this.render("text/link", "Links einfügen", it.optimizeWorkOptions)
      it.insertLeft = this.fn("insertLeft")
      it.insertRightButton = this.render("text/link", "Rechts einfügen", it.optimizeWorkOptions)
      it.insertRight = this.fn("insertRight")
      it.cutOuterHtmlButton = this.render("text/link", "HTML ausschneiden", it.optimizeWorkOptions)
      it.addOuterHtmlToClipboard = this.fn("addOuterHtmlToClipboard")
      it.copyOuterHtmlButton = this.render("text/link", "HTML kopieren", it.optimizeWorkOptions)
      it.appendClipboardToNode = this.fn("appendClipboardToNode")
      it.pasteOuterHtmlButton = this.render("text/link", "HTML einfügen", it.optimizeWorkOptions)
      it.appendStyleButton = this.render("text/link", "Style anhängen", it.optimizeWorkOptions)
      it.appendStyleWithPrompt = this.fn("appendStyleWithPrompt")
      it.copyStyleButton = this.render("text/link", "Style kopieren", it.optimizeWorkOptions)
      it.addStyleToClipboard = this.fn("addStyleToClipboard")
      it.pasteStyleButton = this.render("text/link", "Style einfügen", it.optimizeWorkOptions)
      it.addClipboardToStyle = this.fn("addClipboardToStyle")
      it.removeStyleButton = this.render("text/link", "Style entfernen", it.optimizeWorkOptions)
      it.removeInnerButton = this.render("text/link", "Inhalt entfernen", it.optimizeWorkOptions)
      it.replaceInnerHtmlWithPrompt = this.fn("replaceInnerHtmlWithPrompt")
      it.removeInnerWithTextButton = this.render("text/link", "Inhalt ersetzen", it.optimizeWorkOptions)
      it.replaceTextContentWithPrompt = this.fn("replaceTextContentWithPrompt")
      it.removeNodeButton = this.render("text/link", "Element entfernen", it.optimizeWorkOptions)
      it.idButton = this.render("text/link", "Id definieren", it.optimizeWorkOptions)
      it.setIdWithPrompt = this.fn("setIdWithPrompt")
      it.addClassButton = this.render("text/link", "Klasse definieren", it.optimizeWorkOptions)
      it.setClassWithPrompt = this.fn("setClassWithPrompt")
      it.setAttributeButton = this.render("text/link", "Attribut setzen", it.optimizeWorkOptions)
      it.setAttributeWithPrompt = this.fn("setAttributeWithPrompt")


      it.contentCheckerTitle = this.render("text/hr", "Anwendungen für Inhalte prüfen", it.optionsContainer)
      this.add("hover-outline", it.contentCheckerTitle)
      it.contentCheckerTitle.onclick = () => toggleDisplayFlexNone(it.contentCheckerOptions)
      it.contentCheckerOptions = this.create("div/flex-row", it.optionsContainer)
      it.contentCheckerOptions.style.display = "none"

      it.some = this.render("text/link", "Als Zitat markieren", it.contentCheckerOptions)
      // do some crazy shit with content

      it.forEachChildTitle = this.render("text/hr", "Anwendungen für jedes Kind Element", it.optionsContainer)
      this.add("hover-outline", it.forEachChildTitle)
      it.forEachChildTitle.onclick = () => toggleDisplayFlexNone(it.forEachChildrenOptions)
      it.forEachChildrenOptions = this.create("div/flex-row", it.optionsContainer)
      it.forEachChildrenOptions.style.display = "none"

      it.fontSizeForEachChildButton = this.render("text/link", "Schriftgröße definieren", it.forEachChildrenOptions)

      it.pickColorTitle = this.render("text/hr", "Anwendungen für Code und Farben wählen", it.optionsContainer)
      this.add("hover-outline", it.pickColorTitle)
      it.pickColorTitle.onclick = () => toggleDisplayFlexNone(it.colorPickerOptions)
      it.colorPickerOptions = this.create("div/flex-row", it.optionsContainer)
      it.colorPickerOptions.style.display = "none"
      this.style(it.colorPickerOptions, {height: "377px", overflow: "auto"})
      this.fn("renderColors")(it.colorPickerOptions, (value) => {
        this.convert("text/clipboard", value).then(() => {
          window.alert("Der Hex-Code deiner Farbe wurde erfolgreich in die Zwischenablage gespeichert.")
        })
      })

      it.pickSvgTitle = this.render("text/hr", "Anwendungen für SVG einsetzen", it.optionsContainer)
      this.add("hover-outline", it.pickSvgTitle)
      it.pickSvgTitle.onclick = () => toggleDisplayFlexNone(it.svgPickerOptions)
      it.svgPickerOptions = this.create("div/flex-row", it.optionsContainer)
      it.svgPickerOptions.style.display = "none"
      it.svgPickerOptions.style.paddingBottom = "144px"
      it.svgIcons = this.fn("appendAllSvgIcons")

      return it
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
    if (event === "createBackgroundImageWithTitles") {
      return (node) => {
        const prompt = window.prompt("Gebe die URL deines Hintergrund Bildes ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          const backgroundDiv = document.createElement("div")
          node.appendChild(backgroundDiv)
          this.style(backgroundDiv, {marginBottom: "55px", height: "100vh", width: "100%", backgroundImage: `url(${prompt})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", display: "flex", justifyContent: "center", alignItems: "center"})
          const titleContainer = document.createElement("div")
          backgroundDiv.appendChild(titleContainer)
          this.style(titleContainer, {wordBreak: "break-word", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "21px", lineHeight: "1.5"})
          const h1 = document.createElement("h1")
          titleContainer.appendChild(h1)
          this.style(h1, {textTransform: "uppercase", fontSize: "34px", color: "white", fontFamily: "sans-serif", margin: "0 0 21px 0", letterSpacing: "3px"})
          const h2 = document.createElement("h2")
          titleContainer.appendChild(h2)
          this.style(h2, {textAlign: "center", fontSize: "89px", color: "white", fontFamily: "sans-serif", margin: "0 0 21px 0"})
          h1.textContent = "HAUPTTITEL"
          h2.textContent = "UNTERTITEL"
        }
      }
    }
    if (event === "createImageTextAndActionBox") {
      return (node) => {
        const prompt = window.prompt("Gebe die URL deines Bildes ein:")
        const container = document.createElement("div")
        node.appendChild(container)
        this.style(container, {padding: "8px", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap"})
        const image = document.createElement("div")
        container.appendChild(image)
        this.style(image, {width: "100%", maxWidth: "610px", display: "flex", justifyContent: "center", alignItems: "center"})
        const img = document.createElement("img")
        if (!this.verifyIs("text/empty", prompt)) {
          img.src = prompt
        } else {
          img.src = "/public/image.svg"
        }
        img.style.width = "100%"
        image.appendChild(img)
        const text = document.createElement("div")
        container.appendChild(text)
        this.style(text, {wordBreak: "break-word", width: "100%", display: "flex", flexDirection: "column", fontFamily: "sans-serif", margin: "21px 13px", maxWidth: "610px"})
        const h4 = document.createElement("h4")
        text.appendChild(h4)
        this.style(h4, {fontSize: "21px", color: "#0EA35B", textTransform: "uppercase", margin: "0 0 21px 0"})
        h4.textContent = "Content Titel"
        const h3 = document.createElement("h3")
        text.appendChild(h3)
        this.style(h3, {fontSize: "55px", color: "#22395D", margin: "0 0 21px 0"})
        h3.textContent = "Content Beschreibung"
        const content = document.createElement("div")
        text.appendChild(content)
        this.style(content, {fontSize: "21px", color: "#818491", lineHeight: "1.5"})
        content.textContent = this.lorem(144)
        const action = document.createElement("div")
        text.appendChild(action)
        action.textContent = "Action Button"
        this.style(action, {cursor: "pointer", alignSelf: "center", width: "233px", margin: "55px 34px", padding: "13px 21px", color: "white", fontSize: "21px", backgroundColor: "#006F3A", borderRadius: "13px", textAlign: "center"})
        node.appendChild(container)
      }
    }
    if (event === "createMyValueUnitsBox") {
      return (node) => {
        const box = this.create("div")
        this.style(box, {borderRadius: "5px", margin: "21px 13px", fontFamily: "sans-serif", boxShadow: "rgba(0, 0, 0, 0.13) 0px 1px 3px"})
        node.appendChild(box)
        const title = this.create("h2")
        title.textContent = "Meine Werteinheiten"
        box.appendChild(title)
        this.style(title, {margin: "0", padding: "13px"})
        const valueUnits = this.create("div")
        valueUnits.classList.add("my-value-units")
        this.style(valueUnits, {padding: "13px"})
        box.appendChild(valueUnits)
        const script = this.create("script/id", "my-value-units")
        this.add("script-onbody", script)
        window.alert("Vorlage wurde erfolgreich angehängt.")
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
    if (event === "createDateInput") {
      return node => this.create("input/date", node)
    }
    if (event === "createDivPackOuter") {
      return async (node) => {
        const div = this.create("div")
        div.innerHTML = await this.convert("text/purified", node.outerHTML)
        node.replaceWith(div)
        return div
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
    if (event === "createVideoSeriesBox") {
      return node => {
        const box = this.create("div/box", node)
        box.className += " p5"
        const title = this.div("fs21", box)
        title.textContent = "Meine neue Serie"
        const video = document.createElement("video")
        video.controls = true
        box.appendChild(video)
        const next = this.div("fs13 pt21", box)
        next.textContent = "Weiter zur Serie"
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
        Helper.convert("link", link)
        node.textContent = ""
        node.appendChild(link)
      }
    }
    if (event === "convertTextContentToH1") {
      return (node) => {
        const h1 = document.createElement("h1")
        for (let i = 0; i < node.attributes.length; i++) {
          const attribute = node.attributes[i]
          h1.setAttribute(attribute.name, attribute.value)
        }
        h1.textContent = node.textContent
        const parent = node.parentNode
        if (parent) parent.replaceChild(h1, node)
        return h1
      }
    }
    if (event === "convertTextContentToH2") {
      return (node) => {
        const h2 = document.createElement("h2")
        for (let i = 0; i < node.attributes.length; i++) {
          const attribute = node.attributes[i]
          h2.setAttribute(attribute.name, attribute.value)
        }
        h2.textContent = node.textContent
        const parent = node.parentNode
        if (parent) parent.replaceChild(h2, node)
        return h2
      }
    }
    if (event === "convertTextContentToH3") {
      return (node) => {
        const h3 = document.createElement("h3")
        for (let i = 0; i < node.attributes.length; i++) {
          const attribute = node.attributes[i]
          h3.setAttribute(attribute.name, attribute.value)
        }
        h3.textContent = node.textContent
        const parent = node.parentNode
        if (parent) parent.replaceChild(h3, node)
        return h3
      }
    }
    if (event === "convertToInlineCite") {
      return (node) => {
        node.classList.add("inline-cite")
        let citationCounter = document.querySelectorAll(".inline-cite").length
        if (citationCounter === 0) citationCounter = 1
        node.setAttribute("citation-counter", citationCounter)
        if (node.classList.contains("full-cite")) node.classList.remove("full-cite")
        window.alert("Inhalt erfolgreich markiert.")
      }
    }
    if (event === "convertToFullCite") {
      return (node) => {
        if (node.classList.contains("inline-cite")) node.classList.remove("inline-cite")
        node.removeAttribute("citation-counter")
        for (let i = 0; i < document.querySelectorAll(".inline-cite").length; i++) {
          const inlineCite = document.querySelectorAll(".inline-cite")[i]
          inlineCite.setAttribute("citation-counter", i + 1)
        }
        node.classList.add("full-cite")
        window.alert("Inhalt erfolgreich markiert.")
      }
    }
    if (event === "removeCiteMarks") {
      return (node) => {
        if (node.classList.contains("inline-cite")) node.classList.remove("inline-cite")
        if (node.classList.contains("full-cite")) node.classList.remove("full-cite")
        node.removeAttribute("citation-counter")
        for (let i = 0; i < document.querySelectorAll(".inline-cite").length; i++) {
          const inlineCite = document.querySelectorAll(".inline-cite")[i]
          inlineCite.setAttribute("citation-counter", i + 1)
        }
        node.querySelectorAll("span[inline-cite]").forEach(span => span.remove())
        window.alert("Markierung erfolgreich entfernt.")
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
      function updateCounter() {
        const counter = document.querySelector("div.counter")
        if (parseInt(counter.textContent) > 0) {
          counter.style.background = "green"
          counter.style.color = "white"
        } else {
          Helper.convert("dark-light", counter)
        }
      }

      function renderFeedback(type, feedback, container, button, overlay, script) {

        Helper.reset("node", container)
        container.className = "monospace fs21 mtb21 mlr34 color-theme"
        for (let i = 0; i < feedback.length; i++) {
          const it = feedback[i]
          const button = Helper.render("button/feedback", {it, i}, container)
          Helper.add("hover-outline", button)
          button.onclick = () => {

            Helper.overlay("pop", o1 => {
              const content = o1.content
              const remove = Helper.render("button/left-right", {left: ".remove", right: "Feedback entfernen"}, content)
              remove.onclick = async () => {

                const confirm = window.confirm("Möchtest du diesen Beitrag wirklich entfernen?")
                if (confirm === true) {
                  const res = await Helper.request("/remove/location/feedback/", {created: it.created})
                  if (res && res.status === 200) {
                    window.alert("Dieser Beitrag wurde erfolgreich entfernt.")
                    const counter = document.querySelector("div.counter")
                    counter.textContent = parseInt(counter.textContent) - 1
                    updateCounter()
                    button.remove()
                    o1.remove()
                  } else {
                    window.alert("Fehler.. Bitte wiederholen.")
                  }
                }
              }
            })
          }
        }
      }

      function bodyButton() {

        let button = document.querySelector(".html-feedback")
        Helper.add("hover-outline", button)
        if (!button) {
          button = Helper.create("button/branch")
          button.className += " html-feedback"
          Helper.append(button, document.body)
        }
        const counter = document.querySelector("div.counter")
        Helper.request("/get/location/feedback-length/").then(res => {
          if (res.status === 200) {
            counter.textContent = res.response
            if (parseInt(counter.textContent) > 0) {
              counter.style.background = "green"
              counter.style.color = "white"
            }
          }
        })
        button.onclick = () => openLocationOverlay(button)
      }

      async function initScriptCounter(id, button) {
        const res = await Helper.request("/get/script/feedback-length/", {created: id})
        if (res.status === 200) {
          const counter = document.querySelector("div.counter")
          counter.textContent = res.response
          updateCounter()
        }
      }

      async function getLocationFeedback(container, button, overlay) {

        const res = await Helper.request("/get/location/feedback/")
        container.textContent = ""
        if (res && res.status === 200) {
          const feedback = JSON.parse(res.response)
          renderFeedback("html-value", feedback, container, button, overlay)
        } else {
          container.textContent = "Kein Feedback gefunden"
        }
      }

      function openLocationOverlay(button) {

        Helper.overlay("pop", async o1 => {
          o1.addInfo(`location.feedback`)
          const content = o1.content
          const funnel = Helper.funnel("feedback", content)
          funnel.submit.onclick = async () => {

            await Helper.verify("funnel", funnel)
            const text = funnel.feedback.input.value
            const importance = funnel.importance.input.value
            Helper.overlay("lock", async o2 => {
              const res = await Helper.request("/register/location/feedback/", {text, importance})
              if (res.status === 200) {
                window.alert("Vielen Dank für dein Feedback.\n\nDein Feedback ist vollkommen anonym, dynamisch und hilft dabei, diese Webseite, noch besser für dich zu optimieren.")
                const counter = document.querySelector("div.counter")
                counter.textContent = parseInt(counter.textContent) + 1
                updateCounter()
                funnel.feedback.input.value = ""
                Helper.add("style/not-valid", funnel.feedback.input)
                await getLocationFeedback(feedbackContainer, button, o1)
              } else {
                window.alert("Fehler.. Bitte wiederholen.")
              }
              o2.remove()
            })
          }
          const feedbackContainer = Helper.div("monospace fs21 mtb21 mlr34 color-theme text-center", content)
          Helper.create("div/loading", feedbackContainer)
          await getLocationFeedback(feedbackContainer, button, o1)
        })
      }

      return {open, bodyButton, initScriptCounter}
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
    if (event === "openAudiosOverlay") {
      return (node) => {
        this.overlay("pop", async o1 => {
          o1.info.textContent = ".audios"
          const content = o1.content
          const searchField = this.create("input/text", content)
          searchField.input.placeholder = "Suche nach dem Titel"
          o1.renderTabs()
          o1.appendChild(o1.addButton)
          o1.addButton.onclick = ev => {

            this.overlay("pop", o2 => {
              o2.info.textContent = `.create.audio`
              o1.openMic(node, o2)
              o1.upload("audio/*", o2)
            })
          }
          o1.it = "audios"
          o1.filter = "title"
          o1.input = searchField.input
          o1.rerender = this.create("div/loading", content)
          o1.createItButton = async it => {

            const box = this.div("box sans-serif relative dark-light flex between align wrap m8")
            this.on("hover", {node: box, class: "pointer outline"})
            let title
            if (it.title) {
              const titleDiv = this.div("mb13", box)
              title = await this.convert("text/purified", it.title)
              if (it.query) {
                title = await Helper.convert("text/purified", it.query)
                titleDiv.innerHTML = title
              } else {
                titleDiv.textContent = title
              }
            }
            const audio = this.render("audio", it.url, box)
            this.render("text/hover-bottom-right", it.visibility, box)
            return box
          }
          o1.closedOptions = it => {
            this.overlay("pop", o2 => {
              if (it.title) o2.info.textContent = it.title
              o1.appendButton(it, node, o2)
              o1.removeIt(it, o2)
              o1.titleIt(it, o2)
              o1.visibility(it, o2)
            })
          }
          o1.openOptions = it => {
            this.overlay("pop", o2 => {
              if (it.title) o2.info.textContent = it.title
              o1.appendButton(it, node, o2)
            })
          }
        })
      }
    }
    if (event === "openChatOverlay") {
      return id => {
        if (!id) return
        this.overlay("pop", async o1 => {
          o1.onlyClosedUser()
          o1.addInfo(`.chat:${id}`)
          const content = o1.content
          const chat = this.create("input/text", content)
          chat.input.placeholder = "Neue Nachricht"
          chat.input.maxLength = "144"
          this.on("enter", chat.input, registerMessage)
          setTimeout(() => {
            chat.input.focus()
          }, 987)
          const preview = this.div("monospace fs13 color-theme", chat)
          preview.textContent = `0/${chat.input.maxLength}`
          chat.input.addEventListener("input", ev => {
            const actualLength = ev.target.value.length
            preview.textContent = `${actualLength}/${chat.input.maxLength}`
          })
          async function registerMessage() {
            const message = chat.input.value
            if (Helper.verifyIs("text/empty", message) || message.length > 144) {
              Helper.add("style/not-valid", chat.input)
              return
            }
            chat.input.value = ""
            preview.textContent = `0/${chat.input.maxLength}`
            container.textContent = ""
            const loader = addLoading(container)
            const res = await post("/jwt/register/chat/message/", {id, message})
            loader.remove()
            if (res.status === 200) {
              getMessages()
              chat.input.focus()
            } else {
              o1.alert.nok()
              o1.remove()
            }
          }
          const container = Helper.div("flex column break-word mtb21 mlr34 sans-serif color-theme", content)
          getMessages()
          function getMessages() {
            post("/jwt/get/chat/messages/", {id}).then(res => {
              if (res.status === 200) {
                const messages = JSON.parse(res.response)
                for (let i = 0; i < messages.length; i++) {
                  const message = messages[i]
                  if (!message.text) continue
                  const messageDiv = Helper.div("br8 max-w55p mt8", container)
                  Helper.add("hover-outline", messageDiv)
                  Helper.on("click", messageDiv, () => {
                    chat.input.value = message.text
                    const actualLength = chat.input.value.length
                    preview.textContent = `${actualLength}/${chat.input.maxLength}`
                    chat.scrollIntoView({behavior: "smooth"})
                    Helper.add("style/valid", chat.input)
                    chat.input.focus()
                  })
                  const textDiv = Helper.div("p8", messageDiv)
                  textDiv.textContent = message.text
                  const createdDiv = Helper.div("fs8 plr8", messageDiv)
                  createdDiv.textContent = `Gesendet vor ${Helper.convert("millis/since", message.created)}`
                  const userId = window.localStorage.getItem("localStorageId")
                  if (message.from === userId) {
                    messageDiv.classList.add("flex-end")
                    messageDiv.classList.add("light")
                  } else {
                    messageDiv.classList.add("flex-start")
                    messageDiv.classList.add("dark")
                  }
                }
                content.appendChild(removeMessagesBtn)
              } else {
                container.textContent = ""
                Helper.render("text/note", "Keine Nachrichten gefunden", container)
                removeMessagesBtn.remove()
              }
            })
          }
          const removeMessagesBtn = Helper.render("text/link", "Alle meine Nachrichten entfernen")
          removeMessagesBtn.className += " mtb21 mlr34" 
          removeMessagesBtn.onclick = () => {
            const confirm = window.confirm("Möchtest du alle deine Nachrichten wirklich entfernen?")
            if (!confirm) return
            Helper.overlay("lock", async lock => {
              const res = await post("/jwt/remove/chat/messages/", {id})
              if (res.status === 200) {
                lock.alert.removed()
                o1.remove()
              } else {
                lock.alert.nok()
              }
              lock.remove()
            })
          }
        })
      }
    }
    if (event === "openFunnelOverlay") {
      function createDataButton() {
        const button = Helper.create("button/left-right")
        button.className = "data-button"
        button.left.textContent = ".data"
        button.right.textContent = "Datenfelder definieren"
        return button
      }
      function createOptionField() {
        const text = Helper.create("input/text")
        text.className = "option-field"
        text.input.placeholder = "Option"
        text.input.setAttribute("required", "true")
        text.input.setAttribute("accept", "text/length")
        text.input.maxLength = "34"
        Helper.add("style/not-valid", text.input)
        text.input.addEventListener("input", ev => Helper.verify("input/value", text.input))
        return text
      }
      function onDataButtonClick(dataButton, idField, overlay, data) {
        openDataOverlay(idField.input.value, data)
        Helper.remove("style/circle", dataButton.left)
        Helper.convert("button/left-right", dataButton)
      }
      function openDataOverlay(id, data) {
        if (Helper.verifyIs("text/empty", id)) {
          window.alert("Es wurde keine Id eingegeben.")
          return
        }
        let it = {}
        Helper.overlay("pop", overlay => {
          overlay.info.textContent = `${id}.data`
          const funnel = Helper.create("div", overlay.content)
          const idField = Helper.create("input/id", funnel)
          const typeField = Helper.create("input/select", funnel)
          typeField.input.add(["-- Datentyp auswählen", "checkbox", "date", "email", "file", "number", "object", "password", "range", "select", "tel", "text", "textarea"])
          Helper.add("style/not-valid", typeField.input)
          let dataButton = overlay.querySelector(".data-button")
          let optionField
          typeField.input.addEventListener("input", async ev => {
            const value = ev.target.value
            if (value.startsWith("--")) {
              Helper.add("style/not-valid", typeField.input)
              dataButton.remove()
              dataButton = undefined
              return
            }
            if (Helper.verifyIs("text/empty", idField.input.value)) {
              window.alert("Es wurde keine Id eingegeben.")
              typeField.input.value = "-- Datentyp auswählen"
              Helper.add("style/not-valid", idField.input)
              idField.input.focus()
              Helper.add("style/not-valid", typeField.input)
              return
            }
            if (value === "object") {
              if (!dataButton) {
                dataButton = createDataButton()
                dataButton.addEventListener("click", ev => {
                  onDataButtonClick(dataButton, idField, overlay, data => {
                    it[idField.input.value] = data
                    renderPreview(it)
                  })
                })
                typeField.insertAdjacentElement('afterend', dataButton)
              }
            }
            else {
              if (dataButton) {
                dataButton.remove()
                dataButton = undefined
              }
            }
            if (value === "select") {
              if (!optionField) {
                optionField = createOptionField()
                typeField.insertAdjacentElement('afterend', optionField)
                optionField.input.focus()
                Helper.on("enter", optionField.input, ev => {
                  submitData(idField, typeField, it)
                })
              }
            } else {
              if (optionField) {
                optionField.remove()
                optionField = undefined
              }
            }
          })
          async function submitData(idField, typeField, it) {

            await Helper.verify("input/value", idField.input)
            await Helper.verify("input/value", typeField.input)
            const id = idField.input.value
            const type = typeField.input.value
            if (type.startsWith("--")) {
              window.alert("Es wurden kein Datentyp ausgewählt.")
              Helper.add("style/not-valid", typeField.input)
              return
            }
            if (type === "select") {
              const option = optionField.input.value
              if (!Helper.verifyIs("text/empty", option)) {
                options.push(option)
              } else {
                window.alert("Es wurde keine Option gefunden.")
                Helper.add("style/not-valid", optionField.input)
              }
              it[id] = options
              renderPreview(it)
              optionField.input.value = ""
              Helper.add("style/not-valid", optionField.input)
              optionField.input.focus()
              return
            }
            if (type === "object") {
              if (Helper.verifyIs("object/empty", object)) {
                window.alert("Es wurden keine Datenfelder gefunden.")
                Helper.add("style/red", dataButton)
                Helper.add("style/circle", dataButton.left)
                return
              }
              renderPreview(it)
              resetInput()
              return
            }
            it[id] = type
            function resetInput() {
              idField.input.value = ""
              idField.input.focus()
              typeField.input.value = "-- Datentyp auswählen"
              Helper.add("style/not-valid", idField.input)
              Helper.add("style/not-valid", typeField.input)
            }
            renderPreview(it)
            resetInput()
          }
          const options = []
          const object = {}
          const submit = Helper.create("button/action", funnel)
          submit.textContent = "Datenfeld erstellen"
          submit.onclick = async () => {
            submitData(idField, typeField, it)
          }
          Helper.render("text/hr", "Meine Datenstruktur", overlay.content)
          const preview = Helper.create("box", overlay.content)
          Helper.style(preview, {fontSize: "21px", margin: "21px 34px", display: "block", fontFamily: "monospace", textAlign: "center", padding: "55px"})
          const text = Helper.render("text/hover-bottom-right", "Datenstruktur einsetzen", preview)
          renderPreview(it)
          function renderPreview(object) {
            const data = preview.querySelector(".data")
            if (data) data.remove()
            const fragment = document.createDocumentFragment()
            const div = document.createElement("div")
            div.className = "data"
            div.textContent = JSON.stringify(object, null, 2)
            fragment.appendChild(div)
            preview.appendChild(fragment)
          }
          preview.addEventListener("click", ev => {
            if (data) data(it)
            overlay.remove()
          })
        })
      }
      function updateData(node, key = "", data = {}, type) {
        const keyCheck = node.querySelector(".key")
        if (keyCheck) keyCheck.remove()
        const dataCheck = node.querySelector(".data")
        if (dataCheck) dataCheck.remove()
        const fragment = document.createDocumentFragment()
        const keySpan = document.createElement("span")
        keySpan.textContent = `${key}: `
        keySpan.className = "key"
        fragment.appendChild(keySpan)
        const dataSpan = document.createElement("span")
        dataSpan.textContent = JSON.stringify(data)
        if (type.startsWith("json-list:")) {
          dataSpan.textContent = `[${JSON.stringify(data)}]`
        }
        dataSpan.className = "data"
        fragment.appendChild(dataSpan)
        node.appendChild(fragment)
      }
      return node => {
        this.overlay("pop", async o1 => {
          o1.info.textContent = "user.funnel"
          const searchField = this.create("input/text", o1.content)
          searchField.input.placeholder = "Suche nach Id"
          const addBtn = o1.appendAddButton()
          addBtn.onclick = async () => {
            this.overlay("pop", o2 => {
              const content = o2.content
              const funnelId = this.create("input/id", content)
              const submit = button.render("action", {textContent: "Funnel jetzt speichern"}, content)
              submit.onclick = async () => {
                await this.verify("input/value", funnelId.input)
                const id = funnelId.input.value
                const res = await o1.registerIt({id})
                if (res.status === 200) o2.remove()
                else this.add("style/not-valid", funnelId.input)
              }
            })
          }
          o1.createItButton = async it => {
            const button = Helper.create("button/left-right")
            if (it.id) {
              if (it.query) {
                const id = await Helper.convert("text/purified", it.query)
                button.left.innerHTML = id
              } else {
                button.left.textContent = it.id
              }
            }
            if (it.visibility) {
              Helper.render("text/hover-bottom-right", it.visibility, button)
            }
            return button
          }
          function appendBlueprint(it, o) {
            if (node && it.blueprint) {
              const button = Helper.render("button/left-right", {left: ".append", right: "Funnel anhängen"}, o.content)
              button.onclick = () => {
                const form = Helper.convert("map/form", it.blueprint)
                node.appendChild(form)
                o1.remove()
                o.remove()
              }
            }
          }
          function copyBlueprint(it, o) {
            if (it.blueprint) {
              const button = Helper.render("button/left-right", {left: ".copy", right: "Kopiere dein Blueprint in die Zwischenablage"}, o.content) 
              button.onclick = () => {
                navigator.clipboard.writeText(JSON.stringify(it.blueprint)).then(() => window.alert("Dein Funnel wurde erfolgreich in deiner Zwischablage gespeichert."))
              }
            }
          }
          function emailBlueprint(it, o) {
            if (it.blueprint) {
              const button = Helper.render("button/left-right", {left: ".email", right: "Versende deinen Blueprint per E-Mail"}, o.content)
              button.onclick = async () => {
                const mailtoLink = `mailto:?body=${encodeURIComponent(JSON.stringify(it.blueprint))}`
                const a = document.createElement("a")
                a.href = mailtoLink
                a.click()
              }
            }
          }
          o1.closedOptions = it => {
            Helper.overlay("pop", async o2 => {
              const content = o2.content
              if (it.id) o2.info.textContent = `#${it.id}.options`
              appendBlueprint(it, o2)
              copyBlueprint(it, o2)
              emailBlueprint(it, o2)
              const blueprintBtn = this.render("button/left-right", {left: ".blueprint", right: "Erstelle deinen eigenen Funnel"}, content)
              await o1.removeIt(it, o2)
              o1.visibility(it, o2)
            })
          }
          o1.openOptions = it => {
            Helper.overlay("pop", o1 => {
              if (it.id) o1.info.textContent = `#${it.id}.options`
              appendBlueprint(it, o1)
              copyBlueprint(it, o1)
              emailBlueprint(it, o1)
            })
          }
          o1.renderTabs()
          o1.it = "funnel"
          o1.filter = "id"
          o1.input = searchField.input
          const content = this.create("div/loading", o1.content)
          o1.rerender = content
        })
      }
    }
    if (event === "openImagesOverlay") {
      return (node) => {
        if (!node) node = document.body
        this.overlay("pop", async o1 => {
          o1.addInfo(".images")
          const content = o1.content
          const searchField = this.create("input/text", content)
          searchField.input.placeholder = "Suche nach Alias"
          o1.renderTabs()
          o1.appendChild(o1.addButton)
          this.add("hover-outline", o1.addButton)
          o1.addButton.onclick = ev => {
            this.overlay("pop", async o2 => {
              o2.addInfo(`.upload`)
              const funnel = this.render("upload", "image/*", o2)
              funnel.submit.onclick = async () => {
                await this.verify("input/value", funnel.url.input)
                const res = await o1.registerIt({url: funnel.url.input.value})
                if (res.status === 200) {
                  o2.remove()
                }
              }
            })
          }
          o1.it = "images"
          o1.filter = "alias"
          o1.input = searchField.input
          o1.rerender = this.div("", content)
          o1.rerenderStyle = it => {
            this.convert("parent/flex-around", it)
            it.style.margin = "21px 34px"
          }
          o1.createItButton = async it => {
            const box = this.div("color-theme w89 m21 p21 br5")
            this.add("hover-outline", box)
            let alias
            if (it.alias) {
              alias = await this.convert("text/purified", it.alias)
              if (it.query) {
                alias = await Helper.convert("text/purified", it.query)
                box.innerHTML = alias
              } else {
                box.textContent = alias
              }
            }
            this.render("img", {src: it.url, className: "image"}, box)
            this.render("text/hover-bottom-right", it.visibility, box)
            return box
          }
          o1.closedOptions = it => {
            this.overlay("pop", o2 => {
              if (it.alias) o2.addInfo(it.alias)
              o1.aliasIt(it, o2)
              o1.appendImageSrcToBody(it.url, o2)
              o1.copyToClipboard(it.url, o2)
              o1.removeIt(it, o2)
              o1.visibility(it, o2)
            })
          }
          o1.openOptions = it => {
            this.overlay("pop", o2 => {
              if (it.alias) o2.addInfo(it.alias)
              o1.appendImageSrcToBody(it.url, o2)
              o1.copyToClipboard(it.url, o2)
            })
          }
        })
      }
    }
    if (event === "openLayerOverlay") {
      return (layer, node) => {
        this.overlay("pop", async layerOverlay => {
          this.render("text/h1", "Wähle einen Layer aus", layerOverlay)
          const buttons = this.create("div/scrollable", layerOverlay)
          const fatherButton = this.create("button/left-right", buttons)
          fatherButton.classList.add("father-button")
          this.add("hover-outline", fatherButton)

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
              this.add("hover-outline", button)

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
        this.overlay("pop", queriesOverlay => {
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
              const queryButton = this.create("button/left-right", content)
              queryButton.left.textContent = this.convert("query/selector", query)
              queryButton.right.textContent = `Media Query ${i}`
              queryButton.onclick = () => {
                this.overlay("pop", queryOverlay => {
                  queryOverlay.info.textContent = currentSelector
                  const buttons = this.create("div/scrollable", queryOverlay)
                  const currentSelector = this.convert("query/selector", query)
                  const cssSplit = this.convert("query/css", query).split(" ")
                  const currentCss = cssSplit[0] + " " + cssSplit[1]
                  {
                    const button = this.create("button/left-right", buttons)
                    this.add("hover-outline", button)
                    button.left.textContent = ".selector"
                    button.right.textContent = "Ziel Element ändern"
                    button.onclick = () => {
                      this.overlay("pop", selectorOverlay => {
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
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".css"
                    button.right.textContent = "Style anpassen"
                    button.onclick = () => {
                      this.overlay("pop", cssOverlay => {
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
                    const button = this.create("button/left-right", buttons)
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

          this.overlay("pop", async layerOverlay => {
            this.render("text/h1", "Wähle einen Layer aus", layerOverlay)

            const layers = this.create("div/scrollable", layerOverlay)

            const fatherButton = this.create("button/left-right", layers)
            this.add("hover-outline", fatherButton)
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
                this.add("hover-outline", button)
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
    if (event === "openPdfOverlay") {
      return (node) => {
        this.overlay("pop", async o1 => {
          o1.info.textContent = ".pdf"
          const content = o1.content
          const searchField = this.create("input/text", content)
          searchField.input.placeholder = "Suche nach deinem Alias"
          o1.renderTabs()
          o1.appendChild(o1.addButton)
          o1.it = "pdf"
          o1.filter = "alias"
          o1.input = searchField.input
          o1.rerender = this.create("div/loading", o1.content)
          o1.addButton.onclick = ev => {

            Helper.overlay("pop", async o2 => {
              o2.info.textContent = `.upload.pdf`
              const funnel = this.render("upload", "application/pdf", o2)
              funnel.submit.onclick = async () => {
                await Helper.verify("input/value", funnel.url.input)
                const res = await o1.registerIt({url: funnel.url.input.value})
                if (res.status === 200) o2.remove()
              }
            })
          }
          o1.closedOptions = it => {
            this.overlay("pop", o2 => {
              if (it.alias) o2.info.textContent = `.pdf#${it.alias}`
              o1.aliasIt(it, o2)
              o1.openWindow(it, o2)
              o1.removeIt(it, o2)
              o1.sharePdf(it, o2)
              o1.visibility(it, o2)
            })
          }
          o1.openOptions = it => {
            this.overlay("pop", o2 => {
              if (it.alias) o2.info.textContent = `.pdf#${it.alias}`
              o1.openWindow(it, o2)
              o1.sharePdf(it, o2)
            })
          }
          o1.createItButton = async it => {

            const button = this.div("box sans-serif relative dark-light")
            this.on("hover", {node: button, class: "pointer outline"})
            let alias
            if (it.alias) {
              alias = await this.convert("text/purified", it.alias)
              if (it.query) {
                alias = await Helper.convert("text/purified", it.query)
                button.innerHTML = alias
              } else {
                button.textContent = alias
              }
            }
            const pdf = await this.render("pdf", it.url, button)
            pdf.style.margin = "21px 0"
            this.render("text/hover-bottom-right", it.visibility, button)
            return button
          }
        })
      }
    }
    if (event === "open-profile") {
      const {it, node, overlay} = input
      if (it && it.id && node && overlay) {
        const split = window.location.pathname.split("/")
        const expert = split[1]
        const platform = split[2]
        const url = `/${expert}/${platform}/profil/${it.id}/`
        node.addEventListener("click", ev => {
          window.open(url, "_blank")
          overlay.remove()
        })
      }
    }
    if (event === "openScriptsOverlay") {
      return (selectedNode, type) => {
        this.overlay("pop", async o1 => {
          o1.info.textContent = `.scripts`
          o1.content.appendChild(o1.addButton)
          o1.addButton.onclick = () => {
            this.overlay("pop", o2 => {
              o2.info.textContent = ".script"
              const funnel = o2.content
              const idField = this.create("input/id", funnel)
              const scriptField = this.create("input/script", funnel)
              const submit = this.create("button/action", funnel)
              submit.textContent = "Skript jetzt speichern"
              submit.onclick = async () => {
                await this.verify("funnel", funnel)
                const res = await o1.registerIt({id: idField.input.value, html: scriptField.input.value})
                if (res.status === 200) {
                  o2.remove()
                }
              }
            })
          }
          const searchField = this.create("input/text", o1.content)
          searchField.input.placeholder = "Suche nach Titel"
          o1.createItButton = async it => {
            const button = Helper.create("button/left-right")
            button.left.style.flex = "1 1 0"
            Helper.render("text/node/bottom-right-onhover", it.visibility, button)
            this.render("text/pre", it.html, button.right)
            if (it.query) {
              const id = await Helper.convert("text/purified", it.query)
              button.left.innerHTML = `#${id}`
            } else {
              button.left.textContent = `#${it.id}`
            }
            return button
          }
          o1.closedOptions = it => {
            this.overlay("pop", async o2 => {
              o2.info.textContent = `#${it.id}.options`
              const content = o2.content
              openButtons(it, o2)
              await o1.removeIt(it, o2)
              {
                const button = this.create("button/left-right", content)
                button.left.textContent = ".update"
                button.right.textContent = "Skript bearbeiten"
                button.onclick = () => {

                  this.overlay("pop", o3 => {
                    o3.info.textContent = `#${it.id}.update`
                    const funnel = o3.content
                    const nameField = this.create("input/id", funnel)
                    nameField.input.value = it.id
                    this.verify("input/value", nameField.input)
                    const scriptField = this.create("input/script", funnel)
                    scriptField.input.value = it.html
                    this.verify("input/value", scriptField.input)
                    const submit = this.create("button/action", funnel)
                    submit.textContent = "Skript jetzt speichern"
                    submit.onclick = async () => {
                      await this.verify("funnel", funnel)
                      const res = await o1.updateIt(it, {html: scriptField.input.value, id: nameField.input.value})
                      if (res.status === 200) {
                        o3.remove()
                        o2.remove()
                      }
                    }
                  })
                }
              }

              o1.visibility(it, o2)
            })
          }
          function openButtons(it, o) {
            o1.appendScript(it, selectedNode, o)
            {
              const button = Helper.create("button/left-right", o.content)
              button.left.textContent = ".execute"
              button.right.textContent = "Skript ausführen"
              button.addEventListener("click", async ev => {
                const script = await Helper.convert("text/script", it.html)
                Helper.convert("text/js", script.textContent)
              })
            }
          }
          o1.openOptions = it => {

            Helper.overlay("pop", o2 => {
              if (it.id) o2.info.textContent = `#${it.id}.options`
              openButtons(it, o2)
            })
          }
          o1.renderTabs()
          o1.it = "scripts"
          o1.filter = "id"
          o1.input = searchField.input
          const content = this.create("div/loading", o1.content)
          o1.rerender = content
        })
      }
    }
    if (event === "openSourcesOverlay") {
      return (selectedNode, type) => {
        this.overlay("pop", async o1 => {
          o1.info.textContent = "user.sources"
          o1.content.appendChild(o1.addButton)
          o1.addButton.onclick = () => {

            this.overlay("pop", async o2 => {
              o2.info.textContent = ".add.source"
              const searchField = this.create("input/text", o2.content)
              searchField.input.placeholder = "Suche nach dem Titel deiner Quelle"
              setTimeout(() => searchField.input.focus(), 34)
              this.verify("input/value", searchField.input)
              this.on("enter", searchField.input, ev => {

                this.overlay("pop", async o3 => {
                  o3.info.textContent = ".sources"
                  const h1 = this.render("text/h1", `Quellen werden gesucht..`, o3.content)
                  const filterTitleField = this.create("input/text", o3.content)
                  filterTitleField.input.placeholder = "Filter genauer nach Titel"
                  filterTitleField.style.margin = "0 34px"
                  this.verify("input/value", filterTitleField.input)
                  const buttons = this.create("div/loading", o3.content)
                  this.convert("text/sources", ev.target.value).then(async sources => {
                    if (sources.length === 0) {
                      window.alert("Es wurden keine Quellen gefunden.")
                      this.add("style/not-valid", searchField.input)
                      o3.remove()
                    } else if (sources.length === 1) {
                      h1.textContent = `Es wurde ${sources.length} Quelle gefunden`
                    } else {
                      h1.textContent = `Es wurden ${sources.length} Quellen gefunden`
                    }
                    async function renderButtons(array, node, query = "") {
                      const filtered = array?.filter(it => it["title"]?.toLowerCase().includes(query))
                      Helper.convert("parent/scrollable", node)
                      for (let i = 0; i < filtered.length; i++) {
                        const source = filtered[i]
                        if (!Helper.verifyIs("text/empty", query)) {
                          const regex = new RegExp(`(${query})`, "gi")
                          source.query = source.title.replace(regex, '<mark>$1</mark>')
                        }
                        const button = await o1.createItButton(source)
                        node.appendChild(button)
                        button.onclick = () => {
                          Helper.render("funnel/source", source, funnel)
                          Helper.verify("funnel", funnel)
                          o3.remove()
                        }
                      }
                    }
                    filterTitleField.input.oninput = async (ev) => {
                      await renderButtons(sources, buttons, ev.target.value)
                    }
                    await renderButtons(sources, buttons)
                  })
                })
              })
              this.render("text/hr", "Neue Quelle anlegen", o2.content)
              const funnel = this.create("funnel/source", o2.content)
              funnel.submit.onclick = async () => {
                await this.verify("funnel", funnel)
                const map = this.convert("funnel/map", funnel)
                const source = Helper.map("source", map.source)
                o1.registerIt(source)
                o1.tabs.meine.click()
                o2.remove()
              }
            })
          }
          if (type === "expert") {
            const button = Helper.create("button/left-right", o1.content)
            button.left.textContent = ".cite-button"
            button.right.textContent = "Erlaube deinen Nutzern dieses Dokument zu zitieren"
            button.onclick = () => {

              function extractAuthors() {
                const authorsElement = document.querySelector('.authors')
                if (authorsElement) {
                  const authorsText = authorsElement.textContent.replace('Authoren: ', '').trim()
                  const authorsArray = authorsText.split(',').map(author => author.trim())
                  const formattedAuthors = authorsArray.join(', ')
                  return formattedAuthors
                } else {
                  window.alert('Kein Element mit der Klasse "authors" gefunden!')
                }
              }

              function extractTitle() {
                const titleElement = document.querySelector('title')
                if (titleElement) {
                  return titleElement.textContent
                } else {
                  window.alert('Es wurde kein <title> im Dokument gefunden!')
                }
              }

              function extractYear() {
                const createdElement = document.querySelector('.post-created')
                if (createdElement) {
                  const dateText = createdElement.textContent.replace('Erstellt am: ', '').trim()
                  return dateText.match(/\b\d{4}\b/)
                } else {
                  window.alert('Kein Element mit der Klasse "post-created" gefunden!')
                }
              }

              const authors = extractAuthors()
              const title = extractTitle()
              const year = extractYear()
              const requested = createRequested()
              const fullCite = `${authors}, "${title}", getyour-plattform, ${year}, https://www.get-your.de${window.location.pathname}${requested.textContent}`
              const script = Helper.create("script/id", "cite-button")
              Helper.add("script-onbody", script)
              window.alert("Dein Zitier-Button wurde erfolgreich im <body> angehängt.")
              Helper.remove("overlays")
            }
          }
          function createRequested() {
            const span = document.createElement("span")
            span.textContent = `, Aufgerufen am: ${Helper.convert("millis/dd.mm.yyyy hh:mm", Date.now())}`
            return span
          }
          {
            const button = Helper.create("button/left-right", o1.content)
            button.left.textContent = ".requested"
            button.right.textContent = "Aktuell abgerufen Markierung anhängen"
            button.onclick = () => {
              const span = createRequested()
              selectedNode?.appendChild(span)
              o1.remove()
            }
          }
          const timestampButton = this.create("button/left-right", o1.content)
          timestampButton.left.textContent = ".timestamp"
          timestampButton.right.textContent = "Füge einen Zeitstempel ein"
          timestampButton.onclick = () => {
            const p = document.createElement("p")
            p.className = "post-created"
            p.style.fontSize = "13px"
            p.textContent = `Erstellt am: ${Helper.convert("millis/dd.mm.yyyy hh:mm", Date.now())}`
            selectedNode.appendChild(p)
            o1.remove()
          }
          const searchField = this.create("input/text", o1.content)
          searchField.input.placeholder = "Suche nach Titel"
          o1.createItButton = async it => {

            const button = Helper.create("button/left-right")
            Helper.render("text/node/bottom-right-onhover", it.visibility, button)
            const title = Helper.create("div", button.left)
            title.style.fontSize = "34px"
            if (it.query) {
              title.innerHTML = await Helper.convert("text/purified", it.query)
            } else {
              title.textContent = it.title
            }

            if (it.authors) {
              const authors = Helper.create("div", button.left)
              authors.style.fontSize = "21px"
              authors.style.fontWeight = "bold"
              authors.style.color = Helper.colors.matte.sunflower
              authors.textContent = it.authors.join(", ")
            }

            if (it.publisher) {
              const publisher = Helper.create("div", button.left)
              publisher.style.fontSize = "13px"
              publisher.textContent = it.publisher.join(", ")
            }

            if (it.isbn) {
              const isbn = Helper.create("div", button.left)
              isbn.style.fontSize = "13px"
              isbn.textContent = `ISBN: ${it.isbn.join(", ")}`
            }

            if (it.published) {
              const published = Helper.create("div", button.left)
              published.style.fontSize = "34px"
              published.textContent = this.convert("millis/yyyy", Number(it.published))
            }

            if (it.image) {
              const img = document.createElement("img")
              img.style.width = "100%"
              img.src = it.image
              button.right.append(img)
              button.right.style.width = "128px"
            }

            return button
          }
          o1.closedOptions = it => {

            const source = it
            Helper.overlay("pop", async o2 => {
              o2.info.textContent = source.title
              Helper.convert("node-text/slice-width", {node: o2.info, text: source.title, width: 89})
              const buttons = o2.content
              openButtons(source, o2)
              await o1.removeIt(it, o2)
              const updateButton = this.create("button/left-right", buttons)
              updateButton.left.textContent = ".update"
              updateButton.right.textContent = "Quelle aktualisieren"
              updateButton.onclick = () => {
                this.overlay("pop", o3 => {
                  o3.info.textContent = source.title
                  const funnel = this.create("funnel/source", o3.content)
                  this.render("funnel/source", source, funnel)
                  this.verify("funnel", funnel)
                  funnel.submit.onclick = async () => {
                    await Helper.verify("funnel", funnel)
                    const map = await Helper.convert("funnel/map", funnel)
                    const source = Helper.map("source", map.source)
                    const res = await o1.updateIt(it, source)
                    if (res.status === 200) {
                      o2.remove()
                      o3.remove()
                    }
                  }
                })
              }

              o1.visibility(it, o2)
            })
          }
          o1.openOptions = it => {

            Helper.overlay("pop", o2 => {
              if (it.title) o2.info.textContent = `${it.title}.options`
              openButtons(it, o2)
            })
          }
          o1.renderTabs()
          o1.it = "sources"
          o1.filter = "title"
          o1.input = searchField.input
          const content = this.create("div/loading", o1.content)
          o1.rerender = content
          function openButtons(source, o) {

            const authorsButton = Helper.create("button/left-right", o.content)
            authorsButton.left.textContent = ".authors"
            authorsButton.right.textContent = "Füge die Authoren ein"
            authorsButton.onclick = () => {
              const p = document.createElement("p")
              p.className = "authors"
              p.style.fontSize = "13px"
              p.textContent = `Authoren: ${source.authors.join(", ")}`
              selectedNode.appendChild(p)
              o.remove()
              o1.remove()
            }

            const fullButton = Helper.create("button/left-right", o.content)
            fullButton.left.textContent = ".full-cite"
            fullButton.right.textContent = "Füge einen Block Verweis ein"
            fullButton.onclick = () => {

              const authors = []
              for (let i = 0; i < source.authors.length; i++) {
                const author = source.authors[i]
                const names = author.split(" ")
                const formattedName = names[names.length - 1] + " " + names.slice(0, names.length - 1).join(" ")
                authors.push(formattedName)
              }

              const authorStr = authors.join(", ")

              let publisherStr = source.publisher[0]
              if (source.publisher.length > 1) {
                publisherStr = `${source.publisher[0]} et al.`
              }
              const cite = document.createElement("p")
              cite.className = "full-cite"
              const title = source.title.slice(0, -7)
              cite.textContent = `${authorStr}, "${title}", ${publisherStr}, ${Helper.convert("millis/yyyy", Number(source.published))}`
              selectedNode?.appendChild(cite)
              o.remove()
              o1.remove()
            }

            const inlineButton = Helper.create("button/left-right", o.content)
            inlineButton.left.textContent = ".inline-cite"
            inlineButton.right.textContent = "Füge einen Verweis im Text ein"
            inlineButton.onclick = () => {

              const cite = document.createElement("span")
              cite.setAttribute("inline-cite", "")
              cite.style.marginLeft = "5px"
              const year = Helper.convert("millis/yyyy", Number(source.published))
              if (source.authors.length === 0) {
                let title
                try {
                  title = source.title.split("(")[0].trim()
                } catch (error) {
                  title = source.title
                }
                cite.textContent = `(${title} ${year})`
              } else {
                if (source.authors.length === 1) {
                  const author = source.authors[0].split(" ").at(-1)
                  cite.textContent = `(${author} ${year})`
                }
                if (source.authors.length === 2) {
                  const first = source.authors[0].split(" ").at(-1)
                  const second = source.authors[1].split(" ").at(-1)
                  cite.textContent = `(${first} & ${second} ${year})`
                }
                if (source.authors.length > 2) {
                  const author = source.authors[0].split(" ").at(-1)
                  cite.textContent = `(${author} et al. ${year})`
                }
              }
              selectedNode.classList.add("inline-cite")
              const citationCounter = document.querySelectorAll(".inline-cite").length
              selectedNode.setAttribute("citation-counter", citationCounter)
              selectedNode?.appendChild(cite)
              o.remove()
              o1.remove()
            }
          }
        })
      }
    }
    if (event === "openTemplatesOverlay") {
      return (node) => {
        this.overlay("pop", async o1 => {
          const searchField = this.create("input/text", o1.content)
          searchField.input.placeholder = "Suche nach Text in deinem Template"
          if (node) {
            o1.appendChild(o1.addButton)
            o1.addButton.onclick = async () => {
              if (node.hasAttribute("contenteditable")) {
                node.removeAttribute("contenteditable")
              }
              if (node.hasAttribute("id")) {
                node.removeAttribute("id")
              }
              await this.remove("element/selected-node", node)
              const confirm = window.confirm("Möchtest du das ausgewählte Element als Template speichern?")
              if (confirm === true) {
                await o1.registerIt({html: node.outerHTML})
              }
            }
          }
          o1.createItButton = async it => {

            const button = this.create("button/left-right")
            button.style.width = "610px"
            button.style.margin = "21px 34px"
            let html = await Helper.convert("text/purified", it.html)
            if (it.query) {
              html = await Helper.convert("text/purified", it.query)
              button.left.innerHTML = html
            } else {
              button.left.innerHTML = html
            }
            button.left.style.height = "34vh"
            button.left.style.overflow = "auto"
            button.right.style.fontSize = "21px"
            if (it.alias) button.right.textContent = it.alias
            const signCounter = document.createElement("div")
            signCounter.textContent = `Zeichen: ${button.left.textContent.length}`
            button.right.appendChild(signCounter)
            this.render("text/hover-bottom-right", it.visibility, button)
            return button
          }
          o1.renderTabs()
          o1.it = "templates"
          o1.filter = "html"
          o1.input = searchField.input
          o1.rerender = this.create("div/loading", o1.content)
          o1.rerenderStyle = it => this.convert("parent/flex-around", it)
          o1.openOptions = it => {

            this.overlay("pop", o2 => {
              if (it.alias) o2.info.textContent = `${it.alias}.options`
              o1.appendHtml(it, node, o2)
              o1.appendText(it, node, o2)
              o1.copyHtml(it, o2)
              o1.copyText(it, o2)
              o1.emailHtml(it, o2)
              o1.emailText(it, o2)
              o1.translateText(it, o2)
              o1.shebang(it, o2)
            })
          }
          o1.closedOptions = it => {

            this.overlay("pop", o2 => {
              o2.info.textContent = `.options`
              o1.aliasIt(it, o2)
              o1.appendHtml(it, node, o2)
              o1.appendText(it, node, o2)
              o1.copyHtml(it, o2)
              o1.copyText(it, o2)
              o1.emailHtml(it, o2)
              o1.emailText(it, o2)
              o1.removeIt(it, o2)
              o1.translateText(it, o2)
              o1.shebang(it, o2)
              o1.visibility(it, o2)
            })
          }
        })
      }
    }
    if (event === "openVideosOverlay") {
      return (node) => {
        this.overlay("pop", async o1 => {
          o1.info.textContent = ".videos"
          const content = o1.content
          const searchField = this.create("input/text", content)
          searchField.input.placeholder = "Suche nach dem Titel"
          o1.appendAddButton()
          o1.addButton.onclick = ev => {

            this.overlay("pop", o2 => {
              o2.info.textContent = `.create.video`
              o1.openVid(node, o2)
              o1.upload("video/*", o2)
            })
          }
          o1.renderTabs()
          o1.it = "videos"
          o1.filter = "title"
          o1.input = searchField.input
          o1.rerender = this.div("", content)
          o1.createItButton = async it => {

            const videoButton = button.div("dark-light")
            this.add("hover-outline", videoButton)
            videoButton.className += " p13 of-hidden flex column"
            let title
            if (it.title) {
              const titleDiv = this.div("", videoButton)
              title = await this.convert("text/purified", it.title)
              if (it.query) {
                title = await Helper.convert("text/purified", it.query)
                titleDiv.innerHTML = title
              } else {
                titleDiv.textContent = title
              }
            }
            const video = document.createElement("video")
            video.controls = true
            video.preload = "none"
            video.src = it.url
            video.className = "w144"
            videoButton.appendChild(video)
            this.render("text/hover-bottom-right", it.visibility, videoButton)
            return videoButton
          }
          o1.closedOptions = it => {

            this.overlay("pop", o2 => {
              if (it.title) o2.info.textContent = it.title
              o1.appendButton(it, node, o2)
              o1.openWindow(it, o2)
              o1.removeIt(it, o2)
              o1.titleIt(it, o2)
              o1.visibility(it, o2)
            })
          }
          o1.openOptions = it => {

            this.overlay("pop", o2 => {
              if (it.title) o2.info.textContent = it.title
              o1.appendButton(it, node, o2)
              o1.openWindow(it, o2)
            })
          }
        })
      }
    }
    if (event === "pointer") {
      return (node) => {
        this.add("pointer", node)
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
    if (event === "styleBackgroundImage") {
      return (node) => {
        const url = window.prompt("Gebe die Quelle des Bildes ein: (text/url)")
        if (this.verifyIs("text/url", url)) {
          node.style.background = `url('${url}')`
        } else {
          window.alert("Keine gültige URL.")
        }
      }
    }
    if (event === "svg") {
      const it = {}

      it.icons = async (node, callback) => {
        Helper.create("div/loading", node)
        const fragment = document.createDocumentFragment()
        const res = await Helper.request("/get/svg/list-open/")
        if (res.status === 200) {
          const list = JSON.parse(res.response)
          for (let i = 0; i < list.length; i++) {
            const svgName = list[i]
            const button = Helper.create("toolbox/icon", fragment)
            const requestedText = await text(`/public/${svgName}`)
            const svgFragment = Helper.convert("text/fragment", requestedText)
            Helper.convert("svg/dark-light", svgFragment.firstChild)
            svgFragment.firstChild.setAttribute("width", "100%")
            if (typeof callback === "function") callback(button, svgFragment.firstChild)
            button.appendChild(svgFragment.firstChild)
          }
          node.textContent = ""
          node?.appendChild(fragment)
          return fragment
        }
      }

      return it
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
    if (event === "renderColors") {
      return (node, callback) => {
        for (const [key, value] of Object.entries(Helper.colors)) {
          if (typeof value === "string") {
            if (!Helper.verifyIs("text/empty", value)) {
              const button = Helper.create("button/key-value-color", {key, value})
              Helper.add("hover-outline", button)
              button.onclick = () => callback(value)
              node.appendChild(button)
            }
          }
          if (typeof value === "object") {
            Helper.render("text/hr", key, node)
            for (const [key, val] of Object.entries(value)) {
              if (typeof val === "string") {
                if (!Helper.verifyIs("text/empty", val)) {
                  const button = Helper.create("button/key-value-color", {key, value: val})
                  Helper.add("hover-outline", button)
                  button.onclick = () => callback(val)
                  node.appendChild(button)
                }
              }
            }
          }
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
    if (event === "trimLines") {
      return (node) => {
        const textContent = node.textContent
        node.textContent = textContent.split('\n').map(line => line.trim()).join('\n')
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
    if (event === "wrapAnchorWithPrompt") {
      return async (node) => {
        const prompt = window.prompt("Gebe die Quell-Url deines Links ein:")
        if (!this.verifyIs("text/empty", prompt)) {
          const a = document.createElement("a")
          a.style.textDecoration = "none"
          a.href = prompt
          node.style.cursor = "pointer"
          a.innerHTML = await this.convert("text/purified", node.outerHTML)
          node.replaceWith(a)
          return a
        }
      }
    }
  }
  static funnel(tree, input) {
    const key = this.convert("tree/key", tree)
    const it = document.createElement("div")
    it.id = key

    it.submit = this.create("button/action")
    it.submit.classList.add("submit")
    it.submit.textContent = "Daten jetzt speichern"


    if (tree === "alias") {

      it.alias = this.create("input/alias", it)
      this.append(it.submit, it)
    }

    if (tree === "condition") {

      it.left = this.create("input/tree", it)
      it.operator = this.create("input/operator", it)
      it.right = this.create("input/text", it)
      it.right.input.maxLength = "55"
      it.right.input.placeholder = "Vergleichswert (text/any)"
      it.right.input.setAttribute("required", "true")
      it.right.input.setAttribute("accept", "text/length")
      this.verify("input/value", it.right.input)
      it.right.input.oninput = () => this.verify("input/value", it.right.input)
      this.append(it.submit, it)
    }

    if (tree === "conflict") {

      it.environment = this.create("input/textarea", it)
      it.environment.input.setAttribute("required", "true")
      it.environment.input.setAttribute("accept", "text/length")
      it.environment.input.maxLength = "987"
      it.environment.input.placeholder = `Environments: Beschreibe deine Umgebung ?
        - URL Link
        - Browser
        - App
      `
      it.environment.input.style.height = "144px"
      it.environment.input.style.fontSize = "13px"
      this.verify("input/value", it.environment.input)
      it.reproduce = this.create("input/textarea", it)
      it.reproduce.input.setAttribute("required", "true")
      it.reproduce.input.setAttribute("accept", "text/length")
      it.reproduce.input.maxLength = "987"
      it.reproduce.input.placeholder = `Steps to reproduce: Reproduziere den Konflikt ?`
      it.reproduce.input.style.height = "144px"
      it.reproduce.input.style.fontSize = "13px"
      this.verify("input/value", it.reproduce.input)
      it.expected = this.create("input/textarea", it)
      it.expected.input.setAttribute("required", "true")
      it.expected.input.setAttribute("accept", "text/length")
      it.expected.input.maxLength = "987"
      it.expected.input.placeholder = `Expected behavior: Erwartetes Verhalten ?`
      it.expected.input.style.height = "144px"
      it.expected.input.style.fontSize = "13px"
      this.verify("input/value", it.expected.input)
      it.actual = this.create("input/textarea", it)
      it.actual.input.setAttribute("required", "true")
      it.actual.input.setAttribute("accept", "text/length")
      it.actual.input.maxLength = "987"
      it.actual.input.placeholder = `Actual behavior: Wirkliches Verhalten ?`
      it.actual.input.style.height = "144px"
      it.actual.input.style.fontSize = "13px"
      this.verify("input/value", it.actual.input)
      it.visibility = this.create("input/visibility", it)
      this.append(it.submit, it)
    }

    if (tree === "description") {

      it.description = this.create("input/description", it)
      this.append(it.submit, it)
    }

    if (tree === "email") {

      it.email = this.create("input/email", it)
      this.append(it.submit, it)
    }

    if (tree === "feedback") {

      it.feedback = this.create("input/feedback", it)
      it.importance = this.create("input/importance", it)
      this.append(it.submit, it)
    }

    if (tree === "name") {

      it.name = this.create("input/tag", it)
      this.append(it.submit, it)
    }

    if (tree === "platform") {

      it.platform = this.create("input/tag", it)
      it.platform.input.placeholder = "Plattform (text/tag)"
      this.append(it.submit, it)
    }

    if (tree === "getyour.web-entwickler") {

      it.alias = this.create("input/alias", it)
      it.type = this.create("input/text", it)
      it.type.input.id = "type"
      it.type.input.value = "role"
      it.type.input.disabled = true
      it.image = this.create("input/image", it)
      this.append(it.submit, it)
    }

    if (tree === "getyour.web-entwickler.alias") {

      it.alias = this.create("input/alias", it)
      this.append(it.submit, it)
    }

    if (tree === "image") {

      it.image = this.create("input/image", it)
      this.append(it.submit, it)
    }

    if (tree === "login") {

      it.email = this.create("input/email", it)
      it.email.input.id = "email"
      it.dsgvo = this.create("input/checkbox", it)
      it.dsgvo.input.id = "dsgvo"
      it.dsgvo.input.classList.add("dsgvo")
      it.dsgvo.input.setAttribute("required", "true")
      it.label = this.div("sans-serif mtb21 mlr34", it)
      this.render("text/span", {text: "Ich habe die"}, it.label)
      const a1 = this.render("a", {text: "Nutzervereinbarungen", href: "/nutzervereinbarung/"}, it.label)
      this.render("text/span", {text: "und die"}, it.label)
      const a2 = this.render("a", {text: "Datenschutz Richtlinien", href: "/datenschutz/"}, it.label)
      this.render("text/span", {text: "gelesen und verstanden. Durch meine Anmeldung stimme ich ihnen zu."}, it.label)
      it.submit.textContent = "Jetzt anmelden"
      this.append(it.submit, it)
      it.info = this.create("info/success", it)
      const div1 = this.render("text/div", "Unser Login Prozess ist intuitiv gestaltet und erfordert nur wenige Klicks. Du musst lediglich Deine E-Mail Adresse eingeben, um dich einzuloggen. Wir möchten, dass Du den Login Prozess als einfach und stressfrei erlebst.", it.info)
      const mailto = this.render("a", {text: " Wenn Du Probleme hast oder Hilfe benötigst, stehen wir Dir jederzeit zur Verfügung, um Dir schnell und effektiv weiter zu helfen.", href: "mailto:datenschutz@get-your.de"}, div1)
      mailto.classList.remove("link-theme")
      const div2 = this.render("text/div", "Die Plattform von getyour soll ein sicheres und vertrauenswürdiges Umfeld bieten, damit Du dich auf Deine Daten verlassen kannst.", it.info)
      div2.classList.add("mt13")
    }

    if (tree === "notes") {

      it.notes = this.create("input/textarea")
      it.notes.input.id = "notes"
      it.notes.input.className = "vh55 fs13"
      it.notes.input.placeholder = `next:email(Meine Notizen)
        next:tel(Meine Notizen)
        next:webcall(Meine Notizen)
      `
      this.append(it.submit, it)
    }

    if (tree === "platform.value") {

      it.alias = this.create("input/alias", it)
      it.alias.input.setAttribute("required", "true")
      it.path = this.create("input/tag", it)
      it.path.input.placeholder = "Pfad (text/tag)"
      it.path.input.maxLength = "89"
      this.append(it.submit, it)
    }

    if (tree === "profile") {

      it.aboutYou = this.create("input/textarea", it)
      it.aboutYou.input.placeholder = `Erzähl etwas über dich ?
        - was du gerade machst (beruflich oder privat)
        - etwas was dem anderen hilft
        - von jetzt sprechen
        - praktische Beispiele (beruflich oder privat)
        - Schlüsselwörter benutzen (IT, Beratung)

        z.b., ich bin ... (deine Person), das heißt ... (Vorteil), das bedeutet für dich ... (Nutzen für den anderen).
      `
      it.aboutYou.input.style.height = "144px"
      this.add("style/valid", it.aboutYou.input)
      it.aboutYou.input.style.fontSize = "13px"
      it.aboutYou.input.setAttribute("accept", "text/length")
      it.aboutYou.input.maxLength = "987"
      it.whyThis = this.create("input/textarea", it)
      it.whyThis.input.placeholder = `Was kannst du besonders gut ?
        - Nicht in Bullet Points schreiben
        - Vollständige Sätze formulieren

        z.b., mit der STAR Methode:

        1. Situation
        2. Task
        3. Action
        4. Result
      `
      it.whyThis.input.style.height = "144px"
      this.add("style/valid", it.whyThis.input)
      it.whyThis.input.style.fontSize = "13px"
      it.whyThis.input.setAttribute("accept", "text/length")
      it.whyThis.input.maxLength = "987"
      it.motivation = this.create("input/textarea", it)
      it.motivation.input.placeholder = `Wie motivierst du dich ?
        z.b., ich möchte das Web, für ... (Adressat), scheller und einfacher machen, ..
      `
      it.motivation.input.style.height = "144px"
      this.add("style/valid", it.motivation.input)
      it.motivation.input.style.fontSize = "13px"
      it.motivation.input.setAttribute("accept", "text/length")
      it.motivation.input.maxLength = "987"
      it.visibility = this.create("input/text", it)
      it.visibility.input.placeholder = "Sichtbarkeit (open/closed)"
      it.visibility.input.value = "closed"
      it.visibility.input.setAttribute("required", "true")
      it.visibility.input.oninput = () => this.verify("input/value", it.visibility.input)
      it.visibility.input.setAttribute("accept", "text/length")
      it.visibility.input.maxLength = "6"
      this.verify("input/value", it.visibility.input)
      this.append(it.submit, it)
      this.request("/jwt/get/tree/", {tree: "profile"}).then(async res => {
        if (res.status === 200) {
          const profile = JSON.parse(res.response)

          const messagesDiv = document.createElement("div")
          this.style(messagesDiv, {display: "flex", flexWrap: "wrap", justifyContent: "space-around"})
          it.prepend(messagesDiv)

          if (profile.messages !== undefined) {
            for (let i = 0; i < profile.messages.length; i++) {
              const message = profile.messages[i]
              const box = this.create("box", messagesDiv)
              this.style(box, {fontFamily: "sans-serif", fontSize: "21px"})
              box.innerHTML = await this.convert("text/purified", message.html)
              box.onclick = () => {

                this.overlay("pop", o1 => {
                  const content = this.create("div/scrollable", o1)
                  const remove = this.render("button/left-right", {left: ".remove", right: "Nachricht entfernen"}, content)
                  remove.onclick = () => {

                    const confirm = window.confirm("Möchtest du diese Nachricht wirklich entfernen?")
                    if (confirm === true) {
                      this.overlay("lock", async o2 => {
                        const res = await this.request("/remove/profile/message/", {created: message.created})
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
          const title = this.render("text/h2", "Meine Nachrichten")
          it.prepend(title)
          it.aboutYou.input.value = profile.aboutYou
          it.whyThis.input.value = profile.whyThis
          it.motivation.input.value = profile.motivation
          it.visibility.input.value = profile.visibility
        }
      })
    }

    if (tree === "role") {

      it.name = this.create("input/tag", it)
      it.name.input.placeholder = "Rolle (text/tag)"
      this.render("label", {for: "home", text: "Startseite auswählen"}, it)
      it.home = this.create("input/select", it)
      it.home.input.id = "home"
      this.append(it.submit, it)
    }

    this.verify("funnel", it)
    if (input) this.append(it, input)
    return it
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
              this.overlay("pop", overlay => {
                overlay.info.append(this.convert("element/alias", fieldInput))
                const content = this.create("div/scrollable", overlay)
                if (fieldInput.tagName === "SELECT") {
                  {
                    const button = this.create("button/left-right", content)
                    button.left.textContent = ".options"
                    button.right.textContent = "Antwortmöglichkeiten definieren"
                    button.addEventListener("click", () => {
                      this.overlay("pop", overlay => {
                        this.removeOverlayButton(overlay)

                        const info = this.create("header/info", overlay)
                        info.append(this.convert("element/alias", fieldInput))
                        info.append(this.convert("text/span", ".options"))

                        {
                          const button = this.create("button/left-right", overlay)
                          button.left.textContent = ".append"
                          button.right.textContent = "Neue Antwortmöglichkeit anhängen"
                          button.addEventListener("click", () => {

                            this.overlay("pop", overlay => {
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
          this.add("style/not-valid", idField.input)
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

        const script = this.create("script/id", "on-info-click")
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
              this.add("style/not-valid", idField.input)
              throw new Error("id exist")
            }

            if (document.getElementById(id) === null) {

              const field = this.convert("text/field", type)
              field.id = id
              field.label.textContent = label

              if (!this.verifyIs("text/empty", info)) {
                field.setAttribute("on-info-click", info)
                const script = this.create("script/id", "on-info-click")
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

    if (event === "path/id") {

      const {path, id} = input
      return new Promise(async(resolve, reject) => {
        try {
          const ids = await Helper.convert("path/ids", path)
          if (ids.length <= 0) {
            window.alert(`Fehler: Pfad enthält kein Ids. Bitte kontaktiere deinen Ansprechpartner.\n\nPfad: '${path}'`)
            o2.remove()
            return
          }
          const node = ids.find(it => it.id === id)
          if (!node) throw new Error(`id: '${tag}' not found in path`)
          resolve(node)
        } catch (error) {
          reject(error)
        }
      })
    }
  }
  static goBack() {

    let lastPage = document.referrer
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
  static async groups() {

    if (!this._groups) {
      const module = await import("/js/groups.js")
      this._groups = module.groups
    }
    return this._groups
  }
  static lorem(length) {

    const words = [
      "Lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
      "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
      "magna", "aliqua", "Ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
      "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo",
      "consequat", "Duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate",
      "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur", "Excepteur",
      "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in", "culpa", "qui",
      "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
    ]
    let text = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * words.length)
      text += words[randomIndex] + " "
    }
    return text.trim()
  }
  static map(event, input) {

    if (event === "source") {

      input.authors = input.authors.split(",").map(it => it.trim())
      input.publisher = input.publisher.split(",").map(it => it.trim())
      input.isbn = input.isbn.split(",").map(it => it.trim())
      input.keywords = input.keywords.split(",").map(it => it.trim())
      input.language = input.language.split(",").map(it => it.trim())
      return input
    }
  }
  static mock(it) {

    it.alias = "Anakin Skywalker"
    it.status = "Bereit"
    it.description = this.lorem(144)
    it.image = "/public/image.svg"
  }
  static async nextSteps() {

    if (!this._nextSteps) {
      const module = await import("/js/next-steps.js")
      this._nextSteps = module.nextSteps
    }
    return this._nextSteps
  }
  static async numerology() {

    if (!this._numerology) {
      const module = await import("/js/numerology.js")
      this._numerology = module.numerology
    }
    return this._numerology
  }
  static async purify() {

    if (!this._purify) {
      const module = await import("/js/purify.min.js")
      // console.log(module.DOMPurify);
      this._purify = module.DOMPurify
    }
    return this._purify
  }
  static on(event, input, callback) {
    if (event === "click") {
      input.addEventListener("click", ev => {
        ev.preventDefault()
        callback(ev)
      })
    }
    if (event === "enter") {
      input.addEventListener("keydown", ev => {
        if (ev.key === 'Enter') {
          ev.preventDefault()
          callback(ev)
        }
      })
    }
    if (event === "hover") {
      const split = input.class.split(" ")
      input.node.addEventListener("mouseout", ev => {
        for (let i = 0; i < split.length; i++) {
          const className = split[i]
          input.node.classList.remove(className)
        }
      })
      input.node.addEventListener("mouseover", ev => {
        for (let i = 0; i < split.length; i++) {
          const className = split[i]
          input.node.classList.add(className)
        }
      })
    }
    if (event === "shift+enter") {
      input.addEventListener("keydown", ev => {
        if (ev.key === 'Enter') {
          if (ev.shiftKey) {
            // do default
          } else {
            ev.preventDefault()
            callback()
          }
        }
      })
    }
  }
  static overlay(event, callback) {
    if (event === "children") {
      if (!callback) callback = {}
      this.overlay("pop", overlay => {
        overlay.registerHtmlButton(callback.type)
        if (callback.info) overlay.addInfo(callback.info)
        const childrenContainer = overlay.content
        function addScript(id) {
          const script = Helper.create("script/id", id)
          Helper.add("script-onbody", script)
          window.alert("Skript erfolgreich angehängt.")
          Helper.remove("overlays")
        }
        childrenLoop: for (let i = 0; i < callback.node.children.length; i++) {
          let child = callback.node.children[i]
          if (child.id === "toolbox") continue
          if (child.id === "toolbox-getter") continue
          if (child.getAttribute("data-id") === "toolbox") continue
          if (child.classList.contains("overlay")) continue
          for (let i = 0; i < child.classList.length; i++) {
            if (child.classList[i].startsWith("overlay")) continue childrenLoop
          }
          const childrenButton = this.create("button/left-right", childrenContainer)
          childrenButton.left.append(this.convert("element/alias", child))
          childrenButton.right.textContent = "Element bearbeiten"
          function updateNodeAlias(node) {
            childrenButton.left.textContent = ""
            childrenButton.left.append(Helper.convert("element/alias", node))
          }
          if (child.tagName === "SCRIPT") {
            this.render("left-right/local-script-toggle", child.id, childrenButton)
          }
          childrenButton.onclick = () => {
            this.overlay("pop", async o1 => {
              o1.registerHtmlButton(callback.type)
              o1.addInfo(`<${this.convert("node/selector", child)}`)
              const buttons = o1.content
              if (["BODY", "DIV", "P"].includes(child.tagName)) {
                const aBtn = this.render("button/left-right", {left: ".a", right: "Anker anhängen"}, buttons)
                aBtn.onclick = () => {
                  this.overlay("pop", o2 => {
                    const content = o2.content
                    const href = this.create("input/text", content)
                    href.input.placeholder = "href"
                    href.input.setAttribute("required", "true")
                    const textContent = this.create("input/text", content)
                    textContent.input.placeholder = "textContent"
                    const target = this.create("input/select", content)
                    target.addOption("-- target")
                    const options = ["_blank", "_self", "_parent", "_top"]
                    target.append(options)
                    const tooltip = this.create("input/text", content)
                    tooltip.input.placeholder = "tooltip"
                    const download = this.create("input/text", content)
                    download.input.placeholder = "download"
                    this.verify("inputs", content)
                    const submit = action("Anker jetzt anhängen", content)
                    submit.onclick = async () => {
                      await this.verify("funnel", content)
                      const a = document.createElement("a")
                      a.className = "break-word sans-serif"
                      const hrefValue = href.input.value
                      a.href = hrefValue
                      const targetValue = target.input.value
                      if (!this.verifyIs("text/empty", targetValue)) {
                        a.target = targetValue
                      }
                      const tooltipValue = tooltip.input.value
                      if (!this.verifyIs("text/empty", tooltipValue)) {
                        a.title = tooltipValue
                      }
                      const downloadValue = download.input.value
                      if (!this.verifyIs("text/empty", downloadValue)) {
                        a.download = downloadValue
                      }
                      const textValue = textContent.input.value
                      if (!this.verifyIs("text/empty", textValue)) {
                        a.textContent = textValue
                      } else {
                        a.textContent = hrefValue
                      }
                      child.appendChild(a)
                      this.remove("overlays")
                    }
                  })
                }
              }
              const appendChildBtn = this.render("button/left-right", {left: ".appendChild", right: "HTML Element anhängen"}, buttons)
              appendChildBtn.onclick = () => {
                const prompt = window.prompt("Gebe ein HTML Element Tag ein:")
                try {
                  const element = document.createElement(prompt)
                  if (!element) throw new Error("HTML Element Tag ist ungültig.")
                  child.appendChild(element)
                  this.remove("overlays")
                } catch (e) {
                  window.alert(e)
                }
              }
              if (child.tagName !== "SCRIPT") {
                const childrenBtn = this.render("button/left-right", {left: ".children", right: "Element Inhalt"}, buttons)
                childrenBtn.onclick = async () => {
                  const realLength = Array.from(child.children).filter(it => !it.classList.contains("no-save") && !it.classList.contains("overlay") && it.id !== "toolbox-getter").length
                  if (realLength > 0) {
                    this.overlay("children", {node: child, type: callback.type, info: `${this.convert("element/alias", child).textContent}.children`})
                  } else alert("Das HTML Element ist leer.")
                }
              }
              const classBtn = this.render("button/left-right", {left: ".class", right: "Klassen definieren"}, buttons)
              classBtn.onclick = () => {
                this.overlay("pop", o2 => {
                  o2.registerHtmlButton(callback.type)
                  o2.addInfo(`<${this.convert("node/selector", child)}`)
                  const content = o2.content
                  const classField = this.create("input/textarea", content)
                  classField.input.placeholder = "mehrere klassen werden mit einem leerzeichen getrennt"
                  classField.input.style.fontFamily = "monospace"
                  classField.input.style.height = "34vh"
                  if (child.hasAttribute("class")) {
                    classField.input.value = child.getAttribute("class")
                  }
                  this.add("hover-outline", classField.input)
                  this.verify("input/value", classField.input)
                  classField.input.oninput = () => {
                    const value = classField.input.value
                    if (this.verifyIs("text/empty", value)) {
                      child.removeAttribute("class")
                    } else {
                      child.setAttribute("class", value)
                    }
                    o2.info.textContent = `<${this.convert("node/selector", child)}`
                    updateNodeAlias(child)
                  }
                })
              }
              if (!["BODY"].includes(child.tagName)) {
                const copyBtn = this.render("button/left-right", {left: ".copy", right: "Element kopieren"}, buttons)
                copyBtn.onclick = async () => {
                  await this.convert("text/clipboard", child.outerHTML)
                  window.alert(`${child.tagName} wurde erfolgreich in deine Zwischenablage kopiert.`)
                }
              }
              {
                if (!["SCRIPT", "HEAD"].includes(child.tagName)) {
                  const darkLightBtn = this.render("button/left-right", {left: ".dark-light", right: "Dark Light Modus umschalten"}, buttons)
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".dark-light"
                  button.right.textContent = "Dark Light Modus umschalten"
                  button.onclick = () => {

                    this.convert("node/dark-light-toggle", child)
                    window.alert("Dark Light Modus erfolgreich umgeschaltet.")
                    this.remove("overlays")
                  }
                }

                if (child.tagName === "SCRIPT") {
                  {
                    const button = this.create("button/left-right", buttons)
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

                if (["BODY", "DIV"].includes(child.tagName)) {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".div"
                  button.right.textContent = "DIV-Element anhängen"
                  button.onclick = () => {

                    this.render("text/div", "DIV", child)
                    this.remove("overlays")
                  }
                }

                if (child.tagName === "DIV") {

                  if (["closed", "expert"].includes(callback.type)) {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".div-creator"
                    button.right.textContent = "Bearbeite dein Element schnell und einfach"
                    button.onclick = () => {

                      this.overlay("pop", async overlay => {
                        const registerHtmlButton = overlay.registerHtmlButton(callback.type)
                        if (registerHtmlButton) {
                          registerHtmlButton.onclick = async () => {
                            this.remove("contenteditable", clone)
                            this.remove("selected-node", clone)
                            child.replaceWith(clone)
                            this.add("register-html")
                          }
                        }

                        const content = overlay.content
                        content.className = "vh100p"
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

                        let clone = child.cloneNode(true)
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

                        const buttons = this.fn("creator-buttons", {parent: content, type: callback.type})

                        buttons.convertTextContentToH1Button.onclick = () => {
                          const h1 = buttons.convertTextContentToH1(selectedNode)
                          selectedNode = h1
                        }
                        buttons.convertTextContentToH2Button.onclick = () => {
                          const h2 = buttons.convertTextContentToH2(selectedNode)
                          selectedNode = h2
                        }
                        buttons.convertTextContentToH3Button.onclick = () => {
                          const h3 = buttons.convertTextContentToH3(selectedNode)
                          selectedNode = h3
                        }

                        buttons.videoSeriesButton.onclick = () => buttons.createVideoSeriesBox(selectedNode)
                        buttons.openVideosOverlayButton.onclick = () => buttons.openVideosOverlay(selectedNode, callback.type)
                        buttons.openAudiosOverlayButton.onclick = () => buttons.openAudiosOverlay(selectedNode, callback.type)
                        buttons.openPdfOverlayButton.onclick = () => buttons.openPdfOverlay(selectedNode, callback.type)
                        buttons.openFunnelOverlayButton.onclick = () => this.fn("openFunnelOverlay")(selectedNode)
                        buttons.styleBackgroundImageButton.onclick = () => buttons.styleBackgroundImage(selectedNode)
                        buttons.appendImageButton.onclick = () => buttons.appendImage(selectedNode)
                        buttons.trimLinesButton.onclick = () => buttons.trimLines(selectedNode)
                        buttons.openUrlButton.onclick = () => buttons.openUrl(selectedNode)
                        buttons.convertToInlineCiteButton.onclick = () => buttons.convertToInlineCite(selectedNode)
                        buttons.convertToFullCiteButton.onclick = () => buttons.convertToFullCite(selectedNode)
                        buttons.removeCiteMarksButton.onclick = () => buttons.removeCiteMarks(selectedNode)
                        buttons.myValueUnitsButton.onclick = () => buttons.createMyValueUnitsBox(selectedNode)
                        buttons.profileSurveysButton.onclick = () => buttons.createProfileSurveysBox(selectedNode)
                        buttons.imageTextAndActionButton.onclick = () => buttons.createImageTextAndActionBox(selectedNode)
                        buttons.backgroundImageWithTitlesButton.onclick = () => buttons.createBackgroundImageWithTitles(selectedNode)
                        buttons.duckDuckGoButton.onclick = () => buttons.convertTextContentToDuckDuckGoLink(selectedNode)
                        buttons.pointerButton.onclick = () => buttons.pointer(selectedNode)
                        buttons.sourcesButton.onclick = () => buttons.openSourcesOverlay(selectedNode, callback.type)
                        buttons.templatesButton.onclick = () => buttons.openTemplatesOverlay(selectedNode)
                        if (callback.type === "expert") {
                          buttons.openScriptsOverlayButton.onclick = () => buttons.openScriptsOverlay(selectedNode, callback.type)
                        }
                        buttons.openImagesOverlayButton.onclick = () => buttons.openImagesOverlay(selectedNode)
                        buttons.createFlexButton.onclick = () => buttons.createFlexWidthWithPrompt(selectedNode)
                        buttons.createGridButton.onclick = () => buttons.createGridMatrixWithPrompt(selectedNode)
                        buttons.appendDivButton.onclick = () => buttons.appendDiv(selectedNode)
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
                        buttons.wrapLinkButton.onclick = async () => {
                          const link = await buttons.wrapAnchorWithPrompt(selectedNode)
                          clone = link
                        }
                        buttons.aLinkButton.onclick = () => buttons.createAnchorWithPrompt(selectedNode)
                        buttons.locationAssignButton.onclick = () => buttons.addLocationAssign(selectedNode)
                        buttons.windowOpenBlankButton.onclick = () => buttons.addWindowOpenBlank(selectedNode)
                        buttons.spanButton.onclick = () => buttons.createSpanWithTextContent(selectedNode)
                        buttons.changeSiButton.onclick = () => buttons.createSpanWithSiPrompt(selectedNode)
                        buttons.addSpaceButton.onclick = () => buttons.createSpaceWithHeightPrompt(selectedNode)
                        buttons.arrowRightButton.onclick = () => buttons.createArrowRightWithColorPrompt(selectedNode)
                        buttons.divScrollableButton.onclick = () => buttons.createScrollableY(selectedNode)
                        buttons.packDivButton.onclick = async () => {
                          const div = await buttons.createDivPackOuter(selectedNode)
                          clone = div
                        }
                        buttons.textInputButton.onclick = () => buttons.createTextInput(selectedNode)
                        buttons.numberInputButton.onclick = () => buttons.createTelInput(selectedNode)
                        buttons.checkboxInputButton.onclick = () => buttons.createCheckboxInput(selectedNode)
                        buttons.passwordInputButton.onclick = () => buttons.createPasswordInput(selectedNode)
                        buttons.selectInputButton.onclick = () => buttons.createSelectInput(selectedNode)
                        buttons.createDateInputButton.onclick = () => buttons.createDateInput(selectedNode)
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

                        const svgIconsFragment = await buttons.svgIcons.appendSvgIconsFragment(buttons.svgPickerOptions, (button) => {
                          selectedNode.appendChild(button.querySelector(".icon").cloneNode(true))
                        })

                      })

                    }
                  }

                }

                if (child.closest("svg") !== null) {

                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".fill"
                    button.right.textContent = "Passe die Farbe deine SVG Elements an"
                    button.onclick = () => {

                      this.overlay("pop", colorsOverlay => {
                        colorsOverlay.addInfo(".fill.colors")
                        const container = this.div("flex wrap pb144 of-auto", colorsOverlay)
                        this.fn("renderColors")(container, (value) => {
                          child.setAttribute("fill", value)
                          window.alert(`Das 'fill'-Attribut wurde erfolgreich im ${child.tagName.toUpperCase()} gesetzt.`)
                          this.remove("overlays")
                        })
                      })
                    }
                  }

                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".fixed-bottom-center"
                    button.right.textContent = "Positioniere dein SVG fixiert-unten-mittig"
                    button.onclick = () => {

                      child.className += " fixed bottom left50p translateX-50p"
                      this.remove("overlays")
                    }
                  }


                }

                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".html"
                  button.right.textContent = "HTML anhängen"
                  button.onclick = () => {

                    this.overlay("pop", overlay => {
                      overlay.addInfo(`<${this.convert("node/selector", child)}.html`)
                      const funnel = overlay.content
                      const field = this.create("input/textarea", funnel)
                      field.input.placeholder = `<div>..</div>`
                      field.input.style.fontSize = "13px"
                      field.input.style.fontFamily = `monospace`
                      field.input.style.height = "55vh"
                      field.input.setAttribute("required", "true")
                      this.verify("input/value", field.input)
                      field.input.oninput = () => this.verify("input/value", field.input)
                      const submit = this.create("button/action", funnel)
                      submit.textContent = "HTML jetzt anhängen"
                      submit.onclick = async () => {

                        const html = await this.convert("text/purified", field.input.value)
                        if (!this.verifyIs("text/empty", html)) {
                          this.append(html, child)
                          this.remove("overlays")
                        } else {
                          window.alert("Kein gültiges HTML.")
                        }
                      }
                    })
                  }
                }
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".id"
                  button.right.textContent = "Element Id definieren"
                  button.onclick = async () => {

                    this.overlay("pop", async overlay => {
                      overlay.addInfo(`<${this.convert("node/selector", child)}`)
                      const content = overlay.content
                      const idField = this.create("input/text", content)
                      idField.input.setAttribute("accept", "text/tag")
                      idField.input.placeholder = "Id (text/tag)"
                      if (child.hasAttribute("id")) {
                        idField.input.value = child.getAttribute("id")
                      }
                      this.add("hover-outline", idField.input)
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
                            this.add("style/not-valid", idField.input)
                          }
                        }
                        overlay.info.textContent = `<${this.convert("node/selector", child)}`
                        updateNodeAlias(child)
                      }
                    })



                  }
                }
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".innerHTML"
                  button.right.textContent = "HTML Inhalt ersetzen"
                  button.onclick = async () => {

                    this.overlay("pop", overlay => {
                      overlay.addInfo(this.convert("element/alias", document.body))
                      const funnel = overlay.content
                      const htmlField = this.create("input/textarea", funnel)
                      htmlField.input.style.height = "55vh"
                      htmlField.input.style.fontFamily = "monospace"
                      htmlField.input.style.fontSize = "13px"
                      htmlField.input.placeholder = "<body>..</body>"
                      this.verify("input/value", htmlField.input)
                      const submit = this.create("button/action", funnel)
                      submit.textContent = "Inhalte jetzt ersetzen"
                      submit.onclick = async () => {

                        const purified = await Helper.convert("text/purified", htmlField.input.value)
                        if (!this.verifyIs("text/emtpy", purified)) {
                          child.innerHTML = purified
                          this.remove("overlays")
                        } else {
                          window.alert("Kein gültiges HTML.")
                        }
                      }
                    })
                  }
                }
                if (child.tagName === "BODY") {
                  if (callback.type === "expert") {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".location-list"
                    button.right.textContent = "Definiere eine Liste, für deine Nutzer"
                    button.onclick = () => {

                      this.overlay("pop", async o1 => {
                        const content = o1.content
                        const funnel = this.div("", content)
                        funnel.idField = this.create("input/id", funnel)
                        this.render("label", {for: "path", text: "Funnel wählen"}, funnel)
                        funnel.path = this.create("input/select", funnel)
                        funnel.path.input.id = "path"
                        const tree = "getyour.expert.platforms"
                        this.request("/get/users/trees/", {trees: [tree]}).then(res => {

                          if (res.status === 200) {
                            const users = JSON.parse(res.response)
                            funnel.path.input.textContent = ""
                            for (let i = 0; i < users.length; i++) {
                              const user = users[i]
                              const platforms = user[tree] || []
                              const values = platforms.flatMap(it => it.values || [])
                              for (let i = 0; i < values.length; i++) {
                                const value = values[i]
                                const option = document.createElement("option")
                                option.text = value.path
                                option.value = value.path
                                this.append(option, funnel.path.input)
                              }
                            }
                          }
                        })
                        this.add("style/valid", funnel.path.input)
                        funnel.path.input.oninput = async ev => {

                          const path = ev.target.value
                          const funnels = await this.convert("path/funnels", path)
                          this.overlay("pop", o2 => {
                            const content = o2.content
                            this.render("text/h1", "Verfügbare Funnel Ids", content)
                            const buttons = this.create("div", content)
                            for (let i = 0; i < funnels.length; i++) {
                              const it = funnels[i]
                              const button = this.render("button/left-right", {left: it.id, right: "Auswählen"}, buttons)
                              button.onclick = () => {

                                funnel.idField.input.value = it.id
                                this.verify("input/value", funnel.idField.input)
                                o2.remove()
                              }
                            }
                          })
                        }
                        funnel.submit = this.create("button/action", funnel)
                        funnel.submit.textContent = "Skript jetzt anhängen"
                        funnel.submit.onclick = async () => {

                          await this.verify("input/value", funnel.idField.input)
                          const tag = funnel.idField.input.value
                          const path = funnel.path.input.value
                          const script = this.create("script/id", `location-list`)
                          script.setAttribute("tag", tag)
                          script.setAttribute("path", path)
                          this.add("script-onbody", script)
                          window.alert("Skript wurde erfolgreich angehängt.")
                          this.remove("overlays")
                        }
                      })
                    }
                  }
                }
                if (child.tagName === "BODY") {
                  if (callback.type === "expert") {
                    const button = this.render("button/left-right", {left: ".match-maker", right: "Match Maker Skripte anhängen"}, buttons)
                    button.onclick = () => {

                      this.overlay("pop", async o2 => {
                        o2.addInfo(".match-maker")
                        o2.load()
                        const content = o2.content
                        const res = await this.request("/get/match-maker/location-expert/")
                        if (res.status === 200) {
                          const matchMaker = JSON.parse(res.response)
                          // console.log(matchMaker);

                          // this.convert("parent/scrollable", content)
                          this.render("match-maker/buttons", matchMaker, content)
                        } else {
                          const res = await this.request("/get/match-maker/location-writable/")
                          if (res.status === 200) {
                            const matchMaker = JSON.parse(res.response)
                            // this.convert("parent/scrollable", content)
                            this.render("match-maker/buttons", matchMaker, content)
                          } else {
                            this.convert("parent/note", content)
                            content.textContent = "Keine Match Maker gefunden"
                          }
                        }
                      })
                    }
                  }
                }
                if (["BODY", "DIV"].includes(child.tagName)) {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".md"
                  button.right.textContent = "Markdown konvertieren und anhängen"
                  button.onclick = async () => {
                    this.overlay("pop", o2 => {
                      o2.addInfo(this.convert("element/alias", child))
                      const funnel = o2.content
                      const field = this.create("input/textarea", funnel)
                      field.input.placeholder = "Markdown zu HTML konvertieren (md/html)\n\n# Hello, Markdown! .. "
                      field.input.style.fontSize = "13px"
                      field.input.style.height = "55vh"
                      field.input.setAttribute("required", "true")
                      field.input.oninput = () => this.verify("input/value", field.input)
                      this.verify("input/value", field.input)
                      const submit = this.create("button/action", funnel)
                      submit.textContent = "Markdown jetzt anhängen"
                      submit.onclick = async () => {
                        await this.verify("input/value", field.input)
                        const markdown = field.input.value
                        const html = this.convert("markdown/html", markdown)
                        const purified = await this.convert("text/purified", html)
                        const div = this.div("markdown")
                        div.innerHTML = purified
                        this.append(div, child)
                        this.remove("overlays")
                      }
                    })
                  }
                }
                const prependChildBtn = this.render("button/left-right", {left: ".prependChild", right: "HTML Element anhängen"}, buttons)
                prependChildBtn.onclick = () => {
                  const prompt = window.prompt("Gebe ein HTML Element Tag ein:")
                  try {
                    const element = document.createElement(prompt)
                    if (!element) throw new Error("HTML Element Tag ist ungültig.")
                    child.prepend(element)
                    this.remove("overlays")
                  } catch (e) {
                    window.alert(e)
                  }
                }
                if (!["SCRIPT", "HEAD", "BODY"].includes(child.tagName)) {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".paste"
                  button.right.textContent = "Kopiertes Element anhängen"
                  button.onclick = async () => {

                    const text = await this.convert("clipboard/text")
                    const purified = await this.convert("text/purified", text)
                    if (this.verifyIs("text/empty", purified)) {
                      window.alert("Kein gültiges HTML.")
                      return
                    }
                    const fragment = document.createDocumentFragment()
                    const html = this.convert("text/html", purified)
                    fragment.appendChild(html)
                    child.appendChild(fragment)
                    window.alert(`Zwischenablage wurde erfolgreich in '${child.tagName}' angehängt.`)
                    this.remove("overlays")
                  }
                }
                if (!["BODY", "HEAD"].includes(child.tagName)) {
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".remove"
                    button.right.textContent = "Element entfernen"
                    button.onclick = async () => {
                      child.remove()
                      this.remove("overlays")
                    }
                  }
                }
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".setAttribute"
                  button.right.textContent = "Neues Attribut setzen"
                  button.onclick = () => {

                    const attribute = window.prompt("Gebe dein neues Attribut ein: (z.B., width)")
                    if (!this.verifyIs("text/empty", attribute)) {
                      const value = window.prompt("Gebe den Wert ein: (z.B., 100%)")
                      if (!this.verifyIs("text/empty", value)) {
                        child.setAttribute(attribute, value)
                        window.alert(`Attribut erfolgreich gesetzt.`)
                      }
                    }
                  }
                }
                if (child.tagName === "BODY") {
                  if (callback.type === "expert") {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".scripts"
                    button.right.textContent = "Nutze geprüfte HTML Skripte"
                    button.onclick = () => {

                      this.overlay("pop", async overlay => {
                        overlay.addInfo(".scripts")
                        const content = overlay.content
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
                }
                if (child.tagName === "HEAD") {
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".style"
                    button.right.textContent = "Design als Style Tag anhängen"
                    button.onclick = () => {

                      this.overlay("pop", overlay => {
                        overlay.addInfo(`<${this.convert("node/selector", child)}.style`)
                        const funnel = overlay.content
                        const cssField = this.create("input/textarea", funnel)
                        cssField.input.placeholder = `.class {..}`
                        cssField.input.style.fontFamily = "monospace"
                        cssField.input.style.fontSize = "13px"
                        cssField.input.style.height = "55vh"
                        cssField.input.setAttribute("required", "true")
                        cssField.input.oninput = () => this.verify("input/value", cssField.input)
                        const submit = this.create("button/action", funnel)
                        submit.textContent = "Style jetzt anhängen"
                        submit.onclick = async () => {

                          await this.verify("input/value", cssField.input)
                          const style = document.createElement("style")
                          style.textContent = cssField.input.value
                          this.append(style, child)
                          this.remove("overlays")
                        }
                      })
                    }
                  }
                }
                if (!["SCRIPT", "BODY", "HEAD"].includes(child.tagName)) {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".style"
                  button.right.textContent = "CSS Import mit Vorschau bearbeiten"
                  button.onclick = () => {

                    this.overlay("pop", overlay => {
                      overlay.addInfo(`<${this.convert("node/selector", child)}.style`)
                      const content = overlay.content
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
                      this.add("hover-outline", cssField.input)
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
                if (child.tagName === "BODY") {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".style"
                  button.right.textContent = "CSS Import"
                  button.onclick = () => {

                    this.overlay("pop", overlay => {
                      overlay.addInfo(`${this.convert("element/alias", child).textContent}.style`)
                      const content = overlay.content
                      const cssField = this.create("input/textarea", content)
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
                  }
                }
                if (!["SCRIPT", "HEAD"].includes(child.tagName)) {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".svg"
                  button.right.textContent = "Bringe deine Kreativität zum Ausdruck"
                  button.onclick = () => {

                    const svg = this.fn("svg")
                    this.overlay("pop", o2 => {
                      o2.addInfo(".svg.options")
                      const buttons = o2.content
                      {
                        const button = this.create("button/left-right", buttons)
                        button.left.textContent = ".icons"
                        button.right.textContent = "Füge vorgefertigte Icons deinem Element hinzu"
                        button.onclick = () => {

                          this.overlay("pop", async svgIconsOverlay => {
                            svgIconsOverlay.info.textContent = ".svg.icons"
                            const container = this.create("div/flex-row", svgIconsOverlay)
                            container.style.overflow = "auto"
                            await svg.icons(container, (iconButton, svgIcon) => {
                              iconButton.onclick = () => {
                                child.appendChild(svgIcon.cloneNode(true))
                                window.alert(`SVG wurde erfolgreich im ${child.tagName} angehängt.`)
                                this.remove("overlays")
                              }
                            })
                          })
                        }
                      }

                      {
                        const button = this.create("button/left-right", buttons)
                        button.left.textContent = ".upload"
                        button.right.textContent = "Lade dein eigenes SVG und füge es deinem Element hinzu"
                        button.onclick = () => {

                          this.overlay("pop", overlay => {
                            const inputField = this.create("input/file", overlay)
                            inputField.input.setAttribute("accept", "image/svg+xml")
                            this.add("style/not-valid", inputField.input)
                            inputField.input.oninput = async () => {
                              const file = inputField.input.files[0]
                              if (file.type === "image/svg+xml") {
                                this.add("style/valid", inputField.input)
                                const svg = await this.convert("file/svg", file)
                                child.appendChild(svg)
                                this.remove("overlays")
                              } else {
                                window.alert("Falsches Format. Es sind nur .svg Dateien erlaubt.")
                              }
                            }
                          })
                        }
                      }

                    })
                  }
                }
                if (child.tagName !== "BODY") {
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".textContent"
                    button.right.textContent = "Text Inhalt aktualisieren"
                    button.onclick = () => {

                      const editors = [
                        { name: 'codepen.io', url: 'https://codepen.io/pen/?editors=1100' },
                        { name: 'jsfiddle.net', url: 'https://jsfiddle.net/' },
                        { name: 'codesandbox.io', url: 'https://codesandbox.io/s/new' },
                        { name: 'jsbin.com', url: 'https://jsbin.com/?js' },
                        { name: 'playcode.io', url: 'https://playcode.io/javascript' },
                        { name: 'blackbox.ai', url: 'https://blackbox.ai/' },
                        { name: 'duck.ai', url: 'https://duck.ai/' },
                        { name: 'beautifier.io', url: 'https://beautifier.io/' },
                      ]

                      this.overlay("pop", overlay => {
                        overlay.info.textContent = `<${this.convert("node/selector", child)}.textContent`
                        const content = this.create("div/scrollable", overlay)
                        const htmlField = this.create("input/textarea", content)
                        htmlField.input.style.height = "55vh"
                        htmlField.input.style.fontFamily = "monospace"
                        htmlField.input.style.fontSize = "13px"
                        htmlField.input.placeholder = "Mein Text Inhalt"
                        htmlField.input.value = child.textContent
                        this.add("hover-outline", htmlField.input)
                        this.verify("input/value", htmlField.input)
                        htmlField.input.oninput = () => {
                          child.textContent = htmlField.input.value
                        }

                        for (let i = 0; i < editors.length; i++) {
                          const editor = editors[i]
                          const button = this.create("button/left-right", content)
                          button.left.textContent = `.${editor.name}`
                          button.right.textContent = "Öffnet einen Editor in einem neuen Fenster"
                          button.onclick = () => window.open(editor.url, "_blank")
                        }

                      })
                    }
                  }
                }
                if (child.tagName === "HEAD") {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".title"
                  button.right.textContent = "Dokument Titel definieren"
                  button.onclick = async () => {
                    this.overlay("pop", async overlay => {
                      overlay.addRegisterHtmlButton(callback.type)
                      overlay.addInfo(`<${this.convert("node/selector", child)}.title`)
                      const funnel = overlay.content
                      const titleField = this.create("input/text", funnel)
                      titleField.input.placeholder = "<title>..</title>"
                      titleField.input.addEventListener("input", ev => {
                        const text = ev.target.value
                        if (this.verifyIs("text/empty", text)) {
                          document.querySelector("title").remove()
                          return
                        }
                        let title = document.querySelector("title")
                        if (title) {
                          title.textContent = text
                        } else {
                          title = document.createElement("title")
                          title.textContent = text
                          document.head.appendChild(title)
                        }
                      })
                    })
                  }
                }
                if (child.tagName === "BODY") {
                  // das muss irgendwie anders passieren ??
                  // ein skript mit einem tag ??
                  // kombiniert mit dem design tree?
                  // ddas ist das skript das individuelle designs mit daten füllen kann
                  if (callback.type === "expert") {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".users-trees-open"
                    button.right.textContent = "Hol dir eine Liste mit Nutzern"
                    button.onclick = () => {

                      this.overlay("pop", overlay => {
                        const funnel = this.create("div/scrollable", overlay)
                        createIdTreesFunnel(funnel)
                        funnel.submit.onclick = async () => {
                          await this.verify("field-funnel", funnel)
                          const script = this.create("script/id", funnel.idField.input.value)
                          if (!this.verifyIs("id/unique", script.id)) {
                            this.add("style/not-valid", funnel.idField.input)
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
                    Helper.add("hover-outline", node.idField.input)
                    Helper.verify("input/value", node.idField.input)
                    node.idField.input.oninput = () => Helper.verify("input/value", node.idField.input)
                    node.treesField = Helper.create("field/trees", fragment)
                    node.treesField.label.textContent = "Liste mit Datenstrukturen eingeben"
                    node.treesField.input.placeholder = `[\n  "getyour.expert.name",\n  "platform.company.name",\n  "email"\n]`
                    node.treesField.input.style.height = "144px"
                    Helper.add("hover-outline", node.treesField.input)
                    Helper.verify("input/value", node.treesField.input)
                    node.treesField.input.oninput = () => Helper.verify("input/value", node.treesField.input)
                    node.submit = Helper.create("button/action", fragment)
                    node.submit.textContent = "Skript jetzt anhängen"
                    node?.appendChild(fragment)
                    return node
                  }

                  if (callback.type === "expert") {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".user-trees-closed"
                    button.right.textContent = "Hol dir Datensätze vom Nutzer"
                    button.onclick = () => {
                      this.overlay("pop", overlay => {
                        overlay.info.textContent = "script.user-trees-closed"
                        const funnel = this.create("div/scrollable", overlay)
                        createIdTreesFunnel(funnel)
                        funnel.submit.onclick = async () => {
                          await this.verify("field-funnel", funnel)
                          const script = this.create("script/id", funnel.idField.input.value)
                          if (!this.verifyIs("id/unique", script.id)) {
                            this.add("style/not-valid", funnel.idField.input)
                          }
                          this.add("id-onbody", script)
                        }
                      })
                    }
                  }
                }
              }
            })
          }
        }
      })
    }
    if (event === "conflicts") {
      if (!callback) throw new Error("no trigger found")
      return this.overlay("pop", o1 => {
        const content = o1.content
        o1.onlyClosedUser()
        o1.appendAddButton()
        o1.addButton.onclick = () => {

          this.overlay("pop", o2 => {
            const content = o2.content
            const funnel = this.funnel("conflict", content)
            funnel.submit.onclick = async () => {

              const trigger = {
                created: Date.now(),
                id: callback.id,
                keys: Object.keys(callback),
              }
              const environment = funnel.environment.input.value
              const reproduce = funnel.reproduce.input.value
              const expected = funnel.expected.input.value
              const actual = funnel.actual.input.value
              const visibility = funnel.visibility.input.value
              await this.verify("funnel", funnel)
              this.overlay("lock", async o3 => {
                const res = await this.request("/register/user/conflict/", {trigger, environment, reproduce, expected, actual, visibility})
                if (res.status === 200) {
                  o3.alert.ok()
                  renderOpenConflicts()
                  o1.remove()
                  o2.remove()
                } else {
                  o3.alert.nok()
                }
                o3.remove()
              })
            }
          })
        }
        this.render("text/h1", "Konflikte", content)
        const flexRow = this.create("div/flex", content)
        const allButton = this.render("text/link", "Alle", flexRow)
        const myButton = this.render("text/link", "Meine", flexRow)
        const conflictsDiv = this.create("div", content)
        function renderOpenConflicts() {

          Helper.request("/jwt/get/conflicts-open/").then(res => {
            if (res.status === 200) {
              const conflicts = JSON.parse(res.response)
              conflictsDiv.textContent = ""
              for (let i = 0; i < conflicts.length; i++) {
                const conflict = conflicts[i]
                const button = Helper.create("button/left-right", conflictsDiv)
                button.left.textContent = Helper.convert("millis/dd.mm.yyyy hh:mm", conflict.created)
                button.right.textContent = conflict.visibility
              }
            }
          })
        }
        function renderClosedConflicts() {

          Helper.request("/jwt/get/conflicts-closed/").then(res => {
            if (res.status === 200) {
              const conflicts = JSON.parse(res.response)
              conflictsDiv.textContent = ""
              for (let i = 0; i < conflicts.length; i++) {
                const conflict = conflicts[i]
                const button = Helper.create("button/left-right", conflictsDiv)
                button.left.textContent = Helper.convert("millis/dd.mm.yyyy hh:mm", conflict.created)
                button.right.textContent = conflict.visibility
              }
            }
          })
        }
        renderOpenConflicts()
        allButton.onclick = () => {

          renderOpenConflicts()
        }
        myButton.onclick = () => {

          renderClosedConflicts()
        }
      })
    }
    if (event === "html-creator") {
      const overlay = document.createElement("div")
      overlay.className = "overlay fade-up"
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
      return overlay
    }
    if (event === "messages") {
      const user = callback
      this.overlay("pop", overlay => {
        overlay.onlyClosedUser()
        if (user.alias) overlay.info.textContent = user.alias
        const funnel = this.create("div/flex-between", overlay.content)
        funnel.style.margin = "0"
        const messageField = this.create("input/textarea", funnel)
        messageField.style.flex = "1 1 0"
        messageField.input.style.fontSize = "13px"
        messageField.input.style.height = "144px"
        messageField.input.placeholder = "Nachricht"
        messageField.input.setAttribute("required", "true")
        messageField.input.setAttribute("accept", "text/length")
        messageField.input.maxLength = "987"
        messageField.input.oninput = () => this.verify("input/value", messageField.input)
        this.verify("input/value", messageField.input)
        this.on("shift+enter", messageField.input, async () => await submitMessage())
        const submit = this.create("button/action", funnel)
        submit.textContent = "↑"
        this.style(submit, {borderRadius: "50%", width: "55px", height: "34px", fontSize: "21px"})
        async function submitMessage() {
          await Helper.verify("input/value", messageField.input)
          send({type: "message", message: messageField.input.value, to: user.created})
          messageField.input.value = ""
          Helper.add("style/not-valid", messageField.input)
          await Helper.add("ms/timeout", 610)
          send({type: "community"})
          await Helper.add("ms/timeout", 610)
          send({type: "community-to", to: user.created})
        }
        submit.onclick = async () => await submitMessage()
        const flex = this.create("div/flex", overlay.content)
        flex.style.marginTop = "0"
        const blockButton = this.render("text/link", "Nutzer blockieren", flex)
        blockButton.onclick = async () => {
          let message = `Möchtest du wirklich diesen Nutzer blockieren?`
          if (user.alias) message = `Möchtest du wirklich ${user.alias} blockieren?`
          const confirm = window.confirm(message)
          if (confirm === true) {
            send({type: "block", id: user.created})
            await this.add("ms/timeout", 610)
            send({type: "community-to", to: user.created})
          }
        }
        const conflictButton = this.render("text/link", "Konflikt melden", flex)
        conflictButton.onclick = () => this.overlay("conflicts", user)
        const addTemplate = this.render("text/link", "Template einfügen", flex)
        addTemplate.onclick = () => {
          this.overlay("select-template", template => {
            messageField.input.value = template
            this.verify("input/value", messageField.input)
          })
        }
        const removeMessagesButton = this.render("text/link", "Meine Nachrichten entfernen", flex)
        removeMessagesButton.onclick = () => {
          send({type: "remove-messages", to: user.created})
        }

        const chatDiv = this.create("div", overlay.content)

        let socket
        if (user.socket) {
          socket = user.socket
          send({type: "chat", id: user.created})
        } else {
          if (window.location.host === "localhost:9999") {
            socket = new WebSocket(`ws://${window.location.host}/`)
          } else {
            socket = new WebSocket(`wss://${window.location.host}/`)
          }
          overlay.closeSocket(socket)
          socket.onopen = () => {
            send({type: "chat", id: user.created})
          }
          socket.onerror = (error) => {
            console.error('WebSocket error:', error)
            socket.close()
          }
        }

        socket.addEventListener("close", () => {
          overlay.remove()
        })

        socket.addEventListener("message", async ev => {
          const data = JSON.parse(ev.data)
          if (data.type === "block") {
            send({type: "community"})
            let message = `Der Nutzer wurde erfolgreich blockiert.`
            if (user.alias) message = `Der Nutzer ${user.alias} wurde erfolgreich blockiert.`
            window.alert(message)
            overlay.remove()
          }
          if (data.type === "chat") {
            chatDiv.textContent = ""
            chatDiv.removeAttribute("style")
            chatDiv.style.display = "flex"
            chatDiv.style.flexDirection = "column"
            this.style(chatDiv, {display: "flex", flexDirection: "column", fontFamily: "sans-serif", wordBreak: "break-word", margin: "0 34px"})
            for (let i = 0; i < data.chat.length; i++) {
              const message = data.chat[i]
              const box = this.create("box", chatDiv)
              this.on("click", box, () => {
                messageField.input.value = message.body
                messageField.scrollIntoView({behavior: "smooth"})
                this.add("style/valid", messageField.input)
                messageField.input.focus()
              })
              box.style.whiteSpace = 'pre-wrap'
              box.textContent = message.body
              this.style(box, {width: "auto", maxWidth: "55%", flexShrink: "0", margin: "8px 0"})
              if (message.to === user.created) {
                box.style.alignSelf = "flex-end"
                this.convert("parent/light", box)
              } else {
                box.style.alignSelf = "flex-start"
              }
            }
          }
          if (data.type === "message") {
            send({type: "chat", id: user.created})
          }
          if (data.type === "remove-messages") {
            send({type: "chat", id: user.created})
          }
        })

        function send(data) {
          socket.send(JSON.stringify(data))
        }
      })
    }
    if (event === "tools") {
      if (!callback) callback = {}
      return this.overlay("pop", async o1 => {
        o1.registerHtmlButton(callback.type)
        const buttons = o1.content

        {
          const button = this.render("button/left-right", {left: "convert.text", right: "Konvertiere Texte schnell und einfach"}, buttons)
          button.onclick = () => {
            this.overlay("pop", o2 => {
              o2.registerHtmlButton(callback.type)
              const content = o2.content

              function createInputField(placeholder) {
                const field = Helper.create("input/textarea", content)
                field.input.style.fontSize = "13px"
                field.input.placeholder = placeholder
                field.input.setAttribute("required", "true")
                Helper.verify("input/value", field.input)
                return field
              }
              {
                const inputField = createInputField("Entferne alle JavaScript Kommentare (//)")
                inputField.input.oninput = () => {
                  inputField.input.value = this.remove("//", inputField.input.value)
                  this.verify("input/value", inputField.input)
                }
              }
              {
                const inputField = createInputField("Entferne alle leeren Zeilen (\\n)")
                inputField.input.oninput = () => {
                  inputField.input.value = this.remove("\n", inputField.input.value)
                  this.verify("input/value", inputField.input)
                }
              }
              {
                const inputField = createInputField("Entferne alle Semicolon (;)")
                inputField.input.oninput = () => {
                  inputField.input.value = this.remove(";", inputField.input.value)
                  this.verify("input/value", inputField.input)
                }
              }
              {
                const field = createInputField("Konvertiere (text/line)")
                field.input.oninput = () => {
                  field.input.value = this.convert("text/line", field.input.value)
                  this.verify("input/value", field.input)
                }
              }
              {
                const inputField = createInputField("Konvertiere (tag/Text)")
                inputField.input.oninput = () => {
                  inputField.input.value = this.convert("tag/capital-first-letter", inputField.input.value)
                  this.verify("input/value", inputField.input)
                }
              }
              {
                const inputField = createInputField("Konvertiere (text/tag)")
                inputField.input.oninput = () => {
                  inputField.input.value = this.convert("text/tag", inputField.input.value)
                  this.verify("input/value", inputField.input)
                }
              }
              convertInput("millis/iso")
              function convertInput(ev) {
                const inputField = createInputField(`Konvertiere (${ev})`)
                inputField.input.oninput = () => {
                  inputField.input.value = Helper.convert(ev, inputField.input.value)
                  Helper.verify("input/value", inputField.input)
                }
              }
              {
                const inputField = createInputField("Konvertiere (millis/since)")
                inputField.input.oninput = () => {
                  inputField.input.value = this.convert("millis/since", inputField.input.value)
                  this.verify("input/value", inputField.input)
                }
              }
              {
                const field = createInputField("Konvertiere HTML Dokumente zu Inline CSS (doc/inline)")
                field.input.oninput = async () => {
                  const doc = this.convert("text/doc", field.input.value)
                  const inline = this.convert("doc/inline", doc)
                  field.input.value = inline.documentElement.outerHTML
                  this.verify("input/value", field.input)
                }
              }
            })
          }
        }
        const documentBtn = this.render("button/left-right", {left: ".document", right: "Ein schneller Überblick"}, buttons)
        documentBtn.onclick = () => {
          this.overlay("pop", o2 => {
            o1.registerHtmlButton(callback.type)
            const content = o2.content
            const pre = document.createElement("pre")
            pre.className = "p8 pre-wrap monospace color-theme fs13"
            const prettified = this.prettifyHtml(document.documentElement.outerHTML)
            pre.textContent = prettified
            this.append(pre, content)
          })
        }
        {
          const button = this.create("button/left-right", buttons)
          button.left.textContent = "document.backup"
          button.right.textContent = "Lade dein HTML Dokument herunter"
          button.onclick = async ev => await this.downloadFile(document.documentElement.outerHTML, "text/html")
        }

        {
          const button = this.create("button/left-right", buttons)
          button.left.textContent = "document.children"
          button.right.textContent = "Dokumenten Inhalt"
          button.onclick = () => {
            this.overlay("children", {node: document.documentElement, type: callback.type, info: ".children"})
          }
        }

        {
          const button = this.create("button/left-right", buttons)
          button.left.textContent = "document.copy"
          button.right.textContent = "Aktuelles Dokument kopieren"
          button.onclick = () => {
            this.convert("text/clipboard", document.documentElement.outerHTML)
            .then(() => window.alert("Dokument erfolgreich in die Zwischenablage kopiert."))
          }
        }

        {
          const button = this.create("button/left-right", buttons)
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
            this.remove("overlays")
          }
        }

        if (callback.type === "expert") {
          const button = this.create("button/left-right", buttons)
          button.left.textContent = "document.write"
          button.right.textContent = "Aktuelles Dokument ersetzen"
          button.right.textContent = "Mehr Infos"
          this.add("hover-outline", button.right)
          button.right.addEventListener("click", ev => {

            ev.stopPropagation()
            this.overlay("pop", overlay => {
              const content = overlay.content
              this.render("text/h3", "Aktuelles Dokument ersetzen", content)
              this.render("a", {className: "mlr34 link-theme sans-serif fs21", href: "https://developer.mozilla.org/en-US/docs/Web/API/Document/write", text: "Mozilla Developer Network write() Methode", target: "_blank"}, content)
            })
          })
          button.addEventListener("click", () => {

            this.overlay("pop", overlay => {
              const content = overlay.content
              const html = this.create("input/html", content)
              const button = this.create("button/action", content)
              button.textContent = "Dokument jetzt ersetzen"
              button.addEventListener("click", async () => {

                const confirm = window.confirm("Achtung! Diese Funktion wird dein aktuelles HTML Dokument mit deinem neuen HTML Import ersetzen. Der Inhalt deines aktuellen Dokuments wird unwideruflich gelöscht, sobald du deine Werteinheit abspeicherst.\n\nMöchtest du dein aktuelles HTML Dokument wirklich ersetzen?")
                if (confirm === true) {
                  document.open()
                  document.write(html.input.value)
                  document.close()
                  const toolboxGetter = await this.toolboxGetter()
                  await toolboxGetter.addToolboxOnBody()
                  this.remove("overlays")
                }
              })
            })
          })
        }
        const forEachBtn = this.render("button/left-right", {left: ".forEach", right: "Anwendungen für jedes HTML Element"}, buttons)
        forEachBtn.onclick = () => {
          this.overlay("pop", o2 => {
            const content = o2.content
            const removeStyle = this.render("button/left-right", {left: ".remove-style", right: "Style Attribut entfernen"}, content)
            removeStyle.onclick = () => {
              document.querySelectorAll("*").forEach(node => node.removeAttribute("style"))
              this.remove("overlays")
            }
            const removeClass = this.render("button/left-right", {left: ".remove-class", right: "Class Attribut entfernen"}, content)
            removeClass.onclick = () => {
              document.querySelectorAll("*").forEach(node => node.removeAttribute("class"))
              this.remove("overlays")
            }
          })
        }
        if (callback.type === "expert") {
          const funnelBtn = this.render("button/left-right", {left: ".funnel", right: "Meine Funnel"}, buttons)
          funnelBtn.onclick = () => this.fn("openFunnelOverlay")(document.body)
        }
        const imageButton = this.render("button/left-right", {left: ".image", right: "Für die Bildbearbeitung"}, buttons)
        imageButton.onclick = () => {
          this.overlay("pop", o2 => {
            const content = o2.content
            o2.addInfo(".image")
            if (callback.type === "expert") {
              const myImages = this.render("button/left-right", {left: ".images", right: "Meine Bilder"}, content)
              myImages.onclick = () => this.fn("openImagesOverlay")(document.body)
            }
            this.render("text/hr", "Bildbearbeitung", content)
            const image = this.create("input/file", content)
            image.input.setAttribute("accept", "image/*")
            image.input.oninput = () => this.verify("input/value", image.input)
            const imageToDataUrl = this.render("text/link", "DataURL", content)
            imageToDataUrl.onclick = async () => {
              const imageFile = image.input.files[0]
              if (!imageFile) {
                this.add("style/not-valid", image.input)
                return
              }
              const reader = new FileReader()
              reader.onload = ev => {
                const dataUrl = ev.target.result
                img.src = dataUrl
                output.textContent = dataUrl
                output.onclick = () => {
                  navigator?.clipboard?.writeText(dataUrl).then(() => {
                    window.alert("Data URL wurde erfolgreich in die Zwischenablage gespeichert.")  
                  })
                  .catch(e => {
                    window.alert("Fehler.. Bitte wiederholen.")
                    console.error(e)
                  })
                }
                  
              }
              reader.readAsDataURL(imageFile)
            }
            const imagePreview = this.div("btn-theme color-theme m21 p8 break-word", content)
            const img = document.createElement("img")
            imagePreview.appendChild(img)
            const output = this.div("btn-theme color-theme m21 p8 break-word", content)
            this.add("hover-outline", output)
          })
        }
        {
          const button = this.create("button/left-right", buttons)
          button.left.textContent = ".open"
          button.right.textContent = "Ein Platz für Integrationen"
          button.onclick = () => {
            this.overlay("pop", o2 => {
              o2.addInfo(".open")
              function createIntegration(type, integrations) {
                const button = Helper.create("button/left-right", o2.content)
                button.left.textContent = type
                button.addEventListener("click", () => {
                  integrations.sort((a, b) => a.name.localeCompare(b.name))
                  Helper.overlay("pop", o3 => {
                    o3.addInfo(`.open${type}`)
                    const content = o3.content
                    for (let i = 0; i < integrations.length; i++) {
                      const integration = integrations[i]
                      const button = Helper.create("button/left-right", content)
                      button.left.textContent = integration.name
                      button.right.remove()
                      button.onclick = () => window.open(integration.url, "_blank")
                    }
                  })
                })
              }
              const aiIntegrations = [
                {name: "ollama.com", url: "https://ollama.com/"},
                {name: "huggingface.co", url: "https://huggingface.co/"},
                {name: "nomic.ai", url: "https://www.nomic.ai/gpt4all"},
                {name: "blackbox.ai", url: "https://www.blackbox.ai/"},
                {name: 'duck.ai', url: 'https://duck.ai/'},
                {name: "chatgpt.com", url: "https://chatgpt.com"},
                {name: "deepai.org", url: "https://www.deepai.org/chat/text-generator"},
                {name: "futurepedia.io", url: "https://www.futurepedia.io"},
                {name: "textsynth.com", url: "https://www.textsynth.com/completion.html"},
              ]
              createIntegration(".ai", aiIntegrations)
              const currencyIntegrations = [
                {name: "getmonero.org", url: "https://www.getmonero.org/"},
                {name: "minepi.com", url: "https://minepi.com/pnts"},
              ]
              createIntegration(".currency", currencyIntegrations)
              const infoIntegrations = [
                {name: "html-tags", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element"},
              ]
              createIntegration(".info", infoIntegrations)
              const mailIntegrations = [
                {name: "yopmail.com", url: "https://www.yopmail.com/"},
              ]
              createIntegration(".mail", mailIntegrations)

              const mathIntegrations = [
                {name: "wolframalpha.com", url: "https://www.wolframalpha.com/"},
                {name: "integral-calculator.com", url: "https://www.integral-calculator.com/"},
                {name: "gamma.sympy.org", url: "https://gamma.sympy.org/"},
                {name: "calculatorsoup.com", url: "https://www.calculatorsoup.com/"},
                {name: "mathway.com", url: "https://www.mathway.com/"},
              ]
              createIntegration(".math", mathIntegrations)

              const musicIntegrations = [
                {name: "web-audio-api", url: "https://webaudio.github.io/web-audio-api/"},
                {name: "hydrogen-music.org", url: "http://hydrogen-music.org/"},
                {name: "freesound.org", url: "https://freesound.org/"},
                {name: "tidalcycles.org", url: "https://tidalcycles.org/"},
              ]
              createIntegration(".music", musicIntegrations)

              const regexIntegrations = [
                { name: "debuggex.com", url: "https://www.debuggex.com/" },
                { name: "regex101.com", url: "https://regex101.com/" },
                { name: "regexr.com", url: "https://regexr.com/" },
                { name: "regextester.com", url: "https://www.regextester.com/" },
              ]
              createIntegration(".regex", regexIntegrations)

              const svgIntegrations = [
                {name: "svgviewer.dev", url: "https://www.svgviewer.dev/"},
                {name: "svg-path-editor", url: "https://yqnn.github.io/svg-path-editor/"},
              ]
              createIntegration(".svg", svgIntegrations)
              const translationIntegrations = [
                {name: "deepl.com", url: "https://www.deepl.com/de/translator"},
                {name: "libretranslate.com", url: "https://libretranslate.com/"},
              ]
              createIntegration(".translation", translationIntegrations)

              const uxIntegrations = [
                {name: "figma.com", url: "https://www.figma.com/"},
                {name: "penpot.app", url: "https://penpot.app/"},
                {name: "mockflow.com", url: "https://www.mockflow.com/"},
                {name: "canva.com", url: "https://www.canva.com/"},
                {name: "draw.io", url: "https://app.diagrams.net/"},
                {name: "uizard.io", url: "https://uizard.io/"},
                {name: "excalidraw.com", url: "https://excalidraw.com/"},
                {name: "figjam.com", url: "https://www.figma.com/figjam/"},
                {name: "moqups.com", url: "https://moqups.com/"},
                {name: "uxpin.com", url: "https://www.uxpin.com/"},
                {name: "wireframe.cc", url: "https://wireframe.cc/"},
              ]
              createIntegration(".ux", uxIntegrations)
            })
          }
        }

        {
          const controls = Helper.div("controls fixed top right z3")
          const pauseBtn = Helper.render("text/link", "Pause", controls)
          const stopBtn = Helper.render("text/link", "Stop", controls)
          const resetBtn = Helper.render("text/link", "Reset Cam", controls)
          const timerDisplay = Helper.render("text/link", "Aufnahmezeit: 00:00", controls)
          const cameraDiv = Helper.div("fullscreen flex align center z2")
          let seconds = 0
          function playSound() {

            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(528, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            gainNode.gain.linearRampToValueAtTime(0.008, audioContext.currentTime + 1)
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 4)
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            oscillator.start()
            oscillator.stop(audioContext.currentTime + 5)
          }
          function updateControlsTimer() {

            seconds++
            timerDisplay.textContent = `Aufnahmezeit: ${Helper.convert("seconds/hh:mm:ss", seconds)}`
            if (seconds === 300) playSound()
          }
          function animateCameraDiv() {

            Helper.classes(cameraDiv, {remove: "fullscreen", add: "to-bottom-left"})
          }
          const button = this.render("button/left-right", {left: ".record", right: "Beginne eine Aufnahme"}, buttons)
          button.onclick = ev => {
            this.overlay("pop", o => {
              const content = o.content
              const screenWithMic = this.render("button/left-right", {left: ".screen-with-mic", right: "Bildschirmaufnahme mit Ton"}, content)
              screenWithMic.onclick = async () => {

                try {
                  let mediaRecorder
                  let chunks = []
                  let timerInterval
                  if (!document.querySelector("div.controls")) document.body.appendChild(controls)
                  pauseBtn.addEventListener("click", () => {

                    if (mediaRecorder.state === "recording") {
                      mediaRecorder.pause()
                      clearInterval(timerInterval)
                      Helper.add("style/green", pauseBtn)
                      return
                    }
                    if (mediaRecorder.state === "paused") {
                      mediaRecorder.resume()
                      timerInterval = setInterval(updateControlsTimer, 1000)
                      Helper.add("style/dark-light", pauseBtn)
                      return
                    }
                  })
                  stopBtn.addEventListener('click', () => {

                    mediaRecorder.stop()
                  })
                  Helper.remove("overlays")
                  async function startRecording() {

                    const screenStream = await navigator.mediaDevices.getDisplayMedia({video: true})
                    const audioStream = await navigator.mediaDevices.getUserMedia({audio: true})
                    const combinedStream = new MediaStream([
                      ...screenStream.getVideoTracks(),
                      ...audioStream.getAudioTracks(),
                    ])
                    mediaRecorder = new MediaRecorder(combinedStream)
                    chunks = []
                    mediaRecorder.ondataavailable = function (event) {
                      if (event.data.size > 0) {
                        chunks.push(event.data)
                      }
                    }
                    mediaRecorder.onstop = async () => {
                      Helper.create("div/loading", stopBtn)
                      clearInterval(timerInterval)
                      const blob = new Blob(chunks, { type: 'video/webm' })
                      const hashHex = await Helper.digest(blob)
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${hashHex}.webm`
                      document.body.appendChild(a)
                      a.click()
                      setTimeout(() => {
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        combinedStream.getTracks().forEach(track => track.stop())
                        controls.remove()
                        window.location.reload()
                      }, 100)
                    }
                    mediaRecorder.start()
                    timerInterval = setInterval(updateControlsTimer, 1000)
                    Helper.add("style/red", timerDisplay)
                  }
                  await startRecording()
                } catch (error) {
                  window.alert("Fehler.. Bitte wiederholen.")
                  console.error(error)
                  controls.remove()
                }
              }
              const screenWithoutMic = this.render("button/left-right", {left: ".screen-without-mic", right: "Bildschirmaufnahme ohne Ton"}, content)
              screenWithoutMic.onclick = async () => {

                try {
                  let mediaRecorder
                  let chunks = []
                  let timerInterval
                  if (!document.querySelector("div.controls")) document.body.appendChild(controls)
                  async function startRecording() {

                    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
                    mediaRecorder = new MediaRecorder(stream)
                    chunks = []
                    mediaRecorder.ondataavailable = (event) => {
                      if (event.data.size > 0) {
                        chunks.push(event.data)
                      }
                    }
                    mediaRecorder.onstop = async () => {
                      Helper.create("div/loading", stopBtn)
                      clearInterval(timerInterval)
                      const blob = new Blob(chunks, { type: 'video/webm' })
                      const hashHex = await Helper.digest(blob)
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${hashHex}.webm`
                      document.body.appendChild(a)
                      a.click()
                      setTimeout(() => {
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        stream.getTracks().forEach(track => track.stop())
                        controls.remove()
                        window.location.reload()
                      }, 100)
                    }
                    mediaRecorder.start()
                    timerInterval = setInterval(updateControlsTimer, 1000)
                    Helper.add("style/red", timerDisplay)
                  }
                  pauseBtn.addEventListener('click', () => {

                    if (mediaRecorder.state === 'recording') {
                      mediaRecorder.pause()
                      clearInterval(timerInterval)
                      Helper.add("style/green", pauseBtn)
                      return
                    }

                    if (mediaRecorder.state === 'paused') {
                      mediaRecorder.resume()
                      timerInterval = setInterval(updateControlsTimer, 1000)
                      Helper.add("style/dark-light", pauseBtn)
                      return
                    }

                  })
                  stopBtn.addEventListener('click', () => {

                    mediaRecorder.stop()
                  })
                  Helper.remove("overlays")
                  await startRecording()
                } catch (error) {
                  window.alert("Fehler.. Bitte wiederholen.")
                  console.error(error)
                  controls.remove()
                }
              }
              const selfie = this.render("button/left-right", {left: ".selfie", right: "Frontkameraaufnahme mit Ton"}, content)
              selfie.onclick = async () => {

                try {
                  let mediaRecorder
                  let chunks = []
                  let timerInterval
                  if (!document.querySelector("div.controls")) document.body.appendChild(controls)
                  pauseBtn.addEventListener("click", () => {

                    if (mediaRecorder.state === "recording") {
                      mediaRecorder.pause()
                      clearInterval(timerInterval)
                      Helper.add("style/green", pauseBtn)
                      return
                    }
                    if (mediaRecorder.state === "paused") {
                      mediaRecorder.resume()
                      timerInterval = setInterval(updateControlsTimer, 1000)
                      Helper.add("style/dark-light", pauseBtn)
                      return
                    }
                  })
                  stopBtn.addEventListener('click', () => {

                    mediaRecorder.stop()
                  })
                  Helper.remove("overlays")
                  async function startRecording() {

                    const audioStream = await navigator.mediaDevices.getUserMedia({audio: true})
                    const cameraStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: "user"}})
                    const combinedStream = new MediaStream([
                      ...cameraStream.getVideoTracks(),
                      ...audioStream.getAudioTracks(),
                    ])
                    mediaRecorder = new MediaRecorder(combinedStream)
                    chunks = []

                    Helper.append(cameraDiv, document.body)
                    const cameraVideo = document.createElement("video")
                    cameraVideo.srcObject = cameraStream
                    cameraVideo.autoplay = true
                    Helper.append(cameraVideo, cameraDiv)

                    mediaRecorder.ondataavailable = function (event) {

                      if (event.data.size > 0) {
                        chunks.push(event.data)
                      }
                    }
                    mediaRecorder.onstop = async () => {

                      Helper.create("div/loading", stopBtn)
                      clearInterval(timerInterval)
                      const blob = new Blob(chunks, { type: 'video/webm' })
                      const hashHex = await Helper.digest(blob)
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${hashHex}.webm`
                      document.body.appendChild(a)
                      a.click()
                      setTimeout(() => {
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        combinedStream.getTracks().forEach(track => track.stop())
                        controls.remove()
                        cameraDiv.remove()
                        window.location.reload()
                      }, 100)
                    }
                    mediaRecorder.start()
                    timerInterval = setInterval(updateControlsTimer, 1000)
                    Helper.add("style/red", timerDisplay)
                  }
                  await startRecording()
                } catch (error) {
                  window.alert("Fehler.. Bitte wiederholen.")
                  console.error(error)
                  controls.remove()
                }
              }
              const screenWithZoom = this.render("button/left-right", {left: ".zoom-to-screen", right: "Bildschirmaufnahme mit Ton und Frontkamera"}, content)
              screenWithZoom.onclick = async () => {

                try {
                  const prompt = window.prompt("Nach wieviel Sekunden soll dein Bildschirm angezeigt werden: (text/number)")
                  if (!Helper.verifyIs("text/number", prompt)) return window.alert("Nummer ungültig.")
                  const duration = Helper.convert("seconds/millis", prompt)
                  let timeoutId
                  let startTime
                  let remainingTime = duration
                  let mediaRecorder
                  let chunks = []
                  let timerInterval
                  if (!document.querySelector("div.controls")) document.body.appendChild(controls)
                  pauseBtn.addEventListener("click", () => {

                    if (mediaRecorder.state === "recording") {
                      mediaRecorder.pause()
                      clearInterval(timerInterval)
                      clearTimeout(timeoutId)
                      remainingTime -= Date.now() - startTime
                      Helper.add("style/green", pauseBtn)
                      return
                    }
                    if (mediaRecorder.state === "paused") {
                      mediaRecorder.resume()
                      timerInterval = setInterval(updateControlsTimer, 1000)
                      startTime = Date.now()
                      timeoutId = setTimeout(animateCameraDiv, remainingTime)
                      Helper.add("style/dark-light", pauseBtn)
                      return
                    }
                  })
                  stopBtn.addEventListener('click', () => {

                    mediaRecorder.stop()
                  })
                  Helper.remove("overlays")
                  async function startRecording() {

                    const screenStream = await navigator.mediaDevices.getDisplayMedia({video: true})
                    const audioStream = await navigator.mediaDevices.getUserMedia({audio: {
                      noiseSuppression: true,
                      echoCancellation: true
                    }})
                    let cameraStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: "user"}})
                    const combinedStream = new MediaStream([
                      ...screenStream.getVideoTracks(),
                      ...audioStream.getAudioTracks(),
                    ])
                    mediaRecorder = new MediaRecorder(combinedStream)
                    chunks = []

                    Helper.append(cameraDiv, document.body)
                    const cameraVideo = document.createElement("video")
                    cameraVideo.srcObject = cameraStream
                    cameraVideo.autoplay = true
                    Helper.append(cameraVideo, cameraDiv)
                    if (Number(prompt) === 0) {
                      Helper.classes(cameraDiv, {remove: "fullscreen", add: "bottom-left"})
                    }

                    startTime = Date.now()
                    timeoutId = setTimeout(animateCameraDiv, duration)

                    mediaRecorder.ondataavailable = function (event) {

                      if (event.data.size > 0) {
                        chunks.push(event.data)
                      }
                    }
                    mediaRecorder.onstop = async () => {

                      Helper.create("div/loading", stopBtn)
                      clearInterval(timerInterval)
                      const blob = new Blob(chunks, { type: 'video/webm' })
                      const hashHex = await Helper.digest(blob)
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${hashHex}.webm`
                      document.body.appendChild(a)
                      a.click()
                      setTimeout(() => {
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        combinedStream.getTracks().forEach(track => track.stop())
                        cameraStream.getTracks().forEach(track => track.stop())
                        controls.remove()
                        cameraDiv.remove()
                        window.location.reload()
                      }, 100)
                    }
                    mediaRecorder.start()
                    timerInterval = setInterval(updateControlsTimer, 1000)
                    Helper.add("style/red", timerDisplay)
                    async function resetCamera() {
                      try {
                        if (cameraStream) {
                          cameraStream.getTracks().forEach(track => track.stop())
                        }
                        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
                        const cameraVideo = document.querySelector("video")
                        if (cameraVideo) {
                          cameraVideo.srcObject = cameraStream
                        }
                        console.log("Kamera zurückgesetzt")
                      } catch (error) {
                        console.error("Fehler beim Zurücksetzen der Kamera:", error)
                      }
                    }
                    resetBtn.addEventListener("click", resetCamera)
                  }
                  await startRecording()
                } catch (error) {
                  window.alert("Fehler.. Bitte wiederholen.")
                  console.error(error)
                  controls.remove()
                }
              }
            })
          }
        }
        if (callback.type === "expert") {
          const button = this.render("button/left-right", {left: ".role-login", right: "Rollen Zugang anhängen"}, buttons)
          button.onclick = () => {
            this.overlay("pop", async o2 => {
              const content = o2.content
              this.render("text/h1", "Rolle wählen", content)
              const loading = addLoading(content)
              const rolesDiv = this.div("", content)
              function updateRoles(roles, node) {
                loading.remove()
                Helper.reset("node", node)
                for (let i = 0; i < roles.length; i++) {
                  const role = roles[i]
                  const button = Helper.create("button/left-right", node)
                  button.left.textContent = role.text
                  button.right.textContent = `erstellt vor ${Helper.convert("millis/since", role.value)}`
                  Helper.add("hover-outline", button)
                  button.onclick = () => {
                    const script = document.createElement("script")
                    script.id = "role-login"
                    script.type = "module"
                    script.src = "/js/role-login.js"
                    script.setAttribute("role-created", role.value)
                    script.setAttribute("role-name", role.text)
                    Helper.add("script-onbody", script)
                    window.alert("Zugang wurde erfolgreich angehängt.")
                    Helper.remove("overlays")
                  }
                }
              }
              const res = await this.request("/location-expert/get/platform/roles/text-value/")
              if (res.status === 200) {
                const roles = JSON.parse(res.response)
                updateRoles(roles, rolesDiv)
              } else {
                const res = await this.request("/location-writable/get/platform/roles/text-value/")
                if (res.status === 200) {
                  const roles = JSON.parse(res.response)
                  updateRoles(roles, rolesDiv)
                } else {
                  this.render("text/note", "Keine Rollen gefunden.", rolesDiv)
                }
              }
            })
          }
        }
        if (callback.type === "expert") {
          const scriptButton = this.render("button/left-right", {left: ".script", right: "Lade ein Skript mit einer Id"}, buttons)
          scriptButton.onclick = async () => {
            this.overlay("pop", o2 => {
              o2.addRegisterHtmlButton(callback.type)
              const content = o2.content
              const prompt = this.render("button/left-right", {left: ".prompt", right: "Id eingeben"}, content)
              prompt.onclick = ev => {
                const prompt = window.prompt("Gebe eine Skript Id ein: (text/tag)")
                if (!this.verifyIs("text/empty", prompt)) {
                  const id = this.convert("text/tag", prompt)
                  const script = Helper.create("script/id", id)
                  Helper.add("script-onbody", script)
                  window.alert("Skript erfolgreich angehängt.")
                } else {
                  window.alert("Fehler.. Bitte wiederholen.")
                }
              }
              this.render("text/hr", "Verfügbare Skripte", content)
              const div = this.div("", content)
              this.request("/expert/get/js/paths/").then(res => {
                try {
                  const paths = JSON.parse(res.response)
                  paths.forEach(path => {
                    const id = this.convert("path/id", path)
                    if (Helper.verifyIs("text/empty", id)) return
                    const button = this.render("button/left-right", {left: `.${id}`, right: "Skript wählen"}, div)
                    button.onclick = ev => {
                      if (path === "chat.js") {
                        const chatId = window.prompt("Gebe die Chat Id ein:")
                        if (Helper.verifyIs("text/empty", chatId)) return
                        const script = document.createElement("script")
                        script.id = id
                        script.src = `/js/${id}.js`
                        script.type = "module"
                        script.setAttribute("chatId", chatId)
                        document.body.appendChild(script)
                        return
                      }
                      if (path === "feed.js") {
                        this.overlay("pop", o2 => {
                          const content = o2.content
                          o2.addInfo(".feed")
                          const feedScript = document.getElementById("feed")
                          let feedFunnel
                          let feedAlgo
                          if (feedScript) {
                            feedFunnel = feedScript.getAttribute("funnel")
                            feedAlgo = feedScript.getAttribute("algo")
                          }
                          const title = this.create("input/text", content)
                          title.input.placeholder = "Titel"
                          title.input.maxLength = "55"
                          title.input.setAttribute("required", "true")
                          const h1 = document.querySelector("h1")
                          if (h1) title.input.value = h1.textContent
                          const description = this.create("input/textarea", content)
                          description.input.placeholder = "Beschreibung"
                          description.input.maxLength = "144"
                          description.input.setAttribute("required", "true")
                          const h2 = document.querySelector("h2")
                          if (h2) description.input.value = h2.textContent
                          const funnelSelect = this.create("input/select", content)
                          funnelSelect.input.setAttribute("required", "true")
                          funnelSelect.addOption("Wähle einen Funnel")
                          post("/jwt/get/funnel/").then(res => {
                            if (res.status === 200) {
                              const funnel = JSON.parse(res.response)
                              funnel.forEach(it => funnelSelect.addOption(it.id, it.created))
                              if (feedFunnel) {
                                funnelSelect.selectByValue([feedFunnel])
                                this.verify("input/value", funnelSelect.input)
                              }
                            }
                          })
                          const algoSelect = this.create("input/select", content)
                          algoSelect.input.setAttribute("required", "true")
                          algoSelect.addOption("Wähle einen Algorithmus")
                          algoSelect.addOption("shuffle", "shuffle")
                          if (feedAlgo) {
                            algoSelect.selectByText([feedAlgo])
                          }
                          this.verify("inputs", content)
                          const submit = action("Feed jetzt erstellen", content)
                          submit.onclick = async () => {
                            await this.verify("funnel", content)
                            const feedTitle = title.input.value
                            const feedDescription = description.input.value
                            const feedFunnel = funnelSelect.input.value
                            const feedAlgo = algoSelect.input.value
                            if (!h1) this.render("text/h1", feedTitle, document.body)
                            this.render("text/title", feedTitle, document.head)
                            if (!h2) this.render("text/h2", feedDescription, document.body)
                            const script = document.createElement("script")
                            script.id = "feed"
                            script.src = `/js/${script.id}.js`
                            script.type = "module"
                            script.setAttribute("funnel", feedFunnel)
                            script.setAttribute("algo", feedAlgo)
                            Helper.add("script-onbody", script)
                            this.remove("overlays")
                          }
                        })
                        return
                      }
                      if (path === "submit-to-ids.js") {
                        Helper.overlay("pop", o3 => {
                          const content = o3.content
                          const selectorField = Helper.create("input/text", content)
                          selectorField.input.placeholder = "Selector zu deinem Funnel"
                          selectorField.input.setAttribute("required", "true")
                          Helper.verify("input/value", selectorField.input)
                          const contactsSelect = Helper.create("input/contacts", content)
                          Helper.add("style/not-valid", contactsSelect.input)
                          const submit = Helper.div("action", content)
                          submit.textContent = "Skript jetzt anhängen"
                          submit.onclick = async () => {

                            await Helper.verify("input/value", selectorField.input)
                            const selector = selectorField.input.value
                            const ids = contactsSelect.selectedIds()
                            if (ids.length <= 0) {
                              Helper.add("style/not-valid", contactsSelect.input)
                              return
                            }
                            const script = document.createElement("script")
                            script.id = "submit-to-ids"
                            script.src = `/js/${script.id}.js`
                            script.type = "module"
                            script.setAttribute("funnel", selector)
                            script.setAttribute("ids", ids.join(","))
                            Helper.add("script-onbody", script)
                            window.alert("Skript wurde erfolgreich angehängt.")
                            Helper.remove("overlays")
                          }
                        })
                        return
                      }
                      window.alert("Skript erfolgreich angehängt.")
                      const script = Helper.create("script/id", id)
                      Helper.add("script-onbody", script)
                    }
                  })
                } catch (error) {
                  div.textContent = "Keine Skripte gefunden"
                }
              })
            })
          }
        }
        {
          const button = this.create("button/left-right", buttons)
          button.left.textContent = ".share"
          button.right.textContent = "Sende diese URL an dein Netzwerk"
          button.onclick = async () => {
            try {
              await navigator.share({
                url: window.location.href
              })
              console.log("URL share successfully");
            } catch (err) {
              console.error(err)
            }
          }
        }

        {
          const button = this.render("button/left-right", {left: ".start", right: "Schnell zum Start zurück"}, buttons)
          button.addEventListener("click", async () => window.open("/", "_blank"))
        }

        const videoButton = this.render("button/left-right", {left: ".video", right: "Schnell und einfach Videos bearbeiten"}, buttons)
        videoButton.onclick = () => {

          this.overlay("pop", async o2 => {
            const content = o2.content
            const fileInput = this.create("input/file", content)
            const videoDiv = this.div("mlr34 mtb21", content)
            const video = document.createElement("video")
            video.controls = true
            video.className = "w100p"
            fileInput.oninput = ev => {
              const file = ev.target.files[0]
              video.src = URL.createObjectURL(file)
              this.append(video, videoDiv)
            }
          })
        }

      })
    }
    if (event === "pop") {
      const overlay = this.create("div/overlay")
      overlay.addButton = button.div("add")
      overlay.addInfo = text => {
        overlay.info.textContent = text
        this.append(overlay.info, overlay)
      }
      overlay.alert = {}
      overlay.alert.nok = () => window.alert("Fehler.. Bitte wiederholen.")
      overlay.alert.ok = (msg) => {
        let message = "Daten erfolgreich gespeichert."
        if (msg) message = msg
        window.alert(message)
      }
      overlay.alert.removed = () => window.alert("Daten erfolgreich entfernt.")
      overlay.alert.saved = () => window.alert("Daten erfolgreich gespeichert.")
      overlay.alert.sent = () => window.alert("Daten erfolgreich gesendet.")
      overlay.aliasIt = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".alias"
        button.right.textContent = "Verwende einen alternativen Namen"
        button.onclick = () => {
          this.overlay("pop", o1 => {
            if (it.alias) o1.info.textContent = it.alias
            const funnel = o1.content
            const aliasField = this.create("input/text", funnel)
            aliasField.input.placeholder = "Alternativer Name"
            aliasField.input.setAttribute("required", "true")
            aliasField.input.setAttribute("accept", "text/length")
            aliasField.input.maxLength = "55"
            if (it.alias !== undefined) {
              aliasField.input.value = it.alias
            }
            this.verify("input/value", aliasField.input)
            aliasField.input.oninput = () => this.verify("input/value", aliasField.input)
            const submit = this.create("button/action", funnel)
            this.add("hover-outline", submit)
            submit.textContent = "Alias jetzt speichern"
            submit.onclick = async () => {
              await this.verify("input/value", aliasField.input)
              overlay.registerKey(it, {alias: aliasField.input.value})
              overlay.tabs.meine.click()
              o1.remove()
              o.remove()
            }
          })
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.appendAddButton = () => {
        this.add("hover-outline", overlay.addButton)
        this.append(overlay.addButton, overlay)
        return overlay.addButton
      }
      overlay.appendHtml = (it, node, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".append"
        button.right.textContent = "HTML anhängen"
        button.onclick = async () => {
          const parser = document.createElement("div")
          parser.innerHTML = await this.convert("text/purified", it.html)
          parser.firstChild.textContent = this.convert("text/prompt", parser.firstChild.textContent)
          node.appendChild(parser.firstChild)
          o.remove()
          overlay.remove()
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.appendPdf = (it, node, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".append"
        button.right.textContent = "PDF anhängen"
        button.onclick = async () => {
          const fragment = document.createDocumentFragment()
          const pdf = await this.render("pdf", it.url, fragment)
          node.appendChild(fragment)
          o.remove()
          overlay.remove()
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.appendText = (it, node, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".appendTextContent"
        button.right.textContent = "Inhalt anhängen"
        button.onclick = async () => {
          const parser = document.createElement("div")
          parser.innerHTML = await this.convert("text/purified", it.html)
          parser.firstChild.textContent = this.convert("text/prompt", parser.firstChild.textContent)
          node.append(parser.firstChild.textContent)
          o.remove()
          overlay.remove()
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.appendScript = (it, node, o) => {
        const button = this.create("button/left-right", o.content)
        button.left.textContent = ".append-once"
        button.right.textContent = "Element wird überschrieben oder angehängt"
        button.addEventListener("click", async ev => {
          const html = await this.convert("text/script", it.html)
          html.id = it.id
          this.add("onbody-once", html)
          o.remove()
          overlay.remove()
        })
        return button
      }
      overlay.content = this.create("div/scrollable", overlay)
      overlay.append = node => {
        if (node) this.append(node, overlay.content)
      }
      overlay.appendButton = (it, node, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".append"
        button.right.textContent = "Daten anhängen"
        button.onclick = async ev => {
          const button = await overlay.createItButton(it)
          node.appendChild(button)
          overlay.remove()
          o.remove()
        }
        o.append(fragment)
        return button
      }
      overlay.appendImage = (it, node, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".append"
        button.right.textContent = "Image anhängen"
        button.onclick = async () => {

          this.render("img/div", it.url, node)
          o.remove()
          overlay.remove()
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.appendImageSrcToBody = (src, o) => {
        const isToolbox = window.location.pathname.split("/")[3]
        if (isToolbox) {
          const button = this.render("button/left-right", {left: ".append", right: "Bild anhängen"}, o.content)
          button.onclick = () => {
            const div = this.div("", document.body)
            this.render("img", {src, className: "image"}, div)
            this.remove("overlays")
          }
        }
      }
      overlay.appendIt = (it, node, o, ok) => {
        const button = this.create("button/left-right")
        o.append(button)
        button.left.textContent = ".append"
        button.right.textContent = "Datei anhängen"
        button.onclick = () => {

          this.append(it, node)
          o.remove()
          if (ok) ok()
        }
        return button
      }
      overlay.closeStream = stream => {
        if (stream) {
          const tracks = stream.getTracks()
          tracks.forEach(track => track.stop())
        }
      }
      overlay.closeVideoStream = video => {
        overlay.closeStream(video.srcObject)
      }
      overlay.copyHtml = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".copy"
        button.right.textContent = "HTML in deiner Zwischenablage speichern"
        button.onclick = async () => {
          const parser = document.createElement("div")
          parser.innerHTML = await this.convert("text/purified", it.html)
          parser.firstChild.textContent = this.convert("text/prompt", parser.firstChild.textContent)
          navigator.clipboard.writeText(parser.firstChild.outerHTML).then(() => window.alert("Dein Template wurde erfolgreich in deine Zwischablage gespeichert."))
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.copyText = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".copyTextContent"
        button.right.textContent = "Inhalt in deiner Zwischenablage speichern"
        button.onclick = async () => {
          const parser = document.createElement("div")
          parser.innerHTML = await this.convert("text/purified", it.html)
          parser.firstChild.textContent = this.convert("text/prompt", parser.firstChild.textContent)
          navigator.clipboard.writeText(parser.firstChild.textContent).then(() => window.alert("Dein Template wurde erfolgreich in deine Zwischablage gespeichert."))
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.copyToClipboard = (text, o) => {
        const button = this.render("button/left-right", {left: ".copy", right: "Pfad kopieren"}, o.content)
        button.onclick = () => {
          navigator.clipboard.writeText(text).then(overlay.alert.saved).catch(overlay.alert.nok)
        }
      }
      overlay.download = (file, o, ok) => {

        const button = this.create("button/left-right", o.content)
        button.right.textContent = "Speicher auf deinem Gerät"
        button.left.textContent = ".download"
        button.onclick = () => {

          const url = URL.createObjectURL(file)
          const link = document.createElement('a')
          link.href = url
          link.download = file.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          o.remove()
          if (ok) ok()
        }
      }
      overlay.emailHtml = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".email"
        button.right.textContent = "Versende HTML per E-Mail"
        button.onclick = async () => {
          const parser = document.createElement("div")
          parser.innerHTML = await this.convert("text/purified", it.html)
          parser.firstChild.textContent = this.convert("text/prompt", parser.firstChild.textContent)
          const mailtoLink = `mailto:?body=${parser.firstChild.outerHTML}`
          const a = document.createElement("a")
          a.href = mailtoLink
          a.click()
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.emailText = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = Helper.create("button/left-right", fragment)
        button.left.textContent = ".emailTextContent"
        button.right.textContent = "Versende den Text Inhalt per E-Mail"
        button.onclick = async () => {
          const parser = document.createElement("div")
          parser.innerHTML = await Helper.convert("text/purified", it.html)
          parser.firstChild.textContent = this.convert("text/prompt", parser.firstChild.textContent)
          const mailtoLink = `mailto:?body=${parser.firstChild.textContent}`
          const a = document.createElement("a")
          a.href = mailtoLink
          a.click()
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.loading = this.create("div/loading")
      overlay.load = () => {
        this.append(overlay.loading, overlay.content)
      }
      overlay.ocr = (canvas, node, o, ok) => {
        async function convertCanvasToText(canvas) {
          try {
            const prompt = window.prompt("Gebe die Sprachen ein: (z.B., deu, eng, ..) - Drücke einfach Enter für Deutsch")
            let worker
            if (!Helper.verifyIs("text/empty", prompt)) {
              worker = await Tesseract.createWorker(prompt)
            } else {
              worker = await Tesseract.createWorker("deu")
            }
            const res = await worker.recognize(canvas)
            await worker.terminate()
            return res.data.text
          } catch (error) {
            window.alert(`Fehler bei der Texterkennung:\n\n${error}`)
          }
        }
        const button = Helper.create("button/left-right")
        o.append(button)
        button.right.textContent = "Exportiere Text aus deinem Bild in dein ausgewähltes Element"
        button.left.textContent = ".tesseract-ocr"
        button.onclick = async () => {
          await Helper.dynamicImport("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js", async() => {
            const text = await convertCanvasToText(canvas)
            const purified = await Helper.convert("text/purified", text)
            node.append(purified)
            o.remove()
            if (ok) ok()
          })
        }
      }
      overlay.openCam = (node, o) => {
        const button = this.create("button/left-right")
        o.append(button)
        button.left.textContent = ".camera"
        button.right.textContent = "Erschaffe einzigartige Bilder"
        button.onclick = ev => {

          this.overlay("pop", async o1 => {
            o1.removeOverlayButton.addEventListener("click", ev => {
              o1.closeVideoStream(video)
            })
            o1.info.textContent = `.choose.cam`
            const select = await this.create("select/cam")
            o1.append(select)
            select.input.oninput = ev => {
              o1.closeVideoStream(video)
              this.add("stream/cam", {deviceId: ev.target.value, video})
            }
            const preview = this.create("div", o1.content)
            this.style(preview, {margin: "21px 34px", borderRadius: "13px", overflow: "hidden"})
            const video = this.create("video", preview)
            o1.append(o1.addButton)
            o1.addButton.onclick = async ev => {
              if (video.srcObject) {
                const canvas = this.convert("video/canvas", video)
                const file = await this.convert("canvas/image", canvas)
                this.overlay("pop", o2 => {
                  overlay.appendIt(canvas, node, o2, () => {
                    o1.remove()
                    o.remove()
                    overlay.remove()
                  })
                  overlay.download(file, o2, () => {
                    o1.remove()
                    o.remove()
                  })
                  overlay.ocr(canvas, node, o2, () => {
                    overlay.remove()
                    o1.remove()
                    o.remove()
                  })
                })
                o1.closeVideoStream(video)
              }
            }
          })
        }
        return button
      }
      overlay.openMic = (node, o) => {
        const button = this.create("button/left-right")
        o.append(button)
        button.left.textContent = ".microfon"
        button.right.textContent = "Web Audio Recorder"
        button.onclick = ev => {

          this.overlay("pop", async o1 => {
            o1.removeOverlayButton.addEventListener("click", ev => {
              recorder.stop()
            })
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = this.add("recorder", {type: "audio/ogg"})
            this.style(recorder.controls, {position: "fixed", top: "0", right: "0"})
            o1.append(recorder.controls)
            recorder.start(stream, o1)
          })
        }
        return button
      }
      overlay.openVid = (node, o) => {
        const button = this.create("button/left-right")
        o.append(button)
        button.left.textContent = ".video"
        button.right.textContent = "Nehme den Moment auf"
        button.onclick = ev => {

          this.overlay("pop", async o1 => {
            o1.removeOverlayButton.addEventListener("click", ev => {
              o1.closeVideoStream(video)
            })
            o1.info.textContent = `.choose.cam`
            const select = await this.create("select/cam")
            o1.append(select)
            select.input.oninput = async ev => {
              o1.closeVideoStream(video)
              const stream = await this.add("stream/vid", {deviceId: ev.target.value, video})
              recorder.start(stream, o1)
            }
            const recorder = this.add("recorder", {type: "video/ogg"})
            this.style(recorder.controls, {position: "fixed", bottom: "0", right: "0"})
            const preview = this.create("div", o1.content)
            this.style(preview, {margin: "21px 34px", borderRadius: "13px", overflow: "hidden"})
            const video = this.create("video", preview)
          })
        }
        return button
      }
      overlay.openWindow = (it, o) => {
        const button = this.create("button/left-right")
        o.append(button)
        button.left.textContent = ".open"
        button.right.textContent = "Im neuen Tab öffnen"
        button.onclick = ev => {
          window.open(it.url, "_blank")
        }
        return button
      }
      async function renderBasedOnTab(array, node) {
        node.textContent = ""
        if (overlay.tabs && overlay.tabs.meine.style.borderRadius === "50%") {
          await renderItClosed(array, node)
        } else {
          await renderItOpen(array, node)
        }
      }
      overlay.titleIt = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".title"
        button.right.textContent = "Titel eingeben"
        button.onclick = () => {

          this.overlay("pop", o1 => {
            if (it.title) o1.info.textContent = it.title
            const funnel = o1.content
            const titleField = this.create("input/text", funnel)
            titleField.input.placeholder = "Titel"
            titleField.input.setAttribute("required", "true")
            titleField.input.setAttribute("accept", "text/length")
            titleField.input.maxLength = "89"
            if (it.title !== undefined) {
              titleField.input.value = it.title
            }
            this.verify("input/value", titleField.input)
            titleField.input.oninput = () => this.verify("input/value", titleField.input)
            const submit = this.create("button/action", funnel)
            submit.textContent = "Titel jetzt speichern"
            submit.onclick = async () => {
              await this.verify("input/value", titleField.input)
              overlay.registerKey(it, {title: titleField.input.value})
              overlay.tabs.meine.click()
              o1.remove()
              o.remove()
            }
          })
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.translateText = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".translate"
        button.right.textContent = "Sende deinen Inhalt an eine Übersetzungsmaschine"
        button.onclick = async () => {
          const parser = document.createElement("div")
          parser.innerHTML = await this.convert("text/purified", it.html)
          const textContent = this.convert("text/prompt", parser.firstChild.textContent)
          this.overlay("pop", o1 => {
            o1.info.textContent = `${textContent}.translate`
            const translations = [
              { name: "Google Translate", url: `https://translate.google.com/?sl=auto&tl=auto&text=${encodeURIComponent(textContent)}` },
              { name: "DeepL Translate", url: `https://www.deepl.com/translator#auto/auto/${encodeURIComponent(textContent)}` },
              { name: "Bing Translator", url: `https://www.bing.com/translator?from=auto&to=auto&text=${encodeURIComponent(textContent)}` },
              { name: "Yandex Translate", url: `https://translate.yandex.com/?lang=auto-auto&text=${encodeURIComponent(textContent)}` }
            ]
            for (let i = 0; i < translations.length; i++) {
              const it = translations[i]
              const button = this.create("button/left-right", o1.content)
              button.left.textContent = it.name
              button.onclick = () => {
                window.open(it.url, "_blank")
              }
            }
          })
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.shebang = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = "#!/bin/bash"
        button.right.textContent = "Lade eine .sh Datei herunter"
        button.onclick = async () => {
          const parser = document.createElement("div")
          parser.innerHTML = await this.convert("text/purified", it.html)
          const shebang = "#!/bin/bash\n"
          const scriptContent = shebang + this.convert("text/prompt", parser.firstChild.textContent)
          await this.downloadFile(scriptContent, "text/x-sh")
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.sharePdf = (it, o) => {
        const fragment = document.createDocumentFragment()
        function extractCid(url) {
          const cidPattern = /ipfs\/([^/]+)/
          const match = url.match(cidPattern)
          if (match && match[1]) {
            return match[1]
          }
        }
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".share"
        button.right.textContent = "Teile dein PDF mit deinem Netzwerk"
        button.onclick = async () => {
          if (navigator.share) {
            const cid = extractCid(it.url)
            await navigator.share({text: `${window.location.protocol}//${window.location.host}/ipfs/${cid}/`})
          } else {
            window.alert("Brower wird nicht unterstützt.")
          }
        }
        o.content.appendChild(fragment)
        return button
      }
      function updateSearchField(array, node){
        if (overlay.input && overlay.filter) {
          let filtered
          overlay.input.oninput = async ev => {
            const query = ev.target.value
            if (!Helper.verifyIs("text/empty", query)) {
              const highlighted = Helper.sort("query", {array, query, filter: overlay.filter})
              await renderBasedOnTab(highlighted, node)
            } else {
              await renderBasedOnTab(array, node)
            }
          }
        }
      }
      overlay.updateItOpen = async () => {
        if (!overlay.it || !overlay.rerender) return
        this.reset("node", overlay.rerender)
        const loader = this.create("div/loading", overlay.rerender)
        const res = await this.request(`/get/open/${overlay.it}/`)
        loader.remove()
        if (res.status === 200) {
          const it = JSON.parse(res.response)
          updateSearchField(it, overlay.rerender)
          renderItOpen(it, overlay.rerender)
        } else {
          this.render("text/note", "Keine Daten gefunden", overlay.rerender)
        }
      }
      function styleDefaultList(node) {
        node.textContent = ""
        node.removeAttribute("style")
        node.removeAttribute("class")
        node.style.margin = "21px 34px"
      }
      async function renderItOpen(array, node) {
        styleDefaultList(node)
        if (overlay.rerenderStyle) overlay.rerenderStyle(node)
        node.style.wordBreak = "break-word"
        for (let i = 0; i < array.length; i++) {
          const it = array[i]
          const button = await overlay.createItButton(it)
          node.appendChild(button)
          button.onclick = async () => {
            await overlay.openOptions(it)
          }
        }
      }
      overlay.style.opacity = 0
      overlay.info = this.create("div/info")
      overlay.closeSocket = (socket) => {
        overlay.removeOverlayButton.addEventListener("click", () => {
          socket.close()
        })
      }
      overlay.onlyClosedUser = () => {
        this.request("/verify/user/closed/").then(res => {
          if (res.status !== 200) {
            const confirm = window.confirm("Um die folgenden Funktionen nutzen zu können, musst du dich anmelden.\n\nMöchtest du dich jetzt anmelden?")
            if (confirm === true) {
              overlay.remove()
              const a = document.createElement("a")
              a.href = "/login/"
              a.target = "_blank"
              //a.rel = "noopener noreferrer"
              a.click()
              //window.open("/login/", "_blank")
            } else {
              overlay.remove()
            }
          }
        })
      }
      overlay.addRegisterHtmlButton = type => {
        return overlay.registerHtmlButton(type)
      }
      overlay.registerHtmlButton = type => {
        if (type === "expert") {
          const btn = button.div("save")
          btn.onclick = () => this.add("register-html")
          this.append(btn, overlay)
          return btn
        }
      }
      overlay.registerIt = (update) => {
        return new Promise(async(resolve, reject) => {
          try {
            this.overlay("lock", async o => {
              const res = await this.request(`/jwt/register/user/${overlay.it}/`, {[overlay.it]: update})
              if (res.status === 200) {
                o.alert.saved()
                overlay.tabs.meine.click()
              } else {
                o.alert.nok()
              }
              o.remove()
              resolve(res)
            })
          } catch (error) {
            reject(error)
          }
        })
      }
      overlay.registerKey = (it, key) => {
        return new Promise(async(resolve, reject) => {
          try {
            this.overlay("lock", async securityOverlay => {
              const keyName = Object.keys(key)[0]
              const keyValue = key[keyName]
              const res = await this.request(`/jwt/update/${overlay.it}/${keyName}/`, {created: it.created, [keyName]: keyValue})
              if (res.status === 200) {
                window.alert("Daten erfolgreich gespeichert.")
                overlay.tabs.meine.click()
                securityOverlay.remove()
              } else {
                window.alert("Fehler.. Bitte wiederholen.")
                securityOverlay.remove()
              }
              resolve(res)
            })
          } catch (error) {
            reject(error)
          }
        })
      }
      overlay.removeIt = (it, o) => {
        const fragment = document.createDocumentFragment()
        const button = this.create("button/left-right", fragment)
        button.left.textContent = ".remove"
        button.right.textContent = "Daten entfernen"
        button.onclick = ev => {
          const confirm = window.confirm("Möchtest du deine Daten wirklich entfernen?")
          if (confirm === true) {
            this.overlay("lock", async o1 => {
              const res = await this.request(`/jwt/remove/user/${overlay.it}/item/`, {created: it.created})
              if (res.status === 200) {
                o1.alert.removed()
                overlay.tabs.meine.click()
                o.remove()
              } else {
                o1.alert.nok()
              }
              o1.remove()
            })
          }
        }
        o.content.appendChild(fragment)
        return button
      }
      overlay.removeOverlayButton = button.append("remove-overlay", overlay)
      overlay.removeOverlayButton.onclick = () => overlay.remove()
      overlay.renderTabs = () => {
        overlay.tabs = this.render("tabs", "Alle Meine", overlay.content)
      }
      overlay.visibility = (it, o) => {
        const button = this.create("visibility-button", o.content)
        button.addEventListener("click", ev => {

          this.overlay("pop", o1 => {
            o1.info.textContent = `${it.id}.${it.visibility}`
            const content = o1.content
            const field = this.create("input/select", content)
            field.input.add(["closed", "open"])
            if (it.visibility) {
              field.input.value = it.visibility
            }
            this.add("style/valid", field.input)
            field.input.addEventListener("input", ev => {
              const visibility = field.input.value
              this.overlay("lock", async o2 => {
                const res = await this.request(`/jwt/update/${overlay.it}/visibility/`, {created: it.created, visibility})
                if (res.status === 200) {
                  o2.alert.saved()
                  if (it.visibility === "closed") {
                    overlay.tabs.alle.click()
                  } else {
                    overlay.tabs.meine.click()
                  }
                  o1.remove()
                  o.remove()
                } else {
                  o2.alert.nok()
                }
                o2.remove()
              })

            })
            this.render("text/h3", "Mehr Info:", content)
            this.render("text/p", "open - Sichtbar für alle", content)
            this.render("text/p", "closed - Sichtbar nur für dich", content)
          })
        })
      }
      callback(overlay)
      document.body.appendChild(overlay)
      overlay.classList.add("fade-up")
      if (overlay.tabs) {
        overlay.tabs.meine.addEventListener("click", () => {
          overlay.updateItClosed()
          Helper.remove("style/selected", overlay.tabs.alle)
          Helper.add("style/selected", overlay.tabs.meine)
        })
        overlay.tabs.alle.addEventListener("click", () => {
          overlay.updateItOpen()
          Helper.remove("style/selected", overlay.tabs.meine)
          Helper.add("style/selected", overlay.tabs.alle)
        })
        Helper.add("style/selected", overlay.tabs.alle)
      }
      async function renderItClosed(array, node) {
        styleDefaultList(node)
        if (overlay.rerenderStyle) overlay.rerenderStyle(node)
        node.style.wordBreak = "break-word"
        for (let i = 0; i < array.length; i++) {
          const it = array[i]
          const button = await overlay.createItButton(it)
          node.appendChild(button)
          button.onclick = async () => {
            await overlay.closedOptions(it)
          }
        }
      }
      overlay.updateIt = (it, update) => {
        return new Promise(async(resolve, reject) => {
          try {
            this.overlay("lock", async securityOverlay => {
              const res = await this.request(`/update/user/${overlay.it}/`, {created: it.created, [overlay.it]: update})
              if (res.status === 200) {
                window.alert("Daten erfolgreich gespeichert.")
                overlay.tabs.meine.click()
                securityOverlay.remove()
              } else {
                window.alert("Fehler.. Bitte wiederholen.")
                securityOverlay.remove()
              }
              resolve(res)
            })
          } catch (error) {
            reject(error)
          }
        })
      }
      overlay.updateItOpen()
      overlay.updateItClosed = async () => {
        if (!overlay.it || !overlay.rerender) return
        this.reset("node", overlay.rerender)
        const loader = this.create("div/loading", overlay.rerender)
        const res = await this.request(`/jwt/get/user/${overlay.it}/`)
        loader.remove()
        if (res.status === 200) {
          const it = JSON.parse(res.response)
          updateSearchField(it, overlay.rerender)
          await renderItClosed(it, overlay.rerender)
        } else {
          this.render("text/note", "Keine Daten gefunden", overlay.rerender)
        }
      }
      overlay.upload = (type, o) => {
        const button = this.create("button/left-right")
        o.append(button)
        button.left.textContent = ".upload"
        button.right.textContent = "Lade eine URL-Datei hoch"
        button.onclick = ev => {

          this.overlay("pop", async o1 => {
            o1.info.textContent = `.upload`
            const funnel = this.render("upload", type, o1)
            funnel.submit.onclick = async () => {
              await this.verify("input/value", funnel.url.input)
              const res = await overlay.registerIt({url: funnel.url.input.value})
              if (res.status === 200) {
                o1.remove()
                o.remove()
              }
            }
          })
        }
        return button
      }
      return overlay
    }
    if (event === "lock") {
      return this.overlay("pop", async o1 => {
        o1.load()
        o1.removeOverlayButton.remove()
        o1.className = "overlay flex align center"
        if (callback) await callback(o1)
      })
    }
    if (event === "select-template") {
      this.overlay("pop", async overlay => {
        async function renderTemplates(templates, node) {
          Helper.convert("parent/scrollable", node)
          for (let i = 0; i < templates.length; i++) {
            const template = templates[i]
            const fragment = document.createDocumentFragment()
            const templateButton = Helper.create("button/left-right", fragment)
            templateButton.left.innerHTML = await Helper.convert("text/purified", template.html)
            templateButton.right.style.fontSize = "21px"
            templateButton.onclick = () => {
              const textContent = Helper.convert("text/prompt", templateButton.left.textContent)
              callback(textContent)
              overlay.remove()
            }
            node.appendChild(fragment)
          }
        }
        const searchField = this.create("input/text", overlay)
        searchField.input.placeholder = "Suche nach Text in deinem Template"
        searchField.style.margin = "21px 34px"
        this.verify("input/value", searchField.input)
        this.add("hover-outline", searchField.input)
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
            await renderTemplates(highlighted, contactsDiv)
          }
          await renderTemplates(templates, contactsDiv)
        } else {
          this.convert("parent/info", contactsDiv)
          contactsDiv.textContent = "Keine Templates gefunden"
        }
      })
    }
  }
  static render(event, input, parent) {
    if (event === "a") {
      const {className, href, target, text} = input
      const a = document.createElement("a")
      a.className = className
      a.textContent = text
      a.href = href
      a.target = target
      this.add("hover-outline", a)
      if (parent) this.append(a, parent)
      return a
    }
    if (event === "audio") {
      const audio = document.createElement("audio")
      this.append(audio, parent)
      audio.width = "100%"
      audio.controls = true
      audio.src = input
      return audio
    }
    if (event === "button/action") {
      const button = this.create("button/action")
      button.textContent = input
      if (parent) this.append(button, parent)
      return button
    }
    if (event === "button/feedback") {
      const {it, i} = input
      const div = Helper.div("flex align space-between")
      Helper.add("hover-outline", div)
      const isOdd = i % 2 === 0
      const isEven = i % 2 === 1
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (isOdd) {
          div.style.background = Helper.colors.light.foreground
          div.style.color = Helper.colors.light.text
        } else {
          div.style.background = Helper.colors.dark.foreground
          div.style.color = Helper.colors.dark.text
        }
      } else {
        if (isEven) {
          div.style.background = Helper.colors.light.foreground
          div.style.color = Helper.colors.light.text
        } else {
          div.style.background = Helper.colors.dark.foreground
          div.style.color = Helper.colors.dark.text
        }
      }
      const left = document.createElement("span")
      left.textContent = `${Helper.convert("millis/dd.mm.yyyy hh:mm", it.created)}`
      this.append(left, div)
      const nextToLeft = document.createElement("span")
      nextToLeft.style.width = "100%"
      nextToLeft.style.padding = "8px"
      nextToLeft.textContent = it.text
      this.append(nextToLeft, div)
      const right = document.createElement("span")
      right.style.padding = "13px"
      right.textContent = it.importance
      this.append(right, div)
      if (parent) this.append(div, parent)
      return div
    }
    if (event === "button/login") {
      const button = this.create("button/left-right")
      button.left.textContent = ".login"
      button.right.textContent = "Dein Zugang zur personalisierten Erfahrung"
      button.onclick = () => {
        window.open(input, "_blank")
      }
      if (parent) this.append(button, parent)
      return button
    }
    if (event === "button/left-right") {
      const button = this.create("button/left-right")
      button.left.textContent = input.left
      button.right.textContent = input.right
      if (parent) this.append(button, parent)
      return button
    }
    if (event === "button/role") {
      const {name} = input
      const button = this.create("button/left-right")
      button.classList.add("role-button")
      button.left.textContent = name
      button.left.classList.add("left")
      button.right.textContent = "Auswählen"
      button.right.classList.add("right")
      button.onclick = () => {

        parent.querySelectorAll(".role-button").forEach(button => {

          const right = button.querySelector(".right")
          this.convert("element/button-right", right)
          right.textContent = "Rolle"
        })
        this.convert("element/checked", button.right)
        const script = document.createElement("script")
        script.id = "role-apps"
        script.type = "module"
        script.src = "/js/role-apps.js"
        script.setAttribute("role-id", input.created)
        script.setAttribute("role-name", input.name)
        this.add("script-onbody", script)
        this.remove("overlays")
      }
      if (parent) this.append(button, parent)
      return button
    }
    if (event === "box/video") {
      const box = this.div("fs21 sans-serif relative br13 m8 p8 min-w55 btn-theme")
      box.video = document.createElement("video")
      box.video.id = escapeCSSId(input)
      box.video.autoplay = true
      box.video.controls = true
      box.video.style.width = "100%"
      this.append(box.video, box)
      box.info = this.div("flex align between", box)
      box.text = this.div("nowrap of-auto", box.info)
      box.text.textContent = input
      box.status = this.div("flex align center w34 h34 br50p", box.info)
      box.updateStatus = () => {

        if (box.video.srcObject) {
          box.status.textContent = "on"
          this.classes(box.status, {add: "bg-green"})
        } else {
          box.status.textContent = "off"
          this.classes(box.status, {add: "bg-red"})
        }
      }
      if (parent) this.append(box, parent)
      return box
    }
    if (event === "class/once") {
      const classes = Array.from(input.classList)
      const classExist = Array.from(parent.querySelectorAll("*")).some(node => {
        classes.some(className => node.classList.contains(className))
      })
      if (!classExist) this.append(input, parent)
    }
    if (event === "classes") {
      input.split(" ").forEach(name => parent.classList.add(name))
    }
    if (event === "div/mailto") {
      const regex = /mailto:(.*)\?/
      const match = input.match(regex)
      if (match && match[1]) {
        const email = match[1]
        const div = this.div("mtb21 mlr34")
        div.a = document.createElement("a")
        this.append(div.a, div)
        div.a.className = "link-theme"
        div.a.textContent = email
        div.a.href = input
        this.add("hover-outline", div.a)
        if (parent) this.append(div, parent)
        return div
      }
    }
    if (event === "upload") {
      const fragment = document.createDocumentFragment()
      const funnel = this.create("div", fragment)
      funnel.url = this.create("input/text", funnel)
      funnel.url.input.setAttribute("required", "true")
      funnel.url.input.setAttribute("accept", "text/url")
      funnel.url.input.placeholder = "https://www.meine-domain.de/mein/pfad.."
      funnel.url.input.oninput = () => this.verify("input/value", funnel.url.input)
      this.verify("input/value", funnel.url.input)
      funnel.submit = this.create("button/action", funnel)
      funnel.submit.textContent = "Datei jetzt speichern"
      funnel.file = this.create("input/file", funnel)
      funnel.file.input.setAttribute("accept", input)
      this.add("style/not-valid", funnel.file.input)
      funnel.file.input.oninput = async ev => {

        const securityOverlay = this.overlay("lock")
        let file = ev.target.files[0]
        if (file.type.startsWith("image/")) file = await this.remove("exif", file)
        console.log(file)
        const formdata = new FormData()
        formdata.append("file", file, file.name)
        this.add("style/valid", funnel.file.input)
        const res = await postFormData("/upload/file/", formdata)
        securityOverlay.remove()
        if (res.status === 200) {
          const data = res.response
          funnel.url.input.value = data
          this.verify("input/value", funnel.url.input)
          if (input === "application/pdf") {
            preparePreview()
            this.style(funnel.preview, {margin: "21px 34px"})
            await this.render("pdf", data, funnel.preview)
            return
          }
          if (input.startsWith("image/")) {
            const img = document.createElement("img")
            img.src = data
            img.style.width = "100%"
            preparePreview()
            funnel.preview.appendChild(img)
            return
          }
        } else {
          this.render("style/not-valid", funnel.file.input)
          console.error('Error uploading file:', error)
        }
        function preparePreview() {
          funnel.preview.textContent = ""
          funnel.preview.style.margin = "21px 34px"
        }
      }
      funnel.preview = this.create("div", funnel)
      if (parent) {
        if (parent.content) {
          parent.content.appendChild(fragment)
        } else {
          parent.appendChild(fragment)
        }
      }
      return funnel
    }
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
                this.overlay("pop", updateButtonsOverlay => {
                  const buttons = this.create("div/scrollable", updateButtonsOverlay)
                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.textContent = ".update"
                    button.onclick = () => {
                      this.overlay("pop", async overlay => {
                        this.render("text/h1", `${this.convert("text/capital-first-letter", input.tag)}-${i + 1}`, overlay)
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
                          this.overlay("lock", async securityOverlay => {
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
                      this.overlay("lock", async securityOverlay => {
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
        this.add("hover-outline", select)


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
            this.add("hover-outline", tel)

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
        const title = this.render("text/h1", `${Number(item.price).toFixed(2).replace(".", ",")} €`, right)
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
    if (event === "html/div") {
      const div = document.createElement("div")
      this.convert("text/purified", input).then(purified => div.innerHTML = purified)
      if (parent) this.append(div, parent)
      return div
    }
    if (event === "html/h1") {
      const h1 = document.createElement("h1")
      this.convert("text/purified", input).then(purified => h1.innerHTML = purified)
      if (parent) this.append(h1, parent)
      return h1
    }
    if (event === "html/p") {
      const p = document.createElement("p")
      this.convert("text/purified", input).then(purified => p.innerHTML = purified)
      if (parent) this.append(p, parent)
      return p
    }
    if (event === "html/span") {
      const span = document.createElement("span")
      this.convert("text/purified", input).then(purified => span.innerHTML = purified)
      if (parent) this.append(span, parent)
      return span
    }
    if (event === "icon/path") {
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
    if (event === "img/box") {
      const fragment = document.createDocumentFragment()
      const box = this.create("div", fragment)
      this.style(box, {width: "233px", height: "144px", margin: "21px"})
      this.convert("parent/box", box)
      const img = this.render("img", {src: input, className: "image"}, box)
      this.style(img, {borderRadius: "5px", width: "100%"})
      parent?.appendChild(fragment)
      return box
    }
    if (event === "img") {
      const img = document.createElement("img")
      img.className = input.className
      img.src = input.src
      if (parent) this.append(img, parent)
      return img
    }
    if (event === "img/div") {
      const fragment = document.createDocumentFragment()
      const box = this.create("div", fragment)
      this.style(box, {margin: "21px 34px"})
      const img = this.render("img", {src: input, className: "image"}, box)
      this.style(img, {borderRadius: "5px", width: "100%"})
      parent?.appendChild(fragment)
      return box
    }
    if (event === "image-url/selector/self") {
      return new Promise(async(resolve, reject) => {
        try {
          const parentNode = document.querySelector(parent)
          if (parentNode === null) throw new Error("selector not found")
          const res = await this.request("/jwt/get/tree/", {tree: input})
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

        this.overlay("lock", async securityOverlay => {

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
    if (event === "key-value") {
      const div = Helper.div("flex mtb21 mlr34")
      div.key = Helper.div("flex align center", div)
      div.key.textContent = input.key
      div.value = Helper.div("ml8 fs21", div)
      div.value.textContent = input.value
      if (parent) this.append(div, parent)
      return div
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
                Helper.add("hover-outline", websiteNode)
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
      const {user, keys} = input
      this.convert("parent/scrollable", parent)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const keysButton = this.render("button/left-right", {left: `.${key}`}, parent)
        keysButton.onclick = () => {

          this.overlay("pop", o1 => {
            o1.info.textContent = `${user.email}/keys/${key}`
            const content = o1.content

            const bodyButton = this.render("button/left-right", {left: ".body", right: "Datensatz Inhalt"}, content)
            bodyButton.onclick = () => {

              this.overlay("pop", async o2 => {
                o2.load()
                o1.info.textContent = `${user.email}/keys/${key}/body`
                const content = o2.content
                const res = await this.request("/jwt/get/key-admin/", {id: user.id, key})
                if (res.status === 200) {

                  let body
                  try {
                    body = JSON.parse(res.response)
                  } catch (error) {
                    body = res.response
                  }
                  this.convert("parent/scrollable", content)

                  if (typeof body === "boolean") {

                    const boolField = this.create("input/bool", content)
                    boolField.setInput(body)
                    boolField.input.addEventListener("input", () => {

                      this.overlay("lock", async o5 => {
                        const bool = boolField.input.value === "true"
                        const res = await this.request("/update/user/bool-tree-admin/", {bool, id: user.id, tree: key})
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

                    const numberField = this.create("input/tel", content)
                    numberField.input.placeholder = "Dieser Datensatz enthält eine Nummer"
                    numberField.input.style.fontFamily = "monospace"
                    numberField.input.style.fontSize = "13px"
                    numberField.input.setAttribute("required", "true")
                    numberField.input.setAttribute("accept", "text/number")
                    numberField.input.value = body
                    this.verify("input/value", numberField.input)
                    const submit = this.create("button/action", content)
                    submit.textContent = "Nummer jetzt speichern"
                    submit.onclick = async () => {

                      await this.verify("input/value", numberField.input)
                      const number = numberField.input.value
                      this.overlay("lock", async o3 => {
                        const res = await this.request("/update/user/number-tree-admin/", {number, id: user.id, tree: key})
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

                    const textField = this.create("input/textarea", content)
                    textField.input.placeholder = "Dieser Datensatz enthält eine Zeichenkette"
                    textField.input.style.height = "55vh"
                    textField.input.style.fontFamily = "monospace"
                    textField.input.style.fontSize = "13px"
                    textField.input.value = body
                    this.verify("input/value", textField.input)
                    const submit = this.create("button/action", content)
                    submit.textContent = "Datensatz jetzt speichern"
                    submit.onclick = () => {

                      const text = textField.input.value
                      this.overlay("lock", async o3 => {
                        const res = await this.request("/update/user/text-tree-admin/", {text, id: user.id, tree: key})
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
                    this.render(event, {user: user, keys}, content)
                  }

                } else {
                  this.convert("parent/info", content)
                  content.textContent = "Dieser Datensatz ist leer."
                }
              })
            }

            const keyButton = this.render("button/left-right", {left: ".key", right: "Schlüssel Name ändern"}, content)
            keyButton.onclick = () => {

              this.overlay("pop", async o2 => {
                o2.info.textContent = `${user.email}/${key}`
                const content = o2.content
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
                  this.overlay("lock", async o3 => {
                    const res = await this.request("/update/user/key-name-tree-admin/", {name: textField.input.value, id: user.id, tree: key})
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

            const removeButton = this.render("button/left-right", {left: ".remove", right: "Datensatz entfernen"}, content)
            removeButton.onclick = () => {

              const confirm = window.confirm("Du bist gerade dabei einen Datensatz aus der persönlichen Datenbank des Nuzters zu löschen. Diese Daten werden gelöscht und können nicht mehr wiederhergestellt werden.\n\nMöchtest du diesen Datensatz wirklich löschen?")
              if (confirm === true) {
                this.overlay("lock", async o2 => {
                  const res = await this.request("/remove/user/tree-admin/", {tree: key, id: user.id})
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
    if (event === "label") {
      const it = document.createElement("label")
      it.className = "mlr34 sans-serif fs21 color-theme block break-word"
      it.setAttribute("for", input.for)
      it.textContent = input.text
      if (parent) this.append(it, parent)
      return it
    }
    if (event === "match-maker/buttons") {
      parent.textContent = ""
      for (let i = 0; i < input.length; i++) {
        const matchMaker = input[i]
        console.log(matchMaker);
        const button = this.render("button/left-right", {left: matchMaker.name, right: `vor ${this.convert("millis/since", matchMaker.created)}`}, parent)
        button.onclick = () => {

          this.overlay("pop", async o1 => {
            o1.addInfo(matchMaker.name)
            const content = o1.content

            {
              const button = this.create("button/left-right", content)
              button.left.textContent = ".action"
              button.right.textContent = "Optimiere deinen Match Maker"
              button.onclick = () => {

                this.overlay("pop", overlay => {
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
                        this.add("style/not-valid", dataMirrorField.input)
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
                        this.add("style/not-valid", dataMirrorField.input)
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


            // add hr
            const conditionsContainer = this.create("div/loading", content)

            const res = await this.request("/location-expert/get/match-maker/conditions/", {created: matchMaker.created})

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

                    this.overlay("pop", overlay => {

                      this.removeOverlayButton(overlay)

                      this.render("text/h1", "Detailansicht", overlay)

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

                    this.overlay("pop", overlay => {

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

                    this.add("style/valid", quantityInput)

                  } else {
                    this.add("style/not-valid", quantityInput)
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
    if (event === "map/field-funnel") {
      Object.entries(input).forEach(([key, value]) => {
        for (let i = 0; i < parent.querySelectorAll("*").length; i++) {
          const field = parent.querySelectorAll("*")[i]
          if (field.id === key) {
            const input = field.querySelector(".field-input")
            input.value = value
          }
        }
      })
      this.verifyIs("field-funnel/valid", parent)
    }
    if (event === "map/funnel") {
      for (const [key, value] of Object.entries(input)) {
        if (key === "created") continue
        const node = parent.querySelector(`#${key}`)
        if (!node) continue
        this.render("value/input", value, node)
      }
      this.verify("funnel", parent)
    }
    if (event === "nav/open") {
      this.convert("parent/scrollable", input)
      this.add(event, input)
    }
    if (event === "next/path") {
      let path = input.getAttribute("next")
      const fragment = document.createDocumentFragment()
      const field = this.create("input/path", fragment)
      if (path) field.input.value = path
      this.verify("input/value", field.input)
      field.input.oninput = ev => {
        const value = ev.target.value
        if (this.verifyIs("text/path", value)) {
          this.add("style/valid", field.input)
          input.setAttribute("next", value)
        } else {
          this.add("style/not-valid", field.input)
          input.removeAttribute("next")
        }
      }
      parent?.appendChild(fragment)
      return field
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
              const scriptButton = this.create("button/left-right", parent)
              scriptButton.right.textContent = script.name
              scriptButton.left.textContent = `Skript ${scripts.length - i}`
              scriptButton.onclick = () => {
                this.overlay("pop", overlay => {
                  overlay.info.textContent = `.${script.name}`
                  const content = this.create("div/scrollable", overlay)
                  {
                    const button = this.create("button/left-right", content)
                    button.left.textContent = ".update"
                    button.right.textContent = "Skript bearbeiten"
                    button.onclick = () => {
                      this.overlay("pop", overlay => {
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
                        const button = this.create("button/action", funnel)
                        button.textContent = "Skript jetzt speichern"
                        button.onclick = async () => {
                          await this.verify("field-funnel", funnel)
                          this.overlay("lock", async securityOverlay => {
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
                    const button = this.create("button/left-right", content)
                    button.left.textContent = ".remove"
                    button.right.textContent = "Skript entfernen"
                    button.onclick = () => {
                      this.overlay("lock", async securityOverlay => {
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
          const feedbackButton = this.create("button/branch")
          const fragment = document.createDocumentFragment()
          this.convert("parent/scrollable", parent)
          for (let i = 0; i < input.length; i++) {
            const script = input[i]
            const scriptButton = this.create("button/left-right", fragment)
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
              this.add("hover-outline", button)
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
              this.add("hover-outline", button)
              button.onclick = async () => {
                if (document.getElementById(script.name) !== null) {
                  window.alert("Skript existiert bereits.")
                  return
                }
                const clone = this.convert("text/script", script.html)
                const executer = this.create("script/id", script.name)
                document.body.appendChild(executer)
                updateBorder(scriptButton)
                scriptButton.style.border = `3px solid ${Helper.colors.matte.orange}`
              }
            }
            {
              const button = feedbackButton.cloneNode(true)
              button.style.position = "relative"
              Helper.create("counter", button)
              feedback.initScriptCounter(script.created, button)
              buttons.appendChild(button)
              this.add("hover-outline", button)
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
          this.overlay("pop", overlay => {
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
    if (event === "tabs") {
      const tabs = input.split(" ")
      const flexRow = Helper.create("div/flex-row", parent)
      flexRow.style.justifyContent = "flex-start"
      const tabButtons = {}
      tabs.forEach(tab => {
        const button = Helper.render("text/link", tab, flexRow)
        const tag = Helper.convert("text/tag", tab)
        tabButtons[tag] = button
        button.addEventListener("click", () => {
          tabs.forEach(tab => {
            Helper.remove("style/selected", tabButtons[Helper.convert("text/tag", tab)])
          })
          Helper.add("style/selected", button)
        })
      })
      return tabButtons
    }
    if (event === "text/a") {
      const {href, target, text} = input
      const div = this.div("mtb21 mlr34")
      div.a = document.createElement("a")
      this.append(div.a, div)
      div.a.className = "link-theme"
      div.a.textContent = text
      div.a.href = href
      div.a.target = target
      this.add("hover-outline", div.a)
      if (parent) this.append(div, parent)
      return div
    }
    if (event === "text/bottom-left") {
      const text = document.createElement("div")
      text.textContent = input
      text.style.position = "absolute"
      text.style.bottom = "0"
      text.style.left = "0"
      text.style.margin = "3px 13px"
      parent.style.position = "relative"
      parent.style.fontFamily = "sans-serif"
      parent?.appendChild(text)
      return text
    }
    if (event === "text/bottom-right") {
      const text = document.createElement("div")
      text.textContent = input
      text.style.position = "absolute"
      text.style.bottom = "0"
      text.style.right = "0"
      text.style.margin = "3px 13px"
      parent.style.position = "relative"
      parent.style.fontFamily = "sans-serif"
      parent?.appendChild(text)
      return text
    }
    if (event === "text/dark-light") {
      const fragment = document.createDocumentFragment()
      const div = document.createElement("div")
      fragment.appendChild(div)
      div.textContent = input
      div.style.margin = "0 34px"
      this.convert("text/dark-light", div)
      parent?.appendChild(fragment)
      return div
    }
    if (event === "div") {
      const div = this.div(input.classes)
      div.textContent = input.text
      if (parent) this.append(div, parent)
      return div
    }
    if (event === "text/action") {
      const btn = Helper.create("button/action")
      btn.textContent = input
      if (parent) parent.appendChild(btn)
      return btn
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
      const link = this.div("p13 br13 pointer sans-serif flex align center")
      link.textContent = input
      this.add("hover-outline", link)
      this.convert("box/dark-light", link)
      parent?.appendChild(link)
      return link
    }
    if (event === "text/note") {
      const note = this.create("div/note")
      note.textContent = input
      if (parent) this.append(note, parent)
      return note
    }
    if (event === "text/div") {
      const div = this.div("sans-serif")
      div.textContent = input
      if (parent) this.append(div, parent)
      return div
    }
    if (event === "text/h3") {
      const h3 = document.createElement("h3")
      h3.className = "mtb21 mlr34 sans-serif color-theme fw-normal"
      h3.textContent = input
      if (parent) this.append(h3, parent)
      return h3
    }
    if (event === "text/h2") {
      const h2 = document.createElement("h2")
      h2.className = "mtb21 mlr34 sans-serif color-theme fw-normal"
      h2.textContent = input
      if (parent) this.append(h2, parent)
      return h2
    }
    if (event === "text/h1") {
      const h1 = document.createElement("h1")
      h1.className = "mtb21 mlr34 sans-serif color-theme fw-normal"
      h1.textContent = input
      if (parent) this.append(h1, parent)
      return h1
    }
    if (event === "text/hover-bottom-right") {
      const text = this.render("text/bottom-right", input, parent)
      text.className = "op0"
      parent.onmouseover = () => this.classes(text, {remove: "op0", add: "op1"})
      parent.onmouseout = () => this.classes(text, {remove: "op1", add: "op0"})
      return text
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
      const text = this.render("text/bottom-right", input, parent)
      text.style.opacity = "0"
      parent.addEventListener("mouseover", () => {
        text.style.opacity = "1"
      })
      parent.addEventListener("mouseout", () => {
        text.style.opacity = "0"
      })
      return parent
    }
    if (event === "text/mark") {
      const fragment = document.createDocumentFragment()
      const mark = document.createElement("mark")
      mark.textContent = input
      this.convert("color/dark-light")
      fragment.appendChild(mark)
      parent?.appendChild(fragment)
      return mark
    }
    if (event === "text/p") {
      const p = document.createElement("p")
      p.className = "mtb21 mlr34 sans-serif color-theme"
      p.textContent = input
      if (parent) this.append(p, parent)
      return p
    }
    if (event === "text/pre") {
      const pre = document.createElement("pre")
      pre.textContent = input
      pre.className = "monospace fs13"
      if (parent) this.append(pre, parent)
      return pre
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
    if (event === "text/span") {
      const {text} = input
      const span = document.createElement("span")
      span.className = "color-theme sans-serif"
      span.textContent = text
      if (parent) this.append(span, parent)
      return span
    }
    if (event === "text/title") {
      let title = document.querySelector("title")
      if (!title) {
        title = document.createElement("title")
        if (parent) parent.appendChild(title)
      }
      title.textContent = input
      return title
    }
    if (event === "text/top-right") {
      const fragment = document.createDocumentFragment()
      const text = document.createElement("div")
      text.textContent = input
      text.style.position = "absolute"
      text.style.top = "0"
      text.style.right = "0"
      text.style.margin = "1px 5px"
      parent.style.position = "relative"
      fragment.appendChild(text)
      parent?.appendChild(fragment)
      return text
    }
    if (event === "tree/funnel") {
      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/jwt/get/tree/", {tree: input})
          if (res.status === 200) {
            const map = this.convert("it/map", {tree: input, it: res.response})
            this.render("map/funnel", map, parent)
          }
          this.verify("funnel", parent)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "pdf") {
      return new Promise(async (resolve, reject) => {
        try {
          const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/+esm')
          pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs"
          const url = input
          const loadingTask = pdfjs.getDocument(url)
          const pdf = await loadingTask.promise
          let currentPage = 1
          const totalPages = pdf.numPages
          const scale = 1.5
          const container = document.createElement('div')
          container.style.width = '100%'
          container.style.height = 'auto'
          container.style.display = 'flex'
          container.style.flexDirection = 'column'
          container.style.alignItems = 'center'
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.style.width = '100%'
          canvas.style.height = 'auto'
          const controls = document.createElement('div')
          controls.style.marginTop = '10px'
          controls.style.display = 'flex'
          controls.style.justifyContent = 'space-between'
          controls.style.width = '50%'
          const prevButton = document.createElement('button')
          prevButton.textContent = 'Zurück'
          const nextButton = document.createElement('button')
          nextButton.textContent = 'Weiter'
          const pageNumberDisplay = document.createElement('span')
          pageNumberDisplay.textContent = `Seite ${currentPage} von ${totalPages}`
          controls.appendChild(prevButton)
          controls.appendChild(pageNumberDisplay)
          controls.appendChild(nextButton)
          container.appendChild(canvas)
          container.appendChild(controls)
          async function renderPage(pageNumber) {
            const page = await pdf.getPage(pageNumber)
            const viewport = page.getViewport({ scale })
            canvas.height = viewport.height
            canvas.width = viewport.width
            const renderContext = {
              canvasContext: context,
              viewport: viewport
            }
            await page.render(renderContext).promise
            pageNumberDisplay.textContent = `Seite ${pageNumber} von ${totalPages}`
          }
          renderPage(currentPage)
          prevButton.onclick = ev => {
            ev.stopPropagation()
            if (currentPage <= 1) return
            currentPage--
            renderPage(currentPage)
          }
          nextButton.onclick = ev => {
            ev.stopPropagation()
            if (currentPage >= totalPages) return
            currentPage++
            renderPage(currentPage)
          }
          parent.appendChild(container)
          resolve(container)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "funnel/source") {
      if (input.authors) parent.authors.input.value = input.authors.join(", ")
      if (input.title) parent.titel.input.value = input.title
      if (input.edition) parent.edition.input.value = input.edition
      if (input.publisher) parent.publisher.input.value = input.publisher.join(", ")
      if (input.published) parent.published.input.value = input.published
      if (input.isbn) parent.isbn.input.value = input.isbn.join(", ")
      if (input.weblink) parent.weblink.input.value = input.weblink
      if (input.language) parent.language.input.value = input.language.join(", ")
      if (input.type) parent.type.input.value = input.type
      if (input.keywords) parent.keywords.input.value = input.keywords.join(", ")
      if (input.description) parent.description.input.value = input.description
      if (input.image) parent.image.input.value = input.image
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
            this.add("hover-outline", button)
            button.onclick = () => {
              this.overlay("pop", overlay => {
                overlay.info.append(this.convert("element/alias", fieldInput))
                const buttons = this.create("div/scrollable", overlay)
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".id"
                  button.right.textContent = "Datenfeld Id aktualisieren"
                  this.add("hover-outline", button)
                  button.onclick = () => {
                    this.overlay("pop", overlay => {
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
                          this.add("style/not-valid", idField.input)
                        }
                      }
                    })
                  }
                }
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".on-info-click"
                  button.right.textContent = "Erweitere dein Datenfeld mit mehr Informationen"
                  this.add("hover-outline", button)
                  button.onclick = () => {
                    this.overlay("pop", overlay => {
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
                        const script = this.create("script/id", "on-info-click")
                        this.add("script-onbody", script)
                      }
                    })
                  }
                }
                {
                  const button = this.create("button/left-right", buttons)
                  button.left.textContent = ".remove"
                  button.right.textContent = "Datenfeld entfernen"
                  this.add("hover-outline", button)
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
              this.overlay("pop", overlay => {
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
                this.overlay("pop", answersFunnelOverlay => {
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
                      this.add("style/not-valid", answerField.input)
                    }
                    this.render(event, input, parent)
                  })
                  const selectedConditionButton = this.create("button/left-right", answerFunnel)
                  selectedConditionButton.left.textContent = ".onclick"
                  selectedConditionButton.right.textContent = "Klick Bedingung definieren"
                  selectedConditionButton.addEventListener("click", () => {
                    this.overlay("pop", conditionFunnelOverlay => {
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
                          this.add("style/not-valid", skipNumberField.input)

                          pathField.input.disabled = true
                          pathField.input.required = false
                          pathField.input.value = ""
                          this.add("style/valid", pathField.input)

                        }

                        if (actionField.input.value === "path") {

                          skipNumberField.input.disabled = true
                          skipNumberField.input.required = false
                          skipNumberField.input.value = ""
                          this.add("style/valid", skipNumberField.input)

                          pathField.input.disabled = false
                          pathField.input.setAttribute("required", "true")
                          this.add("style/not-valid", pathField.input)

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
                      this.add("style/valid", pathField.input)
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
              this.overlay("pop", questionsFunnelOverlay => {
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
                    } else this.add("style/not-valid", idField.input)

                    info.textContent = ""
                    info.append(this.convert("element/alias", child))

                    this.render(event, input, parent)

                  } catch (error) {
                    this.add("style/not-valid", idField.input)
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
                    this.add("style/not-valid", labelField.input)
                  }

                })

                const button = this.create("button/left-right", questionsFunnel)
                button.left.textContent = ".options"
                button.right.textContent = "Antworten bearbeiten"
                button.addEventListener("click", () => {
                  this.overlay("pop", answersOverlay => {
                    overlay.info.textContent = `${this.convert("element/alias", child)}.options`

                    {
                      const button = this.create("button/left-right", answersOverlay)
                      button.left.textContent = ".append"
                      button.right.textContent = "Neue Antwortmöglichkeit anhängen"
                      button.addEventListener("click", () => {
                        const answerBox = this.create("answer-box")
                        this.overlay("pop", appendAnswerOverlay => {
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
                            this.overlay("pop", conditionFunnelOverlay => {
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
                                  this.add("style/not-valid", skipNumberField.input)
                                  pathField.input.disabled = true
                                  pathField.input.required = false
                                  pathField.input.value = ""
                                  this.add("style/valid", pathField.input)
                                }

                                if (actionField.input.value === "path") {

                                  skipNumberField.input.disabled = true
                                  skipNumberField.input.required = false
                                  skipNumberField.input.value = ""
                                  this.add("style/valid", skipNumberField.input)

                                  pathField.input.disabled = false
                                  pathField.input.required = true
                                  this.add("style/not-valid", pathField.input)

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
                              this.add("style/valid", pathField.input)
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
              this.overlay("pop", overlay => {
                overlay.info.textContent = `${this.convert("element/alias", input.field)}.options`
                {
                  const button = this.create("button/left-right", overlay)
                  button.left.textContent = ".append"
                  button.right.textContent = "Neue Antwortmöglichkeit anhängen"
                  button.addEventListener("click", () => {
                    this.overlay("pop", overlay => {
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
    if (event === "link/css") {
      const link = document.createElement("link")
      link.id = input
      link.rel = "stylesheet"
      link.href = input
      link.type = "text/css"
      if (!document.getElementById(input)) {
        this.append(link, document.head)
      }
    }
    if (event === "link/js") {
      const script = document.createElement("script")
      script.id = input
      script.src = input
      script.type = "module"
      script.setAttribute("async", "true")
      if (!document.getElementById(input)) {
        this.append(script, document.head)
      }
    }
    if (event === "list") {
      const {list, tree, type} = input
      const key = this.convert("tree/key", tree)
      this.convert("parent/scrollable", parent.content)
      for (let i = 0; i < list.length; i++) {
        const it = list[i]
        const button = this.design(tree, it[key], parent.content)
        this.fn(type, {it, node: button, overlay: parent})
      }
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
          this.overlay("pop", overlay => {
            this.render("text/h1", "Detailansicht", overlay)

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
    if (event === "selector") {
      let node = document.querySelector(input)
      if (node) return node
      const fragment = document.createDocumentFragment()
      const tag = this.convert("selector/tag", input)
      const id = this.convert("selector/id", input)
      const className = this.convert("selector/class", input)
      node = document.createElement(tag)
      if (id) node.id = id
      if (className) node.className = className
      fragment?.appendChild(node)
      parent?.appendChild(fragment)
      return node
    }
    if (event === "reputation") {
      function getRecommendation(reputation) {
        if (reputation < -610) {
          return "Es scheint, dass es ernsthafte Probleme gibt, die gelöst werden müssen. Wir empfehlen eine umfassende Überprüfung der Aktivitäten und möglicherweise professionelle Unterstützung, um Verhaltensänderungen herbeizuführen."
        } else if (reputation < -145) {
          return "Die Reputation ist besorgniserregend. Es wäre hilfreich, detaillierte Rückmeldungen und gezielte Unterstützung anzubieten, um die zugrunde liegenden Ursachen der negativen Bewertung zu adressieren."
        } else if (reputation < -90) {
          return "Die Reputation weist auf Herausforderungen hin. Ermutigen Sie den Nutzer, Feedback anzunehmen und Verbesserungsmaßnahmen zu implementieren, um seine Interaktionen zu verbessern."
        } else if (reputation < -34) {
          return "Der Nutzer hat einige Schwierigkeiten gezeigt. Eine positive Verstärkung und klar definierte Ziele könnten hilfreich sein, um die Reputation zu verbessern."
        } else if (reputation < -13) {
          return "Die Reputation zeigt eine leichte negative Tendenz. Geben Sie konstruktives Feedback und Unterstützung, um die Engagement-Qualität zu erhöhen."
        } else if (reputation === 0) {
          return "Neutral"
        } else if (reputation <= 13) {
          return "Der Nutzer hat eine gute Reputation. Weiterhin positives Engagement fördern und Möglichkeiten zur weiteren Verbesserung bieten."
        } else if (reputation <= 34) {
          return "Der Nutzer hat eine sehr gute Reputation. Anerkennung und zusätzliche Herausforderungen könnten motivierend wirken."
        } else if (reputation <= 89) {
          return "Der Nutzer zeigt herausragendes Engagement. Überlege, wie du diesen Beitrag weiter anerkennen und belohnen kannst."
        } else if (reputation <= 144) {
          return "Exzellente Leistung und Engagement. Erwäge besondere Anerkennung oder Belohnungen für den außergewöhnlichen Beitrag zur Community."
        } else if (reputation <= 610) {
          return "Der Nutzer hat eine beeindruckende Reputation. Dies ist ein wertvolles Mitglied der Community; eine bedeutende Auszeichnung oder persönliche Anerkennung könnten angebracht sein."
        } else {
          return "Der Nutzer hat eine außergewöhnliche Reputation. Biete herausragende Anerkennung und ziehe in Betracht, ihm spezielle Verantwortungen oder Auszeichnungen zu geben."
        }
      }

      const recommendation = getRecommendation(input)
      const container = Helper.div("flex mtb21 mlr34")
      const leftDiv = Helper.div("flex align center", container)
      leftDiv.textContent = `Reputation:`
      const rightDiv = Helper.div("ml8 fs21", container)
      rightDiv.textContent = recommendation
      if (parent) this.append(container, parent)
      return container
    }
    if (event === "ul") {
      const ul = document.createElement("ul")
      if (parent) this.append(ul, parent)
      return ul
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
                this.add("style/valid", quantityInput)
              } else {
                this.add("style/not-valid", quantityInput)
              }

            }
          }



          for (let i = 0; i < item.querySelectorAll("*").length; i++) {
            const child = item.querySelectorAll("*")[i]

            if (child.tagName === "INPUT") {
              this.add("hover-outline", child)
            }

            if (child.hasAttribute("popup-details")) {

              this.add("hover-outline", child)
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

              this.add("hover-outline", child)
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

                  this.overlay("pop", overlay => {
                    this.render("text/h1", "Mein Angebot", overlay)
                    this.render("text/right-hr", "Preis", overlay)
                    const cart = JSON.parse(window.localStorage.getItem("cart")) || []
                    this.render("cart/node/open", cart, overlay)
                  })

                } else {
                  this.add("style/not-valid", quantityInput)
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
          const res = await this.request("/jwt/get/trees/", {trees: input})
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
          const res = await this.request("/get/users/trees/", {trees: input})
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
          const res = await this.request("/get/users/trees/", {trees: input})
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
    if (event === "user-box") {
      const fragment = document.createDocumentFragment()
      const it = this.create("button/left-right", fragment)
      this.style(it, {margin: "8px", justifyContent: "center"})
      this.style(it.right, {fontSize: "21px"})

      if (!this.verifyIs("text/empty", input.image)) {
        const img = document.createElement("img")
        img.src = input.image
        img.style.width = "144px"
        img.style.height = "144px"
        img.style.borderRadius = "50%"
        img.style.objectFit = "cover"
        img.style.objectPosition = "center"
        it.left.appendChild(img)
      }

      if (!this.verifyIs("text/empty", input.alias)) {
        it.alias = this.render("html/h1", input.alias, it.right)
      }

      if (!this.verifyIs("number/empty", input.created)) {
        it.created = this.render("text/p", `Auf der Plattform seit: ${this.convert("millis/since", input.created)}`, it.right)
      }

      if (!this.verifyIs("text/empty", input.status)) {
        it.status = this.render("text/p", `Status: ${input.status}`, it.right)
      }

      let reputation
      if (!this.verifyIs("number/empty", input.reputation)) {
        it.reputation = this.render("reputation", input.reputation, it.right)
      }

      if (input.highlight === true) {
        this.add("style/new-message", it)
        if (it.alias) it.alias.style.color = this.colors.light.text
        if (it.created) it.created.style.color = this.colors.light.text
        if (it.status) it.status.style.color = this.colors.light.text
        if (it.reputation) it.reputation.style.color = this.colors.light.text
      } else {
        it.newMessageText = this.render("text/node/bottom-right-onhover", "Keine neuen Nachrichten", it)
      }

      parent?.appendChild(fragment)
      return it
    }
    if (event === "video") {
      const video = document.createElement("video")
      this.append(video, parent)
      video.style.width = "100%"
      video.controls = true
      video.src = input
      return video
    }
  }
  static remove(event, input) {

    if (event === ";") {

      return input.replace(/;/g, "")
    }

    if (event === "//") {

      return input.replace(/\/\/.*$/gm, "")
    }

    if (event === "\n") {

      return input
        .split(event)
        .filter(it => it.trim() !== "")
        .join(event)
    }

    if (event === "attributes") {

      while(input.attributes.length > 0) input.removeAttribute(input.attributes[0].name)
    }

    if (event === "class/dark-light") {

      input.classList.remove("bg-dark", "bs-dark", "border-dark", "color-dark")
      input.classList.remove("bg-light", "bs-light", "border-light", "color-light")
    }

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

    if (event === "exif") {

      const file = input
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = ev => {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            canvas.toBlob(blob => {
              const stripped = new File([blob], file.name, { type: file.type })
              resolve(stripped)
            }, file.type)
          }
          img.src = ev.target.result
        }
        reader.onerror = e => reject(e)
        reader.readAsDataURL(file)
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

    if (event === "contenteditable") {

      input.removeAttribute("contenteditable")
      for (let i = 0; i < input.querySelectorAll("*").length; i++) {
        const child = input.querySelectorAll("*")[i]
        child.removeAttribute("contenteditable")
      }
    }

    if (event === "selected-node") {

      input.style.outline = null
      input.removeAttribute("selected-node")
      for (let i = 0; i < input.querySelectorAll("*").length; i++) {
        const child = input.querySelectorAll("*")[i]
        child.style.outline = null
        child.removeAttribute("selected-node")
      }
    }

    if (event === "style/circle") {

      this.style(input, {borderRadius: "0", border: "0", width: "auto", height: "auto", backgroundColor: "transparent"})
    }

    if (event === "style/new-message") {

      input.querySelectorAll("*").forEach(node => {
        if (node.textContent === "Neue Nachrichten gefunden" || node.textContent === "●") node.remove()
      })
      this.convert("button/dark-light", input)
    }

    if (event === "style/not-valid") {

      input.style.outline = null
      input.style.border = null
      input.parentNode.querySelectorAll("div.sign").forEach(sign => sign.remove())
    }

    if (event === "style/selected") {

      Helper.remove("style/circle", input)
      Helper.convert("parent/box", input)
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
  static classes(node, input) {

    const {add, remove} = input
    if (remove) remove.split(" ").forEach(name => node.classList.remove(name))
    if (add) add.split(" ").forEach(name => node.classList.add(name))
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
  static requestWith(event, input) {

    if (type === "beacon") {

      const url = new URL(input.path, window.location.origin)
      url.searchParams.append("created", input.created)
      return navigator.sendBeacon(url.href)
    }

    if (event === "url-id") {

      return new Promise(async(resolve, reject) => {
        try {
          const pathname = window.location.pathname
          const urlId = window.location.pathname.split("/")[4]
          if (this.verifyIs("text/empty", urlId)) return
          if (input === undefined) input = {}
          input.location = window.location.href
          input.referer = document.referrer
          input.localStorageEmail = window.localStorage.getItem("email")
          input.localStorageId = window.localStorage.getItem("localStorageId")
          const xhr = new XMLHttpRequest()
          xhr.open("POST", pathname)
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

  }
  static reset(event, input) {

    if (event === "node") {

      this.remove("attributes", input)
      input.textContent = ""
      return input
    }
  }
  static sort(event, input) {
    // event = input/by/algorithm

    if (event === "fisher-yates") {

      const array = Array.from(input)
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array
    }

    if (event === "flag-true") {

      return input.array.sort((a, b) => {
        const flagA = a[input.flag] ?? false;
        const flagB = b[input.flag] ?? false;
        if (flagA && !flagB) return -1;
        if (!flagA && flagB) return 1;
        return 0;
      })
    }

    if (event === "created-desc") {

      return input?.sort((a, b) => {
        if (!a.created && !b.created) return 0
        if (!a.created) return 1
        if (!b.created) return -1
        b.created.localeCompare(a.created)
      })
    }

    if (event === "array/reputation/descending") {
      return input?.sort((a, b) => b.reputation - a.reputation)
    }

    if (event === "query"){

      const filtered = input.array.filter(it => it[input.filter]?.toLowerCase().includes(input.query.toLowerCase()))
      return filtered.map(it => {
        const highlightedHtml = it[input.filter]?.replace(new RegExp(input.query, 'ig'), `<mark>${input.query}</mark>`)
        return { ...it, query: highlightedHtml }
      })
    }

  }
  static style(node, input) {
    if (node) {
      if (input.letterSpacing) node.style.letterSpacing = input.letterSpacing
      if (input.lineHeight) node.style.lineHeight = input.lineHeight
      if (input.position) node.style.position = input.position
      if (input.backgroundColor) node.style.backgroundColor = input.backgroundColor
      if (input.backgroundRepeat) node.style.backgroundRepeat = input.backgroundRepeat
      if (input.backgroundPosition) node.style.backgroundPosition = input.backgroundPosition
      if (input.backgroundSize) node.style.backgroundSize = input.backgroundSize
      if (input.backgroundImage) node.style.backgroundImage = input.backgroundImage
      if (input.background) node.style.background = input.background
      if (input.fontWeight) node.style.fontWeight = input.fontWeight
      if (input.fontFamily) node.style.fontFamily = input.fontFamily
      if (input.fontSize) node.style.fontSize = input.fontSize
      if (input.flexShrink) node.style.flexShrink = input.flexShrink
      if (input.height) node.style.height = input.height
      if (input.minHeight) node.style.minHeight = input.minHeight
      if (input.width) node.style.width = input.width
      if (input.maxWidth) node.style.maxWidth = input.maxWidth
      if (input.minWidth) node.style.minWidth = input.minWidth
      if (input.objectFit) node.style.objectFit = input.objectFit
      if (input.overflow) node.style.overflow = input.overflow
      if (input.overflowX) node.style.overflowX = input.overflowX
      if (input.overflowY) node.style.overflowY = input.overflowY
      if (input.margin) node.style.margin = input.margin
      if (input.marginTop) node.style.marginTop = input.marginTop
      if (input.marginBottom) node.style.marginBottom = input.marginBottom
      if (input.marginLeft) node.style.marginLeft = input.marginLeft
      if (input.padding) node.style.padding = input.padding
      if (input.color) node.style.color = input.color
      if (input.cursor) node.style.cursor = input.cursor
      if (input.display) node.style.display = input.display
      if (input.justifyContent) node.style.justifyContent = input.justifyContent
      if (input.alignItems) node.style.alignItems = input.alignItems
      if (input.flexDirection) node.style.flexDirection = input.flexDirection
      if (input.bottom) node.style.bottom = input.bottom
      if (input.left) node.style.left = input.left
      if (input.top) node.style.top = input.top
      if (input.right) node.style.right = input.right
      if (input.textShadow) node.style.textShadow = input.textShadow
      if (input.transform) node.style.transform = input.transform
      if (input.flexWrap) node.style.flexWrap = input.flexWrap
      if (input.flex) node.style.flex = input.flex
      if (input.textDecoration) node.style.textDecoration = input.textDecoration
      if (input.textTransform) node.style.textTransform = input.textTransform
      if (input.textAlign) node.style.textAlign = input.textAlign
      if (input.textOverflow) node.style.textOverflow = input.textOverflow
      if (input.border) node.style.border = input.border
      if (input.borderRadius) node.style.borderRadius = input.borderRadius
      if (input.boxShadow) node.style.boxShadow = input.boxShadow
      if (input.alignSelf) node.style.alignSelf = input.alignSelf
      if (input.wordBreak) node.style.wordBreak = input.wordBreak
      if (input.whiteSpace) node.style.whiteSpace = input.whiteSpace
    }
  }
  static async toolboxGetter() {

    if (!this._toolboxGetter) {
      const module = await import("/js/toolbox-getter.js")
      this._toolboxGetter = module.toolboxGetter
    }
    return this._toolboxGetter
  }
  static update(event, parent, input) {
    // no parent needed to get data
    if (arguments.length === 2) {
      input = parent
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
    if (event === "form") {
      return new Promise(async(resolve, reject) => {
        try {
          const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'attributes') {
                const lockedAttributes = [
                  "accept",
                  "id",
                  "maxlength",
                  "required",
                  "min",
                  "max",
                  "pattern",
                  "step",
                  "type",
                  "value",
                  "disabled",
                  "readonly",
                  "minlength",
                ]
                if (lockedAttributes.includes(mutation.attributeName)) {
                  window.location.reload()
                }
              }
            }
          })
          const nodes = input.querySelectorAll("input, textarea, select")
          nodes.forEach(node => {
            observer.observe(node, { attributes: true })
          })
          resolve(nodes)
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "funnel") {
      return new Promise(async(resolve, reject) => {
        try {
          const allNodes = new Set()
          if (typeof input === "object") {
            for (const key in input) {
              if (input.hasOwnProperty(key)) {
                const div = input[key]
                const nodes = input.querySelectorAll("input, textarea, select")
                nodes.forEach(node => allNodes.add(node))
              }
            }
          }
          if (input instanceof Node) {
            const nodes = input.querySelectorAll("input, textarea, select")
            nodes.forEach(node => allNodes.add(node))
          }
          for (const node of allNodes) {
            const isValid = await this.verify("input/value", node)
            if (!isValid) {
              node.scrollIntoView({ behavior: "smooth", block: "start" })
              throw new Error("funnel invalid")
            }
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "funnel/ids") {
      return new Promise(async(resolve, reject) => {
        try {
          const nodes = input.querySelectorAll("input, textarea, select")
          nodes.forEach(node => {
            if (!node.id) reject(`input has no id: ${node.outerHTML}`)
          })
          resolve()
        } catch (error) {
          reject(error)
        }
      })
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
      return new Promise((resolve, reject) => {
        try {
          const isValid = this.verifyIs("input/valid", input)
          if (isValid) resolve(isValid)
          else throw new Error("input invalid")
        } catch (error) {
          reject(error)
        }
      })
    }
    if (event === "inputs") {
      return new Promise(async(resolve, reject) => {
        try {
          const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
              if (mutation.type === 'attributes') {
                const lockedAttributes = [
                  "accept",
                  "id",
                  "maxlength",
                  "required",
                  "min",
                  "max",
                  "pattern",
                  "step",
                  "type",
                  "value",
                  "disabled",
                  "readonly",
                  "minlength",
                ]
                if (lockedAttributes.includes(mutation.attributeName)) {
                  window.location.reload()
                }
              }
              return
            }
            return
          })
          const nodes = input.querySelectorAll("input, textarea, select")
          nodes.forEach(node => {
            observer.observe(node, { attributes: true, childList: true, subtree: true })
            this.verify("input/value", node)
            node.addEventListener("input", () => this.verify("input/value", node))
          })
          observer.disconnect()
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }
    if (event === "path/exist") {
      const path = input
      const field = check
      return new Promise(async(resolve, reject) => {
        try {
          const res = await this.request("/verify/path/exist/", {path})
          if (res.status === 200) {
            window.alert("Pfad existiert bereits.")
            this.add("style/not-valid", field.input)
            field.scrollIntoView({behavior: "smooth"})
            throw new Error("path exist")
          } else {
            resolve()
          }
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
    if (event === "array/primitive") {
      return input.every(it => {
        for (const key in it) {
          if (it.hasOwnProperty(key)) {
            const value = it[key]
            return this.verifyIs("primitive", value)
          }
        }
      })
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
    if (event === "maxlength") {
      if (input.hasAttribute("maxlength")) {
        const maxLength = parseInt(input.getAttribute("maxlength"), 10)
        if (input.value.length <= maxLength) return true
      }
      return false
    }
    if (event === "millis/future") {
      if (input > Date.now()) {
        return true
      } else {
        return false
      }
    }
    if (event === "millis/past") {
      if (input < Date.now()) {
        return true
      } else {
        return false
      }
    }
    if (event === "number/empty") {
      return input === undefined ||
      input === null ||
      Number.isNaN(input) ||
      typeof input !== "number" ||
      input === ""
    }
    if (event === "primitive") {
      return typeof input === "string" || typeof input === "number" || typeof input === "boolean"
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
    if (event === "text/class") {
      return /^[A-Za-z0-9\-_:]+$/.test(input)
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
      return /^(.+)@(.+)$/.test(input)
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
    if (event === "text/tag") {
      if (typeof input !== "string") return false
      if (/^[a-z](?:-?[a-z]+)*$/.test(input) === true) return true
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
      if (typeof input === "number") return isFinite(input)
      if (typeof input === "string" && input.trim() !== "") {
        const number = Number(input)
        return !isNaN(number) && isFinite(number)
      }
      return false
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
      if (input === "/") return true
      const regex = /^\/([a-z]+(?:-[a-z]+)*)(\/[a-z]+(?:-[a-z]+)*)*\/$/
      return regex.test(input)
    }
    if (event === "input/valid") {
      const isRequired = this.verifyIs("input/required", input)
      const hasMaxLength = input.hasAttribute("maxlength")
      const hasAccept = input.hasAttribute("accept")
      const isCheckbox = input.getAttribute("type") === "checkbox"
      const isSelect = input.tagName === "SELECT"
      function notValid(input) {
        Helper.add("style/not-valid", input)
        if (input.parentElement) input.parentElement.scrollIntoView({behavior: "smooth"})
        return false
      }
      function isValid(input) {
        Helper.add("style/valid", input)
        return true
      }
      function validateRequired(input) {
        if (isRequired && input.getAttribute("type") === "checkbox") {
          if (input.getAttribute("checked") === "true") return true
          if (input.checked === true) return true
          return false
        }
        if (isRequired) {
          if (typeof input.value === "string") {
            if (!Helper.verifyIs("text/empty", input.value)) return true
          }
          if (typeof input.value === "number") {
            if (!Helper.verifyIs("number/empty", input.value)) return true
          }
        }
        return false
      }
      function validateAccepted(input) {
        if (hasAccept) {
          if (Helper.verifyIs("input/accepted", input)) return true
        }
        return false
      }
      function validateChecked(input) {
        if (input.type === "checkbox") {
          if (Helper.verifyIs("input/checked", input.value)) return true
        }
        return false
      }
      function validate(input) {
        if (isRequired && isCheckbox) {
          if (input.getAttribute("checked") === "true") return isValid(input)
          if (input.checked === true) return isValid(input)
          return notValid(input)
        }
        if (isRequired && hasAccept) {
          if (validateRequired(input) && validateAccepted(input)) return isValid(input)
          return notValid(input)
        }
        if (isRequired) {
          if (validateRequired(input)) return isValid(input)
          return notValid(input)
        }
        if (hasAccept) {
          if (validateAccepted(input)) return isValid(input)
          return notValid(input)
        }
        if (isSelect) {
          if (!Helper.verifyIs("text/empty", input.value)) return isValid(input)
          if (!isRequired) return isValid(input)
          return notValid(input)
        }
        if (!isRequired && !hasAccept && !hasMaxLength) return isValid(input)
        if (hasMaxLength) {
          if (Helper.verifyIs("maxlength", input)) return isValid(input)
        }
        return notValid(input)
      }
      return validate(input)
    }
    if (event === "input/accepted") {
      const array = []
      const accept = input.getAttribute("accept")
      if (accept && accept.includes("application/pdf")) {
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
              array.push(true)
              resolve(true)
            } else {
              array.push(false)
              resolve(false)
            }
          } catch (error) {
            array.push(false)
            resolve(false)
          }
        })
      }
      if (accept && accept.includes("text/js")) {
        try {
          array.push(this.verifyIs("text/js", input.value))
        } catch (error) {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/length")) {
        if (input.value.length <= input.maxLength) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/trees")) {
        if (this.verifyIs("text/trees", input.value)) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/tree")) {
        input.value = input.value.replace(/ /g, ".")
        if (this.verifyIs("text/tree", input.value) === true) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/operator")) {
        array.push(this.verifyIs("text/operator", input.value))
      }
      if (accept && accept.includes("text/email")) {
        if (/^(.+)@(.+)$/.test(input.value) === true) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/url")) {
        if (this.verifyIs("text/url", input.value)) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/number")) {
        if (this.verifyIs("text/number", input.value)) {
          array.push(true)
        } else {
          array.push(false)
        }
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
            array.push(true)
          }
        }
      }
      if (accept && accept.includes("text/tel")) {
        if (this.verifyIs("text/tel", input.value)) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/id")) {
        input.value = input.value.replace(/ /g, "-")
        if (/^[a-z](?:-?[a-z]+)*$/.test(input.value) === true) {
          if (document.querySelectorAll(`#${input.value}`).length === 0) {
            array.push(true)
          } else {
            array.push(false)
          }
        }
      }
      if (accept && accept.includes("text/path")) {
        if (this.verifyIs("text/path", input.value)) {
          this.add("style/valid", input)
          array.push(true)
        } else {
          this.add("style/not-valid", input)
          array.push(false)
        }
      }
      if (accept && accept.includes("text/hex")) {
        if (/^[0-9A-Fa-f]+$/.test(input.value) === true) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/tag")) {
        input.value = input.value.replace(/ /g, "-")
        input.value = input.value.replace(/ö/g, "oe")
        input.value = input.value.replace(/ä/g, "ae")
        input.value = input.value.replace(/ü/g, "ue")
        if (/^[a-z](?:-?[a-z]+)*$/.test(input.value) === true) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/https")) {
        if (input.value.startsWith("https://")) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("email/array")) {
        if (!input.value.startsWith("[")) array.push(false)
        if (!input.value.endsWith("]")) array.push(false)
        try {
          const array = JSON.parse(input.value)
          for (let i = 0; i < array.length; i++) {
            const email = array[i]
            if (Helper.verifyIs("email/empty", email)) throw new Error("email is empty")
          }
          array.push(true)
        } catch (error) {
          array.push(false)
        }
      }
      if (accept && accept.includes("string/array")) {
        if (!input.value.startsWith("[")) array.push(false)
        if (!input.value.endsWith("]")) array.push(false)
        try {
          const array = JSON.parse(input.value)
          for (let i = 0; i < array.length; i++) {
            const string = array[i]
            if (Helper.verifyIs("text/empty", string)) throw new Error("string is empty")
          }
          array.push(true)
        } catch (error) {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/script")) {
        if (this.verifyIs("text/script", input.value)) {
          array.push(true)
        } else {
          array.push(false)
        }
      }
      if (accept && accept.includes("text/field-funnel")) {
        const funnel = this.convert("text/first-child", input.value)
        if (funnel.tagName === "DIV") {
          if (funnel.classList.contains("field-funnel")) {
            array.push(true)
          } else {
            array.push(false)
          }
        }
      }
      const allTrue = array.every(it => it === true)
      if (allTrue === true) return true
      return false
    }
    if (event === "input/checked") {
      return false
    }
    if (event === "input/required") {
      if (
        input.hasAttribute("aria-required") ||
        input.hasAttribute("required") ||
        input.getAttribute("required") === "true" ||
        input.required === true
      ) return true
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
    if (event === "it/primitive") {
      return input === null ||
        typeof input === "string" ||
        typeof input === "number" ||
        typeof input === "boolean" ||
        typeof input === "bigint" ||
        typeof input === "symbol" ||
        typeof input === "undefined"
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
    if (event === "path/profil") {
      const split = window.location.pathname.split("/")
      const expert = split[1]
      const platform = split[2]
      const path = split[3]
      const checkExpert = !this.verifyIs("text/empty", expert)
      const checkPlatform = !this.verifyIs("text/empty", platform)
      const checkPath = !this.verifyIs("text/empty", path) && path === "profil"
      return heckExpert && checkPlatform && checkPath
    }
    if (event === "path/valid") {
      const split = window.location.pathname.split("/")
      const expert = split[1]
      const platform = split[2]
      const path = split[3]
      const checkLength = split.length === 5
      const checkLast = split[4] === ""
      const checkExpert = !this.verifyIs("text/empty", expert)
      const checkPlatform = !this.verifyIs("text/empty", platform)
      const checkPath = !this.verifyIs("text/empty", path)
      return checkLength && checkLast && checkExpert && checkPlatform && checkPath
    }
    if (event === "text/hex") {
      if (typeof input !== "string") return false
      if (/^[0-9A-Fa-f]+$/.test(input) === true) return true
      return false
    }
  }
}
export const addLoading = node => {
  const svgText = `<svg fill="#B03535" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 50a40 40 0 0 0 80 0 40 42 0 0 1-80 0"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"/></path></svg>`
  const div = Helper.div("", node)
  div.innerHTML = svgText
  return div
}
Helper.sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
Helper.createNode = Helper.fn("createNode")
Helper.prettifyHtml = text => {
  return text
  .replace(/\n/g, "")
  .replace(/>/g, ">\n  ")
  .replace(/</g, "\n<")
}
Helper.render("link/css", "/public/classes.css", document.head)
export const renderTag = (tag, input, parent) => {
  const element = document.createElement(tag)
  if (!element) {
    throw new Error("renderTag: no valid html element tag")
  }
  element.textContent = input.textContent
  element.className = input.className
  if (parent) Helper.append(element, parent)
  return element
}
