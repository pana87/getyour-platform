export class Input {

  static getText(cssSelector) {
    let value = undefined
    const inputs = document.querySelectorAll(cssSelector)
    inputs.forEach(input => {
      if (input.value !== "") {
        value = input.value
      }
    })
    return value
  }


  static storeTextToLocalStorage(cssSelector, storageName) {
    const value = this.getText(cssSelector)

    if (value !== undefined) {
      const className = cssSelector.split("=")[1].split("]")[0]

      const storage = JSON.parse(window.localStorage.getItem(storageName)) || {}

      storage[className] = value

      window.localStorage.setItem(storageName, JSON.stringify(storage))
    }
  }

  // static isRequired() {

  // }

  // static withPlaceholder() {

  // }

  // input = document.createElement("input")

  static appendText(cssSelector, placeholder) {
    const divs = document.querySelectorAll(cssSelector)

    if (divs.length === 0) return undefined

    const className = cssSelector.split("=")[1].split("]")[0]

    divs.forEach(div => {
      div.innerHTML = ""

      const input = document.createElement("input")
      input.type = "text"
      input.name = className
      input.id = className
      input.placeholder = placeholder
      input.style.border = "none"
      input.style.fontSize = "24px"
      input.style.maxWidth = "250px"

      div.append(input)
      return input
    })
  }

  static getImageAsDataUrl(cssSelector) {
    return new Promise((resolve, reject) => {
      const inputs = document.querySelectorAll(cssSelector)
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

  static getFile(cssSelector) {
    let value = undefined
    const inputs = document.querySelectorAll(cssSelector)
    inputs.forEach(input => {
      if (input.files.length !== 0) {
        value = input.files[0]
      }
    })
    return value
  }

  static async storeAttachmentToLocalStorage(cssSelector, storageName) {
    const file = this.getFile(cssSelector)

    if (file !== undefined) {
      const dataUrlRx = await this.getImageAsDataUrl(cssSelector)

      if (dataUrlRx.status === 200) {
        const className = cssSelector.split("=")[1].split("]")[0]

        const storage = JSON.parse(window.localStorage.getItem(storageName)) || {}

        const attachment = {}
        attachment.name = file.name
        attachment.dataUrl = dataUrlRx.dataUrl
        attachment.type = file.type

        storage[className] = attachment
        window.localStorage.setItem(storageName, JSON.stringify(storage))
        return {
          status: 200,
          message: "STORE_ATTACHMENT_SUCCESS",
          attachment: JSON.parse(window.localStorage.getItem(storageName))[className],
        }
      }
    }
    return {
      status: 500,
      message: "STORE_ATTACHMENT_ABORT",
    }
  }

  static getNumber(cssSelector) {
    let value = undefined
    const inputs = document.querySelectorAll(cssSelector)
    inputs.forEach(input => {
      if (input.value !== "") {
        value = input.value
      }
    })
    return value
  }

  static storeNumberToLocalStorage(cssSelector, storageName) {
    const value = this.getNumber(cssSelector)

    if (value !== undefined) {
      const className = cssSelector.split("=")[1].split("]")[0]

      const storage = JSON.parse(window.localStorage.getItem(storageName)) || {}

      storage[className] = value

      window.localStorage.setItem(storageName, JSON.stringify(storage))
    }
  }

  static getSelection(cssSelector) {
    let value = undefined
    const inputs = document.querySelectorAll(cssSelector)
    inputs.forEach(input => {
      if (input.value !== input.value) return value
      value = input.value
    })
    return value
  }

  static storeSelectionToLocalStorage(cssSelector, storageName) {
    const value = this.getSelection(cssSelector)

    if (value !== undefined) {
      const className = cssSelector.split("=")[1].split("]")[0]

      const storage = JSON.parse(window.localStorage.getItem(storageName)) || {}

      storage[className] = value

      window.localStorage.setItem(storageName, JSON.stringify(storage))
    }
  }


  static appendFile(cssSelector) {
    const divs = document.querySelectorAll(cssSelector)

    if (divs.length === 0) return

    const className = cssSelector.split("=")[1].split("]")[0]

    divs.forEach(div => {
      div.setAttribute("style", "cursor: pointer;")

      const input = document.createElement("input")
      input.type = "file"
      input.id = className
      input.name = className
      input.accept = "image/*"

      div.appendChild(input)
      div.addEventListener("click", () => input.click())

      return
    })
  }


  static appendNumber(cssSelector, min, max) {
    const divs = document.querySelectorAll(cssSelector)

    if (divs.length === 0) return

    const className = cssSelector.split("=")[1].split("]")[0]

    divs.forEach(div => {
      div.innerHTML = ""

      const input = document.createElement("input")
      input.type = "number"
      input.name = className
      input.id = className
      input.min = min
      input.max = max
      input.placeholder = min
      input.style.border = "none"
      input.style.fontSize = "24px"
      input.style.width = "100px"

      div.append(input)
      return
    })
  }

  static appendSelection(cssSelector, options) {
    const divs = document.querySelectorAll(cssSelector)

    if (divs.length === 0) return

    const className = cssSelector.split("=")[1].split("]")[0]

    divs.forEach(div => {
      div.innerHTML = ""

      const select = document.createElement("select")
      select.id = className
      select.name = className
      select.style.width = "100%"
      select.style.fontSize = "24px"
      select.style.backgroundColor = "white"
      select.style.border = "none"
      select.style.cursor = "pointer"
      div.appendChild(select)

      for (let i = 0; i < options.length; i++) {
        const option = document.createElement("option")
        option.value = options[i]
        option.text = options[i]
        select.appendChild(option)
      }

      div.append(select)
      return
    })
  }
}
