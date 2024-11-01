import {Helper} from "/js/Helper.js"

let button = document.querySelector(`.open-creator`)
if (!button) {
  button = Helper.create("button/bottom-right", document.body)
  button.classList.add("open-creator")
  Helper.convert("path/icon", "/public/pencil-ruler.svg").then(icon => {
    Helper.append(icon, button)
  })
}
Helper.add("hover-outline", button)
button.onclick = () => {
  Helper.overlay("tools")
}
