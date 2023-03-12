import { Helper } from "./Helper.js"

export class OfferField {

  withOptionSelected(callback) {
    if (callback !== undefined) this.withOptionSelectedCallback = callback
    return this
  }

  withOffer(offer) {
    if (offer !== undefined) this.offer = offer
    return this
  }

  buildOffer() {
    document.body.querySelectorAll(this.fieldSelector).forEach(field => this.#setOffer(field))
    return this
  }

  withOffers(offers) {
    if (offers !== undefined) this.offers = offers
    return this
  }

  buildOffers() {
    document.body.querySelectorAll(this.fieldSelector).forEach(field => this.#setOffers(field))
    return this
  }

  #setOffer(field) {
    field.innerHTML = ""

    // const imageContainer = document.createElement("div")
    // imageContainer.style.display = "flex"
    // imageContainer.style.justifyContent = "flex-end"
    // imageContainer.style.margin = "144px 34px 34px 34px"
    // // offerImage.style.display = "flex"

    // const offerImage = document.createElement("img")
    // offerImage.src = this.offer.image.src
    // offerImage.alt = this.offer.image.alt
    // offerImage.style.width = "50vw"
    // offerImage.style.maxWidth = "377px"

    // imageContainer.append(offerImage)
    // field.append(imageContainer)


    // const producerContainer = document.createElement("div")
    // producerContainer.style.margin = "34px"
    // producerContainer.style.fontSize = "21px"

    // const from = document.createElement("p")
    // from.innerHTML = "Von:"

    // const producerCompany = document.createElement("p")
    // producerCompany.innerHTML = this.offer.producer.company
    // producerCompany.style.fontWeight = "bold"

    // const producerSector = document.createElement("p")
    // producerSector.innerHTML = this.offer.producer.sector

    // const producerLocation = document.createElement("p")
    // producerLocation.innerHTML = `${this.offer.producer.street} ${this.offer.producer.houseNumber} • ${this.offer.producer.zip} • ${this.offer.producer.city}`

    // producerContainer.append(from, producerCompany, producerSector, producerLocation)
    // field.append(producerContainer)


    // const metaContainer = document.createElement("div")
    // metaContainer.style.margin = "89px 34px"
    // metaContainer.style.fontSize = "21px"
    // // metaContainer.style.display = "flex"
    // // metaContainer.style.flexDirection = "column"



    // const offerId = document.createElement("p")
    // offerId.innerHTML = `<b style="margin-right: 21px;">Angebotsnummer:</b> ${this.offer.id}`
    // // offerId.style.margin = "8px 0"

    // const offerCreateAt = document.createElement("p")
    // offerCreateAt.innerHTML = `<b style="margin-right: 43px;">Angebotsdatum:</b> ${Helper.millisToDateString(this.offer.createdAt)}`
    // // offerCreateAt.style.margin = "8px 0"


    // const offerExpiresAt = document.createElement("p")
    // offerExpiresAt.innerHTML = `<b style="margin-right: 106px;">Gültig bis:</b> ${Helper.millisToDateString(this.offer.expiresAt)}`
    // // offerExpiresAt.style.margin = "8px 0"

    // // offerId.innerHTML = `<b>Angebotsnummer:</b>   ${this.offer.id}`
    // const ownerId = document.createElement("p")
    // ownerId.innerHTML = `<b style="margin-right: 40px;">Kundennummer:</b> ${Helper.substring(this.offer.owner.id, 13)}`
    // // ownerId.style.margin = "8px 0"
    // // ownerId.style.alignSelf = "flex-end"

    // metaContainer.append(offerId, offerCreateAt, offerExpiresAt, ownerId)
    // field.append(metaContainer)



    // const ownerContainer = document.createElement("div")
    // ownerContainer.style.margin = "89px 34px"
    // ownerContainer.style.fontSize = "21px"
    // ownerContainer.style.textAlign = "right"

    // const to = document.createElement("p")
    // to.innerHTML = "An:"


    // // ownerContainer.style.display = "flex"
    // // ownerContainer.style.flexDirection = "column"
    // // ownerContainer.style.alignItems = "flex-end"

    // const ownerName = document.createElement("p")
    // ownerName.innerHTML = `${this.offer.to.firstname} ${this.offer.to.lastname}`
    // ownerName.style.fontWeight = "bold"

    // const ownerStreet = document.createElement("p")
    // ownerStreet.innerHTML = this.offer.to.street

    // const ownerZip = document.createElement("p")
    // ownerZip.innerHTML = this.offer.to.zip

    // ownerContainer.append(to, ownerName, ownerStreet, ownerZip)
    // field.append(ownerContainer)



    // const title = document.createElement("h1")
    // title.style.margin = "21px 34px"
    // title.innerHTML = "Angebot"
    // field.append(title)

    // const producerMessage = document.createElement("p")
    // producerMessage.style.margin = "21px 34px"
    // // producerMessage.style.fontSize = "21px"
    // producerMessage.innerHTML = this.offer.producer.message
    // field.append(producerMessage)

    // const tableHeader = document.createElement("div")
    // tableHeader.style.display = "flex"
    // tableHeader.style.justifyContent = "space-between"
    // tableHeader.style.backgroundColor = "#ddddde"
    // // tableHeader.style.fontSize = "21px"
    // // tableHeader.style.color = "black"

    // const tableTitle = document.createElement("p")
    // tableTitle.innerHTML = "Beschreibung"
    // tableTitle.style.margin = "21px 0px 21px 34px"
    // tableTitle.style.fontWeight = "bold"
    // const tableAmount = document.createElement("p")
    // tableAmount.innerHTML = "Nettobetrag"
    // tableAmount.style.margin = "21px 34px 21px 0px"
    // tableAmount.style.fontWeight = "bold"



    // tableHeader.append(tableTitle, tableAmount)



    // const offerContainer = document.createElement("div")
    // offerContainer.style.margin = "34px 0"

    // offerContainer.append(tableHeader)

    // for (let i = 0; i < this.offer.options.length; i++) {
    //   const itemContainer = document.createElement("div")
    //   // itemContainer.classList.add(`option-${i}`)
    //   // itemContainer.style.margin = "0 34px"

    //   // itemContainer.style.position = "relative"
    //   // itemContainer.style.height = "60px"
    //   if (i % 2) itemContainer.style.backgroundColor = "#e7e7e8"


    //   const item = document.createElement("div")
    //   item.style.position = "relative"
    //   item.style.margin = "0 34px"
    //   item.style.fontSize = "21px"
    //   // item.style.height = "34px"
    //   item.style.display = "flex"
    //   item.style.flexDirection = "column"
    //   // item.style.justifyContent = "space-between"
    //   // item.style.alignItems = "center"


    //   const amountTitleDiv = document.createElement("div")
    //   amountTitleDiv.style.display = "flex"
    //   amountTitleDiv.style.alignItems = "center"
    //   amountTitleDiv.style.margin = "13px 0"


    //   const amount = document.createElement("div")
    //   // amount.classList.add(`amount`)
    //   amount.innerHTML = `${this.offer.options[i].amount}x`
    //   // amount.style.justifySelf = "flex-start"
    //   // amount.style.position = "absolute"
    //   // amount.style.top = "0"
    //   // amount.style.left = "0"
    //   amount.style.marginRight = "8px"

    //   // item.append(amount)

    //   const title = document.createElement("div")
    //   // title.classList.add(`gy-title`)
    //   // const substring =
    //   // const substring = Helper.substring(this.offer.options[i].title, 21)
    //   title.innerHTML = this.offer.options[i].title
    //   // title.title = this.offer.options[i].title
    //   // title.style.alignSelf = "flex-start"
    //   amountTitleDiv.append(amount, title)
    //   // title.style.position = "absolute"
    //   // title.style.top = "0"
    //   // title.style.left = "8%"
    //   item.append(amountTitleDiv)


    //   const priceInputDiv = document.createElement("div")
    //   priceInputDiv.style.display = "flex"
    //   priceInputDiv.style.justifyContent = "flex-end"
    //   priceInputDiv.style.alignItems = "center"
    //   // priceInputDiv.style.height = "55px"
    //   priceInputDiv.style.margin = "13px 0"



    //   const price = document.createElement("div")
    //   // price.classList.add(`price`)
    //   price.innerHTML = `${this.offer.options[i].price.toFixed(2)}€`
    //   // price.style.position = "absolute"
    //   // price.style.top = "0"
    //   // price.style.right = "8%"
    //   // price.style.height = "34px"
    //   // price.style.display = "flex"
    //   // price.style.justifyContent = "center"
    //   // price.style.alignItems = "center"
    //   // item.append(price)

    //   const input = document.createElement("input")
    //   input.type = "checkbox"
    //   // input.classList.add(`checkbox`)
    //   input.checked = this.offer.options[i].selected
    //   input.style.width = "21px"
    //   input.style.height = "21px"
    //   // input.style.position = "absolute"
    //   // input.style.top = "0"
    //   // input.style.margin = "0"
    //   input.style.margin = "0 0 3px 13px"
    //   // input.style.bottom = "auto"
    //   // input.style.right = "0"
    //   input.addEventListener("input", (event) => {
    //     this.offer.options[i].selected = event.target.checked



    //     this.withOptionSelectedCallback(event)
    //     // console.log("from class", this.offer);

    //     // // render price
    //     // const price = Helper.sumSelectedPrice(this.offer.options)
    //     // herstellerbruttobeitrag.withType(div => div.innerHTML = `${price.toFixed(2).replace(".", ",")} €`)
    //     // herstellerrabatt.withType(div => div.innerHTML = `${(price * offer.discount).toFixed(2).replace(".", ",")} €`)
    //     // herstellernettobeitrag.withType(div => div.innerHTML = `${(price - price * offer.discount).toFixed(2).replace(".", ",")} €`)
    //     // herstellerust.withType(div => div.innerHTML = `${(price * offer.vat).toFixed(2).replace(".", ",")} €`)
    //     // herstellergesamtpreis.withType(div => div.innerHTML = `${((price - price * offer.discount) + (price * offer.vat)).toFixed(2).replace(".", ",")} €`)

    //   })


    //   priceInputDiv.append(price, input)
    //   item.append(priceInputDiv)


    //   itemContainer.append(item)
    //   offerContainer.append(itemContainer)
    // }
    // field.append(offerContainer)


  }

  // #setOffers(field) {
  //   field.innerHTML = ""

  //   for (let i = 0; i < this.offers.length; i++) {

  //     const offer = document.createElement("div")
  //     offer.style.backgroundColor = "white"
  //     offer.style.borderRadius = "13px"
  //     offer.style.margin = "34px"
  //     offer.style.padding = "34px"
  //     offer.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"

  //     const alignLogo = document.createElement("div")
  //     alignLogo.style.display = "flex"
  //     alignLogo.style.justifyContent = "flex-end"

  //     const logo = document.createElement("img")
  //     logo.src = this.offers[i].image.src
  //     logo.alt = this.offers[i].image.alt
  //     logo.style.width = "55vw"
  //     logo.style.maxWidth = "377px"
  //     // logo.style.padding = "21px"

  //     alignLogo.append(logo)

  //     offer.append(alignLogo)

  //     const company = document.createElement("div")
  //     company.innerHTML = this.offers[i].producer.company
  //     company.style.margin = "21px 0"
  //     // Helper.resizeFontSize(company, "21px")
  //     company.style.fontSize = "21px"

  //     offer.append(company)

  //     const website = document.createElement("div")
  //     website.style.display = "flex"
  //     website.style.alignItems = "center"
  //     // website.style.padding = "21px"

  //     const websiteIcon = document.createElement("img")
  //     websiteIcon.src = "/felix/shs/hersteller/public/website-icon.svg"
  //     websiteIcon.alt = "Website Icon"

  //     const websiteText = document.createElement("a")
  //     websiteText.innerHTML = "Website"
  //     websiteText.href = this.offers[i].producer.website
  //     websiteText.target = "_blank"
  //     websiteText.style.textDecoration = "underline"
  //     websiteText.style.margin = "8px"
  //     websiteText.style.cursor = "pointer"

  //     website.append(websiteIcon, websiteText)

  //     offer.append(website)


  //     const product = document.createElement("div")
  //     product.innerHTML = this.offers[i].producer.product
  //     product.style.marginTop = "34px"
  //     product.style.fontSize = "21px"


  //     offer.append(product)


  //     const description = document.createElement("div")
  //     description.innerHTML = this.offers[i].producer.description
  //     description.style.marginTop = "13px"

  //     offer.append(description)


  //     const alignContainer = document.createElement("div")
  //     alignContainer.style.display = "flex"
  //     alignContainer.style.justifyContent = "flex-end"

  //     const priceContainer = document.createElement("div")
  //     priceContainer.style.width = "300px"
  //     priceContainer.style.marginTop = "21px"

  //     const priceTitle = document.createElement("div")
  //     priceTitle.innerHTML = "Preisübersicht"
  //     priceTitle.style.fontSize = "21px"
  //     priceTitle.style.margin = "21px 0"


  //     priceContainer.append(priceTitle)

  //     const netContainer = document.createElement("div")
  //     netContainer.style.display = "flex"
  //     netContainer.style.justifyContent = "space-between"
  //     netContainer.style.margin = "13px 0"

  //     const priceNetTitle = document.createElement("div")
  //     priceNetTitle.innerHTML = "Nettobetrag"

  //     const priceNetAmount = document.createElement("div")
  //     priceNetAmount.innerHTML = `${this.offers[i].grossAmount.toFixed(2).replace(".", ",")} €`

  //     netContainer.append(priceNetTitle, priceNetAmount)

  //     priceContainer.append(netContainer)



  //     const vatContainer = document.createElement("div")
  //     vatContainer.style.display = "flex"
  //     vatContainer.style.justifyContent = "space-between"
  //     vatContainer.style.margin = "13px 0"


  //     const priceVatTitle = document.createElement("div")
  //     priceVatTitle.innerHTML = `USt. ${(this.offers[i].vat * 100).toFixed(2).replace(".", ",")} %`

  //     const priceVatAmount = document.createElement("div")
  //     priceVatAmount.innerHTML = `${(this.offers[i].grossAmount * 0.19).toFixed(2).replace(".", ",")} €`

  //     vatContainer.append(priceVatTitle, priceVatAmount)

  //     priceContainer.append(vatContainer)

  //     const line = document.createElement("hr")

  //     priceContainer.append(line)


  //     const grossContainer = document.createElement("div")
  //     grossContainer.style.display = "flex"
  //     grossContainer.style.justifyContent = "space-between"
  //     grossContainer.style.margin = "21px 0"

  //     const priceGrossTitle = document.createElement("div")
  //     priceGrossTitle.innerHTML = "Gesamt"

  //     const priceGrossAmount = document.createElement("div")
  //     priceGrossAmount.innerHTML = `${(this.offers[i].grossAmount * 1.19).toFixed(2).replace(".", ",")} €`

  //     grossContainer.append(priceGrossTitle, priceGrossAmount)

  //     priceContainer.append(grossContainer)


  //     const button = document.createElement("div")
  //     button.innerHTML = "Weiter zum Angebot"
  //     button.style.marginTop = "34px"
  //     button.style.height = "55px"
  //     button.style.backgroundColor = "#f7aa20"
  //     button.style.borderRadius = "13px"
  //     button.style.display = "flex"
  //     button.style.justifyContent = "center"
  //     button.style.alignItems = "center"
  //     // button.style.fontSize = "21px"
  //     button.style.cursor = "pointer"
  //     button.addEventListener("mouseover", () => button.style.backgroundColor = "#f19d08")
  //     button.addEventListener("mouseout", () => button.style.backgroundColor = "#f7aa20")

  //     button.addEventListener("click", () => {

  //       for (let i = 0; i < this.offers.length; i++) {
  //         this.offers[i].value.selected = false
  //       }

  //       this.offers[i].value.selected = true
  //       window.localStorage.setItem("offers", JSON.stringify(this.offers))
  //       window.location.assign("/felix/shs/funnel/abfrage-persoenliches/")
  //     })




  //     priceContainer.append(button)


  //     alignContainer.append(priceContainer)

  //     offer.append(alignContainer)

  //     field.append(offer)
  //   }
  // }

  constructor(className) {
    try {
      this.className = className
      if (Helper.stringIsEmpty(this.className)) throw new Error("class name is empty")
      this.fieldSelector = `[class='${this.className}']`
      this.type = "offer"
      const fields = document.body.querySelectorAll(this.fieldSelector)
      if (fields.length <= 0) throw new Error(`field '${this.className}' not found`)
    } catch (error) {
      console.error(error)
    }
  }
}
