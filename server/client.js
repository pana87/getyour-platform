const express = require('express')
const {HtmlParser} = require('../config/HtmlParser.js')
const Notification = require('../lib/Notification.js')
const cookieParser = require('cookie-parser')
const { clientLocation, authLocation, databaseLocation } = require('../config/ServerLocation.js')
const { CSSParser } = require('../config/CSSParser.js')
const Storage = require('../lib/Storage.js')
const { Helper } = require('../lib/Helper.js')
const { User } = require('../lib/domain/User.js')
const { Request } = require('../lib/Request.js')
const path = require("node:path")

Storage.configureClient()
new HtmlParser(clientLocation.relativePath)
new CSSParser()

const app = express()
app.use(cookieParser())


app.get("/user/register/platform-developer/", Request.verifySession, (req, res) => {
  res.send(Helper.readFileSyncToString("../client/user/register/platform-developer/index.html"))
})


// because express root is not serving any css or js files
app.get("/", (req, res) => res.redirect("/home/"))

app.get("/user/platform/funnel/sign/", (req, res) => {
  const html = Helper.readFileSyncToString("../client/user/platform/funnel/sign/index.html")
  if (html !== undefined) return res.send(html)
  return res.sendStatus(404)
})

app.get("/user/entries/", Request.verifySession, (req, res) => {
  // if (req.userError !== undefined) return res.redirect("/home/")
  return res.send(Helper.readFileSyncToString("../client/user/entries/index.html"))
})

app.get("/cookies/anzeigen/", async (req, res) => {
  return res.send(req.cookies)
})

app.get("/:username/", async (req, res) => {
  if (req.params.username === "home") return res.send(Helper.readFileSyncToString("./../client/home/index.html"))
  if (req.params.username === "impressum") return res.send(Helper.readFileSyncToString("./../client/impressum/index.html"))
  if (req.params.username === "datenschutz") return res.send(Helper.readFileSyncToString("./../client/datenschutz/index.html"))
  if (req.params.username === "nutzervereinbarung") return res.send(Helper.readFileSyncToString("./../client/nutzervereinbarung/index.html"))
  // const {user} = await User.find(it => it.name === req.params.username)
  // if (user === undefined) return res.sendStatus(404)
  // const userRole = user.roles
  // const userName = Helper.capitalizeFirstLetter(req.params.username)
  // const platformList = "<p>test</p>"

  const html = Helper.readFileSyncToString("../client/user/index.html")
  // console.log(html);
  return res.send(html)
})

app.use(express.static(clientLocation.absolutePath))
app.listen(clientLocation.port, () => Notification.warn(`client listening on ${clientLocation.origin}`))
