import { Helper } from "./Helper.js"

export class HeaderField {

  withProfile(callback) {
    if (callback !== undefined) this.withProfileCallback = callback
    return this
  }

  withNavigation(list) {
    if (list !== undefined) this.withNavigationList = list
    return this
  }

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.type).forEach(header => callback(header))
    return this
  }

  withImage(callback) {
    if (callback !== undefined) this.withImageCallback = callback
    return this
  }

  build() {
    document.body.querySelectorAll(this.type).forEach(field => this.#setHeader(field))
    return this
  }

  #setHeader(header) {
    header.innerHTML = ""

    header.style.width = "100%"
    // header.style.height = "89px"
    header.style.display = "flex"
    header.style.justifyContent = "space-between"
    header.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"
    // header.style.backgroundColor = "white"

    // header.style.position = "fixed"
    // header.style.top = "0"
    // header.style.left = "0"

    if (this.withImageCallback !== undefined) {
      const image = document.createElement("img")
      // image.classList.add("logo")
      image.style.marginLeft = "8%"
      image.style.padding = "8px"
      // image.style.cursor = "pointer"

      this.withImageCallback(image)

      header.append(image)
    }

    if (this.withProfileCallback !== undefined) {
      const profile = document.createElement("div")
      // profile.classList.add("profile")
      profile.style.marginRight = "8%"
      profile.style.alignSelf = "center"
      profile.style.cursor = "pointer"
      this.withProfileCallback(profile)
      // profile.innerHTML = this.withProfileName
      // profile.addEventListener("click", () => window.location.assign(this.checklist.path.profile))
      header.append(profile)
    }

    if (this.withNavigationList !== undefined) {
      header.style.flexDirection = "column"

      const navContainer = document.createElement("div")
      navContainer.style.display = "flex"
      navContainer.style.justifyContent = "space-evenly"
      navContainer.style.marginTop = "21px"

      // console.log(this.withNavigationList);

      for (let i = 0; i < this.withNavigationList.length; i++) {
        // const element = this.withNavigationList[i];


        const button = document.createElement("div")
        button.classList.add("button")
        button.style.display = "flex"
        button.style.flexDirection = "column"
        button.style.alignItems = "center"
        button.style.width = "89px"
        button.style.cursor = "pointer"

        if (this.withNavigationList[i].onclick !== undefined) {
          button.addEventListener("click", () => this.withNavigationList[i].onclick())
        }


        const title = document.createElement("div")
        title.innerHTML = this.withNavigationList[i].name
        // title.style.marginBottom = "13px"


        const state = document.createElement("div")
        state.style.display = "flex"
        state.style.justifyContent = "center"
        state.style.alignItems = "center"
        state.style.width = "55px"
        state.style.height = "34px"
        state.style.margin = "13px 0 55px 0"
        // state.style.borderRadius = "3px"
        state.style.backgroundColor = "#cfd4e2"
        if (this.withNavigationList[i].active === true) {
          state.style.backgroundColor = "#11841e"
        }
        // #11841e
        button.append(title, state)

        // title.append(state)

        const index = document.createElement("div")
        index.innerHTML = i + 1
        index.style.color = "white"

        state.append(index)

        navContainer.append(button)
      }
      header.append(navContainer)
    }


    if (this.offer !== undefined) {
      const image = document.createElement("img")
      image.classList.add("logo")
      image.style.marginLeft = "8%"
      image.style.padding = "8px"
      image.src = this.offer.image.src
      image.alt = this.offer.image.alt
      image.style.cursor = "pointer"
      image.addEventListener("click", async() => await Helper.redirectOperatorToChecklist())

      header.append(image)
    }


    if (this.checklist !== undefined) {
      const image = document.createElement("img")
      image.classList.add("logo")
      image.style.marginLeft = "8%"
      image.style.padding = "8px"
      image.src = this.checklist.image.src
      image.alt = this.checklist.image.alt
      image.style.cursor = "pointer"
      image.addEventListener("click", () => window.location.assign(this.checklist.path.home))

      const profile = document.createElement("div")
      profile.classList.add("profile")
      profile.style.marginRight = "8%"
      profile.style.alignSelf = "center"
      profile.innerHTML = this.checklist.owner.name
      profile.style.cursor = "pointer"
      profile.addEventListener("click", () => window.location.assign(this.checklist.path.profile))

      header.append(image, profile)
    }
  }

  constructor() {
    try {
      this.type = "header"
      const fields = document.querySelectorAll(this.type)
      if (fields.length <= 0) throw new Error(`field '${this.type}' not found`)
      fields.forEach(field => this.#setHeader(field))
    } catch (error) {
      console.error(error)
    }
  }
}
