import { Funnel } from "./Funnel.js"

const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>

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

  <div class="title"></div>
  <img class="line" src="${window.__URL__}/img/linie-153@1x.png" alt="Trennlinie" />


`

export class Platform extends HTMLElement {

  funnels = []

  disconnectedCallback() {
  }

  connectedCallback() {
    this.shadowRoot.querySelector("div[class=title]").innerHTML = this.name
  }

  constructor(name) {
    super()
    this.name = name
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

window.customElements.define("getyour-platform", Platform)
