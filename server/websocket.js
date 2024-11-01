const WebSocket = require('ws')
const {Helper} = require("../lib/Helper.js")
const nano = require("nano")(process.env.COUCHDB_LOCATION)

const connections = new Map()

function findCookie(name, cookie) {
  try {
    if (Helper.verifyIs("text/empty", cookie)) throw new Error("cookie not found")
    const cookieArray = cookie.split(";")
    for (let i = 0; i < cookieArray.length; i++) {
      const cookiePair = cookieArray[i].split("=")
      if (name === cookiePair[0].trim()) {
        return cookiePair[1]
      }
    }
  } catch (error) {
  }
}

async function getBlocked(jwt) {

  const array = []
  const doc = await nano.db.use("getyour").get("user")
  const jwtUser = doc.user[jwt.id]
  if (jwtUser.id === jwt.id) {
    if (jwtUser.blocked !== undefined) {
      for (let i = 0; i < jwtUser.blocked.length; i++) {
        const blocked = jwtUser.blocked[i]
        for (const key in doc.user) {
          const user = doc.user[key]
          if (user.id === blocked.id) {
            const map = {}
            map.alias = user.alias
            map.created = blocked.created
            map.image = user.image
            map.id = user.id
            array.push(map)
          }
        }
      }
    }
  }
  if (array.length > 0) return array
}

function getChat(jwtUser, user) {

  let myMessagesTo = []
  if (jwtUser.messages !== undefined) {
    myMessagesTo = jwtUser.messages.filter(it => it.to === user.created)
  }
  let toMessagesMe = []
  if (user.messages !== undefined) {
    toMessagesMe = user.messages.filter(it => it.to === jwtUser.created)
  }
  const chat = [...myMessagesTo, ...toMessagesMe]
  return Helper.sort("created-desc", chat)
}

async function getCommunity(jwt) {

  const array = []
  const doc = await nano.db.use("getyour").get("user")
  const jwtUser = doc.user[jwt.id]
  if (jwtUser.id === jwt.id) {
    for (const key in doc.user) {
      const user = doc.user[key]
      if (user.created === jwtUser.created) continue
      if (user.blocked !== undefined) {
        for (let i = 0; i < user.blocked.length; i++) {
          const blockedUser = user.blocked[i]
          if (jwtUser.created === blockedUser.id) continue
        }
      }
      if (jwtUser.blocked !== undefined) {
        for (let i = 0; i < jwtUser.blocked.length; i++) {
          const blockedUser = jwtUser.blocked[i]
          if (user.created === blockedUser.id) continue
        }
      }
      const mostRecentMessage = getChat(jwtUser, user)[0]
      let highlight = false
      if (mostRecentMessage) {
        highlight = mostRecentMessage.to === jwtUser.created
      }
      const map = {}
      map.created = user.created
      map.alias = user.alias
      map.highlight = highlight
      map.image = user.image
      map.reputation = user.reputation
      array.push(map)
    }
  }
  array.sort((a, b) => b.highlight - a.highlight)
  if (array.length > 0) return array
}

async function getJwt(ws, req) {

  const jwtToken = findCookie("jwtToken", req.headers.cookie)
  if (!jwtToken) return ws.close(1011)
  try {
    const jwt = await Helper.verifyJwtToken(jwtToken)
    return jwt
  } catch (error) {
    return ws.close(1011)
  }
}

async function sendCommunity(jwt, ws) {

  const community = await getCommunity(jwt)
  ws.send(JSON.stringify({type: "community", community}))
}

function startWebSocket(server) {

  const wss = new WebSocket.Server({server})
  wss.on('connection', async (ws, req) => {
    const url = req.url
    if (url === "/") {
      await handleConnection(ws, req)
    }
  })
}

async function handleConnection(ws, req) {

  const jwt = await getJwt(ws, req)
  if (!jwt) return ws.close(1011)

  connections.set(jwt.id, ws)

  ws.on('message', async (message) => {

    const text = message.toString()
    const data = JSON.parse(text)

    if (data.type === "block") {

      try {
        if (Helper.verifyIs("number/empty", data.id)) throw new Error("id is empty")
        await Helper.add("user-reputation", {id: data.id, reputation: -1})

        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[jwt.id]
        if (user.id === jwt.id) {
          if (user.blocked === undefined) user.blocked = []
          let exist = false
          for (let i = 0; i < user.blocked.length; i++) {
            const blocked = user.blocked[i]
            if (blocked.id === data.id) {
              exist = true
            }
          }
          if (exist === false) {
            const blocked = {}
            blocked.created = Date.now()
            blocked.id = data.id
            user.blocked.push(blocked)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            ws.send(JSON.stringify({type: "block"}))
          }
        }
      } catch (error) {
        console.log(error)
        ws.close(1011)
      }
    }

    if (data.type === "blocked") {
      try {
        const blocked = await getBlocked(jwt)
        ws.send(JSON.stringify({type: "blocked", blocked}))
      } catch (error) {
        ws.close(1011)
      }
    }

    if (data.type === "chat") {

      try {
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[jwt.id]
        const user = doc.user[data.id]
        const chat = getChat(jwtUser, user)
        ws.send(JSON.stringify({type: "chat", chat}))
      } catch (error) {
        console.log(error)
        ws.close(1011)
      }
    }

    if (data.type === "community") {

      try {
        const community = await getCommunity(jwt)
        for (const [key, value] of connections) {
          if (key === jwt.id) {
            value.send(JSON.stringify({type: "community", community}))
          }
        }
      } catch (error) {
        console.log(error)
        ws.close(1011)
      }
    }

    if (data.type === "community-to") {

      try {

        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[data.to]
        if (user.id === data.to) {
          const community = await getCommunity(user)
          for (const [key, value] of connections) {
            if (key === user.id) {
              value.send(JSON.stringify({type: "community", community}))
            }
          }
        }
      } catch (error) {
        console.log(error)
        ws.close(1011)
      }
    }

    if (data.type === "message") {

      try {

        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[jwt.id]
        const user = doc.user[data.to]
        if (jwtUser.id === jwt.id) {
          if (jwtUser.messages === undefined) jwtUser.messages = []
          const message = {}
          message.created = Date.now()
          message.body = data.message
          message.to = data.to
          jwtUser.messages.unshift(message)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          if (user.id === data.to) {
            const chat = getChat(jwtUser, user)
            for (const [key, value] of connections) {
              if (key === jwtUser.id || key === user.id) {
                value.send(JSON.stringify({type: "chat", chat}))
              }
            }
          }
        }
      } catch (error) {
        console.log(error)
        ws.close(1011)
      }

    }

    if (data.type === "remove-messages") {

      try {

        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[jwt.id]
        const user = doc.user[data.to]
        if (jwtUser.id === jwt.id) {

          for (let i = jwtUser.messages.length - 1; i >= 0; i--) {
            const message = jwtUser.messages[i]
            if (message.to === undefined || message.to === data.to) {
              jwtUser.messages.splice(i, 1)
            }
          }
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          if (user.created === data.to) {
            const chat = getChat(jwtUser, user)
            for (const [key, value] of connections) {
              if (key === jwtUser.id || key === user.id) {
                value.send(JSON.stringify({type: "chat", chat}))
              }
            }
          }
        }
      } catch (error) {
        console.log(error)
        ws.close(1011)
      }

    }

    if (data.type === "unblock") {

      try {
        if (Helper.verifyIs("text/empty", data.id)) throw new Error("data.id is empty")
        await Helper.add("user-reputation", {id: data.id, reputation: 1})

        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[jwt.id]
        if (user.id === jwt.id) {
          if (user.blocked !== undefined) {
            for (let i = 0; i < user.blocked.length; i++) {
              const blocked = user.blocked[i]
              if (blocked.id === data.id) {
                user.blocked.splice(i, 1)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                ws.send(JSON.stringify({type: "unblock", blocked: user.blocked}))
              }
            }
          }
        }
      } catch (error) {
        console.log(error)
        ws.close(1011)
      }
    }

  })

  ws.on('close', () => {
    connections.delete(jwt.id)
  })

}

module.exports = { startWebSocket }
