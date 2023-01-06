require('dotenv').config()
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const Notification = require('../lib/Notification.js')

class CouchDB {
  static async get(document) {
    const db = nano.db.use("getyour")
    try {
      const doc = await db.get(document)
      return {
        status: 200,
        message: "GET_DOCUMENT_SUCCESS",
        users: doc.users,
        doc: doc,
      }
    } catch (error) {
      console.log(error);
      const response = db.insert({ users: [] }, "users")
      console.log(response);
    }
  }

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

// async function init() {
//   await CouchDB.create("getyour")
//   CouchDB.get("users")
// }
// init()


module.exports.nano = nano
module.exports.db = nano.db.use("getyour")


