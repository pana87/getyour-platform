require('dotenv').config()
const nodemailer = require("nodemailer")
const allowedOrigins = [
  "http://localhost:9999",
  "https://get-your.de",
  "https://www.get-your.de",
]
const cron = require("node-cron")
const crypto = require("crypto")
const cookieParser = require('cookie-parser')
const {exec, spawn} = require('child_process')
const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
const http = require("http")
const jwt = require('jsonwebtoken')
const multer = require('multer')
const {SocksProxyAgent} = require("socks-proxy-agent")
const torAgent = new SocksProxyAgent("socks5h://127.0.0.1:9050")
let db
const nano = require("nano")
if (process.env.NODE_ENV === "dev") {
  const couch = nano(process.env.COUCHDB_LOCATION)
  db = couch.db.use(process.env.DB_NAME)
}
if (process.env.NODE_ENV === "tor") {
  const couch = nano({
    url: process.env.COUCHDB_LOCATION,
    requestDefaults: {
      agent: torAgent
    }
  })
  db = couch.db.use(process.env.DB_NAME)
}
if (!db) throw new Error("NODE_ENV unknown")
const path = require("path")
const storage = multer.memoryStorage()
const redirectToLoginHtml = readFileSync("./html/redirect-to-login.html")
const upload = multer({storage})
const UserRole = Object.freeze({
  ADMIN: 2,
  EXPERT: 3,
})
let randomPin
const loginQueue = []

function readFileSync(relativePath) {
  const result = fs.readFileSync(path.join(__dirname, relativePath)).toString()
  if (textIsEmpty(result)) throw new Error("file is empty")
  return result
}
async function userBackup(id) {
  const doc = await db.get("user")
  const backupId = id
  let backupDoc
  try {
    backupDoc = await db.get(backupId)
  } catch (e) {
    backupDoc = { _id: backupId }
  }
  backupDoc.user = doc.user
  await db.insert(backupDoc)
}
cron.schedule("0 * * * *", async () => {
  try {
    await userBackup("user_backup_hourly")
  } catch (e) {
    await log(e)
  }
})
cron.schedule("0 0 * * *", async () => {
  try {
    await userBackup("user_backup_daily")
  } catch (e) {
    await log(e)
  }
})
cron.schedule("0 0 * * 0", async () => {
  try {
    await userBackup("user_backup_weekly")
  } catch (e) {
    await log(e)
  }
})

function sendEmailFromDroid(options) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: process.env.DROID_EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.DROID_EMAIL_ADDRESS,
        pass: process.env.DROID_EMAIL_PASSWORD,
      }
    })
    if (objectIsEmpty(options)) reject("options are empty")
    if (objectIsEmpty(transporter)) reject("smtp transporter is empty")
    transporter.sendMail(options, function(error, info){
      if (error !== null) reject(error)
      resolve()
    })
  })
}
cron.schedule("0 20 * * *", async () => {
  try {
    const doc = await db.get("user")
    userLoop: for (const user of Object.values(doc.user)) {
      const platforms = getPlatforms(user)
      if (!platforms) continue
      for (const platform of platforms) {
        const values = getValues(platform)
        if (!values) continue
        for (const value of values) {
          if (!value.writeAccessRequest) continue
          if (value.writeAccessRequest.length > 0) {
            await sendEmailFromDroid({
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
  } catch (e) {
    await log(e)
  }
});
//cron.schedule("* * * * *", async () => {
//  console.log("I am running every minute.")
//  const doc = await db.get("user")
//  const automatedValues = getAllValues(doc)
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
//        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
//      } catch (e) {
//        if (e.message === "Document update conflict") {
//          console.log("conflict detacted")
//          const latestDoc = await nano.db.get(doc._id)
//          await db.insert({ _id: doc._id, _rev: latestDoc._rev, user: doc.user })
//        }
//      }
//    });
//  })
//})

(async() => {
  try {
    await nano.db.create(process.env.DB_NAME)
  } catch (e) {
    // do nothing
  }
})();
(async() => {
  try {
    await nano.db.use(process.env.DB_NAME).insert({user: {}}, "user")
  } catch (e) {
    // do nothing
  }
})();
(async() => {
  try {
    await nano.db.use(process.env.DB_NAME).insert({logs: []}, "logs")
  } catch (e) {
    // do nothing
  }
})();

const app = express()
const server = http.createServer(app)

process.on('uncaughtException', async (err) => {
  await log(err)
})
process.on('unhandledRejection', async (reason, promise) => {
  await log(reason)
})

app.use(helmet())
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
app.use(express.static(path.join(__dirname, "static")))

app.get("/",
  async (req, res, next) => {
    try {
      return res.send(readFileSync("./html/home.html"))
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function digest(message) {
  return crypto.createHash("sha256").update(message).digest("hex")
}
async function verifyLocation(req, res, next) {
  if (!req.body.location) throw new Error("req.body.location not found")
  const location = new URL(req.body.location)
  const isLocalTunnel = location.origin.endsWith(".loca.lt") && location.protocol === "https:"
  if (allowedOrigins.includes(location.origin) || isLocalTunnel) {
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
async function verifySession(req, res, next) {
  try {
    if (objectIsEmpty(req.jwt)) throw new Error("req.jwt is empty")
    const {sessionToken} = req.cookies
    if (textIsEmpty(sessionToken)) throw new Error("session token is empty")
    const doc = await db.get("user")
    const user = doc.user[req.jwt.id]
    if (!user) throw new Error("user not found")
    const sessionTokenDigest = digest(JSON.stringify({
      id: user.id,
      pin: user.session.pin,
      salt: user.session.salt,
      jwt: user.session.jwt,
    }))
    if (textIsEmpty(sessionTokenDigest)) throw new Error("session token is not valid")
    if (sessionTokenDigest !== sessionToken) throw new Error("session token changed during session")
    return next()
  } catch (e) {
    await log(e, req)
    return res.sendStatus(404)
  }
}
app.get("/admin/",
  addJwt,
  verifySession,
  adminOnly,
  async(req, res) => {
    try {
      return res.send(readFileSync("./html/admin.html"))
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
        const fileType = await import('file-type')
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
function arrayToMap(array) {
  return array.reduce((map, user) => {
    map[user.id] = user
    return map
  }, {})
}
app.get("/db/migration/",
  async (req, res) => {
    const db = db
    try {
      const doc = await db.get("user")
      if (doc.user) return res.sendStatus(404)
    } catch (e) {
      const doc = await db.get("users")
      const map = arrayToMap(doc.users)
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
      if (textIsEmpty(req.params.expert)) return res.sendStatus(404)
      if (req.params.expert === "release-notes") return res.send(readFileSync("./html/release-notes.html"))
      if (req.params.expert === "login") return res.send(readFileSync("./html/login.html"))
      if (req.params.expert === "nutzervereinbarung") return res.send(readFileSync(`./html/nutzervereinbarung.html`))
      if (req.params.expert === "datenschutz") return res.send(readFileSync(`./html/datenschutz.html`))
      const doc = await db.get("user")
      const locationExpert = Object.values(doc.user)
      .find(user => user.getyour?.expert?.name === req.params.expert)
      if (locationExpert) {
        return res.send(readFileSync("./html/expert.html"))
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
      const doc = await db.get("user")
      const html = getOpenParamsHtml(doc, req)
      if (!textIsEmpty(html)) {
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
  verifySession,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      let html = getParamsWritableHtml(doc, req)
      if (!textIsEmpty(html)) {
        return res.send(html)
      }
      html = getParamsExpertHtml(doc, req)
      if (!textIsEmpty(html)) {
        return res.send(html)
      }
      html = getAuthorizedHtml(req)
      if (!textIsEmpty(html)) {
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
        const doc = await db.get("user")
        const html = getOpenParamsHtml(doc, req)
        if (!textIsEmpty(html)) {
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
  console.log(log)
  const doc = await db.get("logs")
  doc.logs.unshift(log)
  await db.insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })
}
async function verifyReferer(req, res, next) {
  try {
    if (req.body.referer !== undefined) {
      if (req.body.referer === "") {
        return next()
      } else {
        if (!textIsEmpty(req.body.referer)) {
          const referer = new URL(req.body.referer)
          const isLocaltunnel = referer.origin.endsWith(".loca.lt") && referer.protocol === "https:"
          if (allowedOrigins.includes(referer.origin) || isLocaltunnel) {
            req.referer = referer
            return next()
          }
        }
        if (req.location.url.pathname === "/") return next()
      }
    }
    return res.sendStatus(404)
  } catch (error) {
    return res.sendStatus(404)
  }
}
app.post('/admin/exec/command/', 
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
app.post("/get/feed/", 
  async (req, res) => {
    try {
      const funnel = parseInt(req.body.funnel)
      if (numberIsEmpty(funnel)) throw new Error("req.body.funnel is empty")
      const algo = req.body.algo
      if (textIsEmpty(algo)) throw new Error("req.body.algo is empty")
      const doc = await db.get("user")
      const funnelId = Object.values(doc.user)
        .flatMap(it => it.funnel || [])
        .find(it => it.created === funnel).id
      const feed = Object.values(doc.user)
        .flatMap(it => it.feed || [])
        .filter(it => it.id === funnelId)
        // .filter(it => it.verified)
      if (!feed || feed.length <= 0) throw new Error("feed is empty")
      return res.send(feed)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/retell/call/contact/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const apiKey = req.jwt.user.retell?.apiKey
      if (!apiKey) return res.sendStatus(404)
      const fromNumber = req.body.fromNumber
      if (textIsEmpty(fromNumber)) throw new Error("req.body.fromNumber is empty")
      const emailReceiver = req.body.emailReceiver
      if (textIsEmpty(emailReceiver)) throw new Error("req.body.emailReceiver is empty")
      const contact = req.body.contact
      if (objectIsEmpty(contact)) throw new Error("req.body.contact is empty")
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
        const doc = await db.get("user")
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
        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      }
      return res.send(result)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/retell/api-key/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
function getExpertAlias(user) {
  return user.getyour.expert.alias || undefined
}
app.post("/jwt/get/experts",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      const experts = Object.values(doc.user)
      .filter(user => isExpert(user) && user.id !== req.jwt.id)
      .map(user => {
        return {
          id: user.id, 
          email: user.email
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const name = req.jwt.user.getyour?.expert?.name
      if (!name) return res.sendStatus(404)
      return res.send(name)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/expert/names/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      const locationExpert = Object.values(doc.user).find(user => isLocationExpert(user, req))
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
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      if (!req.location) return res.sendStatus(404)
      const doc = await db.get("user")
      const locationExpert = Object.values(doc.user).find(user => isLocationExpert(user, req))
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
app.post("/expert/get/js/paths/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
function userTagToValue(user, tag) {
  const tree = tag.split("-")
  let value = user
  for (let i = 0; i < tree.length; i++) {
    if (value !== undefined) {
      value = value[tree[i]]
    } else {
      break
    }
  }
  return value
}
function userTagsToValue(user, tags) {
  const result = {}
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i]
    result[tag] = userTagToValue(user, tag)
  }
  return result
}
app.post("/get/location/lists/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (arrayIsEmpty(req.body.ids)) throw new Error("req.body.ids is empty")
          if (arrayIsEmpty(req.body.tags)) throw new Error("req.body.tags is empty")
          const doc = await db.get("user")
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
                          clone[id] = userTagsToValue(user, req.body.tags)
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
        if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
        if (textIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
        const location = req.body.path.split("/")[2]
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (isExpert(jwtUser)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("logs")
      if (!doc.logs || doc.logs.length <= 0) throw new Error("logs are empty")
      return res.send(doc.logs)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/match-maker/condition-expert/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
          const doc = await db.get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
          const array = []
          const doc = await db.get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            const userIsWritable = await isLocationWritable(doc, req)
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const matchMakerCreated = req.body.created
      if (numberIsEmpty(matchMakerCreated)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const matchMaker = getPlatforms(user)
      .flatMap(platform => getMatchMaker(platform) || [])
      .find(matchMaker => matchMaker.created === matchMakerCreated)
      if (objectIsEmpty(matchMaker) || objectIsEmpty(matchMaker.conditions)) return res.sendStatus(404)
      const conditions = Object.values(matchMaker.conditions)
      return res.send(conditions)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/match-maker/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      const platform = findPlatform(platformName, req.jwt.user)
      const matchMaker = platform["match-maker"]
      if (objectIsEmpty(matchMaker)) return res.sendStatus(404)
      return res.send(Object.values(matchMaker))
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function userTreeExist(user, tree) {
  if (user[tree] !== undefined) return true
  const pathArray = tree.split('.')
  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i]
    if (i + 1 === pathArray.length) {
      if (user[key] !== undefined) return true
    }
    if (user[key] !== undefined) {
      user = user[key]
    }
  }
  return false
}
function userTreeToValue(user, tree) {
  const treeSplit = tree.split(".")
  let value = user
  for (let i = 0; i < treeSplit.length; i++) {
    if (value !== undefined) {
      value = value[treeSplit[i]]
    } else {
      break
    }
  }
  return value
}
function verifyUserCondition(user, condition) {
  const value = userTreeToValue(user, condition.left)
  if (condition.right === "undefined") condition.right = undefined
  if (condition.right === "null") condition.right = null
  if (condition.operator === "!=") {
    return value !== condition.right
  }
  if (condition.operator === "=") {
    return value === condition.right
  }
  if (condition.operator === "<=") {
    return value <= condition.right
  }
  if (condition.operator === ">=") {
    return value >= condition.right
  }
  if (condition.operator === "<") {
    return value < condition.right
  }
  if (condition.operator === ">") {
    return value > condition.right
  }
  return false
}
app.post("/get/match-maker/keys/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
        if (arrayIsEmpty(req.body.mirror)) throw new Error("req.body.mirror is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]

        for (let i = 0; i < req.body.conditions.length; i++) {
          const condition = req.body.conditions[i]
          if (user.id === req.jwt.id) {
            if (userTreeExist(user, condition.left) === true) {
              if (verifyUserCondition(user, condition) === false) {
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
            if (userTreeExist(user, tree) === true) {
              clone[tree.replace(/\./g, "-")] = userTreeToValue(user, tree)
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
        if (textIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          for (let i = 0; i < req.body.conditions.length; i++) {
            const condition = req.body.conditions[i]
            if (verifyUserCondition(jwtUser, condition) === false) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
        if (arrayIsEmpty(req.body.mirror)) throw new Error("req.body.mirror is empty")
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        for (let i = 0; i < req.body.conditions.length; i++) {
          const condition = req.body.conditions[i]
          if (jwtUser.id === req.jwt.id) {
            if (userTreeExist(jwtUser, condition.left) === true) {
              if (verifyUserCondition(jwtUser, condition) === false) {
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
            if (userTreeExist(user, tree) === false) continue userloop
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
app.post("/get/open/:list/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          const array = []
          const doc = await db.get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            const userIsWritable = isLocationWritable(doc, req)
            if (userIsWritable) {
              for (const key in doc.user) {
                const user = doc.user[key]
                if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      const starts = Object.values(doc.user)
      .filter(it => isVerified(it))
      .flatMap(it => Object.values(it.platforms) || [])
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
function objectIsEmpty(input) {
  return typeof input !== "object" ||
    input === undefined ||
    input === null ||
    Object.getOwnPropertyNames(input).length <= 0
}
function arrayIsEmpty(input) {
  return !Array.isArray(input) || input.length <= 0
}
app.post("/location-expert/get/platform/values/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is emtpy")
      const doc = await db.get("user")
      const user = req.jwt.user
      const platform = findPlatform(platformName, user)
      if (objectIsEmpty(platform.values)) return res.sendStatus(404)
      const values = getValues(platform)
      if (!values || values.length <= 0) return res.sendStatus(404)
      sortCreatedDesc(values)
      return res.send(values)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/values-writable/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.location !== undefined) {
        if (req.jwt !== undefined) {
          const array = []
          const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
      const user = req.jwt.user
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  expertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is emtpy")
      const doc = await db.get("user")
      const paths = getPlatformsByName(doc, req.body.platform)
      .flatMap(it => getValues(it) || [])
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is emtpy")
      const platform = findPlatform(platformName, req.jwt.user)
      const paths = getValues(platform).map(it => it.path)
      if (!paths || paths.length <= 0) return res.sendStatus(404)
      return res.send(paths)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/role-apps/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
          const doc = await db.get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            if (jwtUser.roles !== undefined) {
              for (let i = 0; i < jwtUser.roles.length; i++) {
                const role = jwtUser.roles[i]
                if (role === req.body.id) {
                  for (const key in doc.user) {
                    const user = doc.user[key]
                    if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationWritableOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
        const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      const platform = findPlatform(platformName, req.jwt.user)
      if (objectIsEmpty(platform.roles)) return res.sendStatus(404)
      return res.send(Object.values(platform.roles))
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/visibility-expert/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
          const doc = await db.get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
          if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
          const doc = await db.get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          const doc = await db.get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.urlId)) throw new Error("req.body.urlId is empty")
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  jwtIsUrlId,
  async (req, res, next) => {
    try {
      const key = req.params.key
      const value = req.body[key]
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!user[req.location.platform]) user[req.location.platform] = {}
      user[req.location.platform][key] = value
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/value/paths/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is emtpy")
      const platform = getUserPlatformByName(req.jwt.user, platformName)
      const paths = getValues(platform)
      .flatMap(value => value.path || [])
      if (!paths || paths.length <= 0) return res.sendStatus(404)
      return res.send(paths)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/value-visibility-location-expert/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (textIsEmpty(req.body.path)) throw new Error("req.body.path is emtpy")
          const doc = await db.get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (textIsEmpty(req.body.path)) throw new Error("req.body.path is emtpy")
          const doc = await db.get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      const users = Object.values(doc.user)
      const experts = users.filter(user => isExpert(user))
      const platforms = experts.flatMap(it => getPlatforms(it))
      const values = platforms.flatMap(it => getValues(it) || [])
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  expertOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          const doc = await db.get("user")
          const user = doc.user[req.jwt.id]
          if (user.id === req.jwt.id) {
            if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          const doc = await db.get("user")
          const jwtUser = doc.user[req.jwt.id]
          if (jwtUser.id === req.jwt.id) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (isLocationExpert(user, req)) {
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        const array = []
        const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      const chats = findJwtChats(doc, req.jwt.id)
      if (!chats || chats.length <= 0) return res.sendStatus(404)
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
      const array = []
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const funnel = req.jwt.user.funnel
      if (!funnel || funnel.length <= 0) return res.sendStatus(404)
      return res.send(funnel)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/id-by-email/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const email = req.body.email
      if (textIsEmpty(email)) throw new Error("req.body.email is empty")
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (isAdmin(user)) {
            const user = doc.user[req.body.id]
            if (user.id === req.body.id) {
              let result
              if (req.body.key.includes(".")) {
                result = userTreeToValue(user, req.body.key)
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
      if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
      if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const tree = req.body.tree
      if (textIsEmpty(tree)) throw new Error("req.body.tree is empty")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (arrayIsEmpty(req.body.trees)) throw new Error("req.body.trees is empty")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
function sortContactsByEmail(contacts) {
  return Object.values(contacts).sort((a, b) => {
    if (a.email < b.email) return -1
    if (a.email > b.email) return 1
    return 0
  })
}
app.post("/jwt/get/user/:key/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      const users = Object.values(doc.user)
      .filter(user => isVerified(user))
      .filter(user => isExpert(user))
      .map(user => ({
        alias: user.getyour.expert.alias,
        description: user.getyour.expert.description,
        image: user.getyour.expert.image,
        name: user.getyour.expert.name,
        platforms: getPlatforms(user)?.length || 0,
        values: getPlatforms(user)?.flatMap(platform => getValues(platform))?.length || 0,
        reputation: user.reputation,
        xp: user.xp
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
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
function capFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
function tagToAllFirstUpper(tag) {
  const tagSplit = tag.split("-")
  const results = []
  for (let i = 0; i < tagSplit.length; i++) {
    results.push(capFirst(tagSplit[i]))
  }
  const output = results.join(" ")
  if (textIsEmpty(output)) throw new Error(`tag is empty`)
  return output
}
app.post("/get/users/profile/open/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
          const roleName = tagToAllFirstUpper(platformRole.name)
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.location !== undefined) {
        if (textIsEmpty(req.body.preference)) throw new Error("req.body.preference is empty")
        if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
        if (textIsEmpty(req.body.subject)) throw new Error("req.body.subject is empty")
        if (req.body.subject.length > 144) throw new Error("req.body.subject too long")
        const doc = await db.get("user")
        for (const key in doc.user) {
          const user = doc.user[key]
          if (isLocationExpert(user, req)) {
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
                if (textIsEmpty(req.body.tel)) throw new Error("req.body.tel is empty")
                contact.phone = req.body.tel
              }
              contact.lead.preference = req.body.preference
              user.contacts.unshift(contact)
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              await sendEmailFromDroid({
                from: "<droid@get-your.de>",
                to: contact.email,
                subject: "[getyour] Kontaktanfrage erfolgreich gesendet",
                html: `
                Du hast eine neue Kontaktanfrage gesendet.
                Schon Bald wird sich Dein persönlicher Ansprechpartner, bei Dir, per ${contact.lead.preference}, melden.
                `
              })
              await sendEmailFromDroid({
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
                    if (textIsEmpty(req.body.tel)) throw new Error("req.body.tel is empty")
                    contact.phone = req.body.tel
                  }
                  contact.lead.preference = req.body.preference
                  await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
                  await sendEmailFromDroid({
                    from: "<droid@get-your.de>",
                    to: contact.email,
                    subject: "[getyour] Kontaktanfrage erfolgreich gesendet",
                    html: `
                    Sie haben eine neue Kontaktanfrage gesendet.
                    Schon Bald wird sich Ihr persönlicher Ansprechpartner, bei Ihnen, per ${contact.lead.preference}, melden.
                    `
                  })
                  await sendEmailFromDroid({
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.apiKey)) throw new Error("req.body.apiKey is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.retell) user.retell = {}
      user.retell.apiKey = req.body.apiKey
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/deadlines/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const user = req.jwt.user
      if (!user.deadlines) return res.sendStatus(404)
      const deadlines = Object.values(user.deadlines)
      if (!deadlines || deadlines.length <= 0) return res.sendStatus(404)
      return res.send(deadlines)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/deadline/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const alias = req.body.alias
      const date = req.body.date
      const notes = req.body.notes
      const reminder = req.body.reminder
      const id = req.jwt.id
      if (numberIsEmpty(date)) throw new Error(`req.body.date is empty`)
      if (numberIsEmpty(reminder)) throw new Error(`req.body.reminder is empty`)
      const doc = await db.get("user")
      const user = doc.user[id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.deadlines || user.deadlines.length === 0) user.deadlines = {}
      const created = Date.now()
      user.deadlines[created] = {
        alias,
        created,
        date,
        notes,
        reminder
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/update/deadline/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const alias = req.body.alias
      const created = req.body.created
      const date = req.body.date
      const id = req.jwt.id
      const notes = req.body.notes
      const reminder = req.body.reminder
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[id]
      if (!isJwt(user, req) || !user.deadlines) return res.sendStatus(404)
      const deadline = user.deadlines[created]
      if (!deadline) return res.sendStatus(404)
      if (alias) deadline.alias = alias
      if (date) deadline.date = date
      if (notes) deadline.notes = notes
      if (reminder) deadline.reminder = reminder
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/remove/deadline/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.deadlines) return res.sendStatus(404)
      const deadline = user.deadlines[created]
      if (!deadline) return res.sendStatus(404)
      delete user.deadlines[created]
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/email/admin/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
      if (!emailIsAdmin(req.body.email)) return res.sendStatus(404)
      if (emailIsAdmin(req.body.email)) {
        const doc = await db.get("user")
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
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
              return res.sendStatus(200)
            }
          }
        }
        {
          const user = {}
          user.id = digestId(req.body.email)
          user.email = req.body.email
          user.verified = true
          user.reputation = 0
          user.created =  Date.now()
          user.admin = {}
          user.admin.type = "role"
          user.roles =  []
          user.roles.push(UserRole.ADMIN)
          doc.user[user.id] = user
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
          return res.sendStatus(200)
        }
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function roleExist(role, roles) {
  for (let i = 0; i < roles.length; i++) {
    if (roles[i] === role) return true
  }
  return false
}
app.post("/admin/register/email/expert/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
      if (textIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
      const doc = await db.get("user")
      for (const key in doc.user) {
        const child = doc.user[key]
        if (child.email === req.body.email) {
          if (isExpert(child)) {
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
            if (!roleExist(UserRole.EXPERT, child.roles)) {
              child.roles.push(UserRole.EXPERT)
            }
            await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            return res.sendStatus(200)
          }
        }
      }
      {
        const child = {}
        child.id = digestId(req.body.email)
        child.email = req.body.email
        child.verified =  false
        child.created =  Date.now()
        child.reputation = 0
        child.roles =  []
        child.getyour = {}
        child.getyour.expert = {}
        child.getyour.expert.type = "role"
        child.getyour.expert.name = req.body.name
        if (!roleExist(UserRole.EXPERT, child.roles)) {
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function digestId(email) {
  return digest(JSON.stringify({email, verified: true}))
}
app.post("/register/email/location/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      if (textIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
      const doc = await db.get("user")
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
            await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            return res.sendStatus(200)
          }
        }
      }
      {
        const user = {}
        user.id = digestId(req.body.email)
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/email/numerology/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      if (textIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
      if (textIsEmpty(req.body.date)) throw new Error("req.body.date is empty")
      const doc = await db.get("user")
      for (const key in doc.user) {
        const user = doc.user[key]
        if (user.email === req.body.email) {
          let foundRole = false
          if (user.roles && user.roles.includes(req.body.created)) {
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
            await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
            return res.sendStatus(200)
          }
        }
      }
      {
        const user = {}
        user.id = digestId(req.body.email)
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/location/feedback/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const text = req.body.text
      if (textIsEmpty(text)) throw new Error("req.body.text is empty")
      if (text.length > 377) throw new Error("feedback too long")
      const importance = req.body.importance
      if (textIsEmpty(importance)) throw new Error("req.body.importance is empty")
      const doc = await db.get("user")
      const locationExpert = Object.values(doc.user).find(user => isLocationExpert(user, req))
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/groups/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      const jwtUser = doc.user[req.jwt.id]
      if (!jwtUser || jwtUser.id !== req.jwt.id) return res.sendStatus(404)
      const array = []
      const users = Object.values(doc.user)
      for (const user of users) {
        const groups = user.groups || {}
        for (const groupId in groups) {
          const group = groups[groupId]
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
app.post("/jwt/register/group/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const emails = req.body.emails
      if (arrayIsEmpty(emails)) throw new Error("req.body.emails is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.groups || user.groups.length === 0) user.groups = {}
      const created = Date.now()
      if (!emails.includes(user.email)) emails.push(user.email)
      user.groups[created] = {
        created,
        emails
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/group/alias/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const alias = req.body.alias
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.groups) return res.sendStatus(404)
      const group = user.groups[created]
      if (!group) return res.sendStatus(404)
      group.alias = alias
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/group/emails/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const emails = req.body.emails
      if (arrayIsEmpty(emails)) throw new Error("req.body.emails is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.groups) return res.sendStatus(404)
      const group = user.groups[created]
      if (!group) return res.sendStatus(404)
      if (!emails.includes(user.email)) {
        group.emails = emails
        group.emails.push(user.email)
      } else {
        group.emails = emails
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/remove/group/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.groups) return res.sendStatus(404)
      const group = user.groups[created]
      if (!group) return res.sendStatus(404)
      delete user.groups[created]
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/verify/group/creator/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const user = req.jwt.user
      if (!user || !user.groups) return res.sendStatus(404)
      const group = user.groups[created]
      if (!group) return res.sendStatus(404)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/location/list/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
      if (objectIsEmpty(req.body.item)) throw new Error("req.body.item is empty")
      const doc = await db.get("user")
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/location/map/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user[req.location.platform]) user[req.location.platform] = {}
      for (const key in req.body.map) {
        user[req.location.platform][key] = req.body.map[key]
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/location/requested/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      for (const user of Object.values(doc.user)) {
        if (isLocationExpert(user, req)) {
          const value = user.getyour.expert.platforms
          .find(it => it.name === req.location.platform).values
          .find(it => it.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`)
          if (!value.requested) value.requested = 0
          value.requested++
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
app.post("/get/platforms/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
      const platforms =  Object.values(doc.user)
      .filter(user => isVerified(user))
      .filter(user => isLocationExpert(user, req))
      .flatMap(user => getPlatforms(user))
      .filter(platform => platform.visibility === "open")
      .map(platform => ({
        name: platform.name,
        image: platform.image
      }))
      if (!platforms || platforms.length <= 0) return res.sendStatus(404)
      return res.send(platforms)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/get/platform/values/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      const doc = await db.get("user")
      const values = Object.values(doc.user)
      .filter(user => isVerified(user))
      .flatMap(user => getPlatforms(user))
      .filter(platform => platform.name === platformName)
      .filter(platform => platform.visibility === "open")
      .flatMap(platform => getValues(platform) || [])
      .filter(value => value.visibility === "open")
      .map(value => ({alias: value.alias, image: value.image, path: value.path}))
      if (!values || values.length <= 0) throw new Error("values empty")
      return res.send(values)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/user/info/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (textIsEmpty(id)) throw new Error("req.body.id is empty")
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (textIsEmpty(id)) throw new Error("req.body.id is empty")
      console.log(id)
      const doc = await db.get("user")
      const expert = doc.user[id]
      if (!isExpert(expert)) throw new Error("req.body.id is not an expert")
      const paths = getPlatforms(expert)
      .flatMap(platform => getValues(platform) || [])
      .flatMap(value => value.path || [])
      if (!paths || paths.length <= 0) return res.sendStatus(404)
      return res.send(paths)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/js/scripts/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const directoryPath = path.join(__dirname, "../client/js")
      fs.readdir(directoryPath, (err, files) => {
        if (err) throw new Error("Unable to scan directory: " + err)
        const fileList = files.map(file => {
          const filePath = path.join(directoryPath, file)
          const fileContent = fs.readFileSync(filePath, 'utf8')
          return { name: file, content: fileContent }
        })
        if (!fileList || fileList.length <= 0) throw new Error("scripts in path '/js' not found")
        return res.send(fileList)
      })
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platform = req.body.platform
      if (textIsEmpty(platform)) throw new Error("req.body.platform is empty")
      const userPlatform = getUserPlatformByName(req.jwt.user, platform)
      if (!userPlatform) throw new Error("user platform not found")
      return res.send(userPlatform)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/get/platform/roles/text-value/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
app.post("/location-expert/get/platforms/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const user = req.jwt.user
      const platforms = getPlatforms(user)
      ?.map(platform => ({
        created: platform.created,
        image: platform.image,
        name: platform.name,
        start: platform.start,
        values: getValues(platform).length || 0,
        visibility: platform.visibility
      }))
      if (!platforms || platforms.length <= 0) return res.sendStatus(404)
      return res.send(platforms)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/write-access-allowed/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (textIsEmpty(id)) throw new Error("req.body.id is empty")
      const path = req.body.path
      if (textIsEmpty(path)) throw new Error("req.body.path is empty")
      const doc = await db.get("user")
      const user = doc.user[id]
      const value = findValueByPath(doc, path)
      if (!value.writeAccessRequest) return res.sendStatus(404)
      value.writeAccessRequest = value.writeAccessRequest.filter(it => it !== id)
      if (!value.writability) value.writability = []
      if (!value.writability.some(email => email === user.email)) {
        value.writability.push(user.email)
        await sendWriteAccessEmail("<droid@get-your.de>", user.email, value.path)
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/write-access-denied/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (textIsEmpty(id)) throw new Error("req.body.id is empty")
      const path = req.body.path
      if (textIsEmpty(path)) throw new Error("req.body.path is empty")
      const doc = await db.get("user")
      const user = doc.user[id]
      const value = findValueByPath(doc, path)
      if (!value.writeAccessRequest) return res.sendStatus(404)
      value.writeAccessRequest = value.writeAccessRequest.filter(it => it !== id)
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/write-access-request/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const jwtUser = doc.user[req.jwt.id]
      paths.forEach(path => {
        const value = findValueByPath(doc, path)
        if (!value) return
        if (value.writability && value.writability.some(email => email === jwtUser.email)) return
        if (!value.writeAccessRequest) value.writeAccessRequest = []
        if (!value.writeAccessRequest.some(id => id === req.jwt.id)) value.writeAccessRequest.push(jwtUser.id)
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/match-maker/condition/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const matchMakerCreated = req.body.created
      const left = req.body.left
      const operator = req.body.operator
      const right = req.body.right
      if (numberIsEmpty(matchMakerCreated)) throw new Error("req.body.created is empty")
      if (textIsEmpty(left)) throw new Error("req.body.left is empty")
      if (textIsEmpty(operator)) throw new Error("req.body.operator is empty")
      if (textIsEmpty(right)) throw new Error("req.body.right is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const match = getPlatforms(user)
      .flatMap(platform => getMatchMaker(platform) || [])
      .find(matchMaker => matchMaker.created === matchMakerCreated)
      if (!match) return res.sendStatus(404)
      if (!match.conditions || match.conditions.length === 0) match.conditions = {}
      const created = Date.now()
      match.conditions[created] = {
        created,
        left,
        operator,
        right,
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/match-maker/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      const matchMakerName = req.body.name
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      if (textIsEmpty(matchMakerName)) throw new Error("req.body.name is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platform = findPlatform(platformName, user)
      if (!platform["match-maker"] || platform["match-maker"].length === 0) platform["match-maker"] = {}
      const created = Date.now()
      platform["match-maker"][created] = {
        created,
        name: matchMakerName,
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/role/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      const roleName = req.body.name
      const homePath = req.body.home
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      if (textIsEmpty(roleName)) throw new Error("req.body.name is empty")
      if (textIsEmpty(homePath)) throw new Error("req.body.home is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platform = getUserPlatformByName(user, platformName)
      if (!platform) return res.sendStatus(404)
      if (!platform.roles || platform.roles.length === 0) platform.roles = {}
      const exist = getRoles(platform).some(role => role.name === roleName)
      if (exist) return res.sendStatus(404)
      const created = Date.now()
      platform.roles[created] = {
        created,
        name: roleName,
        home: homePath,
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/name/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const newName = req.body.new
      const oldName = req.body.old
      if (textIsEmpty(newName)) throw new Error("req.body.new is empty")
      if (textIsEmpty(oldName)) throw new Error("req.body.old is empty")
      if (isReserved(oldName)) return res.sendStatus(404)
      if (isReserved(newName)) return res.sendStatus(404)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      const platforms = getPlatforms(user)
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        if (platform.name === oldName) {
          const values = getValues(platform)
          for (let i = 0; i < values.length; i++) {
            const value = values[i]
            value.path = `/${user.getyour.expert.name}/${newName}/${value.path.split("/")[3]}/`
          }
          platform.name = newName
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platform = findPlatform(req.body.platform, user)
      if (!platform) return res.sendStatus(404)
      platform.image = req.body.image ?? "";
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/start/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
      if (textIsEmpty(req.body.start)) throw new Error("req.body.start is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platform = findPlatform(req.body.platform, user)
      platform.start = req.body.start
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/visibility/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      const visibility = req.body.visibility
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      if (textIsEmpty(visibility)) throw new Error("req.body.visibility is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platform = getPlatforms(user).find(platform => platform.name === platformName)
      if (!platform) return res.sendStatus(404)
      platform.visibility = visibility
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/json-platform/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platform = req.body.platform
      if (objectIsEmpty(platform)) throw new Error("req.body.platform is empty")
      const platformName = platform.name
      if (textIsEmpty(platformName)) return res.sendStatus(404)
      if (reservedKeys.has(platformName)) return res.sendStatus(404)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isExpert(user)) return res.sendStatus(404)
      if (!user.platforms || user.platforms.length === 0) user.platforms = {}
      const platformExist = Object.values(user.platforms).some(platform => platform.name === platformName)
      if (platformExist) return res.sendStatus(404)
      const expert = req.location.expert
      const created = Date.now()
      const it = {}
      it.name = platformName
      it.created = created
      if (platform.created) it.created = platform.created
      it.visibility = "closed"
      if (platform.visibility) it.visibility = platform.visibility
      if (platform.start) it.start = updatePathWithExpert(platform.start, expert)
      if (platform["match-maker"]) it["match-maker"] = platform["match-maker"]
      if (platform.values) {
        Object.values(platform.values).forEach(value => {
          value.path = updatePathWithExpert(value.path, expert)
        })
        it.values = platform.values
      }
      if (platform.roles) {
        Object.values(platform.roles).forEach(role => {
          role.home = updatePathWithExpert(role.home, expert)
        })
        it.roles = platform.roles
      }
      if (platform.created) {
        user.platforms[platform.created] = it
      } else {
        user.platforms[created] = it
      }
      if (!user.xp) user.xp = 0
      user.xp += 3
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platform = req.body.platform
      if (textIsEmpty(platform)) throw new Error("req.body.platform is empty")
      if (reservedKeys.has(platform)) return res.sendStatus(404)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platforms = getPlatforms(user)
      const exist = platforms.some(platform => platform.name === platform)
      if (exist) return res.sendStatus(404)
      if (!user.platforms || user.platforms.length === 0) user.platforms = {}
      const created = Date.now()
      user.platforms[created] = {
        created,
        name: platform,
        visibility: "closed",
      }
      if (!user.xp) user.xp = 0
      user.xp += 3
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.jwt.id
      const platformName = req.body.platform
      const alias = req.body.alias
      const path = req.body.path
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      if (textIsEmpty(path)) throw new Error("req.body.path is empty")
      if (textIsEmpty(alias)) throw new Error("req.body.alias is empty")
      const doc = await db.get("user")
      const exist = pathExist(doc, path)
      if (exist) return res.sendStatus(404)
      const user = doc.user[id]
      if (!user && user.id !== id) return res.sendStatus(404)
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      const platform = getUserPlatformByName(user, platformName)
      if (!platform) return res.sendStatus(404)
      const created = Date.now()
      const value = {}
      value.alias = alias
      value.authorized = []
      value.created = created
      value.html = readFileSync("./html/toolbox.html")
      value.path = `/${user.getyour.expert.name}/${platform.name}/${path}/`
      value.roles = []
      value.type = "text/html"
      value.visibility = "closed"
      if (!platform.values || platform.values.length === 0) platform.values = {}
      platform.values[created] = value
      if (!user.xp) user.xp = 0
      user.xp++
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/platform/value-html-writable/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.html)) throw new Error("req.body.html is empty")
      const doc = await db.get("user")
      const jwtUser = doc.user[req.jwt.id]
      const value = findValueByPath(doc, `/${req.location.expert}/${req.location.platform}/${req.location.path}/`)
      if (value.writability !== undefined) {
        for (let i = 0; i < value.writability.length; i++) {
          const authorized = value.writability[i]
          if (jwtUser.email === authorized) {
            value.html = req.body.html
            if (jwtUser.xp === undefined) jwtUser.xp = 0
            jwtUser.xp++
            if (value.saved === undefined) value.saved = 0
            value.saved++
            await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
app.post("/register/platform/value-html-location-expert/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.html)) throw new Error("req.body.html is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const value = findValueByPath(doc, `/${req.location.expert}/${req.location.platform}/${req.location.path}/`)
      if (!value) throw new Error("value not found")
      value.html = req.body.html
      if (user.xp === undefined) user.xp = 0
      user.xp++
      if (value.saved === undefined) value.saved = 0
      value.saved++
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/name/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.jwt.id
      const name = req.body.name
      if (textIsEmpty(name)) throw new Error("req.body.name is empty")
      const doc = await db.get("user")
      const user = doc.user[id]
      if (!user || user.id !== id || !isExpert(user)) return res.sendStatus(404)
      user.getyour.expert.name = name
      const platforms = getPlatforms(user)
      if (platforms) {
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i]
          const values = getValues(platform)
          const roles = getRoles(platform)
          if (values) {
            for (let i = 0; i < values.length; i++) {
              const value = values[i]
              if (value.path) {
                const pathName = value.path.split("/")[3]
                value.path = `/${req.body.name}/${platform.name}/${pathName}/`
              }
            }
          }
          if (roles) {
            for (let i = 0; i < roles.length; i++) {
              const role = roles[i]
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/path/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.old)) throw new Error("req.body.old is empty")
      if (textIsEmpty(req.body.new)) throw new Error("req.body.new is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(req.body.old, user)
      const expert = value.path.split("/")[1]
      const platform = value.path.split("/")[2]
      value.path = `/${expert}/${platform}/${req.body.new}/`
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/alias/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
      if (textIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(req.body.path, user)
      value.alias = req.body.alias
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/image/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(req.body.path, user)
      value.image = req.body.image
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/visibility/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const path = req.body.path
      const visibility = req.body.visibility
      const roles = req.body.roles
      if (textIsEmpty(path)) throw new Error("req.body.path is empty")
      if (textIsEmpty(visibility)) throw new Error("req.body.visibility is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(path, user)
      if (visibility === "open") {
        value.visibility = visibility
        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
      if (visibility === "closed") {
        value.visibility = visibility
        value.roles = roles
        value.authorized = req.body.authorized
        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function getMatchMaker(platform) {
  return Object.values(platform["match-maker"] || {})
}
function getConditions(match) {
  return Object.values(match.conditions || {})
}
app.post("/location-expert/remove/match-maker/condition/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platforms = getPlatforms(user)
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        const matchMaker = getMatchMaker(platform)
        for (let j = 0; j < matchMaker.length; j++) {
          const match = matchMaker[j]
          const conditions = getConditions(match)
          for (let k = 0; k < conditions.length; k++) {
            const condition = conditions[k]
            if (condition.created === created) {
              delete match.conditions[created]
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platforms = getPlatforms(user)
      if (!platforms) return res.sendStatus(404)
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        const matchMaker = getMatchMaker(platform)
        if (!matchMaker) continue
        for (let i = 0; i < matchMaker.length; i++) {
          const match = matchMaker[i]
          if (match.created === created) {
            delete platform["match-maker"][created]
            await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
app.post("/location-expert/remove/paths/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        const platformName = path.split("/")[2]
        const platform = user.getyour?.expert?.platforms?.find(it => it.name === platformName)
        if (!platform || !platform.values) return
        platform.values = platform.values.filter(it => it.path !== path)
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/paths/scripts/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        user.getyour?.expert?.platforms?.forEach(platform => {
          const value = platform.values?.find(value => value.path === path)
          if (value) {
            value.html = removeScripts(value.html)
          }
        })
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/platform/role/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const roleCreated = req.body.created
      const platformName = req.body.platform
      if (numberIsEmpty(roleCreated)) throw new Error("req.body.created is empty")
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platform = getUserPlatformByName(user, platformName)
      const role = platform.roles[roleCreated]
      if (!role) return res.sendStatus(404)
      delete platform.roles[roleCreated]
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function removeUserValueByPath(user, path) {
  Object.values(user.platforms).forEach(platform => {
    if (platform.values) {
      Object.values(platform.values).forEach(value => {
        if (value.path === path) {
          delete platform.values[value.created]
        }
      })
    }
  })
}
app.post("/location-expert/remove/platform/value/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const path = req.body.path
      if (textIsEmpty(path)) throw new Error("req.body.path is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      removeUserValueByPath(user, path)
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/remove/platform/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      if (reservedKeys.has(req.body.platform)) return res.sendStatus(404)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!user.platforms) return res.sendStatus(404)
      const platform = user.platforms[created]
      if (!platform) return res.sendStatus(404)
      delete user.platforms[created]
      const platforms = getPlatforms(user)
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/meta-tags/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      paths.forEach(path => {
        const value = findUserValueByPath(user, path)
        if (!value) return
        const meta1 = `<meta http-equiv="X-UA-Compatible" content="IE=edge">`
        const regex1 = new RegExp(meta1)
        const meta2 = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
        const regex2 = new RegExp(meta2)
        const meta3 = `<meta charset="utf-8">`
        const regex3 = new RegExp(meta3)
        if (regex1.test(value.html)) value.html = value.html.replace(regex1, meta1)
        else value.html = value.html.replace("<head>", `<head>${meta1}`)
        if (regex2.test(value.html)) value.html = value.html.replace(regex2, meta2)
        else value.html = value.html.replace("<head>", `<head>${meta2}`)
        if (regex3.test(value.html)) value.html = value.html.replace(regex3, meta3)
        else value.html = value.html.replace("<head>", `<head>${meta3}`)
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/automated-true/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      paths.forEach(path => {
        const value = findUserValueByPath(user, path)
        if (!value) return
        value.automated = true
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/automated-false/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      paths.forEach(path => {
        const value = findUserValueByPath(user, path)
        if (!value) return
        value.automated = false
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/empty-writability/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      paths.forEach(path => {
        const value = findUserValueByPath(user, path)
        if (!value) return
        value.writability = []
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/reset-requested/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      paths.forEach(path => {
        const value = findUserValueByPath(user, path)
        if (!value) return
        value.requested = 0
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/visibility-closed/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      paths.forEach(path => {
        const value = findUserValueByPath(user, path)
        if (!value) return
        value.visibility = "closed"
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/tag/paths/visibility-open/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isLocationExpert(user, req)) return res.sendStatus(404)
      paths.forEach(path => {
        const value = findUserValueByPath(user, path)
        if (!value) return
        value.visibility = "open"
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function deepJsonCopy(it) {
  return JSON.parse(JSON.stringify(it))
}
app.post("/location-expert/send/platform/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const idToSend = req.body.id
      const platformCreated = req.body.created
      if (textIsEmpty(idToSend)) throw new Error("req.body.id is empty")
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!user.platforms) return res.sendStatus(404)
      const userPlatform = user.platforms[platformCreated]
      if (!userPlatform) throw new Error("platform not found")
      const receiver = doc.user[idToSend]
      if (!isExpert(receiver)) return res.sendStatus(404)
      const domain = receiver.getyour.expert.name
      if (!receiver.platforms) receiver.platforms = {}
      receiver.platforms[platformCreated] = deepJsonCopy(userPlatform)
      const receiverPlatform = receiver.platforms[platformCreated]
      const receiverPlatformValues = getValues(receiverPlatform)
      if (receiverPlatformValues) {
        for (let j = 0; j < receiverPlatformValues.length; j++) {
          const value = receiverPlatformValues[j]
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/send/value/paths/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const id = req.body.id
      if (textIsEmpty(id)) throw new Error("req.body.id is empty")
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const platform = req.body.platform
      if (textIsEmpty(platform)) throw new Error("req.body.platform is empty")
      const doc = await db.get("user")
      const jwtUser = doc.user[req.jwt.id]
      paths.forEach(path => {
        const value = findUserValueByPath(jwtUser, path)
        if (!value) return
        const clone = structuredClone(value)
        if (!clone) return
        const split = clone.path.split("/")
        const receiver = doc.user[id]
        if (!isExpert(receiver)) return
        const receiverPlatform = getUserPlatformByName(receiver, platform)
        if (!receiverPlatform || !receiverPlatform.values) return
        const valueExist = getValues(receiverPlatform).find(platform => platform.path === clone.path)
        if (valueExist) return
        clone.path = `/${receiver.getyour.expert.name}/${split[2]}/${split[3]}/`
        const created = clone.created || Date.now()
        receiverPlatform.values[created] = clone
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/platform/value/writability/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const writability = req.body.writability
      const path = req.body.path
      if (textIsEmpty(path)) throw new Error("req.body.path is empty")
      if (!Array.isArray(writability)) throw new Error("req.body.writability is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const value = findUserPlatformValueByPath(path, user)
      value.writability = writability
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      for (let i = 0; i < writability.length; i++) {
        const email = writability[i]
        if (email === user.email) continue
        await sendWriteAccessEmail(user.email, email, path)
      }
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/register/tree/map/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
      if (objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")
      await registerTreeMapById(req.body.tree, req.body.map, req.jwt.id)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/update/match-maker/condition/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      if (textIsEmpty(req.body.left)) throw new Error("req.body.left is empty")
      if (textIsEmpty(req.body.operator)) throw new Error("req.body.operator is empty")
      if (textIsEmpty(req.body.right)) throw new Error("req.body.right is empty")
      const doc = await db.get("user")
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
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const id = req.params.id
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      paths.forEach(path => {
        getPlatforms(user).forEach(platform => {
          const value = getValues(platform).find(value => value.path === path)
          if (value) {
            value.html = replaceScript(value.html, id)
          }
        })
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/update/toolbox/path/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const path = req.body.path
      if (textIsEmpty(path)) throw new Error("req.body.path is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platforms = getPlatforms(user)
      if (platforms) {
        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i]
          const values = getValues(platform)
          if (values) {
            for (let i = 0; i < values.length; i++) {
              const value = values[i]
              if (value.path === path) {
                value.html = replaceScript(value.html, "toolbox-getter")
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationWritableOnly,
  async (req, res, next) => {
    try {
      const paths = req.body.paths
      if (arrayIsEmpty(paths)) throw new Error("req.body.paths is empty")
      const doc = await db.get("user")
      paths.forEach(path => {
        const value = findValueByPath(doc, path)
        if (value && isValueWritableByUser(value, req.jwt.user)) {
          value.html = replaceScript(value.html, "toolbox-getter")
        }
      })
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/update/platform/role/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const roleCreated = req.body.created
      const platformName = req.body.platform
      const roleName = req.body.name
      const homePath = req.body.home
      if (numberIsEmpty(roleCreated)) throw new Error("req.body.created is empty")
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      if (textIsEmpty(roleName)) throw new Error("req.body.name is empty")
      if (textIsEmpty(homePath)) throw new Error("req.body.home is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platform = getUserPlatformByName(user, platformName)
      const roles = getRoles(platform)
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]
        if (role.created === roleCreated) {
          role.name = roleName
          role.home = homePath
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
app.post("/location-expert/verify/match-maker/name/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const name = req.body.name
      if (textIsEmpty(name)) throw new Error("req.body.name is empty")
      if (isReserved(name)) return res.sendStatus(200)
      const doc = await db.get("user")
      const users = Object.values(doc.user)
      for (const user of users) {
        const platforms = getPlatforms(user)
        if (!platforms) continue
        for (const platform of platforms) {
          const matchMaker = platform["match-maker"]
          if (!matchMaker) continue
          const found = Object.values(matchMaker).some(it => it.name === name)
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
app.post("/location-expert/verify/platform/role/name/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const roleName = req.body.name
      const platformName = req.body.platform
      if (textIsEmpty(roleName)) throw new Error("req.body.name is empty")
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      if (isReserved(roleName)) return res.sendStatus(200)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      const platform = getUserPlatformByName(user, platformName)
      if (!platform) return res.sendStatus(404)
      const roles = getRoles(platform)
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]
        if (role.name === roleName) return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/verify/platform/exist/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      const exist = getPlatforms(req.jwt.user).some(platform => platform.name === platformName)
      if (exist) return res.sendStatus(200)
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/location-expert/verify/platform/name/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  async (req, res, next) => {
    try {
      const platformName = req.body.platform
      if (textIsEmpty(platformName)) throw new Error("req.body.platform is empty")
      if (isReserved(platformName)) throw new Error("req.body.platform is reserved")
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/platform/value-visibility-writable/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (req.location !== undefined) {
          if (textIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
          if (textIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
          const doc = await db.get("user")
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
                                  await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  await sendEmailFromDroid({
    from,
    to,
    subject: "[getyour] Schreibrechte erhalten",
    html: `Du kannst ab jetzt, die Werteinheit '${path}' bearbeiten.<br><br><a href="https://www.get-your.de${path}">Klicke hier, um die Werteinheit zu öffnen.</a>`
  })
}
function generateRandomBytes(length) {
  return Array.from(Uint8Array.from(crypto.randomBytes(length)))
}
app.post("/register/session/",
  verifyLocation,
  async (req, res) => {
    try {
      const doc = await db.get("user")
      for (var key in doc.user) {
        const user = doc.user[key]
        if (user.id === req.body.localStorageId) {
          if (objectIsEmpty(user)) throw new Error("user is empty")
          if (textIsEmpty(user.id)) throw new Error("user id is empty")
          if (arrayIsEmpty(user.roles)) throw new Error("user roles is empty")
          const salt = generateRandomBytes(32)
          if (arrayIsEmpty(salt)) throw new Error("salt is empty")
          const jwtToken = jwt.sign({
            id: user.id,
          }, process.env.JWT_SECRET, { expiresIn: '2h' })
          if (textIsEmpty(jwtToken)) throw new Error("jwt token is empty")
          const saltDigest = digest(JSON.stringify(salt))
          if (textIsEmpty(saltDigest)) throw new Error("salt digest is empty")
          const jwtTokenDigest = digest(jwtToken)
          if (textIsEmpty(jwtTokenDigest)) throw new Error("jwt token digest is empty")
          const sessionToken = digest(JSON.stringify({
            id: user.id,
            pin: randomPin,
            salt: saltDigest,
            jwt: jwtTokenDigest,
          }))
          if (textIsEmpty(sessionToken)) throw new Error("session token is empty")
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
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
        if (textIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.templates !== undefined) {
            for (let i = 0; i < user.templates.length; i++) {
              const template = user.templates[i]
              if (template.created === req.body.created) {
                template.alias = req.body.alias
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (textIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.templates !== undefined) {
            for (let i = 0; i < user.templates.length; i++) {
              const template = user.templates[i]
              if (template.created === req.body.id) {
                template.visibility = req.body.visibility
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const tree = req.body.tree
      if (textIsEmpty(tree)) throw new Error("req.body.tree is empty")
      const map = req.body.map
      if (objectIsEmpty(map)) throw new Error("req.body.map is empty")
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
app.post("/register/user/alias/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          user.alias = req.body.alias
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        const doc = await db.get("user")
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
            await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.actual)) throw new Error("req.body.actual is empty")
      if (textIsEmpty(req.body.environment)) throw new Error("req.body.environment is empty")
      if (textIsEmpty(req.body.expected)) throw new Error("req.body.expected is empty")
      if (textIsEmpty(req.body.reproduce)) throw new Error("req.body.reproduce is empty")
      if (objectIsEmpty(req.body.trigger)) throw new Error("req.body.trigger is empty")
      if (textIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
      const doc = await db.get("user")
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/key-visibility/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (textIsEmpty(req.body.key)) throw new Error("req.body.key is empty")
        if (textIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user[req.body.key] !== undefined) {
            for (let i = 0; i < user[req.body.key].length; i++) {
              const it = user[req.body.key][i]
              if (it.created === req.body.id) {
                it.visibility = req.body.visibility
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
      const aboutYou = req.body.aboutYou
      const whyThis = req.body.whyThis
      const motivation = req.body.motivation
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.profile) user.profile = {}
      if (!user.profile.created) user.profile.created = Date.now()
      if (aboutYou && aboutYou.length <= 987) user.profile.aboutYou = aboutYou
      if (whyThis && whyThis.length <= 987) user.profile.whyThis = whyThis
      if (motivation && motivation.length <= 987) user.profile.motivation = motivation
      user.profile.visibility = req.body.visibility
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/profile/message/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      if (textIsEmpty(req.body.message)) throw new Error("req.body.message is empty")
      const doc = await db.get("user")
      const users = Object.values(doc.user)
      for (const user of users) {
        if (!user.profile || user.profile.created !== req.body.created) continue
        if (!user.profile.messages) user.profile.messages = []
        const message = {}
        message.created = Date.now()
        message.html = req.body.message
        user.profile.messages.unshift(message)
        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
      return res.sendStatus(404)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function booleanIsEmpty(bool) {
  return typeof bool !== "boolean" ||
  bool === undefined ||
  bool === null
}
app.post("/admin/register/user/verified/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
      if (booleanIsEmpty(req.body.verified)) throw new Error("req.body.verified is empty")
      const doc = await db.get("user")
      const user = Object.values(doc.user)
      .find(it => it.email === req.body.email)
      if (!user || isAdmin(user)) return res.sendStatus(404)
      user.verified = req.body.verified
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/register/user/text-tree-self/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.text)) throw new Error("req.body.text is empty")
        if (textIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
        const doc = await db.get("user")
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
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const tree = req.body.tree
      if (textIsEmpty(tree)) throw new Error("req.body.tree is empty")
      if (textIsEmpty(req.body.value)) throw new Error("req.body.value is empty")
      if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
      const doc = await db.get("user")
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/user/key/:key/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const key = req.params.key
      if (textIsEmpty(key)) throw new Error("req.params.key is empty")
      const value = req.body.value
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!user) return res.sendStatus(404)
      user[key] = value
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function isObject(input) {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}
function isArray(array) {
  return Array.isArray(array)
}
function arrayToObject(array) {
  if (!isArray(array)) throw new Error("input is not an array")
  if (array.length === 0) return {}
  return array.reduce((acc, item) => {
    let created = item.created || Date.now()
    while (acc[created]) created = Date.now()
    item.created = created
    acc[created] = item
    return acc
  }, {})
}
function hasDots(string) {
  return string.includes(".")
}
function getUserTree(user, tree) {
  if (!hasDots(tree)) {
    return user[tree]
  } else {
    return getTreeValue(user, tree)
  }
}
app.post("/admin/convert/array/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const key = req.body.key
      if (textIsEmpty(key)) throw new Error("req.body.key is empty")
      const id = req.body.id
      if (textIsEmpty(id)) throw new Error("req.body.id is empty")
      const doc = await db.get("user")
      const user = doc.user[id]
      if (!user) return res.sendStatus(404)
      let array
      if (key === "platforms") {
        array = user?.getyour?.expert?.platforms
        if (!array) return res.sendStatus(404)
        array.forEach(platform => {
          if (isObject(platform["match-maker"] )) {
            Object.values(platform["match-maker"]).forEach(matchMaker => {
              if (isArray(matchMaker.conditions)) matchMaker.conditions = arrayToObject(matchMaker.conditions)
            })
          }
          if (isArray(platform.roles)) {
            platform.roles = arrayToObject(platform.roles)
          }
          if (isArray(platform.values)) {
            platform.values = arrayToObject(platform.values)
          }
          if (isArray(platform["match-maker"])) {
            platform["match-maker"] = arrayToObject(platform["match-maker"])
          }
        })
      } else {
        array = user[key]
      }
      if (!array || isObject(array)) return res.sendStatus(404)
      user[key] = arrayToObject(array)
      console.log(user[key])
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      console.log(e)
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/image/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const url = req.body.url
      if (textIsEmpty(url)) throw new Error(`req.body.url is empty`)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!user.images) user.images = {}
      const created = Date.now()
      user.images[created] = {
        created, 
        url, 
        visibility: "closed"
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/get/contacts/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const user = req.jwt.user
      if (!user.contacts) return res.sendStatus(404)
      const contacts = sortContactsByEmail(user.contacts)
      if (!contacts || contacts.length <= 0) return res.sendStatus(404)
      return res.send(contacts)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const email = req.body.email
      if (textIsEmpty(email)) throw new Error("req.body.email is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts || user.contacts.length === 0) user.contacts = {}
      const contactExist = Object.values(user.contacts).some(contact => contact.email === email)
      if (contactExist) return res.sendStatus(404)
      const created = Date.now()
      user.contacts[created] = {
        created,
        email,
        id: digestId(email)
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/alias/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const alias = req.body.alias
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) return res.sendStatus(404)
      const contact = user.contacts[created]
      if (!contact) return res.sendStatus(404)
      contact.alias = alias
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/birthday/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const birthday = req.body.birthday
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) return res.sendStatus(404)
      const contact = user.contacts[created]
      if (!contact) return res.sendStatus(404)
      contact.birthday = birthday
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/email/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const email = req.body.email
      if (textIsEmpty(email)) throw new Error("req.body.email is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) return res.sendStatus(404)
      const contact = user.contacts[created]
      if (!contact) return res.sendStatus(404)
      contact.email = email
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/notes/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const notes = req.body.notes
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) return res.sendStatus(404)
      const contact = user.contacts[created]
      if (!contact) return res.sendStatus(404)
      contact.notes = notes
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/phone/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const phone = req.body.phone
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) return res.sendStatus(404)
      const contact = user.contacts[created]
      if (!contact) return res.sendStatus(404)
      contact.phone = phone
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/status/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const status = req.body.status
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) return res.sendStatus(404)
      const contact = user.contacts[created]
      if (!contact) return res.sendStatus(404)
      contact.status = status
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/website/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const website = req.body.website
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) return res.sendStatus(404)
      const contact = user.contacts[created]
      if (!contact) return res.sendStatus(404)
      contact.website = website
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/contact/import/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const contacts = req.body.contacts
      if (arrayIsEmpty(contacts)) throw new Error("req.body.contacts is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts || user.contacts.length === 0) user.contacts = {}
      for (let j = 0; j < contacts.length; j++) {
        const newContact = contacts[j]
        let contactExists = false
        const existingContacts = Object.values(user.contacts)
        for (let k = 0; k < existingContacts.length; k++) {
          const contact = existingContacts[k]
          if (contact.email === newContact.email) {
            updateContact(contact, newContact)
            contactExists = true
            break
          }
        }
        if (!contactExists) {
          const created = Date.now()
          const map = {
            created,
            email: newContact.email
          }
          updateContact(map, newContact)
          user.contacts[created] = map
        }
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/remove/contact/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.contacts) return res.sendStatus(404)
      const contact = user.contacts[created]
      if (!contact) return res.sendStatus(404)
      delete user.contacts[created]
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function isMap(input) {
  return Object.getPrototypeOf(input) === Object.prototype
}
function sortKeysAbc(input) {
  if (isMap(input)) {
    return Object.fromEntries(Object.entries(input).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)))
  } else {
    return input
  }
}
app.post("/jwt/register/user/:list/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (!isReserved(req.params.list)) throw new Error(`${req.params.list} is not reserved`)
      if (objectIsEmpty(req.body[req.params.list])) throw new Error(`req.body.${req.params.list} is empty`)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (user.id === req.jwt.id) {
        if (user[req.params.list] === undefined) user[req.params.list] = []
        const map = {...req.body[req.params.list]}
        map.created = Date.now()
        map.visibility = "closed"
        const sorted = sortKeysAbc(map)
        user[req.params.list].unshift(sorted)
        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
        return res.sendStatus(200)
      }
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/admin/register/users/verified/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const ids = req.body.ids
      const verified = req.body.verified
      if (arrayIsEmpty(ids)) throw new Error("req.body.ids is empty")
      if (booleanIsEmpty(verified)) throw new Error("req.body.verified is empty")
      const doc = await db.get("user")
      for (let i = 0; i < req.body.ids.length; i++) {
        const id = req.body.ids[i]
        const user = doc.user[id]
        if (!user) continue
        if (verified === false && isAdmin(user)) continue
        user.verified = verified
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/remove/chat/messages/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.chat) return res.sendStatus(404)
      if (!user.chat[req.body.id]) return res.sendStatus(404)
      if (!user.chat[req.body.id].messages) return res.sendStatus(404)
      user.chat[req.body.id].messages = []
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/chat/message/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
      if (textIsEmpty(req.body.message)) throw new Error("req.body.message is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user.chat) user.chat = {}
      if (!user.chat[req.body.id]) user.chat[req.body.id] = {created: Date.now(), messages: []}
      user.chat[req.body.id].messages.unshift({created: Date.now(), from: req.jwt.id, text: req.body.message})
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/jwt/register/:list/:map/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (!isReserved(req.params.list)) throw new Error(`${req.params.list} is not reserved`)
      if (!req.body[req.params.map]) throw new Error(`req.body.${req.params.map} is empty`)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user[req.params.list]) user[req.params.list] = []
      const map = {}
      map[req.params.map] = req.body[req.params.map]
      map.created = Date.now()
      map.visibility = "closed"
      const sorted = sortKeysAbc(map)
      user[req.params.list].unshift(sorted)
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/location/feedback/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const created = req.body.created
      if (numberIsEmpty(created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const locationExpert = Object.values(doc.user).find(user => isLocationExpert(user, req))
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
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/location/email-expert/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
        if (textIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
        if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
        if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        const location = req.body.path.split("/")[2]
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (isExpert(jwtUser)) {
            for (const key in doc.user) {
              const user = doc.user[key]
              if (user.email === req.body.email) {
                if (user[location] !== undefined) {
                  if (user[location][req.body.tag] !== undefined) {
                    for (let i = 0; i < user[location][req.body.tag].length; i++) {
                      const item = user[location][req.body.tag][i]
                      if (item.created === req.body.id) {
                        user[location][req.body.tag].splice(i, 1)
                        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      if (!user[req.location.platform]) return res.sendStatus(404)
      if (!user[req.location.platform][req.body.tag]) return res.sendStatus(404)
      for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
        const item = user[req.location.platform][req.body.tag][i]
        if (item.created === req.body.created) {
          user[req.location.platform][req.body.tag].splice(i, 1)
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("logs")
      doc.logs = []
      await db.insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/remove/user/blocked/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.blocked !== undefined) {
            for (let i = 0; i < user.blocked.length; i++) {
              const blocked = user.blocked[i]
              if (blocked.id === req.body.id) {
                user.blocked.splice(i, 1)
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.funnel !== undefined) {
            for (let i = 0; i < user.funnel.length; i++) {
              const funnel = user.funnel[i]
              if (funnel.created === req.body.created) {
                user.funnel.splice(i, 1)
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      const messages = user.profile.messages || []
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        if (message.created === req.body.created) {
          user.profile.messages.splice(i, 1)
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (isReserved(req.body.key)) throw new Error("key not deletable")
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (isAdmin(jwtUser)) {
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
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.scripts !== undefined) {
            for (let i = 0; i < user.scripts.length; i++) {
              const script = user.scripts[i]
              if (script.created === req.body.created) {
                user.scripts.splice(i, 1)
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.sources !== undefined) {
            for (let i = 0; i < user.sources.length; i++) {
              const source = user.sources[i]
              if (source.created === req.body.created) {
                user.sources.splice(i, 1)
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.templates !== undefined) {
            for (let i = 0; i < user.templates.length; i++) {
              const template = user.templates[i]
              if (template.created === req.body.created) {
                user.templates.splice(i, 1)
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
app.post("/jwt/remove/user/image/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      for (let i = 0; i < list.length; i++) {
        const it = list[i]
        if (it.created === req.body.created) {
          list.splice(i, 1)
          removeImageCid(it, req.params.list)
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
app.post("/jwt/remove/user/:list/item/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      const list = user[req.params.list] || []
      for (let i = 0; i < list.length; i++) {
        const it = list[i]
        if (it.created === req.body.created) {
          list.splice(i, 1)
          removeImageCid(it, req.params.list)
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  await sendEmailFromDroid({
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.to)) throw new Error("req.body.to is empty")
      const ics = req.body.ics
      if (objectIsEmpty(ics)) throw new Error("req.body.ics is empty")
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.to)) throw new Error("req.body.to is empty")
      const ics = req.body.ics
      if (objectIsEmpty(ics)) throw new Error("req.body.ics is empty")
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.to)) throw new Error("req.body.to is empty")
      if (numberIsEmpty(req.body.lat)) throw new Error("req.body.lat is empty")
      if (numberIsEmpty(req.body.lon)) throw new Error("req.body.lon is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      await sendEmailFromDroid({
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.subject)) throw new Error("req.body.subject is empty")
      if (textIsEmpty(req.body.html)) throw new Error("req.body.html is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      await sendEmailFromDroid({
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.subject)) throw new Error("req.body.subject is empty")
      if (textIsEmpty(req.body.html)) throw new Error("req.body.html is empty")
      if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      await sendEmailFromDroid({
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      const email = req.body.email
      if (textIsEmpty(email)) throw new Error("req.body.email is empty")
      const doc = await db.get("user")
      const admin = doc.user[req.jwt.id]
      await sendEmailFromDroid({
        from: admin.email,
        to: email,
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
  verifyLocation,
  async (req, res) => {
    try {
      const email = req.body.email
      if (textIsEmpty(email)) throw new Error("req.body.email is empty")
      expireLoginAttempts()
      const login = {}
      login.pin = digest(crypto.randomBytes(32))
      login.expired = Date.now() + (2 * 60 * 1000)

      await sendEmailFromDroid({
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
  verifyLocation,
  verifyReferer,
  async (req, res) => {
    try {
      const map = req.body.map
      const ids = req.body.ids.split(",")
      if (!Array.isArray(ids)) throw new Error("req.body.ids is empty")
      if (objectIsEmpty(map)) throw new Error("req.body.map is empty")
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
      const doc = await db.get("user")
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        id.trim()
        const user = doc.user[id]
        if (!user) continue
        await sendEmailFromDroid({
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
      if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
      if (objectIsEmpty(req.body.item)) throw new Error("req.body.item is empty")
      const doc = await db.get("user")
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
        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (textIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
        if (textIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
        if (textIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
        if (objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")
        const location = req.body.path.split("/")[2]
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (isExpert(jwtUser)) {
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
                        await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
app.post("/update/user/key-name-tree-admin/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (textIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (isAdmin(jwtUser)) {
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
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (textIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
        if (booleanIsEmpty(req.body.bool)) throw new Error("req.body.bool is empty")
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (isAdmin(jwtUser)) {
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
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
function textToNumber(text) {
  return Number(text)
}
app.post("/update/user/number-tree-admin/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        req.body.number = textToNumber(req.body.number)
        if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (textIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
        if (numberIsEmpty(req.body.number)) throw new Error("req.body.number is empty")
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (isAdmin(jwtUser)) {
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
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (textIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
        if (textIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
        if (textIsEmpty(req.body.text)) throw new Error("req.body.text is empty")
        const doc = await db.get("user")
        const jwtUser = doc.user[req.jwt.id]
        if (jwtUser.id === req.jwt.id) {
          if (isAdmin(jwtUser)) {
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
              await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (!isReserved(req.params.list)) throw new Error(`${req.params.list} is not reserved`)
      if (req.jwt !== undefined) {
        if (numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
        if (objectIsEmpty(req.body[req.params.list])) throw new Error("req.body.source is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user[req.params.list] !== undefined) {
            for (let i = 0; i < user[req.params.list].length; i++) {
              const it = user[req.params.list][i]
              if (it.created === req.body.created) {
                user[req.params.list][i] = { ...it, ...req.body[req.params.list] }
                await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const dir = "./cid"
      if (!fs.existsSync(dir)) fs.mkdirSync(dir)
      const cid = digest(req.file.buffer)
      const filePath = `./cid/${cid}`
      fs.writeFileSync(filePath, req.file.buffer)
      const cidLink = `${req.protocol}://${req.get("host")}/cid/${cid}`
      return res.send(cidLink)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
function numberIsEmpty(input) {
  return input === undefined ||
  input === null ||
  Number.isNaN(input) ||
  typeof input !== "number" ||
  input === ""
}
function isObject(input) {
  return input !== null &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    input.constructor === Object
}
app.post("/jwt/update/:list/:map/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      if (!isReserved(req.params.list)) throw new Error(`${req.params.list} is not reserved`)
      const doc = await db.get("user")
      const user = doc.user[req.jwt.id]
      if (!isJwt(user, req)) return res.sendStatus(404)
      const list = user[req.params.list] || []
      for (const it of list) {
        if (it.created === req.body.created) {
          if (isObject(it[req.params.map])) {
            it[req.params.map] = {...it[req.params.map], ...req.body[req.params.map]}
          } else {
            it[req.params.map] = req.body[req.params.map]
          }
          const sorted = sortKeysAbc(it)
          await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  async (req, res, next) => {
    try {
      if (textIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
      const doc = await db.get("user")
      const exist = Object.values(doc.user).some(it => it.getyour?.expert?.name === req.body.name)
      if (!exist) return res.sendStatus(404)
      return res.sendStatus(200)
    } catch (e) {
      await log(e, req)
      return res.sendStatus(404)
    }
  }
)
app.post("/verify/match-maker/conditions/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
        const doc = await db.get("user")
        const user = doc.user[req.jwt.id]
        for (let i = 0; i < req.body.conditions.length; i++) {
          const condition = req.body.conditions[i]
          if (user.id === req.jwt.id) {
            if (userTreeExist(user, condition.left) === true) {
              if (verifyUserCondition(user, condition) === false) {
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
app.post("/verify/pin/",
  verifyLocation,
  async (req, res) => {
    try {
      expireLoginAttempts()
      const {userPin} = req.body
      if (textIsEmpty(userPin)) throw new Error("user pin is empty")
      for (let i = 0; i < loginQueue.length; i++) {
        const login = loginQueue[i]
        if (login.pin === userPin) {
          if (login.expired < Date.now()) throw new Error("login expired")
          if (textIsEmpty(login.pin)) throw new Error("pin is empty")
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
app.post("/verify/path/exist/",
  verifyLocation,
  verifyReferer,
  async (req, res, next) => {
    try {
      const path = req.body.path
      if (textIsEmpty(path)) throw new Error("req.body.path is empty")
      const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const tree = req.body.tree
      if (textIsEmpty(tree)) throw new Error("req.body.tree is empty")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  sendStatus(200)
)
app.post("/verify/user/admin/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  adminOnly,
  sendStatus(200)
)
app.post("/verify/user/jwt-in-emails/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        if (arrayIsEmpty(req.body.emails)) throw new Error("req.body.emails is empty")
        const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationWritableOnly,
  sendStatus(200)
)
app.post("/verify/user/location-expert/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  locationExpertOnly,
  sendStatus(200)
)
app.post("/verify/user/messages/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  async (req, res, next) => {
    try {
      if (req.jwt !== undefined) {
        const doc = await db.get("user")
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
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  expertOnly,
  sendStatus(200)
)
app.post("/verify/user/url-id/",
  verifyLocation,
  verifyReferer,
  addJwt,
  verifySession,
  closedOnly,
  async (req, res, next) => {
    try {
      const urlId = req.location.url.pathname.split("/")[4]
      if (textIsEmpty(urlId)) throw new Error("url id is empty")
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

function verifyJwtToken(token) {
  return new Promise(async(resolve, reject) => {
    try {
      jwt.verify(token, process.env.JWT_SECRET, async(error, jwt) => {
        if (error) throw error
        else return resolve(jwt)
      })
    } catch (error) {
      reject(error)
    }
  })
}
async function addJwt(req, res, next) {
  try {
    if (objectIsEmpty(req.cookies)) throw new Error("jwt is empty")
    const {jwtToken} = req.cookies
    const jwt = await verifyJwtToken(jwtToken)
    if (objectIsEmpty(jwt)) throw new Error("jwt is empty")
    const doc = await db.get("user")
    const user = doc.user[jwt.id]
    if (objectIsEmpty(user)) throw new Error("user is empty")
    if (req.method === "GET") {
      if (user.id === jwt.id) {
        if (user.session.jwt !== digest(jwtToken)) {
          await log(new Error("jwt token changed"), req)
          return res.send(redirectToLoginHtml)
        }
        if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
        req.jwt = jwt
        req.jwt.user = user
        if (!req.jwt.user || req.jwt.user.id !== jwt.id) throw new Error("user mismatch")
        if (objectIsEmpty(req.jwt)) throw new Error("jwt not set")
        return next()
      }
      return res.redirect("/")
    }
    if (req.method === "POST") {
      if (user.id === jwt.id) {
        if (user.session.jwt !== digest(jwtToken)) throw new Error("jwt token changed")
        req.jwt = jwt
        req.jwt.user = user
        if (!req.jwt.user || req.jwt.user.id !== jwt.id) throw new Error("user mismatch")
        if (objectIsEmpty(req.jwt)) throw new Error("jwt not set")
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
  if (arrayIsEmpty(req.body.ids)) throw new Error("req.body.ids is empty")
  const doc = await db.get("user")
  const user = doc.user[req.jwt.id]
  if (user.id === req.jwt.id) {
    if (isAdmin(user)) {
      for (let i = 0; i < req.body.ids.length; i++) {
        const id = req.body.ids[i]
        const user = doc.user[id]
        if (bool === false) {
          if (isAdmin(user)) continue
        }
        if (user) user.verified = bool
      }
      await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  const platform = getPlatforms(user).find(platform =>
    platform.name === name
  )
  if (!platform) throw new Error("platform not found")
  return platform
}
function findUserPlatformValueByPath(path, user) {
  return getPlatforms(user)
  .flatMap(platform => getValues(platform) || [])
  .find(value => value.path === path)
}
function findValueByLocation(doc, req) {
  return findValueByPath(doc, locationToPath(req))
}
function findValueByParams(doc, req) {
  return findValueByPath(doc, paramsToPath(req))
}
function findUserValueByPath(user, path) {
  return getPlatforms(user)
  ?.flatMap(platform => getValues(platform) || [])
  .find(value => value.path === path)
}
function findValueByPath(doc, path) {
  if (!doc || !doc.user) return
  return Object.values(doc.user)
  .flatMap(user => getPlatforms(user) || [])
  .flatMap(platform => getValues(platform) || [])
  .find(value => value.path === path)
}
function getAllExpertPlatformRoles(doc) {
  return Object.values(doc.user)
  .filter(user => isExpert(user))
  .flatMap(user => getPlatforms(user) || [])
  .flatMap(platform => getRoles(platform) || [])
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
  if (!value) return
  return value.html
}
function getParamsWritableHtml(doc, req) {
  const value = findValueByParams(doc, req)
  if (!isValueWritableByUser(value, req.jwt.user)) return
  return value.html
}
function getPlatform(doc, name) {
  return Object.values(doc.user)
  .flatMap(user => getPlatforms(user) || [])
  .find(platform => platform.name === name)
}
function getPlatforms(user) {
  return Object.values(user.platforms || {})
}
function getAllValues(doc) {
  return Object.values(doc.user)
  .flatMap(user => getPlatforms(user) || [])
  .flatMap(platform => getValues(platform) || [])
}
function getPlatformsByName(doc, name) {
  return Object.values(doc.user)
  .flatMap(user => getPlatforms(user) || [])
  .filter(platform => platform.name === name)
}
function getRoles(platform) {
  return Object.values(platform.roles || {})
}
function getRoleByCreated(doc, created) {
  return Object.values(doc.user)
  .flatMap(user => getPlatforms(user) || [])
  .find(platform => platform.roles[created])
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
function getUserPlatformByName(user, name) {
  return getPlatforms(user).find(platform => platform.name === name)
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
function getValues(platform) {
  return Object.values(platform.values || {})
}
function emailIsAdmin(email) {
  const admins = process.env.ADMINS.split(",").map(it => it.trim())
  return admins.includes(email)
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
  const reservedKeys = new Set([
    "admin",
    "alias",
    "ap",
    "audios",
    "blocked",
    "children",
    "conflicts",
    "contacts",
    "created",
    "credits",
    "deadlines",
    "email",
    "funnel",
    "groups",
    "id",
    "image",
    "images",
    "lp",
    "messages",
    "parent",
    "password",
    "payment",
    "pdf",
    "profile",
    "reputation",
    "roles",
    "scripts",
    "session",
    "sources",
    "templates",
    "type",
    "verified",
    "videos",
    "xp",
  ])
  return reservedKeys.has(key)
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
  if (textIsEmpty(urlId)) return res.sendStatus(404)
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
  const doc = await db.get("user")
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
    getPlatforms(user).some(platform =>
      getValues(platform).some(value => value.path === path)
    )
  )
}
async function registerTreeMapById(tree, map, id) {
  const doc = await db.get("user")
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
  await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
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
  const doc = await db.get("user")
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
  await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
}
function replaceScript(input, id) {
  const regex = new RegExp(`<script id="${id}" type="module"[\\s\\S]*?<\\/script>`, 's')
  const newScript = `<script id="${id}" type="module" src="/js/${id}.js"></script>`
  if (!input.includes('<body>') || !input.includes('</body>')) {
    return input.replace('</html>', `<body>${newScript}</body></html>`);
  }
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
function textIsEmpty(input) {
  return typeof input !== "string" ||
    input === "undefined" ||
    input === undefined ||
    input === null ||
    input === "null" ||
    input === "" ||
    input.replace(/\s/g, "") === ""
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
  const doc = await db.get("user")
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
  await db.insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
}
function updateContact(alt, neu){
  if (!alt.id) alt.id = digestId(alt.email)
  if (neu.alias) alt.alias = neu.alias
  if (neu.birthday) alt.birthday = neu.birthday
  if (neu.status) alt.status = neu.status
  if (neu.notes) alt.notes = neu.notes
  if (neu.phone) alt.phone = neu.phone
  if (neu.website) alt.website = neu.website
}
function updatePathWithExpert(path, expert) {
  const split = path.split("/")
  return `/${expert}/${split[2]}/${split[3]}/`
}
function verifyOrigin(req, res, next) {
  const origin = `${req.protocol}://${req.headers.host}`
  if (allowedOrigins.includes(origin)) {
    return next()
  } else {
    return res.sendStatus(404)
  }
}
