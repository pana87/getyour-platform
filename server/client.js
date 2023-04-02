const express = require('express')
const cookieParser = require('cookie-parser')
const { clientLocation, docsLocation } = require('../config/ServerLocation.js')
const { Helper } = require('../lib/Helper.js')
const { Request } = require('../lib/Request.js')
const { UserRole } = require('../lib/UserRole.js')
const crypto = require("node:crypto")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

const database = "getyour"
Helper.createDatabase(database)
Helper.createUsers(database)
Helper.createLogs(database)


const app = express()
app.use(cookieParser())
app.use(express.json({limit: "50mb"}))
app.use(Helper.removeCookies)

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})

// static first
app.use("/docs/", express.static(docsLocation.absolutePath))
app.use(express.static(clientLocation.absolutePath))


app.get("/logs/:type/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.verifyRoles([UserRole.PLATFORM_DEVELOPER]),
  Request.verifyId,
async (req, res) => {
  try {

    if (req.params.type === "error") {
      const doc = await nano.db.use("getyour").get("logs")
      const errors = []
      for (let i = 0; i < doc.logs.length; i++) {
        if (doc.logs[i].type === req.params.type) {
          errors.push(doc.logs[i])
        }
      }
      return res.send(errors)
    }

    if (req.params.type === "user") {
      const doc = await nano.db.use("getyour").get("users")
      return res.send(doc.users)
    }

  } catch (error) {
    await Helper.logError(error, req)
  }

  return res.sendStatus(404)
})


app.get("/cookies/anzeigen/", async (req, res) => {
  try {
    return res.send(req.cookies)

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/cookies/entfernen/", async (req, res) => {
  try {
    Object.keys(req.cookies).forEach((cookieName) => {
      res.clearCookie(cookieName)
    })
    return res.sendStatus(200)

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/felix/shs/:path/", async(req, res, next) => {
  try {

    if (req.params.path === "impressum") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.path}.html`))
    if (req.params.path === "hersteller-vergleich") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.path}.html`))

    if (req.params.path === "qualifizierung") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.path}.html`))
    if (req.params.path === "abfrage-haus") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.path}.html`))
    if (req.params.path === "abfrage-heizung") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.path}.html`))
    if (req.params.path === "abfrage-strom") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.path}.html`))
    if (req.params.path === "abfrage-technisches") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.path}.html`))
    if (req.params.path === "abfrage-persoenliches") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.path}.html`))

    return next()
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/felix/shs/:urlId/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
  Request.verifyId,
async(req, res) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/shs-checklist.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/felix/shs/:urlId/print/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
  Request.verifyId,
async (req, res) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-drucken.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/felix/shs/:urlId/sign/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
  Request.verifyId,
async (req, res) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-digital-unterschreiben.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})



app.get("/felix/shs/:urlId/:itemIndex/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
  Request.verifyId,
async(req, res) => {

  try {
    if (req.params.itemIndex === "0") {
      return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-ansicht.html"))
    }
    if (req.params.itemIndex === "1") {
      return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-hochladen.html"))
    }

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)

})

app.get("/pana/getyour/entwickler-registrieren/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.PLATFORM_DEVELOPER]),
  Request.verifyId,
async(req, res) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-entwickler-registrieren.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})


app.get("/pana/getyour/zugang/", async(req, res) => {

  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-plattform-zugang.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)

})


// because express root is not serving any css or js files
app.get("/", (req, res) => res.redirect("/home/"))


app.post("/producer/v1/",

  // security level closed
  Request.requireJwtToken,
  Request.verifySession,
  Request.verifyId,
  Request.verifyRoles([UserRole.PLATFORM_DEVELOPER]),







  // interactions
  Request.verifyName,
  Request.registerName,

  Request.getPlatforms,
  Request.getErrors,

  Request.render,
async(req, res) => {
  return res.sendStatus(404)
})

app.post("/consumer/open/",
  Request.verifyId,
  Request.registerEmail,
  Request.registerVerified,
  Request.redirectUser,
  Request.getFunnel,
  Request.createOffer,
  Request.getPlatforms,
  Request.registerRole,
async(req, res) => {
  return res.sendStatus(404)
})

app.post(`/consumer/${UserRole.OPERATOR}/closed/`,

  Request.requireJwtToken,
  Request.verifySession,
  Request.verifyId,
  Request.verifyRoles([UserRole.OPERATOR]),

  Request.registerFunnel,
  Request.registerOffer,
  Request.registerChecklist,
  Request.registerLead,

  Request.getChecklist,
  Request.getOffer,
async(req, res) => {
  return res.sendStatus(404)
})


app.post("/request/register/session/",
  Request.verifyId,

async (req, res) => {
  try {
    const {localStorageId, event} = req.body
    const {doc, user} = await Helper.findUser(user => user.id === localStorageId)
    if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
    if (Helper.stringIsEmpty(user.id)) throw new Error("user id is empty")

    if (event === "onlogin") {
      if (Helper.arrayIsEmpty(user.roles)) return res.sendStatus(200)
    }
    if (Helper.arrayIsEmpty(user.roles)) throw new Error("user roles is empty")

    const salt = Helper.generateRandomBytes(32)
    if (Helper.arrayIsEmpty(salt)) throw new Error("salt is empty")
    const jwtToken = jwt.sign({
      roles: user.roles,
      id: user.id,
    }, process.env.JWT_SECRET, { expiresIn: '2h' })
    if (Helper.stringIsEmpty(jwtToken)) throw new Error("jwt token is empty")
    const saltDigest = Helper.digest(JSON.stringify(salt))
    if (Helper.stringIsEmpty(saltDigest)) throw new Error("salt digest is empty")
    const jwtTokenDigest = Helper.digest(jwtToken)
    if (Helper.stringIsEmpty(jwtTokenDigest)) throw new Error("jwt token digest is empty")
    const sessionToken = Helper.digest(JSON.stringify({
      id: user.id,
      pin: randomPin,
      salt: saltDigest,
      jwt: jwtTokenDigest,
    }))
    if (Helper.stringIsEmpty(sessionToken)) throw new Error("session token is empty")


    if (user.session === undefined) {
      user.session = {}
      user.session.createdAt = Date.now()
      user.session.pin = randomPin
      user.session.salt = saltDigest
      user.session.jwt = jwtTokenDigest
      user.session.counter = 1
    } else {
      user.session.session = {}
      user.session.createdAt = Date.now()
      user.session.pin = randomPin
      user.session.salt = saltDigest
      user.session.jwt = jwtTokenDigest
      user.session.counter = user.session.counter + 1
    }
    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })


    const sessionLength = 120 * 60000
    res.cookie("jwtToken", jwtToken, {
      maxAge: sessionLength,
      httpOnly: true,
      sameSite: "lax",
    })
    res.cookie("sessionToken", sessionToken, {
      maxAge: sessionLength,
      httpOnly: true,
      sameSite: "lax",
    })
    return res.sendStatus(200)
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.post("/request/verify/pin/",
async (req, res) => {
  try {
    const {userPin} = req.body
    if (Helper.stringIsEmpty(userPin)) throw new Error("user pin is empty")
    if (Helper.stringIsEmpty(randomPin)) throw new Error("random pin is empty")
    if (userPin !== randomPin) throw new Error("user pin is not valid")
    if (expiredTimeMs < Date.now()) throw new Error("user pin expired")
    return res.sendStatus(200)
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

let expiredTimeMs
let randomPin
app.post("/request/send/email/with/pin/",
async (req, res) => {
  try {
    const {email} = req.body
    if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
    randomPin = Helper.digest(crypto.randomBytes(32))
    expiredTimeMs = Date.now() + (2 * 60 * 1000)

    await Helper.sendEmailFromDroid({
      from: "<droid@get-your.de>",
      to: email,
      subject: "[getyour plattform] Deine PIN",
      html: /*html*/`
        <p>PIN: ${randomPin}</p>
        <p>Sollten Sie gerade nicht versucht haben sich unter https://get-your.de anzumelden, dann erhalten Sie diese E-Mail, weil jemand anderes versucht hat sich mit Ihrer E-Mail Adresse anzumelden. In dem Fall löschen Sie die E-Mail mit der PIN und <span style="color: #d50000; font-weight: bold;">geben Sie die PIN auf keinen Fall weiter.</span></p>
        <p>Wenn Sie Ihre PIN mit anderen teilen, besteht die Gefahr, dass unbefugte Personen Zugang zu Ihrem Konto erhalten und Ihre Sicherheit gefährden. Daher ist es wichtig, Ihre PIN vertraulich zu behandeln und sicherzustellen, dass Sie sie nur selbst verwenden.</p>
        <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
      `
    })
    return res.sendStatus(200)
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})


app.get("/home/", async (req, res, next) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-login.html"))
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/impressum/", async (req, res, next) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-impressum.html"))
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/datenschutz/", async (req, res, next) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-datenschutz.html"))
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/nutzervereinbarung/", async (req, res, next) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-nutzervereinbarung.html"))
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/:username/",
async (req, res, next) => {
  try {
    const {user} = await Helper.findUser(user => user.name === req.params.username)
    if (Helper.stringIsEmpty(user.name)) throw new Error("user name is empty")
    return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-profile-page.html"))
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})


app.listen(clientLocation.port, () => console.log(`[getyour] client listening on ${clientLocation.origin}`))
