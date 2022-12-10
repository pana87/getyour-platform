const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: "FormaDJR Micro-Regular";
    }
    .icon {
      width: 50px;
      margin-top: 5%;
    }

  </style>

  <div class="container">
    <img class="icon" src="${window.__URL__}/img/funnel-icon.png" alt="Funnel Icon" />
    <h1 class="title">Funnel</h1>
  </div>

`

export class ModalHeader extends HTMLElement {

  withIcon(relativePath) {
    this.shadowRoot.querySelector("img[class=icon]").src = `${window.__URL__}/img/${relativePath}`
  }

  withTitle(title) {
    this.shadowRoot.querySelector("h1[class=title]").innerHTML = title
  }

  disconnectedCallback() {
  }

  connectedCallback() {
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }


}

window.customElements.define("getyour-modal-header", ModalHeader)
