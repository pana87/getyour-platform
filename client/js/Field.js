import { Helper } from "./Helper.js"

export class Field {

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(field => callback(field))
    return this
  }

  onClick(callback) {
    document.querySelectorAll(this.fieldSelector).forEach(field => {
      field.style.cursor = "pointer"
      field.addEventListener("click", (event) => callback(event))
    })
    return this
  }

  constructor(cssSelector) {
    try {
      if (Helper.stringIsEmpty(cssSelector)) throw new Error("css selector is empty")
      // this.className = className
      this.fieldSelector = cssSelector
      this.type = "field"
      this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
      // if (fields.length <= 0) throw new Error(`field '${this.fieldSelector}' not found`)
    } catch (error) {
      console.error(error);
    }
  }
}
