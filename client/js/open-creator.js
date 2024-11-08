import {button} from "/js/button.js"
import {Helper} from "/js/Helper.js"

let openCreatorButton = document.querySelector(`.open-creator`)
if (!openCreatorButton) {
  openCreatorButton = button.append("toolbox", document.body)
  openCreatorButton.classList.add("open-creator")
}
button.addOutlineOnHover(openCreatorButton)
openCreatorButton.onclick = () => Helper.overlay("tools")
