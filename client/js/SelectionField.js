import { Helper } from "/js/Helper.js"

export class SelectionField {

  withField(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(field => callback(field))
    return this
  }

  withLabel(callback) {
    if (callback !== undefined) document.querySelectorAll(this.labelSelector).forEach(label => callback(label))
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(select => callback(select))
    return this
  }

  onInfoClick(callback) {
    if (callback !== undefined) document.querySelectorAll(`.label-container-${this.name}`).forEach(info => {
      info.style.cursor = "pointer"
      info.childNodes.forEach(child => child.style.cursor = "pointer")
      info.addEventListener("click", callback)
    })
    return this
  }

  onInput(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(select => select.addEventListener("input", (event) => callback(event)))
    return this
  }

  onWindowLoad(callback) {
    if (callback !== undefined) window.addEventListener("load", (event) => callback(event))
    return this
  }

  onChange(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(select => select.addEventListener("change", (event) => callback(event)))
    return this
  }

  withRequired(index) {
    this.requiredIndex = index
    return this
  }

  #isRequired(select) {
    if (this.requiredIndex !== undefined) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].selected === true) {
          if (select.options[i].value !== select.options[this.requiredIndex].value) {
            return true
          }
        }
      }
    }
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(select => {
        let optionsSelected = []
        for (let i = 0; i < select.options.length; i++) {
          const option = select.options[i]
          if (option.selected === true) {
            optionsSelected.push(option)
          }
        }
        if (this.#isRequired(select)) {
          for (let i = 0; i < optionsSelected.length; i++) {
            if (optionsSelected[i].value === select.options[this.requiredIndex].value) {
              Helper.setValidStyle(select)
              return resolve(optionsSelected)
            }
          }
          Helper.setNotValidStyle(select)
          console.error(`field '${this.name}' is required`)
          return
        }
        Helper.setValidStyle(select)
        return resolve(optionsSelected)
      })
    })
  }

  async withStorage(callback) {
    if (callback !== undefined) {
      const options = await this.withValidValue()
      if (!Helper.arrayIsEmpty(options)) {
        const map = options.map(option => option.value)
        callback(map)
      }
    }
    return this
  }

  fromStorage(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(select => {
      const options = callback(this.name)
      if (options !== undefined) {
        for (let i = 0; i < select.options.length; i++) {
          select.options[i].selected = false
          for (let z = 0; z < options.length; z++) {
            if (options[z] === select.options[i].value) {
              select.options[i].selected = true
            }
          }
        }
      }
    })
    return this
  }

  #setOptions(select) {
    select.innerHTML = ""
    for (let i = 0; i < this.options.length; i++) {
      const option = document.createElement("option")
      option.value = this.options[i]
      option.text = this.options[i]
      select.appendChild(option)
    }
    return select
  }

  withOptions(options) {
    if (options !== undefined) {
      this.options = options
      document.querySelectorAll(this.inputSelector).forEach(select => this.#setOptions(select))
    }
    return this
  }

  #setSelect(field) {
    field.innerHTML = ""
    field.classList.add(this.name)
    field.style.position = "relative"
    field.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
    field.style.borderRadius = "13px"
    field.style.border = "0.3px solid black"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
    field.style.justifyContent = "center"

    const labelContainer = document.createElement("div")
    labelContainer.classList.add(`label-container-${this.name}`)
    labelContainer.style.display = "flex"
    labelContainer.style.alignItems = "center"
    labelContainer.style.margin = "21px 89px 0 34px"

    const info = document.createElement("img")
    info.src = "/public/info-gray.svg"
    info.alt = "Info"
    info.style.width = "34px"
    info.style.marginRight = "21px"
    labelContainer.append(info)

    const label = document.createElement("label")
    label.classList.add(this.name)
    label.style.color = "#707070"
    label.style.fontSize = "21px"
    labelContainer.append(label)
    field.append(labelContainer)

    const select = document.createElement("select")
    select.classList.add(this.name)
    select.style.margin = "21px 89px 21px 34px"
    select.style.fontSize = "21px"
    select.style.maxWidth = "300px"
    field.append(select)
  }

  constructor(name) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name
    this.fieldSelector = `div[class='${this.name}']`
    this.inputSelector = `select[class='${this.name}']`
    this.labelSelector = `label[class='${this.name}']`
    this.type = "select"
    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    for (let i = 0; i < this.fields.length; i++) {
      this.#setSelect(this.fields[i])
    }
  }
}
