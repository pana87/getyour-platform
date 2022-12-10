export class ButtonField {

  #withOnclickCalled = false
  #withAssignCalled = false

  withOnclick(onclickCallback) {
    this.#withOnclickCalled = true
    this.button.onclick = onclickCallback

    return this
  }

  withAssign(pathname) {
    this.#withAssignCalled = true
    this.pathname = pathname
    this.button.onclick = () => window.location.assign(this.pathname)

    return this
  }

  constructor(cssSelector) {
    this.cssSelector = cssSelector
    this.className = this.cssSelector.split("=")[1].split("]")[0]
    this.pathname = ""
    this.button = document.createElement("button")
    this.button.onclick = () => {}

    const divs = document.querySelectorAll(this.cssSelector)

    if (divs.length === 0) {
      console.error("DIV_NOT_FOUND")
      return {
        status: 500,
        message: "DIV_NOT_FOUND",
      }
    }

    divs.forEach(div => {
      div.setAttribute("style", "cursor: pointer;")
      div.addEventListener("click", (event) => {
        event.stopPropagation()
        event.preventDefault()
        this.button.click()
      })
    })
  }
}
