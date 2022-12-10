import { Platform } from "./Platform.js";
import { _getListOfPlatforms } from "./storage.js";

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .container {
      display: flex;
      flex-direction: column;
    }
  </style>


  <div class="container"></div>

`

export class PlatformList extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    const container = this.shadowRoot.querySelector("div[class=container]")

    const platforms = _getListOfPlatforms()

    if (platforms.length === 0) return

    platforms.forEach(platform => {
      container.append(platform)
    })

  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

  }
}

window.customElements.define("getyour-platform-list", PlatformList)
