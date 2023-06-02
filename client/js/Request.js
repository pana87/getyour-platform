import { Helper } from "/js/Helper.js"
import { TextField } from "/js/TextField.js"

export class Request {

  static middleware(options) {
    return new Promise((resolve, reject) => {
      if (Helper.objectIsEmpty(options)) return reject(new Error(`expected options, found '${options}'`))
      if (Helper.stringIsEmpty(options.url)) return reject(new Error(`expected url, found '${options.url}'`))
      const xhr = new XMLHttpRequest()
      xhr.open("POST", options.url)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.withCredentials = true
      xhr.onload = () => resolve(xhr)
      xhr.send(JSON.stringify(options))
    })
  }

  static sequence(options) {
    return new Promise((resolve, reject) => {
      if (Helper.objectIsEmpty(options)) return reject(new Error(`expected options, found '${options}'`))
      if (Helper.stringIsEmpty(options.url)) return reject(new Error(`expected url, found '${options.url}'`))
      const xhr = new XMLHttpRequest()
      xhr.open("POST", options.url)
      xhr.setRequestHeader("Accept", "application/json")
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.overrideMimeType("text/html")
      xhr.withCredentials = true
      xhr.onload = () => {
        try {
          if (xhr.status === 200) return resolve(xhr)
          return reject(`${xhr.status} ${xhr.statusText}`)
        } catch (error) {
          return reject(error)
        }
      }
      xhr.send(JSON.stringify(options))
    })
  }

  static async withVerifiedEmail(email, callback) {
    const event = {}

    Helper.popup(async securityOverlay => {

      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        securityOverlay.style.backgroundColor = Helper.darkMattePalette.background
      } else {
        securityOverlay.style.backgroundColor = Helper.lightMattePalette.background
      }

      document.body.style.overflow = "hidden"

      const content = document.createElement("div")
      content.style.display = "flex"
      content.style.flexDirection = "column"
      content.style.justifyContent = "center"
      content.style.alignItems = "center"
      content.style.height = "89vh"
      const loading = document.createElement("img")
      loading.src = "/public/load.svg"
      loading.alt = "Bitte warten.."
      loading.style.width = "55px"
      content.append(loading)
      const info = document.createElement("div")
      info.innerHTML = "Das kann einen Moment dauern .."
      info.style.fontSize = "13px"
      info.style.color = "#be0909"
      info.style.margin = "13px"
      content.append(info)
      securityOverlay.append(content)

      try {
        const send = {}
        send.url = "/request/send/email/with/pin/"
        send.email = email
        send.location = window.location.href
        send.referer = document.referrer
        await this.sequence(send)

        Helper.reset(content)
        content.style.display = "flex"
        content.style.flexDirection = "column"
        content.style.justifyContent = "center"
        content.style.height = `${window.innerHeight}px`

        const pinField = new TextField("pin", content)
        pinField.field.style.backgroundColor = "transparent"
        pinField.label.textContent = "Meine PIN"


        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          pinField.field.style.border = `0.3px solid ${Helper.darkMattePalette.text}`
          pinField.input.style.color = Helper.darkMattePalette.text
          pinField.label.style.color = Helper.darkMattePalette.text
        } else {
          pinField.field.style.border = `0.3px solid ${Helper.lightMattePalette.text}`
          pinField.input.style.color = Helper.lightMattePalette.text
          pinField.label.style.color = Helper.lightMattePalette.text
        }

        Helper.setNotValidStyle(pinField.input)
        pinField.input.required = true
        pinField.input.accept = "text/hex"
        pinField.input.style.backgroundColor = "transparent"
        pinField.input.addEventListener("input", () => {
          pinField.verifyValue()
        })

        const button = document.createElement("div")
        button.innerHTML = "PIN bestätigen"

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          button.style.backgroundColor = Helper.warnMattePalette.lightYellow
          button.style.color = Helper.darkMattePalette.background
        } else {
          button.style.backgroundColor = Helper.warnMattePalette.lightYellow
          button.style.color = Helper.lightMattePalette.background
        }

        button.style.cursor = "pointer"
        button.style.fontSize = "21px"
        button.style.borderRadius = "13px"
        button.style.margin = "0 34px"
        button.style.display = "flex"
        button.style.justifyContent = "center"
        button.style.alignItems = "center"
        button.style.height = "89px"
        button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"

        button.addEventListener("click", async () => {

          try {
            const pin = pinField.validValue()

            const verify = {}
            verify.url = "/request/verify/pin/"
            verify.userPin = pin
            verify.location = window.location.href
            verify.referer = document.referrer
            await this.sequence(verify)

            const id = await Helper.digest(JSON.stringify({email: email, verified: true}))
            window.localStorage.setItem("localStorageId", id)
            window.localStorage.setItem("email", email)
            callback(event)
          } catch (error) {
            EventTarget.prototype.addEventListener = function(type, listener, options) {
              console.log('Event listeners blocked')
            }
            window.XMLHttpRequest = function() {
              console.log('XHR blocked')
            }
            alert("Es tut uns sehr leid, dass ein Fehler aufgetreten ist. Wir verstehen, wie frustrierend es sein kann, wenn Dinge nicht so funktionieren, wie sie sollten. Wir möchten Sie gerne beruhigen und Ihnen versichern, dass unser Team hart daran arbeitet, diesen Fehler so schnell wie möglich zu beheben. Wir hoffen, dass Sie uns die Gelegenheit geben werden, das Problem zu lösen. Falls der Fehler noch einmal auftritt, stehen wir Ihnen gerne zur Verfügung. Bitte zögern Sie nicht, uns unter 'datenschutz@get-your.de' zu kontaktieren, damit wir Ihnen helfen können. In der Zwischenzeit möchten wir Sie ermutigen, es einfach noch einmal zu versuchen. Vielen Dank für Ihr Verständnis und Ihre Geduld.")
            window.location.reload()
            throw error

          }

        })
        content.append(button)

        {
          const infoBox = document.createElement("div")

          infoBox.style.display = "flex"

          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            infoBox.style.color = Helper.darkMattePalette.text
            infoBox.style.backgroundColor = Helper.darkMattePalette.error
            infoBox.style.border = `2px solid ${Helper.lightMattePalette.error}`
          } else {
            infoBox.style.color = Helper.lightMattePalette.text
            infoBox.style.backgroundColor = Helper.lightMattePalette.error
            infoBox.style.border = `2px solid ${Helper.darkMattePalette.error}`
          }

          infoBox.style.fontSize = "13px"
          infoBox.style.margin = "13px 34px"
          infoBox.style.padding = "21px"
          infoBox.style.borderRadius = "13px"

          const icon = document.createElement("img")
          icon.style.width = "21px"
          icon.style.marginRight = "13px"
          icon.src = "/public/warn-light.svg"
          icon.alt = "Achtung"
          infoBox.append(icon)

          const message = document.createElement("div")
          message.style.fontSize = "13px"

          message.innerHTML = `
            <p>PIN erfolgreich an '${email}' gesendet. ✓</p>
            <p>Es ist wichtig, dass deine PIN geheim gehalten wird, da sie als persönliches Kennwort dient und den Zugriff auf sensible Informationen oder Ressourcen ermöglicht. Teile deine PIN niemals mit anderen Personen. Das gilt selbst für enge Freunde, Familienmitglieder oder Mitarbeiter. Deine PIN sollte nur dir bekannt sein.</p>
            <p>Bitte bestätige deine PIN um fortzufahren.</p>
          `

          infoBox.append(message)

          content.append(infoBox)
        }


      } catch (error) {
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          console.log('Event listeners blocked')
        }
        window.XMLHttpRequest = function() {
          console.log('XHR blocked')
        }
        alert(`Es konnte keine E-Mail an '${email}' verschickt werden.`)
        window.location.reload()
        throw error
      }

    })

  }

  static email() {
    return new Promise((resolve, reject) => {
      const email = window.localStorage.getItem("email")
      if (email !== null) return resolve(email)
      else return window.location.assign("/getyour/pana/login/")
    })
  }

  static localStorageId() {
    return new Promise((resolve, reject) => {
      const localStorageId = window.localStorage.getItem("localStorageId")
      if (localStorageId !== null) return resolve(localStorageId)
      else return window.location.assign("/getyour/pana/login/")
    })
  }





}
