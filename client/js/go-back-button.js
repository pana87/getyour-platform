import {button} from "/js/button.js"

let goBackButton = document.querySelector("div.go-back")
if (!goBackButton) {
  button.append("go-back", document.body)
} else {
  button.addEvent("go-back", goBackButton)
}
