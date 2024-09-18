import {Helper} from "/js/Helper.js"

(() => {

  document.querySelectorAll(".contacts").forEach(node => {
    Helper.on("hover", {node, class: "outline pointer"})
    node.addEventListener("click", ev => {
      Helper.overlay("contacts")
    })
  })
})();

(() => {

  document.querySelectorAll("[list]").forEach(node => {
    Helper.on("hover", {node, class: "outline pointer"})
    const split = node.getAttribute("list").split(" ")
    if (split.length <= 0) return
    const tree = Helper.convert("tag/tree", split[0])
    const algo = split[1]
    const type = split[2]
    node.addEventListener("click", ev => {
      Helper.overlay("pop", o1 => {
        o1.loading()
        Helper.request(`/get/users/tree/`, {tree, algo}).then(res => {
          if (res.status === 200) {
            const list = JSON.parse(res.response)
            Helper.render("list", {list, tree, type}, o1)
          }
        })
      })
    })
  })
})();

(() => {

  const split = window.location.pathname.split("/")
  const platform = split[2]
  const profil = split[3]
  const urlId = split[4]
  if (Helper.verifyIs("text/empty", profil) || profil !== "profil") return
  if (Helper.verifyIs("text/empty", urlId)) return
  Helper.request("/get/platform/url-id/", {urlId}).then(res => {
    if (res.status === 200) {
      const location = JSON.parse(res.response)
      Object.entries(location).forEach(([key, value]) => {
        const selector = `.${platform}.${key}`
        const elements = document.querySelectorAll(selector)
        if (elements.length <= 0) return
        elements.forEach(node => {
          const handle = Helper.fn("handleClassName", {platform, key})
          handle(node, value)
        })
      })
    }
  })
})();
