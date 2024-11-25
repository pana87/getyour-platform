import {Helper} from "/js/Helper.js"
import {post} from "/js/request.js"

const thisScript = document.querySelector("script#submit-to-ids")
const funnelSelector = thisScript.getAttribute("funnel")
if (!funnelSelector) throw new Error("submit-to-ids: missing funnel selector")
const ids = thisScript.getAttribute("ids")
if (!ids) throw new Error("submit-to-ids: missing ids")
const funnel = document.querySelector(funnelSelector)
if (!funnel) throw new Error("submit-to-ids: missing funnel")

const formNodes = funnel.querySelectorAll("input, textarea, select")

Helper.add("attributes-observer", formNodes)
const submit = funnel.querySelector(".submit-to-ids")
submit.onclick = async () => {

  await Helper.verify("inputs", formNodes)
  const map = Helper.convert("nodelist/map", formNodes)
  Helper.overlay("lock", async lock => {
    const res = await post("/send/map/to/email/ids/", {map, ids})
    if (res.status === 200) {
      lock.alert.sent()
    } else {
      lock.alert.nok()
    }
    lock.remove()
  })
}
