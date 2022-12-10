const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      height: 13vh;
      width: 89%;
      margin: 3% auto;
      background-color: #9d9f9d;
      border-radius: 5px;
      position: relative;
    }
    .title {
      position: absolute;
      top: 20%;
      left: 40%;
      font-family: "FormaDJR Micro-Regular";
      font-weight: bold;
      font-size: 24px;
      margin: 0;
    }
  </style>

  <div class="container">
    <p class="title"></p>
  </div>

`

export class Funnel extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    this.shadowRoot.querySelector("p[class=title]").innerHTML = this.name

    // const addButton = new AddButton()
    // addButton.style.position = "absolute"
    // addButton.style.width = "55%"
    // addButton.style.bottom = "20%"
    // addButton.style.height = "34px"
    // this.shadowRoot.querySelector("div[class=container]").append(addButton)
    // addButton.addEventListener("click", (event) => new ModalBuilder().with(new InteractionStartForm()))
  }

  constructor(name) {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this.name = name
  }
}

window.customElements.define("getyour-funnel", Funnel)
