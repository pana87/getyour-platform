import {Request} from "/js/Request.js"
import {FooterField} from "/js/FooterField.js"

export class Helper {

  static calculateDataUrlSize(dataUrl) {
    var base64Marker = ';base64,'
    var dataSize

    if (dataUrl.indexOf(base64Marker) === -1) {
      dataSize = dataUrl.length - dataUrl.indexOf(':') - 1
    } else {
      dataSize = (dataUrl.length - dataUrl.indexOf(base64Marker) - base64Marker.length) * 0.75
    }

    return dataSize
  }

  static convertImageFileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener("loadend", () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const image = document.createElement("img")
        image.src = reader.result
        image.onload = () => {
          const width = 300
          const height = 300 * image.height / image.width
          canvas.width = width
          canvas.height = height
          ctx.drawImage(image, 0, 0, width, height)
          return resolve(canvas.toDataURL(file.type))
        }
      })
    })
  }

  static verifyFileMimeTypes(file, types) {
    return new Promise((resolve, reject) => {
      try {
        let allowed = false
        for (let i = 0; i < types.length; i++) {
          if (file.type === types[i]) {
            return resolve()
          }
        }
        if (allowed === false) throw new Error("file type not allowed")
      } catch (error) {
        reject(error)
      }
    })
  }

  static verifyFileExtension(file, extensions) {
    return new Promise((resolve, reject) => {
      try {
        const fileExtension = file.name.split('.').pop()
        let allowed = false
        for (let i = 0; i < extensions.length; i++) {
          if (fileExtension === extensions[i]) {
            return resolve()
          }
        }
        if (allowed === false) throw new Error("file extension not allowed")
      } catch (error) {
        reject(error)
      }
    })
  }

  static popup(callback) {
    if (callback !== undefined) {
      const popup = document.createElement("div")
      popup.style.height = "100vh"
      popup.style.width = "100%"
      popup.style.zIndex = "2"
      popup.style.position = "fixed"
      popup.style.top = "0"
      popup.style.left = "0"
      popup.style.background = "white"
      popup.style.display = "flex"
      popup.style.flexDirection = "column"
      popup.style.justifyContent = "space-between"
      popup.style.overflowY = "scroll"
      popup.style.opacity = 0

      callback(popup)

      document.body.append(popup)

      const animation = popup.animate([
        { opacity: 0, transform: 'translateY(13px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 344,
        easing: 'ease-in-out',
        fill: "forwards"
      })
      return popup
    }
  }

  static popupInfo({withImage, withText, withEvent}) {
    const popup = document.createElement("div")
    popup.style.height = "100vh"
    popup.style.width = "100%"
    popup.style.zIndex = "2"
    popup.style.position = "fixed"
    popup.style.top = "0"
    popup.style.left = "0"
    popup.style.background = "white"
    popup.style.display = "flex"
    popup.style.flexDirection = "column"
    popup.style.justifyContent = "space-between"
    popup.style.overflowY = "scroll"
    popup.style.opacity = 0

    const header = document.createElement("div")
    header.style.background = "rgb(0, 135, 0)"
    header.style.display = "flex"
    header.style.alignItems = "center"
    header.style.padding = "34px"

    const infoIcon = document.createElement("img")
    infoIcon.src = "../../../../public/info-white.svg"
    infoIcon.alt = "Info"

    const infoTitle = document.createElement("div")
    infoTitle.innerHTML = "Wissenswertes"
    infoTitle.style.fontSize = "21px"
    infoTitle.style.margin = "21px"
    infoTitle.style.color = "rgb(234, 234, 234)"
    header.append(infoIcon, infoTitle)
    popup.append(header)

    const imageContainer = document.createElement("div")
    imageContainer.style.display = "flex"
    imageContainer.style.justifyContent = "center"
    imageContainer.style.margin = "34px"

    if (withImage !== undefined) {
      const image = document.createElement("img")
      withImage(image)
      imageContainer.append(image)
    }
    popup.append(imageContainer)

    const textContainer = document.createElement("div")
    textContainer.style.margin = "34px"

    if (withText !== undefined) {
      const text = document.createElement("p")
      withText(text)
      textContainer.append(text)
    }
    popup.append(textContainer)

    const buttonContainer = document.createElement("div")
    buttonContainer.style.display = "flex"
    buttonContainer.style.justifyContent = "space-between"
    buttonContainer.style.margin = "34px"

    const helpfulButton = document.createElement("div")
    helpfulButton.innerHTML = "👍"
    helpfulButton.style.background = "rgb(45,201,55)"
    helpfulButton.style.display = "flex"
    helpfulButton.style.justifyContent = "center"
    helpfulButton.style.alignItems = "center"
    helpfulButton.style.height = "55px"
    helpfulButton.style.width = "89px"
    helpfulButton.style.color = "white"
    helpfulButton.style.borderRadius = "8px"
    helpfulButton.style.fontSize = "21px"
    helpfulButton.style.cursor = "pointer"
    helpfulButton.addEventListener("click", () => popup.remove())

    const notHelpfulButton = document.createElement("div")
    notHelpfulButton.innerHTML = "👎"
    notHelpfulButton.style.display = "flex"
    notHelpfulButton.style.justifyContent = "center"
    notHelpfulButton.style.alignItems = "center"
    notHelpfulButton.style.width = "89px"
    notHelpfulButton.style.height = "55px"
    notHelpfulButton.style.background = "rgb(204,50,50)"
    notHelpfulButton.style.borderRadius = "8px"
    notHelpfulButton.style.fontSize = "21px"
    notHelpfulButton.style.cursor = "pointer"
    notHelpfulButton.addEventListener("click", () => popup.remove())

    buttonContainer.append(notHelpfulButton, helpfulButton)
    popup.append(buttonContainer)

    document.body.append(popup)

    const animation = popup.animate([
      { opacity: 0, transform: 'translateY(13px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], {
      duration: 344,
      easing: 'ease-in-out',
      fill: "forwards"
    })
  }

  static startTimer({duration, display}) {

    var timer = duration, minutes, seconds
    const timerDiv = document.createElement("div")
    const interval = setInterval(function () {
      minutes = parseInt(timer / 60, 10)
      seconds = parseInt(timer % 60, 10)

      minutes = minutes < 10 ? "0" + minutes : minutes
      seconds = seconds < 10 ? "0" + seconds : seconds

      timerDiv.textContent = minutes + ":" + seconds

      if (--timer < 0) {
        timerDiv.textContent = "pin abgelaufen"
        clearInterval(interval)
      }
    }, 1000)

    display.append(timerDiv)
    return interval
  }

  static canvasToFile(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(blob => {
          return resolve({
            createdAt: Date.now(),
            type: blob.type,
            size: blob.size,
            dataURL: canvas.toDataURL()
          })
        })

      } catch (error) {
        return reject(error)
      }
    })
  }

  static setOffer(offer) {
    if (offer !== undefined) {
      const offers = JSON.parse(window.localStorage.getItem("offers")) || []

      if (offers.length === 0) {
        offers.push(offer)
        window.localStorage.setItem("offers", JSON.stringify(offers))
      }

      for (let i = 0; i < offers.length; i++) {
        if (offers[i].storage === offer.storage) {
          offers[i] = offer
          window.localStorage.setItem("offers", JSON.stringify(offers))
        }
      }
    }
  }

  static setFunnel(funnel) {
    if (funnel !== undefined) {
      const funnels = JSON.parse(window.localStorage.getItem("funnels")) || []

      if (funnels.length === 0) {
        funnels.push(funnel)
        window.localStorage.setItem("funnels", JSON.stringify(funnels))
      }

      for (let i = 0; i < funnels.length; i++) {
        if (funnels[i].storage === funnel.storage) {
          funnels[i] = funnel
          window.localStorage.setItem("funnels", JSON.stringify(funnels))
        }
      }
    }
  }

  static findOffer(predicate) {
    if (predicate !== undefined) {
      const offers = JSON.parse(window.localStorage.getItem("offers"))
      for (let i = 0; i < offers.length; i++) {
        if (predicate(offers[i])) {
          return offers[i]
        }
      }
    }
  }

  static findFunnel(predicate) {
    if (predicate !== undefined) {
      const funnels = JSON.parse(window.localStorage.getItem("funnels")) || []
      for (let i = 0; i < funnels.length; i++) {
        if (predicate(funnels[i])) {
          return funnels[i]
        }
      }
    }
  }

  static createSHSFooter() {
    return new FooterField()
    .withType(footer => {
      footer.style.textAlign = "center"
      footer.style.backgroundColor = "#60a182"
      footer.style.padding = "21px 34px"
      footer.style.marginTop = "144px"

      const impressum = document.createElement("div")
      impressum.innerHTML = "Impressum"
      impressum.style.cursor = "pointer"
      impressum.style.padding = "13px"
      impressum.addEventListener("click", () => window.location.assign("/felix/shs/impressum/"))
      footer.append(impressum)

      const dsgvo = document.createElement("div")
      dsgvo.innerHTML = "Datenschutz"
      dsgvo.style.cursor = "pointer"
      dsgvo.style.padding = "13px"
      dsgvo.addEventListener("click", () => window.location.assign("/datenschutz/"))
      footer.append(dsgvo)

      const userAgreement = document.createElement("div")
      userAgreement.innerHTML = "Nutzervereinbarung"
      userAgreement.style.cursor = "pointer"
      userAgreement.style.padding = "13px"
      userAgreement.addEventListener("click", () => window.location.assign("/nutzervereinbarung/"))
      footer.append(userAgreement)
    })
  }

  static setDefaultCursor() {document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "default")}
  static setWaitCursor() {document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "wait")}
  static setNotAllowedCursor() {document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "not-allowed")}
  static removeOverlay() {document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.remove())}

  static addOverlay() {
    const overlay = document.createElement("div")
    overlay.classList.add("security-overlay")
    overlay.style.width = "100vw"
    overlay.style.height = "100vh"
    overlay.style.backgroundColor = "black"
    overlay.style.display = "flex"
    overlay.style.justifyContent = "center"
    overlay.style.alignItems = "center"
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.opacity = "0.9"
    overlay.style.zIndex = "10"
    overlay.style.color = "red"

    const loadingImage = document.createElement("img")
    loadingImage.src = "/public/load-animation.svg"
    loadingImage.alt = "Bitte warten.."
    overlay.append(loadingImage)

    document.body.append(overlay)
    return overlay
  }

  static async redirectUser(event) {
    const redirectUser = {}
    redirectUser.url = "/consumer/open/"
    redirectUser.method = "redirect"
    redirectUser.type = "user"
    redirectUser.event = event
    redirectUser.referrer = document.referrer
    redirectUser.location = window.location.href
    redirectUser.email = await Request.email()
    redirectUser.localStorageId = await Request.localStorageId()
    const res = await Request.middleware(redirectUser)
    if (res.status === 200) return window.location.assign(res.response)
    else return window.history.back()
  }

  static millisToDateString(milliseconds) {
    const date = new Date(milliseconds)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    return `${day}.${month}.${year}`
  }

  static setNotValidStyle(element) {
    element.style.border = "2px solid #d50000"
    if (element.type === "checkbox") {
      element.style.outline = "2px solid #d50000"
    }
    element.style.borderRadius = "3px"
    const signs = element.parentNode.querySelectorAll("div[id='sign']")
    if (signs.length === 0) {
      const sign = document.createElement("div")
      sign.id = "sign"
      sign.innerHTML = "x"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = "#d50000"
      sign.style.fontSize = "34px"
      element.parentNode.append(sign)
      return element
    }
    if (signs.length > 0) {
      signs.forEach(sign => sign.remove())
      const sign = document.createElement("div")
      sign.id = "sign"
      sign.innerHTML = "x"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = "#d50000"
      sign.style.fontSize = "34px"
      element.parentNode.append(sign)
      return element
    }
    return element
  }

  static setValidStyle(element) {
    element.style.border = "2px solid #00c853"
    if (element.type === "checkbox") {
      element.style.outline = "2px solid #00c853"
    }
    element.style.borderRadius = "3px"
    const signs = element.parentNode.querySelectorAll("div[id='sign']")
    if (signs.length === 0) {
      const sign = document.createElement("div")
      sign.id = "sign"
      sign.innerHTML = "✓"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = "#00c853"
      sign.style.fontSize = "34px"
      element.parentNode.append(sign)
      return element
    }
    if (signs.length > 0) {
      signs.forEach(sign => sign.remove())
      const sign = document.createElement("div")
      sign.id = "sign"
      sign.innerHTML = "✓"
      sign.style.position = "absolute"
      sign.style.right = "34px"
      sign.style.color = "#00c853"
      sign.style.fontSize = "34px"
      element.parentNode.append(sign)
      return element
    }
    return element
  }

  static sumSelectedPrice(array) {
    return array.filter(it => it.selected === true).reduce((prev, curr) => prev + curr.price, 0)
  }

  static substring(string, length) {
    if (string.length >= length) {
      string = string.substring(0, length - 2) + ".."
    }
    return string
  }

  static arrayExist(array) {
    return typeof array === "object" &&
    array !== undefined &&
    array !== null &&
    Array.isArray(array)
  }

  static objectExist(object) {
    return typeof object === "object" &&
    object !== undefined &&
    object !== null
  }

  static arrayIsEmpty(array) {
    return typeof array !== "object" ||
    array === undefined ||
    array === null ||
    array.length <= 0 ||
    !Array.isArray(array)
  }

  static objectIsEmpty(object) {
    return typeof object !== "object" ||
    object === undefined ||
    object === null ||
    Object.getOwnPropertyNames(object).length <= 0
  }

  static stringIsEmpty(string) {
    return typeof string !== "string" ||
    string === undefined ||
    string === null ||
    string === "" ||
    string.replace(/\s/g, "") === ""
  }

  static numberIsEmpty(number) {
    return number === undefined ||
    number === null ||
    number === ""
  }

  static booleanIsEmpty(value) {
    return value === undefined ||
    value === null ||
    typeof value !== "boolean"
  }

  static encodeStringToUri(string) {
    return encodeURIComponent(string)
    .replace(/%20/g, "-")
    .replace(/u%CC%88/g, "ue")
    .replace(/a%CC%88/g, "ae")
    .replace(/o%CC%88/g, "oe")
    .replace(/%2F/g, "-")
    .replace(/%C3%A4/g, "ae")
    .replace(/%C3%BC/g, "ue")
    .replace(/\(/g, "")
    .replace(/\)/g, "")
    .replace(/%C3%B6/g, "oe")
    .replace(/%C3%96/g, "Oe")
    .replace(/\./g, "-")
    .replace(/%C3%9F/g, "ss")
    .replace(/%3F/g, "")
    .replace(/-$/g, "")
  }

  static isJson(string) {
    try {
      JSON.parse(string)
      return true
    } catch {
      return false
    }
  }

  static sortedObjectToArray(object) {
    let array = []
    for (let key in object) {
      array.push(object[key])
    }
    return array
  }

  static async digest(message) {
    const data = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  static async fileToArray(file) {
    const fileBuffer = await file.arrayBuffer()
    return Array.from(new Uint8Array(fileBuffer))
  }

}
