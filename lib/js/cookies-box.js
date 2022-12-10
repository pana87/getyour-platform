const template = document.createElement("template")
template.innerHTML = /*html*/`

  <style>
    :host {
      display: flex;
      flex-direction: column;
      position: fixed;
      right: 0;
      bottom: 0;
      background: transparent;
      padding: min(5vw, 8px);
      background: white;
      z-index: 10;
    }

    [data-test="horizontal-flex"] {
      display: flex;
      justify-content: space-around;
      padding: min(5vw, 8px);
    }

    [data-test="info-text"] {
      font-size: 3vw;
    }

    [data-test="disagree"] {
      text-align: center;
      width: 30vw;
      color: grey;
      font-weight: bold;
      border: none;
      outline: none;
      cursor: pointer;
      padding: min(4vw, 8px);
      font-size: 3vw;
      transition: color 1s;
    }

    [data-test="disagree"]:hover {
      color: red;
    }

    [data-test="agree"] {
      text-align: center;
      width: 30vw;
      padding: min(4vw, 8px);
      background-color: #4caf50;
      color: black;
      font-weight: bold;
      font-size: 3vw;
      cursor: pointer;
      box-shadow: 0 1px 4px grey;
      border-radius: 5px;
      transition: background-color 1s;
    }

    [data-test="agree"]:hover {
      background-color: #81c784;
    }

    @media screen and (min-width: 767px) {
      [data-test="agree"],
      [data-test="disagree"] {
        font-size: 1vw;
      }

      [data-test="info-text"] {
        font-size: 1vw;
      }

      :host {
        width: 30vw;
        margin: min(2vw, 5px);
        border-radius: 5px;
        box-shadow: 0 1px 4px #d8c890;
      }
    }
  </style>

  <p data-test="info-text">Damit wir Dir einen angenehmen und sicheren Internetauftritt bieten können, verwendet diese Webseite Cookies.</p>
  <div data-test="horizontal-flex">
    <div data-test="agree">OK</div>
    <div data-test="disagree">Nein, Danke</div>
  </div>

`

export class GetyourCookiesBox extends HTMLElement {

  connectedCallback() {
    if (window.localStorage.getItem("cookies")) this.remove()
    if (window.localStorage.getItem("cookies") === "false") _removeTags()
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    const agreeButton = this.shadowRoot.querySelector("div[data-test='agree']")
    const disagreeButton = this.shadowRoot.querySelector("div[data-test='disagree']")

    agreeButton.addEventListener("click", () => {
      window.localStorage.setItem("cookies", true)
      this.remove()
    })

    disagreeButton.addEventListener("click", () => {
      window.localStorage.setItem("cookies", false)
      _removeTags()
      this.remove()
    })
  }

  appendToBody() {
    document.querySelector("body").append(this)
    return this
  }
}

window.customElements.define("getyour-cookies-box", GetyourCookiesBox)

/**
 * Remove DSGVO tracking tags here.
 */
function _removeTags() {
  const tags = document.querySelectorAll("script[class*='ga-tag']")
  console.log(tags);
  document.querySelectorAll("script[class*='ga-tag']").forEach(tag => tag.remove())
}
