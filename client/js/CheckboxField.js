export class CheckboxField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.checkboxSelector).forEach(box => box.addEventListener("change", (event) => callback(event)))
    return this
  }

  withInputEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.checkboxSelector).forEach(box => box.addEventListener("input", (event) => callback(event)))
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.checkboxSelector).forEach(checkbox => {
      checkbox.fromSessionStorage = (name) => {
        const value = JSON.parse(window.sessionStorage.getItem(name))[this.className]
        if (value !== undefined) {
          checkbox.checked = value
        }
      }
      callback(checkbox)
    })
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
    if (box.required === true) return true
    return false
  }

  withValidValue(callback) {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.checkboxSelector).forEach(box => {
        if (this.#isRequired(box)) {
          if (box.checked) {
            this.#setValidStyle(box)
            return resolve(box.checked)
          }
          this.#setNotValidStyle(box)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        this.#setValidStyle(box)
        return resolve(box.checked)
      })
    })
  }

  #isEmpty(value) {
    return value === undefined ||
      value === null ||
      typeof value !== "boolean"
  }

  async withStorage(name) {
    this.storageName = name
    const value = await this.withValidValue()
    // console.log(value)
    if (!this.#isEmpty(value)) {
      this.storage = JSON.parse(window.sessionStorage.getItem(this.storageName)) || {}
      this.storage[this.className] = value
      window.sessionStorage.setItem(this.storageName, JSON.stringify(this.storage))
    }
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
