import { Helper } from "./Helper.js"

export class CheckboxField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.checkboxSelector).forEach(box => box.addEventListener("change", (event) => callback(event)))
    return this
  }

  withInputEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.checkboxSelector).forEach(box => box.addEventListener("input", (event) => callback(event)))
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.checkboxSelector).forEach(checkbox => {
      checkbox.fromStorage = (name) => {
        const value = JSON.parse(window.localStorage.getItem(name)).value[this.className]
        if (value !== undefined) checkbox.checked = value
      }
      callback(checkbox)
    })
    return this
  }

  #isRequired(box) {
    if (box.required === true) return true
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.checkboxSelector).forEach(box => {
        if (this.#isRequired(box)) {
          if (box.checked) {
            Helper.setValidStyle(box)
            return resolve(box.checked)
          }
          Helper.setNotValidStyle(box)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        Helper.setValidStyle(box)
        return resolve(box.checked)
      })
    })
  }

  #isEmpty(value) {
    return value === undefined ||
      value === null ||
      typeof value !== "boolean"
  }

  async withStorage(name) {
    try {
      this.storageName = name
      const value = await this.withValidValue()
      if (!this.#isEmpty(value)) {
        const storage = JSON.parse(window.localStorage.getItem(this.storageName))
        storage.value[this.className] = value
        window.localStorage.setItem(this.storageName, JSON.stringify(storage))
      }
    } catch (error) {
      console.error(error)
    }
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.checkboxSelector = `input[id='${this.className}']`
    this.type = "checkbox"

    const divs = document.body.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.id = this.className
        checkbox.name = this.className

        div.append(checkbox)
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
