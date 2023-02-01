export class Helper {

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
    const data = new TextEncoder().encode(message);
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
