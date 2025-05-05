export const removeAttributes = input => {
  while(input.attributes.length > 0) input.removeAttribute(input.attributes[0].name)
}
export const removeDoubleFrontSlash = input => {
  return input.replace(/\/\/.*$/gm, "")
}
export const removeEmptyLine = input => {
  return input
    .split("\n")
    .filter(it => it.trim() !== "")
    .join("\n")
}
export const removeExif = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(blob => {
          const stripped = new File([blob], file.name, { type: file.type })
          resolve(stripped)
        }, file.type)
      }
      img.src = ev.target.result
    }
    reader.onerror = e => reject(e)
    reader.readAsDataURL(file)
  })
}
export const removeNoSave = () => {
  document.querySelectorAll(".no-save").forEach(it => it.remove())
}
export const removeOverlays = () => {
  document.querySelectorAll(".overlay").forEach(it => it.remove())
}
export const removeSelector = selector => {
  document.querySelectorAll(selector).forEach(it => it.remove())
}
export const removeSemicolon = input => {
  return input.replace(/;/g, "")
}
export const resetNode = input => {
  removeAttributes(input)
  input.textContent = ""
}
