import { InteractionBuilder } from "./InteractionBuilder.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

  <style>
    .add-button {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 21vh;
      cursor: pointer;
    }
    .title {
      color: rgba(86, 172, 40, 1);
      font-family: var(--font-family-formadjr_micro-regular);
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
    }
    .material-icons {
      border: 2px solid rgba(86, 172, 40, 1);
      border-radius: 50%;
      font-size: 55px;
      color: rgba(86, 172, 40, 1);
    }
  </style>

  <div class="add-button">
    <i class="material-icons">add</i>
    <p class="title">Module hinzufügen</p>
  </div>
`

export class AddInteractionButton extends HTMLElement {

  disconnectedCallback() {
    this.removeEventListener("click", () => new InteractionBuilder())
  }

  connectedCallback() {
    this.addEventListener("click", () => new InteractionBuilder())
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

  }
}

window.customElements.define("add-interaction-button", AddInteractionButton)
