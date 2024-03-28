const WebSocket = require('ws')

const authorizedUsers = new Map()

function addUserEmail(user, email) {
  // Implementierung der Funktion zum Hinzufügen einer E-Mail-Adresse zur Liste eines Benutzers
}

function isAuthorized(user, email) {
  // Implementierung der Funktion zum Überprüfen, ob eine E-Mail-Adresse autorisiert ist
}

function startWebRtcSignaling(server) {
  const wss = new WebSocket.Server({ server })

  wss.on('connection', function connection(ws) {
    console.log('Neue WebSocket-Verbindung.')

    // connect only when you are in group.emails
    // do not show online users
    // create push notification instead
    //
    // and not in online users

    ws.on('message', function incoming(message) {
      try {
        const data = JSON.parse(message)
        console.log(data);
      } catch (error) {
        console.error(error);
      }
      // Implementierung der Verarbeitung eingehender Nachrichten
    })

    // ws.on('close', function )
  })

  const port = "9998"
  server.listen(port, () => console.log(`[websocket] is running on port :${port}`))

  // Weitere Konfiguration und Funktionen des WebSocket-Servers
}

module.exports = { startWebRtcSignaling }
