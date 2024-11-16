import {Helper} from "/js/Helper.js"

const it = {}
it.addToolboxOnBody = async () => {

  if (document.body) {
    await Helper.add("script/toolbox-getter")
    await Helper.add("toolbox/onbody")
    Helper.render("link/css", "/public/classes.css", document.head)
  } else {
    await Helper.add("ms/timeout", 3000)
    await it.addToolboxOnBody()
  }
}
await it.addToolboxOnBody()
export const toolboxGetter = it
