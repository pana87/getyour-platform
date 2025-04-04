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
export const label = (text, node) => {
  const label = document.createElement("label")
  label.textContent = text
  label.className = "relative color-theme fs21 sans-serif block"
  label.appendChild(node.input)
  node.appendChild(label)
  return label
}
export const link = (rel, href) => {
  const link = document.createElement("link")
  link.id = href
  link.rel = rel
  link.href = href
  if (!document.getElementById(link.id)) {
    document.head.appendChild(link)
  }
  return link
}
export const span = (className, node) => {
  const span = document.createElement("span")
  span.className = className
  if (span.className === "") span.removeAttribute("class")
  if (node) node.appendChild(span)
  return span
}
