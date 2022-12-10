const template = document.createElement("template")
template.innerHTML = /*html*/`
  <style>
    .modal-background {
      position: fixed;
      width: 100%;
      height: 100vh;
      top: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      visibility: hidden;
      opacity: 0;
      transform: scale(1.2);
      transition: all 0.6s cubic-bezier(0.55, 0, 0.1, 1);
    }
    .modal-background.active {
      visibility: visible;
      opacity: 1;
      transform: scale(1);
    }
    .modal {
      position: relative;
      background-color: rgba(157, 159, 157, 1);
      width: 89%;
      max-height: 89%;
      border-radius: 3px;
      overflow: auto;
    }
    .close-button {
      cursor: pointer;
    }
    .content {
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .sticky-container {
      display: flex;
      justify-content: flex-end;
      position: sticky;
      bottom: 0;
    }
  </style>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <div class="modal-background">
    <div class="modal">
      <div class="content"></div>
      <div class="sticky-container">
        <i class="material-icons close-button">close</i>
      </div>
    </div>
  </div>
`

export class ModalBuilder extends HTMLElement {

  disconnectedCallback() {
    this.shadowRoot.querySelector(".close-button").removeEventListener("click", () => this.close())
  }

  connectedCallback() {
    this.open()


    this.shadowRoot.querySelector(".close-button").addEventListener("click", () => this.close())
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    document.body.append(this)
  }

  open() {
    this.shadowRoot.querySelector('.modal-background').classList.add('active')
  }

  async close() {
    this.shadowRoot.querySelector(".modal-background").classList.remove("active")
    await new Promise((resolve, reject) => setTimeout(resolve, 600))
    document.querySelectorAll("getyour-modal-builder").forEach(element => element.remove())
  }

  with(content) {
    this.shadowRoot.querySelector("div[class*='content']").append(content)
  }
}

window.customElements.define("getyour-modal-builder", ModalBuilder)
