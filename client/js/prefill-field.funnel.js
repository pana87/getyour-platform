import {post} from "/js/request.js"
import {Helper} from "/js/Helper.js"

document.querySelectorAll(".field-funnel").forEach(funnel => {
  const platform = window.location.pathname.split("/")[2]
  const tag = funnel.id
  post("/jwt/get/location/list/0/", {platform, tag}).then(res => {
    if (res.status === 200) {
      const map = JSON.parse(res.response)
      Helper.render("map/field-funnel", map, funnel)
    }
  })
})
