import { Helper } from "./Helper.js"

export class SelectionField {

  onWindowLoad(callback) {
    if (callback !== undefined) window.addEventListener("load", (event) => callback(event))
    return this
  }

  withLabel(name) {
    if (name !== undefined) {
      this.withLabelName = name
      document.querySelectorAll(this.fieldSelector).forEach(field => this.#setSelect(field))
    }
    return this
  }

  onChange(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.selectSelector).forEach(select => select.addEventListener("change", (event) => callback(event)))
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
      document.querySelectorAll(this.selectSelector).forEach(select => {
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
          console.error(`field '${this.className}' is required`)
          return
        }
        // standard path
        Helper.setValidStyle(select)
        return resolve(optionsSelected)
      })
    })
  }

  async withStorage(name) {
    this.withStorageName = name
    const options = await this.withValidValue()
    if (!Helper.arrayIsEmpty(options)) {
      const map = options.map(option => option.value)

      Helper.setFunnel({
        name: this.withStorageName,
        key: this.className,
        value: map
      })
      // const storage = JSON.parse(window.localStorage.getItem(this.withStorageName))
      // storage.value[this.className] = map
      // window.localStorage.setItem(this.withStorageName, JSON.stringify(storage))
    }
    // try {
    // } catch (error) {
    //   console.error(error)
    // }
    return this
  }

  fromStorage(name) {
    if (name === "shsFunnel") {
      document.querySelectorAll(this.selectSelector).forEach(select => {
        const shsFunnel = Helper.getFunnelByStorageName(name)
        const options = shsFunnel.value[this.className]
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
    }
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.selectSelector).forEach(select => callback(select))
    return this
  }

  onInput(callback) {
    if (callback !== undefined) document.querySelectorAll(this.selectSelector).forEach(select => select.addEventListener("input", (event) => callback(event)))
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

  #setSelect(field) {
    field.innerHTML = ""

    const container = document.createElement("div")
    container.style.position = "relative"
    // container.style.height = "144px"
    container.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
    container.style.borderRadius = "13px"
    container.style.border = "0.3px solid black"
    container.style.display = "flex"
    container.style.flexDirection = "column"
    container.style.margin = "34px"
    container.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
    container.style.justifyContent = "center"

    const label = document.createElement("label")
    if (this.withLabelName !== undefined) {
      label.innerHTML = this.withLabelName
    }
    label.style.color = "#707070"
    label.style.fontSize = "21px"
    label.style.margin = "21px 34px 0 34px"
    label.setAttribute("for", this.className)

    const select = document.createElement("select")
    select.id = this.className
    select.name = this.className

    for (let i = 0; i < this.options.length; i++) {
      const option = document.createElement("option")
      option.value = this.options[i]
      option.text = this.options[i]
      select.appendChild(option)
    }

    select.style.margin = "21px 89px 21px 34px"
    select.style.fontSize = "21px"
    select.style.maxWidth = "300px"


    container.append(label, select)

    field.withRequired = (index) => this.withRequired(index)
    // field.withRequired = this.requiredIndex
    field.withValidValue = () => this.withValidValue()
    field.withType = (callback) => this.withType(callback)
    field.append(container)
  }

  constructor(className) {
    try {
      if (Helper.stringIsEmpty(className)) throw new Error("class name is empty")
      this.className = className
      this.fieldSelector = `[class='${this.className}']`
      this.selectSelector = `select[id='${this.className}']`
      this.options = []
      this.type = "select"
      const fields = document.querySelectorAll(this.fieldSelector)
      if (fields.length <= 0) throw new Error(`field '${this.className}' not found`)
      fields.forEach(field => this.#setSelect(field))
    } catch (error) {
      console.error(error);
    }
  }
}
