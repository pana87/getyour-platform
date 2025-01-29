require('dotenv').config()
const nodemailer = require("nodemailer")
const path = require("node:path")
const fs = require("node:fs")
const crypto = require("node:crypto")
const {exec} = require('child_process')
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const jwt = require('jsonwebtoken')
const {UserRole} = require('./UserRole.js')
const https = require("https")
const http = require("http")
const express = require('express')
const allowedOrigins = [
  "http://localhost:9999",
  "https://localhost:9999",
  "https://get-your.de",
  "https://www.get-your.de",
]
const reserved = [
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
  "getyour",
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
]

class Helper {

  static async addJwt(req, res, next) {

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
            return res.redirect("/login/")
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
      // statt redirect zu login
      // sende html das dich einfach weiter leitet
      if (req.method === "GET") return res.redirect("/login/")
      if (req.method === "POST") return res.sendStatus(404)
    } catch (error) {

      if (req.method === "GET") return res.send(Helper.readFileSyncToString("../lib/values/redirect-to-login.html"))
      // if (req.method === "GET") return res.redirect("/login/")
      if (req.method === "POST") return res.sendStatus(404)
    }
  }

  static async add(event, input) {

    if (event === "user-reputation") {

      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[input.id]
      if (user.id === input.id) {
        if (user.reputation === undefined) user.reputation = 0
        user.reputation += input.reputation
        if (user.reputation > Number.MAX_SAFE_INTEGER) {
          user.reputation = Number.MAX_SAFE_INTEGER
        } else if (user.reputation < Number.MIN_SAFE_INTEGER) {
          user.reputation = Number.MIN_SAFE_INTEGER
        }
        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, user: doc.user })
      }
    }

  }

  static async adminOnly(req, res, next) {

    try {
      if (!Helper.verifyIs("user/admin", {user: req.jwt.user})) return res.sendStatus(404)
      return next()
    } catch (error) {
      return res.sendStatus(404)
    }
  }

  static execute(command) {

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout.trim())
        }
      })
    })
  }

  static sendStatus(code) {

    return (req, res, next) => {
      return res.sendStatus(code)
    }
  }

  static debounce = Helper.fn("debounce")

  static expertOnly(req, res, next) {

    try {
      if (!Helper.verifyIs("user/expert", req.jwt.user)) return res.sendStatus(404)
      return next()
    } catch (error) {
      return res.sendStatus(404)
    }
  }

  static fn(event, input) {

    if (event === "debounce") {

      let lastExecutionTime = 0
      let isBlocked = false
      return async (callback, millis) => {
        if (isBlocked) return
        const currentTime = Date.now()
        const timeSinceLastExecution = currentTime - lastExecutionTime
        if (timeSinceLastExecution >= millis) {
          try {
            callback()
          } catch (error) {
            console.error(error)
          } finally {
            lastExecutionTime = Date.now()
            isBlocked = true
            setTimeout(() => {
              isBlocked = false
            }, millis)
          }
        }
      }
    }

  }

  static get(tree, input) {

    if (tree === "docs") {

      return new Promise(async(resolve, reject) => {
        try {
          const db = nano.use(input)
          const response = await db.list({ include_docs: true })
          const docs = response.rows.map(row => row.doc)
          resolve(docs)
        } catch (error) {
          reject(error)
        }
      })

    }

    if (tree === "path-value") {

      return new Promise(async(resolve, reject) => {
        try {
          const req = input
          const doc = await nano.db.use("getyour").get("user")
          for (const user in doc.user) {
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
                            if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                              resolve(value)
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
          reject(error)
        }
      })

    }

    if (tree === "getyour.expert.platforms.values") {

      const {user} = input
      return (user.getyour?.expert?.platforms || [])
        .flatMap(platform => platform.values || [])
    }

  }

  static getList(key) {

    return async (req, res, next) => {
      if (req.jwt !== undefined) {
        const id = req.jwt.id
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[id]
        if (user.id === id) {
          if (user[key] !== undefined) {
            if (user[key].length > 0) return res.send(user[key])
          }
        }
      }
    }
  }

  static import(event, input) {

    if (event === "file-type") {

      return new Promise(async(resolve, reject) => {
        try {
          const it = await import('file-type')
          resolve(it)
        } catch (error) {
          reject(error)
        }
      })
    }

  }

  static isReserved(word) {

    return reserved.includes(word)
  }

  static verifyIs(event, input) {

    if (event === "array") {

      return Array.isArray(input)
    }

    if (event === "array/empty") {

      return !Array.isArray(input) || input.length === 0
    }

    if (event === "bool/empty") {

      return typeof input !== "boolean" ||
      input === undefined ||
      input === null
    }

    if (event === "cli/installed") {

      return new Promise((resolve, reject) => {
        exec(input, (error, stdout, stderr) => {
          if (error) {
            reject(`${input} is not installed.`)
          } else {
            resolve()
          }
        })
      })
    }

    if (event === "key/reserved") {

      for (let i = 0; i < reserved.length; i++) {
        const word = reserved[i]
        if (word === input) return true
      }
      return false
    }

    if (event === "key/deletable") {

      for (let i = 0; i < reserved.length; i++) {
        const word = reserved[i]
        if (word === input) return false
      }

      return true

    }

    if (event === "number/empty") {

      return input === undefined ||
      input === null ||
      Number.isNaN(input) ||
      typeof input !== "number" ||
      input === ""
    }

    if (event === "map") {

       return Object.getPrototypeOf(input) === Object.prototype
    }

    if (event === "object") {

      return input !== null &&
        typeof input === "object" &&
        !Array.isArray(input) &&
        input.constructor === Object
    }

    if (event === "object/array") {
      return Array.isArray(input)
    }

    if (event === "object/empty") {

      return typeof input !== "object" ||
      input === undefined ||
      input === null ||
      Object.getOwnPropertyNames(input).length <= 0
    }

    if (event === "primitive") {

      return typeof input === "string" || typeof input === "number" || typeof input === "boolean"
    }

    if (event === "text/empty") {

      return typeof input !== "string" ||
        input === "undefined" ||
        input === undefined ||
        input === null ||
        input === "null" ||
        input === "" ||
        input.replace(/\s/g, "") === ""
    }

    if (event === "typeof") {
      if (!input) return undefined
      return input.constructor.name
    }

    if (event === "email/admin") {

      const {email} = input
      const admins = process.env.ADMINS.split(",").map(it => it.trim())
      return admins.includes(email)
    }

    if (event === "user/admin") {

      const {user} = input
      const admins = process.env.ADMINS.split(",").map(it => it.trim())
      return user.verified && admins.includes(user.email)
    }

    if (event === "user/expert") {

      return input?.getyour?.expert?.name !== undefined && input.verified === true
    }

    if (event === "user/tree") {

      const {user, tree} = input
      const value = Helper.convert("tree/value", {user, tree})
      if (value) {
        return true
      } else {
        return false
      }
    }

    if (event === "user/location-expert") {

      const {user, req} = input
      return user.getyour?.expert?.name === req.location.expert
    }

    if (event === "user/location-writable") {

      const {user, req} = input
      return new Promise(async(resolve, reject) => {
        try {
          const doc = await nano.db.use("getyour").get("user")
          for (const key in doc.user) {
            const user = doc.user[key]

            // get location experts value by req.location
            // check if the req.jwt.user.email is in authorized value writability
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
                            if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                              if (value.writability !== undefined) {
                                for (let i = 0; i < value.writability.length; i++) {
                                  const authorized = value.writability[i]
                                  if (user.email === authorized) {
                                    if (user.verified === true) resolve(true)
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
          resolve(false)
        } catch (error) {
          reject(error)
        }
      })

      // neue user schleife
    }

    if (event === "user/writable") {

      const {value, writable} = input
      return Array.isArray(value.writability) &&
        value.writability.includes(writable.email)
    }

  }

  static isLengthValid(input, length = 1024 * 34) {

    return input.length < length
  }

  static verify(event, input, check) {

    if (event === "user/tree/exist") {
      let user = input

      if (user[check] !== undefined) return true

      const pathArray = check.split('.')

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

    if (event === "user/condition") {

      const value = Helper.convert("user-tree/value", {user: input, tree: check.left})


      // verify value with right condition
      if (check.right === "undefined") check.right = undefined
      if (check.right === "null") check.right = null

      if (check.operator === "!=") {
        return value !== check.right
      }

      if (check.operator === "=") {
        return value === check.right
      }

      if (check.operator === "<=") {
        return value <= check.right
      }

      if (check.operator === ">=") {
        return value >= check.right
      }

      if (check.operator === "<") {
        return value < check.right
      }

      if (check.operator === ">") {
        return value > check.right
      }


      return false

    }

    if (event === "role/exist") {
      for (let i = 0; i < check.length; i++) {
        if (check[i] === input) return true
      }
      return false
    }
  }

  static update(event, old, updated) {

    if (event === "condition") {

      if (!Helper.verifyIs("text/empty", updated.left)) {
        old.left = updated.left
      }

      if (!Helper.verifyIs("text/empty", updated.operator)) {
        old.operator = updated.operator
      }

      if (!Helper.verifyIs("text/empty", updated.right)) {
        old.right = updated.right
      }

      if (!Helper.verifyIs("text/empty", updated.action)) {
        old.action = updated.action
      }

    }

    if (event === "script") {

      if (Helper.verifyIs("text/empty", updated.script)) throw new Error("script is empty")
      old.script = updated.script

      if (!Helper.verifyIs("text/empty", updated.name)) {
        old.name = updated.name
      }

    }

    if (event === "source") {

      Object.entries(updated).forEach(([key, value]) => {
        if (key === "authors") old.authors = value.split(",").map(it => it.trim())
        if (key === "title") old.title = value
        if (key === "edition") old.edition = value
        if (key === "publisher") old.publisher = value.split(",").map(it => it.trim())
        if (key === "published") old.published = Number(value)
        if (key === "isbn") old.isbn = value.split(",").map(it => it.trim())
        if (key === "weblink") old.weblink = value
        if (key === "language") old.language = value.split(",").map(it => it.trim())
        if (key === "type") old.type = value
        if (key === "keywords") old.keywords = value.split(",").map(it => it.trim())
        if (key === "description") old.description = value
        if (key === "image") old.image = value
      })
    }

  }

  static convert(event, input) {

    if (event === "array/map") {

      return input.reduce((map, user) => {
        map[user.id] = user
        return map
      }, {})
    }

    if (event === "path/file-name-list") {

      function getAllFileNamesFromDirectory(relativePathname, arrayOfFileNames) {
        const directoryPath = path.join(__dirname, relativePathname)
        const files = fs.readdirSync(directoryPath)

        arrayOfFileNames = arrayOfFileNames || []

        files.forEach((file) => {
          if (fs.statSync(path.join(directoryPath, file)).isDirectory()) {
            arrayOfFileNames = Helper.getAllFileNamesFromDirectory(path.join(relativePathname, file), arrayOfFileNames)
          } else {
            arrayOfFileNames.push(file)
          }
        })
        return arrayOfFileNames
      }
      return getAllFileNamesFromDirectory(input)

    }

    if (event === "url/html") {
      return new Promise(async(resolve, reject) => {
        try {

          https.get(input, (response) => {
            let data = ''

            response.on('data', (chunk) => {
              data += chunk
            })

            response.on('end', () => {
              resolve(data)
            })

          }).on("error", (error) => {
            reject(error)
          })

        } catch (error) {
          reject(error)
        }
      })
    }

    if (event === "text/number") {
      return Number(input)
    }

    if (event === "tree/key") {

      const keys = input.split(".")
      if (keys.length > 0) {
        return keys[keys.length - 1]
      } else {
        return input
      }
    }

    if (event === "tree/value") {

      const {user, tree} = input
      const getTreeValue = (it, tree) => {
        const keys = tree.split(".")
        let current = it
        for (let i = 0; i < keys.length; i++) {
          if (!current || typeof current !== "object" || !(keys[i] in current)) {
            return undefined
          }
          current = current[keys[i]]
        }
        return current
      }
      return getTreeValue(user, tree)
    }

    if (event === "user-tags/value") {

      const result = {}

      for (let i = 0; i < input.tags.length; i++) {
        const tag = input.tags[i]

        result[tag] = Helper.convert("user-tag/value", {user: input.user, tag})

      }

      return result
    }

    if (event === "user-tag/value") {
      const tree = input.tag.split("-")
      let value = input.user

      for (let i = 0; i < tree.length; i++) {
        if (value !== undefined) {
          value = value[tree[i]]
        } else {
          break
        }
      }

      return value
    }

    if (event === "user-tree/value") {
      const tree = input.tree.split(".")
      let value = input.user

      for (let i = 0; i < tree.length; i++) {
        if (value !== undefined) {
          value = value[tree[i]]
        } else {
          break
        }
      }

      return value
    }

    if (event === "tag/capitalizeFirstLetter") {

      const tagSplit = input.split("-")
      const results = []
      for (let i = 0; i < tagSplit.length; i++) {
        results.push(Helper.capitalizeFirstLetter(tagSplit[i]))
      }
      const output = results.join(" ")
      if (Helper.verifyIs("text/empty", output)) throw new Error(`${event} is empty`)
      return output
    }

  }

  static getKeysRecursively(obj) {
    let keys = [];

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
        if (typeof obj[key] === "object") {
          const nestedKeys = Helper.getKeysRecursively(obj[key]);
          keys = keys.concat(nestedKeys.map(nestedKey => `${key}.${nestedKey}`));
        }
      }
    }

    return keys;
  }

  static removeCookies(req, res, next) {
    const cookies = Object.keys(req.cookies)
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i] !== "jwtToken") {
        if (cookies[i] !== "sessionToken") {
          res.cookie(cookies[i], "", { expires: new Date(Date.now()) })
          res.clearCookie(cookies[i])
        }
      }
    }
    next()
  }

  static reservedKeys = new Set(reserved)

  static async locationExpertOnly(req, res, next) {

    try {
      if (!Helper.verifyIs("user/location-expert", {user: req.jwt.user, req})) return res.sendStatus(404)
      return next()
    } catch (error) {
      return res.sendStatus(404)
    }
  }

  static async logError(error, request) {
    try {
      if (error === undefined) throw new Error("error is undefined")

      function shouldLog(error) {
        const importantMessages = [
          "jwt is empty",
          "req.jwt is empty",
          "Cannot set headers after they are sent to the client",
        ]
        return importantMessages.includes(error.message)
      }


      if (!shouldLog(error)) {

        const log = {}
        log.type = "error"
        log.message = error.message

        if (request) {
          log.method = request.method
          log.location = request.headers.referer
          log.endpoint = request.originalUrl
        }
        log.stack = error.stack

        const doc = await nano.db.use("getyour").get("logs")
        doc.logs.unshift(log)
        console.log(log)
        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })
      }

    } catch (error) {
      console.log(error)
    }
  }

  static async logInput(input, request) {
    try {
      console.log(input)
      const log = {}
      log.type = "info"
      log.input = JSON.stringify(input)
      if (request) log.method = request.method
      if (request) log.location = request.headers.referer
      if (request) log.endpoint = request.originalUrl
      const doc = await nano.db.use("getyour").get("logs")
      doc.logs.unshift(log)
      console.log(log)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })
    } catch (error) {
      console.log(error)
    }
  }

  static async createLogs(database) {
    try {
      await nano.db.use(database).insert({ logs: [] }, "logs")
    } catch (error) {
      // do nothing
    }
  }

  static async createUser(database) {
    try {
      await nano.db.use(database).insert({ user: {} }, "user")
    } catch (error) {
      // do nothing
    }
  }

  static async createUsers(database) {
    try {
      await nano.db.use(database).insert({ users: [] }, "users")
    } catch (error) {
      // do nothing
    }
  }

  static async createDatabase(database) {
    try {
      await nano.db.create(database)
    } catch (error) {
      // do nothing
    }
  }

  static readFileSyncToString(relativePath) {
    try {
      const result = fs.readFileSync(path.join(__dirname, relativePath)).toString()
      if (!Helper.verifyIs("text/empty", result)) return result
      throw new Error("reaf file failed")
    } catch (error) {
      throw new Error(error)
    }
  }

  static booleanIsEmpty(boolean) {
    return typeof boolean !== "boolean" ||
    boolean === undefined ||
    boolean === null
  }

  static generateRandomBytes(length) {
    return Array.from(Uint8Array.from(crypto.randomBytes(length)))
  }

  static minutesToMillis(minutes) {
    return minutes * 60000
  }

  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  static digest(message) {

    return crypto.createHash("sha256").update(message).digest("hex")
  }

  static digestId(email) {

    return Helper.digest(JSON.stringify({email, verified: true}))
  }

  static sendEmailFromDroid(options) {
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
      if (Helper.verifyIs("object/empty",options)) reject("email options are empty")
      if (Helper.verifyIs("object/empty",transporter)) reject("smtp transporter is empty")

      transporter.sendMail(options, function(error, info){
        if (error !== null) reject(error)
        resolve()
      })
    })
  }

  static sort(event, input) {

    if (event === "created-desc") {

      return input.sort((a, b) => {
        const aCreated = a.created ?? -Infinity;
        const bCreated = b.created ?? -Infinity;
        return bCreated - aCreated
      })
    }

    if (event === "shuffle") {

      function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array
      }
      return shuffle(input)
    }

    if (event === "keys/abc") {

      if (Helper.verifyIs("map", input)) {
        return Object.fromEntries(Object.entries(input).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)))
      } else {
        return input
      }
    }

  }

  static getAllFilesFromDirectory(relativePathname, arrayOfFiles) {
    const directoryPath = path.join(__dirname, relativePathname)
    files = fs.readdirSync(directoryPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach((file) => {
      if (fs.statSync(directoryPath + "/" + file).isDirectory()) {
        arrayOfFiles = Helper.getAllFilesFromDirectory(relativePathname + "/" + file, arrayOfFiles)
      } else {
        arrayOfFiles.push(path.join(__dirname, "..", relativePathname, "/", file))
      }
    })
    return arrayOfFiles
  }

  static async verifyAdmin(req, res, next) {

    try {
      if (!req.jwt) return res.sendStatus(404)
      const id = req.jwt.id
      const doc = await nano.db.use("getyour").get("user")
      const user = doc.user[id]
      if (!user || user.id !== id) return res.sendStatus(404)
      if (!Helper.verifyIs("user/admin", {user})) return res.sendStatus(404)
      return res.sendStatus(200)
    } catch (error) {
      return res.sendStatus(404)
    }
  }

  static async verifyClosed(req, res, next) {

    try {
      if (!req.jwt || !req.location) return res.sendStatus(404)
      return next()
    } catch (error) {
      return res.sendStatus(404)
    }
  }

  static verifyJwtToken(token) {

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

  static async verifyLocation(req, res, next) {

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
    } catch (error) {
      return res.sendStatus(404)
    }
  }

  static async verifyReferer(req, res, next) {

    try {
      if (req.body.referer !== undefined) {
        if (req.body.referer === "") {
          return next()
        } else {
          if (!Helper.verifyIs("text/empty", req.body.referer)) {
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

  static verifyRoles(roles) {

    return async(req, res, next) => {
      try {
        if (roles === undefined) throw new Error("roles is undefined")
        if (Helper.verifyIs("object/empty", req.jwt)) throw new Error("req.jwt is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          for (let i = 0; i < roles.length; i++) {
            const requiredRole = roles[i]
            for (let i = 0; i < user.roles.length; i++) {
              const role = user.roles[i]
              if (requiredRole === role) {
                return next()
              }
            }
          }
        }
        return res.sendStatus(404)
      } catch (error) {
        await Helper.logError(error, req)
        return res.sendStatus(404)
      }
    }
  }

  static async verifySession(req, res, next) {

    try {
      if (Helper.verifyIs("object/empty", req.jwt)) throw new Error("req.jwt is empty")
      const {sessionToken} = req.cookies
      if (sessionToken !== undefined) {
        if (Helper.verifyIs("text/empty", sessionToken)) throw new Error("session token is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          const sessionTokenDigest = Helper.digest(JSON.stringify({
            id: user.id,
            pin: user.session.pin,
            salt: user.session.salt,
            jwt: user.session.jwt,
          }))
          if (Helper.verifyIs("text/empty", sessionTokenDigest)) throw new Error("session token is not valid")
          if (sessionTokenDigest !== sessionToken) throw new Error("session token changed during session")
          return next()
        }
      }
      return res.sendStatus(404)
    } catch (error) {
      await Helper.logError(error, req)
      return res.sendStatus(404)
    }
  }

  static async verifyVerified(req, res, next) {

    try {
      if (req.method === "GET" || req.method === "POST") {
        if (Helper.verifyIs("object/empty", req.jwt)) throw new Error("req.jwt is empty")
        const doc = await nano.db.use("getyour").get("user")
        const user = doc.user[req.jwt.id]
        if (user.id === req.jwt.id) {
          if (user.verified === false) throw new Error("user unverified")
          const verified = Helper.digest(JSON.stringify({email: user.email, verified: user.verified}))
          if (user.id !== verified) throw new Error("user id mismatch")
          if (req.jwt.id !== verified) throw new Error("jwt id mismatch")
        }
        return next()
      }
      return res.sendStatus(404)
    } catch (error) {
      return res.sendStatus(404)
    }
  }

}

module.exports.Helper = Helper
