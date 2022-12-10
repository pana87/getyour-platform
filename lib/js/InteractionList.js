import { Interaction } from "./Interaction.js";
import { _getInteractionsFromLocalStorage } from "./storage.js";

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .container {
      display: flex;
      flex-direction: column;
    }
    .title {
      color: var(--secondary-color);
      font-family: var(--font-family-formadjr_micro-bold);
      font-size: 33px;
      font-style: normal;
      font-weight: 700;
      text-align: center;
      margin: 1% 0;
    }

    .line {
      display: flex;
      height: 1px;
      width: 89%;
      margin: 0 auto;
    }
  </style>

  <div class="title">Produkte</div>
  <img class="line" src="${window.__URL__}/img/linie-153@1x.png" alt="Trennlinie" />

  <div class="container"></div>

`

export class InteractionList extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    const container = this.shadowRoot.querySelector("div[class=container]")
    console.log(container);

    const interactions = _getInteractionsFromLocalStorage()

    interactions.forEach(interaction => {
      container.append(new Interaction(interaction.name))
    })

  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

  }
}

window.customElements.define("getyour-interaction-list", InteractionList)
