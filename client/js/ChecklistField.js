import { Helper } from "./Helper.js"

export class ChecklistField {

  withChecklist(object) {
    if (object !== undefined) this.withChecklistObject = object
    return this
  }

  withType(callback) {
    if (callback !== undefined) callback(this.checklist)
    return this
  }

  build() {
    document.body.querySelectorAll(this.fieldSelector).forEach(field => this.#setChecklist(field))
    return this
  }

  #setChecklist(field) {
    field.innerHTML = ""

    for (let i = 0; i < this.withChecklistObject.items.length; i++) {

      const item = document.createElement("div")
      item.classList.add("checklist-item")
      item.style.margin = "34px"

      const itemHeader = document.createElement("div")
      itemHeader.classList.add("item-header")
      itemHeader.style.display = "flex"
      itemHeader.style.borderTopRightRadius = "21px"
      itemHeader.style.borderTopLeftRadius = "21px"
      itemHeader.style.borderBottomLeftRadius = "21px"
      itemHeader.style.backgroundColor = "#d1d0d0"

      const itemState = document.createElement("div")
      itemState.classList.add("item-state")
      itemState.style.display = "flex"
      itemState.style.justifyContent = "center"
      itemState.style.alignItems = "center"
      itemState.style.width = "89px"
      itemState.style.height = "89px"
      itemState.style.backgroundColor = "#c6c6c6"
      itemState.style.fontSize = "34px"

      if (this.withChecklistObject.state >= i + 1) {
        itemState.style.backgroundColor = "#006f39"
        itemState.style.color = "#ffffff"
      }
      itemState.style.borderTopLeftRadius = "21px"
      itemState.style.borderBottomLeftRadius = "21px"

      const itemIndex = document.createElement("div")
      itemIndex.classList.add("item-index")
      itemIndex.innerHTML = i + 1

      itemState.append(itemIndex)


      const itemTitle = document.createElement("div")
      itemTitle.classList.add("item-title")
      itemTitle.style.alignSelf = "center"
      itemTitle.style.marginLeft = "13px"
      itemTitle.innerHTML = this.withChecklistObject.items[i].title
      itemTitle.style.fontSize = "21px"

      itemHeader.append(itemState, itemTitle)
      item.append(itemHeader)


      const itemBody = document.createElement("div")
      itemBody.classList.add("item-body")
      itemBody.style.marginLeft = "8%"
      itemBody.style.backgroundColor = "#dbdbdb"
      itemBody.style.borderBottomRightRadius = "21px"
      itemBody.style.borderBottomLeftRadius = "21px"
      itemBody.style.padding = "21px"
      itemBody.style.display = "flex"
      itemBody.style.flexDirection = "column"
      itemBody.style.boxShadow = "0 3px 5px rgba(0, 0, 0, 0.13)"

      const itemDescription = document.createElement("div")
      itemDescription.classList.add("item-description")
      itemDescription.innerHTML = this.withChecklistObject.items[i].description
      itemDescription.style.marginBottom = "34px"

      itemBody.append(itemDescription)

      // const itemDateTimePicker = document.createElement("div")

      if (this.withChecklistObject.items[i].path !== undefined) {
        const itemButton = document.createElement("div")
        itemButton.classList.add("item-button")
        itemButton.innerHTML = "Zur Übersicht"
        itemButton.style.borderRadius = "13px"
        itemButton.style.width = "233px"
        itemButton.style.height = "55px"
        itemButton.style.display = "flex"
        itemButton.style.justifyContent = "center"
        itemButton.style.alignItems = "center"
        itemButton.style.alignSelf = "flex-end"
        itemButton.style.backgroundColor = "#f7aa20"
        itemButton.style.fontSize = "21px"
        itemButton.style.margin = "8px"
        itemButton.style.cursor = "not-allowed"
        if (this.withChecklistObject.state >= i) {
          itemButton.style.cursor = "pointer"
          itemButton.addEventListener("click", () => window.location.assign(this.withChecklistObject.items[i].path))
        }
        itemBody.append(itemButton)
      }
      item.append(itemBody)
      field.append(item)
    }
  }

  constructor(className) {
    try {
      this.className = className
      if (Helper.stringIsEmpty(this.className)) throw new Error("class name is empty")
      this.fieldSelector = `[class='${this.className}']`
      this.type = "checklist"
      const fields = document.body.querySelectorAll(this.fieldSelector)
      if (fields.length <= 0) throw new Error(`field '${this.className}' not found`)
    } catch (error) {
      console.error(error)
    }
  }
}
