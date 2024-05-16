require('dotenv').config()
const nodemailer = require("nodemailer")
const path = require("node:path")
const fs = require("node:fs")
const crypto = require("node:crypto")
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const jwt = require('jsonwebtoken')
const { UserRole } = require('./UserRole.js')
const https = require("https")
const http = require("http")
const express = require('express')

module.exports.Helper = class {

  static createExpressServer() {

    return (route, port) => {
      const app = express()

      let server
      if (process.env.PATH_TO_CERTIFICATE && process.env.PATH_TO_PRIVATE_KEY) {
        server = https.createServer({
          cert: fs.readFileSync(process.env.PATH_TO_CERTIFICATE),
          key: fs.readFileSync(process.env.PATH_TO_PRIVATE_KEY)
        }, app)
      } else {
        server = http.createServer(app)
      }

      function start() {
        server.listen(port, () => console.log(`[${route}] is running on port :${port}`))
      }
      function stop() {
        if (server) {
          server.close(() => console.log(`[${route}] has been stopped`))
        } else {
          console.log(`[${route}] is not running`)
        }
      }
      return { app, server, start, stop }
    }
  }

  static debounce = this.fn("debounce")

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

  static get(event, input) {

    if (event === "keys/children") {

      return new Promise(async(resolve, reject) => {
        try {
          if (this.verifyIs("text/empty", input.jwt.id)) throw new Error("req.jwt.id is empty")
          if (this.verifyIs("array/empty", input.body.keys)) throw new Error("req.body.keys is empty")
          const doc = await nano.db.use("getyour").get("users")
          const jwtUser = doc.users.find(user => user.id === input.jwt.id)
          if (jwtUser && jwtUser.children !== undefined) {
            const childrenData = jwtUser.children.map(childId => {
              const childUserIndex = doc.users.findIndex(user => user.id === childId)
              if (childUserIndex !== -1) {
                const childUser = doc.users[childUserIndex]
                const data = {}
                input.body.keys.forEach(key => {
                  data[key] = childUser[key]
                })
                return data
              }
              return null
            }).filter(data => data !== null)

            if (childrenData.length > 0) {
              resolve(childrenData)
            }
          }
        } catch (error) {
          reject(error)
        }
      })

    }

  }

  static verifyIs(event, input) {

    if (event === "array/empty") {
      return !Array.isArray(input) || input.length === 0
    }

    if (event === "key/reserved") {

      const reserved = ["id", "email", "verified", "reputation", "created", "getyour", "roles", "session", "owner", "expert", "admin", "type", "children", "parent", "password", "payment"]
      for (let i = 0; i < reserved.length; i++) {
        const word = reserved[i]
        if (word === input) return true
      }
      return false

    }

    if (event === "key/deletable") {

      const reserved = ["id", "email", "verified", "reputation", "created", "roles", "children", "parent"]

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

    if (event === "object/array") {
      return Array.isArray(input)
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

    if (event === "user/admin") {
      const admins = process.env.ADMINS.split(",")
      for (let i = 0; i < admins.length; i++) {
        const admin = admins[i]
        if (input.email === admin) {
          if (input.verified === true) return true
        }
      }
      return false
    }

    if (event === "user/domain") {

      if (input.email !== undefined) {
        if (input.email.endsWith(process.env.DOMAIN)) {
          if (input.verified === true) return true
        }
      }
      return false
    }

    if (event === "user/expert") {
      if (input["getyour"] !== undefined) {
        if (input["getyour"].expert !== undefined) {
          if (input["getyour"].expert.name !== undefined) {
            if (input.verified === true) return true
          }
        }
      }
      return false
    }

    if (event === "user/location-expert") {
      if (input.user["getyour"] !== undefined) {
        if (input.user["getyour"].expert !== undefined) {
          if (input.user["getyour"].expert.name === input.req.location.expert) {
            if (input.user.verified === true) return true
          }
        }
      }
      return false
    }

    if (event === "user/location-writable") {

      return new Promise(async(resolve, reject) => {
        try {
          const doc = await nano.db.use("getyour").get("users")
          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]
            if (user["getyour"] !== undefined) {
              if (user["getyour"].expert !== undefined) {
                if (user["getyour"].expert.name === input.req.location.expert) {
                  if (user["getyour"].expert.platforms !== undefined) {
                    for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                      const platform = user["getyour"].expert.platforms[i]
                      if (platform.name === input.req.location.platform) {
                        if (platform.values !== undefined) {
                          for (let i = 0; i < platform.values.length; i++) {
                            const value = platform.values[i]
                            if (value.path === `/${input.req.location.expert}/${input.req.location.platform}/${input.req.location.path}/`) {
                              if (value.writability !== undefined) {
                                for (let i = 0; i < value.writability.length; i++) {
                                  const authorized = value.writability[i]
                                  if (input.user.email === authorized) {
                                    if (input.user.verified === true) resolve(true)
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

      if (input.value.writability !== undefined) {
        for (let i = 0; i < input.value.writability.length; i++) {
          const authorized = input.value.writability[i]
          if (input.writable.email === authorized) {
            if (input.writable.verified === true) return true
          }
        }
      }
      return false
    }

  }

  static verify(event, input, check) {

    if (event === "user/location-expert") {

      if (input["getyour"] !== undefined) {
        if (input["getyour"].expert !== undefined) {
          if (input["getyour"].expert.name === check) {
            return true
          }
        }
      }

      return false

    }

    if (event === "user/location-writable") {

      if (input["getyour"] !== undefined) {
        if (input["getyour"].expert !== undefined) {
          if (input["getyour"].expert.name === check.location.expert) {
            if (input["getyour"].expert.platforms !== undefined) {
              for (let i = 0; i < input["getyour"].expert.platforms.length; i++) {
                const platform = input["getyour"].expert.platforms[i]
                if (platform.name === check.location.platform) {
                  if (platform.values !== undefined) {
                    for (let i = 0; i < platform.values.length; i++) {
                      const value = platform.values[i]
                      if (value.path === `/${check.location.expert}/${check.location.platform}/${check.location.path}/`) {
                        if (value.writability !== undefined) {
                          for (let i = 0; i < value.writability.length; i++) {
                            const authorized = value.writability[i]
                            if (check.email === authorized) {
                              return true
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

      return false

    }

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

      const value = this.convert("user-tree/value", {user: input, tree: check.left})


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

      if (!this.stringIsEmpty(updated.left)) {
        old.left = updated.left
      }

      if (!this.stringIsEmpty(updated.operator)) {
        old.operator = updated.operator
      }

      if (!this.stringIsEmpty(updated.right)) {
        old.right = updated.right
      }

      if (!this.stringIsEmpty(updated.action)) {
        old.action = updated.action
      }

    }

    if (event === "script") {

      if (this.stringIsEmpty(updated.script)) throw new Error("script is empty")
      old.script = updated.script

      if (!this.stringIsEmpty(updated.name)) {
        old.name = updated.name
      }

    }

    if (event === "source") {
      Object.entries(updated).forEach(([key, value]) => {
        if (key === "authors") old.authors = value.split(",").map(it => it.trim())
        if (key === "title") old.title = value
        if (key === "edition") old.edition = value
        if (key === "publisher") old.publisher = value.split(",").map(it => it.trim())
        if (key === "published") old.published = value
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

    if (event === "path/file-name-list") {

      function getAllFileNamesFromDirectory(relativePathname, arrayOfFileNames) {
        const directoryPath = path.join(__dirname, relativePathname)
        const files = fs.readdirSync(directoryPath)

        arrayOfFileNames = arrayOfFileNames || []

        files.forEach((file) => {
          if (fs.statSync(path.join(directoryPath, file)).isDirectory()) {
            arrayOfFileNames = this.getAllFileNamesFromDirectory(path.join(relativePathname, file), arrayOfFileNames)
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

    if (event === "tree/match-maker-list") {
      return new Promise(async(resolve, reject) => {

        try {

          const doc = await nano.db.use("getyour").get("users")
          if (this.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")

          const tags = input.split(".")

          const array = []
          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]

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

          resolve(array)

        } catch (error) {
          reject(error)
        }



      })
    }

    if (event === "user-tags/value") {

      const result = {}

      for (let i = 0; i < input.tags.length; i++) {
        const tag = input.tags[i]

        result[tag] = this.convert("user-tag/value", {user: input.user, tag})

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

    if (event === "mirror/users-map") {


      return new Promise(async(resolve, reject) => {

        const doc = await nano.db.use("getyour").get("users")
        if (this.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users are undefined")

        const array = []
        userloop: for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]

          for (let i = 0; i < input.length; i++) {
            const tree = input[i]
            if (this.verify("user/tree/exist", user, tree) === false) continue userloop
          }

          const clone = {}
          clone.reputation = user.reputation
          clone.treeValues = []

          for (let i = 0; i < input.length; i++) {
            const tree = input[i]

            if (this.verify("user/tree/exist", user, tree) === true) {

              const map = {}

              map.tree = tree
              map.user = user
              const value = this.convert("user-tree/value", map)

              const treeValuePair = {}
              treeValuePair.tree = tree
              treeValuePair.value = value

              clone.treeValues.push(treeValuePair)

            }

          }

          array.push(clone)

        }

        resolve(array)

      })




    }

    if (event === "tag/capitalizeFirstLetter") {





      const tagSplit = input.split("-")
      const results = []
      for (let i = 0; i < tagSplit.length; i++) {
        results.push(this.capitalizeFirstLetter(tagSplit[i]))
      }
      const output = results.join(" ")

      if (this.stringIsEmpty(output)) throw new Error(`${event} is empty`)


      return output


    }

  }

  static getKeysRecursively(obj) {
    let keys = [];

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
        if (typeof obj[key] === "object") {
          const nestedKeys = this.getKeysRecursively(obj[key]);
          keys = keys.concat(nestedKeys.map(nestedKey => `${key}.${nestedKey}`));
        }
      }
    }

    return keys;
  }

  static getUserPlatformValues(user, callback) {
    if (user.getyour && user.getyour.expert && user.getyour.expert.platforms) {
      for (const platform of user.getyour.expert.platforms) {
        if (platform.values) {
          for (const value of platform.values) {
            callback(value)
          }
        }
      }
    }
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

  static async log(input, req, res, next) {
    try {
      const log = {}
      log.type = "info"
      // log.date = new Date().toISOString()
      log.method = req.method
      log.location = req.headers.referer
      // console.log(req.headers);
      // console.log(res);
      log.endpoint = req.originalUrl
      log.is = typeof input
      log.input = input
      // log.req = req
      // log.res = res
      // log.next = next

      const doc = await nano.db.use("getyour").get("logs")
      doc.logs.unshift(log)
      console.log(log)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })

    } catch (error) {
      console.log(error)
    }
  }

  static async logError(error, request) {
    try {
      if (error === undefined) throw new Error("error is undefined")
      if (request === undefined) throw new Error("request is undefined")

      const log = {}
      log.type = "error"
      log.message = error.message
      log.method = request.method
      log.location = request.headers.referer
      log.endpoint = request.originalUrl
      log.stack = error.stack

      const doc = await nano.db.use("getyour").get("logs")
      doc.logs.unshift(log)
      console.log(log)
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })

    } catch (error) {
      console.log(error)
    }
  }

  static verifyJwtToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, async(error, jwt) => {
        if (error) return reject(error)
        else return resolve(jwt)
      })
    })
  }

  static async createLogs(database) {
    try {
      await nano.db.use(database).insert({ logs: [] }, "logs")
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
      if (!this.stringIsEmpty(result)) return result
      throw new Error("reaf file failed")
    } catch (error) {
      throw new Error(error)
    }
  }

  static numberIsEmpty(number) {
    return typeof number !== "number" ||
    number === undefined ||
    number === null
  }

  static arrayIsEmpty(array) {
    return typeof array !== "object" ||
    !Array.isArray(array) ||
    array === undefined ||
    array === null ||
    array.length === 0 ||
    array.length < 0
  }

  static objectIsEmpty(object) {
    return typeof object !== "object" ||
    object === undefined ||
    object === null
  }

  static booleanIsEmpty(boolean) {
    return typeof boolean !== "boolean" ||
    boolean === undefined ||
    boolean === null
  }

  static stringIsEmpty(string) {
    return typeof string !== "string" ||
    string === undefined ||
    string === null ||
    string === "" ||
    string.replace(/\s/g, "") === ""
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
      if (this.objectIsEmpty(options)) reject("email options are empty")
      if (this.objectIsEmpty(transporter)) reject("smtp transporter is empty")

      transporter.sendMail(options, function(error, info){
        if (error !== null) reject(error)
        resolve()
      })
    })
  }

  static getAllFilesFromDirectory(relativePathname, arrayOfFiles) {
    const directoryPath = path.join(__dirname, relativePathname)
    files = fs.readdirSync(directoryPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach((file) => {
      if (fs.statSync(directoryPath + "/" + file).isDirectory()) {
        arrayOfFiles = this.getAllFilesFromDirectory(relativePathname + "/" + file, arrayOfFiles)
      } else {
        arrayOfFiles.push(path.join(__dirname, "..", relativePathname, "/", file))
      }
    })
    return arrayOfFiles
  }
}
