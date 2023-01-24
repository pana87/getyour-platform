export class CanvasField {

  // withPencil()

  // withMouseDownEventListener(callback) {
  //   if (callback !== undefined) window.addEventListener("mousedown", (event) => callback(event))
  //   return this
  // }
  // withMouseUpEventListener(callback) {
  //   if (callback !== undefined) window.addEventListener("mouseup", (event) => callback(event))
  //   return this
  // }

  // withMouseMoveEventListener(callback) {
  //   if (callback !== undefined) window.addEventListener("mousemove", (event) => callback(event))
  //   return this
  // }

  // withWindowResizeEventListener(callback) {
  //   if (callback !== undefined) window.addEventListener("resize", (event) => callback(event)))
  //   return this
  // }


  // withChangeEventListener(callback) {
  //   if (callback !== undefined) {
  //     const selects = document.body.querySelectorAll(this.canvasSelector)
  //     selects.forEach(select => select.addEventListener("change", (event) => callback(event)))
  //   }
  //   return this
  // }

  // #setValidStyle(select) {
  //   select.style.border = "2px solid #00c853"
  //   select.style.borderRadius = "3px"
  //   return select
  // }

  // #setNotValidStyle(select) {
  //   select.style.border = "2px solid #d50000"
  //   select.style.borderRadius = "3px"
  //   return select
  // }

  // #isRequired(select) {
  //   if (select.disabled === true) return false
  //   if (this.requiredIndex === undefined) return false
  //   return true
  // }

  // withValidValue(callback) {
  //   return new Promise((resolve, reject) => {
  //     const result = []
  //     document.querySelectorAll(this.canvasSelector).forEach(select => {
  //       if (this.#isRequired(select)) {
  //         for (let i = 0; i < select.options.length; i++) {
  //           const option = select.options[i]
  //           if (option.selected) {
  //             if (option.value === select.options[this.requiredIndex].value) {
  //               this.#setValidStyle(select)
  //               result.push(option.value || option.text)
  //               if (callback) callback(result)
  //               return resolve()
  //             }
  //           }
  //         }
  //         this.#setNotValidStyle(select)
  //         console.error(`class='${this.className}' - required valid value`)
  //         return
  //       }
  //       for (let i = 0; i < select.options.length; i++) {
  //         const option = select.options[i]
  //         if (option.selected) {
  //           this.#setValidStyle(select)
  //           result.push(option.value || option.text)
  //           if (callback) callback(result)
  //           return resolve()
  //         }
  //       }
  //     })
  //   })
  // }


  // #isEmpty(value) {
  //   return value === undefined ||
  //     value === null
  // }

  // async withStorage(name) {
  //   this.storageName = name
  //   await this.withValidValue((value) => {
  //     if (!this.#isEmpty(value)) {
  //       this.storage = JSON.parse(window.sessionStorage.getItem(this.storageName)) || {}
  //       this.storage[this.className] = value
  //       window.sessionStorage.setItem(this.storageName, JSON.stringify(this.storage))
  //     }
  //   })
  //   return this
  // }

  withCanvas(callback) {
    if(callback !== undefined) document.querySelectorAll(this.canvasSelector).forEach(canvas => callback(canvas))
    return this
  }

  // withInputEventListener(callback) {
  //   if (callback !== undefined) {
  //     const selects = document.body.querySelectorAll(this.canvasSelector)
  //     selects.forEach(select => select.addEventListener("input", (event) => callback(event)))
  //   }
  //   return this
  // }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.canvasSelector = `canvas[id='${this.className}']`

    const divs = document.body.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const canvas = document.createElement("canvas")
        canvas.id = this.className
        canvas.name = this.className

        div.append(canvas)
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
