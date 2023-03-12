export class FooterField {

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.type).forEach(footer => callback(footer))
    return this
  }

  // with

  #setFooter(footer) {

    // footer.style.width = "100%"
    // footer.style.textAlign = "center"
    // footer.style.backgroundColor = "#60a182"
    // footer.style.padding = "21px 34px"

    // const impressum = document.createElement("div")
    // impressum.innerHTML = "Impressum"
    // impressum.style.cursor = "pointer"
    // impressum.style.padding = "13px"
    // impressum.addEventListener("click", () => window.location.assign("/felix/shs/impressum/"))
    // footer.append(impressum)


    // const dsgvo = document.createElement("div")
    // dsgvo.innerHTML = "Datenschutz"
    // dsgvo.style.cursor = "pointer"
    // dsgvo.style.padding = "13px"
    // dsgvo.addEventListener("click", () => window.location.assign("/felix/shs/datenschutz/"))
    // footer.append(dsgvo)

    // const userAgreement = document.createElement("div")
    // userAgreement.innerHTML = "Nutzervereinbarung"
    // userAgreement.style.cursor = "pointer"
    // userAgreement.style.padding = "13px"
    // userAgreement.addEventListener("click", () => window.location.assign("/nutzervereinbarung/"))
    // footer.append(userAgreement)
  }

  constructor() {
    try {
      this.type = "footer"
      const fields = document.querySelectorAll(this.type)
      if (fields.length <= 0) throw new Error(`field '${this.type}' not found`)
      // fields.forEach(field => this.#setFooter(field))
    } catch (error) {
      console.error(error)
    }
  }
}
