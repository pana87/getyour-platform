import {button, getyourButton, goBackButton} from "/js/button.js"
import {post} from "/js/request.js"
import {alertSaved, alertNok} from "/js/alert.js"
import {filterBy} from "/js/filter.js"
import {textImage, flexRow} from "/js/create.js"
import {renderTag} from "/js/render.js"
import {labelFor, div} from "/js/html-tags.js"
import {millisToSince, textToNote, scrollToNode, textToP, pathToId, textToAction, textToPurified, textToDiv, htmlToDiv, nodeToNote, tagToAllFirstUpper, textToLink, textToHr, textToH1, textToFirstUpper, nodeToScrollable, treeToKey} from "/js/convert.js"
import {addTitle, addLoading, addOpenNav, openImages} from "/js/events.js"
import {pop, lock} from "/js/overlay.js"
import {selectEmails, tag, selectExperts, select, textarea, text, alias} from "/js/input.js"
import {arrayIsEmpty, pathExist, onlyClosedUser, textIsEmpty, verifyInputs, verifyFunnel, verifyInputValue, addNotValidSign, addValidSign} from "/js/verify.js"
import {leftRight, startButton} from "/js/button.js"
import {roleFunnel, conditionFunnel, platformValueFunnel, aliasFunnel, descriptionFunnel, imageFunnel, platformFunnel, nameFunnel} from "/js/funnel.js"

goBackButton(document.body)
const domain = window.location.pathname.split("/")[1]
addTitle(textToFirstUpper(domain))
const app = getyourButton(document.body)
app.onclick = () => {
  pop(async o1 => {
    o1.addInfo(document.location.pathname)
    const content = o1.content
    const loader = addLoading(content)
    const isExpert = await post("/verify/user/location-expert/")
    loader.remove()
    if (isExpert.status === 200) {
      nodeToScrollable(content)
      {
        const tree = "getyour.expert.alias"
        const key = treeToKey(tree)
        const keyCapped = textToFirstUpper(key)
        const button = leftRight({left: `.alias`, right: `Dein alternative Name`}, content)
        button.onclick = () => {
          pop(async o2 => {
            const content = o2.content
            const funnel = aliasFunnel(content)
            post("/jwt/get/tree/", {tree}).then(res => {
              if (res.status === 200) {
                funnel.alias.input.value = res.response
                verifyInputValue(funnel.alias.input)
              }
            })
            funnel.submit.onclick = async () => {
              await verifyInputValue(funnel.alias.input)
              const alias = funnel.alias.input.value
              lock(async o3 => {
                const res = await post("/location-expert/register/tree/map/", {tree, map: {alias}})
                if (res.status === 200) {
                  window.alert("Daten erfolgreich gespeichert.")
                  o2.remove()
                } else {
                  window.alert("Fehler.. Bitte wiederholen.")
                }
                o3.remove()
              })
            }
          })
        }
      }
      {
        const tree = "getyour.expert.description"
        const button = leftRight({left: `.description`, right: "Eine kurze Beschreibung"}, content)
        button.onclick = () => {
          pop(async o2 => {
            const content = o2.content
            const funnel = descriptionFunnel(content)
            post("/jwt/get/tree/", {tree}).then(res => {
              if (res.status === 200) {
                funnel.description.input.value = res.response
              }
            })
            verifyFunnel(funnel)
            funnel.submit.onclick = async () => {
              await verifyInputValue(funnel.description.input)
              const description = funnel.description.input.value
              lock(async o3 => {
                const res = await post("/location-expert/register/tree/map/", {tree, map: {description}})
                if (res.status === 200) {
                  window.alert("Daten erfolgreich gespeichert.")
                  o2.remove()
                } else {
                  window.alert("Fehler.. Bitte wiederholen.")
                }
                o3.remove()
              })
            }
          })
        }
      }
      {
        const tree = "getyour.expert.name"
        const button = leftRight({left: `.domain`, right: "Deine persönliche Domain"}, content)
        button.onclick = () => {
          pop(o2 => {
            const content = o2.content
            const funnel = nameFunnel(content)
            funnel.name.input.value = window.location.pathname.split("/")[1]
            verifyInputValue(funnel.name.input)
            funnel.submit.onclick = async () => {
              await verifyInputValue(funnel.name.input)
              const name = funnel.name.input.value
              lock(async o3 => {
                const res = await post("/location-expert/register/name/", {name})
                if (res.status === 200) {
                  window.alert("Daten erfolgreich gespeichert.")
                  window.location.assign(`/${funnel.name.input.value}/`)
                } else {
                  window.alert("Fehler.. Bitte wiederholen.")
                }
                o3.remove()
              })
            }
          })
        }
      }
      {
        const tree = "getyour.expert.image"
        const button = leftRight({left: `.image`, right: "Lade ein Bild hoch"}, content)
        button.onclick = () => {
          pop(async o2 => {
            const content = o2.content
            const funnel = imageFunnel(content)
            post("/jwt/get/tree/", {tree}).then(res => {
              if (res.status === 200) {
                funnel.image.input.value = res.response
                verifyInputValue(funnel.image.input)
              }
            })
            funnel.submit.onclick = async () => {
              await verifyInputValue(funnel.image.input)
              const image = funnel.image.input.value
              lock(async o3 => {
                const res = await post("/location-expert/register/tree/map/", {tree, map: {image}})
                if (res.status === 200) {
                  o3.alert.saved()
                  o2.remove()
                } else {
                  o3.alert.nok()
                }
                o3.remove()
              })
            }
            const imagesBtn = leftRight({left: ".images", right: "Meine Bilder"}, content)
            imagesBtn.onclick = openImages
          })
        }
      }
      {
        const nameSubmit = leftRight({left: ".platforms", right: "Neue Plattform"}, content)
        nameSubmit.onclick = () => {
          pop(async o2 => {
            const content = o2.content
            textToHr("Neue Plattform", content)
            const funnel = platformFunnel(content)
            funnel.submit.onclick = async () => {
              await verifyInputValue(funnel.platform.input)
              const platform = funnel.platform.input.value
              await verifyPlatformExist(funnel.platform.input)
              await verifyPlatformName(funnel.platform.input)
              lock(async o3 => {
                const res = await post("/location-expert/register/platform/", {platform})
                if (res.status === 200) {
                  window.alert("Plattform erfolgreich gespeichert. +3 XP")
                  window.location.reload()
                } else {
                  o3.alert.nok()
                  o3.remove()
                }
              })
            }
            textToHr("Plattform JSON Objekt importieren", content)
            const json = textarea(content)
            json.input.placeholder = "Plattform: {\n  image, (optional)\n  match-maker, (optional)\n  name, (notwendig)\n  roles, (optional)\n  start, (optional)\n  values, (optional)\n  visibility, (optional)\n}"
            json.input.className += " h89 fs8"
            json.input.oninput = ev => {
              try {
                JSON.parse(ev.target.value)
                addValidSign(ev.target)
              } catch (e) {
                console.error(e)
                addNotValidSign(ev.target)
              }
            }
            addNotValidSign(json.input)
            const jsonSubmit = textToAction("Daten jetzt speichern", content)
            jsonSubmit.onclick = async () => {
              try {
                const jsonInput = JSON.parse(json.input.value)
                const allowedKeys = ["created", "image", "match-maker", "name", "roles", "start", "values", "visibility"]
                const platform = Object.keys(jsonInput)
                .filter(key => allowedKeys.includes(key))
                .reduce((obj, key) => {
                  obj[key] = jsonInput[key]
                  return obj
                }, {})
                if (!platform.name) throw new Error("platform.name required")
                const res = await post("/location-expert/verify/platform/exist/", {platform: platform.name})
                if (res.status === 200) throw new Error("platform exist")
                addValidSign(json.input)
                lock(async o3 => {
                  const res = await post("/location-expert/register/json-platform/", {platform})
                  if (res.status === 200) {
                    window.alert("Plattform erfolgreich gespeichert. +3 XP")
                    window.location.reload()
                  } else {
                    o3.alert.nok()
                    o3.remove()
                  }
                })
              } catch (e) {
                console.error(e)
                addNotValidSign(json.input)
              }
            }
          })
        }
      }
      startButton(content)
      const writeAccessRequestBtn = leftRight({left: ".write-access-request", right: "Fordere Schreibrechte an"}, content)
      writeAccessRequestBtn.onclick = () => {
        pop(o2 => {
          onlyClosedUser(o2)
          o2.addInfo(".write-access-request")
          const content = o2.content
          textToH1(`Wähle einen Experten`, content)
          const expertSelect = select(content)
          addNotValidSign(expertSelect.input)
          expertSelect.input.oninput = ev => {
            const id = ev.target.value
            if (!textIsEmpty(id)) addPaths(id)
          }
          textToH1(`Wähle die Pfade`, content)
          const pathsSelect = select(content)
          addNotValidSign(pathsSelect.input)
          pathsSelect.input.multiple = true
          pathsSelect.input.oninput = () => {
            if (pathsSelect.selectedValues().length > 0) addValidSign(pathsSelect.input)
            else addNotValidSign(pathsSelect.input)
          }
          function addPaths(id) {
            post("/location-expert/get/expert/paths/", {id}).then(res => {
              if (res.status === 200) {
                const paths = JSON.parse(res.response)
                pathsSelect.input.textContent = ""
                pathsSelect.append(paths)
                addValidSign(expertSelect.input)
              } else {
                pathsSelect.input.textContent = ""
                addNotValidSign(pathsSelect.input)
                window.alert("Dieser Experte hat noch keine Pfade erstellt.")
              }
            })
          }
          post("/jwt/get/experts/").then(res => {
            if (res.status === 200) {
              const experts = JSON.parse(res.response)
              expertSelect.input.textContent = ""
              expertSelect.addOption("-- Wähle einen Experten", "undefined")
              for (let i = 0; i < experts.length; i++) {
                const expert = experts[i]
                const option = document.createElement("option")
                option.value = expert.id
                option.text = expert.email
                expertSelect.input.appendChild(option)
              }
            }
          })
          const submit = div("action", content)
          submit.textContent = "Schreibrechte jetzt anfordern"
          submit.onclick = () => {
            const id = expertSelect.selectedValues()[0]
            if (textIsEmpty(id)) {
              addNotValidSign(expertSelect.input)
              return
            }
            const paths = pathsSelect.selectedValues()
            if (paths.length <= 0) {
              addNotValidSign(pathsSelect.input)
              return
            }
            lock(async lock => {
              const res = await post("/location-expert/register/write-access-request/", {id, paths})
              if (res.status === 200) {
                lock.alert.saved()
              } else {
                lock.alert.nok()
              }
              lock.remove()
            })
          }
        })
      }
      const writableValues = leftRight({left: `.writable-values`, right: "Werteinheiten mit Schreibrechte"}, content)
      writableValues.onclick = async () => await openWritableValuesOverlay()
      return
    } else {
      const isWritable = await post("/location-writable/get/platform/values/")
      if (isWritable.status === 200) {
        const values = JSON.parse(isWritable.response)
        renderWritableValues(values, content)
      } else {
        addOpenNav(content)
      }
    }
  })
}
const title = textToH1("Plattformen", document.body)
const buttons = div("pb144", document.body)
addLoading(buttons)
const res = await post("/verify/user/closed/")
if (res.status === 200) {
  const res = await post("/verify/user/location-expert/")
  if (res.status === 200) {
    await renderLocationExpertPlatforms()
  } else {
    openWritableValuesOverlay()
    await renderPlatforms(buttons)
  }
} else {
  await renderPlatforms(buttons)
}
function addImage(src, node) {
  node.image = document.createElement("img")
  node.image.className += " w100p obj-cover max-vh13"
  node.image.src = src
  node.image.onerror = () => node.image.remove()
  node.appendChild(node.image)
}
function createValueImageButton(value, node) {
  const btn = createTagButton(value.alias, node)
  if (value.image) addImage(value.image, btn.image)
  return btn
}
function createTagButton(tag, node) {
  const btn = textImage()
  btn.text.textContent = tagToAllFirstUpper(tag)
  node?.appendChild(btn)
  return btn
}
function createPlatformImageButton(platform, node) {
  const btn = createTagButton(platform.name, node)
  if (platform.image) addImage(platform.image, btn.image)
  return btn
}
function noDataFound() {
  nodeToNote(buttons)
  buttons.textContent = "Keine Plattformen gefunden"
  throw new Error("404 Not Found")
}
function openWritableValuesOverlay() {
  pop(async o1 => {
    const content = o1.content
    const loader = addLoading(content)
    const res = await post("/location-writable/get/platform/values/")
    loader.remove()
    if (res.status === 200) {
      const values = JSON.parse(res.response)
      renderWritableValues(values, content)
    } else {
      o1.remove()
    }
  })
}
function renderHtmlValuesWritable(values, node) {
  node.textContent = ""
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const button = leftRight(node)
    if (!textIsEmpty(value.query)) {
      htmlToDiv(value.query, button.left)
    } else {
      textToDiv(value.alias, button.left)
    }
    const pathDiv = textToDiv(value.path, button.left)
    pathDiv.classList.add("fs13")
    button.onclick = () => window.open(value.path, "_blank")
    button.right.textContent = "Pfad kopieren"
    button.right.className += " hover p13 br13 border-theme"
    button.right.classList.add("hover")
    button.right.onclick = ev => {
      ev.stopPropagation()
      navigator.clipboard.writeText(value.path)
      .then(() => window.alert(`Der Pfad '${value.path}' wurde erfolgreich in deinen Zwischenspeicher kopiert.`))
      .catch(() => window.alert("Fehler.. Bitte wiederholen."))
    }
  }
}
async function renderPlatformValues(platform, node) {
  node.textContent = ""
  const loading = addLoading(node)
  const res = await post("/get/platform/values/", {platform})
  loading.remove()
  if (res.status === 200) {
    const values = JSON.parse(res.response)
    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      const button = createValueImageButton(value, node)
      button.onclick = () => window.open(value.path, "_blank")
    }
  }
  return res
}
async function renderPlatforms(node) {
  node.textContent = ""
  const loading = addLoading(node)
  const res = await post("/get/platforms/")
  loading.remove()
  if (res.status === 200) {
    const platforms = JSON.parse(res.response)
    node.textContent = ""
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i]
    console.log(platform)
      const button = createPlatformImageButton(platform, node)
      button.onclick = () => {
        pop(async o1 => {
          o1.addInfo(platform.name)
          const content = o1.content
          const res = await renderPlatformValues(platform.name, content)
          if (res.status !== 200) {
            window.alert("Keine Werteinheiten gefunden.")
            o1.remove()
          }
        })
      }
    }
  } else {
    noDataFound()
  }
}
async function renderLocationExpertMatchMakerConditions(created, node) {
  node.textContent = ""
  const res = await post("/location-expert/get/match-maker/conditions/", {created})
  if (res.status === 200) {
    const conditions = JSON.parse(res.response)
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i]
      function conditionToString() {
        return `${condition.left} ${condition.operator} ${condition.right}`
      }
      const conditionButton = leftRight({left: i + 1, right: conditionToString()}, node)
      conditionButton.onclick = () => {
        pop(o1 => {
          o1.addInfo(conditionToString())
          const content = o1.content
          const funnel = conditionFunnel(content)
          funnel.left.input.value = condition.left
          funnel.operator.input.value = condition.operator
          funnel.right.input.value = condition.right
          verifyFunnel(funnel)
          funnel.submit.onclick = async () => {
            await verifyFunnel(funnel)
            const left = funnel.left.input.value
            const operator = funnel.operator.input.value
            const right = funnel.right.input.value
            lock(async o2 => {
              const res = await post("/location-expert/update/match-maker/condition/", {created: condition.created, left, operator, right})
              if (res.status === 200) {
                o2.alert.saved()
                await renderLocationExpertMatchMakerConditions(created, node)
                o1.remove()
              } else {
                o2.alert.nok()
              }
              o2.remove()
            })
          }
          const remove = leftRight({left: ".remove", right: "Bedingung entfernen"}, content)
          remove.onclick = () => {
            lock(async o2 => {
              const res = await post("/location-expert/remove/match-maker/condition/", {created: condition.created})
              if (res.status === 200) {
                o2.alert.removed()
                await renderLocationExpertMatchMakerConditions(created, node)
                o1.remove()
              } else {
                o2.alert.nok()
              }
              o2.remove()
            })
          }
        })
      }
    }
  } else {
    textToNote("Keine Bedingungen gefunden", node)
  }
}
async function renderLocationExpertPlatformMatchMaker(it, node) {
  node.textContent = ""
  const loading = addLoading(node)
  const platform = it.name
  const res = await post("/location-expert/get/platform/match-maker/", {platform})
  loading.remove()
  if (res.status === 200) {
    const array = JSON.parse(res.response)
    for (let i = 0; i < array.length; i++) {
      const matchMaker = array[i]
      const matchMakerButton = leftRight({left: matchMaker.name, right: `vor ${millisToSince(matchMaker.created)}`}, node)
      matchMakerButton.onclick = () => {
        pop(o1 => {
          o1.addInfo(matchMaker.name)
          const content = o1.content
          const conditions = leftRight({left: ".conditions", right: "Bedingungen hinzufügen"}, content)
          conditions.onclick = () => {
            pop(async o2 => {
              o2.addInfo(matchMaker.name)
              const content = o2.content
              const create = leftRight({left: ".create", right: "Neue Bedingung definieren"}, content)
              create.onclick = () => {
                pop(async o3 => {
                  o3.addInfo(matchMaker.name)
                  const content = o3.content
                  const funnel = conditionFunnel(content)
                  verifyInputs(funnel)
                  funnel.submit.onclick = async () => {
                    await verifyFunnel(funnel)
                    const created = matchMaker.created
                    const left = funnel.left.input.value
                    const operator = funnel.operator.input.value
                    const right = funnel.right.input.value
                    lock(async o4 => {
                      const res = await post("/location-expert/register/match-maker/condition/", {created, left, operator, right})
                      if (res.status === 200) {
                        alertSaved()
                        await renderLocationExpertMatchMakerConditions(matchMaker.created, conditionsContainer)
                        o3.remove()
                      } else {
                        alertNok()
                      }
                      o4.remove()
                    })
                  }
                })
              }
              textToHr("Meine Bedingungen", content)
              const conditionsContainer = div("", content)
              await renderLocationExpertMatchMakerConditions(matchMaker.created, conditionsContainer)
            })
          }
          const remove = leftRight({left: ".remove", right: "Match Maker entfernen"}, content)
          remove.onclick = () => {
            lock(async o2 => {
              const res = await post("/location-expert/remove/match-maker/", {created: matchMaker.created})
              if (res.status === 200) {
                o2.alert.ok("Daten erfolgreich entfernt.")
                matchMakerButton.remove()
                o1.remove()
              } else {
                o2.alert.nok()
              }
              o2.remove()
            })
          }
        })
      }
    }
  } else {
    textToNote("Keine Match Maker gefunden", node)
  }
}
async function renderLocationExpertPlatformRoles(platform, node) {
  node.textContent = ""
  const loading = addLoading(node)
  const res = await post("/location-expert/get/platform/roles/", {platform})
  loading.remove()
  if (res.status === 200) {
    const roles = JSON.parse(res.response)
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i]
      const button = leftRight({left: role.name, right: `vor ${millisToSince(role.created)}`}, node)
      button.onclick = () => {
        pop(async o1 => {
          o1.addInfo(role.name)
          const content = o1.content
          const funnel = roleFunnel(content)
          funnel.name.input.value = role.name
          verifyInputValue(funnel.name.input)
          const res = await post("/location-expert/get/platform/value/paths/", {platform})
          if (res.status === 200) {
            const paths = JSON.parse(res.response)
            funnel.home.append(paths)
            funnel.home.select([role.home])
            verifyInputValue(funnel.home.input)
          } else {
            window.alert("Es wurden keine Werteinheiten definiert")
            addNotValidSign(funnel.home.input)
          }
          funnel.submit.onclick = async () => {
            await verifyFunnel(funnel)
            const name = funnel.name.input.value
            const home = funnel.home.input.value
            lock(async o2 => {
              const res = await post("/location-expert/update/platform/role/", {created: role.created, platform, name, home})
              if (res.status === 200) {
                o2.alert.saved()
                await renderLocationExpertPlatformRoles(platform, node)
                o1.remove()
              } else {
                o2.alert.nok()
              }
              o2.remove()
            })
          }
          const remove = leftRight({left: ".remove", right: "Entferne deine Rolle"}, content)
          remove.onclick = () => {
            lock(async o2 => {
              const res = await post("/location-expert/remove/platform/role/", {platform, created: role.created})
              if (res.status === 200) {
                o2.alert.removed()
                await renderLocationExpertPlatformRoles(platform, node)
                o1.remove()
              } else {
                o2.alert.nok()
              }
              o2.remove()
            })
          }
        })
      }
    }
  } else {
    textToNote("Keine Rollen gefunden", node)
  }
}
async function renderLocationExpertPlatforms() {
  buttons.textContent = ""
  const loading = addLoading(buttons)
  const res = await post("/location-expert/get/platforms/")
  loading.remove()
  if (res.status === 200) {
    const platforms = JSON.parse(res.response)
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i]
      const button = createPlatformImageButton(platform, buttons)
      button.onclick = () => {
        pop(async o1 => {
          o1.addInfo(platform.name)
          const buttons = o1.content
          const bulkValues = leftRight({left: ".bulk-values", right: "Massen Funktionen für ausgewählte Werteinheiten"}, buttons)
          bulkValues.onclick = () => {
            pop(async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const loader = addLoading(content)
              const res = await post("/location-expert/get/platform/paths/", {platform: platform.name})
              loader.remove()
              if (res.status === 200) {
                const paths = JSON.parse(res.response)
                nodeToScrollable(content)
                content.style.marginTop = "21px"
                textToHr("Wähle deine Pfade", content)
                const flexDiv = div("flex wrap mtb21 mlr34", content)
                const all = textToLink("Alle", flexDiv)
                all.onclick = ev => {
                  pathSelect.selectAll()
                  addValidSign(pathSelect.input)
                }
                const none = textToLink("Keinen", flexDiv)
                none.onclick = ev => {
                  pathSelect.selectNone()
                  addNotValidSign(pathSelect.input)
                }
                const pathSelect = select(content)
                pathSelect.input.multiple = true
                pathSelect.input.required = true
                verifyInputValue(pathSelect.input)
                pathSelect.input.oninput = () => verifyInputValue(pathSelect.input)
                let height = 0
                pathSelect.input.textContent = ""
                for (let i = 0; i < paths.length; i++) {
                  const option = document.createElement("option")
                  height += 34
                  option.value = paths[i]
                  option.text = paths[i]
                  pathSelect.input.appendChild(option)
                }
                pathSelect.input.style.height = `${height}px`
                textToHr("Verfügbare Skripte", content)
                const buttons = flexRow(content)
                async function updateScript(id) {
                  await verifyInputValue(pathSelect.input)
                  const paths = Array.from(pathSelect.input.selectedOptions).map(it => it.value)
                  lock(async o3 => {
                    const res = await post(`/location-expert/update/paths/${id}/`, {paths})
                    if (res.status === 200) {
                      o3.alert.ok()
                    } else {
                      o3.alert.nok()
                    }
                    o3.remove()
                  })
                }
                function scriptUpdateButton(id) {
                  const button = textToLink(`${tagToAllFirstUpper(id)} anhängen`, buttons)
                  button.onclick = async () => await updateScript(id)
                }
                post("/expert/get/js/paths/").then(res => {
                  try {
                    const paths = JSON.parse(res.response)
                    paths.forEach(path => {
                      const id = pathToId(path)
                      if (textIsEmpty(id)) return
                      scriptUpdateButton(id)
                    })
                  } catch (error) {
                    buttons.textContent = "Keine Skripte gefunden"
                  }
                })
                {
                  async function requestPaths(path) {
                    await verifyInputValue(pathSelect.input)
                    const paths = Array.from(pathSelect.input.selectedOptions).map(it => it.value)
                    lock(async o3 => {
                      const res = await post(path, {paths})
                      if (res.status === 200) {
                        window.alert("Funktion erfolgreich abgeschlossen")
                      } else {
                        o3.alert.nok()
                      }
                      o3.remove()
                    })
                  }
                  textToHr("Weitere Funktionen", content)
                  const more = flexRow(content)
                  const addMetaTags = textToLink("Meta Tags hinzufügen", more)
                  addMetaTags.onclick = async () => await requestPaths("/location-expert/tag/paths/meta-tags/")
                  const removeScripts = textToLink("Alle Skripte entfernen", more)
                  removeScripts.onclick = async () => {
                    await verifyInputValue(pathSelect.input)
                    const paths = Array.from(pathSelect.input.selectedOptions).map(it => it.value)
                    lock(async o3 => {
                      const res = await post("/location-expert/remove/paths/scripts/", {paths})
                      if (res.status === 200) {
                        o3.alert.ok()
                      } else {
                        o3.alert.nok()
                      }
                      o3.remove()
                    })
                  }
                  const visibilityOpen = textToLink("Sichtbarkeit öffnen", more)
                  visibilityOpen.onclick = async () => await requestPaths("/location-expert/tag/paths/visibility-open/")
                  const visibilityClosed = textToLink("Sichtbarkeit schließen", more)
                  visibilityClosed.onclick = async () => await requestPaths("/location-expert/tag/paths/visibility-closed/")
                  const automatedTrue = textToLink("Automatisierter Inhalt aktivieren", more)
                  automatedTrue.onclick = async () => await requestPaths("/location-expert/tag/paths/automated-true/")
                  const automatedFalse = textToLink("Automatisierter Inhalt ausschalten", more)
                  automatedFalse.onclick = async () => await requestPaths("/location-expert/tag/paths/automated-false/")
                  const removeValue = textToLink("Werteinheiten entfernen", more)
                  removeValue.onclick = async () => {
                    const confirm = window.confirm("Möchtest du die ausgewählten Werteinheiten wirklich entfernen?")
                    if (confirm) await requestPaths("/location-expert/remove/paths/")
                  }
                  const resetRequested = textToLink("Seitenbesuche zurücksetzen", more)
                  resetRequested.onclick = async () => await requestPaths("/location-expert/tag/paths/reset-requested/")
                  const emptyWritability = textToLink("Alle Schreibrechte entziehen", more)
                  emptyWritability.onclick = async () => await requestPaths("/location-expert/tag/paths/empty-writability/")
                  const shareValue = textToLink("An Experten senden", more)
                  shareValue.onclick = async () => {
                    await verifyInputValue(pathSelect.input)
                    const paths = Array.from(pathSelect.input.selectedOptions).map(it => it.value)
                    pop(o2 => {
                      onlyClosedUser(o2)
                      o2.addInfo(platform.name)
                      const content = o2.content
                      textToH1(`An welchen Experten möchtest du deine Werteinheiten senden?`, content)
                      const expert = selectExperts(content)
                      addValidSign(expert.input)
                      textToP(`Es werden ${paths.length} Werteinheiten gesendet.`, content)
                      const submit = textToAction("Werteinheiten jetzt senden", content)
                      submit.onclick = () => {
                        const id = expert.selectedValues()[0]
                        if (textIsEmpty(id)) {
                          addNotValidSign(expert.input)
                          return
                        }
                        lock(async lock => {
                          const res = await post("/location-expert/send/value/paths/", {paths, id, platform: platform.name})
                          if (res.status === 200) {
                            lock.alert.saved()
                          } else {
                            lock.alert.nok()
                          }
                          lock.remove()
                        })
                      }
                    })
                  }
                }
              } else {
                o2.alert.nok()
                o2.remove()
              }
            })
          }
          const createValue = leftRight({left: ".create-value", right: "Neue Werteinheit erstellen"}, buttons)
          createValue.onclick = () => {
            pop(o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const funnel = platformValueFunnel(content)
              funnel.alias.input.addEventListener("input", () => {
                funnel.alias.input.value = funnel.alias.input.value.replaceAll("-", " ")
              })
              funnel.submit.onclick = async () => {
                await verifyFunnel(funnel)
                const path = funnel.path.input.value
                const fullPath = `/${window.location.pathname.split("/")[1]}/${platform.name}/${path}/`
                await pathExist(fullPath, funnel.path)
                const alias = funnel.alias.input.value
                lock(async o3 => {
                  const res = await post("/location-expert/register/platform/value/", {path, alias, platform: platform.name})
                  if (res.status === 200) {
                    window.alert("Werteinheit erfolgreich gespeichert. +1 XP")
                    o2.remove()
                  } else {
                    o3.alert.nok()
                  }
                  o3.remove()
                })
              }
            })
          }
          const exportBtn = leftRight({left: ".export", right: "Exportiere deine Plattform"}, buttons)
          exportBtn.onclick = () => {
            pop(async o2 => {
              o2.addInfo(`.export.${platform.name}`)
              const content = o2.content
              const loader = addLoading(content)
              const platformRes = await post("/location-expert/get/platform/", {platform: platform.name})
              loader.remove()
              if (platformRes.status === 200) {
                const platform = JSON.parse(platformRes.response)
                const staticBtn = leftRight({left: ".static", right: "Exportiere deine statische Plattform"}, content)
                staticBtn.onclick = () => {
                  pop(async o3 => {
                    onlyClosedUser(o3)
                    const content = o3.content
                    const loader = addLoading(content)
                    const scriptsRes = await post("/location-expert/get/js/scripts/")
                    loader.remove()
                    if (scriptsRes.status === 200) {
                      const scripts = JSON.parse(scriptsRes.response)
                      const values = Object.values(platform.values)
                      const paths = values.flatMap(value => value.path || [])
                      try {
                        textToH1("Wähle deine Startseite: (index.html)", content)
                        const indexSelect = select(content)
                        indexSelect.append(paths)
                        if (platform.start) indexSelect.input.select([platform.start])
                        addValidSign(indexSelect.input)
                        textToH1("Wähle deine Pfade:", content)
                        const pathsSelect = select(content)
                        pathsSelect.append(paths)
                        pathsSelect.input.multiple = true
                        pathsSelect.selectNone()
                        addNotValidSign(pathsSelect.input)
                        pathsSelect.input.oninput = () => {
                          const paths = pathsSelect.selectedValues()
                          if (paths.length === 0) addNotValidSign(pathsSelect.input)
                          else addValidSign(pathsSelect.input)
                        }
                        textToH1("Wähle deine Skripte: (/js)", content)
                        const scriptsSelect = select(content)
                        scriptsSelect.append(scripts.flatMap(script => script.name || []))
                        scriptsSelect.input.multiple = true
                        scriptsSelect.selectNone()
                        addNotValidSign(scriptsSelect.input)
                        scriptsSelect.input.oninput = () => {
                          const paths = scriptsSelect.selectedValues()
                          if (paths.length === 0) addNotValidSign(scriptsSelect.input)
                          else addValidSign(scriptsSelect.input)
                        }
                        const submit = textToAction("Verzeichnis herunterladen", content)
                        submit.onclick = async () => {
                          const indexPath = indexSelect.input.value
                          const paths = pathsSelect.selectedValues()
                          if (arrayIsEmpty(paths)) {
                            addNotValidSign(pathsSelect.input)
                            scrollToNode(pathsSelect.input)
                            return
                          }
                          const scriptNames = scriptsSelect.selectedValues()
                          if (arrayIsEmpty(scriptNames)) {
                            addNotValidSign(scriptsSelect.input)
                            scrollToNode(scriptsSelect.input)
                            return
                          }
                          function downloadFile(file) {
                            const blob = new Blob([file.content], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = file.name 
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          }
                          const directoryContent = []
                          const indexFile = {name: "index.html", content: values.find(value => value.path === indexPath).html}
                          directoryContent.push(indexFile)
                          scriptNames.forEach(name => {
                            const content = scripts.find(script => script.name === name)
                            if (!content) return
                            const scriptFile = {name, content: scripts.find(script => script.name === name).content}
                            directoryContent.push(scriptFile)
                          })
                          paths.forEach(path => {
                            const pathFile = {name: path.split("/")[3] + ".html", content: values.find(value => value.path === path).html}
                            directoryContent.push(pathFile)
                          })
                          console.log(directoryContent)
                        }
                      } catch (e) {
                        console.log(e)
                        o3.alert.nok()
                        o3.remove()
                      }
                    } else {
                      o3.alert.nok()
                      o3.remove()
                    }
                  })
                }
                const copyBtn = leftRight({left: ".copy", right: "Kopiere deine Plattform in die Zwischenablage"}, content)
                copyBtn.onclick = () => {
                  navigator.clipboard.writeText(JSON.stringify(platform, null, 2)).then(o2.alert.saved).catch(o2.alert.nok)
                }
              } else {
                o2.alert.nok()
                o2.remove()
              }
            })
          }
          const htmlValues = leftRight({left: ".html-values", right: "Meine HTML Werteinheiten"}, buttons)
          htmlValues.onclick = () => {
            pop(async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const valuesDiv = div("sans-serif mtb21 pb144", content)
              const res = await renderLocationExpertPlatformValues(platform.name, valuesDiv)
              if (res.status !== 200) {
                window.alert("Keine Werteinheiten gefunden. Erstelle eine neue Werteinheit.")
                o2.remove()
              }
            })
          }
          const image = leftRight({left: ".image", right: "Ein Plattform Bild"}, buttons)
          image.onclick = () => {
            pop(async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const funnel = imageFunnel(content)
              if (platform.image) {
                funnel.image.input.value = platform.image
                verifyInputValue(funnel.image.input)
              }
              funnel.submit.onclick = async () => {
                await verifyFunnel(funnel)
                const image = funnel.image.input.value
                lock(async o3 => {
                  const res = await post("/location-expert/register/platform/image/", {platform: platform.name, image})
                  if (res.status === 200) {
                    o3.alert.ok()
                    window.location.reload()
                  } else {
                    o3.alert.nok()
                  }
                  o3.remove()
                })
              }
            })
          }
          const matchMaker = leftRight({left: ".match-maker", right: "Match Maker definieren"}, buttons)
          matchMaker.onclick = () => {
            pop(async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const create = leftRight({left: ".create", right: "Neuen Match Maker definieren"}, content)
              create.onclick = () => {
                pop(async o3 => {
                  o3.addInfo(platform.name)
                  const content = o3.content
                  const nameField = tag(content)
                  nameField.input.placeholder = "Match Maker (text/tag)"
                  const submit = div("action", content)
                  submit.textContent = "Daten jetzt speichern"
                  verifyInputs(content)
                  submit.onclick = async () => {
                    await verifyInputValue(nameField.input)
                    const name = nameField.input.value
                    lock(async o4 => {
                      const res1 = await post("/location-expert/verify/match-maker/name/", {name})
                      if (res1.status === 200) {
                        window.alert("Name existiert bereits.")
                        addNotValidSign(nameField.input)
                        o4.remove()
                        throw new Error("name exist")
                      }
                      const res2 = await post("/location-expert/register/platform/match-maker/", {platform: platform.name, name})
                      if (res2.status === 200) {
                        alertSaved()
                        await renderLocationExpertPlatformMatchMaker(platform, matchMakerContainer)
                        o3.remove()
                      } else {
                        alertNok()
                      }
                      o4.remove()
                    })
                  }
                })
              }
              textToHr("Meine Match Maker", content)
              const matchMakerContainer = div("", content)
              await renderLocationExpertPlatformMatchMaker(platform, matchMakerContainer)
            })
          }
          const name = leftRight({left: ".name", right: "Der Name für deine Plattform"}, buttons)
          name.onclick = () => {
            pop(async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const platformNameField = tag(content)
              platformNameField.input.value = platform.name
              platformNameField.input.placeholder = "Plattform (text/tag)"
              verifyInputValue(platformNameField.input)
              const button = div("action", content)
              button.textContent = "Daten jetzt speichern"
              button.onclick = async () => {
                await verifyInputValue(platformNameField.input)
                const platformName = platformNameField.input.value
                await verifyPlatformExist(platformNameField.input)
                await verifyPlatformName(platformNameField.input)
                lock(async o3 => {
                  const res = await post("/location-expert/register/platform/name/", {old: platform.name, new: platformName})
                  if (res.status === 200) {
                    o3.alert.saved()
                    window.location.reload()
                  } else {
                    o3.alert.nok()
                  }
                  o3.remove()
                })
              }
            })
          }
          const roles = leftRight({left: ".roles", right: "Rollen definieren"}, buttons)
          roles.onclick = () => {
            pop(async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const create = leftRight({left: ".create", right: "Neue Rolle definieren"}, content)
              create.onclick = () => {
                pop(async o3 => {
                  o3.addInfo(platform.name)
                  const content = o3.content
                  const funnel = roleFunnel(content)
                  post("/location-expert/get/platform/value/paths/", {platform: platform.name}).then(res => {
                    if (res.status === 200) {
                      const paths = JSON.parse(res.response)
                      funnel.home.append(paths)
                      verifyInputValue(funnel.home.input)
                    } else {
                      window.alert("Es wurden keine Werteinheiten gefunden. Du musst eine Startseite für deine Rolle definieren und brauchst dafür mindestens eine Werteinheit.")
                      o3.remove()
                    }
                  })
                  funnel.submit.onclick = async () => {
                    await verifyFunnel(funnel)
                    const name = funnel.name.input.value
                    const home = funnel.home.input.value
                    lock(async o4 => {
                      await verifyPlatformRoleNameExist(platform.name, funnel.name.input)
                      const res = await post("/location-expert/register/platform/role/", {platform: platform.name, name, home})
                      if (res.status === 200) {
                        o4.alert.ok()
                        await renderLocationExpertPlatformRoles(platform.name, roleList)
                        o3.remove()
                      } else {
                        o4.alert.nok()
                      }
                      o4.remove()
                    })
                  }
                })
              }
              textToHr("Meine Rollen", content)
              const roleList = div("", content)
              await renderLocationExpertPlatformRoles(platform.name, roleList)
            })
          }
          const sharePlatformBtn = leftRight({left: ".share", right: "Gebe deine Plattform weiter"}, buttons)
          sharePlatformBtn.onclick = () => {
            pop(o2 => {
              onlyClosedUser(o2)
              o2.addInfo(platform.name)
              const content = o2.content
              textToH1(`An welchen Experten möchtest du deine Plattform '${platform.name}' senden?`, content)
              const expert = selectExperts(content)
              console.log(platform)
              textToP(`Es werden ${platform.values} Werteinheiten gesendet.`, content)
              const submit = div("action", content)
              submit.textContent = "Plattform jetzt senden"
              submit.onclick = () => {
                const id = expert.selectedValues()[0]
                if (textIsEmpty(id)) {
                  addNotValidSign(expert.input)
                  return
                }
                lock(async lock => {
                  const res = await post("/location-expert/send/platform/", {created: platform.created, id})
                  if (res.status === 200) {
                    lock.alert.saved()
                  } else {
                    lock.alert.nok()
                  }
                  lock.remove()
                })
              }
            })
          }
          const startPath = leftRight({left: ".start-path", right: "Definiere einen Startpunkt für deine Plattform"}, buttons)
          startPath.onclick = () => {
            pop(async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const startField = select(content)
              startField.input.id = "start"
              const startLabel = labelFor("start", "Wähle einen Start Pfad für deine Plattform")
              startField.prepend(startLabel)
              const res = await post("/location-expert/get/platform/value/paths/", {platform: platform.name})
              if (res.status === 200) {
                const paths = JSON.parse(res.response)
                startField.append(paths)
              } else {
                window.alert("Es wurden keine Werteinheiten gefunden.")
                o2.remove()
                return
              }
              if (platform.start) {
                for (let i = 0; i < startField.input.options.length; i++) {
                  const option = startField.input.options[i]
                  if (option.value === platform.start) option.selected = true
                }
              }
              verifyFunnel(content)
              const submit = div("action", content)
              submit.textContent = "Pfad jetzt speichern"
              submit.onclick = async () => {
                const start = startField.input.value
                if (textIsEmpty(start)) {
                  addNotValidSign(startField.input)
                  return
                }
                lock(async o3 => {
                  const res = await post("/location-expert/register/platform/start/", {platform: platform.name, start})
                  if (res.status === 200) {
                    o3.alert.saved()
                    window.location.reload()
                  } else {
                    o3.alert.nok()
                  }
                  o3.remove()
                })
              }
            })
          }
          const remove = leftRight({left: ".remove", right: "Plattform entfernen"}, buttons)
          remove.onclick = () => {
            const confirm = window.confirm("Möchtest du deine Plattform wirklich entfernen? Alle enthaltenen Werteinheiten werden ebenfalls gelöscht.")
            if (confirm === true) {
              lock(async o2 => {
                const res = await post("/location-expert/remove/platform/", {created: platform.created, platform: platform.name})
                if (res.status === 200) {
                  o2.alert.removed()
                  window.location.reload()
                } else {
                  o2.alert.nok()
                }
                o2.remove()
              })
            }
          }
          const visibility = leftRight({left: ".visibility", right: "Sichtbarkeit der Plattform"}, buttons)
          visibility.onclick = () => {
            pop(async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const visibilityField = select(content)
              if (platform.visibility === "open") {
                visibilityField.append(["open", "closed"])
              }
              if (platform.visibility === "closed") {
                visibilityField.append(["closed", "open"])
              }
              verifyInputValue(visibilityField.input)
              const submit = div("action", content)
              submit.textContent = "Sichtbarkeit jetzt speichern"
              submit.onclick = async () => {
                const visibility = visibilityField.input.value
                lock(async o3 => {
                  const res = await post("/location-expert/register/platform/visibility/", {platform: platform.name, visibility})
                  if (res.status === 200) {
                    o3.alert.saved()
                    window.location.reload()
                  } else {
                    o3.alert.nok()
                  }
                  o3.remove()
                })
              }
            })
          }
        })
      }
    }
  } else {
    noDataFound()
  }
}
async function renderLocationExpertPlatformValues(platform, node) {
  node.textContent = ""
  const searchField = text(node)
  searchField.input.placeholder = "Suche nach Alias"
  verifyInputValue(searchField.input)
  const actionNeededBtn = div("hover box mlr34 mb13 inline-block", node)
  actionNeededBtn.textContent = "Aktion erfoderlich"
  const loading = addLoading(node)
  const rerender = div("mlr34 flex wrap align around", node)
  const res = await post("/location-expert/get/platform/values/", {platform})
  loading.remove()
  if (res.status === 200) {
    const values = JSON.parse(res.response)
    let selected = false
    actionNeededBtn.onclick = () => {
      if (!selected) {
        const filtered = values.filter(it => it.writeAccessRequest && it.writeAccessRequest.length > 0)
        renderValueButtons(filtered, rerender)
        selected = true
        actionNeededBtn.classList.remove("box")
        actionNeededBtn.classList.add("btn-ok")
        actionNeededBtn.textContent = "Schreibrechte freigeben"
      } else {
        renderValueButtons(values, rerender)
        selected = false
        actionNeededBtn.classList.add("box")
        actionNeededBtn.classList.remove("btn-ok")
        actionNeededBtn.textContent = "Aktion erfoderlich"
      }
    }
    searchField.input.oninput = ev => {
      const highlighted = filterBy("alias", ev.target.value, values)
      renderValueButtons(highlighted, rerender)
    }
    renderValueButtons(values, rerender)
  }
  return res
}
async function renderValueButtons(values, node) {
  node.textContent = ""
  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const valueDiv = div("p8 w377", node)
    valueDiv.header = div("hover flex br-tl-tr-bl21 btn-theme", valueDiv)
    valueDiv.header.onclick = async () => {
      pop(o1 => {
        o1.addInfo(value.path)
        const buttons = o1.content
        const aliasBtn = leftRight({left: ".alias", right: "Alias ändern"}, buttons)
        aliasBtn.onclick = () => {
          pop(async o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            const funnel = aliasFunnel(content)
            if (value.alias.includes("<mark>")) {
              const cleanAlias = value.alias.replace(/<mark>(.*?)<\/mark>/gi, "$1")
              const convertedAlias = textToFirstUpper(cleanAlias)
              funnel.alias.input.value = convertedAlias
            } else {
              funnel.alias.input.value = value.alias
            }
            funnel.submit.onclick = async () => {
              await verifyFunnel(funnel)
              const alias = funnel.alias.input.value
              lock(async o3 => {
                const res = await post("/location-expert/register/platform/value/alias/", {alias, path: value.path})
                if (res.status === 200) {
                  o3.alert.ok()
                  o2.remove()
                  o1.previousSibling.remove()
                  o1.remove()
                } else {
                  o3.alert.nok()
                }
                o3.remove()
              })
            }
          })
        }
        const image = leftRight({left: ".image", right: "Bild ändern"}, buttons)
        image.onclick = () => {
          pop(o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            const funnel = imageFunnel(content)
            if (value.image) funnel.image.input.value = value.image
            verifyInputValue(funnel.image.input)
            funnel.submit.onclick = async () => {
              await verifyFunnel(funnel)
              const image = funnel.image.input.value
              lock(async o3 => {
                const res = await post("/location-expert/register/platform/value/image/", {path: value.path, image})
                if (res.status === 200) {
                  o3.alert.ok()
                  o2.remove()
                  o1.previousSibling.remove()
                  o1.remove()
                } else {
                  o2.alert.nok()
                }
                o3.remove()
              })
            }
          })
        }
        const open = leftRight({left: ".open", right: "Öffnet deine Werteinheit in einem neuen Fenster"}, buttons)
        open.onclick = () => window.open(value.path, "_blank")
        const path = leftRight({left: ".path", right: "Dein einzigartiger Pfad"}, buttons)
        path.onclick = () => {
          pop(async o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            const pathField = tag(content)
            pathField.input.value = value.path.split("/")[3]
            pathField.input.placeholder = "Pfad (text/tag)"
            verifyInputValue(pathField.input)
            const submit = div("action", content)
            submit.textContent = "Daten jetzt speichern"
            submit.onclick = async () => {
              await verifyInputValue(pathField.input)
              const path = pathField.input.value
              const fullPath = `/${value.path.split("/")[1]}/${value.path.split("/")[2]}/${path}/`
              await pathExist(fullPath, pathField)
              lock(async o3 => {
                const res = await post("/location-expert/register/platform/value/path/", {old: value.path, new: path})
                if (res.status === 200) {
                  o3.alert.ok()
                  o2.remove()
                  o1.previousSibling.remove()
                  o1.remove()
                } else {
                  o3.alert.nok()
                }
                o3.remove()
              })
            }
          })
        }
        const remove = leftRight({left: ".remove", right: "Werteinheit entfernen"}, buttons)
        remove.onclick = async () => {
          const confirm = window.confirm("Möchtest du deine Werteinheit wirklich löschen? Alle enthaltenen Daten werden ebenfalls gelöscht.")
          if (confirm === true) {
            lock(async o2 => {
              const res = await post("/location-expert/remove/platform/value/", {path: value.path})
              if (res.status === 200) {
                o2.alert.removed()
                o1.previousSibling.remove()
                o1.remove()
              } else {
                o2.alert.nok()
              }
              o2.remove()
            })
          }
        }
        const updateToolbox = leftRight({left: ".update-toolbox", right: "Aktualisiere deine Toolbox"}, buttons)
        updateToolbox.onclick = () => {
          lock(async o2 => {
            const res = await post("/location-expert/update/toolbox/path/", {path: value.path})
            if (res.status === 200) {
              window.alert("Toolbox erfolgreich aktualisiert.")
            } else {
              window.alert("Fehler.. Bitte wiederholen.")
            }
            o2.remove()
          })
        }
        const visibility = leftRight({left: ".visibility", right: "Sichtbarkeit der Werteinheit"}, buttons)
        visibility.onclick = () => {
          pop(async o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            function valueVisibilityFunnel(type, value) {
              funnelDiv.textContent = ""
              function addLabel(text) {
                const label = document.createElement("label")
                label.className = "sans-serif mtb21 mlr34 color-theme fs21 block"
                label.textContent = text
                funnelDiv.appendChild(label)
              }
              addLabel("Sichbarkeit")
              const visibility = select(funnelDiv)
              verifyInputValue(visibility.input)
              visibility.input.oninput = ev => valueVisibilityFunnel(ev.target.value, value)
              if (type === "open") {
                visibility.append(["open", "closed"])
                const submit = div("action", funnelDiv)
                submit.textContent = "Daten jetzt speichern"
                submit.onclick = async () => {
                  const visibility = type
                  const path = value.path
                  lock(async o3 => {
                    const res = await post("/location-expert/register/platform/value/visibility/", {path, visibility})
                    if (res.status === 200) {
                      o3.alert.saved()
                      o2.remove()
                      o1.previousSibling.remove()
                      o1.remove()
                    } else {
                      o3.alert.nok()
                    }
                    o3.remove()
                  })
                }
              }
              if (type === "closed") {
                visibility.append(["closed", "open"])
                addLabel("Rollen dürfen mit deiner Werteinheit interagieren")
                const rolesSelect = select(funnelDiv)
                rolesSelect.input.multiple = true
                post("/expert/get/platform/roles/").then(res => {
                  if (res.status === 200) {
                    try {
                      const roles = JSON.parse(res.response)
                      roles.forEach(role => rolesSelect.addOption(role.name, role.created))
                      rolesSelect.selectByValue(value.roles)
                    } catch (e) {
                      alertNok()
                      o2.remove()
                    }
                  } else {
                    alertNok()
                    o2.remove()
                  }
                })
                verifyInputValue(rolesSelect.input)
                if (Array.isArray(value.roles)) rolesSelect.select(value.roles)
                addLabel("Kontakte, von dir, dürfen mit deiner Werteinheit interagieren")
                const authorizedSelect = selectEmails(funnelDiv)
                post("/jwt/get/contacts/").then(res => {
                  if (res.status === 200) {
                    const contacts = JSON.parse(res.response)
                    contacts.forEach(contact => authorizedSelect.addOption(contact.email, contact.id))
                    authorizedSelect.selectByValue(value.authorized)
                  } else {
                    alertNok()
                    o2.remove()
                  }
                })
                verifyInputValue(authorizedSelect.input)
                const submit = textToAction("Daten jetzt speichern", funnelDiv)
                submit.onclick = async () => {
                  const path = value.path
                  const visibility = type
                  const roles = rolesSelect.selectedValues()
                  const authorized = authorizedSelect.selectedValues()
                  lock(async o3 => {
                    const res = await post("/location-expert/register/platform/value/visibility/", {visibility, roles, authorized, path})
                    if (res.status === 200) {
                      o3.alert.saved()
                      o2.remove()
                      o1.previousSibling.remove()
                      o1.remove()
                    } else {
                      o3.alert.nok()
                    }
                    o3.remove()
                  })
                }
              }
            }
            const funnelDiv = div("", content)
            valueVisibilityFunnel(value.visibility, value)
          })
        }
        const writability = leftRight({left: ".writability", right: "Schreibrechte an Teammitglieder vergeben"}, buttons)
        writability.onclick = () => {
          pop(async o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            const emailsSelect = selectEmails(content)
            emailsSelect.input.className += " vh34"
            post("/jwt/get/contacts/").then(res => {
              if (res.status === 200) {
                const contacts = JSON.parse(res.response)
                contacts.forEach(contact => emailsSelect.addOption(contact.email, contact.id))
                emailsSelect.selectByText(value.writability)
              } else {
                alertNok()
                o2.remove()
              }
            })
            const submit = div("action", content)
            submit.textContent = "Schreibrechte jetzt speichern"
            submit.onclick = () => {
              const path = value.path
              const writability = emailsSelect.selectedText()
              lock(async o3 => {
                const res = await post("/location-expert/register/platform/value/writability/", {path, writability})
                if (res.status === 200) {
                  o3.alert.saved()
                  o2.remove()
                  o1.previousSibling.remove()
                  o1.remove()
                } else {
                  o3.alert.nok()
                }
                o3.remove()
              })
            }
          })
        }
      })
    }
    valueDiv.header.state = div("flex align center w89 br-tl-bl21", valueDiv.header)
    if (value.visibility === "closed") {
      if (value.roles.length === 0) {
        if (value.authorized.length === 0) {
          valueDiv.header.state.textContent = "closed"
        }
      }
    }
    if (value.visibility === "open") {
      valueDiv.header.state.classList.add("bg-green")
      valueDiv.header.state.style = "color: #fff;"
      valueDiv.header.state.textContent = "open"
    }
    if (value.visibility === "closed") {
      if (value.roles.length !== 0 || value.authorized.length !== 0) {
        valueDiv.header.state.className += " bg-yellow"
        valueDiv.header.state.style = "color: #000;"
        valueDiv.header.state.textContent = "restricted"
      }
    }
    valueDiv.header.text = div("p21 fs21 of-auto color-theme", valueDiv.header)
    {
      const alias = div("fs21", valueDiv.header.text)
      if (!textIsEmpty(value.query)) {
        alias.innerHTML = await textToPurified(value.query)
      } else {
        alias.textContent = value.alias
      }
    }
    {
      const path = div("fs13", valueDiv.header.text)
      path.textContent = value.path
    }
    valueDiv.body = div("hover ml8p btn-theme br-bl-br21 p21", valueDiv)
    valueDiv.body.content = div("flex column start", valueDiv.body)
    const openPathButton = textToLink("Pfad öffnen", valueDiv.body.content)
    openPathButton.classList.add("mtb5")
    openPathButton.onclick = () => window.open(value.path, "_blank")
    const copyPathButton = textToLink("Pfad kopieren", valueDiv.body.content)
    copyPathButton.classList.add("mtb5")
    copyPathButton.onclick = () => {
      navigator.clipboard.writeText(value.path)
      .then(() => window.alert(`Der Pfad '${value.path}' wurde erfolgreich in deiner Zwischenablage gespeichert.`))
      .catch(() => window.alert("Fehler.. Bitte wiederholen."))
    }
    if (value.automated) {
      const automated = div("fs21 color-orange", valueDiv.body.content)
      automated.textContent = `Automatisierter Inhalt aktiviert`
    }
    if (value.requested) {
      const requested = div("fs21 color-orange", valueDiv.body.content)
      requested.textContent = `Angefordert: ${numberToKm(value.requested)} Mal`
    }
    if (value?.writability?.length > 0) {
      const writability = div("fs21 color-orange", valueDiv.body.content)
      writability.textContent = `Schreibrechte: ${value.writability.join(", ")}`
    }
    if (value.writeAccessRequest && value.writeAccessRequest.length > 0) {
      const fragment = document.createDocumentFragment()
      value.writeAccessRequest.forEach(id => {
        const shortId = id.substring(0, 5)
        const decisionBox = div("hover, box mt8", fragment)
        const decisionText = div("", decisionBox)
        decisionText.textContent = `Der Nutzer mit der id '${shortId}..' hat Schreibrechte gefordert.`
        const showIdBtn = div("hover box mt8 mb21", decisionBox)
        showIdBtn.textContent = `Wer ist ${shortId}..?`
        showIdBtn.onclick = () => {
          lock(async lock => {
            const res = await post("/location-expert/get/user/info/", {id})
            if (res.status === 200) window.alert(res.response)
            else lock.alert.nok()
            lock.remove()
          })
        }
        const decisionButtons = div("flex align between", decisionBox)
        const allowBtn = div("hover btn-ok", decisionButtons)
        allowBtn.textContent = "Genehmigen"
        allowBtn.onclick = () => {
          decisionBox.remove()
          post("/location-expert/register/write-access-allowed/", {path: value.path, id})
        }
        const denyBtn = div("hover btn-nok", decisionButtons)
        denyBtn.textContent = "Ablehnen"
        denyBtn.onclick = () => {
          decisionBox.remove()
          post("/location-expert/register/write-access-denied/", {path: value.path, id})
        }
      })
      valueDiv.body.content.appendChild(fragment)
    }
  }
}
function renderWritableValues(values, content) {
  const paths = values.flatMap(it => it.path || [])
  textToHr("Für jede Werteinheit", content)
  const bulkOptions = flexRow(content)
  const updateToolbox = textToLink("Toolbox Update", bulkOptions)
  updateToolbox.onclick = () => {
    lock(async o1 => {
      const res = await post("/location-writable/update/toolbox/paths/", {paths})
      if (res.status === 200) {
        o1.alert.ok()
      } else {
        o1.alert.nok()
      }
      o1.remove()
    })
  }
  const searchField = text(content)
  addValidSign(searchField.input)
  const buttons = div("", content)
  searchField.input.placeholder = "Suche nach Alias"
  searchField.input.oninput = ev => {
    const query = ev.target.value
    const filter = "alias"
    const highlighted = filterBy(filter, query, values)
    renderHtmlValuesWritable(highlighted, buttons)
  }
  renderHtmlValuesWritable(values, buttons)
}
async function verifyPlatformName(input) {
  const res = await post("/location-expert/verify/platform/name/", {platform: input.value})
  if (res.status !== 200) {
    window.alert("Dieser Plattform Name ist ungültig. Bitte wähle einen anderen Namen.")
    addNotValidSign(input)
    throw new Error("platform name is invalid")
  }
}
async function verifyPlatformExist(input) {
  const res = await post("/location-expert/verify/platform/exist/", {platform: input.value})
  if (res.status === 200) {
    window.alert("Plattform existiert bereits.")
    addNotValidSign(input)
    throw new Error("platform exist")
  }
}
async function verifyPlatformRoleNameExist(platform, input) {
  const res = await post("/location-expert/verify/platform/role/name/", {platform, name: input.value})
  if (res.status === 200) {
    window.alert("Diese Rolle existiert bereits.")
    addNotValidSign(input)
    throw new Error("role name exist")
  }
}
