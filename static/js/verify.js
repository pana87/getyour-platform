import {div} from "/js/html-tags.js"
import {post} from "/js/request.js"
import {alertNok} from "/js/alert.js"
import {greenInfo} from "/js/create.js"
import {lock} from "/js/overlay.js"
import {textToDigest, textToP, textToSpan} from "/js/convert.js"
import {text} from "/js/input.js"

function setNotValidBorder(input) {
  const isCheckbox = verifyType("checkbox", input)
  if (isCheckbox) {
    input.classList.remove("outline-green")
    input.classList.add("outline-red")
  } else {
    input.classList.remove("border-green")
    input.classList.add("border-red")
  }
}
function setValidBorder(input) {
  const isCheckbox = verifyType("checkbox", input)
  if (isCheckbox) {
    input.classList.remove("outline-red")
    input.classList.add("outline-green")
  } else {
    input.classList.remove("border-red")
    input.classList.add("border-green")
  }
}
export const addNotValidSign = input => {
  input.parentElement.querySelectorAll(".sign")
    .forEach(sign => sign.remove())
  input.sign = div("sign color-red", input.parentElement)
  setNotValidBorder(input)
  input.sign.textContent = "x"
}
export const addValidSign = input => {
  input.parentElement.querySelectorAll(".sign")
    .forEach(sign => sign.remove())
  input.sign = div("sign color-green", input.parentElement)
  setValidBorder(input)
  input.sign.textContent = "✓"
}
export const arrayIsEmpty = input => {
  return !Array.isArray(input) || input.length === 0
}
export const emailIsEmpty = input => {
  return textIsEmpty(input) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
}
const fileIsPdf = file => {
  return new Promise(async(resolve, reject) => {
    try {
      const allowedMimeTypes = ["application/pdf"]
      const allowedExtensions = ["pdf"]
      const types = await verifyFileTypes(file, allowedMimeTypes)
      if (types === false) {
        window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
        throw new Error("no pdf")
      }
      const extensions = await verifyFileExtensions(file, allowedExtensions)
      if (extensions === false) {
        window.alert(`Erlaubte Formate: ${allowedExtensions.join(", ")}`)
        throw new Error("no pdf")
      }
      resolve(true)
    } catch (error) {
      resolve(false)
    }
  })
}
const inputIsAccepted = input => {
  const array = []
  const accept = input.getAttribute("accept")
  if (accept && accept.includes("application/pdf")) {
    return new Promise(async(resolve, reject) => {
      try {
        const promises = []
        for (var i = 0; i < input.files.length; i++) {
          const file = input.files[i]
          const promise = fileIsPdf(file)
          promises.push(promise)
        }
        const results = await Promise.all(promises)
        if (results.every((element) => element === true)) {
          array.push(true)
          resolve(true)
        } else {
          array.push(false)
          resolve(false)
        }
      } catch (error) {
        array.push(false)
        resolve(false)
      }
    })
  }
  if (accept && accept.includes("text/js")) {
    try {
      array.push(textIsJs(input.value))
    } catch (error) {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/length")) {
    if (input.value.length <= input.maxLength) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/trees")) {
    if (textIsTrees(input.value)) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/tree")) {
    input.value = input.value.replace(/ /g, ".")
    if (textIsTree(input.value) === true) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/operator")) {
    array.push(textIsOperator(input.value))
  }
  if (accept && accept.includes("text/email")) {
    if (/^(.+)@(.+)$/.test(input.value) === true) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/url")) {
    if (textIsUrl(input.value)) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/number")) {
    if (textIsNumber(input.value)) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (input.requiredIndex !== undefined) {
    let selected = []
    for (let i = 0; i < input.options.length; i++) {
      const option = input.options[i]
      if (option.selected === true) {
        selected.push(option)
      }
    }
    for (let i = 0; i < selected.length; i++) {
      if (selected[i].value === input.options[input.requiredIndex].value) {
        array.push(true)
      }
    }
  }
  if (accept && accept.includes("text/tel")) {
    if (textIsTel(input.value)) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/id")) {
    input.value = input.value.replace(/ /g, "-")
    if (/^[a-z](?:-?[a-z]+)*$/.test(input.value) === true) {
      if (document.querySelectorAll(`#${input.value}`).length === 0) {
        array.push(true)
      } else {
        array.push(false)
      }
    }
  }
  if (accept && accept.includes("text/path")) {
    if (textIsPath(input.value)) {
      addValidSign(input)
      array.push(true)
    } else {
      addNotValidSign(input)
      array.push(false)
    }
  }
  if (accept && accept.includes("text/hex")) {
    if (/^[0-9A-Fa-f]+$/.test(input.value) === true) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/tag")) {
    input.value = input.value.replace(/ /g, "-")
    input.value = input.value.replace(/ö/g, "oe")
    input.value = input.value.replace(/ä/g, "ae")
    input.value = input.value.replace(/ü/g, "ue")
    if (/^[a-z](?:-?[a-z]+)*$/.test(input.value) === true) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/https")) {
    if (input.value.startsWith("https://")) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("email/array")) {
    if (!input.value.startsWith("[")) array.push(false)
    if (!input.value.endsWith("]")) array.push(false)
    try {
      const array = JSON.parse(input.value)
      for (let i = 0; i < array.length; i++) {
        const email = array[i]
        if (emailIsEmpty(email)) throw new Error("email is empty")
      }
      array.push(true)
    } catch (error) {
      array.push(false)
    }
  }
  if (accept && accept.includes("string/array")) {
    if (!input.value.startsWith("[")) array.push(false)
    if (!input.value.endsWith("]")) array.push(false)
    try {
      const array = JSON.parse(input.value)
      for (let i = 0; i < array.length; i++) {
        const string = array[i]
        if (textIsEmpty(string)) throw new Error("string is empty")
      }
      array.push(true)
    } catch (error) {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/script")) {
    if (textIsScript(input.value)) {
      array.push(true)
    } else {
      array.push(false)
    }
  }
  if (accept && accept.includes("text/field-funnel")) {
    const funnel = textToFirstChild(input.value)
    if (funnel.tagName === "DIV") {
      if (funnel.classList.contains("field-funnel")) {
        array.push(true)
      } else {
        array.push(false)
      }
    }
  }
  const allTrue = array.every(it => it === true)
  if (allTrue === true) return true
  return false
}
const inputIsRequired = input => {
  return input.hasAttribute("aria-required") ||
    input.hasAttribute("required") ||
    input.getAttribute("required") === "true" ||
    input.required === true
}
const inputIsValid = input => {
  const isRequired = inputIsRequired(input)
  const hasMaxLength = input.hasAttribute("maxlength")
  const hasAccept = input.hasAttribute("accept")
  const isCheckbox = verifyType("checkbox", input)
  const isSelect = input.tagName === "SELECT"
  function notValid(input) {
    addNotValidSign(input)
    if (input.parentElement) input.parentElement.scrollIntoView({behavior: "smooth"})
    return false
  }
  function isValid(input) {
    addValidSign(input)
    return true
  }
  function validateRequired(input) {
    if (isRequired && isCheckbox) {
      if (input.getAttribute("checked") === "true") return true
      if (input.checked === true) return true
      return false
    }
    if (isRequired) {
      if (typeof input.value === "string") {
        if (!textIsEmpty(input.value)) return true
      }
      if (typeof input.value === "number") {
        if (!numberIsEmpty(input.value)) return true
      }
    }
    return false
  }
  function validateMaxLength(input) {
    if (hasMaxLength) {
      const maxLength = parseInt(input.getAttribute("maxlength"), 10)
      if (input.value.length <= maxLength) return true
    }
    return false
  }
  function validateAccepted(input) {
    if (hasAccept) {
      if (inputIsAccepted(input)) return true
    }
    return false
  }
  function validateChecked(input) {
    if (input.type === "checkbox") {
      if (inputIsChecked(input)) return true
    }
    return false
  }
  function validate(input) {
    if (isRequired && hasMaxLength && hasAccept) {
      return validateRequired(input) && validateMaxLength(input) && validateAccepted(input) ? isValid(input) : notValid(input)
    }
    if (isRequired && isCheckbox) {
      if (input.getAttribute("checked") === "true") return isValid(input)
      if (input.checked === true) return isValid(input)
      return notValid(input)
    }
    if (isRequired && hasAccept) {
      if (validateRequired(input) && validateAccepted(input)) return isValid(input)
      return notValid(input)
    }
    if (isRequired) {
      if (validateRequired(input)) return isValid(input)
      return notValid(input)
    }
    if (hasAccept) {
      if (validateAccepted(input)) return isValid(input)
      return notValid(input)
    }
    if (isSelect) {
      if (!textIsEmpty(input.value)) return isValid(input)
      if (!isRequired) return isValid(input)
      return notValid(input)
    }
    if (!isRequired && !hasAccept && !hasMaxLength) return isValid(input)
    if (hasMaxLength) {
      if (validateMaxLength(input)) return isValid(input)
    }
    return notValid(input)
  }
  return validate(input)
}
export const inputIsChecked = input => {
  return input.checked
}
export const millisIsPast = input => {
  if (input < Date.now()) {
    return true
  } else {
    return false
  }
}
export const numberIsEmpty = input => {
  return input === undefined ||
  input === null ||
  Number.isNaN(input) ||
  typeof input !== "number" ||
  input === ""
}
export const onlyClosedUser = node => {
  return new Promise(async(resolve, reject) => {
    const res = await post("/verify/user/closed/")
    if (res.status === 200) {
      resolve()
    } else {
      const confirm = window.confirm("Um die folgenden Funktionen nutzen zu können, musst du dich anmelden.\n\nMöchtest du dich jetzt anmelden?")
      if (confirm === true) {
        const a = document.createElement("a")
        a.href = "/login/"
        a.target = "_blank"
        a.click()
      } else {
        node.remove()
      }
    }
  })
}
export const pathExist = (path, field) => {
  return new Promise(async(resolve, reject) => {
    try {
      const res = await post("/verify/path/exist/", {path})
      if (res.status === 200) {
        window.alert("Pfad existiert bereits.")
        addNotValidSign(field.input)
        field.scrollIntoView({behavior: "smooth"})
        throw new Error("path exist")
      } else {
        resolve()
      }
    } catch (error) {
      reject(error)
    }
  })
}
export const pathIsValid = () => {
  const split = window.location.pathname.split("/")
  const expert = split[1]
  const platform = split[2]
  const path = split[3]
  const checkLength = split.length === 5
  const checkLast = split[4] === ""
  const checkExpert = !textIsEmpty(expert)
  const checkPlatform = !textIsEmpty(platform)
  const checkPath = !textIsEmpty(path)
  return checkLength && checkLast && checkExpert && checkPlatform && checkPath
}
export const textIsEmpty = input => {
  return typeof input !== "string" ||
    input === "undefined" ||
    input === "null" ||
    input === undefined ||
    input === null ||
    input === "" ||
    input.replace(/\s/g, "") === ""
}
export const textIsJs = input => {
  try {
    if (textIsEmpty(input)) throw new Error("text is empty")
    new Function(input)
    return true
  } catch (error) {
    return false
  }
}
export const textIsNumber = input => {
  if (typeof input === "number") return isFinite(input)
  if (typeof input === "string" && input.trim() !== "") {
    const number = Number(input)
    return !isNaN(number) && isFinite(number)
  }
  return false
}
export const textIsOperator = input => {
  if (input === "=") return true
  if (input === ">=") return true
  if (input === "<=") return true
  if (input === "!=") return true
  if (input === "<") return true
  if (input === ">") return true
  return false
}
export const textIsPath = input => {
  if (input === "/") return true
  const regex = /^\/([a-z]+(?:-[a-z]+)*)(\/[a-z]+(?:-[a-z]+)*)*\/$/
  return regex.test(input)
}
export const textIsScript = input => {
  try {
    const fragment = textToFragment(input)
    const script = fragment.querySelector("script")
    return script !== null && script.tagName === "SCRIPT"
  } catch {}
  return false
}
export const textIsTel = input => {
  if (typeof input !== "string") return false
  if (/^\+[0-9]+$/.test(input) === true) return true
  return false
}
export const textIsTree = input => {
  if (/^(?!.*[-.]{2,})(?!.*^-)(?!.*\.$)(?!.*\.\.$)[a-z]+([-.][a-z]+|\.\d+)*$/.test(input)) {
    return true
  } else {
    return false
  }
}
export const textIsTrees = input => {
  if (!input.startsWith("[")) return false
  if (!input.endsWith("]")) return false
  try {
    const array = JSON.parse(input)
    for (let i = 0; i < array.length; i++) {
      const text = array[i]
      if (textIsTree(text)) return true
    }
  } catch {}
  return false
}
export const textIsUrl = input => {
  try {
    new URL(input)
    return true
  } catch (error) {
    return false
  }
}
export const verifyEmailPin = (email, callback) => {
  return new Promise(async(resolve, reject) => {
    try {
      lock(async lock1 => {
        try {
          const content = lock1.content
          const res = await post("/send/email/with/pin/", {email})
          if (res.status === 200) {
            content.textContent = ""
            const pin = text(content)
            pin.input.setAttribute("required", "true")
            pin.input.setAttribute("accept", "text/hex")
            pin.input.placeholder = "Meine PIN"
            verifyInputs(content)
            const submitBtn = div("action", content)
            submitBtn.textContent = "PIN bestätigen"
            submitBtn.addEventListener("click", async () => {
              await verifyInputValue(pin.input)
              lock(async lock2 => {
                try {
                  await verifyInputValue(pin.input)
                  const res = await post("/verify/pin/", {userPin: pin.input.value})
                  if (res.status === 200) {
                    window.localStorage.setItem("email", email)
                    const id = await textToDigest(JSON.stringify({email, verified: true}))
                    window.localStorage.setItem("localStorageId", id)
                    await callback(content)
                  }
                } catch (error) {
                  EventTarget.prototype.addEventListener = function(type, listener, options) {
                    console.log('Event listeners blocked')
                  }
                  window.XMLHttpRequest = function() {
                    console.log('XHR blocked')
                  }
                  alertNok()
                  reject(error)
                }
              })
            })
            const infoBox = greenInfo(content)
            const p1 = textToP(`PIN erfolgreich an '${email}' gesendet.`, infoBox)
            const span1 = textToSpan("✓", p1)
            span1.className = "fs34"
            textToP("Es ist wichtig, dass deine PIN geheim gehalten wird, da sie als persönliches Kennwort dient und den Zugriff auf sensible Informationen oder Ressourcen ermöglicht. Teile deine PIN niemals mit anderen Personen. Das gilt selbst für enge Freunde, Familienmitglieder oder Mitarbeiter. Deine PIN sollte nur dir bekannt sein.", infoBox)
            textToP("Bitte bestätige deine PIN um fortzufahren.", infoBox)
          } else {
            alertNok()
            window.location.reload()
          }
        } catch (error) {
          EventTarget.prototype.addEventListener = function(type, listener, options) {
            console.log('Event listeners blocked')
          }
          window.XMLHttpRequest = function() {
            console.log('XHR blocked')
          }
          alertNok()
          reject(error)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}
const verifyFileExtension = (file, extension) => {
  try {
    const fileExtension = file.name.split('.').pop()
    if (fileExtension === extension) return true
    return false
  } catch (error) {
    return false
  }
}
const verifyFileType = (file, type) => {
  if (file.type === type) return true
  return false
}
const verifyFileExtensions = (file, extensions) => {
  return new Promise((resolve, reject) => {
    try {
      const fileExtension = input.file.name.split('.').pop()
      for (let i = 0; i < input.extensions.length; i++) {
        const extension = input.extensions[i]
        if (verifyFileExtension(file, extension)) resolve()
      }
      throw new Error("file extension not allowed")
    } catch (error) {
      reject(error)
    }
  })
}
const verifyFileTypes = (file, types) => {
  return new Promise((resolve, reject) => {
    try {
      for (let i = 0; i < input.types.length; i++) {
        const type = input.types[i]
        if (verifyFileType(file, type)) {
          resolve()
        }
      }
      throw new Error("mime type not allowed")
    } catch (error) {
      reject(error)
    }
  })
}
export const verifyFunnel = input => {
  return new Promise(async(resolve, reject) => {
    try {
      const allNodes = new Set()
      if (typeof input === "object") {
        for (const key in input) {
          if (input.hasOwnProperty(key)) {
            const div = input[key]
            const nodes = input.querySelectorAll("input, textarea, select")
            nodes.forEach(node => allNodes.add(node))
          }
        }
      }
      if (input instanceof Node) {
        const nodes = input.querySelectorAll("input, textarea, select")
        nodes.forEach(node => allNodes.add(node))
      }
      for (const node of allNodes) {
        const isValid = await verifyInputValue(node)
        if (!isValid) {
          node.scrollIntoView({ behavior: "smooth", block: "start" })
          throw new Error("funnel invalid")
        }
      }
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
export const verifyInputs = input => {
  return new Promise((resolve, reject) => {
    try {
      const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes') {
            const lockedAttributes = [
              "accept",
              "id",
              "maxlength",
              "required",
              "min",
              "max",
              "pattern",
              "step",
              "type",
              "value",
              "disabled",
              "readonly",
              "minlength",
            ]
            if (lockedAttributes.includes(mutation.attributeName)) {
              window.location.reload()
            }
          }
          return
        }
        return
      })
      const nodes = input.querySelectorAll("input, textarea, select")
      nodes.forEach(node => {
        observer.observe(node, { attributes: true, childList: true, subtree: true })
        verifyInputValue(node)
        node.addEventListener("input", () => verifyInputValue(node))
      })
      observer.disconnect()
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}
export const verifyInputValue = input => {
  return new Promise((resolve, reject) => {
    try {
      const isValid = inputIsValid(input)
      if (isValid) resolve(isValid)
      else throw new Error("input invalid")
    } catch (error) {
      reject(error)
    }
  })
}
export const verifyMaxLength = input => {
  if (input.hasAttribute("maxlength")) {
    const maxLength = parseInt(input.getAttribute("maxlength"), 10)
    if (input.value.length <= maxLength) return true
  }
  return false
}
export const verifyType = (type, input) => {
  return input.type === type
}
