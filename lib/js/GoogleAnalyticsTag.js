const template = document.createElement("template")

template.innerHTML = /*html*/`
  <style>

  </style>

`

export class GoogleAnalyticsTag extends HTMLElement {

  disconnectedCallback() {
  }

  connectedCallback() {
  }

  constructor(tag) {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    const scriptOne = document.createElement("script")
    scriptOne.classList.add("ga-tag")
    scriptOne.setAttribute("async", "true")
    scriptOne.setAttribute("src", `https://www.googletagmanager.com/gtag/js?id=${tag}`)

    const scriptTwo = document.createElement("script")
    scriptTwo.classList.add("ga-tag")
    scriptTwo.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', '${tag}');
    `

    document.head.append(scriptOne.cloneNode(true))
    document.head.append(scriptTwo.cloneNode(true))
  }
}

window.customElements.define("getyour-google-analytics-tag", GoogleAnalyticsTag)
