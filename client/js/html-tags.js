export const div = (className, node) => {
  const div = document.createElement("div")
  div.className = className
  if (node) node.appendChild(div)
  return div
}
export const img = (className, node) => {
  const img = document.createElement("img")
  img.className = className
  if (node) node.appendChild(img)
  return img
}
export const span = (className, node) => {
  const span = document.createElement("span")
  span.className = className
  if (node) node.appendChild(span)
  return span
}
