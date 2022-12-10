const template = document.createElement("template")
template.innerHTML = /*html*/`
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <style>
    .icon-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      position: fixed;
      bottom: 0;
      width: 100%;
      height: 13%;
      border-top: solid 1px #a11818;
    }
    .material-icons {
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      width: 21%;
    }
    .navigation-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: white;
    }
    .icon-title {
      margin: 0;
      font-family: sans-serif;
    }

  </style>

  <div class="icon-container">

    <div class="navigation-button">
      <i class="material-icons">account_balance</i>
      <p class="icon-title">Finanzstatus</p>
    </div>

    <div class="navigation-button">
      <i class="material-icons">view_week</i>
      <p class="icon-title">Toolbox</p>
    </div>

    <div class="navigation-button">
      <i class="material-icons">notifications</i>
      <p class="icon-title">Mitteilungen</p>
    </div>

    <div class="navigation-button">
      <i class="material-icons">apps</i>
      <p class="icon-title">Mehr</p>
    </div>

  </div>

`

export class NavigationLayout extends HTMLElement {

  connectedCallback() {
    const buttons = this.shadowRoot.querySelectorAll("div[class*='navigation-button']")
    const icons = this. shadowRoot.querySelectorAll("i")

    if (window.location.pathname.startsWith("/finanzstatus/")) {
      buttons[0].style.color = "#a11818"
      icons[0].style.color = "#a11818"
    }

    if (window.location.pathname.startsWith("/toolbox/")) {
      buttons[1].style.color = "#a11818"
      icons[1].style.color = "#a11818"
    }

    if (window.location.pathname.startsWith("/mitteilungen/")) {
      buttons[2].style.color = "#a11818"
      icons[2].style.color = "#a11818"
    }

    if (window.location.pathname.startsWith("/mehr/")) {
      buttons[3].style.color = "#a11818"
      icons[3].style.color = "#a11818"
    }

    buttons[0].addEventListener("click", (event) => window.location.assign("/finanzstatus/"))
    buttons[1].addEventListener("click", (event) => window.location.assign("/toolbox/"))
    buttons[2].addEventListener("click", (event) => window.location.assign("/mitteilungen/"))
    buttons[3].addEventListener("click", (event) => window.location.assign("/mehr/"))

    buttons.forEach(button => button.style.cursor = "pointer")
  }

  disconnectedCallback() {
    const buttons = this.shadowRoot.querySelectorAll("div[class*='navigation-button']")

    buttons[0].removeEventListener("click", (event) => window.location.assign("/finanzstatus/"))
    buttons[1].removeEventListener("click", (event) => window.location.assign("/toolbox/"))
    buttons[2].removeEventListener("click", (event) => window.location.assign("/mitteilungen/"))
    buttons[3].removeEventListener("click", (event) => window.location.assign("/mehr/"))
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons"
    document.head.append(link)
  }
}

window.customElements.define("navigation-layout", NavigationLayout)
