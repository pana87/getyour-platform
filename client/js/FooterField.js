export class FooterField {

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.type).forEach(footer => callback(footer))
    return this
  }

  constructor() {
    this.type = "footer"
    const fields = document.querySelectorAll(this.type)
    if (fields.length <= 0) throw new Error(`field '${this.type}' not found`)
  }
}
