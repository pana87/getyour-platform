import {Request} from "/js/Request.js"
import {TextField} from "/js/TextField.js"

export class Helper {

  static iconPicker(name) {

    if (name === "loading") {
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"><path d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>`
      const svg = this.convert("text/svg", svgString)
      return svg
    }

    if (name === "smiling-bear") {
      const svgString = `<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19,1a3.976,3.976,0,0,0-3.268,1.729,9.917,9.917,0,0,0-7.464,0,3.984,3.984,0,1,0-5.539,5.54A9.941,9.941,0,0,0,2,12c0,5.192,4.276,11,10,11s10-5.808,10-11a9.941,9.941,0,0,0-.729-3.731A3.984,3.984,0,0,0,19,1ZM3.667,6.478A1.978,1.978,0,0,1,3,5,2,2,0,0,1,5,3a1.978,1.978,0,0,1,1.478.667A10.3,10.3,0,0,0,3.667,6.478ZM12,21c-4.579,0-8-4.751-8-9a8,8,0,0,1,16,0C20,16.249,16.579,21,12,21ZM17.522,3.667A1.978,1.978,0,0,1,19,3a2,2,0,0,1,2,2,1.978,1.978,0,0,1-.667,1.478A10.407,10.407,0,0,0,17.522,3.667ZM16,15.5c0,1.038-.836,3-4,3s-4-1.962-4-3a1,1,0,0,1,2,0c.008.111.109.644,1,.882V15.051L9.617,12.426A.954.954,0,0,1,10.368,11h3.264a.954.954,0,0,1,.751,1.426L13,15.051v1.331c.891-.239.992-.778,1-.911a1.029,1.029,0,0,1,1.032-.952A.984.984,0,0,1,16,15.5Z"/></svg>`
      const svg = this.convert("text/svg", svgString)
      return svg
    }

  }

  static colorPicker(palette, element) {
    const colors = document.createElement("div")
    colors.style.overflowY = "auto"
    colors.style.height = "610px"
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
      dark: {
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
  }

  static convert(event, input) {

    if (event === "text/svg") {
      const container = document.createElement("div")
      // sanatize svg
      container.innerHTML = input
      return container.children[0]
    }


    if (event === "element/alias") {

      const output = document.createElement("div")
      output.innerHTML = `&lt; ${input.tagName.toLowerCase()}`

      if (input.id !== "") {
        const id = document.createElement("span")
        id.style.fontSize = "13px"
        id.innerHTML = `#${input.id}`
        output.append(id)
      }

      if (input.id === "") {
        if (input.getAttribute("data-id") !== null) {
          const id = document.createElement("span")
          id.style.fontSize = "13px"
          id.innerHTML = `#${input.getAttribute("data-id")}`
          output.append(id)
        }
      }

      if (input.classList.length > 0) {

        for (let i = 0; i < input.classList.length; i++) {
          const className = input.classList[i]
          const span = document.createElement("span")
          span.style.fontSize = "13px"
          span.innerHTML = `.${className}`
          output.append(span)
        }

      }

      return output.innerHTML

    }

  }

  static renderBodyButtons(element) {
    element.innerHTML = ""

    for (let i = 0; i < document.body.children.length; i++) {
      const child = document.body.children[i]

      if (child.tagName === "SCRIPT") continue
      if (child.id === "toolbox") continue
      if (child.getAttribute("data-id") === "toolbox") continue
      if (child.id.startsWith("overlay")) continue

      const button = document.createElement("div")
      button.style.display = "flex"
      button.style.flexWrap = "wrap"
      button.style.justifyContent = "space-between"
      button.style.alignItems = "center"
      button.style.margin = "21px 34px"
      button.style.backgroundColor = "rgba(255, 255, 255, 1)"
      button.style.borderRadius = "13px"
      button.style.border = "0.3px solid black"
      button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
      button.style.cursor = "pointer"
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
            header.style.cursor = "pointer"
            header.addEventListener("click", () => this.removeOverlay(overlay))

            const logo = document.createElement("img")
            logo.src = "/public/getyour-logo.svg"
            logo.alt = "Logo"
            logo.style.width = "55px"
            logo.style.margin = "21px 34px"
            header.append(logo)
            const title = document.createElement("div")

            title.innerHTML = this.convert("element/alias", child)

            title.style.fontWeight = "bold"
            title.style.fontFamily = "sans-serif"
            title.style.fontSize = "21px"
            header.append(title)
            overlay.append(header)
          }

          {
            const buttons = document.createElement("div")
            buttons.style.overflowY = "auto"
            buttons.style.paddingBottom = "144px"
            buttons.style.overscrollBehavior = "none"
            overlay.append(buttons)

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
              button.addEventListener("click", () => {

                this.popup(overlay => {
                  overlay.id = "overlay-3"
                  const overlay3 = overlay

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
                    logo.alt = "Getyour"
                    logo.style.width = "55px"
                    logo.style.margin = "21px 34px"
                    header.append(logo)
                    const title = document.createElement("div")
                    title.innerHTML = `Web API`
                    title.style.fontWeight = "bold"
                    title.style.fontSize = "21px"
                    title.style.fontFamily = "sans-serif"
                    header.append(title)
                    overlay.append(header)
                  }

                  {
                    const preview = document.createElement("div")
                    preview.style.minHeight = "233px"
                    preview.style.maxHeight = "233px"
                    preview.style.overflow = "auto"
                    const clone = child.cloneNode(true)
                    clone.id = Date.now()
                    clone.name = `${Date.now()}`
                    preview.append(clone)
                    overlay.append(preview)

                    const text = document.createElement("div")
                    text.innerHTML = "Vorschau"
                    text.style.fontFamily = "sans-serif"
                    text.style.fontSize = "13px"
                    text.style.margin = "0 34px"
                    overlay.append(text)

                    const hr = document.createElement("hr")
                    hr.style.margin = "0 21px"
                    overlay.append(hr)

                    const funnel = document.createElement("div")
                    funnel.style.overflowY = "auto"
                    funnel.style.paddingBottom = "144px"
                    funnel.style.overscrollBehavior = "none"
                    overlay.append(funnel)


                    {
                      const text = document.createElement("div")
                      text.innerHTML = "div.textContent"
                      text.style.fontFamily = "sans-serif"
                      text.style.fontSize = "13px"
                      text.style.margin = "0 34px"
                      funnel.append(text)

                      const hr = document.createElement("hr")
                      hr.style.margin = "0 21px"
                      funnel.append(hr)
                    }

                    const divTextContentField = new TextField("divTextContent", funnel)
                    divTextContentField.label.innerHTML = "Inhalt"
                    divTextContentField.input.addEventListener("input", (event) => {
                      clone.textContent = event.target.value
                      child.textContent = event.target.value
                      divTextContentField.verifyValue()
                    })
                    divTextContentField.value(() => child.textContent)


                    {
                      const text = document.createElement("div")
                      text.innerHTML = "div.style"
                      text.style.fontFamily = "sans-serif"
                      text.style.fontSize = "13px"
                      text.style.margin = "0 34px"
                      funnel.append(text)

                      const hr = document.createElement("hr")
                      hr.style.margin = "0 21px"
                      funnel.append(hr)
                    }

                    const divStylePropertyField = new TextField("divStyleProperty", funnel)
                    divStylePropertyField.label.innerHTML = "CSS Eigenschaft"
                    divStylePropertyField.input.required = true
                    divStylePropertyField.input.addEventListener("input", (event) => {
                      if (event.target.style[event.target.value] !== undefined) {
                        Helper.setValidStyle(event.target)
                      } else {
                        Helper.setNotValidStyle(event.target)
                      }
                    })

                    const divStyleValueField = new TextField("divStyleValue", funnel)
                    divStyleValueField.label.innerHTML = "CSS Wert"
                    divStyleValueField.input.addEventListener("input", () => {
                      divStyleValueField.verifyValue()
                    })


                    {
                      const button = document.createElement("div")
                      button.innerHTML = "CSS anwenden"
                      button.style.backgroundColor = "#f7aa20"
                      button.style.cursor = "pointer"
                      button.style.fontSize = "21px"
                      button.style.fontFamily = "sans-serif"
                      button.style.borderRadius = "13px"
                      button.style.margin = "21px 34px"
                      button.style.display = "flex"
                      button.style.justifyContent = "center"
                      button.style.alignItems = "center"
                      button.style.height = "89px"
                      button.style.color = "#000"
                      button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
                      button.addEventListener("click", () => {

                        try {
                          divStylePropertyField.validValue()
                          if (divStylePropertyField.input.style[divStylePropertyField.input.value] === undefined) throw new Error("css property not found")
                        } catch (error) {
                          alert(`Die CSS Eigenschaft ist ungültig.`)
                          Helper.setNotValidStyle(divStylePropertyField.input)
                          throw error
                        }

                        const cssValue = divStyleValueField.validValue()

                        clone.style[divStylePropertyField.input.value] = cssValue
                        child.style[divStylePropertyField.input.value] = cssValue

                        divStylePropertyField.input.value = ""
                        Helper.setNotValidStyle(divStylePropertyField.input)
                        divStyleValueField.input.value = ""

                      })
                      funnel.append(button)
                    }

                  }


                })
              })

              const icon = document.createElement("img")
              icon.style.margin = "13px 34px"
              icon.style.width = "34px"
              icon.src = "/public/js.svg"
              icon.alt = "JavaScript"
              button.append(icon)

              const title = document.createElement("div")
              title.innerHTML = "Web API"
              title.style.margin = "21px 34px"
              title.style.fontSize = "21px"
              title.style.fontFamily = "sans-serif"
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

              button.addEventListener("click", async () => {

                if (child.getAttribute("data-id") !== null) {
                  document.getElementById(child.getAttribute("data-id")).remove()
                }
                child.remove()
                this.removeOverlay(overlay)
                this.renderBodyButtons(element)

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
              title.style.fontFamily = "sans-serif"
              button.append(title)

              buttons.append(button)
            }

          }


        })

      })

      const left = document.createElement("div")

      left.innerHTML = this.convert("element/alias", child)

      left.style.fontFamily = "sans-serif"
      left.style.margin = "21px 34px"
      left.style.fontSize = "21px"
      button.append(left)
      element.append(button)

      const right = document.createElement("div")
      right.innerHTML = `..`
      right.style.fontFamily = "sans-serif"
      right.style.margin = "21px 34px"
      right.style.fontSize = "21px"
      button.append(right)
      element.append(button)
    }

    return element
  }

  static renderHeadButtons(buttons) {
    buttons.innerHTML = ""

    for (let i = 0; i < document.head.children.length; i++) {
      const child = document.head.children[i]

      if (child.id.startsWith("meta-default")) continue

      const button = document.createElement("div")
      button.style.display = "flex"
      button.style.flexWrap = "wrap"
      button.style.justifyContent = "space-between"
      button.style.alignItems = "center"
      button.style.margin = "21px 34px"
      button.style.backgroundColor = "rgba(255, 255, 255, 1)"
      button.style.borderRadius = "13px"
      button.style.border = "0.3px solid black"
      button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
      button.style.cursor = "pointer"
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
            header.style.cursor = "pointer"
            header.addEventListener("click", () => this.removeOverlay(overlay))

            const logo = document.createElement("img")
            logo.src = "/public/getyour-logo.svg"
            logo.alt = "Logo"
            logo.style.width = "55px"
            logo.style.margin = "21px 34px"
            header.append(logo)
            const title = document.createElement("div")
            title.innerHTML = `&lt; ${child.tagName.toLowerCase()} ..`
            title.style.fontWeight = "bold"
            title.style.fontFamily = "sans-serif"
            title.style.fontSize = "21px"
            header.append(title)
            overlay.append(header)
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

            button.addEventListener("click", async () => {
              child.remove()
              this.removeOverlay(overlay)
              this.renderHeadButtons(buttons)
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
            title.style.fontFamily = "sans-serif"
            button.append(title)

            overlay.append(button)
          }

        })

      })

      const left = document.createElement("div")
      left.innerHTML = `&lt; ${child.tagName.toLowerCase()}`
      left.style.fontFamily = "sans-serif"
      left.style.margin = "21px 34px"
      left.style.fontSize = "21px"
      button.append(left)
      buttons.append(button)

      const right = document.createElement("div")
      right.innerHTML = `..`
      right.style.fontFamily = "sans-serif"
      right.style.margin = "21px 34px"
      right.style.fontSize = "21px"
      button.append(right)
      buttons.append(button)
    }

    return buttons
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
        Helper.popup(overlay => {


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
          header.addEventListener("click", () => Helper.removeOverlay(overlay))

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
                const securityOverlay = Helper.addOverlay()
                Helper.setWaitCursor()
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
                Helper.removeOverlay(securityOverlay)
                Helper.removeOverlay(overlay)
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

  static convertImageFileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener("loadend", () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const image = document.createElement("img")
        image.src = reader.result
        image.onload = () => {
          const width = 377
          const height = 377 * image.height / image.width
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
    // document.body.style.position = "static"
    overlay.remove()
  }

  static popup(callback) {
    if (callback !== undefined) {
      const overlay = document.createElement("div")

      // mobile issues
      overlay.style.height = "100%"
      overlay.style.overscrollBehavior = "none"
      document.body.style.overscrollBehavior = "none"

      overlay.style.width = "100%"
      overlay.style.zIndex = "1"
      overlay.style.position = "fixed"
      overlay.style.top = "0"
      overlay.style.left = "0"
      overlay.style.background = "white"
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

  static setOffer(offer) {
    if (offer !== undefined) {
      const offers = JSON.parse(window.localStorage.getItem("offers")) || []

      if (offers.length === 0) {
        offers.push(offer)
        window.localStorage.setItem("offers", JSON.stringify(offers))
      }

      for (let i = 0; i < offers.length; i++) {
        if (offers[i].storage === offer.storage) {
          offers[i] = offer
          window.localStorage.setItem("offers", JSON.stringify(offers))
        }
      }
    }
  }

  static setFunnel(funnel) {
    if (funnel !== undefined) {
      const funnels = JSON.parse(window.localStorage.getItem("funnels")) || []

      if (funnels.length === 0) {
        funnels.push(funnel)
        window.localStorage.setItem("funnels", JSON.stringify(funnels))
      }

      for (let i = 0; i < funnels.length; i++) {
        if (funnels[i].storage === funnel.storage) {
          funnels[i] = funnel
          window.localStorage.setItem("funnels", JSON.stringify(funnels))
        }
      }
    }
  }

  static findOffer(predicate) {
    if (predicate !== undefined) {
      const offers = JSON.parse(window.localStorage.getItem("offers"))
      for (let i = 0; i < offers.length; i++) {
        if (predicate(offers[i])) {
          return offers[i]
        }
      }
    }
  }

  static findFunnel(predicate) {
    if (predicate !== undefined) {
      const funnels = JSON.parse(window.localStorage.getItem("funnels")) || []
      for (let i = 0; i < funnels.length; i++) {
        if (predicate(funnels[i])) {
          return funnels[i]
        }
      }
    }
  }

  static setDefaultCursor() {
    document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "default")
  }

  static setWaitCursor() {
    document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "wait")
  }

  static setNotAllowedCursor() {
    document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "not-allowed")
  }

  static addOverlay() {
    const overlay = document.createElement("div")
    overlay.classList.add("security-overlay")
    overlay.style.width = "100vw"
    overlay.style.height = "100vh"
    overlay.style.backgroundColor = "black"
    overlay.style.display = "flex"
    overlay.style.justifyContent = "center"
    overlay.style.alignItems = "center"
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.opacity = "0.9"
    overlay.style.zIndex = "10"
    overlay.style.color = "red"

    const loadingImage = document.createElement("img")
    loadingImage.src = "/public/load-animation.svg"
    loadingImage.alt = "Bitte warten.."
    overlay.append(loadingImage)

    document.body.append(overlay)
    return overlay
  }

  static async redirectUser(event) {
    const redirectUser = {}
    redirectUser.url = "/consumer/closed/"
    redirectUser.method = "redirect"
    redirectUser.type = "user"
    redirectUser.event = event
    redirectUser.referer = document.referrer
    redirectUser.location = window.location.href
    redirectUser.email = await Request.email()
    redirectUser.localStorageId = await Request.localStorageId()
    const res = await Request.middleware(redirectUser)
    if (res.status === 200) return window.location.assign(res.response)
    else return window.history.back()
  }

  static millisToDateString(milliseconds) {
    const date = new Date(milliseconds)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    return `${day}.${month}.${year}`
  }

  static setNotValidStyle(element) {
    element.style.border = "2px solid #d50000"
    if (element.type === "checkbox") {
      element.style.outline = "2px solid #d50000"
    }
    element.style.borderRadius = "3px"
    const signs = element.parentNode.querySelectorAll("div[id='sign']")
    if (signs.length === 0) {
      const sign = document.createElement("div")
      sign.id = "sign"
      sign.innerHTML = "x"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = "#d50000"
      sign.style.fontSize = "34px"
      sign.style.fontFamily = "sans-serif"
      element.parentNode.append(sign)
      return element
    }
    if (signs.length > 0) {
      signs.forEach(sign => sign.remove())
      const sign = document.createElement("div")
      sign.id = "sign"
      sign.innerHTML = "x"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = "#d50000"
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
    const signs = element.parentNode.querySelectorAll("div[id='sign']")
    if (signs.length === 0) {
      const sign = document.createElement("div")
      sign.id = "sign"
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
      sign.id = "sign"
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

  static stringIsEmpty(string) {
    return typeof string !== "string" ||
    string === undefined ||
    string === null ||
    string === "" ||
    string.replace(/\s/g, "") === ""
  }

  static numberIsEmpty(number) {
    return number === undefined ||
    number === null ||
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
