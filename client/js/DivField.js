import { Helper } from "./Helper.js"

export class DivField {

  withType(callback) {
    if (callback !== undefined) document.querySelectorAll(this.fieldSelector).forEach(div => callback(div))
    return this
  }

  onClick(callback) {
    const divs = document.querySelectorAll(this.fieldSelector)
    divs.forEach(div => {
      div.style.cursor = "pointer"
      div.addEventListener("click", (event) => callback(event))
    })
    return this
  }

  with({withElement, withField}) {
    if (withElement !== undefined) this.fields.push(withElement)
    if (withField !== undefined) this.withFieldCallback = withField
    // if (withInput !== undefined) this.withInputCallback = withInput
    // if (withLabel !== undefined) this.withLabelCallback = withLabel
    this.#setFields()
    return this
  }

  #setFields() {

    for (let i = 0; i < this.fields.length; i++) {
      // const element = this.fields[i];
      this.fields[i].innerHTML = ""
      this.fields[i].classList.add(this.name)


      // console.log("hiho wie oft?");
      // const container = document.createElement("div")

      // this.fields[i].style.position = "relative"
      // this.fields[i].style.backgroundColor = "rgba(255, 255, 255, 0.6)"
      // this.fields[i].style.borderRadius = "13px"
      // this.fields[i].style.border = "0.3px solid black"
      // this.fields[i].style.display = "flex"
      // this.fields[i].style.flexDirection = "column"
      // this.fields[i].style.margin = "34px"
      // this.fields[i].style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
      // this.fields[i].style.justifyContent = "center"
      // this.fields[i].style.cursor = "pointer"

      // const label = document.createElement("label")
      // // label.classList.add(this.name)
      // label.classList.add(this.name)
      // label.id = this.name

      // if (this.withLabelName !== undefined) {
      //   label.innerHTML = this.withLabelName
      // }
      // label.style.color = "#707070"
      // label.style.fontSize = "21px"
      // label.style.margin = "21px 34px 0 34px"
      // label.setAttribute("for", this.name)
      // label.style.cursor = "pointer"

      // const input = document.createElement("input")
      // input.classList.add(this.name)
      // input.type = this.type
      // input.name = this.name
      // input.id = this.name

      // input.style.margin = "21px 89px 21px 34px"
      // input.style.maxWidth = "300px"
      // input.style.cursor = "pointer"
      // field.addEventListener("click", () => input.click())

      // if (this.withLabelCallback !== undefined) this.withLabelCallback(label)
      // if (this.withInputCallback !== undefined) this.withInputCallback(input)
      if (this.withFieldCallback !== undefined) this.withFieldCallback(this.fields[i])
      // this.fields[i].append(label, input)

    }



    // field.append(container)
  }

  constructor(name) {

    if (Helper.stringIsEmpty(name)) throw new Error("field name is empty")
    this.name = name
    this.fieldSelector = `div[class='${this.name}']`
    // this.inputSelector = `input[class='${this.name}']`
    // this.labelSelector = `label[class='${this.name}']`
    this.type = "div"
    this.fields = Array.from(document.querySelectorAll(this.fieldSelector))
    // if (fields.length <= 0) throw new Error(`field '${this.name}' not found`)
    this.#setFields()

    // try {
    //   if (Helper.stringIsEmpty(className)) throw new Error("class name is empty")
    //   this.className = className
    //   this.fieldSelector = `[class='${this.className}']`
    //   this.type = "div"
    //   const divs = document.querySelectorAll(this.fieldSelector)
    //   if (divs.length <= 0) throw new Error(`field '${this.className}' not found`)
    // } catch (error) {
    //   console.error(error);
    // }
  }
}
