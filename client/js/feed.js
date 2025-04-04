import {div} from "/js/html-tags.js"
import {add} from "/js/button.js"
import {post} from "/js/request.js"
import {pop} from "/js/overlay.js"

const thisScript = document.getElementById("feed")
const funnel = thisScript.getAttribute("funnel")
if (!funnel) throw new Error("feed: funnel not found")
const algo = thisScript.getAttribute("algo")
if (!algo) throw new Error("feed: algo not found")
document.body.className = "dark-light"
let feedDiv = document.querySelector("div.feed")
if (!feedDiv) {
  feedDiv = div("feed pb144 no-save", document.body)
}
let addDiv = document.querySelector("div.add")
if (!addDiv) {
  addDiv = add("+", document.body)
}
addDiv.onclick = () => {
  console.log("hi")
  pop(o1 => {
  })
  // add funnel blueprint 
  // open as overlay
}
post("/get/feed/", {funnel, algo}).then(res => {
  if (res.status === 200) {
    const feed = JSON.parse(res.response)
    console.log(feed)
  }
})

// get the data
// create data ui
// add data ui to ui
