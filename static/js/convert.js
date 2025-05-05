import {textIsEmpty} from "/js/verify.js"
import {resetNode} from "/js/remove.js"
import {div} from "/js/html-tags.js"

export const jsonToDiv = (input, node) => {
  function blockAll(element) {
    element.classList.add("block")
    element.querySelectorAll(".key-value").forEach(node => {
      node.classList.add("block")
    })
  }
  function removeAllBlock(element) {
    element.classList.remove("block")
    element.querySelectorAll(".key-value").forEach(node => {
      node.classList.remove("block")
    })
  }
  function noneAll(element) {
    element.classList.add("none")
    element.querySelectorAll(".key-value").forEach(node => {
      node.classList.add("none")
    })
  }
  function removeAllNone(element) {
    element.classList.remove("none")
    element.querySelectorAll(".key-value").forEach(node => {
      node.classList.remove("none")
    })
  }
  const jsonDiv = div("monospace fw-bold fs21 mtb21 mlr34")
  const buttons = div("flex align between", jsonDiv)
  const foldAllButton = textToAction("fold", buttons)
  foldAllButton.classList.add("w89")
  foldAllButton.onclick = ev => {
    toggleAllValues("none")
  }
  const unfoldAllButton = textToAction("unfold", buttons)
  unfoldAllButton.classList.add("w89")
  unfoldAllButton.onclick = ev => {
    toggleAllValues("block")
  }
  function toggleAllValues(displayValue) {
    const valueElements = jsonDiv.querySelectorAll(".key-value")
    valueElements.forEach(element => {
      if (displayValue === "none") {
        removeAllBlock(element)
        noneAll(element)
      }
      if (displayValue === "block") {
        removeAllNone(element)
        blockAll(element)
      }
    })
  }
  const jsonObject = JSON.parse(input)
  function toggleElement(element) {

    if (element) {
      if (element.classList.contains("none")) {
        element.classList.remove("none")
        element.classList.add("block")
        return
      }
      if (element.classList.contains("block")) {
        element.classList.remove("block")
        element.classList.add("none")
        return
      }
    }
  }
  function processObject(container, obj) {
    for (let key in obj) {
      const value = obj[key]
      if (key === "") key = "\"\""
      const keyElement = div("color-key hover")
      const valueElement = div("key-value none ml21 color-value")
      keyElement.addEventListener("click", ev => {
        ev.stopPropagation()
        toggleElement(valueElement)
      })
      const keyName = document.createElement("div")
      keyName.classList.add("key-name")
      keyName.textContent = key
      keyElement.appendChild(keyName)
      container.appendChild(keyElement)
      keyElement.appendChild(valueElement)
      if (typeof value === "object") {
        processObject(valueElement, value)
      } else {
        valueElement.textContent = JSON.stringify(value)
        }
      }
    }
    processObject(jsonDiv, jsonObject)
    node?.appendChild(jsonDiv)
    return jsonDiv
}
export const htmlToDiv = (input, node) => {
  const div = document.createElement("div")
  textToPurified(input).then(purified => div.innerHTML = purified)
  node?.appendChild(div)
  return div
}
export const millisToIso = input => {
  const millis = parseInt(input, 10)
  const date = new Date(millis)
  return date.toISOString()
}
export const millisToSince = input => {
  function formatTimeSince(milliseconds) {
    const now = Date.now()
    const elapsed = now - milliseconds
    const msInSecond = 1000
    const msInMinute = 60 * msInSecond
    const msInHour = 60 * msInMinute
    const msInDay = 24 * msInHour
    const msInMonth = 30 * msInDay
    const msInYear = 12 * msInMonth
    if (elapsed < msInMinute) {
      const seconds = Math.floor(elapsed / msInSecond)
      return `${seconds} Sekunde${seconds !== 1 ? 'n' : ''}`
    } else if (elapsed < msInHour) {
      const minutes = Math.floor(elapsed / msInMinute)
      return `${minutes} Minute${minutes !== 1 ? 'n' : ''}`
    } else if (elapsed < msInDay) {
      const hours = Math.floor(elapsed / msInHour)
      const minutes = Math.floor((elapsed % msInHour) / msInMinute)
      return `${hours} Stunde${hours !== 1 ? 'n' : ''} ${minutes} Minute${minutes !== 1 ? 'n' : ''}`
    } else if (elapsed < msInMonth) {
      const days = Math.floor(elapsed / msInDay)
      return `${days} Tag${days !== 1 ? 'en' : ''}`
    } else if (elapsed < msInYear) {
      const months = Math.floor(elapsed / msInMonth)
      return `${months} Monat${months !== 1 ? 'en' : ''}`
    } else {
      const years = Math.floor(elapsed / msInYear)
      return `${years} Jahr${years !== 1 ? 'en' : ''}`
    }
  }
  return formatTimeSince(input)
}
export const nodeMarked = (query, node) => {
  const fragment = document.createDocumentFragment()
  node.textContent.split(new RegExp(`(${query})`, 'gi')).forEach(part => {
    const span = document.createElement('span')
    if (part.toLowerCase() === query.toLowerCase()) {
      span.className = "bg-orange"
    }
    span.appendChild(document.createTextNode(part))
    fragment.appendChild(span)
  })
  node.textContent = ""
  node.appendChild(fragment)
  return fragment
}
export const nodeToSelector = input => {
  if (!(input instanceof Element)) throw new Error("not an element")
  const tagName = input.tagName.toLowerCase()
  const id = input.getAttribute("id") ? `#${input.id}` : ''
  const classes = input.getAttribute("class")
  ? `.${input.getAttribute("class").split(' ').join('.')}`
  : ''
  return `${tagName}${id}${classes}`
}
export const nodeToAlias = input => {
  const output = document.createElement("div")
  output.className = "monospace fs13 of-auto inline"
  output.textContent = `<${input.tagName.toLowerCase()}`
  if (!textIsEmpty(input.id)) {
    const id = document.createElement("span")
    id.className = "fs21"
    id.textContent = `#${input.id}`
    output.appendChild(id)
  }
  if (input.classList.length > 0) {
    for (let i = 0; i < input.classList.length; i++) {
      const className = input.classList[i]
      const span = document.createElement("span")
      span.className = "fs21"
      span.textContent = `.${className}`
      output.appendChild(span)
    }
  }
  return output
}
export const nodeToNote = input => {
  resetNode(input)
  input.className = "ptb144 flex align center color-theme sans-serif"
  return input
}
export const nodeToScrollable = input => {
  input.textContent = ""
  input.removeAttribute("style")
  input.className = "ofy-auto overscroll-none pb144"
  return input
}
export const pathToId = input => {
  const it = input.split("/").pop()
  return it.split(".")[0]
}
export const idToScript = input => {
  const script = document.createElement("script")
  script.id = input
  script.src = `/js/${input}.js`
  script.type = "module"
  return script
}
export const scrollToNode = node => {
  node.scrollIntoView({behavior: "smooth"})
}
export const srcToImg = (src, node) => {
  const img = document.createElement("img")
  img.className = "image"
  img.src = src
  node?.appendChild(img)
  return img
}
export const tagToAllFirstUpper = input => {
  if (input.includes("-")) {
    const array = input.split("-")
    const results = []
    for (var i = 0; i < array.length; i++) {
      const item = array[i]
      const result = textToFirstUpper(item)
      results.push(result)
    }
    return results.join(" ")
  } else {
    return textToFirstUpper(input)
  }
}
export const textToAction = (text, node) => {
  const div = document.createElement("div")
  div.className = "action"
  div.textContent = text
  node?.appendChild(div)
  return div
}
export const textToClipboard = text => {
  return navigator.clipboard.writeText(text)
}
export const textToDigest = text => {
  return new Promise(async(resolve, reject) => {
    try {
      const data = new TextEncoder().encode(text)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      resolve(hashHex)
    } catch (error) {
      reject(error)
    }
  })
}
export const textToHoverBottomRight = (text, node) => {
  const textDiv = div("op0 absolute bottom right mtb3 mlr13", node)
  textDiv.textContent = text
  node.classList.add("relative")
  node.addEventListener("mouseover", () => {
    textDiv.classList.remove("op0")
    textDiv.classList.add("op1")
  })
  node.addEventListener("mouseout", () => {
    textDiv.classList.remove("op1")
    textDiv.classList.add("op0")
  })
  return node
}
export const textToHtml = (text, node) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, "text/html")
  const fragment = document.createDocumentFragment()
  while (doc.body.firstChild) {
    fragment.appendChild(doc.body.firstChild)
  }
  node?.appendChild(fragment)
  return doc
}
export const textToDiv = (input, node) => {
  const it = div("sans-serif")
  it.textContent = input
  node?.appendChild(it)
  return it
}
export const textToFirstChild = input => {
  return new Promise(async(resolve, reject) => {
    try {
      const parser = document.createElement("div")
      parser.innerHTML = await Helper.convert("text/purified", input)
      resolve(parser.children[0])
    } catch (error) {
      reject(error)
    }
  })
}
export const textToFirstUpper = input => {
  return input.charAt(0).toUpperCase() + input.slice(1)
}
export const textToFragment = input => {
  const fragment = document.createDocumentFragment()
  const parser = document.createElement("div")
  parser.innerHTML = input
  fragment.appendChild(parser.firstChild)
  return fragment
}
export const textToH1 = (text, node) => {
  const h1 = document.createElement("h1")
  h1.className = "mtb21 mlr34 sans-serif color-theme fw-normal"
  h1.textContent = text
  node?.appendChild(h1)
  return h1
}
export const textToH2 = (text, node) => {
  const h2 = document.createElement("h2")
  h2.className = "mtb21 mlr34 sans-serif color-theme fw-normal"
  h2.textContent = text
  node?.appendChild(h2)
  return h2
}
export const textToHr = (text, node) => {
  const container = div("dark-light")
  const textDiv = document.createElement("div")
  textDiv.className = "sans-serif fs21 mtb0 mlr34"
  textDiv.textContent = text
  container.appendChild(textDiv)
  const hr = document.createElement("hr")
  hr.className = "mtb0 mlr21 border-theme"
  container.appendChild(hr)
  node?.appendChild(container)
  return container
}
export const textToLink = (text, node) => {
  const link = div("btn-theme hover p13 br13 sans-serif flex align center")
  link.textContent = text
  node?.appendChild(link)
  return link
}
export const textToNote = (text, node) => {
  const note = div("ptb144 flex align center color-theme sans-serif")
  note.textContent = text
  node?.appendChild(note)
  return note
}
export const textToP = (input, node) => {
  const p = document.createElement("p")
  p.className = "mtb21 mlr34 sans-serif color-theme"
  p.textContent = input
  node?.appendChild(p)
  return p
}
export const textToSpan = (text, node) => {
  const span = document.createElement("span")
  span.textContent = text
  node?.appendChild(span)
  return span
}
export const textToTag = input => {
  input = input.toLowerCase()
  input = input.replaceAll(" ", "-")
  input = input.replaceAll("ö", "oe")
  input = input.replaceAll("ä", "ae")
  input = input.replaceAll("ü", "ue")
  input = input.replace(/[^a-z-]/g, '')
  input = input.replace(/-+/g, '-')
  if (input.startsWith("-")) input = input.slice(1)
  if (input.endsWith("-")) input = input.slice(0, -1)
  return input
}
export const textToTitle = input => {
  let node = document.querySelector("title")
  if (!node) {
    node = document.createElement("title")
    document.head.appendChild(node)
  }
  node.textContent = input
}
export const textToLine = input => {
  let text = input
  text = text.replace(/\s+/g, " ").trim()
  text = text.slice(1, -1).trim()
  const textArray = text.split(",").map(text => text.trim())
  const filtered = textArray.filter(text => !this.verifyIs("text/empty", text))
  const singleLine = filtered.join(", ")
  return `{${singleLine}}`
}
export const textToPurified = input => {
  return new Promise(async(resolve, reject) => {
    try {
      await import("/js/purify.min.js")
      const purified = DOMPurify.sanitize(input)
      resolve(purified)
    } catch (error) {
      reject(error)
    }
  })
}
export const treeToKey = input => {
  const keys = input.split(".")
  if (keys.length > 0) {
    return keys[keys.length - 1]
  } else {
    return input
  }
}
export const typeToExtension = input => {
  const mimeMapping = {
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/wav": "wav",
    "video/mp4": "mp4",
    "video/ogg": "ogv",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "text/html": "html",
    "text/plain": "txt",
    "application/pdf": "pdf",
    "application/zip": "zip",
  }
  return mimeMapping[input]
}
