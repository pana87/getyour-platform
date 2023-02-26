import {Request} from "./Request.js"

export class Helper {

  static async redirectOperatorToChecklist() {
    const redirectOperator = {}
    redirectOperator.url = "/db/v1/"
    redirectOperator.type = "redirect"
    redirectOperator.name = "operator"
    redirectOperator.method = "get"
    redirectOperator.security = "closed"
    redirectOperator.localStorageId = Request.localStorageId()
    const res = await Request.middleware(redirectOperator)
    return res
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

  static previousFunnel(pathList) {
    const index = pathList.indexOf(window.location.pathname)
    if (index !== -1 && index < pathList.length - 1) {
      window.location.assign(pathList[index - 1])
    }
  }


  static nextFunnel(pathList) {
    const index = pathList.indexOf(window.location.pathname)
    if (index !== -1 && index < pathList.length - 1) {
      window.location.assign(pathList[index + 1])
    }
  }

  static setNotValidStyle(element) {
    element.style.border = "2px solid #d50000"
    if (element.type === "checkbox") {
      element.style.outline = "2px solid #d50000"
    }
    if (element.type === "file") {
      element.style.width = "100%"
      element.style.height = "100%"
    }
    element.style.borderRadius = "3px"
    const styles = element.querySelectorAll("style[id='after']")
    if (styles.length === 0) {
      const style = document.createElement("style")
      style.id = "after"
      style.innerHTML = /*css*/ `
        .${element.id}:after {
          content: "x";
          font-family: sans-serif;
          position: absolute;
          color: #d50000;
          padding-left: 8px;
        }
      `
      element.append(style)
      return element
    }
    if (styles.length > 0) {
      styles.forEach(style => style.remove())
      const style = document.createElement("style")
      style.id = "after"
      style.innerHTML = /*css*/ `
        .${element.id}:after {
          content: "x";
          font-family: sans-serif;
          position: absolute;
          color: #d50000;
          padding-left: 8px;
        }
      `
      element.append(style)
    }
    return element
  }

  static setValidStyle(element) {
    element.style.border = "2px solid #00c853"
    if (element.type === "checkbox") {
      element.style.outline = "2px solid #00c853"
    }
    if (element.type === "file") {
      element.style.width = "100%"
      element.style.height = "100%"
    }
    element.style.borderRadius = "3px"
    const styles = element.querySelectorAll("style[id='after']")
    if (styles.length === 0) {
      const style = document.createElement("style")
      style.id = "after"
      style.innerHTML = /*css*/ `
        .${element.id}:after {
          content: "✓";
          font-family: sans-serif;
          position: absolute;
          color: #00c853;
          padding-left: 8px;
        }
      `
      element.append(style)
      return element
    }
    if (styles.length > 0) {
      styles.forEach(style => style.remove())
      const style = document.createElement("style")
      style.id = "after"
      style.innerHTML = /*css*/ `
        .${element.id}:after {
          content: "✓";
          font-family: sans-serif;
          position: absolute;
          color: #00c853;
          padding-left: 8px;
        }
      `
      element.append(style)
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

  static encodeStringToUri(string) {
    return encodeURIComponent(string).replace(/%20/g, "-").replace(/u%CC%88/g, "ue").replace(/a%CC%88/g, "ae").replace(/o%CC%88/g, "oe").replace(/%2F/g, "-").replace(/%C3%A4/g, "ae").replace(/%C3%BC/g, "ue").replace(/\(/g, "").replace(/\)/g, "").replace(/%C3%B6/g, "oe").replace(/%C3%96/g, "Oe").replace(/\./g, "-").replace(/%C3%9F/g, "ss").replace(/%3F/g, "").replace(/-$/g, "")
  }

  static async digestUserEmail() {
    const message = JSON.stringify(window.sessionStorage.getItem("email"))
    const digest = await this.digest(message)
    return digest
  }

  static async digestSessionStorage() {
    const message = JSON.stringify(window.sessionStorage)
    const digest = await this.digest(message)
    return digest
  }

  static fileToDataUrl(file) {
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener("loadend", () => {
        return {
          status: 200,
          message: "FILE_TO_DATA_URL_SUCCESS",
          dataUrl: reader.result,
        }
      })
    } catch (error) {
      return {
        status: 500,
        message: "FILE_TO_DATA_URL_ABORT",
      }
    }
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

  static fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener("loadend", (event) => {
          return resolve({
            status: 200,
            message: "FILE_TO_DATA_URL_SUCCESS",
            dataUrl: reader.result
          })
        })
      } else {
        return reject({
          status: 500,
          message: "FILE_TO_DATA_URL_ABORT",
        })
      }
    })
  }

}
