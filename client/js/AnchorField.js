export class AnchorField {


  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.anchorSelector).forEach(anchor => {
      anchor.fromStorage = (name) => {}
      callback(anchor)
    })
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.anchorSelector = `a[id='${this.className}']`
    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""
        const a = document.createElement("a")
        a.id = this.className
        div.append(a)
      })
      return
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
