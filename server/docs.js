const express = require('express')
const { HtmlParser } = require('../config/HtmlParser.js')
const { docsLocation } = require('../config/ServerLocation.js')
const path = require("node:path")

const app = express()

new HtmlParser(docsLocation.relativePath)


app.use(express.static(docsLocation.absolutePath))
app.use(express.static(path.join(__dirname, "../client/js/")))
app.listen(docsLocation.port, () => console.log(`[getyour] docs listening on ${docsLocation.origin}`))
