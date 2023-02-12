import { Helper } from "./Helper.js"

export class FileField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("change", (event) => callback(event)))
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => {
      input.fromStorage = (name) => {
        const files = JSON.parse(window.localStorage.getItem(name)).value[this.className]
        if (files !== undefined) input.required = false
      }
      callback(input)
    })
    return this
  }

  #isEmpty(value) {
    return value === undefined ||
      value.length <= 0 ||
      value === null
  }

  async withStorage(name) {
    try {
      this.storageName = name
      const files = await this.withValidValue()
      if (!this.#isEmpty(files)) {
        let array = []
        for (let i = 0; i < files.length; i++) {
          const dataUrl = await this.#setFileAsDataUrl(files[i])
          array.push({
            name: files[i].name,
            type: files[i].type,
            size: files[i].size,
            lastModified: files[i].lastModified,
            dataUrl: dataUrl,
          })
        }
        const storage = JSON.parse(window.localStorage.getItem(this.storageName))
        storage.value[this.className] = array
        window.localStorage.setItem(this.storageName, JSON.stringify(storage))
      }
    } catch (error) {
      console.error(error)
    }
    return this
  }

  withInputEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
    return this
  }

  #isRequired(input) {
    if (input.required === true) return true
    return false
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(async input => {
        if (this.#isRequired(input)) {
          if (input.checkValidity()) {
            Helper.setValidStyle(input)
            return resolve(input.files)
          }
          Helper.setNotValidStyle(input)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        Helper.setValidStyle(input)
        return resolve(input.files)
      })
    })
  }

  #setFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener("loadend", () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const image = document.createElement("img")
        image.src = reader.result
        image.onload = () => {
          const width = 300
          const height = 300 * image.height / image.width
          canvas.width = width
          canvas.height = height
          ctx.drawImage(image, 0, 0, width, height)
          return resolve(canvas.toDataURL(file.type))
        }
      })
    })
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.inputSelector = `input[id='${this.className}']`
    this.type = "file"

    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {

        div.setAttribute("style", "cursor: pointer;")

        const input = document.createElement("input")
        input.type = "file"
        input.name = this.className
        input.id = this.className

        div.append(input)
        div.addEventListener("click", () => input.click())
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
