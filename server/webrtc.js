const WebSocket = require('ws')
const {Helper} = require("../lib/Helper.js")
const nano = require("nano")(process.env.COUCHDB_LOCATION)

function findCookie(name, cookie) {
  try {
    const cookieArray = cookie.split(";")
    for (let i = 0; i < cookieArray.length; i++) {
      const cookiePair = cookieArray[i].split("=")
      if (name === cookiePair[0].trim()) {
        return cookiePair[1]
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function startWebRtc(server) {

  const wss = new WebSocket.Server({ server })

  const connections = new Map()

  wss.on('connection', async (ws, req) => {

    async function authorizedEmail() {
      const jwtToken = findCookie("jwtToken", req.headers.cookie)
      if (!jwtToken) return ws.close(1011)
      let jwt
      try {
        jwt = await Helper.verifyJwtToken(jwtToken)
      } catch (error) {
        return ws.close(1011)
      }
      const doc = await nano.db.use("getyour").get("users")
      let authorizeEmail
      for (let i = 0; i < doc.users.length; i++) {
        const user = doc.users[i]
        if (user.id === jwt.id) {
          if (user.session.jwt !== Helper.digest(jwtToken)) return ws.close(1011)
          authorizeEmail = user.email
          break
        }
      }
      if (Helper.verifyIs("text/empty", authorizeEmail)) return ws.close(1011)
      return authorizeEmail
    }

    let userEmail = await authorizedEmail()

    const connection = connections.get(userEmail)
    if (!connection) connections.set(userEmail, {ws})

    ws.on('message', async (message) => {
      try {

        const data = JSON.parse(message)

        async function authorized(callback) {
          const jwtToken = findCookie("jwtToken", req.headers.cookie)
          if (!jwtToken) return ws.close(1011)
          let jwt
          try {
            jwt = await Helper.verifyJwtToken(jwtToken)
          } catch (error) {
            return ws.close(1011)
          }
          const doc = await nano.db.use("getyour").get("users")
          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]
            if (user.id === jwt.id) {
              if (user.session.jwt !== Helper.digest(jwtToken)) return ws.close(1011)
              userEmail = user.email
              break
            }
          }
          if (Helper.verifyIs("text/empty", userEmail)) return ws.close(1011)
          if (data.emails.includes(userEmail)) {
            callback(userEmail, data.emails)
          } else {
            return ws.close(1011)
          }
        }

        if (data.type === "start") {

          await authorized((email, group) => {
            for (let i = 0; i < group.length; i++) {
              const member = group[i]
              if (member !== email) {
                const connection = connections.get(member)
                if (connection && connection.ws.readyState === WebSocket.OPEN) {
                  connection.ws.send(JSON.stringify({type: "start", from: email}))
                }
              }
            }
          })

        }

        if (data.type === "offer") {

          await authorized((email, group) => {
            if (group.includes(data.from)) {
              const connection = connections.get(data.from)
              if (connection && connection.ws.readyState === WebSocket.OPEN) {
                connection.ws.send(JSON.stringify({type: "offer", offer: data.offer, from: email}))
              }
            }
          })
        }

        if (data.type === "answer") {

          await authorized((email, group) => {
            for (let i = 0; i < group.length; i++) {
              const member = group[i]
              if (member !== email) {
                const connection = connections.get(member)
                if (connection && connection.ws.readyState === WebSocket.OPEN) {
                  connection.ws.send(JSON.stringify({type: "answer", answer: data.answer, from: email}))
                }
              }
            }
          })
        }

        if (data.type === "iceCandidate") {

          await authorized((email, group) => {
            for (let i = 0; i < group.length; i++) {
              const member = group[i]
              if (member !== email) {
                const memberConnection = connections.get(member)
                if (memberConnection && memberConnection.ws.readyState === WebSocket.OPEN) {
                  memberConnection.ws.send(JSON.stringify({type: "iceCandidate", candidate: data.candidate, from: email}))
                }
              }
            }
          })
        }

        if (data.type === "stop") {

          await authorized((email, group) => {
            for (let i = 0; i < group.length; i++) {
              const member = group[i]
              if (member !== email) {
                const memberConnection = connections.get(member)
                if (memberConnection && memberConnection.ws.readyState === WebSocket.OPEN) {
                  memberConnection.ws.send(JSON.stringify({type: "stop", from: email}))
                }
              }
            }
          })
        }



      } catch (error) {
        console.error(error);
      }

    })

    ws.on('close', async () => {
      const senderEmail = await authorizedEmail()
      connections.delete(senderEmail)
    })

    ws.on('error', async (error) => {
      await Helper.logError(error, req)
      ws.close(1011)
    })

  })

}

module.exports = { startWebRtc }
