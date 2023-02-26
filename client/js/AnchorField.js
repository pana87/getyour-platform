import { Helper } from "./Helper.js"

export class AnchorField {


  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.anchorSelector).forEach(anchor => {
      anchor.fromStorage = (name) => {}
      callback(anchor)
    })
    return this
  }

  #setAnchor(field) {
    field.innerHTML = ""

    const a = document.createElement("a")
    a.id = this.className

    field.append(a)
  }

  constructor(className) {
    try {
      if (Helper.stringIsEmpty(className)) throw new Error("class name is empty")
      this.className = className
      this.fieldSelector = `[class='${this.className}']`
      this.anchorSelector = `a[id='${this.className}']`
      this.type = "anchor"
      const fields = document.querySelectorAll(this.fieldSelector)
      if (fields.length <= 0) throw new Error(`field '${this.className}' not found`)
      fields.forEach(field => this.#setAnchor(field))
    } catch (error) {
      console.error(error);
    }
  }
}
