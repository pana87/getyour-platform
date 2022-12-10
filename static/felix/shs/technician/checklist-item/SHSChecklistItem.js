import { Request } from "../../../../js/Request.js"

const loginPathname = "/felix/shs/login/"

export class SHSChecklistItem extends HTMLElement {
  constructor({
    date,
    name,
    street,
    zip,
    phone,
    email,
    done,
  }) {
    super()
    this.attachShadow({ mode: "open" })
    this.date = date
    this.name = name
    this.street = street
    this.zip = zip
    this.phone = phone
    this.email = email
    this.done = done
  }

  disconnectedCallback() {
  }

  async connectedCallback() {
    // GET THE PATHS TO STATIC ASSETS
    const pathToFavicon = `${window.__PLATFORM_LOCATION__.origin}/img/favicon.png`
    const path = `${window.__COMPONENTS_LOCATION__.origin}/felix/shs/technician/checklist-item/`
    const styleguide = `${window.__PLATFORM_LOCATION__.origin}/felix/shs/technician/checklist-item/styleguide.css`


    // const token = window.sessionStorage.getItem("token") // get token from cookie

    // if (!token) {
    //   alert("Kein Token vorhanden. Bitte einloggen!")
    //   window.location.assign(loginPathname)
    //   return
    // }
    // FETCH STATIC FROM ENDPOINT request component
    const response = await Request.get(path)
    console.log(response);
    // const response = await fetch(path) // send token
    const component = JSON.parse(response)

    // if (component.status === 401) {
    //   alert("Bitte erst einloggen!")
    //   window.location.assign(loginPathname)
    // }
    // if (component.status === 403) {
    //   alert("Es gibt ein Problem mit dem Sicherheitstoken. Bitte erneut einloggen!")
    //   window.location.assign(loginPathname)
    //   return
    // }
    if (component.status === 200) this.shadowRoot.innerHTML = component.body

    // ADD LINK FOR EXTERNAL STATIC ASSETS (LINKS SHOULD BE IN LIGHT AND SHADOW DOM)
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = styleguide

    // ADD PARSED HTML TO SHADOW DOM
    console.log(component);

    // CHANGE STATIC FAVICON
    const links = this.shadowRoot.querySelectorAll("link[rel='shortcut icon']")
    links.forEach(link => link.href = pathToFavicon)


    // APPEND LINK TO LIGHT DOM
    this.append(link)

    // MAP STATIC DATA WITH CONSTRUCTOR INPUT
    this.shadowRoot.querySelectorAll(".text-1").forEach(date => date.innerHTML = `${this.date.getDate()}.${this.date.getMonth() + 1}`)
    this.shadowRoot.querySelectorAll(".name").forEach(name => name.innerHTML = this.name)
    this.shadowRoot.querySelectorAll(".zckerli-strae-22").forEach(street => street.innerHTML = this.street)
    this.shadowRoot.querySelectorAll(".address").forEach(zip => zip.innerHTML = this.zip)
    this.shadowRoot.querySelectorAll(".phone").forEach(phone => phone.innerHTML = this.phone)
    this.shadowRoot.querySelectorAll(".marcoknigwebde").forEach(email => email.innerHTML = this.email)
    this.shadowRoot.querySelectorAll("input[type=checkbox]").forEach(box => {
      box.checked = this.done
      box.addEventListener("change", () => this.done = !this.done)
    })
  }
}

window.customElements.define("getyour-shs-checklist-item", SHSChecklistItem)

