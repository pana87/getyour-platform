import { ModalBuilder } from "./ModalBuilder.js"
import { PlatformForm } from "./PlatformForm.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

  <style>
    .add-button {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-around;
      align-items: center;
      height: 8vh;
      cursor: pointer;
      border: 2px solid var(--secondary-color);
      border-radius: 5px;
    }
    .title {
      color: var(--secondary-color);
      font-family: var(--font-family-formadjr_micro-regular);
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
    }
    .material-icons {
      border: 2px solid var(--secondary-color);
      border-radius: 50%;
      font-size: 34px;
      color: var(--secondary-color);
    }
  </style>

  <div class="add-button">
    <i class="material-icons">add</i>
    <p class="title">Plattform hinzufügen</p>
  </div>
`

export class PlatformButton extends HTMLElement {

  disconnectedCallback() {
    this.removeEventListener("click", () => new ModalBuilder().with(new PlatformForm()))
  }

  connectedCallback() {
    this.addEventListener("click", () => new ModalBuilder().with(new PlatformForm()))
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

  }
}

window.customElements.define("getyour-platform-button", PlatformButton)
