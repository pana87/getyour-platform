import {left} from "/js/button.js"
import {div} from "/js/html-tags.js"

export const pop = callback => {
  const overlay = document.createElement("div")
  overlay.className = "overlay bg-theme color-theme"
  overlay.content = div("scrollable", overlay)
  const leftBtn = left("↓", overlay)
  leftBtn.onclick = () => overlay.remove()
  callback(overlay)
  document.body.appendChild(overlay)
  overlay.classList.add("fade-up")
  return overlay
}
