import { Helper } from "/js/Helper.js"

export class CheckboxField {

  withIcon(callback) {
    if (callback !== undefined) document.querySelectorAll(this.iconSelector).forEach(icon => callback(icon))
    return this
  }

  withField(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(field => callback(field))
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(checkbox => callback(checkbox))
    return this
  }

  withLabel(callback) {
    if (callback !== undefined) document.querySelectorAll(this.labelSelector).forEach(label => callback(label))
    return this
  }

  withAfterCheckbox(callback) {
    if (callback !== undefined) document.querySelectorAll(`.after-checkbox-${this.name}`).forEach(after => callback(after))
    return this
  }

  onInfoClick(callback) {
    if (callback !== undefined) document.querySelectorAll(`.label-container-${this.name}`).forEach(info => {
      info.style.cursor = "pointer"
      info.childNodes.forEach(child => child.style.cursor = "pointer")
      info.addEventListener("click", callback)
    })
    return this
  }

  onChange(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(checkbox => checkbox.addEventListener("change", (event) => callback(event)))
    return this
  }

  onInput(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(checkbox => checkbox.addEventListener("input", (event) => callback(event)))
    return this
  }

  #isRequired(box) {
    if (box.required === true) return true
    return false
  }

  #checkValidity(input) {
    const value = input.checked
    if (typeof value !== "boolean") return false
    if (value === false) return false
    if (value === undefined) return false
    if (value === null) return false
    return true
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(box => {
        if (this.#isRequired(box)) {
          if (this.#checkValidity(box)) {
            Helper.setValidStyle(box)
            return resolve(box.checked)
          }
          Helper.setNotValidStyle(box)
          const error = new Error(`field required: '${this.name}'`)
          error.fieldName = this.name
          return reject(error)
        }
        Helper.setValidStyle(box)
        return resolve(box.checked)
      })
    })
  }

  fromStorage(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => {
      if (callback(this.name) !== undefined) input.checked = callback(this.name)
    })
    return this
  }

  async withStorage(callback) {
    if (callback !== undefined) {
      const value = await this.withValidValue()
      if (!Helper.booleanIsEmpty(value)) callback(value)
    }
    return this
  }

  #setCheckbox(field) {
    field.innerHTML = ""
    field.id = this.name
    field.classList.add(this.name)
    field.style.position = "relative"
    field.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
    field.style.borderRadius = "13px"
    field.style.border = "0.3px solid black"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
    field.style.justifyContent = "center"
    field.style.alignItems = "flex-start"

    const labelContainer = document.createElement("div")
    labelContainer.classList.add(`label-container-${this.name}`)
    labelContainer.style.display = "flex"
    labelContainer.style.alignItems = "center"
    labelContainer.style.margin = "21px 89px 0 34px"

    const info = document.createElement("img")
    info.classList.add(this.name)
    info.src = "/public/info-gray.svg"
    info.alt = "Info"
    info.style.width = "34px"
    info.style.marginRight = "21px"
    labelContainer.append(info)

    const label = document.createElement("label")
    label.classList.add(this.name)
    label.style.color = "#707070"
    label.style.fontSize = "21px"
    labelContainer.append(label)
    field.append(labelContainer)

    const checkboxContainer = document.createElement("div")
    checkboxContainer.style.display = "flex"
    checkboxContainer.style.alignItems = "center"
    checkboxContainer.style.margin = "21px 89px 21px 34px"

    const checkbox = document.createElement("input")
    checkbox.classList.add(this.name)
    checkbox.type = this.type
    checkbox.style.marginRight = "34px"
    checkbox.style.width = "21px"
    checkbox.style.height = "21px"
    checkboxContainer.append(checkbox)

    const afterCheckbox = document.createElement("div")
    afterCheckbox.classList.add(`after-checkbox-${this.name}`)
    afterCheckbox.style.fontSize = "21px"
    checkboxContainer.append(afterCheckbox)
    field.append(checkboxContainer)
    return field
  }

  constructor(name, parent) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name

    this.field = document.createElement("div")
    this.field = this.#setCheckbox(this.field)
    if (parent !== undefined) parent.append(this.field)

    this.fieldSelector = `div[class='${this.name}']`
    this.inputSelector = `input[class='${this.name}']`
    this.labelSelector = `label[class='${this.name}']`
    this.iconSelector = `img[class='${this.name}']`
    this.type = "checkbox"
    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    for (let i = 0; i < this.fields.length; i++) {
      this.#setCheckbox(this.fields[i])
    }
  }
}
