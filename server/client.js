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

Storage.configureClient()
new HtmlParser(clientLocation.relativePath)
new CSSParser()

const app = express()
app.use(cookieParser())


app.get("/user/platform/funnel/sign/", (req, res) => {
  const html = Helper.readFileSyncToString("./../client/user/platform/funnel/sign/index.html")
  if (html !== undefined) return res.send(html)
  return res.sendStatus(404)
})

app.get("/plattform/zugang/", (req, res) => {
  return res.send(/*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Plattform Zugänge</title>
      </head>
      <body>

        <h1 class="title">Übersicht aller Zugänge</h1>
        <p class="info">Du musst dich anmelden, um die Plattform benutzen zu können.</p>

        <div class="platform-developer-entry-anchor"></div>
        <div class="operator-entry-anchor"></div>

        <script type="module" src="./index.js"></script>
      </body>
    </html>
  `)
})

app.get("/cookies/anzeigen/", async (req, res) => {
  return res.send(req.cookies)
})

app.get("/:username/", async (req, res) => {
  const {user} = await User.find(it => it.name === req.params.username)
  if (user === undefined) return res.sendStatus(404)
  const userRole = user.roles
  const userName = Helper.capitalizeFirstLetter(req.params.username)
  const platformList = "<p>test</p>"
  return res.send(/*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dein Profil</title>
      </head>
      <body>

        <h1 class="title">${userName}</h1>
        <h2 class="sub-title">${userRole}</h2>

        <div class="platform-list">${platformList}</div>

        <script id="__EXPOSE__">
          window.__DATABASE_LOCATION__=${JSON.stringify(databaseLocation.origin)}
          document.getElementById("__EXPOSE__").remove()
        </script>
      </body>
    </html>
  `)
})

app.get("/plattform/zugang/plattformentwickler/registrieren/", Request.verifySession, Request.verifyRole(0), async (req, res) => {
  const {user} = await User.find(it => it.id === req.user.id)
  if (user === undefined) return res.redirect(req.redirectPath)
  if (user.name !== undefined) return res.redirect(`/${user.name}/`)
  return res.send(/*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zugang für Plattformentwickler</title>
      </head>
      <body>

        <h1 class="title">Herzlich Willkommen auf getyour plattform</h1>
        <p class="info">Ich bin Droid, dein persönlicher Assistent. Es scheint als würdest du dich das erste mal anmelden. Ich benötige noch einige Informationen, um dich auf die Plattform vorzubereiten.</p>

        <div class="create-name"></div>
        <div class="preview-url">https://get-your.de/</div>

        <div class="create-password"></div>
        <div class="confirm-password"></div>
        <div class="register-button"></div>

        <script type="module" src="./index.js"></script>
        <script id="__EXPOSE__">
          window.__DATABASE_LOCATION__=${JSON.stringify(databaseLocation.origin)}
          document.getElementById("__EXPOSE__").remove()
        </script>
      </body>
    </html>
  `)
})

app.get("/plattform/zugang/plattformentwickler/anmelden/", (req, res) => {
  return res.send(/*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zugang für Plattformentwickler</title>
      </head>
      <body>

        <h1 class="title">Anmeldung zum Plattformentwickler</h1>
        <p class="info">Als Plattformentwickler hast du die Möglichkeit Plattformen zu entwickeln.</p>

        <div class="create-email"></div>
        <div class="login-button"></div>

        <script type="module" src="./index.js"></script>
        <script id="__EXPOSE__">
          window.__AUTH_LOCATION__=${JSON.stringify(authLocation.origin)}
          window.__DATABASE_LOCATION__=${JSON.stringify(databaseLocation.origin)}
          document.getElementById("__EXPOSE__").remove()
        </script>
      </body>
    </html>
  `)
})

app.use(express.static(clientLocation.absolutePath))

app.listen(clientLocation.port, () => Notification.warn(`client listening on ${clientLocation.origin}`))
