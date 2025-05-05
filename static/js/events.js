import {removeSelector, removeExif, resetNode} from "/js/remove.js"
import {text, file, select} from "/js/input.js"
import {pop, lock} from "/js/overlay.js"
import {post} from "/js/request.js"
import {alertNok, alertSaved, alertRemoved} from "/js/alert.js"
import {textToPurified, textToP, srcToImg, textToHoverBottomRight, textToHr, textToNote} from "/js/convert.js"
import {add, addSubmitButton} from "/js/button.js"
import {div} from "/js/html-tags.js"
import {renderTabs} from "/js/render.js"
import {postFormData} from "/js/request.js"
import {aliasFunnel} from "/js/funnel.js"
import {verifyInputs, verifyFunnel, verifyInputValue, addNotValidSign, addValidSign, pathIsValid, textIsEmpty} from "/js/verify.js"
import {loginButton, copyToClipboardButton, imgToBodyButton, startButton, goBackButton, toolboxButton, leftRight} from "/js/button.js"

function prepareDocument() {
  removeSelector(".overlay")
  removeSelector(".no-save")
}
export const addLoading = node => {
  const svgText = `<svg fill="#B03535" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 50a40 40 0 0 0 80 0 40 42 0 0 1-80 0"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"/></path></svg>`
  const loader = div("w100p", node)
  loader.innerHTML = svgText
  return loader
}
export const addTitle = text => {
  let title = document.querySelector("title")
  if (!title) {
    title = document.createElement("title")
    document.head.appendChild(title)
  }
  title.textContent = text
  return title
}
export const addOpenNav = node => {
  textToHr("open apps", node)
  const dataProtection = leftRight({left: ".data-protection", right: "Fördert Vertrauen in digitale Interaktionen"}, node)
  dataProtection.onclick = () => window.open("/datenschutz/", "_blank")
  loginButton(node)
  startButton(node)
  const userAgreement = leftRight({left: ".user-agreement", right: "Für Klarheit und Fairness im Umgang miteinander"}, node)
  userAgreement.onclick = () => window.open("/nutzervereinbarung/", "_blank")
}
export const goBack = () => {
  let lastPage = document.referrer
  if (window.history.length === 1) {
    window.close()
    return
  }
  if (textIsEmpty(document.referrer)) {
    window.history.back()
  }
  if (lastPage === window.location.href) {
    window.close()
    return
  }
  window.history.back()
  setTimeout(() => {
    window.close()
  }, 34)
}
export const onEnter = (input, callback) => {
  input.addEventListener("keydown", ev => {
    if (ev.key === 'Enter') {
      ev.preventDefault()
      callback(ev)
    }
  })
}
export const openImages = () => {
  pop(async o1 => {
    o1.addInfo(".images")
    const content = o1.content
    const searchField = text(content)
    searchField.input.placeholder = "Suche nach Alias"
    addValidSign(searchField.input)
    const {alle, meine} = renderTabs("Alle Meine", content)
    alle.addEventListener("click", getOpenImages)
    meine.addEventListener("click", getClosedImages)
    const addButton = add("+", o1)
    addButton.onclick = ev => {
      pop(async o2 => {
        o2.addInfo(`.upload`)
        const content = o2.content
        const funnel = div("", content)
        funnel.url = text(funnel)
        funnel.url.input.setAttribute("required", "true")
        funnel.url.input.setAttribute("accept", "text/url")
        funnel.url.input.placeholder = "https://www.meine-domain.de/mein/pfad.."
        addSubmitButton(funnel)
        funnel.file = file(funnel)
        funnel.file.input.setAttribute("accept", "image/*")
        addNotValidSign(funnel.file.input)
        funnel.file.input.oninput = ev => {
          lock(async lock => {
            let file = ev.target.files[0]
            await removeExif(file)
            const formdata = new FormData()
            formdata.append("file", file, file.name)
            addValidSign(funnel.file.input)
            const res = await postFormData("/upload/file/", formdata)
            if (res.status === 200) {
              funnel.url.input.value = res.response
            } 
            verifyInputValue(funnel.url.input)
            lock.remove()
          })
        }
        verifyInputs(funnel)
        funnel.submit.onclick = async () => {
          await verifyFunnel(funnel)
          const url = funnel.url.input.value
          lock(async lock => {
            const res = await post(`/jwt/register/image/`, {url})
            if (res.status === 200) {
              lock.alert.ok()
            } else {
              lock.alert.nok()
            }
            lock.remove()
          })
        }
      })
    }
    const imagesDiv = div("", content)
    getOpenImages()
    async function imageBox(it) {
      const box = div("hover color-theme w89 sans-serif p21 br5")
      let alias
      if (it.alias) {
        alias = await textToPurified(it.alias)
        if (it.query) {
          alias = await textToPurified(it.query)
          box.innerHTML = alias
        } else {
          box.textContent = alias
        }
      }
      srcToImg(it.url, box)
      textToHoverBottomRight(it.visibility, box)
      return box
    }
    async function getClosedImages() {
      prepareNode(imagesDiv)
      const loader = addLoading(imagesDiv)
      const res = await post("/jwt/get/user/images/")
      loader.remove()
      if (res.status === 200) {
        const it = JSON.parse(res.response)
        updateSearchField(it, imagesDiv)
        renderClosedImages(it, imagesDiv)
      } else {
        textToNote("Keine Daten gefunden", imagesDiv)
      }
    }
    function prepareNode(node) {
      resetNode(imagesDiv)
      imagesDiv.className = "flex wrap around"
    }
    async function getOpenImages() {
      prepareNode(imagesDiv)
      const loader = addLoading(imagesDiv)
      const res = await post(`/get/open/images/`)
      loader.remove()
      if (res.status === 200) {
        const it = JSON.parse(res.response)
        updateSearchField(it, imagesDiv)
        renderOpenImages(it, imagesDiv)
      } else {
        textToNote("Keine Daten gefunden", imagesDiv)
      }
    }
    async function renderClosedImages(array, node) {
      for (let i = 0; i < array.length; i++) {
        const it = array[i]
        const button = await imageBox(it)
        node.appendChild(button)
        button.onclick = () => {
          pop(o2 => {
            const content = o2.content
            if (it.alias) o2.addInfo(it.alias)
            const aliasBtn = leftRight({left: ".alias", right: "Alternativer Name"}, content)
            aliasBtn.onclick = () => {
              pop(o3 => {
                o3.addInfo(it.alias)
                const content = o3.content
                const funnel = aliasFunnel(content)
                if (it.alias) funnel.alias.input.value = it.alias
                verifyInputs(funnel)
                funnel.submit.onclick = async () => {
                  await verifyFunnel(funnel)
                  const alias = funnel.alias.input.value
                  const created = it.created
                  lock(async lock => {
                    const res = await post(`/jwt/update/images/alias/`, {created, alias})
                    if (res.status === 200) {
                      alertSaved()
                      meine.click()
                      o3.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    lock.remove()
                  })
                }
              })
            }
            imgToBodyButton(it.url, content)
            copyToClipboardButton(it.url, content)
            const removeBtn = leftRight({left: ".remove", right: "Daten entfernen"}, content)
            removeBtn.onclick = ev => {
              const confirm = window.confirm("Möchtest du deine Daten wirklich entfernen?")
              if (confirm === true) {
                lock(async lock => {
                  const res = await post(`/jwt/remove/user/image/`, {created: it.created})
                  if (res.status === 200) {
                    alertRemoved()
                    meine.click()
                    o2.remove()
                  } else {
                    alertNok()
                  }
                  lock.remove()
                })
              }
            }
            const visibilityBtn = leftRight({left: ".visibility", right: "Sichtbarkeit einstellen"}, content)
            visibilityBtn.onclick = () => {
              pop(o3 => {
                o3.addInfo(`${it.id}.${it.visibility}`)
                const content = o3.content
                const field = select(content)
                field.append(["closed", "open"])
                if (it.visibility) {
                  field.input.value = it.visibility
                }
                addValidSign(field.input)
                field.input.addEventListener("input", ev => {
                  const visibility = field.input.value
                  const created = it.created
                  lock(async lock => {
                    const res = await post(`/jwt/update/images/visibility/`, {created, visibility})
                    if (res.status === 200) {
                      alertSaved()
                      if (it.visibility === "closed") {
                        alle.click()
                      } else {
                        meine.click()
                      }
                      o3.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    lock.remove()
                  })
                })
                textToP("open - Sichtbar für alle", content)
                textToP("closed - Sichtbar nur für dich", content)
              })
            }
          })
        }
      }
    }
    async function renderOpenImages(array, node) {
      for (let i = 0; i < array.length; i++) {
        const it = array[i]
        const button = await imageBox(it)
        node.appendChild(button)
        button.onclick = () => {
          pop(o2 => {
            const content = o2.content
            if (it.alias) o2.addInfo(it.alias)
            imgToBodyButton(it.url, content)
            copyToClipboardButton(it.url, content)
          })
        }
      }
    }
    async function renderBasedOnTab(array, node) {
      node.textContent = ""
      if (alle.classList.contains("selected")) {
        await renderOpenImages(array, node)
      } 
      if (meine.classList.contains("selected")) {
        await renderClosedImages(array, node)
      }
    }
    function updateSearchField(array, node){
      let filtered
      searchField.input.oninput = async ev => {
        const query = ev.target.value
        const filter = "alias"
        if (!textIsEmpty(query)) {
          const highlighted = Helper.sort("query", {array, query, filter})
          await renderBasedOnTab(highlighted, node)
        } else {
          await renderBasedOnTab(array, node)
        }
      }
    }
  })
}
export const registerHtml = () => {
  lock(async lock => {
    prepareDocument()
    const html = document.documentElement.outerHTML.replace(/<html>/, "<!DOCTYPE html><html>")
    const successMessage = "Dokument erfolgreich gespeichert. +1 XP"
    // save html state
    const res = await post("/register/platform/value-html-location-expert/", {html})
    if (res.status === 200) {
      window.alert(successMessage)
      window.location.reload()
    } else {
      const res = await post("/register/platform/value-html-writable/", {html})
      if (res.status === 200) {
        lock.alert.ok(successMessage)
        window.location.reload()
      } else {
        lock.alert.nok()
        lock.remove()
      }
    }
  })
}
export const replaceInBody = node => {
  const exist = document.getElementById(node.id)
  if (exist) exist.remove()
  document.body.appendChild(node)
}
export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
