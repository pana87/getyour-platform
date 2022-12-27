const template = document.createElement("template")
template.innerHTML = /*html*/`

`

export class UserView extends HTMLElement {

  disconnectedCallback() {
  }

  async connectedCallback() {
    // GET DATA FROM STORAGE AND APPEND MODULES (HEADER, PLATFORM SIDEBAR, CONTENT FEED)


    // GET THE PATHS TO STATIC ASSETS
    // const pathToFavicon = `${window.__URL__}/img/favicon.png`
    // const path = `${window.__URL__}/felix/shs/technician/checklist-item/`
    // const styleguide = `${path}styleguide.css`

    // // FETCH STATIC FROM ENDPOINT
    // const response = await fetch(path)
    // const data = await response.text()

    // // ADD LINK FOR EXTERNAL STATIC ASSETS (LINKS SHOULD BE IN LIGHT AND SHADOW DOM)
    // const link = document.createElement("link")
    // link.rel = "stylesheet"
    // link.href = styleguide

    // ADD PARSED HTML TO SHADOW DOM
    // this.shadowRoot.innerHTML = data

    // // CHANGE STATIC FAVICON
    // const links = this.shadowRoot.querySelectorAll("link[rel='shortcut icon']")
    // links.forEach(link => link.href = pathToFavicon)


    // // APPEND LINK TO LIGHT DOM
    // this.append(link)

    // // MAP STATIC DATA WITH CONSTRUCTOR INPUT
    // this.shadowRoot.querySelectorAll(".text-1").forEach(date => date.innerHTML = `${this.date.getDate()}.${this.date.getMonth() + 1}`)
    // this.shadowRoot.querySelectorAll(".name").forEach(name => name.innerHTML = this.name)
    // this.shadowRoot.querySelectorAll(".zckerli-strae-22").forEach(street => street.innerHTML = this.street)
    // this.shadowRoot.querySelectorAll(".address").forEach(zip => zip.innerHTML = this.zip)
    // this.shadowRoot.querySelectorAll(".phone").forEach(phone => phone.innerHTML = this.phone)
    // this.shadowRoot.querySelectorAll(".marcoknigwebde").forEach(email => email.innerHTML = this.email)
    // this.shadowRoot.querySelectorAll("input[type=checkbox]").forEach(box => {
    //   box.checked = this.done
    //   box.addEventListener("change", () => this.done = !this.done)
    // })
  }

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.userName = window.location.pathname.split("/")[1]
    console.log(this.userName);
  }
}

window.customElements.define("getyour-user-view", UserView)

