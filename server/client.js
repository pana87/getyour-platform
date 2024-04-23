const express = require('express')
const cookieParser = require('cookie-parser')
const {Helper} = require('../lib/Helper.js')
const { Request } = require('../lib/Request.js')
const { UserRole } = require('../lib/UserRole.js')
const crypto = require("node:crypto")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage})
const path = require("node:path")
const http = require("node:http")
const {startWebRtcSignaling} = require("./webrtc-signaling.js")
const createExpressServer = Helper.createExpressServer()

Helper.createDatabase("getyour")
Helper.createUsers("getyour")
Helper.createLogs("getyour")

const client = createExpressServer("client", process.env.CLIENT_PORT || "9999")
const app = client.app

// todo websocket for webrtc
// const server = http.createServer(app)
// startWebRtcSignaling(server)
// app.use(async (req, res, next) => {
//   try {
//     await next();
//   } catch (error) {
//     console.error("Unerwarteter Fehler aufgetreten:", error);
//     res.status(500).send("Ein interner Serverfehler ist aufgetreten");
//   }
// })

app.use(cookieParser())
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(Helper.removeCookies)

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})

app.use("/docs/", express.static(path.join(__dirname, "..", "docs")))
app.use(express.static(path.join(__dirname, "..", "client")))

app.get("/cookies/", async (req, res) => {
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
      res.cookie(cookieName, "", { expires: new Date(Date.now()) })
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

    return res.redirect("/")

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

let counter = 0
app.get("/:expert/:platform/:path/",
async(req, res, next) => {
  try {


    counter++;
    await Helper.log(`${req.originalUrl} Endpunkt wurde ${counter} mal aufgerufen.`, req, res, next)

    await Helper.log("Starte Datenbankoperation 1", req, res, next);
    const db = nano.db.use("getyour");
    const doc = await db.get("users");
    if (!doc) throw new Error("Dokument 'users' wurde nicht gefunden.");
    // await Helper.log("Dokument erfolgreich abgerufen", doc, req, res, next);
    await Helper.log(doc._rev, req, res, next);
    // try {
    // } catch (error) {
    //     await Helper.error("Fehler aufgetreten:", error, req, res, next);
    // }
    await Helper.log("Datenbankoperation abgeschlossen", req, res, next);



    // counter++
    //
    // try {
    //   console.log("Verbindung zur Datenbank herstellen.");
    //   const db = nano.db.use("getyour");
    //   console.log("Versuche, das 'users' Dokument abzurufen...");
    //   const doc = await db.get("users");
    //   console.log(doc);
    //   console.log("Dokument erfolgreich abgerufen:", doc._rev);
    //   if (!doc) {
    //       throw new Error("Dokument 'users' wurde nicht gefunden.");
    //   }
    //   // Weiterer Code, der `doc` verwendet
    // } catch (error) {
    //     console.error("Fehler aufgetreten:", error);
    // }

    // console.log("hi");
    //
    // console.log(counter);

    // const doc = await nano.db.use("getyour").get("users")
    // await Helper.log(doc._id, req, res, next)


    // middleware functions for doc
    const result = await registerPlatformValueRequested(doc, req)
    await Helper.log(`registerPlatformValueRequested result: ${JSON.stringify(result)}`, req, res, next);
    if (result.status === 200) {
      return res.send(result.html)
    } else {
      // requested konnte nicht geupdated werden
      // das ist nur wenn open
      const html = getPlatformValueHtml(doc, req)
      await Helper.log(`getPlatformValueHtml result: ${html}`, req, res, next);

      if (!Helper.verifyIs("text/empty", html)) return res.send(html)
    }


    async function registerPlatformValueRequested(doc, req) {

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
                          let counter = 0
                          for (let i = 0; i < platform.values.length; i++) {
                            const value = platform.values[i]
                            if (value.path === req.originalUrl) {
                              if (value.visibility === "open") {
                                if (value.requested === undefined) value.requested = []
                                value.requested.push({created: Date.now()})





                                // hier geht er wieder in nano
                                counter++
                                await Helper.log(`Schleifen counter vor insert ${counter}`, req, res, next)

                                await Helper.log(`Beginne mit insert Funktion um requested upzudaten.. _rev davor: ${doc._rev}`, req, res, next)


                                // insert in try catch
                                try {
                                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                  await Helper.log(`Insert Funktion wurde erfolgreich abgeschlossen.. _rev danach: ${doc._rev}`, req, res, next)
                                  return { status: 200, html: value.html }
                                } catch (error) {
                                  return { status: 500, error }
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
    // getPlatformValuePath(doc, platformName, valuePath)




    // bis hier hin kommt er ohne fehler



    function getPlatformValueHtml(doc, req) {
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
                          let counter = 0
                          for (let i = 0; i < platform.values.length; i++) {
                            const value = platform.values[i]
                            if (value.path === req.originalUrl) {
                              if (value.visibility === "open") {
                                return value.html
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

    // soweit kommt er noch nicht


    await Helper.log("Endpunkt ist nicht open.. Starte Funktion: next()", req, res, next);



    // anstatt next alles in ein endpunkt
    // und if schleifen definieren wann es weiter gehen muss
    // wenn keine bedingung erfüllt ist dann nichts machen
    // extra logger bauen wie logError
    return next()
    // if (!res.headersSent) {
    // }
    // console.log(counter);

  } catch (error) {
    await Helper.logError(error, req)
    return res.sendStatus(404)
  }
})

app.get("/:expert/:platform/:path/",
  Request.verifyJwtToken,
  Request.verifySession,
async (req, res, next) => {
  try {
    await Helper.log("Beginne mit closed Endpunkt..", req, res, next);

    // console.log("hi");
    await Helper.log("Starte Datenbankoperation 2", req, res, next);
    const db = nano.db.use("getyour");
    const doc = await db.get("users");
    if (!doc) throw new Error("Dokument 'users' wurde nicht gefunden.");
    // await Helper.log("Dokument erfolgreich abgerufen", doc, req, res, next);
    await Helper.log(doc._rev, req, res, next);
    // try {
    // } catch (error) {
    //     await Helper.error("Fehler aufgetreten:", error, req, res, next);
    // }
    await Helper.log("Datenbankoperation abgeschlossen", req, res, next);



    for (let i = 0; i < doc.users.length; i++) {
      const jwtUser = doc.users[i]
      if (jwtUser.id === req.jwt.id) {
        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]
          if (user["getyour"] !== undefined) {
            if (user["getyour"].expert !== undefined) {
              if (user["getyour"].expert.name === req.params.expert) {
                if (user["getyour"].expert.platforms !== undefined) {
                  for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                    const platform = user["getyour"].expert.platforms[i]
                    if (platform.values !== undefined) {
                      for (let i = 0; i < platform.values.length; i++) {
                        const value = platform.values[i]
                        if (value.path === req.originalUrl) {
                          if (value.writability !== undefined) {
                            for (let i = 0; i < value.writability.length; i++) {
                              const authorized = value.writability[i]
                              if (jwtUser.email === authorized) {
                                if (value.requested === undefined) value.requested = []
                                value.requested.push({created: Date.now()})
                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
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
                        if (value.path === req.originalUrl) {
                          if (value.requested === undefined) value.requested = []
                          value.requested.push({created: Date.now()})
                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
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

    // is visible algo
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
                        if (value.path === req.originalUrl) {
                          if (value.visibility === "closed") {
                            if (value.authorized !== undefined) {
                              for (let i = 0; i < value.authorized.length; i++) {
                                const authorized = value.authorized[i]
                                for (let i = 0; i < doc.users.length; i++) {
                                  const user = doc.users[i]
                                  if (user.id === req.jwt.id) {
                                    if (user.email === authorized) {
                                      if (value.requested === undefined) value.requested = []
                                      value.requested.push({created: Date.now()})
                                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
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
                                        if (value.requested === undefined) value.requested = []
                                        value.requested.push({created: Date.now()})
                                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
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


    await Helper.log("Keinen passenden User gefunden.. Leite weiter zur Startseite", req, res, next);


    return res.redirect("/")

    // if (!res.headersSent) {
    //   // const doc = await nano.db.use("getyour").get("users")
    //
    //   // is writable algo
    // }

  } catch (error) {
    await Helper.logError(error, req)
    return res.sendStatus(404)
  }
})

app.post("/register/session/",
  Request.verifyLocation,
async (req, res) => {
  try {

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

app.post("/verify/pin/",
  Request.verifyLocation,
async (req, res) => {
  try {

    for (let i = 0; i < loginQueue.length; i++) {
      const login = loginQueue[i]
      if (login.expired < Date.now()) {
        loginQueue.splice(i, 1)
      }
    }

    const doc = await nano.db.use("getyour").get("users")
    if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
    if (doc.users === undefined) throw new Error("users is undefined")

    const {userPin} = req.body
    if (Helper.stringIsEmpty(userPin)) throw new Error("user pin is empty")
    for (let i = 0; i < loginQueue.length; i++) {
      const login = loginQueue[i]

      if (login.pin === userPin) {
        if (login.expired < Date.now()) throw new Error("login expired")
        if (Helper.stringIsEmpty(login.pin)) throw new Error("pin is empty")
        if (userPin !== login.pin) throw new Error("pin is invalid")

        // verify pin then register session
        randomPin = login.pin

        return res.sendStatus(200)

      }

    }


  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

let randomPin
const loginQueue = []
app.post("/send/email/with/pin/",
  Request.verifyLocation,
async (req, res) => {
  try {
    const {email} = req.body
    if (Helper.stringIsEmpty(email)) throw new Error("email is empty")

    for (let i = 0; i < loginQueue.length; i++) {
      const login = loginQueue[i]
      if (login.expired < Date.now()) {
        loginQueue.splice(i, 1)
      }
    }

    const login = {}
    login.pin = Helper.digest(crypto.randomBytes(32))
    login.expired = Date.now() + (2 * 60 * 1000)

    await Helper.sendEmailFromDroid({
      from: "<droid@get-your.de>",
      to: email,
      subject: "[getyour plattform] Deine PIN",
      html: `<p>PIN: ${login.pin}</p>`
    })

    loginQueue.push(login)

    return res.sendStatus(200)
  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.post(`/upload/:type/self/`,

  Request.verifyJwtToken,
  Request.verifySession,

  upload.any(),

  Request.upload,

async(req, res, next) => {
  return res.sendStatus(404)
})

app.post(`/:method/:type/:event/`,

  // open context
  Request.verifyLocation,
  Request.verifyReferer,

  Request.redirect,
  Request.verify,
  Request.get,
  Request.register,
  Request.remove,

async(req, res, next) => {
  return next()
})

app.post(`/:method/:type/:event/`,

  // closed context
  Request.verifyJwtToken,
  Request.verifySession,

  Request.redirect,
  Request.verify,
  Request.get,
  Request.register,
  Request.remove,
  Request.update,
  Request.send,

async(req, res) => {
  return res.sendStatus(404)
})

client.start()
