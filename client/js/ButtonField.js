export class ButtonField {

  withButton(callback) {
    document.querySelectorAll(this.buttonSelector).forEach(button => callback(button))
    return this
  }

  // #setInnerHtml(button) {
  //   button.innerHTML = this.innerHtml
  //   return button
  // }

  // withInnerHtml(html) {
  //   this.innerHtml = html
  //   const buttons = document.querySelectorAll(this.buttonSelector)
  //   buttons.forEach(button => this.#setInnerHtml(button))
  //   return this
  // }

  // #setOnclick(button) {
  //   button.onclick = this.onclick
  //   return button
  // }

  // withOnclick(callback) {
  //   this.onclick = callback
  //   const buttons = document.querySelectorAll(this.buttonSelector)
  //   buttons.forEach(button => this.#setOnclick(button))
  //   return this
  // }

  // withAssign(pathname) {
  //   this.pathname = pathname
  //   this.button.onclick = () => window.location.assign(this.pathname)
  //   return this
  // }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.buttonSelector = `button[id='${this.className}']`
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
