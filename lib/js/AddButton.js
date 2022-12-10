const template = document.createElement("template")
template.innerHTML = /*html*/`
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <style>

    :host {
      width: 100%;
      display: flex;
    }

    .add-button {
      background-color: #4db018dd;
      border-radius: 6px;
      box-shadow: 0px 3px 6px #00000029;
      position: relative;
      width: 100%;
      height: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      cursor: pointer;
      padding: 2% 8%;
    }

    .title {
      font-family: "FormaDJR Micro-Regular";
      font-weight: bold;
    }

  </style>

  <div class="add-button">
    <div class="title">Hinzufügen</div>
    <i class="material-icons">add</i>
  </div>
`

export class AddButton extends HTMLElement {

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
}

window.customElements.define("getyour-add-button", AddButton)
