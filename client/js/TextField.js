import { Helper } from "/js/Helper.js"

export class TextField {

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
    if (input.accept === "text/tag") return true
    if (input.accept === "text/hex") return true
    if (input.accept === "text/path") return true
    if (input.accept === "text/id") return true
    if (input.accept === "text/oparator") return true
    return false
  }

  #checkValidity(input) {
    if (input.checkValidity() === false) return false

    if (input.accept === "text/id") {
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

    if (input.accept === "text/operator") {
      if (input.value === "=") return true
      if (input.value === ">=") return true
      if (input.value === "<=") return true
      if (input.value === "!=") return true
      if (input.value === "<") return true
      if (input.value === ">") return true
      return false
    }

    if (input.accept === "text/path") {
      if (typeof input.value !== "string") return false
      if (!input.value.startsWith("/")) return false
      if (input.value === "/") return true
      if (!input.value.endsWith("/")) return false
      if (/^\/[\w\-._~!$&'()*+,;=:@/]+\/$/.test(input.value) === true) return true
      return false
    }

    if (input.accept === "text/hex") {
      if (typeof input.value !== "string") return false
      if (/^[0-9A-Fa-f]+$/.test(input.value) === true) return true
      return false
    }

    if (input.accept === "text/tag") {
      if (typeof input.value !== "string") return false
      input.value = input.value.replace(/ /g, "-")
      if (/^[a-z](?:-?[a-z]+)*$/.test(input.value) === true) return true
      return false
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
      error.field = this.field
      this.field.scrollIntoView({behavior: "smooth"})
      throw error
    }
    Helper.setValidStyle(this.input)
    return this.input.value
  }

  #setText(field) {
    field.innerHTML = ""
    field.classList.add("field")
    field.style.position = "relative"
    field.style.borderRadius = "13px"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.justifyContent = "center"

    field.style.backgroundColor = Helper.colors.light.foreground
    field.style.border = Helper.colors.light.border
    field.style.boxShadow = Helper.colors.light.boxShadow
    field.style.color = Helper.colors.light.text
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      field.style.backgroundColor = Helper.colors.dark.foreground
      field.style.border = Helper.colors.dark.border
      field.style.boxShadow = Helper.colors.dark.boxShadow
      field.style.color = Helper.colors.dark.text
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

    label.style.color = Helper.colors.light.text
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      label.style.color = Helper.colors.dark.text
    }

    this.label = label
    labelContainer.append(label)
    field.append(labelContainer)

    const input = document.createElement("input")
    input.type = this.type
    input.style.margin = "21px 89px 21px 34px"
    input.style.fontSize = "21px"

    input.style.backgroundColor = Helper.colors.light.background
    input.style.color = Helper.colors.light.text
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      input.style.backgroundColor = Helper.colors.dark.background
      input.style.color = Helper.colors.dark.text
    }

    this.input = input
    field.append(input)
    return field
  }

  constructor(name, parent) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name
    this.type = "text"
    this.field = document.createElement("div")
    this.field = this.#setText(this.field)
    if (parent !== undefined) {
      this.parent = parent
      parent.append(this.field)
    }
  }
}
