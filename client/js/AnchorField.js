export class AnchorField {

  #setInnerHtml(anchor) {
    anchor.innerHTML = this.innerHtml
    return anchor
  }

  withInnerHtml(html) {
    this.innerHtml = html
    const anchors = document.querySelectorAll(this.anchorSelector)
    anchors.forEach(anchor => this.#setInnerHtml(anchor))
    return this
  }

  #setHref(anchor) {
    anchor.href = this.href
    return anchor
  }

  withHref(href) {
    this.href = href
    const anchors = document.querySelectorAll(this.anchorSelector)
    anchors.forEach(anchor => this.#setHref(anchor))
    return this
  }

  constructor(fieldSelector) {
    this.fieldSelector = fieldSelector
    this.className = this.fieldSelector.split("'")[1]
    this.anchorSelector = `a[id='${this.className}']`
    const divs = document.querySelectorAll(this.fieldSelector)
    if (divs.length === 0) {
      console.warn(`Field with class '${this.className}' not found.`)
      return
    }
    divs.forEach(div => {
      div.innerHTML = ""
      const a = document.createElement("a")
      a.id = this.className
      div.append(a)
    })
  }
}
