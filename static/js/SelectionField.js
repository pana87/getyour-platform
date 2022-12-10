export class SelectionField {

  #withOptionsCalled = false
  #withSHSDefaultCalled = false

  sync() {
    const inputs = document.body.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => {
      input.addEventListener("change", () => {
        inputs.forEach(other => {
          other.value = input.value
          other.text = input.text
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
    let value
    const inputs = document.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => value = input.value)
    return value
  }

  withOptions(options) {
    this.#withOptionsCalled = true
    this.options = options

    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendSelectionField(div))

    return this
  }

  withSHSDefault() {
    this.#withSHSDefaultCalled = true
    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendSelectionField(div))

    return this
  }

  #shsDefaultStyle(select) {
    select.style.width = "100%"
    select.style.fontSize = "24px"
    select.style.backgroundColor = "white"
    select.style.border = "none"
    select.style.cursor = "pointer"
    return select
  }

  #selectionHandler() {
    const select = document.createElement("select")
    select.id = this.className
    select.name = this.className
    return select
  }

  #optionsHandler(options, select) {
    for (let i = 0; i < options.length; i++) {
      const option = document.createElement("option")
      option.value = options[i]
      option.text = options[i]
      select.appendChild(option)
    }
  }

  #appendSelectionField(div) {
    div.innerHTML = ""
    const select = this.#selectionHandler()
    if (this.#withSHSDefaultCalled === true) {
      this.#shsDefaultStyle(select)
    }
    div.appendChild(select)
    if (this.#withOptionsCalled === true) {
      this.#optionsHandler(this.options, select)
    }
    div.append(select)
  }

  constructor(cssSelectorField) {
    this.cssSelectorField = cssSelectorField
    this.className = this.cssSelectorField.split("=")[1].split("]")[0]
    this.cssSelectorInput = `select[name='${this.className}']`
    this.options = []

    const divs = document.body.querySelectorAll(this.cssSelectorField)

    if (divs.length === 0) {
      return {
        status: 500,
        message: "DIV_NOT_FOUND",
      }
    }

    divs.forEach(div => this.#appendSelectionField(div))
  }
}
