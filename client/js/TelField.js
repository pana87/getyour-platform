import { Helper } from "./Helper.js"

export class TelField {

  withLabel(name) {
    if (name !== undefined) {
      this.withLabelName = name
      document.querySelectorAll(this.fieldSelector).forEach(field => this.#setTel(field))
    }
    return this
  }

  onChange(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("change", (event) => callback(event)))
    return this
  }

  fromStorage(name) {
    if (name === "shsFunnel") {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        const shsFunnel = Helper.getFunnel(name)
        const value = shsFunnel.value[this.className]
        if (value !== undefined) input.value = value
      })
      return this
    }
    const value = JSON.parse(window.localStorage.getItem(name)).value[this.className]
    if (value !== undefined) input.value = value
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => callback(input))
    return this
  }

  async withStorage(name) {
    this.withStorageName = name
    const value = await this.withValidValue()
    if (!Helper.stringIsEmpty(value)) {
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

  #isRequired(input) {
    if (input.required === true) return true
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        if (this.#isRequired(input)) {
          if (input.checkValidity()) {
            Helper.setValidStyle(input)
            return resolve(input.value)
          }
          Helper.setNotValidStyle(input)
          console.error(`field '${this.className}' is required`)
          return
        }
        Helper.setValidStyle(input)
        return resolve(input.value)
      })
    })
  }

  #setTel(field) {
    field.innerHTML = ""

    const container = document.createElement("div")
    container.style.position = "relative"
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

    const input = document.createElement("input")
    input.type = this.type
    input.name = this.className
    input.id = this.className
    input.style.margin = "21px 89px 21px 34px"
    input.style.fontSize = "21px"
    input.style.maxWidth = "300px"

    container.append(label, input)

    field.append(container)
  }

  onInput(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
    return this
  }

  constructor(className) {
    try {
      if (Helper.stringIsEmpty(className)) throw new Error("class name is empty")
      this.className = className
      this.fieldSelector = `[class='${this.className}']`
      this.inputSelector = `input[id='${this.className}']`
      this.type = "tel"
      const fields = document.querySelectorAll(this.fieldSelector)
      if (fields.length <= 0) throw new Error(`field '${this.className}' not found`)
      fields.forEach(field => this.#setTel(field))
    } catch (error) {
      console.error(error);
    }
  }
}
