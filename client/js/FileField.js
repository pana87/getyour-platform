export class FileField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("change", (event) => callback(event)))
    return this
  }

  withInput(callback) {
    document.body.querySelectorAll(this.inputSelector).forEach(input => callback(input))
    return this
  }

  #isEmpty(value) {
    return value === undefined ||
      value.length === 0 ||
      value === null
  }

  async withStorage(name) {
    this.storageName = name
    await this.withValidValue(() => {
      this.withValueAsDataUrl((value) => {
        if (!this.#isEmpty(value)) {
          this.storage = JSON.parse(window.sessionStorage.getItem(this.storageName)) || {}
          this.storage[this.className] = value
          window.sessionStorage.setItem(this.storageName, JSON.stringify(this.storage))
        }
      })
    })
    return this
  }

  withInputEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
    return this
  }

  #setValidStyle(input) {
    input.style.border = "2px solid #00c853"
    input.style.borderRadius = "3px"
    input.style.width = "100%"
    input.style.height = "100%"
    return input
  }

  #setNotValidStyle(input) {
    input.style.border = "2px solid #d50000"
    input.style.borderRadius = "3px"
    input.style.width = "100%"
    input.style.height = "100%"
    return input
  }

  #isRequired(input) {
    if (input.disabled === true) return false
    if (input.required !== true) return false
    return true
  }

  withValidValue(callback) {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        if (this.#isRequired(input)) {
          if (input.checkValidity()) {
            this.#setValidStyle(input)
            if (callback) callback(input.files)
            return resolve()
          }
          this.#setNotValidStyle(input)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        this.#setValidStyle(input)
        if (callback) callback(input.files)
        return resolve()
      })
    })
  }

  // #setRequired(input) {
  //   input.required = this.required
  //   return input
  // }

  // withRequired() {
  //   this.required = true
  //   const inputs = document.querySelectorAll(this.inputSelector)
  //   inputs.forEach(input => this.#setRequired(input))
  //   return this
  // }

  // #setSHSDefaultStyle(input) {
  //   input.style.visibility = "hidden"
  //   return input
  // }

  // withSHSDefaultStyle() {
  //   const inputs = document.body.querySelectorAll(this.inputSelector)
  //   inputs.forEach(input => this.#setSHSDefaultStyle(input))
  //   return this
  // }


  #setSync(input) {
    document.body.querySelectorAll(this.inputSelector).forEach(other => other.value = input.value)
    return input
  }

  withValueAsDataUrl(callback) {
    const result = []
    document.querySelectorAll(this.inputSelector).forEach(input => {
      for (let i = 0; i < input.files.length; i++) {
        const reader = new FileReader()
        reader.readAsDataURL(input.files[i])
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
            result.push(canvas.toDataURL(input.files[i].type))
            callback(result)
          }
        })
      }
    })
  }

  // #getInputAsDataUrl() {
  //   return new Promise((resolve, reject) => {
  //     const inputs = document.querySelectorAll(this.inputSelector)

  //     if (inputs.length === 0) {
  //       return reject({
  //         status: 500,
  //         message: "INPUT_NOT_FOUND",
  //       })
  //     }

  //     inputs.forEach(input => {
  //       if (input.files.length !== 0) {
  //         const fileInput = input.files[0]
  //         const reader = new FileReader()
  //         reader.readAsDataURL(fileInput)
  //         reader.addEventListener("loadend", () => {
  //           const canvas = document.createElement("canvas")
  //           const ctx = canvas.getContext("2d")
  //           const image = document.createElement("img")
  //           image.src = reader.result
  //           image.onload = () => {
  //             const width = 300
  //             const height = 300 * image.height / image.width

  //             canvas.width = width
  //             canvas.height = height
  //             ctx.drawImage(image, 0, 0, width, height)

  //             return resolve({
  //               status: 200,
  //               message: "IMAGE_CONVERT_SUCCESS",
  //               dataUrl: canvas.toDataURL(fileInput.type),
  //             })
  //           }
  //         })
  //       }
  //     })
  //   })
  // }

  // withValidFiles(callback) {
  //   document.querySelectorAll(this.inputSelector).forEach(input => {
  //     if (this.#isValid(input)) {
  //       callback(input.files)
  //     }
  //   })
  //   return this
  // }

  // #getFiles() {
  //   let value = undefined
  //   const inputs = document.querySelectorAll(this.inputSelector)
  //   if (inputs.length === 0) return value
  //   inputs.forEach(input => {
  //     if (this.#isValid(input)) {
  //       value = Array.from(input.files)
  //     }
  //   })
  //   return value
  // }

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
    this.inputSelector = `input[name='${this.className}']`

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
    console.error("FIELD_NOT_FOUND")
  }
}
