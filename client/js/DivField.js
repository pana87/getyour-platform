import { Helper } from "/js/Helper.js"

export class DivField {

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(div => callback(div))
    return this
  }

  onClick(callback) {
    const divs = document.querySelectorAll(this.fieldSelector)
    divs.forEach(div => {
      div.style.cursor = "pointer"
      div.addEventListener("click", (event) => callback(event))
    })
    return this
  }

  #setDiv(field) {
    field.innerHTML = ""
    field.classList.add(this.name)
  }

  constructor(name) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name
    this.fieldSelector = `div[class='${this.name}']`
    this.type = "div"
    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    for (let i = 0; i < this.fields.length; i++) {
      this.#setDiv(this.fields[i])
    }
  }
}
