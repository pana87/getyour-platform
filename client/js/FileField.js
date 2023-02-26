import { Helper } from "./Helper.js"

export class FileField {

  withLabel(callback) {
    if (callback !== undefined) {
      // this.withLabelName = name
      // this.#setFields()
      document.querySelectorAll(this.labelSelector).forEach(label => callback(label))

      // document.querySelectorAll(this.fieldSelector).forEach(field => this.#setFile(field))
    }
    return this
  }

  onChange(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("change", (event) => callback(event)))
    return this
  }

  fromStorage(name) {
    if (name === "shsFunnel") {
      document.querySelectorAll(this.inputSelector).forEach(input => {
        const shsFunnel = Helper.getFunnelByStorageName(name)
        const files = shsFunnel.value[this.name]
        if (files !== undefined) input.required = false
      })
      return this
    }
    const files = JSON.parse(window.localStorage.getItem(name))
    if (files !== undefined) input.required = false
    return this
  }

  withType(callback) {
    if (callback !== undefined) {
      // this.withTypeCallback = callback
      // this.#setFields()
      document.querySelectorAll(this.inputSelector).forEach(input => callback(input))

    }
    return this
  }

  #isEmpty(value) {
    return value === undefined ||
      value.length <= 0 ||
      value === null
  }

  async withStorage(name) {
    this.withStorageName = name
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
      Helper.setFunnel({
        name: this.withStorageName,
        key: this.name,
        value: array
      })

      // const storage = JSON.parse(window.localStorage.getItem(this.storageName))
      // storage.value[this.name] = array
      // window.localStorage.setItem(this.storageName, JSON.stringify(storage))
    }
    // try {
    // } catch (error) {
    //   console.error(error)
    // }
    return this
  }

  onInput(callback) {
    if (callback !== undefined) document.querySelectorAll(this.inputSelector).forEach(input => input.addEventListener("input", (event) => callback(event)))
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

  with({withElement, withField, withInput, withLabel}) {
    if (withElement !== undefined) this.fields.push(withElement)
    if (withField !== undefined) this.withFieldCallback = withField
    if (withInput !== undefined) this.withInputCallback = withInput
    if (withLabel !== undefined) this.withLabelCallback = withLabel
    this.#setFields()
    return this
  }

  withField(callback) {
    if (callback !== undefined) {
      // this.withFieldCallback = callback
      // this.#setFields()
      document.querySelectorAll(this.fieldSelector).forEach(field => callback(field))
    }
    return this
  }

  // build() {
  //   this.#setFields()
  //   return this
  // }

  #setFields() {

    for (let i = 0; i < this.fields.length; i++) {
      // const element = this.fields[i];
      this.fields[i].innerHTML = ""
      this.fields[i].classList.add(this.name)


      // console.log("hiho wie oft?");
      // const container = document.createElement("div")

      this.fields[i].style.position = "relative"
      this.fields[i].style.backgroundColor = "rgba(255, 255, 255, 0.6)"
      this.fields[i].style.borderRadius = "13px"
      this.fields[i].style.border = "0.3px solid black"
      this.fields[i].style.display = "flex"
      this.fields[i].style.flexDirection = "column"
      this.fields[i].style.margin = "34px"
      this.fields[i].style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
      this.fields[i].style.justifyContent = "center"
      this.fields[i].style.cursor = "pointer"

      const label = document.createElement("label")
      // label.classList.add(this.name)
      label.classList.add(this.name)
      // label.id = this.name

      // if (this.withLabelName !== undefined) {
      //   label.innerHTML = this.withLabelName
      // }
      label.style.color = "#707070"
      label.style.fontSize = "21px"
      label.style.margin = "21px 34px 0 34px"
      label.setAttribute("for", this.name)
      // label.style.cursor = "pointer"

      const input = document.createElement("input")
      input.classList.add(this.name)
      input.type = this.type
      // input.name = this.name
      // input.id = this.name

      input.style.margin = "21px 89px 21px 34px"
      input.style.maxWidth = "300px"
      // input.style.cursor = "pointer"
      // field.addEventListener("click", () => input.click())

      if (this.withLabelCallback !== undefined) this.withLabelCallback(label)
      if (this.withInputCallback !== undefined) this.withInputCallback(input)
      if (this.withFieldCallback !== undefined) this.withFieldCallback(this.fields[i])
      this.fields[i].append(label, input)

    }



    // field.append(container)
  }

  constructor(name) {
    if (Helper.stringIsEmpty(name)) throw new Error("field name is empty")
    this.name = name
    this.fieldSelector = `div[class='${this.name}']`
    this.inputSelector = `input[class='${this.name}']`
    this.labelSelector = `label[class='${this.name}']`
    this.type = "file"
    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    // if (fields.length <= 0) throw new Error(`field '${this.name}' not found`)
    this.#setFields()
    // for (let i = 0; i < this.fields.length; i++) {
    // }
    // try {
    //   // fields.forEach(field => this.#setFile(field))
    // } catch (error) {
    //   console.error(error);
    // }
  }
}
