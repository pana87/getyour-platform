import { Helper } from "./Helper.js"

export class InfoField {

  // withType(callback) {
  //   if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => {
  //     input.fromStorage = (name) => {
  //       if (name === this.type) {
  //         const value = JSON.parse(window.localStorage.getItem(name))
  //         if (value !== undefined) input.value = value
  //       }
  //       if (name === "shsFunnel") {
  //         const value = JSON.parse(window.localStorage.getItem(name)).value[this.name]
  //         if (value !== undefined) input.value = value
  //       }
  //     }

  //     callback(input)
  //   })
  //   return this
  // }

  // #isEmpty(value) {
  //   return value === undefined ||
  //     value === "" ||
  //     value.replace(/\s/g, "") === "" ||
  //     value === null
  // }

  // async withStorage(name) {
  //   try {
  //     this.storageName = name
  //     const value = await this.withValidValue()
  //     if (!this.#isEmpty(value)) {

  //       if (name === this.type) {
  //         window.localStorage.setItem(this.storageName, JSON.stringify(value))
  //         return this
  //       }

  //       if (name === "shsFunnel") {
  //         const storage = JSON.parse(window.localStorage.getItem(this.storageName))
  //         storage.value[this.name] = value
  //         window.localStorage.setItem(this.storageName, JSON.stringify(storage))
  //       }

  //       return this
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return new Error(`class='${this.name}' - storage failed`)
  // }

  // #isRequired(input) {
  //   if (input.required === true) return true
  //   return false
  // }

  // withValidValue() {
  //   return new Promise((resolve, reject) => {
  //     document.querySelectorAll(this.inputSelector).forEach(input => {
  //       if (this.#isRequired(input)) {
  //         if (input.checkValidity()) {
  //           Helper.setValidStyle(input)
  //           return resolve(input.value)
  //         }
  //         Helper.setNotValidStyle(input)
  //         console.error(`field '${this.name}' is required`)
  //         return
  //       }
  //       Helper.setValidStyle(input)
  //       return resolve(input.value)
  //     })
  //   })
  // }

  // withInputEventListener(callback) {
  //   if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
  //   return this
  // }

  withWarning(message) {
    if (message !== undefined) {
      this.withWarningMessage = message
      document.querySelectorAll(this.fieldSelector).forEach(field => this.#setInfo(field))
    }
    return this
  }


  withSuccess(message) {
    if (message !== undefined) {
      this.withSuccessMessage = message
      // document.querySelectorAll(this.fieldSelector).forEach(field => this.#setInfo(field))
    }
    return this
  }

  build() {
    document.querySelectorAll(this.fieldSelector).forEach(field => this.#setInfo(field))
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(field => callback(field))
    return this
  }

  with({withField, withSuccess}) {
    if (withElement !== undefined) this.fields.push(withElement)
    if (withField !== undefined) this.withFieldCallback = withField
    if (withInput !== undefined) this.withInputCallback = withInput
    if (withLabel !== undefined) this.withLabelCallback = withLabel
    this.#setFields()
    return this
  }

  #setFields() {

    for (let i = 0; i < this.fields.length; i++) {
      this.fields[i].innerHTML = ""

      if (this.withSuccessMessage !== undefined) {
        this.fields[i].innerHTML = this.withSuccessMessage
        this.fields[i].style.backgroundColor = "rgba(0, 200, 83, 0.3)"
        this.fields[i].style.border = "2px solid #00c853"
        // field.style.margin = "13px 34px"
        // field.style.padding = "21px"
        // field.style.borderRadius = "13px"
        // field.style.display = "flex"
        // field.style.flexDirection = "column"
        // field.style.justifyContent = "center"
        // field.style.alignItems = "center"
      }

      if (this.withWarningMessage !== undefined) {
        this.fields[i].innerHTML = this.withWarningMessage
        this.fields[i].style.backgroundColor = "rgba(255, 204, 0, 0.3)"
        this.fields[i].style.border = "2px solid #ffcc00"
      }

      this.fields[i].style.margin = "13px 34px"
      this.fields[i].style.padding = "21px"
      this.fields[i].style.borderRadius = "13px"
      // field.style.display = "flex"
      // field.style.flexDirection = "column"
      // field.style.justifyContent = "center"
      // field.style.alignItems = "center"
      // field.style.textAlign = "center"

      // with click listeneer
      // field.style.textDecoration = "underline"
      // field.style.cursor = "pointer"
      // field.addEventListener("click", () => window.location.assign("/felix/shs/abfrage-haus/"))

      // field.append(container)
      if (this.withFieldCallback !== undefined) this.withFieldCallback(this.fields[i])
    }


  }

  #setInfo(field) {
    field.innerHTML = ""

    if (this.withSuccessMessage !== undefined) {
      field.innerHTML = this.withSuccessMessage
      field.style.backgroundColor = "rgba(0, 200, 83, 0.3)"
      field.style.border = "2px solid #00c853"
      // field.style.margin = "13px 34px"
      // field.style.padding = "21px"
      // field.style.borderRadius = "13px"
      // field.style.display = "flex"
      // field.style.flexDirection = "column"
      // field.style.justifyContent = "center"
      // field.style.alignItems = "center"
    }

    if (this.withWarningMessage !== undefined) {
      field.innerHTML = this.withWarningMessage
      field.style.backgroundColor = "rgba(255, 204, 0, 0.3)"
      field.style.border = "2px solid #ffcc00"
    }

    field.style.margin = "13px 34px"
    field.style.padding = "21px"
    field.style.borderRadius = "13px"
    // field.style.display = "flex"
    // field.style.flexDirection = "column"
    // field.style.justifyContent = "center"
    // field.style.alignItems = "center"
    // field.style.textAlign = "center"

    // with click listeneer
    // field.style.textDecoration = "underline"
    // field.style.cursor = "pointer"
    // field.addEventListener("click", () => window.location.assign("/felix/shs/abfrage-haus/"))

    // field.append(container)
  }

  constructor(name) {
    try {
      if (Helper.stringIsEmpty(name)) throw new Error("class name is empty")
      this.name = name
      this.fieldSelector = `div[class='${this.name}']`
      this.type = "info"
      const fields = document.querySelectorAll(this.fieldSelector)
      this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
      if (fields.length <= 0) throw new Error(`field '${this.name}' not found`)
    } catch (error) {
      console.error(error);
    }
  }
}
