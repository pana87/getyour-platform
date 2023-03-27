import { Helper } from "/js/Helper.js"

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

  // static async verifyEmail(email) {
  //   const overlay = Helper.addOverlay()
  //   const interval = Helper.startTimer({duration: 2 * 60, display: overlay})
  //   Helper.setWaitCursor()
  //   try {
  //     await this.sequence({email, url: `/request/send/email/with/pin/`})
  //     const userPin = prompt(`Es wurde eine PIN an deine E-Mail Adresse gesendet.\n\nBestätige deine PIN um fortzufahren.`)
  //     await this.sequence({userPin, url: `/request/verify/pin/`})
  //     const id = await Helper.digest(JSON.stringify({email: email, verified: true}))
  //     window.localStorage.setItem("localStorageId", id)
  //     window.localStorage.setItem("email", email)
  //     overlay.textContent = "ok"
  //     clearInterval(interval)
  //   } catch (error) {
  //     overlay.textContent = "fehler"
  //     clearInterval(interval)
  //     Helper.setNotAllowedCursor()
  //     throw new Error(error)
  //   }
  // }

  static async withVerifiedEmail(email, callback) {
    const overlay = Helper.addOverlay()
    const interval = Helper.startTimer({duration: 2 * 60, display: overlay})
    Helper.setWaitCursor()
    try {
      await this.sequence({email, url: `/request/send/email/with/pin/`})
      const userPin = prompt(`Es wurde eine PIN an deine E-Mail Adresse gesendet.\n\nBestätige deine PIN um fortzufahren.`)
      await this.sequence({userPin, url: `/request/verify/pin/`})
      const id = await Helper.digest(JSON.stringify({email: email, verified: true}))
      window.localStorage.setItem("localStorageId", id)
      window.localStorage.setItem("email", email)
      callback()
      overlay.textContent = "ok"
      clearInterval(interval)
    } catch (error) {
      Helper.setNotAllowedCursor()
      clearInterval(interval)
      overlay.textContent = "fehler"
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        console.log('Event listeners blocked')
      }
      window.XMLHttpRequest = function() {
        console.log('XHR blocked')
      }
      alert("Es tut uns sehr leid, dass ein Fehler aufgetreten ist. Wir verstehen, wie frustrierend es sein kann, wenn Dinge nicht so funktionieren, wie sie sollten. Wir möchten Sie gerne beruhigen und Ihnen versichern, dass unser Team hart daran arbeitet, diesen Fehler so schnell wie möglich zu beheben. Wir hoffen, dass Sie uns die Gelegenheit geben werden, das Problem zu lösen. Falls der Fehler noch einmal auftritt, stehen wir Ihnen gerne zur Verfügung. Bitte zögern Sie nicht, uns unter 'datenschutz@get-your.de' zu kontaktieren, damit wir Ihnen helfen können. In der Zwischenzeit möchten wir Sie ermutigen, es einfach noch einmal zu versuchen. Vielen Dank für Ihr Verständnis und Ihre Geduld.")
      throw new Error(error)
    }
  }

  static email() {
    return new Promise((resolve, reject) => {
      const email = window.localStorage.getItem("email")
      if (email !== null) return resolve(email)
      else return window.location.assign("/home/")
    })
  }

  static localStorageId() {
    return new Promise((resolve, reject) => {
      const localStorageId = window.localStorage.getItem("localStorageId")
      if (localStorageId !== null) return resolve(localStorageId)
      else return window.location.assign("/home/")
    })
  }





}
