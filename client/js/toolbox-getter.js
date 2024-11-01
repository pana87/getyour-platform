import {Helper} from "/js/Helper.js"

async function addToolboxOnBody() {

  if (document.body) {
    await Helper.add("toolbox/onbody")
  } else {
    await Helper.add("ms/timeout", 3000)
    await addToolboxOnBody()
  }
}
await addToolboxOnBody()
