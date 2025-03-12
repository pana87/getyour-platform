export const img = (className, node) => {
  const img = document.createElement("img")
  img.className = className
  if (node) node.appendChild(img)
  return img
}
