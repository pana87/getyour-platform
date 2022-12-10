const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
const path = require("node:path")
const port = 3456

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'))
})

const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
}
const server = https.createServer(httpsOptions, app)
    .listen(port, () => {
        console.log('server running at ' + port)
    })
