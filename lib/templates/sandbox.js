import { Helper } from "/js/Helper.js"

const list = await Helper.verifyIs("element/loaded", "match-maker-list-anlagenbetreiber")

for (let i = 0; i < list.children.length; i++) {
  const child = list.children[i]

  const input = child.querySelector("input[class='quantity']")

  input.oninput = (ev) => {

    const price = child.querySelector("span[class='modul-preis']")

    const target = child.querySelector("span[class='total-amount']")

    const result = parseFloat(price.innerHTML) * parseInt(ev.target.value)

    target.innerHTML = result

  }

}
