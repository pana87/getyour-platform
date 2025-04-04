import {Helper} from "/js/Helper.js"
import {post} from "/js/request.js"

document.querySelectorAll(".field-funnel").forEach(funnel => {
  Helper.add("outline-hover/field-funnel", funnel)
  const submitButton = funnel.querySelector(".submit-field-funnel-button")
  if (!submitButton) return
  if (submitButton.onclick === null) {
    submitButton.onclick = async () => {
      if (Helper.verifyIs("tag/empty", funnel.id)) {
        window.alert("Funnel ist nicht gültig: id ist kein tag")
        throw new Error("funnel tag is empty")
      }
      const map = await Helper.convert("field-funnel/map", funnel)
      if (map !== undefined) {
        Helper.overlay("lock", async lock => {
          const res = await post("/register/location/list/", {tag: funnel.id, map})
          if (res.status === 200) {
            lock.alert.ok()
            if (funnel.hasAttribute("next-path")) {
              window.location.assign(funnel.getAttribute("next-path"))
            }
            lock.remove()
          } else {
            lock.alert.nok()
            lock.remove()
          }
        })
      }
    }
  }
})
