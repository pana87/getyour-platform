export class DivField {

  withClickEventListener(callback) {
    const divs = document.querySelectorAll(this.fieldSelector)
    divs.forEach(div => {
      div.style.cursor = "pointer"
      div.addEventListener("click", (event) => {
        callback(event)
      })
    })
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) return
    console.error("FIELD_NOT_FOUND")
  }
}
