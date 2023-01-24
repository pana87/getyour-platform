export class SelectionField {

  withChangeEventListener(callback) {
    if (callback !== undefined) {
      const selects = document.body.querySelectorAll(this.selectSelector)
      selects.forEach(select => select.addEventListener("change", (event) => callback(event)))
    }
    return this
  }

  withRequired(index) {
    this.requiredIndex = index
    return this
  }

  #setValidStyle(select) {
    select.style.border = "2px solid #00c853"
    select.style.borderRadius = "3px"
    return select
  }

  #setNotValidStyle(select) {
    select.style.border = "2px solid #d50000"
    select.style.borderRadius = "3px"
    return select
  }

  #isRequired(select) {
    if (select.disabled === true) return false
    if (this.requiredIndex === undefined) return false
    return true
  }

  withValidValue(callback) {
    return new Promise((resolve, reject) => {
      const result = []
      document.querySelectorAll(this.selectSelector).forEach(select => {
        if (this.#isRequired(select)) {
          for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i]
            if (option.selected) {
              if (option.value === select.options[this.requiredIndex].value) {
                this.#setValidStyle(select)
                result.push(option.value || option.text)
                if (callback) callback(result)
                return resolve()
              }
            }
          }
          this.#setNotValidStyle(select)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        for (let i = 0; i < select.options.length; i++) {
          const option = select.options[i]
          if (option.selected) {
            this.#setValidStyle(select)
            result.push(option.value || option.text)
            if (callback) callback(result)
            return resolve()
          }
        }
      })
    })
  }

  withSelected(index) {
    document.querySelectorAll(this.selectSelector)
      .forEach(select => select.options[index].selected = true)
    return this
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

  #setSize(select) {
    select.size = this.size
    return select
  }

  withSize(size) {
    this.size = size
    const selects = document.querySelectorAll(this.selectSelector)
    selects.forEach(select => this.#setSize(select))
    return this
  }

  #setMultiple(select) {
    select.multiple = this.multiple
    return select
  }

  withMultiple() {
    this.multiple = true
    const selects = document.querySelectorAll(this.selectSelector)
    selects.forEach(select => this.#setMultiple(select))
    return this
  }

  withSelect(callback) {
    const selects = document.querySelectorAll(this.selectSelector)
    selects.forEach(select => callback(select))
    return this
  }

  withInputEventListener(callback) {
    if (callback !== undefined) {
      const selects = document.body.querySelectorAll(this.selectSelector)
      selects.forEach(select => select.addEventListener("input", (event) => callback(event)))
    }
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
    const selects = document.querySelectorAll(this.selectSelector)
    selects.forEach(select => this.#setOptions(select))
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.selectSelector = `select[name='${this.className}']`
    this.options = []

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
    console.error("FIELD_NOT_FOUND")
  }
}
