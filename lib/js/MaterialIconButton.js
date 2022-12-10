const template = document.createElement("template")
template.innerHTML = /*html*/`
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <style>

    .container {
      background-color: #4db018dd;
      border-radius: 6px;
      box-shadow: 0px 3px 6px #00000029;
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      cursor: pointer;
    }

    .title {
      font-family: "FormaDJR Micro-Regular";
      font-weight: bold;
    }

  </style>

  <div class="container">
    <div class="title">Hinzufügen</div>
    <i class="material-icons">add</i>
  </div>
`

export class MaterialIconButton extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  withTitle(title) {
    this.shadowRoot.querySelector("div[class=title]").innerHTML = title
  }
  withIcon(materialIconName) {
    this.shadowRoot.querySelector("i[class=material-icons]").innerHTML = materialIconName
  }
  withIconRoundedBorder() {
    this.shadowRoot.querySelector("i[class=material-icons]").style.border = "2px solid var(--primary-color)"
    this.shadowRoot.querySelector("i[class=material-icons]").style.borderRadius = "50%"
  }
  withPadding(padding) {
    this.shadowRoot.querySelector("div[class=container]").style.padding = padding

  }
}

window.customElements.define("getyour-material-icon-button", MaterialIconButton)
