import { Helper } from "/js/Helper.js"

export class FileField {

  withField(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(field => callback(field))
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => callback(input))
    return this
  }

  withLabel(callback) {
    if (callback !== undefined) document.querySelectorAll(this.labelSelector).forEach(label => callback(label))
    return this
  }

  onChange(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("change", (event) => callback(event)))
    return this
  }

  onInput(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
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

  fromStorage(callback) {
    if (callback !== undefined) {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        if (callback(this.name) !== undefined) input.required = false
      })
    }
    return this
  }


  #isEmpty(value) {
    return value === undefined ||
      value.length <= 0 ||
      value === null
  }

  async withStorage(callback) {
    if (callback !== undefined) {
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
        callback(array)
      }
    }
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
          console.error(`field '${this.name}' is required`)
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


  #setFields(field) {
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

    const input = document.createElement("input")
    input.classList.add(this.name)
    input.type = this.type
    input.style.margin = "21px 89px 21px 34px"
    // input.style.maxWidth = "300px"
    field.append(input)
  }

  constructor(name) {
    if (Helper.stringIsEmpty(name)) throw new Error("field name is empty")
    this.name = name
    this.fieldSelector = `div[class='${this.name}']`
    this.inputSelector = `input[class='${this.name}']`
    this.labelSelector = `label[class='${this.name}']`
    this.type = "file"
    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    for (let i = 0; i < this.fields.length; i++) {
      this.#setFields(this.fields[i])
    }
  }
}
