export class NumberField {

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
    if (!input.checkValidity()) {
      this.#setNotValidStyle(input)
    }
    if (input.checkValidity()) {
      this.valid = input.checkValidity()
      this.#setValidStyle(input)
    }
    return input
  }

  withValidity() {
    this.#withValidityCalled = true
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

  withSync() {
    const inputs = document.querySelectorAll(this.cssSelectorInput)

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

  storeInputToLocalStorage(storageName) {
    const value = this.#getInput()

    if (value !== undefined) {
      const storage = JSON.parse(window.localStorage.getItem(storageName)) || {}

      storage[this.className] = value

      window.localStorage.setItem(storageName, JSON.stringify(storage))
    }
    return this
  }

  #isValid(input) {
    return input.checkValidity() && input.value !== ""
  }

  #getInput() {
    let value = undefined
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    if (inputs.length === 0) return value
    inputs.forEach(input => {
      if (this.#isValid(input)) {
        value = input.value
      }
    })
    return value
  }

  #setMax(input) {
    input.max = this.max
    return input
  }

  withMax(max) {
    this.max = max
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setMax(input))
    return this
  }

  #setMin(input) {
    input.min = this.min
    return input
  }

  withMin(min) {
    this.min = min
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setMin(input))
    return this
  }

  #setSHSDefaultStyle(input) {
    input.style.border = "none"
    input.style.fontSize = "21px"
    input.style.maxWidth = "144px"
    return input
  }

  withSHSDefaultStyle() {
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setSHSDefaultStyle(input))
    return this
  }

  withPlaceholder(placeholder) {
    this.placeholder = placeholder
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => this.#setPlaceholder(input))
    return this
  }

  #setPlaceholder(input) {
    input.placeholder = this.placeholder
    return input
  }

  constructor(cssSelectorField) {
    this.cssSelectorField = cssSelectorField
    this.className = cssSelectorField.split("=")[1].split("]")[0]
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

      const input = document.createElement("input")
      input.type = "number"
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
