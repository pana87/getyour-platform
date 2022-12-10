import { InteractionButton } from "./InteractionButton.js"
import { PlatformButton } from "./PlatformButton.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .container {
      display: flex;
      flex-direction: column;
      width: 89%;
      margin: 0 auto;
      border-radius: 5px;
      position: relative;
    }
    .container * {
      margin: 1% 0;
    }
  </style>

  <div class="container"></div>

`

export class MoreList extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    this.shadowRoot.querySelector("div[class=container]").append(new PlatformButton())
    this.shadowRoot.querySelector("div[class=container]").append(new InteractionButton())
  }

  constructor(name) {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

window.customElements.define("getyour-more-list", MoreList)
