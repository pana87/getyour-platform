export class DivField {

  withDiv(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(div => callback(div))
    return this
  }

  withOverlayClickEventListener(callback) {
    const divs = document.querySelectorAll(this.fieldSelector)
    divs.forEach(div => {
      div.style.cursor = "pointer"
      div.addEventListener("click", (event) => {
        const overlay = document.createElement("div")
        overlay.classList.add("with-overlay-click-event-listener")
        overlay.style.width = "100vw"
        overlay.style.height = "100vh"
        overlay.style.backgroundColor = "black"
        overlay.style.position = "fixed"
        overlay.style.top = "0"
        overlay.style.left = "0"
        overlay.style.opacity = "0.6"
        event.addOverlay = () => document.body.append(overlay)
        event.removeOverlay = () => document.querySelectorAll("div[class*='with-overlay-click-event-listener']").forEach(div => div.remove())

        callback(event)
      })
    })
    return this
  }

  withClickEventListener(callback) {
    const divs = document.querySelectorAll(this.fieldSelector)
    divs.forEach(div => {
      div.style.cursor = "pointer"
      div.addEventListener("click", (event) => callback(event))
    })
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) return
    console.warn(`class='${this.className}' - field not found`)
  }
}
