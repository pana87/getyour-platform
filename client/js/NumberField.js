export class NumberField {

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

  withValidStyle() {
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setValidStyle(input))
    return this
  }

  withNotValidStyle() {
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setNotValidStyle(input))
    return this
  }

  // #setValidity(input) {
  //   if (!input.checkValidity()) {
  //     this.#setNotValidStyle(input)
  //   }
  //   if (input.checkValidity()) {
  //     this.valid = input.checkValidity()
  //     this.#setValidStyle(input)
  //   }
  //   return input
  // }

  // withValidity() {
  //   this.#withValidityCalled = true
  //   return this
  // }

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

  get value() {
    let result = undefined
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => result = input.value)
    return result
  }

  // withSync() {
  //   const inputs = document.querySelectorAll(this.inputSelector)

  //   inputs.forEach(input => {
  //     input.addEventListener("input", () => {
  //       if (this.#withValidityCalled === true) {
  //         this.#setValidity(input)
  //       }
  //       inputs.forEach(other => {
  //         other.value = input.value

  //         if (this.#isValid(other)) this.value = other.value
  //       })
  //     })
  //   })
  //   return this
  // }

  // storeInputToLocalStorage(storageName) {
  //   const value = this.#getInput()

  //   if (value !== undefined) {
  //     const storage = JSON.parse(window.localStorage.getItem(storageName)) || {}

  //     storage[this.className] = value

  //     window.localStorage.setItem(storageName, JSON.stringify(storage))
  //   }
  //   return this
  // }

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

  // #isValid(input) {
  //   return input.checkValidity() && input.value !== ""
  // }

  withValidValue(callback) {
    document.querySelectorAll(this.inputSelector).forEach(input => {
      if (this.checkValidity(input)) {
        this.withValidStyle()
        callback(input.value)
        return
      }
      this.withNotValidStyle()
      console.error("VALUE_NOT_VALID")
    })
    return this
  }

  // #getInput() {
  //   let value = undefined
  //   const inputs = document.querySelectorAll(this.inputSelector)
  //   if (inputs.length === 0) return value
  //   inputs.forEach(input => {
  //     if (this.#isValid(input)) {
  //       value = input.value
  //     }
  //   })
  //   return value
  // }

  withInputEventListener(callback) {
    const inputs = document.body.querySelectorAll(this.inputSelector)
    inputs.forEach(input => input.addEventListener("input", (event) => callback(event)))
    return this
  }

  #setSync(input) {
    document.body.querySelectorAll(this.inputSelector).forEach(other => other.value = input.value)
    return input
  }

  #setMax(input) {
    input.max = this.max
    return input
  }

  withMax(max) {
    this.max = max
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setMax(input))
    return this
  }

  #setMin(input) {
    input.min = this.min
    return input
  }

  withMin(min) {
    this.min = min
    const inputs = document.querySelectorAll(this.inputSelector)
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
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setSHSDefaultStyle(input))
    return this
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
        input.type = "number"
        input.name = this.className
        input.id = this.className

        div.append(input)
      })
      return
    }
    console.error("FIELD_NOT_FOUND")
  }
}
