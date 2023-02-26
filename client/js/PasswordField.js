import { Helper } from "./Helper.js"

export class PasswordField {

  withLabel(name) {
    if (name !== undefined) {
      this.withLabelName = name
      document.querySelectorAll(this.fieldSelector).forEach(field => this.#setPassword(field))
    }
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => callback(input))
    return this
  }

  // #isEmpty(value) {
  //   return value === undefined ||
  //     value === "" ||
  //     value.replace(/\s/g, "") === "" ||
  //     value === null
  // }

  async withStorage(name) {
    this.withStorageName = name
    const value = await this.withValidValue()
    if (!Helper.stringIsEmpty(value)) {
      const hash = await Helper.digest(value)
      Helper.setFunnel({
        name: this.withStorageName,
        key: this.className,
        value: hash
      })
      // const storage = JSON.parse(window.localStorage.getItem(this.storageName))
      // storage.value[this.className] = hash
      // window.localStorage.setItem(this.storageName, JSON.stringify(storage))
    }
    // try {
    // } catch (error) {
    //   console.error(error)
    // }
    return this
  }

  #isValid(input) {
    return input.checkValidity() &&
      input.value.length >= input.minLength
  }

  #isRequired(input) {
    if (input.required === true) return true
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        if (this.#isRequired(input)) {
          if (this.#isValid(input)) {
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

  onInput(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
    return this
  }

  #setPassword(field) {
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

  constructor(className) {
    try {
      if (Helper.stringIsEmpty(className)) throw new Error("class name is empty")
      this.className = className
      this.fieldSelector = `[class='${this.className}']`
      this.inputSelector = `input[id='${this.className}']`
      this.type = "password"
      const fields = document.querySelectorAll(this.fieldSelector)
      if (fields.length <= 0) throw new Error(`field '${this.className}' not found`)
      fields.forEach(field => this.#setPassword(field))
    } catch (error) {
      console.error(error);
    }




    // this.fieldSelector = fieldSelector
    // this.className = this.fieldSelector.split("'")[1]
    // this.inputSelector = `input[id='${this.className}']`
    // this.type = "number"

    // const divs = document.querySelectorAll(this.fieldSelector)
    // if (divs.length > 0) {
    //   divs.forEach(div => {
    //     div.innerHTML = ""

    //     const input = document.createElement("input")
    //     input.type = "password"
    //     input.name = this.className
    //     input.id = this.className

    //     div.append(input)
    //   })
    //   return
    // }
    // console.warn(`class='${this.className}' - field not found`)
  }
}
