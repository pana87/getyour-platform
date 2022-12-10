const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .logo {
      display: flex;
      justify-content: flex-start;
    }
    .title {
      position: absolute;
      top: 40%;
      left: 1%;
      font-size: 24px;
      font-weight: bold;
      font-family: var(--font-family-forma_djr_micro);
      color: var(--secondary-color);
      margin: 0;
    }
    .container {
      position: relative;
      width: 100%;
      height: 100%;
    }

  </style>

  <div class="container">
    <div class="logo"></div>
    <p class="title">Toolbox</p>
  </div>
`

export class ToolboxLogo extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
    const image = document.createElement("img")
    image.src = `${window.__URL__}/img/getyour-toolbox-logo.png`
    image.alt = "Getyour Toolbox Logo"
    image.style.width = "20vw"
    image.style.maxWidth = "100px"

    this.shadowRoot.querySelector("div[class=logo]").append(image)
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

  }
}

window.customElements.define("toolbox-logo", ToolboxLogo)
