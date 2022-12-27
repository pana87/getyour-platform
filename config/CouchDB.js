require('dotenv').config()
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const Notification = require('../lib/Notification.js')

class CouchDB {
  static async create(database) {
    const databases = await nano.db.list()

    if (!databases.includes(database)) {
      try {
        nano.db.create(database)
        Notification.info(`database '${database}' created successfully`)
      } catch (error) {
        Notification.error("could not create db")
        console.error(error)
      }
    }
  }
}

CouchDB.create("getyour")
module.exports.nano = nano
module.exports.db = nano.db.use("getyour")
