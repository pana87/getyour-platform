export class ButtonField {

  #setInnerHtml(button) {
    button.innerHTML = this.innerHtml
    return button
  }

  withInnerHtml(html) {
    this.innerHtml = html
    const buttons = document.querySelectorAll(this.buttonSelector)
    buttons.forEach(button => this.#setInnerHtml(button))
    return this
  }

  #setOnclick(button) {
    button.onclick = this.onclick
    return button
  }

  withOnclick(callback) {
    this.onclick = callback
    const buttons = document.querySelectorAll(this.buttonSelector)
    buttons.forEach(button => this.#setOnclick(button))
    return this
  }

  withAssign(pathname) {
    this.pathname = pathname
    this.button.onclick = () => window.location.assign(this.pathname)
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    // this.className = this.fieldSelector.split("=")[1].split("]")[0]
    this.buttonSelector = `button[id='${this.className}']`
    // this.pathname = ""
    // this.button = document.createElement("button")
    // this.button.onclick = () => {}

    const divs = document.querySelectorAll(this.fieldSelector)

    if (divs.length === 0) {
      console.warn(`Field with class '${this.className}' not found.`)
      return
    }

    divs.forEach(div => {
      div.innerHTML = ""

      const button = document.createElement("button")
      // button.type = "email"
      // button.name = this.className
      button.id = this.className

      div.append(button)

      // div.setAttribute("style", "cursor: pointer;")
      // div.addEventListener("click", (event) => {
      //   event.stopPropagation()
      //   event.preventDefault()
      //   this.button.click()
      // })
    })
  }
}
