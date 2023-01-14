export class CheckboxField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.checkboxSelector).forEach(box => box.addEventListener("change", (event) => callback(event)))
    return this
  }

  withInputEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.checkboxSelector).forEach(box => box.addEventListener("input", (event) => callback(event)))
    return this
  }

  #setRequired(box) {
    box.required = this.required
    return box
  }

  withRequired() {
    this.required = true
    document.querySelectorAll(this.checkboxSelector).forEach(box => this.#setRequired(box))
    return this
  }

  withCheckbox(callback) {
    document.querySelectorAll(this.checkboxSelector).forEach(box => callback(box))
    return this
  }

  #setValidStyle(box) {
    box.style.outline = "2px solid #00c853"
    // box.style.borderRadius = "3px"
    return box
  }

  #setNotValidStyle(box) {
    box.style.outline = "2px solid #d50000"
    // box.style.borderRadius = "3px"
    return box
  }

  #isRequired(box) {
    if (box.disabled === true) return false
    if (box.required !== true) return false
    return true
  }

  withValidValue(callback) {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.checkboxSelector).forEach(box => {
        if (this.#isRequired(box)) {
          if (box.checked) {
            this.#setValidStyle(box)
            if (callback) callback(box.checked)
            return resolve()
          }
          this.#setNotValidStyle(box)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        this.#setValidStyle(box)
        if (callback) callback(box.checked)
        return resolve()
      })
    })
  }

  #isEmpty(value) {
    return value === undefined ||
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

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.checkboxSelector = `input[name='${this.className}']`

    const divs = document.body.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.id = this.className
        checkbox.name = this.className

        div.append(checkbox)
      })
      return
    }
    console.error("FIELD_NOT_FOUND")
  }
}
