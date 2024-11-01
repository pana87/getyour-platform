import {Helper} from "/js/Helper.js"

const stop = attr => {throw new Error(`${attr} attribute is missing`)}
const scriptId = "location-list"
const platform = window.location.pathname.split("/")[2]
const tag = document.getElementById(scriptId).getAttribute("tag")
if (!tag) stop("tag")
const tagCapped = Helper.convert("tag/capital-first-letter", tag)
const path = document.getElementById(scriptId).getAttribute("path")
if (!path) stop("path")
let button = document.querySelector(`.location-list-button`)
if (!button) {
  button = Helper.create("button/add", document.body)
  button.className += " location-list-button"
}
Helper.add("hover-outline", button)
button.onclick = () => {

  Helper.overlay("pop", async o1 => {
    o1.onlyClosedUser()
    o1.addInfo(`${platform}: [${tag}]`)
    const content = o1.content
    const create = Helper.render("button/left-right", {left: ".create", right: `${tagCapped} erstellen`}, content)
    create.onclick = () => {

      Helper.overlay("pop", async o2 => {
        o2.addInfo(`.${tag}`)
        const content = o2.content
        const funnel = await Helper.convert("path/funnel", {path, tag})
        .catch(e => o2.remove())
        Helper.append(funnel, content)
        funnel.submit.onclick = async () => {

          await Helper.verify("funnel", funnel)
          const item = await Helper.convert("funnel/values", funnel)
          console.log(item);
          Helper.overlay("lock", async o3 => {
            const res = await Helper.request("/register/location/list/", {item, tag})
            if (res.status === 200) {
              o3.alert.ok()
              o2.remove()
              await updateLocationList(tag, locationList)
            } else {
              o3.alert.nok()
            }
            o3.remove()

          })

        }
      })
    }
    Helper.render("text/hr", "Meine Liste", content)
    const locationList = await createLocationList(tag, content)
  })
}
async function updateLocationList(tag, node) {

  node.textContent = ""
  await createLocationList(tag, node)
}
async function createLocationList(tag, node) {

  const container = Helper.div("", node)
  const loading = Helper.create("div/loading", container)
  const res = await Helper.request("/get/location/tag/", {tag})
  loading.remove()
  if (res.status === 200) {
    const list = JSON.parse(res.response)
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const itemButton = Helper.render("button/left-right", {right: `vor ${Helper.convert("millis/since", item.created)}`}, container)
      Helper.render("text/pre", JSON.stringify(item, null, 2), itemButton.left)
      itemButton.onclick = () => {

        Helper.overlay("pop", o1 => {
          o1.addInfo(tag)
          const buttons = o1.content
          const remove = Helper.render("button/left-right", {left: ".remove", right: `${tagCapped} entfernen`}, buttons)
          remove.onclick = () => {

            Helper.overlay("lock", async o2 => {
              const res = await Helper.request("/remove/location/tag/", {created: item.created, tag})
              if (res.status === 200) {
                o2.alert.removed()
                await updateLocationList(tag, container)
                o1.remove()
              } else {
                o2.alert.nok()
              }
              o2.remove()
            })
          }
          const update = Helper.render("button/left-right", {left: ".update", right: `${tagCapped} aktualisieren`}, buttons)
          update.onclick = () => {

            Helper.overlay("pop", async o2 => {
              const content = o2.content
              const funnel = await Helper.convert("path/funnel", {path, tag})
              .catch(e => o2.remove())
              Helper.append(funnel, content)
              Helper.render("map/funnel", item, funnel)
              Helper.verify("funnel", funnel)
              funnel.submit = funnel.querySelector(".submit")
              funnel.submit.onclick = async () => {

                await Helper.verify("funnel", funnel)
                const itemUpdate = await Helper.convert("funnel/values", funnel)
                Helper.overlay("lock", async o3 => {
                  const res = await Helper.request("/update/location/list/", {created: item.created, tag, item: itemUpdate})
                  if (res.status === 200) {
                    o3.alert.saved()
                    await updateLocationList(tag, container)
                    o1.remove()
                    o2.remove()
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
    Helper.render("text/note", "Keine Daten gefunden", container)
  }
  return container
}
