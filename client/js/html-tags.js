export const br = (className, node) => {
  const br = document.createElement("br")
  br.className = className
  if (br.className === "") br.removeAttribute("class")
  if (node) node.appendChild(br)
  return br
}
export const div = (className, node) => {
  const div = document.createElement("div")
  div.className = className
  if (div.className === "") div.removeAttribute("class")
  if (node) node.appendChild(div)
  return div
}
export const img = (className, node) => {
  const img = document.createElement("img")
  img.className = className
  if (img.className === "") img.removeAttribute("class")
  if (node) node.appendChild(img)
  return img
}
export const span = (className, node) => {
  const span = document.createElement("span")
  span.className = className
  if (span.className === "") span.removeAttribute("class")
  if (node) node.appendChild(span)
  return span
}
