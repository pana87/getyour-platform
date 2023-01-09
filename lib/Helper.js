require('dotenv').config()
const nodemailer = require("nodemailer")
const path = require("node:path")
const fs = require("node:fs")
const Notification = require('./Notification.js')
const crypto = require("node:crypto")
const lodash = require("lodash")

module.exports.Helper = class {

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

      transporter.sendMail(options, function(error, info){
        if (!error) {
          return resolve({
            status: 200,
            message: "SEND_EMAIL_SUCCEED",
          })
        }
        Notification.error(error)
        return resolve({
            status: 500,
            message: "SEND_EMAIL_FAILED",
        })
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
