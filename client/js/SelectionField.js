export class SelectionField {

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
    const inputs = document.body.querySelectorAll(this.cssSelectorInput)

    inputs.forEach(input => {
      input.addEventListener("input", () => {
        inputs.forEach(other => {
          other.value = input.value
          other.text = input.text

          if (this.#isValid(other)) {
            this.value = other.value
            this.text = other.text
          }
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
    return input.checkValidity()
  }

  #getInput() {
    let value
    const selects = document.querySelectorAll(this.cssSelectorInput)

    selects.forEach(select => {
      if (this.#isValid(select)) {
        value = select.value
      }
    })
    return value
  }

  #setOptions(input) {
    for (let i = 0; i < this.options.length; i++) {
      const option = document.createElement("option")
      option.value = this.options[i]
      option.text = this.options[i]
      input.appendChild(option)
    }
    return input
  }

  withOptions(options) {
    this.options = options
    const selects = document.querySelectorAll(this.cssSelectorInput)
    selects.forEach(select => this.#setOptions(select))
    return this
  }

  withSHSDefaultStyle() {
    const selects = document.querySelectorAll(this.cssSelectorInput)
    selects.forEach(select => {
      this.#setSHSDefaultStyle(select)
    })
    return this
  }

  #setSHSDefaultStyle(select) {
    select.style.width = "100%"
    select.style.fontSize = "24px"
    select.style.backgroundColor = "white"
    select.style.border = "none"
    select.style.cursor = "pointer"
    return select
  }

  constructor(cssSelectorField) {
    this.cssSelectorField = cssSelectorField
    this.className = this.cssSelectorField.split("=")[1].split("]")[0]
    this.cssSelectorInput = `select[name='${this.className}']`
    this.options = []
    this.required = false

    const divs = document.body.querySelectorAll(this.cssSelectorField)
    if (divs.length === 0) {
      return {
        status: 500,
        message: "DIV_NOT_FOUND",
      }
    }

    divs.forEach(div => {
      div.innerHTML = ""

      const select = document.createElement("select")
      select.id = this.className
      select.name = this.className

      div.appendChild(select)

      for (let i = 0; i < this.options.length; i++) {
        const option = document.createElement("option")
        option.value = this.options[i]
        option.text = this.options[i]
        select.appendChild(option)
      }

      div.append(select)
    })

    const inputs = document.body.querySelectorAll(this.cssSelectorInput)
    if (inputs.length === 0) {
      return {
        status: 500,
        message: "INPUT_NOT_FOUND",
      }
    }
  }
}
