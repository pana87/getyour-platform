import {Request} from "/js/Request.js"
import {FooterField} from "/js/FooterField.js"

export class Helper {

  static createButton(event, options) {
    if (event === "service") {
      const {name, units, price, selected} = options

      const item = document.createElement("div")
      item.style.position = "relative"
      item.style.margin = "21px 34px"
      item.style.fontSize = "21px"
      item.style.display = "flex"
      item.style.flexDirection = "column"
      item.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
      item.style.border = "0.3px solid black"
      item.style.borderRadius = "13px"
      item.style.padding = "21px 34px"

      const firstRow = document.createElement("div")
      firstRow.style.display = "flex"
      firstRow.style.alignItems = "center"
      firstRow.style.margin = "13px 0"
      firstRow.style.cursor = "pointer"
      firstRow.addEventListener("click", () => {
        Helper.popup(overlay => {


          const header = document.createElement("div")
          header.style.position = "fixed"
          header.style.bottom = "0"
          header.style.left = "0"
          header.style.width = "100%"
          header.style.display = "flex"
          header.style.justifyContent = "flex-start"
          header.style.alignItems = "center"
          header.style.boxShadow = "0px 5px 10px rgba(0, 0, 0, 0.5)"
          header.style.background = "white"
          header.style.cursor = "pointer"
          header.style.zIndex = "1"
          header.addEventListener("click", () => Helper.removeOverlay(overlay))

          const logo = document.createElement("img")
          logo.src = "/felix/shs/public/ep-logo.svg"
          logo.alt = "Energie Portal"
          logo.style.width = "55px"
          logo.style.margin = "34px"
          header.append(logo)
          const title = document.createElement("div")
          title.innerHTML = name
          title.style.fontWeight = "bold"
          title.style.fontSize = "21px"
          header.append(title)
          overlay.append(header)


          {
            const button = document.createElement("div")
            button.style.display = "flex"
            button.style.flexWrap = "wrap"
            button.style.justifyContent = "space-between"
            button.style.alignItems = "center"
            button.style.margin = "21px 34px"
            button.style.backgroundColor = "rgba(255, 255, 255, 0.6)"
            button.style.borderRadius = "13px"
            button.style.border = "0.3px solid black"
            button.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.16)"
            button.style.cursor = "pointer"
            button.addEventListener("click", async () => {

              try {
                const securityOverlay = Helper.addOverlay()
                Helper.setWaitCursor()
                {
                  const del = {}
                  del.url = "/delete/service/closed/5/"
                  del.name = name
                  del.localStorageId = await Request.localStorageId()
                  del.localStorageEmail = await Request.email()
                  del.location = window.location.href
                  del.referer = document.referrer
                  await Request.sequence(del)
                }

                alert("Dienst erfolgreich gelöscht.")
                item.remove()
                Helper.removeOverlay(securityOverlay)
                Helper.removeOverlay(overlay)
              } catch (error) {
                alert("Fehler.. Bitte wiederholen.")
                window.location.reload()
              }




            })

            const icon = document.createElement("img")
            icon.style.margin = "13px 34px"
            icon.style.width = "34px"
            icon.src = "/public/delete.svg"
            icon.alt = "Energie Portal"
            button.append(icon)

            const title = document.createElement("div")
            title.innerHTML = "Löschen"
            title.style.margin = "21px 34px"
            title.style.fontSize = "21px"
            button.append(title)

            overlay.append(button)
          }

        })
      })

      const amount = document.createElement("div")
      amount.innerHTML = `${units}x`
      amount.style.marginRight = "8px"
      firstRow.append(amount)

      const title = document.createElement("div")
      title.innerHTML = name
      firstRow.append(title)

      item.append(firstRow)

      const secondRow = document.createElement("div")
      secondRow.style.display = "flex"
      secondRow.style.justifyContent = "flex-end"
      secondRow.style.alignItems = "center"
      secondRow.style.margin = "13px 0"

      {
        const div = document.createElement("div")
        div.innerHTML = `${price}€`
        secondRow.append(div)
      }

      const input = document.createElement("input")
      input.type = "checkbox"
      input.checked = selected
      input.style.width = "21px"
      input.style.height = "21px"
      input.style.margin = "0 0 3px 13px"
      input.addEventListener("input", (event) => {

        const services = JSON.parse(window.sessionStorage.getItem("services"))
        if (services !== null) {
          for (let i = 0; i < services.length; i++) {
            if (services[i].name === name) {
              services[i].selected = event.target.checked
            }
          }
          window.sessionStorage.setItem("services", JSON.stringify(services))
        }

      })
      secondRow.append(input)

      item.append(secondRow)

      return item
    }
  }

  // static async verifyFiles(files, allowedMimeTypes, allowedExtensions) {
  //   if (files === undefined) throw new Error("files is undefined")

  //   let array = []
  //   const allowedMimeTypes = ["image/jpeg", "image/png"]
  //   const allowedExtensions = ["jpg", "jpeg", "png"]
  //   for (let i = 0; i < files.length; i++) {


  //     if (allowedMimeTypes !== undefined) {
  //       await Helper.verifyFileMimeTypes(files[i], allowedMimeTypes)
  //       .catch(error => {
  //         alert(`Erlaubte Bildformate: ${allowedExtensions.join(", ")}`)
  //         Helper.setNotValidStyle(document.querySelector(hausFrontBild.inputSelector))
  //         throw error
  //       })
  //     }

  //     if (allowedExtensions !== undefined) {
  //       await Helper.verifyFileExtension(files[i], allowedExtensions)
  //       .catch(error => {
  //         alert(`Erlaubte Bildformate: ${allowedExtensions.join(", ")}`)
  //         Helper.setNotValidStyle(document.querySelector(hausFrontBild.inputSelector))
  //         throw error
  //       })
  //     }


  //     const dataUrl = await Helper.convertImageFileToDataUrl(files[i])
  //     const dataUrlSize = Helper.calculateDataUrlSize(dataUrl)
  //     if (dataUrlSize > 1024 * 1024) {
  //       alert("Bild ist zu groß.")
  //       Helper.setNotValidStyle(document.querySelector(hausFrontBild.inputSelector))
  //       throw new Error("image too large")
  //     }

  //     array.push({
  //       name: files[i].name,
  //       type: files[i].type,
  //       size: dataUrlSize,
  //       lastModified: Date.now(),
  //       dataUrl: dataUrl,
  //     })

  //   }

  //   if (array.length > 0) {
  //     funnel[hausFrontBild.name] = array
  //     window.sessionStorage.setItem(storageName, JSON.stringify(funnel))
  //   }

  // }

  // static jsonToHtml(json, element) {
  //   const div = document.createElement('div');
  //   div.style.fontFamily = 'sans-serif';
  //   div.style.fontSize = '14px';
  //   div.style.lineHeight = '1.5em';
  //   div.style.color = '#333';
  //   div.style.padding = '20px';
  //   div.style.border = '1px solid #ccc';
  //   div.style.borderRadius = '5px';

  //   for (const key in json) {
  //     if (json.hasOwnProperty(key)) {
  //       let value = json[key];
  //       const childDiv = document.createElement('div');
  //       const strong = document.createElement('strong');
  //       strong.innerText = `${key}: `;
  //       childDiv.appendChild(strong);

  //       if (typeof value === 'object') {
  //         value = this.jsonToHtml(value);
  //       }

  //       const span = document.createElement('span');
  //       span.innerText = value;
  //       childDiv.appendChild(span);
  //       div.appendChild(childDiv);
  //     }
  //   }

  //   // return div.outerHTML;
  //   console.log(element);
  //   element.append(div)
  // }


  // static jsonToHtml(json) {
  //   let html = '';

  //   for (const key in json) {
  //     if (json.hasOwnProperty(key)) {
  //       let value = json[key];

  //       // If the value is an object, recursively call jsonToHtml
  //       if (typeof value === 'object') {
  //         value = this.jsonToHtml(value);
  //       }

  //       html += `<div><strong>${key}:</strong> ${value}</div>`;
  //     }
  //   }

  //   html = `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5em; color: #333; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">${html}</div>`;

  //   return html;
  // }

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

  static removeOverlay(overlay) {
    // document.body.style.position = "static"
    overlay.remove()
  }

  static popup(callback) {
    if (callback !== undefined) {
      const overlay = document.createElement("div")
      overlay.style.height = "100vh"
      overlay.style.width = "100%"
      overlay.style.zIndex = "1"
      overlay.style.position = "fixed"
      overlay.style.top = "0"
      overlay.style.left = "0"
      overlay.style.background = "white"
      overlay.style.display = "flex"
      overlay.style.flexDirection = "column"
      overlay.style.opacity = 0

      callback(overlay)

      document.body.append(overlay)
      // document.body.style.position = "fixed"

      const animation = overlay.animate([
        { opacity: 0, transform: 'translateY(13px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 344,
        easing: 'ease-in-out',
        fill: "forwards"
      })

      // When ready...
      window.addEventListener("load",function() {
        // Set a timeout...
        setTimeout(function(){
          // Hide the address bar!
          window.scrollTo(0, 1)
        }, 0)
      })

      // window.scrollTo(0, 1)

      return overlay
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
            created: Date.now(),
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

  // static createSHSFooter() {
  //   return new FooterField()
  //   .withType(footer => {
  //     footer.style.textAlign = "center"
  //     footer.style.backgroundColor = "#60a182"
  //     footer.style.padding = "21px 34px"
  //     footer.style.marginTop = "144px"

  //     const impressum = document.createElement("div")
  //     impressum.innerHTML = "Impressum"
  //     impressum.style.cursor = "pointer"
  //     impressum.style.padding = "13px"
  //     impressum.addEventListener("click", () => window.location.assign("/felix/shs/impressum/"))
  //     footer.append(impressum)

  //     const dsgvo = document.createElement("div")
  //     dsgvo.innerHTML = "Datenschutz"
  //     dsgvo.style.cursor = "pointer"
  //     dsgvo.style.padding = "13px"
  //     dsgvo.addEventListener("click", () => window.location.assign("/datenschutz/"))
  //     footer.append(dsgvo)

  //     const userAgreement = document.createElement("div")
  //     userAgreement.innerHTML = "Nutzervereinbarung"
  //     userAgreement.style.cursor = "pointer"
  //     userAgreement.style.padding = "13px"
  //     userAgreement.addEventListener("click", () => window.location.assign("/nutzervereinbarung/"))
  //     footer.append(userAgreement)
  //   })
  // }

  static setDefaultCursor() {document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "default")}
  static setWaitCursor() {document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "wait")}
  static setNotAllowedCursor() {document.querySelectorAll("div[class='security-overlay']").forEach(overlay => overlay.style.cursor = "not-allowed")}

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
    redirectUser.url = "/consumer/closed/"
    redirectUser.method = "redirect"
    redirectUser.type = "user"
    redirectUser.event = event
    redirectUser.referer = document.referrer
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
    typeof number !== "number" ||
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
