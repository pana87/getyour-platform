export class SelectionField {

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
    const selects = document.body.querySelectorAll(this.selectSelector)
    selects.forEach(select => select.addEventListener("input", (event) => callback(event)))
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
