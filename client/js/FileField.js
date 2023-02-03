export class FileField {

  withChangeEventListener(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("change", (event) => callback(event)))
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.body.querySelectorAll(this.inputSelector).forEach(input => {
      input.fromSessionStorage = (name) => {
        const files = JSON.parse(window.sessionStorage.getItem(name))[this.className]
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
      // console.log(files)
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
        this.storage = JSON.parse(window.sessionStorage.getItem(this.storageName)) || {}
        this.storage[this.className] = array
        window.sessionStorage.setItem(this.storageName, JSON.stringify(this.storage))
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
    if (input.required === true) return true
    return false
  }

  withValidValue(callback) {
    return new Promise((resolve, reject) => {
      document.querySelectorAll(this.inputSelector).forEach(async input => {
        if (this.#isRequired(input)) {
          if (input.checkValidity()) {
            this.#setValidStyle(input)
            return resolve(input.files)
          }
          this.#setNotValidStyle(input)
          console.error(`class='${this.className}' - required valid value`)
          return
        }
        this.#setValidStyle(input)
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
          console.log(canvas);
          return resolve(canvas.toDataURL(file.type))
        }
      })
    })
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
