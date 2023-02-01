import { Helper } from "./Helper.js"

document.querySelectorAll("a[class*='link']").forEach(a => a.href = Helper.encodeStringToUri(a.innerHTML))
