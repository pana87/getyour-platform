import {div} from "/js/html-tags.js"
import {text} from "/js/input.js"
import {onEnter} from "/js/events.js"
import {pop, lock} from "/js/overlay.js"
import {textToLink, millisToSince, textToNote} from "/js/convert.js"
import {textIsEmpty, addNotValidSign, addValidSign} from "/js/verify.js"

(() => {
  const script = document.querySelector("script#chat")
  if (!script) return
  const chatId = script.getAttribute("chatId")
  if (!chatId) return
  let chatBtn = document.querySelector(".chat")
  if (!chatBtn) {
    chatBtn = div("toolbox", document.body)
    chatBtn.textContent = `${chatId}er Chat`
    chatBtn.classList.add("chat")
  }
  chatBtn.onclick = () => openChat(chatId)
})();
export const openChat = id => {
  if (!id) return
  pop(async o1 => {
    o1.onlyClosedUser()
    o1.addInfo(`.chat:${id}`)
    const content = o1.content
    const chat = text(content)
    chat.input.placeholder = "Neue Nachricht"
    chat.input.maxLength = "144"
    onEnter(chat.input, registerMessage)
    setTimeout(() => {
      chat.input.focus()
    }, 987)
    const preview = div("monospace fs13 color-theme", chat)
    preview.textContent = `0/${chat.input.maxLength}`
    chat.input.addEventListener("input", ev => {
      const actualLength = ev.target.value.length
      preview.textContent = `${actualLength}/${chat.input.maxLength}`
    })
    async function registerMessage() {
      const message = chat.input.value
      if (textIsEmpty(message) || message.length > 144) {
        addNotValidSign(chat.input)
        return
      }
      chat.input.value = ""
      preview.textContent = `0/${chat.input.maxLength}`
      container.textContent = ""
      const loader = addLoading(container)
      const res = await post("/jwt/register/chat/message/", {id, message})
      loader.remove()
      if (res.status === 200) {
        getMessages()
        chat.input.focus()
      } else {
        o1.alert.nok()
        o1.remove()
      }
    }
    const container = div("flex column break-word mtb21 mlr34 sans-serif color-theme", content)
    getMessages()
    function getMessages() {
      post("/jwt/get/chat/messages/", {id}).then(res => {
        if (res.status === 200) {
          const messages = JSON.parse(res.response)
          for (let i = 0; i < messages.length; i++) {
            const message = messages[i]
            if (!message.text) continue
            const messageDiv = div("hover br8 max-w55p mt8", container)
            messageDiv.onclick = () => {
              chat.input.value = message.text
              const actualLength = chat.input.value.length
              preview.textContent = `${actualLength}/${chat.input.maxLength}`
              chat.scrollIntoView({behavior: "smooth"})
              addValidSign(chat.input)
              chat.input.focus()
            }
            const textDiv = div("p8", messageDiv)
            textDiv.textContent = message.text
            const createdDiv = div("fs8 plr8", messageDiv)
            createdDiv.textContent = `Gesendet vor ${millisToSince(message.created)}`
            const userId = window.localStorage.getItem("localStorageId")
            if (message.from === userId) {
              messageDiv.classList.add("flex-end")
              messageDiv.classList.add("light")
            } else {
              messageDiv.classList.add("flex-start")
              messageDiv.classList.add("dark")
            }
          }
          content.appendChild(removeMessagesBtn)
        } else {
          container.textContent = ""
          textToNote("Keine Nachrichten gefunden", container)
          removeMessagesBtn.remove()
        }
      })
    }
    const removeMessagesBtn = textToLink("Alle meine Nachrichten entfernen")
    removeMessagesBtn.className += " mtb21 mlr34" 
    removeMessagesBtn.onclick = () => {
      const confirm = window.confirm("Möchtest du alle deine Nachrichten wirklich entfernen?")
      if (!confirm) return
      lock(async lock => {
        const res = await post("/jwt/remove/chat/messages/", {id})
        if (res.status === 200) {
          lock.alert.removed()
          o1.remove()
        } else {
          lock.alert.nok()
        }
        lock.remove()
      })
    }
  })
}
