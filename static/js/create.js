import {a, div} from "/js/html-tags.js"

export const aLink = (text, href, node) => {
  const link = a({
    className: "mlr5 link-theme sans-serif hover",
    text,
    href,
    target: "_blank"
  })
  node?.appendChild(link)
  return link
}
export const greenInfo = node => {
  const it = div("fs13 sans-serif p13 br13 mtb21 mlr34 color-black bg-green")
  node?.appendChild(it)
  return it
}
export const flexAround = node => {
  const it = div("flex around wrap mtb21 mlr34")
  node?.appendChild(it)
  return it
}
export const flexRow = node => {
  const it = div("flex wrap mtb21 mlr34")
  node?.appendChild(it)
  return it
}
export const textImage = node => {
  const box = div("of-hidden flex column btn-theme hover mlr34 mtb13 br13 sans-serif")
  box.text = div("p13 fs21", box)
  box.image = div("image flex", box)
  node?.appendChild(box)
  return box
}
