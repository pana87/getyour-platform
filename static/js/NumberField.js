export class NumberField {

  #withMaxCalled = false
  #withMinCalled = false
  #withSHSDefaultCalled = false
  #withPlaceholderCalled = false

  sync() {
    const inputs = document.body.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => {
      input.addEventListener("input", () => {
        inputs.forEach(other => {
          other.value = input.value
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

  #getInput() {
    let value = undefined
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    if (inputs.length === 0) return value
    inputs.forEach(input => {
      if (input.value === "") return value
      value = input.value
    })
    return value
  }


  withMax(max) {
    this.#withMaxCalled = true
    this.max = max
    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendNumberField(div))

    return this
  }

  withMin(min) {
    this.#withMinCalled = true
    this.min = min
    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendNumberField(div))

    return this
  }

  withSHSDefault() {
    this.#withSHSDefaultCalled = true
    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendNumberField(div))

    return this
  }

  #setSHSDefaultStyle(input) {
    input.style.border = "none"
    input.style.fontSize = "24px"
    input.style.maxWidth = "250px"
    return input
  }

  withPlaceholder(placeholder) {
    this.#withPlaceholderCalled = true
    this.placeholder = placeholder
    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendNumberField(div))

    return this
  }

  #numberHandler() {
    const input = document.createElement("input")
    input.type = "number"
    input.name = this.className
    input.id = this.className
    return input
  }

  #setPlaceholder(input) {
    input.placeholder = this.placeholder
    return input
  }

  #setMin(input) {
    input.min = this.min
    return input
  }

  #setMax(input) {
    input.max = this.max
    return input
  }

  #appendNumberField(div) {
    div.innerHTML = ""

    const input = this.#numberHandler()

    if (this.#withMaxCalled === true) {
      this.#setMax(input)
    }
    if (this.#withMinCalled === true) {
      this.#setMin(input)
    }
    if (this.#withPlaceholderCalled === true) {
      this.#setPlaceholder(input)
    }
    if (this.#withSHSDefaultCalled === true) {
      this.#setSHSDefaultStyle(input)
    }

    div.append(input)
  }

  constructor(cssSelectorField) {
    this.cssSelectorField = cssSelectorField
    this.className = cssSelectorField.split("=")[1].split("]")[0]
    this.cssSelectorInput = `input[name='${this.className}']`
    this.min = "0"
    this.max = "0"
    this.placeholder = ""

    const divs = document.querySelectorAll(this.cssSelectorField)

    if (divs.length === 0) {
      return {
        status: 500,
        message: "DIV_NOT_FOUND",
      }
    }

    divs.forEach(div => this.#appendNumberField(div))
  }
}
