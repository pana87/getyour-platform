import { MaterialIconButton } from "./MaterialIconButton.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`

  <style>

    .container {
      width: 89%;
      margin: 8% auto 3% auto;
      display: flex;
      justify-content: right;
    }

  </style>

  <div class="container"></div>
`

export class StartButton extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    const startButton = new MaterialIconButton()
    startButton.withTitle("Start")
    startButton.withIcon("rocket_launch")
    startButton.withPadding("3% 8%")
    startButton.style.width = "20%"
    this.shadowRoot.querySelector("div[class=container]").append(startButton)
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

  }
}

window.customElements.define("getyour-start-button", StartButton)
