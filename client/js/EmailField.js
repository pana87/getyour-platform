import { Helper } from "./Helper.js"

export class EmailField {

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => {
      input.fromStorage = (name) => {
        if (name === this.type) {
          const value = JSON.parse(window.localStorage.getItem(name))
          if (value !== undefined) input.value = value
        }
        if (name === "shsFunnel") {
          const value = JSON.parse(window.localStorage.getItem(name)).value[this.className]
          if (value !== undefined) input.value = value
        }
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

        if (name === this.type) {
          window.localStorage.setItem(this.storageName, JSON.stringify(value))
          return this
        }

        if (name === "shsFunnel") {
          const storage = JSON.parse(window.localStorage.getItem(this.storageName))
          storage.value[this.className] = value
          window.localStorage.setItem(this.storageName, JSON.stringify(storage))
        }

        return this
      }
    } catch (error) {
      console.error(error)
    }
    return new Error(`class='${this.className}' - storage failed`)
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
    this.type = "email"

    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        let input = document.createElement("input")
        input.type = "email"
        input.name = this.className
        input.id = this.className

        div.append(input)
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
