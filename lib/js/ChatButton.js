const template = document.createElement("template")
template.innerHTML = /*html*/`

  <style>

    .container {
      width: 89%;
      margin: 0 auto;
    }

    .button {
      color: var(--primary-color);
      font-family: "FormaDJR Micro-Regular";
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      text-align: right;
      text-decoration: underline;
    }

  </style>

  <div class="container">
    <div class="button">zum Chat</div>
  </div>
`

export class ChatButton extends HTMLElement {

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

window.customElements.define("getyour-chat-button", ChatButton)
