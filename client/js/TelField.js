import { Helper } from "/js/Helper.js"

export class TelField {

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

  value(callback) {
    if (callback !== undefined) {
      if (!Helper.stringIsEmpty(callback(this.name))) this.input.value = callback(this.name)
    }
    return this
  }

  #isRequired(input) {
    if (input.required === true) return true
    if (input.accept === "text/phone") return true
    return false
  }

  #checkValidity(input) {
    if (input.checkValidity() === false) return false

    if (input.accept === "text/phone") {
      if (typeof input.value !== "string") return false
      if (/^\+[0-9]+$/.test(input.value) === true) return true
      return false
    }

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
      error.fieldName = this.name
      throw new Error(error)
    }
    Helper.setValidStyle(this.input)
    return this.input.value
  }

  #setTel(field) {
    field.innerHTML = ""
    field.id = this.name
    field.style.position = "relative"
    field.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
    field.style.borderRadius = "13px"
    field.style.border = "0.3px solid black"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
    field.style.justifyContent = "center"

    const labelContainer = document.createElement("div")
    labelContainer.classList.add(`label-container-${this.name}`)
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
    label.classList.add(this.name)
    label.style.color = "#707070"
    label.style.fontSize = "21px"
    this.label = label
    labelContainer.append(label)
    field.append(labelContainer)

    const input = document.createElement("input")
    input.classList.add(this.name)
    input.type = this.type
    input.style.margin = "21px 89px 21px 34px"
    input.style.fontSize = "21px"
    this.input = input
    field.append(input)
    return field
  }

  constructor(name, parent) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name
    this.type = "tel"
    this.field = document.createElement("div")
    this.field = this.#setTel(this.field)
    if (parent !== undefined) {
      this.parent = parent
      parent.append(this.field)
    }
  }
}
