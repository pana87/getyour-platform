export class FileField {

  #withValidityCalled = false

  #setValidStyle(input) {
    input.style.border = "2px solid green"
    input.style.borderRadius = "10px"
    return input
  }

  #setNotValidStyle(input) {
    input.style.border = "2px solid red"
    input.style.borderRadius = "10px"
    return input
  }

  withValidStyle() {
    document.querySelectorAll(this.fieldSelector).forEach(element => this.#setValidStyle(element))
    return this
  }

  withNotValidStyle() {
    document.querySelectorAll(this.fieldSelector).forEach(element => this.#setNotValidStyle(element))
    return this
  }

  #setValidity(input) {
    const divs = document.querySelectorAll(this.fieldSelector)

    if (!this.#isValid(input)) {
      divs.forEach(div => this.#setNotValidStyle(div))
    }
    if (this.#isValid(input)) {
      this.valid = this.#isValid(input)
      divs.forEach(div => this.#setValidStyle(div))
    }
  }

  withValidity() {
    this.#withValidityCalled = true
    return this
  }

  #setRequired(input) {
    input.required = this.required
    return input
  }

  withRequired() {
    this.required = true
    const inputs = document.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setRequired(input))
    return this
  }

  #setSHSDefaultStyle(input) {
    input.style.visibility = "hidden"
    return input
  }

  withSHSDefaultStyle() {
    const inputs = document.body.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setSHSDefaultStyle(input))
    return this
  }

  #isValid(input) {
    return input.files.length !== 0 &&
      input.checkValidity()
  }

  withSync() {
    const inputs = document.body.querySelectorAll(this.inputSelector)

    inputs.forEach(input => {
      input.addEventListener("input", () => {
        if (this.#withValidityCalled === true) {
          this.#setValidity(input)
        }
        inputs.forEach(other => {
          other.files = input.files

          if (this.#isValid(other)) this.files = Array.from(other.files)
        })
      })
    })
    return this
  }

  storeInputToLocalStorage(storageName) {
    const files = this.#getFiles()

    files.forEach(async file => {
      if (file !== undefined) {
        const dataUrlRx = await this.#getInputAsDataUrl()

        if (dataUrlRx.status === 200) {
          const storage = JSON.parse(window.localStorage.getItem(storageName)) || {}

          const attachment = {}
          attachment.name = file.name
          attachment.type = file.type
          attachment.dataUrl = dataUrlRx.dataUrl

          storage[this.className] = attachment
          window.localStorage.setItem(storageName, JSON.stringify(storage))
        }
      }
    })
    return this
  }

  #getInputAsDataUrl() {
    return new Promise((resolve, reject) => {
      const inputs = document.querySelectorAll(this.inputSelector)

      if (inputs.length === 0) {
        return reject({
          status: 500,
          message: "INPUT_NOT_FOUND",
        })
      }

      inputs.forEach(input => {
        if (input.files.length !== 0) {
          const fileInput = input.files[0]
          const reader = new FileReader()
          reader.readAsDataURL(fileInput)
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

              return resolve({
                status: 200,
                message: "IMAGE_CONVERT_SUCCESS",
                dataUrl: canvas.toDataURL(fileInput.type),
              })
            }
          })
        }
      })
    })
  }

  #getFiles() {
    let value = undefined
    const inputs = document.querySelectorAll(this.inputSelector)
    if (inputs.length === 0) return value
    inputs.forEach(input => {
      if (this.#isValid(input)) {
        value = Array.from(input.files)
      }
    })
    return value
  }

  #setAccept(input) {
    input.accept = this.type
    return input
  }

  withAccept(type) {
    this.type = type
    const inputs = document.body.querySelectorAll(this.inputSelector)
    inputs.forEach(input => this.#setAccept(input))
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]

    // this.className = this.fieldSelector.split("=")[1].split("]")[0]
    this.inputSelector = `input[name='${this.className}']`

    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length === 0) {
      return {
        status: 500,
        message: "DIV_NOT_FOUND",
      }
    }

    divs.forEach(div => {

      div.setAttribute("style", "cursor: pointer;")

      const input = document.createElement("input")
      input.type = "file"
      input.name = this.className
      input.id = this.className

      div.append(input)

      div.addEventListener("click", () => input.click())
    })

    // const inputs = document.body.querySelectorAll(this.inputSelector)
    // if (inputs.length === 0) {
    //   return {
    //     status: 500,
    //     message: "INPUT_NOT_FOUND",
    //   }
    // }
  }
}
