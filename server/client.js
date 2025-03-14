const allowedOrigins = [
  "https://localhost:9999",
  "https://get-your.de",
  "https://www.get-your.de",
]
const cron = require("node-cron")
const crypto = require("crypto")
const cookieParser = require('cookie-parser')
const { exec, spawn } = require('child_process')
const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
const {Helper} = require('../lib/Helper.js')
const http = require("http")
const https = require('https')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const path = require("path")
const storage = multer.memoryStorage()
const redirectToLoginHtml = Helper.readFileSyncToString("../lib/values/redirect-to-login.html")
let fileType
Helper.import("file-type").then(it => fileType = it)
const upload = multer({storage})
const {UserRole} = require('../lib/UserRole.js')
const {startWebSocket} = require("./websocket.js")
let randomPin
const loginQueue = []

cron.schedule("0 20 * * *", async () => {
  try {
    const doc = await nano.db.use("getyour").get("user")
    userLoop: for (const user of Object.values(doc.user)) {
      if (!user.getyour?.expert?.platforms) continue
      for (const platform of user.getyour.expert.platforms) {
        if (!platform.values) continue
        for (const value of platform.values) {
          if (!value.writeAccessRequest) continue
          if (value.writeAccessRequest.length > 0) {
            await Helper.sendEmailFromDroid({
              from: "<droid@get-your.de>",
              to: user.email,
              subject: "[getyour] Schreibrechte gefordert",
              html: `Es wurden Schreibrechte, für deine ${platform.name} Plattform, angefordert. Gehe zu deinen Werteinheiten und treffe eine Entscheidung.`
            })
            continue userLoop
          }
        }
      }
    }
  } catch (e) {}
})
//cron.schedule("* * * * *", async () => {
//  console.log("I am running every minute.")
//  const doc = await nano.db.use("getyour").get("user")
//  const automatedValues = getPlatformValues(doc)
//  .filter(it => it.automated)
//  .forEach(value => {
//    let html = value.html.replace(/\n/g, "")
//    let lang = value.lang
//    if (!lang) lang = "de"
//    const subshell = spawn("python3", ["agents/html-creator.py", value.alias, value.path, lang])
//    subshell.stdin.write(value.html)
//    subshell.stdin.end()
//    subshell.stdout.on('data', async data => {
//      const result = data.toString().replace(/```html/g, "").replace(/```/g, "")
//      console.log(result)
//      value.html = result
//      try {
//        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
//      } catch (e) {
//        if (e.message === "Document update conflict") {
//          console.log("conflict detacted")
//          const latestDoc = await nano.db.get(doc._id)
//          await nano.db.use("getyour").insert({ _id: doc._id, _rev: latestDoc._rev, user: doc.user })
//        }
//      }
//    });
//  })
//})

Helper.createDatabase("getyour")
Helper.createUser("getyour")
Helper.createLogs("getyour")

const app = express()
let server
if (process.env.NODE_ENV === "dev") {

  try {
    const securityPath = path.join(__dirname, '../security')
    const keyPath = path.join(__dirname, '../security/key.pem')
    const certPath = path.join(__dirname, '../security/cert.pem')
    function createHttpsServer() {

      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      }
      server = https.createServer(httpsOptions, app)
    }
    if (!fs.existsSync(securityPath)) {
      Helper.verifyIs("cli/installed", "openssl").then(async() => {
        const opensslCommand = `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/C=ZZ/ST=State/L=City/O=Org/OU=Unit/CN=example.com"`
        Helper.execute(opensslCommand)
      })
      createHttpsServer()
    } else {
      createHttpsServer()
    }
  } catch (e) {
    console.log(e)
  }
}
if (!server) server = http.createServer(app)

process.on('uncaughtException', async (err) => {
  await Helper.logError(err)
})
process.on('unhandledRejection', async (reason, promise) => {
  await Helper.logError(reason)
})


app.use(helmet({

  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "https://*"],
      imgSrc: ["'self'", "https://*", "data:"],
      mediaSrc: ["'self'", "https://*"],
    },
  },
}))
app.use(cookieParser())
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(removeCookies)
app.use((req, res, next) => {

  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})
app.use("/docs/", express.static(path.join(__dirname, "..", "docs")))
app.use(express.static(path.join(__dirname, "..", "client")))

app.get("/",
  async (req, res, next) => {
    try {
      return res.send(Helper.readFileSyncToString("../lib/values/home.html"))
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
async function verifyLocation(req, res, next) {
  if (!req.body.location) throw new Error("req.body.location not found")
  const location = new URL(req.body.location)
  const isLocaltunnel = location.origin.endsWith(".loca.lt") && location.protocol === "https:"
  if (allowedOrigins.includes(location.origin) || isLocaltunnel) {
    req.location = {}
    req.location.url = location
    req.location.expert = location.pathname.split("/")[1]
    req.location.platform = location.pathname.split("/")[2]
    req.location.path = location.pathname.split("/")[3]
    req.location.id = location.pathname.split("/")[4]
    return next()
  }
  return res.sendStatus(404)
}
app.get("/admin/",
  addJwt,
  Helper.verifySession,
  adminOnly,
  async(req, res) => {
    try {
      return res.send(Helper.readFileSyncToString("../lib/values/admin.html"))
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.get("/cid/:cid/", 
  verifyOrigin,
  async (req, res, next) => {
    try {
      const cid = req.params.cid
      const filePath = `./cid/${cid}`
      fs.access(filePath, fs.constants.F_OK, async err => {
        if (err) return res.sendStatus(404)
        const fileBuffer = fs.readFileSync(filePath)
        const {mime} = await fileType.fileTypeFromBuffer(fileBuffer)
        res.set("Content-Type", mime)
        fs.createReadStream(filePath).pipe(res)
      })
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.get("/db/migration/",
  async (req, res) => {
    const db = nano.db.use("getyour")
    try {
      const doc = await db.get("user")
      if (doc.user) return res.sendStatus(404)
    } catch (e) {
      const doc = await db.get("users")
      const map = Helper.convert("array/map", doc.users)
      await db.insert({_id: "user", user: map})
      return res.sendStatus(200)
    }
  }
)
app.get("/get/cookies/",
  async (req, res) => {
    try {
      return res.send(req.cookies)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.get("/remove/cookies/",
  async (req, res) => {
    try {
      Object.keys(req.cookies).forEach((cookieName) => {
        res.cookie(cookieName, "", { expires: new Date(Date.now()) })
        res.clearCookie(cookieName)
      })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.get("/:expert/",
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.params.expert)) return res.sendStatus(404)
      if (req.params.expert === "validation-key.txt") return res.send("169e1e0ce581f384c67717306ed10bb3e9127d43f15b1037f44ac868b78560bcb920c1b27cd26f272da197bb0fcc15458020289f0f492ad7b622a2500f2bbfd8")
      if (req.params.expert === "login") return res.send(Helper.readFileSyncToString("../lib/values/login.html"))
      if (req.params.expert === "nutzervereinbarung") return res.send(Helper.readFileSyncToString(`../lib/values/nutzervereinbarung.html`))
      if (req.params.expert === "datenschutz") return res.send(Helper.readFileSyncToString(`../lib/values/datenschutz.html`))
      const doc = await nano.db.use("getyour").get("user")
      const locationExpert = Object.values(doc.user)
      .find(user => user.getyour?.expert?.name === req.params.expert)
      if (locationExpert) {
        return res.send(Helper.readFileSyncToString("../lib/values/expert.html"))
      } else {
        return res.redirect("/")
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.get("/:expert/:platform/:path/",
  async(req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const html = getOpenParamsHtml(doc, req)
      if (!Helper.verifyIs("text/empty", html)) {
        return res.send(html)
      } else {
        return next()
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.get("/:expert/:platform/:path/",
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      let html = getParamsWritableHtml(doc, req)
      if (!Helper.verifyIs("text/empty", html)) {
        return res.send(html)
      }
      html = getParamsExpertHtml(doc, req)
      if (!Helper.verifyIs("text/empty", html)) {
        return res.send(html)
      }
      html = getAuthorizedHtml(req)
      if (!Helper.verifyIs("text/empty", html)) {
        return res.send(html)
      }
      return res.redirect("/")
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.get("/:expert/:platform/:path/:id/",
  async(req, res, next) => {
    try {
      if (req.params.path === "profil") {
        const doc = await nano.db.use("getyour").get("user")
        const html = getOpenParamsHtml(doc, req)
        if (!Helper.verifyIs("text/empty", html)) {
          return res.send(html)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
async function log(it, req) {
  const log = {}
  log.it = it
  if (it instanceof Error) log.it = {message: it.message, name: it.name, stack: it.stack}
  log.type = typeof it
  log.created = Date.now()
  log.isArray = Array.isArray(it)
  if (req) {
    log.method = req.method
    log.url = `${req.protocol}://${req.get("host")}${req.originalUrl}`
    log.host = req.headers.host
    log.path = req.path
    log.query = req.query
  }
  const doc = await nano.db.use("getyour").get("logs")
  doc.logs.unshift(log)
  console.log(log)
  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })
}
app.post('/admin/exec/command/', 
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res) => {
    try {
      const command = req.body.command
      exec(command, (error, stdout, stderr) => {
        if (error) {
          res.status(500).send(error.message)
          return
        }
        if (stderr) {
          res.status(500).send(stderr)
          return
        }
        res.send(stdout)
      })
    } catch (e) {
      await log(e, req)
      res.sendStatus(404)
    }
  }
)
function userToInfo(user) {
  let info = ""
  if (user.getyour?.expert?.alias) info += `Ein Plattformexperte mit dem Namen ${user.getyour.expert.alias}\n`
  if (user.email) info += `ist unter dieser E-Mail erreichbar: ${user.email}\n`
  return info
}
app.post("/location-expert/get/user/info/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (Helper.verifyIs("text/empty", id)) throw new Error("req.body.id is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[id]
      const info = userToInfo(user)
      return res.send(info)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/expert/paths/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (Helper.verifyIs("text/empty", id)) throw new Error("req.body.id is empty")
      const doc = await nano.db.use("getyour").get("user")
      const expert = doc.user[id]
      if (!isExpert(expert)) throw new Error("req.body.id is not an expert")
      const paths = expert.getyour.expert.platforms
      .flatMap(platform => platform.values || [])
      .flatMap(value => value.path || [])
      if (!paths || paths.length <= 0) return res.sendStatus(404)
      return res.send(paths)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/roles/text-value/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const user = req.jwt.user
      const roles = getUserRoles(user)
      .map(it => ({text: it.name, value: it.created}))
      return res.send(roles)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/retell/call/contact/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const apiKey = req.jwt.user.retell?.apiKey
      if (!apiKey) return res.sendStatus(404)
      const fromNumber = req.body.fromNumber
      if (Helper.verifyIs("text/empty", fromNumber)) throw new Error("req.body.fromNumber is empty")
      const emailReceiver = req.body.emailReceiver
      if (Helper.verifyIs("text/empty", emailReceiver)) throw new Error("req.body.emailReceiver is empty")
      const contact = req.body.contact
      if (Helper.verifyIs("object/empty", contact)) throw new Error("req.body.contact is empty")
      const {Retell} = await import("retell-sdk")
      const retellClient = new Retell({apiKey})
      const response = await retellClient.call.createPhoneCall({
        from_number: fromNumber, 
        to_number: contact.phone, 
        retell_llm_dynamic_variables: contact
      })
      const callId = response.call_id
      const result = await retellClient.call.retrieve(call_id)
      const callAnalysis = result.call_analysis
      if (callAnalysis.scheduled) {
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (!user) return res.sendStatus(404)
        await sendIcsEmail(user.email, emailReceiver, {
          summary: callAnalysis.summary,
          start: callAnalysis.start,
          end: callAnalysis.end,
          location: callAnalysis.location,
          description: callAnalysis.description
        })
        if (!user.retell.counter) user.retell.counter = {}
        if (!user.retell.counter[emailReceiver]) user.retell.counter[emailReceiver] = 0
        user.retell.counter[emailReceiver]++
        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      }
      return res.send(result)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/retell/api-key/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const retellApiKey = req.jwt.user.retell?.apiKey
      if (!retellApiKey) return res.sendStatus(404)
      return res.send(retellApiKey)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/experts",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const experts = Object.values(doc.user)
      .filter(it => !Helper.verifyIs("text/empty", it.getyour?.expert?.alias) && it.id !== req.jwt.id)
      .map(it => {
        return {
          id: it.id, 
          alias: it.getyour.expert.alias
        }
      })
      if (!experts || experts.length <= 0) return res.sendStatus(404)
      return res.send(experts)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/expert/name/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const name = req.jwt.user.getyour.expert.name
      if (!name) return res.sendStatus(404)
      return res.send(name)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/expert/names/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const names = Object.values(doc.user)
      .flatMap(it => it.getyour?.expert?.name || undefined)
      .filter(it => it)
      if (!names || names.length <= 0) return res.sendStatus(404)
      return res.send(names)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/location/feedback/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const locationExpert = Object.values(doc.user).find(user => Helper.verifyIs("user/location-expert", {user, req}))
      if (!locationExpert) return res.sendStatus(404)
      const platform = locationExpert.getyour?.expert?.platforms?.find(platform =>
        platform.name === req.location.platform
      )
      if (!platform || !platform.values) return res.sendStatus(404)
      const value = platform.values.find(value =>
        value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`
      )
      if (!value && !value.feedback && value.feedback.length <= 0) return res.sendStatus(404)
      return res.send(value.feedback)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/location/feedback-length/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      if (!req.location) return res.sendStatus(404)
      const doc = await nano.db.use("getyour").get("user")
      const locationExpert = Object.values(doc.user).find(user => Helper.verifyIs("user/location-expert", {user, req}))
      if (!locationExpert) return res.sendStatus(404)
      const platform = locationExpert.getyour?.expert?.platforms?.find(platform =>
        platform.name === req.location.platform
      )
      if (!platform || !platform.values) return res.sendStatus(404)
      const value = platform.values.find(value =>
        value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`
      )
      if (!value && !value.feedback && value.feedback.length <= 0) return res.sendStatus(404)
      return res.send(`${value.feedback.length}`)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/groups/self/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const jwtUser = doc.user[req.jwt.id]
      if (!jwtUser || jwtUser.id !== req.jwt.id) return res.sendStatus(404)
      const array = []
      const users = Object.values(doc.user)
      for (const user of users) {
        const groups = user.groups || []
        for (const group of groups) {
          const emails = group.emails || []
          for (const email of emails) {
            if (jwtUser.email === email) {
              array.push(group)
            }
          }
        }
      }
      if (array.length > 0) return res.send(array)
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/expert/get/js/paths/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  expertOnly,
  async (req, res, next) => {
    try {
      const jsPath = path.join(__dirname, '../client/js/')
      const paths = await fs.promises.readdir(jsPath)
      return res.send(paths)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/location/lists/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("array/empty", req.body.ids)) throw new Error("req.body.ids is empty")
          if (Helper.verifyIs("array/empty", req.body.tags)) throw new Error("req.body.tags is empty")
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            const clone = {}
            for (let i = 0; i < req.body.ids.length; i++) {
              const id = req.body.ids[i]
              for (const key in doc.user) {
                const user = doc.user[key]
                if (user[req.location.platform] !== undefined) {
                  Object.entries(user[req.location.platform]).forEach(([key, value] )=> {
                    if (Array.isArray(user[req.location.platform][key])) {
                      for (let i = 0; i < user[req.location.platform][key].length; i++) {
                        const item = user[req.location.platform][key][i]
                        if (item.created === id) {
                          clone[id] = Helper.convert("user-tags/value", {user, tags: req.body.tags})
                        }
                      }
                    }
                  })
                }
              }
            }
            return res.send(clone)
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/location/tag-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
        if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
        if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
        const location = req.body.path.split("/")[2]
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (Helper.verifyIs("user/expert", jwtUser)) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (user.email === req.body.email) {
                if (user[location] !== undefined) {
                  let found
                  Object.entries(user[location]).forEach(([key, value]) => {
                    if (key === req.body.tag) {
                      found = { [key]: value }
                    }
                  })
                  if (found && found[req.body.tag].length > 0) {
                    return res.send(found)
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/location/tag/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
      const user = req.jwt.user
      if (!user[req.location.platform]) return res.sendStatus(404)
      if (!user[req.location.platform][req.body.tag]) return res.sendStatus(404)
      return res.send(user[req.location.platform][req.body.tag])
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/get/logs/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("logs")
      if (!doc.logs || doc.logs.length <= 0) throw new Error("logs are empty")
      return res.send(doc.logs)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/match-maker/condition-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  if (platform["match-maker"] !== undefined) {
                    for (let i = 0; i < platform["match-maker"].length; i++) {
                      const matchMaker = platform["match-maker"][i]
                      if (matchMaker.conditions !== undefined) {
                        for (let i = 0; i < matchMaker.conditions.length; i++) {
                          const condition = matchMaker.conditions[i]
                          if (condition.created === req.body.id) {
                            return res.send(condition)
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/match-maker/conditions-writable/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
          const array = []
          const doc = await nano.db.use("getyour").get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            const userIsWritable = await Helper.verifyIs("user/location-writable", {jwtUser, req})
            if (userIsWritable) {
              for (const key in doc.user) {
                const user = doc.user[key]
                if (user.getyour !== undefined) {
                  if (user.getyour.expert !== undefined) {
                    if (user.getyour.expert.platforms !== undefined) {
                      for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                        const platform = user.getyour.expert.platforms[i]
                        if (platform["match-maker"] !== undefined) {
                          for (let i = 0; i < platform["match-maker"].length; i++) {
                            const matchMaker = platform["match-maker"][i]
                            if (matchMaker.created === req.body.id) {
                              if (matchMaker.conditions !== undefined) {
                                for (let i = 0; i < matchMaker.conditions.length; i++) {
                                  const condition = matchMaker.conditions[i]
                                  array.push(condition)
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
          if (array.length <= 0) return res.sendStatus(404)
          return res.send(array)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/match-maker/conditions/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const matchMaker = user.getyour?.expert?.platforms?.flatMap(it => it["match-maker"]).find(it => it.created === req.body.created)
      if (!matchMaker || !matchMaker.conditions || matchMaker.conditions.length <= 0) return res.sendStatus(404)
      return res.send(matchMaker.conditions)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/match-maker/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      const platform = findPlatform(req.body.platform, req.jwt.user)
      const matchMakers = platform["match-maker"]
      if (!matchMakers || matchMakers.length <= 0) return res.sendStatus(404)
      return res.send(matchMakers)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/match-maker/keys/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("array/empty", req.body.conditions)) throw new Error("req.body.conditions is empty")
        if (Helper.verifyIs("array/empty", req.body.mirror)) throw new Error("req.body.mirror is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]

        for (let i = 0; i < req.body.conditions.length; i++) {
          const condition = req.body.conditions[i]
          if (user.id === req.jwt.id) {
            if (Helper.verify("user/tree/exist", user, condition.left) === true) {
              if (Helper.verify("user/condition", user, condition) === false) {
                return res.sendStatus(404)
              }
            } else {
              return res.sendStatus(404)
            }
          }
        }
        if (user.id === req.jwt.id) {
          const clone = {}
          for (let i = 0; i < req.body.mirror.length; i++) {
            const tree = req.body.mirror[i]
            if (Helper.verify("user/tree/exist", user, tree) === true) {
              const map = {}
              map.tree = tree
              map.user = user
              clone[tree.replace(/\./g, "-")] = Helper.convert("user-tree/value", map)
            }
          }
          return res.send(clone)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/match-maker/list/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("array/empty", req.body.conditions)) throw new Error("req.body.conditions is empty")
        if (Helper.verifyIs("text/empty", req.body.tree)) throw new Error("req.body.tree is empty")
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          for (let i = 0; i < req.body.conditions.length; i++) {
            const condition = req.body.conditions[i]
            if (Helper.verify("user/condition", jwtUser, condition) === false) {
              return res.sendStatus(404)
            }
          }
        }
        const array = []
        const tags = req.body.tree.split(".")
        for (const key in doc.user) {
          const user = doc.user[key]
          if (user[tags[0]] !== undefined) {
            if (user[tags[0]][tags[1]] !== undefined) {
              for (let i = 0; i < user[tags[0]][tags[1]].length; i++) {
                const list = user[tags[0]][tags[1]][i]
                const map = {}
                map.id = list.created
                map.tag = list.tag
                map.reputation = user.reputation
                map.funnel = list.funnel
                array.push(map)
              }
            }
          }
        }
        if (array.length > 0) return res.send(array)
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/match-maker/mirror/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("array/empty", req.body.conditions)) throw new Error("req.body.conditions is empty")
        if (Helper.verifyIs("array/empty", req.body.mirror)) throw new Error("req.body.mirror is empty")
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        for (let i = 0; i < req.body.conditions.length; i++) {
          const condition = req.body.conditions[i]
          if (jwtUser.id === req.jwt.id) {
            if (Helper.verify("user/tree/exist", jwtUser, condition.left) === true) {
              if (Helper.verify("user/condition", jwtUser, condition) === false) {
                return res.sendStatus(404)
              }
            } else {
              return res.sendStatus(404)
            }
          }
        }
        const array = []
        userloop: for (const key in doc.user) {
          const user = doc.user[key]
          for (let i = 0; i < req.body.mirror.length; i++) {
            const tree = req.body.mirror[i]
            if (Helper.verify("user/tree/exist", user, tree) === false) continue userloop
            const clone = {}
            clone.reputation = user.reputation
            clone.treeValues = []
            const map = {}
            map.tree = tree
            map.user = user
            const value = this.convert("user-tree/value", map)
            const treeValuePair = {}
            treeValuePair.tree = tree
            treeValuePair.value = value
            clone.treeValues.push(treeValuePair)
          }
          array.push(clone)
        }
        return res.send(map)
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platforms/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const platforms =  Object.values(doc.user)
      .filter(it => isVerified(it))
      .filter(it => isLocationExpert(it, req))
      .flatMap(it => getPlatforms(it))
      .filter(it => it.visibility === "open")
      .map(it => ({name: it.name}))
      if (!platforms || platforms.length <= 0) return res.sendStatus(404)
      return res.send(platforms)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/values/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      const doc = await nano.db.use("getyour").get("user")
      const values = Object.values(doc.user)
      .filter(it => isVerified(it))
      .flatMap(it => getPlatforms(it))
      .filter(it => it.name === req.body.platform)
      .filter(it => it.visibility === "open")
      .flatMap(it => it.values || [])
      .filter(it => it.visibility === "open" && it.authorized.length === 0 && it.roles.length === 0)
      .map(it => ({alias: it.alias, image: it.image, path: it.path}))
      if (!values || values.length <= 0) throw new Error("values empty")
      return res.send(values)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/open/:list/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const openList = Object.values(doc.user)
      .flatMap(it => it[req.params.list] || [])
      .filter(it => it.visibility === "open")
      if (!openList || openList.length <= 0) return res.sendStatus(404)
      return res.send(openList)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/list-location-writable/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          const array = []
          const doc = await nano.db.use("getyour").get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            const userIsWritable = await Helper.verifyIs("user/location-writable", {user: jwtUser, req})
            if (userIsWritable) {
              for (const key in doc.user) {
                const user = doc.user[key]
                if (Helper.verifyIs("user/location-expert", {user, req})) {
                  if (user.getyour.expert.platforms !== undefined) {
                    if (user.getyour.expert.platforms.length > 0) {
                      return res.send(user.getyour.expert.platforms)
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/starts/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const starts = Object.values(doc.user)
      .filter(it => isVerified(it))
      .flatMap(it => it.getyour?.expert?.platforms || [])
      .filter(it => it.start)
      .filter(it => it.visibility === "open")
      .reduce((acc, current) => {
        const existing = acc.find(item => item.name === current.name)
        if (!existing) {
          acc.push(current)
        } else if (current.created < existing.created) {
          const index = acc.findIndex(item => item.name === current.name)
          acc[index] = current
        }
        return acc
      }, [])
      .map(it => ({name: it.name, start: it.start}))
      if (!starts || starts.length <= 0) return res.sendStatus(404)
      return res.send(starts)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/values/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is emtpy")
      const doc = await nano.db.use("getyour").get("user")
      const user = req.jwt.user
      const platform = findPlatform(req.body.platform, user)
      if (!platform.values && platform.values.length <= 0) return res.sendStatus(404)
      const userCache = doc.user
      const values = platform.values?.map(value => {
        if (Helper.verifyIs("array/empty", value.writability)) return value
        value.writability = value.writability.reduce((acc, it) => {
          if (it !== undefined) {
            const user = userCache[it]
            acc.push(user ? user.email : it)
          }
          return acc
        }, [])
        return value
      })
      if (!values || values.length <= 0) return res.sendStatus(404)
      return res.send(values)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/values-writable/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.location !== undefined) {
        if (req.jwt !== undefined) {
          const array = []
          const doc = await nano.db.use("getyour").get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (user.getyour !== undefined) {
                if (user.getyour.expert !== undefined) {
                  if (user.getyour.expert.name === req.location.expert) {
                    if (user.getyour.expert.platforms !== undefined) {
                      for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                        const platform = user.getyour.expert.platforms[i]
                        if (platform.name === req.location.platform) {
                          if (platform.values !== undefined) {
                            for (let i = 0; i < platform.values.length; i++) {
                              const value = platform.values[i]
                              if (value.writability !== undefined) {
                                for (let i = 0; i < value.writability.length; i++) {
                                  const authorized = value.writability[i]
                                  if (authorized === user.email) {
                                    array.push(value)
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
          if (array.length > 0) return res.send(array)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/match-maker/location-writable/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      if (!isLocationWritable(doc, req)) return res.sendStatus(404)
      const platform = getLocationPlatform(doc, req)
      if (!platform || !platform["match-maker"] || platform["match-maker"].length <= 0) return res.sendStatus(404)
      return res.send(platform["match-maker"])
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/match-maker/location-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      const user = req.jwt.user
      if (!Helper.verifyIs("user/location-expert", {user, req})) return res.sendStatus(404)
      const matchMakers = user.getyour?.expert?.platforms?.flatMap(it => it["match-maker"])
      if (!matchMakers || matchMakers.length <= 0) return res.sendStatus(404)
      return res.send(matchMakers)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/expert/get/platform/paths/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  expertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is emtpy")
      const doc = await nano.db.use("getyour").get("user")
      const paths = getPlatformsByName(doc, req.body.platform)
      .flatMap(it => it.values || [])
      .map(it => it.path)
      if (!paths || paths.length <= 0) return res.sendStatus(404)
      return res.send(paths)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/paths/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is emtpy")
      const paths = findPlatform(req.body.platform, req.jwt.user).values
      .map(it => it.path)
      if (!paths || paths.length <= 0) return res.sendStatus(404)
      return res.send(paths)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/role-apps/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
          const doc = await nano.db.use("getyour").get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            if (jwtUser.roles !== undefined) {
              for (let i = 0; i < jwtUser.roles.length; i++) {
                const role = jwtUser.roles[i]
                if (role === req.body.id) {
                  for (const key in doc.user) {
                    const user = doc.user[key]
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user.getyour.expert.platforms !== undefined) {
                        for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                          const platform = user.getyour.expert.platforms[i]
                          if (platform.name === req.location.platform) {
                            if (platform.roles !== undefined) {
                              for (let i = 0; i < platform.roles.length; i++) {
                                const role = platform.roles[i]
                                if (role.id === req.body.id) {
                                  if (role.apps !== undefined) {
                                    return res.send(role.apps)
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-writable/get/platform/roles/text-value/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationWritableOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const roles = getLocationRoles(doc, req)
      .map(it => ({text: it.name, value: it.created}))
      return res.send(roles)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/role-home-self/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.getyour !== undefined) {
            if (user.getyour.expert !== undefined) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  if (platform.name === req.body.platform) {
                    if (platform.roles !== undefined) {
                      for (let i = 0; i < platform.roles.length; i++) {
                        const role = platform.roles[i]
                        if (role.created === req.body.id) return res.send(role.home)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/location-platform/roles/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const roles = req.jwt.user.getyour.expert.platforms.find(it => it.name === req.location.platform).roles
      if (!roles || roles.length <= 0) return res.sendStatus(404)
      return res.send(roles)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/roles/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      const platform = findPlatform(req.body.platform, req.jwt.user)
      if (!platform || !platform.roles || platform.roles.length <= 0) return res.sendStatus(404)
      return res.send(platform.roles)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/visibility-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  if (platform.name === req.body.platform) {
                    return res.send(platform.visibility)
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/role-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
          if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  if (platform.name === req.body.platform) {
                    if (platform.roles !== undefined) {
                      for (let i = 0; i < platform.roles.length; i++) {
                        const role = platform.roles[i]
                        if (role.created === req.body.id) {
                          return res.send(role)
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/image-location-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  return res.send(platform.image)
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/url-id/get/location/platform/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.urlId)) throw new Error("req.body.urlId is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.body.urlId]
      if (!user || !user[req.location.platform]) return res.sendStatus(404)
      return res.send(user[req.location.platform])
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/url-id/register/location/platform/:key/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  jwtIsUrlId,
  async (req, res, next) => {
    try {
      const key = req.params.key
      const value = req.body[key]
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!user[req.location.platform]) user[req.location.platform] = {}
      user[req.location.platform][key] = value
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platforms/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const user = req.jwt.user
      const platforms = user.getyour?.expert?.platforms
      .map(it => ({
        created: it.created,
        image: it.image,
        name: it.name,
        start: it.start,
        values: it.values?.length || 0,
        visibility: it.visibility
      }))
      if (!platforms || platforms.length <= 0) return res.sendStatus(404)
      return res.send(platforms)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/value/paths/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is emtpy")
      const paths = findPlatform(req.body.platform, req.jwt.user).values.flatMap(it => it.path || [])
      if (!paths || paths.length <= 0) return res.sendStatus(404)
      return res.send(paths)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/value-visibility-location-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is emtpy")
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  if (platform.values !== undefined) {
                    for (let i = 0; i < platform.values.length; i++) {
                      const value = platform.values[i]
                      if (value.path === req.body.path) {
                        const map = {}
                        map.visibility = value.visibility
                        map.roles = {}
                        map.roles.available = platform.roles
                        map.roles.selected = value.roles
                        map.authorized = value.authorized
                        return res.send(map)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/value-writability-location-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is emtpy")
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  if (platform.values !== undefined) {
                    for (let i = 0; i < platform.values.length; i++) {
                      const value = platform.values[i]
                      if (value.path === req.body.path) {
                        if (value.writability !== undefined) {
                          return res.send(value.writability)
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-writable/get/platform/values/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const users = Object.values(doc.user)
      const experts = users.filter(user => isExpert(user))
      const platforms = experts.flatMap(it => getPlatforms(it))
      const values = platforms.flatMap(it => it.values || [])
      const writableValues = values
        .filter(value => isValueWritableByUser(value, req.jwt.user))
        .map(({alias, path}) => ({alias, path}))
      if (!writableValues || writableValues.length <= 0) return res.sendStatus(404)
      return res.send(writableValues)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/expert/get/platform/roles/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  expertOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const roles = getAllExpertPlatformRoles(doc)
      if (!roles || roles.length <= 0) return res.sendStatus(404)
      return res.send(roles)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/scripts/closed/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.scripts !== undefined) {
            if (user.scripts.length > 0) return res.send(user.scripts)
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/scripts/toolbox/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              for (const key in doc.user) {
                const user = doc.user[key]
                if (user.scripts !== undefined) {
                  if (user.verified === true) {
                    if (user.scripts.length > 0) return res.send(user.scripts)
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/scripts/writable/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          const doc = await nano.db.use("getyour").get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (Helper.verifyIs("user/location-expert", {user, req})) {
                if (user.getyour.expert.platforms !== undefined) {
                  for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                    const platform = user.getyour.expert.platforms[i]
                    if (platform.name === req.location.platform) {
                      if (platform.values !== undefined) {
                        for (let i = 0; i < platform.values.length; i++) {
                          const value = platform.values[i]
                          if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                            if (value.writability !== undefined) {
                              for (let i = 0; i < value.writability.length; i++) {
                                const authorized = value.writability[i]
                                if (jwtUser.email === authorized) {
                                  for (const key in doc.user) {
                                    const user = doc.user[key]
                                    if (user.scripts !== undefined) {
                                      if (user.verified === true) {
                                        if (user.scripts.length > 0) return res.send(user.scripts)
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/parent/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const parent = doc.user[req.jwt.user.parent]
      if (!parent) return res.sendStatus(404)
      const alias = parent.getyour?.expert?.alias || ""
      const created = parent.created
      const id = parent.id
      const image = parent.getyour?.expert?.image || ""
      if (!id || !created) return res.sendStatus(404)
      return res.send({alias, created, id, image})
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/blocked/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        const array = []
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (jwtUser.blocked !== undefined) {
            for (let i = 0; i < jwtUser.blocked.length; i++) {
              const blocked = jwtUser.blocked[i]
              const blockedUser = doc.user[blocked.id]
              if (blockedUser.id === blocked.id) {
                const map = {}
                map.alias = blockedUser.alias
                map.created = blocked.created
                map.id = blockedUser.id
                map.image = blockedUser.image
                array.push(map)
              }
            }
          }
        }
        if (array.length > 0) return res.send(array)
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/chats/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const chats = findJwtChats(doc, req.jwt.id)
      return res.send(chats)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function sortCreatedDesc(array) {
  return array.sort((a, b) => {
    const aCreated = a.created ?? -Infinity;
    const bCreated = b.created ?? -Infinity;
    return bCreated - aCreated
  })
}
app.post("/jwt/get/chat/messages/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
      const array = []
      const doc = await nano.db.use("getyour").get("user")
      const idUser = doc.user[req.body.id]
      if (!idUser) {
        const chat = collectChatMessagesById(doc, req.body.id)
        const sortedMessages = sortCreatedDesc(chat)
        if (sortedMessages.length > 0) return res.send(sortedMessages)
      } else {
        let idMessages = []
        if (idUser.chat && idUser.chat[req.jwt.id]) {
          idMessages = idUser.chat[req.jwt.id].messages
        }
        let jwtMessages = []
        if (doc.user[req.jwt.id] && doc.user[req.jwt.id].chat && doc.user[req.jwt.id].chat[req.body.id]) {
          jwtMessages = doc.user[req.jwt.id].chat[req.body.id].messages
        }
        const chat = [...jwtMessages, ...idMessages]
        const sortedMessages = sortCreatedDesc(chat)
        if (sortedMessages.length > 0) return res.send(sortedMessages)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/conflicts-open/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const users = Object.values(doc.user)
      const conflicts = users
      .flatMap(it => it.conflicts || [])
      .filter(it => it.visibility === "open")
      return res.send(conflicts)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/conflicts-closed/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      const conflicts = req.jwt.user.conflicts
      if (!conflicts || conflicts.length <= 0) return res.sendStatus(404)
      return res.send(conflicts)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/funnel/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.funnel !== undefined) {
            if (user.funnel.length > 0) return res.send(user.funnel)
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/id-by-email/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
      const doc = await nano.db.use("getyour").get("user")
      for (const key in doc.user) {
        const user = doc.user[key]
        if (user.email === req.body.email) {
          return res.send(user.id)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/get/user/json/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const email = req.body.email
      if (Helper.verifyIs("text/empty", email)) throw new Error("req.body.email is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = Object.values(doc.user).find(it => it.email === email)
      if (!user) return res.sendStatus(404)
      return res.send(user)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/key-admin/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (Helper.verifyIs("user/admin", {user})) {
            const user = doc.user[req.body.id]
            if (user.id === req.body.id) {
              let result
              if (req.body.key.includes(".")) {
                result = Helper.convert("user-tree/value", {user, tree: req.body.key})
              } else {
                Object.entries(user).forEach(([key, value]) => {
                  if (key === req.body.key) {
                    result = value
                  }
                })
              }
              if (typeof result === "number") {
                result = `${result}`
              }
              if (result === undefined) return res.sendStatus(404)
              if (result !== undefined) return res.send(result)
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/get/user/keys/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.body.id]
      if (!user || user.id !== req.body.id) return res.sendStatus(404)
      const properties = Object.getOwnPropertyNames(user)
      return res.send(properties)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/location/list/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
      const user = req.jwt.user
      const location = user[req.body.platform]
      const list = location[req.body.tag]
      if (!location) return res.sendStatus(404)
      if (!list || list.length <= 0) return res.sendStatus(404)
      return res.send(list)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/location/list/:index/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
      const index = Number(req.params.index)
      const user = req.jwt.user
      const location = user[req.body.platform]
      const list = location[req.body.tag]
      if (!location) return res.sendStatus(404)
      if (!list || list.length <= 0 || !list[index]) return res.sendStatus(404)
      return res.send(list[index])
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/tree/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const tree = req.body.tree
      if (Helper.verifyIs("text/empty", tree)) throw new Error("req.body.tree is empty")
      const user = req.jwt.user
      let value = getTreeValue(user, tree)
      if (!value) value = user[tree]
      return res.send(value)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/trees/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("array/empty", req.body.trees)) throw new Error("req.body.trees is empty")
      const user = req.jwt.user
      const clone = {}
      for (let i = 0; i < req.body.trees.length; i++) {
        const tree = req.body.trees[i]
        if (treeExist(user, tree)) {
          clone[tree] = getTreeValue(user, tree)
        }
      }
      return res.send(clone)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/reputation/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const user = req.jwt.user
      if (!user.reputation) return res.sendStatus(404)
      return res.send(`${user.reputation}`)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/user/:key/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const user = req.jwt.user
      const key = req.params.key
      if (!user[key]) return res.sendStatus(404)
      if (typeof user[key] === "number") return res.send(`${user[key]}`)
      return res.send(user[key])
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/get/users/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const users = Object.values(doc.user)
      .map(user => ({
        counter: user.session?.counter ?? 0,
        email: user.email,
        id: user.id,
        verified: user.verified
      }))
      if (!users || users.length <= 0) return res.sendStatus(404)
      return res.send(users)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/users/getyour/expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const users = Object.values(doc.user)
      .filter(it => isVerified(it))
      .filter(it => it.getyour && it.getyour.expert)
      .map(it => ({
        alias: it.getyour.expert.alias,
        image: it.getyour.expert.image,
        name: it.getyour.expert.name,
        platforms: it.getyour.expert.platforms.length,
        values: it.getyour.expert.platforms.flatMap(it => it.values || []).length,
        reputation: it.reputation,
        xp: it.xp
      }))
      if (!users || users.length <= 0) return res.sendStatus(404)
      return res.send(users)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/users/numerologie/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const users = Object.values(doc.user)
      .filter(it => it.numerologie && it.numerologie.birthdate)
      .flatMap(it => ({id: it.id, ...it.numerologie}))
      shuffle(users)
      if (!users || users.length <= 0) return res.sendStatus(404)
      return res.send(users)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/users/profile/open/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const users = Object.values(doc.user)
      .filter(it => it?.profile?.visibility === "open")
      const mappedUsers = users.map(it => {
        const roles = []
        for (let i = 0; i < it.roles.length; i++) {
          const role = it.roles[i]
          if (role === UserRole.ADMIN) {
            roles.push("Admin")
            continue
          }
          if (role === UserRole.EXPERT) {
            roles.push("Experte")
            continue
          }
          const platformRole = users
          .flatMap(user => user?.getyour?.expert?.platforms || [])
          .flatMap(it => it.roles || [])
          .find(it => it.created === role)
          const roleName = Helper.convert("tag/capitalizeFirstLetter", platformRole.name)
          roles.push(roleName)
        }
        return {
          roles,
          id: it.id,
          ...it.profile,
        }
      })
      if (!mappedUsers || mappedUsers.length <= 0) return res.sendStatus(404)
      return res.send(mappedUsers)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/redirect/user/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!user || !user.roles || user.roles.length <= 0) return res.sendStatus(404)
      if (isAdmin(user)) return res.send("/admin/")
      if (isExpert(user)) return res.send(`/${user.getyour.expert.name}/`)
      for (let i = 0; i < user.roles.length; i++) {
        const roleId = user.roles[i]
        if (roleId === UserRole.ADMIN) continue
        if (roleId === UserRole.EXPERT) continue
        const role = getRoleByCreated(doc, roleId)
        return res.send(role.home)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/contacts/lead-location-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.location !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.preference)) throw new Error("req.body.preference is empty")
        if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
        if (Helper.verifyIs("text/empty", req.body.subject)) throw new Error("req.body.subject is empty")
        if (req.body.subject.length > 144) throw new Error("req.body.subject too long")
        const doc = await nano.db.use("getyour").get("user")
        for (const key in doc.user) {
          const user = doc.user[key]
          if (Helper.verifyIs("user/location-expert", {user, req})) {
            if (user.contacts === undefined) {
              user.contacts = []
              const contact = {}
              contact.created = Date.now()
              contact.email = req.body.email
              if (contact.lead === undefined) contact.lead = {}
              contact.lead.created = Date.now()
              contact.status = "lead-new"
              let text = ""
              if (req.body.preference.toLowerCase() === "e-mail") {
                text = `next:email(${req.body.subject})`
              }
              if (req.body.preference.toLowerCase() === "telefon") {
                text = `next:tel(${req.body.subject})`
              }
              if (req.body.preference.toLowerCase() === "webcall") {
                text = `next:webcall(${req.body.subject})`
              }
              if (text) contact.notes = contact.notes + text

              if (req.body.tel !== undefined) {
                if (Helper.verifyIs("text/empty", req.body.tel)) throw new Error("req.body.tel is empty")
                contact.phone = req.body.tel
              }
              contact.lead.preference = req.body.preference
              user.contacts.unshift(contact)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              await Helper.sendEmailFromDroid({
                from: "<droid@get-your.de>",
                to: contact.email,
                subject: "[getyour] Kontaktanfrage erfolgreich gesendet",
                html: `
                Du hast eine neue Kontaktanfrage gesendet.
                Schon Bald wird sich Dein persönlicher Ansprechpartner, bei Dir, per ${contact.lead.preference}, melden.
                `
              })
              await Helper.sendEmailFromDroid({
                from: "<droid@get-your.de>",
                to: user.email,
                subject: "[getyour] Neue Kontaktanfrage erhalten",
                html: `
                Du hast eine neue Kontaktanfrage erhalten.
                Der Lead mit der E-Mail ${contact.email} möchte, von dir, per ${contact.lead.preference} kontaktiert werden.
                Der Lead hat folgenden Betreff angegeben:
                ${req.body.subject}
                Der Lead ist ab sofort in deiner Kontaktliste verfügbar. <a href="https://www.get-your.de/">Hier kannst du den Status deines neuen Leads prüfen.</a>
                `
              })
              return res.sendStatus(200)
            }
            if (user.contacts !== undefined) {
              for (let i = 0; i < user.contacts.length; i++) {
                const contact = user.contacts[i]
                if (contact.email === req.body.email) {
                  if (contact.lead === undefined) contact.lead = {}
                  contact.lead.created = Date.now()
                  contact.status = "lead-update"
                  let text = ""
                  if (req.body.preference.toLowerCase() === "e-mail") {
                    text = `next:email(${req.body.subject})`
                  }
                  if (req.body.preference.toLowerCase() === "telefon") {
                    text = `next:tel(${req.body.subject})`
                  }
                  if (req.body.preference.toLowerCase() === "webcall") {
                    text = `next:webcall(${req.body.subject})`
                  }
                  if (text) contact.notes = contact.notes + text

                  if (req.body.tel !== undefined) {
                    if (Helper.verifyIs("text/empty", req.body.tel)) throw new Error("req.body.tel is empty")
                    contact.phone = req.body.tel
                  }
                  contact.lead.preference = req.body.preference
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                  await Helper.sendEmailFromDroid({
                    from: "<droid@get-your.de>",
                    to: contact.email,
                    subject: "[getyour] Kontaktanfrage erfolgreich gesendet",
                    html: `
                    Sie haben eine neue Kontaktanfrage gesendet.
                    Schon Bald wird sich Ihr persönlicher Ansprechpartner, bei Ihnen, per ${contact.lead.preference}, melden.
                    `
                  })
                  await Helper.sendEmailFromDroid({
                    from: "<droid@get-your.de>",
                    to: user.email,
                    subject: "[getyour] Neue Kontaktanfrage erhalten",
                    html: `
                    Du hast eine neue Kontaktanfrage erhalten.
                    Der Lead mit der E-Mail ${contact.email} möchte, von dir, per ${contact.lead.preference} kontaktiert werden.
                    Der Lead hat folgenden Betreff angegeben:
                    ${req.body.subject}
                    Der Lead ist ab sofort in deiner Kontaktliste verfügbar. <a href="https://www.get-your.de/">Hier geht es direkt zur Startseite, wo du den Status deines neuen Leads prüfen kannst.</a>
                    `
                  })
                  return res.sendStatus(200)
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/retell/api-key/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.apiKey)) throw new Error("req.body.apiKey is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.retell) user.retell = {}
      user.retell.apiKey = req.body.apiKey
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contacts/import/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("array/empty", req.body.contacts)) throw new Error("req.body.contacts is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      for (let j = 0; j < req.body.contacts.length; j++) {
        const newContact = req.body.contacts[j]
        let contactExists = false
        for (let k = 0; k < user.contacts.length; k++) {
          const contact = user.contacts[k]
          if (contact.email === newContact.email) {
            updateContact(contact, newContact)
            contactExists = true
            break
          }
        }
        if (!contactExists) {
          const map = {
            created: Date.now(),
            email: newContact.email
          }
          updateContact(map, newContact)
          user.contacts.unshift(map)
        }
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/deadline/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const alias = req.body.alias
      const date = req.body.date
      const notes = req.body.notes
      const reminder = req.body.reminder
      const id = req.jwt.id
      if (Helper.verifyIs("number/empty", date)) throw new Error(`req.body.date is empty`)
      if (Helper.verifyIs("number/empty", reminder)) throw new Error(`req.body.reminder is empty`)
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.deadlines) user.deadlines = []
      user.deadlines.unshift({
        alias,
        created: Date.now(),
        date,
        notes,
        reminder,
        visibility: "closed"
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/update/deadline/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const alias = req.body.alias
      const created = req.body.created
      const date = req.body.date
      const id = req.jwt.id
      const notes = req.body.notes
      const reminder = req.body.reminder
      if (Helper.verifyIs("number/empty", created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[id]
      if (!isJwt(user, req) || !user.deadlines) return res.sendStatus(404)
      const deadline = user.deadlines.find(it => it.created === created)
      if (!deadline) return res.sendStatus(404)
      if (alias) deadline.alias = alias
      if (date) deadline.date = date
      if (notes) deadline.notes = notes
      if (reminder) deadline.reminder = reminder
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/email/admin/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
      if (Helper.verifyIs("email/admin", {email: req.body.email})) {
        const doc = await nano.db.use("getyour").get("user")
        for (const key in doc.user) {
          const user = doc.user[key]
          if (user.email === req.body.email) {
            let foundRole = false
            for (let i = 0; i < user.roles.length; i++) {
              if (user.roles[i] === UserRole.ADMIN) {
                foundRole = true
                break
              }
            }
            if (foundRole === true) return res.sendStatus(200)
            if (foundRole === false) {
              user.admin = {}
              user.admin.type = "role"
              user.roles.push(UserRole.ADMIN)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
        {
          const user = {}
          user.id = Helper.digestId(req.body.email)
          user.email = req.body.email
          user.verified = true
          user.reputation = 0
          user.created =  Date.now()
          user.admin = {}
          user.admin.type = "role"
          user.roles =  []
          user.roles.push(UserRole.ADMIN)
          doc.user[user.id] = user
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/email/contacts/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const email = req.body.email
      if (Helper.verifyIs("text/empty", email)) throw new Error("req.body.email is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) user.contacts = []
      const contactExist = user.contacts.some(it => it.email === email)
      if (contactExist) return res.sendStatus(404)
      user.contacts.unshift({
        created: Date.now(),
        email,
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/register/email/expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      const doc = await nano.db.use("getyour").get("user")
      for (const key in doc.user) {
        const child = doc.user[key]
        if (child.email === req.body.email) {
          if (Helper.verifyIs("user/expert", child)) {
            throw new Error("expert exist")
          }
          let found = false
          for (let i = 0; i < child.roles.length; i++) {
            if (child.roles[i] === req.body.id) {
              found = true
              break
            }
          }
          if (found === true) throw new Error("role exist")
          if (found === false) {
            if (child.getyour === undefined) child.getyour = {}
            if (child.getyour.expert === undefined) child.getyour.expert = {}
            child.getyour.expert.type = "role"
            child.getyour.expert.name = req.body.name
            if (!Helper.verify("role/exist", UserRole.EXPERT, child.roles)) {
              child.roles.push(UserRole.EXPERT)
            }
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            return res.sendStatus(200)
          }
        }
      }
      {
        const child = {}
        child.id = Helper.digestId(req.body.email)
        child.email = req.body.email
        child.verified =  false
        child.created =  Date.now()
        child.reputation = 0
        child.roles =  []
        child.getyour = {}
        child.getyour.expert = {}
        child.getyour.expert.type = "role"
        child.getyour.expert.name = req.body.name
        if (!Helper.verify("role/exist", UserRole.EXPERT, child.roles)) {
          child.roles.push(UserRole.EXPERT)
        }
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          child.parent = jwtUser.id
          if (jwtUser.children === undefined) jwtUser.children = []
          for (let i = 0; i < jwtUser.children.length; i++) {
            const expertChild = jwtUser.children[i]
            if (expertChild === child.id) throw new Error("child exist")
          }
          jwtUser.children.unshift({created: Date.now(), id: child.id})
        }
        doc.user[child.id] = child
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/email/location/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      const doc = await nano.db.use("getyour").get("user")
      for (const key in doc.user) {
        const user = doc.user[key]
        if (user.email === req.body.email) {
          let foundRole = false
          const roles = new Set(user.roles)
          if (roles.includes(req.body.created)) {
            foundRole = true
            break
          }
          for (let i = 0; i < user.roles.length; i++) {
          }
          if (foundRole === true) return res.sendStatus(200)
          if (foundRole === false) {
            if (user[req.location.platform] === undefined) user[req.location.platform] = {}
            if (user[req.location.platform][req.body.name] === undefined) user[req.location.platform][req.body.name] = {}
            user[req.location.platform][req.body.name].type = "role"
            user.roles.push(req.body.created)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            return res.sendStatus(200)
          }
        }
      }
      {
        const user = {}
        user.id = Helper.digestId(req.body.email)
        user.email = req.body.email
        user.verified =  false
        user.created =  Date.now()
        user.reputation = 0
        user.roles =  []
        user[req.location.platform] = {}
        user[req.location.platform][req.body.name] = {}
        user[req.location.platform][req.body.name].type = "role"
        user.roles.push(req.body.created)
        for (const key in doc.user) {
          const parent = doc.user[key]
          if (parent.getyour !== undefined) {
            if (parent.getyour.expert !== undefined) {
              if (parent.getyour.expert.name === req.location.expert) {
                user.parent = parent.id
                if (parent.children === undefined) parent.children = []
                for (let i = 0; i < parent.children.length; i++) {
                  const expertChild = parent.children[i]
                  if (expertChild === user.id) throw new Error("child exist")
                }
                parent.children.unshift({created: Date.now(), id: user.id})
                break
              }
            }
          }
        }
        doc.user[user.id] = user
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/email/numerology/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      if (Helper.verifyIs("text/empty", req.body.date)) throw new Error("req.body.date is empty")
      const doc = await nano.db.use("getyour").get("user")
      for (const key in doc.user) {
        const user = doc.user[key]
        if (user.email === req.body.email) {
          let foundRole = false
          const roles = new Set(user.roles)
          if (roles.includes(req.body.created)) {
            foundRole = true
            break
          }
          if (foundRole === true) return res.sendStatus(200)
          if (foundRole === false) {
            if (user[req.location.platform] === undefined) user[req.location.platform] = {}
            if (user[req.location.platform][req.body.name] === undefined) user[req.location.platform][req.body.name] = {}
            user[req.location.platform][req.body.name].type = "role"
            user[req.location.platform].birthdate = req.body.date
            user.roles.push(req.body.created)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            return res.sendStatus(200)
          }
        }
      }
      {
        const user = {}
        user.id = Helper.digestId(req.body.email)
        user.email = req.body.email
        user.verified =  false
        user.created =  Date.now()
        user.reputation = 0
        user.roles =  []
        user[req.location.platform] = {}
        user[req.location.platform][req.body.name] = {}
        user[req.location.platform][req.body.name].type = "role"
        user[req.location.platform].birthdate = req.body.date
        user.roles.push(req.body.created)
        for (const key in doc.user) {
          const parent = doc.user[key]
          if (parent.getyour !== undefined) {
            if (parent.getyour.expert !== undefined) {
              if (parent.getyour.expert.name === req.location.expert) {
                user.parent = parent.id
                if (parent.children === undefined) parent.children = []
                for (let i = 0; i < parent.children.length; i++) {
                  const expertChild = parent.children[i]
                  if (expertChild === user.id) throw new Error("child exist")
                }
                parent.children.unshift({created: Date.now(), id: user.id})
                break
              }
            }
          }
        }
        doc.user[user.id] = user
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/name/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.jwt.id
      const name = req.body.name
      if (Helper.verifyIs("text/empty", name)) throw new Error("req.body.name is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[id]
      if (!user || user.id !== id) return res.sendStatus(404)
      user.getyour.expert.name = name
      const platforms = user.getyour?.expert?.platforms
      if (platforms) {
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i]
          if (platform.values) {
            for (let i = 0; i < platform.values.length; i++) {
              const value = platform.values[i]
              if (value.path) {
                const pathName = value.path.split("/")[3]
                value.path = `/${req.body.name}/${platform.name}/${pathName}/`
              }
            }
          }
          if (platform.roles) {
            for (let i = 0; i < platform.roles.length; i++) {
              const role = platform.roles[i]
              if (role.home) {
                const pathName = role.home.split("/")[3]
                role.home = `/${req.body.name}/${platform.name}/${pathName}/`
              }
            }
          }
          if (platform.start) {
            const pathName = platform.start.split("/")[3]
            platform.start = `/${req.body.name}/${platform.name}/${pathName}/`
          }
        }
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/location/feedback/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const text = req.body.text
      if (Helper.verifyIs("text/empty", text)) throw new Error("req.body.text is empty")
      if (text.length > 377) throw new Error("feedback too long")
      const importance = req.body.importance
      if (Helper.verifyIs("text/empty", importance)) throw new Error("req.body.importance is empty")
      const doc = await nano.db.use("getyour").get("user")
      const locationExpert = Object.values(doc.user).find(user =>
        Helper.verifyIs("user/location-expert", { user, req })
      )
      if (!locationExpert) return res.sendStatus(404)
      const platform = locationExpert.getyour?.expert?.platforms?.find(platform =>
        platform.name === req.location.platform
      )
      if (!platform || !platform.values) return res.sendStatus(404)
      const value = platform.values.find(value =>
        value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`
      )
      if (!value.feedback) value.feedback = []
      const feedback = {}
      feedback.created = Date.now()
      feedback.importance = importance
      feedback.text = text
      value.feedback.unshift(feedback)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/groups/emails-self/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("array/empty", req.body.emails)) throw new Error("req.body.emails is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      const groups = user.groups || []
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        if (group.created === req.body.created) {
          group.emails = []
          group.emails.push(user.email)
          for (let i = 0; i < req.body.emails.length; i++) {
            const email = req.body.emails[i]
            if (user.email === email) continue
            group.emails.push(email)
          }
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/groups/self/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      const emails = req.body.emails
      if (Helper.verifyIs("array/empty", emails)) throw new Error("req.body.emails is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.groups) user.groups = []
      const group = {}
      group.created = Date.now()
      group.emails = []
      group.emails.push(user.email)
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i]
        if (user.email === email) continue
        group.emails.push(email)
      }
      user.groups.unshift(group)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/groups/alias/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.groups !== undefined) {
            for (let i = 0; i < user.groups.length; i++) {
              const group = user.groups[i]
              if (group.created === req.body.id) {
                if (Helper.verifyIs("text/empty", req.body.alias)) {
                  group.alias = undefined
                } else {
                  group.alias = req.body.alias
                }
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/location/list/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
      if (Helper.verifyIs("object/empty", req.body.item)) throw new Error("req.body.item is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user[req.location.platform]) user[req.location.platform] = {}
      if (!user[req.location.platform][req.body.tag]) user[req.location.platform][req.body.tag] = []
      const map = {}
      map.created = Date.now()
      for (const key in req.body.item) {
        if (req.body.item.hasOwnProperty(key)) {
          if (key === "created") continue
          map[key] = req.body.item[key]
        }
      }
      user[req.location.platform][req.body.tag].unshift(map)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/location/map/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("object/empty", req.body.map)) throw new Error("req.body.map is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user[req.location.platform]) user[req.location.platform] = {}
      for (const key in req.body.map) {
        user[req.location.platform][key] = req.body.map[key]
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/location/requested/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      for (const user of Object.values(doc.user)) {
        if (Helper.verifyIs("user/location-expert", {user, req})) {
          const value = user.getyour.expert.platforms
          .find(it => it.name === req.location.platform).values
          .find(it => it.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`)
          if (!value.requested) value.requested = 0
          value.requested++
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/write-access-allowed/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (Helper.verifyIs("text/empty", id)) throw new Error("req.body.id is empty")
      const path = req.body.path
      if (Helper.verifyIs("text/empty", path)) throw new Error("req.body.path is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[id]
      const value = findValueByPath(doc, path)
      if (!value.writeAccessRequest) return res.sendStatus(404)
      value.writeAccessRequest = value.writeAccessRequest.filter(it => it !== id)
      if (!value.writability) value.writability = []
      if (!value.writability.some(email => email === user.email)) {
        value.writability.push(user.email)
        await sendWriteAccessEmail("<droid@get-your.de>", user.email, value.path)
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/write-access-denied/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (Helper.verifyIs("text/empty", id)) throw new Error("req.body.id is empty")
      const path = req.body.path
      if (Helper.verifyIs("text/empty", path)) throw new Error("req.body.path is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[id]
      const value = findValueByPath(doc, path)
      if (!value.writeAccessRequest) return res.sendStatus(404)
      value.writeAccessRequest = value.writeAccessRequest.filter(it => it !== id)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/write-access-request/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
      const paths = req.body.paths
      if (Helper.verifyIs("array/empty", paths)) throw new Error("req.body.paths is empty")
      const doc = await nano.db.use("getyour").get("user")
      const jwtUser = doc.user[req.jwt.id]
      paths.forEach(path => {
        const value = findValueByPath(doc, path)
        if (!value) return
        if (value.writability && value.writability.some(email => email === jwtUser.email)) return
        if (!value.writeAccessRequest) value.writeAccessRequest = []
        if (!value.writeAccessRequest.some(id => id === req.jwt.id)) value.writeAccessRequest.push(jwtUser.id)
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/match-maker/condition/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("text/empty", req.body.left)) throw new Error("req.body.left is empty")
      if (Helper.verifyIs("text/empty", req.body.operator)) throw new Error("req.body.operator is empty")
      if (Helper.verifyIs("text/empty", req.body.right)) throw new Error("req.body.right is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const matchMaker = user.getyour?.expert?.platforms?.flatMap(it => it["match-maker"]).find(it => it.created === req.body.created)
      if (!matchMaker) return res.sendStatus(404)
      if (!matchMaker.conditions) matchMaker.conditions = []
      matchMaker.conditions.push({
        created: Date.now(),
        left: req.body.left,
        operator: req.body.operator,
        right: req.body.right,
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/match-maker/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platform = findPlatform(req.body.platform, user)
      if (!platform["match-maker"]) platform["match-maker"] = []
      platform["match-maker"].unshift({
        created: Date.now(),
        name: req.body.name,
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/role/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      if (Helper.verifyIs("text/empty", req.body.home)) throw new Error("req.body.home is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platform = user?.getyour?.expert?.platforms?.find(it => it.name === req.body.platform)
      if (!platform) return res.sendStatus(404)
      if (!platform.roles) platform.roles = []
      for (let i = 0; i < platform.roles.length; i++) {
        const role = platform.roles[i]
        if (role.name === req.body.name) return res.sendStatus(404)
      }
      platform.roles.unshift({
        created: Date.now(),
        name: req.body.name,
        home: req.body.home,
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/name/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.new)) throw new Error("req.body.new is empty")
      if (Helper.verifyIs("text/empty", req.body.old)) throw new Error("req.body.old is empty")
      if (Helper.reservedKeys.has(req.body.old)) return res.sendStatus(404)
      if (Helper.reservedKeys.has(req.body.new)) return res.sendStatus(404)
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user.getyour?.expert?.platforms || []
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        if (platform.name === req.body.old) {
          const values = platform.values || []
          for (let i = 0; i < values.length; i++) {
            const value = values[i]
            value.path = `/${user.getyour.expert.name}/${req.body.new}/${value.path.split("/")[3]}/`
          }
          platform.name = req.body.new
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/image/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platform = findPlatform(req.body.platform, user)
      if (!platform) return res.sendStatus(404)
      platform.image = req.body.image ?? "";
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/platform/image-location-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
          if (Helper.verifyIs("object/empty", req.body.image)) throw new Error("req.body.image is empty")
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  if (platform.name === req.body.platform) {
                    platform.image = req.body.image
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                    return res.sendStatus(200)
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/start/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("text/empty", req.body.start)) throw new Error("req.body.start is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platform = findPlatform(req.body.platform, user)
      platform.start = req.body.start
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/visibility/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("text/empty", req.body.visibility)) throw new Error("req.body.visibility is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platform = user.getyour?.expert?.platforms?.find(it => it.name === req.body.platform)
      if (!platform) return res.sendStatus(404)
      platform.visibility = req.body.visibility
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.reservedKeys.has(req.body.platform)) return res.sendStatus(404)
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user.getyour?.expert?.platforms || []
      const exist = platforms.some(it => it.name === req.body.platform)
      if (exist) return res.sendStatus(404)
      platforms.push({
        created: Date.now(),
        name: req.body.platform,
        visibility: "closed",
      })
      if (!user.xp) user.xp = 0
      user.xp += 3
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.jwt.id
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
      if (Helper.verifyIs("text/empty", req.body.alias)) throw new Error("req.body.alias is empty")
      const doc = await nano.db.use("getyour").get("user")
      const exist = pathExist(doc, path)
      if (exist) return res.sendStatus(404)
      const user = doc.user[id]
      if (!user && user.id !== id) return res.sendStatus(404)
      if (!Helper.verifyIs("user/location-expert", {user, req})) return res.sendStatus(404)
      const platform = user.getyour?.expert?.platforms?.find(platform => platform.name === req.body.platform)
      if (!platform) return res.sendStatus(404)
      const value = {}
      value.alias = req.body.alias
      value.authorized = []
      value.created = Date.now()
      value.html = Helper.readFileSyncToString("../lib/values/toolbox.html")
      value.path = `/${user.getyour.expert.name}/${platform.name}/${req.body.path}/`
      value.roles = []
      value.type = "text/html"
      value.visibility = "closed"
      if (!platform.values) platform.values = []
      platform.values.unshift(value)
      if (!user.xp) user.xp = 0
      user.xp++
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/platform/value-html-writable/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("text/empty", req.body.html)) throw new Error("req.body.html is empty")
          const doc = await nano.db.use("getyour").get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (Helper.verifyIs("user/location-expert", {user, req})) {
                if (user.getyour.expert.platforms !== undefined) {
                  for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                    const platform = user.getyour.expert.platforms[i]
                    if (platform.name === req.location.platform) {
                      if (platform.values !== undefined) {
                        for (let i = 0; i < platform.values.length; i++) {
                          const value = platform.values[i]
                          if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                            if (value.writability !== undefined) {
                              for (let i = 0; i < value.writability.length; i++) {
                                const authorized = value.writability[i]
                                if (jwtUser.email === authorized) {
                                  value.html = req.body.html
                                  if (jwtUser.xp === undefined) jwtUser.xp = 0
                                  jwtUser.xp++
                                  if (value.saved === undefined) value.saved = 0
                                  value.saved++
                                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                                  return res.sendStatus(200)
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/platform/value-html-location-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("text/empty", req.body.html)) throw new Error("req.body.html is empty")
          const doc = await nano.db.use("getyour").get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (Helper.verifyIs("user/location-expert", {user, req})) {
              if (user.getyour.expert.platforms !== undefined) {
                for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                  const platform = user.getyour.expert.platforms[i]
                  if (platform.name === req.location.platform) {
                    if (platform.values !== undefined) {
                      for (let i = 0; i < platform.values.length; i++) {
                        const value = platform.values[i]
                        if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                          value.html = req.body.html
                          if (user.xp === undefined) user.xp = 0
                          user.xp++
                          if (value.saved === undefined) value.saved = 0
                          value.saved++
                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                          return res.sendStatus(200)
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/path/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.old)) throw new Error("req.body.old is empty")
      if (Helper.verifyIs("text/empty", req.body.new)) throw new Error("req.body.new is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(req.body.old, user)
      const expert = value.path.split("/")[1]
      const platform = value.path.split("/")[2]
      value.path = `/${expert}/${platform}/${req.body.new}/`
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/alias/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
      if (Helper.verifyIs("text/empty", req.body.alias)) throw new Error("req.body.alias is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(req.body.path, user)
      value.alias = req.body.alias
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/image/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(req.body.path, user)
      value.image = req.body.image
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/visibility/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
      if (Helper.verifyIs("text/empty", req.body.visibility)) throw new Error("req.body.visibility is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(req.body.path, user)
      if (req.body.visibility === "open") {
        value.visibility = req.body.visibility
        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
      if (req.body.visibility === "closed") {
        value.visibility = req.body.visibility
        value.roles = req.body.roles
        value.authorized = req.body.authorized
        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/platform/value-visibility-writable/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
          if (Helper.verifyIs("text/empty", req.body.visibility)) throw new Error("req.body.visibility is empty")
          const doc = await nano.db.use("getyour").get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (user.getyour !== undefined) {
                if (user.getyour.expert !== undefined) {
                  if (user.getyour.expert.platforms !== undefined) {
                    for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                      const platform = user.getyour.expert.platforms[i]
                      if (platform.values !== undefined) {
                        for (let i = 0; i < platform.values.length; i++) {
                          const value = platform.values[i]
                          if (value.path === req.body.path) {
                            if (value.writability !== undefined) {
                              for (let i = 0; i < value.writability.length; i++) {
                                const authorized = value.writability[i]
                                if (jwtUser.email === authorized) {
                                  value.visibility = req.body.visibility
                                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                                  return res.sendStatus(200)
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
async function sendWriteAccessEmail(from, to, path) {
  await Helper.sendEmailFromDroid({
    from,
    to,
    subject: "[getyour] Schreibrechte erhalten",
    html: `Du kannst ab jetzt, die Werteinheit '${path}' bearbeiten.<br><br><a href="https://www.get-your.de${path}">Klicke hier, um die Werteinheit zu öffnen.</a>`
  })
}
app.post("/location-expert/register/platform/value/writability/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
      if (!Array.isArray(req.body.writability)) throw new Error("req.body.writability is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(req.body.path, user)
      value.writability = req.body.writability
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      for (let i = 0; i < req.body.writability.length; i++) {
        const id = req.body.writability[i]
        const to = doc.user[id]
        if (!to || !to.email) continue
        if (to.id === user.id) continue
        await sendWriteAccessEmail(user.email, to.email, req.body.path)
      }
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/session/",
  Helper.verifyLocation,
  async (req, res) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      for (var key in doc.user) {
        const user = doc.user[key]
        if (user.id === req.body.localStorageId) {
          if (Helper.verifyIs("object/empty",user)) throw new Error("user is empty")
          if (Helper.verifyIs("text/empty", user.id)) throw new Error("user id is empty")
          if (Helper.verifyIs("array/empty", user.roles)) throw new Error("user roles is empty")
          const salt = Helper.generateRandomBytes(32)
          if (Helper.verifyIs("array/empty", salt)) throw new Error("salt is empty")
          const jwtToken = jwt.sign({
            id: user.id,
          }, process.env.JWT_SECRET, { expiresIn: '2h' })
          if (Helper.verifyIs("text/empty", jwtToken)) throw new Error("jwt token is empty")
          const saltDigest = Helper.digest(JSON.stringify(salt))
          if (Helper.verifyIs("text/empty", saltDigest)) throw new Error("salt digest is empty")
          const jwtTokenDigest = Helper.digest(jwtToken)
          if (Helper.verifyIs("text/empty", jwtTokenDigest)) throw new Error("jwt token digest is empty")
          const sessionToken = Helper.digest(JSON.stringify({
            id: user.id,
            pin: randomPin,
            salt: saltDigest,
            jwt: jwtTokenDigest,
          }))
          if (Helper.verifyIs("text/empty", sessionToken)) throw new Error("session token is empty")
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
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/templates/alias/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
        if (Helper.verifyIs("text/empty", req.body.alias)) throw new Error("req.body.alias is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.templates !== undefined) {
            for (let i = 0; i < user.templates.length; i++) {
              const template = user.templates[i]
              if (template.created === req.body.created) {
                template.alias = req.body.alias
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/templates/visibility-self/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (Helper.verifyIs("text/empty", req.body.visibility)) throw new Error("req.body.visibility is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.templates !== undefined) {
            for (let i = 0; i < user.templates.length; i++) {
              const template = user.templates[i]
              if (template.created === req.body.id) {
                template.visibility = req.body.visibility
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/update/tree/map/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const tree = req.body.tree
      if (Helper.verifyIs("text/empty", tree)) throw new Error("req.body.tree is empty")
      const map = req.body.map
      if (Helper.verifyIs("object/empty", map)) throw new Error("req.body.map is empty")
      const user = req.jwt.user
      if (!treeExist(user, tree)) return res.sendStatus(404)
      await registerTreeMapById(tree, map, user.id)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/tree/map/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.tree)) throw new Error("req.body.tree is empty")
      if (Helper.verifyIs("object/empty", req.body.map)) throw new Error("req.body.map is empty")
      await registerTreeMapById(req.body.tree, req.body.map, req.jwt.id)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/alias/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.alias)) throw new Error("req.body.alias is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          user.alias = req.body.alias
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/blocked/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.blocked === undefined) user.blocked = []

          let exist = false
          for (let i = 0; i < user.blocked.length; i++) {
            const blocked = user.blocked[i]
            if (blocked.id === req.body.id) {
              exist = true
            }
          }

          if (exist === false) {
            const blocked = {}
            blocked.created = Date.now()
            blocked.id = req.body.id
            user.blocked.push(blocked)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            return res.sendStatus(200)
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/conflict/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.actual)) throw new Error("req.body.actual is empty")
      if (Helper.verifyIs("text/empty", req.body.environment)) throw new Error("req.body.environment is empty")
      if (Helper.verifyIs("text/empty", req.body.expected)) throw new Error("req.body.expected is empty")
      if (Helper.verifyIs("text/empty", req.body.reproduce)) throw new Error("req.body.reproduce is empty")
      if (Helper.verifyIs("object/empty", req.body.trigger)) throw new Error("req.body.trigger is empty")
      if (Helper.verifyIs("text/empty", req.body.visibility)) throw new Error("req.body.visibility is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.conflicts) user.conflicts = []
      const conflict = {}
      conflict.created = Date.now()
      conflict.trigger = req.body.trigger
      conflict.environment = req.body.environment
      conflict.reproduce = req.body.reproduce
      conflict.expected = req.body.expected
      conflict.actual = req.body.actual
      conflict.visibility = req.body.visibility
      user.conflicts.unshift(conflict)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/image/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.image)) throw new Error("req.body.image is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          user.image = req.body.image
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/key-visibility/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (Helper.verifyIs("text/empty", req.body.key)) throw new Error("req.body.key is empty")
        if (Helper.verifyIs("text/empty", req.body.visibility)) throw new Error("req.body.visibility is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user[req.body.key] !== undefined) {
            for (let i = 0; i < user[req.body.key].length; i++) {
              const it = user[req.body.key][i]
              if (it.created === req.body.id) {
                it.visibility = req.body.visibility
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/profile/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.visibility)) throw new Error("req.body.visibility is empty")
      const aboutYou = req.body.aboutYou
      const whyThis = req.body.whyThis
      const motivation = req.body.motivation
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.profile) user.profile = {}
      if (!user.profile.created) user.profile.created = Date.now()
      if (aboutYou && aboutYou.length <= 987) user.profile.aboutYou = aboutYou
      if (whyThis && whyThis.length <= 987) user.profile.whyThis = whyThis
      if (motivation && motivation.length <= 987) user.profile.motivation = motivation
      user.profile.visibility = req.body.visibility
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/profile/message/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("text/empty", req.body.message)) throw new Error("req.body.message is empty")
      const doc = await nano.db.use("getyour").get("user")
      const users = Object.values(doc.user)
      for (const user of users) {
        if (!user.profile || user.profile.created !== req.body.created) continue
        if (!user.profile.messages) user.profile.messages = []
        const message = {}
        message.created = Date.now()
        message.html = req.body.message
        user.profile.messages.unshift(message)
        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/register/user/verified/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
      if (Helper.booleanIsEmpty(req.body.verified)) throw new Error("req.body.verified is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = Object.values(doc.user)
      .find(it => it.email === req.body.email)
      if (!user || isAdmin(user)) return res.sendStatus(404)
      user.verified = req.body.verified
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/text-tree-self/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.text)) throw new Error("req.body.text is empty")
        if (Helper.verifyIs("text/empty", req.body.tree)) throw new Error("req.body.tree is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          const split = req.body.tree.split(".")
          const lastKey = split.pop()
          let current = user
          for (let i = 0; i < split.length; i++) {
            const key = split[i]
            if (!current[key]) {
              current[key] = {}
            }
            current = current[key]
          }
          current[lastKey] = req.body.text
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/register/tree/value/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const tree = req.body.tree
      if (Helper.verifyIs("text/empty", tree)) throw new Error("req.body.tree is empty")
      if (Helper.verifyIs("text/empty", req.body.value)) throw new Error("req.body.value is empty")
      if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.body.id]
      if (!user) return res.sendStatus(404)
      const splitTree = tree.split(".")
      if (splitTree.length === 0) return res.sendStatus(404)
      if (splitTree[0] === "id" || splitTree[0] === "session") return res.sendStatus(404)
      let target = user
      for (let i = 0; i < splitTree.length - 1; i++) {
        const key = splitTree[i]
        if (!target[key]) {
          target[key] = {}
        }
        target = target[key]
      }
      const lastKey = splitTree[splitTree.length - 1]
      const value = parsePrimitive(req.body.value)
      target[lastKey] = value
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/user/key/:key/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const key = req.params.key
      if (Helper.verifyIs("text/empty", key)) throw new Error("req.params.key is empty")
      const value = req.body.value
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!user) return res.sendStatus(404)
      user[key] = value
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/user/:list/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (!Helper.isReserved(req.params.list)) throw new Error(`${req.params.list} is not reserved`)
      if (Helper.verifyIs("object/empty", req.body[req.params.list])) throw new Error(`req.body.${req.params.list} is empty`)
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (user.id === req.jwt.id) {
        if (user[req.params.list] === undefined) user[req.params.list] = []
        const map = {...req.body[req.params.list]}
        map.created = Date.now()
        map.visibility = "closed"
        const sorted = Helper.sort("keys/abc", map)
        user[req.params.list].unshift(sorted)
        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/register/users/verified/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const ids = req.body.ids
      const verified = req.body.verified
      if (Helper.verifyIs("array/empty", ids)) throw new Error("req.body.ids is empty")
      if (Helper.booleanIsEmpty(verified)) throw new Error("req.body.verified is empty")
      const doc = await nano.db.use("getyour").get("user")
      for (let i = 0; i < req.body.ids.length; i++) {
        const id = req.body.ids[i]
        const user = doc.user[id]
        if (!user) continue
        if (verified === false && isAdmin(user)) continue
        user.verified = verified
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/remove/chat/messages/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.chat) return res.sendStatus(404)
      if (!user.chat[req.body.id]) return res.sendStatus(404)
      if (!user.chat[req.body.id].messages) return res.sendStatus(404)
      user.chat[req.body.id].messages = []
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/chat/message/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
      if (Helper.verifyIs("text/empty", req.body.message)) throw new Error("req.body.message is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.chat) user.chat = {}
      if (!user.chat[req.body.id]) user.chat[req.body.id] = {created: Date.now(), messages: []}
      user.chat[req.body.id].messages.unshift({created: Date.now(), from: req.jwt.id, text: req.body.message})
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/:list/:map/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (!isReserved(req.params.list)) throw new Error(`${req.params.list} is not reserved`)
      if (!req.body[req.params.map]) throw new Error(`req.body.${req.params.map} is empty`)
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user[req.params.list]) user[req.params.list] = []
      const map = {}
      map[req.params.map] = req.body[req.params.map]
      map.created = Date.now()
      map.visibility = "closed"
      const sorted = Helper.sort("keys/abc", map)
      user[req.params.list].unshift(sorted)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/deadline/closed/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.deadlines !== undefined) {
            for (let i = 0; i < user.deadlines.length; i++) {
              const deadline = user.deadlines[i]
              if (deadline.created === req.body.id) {
                user.deadlines.splice(i, 1)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/location/feedback/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (Helper.verifyIs("number/empty", created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const locationExpert = Object.values(doc.user).find(user =>
        Helper.verifyIs("user/location-expert", { user, req })
      )
      if (!locationExpert) return res.sendStatus(404)
      const platform = locationExpert.getyour?.expert?.platforms?.find(platform =>
        platform.name === req.location.platform
      )
      if (!platform || !platform.values) return res.sendStatus(404)
      const value = platform.values.find(value =>
        value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`
      )
      if (!value && !value.feedback && value.feedback.length <= 0) return res.sendStatus(404)
      const i = value.feedback.findIndex(it => it.created === created)
      if (i === -1) return res.sendStatus(404)
      value.feedback.splice(i, 1)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/groups/created/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const groups = user?.groups || []
      for (const group of groups) {
        if (group.created === req.body.created) {
          if (group.emails.includes(user.email)) {
            group.emails = group.emails.filter(it => it.toLowerCase() !== user.email.toLowerCase())
          }
          if (group.emails.length < 2) user.groups.splice(i, 1)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/location/email-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
        if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
        if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        const location = req.body.path.split("/")[2]
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (Helper.verifyIs("user/expert", jwtUser)) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (user.email === req.body.email) {
                if (user[location] !== undefined) {
                  if (user[location][req.body.tag] !== undefined) {
                    for (let i = 0; i < user[location][req.body.tag].length; i++) {
                      const item = user[location][req.body.tag][i]
                      if (item.created === req.body.id) {
                        user[location][req.body.tag].splice(i, 1)
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/location/tag/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user[req.location.platform]) return res.sendStatus(404)
      if (!user[req.location.platform][req.body.tag]) return res.sendStatus(404)
      for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
        const item = user[req.location.platform][req.body.tag][i]
        if (item.created === req.body.created) {
          user[req.location.platform][req.body.tag].splice(i, 1)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/remove/logs/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("logs")
      doc.logs = []
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/match-maker/condition/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user.getyour?.expert?.platforms || []
      for (let i = 0; i < platforms.length; i++) {
        const matchMakers = platforms[i]["match-maker"] || []
        for (let j = 0; j < matchMakers.length; j++) {
          const conditions = matchMakers[j].conditions || []
          for (let k = 0; k < conditions.length; k++) {
            const condition = conditions[k]
            if (condition.created === req.body.created) {
              conditions.splice(k, 1)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/match-maker/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user.getyour?.expert?.platforms
      if (!platforms) return res.sendStatus(404)
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        if (!platform["match-maker"]) continue
        for (let i = 0; i < platform["match-maker"].length; i++) {
          const matchMaker = platform["match-maker"][i]
          if (matchMaker.created === req.body.created) {
            platform["match-maker"].splice(i, 1)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            return res.sendStatus(200)
          }
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/paths/scripts/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (Helper.verifyIs("array/empty", paths)) throw new Error("req.body.paths is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        user.getyour?.expert?.platforms?.forEach(platform => {
          const value = platform.values?.find(value => value.path === path)
          if (value) {
            value.html = removeScripts(value.html)
          }
        })
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/automated-true/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (Helper.verifyIs("array/empty", paths)) throw new Error("req.body.paths is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        user.getyour?.expert?.platforms?.forEach(platform => {
          const value = platform.values?.find(value => value.path === path)
          if (value) {
            value.automated = true
          }
        })
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/automated-false/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (Helper.verifyIs("array/empty", paths)) throw new Error("req.body.paths is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        user.getyour?.expert?.platforms?.forEach(platform => {
          const value = platform.values?.find(value => value.path === path)
          if (value) {
            value.automated = false
          }
        })
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/visibility-closed/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (Helper.verifyIs("array/empty", paths)) throw new Error("req.body.paths is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        user.getyour?.expert?.platforms?.forEach(platform => {
          const value = platform.values?.find(value => value.path === path)
          if (value) {
            value.visibility = "closed"
          }
        })
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/visibility-open/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (Helper.verifyIs("array/empty", paths)) throw new Error("req.body.paths is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        user.getyour?.expert?.platforms?.forEach(platform => {
          const value = platform.values?.find(value => value.path === path)
          if (value) {
            value.visibility = "open"
          }
        })
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/platform/role/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user?.getyour?.expert?.platforms || []
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        if (platform.name === req.body.platform) {
          const roles = platform.roles || []
          for (let i = 0; i < roles.length; i++) {
            const role = roles[i]
            if (role.created === req.body.created) {
              roles.splice(i, 1)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/platform/value/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!Helper.verifyIs("user/location-expert", {user, req})) return res.sendStatus(404)
      const platforms = user.getyour?.expert?.platforms
      if (platforms) {
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i]
          if (platform.values) {
            for (let i = 0; i < platform.values.length; i++) {
              const value = platform.values[i]
              if (value.path === req.body.path) {
                platform.values.splice(i, 1)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/platform/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.reservedKeys.has(req.body.platform)) return res.sendStatus(404)
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user.getyour?.expert?.platforms || []
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        if (platform.created === req.body.created) {
          platforms.splice(i, 1)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/send/platform/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const userPlatform = user.getyour?.expert?.platforms.find(it => it.created === req.body.created)
      if (!userPlatform) throw new Error("platform not found")
      const receiver = doc.user[req.body.id]
      const domain = receiver.getyour?.expert?.name
      if (!domain) return res.sendStatus(404)
      if (!receiver.getyour) receiver.getyour = {}
      if (!receiver.getyour.expert) receiver.getyour.expert = {}
      if (!receiver.getyour.expert.platforms) receiver.getyour.expert.platforms = []
      receiver.getyour.expert.platforms.push(JSON.parse(JSON.stringify(userPlatform)))
      const receiverPlatform = receiver.getyour.expert.platforms.find(it => it.created === req.body.created)
      if (receiverPlatform.values) {
        for (let j = 0; j < receiverPlatform.values.length; j++) {
          const value = receiverPlatform.values[j]
          const paths = value.path.split("/")
          const platformName = paths[2]
          const path = paths[3]
          value.path = `/${domain}/${platformName}/${path}/`
        }
      }
      if (receiverPlatform.start) {
        const paths = receiverPlatform.start.split("/")
        const platformName = paths[2]
        const path = paths[3]
        receiverPlatform.start = `/${domain}/${platformName}/${path}/`
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/remove/user/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
      let id
      const doc = await nano.db.use("getyour").get("user")
      const jwtUser = doc.user[req.jwt.id]
      if (jwtUser.id === req.jwt.id) {
        if (Helper.verifyIs("user/admin", {user: jwtUser})) {
          const user = doc.user[req.body.id]
          if (user.id === req.body.id) {
            if (Helper.verifyIs("user/admin", {user})) return res.sendStatus(404)
            id = user.id
            delete doc.user[user.id]
          }
        }
      }
      if (!Helper.verifyIs("text/empty", id)) {
        for (const key in doc.user) {
          const user = doc.user[key]
          if (user.children !== undefined) {
            for (let i = 0; i < user.children.length; i++) {
              const child = user.children[i]
              if (child === id) user.children.splice(i, 1)
            }
          }
        }
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/user/blocked/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.blocked !== undefined) {
            for (let i = 0; i < user.blocked.length; i++) {
              const blocked = user.blocked[i]
              if (blocked.id === req.body.id) {
                user.blocked.splice(i, 1)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/user/funnel/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.funnel !== undefined) {
            for (let i = 0; i < user.funnel.length; i++) {
              const funnel = user.funnel[i]
              if (funnel.created === req.body.created) {
                user.funnel.splice(i, 1)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/profile/message/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      const messages = user.profile.messages || []
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        if (message.created === req.body.created) {
          user.profile.messages.splice(i, 1)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/user/tree-admin/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (!Helper.verifyIs("key/deletable", req.body.key)) throw new Error("key not deletable")
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (Helper.verifyIs("user/admin", {user: jwtUser})) {
            const user = doc.user[req.body.id]
            if (user.id === req.body.id) {
              if (req.body.tree.includes(".")) {
                const keys = req.body.tree.split(".")
                let value = user
                let previousIsArray
                let array
                for (let i = 0; i < keys.length; i++) {
                  const key = keys[i]
                  if (value[key] !== undefined) {
                    if (i === keys.length - 2) {
                      if (Array.isArray(value[key])) {
                        previousIsArray = true
                        array = value[key]
                      }
                    }
                    if (i === keys.length - 1) {
                      if (previousIsArray === true) {
                        const index = array.indexOf(value[key])
                        array.splice(index, 1)
                        break
                      }
                      value[key] = undefined
                      break
                    } else {
                      value = value[key]
                    }
                  } else {
                    return res.sendStatus(404)
                  }
                }
              } else {
                if (user[req.body.tree] !== undefined) {
                  user[req.body.tree] = undefined
                }
              }
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/user/scripts/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.scripts !== undefined) {
            for (let i = 0; i < user.scripts.length; i++) {
              const script = user.scripts[i]
              if (script.created === req.body.created) {
                user.scripts.splice(i, 1)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/remove/user/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      await removeUserById(req.jwt.id)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/user/sources/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.sources !== undefined) {
            for (let i = 0; i < user.sources.length; i++) {
              const source = user.sources[i]
              if (source.created === req.body.created) {
                user.sources.splice(i, 1)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/user/templates/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.templates !== undefined) {
            for (let i = 0; i < user.templates.length; i++) {
              const template = user.templates[i]
              if (template.created === req.body.created) {
                user.templates.splice(i, 1)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function removeImageCid(image, params) {
  if (params === "images") {
    const match = image.url.match(/cid\/([^\/]+)/)
    if (match && match[1]) {
      const cid = match[1]
      const cidDirectory = path.join(__dirname, "..", "cid")
      const filePath = path.join(cidDirectory, cid)
      fs.unlink(filePath, error => {
        if (error) throw new Error(error)
      })
    }
  }
}
app.post("/jwt/remove/user/:list/item/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      const list = user[req.params.list] || []
      for (let i = 0; i < list.length; i++) {
        const it = list[i]
        if (it.created === req.body.created) {
          list.splice(i, 1)
          removeImageCid(it, req.params.list)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
async function sendIcsEmail(from, to, ics) {
  let content = 'BEGIN:VCALENDAR\n' +
  'VERSION:2.0\n' +
  'BEGIN:VEVENT\n' +
  `SUMMARY:${ics.summary}\n` +
  `DTSTART;VALUE=DATE:${ics.start}\n` +
  `DTEND;VALUE=DATE:${ics.end}\n` + // 20201030T113000Z
  `LOCATION:${ics.location} \n` +
  `DESCRIPTION:${ics.description}\n` +
  'STATUS:CONFIRMED\n' +
  'SEQUENCE:3\n' +
  'BEGIN:VALARM\n' +
  'TRIGGER:-PT10M\n' +
  `DESCRIPTION:${ics.description}\n` +
  'ACTION:DISPLAY\n' +
  'END:VALARM\n' +
  'END:VEVENT\n' +
  'END:VCALENDAR'
  await Helper.sendEmailFromDroid({
    from,
    to,
    subject: "[getyour] Neuer Termin",
    text: "Ein neuer Interessent für dich.",
    icalEvent: {
      filename: "neuer_termin.ics",
      method: "request",
      content,
    }
  })
}
app.post("/jwt/send/email/retell-ics/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.to)) throw new Error("req.body.to is empty")
      const ics = req.body.ics
      if (Helper.verifyIs("object/empty", ics)) throw new Error("req.body.ics is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      await sendIcsEmail(user.email, req.body.to, ics) 
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/send/email/ics/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.to)) throw new Error("req.body.to is empty")
      const ics = req.body.ics
      if (Helper.verifyIs("object/empty", ics)) throw new Error("req.body.ics is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      await sendIcsEmail(user.email, req.body.to, ics) 
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/send/email/lat-lon/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.to)) throw new Error("req.body.to is empty")
      if (Helper.verifyIs("number/empty", req.body.lat)) throw new Error("req.body.lat is empty")
      if (Helper.verifyIs("number/empty", req.body.lon)) throw new Error("req.body.lon is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      await Helper.sendEmailFromDroid({
        from: user.email,
        to: req.body.to,
        subject: "[getyour] Standort",
        html: `
        <p>${user.email} hat dir seinen Standort geschickt.</p>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${req.body.lat},${req.body.lon}" target="_blank">Klicke hier, um Google Maps zu öffnen</a><br><br>
        <a href="http://maps.apple.com/?ll=${req.body.lat},${req.body.lon}" target="_blank">Klicke hier, um Apple Maps zu öffnen</a><br><br>
        `
      })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/send/email/test-html/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.subject)) throw new Error("req.body.subject is empty")
      if (Helper.verifyIs("text/empty", req.body.html)) throw new Error("req.body.html is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      await Helper.sendEmailFromDroid({
        from: "<droid@get-your.de>",
        to: user.email,
        subject: "[test] " + req.body.subject,
        html: req.body.html
      })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/send/email/send-html/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.subject)) throw new Error("req.body.subject is empty")
      if (Helper.verifyIs("text/empty", req.body.html)) throw new Error("req.body.html is empty")
      if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      await Helper.sendEmailFromDroid({
        from: user.email,
        to: req.body.email,
        subject: req.body.subject,
        html: req.body.html
      })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/invite/expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
      const admin = doc.user[req.jwt.id]
      await Helper.sendEmailFromDroid({
        from: admin.email,
        to: req.body.email,
        subject: "[getyour] Einladung",
        html: `Du wurdest von ${admin.email} eingeladen an unsere Plattform teilzunehmen.<br><br><a href="https://www.get-your.de/">Klicke hier, um deine Plattform zu starten.</a>`
      })
      return res.sendStatus(200)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/send/email/with/pin/",
  Helper.verifyLocation,
  async (req, res) => {
    try {
      const email = req.body.email
      if (Helper.verifyIs("text/empty", email)) throw new Error("req.body.email is empty")
      expireLoginAttempts()
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
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/send/map/to/email/ids/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res) => {
    try {
      const map = req.body.map
      const ids = req.body.ids.split(",")
      if (!Array.isArray(ids)) throw new Error("req.body.ids is empty")
      if (Helper.verifyIs("object/empty", map)) throw new Error("req.body.map is empty")
      const mapText = mapToText(map)
      function mapToText(map) {
        if (!map || typeof map !== 'object' || Object.keys(map).length === 0) {
          return 'Keine Daten verfügbar.';
        }

        let text = '<ul>';

        for (const [key, value] of Object.entries(map)) {
          text += `<li><strong>${key}:</strong> ${value}</li>`;
        }

        text += '</ul>';

        return text;
      }
      const doc = await nano.db.use("getyour").get("user")
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        id.trim()
        const user = doc.user[id]
        if (!user) continue
        await Helper.sendEmailFromDroid({
          from: "<droid@get-your.de>",
          to: user.email,
          subject: "[getyour] Funnel",
          html: `
            <p>Jemand hat deinen Funnel, mit folgenden Daten, ausgefüllt:</p>

            ${mapText}

            Location: ${locationToPath(req)}
          `
        })
      }
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/update/children/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      await updateChildren()
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/update/location/list/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
      if (Helper.verifyIs("object/empty", req.body.item)) throw new Error("req.body.item is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user[req.location.platform]) return res.sendStatus(404)
      if (!user[req.location.platform][req.body.tag]) return res.sendStatus(404)
      for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
        const item = user[req.location.platform][req.body.tag][i]
        if (item.created !== req.body.created) continue
        Object.keys(req.body.item).forEach(key => {
          if (key !== 'created') {
            item[key] = req.body.item[key]
          }
        })
        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/update/location/list-email-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
        if (Helper.verifyIs("text/empty", req.body.email)) throw new Error("req.body.email is empty")
        if (Helper.verifyIs("text/empty", req.body.tag)) throw new Error("req.body.tag is empty")
        if (Helper.verifyIs("object/empty", req.body.map)) throw new Error("req.body.map is empty")
        const location = req.body.path.split("/")[2]
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (Helper.verifyIs("user/expert", jwtUser)) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (user.email === req.body.email) {
                if (user[location] !== undefined) {
                  if (user[location][req.body.tag] !== undefined) {
                    for (let i = 0; i < user[location][req.body.tag].length; i++) {
                      const item = user[location][req.body.tag][i]
                      if (item.created === req.body.id) {
                        Object.keys(req.body.map).forEach(key => {
                          if (key !== 'created') {
                            item[key] = req.body.map[key]
                          }
                        })
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/update/match-maker/condition/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("text/empty", req.body.left)) throw new Error("req.body.left is empty")
      if (Helper.verifyIs("text/empty", req.body.operator)) throw new Error("req.body.operator is empty")
      if (Helper.verifyIs("text/empty", req.body.right)) throw new Error("req.body.right is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user.getyour?.expert?.platforms || []
      for (let i = 0; i < platforms.length; i++) {
        const matchMakers = platforms[i]["match-maker"] || []
        for (let j = 0; j < matchMakers.length; j++) {
          const conditions = matchMakers[j].conditions || []
          for (let k = 0; k < conditions.length; k++) {
            const condition = conditions[k]
            if (condition.created === req.body.created) {
              condition.left = req.body.left
              condition.operator = req.body.operator
              condition.right = req.body.right
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/update/paths/:id/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (Helper.verifyIs("array/empty", paths)) throw new Error("req.body.paths is empty")
      const id = req.params.id
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        user.getyour?.expert?.platforms?.forEach(platform => {
          const value = platform.values?.find(value => value.path === path)
          if (value) {
            value.html = replaceScript(value.html, id)
          }
        })
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/update/toolbox/path/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.path)) throw new Error("req.body.path is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user.getyour?.expert?.platforms
      if (platforms) {
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i]
          if (platform.values) {
            for (let i = 0; i < platform.values.length; i++) {
              const value = platform.values[i]
              if (value.path === req.body.path) {
                value.html = replaceScript(value.html, "toolbox-getter")
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-writable/update/toolbox/paths/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationWritableOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (Helper.verifyIs("array/empty", paths)) throw new Error("req.body.paths is empty")
      const doc = await nano.db.use("getyour").get("user")
      paths.forEach(path => {
        const value = findValueByPath(doc, path)
        if (value && isValueWritableByUser(value, req.jwt.user)) {
          value.html = replaceScript(value.html, "toolbox-getter")
        }
      })
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/update/platform/role/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      if (Helper.verifyIs("text/empty", req.body.home)) throw new Error("req.body.home is empty")
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platforms = user?.getyour?.expert?.platforms || []
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        if (platform.name === req.body.platform) {
          const roles = platform.roles || []
          for (let i = 0; i < roles.length; i++) {
            const role = roles[i]
            if (role.created === req.body.created) {
              role.name = req.body.name
              role.home = req.body.home
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/update/user/key-name-tree-admin/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (Helper.verifyIs("user/admin", {user: jwtUser})) {
            const user = doc.user[req.body.id]
            if (user.id === req.body.id) {
              if (req.body.tree.includes(".")) {
                const keys = req.body.tree.split(".")
                let value = user
                for (let i = 0; i < keys.length; i++) {
                  const key = keys[i]
                  if (value[key] !== undefined) {
                    if (i === keys.length - 1) {
                      value[req.body.name] = value[key]
                      value[key] = undefined
                      break
                    } else {
                      value = value[key]
                    }
                  } else {
                    return res.sendStatus(404)
                  }
                }
              } else {
                if (user[req.body.tree] !== undefined) {
                  user[req.body.name] = user[req.body.tree]
                  user[req.body.tree] = undefined
                }
              }
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/update/user/bool-tree-admin/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (Helper.verifyIs("text/empty", req.body.tree)) throw new Error("req.body.tree is empty")
        if (Helper.verifyIs("bool/empty", req.body.bool)) throw new Error("req.body.bool is empty")
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (Helper.verifyIs("user/admin", {user: jwtUser})) {
            const user = doc.user[req.body.id]
            if (user.id === req.body.id) {
              if (req.body.tree.includes(".")) {
                const keys = req.body.tree.split(".")
                let value = user
                for (let i = 0; i < keys.length; i++) {
                  const key = keys[i]
                  if (value[key] !== undefined) {
                    if (i === keys.length - 1) {
                      if (typeof value[key] === "boolean") {
                        value[key] = req.body.bool
                      }
                      break
                    } else {
                      value = value[key]
                    }
                  } else {
                    return res.sendStatus(404)
                  }
                }
              } else {
                if (user[req.body.tree] !== undefined) {
                  user[req.body.tree] = req.body.bool
                }
              }
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/update/user/number-tree-admin/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        req.body.number = Helper.convert("text/number", req.body.number)
        if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (Helper.verifyIs("text/empty", req.body.tree)) throw new Error("req.body.tree is empty")
        if (Helper.verifyIs("number/empty", req.body.number)) throw new Error("req.body.number is empty")
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (Helper.verifyIs("user/admin", {user: jwtUser})) {
            const user = doc.user[req.body.id]
            if (user.id === req.body.id) {
              if (req.body.tree.includes(".")) {
                const keys = req.body.tree.split(".")
                let value = user
                for (let i = 0; i < keys.length; i++) {
                  const key = keys[i]
                  if (value[key] !== undefined) {
                    if (i === keys.length - 1) {
                      if (typeof value[key] === "number") {
                        value[key] = req.body.number
                      }
                      break
                    } else {
                      value = value[key]
                    }
                  } else {
                    return res.sendStatus(404)
                  }
                }
              } else {
                if (user[req.body.tree] !== undefined) {
                  user[req.body.tree] = req.body.number
                }
              }
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/update/user/text-tree-admin/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("text/empty", req.body.id)) throw new Error("req.body.id is empty")
        if (Helper.verifyIs("text/empty", req.body.tree)) throw new Error("req.body.tree is empty")
        if (Helper.verifyIs("text/empty", req.body.text)) throw new Error("req.body.text is empty")
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (Helper.verifyIs("user/admin", {user: jwtUser})) {
            const user = doc.user[req.body.id]
            if (user.id === req.body.id) {
              if (req.body.tree.includes(".")) {
                const keys = req.body.tree.split(".")
                let value = user
                for (let i = 0; i < keys.length; i++) {
                  const key = keys[i]
                  if (value[key] !== undefined) {
                    if (i === keys.length - 1) {
                      if (typeof value[key] === "string") {
                        value[key] = req.body.text
                      }
                      break
                    } else {
                      value = value[key]
                    }
                  } else {
                    return res.sendStatus(404)
                  }
                }
              } else {
                if (user[req.body.tree] !== undefined) {
                  user[req.body.tree] = req.body.text
                }
              }
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/update/user/:list/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (!Helper.isReserved(req.params.list)) throw new Error(`${req.params.list} is not reserved`)
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
        if (Helper.verifyIs("object/empty", req.body[req.params.list])) throw new Error("req.body.source is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user[req.params.list] !== undefined) {
            for (let i = 0; i < user[req.params.list].length; i++) {
              const it = user[req.params.list][i]
              if (it.created === req.body.created) {
                user[req.params.list][i] = { ...it, ...req.body[req.params.list] }
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                return res.sendStatus(200)
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function prepareFormData(req, res, next) {
  req.file = req.files[0]
  if (!req.file) return res.sendStatus(404) 
  const jsonFile = req.files.find(file => file.mimetype === 'application/json')
  if (!jsonFile) return res.sendStatus(404) 
  const jsonString = jsonFile.buffer.toString()
  const jsonData = JSON.parse(jsonString)
  req.body.location = jsonData.location
  req.body.referer = jsonData.referer
  req.body.locationStorageEmail = jsonData.localStorageEmail
  req.body.localStorageId = jsonData.localStorageId
  return next()
}
app.post("/upload/file/",
  upload.array("file"),
  prepareFormData,
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const dir = "./cid"
      if (!fs.existsSync(dir)) fs.mkdirSync(dir)
      const cid = Helper.digest(req.file.buffer)
      const filePath = `./cid/${cid}`
      fs.writeFileSync(filePath, req.file.buffer)
      const cidLink = `https://${req.get("host")}/cid/${cid}`
      return res.send(cidLink)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/update/:list/:map/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (!Helper.isReserved(req.params.list)) throw new Error(`${req.params.list} is not reserved`)
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      const list = user[req.params.list] || []
      for (const it of list) {
        if (it.created === req.body.created) {
          if (Helper.verifyIs("object", it[req.params.map])) {
            it[req.params.map] = {...it[req.params.map], ...req.body[req.params.map]}
          } else {
            it[req.params.map] = req.body[req.params.map]
          }
          const sorted = Helper.sort("keys/abc", it)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function collectChatMessages(userChat) {
  const chatMessages = []
  for (const groupId in userChat) {
    if (userChat.hasOwnProperty(groupId)) {
      const group = userChat[groupId]
      for (const message of group.messages) {
        chatMessages.push(message)
      }
    }
  }
  return chatMessages
}
function collectChatMessagesToJwt(doc, id) {
  const allChatMessages = []
  Object.values(doc.user).forEach(user => {
    if (user.id === id) return
    if (user.chat) {
      const chatMessages = collectChatMessages(user.chat)
      allChatMessages.push(...chatMessages)
    }
  })
  return allChatMessages
}
function collectChatMessagesById(doc, id) {
  const chats = []
  Object.values(doc.user).forEach(user => {
    if (user.chat) {
      for (const groupId in user.chat) {
        if (user.chat.hasOwnProperty(groupId)) {
          const group = user.chat[groupId]
          if (groupId === id) {
            if (group.messages) {
              group.messages.forEach(message => chats.push(message))
            }
          }
        }
      }
    }
  })
  return chats
}
function findJwtChats(doc, id) {
  const chats = []
  const idUser = doc.user[id]
  Object.values(doc.user).forEach(user => {
    if (user.id === id) return
    if (user.chat) {
      for (const groupId in user.chat) {
        if (user.chat.hasOwnProperty(groupId)) {
          const group = user.chat[groupId]
          if (groupId === id) {
            let latest = false
            let latestIdUserMessage
            if (idUser.chat && idUser.chat[user.id] && idUser.chat[user.id].messages) {
              latestIdUserMessage = idUser.chat[user.id].messages[0]
            }
            let latestGroupMessage
            if (group.messages) {
              latestGroupMessage = group.messages[0]
            }
            if (latestIdUserMessage && !latestGroupMessage) latest = true
            if (latestIdUserMessage && latestGroupMessage) {
              if (latestIdUserMessage.created > latestGroupMessage.created) latest = true
            }
            chats.push({alias: group.alias, id: user.id, latest})
          }
        }
      }
    }
  })
  return chats
}
function findLatestMessage(messages) {
  if (messages.length === 0) return null
  let latestMessage = messages[0]
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].created > latestMessage.created) {
      latestMessage = messages[i]
    }
  }
  return latestMessage
}
app.post("/jwt/verify/chat/message/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const jwtUser = doc.user[req.jwt.id]
      if (!isJwt(jwtUser, req)) return res.sendStatus(404)
      let jwtLatestMessage
      if (jwtUser.chat) {
        const jwtMessages = collectChatMessages(jwtUser.chat)
        jwtLatestMessage = findLatestMessage(jwtMessages)
      }
      const allChatMessagesToJwt = collectChatMessagesToJwt(doc, req.jwt.id)
      if (!allChatMessagesToJwt) return res.sendStatus(404)
      const userLatestMessage = findLatestMessage(allChatMessagesToJwt)
      if (!userLatestMessage) return res.sendStatus(404)
      if (!jwtLatestMessage) return res.sendStatus(200)
      if (userLatestMessage.created > jwtLatestMessage.created) return res.sendStatus(200)
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/verify/email/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (req.jwt.user.email !== req.body.email) return res.sendStatus(404)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/verify/retell/api-key/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await nano.db.use("getyour").get("user")
      const jwtUser = doc.user[req.jwt.id]
      const exist = jwtUser.retell.apiKey
      if (exist) {
        return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/verify/expert/name/exist/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      const doc = await nano.db.use("getyour").get("user")
      const exist = Object.values(doc.user).some(it => it.getyour?.expert?.name === req.body.name)
      if (!exist) return res.sendStatus(404)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/verify/group/creator/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
      const groups = req.jwt.user.groups || []
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        if (group.created === req.body.created) return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/verify/match-maker/conditions/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("array/empty", req.body.conditions)) throw new Error("req.body.conditions is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        for (let i = 0; i < req.body.conditions.length; i++) {
          const condition = req.body.conditions[i]
          if (user.id === req.jwt.id) {
            if (Helper.verify("user/tree/exist", user, condition.left) === true) {
              if (Helper.verify("user/condition", user, condition) === false) {
                return res.sendStatus(404)
              }
            } else {
              return res.sendStatus(404)
            }
          }
        }
        return res.sendStatus(200)
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/verify/match-maker/name/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      if (Helper.verifyIs("key/reserved", req.body.name)) return res.sendStatus(200)
      const doc = await nano.db.use("getyour").get("user")
      const users = Object.values(doc.user)
      for (const user of users) {
        const platforms = user?.getyour?.expert?.platforms
        if (!platforms) continue
        for (const platform of platforms) {
          const matchMakers = platform["match-maker"]
          if (!matchMakers) continue
          const found = matchMakers.some(it => it.name === req.body.name)
          if (found) return res.sendStatus(200)
        }
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/verify/pin/",
  Helper.verifyLocation,
  async (req, res) => {
    try {
      expireLoginAttempts()
      const {userPin} = req.body
      if (Helper.verifyIs("text/empty", userPin)) throw new Error("user pin is empty")
      for (let i = 0; i < loginQueue.length; i++) {
        const login = loginQueue[i]
        if (login.pin === userPin) {
          if (login.expired < Date.now()) throw new Error("login expired")
          if (Helper.verifyIs("text/empty", login.pin)) throw new Error("pin is empty")
          if (userPin !== login.pin) throw new Error("pin is invalid")
          randomPin = login.pin
          return res.sendStatus(200)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/verify/platform/role/name/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.name)) throw new Error("req.body.name is empty")
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.verifyIs("key/reserved", req.body.name)) return res.sendStatus(200)
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[req.jwt.id]
      const platform = findPlatform(req.body.platform, user)
      if (!platform) return res.sendStatus(404)
      const roles = platform.roles || []
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]
        if (role.name === req.body.name) return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/verify/platform/exist/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (Helper.verifyIs("text/empty", req.body.platform)) throw new Error("req.body.platform is empty")
      if (Helper.reservedKeys.has(req.body.platform)) return res.sendStatus(200)
      const exist = req.jwt.user.getyour.expert.platforms.some(it => it.name === req.body.platform)
      if (exist) return res.sendStatus(200)
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/verify/path/exist/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  async (req, res, next) => {
    try {
      const path = req.body.path
      if (Helper.verifyIs("text/empty", path)) throw new Error("req.body.path is empty")
      const doc = await nano.db.use("getyour").get("user")
      const exist = pathExist(doc, path)
      if (!exist) return res.sendStatus(404)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/verify/tree/exist/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const tree = req.body.tree
      if (Helper.verifyIs("text/empty", tree)) throw new Error("req.body.tree is empty")
      const user = req.jwt.user
      if (!treeExist(user, tree)) return res.sendStatus(404)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/verify/user/closed/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  sendStatus(200)
)
app.post("/verify/user/admin/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  adminOnly,
  sendStatus(200)
)
app.post("/verify/user/jwt-in-emails/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (Helper.verifyIs("array/empty", req.body.emails)) throw new Error("req.body.emails is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        for (let i = 0; i < req.body.emails.length; i++) {
          const email = req.body.emails[i]
          if (user.email === email) return res.sendStatus(200)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/verify/user/location-writable/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationWritableOnly,
  sendStatus(200)
)
app.post("/verify/user/location-expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  locationExpertOnly,
  sendStatus(200)
)
app.post("/verify/user/messages/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        const doc = await nano.db.use("getyour").get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          for (const key in doc.user) {
            const user = doc.user[key]
            if (user.messages !== undefined) {
              for (let i = 0; i < user.messages.length; i++) {
                const message = user.messages[i]
                if (message.to === jwtUser.created) {
                  const oneDayInMillis = 24 * 60 * 60 * 1000
                  const now = Date.now()
                  const timeDifference = now - message.created
                  if (timeDifference <= oneDayInMillis) {
                    return res.sendStatus(200)
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/verify/user/expert/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  expertOnly,
  sendStatus(200)
)
app.post("/verify/user/url-id/",
  Helper.verifyLocation,
  Helper.verifyReferer,
  addJwt,
  Helper.verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const urlId = req.location.url.pathname.split("/")[4]
      if (Helper.verifyIs("text/empty", urlId)) throw new Error("url id is empty")
      if (urlId !== req.jwt.id) return res.sendStatus(404)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)

const port = 9999
server.listen(port, () => console.log(`[getyour] is running on port :${port}`))

async function addJwt(req, res, next) {
  try {
    if (Helper.verifyIs("object/empty", req.cookies)) throw new Error("jwt is empty")
    const {jwtToken} = req.cookies
    const jwt = await Helper.verifyJwtToken(jwtToken)
    if (Helper.verifyIs("object/empty", jwt)) throw new Error("jwt is empty")
    const doc = await nano.db.use("getyour").get("user")
    const user = doc.user[jwt.id]
    if (Helper.verifyIs("object/empty", user)) throw new Error("user is empty")
    if (req.method === "GET") {
      if (user.id === jwt.id) {
        if (user.session.jwt !== Helper.digest(jwtToken)) {
          await Helper.logError(new Error("jwt token changed"), req)
          return res.send(redirectToLoginHtml)
        }
        if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
        req.jwt = jwt
        req.jwt.user = user
        if (!req.jwt.user || req.jwt.user.id !== jwt.id) throw new Error("user mismatch")
        if (Helper.verifyIs("object/empty", req.jwt)) throw new Error("jwt not set")
        return next()
      }
      return res.redirect("/")
    }
    if (req.method === "POST") {
      if (user.id === jwt.id) {
        if (user.session.jwt !== Helper.digest(jwtToken)) throw new Error("jwt token changed")
        req.jwt = jwt
        req.jwt.user = user
        if (!req.jwt.user || req.jwt.user.id !== jwt.id) throw new Error("user mismatch")
        if (Helper.verifyIs("object/empty", req.jwt)) throw new Error("jwt not set")
        if (user.id === req.body.localStorageId) {
          return next()
        }
      }
    }
    if (req.method === "GET") return res.send(redirectToLoginHtml)
    if (req.method === "POST") return res.sendStatus(404)
  } catch (e) {
    if (req.method === "GET") return res.send(redirectToLoginHtml)
    if (req.method === "POST") return res.sendStatus(404)
  }
}
function addLocation(req, res, next) {
  try {
    if (req.body.location !== undefined) {
      const location = new URL(req.body.location)
      const isLocaltunnel = location.origin.endsWith(".loca.lt") && location.protocol === "https:"
      if (allowedOrigins.includes(location.origin) || isLocaltunnel) {
        req.location = {}
        req.location.url = location
        req.location.expert = location.pathname.split("/")[1]
        req.location.platform = location.pathname.split("/")[2]
        req.location.path = location.pathname.split("/")[3]
        req.location.id = location.pathname.split("/")[4]
        return next()
      }
    }
    return res.sendStatus(404)
  } catch (e) {
    return res.sendStatus(404)
  }
}
function addOpenData(to, from) {
  to.id = from.id
  to.reputation = from.reputation
  to.xp = from.xp
}
function adminOnly(req, res, next) {
  if (!isAdmin(req.jwt.user)) return res.sendStatus(404)
  return next()
}
async function bulkVerified(bool) {
  if (Helper.verifyIs("array/empty", req.body.ids)) throw new Error("req.body.ids is empty")
  const doc = await nano.db.use("getyour").get("user")
  const user = doc.user[req.jwt.id]
  if (user.id === req.jwt.id) {
    if (Helper.verifyIs("user/admin", {user})) {
      for (let i = 0; i < req.body.ids.length; i++) {
        const id = req.body.ids[i]
        const user = doc.user[id]
        if (bool === false) {
          if (Helper.verifyIs("user/admin", {user})) continue
        }
        if (user) user.verified = bool
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
    }
  }
}
function closedOnly(req, res, next) {
  if (!req.location || !req.jwt || !req.jwt.id || !req.jwt.user) return res.sendStatus(404)
  return next()
}
function expertOnly(req, res, next) {
  if (!isExpert(req.jwt.user)) return res.sendStatus(404)
  return next()
}
function expireLoginAttempts() {
  for (let i = 0; i < loginQueue.length; i++) {
    const login = loginQueue[i]
    if (login.expired < Date.now()) {
      loginQueue.splice(i, 1)
    }
  }
}
function findPlatform(name, user) {
  const platform = user.getyour?.expert?.platforms?.find(platform =>
    platform.name === name
  )
  if (!platform) throw new Error("platform not found")
  return platform
}
function findUserPlatformValueByPath(path, user) {
  return user.getyour.expert.platforms
  .flatMap(it => it.values || [])
  .find(it => it.path === path)
}
function findValueByLocation(doc, req) {
  return findValueByPath(doc, locationToPath(req))
}
function findValueByParams(doc, req) {
  return findValueByPath(doc, paramsToPath(req))
}
function findValueByPath(doc, path) {
  if (!doc || !doc.user) return
  return Object.values(doc.user)
  .flatMap(it => it.getyour?.expert?.platforms || [])
  .flatMap(it => it.values || [])
  .find(it => it.path === path)
}
function getAllExpertPlatformRoles(doc) {
  return Object.values(doc.user)
  .filter(user => isExpert(user))
  .flatMap(it => it.getyour.expert.platforms || [])
  .flatMap(it => it.roles || [])
}
function getAuthorizedHtml(doc, req) {
  const value = findValueByParams(doc, req)
  if (!value) return
  if (value.visibility !== "closed") return
  if (!isUserAuthorized(value, req.jwt.user)) return
  return value.html
}
function getLocationPlatform(doc, req) {
  const users = Object.values(doc.user)
  const locationExpert = users.find(user => isLocationExpert(user, req))
  return locationExpert.getyour.expert.platforms.find(it => it.name === req.location.platform)
}
function getLocationRoles(doc, req) {
  const platform = getLocationPlatform(doc, req)
  return platform.roles
}
function getOpenParamsHtml(doc, req) {
  const value = findValueByParams(doc, req)
  if (!value || value.visibility !== "open") return
  return value.html
}
function getParamsExpertHtml(doc, req) {
  if (!isParamsExpert(req.jwt.user, req)) return
  const value = findValueByParams(doc, req)
  return value.html
}
function getParamsWritableHtml(doc, req) {
  const value = findValueByParams(doc, req)
  if (!isValueWritableByUser(value, req.jwt.user)) return
  return value.html
}
function getPlatform(doc, name) {
  return Object.values(doc.user)
  .flatMap(it => it.getyour?.expert?.platforms || [])
  .find(it => it.name === name)
}
function getPlatforms(user) {
  return user?.getyour?.expert?.platforms || []
}
function getPlatformValues(doc) {
  return Object.values(doc.user)
  .flatMap(it => it.getyour?.expert?.platforms || [])
  .flatMap(it => it.values || [])
}
function getPlatformsByName(doc, name) {
  return Object.values(doc.user)
  .flatMap(it => it.getyour?.expert?.platforms || [])
  .filter(it => it.name === name)
}
function getRoleByCreated(doc, created) {
  return Object.values(doc.user)
  .flatMap(it => it.getyour?.expert?.platforms || [])
  .flatMap(it => it.roles || [])
  .find(it => it.created === created)
}
function getTreeValue(map, tree) {
  const keys = tree.split(".")
  let current = map
  for (let i = 0; i < keys.length; i++) {
    if (!current || typeof current !== "object" || !(keys[i] in current)) {
      return undefined
    }
    current = current[keys[i]]
  }
  return current
}
function getUserRoles(user) {
  return user.getyour?.expert?.platforms
  ?.flatMap(it => it.roles || [])
  .filter(it => it && it.name && it.created)
}
function getUsersValueByTree(doc, tree) {
  const users = []
  for (const user of Object.values(doc.user)) {
    const value = getTreeValue(user, tree)
    if (!value) continue
    value.id = user.id
    users.push(value)
  }
  return users
}
function getUsersByTrees(doc, trees) {
  return Object.values(doc.user)
  .map(user => {
    const clone = {}
    for (const tree of trees) {
      const key = treeToKey(tree)
      if (isReserved(key)) return null
      const value = getTreeValue(user, tree)
      if (value) clone[tree] = value
    }
    return Object.keys(clone).length > 0 ? clone : null
  }).filter(Boolean)
}
function isAdmin(user) {
  const admins = process.env.ADMINS.split(",").map(it => it.trim())
  return user.verified && admins.includes(user.email)
}
function isChild(user) {
  return (
    user &&
    user.created &&
    user.id
  )
}
function isExpert(user) {
  if (!user) return false
  if (!user.getyour) return false
  if (!user.getyour.expert) return false
  if (!user.getyour.expert.name) return false
  if (!user.getyour.expert.type) return false
  if (user.getyour.expert.type !== "role") return false
  return true
}
function isJwt(user, req) {
  return user && user.id === req.jwt.id
}
function isParamsExpert(user, req) {
  return user?.getyour?.expert?.name === req.params.expert
}
function isLocationExpert(user, req) {
  return user?.getyour?.expert?.name === req.location.expert
}
function isLocationWritable(doc, req) {
  const value = findValueByLocation(doc, req)
  if (!isValueWritableByUser(value, req.jwt.user)) return false
  return true
}
function isParamsWritable(doc, req) {
  const value = findValueByParams(doc, req)
  if (!isValueWritableByUser(value, req.jwt.user)) return false
  return true
}
function isReserved(key) {
  return Helper.reservedKeys.has(key)
}
function isUserAuthorized(value, user) {
  const isAuthorizedByEmail = value.authorized?.some(email => user.email === email)
  const isAuthorizedByRole = value.roles?.some(role => user.roles.includes(role))
  if (isAuthorizedByEmail || isAuthorizedByRole) return true
  return false
}
function isValueWritableByUser(value, user) {
  if (!value) return false
  return Array.isArray(value.writability) && value.writability.includes(user.email)
}
function isVerified(user) {
  return user.verified === true
}
function jwtIsUrlId(req, res, next) {
  const urlId = req.location.url.pathname.split("/")[4]
  if (Helper.verifyIs("text/empty", urlId)) return res.sendStatus(404)
  if (req.jwt.id !== urlId) return res.sendStatus(404)
  return next()
}
function jwtOnly(req, res, next) {
  if (!req.jwt || !req.jwt.id || !req.jwt.user) return res.sendStatus(404)
  return next()
}
function locationExpertOnly(req, res, next) {
  if (!isLocationExpert(req.jwt.user, req)) return res.sendStatus(404)
  return next()
}
function locationToPath(req) {
  return `/${req.location.expert}/${req.location.platform}/${req.location.path}/`
}
async function locationWritableOnly(req, res, next) {
  const doc = await nano.db.use("getyour").get("user")
  if (!isLocationWritable(doc, req)) return res.sendStatus(404)
  return next()
}
function paramsToPath(req) {
  if (!req || !req.params) return
  return `/${req.params.expert}/${req.params.platform}/${req.params.path}/`
}
function parsePrimitive(value) {
  if (!isNaN(Number(value))) return Number(value)
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false') return false
  if (value.toLowerCase() === 'null') return null
  if (value.toLowerCase() === 'undefined') return undefined
  return value
}
function pathExist(doc, path) {
  return Object.values(doc.user).some(user =>
    user.getyour?.expert?.platforms?.some(platform =>
      platform.values?.some(value => value.path === path)
    )
  )
}
async function registerTreeMapById(tree, map, id) {
  const doc = await nano.db.use("getyour").get("user")
  const user = doc.user[id]
  if (!user || user.id !== id) throw new Error("id mismatch")
  const split = tree.split(".")
  const lastKey = split.pop()
  let current = user
  for (let i = 0; i < split.length; i++) {
    const key = split[i]
    if (!current[key]) {
      current[key] = {}
    }
    current = current[key]
  }
  current[lastKey] = map[lastKey]
  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
}
function removeCookies(req, res, next) {
  const cookies = Object.keys(req.cookies)
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i] === "jwtToken") continue
    if (cookies[i] === "sessionToken") continue
    res.cookie(cookies[i], "", { expires: new Date(Date.now()) })
    res.clearCookie(cookies[i])
  }
  next()
}
function removeScripts(input) {
  const regex = /<script[^>]*>[\s\S]*?<\/script>/gi
  return input.replace(regex, '')
}
async function removeUserById(id) {
  const doc = await nano.db.use("getyour").get("user")
  const user = doc.user[id]
  if (isAdmin(user)) throw new Error("can not delete admin")
  delete doc.user[id]
  for (const key in doc.user) {
    const user = doc.user[key]
    if (user.children) {
      for (let i = 0; i < user.children.length; i++) {
        const child = user.children[i]
        if (!isChild(child) || child.id === id) user.children.splice(i, 1)
      }
    }
  }
  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
}
function replaceScript(input, id) {
  const regex = new RegExp(`<script id="${id}" type="module"[\\s\\S]*?<\\/script>`, 's')
  const newScript = `<script id="${id}" type="module" src="/js/${id}.js"></script>`
  if (regex.test(input)) {
    return input.replace(regex, newScript)
  } else {
    return input.replace("</body>", `${newScript}</body>`)
  }
}
function sendStatus(code) {
  return (req, res, next) => {
    return res.sendStatus(code)
  }
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}
function treeExist(user, tree) {
  const value = getTreeValue(user, tree)
  if (value) {
    return true
  } else {
    return false
  }
}
function treeToKey(tree) {
  const keys = tree.split(".")
  if (keys.length > 0) {
    return keys[keys.length - 1]
  } else {
    return tree
  }
}
function removeDuplicatesById(array) {
  const set = new Set()
  return array.filter(it => {
    if (set.has(it.id)) {
      return false
    } else {
      set.add(it.id)
      return true
    }
  })
}
async function updateChildren() {
  const doc = await nano.db.use("getyour").get("user")
  for (const user of Object.values(doc.user)) {
    if (!user.children) user.children = []
    user.children = user.children
      .filter(it => it.id && it.created)
      .filter(it => doc.user[it.id] !== undefined)
    user.children = removeDuplicatesById(user.children)
    if (!user.parent) continue
    const parent = doc.user[user.parent]
    if (!parent.children) parent.children = []
    parent.children = parent.children.filter(it => it.id && it.created)
    let childFound = false
    for (const child of parent.children) {
      if (child.id === user.id) {
        if (!child.created) child.created = Date.now()
        childFound = true
        break
      }
    }
    if (!childFound) {
      parent.children.push({created: Date.now(), id: user.id})
    }
  }
  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
}
function updateContact(alt, neu){
  if (!alt.id) alt.id = Helper.digestId(alt.email)
  if (neu.alias) alt.alias = neu.alias
  if (neu.birthday) alt.birthday = neu.birthday
  if (neu.status) alt.status = neu.status
  if (neu.notes) alt.notes = neu.notes
  if (neu.phone) alt.phone = neu.phone
  if (neu.website) alt.website = neu.website
}
function verifyOrigin(req, res, next) {
  const origin = `https://${req.headers.host}`
  if (allowedOrigins.includes(origin)) {
    return next()
  } else {
    return res.sendStatus(404)
  }
}
