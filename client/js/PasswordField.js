import { Helper } from "./Helper.js"

export class PasswordField {

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => {
      input.fromStorage = (name) => {}
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
        const hash = await Helper.digest(value)
        const storage = JSON.parse(window.localStorage.getItem(this.storageName))
        storage.value[this.className] = hash
        window.localStorage.setItem(this.storageName, JSON.stringify(storage))
      }
    } catch (error) {
      console.error(error)
    }
    return this
  }

  #isValid(input) {
    return input.checkValidity() &&
      input.value.length >= input.minLength
  }

  #isRequired(input) {
    if (input.required === true) return true
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        if (this.#isRequired(input)) {
          if (this.#isValid(input)) {
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
    this.type = "password"

    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const input = document.createElement("input")
        input.type = "password"
        input.name = this.className
        input.id = this.className

        div.append(input)
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
