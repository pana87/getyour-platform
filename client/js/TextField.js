export class TextField {

  #withValidityCalled = false

  #setNoStyle(input) {
    input.removeAttribute("style")
    return input
  }

  withNoStyle() {
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setNoStyle(input))
    return this
  }

  #setValidStyle(input) {
    input.style.borderBottom = "1px solid green"
    return input
  }

  #setNotValidStyle(input) {
    input.style.borderBottom = "1px solid red"
    return input
  }

  withValidStyle() {
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setValidStyle(input))
    return this
  }

  withNotValidStyle() {
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setNotValidStyle(input))
    return this
  }

  #setValidity(input) {
    if (!this.#isValid(input)) {
      this.#setNotValidStyle(input)
    }
    if (this.#isValid(input)) {
      this.valid = true
      this.#setValidStyle(input)
    }
    return input
  }

  withValidity() {
    this.#withValidityCalled = true
    return this
  }

  #setMaxLength(input) {
    input.maxLength = this.maxLength
    return input
  }

  withMaxLength(maxLength) {
    this.maxLength = maxLength
    const inputs = document.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => {
      this.#setMaxLength(input)
    })
    return this
  }

  #setMinLength(input) {
    input.minLength = this.minLength
    return input
  }

  withMinLength(minLength) {
    this.minLength = minLength
    const inputs = document.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => {
      this.#setMinLength(input)
    })
    return this
  }

  #setPattern(input) {
    input.pattern = this.pattern
    return input
  }

  withPattern(pattern) {
    this.pattern = pattern
    const inputs = document.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => {
      this.#setPattern(input)
    })
    return this
  }

  #setRequired(input) {
    input.required = true
    return input
  }

  withRequired() {
    this.required = true
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setRequired(input))
    return this
  }

  withBackgroundColor(backgroundColor) {
    this.backgroundColor = backgroundColor
    const inputs = document.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => {
      this.#setBackgroundColor(input)
    })
    return this
  }

  #setBackgroundColor(input) {
    input.style.backgroundColor = this.backgroundColor
    return input
  }

  #getInput() {
    let value = undefined
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => {
      if (this.#isValid(input)) {
        value = input.value
      }
    })
    return value
  }

  storeInputToLocalStorage(storageName) {
    const value = this.#getInput()

    if (value !== undefined) {
      const storage = JSON.parse(window.localStorage.getItem(storageName)) || {}

      storage[this.className] = value

      window.localStorage.setItem(storageName, JSON.stringify(storage))
      return this
    }
    return this
  }

  #isValid(input) {
    return input.checkValidity() &&
      input.value !== undefined &&
      input.value.replace(/\s/g,"") !== ""
  }

  withSync() {
    const inputs = document.body.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        if (this.#withValidityCalled === true) {
          this.#setValidity(input)
        }
        inputs.forEach(other => {
          other.value = input.value

          if (this.#isValid(other)) this.value = other.value
        })
      })
    })
    return this
  }

  withPlaceholder(placeholder) {
    this.placeholder = placeholder
    const inputs = document.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => {
      this.#setPlaceholder(input)
    })
    return this
  }

  #setPlaceholder(input) {
    input.placeholder = this.placeholder
    return input
  }

  #setSHSDefaultStyle(input) {
    input.style.border = "none"
    input.style.fontSize = "24px"
    input.style.maxWidth = "250px"
    return input
  }

  withSHSDefaultStyle() {
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setSHSDefaultStyle(input))
    return this
  }

  constructor(cssSelectorField) {
    this.cssSelectorField = cssSelectorField
    this.className = this.cssSelectorField.split("=")[1].split("]")[0]
    this.cssSelectorInput = `input[name='${this.className}']`

    const divs = document.querySelectorAll(this.cssSelectorField)
    if (divs.length === 0) {
      return {
        status: 500,
        message: "DIV_NOT_FOUND",
      }
    }

    divs.forEach(div => {
      div.innerHTML = ""

      let input = document.createElement("input")
      input.type = "text"
      input.name = this.className
      input.id = this.className

      div.append(input)
    })

    const inputs = document.querySelectorAll(this.cssSelectorInput)
    if (inputs.length === 0) {
      return {
        status: 500,
        message: "INPUT_NOT_FOUND",
      }
    }
  }
}
