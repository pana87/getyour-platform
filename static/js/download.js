import {typeToExtension} from "/js/convert.js"
import {digest} from "/js/crypto.js"

export const downloadFile = async (content, type) => {
  const a = document.createElement("a")
  const file = new Blob([content], {type})
  const hash = await digest(file)
  a.href = URL.createObjectURL(file)
  a.download = `${hash}.${typeToExtension(type)}`
  a.click()
}
