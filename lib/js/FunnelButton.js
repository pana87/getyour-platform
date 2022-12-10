const template = document.createElement("template")
template.innerHTML = /*html*/`
  <div class="container"></div>

`

export class FunnelButton extends HTMLElement {

  disconnectedCallback() {
  }

  async connectedCallback() {
    // console.log("hi");
    // const response = await fetch(`${window.__URL__}/layouts/funnel-button`)

    let html
    fetch(`${window.__URL__}/layouts/funnel-button`).then(response => response.text()).then(data => {

      // this.shadowRoot.querySelector("div[class=container]").append(data)

      var div = document.createElement('div');
      div.innerHTML = data.trim();

      // Change this to div.childNodes to support multiple top-level nodes.
      // return div.firstChild;
      console.log(div.firstChild);
      console.log(div);

      this.shadowRoot.querySelector("div[class=container]").append(div.firstChild)

    })
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

  }
}

window.customElements.define("getyour-funnel-button", FunnelButton)
