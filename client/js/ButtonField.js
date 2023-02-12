export class ButtonField {

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.buttonSelector).forEach(button => {
      button.fromStorage = (name) => {}
      callback(button)
    })
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.buttonSelector = `button[id='${this.className}']`
    this.type = "button"
    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""
        const button = document.createElement("button")
        button.id = this.className
        div.append(button)
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
