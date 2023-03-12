import {Request} from "./Request.js"
import {FooterField} from "./FooterField.js"

export class Helper {

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

  // static requestFailed(response) {
  //   if (response.status !== 200) {
  //     const confirm = window.confirm(`Es tut uns leid, aber es ist ein Fehler aufgetreten. Wenn dieser Fehler weiterhin auftritt, bitten wir Sie, uns zu kontaktieren.\n\nWir möchten sicherstellen, dass unsere Dienste reibungslos funktionieren und Ihr Feedback ist uns dabei sehr wichtig.\n\nMöchten Sie uns kontaktieren?`)
  //     if (confirm === true) window.location.href = "mailto:datenschutz@get-your.de"
  //     throw new Error("request failed")
  //   }
  // }

  // static setArrayToLocalStorage(arrayName, {name, key, value, object}) {
  //   const array = JSON.parse(window.localStorage.getItem(arrayName)) || []
  //   // if (funnels === null) window.localStorage.setItem("funnels", JSON.stringify([]))
  //   // funnels = JSON.parse(window.localStorage.getItem("funnels"))

  //   if (array.length === 0) {
  //     if (object !== undefined) {
  //       array.push(object)
  //       window.localStorage.setItem(arrayName, JSON.stringify(array))
  //     }
  //   } else {
  //     if (name !== undefined) {
  //       for (let i = 0; i < array.length; i++) {
  //         if (array[i].storage === name) {
  //           if (key !== undefined && value !== undefined) {
  //             if (array[i].value === undefined) array[i].value = {}
  //             array[i].value[key] = value
  //             window.localStorage.setItem(arrayName, JSON.stringify(array))
  //           }
  //         }
  //         // else throw new Error(`funnel '${name}' not found in localstorage`)
  //       }
  //     }
  //   }
  //   // if (funnels !== null) {
  //   // }
  // }

  static setFunnel({name, key, value, funnel}) {
    const funnels = JSON.parse(window.localStorage.getItem("funnels")) || []
    // if (funnels === null) window.localStorage.setItem("funnels", JSON.stringify([]))
    // funnels = JSON.parse(window.localStorage.getItem("funnels"))

    if (funnels.length === 0) {
      if (funnel !== undefined) {
        funnels.push(funnel)
        window.localStorage.setItem("funnels", JSON.stringify(funnels))
      }
    } else {
      if (name !== undefined) {
        for (let i = 0; i < funnels.length; i++) {
          if (funnels[i].storage === name) {
            if (key !== undefined && value !== undefined) {
              if (funnels[i].value === undefined) funnels[i].value = {}
              funnels[i].value[key] = value
              window.localStorage.setItem("funnels", JSON.stringify(funnels))
            }
          }
          // else throw new Error(`funnel '${name}' not found in localstorage`)
        }
      }
    }
    // if (funnels !== null) {
    // }
  }

  static getSelectedOffer() {
    try {
      const offers = JSON.parse(window.localStorage.getItem("offers"))
      for (let i = 0; i < offers.length; i++) {
        if (offers[i].value.selected === true) {
          return offers[i]
        }
      }
    } catch (error) {
      window.location.assign("/felix/shs/match-maker/hersteller-vergleich/")
      throw new Error(error)
    }
  }

  static getFunnelByStorageName(name) {
    try {
      if (this.stringIsEmpty(name)) throw new Error("storage name is empty")
      const funnels = JSON.parse(window.localStorage.getItem("funnels"))
      // console.log(funnels);
      for (let i = 0; i < funnels.length; i++) {
        if (funnels[i].storage === name) {
          return funnels[i]
        }
      }
    } catch (error) {
      window.location.assign("/felix/shs/funnel/qualifizierung/")
      throw new Error(error)
    }
  }

  // static resizeFontSize(element, newFontSize) {
  //   const styles = window.getComputedStyle(element);
  //   const initialFontSize = styles.getPropertyValue("font-size")

  //   const fontSize = window.innerWidth > 768 ? newFontSize : initialFontSize;
  //   element.style.fontSize = fontSize;

  //   window.addEventListener("resize", () => {
  //     const fontSize = window.innerWidth > 768 ? newFontSize : initialFontSize;
  //     element.style.fontSize = fontSize;
  //   })
  // }

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
      impressum.addEventListener("click", () => window.location.assign("/felix/shs/compliance/impressum/"))
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

  // static onWindowLoaded(callback) {
  //   if (callback !== undefined) window.addEventListener("load", (event) => callback(event))
  //   return this
  // }

  // static async loginUser(email) {
  //   this.addOverlay()
  //   this.setWaitCursor()

  //   try {
  //     await Request.withVerifiedEmail(email, async () => {
  //       const localStorageId = Request.localStorageId()

  //       const registerEmail = {}
  //       registerEmail.url = "/consumer/v1/"
  //       registerEmail.type = "id"
  //       registerEmail.method = "post"
  //       registerEmail.security = "open"
  //       registerEmail.name = "onlogin"
  //       registerEmail.localStorageId = localStorageId
  //       registerEmail.email = email
  //       await Request.sequence(registerEmail)

  //       const verifyUser = {}
  //       verifyUser.url = "/consumer/v1/"
  //       verifyUser.method = "put"
  //       verifyUser.security = "open"
  //       verifyUser.type = "verify"
  //       verifyUser.name = "onlogin"
  //       verifyUser.localStorageId = localStorageId
  //       await Request.sequence(verifyUser)

  //       const registerSession = {}
  //       registerSession.url = "/request/register/session/"
  //       registerSession.method = "put"
  //       registerSession.security = "open"
  //       registerSession.type = "session"
  //       registerSession.name = "onlogin"
  //       registerSession.localStorageId = localStorageId
  //       const res = await Request.middleware(registerSession)
  //       // console.log(res)

  //       // custom redirect codes >= 900
  //       if (res.status === 900) window.location.assign("/plattform/zugang/")
  //       if (res.status === 200) window.history.back()
  //       this.removeOverlay()
  //     })
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   this.setNotAllowedCursor()
  // }

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
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.opacity = "0.6"
    overlay.style.zIndex = "10"
    document.body.append(overlay)
  }

  static async getItem(type) {
    const get = {}
    get.url = "/consumer/v1/"
    // get.consumer = "operator"
    get.method = "get"
    // get.name = name
    get.type = type
    get.security = "closed"
    get.localStorageId = Request.localStorageId()
    const res = await Request.middleware(get)
    if (res.status === 200) return res.response
    if (res.status !== 200) return window.location.assign("/home/")
  }

  static async redirectOperatorToChecklist() {
    const redirectOperator = {}
    redirectOperator.url = "/consumer/v1/"
    redirectOperator.consumer = "operator"
    redirectOperator.method = "redirect"
    redirectOperator.name = "shs"
    redirectOperator.type = "checklist"
    redirectOperator.security = "closed"
    redirectOperator.localStorageId = Request.localStorageId()
    const res = await Request.middleware(redirectOperator)
    if (res.status === 200) window.location.assign(`/felix/shs/checklist/${res.response}/`)
    else window.location.assign("/home/")
  }


  static postForm(path, params) {
    const method = 'post'

    var form = document.createElement('form')
    form.setAttribute('method', method)
    form.setAttribute('action', path)

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement('input')
            hiddenField.setAttribute('type', 'hidden')
            hiddenField.setAttribute('name', key)
            hiddenField.setAttribute('value', params[key])

            form.appendChild(hiddenField)
        }
    }

    document.body.appendChild(form)
    form.submit()
  }
  // postForm('mysite.com/form', {arg1: 'value1', arg2: 'value2'});

  static millisToDateString(milliseconds) {
    const date = new Date(milliseconds)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    return `${day}.${month}.${year}`
  }

  // static previousFunnel(pathList) {
  //   const index = pathList.indexOf(window.location.pathname)
  //   if (index !== -1 && index < pathList.length - 1) {
  //     window.location.assign(pathList[index - 1])
  //   }
  // }


  // static nextFunnel(pathList) {
  //   const index = pathList.indexOf(window.location.pathname)
  //   if (index !== -1 && index < pathList.length - 1) {
  //     window.location.assign(pathList[index + 1])
  //   }
  // }

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

  // static async digestUserEmail() {
  //   const message = JSON.stringify(window.sessionStorage.getItem("email"))
  //   const digest = await this.digest(message)
  //   return digest
  // }

  // static async digestSessionStorage() {
  //   const message = JSON.stringify(window.sessionStorage)
  //   const digest = await this.digest(message)
  //   return digest
  // }

  // static fileToDataUrl(file) {
  //   try {
  //     const reader = new FileReader()
  //     reader.readAsDataURL(file)
  //     reader.addEventListener("loadend", () => {
  //       return {
  //         status: 200,
  //         message: "FILE_TO_DATA_URL_SUCCESS",
  //         dataUrl: reader.result,
  //       }
  //     })
  //   } catch (error) {
  //     return {
  //       status: 500,
  //       message: "FILE_TO_DATA_URL_ABORT",
  //     }
  //   }
  // }

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

  // static fileToDataUrl(file) {
  //   return new Promise((resolve, reject) => {
  //     if (file) {
  //       const reader = new FileReader()
  //       reader.readAsDataURL(file)
  //       reader.addEventListener("loadend", (event) => {
  //         return resolve({
  //           status: 200,
  //           message: "FILE_TO_DATA_URL_SUCCESS",
  //           dataUrl: reader.result
  //         })
  //       })
  //     } else {
  //       return reject({
  //         status: 500,
  //         message: "FILE_TO_DATA_URL_ABORT",
  //       })
  //     }
  //   })
  // }

}
