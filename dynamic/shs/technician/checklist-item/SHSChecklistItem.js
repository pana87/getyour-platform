// const template = document.createElement("template")
// template.innerHTML = /*html*/`

// `

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
    // this.shadowRoot.appendChild(template.content.cloneNode(true))
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
    const path = `${window.__PLATFORM_LOCATION__.origin}/felix/shs/technician/checklist-item/`
    const styleguide = `${path}styleguide.css`

    // FETCH STATIC FROM ENDPOINT
    const response = await fetch(path)
    const data = await response.text()

    // ADD LINK FOR EXTERNAL STATIC ASSETS (LINKS SHOULD BE IN LIGHT AND SHADOW DOM)
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = styleguide

    // ADD PARSED HTML TO SHADOW DOM
    console.log(data);
    this.shadowRoot.innerHTML = data

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

