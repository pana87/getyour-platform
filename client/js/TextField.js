export class TextField {

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
    return input
  }

  #setNotValidStyle(input) {
    input.style.border = "2px solid #d50000"
    input.style.borderRadius = "3px"
    return input
  }

  #setMaxLength(input) {
    input.maxLength = this.maxLength
    return input
  }

  withMaxLength(maxLength) {
    this.maxLength = maxLength
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setMaxLength(input))
    return this
  }

  #setMinLength(input) {
    input.minLength = this.minLength
    return input
  }

  withMinLength(minLength) {
    this.minLength = minLength
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setMinLength(input))
    return this
  }

  #setPattern(input) {
    input.pattern = this.pattern
    return input
  }

  withPattern(pattern) {
    this.pattern = pattern
    document.querySelectorAll(this.inputSelector).forEach(input => this.#setPattern(input))
    return this
  }

  #setRequired(input) {
    input.required = true
    return input
  }

  withRequired() {
    this.required = true
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setRequired(input))
    return this
  }

  #setBackgroundColor(input) {
    input.style.backgroundColor = this.backgroundColor
    return input
  }

  withBackgroundColor(backgroundColor) {
    this.backgroundColor = backgroundColor
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setBackgroundColor(input))
    return this
  }

  withUrlValue() {
    const inputs = document.body.querySelectorAll(this.inputSelector)
    inputs.forEach(input => input.value = encodeURIComponent(input.value).replace(/%20/g, "-"))
    return this
  }

  #isRequired(input) {
    if (input.required === true) return true
    return false
  }

  withValidValue(callback) {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        if (this.#isRequired(input)) {
          if (input.checkValidity()) {
            this.#setValidStyle(input)
            if (callback !== undefined) callback(input.value)
            return resolve(input.value)
          }
          this.#setNotValidStyle(input)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        this.#setValidStyle(input)
        if (callback !== undefined) callback(input.value)
        return resolve(input.value)
      })
    })
  }

  withInputEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
    return this
  }

  #setSync(input) {
    document.body.querySelectorAll(this.inputSelector).forEach(other => other.value = input.value)
    return input
  }

  #setPlaceholder(input) {
    input.placeholder = this.placeholder
    return input
  }

  withPlaceholder(placeholder) {
    this.placeholder = placeholder
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setPlaceholder(input))
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.inputSelector = `input[name='${this.className}']`

    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const input = document.createElement("input")
        input.type = "text"
        input.name = this.className
        input.id = this.className

        div.append(input)
      })
      return
    }
    console.error("FIELD_NOT_FOUND")
  }
}
