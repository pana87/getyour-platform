const express = require('express')
const cors = require("cors")
const Notification = require('../lib/Notification')
const HtmlParser = require('../lib/HtmlParser')
const app = express()
const {clientLocation, componentsLocation} = require('../config/ServerLocation.js')

app.use(express.json())
app.use(cors({
  origin: `${clientLocation.protocol}//${clientLocation.hostname}:${clientLocation.port}`,
  methods: [ "POST", "GET" ],
  credentials: true,
}))

app.get("/shs/funnel/start/", (req, res) => {
  const parseRx = HtmlParser.parse({
    pathToAssets: "/felix/shs/funnel/start/",
    pathToHtmlFile: "/lib/views/shs/funnel/start/full-project.html",
  })
  if (parseRx.status !== 200) return res.send({ status: 500, message: "HTML_PARSER_ERROR" })

  return res.send(parseRx.html)
})

app.get("/felix/shs/technician/checklist-item/", (req, res) => {
  const parseRx = HtmlParser.parse({
    pathToAssets: "/felix/shs/technician/checklist-item/",
    pathToHtmlFile: "/felix/shs/technician/checklist-item/index.html",
  })
  if (parseRx.status !== 200) return res.send({ status: 500, message: "HTML_PARSER_ERROR" })

  return res.send(parseRx.html)
})

app.listen(componentsLocation.port, () => Notification.warn(`components listening on ${componentsLocation.origin}`))
