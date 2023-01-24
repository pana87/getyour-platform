export class TextAreaField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("change", (event) => callback(event)))
    return this
  }

  withInput(callback) {
    document.querySelectorAll(this.inputSelector).forEach(input => callback(input))
    return this
  }

  #isEmpty(value) {
    return value === undefined ||
      value === "" ||
      value.replace(/\s/g, "") === "" ||
      value === null
  }

  async withStorage(name) {
    this.storageName = name
    await this.withValidValue((value) => {
      if (!this.#isEmpty(value)) {
        this.storage = JSON.parse(window.sessionStorage.getItem(this.storageName)) || {}
        this.storage[this.className] = value
        window.sessionStorage.setItem(this.storageName, JSON.stringify(this.storage))
      }
    })
    return this
  }

  #setNoStyle(input) {
    input.removeAttribute("style")
    return input
  }

  withNoStyle() {
    document.querySelectorAll(this.inputSelector).forEach(input => this.#setNoStyle(input))
    return this
  }

  #setValidStyle(input) {
    input.style.border = "2px solid #00c853"
    input.style.borderRadius = "3px"
    input.style.width = "100%"
    input.style.height = "100%"
    return input
  }

  #setNotValidStyle(input) {
    input.style.border = "2px solid #d50000"
    input.style.borderRadius = "3px"
    input.style.width = "100%"
    input.style.height = "100%"
    return input
  }

  #isRequired(input) {
    if (input.disabled === true) return false
    if (input.required !== true) return false
    return true
  }

  withValidValue(callback) {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        if (this.#isRequired(input)) {
          if (input.checkValidity()) {
            this.#setValidStyle(input)
            if (callback) callback(input.value)
            return resolve()
          }
          this.#setNotValidStyle(input)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        this.#setValidStyle(input)
        if (callback) callback(input.value)
        return resolve()
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
    this.inputSelector = `textarea[name='${this.className}']`

    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const textarea = document.createElement("textarea")
        textarea.name = this.className
        textarea.id = this.className

        div.append(textarea)
      })
      return
    }
    console.error(`class='${this.className}' - not found`)
  }
}
