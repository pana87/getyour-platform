export class CheckboxField {

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.checkboxSelector = `input[name='${this.className}']`

    const divs = document.body.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.innerHTML = ""

        const checkbox = document.createElement("input")
        checkbox.type = "checkbox"
        checkbox.id = this.className
        checkbox.name = this.className

        div.append(checkbox)
      })
      return
    }
    console.error("FIELD_NOT_FOUND")
  }
}
