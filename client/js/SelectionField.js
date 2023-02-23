import { Helper } from "./Helper.js"

export class SelectionField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.selectSelector).forEach(select => select.addEventListener("change", (event) => callback(event)))
    return this
  }

  withRequired(index) {
    this.requiredIndex = index
    return this
  }

  #isRequired(select) {
    if (this.requiredIndex !== undefined) return true
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.selectSelector).forEach(select => {
        let optionsSelected = []
        for (let i = 0; i < select.options.length; i++) {
          const option = select.options[i]
          if (option.selected) {
            optionsSelected.push(option)
          }
        }
        // required path
        if (this.#isRequired(select)) {
          if (optionsSelected.includes(select.options[this.requiredIndex])) {
            Helper.setValidStyle(select)
            return resolve(optionsSelected)
          }
          Helper.setNotValidStyle(select)

          console.error(`class='${this.className}' - required valid value`)
          return
        }
        // standard path
        Helper.setValidStyle(select)
        return resolve(optionsSelected)
      })
    })
  }

  withSelected(index) {
    document.querySelectorAll(this.selectSelector).forEach(select => select.options[index].selected = true)
    return this
  }

  #isEmpty(value) {
    return value === undefined ||
      value === null ||
      value.length <= 0
  }

  async withStorage(name) {
    try {
      this.storageName = name
      const options = await this.withValidValue()
      if (!this.#isEmpty(options)) {
        const map = options.map(option => option.value)
        const storage = JSON.parse(window.localStorage.getItem(this.storageName))
        storage.value[this.className] = map
        window.localStorage.setItem(this.storageName, JSON.stringify(storage))
      }
    } catch (error) {
      console.error(error)
    }
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.selectSelector).forEach(select => {
      select.fromStorage = (name) => {
        const options = JSON.parse(window.localStorage.getItem(name)).value[this.className]
        if (options !== undefined) {
          for (let i = 0; i < select.options.length; i++) {
            select.options[i].selected = false
            if (options.includes(select.options[i].value)) {
              select.options[i].selected = true
            }
          }
        }
      }
      callback(select)
    })
    return this
  }

  withInputEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.selectSelector).forEach(select => select.addEventListener("input", (event) => callback(event)))
    return this
  }

  #setOptions(select) {
    for (let i = 0; i < this.options.length; i++) {
      const option = document.createElement("option")
      option.value = this.options[i]
      option.text = this.options[i]
      select.appendChild(option)
    }
    return select
  }

  withOptions(options) {
    this.options = options
    document.querySelectorAll(this.selectSelector).forEach(select => this.#setOptions(select))
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.selectSelector = `select[id='${this.className}']`
    this.options = []
    this.type = "select"

    const divs = document.body.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const select = document.createElement("select")
        select.id = this.className
        select.name = this.className

        for (let i = 0; i < this.options.length; i++) {
          const option = document.createElement("option")
          option.value = this.options[i]
          option.text = this.options[i]
          select.appendChild(option)
        }

        div.append(select)
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
