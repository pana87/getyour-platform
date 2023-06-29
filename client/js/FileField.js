import { Helper } from "/js/Helper.js"

export class FileField {

  validHtml(file) {

    return new Promise(async (resolve, reject) => {
      const allowedMimeTypes = ["text/html"]
      const allowedExtensions = ["html"]

      if (allowedMimeTypes !== undefined) {
        await Helper.verifyFileMimeTypes(file, allowedMimeTypes)
        .catch(error => {
          alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
          Helper.setNotValidStyle(this.input)
          throw error
        })
      }

      if (allowedExtensions !== undefined) {
        await Helper.verifyFileExtension(file, allowedExtensions)
        .catch(error => {
          alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
          Helper.setNotValidStyle(this.input)
          throw error
        })
      }

      const fileReader = new FileReader()
      fileReader.onload = () => {

        const newFile = {}
        newFile.name = file.name
        newFile.type = file.type
        newFile.size = file.size
        newFile.modified = Date.now()
        newFile.html = Helper.sanitizeHtml(fileReader.result)

        Helper.setValidStyle(this.input)
        return resolve(newFile)
      }
      fileReader.readAsText(file)

    })


  }

  withInfoClick(callback) {
    if (callback !== undefined) {
      this.icon.src = "/public/info-gray.svg"
      this.icon.alt = "Mehr Infos"
      this.icon.style.display = "block"
      this.labelContainer.style.cursor = "pointer"
      this.labelContainer.childNodes.forEach(child => child.style.cursor = "pointer")
      this.labelContainer.addEventListener("click", callback)
    }
    return this
  }

  value(callback) {
    if (callback !== undefined) {
      if (callback(this.name) !== undefined) input.required = false
    }
    return this
  }

  async validPdf(file) {

    const allowedMimeTypes = ["application/pdf"]
    const allowedExtensions = ["pdf"]
    await Helper.verifyFileMimeTypes(file, allowedMimeTypes)
    .catch(error => {
      alert(`Erlaubte Dateiformate: ${allowedExtensions.join(", ")}`)
      Helper.setNotValidStyle(this.input)
      throw error
    })

    await Helper.verifyFileExtension(file, allowedExtensions)
    .catch(error => {
      alert(`Erlaubte Dateiformate: ${allowedExtensions.join(", ")}`)
      Helper.setNotValidStyle(this.input)
      throw error
    })

    const fileReader = new FileReader()
    fileReader.onload = async(event) => {

      const dataUrlSize = Helper.calculateDataUrlSize(fileReader.result)
      if (dataUrlSize > 5 * 1024 * 1024) {
        alert("PDF ist zu groß.")
        Helper.setNotValidStyle(this.input)
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

  }

  async validImage(file) {

    const allowedMimeTypes = ["image/jpeg", "image/png"]
    const allowedExtensions = ["jpg", "jpeg", "png"]

    if (allowedMimeTypes !== undefined) {
      await Helper.verifyFileMimeTypes(file, allowedMimeTypes)
      .catch(error => {
        alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
        Helper.setNotValidStyle(this.input)
        throw error
      })
    }

    if (allowedExtensions !== undefined) {
      await Helper.verifyFileExtension(file, allowedExtensions)
      .catch(error => {
        alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
        Helper.setNotValidStyle(this.input)
        throw error
      })
    }

    const dataUrl = await Helper.convertImageFileToDataUrl(file)
    const dataUrlSize = Helper.calculateDataUrlSize(dataUrl)
    if (dataUrlSize > 1024 * 1024) {
      alert("Datei ist zu groß.")
      Helper.setNotValidStyle(this.input)
      throw new Error("image too large")
    }

    const image = {}
    image.name = file.name
    image.type = file.type
    image.size = dataUrlSize
    image.modified = Date.now()
    image.dataUrl = dataUrl
    Helper.setValidStyle(this.input)
    return image

  }

  #isRequired(input) {
    if (input.required === true) return true
    if (input.accept === "text/html") return true
    return false
  }

  #checkValidity(input) {
    if (input.checkValidity() === false) return false
    return true
  }

  verifyValue() {
    if (this.#isRequired(this.input)) {
      if (this.#checkValidity(this.input)) {
        Helper.setValidStyle(this.input)
        return true
      }
      Helper.setNotValidStyle(this.input)
      return false
    }
    Helper.setValidStyle(this.input)
    return true
  }

  validValue() {
    if (this.#isRequired(this.input)) {
      if (this.#checkValidity(this.input)) {
        Helper.setValidStyle(this.input)
        return this.input.files
      }
      Helper.setNotValidStyle(this.input)
      const error = new Error(`field required: '${this.name}'`)
      error.field = this.name
      this.field.scrollIntoView({behavior: "smooth"})
      throw error
    }
    Helper.setValidStyle(this.input)
    return this.input.files
  }

  #setFields(field) {
    field.innerHTML = ""
    field.classList.add("field")
    field.style.position = "relative"
    field.style.borderRadius = "13px"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.justifyContent = "center"

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      field.style.backgroundColor = Helper.colors.dark.foreground
      field.style.border = Helper.colors.dark.border
      field.style.boxShadow = Helper.colors.dark.boxShadow
      field.style.color = Helper.colors.dark.text
    } else {
      field.style.backgroundColor = Helper.colors.light.foreground
      field.style.border = Helper.colors.light.border
      field.style.boxShadow = Helper.colors.light.boxShadow
      field.style.color = Helper.colors.light.text
    }

    const labelContainer = document.createElement("div")
    labelContainer.style.display = "flex"
    labelContainer.style.alignItems = "center"
    labelContainer.style.margin = "21px 89px 0 34px"
    this.labelContainer = labelContainer

    const icon = document.createElement("img")
    icon.style.width = "34px"
    icon.style.marginRight = "21px"
    icon.style.display = "none"
    this.icon = icon
    labelContainer.append(icon)


    const label = document.createElement("label")
    label.style.fontFamily = "sans-serif"

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      label.style.color = Helper.colors.dark.text
    } else {
      label.style.color = Helper.colors.light.text
    }

    label.style.fontSize = "21px"
    this.label = label
    labelContainer.append(label)
    field.append(labelContainer)

    const input = document.createElement("input")

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      input.style.backgroundColor = Helper.colors.dark.background
      input.style.color = Helper.colors.dark.text
    } else {
      input.style.backgroundColor = Helper.colors.light.background
      input.style.color = Helper.colors.light.text
    }

    input.type = this.type
    input.style.margin = "21px 89px 21px 34px"
    this.input = input
    field.append(input)
    return field
  }

  constructor(name, parent) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name
    this.type = "file"
    this.field = document.createElement("div")
    this.field = this.#setFields(this.field)
    if (parent !== undefined) {
      this.parent = parent
      parent.append(this.field)
    }
  }
}
