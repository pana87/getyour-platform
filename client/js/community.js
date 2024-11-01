import {Helper} from "/js/Helper.js"

export const community = {}
community.openOverlay = () => {

  window.alert("Bald verfügbar.")
  return
  Helper.overlay("pop", communityOverlay => {
    communityOverlay.onlyClosedUser()
    const searchField = Helper.create("input/text", communityOverlay.content)
    searchField.input.placeholder = "Suche nach Alias"

    const flex = Helper.create("div/flex", communityOverlay.content)
    const allButton = Helper.render("text/link", "Alle", flex)
    allButton.onclick = () => send({type: "community"})

    const blockButton = Helper.render("text/link", "Blockiert", flex)
    blockButton.onclick = () => send({type: "blocked"})

    const communityDiv = Helper.create("div/loading", communityOverlay.content)

    let socket
    if (window.location.host === "localhost:9999") {
      socket = new WebSocket(`ws://${window.location.host}/`)
    } else {
      socket = new WebSocket(`wss://${window.location.host}/`)
    }
    communityOverlay.closeSocket(socket)
    function send(data) {
      socket.send(JSON.stringify(data))
    }
    socket.onopen = () => {
      send({type: "community"})
    }
    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      socket.close()
    }

    socket.addEventListener("message", ev => {
      const data = JSON.parse(ev.data)
      if (data.type === "blocked") {
        renderBlocked(data.blocked)
      }
      if (data.type === "community") {
        renderOpen(data.community)
      }
      if (data.type === "unblock") {
        renderBlocked(data.blocked)
      }
    })

    socket.addEventListener("close", () => {
      communityOverlay.remove()
    })

    function renderMessagesBox(community) {
      Helper.convert("parent/scrollable", communityDiv)
      communityDiv.style.padding = "8px"
      Helper.sort("flag-true", {flag: "highlight", array: community})
      for (let i = 0; i < community.length; i++) {
        const user = community[i]
        const box = Helper.render("user-box", user, communityDiv)
        box.onclick = () => {
          user.socket = socket
          Helper.overlay("messages", user)
        }
      }
    }

    function renderBlockedBox(community) {
      Helper.convert("parent/scrollable", communityDiv)
      communityDiv.style.padding = "8px"
      Helper.sort("flag-true", {flag: "highlight", array: community})
      for (let i = 0; i < community.length; i++) {
        const user = community[i]
        const box = Helper.render("user-box", user, communityDiv)
        box.created.textContent = `Blockiert seit: ${Helper.convert("millis/since", user.created)}`
        box.onclick = () => {
          Helper.overlay("pop", optionsOverlay => {
            {
              const button = Helper.create("button/left-right", optionsOverlay.content)
              button.left.textContent = ".unblock"
              button.right.textContent = "Entferne diesen Nutzer aus deiner Blockliste"
              button.onclick = () => {
                let message = "Möchtest du diesen Nutzer wirklich aus deiner Blockliste entfernen?"
                if (user.alias) message = `Möchtest du ${user.alias} wirklich aus deiner Blockliste entfernen?`
                const confirm = window.confirm(message)
                if (confirm === true) {
                  send({type: "unblock", id: user.id})
                  let message = "Dieser Nutzer wurde erfolgreich aus deiner Blockliste entfernt."
                  if (user.alias) message = `${user.alias} wurde erfolgreich aus deiner Blockliste entfernt.`
                  window.alert(message)
                  optionsOverlay.remove()
                  send({type: "community-to", to: user.id})
                }
              }
            }
          })
        }
      }
    }

    function renderOpen(community) {
      if (Helper.verifyIs("array/empty", community)) {
        userNotFound()
        return
      }
      searchField.input.oninput = (ev) => {
        if (Helper.verifyIs("text/empty", ev.target.value)) {
          renderMessagesBox(community)
          return
        }
        const filtered = community.filter(it => it.alias && it.alias.toLowerCase().includes(ev.target.value.toLowerCase()))
        const highlighted = filtered.map(it => {
          const highlightedAlias = it.alias.replace(new RegExp(ev.target.value, 'i'), `<mark>${ev.target.value}</mark>`)
          return { ...it, alias: highlightedAlias }
        })
        renderMessagesBox(highlighted)
      }
      renderMessagesBox(community)
    }

    function renderBlocked(community) {
      if (Helper.verifyIs("array/empty", community)) {
        userNotFound()
        return
      }
      searchField.input.oninput = (ev) => {
        if (Helper.verifyIs("text/empty", ev.target.value)) {
          renderBlockedBox(community)
          return
        }
        const filtered = community.filter(it => it.alias && it.alias.toLowerCase().includes(ev.target.value.toLowerCase()))
        const highlighted = filtered.map(it => {
          const highlightedAlias = it.alias.replace(new RegExp(ev.target.value, 'i'), `<mark>${ev.target.value}</mark>`)
          return { ...it, alias: highlightedAlias }
        })
        renderBlockedBox(highlighted)
      }
      renderBlockedBox(community)
    }

    function userNotFound() {
      Helper.convert("parent/info", communityDiv)
      communityDiv.textContent = "Keine Mitglieder gefunden"
    }

  })
}
