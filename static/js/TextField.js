export class TextField {

  #withPlaceholderCalled = false
  #withSHSDefaultCalled = false
  #withBackgroundColorCalled = false

  withBackgroundColor(backgroundColor) {
    this.#withBackgroundColorCalled = true
    this.backgroundColor = backgroundColor

    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendTextField(div))

    return this
  }

  #setBackgroundColor(input) {
    input.style.backgroundColor = this.backgroundColor
    this.input = input
  }

  #getInput() {
    let value = undefined
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => {
      if (input.value !== "") {
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
    }
    return this
  }

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


  withPlaceholder(placeholder) {
    this.#withPlaceholderCalled = true
    this.placeholder = placeholder
    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendTextField(div))

    return this
  }

  #setPlaceholder(input) {
    input.placeholder = this.placeholder
    this.input = input
  }

  #setSHSDefaultStyle(input) {
    input.style.border = "none"
    input.style.fontSize = "24px"
    input.style.maxWidth = "250px"
    this.input = input
  }

  withSHSDefault() {
    this.#withSHSDefaultCalled = true
    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendTextField(div))

    return this
  }

  #inputHandler() {
    const input = document.createElement("input")
    input.type = "text"
    input.name = this.className
    input.id = this.className
    return input
  }

  #appendTextField(div) {
    div.innerHTML = ""
    this.input = this.#inputHandler()
    if (this.#withBackgroundColorCalled === true) {
      this.#setBackgroundColor(this.input)
    }
    if (this.#withSHSDefaultCalled === true) {
      this.#setSHSDefaultStyle(this.input)
    }
    if (this.#withPlaceholderCalled === true) {
      this.#setPlaceholder(this.input)
    }
    div.append(this.input)
  }

  constructor(cssSelectorField) {
    this.cssSelectorField = cssSelectorField
    this.className = this.cssSelectorField.split("=")[1].split("]")[0]
    this.cssSelectorInput = `input[name='${this.className}']`
    this.input = document.createElement("input")
    this.placeholder = ""
    this.backgroundColor = ""

    const divs = document.querySelectorAll(cssSelectorField)

    if (divs.length === 0) {
      return {
        status: 500,
        message: "DIV_NOT_FOUND",
      }
    }

    divs.forEach(div => this.#appendTextField(div))
  }
}
