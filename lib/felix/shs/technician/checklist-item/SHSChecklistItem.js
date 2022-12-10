const template = document.createElement("template")
template.innerHTML = /*html*/`

`

export class SHSChecklistItem extends HTMLElement {

  disconnectedCallback() {
  }

  async connectedCallback() {
    const response = await fetch("http://localhost:8888/felix/shs/technician/checklist-item/")
    console.log(response);
    const data = await response.text()
    console.log(data);
    this.shadowRoot.innerHTML = data
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

window.customElements.define("getyour-shs-checklist-item", SHSChecklistItem)
