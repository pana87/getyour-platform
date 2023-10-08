import {Request} from "/js/Request.js"
import {TextField} from "/js/TextField.js"
import {TextAreaField} from "/js/TextAreaField.js"
import {SelectionField} from "/js/SelectionField.js"
import {TelField} from "/js/TelField.js"
import {FileField} from "/js/FileField.js"
import {EmailField} from "/js/EmailField.js"
import {CheckboxField} from "/js/CheckboxField.js"

export class Helper {

  static run(event, input) {
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
  }

  static delete(event, input) {
    // event = thing/algorithm

    if (event === "match-maker-condition/closed") {

      return new Promise(async (resolve, reject) => {

        try {
          const del = {}
          del.url = "/delete/match-maker/closed/"
          del.type = "condition"
          del.id = input
          const res = await Request.closed(del)

          resolve(res)

        } catch (error) {
          reject(error)
        }


      })
    }

  }

  static remove(event, input) {

    if (event === "element") {
      input.remove()
    }

    if (event === "event-listener") {
      Array.from(document.querySelectorAll('*')).forEach(element => element.replaceWith(element.cloneNode(true)));
    }

    if (event === "overlay") {
      input.remove()
    }
  }

  // no dom creation, only events
  static add(event, input) {
    // event = input/algorithm

    if (event === "field-funnel/oninput-sign-support") {
      input.querySelectorAll(".field").forEach(field => {
        const input = field.querySelector(".field-input")
        input.oninput = () => this.verifyIs("input/valid", input)
      })
    }

    if (event === "script/field-funnel-sign-support") {

      return new Promise(async(resolve) => {

        const text = /*html*/`
          <script id="field-funnel-sign-support" type="module">
            import {Helper} from "/js/Helper.js"

            document.querySelectorAll(".field-funnel").forEach(funnel => {
              Helper.verifyIs("field-funnel/valid", funnel)
            })

            document.querySelectorAll(".field-funnel").forEach(funnel => {
              funnel.querySelectorAll(".field").forEach(field => {
                const input = field.querySelector(".field-input")
                input.oninput = () => Helper.verifyIs("input/valid", input)
              })
            })

          </script>
        `

        const script = this.convert("text/script", text)

        const create = document.createElement("script")
        create.id = script.id
        create.type = script.type
        create.innerHTML = script.innerHTML

        if (document.body) {
          document.querySelectorAll(`#${create.id}`).forEach(script => script.remove())

          if (document.getElementById(create.id) === null) {
            document.body.append(create)
            return resolve(create)
          }

        } else {
          await this.add("ms/timeout", 3000)
          await this.add(event)
        }

      })

    }

    if (event === "ms/timeout") {
      return new Promise(resolve => {
        setTimeout(() => {
          return resolve()
        }, input)
      })
    }

    if (event === "script/toolbox-getter") {

      return new Promise(async(resolve) => {

        const text = /*html*/`
          <script id="toolbox-getter" type="module">
            import {Helper} from "/js/Helper.js"

            await Helper.get("toolbox/closed", document.body)
          </script>
        `

        const script = this.convert("text/script", text)

        const create = document.createElement("script")
        create.id = script.id
        create.type = script.type
        create.innerHTML = script.innerHTML

        if (document.body) {
          document.body.append(create)
          return resolve(create)
        } else {
          await this.add("ms/timeout", 3000)
          await this.add("script/toolbox-getter")
        }

      })

    }

    if (event === "script/always") {
      return new Promise((resolve, reject) => {

        try {
          const html = this.convert("text/dom", input.script)

          if (html.tagName === "SCRIPT") {

            const node = this.convert("js/script", html.innerHTML)
            node.id = input.name
            node.type = "module"

            document.querySelectorAll(`#${node.id}`).forEach(element => element.remove())

            if (document.getElementById(node.id) === null) {
              document.body.append(node)
            }


          }

          return resolve()
        } catch (error) {
          return reject(error)
        }

      })
    }

    if (event === "script/once") {

      if (document.getElementById(input.id) === null) {
        document.body.append(input)
      }

    }

    if (event === "button/html-feedback") {

      return new Promise(async(resolve, reject) => {

        const feedbackButton = this.create("button/branch")
        feedbackButton.classList.add("button")
        feedbackButton.classList.add("html-feedback")


        // convert style
        feedbackButton.style.position = "fixed"
        feedbackButton.style.bottom = "0"
        feedbackButton.style.right = "0"
        feedbackButton.style.display = "flex"
        feedbackButton.style.justifyContent = "center"
        feedbackButton.style.alignItems = "center"
        feedbackButton.style.boxShadow = this.colors.light.boxShadow
        feedbackButton.style.border = this.colors.light.border
        feedbackButton.style.backgroundColor = this.colors.light.foreground
        feedbackButton.style.borderRadius = "50%"
        feedbackButton.style.margin = "34px"
        feedbackButton.style.padding = "8px"
        feedbackButton.style.zIndex = "1"
        feedbackButton.style.cursor = "pointer"


        const get = {}
        get.url = "/get/feedback/location/"
        get.type = "html-value-length"
        const res = await Request.location(get)

        feedbackButton.counter.innerHTML = "0"
        if (res.status === 200) {
          feedbackButton.counter.innerHTML = res.response
        }

        feedbackButton.onclick = () => {

          this.popup(async overlay => {
            const feedbackOverlay = overlay

            this.headerPicker("removeOverlay", overlay)

            const info = this.headerPicker("info", overlay)
            info.append(this.convert("text/span", window.location.pathname))
            info.append(this.convert("text/span", `.feedback`))

            const content = this.headerPicker("scrollable", overlay)

            const feedbackContainer = this.headerPicker("loading", content)
            feedbackContainer.info.remove()

            feedbackContainer.style.margin = "21px 34px"
            feedbackContainer.style.overflowY = "auto"
            feedbackContainer.style.overscrollBehavior = "none"
            feedbackContainer.style.fontFamily = "monospace"
            feedbackContainer.style.fontSize = "13px"
            feedbackContainer.style.height = `${window.innerHeight * 0.4}px`


            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              feedbackContainer.style.color = this.colors.dark.text
            } else {
              feedbackContainer.style.color = this.colors.light.text
            }

            const get = {}
            get.url = "/get/feedback/location/"
            get.type = "html-value"
            // get.id = input.id
            const res = await Request.location(get)

            if (res.status !== 200) {
              feedbackContainer.innerHTML = `<span style="margin: 21px 34px;">Kein Feedback gefunden.</span>`
            }

            getFeedbackSuccess: if (res.status === 200) {
              const feedback = JSON.parse(res.response)
              // console.log(feedback);

              if (feedback.length === 0) {
                feedbackContainer.innerHTML = `<span style="margin: 21px 34px;">Kein Feedback gefunden.</span>`
                break getFeedbackSuccess
              }

              this.reset(feedbackContainer)
              feedbackContainer.style.margin = "21px 34px"
              feedbackContainer.style.overflowY = "auto"
              feedbackContainer.style.overscrollBehavior = "none"
              feedbackContainer.style.fontFamily = "monospace"
              feedbackContainer.style.fontSize = "13px"
              feedbackContainer.style.height = `${window.innerHeight * 0.4}px`

              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                feedbackContainer.style.color = this.colors.dark.text
              } else {
                feedbackContainer.style.color = this.colors.light.text
              }

              for (let i = 0; i < feedback.length; i++) {
                const value = feedback[i]

                // console.log(value);

                const div = document.createElement("div")
                div.style.display = "flex"
                div.style.justifyContent = "space-between"
                div.style.alignItems = "center"

                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {

                  if (i % 2 === 0) {
                    div.style.background = this.colors.light.foreground
                    div.style.color = this.colors.light.text
                  } else {
                    div.style.background = this.colors.dark.foreground
                    div.style.color = this.colors.dark.text
                  }

                } else {

                  if (i % 2 === 1) {
                    div.style.background = this.colors.light.foreground
                    div.style.color = this.colors.light.text
                  } else {
                    div.style.background = this.colors.dark.foreground
                    div.style.color = this.colors.dark.text
                  }

                }

                const left = document.createElement("span")
                left.innerHTML = `${this.convert("millis/dd.mm.yyyy hh:mm", value.id)}`
                div.append(left)

                const nextToLeft = document.createElement("span")
                nextToLeft.style.width = "100%"
                nextToLeft.style.margin = "0 13px"
                nextToLeft.innerHTML = value.content
                div.append(nextToLeft)

                const right = document.createElement("span")
                right.style.padding = "13px"
                right.innerHTML = value.importance
                div.append(right)

                feedbackContainer.append(div)

                div.style.cursor = "pointer"
                div.addEventListener("click", () => {

                  this.popup(overlay => {
                    this.headerPicker("removeOverlay", overlay)

                    const button = this.buttonPicker("left/right", overlay)
                    const icon = this.iconPicker("delete")
                    icon.style.width = "34px"
                    button.left.append(icon)
                    button.right.innerHTML = "Feedback löschen"

                    button.addEventListener("click", async () => {
                      const confirm = window.confirm("Möchtest du diesen Beitrag wirklich löschen?")

                      if (confirm === true) {
                        const del = {}
                        del.url = "/delete/feedback/location/"
                        del.type = "html-value"
                        // del.scriptId = input.id
                        del.id = value.id
                        const res = await Request.location(del)

                        if (res.status === 200) {
                          feedbackButton.counter.innerHTML = parseInt(feedbackButton.counter.innerHTML) - 1
                          this.removeOverlay(overlay)
                          this.removeOverlay(feedbackOverlay)
                        } else {
                          window.alert("Fehler.. Bitte wiederholen.")
                          this.removeOverlay(overlay)
                        }


                      }

                    })
                  })

                })
              }


            }

            const contentField = this.create("field/textarea", content)
            contentField.label.innerHTML = "Feedback"
            contentField.input.setAttribute("required", "true")
            contentField.input.maxLength = "377"
            contentField.input.style.fontSize = "13px"
            contentField.input.placeholder = "Schreibe ein anonymes Feedback, wenn du möchtest.."

            this.verify("input/validity", contentField.input)
            contentField.input.addEventListener("input", () => this.verify("input/validity", contentField.input))


            const importanceField = this.create("field/range", content)
            importanceField.input.min = "0"
            importanceField.input.max = "13"
            importanceField.input.step = "1"
            importanceField.input.value = "0"
            importanceField.label.innerHTML = `Wichtigkeit - ${importanceField.input.value}`

            this.verify("input/validity", importanceField.input)

            importanceField.input.addEventListener("input", (event) => {
              this.verify("input/validity", importanceField.input)
              importanceField.label.innerHTML = `Wichtigkeit - ${event.target.value}`
            })

            const button = this.buttonPicker("action", content)
            button.innerHTML = "Feedback jetzt speichern"
            button.addEventListener("click", async () => {

              const res = await this.verifyIs("input/valid", contentField.input)

              if (res === true) {

                const content = contentField.input.value
                const importance = importanceField.input.value

                this.popup(async securityOverlay => {

                  this.headerPicker("loading", securityOverlay)

                  const register = {}
                  register.url = "/register/feedback/location/"
                  register.type = "html-value"
                  // register.id = input.id
                  register.importance = importance
                  register.content = content
                  const res = await Request.location(register)

                  if (res.status === 200) {
                    this.removeOverlay(securityOverlay)
                    this.removeOverlay(overlay)
                    feedbackButton.counter.innerHTML = parseInt(feedbackButton.counter.innerHTML) + 1
                  } else {
                    window.alert("Fehler.. Bitte wiederholen.")
                    this.removeOverlay(securityOverlay)
                  }

                })

              }


            })



          })

        }

        if (input) {

          input.append(feedbackButton)
          return resolve(feedbackButton)
        } else {
          await this.add("ms/timeout", 3000)
          await this.add(event, input)
        }
        // return feedbackButton
      })

    }

    if (event === "button/on-role-login-click") {

      input.button.onclick = async () => {

        const emailInput = document.querySelector(".email-input")
        const dsgvoInput = document.querySelector(".dsgvo-input")

        if (emailInput !== null) {
          if (dsgvoInput !== null) {

            if (Helper.verify("input/validity", emailInput) === false) throw new Error("email invalid")
            if (Helper.verify("input/validity", dsgvoInput) === false) throw new Error("dsgvo invalid")

            await Request.withVerifiedEmail(emailInput.value, async () => {

              const register = {}
              register.url = "/register/email/location/"
              register.email = emailInput.value
              register.id = input.roleId
              register.name = input.roleName
              const res = await Request.location(register)

              {
                const register = {}
                register.url = "/request/register/session/"
                const res = await Request.closed(register)

                if (res.status === 200) {
                  const redirect = {}
                  redirect.url = "/redirect/user/closed/"
                  const res = await Request.closed(redirect)
                  if (res.status === 200) window.location.assign(res.response)
                } else {
                  window.history.back()
                }
              }

            })
          }
        }

      }

    }

    if (event === "button/on-login-click") {

      input.onclick = async () => {

        const emailInput = document.querySelector(".email-input")
        const dsgvoInput = document.querySelector(".dsgvo-input")

        if (emailInput !== null) {
          if (dsgvoInput !== null) {

            if (Helper.verify("input/validity", emailInput) === false) throw new Error("email invalid")
            if (Helper.verify("input/validity", dsgvoInput) === false) throw new Error("dsgvo invalid")

            await Request.withVerifiedEmail(emailInput.value, async () => {

              if (emailInput.value.endsWith("@get-your.de")) {

                await Request.ping("/register/admin/location/", emailInput.value)
                .catch(error => {
                  window.alert("Fehler.. Bitte wiederholen.")
                  window.location.assign("/")
                })

              }

              {
                const register = {}
                register.url = "/request/register/session/"
                const res = await Request.closed(register)

                if (res.status === 200) {
                  const redirect = {}
                  redirect.url = "/redirect/user/closed/"
                  const res = await Request.closed(redirect)

                  if (res.status === 200) {
                    window.location.assign(res.response)
                  } else if (!Helper.stringIsEmpty(document.referrer)) {
                    window.location.assign(document.referrer)
                  } else {
                    window.history.back()
                  }

                } else {
                  window.history.back()
                }
              }

            })



          }
        }

      }

    }

    if (event === "input/onchecked") {

      if (input.type === "checkbox") {
        input.oninput = (ev) => {

          if (ev.target.checked === true) {
            ev.target.setAttribute("checked", "true")
          } else {
            ev.target.removeAttribute("checked")
          }

        }
      }
    }

    if (event === "input/oninput") {
      if (input.type === "email") {
        input.oninput = (ev) => {
          this.verify("input/validity", ev.target)
        }

      }

      if (input.type === "checkbox") {
        input.oninput = (ev) => {

          if (ev.target.checked === true) {
            ev.target.setAttribute("checked", "true")
          } else {
            ev.target.removeAttribute("checked")
          }

          this.verify("input/validity", ev.target)
        }
      }
    }

    if (event === "input/value") {

      if (input.type === "email") {

        if (window.localStorage.getItem("email") !== null) {
          input.value = window.localStorage.getItem("email")
          this.verify("input/validity", input)
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

  static get(event, parent, input) {
    // no parent needed to get data
    if (arguments.length === 2) {
      input = parent
    }

    if (event === "match-maker-list/closed") {

      return new Promise(async (resolve, reject) => {

        try {

          const get = {}
          get.url = "/get/match-maker/closed/"
          get.type = "list"
          get.conditions = parent
          get.tree = input
          const res = await Request.closed(get)

          resolve(res)
        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "match-maker-mirror/closed") {

      return new Promise(async (resolve, reject) => {

        try {

          const get = {}
          get.url = "/get/match-maker/closed/"
          get.type = "mirror"
          get.conditions = parent
          get.mirror = input
          const res = await Request.closed(get)

          resolve(res)
        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "match-maker-condition/closed") {

      return new Promise(async (resolve, reject) => {

        try {

          const get = {}
          get.url = "/get/match-maker/closed/"
          get.type = "condition"
          get.id = input
          const res = await Request.closed(get)

          resolve(res)
        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "match-maker-conditions/complete-closed") {

      return new Promise(async (resolve, reject) => {

        try {

          const get = {}
          get.url = "/get/match-maker/closed/"
          get.type = "complete-conditions"
          get.id = input
          const res = await Request.closed(get)

          resolve(res)

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "match-maker-conditions/closed") {

      return new Promise(async (resolve, reject) => {

        try {

          const get = {}
          get.url = "/get/match-maker/closed/"
          get.type = "conditions"
          get.id = input
          const res = await Request.closed(get)

          resolve(res)

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "match-maker-conditions/button-list-closed") {

      return new Promise(async (resolve, reject) => {

        parent.innerHTML = ""

        const get = {}
        get.url = "/get/match-maker/closed/"
        get.type = "conditions"
        get.id = input
        const res = await Request.closed(get)

        if (res.status === 200) {

          try {
            const array = JSON.parse(res.response)

            for (let i = 0; i < array.length; i++) {
              const condition = array[i]



              const conditionButton = this.create("button/left-right", parent)
              conditionButton.left.innerHTML = `condition-${array.length - i}`
              conditionButton.right.innerHTML = condition.id
              conditionButton.onclick = () => {

                this.popup(overlay => {

                  this.create("button/remove-overlay", overlay)
                  const info = this.create("header/info", overlay)
                  info.append(this.convert("text/span", `.condition.${condition.id}`))

                  const buttons = this.create("div/scrollable", overlay)

                  {

                    const button = this.create("button/left-right", buttons)
                    button.left.innerHTML = ".update"
                    button.right.innerHTML = "Bedingungen ändern"

                    button.onclick = () => {

                      this.popup(async overlay => {
                        this.create("button/remove-overlay", overlay)
                        const info = this.create("header/info", overlay)
                        info.innerHTML = `.update.${condition.id}`

                        const funnel = this.create("funnel/condition", overlay)

                        const res = await this.get("match-maker-condition/closed", condition.id)

                        if (res.status === 200) {
                          const condition = JSON.parse(res.response)

                          funnel.leftField.input.value = condition.left
                          funnel.operatorField.input.value = condition.operator
                          funnel.rightField.input.value = condition.right

                          this.verify("field-funnel/validity", funnel)
                        }

                        funnel.submit.onclick = async () => {

                          await this.verify("field-funnel/validity", funnel)

                          this.overlay("security", async securityOverlay => {

                            const map = {}
                            map.id = condition.id
                            map.left = funnel.leftField.input.value
                            map.operator = funnel.operatorField.input.value
                            map.right = funnel.rightField.input.value

                            const res = await this.update("condition/match-maker/closed", map)

                            if (res.status === 200) {

                              window.alert("Bedingung erfolgreich gespeichert.")
                              this.remove("overlay", overlay)
                              this.remove("overlay", securityOverlay)

                            }

                          })

                        }

                      })

                    }

                  }


                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.innerHTML = ".delete"
                    button.right.innerHTML = "Bedingung entfernen"

                    button.onclick = () => {
                      this.overlay("security", async securityOverlay => {

                        const res = await this.delete("match-maker-condition/closed", condition.id)

                        if (res.status === 200) {
                          window.alert("Bedingung erfolgreich entfernt.")
                          this.remove("element", conditionButton)
                          this.remove("overlay", overlay)
                          this.remove("overlay", securityOverlay)
                        }

                        if (res.status !== 200) {
                          window.alert("Fehler.. Bitte wiederholen.")
                          this.remove("overlay", securityOverlay)
                        }


                      })
                    }
                  }


                })

              }

            }

            return resolve()
          } catch (error) {
            return reject(error)
          }
        }


      })

    }

    if (event === "match-maker/toolbox-closed") {

      return new Promise(async (resolve, reject) => {

        try {

          const get = {}
          get.url = "/get/match-maker/closed/"
          get.type = "toolbox"
          const res = await Request.closed(get)

          resolve(res)

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "match-maker/closed") {

      return new Promise(async (resolve, reject) => {

        parent.innerHTML = ""

        const get = {}
        get.url = "/get/match-maker/closed/"
        get.platform = input
        const res = await Request.closed(get)

        if (res.status === 200) {

          try {
            const array = JSON.parse(res.response)

            for (let i = 0; i < array.length; i++) {
              const matchMaker = array[i]

              const matchMakerButton = this.create("button/left-right", parent)
              matchMakerButton.right.innerHTML = `match-maker-${array.length - i}`
              matchMakerButton.left.innerHTML = matchMaker.name
              matchMakerButton.onclick = () => {

                this.popup(overlay => {

                  this.create("button/remove-overlay", overlay)
                  const info = this.create("header/info", overlay)
                  info.append(this.convert("text/span", `.${matchMaker.name}`))

                  const buttons = this.create("div/scrollable", overlay)

                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.innerHTML = ".conditions"
                    button.right.innerHTML = "Bedingungen hinzufügen"

                    button.onclick = () => {

                      const map = {}
                      map.id = matchMaker.id

                      this.popup(async overlay => {

                        this.headerPicker("removeOverlay", overlay)
                        const info = this.headerPicker("info", overlay)
                        info.innerHTML = `.conditions`

                        const create = this.buttonPicker("left/right", overlay)
                        create.left.innerHTML = ".create"
                        create.right.innerHTML = "Neue Bedingung definieren"
                        create.addEventListener("click", () => {

                          this.popup(async overlay => {
                            this.headerPicker("removeOverlay", overlay)
                            const info = this.headerPicker("info", overlay)
                            info.append(this.convert("text/span", ".condition"))


                            const funnel = this.create("funnel/condition", overlay)

                            funnel.submit.onclick = async () => {

                              await this.verify("field-funnel/validity", funnel)

                              this.overlay("security", async securityOverlay => {

                                map.left = funnel.leftField.input.value
                                map.operator = funnel.operatorField.input.value
                                map.right = funnel.rightField.input.value

                                const res = await this.register("condition/match-maker/closed", map)

                                if (res.status === 200) {

                                  await this.get("match-maker-conditions/button-list-closed", conditionsContainer, matchMaker.id)
                                  this.remove("overlay", overlay)
                                  this.remove("overlay", securityOverlay)

                                }

                              })

                            }



                          })

                        })

                        this.render("text/hr", "Meine Bedingungen", overlay)

                        const conditionsContainer = this.create("div/scrollable", overlay)
                        await this.get("match-maker-conditions/button-list-closed", conditionsContainer, matchMaker.id)

                      })

                    }

                  }


                  {
                    const button = this.create("button/left-right", buttons)
                    button.left.innerHTML = ".delete"
                    button.right.innerHTML = "Match Maker entfernen"

                    button.onclick = () => {
                      this.overlay("security", async securityOverlay => {
                        const del = {}
                        del.url = "/delete/match-maker/closed/"
                        del.id = matchMaker.id
                        const res = await Request.closed(del)

                        if (res.status === 200) {
                          window.alert("Match Maker erfolgreich entfernt.")
                          this.remove("element", matchMakerButton)
                          this.remove("overlay", overlay)
                          this.remove("overlay", securityOverlay)
                        }

                        if (res.status !== 200) {
                          window.alert("Fehler.. Bitte wiederholen.")
                          this.remove("overlay", securityOverlay)
                        }


                      })
                    }
                  }


                })

              }

            }

            return resolve()
          } catch (error) {
            return reject(error)
          }
        }


      })

    }

    if (event === "location-list-funnel/closed") {

      return new Promise(async (resolve, reject) => {

        const get = {}
        get.url = "/get/location-list-funnel/closed/"
        get.tag = input.tag
        get.id = input.id
        const res = await Request.closed(get)

        if (res.status === 200) {

          try {
            const map = JSON.parse(res.response)

            await this.render("map/div", map, parent)

            return resolve()
          } catch (error) {
            window.alert("Fehler.. Daten sind fehlerhaft.")
            this.remove("element", parent)
            return reject(new Error("funnel invalid"))
          }
        }


        if (res.status !== 200) {
          return reject()
        }

      })

    }

    if (event === "location-list/closed") {

      return new Promise(async (resolve, reject) => {

        if (!parent.classList.contains("location-list")) parent.classList.add("location-list")

        const get = {}
        get.url = "/get/location-list/closed/"
        get.tag = input.tag
        const res = await Request.closed(get)

        if (res.status === 200) {
          const list = JSON.parse(res.response)

          this.convert("parent/scrollable", parent)

          for (let i = 0; i < list.length; i++) {
            const map = list[i]

            const mapButton = this.create("button/left-right", parent)
            mapButton.left.innerHTML = `${map.tag}-${i + 1}`
            mapButton.right.innerHTML = map.id
            mapButton.addEventListener("click", () => {

              this.popup(overlay => {

                this.create("button/remove-overlay", overlay)


                const buttons = this.create("div/scrollable", overlay)

                {
                  const button = this.create("button/left-right", buttons)
                  button.left.innerHTML = ".update"
                  button.onclick = () => {

                    this.popup(async overlay => {
                      this.create("button/remove-overlay", overlay)

                      this.render("text/title", `${map.tag}-${i + 1}`, overlay)

                      const content = this.create("div/scrollable", overlay)

                      await this.get("location-list-funnel/closed", content, map)

                      map.funnel = input.funnel
                      map.ok = () => this.remove("overlay", overlay)
                      this.update("funnel/location-list/closed", content, map)

                    })

                  }
                }

                {
                  const button = this.create("button/left-right", buttons)
                  button.left.innerHTML = ".delete"
                  button.onclick = () => {
                    this.overlay("security", async securityOverlay => {
                      const del = {}
                      del.url = "/delete/location-list-funnel/closed/"
                      del.tag = map.tag
                      del.id = map.id
                      const res = await Request.closed(del)

                      if (res.status === 200) {
                        window.alert("Daten erfolgreich entfernt.")
                        this.remove("element", mapButton)
                        this.remove("overlay", overlay)
                        this.remove("overlay", securityOverlay)
                      }

                      if (res.status !== 200) {
                        window.alert("Fehler.. Bitte wiederholen.")
                        this.remove("overlay", securityOverlay)
                      }

                    })
                  }
                }

              })

            })


          }

          return resolve()
        }


        if (res.status !== 200) {
          return reject()
        }

      })

    }

    if (event === "logs/error") {

      return new Promise(async (resolve, reject) => {

        const content = this.headerPicker("loading", parent)

        const get = {}
        get.url = "/get/logs/closed/2/"
        get.type = "error"
        const res = await Request.closed(get)

        if (res.status === 200) {
          const errors = JSON.parse(res.response)

          this.convert("parent/scrollable", content)


          for (let i = 0; i < errors.length; i++) {
            const error = errors[i]


            const button = this.buttonPicker("left/right", content)
            button.addEventListener("click", () => {

              this.popup(overlay => {
                this.create("button/remove-overlay", overlay)

                this.render("text/code", error.stack, overlay)
              })
            })

            button.left.innerHTML = /*html*/`

            <div>Fehler:</div>
            <div>${error.message}</div>
          `


            button.right.innerHTML = /*html*/`

              <div>Anfrage:</div>
              <div>${error.method}</div>
              <div>an: ${error.endpoint}</div>
              <div>von: ${error.location}</div>
              <div>ursprung: ${error.referer}</div>
            `

          }

          return resolve()
        }


        if (res.status !== 200) {
          return reject()
        }

      })

    }

    if (event === "logs/info") {

      return new Promise(async (resolve, reject) => {

        const content = this.headerPicker("loading", parent)

        const get = {}
        get.url = "/get/logs/closed/2/"
        get.type = "info"
        const res = await Request.closed(get)

        if (res.status === 200) {
          const infos = JSON.parse(res.response)

          this.convert("parent/scrollable", content)

          for (let i = 0; i < infos.length; i++) {
            const info = infos[i]

            const button = this.buttonPicker("left/right", content)

            if (typeof info.input === "object") {
              info.input = JSON.stringify(info.input, null, 2)
            }

            button.left.innerHTML = /*html*/`
            <div>Input:</div>
            <div>${info.input}</div>
            <div>ist ein ${info.is}</div>
          `


            button.right.innerHTML = /*html*/`

              <div>Anfrage:</div>
              <div>${info.method}</div>
              <div>an: ${info.endpoint}</div>
              <div>von: ${info.location}</div>
              <div>ursprung: ${info.referer}</div>
            `

          }

          return resolve()
        }


        if (res.status !== 200) {
          return reject()
        }

      })

    }

    if (event === "toolbox/closed") {

      return new Promise(async(resolve, reject) => {

        const get = {}
        get.url = "/get/toolbox/closed/"
        const res = await Request.closed(get)

        if (res.status === 200) {
          const toolboxScript = new DOMParser().parseFromString(res.response, "text/html").getElementById("toolbox")
          const script = document.createElement("script")
          script.id = toolboxScript.id
          script.type = toolboxScript.type
          script.innerHTML = toolboxScript.innerHTML

          document.querySelectorAll("#toolbox").forEach(toolbox => toolbox.remove())

          if (document.getElementById("#toolbox") === null) {
            document.body.append(script)
            return resolve(res)
          }

        }

        if (res.status !== 200) {
          return reject(res)
        }

      })

    }

    if (event === "funnel/onclick-assign-path") {

      const pathField = new TextField("path", parent)
      pathField.label.innerHTML = "Definiere den Pfad für deine Weiterleitung, sobald auf dieses Element geklickt wird"
      pathField.input.required = true
      pathField.input.accept = "text/path"
      pathField.verifyValue()

      pathField.input.addEventListener("input", (event) => {

        if (this.stringIsEmpty(event.target.value)) input.removeAttribute("onclick")

        const path = pathField.validValue()

        input.setAttribute("onclick", `window.location.assign("${path}")`)

      })


    }

    if (event === "funnel/select-option") {

      const optionField = new TextField("option", parent)
      optionField.label.innerHTML = "Antwortmöglichkeit"
      optionField.input.required = true
      optionField.verifyValue()
      optionField.input.addEventListener("input", () => {

        const value = optionField.validValue()

        if (input !== undefined) {
          if (input.tagName === "OPTION") {
            input.value = value
            input.text = value
          }
        }

      })

      if (input !== undefined) {
        if (input.tagName === "OPTION") {
          optionField.value(() => input.value)
          optionField.verifyValue()
        }
      }

      if (input !== undefined) {
        if (input.tagName !== "OPTION") {
          const submitButton = this.buttonPicker("action", parent)
          submitButton.innerHTML = "Option jetzt anhängen"
          submitButton.addEventListener("click", async () => {

            const value = optionField.validValue()

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




        parent.innerHTML = ""
        for (let i = 0; i < input.children.length; i++) {
          const field = input.children[i]

          if (field.classList.contains("submit-field-funnel-button")) continue

          if (field.classList.contains("field")) {
            const fieldInput = field.querySelector(".field-input")


            const button = this.buttonPicker("left/right", parent)
            button.left.innerHTML = field.id

            button.right.append(this.convert("input/alias", fieldInput))
            button.addEventListener("click", () => {
              this.popup(overlay => {
                this.headerPicker("removeOverlay", overlay)
                this.buttonPicker("toolbox/register-html", overlay)

                const info = this.headerPicker("info", overlay)
                info.append(this.convert("input/alias", fieldInput))


                const content = this.headerPicker("scrollable", overlay)



                if (fieldInput.tagName === "SELECT") {


                  {
                    const button = this.buttonPicker("left/right", content)
                    button.left.innerHTML = ".options"
                    button.right.innerHTML = "Antwortmöglichkeiten definieren"
                    button.addEventListener("click", () => {
                      this.popup(overlay => {
                        this.headerPicker("removeOverlay", overlay)

                        const info = this.headerPicker("info", overlay)
                        info.append(this.convert("input/alias", fieldInput))
                        info.append(this.convert("text/span", ".options"))

                        {
                          const button = this.buttonPicker("left/right", overlay)
                          button.left.innerHTML = ".append"
                          button.right.innerHTML = "Neue Antwortmöglichkeit anhängen"
                          button.addEventListener("click", () => {

                            this.popup(overlay => {
                              this.headerPicker("removeOverlay", overlay)

                              const info = this.headerPicker("info", overlay)
                              info.append(this.convert("input/alias", fieldInput))
                              info.append(this.convert("text/span", ".option.append"))

                              const optionFunnel = this.headerPicker("scrollable", overlay)

                              const optionField = new TextAreaField("option", optionFunnel)
                              optionField.label.innerHTML = "Antwortmöglichkeit"
                              optionField.input.required = true
                              optionField.verifyValue()
                              optionField.input.addEventListener("input", () => optionField.verifyValue())

                              const submitButton = this.buttonPicker("action", optionFunnel)
                              submitButton.innerHTML = "Option jetzt anhängen"
                              submitButton.addEventListener("click", async () => {

                                const value = optionField.validValue()

                                const option = document.createElement("option")
                                option.value = value
                                option.text = value
                                fieldInput.appendChild(option)

                                this.render("select/options", fieldInput, options)

                                this.removeOverlay(overlay)

                              })



                            })
                          })
                        }



                        overlay.append(this.convert("text/hr", "Optionen"))

                        const options = this.headerPicker("scrollable", overlay)
                        this.render("select/options", fieldInput, options)

                      })
                    })
                  }

                }

                field.ok = () => {
                  this.get(event, parent, input)
                  this.removeOverlay(overlay)
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

      const idField = new TextField("id", funnel)
      idField.input.required = true
      idField.input.accept = "text/tag"
      idField.label.innerHTML = "Gebe deinem Datenfeld eine Id"
      idField.verifyValue()
      idField.input.addEventListener("input", () => {

        const id = idField.validValue()

        if (document.getElementById(id) !== null) {
          this.setNotValidStyle(idField.input)
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
            idField.value(() => input.getAttribute("id"))
            idField.verifyValue()
          }
        }
      }


      const labelField = new TextAreaField("question", funnel)
      labelField.label.innerHTML = "Beschreibe das Datenfeld für dein Netzwerk"
      labelField.input.required = true
      labelField.verifyValue()
      labelField.input.addEventListener("input", () => {

        const label = input.querySelector(".field-label")
        const value = labelField.validValue()
        if (input !== undefined) {
          if (input.classList.contains("field")) {
            if (label !== null) {
              label.innerHTML = value
            }
          }
        }

        labelField.verifyValue()
      })

      if (input !== undefined) {
        if (input.classList.contains("field")) {
          if (input.querySelector(".field-label") !== null) {
            labelField.value(() => input.querySelector(".field-label").innerHTML)
            labelField.verifyValue()
          }
        }
      }

      const infoField = new TextAreaField("info", funnel)
      infoField.label.innerHTML = "Hier kannst du, wenn du möchtest, mehr Informationen zu diesem Datenfeld, als HTML, für deine Nutzer, bereitstellen"
      infoField.input.style.height = "144px"
      infoField.input.placeholder = "<div>..</div>"
      infoField.input.style.fontFamily = "monospace"
      infoField.input.style.fontSize = "13px"
      infoField.verifyValue()

      infoField.input.addEventListener("input", () => {
        const info = infoField.validValue()

        this.update("script/on-field-info-click-event", document.body)

        if (this.stringIsEmpty(info)) return input.removeAttribute("on-info-click")

        if (input !== undefined) {
          if (input.classList.contains("field")) {
            input.setAttribute("on-info-click", info)
          }
        }

        infoField.verifyValue()
      })

      if (input !== undefined) {
        if (input.classList.contains("field")) {
          if (input.hasAttribute("on-info-click")) {
            infoField.value(() => input.getAttribute("on-info-click"))
            infoField.verifyValue()
          }
        }
      }

      const typeField = new SelectionField("type", funnel)
      typeField.label.innerHTML = "Welchen Datentyp soll dein Netzwerk eingeben können"
      typeField.options(["text", "textarea", "email", "tel", "range", "password", "number", "file", "date", "checkbox", "select"])
      typeField.verifyValue()
      typeField.select.addEventListener("input", () => {
        const value = typeField.validValue()[0].value

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
            typeField.value(() => [type])

            const fieldInputFunnel = this.create("div", funnel)
            this.render("funnel/field-input", {type, field: input}, fieldInputFunnel)

          }
        }
      }

      if (input !== undefined) {
        if (input.classList.contains("field-funnel")) {

          const button = this.buttonPicker("action", funnel)
          button.innerHTML = "Datenfeld jetzt anhängen"
          button.addEventListener("click", async () => {

            const id = idField.validValue()
            const type = typeField.validValue()[0].value
            const label = labelField.validValue()
            const info = infoField.validValue()

            if (document.getElementById(id) !== null) {
              window.alert("Id existiert bereits.")
              idField.field.scrollIntoView({behavior: "smooth"})
              this.setNotValidStyle(idField.input)
              throw new Error("id exist")
            }

            if (document.getElementById(id) === null) {

              const field = this.convert("text/field", type)
              field.id = id
              field.label.textContent = label

              if (!this.stringIsEmpty(info)) {
                field.setAttribute("on-info-click", info)
                this.update("script/on-field-info-click-event", document.body)
              }

              input.querySelector(".submit-field-funnel-button").before(field)
              if (input.ok !== undefined) await input.ok()

            }

          })

        }
      }


      if (input !== undefined) {
        if (input.classList.contains("field")) {

          const button = this.buttonPicker("delete", funnel)
          button.innerHTML = "Datenfeld entfernen"
          button.addEventListener("click", async () => {

            input.remove()
            if (input.ok !== undefined) await input.ok()


          })

        }
      }

    }

    if (event === "funnel/service-condition") {

      const funnel = this.create("div/scrollable", parent)


      this.render("text/title", "Wenn..", funnel)

      const leftField = new TextField("left", funnel)
      leftField.label.innerHTML = "Id"
      leftField.input.maxLength = "55"
      leftField.input.required = true
      leftField.input.accept = "text/tag"
      leftField.input.placeholder = "gas-preis"
      leftField.verifyValue()
      leftField.input.addEventListener("input", () => leftField.verifyValue())

      const operatorField = new TextField("operator", funnel)
      operatorField.label.innerHTML = "Operator"
      operatorField.input.placeholder = ">="
      operatorField.input.maxLength = "3"
      operatorField.input.accept = "text/operator"
      operatorField.input.required = true
      operatorField.verifyValue()
      operatorField.input.addEventListener("input", () => operatorField.verifyValue())

      const rightField = new TextField("right", funnel)
      rightField.label.innerHTML = "Vergleichswert"
      rightField.input.maxLength = "21"
      rightField.input.required = true
      rightField.input.placeholder = "1989"
      rightField.verifyValue()
      rightField.input.addEventListener("input", () => rightField.verifyValue())

      this.render("text/title", "Dann..", funnel)

      const actionField = new TextAreaField("action", funnel)
      actionField.label.innerHTML = "Verändere deine Servicewerte mit Javascript"
      actionField.input.style.height = "144px"
      actionField.input.required = true
      // actionField.input.accept = "text/service"
      actionField.input.placeholder = `service.selected = true\nservice.price = 3500\nservice.title = "Mein neuer Service"`
      actionField.verifyValue()
      actionField.input.addEventListener("input", () => actionField.verifyValue())


      const button = this.buttonPicker("action", funnel)
      button.innerHTML = "Bedingung jetzt speichern"
      button.addEventListener("click", () => {

        const condition = {}
        condition.left = leftField.validValue()
        condition.operator = operatorField.validValue()
        condition.right = rightField.validValue()
        condition.action = actionField.validValue()

        if (input !== undefined) {
          condition.service = input.service

          if (!this.numberIsEmpty(input.id)) {
            condition.id = input.id
          }

          if (!this.stringIsEmpty(input.platform)) {
            condition.platform = input.platform
          }

        }


        this.overlay("security", async securityOverlay => {

          await this.update("service-condition/closed", securityOverlay, condition)

          if (input !== undefined) {
            if (input.ok !== undefined) await input.ok()
          }

          this.removeOverlay(securityOverlay)

        })

      })

      if (input !== undefined) {

        if (!this.numberIsEmpty(input.id)) {

          const button = this.buttonPicker("delete", funnel)
          button.innerHTML = "Bedingung entfernen"
          button.addEventListener("click", () => {

            this.overlay("security", async securityOverlay => {
              const del = {}
              del.url = "/delete/service-condition/closed/"
              if (input !== undefined) {
                del.id = input.id
                del.service = input.service
                del.platform = input.platform
              }
              const res = await Request.closed(del)

              if (res.status === 200) {
                window.alert("Bedingung erfolgreich gelöscht.")
                if (input.ok !== undefined) await input.ok()
                this.removeOverlay(securityOverlay)
              } else {
                this.redirect("session-expired")
              }

            })


          })

        }

        leftField.value(() => input.left)
        leftField.verifyValue()

        operatorField.value(() => input.operator)
        operatorField.verifyValue()

        rightField.value(() => input.right)
        rightField.verifyValue()

        actionField.value(() => input.action)
        actionField.verifyValue()

      }

    }

    if (event === "service-conditions/closed") {

      return new Promise(async (resolve, reject) => {

        const content = this.headerPicker("loading", parent)

        const get = {}
        get.url = "/get/conditions/closed/"

        if (input !== undefined) {
          if (!this.numberIsEmpty(input.service)) {
            get.service = input.service
          }
          if (!this.stringIsEmpty(input.platform)) {
            get.platform = input.platform
          }
        }

        const res = await Request.closed(get)

        if (res.status === 200) {
          const conditions = JSON.parse(res.response)

          this.convert("parent/scrollable", content)

          for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i]

            const button = this.buttonPicker("left/right", content)
            button.right.innerHTML = condition.left
            button.left.innerHTML = `Bedingung ${conditions.length - i}`

            button.addEventListener("click", () => {
              this.popup(overlay => {
                this.headerPicker("removeOverlay", overlay)
                const info = this.headerPicker("info", overlay)
                info.append(this.convert("text/span", ".condition"))


                if (input !== undefined) {
                  if (!this.numberIsEmpty(input.service)) {
                    condition.service = input.service
                  }
                  if (!this.stringIsEmpty(input.platform)) {
                    condition.platform = input.platform
                  }
                }


                // condition.service = input.service
                condition.ok = async () => {

                  this.reset(content)
                  await this.get(event, content, condition)
                  this.removeOverlay(overlay)

                }

                this.get("funnel/service-condition", overlay, condition)

              })
            })

          }

          return resolve(content)

        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject(new Error("get conditions failed"))
        }

      })

    }

    if (event === "script/closed") {

      return new Promise(async (resolve, reject) => {

        const get = {}
        get.url = "/get/script/closed/"
        // console.log(input);
        get.id = input

        const res = await Request.closed(get)

        if (res.status === 200) {
          const script = JSON.parse(res.response)
          return resolve(script)
        }


        if (res.status !== 200) {
          return reject(new Error("script not found"))
        }

      })

    }

    if (event === "funnel/script") {

      const funnel = this.create("div/scrollable", parent)

      if (input !== undefined) {
        if (!this.numberIsEmpty(input.id)) {

          const button = this.buttonPicker("left/right", funnel)
          button.left.innerHTML = ".preview"
          button.right.innerHTML = "Skript laden"

          const feedbackButton = this.buttonPicker("left/right", funnel)
          feedbackButton.left.innerHTML = ".feedback"
          this.update("feedback/script/location", feedbackButton, input)

          this.get("script/closed", null, input.id).then(res => {
            feedbackButton.counter = document.createElement("div")
            feedbackButton.counter.innerHTML = res.feedbackLength
            feedbackButton.right.append(feedbackButton.counter)

            scriptField.input.value = res.script
            nameField.input.value = res.name

            this.verify("field-funnel/validity", funnel)

            button.addEventListener("click", async () => {

              await this.verify("field-funnel/validity", funnel)
              try {

                const html = this.convert("text/dom", res.script)

                if (html.tagName === "SCRIPT") {

                  const script = this.convert("js/script", html.innerHTML)
                  script.id = "script-for-testing"
                  script.type = "module"

                  if (document.getElementById("script-for-testing") !== null) {
                    document.getElementById("script-for-testing").remove()
                  }

                  if (document.getElementById("script-for-testing") === null) {
                    document.body.removeAttribute("style")
                    document.querySelectorAll(".overlay").forEach(overlay => overlay.remove())
                    document.body.append(script)
                  }

                }

              } catch (error) {
                console.error(error)
              }

            })
          })

        }
      }

      const nameField = this.create("field/name", funnel)
      nameField.input.placeholder = "mein-skript"
      this.verify("input/validity", nameField.input)
      nameField.input.addEventListener("input", () => this.verify("input/validity", nameField.input))

      const scriptField = this.create("field/script", funnel)
      scriptField.input.style.height = "100vh"
      this.verify("input/validity", scriptField.input)
      scriptField.input.addEventListener("input", () => this.verify("input/validity", scriptField.input))


      const button = this.buttonPicker("action", funnel)
      button.innerHTML = "Skript jetzt speichern"
      button.addEventListener("click", async () => {

        await this.verify("field-funnel/validity", funnel)

        const map = {}
        map.script = scriptField.input.value
        map.name = nameField.input.value

        if (input !== undefined) {

          if (!this.numberIsEmpty(input.id)) {
            map.id = input.id
          }

        }

        this.overlay("security", async securityOverlay => {

          await this.update("script/closed", securityOverlay, map)

          if (input !== undefined) {
            if (input.ok !== undefined) await input.ok()
          }

          this.removeOverlay(securityOverlay)

        })

      })

      if (input !== undefined) {

        if (!this.numberIsEmpty(input.id)) {

          const button = this.buttonPicker("delete", funnel)
          button.innerHTML = "Skript entfernen"
          button.addEventListener("click", () => {

            this.overlay("security", async securityOverlay => {
              const del = {}
              del.url = "/delete/script/closed/"
              del.id = input.id
              const res = await Request.closed(del)

              if (res.status === 200) {
                if (input.ok !== undefined) await input.ok()
                this.removeOverlay(securityOverlay)
              } else {
                this.redirect("session-expired")
              }

            })


          })

        }

      }

    }

    if (event === "funnel/service") {

      const funnel = this.create("div/scrollable", parent)

      if (input !== undefined) {
        if (!this.numberIsEmpty(input.id)) {

          const button = this.buttonPicker("left/right", funnel)
          button.left.innerHTML = ".conditions"
          button.right.innerHTML = "Bedingungen hinzufügen"

          button.addEventListener("click", () => {

            let map
            if (input !== undefined) {
              map = {}

              if (!this.numberIsEmpty(input.id)) {
                map.service = input.id
              }

              if (!this.stringIsEmpty(input.platform)) {
                map.platform = input.platform
              }

            }


            this.popup(async overlay => {

              this.headerPicker("removeOverlay", overlay)
              const info = this.headerPicker("info", overlay)
              info.innerHTML = `.conditions`

              const create = this.buttonPicker("left/right", overlay)
              create.left.innerHTML = ".create"
              create.right.innerHTML = "Neue Bedingung definieren"
              create.addEventListener("click", () => {

                this.popup(overlay => {
                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.append(this.convert("text/span", ".service"))

                  map.ok = async () => {

                    this.reset(container)
                    await this.get("service-conditions/closed", container, map)
                    this.removeOverlay(overlay)

                  }

                  this.get("funnel/service-condition", overlay, map)

                })

              })

              this.render("text/hr", "Meine Bedingungen", overlay)

              const container = await this.get("service-conditions/closed", overlay, map)

            })
          })

        }
      }

      const quantityField = new TelField("quantity", funnel)
      quantityField.label.innerHTML = "Menge"
      quantityField.input.placeholder = "0"
      quantityField.input.maxLength = "8"
      quantityField.input.required = true
      quantityField.input.accept = "text/+int"
      quantityField.verifyValue()
      quantityField.input.addEventListener("input", () => quantityField.verifyValue())

      const unitField = new TextField("unit", funnel)
      unitField.label.innerHTML = "Einheit"
      unitField.input.maxLength = "8"
      unitField.input.required = true
      unitField.input.placeholder = "Stk."
      unitField.verifyValue()
      unitField.input.addEventListener("input", () => unitField.verifyValue())

      const titleField = new TextField("title", funnel)
      titleField.label.innerHTML = "Titel"
      titleField.input.placeholder = "HIGH PERFORMANCE MODULE"
      titleField.input.maxLength = "55"
      titleField.input.required = true
      titleField.verifyValue()
      titleField.input.addEventListener("input", () => titleField.verifyValue())

      const priceField = new TelField("price", funnel)
      priceField.label.innerHTML = "Preis"
      priceField.input.maxLength = "8"
      priceField.input.required = true
      priceField.input.accept = "text/+int"
      priceField.input.placeholder = "3500"
      priceField.verifyValue()
      priceField.input.addEventListener("input", () => priceField.verifyValue())

      const currencyField = new TextField("currency", funnel)
      currencyField.label.innerHTML = "Währung"
      currencyField.input.maxLength = "8"
      currencyField.input.required = true
      currencyField.input.placeholder = "Euro"
      currencyField.verifyValue()
      currencyField.input.addEventListener("input", () => currencyField.verifyValue())

      const selectedField = new CheckboxField("selected", funnel)
      selectedField.label.innerHTML = "Soll diese Leistung aktiv sein"
      selectedField.verifyValue()
      selectedField.input.addEventListener("input", () => selectedField.verifyValue())


      // console.log(input);
      const button = this.buttonPicker("action", funnel)
      button.innerHTML = "Leistung jetzt speichern"
      button.addEventListener("click", () => {

        const service = {}
        service.quantity = quantityField.validValue()
        service.unit = unitField.validValue()
        service.title = titleField.validValue()
        service.price = priceField.validValue()
        service.currency = currencyField.validValue()
        service.selected = selectedField.validValue()


        if (input !== undefined) {

          if (!this.numberIsEmpty(input.id)) {
            service.id = input.id
          }

          // console.log(input.platform);

          if (!this.stringIsEmpty(input.platform)) {
            service.platform = input.platform
          }


        }

        // console.log(input);

        this.overlay("security", async securityOverlay => {

          await this.update("service/closed", securityOverlay, service)

          if (input !== undefined) {
            if (input.ok !== undefined) await input.ok()
          }

          this.removeOverlay(securityOverlay)

        })

      })

      if (input !== undefined) {

        if (!this.numberIsEmpty(input.id)) {

          const button = this.buttonPicker("delete", funnel)
          button.innerHTML = "Leistung entfernen"
          button.addEventListener("click", () => {

            this.overlay("security", async securityOverlay => {
              const del = {}
              del.url = "/delete/service/closed/"
              del.id = input.id
              if (!this.stringIsEmpty(input.platform)) {
                del.platform = input.platform
              }
              const res = await Request.closed(del)

              if (res.status === 200) {
                window.alert("Leistung erfolgreich gelöscht.")
                if (input.ok !== undefined) await input.ok()
                this.removeOverlay(securityOverlay)
              } else {
                window.alert("Fehler.. Bitte wiederholen.")
                this.removeOverlay(securityOverlay)
              }

            })


          })

        }

        quantityField.value(() => input.quantity)
        quantityField.verifyValue()

        unitField.value(() => input.unit)
        unitField.verifyValue()

        titleField.value(() => input.title)
        titleField.verifyValue()

        priceField.value(() => input.price)
        priceField.verifyValue()

        currencyField.value(() => input.currency)
        currencyField.verifyValue()

        selectedField.value(() => input.selected)
        selectedField.verifyValue()

      }

    }

    if (event === "toolbox-scripts/closed"){

      return new Promise(async(resolve, reject) => {

        const units = this.headerPicker("loading", parent)
        {

          const get = {}
          get.url = "/get/toolbox-scripts/closed/"
          const res = await Request.closed(get)

          if (res.status !== 200) {
            this.reset(units)
            this.convert("element/center", units)
            units.style.zIndex = "-1"
            units.style.fontFamily = "sans-serif"
            units.innerHTML = `<span style="margin: 21px 34px;">Keine Skripte gefunden.</span>`
            throw new Error("values not found")
          }

          if (res.status === 200) {
            const scripts = JSON.parse(res.response)

            if (scripts.length === 0) {
              this.reset(units)
              this.convert("element/center", units)
              units.style.zIndex = "-1"
              units.style.fontFamily = "sans-serif"
              units.innerHTML = `<span style="margin: 21px 34px;">Keine Skripte gefunden.</span>`
              throw new Error("platform scripts is empty")
            }

            this.convert("parent/scrollable", units)

            this.render("scripts/toolbox", scripts, units)

            return resolve()

          }

        }

      })


    }

    if (event === "scripts/closed") {

      return new Promise(async (resolve, reject) => {

        const content = this.headerPicker("loading", parent)

        const get = {}
        get.url = "/get/scripts/closed/"
        const res = await Request.closed(get)

        if (res.status === 200) {
          const scripts = JSON.parse(res.response)

          this.convert("parent/scrollable", content)

          for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i]

            const button = this.buttonPicker("left/right", content)
            if (script.name !== undefined) {
              button.right.innerHTML = script.name
            }
            button.left.innerHTML = `Skript ${scripts.length - i}`

            button.addEventListener("click", () => {
              this.popup(overlay => {
                this.headerPicker("removeOverlay", overlay)
                const info = this.headerPicker("info", overlay)
                info.append(this.convert("text/span", ".script"))

                script.ok = async () => {

                  this.reset(content)
                  await this.get(event, content, script)
                  this.removeOverlay(overlay)

                }

                this.get("funnel/script", overlay, script)

              })
            })

          }

          return resolve(content)

        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject(new Error("get scripts failed"))
        }

      })

    }

    if (event === "services/closed") {

      return new Promise(async (resolve, reject) => {

        const content = this.headerPicker("loading", parent)

        // console.log(input);

        const get = {}
        get.url = "/get/services/closed/"
        if (input !== undefined) {
          get.platform = input.platform
        }
        // console.log(get);
        const res = await Request.closed(get)

        if (res.status === 200) {
          const services = JSON.parse(res.response)

          // console.log(services);

          this.convert("parent/scrollable", content)

          for (let i = 0; i < services.length; i++) {
            const service = services[i]

            if (input !== undefined) {
              if (!this.stringIsEmpty(input.platform)) {
                service.platform = input.platform
              }
            }

            const button = this.buttonPicker("left/right", content)
            button.right.innerHTML = service.title
            button.left.innerHTML = `Leistung ${services.length - i}`

            button.addEventListener("click", () => {
              this.popup(overlay => {
                this.headerPicker("removeOverlay", overlay)
                const info = this.headerPicker("info", overlay)
                info.append(this.convert("text/span", ".service"))

                service.ok = async () => {

                  this.reset(content)
                  await this.get(event, content, service)
                  this.removeOverlay(overlay)

                }

                this.get("funnel/service", overlay, service)

              })
            })

          }

          return resolve(content)

        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject(new Error("get services failed"))
        }

      })

    }

    if (event === "funnel/offer") {

      this.convert("parent/scrollable", parent)

      if (input !== undefined) {

        if (!this.numberIsEmpty(input.id)) {
          const button = this.buttonPicker("left/right", parent)
          button.left.innerHTML = ".preview"
          button.right.innerHTML = "Angebot Vorschau"
          button.addEventListener("click", () => {
            window.alert("Bald verfügbar.")
            // add popup with overlay as printable preview
            // or new page with preview
          })
        }

      }

      const nameField = new TextField("name", parent)
      nameField.label.innerHTML = "Name (text/tag)"
      nameField.input.accept = "text/tag"
      nameField.input.maxLength = "21"
      nameField.input.required = true
      nameField.input.placeholder = "mein-angebot"
      nameField.verifyValue()
      nameField.input.addEventListener("input", () => nameField.verifyValue())

      const expiredField = new TelField("expired", parent)
      expiredField.label.innerHTML = "Gültigkeit des Angebots in Wochen (1-9)"
      expiredField.input.pattern = "[1-9]"
      expiredField.input.placeholder = "2"
      expiredField.input.required = true
      expiredField.verifyValue()
      expiredField.input.addEventListener("input", () => expiredField.verifyValue())

      const titleField = new TextField("title", parent)
      titleField.label.innerHTML = "Titel"
      titleField.input.placeholder = "Mein Angebot"
      titleField.input.maxLength = "55"
      titleField.input.required = true
      titleField.verifyValue()
      titleField.input.addEventListener("input", () => titleField.verifyValue())

      const linkField = new TextField("link", parent)
      linkField.label.innerHTML = "Webseiten Link"
      linkField.input.placeholder = "https://meine-webseite.info"
      linkField.input.maxLength = "89"
      linkField.input.required = true
      linkField.verifyValue()
      linkField.input.addEventListener("input", () => linkField.verifyValue())

      const descriptionField = new TextAreaField("description", parent)
      descriptionField.label.innerHTML = "Beschreibe dein Angebot"
      descriptionField.input.maxLength = "144"
      descriptionField.input.style.height = "144px"
      descriptionField.input.required = true
      descriptionField.input.placeholder = "Komplettpaket für die Montage Ihrer .."
      descriptionField.verifyValue()
      descriptionField.input.addEventListener("input", () => descriptionField.verifyValue())

      const messageField = new TextAreaField("message", parent)
      messageField.label.innerHTML = "Eine Begrüßungs-Nachricht im Angebotsschreiben"
      messageField.input.maxLength = "987"
      messageField.input.style.height = "144px"
      messageField.input.placeholder = "Wir sind Ihnen schon jetzt für Ihr Vertrauen und Ihr Interesse an unserem System, zur Erzielung einer .., dankbar und freuen uns heute .."
      messageField.input.required = true
      messageField.verifyValue()
      messageField.input.addEventListener("input", () => messageField.verifyValue())

      const noteField = new TextAreaField("note", parent)
      noteField.label.innerHTML = "Eine Bitte-Beachten-Notiz im Angebotsschreiben"
      noteField.input.maxLength = "987"
      noteField.input.style.height = "144px"
      noteField.input.placeholder = "Befindet sich die Stellfläche des Gerüsts auf einem öffentlichen Gehweg, muss der .."
      noteField.input.required = true
      noteField.verifyValue()
      noteField.input.addEventListener("input", () => noteField.verifyValue())

      const companyField = new TextField("company", parent)
      companyField.label.innerHTML = "Firma"
      companyField.input.maxLength = "55"
      companyField.input.placeholder = "Meine Firma"
      companyField.input.required = true
      companyField.verifyValue()
      companyField.input.addEventListener("input", () => companyField.verifyValue())

      const sectorField = new TextField("sector", parent)
      sectorField.label.innerHTML = "Branche"
      sectorField.input.maxLength = "55"
      sectorField.input.placeholder = "Energie"
      sectorField.input.required = true
      sectorField.verifyValue()
      sectorField.input.addEventListener("input", () => sectorField.verifyValue())

      const streetField = new TextField("street", parent)
      streetField.label.innerHTML = "Straße und Hausnummer"
      streetField.input.maxLength = "55"
      streetField.input.placeholder = "Wiesentalstr. 44c"
      streetField.input.required = true
      streetField.verifyValue()
      streetField.input.addEventListener("input", () => streetField.verifyValue())

      const zipField = new TelField("zip", parent)
      zipField.label.innerHTML = "Postleitzahl"
      zipField.input.maxLength = "13"
      zipField.input.required = true
      zipField.input.placeholder = "70184"
      zipField.verifyValue()
      zipField.input.addEventListener("input", () => zipField.verifyValue())

      const cityField = new TextField("city", parent)
      cityField.label.innerHTML = "Stadt"
      cityField.input.maxLength = "55"
      cityField.input.required = true
      cityField.input.placeholder = "Stuttgart"
      cityField.verifyValue()
      cityField.input.addEventListener("input", () => cityField.verifyValue())





      const termsField = this.create("field/url", parent)
      termsField.label.innerHTML = "Lade deine AGBs als PDF hoch"
      termsField.input.placeholder = "https://nft-storage.link"
      termsField.input.accept = "text/https"
      termsField.input.required = true

      if (input.termsPdf !== undefined) {
        termsField.input.value = input.termsPdf
      }

      this.verify("input/validity", termsField.input)
      termsField.input.addEventListener("input", () => this.verify("input/validity", termsField.input))


      const productInfoField = this.create("field/url", parent)
      productInfoField.label.innerHTML = "Lade deine Produkt- und Dienstleistungs-Broschüre als PDF hoch"
      productInfoField.input.accept = "text/https"
      productInfoField.input.required = true
      productInfoField.input.placeholder = "https://nft-storage.link"

      if (input.productPdf !== undefined) {
        productInfoField.input.value = input.termsPdf
      }

      this.verify("input/validity", productInfoField.input)
      productInfoField.input.addEventListener("input", () => this.verify("input/validity", productInfoField.input))

      const companyInfoField = this.create("field/url", parent)
      companyInfoField.label.innerHTML = "Lade deine Unternehmens-Broschüre als PDF hoch"
      companyInfoField.input.accept = "text/https"
      companyInfoField.input.required = true
      companyInfoField.input.placeholder = "https://nft-storage.link"

      if (input.companyPdf !== undefined) {
        companyInfoField.input.value = input.termsPdf
      }

      this.verify("input/validity", companyInfoField.input)
      companyInfoField.input.addEventListener("input", () => this.verify("input/validity", companyInfoField.input))




      const vatField = new TelField("vat", parent)
      vatField.label.innerHTML = "Steuern in %"
      vatField.input.required = true
      vatField.input.accept = "text/+int"
      vatField.verifyValue()
      vatField.input.addEventListener("input", () => vatField.verifyValue())

      const discountField = new TelField("discount", parent)
      discountField.label.innerHTML = "Rabatt in %"
      discountField.input.required = true
      discountField.input.accept = "text/+int"
      discountField.verifyValue()
      discountField.input.addEventListener("input", () => discountField.verifyValue())

      const button = this.buttonPicker("action", parent)
      button.innerHTML = "Angebot jetzt speichern"
      button.addEventListener("click", async () => {

        const offer = {}
        offer.name = nameField.validValue()
        offer.expired = expiredField.validValue()
        offer.title = titleField.validValue()
        offer.link = linkField.validValue()
        offer.description = descriptionField.validValue()
        offer.message = messageField.validValue()
        offer.note = noteField.validValue()
        offer.company = companyField.validValue()
        offer.sector = sectorField.validValue()
        offer.street = streetField.validValue()
        offer.zip = zipField.validValue()
        offer.city = cityField.validValue()


        if (this.verify("input/validity", termsField.input)) {
          offer.termsPdf = termsField.input.value
        }

        if (this.verify("input/validity", companyInfoField.input)) {
          offer.companyPdf = companyInfoField.input.value
        }

        if (this.verify("input/validity", productInfoField.input)) {
          offer.productPdf = productInfoField.input.value
        }

        offer.vat = vatField.validValue()
        offer.discount = discountField.validValue()



        if (input !== undefined) {

          if (!this.numberIsEmpty(input.id)) {
            offer.id = input.id
          }

          if (!this.stringIsEmpty(input.platform)) {
            offer.platform = input.platform
          }

        }


        this.overlay("security", async securityOverlay => {

          await this.update("offer/closed", securityOverlay, offer)

          if (input !== undefined) {
            if (input.ok !== undefined) await input.ok()
          }

          this.removeOverlay(securityOverlay)

        })

      })





      if (input !== undefined) {

        if (!this.numberIsEmpty(input.id)) {

          const button = this.buttonPicker("delete", parent)
          button.innerHTML = "Angebot entfernen"
          button.addEventListener("click", () => {

            this.overlay("security", async securityOverlay => {
              const del = {}
              del.url = "/delete/offer/closed/"
              del.id = input.id
              if (!this.stringIsEmpty(input.platform)) {
                del.platform = input.platform
              }
              const res = await Request.closed(del)

              if (res.status === 200) {
                window.alert("Angebot erfolgreich gelöscht.")
                if (input.ok !== undefined) await input.ok()
                this.removeOverlay(securityOverlay)
              } else {
                this.redirect("session-expired")
              }

            })


          })

        }

        nameField.value(() => input.name)
        nameField.verifyValue()

        expiredField.value(() => input.expired)
        expiredField.verifyValue()

        titleField.value(() => input.title)
        titleField.verifyValue()

        linkField.value(() => input.link)
        linkField.verifyValue()

        descriptionField.value(() => input.description)
        descriptionField.verifyValue()

        messageField.value(() => input.message)
        messageField.verifyValue()

        noteField.value(() => input.note)
        noteField.verifyValue()

        companyField.value(() => input.company)
        companyField.verifyValue()

        sectorField.value(() => input.sector)
        sectorField.verifyValue()

        streetField.value(() => input.street)
        streetField.verifyValue()

        zipField.value(() => input.zip)
        zipField.verifyValue()

        cityField.value(() => input.city)
        cityField.verifyValue()

        // if (input.termsPdf !== undefined) {
        //   termsField.input.required = false
        //   termsField.verifyValue()
        // }

        // if (input.productPdf !== undefined) {
        //   productInfoField.input.required = false
        //   productInfoField.verifyValue()
        // }

        // if (input.companyPdf !== undefined) {
        //   companyInfoField.input.required = false
        //   companyInfoField.verifyValue()
        // }

        vatField.value(() => input.vat)
        vatField.verifyValue()

        discountField.value(() => input.discount)
        discountField.verifyValue()
      }

    }

    if (event === "offer/closed") {

      return new Promise(async (resolve, reject) => {

        const content = this.headerPicker("loading", parent)

        const get = {}
        get.url = "/get/offer/closed/"

        if (input !== undefined) {
          get.platform = input.platform
        }

        const res = await Request.closed(get)

        if (res.status === 200) {
          const offer = JSON.parse(res.response)

          offer.ok = () => this.removeOverlay(parent)
          if (input !== undefined) {
            offer.platform = input.platform
          }

          this.get("funnel/offer", content, offer)

          return resolve(content)
        }


        if (res.status !== 200) {

          const offer = {}
          offer.ok = () => this.removeOverlay(parent)
          if (input !== undefined) {
            offer.platform = input.platform
          }

          this.get("funnel/offer", content, offer)
          return reject(new Error("get offer failed"))
        }

      })

    }

    if (event === "role-apps/closed") {

      return new Promise(async (resolve, reject) => {

        const content = this.headerPicker("loading", parent)

        if (this.verifyIs("user/closed")) {

          const get = {}
          get.url = "/get/role-apps/closed/"
          get.id = input
          const res = await Request.closed(get)

          if (res.status === 200) {
            const apps = JSON.parse(res.response)

            this.convert("parent/scrollable", content)

            for (let i = 0; i < apps.length; i++) {
              const app = apps[i]

              const button = this.buttonPicker("left/right", content)
              button.left.innerHTML = `.${app}`

              if (app === "offer") {
                button.right.innerHTML = "Angebot erstellen"

                button.addEventListener("click", () => {
                  this.popup(overlay => {
                    this.headerPicker("removeOverlay", overlay)
                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("text/span", ".offer"))

                    this.get("offer/closed", overlay)

                  })
                })
              }


              if (app === "services") {
                button.right.innerHTML = "Leistungen definieren"


                button.addEventListener("click", () => {
                  this.popup(async overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    const info = this.headerPicker("info", overlay)
                    info.innerHTML = `.services`

                    const create = this.buttonPicker("left/right", overlay)
                    create.left.innerHTML = ".create"
                    create.right.innerHTML = "Neue Leistung definieren"
                    create.addEventListener("click", () => {

                      this.popup(overlay => {
                        this.headerPicker("removeOverlay", overlay)
                        const info = this.headerPicker("info", overlay)
                        info.append(this.convert("text/span", ".service"))

                        this.get("funnel/service", overlay, {ok: async () => {

                          this.reset(container)
                          await this.get("services/closed", container)
                          this.removeOverlay(overlay)

                        }})

                      })

                    })

                    this.render("text/hr", "Meine Leistungen", overlay)

                    const container = await this.get("services/closed", overlay)

                  })
                })

              }


              if (app === "scripts") {
                button.right.innerHTML = "Meine HTML Skripte"


                button.addEventListener("click", () => {
                  this.popup(async overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    const info = this.headerPicker("info", overlay)
                    info.innerHTML = `.scripts`

                    const create = this.buttonPicker("left/right", overlay)
                    create.left.innerHTML = ".create"
                    create.right.innerHTML = "Neues Skript hochladen"
                    create.addEventListener("click", () => {

                      this.popup(overlay => {
                        this.headerPicker("removeOverlay", overlay)
                        const info = this.headerPicker("info", overlay)
                        info.append(this.convert("text/span", ".script"))

                        this.get("funnel/script", overlay, {ok: async () => {

                          this.reset(container)
                          await this.get("scripts/closed", container)
                          this.removeOverlay(overlay)

                        }})

                      })

                    })

                    this.render("text/hr", "Meine Skripte", overlay)

                    const container = await this.get("scripts/closed", overlay)

                  })
                })

              }


            }

            return resolve(content)

          }

          if (res.status !== 200) {

            this.convert("parent/navigation-open", content)

          }

        } else {

          this.convert("parent/navigation-open", content)

        }





      })

    }

    if (event === "field/platform-value-path-select") {
      return new Promise(async (resolve, reject) => {
        const get = {}
        get.url = "/get/platform-value/closed/"
        get.type = "path"
        get.platform = input.platform
        const res = await Request.closed(get)

        if (res.status === 200) {
          const paths = JSON.parse(res.response)


          const pathsField = new SelectionField("paths", parent)
          pathsField.label.innerHTML = "Wohin soll diese Rolle, nach dem Login, weitergeleitet werden"
          pathsField.options(paths)
          pathsField.verifyValue()

          if (paths.length <= 0) {
            this.setNotValidStyle(pathsField.select)
          }

          if (input.roleId !== undefined) {
            const get = {}
            get.url = "/get/platform/closed/"
            get.type = "role/home"
            get.id = input.roleId
            get.platform = input.platform
            const res = await Request.closed(get)

            if (res.status === 200) {
              pathsField.value(() => [res.response])
            } else this.redirect("session-expired")

          }

          return resolve(pathsField)
        } else this.redirect("session-expired")
      })
    }

    if (event === "platform/roles") {

      return new Promise(async (resolve, reject) => {


        const content = this.headerPicker("loading", parent)

        const {platform, onclick} = input

        const get = {}
        get.url = "/get/platform/closed/"
        get.type = "roles"
        get.platform = platform
        const res = await Request.closed(get)

        if (res.status === 200) {
          const roles = JSON.parse(res.response)

          this.convert("parent/scrollable", content)

          for (let i = 0; i < roles.length; i++) {
            const role = roles[i]

            const button = this.buttonPicker("left/right", content)
            button.classList.add("role-button")
            button.left.innerHTML = role.name
            button.left.classList.add("button-left")
            button.right.innerHTML = "Rolle"
            button.right.classList.add("button-right")

            if (onclick !== undefined) button.addEventListener("click", event => {
              onclick(role, button, event)
            })

          }

          return resolve(content)

        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject()
        }

      })
    }

  }

  static redirect(event, input) {

    if (event === "image-not-found") {
      window.alert("Fehler..\n\nMögliche Fehlerquellen:\n\nSession abgelaufen\nPlattform Image nicht gefunden.\n\nSollte dieser Fehler weiterhin bestehen, dann melde bitte einen Konflikt.")
      window.location.assign(`/${window.location.pathname.split("/")[1]}/`)
      throw new Error("session-expired")
    }



    if (event === "session-expired") {
      window.alert("Fehler..\n\nMögliche Fehlerquellen:\n\nSession abgelaufen\n\nDu wirst zum Login Bereich weitergeleitet. Sollte dieser Fehler weiterhin bestehen, dann melde bitte einen Konflikt.")
      window.location.assign("/login/")
      throw new Error("session-expired")
    }
  }

  static register(event, input) {
    // event = tag/on/algorithm

    if (event === "condition/match-maker/closed") {
      return new Promise(async (resolve, reject) => {

        try {
          const register = {}
          register.url = "/register/match-maker/closed/"
          register.type = "condition"
          register.id = input.id
          register.left = input.left
          register.operator = input.operator
          register.right = input.right
          const res = await Request.closed(register)

          resolve(res)

        } catch (error) {
          reject(error)
        }


      })
    }

    if (event === "name/match-maker/closed") {
      return new Promise(async (resolve, reject) => {

        try {
          const register = {}
          register.url = "/register/platform/closed/"
          register.type = "match-maker"
          register.platform = input.platform
          register.name = input.name
          const res = await Request.closed(register)

          resolve(res)

        } catch (error) {
          reject(error)
        }


      })
    }

  }

  static update(event, parent, input) {
    // event = tag/on/algorithm

    // no parent needed to get data
    if (arguments.length === 2) {
      input = parent
    }


    if (event === "condition/match-maker/closed") {
      return new Promise(async (resolve, reject) => {

        try {
          const update = {}
          update.url = "/update/match-maker/closed/"
          update.type = "condition"
          update.id = input.id
          update.left = input.left
          update.operator = input.operator
          update.right = input.right
          const res = await Request.closed(update)

          resolve(res)

        } catch (error) {
          reject(error)
        }


      })
    }

    if (event === "funnel/location-list/closed") {

      const fieldFunnel = this.convert("text/dom", input.funnel)
      parent.append(fieldFunnel)

      this.add("field-funnel/oninput-sign-support", fieldFunnel)

      const submitButton = fieldFunnel.querySelector(".submit-field-funnel-button")
      submitButton.innerHTML = `${input.tag} jetzt speichern`
      submitButton.onclick = async () => {

        await this.verify("field-funnel/validity", fieldFunnel)

        const map = await this.convert("field-funnel/map", fieldFunnel)

        this.overlay("security", async securityOverlay => {
          const update = {}
          update.url = "/update/location-list/closed/"
          update.tag = input.tag
          update.id = input.id
          update.map = map
          const res = await Request.closed(update)

          if (res.status === 200) {
            window.alert("Daten erfolgreich gespeichert.")
            if (input.ok !== undefined) await input.ok()
            this.remove("overlay", parent)
            this.remove("overlay", securityOverlay)
          }

          if (res.status !== 200) {
            window.alert("Fehler.. Bitte wiederholen.")
            this.remove("overlay", securityOverlay)
          }

        })

      }

      return parent
    }

    if (event === "name/expert/closed") {
      const funnel = this.create("div/scrollable", parent)

      const nameField = this.create("field/name", funnel)
      nameField.input.value = window.location.pathname.split("/")[1]
      nameField.input.placeholder = "mein-neuer-experten-name"
      nameField.input.maxLength = "21"
      this.verify("input/validity", nameField.input)

      const button = this.buttonPicker("action", funnel)
      button.innerHTML = "Name jetzt ändern"
      button.addEventListener("click", () => {
        if (this.verify("input/validity", nameField.input) === false) throw new Error("name invalid")


        this.overlay("security", async securityOverlay => {

          const map = {}
          map.type = "name"
          map.name = nameField.input.value
          const res = await Request.ping("/update/expert/closed/", map)

          if (res.status === 200) {
            if (input !== undefined) {
              if (input.ok !== undefined) await input.ok()
            }
            this.removeOverlay(securityOverlay)
            window.location.assign(`/${nameField.input.value}/`)
          }

        })



      })

    }

    if (event === "feedback/script/location") {

      parent.onclick = () => {

        this.popup(async overlay => {
          const feedbackOverlay = overlay

          this.headerPicker("removeOverlay", overlay)

          const info = this.headerPicker("info", overlay)

          info.append(this.convert("element/alias", document.body))
          info.append(this.convert("text/span", `.${input.name}.feedback`))

          const content = this.headerPicker("scrollable", overlay)

          const feedbackContainer = this.headerPicker("loading", content)
          feedbackContainer.info.remove()

          feedbackContainer.style.margin = "21px 34px"
          feedbackContainer.style.overflowY = "auto"
          feedbackContainer.style.overscrollBehavior = "none"
          feedbackContainer.style.fontFamily = "monospace"
          feedbackContainer.style.fontSize = "13px"
          feedbackContainer.style.height = `${window.innerHeight * 0.4}px`


          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            feedbackContainer.style.color = this.colors.dark.text
          } else {
            feedbackContainer.style.color = this.colors.light.text
          }

          const get = {}
          get.url = "/get/feedback/location/"
          get.type = "script"
          get.id = input.id
          const res = await Request.location(get)

          if (res.status !== 200) {
            feedbackContainer.innerHTML = `<span style="margin: 21px 34px;">Kein Feedback gefunden.</span>`
          }

          getFeedbackSuccess: if (res.status === 200) {
            const feedback = JSON.parse(res.response)

            if (feedback.length === 0) {
              feedbackContainer.innerHTML = `<span style="margin: 21px 34px;">Kein Feedback gefunden.</span>`
              break getFeedbackSuccess
            }

            this.reset(feedbackContainer)
            feedbackContainer.style.margin = "21px 34px"
            feedbackContainer.style.overflowY = "auto"
            feedbackContainer.style.overscrollBehavior = "none"
            feedbackContainer.style.fontFamily = "monospace"
            feedbackContainer.style.fontSize = "13px"
            feedbackContainer.style.height = `${window.innerHeight * 0.4}px`

            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              feedbackContainer.style.color = this.colors.dark.text
            } else {
              feedbackContainer.style.color = this.colors.light.text
            }


            for (let i = 0; i < feedback.length; i++) {
              const value = feedback[i]

              const div = document.createElement("div")
              div.style.display = "flex"
              div.style.justifyContent = "space-between"
              div.style.alignItems = "center"

              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {

                if (i % 2 === 0) {
                  div.style.background = this.colors.light.foreground
                  div.style.color = this.colors.light.text
                } else {
                  div.style.background = this.colors.dark.foreground
                  div.style.color = this.colors.dark.text
                }

              } else {

                if (i % 2 === 1) {
                  div.style.background = this.colors.light.foreground
                  div.style.color = this.colors.light.text
                } else {
                  div.style.background = this.colors.dark.foreground
                  div.style.color = this.colors.dark.text
                }

              }

              const left = document.createElement("span")
              left.innerHTML = `${this.convert("millis/dd.mm.yyyy hh:mm", value.id)}`
              div.append(left)

              const nextToLeft = document.createElement("span")
              nextToLeft.style.width = "100%"
              nextToLeft.style.margin = "0 13px"
              nextToLeft.innerHTML = value.content
              div.append(nextToLeft)

              const right = document.createElement("span")
              right.style.padding = "13px"
              right.innerHTML = value.importance
              div.append(right)

              feedbackContainer.append(div)

              div.style.cursor = "pointer"
              div.addEventListener("click", () => {

                this.popup(overlay => {
                  this.headerPicker("removeOverlay", overlay)

                  const button = this.buttonPicker("left/right", overlay)
                  const icon = this.iconPicker("delete")
                  icon.style.width = "34px"
                  button.left.append(icon)
                  button.right.innerHTML = "Feedback löschen"

                  button.addEventListener("click", async () => {
                    const confirm = window.confirm("Möchtest du diesen Beitrag wirklich löschen?")

                    if (confirm === true) {
                      const del = {}
                      del.url = "/delete/feedback/location/"
                      del.type = "script"
                      del.scriptId = input.id
                      del.feedbackId = value.id
                      const res = await Request.location(del)

                      if (res.status === 200) {
                        parent.counter.innerHTML = parseInt(parent.counter.innerHTML) - 1
                        this.removeOverlay(overlay)
                        this.removeOverlay(feedbackOverlay)
                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")
                        this.removeOverlay(overlay)
                      }


                    }

                  })
                })

              })
            }


          }

          const contentField = this.create("field/textarea", content)
          contentField.label.innerHTML = "Feedback"
          contentField.input.setAttribute("required", "true")
          contentField.input.maxLength = "377"
          contentField.input.style.fontSize = "13px"
          contentField.input.placeholder = "Schreibe ein Feedback an unsere Web-Entwickler"

          this.verify("input/validity", contentField.input)
          contentField.input.addEventListener("input", () => this.verify("input/validity", contentField.input))


          const importanceField = this.create("field/range", content)
          importanceField.input.min = "0"
          importanceField.input.max = "13"
          importanceField.input.step = "1"
          importanceField.input.value = "0"
          importanceField.label.innerHTML = `Wichtigkeit - ${importanceField.input.value}`

          this.verify("input/validity", importanceField.input)

          importanceField.input.addEventListener("input", (event) => {
            this.verify("input/validity", importanceField.input)
            importanceField.label.innerHTML = `Wichtigkeit - ${event.target.value}`
          })

          const button = this.buttonPicker("action", content)
          button.innerHTML = "Feedback jetzt speichern"
          button.addEventListener("click", async () => {

            const res = await this.verifyIs("input/valid", contentField.input)

            if (res === true) {

              const content = contentField.input.value
              const importance = importanceField.input.value

              this.popup(async securityOverlay => {

                this.headerPicker("loading", securityOverlay)

                const register = {}
                register.url = "/register/feedback/location/"
                register.type = "script"
                register.id = input.id
                register.importance = importance
                register.content = content
                const res = await Request.location(register)

                if (res.status === 200) {
                  this.removeOverlay(securityOverlay)
                  this.removeOverlay(overlay)
                  parent.counter.innerHTML = parseInt(parent.counter.innerHTML) + 1
                } else {
                  window.alert("Fehler.. Bitte wiederholen.")
                  this.removeOverlay(securityOverlay)
                }

              })

            }


          })



        })

      }

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

    if (event === "image/onclick") {

      const funnel = this.create("div/scrollable", parent)

      const urlField = this.create("field/url", funnel)
      urlField.input.required = true
      urlField.input.accept = "text/https"
      urlField.label.innerHTML = "Gebe hier die Quell-Url für dein Bild ein"
      urlField.input.placeholder = "https://www.meine-quelle.de"

      this.verify("input/validity", urlField.input)
      urlField.input.addEventListener("input", () => this.verify("input/validity", urlField.input))

      const button = this.buttonPicker("action", funnel)
      button.innerHTML = "Bild jetzt ändern"
      button.addEventListener("click", async () => {

        if (this.verify("input/validity", urlField.input)) {

          const url = urlField.input.value

          if (input !== undefined) {
            if (input.ok !== undefined) await input.ok(url)
          }
        }

      })

    }

    if (event === "image/platform-value/closed") {

      const funnel = this.create("div/scrollable", parent)

      const urlField = this.create("field/url", funnel)
      urlField.input.required = true
      urlField.input.accept = "text/https"
      urlField.label.innerHTML = "Gebe hier die Quell-Url für dein Bild ein"
      urlField.input.placeholder = "https://www.meine-quelle.de"
      // this.setNotValidStyle(urlField.input)
      // urlField
      this.verify("input/validity", urlField.input)
      urlField.input.addEventListener("input", () => this.verify("input/validity", urlField.input))

      const button = this.buttonPicker("action", funnel)
      button.innerHTML = "Bild jetzt ändern"
      button.addEventListener("click", () => {

        if (this.verify("input/validity", urlField.input)) {

          const url = urlField.input.value

          this.overlay("security", async securityOverlay => {

            // let image
            // if (imageFile !== undefined) {

            //   if (imageFile.type === "image/svg+xml") {

            //     image = await imageField.validSvg(imageFile)

            //   } else {

            //     image = await imageField.validImage(imageFile)

            //   }

            // }


            // quick update
            // on success no message
            // just remove security overlay
            const register = {}
            register.url = "/update/platform-value-image/closed/"
            // register.type = "image"
            register.image = url
            register.path = input.path
            const res = await Request.closed(register)
            // const res = await Request.ping("")

            if (res.status === 200) {
              window.alert("Bild erfolgreich gespeichert..")
              this.removeOverlay(parent)
              this.removeOverlay(securityOverlay)

            } else {
              window.alert("Fehler.. Bitte wiederholen.")
              this.removeOverlay(securityOverlay)
            }

          })

        }

      })

    }

    if (event === "image/platform/closed") {

      const funnel = this.create("div/scrollable", parent)

      const urlField = this.create("field/url", funnel)
      urlField.input.required = true
      urlField.input.accept = "text/https"
      urlField.label.innerHTML = "Gebe hier die Quell-Url für dein Bild ein"
      urlField.input.placeholder = "https://www.meine-quelle.de"
      // this.setNotValidStyle(urlField.input)
      // urlField
      this.verify("input/validity", urlField.input)
      urlField.input.addEventListener("input", () => this.verify("input/validity", urlField.input))

      const button = this.buttonPicker("action", funnel)
      button.innerHTML = "Bild jetzt ändern"
      button.addEventListener("click", () => {

        if (this.verify("input/validity", urlField.input)) {

          const url = urlField.input.value

          this.overlay("security", async securityOverlay => {

            // let image
            // if (imageFile !== undefined) {

            //   if (imageFile.type === "image/svg+xml") {

            //     image = await imageField.validSvg(imageFile)

            //   } else {

            //     image = await imageField.validImage(imageFile)

            //   }

            // }


            // quick update
            // on success no message
            // just remove security overlay
            const register = {}
            register.url = "/update/platform-image/closed/"
            // register.type = "image"
            register.image = url
            register.platform = input
            const res = await Request.closed(register)
            // const res = await Request.ping("")

            if (res.status === 200) {
              window.alert("Bild erfolgreich gespeichert..")
              // window.location.reload()
              this.removeOverlay(parent)
              this.removeOverlay(securityOverlay)

            } else {
              window.alert("Fehler.. Bitte wiederholen.")
              this.removeOverlay(securityOverlay)
            }

          })

        }

      })

    }

    if (event === "element/type") {

      const create = document.createElement(input)

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

      parent.before(create)
      parent.remove()
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

    if (event === "script/on-field-info-click-event") {

      const text = /*html*/`
      <script id="on-field-info-click-event" type="module">
        import { Helper } from "/js/Helper.js"

        document.querySelectorAll(".field").forEach(field => {
          if (field.hasAttribute("on-info-click")) {
            Helper.convert("field/on-info-click", field)
          }
        })

      </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      if (parent !== undefined) {

        if (parent.querySelector(`#${create.id}`) === null) {
          parent.append(create)
          this.render("children", parent)
        }

      }

      return create

    }

    if (event === "service-condition/closed") {

      return new Promise(async (resolve, reject) => {

        const update = {}
        update.url = "/update/service-condition/closed/"

        if (input !== undefined) {
          update.platform = input.platform
          update.service = input.service
          update.id = input.id
          update.left = input.left
          update.operator = input.operator
          update.right = input.right
          update.action = input.action
        }

        const res = await Request.closed(update)


        if (res.status === 200) {
          return resolve()
        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject()
        }

      })
    }

    if (event === "offer/closed") {

      return new Promise(async (resolve, reject) => {

        const update = {}
        update.url = "/update/offer/closed/"
        update.platform = input.platform
        update.id = input.id
        update.name = input.name
        update.expired = input.expired
        update.title = input.title
        update.link = input.link
        update.description = input.description
        update.message = input.message
        update.note = input.note
        update.company = input.company
        update.sector = input.sector
        update.street = input.street
        update.zip = input.zip
        update.city = input.city
        update.termsPdf = input.termsPdf
        update.companyPdf = input.companyPdf
        update.productPdf = input.productPdf
        update.vat = input.vat
        update.discount = input.discount
        const res = await Request.closed(update)


        if (res.status === 200) {
          return resolve()
        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject()
        }

      })
    }

    if (event === "script/closed") {

      return new Promise(async (resolve, reject) => {

        const update = {}
        update.url = "/update/script/closed/"
        update.script = input.script

        if (input.id !== undefined) {
          update.id = input.id
        }


        if (input.name !== undefined) {
          update.name = input.name
        }

        const res = await Request.closed(update)


        if (res.status === 200) {
          return resolve()
        }


        if (res.status !== 200) {
          return reject()
        }

      })
    }

    if (event === "service/closed") {

      return new Promise(async (resolve, reject) => {

        const update = {}
        update.url = "/update/service/closed/"

        if (input !== undefined) {
          update.platform = input.platform
          update.id = input.id
          update.quantity = input.quantity
          update.unit = input.unit
          update.title = input.title
          update.price = input.price
          update.currency = input.currency
          update.selected = input.selected
        }

        const res = await Request.closed(update)


        if (res.status === 200) {
          return resolve()
        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject()
        }

      })
    }

    if (event === "script/role-apps-event") {

      if (input !== undefined) {

        const text = /*html*/`
        <script id="role-apps-event" type="module">
          import { Helper } from "/js/Helper.js"
          import { Request } from "/js/Request.js"

          const button = document.querySelector(".role-apps-button")

          if (button !== null) {

            button.onclick = async () => {

              Helper.popup(overlay => {
                Helper.headerPicker("removeOverlay", overlay)
                const info = Helper.headerPicker("info", overlay)
                info.append(Helper.convert("text/span", "${input.name}"))

                Helper.get("role-apps/closed", overlay, ${input.id})

              })

            }

          }

        </script>
        `

        const script = this.convert("text/script", text)

        const create = document.createElement("script")
        create.id = script.id
        create.type = script.type
        create.innerHTML = script.innerHTML

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

    if (event === "script/login") {

      let text = /*html*/`
        <script id="login-event" type="module">
          import { Helper } from "/js/Helper.js"

          const submit = document.querySelector(".start-login-event")
          const emailInput = document.querySelector(".email-input")
          const dsgvoInput = document.querySelector(".dsgvo-input")

          Helper.verify("input/validity", emailInput)
          Helper.verify("input/validity", dsgvoInput)

          Helper.add("input/value", emailInput)
          Helper.add("input/oninput", emailInput)
          Helper.add("input/oninput", dsgvoInput)
          Helper.add("button/on-login-click", submit)
        </script>
      `

      if (input !== undefined) {

        text = /*html*/`
          <script id="login-event" type="module">
            import { Helper } from "/js/Helper.js"
            import { Request } from "/js/Request.js"

            const submit = document.querySelector(".start-login-event")
            const emailInput = document.querySelector(".email-input")
            const dsgvoInput = document.querySelector(".dsgvo-input")

            Helper.verify("input/validity", emailInput)
            Helper.verify("input/validity", dsgvoInput)

            Helper.add("input/value", emailInput)
            Helper.add("input/oninput", emailInput)
            Helper.add("input/oninput", dsgvoInput)

            const map = {}
            map.button = submit
            map.roleId = ${input.id}
            map.roleName = "${input.name}"
            Helper.add("button/on-role-login-click", map)
          </script>
        `

      }


      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      if (parent !== undefined) {
        if (parent.querySelector(`#${create.id}`) === null) {
          parent.append(create)
        }
      }

      return create
    }

    if (event === "platform/roles") {

      return new Promise(async (resolve, reject) => {


        const content = this.headerPicker("loading", parent)


        const get = {}
        get.url = "/get/platform/closed"
        get.type = "roles"
        get.platform = input
        const res = await Request.closed(get)


        if (res.status === 200) {
          const roles = JSON.parse(res.response)

          this.convert("parent/scrollable", content)

          for (let i = 0; i < roles.length; i++) {
            const role = roles[i]

            const button = this.buttonPicker("left/right", content)
            button.left.innerHTML = role.name
            button.right.innerHTML = "Rolle bearbeiten"

            button.addEventListener("click", () => {

              this.popup(async overlay => {

                this.headerPicker("removeOverlay", overlay)
                const info = this.headerPicker("info", overlay)
                info.innerHTML = `${input}.roles`

                await this.update("platform/role", overlay, {platform: input, roleId: role.id, ok: () => {
                  this.reset(content)
                  this.update(event, content, input)
                  this.removeOverlay(overlay)
                }})

              })

            })


          }

          return resolve(content)

        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject()
        }

      })
    }

    if (event === "platform/role") {

      return new Promise(async (resolve, reject) => {

        const content = this.headerPicker("scrollable", parent)

        const {platform, roleId, ok} = input

        const nameField = new TextField("role", content)
        nameField.label.textContent = "Rolle"
        nameField.input.required = true
        nameField.input.accept = "text/tag"
        nameField.input.placeholder = "meine-neue-rolle"
        nameField.verifyValue()
        nameField.input.addEventListener("input", () => nameField.verifyValue())

        const pathsField = await this.get("field/platform-value-path-select", content, input)

        const appsField = new TextAreaField("apps", content)
        appsField.label.innerHTML = "Schalte Anwendungen für deine Rolle frei (mit einer Javascript String Liste)"
        appsField.input.style.height = "144px"
        appsField.input.placeholder = `["offer", "funnel", ..]`
        appsField.input.accept = `string/array`
        appsField.input.required = true
        appsField.value(() => JSON.stringify([]))
        appsField.verifyValue()
        appsField.input.addEventListener("input", () => appsField.verifyValue())

        const button = this.buttonPicker("action", content)
        button.innerHTML = "Rolle jetzt speichern"
        button.addEventListener("click", async () => {

          const name = nameField.validValue()

          let path
          try {
            path = pathsField.validValue()[0].value
          } catch (error) {
            this.setNotValidStyle(pathsField.select)
            throw error
          }

          if (roleId === undefined) {

            const verify = {}
            verify.url = "/verify/platform/closed/"
            verify.type = "role/name"
            verify.name = name
            verify.platform = platform
            const res = await Request.closed(verify)

            if (res.status === 200) {
              window.alert("Diese Rolle existiert bereits.")
              this.setNotValidStyle(nameField.input)
              throw new Error("name exist")
            }

          }

          const apps = JSON.parse(appsField.validValue())

          this.overlay("security", async securityOverlay => {

            const register = {}
            register.url = "/update/platform/closed/"
            register.type = "role"

            register.platform = platform

            if (roleId !== undefined) {
              register.id = roleId
            }

            register.name = name
            register.apps = apps
            register.home = path

            const res = await Request.closed(register)

            if (res.status === 200) {
              window.alert("Rolle erfolgreich gespeichert.")
              if (ok !== undefined) ok()
              this.removeOverlay(parent)
              this.removeOverlay(securityOverlay)
            } else {
              this.redirect("session-expired")
            }
          })

        })

        if (roleId !== undefined) {

          const get = {}
          get.url = "/get/platform/closed/"
          get.type = "role"
          get.id = roleId
          get.platform = platform
          const res = await Request.closed(get)

          if (res.status !== 200) {
            this.redirect("session-expired")
            return reject()
          }

          if (res.status === 200) {
            const role = JSON.parse(res.response)

            if (role.id !== roleId) throw new Error("somethng wrong here")

            nameField.value(() => role.name)
            nameField.verifyValue()

            appsField.value(() => JSON.stringify(role.apps))
            appsField.verifyValue()

            const deleteButton = this.buttonPicker("delete", content)
            deleteButton.innerHTML = "Rolle entfernen"
            deleteButton.addEventListener("click", () => {

              this.overlay("security", async securityOverlay => {
                const del = {}
                del.url = "/delete/platform/closed/"
                del.type = "role"
                del.id = role.id
                del.platform = platform
                const res = await Request.closed(del)

                if (res.status === 200) {
                  window.alert("Rolle erfolgreich gelöscht.")
                  if (ok !== undefined) ok()
                  this.removeOverlay(securityOverlay)
                } else {
                  this.redirect("session-expired")
                }

              })


            })

            return resolve()
          }

        }

      })

    }

  }

  // event = input/algorithm
  static verify(event, input) {


    if (event === "match-maker-conditions/closed") {

      return new Promise(async(resolve, reject) => {
        try {

          const verify = {}
          verify.url = "/verify/match-maker/closed"
          verify.type = "conditions"
          verify.conditions = input
          const res = await Request.closed(verify)

          resolve(res)

        } catch (error) {
          reject(error)
        }
      })

    }

    if (event === "match-maker-name/open") {
      return new Promise(async(resolve, reject) => {
        try {
          const verify = {}
          verify.url = "/verify/match-maker/open/"
          verify.type = "name"
          verify.name = input
          const res = await Request.open(verify)

          resolve(res)
        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "field-funnel/validity") {

      return new Promise(async(resolve, reject) => {

        try {

          const res = await this.verifyIs("field-funnel/valid", input)

          if (res === true) return resolve()

          return reject(new Error("funnel invalid"))
        } catch (error) {
          return reject(error)
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


    if (event === "input/validity") {
      if (this.verifyIs("input/required", input)) {
        if (this.verifyIs("input/accepted", input)) {
          this.setValidStyle(input)
          return true
        }
        this.setNotValidStyle(input)
        const field = input.parentElement
        field.scrollIntoView({behavior: "smooth"})
        return false
      }
      this.setValidStyle(input)
      return true
    }

  }

  static async request(event, input) {

    if (event === "start-click-funnel") {
      const startButton = input.querySelector(".start-click-funnel-button")

      if (startButton.onclick === null) {
        startButton.onclick = () => {

          startButton.style.display = "none"

          const questions = []
          for (let i = 0; i < input.children.length; i++) {
            const child = input.children[i]
            if (child.classList.contains("click-field")) {
              questions.push(child)

              child.style.display = "flex"
              break
            }
          }

          if (questions.length <= 0) {
            this.request("end-click-funnel", input)
            return
          }
        }
      }

    }

    if (event === "end-click-funnel") {

      const endButton = input.querySelector(".end-click-funnel-button")
      const buttonIcon = endButton.children[0]
      const buttonText = endButton.children[1]

      if (endButton.onclick === null) {

        endButton.onclick = () => {

          const funnelTag = input.id

          if (this.stringIsEmpty(funnelTag)) {
            window.alert("Diesem Funnel wurde keine Id vergeben.")
            throw new Error("funnel tag is empty")
          }

          const map = {}
          input.querySelectorAll(".click-field").forEach(field => {
            field.querySelectorAll(".answer").forEach(answer => {
              if (answer.getAttribute("clicked") === "true") {
                map[field.id] = answer.innerHTML
              }
            })
          })

          this.popup(async securityOverlay => {
            this.headerPicker("loading", securityOverlay)

            const register = {}
            register.url = "/register/funnel/closed/"
            register.tag = funnelTag
            register.funnel = map
            const res = await Request.middleware(register)

            if (res.status === 200) {

              buttonIcon.innerHTML = ""
              buttonIcon.append(this.iconPicker("success"))
              buttonText.innerHTML = "Erfolgreich"

              endButton.onclick = () => window.location.reload()

              window.alert("Ihre Daten wurden erfolgreich gespeichert.")

              if (input.hasAttribute("next-path")) {
                window.location.assign(input.getAttribute("next-path"))
              }

              this.removeOverlay(securityOverlay)


            } else {
              window.alert("Fehler.. Bitte wiederholen.")

              buttonIcon.innerHTML = ""
              buttonIcon.append(this.iconPicker("warn"))
              buttonText.innerHTML = "Fehler"

              endButton.onclick = () => window.location.reload()

              this.removeOverlay(securityOverlay)
            }
          })


        }

      }

      endButton.style.display = "flex"

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

  // no events, only creation
  static create(event, input) {
    // event = thing/algorithm

    if (event === "funnel/condition") {

      const funnel = this.create("div/scrollable")

      funnel.leftField = this.create("field/tree", funnel)
      funnel.leftField.label.innerHTML = "Nach welcher Datenstruktur soll die Plattform suchen"
      funnel.leftField.input.maxLength = "55"
      funnel.leftField.input.placeholder = "getyour.expert.name"
      this.verifyIs("input/valid", funnel.leftField.input)
      funnel.leftField.input.oninput = () => this.verifyIs("input/valid", funnel.leftField.input)

      funnel.operatorField = this.create("field/operator", funnel)
      this.verifyIs("input/valid", funnel.operatorField.input)
      funnel.operatorField.input.oninput = () => this.verifyIs("input/valid", funnel.operatorField.input)

      funnel.rightField = this.create("field/text", funnel)
      funnel.rightField.label.innerHTML = "Vergleichswert"
      funnel.rightField.input.maxLength = "55"
      funnel.rightField.input.setAttribute("required", "true")
      funnel.rightField.input.placeholder = "any"
      this.verifyIs("input/valid", funnel.rightField.input)
      funnel.rightField.input.oninput = () => this.verifyIs("input/valid", funnel.rightField.input)

      funnel.submit = this.create("button/action", funnel)
      funnel.submit.innerHTML = "Bedingung jetzt speichern"


      if (input !== undefined) input.append(funnel)
      return funnel
    }

    if (event === "icon/branch") {

      let primary
      let secondary
      primary = this.colors.light.text
      secondary = this.colors.light.background
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   primary = this.colors.dark.text
      //   secondary = this.colors.dark.background
      // } else {
      // }

      const svgString = `<svg viewBox="-34 -34 324 324" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid"><g><path d="M256,127.996353 C256,57.4003134 198.577803,0 128.003647,0 C57.4294914,0 0,57.4003134 0,127.996353 C0,194.689842 51.2729449,249.624619 116.471064,255.467502 L116.784727,255.467502 C117.854585,255.559899 118.926875,255.640139 120.001596,255.708221 L120.621627,255.744693 C121.594225,255.803049 122.581412,255.846816 123.583188,255.875994 L124.363699,255.875994 C125.574583,255.875994 126.785468,255.93435 128.010942,255.93435 C129.236415,255.93435 130.323294,255.93435 131.475823,255.883288 L131.964553,255.883288 C132.980918,255.85411 133.992421,255.812775 134.99906,255.759282 L135.203305,255.759282 C137.474322,255.632844 139.73075,255.445619 141.972589,255.197606 C205.996296,248.253255 256,193.85827 256,127.996353 Z M141.53492,243.015814 L140.302151,207.615672 L171.216185,188.650007 C178.4504,193.608514 187.855834,194.085862 195.554896,189.885253 C203.253958,185.684645 207.942904,177.517404 207.688617,168.750648 C207.193118,156.472981 197.353376,146.633239 185.075709,146.13774 C178.119701,145.88819 171.420101,148.779386 166.829786,154.011722 C162.239472,159.244058 160.244939,166.262996 161.397806,173.12734 L139.579997,186.62214 L137.997094,142.016356 L168.422396,123.408121 C179.110867,131.390126 193.992344,130.524153 203.68284,121.356269 C213.373337,112.188385 215.062153,97.3777083 207.684352,86.2635789 C200.306552,75.1494495 186.002044,70.9554883 173.790989,76.3263301 C161.579934,81.697172 155.004112,95.07502 158.210115,108.024049 L137.267645,121.022824 L136.027582,85.4257302 C145.991772,81.5729091 152.39542,71.8016983 151.951446,61.127796 C151.432624,48.6816181 141.807146,38.5281996 129.406368,37.3461601 C117.00559,36.1641205 105.635233,44.3162205 102.774385,56.4402488 C99.9135357,68.5642772 106.440171,80.9394444 118.061262,85.4257302 L115.799972,159.180282 L93.0047015,144.65696 C94.5255562,138.441989 93.7995011,131.889406 90.9549508,126.158142 C86.3958969,116.67531 77.204844,109.949793 66.722667,109.29329 C53.7591278,108.447172 41.8248137,116.35697 37.5536249,128.625883 C33.2824362,140.894795 37.7246962,154.505787 48.4110961,161.892946 C59.0974959,169.280106 73.4001543,168.626864 83.368685,160.296339 L115.143468,180.399943 L113.232312,242.877219 C56.3353184,235.619205 12.1453198,186.870152 12.1453198,127.996353 C12.1890868,64.1404189 64.1404189,12.1744978 128.003647,12.1744978 C191.866876,12.1744978 243.818208,64.1258299 243.818208,127.989058 C243.818208,187.278644 199.037356,236.290298 141.53492,243.015814 Z" fill="${primary}"></path><path d="M127.272727,47.1636364 C135.595849,47.1716548 142.341072,53.9168779 142.349091,62.24 C142.349091,70.5664457 135.599173,77.3163636 127.272727,77.3163636 C118.946282,77.3163636 112.196364,70.5664457 112.196364,62.24 C112.196364,53.9135543 118.946282,47.1636364 127.272727,47.1636364 Z M184.109091,155.803636 C191.659397,155.799577 197.79013,161.90429 197.818182,169.454545 C197.832886,174.991829 194.509789,179.992463 189.39907,182.123723 C184.288351,184.254983 178.396979,183.096944 174.473197,179.189814 C170.549415,175.282685 169.36633,169.396292 171.475835,164.276555 C173.585339,159.156817 178.571795,155.812483 184.109091,155.803636 Z M192.545455,116.094545 C184.547774,119.980784 174.913587,116.658762 171.010909,108.669091 C168.156345,102.811763 169.111458,95.8116099 173.430838,90.9331076 C177.750219,86.0546052 184.583136,84.2586055 190.743106,86.382661 C196.903075,88.5067166 201.17685,94.1324811 201.571384,100.636416 C201.965919,107.140352 198.403506,113.241466 192.545455,116.094545 Z M64.3599983,120.574545 C73.9523707,120.582566 81.7265234,128.356719 81.7345438,137.949091 C81.7305271,147.538876 73.9546338,155.310428 64.3648478,155.309089 C54.7750618,155.30775 47.0013389,147.534027 47,137.944241 C46.9986611,128.354455 54.7702131,120.578562 64.3599983,120.574545 Z" fill="${secondary}"></path></g></svg>`
      const svg = this.convert("text/svg", svgString)

      if (input) input.append(svg)
      return svg
    }

    if (event === "icon/back") {

      let primary = this.colors.light.text

      const svgString = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 17L7 14L10 11" stroke="${primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 14L13.5 14C15.433 14 17 12.433 17 10.5V10.5C17 8.567 15.433 7 13.5 7L12 7" stroke="${primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      const svg = this.convert("text/svg", svgString)

      if (input) input.append(svg)
      return svg
    }

    if (event === "script/open-popup-list-mirror-event") {

      const scriptText = /*html*/`
        <script id="${input.tag}-list-mirror-event" type="module">
          import { Helper } from "/js/Helper.js"

          const map = {}
          map.tag = '${input.tag}'
          map.funnel = \`${input.funnel}\`

          const button = document.getElementById("${input.tag}-mirror-button")

          if (button !== null) {
            button.onclick = () => {

              Helper.popup(async overlay => {

                Helper.headerPicker("removeOverlay", overlay)
                const info = Helper.headerPicker("info", overlay)
                info.innerHTML = "." + map.tag

                const create = Helper.buttonPicker("left/right", overlay)
                create.left.innerHTML = ".create"
                create.right.innerHTML = map.tag + " definieren"
                create.addEventListener("click", () => {

                  Helper.popup(overlay => {
                    Helper.headerPicker("removeOverlay", overlay)
                    const info = Helper.headerPicker("info", overlay)
                    info.append(Helper.convert("text/span", map.tag + ".create"))

                    map.ok = async () => {

                      await Helper.get("location-list/closed", locationList, map)

                    }

                    Helper.render("field-funnel/location-list-tagger", map, overlay)

                  })

                })

                Helper.render("text/hr", "Meine " + map.tag, overlay)

                const locationList = Helper.headerPicker("loading", overlay)
                await Helper.get("location-list/closed", locationList, map)

              })

            }
          }
        </script>
      `

      const script = this.convert("text/script", scriptText)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      return create
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

      if (input !== undefined) input.append(header)
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
      header.nav.text.innerHTML = "Mein Link"
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
      header.nav.state.index.innerHTML = "1"
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
      header.right.innerHTML = "Login"
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
      header.right.innerHTML = "Login"
      header.append(header.right)

      if (input !== undefined) input.append(header)
      return header
    }

    if (event === "header/left") {

      const header = document.createElement("div")
      header.classList.add("header")
      header.style.display = "flex"

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

      if (input !== undefined) input.append(header)
      return header
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
              clone.innerHTML = matchMaker.innerHTML
              clone.classList.add(`user-${i + 1}`)

              for (let i = 0; i < mirror.treeValues.length; i++) {
                const treeValuePair = mirror.treeValues[i]
                clone.querySelectorAll(`#${treeValuePair.tree}`).forEach(container => {
                  container.innerHTML = treeValuePair.value
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

      if (input !== undefined) input.append(div)
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

    if (event === "button/back") {

      const icon = document.createElement("div")
      icon.classList.add("icon")
      icon.style.width = "34px"
      icon.style.height = "34px"
      this.create("icon/back", icon)

      const header = document.createElement("div")
      header.classList.add("button")
      header.classList.add("back")
      header.append(icon)

      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.left = "0"
      header.style.display = "flex"
      header.style.justifyContent = "center"
      header.style.alignItems = "center"
      header.style.boxShadow = this.colors.light.boxShadow
      header.style.border = this.colors.light.border
      header.style.backgroundColor = this.colors.light.foreground
      header.style.borderRadius = "50%"
      header.style.margin = "34px"
      header.style.padding = "21px"
      header.style.zIndex = "1"
      header.style.cursor = "pointer"

      header.setAttribute("onclick", "window.history.back()")

      if (input !== undefined) input.append(header)

      return header
    }

    if (event === "button/icon-box") {

      const button = this.create("button/top-bottom")
      button.style.justifyContent = "center"
      button.style.alignItems = "center"

      const icon = document.createElement("img")
      icon.src = "https://bafybeiefo3y5hr4yb7gad55si2x6ovvoqteqlbxaoqyvlc37bm2ktrruu4.ipfs.nftstorage.link"
      icon.alt = "Mein Icon"
      button.top.append(icon)
      button.top.classList.add("icon")
      button.top.style.width = "55px"
      button.top.style.margin = "21px 34px"

      button.bottom.innerHTML = "Button"
      button.bottom.classList.add("info")
      button.bottom.style.margin = "21px 34px"
      button.bottom.style.textAlign = "center"
      button.bottom.style.fontSize = "13px"
      button.bottom.style.fontFamily = "sans-serif"

      if (input !== undefined) input.append(button)
      return button
    }

    if (event === "button/action") {
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
      div.style.height = "89px"

      if (input !== undefined) input.append(div)
      return div
    }

    if (event === "button/top-bottom") {

      const button = document.createElement("div")
      button.classList.add("button")
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

      if (input !== undefined) input.append(button)
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

    if (event === "button/register-html") {

      const save = this.headerPicker("save", input)

      save.addEventListener("click", async () => {

        this.overlay("security", async securityOverlay => {

          // prepare html
          document.getElementById("toolbox").remove()
          document.querySelectorAll("[data-id]").forEach(element => element.remove())
          document.querySelectorAll(".overlay").forEach(element => element.remove())

          document.body.style.overscrollBehavior = null
          document.body.style.overflow = null

          // save html state
          const register = {}
          register.url = "/register/platform-value/closed/"
          register.type = "html"
          register.html = document.documentElement.outerHTML.replace(/<html>/, "<!DOCTYPE html><html>")
          const res = await Request.closed(register)

          if (res.status === 200) {
            window.alert("Dokument erfolgreich gespeichert.")
            window.location.reload()
          } else {
            // if error recreate state ??
            window.alert("Fehler.. Bitte wiederholen.")
            await this.request("toolbox/append", document.body)
            this.removeOverlay(securityOverlay)
          }

        })


      })

    }

    if (event === "button/remove-overlay") {

      const icon = this.iconPicker("back")
      icon.style.width = "34px"
      const header = document.createElement("div")
      header.append(icon)
      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.left = "0"

      header.style.boxShadow = this.colors.light.boxShadow
      header.style.border = this.colors.light.border
      header.style.backgroundColor = this.colors.light.foreground
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = this.colors.dark.boxShadow
        header.style.border = this.colors.dark.border
        header.style.backgroundColor = this.colors.dark.foreground
      }

      header.style.borderRadius = "50%"
      header.style.margin = "34px"
      header.style.padding = "21px"
      header.style.zIndex = "1"
      header.style.cursor = "pointer"

      header.addEventListener("click", () => this.remove("overlay", input))

      input.append(header)
      return header
    }

    if (event === "button/branch") {

      const button = document.createElement("div")
      button.style.cursor = "pointer"
      button.style.position = "relative"

      button.icon = this.iconPicker("branch")
      button.icon.style.width = "55px"
      button.append(button.icon)

      button.counter = document.createElement("div")
      button.counter.style.position = "absolute"
      button.counter.style.top = "0"
      button.counter.style.right = "0"
      button.counter.style.fontFamily = "monospace"
      button.counter.style.fontSize = "13px"
      button.counter.style.borderRadius = "50%"
      button.counter.style.padding = "3px 5px"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.counter.style.color = this.colors.dark.text
        button.counter.style.background = this.colors.dark.foreground
      } else {
        button.counter.style.color = this.colors.light.text
        button.counter.style.background = this.colors.light.foreground
      }
      button.append(button.counter)

      if (input !== undefined) input.append(button)
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

    if (event === "nav/open") {

      const content = this.create("div/scrollable")

      {
        const button = this.buttonPicker("left/right", content)
        button.left.innerHTML = ".login"
        button.right.innerHTML = "Dein Zugang zur personalisierten Erfahrung"
        button.addEventListener("click", () => window.location.assign("/login/"))
      }

      {
        const button = this.buttonPicker("left/right", content)
        button.left.innerHTML = ".home"
        button.right.innerHTML = "Dein Tor zur digitalen Freiheit!"
        button.addEventListener("click", () => window.location.assign("/"))
      }

      if (input !== undefined) input.append(content)


      return content

    }

    if (event === "login") {

      this.create("field/email", input)

      this.create("field/dsgvo", input)

      const loginbutton = this.buttonPicker("action", input)
      loginbutton.classList.add("start-login-event")
      loginbutton.innerHTML = "Jetzt anmelden"

    }

    if (event === "script/match-maker-onload") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-onload-${input.name}" type="module">
          import { Helper } from "/js/Helper.js"

          const res = await Helper.verify("match-maker-conditions/closed", ${conditionsString})

          if (res.status === 200) {

            ${input.js}

          }

        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      return create
    }

    if (event === "script/match-maker-onclick") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-onclick-${input.name}" type="module">
          import { Helper } from "/js/Helper.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.verify("match-maker-conditions/closed", ${conditionsString})

          if (res.status === 200) {

            elements.forEach(matchMaker => {
              matchMaker.onclick = async (event) => {
                ${input.js}
              }
            })

          }

        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      return create
    }

    if (event === "script/match-maker-show") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-show-${input.name}" type="module">
          import { Helper } from "/js/Helper.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          elements.forEach(element => element.style.display = "none")

          const res = await Helper.verify("match-maker-conditions/closed", ${conditionsString})

          if (res.status === 200) {

            elements.forEach(matchMaker => {
              matchMaker.style.display = null
            })

          }

        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      return create
    }

    if (event === "script/match-maker-get-list") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-get-list-${input.name}" type="module">
          import { Helper } from "/js/Helper.js"
          import { Request } from "/js/Request.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.get("match-maker-list/closed", ${conditionsString}, "${input.tree}")

          if (res.status === 200) {
            const mirror = JSON.parse(res.response)

            await Helper.render("mirror/match-maker-get-list", mirror, "${input.name}")

          }

        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      return create
    }

    if (event === "script/match-maker-get") {

      const conditionsString = JSON.stringify(input.conditions)
      const mirrorString = JSON.stringify(input.mirror)

      const text = /*html*/`
        <script id="match-maker-get-${input.name}" type="module">
          import { Helper } from "/js/Helper.js"
          import { Request } from "/js/Request.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.get("match-maker-mirror/closed", ${conditionsString}, ${mirrorString})

          if (res.status === 200) {
            const mirror = JSON.parse(res.response)

            await Helper.render("mirror/match-maker-get", mirror, "${input.name}")

          }

        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      return create
    }

    if (event === "script/match-maker-remove") {

      const conditionsString = JSON.stringify(input.conditions)

      const text = /*html*/`
        <script id="match-maker-remove-${input.name}" type="module">
          import { Helper } from "/js/Helper.js"
          import { Request } from "/js/Request.js"

          const elements = document.querySelectorAll("[match-maker='${input.name}']")

          if (elements.length === 0) throw new Error("no match maker elements found")

          const res = await Helper.verify("match-maker-conditions/closed", ${conditionsString})

          if (res.status === 200) {
            elements.forEach(element => element.remove())
          }

        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      return create
    }

    if (event === "script/submit-field-funnel-event") {

      const text = /*html*/`
        <script id="submit-field-funnel-event" type="module">
          import { Helper } from "/js/Helper.js"
          import { Request } from "/js/Request.js"

          document.querySelectorAll(".field-funnel").forEach(funnel => {

            const submitButton = funnel.querySelector(".submit-field-funnel-button")

            if (submitButton !== null) {

              if (submitButton.onclick === null) {
                submitButton.onclick = async () => {

                  if (Helper.tagIsEmpty(funnel.id)) {
                    window.alert("Funnel ist nicht gültig: id ist kein tag")
                    throw new Error("funnel tag is empty")
                  }

                  const map = await Helper.convert("field-funnel/map", funnel)

                  if (map !== undefined) {

                    Helper.overlay("security", async securityOverlay => {

                      const register = {}
                      register.url = "/register/funnel/closed/"
                      register.tag = funnel.id
                      register.funnel = map
                      const res = await Request.closed(register)

                      if (res.status === 200) {

                        window.alert("Ihre Daten wurden erfolgreich gespeichert.")

                        if (funnel.hasAttribute("next-path")) {
                          window.location.assign(funnel.getAttribute("next-path"))
                        }

                        Helper.removeOverlay(securityOverlay)

                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")

                        Helper.removeOverlay(securityOverlay)
                      }
                    })

                  }

                }
              }

            }

          })

        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      if (input !== undefined) {
        if (input.querySelector(`#${create.id}`) === null) {
          input.append(create)
        }
      }

      return create
    }

    if (event === "script/click-funnel-start-event") {

      const text = /*html*/`
        <script id="click-funnel-start-event" type="module">
          import { Helper } from "/js/Helper.js"

          {
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
                    Helper.request("end-click-funnel", funnel)
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

                          Helper.request("end-click-funnel", funnel)

                          return

                        }

                        if (box.hasAttribute("onclick-condition")) {
                          const condition = JSON.parse(box.getAttribute("onclick-condition"))

                          if (condition.action === "skip") {
                            try {
                              Helper.skipSiblings(parseInt(condition.skip) + 1, child)

                              return
                            } catch (error) {

                              Helper.request("end-click-funnel", funnel)

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



        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      if (input !== undefined) {
        if (input.querySelector(`#${create.id}`) === null) {
          input.append(create)
        }
      }

      return create
    }

    if (event === "script/toolbox-getter") {

      const text = /*html*/`
        <script id="toolbox-getter" type="module">
          import {Helper} from "/js/Helper.js"

          await Helper.get("toolbox/closed", document.body)
        </script>
      `

      const script = this.convert("text/script", text)

      const create = document.createElement("script")
      create.id = script.id
      create.type = script.type
      create.innerHTML = script.innerHTML

      document.body.append(create)

      return create
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

      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text

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
      field.label.style.color = this.colors.light.text
      field.labelContainer.append(field.label)

      field.input = document.createElement("select")
      field.input.classList.add("field-input")
      field.input.add = (options) => {
        field.input.innerHTML = ""
        for (let i = 0; i < options.length; i++) {
          const option = document.createElement("option")
          option.classList.add("field-option")
          option.value = options[i]
          option.text = options[i]
          field.input.appendChild(option)
        }
      }
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      field.append(field.input)

      if (input !== undefined) input.append(field)
      return field

    }

    if (event === "field/operator") {

      const field = this.create("field/text")

      field.label.innerHTML = "Operator"
      field.input.placeholder = ">="
      field.input.maxLength = "2"

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/operator")

      if (input !== undefined) input.append(field)
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
      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.label.style.color = this.colors.light.text
      field.labelContainer.append(field.label)
      field.append(field.labelContainer)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "range"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      field.append(field.input)

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/name") {

      const field = this.create("field/text")

      field.label.innerHTML = "Name"

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

      field.label.innerHTML = "HTML Skript"
      field.input.style.fontSize = "13px"
      field.input.placeholder = "<script>..</script>"

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/script")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/field-funnel") {

      const field = this.create("field/textarea")

      field.label.innerHTML = "Welche Daten soll dein Nutzer, in die Liste, speichern können (field-funnel)"
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
      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.label.style.color = this.colors.light.text
      field.labelContainer.append(field.label)
      field.append(field.labelContainer)

      field.input = document.createElement("textarea")
      field.input.classList.add("field-input")
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      field.append(field.input)

      if (input !== undefined) input.append(field)
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
      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.label.style.color = this.colors.light.text
      field.labelContainer.append(field.label)
      field.append(field.labelContainer)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "url"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      field.append(field.input)

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/dsgvo") {

      const field = document.createElement("div")
      field.classList.add("field")
      field.style.position = "relative"
      field.style.borderRadius = "13px"
      field.style.display = "flex"
      field.style.flexDirection = "column"
      field.style.margin = "34px"
      field.style.justifyContent = "center"
      field.style.alignItems = "flex-start"
      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.append(field.labelContainer)

      field.image = document.createElement("div")
      field.image.classList.add("field-label-image")
      field.image.style.width = "89px"
      field.image.style.marginRight = "21px"
      const icon = this.iconPicker("info")
      field.image.append(icon)
      field.labelContainer.append(field.image)

      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.innerHTML = `<div style="font-size: 13px;">Ich habe die <a href="/nutzervereinbarung/">Nutzervereinbarungen</a> und die <a href="/datenschutz/">Datenschutz Richtlinien</a> gelesen und verstanden. Durch meine Anmeldung stimme ich ihnen zu.</div>`
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.label.style.color = this.colors.light.text

      field.labelContainer.append(field.label)

      field.checkboxContainer = document.createElement("div")
      field.checkboxContainer.classList.add("field-input-container")
      field.checkboxContainer.style.display = "flex"
      field.checkboxContainer.style.alignItems = "center"
      field.checkboxContainer.style.margin = "21px 89px 21px 34px"
      field.append(field.checkboxContainer)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.classList.add("dsgvo-input")
      field.input.type = "checkbox"
      field.input.style.marginRight = "34px"
      field.input.style.width = "21px"
      field.input.style.height = "21px"
      field.input.setAttribute("required", true)
      field.checkboxContainer.append(field.input)

      field.afterCheckbox = document.createElement("div")
      field.afterCheckbox.classList.add("field-after-input")

      field.afterCheckbox.style.fontFamily = "sans-serif"
      field.afterCheckbox.style.fontSize = "21px"
      field.afterCheckbox.style.color = this.colors.light.text
      field.checkboxContainer.append(field.afterCheckbox)

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/trees") {

      const field = this.create("field/textarea")

      field.input.setAttribute("required", "true")
      field.input.setAttribute("accept", "text/trees")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/tree") {

      const field = this.create("field/text")

      field.input.setAttribute("accept", "text/tree")
      field.input.setAttribute("required", "true")

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/tag") {

      const field = this.create("field/text")

      field.input.setAttribute("accept", "text/tag")
      field.input.setAttribute("required", "true")

      if (input !== undefined) input.append(field)
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
      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text

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
      field.label.style.color = this.colors.light.text
      field.labelContainer.append(field.label)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.type = "text"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      field.append(field.input)

      if (input !== undefined) input.append(field)
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
      field.style.backgroundColor = this.colors.light.foreground
      field.style.border = this.colors.light.border
      field.style.boxShadow = this.colors.light.boxShadow
      field.style.color = this.colors.light.text

      field.labelContainer = document.createElement("div")
      field.labelContainer.classList.add("field-label-container")
      field.labelContainer.style.display = "flex"
      field.labelContainer.style.alignItems = "center"
      field.labelContainer.style.margin = "21px 89px 0 34px"
      field.label = document.createElement("label")
      field.label.classList.add("field-label")
      field.label.innerHTML = "E-Mail Adresse"
      field.label.style.fontFamily = "sans-serif"
      field.label.style.fontSize = "21px"
      field.label.style.color = this.colors.light.text
      field.labelContainer.append(field.label)
      field.append(field.labelContainer)

      field.input = document.createElement("input")
      field.input.classList.add("field-input")
      field.input.classList.add("email-input")
      field.input.type = "email"
      field.input.placeholder = "meine@email.de"
      field.input.style.margin = "21px 89px 21px 34px"
      field.input.style.fontSize = "21px"
      field.input.style.backgroundColor = this.colors.light.background
      field.input.style.color = this.colors.light.text
      field.append(field.input)

      field.input.setAttribute("required", true)
      field.input.accept = "text/email"

      // this.verify("input/validity", field.input)
      // field.input.addEventListener("input", () => this.verify("input/validity", field.input))

      if (input !== undefined) input.append(field)
      return field
    }

    if (event === "field/lang") {

      const langField = new SelectionField("lang", input)
      langField.label.innerHTML = "Sprache"
      const options = ["aa","ab","ae","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bh","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","io","is","it","iu","ja","jv","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu"]
      for (let i = 0; i < options.length; i++) {
        const option = document.createElement("option")
        option.value = options[i]
        option.text = options[i]
        langField.select.append(option)
      }
      langField.select.value = "de"
      this.setValidStyle(langField.select)

      return langField

    }

    if (event === "field/image") {

      const imageField = new FileField("image", input)
      imageField.label.textContent = "Bildupload (JPEG, PNG, SVG)"
      imageField.input.accept = "image/jpeg, image/png, image/svg+xml"
      imageField.verifyValue()
      imageField.input.addEventListener("input", async (event) => {
        if (event.target.files[0].type === "image/svg+xml") {
          await imageField.validSvg(event.target.files[0])
        } else {
          await imageField.validImage(event.target.files[0])
        }
      })

      return imageField

    }

    if (event === "field-funnel") {
      const fieldFunnel = this.headerPicker("scrollable")
      fieldFunnel.classList.add("field-funnel")

      fieldFunnel.submitButton = this.buttonPicker("action", fieldFunnel)
      fieldFunnel.submitButton.classList.add("submit-field-funnel-button")
      fieldFunnel.submitButton.innerHTML = "Jetzt speichern"

      if (input !== undefined) input.append(fieldFunnel)

      return fieldFunnel
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
      const clickFunnel = this.headerPicker("scrollable")
      clickFunnel.classList.add("click-funnel")
      if (input !== undefined) input.append(clickFunnel)

      clickFunnel.style.display = "flex"
      clickFunnel.style.justifyContent = "center"
      clickFunnel.style.position = "relative"
      clickFunnel.style.margin = "21px 34px"

      {
        const button = this.buttonPicker("icon-top/text-bottom", clickFunnel)
        button.classList.add("start-click-funnel-button")
        button.icon.append(this.iconPicker("touch"))
        button.text.innerHTML = "Start"
      }

      {
        const button = this.buttonPicker("icon-top/text-bottom", clickFunnel)
        button.classList.add("end-click-funnel-button")

        button.style.display = "none"

        button.icon.append(this.iconPicker("touch"))
        button.text.innerHTML = "Speichern"
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

      header.loading = this.iconPicker("loading")
      header.loading.style.fill = this.colors.light.error
      header.loading.style.width = "55px"
      header.loading.style.margin = "8px"
      header.append(header.loading)

      header.info = document.createElement("div")
      header.info.innerHTML = "Das kann einen Moment dauern .."
      header.info.style.color = this.colors.light.error
      header.info.style.fontSize = "13px"
      header.info.style.fontFamily = "sans-serif"
      header.append(header.info)

      if (input !== undefined) input.append(header)
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
  }

  static render(event, input, parent) {
    // event = input/algorithm


    if (event === "mirror/match-maker-get-list") {

      return new Promise(async(resolve, reject) => {

        try {

          const sorted = input
          sorted.sort((a, b) => {
            return b.reputation - a.reputation // Descending order, for ascending use: a.reputation - b.reputation
          })

          const userList = this.create("div/scrollable")
          userList.setAttribute("id", `match-maker-list-${parent}`)

          document.querySelectorAll(`[match-maker="${parent}"]`).forEach(matchMaker => {

            for (let i = 0; i < sorted.length; i++) {
              const map = sorted[i]

              const clone = document.createElement("div")
              clone.innerHTML = matchMaker.innerHTML
              clone.setAttribute("id", `list-item-${i + 1}`)
              clone.style.marginBottom = "34px"


              Object.entries(map.funnel).forEach(([key, value]) => {
                clone.querySelectorAll(`.${key}`).forEach(div => {
                  div.innerHTML = value
                })

              })

              userList.append(clone)

            }

            const userLists = document.querySelectorAll(`#match-maker-list-${parent}`)

            if (userLists.length === 0) {
              matchMaker.before(userList)
              matchMaker.style.display = "none"
            }

            userLists.forEach(list => {
              this.convert("parent/scrollable", list)
              list.innerHTML = userList.innerHTML
              matchMaker.style.display = "none"
            })


          })

          resolve(userList)

        } catch (error) {
          reject(error)
        }

      })

    }

    if (event === "mirror/match-maker-get") {

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
              clone.innerHTML = matchMaker.innerHTML
              clone.setAttribute("id", `user-${i + 1}`)
              clone.style.marginBottom = "34px"

              for (let i = 0; i < user.treeValues.length; i++) {
                const treeValuePair = user.treeValues[i]

                const className = treeValuePair.tree.replace(/\./g, "-")

                for (let i = 0; i < clone.children.length; i++) {
                  const child = clone.children[i]
                  if (child.classList.contains(className)) {
                    child.innerHTML = treeValuePair.value
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
              list.innerHTML = userList.innerHTML
              matchMaker.style.display = "none"
            })


          })

          resolve(userList)

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
        foldAllButton.innerHTML = "fold"

        foldAllButton.addEventListener("click", function() {
          toggleAllValues("none");
        });

        const unfoldAllButton = this.create("div/action", buttons)
        unfoldAllButton.innerHTML = "unfold"
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

    if (event === "field-funnel/location-list-tagger") {

      const content = this.create("div/scrollable", parent)
      const fieldFunnel = this.convert("text/dom", input.funnel)
      content.append(fieldFunnel)

      this.add("field-funnel/oninput-sign-support", fieldFunnel)

      const submitButton = fieldFunnel.querySelector(".submit-field-funnel-button")
      submitButton.innerHTML = `${input.tag} jetzt speichern`
      submitButton.onclick = async () => {

        await this.verify("field-funnel/validity", fieldFunnel)

        const map = await this.convert("field-funnel/map", fieldFunnel)

        this.overlay("security", async securityOverlay => {
          const register = {}
          register.url = "/register/location-list/closed/"
          register.tag = input.tag
          register.map = map
          const res = await Request.closed(register)

          if (res.status === 200) {
            window.alert("Daten erfolgreich gespeichert.")
            if (input.ok !== undefined) await input.ok()
            this.remove("overlay", parent)
            this.remove("overlay", securityOverlay)
          }

          if (res.status !== 200) {
            window.alert("Fehler.. Bitte wiederholen.")
            this.remove("overlay", securityOverlay)
          }

        })

      }

      return content
    }

    if (event === "script/onbody") {

      return new Promise(async resolve => {

        if (document.body) {
          document.querySelectorAll(`#${input.id}`).forEach(script => script.remove())
          if (document.getElementById(`#${input.id}`) === null) {
            document.body.append(input)
            return resolve(input)
          }
        } else {
          await this.add("ms/timeout", 3000)
          await this.add("script/onbody", input)
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
      item.header.state.index.innerHTML = input.index
      item.header.state.append(item.header.state.index)

      item.header.text = document.createElement("div")
      item.header.text.classList.add("title")
      item.header.text.style.alignSelf = "center"
      item.header.text.style.marginLeft = "13px"
      item.header.text.innerHTML = input.title
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
      item.body.text.innerHTML = input.description
      item.body.text.style.marginBottom = "34px"
      item.body.append(item.body.text)

      item.body.button = document.createElement("div")
      item.body.button.classList.add("button")
      item.body.button.innerHTML = "Zur Übersicht"
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

      item.body.button.setAttribute("onclick", "console.log('hi')")

      parent.append(item)
      return item
    }

    if (event === "scripts/toolbox") {
      for (let i = 0; i < input.length; i++) {
        const script = input[i]

        const item = document.createElement("div")
        item.style.margin = "34px"

        const itemHeader = document.createElement("div")
        itemHeader.style.display = "flex"
        itemHeader.style.borderTopRightRadius = "21px"
        itemHeader.style.borderTopLeftRadius = "21px"
        itemHeader.style.borderBottomLeftRadius = "21px"
        itemHeader.style.fontFamily = "sans-serif"

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          itemHeader.style.backgroundColor = this.colors.matte.charcoal
          itemHeader.style.color = this.colors.matte.dark.text

        } else {
          itemHeader.style.color = this.colors.matte.light.text
          itemHeader.style.backgroundColor = this.colors.gray[1]
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
          itemState.style.backgroundColor = this.colors.dark.foreground
        } else {
          itemState.style.backgroundColor = this.colors.light.foreground
        }

        if (document.getElementById(script.name) !== null) {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            itemState.style.backgroundColor = this.colors.dark.success
          } else {
            itemState.style.backgroundColor = this.colors.light.success
          }
        }

        itemState.style.borderTopLeftRadius = "21px"
        itemState.style.borderBottomLeftRadius = "21px"

        const itemTitle = document.createElement("div")
        itemTitle.style.alignSelf = "center"
        itemTitle.style.marginLeft = "13px"

        {
          const name = document.createElement("div")
          name.innerHTML = script.name
          name.style.fontSize = "21px"
          itemTitle.append(name)
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
        buttons.style.justifyContent = "space-around"


        {
          const button = this.iconPicker("repeat-once")
          button.style.width = "55px"
          button.style.cursor = "pointer"
          button.addEventListener("click", async () => {

            await this.add("script/always", script)

            const removalScript = document.createElement("script")
            removalScript.id = "script-to-remove"
            removalScript.textContent = `
              document.getElementById("${script.name}").remove();
              document.getElementById("${removalScript.id}").remove();
            `
            document.body.appendChild(removalScript)
            itemState.style.backgroundColor = this.colors.matte.black


          })
          buttons.append(button)
        }

        {
          const button = this.iconPicker("repeat-always")
          button.style.width = "55px"
          button.style.cursor = "pointer"
          button.addEventListener("click", async () => {


            if (document.getElementById(script.name) === null) {
              await this.add("script/always", script)
            } else {
              window.alert("Skript existiert bereits.")
            }

            if (document.getElementById(script.name) !== null) {
              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                itemState.style.backgroundColor = this.colors.dark.success
              } else {
                itemState.style.backgroundColor = this.colors.light.success
              }
            }

          })
          buttons.append(button)
        }



        // get feedback length
        // all in one button
        {
          const button = this.create("button/branch", buttons)
          button.counter.innerHTML = script.feedbackLength
          this.update("feedback/script/location", button, script)
        }


        itemBody.append(buttons)
        item.append(itemBody)
        parent.append(item)
      }


    }

    if (event === "value/button") {

      const button = this.create("button/top-bottom", parent)
      button.bottom.innerHTML = input.alias
      button.bottom.classList.add("value")
      button.bottom.style.margin = "21px 34px"
      button.bottom.style.textAlign = "center"
      button.bottom.style.fontSize = "13px"
      button.bottom.style.fontFamily = "sans-serif"

      if (input.image !== undefined) {
        button.top.classList.add("image")

        if (input.image.svg !== undefined) {
          const svg = this.convert("text/svg", input.image.svg)
          svg.setAttribute("width", "100%")
          button.top.append(svg)
        }

        if (input.image.dataUrl !== undefined) {
          const img = document.createElement("img")
          img.src = input.image.dataUrl
          img.alt = input.image.name
          img.style.width = "100%"
          button.top.append(img)
        }

        if (input.image.url !== undefined) {
          const img = document.createElement("img")
          img.src = input.image.url
          img.style.width = "100%"
          button.top.append(img)
        }




      }

      return button
    }

    if (event === "platform/button") {

      const button = this.create("button/top-bottom", parent)
      button.bottom.classList.add("platform")
      button.bottom.innerHTML = input.name
      button.bottom.style.margin = "21px 34px"
      button.bottom.style.textAlign = "center"
      button.bottom.style.fontSize = "13px"
      button.bottom.style.fontFamily = "sans-serif"

      if (input.image !== undefined) {
        button.top.classList.add("image")

        if (input.image.svg !== undefined) {
          const svg = this.convert("text/svg", input.image.svg)
          svg.setAttribute("width", "100%")
          button.top.append(svg)
        }

        if (input.image.dataUrl !== undefined) {
          const img = document.createElement("img")
          img.src = input.image.dataUrl
          img.alt = input.image.name
          img.style.width = "100%"
          button.top.append(img)
        }

        if (input.image.url !== undefined) {
          const img = document.createElement("img")
          img.src = input.image.url
          img.style.width = "100%"
          button.top.append(img)
        }




      }

      return button
    }

    if (event === "/get/user-json/verified/2/") {

      return new Promise(async (resolve, reject) => {

        const get = {}
        get.url = event
        get.email = input
        const res = await Request.closed(get)

        if (res.status === 200) {

          const div = this.convert("json/div", res.response)
          div.classList.add("user-json")
          parent.append(div)

          return resolve()

        } else {
          return reject()
        }

      })

    }

    if (event === "user-keys/closed") {


      if (parent === undefined) {
        document.querySelectorAll(".expert-templates").forEach(div => {
          this.render(event, input, div)
        })
      }

      if (parent !== undefined) {
        if (!parent.classList.contains("expert-templates")) {
          parent.classList.add("expert-templates")
        }
      }

      if (parent !== undefined) {
        parent.innerHTML = ""
      }


      return new Promise(async (resolve, reject) => {

        const get = {}
        get.url = "/get/user-keys/closed/"
        const res = await Request.closed(get)

        if (res.status === 200) {
          const keys = JSON.parse(res.response)

          this.convert("parent/scrollable", parent)

          for (let i = 0; i < keys.length; i++) {
            const key = keys[i]

            const button = this.buttonPicker("left/right", parent)
            button.right.style.fontSize = "21px"
            button.right.innerHTML = `.${key}`
            const icon = this.iconPicker("delete")
            button.left.append(icon)

            if (input !== undefined) {
              if (input.onclick !== undefined) {
                button.onclick = (ev) => {
                  ev.key = key
                  input.onclick(ev)
                }
              }
            }

          }

          return resolve()

        } else {
          return reject()
        }






      })



    }

    if (event === "expert-templates/closed") {


      if (parent === undefined) {
        document.querySelectorAll(".expert-templates").forEach(div => {
          this.render(event, input, div)
        })
      }

      if (parent !== undefined) {
        if (!parent.classList.contains("expert-templates")) {
          parent.classList.add("expert-templates")
        }
      }

      if (parent !== undefined) {
        parent.innerHTML = ""
      }


      return new Promise(async (resolve, reject) => {

        const get = {}
        get.url = "/get/expert-templates/closed/"
        const res = await Request.closed(get)

        if (res.status === 200) {
          const templates = JSON.parse(res.response)

          this.convert("parent/scrollable", parent)

          for (let i = 0; i < templates.length; i++) {
            const template = templates[i]

            const item = document.createElement("div")
            item.style.margin = "34px"

            const itemHeader = document.createElement("div")
            itemHeader.style.display = "flex"
            itemHeader.style.borderTopRightRadius = "21px"
            itemHeader.style.borderTopLeftRadius = "21px"
            itemHeader.style.borderBottomLeftRadius = "21px"
            itemHeader.style.fontFamily = "sans-serif"

            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              itemHeader.style.backgroundColor = this.colors.matte.charcoal
              itemHeader.style.color = this.colors.matte.dark.text

            } else {
              itemHeader.style.color = this.colors.matte.light.text
              itemHeader.style.backgroundColor = this.colors.gray[1]
            }


            itemHeader.style.cursor = "pointer"
            itemHeader.addEventListener("click", () => {
              this.popup(overlay => {
                const templateOverlay = overlay
                this.headerPicker("removeOverlay", overlay)

                const info = this.headerPicker("info", overlay)
                info.append(`.templates`)

                const span = document.createElement("span")
                span.style.fontSize = "21px"
                span.innerHTML = `#${template.id}`
                info.append(span)


                {

                  const buttons = document.createElement("div")
                  buttons.style.overflowY = "auto"
                  buttons.style.paddingBottom = "144px"
                  buttons.style.overscrollBehavior = "none"
                  overlay.append(buttons)

                  {
                    const button = this.buttonPicker("left/right", buttons)
                    button.left.innerHTML = ".id"
                    button.right.innerHTML = "Id ändern"

                    button.addEventListener("click", () => {
                      this.popup(overlay => {
                        this.headerPicker("removeOverlay", overlay)

                        const info = this.headerPicker("info", overlay)
                        info.append(`.templates`)

                        {
                          const span = document.createElement("span")
                          span.style.fontSize = "21px"
                          span.innerHTML = `#${template.id}`
                          info.append(span)
                        }

                        {
                          const span = document.createElement("span")
                          span.innerHTML = `.id`
                          info.append(span)
                        }

                        const funnel = this.headerPicker("scrollable", overlay)


                        const idField = new TextField("id", funnel)
                        idField.input.required = true
                        idField.input.accept = "text/tag"
                        idField.label.innerHTML = "Template Id"
                        idField.label.placeholder = "meine-id"
                        idField.value(() => template.id)
                        idField.verifyValue()
                        idField.input.addEventListener("input", () => idField.verifyValue())

                        const button = this.buttonPicker("action", funnel)
                        button.innerHTML = "Jetzt ändern"
                        button.addEventListener("click", async () => {

                          const id = idField.validValue()

                          const verify = {}
                          verify.url = "/verify/template/closed/3/"
                          verify.type = "id"
                          verify.id = id
                          const res = await Request.middleware(verify)

                          if (res.status === 200) {
                            alert("Id existiert bereits.")
                            this.setNotValidStyle(idField.input)
                            throw new Error(`id exist`)
                          }

                          this.popup(async securityOverlay => {
                            this.headerPicker("loading", securityOverlay)

                            const register = {}
                            register.url = "/register/template/closed/3/"
                            register.type = "id"
                            register.old = template.id
                            register.new = id
                            const res = await Request.middleware(register)

                            if (res.status === 200) {
                              alert("Template Id erfolgreich gespeichert.")
                              this.removeOverlay(templatesOverlay)
                              this.removeOverlay(templateOverlay)
                              this.removeOverlay(overlay)
                              this.removeOverlay(securityOverlay)
                            } else {
                              alert("Fehler.. Bitte wiederholen.")
                              this.removeOverlay(securityOverlay)
                              throw new Error(`register template id failed`)
                            }
                          })

                        })




                      })
                    })

                  }

                  {
                    const button = this.buttonPicker("left/right", buttons)
                    button.left.innerHTML = ".alias"
                    button.right.innerHTML = "Alias ändern"

                    button.addEventListener("click", () => {
                      this.popup(overlay => {
                        this.headerPicker("removeOverlay", overlay)

                        const info = this.headerPicker("info", overlay)
                        info.append(`.templates`)

                        {
                          const span = document.createElement("span")
                          span.style.fontSize = "21px"
                          span.innerHTML = `#${template.id}`
                          info.append(span)
                        }

                        {
                          const span = document.createElement("span")
                          span.innerHTML = `.alias`
                          info.append(span)
                        }

                        const funnel = this.headerPicker("scrollable", overlay)


                        const aliasField = new TextField("alias", funnel)
                        aliasField.input.required = true
                        aliasField.label.innerHTML = "Template Alias"
                        aliasField.label.placeholder = "Mein Skript"
                        aliasField.value(() => template.alias)
                        aliasField.verifyValue()
                        aliasField.input.addEventListener("input", () => aliasField.verifyValue())

                        const button = this.buttonPicker("action", funnel)
                        button.innerHTML = "Jetzt ändern"
                        button.addEventListener("click", async () => {

                          const alias = aliasField.validValue()

                          this.popup(async securityOverlay => {
                            this.headerPicker("loading", securityOverlay)

                            const register = {}
                            register.url = "/register/template/closed/3/"
                            register.type = "alias"
                            register.id = template.id
                            register.alias = alias
                            const res = await Request.middleware(register)

                            if (res.status === 200) {
                              alert("Template Alias erfolgreich gespeichert.")
                              this.removeOverlay(templatesOverlay)
                              this.removeOverlay(templateOverlay)
                              this.removeOverlay(overlay)
                              this.removeOverlay(securityOverlay)
                            } else {
                              alert("Fehler.. Bitte wiederholen.")
                              this.removeOverlay(securityOverlay)
                              throw new Error(`register template alias failed`)
                            }
                          })

                        })




                      })
                    })

                  }

                  {
                    const button = this.buttonPicker("left/right", buttons)
                    button.left.innerHTML = ".dependencies"
                    button.right.innerHTML = "Abhängigkeiten definieren"

                    button.addEventListener("click", () => {
                      this.popup(async overlay => {
                        this.headerPicker("removeOverlay", overlay)


                        const info = this.headerPicker("info", overlay)
                        info.append(`.templates`)

                        {
                          const span = document.createElement("span")
                          span.style.fontSize = "21px"
                          span.innerHTML = `#${template.id}`
                          info.append(span)
                        }

                        {
                          const span = document.createElement("span")
                          span.innerHTML = `.dependencies`
                          info.append(span)
                        }


                        const funnel = this.headerPicker("scrollable", overlay)


                        const dependenciesField = new TextAreaField("dependencies", funnel)
                        dependenciesField.input.style.height = "144px"
                        dependenciesField.input.required = true
                        dependenciesField.label.innerHTML = "Template Abhängigkeiten"
                        dependenciesField.input.addEventListener("input", () => dependenciesField.verifyValue())

                        const get = {}
                        get.url = "/get/templates/closed/3/"
                        get.type = "dependencies"
                        get.id = template.id
                        const res = await Request.middleware(get)

                        if (res.status === 200) {
                          dependenciesField.value(() => res.response)
                        }
                        dependenciesField.verifyValue()

                        const button = this.buttonPicker("action", funnel)
                        button.innerHTML = "Jetzt ändern"
                        button.addEventListener("click", async () => {

                          const dependencies = dependenciesField.validValue()

                          this.popup(async securityOverlay => {
                            this.headerPicker("loading", securityOverlay)

                            const register = {}
                            register.url = "/register/template/closed/3/"
                            register.type = "dependencies"
                            register.id = template.id
                            register.dependencies = dependencies
                            const res = await Request.middleware(register)

                            if (res.status === 200) {
                              alert("Template Abhängigkeiten erfolgreich gespeichert.")
                              this.removeOverlay(overlay)
                              this.removeOverlay(securityOverlay)
                            } else {
                              alert("Fehler.. Bitte wiederholen.")
                              this.removeOverlay(securityOverlay)
                              throw new Error(`register template dependencies failed`)
                            }
                          })

                        })




                      })
                    })

                  }

                  {
                    const button = this.buttonPicker("left/right", buttons)
                    button.left.innerHTML = ".description"
                    button.right.innerHTML = "Template beschreiben"


                    button.addEventListener("click", () => {
                      this.popup(async overlay => {
                        this.headerPicker("removeOverlay", overlay)

                        const info = this.headerPicker("info", overlay)
                        info.append(`.templates`)

                        {
                          const span = document.createElement("span")
                          span.style.fontSize = "21px"
                          span.innerHTML = `#${template.id}`
                          info.append(span)
                        }

                        {
                          const span = document.createElement("span")
                          span.innerHTML = `.description`
                          info.append(span)
                        }


                        const funnel = this.headerPicker("scrollable", overlay)


                        const descriptionField = new TextAreaField("description", funnel)
                        descriptionField.input.style.height = "144px"
                        descriptionField.input.required = true
                        descriptionField.label.innerHTML = "Template Beschreibung"
                        descriptionField.input.addEventListener("input", () => descriptionField.verifyValue())

                        const get = {}
                        get.url = "/get/templates/closed/3/"
                        get.type = "description"
                        get.id = template.id
                        const res = await Request.middleware(get)

                        if (res.status === 200) {
                          descriptionField.value(() => res.response)
                        }
                        descriptionField.verifyValue()

                        const button = this.buttonPicker("action", funnel)
                        button.innerHTML = "Jetzt ändern"
                        button.addEventListener("click", async () => {

                          const description = descriptionField.validValue()

                          this.popup(async securityOverlay => {
                            this.headerPicker("loading", securityOverlay)

                            const register = {}
                            register.url = "/register/template/closed/3/"
                            register.type = "description"
                            register.id = template.id
                            register.description = description
                            const res = await Request.middleware(register)

                            if (res.status === 200) {
                              alert("Template Abhängigkeiten erfolgreich gespeichert.")
                              this.removeOverlay(overlay)
                              this.removeOverlay(securityOverlay)
                            } else {
                              alert("Fehler.. Bitte wiederholen.")
                              this.removeOverlay(securityOverlay)
                              throw new Error(`register template description failed`)
                            }
                          })

                        })




                      })
                    })

                  }

                  {
                    const button = this.buttonPicker("left/right", buttons)
                    button.left.innerHTML = ".script"
                    button.right.innerHTML = "Skript ändern"



                    button.addEventListener("click", () => {
                      this.popup(async overlay => {
                        this.headerPicker("removeOverlay", overlay)

                        const info = this.headerPicker("info", overlay)
                        info.append(`.templates`)

                        {
                          const span = document.createElement("span")
                          span.style.fontSize = "21px"
                          span.innerHTML = `#${template.id}`
                          info.append(span)
                        }

                        {
                          const span = document.createElement("span")
                          span.innerHTML = `.script`
                          info.append(span)
                        }

                        const funnel = this.headerPicker("scrollable", overlay)


                        const scriptField = new TextAreaField("script", funnel)
                        scriptField.input.style.height = "144px"
                        scriptField.input.required = true
                        scriptField.label.innerHTML = "Template Skript"
                        scriptField.input.addEventListener("input", () => scriptField.verifyValue())

                        const get = {}
                        get.url = "/get/templates/closed/3/"
                        get.type = "script"
                        get.id = template.id
                        const res = await Request.middleware(get)

                        if (res.status === 200) {
                          scriptField.value(() => res.response)
                        }
                        scriptField.verifyValue()

                        const button = this.buttonPicker("action", funnel)
                        button.innerHTML = "Jetzt ändern"
                        button.addEventListener("click", async () => {

                          const script = scriptField.validValue()

                          this.popup(async securityOverlay => {
                            this.headerPicker("loading", securityOverlay)

                            const register = {}
                            register.url = "/register/template/closed/3/"
                            register.type = "script"
                            register.id = template.id
                            register.script = script
                            const res = await Request.middleware(register)

                            if (res.status === 200) {
                              alert("Template Skript erfolgreich gespeichert.")
                              // this.removeOverlay(overlay)
                              this.removeOverlay(securityOverlay)
                            } else {
                              alert("Fehler.. Bitte wiederholen.")
                              this.removeOverlay(securityOverlay)
                              throw new Error(`register template script failed`)
                            }
                          })

                        })




                      })
                    })

                  }

                  {
                    const button = this.buttonPicker("left/right", buttons)
                    button.left.innerHTML = ".remove"
                    button.right.innerHTML = "Template löschen"

                    button.addEventListener("click", () => {


                      this.popup(async securityOverlay => {
                        this.headerPicker("loading", securityOverlay)

                        const del = {}
                        del.url = "/delete/template/closed/3/"
                        del.id = template.id
                        const res = await Request.middleware(del)

                        if (res.status === 200) {
                          alert("Template erfolgreich gelöscht.")
                          this.removeOverlay(templatesOverlay)
                          this.removeOverlay(overlay)
                          this.removeOverlay(securityOverlay)
                        } else {
                          alert("Fehler.. Bitte wiederholen.")
                          this.removeOverlay(securityOverlay)
                        }
                      })

                    })
                  }


                }


              })
            })

            const itemState = document.createElement("div")
            itemState.classList.add("item-state")
            itemState.style.display = "flex"
            itemState.style.justifyContent = "center"
            itemState.style.alignItems = "center"
            itemState.style.width = "89px"
            itemState.style.height = "89px"
            itemState.style.fontSize = "34px"

            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              itemState.style.backgroundColor = this.colors.dark.foreground
            } else {
              itemState.style.backgroundColor = this.colors.light.foreground
            }

            itemState.style.borderTopLeftRadius = "21px"
            itemState.style.borderBottomLeftRadius = "21px"

            const reputation = document.createElement("div")
            reputation.innerHTML = template.reputation
            reputation.style.fontSize = "34px"

            itemState.append(reputation)


            const itemTitle = document.createElement("div")
            itemTitle.style.alignSelf = "center"
            itemTitle.style.marginLeft = "13px"

            {
              const alias = document.createElement("div")
              alias.innerHTML = template.alias
              alias.style.fontSize = "21px"
              itemTitle.append(alias)
            }

            {
              const creator = document.createElement("div")
              creator.innerHTML = template.id
              creator.style.fontSize = "13px"
              itemTitle.append(creator)
            }

            itemHeader.append(itemState, itemTitle)
            item.append(itemHeader)

            const itemBody = document.createElement("div")
            itemBody.classList.add("item-body")
            itemBody.style.marginLeft = "8%"


            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              itemBody.style.backgroundColor = this.colors.matte.slate
              itemBody.style.boxShadow = this.colors.dark.boxShadow
            } else {
              itemBody.style.boxShadow = this.colors.light.boxShadow
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

              const button = document.createElement("div")
              button.style.cursor = "pointer"
              button.style.position = "relative"
              button.addEventListener("click", () => {

                this.popup(async overlay => {
                  const feedbackOverlay = overlay

                  this.headerPicker("removeOverlay", overlay)

                  const info = this.headerPicker("info", overlay)
                  info.append(this.convert("element/alias", document.body))
                  info.append(this.convert("text/span", `.templates[${i}].feedback`))

                  // const span = document.createElement("span")
                  // span.innerHTML = `.templates[${i}].feedback`
                  // span.style.fontSize = "13px"
                  // span.style.fontFamily = "monospace"
                  // info.append(span)

                  const content = this.headerPicker("scrollable", overlay)
                  // content.style.overflowY = "auto"
                  // content.style.overscrollBehavior = "none"
                  // content.style.paddingBottom = "144px"
                  // overlay.append(content)

                  const feedbackContainer = this.headerPicker("loading", content)
                  feedbackContainer.info.remove()

                  feedbackContainer.style.margin = "21px 34px"
                  feedbackContainer.style.overflowY = "auto"
                  feedbackContainer.style.overscrollBehavior = "none"
                  feedbackContainer.style.fontFamily = "monospace"
                  feedbackContainer.style.fontSize = "13px"
                  feedbackContainer.style.height = `${window.innerHeight * 0.4}px`


                  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    feedbackContainer.style.color = this.colors.dark.text
                  } else {
                    feedbackContainer.style.color = this.colors.light.text
                  }

                  const get = {}
                  get.url = "/get/templates/closed/3/"
                  get.type = "feedback"
                  get.id = template.id
                  get.location = window.location.href
                  get.referer = document.referrer
                  get.localStorageEmail = await Request.email()
                  get.localStorageId = await Request.localStorageId()
                  const res = await Request.middleware(get)

                  if (res.status !== 200) {
                    feedbackContainer.innerHTML = `<span style="margin: 21px 34px;">Kein Feedback gefunden.</span>`
                    throw new Error("feedback not found")
                  }

                  getFeedbackSuccess: if (res.status === 200) {
                    const feedback = JSON.parse(res.response)

                    if (feedback.length === 0) {
                      feedbackContainer.innerHTML = `<span style="margin: 21px 34px;">Kein Feedback gefunden.</span>`
                      break getFeedbackSuccess
                    }

                    this.reset(feedbackContainer)
                    feedbackContainer.style.margin = "21px 34px"
                    feedbackContainer.style.overflowY = "auto"
                    feedbackContainer.style.overscrollBehavior = "none"
                    feedbackContainer.style.fontFamily = "monospace"
                    feedbackContainer.style.fontSize = "13px"
                    feedbackContainer.style.height = `${window.innerHeight * 0.4}px`

                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      feedbackContainer.style.color = this.colors.dark.text
                    } else {
                      feedbackContainer.style.color = this.colors.light.text
                    }


                    for (let i = 0; i < feedback.length; i++) {
                      const value = feedback[i]

                      const div = document.createElement("div")
                      div.style.display = "flex"
                      div.style.justifyContent = "space-between"
                      div.style.alignItems = "center"

                      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {

                        if (i % 2 === 0) {
                          div.style.background = this.colors.light.foreground
                          div.style.color = this.colors.light.text
                        } else {
                          div.style.background = this.colors.dark.foreground
                          div.style.color = this.colors.dark.text
                        }

                      } else {

                        if (i % 2 === 1) {
                          div.style.background = this.colors.light.foreground
                          div.style.color = this.colors.light.text
                        } else {
                          div.style.background = this.colors.dark.foreground
                          div.style.color = this.colors.dark.text
                        }

                      }

                      const left = document.createElement("span")
                      left.innerHTML = `${this.convert("millis/dd.mm.yyyy hh:mm", value.created)}`
                      div.append(left)

                      const nextToLeft = document.createElement("span")
                      nextToLeft.style.width = "100%"
                      nextToLeft.style.margin = "0 13px"
                      nextToLeft.innerHTML = value.content
                      div.append(nextToLeft)

                      const right = document.createElement("span")
                      right.style.padding = "13px"
                      right.innerHTML = value.importance
                      div.append(right)

                      feedbackContainer.append(div)

                      div.style.cursor = "pointer"
                      div.addEventListener("click", () => {

                        this.popup(overlay => {
                          this.headerPicker("removeOverlay", overlay)

                          const button = this.buttonPicker("left/right", overlay)
                          const icon = this.iconPicker("delete")
                          icon.style.width = "34px"
                          button.left.append(icon)
                          button.right.innerHTML = "Feedback löschen"

                          button.addEventListener("click", async () => {
                            const confirm = window.confirm("Möchtest du diesen Beitrag wirklich löschen?")

                            if (confirm === true) {
                              const del = {}
                              del.url = "/delete/feedback/closed/3/"
                              del.type = "template"
                              del.id = template.id
                              del.created = value.created
                              del.location = window.location.href
                              del.referer = document.referrer
                              del.localStorageEmail = await Request.email()
                              del.localStorageId = await Request.localStorageId()
                              const res = await Request.middleware(del)

                              if (res.status === 200) {
                                alert("Beitrag erfolgreich gelöscht.")
                                length.innerHTML = template.feedbackLength - 1
                                this.removeOverlay(overlay)
                                this.removeOverlay(feedbackOverlay)
                              } else {
                                alert("Fehler.. Bitte wiederholen.")
                                this.removeOverlay(overlay)
                              }


                            }

                          })
                        })

                      })
                    }


                  }

                  const contentField = new TextField("feedback", content)
                  contentField.label.innerHTML = "Feedback"
                  contentField.input.required = true
                  contentField.input.maxLength = "377"
                  contentField.verifyValue()
                  contentField.input.addEventListener("input", () => contentField.verifyValue())

                  const importanceField = new RangeField("importance", content)
                  importanceField.input.min = "0"
                  importanceField.input.max = "13"
                  importanceField.input.step = "1"
                  importanceField.input.value = "0"
                  importanceField.label.innerHTML = `Wichtigkeit - ${importanceField.input.value}`
                  importanceField.verifyValue()
                  importanceField.input.addEventListener("input", (event) => {
                    importanceField.verifyValue()
                    importanceField.label.innerHTML = `Wichtigkeit - ${event.target.value}`
                  })

                  const button = this.buttonPicker("action", content)
                  button.innerHTML = "Jetzt speichern"
                  button.addEventListener("click", () => {

                    const importance = importanceField.validValue()
                    const content = contentField.validValue()


                    this.popup(async securityOverlay => {

                      this.headerPicker("loading", securityOverlay)

                      const register = {}
                      register.url = "/register/feedback/closed/3/"
                      register.type = "template"
                      register.id = template.id
                      register.importance = importance
                      register.content = content
                      register.location = window.location.href
                      register.referer = document.referrer
                      register.localStorageEmail = await Request.email()
                      register.localStorageId = await Request.localStorageId()
                      const res = await Request.middleware(register)

                      if (res.status === 200) {
                        alert("Feedback erfolgreich gespeichert.")
                        this.removeOverlay(securityOverlay)
                        this.removeOverlay(overlay)
                        length.innerHTML = template.feedbackLength + 1
                      } else {
                        alert("Fehler.. Bitte wiederholen.")
                        this.removeOverlay(securityOverlay)
                      }

                    })


                  })



                })

              })


              const icon = this.iconPicker("branch")
              icon.style.width = "55px"
              button.append(icon)

              const length = document.createElement("div")
              length.style.position = "absolute"
              length.style.top = "0"
              length.style.right = "0"
              length.style.fontFamily = "monospace"
              length.style.fontSize = "13px"
              length.style.borderRadius = "50%"
              length.style.padding = "3px 5px"
              length.innerHTML = template.feedbackLength

              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                length.style.color = this.colors.dark.text
                length.style.background = this.colors.dark.foreground
              } else {
                length.style.color = this.colors.light.text
                length.style.background = this.colors.light.foreground
              }
              button.append(length)
              buttons.append(button)
            }

            itemBody.append(buttons)
            item.append(itemBody)
            parent.append(item)
          }

          return resolve()


        } else {
          return reject()
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
        parent.innerHTML = ""
      }

      for (let i = 0; i < input.children.length; i++) {
        const option = input.children[i]

        const button = this.buttonPicker("left/right", parent)
        button.left.innerHTML = `Option ${i + 1}`
        button.right.innerHTML = option.value

        button.addEventListener("click", () => {
          this.popup(overlay => {
            this.headerPicker("removeOverlay", overlay)
            this.buttonPicker("toolbox/register-html", overlay)

            const info = this.headerPicker("info", overlay)
            info.append(this.convert("element/alias", option))

            option.ok = () => {
              this.render("select/options", input)
              this.removeOverlay(overlay)
            }

            this.get("funnel/select-option", overlay, option)

          })
        })

      }


    }

    if (event === "text/error-stack") {

      const code = this.convert("error-stack-text/div", input)

      code.style.fontSize = "13px"
      code.style.fontFamily = "monospace"
      code.style.margin = "21px 34px"
      code.style.overflow = "auto"

      code.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        code.style.color = this.colors.dark.text
      }

      if (parent !== undefined) parent.append(code)
      return code
    }

    if (event === "text/code") {

      const code = document.createElement("div")
      code.innerHTML = input
      code.style.fontSize = "13px"
      code.style.fontFamily = "monospace"
      code.style.margin = "21px 34px"
      code.style.overflow = "auto"

      code.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        code.style.color = this.colors.dark.text
      }

      if (parent !== undefined) parent.append(code)
      return code
    }

    if (event === "text/h1") {

      const h1 = document.createElement("h1")
      h1.innerHTML = input
      h1.style.margin = "21px 34px"
      h1.style.fontSize = "34px"
      h1.style.fontFamily = "sans-serif"
      h1.style.fontWeight = "normal"

      h1.style.color = this.colors.light.text
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        h1.style.color = this.colors.dark.text
      }

      if (parent !== undefined) parent.append(h1)
      return h1
    }

    if (event === "platform/roles") {

      return new Promise(async (resolve, reject) => {


        const content = this.headerPicker("loading", parent)

        const {platform, onclick} = input

        const get = {}
        get.url = "/get/platform/closed"
        get.type = "roles"
        get.platform = platform
        const res = await Request.closed(get)


        if (res.status === 200) {
          const roles = JSON.parse(res.response)

          this.convert("parent/scrollable", content)

          for (let i = 0; i < roles.length; i++) {
            const role = roles[i]

            const button = this.buttonPicker("left/right", content)
            button.left.innerHTML = role.name
            button.right.innerHTML = "Rolle"

            if (onclick !== undefined) button.addEventListener("click", event => onclick(role, event))


          }

          return resolve(content)

        }


        if (res.status !== 200) {
          this.redirect("session-expired")
          return reject()
        }

      })
    }

    if (event === "text/hr") {
      if (parent !== undefined) parent.append(this.convert(event, input))
    }

    if (event === "visibility/platform-value-closed") {

      this.convert("parent/scrollable", parent)

      const visibilityField = new SelectionField("visibility", parent)
      visibilityField.label.innerHTML = "Sichtbarkeit"
      visibilityField.verifyValue()
      visibilityField.select.addEventListener("input", () => {
        const value = visibilityField.validValue()[0].value
        input.visibility = value
        this.render(event, input, parent)
      })

      if (input.visibility === "open") {
        visibilityField.options(["open", "closed"])

        const button = this.buttonPicker("action", parent)
        button.innerHTML = "Sichtbarkeit jetzt ändern"
        button.addEventListener("click", async () => {

          const visibility = visibilityField.validValue()[0].value

          this.overlay("security", async securityOverlay => {

            const register = {}
            register.url = "/register/platform-value/closed/"
            register.type = "visibility"
            register.visibility = visibility
            register.path = input.path
            const res = await Request.closed(register)

            if (res.status === 200) {
              window.alert("Sichtbarkeit erfolgreich geändert.")
              this.removeOverlay(parent.parentElement.previousSibling.previousSibling)
              this.removeOverlay(parent.parentElement.previousSibling)
              this.removeOverlay(parent.parentElement)
              this.removeOverlay(securityOverlay)
            } else {
              window.alert("Fehler.. Bitte wiederholen.")
              this.removeOverlay(securityOverlay)
            }

          })

        })

      }

      if (input.visibility === "closed") {

        visibilityField.options(["closed", "open"])

        const rolesField = new SelectionField("roles", parent)
        rolesField.label.innerHTML = "Nutzer mit diesen Rollen dürfen mit deiner Werteinheit interagieren"
        rolesField.select.multiple = true

        const array = []

        if (input.roles !== undefined) {
          if (input.roles.available !== undefined) {

            for (let i = 0; i < input.roles.available.length; i++) {
              const role = input.roles.available[i]
              array.push(role.name)
            }

          }
        }


        rolesField.options(array)

        rolesField.verifyValue()

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

          for (let i = 0; i < rolesField.select.options.length; i++) {
            const option = rolesField.select.options[i]

            if (option.value === value) {
              option.selected = true
            }

          }

        }

        const authorizedField = new TextAreaField("authorized", parent)
        authorizedField.label.innerHTML = "Nutzer mit diesen E-Mail Adressen dürfen mit deiner Werteinheit interagieren"
        authorizedField.input.style.fontSize = "13px"
        authorizedField.input.style.fontFamily = "monospace"
        authorizedField.input.style.height = "89px"
        authorizedField.input.required = true
        authorizedField.input.accept = "email/array"
        authorizedField.input.value = JSON.stringify(input.authorized)
        authorizedField.verifyValue()
        authorizedField.input.addEventListener("input", () => authorizedField.verifyValue())

        const button = this.buttonPicker("action", parent)
        button.innerHTML = "Sichtbarkeit jetzt ändern"
        button.addEventListener("click", async () => {

          const visibility = visibilityField.validValue()[0].value

          const roles = []
          for (let i = 0; i < rolesField.validValue().length; i++) {
            const option = rolesField.validValue()[i]

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

          const authorized = JSON.parse(authorizedField.validValue())

          this.overlay("security", async securityOverlay => {

            const register = {}
            register.url = "/register/platform-value/closed/"
            register.type = "visibility"
            register.visibility = visibility
            register.roles = roles
            register.authorized = authorized
            register.path = input.path
            const res = await Request.closed(register)

            if (res.status === 200) {
              window.alert("Sichtbarkeit erfolgreich geändert.")
              this.removeOverlay(parent.parentElement.previousSibling.previousSibling)
              this.removeOverlay(parent.parentElement.previousSibling)
              this.removeOverlay(parent.parentElement)
              this.removeOverlay(securityOverlay)

              // ok callback ??
            } else {
              window.alert("Fehler.. Bitte wiederholen.")
              this.removeOverlay(securityOverlay)
            }

          })


        })
      }

    }

    if (event === "experts/open") {
      this.convert("parent/scrollable", parent)

      for (let i = 0; i < input.length; i++) {
        const expert = input[i]

        const button = this.buttonPicker("left/right", parent)
        button.left.innerHTML = expert
        button.addEventListener("click", () => window.location.assign(`/${expert}/`))
      }

    }

    if (event === "text/p") {
      const p = document.createElement("p")
      p.innerHTML = input
      p.style.margin = "21px 34px"
      p.style.fontSize = "21px"
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

      this.convert("parent/scrollable", parent)
      for (let i = 0; i < input.length; i++) {
        const value = input[i]

        const item = document.createElement("div")
        item.classList.add("checklist-item")
        item.style.margin = "34px"

        const itemHeader = document.createElement("div")
        itemHeader.classList.add("item-header")
        itemHeader.style.display = "flex"
        itemHeader.style.borderTopRightRadius = "21px"
        itemHeader.style.borderTopLeftRadius = "21px"
        itemHeader.style.borderBottomLeftRadius = "21px"
        // itemHeader.style.height = "89px"

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          itemHeader.style.backgroundColor = this.colors.matte.charcoal
        } else {

          itemHeader.style.backgroundColor = this.colors.gray[1]
        }

        itemHeader.style.cursor = "pointer"

        itemHeader.addEventListener("click", async () => {

          this.popup(overlay => {
            this.headerPicker("removeOverlay", overlay)
            const info = this.headerPicker("info", overlay)
            info.append(this.convert("text/span", value.path))

            {
              const buttons = this.headerPicker("scrollable", overlay)

              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".toolbox"
                button.right.innerHTML = "Bearbeite deine Werteinheit"
                button.addEventListener("click", () => window.location.assign(value.path))
              }

              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".path"
                button.right.innerHTML = "Pfad ändern"

                button.addEventListener("click", () => {

                  this.popup(async overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("text/span", ".value.path"))


                    const funnel = this. headerPicker("scrollable", overlay)

                    {
                      const pathField = new TextField("path", funnel)
                      pathField.value(() => value.path.split("/")[3])
                      pathField.label.innerHTML = "Pfad"
                      pathField.input.accept = "text/tag"
                      pathField.input.maxLength = "144"
                      pathField.input.required = true
                      pathField.input.placeholder = "Meine Werteinheit"
                      pathField.input.addEventListener("input", (event) => pathField.verifyValue())
                      pathField.verifyValue()

                      const button = this.buttonPicker("action", funnel)
                      button.innerHTML = "Pfad jetzt ändern"
                      button.addEventListener("click", async () => {

                        const path = pathField.validValue()

                        this.overlay("security", async securityOverlay => {

                          {
                            const verify = {}
                            verify.url = "/verify/platform-value/open/"
                            verify.type = "path"
                            verify.path = `/${value.path.split("/")[1]}/${value.path.split("/")[2]}/${path}/`
                            const res = await Request.middleware(verify)

                            if (res.status === 200) {
                              window.alert("Pfad existiert bereits.")
                              this.setNotValidStyle(pathField.input)
                              pathField.field.scrollIntoView({behavior: "smooth"})
                              this.removeOverlay(securityOverlay)
                              throw new Error("path exist")
                            }
                          }



                          const register = {}
                          register.url = "/register/platform-value/closed/"
                          register.type = "path"
                          register.oldPath = value.path
                          register.newPath = path
                          const res = await Request.middleware(register)

                          if (res.status === 200) {
                            window.alert("Pfad erfolgreich geändert..")

                            this.removeOverlay(overlay.previousSibling.previousSibling)
                            this.removeOverlay(overlay.previousSibling)
                            this.removeOverlay(overlay)

                            this.removeOverlay(securityOverlay)

                          } else {
                            window.alert("Fehler.. Bitte wiederholen.")
                            this.removeOverlay(securityOverlay)
                          }
                        })

                      })

                    }

                  })
                })

              }

              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".alias"
                button.right.innerHTML = "Alias ändern"

                button.addEventListener("click", () => {

                  this.popup(async overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("text/span", ".value.alias"))

                    {
                      const funnel = this.headerPicker("scrollable", overlay)

                      const valueAliasField = new TextField("valueAlias", funnel)
                      valueAliasField.value(() => value.alias)
                      valueAliasField.label.innerHTML = "Alias"
                      valueAliasField.input.maxLength = "144"
                      valueAliasField.input.required = true
                      valueAliasField.input.placeholder = "Meine Werteinheit"
                      valueAliasField.input.addEventListener("input", () => valueAliasField.verifyValue())
                      valueAliasField.verifyValue()

                      const button = this.buttonPicker("action", funnel)
                      button.innerHTML = "Alias jetzt ändern"
                      button.addEventListener("click", async () => {

                        const valueAlias = valueAliasField.validValue()

                        this.overlay("security", async securityOverlay => {

                          const register = {}
                          register.url = "/register/platform-value/closed/"
                          register.type = "alias"
                          register.alias = valueAlias
                          register.path = value.path
                          const res = await Request.middleware(register)
                          if (res.status === 200) {
                            window.alert("Alias erfolgreich geändert..")

                            this.removeOverlay(overlay.previousSibling.previousSibling)
                            this.removeOverlay(overlay.previousSibling)
                            this.removeOverlay(overlay)

                            this.removeOverlay(securityOverlay)

                          } else {
                            alert("Fehler.. Bitte wiederholen.")
                            this.removeOverlay(securityOverlay)
                          }
                        })


                      })
                    }

                  })
                })

              }

              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".image"
                button.right.innerHTML = "Bild ändern"

                button.addEventListener("click", () => {

                  this.popup(async overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("text/span", ".value.image"))

                    this.update("image/platform-value/closed", overlay, value)

                  })
                })

              }


              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".lang"
                button.right.innerHTML = "Sprache ändern"

                button.addEventListener("click", () => {

                  this.popup(async overlay => {


                    this.headerPicker("removeOverlay", overlay)
                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("text/span", ".value.lang"))

                    const funnel = this.headerPicker("scrollable", overlay)

                    const langField = this.create("field/lang", funnel)

                    const button = this.buttonPicker("action", funnel)
                    button.innerHTML = "Sprache jetzt ändern"
                    button.addEventListener("click", async () => {

                      const lang = langField.validValue()[0].value

                      this.overlay("security", async securityOverlay => {

                        const register = {}
                        register.url = "/register/platform-value/closed/"
                        register.type = "lang"
                        register.lang = lang
                        register.path = value.path
                        const res = await Request.middleware(register)


                        if (res.status === 200) {
                          window.alert("Sprache erfolgreich geändert..")

                          this.removeOverlay(overlay)

                          this.removeOverlay(securityOverlay)

                        } else {
                          window.alert("Fehler.. Bitte wiederholen.")
                          this.removeOverlay(securityOverlay)
                        }


                      })

                    })

                  })
                })

              }


              {

                // Sichtbarkeits app für value units
                // add platform roles
                // roles will be shown when visibilty closed
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".visibility"
                button.right.innerHTML = "Sichtbarkeit ändern"

                button.addEventListener("click", () => {


                  this.popup(async overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    const info = this.headerPicker("info", overlay)
                    // info.append(this.convert("text/span", input))
                    info.append(this.convert("text/span", ".visibility"))

                    // this.update("visibility/platform-value/closed")

                    const funnel = this.headerPicker("scrollable", overlay)




                    {
                      const get = {}
                      get.url = "/get/platform-value/closed/"
                      get.type = "visibility"
                      get.path = value.path
                      const res = await Request.closed(get)

                      if (res.status === 200) {
                        const map = JSON.parse(res.response)
                        map.path = value.path

                        this.render("visibility/platform-value-closed", map, funnel)
                      }


                    }

                  })

                })

              }

              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".delete"
                button.right.innerHTML = "Werteinheit löschen"

                button.addEventListener("click", async () => {

                  const confirm = window.confirm("Möchtest du deine Werteinheit wirklich löschen? Alle enthaltenen Daten werden ebenfalls gelöscht.")
                  if (confirm === true) {

                    this.overlay("security", async securityOverlay => {
                      const del = {}
                      del.url = "/delete/platform-value/closed/"
                      del.path = value.path
                      const res = await Request.middleware(del)

                      if (res.status === 200) {
                        window.alert("Werteinheit erfolgreich gelöscht..")

                        this.removeOverlay(overlay.previousSibling)
                        this.removeOverlay(overlay)

                        this.removeOverlay(securityOverlay)

                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")
                        this.removeOverlay(securityOverlay)
                      }
                    })

                  }

                })

              }

            }

          })
        })

        const itemState = document.createElement("div")
        itemState.classList.add("item-state")
        itemState.style.display = "flex"
        itemState.style.justifyContent = "center"
        itemState.style.alignItems = "center"
        itemState.style.minWidth = "89px"
        itemState.style.fontSize = "34px"


        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          itemState.style.backgroundColor = this.colors.matte.black
        } else {
          itemState.style.backgroundColor = this.colors.gray[2]
        }

        if (value.visibility === "closed") {
          if (value.roles.length === 0) {
            if (value.authorized.length === 0) {
              const stateIcon = this.iconPicker("closed-eye")
              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                stateIcon.children[0].style.fill = this.colors.matte.dark.text
              } else {
                stateIcon.children[0].style.fill = this.colors.matte.light.text
              }
              stateIcon.style.width = "34px"
              itemState.append(stateIcon)
            }
          }
        }

        if (value.visibility === "open") {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            itemState.style.backgroundColor = this.colors.matte.seaGreen
          } else {
            itemState.style.backgroundColor = this.colors.matte.lime
          }

          const stateIcon = this.iconPicker("open-eye")
          stateIcon.style.width = "34px"
          itemState.append(stateIcon)
        }

        if (value.visibility === "closed") {
          if (value.roles.length !== 0 || value.authorized.length !== 0) {
            itemState.style.backgroundColor = "#eed202"
            const stateIcon = document.createElement("img")
            stateIcon.src = "/public/locked.svg"
            stateIcon.alt = "Nur für bestimmte"
            stateIcon.style.width = "34px"
            itemState.append(stateIcon)
          }
        }
        itemState.style.borderTopLeftRadius = "21px"
        itemState.style.borderBottomLeftRadius = "21px"

        const itemTitle = document.createElement("div")
        itemTitle.classList.add("item-title")
        itemTitle.style.padding = "21px 34px"
        itemTitle.style.fontSize = "21px"
        itemTitle.style.overflow = "auto"
        itemTitle.style.height = "55px"
        itemTitle.style.width = "100%"


        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          itemTitle.style.color = this.colors.matte.dark.text
        } else {
          itemTitle.style.color = this.colors.matte.light.text
        }

        {
          const alias = document.createElement("div")
          alias.innerHTML = `${value.alias}`
          alias.classList.add("alias")
          alias.style.fontSize = "21px"
          itemTitle.append(alias)
        }

        {
          const path = document.createElement("div")
          path.classList.add("path")
          path.innerHTML = `${value.path}`
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
          const button = this.iconPicker("toolbox")
          button.style.width = "55px"
          button.style.cursor = "pointer"
          button.addEventListener("click", () => window.location.assign(value.path))
          buttons.append(button)
        }

        itemBody.append(buttons)
        item.append(itemBody)
        parent.append(item)
      }

    }

    if (event === "platform-values/location") {

      this.convert("parent/scrollable", parent)
      for (let i = 0; i < input.length; i++) {
        const value = input[i]

        const button = this.render("value/button", value, parent)

        button.addEventListener("click", () => window.location.assign(value.path))

      }

    }

    if (event === "platforms/closed") {


      parent.innerHTML = ""

      for (let i = 0; i < input.length; i++) {
        const platform = input[i]

        const button = this.render("platform/button", platform, parent)

        button.addEventListener("click", () => {

          this.popup(async overlay => {

            this.headerPicker("removeOverlay", overlay)
            const info = this.headerPicker("info", overlay)
            info.innerHTML = platform.name

            const buttons = this.headerPicker("scrollable", overlay)

            {
              const button = this.buttonPicker("left/right", buttons)
              button.left.innerHTML = ".create"
              button.right.innerHTML = "Neue Werteinheit erstellen"
              button.addEventListener("click", () => {

                this.popup(overlay => {


                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.innerHTML = platform.name

                  {
                    const span = document.createElement("span")
                    span.innerHTML = `.value`
                    info.append(span)
                  }



                  {
                    const funnel = this.headerPicker("scrollable", overlay)

                    const valuePathField = new TextField("valuePath", funnel)
                    valuePathField.label.innerHTML = "Pfad"
                    valuePathField.input.accept = "text/tag"
                    valuePathField.input.maxLength = "144"
                    valuePathField.input.required = true
                    valuePathField.input.placeholder = "meine-werteinheit"
                    valuePathField.input.addEventListener("input", () => valuePathField.verifyValue())
                    valuePathField.verifyValue()

                    const valueAliasField = new TextField("valueAlias", funnel)
                    valueAliasField.label.innerHTML = "Alias"
                    valueAliasField.input.maxLength = "144"
                    valueAliasField.input.required = true
                    valueAliasField.input.placeholder = "Meine Werteinheit"
                    valueAliasField.input.addEventListener("input", () => valueAliasField.verifyValue())
                    valueAliasField.verifyValue()

                    const button = this.buttonPicker("action", funnel)
                    button.innerHTML = "Werteinheit jetzt speichern"
                    button.addEventListener("click", async () => {

                      const valuePath = valuePathField.validValue()
                      const valueAlias = valueAliasField.validValue()

                      const verify = {}
                      verify.url = "/verify/platform-value/open/"
                      verify.type = "path"
                      verify.path = `/${window.location.pathname.split("/")[1]}/${platform.name}/${valuePath}/`
                      const res = await Request.middleware(verify)

                      if (res.status === 200) {
                        window.alert("Pfad existiert bereits.")
                        this.setNotValidStyle(valuePathField.input)
                        valuePathField.field.scrollIntoView({behavior: "smooth"})
                        throw new Error("path exist")
                      }

                      this.popup(async securityOverlay => {
                        this.headerPicker("loading", securityOverlay)

                        const register = {}
                        register.url = "/register/platform-value/closed/"
                        register.platform = platform.name
                        register.path = valuePath
                        register.alias = valueAlias
                        const res = await Request.middleware(register)

                        if (res.status === 200) {
                          alert("Werteinheit erfolgreich gespeichert..")
                          this.removeOverlay(securityOverlay)
                          this.removeOverlay(overlay)
                        } else {
                          alert("Fehler.. Bitte wiederholen.")
                          this.removeOverlay(securityOverlay)
                        }


                      })

                    })

                  }

                })

              })
            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.left.innerHTML = ".values"
              button.right.innerHTML = "Meine Werteinheiten"
              button.addEventListener("click", () => {

                this.popup(async overlay => {


                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.innerHTML = platform.name
                  info.append(this.convert("text/span", ".values"))


                  const units = this.headerPicker("loading", overlay)
                  const get = {}
                  get.url = "/get/platform-values/closed/"
                  get.platform = platform.name
                  const res = await Request.closed(get)

                  if (res.status !== 200) {
                    window.location.assign("/login/")
                  }

                  if (res.status === 200) {
                    const values = JSON.parse(res.response)

                    if (values.length === 0) {
                      this.convert("parent/info", units)
                      units.innerHTML = `<span style="margin: 21px 34px;">Es wurden keine Werteinheiten gefunden.</span>`
                      throw new Error("platform values is empty")
                    }

                    this.render("platform-values/closed", values, units)

                  }

                })
              })
            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.left.innerHTML = ".roles"
              button.right.innerHTML = "Rollen definieren"

              button.addEventListener("click", () => {
                this.popup(async overlay => {

                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.innerHTML = `${platform.name}.roles`

                  const create = this.buttonPicker("left/right", overlay)
                  create.left.innerHTML = ".create"
                  create.right.innerHTML = "Neue Rolle definieren"
                  create.addEventListener("click", () => {

                    this.popup(overlay => {
                      this.headerPicker("removeOverlay", overlay)
                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("text/span", "create.role"))

                      this.update("platform/role", overlay, {platform: platform.name, ok: async () => {

                        this.reset(roleList)
                        await this.update("platform/roles", roleList, platform.name)

                      }})

                    })

                  })

                  this.render("text/hr", "Meine Rollen", overlay)

                  const roleList = await this.update("platform/roles", overlay, platform.name)

                })
              })

            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.left.innerHTML = ".match-maker"
              button.right.innerHTML = "Match Maker definieren"

              button.addEventListener("click", () => {

                this.popup(async overlay => {

                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.innerHTML = `.match-maker`

                  const create = this.buttonPicker("left/right", overlay)
                  create.left.innerHTML = ".create"
                  create.right.innerHTML = "Neuen Match Maker definieren"
                  create.addEventListener("click", () => {

                    this.popup(async overlay => {
                      this.headerPicker("removeOverlay", overlay)
                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("text/span", `.${platform.name}.match-maker`))

                      const funnel = this.create("div/scrollable", overlay)

                      funnel.nameField = this.create("field/name", funnel)
                      funnel.nameField.label.innerHTML = "Gebe deinem Match Maker einen einzigartigen Namen (json/tag)"

                      this.verifyIs("input/valid", funnel.nameField.input)
                      funnel.nameField.input.oninput = () => this.verifyIs("input/valid", funnel.nameField.input)

                      funnel.submit = this.create("button/action", funnel)
                      funnel.submit.innerHTML = "Match Maker jetzt speichern"

                      funnel.submit.onclick = async () => {

                        const res = await this.verifyIs("input/valid", funnel.nameField.input)

                        if (res === true) {

                          const name = funnel.nameField.input.value

                          const res = await this.verify("match-maker-name/open", name)

                          if (res.status === 200) {
                            this.setNotValidStyle(funnel.nameField.input)
                            window.alert("Name existiert bereits.")
                            throw new Error("name exist")
                          }

                          this.overlay("security", async securityOverlay => {

                            const map = {}
                            map.platform = platform.name
                            map.name = name

                            const res = await this.register("name/match-maker/closed", map)

                            if (res.status === 200) {

                              await this.get("match-maker/closed", matchMakerContainer, platform.name)

                              this.remove("overlay", overlay)
                              this.remove("overlay", securityOverlay)

                            }

                          })

                        }

                      }

                    })

                  })

                  this.render("text/hr", "Meine Match Maker", overlay)

                  const matchMakerContainer = this.create("div/scrollable", overlay)
                  await this.get("match-maker/closed", matchMakerContainer, platform.name)

                })

              })

            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.right.innerHTML = "Angebot erstellen"
              button.left.innerHTML = ".offer"

              button.addEventListener("click", () => {
                this.popup(overlay => {
                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.append(this.convert("text/span", ".offer"))

                  const input = {}
                  input.ok = () => window.alert("Angebot erfolgreich gespeichert.")
                  input.platform = platform.name

                  this.get("offer/closed", overlay, input)

                })
              })
            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.left.innerHTML = ".services"
              button.right.innerHTML = "Leistungen definieren"

              button.addEventListener("click", () => {
                const input = {}
                input.platform = platform.name
                this.popup(async overlay => {

                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.innerHTML = `.services`

                  const create = this.buttonPicker("left/right", overlay)
                  create.left.innerHTML = ".create"
                  create.right.innerHTML = "Neue Leistung definieren"
                  create.addEventListener("click", () => {


                    this.popup(overlay => {
                      this.headerPicker("removeOverlay", overlay)
                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("text/span", ".service"))

                      input.ok = async () => {

                        this.reset(container)
                        await this.get("services/closed", container, input)
                        this.removeOverlay(overlay)

                      }

                      this.get("funnel/service", overlay, input)

                    })

                  })

                  this.render("text/hr", "Meine Leistungen", overlay)

                  const container = await this.get("services/closed", overlay, input)

                })
              })

            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.right.innerHTML = "Namen ändern"
              button.left.innerHTML = ".name"
              button.addEventListener("click", () => {

                this.popup(async overlay => {


                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.innerHTML = platform.name
                  info.append(this.convert("text/span", ".name"))

                  const funnel = this.headerPicker("scrollable", overlay)

                  const platformNameField = new TextField("platformName", funnel)
                  platformNameField.value(() => platform.name)
                  platformNameField.label.innerHTML = "Plattform"
                  platformNameField.input.accept = "text/tag"
                  platformNameField.input.maxLength = "21"
                  platformNameField.input.required = true
                  platformNameField.input.placeholder = "meine-plattform"
                  platformNameField.input.addEventListener("input", () => platformNameField.verifyValue())
                  platformNameField.verifyValue()

                  const button = this.buttonPicker("action", funnel)
                  button.innerHTML = "Namen jetzt ändern"
                  button.addEventListener("click", async () => {

                    const platformName = platformNameField.validValue()


                    this.overlay("security", async securityOverlay => {

                      {

                        const verify = {}
                        verify.url = "/verify/platform/open/"
                        verify.platform = platformName
                        const res = await Request.middleware(verify)

                        if (res.status === 200) {
                          window.alert("Plattform existiert bereits.")
                          this.setNotValidStyle(platformNameField.input)
                          this.removeOverlay(securityOverlay)
                          throw new Error("platform exist")
                        }

                      }


                      const register = {}
                      register.url = "/register/platform/closed/"
                      register.type = "name"
                      register.newPlatform = platformName
                      register.oldPlatform = platform.name
                      const res = await Request.middleware(register)

                      if (res.status === 200) {
                        window.alert("Platform erfolgreich geändert..")
                        window.location.reload()
                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")
                        this.removeOverlay(securityOverlay)
                      }
                    })


                  })

                })
              })
            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.right.innerHTML = "Bild ändern"
              button.left.innerHTML = ".image"

              button.addEventListener("click", () => {

                this.popup(async overlay => {

                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.innerHTML = platform.name
                  info.append(this.convert("text/span", ".image"))

                  this.update("image/platform/closed", overlay, platform.name)

                })
              })

            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.right.innerHTML = "Sichtbarkeit ändern"
              button.left.innerHTML = ".visibility"

              button.addEventListener("click", () => {

                this.popup(async overlay => {

                  this.headerPicker("removeOverlay", overlay)
                  const info = this.headerPicker("info", overlay)
                  info.innerHTML = platform.name
                  info.append(this.convert("text/span", ".visibility"))

                  const funnel = this.headerPicker("scrollable", overlay)

                  {
                    const visibilityField = new SelectionField("visibility", funnel)
                    visibilityField.label.innerHTML = "Sichtbarkeit"

                    const get = {}
                    get.url = "/get/platform/closed/"
                    get.type = "visibility"
                    get.platform = platform.name
                    const res = await Request.closed(get)

                    if (res.status === 200) {
                      const visibility = res.response

                      if (visibility === "open") {
                        visibilityField.options(["open", "closed"])
                      }
                      if (visibility === "closed") {
                        visibilityField.options(["closed", "open"])
                      }
                    }

                    visibilityField.verifyValue()

                    const button = this.buttonPicker("action", funnel)
                    button.innerHTML = "Sichtbarkeit jetzt ändern"
                    button.addEventListener("click", async () => {

                      const visibility = visibilityField.validValue()[0].value

                      this.overlay("security", async securityOverlay => {

                        const register = {}
                        register.url = "/register/platform/closed/"
                        register.type = "visibility"
                        register.visibility = visibility
                        register.platform = platform.name
                        const res = await Request.closed(register)

                        if (res.status === 200) {
                          window.alert("Sichtbarkeit erfolgreich geändert.")
                          this.removeOverlay(overlay)
                          this.removeOverlay(securityOverlay)
                        } else {
                          window.alert("Fehler.. Bitte wiederholen.")
                          this.removeOverlay(securityOverlay)
                        }

                      })

                    })
                  }

                })
              })

            }

            {
              const button = this.buttonPicker("left/right", buttons)
              button.right.innerHTML = "Plattform löschen"
              button.left.innerHTML = ".delete"

              button.addEventListener("click", () => {

                const confirm = window.confirm("Möchtest du deine Plattform wirklich löschen? Alle enthaltenen Dokumente werden ebenfalls gelöscht.")
                if (confirm === true) {

                  this.overlay("security", async securityOverlay => {
                    const del = {}
                    del.url = "/delete/platform/closed/"
                    del.platform = platform.name
                    const res = await Request.middleware(del)

                    if (res.status === 200) {
                      alert("Plattform erfolgreich gelöscht..")
                      window.location.reload()
                    } else {
                      alert("Fehler.. Bitte wiederholen.")
                      this.removeOverlay(securityOverlay)
                    }
                  })

                }

              })

            }


          })

        })

      }

    }

    if (event === "platforms/location") {

      parent.innerHTML = ""
      for (let i = 0; i < input.length; i++) {

        const platform = input[i]

        const button = this.render("platform/button", platform, parent)

        button.addEventListener("click", () => {

          this.popup(async overlay => {

            this.headerPicker("removeOverlay", overlay)

            {
              const content = this.headerPicker("loading", overlay)

              const ping = {}
              ping.url = "/get/platform-values/location/"
              ping.platform = platform.name
              const res = await Request.location(ping)

              if (res.status === 200) {
                const values = JSON.parse(res.response)
                this.render("platform-values/location", values, content)
              }

            }

          })


        })

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
        parent.innerHTML = ""
      }


      if (input.classList.contains("field-funnel")) {

        for (let i = 0; i < input.children.length; i++) {
          const field = input.children[i]

          if (field.classList.contains("submit-field-funnel-button")) continue

          if (field.classList.contains("field")) {
            const fieldInput = field.querySelector(".field-input")


            const button = this.buttonPicker("left/right", parent)
            button.left.innerHTML = field.id

            button.right.append(this.convert("input/alias", fieldInput))
            button.addEventListener("click", () => {
              this.popup(overlay => {
                this.headerPicker("removeOverlay", overlay)
                this.buttonPicker("toolbox/register-html", overlay)

                const info = this.headerPicker("info", overlay)
                info.append(this.convert("input/alias", fieldInput))


                const content = this.headerPicker("scrollable", overlay)


                field.ok = () => {
                  this.get(event, parent, input)
                  this.removeOverlay(overlay)
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
        parent.innerHTML = ""
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

        const button = this.buttonPicker("left/right", parent)
        button.left.append(this.convert("element/alias", child))
        button.right.innerHTML = "Element bearbeiten"

        button.addEventListener("click", () => {

          this.popup(async overlay => {

            this.headerPicker("removeOverlay", overlay)

            this.buttonPicker("toolbox/register-html", overlay)

            const info = this.headerPicker("info", overlay)

            const elementAlias = this.convert("element/alias", child)
            elementAlias.classList.add("element-alias")

            info.append(elementAlias)

            {
              const buttons = this.headerPicker("scrollable", overlay)

              if (child.tagName !== "SCRIPT") {

                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".children"
                button.right.innerHTML = "Element Inhalt"

                button.addEventListener("click", async () => {

                  if (child.children.length > 0) {

                    this.popup(overlay => {

                      this.headerPicker("removeOverlay", overlay)
                      this.buttonPicker("toolbox/register-html", overlay)

                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("element/alias", child))
                      info.append(this.convert("text/span", ".children"))

                      const childrenContainer = this.headerPicker("scrollable", overlay)
                      this.render(event, child, childrenContainer)

                    })

                  } else alert("Das HTML Element ist leer.")

                })

              }

              if (child.classList.contains("field-funnel")) {

                {

                  const button = this.buttonPicker("left/right", buttons)
                  button.left.innerHTML = ".fields"
                  button.right.innerHTML = "Datenfelder anhängen"
                  button.addEventListener("click", () => {

                    this.popup(overlay => {
                      this.headerPicker("removeOverlay", overlay)
                      this.buttonPicker("toolbox/register-html", overlay)

                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("element/alias", child))
                      info.append(this.convert("text/span", ".fields"))


                      {
                        const button = this.buttonPicker("left/right", overlay)
                        button.left.innerHTML = ".append"
                        button.right.innerHTML = "Neues Datenfeld erzeugen"
                        button.addEventListener("click", () => {

                          this.popup(overlay => {
                            this.headerPicker("removeOverlay", overlay)
                            this.buttonPicker("toolbox/register-html", overlay)

                            const info = this.headerPicker("info", overlay)
                            info.append(this.convert("element/alias", child))
                            info.append(this.convert("text/span", ".append"))

                            child.ok = () => {
                              this.render("field-funnel/fields", child)
                              this.removeOverlay(overlay)
                            }

                            this.get("funnel/field", overlay, child)

                          })

                        })
                      }


                      overlay.append(this.convert("text/hr", "Meine Datenfelder"))


                      const fieldsContainer = this.create("div/scrollable", overlay)
                      this.render("field-funnel/fields", child, fieldsContainer)

                    })

                  })

                }

                {
                  const button = this.buttonPicker("left/right", buttons)
                  button.left.innerHTML = ".next-path"
                  button.right.innerHTML = "Nach Abschluss, zur Werteinheit"
                  button.addEventListener("click", () => {
                    this.popup(overlay => {
                      this.headerPicker("removeOverlay", overlay)
                      this.buttonPicker("toolbox/register-html", overlay)

                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("element/alias", child))
                      info.append(this.convert("text/span", ".next-path"))

                      const content = this.headerPicker("scrollable", overlay)

                      const pathField = new TextField("path", content)
                      pathField.input.placeholder = "/mein/pfad/"
                      pathField.input.required = true
                      pathField.label.textContent = "https://www.get-your.de"
                      if (child.hasAttribute("next-path")) {
                        pathField.value(() => child.getAttribute("next-path"))
                          pathField.label.textContent = `https://www.get-your.de${child.getAttribute("next-path")}`
                      }
                      pathField.verifyValue()
                      pathField.input.addEventListener("input", (event) => {

                        if (this.stringIsEmpty(event.target.value)) {
                          this.setNotValidStyle(event.target)
                          child.removeAttribute("next-path")
                        }

                        // this.verifyIs("text/path", event.target.value)

                        if (!this.stringIsEmpty(event.target.value)) {
                          this.setValidStyle(event.target)
                          pathField.label.textContent = `https://www.get-your.de${event.target.value}`
                          child.setAttribute("next-path", event.target.value)
                        }

                      })



                    })
                  })
                }


              }

              if (child.tagName === "BODY") {

                {
                  const button = this.buttonPicker("left/right", buttons)
                  button.left.innerHTML = ".scripts"
                  button.right.innerHTML = "Nutze geprüfte HTML Sktipte"

                  button.addEventListener("click", () => {

                    this.popup(async overlay => {

                      this.headerPicker("removeOverlay", overlay)
                      this.buttonPicker("toolbox/register-html", overlay)

                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("text/span", ".scripts"))

                      await this.get("toolbox-scripts/closed", overlay)

                    })

                  })

                }

                {
                  const button = this.buttonPicker("left/right", buttons)
                  button.left.innerHTML = ".match-maker"
                  button.right.innerHTML = "Match Maker Skripte anhängen"

                  button.onclick = () => {
                    this.popup(async overlay => {
                      this.create("button/remove-overlay", overlay)
                      this.create("button/register-html", overlay)
                      const info = this.create("header/info", overlay)
                      info.innerHTML = ".match-maker"

                      const content = this.create("info/loading", overlay)

                      const res = await this.get("match-maker/toolbox-closed")

                      if (res.status === 200) {
                        const array = JSON.parse(res.response)

                        if (array.length === 0) {
                          this.convert("parent/info", content)
                          content.innerHTML = "Es wurden keine Match Maker gefunden."
                          throw new Error("match maker not found")
                        }

                        this.convert("parent/scrollable", content)

                        for (let i = 0; i < array.length; i++) {
                          const matchMaker = array[i]

                          const button = this.create("button/left-right", content)
                          button.right.innerHTML = matchMaker.id
                          button.left.innerHTML = matchMaker.name

                          button.onclick = () => {

                            this.popup(async overlay => {
                              this.create("button/remove-overlay", overlay)
                              this.create("button/register-html", overlay)
                              const info = this.create("header/info", overlay)
                              info.innerHTML = `.match-maker.${matchMaker.name}`

                              {
                                const button = this.create("button/left-right", overlay)
                                button.left.innerHTML = ".action"
                                button.right.innerHTML = "Optimiere deinen Match Maker"

                                button.onclick = () => {
                                  this.popup(overlay => {
                                    this.create("button/remove-overlay", overlay)
                                    this.create("button/register-html", overlay)
                                    const info = this.create("header/info", overlay)
                                    info.innerHTML = `.${matchMaker.name}.action`

                                    const content = this.create("div/scrollable", overlay)
                                    const actionField = this.create("field/select", content)
                                    actionField.label.innerHTML = "Wenn alle Bedingungen erfüllt sind dann .."
                                    actionField.input.add(["get", "remove", "show", "onclick", "onload", "get list"])
                                    this.verifyIs("input/valid", actionField.input)

                                    const dataMirrorField = this.create("field/trees", content)
                                    dataMirrorField.label.innerHTML = "Gebe eine JavaScript Liste mit Datenstrukturen ein und spiegel deine Nutzerliste mit den angefragten Daten"
                                    dataMirrorField.input.style.fontSize = "13px"
                                    dataMirrorField.input.placeholder = `["getyour.expert.name", "getyour.funnel.name"]`
                                    dataMirrorField.input.oninput = () => this.verifyIs("input/valid", dataMirrorField.input)
                                    this.verifyIs("input/valid", dataMirrorField.input)

                                    const jsField = this.create("field/js")
                                    jsField.label.innerHTML = "JavaScript Browser Funktionen + Plattform Helper Funktionen (javascript)"
                                    jsField.input.oninput = () => this.verify("input/value", jsField.input)

                                    const treeField = this.create("field/tree")
                                    treeField.input.placeholder = "getyour.expert.platforms"
                                    treeField.label.innerHTML = "Welche Liste möchtest du anzeigen lassen (text/tree)"
                                    treeField.input.oninput = () => this.verify("input/value", treeField.input)


                                    actionField.input.oninput = (event) => {
                                      const selected = this.convert("select/selected", event.target)

                                      dataMirrorField.remove()
                                      jsField.remove()
                                      treeField.remove()


                                      if (selected === "get") {
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

                                      if (selected === "get list") {
                                        actionField.after(treeField)
                                        this.verify("input/value", treeField.input)
                                      }
                                    }


                                    const submit = this.create("button/action", content)
                                    submit.innerHTML = "Match Maker jetzt anhängen"
                                    submit.onclick = async () => {

                                      const selected = this.convert("select/selected", actionField.input)

                                      if (selected === "onload") {

                                        await this.verify("input/value", jsField.input)

                                        const map = {}
                                        map.name = matchMaker.name
                                        map.conditions = conditions
                                        map.js = jsField.input.value

                                        const onloadScript = this.create("script/match-maker-onload", map)

                                        await this.render("script/onbody", onloadScript)

                                      }

                                      if (selected === "onclick") {

                                        await this.verify("input/value", jsField.input)

                                        const map = {}
                                        map.name = matchMaker.name
                                        map.conditions = conditions
                                        map.js = jsField.input.value

                                        const onclickScript = this.create("script/match-maker-onclick", map)

                                        await this.render("script/onbody", onclickScript)

                                      }


                                      if (selected === "show") {

                                        const map = {}
                                        map.name = matchMaker.name
                                        map.conditions = conditions

                                        const showScript = this.create("script/match-maker-show", map)

                                        await this.render("script/onbody", showScript)

                                      }

                                      if (selected === "remove") {

                                        const map = {}
                                        map.name = matchMaker.name
                                        map.conditions = conditions

                                        const removeScript = this.create("script/match-maker-remove", map)

                                        await this.render("script/onbody", removeScript)

                                      }

                                      if (selected === "get list") {

                                        await this.verify("input/value", treeField.input)

                                        const map = {}
                                        map.name = matchMaker.name
                                        map.conditions = conditions
                                        map.tree = treeField.input.value

                                        const getterScript = this.create("script/match-maker-get-list", map)

                                        await this.render("script/onbody", getterScript)

                                      }


                                      if (selected === "get") {

                                        await this.verify("input/value", dataMirrorField.input)

                                        const map = {}
                                        map.name = matchMaker.name
                                        map.conditions = conditions

                                        try {
                                          map.mirror = JSON.parse(dataMirrorField.input.value)
                                          if (map.mirror.length === 0) throw new Error("mirror is empty")
                                        } catch (error) {
                                          this.setNotValidStyle(dataMirrorField.input)
                                          throw error
                                        }

                                        const getterScript = this.create("script/match-maker-get", map)

                                        await this.render("script/onbody", getterScript)

                                      }

                                    }

                                  })
                                }


                              }

                              const conditionsContainer = this.create("info/loading", overlay)

                              const res = await this.get("match-maker-conditions/complete-closed", matchMaker.id)

                              let conditions
                              if (res.status === 200) {
                                conditions = JSON.parse(res.response)

                                if (conditions.length === 0) {
                                  this.convert("parent/info", conditionsContainer)
                                  conditionsContainer.innerHTML = "Keine Bedingungen definiert."
                                  throw new Error("conditions not found")
                                }

                                this.reset(conditionsContainer)
                                this.render("text/hr", `Bedingungen von ${matchMaker.name}`, conditionsContainer)
                                for (let i = 0; i < conditions.length; i++) {
                                  const condition = conditions[i]

                                  this.render("text/code", `(${condition.left} ${condition.operator} ${condition.right})`, conditionsContainer)

                                }

                              }

                            })

                          }


                        }




                      }


                    })
                  }

                }

              }

              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".append"
                button.right.innerHTML = "Element anhängen"
                if (child.tagName === "SCRIPT") {
                  button.right.innerHTML = "JavaScript anhängen"
                }

                button.addEventListener("click", () => {

                  this.popup(overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("element/alias", document.body))
                    info.append(this.convert("text/span", ".append"))


                    const buttons = this.headerPicker("scrollable", overlay)
                    {

                      if (child.tagName === "DIV" || child.tagName === "BODY") {

                        {

                          const button = this.buttonPicker("left/right", buttons)
                          button.left.innerHTML = ".field-funnel"
                          button.right.innerHTML = "Field Funnel anhängen"
                          button.addEventListener("click", () => {
                            this.popup(overlay => {
                              this.headerPicker("removeOverlay", overlay)
                              this.buttonPicker("toolbox/register-html", overlay)

                              const info = this.headerPicker("info", overlay)
                              info.append(this.convert("element/alias", child))
                              info.append(".field-funnel.append")

                              const content = this.headerPicker("scrollable", overlay)

                              const idField = new TextField("id", content)
                              idField.label.innerHTML = "Verwende eine individuelle Id, um dein Element eindeutig zu identifizieren"
                              idField.input.required = true
                              idField.input.accept = "text/id"
                              idField.verifyValue()
                              idField.input.addEventListener("input", () => idField.verifyValue())

                              const submitButton = this.buttonPicker("action", content)
                              submitButton.innerHTML = "Datenfeld Funnel jetzt anhängen"
                              submitButton.addEventListener("click", () => {

                                const id = idField.validValue()

                                if (document.getElementById(id) === null) {

                                  const element = this.create("field-funnel", child)
                                  element.id = id

                                  this.create("script/submit-field-funnel-event", document.body)

                                  this.removeOverlay(overlay)

                                }

                              })
                            })

                          })

                        }

                        {

                          const button = this.buttonPicker("left/right", buttons)
                          button.left.innerHTML = ".click-funnel"
                          button.right.innerHTML = "Klick Funnel anhängen"
                          button.addEventListener("click", () => {
                            this.popup(overlay => {
                              this.headerPicker("removeOverlay", overlay)
                              this.buttonPicker("toolbox/register-html", overlay)

                              const info = this.headerPicker("info", overlay)
                              info.append(this.convert("element/alias", child))
                              info.append(".click-funnel.append")

                              const content = this.headerPicker("scrollable", overlay)

                              const idField = new TextField("id", content)
                              idField.label.innerHTML = "Verwende eine individuelle Id, um dein Element eindeutig zu identifizieren"
                              idField.input.required = true
                              idField.input.accept = "text/id"
                              idField.verifyValue()
                              idField.input.addEventListener("input", () => idField.verifyValue())

                              const submitButton = this.buttonPicker("action", content)
                              submitButton.innerHTML = "Klick Funnel jetzt anhängen"
                              submitButton.addEventListener("click", () => {

                                const id = idField.validValue()

                                if (document.getElementById(id) === null) {

                                  const element = this.create("click-funnel", child)
                                  element.id = id

                                  this.create("script/click-funnel-start-event", document.body)

                                  this.removeOverlay(overlay)

                                }

                              })
                            })

                          })

                        }

                        {
                          const button = this.buttonPicker("left/right", buttons)
                          button.left.innerHTML = ".image"
                          button.right.innerHTML = "Bild anhängen"

                          button.addEventListener("click", () => {

                            this.popup(async overlay => {

                              this.headerPicker("removeOverlay", overlay)
                              this.buttonPicker("toolbox/register-html", overlay)

                              const info = this.headerPicker("info", overlay)
                              info.append(this.convert("element/alias", child))
                              info.append(this.convert("text/span", ".image"))



                              this.update("image/onclick", overlay, {ok: (url) => {
                                child.append(this.convert("text/img", url))
                              }})

                            })
                          })
                        }

                        {
                          const button = this.buttonPicker("left/right", buttons)
                          button.left.innerHTML = ".background-image"
                          button.right.innerHTML = "Hintergrund Bild anhängen"

                          button.addEventListener("click", () => {

                            this.popup(async overlay => {

                              this.headerPicker("removeOverlay", overlay)
                              this.buttonPicker("toolbox/register-html", overlay)

                              const info = this.headerPicker("info", overlay)
                              info.append(this.convert("element/alias", child))
                              info.append(this.convert("text/span", ".image"))


                              this.update("image/onclick", overlay, {ok: (url) => {
                                child.style.background = `url("${url}")`
                              }})

                            })
                          })
                        }

                        {
                          const button = this.buttonPicker("left/right", buttons)
                          button.left.innerHTML = ".access"
                          button.right.innerHTML = "Zugang anhängen"
                          button.addEventListener("click", () => {

                            this.popup(async overlay => {
                              this.headerPicker("removeOverlay", overlay)
                              this.buttonPicker("toolbox/register-html", overlay)

                              this.render("text/title", "Für welche Rolle möchtest du einen Zugang anhängen?", overlay)

                              await this.get("platform/roles", overlay, {platform: window.location.pathname.split("/")[2], onclick: role => {

                                this.create("login", document.body)
                                this.update("script/login", document.body, role)

                              }})

                            })
                          })

                        }
                          const button = this.buttonPicker("left/right", buttons)
                          button.left.innerHTML = ".role-apps"
                          button.right.innerHTML = "Rollenapps Freigabe Button anhängen"
                          button.addEventListener("click", () => {

                            this.popup(async overlay => {
                              this.headerPicker("removeOverlay", overlay)
                              this.buttonPicker("toolbox/register-html", overlay)


                              this.render("text/title", "Für welche Rolle möchtest du den Button anhängen?", overlay)

                              await this.get("platform/roles", overlay, {platform: window.location.pathname.split("/")[2], onclick: async (role, button, event) => {

                                overlay.querySelectorAll(".role-button").forEach(button => {

                                  const right = button.querySelector(".button-right")
                                  this.convert("element/button-right", right)
                                  right.innerHTML = "Rolle"

                                })

                                this.convert("element/checked", button.right)

                                this.create("button/role-apps", document.body)
                                this.update("script/role-apps-event", document.body, role)

                              }})

                            })
                          })
                        {

                        }

                      }



                      {
                        const button = this.buttonPicker("left/right", buttons)
                        button.left.innerHTML = ".html"
                        button.right.innerHTML = "HTML Element anhängen"
                        button.addEventListener("click", () => {
                          this.popup(overlay => {
                            this.headerPicker("removeOverlay", overlay)
                            this.buttonPicker("toolbox/register-html", overlay)

                            const info = this.headerPicker("info", overlay)
                            info.append(this.convert("element/alias", child))
                            info.append(".append.html")

                            const funnel = this.headerPicker("scrollable", overlay)

                            const htmlField = new TextAreaField("html-input", funnel)
                            htmlField.label.innerHTML = "HTML Import"
                            htmlField.input.placeholder = `<div>..</div>`
                            if (child.tagName === "SCRIPT") {
                              htmlField.label.innerHTML = "JavaScript"
                              htmlField.input.placeholder = `document.getElementById(id) ..`
                            }
                            htmlField.input.style.fontSize = "13px"
                            htmlField.input.style.fontFamily = `monospace`
                            htmlField.input.style.height = "89px"
                            htmlField.input.required = true
                            htmlField.verifyValue()
                            htmlField.input.addEventListener("input", () => htmlField.verifyValue())

                            const button = this.buttonPicker("action", funnel)
                            button.innerHTML = "Element jetzt anhängen"
                            button.addEventListener("click", async () => {

                              const text = htmlField.validValue()

                              const html = this.convert("text/html", text)
                              child.append(html)

                              this.removeOverlay(overlay)

                            })

                          })
                        })

                      }

                    }



                  })


                })

              }

              if (child.classList.contains("click-funnel")) {

                {
                  const button = this.buttonPicker("left/right", buttons)
                  button.left.innerHTML = ".questions"
                  button.right.innerHTML = "Klick Funnel bearbeiten"
                  button.addEventListener("click", () => {
                    this.popup(questionsOverlay => {

                      this.headerPicker("removeOverlay", questionsOverlay)
                      const info = this.headerPicker("info",questionsOverlay)
                      info.append(this.convert("element/alias", child))
                      {
                        const span = document.createElement("span")
                        span.innerHTML = ".questions"
                        info.append(span)
                      }

                      {
                        const button = this.buttonPicker("left/right", questionsOverlay)
                        button.left.innerHTML = ".append"
                        button.right.innerHTML = "Neue Frage anhängen"
                        button.addEventListener("click", () => {
                          this.popup(appendQuestionOverlay => {
                            this.headerPicker("removeOverlay", appendQuestionOverlay)
                            this.create("button/register-html", appendQuestionOverlay)

                            const info = this.headerPicker("info",appendQuestionOverlay)
                            info.append(this.convert("element/alias", child))
                            {
                              const span = document.createElement("span")
                              span.innerHTML = ".append"
                              info.append(span)
                            }

                            const appendQuestionFunnel = this.headerPicker("scrollable", appendQuestionOverlay)

                            const idField = new TextField("questionId", appendQuestionFunnel)
                            idField.label.innerHTML = "Gebe deiner Frage eine Id"
                            idField.input.required = true
                            idField.input.accept = "text/tag"
                            idField.verifyValue()
                            idField.input.addEventListener("input", () => {

                              try {
                                const value = idField.validValue()
                                if (document.querySelectorAll(`#${value}`).length === 0) {
                                  this.setValidStyle(idField.input)
                                } else this.setNotValidStyle(idField.input)
                              } catch (error) {
                                this.setNotValidStyle(idField.input)
                              }

                            })

                            const questionField = new TextAreaField("question", appendQuestionFunnel)
                            questionField.label.innerHTML = "Stelle eine Frage an dein Netzwerk"
                            questionField.input.required = true
                            questionField.verifyValue()
                            questionField.input.addEventListener("input", () => questionField.verifyValue())

                            const appendQuestionButton = this.buttonPicker("action", appendQuestionFunnel)
                            appendQuestionButton.innerHTML = "Jetzt anhängen"
                            appendQuestionButton.addEventListener("click", () => {
                              const question = questionField.validValue()
                              const id = idField.validValue()

                              if (document.getElementById(id) === null) {
                                const clickField = this.create("click-field", child)
                                clickField.id = id
                                clickField.question.textContent = question
                                this.removeOverlay(appendQuestionOverlay)
                                this.render("click-funnel/questions", child, questions)
                              } else {
                                window.alert("Id existiert bereits.")
                                this.setNotValidStyle(idField.input)
                                idField.field.scrollIntoView({behavior: "smooth"})
                              }


                            })




                          })
                        })
                      }

                      const questions = this.headerPicker("scrollable", questionsOverlay)
                      this.render("click-funnel/questions", child, questions)


                    })
                  })
                }


                {
                  const button = this.buttonPicker("left/right", buttons)
                  button.left.innerHTML = ".next-path"
                  button.right.innerHTML = "Nach Abschluss, zur Werteinheit"
                  button.addEventListener("click", () => {
                    this.popup(overlay => {
                      this.headerPicker("removeOverlay", overlay)
                      this.buttonPicker("toolbox/register-html", overlay)

                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("element/alias", child))
                      info.append(this.convert("text/span", ".next-path"))

                      const content = this.headerPicker("scrollable", overlay)

                      const pathField = new TextField("path", content)
                      pathField.input.placeholder = "/mein/pfad/"
                      pathField.input.required = true
                      pathField.label.textContent = "https://www.get-your.de"
                      if (child.hasAttribute("next-path")) {
                        pathField.value(() => child.getAttribute("next-path"))
                          pathField.label.textContent = `https://www.get-your.de${child.getAttribute("next-path")}`
                      }
                      pathField.verifyValue()
                      pathField.input.addEventListener("input", (event) => {

                        if (this.stringIsEmpty(event.target.value)) {
                          this.setNotValidStyle(event.target)
                          child.removeAttribute("next-path")
                        }

                        // this.verifyIs("text/path", event.target.value)

                        if (!this.stringIsEmpty(event.target.value)) {
                          this.setValidStyle(event.target)
                          pathField.label.textContent = `https://www.get-your.de${event.target.value}`
                          child.setAttribute("next-path", event.target.value)
                        }

                      })



                    })
                  })
                }


                {
                  const button = this.buttonPicker("left/right", buttons)
                  button.left.innerHTML = ".reset"
                  button.right.innerHTML = "Klick Funnel zurücksetzen"
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

              if (child.classList.contains("field")) {

                // if child is an input element
                // required
                // accept

                // do this for every child ???
                // class
                // id
                // label
                // no bulk action
                // no javascript
                // only dom maninpulation

              }

              if (child.tagName === "TITLE") {

                const button = this.buttonPicker("left/right", buttons)

                button.left.innerHTML = ".textContent"
                button.right.innerHTML = "Textinhalt ersetzen"

                button.addEventListener("click", async () => {

                  this.popup(async overlay => {

                    this.headerPicker("removeOverlay", overlay)

                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("element/alias", child))
                    info.append(this.convert("text/span", ".textContent"))

                    const textFieldIdField = new TextField("textFieldId", overlay)
                    textFieldIdField.label.innerHTML = "Dokumententitel"
                    textFieldIdField.value(() => child.textContent)
                    textFieldIdField.verifyValue()

                    textFieldIdField.input.addEventListener("input", (event) => {

                      child.textContent = event.target.value

                    })

                  })



                })

              }

              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".id"
                button.right.innerHTML = "Element Id ändern"
                button.addEventListener("click", async () => {

                  this.popup(async overlay => {

                    this.headerPicker("removeOverlay", overlay)

                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)

                    const elementAlias = this.convert("element/alias", child)
                    elementAlias.classList.add("element-alias")
                    info.append(elementAlias)
                    info.append(this.convert("text/span", ".id"))

                    // const span = document.createElement("span")
                    // span.innerHTML = ".id"
                    // span.style.fontSize = "13px"
                    // span.style.fontFamily = "monospace"
                    // info.append(span)

                    const textFieldIdField = new TextField("elementId", overlay)
                    textFieldIdField.label.innerHTML = "Element Id"
                    textFieldIdField.input.accept = "text/tag"
                    textFieldIdField.value(() => child.id)
                    textFieldIdField.verifyValue()
                    textFieldIdField.input.addEventListener("input", () => {

                      try {
                        const value = textFieldIdField.validValue()

                        if (document.querySelectorAll(`#${value}`).length === 0) {
                          this.setValidStyle(textFieldIdField.input)

                          child.id = value
                        } else this.setNotValidStyle(textFieldIdField.input)

                        document.querySelectorAll(".element-alias").forEach(element => {
                          element.innerHTML = ""
                          element.append(this.convert("element/alias", child))
                        })

                        // this.renderChildren(from, to)
                        this.render(event, input, parent)

                      } catch (error) {
                        this.setNotValidStyle(textFieldIdField.input)
                      }

                    })

                  })



                })
              }

              {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".class"
                button.right.innerHTML = "Element Klassen definieren"
                button.addEventListener("click", () => {

                  this.popup(overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)

                    const elementAlias = this.convert("element/alias", child)
                    elementAlias.classList.add("element-alias")
                    info.append(elementAlias)
                    info.append(this.convert("text/span", ".class"))

                    const content = this.headerPicker("scrollable", overlay)

                    const classField = new TextAreaField("class", content)
                    classField.label.innerHTML = "Element Klassen"
                    classField.input.placeholder = "mehrere klassen werden mit einem leerzeichen getrennt"
                    classField.input.style.fontFamily = "monospace"
                    classField.input.style.fontSize = "13px"
                    classField.input.style.height = "144px"
                    classField.value(() => Array.from(child.classList).join(" "))
                    classField.verifyValue()
                    classField.input.addEventListener("input", (event) => {
                      if (this.stringIsEmpty(event.target.value)) {
                        child.removeAttribute("class")

                        document.querySelectorAll(".element-alias").forEach(element => {
                          element.innerHTML = ""
                          element.append(this.convert("element/alias", child))
                        })

                        this.render(event, input, parent)
                      }
                      classField.verifyValue()
                    })

                    const button = this.buttonPicker("action", content)
                    button.innerHTML = "Klassen jetzt speichern"
                    button.addEventListener("click", () => {

                      const classes = classField.validValue().split(" ")

                      child.removeAttribute("class")
                      try {
                        child.classList.add(...classes)
                      } catch (error) {
                        this.setNotValidStyle(classField.input)
                        throw error
                      }

                      document.querySelectorAll(".element-alias").forEach(element => {
                        element.innerHTML = ""
                        element.append(this.convert("element/alias", child))
                      })


                      this.render(event, input, parent)
                      this.removeOverlay(overlay)
                    })

                  })



                })
              }

              if (child.tagName === "HEAD") {

                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".style"
                button.right.innerHTML = "Design importieren"

                button.addEventListener("click", () => {

                  this.popup(overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("element/alias", document.body))
                    info.append(this.convert("text/span", ".style"))

                    const funnel = this.headerPicker("scrollable", overlay)

                    {
                      const cssField = new TextAreaField("css", funnel)
                      cssField.label.innerHTML = "CSS Import"
                      cssField.input.placeholder = `.class {..}`
                      cssField.input.style.fontFamily = "monospace"
                      cssField.input.style.fontSize = "13px"
                      cssField.input.style.height = "89px"
                      cssField.input.addEventListener("input", () => cssField.verifyValue())
                      cssField.verifyValue()

                      const button = this.buttonPicker("action", funnel)
                      button.innerHTML = "Inhalt jetzt ersetzen"
                      button.addEventListener("click", async () => {

                        const css = cssField.validValue()

                        const style = document.createElement("style")
                        style.textContent = css

                        child.append(style)

                        this.removeOverlay(overlay)

                      })
                    }



                  })


                })

              }

              if (child.tagName === "BODY") {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".style"
                button.right.innerHTML = "Design anpassen"

                button.addEventListener("click", () => {

                  this.popup(overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("element/alias", child))
                    info.append(this.convert("text/span", ".style"))

                    const content = this.headerPicker("scrollable", overlay)

                    const cssField = new TextAreaField("css", content)
                    cssField.label.textContent = "CSS Import"
                    cssField.input.style.height = "55vh"
                    cssField.input.style.fontFamily = "monospace"
                    cssField.value(() => this.convert("styles/text", child))
                    cssField.verifyValue()
                    cssField.input.addEventListener("input", () => {

                      const css = cssField.validValue()

                      child.setAttribute("style", css)

                    })

                  })
                })

              }

              if (
                child.tagName !== "SCRIPT" &&
                child.tagName !== "BODY" &&
                child.tagName !== "HEAD"
              ) {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".style"
                button.right.innerHTML = "Design anpassen"

                button.addEventListener("click", () => {

                  this.popup(overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("element/alias", child))
                    info.append(this.convert("text/span", ".style"))

                    const content = this.headerPicker("scrollable", overlay)

                    {
                      const preview = document.createElement("div")
                      preview.style.height = `${window.innerHeight * 0.4}px`
                      preview.style.overflow = "auto"
                      const clone = child.cloneNode(true)
                      clone.id = Date.now()
                      clone.name = `${Date.now()}`
                      preview.append(clone)
                      content.append(preview)

                      const hr = this.convert("text/hr", "Vorschau")
                      content.append(hr)

                      const cssField = new TextAreaField("css", content)
                      cssField.label.textContent = "CSS Import"
                      cssField.input.style.height = "233px"
                      cssField.input.style.fontFamily = "monospace"
                      cssField.value(() => this.convert("styles/text", child))
                      cssField.verifyValue()
                      cssField.input.addEventListener("input", () => {

                        const css = cssField.validValue()

                        clone.setAttribute("style", css)
                        child.setAttribute("style", css)

                      })

                    }


                  })
                })

              }

              {

                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".innerHTML"
                button.right.innerHTML = "Inhalt ersetzen"

                button.addEventListener("click", () => {

                  this.popup(overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("element/alias", document.body))
                    info.append(this.convert("text/span", ".innerHTML"))

                    const funnel = this.headerPicker("scrollable", overlay)

                    {
                      const htmlField = new TextAreaField("html", funnel)
                      htmlField.label.innerHTML = "HTML Element"
                      htmlField.input.placeholder = `<div>..</div>`
                      htmlField.input.style.fontFamily = "monospace"
                      htmlField.input.style.fontSize = "13px"
                      htmlField.input.style.height = "89px"
                      htmlField.input.addEventListener("input", () => htmlField.verifyValue())
                      htmlField.verifyValue()

                      const button = this.buttonPicker("action", funnel)
                      button.innerHTML = "Inhalt jetzt ersetzen"
                      button.addEventListener("click", async () => {

                        const html = htmlField.validValue()


                        child.innerHTML = html

                        if (child.tagName === "BODY") {
                          await this.add("script/toolbox-getter")
                        }

                        this.removeOverlay(overlay)

                      })
                    }



                  })


                })

              }

              if (child.tagName === "DIV") {

                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".assign"
                button.right.innerHTML = "Klick Weiterleitung definieren"

                button.addEventListener("click", () => {

                  this.popup(overlay => {

                    this.headerPicker("removeOverlay", overlay)
                    this.buttonPicker("toolbox/register-html", overlay)

                    const info = this.headerPicker("info", overlay)
                    info.append(this.convert("element/alias", document.body))
                    info.append(this.convert("text/span", ".assing"))

                    const funnel = this.headerPicker("scrollable", overlay)

                    this.get("funnel/onclick-assign-path", funnel, child)

                  })


                })

              }

              if (
                child.tagName !== "BODY" &&
                child.tagName !== "HEAD"
              ) {

                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".copy"
                button.right.innerHTML = "Element kopieren"
                button.addEventListener("click", () => {
                  window.sessionStorage.setItem("copied", child.outerHTML)
                  window.alert("Element erfolgreich kopiert.")
                })

              }

              if (
                child.tagName !== "SCRIPT" &&
                child.tagName !== "HEAD"
              ) {
                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".paste"
                button.right.innerHTML = "Kopiertes Element anhängen"

                button.addEventListener("click", () => {
                  const elementString = window.sessionStorage.getItem("copied")

                  if (elementString === null) {
                    window.alert("Es wurde kein Element kopiert.")
                    throw new Error("copied element not found")
                  }

                  const element = this.convert("text/html", elementString)

                  if (element.hasAttribute("id")) {
                    const id = element.getAttribute("id")

                    const counter = document.querySelectorAll(`[id*='${id}']`).length

                    let copyId
                    if (!this.numberIsEmpty(counter)) {
                      copyId = `${id}-${counter}`
                    }

                    if (copyId !== undefined) {
                      element.setAttribute("id", copyId)
                    }

                  }

                  window.alert(`Element '${this.convert("element/tagName", element)}' wurde erfolgreich in '${this.convert("element/tagName", child)}' kopiert.`)
                  child.append(element)

                })

              }

              if (
                child.tagName !== "BODY" &&
                child.tagName !== "HEAD"
              ) {

                const button = this.buttonPicker("left/right", buttons)
                button.left.innerHTML = ".remove"
                button.right.innerHTML = "Element entfernen"

                button.addEventListener("click", async () => {

                  child.remove()
                  this.removeOverlay(overlay)

                  this.render(event, input, parent)

                })

              }


            }


          })

        })

        // drag and drop
        button.draggable = true

        button.addEventListener("dragstart", (event) => {

          event.dataTransfer.setData("id", child.id)

        })

        button.addEventListener("dragenter", (event) => {
          event.target.style.border = `2px dashed ${this.colors.matte.red}`
        })

        button.addEventListener("dragleave", (event) => {

          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            event.target.style.border = this.colors.dark.border
          } else {
            event.target.style.border = this.colors.light.border
          }

        })

        button.addEventListener("dragover", (event) => {
          event.preventDefault()
        })

        button.addEventListener("drop", (event) => {

          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            event.target.style.border = this.colors.dark.border
          } else {
            event.target.style.border = this.colors.light.border
          }

          const draggedId = event.dataTransfer.getData("id")

          let droppedId = child.id

          if (this.stringIsEmpty(draggedId)) {
            alert("Das ausgewählte Element hat keine Id. Wenn du es verschieben möchtest, dann vergebe dem Element eine Id.")
            throw new Error("dragged id is empty")
          }

          if (this.stringIsEmpty(droppedId)) {
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
          parent.innerHTML = ""
          for (let i = 0; i < container.children.length; i++) {
            const child = container.children[i]

            if (child.classList.contains("answer-box")) {
              const answer = child.querySelector(".answer")

              const button = this.buttonPicker("left/right", parent)
              button.left.innerHTML = `Option ${i + 1}`
              button.right.textContent = answer.textContent
              button.addEventListener("click", () => {
                this.popup(answersFunnelOverlay => {
                  this.headerPicker("removeOverlay", answersFunnelOverlay)

                  const info = this.headerPicker("info", answersFunnelOverlay)
                  info.append(this.convert("element/alias", child))


                  const answerFunnel = this.headerPicker("scrollable", answersFunnelOverlay)

                  const answerField = new TextAreaField("answer", answerFunnel)
                  answerField.value(() => answer.textContent)
                  answerField.label.innerHTML = "Antwortmöglichkeit ändern"
                  answerField.input.required = true
                  answerField.verifyValue()
                  answerField.input.addEventListener("input", () => {

                    try {
                      const value = answerField.validValue()
                      answer.textContent = value
                    } catch (error) {
                      this.setNotValidStyle(answerField.input)
                    }

                    this.render(event, input, parent)

                  })

                  const imageField = new FileField("image", answerFunnel)
                  imageField.label.textContent = "Bild Upload (PNG, SVG, JPEG)"
                  imageField.input.accept = "image/jpeg, image/png, image/svg+xml"
                  imageField.verifyValue()
                  imageField.input.addEventListener("input", async (event) => {

                    const image = document.createElement("div")
                    image.classList.add("image")
                    image.style.width = "144px"
                    image.style.display = "flex"
                    image.style.overflow = "hidden"

                    const imageContainer = child.querySelector(".image")
                    this.reset(imageContainer)
                    imageContainer.style.width = "144px"
                    imageContainer.style.display = "flex"
                    imageContainer.style.overflow = "hidden"
                    imageContainer.append(image)

                    if (event.target.files[0].type === "image/svg+xml") {

                      const svgFile = await imageField.validSvg(event.target.files[0])
                      const svg = this.convert("text/svg", svgFile.svg)
                      svg.setAttribute("width", "100%")
                      image.append(svg)

                    } else {

                      const imageFile = await imageField.validImage(event.target.files[0])
                      const img = document.createElement("img")
                      img.style.width = "100%"
                      img.src = imageFile.dataUrl
                      img.alt = imageFile.name
                      image.append(img)

                    }

                  })

                  const selectedConditionButton = this.buttonPicker("left/right", answerFunnel)
                  selectedConditionButton.left.innerHTML = ".onclick"
                  selectedConditionButton.right.innerHTML = "Klick Bedingung definieren"
                  selectedConditionButton.addEventListener("click", () => {

                    this.popup(conditionFunnelOverlay => {
                      this.headerPicker("removeOverlay", conditionFunnelOverlay)

                      const info = this.headerPicker("info", conditionFunnelOverlay)
                      info.append(this.convert("element/alias", child))
                      {
                        const span = document.createElement("span")
                        span.innerHTML = `.onclick`
                        info.append(span)
                      }

                      const content = this.headerPicker("scrollable", conditionFunnelOverlay)

                      const actionField = new SelectionField("condition-action", content)
                      actionField.label.innerHTML = "Wähle ein Event"
                      actionField.options(["skip", "path"])
                      if (answer.hasAttribute("onclick-condition")) {
                        const condition = JSON.parse(answer.getAttribute("onclick-condition"))
                        actionField.value(() => [condition.event])
                      }
                      actionField.verifyValue()
                      actionField.select.addEventListener("input", () => {

                        actionField.withOptionSelected(option => {

                          if (option.value === "skip") {

                            skipNumberField.input.disabled = false
                            skipNumberField.input.required = true
                            this.setNotValidStyle(skipNumberField.input)

                            pathField.input.disabled = true
                            pathField.input.required = false
                            pathField.input.value = ""
                            this.setValidStyle(pathField.input)

                          }

                          if (option.value === "path") {

                            skipNumberField.input.disabled = true
                            skipNumberField.input.required = false
                            skipNumberField.input.value = ""
                            this.setValidStyle(skipNumberField.input)

                            pathField.input.disabled = false
                            pathField.input.required = true
                            this.setNotValidStyle(pathField.input)

                          }

                        })

                      })

                      const skipNumberField = new TelField("skip", content)
                      skipNumberField.input.disabled = false
                      skipNumberField.input.required = true
                      skipNumberField.input.pattern = "[1-9]"
                      skipNumberField.label.innerHTML = "Wieviele Fragen möchtest du überspringen"
                      if (answer.hasAttribute("onclick-condition")) {
                        const condition = JSON.parse(answer.getAttribute("onclick-condition"))
                        if (condition.event === "skip") {
                          skipNumberField.value(() => condition.skip)
                        }
                      }
                      skipNumberField.verifyValue()
                      skipNumberField.input.addEventListener("input", () => skipNumberField.verifyValue())

                      const pathField = new TextField("path", content)
                      pathField.input.disabled = true
                      pathField.input.required = false
                      pathField.input.accept = "text/path"
                      pathField.input.placeholder = "/meine-platform/mein-username/meine-werteinheit/"
                      pathField.label.innerHTML = "Gebe eine Pfad ein"
                      if (answer.hasAttribute("onclick-condition")) {
                        const condition = JSON.parse(answer.getAttribute("onclick-condition"))
                        if (condition.event === "path") {
                          pathField.value(() => condition.path)
                        }
                      }
                      this.setValidStyle(pathField.input)
                      pathField.input.addEventListener("input", () => pathField.verifyValue())

                      const conditionSubmitButton = this.buttonPicker("action", content)
                      conditionSubmitButton.innerHTML = "Klick Bedingung hinzufügen"
                      conditionSubmitButton.addEventListener("click", () => {

                        const condition = {}
                        condition.event = actionField.validValue()[0].value

                        if (condition.event === "skip") {
                          condition.skip = skipNumberField.validValue()
                        }

                        if (condition.event === "path") {
                          condition.path = pathField.validValue()
                        }

                        answer.setAttribute("onclick-condition", JSON.stringify(condition))

                        this.removeOverlay(conditionFunnelOverlay)
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



        parent.innerHTML = ""
        for (let i = 0; i < input.children.length; i++) {
          const child = input.children[i]

          if (child.classList.contains("start-click-funnel-button")) continue
          if (child.classList.contains("end-click-funnel-button")) continue

          if (child.classList.contains("click-field")) {
            const button = this.buttonPicker("left/right", parent)
            button.left.innerHTML = child.id
            button.right.innerHTML = "Frage bearbeiten"
            button.addEventListener("click", () => {
              this.popup(questionsFunnelOverlay => {
                this.headerPicker("removeOverlay", questionsFunnelOverlay)

                const info = this.headerPicker("info", questionsFunnelOverlay)
                info.append(this.convert("element/alias", child))

                const questionsFunnel = this.headerPicker("scrollable", questionsFunnelOverlay)

                const idField = new TextField("id", questionsFunnel)
                idField.value(() => child.id)
                idField.label.innerHTML = "Id"
                idField.input.required = true
                idField.input.accept = "text/tag"
                idField.verifyValue()
                idField.input.addEventListener("input", () => {

                  try {
                    const value = idField.validValue()
                    if (document.querySelectorAll(`#${value}`).length === 0) {
                      child.id = value
                    } else this.setNotValidStyle(idField.input)

                    info.innerHTML = ""
                    info.append(this.convert("element/alias", child))

                    this.render(event, input, parent)

                  } catch (error) {
                    this.setNotValidStyle(idField.input)
                  }

                })


                const question = child.querySelector(".question")
                const labelField = new TextAreaField("label", questionsFunnel)
                labelField.value(() => question.textContent)
                labelField.label.innerHTML = "Frage"
                labelField.input.required = true
                labelField.verifyValue()
                labelField.input.addEventListener("input", () => {

                  try {
                    const value = labelField.validValue()
                    question.textContent = value
                  } catch (error) {
                    this.setNotValidStyle(labelField.input)
                  }

                })

                const button = this.buttonPicker("left/right", questionsFunnel)
                button.left.innerHTML = ".options"
                button.right.innerHTML = "Antworten bearbeiten"
                button.addEventListener("click", () => {
                  this.popup(answersOverlay => {
                    this.headerPicker("removeOverlay", answersOverlay)
                    this.create("button/register-html", answersOverlay)

                    const info = this.headerPicker("info", answersOverlay)
                    info.append(this.convert("element/alias", child))

                    {
                      const span = document.createElement("span")
                      span.innerHTML = `.options`
                      info.append(span)
                    }

                    {
                      const button = this.buttonPicker("left/right", answersOverlay)
                      button.left.innerHTML = ".append"
                      button.right.innerHTML = "Neue Antwortmöglichkeit anhängen"
                      button.addEventListener("click", () => {

                        const answerBox = this.create("answer-box")

                        this.popup(appendAnswerOverlay => {
                          this.headerPicker("removeOverlay", appendAnswerOverlay)

                          const info = this.headerPicker("info", appendAnswerOverlay)
                          info.append(this.convert("element/alias", child))
                          {
                            const span = document.createElement("span")
                            span.innerHTML = ".append"
                            info.append(span)
                          }

                          const answerFunnel = this.headerPicker("scrollable", appendAnswerOverlay)

                          const answerField = new TextAreaField("answer", answerFunnel)
                          answerField.label.innerHTML = "Antwortmöglichkeit"
                          answerField.input.required = true
                          answerField.verifyValue()
                          answerField.input.addEventListener("input", () => answerField.verifyValue())

                          const selectedConditionButton = this.buttonPicker("left/right", answerFunnel)
                          selectedConditionButton.left.innerHTML = ".onclick"
                          selectedConditionButton.right.innerHTML = "Klick Bedingung definieren"
                          selectedConditionButton.addEventListener("click", () => {

                            this.popup(conditionFunnelOverlay => {
                              this.headerPicker("removeOverlay", conditionFunnelOverlay)

                              const info = this.headerPicker("info", conditionFunnelOverlay)
                              info.append(this.convert("element/alias", child))
                              {
                                const span = document.createElement("span")
                                span.innerHTML = `.onclick`
                                info.append(span)
                              }


                              const content = this.headerPicker("scrollable", conditionFunnelOverlay)

                              const actionField = new SelectionField("condition-action", content)
                              actionField.label.innerHTML = "Wähle ein Event"
                              actionField.options(["skip", "path"])
                              actionField.verifyValue()
                              actionField.select.addEventListener("input", () => {

                                actionField.withOptionSelected(option => {

                                  if (option.value === "skip") {

                                    skipNumberField.input.disabled = false
                                    skipNumberField.input.required = true
                                    this.setNotValidStyle(skipNumberField.input)

                                    pathField.input.disabled = true
                                    pathField.input.required = false
                                    pathField.input.value = ""
                                    this.setValidStyle(pathField.input)

                                  }

                                  if (option.value === "path") {

                                    skipNumberField.input.disabled = true
                                    skipNumberField.input.required = false
                                    skipNumberField.input.value = ""
                                    this.setValidStyle(skipNumberField.input)

                                    pathField.input.disabled = false
                                    pathField.input.required = true
                                    this.setNotValidStyle(pathField.input)

                                  }

                                })

                              })

                              const skipNumberField = new TelField("skip", content)
                              skipNumberField.input.required = true
                              skipNumberField.input.pattern = "[1-9]"
                              skipNumberField.label.innerHTML = "Wieviele Fragen möchtest du überspringen"
                              skipNumberField.verifyValue()
                              skipNumberField.input.addEventListener("input", () => skipNumberField.verifyValue())

                              const pathField = new TextField("path", content)
                              pathField.input.disabled = true
                              pathField.input.accept = "text/path"
                              pathField.input.placeholder = "/meine-platform/mein-username/meine-werteinheit/"
                              pathField.label.innerHTML = "Gebe eine Pfad ein"
                              this.setValidStyle(pathField.input)
                              pathField.input.addEventListener("input", () => pathField.verifyValue())

                              const conditionSubmitButton = this.buttonPicker("action", content)
                              conditionSubmitButton.innerHTML = "Klick Bedingung hinzufügen"
                              conditionSubmitButton.addEventListener("click", () => {

                                const condition = {}
                                condition.event = actionField.validValue()[0].value

                                if (condition.event === "skip") {
                                  condition.skip = skipNumberField.validValue()
                                  answerBox.answer.setAttribute("onclick-condition", JSON.stringify(condition))
                                }

                                if (condition.event === "path") {
                                  condition.path = pathField.validValue()
                                  answerBox.answer.setAttribute("onclick-condition", JSON.stringify(condition))
                                }

                                this.removeOverlay(conditionFunnelOverlay)
                              })

                            })



                          })

                          const appendAnswerButton = this.buttonPicker("action", answerFunnel)
                          appendAnswerButton.innerHTML = "Option jetzt anhängen"
                          appendAnswerButton.addEventListener("click", async () => {

                            const answer = answerField.validValue()

                            answerBox.answer.textContent = answer

                            child.querySelector(".answers").append(answerBox)

                            this.render("click-field/answers", document.getElementById(child.id), answers)

                            this.removeOverlay(appendAnswerOverlay)

                          })



                        })
                      })
                    }

                    const answers = this.headerPicker("scrollable", answersOverlay)
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

        const button = this.buttonPicker("left/right")
        button.left.innerHTML = `Option: ${i + 1}`

        // const right = document.createElement("div")
        // right.style.width = "34%"
        // right.style.overflowX = "auto"
        // right.innerHTML = element.value



        button.right.innerHTML = element.value
        // button.right.append(right)

        // on click
        // change id and value and image
        // delete
        // change answers if exist
        output.append(button)
      }




      if (parent !== undefined) parent.append(output)
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
        parent.innerHTML = ""
      }


      if (input !== undefined) {

        if (input.type !== "select") {

          const requiredField = new CheckboxField("required", parent)
          requiredField.label.innerHTML = "Dieses Datenfeld ist notwendig"
          requiredField.verifyValue()
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
            const button = this.buttonPicker("left/right", parent)
            button.left.innerHTML = ".options"
            button.right.innerHTML = "Antwortmöglichkeiten definieren"
            button.addEventListener("click", () => {

              const fieldInput = input.field.querySelector(".field-input")

              this.popup(overlay => {
                this.headerPicker("removeOverlay", overlay)
                this.buttonPicker("toolbox/register-html", overlay)

                const info = this.headerPicker("info", overlay)
                info.append(this.convert("input/alias", input.field))
                info.append(this.convert("text/span", ".options"))

                {
                  const button = this.buttonPicker("left/right", overlay)
                  button.left.innerHTML = ".append"
                  button.right.innerHTML = "Neue Antwortmöglichkeit anhängen"
                  button.addEventListener("click", () => {


                    this.popup(overlay => {
                      this.headerPicker("removeOverlay", overlay)

                      const info = this.headerPicker("info", overlay)
                      info.append(this.convert("input/alias", fieldInput))
                      info.append(this.convert("text/span", ".option.append"))

                      fieldInput.ok = () => {
                        this.render("select/options", fieldInput)
                        this.removeOverlay(overlay)
                      }

                      this.get("funnel/select-option", overlay, fieldInput)

                    })
                  })
                }

                overlay.append(this.convert("text/hr", "Meine Optionen"))

                const options = this.headerPicker("scrollable", overlay)
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

        const button = this.buttonPicker("left/right")
        button.left.innerHTML = `Frage: ${i + 1}`
        button.right.innerHTML = element.id

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

  }

  static verifyIs(event, input) {

    if (event === "text/empty") {
      return typeof input !== "string" ||
        input === undefined ||
        input === null ||
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

    if (event === "text/tree") {
      if (typeof input !== "string") return false

      if (/^(?!.*[-.]{2,})(?!.*^-)(?!.*\.$)(?!.*\.\.$)[a-z]+([-.][a-z]+)*$/.test(input)) {
        return true
      } else {
        return false
      }

    }

    if (event === "field-funnel/valid") {
      return new Promise(async(resolve, reject) => {
        try {

          const promises = []
          input.querySelectorAll(".field").forEach(async field => {
            const input = field.querySelector(".field-input")
            const promise = this.verifyIs("input/valid", input)

            promises.push(promise)
          })

          const results = await Promise.all(promises)

          if (results.every((element) => element === true)) {
            return resolve(true)
          } else {
            return resolve(false)
          }
        } catch (error) {
          return reject(error)
        }
      })
    }

    // is user/admin then callback
    // async promise verify/admin/closed

    if (event === "user/closed") {
      if (window.localStorage.getItem("localStorageId") !== null) {
        if (window.localStorage.getItem("email") !== null) {
          return true
        }
      }
      return false
    }

    if (event === "text/+int") {

    }

    if (event === "text/path") {
      if (typeof input !== "string") return false
      if (/^\/[\w\-._~!$&'()*+,;=:@/]+\/$/.test(input) === true) return true
      return false
    }

    if (event === "input/valid") {

      return new Promise((resolve) => {

        if (this.verifyIs("input/required", input)) {
          if (this.verifyIs("input/accepted", input)) {
            this.setValidStyle(input)
            return resolve(true)
          }
          this.setNotValidStyle(input)
          const field = input.parentElement
          field.scrollIntoView({behavior: "smooth"})
          return resolve(false)
        }
        this.setValidStyle(input)
        return resolve(true)

      })

    }

    if (event === "input/accepted") {

      if (input.getAttribute("accept") === "text/js") {

        try {
          return this.verifyIs("text/js", input.value)
        } catch (error) {
          return false
        }
      }

      if (input.getAttribute("accept") === "text/trees") {

        if (!input.value.startsWith("[")) return false
        if (!input.value.endsWith("]")) return false
        try {
          const array = JSON.parse(input.value)
          for (let i = 0; i < array.length; i++) {
            const text = array[i]

            if (!this.verifyIs("text/tree", text)) return false

          }
          return true
        } catch (error) {
          return false
        }


      }

      if (input.getAttribute("accept") === "text/tree") {
        input.value = input.value.replace(/ /g, ".")

        if (this.verifyIs("text/tree", input.value) === true) return true

        return false

      }

      if (input.getAttribute("accept") === "text/operator") {
        if (input.value === "=") return true
        if (input.value === ">=") return true
        if (input.value === "<=") return true
        if (input.value === "!=") return true
        if (input.value === "<") return true
        if (input.value === ">") return true
        return false
      }

      if (input.getAttribute("accept") === "text/email") {
        if (typeof input.value !== "string") return false
        if (/^(.+)@(.+)$/.test(input.value) === true) return true
        return false
      }

      if (input.getAttribute("accept") === "text/number") {
        const value = input.value
        if (typeof value !== "string") return false
        if (value === "") return false
        if (value.startsWith(".")) return false

        const number = Number(input.value)
        if (typeof number === "number") return true
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

      if (input.getAttribute("accept") === "text/phone") {
        if (typeof input.value !== "string") return false
        if (/^\+[0-9]+$/.test(input.value) === true) return true
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
        if (typeof input.value !== "string") return false
        if (/^\/[\w\-._~!$&'()*+,;=:@/]+\/$/.test(input.value) === true) return true
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

            if (Helper.emailIsEmpty(email)) return false

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

            if (Helper.stringIsEmpty(string)) return false

          }
          return true
        } catch (error) {
          return false
        }


      }

      if (input.getAttribute("accept") === "text/script") {
        const script = this.convert("text/dom", input.value)
        if (script === undefined) return false
        if (script.tagName === "SCRIPT") return true
        return false
      }

      if (input.getAttribute("accept") === "text/field-funnel") {
        const funnel = this.convert("text/dom", input.value)
        if (funnel === undefined) return false
        if (funnel.tagName === "DIV") {
          if (funnel.classList.contains("field-funnel")) return true
        }
        return false
      }

      if (input.getAttribute("required") === "true") {

        if (input.getAttribute("type") === "checkbox") {

          if (input.checked === true) {
            input.setAttribute("checked", "true")
          } else {
            input.removeAttribute("checked")
          }

          if (input.getAttribute("checked") === "true") {
            return true
          } else {
            return false
          }
        }
        if (!this.stringIsEmpty(input.value)) return true
        return false
      }

      return false
    }

    if (event === "input/required") {
      if (input.getAttribute("required") === "true") return true
      if (!this.stringIsEmpty(input.getAttribute("accept"))) return true
      if (input.required === true) return true
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

    if (event === "text/id") {
      if (this.verifyIs("text/tag", input)) {
        if (document.querySelectorAll(`#${input}`).length === 0) {
          return true
        } else {
          return false
        }
      }
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

  static hexToRgba(hex, alpha) {
    hex = hex.replace('#', '')

    var r = parseInt(hex.substring(0, 2), 16)
    var g = parseInt(hex.substring(2, 4), 16)
    var b = parseInt(hex.substring(4, 6), 16)

    if (alpha < 0 || alpha > 1) {
      throw new Error('The alpha value must be between 0 and 1.');
    }

    var rgba = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';

    return rgba
  }

  static headerPicker(name, parent) {


    if (name === "navigation-open") {

      const header = this.iconPicker("getyour")
      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.right = "0"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = this.colors.dark.boxShadow
        header.style.border = this.colors.dark.border
        header.style.backgroundColor = this.colors.dark.foreground
      } else {
        header.style.boxShadow = this.colors.light.boxShadow
        header.style.border = this.colors.light.border
        header.style.backgroundColor = this.colors.light.foreground
      }

      header.style.width = "34px"
      header.style.height = "34px"
      header.style.borderRadius = "50%"
      header.style.margin = "34px"
      header.style.padding = "21px"
      header.style.zIndex = "1"
      header.style.cursor = "pointer"
      header.addEventListener("click", () => {
        this.popup(overlay => {
          this.headerPicker("removeOverlay", overlay)
          const info = this.headerPicker("info", overlay)
          info.innerHTML = "open"
          const content = this.headerPicker("loading", overlay)
          this.convert("parent/navigation-open", content)
        })
      })

      if (parent !== undefined) parent.append(header)

      return header
    }


    if (name === "save") {

      const icon = this.iconPicker("save")
      icon.style.width = "34px"
      const header = document.createElement("div")
      header.append(icon)
      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.right = "0"

      header.style.boxShadow = this.colors.light.boxShadow
      header.style.border = this.colors.light.border
      header.style.backgroundColor = this.colors.light.foreground
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = this.colors.dark.boxShadow
        header.style.border = this.colors.dark.border
        header.style.backgroundColor = this.colors.dark.foreground
      }

      header.style.borderRadius = "50%"
      header.style.margin = "34px"
      header.style.padding = "21px"
      header.style.zIndex = "1"
      header.style.cursor = "pointer"

      if (parent !== undefined) parent.append(header)

      return header
    }

    if (name === "app") {

      const icon = this.iconPicker("getyour")
      icon.style.width = "34px"
      const header = document.createElement("div")
      header.append(icon)
      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.right = "0"

      header.style.boxShadow = this.colors.light.boxShadow
      header.style.border = this.colors.light.border
      header.style.backgroundColor = this.colors.light.foreground
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = this.colors.dark.boxShadow
        header.style.border = this.colors.dark.border
        header.style.backgroundColor = this.colors.dark.foreground
      }

      header.style.borderRadius = "50%"
      header.style.margin = "34px"
      header.style.padding = "21px"
      header.style.zIndex = "1"
      header.style.cursor = "pointer"

      if (parent !== undefined) parent.append(header)

      return header
    }

    if (name === "back") {

      const icon = this.iconPicker("back")
      icon.style.width = "34px"
      const header = document.createElement("div")
      header.append(icon)

      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.left = "0"

      header.style.boxShadow = this.colors.light.boxShadow
      header.style.border = this.colors.light.border
      header.style.backgroundColor = this.colors.light.foreground
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = this.colors.dark.boxShadow
        header.style.border = this.colors.dark.border
        header.style.backgroundColor = this.colors.dark.foreground
      }

      header.style.borderRadius = "50%"
      header.style.margin = "34px"
      header.style.padding = "21px"
      header.style.zIndex = "1"
      header.style.cursor = "pointer"


      header.addEventListener("click", () => window.history.back())

      if (parent !== undefined) parent.append(header)

      return header
    }

    if (name === "scrollable") {
      const header = document.createElement("div")
      if (parent !== undefined) parent.append(header)
      header.style.overflowY = "auto"
      header.style.overscrollBehavior = "none"
      header.style.paddingBottom = "144px"
      return header
    }

    if (name === "info") {

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

      if (parent !== undefined) parent.append(header)
      return header
    }

    if (name === "getyour") {

      const header = this.iconPicker("getyour")
      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.left = "0"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = this.colors.dark.boxShadow
        header.style.border = this.colors.dark.border
        header.style.backgroundColor = this.colors.dark.foreground
      } else {
        header.style.boxShadow = this.colors.light.boxShadow
        header.style.border = this.colors.light.border
        header.style.backgroundColor = this.colors.light.foreground
      }

      header.style.width = "34px"
      header.style.height = "34px"
      header.style.borderRadius = "50%"
      header.style.margin = "34px"
      header.style.padding = "21px"
      header.style.zIndex = "1"
      header.style.cursor = "pointer"

      header.info = this.headerPicker("info", parent)

      if (parent !== undefined) parent.append(header)

      return header
    }

    if (name === "loading") {

      const header = document.createElement("div")
      header.style.display = "flex"
      header.style.flexDirection = "column"
      header.style.justifyContent = "center"
      header.style.alignItems = "center"
      header.style.height = "100%"
      // header.style.zIndex = "1"
      parent.append(header)

      header.loading = this.iconPicker("loading")
      header.loading.style.fill = this.colors.light.error
      header.loading.style.width = "55px"
      header.loading.style.margin = "8px"
      header.append(header.loading)

      header.info = document.createElement("div")
      header.info.innerHTML = "Das kann einen Moment dauern .."
      header.info.style.color = this.colors.light.error
      header.info.style.fontSize = "13px"
      header.info.style.fontFamily = "sans-serif"
      header.append(header.info)

      return header
    }

    // deprecated - use info instead
    if (name === "elementInfo") {

      // const header = this.iconPicker("getyour")
      const header = document.createElement("div")
      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.right = "0"
      header.style.maxWidth = "55vw"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = "0 3px 5px rgba(255, 255, 255, 0.13)"
        header.style.border = `0.3px solid ${this.colors.matte.dark.accent}`
        header.style.backgroundColor = this.colors.matte.dark.background
        header.style.color = this.colors.matte.dark.text
      } else {
        header.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"
        header.style.border = `0.3px solid ${this.colors.matte.light.accent}`
        header.style.backgroundColor = this.colors.matte.light.background
        header.style.color = this.colors.matte.light.text
      }

      header.style.zIndex = "1"
      parent.append(header)

      return header
    }

    if (name === "removeOverlay") {

      const icon = this.iconPicker("back")
      icon.style.width = "34px"
      const header = document.createElement("div")
      header.append(icon)
      header.style.position = "fixed"
      header.style.bottom = "0"
      header.style.left = "0"

      header.style.boxShadow = this.colors.light.boxShadow
      header.style.border = this.colors.light.border
      header.style.backgroundColor = this.colors.light.foreground
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        header.style.boxShadow = this.colors.dark.boxShadow
        header.style.border = this.colors.dark.border
        header.style.backgroundColor = this.colors.dark.foreground
      }

      header.style.borderRadius = "50%"
      header.style.margin = "34px"
      header.style.padding = "21px"
      header.style.zIndex = "1"
      header.style.cursor = "pointer"
      header.addEventListener("click", () => this.removeOverlay(parent))
      parent.append(header)

      return header
    }
  }

  static buttonPicker(name, parent) {


    if (name === "delete") {
      const button = document.createElement("div")

      button.style.backgroundColor = this.colors.dark.error
      button.style.color = this.colors.light.text
      button.style.cursor = "pointer"
      button.style.fontSize = "21px"
      button.style.fontFamily = "sans-serif"
      button.style.borderRadius = "13px"
      button.style.margin = "21px 34px"
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.height = "89px"

      if (parent !== undefined) parent.append(button)
      return button
    }

    if (name === "toolbox/register-html") {

      const save = this.headerPicker("save", parent)

      save.addEventListener("click", async () => {

        this.overlay("security", async securityOverlay => {

          // prepare html
          document.getElementById("toolbox").remove()
          document.querySelectorAll("[data-id]").forEach(element => element.remove())
          document.querySelectorAll(".overlay").forEach(element => element.remove())

          document.body.style.overscrollBehavior = null
          document.body.style.overflow = null

          // save html state
          const register = {}
          register.url = "/register/platform-value/closed/"
          register.type = "html"
          register.html = document.documentElement.outerHTML.replace(/<html>/, "<!DOCTYPE html><html>")
          const res = await Request.closed(register)

          if (res.status === 200) {
            window.alert("Dokument erfolgreich gespeichert.")
            window.location.reload()
          } else {
            // if error recreate state ??
            window.alert("Fehler.. Bitte wiederholen.")
            await this.request("toolbox/append", document.body)
            this.removeOverlay(securityOverlay)
          }

        })


      })

    }

    if (name === "icon-top/text-bottom") {

      const button = document.createElement("div")
      button.style.display = "flex"
      button.style.flexDirection = "column"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      // button.style.position = "absolute"
      button.style.cursor = "pointer"
      button.style.borderRadius = "50%"
      button.style.width = "144px"
      button.style.height = "144px"

      button.style.background = this.colors.light.foreground
      button.style.border = this.colors.light.border
      button.style.boxShadow = this.colors.light.boxShadow
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   button.style.background = this.colors.dark.foreground
      //   button.style.border = this.colors.dark.border
      //   button.style.boxShadow = this.colors.dark.boxShadow
      // } else {
      // }

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
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   button.text.style.color = this.colors.dark.text
      // } else {
      // }
      button.append(button.text)

      if (parent !== undefined) parent.append(button)

      return button
    }

    if (name === "action") {
      const button = document.createElement("div")

      button.style.backgroundColor = this.colors.matte.sunflower
      button.style.color = this.colors.matte.black
      button.style.boxShadow = this.colors.light.boxShadow
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   button.style.backgroundColor = this.colors.matte.orange
      //   button.style.color = this.colors.matte.black
      //   button.style.boxShadow = this.colors.dark.boxShadow
      // } else {
      // }

      button.style.cursor = "pointer"
      button.style.fontSize = "21px"
      button.style.fontFamily = "sans-serif"
      button.style.borderRadius = "13px"
      button.style.margin = "21px 34px"
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.height = "89px"

      if (parent !== undefined) parent.append(button)
      return button
    }

    if (name === "left/right") {

      const button = document.createElement("div")
      button.style.display = "flex"
      button.style.flexWrap = "wrap"
      button.style.justifyContent = "space-between"
      button.style.alignItems = "center"
      button.style.margin = "21px 34px"
      button.style.borderRadius = "13px"
      button.style.cursor = "pointer"

      button.left = document.createElement("div")
      // button.left.style.display = "flex"
      // button.left.style.justifyContent = "center"
      // button.left.style.alignItems = "center"
      button.left.style.margin = "21px 34px"
      button.left.style.fontSize = "21px"
      button.left.style.fontFamily = "sans-serif"
      button.left.style.overflow = "auto"
      button.append(button.left)

      button.right = document.createElement("div")
      button.right.style.margin = "21px 34px"
      button.right.style.fontSize = "13px"
      button.right.style.fontFamily = "sans-serif"
      button.append(button.right)

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.style.backgroundColor = this.colors.matte.black
        button.style.border = this.colors.dark.border
        // console.log(this.colors.dark.boxShadow);
        button.style.boxShadow = this.colors.dark.boxShadow
        button.style.color = this.colors.dark.text
      } else {
        button.style.backgroundColor = this.colors.gray[0]
        button.style.border = this.colors.light.border
        button.style.color = this.colors.light.text
        button.style.boxShadow = this.colors.light.boxShadow
      }

      if (parent !== undefined) parent.append(button)

      return button
    }

    if (name === undefined) {
      const button = document.createElement("div")

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        button.style.backgroundColor = this.colors.matte.orange
        button.style.color = this.colors.matte.light.text
        button.style.boxShadow = "0 3px 6px rgba(255, 255, 255, 0.16)"
      } else {
        button.style.backgroundColor = this.colors.matte.sunflower
        button.style.color = this.colors.matte.light.text
        button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"

      }

      button.style.cursor = "pointer"
      button.style.fontSize = "21px"
      button.style.fontFamily = "sans-serif"
      button.style.borderRadius = "13px"
      button.style.margin = "21px 34px"
      button.style.display = "flex"
      button.style.justifyContent = "center"
      button.style.alignItems = "center"
      button.style.height = "89px"

      return button
    }
  }

  static iconPicker(name) {


    if (name === "info") {

      let primary = this.colors.light.text
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   primary = this.colors.dark.text
      // }
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58.693 58.693"><defs><style>.a{fill:${primary};}</style></defs><g transform="translate(24.832 14.673)"><circle class="a" cx="2.822" cy="2.822" r="2.822" transform="translate(1.058)"/><path class="a" d="M230.772,234.059V216H224v1.129h2.257v16.931H224v1.129h9.03v-1.129Z" transform="translate(-224 -206.97)"/></g><path class="a" d="M77.347,48a29.347,29.347,0,1,0,29.347,29.347A29.342,29.342,0,0,0,77.347,48Zm0,56.253a26.906,26.906,0,1,1,26.906-26.906A26.937,26.937,0,0,1,77.347,104.253Z" transform="translate(-48 -48)"/></svg>`
      const svg = this.convert("text/svg", svgString)

      return svg
    }

    if (name === "save") {

      let primary
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        primary = this.colors.dark.text
      } else {
        primary = this.colors.light.text
      }

      const svgString = `<svg viewBox="-13 -13 85 85" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g stroke="${primary}" stroke-width="2"><path d="M62,55 C62,56.1 61.1,57 60,57 L2,57 C0.9,57 0,56.1 0,55 L0,2 C0,0.9 0.9,0 2,0 L55,0 C56.1,0 62,8.7 62,9.8 L62,55 L62,55 Z"></path><path d="M11,56 L11,38 C11,36.9 11.9,36 13,36 L49,36 C50.1,36 51,36.9 51,38 L51,56.1"></path><path d="M48,19 C48,20.1 47.1,21 46,21 L16,21 C14.9,21 14,20.1 14,19 L14,2 C14,0.9 14.9,0 16,0 L46,0 C47.1,0 48,0.9 48,2 L48,19 L48,19 Z"></path><rect x="18" y="5" width="6" height="11.2"></rect><path d="M17,41.1 L45,41.1"></path><path d="M17,46 L45,46"></path><path d="M17,51.1 L45,51.1"></path><rect x="4" y="50" width="3" height="2.9"></rect></g></g></svg>`
      const svg = this.convert("text/svg", svgString)

      return svg
    }

    if (name === "success") {

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path class="checkmark" fill="none" stroke="#4bb71b" stroke-width="5" d="M25 50 l20 20 l40 -40"><animate attributeName="stroke-dasharray" attributeType="XML" from="0,100" to="100,0" dur="0.5s" fill="freeze" /></path></svg>`
      const svg = this.convert("text/svg", svgString)

      return svg
    }


    if (name === "touch") {

      let primary
      primary = this.colors.light.text
      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   primary = this.colors.dark.text
      // } else {
      // }

      const svgString = `<svg fill="${primary}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 512.001 512.001" xml:space="preserve"><g><g><path d="M401.809,212.523c-12.295-1.17-24.556,2.892-33.639,11.15c-1.122,1.021-2.186,2.096-3.188,3.217 c-6.805-12.704-19.329-21.819-33.946-23.214c-12.295-1.17-24.556,2.892-33.639,11.15c-1.122,1.021-2.186,2.096-3.188,3.217 c-5.941-11.089-16.24-19.443-28.485-22.315c21.223-21.098,33.958-50.2,33.958-81.275C299.681,51.344,248.337,0,185.227,0 S70.774,51.344,70.774,114.454c0,46.302,28.254,88.244,70.773,105.817v49.155l-31.869,22.764 c-18.882,13.488-26.638,37.341-19.3,59.353l31.431,94.297c13.193,39.573,50.082,66.162,91.796,66.162h130.862 c53.354,0,96.76-43.406,96.76-96.76V257.522C441.227,234.396,423.913,214.632,401.809,212.523z M87.361,114.454 c0-53.963,43.903-97.866,97.866-97.866c53.963,0,97.866,43.903,97.866,97.866c0,37.248-21.382,71.191-54.186,87.594v-21.686 c21.942-14.579,35.387-39.4,35.387-65.908c0-43.597-35.47-79.067-79.067-79.067c-43.597,0-79.067,35.47-79.067,79.067 c0,26.506,13.446,51.328,35.387,65.908v21.686C108.745,185.645,87.361,151.701,87.361,114.454z M189.489,70.978 c-12.296-1.172-24.556,2.89-33.638,11.149c-9.09,8.265-14.304,20.048-14.304,32.327v44.644 c-11.839-11.626-18.799-27.699-18.799-44.644c0-34.451,28.028-62.479,62.479-62.479c34.451,0,62.479,28.028,62.479,62.479 c0,16.947-6.96,33.019-18.799,44.645v-43.123C228.908,92.85,211.594,73.084,189.489,70.978z M344.467,495.413H213.604 c-34.564,0-65.129-22.03-76.059-54.819l-31.431-94.296c-5.022-15.061,0.285-31.381,13.205-40.609l22.228-15.878v72.352 c0,4.58,3.712,8.294,8.294,8.294c4.581,0,8.294-3.713,8.294-8.294V114.454c0-7.617,3.235-14.927,8.874-20.053 c5.716-5.197,13.146-7.652,20.906-6.91c13.686,1.304,24.406,13.816,24.406,28.484v175.413c0,4.58,3.712,8.294,8.294,8.294 c4.581,0,8.294-3.713,8.294-8.294v-53.08c0-7.617,3.235-14.927,8.874-20.053c5.715-5.196,13.137-7.657,20.906-6.91 c13.685,1.305,24.405,13.817,24.405,28.485v7.325v53.08c0,4.58,3.712,8.294,8.294,8.294s8.294-3.713,8.294-8.294v-53.08 c0-7.617,3.235-14.927,8.874-20.053c5.715-5.196,13.137-7.657,20.906-6.91c13.685,1.305,24.405,13.817,24.405,28.485V256v53.08 c0,4.58,3.712,8.294,8.294,8.294s8.294-3.713,8.294-8.294V256c0-7.617,3.234-14.927,8.874-20.053 c5.715-5.196,13.137-7.657,20.906-6.91c13.685,1.305,24.405,13.817,24.405,28.485V415.24h0.003 C424.64,459.448,388.675,495.413,344.467,495.413z"/></g></g></svg>`
      const svg = this.convert("text/svg", svgString)

      return svg
    }


    if (name === "back") {

      let primary
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        primary = this.colors.dark.text
      } else {
        primary = this.colors.light.text
      }

      const svgString = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 17L7 14L10 11" stroke="${primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 14L13.5 14C15.433 14 17 12.433 17 10.5V10.5C17 8.567 15.433 7 13.5 7L12 7" stroke="${primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      const svg = this.convert("text/svg", svgString)

      // console.log(svg);
      return svg
    }


    if (name === "arrow-down") {

      let primary
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        primary = this.colors.dark.text
      } else {
        primary = this.colors.light.text
      }

      const svgString = `<svg fill="${primary}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.71,17.29a1,1,0,0,0-1.42,0L13,18.59V3a1,1,0,0,0-2,0V18.59l-1.29-1.3a1,1,0,0,0-1.42,1.42l3,3a1,1,0,0,0,1.42,0l3-3A1,1,0,0,0,15.71,17.29Z"></path></svg>`
      const svg = this.convert("text/svg", svgString)
      svg.style.width = "34px"

      return svg
    }


    if (name === "expert") {

      let primary
      // let secondary
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        primary = this.colors.dark.text
        // secondary = this.colors.dark.background
      } else {
        primary = this.colors.light.text
        // secondary = this.colors.light.background
      }

      const svgString = `<svg fill="${primary}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M319.4 320.6L224 416l-95.4-95.4C57.1 323.7 0 382.2 0 454.4v9.6c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-9.6c0-72.2-57.1-130.7-128.6-133.8zM13.6 79.8l6.4 1.5v58.4c-7 4.2-12 11.5-12 20.3 0 8.4 4.6 15.4 11.1 19.7L3.5 242c-1.7 6.9 2.1 14 7.6 14h41.8c5.5 0 9.3-7.1 7.6-14l-15.6-62.3C51.4 175.4 56 168.4 56 160c0-8.8-5-16.1-12-20.3V87.1l66 15.9c-8.6 17.2-14 36.4-14 57 0 70.7 57.3 128 128 128s128-57.3 128-128c0-20.6-5.3-39.8-14-57l96.3-23.2c18.2-4.4 18.2-27.1 0-31.5l-190.4-46c-13-3.1-26.7-3.1-39.7 0L13.6 48.2c-18.1 4.4-18.1 27.2 0 31.6z"/></svg>
      `
      const svg = this.convert("text/svg", svgString)

      return svg
    }


    if (name === "meteor") {

      let primary
      // let secondary
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        primary = this.colors.dark.text
        // secondary = this.colors.dark.background
      } else {
        primary = this.colors.light.text
        // secondary = this.colors.light.background
      }

      const svgString = `<svg fill="${primary}" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><path d="M0 .234l21.912 20.537s.412.575-.124 1.151c-.535.576-1.236.083-1.236.083L0 .234zm6.508 2.058l17.01 15.638s.413.576-.123 1.152c-.534.576-1.235.083-1.235.083L6.508 2.292zM1.936 6.696l17.01 15.638s.412.576-.123 1.152-1.235.082-1.235.082L1.936 6.696zm10.073-2.635l11.886 10.927s.287.401-.087.805-.863.058-.863.058L12.009 4.061zm-8.567 7.737l11.886 10.926s.285.4-.088.803c-.375.403-.863.059-.863.059L3.442 11.798zm14.187-5.185l5.426 4.955s.142.188-.044.377c-.185.188-.428.027-.428.027l-4.954-5.358v-.001zM6.178 17.231l5.425 4.956s.144.188-.042.377-.427.026-.427.026l-4.956-5.359z"/></svg>`
      const svg = this.convert("text/svg", svgString)

      return svg
    }

    if (name === "delete") {

      const color = this.colors.light.error

      const svgString = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 11V17" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 11V17" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 7H20" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      `
      const svg = this.convert("text/svg", svgString)
      svg.style.width = "34px"

      return svg
    }

    if (name === "verify-document") {

      let primary
      let secondary
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        primary = this.colors.dark.text
        secondary = this.colors.dark.background
      } else {
        primary = this.colors.light.text
        secondary = this.colors.light.background
      }

      const svgString = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000 svg"><path stroke="${primary}" stroke-width="0.8" d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V8C21 8.55228 20.5523 9 20 9C19.4477 9 19 8.55228 19 8V4C19 3.44772 18.5523 3 18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H10C10.5523 21 11 21.4477 11 22C11 22.5523 10.5523 23 10 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM6.41421 7H9V4.41421L6.41421 7ZM20.1716 18.7574C20.6951 17.967 21 17.0191 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21C17.0191 21 17.967 20.6951 18.7574 20.1716L21.2929 22.7071C21.6834 23.0976 22.3166 23.0976 22.7071 22.7071C23.0976 22.3166 23.0976 21.6834 22.7071 21.2929L20.1716 18.7574ZM13 16C13 14.3431 14.3431 13 16 13C17.6569 13 19 14.3431 19 16C19 17.6569 17.6569 19 16 19C14.3431 19 13 17.6569 13 16Z" /></svg>`
      const svg = this.convert("text/svg", svgString)

      // if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      //   svg.style.fill = this.colors.dark.text
      // } else {
      //   svg.style.fill = this.colors.light.text
      // }

      return svg
    }

    if (name === "branch") {

      let primary
      let secondary
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        primary = this.colors.dark.text
        secondary = this.colors.dark.background
      } else {
        primary = this.colors.light.text
        secondary = this.colors.light.background
      }

      const svgString = `<svg viewBox="-34 -34 324 324" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid"><g><path d="M256,127.996353 C256,57.4003134 198.577803,0 128.003647,0 C57.4294914,0 0,57.4003134 0,127.996353 C0,194.689842 51.2729449,249.624619 116.471064,255.467502 L116.784727,255.467502 C117.854585,255.559899 118.926875,255.640139 120.001596,255.708221 L120.621627,255.744693 C121.594225,255.803049 122.581412,255.846816 123.583188,255.875994 L124.363699,255.875994 C125.574583,255.875994 126.785468,255.93435 128.010942,255.93435 C129.236415,255.93435 130.323294,255.93435 131.475823,255.883288 L131.964553,255.883288 C132.980918,255.85411 133.992421,255.812775 134.99906,255.759282 L135.203305,255.759282 C137.474322,255.632844 139.73075,255.445619 141.972589,255.197606 C205.996296,248.253255 256,193.85827 256,127.996353 Z M141.53492,243.015814 L140.302151,207.615672 L171.216185,188.650007 C178.4504,193.608514 187.855834,194.085862 195.554896,189.885253 C203.253958,185.684645 207.942904,177.517404 207.688617,168.750648 C207.193118,156.472981 197.353376,146.633239 185.075709,146.13774 C178.119701,145.88819 171.420101,148.779386 166.829786,154.011722 C162.239472,159.244058 160.244939,166.262996 161.397806,173.12734 L139.579997,186.62214 L137.997094,142.016356 L168.422396,123.408121 C179.110867,131.390126 193.992344,130.524153 203.68284,121.356269 C213.373337,112.188385 215.062153,97.3777083 207.684352,86.2635789 C200.306552,75.1494495 186.002044,70.9554883 173.790989,76.3263301 C161.579934,81.697172 155.004112,95.07502 158.210115,108.024049 L137.267645,121.022824 L136.027582,85.4257302 C145.991772,81.5729091 152.39542,71.8016983 151.951446,61.127796 C151.432624,48.6816181 141.807146,38.5281996 129.406368,37.3461601 C117.00559,36.1641205 105.635233,44.3162205 102.774385,56.4402488 C99.9135357,68.5642772 106.440171,80.9394444 118.061262,85.4257302 L115.799972,159.180282 L93.0047015,144.65696 C94.5255562,138.441989 93.7995011,131.889406 90.9549508,126.158142 C86.3958969,116.67531 77.204844,109.949793 66.722667,109.29329 C53.7591278,108.447172 41.8248137,116.35697 37.5536249,128.625883 C33.2824362,140.894795 37.7246962,154.505787 48.4110961,161.892946 C59.0974959,169.280106 73.4001543,168.626864 83.368685,160.296339 L115.143468,180.399943 L113.232312,242.877219 C56.3353184,235.619205 12.1453198,186.870152 12.1453198,127.996353 C12.1890868,64.1404189 64.1404189,12.1744978 128.003647,12.1744978 C191.866876,12.1744978 243.818208,64.1258299 243.818208,127.989058 C243.818208,187.278644 199.037356,236.290298 141.53492,243.015814 Z" fill="${primary}"></path><path d="M127.272727,47.1636364 C135.595849,47.1716548 142.341072,53.9168779 142.349091,62.24 C142.349091,70.5664457 135.599173,77.3163636 127.272727,77.3163636 C118.946282,77.3163636 112.196364,70.5664457 112.196364,62.24 C112.196364,53.9135543 118.946282,47.1636364 127.272727,47.1636364 Z M184.109091,155.803636 C191.659397,155.799577 197.79013,161.90429 197.818182,169.454545 C197.832886,174.991829 194.509789,179.992463 189.39907,182.123723 C184.288351,184.254983 178.396979,183.096944 174.473197,179.189814 C170.549415,175.282685 169.36633,169.396292 171.475835,164.276555 C173.585339,159.156817 178.571795,155.812483 184.109091,155.803636 Z M192.545455,116.094545 C184.547774,119.980784 174.913587,116.658762 171.010909,108.669091 C168.156345,102.811763 169.111458,95.8116099 173.430838,90.9331076 C177.750219,86.0546052 184.583136,84.2586055 190.743106,86.382661 C196.903075,88.5067166 201.17685,94.1324811 201.571384,100.636416 C201.965919,107.140352 198.403506,113.241466 192.545455,116.094545 Z M64.3599983,120.574545 C73.9523707,120.582566 81.7265234,128.356719 81.7345438,137.949091 C81.7305271,147.538876 73.9546338,155.310428 64.3648478,155.309089 C54.7750618,155.30775 47.0013389,147.534027 47,137.944241 C46.9986611,128.354455 54.7702131,120.578562 64.3599983,120.574545 Z" fill="${secondary}"></path></g></svg>`
      const svg = this.convert("text/svg", svgString)

      return svg
    }

    if (name === "repeat-once") {
      const svgString = `<svg fill="#000000" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M24,128A72.08124,72.08124,0,0,1,96,56H204.68628L194.34277,45.65674a8.00018,8.00018,0,1,1,11.31446-11.31348l24,24c.02392.02393.04394.05078.06762.07471.15967.16406.31494.332.46021.50928.08423.10254.15771.21045.23608.31591.07715.10352.15747.20459.22949.312.082.12255.15333.24951.22779.375.05859.09863.12036.19433.17456.29541.06811.127.12573.25732.18652.38671.05029.10743.10425.2129.1499.32325.052.12549.094.25341.13941.38086.04248.11914.08838.23632.12524.35791.03882.12841.06763.25927.09986.38916.03076.123.06567.24511.09057.3706.03.15088.04859.30371.06958.45654.0149.106.0354.21.0459.31739a8.02276,8.02276,0,0,1,0,1.584c-.0105.10742-.031.21143-.0459.31739-.021.15283-.03955.30566-.06958.45654-.0249.12549-.05981.24756-.09057.3706-.03223.12989-.061.26075-.09986.38916-.03686.12159-.08276.23877-.12524.35791-.04541.12745-.0874.25537-.13941.38086-.04565.11035-.09961.21582-.1499.32325-.06079.12939-.11841.25976-.18652.38671-.0542.10108-.116.19678-.17456.29541-.07446.12549-.14575.25245-.22779.375-.072.10743-.15234.2085-.22949.312-.07837.10546-.15185.21337-.23608.31591-.14258.17383-.29517.33887-.45166.49952-.02661.02734-.04907.05761-.07617.08447l-24,24a8.00018,8.00018,0,0,1-11.31446-11.31348L204.68628,72H96a56.06322,56.06322,0,0,0-56,56,8,8,0,0,1-16,0Zm200-8a8.00039,8.00039,0,0,0-8,8,56.06322,56.06322,0,0,1-56,56H51.31372l10.34351-10.34326a8.00018,8.00018,0,0,0-11.31446-11.31348l-24,24c-.02392.02393-.04394.05078-.06762.07471-.15967.16406-.31494.332-.46021.50928-.08423.10254-.15771.21045-.23608.31591-.07715.10352-.15747.20459-.22949.312-.082.12255-.15333.24951-.22779.375-.05859.09863-.12036.19433-.17456.29541-.06811.12695-.12573.25732-.18652.38671-.05029.10743-.10425.2129-.1499.32325-.052.12549-.094.25341-.13941.38086-.04248.11914-.08838.23632-.12524.35791-.03882.12841-.06763.25927-.09986.38916-.03076.123-.06567.24511-.09057.3706-.03.15088-.04859.30371-.06958.45654-.0149.106-.0354.21-.0459.31739a8.02276,8.02276,0,0,0,0,1.584c.0105.10742.031.21143.0459.31739.021.15283.03955.30566.06958.45654.0249.12549.05981.24756.09057.3706.03223.12989.061.26075.09986.38916.03686.12159.08276.23877.12524.35791.04541.12745.0874.25537.13941.38086.04565.11035.09961.21582.1499.32325.06079.12939.11841.25976.18652.38671.0542.10108.116.19678.17456.29541.07446.12549.14575.25245.22779.375.072.10743.15234.2085.22949.312.07837.10546.15185.21337.23608.31591.14258.17383.29517.33887.45166.49952.02661.02734.04907.05761.07617.08447l24,24a8.00018,8.00018,0,1,0,11.31446-11.31348L51.31372,200H160a72.08124,72.08124,0,0,0,72-72A8.00039,8.00039,0,0,0,224,120Zm-92,40a8.00039,8.00039,0,0,0,8-8V104a7.99986,7.99986,0,0,0-11.5752-7.15674l-16,7.99268a8.00006,8.00006,0,0,0,7.1504,14.31347l4.4248-2.21V152A8.00039,8.00039,0,0,0,132,160Z"/></svg>`
      const svg = this.convert("text/svg", svgString)

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        svg.style.fill = this.colors.dark.text
      } else {
        svg.style.fill = this.colors.light.text
      }

      return svg
    }

    if (name === "repeat-always") {
      const svgString = `<svg fill="#000000" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M24,128A72.08124,72.08124,0,0,1,96,56H204.68628L194.34277,45.65674a8.00018,8.00018,0,1,1,11.31446-11.31348l24,24c.02392.02393.04394.05078.06762.07471.15967.16406.31494.332.46021.50928.08423.10254.15771.21045.23608.31591.07715.10352.15747.20459.22949.312.082.12255.15333.24951.22779.375.05859.09863.12036.19433.17456.29541.06811.127.12573.25732.18652.38671.05029.10743.10425.2129.1499.32325.052.12549.094.25341.13941.38086.04248.11914.08838.23632.12524.35791.03882.12841.06763.25927.09986.38916.03076.123.06567.24511.09057.3706.03.15088.04859.30371.06958.45654.0149.106.0354.21.0459.31739a8.02276,8.02276,0,0,1,0,1.584c-.0105.10742-.031.21143-.0459.31739-.021.15283-.03955.30566-.06958.45654-.0249.12549-.05981.24756-.09057.3706-.03223.12989-.061.26075-.09986.38916-.03686.12159-.08276.23877-.12524.35791-.04541.12745-.0874.25537-.13941.38086-.04565.11035-.09961.21582-.1499.32325-.06079.12939-.11841.25976-.18652.38671-.0542.10108-.116.19678-.17456.29541-.07446.12549-.14575.25245-.22779.375-.072.10743-.15234.2085-.22949.312-.07837.10546-.15185.21337-.23608.31591-.14258.17383-.29517.33887-.45166.49952-.02661.02734-.04907.05761-.07617.08447l-24,24a8.00018,8.00018,0,0,1-11.31446-11.31348L204.68628,72H96a56.06322,56.06322,0,0,0-56,56,8,8,0,0,1-16,0Zm200-8a8.00039,8.00039,0,0,0-8,8,56.06322,56.06322,0,0,1-56,56H51.31372l10.34351-10.34326a8.00018,8.00018,0,0,0-11.31446-11.31348l-24,24c-.02392.02393-.04394.05078-.06762.07471-.15967.16406-.31494.332-.46021.50928-.08423.10254-.15771.21045-.23608.31591-.07715.10352-.15747.20459-.22949.312-.082.12255-.15333.24951-.22779.375-.05859.09863-.12036.19433-.17456.29541-.06811.12695-.12573.25732-.18652.38671-.05029.10743-.10425.2129-.1499.32325-.052.12549-.094.25341-.13941.38086-.04248.11914-.08838.23632-.12524.35791-.03882.12841-.06763.25927-.09986.38916-.03076.123-.06567.24511-.09057.3706-.03.15088-.04859.30371-.06958.45654-.0149.106-.0354.21-.0459.31739a8.02276,8.02276,0,0,0,0,1.584c.0105.10742.031.21143.0459.31739.021.15283.03955.30566.06958.45654.0249.12549.05981.24756.09057.3706.03223.12989.061.26075.09986.38916.03686.12159.08276.23877.12524.35791.04541.12745.0874.25537.13941.38086.04565.11035.09961.21582.1499.32325.06079.12939.11841.25976.18652.38671.0542.10108.116.19678.17456.29541.07446.12549.14575.25245.22779.375.072.10743.15234.2085.22949.312.07837.10546.15185.21337.23608.31591.14258.17383.29517.33887.45166.49952.02661.02734.04907.05761.07617.08447l24,24a8.00018,8.00018,0,1,0,11.31446-11.31348L51.31372,200H160a72.08124,72.08124,0,0,0,72-72A8.00039,8.00039,0,0,0,224,120Z"/></svg>`
      const svg = this.convert("text/svg", svgString)

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        svg.style.fill = this.colors.dark.text
      } else {
        svg.style.fill = this.colors.light.text
      }

      return svg
    }

    if (name === "drop") {
      const svgString = `<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g><rect id="Rectangle" fill-rule="nonzero" x="0" y="0" width="24" height="24"></rect><line x1="12" y1="5" x2="12" y2="15" id="Path" stroke="#0C0310" stroke-width="2" stroke-linecap="round"></line><path d="M17,11 L12.7071,15.2929 C12.3166,15.6834 11.6834,15.6834 11.2929,15.2929 L7,11" id="Path" stroke="#0C0310" stroke-width="2" stroke-linecap="round"></path><line x1="19" y1="20" x2="5" y2="20" id="Path" stroke="#0C0310" stroke-width="2" stroke-linecap="round"></line></g></g></svg>`
      const svg = this.convert("text/svg", svgString)

      const paths = svg.querySelectorAll("#Path")
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        paths.forEach(path => {
          path.setAttribute("stroke", this.colors.matte.dark.text)
        })
      } else {
        paths.forEach(path => {
          path.setAttribute("stroke", this.colors.matte.light.text)
        })

      }

      return svg
    }

    if (name === "toolbox") {
      const svgString = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 9V18C4 19.1046 4.89543 20 6 20H9M4 9V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V9M4 9H9M20 9H9M20 9V14.5M9 9V14.5M9 20H18C19.1046 20 20 19.1046 20 18V14.5M9 20V14.5M9 14.5H20" stroke="#000" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      `
      const svg = this.convert("text/svg", svgString)
      const path = svg.children[0]

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        path.style.stroke = this.colors.matte.dark.text
      } else {
        path.style.stroke = this.colors.matte.light.text
      }

      return svg
    }

    if (name === "closed-eye") {
      const svgString = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7071 5.70711C20.0976 5.31658 20.0976 4.68342 19.7071 4.29289C19.3166 3.90237 18.6834 3.90237 18.2929 4.29289L14.032 8.55382C13.4365 8.20193 12.7418 8 12 8C9.79086 8 8 9.79086 8 12C8 12.7418 8.20193 13.4365 8.55382 14.032L4.29289 18.2929C3.90237 18.6834 3.90237 19.3166 4.29289 19.7071C4.68342 20.0976 5.31658 20.0976 5.70711 19.7071L9.96803 15.4462C10.5635 15.7981 11.2582 16 12 16C14.2091 16 16 14.2091 16 12C16 11.2582 15.7981 10.5635 15.4462 9.96803L19.7071 5.70711ZM12.518 10.0677C12.3528 10.0236 12.1792 10 12 10C10.8954 10 10 10.8954 10 12C10 12.1792 10.0236 12.3528 10.0677 12.518L12.518 10.0677ZM11.482 13.9323L13.9323 11.482C13.9764 11.6472 14 11.8208 14 12C14 13.1046 13.1046 14 12 14C11.8208 14 11.6472 13.9764 11.482 13.9323ZM15.7651 4.8207C14.6287 4.32049 13.3675 4 12 4C9.14754 4 6.75717 5.39462 4.99812 6.90595C3.23268 8.42276 2.00757 10.1376 1.46387 10.9698C1.05306 11.5985 1.05306 12.4015 1.46387 13.0302C1.92276 13.7326 2.86706 15.0637 4.21194 16.3739L5.62626 14.9596C4.4555 13.8229 3.61144 12.6531 3.18002 12C3.6904 11.2274 4.77832 9.73158 6.30147 8.42294C7.87402 7.07185 9.81574 6 12 6C12.7719 6 13.5135 6.13385 14.2193 6.36658L15.7651 4.8207ZM12 18C11.2282 18 10.4866 17.8661 9.78083 17.6334L8.23496 19.1793C9.37136 19.6795 10.6326 20 12 20C14.8525 20 17.2429 18.6054 19.002 17.0941C20.7674 15.5772 21.9925 13.8624 22.5362 13.0302C22.947 12.4015 22.947 11.5985 22.5362 10.9698C22.0773 10.2674 21.133 8.93627 19.7881 7.62611L18.3738 9.04043C19.5446 10.1771 20.3887 11.3469 20.8201 12C20.3097 12.7726 19.2218 14.2684 17.6986 15.5771C16.1261 16.9282 14.1843 18 12 18Z" fill="#000000"/>
      </svg>
      `
      const svg = this.convert("text/svg", svgString)
      const path = svg.children[0]

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        path.style.fill = this.colors.matte.dark.text
      } else {
        path.style.fill = this.colors.matte.light.text
      }

      return svg
    }

    if (name === "open-eye") {
      const svgString = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6.30147 15.5771C4.77832 14.2684 3.6904 12.7726 3.18002 12C3.6904 11.2274 4.77832 9.73158 6.30147 8.42294C7.87402 7.07185 9.81574 6 12 6C14.1843 6 16.1261 7.07185 17.6986 8.42294C19.2218 9.73158 20.3097 11.2274 20.8201 12C20.3097 12.7726 19.2218 14.2684 17.6986 15.5771C16.1261 16.9282 14.1843 18 12 18C9.81574 18 7.87402 16.9282 6.30147 15.5771ZM12 4C9.14754 4 6.75717 5.39462 4.99812 6.90595C3.23268 8.42276 2.00757 10.1376 1.46387 10.9698C1.05306 11.5985 1.05306 12.4015 1.46387 13.0302C2.00757 13.8624 3.23268 15.5772 4.99812 17.0941C6.75717 18.6054 9.14754 20 12 20C14.8525 20 17.2429 18.6054 19.002 17.0941C20.7674 15.5772 21.9925 13.8624 22.5362 13.0302C22.947 12.4015 22.947 11.5985 22.5362 10.9698C21.9925 10.1376 20.7674 8.42276 19.002 6.90595C17.2429 5.39462 14.8525 4 12 4ZM10 12C10 10.8954 10.8955 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8955 14 10 13.1046 10 12ZM12 8C9.7909 8 8.00004 9.79086 8.00004 12C8.00004 14.2091 9.7909 16 12 16C14.2092 16 16 14.2091 16 12C16 9.79086 14.2092 8 12 8Z" fill="#000"/>
      </svg>
      `
      const svg = this.convert("text/svg", svgString)
      const path = svg.children[0]

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        path.style.fill = this.colors.matte.dark.text
      } else {
        path.style.fill = this.colors.matte.light.text
      }

      return svg
    }

    if (name === "getyour") {
      const svgString = /*html*/`<svg xmlns="http://www.w3.org/2000/svg" width="61.111" height="62.623" viewBox="0 0 61.111 62.623"><defs><style>.a{fill:#1d1d1b;}.b{fill:#fff;}.c{fill:#eb6a6a;}.d{fill:#f72424;}.e{fill:#861b1b;}.f{fill:#d14f4f;}.g{fill:rgba(186,25,25,0.9);}.h{fill:#ba1919;}.i{fill:#be4242;}.j{fill:none;}</style></defs><g transform="translate(-119.309 -13.94)"><g transform="translate(119.309 13.94)"><path class="a" d="M37.148,3.768h0a.193.193,0,0,1,0,.044.228.228,0,0,0,0-.044Zm4.035-1.523a.3.3,0,0,0,0-.088A.254.254,0,0,0,41.183,2.244ZM20.233,54.489Zm0,0ZM7.351,51.556,7.3,51.521h0ZM3.268,48.65Zm11.819-9.79h0l.031.026ZM3.233,48.641l-.092-.035h0ZM33.649,3.816l.149.044h0a1.479,1.479,0,0,0,.338.04h.645a.9.9,0,0,0,.167.07A.847.847,0,0,1,35.133,4a2.125,2.125,0,0,0,.312.215l.127.083.347.215.11.079a.654.654,0,0,0,.522.123.663.663,0,0,0,.439-.307l.1-.171a.637.637,0,0,0,.092-.4.3.3,0,0,0,0-.083h0a.4.4,0,0,0,0-.075.948.948,0,0,0-.092-.119s-.035-.075-.048-.1a.465.465,0,0,0-.07-.092c0,.031.048.053.066.083a.8.8,0,0,0-.1-.132H37a.825.825,0,0,0,.255,0s.136-.031.272-.075a.878.878,0,0,0,.347-.2L37.934,3l.079-.061h2.494a.707.707,0,0,0,.536-.25.707.707,0,0,0,.14-.443h0a.685.685,0,0,0-.048-.255.294.294,0,0,0-.026-.066V1.888L41.065,1.8c-.057-.114-.105-.2-.11-.206a.65.65,0,0,0-.487-.334c-.566-.075-.707-.088-.76-.092a1.317,1.317,0,0,0-.382-.241A.623.623,0,0,0,39.058.87h-.171A1.317,1.317,0,0,0,38.5.931h-.119a1.756,1.756,0,0,0-.29.031.8.8,0,0,0-.5.347h-.5a2.485,2.485,0,0,0-.25,0h-.22a.878.878,0,0,0-.571.2.474.474,0,0,0-.1-.066.8.8,0,0,0-.852.083l-.184.136-.075.044a.948.948,0,0,0-.224.083H34.6a.909.909,0,0,0-.439.224.83.83,0,0,0-.11.136h0a.681.681,0,0,0-.158.035l-.206.066a.645.645,0,0,0-.316.233l-.092.2a.65.65,0,0,0-.132.4A.76.76,0,0,0,33.649,3.816Zm6.107-2.595.048.053-.057-.057ZM20.391,54.414Zm.114-.1h0l.083-.075h0Zm.079-.114Zm-.241.241ZM27.5,38.635h0l.04-.044h0a.2.2,0,0,1-.031.031Zm15.717,1.976h0a.027.027,0,0,1,0-.013Zm.1-.162Zm.228-.184h.035l.066-.026Zm-.351.439h0v-.044q0,.015,0,.031Zm-11.568,5.69Zm.11,1.005h0a.558.558,0,0,1,.11-.092.751.751,0,0,0-.1.092Zm17.012-23.01h0l.031.022ZM43.655,40.194h.013Zm10.168-4.627v.04h0ZM52.712,21.592a2.423,2.423,0,0,1-.509.184,1.168,1.168,0,0,0-.94.694,1.207,1.207,0,0,0,.36,1.106.632.632,0,0,0,.167.14l.1.061h0l.119.075.342.233.2.154a1.8,1.8,0,0,1,.487.474h0c.224.628.619,1.01,1.08,1.045h.061a.764.764,0,0,0,.312-.048.8.8,0,0,0,.149-.079.145.145,0,0,1-.044.026.808.808,0,0,0,.2-.136,1.137,1.137,0,0,0,.211-.263l.083-.088c.479-.47.509-.961.114-1.883-.07-.158-.132-.3-.2-.439v.04h0v.04h0v-.044a.659.659,0,0,0-.1-.18.729.729,0,0,1,.1.18v-.04a3.482,3.482,0,0,0-.685-1.045l-.031-.031h0a.6.6,0,0,0-.149-.1.641.641,0,0,1,.145.1,1.278,1.278,0,0,0-1.572-.162Zm1.756.487a.105.105,0,0,1,0,.035h0a.539.539,0,0,1,0,.083v.048a.658.658,0,0,0,0-.162h0Zm-.053-.136.022.044a.337.337,0,0,0,0,.048,1.194,1.194,0,0,0-.048-.11.033.033,0,0,0,.061.026Zm-.079-.114h0l.031.04h0v0h0a.509.509,0,0,0-.088-.105.228.228,0,0,1,.075.075ZM43.716,40.2ZM54.486,22.093Zm6.2-3.6-.092-.206a3.409,3.409,0,0,0-.193-.369c0-.026-.031-.048-.04-.066l-.206-.325-.031-.044v-.022c-.083-.127-.171-.246-.263-.369l-.259-.329a.7.7,0,0,0-.114-.22,10.432,10.432,0,0,0-.922-.992,26.664,26.664,0,0,1-2.2-2.279.729.729,0,0,0-.167-.14l-.189-.233-.5-.79a6.845,6.845,0,0,0-.825-1.317l-.044-.075a.619.619,0,0,0-.132-.149,1.219,1.219,0,0,0-.158-.119.465.465,0,0,1,.053.044l-.083-.07a1.319,1.319,0,0,1-.083-.281.57.57,0,0,0-.061-.14.479.479,0,0,0,0-.158,2.919,2.919,0,0,0-.544-1.387,5.786,5.786,0,0,0-.834-.812h-.026a3.034,3.034,0,0,0-1.141-.584A.676.676,0,0,1,51.509,7l-.1-.105a1.875,1.875,0,0,0-.439-.4,1.343,1.343,0,0,0-.373-.237L50.451,6.2c-.961-.4-1.8-.7-2.344-.347a4.61,4.61,0,0,1-.474.061c-.746.083-1.677.184-2.094.843A1.278,1.278,0,0,0,45.45,7.89l.035.083a9.639,9.639,0,0,0,1.756,2.99c.066.048.079.061.053.439a1.809,1.809,0,0,0,.211,1.221.729.729,0,0,1,.044.316,5.036,5.036,0,0,0-1-1.475,1.138,1.138,0,0,0-1.159-.413.878.878,0,0,0-.522.852.667.667,0,0,0,.132.439c.136.18.268.373.364.522a1.317,1.317,0,0,0,.241,1.291,15.462,15.462,0,0,0,1.264,1.5,12.732,12.732,0,0,1,1.076,1.269,1.238,1.238,0,0,0,.751.61v.044a1.458,1.458,0,0,1,.066.408c.031.839.593.931.83.931a1.071,1.071,0,0,0,.979-1.168,1.611,1.611,0,0,0-.184-.878,8.073,8.073,0,0,0-.558-.825l-.119-.189h0a.764.764,0,0,0,.2-.272,6.893,6.893,0,0,0,1.168,1.128,2.406,2.406,0,0,0,.834.47,5.133,5.133,0,0,0,.531.105l.215.031a2.221,2.221,0,0,0,1.19,1.317,2.914,2.914,0,0,0,.307.127l.162.057a2.674,2.674,0,0,1,.878.439,2.133,2.133,0,0,1,.224.22c.066.079.176.228.307.4a11.415,11.415,0,0,0,2.015,2.239h.035a.676.676,0,0,0,.149.075.439.439,0,0,1-.1-.04h0l-.079-.048.171.11.053.026a.966.966,0,0,0,.136.066l.061.026.149.044h.075a1,1,0,0,0,.522-.031L59,22.317a1.382,1.382,0,0,0,.171-.1l.07-.057a1.216,1.216,0,0,0,.149-.154l.044-.057a1.317,1.317,0,0,0,.127-.228c.1-.237.18-.439.259-.6l.022-.048.031-.07.031-.061a1.662,1.662,0,0,1,.075-.154l.035-.066.044-.079.048-.07h0l.031-.04h.07a.957.957,0,0,0,.654-.5C61.155,19.516,60.926,19.019,60.689,18.488ZM47.957,5.91a.4.4,0,0,1,.114-.075,1.023,1.023,0,0,0-.11.083Zm1.027,7.8h0a.836.836,0,0,0,0-.11.479.479,0,0,1,0,.119Zm.834.575a.72.72,0,0,0-.145.193,3.279,3.279,0,0,0-.347-.378,1.318,1.318,0,0,1-.149-.162l-.07-.057-.026-.035.035-.031c.123-.11.263-.224.391-.32a.615.615,0,0,0,.32,0,6.983,6.983,0,0,1,.439.571,1.317,1.317,0,0,0-.443.228Zm7.7,7.464a.765.765,0,0,1,0-.184.549.549,0,0,0,.031.189Zm.026.066h0a.167.167,0,0,0,.035.075.316.316,0,0,1-.031-.088Zm.04.088a.381.381,0,0,1-.031-.075.505.505,0,0,0,.053.11.153.153,0,0,0-.018-.048Zm.053.079h0l.026.035Zm.1.1-.048-.044L57.66,22a.531.531,0,0,0,.088.083h0ZM20.693,54.089h0l-.035.057a.268.268,0,0,1-.031.044h0a.47.47,0,0,0,.066-.1h0a.439.439,0,0,0,.061-.1.721.721,0,0,1-.061.1Zm0,0Zm35.93-28.537a1.045,1.045,0,0,0-1.379-.044l-.11.07a3.482,3.482,0,0,1-.781.439A.7.7,0,0,0,54,26.3c-.11.184-.215.382-.325.588s-.25.47-.386.689l.127-.408v-.079a.663.663,0,0,0-.3-.768h0a.228.228,0,0,1-.044-.053,1.317,1.317,0,0,0-.149-.189,1.976,1.976,0,0,0-1.756-.654,1.1,1.1,0,0,0-.8.808,2.636,2.636,0,0,1-.119.347l-.158-.312a.61.61,0,0,0-.075-.325,4.276,4.276,0,0,0-1.269-1.559,2.823,2.823,0,0,0-2.529-.483.588.588,0,0,0-.114.04,2.278,2.278,0,0,0-.843.729.935.935,0,0,0,.088-.439V24.2a1.541,1.541,0,0,0-.053-.277,1.181,1.181,0,0,0-.9-.926.781.781,0,0,0-.773.439l-.369.672h0a2.5,2.5,0,0,0-2.34-.347,3.816,3.816,0,0,1-.439.1c-.5.1-1.146.228-1.383.781a1.185,1.185,0,0,0,.1,1.1v.044a.73.73,0,0,1-.1,0,1.357,1.357,0,0,1-.347-.215l-.1-.053a4.183,4.183,0,0,0-.439-.3,3.759,3.759,0,0,0,.386-.8.672.672,0,0,0-.035-.5.869.869,0,0,1,.035-.154.768.768,0,0,0-.439-.878c-.531-.228-1.146.184-1.523.694l-.158.215a1.471,1.471,0,0,1-.58.571,3,3,0,0,1-.514.1c-.738.114-1.971.3-2.375,1.427a.681.681,0,0,0,0,.439,3.187,3.187,0,0,0,.948,1.383,1.067,1.067,0,0,0,.918.3,2.081,2.081,0,0,1,.742.391,1.927,1.927,0,0,1,.246.233.488.488,0,0,1-.035-.066.9.9,0,0,0,.373.408,1.071,1.071,0,0,0,.2.14h.048a.592.592,0,0,0,.114.066l.259.1.145.057a5.585,5.585,0,0,0,.132.839,6.586,6.586,0,0,1,.149,1.137,2.438,2.438,0,0,0,.738,2.226,2.384,2.384,0,0,1,.132.751.8.8,0,0,0-.061.123,2.229,2.229,0,0,0-.408,1.51,1.673,1.673,0,0,1,0,.694.237.237,0,0,1,.061-.07.623.623,0,0,0-.2.342h0a1.875,1.875,0,0,0-1.888-.123l-.18.088-.1.061c-.057.035-.119.075-.184.123l-.07.048c-.1.079-.18.149-.259.224a2.134,2.134,0,0,0-.619,1.475c0,.307-.026.408-.382.667a.645.645,0,0,0-.241.32,1.475,1.475,0,0,0,.158,1.379,1.01,1.01,0,0,0,.751.334L34.2,41.7a1.014,1.014,0,0,1-.083.061l-.189.127-.184.127-.044.031-.145.092-.092.061-.07.048-.241.158-.259.167h0l-.079.057h0a.961.961,0,0,0-.5.707.689.689,0,0,0,.114.439,1.374,1.374,0,0,0-.672.224,1.4,1.4,0,0,0-.641,1.418.988.988,0,0,0,.04.154v-.061a1.808,1.808,0,0,0,.07.246.342.342,0,0,0,.053.127,1.783,1.783,0,0,0,.154.255.522.522,0,0,1-.04-.066.589.589,0,0,0,.079.123h.026l.057.066.044.053.066.053a.88.88,0,0,0,.11.088,1.187,1.187,0,0,0,.145.1l.154.075a.778.778,0,0,0,.123.048,1.209,1.209,0,0,0,.149.044.246.246,0,0,1,.114.022,1.562,1.562,0,0,0,.25,0h.11L33,46.714l.105-.026a1.413,1.413,0,0,0,.268-.105l0,0a2.2,2.2,0,0,0,.206-.14l.057-.044a2.015,2.015,0,0,0,.237-.237A6.586,6.586,0,0,1,34.944,45.1l.123-.1a1.289,1.289,0,0,1,.176-.123.571.571,0,0,1,.149-.066c.066.061.14.119.215.176l.162.136a.808.808,0,0,0-.272.575.711.711,0,0,0,.36.623,1.062,1.062,0,0,0,1.062-.1,2.087,2.087,0,0,0,.255-.184,2.235,2.235,0,0,0,.439-.527c.439.4.821.487,1.194.255a.847.847,0,0,0,.378-.514h.026a1.111,1.111,0,0,0,1.01-.105,1.379,1.379,0,0,0,.3-.259l.088-.1h0a.663.663,0,0,0-.07.54.676.676,0,0,0,.272.351.58.58,0,0,0-.145.3.94.94,0,0,1-.048.167l-.224.035a1.958,1.958,0,0,0-.812.224.439.439,0,0,0-.07.057h-.044c-.11.031-.277.066-.439.1a3.305,3.305,0,0,0-.931.277.711.711,0,0,0-.334.623h-.439q-.219.011-.439,0l-.053-.075a1.541,1.541,0,0,0-1.6-.8,15.826,15.826,0,0,0-3.389.738.529.529,0,0,1,.061-.044.531.531,0,0,0-.061.044.316.316,0,0,0-.1.075h0l.088-.075a.737.737,0,0,0-.092.079l.053-.048h0l-.123.075a4.39,4.39,0,0,0-.777.54l-.048.04a.093.093,0,0,1,0,.026,1.467,1.467,0,0,0-.285.408,1.177,1.177,0,0,0-.057.149,5.62,5.62,0,0,1-.812.364,4.522,4.522,0,0,0-.931.439.8.8,0,0,0-.364.6V49.94a1.98,1.98,0,0,1-.127.347c-.364.966-.983,2.582,0,3.367a2.881,2.881,0,0,1,.4.439,6.648,6.648,0,0,0,.606.659l.07.061.035.031.127.105.149.11.04.026.07.048L30,55.27l.066.035a2.886,2.886,0,0,0,.281.127h.061a2.566,2.566,0,0,0,.325.105H30.8a2.9,2.9,0,0,1,.351.07h.07a3.805,3.805,0,0,0,.386.044H33l.4-.048a9.746,9.746,0,0,1,1.861-.132,1.572,1.572,0,0,0,1.172.3,1.269,1.269,0,0,0,.812,1.357,5.029,5.029,0,0,1,.628.338H37.9l.057.04h0a4.267,4.267,0,0,1,.632.479,1.721,1.721,0,0,0-.14.22.158.158,0,0,0-.031.044v.022l-.048.1h0l-.031.07h0a1.888,1.888,0,0,0-.026,1.563,2.024,2.024,0,0,0,1.352,1.032c.246.092.268.145.338.312.184.439.439.878,1.51,1.115a5.4,5.4,0,0,1,.588.158.834.834,0,0,0,.615.439,2.775,2.775,0,0,0,1.993-.281c.114-.053.268-.105.439-.167l.114-.04.36-.132.048-.022c.119-.044.263-.11.4-.176a.22.22,0,0,0,.053-.035h0l-.048.035h.031l.07-.031h0l.158-.083.053-.031.066-.035.224-.14.044-.026L47,61.715a6.994,6.994,0,0,0,1.466-1.532,4.54,4.54,0,0,0,.983-2.147v-.119H49.5a1.12,1.12,0,0,1,.145-.075.808.808,0,0,0,.189-.132.769.769,0,0,1-.171.123.878.878,0,0,0,.154-.105,1.159,1.159,0,0,0,.369-1.062,1.1,1.1,0,0,0-.58-.724l.123-.092a2.534,2.534,0,0,0,.777-2.45,1.554,1.554,0,0,0-.382-.558.355.355,0,0,1-.044-.04,1.434,1.434,0,0,0-.171-.127l-.044-.031h0a1.567,1.567,0,0,0-.167-.1l-.176-.088a3.445,3.445,0,0,1-.8-.465,1.365,1.365,0,0,1,.145-.558,7.793,7.793,0,0,0,.439-3.745c-.132-.843-.263-1.462-.76-1.725a.878.878,0,0,0-.781,0l-.075.044a.878.878,0,0,0-.18.127.677.677,0,0,0-.083.075,7.073,7.073,0,0,0,1.1-3.828,1.528,1.528,0,0,0-.65-1.348.9.9,0,0,0-.474-.1.263.263,0,0,0,.035-.035.659.659,0,0,0,.364-.237l.145-.184a.658.658,0,0,0,.14-.5l.035-.044.057-.079.2-.272c.07-.1.145-.193.224-.285a3.463,3.463,0,0,1,.277-.29l.031-.031a2.508,2.508,0,0,1,.307-.241,2,2,0,0,0,.3-.228l.079-.075q.083-.083.158-.171l.053-.066c.053-.066.1-.127.14-.193l.088-.136a.338.338,0,0,1,.04-.057c.026-.044.035-.057.044-.061h1.1a3.818,3.818,0,0,0,.439-.053,3.448,3.448,0,0,0,.439-.11l.119-.035a3.142,3.142,0,0,0,.47-.2l.11-.057c.114-.053.22-.1.325-.136.364-.149.773-.32.878-.773a.878.878,0,0,0-.189-.76.637.637,0,0,0-.136-.149.877.877,0,0,1,.114.11c-.04-.048-.083-.092-.136-.145l.061.066-.1-.1-.114-.1h0l-.105-.088c-.29-.211-.544-.369-.751-.5-.114-.066-.215-.127-.3-.184l-.105-.079-.044-.035-.026-.035h0v-.04h0a.343.343,0,0,1-.022-.079,2.734,2.734,0,0,0-.088-.32,1.048,1.048,0,0,0-.044-.114v-.053a1.127,1.127,0,0,0-.048-.119c-.026-.057-.057-.114-.088-.167a.5.5,0,0,0-.04-.07c-.04-.07-.079-.132-.119-.193a.438.438,0,0,1,.04.066.733.733,0,0,0-.079-.123l.04.053c-.088-.132-.171-.246-.255-.36l-.18-.259c-.031-.048-.057-.088-.075-.123a.439.439,0,0,1-.044-.132.469.469,0,0,1,0-.167.462.462,0,0,1,0-.053.272.272,0,0,1,0-.07h0a.175.175,0,0,1,.031-.061h0a.29.29,0,0,1,.048-.053h0a.518.518,0,0,1,.1-.075,1.485,1.485,0,0,1,.237-.119.817.817,0,0,0,.878-.483,1.115,1.115,0,0,0,0-.878l.206-.031a2.88,2.88,0,0,0,.79-.189.913.913,0,0,0,.193.777.751.751,0,0,0,.786.206.7.7,0,0,0,.206-.083,1.286,1.286,0,0,0,.729-.97,2.138,2.138,0,0,1,.439-.918,6.989,6.989,0,0,0,1.023-1.589,1.984,1.984,0,0,0,.11-.386.566.566,0,0,1-.035.123.663.663,0,0,0,.048-.246.543.543,0,0,1,0,.119.448.448,0,0,1,.026-.184.645.645,0,0,0,.136-.5,1.234,1.234,0,0,0-.47-.983Zm-18.69,7.933Zm-5.268,9.22a.925.925,0,0,1,.1-.083l.053-.031H32.8a.729.729,0,0,0-.119.11Zm.154-.11ZM32.859,42.56Zm1.971-1.4ZM38.549,38.2a.948.948,0,0,1-.628-.338v-.075a2.2,2.2,0,0,0,.571.32,1.954,1.954,0,0,0,.483.127c.6.092,1.084.162,1.462.206-.285-.009-1.128-.136-1.875-.246ZM33.215,55.608a.637.637,0,0,0,.312-.439h0A.637.637,0,0,1,33.215,55.608Zm6.177-9a.5.5,0,0,1,.145-.123A.935.935,0,0,0,39.392,46.608ZM39.559,46.472Zm6.146-6.335Zm-.04-.066Zm-.584,0h.079a3.864,3.864,0,0,1,.61.162,6.335,6.335,0,0,0,.843.729.645.645,0,0,0,.3.127l-.171.088h0a6.231,6.231,0,0,1-.659-.553h0v-.031h0a.281.281,0,0,0-.057-.066,1.11,1.11,0,0,0-.154-.123h.035l-.075-.044A2.753,2.753,0,0,0,45.1,40.1Zm1.071.711v-.04h0a.057.057,0,0,0-.018.057ZM45.121,46.45h0a.632.632,0,0,1-.184.189.632.632,0,0,0,.167-.171Zm-3.244-7.766a.606.606,0,0,1-.281-.364A.663.663,0,0,0,41.877,38.684Zm-1.036-.206h.281a3.951,3.951,0,0,1,.821.206.97.97,0,0,0,0,.162.733.733,0,0,0-.237-.145A6.471,6.471,0,0,0,40.841,38.477Zm.913,7.7Zm.132-5.953a1.673,1.673,0,0,0,.272-.667.614.614,0,0,0,0-.22,1.177,1.177,0,0,0,.386.29h.044a1.4,1.4,0,0,0,.8.057h.022l.11-.04h0l.083.035h.031l.061.035h.031a.88.88,0,0,1,.092.075.211.211,0,0,1-.031-.066.615.615,0,0,0,.241.329,1.492,1.492,0,0,1-.307.083h.1a.469.469,0,0,0-.11,0,.523.523,0,0,0-.14.044.412.412,0,0,0-.066.026h.031l-.04.022h0a.7.7,0,0,0-.154.123h0l-.026.035a.584.584,0,0,0-.105.171.114.114,0,0,0,0,.035.593.593,0,0,0-.026.154h0a.98.98,0,0,1,0-.1V40.7a.061.061,0,0,1,0-.031.537.537,0,0,1-.031.075A1.756,1.756,0,0,0,42.2,40.3a2.076,2.076,0,0,1-.321-.075Zm1.317.742v-.026h0Zm0-.154h0v0ZM46.144,62.29h0a.659.659,0,0,0,.325-.558.654.654,0,0,1-.36.558Zm.733-15.164c-.031.066-.061.127-.092.18a.637.637,0,0,0-.272-.066H45.494a.641.641,0,0,0-.241.048h0l-.11.057h0a.4.4,0,0,1,.105-.053.681.681,0,0,0-.18.11.479.479,0,0,1,.075-.057.479.479,0,0,0-.075.057h-.026s.022,0,.035-.031h-.04l-.083.044-.11.07c-.092-.04-.211-.083-.364-.136a5.839,5.839,0,0,1-.755-.3,5.575,5.575,0,0,0-1.155-.474h0a.672.672,0,0,0-.1-.2l-.167-.228h.026a5.537,5.537,0,0,1,1.506.338l.483.145h.031l.1.026.391.105.351.1a.68.68,0,0,0,.378.123h1.005a.676.676,0,0,0,.189-.026h.031a.681.681,0,0,0,.127-.061l.048-.035a.675.675,0,0,0,.083-.075h0a2.92,2.92,0,0,0-.206.342ZM53.463,35.224Zm-1.229-.852Zm.733-5.975h0v.031Zm.088.105h0v.031Zm-7.99,18.9a.7.7,0,0,1,.066-.053Zm.931-6.915ZM55.03,22.879ZM20.14,51.855a5.483,5.483,0,0,0-.944-1.26.636.636,0,0,1,.114.154.821.821,0,0,0-.114-.154l-.053-.048L19.1,50.5a3.869,3.869,0,0,0-.474-.373c-.04-.031-.079-.057-.119-.092l-.031-.031-.044-.044h0a.333.333,0,0,1-.035-.048.2.2,0,0,1-.04-.075l-.026-.07v-.035a.228.228,0,0,0,0-.048v-.1a.176.176,0,0,0,0-.066h0V49.5a2.317,2.317,0,0,0-.092-.439,1.146,1.146,0,0,0-.07-.189.516.516,0,0,1-.022-.048,1.421,1.421,0,0,0-.088-.145l-.035-.048a.438.438,0,0,0-.075-.083.057.057,0,0,0,0-.026.242.242,0,0,1,.031-.136L18,48.25a.724.724,0,0,0,0-.075.567.567,0,0,1,0-.061,1.4,1.4,0,0,1,.031-.18.33.33,0,0,0,0-.1V47.53a2.845,2.845,0,0,0-.123-.821c-.044-.132-.083-.228-.132-.338l-.031-.07c-.044-.088-.092-.176-.158-.285a.878.878,0,0,0-.048-.088c-.066-.105-.14-.2-.211-.3a2.748,2.748,0,0,1-.285-1.677,1.663,1.663,0,0,0-.474-1.519,2.634,2.634,0,0,1-.057-.6,3.263,3.263,0,0,0-1.172-2.757,3.071,3.071,0,0,0-.241-.22h0a1.561,1.561,0,0,0-1.677-.4l-.066-.07-.11-.114-.066-.031a1.859,1.859,0,0,0-2.893-.2l-.057.057c-.035.048-.088.105-.145.171a5.449,5.449,0,0,0-1.655,3.446v.224c.022.474.044.966-.1,1.1-.057.057-.329.224-1.352.114H6.912a18.962,18.962,0,0,1-3.266-.439c-1.655-.329-2.748-.544-3.323,0a1.032,1.032,0,0,0-.285.922.566.566,0,0,1,0-.123c-.114,4.136.694,4.36,1.041,4.456h0a.878.878,0,0,0,.356,0,1.014,1.014,0,0,0,.338-.119A.729.729,0,0,0,2,47.64l.057-.105c.1.114.206.233.307.356a3.337,3.337,0,0,0,.645.65l-.031-.026a.7.7,0,0,0,.119.079h0a.079.079,0,0,0,.031,0h0a.518.518,0,0,0,.132.044.725.725,0,0,0,.136,0,.6.6,0,0,1-.127,0,.711.711,0,0,0,.619-.114.733.733,0,0,0,.123-.11h0a1.619,1.619,0,0,0,.176.127h0l.066.044h.035l-.053-.031h0l.057.031h0l.1.031-.1-.031.255.1a.522.522,0,0,1,.189.1h0a1.181,1.181,0,0,1,.184.224,1.73,1.73,0,0,0,.913.795h.057c.04.057.092.136.149.228a5.137,5.137,0,0,0,1.2,1.409,1.708,1.708,0,0,0,1.005.439,2.239,2.239,0,0,0,.369.439,2.476,2.476,0,0,0,.948.566,1.988,1.988,0,0,0,.233.066h.061a1.43,1.43,0,0,0,.206.04h.593a2.587,2.587,0,0,1,.277.162c.465.285,1.106.681,1.7.382l.162-.088.154-.083a1.028,1.028,0,0,1,.246.162.412.412,0,0,1-.044-.044l.075.061H13.2l.189.162a9.878,9.878,0,0,0,.839.781h0c-.026-.022-.057-.04-.083-.066a.785.785,0,0,0,.123.088.644.644,0,0,0,.123.061.828.828,0,0,1-.092-.04h0l-.048-.026H14.2l.171.123.048.035.167.11.053.035.29.167.127.066.127.057.149.066.132.048c.066.026.136.044.193.061l.105.031a2.086,2.086,0,0,0,.285.053h.426l.25-.026h.1a1.923,1.923,0,0,0,.32-.1.439.439,0,0,0,.079-.035,1.7,1.7,0,0,0,.246-.132l.083-.057a2.4,2.4,0,0,0,.228-.176l.083-.079a2.288,2.288,0,0,0,.2-.22l.04-.031h.421a1.213,1.213,0,0,1,.294.061,2.635,2.635,0,0,0,.3.053h0a1.8,1.8,0,0,0,.2,0,.44.44,0,0,1-.105,0,.778.778,0,0,0,.14,0,2.156,2.156,0,0,0,.47-.035.6.6,0,0,1-.127,0,.759.759,0,0,0,.167,0l.145-.044h.092l.066-.035h.022a.615.615,0,0,0,.075-.04h0l.066-.057h0l.035-.031a.88.88,0,0,0,.075-.1l-.04.031.044-.04.026-.04a.154.154,0,0,1,0,.035l.075-.061-.079.07a.549.549,0,0,1-.07.1l.057-.044h.026a.523.523,0,0,0,.04-.066v0c0-.035.048-.07.066-.105l-.031.057a.47.47,0,0,0,.066-.1h0a.623.623,0,0,0,.031-.1.219.219,0,0,1,0,.057c.162-.378.18-1-.562-1.9ZM4.168,48.514Zm0,0ZM18.13,54.489h0Zm0,0Zm.022,0Zm2.055,0Zm-.079,0h-.083a.733.733,0,0,0,.162,0h-.079Zm.127-.026h-.022l-.061.026h.066Zm0,0Zm.132-.1.075-.1h-.053l.057-.031a.466.466,0,0,0,.044-.053.52.52,0,0,0-.035.053l.057-.026-.066.035a.671.671,0,0,1-.07.1l.066-.031-.079.044h-.044Zm0,.026h0a.439.439,0,0,1-.1.048h-.022a.535.535,0,0,0,.083-.053l-.035.031h.066Zm.075-.136ZM23.973,39.6l-.035.026a.439.439,0,0,1-.07.053.474.474,0,0,0,.088-.053ZM18.13,35.988Zm2.1,18.5Zm.132-.092Zm-.154.092ZM15.434,32.247Zm12.35,6h.075a2.4,2.4,0,0,0,1.589-.132,2.538,2.538,0,0,0,.329-.184,3.512,3.512,0,0,0,.685-.562,3.89,3.89,0,0,0,.285-.338,3.262,3.262,0,0,0,.408-.729l.026-.075a.822.822,0,0,0,0-.11.368.368,0,0,1-.048.092.465.465,0,0,0,.048-.092.628.628,0,0,0,0-.1h0a.682.682,0,0,1,0,.092h0a.822.822,0,0,1,0,.11.057.057,0,0,0,0,.026l.075-.228h0a.061.061,0,0,0,0-.031h0a.765.765,0,0,0,0-.1,2.359,2.359,0,0,0,.057-.32,1.5,1.5,0,0,0,.522.026h.053a2.539,2.539,0,0,0,.3-.075l.1-.035c.092-.035.171-.066.246-.1l.14-.07.206-.119c.07-.044.127-.088.18-.127l.035-.026.119-.1a2.226,2.226,0,0,0,.206-.211l.1-.114a1.831,1.831,0,0,0,.233-.408.518.518,0,0,1,.176-.259,1.317,1.317,0,0,0,.47-1.229v-.035a.786.786,0,0,1,.184-.224,1.629,1.629,0,0,0,.241-.312l.044-.079A1.348,1.348,0,0,0,35,31.725a.641.641,0,0,0,0-.1,1.265,1.265,0,0,0,0-.241v-.123a2.055,2.055,0,0,0-.04-.246,1.8,1.8,0,0,0-.057-.2l-.035-.1a.65.65,0,0,0-.1-.382,2.7,2.7,0,0,0-.382-.47,3.034,3.034,0,0,0-.413-.347c-.2-.158-.47-.334-.733-.5-.184-.119-.356-.228-.5-.334l-.088-.079a2.577,2.577,0,0,0-.931-1.221,1,1,0,0,0-.9-.259,1.072,1.072,0,0,0-.193.083,9.873,9.873,0,0,0-.439-1.01,1.146,1.146,0,0,0-.878-.641,2.634,2.634,0,0,0-2.072.83,2.524,2.524,0,0,1-2.265.439h-.088a6.2,6.2,0,0,1-2.3-.878,2.577,2.577,0,0,0-1.115-.439,2.955,2.955,0,0,0-1.818.268,1.756,1.756,0,0,0-.29.206h0a3.275,3.275,0,0,1-.645.035c-.878,0-2.994.711-3.025,1.642a.654.654,0,0,0,.053.29.4.4,0,0,1-.176,0,.935.935,0,0,0-.72.193A4.307,4.307,0,0,0,13.322,30.7a5.044,5.044,0,0,1-.514,1.4,3.034,3.034,0,0,0-.439,1.4,1.317,1.317,0,0,1-.241.329,2.691,2.691,0,0,0-.659,1.168c-.189.808-.294,1.409.07,1.782a.768.768,0,0,0,.7.215h0a.992.992,0,0,0,.29-.11l.048-.031a2.029,2.029,0,0,0,.211-.158.645.645,0,0,0,.224-.4,2.463,2.463,0,0,1,.228-.746.988.988,0,0,0,.659-.206,1.357,1.357,0,0,0,.439-.961,1,1,0,0,0,.465.149.931.931,0,0,0,.729-.316,1.08,1.08,0,0,0,.176-.259,1.48,1.48,0,0,0,.189-.531V33.1a.188.188,0,0,1,0-.053,1.756,1.756,0,0,0-.07-.281,1.366,1.366,0,0,0-.119-.241h0a1.11,1.11,0,0,0-.136-.171h0a.715.715,0,0,0-.088-.075.637.637,0,0,0-.294-.1.637.637,0,0,1,.294.1,1.866,1.866,0,0,0-.272-.184v-.044a.268.268,0,0,0,0-.053,1.141,1.141,0,0,1,.07-.154.527.527,0,0,0,.035-.079l.07-.127h.224a1.392,1.392,0,0,1,.795.294h0a1.128,1.128,0,0,1,.369.755v.083a2.12,2.12,0,0,1,0,1.3c-.659.3-1.273,1.032-1.141,1.646a.786.786,0,0,0,.795.619,1.225,1.225,0,0,0,.356-.066h.061a1.98,1.98,0,0,0,.312-.145,2.606,2.606,0,0,1,.25-.119l.11-.035h.07a.553.553,0,0,1,.123,0h.184l.07.031a.7.7,0,0,1,.114.083H18.1a.681.681,0,0,1,.083.105,1.374,1.374,0,0,0,1.194.522h.18a.171.171,0,0,1,.066,0h0l.031.026a1.291,1.291,0,0,0,.97.6h.04l.083.057a2.195,2.195,0,0,1,.334.413c.167.351.342.72.76.8a.738.738,0,0,0,.65-.18h0c.057.689.167,1.212.637,1.4a.773.773,0,0,0,.795-.154l.057-.044a1.532,1.532,0,0,0,.184-.237,2.1,2.1,0,0,0,.29-.707,1.291,1.291,0,0,1,.057-.171.878.878,0,0,0,.439-.36.957.957,0,0,0,.07-.79h0a.628.628,0,0,1,.092-.294,1.414,1.414,0,0,0,.694-.645,1.69,1.69,0,0,0,.294.075,2.1,2.1,0,0,0-.3,1.216c0,.29.07,1.062.685,1.264a.957.957,0,0,0,1.045-.4h0c.035-.04.066-.083.1-.127s.066-.1.092-.14A.907.907,0,0,0,27.784,38.245Zm6.638-5.6a.707.707,0,0,0-.035-.167A.439.439,0,0,1,34.422,32.643Zm-3.828,3.811Zm-12.425-.439h-.026l.048.035Zm1.317.588Zm4.794-2.937a.777.777,0,0,1,.246-.364q.061.119.119.224a1.528,1.528,0,0,0-.369.149ZM31.182,36.221ZM31.182,36.111ZM53.27,50.375l-.057-.1v-.04l-.035-.057-.1-.162c-.4-.575-.812-.623-1.084-.562a1.058,1.058,0,0,0-.742.944.659.659,0,0,0,.053.378.992.992,0,0,1,.053.716c-.066.114-.14.224-.215.334a1.241,1.241,0,0,0-.114,1.668.522.522,0,0,1,.167.356.677.677,0,0,0,.04.211,1.234,1.234,0,0,0,1.076.834h.386a.878.878,0,0,0,.154,0,1.221,1.221,0,0,0,.2-.035,1.072,1.072,0,0,0,.145-.044,1.111,1.111,0,0,0,.241-.119,1.033,1.033,0,0,0,.11-.079,1.1,1.1,0,0,0,.29-.369A4.752,4.752,0,0,0,53.4,50.59q-.044-.1-.11-.215ZM31.182,36.247a.057.057,0,0,1,0-.026l-.026.075A.237.237,0,0,1,31.182,36.247ZM12.26,37h0a1.057,1.057,0,0,1-.123,0,.611.611,0,0,0,.123,0Zm19.023-1.128h0a.44.44,0,0,0,0,.079.668.668,0,0,0,0-.079ZM15.478,32.291l.031.026h0a.172.172,0,0,0-.022-.026Z" transform="translate(-0.019 -0.514)"/><path class="b" d="M77.328,82.2a1.854,1.854,0,0,0-1.927.584,1.756,1.756,0,0,0-.5,1.242.992.992,0,0,1-.522.913L74.29,85l-.031.1a1.168,1.168,0,0,0,.088,1.054.724.724,0,0,0,.7.211.807.807,0,0,1,.325.281v.026h0a13.3,13.3,0,0,1-1.686,1.212l-.356.233c-.167.114-.334.233-.351.439a.549.549,0,0,0,.246.439.734.734,0,0,0,.123.1.5.5,0,0,1-.211.272.878.878,0,0,0-.8.061,1.071,1.071,0,0,0-.558,1.137,1.242,1.242,0,0,0,2.23.58,6.882,6.882,0,0,1,1.12-1.111l.119-.1c.492-.408.689-.241.751-.184l.206.167a3.027,3.027,0,0,1,.47.439h0c-.193.105-.439.277-.439.549a.382.382,0,0,0,.237.329.927.927,0,0,0,.878-.263,1.344,1.344,0,0,0,.536-.922l.031.031c.4.527.716.724,1.014.637s.369-.29.391-.689v-.18a.979.979,0,0,0,.522.325.838.838,0,0,0,.83-.3c.176-.2.237-.233.263-.224a.773.773,0,0,0,.483-.066,1,1,0,0,1-.127.6l-.2.32,1.352.6h.105a4.789,4.789,0,0,1,1.677.347c.439.136.768.224,1.014.29l.4.114.061.1h1.409l.083-.206a.98.98,0,0,1,.2-.307,6.5,6.5,0,0,0,1.185-3.793c-.048-.439-.119-.909-.474-1.089a.975.975,0,0,0-.913.158l-.127.075-.189-.149a5.587,5.587,0,0,1-.724-.615V86h0c-.189-.272-1.185-.439-1.269-.439a1.081,1.081,0,0,0-.334.083,2.546,2.546,0,0,1-.378.1l-.255.026-.035.272a.878.878,0,0,1-.316.461.229.229,0,0,1-.061-.062,1.339,1.339,0,0,0-.983-.575,2.456,2.456,0,0,1-.439-.11,1.129,1.129,0,0,1-.391-.246,1.093,1.093,0,0,0,.518-.79v-.088l-.11-.325-.14-.044A4.626,4.626,0,0,0,80.849,84c-.316,0-1.163-.123-1.984-.246a1.273,1.273,0,0,1-.878-.492l-.083-.114a.408.408,0,0,0,.061-.3A.94.94,0,0,0,77.328,82.2ZM79.7,87.907a1.235,1.235,0,0,1,.259-.285,1.419,1.419,0,0,0,.36-.439h0a1.067,1.067,0,0,0,.623.184l-.136.035a1.374,1.374,0,0,0-.961.7h0a1.13,1.13,0,0,1-.083-.162Zm6.045.105H85.7a1.757,1.757,0,0,0,.54-.193c-.035.176-.1.176-.492.176Z" transform="translate(-40.265 -46.094)"/><path class="a" d="M76.436,81.7a1.528,1.528,0,0,1,.487.079.94.94,0,0,1,.685.654.408.408,0,0,1-.061.3l.083.114a1.273,1.273,0,0,0,.878.492c.821.123,1.668.246,1.984.246a4.626,4.626,0,0,1,1.067.259l.154.053.11.325v.088a1.093,1.093,0,0,1-.518.79,1.129,1.129,0,0,0,.391.246,2.453,2.453,0,0,0,.439.11,1.339,1.339,0,0,1,.957.584.229.229,0,0,0,.061.061.878.878,0,0,0,.316-.461l.035-.272.255-.026a2.542,2.542,0,0,0,.378-.1,1.078,1.078,0,0,1,.334-.083c.083,0,1.08.171,1.269.439h0v.022a5.587,5.587,0,0,0,.729.619l.189.149.127-.075a1.317,1.317,0,0,1,.637-.22.619.619,0,0,1,.277.062c.356.18.439.637.474,1.089a6.628,6.628,0,0,1-1.185,3.793.98.98,0,0,0-.2.307l-.083.206H85.291l-.062-.1-.4-.114c-.246-.066-.584-.154-1.014-.29a6.373,6.373,0,0,0-1.532-.36.71.71,0,0,0-.145,0h-.105l-1.352-.571.2-.32a1,1,0,0,0,.127-.6.663.663,0,0,1-.338.079.739.739,0,0,1-.145,0h0c-.031,0-.1.044-.255.224a.878.878,0,0,1-.659.32.933.933,0,0,1-.171,0,.979.979,0,0,1-.514-.356v.18c0,.4-.154.619-.391.689a.493.493,0,0,1-.136,0c-.259,0-.544-.211-.878-.659l-.031-.031a1.343,1.343,0,0,1-.536.922,1.115,1.115,0,0,1-.694.3.5.5,0,0,1-.2-.039.382.382,0,0,1-.237-.329c0-.272.246-.439.439-.549h0a3.03,3.03,0,0,0-.47-.439l-.206-.167a.294.294,0,0,0-.206-.083.926.926,0,0,0-.544.268l-.119.1a6.882,6.882,0,0,0-1.12,1.111,1.291,1.291,0,0,1-1,.5,1.238,1.238,0,0,1-1.234-1.08,1.071,1.071,0,0,1,.558-1.137,1.045,1.045,0,0,1,.492-.132.636.636,0,0,1,.307.07.5.5,0,0,0,.211-.272.73.73,0,0,1-.123-.1.549.549,0,0,1-.246-.439c0-.219.184-.338.351-.439l.356-.233a13.3,13.3,0,0,0,1.7-1.216h0v-.026a.808.808,0,0,0-.325-.281h-.171a.685.685,0,0,1-.527-.224,1.168,1.168,0,0,1-.088-1.054l.031-.1.088-.061A.992.992,0,0,0,74.5,83.6a1.756,1.756,0,0,1,.5-1.242,2.068,2.068,0,0,1,1.44-.663m3.007,6.019h0a1.374,1.374,0,0,1,.961-.7l.136-.035a1.066,1.066,0,0,1-.623-.184h0a1.418,1.418,0,0,1-.36.439,1.234,1.234,0,0,0-.259.285l.07.088a1.144,1.144,0,0,0,.083.162m5.892-.145c.4,0,.439,0,.492-.219a1.759,1.759,0,0,1-.54.193h.048M76.436,81.37a2.406,2.406,0,0,0-1.668.755,2.116,2.116,0,0,0-.6,1.458c0,.307-.026.408-.386.667l-.088.061-.119.162-.031.1a1.458,1.458,0,0,0,.154,1.379.988.988,0,0,0,.742.334c-.4.3-1.041.724-1.317.909l-.369.241a.944.944,0,0,0-.5.7.737.737,0,0,0,.11.439,1.437,1.437,0,0,0-1.308,1.642A1.589,1.589,0,0,0,72.2,91.538a1.523,1.523,0,0,0,.439.057,1.6,1.6,0,0,0,1.251-.619,6.549,6.549,0,0,1,1.071-1.067l.119-.1c.233-.189.334-.193.338-.193a1.783,1.783,0,0,0,.206.18l.162.136a.777.777,0,0,0-.268.615.7.7,0,0,0,.439.619.812.812,0,0,0,.325.066,1.436,1.436,0,0,0,.913-.386,2.308,2.308,0,0,0,.439-.522,1.142,1.142,0,0,0,.777.373.821.821,0,0,0,.79-.632.983.983,0,0,0,.193.057,1.105,1.105,0,0,0,.241.026,1.181,1.181,0,0,0,.9-.439l.1-.1h0l-.2.321.145.474,1.352.606h.3a.241.241,0,0,1,.083,0,6.278,6.278,0,0,1,1.436.347c.439.136.768.224,1.019.29l.29.079.263.149h1.409l.3-.206.088-.206a.6.6,0,0,1,.136-.206A6.71,6.71,0,0,0,88.531,87.2c-.04-.4-.105-1.071-.65-1.348a.936.936,0,0,0-.439-.1,1.511,1.511,0,0,0-.738.228h0a6.968,6.968,0,0,1-.654-.549h0c-.321-.465-1.541-.6-1.55-.6a1.392,1.392,0,0,0-.439.1,1.714,1.714,0,0,1-.312.083l-.255.031-.285.285-.031.233V85.6a1.69,1.69,0,0,0-.966-.439,2.136,2.136,0,0,1-.32-.079,1.708,1.708,0,0,0,.294-.672v-.263l-.105-.32-.211-.211-.154-.053a4.719,4.719,0,0,0-1.22-.277c-.294,0-1.163-.127-1.936-.241a.979.979,0,0,1-.619-.329.76.76,0,0,0,0-.3,1.247,1.247,0,0,0-.878-.918,1.83,1.83,0,0,0-.593-.1Z" transform="translate(-39.86 -45.672)"/><path class="b" d="M85.609,112.778a2.479,2.479,0,0,0,.764-1.809,1.216,1.216,0,0,0-.729-.957l-.18-.088c-1.067-.531-1.15-.575-.817-1.436a7.393,7.393,0,0,0,.439-3.574c-.105-.685-.228-1.462-.751-1.545s-.817.492-1.1,1.054a.776.776,0,0,1-.233.3h-1.58l-.1.088a.514.514,0,0,1-.114.075,1.027,1.027,0,0,0-.3.22.56.56,0,0,0-.123-.07,4.142,4.142,0,0,0-.4-.149,5.5,5.5,0,0,1-.83-.347,4.573,4.573,0,0,0-.847-.356l.11-.048-1.686-.755-.162.189a.144.144,0,0,1-.075.053l-.334.053a1.343,1.343,0,0,0-.79.259c-.092.035-.369.092-.553.132-.654.136-1.054.22-1.054.588a.875.875,0,0,0,0,.171v.092h-.123a3.79,3.79,0,0,0-.641.035,1.716,1.716,0,0,1-.672,0,1.052,1.052,0,0,1-.14-.193,1.207,1.207,0,0,0-1.225-.676,17.624,17.624,0,0,0-3.293.711,2.036,2.036,0,0,1-.184.11c-.4.228-.988.566-1.045,1.067a4.144,4.144,0,0,1-.988.479c-.659.259-1.054.413-1.084.751a2.651,2.651,0,0,1-.136.4c-.338.878-.9,2.353-.11,2.99a3.073,3.073,0,0,1,.439.483c.61.742,1.44,1.756,3.951,1.471l.492-.061a7.672,7.672,0,0,1,2.072-.105c.237.307.7.285,1.115.268h.281v.048a1.036,1.036,0,0,0,.566,1.352A4.882,4.882,0,0,1,75.1,115.2a1.967,1.967,0,0,0-.527,1.611,1.554,1.554,0,0,0,1.22,1.133c.439.154.487.3.575.509.158.382.369.711,1.278.918a3.125,3.125,0,0,1,.773.237.5.5,0,0,0,.439.364,2.421,2.421,0,0,0,.558.07,2.823,2.823,0,0,0,1.221-.329c.136-.061.294-.114.474-.176a5.8,5.8,0,0,0,3.165-2.34,4.271,4.271,0,0,0,.922-2.006c.044-.272.048-.307.413-.479l.083-.053a.847.847,0,0,0,.277-.751q-.105-.439-.79-.672l-.127-.048a3.26,3.26,0,0,1,.329-.241C85.473,112.883,85.556,112.822,85.609,112.778Z" transform="translate(-35.981 -58.009)"/><path class="a" d="M83.869,102.945h.079c.522.083.645.878.751,1.545a7.393,7.393,0,0,1-.439,3.574c-.334.878-.25.9.817,1.436l.18.088a1.216,1.216,0,0,1,.729.957,2.5,2.5,0,0,1-.764,1.809c-.053.044-.136.105-.233.171a3.271,3.271,0,0,0-.329.241l.127.048q.685.215.79.672a.847.847,0,0,1-.277.751l-.083.053c-.364.171-.369.206-.413.479a4.271,4.271,0,0,1-.922,2.006,5.8,5.8,0,0,1-3.165,2.34c-.18.061-.338.114-.474.176a2.823,2.823,0,0,1-1.22.329,2.426,2.426,0,0,1-.558-.07.5.5,0,0,1-.439-.364,3.125,3.125,0,0,0-.773-.237c-.909-.206-1.12-.536-1.278-.918-.088-.206-.149-.356-.575-.509a1.554,1.554,0,0,1-1.221-1.128,1.967,1.967,0,0,1,.531-1.638,4.882,4.882,0,0,0-1.66-1.163,1.036,1.036,0,0,1-.566-1.352v-.048H71.9a.97.97,0,0,1-.812-.277,1.062,1.062,0,0,0-.4-.048,15.338,15.338,0,0,0-1.677.154l-.492.061a7.025,7.025,0,0,1-.825.048,3.512,3.512,0,0,1-3.135-1.519,3.073,3.073,0,0,0-.439-.483c-.79-.637-.228-2.112.11-2.99.057-.154.127-.342.136-.4.031-.338.439-.492,1.084-.751a4.143,4.143,0,0,0,.988-.479c.057-.5.65-.839,1.045-1.067a2.022,2.022,0,0,0,.184-.11,17.623,17.623,0,0,1,3.293-.711h.189a1.242,1.242,0,0,1,1.071.707,1.055,1.055,0,0,0,.141.193.522.522,0,0,0,.237.035,2.531,2.531,0,0,0,.439-.026,4.648,4.648,0,0,1,.641-.035h.123v-.092a.874.874,0,0,1,0-.171c0-.369.4-.439,1.054-.588.184-.039.439-.1.553-.132a1.343,1.343,0,0,1,.79-.259l.334-.053a.145.145,0,0,0,.075-.053l.162-.189,1.686.755-.11.048a4.571,4.571,0,0,1,.847.356,5.512,5.512,0,0,0,.83.347,4.156,4.156,0,0,1,.4.149.56.56,0,0,1,.123.07,1.028,1.028,0,0,1,.3-.22.512.512,0,0,0,.114-.075l.1-.088h1.581a.777.777,0,0,0,.233-.3c.263-.527.588-1.058,1.019-1.058m0-.329c-.61,0-1.005.628-1.317,1.242-.026.048-.053.088-.07.114H81.059l-.224.088-.1.088-.044.026a1.441,1.441,0,0,0-.193.114c-.092-.039-.224-.083-.369-.136a6.008,6.008,0,0,1-.751-.3,3.319,3.319,0,0,0-.79-.351v-.088l-1.686-.755-.382.088-.127.149-.228.031a1.822,1.822,0,0,0-.922.294c-.11.031-.356.083-.439.105-.689.14-1.282.268-1.317.878l-.439.035H72.59l-.048-.075a1.563,1.563,0,0,0-1.348-.878,1.413,1.413,0,0,0-.233,0,14.8,14.8,0,0,0-3.451.777h0l-.1.057-.044.026a2.154,2.154,0,0,0-1.185,1.172,8.219,8.219,0,0,1-.8.351c-.72.281-1.234.483-1.317,1.005a2.093,2.093,0,0,1-.123.329c-.364.966-.979,2.581,0,3.363a3.416,3.416,0,0,1,.4.439,3.877,3.877,0,0,0,3.389,1.642,7.419,7.419,0,0,0,.878-.053l.465-.057H69.1a15.52,15.52,0,0,1,1.638-.149,1.116,1.116,0,0,1,.215,0,1.352,1.352,0,0,0,.992.312h.189a1.269,1.269,0,0,0,.812,1.357,5.755,5.755,0,0,1,1.361.878,2.222,2.222,0,0,0-.439,1.7,1.888,1.888,0,0,0,1.453,1.379c.268.1.294.154.36.32.184.439.439.878,1.51,1.111a4.321,4.321,0,0,1,.584.162.847.847,0,0,0,.623.439,2.848,2.848,0,0,0,.628.079,3.148,3.148,0,0,0,1.361-.36c.11-.048.246-.1.4-.149h.04a6.1,6.1,0,0,0,3.328-2.459,4.54,4.54,0,0,0,.979-2.151.214.214,0,0,1,.022-.123l.206-.105.044-.022.083-.057.04-.031a1.159,1.159,0,0,0,.373-1.062,1.111,1.111,0,0,0-.571-.729l.114-.088a2.844,2.844,0,0,0,.878-2.1,1.585,1.585,0,0,0-.913-1.207l-.176-.088a3.171,3.171,0,0,1-.8-.47c-.039-.07.083-.4.145-.553a7.682,7.682,0,0,0,.439-3.745c-.119-.755-.263-1.7-1.023-1.818a.684.684,0,0,0-.132,0Z" transform="translate(-35.584 -57.589)"/><path class="b" d="M117.638,111.454c-.268.039-.439.29-.527.685v.1l.04.088a1.317,1.317,0,0,1,.044,1.014c-.075.127-.158.246-.233.356-.233.342-.558.812-.145,1.26a.812.812,0,0,1,.25.518,1.962,1.962,0,0,0,.039.2c.083.36.531.566.935.61h.171a.909.909,0,0,0,.878-.474,4.488,4.488,0,0,0-.439-3.372C118.4,111.919,118.1,111.392,117.638,111.454Z" transform="translate(-65.428 -62.546)"/><path class="a" d="M117.3,111.035c.408,0,.7.5.935,1a4.665,4.665,0,0,1,.439,3.372.909.909,0,0,1-.878.474h-.171c-.4-.044-.852-.25-.935-.61a1.984,1.984,0,0,1-.039-.2.812.812,0,0,0-.25-.518c-.413-.439-.088-.918.145-1.26.075-.11.158-.228.233-.356a1.317,1.317,0,0,0-.044-1.014l-.04-.088v-.1c.066-.4.259-.645.527-.685h.075m0-.329h-.123a1.032,1.032,0,0,0-.8.953v.1l.026.189.04.092a1.022,1.022,0,0,1,.057.711c-.066.114-.136.22-.206.321a1.273,1.273,0,0,0-.127,1.686.483.483,0,0,1,.167.356.856.856,0,0,0,.044.211,1.369,1.369,0,0,0,1.22.878h.206a1.247,1.247,0,0,0,1.172-.663,4.752,4.752,0,0,0-.439-3.657c-.184-.382-.566-1.181-1.234-1.181Z" transform="translate(-65.011 -62.131)"/><path class="b" d="M76.768,3.128a1.317,1.317,0,0,0,.4.066h.707l.066.026a1.035,1.035,0,0,0,.14.061.79.79,0,0,1,.268.127,1.691,1.691,0,0,0,.263.184l.136.083c.176.114.342.211.342.211l.439.32.351-.58v-.11A.509.509,0,0,0,79.6,3.08c-.066-.044-.25-.2-.439-.356a.584.584,0,0,0,.092-.25h.4l.18.1.329.083.048,0a.7.7,0,0,0,.439-.211l.083-.07a2.038,2.038,0,0,0,.167-.132h2.779l.1-.123a.347.347,0,0,0,.066-.3c0-.061,0-.136-.2-.487l-.079-.145-.162-.022c-.681-.088-.724-.088-.742-.088h-.136a.9.9,0,0,0-.338-.241L82.146.81H81.9a1.119,1.119,0,0,0-.316.061L81.4.893a.939.939,0,0,0-.215.026.439.439,0,0,0-.329.246l-.061.083-.22.022H79.9a2.4,2.4,0,0,1-.255,0,.527.527,0,0,0-.509.32h-.123a.391.391,0,0,0-.149-.224.47.47,0,0,0-.558.044h0l-.176.127L78,1.613a.593.593,0,0,0-.233.088h-.053a.632.632,0,0,0-.277.14,1.116,1.116,0,0,0-.149.206l-.176.026-.413.2-.233.307v.11a.439.439,0,0,0,.3.435Z" transform="translate(-42.905 -0.481)"/><path class="a" d="M81.821.389l.061.031a.9.9,0,0,1,.338.241h.136l.738.088.162.022.079.145c.2.351.2.439.2.487a.347.347,0,0,1-.066.3l-.1.123H80.587a2.017,2.017,0,0,1-.167.132l-.092.057a.562.562,0,0,1-.237.136l-.2.075h-.061L79.5,2.145l-.18-.1h-.4a.584.584,0,0,1-.092.25c.184.158.369.312.439.356a.509.509,0,0,1,.277.439V3.2l-.351.58-.439-.32s-.167-.1-.342-.211l-.136-.083a1.682,1.682,0,0,1-.263-.184.791.791,0,0,0-.268-.127A1.039,1.039,0,0,1,77.6,2.8l-.066-.026h-.707a1.317,1.317,0,0,1-.4-.066.439.439,0,0,1-.281-.439v-.1l.233-.307.382-.119.176-.026a1.116,1.116,0,0,1,.149-.206.632.632,0,0,1,.29-.154h.053a.593.593,0,0,1,.233-.088l.127-.075.176-.127h0A.57.57,0,0,1,78.3.947a.378.378,0,0,1,.378.294H78.8a.527.527,0,0,1,.522-.329,2.4,2.4,0,0,0,.255,0h.676l.22-.022L80.53.806a.439.439,0,0,1,.329-.334.94.94,0,0,1,.215,0h.184a1.12,1.12,0,0,1,.316-.061h.246m0-.329h-.246a1.317,1.317,0,0,0-.369.04h-.14a1.453,1.453,0,0,0-.259.031A.808.808,0,0,0,80.288.5h-.738a2.195,2.195,0,0,1-.219,0,.878.878,0,0,0-.571.193h-.022A.711.711,0,0,0,78.321.56a.948.948,0,0,0-.514.167h0s-.119.092-.162.119l-.061.04a1.053,1.053,0,0,0-.25.092h0a.878.878,0,0,0-.417.224,1.227,1.227,0,0,0-.11.136h-.07l-.386.119-.162.119-.233.307-.066.2v.193a.76.76,0,0,0,.5.746,1.581,1.581,0,0,0,.443.088h.641a1.062,1.062,0,0,0,.171.07.7.7,0,0,1,.154.066,1.979,1.979,0,0,0,.307.215l.132.083.342.211.4.3.461-.114.351-.58.044-.206v-.11a.948.948,0,0,0-.224-.522l.11.026h.224a2.755,2.755,0,0,0,.268-.075.878.878,0,0,0,.351-.2.439.439,0,0,1,.053-.044l.075-.057h2.691l.241-.123.1-.119a.69.69,0,0,0,.14-.558,1.48,1.48,0,0,0-.237-.606L83.55.626,83.309.473,83.142.446c-.593-.079-.711-.088-.76-.092a1.286,1.286,0,0,0-.364-.237L81.952.091,81.821.06Z" transform="translate(-42.58 -0.06)"/><path class="b" d="M20.59,98.425a4.553,4.553,0,0,0-1.418-1.62,1.014,1.014,0,0,1-.5-.878,1.317,1.317,0,0,0-.373-.878c-.044-.039-.031-.136.035-.4a2.59,2.59,0,0,0-.562-2.494,3.13,3.13,0,0,1-.325-1.791,1.327,1.327,0,0,0-.382-1.278c-.123-.092-.136-.439-.149-.812a2.914,2.914,0,0,0-1.058-2.524,1.932,1.932,0,0,0-1.221-.654h0a.878.878,0,0,0-.544.189c-.07-.061-.162-.158-.237-.237-.439-.483-1.4-1.484-2.634-.334-.04.048-.088.11-.149.176A5.178,5.178,0,0,0,9.5,88.1v.22c.031.628.053,1.119-.2,1.361s-.781.29-1.646.2a19.015,19.015,0,0,1-3.328-.439c-1.686-.373-2.59-.514-3.021-.119a.672.672,0,0,0-.193.6c-.035,1.357,0,3.657.667,4.048a.562.562,0,0,0,.575,0l.07-.044.044-.066.07-.132c.04-.07.14-.263.193-.285s.057,0,.171.114a6.381,6.381,0,0,1,.465.522c.4.474.659.786.992.65a.562.562,0,0,0,.285-.575l.167.215.075.1a.992.992,0,0,0,.536.342.948.948,0,0,1,.575.47,1.383,1.383,0,0,0,.768.672.294.294,0,0,1,.2.145l.158.241c.386.588,1.027,1.576,1.84,1.576H9.2a1.646,1.646,0,0,0,.439.645,2.546,2.546,0,0,0,1.708.645h.193a3.318,3.318,0,0,1,.364.206c.439.259.948.584,1.383.369l.189-.105c.255-.149.369-.215.931.312a4.306,4.306,0,0,0,2.718,1.44h.149a1.866,1.866,0,0,0,1.343-.773l.031-.026c.07-.066.193-.18,1.014,0,.707.167,1.256.04,1.5-.351.18-.29.246-.812-.439-1.668A1.578,1.578,0,0,1,20.59,98.425Z" transform="translate(-0.623 -47.248)"/><path class="a" d="M11.946,83.7a2.158,2.158,0,0,1,1.484.878c.075.079.167.176.237.237a.878.878,0,0,1,.544-.189h0a1.932,1.932,0,0,1,1.221.654,2.905,2.905,0,0,1,1.058,2.524c0,.356.026.72.149.812.439.325.408.808.382,1.278a3.13,3.13,0,0,0,.325,1.791,2.59,2.59,0,0,1,.566,2.489c-.066.268-.079.364-.035.4a1.317,1.317,0,0,1,.373.878,1.014,1.014,0,0,0,.5.878,4.553,4.553,0,0,1,1.418,1.62,1.582,1.582,0,0,0,.123.2c.7.878.637,1.379.439,1.668a1.014,1.014,0,0,1-.926.439,2.53,2.53,0,0,1-.571-.07,3.125,3.125,0,0,0-.707-.11c-.206,0-.268.053-.307.092l-.031.026a1.866,1.866,0,0,1-1.313.755h-.149a4.306,4.306,0,0,1-2.718-1.44c-.334-.316-.514-.439-.654-.439a.571.571,0,0,0-.277.105l-.189.105a.7.7,0,0,1-.312.07,2.265,2.265,0,0,1-1.071-.439,3.327,3.327,0,0,0-.364-.206H10.95a2.546,2.546,0,0,1-1.708-.645,1.646,1.646,0,0,1-.439-.645H8.535c-.812,0-1.453-.988-1.84-1.576l-.158-.241a.294.294,0,0,0-.2-.114,1.383,1.383,0,0,1-.777-.676.948.948,0,0,0-.575-.47.992.992,0,0,1-.536-.342l-.075-.1-.167-.215a.562.562,0,0,1-.285.575.4.4,0,0,1-.158.031c-.263,0-.5-.285-.834-.68a6.376,6.376,0,0,0-.465-.522c-.114-.11-.167-.114-.171-.114s-.154.215-.193.285l-.07.132-.044.066-.07.044a.6.6,0,0,1-.3.088.54.54,0,0,1-.272-.075c-.663-.391-.7-2.691-.667-4.048a.672.672,0,0,1,.193-.6,1.128,1.128,0,0,1,.825-.246,13.027,13.027,0,0,1,2.2.325,19.011,19.011,0,0,0,3.328.439,6.487,6.487,0,0,0,.672.04,1.462,1.462,0,0,0,.975-.237c.255-.241.233-.733.2-1.361v-.22A5.12,5.12,0,0,1,10.643,84.4c.061-.066.11-.127.149-.176a1.7,1.7,0,0,1,1.146-.531m0-.329h0a2.037,2.037,0,0,0-1.37.619l-.026.031-.145.171a5.43,5.43,0,0,0-1.66,3.446v.22c.022.479.044.97-.1,1.106-.044.044-.215.149-.746.149a5.873,5.873,0,0,1-.637-.04H7.222a18.966,18.966,0,0,1-3.266-.439,13.107,13.107,0,0,0-2.27-.334,1.431,1.431,0,0,0-1.054.338,1,1,0,0,0-.277.852c-.1,3.771.6,4.18.83,4.316a.878.878,0,0,0,.439.123.922.922,0,0,0,.47-.136l.07-.04.11-.11.044-.066.061-.105c.1.105.206.233.307.36.373.439.667.8,1.089.8a.755.755,0,0,0,.571-.263,1.4,1.4,0,0,0,.544.294.641.641,0,0,1,.4.338,1.717,1.717,0,0,0,.948.808h.022l.14.211h0c.439.645,1.124,1.725,2.116,1.725h.031a1.967,1.967,0,0,0,.439.549,2.845,2.845,0,0,0,1.91.733h.11c.061.031.2.114.263.154a2.573,2.573,0,0,0,1.256.5,1.031,1.031,0,0,0,.461-.105l.2-.11a.589.589,0,0,1,.176,0,1.646,1.646,0,0,1,.439.329,4.6,4.6,0,0,0,2.942,1.528h.176a2.16,2.16,0,0,0,1.554-.878h.079a2.972,2.972,0,0,1,.632.1,2.876,2.876,0,0,0,.645.079,1.343,1.343,0,0,0,1.207-.575c.237-.382.347-1.049-.483-2.055l-.066-.105-.026-.053a4.829,4.829,0,0,0-1.519-1.73.7.7,0,0,1-.36-.654,1.756,1.756,0,0,0-.382-.992l.04-.18a2.911,2.911,0,0,0-.6-2.748,2.783,2.783,0,0,1-.277-1.594,1.638,1.638,0,0,0-.479-1.528,3.557,3.557,0,0,1-.053-.588,3.242,3.242,0,0,0-1.172-2.761,2.169,2.169,0,0,0-1.436-.738,1.186,1.186,0,0,0-.5.105l-.048-.053a2.513,2.513,0,0,0-1.725-.966Z" transform="translate(-0.202 -46.789)"/><path class="b" d="M44.436,68.91a2.859,2.859,0,0,0,1.708-2.665.8.8,0,0,1,0-.092.878.878,0,0,0,.812.211,2.257,2.257,0,0,0,1.66-1.19.843.843,0,0,1,.272-.391,1.014,1.014,0,0,0,.378-.97v-.079c0-.04.04-.184.29-.439a1.124,1.124,0,0,0,.342-.808,2.151,2.151,0,0,0-.672-1.431h0a6.275,6.275,0,0,0-.944-.694,4.332,4.332,0,0,1-.852-.628c-.075-.4-.659-1.212-1.146-1.238a.5.5,0,0,0-.514.408q-.044.145-.079.237a4.522,4.522,0,0,0-.61-1.756.821.821,0,0,0-.645-.426,2.336,2.336,0,0,0-1.844.76A2.792,2.792,0,0,1,40,58.242h-.048a6.379,6.379,0,0,1-2.384-.878,2.331,2.331,0,0,0-.97-.4,2.67,2.67,0,0,0-1.629.228,1.463,1.463,0,0,0-.241.171c-.088.075-.149.127-.878.127-.878,0-2.7.738-2.7,1.343a.391.391,0,0,0,.167.321,1,1,0,0,0-.119.119.619.619,0,0,1-.558.158.619.619,0,0,0-.47.14,3.978,3.978,0,0,0-1.383,2.336,5.269,5.269,0,0,1-.527,1.466,2.876,2.876,0,0,0-.4,1.238c0,.171-.11.316-.316.562a2.406,2.406,0,0,0-.606,1c-.18.768-.281,1.317.075,1.545s.619-.088.724-.176l.092-.079v-.123a1.853,1.853,0,0,1,.439-1.032.72.72,0,0,0,.588-.136,1.4,1.4,0,0,0,.36-1.058V64.9a.351.351,0,0,1,.035-.114.72.72,0,0,1,.162.167.667.667,0,0,0,.878.272,1.049,1.049,0,0,0,.342-1.238.988.988,0,0,0-.522-.536c-.1-.057-.162-.1-.171-.127s-.026-.255.347-.878a1.721,1.721,0,0,1,1.146.127,1.436,1.436,0,0,1,.795,1.207c.119.439.241,1.493-.158,1.673a1.66,1.66,0,0,0-.975,1.128.465.465,0,0,0,.206.439.878.878,0,0,0,.839-.145c.878-.479,1.234-.2,1.48.14a1.049,1.049,0,0,0,.935.391c.268,0,.408,0,.549.189a.988.988,0,0,0,.742.479.439.439,0,0,1,.294.127,1.865,1.865,0,0,1,.347.566c.162.342.312.663.645.632s.439-.391.566-.76c.04-.136.075-.233.1-.307a1.4,1.4,0,0,1,.07.206,4.184,4.184,0,0,1,.044.5c.057.944.11,1.48.509,1.585h.11a.588.588,0,0,0,.474-.325,2.016,2.016,0,0,0,.263-.61c.066-.233.1-.307.2-.36a.588.588,0,0,0,.312-.25.65.65,0,0,0,.04-.522.847.847,0,0,1,.224-.619,1.084,1.084,0,0,0,.637-.588.509.509,0,0,0,0-.342.932.932,0,0,0,.22.11,1.927,1.927,0,0,0,1.155.044,2.112,2.112,0,0,0-.8,1.655c0,.263.057.878.5.983.329.075.65-.2.988-.817a.917.917,0,0,1,.316.035A2.059,2.059,0,0,0,44.436,68.91ZM43.295,61.2l-.088-.053c.057-.07.105-.136.158-.2A.785.785,0,0,0,43.295,61.2Zm-.483,5.347a1.914,1.914,0,0,0,.136-.975,1.708,1.708,0,0,1,.053-.61.127.127,0,0,1,.053,0,.575.575,0,0,1,.171.031.584.584,0,0,1,.189.439,2.046,2.046,0,0,1-.588,1.194l-.057,0A.438.438,0,0,0,42.812,66.544Zm-2.744-1.6a1.431,1.431,0,0,0-.975.483,2.148,2.148,0,0,1-.689.127,1.7,1.7,0,0,0,.509-.878c.154-.514.465-.751.7-.76h0a.228.228,0,0,1,.233.154,4.113,4.113,0,0,0,.32.6,3.679,3.679,0,0,1,.228.4A.6.6,0,0,0,40.068,64.941Z" transform="translate(-15.03 -31.961)"/><path class="a" d="M35.591,56.5h.54a2.331,2.331,0,0,1,.97.4,6.379,6.379,0,0,0,2.384.878h.048a2.66,2.66,0,0,0,.8.114,2.6,2.6,0,0,0,1.8-.637,2.5,2.5,0,0,1,1.642-.716,1.5,1.5,0,0,1,.215,0,.821.821,0,0,1,.623.439,4.522,4.522,0,0,1,.61,1.756l.079-.237a.5.5,0,0,1,.487-.413h.026c.487.026,1.071.843,1.146,1.238a4.333,4.333,0,0,0,.852.628,6.275,6.275,0,0,1,.944.694h0a2.151,2.151,0,0,1,.672,1.431,1.124,1.124,0,0,1-.342.808c-.25.241-.285.386-.29.439v.079a1.014,1.014,0,0,1-.356.97.843.843,0,0,0-.272.391,2.257,2.257,0,0,1-1.66,1.19H46.29a.777.777,0,0,1-.6-.224.808.808,0,0,0,0,.092,2.854,2.854,0,0,1-1.708,2.665,1.822,1.822,0,0,1-.79.18,3.184,3.184,0,0,1-.593-.07,1.874,1.874,0,0,0-.277-.044h-.04c-.3.553-.588.83-.878.83a.437.437,0,0,1-.105,0c-.439-.1-.487-.72-.5-.983a2.112,2.112,0,0,1,.768-1.66,1.756,1.756,0,0,1-.5.07,1.866,1.866,0,0,1-.65-.114.93.93,0,0,1-.22-.11.509.509,0,0,1,0,.342,1.085,1.085,0,0,1-.6.588.847.847,0,0,0-.193.632.65.65,0,0,1-.04.522.588.588,0,0,1-.312.25c-.1.053-.132.127-.2.36a2.015,2.015,0,0,1-.263.61.588.588,0,0,1-.474.325h-.11c-.4-.105-.439-.641-.509-1.585a4.176,4.176,0,0,0-.044-.5,1.408,1.408,0,0,0-.07-.206c-.026.075-.061.171-.1.307-.105.369-.233.733-.566.76h-.044c-.3,0-.439-.312-.6-.637a1.866,1.866,0,0,0-.347-.566.439.439,0,0,0-.294-.127.988.988,0,0,1-.742-.479c-.14-.176-.281-.184-.549-.189a1.049,1.049,0,0,1-.935-.391.812.812,0,0,0-.685-.4,1.682,1.682,0,0,0-.795.255,1.317,1.317,0,0,1-.575.189.5.5,0,0,1-.272-.075.465.465,0,0,1-.206-.439A1.66,1.66,0,0,1,31.644,65c.4-.18.277-1.225.158-1.673a1.436,1.436,0,0,0-.795-1.207,1.831,1.831,0,0,0-.781-.171,1.255,1.255,0,0,0-.364.044c-.373.645-.36.852-.347.878a.555.555,0,0,0,.171.127.988.988,0,0,1,.5.558,1.049,1.049,0,0,1-.338,1.26.575.575,0,0,1-.277.07.755.755,0,0,1-.588-.342.72.72,0,0,0-.162-.167.351.351,0,0,0-.035.114v.224a1.4,1.4,0,0,1-.378,1.036.7.7,0,0,1-.439.141h-.154a1.853,1.853,0,0,0-.439,1.032v.123l-.092.079a.852.852,0,0,1-.5.241.4.4,0,0,1-.22-.066c-.356-.211-.255-.777-.075-1.545a2.406,2.406,0,0,1,.593-1.027c.206-.246.325-.391.316-.562a2.876,2.876,0,0,1,.4-1.238,5.268,5.268,0,0,0,.527-1.466A3.978,3.978,0,0,1,29.7,59.126a.707.707,0,0,1,.391-.149h.079a.515.515,0,0,0,.119,0,.58.58,0,0,0,.439-.171,1,1,0,0,1,.119-.119.391.391,0,0,1-.167-.32c0-.606,1.809-1.343,2.7-1.343.729,0,.79-.053.878-.127a1.46,1.46,0,0,1,.241-.171,2.059,2.059,0,0,1,1.089-.25m7.257,4.294a.786.786,0,0,1,.07-.25c-.053.061-.1.127-.158.2l.088.053m-4.891,4.355A2.147,2.147,0,0,0,38.642,65a1.519,1.519,0,0,1,.922-.483h.053a.6.6,0,0,1,.342.132,3.682,3.682,0,0,0-.228-.4,4.115,4.115,0,0,1-.321-.6.228.228,0,0,0-.233-.154h0c-.237,0-.549.246-.7.76a1.7,1.7,0,0,1-.509.878m4.351,1.062.057-.026a2.046,2.046,0,0,0,.588-1.194.584.584,0,0,0-.189-.439A.576.576,0,0,0,42.6,64.5a.127.127,0,0,0-.053,0,1.708,1.708,0,0,0-.053.61,1.914,1.914,0,0,1-.136.975.439.439,0,0,1-.044.075m-6.726-9.992h0a2.357,2.357,0,0,0-1.251.294,1.973,1.973,0,0,0-.294.206,2.049,2.049,0,0,1-.663.048c-.878,0-3.029.72-3.029,1.673a.76.76,0,0,0,.048.263.41.41,0,0,1-.11,0h-.053a.543.543,0,0,0-.145,0,.992.992,0,0,0-.6.206,4.351,4.351,0,0,0-1.523,2.555,5.005,5.005,0,0,1-.492,1.37,3.113,3.113,0,0,0-.439,1.4,1.367,1.367,0,0,1-.237.334,2.691,2.691,0,0,0-.663,1.168c-.167.724-.36,1.55.224,1.9a.737.737,0,0,0,.391.114,1.146,1.146,0,0,0,.72-.32l.092-.083.11-.2v-.119a2.344,2.344,0,0,1,.233-.742h.026a1.01,1.01,0,0,0,.68-.215,1.357,1.357,0,0,0,.439-.961.948.948,0,0,0,.5.149A.922.922,0,0,0,30,65.1a1.357,1.357,0,0,0,.5-1.66,1.286,1.286,0,0,0-.654-.707,2.748,2.748,0,0,1,.211-.439H30.2a1.479,1.479,0,0,1,.637.14,1.111,1.111,0,0,1,.615.953v.04a2.2,2.2,0,0,1,0,1.3,1.927,1.927,0,0,0-1.159,1.4.79.79,0,0,0,.351.738.847.847,0,0,0,.439.127,1.541,1.541,0,0,0,.733-.233,1.44,1.44,0,0,1,.637-.211.5.5,0,0,1,.439.259,1.343,1.343,0,0,0,1.19.527c.25,0,.255,0,.3.066a1.317,1.317,0,0,0,.97.6h.035a.466.466,0,0,1,.088.062,2.322,2.322,0,0,1,.255.439c.167.351.386.821.878.821h.075a.747.747,0,0,0,.439-.2c.057.733.184,1.273.72,1.414a.708.708,0,0,0,.193.026.878.878,0,0,0,.751-.479,2.12,2.12,0,0,0,.373-.707A.759.759,0,0,1,39.2,69.2a.913.913,0,0,0,.439-.364.962.962,0,0,0,.07-.79.786.786,0,0,1,.1-.277,1.348,1.348,0,0,0,.7-.7,2.374,2.374,0,0,0,.307.057,2.2,2.2,0,0,0-.347,1.317c0,.307.075,1.133.764,1.282a.8.8,0,0,0,.176,0c.483,0,.83-.439,1.062-.817h.075a3.288,3.288,0,0,0,.654.079,2.152,2.152,0,0,0,.931-.211,3.363,3.363,0,0,0,1.9-2.524,1.264,1.264,0,0,0,.259,0,1.874,1.874,0,0,0,.268,0,2.586,2.586,0,0,0,1.914-1.379.514.514,0,0,1,.18-.259,1.343,1.343,0,0,0,.47-1.234v-.04a.878.878,0,0,1,.176-.224,1.44,1.44,0,0,0,.439-1.04,2.507,2.507,0,0,0-.768-1.668,6.453,6.453,0,0,0-1-.738,8.283,8.283,0,0,1-.724-.5c-.154-.522-.786-1.379-1.431-1.414h-.044a.768.768,0,0,0-.413.114,10.358,10.358,0,0,0-.47-1.045,1.128,1.128,0,0,0-.878-.606,1.617,1.617,0,0,0-.255-.022,2.819,2.819,0,0,0-1.875.878,2.274,2.274,0,0,1-1.563.54,2.416,2.416,0,0,1-.7-.1h-.07a6.265,6.265,0,0,1-2.274-.852,2.582,2.582,0,0,0-1.111-.439c-.228,0-.408-.026-.566-.026Zm3.135,8.342.053-.158a.76.76,0,0,1,.378-.518,3.382,3.382,0,0,0,.193.378,1.629,1.629,0,0,0-.6.29Z" transform="translate(-14.579 -31.533)"/><path class="b" d="M98.226,53.427l-.105.07a3.794,3.794,0,0,1-.878.483l-.114.039-.061.1c-.105.176-.206.373-.316.575a5.311,5.311,0,0,1-.878,1.317,1.128,1.128,0,0,1-.378.263.4.4,0,0,1,0-.263c.1-.325.3-1,.439-1.379l.079-.255-.233-.132a.517.517,0,0,1-.136-.14,1.73,1.73,0,0,0-1.5-.724.777.777,0,0,0-.632.588,1.629,1.629,0,0,1-.439.847s-.119-.044-.3-.408l-.061-.123c-.6-1.234-1.422-2.928-3.609-2.41h-.057a2.41,2.41,0,0,0-.922.94.7.7,0,0,0-.558-.026.439.439,0,0,0-.219.255.953.953,0,0,0,.066.579v.07a.508.508,0,0,1-.149-.136.439.439,0,0,1-.1-.307,4.944,4.944,0,0,1,.364-.7c.088-.149.171-.285.215-.382a1.058,1.058,0,0,0-.439-1.19.439.439,0,0,0-.623.206c-.176.325-.373.685-.465.843a.544.544,0,0,1-.439-.092,2.2,2.2,0,0,0-2.02-.255c-.14.04-.294.07-.439.105-.492.1-1,.2-1.19.606a.878.878,0,0,0,.088.808c.105.189.136.351.088.417a.606.606,0,0,1-.522.1,1.923,1.923,0,0,1-.562-.342,1.585,1.585,0,0,0-1-.439,2.161,2.161,0,0,0,.277-.29,3.578,3.578,0,0,0,.588-1.335.439.439,0,0,0-.246-.5c-.364-.158-.839.193-1.128.584l-.158.215a1.787,1.787,0,0,1-.685.667,2.538,2.538,0,0,1-.623.136c-.707.11-1.756.272-2.112,1.216l-.044.11.044.114c.136.36.632,1.515,1.365,1.343a2.858,2.858,0,0,1,1.427.878,1.039,1.039,0,0,0,.663.439c.127.048.465.171.487.255a6.68,6.68,0,0,0,.141,1,5.486,5.486,0,0,1,.149,1.269,2.072,2.072,0,0,0,.68,1.91,2.335,2.335,0,0,1,.193,1.036,1.848,1.848,0,0,1-.1.2c-.263.54-.474.979-.386,1.282a1.7,1.7,0,0,1-.048.961l-.237.206.193.246a1.8,1.8,0,0,0,1.19.676,20.489,20.489,0,0,0,2.063.255,3.746,3.746,0,0,1,.843.2l.07.228.259-.14a.72.72,0,0,0,.241.777.988.988,0,0,0,.988.079,1.014,1.014,0,0,1,.61.364l.079.263.277-.035a2.854,2.854,0,0,0,.47-.127.684.684,0,0,0,.145-.053,3.806,3.806,0,0,1,.878.233,4.342,4.342,0,0,0,.839.742l.277.215.2-.29c.061-.092.119-.18.171-.268a2.6,2.6,0,0,1,.219-.325c.088-.11.18-.237.277-.373a4.232,4.232,0,0,1,1.1-1.172,2.243,2.243,0,0,0,.7-.746c.154-.25.2-.3.4-.3h.219a4.391,4.391,0,0,0,2.2-.382,4.235,4.235,0,0,1,.47-.211c.338-.14.658-.272.7-.6s-.215-.553-.5-.768-.514-.347-.724-.479c-.47-.281-.637-.4-.694-.707a3.284,3.284,0,0,0-.645-1.273,3.4,3.4,0,0,1-.277-.439.79.79,0,0,1,.277-1.084,1.66,1.66,0,0,1,.4-.176.483.483,0,0,0,.6-.285.729.729,0,0,0-.224-.878.981.981,0,0,1,.228-.1,2.521,2.521,0,0,1,.474-.092,1.7,1.7,0,0,0,1.449-.83c-.369.983-.391,1.352-.154,1.559a.439.439,0,0,0,.562,0,.957.957,0,0,0,.566-.751,2.459,2.459,0,0,1,.487-1.005,7.069,7.069,0,0,0,1-1.528,1.616,1.616,0,0,0-.211-1.66A.742.742,0,0,0,98.226,53.427Z" transform="translate(-42.693 -28.508)"/><path class="a" d="M80.232,50.367a.492.492,0,0,1,.193.04.439.439,0,0,1,.246.483,3.578,3.578,0,0,1-.553,1.339,2.162,2.162,0,0,1-.277.29h.066a1.712,1.712,0,0,1,.935.439,1.923,1.923,0,0,0,.562.342,1.263,1.263,0,0,0,.171,0,.461.461,0,0,0,.351-.114c.048-.066,0-.228-.088-.417a.878.878,0,0,1-.088-.808c.189-.4.7-.5,1.19-.606.158-.035.312-.066.439-.105a2.7,2.7,0,0,1,.825-.127A1.778,1.778,0,0,1,85.4,51.5a.483.483,0,0,0,.321.1h.114c.092-.158.29-.518.465-.843a.439.439,0,0,1,.4-.263.5.5,0,0,1,.22.057,1.058,1.058,0,0,1,.439,1.19c-.044.1-.127.233-.215.382a4.946,4.946,0,0,0-.364.7.439.439,0,0,0,.1.307.51.51,0,0,0,.149.136V53.2a.953.953,0,0,1-.066-.579.439.439,0,0,1,.22-.255.461.461,0,0,1,.211-.048,1.111,1.111,0,0,1,.347.075,2.41,2.41,0,0,1,.922-.94h.057a3.318,3.318,0,0,1,.768-.1c1.624,0,2.314,1.427,2.841,2.507l.061.123c.18.364.3.408.3.408a1.629,1.629,0,0,0,.439-.847.777.777,0,0,1,.632-.588.972.972,0,0,1,.162,0,1.8,1.8,0,0,1,1.339.738.518.518,0,0,0,.136.14l.233.132-.079.255c-.119.382-.325,1.054-.439,1.379a.4.4,0,0,0,0,.263,1.128,1.128,0,0,0,.378-.263,5.311,5.311,0,0,0,.878-1.317c.11-.2.211-.4.316-.575l.061-.1.114-.04a3.794,3.794,0,0,0,.878-.483l.105-.07a.953.953,0,0,1,.518-.176.654.654,0,0,1,.413.145,1.589,1.589,0,0,1,.211,1.66,7.07,7.07,0,0,1-1.027,1.515,2.459,2.459,0,0,0-.5,1.027.957.957,0,0,1-.566.751.588.588,0,0,1-.285.083.408.408,0,0,1-.277-.1c-.237-.206-.215-.575.154-1.559a1.7,1.7,0,0,1-1.449.83,2.523,2.523,0,0,0-.474.092.98.98,0,0,0-.228.1.729.729,0,0,1,.224.878.5.5,0,0,1-.439.312.439.439,0,0,1-.149-.026,1.661,1.661,0,0,0-.4.176.79.79,0,0,0-.277,1.084,3.4,3.4,0,0,0,.277.439,3.283,3.283,0,0,1,.645,1.273c.057.312.224.439.694.707.211.132.439.277.724.479s.54.439.5.768-.364.439-.7.6a4.236,4.236,0,0,0-.47.211A4.013,4.013,0,0,1,93,64.662h-.439c-.206,0-.25.053-.4.3a2.242,2.242,0,0,1-.7.746,4.233,4.233,0,0,0-1.111,1.181c-.1.136-.189.263-.277.373a2.6,2.6,0,0,0-.22.325c-.053.088-.11.176-.171.268l-.2.29-.277-.215a4.343,4.343,0,0,1-.839-.746,3.808,3.808,0,0,0-.878-.233.684.684,0,0,1-.145.053,2.846,2.846,0,0,1-.47.127l-.277.035-.079-.263a1.014,1.014,0,0,0-.61-.364.83.83,0,0,1-.413.1.992.992,0,0,1-.575-.176.72.72,0,0,1-.241-.777l-.263.132-.075-.237a3.745,3.745,0,0,0-.839-.2,20.5,20.5,0,0,1-2.063-.255,1.8,1.8,0,0,1-1.19-.676l-.193-.246.237-.206a1.7,1.7,0,0,0,.048-.961,2.088,2.088,0,0,1,.386-1.269,1.856,1.856,0,0,0,.1-.2,2.336,2.336,0,0,0-.193-1.014,2.072,2.072,0,0,1-.681-1.91,5.485,5.485,0,0,0-.149-1.269,6.689,6.689,0,0,1-.141-1c0-.083-.36-.206-.487-.255-.29-.1-.558-.2-.663-.439a3.073,3.073,0,0,0-1.387-.878h-.04a.592.592,0,0,1-.145,0c-.654,0-1.093-1.027-1.22-1.361l-.044-.114.044-.11c.334-.944,1.4-1.106,2.112-1.216a2.536,2.536,0,0,0,.623-.136,1.787,1.787,0,0,0,.694-.654l.158-.215a1.383,1.383,0,0,1,.935-.623m0-.329h0a1.686,1.686,0,0,0-1.2.76l-.154.215a1.5,1.5,0,0,1-.615.575,4.172,4.172,0,0,1-.5.1c-.738.114-1.971.3-2.375,1.427l-.04.114v.228l.044.114c.176.47.681,1.572,1.528,1.572a.989.989,0,0,0,.193,0,3.244,3.244,0,0,1,1.089.7,1.317,1.317,0,0,0,.839.593,2.5,2.5,0,0,1,.281.11,5,5,0,0,0,.14.878,7.09,7.09,0,0,1,.149,1.128,2.468,2.468,0,0,0,.76,2.235,2.937,2.937,0,0,1,.114.707l-.044.083-.026.053a2.278,2.278,0,0,0-.408,1.506,1.9,1.9,0,0,1,0,.667l-.193.162-.039.439.193.246a2.129,2.129,0,0,0,1.4.8,19.834,19.834,0,0,0,2.112.259,2.987,2.987,0,0,1,.58.132l.022.07.224.092a1,1,0,0,0,.391.707,1.29,1.29,0,0,0,.777.246,1.212,1.212,0,0,0,.439-.079,1.136,1.136,0,0,1,.272.154l.07.224.356.228.277-.035a2.853,2.853,0,0,0,.531-.14l.083-.026a4.684,4.684,0,0,1,.606.162,6.092,6.092,0,0,0,.847.733l.277.215.474-.075.2-.29c.066-.1.123-.189.18-.277v-.026c.066-.1.127-.2.18-.268s.184-.237.29-.391a3.986,3.986,0,0,1,1.023-1.093,2.507,2.507,0,0,0,.8-.847c.026-.044.07-.114.1-.149h.478a4.311,4.311,0,0,0,2.112-.439,3.971,3.971,0,0,1,.439-.193c.382-.158.847-.347.913-.878a1.225,1.225,0,0,0-.584-1.023,8.7,8.7,0,0,0-.751-.5c-.47-.285-.514-.334-.544-.487a3.454,3.454,0,0,0-.7-1.4,3.073,3.073,0,0,1-.25-.378.465.465,0,0,1,.162-.654,1.214,1.214,0,0,1,.233-.11.761.761,0,0,0,.141,0,.825.825,0,0,0,.746-.5,1.132,1.132,0,0,0,0-.878l.206-.031a2.945,2.945,0,0,0,.782-.18.852.852,0,0,0,.255.83.729.729,0,0,0,.492.184.909.909,0,0,0,.439-.123,1.291,1.291,0,0,0,.724-.97,2.086,2.086,0,0,1,.439-.878,7.247,7.247,0,0,0,1.045-1.616,1.913,1.913,0,0,0-.312-2.037,1.01,1.01,0,0,0-.619-.215,1.273,1.273,0,0,0-.7.233l-.105.066a3.6,3.6,0,0,1-.781.439l-.114.039-.176.14-.061.105c-.11.18-.215.378-.325.588s-.255.474-.391.694c.048-.154.092-.3.132-.439V54.3l.079-.255-.154-.382-.22-.123-.04-.053a2.138,2.138,0,0,0-1.611-.878,1.839,1.839,0,0,0-.22,0,1.111,1.111,0,0,0-.878.825,2.355,2.355,0,0,1-.123.356l-.044-.1C92.059,52.615,91.269,51,89.447,51a3.6,3.6,0,0,0-.843.105H88.49a2.217,2.217,0,0,0-.843.729,1.379,1.379,0,0,0-.58-1.616.812.812,0,0,0-.373-.1A.8.8,0,0,0,86,50.56c-.127.237-.268.492-.369.672h0a2.081,2.081,0,0,0-1.414-.465,3.183,3.183,0,0,0-.926.14c-.114.035-.255.061-.4.092-.566.119-1.181.241-1.44.8a1.181,1.181,0,0,0,.1,1.1.2.2,0,0,1,0,.044.4.4,0,0,1-.1,0,2.086,2.086,0,0,1-.439-.281,4.112,4.112,0,0,0-.544-.325,3.889,3.889,0,0,0,.544-1.374.764.764,0,0,0-.439-.878.777.777,0,0,0-.321-.066Z" transform="translate(-42.277 -28.086)"/><path class="b" d="M118.392,24.382l-.1-.211h0a11.793,11.793,0,0,0-2.121-2.744,17.8,17.8,0,0,1-2.871-3.218,4.305,4.305,0,0,0-1.422-1.923,2.3,2.3,0,0,1-.206-.7,2.858,2.858,0,0,0-.479-1.282,3.24,3.24,0,0,0-1.695-1.2.878.878,0,0,1-.549-.382,1.212,1.212,0,0,0-.509-.439l-.154-.061c-1.106-.465-1.756-.654-2.09-.347a3.215,3.215,0,0,1-.566.088c-.676.075-1.519.167-1.853.689a.97.97,0,0,0-.048.878v.044a9.766,9.766,0,0,0,1.677,2.858c.215.167.211.347.18.707a1.532,1.532,0,0,0,.162,1.014,1.532,1.532,0,0,1,.083.786V19.1l-.189.026c-.193.044-.347.044-.439-.36-.048-.211-.962-1.756-1.589-1.695-.1,0-.439.079-.439.58v.119l.07.1c.184.241.391.544.487.707-.228.3-.184.645.132,1.124a15.735,15.735,0,0,0,1.234,1.453,12.731,12.731,0,0,1,1.115,1.317.878.878,0,0,0,.632.483h.057a.632.632,0,0,1,.11.228,1.6,1.6,0,0,1,.079.492c0,.171.026.619.5.619a.606.606,0,0,0,.509-.312,1.291,1.291,0,0,0,0-1.194,8.32,8.32,0,0,0-.531-.786c-.132-.176-.312-.439-.4-.575a.439.439,0,0,0,.439-.211c.215-.36-.18-.8-.492-1.1a3.2,3.2,0,0,1-.439-.522l-.04-.057c.083-.066.176-.145.268-.228.268-.233.672-.584.878-.562.022,0,.075,0,.162.123a5.517,5.517,0,0,1,.777,1.071,1.574,1.574,0,0,1-.316.14,1.269,1.269,0,0,0-.386.193.386.386,0,0,0-.114.386,4.326,4.326,0,0,0,1.936,1.809,4.081,4.081,0,0,0,.5.1c.439.061.536.1.584.281a1.976,1.976,0,0,0,1.317,1.317l.176.057a2.441,2.441,0,0,1,1.251.746c.07.088.184.233.316.413,1.155,1.537,1.962,2.432,2.634,2.432h.088a.707.707,0,0,0,.571-.47c.5-1.19.6-1.365.878-1.44a.619.619,0,0,0,.439-.329C118.787,25.26,118.612,24.874,118.392,24.382Z" transform="translate(-57.889 -6.605)"/><path class="a" d="M106.241,11.307a4.966,4.966,0,0,1,1.651.5l.154.061a1.212,1.212,0,0,1,.509.439.878.878,0,0,0,.549.382,3.24,3.24,0,0,1,1.695,1.2,2.858,2.858,0,0,1,.479,1.282,2.3,2.3,0,0,0,.206.7,4.287,4.287,0,0,1,1.4,1.923,17.891,17.891,0,0,0,2.871,3.218,11.792,11.792,0,0,1,2.121,2.744h0l.1.211c.219.492.4.878.237,1.207a.619.619,0,0,1-.439.329c-.294.075-.386.25-.878,1.44a.707.707,0,0,1-.6.461h-.088c-.663,0-1.471-.878-2.634-2.432-.132-.18-.246-.325-.316-.413a2.441,2.441,0,0,0-1.251-.746l-.176-.057a1.976,1.976,0,0,1-1.317-1.317c-.048-.18-.132-.22-.584-.281a4.083,4.083,0,0,1-.5-.1,4.256,4.256,0,0,1-1.936-1.809.386.386,0,0,1,.114-.386,1.269,1.269,0,0,1,.386-.193,1.576,1.576,0,0,0,.316-.14,5.521,5.521,0,0,0-.764-1.084c-.088-.114-.141-.119-.162-.123h0c-.233,0-.619.338-.878.562-.092.083-.184.162-.268.228l.039.057a3.2,3.2,0,0,0,.439.522c.312.3.707.742.492,1.1a.439.439,0,0,1-.382.215h-.04c.092.154.272.4.4.575a8.307,8.307,0,0,1,.5.812,1.29,1.29,0,0,1,0,1.194.606.606,0,0,1-.509.312c-.479,0-.5-.439-.5-.619a1.594,1.594,0,0,0-.079-.492.632.632,0,0,0-.11-.228h-.057a.878.878,0,0,1-.632-.483,12.733,12.733,0,0,0-1.115-1.317,15.734,15.734,0,0,1-1.234-1.453c-.316-.479-.36-.821-.132-1.124-.1-.162-.3-.465-.487-.707l-.07-.1V17.26c.026-.5.347-.571.439-.58h.035c.628,0,1.506,1.493,1.554,1.7.079.3.184.378.312.378a.5.5,0,0,0,.136,0l.189-.026v-.158a1.533,1.533,0,0,0-.083-.786,1.532,1.532,0,0,1-.162-1.014c.031-.36.035-.54-.18-.707a9.936,9.936,0,0,1-1.677-2.858v-.044a.97.97,0,0,1,.048-.878c.334-.522,1.177-.615,1.853-.689a3.212,3.212,0,0,0,.566-.088.593.593,0,0,1,.439-.149m0-.329a.975.975,0,0,0-.606.184c-.079,0-.316.04-.439.053-.751.083-1.681.184-2.094.843a1.286,1.286,0,0,0-.083,1.155l.026.061a9.552,9.552,0,0,0,1.782,2.994c.061.048.079.061.048.417a1.862,1.862,0,0,0,.211,1.221.755.755,0,0,1,.044.351c-.044-.189-.979-1.949-1.875-1.949h-.07a.847.847,0,0,0-.738.878v.123l.066.215.07.092c.132.171.268.369.364.518a1.37,1.37,0,0,0,.246,1.317A15.464,15.464,0,0,0,104.445,21a13.329,13.329,0,0,1,1.08,1.269,1.216,1.216,0,0,0,.746.615q0,.024,0,.048a1.235,1.235,0,0,1,.061.4c.035.843.593.935.834.935a.913.913,0,0,0,.79-.474,1.594,1.594,0,0,0,0-1.515,7.943,7.943,0,0,0-.553-.821c-.044-.061-.1-.136-.154-.215a.742.742,0,0,0,.189-.215.333.333,0,0,0,.039-.079,4.759,4.759,0,0,0,1.879,1.449,4.175,4.175,0,0,0,.536.1,2.248,2.248,0,0,1,.316.057,2.318,2.318,0,0,0,1.541,1.537l.176.057a2.116,2.116,0,0,1,1.1.645c.07.079.167.215.294.378v.026c1.251,1.66,2.081,2.56,2.889,2.56h.127a1.045,1.045,0,0,0,.834-.694c.47-1.1.549-1.22.676-1.251a.953.953,0,0,0,.641-.5,1.769,1.769,0,0,0-.233-1.488l-.092-.211h0a11.934,11.934,0,0,0-2.2-2.849,17.766,17.766,0,0,1-2.8-3.122,4.848,4.848,0,0,0-1.458-2.02,4.442,4.442,0,0,1-.123-.522,3.074,3.074,0,0,0-.566-1.431,3.547,3.547,0,0,0-1.853-1.317.58.58,0,0,1-.378-.268,1.524,1.524,0,0,0-.645-.531L108,11.482a5.128,5.128,0,0,0-1.756-.522Zm.439,8.2.044-.035a4.12,4.12,0,0,1,.6-.461,7.286,7.286,0,0,1,.544.689,1.414,1.414,0,0,0-.439.241.646.646,0,0,0-.162.2,3.95,3.95,0,0,0-.329-.351,2.791,2.791,0,0,1-.255-.285Z" transform="translate(-57.473 -6.175)"/><path class="c" d="M88.7,88.083c-.079-.781-.233-1.071-.878-.676s-.733.18-.786.654-.127.654-.834.654-1.466-.053-1.317-.158-.237-.342,1.229-.522a1.624,1.624,0,0,0,1.041-.724,4.352,4.352,0,0,1-.812-.729h0a3.277,3.277,0,0,0-1-.3,1.323,1.323,0,0,0-.228.066,2.445,2.445,0,0,1-.439.114v.022c-.105.391-.575,1.071-.97.549s-.742-.36-1.3-.571-.878-.68-.5-.812a.773.773,0,0,0,.439-.6l-.026-.083a4.574,4.574,0,0,0-1.01-.237c-.342,0-1.163-.127-2.033-.255a1.594,1.594,0,0,1-1.076-.623.286.286,0,0,1-.088,0c-.509-.039-.312-.277-.04-.474s-.786-1.15-1.989,0c-.817.878.053,1.387-1.071,2.2,0,0-.334.983.47.825a.962.962,0,0,1,.615.439c.241-.04.628-.154.641-.492,0-.492-.255-.961-.176-1.414s.04-.878.136-.843,0,.588.215.979a3.583,3.583,0,0,1,.492.966c0,.176.092,1.106-1.343,1.225a18.693,18.693,0,0,1-2.1,1.5c-.338.233-.237.206.079.522s-.369.97-.575.786-1.023.079-.918.839a.918.918,0,0,0,1.651.439,7.432,7.432,0,0,1,1.282-1.256c.312-.263.786-.527,1.177-.184s1.181.839.6,1.15-.1.439.316.079.575-.733.237-1.2.654.158.808.364.76.97.812.158c0,0-.053-1.071.474-.6a.558.558,0,0,0,.966.211c.439-.474.439-.316.707-.316s.369-.6.549-.079a1.365,1.365,0,0,1-.11,1.093l.913.408a4.57,4.57,0,0,1,1.844.36,8.316,8.316,0,0,1,1.559.487h1.005A1.29,1.29,0,0,1,87.6,91.6,6.1,6.1,0,0,0,88.7,88.083Zm-7.121,0c-.285.127-.6,0-.992.628s-.68-.211-.68-.211c-.369-.417.522-.786.575-1.1s.439-.5.439-.184.707.263.97.211-.022.5-.312.632Z" transform="translate(-40.7 -46.485)"/><path class="d" d="M85.5,113.963c-1-.312.079-.808.312-1.019s1.317-1.624.105-2.226-1.624-.733-1.15-1.936a7.139,7.139,0,0,0,.417-3.4c-.132-.839-.338-2.2-1.229-.4-.689,1.374-1.124,1.049-.962.478H81.974c-.149.141-.338.145-.483.386s-.18,0-.439-.105a10.518,10.518,0,0,1-1.282-.522,10.28,10.28,0,0,0-1.519-.553.7.7,0,0,1,.18-.114l-.768-.364a.439.439,0,0,1-.263.167c-.439.079-.839.079-.97.237s-1.488.285-1.488.47.206.6-.439.6-1.2.158-1.493-.026-.391-.944-1.177-.838a21.886,21.886,0,0,0-3.117.628c-.132.127-1.1.527-1.124,1s-2.041.878-2.068,1.2-1.155,2.463-.369,3.073,1.155,2.226,4.166,1.883c.913-.105,2.634-.391,2.849-.053s1.317,0,1.466.237-.439.97.369,1.317,2.2,1.317,1.8,1.651a1.277,1.277,0,0,0,.527,2.279c1.2.439.285,1.071,1.8,1.414s.733.5,1.2.6a2.116,2.116,0,0,0,1.572-.237,6.087,6.087,0,0,0,3.512-2.406c1.418-1.967.4-2.094,1.466-2.595C85.89,114.828,86.492,114.279,85.5,113.963Z" transform="translate(-36.403 -58.422)"/><path class="d" d="M117.825,112.654a1.673,1.673,0,0,1,.026,1.317c-.316.549-.733.878-.439,1.229a1.405,1.405,0,0,1,.364.878c.079.338,1.124.575,1.361.079a4.15,4.15,0,0,0-.439-3.073C118.049,111.793,117.877,112.338,117.825,112.654Z" transform="translate(-65.817 -63.004)"/><path class="e" d="M82.461,2.468l.277-.053.053-.145A.2.2,0,0,1,83,2.148c.171,0,.36-.035.465-.035h.465c.123,0,.439-.048.439-.048l.053-.105.088-.119a.123.123,0,0,1,.1-.088.878.878,0,0,1,.154,0h.259a.878.878,0,0,1,.241-.053h.176a.637.637,0,0,1,.2.14.5.5,0,0,0,.141.119s.206.035.259.035.707.088.707.088a2.07,2.07,0,0,1,.154.325c0,.053.035.105,0,.105l-2.5-.035c-.053,0-.206-.07-.259,0a.747.747,0,0,1-.206.189c-.136.105-.123.123-.224.158a1.317,1.317,0,0,1-.189.048l-.176-.035-.22-.162a.2.2,0,0,0-.136-.035h-.483S82.408,2.64,82.461,2.468Z" transform="translate(-46.258 -0.98)"/><path class="e" d="M78.933,2.866,78.744,3l-.206.123a.4.4,0,0,0-.176.048c-.083.053-.206.053-.255.105a1.144,1.144,0,0,0-.123.171.246.246,0,0,1-.119.105,1.479,1.479,0,0,1-.294.053l-.206.066-.105.14s0,.1.053.119a.878.878,0,0,0,.294.053h.707a.8.8,0,0,1,.307.105A1.1,1.1,0,0,1,79,4.28a2.951,2.951,0,0,0,.36.241l.36.224.14.1.1-.2s0-.154-.083-.171a8.093,8.093,0,0,1-.672-.544l-.053-.119.105-.088.048-.088s.088-.119,0-.189a.364.364,0,0,1-.136-.171V3.073S79.24,2.66,78.933,2.866Z" transform="translate(-43.349 -1.602)"/><path class="f" d="M20.89,99.222a4.917,4.917,0,0,0-1.466-1.756c-.94-.628-.439-1.317-.913-1.8s.707-1.317-.58-2.959c-.808-1.493,0-2.516-.628-2.985s.237-2.3-1.229-3.35c-.342-.369-1-.839-1.414-.391S13.4,83.9,11.912,85.291c-.391.474-1.7,1.831-1.642,3.17s.237,2.384-2.173,2.121c-2.748-.026-6.414-1.545-6.217-.29,0,0-.119,4.281.746,3.771.132-.211.364-.918.944-.364s1.256,1.725,1.177.707.549-.132.839.233.628.079,1.124.838.654.369.97.812,1,1.7,1.756,1.677.263.132.878.733a2.591,2.591,0,0,0,1.73.575c.316.053,1.124.812,1.545.6s.628-.549,1.488.263,2.595,2.169,3.745.681c.158-.132.263-.369,1.361-.105S21.887,100.425,20.89,99.222Z" transform="translate(-1.059 -47.636)"/><path class="g" d="M49.4,61.721c-.492-.492-1.8-1.1-1.883-1.493s-.878-1.317-1.014-.83-.211.707-.733.759a2.472,2.472,0,0,0-1.44.94c-.132.29-.522.632,0,.944,0,.158-.053.6-.575.026s-.439.132-.6.263-.5.026-.211-.369,1.1-1.545,1.519-1.651a2.415,2.415,0,0,0,1.229-.5c.29-.312-.263-1.387-.5-1.857s-1.234-.29-1.941.439a3.13,3.13,0,0,1-2.928.6c-2.094-.364-2.634-1.229-3.328-1.282a2.345,2.345,0,0,0-1.44.184c-.364.211-.158.342-1.282.342s-2.985,1.1-2.2,1.1c.707-.105,1.282-.707,2.094-.628s-.105.184-.549.272a5.146,5.146,0,0,0-1.756.918.94.94,0,0,1-.878.277c-.263-.053-1.317,1.1-1.466,2.2S28.589,64.4,28.629,65s-.733.878-.918,1.677-.312,1.541.263,1.045c0,0,.211-1.414.812-1.317s.522-.733.575-1.124.369-.659.786-.105.839-.079.628-.68-1.317-.158-.29-1.888A1.811,1.811,0,0,1,33,64.075s.439,1.7-.342,2.055-1.177,1.4-.215.878,1.532-.277,1.905.237,1,0,1.471.566.474.158.983.553.667,1.923,1.041.606.707-.439.8-.1.022,2.494.553,1.668c.294-.413.162-.878.606-1.084,0,0,.255-.053.158-.369a1.181,1.181,0,0,1,.316-1.005s.724-.272.47-.606a.351.351,0,0,0-.549,0c-.2.18-.334-.215.04-.391s.724-.961.47-1.278-.724.079-.961.294-1.826.342-1.695-.026.654.053.992-1.071,1.317-1.229,1.572-.628.839,1.1.6,1.756-.206.944.211,1.1a1.28,1.28,0,0,0,1.545-.439c.316-.6-.342-2.094.878-1.7.913.786-.211,2.015-.369,2.2,0,0-1.519.733-1.44,1.936s.575.575.878,0c.312-.417.944.237,1.831-.184a2.544,2.544,0,0,0,1.519-2.327c-.105-.913.237-.76.549-.369s1.651-.132,1.941-.878.628-.364.6-1.229c0,0-.11-.281.378-.751S49.887,62.209,49.4,61.721Z" transform="translate(-15.466 -32.381)"/><path class="h" d="M98.9,54.158a4.623,4.623,0,0,1-1.036.588,8.859,8.859,0,0,1-1.256,1.976c-.781.729-1.058.14-.922-.334.1-.325.307-1,.439-1.383a.716.716,0,0,1-.241-.246c-.342-.5-1.365-.918-1.545-.237s-.707,1.782-1.317.5-1.317-2.827-3.3-2.358a2.4,2.4,0,0,0-.878.97c-.079.154-.575-.237-.654,0s.439.913-.079.913a.79.79,0,0,1-.707-.913,11.364,11.364,0,0,1,.606-1.128c.132-.259-.29-1.019-.474-.68s-.47.878-.522.944a.821.821,0,0,1-.878-.105,1.9,1.9,0,0,0-1.7-.184c-.68.211-1.835.184-1.361,1.049s-.263,1.1-.786.992-1.128-.94-1.572-.76-.97.29-.918.053.707-.5,1-.878a3.24,3.24,0,0,0,.5-1.207c.053-.285-.439-.154-.786.342a2.529,2.529,0,0,1-.944.966c-.5.29-2.2.079-2.59,1.181,0,0,.474,1.256.983,1.137s1.664.8,1.769,1.054,1.181.312,1.181.825a17.3,17.3,0,0,1,.272,2.353,1.822,1.822,0,0,0,.509,1.532c.312.136.439,1.256.356,1.453s-.549.983-.47,1.256.123,1.058-.154,1.317a1.479,1.479,0,0,0,.979.553c.825.123,1.682.25,2.015.25a4.627,4.627,0,0,1,1.08.259h.026c.184-.1.65-.259.439.325-.259.654.527.729.733.575s.957.211,1.067.562a2.2,2.2,0,0,0,.413-.11,1.129,1.129,0,0,1,.268-.07c.075,0,1.049.193,1.111.378a5.382,5.382,0,0,0,.768.667c.154-.228.277-.439.408-.615A6.1,6.1,0,0,1,92.191,66.3c.733-.474.575-1.1,1.282-1.1a4.588,4.588,0,0,0,2.252-.338c.733-.4,1.466-.4.628-1.023s-1.414-.707-1.545-1.387a5.757,5.757,0,0,0-.878-1.6,1.12,1.12,0,0,1,.4-1.515s.439-.29.68-.211.338-.439.079-.6-.316-.474.312-.681,1.317.026,1.809-.878,1.019-.878.878-.522-1.071,2.459-.439,2.094.105-.527.97-1.7a6.837,6.837,0,0,0,.939-1.44C99.813,54.786,99.659,53.662,98.9,54.158Z" transform="translate(-43.186 -28.962)"/><path class="i" d="M104,24.914a5,5,0,0,1,.593.94c0,.158-.439.2.04.9s2,2.2,2.353,2.788.575.053.825.786c.2.549,0,.878.277.878s.439-.575.206-1.023a18.02,18.02,0,0,1-1.019-1.567c0-.206.053-.369.312-.29s.4-.132-.233-.733-.566-1.041-1.159-.9-.759-.285-.834-.6S104.035,23.97,104,24.914Z" transform="translate(-58.349 -13.851)"/><path class="i" d="M119.044,24.748A11.662,11.662,0,0,0,117,22.114a18,18,0,0,1-2.942-3.319,4.225,4.225,0,0,0-1.278-1.787c-.4-.215-.316-1.532-.768-2.041a2.9,2.9,0,0,0-1.528-1.1c-.729-.2-.667-.65-1.1-.825s-1.629-.729-1.923-.439-2.81,0-2.358,1.256v.048a10.214,10.214,0,0,0,1.567,2.722c.65.5.053,1.229.439,1.8s-.132,1.7.364,1.317,1.282-1.282,1.782-.628c0,0,.909,1.027.878,1.343s-.667.391-.825.531,1.1,1.471,1.69,1.629,1.159.04,1.317.606a1.655,1.655,0,0,0,1.124,1.1,2.986,2.986,0,0,1,1.567.9c.492.588,2.533,3.648,3.042,2.454s.65-1.515,1.119-1.629S119.338,25.416,119.044,24.748Z" transform="translate(-58.936 -7.051)"/><path class="j" d="M110.263,35.122l.966.145-.307-.439L110,34.78C110.1,34.907,110.193,35.021,110.263,35.122Z" transform="translate(-61.715 -19.537)"/><path class="j" d="M111.6,36.618a.5.5,0,0,0,.04.132l.32-.47c-.057-.088-.127-.184-.2-.285l-.975-.145C111.137,36.408,111.356,35.916,111.6,36.618Z" transform="translate(-62.158 -20.137)"/><path class="j" d="M111.837,32.223c.25.075.373-.119-.167-.663l-.07.689A.228.228,0,0,1,111.837,32.223Z" transform="translate(-62.613 -17.731)"/><path class="j" d="M112.869,38.052l.386-.742h0l-.4.575A1.466,1.466,0,0,0,112.869,38.052Z" transform="translate(-63.319 -20.956)"/><path class="j" d="M113,38.614a.119.119,0,0,0,.1.07l.242-.724Z" transform="translate(-63.398 -21.321)"/><path class="j" d="M113.708,38l-.228.68A.658.658,0,0,0,113.708,38Z" transform="translate(-63.667 -21.343)"/><path class="j" d="M104.987,27.721l.852-.558a3.07,3.07,0,0,0-.2-.334l-.711.61A.632.632,0,0,0,104.987,27.721Z" transform="translate(-58.871 -15.077)"/><path class="j" d="M104.985,26.306a.176.176,0,0,1-.061.11l.531-.439a5.508,5.508,0,0,0-.417-.527l-.307.4A1.627,1.627,0,0,1,104.985,26.306Z" transform="translate(-58.759 -14.303)"/><path class="j" d="M111.607,34.161a1.9,1.9,0,0,1-.1-.171v.162Z" transform="translate(-62.562 -19.094)"/><path class="j" d="M105.3,28.523a.521.521,0,0,1,.035.053l.834-.439a1.143,1.143,0,0,1-.11-.294V27.79l-.834.558A1.633,1.633,0,0,0,105.3,28.523Z" transform="translate(-59.039 -15.616)"/><path class="j" d="M104.361,25.358l.294-.386a1.316,1.316,0,0,0-.246-.2l-.22.347C104.238,25.183,104.3,25.266,104.361,25.358Z" transform="translate(-58.456 -13.922)"/><path class="j" d="M106.009,29.708l1.646-.5a.439.439,0,0,0-.522-.162.584.584,0,0,1-.667-.211l-.825.439C105.737,29.388,105.868,29.541,106.009,29.708Z" transform="translate(-59.269 -16.199)"/><path class="j" d="M108.4,31.827l.966-1.2a.334.334,0,0,0-.035-.048l-1.247.878Z" transform="translate(-60.638 -17.181)"/><path class="j" d="M107.533,31.206l1.256-.878a.334.334,0,0,1-.035-.048l-1.484.645Z" transform="translate(-60.184 -17.012)"/><path class="j" d="M106.85,30.751l.105.119,1.181-.509Z" transform="translate(-59.948 -17.057)"/><path class="j" d="M109.228,32.368l.742.048.136-1.317c-.061-.066-.123-.127-.171-.189L109,32.1Z" transform="translate(-61.154 -17.366)"/><path class="a" d="M112.752,37.388h0a1.6,1.6,0,0,1,.031.224l.4-.575h0c-.035-.061-.079-.132-.127-.206l-.32.47A.842.842,0,0,1,112.752,37.388Z" transform="translate(-63.246 -20.687)"/><path class="a" d="M106.642,30.369l1.286-.391.316-.14-.119-.158-1.646.5Z" transform="translate(-59.74 -16.676)"/><path class="a" d="M110.376,34.338h-.114l-.742-.048c.075.083.145.162.206.241l.926.061-.162-.237h-.114Z" transform="translate(-61.446 -19.262)"/><path class="a" d="M104.124,24.676l-.1.031a.373.373,0,0,0-.057.206l.1.136.22-.347a.294.294,0,0,0-.171-.053Z" transform="translate(-58.332 -13.854)"/><path class="a" d="M104.188,24.65a.105.105,0,0,0-.088.057l.1-.031Z" transform="translate(-58.405 -13.854)"/><path class="a" d="M104.646,25.717l.307-.4-.079-.083-.294.386Z" transform="translate(-58.675 -14.18)"/><path class="a" d="M105.55,29.106l.825-.439a.72.72,0,0,1-.061-.1l-.834.439Z" transform="translate(-59.179 -16.053)"/><path class="a" d="M105.117,28.249l.834-.558c0-.031-.031-.061-.053-.1l-.839.558Z" transform="translate(-58.944 -15.503)"/><path class="a" d="M104.9,27.322l.711-.61-.061-.092-.531.439A.365.365,0,0,0,104.9,27.322Z" transform="translate(-58.854 -14.959)"/><path class="a" d="M108.9,31.976l.944-1.2c-.031-.031-.048-.057-.075-.088l-.948,1.2Z" transform="translate(-61.053 -17.242)"/><path class="a" d="M107.9,31.34l1.247-.878c0-.031-.048-.061-.066-.092l-1.256.878Z" transform="translate(-60.498 -17.063)"/><path class="a" d="M107.09,30.69l.079.092,1.484-.645c-.022-.031-.048-.066-.066-.1l-.316.14Z" transform="translate(-60.083 -16.878)"/><path class="a" d="M111.188,32.665h.114V32.5a.263.263,0,0,1-.039-.119.347.347,0,0,1,.079-.259l.07-.689-.07-.07a.26.26,0,0,0-.035-.035l-.136,1.317Z" transform="translate(-62.371 -17.602)"/><path class="a" d="M110.663,35.647h0l.975.145-.092-.127-.966-.145Z" transform="translate(-62.04 -19.952)"/><path class="a" d="M112.78,38.1Z" transform="translate(-63.275 -21.399)"/><path class="a" d="M113.18,38.494h.04a.259.259,0,0,0,.083-.022l.237-.685a1.144,1.144,0,0,0-.04-.167l-.07.136Z" transform="translate(-63.499 -21.13)"/><path class="a" d="M112.933,38.266l.342-.654.07-.136a.748.748,0,0,0-.057-.136l-.408.729A.44.44,0,0,0,112.933,38.266Z" transform="translate(-63.331 -20.973)"/><path class="j" d="M106.764,15.64l-.764.724c.044.092.088.189.136.285l.65-1.01Z" transform="translate(-59.471 -8.8)"/><path class="j" d="M105.48,15.982c.044.1.1.22.162.351l.6-.553Z" transform="translate(-59.179 -8.878)"/><path class="j" d="M106.336,15.11H105.08a.757.757,0,0,0,.04.158v.044s.026.07.075.176l.979-.259Z" transform="translate(-58.955 -8.503)"/><path class="j" d="M107.852,15.74l-.562,1.809a.091.091,0,0,1,0,.026l.768-.913Z" transform="translate(-60.195 -8.856)"/><path class="j" d="M108.218,18.15l-.738.878c.031.057.066.11.1.162l.755-.544Z" transform="translate(-60.301 -10.208)"/><path class="j" d="M106.41,16.735c.075.149.154.3.237.439l.492-1.594Z" transform="translate(-59.701 -8.766)"/><path class="j" d="M105.09,14.43a.492.492,0,0,0-.031.2H106.1Z" transform="translate(-58.943 -8.121)"/><path class="j" d="M134.508,47h0l-.088.057Z" transform="translate(-75.414 -26.392)"/><path class="j" d="M134.114,47.44l-.154.07A.325.325,0,0,0,134.114,47.44Z" transform="translate(-75.156 -26.639)"/><path class="j" d="M108.574,19.55l-.724.518.066.119.742-.224Z" transform="translate(-60.509 -10.993)"/><path class="j" d="M105.284,14.07l-.044.053.408.075Z" transform="translate(-59.045 -7.919)"/><path class="j" d="M133.247,46.545l.641-.439c.048-.114.1-.219.141-.316l-.878.716Z" transform="translate(-74.701 -25.713)"/><path class="j" d="M106.355,13.27a1.8,1.8,0,0,0-.5.184l.439.154Z" transform="translate(-59.387 -7.47)"/><path class="j" d="M115.31,29.362c.07.088.154.176.241.272l2.7-2.955Z" transform="translate(-64.694 -14.993)"/><path class="j" d="M122.932,34.968,117.29,34.7l.039.031,5.852.6Z" transform="translate(-65.805 -19.492)"/><path class="j" d="M224.209,46.1l4.974-.667-.733-1.062L224.13,46.1Z" transform="translate(-172.781 -31.01)"/><path class="j" d="M118.45,35.4l.057.022.184.04-.04-.04Z" transform="translate(-66.455 -19.885)"/><path class="j" d="M120.53,28.56l-3.89,2.459a.17.17,0,0,0,.044.035l4.36-1.756Z" transform="translate(-65.44 -16.048)"/><path class="j" d="M119.438,25.72l-3.218,3.534.04.04,3.512-3.073Z" transform="translate(-65.204 -14.454)"/><path class="j" d="M230.732,47.864l-.575-.834-4.417.593Z" transform="translate(-173.684 -32.502)"/><path class="j" d="M119.3,35.49l.053.053c.439.066.825.088.948.536a1.664,1.664,0,0,0,1.12,1.1h.026l-1.093-1.594Z" transform="translate(-66.932 -19.935)"/><path class="j" d="M227.76,41.534l-.373-.544-3.337,2.889Z" transform="translate(-172.736 -29.114)"/><path class="j" d="M130.632,39.71l-.742,1.984h0l.786-1.08Z" transform="translate(-72.873 -22.302)"/><path class="j" d="M122,35.77l1.128,1.638a3.781,3.781,0,0,1,.777.329l-.755-1.866Z" transform="translate(-68.447 -20.092)"/><path class="j" d="M130.441,37.48l-.781,2.836.022.026.8-2.16Z" transform="translate(-72.744 -21.051)"/><path class="j" d="M130.8,42.21l-.724.992.162.193.61-.373Z" transform="translate(-72.979 -23.705)"/><path class="j" d="M129.055,36.52l-.255,2.77.206.268.816-2.959Z" transform="translate(-72.261 -20.513)"/><path class="j" d="M124.91,36.06l.812,1.954a2.046,2.046,0,0,1,.4.369l-.439-2.243Z" transform="translate(-70.079 -20.255)"/><path class="j" d="M127,36.27l.439,2.415.246.334.242-2.634Z" transform="translate(-71.251 -20.373)"/><path class="j" d="M216.938,29.71l2.77,1.739.189-.4L216.82,29.6Z" transform="translate(-168.68 -22.725)"/><path class="j" d="M216.89,30.03l2.191,3.051.334-.694-2.507-2.349Z" transform="translate(-168.719 -22.966)"/><path class="j" d="M131.164,44.35l-.544.334c.105.123.215.246.321.36h.285Z" transform="translate(-73.282 -24.905)"/><path class="j" d="M220.125,32.693l.233-.483-2.287-1.44Z" transform="translate(-169.381 -23.381)"/><path class="j" d="M216.34,29.7l2.006,4.083.373-.777-.009,0Z" transform="translate(-168.411 -22.781)"/><path class="j" d="M218.177,35.345l.32-.672L216.72,31.06Z" transform="translate(-168.624 -23.544)"/><path class="j" d="M227.32,35.649l-2.27-2.779,1.506,3.038Z" transform="translate(-173.297 -24.559)"/><path class="j" d="M224.654,32.384l0,0v0Z" transform="translate(-173.072 -24.284)"/><path class="j" d="M116,27.751c.061.1.119.184.167.272l2.112-1.383Z" transform="translate(-65.081 -14.971)"/><path class="j" d="M115.906,19l-.035.07-1.04,3.758.119.145.6-.2Z" transform="translate(-64.424 -10.685)"/><path class="j" d="M115.45,27.568l.162.22,1.883-.918Z" transform="translate(-64.772 -15.1)"/><path class="j" d="M115.481,28.076a.479.479,0,0,1,.066.224c-.039.312-.667.391-.825.527-.048.044.031.189.18.378l2.854-2.634Z" transform="translate(-64.356 -14.931)"/><path class="j" d="M113.45,23.359a.514.514,0,0,1,.518.224l.852-3.073Z" transform="translate(-63.65 -11.532)"/><path class="j" d="M216.5,27.77l-.413.452h0l2.946.966Z" transform="translate(-168.27 -21.698)"/><path class="j" d="M221.016,31.286l.132-.281-2.428-.795Z" transform="translate(-169.746 -23.067)"/><path class="j" d="M107.05,13.5l.615.22.075-.711c-.2.022-.408.048-.615.088Z" transform="translate(-60.06 -7.325)"/><path class="j" d="M119.411,16.65h0l-.1.07Z" transform="translate(-66.938 -9.366)"/><path class="j" d="M119.137,16.39h0l-.057.061Z" transform="translate(-66.809 -9.221)"/><path class="j" d="M119.581,16.87h0l-.171.092Z" transform="translate(-66.994 -9.49)"/><path class="j" d="M119.456,17.25l-.04-.04-.566.149Z" transform="translate(-66.68 -9.681)"/><path class="j" d="M118.071,15.864a2.244,2.244,0,0,0-.4-.184l-.132.751Z" transform="translate(-65.945 -8.822)"/><path class="j" d="M120.914,21.558l.342-.184a3.307,3.307,0,0,1-.149-.553l-.6.241Z" transform="translate(-67.611 -11.706)"/><path class="j" d="M118.578,18.743l.94-.3a1.387,1.387,0,0,0-.268-.553l-.119-.132-1.181.211Z" transform="translate(-66.175 -9.989)"/><path class="j" d="M119.919,20.268l.65-.259c-.031-.149-.061-.3-.1-.439l-.878.281Z" transform="translate(-67.095 -11.005)"/><path class="j" d="M109.527,12.78a2.458,2.458,0,0,1-.439.075l-.088.487Z" transform="translate(-61.154 -7.196)"/><path class="j" d="M113.049,14.7h0l-1.84-2.072a2.552,2.552,0,0,0-.7-.154L110.02,13Z" transform="translate(-61.726 -7.022)"/><path class="j" d="M225.451,36.525l.961-.329L224.99,33.32Z" transform="translate(-173.263 -24.812)"/><path class="j" d="M117.055,15.416l-.075-.026.048.364Z" transform="translate(-65.631 -8.66)"/><path class="j" d="M116.492,15.11a1.16,1.16,0,0,1-.162-.11l.215.483Z" transform="translate(-65.266 -8.441)"/><path class="j" d="M114.887,14.751l-.5-1.128a.913.913,0,0,0-.386-.338c-.162-.066-.439-.184-.72-.294l1.633,1.826Z" transform="translate(-63.555 -7.313)"/><path class="j" d="M134.979,38.344c-.048-.075-.1-.149-.158-.228l-.751-.285Z" transform="translate(-75.218 -21.248)"/><path class="j" d="M133.16,36.153c-.184-.233-.378-.439-.562-.663l-.628.329Z" transform="translate(-74.04 -19.935)"/><path class="j" d="M131.6,46.174l.176.167V46.17Z" transform="translate(-73.832 -25.926)"/><path class="j" d="M132.56,36.989l1.317.5c-.044-.061-.088-.119-.136-.176l-1.177-.334Z" transform="translate(-74.371 -20.771)"/><path class="j" d="M134.669,38.952c-.044-.088-.083-.184-.127-.281a3.708,3.708,0,0,0-.215-.386l-1.646-.935Z" transform="translate(-74.438 -20.979)"/><path class="j" d="M132,38.18l.237,3.881.083.061.4-.329Z" transform="translate(-74.056 -21.444)"/><path class="j" d="M134.607,40.354a.926.926,0,0,1,.233-.1c.342-.083.277-.378.105-.79L133,37.9Z" transform="translate(-74.617 -21.287)"/><path class="j" d="M132.28,37.33l1.37,3.332.114-.092a1.452,1.452,0,0,1,.347-.474l-1.8-2.744Z" transform="translate(-74.213 -20.967)"/><path class="j" d="M130.725,32.809h0c-.255-.228-.724-.681-1.225-1.2l1.155,1.317Z" transform="translate(-72.654 -17.759)"/><path class="j" d="M124.262,24.916l.1-.066h0l-.119.092Z" transform="translate(-69.703 -13.966)"/><path class="j" d="M124.39,25.7l.439.364-.123-.237-.246-.123Z" transform="translate(-69.787 -14.443)"/><path class="j" d="M132.509,34.75h0l-.149.263Z" transform="translate(-74.258 -19.52)"/><path class="j" d="M123.059,24.209l.338-.263c-.092-.132-.18-.255-.263-.356l-.373.255Z" transform="translate(-68.873 -13.26)"/><path class="j" d="M125.671,27.2c-.079-.11-.149-.22-.206-.316l-.215-.171Z" transform="translate(-70.27 -15.01)"/><path class="j" d="M122.035,23.022l.369-.25a1.4,1.4,0,0,0-.343-.285.4.4,0,0,1-.145-.167l-.316.167Z" transform="translate(-68.222 -12.547)"/><path class="j" d="M240.646,54.851,239.32,51.62l.738,3.723Z" transform="translate(-181.302 -35.077)"/><path class="j" d="M110.158,25.112l-.711-.742a1.349,1.349,0,0,0,0,.439l.922,1.155Z" transform="translate(-61.395 -13.697)"/><path class="j" d="M110.05,26.89a1.239,1.239,0,0,1,0,.127l.066-.031Z" transform="translate(-61.743 -15.111)"/><path class="j" d="M109.859,23.066l-.439-.206a1.678,1.678,0,0,1,0,.514l.694.672Z" transform="translate(-61.39 -12.85)"/><path class="j" d="M223.88,36.637l.838-.29-.487-3.407Z" transform="translate(-172.64 -24.598)"/><path class="j" d="M234.692,44.5l.294-.522L231.75,40.24l2.937,4.267Z" transform="translate(-177.055 -28.693)"/><path class="j" d="M110.056,27.386c0,.474-.114.878.22.628.083-.066.171-.145.268-.228l-.36-.465Z" transform="translate(-61.736 -15.352)"/><path class="j" d="M110.771,22.669a3.066,3.066,0,0,1,.307-.2L109.81,18.74Z" transform="translate(-61.608 -10.539)"/><path class="j" d="M108.888,20.72l-.7.211a1.908,1.908,0,0,0,.263.268.769.769,0,0,1,.255.316l.439.206Z" transform="translate(-60.7 -11.65)"/><path class="a" d="M107.619,15.07h0V15.1h0l-.053.088v.075h-.088v.031L107,16.9l.149.272.562-1.809Z" transform="translate(-60.032 -8.48)"/><path class="a" d="M118.128,17.459l-.079.031h0l-.171.048h0l-.092.048-.035.04.1.123,1.181-.211-.18-.2-.606.11Z" transform="translate(-66.063 -9.754)"/><path class="a" d="M215.56,28.828l0-.018,0,.013Z" transform="translate(-167.973 -22.282)"/><path class="a" d="M216.32,29.37h0Z" transform="translate(-168.399 -22.596)"/><path class="a" d="M224.1,31.438l0-.013-.022,0,.026.018Z" transform="translate(-172.747 -23.746)"/><path class="a" d="M216.153,28.91l1.08.509,2.428.795.035-.07-.672-.378-2.946-.966-.009.053.039.154h0Z" transform="translate(-168.259 -22.276)"/><path class="a" d="M130.2,36.73h-.114l-.817,2.959.171.22.781-2.836Z" transform="translate(-72.525 -20.631)"/><path class="a" d="M131.739,34.574l-.088.075-.053-.066-.3.522h0l.079.119.026-.1h.044l-.057-.105.272-.145.026-.035h.022l.044-.061.149-.263-.162-.162-.079.136Z" transform="translate(-73.664 -19.296)"/><path class="a" d="M228.541,39.586l.544-.263.009.018.048-.044.039.044.088-.1-.026-.039-.764.259Z" transform="translate(-175.221 -28.11)"/><path class="a" d="M124.441,25.14l-.061.044h.154v-.035l-.057.031Z" transform="translate(-69.782 -14.129)"/><path class="a" d="M231.049,39.05l0-.057.162-.013-.053-.079.04-.031-.026.009L231.01,39l.035.053Z" transform="translate(-176.64 -27.925)"/><path class="a" d="M117.8,26.13l-.07-.14-.961.329v.022h-.11l-.843.29v.088H115.7v-.04l-.6.193.154.189,2.046-.7Z" transform="translate(-64.576 -14.606)"/><path class="a" d="M224.35,32.829l.035-.07,0-.079Z" transform="translate(-172.904 -24.453)"/><path class="a" d="M224.526,32.348l0-.009.044-.022v0l-.039-.053-.026.083Z" transform="translate(-172.988 -24.217)"/><path class="a" d="M114.776,18.125l.11.031-.039-.048.07-.053-.132-.075-.031.07-.136.281.066.035-.048.1-.066-.031-.193.4.075.048-.062.1-.061-.04-.233.483.053.053-.075.083-.031-.026-.334.694.035.048-.088.061-.373.777.053.1-.105.053v-.022l-.321.672.026.075a.877.877,0,0,1,.22-.066l1.37-2.854Z" transform="translate(-63.347 -10.113)"/><path class="a" d="M108.464,13.661l-.044.119h0l.07.294.224.922v-.022l.083.075-.066.083.119.5h0l.066.092-.044.035.1.4h.07l.035.105-.079.026.246,1,.149.075-.048.1-.066-.031.241.979.184.193-.083.079-.048-.053.211.878h0l.193-.158-.962-3.951-.439-1.361h.044l-.088-.057.057-.1.088.057-.035-.154V13.74h0v.026l-.167-.154.228-.246.053-.487-.233.026-.075.711Z" transform="translate(-60.829 -7.252)"/><path class="a" d="M108.51,13.428l.167.154v-.026l.439-.439-.1-.057.057-.1.119.066.487-.531a.439.439,0,0,0-.285.07.347.347,0,0,1-.145.061l-.527.553Z" transform="translate(-60.879 -7.036)"/><path class="a" d="M117.237,16.364l-.061.031h0v.026h-.026l-.04.031.1.057-.031-.031.123-.136.132-.751-.184-.061h0l-.048.711Z" transform="translate(-65.704 -8.738)"/><path class="a" d="M224.13,31.46Z" transform="translate(-172.781 -23.768)"/><path class="a" d="M117.26,16.791l.031.031.158.088h0l.035-.04h0l-.057-.1.136-.066.47-.439.057-.061a1.208,1.208,0,0,0-.193-.123l-.531.566Z" transform="translate(-65.788 -9.047)"/><path class="a" d="M119.731,20.663H119.7l-.066-.092h0l-.439-.536-.092.048-.053-.1.07-.035-.4-.5-.088.031-.039-.105h.053l-.342-.439-.1.031-.031-.105h.053l-.58-.79-.1-.123h0l-.057.1-.057-.031-.07.053.04.048h0l.044.053h0l.057-.026.118.237,2.265,2.779.031.04.132-.149.127.114.053-.035h0l.154-.119.119-.092-.123-.193-.338.263Z" transform="translate(-65.844 -10.096)"/><path class="a" d="M106.691,14.22v.057l.026.026h0l.044-.119h-.031l-.615-.22-.026.14h-.11l.031-.162-.439-.154a.747.747,0,0,0-.2.167l.364.127Z" transform="translate(-59.118 -7.762)"/><path class="a" d="M215.489,28.956l.013-.026-.022.018Z" transform="translate(-167.928 -22.349)"/><path class="a" d="M119.2,25.281l.136-.1-.127-.114-.132.149-.092.1.039.044-.439.417L115.9,28.732l.158.158,3.218-3.534Z" transform="translate(-65.025 -14.09)"/><path class="a" d="M109.51,25.33a.754.754,0,0,0,.1.259.992.992,0,0,1,.136.439l.075.1.083-.044.053.1-.07.035.36.465.171-.145h0Z" transform="translate(-61.44 -14.236)"/><path class="a" d="M118.007,29.708l.079-.079.154.167,1.054.105v-.031l.092-.066.075.114,1.137.114-.07-.171.105-.044.092.228.786.079-.026-.136h.114l.031.171.944.1V30.13h.11v.127l.768.079h.114v-.149h.044l-.079-.119L120.593,25.8l-.2-.228-.057-.044h0l-.088-.1.044-.035-.035-.053h0l-.053.035-.136.1.057.075.351.518.1-.083.075.088-.105.088.373.544.11-.07.061.1-.105.066.514.751.057-.022.044.105h-.035l.733,1.062h.132V28.8h-.07l.571.834h.206v.114h-.123l.25.364-5.852-.6a1.962,1.962,0,0,0,.47.277l.2.022Z" transform="translate(-65.872 -14.241)"/><path class="a" d="M131.75,36.293h.061v.092l.066-.044.092.145.119.061,1.177.334c-.075-.1-.149-.2-.233-.3l-1.172-.338Z" transform="translate(-73.916 -20.356)"/><path class="a" d="M238.743,50.105l-.053-.092-.04-.013-.026.1,0,.013Z" transform="translate(-180.909 -34.169)"/><path class="a" d="M133.826,45.1l-.593.492.026.119h-.114v-.057l-.4.329a2.114,2.114,0,0,0,.206.123l.878-.716.114-.259-.061.026Z" transform="translate(-74.477 -25.326)"/><path class="a" d="M135.431,44.877c.031-.057.057-.119.083-.167l-.114.092Z" transform="translate(-75.964 -25.107)"/><path class="a" d="M131.531,36.628h-.04l.022-.053-.1-.053.053-.1.119.066h0V36.4h-.228v.149l.022.329.044.7.044-.127.11.04-.136.364.057.918.04-.057.092.066-.123.171.048.812.083-.031.057.1-.1.061.044.689h.114V40.7h-.119v.171a3.042,3.042,0,0,0,.237.2l-.237-3.89Z" transform="translate(-73.697 -20.446)"/><path class="a" d="M131.905,35.351l-.057.088-.092-.066.026-.04-.272.145.057.105.048.092h0l.1-.053.628-.329c-.048-.053-.092-.105-.14-.154l-.119.075Z" transform="translate(-73.782 -19.739)"/><path class="a" d="M106.74,13.714h.11l.026-.14.075-.4-.119.026-.061.338Z" transform="translate(-59.886 -7.414)"/><path class="a" d="M109.127,16.3l-.307-.632.053-.026-.048-.031h-.044l.439,1.361,1.269,3.727.1-.053-.026-.075Z" transform="translate(-61.031 -8.783)"/><path class="a" d="M216.2,29.05l-.044.1.07.044h0l.026-.018.026.035.035-.035.127.119,3.078,1.449.07.031.048-.1-.066-.035-2.3-1.076Z" transform="translate(-168.31 -22.416)"/><path class="a" d="M216.891,30.016l-.031-.026.013.018Z" transform="translate(-168.702 -22.944)"/><path class="a" d="M217.52,30.254l2.287,1.44.066.04.057-.1-.07-.048-2.77-1.739Z" transform="translate(-168.831 -22.865)"/><path class="a" d="M215.991,29.307l-.013-.018.066-.048h0l-.07-.044h0l-.088-.057-.061.1.092.057.048.031Z" transform="translate(-168.119 -22.467)"/><path class="a" d="M216.1,29.52l-.031.018-.057.026.312.632,1.778,3.613.009.022.1-.053-.048-.1L216.155,29.6Z" transform="translate(-168.226 -22.68)"/><path class="a" d="M216.479,29.62l-.224-.206.044-.048-.026-.035-.026.018h0l-.066.048.013.018.057.079,2.371,3.31.009,0,.083-.061-.031-.048-2.191-3.051Z" transform="translate(-168.321 -22.573)"/><path class="a" d="M216.675,29.558l-.119-.11-.127-.119-.035.035-.044.048.224.206.031.026,2.507,2.349.026.026.079-.083-.057-.053-2.055-1.923Z" transform="translate(-168.416 -22.573)"/><path class="a" d="M220.117,29.369l.127.075.061.031.057-.1-.022-.013-.158-.088-.1-.057-.018.013-.04-.04h0L220,29.176l-3.012-1.69-.118-.066-.053.1.092.057,2.533,1.418Z" transform="translate(-168.68 -21.502)"/><path class="a" d="M117.134,16.1l.044.1.048-.711-.11-.04-.026.338Z" transform="translate(-65.692 -8.693)"/><path class="a" d="M224.371,31.39l-.031.026h.026Z" transform="translate(-172.898 -23.729)"/><path class="a" d="M224.41,31.38Z" transform="translate(-172.938 -23.723)"/><path class="a" d="M116.915,15.992l-.044-.316-.048-.364a1.07,1.07,0,0,1-.123-.061l.053.373Z" transform="translate(-65.474 -8.581)"/><path class="a" d="M224.08,30.89l.009.061.04.044Z" transform="translate(-172.753 -23.448)"/><path class="a" d="M116.3,15.674l.1.11h0l.061-.031-.048-.119-.044-.1-.162-.369-.215-.483a1.5,1.5,0,0,1-.233-.246l.518,1.124Z" transform="translate(-64.946 -8.127)"/><path class="a" d="M114.633,14.915h0l.035.04h0l.04-.031.026-.026h0l-.1-.11-.04-.044L113,12.9l-.219-.075,1.853,2.072Z" transform="translate(-63.275 -7.224)"/><path class="a" d="M118,16.869l.4-.215-.053-.07.228-.162-.039-.031-.066.057Z" transform="translate(-66.203 -9.221)"/><path class="a" d="M225.346,31.484l-.018-.044-.158.083v.009Z" transform="translate(-173.364 -23.757)"/><path class="a" d="M118.61,17.307l.105-.026.566-.149-.061-.061Z" transform="translate(-66.545 -9.602)"/><path class="a" d="M118.38,17.162v.044h0l.079-.031.61-.237-.088-.088-.193.075Z" transform="translate(-66.416 -9.479)"/><path class="a" d="M118.246,16.781v-.022l-.4.215-.136.066.057.1h0l.092-.048.158-.083.439-.228.171-.092-.092-.079-.114.061Z" transform="translate(-66.04 -9.344)"/><path class="a" d="M118.816,16.7v.022l.154-.11.1-.07-.092-.075-.228.162Z" transform="translate(-66.624 -9.266)"/><path class="a" d="M132.22,35.1l.1-.079h0l.105-.066.048-.035h-.031l.044-.053-.044-.04-.167.246Z" transform="translate(-74.18 -19.565)"/><path class="a" d="M239.312,49.52l.057-.088-.035.031-.066-.083-.022.035-.026.04Z" transform="translate(-181.246 -33.821)"/><path class="a" d="M132.945,35.14h0l-.105.088Z" transform="translate(-74.528 -19.739)"/><path class="a" d="M239.57,49.041l.009.013.1-.075Z" transform="translate(-181.442 -33.596)"/><path class="a" d="M132.433,35l-.048.035-.1.079-.1.079h-.022l.066.083.031-.031.176-.136.105-.088L132.534,35l-.035.04Z" transform="translate(-74.152 -19.66)"/><path class="a" d="M132.742,34.893l.057.048.044-.048-.079-.083-.044.053Z" transform="translate(-74.46 -19.554)"/><path class="a" d="M124.122,25.231h-.162v.057l.044-.035.062.07V25.3h.11v-.035l.048.026v-.031l.105.031-.053-.092h-.154Z" transform="translate(-69.546 -14.163)"/><path class="a" d="M124.16,25.84l.2.228,3.244,3.741.053.066.088-.075-.083-.092L126.5,28.391a15.983,15.983,0,0,1-1.436-1.66l-.439-.487Z" transform="translate(-69.658 -14.522)"/><path class="a" d="M231,39.27l.083.1.062-.075,0-.026-.066-.07-.039.035h0Z" transform="translate(-176.634 -28.11)"/><path class="a" d="M124.107,25.6V25.54l-.057.075h0l.057.044.479.382.215.171a1.618,1.618,0,0,1-.079-.145l-.053-.105-.439-.364Z" transform="translate(-69.597 -14.353)"/><path class="a" d="M231.324,39.358l0,.061.1.009.092,0-.105-.053.031-.066-.105,0v.022Z" transform="translate(-176.814 -28.172)"/><path class="a" d="M124.61,25.35v.031l.158.079a.441.441,0,0,0-.044-.079Z" transform="translate(-69.911 -14.247)"/><path class="a" d="M124.483,25.386l-.048-.026V25.4l-.035.066.105.053.246.123c-.031-.061-.061-.114-.092-.171Z" transform="translate(-69.793 -14.253)"/><path class="a" d="M124.19,24.937l.053.079h0l.061-.044-.035-.075.053-.026V24.84l-.1.066Z" transform="translate(-69.675 -13.961)"/><path class="a" d="M124.44,24.966l.035.075v.026l.057-.031c0-.031-.04-.061-.057-.1Z" transform="translate(-69.815 -14.017)"/><path class="a" d="M119.26,19.6l.031.105.1-.031.878-.281a1.028,1.028,0,0,0-.031-.11l-.94.3Z" transform="translate(-66.91 -10.842)"/><path class="a" d="M122.54,23.68l.066.092h.031l.373-.255-.079-.088-.369.25Z" transform="translate(-68.75 -13.17)"/><path class="a" d="M120.22,20.847l.04.105.088-.031.6-.241a.976.976,0,0,0-.022-.11l-.65.259Z" transform="translate(-67.448 -11.565)"/><path class="a" d="M121.27,22.3l.053.1.092-.048.316-.167a.585.585,0,0,1-.048-.105l-.342.184Z" transform="translate(-68.037 -12.413)"/><path class="a" d="M110.272,27.111l-.053-.1-.083.044-.066.031a1.239,1.239,0,0,1,0,.127l.127-.066Z" transform="translate(-61.754 -15.178)"/><path class="a" d="M106.442,14.508h0l.035.044v-.057l-.97-.18-.408-.075a.441.441,0,0,0-.048.105l1.005.189Z" transform="translate(-58.938 -8.015)"/><path class="a" d="M107.078,15.54l-.158.044-.65,1.01.061.119.729-1.141Z" transform="translate(-59.623 -8.744)"/><path class="a" d="M215.29,29.049l.044-.009.009.031.053-.088-.013,0-.009-.009Z" transform="translate(-167.822 -22.371)"/><path class="a" d="M106.445,14.85h-1.387a1.075,1.075,0,0,0,0,.114h1.256Z" transform="translate(-58.942 -8.357)"/><path class="a" d="M106.447,15.679l-.6.536a1.19,1.19,0,0,0,.048.11l.781-.724Z" transform="translate(-59.387 -8.777)"/><path class="a" d="M215.085,28.724l-.039-.044-.018.022-.127.114-.14.132.233-.061.083-.079.022-.018.013-.013.013-.013-.013-.009v0Z" transform="translate(-167.524 -22.209)"/><path class="a" d="M106.45,15.444h0l.158-.044h.088v-.11h-.044l-.233.061-.979.259.044.105.759-.2Z" transform="translate(-59.157 -8.604)"/><path class="a" d="M108.878,20.525l-.035-.105h-.07l-.773.255c.026.031.048.066.07.1l.7-.211Z" transform="translate(-60.593 -11.481)"/><path class="a" d="M108.551,19.352l-.066-.092h0l-.755.544.061.092.724-.518Z" transform="translate(-60.442 -10.831)"/><path class="a" d="M108.222,17.9l-.083-.075v.022l-.768.913.066.1.738-.878Z" transform="translate(-60.24 -10.028)"/><path class="a" d="M109.88,22.912l.048-.1-.149-.075-.439-.206a.613.613,0,0,1,.044.145l.439.206Z" transform="translate(-61.345 -12.665)"/><path class="a" d="M110.241,24.957l.083-.079-.184-.193L109.49,24v.149l.711.742Z" transform="translate(-61.429 -13.49)"/><path class="a" d="M115.741,18.525v-.1h0v-.083h0l-.11-.031-.259.944-.852,3.073h0l.088.1,1.04-3.758Z" transform="translate(-64.251 -10.298)"/><path class="a" d="M224.55,32.378l0,.009.07,0,0,.035.07-.013.053.351,1.422,2.876.07.145.1-.053-.061-.127-1.506-3.038-.118-.237-.053.026h0Z" transform="translate(-173.016 -24.256)"/><path class="a" d="M224.048,32.5l.039,0,0-.035-.07,0-.026,0h-.018l-.009.1,0,.079L223.6,36.4l0,.04.11.009.013-.088.351-3.7Z" transform="translate(-172.483 -24.324)"/><path class="a" d="M224.73,32.52l-.07.013-.04,0,.026.167.487,3.407,0,0,.11-.018,0-.022-.461-3.2Z" transform="translate(-173.055 -24.363)"/><path class="a" d="M118.7,25.728v.031l.132-.119h0l-.544.263-.1.048-.5.246-1.87.918.07.092,2.279-1.111Z" transform="translate(-64.98 -14.41)"/><path class="a" d="M118.585,25.623l-.04-.044-.039-.04-.044.044-.132.119.04.066-.386.25-2.854,2.634.07.088,2.946-2.7Z" transform="translate(-64.593 -14.353)"/><path class="a" d="M119.1,25.937l-.04-.066V25.84l-.536.351-2.112,1.383a.529.529,0,0,1,.048.1l2.274-1.488Z" transform="translate(-65.311 -14.522)"/><path class="a" d="M119.928,26.886l.105-.088-.075-.088-.1.083-3.512,3.073.057.053.2-.127Z" transform="translate(-65.277 -15.01)"/><path class="a" d="M117,34.42Z" transform="translate(-65.642 -19.335)"/><path class="a" d="M123.038,34.876v-.114h-.206l-4.992-.241-.58.079h0l5.642.268Z" transform="translate(-65.788 -19.391)"/><path class="a" d="M120.523,28.287l-.061-.1-.11.07-3.71,2.344-.2.127.088.079,3.89-2.459Z" transform="translate(-65.328 -15.84)"/><path class="a" d="M122.13,33h.07V32.89h-.132l-4.974.667h-.075l.123.1.58-.079Z" transform="translate(-65.653 -18.477)"/><path class="a" d="M121.165,30.355h.035l-.044-.105-.057.022-4.36,1.756.1.083h0Z" transform="translate(-65.496 -16.996)"/><path class="a" d="M128.951,36.23h-.11v.127l-.241,2.634a1.494,1.494,0,0,1,.1.132l.255-2.77Z" transform="translate(-72.149 -20.35)"/><path class="a" d="M118.9,35.11l-.079.079.062.07.04.04.184.031-.053-.053Z" transform="translate(-66.663 -19.722)"/><path class="a" d="M121.742,35.51l-.092.066v.031l1.093,1.594.18.061L121.8,35.624Z" transform="translate(-68.25 -19.946)"/><path class="a" d="M124.565,35.54l-.105.044.07.171.768,1.853a1.933,1.933,0,0,1,.171.114l-.812-1.954Z" transform="translate(-69.827 -19.963)"/><path class="a" d="M126.754,35.88h-.114l.026.136.439,2.243h0l.132.162-.439-2.415Z" transform="translate(-71.05 -20.154)"/><path class="a" d="M132.35,37.38l1.8,2.744a.673.673,0,0,1,.092-.061l-1.607-2.454Z" transform="translate(-74.253 -20.995)"/><path class="a" d="M239.2,50.485l-.092-.145-.07.044,0,0Z" transform="translate(-181.139 -34.359)"/><path class="a" d="M132.151,37.223l-.1-.083.053.263,1.317,3.231.031.079.061-.026.026-.057-.031-.075Z" transform="translate(-74.084 -20.861)"/><path class="a" d="M239.01,51.353l.716,3.613.009.057.11-.022-.022-.119-.738-3.723-.053-.263-.114-.092-.018,0Z" transform="translate(-181.066 -34.617)"/><path class="a" d="M133.2,37.328l.751.285-.114-.162-1.317-.5Z" transform="translate(-74.348 -20.754)"/><path class="a" d="M238.85,50.716l.018,0-.039-.031.026-.026-.026-.013-.018.048Z" transform="translate(-181.016 -34.533)"/><path class="a" d="M131.977,36.714h0l-.119-.061-.167-.1-.118-.066-.053.1.1.053h0l.048-.061.356.285,1.646.935c-.04-.066-.079-.132-.127-.2l-.909-.514Z" transform="translate(-73.787 -20.496)"/><path class="a" d="M131.775,36.66l-.048.061-.026.026.04.031.114.092.1.083.031.022.285.228,1.945,1.567-.1-.224-1.989-1.6Z" transform="translate(-73.888 -20.591)"/><path class="a" d="M133.4,46.973l.439-.193.088-.057c.026-.07.053-.127.079-.193l-.641.439Z" transform="translate(-74.819 -26.128)"/><path class="a" d="M133.44,47.254a.531.531,0,0,0,.228.026l.154-.07a.5.5,0,0,0,.136-.18l-.075.031Z" transform="translate(-74.864 -26.409)"/><path class="a" d="M130.667,38.83l-.11-.04-.044.127-.8,2.16.079.1.742-1.984Z" transform="translate(-72.772 -21.786)"/><path class="a" d="M131.732,46.024V45.91h-.382c.04.035.075.075.11.11h.272Z" transform="translate(-73.692 -25.78)"/><path class="a" d="M131.194,44.092,131.159,44l-.048.031-.61.373c.022.031.048.057.075.088l.544-.334Z" transform="translate(-73.215 -24.709)"/><path class="a" d="M130.827,41.736l-.092-.066-.039.057-.786,1.08.07.092.724-.992Z" transform="translate(-72.884 -23.402)"/><path class="j" d="M61.31,78.83a1.467,1.467,0,0,0,.176-.07l-.031-.47Z" transform="translate(-34.401 -43.945)"/><path class="j" d="M32.014,70.6a1.753,1.753,0,0,1,.083-.259l-1.1.935Z" transform="translate(-17.398 -39.485)"/><path class="j" d="M39.024,64.566l-1.73-1.8-.044.035c.4.549,1.26,1.686,1.989,2.634Z" transform="translate(-20.905 -35.238)"/><path class="j" d="M44.147,59.878,42.724,59H42.43l1.484,1.37Z" transform="translate(-23.81 -33.124)"/><path class="j" d="M32.194,71.412a.439.439,0,0,1,0-.132l-.834.558Z" transform="translate(-17.6 -40.012)"/><path class="j" d="M137.642,86.735l-.026-.035-.075.061-.031.044Z" transform="translate(-124.189 -54.756)"/><path class="j" d="M38.732,61.53l-.724.22a2.861,2.861,0,0,0-.268.176l1.238.606Z" transform="translate(-21.179 -34.543)"/><path class="j" d="M43.872,61.141l-1.005-.931a1.358,1.358,0,0,1-.417.105l1.089,1.519Z" transform="translate(-23.822 -33.802)"/><path class="j" d="M39.652,61.2l-.2.1.211-.061Z" transform="translate(-22.139 -34.358)"/><path class="j" d="M42.885,62.107h0L41.721,60.5l-.325.061H41.37l1.155,2.322Z" transform="translate(-23.216 -33.965)"/><path class="j" d="M41.51,64.075,40.443,60.94l-.053.022.878,3.609Z" transform="translate(-22.666 -34.212)"/><path class="j" d="M42.1,63.145l-1.19-2.415-.162.053,1.032,3.029Z" transform="translate(-22.868 -34.094)"/><path class="j" d="M33.368,63.15a.879.879,0,0,1-.25.079L30.65,67.15h0l2.88-3.776Z" transform="translate(-17.202 -35.452)"/><path class="j" d="M39.76,71.069a1.763,1.763,0,0,1,.04.176l.716-.5Z" transform="translate(-22.313 -39.709)"/><path class="j" d="M39.91,71.554a.3.3,0,0,1,0,.061s.026.092.053.241l.615-.777Z" transform="translate(-22.397 -39.9)"/><path class="j" d="M33.9,63.88,31.18,67.445l1.133-.97c.057-.11.119-.224.2-.36a.6.6,0,0,1,.4-.149l1.55-1.317Z" transform="translate(-17.499 -35.861)"/><path class="j" d="M42.084,75.67l-2.072-.14a.989.989,0,0,1-.092.285l1.875.281Z" transform="translate(-22.402 -42.396)"/><path class="j" d="M40.892,76.7l-1.862-.277a.654.654,0,0,1-.277.246,1.631,1.631,0,0,0-.294.176l1.427.47h.044l.439.14Z" transform="translate(-21.583 -42.896)"/><path class="j" d="M40.865,71l-.755.953a3.621,3.621,0,0,1,.04.8l.531.035Z" transform="translate(-22.509 -39.855)"/><path class="j" d="M36.981,65.81,35.55,67.03a2.361,2.361,0,0,1,.479.048l1.273-.852C37.183,66.078,37.065,65.937,36.981,65.81Z" transform="translate(-19.951 -36.944)"/><path class="j" d="M39.66,71.137h0l.132-.057Z" transform="translate(-22.256 -39.9)"/><path class="j" d="M38.181,67,37,67.781a2.359,2.359,0,0,1,.439.176l1.084-.553Z" transform="translate(-20.764 -37.611)"/><path class="j" d="M39.245,68.13l-1.045.531a1.633,1.633,0,0,1,.549.615l1.12-.325Z" transform="translate(-21.437 -38.245)"/><path class="j" d="M53.259,63.016l2.753-2.156a3.514,3.514,0,0,1-.479.04L52.96,62.656Z" transform="translate(-29.717 -34.167)"/><path class="j" d="M63.329,62.019h0a.514.514,0,0,0,.061-.439L59,62.994Z" transform="translate(-33.106 -34.571)"/><path class="j" d="M55.76,62.71l.149-.035,5.664-1.8a2.8,2.8,0,0,0-.11-.364l-5.637,2.2Z" transform="translate(-31.288 -33.971)"/><path class="j" d="M42.58,79l.031.026h0Z" transform="translate(-23.894 -44.343)"/><path class="j" d="M54.423,61.312,59.59,57.8a2.2,2.2,0,0,0-1.317.667,2.427,2.427,0,0,1-.97.562l-2.933,2.3Z" transform="translate(-30.508 -32.45)"/><path class="j" d="M61.232,58.367c-.061-.132-.123-.25-.171-.347a.509.509,0,0,0-.439-.25L55.85,61.028Z" transform="translate(-31.339 -32.434)"/><path class="j" d="M62.888,59.759c-.053-.136-.114-.272-.171-.4L58.41,61.489Z" transform="translate(-32.775 -33.325)"/><path class="j" d="M45.022,59.269l-.948-.439a2.688,2.688,0,0,1-.514.053l1.269.8Z" transform="translate(-24.444 -33.028)"/><path class="j" d="M161.74,80.39l3.877,3.078.54-.944-4.324-2.129Z" transform="translate(-137.782 -51.216)"/><path class="j" d="M55.246,65.89l3.407.215c.119-.162.259-.347.413-.536l-3.885.3Z" transform="translate(-30.963 -36.809)"/><path class="j" d="M59.835,64.426a2.427,2.427,0,0,1,.768-.676L56.38,64.7Z" transform="translate(-31.636 -35.788)"/><path class="j" d="M59.152,67.29A.439.439,0,0,1,59.258,67l.14-.193L56.65,66.64Z" transform="translate(-31.787 -37.409)"/><path class="j" d="M166.793,82.5l.47-.821L162.78,80.52Z" transform="translate(-138.365 -51.289)"/><path class="j" d="M49.442,57.85h0l-.092.048Z" transform="translate(-27.692 -32.478)"/><path class="j" d="M47.084,57.775V57.74H47.04l.07.075Z" transform="translate(-26.396 -32.417)"/><path class="j" d="M47.956,57.7h-.171l-.035.224Z" transform="translate(-26.795 -32.394)"/><path class="j" d="M46.048,58.669l-.8-.259a1.755,1.755,0,0,1-.189.14l.852.382Z" transform="translate(-25.286 -32.793)"/><path class="j" d="M46.708,58.061h0l-.215-.241-.162.048.334.184Z" transform="translate(-25.998 -32.462)"/><path class="j" d="M76.712,73l-.382.685C76.523,73.474,76.694,73.492,76.712,73Z" transform="translate(-42.827 -40.977)"/><path class="j" d="M51.136,61.661l2.2-1.163c-.211-.035-.4-.079-.588-.127l-1.993.8Z" transform="translate(-28.478 -33.892)"/><path class="j" d="M50.107,60.788l1.888-.755a5.056,5.056,0,0,1-.584-.193l-1.651.509Z" transform="translate(-27.922 -33.595)"/><path class="j" d="M52.239,62.5,54.68,60.86a2.919,2.919,0,0,1-.6-.11L51.8,61.962Z" transform="translate(-29.067 -34.105)"/><path class="j" d="M49.774,58.15h-.039l-.325.088Z" transform="translate(-27.726 -32.647)"/><path class="j" d="M46,75.94l4.311,3.473a.486.486,0,0,0,0-.07.478.478,0,0,1,0-.114l-2.994-3.152Z" transform="translate(-25.813 -42.626)"/><path class="j" d="M71.548,62.012a1.755,1.755,0,0,0-.149-.162l-.439.268Z" transform="translate(-39.815 -34.722)"/><path class="j" d="M71.676,62.915a1.453,1.453,0,0,0-.237-.465l-.8.14Z" transform="translate(-39.635 -35.059)"/><path class="j" d="M72.779,64.035a2.762,2.762,0,0,1-.619-.5l-.79-.25Z" transform="translate(-40.045 -35.524)"/><path class="j" d="M71.069,61.52a1.459,1.459,0,0,0-.154-.11l-.4.439Z" transform="translate(-39.568 -34.475)"/><path class="j" d="M66.3,63.05h0l-2.9,5.066a.316.316,0,0,1,.1-.035l3.24-4.724Z" transform="translate(-35.574 -35.395)"/><path class="j" d="M43,78.645h0a.346.346,0,0,0,.061.075l.378-.72Z" transform="translate(-24.13 -43.782)"/><path class="j" d="M62.671,75.5V75.44l-.171.3Z" transform="translate(-35.069 -42.346)"/><path class="j" d="M78.311,68.356l-.031-.066v.031Z" transform="translate(-43.921 -38.335)"/><path class="j" d="M172.69,82.208l3.332-3.354-.364-.263Z" transform="translate(-143.924 -50.207)"/><path class="j" d="M174.264,77.78l-3.174,4.649h0l3.574-4.36Z" transform="translate(-143.027 -49.752)"/><path class="j" d="M74.5,65.686l-.158-.47q-.093-.084-.193-.158L72.15,64Z" transform="translate(-40.482 -35.928)"/><path class="j" d="M69.991,67.72,64.92,70.885l.035.031,5.475-2.884Z" transform="translate(-36.427 -38.015)"/><path class="j" d="M73.042,70.654,72.73,73.53a1.145,1.145,0,0,0,.158-.035l.839-3.2Z" transform="translate(-40.808 -39.457)"/><path class="j" d="M68.49,73.051l.878,1.317a.743.743,0,0,1,.439.312.382.382,0,0,0,.241.114l-.5-2.274Z" transform="translate(-38.429 -40.708)"/><path class="j" d="M71.05,71.763l.522,2.344h.1l.307-2.827Z" transform="translate(-39.865 -40.012)"/><path class="j" d="M68.291,65.47,64.34,69.456h.075l4.456-3.591Z" transform="translate(-36.101 -36.753)"/><path class="j" d="M75.756,68.84,74,72.506a2.1,2.1,0,0,0,.36-.233l1.01-1.8c0-.1,0-.347.391-.707l.022-.031.026-.044h0a.812.812,0,0,0,.167-.676Z" transform="translate(-41.52 -38.643)"/><path class="j" d="M182.287,82.95l-.882.465-.834,3.157Z" transform="translate(-148.345 -52.652)"/><path class="j" d="M176.327,80.44l-4.447,3.587v0l5.053-3.152Z" transform="translate(-143.47 -51.244)"/><path class="j" d="M62.493,76.936V76.69l-.3.162Z" transform="translate(-34.895 -43.047)"/><path class="j" d="M65.24,75.289a.992.992,0,0,1,.07.549l2.094.922v-.176L65.464,75.17Z" transform="translate(-36.606 -42.194)"/><path class="j" d="M66,74.349l1.818,1.317a.971.971,0,0,1,.044-.509l-.878-1.317Z" transform="translate(-37.032 -41.448)"/><path class="j" d="M78.115,67.976l-.035-.066v.07Z" transform="translate(-43.809 -38.122)"/><path class="j" d="M52.2,79.279a1.179,1.179,0,0,1,.07-.3l-1.519-2.2c-.285,0-.492-.088-.439-.228a.268.268,0,0,1,.11-.136l-1-.1Z" transform="translate(-27.732 -42.84)"/><path class="j" d="M49.08,79.74l-.65.957.075.048a1.792,1.792,0,0,1,.408.619l1.058-.9Z" transform="translate(-27.176 -44.758)"/><path class="j" d="M47.269,78.13l-.509,1.357c.259.246.347.088.641.246l.654-.966Z" transform="translate(-26.239 -43.855)"/><path class="j" d="M165.6,84.889l.435-.76-3.446-2.74Z" transform="translate(-138.259 -51.777)"/><path class="j" d="M52.9,83.747a8.106,8.106,0,0,0,.07.878l.663-.149a.729.729,0,0,1,.382-.54.264.264,0,0,0,.105-.057l-.562-.439Z" transform="translate(-29.684 -46.834)"/><path class="j" d="M51.948,81.54l-.158.136c.211-.092.378.36.439.593a1.606,1.606,0,0,1,.035.29l.571-.3Z" transform="translate(-29.061 -45.768)"/><path class="j" d="M43.35,79.2a.332.332,0,0,0,.079.04l.171-.522Z" transform="translate(-24.326 -44.186)"/><path class="j" d="M44.161,77.136l-.391,1.181h.136L44.213,77Z" transform="translate(-24.562 -43.221)"/><path class="j" d="M44.34,78.82h.123l.105-.97Z" transform="translate(-24.882 -43.698)"/><path class="j" d="M45.319,76.23l-.189,1.7a.764.764,0,0,1,.54.3c.035.04.061.066.088.1l.5-1.322Z" transform="translate(-25.325 -42.789)"/><path class="j" d="M59.458,76.091l-.7-.031a.945.945,0,0,1,0,.29l.966.1Z" transform="translate(-32.971 -42.694)"/><path class="j" d="M59.468,77.33l-.088.966a1.756,1.756,0,0,0,.6.044l.255-.931Z" transform="translate(-33.319 -43.406)"/><path class="j" d="M58.432,77.23c-.189.562-.145.83.246.975l.088-.944Z" transform="translate(-32.726 -43.35)"/><path class="j" d="M169.35,92.892l0,0,0-.018Z" transform="translate(-142.051 -58.217)"/><path class="j" d="M62.48,78.14l.07.167h0a.158.158,0,0,0,0-.04l-.061-.1Z" transform="translate(-35.058 -43.86)"/><path class="j" d="M62.385,78.7h0l-.035-.088Z" transform="translate(-34.985 -44.124)"/><path class="j" d="M58.3,74l-.439.057a2.574,2.574,0,0,1,.364.751l.637.031Z" transform="translate(-32.466 -41.538)"/><path class="j" d="M50.725,75.048a1.7,1.7,0,0,0,.176-.378l-2.121.281Z" transform="translate(-27.373 -41.914)"/><path class="j" d="M51.474,71.3,47.15,73.03h.079l2.788-.378h0c.342-1.124,1.317-1.229,1.572-.628a2.4,2.4,0,0,0,.2.4l.439-.057Z" transform="translate(-26.458 -40.023)"/><path class="j" d="M47.13,75.518l2.432.246a.758.758,0,0,0,.158-.141L47.235,75.5Z" transform="translate(-26.447 -42.379)"/><path class="j" d="M62.738,77.76H62.72Z" transform="translate(-35.192 -43.647)"/><path class="j" d="M48.783,59.533l1.567-.492a7.456,7.456,0,0,1-.944-.492l-1.247.2Z" transform="translate(-27.025 -32.871)"/><path class="j" d="M31.286,76.257v-.031l-.176-.136Z" transform="translate(-17.46 -42.71)"/><path class="j" d="M29.58,75.45l.281.9h.048a.373.373,0,0,0,.439-.25l-.733-.724Z" transform="translate(-16.602 -42.312)"/><path class="j" d="M30.937,75.629a.878.878,0,0,0,0-.11l-.487-.259Z" transform="translate(-17.09 -42.245)"/><path class="j" d="M29.08,76.079l.11.878a.725.725,0,0,1,.171-.176L29.128,76Z" transform="translate(-16.321 -42.66)"/><path class="j" d="M27.692,77.8a2.29,2.29,0,0,0-.11,1.159l.228-1.475A1.427,1.427,0,0,0,27.692,77.8Z" transform="translate(-15.456 -43.49)"/><path class="j" d="M28.162,76.625l-.272,1.756a.632.632,0,0,0,.263-.154,3.411,3.411,0,0,1,.272-.909l-.114-.909A2.328,2.328,0,0,0,28.162,76.625Z" transform="translate(-15.654 -42.89)"/><path class="j" d="M33.159,74.006l.733.048a.878.878,0,0,0,.053-.474l-.825.36Z" transform="translate(-18.588 -41.302)"/><path class="j" d="M34.081,75.126,33.73,75.1A.277.277,0,0,0,34.081,75.126Z" transform="translate(-18.93 -42.155)"/><path class="j" d="M31.067,75.289a.48.48,0,0,0,0-.079l-.417-.141Z" transform="translate(-17.202 -42.138)"/><path class="j" d="M38.33,60.795a3.885,3.885,0,0,0,.645-.259l-.044-.176Z" transform="translate(-21.51 -33.886)"/><path class="j" d="M37.44,78.053l.382.2a1.239,1.239,0,0,0,.158-.075,2.151,2.151,0,0,1,.8-.281L37.8,77.57A1.317,1.317,0,0,0,37.44,78.053Z" transform="translate(-21.011 -43.541)"/><path class="j" d="M38.382,59.79a3.638,3.638,0,0,0-.751.439l-.171.206c0,.048.039.079.14.088l.817-.588Z" transform="translate(-21.022 -33.567)"/><path class="j" d="M30,73.46l.817.057a.29.29,0,0,1,.439-.105l.909-.391a.1.1,0,0,1,0-.035.474.474,0,0,0-.145-.206L30,73.39A.387.387,0,0,0,30,73.46Z" transform="translate(-16.835 -40.854)"/><path class="j" d="M31.965,67.9a1.5,1.5,0,0,0-.04.193,3.314,3.314,0,0,1-.105.47l.439-.68Z" transform="translate(-17.858 -38.105)"/><path class="j" d="M40,59.58l.105.439h.035l-.136-.4Z" transform="translate(-22.447 -33.449)"/><path class="j" d="M30.11,72.607l1.708-.522a.623.623,0,0,1-.285-.255l-1.4.711A.39.39,0,0,0,30.11,72.607Z" transform="translate(-16.899 -40.321)"/><path class="j" d="M33.148,65.55l-.558.171a3.367,3.367,0,0,0-.32.755H32.6Z" transform="translate(-18.111 -36.798)"/><path class="j" d="M33.715,64.193l.522-.825a.778.778,0,0,1-.105,0c-.162-.031-.628.4-.992.992l.571-.171Z" transform="translate(-18.599 -35.573)"/><path class="j" d="M63.79,79.447h0l1.177,1.8.114-.044a2.862,2.862,0,0,0,.61-.4L63.882,79.35Z" transform="translate(-35.793 -44.539)"/><path class="j" d="M40.29,59.451l.136.4.136-.053-.189-.378Z" transform="translate(-22.61 -33.359)"/><path class="j" d="M64.16,79.037l1.813,1.458a3.018,3.018,0,0,0,.338-.373L64.235,78.94Z" transform="translate(-36 -44.309)"/><path class="j" d="M63.21,79.788l.72,1.756a1.571,1.571,0,0,0,.593-.053L63.355,79.7Z" transform="translate(-35.467 -44.736)"/><path class="j" d="M64.48,78.712l2.081,1.177a2.735,2.735,0,0,0,.2-.32l-2.27-.878Z" transform="translate(-36.18 -44.169)"/><path class="j" d="M62.3,80.487,62.392,82h0a.36.36,0,0,1,.263-.141L62.37,80.43Z" transform="translate(-34.957 -45.145)"/><path class="j" d="M153.058,84.213l3.789-3.28-.356-.514-3.451,3.789Z" transform="translate(-132.901 -51.233)"/><path class="j" d="M62.71,80.105l.3,1.5a3.918,3.918,0,0,1,.509.083L62.837,80Z" transform="translate(-35.187 -44.904)"/><path class="j" d="M61.129,81.777,61.081,81a2.549,2.549,0,0,0-.176.2l-.4,1.071v.048a.793.793,0,0,0,.022.237l.584-.777Z" transform="translate(-33.953 -45.465)"/><path class="j" d="M64.65,78.411l2.248.878a1.954,1.954,0,0,0,.11-.29L64.7,78.35A.778.778,0,0,1,64.65,78.411Z" transform="translate(-36.275 -43.978)"/><path class="j" d="M65,77.373,67.239,78a.7.7,0,0,0,0-.092L65.154,77A1.857,1.857,0,0,1,65,77.373Z" transform="translate(-36.471 -43.221)"/><path class="j" d="M56.945,80.156l-.066-.338a.347.347,0,0,0-.439.031l.224.544A.926.926,0,0,0,56.945,80.156Z" transform="translate(-31.67 -44.766)"/><path class="j" d="M53.191,86.527l.272-.026a.377.377,0,0,0,.048-.061A1.41,1.41,0,0,0,53.7,86l-.615.14A1.352,1.352,0,0,0,53.191,86.527Z" transform="translate(-29.79 -48.27)"/><path class="j" d="M54.434,78.972l.075-.031-.219-.531c-.1.031-.162-.1-.1-.237l-.439-1.093a3.3,3.3,0,0,1-.944.123l1.4,2.081A1.316,1.316,0,0,1,54.434,78.972Z" transform="translate(-29.633 -43.266)"/><path class="j" d="M37.66,79.06l-.263-.14C37.379,79.043,37.458,79.113,37.66,79.06Z" transform="translate(-20.986 -44.298)"/><path class="j" d="M50.259,82.657a1.865,1.865,0,0,1,.25-.6l-.83.711C49.864,83.193,50.014,83.469,50.259,82.657Z" transform="translate(-27.877 -46.059)"/><path class="j" d="M55.713,77.873a.878.878,0,0,0,.325-.316l-.11-.593-.707-.075a.249.249,0,0,1-.061.04l.439,1.027A.437.437,0,0,1,55.713,77.873Z" transform="translate(-30.951 -43.159)"/><path class="j" d="M56.586,76.08a.312.312,0,0,0-.189-.11h-.088a.878.878,0,0,0-.439.2l.79.079A.44.44,0,0,0,56.586,76.08Z" transform="translate(-31.35 -42.643)"/><path class="j" d="M57.253,77.543a1.225,1.225,0,0,0,.132-.413H57.17Z" transform="translate(-32.079 -43.294)"/><path class="j" d="M60.63,83.866c.04.162.092.246.158.281l.373-.228h0a1.091,1.091,0,0,0,.079-.105L61.2,83.08Z" transform="translate(-34.02 -46.632)"/><path class="j" d="M152.927,89.1l-.057.061.057-.048Z" transform="translate(-132.806 -56.102)"/><path class="j" d="M144.74,76.53l1.572,1.629-.241-.975Z" transform="translate(-128.245 -49.051)"/><path class="j" d="M154.08,77.447l.843-.285-.492-3.411Z" transform="translate(-133.485 -47.492)"/><path class="j" d="M155.655,77.335l.962-.325-1.427-2.88Z" transform="translate(-134.107 -47.705)"/><path class="j" d="M40.73,59.256l.184.378a2.33,2.33,0,0,1,.3-.07l-.268-.373A1.811,1.811,0,0,0,40.73,59.256Z" transform="translate(-22.857 -33.23)"/><path class="j" d="M155.947,71.83l-.127.11.154-.061Z" transform="translate(-134.461 -46.414)"/><path class="j" d="M153.148,73.74l-1.1,3.964.773-.263.36-3.771Z" transform="translate(-132.346 -47.447)"/><path class="j" d="M157.915,82.344l-.373-.544-3.372,2.92Z" transform="translate(-133.535 -52.007)"/><path class="j" d="M153.676,85.814,158.2,84l-.514-.751-4.039,2.56Z" transform="translate(-133.244 -52.821)"/><path class="j" d="M150.51,83.061l.233.426,3.275-2.147Z" transform="translate(-131.482 -51.749)"/><path class="j" d="M151.16,83.572l.329.6L154.6,81.32Z" transform="translate(-131.847 -51.738)"/><path class="j" d="M149.91,82.683l.211.4,3.121-1.528Z" transform="translate(-131.145 -51.867)"/><path class="j" d="M154.854,73.194v0l0,0Z" transform="translate(-133.917 -47.177)"/><path class="j" d="M151.648,75.15l-1.778,3.71.83-.281Z" transform="translate(-131.123 -48.277)"/><path class="j" d="M152.03,84.307l.2.364,3-3.3Z" transform="translate(-132.335 -51.766)"/><path class="j" d="M157.525,76.459,155.26,73.68l1.5,3.038Z" transform="translate(-134.147 -47.452)"/><path class="j" d="M64.807,67.228l-.751-.048a.57.57,0,0,0,.215.206c0,.154-.053.6-.58.026s-.439.127-.6.259h0L64.363,68Z" transform="translate(-35.4 -37.712)"/><path class="j" d="M164.9,85.323v0l.294-.514L161.96,81.06Z" transform="translate(-137.905 -51.592)"/><path class="j" d="M148.81,86.56l.843.057-.645-1.967Z" transform="translate(-130.528 -53.606)"/><path class="j" d="M66.492,65.25l-1.027.079v.031c-.088.193-.29.408-.259.623l.878.053Z" transform="translate(-36.585 -36.63)"/><path class="j" d="M67.439,63.32a.585.585,0,0,1-.092,0,2.585,2.585,0,0,0-1.317.795l1-.057Z" transform="translate(-37.049 -35.547)"/><path class="j" d="M41.5,59.053l.281.391a1.422,1.422,0,0,1,.237,0,1.636,1.636,0,0,1,.268.044L41.763,59Z" transform="translate(-23.289 -33.124)"/><path class="j" d="M149.46,84.433l.681,2.063.47.031-1.141-2.107Z" transform="translate(-130.893 -53.477)"/><path class="a" d="M47.95,58.374l-.04.044.1.123,1.256-.215c-.11-.066-.215-.127-.312-.176l-.364.066Z" transform="translate(-26.884 -32.647)"/><path class="a" d="M46.313,58.351,45.7,58l-.105.053a1.237,1.237,0,0,0-.127.088l.8.259Z" transform="translate(-25.516 -32.563)"/><path class="a" d="M154.23,72.22l.048.026v-.013Z" transform="translate(-133.569 -46.633)"/><path class="a" d="M70.467,63.148l.092.061-.035.057.4.29.031-.035.083.075v.026l.364.263.092-.092.079.079-.079.083.575.413.119-.1.07.088-.1.075.61.439.145-.088.057.092-.105.066.439.312.1-.053L73.333,65,70.95,63.31l-.773-.439v-.026h0l.026-.075h-.022l-.083.044h0a.438.438,0,0,1-.088.088l.439.307Z" transform="translate(-39.282 -35.238)"/><path class="a" d="M78,68.571l.241.176a1.5,1.5,0,0,0-.1-.351L78.1,68.36Z" transform="translate(-43.764 -38.374)"/><path class="a" d="M61.123,77.54H61l-.255.931A1.629,1.629,0,0,0,61,78.422l.145-.54Z" transform="translate(-34.087 -43.524)"/><path class="a" d="M70.859,61.35c-.14-.075-.263-.07-.316.092s-.083.263-.123.364l.044-.026Z" transform="translate(-39.512 -34.416)"/><path class="a" d="M29.19,75.72l.233.751a.382.382,0,0,1,.22-.066l-.281-.9A.887.887,0,0,1,29.19,75.72Z" transform="translate(-16.383 -42.379)"/><path class="a" d="M53.592,87.14l-.272.026C53.381,87.285,53.469,87.3,53.592,87.14Z" transform="translate(-29.919 -48.909)"/><path class="a" d="M43.754,75.89h-.132l-.29.439h.061v.11H43.28l-.531.773h.075l-.035.11-.119-.066h0a2.063,2.063,0,0,1,.154.18l.43-.619.176-.329.088-.268.105.039h0l.048-.211.11.026-.162.681-.105.97a1.909,1.909,0,0,1,.224,0l.189-1.7Z" transform="translate(-23.945 -42.598)"/><path class="a" d="M64.842,63.174l-.413.738h0v.11h-.1l-.439.786h.092v.114h-.149l-.439.773h0l-.031.11h-.048l-.465.821h.039l-.053.1h-.044l-.54.944.061.048-.07.088-.048-.035-.439.755.061.079-.083.07-.039-.044-.294.514h0l.079.119.026-.1h.044l-.057-.105.277-.145v-.035h0l.039-.061.171-.3a.465.465,0,0,1,.215-.373l2.981-5.084A.742.742,0,0,1,64.842,63.174Z" transform="translate(-34.452 -35.401)"/><path class="a" d="M162.958,79.32l-.149.035-.079.04Z" transform="translate(-138.337 -50.616)"/><path class="a" d="M55.19,64.1l.509-.039,4.237-.948h.035a2.494,2.494,0,0,0,1.234-.5l-4.342.957Z" transform="translate(-30.968 -35.154)"/><path class="a" d="M161.251,79.8l.163-.013-.053-.079.044-.031-.031.009-.154.119.035.053h0Z" transform="translate(-137.49 -50.818)"/><path class="a" d="M161.945,79.73l-.136.07-.013-.026-.066.044.237-.018Z" transform="translate(-137.776 -50.846)"/><path class="a" d="M158.746,80.4l-.061.031.606-.294.009.018.044-.044.04.044.092-.1-.031-.04-.764.259Z" transform="translate(-136.065 -51.003)"/><path class="a" d="M40.487,70.14l.026.066.053-.035v-.026h.048v-.092L40.575,70l-1.115.342a1.759,1.759,0,0,1,.092.206l.136-.04Z" transform="translate(-22.144 -39.294)"/><path class="a" d="M30,73.183l1.993-.61a1.316,1.316,0,0,0-.246-.162l-1.7.522A1.089,1.089,0,0,0,30,73.183Z" transform="translate(-16.837 -40.646)"/><path class="a" d="M153.635,80.83l-.07-.14-.961.325v.022l-.11.018h0l-.843.285-.009.092-.114-.013,0-.04-.773.263-.048.176-.11-.031.031-.1-.83.281-.053.11.07.123,3.332-1.133Z" transform="translate(-131.056 -51.385)"/><path class="a" d="M39.56,59.661l.035.132h0l.066.092-.048.035.044.176.211-.1-.105-.439Z" transform="translate(-22.2 -33.438)"/><path class="a" d="M154.594,73.49l-.044.149.035-.07Z" transform="translate(-133.748 -47.346)"/><path class="a" d="M149.443,84.4l.009-.013-.013-.026-.009,0Z" transform="translate(-130.876 -53.443)"/><path class="a" d="M40.034,59.895l.031.105-.075.026.246,1,.149.075-.053.1-.061-.031.237.975.171.176L40.6,62.4l-.035-.035.215.878.325.439.035.07.053-.11,1.778-3.71.263-.944.105.031-.035-.048.066-.053-.127-.07-.035.066-.136.263.066.031-.066.1L43,59.28l-.193.4.075.044-.061.1-.044-.031-.233.483.053.053-.075.083-.031-.026-.334.694.031.031-.083.061-.356.786.048.1-.1.053h0l-.32.667.057.167-.11.035V62.92l-.237.5-.878-3.609L40,59.9v.035Z" transform="translate(-22.442 -33.039)"/><path class="a" d="M154.736,73.158l0-.009.04-.022,0,0-.044-.053-.022.088Z" transform="translate(-133.838 -47.11)"/><path class="a" d="M42.121,70.147l-.031-.057h0v.066h0Z" transform="translate(-23.62 -39.345)"/><path class="a" d="M47.43,57.937l-.061.031V58h-.044l-.035.031.119.061-.039-.035.127-.132.035-.224h-.14v.119Z" transform="translate(-26.537 -32.394)"/><path class="a" d="M154.34,72.25h0v.013l.026.013Z" transform="translate(-133.631 -46.65)"/><path class="a" d="M47.46,58.078l.04.035.154.083h0l.04-.044h0l0-.114.075-.022h0l.312-.277H47.82l-.206.224Z" transform="translate(-26.632 -32.417)"/><path class="a" d="M49.931,61.451H49.9l-.061-.092h0l-.439-.54-.105.057-.053-.1.083-.044-.4-.492-.11.044-.044-.105.079-.031-.347-.439-.114.035-.031-.11.066-.022-.619-.768-.1-.123h0l-.053.1-.057.022-.066.053.035.048h0l.044.053h0l.053-.026.119.237,2.265,2.779.031.04.136-.149.127.114.048-.035h0l.154-.119,2.933-2.3a3.111,3.111,0,0,1-.522.123L50.2,61.815Z" transform="translate(-26.671 -32.966)"/><path class="a" d="M32.813,63.342l-.522.825.031.1-.11.035-.558.9h.136v.11h-.22l-.439.68a.525.525,0,0,1-.057.171h.066l-.022.11h-.079a8.2,8.2,0,0,1-.439.966l2.467-3.921A.878.878,0,0,1,32.813,63.342Z" transform="translate(-17.174 -35.547)"/><path class="a" d="M30,74.352v.083l.3.1.439.066a.659.659,0,0,1,.075-.215L30,74.33Z" transform="translate(-16.837 -41.723)"/><path class="a" d="M33.311,74.66a.521.521,0,0,0,.127.132l.351.026a.439.439,0,0,0,.154-.219l-.733-.048C33.241,74.585,33.276,74.616,33.311,74.66Z" transform="translate(-18.638 -41.847)"/><path class="a" d="M42.334,75.382V75.36l-.11-.211-.474-.031.031.1-.105.035-.048-.14-.839-.057h-.11L40.161,75a.544.544,0,0,1-.031.224l2.072.141Z" transform="translate(-22.52 -42.099)"/><path class="a" d="M156.134,79.76l-.132.149-.092.1.04.04-.457.417-3,3.3.088.158.062.009.017-.013.057-.061v-.022h.017l3.451-3.789-.057-.079.136-.1Z" transform="translate(-132.593 -50.863)"/><path class="a" d="M37.042,63.147l.088.07-.057.079.562.755L37.7,64l.07.083-.061.057c.1.127.2.268.32.439h0l.066.1h0l.32.439.083-.044.053.1-.066.035.623.773.04.053h0l.031.057h0l.057.044-.022.031h0v.026L40.357,68.3l.11.211.119-.145v.022l.079-.066H40.6l-.088-.158-.2-.364-.057.053-.079-.083.079-.075-.272-.584-.061.044-.061-.1.07-.044-.233-.439-.057.026-.048-.1.053-.026-.215-.4-.061-.1-.035-.07-.325-.439c-.729-.948-1.594-2.085-1.989-2.634a.759.759,0,0,1-.18.132L37,63.2Z" transform="translate(-20.675 -35.278)"/><path class="a" d="M55.98,76.566h.11l.031.171h.215a.662.662,0,0,0,0-.228l-.79-.079c-.092.07-.18.141-.246.2h0l.707.075Z" transform="translate(-31.03 -42.901)"/><path class="a" d="M56.164,70.88h.114v.127l.768.079h.119v-.149h.04l-.079-.119-2.933-4.263-.2-.233-.057-.044h0l-.088-.1.044-.035-.035-.053h0l-.048.035-.136.1.053.075.356.518.092-.083.075.088-.105.088.378.544.11-.07.057.1-.105.066.518.751.035-.048.044.105h-.031l.733,1.062h.127v.114h-.075l.575.839h.127v.114h-.04l.246.36-.966-.1a.824.824,0,0,1-.022.1.445.445,0,0,1-.04.123l.334.031Z" transform="translate(-30.116 -37.101)"/><path class="a" d="M45.961,75.537v-.1h0l-.11.07h0l-.061.053.127.105,1.317.136-.053-.053.083-.079.14.149,1,.1a.584.584,0,0,1,.105-.048l.057-.035h0a.8.8,0,0,0,.255-.114l-2.432-.246Z" transform="translate(-25.695 -42.346)"/><path class="a" d="M62,77.086h.061v.088l.066-.044.1.145.114.061h.053V77.1l-.307-.083Z" transform="translate(-34.789 -43.232)"/><path class="a" d="M64.76,78.052l2.3.65a1.346,1.346,0,0,0,.044-.224l-2.239-.628A2.2,2.2,0,0,1,64.76,78.052Z" transform="translate(-36.337 -43.698)"/><path class="a" d="M168.943,90.915l-.048-.092-.044-.013-.026.1,0,.013Z" transform="translate(-141.753 -57.062)"/><path class="a" d="M61.792,77.444h-.04V77.4l-.1-.057.057-.1.114.066h0V77.22h-.2V77.7l.031.47A.876.876,0,0,0,61.88,78h0Z" transform="translate(-34.581 -43.344)"/><path class="a" d="M61.81,80.748l.048.773.075.057-.066.092.044.733a2.511,2.511,0,0,0,.206-.334l-.092-1.519C61.955,80.616,61.893,80.682,61.81,80.748Z" transform="translate(-34.682 -45.212)"/><path class="a" d="M62.052,76.406l-.1-.066.031-.04-.277.145.057.105.048.092h0l.1-.048.3-.162v-.2l-.11.088Z" transform="translate(-34.626 -42.789)"/><path class="a" d="M70.813,68.192v-.031l-.053-.1h0l.04.11-.215.075-.026-.079-.1.053L65,71.107a.969.969,0,0,1,.114.193l.224-.119h0l.057-.075h.044l.988-.522h0l.092-.061v.031l1.023-.536v-.035l.11-.026h0l.926-.487v-.14h.11v.061l.7-.351.044-.154.11.026v.057l.878-.465L68.71,72.125l-.022.075a2.2,2.2,0,0,0,.3-.132L70.743,68.4Z" transform="translate(-36.471 -38.206)"/><path class="a" d="M77.406,67.44l.026.079.215-.075-.04-.11v-.07a2.353,2.353,0,0,0-.338-.439l-.07-.066.158.47Z" transform="translate(-43.315 -37.477)"/><path class="a" d="M45.451,75.582l-.044.039-.075-.083.026-.026V75.49l-.119.145v.022h0l.184.149.9.786.057-.154.105.04-.07.189.786.637.079-.123.092.066-.083.127.878.72.075-.061.075.083-.057.048.878.72.132-.07.053.1-.088.048.562.439a.25.25,0,0,0,.066-.237l-4.289-3.477Z" transform="translate(-25.387 -42.374)"/><path class="a" d="M29.746,75.09c0,.044-.04.088-.066.132l.733.707a.878.878,0,0,0,.07-.25l-.171-.167Z" transform="translate(-16.658 -42.15)"/><path class="a" d="M40.05,59.529l.136.4.105-.044-.136-.4Z" transform="translate(-22.475 -33.398)"/><path class="a" d="M41.614,64.081l.11-.035-.057-.167L40.635,60.85l-.105.039L41.6,64.024Z" transform="translate(-22.745 -34.161)"/><path class="a" d="M45.727,59.216l.048-.1-.048-.031-.852-.4a.664.664,0,0,1-.145.057l.948.439Z" transform="translate(-25.101 -32.944)"/><path class="a" d="M44.584,59.87l.061-.1-.075-.044-1.269-.8h-.2l1.422.878Z" transform="translate(-24.186 -33.084)"/><path class="a" d="M40.48,59.375l.189.378.105-.035-.184-.378Z" transform="translate(-22.716 -33.314)"/><path class="a" d="M42.335,63.117l.1-.053-.035-.1L41.26,60.65l-.11.035L42.34,63.1Z" transform="translate(-23.092 -34.049)"/><path class="a" d="M41.23,59.168l.268.373h.132l-.281-.391Z" transform="translate(-23.137 -33.208)"/><path class="a" d="M43.328,62.068l.079-.07-.035-.048L42.283,60.43H42.16l1.155,1.611Z" transform="translate(-23.659 -33.926)"/><path class="a" d="M43.707,60.488l.075-.083-.053-.053L42.245,59H42.1l.522.483c.048,0,.061.026.048.044l1.005.931Z" transform="translate(-23.625 -33.124)"/><path class="a" d="M46.738,58.439l.061.035.053-.1h0L46.7,58.29l-.119-.061h-.07l-.334-.184A1.252,1.252,0,0,0,46,58l.6.334Z" transform="translate(-25.813 -32.563)"/><path class="a" d="M154.554,72.19l-.018.009-.026.022h.044Z" transform="translate(-133.726 -46.616)"/><path class="a" d="M47.423,57.848V57.73H47.37Z" transform="translate(-26.582 -32.411)"/><path class="a" d="M154.294,71.748l.031.035-.035-.083Z" transform="translate(-133.603 -46.342)"/><path class="a" d="M154.524,71.59h0l.009.018Z" transform="translate(-133.731 -46.28)"/><path class="a" d="M47.164,57.877l.11.119h0l.061-.031-.053-.088-.044-.1H47.12v.035Z" transform="translate(-26.441 -32.439)"/><path class="a" d="M46.941,58.054h0l.035-.031L47,58h0l-.075-.136L46.9,57.83l-.07-.07-.132.022.215.241Z" transform="translate(-26.206 -32.428)"/><path class="a" d="M48.12,58.067l.184-.048h.057l.145-.114v-.035l.07-.039h-.105l-.312.277Z" transform="translate(-27.002 -32.467)"/><path class="a" d="M48.249,58.215l-.039-.1-.184.048-.075.022.026.11h0l.61-.158.325-.088-.1-.048Z" transform="translate(-26.907 -32.563)"/><path class="a" d="M48.731,57.949h0l-.154.061H48.52l.04.1.566-.22a1.173,1.173,0,0,0-.158-.061l-.11.044Z" transform="translate(-27.227 -32.467)"/><path class="a" d="M48.99,57.78l-.07.04.035.057.026.048h0l.119-.066.092-.048-.123-.031-.048.035Z" transform="translate(-27.451 -32.439)"/><path class="a" d="M49.091,57.805l.048-.035H49.06Z" transform="translate(-27.53 -32.434)"/><path class="a" d="M70.607,62.011l.439-.268c-.026-.031-.057-.057-.083-.083l-.549.32-.044.026v.044Z" transform="translate(-39.484 -34.616)"/><path class="a" d="M70.295,62.663V62.58a.78.78,0,0,1-.075.119h0Z" transform="translate(-39.4 -35.132)"/><path class="a" d="M70.362,62.445h.031V62.41l.07.022.8-.14-.075-.1-.61.105-.237.04h0Z" transform="translate(-39.467 -34.913)"/><path class="a" d="M70.456,62.72v.035l-.026.075h0l.035-.07.378.2.79.25a.4.4,0,0,1-.07-.136h0l-1.036-.325Z" transform="translate(-39.517 -35.21)"/><path class="a" d="M70.465,62.81l-.035.07v.026l.773.413,2,1.071c-.272-.2-.623-.439-.935-.628l-1.409-.755Z" transform="translate(-39.517 -35.261)"/><path class="a" d="M66.974,63.691l-.092-.061-.035.053L63.62,68.407a.514.514,0,0,1,.145,0l3.174-4.658Z" transform="translate(-35.697 -35.721)"/><path class="a" d="M62.43,75.9l.092-.079h0l.1-.061h0V75.61l-.162.241Z" transform="translate(-35.03 -42.441)"/><path class="a" d="M169.512,90.33l.061-.088-.035.031-.066-.083-.026.035-.026.039Z" transform="translate(-142.09 -56.714)"/><path class="a" d="M70,67.452l-.057-.092-.145.088L64.74,70.6a.713.713,0,0,1,.079.083l5.071-3.165Z" transform="translate(-36.326 -37.813)"/><path class="a" d="M169.77,89.856l.009.009.1-.075Z" transform="translate(-142.286 -56.49)"/><path class="a" d="M69.145,66.278l-.07-.088-.119.1L64.5,69.878h.053a.5.5,0,0,0,.048.048l4.447-3.587Z" transform="translate(-36.191 -37.157)"/><path class="a" d="M62.522,75.979l-.092.079h0l.066.083.035-.031.11-.088V75.9h0Z" transform="translate(-35.03 -42.604)"/><path class="a" d="M67.644,64.581v-.026l-.083-.075-.031.035L64,68.875h0l.68-.654Z" transform="translate(-35.91 -36.198)"/><path class="a" d="M68.18,65.179,68.1,65.1l-.092.092L64.68,68.568l-.68.659a.546.546,0,0,1,.136,0l3.951-3.986Z" transform="translate(-35.91 -36.545)"/><path class="a" d="M66.934,65.09v-.11h0l-1.041.079a.747.747,0,0,0-.083.119l1.027-.079Z" transform="translate(-36.926 -36.478)"/><path class="a" d="M54.612,65.6H54.16v.057l.044-.035.061.07v-.022h.105v-.035l.053.026v-.031l.162.044,3.894-.263c.031-.04.066-.079.1-.123l-3.468.272Z" transform="translate(-30.391 -36.652)"/><path class="a" d="M161.51,80.53l.2.233,3.231,3.745.039.044.083-.07L165,84.407l-3.012-3.5Z" transform="translate(-137.653 -51.295)"/><path class="a" d="M161.345,80.107l0-.026-.061-.07-.044.035h0l-.044.035.088.1Z" transform="translate(-137.479 -51.003)"/><path class="a" d="M161.446,80.3V80.23l-.057.075-.009.013.057.044.474.378,3.446,2.74.044.04.075-.092-.062-.048L161.538,80.3Z" transform="translate(-137.58 -51.127)"/><path class="a" d="M55.91,66.449l2.748.171.079-.105L55.33,66.3Z" transform="translate(-31.047 -37.219)"/><path class="a" d="M66.08,67.1v-.114h-.092l-.878-.053a.245.245,0,0,0,.044.114l.751.048Z" transform="translate(-36.533 -37.572)"/><path class="a" d="M161.53,80.168v.066l.092,0,.092,0-.105-.053.035-.061-.11-.009v.022Z" transform="translate(-137.664 -51.065)"/><path class="a" d="M55.038,66.244h-.066L54.81,66.2v.031l.364.18,4.483,1.159h.048l.031-.11h0l-1.273-.329c-.105.092-.294.066-.316-.079l-2.5-.65Z" transform="translate(-30.755 -37.162)"/><path class="a" d="M161.811,80.076l-.048-.026-.018.04-.035.061.105.053,4.324,2.129.044.022.048-.1-.039-.018-4.013-1.98Z" transform="translate(-137.765 -51.026)"/><path class="a" d="M54.39,61.359l.057.079h.022l.062-.044L54.5,61.32l.316-.158h0l.176-.07h.04L59.8,57.834a1.037,1.037,0,0,0-.2,0L54.43,61.346Z" transform="translate(-30.52 -32.467)"/><path class="a" d="M161.979,79.489l-.009-.031.233-.075.079-.04.044-.022-.18.07-.035-.092-.321.158.039.075.013.026Z" transform="translate(-137.81 -50.605)"/><path class="a" d="M55.76,61.819l1.163-.439,4.307-2.129-.048-.1L55.8,61.8Z" transform="translate(-31.288 -33.208)"/><path class="a" d="M55.536,62.408l-.176.07h0l.035.092.18-.07,5.637-2.2-.04-.105-4.478,1.73Z" transform="translate(-31.064 -33.797)"/><path class="a" d="M55.283,63.215l-.233.07v.035l.022.07H55.1l1.686-.531,4.39-1.4a1.04,1.04,0,0,0,0-.114l-5.663,1.8Z" transform="translate(-30.89 -34.436)"/><path class="a" d="M49.43,60.184l.031.11.114-.035,1.651-.522-.162-.066-1.567.492Z" transform="translate(-27.737 -33.499)"/><path class="a" d="M52.75,62.644l.061.092h.031l2.573-1.756h-.2l-2.441,1.651Z" transform="translate(-29.6 -34.234)"/><path class="a" d="M50.37,61.046l.044.105.11-.044,1.993-.8-.18-.048-1.888.764Z" transform="translate(-28.264 -33.83)"/><path class="a" d="M51.44,61.873l.053.1.105-.057,2.283-1.212-.154-.035h0l-2.2,1.163Z" transform="translate(-28.865 -34.06)"/><path class="a" d="M33.645,65.347l-.031-.1h0l-.571.171c-.031.048-.057.1-.083.145l.58-.171Z" transform="translate(-18.498 -36.63)"/><path class="a" d="M32.666,67.7v-.11H32.2a1.1,1.1,0,0,0-.031.114h.285Z" transform="translate(-18.055 -37.942)"/><path class="a" d="M31.711,69.85h-.066a.992.992,0,0,1-.035.105h.079Z" transform="translate(-17.741 -39.21)"/><path class="a" d="M33.516,63.689l.057-.079-.088-.07-.04.053-2.88,3.776L30.5,67.5l.3-.25Z" transform="translate(-17.118 -35.67)"/><path class="a" d="M30.378,73l-.048.04h0v.035h.035Z" transform="translate(-17.023 -40.977)"/><path class="a" d="M30.4,72.192l-.022-.035-.132.07h-.035c-.022.053-.04.105-.057.154l1.4-.711a.29.29,0,0,1-.031-.11L30.677,72Z" transform="translate(-16.922 -40.169)"/><path class="a" d="M39.2,67.921l-.053-.1-.083.044L38,68.417l.11.07,1.045-.531Z" transform="translate(-21.325 -38.071)"/><path class="a" d="M30.6,71.76l.026.035.022.035.281-.189.834-.558a.75.75,0,0,1,.026-.154l-1.014.676Z" transform="translate(-17.174 -39.816)"/><path class="a" d="M38.019,66.877l-.066-.1h0l-1.273.852.149.035L38,66.877Z" transform="translate(-20.585 -37.488)"/><path class="a" d="M36.851,65.573l-.07-.083-.061.048-1.55,1.317a1.264,1.264,0,0,1,.189,0l1.431-1.221Z" transform="translate(-19.738 -36.764)"/><path class="a" d="M30.393,70.984l-.083.2h0l.048-.04.07-.061.18-.154L31.7,70c.031-.075.07-.158.114-.246l-1.124.988Z" transform="translate(-17.011 -39.154)"/><path class="a" d="M39.139,61.335l-.031-.105-.07.022-.211.061c-.171.088-.338.176-.487.268l.724-.22Z" transform="translate(-21.516 -34.374)"/><path class="a" d="M38.682,60.162l-.066-.092h0l-.817.588h.057a.922.922,0,0,0,.184-.039l.6-.439Z" transform="translate(-21.213 -33.724)"/><path class="a" d="M37.46,60.966l.171-.206A.439.439,0,0,0,37.46,60.966Z" transform="translate(-21.022 -34.111)"/><path class="a" d="M38.9,63.181l.061.031.053-.1-.149-.075-1.238-.606a.713.713,0,0,0-.083.075h.026Z" transform="translate(-21.067 -35.048)"/><path class="a" d="M39.143,64.533l.083-.079-.171-.176L37.488,62.65h-.026a.393.393,0,0,0-.061.057h0l1.73,1.8Z" transform="translate(-20.989 -35.171)"/><path class="a" d="M151.69,77.474l.11.031.048-.176,1.1-3.964.044-.149.009-.1.017,0,.022-.088h0l-.11-.031-.259.944-.948,3.429Z" transform="translate(-132.144 -47.071)"/><path class="a" d="M154.76,73.188l0,.009.066,0v.035l.07-.013.048.351,1.427,2.88.07.141.04-.022.061-.031-.066-.127-1.5-3.038-.119-.237-.057.026h0Z" transform="translate(-133.866 -47.149)"/><path class="a" d="M154.248,73.308l.044,0v-.035l-.066,0H154.2l-.018,0-.009.1-.009.079-.36,3.771,0,.04.114.013.009-.092.351-3.7Z" transform="translate(-133.328 -47.217)"/><path class="a" d="M154.934,73.33l-.07.013-.044,0,.026.167.492,3.411h0l.11-.018v-.022l-.465-3.2Z" transform="translate(-133.9 -47.256)"/><path class="a" d="M154.428,80.4l.022.031.132-.119-.009-.018-.606.294-.04.022-.483.237-3.122,1.528-.053.026.053.1.053-.026,3.508-1.721Z" transform="translate(-131.347 -51.16)"/><path class="a" d="M155.523,80.313l-.04-.04-.039-.044-.044.044-.132.118.039.066-.386.25-3.113,2.854-.079.075.075.083.057-.053,3.2-2.937Z" transform="translate(-132.166 -51.127)"/><path class="a" d="M154.831,80.627l-.04-.066-.022-.031-.544.356-3.275,2.147-.07.044.066.1.057-.044,3.442-2.252Z" transform="translate(-131.69 -51.295)"/><path class="a" d="M40.84,70.8l-.176.123-.615.777a.317.317,0,0,0,.026.149l.755-.961Z" transform="translate(-22.475 -39.743)"/><path class="a" d="M149.273,84.107l-.013-.013-.009,0-.013.009-.018.026Z" transform="translate(-130.758 -53.292)"/><path class="a" d="M149.4,84.215l.022-.026-.057-.048.018.053Z" transform="translate(-130.837 -53.32)"/><path class="a" d="M149.085,84.331l-.022-.061-.053.035.009.017h0Z" transform="translate(-130.641 -53.393)"/><path class="a" d="M40.717,70.671v-.1l-.171.075-.716.5.026.119.676-.474Z" transform="translate(-22.352 -39.614)"/><path class="a" d="M149.4,84.26l.013.048.009,0,0,0-.009-.018Z" transform="translate(-130.859 -53.387)"/><path class="a" d="M32.958,73.8l.847-.36-.026-.11-.909.391Z" transform="translate(-18.447 -41.162)"/><path class="a" d="M40.641,70.452v-.026h0l-.026-.066-.8.351-.132.057a.743.743,0,0,1,.04.105l.755-.329Z" transform="translate(-22.268 -39.496)"/><path class="a" d="M149.25,84.235l-.013-.048-.018-.053,0,0h0l-.053.018-.048.013.009.031.022.061.044,0-.009.1.645,1.967.044.14.11-.035-.031-.1-.681-2.063Z" transform="translate(-130.697 -53.314)"/><path class="a" d="M148.87,84.4l-.044,0-.066-.009h0l0,.026-.009.1-.013.1-.18,1.791,0,.013.114.013v-.018l.2-1.91Z" transform="translate(-130.382 -53.46)"/><path class="a" d="M152.722,89.191l.044-.031,0-.031-.057.048-.018.013-.075.066-.031.026.075.083.048-.04.061-.053Z" transform="translate(-132.649 -56.119)"/><path class="a" d="M153.137,84.769l.421-.268,3.372-2.92.105-.088-.075-.083-.092.079-3.789,3.28Z" transform="translate(-132.924 -51.789)"/><path class="a" d="M47.37,75.393l2.485.123a1.186,1.186,0,0,0,.079-.11l-1.945-.1Z" transform="translate(-26.582 -42.273)"/><path class="a" d="M154.336,89.124l-.079,0-.057.022Z" transform="translate(-133.552 -56.114)"/><path class="a" d="M153.5,89.084l-.026,0-.136.088.119-.013-.018-.048Z" transform="translate(-133.07 -56.091)"/><path class="a" d="M56.87,76h.088A.291.291,0,0,0,56.87,76Z" transform="translate(-31.911 -42.656)"/><path class="a" d="M59.464,75.955v-.114h-.127L58.7,75.81a.885.885,0,0,1,0,.114l.7.031Z" transform="translate(-32.937 -42.553)"/><path class="a" d="M153.28,89.314h0v0Z" transform="translate(-133.036 -56.22)"/><path class="a" d="M152.99,89.116l.1-.061h-.057l-.017,0h-.018v.035Z" transform="translate(-132.873 -56.074)"/><path class="a" d="M153.031,85.593l-.1.061-.044.031.053.083,0,.009.114-.07,0,0v-.009l.022,0,.136-.088,4.039-2.56.105-.066-.061-.1-.11.07-3.745,2.375Z" transform="translate(-132.817 -52.613)"/><path class="a" d="M58.276,73.794V73.68h-.127l-.439.057.061.105.439-.057Z" transform="translate(-32.382 -41.359)"/><path class="a" d="M46.54,74.768l-.233.092-.022-.057H46.14v.1l.439-.053h.105l.619-.083,2.121-.281a.519.519,0,0,1,.044-.123l-2.788.378Z" transform="translate(-25.892 -41.74)"/><path class="a" d="M153.57,86.767l.018.048.026.057.233-.092.057-.022,4.32-1.73.035-.013-.044-.105-.057.022-4.526,1.813Z" transform="translate(-133.199 -53.752)"/><path class="a" d="M41.743,76.591v-.11h-.061L39.807,76.2c0,.035-.035.07-.057.105l1.862.277Z" transform="translate(-22.307 -42.772)"/><path class="a" d="M31.079,74.94a.109.109,0,0,1,0-.035.127.127,0,0,1,0-.039L30.64,74.8Z" transform="translate(-17.197 -41.987)"/><path class="a" d="M29.856,75l-.026.061.566.439.176.136V75.5l-.479-.369Z" transform="translate(-16.742 -42.099)"/><path class="a" d="M37.38,78.78l.263.14a.661.661,0,0,0,.145-.053l-.382-.2A.654.654,0,0,0,37.38,78.78Z" transform="translate(-20.977 -44.158)"/><path class="a" d="M29.928,74.83a.245.245,0,0,0,0,.053l.255.136.487.259a1.161,1.161,0,0,0,0-.123l-.413-.219Z" transform="translate(-16.796 -42.004)"/><path class="a" d="M38.25,77.463l.988.325a1.155,1.155,0,0,1,.544.061l-1.427-.47a1.1,1.1,0,0,0-.105.083Z" transform="translate(-21.465 -43.434)"/><path class="a" d="M42.3,78.79l.035-.11h-.075l-.439-.141a1.1,1.1,0,0,1,.325.224h.04Z" transform="translate(-23.468 -44.085)"/><path class="a" d="M30.281,74.671,30,74.57a.9.9,0,0,1,0,.114l.321.105.417.14v-.119Z" transform="translate(-16.837 -41.858)"/><path class="a" d="M27.868,77.177l-.228,1.475a.1.1,0,0,0,.11.044l.272-1.756A1.633,1.633,0,0,0,27.868,77.177Z" transform="translate(-15.514 -43.187)"/><path class="a" d="M28.85,76.282l.114.909c.031-.057.061-.11.1-.162l-.11-.878A1.425,1.425,0,0,0,28.85,76.282Z" transform="translate(-16.192 -42.744)"/><path class="a" d="M53.073,86.013l.615-.14a1.007,1.007,0,0,1,.035-.123l-.663.149Z" transform="translate(-29.773 -48.129)"/><path class="a" d="M47.227,77.65l-.105-.04-.057.154-.5,1.335.088.092.509-1.357Z" transform="translate(-26.127 -43.563)"/><path class="a" d="M49.045,79.366l-.092-.066-.079.123-.654.966.092.061.65-.957Z" transform="translate(-27.058 -44.511)"/><path class="a" d="M50.737,81.323l-.075-.083-.075.061-1.058.9.053.105.83-.711a.329.329,0,0,1,.11-.092l.158-.136Z" transform="translate(-27.793 -45.599)"/><path class="a" d="M53.635,83.11,53.582,83l-.132.07-.571.3a1.082,1.082,0,0,1,0,.123l.659-.342Z" transform="translate(-29.672 -46.587)"/><path class="a" d="M59.352,77h-.114v.127l-.088.944h0l.105.035.088-.966Z" transform="translate(-33.19 -43.221)"/><path class="a" d="M48.983,76l-.083.079.053.053,2.955,3.152a1,1,0,0,1,0-.162l-2.783-2.972Z" transform="translate(-27.44 -42.66)"/><path class="a" d="M53.992,79.441,52.56,77.36h-.14l1.519,2.2Z" transform="translate(-29.414 -43.423)"/><path class="a" d="M51.93,76.41h0Z" transform="translate(-29.14 -42.89)"/><path class="a" d="M56.5,80.531,56.277,80h-.031a.132.132,0,0,1-.066.04l.22.531Z" transform="translate(-31.524 -44.904)"/><path class="a" d="M55.434,78.007,55,76.98l-.105.044.439,1.093A.324.324,0,0,1,55.434,78.007Z" transform="translate(-30.8 -43.21)"/><path class="a" d="M57.506,79.933a.708.708,0,0,0-.066-.053l.066.338A.224.224,0,0,0,57.506,79.933Z" transform="translate(-32.23 -44.837)"/><path class="a" d="M56.96,76.69h-.11l.026.14.11.593a1.665,1.665,0,0,0,.088-.149l-.083-.439Z" transform="translate(-31.899 -43.047)"/><path class="a" d="M74.047,70.023v-.057l-.11-.026-.044.154-.843,3.2.127-.044.022-.075Z" transform="translate(-40.987 -39.261)"/><path class="a" d="M65.35,76.854l2.116.931a1.171,1.171,0,0,0,0-.123l-2.094-.922A.447.447,0,0,0,65.35,76.854Z" transform="translate(-36.668 -43.075)"/><path class="a" d="M65.816,75l-.066.092h0l1.941,1.414v-.057a.656.656,0,0,1,0-.092L65.86,75Z" transform="translate(-36.892 -42.099)"/><path class="a" d="M68.322,73.643l-.092.061h0l.878,1.317a.145.145,0,0,1,.088-.075l-.878-1.317Z" transform="translate(-38.283 -41.331)"/><path class="a" d="M70.91,72.359l-.11.026v.035l.527,2.274a1.086,1.086,0,0,0,.119,0l-.522-2.344Z" transform="translate(-39.725 -40.612)"/><path class="a" d="M72.917,71h-.11v.14L72.5,73.968h.119l.312-2.876Z" transform="translate(-40.679 -39.855)"/><path class="a" d="M75.308,73.805a1.269,1.269,0,0,1,.22-.378l.382-.7a1.1,1.1,0,0,0,0-.171.3.3,0,0,1,0-.044l-1.01,1.8A1.317,1.317,0,0,0,75.308,73.805Z" transform="translate(-42.025 -40.702)"/><path class="a" d="M78.12,70.82l.031-.04h0Z" transform="translate(-43.831 -39.732)"/><path class="a" d="M63.54,79.633l1.168,1.782.11-.04-1.177-1.8Z" transform="translate(-35.652 -44.668)"/><path class="a" d="M62.595,78.287v-.035l-.075-.061Z" transform="translate(-35.08 -43.889)"/><path class="a" d="M169.4,91.295l-.1-.145-.066.044-.009,0Z" transform="translate(-141.983 -57.252)"/><path class="a" d="M63,79.893l.685,1.673h.132L63.1,79.81Z" transform="translate(-35.349 -44.797)"/><path class="a" d="M62.26,78l.053.263.035.088a.942.942,0,0,0,.079-.105l-.07-.167Z" transform="translate(-34.934 -43.782)"/><path class="a" d="M62.48,80.315l.285,1.427h.114l-.3-1.5Z" transform="translate(-35.058 -45.038)"/><path class="a" d="M62.114,77.854,62,77.74h0l.088.553h0a1.007,1.007,0,0,0,.1-.1v-.11Z" transform="translate(-34.789 -43.636)"/><path class="a" d="M62.8,77.81Z" transform="translate(-35.215 -43.675)"/><path class="a" d="M64.5,78.575l2.27.878a1.075,1.075,0,0,0,.044-.105l-2.248-.878Z" transform="translate(-36.191 -44.046)"/><path class="a" d="M169.05,91.526l.018.009-.035-.035.022-.026-.022-.013-.022.048Z" transform="translate(-141.86 -57.426)"/><path class="a" d="M62.147,77.454l-.114-.061-.171-.1-.114-.066-.057.1.1.057h.022l.048-.061.321.259a.831.831,0,0,0,0-.11h-.035Z" transform="translate(-34.615 -43.35)"/><path class="a" d="M64.33,78.828l2.077,1.181a.636.636,0,0,0,.07-.092L64.4,78.74Z" transform="translate(-36.096 -44.197)"/><path class="a" d="M64,79.243,65.8,80.7l.083-.079L64.075,79.16Z" transform="translate(-35.91 -44.433)"/><path class="a" d="M61.98,77.47l-.048.061-.022.026.04.031.114.1.1.079h.031l.075.061a.939.939,0,0,0,.035-.119Z" transform="translate(-34.738 -43.485)"/><path class="a" d="M43.7,77.929l-.171.522a.513.513,0,0,0,.105.04l.391-1.181Z" transform="translate(-24.427 -43.395)"/><path class="a" d="M151.759,90.531l.009-.022-.11-.039-.088.268.127-.241Z" transform="translate(-132.077 -56.871)"/><path class="a" d="M44.6,76.276l-.1-.026-.048.211h.031l-.07.132L44.1,77.91h.114l.228-.966Z" transform="translate(-24.747 -42.8)"/><path class="a" d="M43.8,76.962l.053-.105.07-.132h-.031l-.061-.035-.123.242-.2.334-.386.746.088.075.25-.483Z" transform="translate(-24.197 -43.047)"/><path class="a" d="M60.51,82.531l.4-1.071A1.589,1.589,0,0,0,60.51,82.531Z" transform="translate(-33.952 -45.723)"/><path class="a" d="M61,85.235c.11.057.246-.048.382-.215h0Z" transform="translate(-34.228 -47.72)"/><path class="a" d="M61.249,82.827l-.075-.057h0l-.584.777a1.351,1.351,0,0,0,.031.154l.575-.773Z" transform="translate(-33.998 -46.458)"/><path class="j" d="M118.328,119.08l-.948-.47a.438.438,0,0,0,.088.145,1.072,1.072,0,0,1,.294.509l.584.413Z" transform="translate(-65.855 -66.563)"/><path class="j" d="M119.007,113.73l-.277.119a1.621,1.621,0,0,1,0,.623l.277-.048Z" transform="translate(-66.612 -63.825)"/><path class="j" d="M118.28,117.592l-.781-.162a.734.734,0,0,0-.158.439l.962.474Z" transform="translate(-65.833 -65.901)"/><path class="j" d="M120.42,121.539a.717.717,0,0,0,.171-.057l-.312-.061Z" transform="translate(-67.482 -68.139)"/><path class="j" d="M118.35,120.6v.031l.127.061Z" transform="translate(-66.399 -67.679)"/><path class="j" d="M119.94,121.36h0v.158a1.363,1.363,0,0,0,.189,0Z" transform="translate(-67.291 -68.106)"/><path class="j" d="M119.675,121.576H119.6a.84.84,0,0,0,.145.026l-.07-.053Z" transform="translate(-67.1 -68.212)"/><path class="j" d="M120.367,121.126l-.1.035.439.088a.44.44,0,0,0,.119-.149l-.439.026Z" transform="translate(-67.476 -67.96)"/><path class="j" d="M118.76,121.32Z" transform="translate(-66.629 -68.083)"/><path class="j" d="M118.5,121.05a.078.078,0,0,0,0,.035h.14Z" transform="translate(-66.481 -67.932)"/><path class="j" d="M118.507,115.48l-.29.053a.983.983,0,0,1-.092.237c-.11.189-.228.351-.325.5l.738.158Z" transform="translate(-66.091 -64.807)"/><path class="j" d="M120.1,115.962l-.369-3.345v-.026l.105,3.644Z" transform="translate(-67.173 -63.186)"/><path class="j" d="M121.064,119.921a2.1,2.1,0,0,0,.039-.351l-.553.527Z" transform="translate(-67.633 -67.101)"/><path class="j" d="M118.64,112.386l.241-.162C118.772,112.2,118.693,112.276,118.64,112.386Z" transform="translate(-66.562 -62.977)"/><path class="j" d="M120.738,115.674h0l-.654-2.551c-.04-.075-.079-.136-.114-.193l.347,3.157Z" transform="translate(-67.308 -63.377)"/><path class="j" d="M120.56,114.05h0l.558,2.164a5.465,5.465,0,0,0-.558-2.164Z" transform="translate(-67.639 -64.005)"/><path class="j" d="M226.48,135.24l0,.013.018-.009-.013,0Z" transform="translate(-174.099 -81.986)"/><path class="j" d="M119.32,112.28h0v.026Z" transform="translate(-66.943 -63.012)"/><path class="j" d="M121.306,120.84a.329.329,0,0,0,.022-.07l-.228.079Z" transform="translate(-67.942 -67.775)"/><path class="j" d="M118.843,112.35l-.342.233a1.264,1.264,0,0,0-.031.123,2.3,2.3,0,0,1,.1.294l.29-.127Z" transform="translate(-66.466 -63.051)"/><path class="a" d="M119.741,121.426l-.031-.026.026.066.07.053h0v-.158Z" transform="translate(-67.162 -68.106)"/><path class="a" d="M118.546,116.058l.1.026h.088v.031h.035v-.044l.1-.035.066-.066-.105-3.644a.6.6,0,0,0-.158-.136h0v.522h0l.031.07h-.053v.694h.048v.075h-.061l.031.944h.04v.075h0v.738l.075.035-.035.07H118.7v.6l-.584-.413a1.49,1.49,0,0,0,.044.22l.132.092Z" transform="translate(-66.27 -62.961)"/><path class="a" d="M120.186,119.565v.088h-.075v-.031l-.285.272-.066.066.342-.119.553-.527v-.184h-.048Z" transform="translate(-67.19 -66.855)"/><path class="a" d="M226.69,135.118l.013.018.013,0-.009-.031Z" transform="translate(-174.217 -81.907)"/><path class="a" d="M226.951,135.23l-.1.035,0,.009.031.026.07-.066h0Z" transform="translate(-174.306 -81.98)"/><path class="a" d="M119.5,121.426l-.026-.066h0v-.07h-.07v.04h-.114a.95.95,0,0,0,.224.07h.075Z" transform="translate(-66.926 -68.066)"/><path class="a" d="M119.647,120.675l-.1.035v.145h0l.1-.035-.026-.026.048-.057.048.044v-.026h.07l.1-.035v-.044h.272l.228-.079a.925.925,0,0,0,.044-.176l-.514.176Z" transform="translate(-67.072 -67.578)"/><path class="a" d="M120.114,116.037h.075v-.088l-.347-3.157-.092-.123.369,3.345Z" transform="translate(-67.184 -63.231)"/><path class="a" d="M120.867,115.9h.048v-.079l-.562-2.2c-.053-.114-.105-.211-.154-.294l.654,2.551Z" transform="translate(-67.437 -63.601)"/><path class="a" d="M118.925,112.306h0v-.026h-.04l-.241.162a.8.8,0,0,0-.044.123l.342-.233Z" transform="translate(-66.539 -63.012)"/><path class="a" d="M118.335,118.979l.035-.07-.075-.035-.962-.474a.228.228,0,0,0,0,.092l.948.47Z" transform="translate(-65.827 -66.445)"/><path class="a" d="M119.07,113.59l-.031-.07h0l-.29.127v.075l.277-.118Z" transform="translate(-66.624 -63.708)"/><path class="a" d="M118.481,117.523v-.075h-.04l-.738-.158-.044.07.781.162Z" transform="translate(-66.012 -65.822)"/><path class="a" d="M119.135,115.365v-.075h-.048l-.277.048v.079l.29-.053Z" transform="translate(-66.657 -64.7)"/><path class="a" d="M226.43,135.038l.053,0-.048-.022Z" transform="translate(-174.071 -81.862)"/><path class="a" d="M226.644,135.12l0,.044,0,0,.018-.031Z" transform="translate(-174.189 -81.918)"/><path class="a" d="M118.68,120.8l-.193-.1-.127-.062a.368.368,0,0,1,0,.075Z" transform="translate(-66.405 -67.702)"/><path class="a" d="M226.5,135.24l.013,0,.035.018.009-.018Z" transform="translate(-174.11 -81.986)"/><path class="a" d="M119.043,121.39h-.233a.8.8,0,0,0,.123.061h.114Z" transform="translate(-66.657 -68.122)"/><path class="a" d="M118.908,121.242h.066v-.079h-.092v.035l-.171-.048h-.141a.343.343,0,0,0,.092.083h.11Z" transform="translate(-66.523 -67.988)"/><path class="a" d="M118.749,121.024v-.075l-.1-.026-.3-.083c0,.01,0,.021,0,.031a.22.22,0,0,0,.035.061l.162.044Z" transform="translate(-66.399 -67.814)"/><path class="a" d="M119.927,121.248V121.2l-.048-.044-.048.057.026.026h0l.193.162h.1l-.14-.119Z" transform="translate(-67.229 -67.993)"/><path class="a" d="M120.11,121.2v.07l.1.026.312.061a.439.439,0,0,0,.11-.053l-.439-.088Z" transform="translate(-67.386 -68.016)"/><path class="a" d="M120.48,120.972v.075h0l.439-.026h0v-.07h-.206Z" transform="translate(-67.594 -67.876)"/><path class="j" d="M123.553,66.153c-.039.255,0,.4.215.281.369-.211.356-.351.439-.645l-.163-.119Z" transform="translate(-69.31 -36.865)"/><path class="j" d="M124.491,58.762c0,.031-.04.07-.062.105l.114-.127Z" transform="translate(-69.81 -32.978)"/><path class="j" d="M124.2,64.638l.439.316a1.207,1.207,0,0,1,.044-.114l-.465-.25A.217.217,0,0,1,124.2,64.638Z" transform="translate(-69.681 -36.259)"/><path class="j" d="M123.809,65.2a4.9,4.9,0,0,0-.149.483L124,65.34Z" transform="translate(-69.378 -36.602)"/><path class="j" d="M126.3,58.47l.659,1.317c.04-.062.07-.119.105-.18l-.76-1.115Z" transform="translate(-70.859 -32.826)"/><path class="j" d="M120.413,59.262a.814.814,0,0,1-.123-.092l.083.215Z" transform="translate(-67.487 -33.219)"/><path class="j" d="M124.34,64.154l.47.25c.035-.07.075-.145.123-.224l-.54-.18Z" transform="translate(-69.759 -35.928)"/><path class="j" d="M126.821,60.487c.044-.057.083-.119.123-.18L126.4,59.24Z" transform="translate(-70.915 -33.258)"/><path class="j" d="M124.792,62.25a.92.92,0,0,1,0,.092l-.2.5.558.176c.053-.088.118-.18.193-.285,0,0,.141-.171.321-.408l-.075-.215Z" transform="translate(-69.9 -34.868)"/><path class="j" d="M102.534,56.091h0a.105.105,0,0,0-.044.057v.022l.14-.1A.176.176,0,0,0,102.534,56.091Z" transform="translate(-57.502 -31.479)"/><path class="j" d="M90.63,54.628l.149-.158A.44.44,0,0,0,90.63,54.628Z" transform="translate(-50.849 -30.582)"/><path class="j" d="M127.479,59.739a1.967,1.967,0,0,0,.1-.224.559.559,0,0,0,.026-.079l-.676-.5Z" transform="translate(-71.212 -33.09)"/><path class="j" d="M102.771,56.16l-.281.2a.723.723,0,0,0,.031.123l.47-.25Z" transform="translate(-57.502 -31.53)"/><path class="j" d="M104.968,53.915l-.558.4a3.671,3.671,0,0,0-.36.518l1.818-.961A2.675,2.675,0,0,0,104.968,53.915Z" transform="translate(-58.377 -30.234)"/><path class="j" d="M106.479,55.69l-3.719.97a.269.269,0,0,1-.031.11l4.022-.716C106.664,55.927,106.576,55.826,106.479,55.69Z" transform="translate(-57.637 -31.267)"/><path class="j" d="M106.018,54.68l-3.258,1.282h0l3.644-.953A2.459,2.459,0,0,0,106.018,54.68Z" transform="translate(-57.654 -30.7)"/><path class="j" d="M116.389,57.828a.823.823,0,0,1-.079.25l.825-.562C116.8,57.42,116.481,57.477,116.389,57.828Z" transform="translate(-65.255 -32.268)"/><path class="j" d="M105.214,54l-2.634,1.387a.751.751,0,0,1,.031.092l3.174-1.247A1.856,1.856,0,0,0,105.214,54Z" transform="translate(-57.553 -30.319)"/><path class="j" d="M84.935,58.259l.918-.852-.272-.2-1.26.347Z" transform="translate(-47.309 -32.119)"/><path class="j" d="M115.629,73.578l-.031-.048-.369.54Z" transform="translate(-64.649 -41.274)"/><path class="j" d="M199.708,76.365l.32-.672L198.25,72.08Z" transform="translate(-158.263 -46.555)"/><path class="j" d="M199.546,77.881l.237-.5L198.51,73.64Z" transform="translate(-158.409 -47.43)"/><path class="j" d="M115,74.654l.694-.562L115.615,74l-.549.553Z" transform="translate(-64.52 -41.538)"/><path class="j" d="M93.335,60.443h0l-2.2-3.073a.36.36,0,0,1,0,.066L93,61.216Z" transform="translate(-51.135 -32.209)"/><path class="j" d="M89.578,58.467,89.5,58.16a1,1,0,0,1-.364.075l-.369,1.2Z" transform="translate(-49.806 -32.652)"/><path class="j" d="M83.364,58.193l-2.52-2.933-.364.057,1.212,2.432Z" transform="translate(-45.155 -31.025)"/><path class="j" d="M116,74.787l-.035-.057-.746.465Z" transform="translate(-64.643 -41.948)"/><path class="j" d="M116.329,74.459v-.04l-.329.255Z" transform="translate(-65.081 -41.774)"/><path class="j" d="M87.376,64.1,86.34,65.457c.04.237.079.47.1.672l1.506-1.278C87.7,64.539,87.508,64.293,87.376,64.1Z" transform="translate(-48.442 -35.984)"/><path class="j" d="M206.981,77.545l.961-.329L206.52,74.34Z" transform="translate(-162.902 -47.823)"/><path class="j" d="M105.92,66.72l3.872,3.073.307-.536a1.317,1.317,0,0,1-.1-.571l-3.991-1.967Z" transform="translate(-59.426 -37.454)"/><path class="j" d="M83.914,61.654,81.42,61a3.83,3.83,0,0,1,.6.439l1.317.47Z" transform="translate(-45.683 -34.245)"/><path class="j" d="M88.144,66,86.59,67.317a1.291,1.291,0,0,1,0,.338h0l1.875-1.216Z" transform="translate(-48.583 -37.05)"/><path class="j" d="M78.4,55.72a2.072,2.072,0,0,0-.29.11l-.241,1.506.04.048.562.154Z" transform="translate(-43.691 -31.284)"/><path class="j" d="M80.9,57.811,79.716,55.44c-.127.022-.259.053-.386.088l.075,1.883Z" transform="translate(-44.51 -31.126)"/><path class="j" d="M196.953,74.844l-.1-.4-1.032.746Z" transform="translate(-156.9 -47.879)"/><path class="j" d="M114.754,73.159a.913.913,0,0,1-.079-.119l-.825,1.44Z" transform="translate(-63.875 -41)"/><path class="j" d="M202.49,83.782l.325.6,3.117-2.854Z" transform="translate(-160.641 -51.856)"/><path class="j" d="M201.83,83.235l.237.439,3.3-2.164Z" transform="translate(-160.271 -51.845)"/><path class="j" d="M209.29,82.554l-.373-.544L205.58,84.9Z" transform="translate(-162.375 -52.125)"/><path class="j" d="M117.675,80c.18-.079.342-.14.465-.2l-2.551-.979Z" transform="translate(-64.851 -44.242)"/><path class="j" d="M204.985,86.024l4.531-1.813L209,83.46l-4.048,2.56Z" transform="translate(-162.021 -52.939)"/><path class="j" d="M87.307,59.913l.522-1.686h-.035a.6.6,0,0,1-.162-.057l-.781,1.216Z" transform="translate(-48.729 -32.658)"/><path class="j" d="M208.166,81.138l-.356-.518-3.451,3.793h.018Z" transform="translate(-161.69 -51.345)"/><path class="j" d="M115.579,80.522a3.511,3.511,0,0,0,.76-.145L114.53,78.92Z" transform="translate(-64.256 -44.298)"/><path class="j" d="M201.548,73.646l.233-.483L199.41,71.67Z" transform="translate(-158.913 -46.325)"/><path class="j" d="M197.281,76.615l-.246-1.005-1.115.338Z" transform="translate(-156.956 -48.535)"/><path class="j" d="M116.335,80.007a3.114,3.114,0,0,0,.307-.136,1.312,1.312,0,0,1,.176-.088L114.25,78.33Z" transform="translate(-64.099 -43.967)"/><path class="j" d="M205.725,87.12l4.983-.667-.733-1.062-4.324,1.73Z" transform="translate(-162.414 -54.021)"/><path class="j" d="M88.456,67.18,86.472,68.5a1.3,1.3,0,0,0,0,.259l2.287-1.168A3.928,3.928,0,0,0,88.456,67.18Z" transform="translate(-48.513 -37.712)"/><path class="j" d="M207.084,72.53Z" transform="translate(-163.216 -46.807)"/><path class="j" d="M203.36,84.517l.2.364,3.007-3.3Z" transform="translate(-161.129 -51.884)"/><path class="j" d="M115.35,75.78l1.251.549a.961.961,0,0,1-.281-.522,1.816,1.816,0,0,0-.11-.351l-.1-.075Z" transform="translate(-64.716 -42.312)"/><path class="j" d="M212.248,88.9l-.584-.847-4.434.6Z" transform="translate(-163.3 -55.513)"/><path class="j" d="M113.5,76.772l3.2.878c-.281-.2-.536-.347-.742-.479L114.2,76.39Z" transform="translate(-63.678 -42.879)"/><path class="j" d="M205.6,89.6l6.054.623-.241-.347-5.712-.29Z" transform="translate(-162.386 -56.377)"/><path class="j" d="M202.542,72.306l.136-.281-2.428-.795Z" transform="translate(-159.385 -46.078)"/><path class="j" d="M114.068,78l3.337,1.282c.118-.088.145-.189,0-.342L114.05,78Z" transform="translate(-63.987 -43.782)"/><path class="j" d="M85.56,63.3a.378.378,0,0,1,.162.3,2.072,2.072,0,0,0,.026.294l.606-.966Z" transform="translate(-48.005 -35.328)"/><path class="j" d="M83.15,62.44a.241.241,0,0,1,.039.061c.07.162.47.241.786.386l.184-.088Z" transform="translate(-46.653 -35.053)"/><path class="j" d="M97.327,53.825l-.088-.061a1.116,1.116,0,0,0-.439-.224l.7,1.572Z" transform="translate(-54.31 -30.061)"/><path class="j" d="M200.14,86.77l.843.057-.65-1.967Z" transform="translate(-159.323 -53.724)"/><path class="j" d="M99.105,54.47h-.075l-.031.7Z" transform="translate(-55.544 -30.582)"/><path class="j" d="M98.49,54.391a.879.879,0,0,1-.25-.061l.167,1.278Z" transform="translate(-55.118 -30.504)"/><path class="j" d="M200.79,84.643l.681,2.063.47.031-1.146-2.107Z" transform="translate(-159.688 -53.595)"/><path class="j" d="M100.121,58.728l5.04-1.6-.105-.18-5.576.992Z" transform="translate(-55.814 -31.974)"/><path class="j" d="M101.448,59.632l4.742-1.892c0-.04-.04-.075-.057-.11l-5.022,1.589Z" transform="translate(-56.728 -32.355)"/><path class="j" d="M201.23,82.9l.211.386,3.086-1.51Z" transform="translate(-159.934 -51.996)"/><path class="j" d="M197.24,86.827l1.159.075.184-1.791Z" transform="translate(-157.696 -53.864)"/><path class="j" d="M219.071,93.043l-.044-.663-.847,3.082Z" transform="translate(-169.443 -57.942)"/><path class="j" d="M100.711,57.32h0l-.1.11Z" transform="translate(-56.448 -32.181)"/><path class="j" d="M99.07,56.149l.7-.746a.439.439,0,0,1,0-.2,5.008,5.008,0,0,1,.439-.825l-.988.9Z" transform="translate(-55.584 -30.532)"/><path class="j" d="M100.24,58.366l.746-.132a.478.478,0,0,1-.11-.044l-.553.145Z" transform="translate(-56.24 -32.669)"/><path class="j" d="M100.618,52.739a.8.8,0,0,0-.272-.729l-.25.154c-.18.329-.439.764-.47.843l-.136.755Z" transform="translate(-55.819 -29.202)"/><path class="j" d="M101.1,57.91h0l-.136.075Z" transform="translate(-56.644 -32.512)"/><path class="j" d="M211.684,94.388,209,90.49l-1.071-.11Z" transform="translate(-163.693 -56.82)"/><path class="j" d="M100.924,57.68h0l-.114.079Z" transform="translate(-56.56 -32.383)"/><path class="j" d="M209.42,94l-3.591-3.837-1.339-.136Z" transform="translate(-161.763 -56.624)"/><path class="j" d="M198.285,70.63l2.871,1.8.193-.4-3.121-1.471-.018,0h0Z" transform="translate(-158.24 -45.702)"/><path class="j" d="M90.9,54.89l-.294.316a1.19,1.19,0,0,0,.079.18h0l2.766.909Z" transform="translate(-50.838 -30.818)"/><path class="j" d="M114.347,62.4a.82.82,0,0,1,.031-.176c.022-.066.044-.149.075-.241L110.29,63.3Z" transform="translate(-61.878 -34.795)"/><path class="j" d="M112.948,64.2l.272-.483a.312.312,0,0,1-.3-.268l-5.211,1.168Z" transform="translate(-60.43 -35.62)"/><path class="j" d="M107.09,62.876l.145-.031,5.462-1.756c.044-.14.088-.294.136-.439l-5.707,2.2Z" transform="translate(-60.083 -34.049)"/><path class="j" d="M94.516,55.745h.035l-1.941-2.2-.083.022c-.237.075-.536.119-.8.184l-.268.285Z" transform="translate(-51.315 -30.066)"/><path class="j" d="M111.815,67.832a1.366,1.366,0,0,1,.391-.145l.312-.549H112.5l-4.5-.3Z" transform="translate(-60.593 -37.522)"/><path class="j" d="M110.622,68.641a1.067,1.067,0,0,1,.5-.72L107,66.85Z" transform="translate(-60.032 -37.527)"/><path class="j" d="M106.5,65.87h.066l4.943.307c-.149-.167-.1-.439.439-.588a1.58,1.58,0,0,1,.193-.053l.079-.136Z" transform="translate(-59.752 -36.714)"/><path class="j" d="M87.208,63.439,86.9,63l-.795,1.273a2.535,2.535,0,0,0,.075.417l.983-1.291Z" transform="translate(-48.313 -35.367)"/><path class="j" d="M204.478,73.946l-1.1,3.969.773-.263.356-3.771Z" transform="translate(-161.141 -47.565)"/><path class="j" d="M103.542,61.311l3.951-2.691c-.026-.048-.048-.1-.075-.149l-4.329,2.3Z" transform="translate(-57.839 -32.826)"/><path class="j" d="M112.7,58.333l-.162-.439a1.7,1.7,0,0,0-.386-.224l-1.032.7c-.189.439-.479.834-.825.566l-3.113,2.12Z" transform="translate(-60.133 -32.377)"/><path class="j" d="M102.467,60.481l4.355-2.314-.031-.057-4.742,1.883Z" transform="translate(-57.255 -32.624)"/><path class="j" d="M104.6,62.107l3.71-2.906c0-.048-.044-.092-.07-.141l-3.951,2.678Z" transform="translate(-58.512 -33.157)"/><path class="j" d="M96.176,55.383l-.878-2a2.323,2.323,0,0,0-.918,0l1.809,2.046Z" transform="translate(-52.953 -29.946)"/><path class="j" d="M200.678,74.2l.334-.694L198.54,71.22Z" transform="translate(-158.425 -46.072)"/><path class="j" d="M105.776,62.528l3.631-2.472a1.489,1.489,0,0,1-.18-.246l-3.477,2.718Z" transform="translate(-59.331 -33.578)"/><path class="j" d="M205.4,77.657l.843-.29-.492-3.407Z" transform="translate(-162.274 -47.609)"/><path class="j" d="M204.253,89.31l-.053.057.053-.044Z" transform="translate(-161.6 -56.22)"/><path class="j" d="M107.246,89.782c.079-.119.149-.237.219-.342l-.285.29Z" transform="translate(-60.133 -50.199)"/><path class="j" d="M106.72,89.253l.114.092.439-.465Z" transform="translate(-59.875 -49.885)"/><path class="j" d="M216.228,85.539l0,0,.285-.509L213.3,81.28Z" transform="translate(-166.705 -51.716)"/><path class="j" d="M85.386,52.714a3.423,3.423,0,0,0,.373-1.005c.026-.145-.083-.184-.246-.119L85,52.574Z" transform="translate(-47.691 -28.95)"/><path class="j" d="M118.3,68.18l-.154.263C118.242,68.426,118.295,68.307,118.3,68.18Z" transform="translate(-66.287 -38.273)"/><path class="j" d="M216.916,85.1l.435-.764L213.9,81.59Z" transform="translate(-167.042 -51.89)"/><path class="j" d="M202.972,75.36l-1.782,3.71.83-.281Z" transform="translate(-159.912 -48.395)"/><path class="j" d="M120.59,64.282l.439-.619-.325-.233a1.85,1.85,0,0,1-.255.18l-.439.786A3.078,3.078,0,0,0,120.59,64.282Z" transform="translate(-67.33 -35.609)"/><path class="j" d="M96.386,76.44,96,80.08l.18.061h.026L97.317,77.2Z" transform="translate(-53.861 -42.907)"/><path class="j" d="M101.5,88.25h0Z" transform="translate(-56.947 -49.532)"/><path class="j" d="M113.81,78.34l.768,1.879h.465l-1.207-1.84Z" transform="translate(-63.852 -43.973)"/><path class="j" d="M92.51,81.226c.167,0,.307.035.439.044l.777-2.34Z" transform="translate(-51.904 -44.304)"/><path class="j" d="M97.888,78.34,96.83,81.163c.136-.044.285-.057.312.083l1.519-2.274Z" transform="translate(-54.327 -43.973)"/><path class="j" d="M94.743,77.415l-.983,2.972h.075a1.538,1.538,0,0,1,.224.026l.729-3.073Z" transform="translate(-52.605 -43.412)"/><path class="j" d="M94.69,80.8l.342.088L95.353,78Z" transform="translate(-53.127 -43.782)"/><path class="j" d="M106.284,88.578l1.023-.685.061-.083-1.269.606A1.353,1.353,0,0,0,106.284,88.578Z" transform="translate(-59.527 -49.285)"/><path class="j" d="M87.56,80.24a2.817,2.817,0,0,1,0,.47l1.115,1.1.312.044.233-.338Z" transform="translate(-49.127 -45.038)"/><path class="j" d="M91.89,75.774l-3.35-.224a1.574,1.574,0,0,1,0,.2l3.038.439Z" transform="translate(-49.677 -42.408)"/><path class="j" d="M123.491,61.165l.777-.136-.224-.659-1.734,1h0l.83-.149C123.289,61.112,123.421,61.086,123.491,61.165Z" transform="translate(-68.621 -33.892)"/><path class="j" d="M91.409,76.729l-2.968-.439a.577.577,0,0,1,0,.154,2.055,2.055,0,0,1-.1.206l2.551.83Z" transform="translate(-49.564 -42.823)"/><path class="j" d="M90.294,71.28,88.34,72.654a1.814,1.814,0,0,1,.057.268l.575.039Z" transform="translate(-49.564 -40.012)"/><path class="j" d="M87.1,71.886a1.219,1.219,0,0,0,.123.184l1.721-.751Z" transform="translate(-48.869 -40.035)"/><path class="j" d="M123.961,58.5,123,59.549c-.105.189-.215.373-.329.544l1.532-.878Z" transform="translate(-68.822 -32.843)"/><path class="j" d="M122.786,62.65,122,62.8h0l.553.176A2.339,2.339,0,0,1,122.786,62.65Z" transform="translate(-68.447 -35.171)"/><path class="j" d="M87.59,71.975a.263.263,0,0,0,.057.04c.1.04.176.184.237.369L89.877,71Z" transform="translate(-49.144 -39.855)"/><path class="j" d="M206.184,73.4l0,0v0Z" transform="translate(-162.711 -47.295)"/><path class="j" d="M103.91,87.8l.32.088,1.317-.246Z" transform="translate(-58.299 -49.19)"/><path class="j" d="M91.36,80.7l.386.053,1.37-2.634Z" transform="translate(-51.259 -43.849)"/><path class="j" d="M89.74,79.722l-2.2-1.172a.769.769,0,0,0-.07.408.438.438,0,0,0,.031.18l1.756,1.317Z" transform="translate(-49.077 -44.091)"/><path class="j" d="M90.471,78.163l-2.555-.843a4.548,4.548,0,0,0-.206.439l2.23,1.177Z" transform="translate(-49.211 -43.4)"/><path class="j" d="M122.839,63.562v-.035l-.189-.057Z" transform="translate(-68.811 -35.631)"/><path class="j" d="M121.78,64.571a1.19,1.19,0,0,0,.413-.391l-.1-.07Z" transform="translate(-68.323 -35.99)"/><path class="j" d="M208.845,76.669,206.58,73.89l1.506,3.038Z" transform="translate(-162.936 -47.57)"/><path class="j" d="M83.384,56.864l1.225-.329c-.237-.167-.439-.285-.659-.206-.439.184-.97.29-.918.053a.483.483,0,0,1,.176-.211H82.8Z" transform="translate(-46.457 -31.536)"/><path class="j" d="M216.594,91.267l-.944-.1.641,3.42Z" transform="translate(-168.024 -57.264)"/><path class="j" d="M113.627,80.776a.642.642,0,0,1,.2-.061l-.3-1.515Z" transform="translate(-63.695 -44.455)"/><path class="j" d="M127.327,57.8c-.031-.465-.255-.834-.755-.509l-.241.158-.031.026Z" transform="translate(-70.859 -32.097)"/><path class="j" d="M76.89,56.74a4.306,4.306,0,0,0,.338.667l.206-1.317A1.177,1.177,0,0,0,76.89,56.74Z" transform="translate(-43.141 -31.491)"/><path class="j" d="M88.6,83.5a1.917,1.917,0,0,0,.263.066l-.088-.083Z" transform="translate(-49.71 -46.856)"/><path class="j" d="M214.376,91.039l-.786-.079L215,94.367Z" transform="translate(-166.868 -57.146)"/><path class="j" d="M197.633,78.357,197.4,77.4l-1.33-.65Z" transform="translate(-157.04 -49.174)"/><path class="j" d="M87.236,81.91a.545.545,0,0,1-.136.237,1.461,1.461,0,0,0,.439.369l.277-.022Z" transform="translate(-48.869 -45.975)"/><path class="j" d="M196.568,73.05l-.926,1.106-.061.189,1.111-.8Z" transform="translate(-156.765 -47.099)"/><path class="j" d="M88.29,62.65c.3.439,1.3,1.756,2.112,2.814l-.215-.878-1.875-1.932Z" transform="translate(-49.536 -35.171)"/><path class="j" d="M127.636,59.137a1.639,1.639,0,0,0,.04-.29l-.755-.237Z" transform="translate(-71.207 -32.905)"/><path class="j" d="M112.213,81.693l-.061-1.023-.742,2.02.083-.057h0l.7-.944Z" transform="translate(-62.506 -45.28)"/><path class="j" d="M86.22,59.088l.751-1.194L86.8,57.81l-.94.878Z" transform="translate(-48.173 -32.456)"/><path class="j" d="M221.478,73.717l-.154-.417-4.434,2.191Z" transform="translate(-168.719 -47.239)"/><path class="j" d="M114.038,80.455h.36l-.7-1.695Z" transform="translate(-63.791 -44.208)"/><path class="j" d="M210.71,90.67l2.739,3.986-1.6-3.872Z" transform="translate(-165.252 -56.983)"/><path class="j" d="M102.157,83.57l-2.8,1.462a1.141,1.141,0,0,1,.439.136l3.367-.773Z" transform="translate(-55.746 -46.907)"/><path class="j" d="M88.916,68.33l-2.336,1.2a2.532,2.532,0,0,0,.132.474l2.823-.878Z" transform="translate(-48.577 -38.357)"/><path class="j" d="M105.12,88.2a.762.762,0,0,1,.105.057l.584-.189Z" transform="translate(-58.978 -49.431)"/><path class="j" d="M105.58,88.161h0a1.032,1.032,0,0,0,.136.145l1.181-.566Z" transform="translate(-59.236 -49.246)"/><path class="j" d="M84.914,51.87a1.51,1.51,0,0,0-.356.356c-.123.167-.211.294-.3.408l.211.075Z" transform="translate(-47.276 -29.124)"/><path class="j" d="M83.3,54.274l.878.167a1.03,1.03,0,0,0,.114-.127h0l-.746-.263A1.566,1.566,0,0,1,83.3,54.274Z" transform="translate(-46.737 -30.347)"/><path class="j" d="M100.73,86.424a1.127,1.127,0,0,1,.189.158l3.736-.369.04-.048-.632-.5Z" transform="translate(-56.515 -48.079)"/><path class="j" d="M99.029,80,97.36,82.472V82.5a.47.47,0,0,0,0,.439l2.577-2.2Z" transform="translate(-54.594 -44.904)"/><path class="j" d="M110.467,77.54l-.338,3.714.035.088h-.044V81.4a.673.673,0,0,1,.075-.083l1.027-3.714Z" transform="translate(-61.782 -43.524)"/><path class="j" d="M82.3,54.818a1.282,1.282,0,0,1-.391.123l.3.351h.65a5.044,5.044,0,0,0,.439-.338l-.909-.184Z" transform="translate(-45.957 -30.751)"/><path class="j" d="M100.143,81.75l-2.6,2.226a.6.6,0,0,0,.378.127l3.122-1.633Z" transform="translate(-54.725 -45.886)"/><path class="a" d="M99.652,57.483v-.022h0l-.123.031h-.066l-.083.083.1.123L105,56.736c-.04-.07-.083-.14-.127-.206l-4.021.716a.206.206,0,0,1-.193.083.585.585,0,0,1-.154-.022l-.746.132Z" transform="translate(-55.758 -31.738)"/><path class="a" d="M94.248,57.415l.031-.07-.7-.386L90.81,56.05l.057.123.948.439Z" transform="translate(-50.95 -31.469)"/><path class="a" d="M205.61,72.448l0,0-.035-.013.04.022Z" transform="translate(-162.369 -46.751)"/><path class="a" d="M198.21,70.56h0l.018,0Z" transform="translate(-158.24 -45.702)"/><path class="a" d="M83.742,57.711l-.066.105-.1-.07.088-.132-.351-.408-.061.061-.079-.083.07-.061-.615-.694h-.057l-.026-.11h0l-.584-.681h-.092v-.088l-.3-.351-.263.044,2.52,2.933.522.14.088-.061.057-.189-.07.083-.083-.075.241-.285.369-1.2a1.356,1.356,0,0,1-.233,0L84.2,58.278Z" transform="translate(-45.621 -30.992)"/><path class="a" d="M119.617,58.591l.048.1-.083.044.154.417h.035q.048-.162.092-.3l-.083-.215a1.173,1.173,0,0,1-.123-.154,1.288,1.288,0,0,0-.277-.281l.162.439Z" transform="translate(-66.977 -32.675)"/><path class="a" d="M124,64.92l.193.14.088-.092.083.079-.079.079.162.119a2.176,2.176,0,0,1,.07-.228l-.439-.316Z" transform="translate(-69.569 -36.321)"/><path class="a" d="M121.937,63.509l.092.061-.039.057.1.07a1.46,1.46,0,0,0,.1-.162l-.531-.285h0l-.066.061.325.233Z" transform="translate(-68.217 -35.508)"/><path class="a" d="M126.319,57.81l-.04.026h0Z" transform="translate(-70.848 -32.456)"/><path class="a" d="M93.279,76.1h-.136l-.3.439h.07v.11h-.123l-.527.724h.07l-.035.11-.1,0-.531.773.092.048-.053.1-.105-.053-.514.755.127.1-.066.088-.127-.1-.233.338.25.04L92.8,77l.171-.329.088-.268.105.035.048-.206.11.026-.154.676-.321,2.893.22.066.4-3.64Z" transform="translate(-50.939 -42.716)"/><path class="a" d="M124.361,58.33a2.668,2.668,0,0,1-.378.18l-.114.127c-.145.246-.29.531-.439.817l.962-1.049Z" transform="translate(-69.249 -32.748)"/><path class="a" d="M117.776,68.073a.11.11,0,0,0,.075,0L118,67.81a.4.4,0,0,0-.092-.29l-.312.549A.338.338,0,0,1,117.776,68.073Z" transform="translate(-65.978 -37.903)"/><path class="a" d="M119.545,64.388v.11h-.176l-.079.136.281-.048.439-.786a.575.575,0,0,1-.312.1l-.272.483Z" transform="translate(-66.926 -35.816)"/><path class="a" d="M113.73,73.071l-.07.088-.044-.035-.439.764.088.1-.083.075-.061-.07-.29.5h0l.079.114.026-.1h.04l-.053-.105.272-.145V74.23h0l.044-.066L114.1,72.7c-.031-.048-.061-.1-.088-.145l-.039-.088-.307.536Z" transform="translate(-63.303 -40.68)"/><path class="a" d="M111.541,78.074V77.74h-.114L110.4,81.454a3.342,3.342,0,0,1,.316-.29h0Z" transform="translate(-61.939 -43.636)"/><path class="a" d="M101.3,87.505h.044a3,3,0,0,0,.369-.1,1.13,1.13,0,0,1,.268-.07,3.269,3.269,0,0,1,.378.07l1.624-.158.487-.1.281-.088v.031l.127-.162-3.736.369A.549.549,0,0,1,101.3,87.505Z" transform="translate(-56.745 -48.791)"/><path class="a" d="M82.223,60.836a.1.1,0,0,1,0-.048h.114l.105-.035v.04h.035l-.026-.035.035-.026-.522-.14-1.673-.439.044.079-.1.048-.088-.167-1.5-.4v.057h-.114v-.1L78,59.51c.154.193.329.329.514.285a1.625,1.625,0,0,1,1.005.356l2.494.667-.58.272h.031l-.04.105-.136-.048-.184.088a1.094,1.094,0,0,1,.233.14L82.131,61Z" transform="translate(-43.764 -33.41)"/><path class="a" d="M213.275,79.94l-.14.07-.013-.026-.061.044.237-.022Z" transform="translate(-166.571 -50.964)"/><path class="a" d="M210.071,80.606l.483-.237.017.035.1-.088.039.04.088-.1-.031-.04-.76.259Z" transform="translate(-164.86 -51.121)"/><path class="a" d="M89.631,70.345l.031.066.053-.035v-.031h.048v-.092l-.04-.053-2.823.878a2.242,2.242,0,0,0,.1.206l1.844-.566Z" transform="translate(-48.757 -39.406)"/><path class="a" d="M106.52,64.37l.522-.044,5.211-1.168a.654.654,0,0,1,0-.228l-4.079.909Z" transform="translate(-59.763 -35.328)"/><path class="a" d="M212.575,80.07l0-.057.167-.013-.057-.079.044-.031-.026.009-.158.119.035.053Z" transform="translate(-166.279 -50.936)"/><path class="a" d="M214.278,79.53l-.149.031-.079.04Z" transform="translate(-167.126 -50.734)"/><path class="a" d="M204.443,81.281l.518-.25-.07-.14-.961.329,0,.022-.114.018v0l-.843.29-.009.088-.11-.009,0-.04-.773.263-.048.176-.11-.031.026-.1-.83.281-.048.11.066.123Z" transform="translate(-159.85 -51.497)"/><path class="a" d="M90.532,58.356l.083.075-.066.083.136.492h0l.066.092-.044.031.1.4h.07l.031.105h-.075l.237,1,.149.075-.048.1-.044-.022.237.957.2.206-.083.079-.088-.079.215.878.329.439.035.07.053-.11,1.756-3.714.259-.94.11.031-.04-.048.07-.053-.132-.075-.031.07-.136.281.066.031-.048.105-.044-.04-.193.4.07.048-.057.1-.061-.04-.233.483.053.053L93.355,60l-.035-.009-.334.694.031.048-.083.061-.373.777.048.1-.1.053h0l-.32.667.057.167-.105.035v-.057l-.237.5-1.036-4.245L90.576,58a.7.7,0,0,1-.136.083l.075.307Z" transform="translate(-50.743 -32.563)"/><path class="a" d="M200.773,84.609l0-.013-.013-.026,0,0Z" transform="translate(-159.671 -53.561)"/><path class="a" d="M206.056,73.368l0-.009.044-.022v0l-.04-.053-.026.083Z" transform="translate(-162.627 -47.228)"/><path class="a" d="M205.92,73.7l-.04.145.031-.066Z" transform="translate(-162.543 -47.464)"/><path class="a" d="M93.451,70.357,93.42,70.3h0v.066h0Z" transform="translate(-52.414 -39.462)"/><path class="a" d="M90.7,54.322l.057-.1.2.11.268-.285a1.48,1.48,0,0,0-.483.184l-.149.158a.439.439,0,0,0,0,.342l.294-.316Z" transform="translate(-50.805 -30.347)"/><path class="a" d="M98.8,55.953l.053.119-.061.026.04.044.083-.088.154-.878h0l-.075-.083.127-.114.136-.768h0a.412.412,0,0,1-.241.079l-.132.738Z" transform="translate(-55.427 -30.436)"/><path class="a" d="M205.913,72.555l.035-.035-.048.04.048.031Z" transform="translate(-162.554 -46.802)"/><path class="a" d="M205.669,72.479l-.009-.009v0Z" transform="translate(-162.42 -46.774)"/><path class="a" d="M98.841,57.482h0l-.031.035.035.035.154.083h0l.083-.083h-.088l-.026-.11.149-.04.47-.439.1-.11a.79.79,0,0,1-.07-.255l-.7.746Z" transform="translate(-55.438 -31.777)"/><path class="a" d="M101.233,61.7H101.2l-.066-.092h.022l-.439-.54-.083.048-.053-.1.061-.035-.4-.487-.14.057-.044-.105.11-.044-.338-.413-.119.04-.035-.105.079-.026-.641-.786L99.02,59h0l-.057.1-.053-.022-.07.053.04.048h0l.039.053h0l.057-.031.114.241,2.27,2.779.031.039.132-.149.127.114.053-.035h0l.154-.123,3.477-2.722a1.659,1.659,0,0,1-.1-.176V59.14l-3.692,2.933Z" transform="translate(-55.455 -33.124)"/><path class="a" d="M84.345,53.77l-.1-.053.031-.053-.211-.075a2.14,2.14,0,0,1-.154.184l.746.263c.044-.061.079-.127.119-.193l-.4-.14Z" transform="translate(-47.079 -30.089)"/><path class="a" d="M86.711,62.53l-.11.176-.6.966a2.128,2.128,0,0,0,.053.338l.79-1.273A1.817,1.817,0,0,1,86.711,62.53Z" transform="translate(-48.252 -35.104)"/><path class="a" d="M91.987,75.474h0l-.114-.211-.47-.031h0l-.066.031V75.2l-.878-.057h-.114l-1.159-.079-.061.079-.088-.07h0L88.47,75a.6.6,0,0,0,.031.233l3.35.224Z" transform="translate(-49.637 -42.099)"/><path class="a" d="M207.27,80.26l-.452.417-3.007,3.3.088.158.066.009.018-.018.053-.057v-.022h.018l3.451-3.793-.053-.079.136-.092-.127-.114-.136.149-.088.1Z" transform="translate(-161.382 -50.981)"/><path class="a" d="M87.824,62.515l-.053-.105h.044v-.04l-.105.035H87.6a.1.1,0,0,0,0,.048,1.833,1.833,0,0,0,.132.211l.3.439.053.039h0c.145.193.325.439.562.751l.057-.048.075.083-.066.053.321.439h0l.061.092h0c.1.127.206.268.316.417l.088-.044.053.1-.07.031.619.808.04.053h0l.031.057h0l.057.044-.026.031h0v.026l1.141,2.107.114.211.114-.145H91.6l.127-.031h-.066l-.083-.158-.2-.369-.057.057-.075-.083.079-.075-.329-.6-.061.04-.061-.092.07-.048-.237-.439h-.044l-.053-.1h.044l-.211-.386-.066-.123-.031-.079-.329-.439c-.817-1.067-1.813-2.38-2.112-2.814Z" transform="translate(-49.145 -35.014)"/><path class="a" d="M207.715,80.356l.356.518.1-.083.07.088-.1.088.373.544.11-.07.061.1-.11.066.518.751.057-.022.04.105-.031.013.733,1.062.127-.018.017.114-.075.009.584.847.184.009,0,.114-.1,0,.241.347-6.054-.623-.417.057-.013-.1h-.057l-.132.114.132.105,1.339.136-.031-.035.079-.075.123.127,1.071.11-.022-.031.092-.066.079.114,1.137.114-.075-.176.105-.04.1.228.786.079-.026-.136.11-.022.035.171.944.1.009-.127.114.013-.013.127.768.079.118.009-.009-.149h.039l0-.013-.079-.119-2.928-4.259-.206-.237-.057-.048.009-.009-.083-.1.039-.035-.035-.053-.009-.013-.048.035-.136.092Z" transform="translate(-161.595 -51.082)"/><path class="a" d="M113.28,77.346h.057v.092l.066-.044.092.141.114.066,3.376.948a1.828,1.828,0,0,0-.29-.263l-.127-.088-3.2-.878Z" transform="translate(-63.555 -43.4)"/><path class="a" d="M220.263,91.125l-.048-.092-.039-.013-.031.1,0,.013Z" transform="translate(-170.542 -57.18)"/><path class="a" d="M113.044,77.638H113v-.053l-.1-.053.057-.1.119.066h0V77.41h-.224v.483l.039.663V78.5l.11.04-.11.294.061,1.023.057.044a.669.669,0,0,1,.167-.127l-.1-1.576Z" transform="translate(-63.319 -43.451)"/><path class="a" d="M113.611,75.522l-.176.136-.057.083-.092-.061.026-.04-.272.145.053.105.053.092h0l.1-.053.685-.36H113.9l.044-.1.114.048.76-.4h0l.044-.061-.092-.167-.781.408Z" transform="translate(-63.42 -42.037)"/><path class="a" d="M125.767,59.02l.088-.053.057.1-.11.066.224.659h.1v.11h-.088l.075.215c.048-.07.105-.145.158-.228l-.439-1.247-.246-.479-.127.079.026.075Z" transform="translate(-70.388 -32.652)"/><path class="a" d="M126.119,58.074l.044-.066.031.026h0l.031.04.184.14.755.237a1.065,1.065,0,0,0,0-.237l-1.027-.325h0l-.1.061Z" transform="translate(-70.713 -32.501)"/><path class="a" d="M102.363,80.543l-.549-.588L96.88,76l-.132-.105-.044.039-.075-.088h0l-.114.145h0l.184.149.9.724.057-.158.11.044-.075.189.786.632.083-.119.092.066-.088.127.878.72.07-.061.075.083-.057.048.878.72.132-.07.053.1-.088.048,1.027.825.224-.048.026.11-.14.031.632.5.039-.044h0Z" transform="translate(-54.153 -42.576)"/><path class="a" d="M87.41,81.557,88,82.14h.145v.11h-.04l.083.083h.057l.329.048-1.115-1.1A1.46,1.46,0,0,1,87.41,81.557Z" transform="translate(-49.043 -45.622)"/><path class="a" d="M84.7,52.574l-.031.053.1.053.035-.066.522-.983a1.022,1.022,0,0,0-.184.105Z" transform="translate(-47.506 -28.989)"/><path class="a" d="M92.291,62.411v.057l.105-.035-.035-.149-1.458-4.3-.083-.171a.982.982,0,0,1-.07.07l.268.781Z" transform="translate(-50.916 -32.456)"/><path class="a" d="M94.136,57.952l.066.031.048-.105-.066-.031-2.3-1.058-.948-.439a1.558,1.558,0,0,1,.053.149h0Z" transform="translate(-51.023 -31.637)"/><path class="a" d="M198.832,71.137,201.2,72.63l.061.04.061-.1-.075-.048-2.871-1.8Z" transform="translate(-158.336 -45.792)"/><path class="a" d="M92.76,61.409h0l.1-.053-.048-.1-1.857-3.78a.664.664,0,0,1-.066.123l.083.171Z" transform="translate(-50.995 -32.271)"/><path class="a" d="M93.33,60.286l.083-.061-.031-.048L91.244,57.2l-.114-.11a.594.594,0,0,1,0,.127l2.2,3.073Z" transform="translate(-51.13 -32.052)"/><path class="a" d="M93.679,59.253l.026.026.079-.083-.053-.053-2.138-1.976-.439-.417-.075-.07h0a.937.937,0,0,1,.026.18l.114.11Z" transform="translate(-51.102 -31.822)"/><path class="a" d="M201.713,70.336l-.022-.013-.158-.083-.048-.031-.026.026-.07-.079-.009,0-.039-.022-3.056-1.69-.2-.11-.053.1.176.092,2.56,1.418.7.386.127.075.061.031Z" transform="translate(-158.139 -44.451)"/><path class="a" d="M98.686,56.025l.039.1.083-.944.048-.7h-.114L98.66,55.7Z" transform="translate(-55.354 -30.588)"/><path class="a" d="M205.61,71.91l.009.061.035.04Z" transform="translate(-162.391 -46.459)"/><path class="a" d="M98.294,55.885l-.044-.316-.167-1.278a.645.645,0,0,1-.123-.061l.171,1.286Z" transform="translate(-54.961 -30.448)"/><path class="a" d="M97.381,55.6l.1.11.061-.026-.053-.118-.04-.079-.162-.369-.7-1.572-.136-.031.878,2Z" transform="translate(-54.114 -30.044)"/><path class="a" d="M96.007,55.746h0l.066.079L96.1,55.8l.048-.04h0l-.04-.044-.1-.11-.04-.04L94.163,53.52l-.123.031,1.94,2.2Z" transform="translate(-52.762 -30.049)"/><path class="a" d="M102.57,56.13Z" transform="translate(-57.547 -31.514)"/><path class="a" d="M206.744,72.618l.018-.018-.022.009Z" transform="translate(-163.025 -46.846)"/><path class="a" d="M99.52,57.834l.176-.048v-.031l.242-.127-.053-.075.259-.184-.026-.048-.11.1Z" transform="translate(-55.836 -32.181)"/><path class="a" d="M106.414,55.47l-3.644.953a.533.533,0,0,1,0,.114l3.719-.97A.914.914,0,0,0,106.414,55.47Z" transform="translate(-57.659 -31.143)"/><path class="a" d="M100.983,58.134l-.083-.044-.47.189Z" transform="translate(-56.347 -32.613)"/><path class="a" d="M206.526,72.409l.127-.031h0l-.035-.083.035-.013-.009-.022-.176.048-.154.04.031.11.083-.022.07-.018Z" transform="translate(-162.79 -46.656)"/><path class="a" d="M105.874,54.51,102.7,55.757l.026.11,3.258-1.282A.984.984,0,0,0,105.874,54.51Z" transform="translate(-57.62 -30.605)"/><path class="a" d="M99.955,58.17v-.048H99.92l.031.083h0v.022l.123-.048.083-.031.47-.189a.8.8,0,0,1-.1-.079l-.149.061Z" transform="translate(-56.06 -32.495)"/><path class="a" d="M105.032,53.9l-1.818.962-.035.075c0,.044-.079.04-.149.026l-.47.25a.157.157,0,0,0,.031.11l2.634-1.387a1.073,1.073,0,0,0-.193-.035Z" transform="translate(-57.541 -30.263)"/><path class="a" d="M100.151,57.841h0l-.241.127V58h0v.048l.408-.215.136-.075a.468.468,0,0,1-.075-.088l-.127.066Z" transform="translate(-56.055 -32.377)"/><path class="a" d="M102.6,56.08l-.14.1a.351.351,0,0,0,0,.132l.281-.2A.725.725,0,0,0,102.6,56.08Z" transform="translate(-57.483 -31.486)"/><path class="a" d="M105.335,54.028a1.484,1.484,0,0,0-.465.378l.558-.4Z" transform="translate(-58.837 -30.324)"/><path class="a" d="M100.346,57.647h0l.141-.1.114-.079-.061-.1-.259.184Z" transform="translate(-56.262 -32.209)"/><path class="a" d="M124.134,60.1l-.057-.1-.088.053-1.532.878c-.057.079-.11.154-.167.224l1.734-1Z" transform="translate(-68.609 -33.684)"/><path class="a" d="M122.953,62.32l-.83.149-.123.149.782-.14A1.565,1.565,0,0,1,122.953,62.32Z" transform="translate(-68.447 -34.986)"/><path class="a" d="M125.878,61.94v-.11h-.1l-.777.136a.171.171,0,0,1,.031.11l.781-.14Z" transform="translate(-70.13 -34.711)"/><path class="a" d="M122.447,63.263l.061-.1L121.955,63l-.035.035.338.18Z" transform="translate(-68.402 -35.367)"/><path class="a" d="M124.46,63.865l.54.171c0-.035.039-.066.061-.1l-.558-.176A1.061,1.061,0,0,1,124.46,63.865Z" transform="translate(-69.827 -35.794)"/><path class="a" d="M124.24,64.455l.465.25a1.105,1.105,0,0,1,.048-.105l-.47-.25a1.073,1.073,0,0,0-.044.105Z" transform="translate(-69.703 -36.125)"/><path class="a" d="M122.3,63.4l.04-.066-.171-.092-.338-.18-.079.083.531.285A.19.19,0,0,1,122.3,63.4Z" transform="translate(-68.306 -35.401)"/><path class="a" d="M126.058,58.522l.544,1.067c.026-.035.048-.075.07-.11l-.659-1.317-.057-.044v-.026l-.07-.132-.1.061Z" transform="translate(-70.573 -32.54)"/><path class="a" d="M126.31,58.47l.742,1.111.061-.11-.549-.8Z" transform="translate(-70.864 -32.826)"/><path class="a" d="M233.553,72.08l-.013.009.044.031Z" transform="translate(-178.059 -46.555)"/><path class="a" d="M126.343,58.217l-.048-.031-.031-.026-.044.066v.026l.057.044h0l.272.206.676.5a.881.881,0,0,0,.035-.114l-.716-.527Z" transform="translate(-70.814 -32.652)"/><path class="a" d="M121.861,63.921l-.092-.061-.04.053-.439.619a1.367,1.367,0,0,0,.2-.092L121.8,64Z" transform="translate(-68.048 -35.85)"/><path class="a" d="M113.75,74.742l.1-.079h0l.105-.066.048-.035h-.031l.1-.118v-.026l.246-.246.119-.145.369-.54c-.026-.031-.048-.066-.07-.1l-.9,1.317Z" transform="translate(-63.819 -41.196)"/><path class="a" d="M220.842,90.54l.057-.088-.035.031L220.8,90.4l-.022.035-.026.039Z" transform="translate(-170.885 -56.832)"/><path class="a" d="M114.34,75.309l.373-.237.746-.465-.061-.1-.329.215Z" transform="translate(-64.15 -41.824)"/><path class="a" d="M221.1,90.056l.009.013.1-.079Z" transform="translate(-171.081 -56.602)"/><path class="a" d="M114.049,75.063,113.991,75l-.048.035-.1.079-.1.079h0l.066.083.035-.031.176-.136.711-.549.307-.25-.066-.092-.68.558Z" transform="translate(-63.819 -41.661)"/><path class="a" d="M115,74.277l.566-.571-.048-.066-.4.492Z" transform="translate(-64.52 -41.336)"/><path class="a" d="M221.468,89.526l.233-.285.083-.1-.25.255-.057-.057-.1.119.026.022Z" transform="translate(-171.238 -56.125)"/><path class="a" d="M124.132,65.389l-.083-.079-.088.092-.342.342c-.022.075-.035.145-.048.206l.483-.483Z" transform="translate(-69.327 -36.663)"/><path class="a" d="M114.686,74.361l-.246.246v.026l.057.057.25-.255.553-.553-.066-.092Z" transform="translate(-64.206 -41.42)"/><path class="a" d="M212.614,79.582l.044-.035.062.07,0-.022.105,0,.017-.035.053.026,0-.031.163.044,5.7-.457.18-.018-.009-.11-.1,0-5.242.421-.518.044-.031.009V79.49l-.237.022-.022.013-.009-.013-.167.013Z" transform="translate(-166.318 -50.448)"/><path class="a" d="M212.83,80.74l.206.237,3.218,3.745.061.075.088-.075-.088-.1L213.3,81.113Z" transform="translate(-166.442 -51.413)"/><path class="a" d="M212.675,80.317V80.29l-.061-.07-.044.035h0l-.04.035.083.1Z" transform="translate(-166.273 -51.121)"/><path class="a" d="M212.766,80.5l0-.061-.061.075-.009.009.057.048.47.373,3.451,2.744.048.035.07-.088-.061-.048-3.872-3.078Z" transform="translate(-166.369 -51.244)"/><path class="a" d="M107.271,66.649l4.518.281s0-.026-.035-.031a.438.438,0,0,1-.11-.092L106.7,66.5Z" transform="translate(-59.864 -37.331)"/><path class="a" d="M212.854,80.352v.026l0,.061.1.009.092,0-.105-.053.031-.066-.105,0Z" transform="translate(-166.453 -51.183)"/><path class="a" d="M106.364,66.444H106.3l-.158-.044v.031l.364.18,4.14,1.071h.022l.114-.066-3.824-1.023Z" transform="translate(-59.55 -37.275)"/><path class="a" d="M106.013,66.406l-.053-.026v.035l-.031.066.105.053,3.991,1.967a1.052,1.052,0,0,1,0-.123L106.4,66.586Z" transform="translate(-59.432 -37.263)"/><path class="a" d="M117.046,57.57l-.825.562a.532.532,0,0,1-.07.184l1.032-.7Z" transform="translate(-65.165 -32.321)"/><path class="a" d="M105.72,62.939l.053.079h0l.061-.04.009-.075.32-.158h0l.176-.066h.044l3.113-2.121a.47.47,0,0,1-.083-.079L105.76,62.9Z" transform="translate(-59.314 -33.954)"/><path class="a" d="M215.4,75.306l4.434-2.191.083-.044-.048-.1-.075.04-5.523,2.726-.039.022Z" transform="translate(-167.227 -47.054)"/><path class="a" d="M213.309,79.7l-.013-.035.233-.075.079-.04.044-.018-.18.066-.031-.088-.32.158.035.075.013.026Z" transform="translate(-166.604 -50.723)"/><path class="a" d="M108.023,62.1l-1.168.439-.176.066h0l.035.088.176-.066,5.707-2.2a1.238,1.238,0,0,1,.044-.136h-.035Z" transform="translate(-59.853 -33.853)"/><path class="a" d="M106.613,63.51l-.233.075v.1h.026l1.655-.527,4.162-1.317a.29.29,0,0,1,.04-.132L106.8,63.466Z" transform="translate(-59.684 -34.644)"/><path class="a" d="M100.76,59.024l.035.105.119-.04,5.023-1.589-.057-.1-5.04,1.581Z" transform="translate(-56.532 -32.226)"/><path class="a" d="M104.07,61.567l.066.092h.031l3.951-2.678a1.04,1.04,0,0,0-.048-.1l-3.951,2.691Z" transform="translate(-58.388 -33.056)"/><path class="a" d="M101.63,59.816l.044.105.14-.057,4.72-1.883-.053-.1-4.742,1.892Z" transform="translate(-57.02 -32.495)"/><path class="a" d="M102.81,60.589l.053.1.083-.048,4.338-2.3-.048-.1-4.342,2.314Z" transform="translate(-57.682 -32.697)"/><path class="a" d="M99.2,54.854l.075.083h0l.988-.9c.07-.119.132-.224.171-.3h0l-1.106,1Z" transform="translate(-55.657 -30.167)"/><path class="a" d="M100.938,52.033l-.048.1.25-.154a.132.132,0,0,0-.2.057Z" transform="translate(-56.605 -29.168)"/><path class="a" d="M77.866,56.057l-.206,1.317a.923.923,0,0,0,.092.136L77.994,56Z" transform="translate(-43.573 -31.441)"/><path class="a" d="M79.16,57.6h.114v-.057L79.2,55.66l-.11.035.07,1.818Z" transform="translate(-44.376 -31.25)"/><path class="a" d="M81.483,57.95l.1-.048-.044-.079L80.329,55.39H80.21L81.4,57.761Z" transform="translate(-45.004 -31.098)"/><path class="a" d="M84.088,62.635l.039-.105H84.1l-1.317-.47a1.067,1.067,0,0,1,.158.176l1.01.36Z" transform="translate(-46.445 -34.84)"/><path class="a" d="M87.356,63.991l-.053-.031-.04-.031-.983,1.291.026.149L87.342,64Z" transform="translate(-48.409 -35.889)"/><path class="a" d="M88.956,68.114,88.9,68l-.088.044-2.287,1.168a1.113,1.113,0,0,0,0,.119l2.336-1.2Z" transform="translate(-48.547 -38.172)"/><path class="a" d="M88.549,67.032l-.061-.092h0l-1.892,1.269a.719.719,0,0,0,0,.149l1.984-1.317Z" transform="translate(-48.583 -37.578)"/><path class="a" d="M88.2,65.783l-.075-.083-.057.048-1.5,1.278v.145l1.554-1.317Z" transform="translate(-48.572 -36.882)"/><path class="a" d="M83,54.652l.931.171a1.1,1.1,0,0,0,.105-.1l-.878-.167Z" transform="translate(-46.569 -30.633)"/><path class="a" d="M86.48,59.317l.1.061.066-.105.781-1.216L87.318,58l-.751,1.177Z" transform="translate(-48.521 -32.563)"/><path class="a" d="M82.59,55.989v.105h.5l.149-.114h-.65Z" transform="translate(-46.339 -31.429)"/><path class="a" d="M85.56,58.562l.079.083.061-.061.939-.878-.092-.066-.918.861Z" transform="translate(-48.005 -32.361)"/><path class="a" d="M84.13,57.329l.026.11h.057l1.26-.334L85.355,57l-1.225.321Z" transform="translate(-47.203 -32.002)"/><path class="a" d="M195.66,75.733l.114.053,1.115-.338.075-.022-.031-.105-.07.018-1.133.342Z" transform="translate(-156.81 -48.372)"/><path class="a" d="M195.221,76.412l.075-.022.026-.009-.017-.018.009-.009-.026-.013.009-.022-.026-.04-.039.013-.039.013Z" transform="translate(-156.546 -48.911)"/><path class="a" d="M195.336,75.091l.026.04.04-.079.061.031.07-.053,1.032-.746.048-.031-.066-.092-.009,0-1.111.8-.083.061-.035.026Z" transform="translate(-156.613 -47.722)"/><path class="a" d="M196.515,72.765l-.088-.075-.013.022-.812.966-.241.285.088.075.07-.083.926-1.106Z" transform="translate(-156.642 -46.897)"/><path class="a" d="M195.52,76.221l-.061-.031-.039.079-.009.022.026.013.07-.07.193.2,1.33.65.061.031.053-.1-.149-.075-1.361-.667Z" transform="translate(-156.67 -48.86)"/><path class="a" d="M195.529,76.29l-.07.07-.009.009.018.018,1.87,1.932.075.075.079-.079-.206-.215-1.563-1.607Z" transform="translate(-156.692 -48.916)"/><path class="a" d="M203.02,77.684l.11.031.048-.176,1.1-3.969.04-.145.009-.1h.018l.026-.083h0l-.11-.031-.259.944-.953,3.429Z" transform="translate(-160.938 -47.189)"/><path class="a" d="M206.08,73.393l0,.009.07,0,0,.031.07-.009.053.351,1.422,2.876.07.141.1-.048-.061-.127L206.3,73.581l-.118-.241-.053.031h0Z" transform="translate(-162.655 -47.262)"/><path class="a" d="M205.578,73.518l.039-.009,0-.031-.07,0-.026,0h-.018l-.009.1-.009.079-.356,3.771,0,.04.11.009.009-.088.351-3.7Z" transform="translate(-162.122 -47.335)"/><path class="a" d="M206.26,73.54l-.07.009-.04.009.022.167.492,3.407v0l.114-.018,0-.022-.461-3.2Z" transform="translate(-162.694 -47.374)"/><path class="a" d="M205.759,80.639l.022.031.079-.075-.018-.035-.483.237-.1.048-.518.25-3.086,1.51-.044.018.048.1.048-.022,3.534-1.725Z" transform="translate(-160.148 -51.312)"/><path class="a" d="M206.849,80.523l-.035-.044-.04-.04-.1.088-.079.075.044.066-.386.25-3.117,2.854-.075.075.075.083.057-.053,3.2-2.937Z" transform="translate(-160.961 -51.244)"/><path class="a" d="M206.161,80.837l-.044-.066-.022-.031-.518.338-3.3,2.164-.07.044.061.092.061-.04,3.442-2.252Z" transform="translate(-160.484 -51.413)"/><path class="a" d="M198.4,84.89l-.171.119-1.317,1.681-.013.018.088.07.061-.075,1.343-1.717Z" transform="translate(-157.505 -53.741)"/><path class="a" d="M200.6,84.312l-.017-.013-.009-.009-.009.013-.018.026Z" transform="translate(-159.553 -53.404)"/><path class="a" d="M200.715,84.425l.022-.031-.057-.044.018.053Z" transform="translate(-159.626 -53.438)"/><path class="a" d="M200.4,84.537l-.022-.057-.053.035.009.018h0Z" transform="translate(-159.43 -53.511)"/><path class="a" d="M90.4,70.871v-.1l-.176.075-1.993,1.4a.7.7,0,0,1,.035.114l1.954-1.374Z" transform="translate(-49.503 -39.726)"/><path class="a" d="M200.72,84.47l.018.048,0,0,.009,0-.013-.018Z" transform="translate(-159.648 -53.505)"/><path class="a" d="M89.935,70.64V70.6L89.9,70.53l-.8.347-1.725.738a.525.525,0,0,0,.092.083l2.287-.962Z" transform="translate(-49.026 -39.591)"/><path class="a" d="M200.575,84.44l-.017-.048-.018-.053V84.33l0,0-.053.018-.053.013.009.031.022.057.044,0-.009.105.65,1.967.022.061.105-.035,0-.018-.681-2.063Z" transform="translate(-159.486 -53.427)"/><path class="a" d="M200.2,84.609l-.044,0-.066,0h0l0,.026-.009.1-.009.1-.184,1.791v.013l.11.013,0-.018.193-1.91Z" transform="translate(-159.177 -53.578)"/><path class="a" d="M204.444,84.973l.474-.3,3.337-2.889.1-.088-.07-.088-.1.083L204.4,84.969Z" transform="translate(-161.713 -51.901)"/><path class="a" d="M204.091,89.419l0-.079-.053.044-.018.018-.075.066-.031.022.075.088.044-.04.132-.114Z" transform="translate(-161.443 -56.237)"/><path class="a" d="M205.83,89.489l5.712.29.1,0,0-.114-.184-.009-5.018-.25Z" transform="translate(-162.515 -56.276)"/><path class="a" d="M205.583,89.33l-.053.022.127-.022Z" transform="translate(-162.347 -56.231)"/><path class="a" d="M204.743,89.316l.057-.022-.035,0-.145.092.14-.022Z" transform="translate(-161.836 -56.209)"/><path class="a" d="M204.31,89.374l.079,0h.057l0-.013h0l-.061-.1.009,0-.044,0h-.035V89.3Z" transform="translate(-161.662 -56.192)"/><path class="a" d="M204.489,85.8l-.009,0,.061.1h0l.145-.092,4.048-2.56.11-.066-.061-.1-.11.07-3.71,2.344Z" transform="translate(-161.758 -52.731)"/><path class="a" d="M205.014,88.477l-.237.092-.022-.061-.14.022h0l0,.013.013.1.417-.057.1-.013.615-.079,4.434-.6.075-.009-.018-.114-.127.018-4.983.667Z" transform="translate(-161.83 -55.356)"/><path class="a" d="M204.9,86.977l.018.044.022.061.237-.092.053-.022,4.324-1.73.031-.013-.04-.105-.057.022-4.531,1.813Z" transform="translate(-161.993 -53.87)"/><path class="a" d="M91.638,76.629v-.11h-.07L88.53,76.08V76.2l2.968.439Z" transform="translate(-49.671 -42.705)"/><path class="a" d="M89.288,81.446l.066-.088-.127-.1L87.47,79.94v.154l1.651,1.278Z" transform="translate(-49.076 -44.87)"/><path class="a" d="M89.924,79.635l.053-.1-.092-.053L87.654,78.3l-.044.105,2.2,1.172Z" transform="translate(-49.155 -43.95)"/><path class="a" d="M90.836,78.1l.035-.11H90.8l-2.573-.847-.048.1,2.555.821Z" transform="translate(-49.475 -43.299)"/><path class="a" d="M104.018,85.45l-.026-.11-.224.048-3.367.773.145.083,3.332-.764Z" transform="translate(-56.33 -47.899)"/><path class="a" d="M97.778,77.854l-.11-.044-.057.158L96.5,80.923a.554.554,0,0,1,.145-.057L97.7,78.043Z" transform="translate(-54.142 -43.675)"/><path class="a" d="M99.186,79.576l-.092-.066-.083.119L97.478,81.92a.557.557,0,0,1-.048.272L99.1,79.721Z" transform="translate(-54.664 -44.629)"/><path class="a" d="M100.122,81.533l-.075-.083-.07.061-2.577,2.2a.441.441,0,0,0,.061.092l2.6-2.226Z" transform="translate(-54.647 -45.717)"/><path class="a" d="M101.706,83.331l-.053-.1-.132.07L98.4,84.933a.5.5,0,0,0,.3-.066.233.233,0,0,1,.123-.026l2.8-1.462Z" transform="translate(-55.208 -46.716)"/><path class="a" d="M217.237,100.151v-.031l-.018.009Z" transform="translate(-168.904 -62.284)"/><path class="a" d="M217.422,91.1l-.009.127-.3,3.323.075.4h0l.338-3.714.013-.127Z" transform="translate(-168.843 -57.224)"/><path class="a" d="M109.809,86.6h0l.026-.035-.035-.04Z" transform="translate(-61.603 -48.567)"/><path class="a" d="M104.276,80.346l-3.754-4.008-.118-.127-.083.075.031.035,3.6,3.837.549.588.035.039.026-.031Z" transform="translate(-56.285 -42.778)"/><path class="a" d="M106.216,80.8h-.04l-.031-.083h0l-.04-.088-2.74-3.991-.075-.11-.092.066v.031l2.678,3.9.281.408.079-.083v-.026Z" transform="translate(-57.9 -42.957)"/><path class="a" d="M217.16,99.906l-.11.022.035.083.039-.017.018-.009.048-.018-.039-.088h0Z" transform="translate(-168.809 -62.15)"/><path class="a" d="M214.741,94.075l-1.409-3.407-.1-.228-.105.039.075.176,1.6,3.872.039.088Z" transform="translate(-166.61 -56.854)"/><path class="a" d="M216.189,94.8l-.009-.026-.075-.4-.641-3.42-.035-.171-.11.022.026.136.623,3.328.105.54v.018h0Z" transform="translate(-167.838 -57.045)"/><path class="a" d="M115.034,76.18l-.044.1h.031l1.756.781a2.113,2.113,0,0,1-.4-.3l-1.251-.549Z" transform="translate(-64.514 -42.761)"/><path class="a" d="M117.08,75.3l.1.075a.362.362,0,0,0-.057-.136Z" transform="translate(-65.687 -42.234)"/><path class="a" d="M113.87,78.4l1.207,1.84h.132l-1.049-1.6Z" transform="translate(-63.886 -44.006)"/><path class="a" d="M220.727,91.5l-.1-.141-.066.044,0,0Z" transform="translate(-170.778 -57.37)"/><path class="a" d="M113.58,78.16l.053.263.7,1.695h.118l-.768-1.879Z" transform="translate(-63.723 -43.872)"/><path class="a" d="M113.434,78.042l-.114-.092h0l.11.558.3,1.515a.8.8,0,0,1,.114,0l-.338-1.695Z" transform="translate(-63.577 -43.754)"/><path class="a" d="M114.748,78.36l2.551.979a1.111,1.111,0,0,0,.127-.07L114.09,78Z" transform="translate(-64.009 -43.782)"/><path class="a" d="M220.375,91.726l.022.009-.039-.031.026-.031-.026-.013-.018.053Z" transform="translate(-170.655 -57.538)"/><path class="a" d="M113.507,77.714h0l-.114-.066-.167-.092-.119-.066-.057.1.1.053h.026l.044-.057.356.285,2.568,1.453.127-.057-2.085-1.181Z" transform="translate(-63.426 -43.496)"/><path class="a" d="M113.3,77.68l-.044.057-.026.031.039.031.114.092.1.079.026.026.29.228,1.809,1.458.132-.04-2.085-1.677Z" transform="translate(-63.527 -43.602)"/><path class="a" d="M107.255,87.579h-.11l-.088.031-1.168.571.092.079,1.273-.593.088-.127-.075.026Z" transform="translate(-59.409 -49.134)"/><path class="a" d="M107,89.2l.088.07.285-.29a3.032,3.032,0,0,1,.189-.277l.066-.083-.171.114Z" transform="translate(-60.032 -49.739)"/><path class="a" d="M106.608,88.771l.571-.373.171-.114.193-.263-1.023.676Z" transform="translate(-59.763 -49.403)"/><path class="a" d="M108.72,87.336h.114v.1l.075-.026c.026-.035.057-.07.083-.11V87.27Z" transform="translate(-60.997 -48.982)"/><path class="a" d="M106.861,87.67l-.918.176-.584.189a.193.193,0,0,1,.1.088l1.317-.439Z" transform="translate(-59.112 -49.207)"/><path class="a" d="M106.469,87.541h.11v-.1h-.114l-.487.1-1.317.246c.075.026.149.048.211.075l.689-.132Z" transform="translate(-58.719 -49.077)"/><path class="a" d="M94.257,78.133l-.777,2.34H93.6l.988-2.963Z" transform="translate(-52.448 -43.507)"/><path class="a" d="M203.089,90.737l0-.022-.105-.035-.088.268.127-.241Z" transform="translate(-160.871 -56.989)"/><path class="a" d="M95.366,76.436l-.11-.026-.048.206v.022h.039l-.079.149-.729,3.073h.114l.659-2.753Z" transform="translate(-52.986 -42.89)"/><path class="a" d="M93.868,77.145l.044-.083.079-.149h-.04l-.083-.053-.127.241-.171.329L92.2,80.065h.119l1.2-2.3Z" transform="translate(-51.73 -43.142)"/><path class="a" d="M88.571,83.33v-.11h-.145l-.277.022a1.508,1.508,0,0,0,.206.1h.18Z" transform="translate(-49.458 -46.71)"/><path class="a" d="M112.088,79.949l-.11-.04v.053l-.878,2.419h0l.162-.119.742-2.02Z" transform="translate(-62.332 -44.853)"/><path class="a" d="M112.312,83l-.7.944a3.109,3.109,0,0,0,.773-.878l-.057-.044Z" transform="translate(-62.618 -46.587)"/><path class="j" d="M90.028,93.932a.983.983,0,0,1,.272-.259.787.787,0,0,1,.2-.1c.145-.048.277-.062.408-.119a.747.747,0,0,0,.224-.189,1.182,1.182,0,0,0,.092-.132.4.4,0,0,0,.088-.294.053.053,0,0,0-.026-.035.079.079,0,0,0-.066,0,1.956,1.956,0,0,1-.751,0,.347.347,0,0,1-.176-.1v-.044a.163.163,0,0,1,0-.066c0-.1-.04-.14-.092-.154a.455.455,0,0,0-.351.338.689.689,0,0,1-.246.316l-.1.092c-.215.2-.439.413-.268.641l.031.048a1.51,1.51,0,0,0,.07.154.771.771,0,0,0,.061.1.753.753,0,0,0,.079.088.246.246,0,0,0,.176.088.329.329,0,0,0,.255-.167l.04-.053A1.47,1.47,0,0,1,90.028,93.932Z" transform="translate(-50.037 -51.881)"/><path class="j" d="M83.917,92.282,83.281,91a.921.921,0,0,1-.211.439l.518,1.519Z" transform="translate(-46.608 -51.075)"/><path class="j" d="M87.1,96.48,85,97.516a3.841,3.841,0,0,1,.439.272L87.3,96.568A.246.246,0,0,1,87.1,96.48Z" transform="translate(-47.691 -54.149)"/><path class="j" d="M107.654,98.105a1.356,1.356,0,0,1,.07-.285l-1.014,1.238Z" transform="translate(-59.869 -54.9)"/><path class="j" d="M83.857,88.86h0L82.18,86.52a1.581,1.581,0,0,0,.136.65,3.719,3.719,0,0,1,.492.966v.14l.663,1.352Z" transform="translate(-46.109 -48.561)"/><path class="j" d="M81.568,92.7a2.071,2.071,0,0,1-.338.1l.483.5Z" transform="translate(-45.576 -52.028)"/><path class="j" d="M187.111,104.105l-.246-1.005-1.115.338Z" transform="translate(-151.251 -63.956)"/><path class="j" d="M79.756,84.83c-.25.439-.141.781-.246,1.15l.408-.487Z" transform="translate(-44.611 -47.613)"/><path class="j" d="M83.181,93.756l-.536-1.576a1.147,1.147,0,0,1-.176.132l.474,1.94Z" transform="translate(-46.272 -51.736)"/><path class="j" d="M83.692,87.083,81.22,84.8l.312.439h.031a.274.274,0,0,1,.044.11l1.756,2.441Z" transform="translate(-45.57 -47.597)"/><path class="j" d="M78.12,90.13c.066.1.167.237.29.4h.123l-.391-.4Z" transform="translate(-43.831 -50.586)"/><path class="j" d="M185.41,101.825l1.111-.8-.123-.5-.926,1.111Z" transform="translate(-151.06 -62.514)"/><path class="j" d="M81.585,88.847a4.155,4.155,0,0,0-.154-.9l-.241-.707Z" transform="translate(-45.554 -48.965)"/><path class="j" d="M79.057,90.677a1.063,1.063,0,0,1,.518.439,1.213,1.213,0,0,0,.413-.141L78.75,90.37Z" transform="translate(-44.185 -50.721)"/><path class="j" d="M105.182,103.313h.439a1.4,1.4,0,0,1,.237-.373l-.7.364Z" transform="translate(-59 -57.773)"/><path class="j" d="M105,102.344l1.071-.562.092-.162Z" transform="translate(-58.91 -57.032)"/><path class="j" d="M81.066,85.428v-.312L80.5,84.33Z" transform="translate(-45.166 -47.333)"/><path class="j" d="M81.216,86.637V86.4l-.356-.72Z" transform="translate(-45.368 -48.09)"/><path class="j" d="M186.783,102.334l-.1-.4-1.036.746Z" transform="translate(-151.194 -63.3)"/><path class="j" d="M106.847,96.568c.035-.2.066-.386.079-.558l-1.866,2.735Z" transform="translate(-58.944 -53.885)"/><path class="j" d="M92.156,94.23,90,96.605a.483.483,0,0,0,.281.075l2.235-1.936Z" transform="translate(-50.496 -52.886)"/><path class="j" d="M82.43,99.017c.066.053.132.105.193.162l.057-.47Z" transform="translate(-46.249 -55.4)"/><path class="j" d="M89.31,96.8a.6.6,0,0,0,.114.193l1.655-1.818Z" transform="translate(-50.109 -53.419)"/><path class="j" d="M81.7,98.616l.079.053.329-.228Z" transform="translate(-45.84 -55.248)"/><path class="j" d="M82.09,98.928l.061.053.167-.211Z" transform="translate(-46.058 -55.433)"/><path class="j" d="M93.936,95.61,92.43,96.927a1.548,1.548,0,0,1,.3,0c.255,0,.36-.562.531-.119l1.045-.659Z" transform="translate(-51.859 -53.661)"/><path class="j" d="M86.14,97.106a1.161,1.161,0,0,1,.105.105,2.524,2.524,0,0,0,.281.329l.544-.5c.026-.246.114-.509.373-.342l1.708-1.572Z" transform="translate(-48.33 -53.391)"/><path class="j" d="M86.347,96.05l-2.437.83.439.777a1.119,1.119,0,0,0-.154-.294c-.123-.171-.07-.2.053-.149l2.173-1.062a.77.77,0,0,1-.075-.1Z" transform="translate(-47.079 -53.907)"/><path class="j" d="M83.47,98.219l.439,1.317a.93.93,0,0,0,.167-.268l-.588-1.089Z" transform="translate(-46.833 -55.102)"/><path class="j" d="M83,99.147c.268.255.439.514.075.707a1.692,1.692,0,0,0-.158.1v.2a.773.773,0,0,0,.492-.219l.11-.105-.439-1.348Z" transform="translate(-46.524 -55.271)"/><path class="j" d="M95.486,97.06l-1.076.681a1.378,1.378,0,0,1,0,.707l1.576-.637Z" transform="translate(-52.97 -54.474)"/><path class="j" d="M106.21,94.39a1.71,1.71,0,0,0-.044-.32l-2.406,4.21h0l2.445-3.583A2.379,2.379,0,0,0,106.21,94.39Z" transform="translate(-58.215 -52.797)"/><path class="j" d="M104.8,100.762l1.559-1.256c.057-.162.114-.329.162-.5l-1.633,1.642Z" transform="translate(-58.798 -55.568)"/><path class="j" d="M78.174,94.66l-2.094,1.4a.36.36,0,0,1,0,.259l2.432-1.242A4.031,4.031,0,0,1,78.174,94.66Z" transform="translate(-42.687 -53.128)"/><path class="j" d="M77.526,93.52l-.215.167L75.59,95.158l.162.158h0l2.081-1.4Z" transform="translate(-42.412 -52.488)"/><path class="j" d="M81.271,93.619h0L80.617,93H80.45l-.07.075c.356.474.755,1,1.12,1.475Z" transform="translate(-45.099 -52.196)"/><path class="j" d="M106.739,100.849c.04-.083.079-.171.114-.259l-1.023.825Z" transform="translate(-59.376 -56.454)"/><path class="j" d="M97.78,101.832a11.753,11.753,0,0,1,1.146.321l.184.053-.347-.5Z" transform="translate(-54.86 -57.077)"/><path class="j" d="M99.2,98.622,96,94.89l2.459,3.574.742.2.044-.083Z" transform="translate(-53.861 -53.257)"/><path class="j" d="M95.9,99l-1.708.681a.878.878,0,0,1-.075.171l.913.408a1.208,1.208,0,0,1,.259,0l1.343-.18Z" transform="translate(-52.807 -55.562)"/><path class="j" d="M76.58,95.82l-2.608,1.317c-.149.184-.364.307-.483.246l-.909.439a.809.809,0,0,0-.031.189L77.2,96.584Z" transform="translate(-40.707 -53.778)"/><path class="j" d="M75.5,95.809c-.22.149-.255.193-.171.285l.9-.764C75.9,95.541,75.6,95.725,75.5,95.809Z" transform="translate(-42.241 -53.504)"/><path class="j" d="M202.9,108.08l3.872,3.078.54-.944-4.32-2.129Z" transform="translate(-160.871 -66.75)"/><path class="j" d="M74.949,101.3l.044-.048a7.71,7.71,0,0,1,.733-.79l-1.756.768Z" transform="translate(-41.503 -56.381)"/><path class="j" d="M99.215,94.714a3.7,3.7,0,0,1,1-.215h0L97.74,94.35Z" transform="translate(-54.838 -52.954)"/><path class="j" d="M100.836,96.338l.47-.808-1.282-.329h-.206c-.707,0-1.466-.053-1.317-.158.061-.053,0-.132.105-.224L96.85,94.38Z" transform="translate(-54.338 -52.971)"/><path class="j" d="M93.433,91.387l.738-.5a2.5,2.5,0,0,1-.263-.079,1.434,1.434,0,0,1-.413-.237l-.5.268Z" transform="translate(-52.173 -50.833)"/><path class="j" d="M192.8,102.84l-1.774,3.71.825-.281Z" transform="translate(-154.212 -63.81)"/><path class="j" d="M90.8,95.6l-.04.053.777-.509-.623.307A1.476,1.476,0,0,0,90.8,95.6Z" transform="translate(-50.922 -53.397)"/><path class="j" d="M73.376,102.708l.812.123a.875.875,0,0,0,.158-.075l-1-.066Z" transform="translate(-41.156 -57.632)"/><path class="j" d="M87.669,100.028a1.543,1.543,0,0,1,0-.158l-.439.4C87.428,100.445,87.638,100.493,87.669,100.028Z" transform="translate(-48.942 -56.05)"/><path class="j" d="M95.611,92.654l.878-.6L96.427,92l-.847.663Z" transform="translate(-53.626 -51.636)"/><path class="j" d="M94.419,92.288l1-.777a1.58,1.58,0,0,0-.483-.141l-.812.553Z" transform="translate(-52.807 -51.282)"/><path class="j" d="M97.406,92.38h0l-.035-.04-.351.241Z" transform="translate(-54.434 -51.826)"/><path class="j" d="M96.4,93.574l3.354.206a1.7,1.7,0,0,0,.645-.54l-4.061.334Z" transform="translate(-54.052 -52.331)"/><path class="j" d="M96.92,92.929l.149-.035.47-.149-.066-.035-.518.2Z" transform="translate(-54.378 -52.034)"/><path class="j" d="M101.084,92.478c-.149-.114-.342-.272-.5-.408l-3.073.689Z" transform="translate(-54.709 -51.675)"/><path class="j" d="M101.844,91.437a.357.357,0,0,1-.075-.1h0a.153.153,0,0,0-.048-.031l-1.611.514Z" transform="translate(-56.167 -51.248)"/><path class="j" d="M206.746,112.582l.435-.768-3.451-2.744Z" transform="translate(-161.337 -67.305)"/><path class="j" d="M89.578,90.565a.689.689,0,0,0,.246-.316c.035-.22.233-.373.351-.338L89.2,87.94Z" transform="translate(-50.047 -49.358)"/><path class="j" d="M100.844,91l-1.374.531a1.089,1.089,0,0,1-.11.132l1.787-.571Z" transform="translate(-55.746 -51.075)"/><path class="j" d="M106.21,94.9l-1.155-.075c-.035.316-.092.5-.356.575l1.067.277Z" transform="translate(-58.742 -53.223)"/><path class="j" d="M106.731,93.775l.351-.615a.439.439,0,0,0-.132-.18l-.465.035a1.193,1.193,0,0,0-.162.088c-.606.36-.716.215-.773.566l1.185.07Z" transform="translate(-59.219 -52.185)"/><path class="j" d="M194.308,101.43l-1.1,3.964.773-.263.356-3.771Z" transform="translate(-155.435 -62.98)"/><path class="j" d="M91.72,92.944v0Z" transform="translate(-51.461 -52.14)"/><path class="j" d="M93.84,93.635l.259-.088-.189-.2a.4.4,0,0,1-.07.285Z" transform="translate(-52.65 -52.393)"/><path class="j" d="M100.051,90.952h0a.491.491,0,0,1-.031.1l.439-.228A2.1,2.1,0,0,1,100.051,90.952Z" transform="translate(-56.117 -50.974)"/><path class="j" d="M88.09,91.277l.5-.171c-.154-.228.053-.439.268-.641l-.439-2.884Z" transform="translate(-49.424 -49.156)"/><path class="j" d="M100.768,90.75l-.878.439h0l1.084-.439Z" transform="translate(-56.044 -50.934)"/><path class="j" d="M73.3,99.294l-.439.307-.026.035.7-.356A.526.526,0,0,0,73.3,99.294Z" transform="translate(-40.864 -55.716)"/><path class="j" d="M83.733,83.419c.2-.145-.32-.7-1.093-.522l1.036.571Z" transform="translate(-46.367 -46.51)"/><path class="j" d="M196.014,100.884l0,0v.009Z" transform="translate(-157.006 -62.711)"/><path class="j" d="M72.682,100.586h.237l2.292-1,.268-.22h0l-2.928.878A.927.927,0,0,0,72.682,100.586Z" transform="translate(-40.707 -55.77)"/><path class="j" d="M82.721,83.647l-1.089-.6a1.856,1.856,0,0,0-.522.281l1.488.487A.44.44,0,0,1,82.721,83.647Z" transform="translate(-45.509 -46.615)"/><path class="j" d="M91.272,90.018a.079.079,0,0,1,.066,0L89.27,87.48l1.251,2.533A1.954,1.954,0,0,0,91.272,90.018Z" transform="translate(-50.086 -49.1)"/><path class="j" d="M191.378,101.136l.233-.487L189.24,99.16Z" transform="translate(-153.208 -61.746)"/><path class="j" d="M91.38,87.09a2.951,2.951,0,0,0-.68-.136,12.677,12.677,0,0,1-1.37-.154l.606.746Z" transform="translate(-50.12 -48.718)"/><path class="j" d="M91.265,88.5l1.317-.518a1.67,1.67,0,0,0,.083-.25l-.031-.083L92.5,87.6l-1.559.487Z" transform="translate(-51.023 -49.167)"/><path class="j" d="M187.87,97.99l.061.04.013-.013.075.066,2.871,1.809.193-.4-3.122-1.466Z" transform="translate(-152.44 -61.089)"/><path class="j" d="M85.226,85.938l.132-.272-.263-.04a1.62,1.62,0,0,1-.755-.307L82.93,84.88Z" transform="translate(-46.53 -47.641)"/><path class="j" d="M92.248,89.788l.487-.259c-.2-.2-.237-.439,0-.5a.492.492,0,0,0,.246-.193l-1.141.439Z" transform="translate(-51.528 -49.863)"/><path class="a" d="M187.842,97.962l.092.031-.11-.053h0l.013.018Z" transform="translate(-152.412 -61.061)"/><path class="a" d="M78.13,89.364l.057-.184-.066.079-.057-.048a1.892,1.892,0,0,0-.044.211h0Z" transform="translate(-43.775 -50.054)"/><path class="a" d="M83.195,84.623a1.564,1.564,0,0,1-.32-.316.259.259,0,0,1-.083,0c-.255,0-.334-.092-.316-.18l-1.488-.487-.1.079.878.439Z" transform="translate(-45.385 -46.946)"/><path class="a" d="M105.774,93.39l-.351.615V94.1h-.039l-.439.777h0l-.026.105-.022,0-.47.821h.039l-.048.1h-.044l-.54.944.057.048-.07.092-.044-.04-.439.768h0l-.044.035-.044.083a1.547,1.547,0,0,1,.211.075l2.406-4.21A1.353,1.353,0,0,0,105.774,93.39Z" transform="translate(-57.928 -52.415)"/><path class="a" d="M78,89.73v.026l.026-.022Z" transform="translate(-43.764 -50.362)"/><path class="a" d="M78,89.82a.1.1,0,0,1,0,.035h0Z" transform="translate(-43.764 -50.413)"/><path class="a" d="M86.161,95.59l-.5.18v.092h-.114v-.04l-.773.263-.048.176-.114-.053.031-.1-.83.281-.053.11.066.123,2.437-.83a1.506,1.506,0,0,1-.07-.154Z" transform="translate(-46.995 -53.649)"/><path class="a" d="M91.932,95a.788.788,0,0,0-.2.1Z" transform="translate(-51.466 -53.318)"/><path class="a" d="M96.34,92.518l.514-.04,3.073-.689a2.124,2.124,0,0,1-.2-.189L98,91.991Z" transform="translate(-54.052 -51.411)"/><path class="a" d="M204.108,107.01l-.149.035-.079.04Z" transform="translate(-161.421 -66.149)"/><path class="a" d="M77.132,97.924l.053-.035v-.026h.048v-.07l-.04-.053-4.649,1.387a.813.813,0,0,0,0,.18.219.219,0,0,0,0,.053l2.928-.878a1.058,1.058,0,0,1,.944-.307l.716-.321Z" transform="translate(-40.7 -54.855)"/><path class="a" d="M203.105,107.42l-.141.07-.013-.026-.061.044.237-.018Z" transform="translate(-160.866 -66.379)"/><path class="a" d="M93.722,93.865A1.2,1.2,0,0,1,93.63,94l.2-.1h0l.044-.044.04.044L94,93.8l-.031-.04Z" transform="translate(-52.532 -52.623)"/><path class="a" d="M202.4,107.493l.167-.009-.057-.083.044-.031-.026.009-.158.123.035.048h0Z" transform="translate(-160.574 -66.351)"/><path class="a" d="M80.158,84.53a1.152,1.152,0,0,0-.088.132l.162.663h0l.083.07-.066.083.119.5h0l.11.079-.044.035.1.4h.07l.035.11h-.079l.246,1h.044a.4.4,0,0,0,.127-.272h0l-.4-1.607Z" transform="translate(-44.925 -47.445)"/><path class="a" d="M195.886,100.848l0-.009.044-.018v-.009l-.04-.053-.026.088Z" transform="translate(-156.922 -62.643)"/><path class="a" d="M190.6,112.094l0-.018-.013-.026,0,0Z" transform="translate(-153.966 -68.977)"/><path class="a" d="M195.749,101.18l-.039.149.031-.07Z" transform="translate(-156.838 -62.879)"/><path class="a" d="M82.281,90.056l-.061.057.228.935.329.439.035.066.053-.11,1.778-3.705.259-.944.11.031-.04-.044.035-.031h-.132l-.132.272.066.031-.048.1-.066-.031-.193.4.075.044-.062.1-.061-.039-.219.452.053.048-.075.083-.044-.035-.334.694.035.048-.088.062-.373.777.053.1-.105.075h0l-.321.667.057.167-.105.035v-.057l-.237.5-.474-1.94a1.281,1.281,0,0,1-.206.1l.145.593Z" transform="translate(-46.047 -48.69)"/><path class="a" d="M83.261,97.833h0l-.031-.053h0v.07Z" transform="translate(-46.698 -54.878)"/><path class="a" d="M88.68,86.78l.04.044h0l.044.053h.057l.118.237,2.077,2.516a.053.053,0,0,1,.026.035l.171.206.031.04.132-.149.127.114.053-.031h0l.154-.119.847-.654a.826.826,0,0,0-.193-.136l-1,.777-.3-.364h-.031l-.066-.092h0l-.439-.549-.092.048-.053-.1.07-.035-.4-.5-.088.035-.044-.105h.057l-.329-.408-.092.031-.035-.105h.048l-.606-.746-.268-.04Z" transform="translate(-49.755 -48.707)"/><path class="a" d="M73.131,102.281l-.044-.1H72.85a.969.969,0,0,0,.22.241l1,.066a.927.927,0,0,0,.255-.206l-.992-.07Z" transform="translate(-40.875 -57.346)"/><path class="a" d="M91.88,93.781l.136-.1-.127-.114-.132.149-.092.1.04.04-.439.439L89.61,96.116a.57.57,0,0,0,.18.141l2.164-2.375Z" transform="translate(-50.277 -52.516)"/><path class="a" d="M95.112,94.031l-.053-.044h0l-.079-.105.044-.04-.035-.053h0l-.053.031-.136.1.057.079.351.514.1-.079.075.083-.105.088.373.544.11-.07.061.1-.105.066.492.738h.057l.044.105h-.035L97,97.149h.132v.11h-.07l.347.5.342.1-2.428-3.591Z" transform="translate(-53.188 -52.64)"/><path class="a" d="M78,90.148a.356.356,0,0,0,.342.386c-.123-.167-.224-.307-.29-.4Z" transform="translate(-43.762 -50.586)"/><path class="a" d="M81.64,95.13l-.035-.066-.329-.439c-.364-.478-.764-1-1.12-1.475a2.2,2.2,0,0,1-.176.149l.312.408h0l.061.1h0c.1.132.206.268.316.439l.088-.044.053.1-.07.035.619.8.04.053h0l.031.053h0l.057.048-.026.026h0v.026l.588,1.089a.62.62,0,0,0,.053-.215l-.026-.035H82.1a.881.881,0,0,0-.031-.176l-.439-.777Z" transform="translate(-44.875 -52.281)"/><path class="a" d="M104.2,102.78h.294v-.057l.114.048.7-.364.026-.035a2.2,2.2,0,0,0,.281-.382l-1.062.562Z" transform="translate(-58.461 -57.24)"/><path class="a" d="M80.3,84.45l-.026.035.4,1.19.241.707a1.46,1.46,0,0,1-.031-.439l-.325-.957Z" transform="translate(-45.037 -47.4)"/><path class="a" d="M83.428,93.712l.105-.035-.057-.167L82.958,92a.553.553,0,0,1-.088.088l.536,1.576Z" transform="translate(-46.496 -51.636)"/><path class="a" d="M83.938,85.45l.066.031.048-.1-.066-.031-2.3-1.08-.878-.439-.092.083.11.053Z" transform="translate(-45.29 -47.052)"/><path class="a" d="M188.662,98.621l2.371,1.488.062.04.061-.1-.075-.044L188.21,98.2Z" transform="translate(-152.631 -61.207)"/><path class="a" d="M187.859,97.984l-.009,0,.053.066.017-.022Z" transform="translate(-152.429 -61.084)"/><path class="a" d="M80.4,84.25c-.026.031-.053.057-.075.088l.263.54.356.72a.705.705,0,0,1,.022-.215l-.544-1.1Z" transform="translate(-45.071 -47.288)"/><path class="a" d="M84.187,92.081l.105-.048-.053-.1-.663-1.352a1.41,1.41,0,0,1-.026.206l.637,1.26Z" transform="translate(-46.877 -50.839)"/><path class="a" d="M80.613,84.214l.044-.048-.048-.066h0l-.04.031-.04.053v.035L81.1,85c0-.07,0-.123.039-.141l-.312-.439Z" transform="translate(-45.183 -47.204)"/><path class="a" d="M83.812,88.568l.088-.061-.035-.048L82.1,86v.215l1.712,2.358Z" transform="translate(-46.064 -48.27)"/><path class="a" d="M188.019,98.116l-.075-.066-.013.013-.018.022-.044.048.22.2,2.472,2.283.026.026.079-.083-.057-.048-2.138-1.976Z" transform="translate(-152.44 -61.123)"/><path class="a" d="M83.491,83.511l-1.032-.571-.149.048,1.089.6A.852.852,0,0,1,83.491,83.511Z" transform="translate(-46.182 -46.553)"/><path class="a" d="M103.911,99.017l-.031-.022.1-.118h0l.25-.25.114-.145,1.844-2.761V95.5l-2.445,3.582h.031l.075-.044Z" transform="translate(-58.203 -53.599)"/><path class="a" d="M105.722,101.373c.035-.061.066-.127.1-.193l-.909.566-.72.58h0l.364-.228Z" transform="translate(-58.456 -56.785)"/><path class="a" d="M103.85,103.633h0l.066-.053Z" transform="translate(-58.265 -58.132)"/><path class="a" d="M104.73,101.146l1.023-.825c.031-.07.057-.14.083-.211l-1.559,1.269-.237.285-.057-.048-.048.04-.066.053a.07.07,0,0,1,.031.031h.11Z" transform="translate(-58.276 -56.185)"/><path class="a" d="M211.364,116.88l-.057-.057-.1.119.026.022.061.048.233-.285.083-.1Z" transform="translate(-165.533 -71.546)"/><path class="a" d="M104.8,99.6l.839-.847,1.005-1.238a1.138,1.138,0,0,1,.048-.237l-1.787,2.2Z" transform="translate(-58.798 -54.597)"/><path class="a" d="M104.48,100.281l-.25.25h0l.057.057.25-.25,1.664-1.624a.853.853,0,0,1,.061-.224l-.944.953Z" transform="translate(-58.478 -55.276)"/><path class="a" d="M107.68,92.954l.465-.035C108.04,92.844,107.891,92.857,107.68,92.954Z" transform="translate(-60.414 -52.124)"/><path class="a" d="M95.829,93.252h-.4v.057l.044-.035.061.07h.11v-.039l.053.026v-.026l.162.039,4.061-.316.066-.083-.04-.035-3.574.281Z" transform="translate(-53.542 -52.146)"/><path class="a" d="M202.66,108.22l.206.241,3.2,3.732.044-.04.039-.035-.009-.013-3.016-3.512Z" transform="translate(-160.737 -66.828)"/><path class="a" d="M202.5,107.8v-.026l-.061-.07-.039.035h0l-.04.04.083.1Z" transform="translate(-160.568 -66.536)"/><path class="a" d="M202.6,107.986l0-.066-.061.075-.009.013.057.044.47.373,3.451,2.744.048.04.07-.092-.062-.048-3.872-3.078Z" transform="translate(-160.664 -66.66)"/><path class="a" d="M97.055,94.145l2.472.149a1.389,1.389,0,0,0,.307-.092L96.48,94Z" transform="translate(-54.131 -52.757)"/><path class="a" d="M106.715,94.764V94.65l-1.185-.07v.088l1.155.075Z" transform="translate(-59.208 -53.083)"/><path class="a" d="M202.684,107.858l0,.066.1,0,.092,0-.105-.048.031-.066-.105-.009,0,.022Z" transform="translate(-160.748 -66.598)"/><path class="a" d="M105.433,96.512l.026-.105h0l-1.067-.277a1.084,1.084,0,0,1-.272.048l1.264.334Z" transform="translate(-58.417 -53.952)"/><path class="a" d="M96.211,93.921h-.061L96,93.86v.026l.364.18,1.756.439a.488.488,0,0,1,.127-.083l-1.453-.373Z" transform="translate(-53.861 -52.679)"/><path class="a" d="M202.971,107.772l-.053-.022-.018.035-.031.066.105.048,4.32,2.129.048.022.048-.1-.04-.018-4.017-1.98Z" transform="translate(-160.854 -66.565)"/><path class="a" d="M95.55,92.8l.053.079h0l.061-.044-.035-.075.321-.158h0l.176-.07h.04l.351-.241c-.026-.031-.048-.061-.075-.088l-.878.6Z" transform="translate(-53.609 -51.748)"/><path class="a" d="M100.678,90.71a1.584,1.584,0,0,0-.228.066h0L100.01,91a1.6,1.6,0,0,1-.07.158l.878-.439Z" transform="translate(-56.072 -50.912)"/><path class="a" d="M203.139,107.179l-.009-.035.228-.07.079-.04.044-.022-.18.07-.031-.092-.32.158.035.075.013.026Z" transform="translate(-160.899 -66.138)"/><path class="a" d="M96.92,92.645l.439-.18-.031-.035-.391.2Z" transform="translate(-54.378 -51.877)"/><path class="a" d="M100.8,90.84l-1.084.439a1.249,1.249,0,0,1-.1.162l1.374-.531Z" transform="translate(-55.887 -50.985)"/><path class="a" d="M96.7,92.673l-.176.07h0l.035.092.176-.07.514-.2a.569.569,0,0,1-.092-.088Z" transform="translate(-54.153 -51.905)"/><path class="a" d="M96.443,92.105l-.233.075v.1h0l1.659-.527,1.611-.514a1.157,1.157,0,0,0-.158-.07l-1.787.571a.408.408,0,0,1-.439.145l-.47.149Z" transform="translate(-53.979 -51.17)"/><path class="a" d="M90.64,87.934l.035.105.092-.031,1.559-.487-.211-.061-1.444.439Z" transform="translate(-50.855 -49.089)"/><path class="a" d="M93.9,91.8l.066.092H94l.825-.571-.149-.035-.729.5Z" transform="translate(-52.683 -51.237)"/><path class="a" d="M91.55,89.017l.044.105.088-.035,1.141-.439a1.022,1.022,0,0,0,.1-.158l-1.317.518Z" transform="translate(-51.365 -49.667)"/><path class="a" d="M92.61,90.684l.053.1.092-.048.5-.268-.092-.079-.487.268Z" transform="translate(-51.96 -50.732)"/><path class="a" d="M73.5,99.338a.212.212,0,0,0-.11-.048l-.7.356a.913.913,0,0,0-.075.162l.909-.439Z" transform="translate(-40.746 -55.725)"/><path class="a" d="M78.451,95.611l-.053-.1-.088.044L75.865,96.8a.772.772,0,0,1-.105.184l2.608-1.317Z" transform="translate(-42.507 -53.605)"/><path class="a" d="M72.85,99.607l.439-.307A.759.759,0,0,0,72.85,99.607Z" transform="translate(-40.875 -55.731)"/><path class="a" d="M78.142,94.517l-.061-.1h0L76,95.829a.219.219,0,0,1,.057.1l2.094-1.4Z" transform="translate(-42.642 -52.993)"/><path class="a" d="M76.28,94.528l-.9.764a.738.738,0,0,0,.083.079L77.184,93.9C76.912,94.1,76.579,94.33,76.28,94.528Z" transform="translate(-42.294 -52.701)"/><path class="a" d="M185.5,103.213l.11.057,1.115-.338.075-.022-.031-.11-.07.022-1.133.342Z" transform="translate(-151.11 -63.788)"/><path class="a" d="M78.051,90.051h0V90.03h-.026L78,89.99h0a1.089,1.089,0,0,0,0,.119Z" transform="translate(-43.762 -50.508)"/><path class="a" d="M78.054,88.76l.039-.079.066.031.07-.048,1.032-.746.061-.035-.066-.092h0l-1.133.795-.088.062-.026.022h0v.026Z" transform="translate(-43.77 -49.274)"/><path class="a" d="M78.282,87.564l.931-1.111.066-.083L79.2,86.3h0l-.408.487a1.378,1.378,0,0,1-.6.742v.048l.057.048Z" transform="translate(-43.871 -48.438)"/><path class="a" d="M78.325,89.888l-.11-.057L78.15,89.8l-.04.079h.026l.075-.07.189.2,1.238.606a.438.438,0,0,0,.1-.079h-.044Z" transform="translate(-43.826 -50.401)"/><path class="a" d="M81.574,93.574l.061-.057-.1-.1-.483-.5H80.92l.632.654Z" transform="translate(-45.402 -52.152)"/><path class="a" d="M78.225,89.89l-.075.07h0v.022l.391.4h.07a.233.233,0,0,1,.1,0L78.4,90.07Z" transform="translate(-43.848 -50.452)"/><path class="a" d="M192.85,105.164l.11.031.048-.176,1.1-3.964.04-.149.009-.1.018,0,.026-.088h0l-.11-.031-.263.944-.948,3.429Z" transform="translate(-155.234 -62.604)"/><path class="a" d="M88.77,87.026h.066v.031h.07l.048.351.975,1.971c.053,0,.092.057.092.154a.162.162,0,0,0,0,.066v.044a.347.347,0,0,0,.176.1l-1.251-2.533L88.871,87l-.057.026H88.77Z" transform="translate(-49.806 -48.831)"/><path class="a" d="M195.408,101l.04,0,0-.031-.07-.009h-.026l-.018,0-.009.1-.009.079-.356,3.771,0,.04.114.013.009-.092.347-3.7Z" transform="translate(-156.417 -62.75)"/><path class="a" d="M88.944,87.14H88.83l.026.167.439,2.884.1-.092-.378-2.634Z" transform="translate(-49.839 -48.909)"/><path class="a" d="M86.823,96.28,84.65,97.342a1.126,1.126,0,0,1,.136.061L86.9,96.368A.756.756,0,0,1,86.823,96.28Z" transform="translate(-47.494 -54.036)"/><path class="a" d="M92.216,94.219a.747.747,0,0,1-.224.189c-.132.057-.263.07-.408.119l-.2.1a.983.983,0,0,0-.272.259l.623-.307.536-.351v.031l.132-.119h0Z" transform="translate(-51.118 -52.836)"/><path class="a" d="M87.1,100.061l.439-.4a1.115,1.115,0,0,1,0-.167l-.536.5Z" transform="translate(-48.813 -55.837)"/><path class="a" d="M91.424,94.1l-.039-.04L91.345,94l-.044.044-.132.119.04.066-.386.25L89.11,96.05l.083.066h0l1.756-1.624Z" transform="translate(-49.996 -52.757)"/><path class="a" d="M84.966,100.158v-.048H84.94Z" transform="translate(-47.657 -56.185)"/><path class="a" d="M89.425,94.437l-.04-.066V94.34l-.536.351-.8.509a.329.329,0,0,1-.255.167l-1.866,1.22.092.075,3.012-1.976Z" transform="translate(-48.213 -52.948)"/><path class="a" d="M82.568,98.49l-.171.123-.167.211.088.07.241-.307Z" transform="translate(-46.137 -55.276)"/><path class="a" d="M190.4,111.793l-.017.022.053-.018-.018-.013-.009,0Z" transform="translate(-153.848 -68.825)"/><path class="a" d="M190.545,111.9l.022-.026-.057-.048.018.053Z" transform="translate(-153.921 -68.853)"/><path class="a" d="M190.169,112.013l.066.009-.022-.062-.053.04Z" transform="translate(-153.724 -68.926)"/><path class="a" d="M82.355,98.361v-.1l-.176.079-.329.228h0l.079.066.228-.158Z" transform="translate(-45.924 -55.147)"/><path class="a" d="M190.55,111.95l.017.048,0,0,.009,0-.013-.018Z" transform="translate(-153.943 -68.921)"/><path class="a" d="M73.373,100.9l.044.1.2-.088,1.756-.768.281-.246-2.292,1Z" transform="translate(-41.161 -56.067)"/><path class="a" d="M82.125,98.114v-.026h0V98l-.685.294a.776.776,0,0,1,.136.066l.408-.176Z" transform="translate(-45.694 -55.001)"/><path class="a" d="M83.311,98.051v-.1h-.1v.088h.048v.105l.439,1.348.088-.1-.439-1.317Z" transform="translate(-46.687 -54.973)"/><path class="a" d="M82.764,102.028v-.2C82.632,101.949,82.654,102.019,82.764,102.028Z" transform="translate(-46.386 -57.15)"/><path class="a" d="M83.082,98.23h-.114v.224l-.048.47.105.092.066-.667Z" transform="translate(-46.524 -55.13)"/><path class="a" d="M93.026,95.3l-.075-.083-.1.079L90.62,97.235a.567.567,0,0,0,.391-.206c.2-.233.316-.312.4-.334l1.506-1.317Z" transform="translate(-50.843 -53.442)"/><path class="a" d="M95.569,96.787l-.044-.1-.11.07-1.045.659a.156.156,0,0,1,0,.04v.075l1.076-.68Z" transform="translate(-52.947 -54.266)"/><path class="a" d="M98.3,101.49v-.11h-.132l-1.343.18a2.976,2.976,0,0,1,.439.053l.983-.132Z" transform="translate(-54.321 -56.897)"/><path class="a" d="M96.033,98.865l-.044-.105h-.057l-1.594.637a1.048,1.048,0,0,1-.048.141L96,98.865Z" transform="translate(-52.902 -55.428)"/><path class="a" d="M74.222,102.843l-.812-.123A.878.878,0,0,0,74.222,102.843Z" transform="translate(-41.189 -57.649)"/><path class="a" d="M212.036,117.54l-.026.057h.154l-.013-.009Z" transform="translate(-165.982 -72.056)"/><path class="j" d="M33.47,120.93c.123.092.246.184.378.268v-.268Z" transform="translate(-18.784 -67.864)"/><path class="j" d="M34.32,112.93l.241,3.925.057.026.408-.342Z" transform="translate(-19.261 -63.377)"/><path class="j" d="M12.655,104.94l-1.005,1.278a1.317,1.317,0,0,1,.522.5h.3Z" transform="translate(-6.544 -58.894)"/><path class="j" d="M15,110.81l.022.031c.066.092.149.224.241.369l.224-.329Z" transform="translate(-8.423 -62.187)"/><path class="j" d="M14.908,109.63l-1.638-.11c.307.373.465.277.663.439l.685.105Z" transform="translate(-7.452 -61.464)"/><path class="j" d="M33.232,119.11l-.742.439c.088.079.184.158.285.242h.5Z" transform="translate(-18.234 -66.843)"/><path class="j" d="M32.938,117l-.878,1.181.105.1.825-.5Z" transform="translate(-17.993 -65.66)"/><path class="j" d="M15.94,111.984h0l.079-.154Z" transform="translate(-8.95 -62.76)"/><path class="j" d="M29.29,111l.637,3.385h0l.3-3.288Z" transform="translate(-16.439 -62.294)"/><path class="j" d="M18.13,109.86l4.829,3.894h0l-3.512-3.745Z" transform="translate(-10.179 -61.654)"/><path class="j" d="M21.2,113.66l-.628.931a1.757,1.757,0,0,0,.224.255,1.791,1.791,0,0,0,.4.281l.878-.759Z" transform="translate(-11.548 -63.786)"/><path class="j" d="M25.45,117.554c.378.193,1.01.707,1.365.531h.04l-.935-.755Z" transform="translate(-14.285 -65.845)"/><path class="j" d="M23.138,115.47l-.878.742a3.641,3.641,0,0,0,1.207.224h.044l.509-.268Z" transform="translate(-12.496 -64.801)"/><path class="j" d="M21.56,110.21l3.446,3.679.066-.026-2.441-3.543Z" transform="translate(-12.103 -61.851)"/><path class="j" d="M19.439,112.06,19,113.215h0c.58,0,.439.066.6.369l.606-.878Z" transform="translate(-10.667 -62.889)"/><path class="j" d="M16.64,112.262l.075.088.083-.76Z" transform="translate(-9.343 -62.625)"/><path class="j" d="M16.511,111.151l-.211.637.061.079.18-.777Z" transform="translate(-9.152 -62.344)"/><path class="j" d="M24.35,110.5l2.41,3.512a.669.669,0,0,1,.132,0l-1.4-3.394Z" transform="translate(-13.668 -62.013)"/><path class="j" d="M17.446,110.16l-.176,1.6a1.291,1.291,0,0,0,.659.378l.461-1.221Z" transform="translate(-9.696 -61.823)"/><path class="j" d="M31.307,111.25,31,114.6l.14.105.931-3.372Z" transform="translate(-17.398 -62.434)"/><path class="j" d="M12.411,97.58H12.24l.184.092Z" transform="translate(-6.875 -54.766)"/><path class="j" d="M19.923,99.1l-.277-1.923a1,1,0,0,1-.378.228l-.189,1.98Z" transform="translate(-10.712 -54.541)"/><path class="j" d="M17.793,99.77l.189-1.98a2.49,2.49,0,0,1-.356.061l-.606,2.2Z" transform="translate(-9.556 -54.884)"/><path class="j" d="M15.67,100.2l.615-2.2h-.25l-1.194,2.494Z" transform="translate(-8.333 -55.001)"/><path class="j" d="M129.97,107.277l.4.5,4.9-2.6Z" transform="translate(-119.96 -65.117)"/><path class="j" d="M21.828,97.964,20.77,95.8a1.159,1.159,0,0,1-.18.487l.29,2Z" transform="translate(-11.559 -53.767)"/><path class="j" d="M22.285,92.873l5.861-2.322V90.52L22,92.46Z" transform="translate(-12.35 -50.805)"/><path class="j" d="M27.515,90.235V90.2L21,91.359v.457l.3.369Z" transform="translate(-11.789 -50.626)"/><path class="j" d="M34.848,111.68l3.732,1.431h0a3.54,3.54,0,0,0-.6-.553l-3.148-.878Z" transform="translate(-19.547 -62.675)"/><path class="j" d="M14.784,98.8l-.5-1.023-.4-.035.584,1.725Z" transform="translate(-7.795 -54.855)"/><path class="j" d="M15.881,97.968h0l-.048-.066-.36-.022H15.06l.439.878Z" transform="translate(-8.457 -54.934)"/><path class="j" d="M3.282,101.79,2,101.882a4.318,4.318,0,0,0,.066.619l.689.141Z" transform="translate(-1.13 -57.127)"/><path class="j" d="M2.18,103.67a2.739,2.739,0,0,0,.206.755l.4-.61Z" transform="translate(-1.231 -58.182)"/><path class="j" d="M3.947,97.8,4.6,96.77H4.539L1.87,98.012v.408Z" transform="translate(-1.057 -54.311)"/><path class="j" d="M3.877,99.45l-1.967.593a2.2,2.2,0,0,0,.026.413l1.37-.1Z" transform="translate(-1.08 -55.815)"/><path class="j" d="M11.377,97.578l-.6-.294L10.31,97.2l1.317,1.361Z" transform="translate(-5.792 -54.553)"/><path class="j" d="M3,100.832,5.762,97.21l-.206-.29h-.1L3,100.823Z" transform="translate(-1.691 -54.395)"/><path class="j" d="M14,99.593l-.641-1.883H13.17l.588,2.4Z" transform="translate(-7.396 -54.839)"/><path class="j" d="M10.41,105.975a1.006,1.006,0,0,0,.439.228L11.8,105Z" transform="translate(-5.848 -58.928)"/><path class="j" d="M11.261,98.7l-1.55-1.616L9.58,97.06c.439.584,1.221,1.629,1.892,2.507Z" transform="translate(-5.383 -54.474)"/><path class="j" d="M22.927,97.06,21,94.72v.268l1.155,2.331Z" transform="translate(-11.789 -53.161)"/><path class="j" d="M38.539,104.712a.389.389,0,0,0-.044-.132l-.825,1.005Z" transform="translate(-21.14 -58.692)"/><path class="j" d="M38.093,106.485a1.58,1.58,0,0,0,0-.255l-1.343,1.084Z" transform="translate(-20.624 -59.618)"/><path class="j" d="M35.76,106.934l1.791-1.444a2.3,2.3,0,0,0-.048-.329l-1.664,1.686Z" transform="translate(-20.069 -59.018)"/><path class="j" d="M24.349,94.341,29.262,91v-.04L23.91,93.8Z" transform="translate(-13.421 -51.052)"/><path class="j" d="M36.14,109.54l1.941.878a2.446,2.446,0,0,1-.083-.439l-1.1-.8Z" transform="translate(-20.282 -61.273)"/><path class="j" d="M34.29,110.54l2.981.834a1,1,0,0,1-.167-.259l-2.129-.935Z" transform="translate(-19.244 -61.834)"/><path class="j" d="M36.587,103.249a2.644,2.644,0,0,0-.171-.259l-1.756,3.1Z" transform="translate(-19.452 -57.801)"/><path class="j" d="M39.081,109.247a.812.812,0,0,0-.237-.487.531.531,0,0,1-.1-.54l-.623.325Z" transform="translate(-21.393 -60.734)"/><path class="j" d="M37.616,107.33a1.444,1.444,0,0,1,.035-.18L36,108.186Z" transform="translate(-20.203 -60.134)"/><path class="j" d="M37.506,104.041a1.574,1.574,0,0,0-.105-.211L36,105.872Z" transform="translate(-20.203 -58.272)"/><path class="j" d="M26.571,95.429l4.281-2.92a2.2,2.2,0,0,0-.031-.439L26.54,95.429Z" transform="translate(-14.897 -51.675)"/><path class="j" d="M33.308,95.391a.685.685,0,0,1-.114-.241L30.56,96.467Z" transform="translate(-17.152 -53.403)"/><path class="j" d="M31.732,94.037a4.789,4.789,0,0,1-.053-.667L28,95.89Z" transform="translate(-15.716 -52.404)"/><path class="j" d="M25.379,95l4.583-3.6V91.32L25.08,94.63Z" transform="translate(-14.078 -51.254)"/><path class="j" d="M27.361,99.749l4.526.281a3.232,3.232,0,0,1-.079-.65l-4.509.351Z" transform="translate(-15.323 -55.775)"/><path class="j" d="M32.851,101.648l.119-.2a3.157,3.157,0,0,1-.237-.61l-3.982-.246Z" transform="translate(-16.136 -56.454)"/><path class="j" d="M32.443,98.368V97.78l-4.013.878Z" transform="translate(-15.957 -54.878)"/><path class="j" d="M33.951,96.919a1.187,1.187,0,0,0-.04-.259l-2.832.9Z" transform="translate(-17.443 -54.25)"/><path class="j" d="M27.88,97.46l.149-.035,4.048-1.291a.589.589,0,0,0-.184-.224h0l-3.951,1.532Z" transform="translate(-15.648 -53.829)"/><path class="j" d="M26.6,87.125a.685.685,0,0,0-.878.031c-.092.1-.206.048-.338-.066L21.59,89.1Z" transform="translate(-12.12 -48.82)"/><path class="j" d="M120.93,120.48l.847.061-.654-1.971Z" transform="translate(-114.889 -72.634)"/><path class="j" d="M36.08,120.356l.127.04,1.5-.263a2.1,2.1,0,0,0,.3-.316c.158-.127.263-.364,1.361-.1a2.446,2.446,0,0,0,.369.057H39.8l-.031-1.032Z" transform="translate(-20.248 -66.636)"/><path class="j" d="M122.265,120.417l.465.031-1.146-2.107,0,.018Z" transform="translate(-115.253 -72.505)"/><path class="j" d="M3.857,96.47l-1.084-.4a.948.948,0,0,0-.773.18l1.216.5Z" transform="translate(-1.13 -53.911)"/><path class="j" d="M5.805,96.367C5.437,96.3,5.1,96.235,4.8,96.2l.773.277Z" transform="translate(-2.701 -53.992)"/><path class="j" d="M146.481,127.551,143.5,126.41l2.59,1.471Z" transform="translate(-127.55 -77.032)"/><path class="j" d="M35.579,118.333l3.833-2.555V115.7a4.788,4.788,0,0,0-.3-.439L35.5,118.285Z" transform="translate(-19.923 -64.684)"/><path class="j" d="M6.013,97.8,3.3,101.356h0l.176-.145c.105-.2.263-.5.531-.439l2.568-2.2Z" transform="translate(-1.86 -54.889)"/><path class="j" d="M8.388,100.89l-2.678,1.8h0l.1.105L8.7,101.32Z" transform="translate(-3.212 -56.622)"/><path class="j" d="M7.721,99.73,5.21,101.872a.549.549,0,0,1,.132.083l2.7-1.809Z" transform="translate(-2.931 -55.972)"/><path class="j" d="M9.01,102.05l-2.88,1.471.277.321.773-.233a.092.092,0,0,1,.11-.035l2.344-.72Z" transform="translate(-3.447 -57.273)"/><path class="j" d="M7.306,106.523l.382-.167v-.026a1.278,1.278,0,0,1,0-.18l-.558.171A1.035,1.035,0,0,0,7.306,106.523Z" transform="translate(-4.008 -59.573)"/><path class="j" d="M1.893,96.73a.439.439,0,0,0,0,.215v.795l1.133-.54Z" transform="translate(-1.063 -54.289)"/><path class="j" d="M8.023,106.92l-.3.132C7.9,107.223,8.023,107.24,8.023,106.92Z" transform="translate(-4.339 -60.005)"/><path class="j" d="M122.02,116.608l.211.391,3.113-1.519Z" transform="translate(-115.5 -70.901)"/><path class="j" d="M45.147,118.857l-.2-1.611a.527.527,0,0,0-.04-.066l.053,1.712A1.023,1.023,0,0,0,45.147,118.857Z" transform="translate(-25.202 -65.761)"/><path class="j" d="M38.021,122.26l-1,.176A1.5,1.5,0,0,0,38.021,122.26Z" transform="translate(-20.776 -68.61)"/><path class="j" d="M24.335,85.1a1.164,1.164,0,0,0-.364-.158l-2.59,2.775Z" transform="translate(-12.002 -47.675)"/><path class="j" d="M122.63,116.977l.233.43,3.28-2.147Z" transform="translate(-115.842 -70.777)"/><path class="j" d="M123.28,117.5l.329.6,3.113-2.854Z" transform="translate(-116.207 -70.772)"/><path class="j" d="M45.754,118.884l-.228-.878c-.048-.075-.11-.158-.176-.246l.154,1.383A.479.479,0,0,0,45.754,118.884Z" transform="translate(-25.448 -66.086)"/><path class="j" d="M25.31,86.545c-.114-.11-.237-.255-.382-.4L21.64,88.49Z" transform="translate(-12.148 -48.354)"/><path class="j" d="M27.488,89.159a2.2,2.2,0,0,0-.356-.439L21.17,90.283Z" transform="translate(-11.884 -49.796)"/><path class="j" d="M23.344,85.03l-.707.637a6.767,6.767,0,0,0-1.067,1.585l2.2-2.362A1.053,1.053,0,0,0,23.344,85.03Z" transform="translate(-12.109 -47.647)"/><path class="j" d="M28.049,87.938a1.368,1.368,0,0,0-.123-.1,2.264,2.264,0,0,0-.4-.347L23,89.268Z" transform="translate(-12.911 -49.106)"/><path class="j" d="M25.511,85.7a2.766,2.766,0,0,0-.277-.233l-2.454,2.2Z" transform="translate(-12.787 -47.972)"/><path class="j" d="M128.956,114.854l-.356-.514-3.451,3.793h.018Z" transform="translate(-117.256 -70.261)"/><path class="j" d="M147.29,130.62l-3.35,2.235,3.372-1.475Z" transform="translate(-127.796 -79.394)"/><path class="j" d="M130.08,116.27l-.373-.54-3.337,2.884Z" transform="translate(-117.94 -71.041)"/><path class="j" d="M124.99,123.081l.053-.048v-.013Z" transform="translate(-117.166 -75.131)"/><path class="j" d="M126.39,123.323l6.054.619-.241-.351-5.707-.281Z" transform="translate(-117.951 -75.293)"/><path class="j" d="M137.706,118.812l.435-.768L134.69,115.3Z" transform="translate(-122.608 -70.8)"/><path class="j" d="M135.789,128.077l-.623-3.323-.786-.083Z" transform="translate(-122.434 -76.056)"/><path class="j" d="M9.29,105.391l.105.114,1.124-.5Z" transform="translate(-5.22 -58.928)"/><path class="j" d="M133.039,122.607l-.58-.847-4.43.6Z" transform="translate(-118.871 -74.424)"/><path class="j" d="M134.09,115l2.928,4.259,0-.009.316-.558-.044.04Z" transform="translate(-122.271 -70.632)"/><path class="j" d="M124.15,118.227l.2.364,3-3.3Z" transform="translate(-116.695 -70.794)"/><path class="j" d="M126.519,120.834l4.979-.667-.733-1.067-4.324,1.73Z" transform="translate(-117.98 -72.932)"/><path class="j" d="M139.874,126.722l-.035-.632L139,129.141Z" transform="translate(-125.025 -76.853)"/><path class="j" d="M125.775,119.734l4.531-1.813-.514-.751-4.052,2.56Z" transform="translate(-117.587 -71.849)"/><path class="j" d="M9.71,105.412c.083.1.162.206.233.294l1.471-1.036Z" transform="translate(-5.455 -58.743)"/><path class="j" d="M138.907,116.42l.465-.817-4.483-1.163Z" transform="translate(-122.72 -70.317)"/><path class="j" d="M144.136,129.068l.751-.623L142.45,126.5Z" transform="translate(-126.961 -77.083)"/><path class="j" d="M141.776,125.952l-.026-.022,1.37,3.341.593-.5-.061.039Z" transform="translate(-126.568 -76.763)"/><path class="j" d="M142.373,130.077l.593-.5-1.326-3.231Z" transform="translate(-126.506 -76.999)"/><path class="j" d="M144.823,128.062l.43-.364-3.073-1.747Z" transform="translate(-126.809 -76.774)"/><path class="j" d="M133.86,114.31l3.872,3.082.54-.948-4.32-2.129Z" transform="translate(-122.142 -70.244)"/><path class="j" d="M140.1,129.206l-.066-1.036-.782,2.169Z" transform="translate(-125.166 -78.02)"/><path class="a" d="M27.4,89.72,21.08,90.844h-.07v.228l6.5-1.142A1.572,1.572,0,0,0,27.4,89.72Z" transform="translate(-11.794 -50.356)"/><path class="a" d="M35.583,102.742l-.026.11h-.048l-.47.817h.04l-.048.1h-.044l-.54.948.057.048-.07.088-.044-.04-.439.768h0l-.044.035-.316.558h0l.079.114.026-.1h.044l-.057-.105.272-.145.026-.035h0l.044-.062,1.756-3.1-.092-.123-.04-.088-.119.2Z" transform="translate(-18.851 -57.548)"/><path class="a" d="M16.352,109.82h-.136l-.29.439H16v.114h-.123l-.224.329.136.2.092-.136.171-.329.088-.263.1.031.035-.158.11.026-.132.571-.083.76c.066.075.132.149.2.215l.176-1.6Z" transform="translate(-8.788 -61.632)"/><path class="a" d="M32.425,111.789v-.329h-.114l-.931,3.372c.057.044.119.092.18.149l.048-.127Z" transform="translate(-17.612 -62.552)"/><path class="a" d="M4.156,96.58l-.233.11h.022l-.04.105-.127-.031-.623.294.061.026-.044.105-.158-.066-1.155.518h0v.206l2.7-1.2Z" transform="translate(-1.052 -54.205)"/><path class="a" d="M27.3,98.45l.514-.04,4.013-.878V97.3l-2.871.645Z" transform="translate(-15.323 -54.609)"/><path class="a" d="M6.918,106.021l.558-.171a.391.391,0,0,1,.057-.25l-.773.233Z" transform="translate(-3.801 -59.265)"/><path class="a" d="M135.068,113.24l-.145.035-.083.039Z" transform="translate(-122.692 -69.644)"/><path class="a" d="M11.038,104.093l.031.066.053-.04v-.026h.048v-.07l-.035-.053-2.344.72a.6.6,0,0,1,.228.162l1.229-.373Z" transform="translate(-4.939 -58.35)"/><path class="a" d="M133.365,113.78v-.053l.162-.013-.053-.083.04-.031-.026.009-.158.123.035.048Z" transform="translate(-121.845 -69.846)"/><path class="a" d="M125.751,114.75l-.07-.141-.961.325,0,.022-.11.018h0l-.847.285-.009.092-.11-.013,0-.04-.773.263-.048.176-.11-.031.026-.1-.825.281-.053.11.066.123,3.323-1.128Z" transform="translate(-115.416 -70.413)"/><path class="a" d="M134.065,113.66l-.141.066-.013-.026-.061.044.237-.018Z" transform="translate(-122.136 -69.88)"/><path class="a" d="M131.415,114.07l.048-.044.04.044.088-.1-.031-.04-.76.259.061.132.544-.268Z" transform="translate(-120.425 -70.031)"/><path class="a" d="M12.832,97.765l-.048.1-.066-.031.241.983.189.2-.079.079-.057-.057.211.878.329.439.035.066.053-.11,1.194-2.5h-.2l-.079.053-.373.777.053.1-.105.048h0l-.32.667.057.167-.105.035V99.6l-.237.5-.588-2.4L12.7,97.66v.07Z" transform="translate(-7.133 -54.811)"/><path class="a" d="M121.563,118.324l0-.018-.013-.026,0,0Z" transform="translate(-115.236 -72.472)"/><path class="a" d="M14.221,104.063h0l-.031-.053h0v.07Z" transform="translate(-7.969 -58.373)"/><path class="a" d="M23.875,84.925a.879.879,0,0,0-.285,0l-2.2,2.362a3.724,3.724,0,0,0-.184.509l.088-.075Z" transform="translate(-11.907 -47.66)"/><path class="a" d="M22.958,95.282l.132-.149.127.119.053-.035h0l.154-.123L27.7,91.735a2.552,2.552,0,0,0-.04-.255L23.09,95.089l-.3-.369h-.031l-.066-.1h.022l-.439-.544-.132.07-.053-.1.11-.057-.4-.5h-.048l-.044-.105h0l-.338-.413L21.285,93l-.035-.11h.04l-.29-.36V92.9l1.91,2.34Z" transform="translate(-11.789 -51.344)"/><path class="a" d="M124.83,117.781l0-.022.013,0,3.451-3.793-.053-.079.136-.092-.127-.119-.136.149-.088.1.035.04-.452.417-3,3.3.083.158.066.009.018-.013Z" transform="translate(-116.953 -69.891)"/><path class="a" d="M4.424,97.817l.031.11-.162.048-.571.909h.171V99H3.638l-.531.847h.11v.11l-.167.018-.4.632a.5.5,0,0,0,.149.184l2.472-3.921-.237-.048-.65,1.01Z" transform="translate(-1.495 -54.339)"/><path class="a" d="M14.779,109.351v-.026l-.114-.206-.443-.035v.057l-.105.035-.031-.1L13.247,109H12.83a2.126,2.126,0,0,0,.158.215l1.638.11Z" transform="translate(-7.206 -61.172)"/><path class="a" d="M9.078,97.134l.092.07-.044.057.566.755.057-.048.075.083-.061.057.316.439h0l.061.1h0l.32.439.083-.044.053.1-.07.035.623.8.035.053h0l.031.053h0l.057.044-.026.026h0v.026l1.141,2.112.114.206.119-.145h.022l.075-.066h-.066l-.083-.158-.14-.347-.057.053-.075-.1.079-.07-.329-.6-.061.039-.061-.1.07-.044-.233-.439h-.04l-.048-.1h.035l-.215-.391-.066-.123-.035-.066-.329-.439C10.391,98.53,9.6,97.485,9.17,96.9l-.32-.061.206.29Z" transform="translate(-4.973 -54.351)"/><path class="a" d="M128.505,114.076l.356.514.1-.079.07.083-.1.092.373.54.11-.07.061.1-.105.066.514.751.057-.022.04.105-.031.013.733,1.067.132-.018.013.11-.075.009.579.847.145,0,0,.114-.057,0,.241.351-6.054-.619-.417.057-.013-.1-.057,0-.132.114.132.105,1.335.136-.026-.026.083-.075.114.119,1.076.11-.022-.031.1-.061.075.11,1.137.114-.07-.171.1-.044.1.228.786.083-.026-.14.11-.022.035.176.944.1.013-.127.11.009-.013.127.768.079.118.013-.009-.149.044,0v-.013l-.079-.114-2.928-4.259-.206-.242-.057-.044.009-.013-.083-.1.039-.04-.035-.048-.009-.013-.048.035-.136.092Z" transform="translate(-117.16 -69.998)"/><path class="a" d="M34.07,111.044h.061v.088l.066-.044.1.145.11.061,3.148.878-.07-.053a1.541,1.541,0,0,1-.338-.3L34.167,111Z" transform="translate(-19.121 -62.294)"/><path class="a" d="M141.063,124.845l-.053-.1-.04-.009-.031.1v.013Z" transform="translate(-126.114 -76.095)"/><path class="a" d="M44.441,116.317l.048.07-.079-.127v.079Z" transform="translate(-24.921 -65.245)"/><path class="a" d="M38.6,115.051l-.391.329.092.053-.057.1-.127-.075-.439.364.066.048-.07.088-.083-.066-.751.628H36.8l-.6.5.048.11-.105.044-.031-.079-.588.54.031.149h-.114v-.088l-.408.342.22.114,3.613-3.025-.114-.132-.04.1Z" transform="translate(-19.665 -64.532)"/><path class="a" d="M44.442,117.455h.035l.048.105-.079.031.031,1.032a1.938,1.938,0,0,0,.228,0l-.053-1.712q-.061-.11-.145-.25l-.088.057Z" transform="translate(-24.927 -65.469)"/><path class="a" d="M43.44,114.966v-.026h0Z" transform="translate(-24.377 -64.504)"/><path class="a" d="M33.851,111.358h-.04l.022-.053-.1-.057.053-.1.119.066h0v-.088H33.68v.479l.04.632.048-.141.11.04-.14.382.061,1.032.035-.04.088.066-.11.149.048.781.11-.066.061.1-.167.1.044.685H34v.11h-.048v.268l.237.145-.241-3.925Z" transform="translate(-18.902 -62.367)"/><path class="a" d="M34.4,108.626l-.171.14-.061.083-.092-.066.026-.04-.272.145.057.105.048.1h0l.1-.053.685-.36h-.031l.044-.105.114.048.76-.4h0l.066-.088.044.031.623-.325a1.49,1.49,0,0,1,.061-.29l-1.624.878Z" transform="translate(-18.986 -60.359)"/><path class="a" d="M17.538,109.53l-.044.04-.075-.083.031-.026h-.022l-.119.145v.026h0l.184.149.944.76.061-.158.105.04-.075.193.786.632.083-.119.092.061-.088.127.878.72.075-.061.07.088-.057.048.878.716.132-.066.053.1-.088.048.944.742.211-.118-4.829-3.894Z" transform="translate(-9.719 -61.43)"/><path class="a" d="M14.253,99.667l.105-.035-.057-.167-.584-1.725H13.59l.641,1.87Z" transform="translate(-7.632 -54.855)"/><path class="a" d="M15.344,98.877l.105-.048-.053-.1-.439-.878H14.83l.5,1.023Z" transform="translate(-8.328 -54.917)"/><path class="a" d="M16.863,98.013l.079-.053H16.81l.048.066Z" transform="translate(-9.438 -54.979)"/><path class="a" d="M21.14,91.62v.07l.048-.026Z" transform="translate(-11.867 -51.422)"/><path class="a" d="M24.319,85.361l-.1-.061-2.955,2.634-.088.075v.04l.694-.492Z" transform="translate(-11.89 -47.877)"/><path class="a" d="M27.037,88.6l-.11-.088-5.049,1.33L21,90.178h.07Z" transform="translate(-11.789 -49.678)"/><path class="a" d="M21.885,89.167l4.522-1.778-.132-.079-5.023,1.976-.237.127h0a.365.365,0,0,0,0,.1Z" transform="translate(-11.796 -49.005)"/><path class="a" d="M21.31,89.14,25.1,87.129a.737.737,0,0,1-.092-.079l-3.67,1.945-.18.127h0l-.048.026a.3.3,0,0,1-.022.136h0Z" transform="translate(-11.839 -48.859)"/><path class="a" d="M21.2,88.533l.18-.127,3.288-2.34A.83.83,0,0,0,24.6,86l-2.748,1.932-.694.492v.044l.031.044Z" transform="translate(-11.879 -48.27)"/><path class="a" d="M34.54,106.55l.1-.075h0l.105-.066.048-.04H34.76l.1-.119h-.022l.246-.25.119-.141,1.392-2.041a.874.874,0,0,0-.061-.11l-1.945,2.761Z" transform="translate(-19.384 -58.204)"/><path class="a" d="M141.632,124.25l.057-.083-.035.026-.066-.083-.022.035-.026.04Z" transform="translate(-126.45 -75.742)"/><path class="a" d="M35.13,108.188l.373-.233,1.66-1.036a.364.364,0,0,1,.022-.149l-1.317.83Z" transform="translate(-19.715 -59.921)"/><path class="a" d="M141.89,123.776l.009.013.1-.079Z" transform="translate(-126.646 -75.518)"/><path class="a" d="M34.839,107.612l-.057-.048-.048.039-.1.079-.1.075h0l.066.083.035-.026.171-.14.729-.588L36.884,106v-.14L35.093,107.3Z" transform="translate(-19.384 -59.411)"/><path class="a" d="M35.75,106.281l.843-.847.825-1.005c0-.04-.035-.079-.053-.119l-1.506,1.831Z" transform="translate(-20.063 -58.541)"/><path class="a" d="M142.258,123.236l.233-.285.083-.1-.25.255-.057-.057-.1.119.031.022Z" transform="translate(-126.804 -75.035)"/><path class="a" d="M35.436,106.573l-.246.25h.022l.057.057.25-.255,1.664-1.673a.647.647,0,0,0-.035-.123l-.878.878Z" transform="translate(-19.749 -58.833)"/><path class="a" d="M26.733,99.443H26.29V99.5l.044-.035.061.07h.11V99.5l.053.022V99.5l.162.04,4.509-.351V99.07l-4,.312Z" transform="translate(-14.756 -55.602)"/><path class="a" d="M133.62,114.45l.206.241,3.2,3.732.044-.04.039-.035-.009-.013-3.016-3.512Z" transform="translate(-122.007 -70.323)"/><path class="a" d="M133.32,114l.083.1.061-.075V114l-.061-.07-.044.035h0Z" transform="translate(-121.839 -70.031)"/><path class="a" d="M133.556,114.216l0-.066-.061.075-.009.013.057.044.47.373,3.451,2.744.048.04.07-.088-.061-.048-3.872-3.082Z" transform="translate(-121.934 -70.155)"/><path class="a" d="M28.015,100.369l3.982.246a.157.157,0,0,0-.031-.114l-4.526-.281Z" transform="translate(-15.401 -56.247)"/><path class="a" d="M133.644,114.088l0,.066.1,0,.092,0-.105-.048.031-.066-.105-.009,0,.022Z" transform="translate(-122.018 -70.093)"/><path class="a" d="M134.424,114.176l4.483,1.163.053.013.026-.11-.018-.009-4.1-1.058-.575-.149-.061-.018-.158-.04-.009.026Z" transform="translate(-122.254 -70.054)"/><path class="a" d="M133.83,114.081l.105.048,4.32,2.129.048.022.048-.1-.039-.018-4.017-1.98-.364-.18-.053-.022-.018.035Z" transform="translate(-122.125 -70.059)"/><path class="a" d="M26.51,96.065l.053.083h.022l.061-.044-.035-.075.32-.158h0l.171-.07h.044l3.692-2.52V93.15l-4.281,2.92Z" transform="translate(-14.88 -52.281)"/><path class="a" d="M134.1,113.413l-.009-.035.228-.075.083-.04.04-.022-.176.07-.035-.092-.32.158.035.075.013.026Z" transform="translate(-122.17 -69.633)"/><path class="a" d="M27.87,96.76l1.168-.439L31.672,95l-.026-.114-3.719,1.853Z" transform="translate(-15.643 -53.257)"/><path class="a" d="M27.651,97.2l-.171.07h0l.035.092.18-.07,3.951-1.532a.525.525,0,0,1-.083-.088L28.8,96.737Z" transform="translate(-15.424 -53.694)"/><path class="a" d="M27.4,97.791l-.233.075v.1h.022l1.66-.527,2.832-.9a.513.513,0,0,0-.04-.105L27.6,97.721Z" transform="translate(-15.25 -54.121)"/><path class="a" d="M21.61,92.242l.035.11.083-.026L27.9,90.385a1.03,1.03,0,0,0-.039-.105L21.65,92.229Z" transform="translate(-12.131 -50.671)"/><path class="a" d="M24.86,94.432l.066.1h.031l4.869-3.31a.589.589,0,0,0-.031-.119l-4.913,3.319Z" transform="translate(-13.954 -51.131)"/><path class="a" d="M22.61,92.939l.044.105H22.7l5.3-2.107.483-.255V90.63l-5.861,2.3Z" transform="translate(-12.692 -50.867)"/><path class="a" d="M23.6,93.591l-.11.057.053.1.132-.07,5.343-2.819a.8.8,0,0,0-.035-.11L28.5,91Z" transform="translate(-13.186 -50.934)"/><path class="a" d="M24.342,85.482c-.075.092-.184.215-.312.364l.694-.637A1.756,1.756,0,0,0,24.342,85.482Z" transform="translate(-13.489 -47.827)"/><path class="a" d="M4.994,96.535l.04-.105H5.012l-.773-.285q-.218-.033-.439-.044l1.067.4Z" transform="translate(-2.14 -53.935)"/><path class="a" d="M3.178,97.164l.044-.105-.061-.026L1.927,96.51a.294.294,0,0,0-.057.1l1.15.47Z" transform="translate(-1.057 -54.165)"/><path class="a" d="M1.86,99.06v.031h0Z" transform="translate(-1.052 -55.596)"/><path class="a" d="M4.034,99.2,4,99.09h-.04L1.9,99.709v.118l1.967-.593Z" transform="translate(-1.074 -55.613)"/><path class="a" d="M3.534,101.6v-.114H3.363L2,101.6a.926.926,0,0,0,0,.114l1.286-.088Z" transform="translate(-1.128 -56.959)"/><path class="a" d="M2.889,103.68v-.11h-.11l-.689-.14v.119l.606.123Z" transform="translate(-1.181 -58.047)"/><path class="a" d="M5.889,97.58,5.8,97.51v.031L3,101.163a.228.228,0,0,0,.119.031l2.713-3.556Z" transform="translate(-1.691 -54.726)"/><path class="a" d="M9.007,101.871l-.053-.1-.083.044L6,103.28l.079.083,2.88-1.471Z" transform="translate(-3.374 -57.116)"/><path class="a" d="M8.289,100.747l-.061-.1h0L5.51,102.472a.664.664,0,0,1,.088.075l2.678-1.791Z" transform="translate(-3.099 -56.488)"/><path class="a" d="M3.424,105.67l.061-.11-.176.145A.246.246,0,0,0,3.424,105.67Z" transform="translate(-1.865 -59.242)"/><path class="a" d="M7.62,99.493l-.075-.083-.057.048-2.568,2.2a.387.387,0,0,1,.127.04l2.511-2.142Z" transform="translate(-2.768 -55.792)"/><path class="a" d="M12.037,97.715l.048-.1-.149-.07-.184-.092-.382-.061.6.294Z" transform="translate(-6.387 -54.659)"/><path class="a" d="M11.476,98.793l.079-.079-.189-.2-1.317-1.361L9.86,97.12l1.55,1.616Z" transform="translate(-5.54 -54.508)"/><path class="a" d="M16.66,100.24l.11.031.048-.176.606-2.2h-.119l-.615,2.2Z" transform="translate(-9.354 -54.945)"/><path class="a" d="M22.1,97.841l.1-.048-.066-.132L20.972,95.33a.648.648,0,0,1-.022.206L22.021,97.7Z" transform="translate(-11.761 -53.504)"/><path class="a" d="M18.764,99.742h.114V99.65l.189-1.98-.119.039-.189,1.98Z" transform="translate(-10.532 -54.816)"/><path class="a" d="M20.647,99h.11l-.29-2a.878.878,0,0,1-.1.119l.277,1.923Z" transform="translate(-11.435 -54.44)"/><path class="a" d="M126.564,114.315l.018.035.132-.123-.009-.018-.544.268-.1.048-.492.241-3.113,1.519-.035.018.053.1.04-.018,3.512-1.717Z" transform="translate(-115.724 -70.188)"/><path class="a" d="M127.639,114.233l-.035-.04-.039-.044-.048.044-.132.123.044.061-.386.255-3.113,2.854-.079.07.075.083.057-.053,3.2-2.937Z" transform="translate(-116.527 -70.155)"/><path class="a" d="M126.951,114.547l-.044-.061-.018-.035-.54.356-3.28,2.147L123,117l.061.1.061-.04,3.442-2.252Z" transform="translate(-116.05 -70.323)"/><path class="a" d="M12.57,104.72l-.171.123-.948,1.2.105.048,1.005-1.278Z" transform="translate(-6.432 -58.771)"/><path class="a" d="M121.357,118.023l-.018.022.053-.018-.018-.009-.009-.009Z" transform="translate(-115.119 -72.32)"/><path class="a" d="M121.505,118.14l.022-.026-.057-.044.018.048Z" transform="translate(-115.192 -72.354)"/><path class="a" d="M121.2,118.251l-.018-.061-.053.04,0,.013h0Z" transform="translate(-115.001 -72.421)"/><path class="a" d="M11.891,104.6v-.1l-.176.075L10.24,105.6l.031.039.044.044,1.387-.961Z" transform="translate(-5.753 -58.648)"/><path class="a" d="M121.51,118.18l.018.048,0,0,.009,0-.013-.018Z" transform="translate(-115.214 -72.415)"/><path class="a" d="M7.619,106.895l.3-.132v-.123l-.382.167Z" transform="translate(-4.238 -59.848)"/><path class="a" d="M11.5,104.36v-.044l-.031-.066-.8.347-1.124.487.079.092,1.7-.742Z" transform="translate(-5.366 -58.507)"/><path class="a" d="M121.273,118.068l-.053.018.013.026.018.061.048,0-.013.1.654,1.971.035.1.105-.035-.018-.057-.685-2.059-.013-.04-.018-.048-.018-.048v-.009h0Z" transform="translate(-115.051 -72.342)"/><path class="a" d="M120.99,118.323l-.048,0-.066-.009h0l0,.031-.009.1-.009.1-.184,1.8v.009l.114.013v-.018l.193-1.91Z" transform="translate(-114.743 -72.488)"/><path class="a" d="M125.234,118.689l.474-.3,3.337-2.884.1-.092-.07-.083-.1.079-3.789,3.28Z" transform="translate(-117.278 -70.817)"/><path class="a" d="M124.785,123.287l.044-.04.132-.114-.079,0,0-.079-.053.048-.018.013-.075.066-.031.026Z" transform="translate(-117.009 -75.147)"/><path class="a" d="M125.533,123.026l.057-.022-.035,0-.145.092.14-.018Z" transform="translate(-117.402 -75.119)"/><path class="a" d="M126.63,123.2l5.707.281.057,0,0-.114-.145,0-5.009-.25Z" transform="translate(-118.086 -75.187)"/><path class="a" d="M126.373,123.04l-.053.022.132-.018Z" transform="translate(-117.912 -75.142)"/><path class="a" d="M125.232,123.075h0l-.061-.1.009,0h-.061l-.013,0,0,.022v.013l0,.079.079,0,.057,0Z" transform="translate(-117.228 -75.102)"/><path class="a" d="M125.279,119.513l-.009,0,.061.1h0l.145-.092,4.052-2.56.105-.066-.061-.1-.11.07-3.71,2.344Z" transform="translate(-117.323 -71.641)"/><path class="a" d="M125.8,122.192l-.237.092-.022-.057-.14.018h0l0,.018.013.1.417-.057.105-.013.615-.083,4.43-.6.075-.009-.013-.11-.132.018-4.979.667Z" transform="translate(-117.396 -74.272)"/><path class="a" d="M125.69,120.687l.018.048.022.057.237-.092.053-.022,4.324-1.73.031-.013-.04-.105-.057.022-4.531,1.813Z" transform="translate(-117.559 -72.78)"/><path class="a" d="M15.455,110.72v-.114h-.07L14.7,110.5a.988.988,0,0,1,.127.136l.487.07Z" transform="translate(-8.255 -62.013)"/><path class="a" d="M19.4,111.57l-.105-.04-.061.158-.461,1.22a.54.54,0,0,0,.119,0l.439-1.155Z" transform="translate(-10.538 -62.591)"/><path class="a" d="M21.221,113.291l-.092-.061-.083.119-.606.878a.69.69,0,0,0,.066.105l.619-.913Z" transform="translate(-11.475 -63.545)"/><path class="a" d="M23.049,115.248l-.07-.088-.075.061-.9.746.11.057.878-.742Z" transform="translate(-12.35 -64.628)"/><path class="a" d="M25.834,117.075,25.781,117l-.132.066-.509.268.136.057.47-.246Z" transform="translate(-14.111 -65.66)"/><path class="a" d="M31.2,111h-.114v.127l-.3,3.288.11.066.3-3.345Z" transform="translate(-17.281 -62.294)"/><path class="a" d="M21.193,109.94l-.083.075.026.026,3.512,3.745.105-.048-3.446-3.679Z" transform="translate(-11.85 -61.699)"/><path class="a" d="M24.062,110.25l-.092.061.022.031,2.432,3.543a.556.556,0,0,1,.123,0l-2.41-3.512Z" transform="translate(-13.455 -61.873)"/><path class="a" d="M26.978,110.5l-.092-.228-.105.044.07.171,1.4,3.394.136.039h0Z" transform="translate(-15.031 -61.884)"/><path class="a" d="M29.074,110.61H28.96l.018.171.628,3.323h0a1.054,1.054,0,0,1,.127.057l-.628-3.381Z" transform="translate(-16.254 -62.075)"/><path class="a" d="M35.824,109.89,35.78,110h.031l2.129.935a1.069,1.069,0,0,1-.061-.149l-1.941-.878Z" transform="translate(-20.08 -61.671)"/><path class="a" d="M37.916,108.89l-.066.088h0l1.1.8a.308.308,0,0,0-.026-.154l-.953-.685Z" transform="translate(-21.241 -61.11)"/><path class="a" d="M45.33,118.9l-.154-1.383-.07-.088-.066-.1.18,1.611A.8.8,0,0,0,45.33,118.9Z" transform="translate(-25.274 -65.845)"/><path class="a" d="M45.75,118.32l.228.878a1.04,1.04,0,0,0-.228-.878Z" transform="translate(-25.673 -66.4)"/><path class="a" d="M141.81,125.98l1.875,2.863.061-.04.035-.022,0,0-1.686-2.568Z" transform="translate(-126.602 -76.791)"/><path class="a" d="M141.517,125.215l-.092-.145-.07.044,0,0Z" transform="translate(-126.344 -76.28)"/><path class="a" d="M141.52,125.75l.053.263,1.326,3.231.035.079.1-.044-.044-.11-1.37-3.341Z" transform="translate(-126.439 -76.662)"/><path class="a" d="M141.346,125.627l-.114-.088-.022-.009.114.562.707,3.609.018.088.11-.022-.026-.149-.733-3.727Z" transform="translate(-126.265 -76.539)"/><path class="a" d="M34.87,111.68l.654.373,2.977,1.141.105.04.04-.1h-.031Z" transform="translate(-19.569 -62.675)"/><path class="a" d="M141.148,125.424l.026-.031-.026-.013-.018.053.035.013.022.009Z" transform="translate(-126.22 -76.454)"/><path class="a" d="M141.126,125.1l-.119-.066-.057.1.1.057.026.013.044-.057.373.294,3.073,1.747.132.075.057-.1-.092-.053-2.59-1.471-.654-.373-.009-.009-.114-.062Z" transform="translate(-126.119 -76.258)"/><path class="a" d="M141.24,125.28l-.044.057-.026.031.04.031.114.088.1.079.026.022.281.228,2.437,1.945.079.061.07-.088-.062-.048-2.643-2.112Z" transform="translate(-126.243 -76.398)"/><path class="a" d="M39.513,116.4,35.68,118.95h.026l.439-.206,3.35-2.23.088-.057v-.026l-.048-.07Z" transform="translate(-20.024 -65.301)"/><path class="a" d="M39.684,118.535l-.048-.105H39.6L36.229,119.9l-.439.206.149.057,3.688-1.616Z" transform="translate(-20.086 -66.462)"/><path class="a" d="M36.635,122.239l1-.176a2.21,2.21,0,0,0,.215-.154l-1.5.263A2.067,2.067,0,0,0,36.635,122.239Z" transform="translate(-20.4 -68.414)"/><path class="a" d="M151.57,134.97Z" transform="translate(-132.077 -81.834)"/><path class="a" d="M16.14,111.766l.07.1.211-.637Z" transform="translate(-9.062 -62.423)"/><path class="a" d="M123.87,124.453l.009-.022-.1-.031-.088.263.127-.242Z" transform="translate(-116.437 -75.905)"/><path class="a" d="M16.823,110.256l-.11-.026-.035.158h.044l-.092.176-.18.777c.026.039.057.075.088.114l.158-.672Z" transform="translate(-9.236 -61.862)"/><path class="a" d="M16.356,110.832l.092-.176H16.4l-.057-.026-.127.237-.171.329-.079.154a.875.875,0,0,0,.075.1l.281-.536Z" transform="translate(-8.967 -62.086)"/><path class="a" d="M32.684,113.751l.14-.382-.11-.04-.048.141-.878,2.419-.048.127.053.044.105-.141Z" transform="translate(-17.814 -63.601)"/><path class="a" d="M33.733,120.78v-.11H33.14l.145.11h.439Z" transform="translate(-18.599 -67.718)"/><path class="a" d="M33.287,118.767l-.061-.1-.11.066-.825.518.088.079.742-.439Z" transform="translate(-18.122 -66.597)"/><path class="a" d="M32.936,116.616l-.088-.066-.035.04-.847,1.137-.105.14.04.04.044.04.878-1.181Z" transform="translate(-17.881 -65.407)"/><path class="j" d="M102.65,137.136h.039l1.392-.246a5.343,5.343,0,0,0,.922-.79l-2.344,1.023Z" transform="translate(-57.592 -76.374)"/><path class="j" d="M103.8,138.513a4.405,4.405,0,0,0,.439-.233l-.839.149Z" transform="translate(-58.013 -77.597)"/><path class="j" d="M102.822,139.023l.07-.026-.342-.167Z" transform="translate(-57.536 -77.906)"/><path class="j" d="M84.33,120.084a.266.266,0,0,1,.224.083.312.312,0,0,1,0,.215l2.832-3.113Z" transform="translate(-47.315 -65.811)"/><path class="j" d="M89.191,130.21a.193.193,0,0,1-.057.2,1.756,1.756,0,0,0-.514,1.142l1.084-.931Z" transform="translate(-49.722 -73.07)"/><path class="j" d="M83.17,119.472l.316.58h.048l3.073-2.832Z" transform="translate(-46.664 -65.783)"/><path class="j" d="M103.357,138.939l.105-.044-.342-.075Z" transform="translate(-57.856 -77.9)"/><path class="j" d="M89.808,131.32l-1.168,1a.966.966,0,0,0,.325.632l1.756-.909Z" transform="translate(-49.733 -73.693)"/><path class="j" d="M192.31,139.59l4.917,3.964-3.609-3.828Z" transform="translate(-154.931 -84.426)"/><path class="j" d="M93,137.772a.583.583,0,0,0,.053.07l.628-.2Z" transform="translate(-52.179 -77.238)"/><path class="j" d="M92.73,137.318l.048.1,1.137-.219Z" transform="translate(-52.027 -76.991)"/><path class="j" d="M93.687,135.23l-1.927.439a.918.918,0,0,1,.325.329l2.274-.228Z" transform="translate(-51.483 -75.886)"/><path class="j" d="M91.34,133.13l-1.73.909a1.967,1.967,0,0,0,.6.29,1.406,1.406,0,0,1,.2.083l1.958-.439Z" transform="translate(-50.277 -74.708)"/><path class="j" d="M77.31,121.869c.237-.031.474-.053.7-.07l.746-.948Z" transform="translate(-43.377 -67.819)"/><path class="j" d="M112.66,126.92h0v0Z" transform="translate(-63.207 -71.225)"/><path class="j" d="M111.916,127.384l.184-.7-.158-.066-.092.9Z" transform="translate(-62.753 -71.056)"/><path class="j" d="M71.09,121.97a4.285,4.285,0,0,0,.839.088l2.687-1.168Z" transform="translate(-39.888 -67.842)"/><path class="j" d="M73.65,121.85a3.1,3.1,0,0,0,.593-.04l.777-.1,1.695-1.19Z" transform="translate(-41.324 -67.634)"/><path class="j" d="M111.4,126.328a.829.829,0,0,1-.3-.158l.219.979Z" transform="translate(-62.332 -70.804)"/><path class="j" d="M110.2,121.487l.338,1.506a1.317,1.317,0,0,1,.439-.439l.167-1.594Z" transform="translate(-61.827 -67.881)"/><path class="j" d="M81.46,120.328l.474,1.466a2.885,2.885,0,0,0,.338,0l-.8-1.484Z" transform="translate(-45.705 -67.517)"/><path class="j" d="M81,121.662a.347.347,0,0,1,.22.118.479.479,0,0,0,.338.149l-.439-1.37Z" transform="translate(-45.447 -67.657)"/><path class="j" d="M105.883,134.459c.145-.167.285-.342.439-.54a3.277,3.277,0,0,0,.268-.4l-2.7,1.809Z" transform="translate(-58.288 -74.927)"/><path class="j" d="M79.24,121.749a3.545,3.545,0,0,1,.663,0l.1-.979Z" transform="translate(-44.46 -67.775)"/><path class="j" d="M196,130.708l-.356-.518-3.451,3.793h.018Z" transform="translate(-154.863 -79.153)"/><path class="j" d="M102.178,134.09l.154-.066,3.42-2.292a3.39,3.39,0,0,0,.408-.992l-4,3.341Z" transform="translate(-57.317 -73.367)"/><path class="j" d="M109.715,105.553l-.878-.553c-.04.061-.083.132-.127.211l1.045.391S109.715,105.575,109.715,105.553Z" transform="translate(-60.991 -58.928)"/><path class="j" d="M185.107,126.185l-.241-1.005-1.115.338Z" transform="translate(-150.129 -76.342)"/><path class="j" d="M185.462,127.943l-.242-.983-1.33-.65Z" transform="translate(-150.207 -76.976)"/><path class="j" d="M95.286,137.34,94,137.955a1.735,1.735,0,0,0,.268.092l.922-.61Z" transform="translate(-52.74 -77.07)"/><path class="j" d="M184.778,124.414l-.1-.4-1.032.746Z" transform="translate(-150.073 -75.686)"/><path class="j" d="M184.4,122.61l-.931,1.111-.057.189,1.106-.8Z" transform="translate(-149.938 -74.901)"/><path class="j" d="M184.324,120.2l-.584,1.888.808-.966Z" transform="translate(-150.123 -73.549)"/><path class="j" d="M196.675,126.233l-2.265-2.783,1.5,3.042Z" transform="translate(-156.109 -75.372)"/><path class="j" d="M76.136,112.2H76.11c.3.439,1.317,1.756,2.116,2.81l-.211-.878Z" transform="translate(-42.704 -62.967)"/><path class="j" d="M194.805,127.115l.962-.329-1.427-2.876Z" transform="translate(-156.069 -75.63)"/><path class="j" d="M194,122.97h0l0,0Z" transform="translate(-155.879 -75.102)"/><path class="j" d="M193.23,127.222l.843-.285-.492-3.407Z" transform="translate(-155.447 -75.417)"/><path class="j" d="M192.3,123.51l-1.1,3.964.773-.263.36-3.771Z" transform="translate(-154.308 -75.366)"/><path class="j" d="M72.648,112.953l.04.026a4.892,4.892,0,0,1-.3-.439l-2.634,4.166Z" transform="translate(-39.136 -63.158)"/><path class="j" d="M192.01,138.936l.061-.053v-.013Z" transform="translate(-154.762 -84.022)"/><path class="j" d="M112.27,122.053l.132-.1a2.271,2.271,0,0,0,.329-.439l.312-1.177a1.067,1.067,0,0,0-.057-.167l-.553.29Z" transform="translate(-62.988 -67.438)"/><path class="j" d="M93.29,137.745a.687.687,0,0,0,.184.132l1.181-.566Z" transform="translate(-52.341 -77.053)"/><path class="j" d="M109.714,104.43l-.584.149h0l.821.492A2.058,2.058,0,0,0,109.714,104.43Z" transform="translate(-61.227 -58.608)"/><path class="j" d="M113.927,121.57l-.057.228A1.94,1.94,0,0,0,113.927,121.57Z" transform="translate(-63.886 -68.223)"/><path class="j" d="M80.729,105.937l-.483-.268a.933.933,0,0,0-.246,0l-.571.083,1.537.5A2.531,2.531,0,0,0,80.729,105.937Z" transform="translate(-44.566 -59.299)"/><path class="j" d="M73.615,114.421l-.558-.751-2.718,3.547Z" transform="translate(-39.467 -63.792)"/><path class="j" d="M87.76,106.022c0,.079.035.193.031.307l.479-.509C87.988,105.9,87.76,105.947,87.76,106.022Z" transform="translate(-49.239 -59.388)"/><path class="j" d="M73.922,115.979l-.32-.439-3.411,2.915Z" transform="translate(-39.383 -64.841)"/><path class="j" d="M74.46,117.129l-.321-.439-3.679,2.463Z" transform="translate(-39.534 -65.486)"/><path class="j" d="M85.175,126.456l.167.083-.562-.439A.685.685,0,0,0,85.175,126.456Z" transform="translate(-47.567 -70.765)"/><path class="j" d="M112.542,127.836s.29-.268.132-.536l-.294.619Z" transform="translate(-63.05 -71.438)"/><path class="j" d="M101.17,139.259a.775.775,0,0,0,.11-.048c.145-.066.316-.123.509-.189l-.483-.342Z" transform="translate(-56.762 -77.822)"/><path class="j" d="M109.75,109.535l.654-.716a6,6,0,0,0,0-.689l-.637,1.26Z" transform="translate(-61.575 -60.684)"/><path class="j" d="M92.622,106.07c-.171-.075-.4-.149-.606-.22l-3.806,1Z" transform="translate(-49.492 -59.405)"/><path class="j" d="M198.805,118.609l-.417-.189-2.568,1.365Z" transform="translate(-156.9 -72.55)"/><path class="j" d="M92.823,105.375l-.439-.136a.611.611,0,0,1,.18-.119h0l-2.564,1Z" transform="translate(-50.496 -58.995)"/><path class="j" d="M91.118,104.348l-.1-.048a.47.47,0,0,1-.263.162c-.184.035-.364.053-.522.079l-1.545,1.1Z" transform="translate(-49.761 -58.535)"/><path class="j" d="M87.049,107.61a.96.96,0,0,1-.123,0l-.026.149Z" transform="translate(-48.757 -60.392)"/><path class="j" d="M89.187,105.55l-.167.035-.61.65Z" transform="translate(-49.604 -59.237)"/><path class="j" d="M90.523,105a.376.376,0,0,0-.171.1.466.466,0,0,1-.193.088l-.439.369Z" transform="translate(-50.339 -58.928)"/><path class="j" d="M72.564,109.625,71.3,108.15a.843.843,0,0,0-.4.54.334.334,0,0,1-.14.211l.14.277Z" transform="translate(-39.703 -60.695)"/><path class="j" d="M91.417,110.684l4.311-2.933-.154-.061-4.614,2.437Z" transform="translate(-51.034 -60.437)"/><path class="j" d="M70.321,110a1.469,1.469,0,0,1-.171.1l.259.066Z" transform="translate(-39.36 -61.733)"/><path class="j" d="M89.248,109.211l4.794-1.9-.184-.07L88.91,108.8Z" transform="translate(-49.884 -60.185)"/><path class="j" d="M87.938,108.416l4.856-1.523a2.858,2.858,0,0,1-.342-.162l-5.141.918Z" transform="translate(-48.987 -59.899)"/><path class="j" d="M90.241,109.937l4.548-2.4h-.061l-4.878,1.936Z" transform="translate(-50.411 -60.353)"/><path class="j" d="M71.4,111.235l-2.41-.645-.347.145,2.164.777Z" transform="translate(-38.513 -62.064)"/><path class="j" d="M86.261,107.67H86.23l.035.04Z" transform="translate(-48.381 -60.426)"/><path class="j" d="M188.549,123.834l.334-.7-2.432-2.226Z" transform="translate(-151.643 -73.947)"/><path class="j" d="M185.96,120.1l.04.04,2.941,1.848.193-.4-3.126-1.466Z" transform="translate(-151.368 -73.493)"/><path class="j" d="M74.085,108.046l1.124-1.756h0l-1.449,1.317Z" transform="translate(-41.386 -59.652)"/><path class="j" d="M190.366,121.876l.136-.281-2.432-.795Z" transform="translate(-152.552 -73.885)"/><path class="j" d="M182.281,122.511l.742-2.4h0l-1.2,1.87Z" transform="translate(-149.046 -73.498)"/><path class="j" d="M189.305,123.171l.233-.487-2.428-1.523Z" transform="translate(-152.014 -74.087)"/><path class="j" d="M85.868,107.883l-.171-.193H85.53l.312.171Z" transform="translate(-47.988 -60.437)"/><path class="j" d="M187.366,127.445l.241-.5L186.33,123.2Z" transform="translate(-151.576 -75.231)"/><path class="j" d="M185.69,120.29l2.011,4.083.369-.781,0,.009Z" transform="translate(-151.217 -73.599)"/><path class="j" d="M74.224,106.4H74.1l-1.177.312c-.079.061-.285.167-.5.307l.492.575Z" transform="translate(-40.634 -59.713)"/><path class="j" d="M187.527,125.925l.321-.667-1.778-3.618Z" transform="translate(-151.43 -74.356)"/><path class="j" d="M175.792,129.2l-3.732,1.12v0l3.157-.206Z" transform="translate(-143.571 -78.597)"/><path class="j" d="M67.58,121.43a2.965,2.965,0,0,0,.575.47l.031-.048Z" transform="translate(-37.919 -68.145)"/><path class="j" d="M74.171,117.9l-4.351,2.239.145.061,4.829-1.475Z" transform="translate(-39.175 -66.165)"/><path class="j" d="M67.544,119.194l-2.384-.474a.676.676,0,0,0,.158.193,4.391,4.391,0,0,1,.584.637l.988.689Z" transform="translate(-36.561 -66.625)"/><path class="j" d="M110.424,111.86a1.187,1.187,0,0,1,.035-.18l-.439.246Z" transform="translate(-61.726 -62.675)"/><path class="j" d="M68,117.68l-3.073.2a.188.188,0,0,0,.035.132l2.507.5Z" transform="translate(-36.432 -66.041)"/><path class="j" d="M110.285,110.884a3.317,3.317,0,0,1,.048-.364l-.663.724Z" transform="translate(-61.53 -62.025)"/><path class="j" d="M110.23,112.575a.9.9,0,0,1,.048-.215l-.479.079Z" transform="translate(-61.603 -63.057)"/><path class="j" d="M102.79,120.86l3.67-2.959a1.685,1.685,0,0,1-.439-.32l-3.139,3.179Z" transform="translate(-57.67 -65.985)"/><path class="j" d="M107.689,118.722c-.2-.1-.382-.189-.536-.272l-3.323,2.678Z" transform="translate(-58.254 -66.473)"/><path class="j" d="M107.027,116.914a.672.672,0,0,1-.11-.364l-2.217,2.709Z" transform="translate(-58.742 -65.407)"/><path class="j" d="M110.593,113.1h0l-.083-.026Z" transform="translate(-62.001 -63.455)"/><path class="j" d="M103.05,118.356l2.959-3.609a2.635,2.635,0,0,1,.171-.6c.053-.136.1-.272.145-.413l-.079-.057Z" transform="translate(-57.816 -63.797)"/><path class="j" d="M190.8,124.92l-1.778,3.714.83-.285Z" transform="translate(-153.085 -76.196)"/><path class="j" d="M107.878,106.33a4.448,4.448,0,0,1-.268.439l.5,1.339Z" transform="translate(-60.374 -59.674)"/><path class="j" d="M68.531,112.518l-2.081-.878c-.123.066-.2.132-.2.193a1.752,1.752,0,0,1-.088.285l1.19.931Z" transform="translate(-37.122 -62.653)"/><path class="j" d="M66.927,113.878,65.808,113c-.057.154-.127.334-.2.536l.558.7Z" transform="translate(-36.814 -63.416)"/><path class="j" d="M100.519,107.983l-.149-.4c-.36.391-.562.176-.5-.193L95,110.731Z" transform="translate(-53.3 -60.269)"/><path class="j" d="M69.79,111.846l-2.2-.786c-.184.075-.364.145-.5.211l2.081.856Z" transform="translate(-37.644 -62.328)"/><path class="j" d="M200.751,124.759l5.4-3.679h-.724l-4.7,3.683Z" transform="translate(-159.648 -74.042)"/><path class="j" d="M92.409,111.3l4.136-3.244a.832.832,0,0,0-.088-.079l-4.346,2.955Z" transform="translate(-51.679 -60.6)"/><path class="j" d="M109.9,108.271l.575-1.15a.8.8,0,0,0-.031-.272h0l-.321-.119Z" transform="translate(-61.659 -59.899)"/><path class="j" d="M107.663,119.456a1.073,1.073,0,0,0-.325-.246l-4.338,2.7Z" transform="translate(-57.788 -66.899)"/><path class="j" d="M65.821,115.209l-.5-.619c-.053.149-.1.307-.145.47l.241.334Z" transform="translate(-36.572 -64.308)"/><path class="j" d="M68.718,113.586l.7-1.106L64.9,114.614a1.026,1.026,0,0,0,0,.114Z" transform="translate(-36.413 -63.124)"/><path class="j" d="M65.016,115.93a3.586,3.586,0,0,0-.066.356l.237-.11Z" transform="translate(-36.443 -65.059)"/><path class="j" d="M206.3,146.225l.839-1.128-.061-1Z" transform="translate(-162.779 -86.956)"/><path class="j" d="M201.531,129.344l5.194.312.448-.786-5.7.457Z" transform="translate(-160.069 -78.412)"/><path class="j" d="M202.06,126.3l.149-.031,5.782-1.844-.136-.369-5.751,2.222Z" transform="translate(-160.4 -75.714)"/><path class="j" d="M204.736,134.662l.439-.768-3.455-2.744Z" transform="translate(-160.209 -79.691)"/><path class="j" d="M207.928,127.49l.492-.86-5.729,1.286Z" transform="translate(-160.753 -77.156)"/><path class="j" d="M201.13,130.86l2.928,4.254v-.009l.32-.553-.048.035Z" transform="translate(-159.878 -79.528)"/><path class="j" d="M96.872,137.43l-.672.847a1.038,1.038,0,0,1,.5.25l.149-.149Z" transform="translate(-53.974 -77.12)"/><path class="j" d="M205.76,149.5l.022.009,1.163-.018-.044-.694-1.141.7Z" transform="translate(-162.476 -89.592)"/><path class="j" d="M205.11,144.691l.066.149,1.041-3.776-.768-.075Z" transform="translate(-162.111 -85.211)"/><path class="j" d="M206.857,141.94l-.847,3.086.887-2.419Z" transform="translate(-162.616 -85.744)"/><path class="j" d="M207.019,131.347l.448-.79-4.557-.277Z" transform="translate(-160.877 -79.203)"/><path class="j" d="M205.21,149.934v0Z" transform="translate(-162.167 -90.226)"/><path class="j" d="M199.473,143.962l-2.687-3.907-1.106-.114Z" transform="translate(-156.821 -84.622)"/><path class="j" d="M213.292,137.51l-.992.518,2.538,1.848Z" transform="translate(-166.144 -83.259)"/><path class="j" d="M198.53,140.23l2.757,4.008-1.62-3.89Z" transform="translate(-158.42 -84.785)"/><path class="j" d="M204.414,140.837l-.944-.1.645,3.416Z" transform="translate(-161.191 -85.071)"/><path class="j" d="M206.971,147.529l-.044-.76-.992,1.326-.035.1Z" transform="translate(-162.554 -88.453)"/><path class="j" d="M200.89,130.16l3.877,3.082.54-.948-4.325-2.125Z" transform="translate(-159.744 -79.136)"/><path class="j" d="M202.2,140.609l-.786-.079,1.409,3.38Z" transform="translate(-160.035 -84.953)"/><path class="j" d="M206.34,150.653l.966.456-.026-.47Z" transform="translate(-162.801 -90.624)"/><path class="j" d="M208.78,141.8l1.374,3.332.549-.461-1.888-2.845Z" transform="translate(-164.17 -85.665)"/><path class="j" d="M209.043,141.409l3.727,1.427.347-.29L209.03,141.4Z" transform="translate(-164.31 -85.441)"/><path class="j" d="M209.155,139.89l-.685.36,4.145,1.163Z" transform="translate(-163.996 -84.594)"/><path class="j" d="M95.49,138.542h.075l.391-.492Z" transform="translate(-53.575 -77.468)"/><path class="j" d="M193.559,136.684l4.974-.667-.733-1.067-4.32,1.73Z" transform="translate(-155.587 -81.823)"/><path class="j" d="M200.082,138.454l-.571-.834-4.421.593Z" transform="translate(-156.49 -83.321)"/><path class="j" d="M211.807,143.912l.457-.386-3.1-1.756Z" transform="translate(-164.383 -85.649)"/><path class="j" d="M211.211,144.938l.716-.6-2.4-1.936Z" transform="translate(-164.59 -86.002)"/><path class="j" d="M213.138,143.723l-.018.031.413-.347-2.963-1.137Z" transform="translate(-165.174 -85.929)"/><path class="j" d="M192.86,135.59l4.526-1.809-.514-.751-4.013,2.56Z" transform="translate(-155.239 -80.746)"/><path class="j" d="M216.479,139.268h0l.009-.066-.68-3.042-1.023.54,1.69,2.586Z" transform="translate(-167.536 -82.502)"/><path class="j" d="M208.746,146.648l.47-.4-.716-3.613Z" transform="translate(-164.013 -86.137)"/><path class="j" d="M209.418,145.929l.588-.492-1.326-3.227Z" transform="translate(-164.114 -85.895)"/><path class="j" d="M97.43,140.088c0,.035.031.061.105.088V140Z" transform="translate(-54.664 -78.562)"/><path class="j" d="M94.94,138.63h.114l.281-.29Z" transform="translate(-53.267 -77.631)"/><path class="j" d="M209.971,125.535l-.145-.4-4.566,1.453Z" transform="translate(-162.195 -76.32)"/><path class="j" d="M193.43,139.173l6.05.619-.246-.36-5.694-.272Z" transform="translate(-155.559 -84.185)"/><path class="j" d="M211.08,138.83l-.76.4,3.306,1.453Z" transform="translate(-165.034 -83.999)"/><path class="j" d="M98.221,136.92h0L98.19,138.5a1.879,1.879,0,0,0,1.054-.114l.211-.878Z" transform="translate(-55.09 -76.834)"/><path class="j" d="M215.966,119.995l-.386-.145.307,2.415.018.04Z" transform="translate(-167.984 -73.352)"/><path class="j" d="M209.3,123.287l-.158-.417-4.434,2.191Z" transform="translate(-161.887 -75.046)"/><path class="j" d="M196.986,132.124l-.373-.544-3.433,2.972Z" transform="translate(-155.419 -79.932)"/><path class="j" d="M216.634,122.282l.272-1.905-.259-.1-.057,2.094Z" transform="translate(-168.551 -73.593)"/><path class="j" d="M189.66,132.817l.233.435,3.288-2.151Z" transform="translate(-153.444 -79.663)"/><path class="j" d="M212.1,126.7l-3.275,5.738,3.705-5.426Z" transform="translate(-164.192 -77.195)"/><path class="j" d="M205.943,132.276l.47-.817L201.93,130.3Z" transform="translate(-160.327 -79.214)"/><path class="j" d="M189.06,132.468l.206.382,3.1-1.51Z" transform="translate(-153.107 -79.798)"/><path class="a" d="M82.225,107.131l.035-.07-.65-.356a1.225,1.225,0,0,1-.724-.075.8.8,0,0,1-.211-.246l-1.537-.5-.228.04.878.413Z" transform="translate(-44.274 -59.422)"/><path class="a" d="M73.826,108.644l.083-.061.057-.189-.066.079-.088-.07.242-.29.584-1.888v-.075l-.206.035-.742,2.4-.439-.531-.066.105-.1-.061.083-.132-.347-.408-.066.061-.075-.083.066-.061-.492-.575c-.066.04-.127.083-.189.127l1.264,1.475Z" transform="translate(-40.437 -59.573)"/><path class="a" d="M193.38,121.99l.04.022-.013-.013Z" transform="translate(-155.531 -74.553)"/><path class="a" d="M185.67,119.95l0,0h0Z" transform="translate(-151.206 -73.408)"/><path class="a" d="M185.986,120.1l-.066-.031.018.013Z" transform="translate(-151.346 -73.476)"/><path class="a" d="M109.13,104.4l.584-.149C109.587,104.066,109.4,104.036,109.13,104.4Z" transform="translate(-61.227 -58.433)"/><path class="a" d="M87.518,107.162l-.079.031h0l-.176.044h0l-.075.04h0l-.048.053.1.123,5.106-.935-.075-.04a1.174,1.174,0,0,0-.259-.127l-4.412.781Z" transform="translate(-48.891 -59.685)"/><path class="a" d="M107.458,107.97l.048.1-.088.044.158.439.123-.048.044.105-.127.048.136.369.123-.039.035.105-.119.04.149.4h.066l.04-.04h-.031l.039-.083h-.079l-.083-.637-.5-1.339a2.547,2.547,0,0,1-.167.211l.149.4Z" transform="translate(-60.161 -60.291)"/><path class="a" d="M109.367,112.645h0l.022-.075h-.031l-.083.048v-.04l-.031.031-.044.083.439.312.035-.057.092.066-.035.057.079.057.053-.184-.479-.255Z" transform="translate(-61.266 -63.175)"/><path class="a" d="M216.28,125.35l.013.1,0-.057Z" transform="translate(-168.377 -76.438)"/><path class="a" d="M108.826,105.851h.114v.053l.259.1v-.057h.11v.083l.32.119a2.007,2.007,0,0,0-.044-.259l-1.045-.391c-.035.057-.066.123-.1.189h0Z" transform="translate(-60.84 -59.209)"/><path class="a" d="M94.278,136.7l.277-.088v.053l.184-.088h0l.061-.079-.044-.035L92.5,136.7a2.352,2.352,0,0,1,.1.215l1.185-.119Z" transform="translate(-51.898 -76.576)"/><path class="a" d="M216.57,125.654v0Z" transform="translate(-168.54 -76.606)"/><path class="a" d="M69.559,111.085v-.048h.114l.105-.035v.035h.04L69.792,111l.035-.026-.527-.141-1.668-.439.04.083-.1.048-.083-.171-.259-.066c-.1.048-.2.1-.316.149l2.41.645-.593.277h.035l-.039.105-.14-.048-.6.281.048.022-.039.1-.145-.057-1.181.553h.026l-.07.092-.07-.057-.76.36.057.083-.088.07-.066-.083-.4.184.075.11-.092.066-.088-.123-.237.11a1.762,1.762,0,0,0,0,.263l4.518-2.125Z" transform="translate(-36.443 -61.896)"/><path class="a" d="M104.607,110.743h-.11v-.026h0l-.048.1-.07-.035-.04.04.048.215-.228.053-.492.878h.088v.114h-.171l-.439.786h.088v.114h-.14l-.439.79h0l-.031.11h-.048l-.465.817h.04l-.053.1h-.044l-.54.948.061.048-.07.088-.048-.039-.439.768h0l-.04.035-.316.553h0l.079.114.026-.1h.044l-.057-.105.277-.145.022-.031h0l.04-.066,3.28-5.738.044-.083.031-.031-.035-.057.193-.114.663-.724a1.634,1.634,0,0,1,.026-.36l-.654.716Z" transform="translate(-56.476 -61.598)"/><path class="a" d="M205.4,150.8h0Z" transform="translate(-162.274 -90.714)"/><path class="a" d="M205.561,144.589l.847-3.086-.022-.329-.114-.013-1.041,3.776.022.057-.044.018v0l.022.031,0,0,.066.053.154-.211Z" transform="translate(-162.167 -85.306)"/><path class="a" d="M192.785,130.6l-.07-.14-.961.329v.022l-.11.013h0l-.843.285-.009.092-.114-.009,0-.044-.773.263-.048.176-.11-.026.031-.105-.83.285-.053.105.07.127,3.31-1.128Z" transform="translate(-153.018 -79.304)"/><path class="a" d="M201.1,129.51l-.141.07-.013-.026-.066.039.237-.018Z" transform="translate(-159.738 -78.771)"/><path class="a" d="M200.405,129.64l0-.057.162-.013-.053-.083.044-.026-.031,0-.154.123.035.053Z" transform="translate(-159.452 -78.743)"/><path class="a" d="M201.5,127.608l.523-.04,5.729-1.286.228-.053-.048-.215v0l-.07.013-4.711,1.058Z" transform="translate(-160.086 -76.808)"/><path class="a" d="M74.942,119.949l.026.066.053-.04v-.026h.048v-.07l-.04-.048L70.2,121.305a3.53,3.53,0,0,0,.413.11l3.512-1.08Z" transform="translate(-39.388 -67.247)"/><path class="a" d="M197.83,130.049l.066.127.544-.268.009.018.044-.04.04.04.092-.1-.031-.035Z" transform="translate(-158.027 -78.928)"/><path class="a" d="M201.959,129.131l-.079.04.228-.07Z" transform="translate(-160.299 -78.541)"/><path class="a" d="M78.126,107.152h0l.088.07-.07.083.123.5h0l.066.092-.048.031.1.4h.07l.031.11h-.075l.246,1.005.149.07-.053.105-.061-.035.237.988.215.219-.083.079-.075-.083.211.878c.11.149.224.29.325.439l.035.066.053-.105,1.756-3.714.263-.94.105.031-.035-.048.066-.057-.127-.07-.035.07-.136.281.066.031-.044.105-.044-.083-.193.4.075.048-.061.092-.061-.04-.2.487.053.048-.075.083-.031-.026-.334.7.035.044-.083.061-.373.777.048.1-.119.031h0l-.321.667.057.167-.11.04V111.3l-.263.5-1.041-4.245L77.99,106.2h.048l-.061-.035h-.1v.075Z" transform="translate(-43.697 -59.579)"/><path class="a" d="M188.593,134.18l.009-.018-.013-.022-.009,0Z" transform="translate(-152.838 -81.368)"/><path class="a" d="M193.744,123.26l-.044.149.035-.07Z" transform="translate(-155.71 -75.265)"/><path class="a" d="M193.886,122.938l0-.009.039-.022,0,0-.044-.053-.022.083Z" transform="translate(-155.8 -75.035)"/><path class="a" d="M81.251,119.927h0l-.031-.057h0v.07Z" transform="translate(-45.57 -67.27)"/><path class="a" d="M86.569,107.792l-.061.026v.035h-.057l-.031.026.127.066-.039-.031.127-.136.026-.149h-.136v.039Z" transform="translate(-48.487 -60.403)"/><path class="a" d="M86.61,106.809l.04.031.154.088h0l.048-.053-.048-.1.118-.066.465-.413.61-.65-.386.083-.465.509c0,.123-.053.237-.259.277l-.149.162Z" transform="translate(-48.594 -59.293)"/><path class="a" d="M89.053,110.458l-.031.022-.061-.092h0l-.439-.558-.105.053-.053-.1.083-.044-.391-.479-.114.044-.04-.105.079-.031-.338-.413-.184.057-.035-.11.145-.044-.628-.768-.1-.123h0l-.053.1-.061-.035-.066.057.035.048h0l.044.053h0l.07-.035.119.237,2.265,2.783.031.035.136-.145.127.114.048-.035h0l.154-.123,4.7-3.688h-.2c-.149.14-.338.145-.483.386-.1.167-.145.123-.228.039L89.347,110.8Z" transform="translate(-48.622 -60.123)"/><path class="a" d="M69.1,116.723l.035-.035.162-.211,2.634-4.166a1.311,1.311,0,0,1-.132-.211l-.114.176-.707,1.1.031.1-.114.031-.575.918h.162v.11h-.246l-.522.83.11.022v.11l-.154-.031-.654,1.045.132.088-.066.1-.127-.092-.031.048c.053.035.114.066.171.1v-.031Z" transform="translate(-38.67 -62.911)"/><path class="a" d="M84.786,119.85l.057-.061h0L88.294,116l-.053-.079.136-.092-.127-.114-.136.145-.092.1.04.04-.439.439-2.832,3.113a3.491,3.491,0,0,1-.07.347h.053Z" transform="translate(-47.534 -64.936)"/><path class="a" d="M193.393,134.128l.083-.075.145.154,1.106.114-.022-.031.092-.066.075.11,1.137.118-.07-.176.105-.044.092.233.786.079-.026-.14.114-.022.031.176.944.1.013-.127.114.009-.013.132.768.075.114.013-.009-.149h.044l0-.018-.079-.114-2.928-4.254-.211-.246-.053-.044.009-.009-.088-.1.044-.035-.035-.053-.009-.013-.053.035-.136.092.057.079.356.518.092-.083.075.088-.105.088.373.544.11-.07.061.092-.105.07.514.751.057-.026.044.105-.035.013.733,1.067.132-.018.013.11-.07.013.571.834.14,0-.009.114-.048,0,.246.36-6.05-.619-.422.057-.009-.088-.145.092-.013-.018-.035.031.132.1,1.308.136Z" transform="translate(-154.762 -78.889)"/><path class="a" d="M78.753,116.5l-.061-.1.07-.044-.237-.439-.057.026-.048-.1.053-.026-.211-.382-.07-.127-.035-.066c-.1-.136-.215-.277-.325-.439-.821-1.067-1.818-2.375-2.116-2.81h-.075l-.031-.11h.04v-.035l-.105.035H75.43v.048a1.318,1.318,0,0,0,.132.211c.066.1.162.233.3.439l.048.04h0l.558.751.061-.053.07.088-.061.053.321.439h0l.066.092h0l.321.439.083-.044.053.1-.066.035.619.808.04.048h0l.031.057h0l.057.044v.031h0l.8,1.484h.255l-.316-.579Z" transform="translate(-42.322 -62.771)"/><path class="a" d="M84.718,125.15a.262.262,0,0,0,0,.057l.061-.053Z" transform="translate(-47.532 -70.232)"/><path class="a" d="M208.316,140.846l.066-.044.1.145.114.066,4.087,1.146.022-.018-.031-.013.07-.145-.25-.11-4.144-1.163-.1.053.061,0Z" transform="translate(-163.872 -85.054)"/><path class="a" d="M208.093,140.7l-.048-.092L208,140.59l-.026.1,0,.018Z" transform="translate(-163.715 -84.987)"/><path class="a" d="M101.976,138.627l-.127.022v-.026l-.079.053-.061-.1.075-.048h-.035v.044l-.158-.075v.105l.483.343.259-.092-.272-.193Z" transform="translate(-56.997 -77.721)"/><path class="a" d="M106,130.113l-.347.29h.048l-.04.105-.105-.04-.413.342-.04.075h-.026l-.439.386.07.057-.07.088-.088-.075-.716.6.044.061-.1.066-.035-.057-.549.439.044.11-.105.044-.031-.079-.588.492v.083h-.11l-.474.4v.083l.079.04-.026.053.048.026,4-3.341a1.407,1.407,0,0,1,.044-.228h0l-.061-.031Z" transform="translate(-57.188 -73.008)"/><path class="a" d="M207.914,140.833h-.044l.009.149.022.329.039.667,0-.009.105.04-.092.25.061,1,.048-.066.092.07-.127.171.044.76.07-.04.057.1-.119.075.044.694h.127l0,.11-.123,0,.026.47.233.11,0-.083-.246-4.008-.11-.553-.039-.013.022-.053-.1-.053.053-.1.118.066.009,0,0-.088-.062,0h0Z" transform="translate(-163.659 -85.116)"/><path class="a" d="M111.35,130.152h0v-.022Z" transform="translate(-62.472 -73.025)"/><path class="a" d="M112.11,127.781l.119-.075.294-.619a.624.624,0,0,0-.171-.167l-.035.079Z" transform="translate(-62.899 -71.225)"/><path class="a" d="M111.51,129.36h0l.026.04h0v-.04Z" transform="translate(-62.562 -72.593)"/><path class="a" d="M218.948,142.38l-.018.184.083-.325Z" transform="translate(-169.863 -85.912)"/><path class="a" d="M101.431,122.513l-.171.14-.057.083-.1-.061.031-.044-.277.145.057.105.048.1h0l.1-.053.685-.36h-.035l.048-.105.114.053.755-.4h0l.066-.092.048.031.988-.518h0l.092-.061v.031l1.023-.54v-.035h.11l.953-.5v-.14h.114v.07l.553-.29a.838.838,0,0,0-.123-.193l-4.658,2.406Z" transform="translate(-56.588 -67.27)"/><path class="a" d="M111.28,129.634h0v.022h0l-.07.145h.031l.061.031a2.27,2.27,0,0,1,.053-.242Z" transform="translate(-62.394 -72.722)"/><path class="a" d="M87.551,127.92l.075.088-.057.048.878.72.132-.07.053.1-.088.044,1.04.825.228-.053v.11l-.136.035.672.54.044.035h0l.044.035h.075l.061-.141.04.022v-.031l-.066-.053-.088.061h-.114v-.07l-.566-.6-4.922-3.951-.127-.1-.044.04-.035-.044a.688.688,0,0,0,.04.263l.562.439c.119.057.25.127.378.2l.031-.079.105.04-.035.1a5.651,5.651,0,0,1,.878.637l.044.031h0a.983.983,0,0,1,.3.439l.514.413Z" transform="translate(-47.494 -70.434)"/><path class="a" d="M205.75,150.409h.026l-.022-.009Z" transform="translate(-162.47 -90.49)"/><path class="a" d="M207.02,151.327l-.026-.013.048-.1.026.013.027-.061-.083-.035-.233-.11-.966-.457-.316,0v-.088l-.075.048-.013-.022,0,0h0l0,.11h0l1.225.58.031-.127.219.048-.04.176.158.075Z" transform="translate(-162.274 -90.535)"/><path class="a" d="M205.15,150.265l.066-.084-.04-.022-.066.141h.088Z" transform="translate(-162.111 -90.355)"/><path class="a" d="M97.958,136.741v-.11l-.044-.031H97.8l.136.105-.211.263v.948l.079-.075.079.083-.158.154v.193H97.8l.149.031.031-1.581Z" transform="translate(-54.832 -76.655)"/><path class="a" d="M100.947,138.279v-.105l.04-.176-.22-.048-.026.127-.211.878.259-.105Z" transform="translate(-56.403 -77.412)"/><path class="a" d="M96.774,136.65l-.136-.105-.044-.035h0l-.061.079.048.1-.1.044h0l-.048.048.04.061-.285.189-.145.145-.391.492.237.066.672-.847Z" transform="translate(-53.665 -76.604)"/><path class="a" d="M185.319,120.133l.053-.026-.044-.026-.048.013.461,1.357,1.278,3.749.018.057.105-.04-.057-.167-1.458-4.285Z" transform="translate(-150.987 -73.481)"/><path class="a" d="M78.5,106.018h.026l.066.066.066.031,3.117,1.449.07.035.044-.105-.066-.031-2.292-1.08-.878-.413L78.46,106h0Z" transform="translate(-44.022 -59.472)"/><path class="a" d="M186.515,120.616l2.428,1.523.062.039.061-.1-.075-.044-2.942-1.848Z" transform="translate(-151.419 -73.543)"/><path class="a" d="M78.26,106.2h.031l.066-.048h0l-.167.031.061.035Z" transform="translate(-43.871 -59.573)"/><path class="a" d="M185.453,120.11l-.031.013-.053.026.307.632,1.778,3.618.013.018.1-.048-.048-.1-2.011-4.083Z" transform="translate(-151.037 -73.498)"/><path class="a" d="M185.556,120l.07-.079,0,0-.026.018h0l-.066.048.013.018.057.079,2.375,3.31,0-.009.088-.061-.035-.044-2.1-2.924Z" transform="translate(-151.127 -73.391)"/><path class="a" d="M185.792,120.039l-.04-.04-.018-.013-.07-.066,0,0-.07.079.378.351,2.432,2.226.031.026.075-.083-.053-.048-2.2-2.011Z" transform="translate(-151.161 -73.391)"/><path class="a" d="M81.29,105.68l.483.268A.733.733,0,0,0,81.29,105.68Z" transform="translate(-45.61 -59.31)"/><path class="a" d="M85.871,108.2l.061.035.053-.1h0l-.154-.088-.127-.066h0l-.031-.031h-.035l-.312-.171H85.12l.65.356Z" transform="translate(-47.758 -60.488)"/><path class="a" d="M193.687,121.96l-.039.018h0l-.018.013.057,0Z" transform="translate(-155.671 -74.536)"/><path class="a" d="M86.622,107.66H86.6v.04Z" transform="translate(-48.588 -60.42)"/><path class="a" d="M86.359,107.758l-.039-.088h0v.04Z" transform="translate(-48.431 -60.426)"/><path class="a" d="M86.382,107.775l.075.083-.026.026h.044l.061-.026-.053-.119v-.04H86.36Z" transform="translate(-48.454 -60.443)"/><path class="a" d="M86.056,107.913l.031.031h0l.031-.026h0l.026-.026-.075-.083-.044-.048-.035-.039h-.14l.171.193Z" transform="translate(-48.168 -60.454)"/><path class="a" d="M87.35,106.569l.4-.206-.053-.07.72-.514.439-.369-.237.061-.777.685Z" transform="translate(-49.009 -59.158)"/><path class="a" d="M88,106.8l.105-.031,3.806-1-.2-.066-2.836.742Z" transform="translate(-49.374 -59.321)"/><path class="a" d="M194.7,122.068l-.018-.048-.158.083,0,.009Z" transform="translate(-156.17 -74.57)"/><path class="a" d="M194.88,120.242l.018.048,0,.009.079-.031.9-.356,2.538-1-.145-.066-2.985,1.177Z" transform="translate(-156.372 -72.791)"/><path class="a" d="M194.751,119.7l-.013-.022-.4.206-.123.066.053.1,0,0,.075-.044.158-.083.413-.215,2.568-1.365-.132-.057-2.441,1.3Z" transform="translate(-156.002 -72.477)"/><path class="a" d="M88.13,105.95l.053.07h0l.167-.119,1.545-1.1a2.762,2.762,0,0,0-.277.057l-.781.558Z" transform="translate(-49.447 -58.816)"/><path class="a" d="M108.549,108.58h.079l.026-.048h0v-.1l-.312-2.415h0l-.039.075-.053.1.228,1.787Z" transform="translate(-60.733 -59.5)"/><path class="a" d="M109.79,109.081l.637-1.278a1.9,1.9,0,0,0,0-.224l-.575,1.15Z" transform="translate(-61.597 -60.375)"/><path class="a" d="M216.623,124.84l-.044.092-.009.268v0Z" transform="translate(-168.54 -76.151)"/><path class="a" d="M216.309,125.678h-.083v-.088l-.022.048-.044.083.035.018.07.035Z" transform="translate(-168.31 -76.572)"/><path class="a" d="M216.31,122.62h.106l.009-.044v-.013l.009-.268.057-2.094v-.057l-.11,0,0,.018-.061,2.309,0,.057v.1Z" transform="translate(-168.394 -73.515)"/><path class="a" d="M216.553,122.688v.018l-.009.044,0,.026.114.018.044-.3.018-.127.048-.351.224-1.55.009-.083-.11-.013-.009.057-.272,1.905Z" transform="translate(-168.523 -73.644)"/><path class="a" d="M109.878,105.3l-.821-.492-.057.083.909.544Z" transform="translate(-61.154 -58.822)"/><path class="a" d="M109.23,111.824l.035.057v.04l.083-.048v-.092l.246-.04.439-.246v-.145l-.615.36Z" transform="translate(-61.283 -62.49)"/><path class="a" d="M109.5,112.179v.092h.031v-.035l.07.022.479-.079v-.119l-.386.066Z" transform="translate(-61.435 -62.889)"/><path class="a" d="M109.612,112.49v.035l-.022.075h0l.035-.07.378.2.083.026a.794.794,0,0,1,.031-.11l-.439-.136Z" transform="translate(-61.485 -63.13)"/><path class="a" d="M109.615,112.58l-.035.07v.031l.479.255a.547.547,0,0,1,.031-.114l-.079-.04Z" transform="translate(-61.479 -63.18)"/><path class="a" d="M208.817,132.75l-.009-.013.105-.066.048-.04-.026-.022.1-.114-.026-.026.25-.25.114-.141,3.192-4.676.039-.057-.092-.066-.039.057-3.705,5.426-.044.066Z" transform="translate(-164.136 -77.52)"/><path class="a" d="M208.662,140.106l.057-.083-.031.026-.066-.079L208.6,140l-.026.044Z" transform="translate(-164.052 -84.639)"/><path class="a" d="M102.16,122.092l.382-.237,4.324-2.7h-.031l-.083-.039-3.859,2.406Z" transform="translate(-57.317 -66.849)"/><path class="a" d="M208.929,139.639l.1-.079-.105.066Z" transform="translate(-164.248 -84.409)"/><path class="a" d="M101.879,121.531l-.061-.053-.044.039-.1.079-.092.079h0l.066.079.035-.026.171-.141.733-.588,3.323-2.678-.11-.061-3.67,2.959Z" transform="translate(-56.992 -66.367)"/><path class="a" d="M209.236,139.044l.061.053.233-.285.083-.1-.255.25-.053-.053-.1.114Z" transform="translate(-164.411 -83.932)"/><path class="a" d="M102.79,119.859l.843-.847,2.217-2.709a1.019,1.019,0,0,1,0-.193l-2.959,3.609Z" transform="translate(-57.67 -65.16)"/><path class="a" d="M102.47,120.544l-.25.25h.026l.057.057.25-.255,3.157-3.179a.438.438,0,0,1-.07-.088l-2.327,2.344Z" transform="translate(-57.351 -65.845)"/><path class="a" d="M200.444,129.146l.044-.039.061.075v-.026l.11.009.018-.035.048.026.009-.031.158.04,5.7-.457.167-.013-.009-.114-.088,0-5.238.426-.523.04-.031.009,0,0-.237.018-.022.018-.009-.013-.163.013Z" transform="translate(-159.491 -78.249)"/><path class="a" d="M200.65,130.3l.211.246,3.2,3.727.048-.035.039-.035-.013-.018-3.016-3.512Z" transform="translate(-159.609 -79.214)"/><path class="a" d="M200.5,129.877v-.022l-.061-.075-.044.039h0l-.044.035.088.1Z" transform="translate(-159.441 -78.923)"/><path class="a" d="M200.6,130.066l0-.066-.061.079-.009.009.053.044.47.373,3.455,2.744.048.039.07-.088-.061-.048-3.877-3.082Z" transform="translate(-159.542 -79.046)"/><path class="a" d="M202.181,130.095l4.557.277.145.009.009-.114-.088,0-5.194-.312Z" transform="translate(-160.148 -79.018)"/><path class="a" d="M200.684,129.938l0,.066.092,0,.092.009-.105-.053.035-.066-.11-.009v.048Z" transform="translate(-159.626 -78.984)"/><path class="a" d="M201.318,129.877l-.061-.018-.158-.039-.009.031.369.18,4.483,1.159.048.013.031-.11-.022,0-4.109-1.067Z" transform="translate(-159.856 -78.945)"/><path class="a" d="M200.961,129.856l-.048-.026-.018.035-.035.066.105.053,4.324,2.125.044.022.048-.1-.04-.017-4.013-1.976Z" transform="translate(-159.727 -78.951)"/><path class="a" d="M93.54,110.922l.057.083h0l.061-.039-.035-.075.316-.158h0l.176-.066.066-.026,4.873-3.323a.138.138,0,0,1,.022-.088h-.1l-5.4,3.683Z" transform="translate(-52.482 -60.179)"/><path class="a" d="M203.223,124.876l4.434-2.191.083-.044-.048-.1-.075.04-5.519,2.726-.039.022Z" transform="translate(-160.4 -74.861)"/><path class="a" d="M201.133,129.269l-.013-.035.233-.075.079-.039.044-.022-.18.07-.035-.088-.32.158.04.075.013.026Z" transform="translate(-159.772 -78.53)"/><path class="a" d="M201.7,126.155l.18-.07,5.751-2.221.123-.048-.039-.105-.123.048L203,125.532l-1.163.452-.176.066,0,.018Z" transform="translate(-160.176 -75.518)"/><path class="a" d="M201.583,126.764l-.233.075.013.035.018.066,0,0,.031-.009,1.651-.527,4.566-1.453.118-.039-.035-.105-.123.04-5.782,1.844Z" transform="translate(-160.002 -76.135)"/><path class="a" d="M88.41,108.667l.035.11.184-.057,4.948-1.559-.167-.061-4.856,1.523Z" transform="translate(-49.604 -60.106)"/><path class="a" d="M91.9,110.791l.061.092.031-.022,4.342-2.946a.573.573,0,0,0-.1-.066h0l-4.289,2.924Z" transform="translate(-51.561 -60.527)"/><path class="a" d="M89.5,109.332l.04.105.114-.044,4.9-1.936-.158-.057L89.6,109.3Z" transform="translate(-50.215 -60.274)"/><path class="a" d="M90.55,110.011l.053.1.105-.053,4.614-2.437-.14-.053-4.548,2.384Z" transform="translate(-50.804 -60.37)"/><path class="a" d="M70.711,110.268l.1-.048-.039-.083-.14-.277a.842.842,0,0,1-.092.07l.088.167Z" transform="translate(-39.579 -61.654)"/><path class="a" d="M70.6,111.872l.04-.105H70.6l-2.164-.777-.158.061,2.2.786Z" transform="translate(-38.311 -62.288)"/><path class="a" d="M69.046,112.519l.04-.1-.048-.022-2.081-.856-.136.066,2.081.878Z" transform="translate(-37.492 -62.597)"/><path class="a" d="M67.25,113.843l.07-.092h-.026l-1.19-.931-.044.11,1.12.878Z" transform="translate(-37.066 -63.315)"/><path class="a" d="M66.078,115.091l.092-.062-.048-.061-.558-.7a.487.487,0,0,1-.044.127l.492.632Z" transform="translate(-36.763 -64.128)"/><path class="a" d="M65.359,116.119l.092-.066-.075-.11-.242-.334a.6.6,0,0,1-.035.141l.171.246Z" transform="translate(-36.528 -64.88)"/><path class="a" d="M68.748,115.11l-.031-.11h0l-3.82,1.141a1,1,0,0,0,0,.119l3.732-1.12Z" transform="translate(-36.413 -64.538)"/><path class="a" d="M67.9,121.484l.066-.1-.132-.088-.988-.689a4.744,4.744,0,0,0,.32.36l.606.439Z" transform="translate(-37.509 -67.685)"/><path class="a" d="M68.247,117.5v-.11h-.162l-3.157.206a.951.951,0,0,0,0,.11l3.073-.2Z" transform="translate(-36.43 -65.879)"/><path class="a" d="M67.608,119.062v-.11l-.11-.022-2.5-.5a.808.808,0,0,0,.057.127l2.384.474Z" transform="translate(-36.471 -66.462)"/><path class="a" d="M176.712,131.131l-.163.215.413-.356,2.718-3.547.009-.013-.053-.044-.035-.026Z" transform="translate(-146.09 -77.565)"/><path class="a" d="M69.33,122.65v.031h.039Z" transform="translate(-38.9 -68.829)"/><path class="a" d="M74.141,117.691l-.053-.1-.083.044-4,2.046-.356.237.075.031,4.351-2.222Z" transform="translate(-39.08 -65.991)"/><path class="a" d="M73.55,116.622h0l-.066-.092h0l-3.732,2.494-.312.263-.031-.035h0l.123.053.356-.237Z" transform="translate(-38.945 -65.396)"/><path class="a" d="M176.5,132.345l-.04.031.009.009.035.04.031.035.312-.263,3.411-2.915.061-.053-.075-.088-.057.053-3.275,2.8Z" transform="translate(-146.039 -78.564)"/><path class="a" d="M74.31,108.144l.1.061.066-.105,1.194-1.87-.149.031-1.124,1.756Z" transform="translate(-41.694 -59.618)"/><path class="a" d="M73.39,107.655l.075.083.066-.061,1.449-1.317-.211.04-1.317,1.216Z" transform="translate(-41.178 -59.691)"/><path class="a" d="M73.6,106.722H73.57l1.177-.312A5.491,5.491,0,0,0,73.6,106.722Z" transform="translate(-41.279 -59.719)"/><path class="a" d="M183.49,125.3l.114.053,1.115-.338.075-.022-.035-.11-.07.022-1.128.342Z" transform="translate(-149.983 -76.174)"/><path class="a" d="M183.124,125.933l.009-.009-.026-.013.009-.022-.026-.04-.035.009-.044.013.035.11.075-.022.022-.009Z" transform="translate(-149.713 -76.718)"/><path class="a" d="M183.222,124.617l.066.035.07-.053,1.032-.746.044-.031-.066-.092-.009,0-1.106.8-.088.061-.035.026.026.035.026.04Z" transform="translate(-149.781 -75.529)"/><path class="a" d="M184.34,122.33l-.083-.07-.018.018-.808.966-.241.29.088.075.066-.083.931-1.111Z" transform="translate(-149.814 -74.704)"/><path class="a" d="M183.344,125.785l-.066-.035-.039.083-.009.022.026.013.075-.07.189.2,1.33.65.066.035.048-.105-.149-.07-1.357-.667Z" transform="translate(-149.837 -76.662)"/><path class="a" d="M183.353,125.86l-.075.07-.009.009.018.018,1.879,1.954.079.083.083-.079-.215-.224-1.572-1.633Z" transform="translate(-149.859 -76.724)"/><path class="a" d="M190.84,127.254l.11.026L191,127.1l1.1-3.965.044-.149.009-.1h.018l.022-.083h0l-.11-.031-.259.94-.948,3.429Z" transform="translate(-154.106 -74.996)"/><path class="a" d="M193.91,122.963l0,.009.066,0v.031l.07-.009.048.351,1.427,2.876.07.14.1-.048-.066-.127-1.5-3.042-.119-.237-.057.026,0,0Z" transform="translate(-155.828 -75.069)"/><path class="a" d="M193.4,123.084l.044,0v-.031l-.066,0-.026,0h-.018l-.009.1-.009.079-.36,3.771,0,.044.114.009.009-.092.351-3.692Z" transform="translate(-155.29 -75.142)"/><path class="a" d="M194.084,123.11l-.07.009-.044,0,.026.171.492,3.407h0l.11-.013v-.022l-.465-3.2Z" transform="translate(-155.862 -75.181)"/><path class="a" d="M193.178,130.328l-.1.048-.5.246-3.1,1.51-.048.026.048.1.057-.026,3.521-1.717.531-.347.022.031.132-.123-.009-.018Z" transform="translate(-153.309 -79.08)"/><path class="a" d="M87.675,116.209l-.04-.04-.035-.04-.048.04-.132.123.04.061-.382.255L84,119.44h.162l3.073-2.814Z" transform="translate(-47.13 -65.172)"/><path class="a" d="M193.389,130.657l-3.288,2.151-.07.044.066.1.061-.039,3.438-2.252.386-.255-.04-.061-.022-.031Z" transform="translate(-153.651 -79.22)"/><path class="a" d="M79.822,120.57l-.176.123-.746.944h.149l.764-.966Z" transform="translate(-44.269 -67.662)"/><path class="a" d="M188.388,133.873l-.018.022.053-.013-.013-.013-.009-.009Z" transform="translate(-152.72 -81.211)"/><path class="a" d="M188.545,133.995l.022-.031-.057-.044.018.048Z" transform="translate(-152.799 -81.245)"/><path class="a" d="M188.169,134.093l.062.009-.018-.061-.053.04Z" transform="translate(-152.603 -81.312)"/><path class="a" d="M78.616,120.447v-.1l-.171.075-1.695,1.19.237-.026,1.444-1.019Z" transform="translate(-43.063 -67.539)"/><path class="a" d="M188.55,134.03l.013.053.009,0,0,0-.009-.018Z" transform="translate(-152.821 -81.307)"/><path class="a" d="M76.512,120.21v-.031h0V120.1l-.8.347L73,121.615h.285l3.073-1.317Z" transform="translate(-40.959 -67.399)"/><path class="a" d="M81.305,120.141v-.1H81.2v.026l.022.061h.044v.11l.439,1.37h.119l-.474-1.466Z" transform="translate(-45.559 -67.365)"/><path class="a" d="M80.983,120.31h-.11v.224l-.123.957h.11l.114-1.1Z" transform="translate(-45.307 -67.517)"/><path class="a" d="M192.309,134.543l.338-.215,3.433-2.972.105-.088-.075-.088-.092.083-3.789,3.275Z" transform="translate(-154.886 -79.708)"/><path class="a" d="M84.74,125.25l.044-.04.035-.031-.053-.079.07-.044V125l-.057.053h0l-.061.053a.572.572,0,0,0,0,.083Z" transform="translate(-47.532 -70.147)"/><path class="a" d="M192.635,138.94l-.075.048.088-.013Z" transform="translate(-155.071 -84.061)"/><path class="a" d="M193.68,139.053l5.694.272.048,0,.009-.114-.14,0-4.992-.241Z" transform="translate(-155.699 -84.078)"/><path class="a" d="M192.86,138.86Z" transform="translate(-155.239 -84.016)"/><path class="a" d="M193.407,138.89l-.057.022.136-.018Z" transform="translate(-155.514 -84.033)"/><path class="a" d="M192.179,138.83h-.035v.031l0,.048.119-.075Z" transform="translate(-154.835 -83.999)"/><path class="a" d="M192.186,135.5l0-.026.053,0,.075-.048,0-.009.061-.026h0l4.013-2.56.105-.07-.061-.092-.11.07-3.806,2.428-.338.215-.119.075-.07.044.048.079.013.018Z" transform="translate(-154.745 -80.538)"/><path class="a" d="M192.839,138.042l-.233.1-.026-.061-.088.013-.053,0,0,.026.009.088.421-.057.11-.013.619-.083,4.421-.593.07-.013-.013-.11-.132.018-4.974.667Z" transform="translate(-155.004 -83.164)"/><path class="a" d="M192.781,136.515l-.061.026,0,.009.013.035.026.061.233-.1.057-.022,4.32-1.73.035-.013-.044-.105-.057.026-4.526,1.809Z" transform="translate(-155.161 -81.671)"/><path class="a" d="M93.666,135.01v-.11l-.228.053-1.958.439.145.079,1.927-.439Z" transform="translate(-51.326 -75.701)"/><path class="a" d="M86.961,127.38l-.031.079.1.061.035-.1Z" transform="translate(-48.773 -71.483)"/><path class="a" d="M89.15,129.15l.04.04h0Z" transform="translate(-50.019 -72.476)"/><path class="a" d="M89.85,131.1l-.075-.088-.075.061L88.616,132a.765.765,0,0,0,0,.14l1.168-1Z" transform="translate(-49.717 -73.519)"/><path class="a" d="M91.271,132.871l-.053-.1-.132.07-1.756.909.1.075,1.73-.909Z" transform="translate(-50.12 -74.506)"/><path class="a" d="M205.01,144.494l0,.018.338-3.7.013-.132-.114-.009-.013.127-.3,3.319Z" transform="translate(-162.016 -85.032)"/><path class="a" d="M204.865,150.012l-.026.022-.044-.044,0,.07.11.013,0-.009h0Z" transform="translate(-161.931 -90.26)"/><path class="a" d="M199.462,144.178l-.281-.413-3.793-4.022-.145-.154-.083.075.057.061,3.609,3.828.566.6.044.044Z" transform="translate(-156.529 -84.426)"/><path class="a" d="M201.249,144.353h0l-.061.022-.079-.189H201.1l-.009-.048-.018-.04-2.757-4.008-.075-.11-.092.066.022.031,2.687,3.907.281.413.035.053h0l.088-.062,0,0Z" transform="translate(-158.207 -84.645)"/><path class="a" d="M202.567,143.613l-1.409-3.381-.092-.233-.105.044.07.176,1.62,3.89.017.039Z" transform="translate(-159.783 -84.656)"/><path class="a" d="M204.982,149.38l.009.057-.1.022.079.189.062-.022v0l.044-.018-.022-.057-.066-.149Z" transform="translate(-161.987 -89.918)"/><path class="a" d="M204.009,144.366l-.009-.057-.07-.378-.645-3.416-.031-.176-.114.022.026.14.623,3.3.1.536.009.048h.009Z" transform="translate(-161.006 -84.847)"/><path class="a" d="M113.575,121.237l.057-.228a1.014,1.014,0,0,0,0-.439l-.312,1.177A2.476,2.476,0,0,0,113.575,121.237Z" transform="translate(-63.577 -67.662)"/><path class="a" d="M111.78,127.771h0a.7.7,0,0,1,.145-.114l.206-.781v-.088l-.1-.057-.184.7Z" transform="translate(-62.714 -71.118)"/><path class="a" d="M213.7,141.372l.009,0,.009-.022-.044-.066-.009.013-.241-.176-3.306-1.453L210,139.62l-.044.105.031.013,3.46,1.523Z" transform="translate(-164.832 -84.443)"/><path class="a" d="M214.838,140.741l.009-.013-.149-.228-2.538-1.848-.044-.031-.066.092h0l2.546,1.853Z" transform="translate(-166.004 -83.882)"/><path class="a" d="M107.522,123.471v-.031l-.092.061h0l1.55,2.366.145.228.044.066h0l.057-.035v-.057l-.026-.039Z" transform="translate(-60.273 -69.272)"/><path class="a" d="M111.536,129.405a.088.088,0,0,1,0-.035h-.026Z" transform="translate(-62.562 -72.599)"/><path class="a" d="M110.06,122.128h-.11v.035l.676,3.043.039-.356-.219-.979a.193.193,0,0,1-.057-.255l-.338-1.506Z" transform="translate(-61.687 -68.526)"/><path class="a" d="M112.3,120.71h-.114v.14l-.167,1.594.123-.079.162-1.576Z" transform="translate(-62.848 -67.741)"/><path class="a" d="M111.51,127.74v.066h.048a.5.5,0,0,1,.075-.1h0v-.184l.092-.9-.083-.026h-.026l-.083.821Z" transform="translate(-62.562 -71.039)"/><path class="a" d="M208.86,141.86l1.888,2.845.035.057.1-.066-.044-.061-1.682-2.537Z" transform="translate(-164.215 -85.699)"/><path class="a" d="M208.551,141.065l-.1-.145-.066.044-.009,0Z" transform="translate(-163.945 -85.172)"/><path class="a" d="M208.56,141.61l.053.263,1.326,3.227.031.079.105-.04-.044-.114-1.374-3.332Z" transform="translate(-164.046 -85.559)"/><path class="a" d="M208.386,141.481l-.118-.092-.018-.009.11.553.716,3.613,0,.022.114-.022-.018-.083-.738-3.719Z" transform="translate(-163.872 -85.43)"/><path class="a" d="M209.723,141.793l2.963,1.137.11.044.039-.105-.048-.022-3.727-1.427Z" transform="translate(-164.327 -85.452)"/><path class="a" d="M208.182,141.274l.022-.031-.022-.013-.022.053.039.013.018.009Z" transform="translate(-163.822 -85.346)"/><path class="a" d="M209.123,141.49l-.663-.373-.013-.009-.114-.066-.171-.1-.119-.066-.053.1.1.053.022.013.048-.057.347.281,3.1,1.756.026.018.04-.07.017-.031Z" transform="translate(-163.727 -85.149)"/><path class="a" d="M208.28,141.13l-.048.057-.022.031.035.031.119.092.1.083.035.026.294.237,2.4,1.936.088.075.07-.088-.07-.057-2.647-2.142Z" transform="translate(-163.85 -85.29)"/><path class="a" d="M103.129,135.037l2.7-1.809c.053-.079.1-.154.14-.228l-3.42,2.292Z" transform="translate(-57.536 -74.635)"/><path class="a" d="M209.8,152.33l-.009,0h0Z" transform="translate(-164.736 -91.572)"/><path class="a" d="M209,152.5l.061.1.079-.053-.009-.048-.026.009-.022-.048-.009,0Z" transform="translate(-164.293 -91.64)"/><path class="a" d="M102.589,138.734h-.083l.342.167.145-.053-.237-.118Z" transform="translate(-57.491 -77.85)"/><path class="a" d="M209.03,152.251l.026.013.035.017.009,0-.022-.053.092-.04-.018-.009-.048-.022-.026-.013Z" transform="translate(-164.31 -91.472)"/><path class="a" d="M102.236,136.784l-.154.066-.092.039.026.053v.048h.022v-.035l.149-.026v-.044h.061l2.344-1.023.184-.2-2,.878Z" transform="translate(-57.222 -76.127)"/><path class="a" d="M102.74,138.673l.167.035.342.075.18-.079-.391-.083Z" transform="translate(-57.642 -77.788)"/><path class="a" d="M209.744,152.332l-.044-.009h0l-.061-.013-.009.044Z" transform="translate(-164.646 -91.561)"/><path class="a" d="M102.289,138.216l-.149.026v.11l.127-.022h.119l.3-.053.839-.149c.083-.048.171-.1.255-.158l-1.392.246Z" transform="translate(-57.306 -77.423)"/><path class="a" d="M95.251,137.05l-.162.048h0l-.105.022-.092.031-1.181.566.127.061,1.286-.615Z" transform="translate(-52.577 -76.907)"/><path class="a" d="M204.37,150.678l.013.044.048-.048.07.07.1-.048-.048-.1v0Z" transform="translate(-161.696 -90.596)"/><path class="a" d="M95.96,137.76l-.439.3-.281.29.127.031.465-.474Z" transform="translate(-53.435 -77.305)"/><path class="a" d="M204.145,150.78l-.048.048,0,.009-.018.009-.127.127-.1.1.294-.193.022.031.048-.048-.009-.009Z" transform="translate(-161.41 -90.703)"/><path class="a" d="M95.607,137.4l.285-.189-.039-.062-.026-.031-.294.193-.922.632.145.039.4-.263Z" transform="translate(-53.082 -76.946)"/><path class="a" d="M94.635,137.24l-.918.176-.628.2a.44.44,0,0,0,.088.088l1.365-.439Z" transform="translate(-52.229 -77.014)"/><path class="a" d="M204.007,150.767l-.013-.044-.018-.053-.277.088.11-.022.022.1.163-.048.017-.009Z" transform="translate(-161.32 -90.641)"/><path class="a" d="M94.523,137.089l.105-.022h0v-.1l-.11.022-.492.092-1.137.219c0,.035.035.07.057.105l.681-.132Z" transform="translate(-52.117 -76.862)"/><path class="a" d="M97.607,139.5l-.079-.083-.079.075-.149.149a.29.29,0,0,1,.04.118l.11-.105Z" transform="translate(-54.591 -78.237)"/><path class="a" d="M205.738,150.4l-.018.009h.013l0-.009Z" transform="translate(-162.453 -90.49)"/><path class="a" d="M205.851,149.79l-.1.136.066-.04Z" transform="translate(-162.47 -90.148)"/><path class="a" d="M206.861,143.479l-.105-.04,0,.009-.887,2.419-.114.3.242-.316.777-2.125Z" transform="translate(-162.47 -86.585)"/><path class="a" d="M207,150.49l0-.11h-.127l-1.163.018h-.04l-.044.026v.088l.316,0,.939-.013Z" transform="translate(-162.397 -90.479)"/><path class="a" d="M205.552,149.292l.018-.009,1.141-.7.118-.075-.057-.1-.07.039-1.071.663-.066.04-.145.193.013.022.075-.048Z" transform="translate(-162.285 -89.374)"/><path class="a" d="M205.3,148.117l.145-.193.1-.136.992-1.326.127-.171-.092-.07-.048.066-.839,1.128-.241.316-.154.211-.022.031-.066.083.048.035.044.031h0Z" transform="translate(-162.161 -88.145)"/><path class="b" d="M119.891,52.055c-.439,0-.777-.347-.992-.944a4.188,4.188,0,0,0-1.317-1.076l-.07-.044-.053-.061a1.032,1.032,0,0,1-.329-.953c.119-.391.509-.5.821-.584a2.567,2.567,0,0,0,.549-.2,1.247,1.247,0,0,1,.623-.176c.808,0,1.22.808,1.638,1.787.373.878.351,1.278-.079,1.7a.606.606,0,0,0-.105.123A.79.79,0,0,1,119.891,52.055Z" transform="translate(-65.705 -26.964)"/><path class="a" d="M118.914,47.969c.707,0,1.093.764,1.488,1.69s.285,1.194-.044,1.515a.927.927,0,0,0-.136.158.619.619,0,0,1-.54.342c-.342,0-.645-.3-.834-.834a4.064,4.064,0,0,0-1.392-1.163l-.048-.026-.035-.044a.878.878,0,0,1-.294-.795c.092-.3.4-.391.711-.474a2.8,2.8,0,0,0,.58-.211,1.1,1.1,0,0,1,.544-.158m0-.329a1.449,1.449,0,0,0-.707.2,2.257,2.257,0,0,1-.509.184,1.155,1.155,0,0,0-.935.694,1.207,1.207,0,0,0,.36,1.106l.035.04.035.044.048.031.048.026a4.391,4.391,0,0,1,1.247.992c.237.667.659,1.049,1.146,1.049a.953.953,0,0,0,.825-.5.575.575,0,0,1,.079-.088c.483-.47.514-.961.118-1.883C120.363,48.733,119.9,47.64,118.914,47.64Z" transform="translate(-65.497 -26.751)"/><path class="h" d="M118.446,50.232s1.317.786,1.532,1.317.549.825.786.439.628-.272.158-1.374-.878-1.756-1.572-1.374S117.779,49.446,118.446,50.232Z" transform="translate(-66.32 -27.587)"/></g></g></svg>`
      const svg = this.convert("text/svg", svgString)
      return svg
    }

    if (name === "warn") {
      const svgString = /*html*/`
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V14" stroke="whitesmoke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.0001 21.41H5.94005C2.47005 21.41 1.02005 18.93 2.70005 15.9L5.82006 10.28L8.76006 5.00003C10.5401 1.79003 13.4601 1.79003 15.2401 5.00003L18.1801 10.29L21.3001 15.91C22.9801 18.94 21.5201 21.42 18.0601 21.42H12.0001V21.41Z" stroke="whitesmoke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11.9945 17H12.0035" stroke="whitesmoke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `
      const svg = this.convert("text/svg", svgString)

      for (let i = 0; i < svg.children.length; i++) {
        const child = svg.children[i]
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          child.setAttribute("stroke", this.colors.matte.dark.text)
        } else {
          child.setAttribute("stroke", this.colors.matte.light.text)
        }
      }

      return svg
    }

    if (name === "loading") {
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"><path d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>`
      const svg = this.convert("text/svg", svgString)

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        svg.style.fill = this.colors.matte.dark.text
      } else {
        svg.style.fill = this.colors.matte.light.text
      }

      return svg
    }

    if (name === "smiling-bear") {
      const svgString = `<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19,1a3.976,3.976,0,0,0-3.268,1.729,9.917,9.917,0,0,0-7.464,0,3.984,3.984,0,1,0-5.539,5.54A9.941,9.941,0,0,0,2,12c0,5.192,4.276,11,10,11s10-5.808,10-11a9.941,9.941,0,0,0-.729-3.731A3.984,3.984,0,0,0,19,1ZM3.667,6.478A1.978,1.978,0,0,1,3,5,2,2,0,0,1,5,3a1.978,1.978,0,0,1,1.478.667A10.3,10.3,0,0,0,3.667,6.478ZM12,21c-4.579,0-8-4.751-8-9a8,8,0,0,1,16,0C20,16.249,16.579,21,12,21ZM17.522,3.667A1.978,1.978,0,0,1,19,3a2,2,0,0,1,2,2,1.978,1.978,0,0,1-.667,1.478A10.407,10.407,0,0,0,17.522,3.667ZM16,15.5c0,1.038-.836,3-4,3s-4-1.962-4-3a1,1,0,0,1,2,0c.008.111.109.644,1,.882V15.051L9.617,12.426A.954.954,0,0,1,10.368,11h3.264a.954.954,0,0,1,.751,1.426L13,15.051v1.331c.891-.239.992-.778,1-.911a1.029,1.029,0,0,1,1.032-.952A.984.984,0,0,1,16,15.5Z"/></svg>`
      const svg = this.convert("text/svg", svgString)

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        svg.style.fill = this.colors.matte.dark.text
      } else {
        svg.style.fill = this.colors.matte.light.text
      }

      return svg
    }

  }

  static colorPicker(palette, element) {
    const colors = document.createElement("div")
    colors.style.overflowY = "auto"
    colors.style.overscrollBehavior = "none"
    element.append(colors)

    for (const [key, value] of Object.entries(this.colors[palette])) {
      const color = document.createElement("div")
      color.style.height = "34px"
      color.style.margin = "8px 34px"
      color.style.borderRadius = "3px"
      color.style.padding = "5px"
      color.innerHTML = key
      color.style.background = value
      colors.append(color)

      if (typeof value === "object") {
        for (const [key, val] of Object.entries(value)) {
          const color = document.createElement("div")
          color.style.height = "34px"
          color.style.margin = "8px 34px"
          color.style.borderRadius = "3px"
          color.style.padding = "5px"
          color.innerHTML = key
          color.style.background = val
          colors.append(color)
        }
      }
    }
  }

  // https://simplicable.com/colors/
  static colors = {
    matte: {
      lightGray: '#eaeaea',
      orange: '#e8a435',
      sunflower: '#efa514',
      apricot: '#fbceb1',
      red: '#ee7a7a',
      mint: '#72e6cb',
      seaGreen: '#277e71',
      black: '#303030',
      charcoal: '#444444',
      slate: '#555555',
      deepBlue: '#003366',
      forest: '#09443c',
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
      chartreuse: '#b5e288',
      celadon: '#ace1af',
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
      lime: '#9fcb8d',
      lightYellow: "#f7aa20",

      // deprecated
      dark: {
        // add more events like action color
        // add more events like css - boxShadow, border, ??
        background: '#28282B',
        primary: '#2E4369',
        secondary: '#4E6172',
        accent: '#6D8898',
        text: '#CDD9E5',
        error: '#9B3C38',
      },
      light: {
        background: '#F0F0F0',
        primary: '#A0A0A0',
        secondary: '#7C7C7C',
        accent: '#595959',
        text: '#333333',
        error: '#B03535',
      },
    },
    gray: {
      0: '#eaeaea',
      1: '#dcdcdc',
      2: '#cdcdcd',
      3: '#adadad',
      4: '#939393',
    },
    dark: {
      foreground: '#303030',

      // add more events like action color
      // add more events like css - boxShadow, border, ??
      background: '#28282B',
      boxShadow: `0 1px 3px ${this.hexToRgba("#ffffff", "0.13")}`,
      border: '0.3px solid #2E4369',
      // boxShadow: '0 1px 3px #2E4369',

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
      boxShadow: `0 1px 3px ${this.hexToRgba("#000000", "0.13")}`,
      primary: '#A0A0A0',
      secondary: '#7C7C7C',
      accent: '#595959',
      text: '#333333',
      error: '#B03535',
      success: '#9fcb8d',
    },
    link: {
      color: "#4169E1",
      active: "#D46A6A"
    },
  }

  static convert(event, input) {

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
          await this.verifyFileMimeTypes(file, allowedMimeTypes)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            this.setNotValidStyle(input)
            throw error
          })
        }

        if (allowedExtensions !== undefined) {
          await this.verifyFileExtension(file, allowedExtensions)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            this.setNotValidStyle(input)
            throw error
          })
        }

        const dataUrl = await this.convertImageFileToDataUrl(file, 2584)
        const dataUrlSize = this.calculateDataUrlSize(dataUrl)
        if (dataUrlSize > 1024 * 1024) {
          alert("Datei ist zu groß.")
          this.setNotValidStyle(input)
          throw new Error("image too large")
        }

        const image = {}
        image.name = file.name
        image.type = file.type
        image.size = dataUrlSize
        image.modified = Date.now()
        image.dataUrl = dataUrl
        this.setValidStyle(input)
        return resolve(image)

      })


    }

    if (event === "map/div") {

      return new Promise((resolve, reject) => {

        const div = this.headerPicker("loading", )
        div.classList.add("json")
        div.style.margin = "21px 34px"

        const buttons = document.createElement("div")
        buttons.classList.add("buttons")
        buttons.style.display = "flex"
        buttons.style.justifyContent = "space-between"
        buttons.style.alignItems = "center"
        div.append(buttons)

        const foldAllButton = this.create("div/action", buttons)
        foldAllButton.innerHTML = "fold"

        foldAllButton.addEventListener("click", function() {
          toggleAllValues("none");
        });

        const unfoldAllButton = this.create("div/action", buttons)
        unfoldAllButton.innerHTML = "unfold"
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
      foldAllButton.innerHTML = "fold"

      foldAllButton.addEventListener("click", function() {
        toggleAllValues("none");
      });

      const unfoldAllButton = this.create("div/action", buttons)
      unfoldAllButton.innerHTML = "unfold"
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

    // convert text/map ???
    // input regex pattern
    if (event === "error-stack-text/div") {

      // Extract function name, file path, line number, and column number
      const regex = /at (.*) \((.*):(\d*):(\d*)\)/g;
      const matches = [...input.matchAll(regex)];

      if (matches.length === 0) {
        return 'Invalid error stack format';
      }

      const formattedStack = matches.map(match => {
        const [_, functionName, filePath, lineNumber, columnNumber] = match;
        return `
          <div class="error-line">
            <span class="function-name">${functionName}</span>
            <span class="file-path">${filePath}:${lineNumber}:${columnNumber}</span>
          </div>
        `;
      }).join('');

      const div = document.createElement("div")
      div.innerHTML = `
        <div class="error-stack">
          ${formattedStack}
        </div>
      `;
      return div

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

    if (event === "field/on-info-click") {

      const labelContainer = input.querySelector(".field-label-container")
      const label = input.querySelector(".field-label")

      const image = document.createElement("div")
      image.classList.add("field-image")
      image.style.width = "34px"
      image.style.marginRight = "21px"
      image.append(this.iconPicker("info"))

      if (input.querySelector(".field-image") === null) {
        label.before(image)
      }

      labelContainer.style.cursor = "pointer"
      labelContainer.childNodes.forEach(child => child.style.cursor = "pointer")
      labelContainer.addEventListener("click", () => {

        this.overlay("info", overlay => {
          const content = this.create("div/scrollable", overlay)
          content.innerHTML = input.getAttribute("on-info-click")
        })

      })

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

    if (event === "field-funnel/map") {
      return new Promise(async(resolve, reject) => {

        try {

          const res = await this.verifyIs("field-funnel/valid", input)

          if (res === true) {

            const promises = []
            input.querySelectorAll(".field").forEach(field => {

              if (this.tagIsEmpty(field.id)) {
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

          await this.verifyFileMimeTypes(input, allowedMimeTypes)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyFileExtension(input, allowedExtensions)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          const fileReader = new FileReader()
          fileReader.onload = () => {

            const dataUrlSize = this.calculateDataUrlSize(fileReader.result)
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

          await this.verifyFileMimeTypes(input, allowedMimeTypes)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyFileExtension(input, allowedExtensions)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          const fileReader = new FileReader()
          fileReader.onload = () => {

            const dataUrlSize = this.calculateDataUrlSize(fileReader.result)
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

          await this.verifyFileMimeTypes(input, allowedMimeTypes)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyFileExtension(input, allowedExtensions)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          const fileReader = new FileReader()
          fileReader.onload = () => {

            const dataUrlSize = this.calculateDataUrlSize(fileReader.result)
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

          await this.verifyFileMimeTypes(input, allowedMimeTypes)
          .catch(error => {
            alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyFileExtension(input, allowedExtensions)
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
            map.html = this.sanitizeHtml(fileReader.result)

            return resolve(map)
          }
          fileReader.readAsText(input)

        })
      }

      if (input.type === "image/svg+xml") {
        return new Promise(async (resolve, reject) => {
          const allowedMimeTypes = ["image/svg+xml"]
          const allowedExtensions = ["svg"]

          await this.verifyFileMimeTypes(input, allowedMimeTypes)
          .catch(error => {
            window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
            return reject(error)
          })

          await this.verifyFileExtension(input, allowedExtensions)
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
            map.svg = this.sanitizeHtml(fileReader.result)

            return resolve(map)
          }
          fileReader.readAsText(input)

        })
      }
    }

    if (event === "styles/text") {
      const styles = input.style
      const div = document.createElement("div")
      for (let i = 0; i < styles.length; i++) {
        const key = styles[i]
        const value = styles.getPropertyValue(key)
        div.append(`${key}: ${value};\n`)
      }
      return div.innerHTML

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

    if (event === "text/dom") {
      const parser = document.createElement("div")
      parser.innerHTML = input
      return parser.children[0]
    }

    if (event === "text/script") {

      const container = document.createElement("div")
      container.innerHTML = input
      return container.children[0]

    }

    if (event === "js/script") {

      const script = document.createElement("script")
      script.innerHTML = input
      return script

    }

    if (event === "text/html") {

      const parser = new DOMParser()
      const doc = parser.parseFromString(input, "text/html")

      return doc.body.firstChild
    }

    if (event === "text/field") {
      // console.log(input);

      if (input === "text") {

        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field

      }

      if (input === "textarea") {

        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement(input)
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field


      }

      if (input === "email") {

        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field

      }

      if (input === "tel") {


        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field


      }

      if (input === "range") {


        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field


      }

      if (input === "password") {


        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field


      }

      if (input === "number") {


        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field


      }

      if (input === "file") {


        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field


      }

      if (input === "date") {


        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field


      }

      if (input === "checkbox") {


        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement("input")
        field.input.type = input
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field


      }

      if (input === "select") {


        const field = document.createElement("div")
        field.classList.add("field")

        field.labelContainer = document.createElement("div")
        field.labelContainer.classList.add("field-label-container")
        field.append(field.labelContainer)

        field.label = document.createElement("label")
        field.label.classList.add("field-label")
        field.labelContainer.append(field.label)

        field.input = document.createElement(input)
        field.input.classList.add("field-input")
        field.append(field.input)


        field.style.position = "relative"
        field.style.borderRadius = "13px"
        field.style.display = "flex"
        field.style.flexDirection = "column"
        field.style.margin = "34px"
        field.style.justifyContent = "center"
        field.style.backgroundColor = this.colors.light.foreground
        field.style.border = this.colors.light.border
        field.style.boxShadow = this.colors.light.boxShadow
        field.style.color = this.colors.light.text

        field.labelContainer.style.display = "flex"
        field.labelContainer.style.alignItems = "center"
        field.labelContainer.style.margin = "21px 89px 0 34px"

        field.label.style.fontFamily = "sans-serif"
        field.label.style.fontSize = "21px"
        field.label.style.color = this.colors.light.text

        field.input.style.margin = "21px 89px 21px 34px"
        field.input.style.fontSize = "21px"
        field.input.style.backgroundColor = this.colors.light.background
        field.input.style.color = this.colors.light.text

        return field



      }



    }

    if (event === "text/hr") {

      const container = document.createElement("div")

      const text = document.createElement("div")
      text.innerHTML = input
      container.append(text)

      const hr = document.createElement("hr")
      container.append(hr)

      text.style.fontFamily = "sans-serif"
      text.style.fontSize = "13px"
      text.style.margin = "0 34px"

      hr.style.margin = "0 21px"


      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        text.style.color = this.colors.dark.text
        hr.style.border = `1px solid ${this.colors.dark.text}`
      } else {
        text.style.color = this.colors.light.text
        hr.style.border = `1px solid ${this.colors.light.text}`
      }


      return container
    }

    if (event === "text/span") {
      const span = document.createElement("span")
      span.textContent = input

      return span
    }

    if (event === "parent/dark") {


      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (input.tagName === "BODY") {
          input.style.background = this.colors.dark.background
        }
      }


    }

    if (event === "parent/scrollable") {
      this.reset(input)
      input.style.overflowY = "auto"
      input.style.overscrollBehavior = "none"
      input.style.paddingBottom = "144px"
      return input
    }

    if (event === "parent/info") {
      this.reset(input)
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

    if (event === "parent/expert-closed") {
      this.reset(input)
      input.style.overflowY = "auto"
      input.style.overscrollBehavior = "none"
      input.style.paddingBottom = "144px"


      {
        const button = this.buttonPicker("left/right", input)
        button.right.innerHTML = "Experten Name ändern"
        button.left.innerHTML = ".name"
        button.addEventListener("click", () => {
          this.popup(overlay => {
            this.headerPicker("removeOverlay", overlay)

            this.update("name/expert/closed", overlay, {ok: () => this.removeOverlay(overlay)})
          })
        })

      }

      {
        const button = this.buttonPicker("left/right", input)
        button.right.innerHTML = "Neue Plattform erstellen"
        button.left.innerHTML = ".platform"
        button.addEventListener("click", () => {

          this.popup(async overlay => {
            this.headerPicker("removeOverlay", overlay)
            const info = this.headerPicker("info", overlay)
            info.innerHTML = ".platform"

            {

              const funnel = this.headerPicker("scrollable", overlay)

              const platformNameField = new TextField("platformName", funnel)
              platformNameField.label.innerHTML = "Plattform Name"
              platformNameField.input.accept = "text/tag"
              platformNameField.input.maxLength = "21"
              platformNameField.input.required = true
              platformNameField.input.placeholder = "meine-plattform"
              platformNameField.input.addEventListener("input", (event) => platformNameField.verifyValue())
              this.setNotValidStyle(platformNameField.input)

              const button = this.buttonPicker("action", funnel)

              button.innerHTML = "Jetzt hinzufügen"
              button.addEventListener("click", async () => {

                const platformName = platformNameField.validValue()

                const res = await Request.ping("/verify/platform/open/", platformName)

                if (res.status === 200) {
                  window.alert("Plattform Name existiert bereits.")
                  this.setNotValidStyle(platformNameField.input)
                  throw new Error("platform exist")
                }


                this.popup(async securityOverlay => {

                  const register = {}
                  register.url = "/register/platform/closed/"
                  register.platform = platformName
                  const res = await Request.middleware(register)

                  if (res.status === 200) {
                    alert("Plattform erfolgreich hinzugefügt..")
                    window.location.reload()
                  } else {
                    alert("Fehler.. Bitte wiederholen.")
                    this.removeOverlay(securityOverlay)
                  }


                })

              })

            }

          })
        })
      }

      {
        // refactor this before use it - in progress
        const button = this.buttonPicker("left/right", input)
        button.left.innerHTML = ".conflicts"
        button.right.innerHTML = "Konflikte"

        button.addEventListener("click", () => {

          this.popup(overlay => {

            {
              const header = document.createElement("div")
              header.style.position = "fixed"
              header.style.bottom = "0"
              header.style.left = "0"
              header.style.width = "100%"
              header.style.display = "flex"
              header.style.justifyContent = "flex-start"
              header.style.alignItems = "center"
              header.style.boxShadow = "0px 5px 10px rgba(0, 0, 0, 0.5)"
              header.style.background = "white"
              header.style.zIndex = "1"
              header.style.cursor = "pointer"
              header.addEventListener("click", () => this.removeOverlay(overlay))

              const logo = document.createElement("img")
              logo.src = "/public/getyour-logo.svg"
              logo.alt = "Logo"
              logo.style.width = "55px"
              logo.style.margin = "21px 34px"
              header.append(logo)
              const title = document.createElement("div")
              title.innerHTML = `Konflikte`
              title.style.fontWeight = "bold"
              title.style.fontSize = "21px"
              header.append(title)
              overlay.append(header)
            }

            {
              const buttons = document.createElement("div")
              buttons.style.overflowY = "auto"
              buttons.style.overscrollBehavior = "none"
              buttons.style.paddingBottom = "144px"
              overlay.append(buttons)

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

                const icon = this.iconPicker("smiling-bear")
                icon.style.width = "144px"
                icon.style.fill = this.colors.matte.black
                icon.style.marginRight = "8px"
                infoBox.append(icon)

                const message = document.createElement("div")
                message.style.fontSize = "13px"

                message.innerHTML = `
                  <p>In unserer Gemeinschaft legen wir großen Wert auf Offenheit, Transparenz und ein harmonisches Miteinander. Wir möchten betonen, dass es vollkommen in Ordnung ist, Konflikte zu melden, und wir ermutigen dies sogar ausdrücklich. Konflikte sind ein natürlicher Bestandteil des menschlichen Zusammenlebens und können uns dabei helfen, Missverständnisse aufzuklären, Probleme zu lösen und eine Veränderung herbeizuführen, bei der sich alle Parteien verstanden fühlen.</p>
                `

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
                title.innerHTML = "Neuen Konflikt melden"
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



                /// icon picker

                // const icon = this.iconPicker("open-eye")

                const icon = document.createElement("img")
                icon.style.margin = "13px 34px"
                icon.style.width = "34px"
                icon.src = "/public/open.svg"
                icon.alt = "Offen"
                button.append(icon)

                const title = document.createElement("div")
                title.innerHTML = "Offene Konflikte"
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
                title.innerHTML = "Gelöste Konflikte"
                title.style.margin = "21px 34px"
                title.style.fontSize = "21px"
                button.append(title)

                buttons.append(button)
              }

            }

          })

        })

      }

      {
        const button = this.buttonPicker("left/right", input)
        button.right.innerHTML = "Konto löschen"
        button.left.innerHTML = ".delete"
        button.addEventListener("click", () => {

          const confirm = window.confirm("Du bist gerade dabei deine persönliche Datenbank zu löschen. Diese Daten werden gelöscht und können nicht mehr wiederhergestellt werden. Du wirst abgemeldet und musst dich erneut registrieren lassen.\n\nMöchtest du alle deine Daten wirklich löschen?")

          if (confirm === true) {
            const prompt = window.prompt("Bitte bestätige deine E-Mail Adresse.")

            if (this.stringIsEmpty(prompt)) {
              alert("Fehler.. Bitte wiederholen.")
              return
            }

            this.overlay("security", async securityOverlay => {

              const verify = {}
              verify.url = "/verify/email/closed/"
              verify.email = prompt
              const res = await Request.closed(verify)

              if (res.status === 200) {
                const del = {}
                del.url = "/delete/user/closed/"
                del.email = prompt
                const res = await Request.closed(del)

                if (res.status === 200) {
                  alert("Daten erfolgreich gelöscht.")
                  window.location.reload()
                } else {
                  alert("Fehler.. Bitte wiederholen.")
                  this.removeOverlay(securityOverlay)
                }


              } else {
                alert("Fehler.. Bitte wiederholen.")
                this.removeOverlay(securityOverlay)
              }

            })


          }


        })
      }



      return input
    }

    if (event === "parent/navigation-open") {
      this.reset(input)
      input.style.overflowY = "auto"
      input.style.overscrollBehavior = "none"
      input.style.paddingBottom = "144px"

      this.create("nav/open", input)

      return input
    }

    if (event === "element/button-right") {
      this.reset(input)
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
      this.reset(input)
      input.innerHTML = "✓"
      input.style.margin = "21px 34px"
      input.style.color = "#00c853"
      input.style.fontSize = "34px"
      input.style.fontFamily = "sans-serif"
      return input
    }

    if (event === "element/scrollable") {
      this.reset(input)
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

    if (event === "element/center") {
      this.reset(input)
      input.style.position = "absolute"
      input.style.top = "0"
      input.style.left = "0"
      input.style.height = "89vh"
      input.style.width = "100%"
      input.style.display = "flex"
      input.style.justifyContent = "center"
      input.style.alignItems = "center"

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        input.style.color = this.colors.matte.dark.text
      } else {
        input.style.color = this.colors.matte.light.text
      }

      return input
    }

    if (event === "text/img") {
      const img = document.createElement("img")
      img.src = input
      return img
    }

    if (event === "text/svg") {
      const container = document.createElement("div")
      container.innerHTML = input

      // sanatize svg
      container.children[0].removeAttribute("width")
      container.children[0].removeAttribute("height")

      return container.children[0]
    }

    if (event === "input/alias") {

      const output = document.createElement("div")
      output.style.fontFamily = "monospace"
      output.style.fontSize = "13px"
      output.style.display = "inline"
      output.innerHTML = `&lt; ${input.tagName.toLowerCase()}`

      if (input.id !== "") {
        const id = document.createElement("span")
        id.style.fontSize = "21px"
        id.innerHTML = `#${input.id}`
        output.append(id)
      }

      if (input.hasAttribute("type")) {
        const span = document.createElement("span")
        span.style.fontSize = "21px"
        span.innerHTML = `.${input.getAttribute("type")}`
        output.append(span)
      }

      return output
    }

    if (event === "element/tagName") {

      return input.tagName

    }

    if (event === "element/alias") {

      const output = document.createElement("div")
      output.style.fontFamily = "monospace"
      output.style.fontSize = "13px"
      output.style.overflow = "auto"
      output.style.display = "inline"
      output.innerHTML = `&lt;${input.tagName.toLowerCase()}`

      if (input.id !== "") {
        const id = document.createElement("span")
        id.style.fontSize = "21px"
        id.innerHTML = `#${input.id}`
        output.append(id)
      }

      if (input.id === "") {
        if (input.getAttribute("data-id") !== null) {
          const id = document.createElement("span")
          id.style.fontSize = "21px"
          id.innerHTML = `#${input.getAttribute("data-id")}`
          output.append(id)
        }
      }

      if (input.classList.length > 0) {

        for (let i = 0; i < input.classList.length; i++) {
          const className = input.classList[i]
          const span = document.createElement("span")
          span.style.fontSize = "21px"
          span.innerHTML = `.${className}`
          output.append(span)
        }

      }

      return output
    }

  }

  static sanitizeHtml(html) {
    // events
    html = html.replace(/on\w+="[^"]*"/gi, "")

    // chars
    html = html.replace(/{{(.*?)}}/g, "")
    html = html.replace(/\[\[(.*?)\]\]/g, "")

    // attributes
    html = html.replace(/src=["'`](.*?)["'`]/gi, "")
    html = html.replace(/href=["'`](.*?)["'`]/gi, "")

    // css
    html = html.replace(/expression\([^)]*\)/gi, "")
    html = html.replace(/url\((['"]?)(.*?)\1\)/gi, "")

    // js
    html = html.replace(/javascript:/gi, "")

    // tags
    html = html.replace(/<img\b[^>]*>/gi, "")
    html = html.replace(/<link\b[^>]*>/gi, "")
    html = html.replace(/<input\b[^>]*>/gi, "")
    html = html.replace(/<a\b[^>]*>/gi, "")
    html = html.replace(/<meta\b[^>]*>/gi, "")
    html = html.replace(/<datalist\b[^>]*>/gi, "")
    html = html.replace(/<source\b[^>]*>/gi, "")
    html = html.replace(/<progress\b[^>]*>/gi, "")
    html = html.replace(/<details\b[^>]*>/gi, "")
    html = html.replace(/<summary\b[^>]*>/gi, "")
    html = html.replace(/<script\b[^>]*>/gi, "")
    html = html.replace(/<iframe\b[^>]*>/gi, "")
    html = html.replace(/<object\b[^>]*>/gi, "")
    html = html.replace(/<embed\b[^>]*>/gi, "")
    html = html.replace(/<form\b[^>]*>/gi, "")
    html = html.replace(/<textarea\b[^>]*>/gi, "")
    html = html.replace(/<select\b[^>]*>/gi, "")
    html = html.replace(/<button\b[^>]*>/gi, "")
    html = html.replace(/<base\b[^>]*>/gi, "")
    html = html.replace(/<frame\b[^>]*>/gi, "")
    html = html.replace(/<frameset\b[^>]*>/gi, "")
    html = html.replace(/<applet\b[^>]*>/gi, "")
    html = html.replace(/<audio\b[^>]*>/gi, "")
    html = html.replace(/<video\b[^>]*>/gi, "")
    html = html.replace(/<source\b[^>]*>/gi, "")
    html = html.replace(/<track\b[^>]*>/gi, "")
    html = html.replace(/<canvas\b[^>]*>/gi, "")
    html = html.replace(/<svg\b[^>]*>/gi, "")
    html = html.replace(/<math\b[^>]*>/gi, "")
    html = html.replace(/<template\b[^>]*>/gi, "")
    html = html.replace(/<noscript\b[^>]*>/gi, "")
    html = html.replace(/<noembed\b[^>]*>/gi, "")
    html = html.replace(/<plaintext\b[^>]*>/gi, "")
    html = html.replace(/<marquee\b[^>]*>/gi, "")
    html = html.replace(/<blink\b[^>]*>/gi, "")
    html = html.replace(/<layer\b[^>]*>/gi, "")
    html = html.replace(/<ilayer\b[^>]*>/gi, "")
    html = html.replace(/<basefont\b[^>]*>/gi, "")
    html = html.replace(/<isindex\b[^>]*>/gi, "")
    html = html.replace(/<keygen\b[^>]*>/gi, "")
    html = html.replace(/<command\b[^>]*>/gi, "")
    return html
  }

  static reset(element) {
    element.removeAttribute("style")
    element.innerHTML = ""
  }

  static createButton(event, options) {
    if (event === "service") {
      const {name, units, price, selected} = options

      const item = document.createElement("div")
      item.style.position = "relative"
      item.style.margin = "21px 34px"
      item.style.fontSize = "21px"
      item.style.display = "flex"
      item.style.flexDirection = "column"
      item.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
      item.style.border = "0.3px solid black"
      item.style.borderRadius = "13px"
      item.style.padding = "21px 34px"

      const firstRow = document.createElement("div")
      firstRow.style.display = "flex"
      firstRow.style.alignItems = "center"
      firstRow.style.margin = "13px 0"
      firstRow.style.cursor = "pointer"
      firstRow.addEventListener("click", () => {
        this.popup(overlay => {


          const header = document.createElement("div")
          header.style.position = "fixed"
          header.style.bottom = "0"
          header.style.left = "0"
          header.style.width = "100%"
          header.style.display = "flex"
          header.style.justifyContent = "flex-start"
          header.style.alignItems = "center"
          header.style.boxShadow = "0px 5px 10px rgba(0, 0, 0, 0.5)"
          header.style.background = "white"
          header.style.cursor = "pointer"
          header.style.zIndex = "1"
          header.addEventListener("click", () => this.removeOverlay(overlay))

          const logo = document.createElement("img")
          logo.src = "/felix/shs/public/ep-logo.svg"
          logo.alt = "Energie Portal"
          logo.style.width = "55px"
          logo.style.margin = "21px 34px"
          header.append(logo)
          const title = document.createElement("div")
          title.innerHTML = name
          title.style.fontWeight = "bold"
          title.style.fontSize = "21px"
          header.append(title)
          overlay.append(header)


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
            button.addEventListener("click", async () => {

              try {
                const securityOverlay = this.addOverlay()
                this.setWaitCursor()
                {
                  const del = {}
                  del.url = "/delete/service/closed/5/"
                  del.name = name
                  del.localStorageId = await Request.localStorageId()
                  del.localStorageEmail = await Request.email()
                  del.location = window.location.href
                  del.referer = document.referrer
                  await Request.sequence(del)
                }

                alert("Dienst erfolgreich gelöscht.")
                item.remove()
                this.removeOverlay(securityOverlay)
                this.removeOverlay(overlay)
              } catch (error) {
                alert("Fehler.. Bitte wiederholen.")
                window.location.reload()
              }




            })

            const icon = document.createElement("img")
            icon.style.margin = "13px 34px"
            icon.style.width = "34px"
            icon.src = "/public/delete.svg"
            icon.alt = "Löschen"
            button.append(icon)

            const title = document.createElement("div")
            title.innerHTML = "Löschen"
            title.style.margin = "21px 34px"
            title.style.fontSize = "21px"
            button.append(title)

            overlay.append(button)
          }

        })
      })

      const amount = document.createElement("div")
      amount.innerHTML = `${units}x`
      amount.style.marginRight = "8px"
      firstRow.append(amount)

      const title = document.createElement("div")
      title.innerHTML = name
      firstRow.append(title)

      item.append(firstRow)

      const secondRow = document.createElement("div")
      secondRow.style.display = "flex"
      secondRow.style.justifyContent = "flex-end"
      secondRow.style.alignItems = "center"
      secondRow.style.margin = "13px 0"

      {
        const div = document.createElement("div")
        div.innerHTML = `${price}€`
        secondRow.append(div)
      }

      const input = document.createElement("input")
      input.type = "checkbox"
      input.checked = selected
      input.style.width = "21px"
      input.style.height = "21px"
      input.style.margin = "0 0 3px 13px"
      input.addEventListener("input", (event) => {

        const services = JSON.parse(window.sessionStorage.getItem("services"))
        if (services !== null) {
          for (let i = 0; i < services.length; i++) {
            if (services[i].name === name) {
              services[i].selected = event.target.checked
            }
          }
          window.sessionStorage.setItem("services", JSON.stringify(services))
        }

      })
      secondRow.append(input)

      item.append(secondRow)

      return item
    }
  }

  static calculateDataUrlSize(dataUrl) {
    var base64Marker = ';base64,'
    var dataSize

    if (dataUrl.indexOf(base64Marker) === -1) {
      dataSize = dataUrl.length - dataUrl.indexOf(':') - 1
    } else {
      dataSize = (dataUrl.length - dataUrl.indexOf(base64Marker) - base64Marker.length) * 0.75
    }

    return dataSize
  }

  static convertImageFileToDataUrl(file, size) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener("loadend", () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const image = document.createElement("img")
        image.src = reader.result
        image.onload = () => {
          const width = size
          const height = size * image.height / image.width
          canvas.width = width
          canvas.height = height
          ctx.drawImage(image, 0, 0, width, height)
          return resolve(canvas.toDataURL(file.type))
        }
      })
    })
  }

  static verifyFileMimeTypes(file, types) {
    return new Promise((resolve, reject) => {
      try {
        let allowed = false
        for (let i = 0; i < types.length; i++) {
          if (file.type === types[i]) {
            return resolve()
          }
        }
        if (allowed === false) throw new Error("file type not allowed")
      } catch (error) {
        reject(error)
      }
    })
  }

  static verifyFileExtension(file, extensions) {
    return new Promise((resolve, reject) => {
      try {
        const fileExtension = file.name.split('.').pop()
        let allowed = false
        for (let i = 0; i < extensions.length; i++) {
          if (fileExtension === extensions[i]) {
            return resolve()
          }
        }
        if (allowed === false) throw new Error("file extension not allowed")
      } catch (error) {
        reject(error)
      }
    })
  }

  static removeOverlay(overlay) {
    document.body.style.overflow = "visible"
    overlay.remove()
  }

  static overlay(event, callback) {

    if (callback !== undefined) {

      if (event === "info") {

        const overlay = document.createElement("div")
        overlay.classList.add("overlay")

        // mobile issues
        overlay.style.height = "100%"
        overlay.style.overscrollBehavior = "none"
        document.body.style.overscrollBehavior = "none"
        document.body.style.overflow = "hidden"

        overlay.style.width = "100%"
        overlay.style.zIndex = "99999999999999"
        overlay.style.position = "fixed"
        overlay.style.top = "0"
        overlay.style.left = "0"
        // overlay.style.overflow = "auto"


        overlay.style.background = this.colors.matte.light.background


        overlay.style.display = "flex"
        overlay.style.flexDirection = "column"
        overlay.style.opacity = 0

        this.headerPicker("removeOverlay", overlay)

        callback(overlay)

        document.body.append(overlay)

        const animation = overlay.animate([
          { opacity: 0, transform: 'translateY(13px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], {
          duration: 344,
          easing: 'ease-in-out',
          fill: "forwards"
        })

        return overlay

      }

      if (event === "security") {
        const overlay = document.createElement("div")
        overlay.classList.add("overlay")

        this.headerPicker("loading", overlay)

        // mobile issues
        overlay.style.height = "100%"
        overlay.style.overscrollBehavior = "none"
        document.body.style.overscrollBehavior = "none"
        document.body.style.overflow = "hidden"

        overlay.style.width = "100%"
        overlay.style.zIndex = "99999999999999"
        overlay.style.position = "fixed"
        overlay.style.top = "0"
        overlay.style.left = "0"

        overlay.style.background = this.colors.matte.light.background
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          overlay.style.background = this.colors.matte.dark.background
        }

        overlay.style.display = "flex"
        overlay.style.flexDirection = "column"

        callback(overlay)

        document.body.append(overlay)

        return overlay
      }

    }
  }

  static popup(callback) {
    if (callback !== undefined) {
      const overlay = document.createElement("div")
      overlay.classList.add("overlay")

      // mobile issues
      overlay.style.height = "100%"
      overlay.style.overscrollBehavior = "none"
      document.body.style.overscrollBehavior = "none"
      document.body.style.overflow = "hidden"

      overlay.style.width = "100%"
      overlay.style.zIndex = "99999999999999"
      overlay.style.position = "fixed"
      overlay.style.top = "0"
      overlay.style.left = "0"

      overlay.style.background = this.colors.matte.light.background
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        overlay.style.background = this.colors.matte.dark.background
      }

      overlay.style.display = "flex"
      overlay.style.flexDirection = "column"
      overlay.style.opacity = 0

      callback(overlay)

      document.body.append(overlay)

      const animation = overlay.animate([
        { opacity: 0, transform: 'translateY(13px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 344,
        easing: 'ease-in-out',
        fill: "forwards"
      })

      return overlay
    }
  }

  static popupInfo({withImage, withText, withEvent}) {
    const popup = document.createElement("div")
    popup.style.height = "100vh"
    popup.style.width = "100%"
    popup.style.zIndex = "2"
    popup.style.position = "fixed"
    popup.style.top = "0"
    popup.style.left = "0"
    popup.style.background = "white"
    popup.style.display = "flex"
    popup.style.flexDirection = "column"
    popup.style.justifyContent = "space-between"
    popup.style.overflowY = "scroll"
    popup.style.opacity = 0

    const header = document.createElement("div")
    header.style.background = "rgb(0, 135, 0)"
    header.style.display = "flex"
    header.style.alignItems = "center"
    header.style.padding = "34px"

    const infoIcon = document.createElement("img")
    infoIcon.src = "../../../../public/info-white.svg"
    infoIcon.alt = "Info"

    const infoTitle = document.createElement("div")
    infoTitle.innerHTML = "Wissenswertes"
    infoTitle.style.fontSize = "21px"
    infoTitle.style.margin = "21px"
    infoTitle.style.color = "rgb(234, 234, 234)"
    header.append(infoIcon, infoTitle)
    popup.append(header)

    const imageContainer = document.createElement("div")
    imageContainer.style.display = "flex"
    imageContainer.style.justifyContent = "center"
    imageContainer.style.margin = "34px"

    if (withImage !== undefined) {
      const image = document.createElement("img")
      withImage(image)
      imageContainer.append(image)
    }
    popup.append(imageContainer)

    const textContainer = document.createElement("div")
    textContainer.style.margin = "34px"

    if (withText !== undefined) {
      const text = document.createElement("p")
      withText(text)
      textContainer.append(text)
    }
    popup.append(textContainer)

    const buttonContainer = document.createElement("div")
    buttonContainer.style.display = "flex"
    buttonContainer.style.justifyContent = "space-between"
    buttonContainer.style.margin = "34px"

    const helpfulButton = document.createElement("div")
    helpfulButton.innerHTML = "👍"
    helpfulButton.style.background = "rgb(45,201,55)"
    helpfulButton.style.display = "flex"
    helpfulButton.style.justifyContent = "center"
    helpfulButton.style.alignItems = "center"
    helpfulButton.style.height = "55px"
    helpfulButton.style.width = "89px"
    helpfulButton.style.color = "white"
    helpfulButton.style.borderRadius = "8px"
    helpfulButton.style.fontSize = "21px"
    helpfulButton.style.cursor = "pointer"
    helpfulButton.addEventListener("click", () => popup.remove())

    const notHelpfulButton = document.createElement("div")
    notHelpfulButton.innerHTML = "👎"
    notHelpfulButton.style.display = "flex"
    notHelpfulButton.style.justifyContent = "center"
    notHelpfulButton.style.alignItems = "center"
    notHelpfulButton.style.width = "89px"
    notHelpfulButton.style.height = "55px"
    notHelpfulButton.style.background = "rgb(204,50,50)"
    notHelpfulButton.style.borderRadius = "8px"
    notHelpfulButton.style.fontSize = "21px"
    notHelpfulButton.style.cursor = "pointer"
    notHelpfulButton.addEventListener("click", () => popup.remove())

    buttonContainer.append(notHelpfulButton, helpfulButton)
    popup.append(buttonContainer)

    document.body.append(popup)

    const animation = popup.animate([
      { opacity: 0, transform: 'translateY(13px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], {
      duration: 344,
      easing: 'ease-in-out',
      fill: "forwards"
    })
  }

  static startTimer({duration, display}) {

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

    display.append(timerDiv)
    return interval
  }

  static canvasToFile(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(blob => {
          return resolve({
            created: Date.now(),
            type: blob.type,
            size: blob.size,
            dataURL: canvas.toDataURL()
          })
        })

      } catch (error) {
        return reject(error)
      }
    })
  }

  static setNotValidStyle(element) {

    let color
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      color = this.colors.matte.light.error
    } else {
      color = this.colors.matte.light.error
    }



    element.style.border = `2px solid ${color}`
    if (element.type === "checkbox") {


      element.style.outline = `2px solid ${color}`
    }
    element.style.borderRadius = "3px"
    const signs = element.parentNode.querySelectorAll("div[class='sign']")
    if (signs.length === 0) {
      const sign = document.createElement("div")
      sign.classList.add("sign")
      sign.innerHTML = "x"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = color
      sign.style.fontSize = "34px"
      sign.style.fontFamily = "sans-serif"
      element.parentNode.append(sign)
      return element
    }
    if (signs.length > 0) {
      signs.forEach(sign => sign.remove())
      const sign = document.createElement("div")
      sign.classList.add("sign")
      sign.innerHTML = "x"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = color
      sign.style.fontSize = "34px"
      sign.style.fontFamily = "sans-serif"
      element.parentNode.append(sign)
      return element
    }
    return element
  }

  static setValidStyle(element) {
    element.style.border = "2px solid #00c853"
    if (element.type === "checkbox") {
      element.style.outline = "2px solid #00c853"
    }
    element.style.borderRadius = "3px"
    const signs = element.parentNode.querySelectorAll("div[class='sign']")
    if (signs.length === 0) {
      const sign = document.createElement("div")
      sign.classList.add("sign")

      sign.innerHTML = "✓"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = "#00c853"
      sign.style.fontSize = "34px"
      sign.style.fontFamily = "sans-serif"
      element.parentNode.append(sign)
      return element
    }
    if (signs.length > 0) {
      signs.forEach(sign => sign.remove())
      const sign = document.createElement("div")
      sign.classList.add("sign")

      sign.innerHTML = "✓"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = "#00c853"
      sign.style.fontSize = "34px"
      sign.style.fontFamily = "sans-serif"
      element.parentNode.append(sign)
      return element
    }
    return element
  }

  static sumSelectedPrice(array) {
    return array.filter(it => it.selected === true).reduce((prev, curr) => prev + curr.price, 0)
  }

  static substring(string, length) {
    if (string.length >= length) {
      string = string.substring(0, length - 2) + ".."
    }
    return string
  }

  static arrayExist(array) {
    return typeof array === "object" &&
    array !== undefined &&
    array !== null &&
    Array.isArray(array)
  }

  static objectExist(object) {
    return typeof object === "object" &&
    object !== undefined &&
    object !== null
  }

  static arrayIsEmpty(array) {
    return typeof array !== "object" ||
    array === undefined ||
    array === null ||
    array.length <= 0 ||
    !Array.isArray(array)
  }

  static objectIsEmpty(object) {
    return typeof object !== "object" ||
    object === undefined ||
    object === null ||
    Object.getOwnPropertyNames(object).length <= 0
  }

  static emailIsEmpty(string) {
    return typeof string !== "string" ||
    string === undefined ||
    string === null ||
    string === "" ||
    string === "null" ||
    string.replace(/\s/g, "") === "" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(string)
  }

  static pathIsEmpty(string) {
    return typeof string !== "string" ||
    string === undefined ||
    string === null ||
    string === "" ||
    string === "null" ||
    string.replace(/\s/g, "") === "" ||
    !/^\/[\w\-._~!$&'()*+,;=:@/]+\/$/.test(string) // not working correct
  }

  static tagIsEmpty(string) {
    return typeof string !== "string" ||
    string === undefined ||
    string === null ||
    string === "" ||
    string === "null" ||
    string.replace(/\s/g, "") === "" ||
    !/^[a-z](?:-?[a-z]+)*$/.test(string)
  }

  static stringIsEmpty(string) {
    return typeof string !== "string" ||
    string === undefined ||
    string === null ||
    string === "" ||
    string === "null" ||
    string.replace(/\s/g, "") === ""
  }

  static numberIsEmpty(number) {
    return number === undefined ||
    number === null ||
    Number.isNaN(number) ||
    typeof number !== "number" ||
    number === ""
  }

  static booleanIsEmpty(value) {
    return value === undefined ||
    value === null ||
    typeof value !== "boolean"
  }

  static encodeStringToUri(string) {
    return encodeURIComponent(string)
    .replace(/%20/g, "-")
    .replace(/u%CC%88/g, "ue")
    .replace(/a%CC%88/g, "ae")
    .replace(/o%CC%88/g, "oe")
    .replace(/%2F/g, "-")
    .replace(/%C3%A4/g, "ae")
    .replace(/%C3%BC/g, "ue")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/%C3%B6/g, "oe")
    .replace(/%C3%96/g, "Oe")
    .replace(/\./g, "-")
    .replace(/%C3%9F/g, "ss")
    .replace(/%3F/g, "")
    .replace(/-$/g, "")
  }

  static isJson(string) {
    try {
      JSON.parse(string)
      return true
    } catch {
      return false
    }
  }

  static sortedObjectToArray(object) {
    let array = []
    for (let key in object) {
      array.push(object[key])
    }
    return array
  }

  static async digest(message) {
    const data = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  static async fileToArray(file) {
    const fileBuffer = await file.arrayBuffer()
    return Array.from(new Uint8Array(fileBuffer))
  }

}
