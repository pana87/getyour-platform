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

app.use((req, res, next) => {
  for (const cookie in req.cookies) {
    if (cookie === "jwtToken") continue
    if (cookie === "sessionToken") continue
    res.cookie(cookie, '', { expires: new Date(0) })
    res.clearCookie(cookie)
  }
  next()
})

app.use("/docs/", express.static(docsLocation.absolutePath))
app.use(express.static(clientLocation.absolutePath))

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

app.get("/admin/",
  Request.verifyJwtToken,
  Request.verifySession,
  Request.verifyRoles([UserRole.ADMIN]),
  Request.verifyVerified,
async(req, res) => {
  try {
    return res.send(Helper.readFileSyncToString("../lib/value-units/admin.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/:expert/", async (req, res, next) => {
  try {

    if (req.params.expert === "login") return res.send(Helper.readFileSyncToString("../lib/value-units/login.html"))
    if (req.params.expert === "nutzervereinbarung") return res.send(Helper.readFileSyncToString(`../lib/value-units/nutzervereinbarung.html`))
    if (req.params.expert === "impressum") return res.send(Helper.readFileSyncToString(`../lib/value-units/impressum.html`))
    if (req.params.expert === "datenschutz") return res.send(Helper.readFileSyncToString(`../lib/value-units/datenschutz.html`))

    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")

    if (Helper.stringIsEmpty(req.params.expert)) throw new Error("req.params.expert is empty")
    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]
      if (user["getyour"] !== undefined) {
        if (user["getyour"].expert !== undefined) {
          if (user["getyour"].expert.name === req.params.expert) {
            return res.send(Helper.readFileSyncToString("../lib/value-units/expert.html"))
          }
        }
      }
    }

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/:expert/:platform/:path/",
async(req, res, next) => {
  try {
    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")

    // is all open algo
    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]
      if (user["getyour"] !== undefined) {

        if (user["getyour"].expert !== undefined) {

          if (user["getyour"].expert.name === req.params.expert) {

            if (user.verified === true) {

              if (user["getyour"].expert.platforms !== undefined) {

                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                  const platform = user["getyour"].expert.platforms[i]
                  if (platform.name === req.params.platform) {
                    if (platform.visibility === "open") {


                      if (platform.values !== undefined) {

                        for (let i = 0; i < platform.values.length; i++) {
                          const value = platform.values[i]
                          if (value.path === `/${req.params.expert}/${req.params.platform}/${req.params.path}/`) {
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

app.get("/:expert/:platform/:path/",
  Request.verifyJwtToken,
  Request.verifySession,
  // closed context
async (req, res, next) => {
  try {

    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")

    // is expert algo
    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]
      if (user.id === req.jwt.id) {

        if (user["getyour"] !== undefined) {
          if (user["getyour"].expert !== undefined) {

            if (user["getyour"].expert.name === req.params.expert) {

              if (user["getyour"].expert.platforms !== undefined) {

                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                  const platform = user["getyour"].expert.platforms[i]
                  if (platform.name === req.params.platform) {


                    if (platform.values !== undefined) {

                      for (let i = 0; i < platform.values.length; i++) {
                        const value = platform.values[i]
                        if (value.path === `/${req.params.expert}/${req.params.platform}/${req.params.path}/`) {
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

    // is unknown algo
    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]

      if (user["getyour"] !== undefined) {
        if (user["getyour"].expert !== undefined) {

          if (user["getyour"].expert.name === req.params.expert) {

            if (user["getyour"].expert.platforms !== undefined) {

              for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                const platform = user["getyour"].expert.platforms[i]



                if (platform.name === req.params.platform) {



                  if (platform.visibility === "open") {
                    if (platform.values !== undefined) {

                      for (let i = 0; i < platform.values.length; i++) {
                        const value = platform.values[i]
                        if (value.path === `/${req.params.expert}/${req.params.platform}/${req.params.path}/`) {

                          if (value.visibility === "closed") {

                            if (value.authorized !== undefined) {

                              for (let i = 0; i < value.authorized.length; i++) {
                                const authorized = value.authorized[i]

                                for (let i = 0; i < doc.users.length; i++) {
                                  const user = doc.users[i]

                                  if (user.id === req.jwt.id) {

                                    if (user.email === authorized) {
                                      return res.send(value.html)
                                    }

                                  }

                                }
                              }

                            }

                            if (value.roles !== undefined) {

                              for (let i = 0; i < value.roles.length; i++) {
                                const authorized = value.roles[i]

                                for (let i = 0; i < doc.users.length; i++) {
                                  const user = doc.users[i]

                                  if (user.id === req.jwt.id) {

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
    // const {localStorageId, event} = req.body




    // const {doc, user} = await Helper.findUser(user => user.id === localStorageId)



    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")



    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]

      if (user.id === req.body.localStorageId) {

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

      }

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


    // add this in login info
    // Request with email


    // <p>Sollten Sie gerade nicht versucht haben sich unter https://www.get-your.de anzumelden, dann erhalten Sie diese E-Mail, weil jemand anderes versucht hat sich mit Ihrer E-Mail Adresse anzumelden. In dem Fall löschen Sie die E-Mail mit der PIN und <span style="color: #d50000; font-weight: bold;">geben Sie die PIN auf keinen Fall weiter.</span></p>
    // <p>Wenn Sie Ihre PIN mit anderen teilen, besteht die Gefahr, dass unbefugte Personen Zugang zu Ihrem Konto erhalten und Ihre Sicherheit gefährden. Daher ist es wichtig, Ihre PIN vertraulich zu behandeln und sicherzustellen, dass Sie sie nur selbst verwenden.</p>
    // <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>


    await Helper.sendEmailFromDroid({
      from: "<droid@get-your.de>",
      to: email,
      subject: "[getyour plattform] Deine PIN",
      html: /*html*/`
        <p>PIN: ${randomPin}</p>
      `
    })
    return res.sendStatus(200)
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.post(`/:method/:type/:event/`,

  // event defines context
  // context = specific state of user

  // open context
  Request.verify,
  Request.get,



  Request.verifyReferer,
  Request.verifyLocation,
  // location context

  Request.register,
  Request.get,
  Request.delete,

async(req, res, next) => {
  return next()
})

app.post(`/:method/:type/:event/`,

  Request.verifyJwtToken,
  Request.verifySession,
  // jwt context

  // Request.verifyRole, ???


  Request.verify,


  // closed and verified doing duplicate things
  Request.verifyClosed,
  // closed context

  Request.update,
  Request.register,
  Request.delete,
  Request.get,
  Request.redirect,


async(req, res) => {
  return res.sendStatus(404)
})

app.post(`/:method/:type/:event/:role/`,

  Request.verifyLocation,

  // Request.verifyEvent,

  Request.verifyJwtToken,
  Request.verifyVerified,
  Request.verifySession,

  Request.verifyRole,

  Request.get,
  Request.register,
  Request.send,
  Request.redirect,
  Request.delete,
  Request.verify,
  Request.update,
async(req, res) => {
  return res.sendStatus(404)
})

app.listen(clientLocation.port, () => console.log(`[getyour] client listening on ${clientLocation.origin}`))
