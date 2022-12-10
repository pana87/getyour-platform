export class FileField {

  #withAcceptCalled = false

  sync() {
    const inputs = document.body.querySelectorAll(this.cssSelectorInput)


    inputs.forEach(input => {
      input.addEventListener("input", () => {
        inputs.forEach(other => {
          other.files = input.files
        })
      })
    })
    return this
  }

  async storeInputToLocalStorage(storageName) {
    const file = this.#getInput()

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
    return this
  }

  #getInputAsDataUrl() {
    return new Promise((resolve, reject) => {
      const inputs = document.querySelectorAll(this.cssSelectorInput)

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

  #getInput() {
    let value = undefined
    const inputs = document.querySelectorAll(this.cssSelectorInput)
    if (inputs.length === 0) return value
    inputs.forEach(input => {
      if (input.files.length !== 0) {
        value = input.files[0]
      }
    })
    return value
  }


  #appendFileField(div) {
    // click event is on divs not on input
    const inputs = div.querySelectorAll(this.cssSelectorInput)
    inputs.forEach(input => input.remove())
    const input = this.#inputHandler()

    div.setAttribute("style", "cursor: pointer;")

    if (this.#withAcceptCalled === true) {
      this.#setAccept(input)
      this.input = input
      div.append(this.input)
      return
    }

    this.input = input
    div.append(this.input)
  }

  #setAccept(input) {
    input.accept = this.type
    return input
  }

  withAccept(type) {
    this.#withAcceptCalled = true
    this.type = type
    const divs = document.querySelectorAll(this.cssSelectorField)

    divs.forEach(div => this.#appendFileField(div))

    return this
  }

  #inputHandler() {
    const input = document.createElement("input")
    input.type = "file"
    input.name = this.className
    input.id = this.className
    input.style.visibility = "hidden"
    return input
  }

  constructor(cssSelectorField) {
    this.cssSelectorField = cssSelectorField
    this.className = this.cssSelectorField.split("=")[1].split("]")[0]
    this.cssSelectorInput = `input[name='${this.className}']`
    this.type = ""
    this.input = document.createElement("input")

    const divs = document.querySelectorAll(this.cssSelectorField)

    if (divs.length === 0) {
      return {
        status: 500,
        message: "DIV_NOT_FOUND",
      }
    }

    divs.forEach(div => {
      this.#appendFileField(div)
      div.addEventListener("click", () => this.input.click())
    })
  }
}
