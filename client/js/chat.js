import {Helper} from "/js/Helper.js"
import {button} from "/js/button.js"

(() => {
  const script = document.querySelector("script#chat")
  if (!script) return
  const chatId = script.getAttribute("chatId")
  if (!chatId) return
  let chatBtn = document.querySelector(".chat")
  if (!chatBtn) {
    chatBtn = button.append("toolbox", document.body)
    chatBtn.textContent = `${chatId}er Chat`
    chatBtn.classList.add("chat")
  }
  chatBtn.onclick = () => Helper.fn("openChatOverlay")(chatId)
})();
