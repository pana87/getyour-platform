import {left} from "/js/button.js"
import {addLoading} from "/js/events.js"
import {div} from "/js/html-tags.js"

export const lock = callback => {
  if (!callback) return
  const overlay = document.createElement("div")
  overlay.className = "overlay bg-theme color-theme zmax"
  overlay.content = div("scrollable", overlay)
  addLoading(overlay.content)
  addAlert(overlay)
  callback(overlay)
  document.body.appendChild(overlay)
  return overlay
}
function addAlert(input) {
  input.alert = {}
  input.alert.nok = () => window.alert("Fehler.. Bitte wiederholen.")
  input.alert.ok = (msg) => {
    let message = "Daten erfolgreich gespeichert."
    if (msg) message = msg
    window.alert(message)
  }
  input.alert.removed = () => window.alert("Daten erfolgreich entfernt.")
  input.alert.saved = () => window.alert("Daten erfolgreich gespeichert.")
  input.alert.sent = () => window.alert("Daten erfolgreich gesendet.")
}
export const pop = callback => {
  if (!callback) return
  const overlay = document.createElement("div")
  overlay.className = "overlay bg-theme color-theme"
  overlay.addInfo = text => {
    const info = div("monospace fs13 fixed bottom left z1 max-w100p max-h21 of-auto btn-theme color-theme")
    info.textContent = text
    overlay.appendChild(info)
  }
  overlay.content = div("scrollable", overlay)
  overlay.leftButton = left("↓", overlay)
  overlay.leftButton.onclick = () => overlay.remove()
  addAlert(overlay)
  callback(overlay)
  document.body.appendChild(overlay)
  overlay.classList.add("fade-up")
  return overlay
}
