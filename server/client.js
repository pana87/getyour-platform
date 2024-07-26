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
const http = require("http")
const path = require("node:path")
const {startWebRtc} = require("./webrtc.js")

let all
(async () => {
  all = await import('it-all')
})()

let IPFS
let ipfs
(async () => {
  IPFS = await import('ipfs-core')
  ipfs = await IPFS.create()
})()

let CID
(async () => {
  const multiformats = await import('multiformats')
  CID = multiformats.CID
})()

Helper.createDatabase("getyour")
Helper.createUsers("getyour")
Helper.createLogs("getyour")

const app = express()
const server = http.createServer(app)

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
    return res.send(Helper.readFileSyncToString("../lib/values/home.html"))
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
    return res.send(Helper.readFileSyncToString("../lib/values/admin.html"))

  } catch (error) {
    await Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.get("/:expert/", async (req, res, next) => {
  try {
    if (Helper.verifyIs("text/empty", req.params.expert)) throw new Error("req.params.expert is empty")

    if (req.params.expert === "login") return res.send(Helper.readFileSyncToString("../lib/values/login.html"))
    if (req.params.expert === "nutzervereinbarung") return res.send(Helper.readFileSyncToString(`../lib/values/nutzervereinbarung.html`))
    if (req.params.expert === "datenschutz") return res.send(Helper.readFileSyncToString(`../lib/values/datenschutz.html`))

    const doc = await nano.db.use("getyour").get("users")
    for (let i = 0; i < doc.users.length; i++) {
      const user = doc.users[i]
      if (user["getyour"] !== undefined) {
        if (user["getyour"].expert !== undefined) {
          if (user["getyour"].expert.name === req.params.expert) {
            return res.send(Helper.readFileSyncToString("../lib/values/expert.html"))
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

app.get("/ipfs/:cid/", async (req, res) => {
  try {
    const cid = req.params.cid
    const cidObject = CID.parse(cid)
    const chunks = ipfs.cat(cidObject)
    const file = []
    for await (const chunk of chunks) {
      file.push(chunk)
    }
    res.send(Buffer.concat(file))
  } catch (err) {
    console.error('Error retrieving file:', err)
    res.status(500).send('Error retrieving file')
  }
})

async function isOpen(req) {
  const doc = await nano.db.use("getyour").get("users")
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

app.get("/:expert/:platform/:path/",
async(req, res, next) => {
  try {

    const html = await isOpen(req)
    if (!Helper.verifyIs("text/empty", html)) {
      return res.send(html)
    } else {
      return next()
    }

  } catch (error) {
    await Helper.logError(error, req)
    return res.sendStatus(404)
  }
})

async function isWritable(req) {
  const doc = await nano.db.use("getyour").get("users")
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
                      if (value.path === `/${req.params.expert}/${req.params.platform}/${req.params.path}/`) {
                        if (value.writability !== undefined) {
                          for (let i = 0; i < value.writability.length; i++) {
                            const authorized = value.writability[i]
                            if (jwtUser.email === authorized) {
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
}

async function isExpert(req) {

  const doc = await nano.db.use("getyour").get("users")
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

async function isVisible(req) {
  const doc = await nano.db.use("getyour").get("users")
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
                                    return value.html
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
        }
      }
    }
  }
}

app.get("/:expert/:platform/:path/",
  Request.verifyJwtToken,
  Request.verifySession,
async (req, res, next) => {
  try {

    let html = await isWritable(req)
    if (!Helper.verifyIs("text/empty", html)) {
      return res.send(html)
    }

    html = await isExpert(req)
    if (!Helper.verifyIs("text/empty", html)) {
      return res.send(html)
    }

    html = await isVisible(req)
    if (!Helper.verifyIs("text/empty", html)) {
      return res.send(html)
    }

    return res.redirect("/")

  } catch (error) {
    await Helper.logError(error, req)
    return res.sendStatus(404)
  }
})

app.get("/:expert/:platform/:path/:id/",
async(req, res, next) => {
  try {

    const html = await isOpen(req)
    if (!Helper.verifyIs("text/empty", html)) {
      return res.send(html)
    } else {
      return next()
    }

  } catch (error) {
    await Helper.logError(error, req)
    return res.sendStatus(404)
  }
})

app.get("/:expert/:platform/:path/:id/",
  Request.verifyJwtToken,
  Request.verifySession,
async (req, res, next) => {
  try {

    let html = await isWritable(req)
    if (!Helper.verifyIs("text/empty", html)) {
      return res.send(html)
    }

    html = await isExpert(req)
    if (!Helper.verifyIs("text/empty", html)) {
      return res.send(html)
    }

    html = await isVisible(req)
    if (!Helper.verifyIs("text/empty", html)) {
      return res.send(html)
    }

    return res.redirect("/")

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

app.post('/upload/ipfs/file/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.sendStatus(404)
    }
    const fileBuffer = req.file.buffer
    const cid = await ipfs.add(fileBuffer)
    const cidString = cid.cid.toString()

    if (!Helper.verifyIs("text/empty", cidString)) {
      if (req.hostname === "localhost") {
        return res.send(`http://localhost:9999/ipfs/${cidString}/`)
      }
      if (req.hostname === "get-your.de") {
        return res.send(`https://get-your.de/ipfs/${cidString}/`)
      }
      if (req.hostname === "www.get-your.de") {
        return res.send(`https://www.get-your.de/ipfs/${cidString}/`)
      }
    }
    return res.sendStatus(404)
  } catch (error) {
    await Helper.logError(error, req)
    console.error('Error uploading file:', error)
    res.status(500).send('Error uploading file')
  }
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

startWebRtc(server)
const port = 9999
server.listen(port, () => console.log(`[client] is running on port :${port}`))
