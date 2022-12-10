const template = document.createElement("template")
template.innerHTML = /*html*/`
  <div class="container"></div>
`

export class IFrame extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    const iframe = document.createElement("iframe")
    iframe.src = this.src
    iframe.style.border = "none"
    this.shadowRoot.querySelector("div[class=container]").append(iframe)
  }

  constructor(src) {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this.src = src
  }
  getIFrame() {
    return this.shadowRoot.querySelector("iframe")
  }

}

window.customElements.define("getyour-iframe", IFrame)
