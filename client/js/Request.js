import { Helper } from "/js/Helper.js"
import { TextField } from "/js/TextField.js"

export class Request {

  static ping(event, input) {

    if (event === "/delete/logs/closed/2/") {

      return new Promise(async(resolve, reject) => {

        const map = {}
        map.url = event
        const res = await this.closed(map)

        if (res.status === 200) {
          return resolve(res)
        }

        if (res.status !== 200) {
          return reject(res)
        }

      })

    }

    if (event === "/update/expert/closed/") {

      return new Promise(async(resolve, reject) => {

        const map = {}
        map.url = event
        map.type = input.type
        map.name = input.name
        const res = await this.closed(map)

        if (res.status === 200) {
          return resolve(res)
        }

        if (res.status !== 200) {
          return reject(res)
        }

      })

    }

    if (event === "/verify/platform/open/") {

      return new Promise(async(resolve, reject) => {

        const verify = {}
        verify.url = event
        verify.platform = input
        const res = await this.open(verify)

        return resolve(res)

      })

    }

    if (event === "/update/user-json/verified/2/") {

      return new Promise(async(resolve, reject) => {

        const map = {}
        map.url = event
        map.email = input.email
        map.user = input.json
        const res = await this.closed(map)

        if (res.status === 200) {
          return resolve(res)
        }

        if (res.status !== 200) {
          return reject(res)
        }
        return reject()
      })

    }

    if (event === "/register/admin/location/") {


      return new Promise(async(resolve, reject) => {
        const map = {}
        map.url = event
        map.email = input
        const res = await this.closed(map)

        if (res.status === 200) {
          return resolve(res)
        }

        if (res.status !== 200) {
          return reject(res)
        }
      })

    }

  }

  static open(req) {

    if (req !== undefined) {
      return new Promise(async (resolve, reject) => {

        if (Helper.stringIsEmpty(req.url)) return reject(new Error("req.url is empty"))

        const xhr = new XMLHttpRequest()
        xhr.open("POST", req.url)
        xhr.setRequestHeader("Accept", "application/json")
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.overrideMimeType("text/html")
        xhr.withCredentials = true
        xhr.onload = () => resolve(xhr)
        xhr.send(JSON.stringify(req))
      })
    }

  }

  static location(req) {

    if (req !== undefined) {
      return new Promise(async (resolve, reject) => {

        if (Helper.stringIsEmpty(req.url)) return reject(new Error("req.url is empty"))

        req.location = window.location.href
        req.referer = document.referrer

        const xhr = new XMLHttpRequest()
        xhr.open("POST", req.url)
        xhr.setRequestHeader("Accept", "application/json")
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.overrideMimeType("text/html")
        xhr.withCredentials = true
        xhr.onload = () => resolve(xhr)
        xhr.send(JSON.stringify(req))
      })
    }

  }

  // static formdata(req) {
  //
  //   if (req !== undefined) {
  //
  //     return new Promise(async (resolve, reject) => {
  //
  //       if (Helper.stringIsEmpty(req.url)) return reject(new Error("req.url is empty"))
  //
  //       req.location = window.location.href
  //       req.referer = document.referrer
  //       if (window.localStorage.getItem("localStorageId") === null) return reject(new Error("local storage id not found"))
  //       if (window.localStorage.getItem("email") === null) return reject(new Error("local storage email not found"))
  //       req.localStorageEmail = await this.email()
  //       req.localStorageId = await this.localStorageId()
  //
  //       const xhr = new XMLHttpRequest()
  //       xhr.open("POST", req.url)
  //       xhr.setRequestHeader("Accept", "application/json")
  //       xhr.setRequestHeader("Content-Type", "multipart/formdata")
  //       xhr.overrideMimeType("text/html")
  //       xhr.withCredentials = true
  //       xhr.onload = () => resolve(xhr)
  //       xhr.send(JSON.stringify(req))
  //     })
  //   }
  //
  // }


  static closed(req) {

    if (req !== undefined) {

      return new Promise(async (resolve, reject) => {

        if (Helper.stringIsEmpty(req.url)) return reject(new Error("req.url is empty"))

        req.location = window.location.href
        req.referer = document.referrer
        if (window.localStorage.getItem("localStorageId") === null) return reject(new Error("local storage id not found"))
        if (window.localStorage.getItem("email") === null) return reject(new Error("local storage email not found"))
        req.localStorageEmail = await this.email()
        req.localStorageId = await this.localStorageId()

        const xhr = new XMLHttpRequest()
        xhr.open("POST", req.url)
        xhr.setRequestHeader("Accept", "application/json")
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.overrideMimeType("text/html")
        xhr.withCredentials = true
        xhr.onload = () => resolve(xhr)
        xhr.send(JSON.stringify(req))
      })
    }

  }

  static middleware(options) {
    return new Promise(async (resolve, reject) => {
      if (Helper.objectIsEmpty(options)) return reject(new Error(`expected options, found '${options}'`))
      if (Helper.stringIsEmpty(options.url)) return reject(new Error(`expected url, found '${options.url}'`))
      options.location = window.location.href
      options.referer = document.referrer
      options.localStorageEmail = await this.email()
      options.localStorageId = await this.localStorageId()

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
      options.location = window.location.href
      options.referer = document.referrer

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

    Helper.overlay("toolbox", async securityOverlay => {

      securityOverlay.style.backgroundColor = Helper.colors.light.background
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        securityOverlay.style.backgroundColor = Helper.colors.dark.background
      }

      document.body.style.overflow = "hidden"

      const content = document.createElement("div")
      content.style.display = "flex"
      content.style.flexDirection = "column"
      content.style.justifyContent = "center"
      content.style.alignItems = "center"
      content.style.height = `${window.innerHeight}px`


      const loading = Helper.iconPicker("loading")

      loading.style.width = "55px"

      loading.style.fill = Helper.colors.light.error
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        loading.style.fill = Helper.colors.dark.error
      }

      content.append(loading)

      const info = document.createElement("div")
      info.innerHTML = "Das kann einen Moment dauern .."
      info.style.fontSize = "13px"
      info.style.color = Helper.colors.light.error
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        info.style.color = Helper.colors.dark.error
      }
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
        content.style.overflowY = "auto"

        const pinField = new TextField("pin", content)
        pinField.label.textContent = "Meine PIN"
        Helper.setNotValidStyle(pinField.input)
        pinField.input.required = true
        pinField.input.accept = "text/hex"
        pinField.input.addEventListener("input", () => {
          pinField.verifyValue()
        })

        const button = Helper.buttonPicker("action", content)
        button.innerHTML = "PIN bestätigen"

        button.addEventListener("click", async () => {

          Helper.overlay("security", async securityOverlay => {

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

        })

        {
          const infoBox = document.createElement("div")

          infoBox.style.display = "flex"

          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            infoBox.style.color = Helper.colors.matte.dark.text
            infoBox.style.backgroundColor = Helper.colors.matte.dark.error
          } else {
            infoBox.style.color = Helper.colors.matte.light.text
            infoBox.style.backgroundColor = Helper.colors.matte.apricot
          }

          infoBox.style.fontSize = "13px"
          infoBox.style.margin = "21px 34px"
          infoBox.style.padding = "21px"
          infoBox.style.borderRadius = "13px"

          const icon = Helper.iconPicker("warn")
          icon.style.width = "144px"
          icon.style.marginRight = "13px"
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
