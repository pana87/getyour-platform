require('dotenv').config()
const nodemailer = require("nodemailer")
const path = require("node:path")
const fs = require("node:fs")
const crypto = require("node:crypto")
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const jwt = require('jsonwebtoken')
const { UserRole } = require('./UserRole.js')
const https = require("https")

module.exports.Helper = class {

  static verifyIs(event, input) {

    if (event === "key/reserved") {

      const reserved = ["id", "email", "verified", "reputation", "created", "getyour", "roles", "session", "owner", "expert", "admin", "type", "children", "parent", "password"]

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

    if (event === "object/array") {
      return Array.isArray(input)
    }

    if (event === "typeof") {
      if (!input) return undefined
      return input.constructor.name
    }

    if (event === "email/super-admin") {
      if (input === "p.tsivelekidis@get-your.de") return true
      if (input === "f.steck@get-your.de") return true
      if (input === "s.ummak@get-your.de") return true
      return false
    }

    if (event === "user/getyour-admin") {

      if (input.email !== undefined) {

        if (input.email.endsWith("@get-your.de")) {
          if (input.roles !== undefined) {
            for (let i = 0; i < input.roles.length; i++) {
              const role = input.roles[i]

              if (role === UserRole.ADMIN) {
                if (input["getyour"] !== undefined) {
                  if (input["getyour"].admin !== undefined) {
                    if (input.verified === true) return true
                  }
                }

              }

            }

          }
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

    if (event === "service") {

      if (!this.stringIsEmpty(updated.quantity)) {
        old.quantity = updated.quantity
      }

      if (!this.stringIsEmpty(updated.unit)) {
        old.unit = updated.unit
      }

      if (!this.stringIsEmpty(updated.title)) {
        old.title = updated.title
      }

      if (!this.stringIsEmpty(updated.price)) {
        old.price = updated.price
      }

      if (!this.stringIsEmpty(updated.currency)) {
        old.currency = updated.currency
      }

      if (!this.booleanIsEmpty(updated.selected)) {
        old.selected = updated.selected
      }


    }

    if (event === "role") {

      if (!this.stringIsEmpty(updated.home)) {
        old.home = updated.home
      }

      if (!this.stringIsEmpty(updated.name)) {
        old.name = updated.name
      }

      if (updated.apps !== undefined) {
        old.apps = updated.apps
      }

    }

  }

  static isReserved(string) {

    const reserved = ["id", "email", "verified", "reputation", "created", "getyour", "roles", "session", "owner", "expert", "admin", "type", "children", "parent", "password"]

    for (let i = 0; i < reserved.length; i++) {
      const word = reserved[i]
      if (word === string) return true
    }

    return false

  }

  static convert(event, input) {

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

  static translateRole(role) {
    let map

    if (parseInt(role) === UserRole.SELLER) {
      map = {}
      map.name = "Verkäufer"
      return map
    }

    return map
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

  static async log(event, input, request) {

    if (event === "info") {

      return new Promise(async(resolve, reject) => {

        try {

          const log = {}
          log.type = event
          log.input = input
          log.is = typeof input

          if (request !== undefined) {
            log.method = request.method
            log.endpoint = request.originalUrl
            log.location = `${request.protocol}://${request.get('host')}${request.originalUrl}`
            log.referer = request.headers.referer
          }

          const doc = await nano.db.use("getyour").get("logs")
          doc.logs.unshift(log)
          console.log(log)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })

          return resolve()
        } catch (error) {
          console.log(error)
        }
      })


    }

    if (event === "error") {

      return new Promise(async(resolve, reject) => {

        try {

          const log = {}
          log.type = event
          log.message = input.message
          log.stack = input.stack

          if (request !== undefined) {
            log.method = request.method
            log.endpoint = request.originalUrl
            log.location = `${request.protocol}://${request.get('host')}${request.originalUrl}`
            log.referer = request.headers.referer
          }


          const doc = await nano.db.use("getyour").get("logs")
          doc.logs.unshift(log)
          console.log(log)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })

          return resolve()
        } catch (error) {
          console.log(error)
        }
      })


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

  static isOperator(array) {
    let found = false
    for (let i = 0; i < array.roles.length; i++) {
      if (array.roles[i] === UserRole.OPERATOR) {
        found = true
        break
      }
    }
    return found
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

  static generateRandomPin(length) {
    let result = ""
    var characters = '0123456789'

    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
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
