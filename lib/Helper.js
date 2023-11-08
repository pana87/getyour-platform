require('dotenv').config()
const nodemailer = require("nodemailer")
const path = require("node:path")
const fs = require("node:fs")
const crypto = require("node:crypto")
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const jwt = require('jsonwebtoken')
const { UserRole } = require('./UserRole.js')

module.exports.Helper = class {

  static create(event, input) {
    if (event === "offer") {

      const map = {}
      map.id = Date.now()
      map.verified = false

      return map

    }
  }

  static verifyIs(event, input) {

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

  }

  static verify(event, input, check) {

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
      const keys = check.split(".")
      let user = input

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]

        if (user && user.hasOwnProperty(key)) {
          user = user[key]
        } else {
          return false
        }

      }

      return true

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

    if (event === "offer") {

      if (!this.stringIsEmpty(updated.name)) {
        old.name = updated.name
      }

      if (!this.stringIsEmpty(updated.expired)) {
        old.expired = updated.expired
      }

      if (!this.stringIsEmpty(updated.title)) {
        old.title = updated.title
      }

      if (!this.stringIsEmpty(updated.link)) {
        old.link = updated.link
      }

      if (!this.stringIsEmpty(updated.description)) {
        old.description = updated.description
      }

      if (!this.stringIsEmpty(updated.message)) {
        old.message = updated.message
      }

      if (!this.stringIsEmpty(updated.note)) {
        old.note = updated.note
      }

      if (!this.stringIsEmpty(updated.company)) {
        old.company = updated.company
      }

      if (!this.stringIsEmpty(updated.sector)) {
        old.sector = updated.sector
      }

      if (!this.stringIsEmpty(updated.street)) {
        old.street = updated.street
      }

      if (!this.stringIsEmpty(updated.zip)) {
        old.zip = updated.zip
      }

      if (!this.stringIsEmpty(updated.city)) {
        old.city = updated.city
      }

      if (updated.termsPdf !== undefined) {
        old.termsPdf = updated.termsPdf
      }

      if (updated.companyPdf !== undefined) {
        old.companyPdf = updated.companyPdf
      }

      if (updated.productPdf !== undefined) {
        old.productPdf = updated.productPdf
      }

      if (!this.stringIsEmpty(updated.vat)) {
        old.vat = updated.vat
      }

      if (!this.stringIsEmpty(updated.discount)) {
        old.discount = updated.discount
      }

      if (!this.booleanIsEmpty(updated.selected)) {
        old.selected = updated.selected
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

  static createBestprimeOffer(options) {
    const {funnel} = options
    if (this.objectIsEmpty(funnel)) throw new Error("funnel is empty")

    const offer = {}
    offer.name = "bestprime"

    offer.type = "offer"
    offer.id = `${Date.now()}`
    offer.created = Date.now()



    const twoWeeks = 1000 * 60 * 60 * 24 * 14
    offer.expiresAt = Date.now() + twoWeeks




    offer.producer = {}
    offer.producer.type = "manufacturer"
    offer.producer.name = "bestprime"
    offer.producer.company = "BestPrime GmbH"
    offer.producer.website = "https://bestprime.com"
    offer.producer.product = "BPE SolarHyprid-System"
    offer.producer.description = "Mit dem BPE SolarHyprid-System nutzen Sie die Vorteile von kostenloser Umweltwärme und unvergleichlich hohem Heizkomfort für Ihr Bestandsobjekt. Als einziges Heizsystem erlaubt die Wärmepumpe auch die Kühlung von Gebäuden, indem der Heizkreislauf umgekehrt wird und dem Gebäude damit Wärme entzogen werden kann. Dies geschieht über den Fußboden, die Wand oder die Decke im Raum."
    offer.producer.sector = "Energy"
    offer.producer.street = "Im Gewerbepark"
    offer.producer.houseNumber = "C25"
    offer.producer.zip = "93059"
    offer.producer.city = "Regensburg"



    offer.producer.terms = "bestprime-agb.pdf"
    offer.producer.productInfo = "bestprime-brochure.pdf"
    offer.producer.companyInfo = "bestprime-information.pdf"



    offer.producer.message = "Wir sind Ihnen schon jetzt für Ihr Vertrauen und Ihr Interesse an unserem BPE-Solar Hybrid System, zur Erzielung einer autarken Energierevolution, dankbar. Mit der BPE-Hybrid-Energie-Lösung profitieren Sie von kostenloser Umweltwärme und einem unvergleichlichen Heizkomfort in Bezug auf Ihr Auftragsobjekt. Unsere innovative Wärmepumpe ermöglicht es, in kälteren Perioden als Heizsystem und an heißen Tagen als Kühlgerät zu wirken."
    offer.producer.note = "Befindet sich die Stellfläche des Gerüsts auf einem öffentlichen Gehweg, muss der Kunde die Genehmigung vorerst bei der Stadt beantragen. Bei einer Freileitung muss der Kunde die Isolierung der Stromführung zur Freileitung beim Netzbetreiber vor der Installation beantragen. Wenn das Gebäude Denkmal- oder Ensemblegeschützt ist, muss der Kunde den Bau eines Energiesystems vorerst bei der Stadt beantragen. Existiert kein W-Lan Signal in der Nähe des Stromspeichers, muss der Kunde eine Internetverbindung ermöglichen. Befindet sich vor Ort kein Hausanschlusskasten (HAK), muss der Kunde diesen vorerst von einer Fachfirma installieren lassen. Bei mehr als 3 Stromzählern muss der Kunde ein, von diesem Angebot unabhängiges, zusätzliches Angebot für ein individuelles Zählerkonzept anfragen. Besitzt der Kunde keine Ersatzziegel ist es seine Aufgabe, diese zu besorgen. Will der Kunde die Module nicht auf dem Haus anbringen, in dem der Speicher ist, müssen die Erdarbeiten im Vorfeld vom Kunden erledigt werden."

    offer.storage = `${offer.producer.name}${this.capitalizeFirstLetter(offer.type)}`

    offer.path = {}
    offer.path.home = "/felix/shs/hersteller-vergleich/"

    offer.options = []

    // q7 - Photovoltaik
    // q8 - Speicher
    // q9 - Wärmepumpe
    // q10 - Solarthermie

    // ich muss die optionen nach namen auswählen können durch select field
    // ich muss das datenfeld abfragen (funnel.q8) // select field aus liste der fields
    // mache fields = [] und dann push wenn erstellt wird
    // jetzt kannst du die fields benutzen und prüfen
    // oder ich hol mir nur die antwort und mappe dann das object


    // zb Wenn Abstand (mit Info) (select field mit auswählbaren möglich keiten) feste liste statisch
    // dann hol ich mir den richtigen datensatz und schreib es in die filter funktion
    // if Hausabstand = 2m (fester String der die Option setzt)
    // der user muss den abfrage string richtig setzen (nur strings abfragen)
    // alles wird zu strings konvertiert
    // wenn keine 2m als antwort dann wird option nicht gesetzt
    // optionsmöglichkeiten (aktivieren/deaktivieren, preis setzen) (select möglichkeite der eigenen services)
    // wie erstellen nur statt name schreiben wird select


    offer.options.push({amount: 1, title: "5 kW PV: Batterie - Box Premium HVS 5.1 (5,12kWh)", price: 9990, selected: false})
    if (funnel.value.q8 === 0) {
      offer.options[offer.options.length - 1].selected = true
    }

    if (funnel.value.q7 === 0) {
      offer.options.push({amount: 13, title: "5kW PV 13: HIGH PERFORMANCE PV MODULE RSM40-8-390M-415M", price: 4875, selected: true})
      offer.options.push({amount: 1, title: "5kW PV: 6 mm2 DC Solarkabel 100m", price: 250, selected: true})
      offer.options.push({amount: 4, title: "5kW PV: MC4 Connector Set 4 Stk.", price: 32, selected: true})
      offer.options.push({amount: 1, title: "5kW PV: Montageset 5 kW", price: 1500, selected: true})
      offer.options.push({amount: 1, title: "5kW PV: Wechselrichter 5 kW", price: 2500, selected: true})
    } else {
      offer.options.push({amount: 13, title: "5kW PV 13: HIGH PERFORMANCE PV MODULE RSM40-8-390M-415M", price: 4875, selected: false})
      offer.options.push({amount: 1, title: "5kW PV: 6 mm2 DC Solarkabel 100m", price: 250, selected: false})
      offer.options.push({amount: 4, title: "5kW PV: MC4 Connector Set 4 Stk.", price: 32, selected: false})
      offer.options.push({amount: 1, title: "5kW PV: Montageset 5 kW", price: 1500, selected: false})
      offer.options.push({amount: 1, title: "5kW PV: Wechselrichter 5 kW", price: 2500, selected: false})
    }

    if (funnel.value.q9 === 0) {
      offer.options.push({amount: 1, title: "WP 12 kW: Thermowatt Thermostat, 2KW", price: 20, selected: true})
      offer.options.push({amount: 1, title: "WP 12 kW: WIDERSTAND, THERMOWATT 182384, 3000W, 220V, 289mm", price: 35, selected: true})
      offer.options.push({amount: 1, title: "WP 12 kW: WÄRMEPUMPE, BPE12 INV, 12kW", price: 9950, selected: true})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: Bausatz, Zubehör, für 300lt Forced System", price: 370.5, selected: true})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: Automatic Air Ventilation, 160C, 1/2” Connection", price: 30, selected: true})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: BEHÄLTER, AUSDEHNUNGSGEFÄSS, 12 L", price: 80, selected: true})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: BPEKOMBI Hygienespeicher + Solarspeicher + Puffer 300 Liter", price: 1750, selected: true})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: PUMPENGRUPPE, TIEMME, EINZELAGGREGAT, BPE 15/65", price: 525, selected: true})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: SICHERHEITSVENTIL 6BAR", price: 12.5, selected: true})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: STEUERUNG, AUTOMATISCH, RESOL DELTASOL CS/2, SSC-1", price: 350, selected: true})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: Ventil, Sicherheit, 4 Bar, Watt, 1/2”, MSV/E (0207540)", price: 10, selected: true})
    } else {
      offer.options.push({amount: 1, title: "WP 12 kW: Thermowatt Thermostat, 2KW", price: 20, selected: false})
      offer.options.push({amount: 1, title: "WP 12 kW: WIDERSTAND, THERMOWATT 182384, 3000W, 220V, 289mm", price: 35, selected: false})
      offer.options.push({amount: 1, title: "WP 12 kW: WÄRMEPUMPE, BPE12 INV, 12kW", price: 9950, selected: false})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: Bausatz, Zubehör, für 300lt Forced System", price: 370.5, selected: false})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: Automatic Air Ventilation, 160C, 1/2” Connection", price: 30, selected: false})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: BEHÄLTER, AUSDEHNUNGSGEFÄSS, 12 L", price: 80, selected: false})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: BPEKOMBI Hygienespeicher + Solarspeicher + Puffer 300 Liter", price: 1750, selected: false})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: PUMPENGRUPPE, TIEMME, EINZELAGGREGAT, BPE 15/65", price: 525, selected: false})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: SICHERHEITSVENTIL 6BAR", price: 12.5, selected: false})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: STEUERUNG, AUTOMATISCH, RESOL DELTASOL CS/2, SSC-1", price: 350, selected: false})
      offer.options.push({amount: 1, title: "WP/ST 12 kW: Ventil, Sicherheit, 4 Bar, Watt, 1/2”, MSV/E (0207540)", price: 10, selected: false})
    }


    if (funnel.value.q10 === 0) {
      offer.options.push({amount: 1, title: "ST 12 kW: FROSTSCHUTZMITTEL, -37 C, 20 L/STK.", price: 85, selected: true})
      offer.options.push({amount: 2, title: "ST 12 kW: Solarkollektor BPE ALS 2110, FULL PLATE", price: 1650, selected: true})
      offer.options.push({amount: 2, title: "ST 12 kW: MONTAGESATZ, AUF DACH, 2108", price: 535, selected: true})
      offer.options.push({amount: 1, title: "ST 12 kW: Solarschlauch, 15mt, doppelt, mit Sensor, Epdm isoliert 13mm, DN16", price: 400, selected: true})
    } else {
      offer.options.push({amount: 1, title: "ST 12 kW: FROSTSCHUTZMITTEL, -37 C, 20 L/STK.", price: 85, selected: false})
      offer.options.push({amount: 2, title: "ST 12 kW: Solarkollektor BPE ALS 2110, FULL PLATE", price: 1650, selected: false})
      offer.options.push({amount: 2, title: "ST 12 kW: MONTAGESATZ, AUF DACH, 2108", price: 535, selected: false})
      offer.options.push({amount: 1, title: "ST 12 kW: Solarschlauch, 15mt, doppelt, mit Sensor, Epdm isoliert 13mm, DN16", price: 400, selected: false})
    }


    offer.options.push({amount: 1, title: "Montage und Lieferung Energiesystem inklusive Abnahme und Übergabe", price: 0, selected: true})

    if (funnel.value.q7 === 0) {
      offer.options[offer.options.length - 1].price = 3500
    }
    if (funnel.value.q7 === 0 && funnel.value.q8 === 0) {
      offer.options[offer.options.length - 1].price = 6000
    }
    if (funnel.value.q7 === 0 && funnel.value.q8 === 0 && funnel.value.q9 === 0) {
      offer.options[offer.options.length - 1].price = 6000
    }
    if (funnel.value.q7 === 0 && funnel.value.q9 === 0) {
      offer.options[offer.options.length - 1].price = 5000
    }
    if (funnel.value.q7 === 0 && funnel.value.q10 === 0) {
      offer.options[offer.options.length - 1].price = 3500
    }


    if (funnel.value.q8 === 0) {
      offer.options[offer.options.length - 1].price = 1500
    }
    if (funnel.value.q8 === 0 && funnel.value.q9 === 0) {
      offer.options[offer.options.length - 1].price = 2500
    }
    if (funnel.value.q8 === 0 && funnel.value.q10 === 0) {
      offer.options[offer.options.length - 1].price = 3000
    }


    if (funnel.value.q9 === 0) {
      offer.options[offer.options.length - 1].price = 1500
    }
    if (funnel.value.q9 === 0 && funnel.value.q10 === 0) {
      offer.options[offer.options.length - 1].price = 2500
    }


    if (funnel.value.q10 === 0) {
      offer.options[offer.options.length - 1].price = 1500
    }


    if (funnel.value.q7 === 0 && funnel.value.q8 === 0 && funnel.value.q9 === 0 && funnel.value.q10 === 0) {
      offer.options[offer.options.length - 1].price = 9955
    }


    offer.options.push({amount: 1, title: "Option: Blitzschutzanlage verrücken", price: 499, selected: false})
    if (funnel.value.hausBlitzschutzanlage[0] === "Ja") {
      offer.options[offer.options.length - 1].selected = true
    }


    offer.options.push({amount: 1, title: "Option: Dachaufbauten verrücken", price: 499, selected: false})
    if (funnel.value.hausDachaufbauten !== undefined) {
      for (let i = 0; i < funnel.value.hausDachaufbauten.length; i++) {
        if (funnel.value.hausDachaufbauten[i] !== "Nein") {
          offer.options[offer.options.length - 1].price = offer.options[offer.options.length - 1].price + 499
        }
      }
    }


    offer.options.push({amount: 1, title: "Option: Gerüststellung durch SHS Montageteam", price: 1000, selected: false})
    if (funnel.value.hausGeruestSelbstGestellt[0] === "Ja") {
      offer.options[offer.options.length - 1].selected = true
    }


    offer.options.push({amount: 1, title: "Option: DC-Kabel 30 Extrameter", price: 500, selected: false})
    if (funnel.value.heizungEintrittZehnMeter[0] === "Ja") {
      offer.options[offer.options.length - 1].selected = true
    }

    offer.options.push({amount: 1, title: "Option: Speicherkabel Extrameter", price: 0, selected: false})
    if (funnel.value.heizungMehrAlsZwanzigMeter[0] === "20-30m") {
      offer.options[offer.options.length - 1].price = 550
      offer.options[offer.options.length - 1].selected = true
    }
    if (funnel.value.heizungMehrAlsZwanzigMeter[0] === "30-40m") {
      offer.options[offer.options.length - 1].price = 1100
      offer.options[offer.options.length - 1].selected = true
    }
    if (funnel.value.heizungMehrAlsZwanzigMeter[0] === "40-50m") {
      offer.options[offer.options.length - 1].price = 1650
      offer.options[offer.options.length - 1].selected = true
    }
    if (funnel.value.heizungMehrAlsZwanzigMeter[0] === "mehr als 50m") {
      offer.options[offer.options.length - 1].price = 2500
    }


    offer.options.push({amount: 1, title: "Option: Einbau eines neuen Zählerschranks", price: 1799, selected: false})
    if (funnel.value.stromZaehlerschrankVerbaut[0] === "Nein") {
      if (funnel.value.stromPlatzZaehlerSchrank[0] === "Ja") {
        offer.options[offer.options.length - 1].selected = true
      }
    }


    offer.options.push({amount: 1, title: "Option: Potentialausgleichsschiene inkl. Fundamenterder", price: 600, selected: false})
    if (funnel.value.technischesPotentialAusgleich[0] === "Nein") {
      offer.options[offer.options.length - 1].selected = true
    }


    offer.grossAmount = offer.options.filter(it => it.selected === true).reduce((prev, curr) => prev + curr.price, 0)



    offer.discount = 0
    offer.vat = 0.19




    offer.value = {}



    // ???
    offer.selected = false

    return offer
  }

  static createSHSFunnel() {

    const funnel = {}
    funnel.name = "shs"
    funnel.type = "funnel"
    funnel.storage = `${funnel.name}${this.capitalizeFirstLetter(funnel.type)}`
    funnel.id = this.digest(`${Date.now()}`)
    funnel.created = Date.now()
    funnel.selected = false

    funnel.path = {}
    funnel.path.qualification = "/felix/shs/qualifizierung/"
    funnel.path.house = "/felix/shs/abfrage-haus/"
    funnel.path.heating = "/felix/shs/abfrage-heizung/"
    funnel.path.electricity = "/felix/shs/abfrage-strom/"
    funnel.path.technical = "/felix/shs/abfrage-technisches/"
    funnel.path.personal = "/felix/shs/abfrage-persoenliches/"

    funnel.questionIndex = 0

    const pathToAssets = "/felix/shs/public/"
    funnel.questions = [
      { question: "Um ein individuelles Angebot erstellen zu können, schenken Sie uns bitte vorab 10 Minuten Ihrer wertvollen Zeit für die Beantwortung der Fragen. Damit wir herausfinden können, ob unser Konzept auch etwas für Sie ist und um Ihre Bedürfnisse noch besser verstehen zu können. <br/><br/>Einverstanden und bereit?", answers: [
        { answer: "JA! Ich bin bereit!", image: `${pathToAssets}ja.svg`},
        { answer: "Nein, das ist mir zu aufwendig.", image: `${pathToAssets}nein.svg`}
      ]},
      { question: "Wo möchten Sie die Photovoltaik installieren?", answers: [
        { answer: "Ein-Zweifamilienhaus", image: `${pathToAssets}einfamilienhaus.svg`},
        { answer: "Mehrfamilienhaus", image: `${pathToAssets}mehrfamilien.svg`},
        { answer: "Firmengebäude", image: `${pathToAssets}firmen.svg`},
        { answer: "Freilandfläche", image: `${pathToAssets}freiland.svg`},
        { answer: "Sonstiges", image: `${pathToAssets}sonstige.svg`}
      ]},
      { question: "Um welchen Gebäudetyp handelt es sich?", answers: [
        { answer: "freistehendes Haus", image: `${pathToAssets}freistehend.svg`},
        { answer: "Doppelhaushälfte", image: `${pathToAssets}doppelhaus.svg`},
        { answer: "Reihenhaus", image: `${pathToAssets}reihenhaus.svg`}
      ]},
      { question: "Bewohnen Sie die Immobilie selbst?", answers: [
        { answer: "Ja", image: `${pathToAssets}bewohnen.svg`},
        { answer: "Nein", image: `${pathToAssets}nichtbewohnen.svg`}
      ]},
      { question: "Sind Sie Eigentümer der Immobilie?", answers: [
        { answer: "Ja", image: `${pathToAssets}eigentuemer.svg`},
        { answer: "Nein", image: `${pathToAssets}nichteigentuemer.svg`}
      ]},
      { question: "Welche Dachform hat das Haus?", answers: [
        { answer: "Satteldach", image: `${pathToAssets}satteldach.svg`},
        { answer: "Pultdach", image: `${pathToAssets}pultdach.svg`},
        { answer: "Flachdach", image: `${pathToAssets}flachdach.svg`},
        { answer: "Walmdach", image: `${pathToAssets}walmdach.svg`},
        { answer: "Sonstiges", image: `${pathToAssets}sonstige.svg`}
      ]},
      { question: "Die Dacheindeckung ist..", answers: [
        { answer: "Steineindeckung", image: `${pathToAssets}steineindeckung.svg`},
        { answer: "Faserzement", image: `${pathToAssets}faserzement.svg`},
        { answer: "Blechdach", image: `${pathToAssets}blechdach.svg`},
        { answer: "Schiefer", image: `${pathToAssets}schiefer.svg`},
        { answer: "Dachpfannen", image: `${pathToAssets}dachpfannen.svg`},
        { answer: "Bieberschwanz", image: `${pathToAssets}bieberschwanz.svg`},
        { answer: "Sonstiges", image: `${pathToAssets}sonstige.svg`},
      ]},
      { question: "Möchten Sie Ihr Energiekonzept durch eine Photovoltaikanlage ergänzen?", answers: [
        { answer: "Ja", image: `${pathToAssets}photovoltaik.svg`},
        { answer: "Nein", image: `${pathToAssets}keinphotovoltaik.svg`}
      ]},
      { question: "Möchten Sie Ihr Energiekonzept durch einen Stromspeicher ergänzen?", answers: [
        { answer: "Ja", image: `${pathToAssets}speicher.svg`},
        { answer: "Nein", image: `${pathToAssets}keinspeicher.svg`}
      ]},
      { question: "Möchten Sie Ihr Energiekonzept durch einen Wärmepumpe ergänzen?", answers: [
        { answer: "Ja", image: `${pathToAssets}waermepumpe.svg`},
        { answer: "Nein", image: `${pathToAssets}keinewaermepumpe.svg`}
      ]},
      { question: "Möchten Sie Ihr Energiekonzept durch eine Solarthermie ergänzen?", answers: [
        { answer: "Ja", image: `${pathToAssets}solar.svg`},
        { answer: "Nein", image: `${pathToAssets}keinsolar.svg`}
      ]},
      { question: "Möchten Sie die Anlage mieten oder kaufen?", answers: [
        { answer: "Kaufen", image: `${pathToAssets}kaufen.svg`},
        { answer: "Mieten", image: `${pathToAssets}mieten.svg`}
      ]},
      { question: "Wollen Sie Bar bezahlen oder finanzieren?", answers: [
        { answer: "Bar bezahlen", image: `${pathToAssets}bar.svg`},
        { answer: "Ich möchte finanzieren", image: `${pathToAssets}finanzieren.svg`}
      ]},
      { question: "Wie alt sind Sie?", answers: [
        { answer: "20 - 40 Jahre", image: `${pathToAssets}20jahre.svg`},
        { answer: "41 - 50 Jahre", image: `${pathToAssets}41jahre.svg`},
        { answer: "51 - 70 Jahre", image: `${pathToAssets}51jahre.svg`},
        { answer: "über 70 Jahre", image: `${pathToAssets}ueber70.svg`},
      ]},
      { question: "Wann soll die Photovoltaik installiert werden?", answers: [
        { answer: "so schnell wie möglich", image: `${pathToAssets}sofort.svg`},
        { answer: "in 1-3 Monate", image: `${pathToAssets}ab1.svg`},
        { answer: "in 4-6 Monate", image: `${pathToAssets}ab4.svg`},
        { answer: "mehr als 6 Monate", image: `${pathToAssets}mehrals6.svg`},
      ]},
    ]
    return funnel
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
