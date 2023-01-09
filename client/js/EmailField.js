export class EmailField {

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

  withBackgroundColor(backgroundColor) {
    this.backgroundColor = backgroundColor
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setBackgroundColor(input))
    return this
  }

  #setBackgroundColor(input) {
    input.style.backgroundColor = this.backgroundColor
    return input
  }

  get value() {
    let result = undefined
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => result = input.value)
    return result
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

  withValidValue(callback) {
    document.querySelectorAll(this.inputSelector).forEach(input => {
      if (this.checkValidity(input)) {
        this.#setValidStyle(input)
        if (callback !== undefined) {
          callback(input.value)
        }
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

  #setSync(input) {
    const inputs = document.body.querySelectorAll(this.inputSelector)
    inputs.forEach(other => other.value = input.value)
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

  #setSHSDefaultStyle(input) {
    input.style.border = "none"
    input.style.fontSize = "24px"
    input.style.maxWidth = "250px"
    return input
  }

  withSHSDefaultStyle() {
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setSHSDefaultStyle(input))
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.inputSelector = `input[name='${this.className}']`

    const divs = document.querySelectorAll(this.fieldSelector)

    if (divs.length === 0) {
      console.warn(`Field with class '${this.className}' not found.`)
      return
    }

    divs.forEach(div => {
      div.innerHTML = ""

      let input = document.createElement("input")
      input.type = "email"
      input.name = this.className
      input.id = this.className

      div.append(input)
    })
  }
}
