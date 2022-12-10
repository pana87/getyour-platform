const template = document.createElement("template")
template.innerHTML = /*html*/`

  <style>
    .container {
      width: 89%;
      margin: 5% auto;
      border: 1px solid var(--signal-color);
      border-radius: 11px;
      background-color: #ffffff;
      padding: 5% 3%;
      font-family: "FormaDJR Micro-Regular";
    }
  </style>

  <div class="container">
    <div class="title">DAS IST WICHTIG:</div>
  </div>

`

export class ImportantBox extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    this.listOfStrings.forEach(string => {
      const p = document.createElement("p")
      p.innerHTML = string
      this.shadowRoot.querySelector("div[class=container]").append(p)
    })
  }

  constructor(listOfStrings = []) {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this.listOfStrings = listOfStrings
  }
}

window.customElements.define("getyour-important-box", ImportantBox)
