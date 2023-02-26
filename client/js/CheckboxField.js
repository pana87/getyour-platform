import { Helper } from "./Helper.js"

export class CheckboxField {

  afterCheckbox(name) {
    if (name !== undefined) {
      this.afterCheckboxName = name
      document.querySelectorAll(this.fieldSelector).forEach(field => this.#setCheckbox(field))
    }
    return this
  }

  withLabel(name) {
    if (name !== undefined) {
      this.withLabelName = name
      document.querySelectorAll(this.fieldSelector).forEach(field => this.#setCheckbox(field))
    }
    return this
  }

  onChange(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.checkboxSelector).forEach(checkbox => checkbox.addEventListener("change", (event) => callback(event)))
    return this
  }

  onInput(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.checkboxSelector).forEach(checkbox => checkbox.addEventListener("input", (event) => callback(event)))
    return this
  }

  fromStorage(name) {
    if (name === "shsFunnel") {
      document.querySelectorAll(this.checkboxSelector).forEach(checkbox => {
        const shsFunnel = Helper.getFunnelByStorageName(name)
        const value = shsFunnel.value[this.className]
        if (value !== undefined) checkbox.checked = value
      })
      return this
    }
    const value = JSON.parse(window.localStorage.getItem(name))
    if (value !== undefined) checkbox.checked = value
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.checkboxSelector).forEach(checkbox => callback(checkbox))
    return this
  }

  #isRequired(box) {
    if (box.required === true) return true
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.checkboxSelector).forEach(box => {
        if (this.#isRequired(box)) {
          if (box.checked) {
            Helper.setValidStyle(box)
            return resolve(box.checked)
          }
          Helper.setNotValidStyle(box)
          console.error(`field '${this.className}' is required`)
          return
        }
        Helper.setValidStyle(box)
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
    this.withStorageName = name
    const value = await this.withValidValue()
    if (!Helper.booleanIsEmpty(value)) {
      Helper.setFunnel({
        name: this.withStorageName,
        key: this.className,
        value: value
      })


      // const storage = JSON.parse(window.localStorage.getItem(this.storageName))
      // storage.value[this.className] = value
      // window.localStorage.setItem(this.storageName, JSON.stringify(storage))
    }
    // try {
    // } catch (error) {
    //   console.error(error)
    // }
    return this
  }

  #setCheckbox(field) {
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
    container.style.alignItems = "flex-start"

    const label = document.createElement("label")
    if (this.withLabelName !== undefined) {
      label.innerHTML = this.withLabelName
    }
    label.style.color = "#707070"
    label.style.fontSize = "21px"
    label.style.margin = "21px 34px 0 34px"
    label.setAttribute("for", this.className)

    const checkboxContainer = document.createElement("div")
    checkboxContainer.style.display = "flex"
    checkboxContainer.style.justifyContent = "center"
    checkboxContainer.style.alignItems = "center"

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.id = this.className
    checkbox.name = this.className
    checkbox.style.margin = "21px 34px"
    checkbox.style.width = "21px"
    checkbox.style.height = "21px"


    const afterCheckbox = document.createElement("div")

    if (this.afterCheckboxName !== undefined) {
      afterCheckbox.innerHTML = this.afterCheckboxName
      afterCheckbox.style.fontSize = "21px"
    }

    checkboxContainer.append(checkbox, afterCheckbox)

    container.append(label, checkboxContainer)

    field.append(container)
  }

  constructor(className) {
    try {
      if (Helper.stringIsEmpty(className)) throw new Error("class name is empty")
      this.className = className
      this.fieldSelector = `[class='${this.className}']`
      this.checkboxSelector = `input[id='${this.className}']`
      this.type = "checkbox"
      const fields = document.querySelectorAll(this.fieldSelector)
      if (fields.length <= 0) throw new Error(`field '${this.className}' not found`)
      fields.forEach(field => this.#setCheckbox(field))
    } catch (error) {
      console.error(error);
    }





    // this.fieldSelector = fieldSelector
    // this.className = this.fieldSelector.split("'")[1]
    // this.checkboxSelector = `input[id='${this.className}']`
    // this.type = "checkbox"

    // const divs = document.body.querySelectorAll(this.fieldSelector)
    // if (divs.length > 0) {
    //   divs.forEach(div => {
    //     div.innerHTML = ""

    //     const checkbox = document.createElement("input")
    //     checkbox.type = "checkbox"
    //     checkbox.id = this.className
    //     checkbox.name = this.className

    //     div.append(checkbox)
    //   })
    //   return
    // }
    // console.warn(`class='${this.className}' - field not found`)
  }
}
