const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .container {
      font-family: "FormaDJR Micro-Regular";
      width: 89%;
      margin: 0 auto;
    }
    .title {
      font-size: 18px;
    }
    .content {
      font-size: 14px;
    }

  </style>

  <div class="container">
    <p class="title">Beschreibung:</p>
    <div class="content"></div>

  </div>

`

export class Description extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    const content = this.shadowRoot.querySelector("div[class=content]")

    content.append(this.value)
  }

  constructor(value) {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this.value = value
  }
}

window.customElements.define("getyour-description", Description)
