import { Helper } from "./Helper.js"

export class NumberField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("change", (event) => callback(event)))
    return this
  }

  withType(callback) {
    document.querySelectorAll(this.inputSelector).forEach(input => {
      input.fromStorage = (name) => {
        const value = JSON.parse(window.localStorage.getItem(name)).value[this.className]
        if (value !== undefined) input.value = value
      }
      callback(input)
    })
    return this
  }

  #isEmpty(value) {
    return value === undefined ||
      value === "" ||
      value.replace(/\s/g, "") === "" ||
      value === null
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

  #isRequired(input) {
    if (input.required === true) return true
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        if (this.#isRequired(input)) {
          if (input.checkValidity()) {
            Helper.setValidStyle(input)
            return resolve(input.value)
          }
          Helper.setNotValidStyle(input)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        Helper.setValidStyle(input)
        return resolve(input.value)
      })
    })
  }

  withInputEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.inputSelector = `input[id='${this.className}']`
    this.type = "number"

    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const input = document.createElement("input")
        input.type = "number"
        input.name = this.className
        input.id = this.className

        div.append(input)
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
