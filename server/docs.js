const express = require('express')
const Notification = require('../lib/Notification.js')
const { HtmlParser } = require('../config/HtmlParser.js')
const { docsLocation } = require('../config/ServerLocation.js')
// const path = require("node:path")
const app = express()

new HtmlParser(docsLocation.relativePath)


app.use(express.static(docsLocation.absolutePath))
app.listen(docsLocation.port, () => Notification.warn(`docs listening on ${docsLocation.origin}`))
