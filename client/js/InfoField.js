export class InfoField {

  withWarning(message) {
    if (message !== undefined) {
      this.field.style.backgroundColor = "rgba(255, 204, 0, 0.5)"
      this.field.style.border = "2px solid #ffcc00"
      this.field.innerHTML = message
    }
    return this
  }

  withSuccess(message) {
    if (message !== undefined) {
      this.field.style.backgroundColor = "rgba(0, 200, 83, 0.5)"
      this.field.style.border = "2px solid #00c853"
      this.field.innerHTML = message
    }
    return this
  }

  #setInfo(field) {
    field.innerHTML = ""
    field.style.margin = "13px 34px"
    field.style.padding = "21px"
    field.style.borderRadius = "13px"
    return field
  }

  constructor(div) {
    this.type = "info"
    this.field = this.#setInfo(div)
  }
}
