const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
const path = require("node:path")
const port = 3456

app.use(express.static(path.join(__dirname, "..", "client")))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'))
})

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, './key.pem')),
  cert: fs.readFileSync(path.join(__dirname, './cert.pem'))
}
const server = https.createServer(httpsOptions, app)
.listen(port, () => {
  console.log('[secdev] is listening on localhost:' + port)
})
