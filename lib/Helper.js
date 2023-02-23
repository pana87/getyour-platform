require('dotenv').config()
const nodemailer = require("nodemailer")
const path = require("node:path")
const fs = require("node:fs")
const crypto = require("node:crypto")
const lodash = require("lodash")
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const { CouchDBErrorCode } = require('./CouchDBErrorCode.js')
const jwt = require('jsonwebtoken')
const { UserRole } = require('./domain/UserRole.js')

module.exports.Helper = class {

  static async findUser(predicate) {
    return new Promise(async(resolve, reject) => {
      try {
        const doc = await nano.db.use("getyour").get("users")
        if (this.objectIsEmpty(doc)) throw new Error("doc is empty")
        for (let i = 0; i < doc.users.length; i++) {
          if (this.booleanIsEmpty(predicate(doc.users[i]))) throw new Error("predicate is empty")
          if (this.objectIsEmpty(doc.users[i])) throw new Error("user is empty")
          if (predicate(doc.users[i])) {
            return resolve({doc: doc, user: doc.users[i]})
          }
        }
      } catch (error) {
        console.error(error)
      }
      return reject("user not found")
    })
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
    const {type, name, funnel} = options
    const offer = {}
    offer.name = name
    offer.type = type
    offer.storage = `${name}${this.capitalizeFirstLetter(type)}`
    offer.id = "BPA-" + Date.now()
    offer.created_at = Date.now()
    const twoWeeks = 1000 * 60 * 60 * 24 * 14
    offer.expires_at = Date.now() + twoWeeks
    offer.visibility = "hidden"
    offer.href = "https://bestprime.com"
    offer.title = "BPE SolarHyprid-System"
    offer.description = "Mit dem BPE SolarHyprid-System nutzen Sie die Vorteile von kostenloser Umweltwärme und unvergleichlich hohem Heizkomfort für Ihr Bestandsobjekt. Als einziges Heizsystem erlaubt die Wärmepumpe auch die Kühlung von Gebäuden, indem der Heizkreislauf umgekehrt wird und dem Gebäude damit Wärme entzogen werden kann. Dies geschieht über den Fußboden, die Wand oder die Decke im Raum."
    offer.from = {
      company: "BestPrime GmbH",
      sector: "Energy",
      street: "Im Gewerbepark",
      houseNumber: "C25",
      zip: "93059",
      city: "Regensburg",
    }
    offer.assets = {
      logo: "bestprimelogo.png",
      print: "bestprime-bpe-angebot.html",
      terms: "bestprime-terms.pdf",
      brochure: "bestprime-brochure.pdf",
      info: "bestprime-information.pdf",
    }
    // console.log(offer);
    offer.options = [
      {amount: 1, title: "5 kW PV: Batterie - Box Premium HVS 5.1 (5,12kWh)", price: 9990, selected: false},
      {amount: 13, title: "5kW PV 13: HIGH PERFORMANCE PV MODULE RSM40-8-390M-415M", price: 4875, selected: false},
      {amount: 1, title: "5kW PV: 6 mm2 DC Solarkabel 100m", price: 250, selected: false},
      {amount: 4, title: "5kW PV: MC4 Connector Set 4 Stk.", price: 32, selected: false},
      {amount: 1, title: "5kW PV: Montageset 5 kW", price: 1500, selected: false},
      {amount: 1, title: "5kW PV: Wechselrichter 5 kW", price: 2500, selected: false},
      {amount: 1, title: "ST 12 kW: FROSTSCHUTZMITTEL, -37 C, 20 L/STK.", price: 85, selected: false},
      {amount: 2, title: "ST 12 kW: Solarkollektor BPE ALS 2110, FULL PLATE", price: 1650, selected: false},
      {amount: 2, title: "ST 12 kW: MONTAGESATZ, AUF DACH, 2108", price: 535, selected: false},
      {amount: 1, title: "ST 12 kW: Solarschlauch, 15mt, doppelt, mit Sensor, Epdm isoliert 13mm, DN16", price: 400, selected: false},
      {amount: 1, title: "WP 12 kW: Thermowatt Thermostat, 2KW", price: 20, selected: false},
      {amount: 1, title: "WP 12 kW: WIDERSTAND, THERMOWATT 182384, 3000W, 220V, 289mm", price: 35, selected: false},
      {amount: 1, title: "WP 12 kW: WÄRMEPUMPE, BPE12 INV, 12kW", price: 9950, selected: false},
      {amount: 1, title: "WP/ST 12 kW: Bausatz, Zubehör, für 300lt Forced System", price: 370.5, selected: false},
      {amount: 1, title: "WP/ST 12 kW: Automatic Air Ventilation, 160C, 1/2” Connection", price: 30, selected: false},
      {amount: 1, title: "WP/ST 12 kW: BEHÄLTER, AUSDEHNUNGSGEFÄSS, 12 L", price: 80, selected: false},
      {amount: 1, title: "WP/ST 12 kW: BPEKOMBI Hygienespeicher + Solarspeicher + Puffer 300 Liter", price: 1750, selected: false},
      {amount: 1, title: "WP/ST 12 kW: PUMPENGRUPPE, TIEMME, EINZELAGGREGAT, BPE 15/65", price: 525, selected: false},
      {amount: 1, title: "WP/ST 12 kW: SICHERHEITSVENTIL 6BAR", price: 12.5, selected: false},
      {amount: 1, title: "WP/ST 12 kW: STEUERUNG, AUTOMATISCH, RESOL DELTASOL CS/2, SSC-1", price: 350, selected: false},
      {amount: 1, title: "WP/ST 12 kW: Ventil, Sicherheit, 4 Bar, Watt, 1/2”, MSV/E (0207540)", price: 10, selected: false},
      {amount: 1, title: "Montage und Lieferung Komplettsystem inklusive Abnahme und Übergabe*", price: 9955, selected: false},
      {amount: 1, title: "Option: Entsorgung des alten Energiesystems", price: 0, selected: false},
      {amount: 1, title: "Option: Be- und Entlüftungsrohre verrücken", price: 0, selected: false},
      {amount: 1, title: "Option: Blitzschutzanlage verrücken", price: 0, selected: false},
      {amount: 1, title: "Option: Dachaufbauten verrücken", price: 0, selected: false},
      {amount: 1, title: "Option: Montageteam stellt Gerüst", price: 0, selected: false},
      {amount: 1, title: "Option: DC-Kabel 30 Extrameter", price: 0, selected: false},
      {amount: 1, title: "Option: Speicherkabel 20 Extrameter", price: 0, selected: false},
      {amount: 1, title: "Option: Einbau neuer Zählerschrank", price: 0, selected: false},
      {amount: 1, title: "Option: Einbau zusätzlicher Unter-/Zwischenzähler", price: 0, selected: false},
      {amount: 1, title: "Option: Zusammenlegen der Zähler", price: 0, selected: false},
      {amount: 1, title: "Option: Potentialausgleichsschiene inkl. Fundamenterder", price: 0, selected: false},
    ]

    for (let i = 0; i < offer.options.length; i++) {
      // check which option should be selected for a specific shsFunnel
    }

    offer.grossAmount = offer.options.filter(it => it.selected === true).reduce((prev, curr) => prev + curr.price, 0)
    offer.discount = 0.2
    offer.vat = 0.19

    offer.value = {}
    offer.value.selected = false

    // offer.value.selected = true
    // offer.digest = this.digest(JSON.stringify(offer))
    // offer.value.selected = false

    return offer
  }

  static createSHSFunnel(options) {
    const {type, name} = options

    // things that producer provides
    const funnel = {}
    funnel.name = name
    funnel.type = type
    funnel.storage = `${name}${this.capitalizeFirstLetter(type)}`
    funnel.id = this.digest(`${Date.now()}`)
    funnel.created_at = Date.now()
    funnel.visibility = "hidden"
    funnel.paths = []
    funnel.paths.push("/felix/shs/funnel/qualifizierung/")
    funnel.paths.push("/felix/shs/funnel/abfrage-haus/")
    funnel.paths.push("/felix/shs/funnel/abfrage-heizung/")
    funnel.paths.push("/felix/shs/funnel/abfrage-strom/")
    funnel.paths.push("/felix/shs/funnel/abfrage-technisches/")
    funnel.paths.push("/felix/shs/funnel/abfrage-persoenliches/")
    funnel.questionIndex = 0
    // things that consumer provides
    funnel.value = {}

    const pathToAssets = "/felix/shs/funnel/qualifizierung/img/"
    // questions comes from database - require questions
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

  static verifyPin(userPin, randomPin) {
    if (this.stringIsEmpty(randomPin)) throw new Error("random pin is empty")
    if (this.stringIsEmpty(userPin)) throw new Error("user pin is empty")
    if (userPin !== randomPin) throw new Error("user pin is not valid")
  }

  static async filter(predicate) {
    try {
      const array = []
      const doc = await nano.db.use("getyour").get("users")
      if (doc !== undefined) {
        for (let i = 0; i < doc.users.length; i++) {
          if (
            typeof predicate(doc.users[i]) === "boolean" &&
            predicate(doc.users[i]) &&
            doc.users[i] !== undefined
          ) {
            array.push(doc.users[i])
            return {
              status: 200,
              message: "FILTER_USER_SUCCEED",
              array: array,
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "FILTER_USER_FAILED",
    }
  }

  static async configureClientStorage() {
    try {
      await nano.db.create(process.env.DATABASE_NAME)
      const db = nano.db.use(process.env.DATABASE_NAME)
      await db.insert({ users: [] }, "users")
      return {
        status: 200,
        statusText: "CONFIGURE_CLIENT_SUCCEED",
      }
    } catch (error) {
      if (error.statusCode !== CouchDBErrorCode.DATABASE_ALREADY_EXIST) {
        console.error(error)
      }
    }
    return {
      status: 500,
      statusText: "CONFIGURE_CLIENT_FAILED",
    }
  }

  static async find(predicate) {
    try {
      const doc = await nano.db.use("getyour").get("users")

      if (doc !== undefined) {
        for (let i = 0; i < doc.users.length; i++) {
          if (
            typeof predicate(doc.users[i]) === "boolean" &&
            predicate(doc.users[i]) &&
            doc.users[i] !== undefined
          ) {
            return {
              status: 200,
              message: "FIND_USER_SUCCEED",
              doc: doc,
              user: doc.users[i],
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "FIND_USER_FAILED",
    }
  }

  static readFileSyncToString(relativePath) {
    try {
      const result = fs.readFileSync(path.join(__dirname, relativePath)).toString()
      if (!this.stringIsEmpty(result)) return result
    } catch (error) {
      console.error(error)
    }
    return undefined
  }

  static numberIsEmpty(number) {
    try {
      if (typeof number !== "number") throw new Error(`expected number, found '${number}'`)
      if (number === undefined) throw new Error(`expected number, found '${number}'`)
      if (number === null) throw new Error(`expected number, found '${number}'`)
    } catch (error) {
      console.error(error)
    }
    return typeof number !== "number" ||
    number === undefined ||
    number === null
  }

  static arrayIsEmpty(array) {
    try {
      if (typeof array !== "object") throw new Error(`expected array, found '${JSON.stringify(array)}'`)
      if (!Array.isArray(array)) throw new Error(`expected array, found '${JSON.stringify(array)}'`)
      if (array === undefined) throw new Error(`expected array, found '${JSON.stringify(array)}'`)
      if (array === null) throw new Error(`expected array, found '${JSON.stringify(array)}'`)
      if (array.length === 0) throw new Error(`expected array, found '${JSON.stringify(array)}'`)
      if (array.length < 0) throw new Error(`expected array, found '${JSON.stringify(array)}'`)
    } catch (error) {
      console.error(error)
    }
    return typeof array !== "object" ||
    !Array.isArray(array) ||
    array === undefined ||
    array === null ||
    array.length === 0 ||
    array.length < 0
  }

  static objectIsEmpty(object) {
    try {
      if (typeof object !== "object") throw new Error(`expected object, found '${JSON.stringify(object)}'`)
      if (object === undefined) throw new Error(`expected object, found '${JSON.stringify(object)}'`)
      if (object === null) throw new Error(`expected object, found '${JSON.stringify(object)}'`)
    } catch (error) {
      console.error(error)
    }
    return typeof object !== "object" ||
    object === undefined ||
    object === null
  }

  static booleanIsEmpty(boolean) {
    try {
      if (typeof boolean !== "boolean") throw new Error(`expected boolean, found '${boolean}'`)
      if (boolean === undefined) throw new Error(`expected boolean, found '${boolean}'`)
      if (boolean === null) throw new Error(`expected boolean, found '${boolean}'`)
    } catch (error) {
      console.error(error)
    }
    return typeof boolean !== "boolean" ||
    boolean === undefined ||
    boolean === null
  }

  static stringIsEmpty(string) {
    try {
      if (typeof string !== "string") throw new Error(`expected string, found '${string}'`)
      if (string === undefined) throw new Error(`expected string, found '${string}'`)
      if (string === null) throw new Error(`expected string, found '${string}'`)
      if (string === "") throw new Error(`expected string, found '${string}'`)
      if (string.replace(/\s/g, "") === "") throw new Error(`expected string, found '${string}'`)
    } catch (error) {
      console.error(error)
    }
    return typeof string !== "string" ||
    string === undefined ||
    string === null ||
    string === "" ||
    string.replace(/\s/g, "") === ""
  }

  static generateRandomBytes(length) {
    return Array.from(Uint8Array.from(crypto.randomBytes(length)))
  }

  static isEqual(value, other) {
    return lodash.isEqual(value, other)
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
