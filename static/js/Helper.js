export class Helper {

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
