import {button} from "/js/button.js"
import {Helper} from "/js/Helper.js"

let closedCreatorButton = document.querySelector(`.closed-creator`)
if (!closedCreatorButton) {
  closedCreatorButton = button.append("toolbox", document.body)
  closedCreatorButton.classList.add("closed-creator")
}
button.addOutlineOnHover(closedCreatorButton)
closedCreatorButton.onclick = () => Helper.overlay("tools", {type: "closed"})
