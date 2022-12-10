require('dotenv').config()
const db = require("nano")(process.env.DB)
const Notification = require('../lib/Notification.js')

module.exports = class Storage {
  static async createDoc(name) {
    try {
      await db.insert(JSON.parse(`{ "${name}": [] }`), name)
    } catch (error) {
      Notification.error("DB_INSERT_ERROR")
      console.log(error)
      return {
        status: 500,
        message: "DB_INSERT_ERROR"
      }
    }
    return {
      status: 200,
      message: "CREATE_DOC_SUCCESS",
    }
  }
}

