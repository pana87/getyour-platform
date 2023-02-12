export class CanvasField {

  withType(callback) {
    if(callback !== undefined) document.querySelectorAll(this.canvasSelector).forEach(canvas => {
      canvas.fromStorage = (name) => {}
      callback(canvas)
    })
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.canvasSelector = `canvas[id='${this.className}']`
    this.type = "canvas"

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
