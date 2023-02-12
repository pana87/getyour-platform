export class TooltipField {

  withContent(content) {
    this.content = content
    return this
  }

  #setTooltip(field) { // Helper
    const background = document.createElement("div")
    background.id = this.className
    background.style.display = "flex"
    background.style.alignItems = "center"
    background.style.justifyContent = "center"
    background.style.position = "fixed"
    background.style.width = "100%"
    background.style.height = "100vh"
    background.style.top = "0"
    background.style.left = "0"
    background.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
    background.style.zIndex = "10"

    const content = document.createElement("div")
    content.style.position = "relative"
    content.style.backgroundColor = "#f7f7f7"
    content.style.width = "89%"
    content.style.maxHeight = "89%"
    content.style.borderRadius = "3px"
    content.style.overflow = "auto"
    content.style.zIndex = "11"
    content.style.padding = "2%"
    content.innerHTML = field.innerHTML
    if (this.content !== undefined) content.innerHTML = this.content

    content.animate([{
      opacity: 0
    }, {
      opacity: 1
    }], {
      duration: 300,
      fill: "forwards"
    })
    background.appendChild(content)

    const tooltips = document.querySelectorAll(this.tooltipSelector)
    tooltips.forEach(tooltip => {
      tooltip.remove()
    })
    if (tooltips.length === 0) {
      field.appendChild(background)
    }
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.tooltipSelector = `div[id*='${this.className}']`
    this.type = "tooltip"
    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length > 0) {
      divs.forEach(div => {
        div.style.cursor = "pointer"
        div.addEventListener("click", (event) => {
          this.#setTooltip(div)
        })
      })
    }
    console.warn(`class='${this.className}' - field not found`)
  }
}
