export const a = (input, node) => {
  const {className, href, target, text} = input
  const a = document.createElement("a")
  a.className = className
  a.textContent = text
  a.href = href
  a.target = target
  node?.appendChild(a)
  return a
}
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
  node?.appendChild(div)
  return div
}
export const h1 = (className, node) => {
  const h1 = document.createElement("h1")
  h1.className = className
  if (h1.className === "") h1.removeAttribute("class")
  node?.appendChild(h1)
  return h1
}
export const h2 = (className, node) => {
  const h2 = document.createElement("h2")
  h2.className = className
  if (h2.className === "") h2.removeAttribute("class")
  node?.appendChild(h2)
  return h2
}
export const hr = (node) => {
  const hr = document.createElement("hr")
  hr.className = "mtb0 mlr21 border-theme"
  node?.appendChild(hr)
  return hr
}
export const img = (className, node) => {
  const img = document.createElement("img")
  img.className = className
  if (img.className === "") img.removeAttribute("class")
  if (node) node.appendChild(img)
  return img
}
export const labelFor = (forText, text, node) => {
  const label = document.createElement("label")
  label.textContent = text
  label.setAttribute("for", forText)
  label.className = "break-word relative color-theme fs21 sans-serif block"
  node?.appendChild(label)
  return label
}
export const label = (text, node) => {
  const label = document.createElement("label")
  label.textContent = text
  label.className = "relative color-theme fs21 sans-serif block"
  label.appendChild(node.input)
  node?.appendChild(label)
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
export const p = (className, node) => {
  const p = document.createElement("p")
  p.className = className
  if (p.className === "") p.removeAttribute("class")
  node?.appendChild(p)
  return p
}
export const span = (className, node) => {
  const span = document.createElement("span")
  span.className = className
  if (span.className === "") span.removeAttribute("class")
  if (node) node.appendChild(span)
  return span
}
