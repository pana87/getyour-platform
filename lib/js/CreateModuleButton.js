import { InteractionBuilder } from "./InteractionBuilder.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .create-module-button {
      position: absolute;
      top: 0;
      right: 8%;
      font-size: 144%;
      color: white;
      cursor: pointer;
    }
  </style>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <i class="material-icons create-module-button">add_circle_outline</i>
`

export class CreateModuleButton extends HTMLElement {

  disconnectedCallback() {
    this.shadowRoot.querySelector("i").removeEventListener("click", (event) => new InteractionBuilder())
  }

  connectedCallback() {
    this.shadowRoot.querySelector("i").addEventListener("click", (event) => new InteractionBuilder())
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

window.customElements.define("create-module-button", CreateModuleButton)
