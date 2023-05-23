const express = require('express')
const cookieParser = require('cookie-parser')
const { clientLocation, docsLocation } = require('../config/ServerLocation.js')
const { Helper } = require('../lib/Helper.js')
const { Request } = require('../lib/Request.js')
const { UserRole } = require('../lib/UserRole.js')
const crypto = require("node:crypto")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

Helper.createDatabase("getyour")
Helper.createUsers("getyour")
Helper.createLogs("getyour")

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

// let cookiesRemoved
// app.use((req, res, next) => {
//   if (cookiesRemoved === undefined) {
//     for (const cookie in req.cookies) {
//       res.clearCookie(cookie)
//     }
//     cookiesRemoved = true
//   }
//   next()
// })

// app.use(async(req, res, next) => {
//   try {
//     await Helper.logRequest(req)
//     next()
//   } catch (error) {
//     await Helper.logError(error, req)
//   }
//   return res.sendStatus(404)
// })


// static first
app.use("/docs/", express.static(docsLocation.absolutePath))
app.use(express.static(clientLocation.absolutePath))




app.get("/logs/:type/",
  Request.verifyJwtToken,
  Request.verifySession,
  Request.verifyRoles([UserRole.ADMIN]),
  Request.verifyJwtId,
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

app.get("/", async (req, res, next) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/home.html"))
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/:platform/", async (req, res, next) => {
  try {
    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")

    if (Helper.stringIsEmpty(req.params.platform)) throw new Error("req.params.platform is empty")
    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]
      if (user[req.params.platform] !== undefined) {
        if (user[req.params.platform].stats !== undefined) {
          return res.send(`<div style="display: flex; justify-content: center; align-items: center; height: 89vh; font-family: sans-serif;">Plattform Statistiken sind bald verfügbar.</div>`)
        }
      }
    }

    return next()
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/:expert/", async (req, res, next) => {
  try {
    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")

    if (Helper.stringIsEmpty(req.params.expert)) throw new Error("req.params.expert is empty")
    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]
      if (user["getyour"] !== undefined) {
        if (user["getyour"].expert.name === req.params.expert) {
          return res.send(Helper.readFileSyncToString("../lib/value-units/expert.html"))
        }
      }
    }

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

// app.get("/getyour/pana/toolbox-alpha/",
// async(req, res) => {
//   try {
//     return res.send(Helper.readFileSyncToString("../lib/value-units/toolbox.html"))

//   } catch (error) {
//     await Helper.logError(error, req)
//   }
//   return res.sendStatus(404)
// })

app.get("/getyour/pana/toolbox/",
  Request.verifyJwtToken,
  Request.verifySession,
  Request.verifyRoles([UserRole.ADMIN]),
  Request.verifyJwtId,
async(req, res) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/toolbox.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/getyour/pana/admin/",
  Request.verifyJwtToken,
  Request.verifySession,
  Request.verifyRoles([UserRole.ADMIN]),
  Request.verifyJwtId,
async(req, res) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/admin.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/:platform/:expert/:path/",
async(req, res, next) => {
  try {
    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")

    if (req.params.expert === "pana") {
      if (req.params.platform === "getyour") {
        if (req.params.path === "login") return res.send(Helper.readFileSyncToString(`../lib/value-units/login.html`))
        if (req.params.path === "nutzervereinbarung") return res.send(Helper.readFileSyncToString(`../lib/value-units/nutzervereinbarung.html`))
        if (req.params.path === "impressum") return res.send(Helper.readFileSyncToString(`../lib/value-units/impressum.html`))
        if (req.params.path === "datenschutz") return res.send(Helper.readFileSyncToString(`../lib/value-units/datenschutz.html`))
      }
    }

    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]
      if (user["getyour"] !== undefined) {
        if (user["getyour"].expert.name === req.params.expert) {
          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
            const platform = user["getyour"].expert.platforms[i]
            if (platform.name === req.params.platform) {
              if (platform.visibility === "open") {
                for (let i = 0; i < platform.values.length; i++) {
                  const value = platform.values[i]
                  if (value.path.split("/")[3] === req.params.path) {
                    if (value.visibility === "open") {
                      return res.send(value.html)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return next()
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/:platform/:expert/:path/",
  Request.verifyJwtToken,
  Request.verifyJwtId,
  Request.verifySession,
async (req, res, next) => {
  try {

    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")

    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]
      if (user.id === req.jwt.id) {
        if (user["getyour"] !== undefined) {

          if (user["getyour"].expert.name === req.params.expert) {
            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
              const platform = user["getyour"].expert.platforms[i]
              if (platform.name === req.params.platform) {
                for (let i = 0; i < platform.values.length; i++) {
                  const value = platform.values[i]
                  if (value.path === `/${req.params.platform}/${req.params.expert}/${req.params.path}/`) {
                    return res.send(value.html)
                  }
                }
              }
            }
          }

          if (user["getyour"].expert.name !== req.params.expert) {
            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
              const platform = user["getyour"].expert.platforms[i]



              if (platform.name === req.params.platform) {



                if (platform.visibility === "open") {
                  for (let i = 0; i < platform.values.length; i++) {
                    const value = platform.values[i]
                    if (value.path === `/${req.params.platform}/${req.params.expert}/${req.params.path}/`) {

                      if (value.visibility === "closed") {
                        for (let i = 0; i < value.authorized.length; i++) {
                          const authorized = value.authorized[i]
                          if (req.jwt.id === authorized) {
                            return res.send(value.html)
                          }
                        }

                        for (let i = 0; i < value.roles.length; i++) {
                          const authorized = value.roles[i]
                          for (let i = 0; i < user.roles.length; i++) {
                            const role = user.roles[i]
                            if (role === authorized) {
                              return res.send(value.html)
                            }
                          }
                        }
                      }

                    }
                  }
                }




              }
            }
          }
        }
      }
    }

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.post("/request/register/session/",
  Request.verifyLocation,
async (req, res) => {
  try {
    const {localStorageId, event} = req.body
    const {doc, user} = await Helper.findUser(user => user.id === localStorageId)
    if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
    if (Helper.stringIsEmpty(user.id)) throw new Error("user id is empty")
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
      user.session.pin = randomPin
      user.session.salt = saltDigest
      user.session.jwt = jwtTokenDigest
      user.session.modified = Date.now()
      user.session.counter = 1
    } else {
      user.session.pin = randomPin
      user.session.salt = saltDigest
      user.session.jwt = jwtTokenDigest
      user.session.modified = Date.now()
      user.session.counter = user.session.counter + 1
    }
    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })

    const cookies = Object.keys(req.cookies)
    cookies.forEach((cookie) => {
      res.cookie(cookie, '', { expires: new Date(0) })
      res.clearCookie(cookie)
    })

    const sessionLength = 120 * 60000
    res.cookie("jwtToken", jwtToken, {
      maxAge: sessionLength,
      httpOnly: true,
      sameSite: "Lax",
    })
    res.cookie("sessionToken", sessionToken, {
      maxAge: sessionLength,
      httpOnly: true,
      sameSite: "Lax",
    })
    return res.sendStatus(200)
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/getyour/pana/:randomDigest/",
async (req, res) => {
  try {

    if (EMAIL_TO_INVITE_TIMER < Date.now()) throw new Error("email to invite timer expired")
    if (req.params.randomDigest === EMAIL_TO_INVITE_RANDOM_DIGEST) {
      EMAIL_TO_INVITE_RANDOM_DIGEST = undefined
      return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-einladung-verifizieren.html"))
    }

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

let EMAIL_TO_INVITE_RANDOM_PIN
let EMAIL_TO_INVITE_RANDOM_DIGEST
let EMAIL_TO_INVITE_TIMER
let EMAIL_TO_INVITE
let ROLE_TO_INVITE
let NAME_TO_INVITE
app.post(`/invite/email/`,

  Request.verifyLocation,

  Request.verifyJwtToken,
  Request.verifySession,
  Request.verifyClosedPostRequest,
  Request.verifyRoles([UserRole.ADMIN]),
  Request.verifyAdmin,

async(req, res) => {
  try {

    const {emailToInvite, role} = req.body
    if (Helper.stringIsEmpty(emailToInvite)) throw new Error("email to invite is empty")
    if (Helper.numberIsEmpty(role)) throw new Error("role is empty")

    if (role === UserRole.EXPERT) {
      const {name} = req.body
      if (Helper.stringIsEmpty(name)) throw new Error("name is empty")

      EMAIL_TO_INVITE_RANDOM_PIN = Helper.digest(crypto.randomBytes(32))
      EMAIL_TO_INVITE_RANDOM_DIGEST = Helper.digest(crypto.randomBytes(32))
      EMAIL_TO_INVITE_TIMER = Date.now() + (2 * 60 * 1000)
      EMAIL_TO_INVITE = emailToInvite
      ROLE_TO_INVITE = role
      NAME_TO_INVITE = name

      await Helper.sendEmailFromDroid({
        from: "<droid@get-your.de>",
        to: EMAIL_TO_INVITE,
        subject: "[getyour plattform] Admin Einladung",
        html: /*html*/`
          <p>PIN: ${EMAIL_TO_INVITE_RANDOM_PIN}</p>
          <p>Sie wurden von einem Admin eingeladen sich als Branchenexperte mit dem Namen '' auf der Getyour Plattform zu registrieren. Kopieren Sie den PIN und <a href="${clientLocation.origin}/pana/getyour/${EMAIL_TO_INVITE_RANDOM_DIGEST}/">klicken Sie hier, um Ihre PIN zu verifizieren.</a></p>
          <p>Sollten Sie nicht wissen, warum Sie diese E-Mail erhalten, dann ignorieren Sie diese E-Mail. Sollte es öfters vorkommen, dann kontaktieren Sie uns bitte umgehend unter datenschutz@get-your.de</p>
          <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
        `
      })
      return res.sendStatus(200)

    }



  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.post("/request/verify/pin/",
  Request.verifyLocation,
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
  Request.verifyLocation,
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
        <p>Sollten Sie gerade nicht versucht haben sich unter https://www.get-your.de anzumelden, dann erhalten Sie diese E-Mail, weil jemand anderes versucht hat sich mit Ihrer E-Mail Adresse anzumelden. In dem Fall löschen Sie die E-Mail mit der PIN und <span style="color: #d50000; font-weight: bold;">geben Sie die PIN auf keinen Fall weiter.</span></p>
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

app.post(`/:method/:type/:event/`,
  Request.verifyLocation,

  Request.verifyEvent,

  Request.get,
  Request.register,

async(req, res, next) => {
  return next()
})

app.post(`/:method/:type/:event/`,

  Request.verifyJwtToken,
  Request.verifyJwtId,
  Request.verifySession,

  Request.redirect,
  Request.get,

async(req, res) => {
  return res.sendStatus(404)
})

app.post(`/:method/:type/:event/:role/`,

  Request.verifyLocation,

  Request.verifyEvent,

  Request.verifyJwtToken,
  Request.verifyJwtId,
  Request.verifySession,

  Request.verifyRole,

  Request.get,
  Request.register,
  Request.send,
  Request.redirect,
  Request.delete,

  Request.verify,
async(req, res) => {
  return res.sendStatus(404)
})

app.listen(clientLocation.port, () => console.log(`[getyour] client listening on ${clientLocation.origin}`))
