import { Helper } from "/js/Helper.js"

export class TextAreaField {

  withInfoClick(callback) {
    if (callback !== undefined) {
      this.icon.src = "/public/info-gray.svg"
      this.icon.alt = "Mehr Infos"
      this.icon.style.display = "block"
      this.labelContainer.style.cursor = "pointer"
      this.labelContainer.childNodes.forEach(child => child.style.cursor = "pointer")
      this.labelContainer.addEventListener("click", callback)
    }
    return this
  }

  value(callback) {
    if (callback !== undefined) {
      if (!Helper.stringIsEmpty(callback(this.name))) this.input.value = callback(this.name)
    }
    return this
  }

  #isRequired(input) {
    if (input.required === true) return true
    if (input.accept === "string/array") return true
    if (input.accept === "email/array") return true
    return false
  }

  #checkValidity(input) {
    if (input.checkValidity() === false) return false
    if (input.accept === "email/array") {

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
    if (input.accept === "string/array") {

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
    return true
  }

  verifyValue() {
    if (this.#isRequired(this.input)) {
      if (this.#checkValidity(this.input)) {
        Helper.setValidStyle(this.input)
        return true
      }
      Helper.setNotValidStyle(this.input)
      return false
    }
    Helper.setValidStyle(this.input)
    return true
  }

  validValue() {
    if (this.#isRequired(this.input)) {
      if (this.#checkValidity(this.input)) {
        Helper.setValidStyle(this.input)
        return this.input.value
      }
      Helper.setNotValidStyle(this.input)
      const error = new Error(`field required: '${this.name}'`)
      error.field = this.name
      this.field.scrollIntoView({behavior: "smooth"})
      throw error
    }
    Helper.setValidStyle(this.input)
    return this.input.value
  }

  #setTextArea(field) {
    field.innerHTML = ""
    field.classList.add("field")
    field.style.position = "relative"
    field.style.borderRadius = "13px"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.justifyContent = "center"

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      field.style.backgroundColor = Helper.colors.dark.foreground
      field.style.border = Helper.colors.dark.border
      field.style.boxShadow = Helper.colors.dark.boxShadow
      field.style.color = Helper.colors.dark.text
    } else {
      field.style.backgroundColor = Helper.colors.light.foreground
      field.style.border = Helper.colors.light.border
      field.style.boxShadow = Helper.colors.light.boxShadow
      field.style.color = Helper.colors.light.text
    }

    const labelContainer = document.createElement("div")
    labelContainer.style.display = "flex"
    labelContainer.style.alignItems = "center"
    labelContainer.style.margin = "21px 89px 0 34px"
    this.labelContainer = labelContainer

    const icon = document.createElement("img")
    icon.style.width = "34px"
    icon.style.marginRight = "21px"
    icon.style.display = "none"
    this.icon = icon
    labelContainer.append(icon)

    const label = document.createElement("label")
    label.style.fontFamily = "sans-serif"
    label.style.fontSize = "21px"

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      label.style.color = Helper.colors.dark.text
    } else {
      label.style.color = Helper.colors.light.text
    }


    labelContainer.append(label)
    this.label = label
    field.append(labelContainer)

    const input = document.createElement("textarea")
    input.style.margin = "21px 89px 21px 34px"

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      input.style.backgroundColor = Helper.colors.dark.background
      input.style.color = Helper.colors.dark.text
    } else {
      input.style.backgroundColor = Helper.colors.light.background
      input.style.color = Helper.colors.light.text
    }

    this.input = input
    field.append(input)
    return field
  }

  constructor(name, parent) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name
    this.type = "textarea"
    this.field = document.createElement("div")
    this.field = this.#setTextArea(this.field)
    if (parent !== undefined) {
      this.parent = parent
      parent.append(this.field)
    }
  }
}
