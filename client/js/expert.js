import {Helper, renderTag, addLoading} from "/js/Helper.js"
import {button} from "/js/button.js"
import {post} from "/js/request.js"
import {div} from "/js/html-tags.js"

button.append("go-back", document.body)
const domain = window.location.pathname.split("/")[1]
document.querySelector("title").textContent = Helper.convert("text/capital-first-letter", domain)
const app = Helper.create("button/getyour", document.body)
app.onclick = () => {

  Helper.overlay("pop", async o1 => {
    o1.load()
    o1.info.textContent = document.location.pathname
    const content = o1.content

    const isExpert = await post("/verify/user/location-expert/")
    if (isExpert.status === 200) {

      Helper.convert("parent/scrollable", content)

      {
        const tree = "getyour.expert.alias"
        const key = Helper.convert("tree/key", tree)
        const keyCapped = Helper.convert("text/capital-first-letter", key)
        const button = Helper.render("button/left-right", {left: `.${tree}`, right: `Alias ändern`}, content)
        button.onclick = () => {
          Helper.overlay("pop", async o2 => {
            const content = o2.content
            const funnel = Helper.funnel("alias", content)
            post("/jwt/get/tree/", {tree}).then(res => {
              if (res.status === 200) {
                funnel.alias.input.value = res.response
                Helper.verify("input/value", funnel.alias.input)
              }
            })
            funnel.submit.onclick = async () => {

              await Helper.verify("input/value", funnel.alias.input)
              const alias = funnel.alias.input.value
              Helper.overlay("lock", async o3 => {
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
        const button = Helper.render("button/left-right", {left: `.${tree}`, right: "Beschreibung ändern"}, content)
        button.onclick = () => {

          Helper.overlay("pop", async o2 => {
            const content = o2.content
            const funnel = Helper.funnel("description", content)
            post("/jwt/get/tree/", {tree}).then(res => {
              if (res.status === 200) {
                funnel.description.input.value = res.response
              }
            })
            Helper.verify("funnel", funnel)
            funnel.submit.onclick = async () => {

              await Helper.verify("input/value", funnel.description.input)
              const description = funnel.description.input.value
              Helper.overlay("lock", async o3 => {
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
        const button = Helper.render("button/left-right", {left: `.${tree}`, right: "Domain ändern"}, content)
        button.onclick = () => {

          Helper.overlay("pop", o2 => {
            const content = o2.content
            const funnel = Helper.funnel("name", content)
            funnel.name.input.value = window.location.pathname.split("/")[1]
            Helper.verify("input/value", funnel.name.input)
            funnel.submit.onclick = async () => {

              await Helper.verify("input/value", funnel.name.input)
              const name = funnel.name.input.value
              Helper.overlay("lock", async o3 => {
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
        const button = Helper.render("button/left-right", {left: `.${tree}`, right: "Image ändern"}, content)
        button.onclick = () => {
          Helper.overlay("pop", async o2 => {
            const content = o2.content
            const funnel = Helper.funnel("image", content)
            post("/jwt/get/tree/", {tree}).then(res => {
              if (res.status === 200) {
                funnel.image.input.value = res.response
                Helper.verify("input/value", funnel.image.input)
              }
            })
            funnel.submit.onclick = async () => {
              await Helper.verify("input/value", funnel.image.input)
              const image = funnel.image.input.value
              Helper.overlay("lock", async o3 => {
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
            const imagesBtn = Helper.render("button/left-right", {left: ".images", right: "Meine Bilder"}, content)
            imagesBtn.onclick = Helper.fn("openImagesOverlay")
          })
        }
      }
      {
        const tree = "getyour.expert.platforms"
        const nameSubmit = Helper.render("button/left-right", {left: `.${tree}`, right: "Neue Plattform"}, content)
        nameSubmit.onclick = () => {
          Helper.overlay("pop", async o2 => {
            const content = o2.content
            Helper.render("text/hr", "Neue Plattform", content)
            const funnel = Helper.funnel("platform", content)
            funnel.submit.onclick = async () => {
              await Helper.verify("input/value", funnel.platform.input)
              const platform = funnel.platform.input.value
              await verifyPlatformExist(funnel.platform.input)
              Helper.overlay("lock", async o3 => {
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
            Helper.render("text/hr", "Plattform JSON Objekt importieren", content)
            const json = Helper.create("input/textarea", content)
            json.input.placeholder = "Plattform: {\n  image, (optional)\n  match-maker, (optional)\n  name, (notwendig)\n  roles, (optional)\n  start, (optional)\n  values, (optional)\n  visibility, (optional)\n}"
            json.input.className += " h89 fs8"
            Helper.add("style/not-valid", json.input)
            const jsonSubmit = button.render("action", {textContent: "Daten jetzt speichern"}, content)
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
                if (!platform.created) platform.created = Date.now()
                if (!platform.name) throw new Error("platform.name required")
                const res = await post("/location-expert/verify/platform/exist/", {platform: platform.name})
                if (res.status === 200) throw new Error("platform exist")
                Helper.overlay("lock", async o3 => {
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
                Helper.add("style/not-valid", json.input)
              }
            }
          })
        }
      }
      Helper.create("button/start", content)
      const writeAccessRequestBtn = Helper.render("button/left-right", {left: ".write-access-request", right: "Fordere Schreibrechte an"}, content)
      writeAccessRequestBtn.onclick = () => {
        Helper.overlay("pop", o2 => {
          o2.onlyClosedUser()
          o2.addInfo(".write-access-request")
          const content = o2.content
          Helper.render("text/h1", `Wähle einen Experten`, content)
          const expertSelect = Helper.create("input/select", content)
          Helper.add("style/valid", expertSelect.input)
          expertSelect.input.oninput = ev => {
            const id = ev.target.value
            addPaths(id)
          }
          Helper.render("text/h1", `Wähle die Pfade`, content)
          const pathsSelect = Helper.create("input/select", content)
          Helper.add("style/not-valid", pathsSelect.input)
          pathsSelect.input.multiple = true
          pathsSelect.input.oninput = () => {
            if (pathsSelect.selectedValues().length > 0) Helper.add("style/valid", pathsSelect.input)
            else Helper.add("style/not-valid", pathsSelect.input)
          }
          function addPaths(id) {
            post("/location-expert/get/expert/paths/", {id}).then(res => {
              if (res.status === 200) {
                const paths = JSON.parse(res.response)
                pathsSelect.input.textContent = ""
                pathsSelect.input.add(paths)
              } else {
                pathsSelect.input.textContent = ""
                Helper.add("style/not-valid", pathsSelect.input)
              }
            })
          }
          post("/jwt/get/experts/").then(res => {
            if (res.status === 200) {
              const experts = JSON.parse(res.response)
              experts.push({id: "a", alias: "panaq"})
              expertSelect.input.textContent = ""
              for (let i = 0; i < experts.length; i++) {
                const expert = experts[i]
                const option = document.createElement("option")
                option.value = expert.id
                option.text = expert.alias
                Helper.append(option, expertSelect.input)
              }
              addPaths(experts[0].id)
            }
          })
          const submit = Helper.create("button/action", content)
          submit.textContent = "Schreibrechte jetzt anfordern"
          submit.onclick = () => {
            const id = expertSelect.selectedValues()[0]
            if (Helper.verifyIs("text/empty", id)) {
              Helper.add("style/not-valid", expertSelect.input)
              return
            }
            const paths = pathsSelect.selectedValues()
            if (paths.length <= 0) {
              Helper.add("style/not-valid", pathsSelect.input)
              return
            }
            Helper.overlay("lock", async lock => {
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

      const writableValues = Helper.render("button/left-right", {left: `.writable-values`, right: "Werteinheiten mit Schreibrechte"}, content)
      writableValues.onclick = async () => await openWritableValuesOverlay()

      return
    } else {
      const isWritable = await post("/location-writable/get/platform/values/")
      if (isWritable.status === 200) {
        const values = JSON.parse(isWritable.response)
        renderWritableValues(values, content)
      } else {
        Helper.render("nav/open", content)
      }
    }
  })
}
const title = Helper.render("text/h1", "Plattformen", document.body)
const buttons = Helper.div("pb144", document.body)
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
  node.image.classList.add("obj-cover", "max-vh34", "br-bl-br13")
  node.image.src = src
  node.image.onerror = () => node.image.remove()
  Helper.append(node.image, node)
}
function createValueImageButton(value, node) {

  const button = createTagButton(value.alias, node)
  if (value.image) addImage(value.image, button)
  return button
}
function createTagButton(tag, node) {

  const button = Helper.create("div/box")
  Helper.classes(button, {add: "sans-serif flex column of-hidden"})
  button.tag = Helper.div("m21", button)
  button.tag.textContent = Helper.convert("tag/capital-first-letter", tag)
  if (node) Helper.append(button, node)
  return button
}
function createPlatformImageButton(platform, node) {

  const button = createTagButton(platform.name, node)
  if (platform.image) addImage(platform.image, button)
  return button
}
function noDataFound() {

  Helper.convert("parent/note", buttons)
  buttons.textContent = "Keine Plattformen gefunden"
  throw new Error("404 Not Found")
}
function openWritableValuesOverlay() {

  Helper.overlay("pop", async o1 => {
    const content = o1.content
    o1.load()
    const res = await post("/location-writable/get/platform/values/")
    o1.loading.remove()
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
    const button = Helper.create("button/left-right", node)
    if (!Helper.verifyIs("text/empty", value.query)) {
      Helper.render("html/div", value.query, button.left)
    } else {
      Helper.render("text/div", value.alias, button.left)
    }
    const pathDiv = Helper.render("text/div", value.path, button.left)
    pathDiv.classList.add("fs13")
    button.onclick = () => window.open(value.path, "_blank")
    button.right.textContent = "Pfad kopieren"
    button.right.classList.add("ptb21", "plr34", "br13", "mr13")
    button.right.classList.remove("mtb21", "mlr34")
    Helper.add("hover-outline", button.right)
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
  const loading = Helper.create("div/loading", node)
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
  const loading = Helper.create("div/loading", node)
  const res = await post("/get/platforms/")
  loading.remove()
  if (res.status === 200) {
    const platforms = JSON.parse(res.response)
    node.textContent = ""
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i]
      const button = createPlatformImageButton(platform, node)
      button.onclick = () => {

        Helper.overlay("pop", async o1 => {
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
      const conditionButton = Helper.render("button/left-right", {left: i + 1, right: conditionToString()}, node)
      conditionButton.onclick = () => {

        Helper.overlay("pop", o1 => {
          o1.addInfo(conditionToString())
          const content = o1.content
          const funnel = Helper.funnel("condition", content)
          funnel.left.input.value = condition.left
          funnel.operator.input.value = condition.operator
          funnel.right.input.value = condition.right
          Helper.verify("funnel", funnel)
          funnel.submit.onclick = async () => {

            await Helper.verify("funnel", funnel)
            const left = funnel.left.input.value
            const operator = funnel.operator.input.value
            const right = funnel.right.input.value
            Helper.overlay("lock", async o2 => {
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
          const remove = Helper.render("button/left-right", {left: ".remove", right: "Bedingung entfernen"}, content)
          remove.onclick = () => {

            Helper.overlay("lock", async o2 => {
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
    Helper.render("text/note", "Keine Bedingungen gefunden", node)
  }
}
async function renderLocationExpertPlatformMatchMaker(it, node) {

  node.textContent = ""
  const loading = Helper.create("div/loading", node)
  const platform = it.name
  const res = await post("/location-expert/get/platform/match-maker/", {platform})
  loading.remove()
  if (res.status === 200) {
    const array = JSON.parse(res.response)
    for (let i = 0; i < array.length; i++) {
      const matchMaker = array[i]
      const matchMakerButton = Helper.render("button/left-right", {left: matchMaker.name, right: `vor ${Helper.convert("millis/since", matchMaker.created)}`}, node)
      matchMakerButton.onclick = () => {

        Helper.overlay("pop", o1 => {
          o1.addInfo(matchMaker.name)
          const content = o1.content
          const conditions = Helper.render("button/left-right", {left: ".conditions", right: "Bedingungen hinzufügen"}, content)
          conditions.onclick = () => {

            Helper.overlay("pop", async o2 => {
              o2.addInfo(matchMaker.name)
              const content = o2.content
              const create = Helper.render("button/left-right", {left: ".create", right: "Neue Bedingung definieren"}, content)
              create.onclick = () => {

                Helper.overlay("pop", async o3 => {
                  o3.addInfo(matchMaker.name)
                  const content = o3.content
                  const funnel = Helper.funnel("condition", content)
                  funnel.submit.onclick = async () => {

                    await Helper.verify("funnel", funnel)
                    const created = matchMaker.created
                    const left = funnel.left.input.value
                    const operator = funnel.operator.input.value
                    const right = funnel.right.input.value
                    Helper.overlay("lock", async o4 => {
                      const res = await post("/location-expert/register/match-maker/condition/", {created, left, operator, right})
                      if (res.status === 200) {
                        o4.alert.ok()
                        await renderLocationExpertMatchMakerConditions(matchMaker.created, conditionsContainer)
                        o3.remove()
                      } else {
                        o4.alert.nok()
                      }
                      o4.remove()
                    })
                  }
                })
              }
              Helper.render("text/hr", "Meine Bedingungen", content)
              const conditionsContainer = Helper.create("div", content)
              await renderLocationExpertMatchMakerConditions(matchMaker.created, conditionsContainer)
            })
          }
          const remove = Helper.render("button/left-right", {left: ".remove", right: "Match Maker entfernen"}, content)
          remove.onclick = () => {

            Helper.overlay("lock", async o2 => {
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
    Helper.render("text/note", "Keine Match Maker gefunden", node)
  }
}
async function renderLocationExpertPlatformRoles(platform, node) {

  node.textContent = ""
  const loading = Helper.create("div/loading", node)
  const res = await post("/location-expert/get/platform/roles/", {platform})
  loading.remove()
  if (res.status === 200) {
    const roles = JSON.parse(res.response)
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i]
      const button = Helper.render("button/left-right", {left: role.name, right: `vor ${Helper.convert("millis/since", role.created)}`}, node)
      button.onclick = () => {

        Helper.overlay("pop", async o1 => {
          o1.addInfo(role.name)
          const content = o1.content
          const funnel = Helper.funnel("role", content)
          funnel.name.input.value = role.name
          Helper.verify("input/value", funnel.name.input)
          const res = await post("/location-expert/get/platform/value/paths/", {platform})
          if (res.status === 200) {
            const paths = JSON.parse(res.response)
            funnel.home.input.add(paths)
            funnel.home.input.select([role.home])
            Helper.verify("input/value", funnel.home.input)
          } else {
            window.alert("Es wurden keine Werteinheiten definiert")
            Helper.add("style/not-valid", funnel.home.input)
          }
          funnel.submit.onclick = async () => {

            await Helper.verify("funnel", funnel)
            const name = funnel.name.input.value
            const home = funnel.home.input.value
            Helper.overlay("lock", async o2 => {
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
          const remove = Helper.render("button/left-right", {left: ".remove", right: "Entferne deine Rolle"}, content)
          remove.onclick = () => {

            Helper.overlay("lock", async o2 => {
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
    Helper.render("text/note", "Keine Rollen gefunden", node)
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
        Helper.overlay("pop", async o1 => {
          o1.addInfo(platform.name)
          const buttons = o1.content
          const bulkValues = Helper.render("button/left-right", {left: ".bulk-values", right: "Massen Funktionen für ausgewählte Werteinheiten"}, buttons)
          bulkValues.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(platform.name)
              o2.load()
              const content = o2.content
              const res = await post("/location-expert/get/platform/paths/", {platform: platform.name})
              if (res.status === 200) {
                const paths = JSON.parse(res.response)
                Helper.convert("parent/scrollable", content)
                content.style.marginTop = "21px"
                Helper.render("text/hr", "Wähle deine Pfade", content)
                const flexDiv = Helper.div("flex wrap mtb21 mlr34", content)
                const all = Helper.render("text/link", "Alle", flexDiv)
                all.onclick = ev => select.input.selectAll()
                const none = Helper.render("text/link", "Keinen", flexDiv)
                none.onclick = ev => select.input.selectNone()
                const select = Helper.create("input/select", content)
                select.input.multiple = true
                select.input.required = true
                Helper.verify("input/value", select.input)
                select.input.oninput = () => Helper.verify("input/value", select.input)
                let height = 0
                select.input.textContent = ""
                for (let i = 0; i < paths.length; i++) {
                  const option = document.createElement("option")
                  height += 34
                  option.value = paths[i]
                  option.text = paths[i]
                  select.input.appendChild(option)
                }
                select.input.style.height = `${height}px`
                Helper.render("text/hr", "Verfügbare Skripte", content)
                const buttons = Helper.create("div/flex-around", content)
                async function updateScript(id) {
                  await Helper.verify("input/value", select.input)
                  const paths = Array.from(select.input.selectedOptions).map(it => it.value)
                  Helper.overlay("lock", async o3 => {
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
                  const button = Helper.render("text/link", `${Helper.convert("tag/capital-first-letter", id)} anhängen`, buttons)
                  button.onclick = async () => await updateScript(id)
                }
                post("/expert/get/js/paths/").then(res => {
                  try {
                    const paths = JSON.parse(res.response)
                    paths.forEach(path => {
                      const id = Helper.convert("path/id", path)
                      scriptUpdateButton(id)
                    })
                  } catch (error) {
                    buttons.textContent = "Keine Skripte gefunden"
                  }
                })

                {
                  async function requestPaths(path) {
                    await Helper.verify("input/value", select.input)
                    const paths = Array.from(select.input.selectedOptions).map(it => it.value)
                    Helper.overlay("lock", async o3 => {
                      const res = await post(path, {paths})
                      if (res.status === 200) {
                        window.alert("Funktion erfolgreich abgeschlossen")
                      } else {
                        o3.alert.nok()
                      }
                      o3.remove()
                    })
                  }
                  Helper.render("text/hr", "Weitere Funktionen", content)
                  const more = Helper.create("div/flex-around", content)
                  const addMetaTags = Helper.render("text/link", "Meta Tags hinzufügen", more)
                  addMetaTags.onclick = async () => await requestPaths("/location-expert/tag/paths/meta-tags/")
                  const removeScripts = Helper.render("text/link", "Alle Skripte entfernen", more)
                  removeScripts.onclick = async () => {
                    await Helper.verify("input/value", select.input)
                    const paths = Array.from(select.input.selectedOptions).map(it => it.value)
                    Helper.overlay("lock", async o3 => {
                      const res = await post("/location-expert/remove/paths/scripts/", {paths})
                      if (res.status === 200) {
                        o3.alert.ok()
                      } else {
                        o3.alert.nok()
                      }
                      o3.remove()
                    })
                  }
                  const visibilityOpen = Helper.render("text/link", "Sichtbarkeit öffnen", more)
                  visibilityOpen.onclick = async () => await requestPaths("/location-expert/tag/paths/visibility-open/")
                  const visibilityClosed = Helper.render("text/link", "Sichtbarkeit schließen", more)
                  visibilityClosed.onclick = async () => await requestPaths("/location-expert/tag/paths/visibility-closed/")
                  const automatedTrue = Helper.render("text/link", "Automatisierter Inhalt aktivieren", more)
                  automatedTrue.onclick = async () => await requestPaths("/location-expert/tag/paths/automated-true/")
                  const automatedFalse = Helper.render("text/link", "Automatisierter Inhalt ausschalten", more)
                  automatedFalse.onclick = async () => await requestPaths("/location-expert/tag/paths/automated-false/")
                  const removeValue = Helper.render("text/link", "Werteinheiten entfernen", more)
                  removeValue.onclick = async () => {
                    const confirm = window.confirm("Möchtest du die ausgewählten Werteinheiten wirklich entfernen?")
                    if (confirm) await requestPaths("/location-expert/remove/paths/")
                  }
                  const resetRequested = Helper.render("text/link", "Seitenbesuche zurücksetzen", more)
                  resetRequested.onclick = async () => await requestPaths("/location-expert/tag/paths/reset-requested/")
                  const emptyWritability = Helper.render("text/link", "Alle Schreibrechte entziehen", more)
                  emptyWritability.onclick = async () => await requestPaths("/location-expert/tag/paths/empty-writability/")
                  const shareValue = Helper.render("text/link", "An Experten senden", more)
                  shareValue.onclick = async () => {
                    await Helper.verify("input/value", select.input)
                    const paths = Array.from(select.input.selectedOptions).map(it => it.value)
                    Helper.overlay("pop", o2 => {
                      o2.onlyClosedUser()
                      o2.addInfo(platform.name)
                      const content = o2.content
                      Helper.render("text/h1", `An welchen Experten möchtest du deine Werteinheiten senden?`, content)
                      const expert = Helper.create("select/experts", content)
                      Helper.render("text/p", `Es werden ${paths.length} Werteinheiten gesendet.`, content)
                      const submit = Helper.create("button/action", content)
                      submit.textContent = "Werteinheiten jetzt senden"
                      submit.onclick = () => {
                        const id = expert.selectedValues()[0]
                        if (Helper.verifyIs("text/empty", id)) {
                          Helper.add("style/not-valid", expert.input)
                          return
                        }
                        Helper.overlay("lock", async lock => {
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
          const createValue = Helper.render("button/left-right", {left: ".create-value", right: "Neue Werteinheit erstellen"}, buttons)
          createValue.onclick = () => {
            Helper.overlay("pop", o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const funnel = Helper.funnel("platform.value", content)
              funnel.alias.input.addEventListener("input", () => {
                funnel.alias.input.value = funnel.alias.input.value.replaceAll("-", " ")
              })
              funnel.submit.onclick = async () => {

                await Helper.verify("funnel", funnel)
                const path = funnel.path.input.value
                const fullPath = `/${window.location.pathname.split("/")[1]}/${platform.name}/${path}/`
                await Helper.verify("path/exist", fullPath, funnel.path)
                const alias = funnel.alias.input.value
                Helper.overlay("lock", async o3 => {
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
          const exportBtn = Helper.render("button/left-right", {left: ".export", right: "Exportiere deine Plattform"}, buttons)
          exportBtn.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(`.export.${platform.name}`)
              const content = o2.content
              const loader = addLoading(content)
              const platformRes = await post("/location-expert/get/platform/", {platform: platform.name})
              loader.remove()
              if (platformRes.status === 200) {
                const platform = JSON.parse(platformRes.response)
                const staticBtn = Helper.render("button/left-right", {left: ".static", right: "Exportiere deine statische Plattform"}, content)
                staticBtn.onclick = () => {
                  Helper.overlay("pop", async o3 => {
                    const content = o3.content
                    const loader = addLoading(content)
                    const scriptsRes = await post("/location-expert/get/js/scripts/")
                    loader.remove()
                    if (scriptsRes.status === 200) {
                      const scripts = JSON.parse(scriptsRes.response)
                      try {
                        Helper.render("text/h1", "Wähle deine Startseite: (index.html)", content)
                        const indexSelect = Helper.create("input/select", content)
                        indexSelect.input.add(platform.values.flatMap(it => it.path || []))
                        if (platform.start) indexSelect.input.select([platform.start])
                        Helper.add("style/valid", indexSelect.input)
                        Helper.render("text/h1", "Wähle deine Pfade:", content)
                        const pathsSelect = Helper.create("input/select", content)
                        pathsSelect.input.add(platform.values.flatMap(it => it.path || []))
                        pathsSelect.input.multiple = true
                        pathsSelect.input.selectNone()
                        Helper.add("style/not-valid", pathsSelect.input)
                        Helper.render("text/h1", "Wähle deine Skripte: (/js)", content)
                        const scriptsSelect = Helper.create("input/select", content)
                        scriptsSelect.input.add(scripts.flatMap(it => it.name || []))
                        scriptsSelect.input.multiple = true
                        scriptsSelect.input.selectNone()
                        Helper.add("style/not-valid", scriptsSelect.input)
                        const submit = Helper.render("text/action", "Verzeichnis herunterladen", content)
                        submit.onclick = async () => {
                          const indexPath = indexSelect.input.value
                          const paths = pathsSelect.selectedValues()
                          if (Helper.verifyIs("array/empty", paths)) {
                            Helper.add("style/not-valid", pathsSelect.input)
                            return
                          }
                          const scriptNames = scriptsSelect.selectedValues()
                          if (Helper.verifyIs("array/empty", scriptNames)) {
                            Helper.add("style/not-valid", scriptsSelect.input)
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
                          const indexFile = {name: "index.html", content: platform.values.find(it => it.path === indexPath).html}
                          directoryContent.push(indexFile)
                          scriptNames.forEach(name => {
                            const content = scripts.find(it => it.name === name)
                            if (!content) return
                            const scriptFile = {name, content: scripts.find(it => it.name === name).content}
                            directoryContent.push(scriptFile)
                          })
                          paths.forEach(path => {
                            const pathFile = {name: path.split("/")[3] + ".html", content: platform.values.find(it => it.path === path).html}
                            directoryContent.push(pathFile)
                          })
                        }
                      } catch (e) {
                        o3.alert.nok()
                        o3.remove()
                      }
                    } else {
                      o3.alert.nok()
                      o3.remove()
                    }
                  })
                }
                const copyBtn = Helper.render("button/left-right", {left: ".copy", right: "Kopiere deine Plattform in die Zwischenablage"}, content)
                copyBtn.onclick = () => {
                  navigator.clipboard.writeText(JSON.stringify(platform, null, 2)).then(o2.alert.saved).catch(o2.alert.nok)
                }
              } else {
                o2.alert.nok()
                o2.remove()
              }
            })
          }
          const htmlValues = Helper.render("button/left-right", {left: ".html-values", right: "Meine HTML Werteinheiten"}, buttons)
          htmlValues.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const div = Helper.div("sans-serif mtb21 pb144", content)
              const res = await renderLocationExpertPlatformValues(platform.name, div)
              if (res.status !== 200) {
                window.alert("Keine Werteinheiten gefunden. Erstelle eine neue Werteinheit.")
                o2.remove()
              }
            })
          }
          const image = Helper.render("button/left-right", {left: ".image", right: "Bild ändern"}, buttons)
          image.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const funnel = Helper.funnel("image", content)
              if (platform.image) {
                funnel.image.input.value = platform.image
                Helper.verify("input/value", funnel.image.input)
              }
              funnel.submit.onclick = async () => {

                await Helper.verify("funnel", funnel)
                const image = funnel.image.input.value
                Helper.overlay("lock", async o3 => {
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
          const matchMaker = Helper.render("button/left-right", {left: ".match-maker", right: "Match Maker definieren"}, buttons)
          matchMaker.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content

              const create = Helper.render("button/left-right", {left: ".create", right: "Neuen Match Maker definieren"}, content)
              create.onclick = () => {

                Helper.overlay("pop", async o3 => {
                  o3.addInfo(platform.name)
                  const content = o3.content
                  const nameField = Helper.create("input/tag", content)
                  nameField.input.placeholder = "Match Maker (text/tag)"
                  const submit = Helper.create("button/action", content)
                  submit.textContent = "Daten jetzt speichern"
                  submit.onclick = async () => {

                    await Helper.verify("input/value", nameField.input)
                    const name = nameField.input.value
                    const res = await post("/location-expert/verify/match-maker/name/", {name})
                    if (res.status === 200) {
                      window.alert("Name existiert bereits.")
                      Helper.add("style/not-valid", nameField.input)
                      throw new Error("name exist")
                    }
                    Helper.overlay("lock", async o4 => {
                      const res = await post("/location-expert/register/platform/match-maker/", {platform: platform.name, name})
                      if (res.status === 200) {
                        o4.alert.ok()
                        await renderLocationExpertPlatformMatchMaker(platform, matchMakerContainer)
                        o3.remove()
                      } else {
                        o4.alert.nok()
                      }
                      o4.remove()
                    })
                  }
                })
              }

              Helper.render("text/hr", "Meine Match Maker", content)
              const matchMakerContainer = Helper.create("div", content)
              await renderLocationExpertPlatformMatchMaker(platform, matchMakerContainer)
            })
          }
          const name = Helper.render("button/left-right", {left: ".name", right: "Namen ändern"}, buttons)
          name.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const platformNameField = Helper.create("input/tag", content)
              platformNameField.input.value = platform.name
              platformNameField.input.placeholder = "Plattform (text/tag)"
              Helper.verify("input/value", platformNameField.input)
              const button = Helper.create("button/action", content)
              button.textContent = "Daten jetzt speichern"
              button.onclick = async () => {

                await Helper.verify("input/value", platformNameField.input)
                const platformName = platformNameField.input.value
                await verifyPlatformExist(platformNameField.input)
                Helper.overlay("lock", async o3 => {
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
          const roles = Helper.render("button/left-right", {left: ".roles", right: "Rollen definieren"}, buttons)
          roles.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const create = Helper.render("button/left-right", {left: ".create", right: "Neue Rolle definieren"}, content)
              create.onclick = () => {

                Helper.overlay("pop", async o3 => {
                  o3.addInfo(platform.name)
                  const content = o3.content
                  const funnel = Helper.funnel("role", content)
                  post("/location-expert/get/platform/value/paths/", {platform: platform.name}).then(res => {
                    if (res.status === 200) {
                      const paths = JSON.parse(res.response)
                      funnel.home.input.add(paths)
                      Helper.verify("input/value", funnel.home.input)
                    } else {
                      window.alert("Es wurden keine Werteinheiten gefunden. Du musst eine Startseite für deine Rolle definieren und brauchst dafür mindestens eine Werteinheit.")
                      o3.remove()
                    }
                  })
                  funnel.submit.onclick = async () => {

                    await Helper.verify("funnel", funnel)
                    const name = funnel.name.input.value
                    const home = funnel.home.input.value
                    await verifyPlatformRoleNameExist(platform.name, funnel.name.input)
                    Helper.overlay("lock", async o4 => {
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
              Helper.render("text/hr", "Meine Rollen", content)
              const roleList = Helper.div("", content)
              await renderLocationExpertPlatformRoles(platform.name, roleList)
            })
          }
          const sharePlatformBtn = Helper.render("button/left-right", {left: ".share", right: "Gebe deine Plattform weiter"}, buttons)
          sharePlatformBtn.onclick = () => {
            Helper.overlay("pop", o2 => {
              o2.onlyClosedUser()
              o2.addInfo(platform.name)
              const content = o2.content
              Helper.render("text/h1", `An welchen Experten möchtest du die Plattform '${platform.name}' senden?`, content)
              const expert = Helper.create("select/experts", content)
              Helper.render("text/p", `Es werden ${platform.values} Werteinheiten gesendet.`, content)
              const submit = Helper.create("button/action", content)
              submit.textContent = "Plattform jetzt senden"
              submit.onclick = () => {
                const id = expert.selectedValues()[0]
                if (Helper.verifyIs("text/empty", id)) {
                  Helper.add("style/not-valid", expert.input)
                  return
                }
                Helper.overlay("lock", async lock => {
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
          const startPath = Helper.render("button/left-right", {left: ".start-path", right: "Definiere einen Startpunkt für deine Plattform"}, buttons)
          startPath.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              Helper.render("label", {for: "start", text: "Wähle einen Start Pfad für deine Plattform"}, content)
              const startField = Helper.create("input/select", content)
              startField.input.id = "start"
              const res = await post("/location-expert/get/platform/value/paths/", {platform: platform.name})
              if (res.status === 200) {
                const paths = JSON.parse(res.response)

                Helper.add("select-options", {select: startField.input, options: paths})
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
              Helper.verify("funnel", content)
              const submit = Helper.create("button/action", content)
              submit.textContent = "Pfad jetzt speichern"
              submit.onclick = async () => {

                const start = startField.input.value
                if (Helper.verifyIs("text/empty", start)) {
                  Helper.add("style/not-valid", startField.input)
                  return
                }
                Helper.overlay("lock", async o3 => {
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
          const remove = Helper.render("button/left-right", {left: ".remove", right: "Plattform entfernen"}, buttons)
          remove.onclick = () => {
            const confirm = window.confirm("Möchtest du deine Plattform wirklich entfernen? Alle enthaltenen Werteinheiten werden ebenfalls gelöscht.")
            if (confirm === true) {
              Helper.overlay("lock", async o2 => {
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
          const visibility = Helper.render("button/left-right", {left: ".visibility", right: "Sichtbarkeit der Plattform"}, buttons)
          visibility.onclick = () => {
            Helper.overlay("pop", async o2 => {
              o2.addInfo(platform.name)
              const content = o2.content
              const visibilityField = Helper.create("input/select", content)
              if (platform.visibility === "open") {
                visibilityField.input.add(["open", "closed"])
              }
              if (platform.visibility === "closed") {
                visibilityField.input.add(["closed", "open"])
              }
              Helper.verify("input/value", visibilityField.input)
              const submit = Helper.create("button/action", content)
              submit.textContent = "Sichtbarkeit jetzt speichern"
              submit.onclick = async () => {

                const visibility = visibilityField.input.value
                Helper.overlay("lock", async o3 => {
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
  const searchField = Helper.create("input/text", node)
  searchField.input.placeholder = "Suche nach Alias"
  Helper.verify("input/value", searchField.input)
  const actionNeededBtn = div("box mlr34 mb13 inline-block", node)
  actionNeededBtn.textContent = "Aktion erfoderlich"
  Helper.add("hover-outline", actionNeededBtn)
  const loading = addLoading(node)
  const rerender = Helper.div("mlr34 flex wrap align around", node)
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
      const highlighted = Helper.sort("query", {array: values, filter: "alias", query: ev.target.value})
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
    const div = Helper.div("p8 w377", node)
    div.header = Helper.div("flex br-tl-tr-bl21 btn-theme", div)
    Helper.add("hover-outline", div.header)
    div.header.onclick = async () => {
      Helper.overlay("pop", o1 => {
        o1.addInfo(value.path)
        const buttons = o1.content
        const alias = Helper.render("button/left-right", {left: ".alias", right: "Alias ändern"}, buttons)
        alias.onclick = () => {
          Helper.overlay("pop", async o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            const funnel = Helper.funnel("alias", content)
            if (value.alias.includes("<mark>")) {
              const cleanAlias = value.alias.replace(/<mark>(.*?)<\/mark>/gi, "$1")
              const convertedAlias = Helper.convert("text/capital-first-letter", cleanAlias)
              funnel.alias.input.value = convertedAlias
            } else {
              funnel.alias.input.value = value.alias
            }
            funnel.submit.onclick = async () => {

              await Helper.verify("funnel", funnel)
              const alias = funnel.alias.input.value
              Helper.overlay("lock", async o3 => {
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

        const image = Helper.render("button/left-right", {left: ".image", right: "Bild ändern"}, buttons)
        image.onclick = () => {

          Helper.overlay("pop", o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            const funnel = Helper.funnel("image", content)
            if (value.image) funnel.image.input.value = value.image
            Helper.verify("input/value", funnel.image.input)
            funnel.submit.onclick = async () => {

              await Helper.verify("funnel", funnel)
              const image = funnel.image.input.value
              Helper.overlay("lock", async o3 => {
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

        const open = Helper.render("button/left-right", {left: ".open", right: "Öffnet deine Werteinheit in einem neuen Fenster"}, buttons)
        open.onclick = () => window.open(value.path, "_blank")

        const path = Helper.render("button/left-right", {left: ".path", right: "Pfad ändern"}, buttons)
        path.onclick = () => {

          Helper.overlay("pop", async o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            const pathField = Helper.create("input/tag", content)
            pathField.input.value = value.path.split("/")[3]
            pathField.input.placeholder = "Pfad (text/tag)"
            Helper.verify("input/value", pathField.input)
            const submit = Helper.create("button/action", content)
            submit.textContent = "Daten jetzt speichern"
            submit.onclick = async () => {

              await Helper.verify("input/value", pathField.input)
              const path = pathField.input.value
              const fullPath = `/${value.path.split("/")[1]}/${value.path.split("/")[2]}/${path}/`
              await Helper.verify("path/exist", fullPath, pathField)
              Helper.overlay("lock", async o3 => {
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

        const remove = Helper.render("button/left-right", {left: ".remove", right: "Werteinheit entfernen"}, buttons)
        remove.onclick = async () => {

          const confirm = window.confirm("Möchtest du deine Werteinheit wirklich löschen? Alle enthaltenen Daten werden ebenfalls gelöscht.")
          if (confirm === true) {
            Helper.overlay("lock", async o2 => {
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

        const updateToolbox = Helper.render("button/left-right", {left: ".update-toolbox", right: "Aktualisiere deine Toolbox"}, buttons)
        updateToolbox.onclick = () => {

          Helper.overlay("lock", async o2 => {
            const res = await post("/location-expert/update/toolbox/path/", {path: value.path})
            if (res.status === 200) {
              window.alert("Toolbox erfolgreich aktualisiert.")
            } else {
              window.alert("Fehler.. Bitte wiederholen.")
            }
            o2.remove()
          })
        }

        const visibility = Helper.render("button/left-right", {left: ".visibility", right: "Sichtbarkeit der Werteinheit"}, buttons)
        visibility.onclick = () => {

          Helper.overlay("pop", async o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            function valueVisibilityFunnel(type, value) {

              funnelDiv.textContent = ""
              function addLabel(text) {

                const label = document.createElement("label")
                label.className = "sans-serif mtb21 mlr34 color-theme fs21 block"
                label.textContent = text
                Helper.append(label, funnelDiv)
              }
              addLabel("Sichbarkeit")
              const visibility = Helper.create("input/select", funnelDiv)
              Helper.verify("input/value", visibility.input)
              visibility.input.oninput = ev => valueVisibilityFunnel(ev.target.value, value)
              if (type === "open") {
                visibility.input.add(["open", "closed"])
                const submit = Helper.create("button/action", funnelDiv)
                submit.textContent = "Daten jetzt speichern"
                submit.onclick = async () => {

                  const visibility = type
                  const path = value.path
                  Helper.overlay("lock", async o3 => {
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
                visibility.input.add(["closed", "open"])
                addLabel("Rollen dürfen mit deiner Werteinheit interagieren")
                const rolesSelect = Helper.create("input/select", funnelDiv)
                rolesSelect.input.multiple = true
                function notFound() {

                  window.alert("Fehler.. Bitte wiederholen.")
                  o2.remove()
                }
                post("/expert/get/platform/roles/").then(res => {
                  if (res.status === 200) {
                    try {
                      const roles = JSON.parse(res.response)
                      const items = roles.map(it => ({text: it.name, value: it.created}))
                      rolesSelect.input.textValue(items)
                    } catch (e) {
                      notFound()
                    }
                  } else {
                    notFound()
                  }
                })
                Helper.verify("input/value", rolesSelect.input)
                if (Array.isArray(value.roles)) rolesSelect.input.select(value.roles)
                addLabel("Kontakte, von dir, dürfen mit deiner Werteinheit interagieren")
                const authorizedSelect = Helper.create("select/emails", funnelDiv)
                post("/jwt/get/user/contacts/").then(res => {
                  if (res.status === 200) {
                    try {
                      const contacts = JSON.parse(res.response)
                      const mapped = contacts.map(it => ({text: it.email, value: it.id}))
                      authorizedSelect.input.textValue(mapped)
                      authorizedSelect.selectByValue(value.authorized)
                    } catch (e) {
                      notFound()
                    }
                  } else {
                    notFound()
                  }
                })
                Helper.verify("input/value", authorizedSelect.input)
                const submit = Helper.create("button/action", funnelDiv)
                submit.textContent = "Daten jetzt speichern"
                submit.onclick = async () => {

                  const path = value.path
                  const visibility = type
                  const roles = rolesSelect.selectedValues()
                  const authorized = authorizedSelect.selectedValues()
                  Helper.overlay("lock", async o3 => {
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
            const funnelDiv = Helper.create("div", content)
            valueVisibilityFunnel(value.visibility, value)
          })
        }

        const writability = Helper.render("button/left-right", {left: ".writability", right: "Schreibrechte an Teammitglieder vergeben"}, buttons)
        writability.onclick = () => {

          Helper.overlay("pop", async o2 => {
            o2.addInfo(value.path)
            const content = o2.content
            const emailsSelect = Helper.create("input/select", content)
            Helper.append(emailsSelect.search, content)
            emailsSelect.input.setAttribute("multiple", "true")
            Helper.verify("input/value", emailsSelect.input)
            emailsSelect.input.className += " vh34"
            post("/jwt/get/user/contacts/").then(res => {
              if (res.status === 200) {
                try {
                  const contacts = JSON.parse(res.response)
                  const mapped = contacts.map(it => ({text: it.email, value: it.id}))
                  emailsSelect.add(mapped)
                  emailsSelect.selectByText(value.writability)
                } catch (e) {
                  notFound()
                }
              } else {
                notFound()
              }
            })
            const submit = Helper.create("button/action", content)
            submit.textContent = "Schreibrechte jetzt speichern"
            submit.onclick = () => {

              const path = value.path
              const writability = emailsSelect.selectedValues()
              Helper.overlay("lock", async o3 => {
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
    div.header.state = Helper.div("flex align center w89 br-tl-bl21", div.header)
    if (value.visibility === "closed") {
      if (value.roles.length === 0) {
        if (value.authorized.length === 0) {
          div.header.state.textContent = "closed"
        }
      }
    }
    if (value.visibility === "open") {
      div.header.state.classList.add("bg-green")
      div.header.state.style = "color: #fff;"
      div.header.state.textContent = "open"
    }
    if (value.visibility === "closed") {
      if (value.roles.length !== 0 || value.authorized.length !== 0) {
        div.header.state.className += " bg-yellow"
        div.header.state.style = "color: #000;"
        div.header.state.textContent = "restricted"
      }
    }
    div.header.text = Helper.div("p21 fs21 of-auto color-theme", div.header)
    {
      const alias = Helper.div("fs21", div.header.text)
      if (!Helper.verifyIs("text/empty", value.query)) {
        alias.innerHTML = await Helper.convert("text/purified", value.query)
      } else {
        alias.textContent = value.alias
      }
    }
    {
      const path = Helper.div("fs13", div.header.text)
      path.textContent = value.path
    }
    div.body = Helper.div("ml8p btn-theme br-bl-br21 p21", div)
    Helper.add("hover-outline", div.body)
    div.body.content = Helper.div("flex column start", div.body)
    const openPathButton = Helper.render("text/link", "Pfad öffnen", div.body.content)
    openPathButton.classList.add("mtb5")
    openPathButton.onclick = () => window.open(value.path, "_blank")
    const copyPathButton = Helper.render("text/link", "Pfad kopieren", div.body.content)
    copyPathButton.classList.add("mtb5")
    copyPathButton.onclick = () => {

      navigator.clipboard.writeText(value.path)
      .then(() => window.alert(`Der Pfad '${value.path}' wurde erfolgreich in deiner Zwischenablage gespeichert.`))
      .catch(() => window.alert("Fehler.. Bitte wiederholen."))
    }
    if (value.automated) {
      const automated = Helper.div("fs21 color-orange", div.body.content)
      automated.textContent = `Automatisierter Inhalt aktiviert`
    }
    if (value.requested) {
      const requested = Helper.div("fs21 color-orange", div.body.content)
      requested.textContent = `Angefordert: ${Helper.convert("number/k-M", value.requested)} Mal`
    }
    if (value?.writability?.length > 0) {
      const writability = Helper.div("fs21 color-orange", div.body.content)
      writability.textContent = `Schreibrechte: ${value.writability.join(", ")}`
    }
    if (value.writeAccessRequest && value.writeAccessRequest.length > 0) {
      const fragment = document.createDocumentFragment()
      value.writeAccessRequest.forEach(id => {
        const shortId = id.substring(0, 5)
        const decisionBox = Helper.div("box mt8", fragment)
        Helper.add("hover-outline", decisionBox)
        const decisionText = Helper.div("", decisionBox)
        decisionText.textContent = `Der Nutzer mit der id '${shortId}..' hat Schreibrechte gefordert.`
        const showIdBtn = Helper.div("box mt8 mb21", decisionBox)
        Helper.add("hover-outline", showIdBtn)
        showIdBtn.textContent = `Wer ist ${shortId}..?`
        showIdBtn.onclick = () => {
          Helper.overlay("lock", async lock => {
            const res = await post("/location-expert/get/user/info/", {id})
            if (res.status === 200) window.alert(res.response)
            else lock.alert.nok()
            lock.remove()
          })
        }
        const decisionButtons = Helper.div("flex align between", decisionBox)
        const allowBtn = Helper.div("btn-ok", decisionButtons)
        allowBtn.textContent = "Genehmigen"
        Helper.add("hover-outline", allowBtn)
        allowBtn.onclick = () => {
          decisionBox.remove()
          post("/location-expert/register/write-access-allowed/", {path: value.path, id})
        }
        const denyBtn = Helper.div("btn-nok", decisionButtons)
        Helper.add("hover-outline", denyBtn)
        denyBtn.textContent = "Ablehnen"
        denyBtn.onclick = () => {
          decisionBox.remove()
          post("/location-expert/register/write-access-denied/", {path: value.path, id})
        }
      })
      div.body.content.appendChild(fragment)
    }
  }
}
function renderWritableValues(values, content) {
  const paths = values.flatMap(it => it.path || [])
  Helper.render("text/hr", "Für jede Werteinheit", content)
  const bulkOptions = Helper.create("div/flex-around", content)
  const updateToolbox = Helper.render("text/link", "Toolbox Update", bulkOptions)
  updateToolbox.onclick = () => {

    Helper.overlay("lock", async o1 => {
      const res = await post("/location-writable/update/toolbox/paths/", {paths})
      if (res.status === 200) {
        o1.alert.ok()
      } else {
        o1.alert.nok()
      }
      o1.remove()
    })
  }
  const searchField = Helper.create("input/text", content)
  const buttons = Helper.div("", content)
  searchField.input.placeholder = "Suche nach Alias"
  searchField.input.oninput = ev => {
    const query = ev.target.value
    const filter = "alias"
    const highlighted = Helper.sort("query", {array: values, query, filter})
    renderHtmlValuesWritable(highlighted, buttons)
  }
  renderHtmlValuesWritable(values, buttons)
}
async function verifyPlatformExist(input) {
  const res = await post("/location-expert/verify/platform/exist/", {platform: input.value})
  if (res.status === 200) {
    window.alert("Plattform existiert bereits.")
    Helper.add("style/not-valid", input)
    throw new Error("platform exist")
  }
}
async function verifyPlatformRoleNameExist(platform, input) {
  const res = await post("/location-expert/verify/platform/role/name/", {platform, name: input.value})
  if (res.status === 200) {
    window.alert("Diese Rolle existiert bereits.")
    Helper.add("style/not-valid", input)
    throw new Error("role name exist")
  }
}
