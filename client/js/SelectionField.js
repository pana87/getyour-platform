import { Helper } from "/js/Helper.js"

export class SelectionField {

  withInfoClick(callback) {
    if (callback !== undefined) {
      this.icon.src = "/public/info-gray.svg"
      this.icon.alt = "Mehr Infos"
      this.icon.style.display = "block"
      this.labelContainer.style.cursor = "pointer"
      this.labelContainer.childNodes.forEach(child => child.style.cursor = "pointer")
      this.labelContainer.addEventListener("click", callback)
    }
    return this
  }

  value(callback) {
    if (callback !== undefined) {
      const options = callback(this.name)
      if (options !== undefined) {
        for (let i = 0; i < this.select.options.length; i++) {
          const option = this.select.options[i]
          option.selected = false
          for (let z = 0; z < options.length; z++) {
            if (options[z] === this.select.options[i].value) {
              this.select.options[i].selected = true
            }
          }
        }
      }
    }
    return this
  }

  verifyValue() {

    let optionsSelected = []
    for (let i = 0; i < this.select.options.length; i++) {
      const option = this.select.options[i]
      if (option.selected === true) {
        optionsSelected.push(option)
      }
    }
    if (this.#isRequired(this.select)) {
      for (let i = 0; i < optionsSelected.length; i++) {
        if (optionsSelected[i].value === this.select.options[this.requiredIndex].value) {
          Helper.setValidStyle(this.select)
          return true
        }
      }
      Helper.setNotValidStyle(this.select)
      return false
    }
    Helper.setValidStyle(this.select)
    return true

  }

  options(options) {
    this.select.innerHTML = ""
    for (let i = 0; i < options.length; i++) {
      const option = document.createElement("option")
      option.value = options[i]
      option.text = options[i]
      this.select.appendChild(option)
    }
    return this
  }

  async addStatesByCountry(country) {
    this.select.innerHTML = ""

    const statesOfGermany = ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"]
    if (country === "Deutschland") {
      for (let i = 0; i < statesOfGermany.length; i++) {
        const state = statesOfGermany[i]
        const option = document.createElement("option")
        option.value = state
        option.text = state
        this.select.appendChild(option)
      }
    }

    const statesOfAustria = ["Burgenland", "Kärnten", "Niederösterreich", "Oberösterreich", "Salzburg", "Steiermark", "Tirol", "Vorarlberg", "Wien"]
    if (country === "Österreich") {
      for (let i = 0; i < statesOfAustria.length; i++) {
        const state = statesOfAustria[i]
        const option = document.createElement("option")
        option.value = state
        option.text = state
        this.select.appendChild(option)
      }
    }

    const statesOfSwitzerland = ["Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Land", "Basel-Stadt", "Bern", "Fribourg Freiburg", "Genève Geneva", "Glarus", "Graubünden Grischuns Grigioni", "Jura", "Luzern Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "St.Gallen", "Schaffhausen", "Schwyz", "Solothurn", "Thurgau", "Ticino", "Uri", "Vaud", "Valais Wallis", "Zug", "Zürich"]
    if (country === "Schweiz") {
      for (let i = 0; i < statesOfSwitzerland.length; i++) {
        const state = statesOfSwitzerland[i]
        const option = document.createElement("option")
        option.value = state
        option.text = state
        this.select.appendChild(option)
      }
    }

    this.withOptionSelected(option => {
      window.localStorage.setItem(this.name, option.value)
    })
  }

  required(index) {
    this.requiredIndex = index
    return this
  }

  #isRequired(select) {
    if (this.requiredIndex !== undefined) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].selected === true) {
          if (select.options[i].value !== select.options[this.requiredIndex].value) {
            return true
          }
        }
      }
    }
    return false
  }

  validValue() {

    let optionsSelected = []
    for (let i = 0; i < this.select.options.length; i++) {
      const option = this.select.options[i]
      if (option.selected === true) {
        optionsSelected.push(option)
      }
    }
    if (this.#isRequired(this.select)) {
      for (let i = 0; i < optionsSelected.length; i++) {
        if (optionsSelected[i].value === this.select.options[this.requiredIndex].value) {
          Helper.setValidStyle(this.select)
          return optionsSelected
        }
      }
      Helper.setNotValidStyle(this.select)
      const error = new Error(`field required: '${this.name}'`)
      error.fieldName = this.name
      throw new Error(error)
    }
    Helper.setValidStyle(this.select)
    return optionsSelected

  }

  withOptionSelected(callback) {
    if (callback !== undefined) {

      for (let i = 0; i < this.select.options.length; i++) {
        const option = this.select.options[i]
        if (option.selected === true) {
          callback(option)
        }
      }

    }
    return this
  }

  #setSelect(field) {
    field.innerHTML = ""
    field.id = this.name
    field.style.position = "relative"
    field.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
    field.style.borderRadius = "13px"
    field.style.border = "0.3px solid black"
    field.style.display = "flex"
    field.style.flexDirection = "column"
    field.style.margin = "34px"
    field.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
    field.style.justifyContent = "center"
    field.style.fontFamily = "sans-serif"

    const labelContainer = document.createElement("div")
    labelContainer.classList.add(`label-container-${this.name}`)
    labelContainer.style.display = "flex"
    labelContainer.style.alignItems = "center"
    labelContainer.style.margin = "21px 89px 0 34px"
    this.labelContainer = labelContainer

    const icon = document.createElement("img")
    icon.style.width = "34px"
    icon.style.marginRight = "21px"
    icon.style.display = "none"
    this.icon = icon
    labelContainer.append(icon)

    const label = document.createElement("label")
    label.classList.add(this.name)
    label.style.color = "#707070"
    label.style.fontSize = "21px"
    this.label = label
    labelContainer.append(label)
    field.append(labelContainer)

    const select = document.createElement("select")
    select.classList.add(this.name)
    select.style.margin = "21px 89px 21px 34px"
    select.style.fontSize = "21px"
    this.select = select
    field.append(select)
    return field
  }

  constructor(name, parent) {
    if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
    this.name = name
    this.type = "select"
    this.field = document.createElement("div")
    this.field = this.#setSelect(this.field)
    if (parent !== undefined) {
      this.parent = parent
      parent.append(this.field)
    }
  }
}
