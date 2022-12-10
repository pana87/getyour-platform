const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    input[type=text] {
      width: 100%;
      padding: 12px 20px;
      margin: 8px 0;
      display: inline-block;
      border: 1px solid #ba1919;
      border-radius: 4px;
      box-sizing: border-box;
      background-color: #c4c5c4;
      height: 10vh;
    }
  </style>

  <label hidden for="textfield">Bezeichnung..</label>
  <input type="text" id="textfield" name="textfield" placeholder="Bezeichnung.." required>

`

export class TextField extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

window.customElements.define("getyour-text-field", TextField)
