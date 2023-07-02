import { Helper } from "/js/Helper.js"

export class CheckboxField {

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
      if (!Helper.stringIsEmpty(callback(this.name))) this.checkbox.checked = callback(this.name)
    }
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

  validValue() {
    if (this.#isRequired(this.checkbox)) {
      if (this.#checkValidity(this.checkbox)) {
        Helper.setValidStyle(this.checkbox)
        return this.checkbox.checked
      }
      Helper.setNotValidStyle(this.checkbox)
      const error = new Error(`field required: '${this.name}'`)
      error.field = this.name
      this.field.scrollIntoView({behavior: "smooth"})
      throw error
    }
    Helper.setValidStyle(this.checkbox)
    return this.checkbox.checked
  }

  verifyValue() {
    if (this.#isRequired(this.checkbox)) {
      if (this.#checkValidity(this.checkbox)) {
        Helper.setValidStyle(this.checkbox)
        return true
      }
      Helper.setNotValidStyle(this.checkbox)
      return false
    }
    Helper.setValidStyle(this.checkbox)
    return true
  }

  #setCheckbox(field) {
    field.innerHTML = ""
    field.classList.add("field")
    field.style.position = "relative"
    field.style.borderRadius = "13px"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.justifyContent = "center"
    field.style.alignItems = "flex-start"

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

    this.label = label
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
    this.checkbox = checkbox
    checkboxContainer.append(checkbox)

    const afterCheckbox = document.createElement("div")
    afterCheckbox.style.fontFamily = "sans-serif"
    afterCheckbox.style.fontSize = "21px"

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      afterCheckbox.style.color = Helper.colors.dark.text
    } else {
      afterCheckbox.style.color = Helper.colors.light.text
    }

    this.afterCheckbox = afterCheckbox
    checkboxContainer.append(afterCheckbox)
    field.append(checkboxContainer)
    return field
  }

  constructor(name, parent) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name
    this.type = "checkbox"
    this.field = document.createElement("div")
    this.field = this.#setCheckbox(this.field)
    if (parent !== undefined) {
      this.parent = parent
      parent.append(this.field)
    }
  }
}
