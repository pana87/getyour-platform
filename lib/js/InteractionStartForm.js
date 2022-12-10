import { ChatButton } from "./ChatButton.js"
import { Description } from "./Description.js"
import { ImportantBox } from "./ImportantBox.js"
import { ModalHeader } from "./ModalHeader.js"
import { StartButton } from "./StartButton.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
  </style>

  <div class="container"></div>
`

export class InteractionStartForm extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    const container = this.shadowRoot.querySelector("div[class=container]")

    container.append(new ModalHeader())
    container.append(new Description("Get-your Funnel, damit “das Netzwerk” qualifiziert, befragt und geworben werden kann."))
    container.append(new ImportantBox([
      "- Akteur beantwortet Fragen bis zum Ende.",
      "- Akteur gibt die “richtige” Antwort an.",
      "- Wie werden die gewonnen Info’s ausgewertet?"
    ]))
    container.append(new ChatButton())

    const startButton = new StartButton()
    container.append(startButton)
    startButton.addEventListener("click", () => window.location.assign("/toolbox/funnel/"))
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

window.customElements.define("getyour-interaction-start-form", InteractionStartForm)
