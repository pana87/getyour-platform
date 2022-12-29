export class PasswordField {

  #setNoStyle(input) {
    input.removeAttribute("style")
    return input
  }

  withNoStyle() {
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setNoStyle(input))
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
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setPattern(input))
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

  get value() {
    let result = undefined
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => result = input.value)
    return result
  }

  withUrlValue() {
    const inputs = document.body.querySelectorAll(this.inputSelector)
    inputs.forEach(input => input.value = encodeURIComponent(input.value).replace(/%20/g, "-"))
    return this
  }

  isEmpty(value) {
    return value.replace(/\s/g,"") === ""
  }

  isUndefined(value) {
    return value === undefined
  }

  checkValidity(input) {
    return input.checkValidity() &&
      !this.isEmpty(input.value) &&
      !this.isUndefined(input.value)
  }

  withValidStyle() {
    document.querySelectorAll(this.inputSelector).forEach(input => {
      if (this.checkValidity(input)) {
        this.#setValidStyle(input)
        return
      }
      this.#setNotValidStyle(input)
    })
    return this
  }

  withValidValue(callback) {
    document.querySelectorAll(this.inputSelector).forEach(input => {
      if (this.checkValidity(input)) {
        this.#setValidStyle(input)
        callback(input.value)
        return
      }
      this.#setNotValidStyle(input)
      console.error("VALUE_NOT_VALID")
    })
    return this
  }

  withInputEventListener(callback) {
    const inputs = document.body.querySelectorAll(this.inputSelector)
    inputs.forEach(input => input.addEventListener("input", (event) => callback(event)))
    return this
  }

  syncFields(input) {
    document.body.querySelectorAll(this.inputSelector).forEach(other => other.value = input.value)
  }

  withPlaceholder(placeholder) {
    this.placeholder = placeholder
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setPlaceholder(input))
    return this
  }

  #setPlaceholder(input) {
    input.placeholder = this.placeholder
    return input
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.inputSelector = `input[id='${this.className}']`

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
    console.error("FIELD_NOT_FOUND")
  }
}
