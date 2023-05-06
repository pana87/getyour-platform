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
      if (!this.#isEmpty(files)) callback(files)
    }
    return this
  }

  withValidPdf(file) {
    return new Promise(async(resolve, reject) => {

      const allowedMimeTypes = ["application/pdf"]
      const allowedExtensions = ["pdf"]
      await Helper.verifyFileMimeTypes(file, allowedMimeTypes)
      .catch(error => {
        alert(`Erlaubte Dateiformate: ${allowedExtensions.join(", ")}`)
        Helper.setNotValidStyle(document.querySelector(this.inputSelector))
        throw error
      })

      await Helper.verifyFileExtension(file, allowedExtensions)
      .catch(error => {
        alert(`Erlaubte Dateiformate: ${allowedExtensions.join(", ")}`)
        Helper.setNotValidStyle(document.querySelector(this.inputSelector))
        throw error
      })

      const fileReader = new FileReader()
      fileReader.onload = async(event) => {

        const dataUrlSize = Helper.calculateDataUrlSize(fileReader.result)
        if (dataUrlSize > 5 * 1024 * 1024) {
          alert("PDF ist zu groß.")
          Helper.setNotValidStyle(document.querySelector(this.inputSelector))
          throw new Error("pdf too large")
        }

        const newFile = {}
        newFile.name = file.name
        newFile.type = file.type
        newFile.size = dataUrlSize
        newFile.modified = Date.now()
        newFile.dataUrl = fileReader.result

        return resolve(newFile)
      }
      fileReader.readAsDataURL(file)
    })
  }

  async withValidImage(file) {

    const allowedMimeTypes = ["image/jpeg", "image/png"]
    const allowedExtensions = ["jpg", "jpeg", "png"]

    if (allowedMimeTypes !== undefined) {
      await Helper.verifyFileMimeTypes(file, allowedMimeTypes)
      .catch(error => {
        alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
        Helper.setNotValidStyle(document.querySelector(this.inputSelector))
        throw error
      })
    }

    if (allowedExtensions !== undefined) {
      await Helper.verifyFileExtension(file, allowedExtensions)
      .catch(error => {
        alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
        Helper.setNotValidStyle(document.querySelector(this.inputSelector))
        throw error
      })
    }

    const dataUrl = await Helper.convertImageFileToDataUrl(file)
    const dataUrlSize = Helper.calculateDataUrlSize(dataUrl)
    if (dataUrlSize > 1024 * 1024) {
      alert("Datei ist zu groß.")
      Helper.setNotValidStyle(document.querySelector(this.inputSelector))
      throw new Error("image too large")
    }

    const image = {}
    image.name = file.name
    image.type = file.type
    image.size = dataUrlSize
    image.modified = Date.now()
    image.dataUrl = dataUrl
    Helper.setValidStyle(document.querySelector(this.inputSelector))
    return image
  }

  #isRequired(input) {
    if (input.required === true) return true
    return false
  }

  #checkValidity(input) {
    return input.checkValidity()
  }

  withValidValue() {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(async input => {
        if (this.#isRequired(input)) {
          if (this.#checkValidity(input)) {
            Helper.setValidStyle(input)
            return resolve(input.files)
          }
          Helper.setNotValidStyle(input)
          const error = new Error(`field required: '${this.name}'`)
          error.fieldName = this.name
          return reject(error)
        }
        Helper.setValidStyle(input)
        return resolve(input.files)
      })
    })
  }

  #setFields(field) {
    field.innerHTML = ""
    field.id = this.name
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
    this.label = label
    field.append(labelContainer)

    const input = document.createElement("input")
    input.classList.add(this.name)
    input.type = this.type
    input.style.margin = "21px 89px 21px 34px"
    field.append(input)
    this.input = input
    return field
  }

  constructor(name, parent) {
    if (Helper.stringIsEmpty(name)) throw new Error("field name is empty")
    this.name = name
    this.fieldSelector = `div[class='${this.name}']`
    this.inputSelector = `input[class='${this.name}']`
    this.labelSelector = `label[class='${this.name}']`
    this.type = "file"

    this.field = document.createElement("div")
    this.field = this.#setFields(this.field)
    if (parent !== undefined) parent.append(this.field)

    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    for (let i = 0; i < this.fields.length; i++) {
      this.#setFields(this.fields[i])
    }
  }
}
