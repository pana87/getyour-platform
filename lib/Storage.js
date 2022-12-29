require('dotenv').config()
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const { CouchDBErrorCode } = require('./CouchDBErrorCode.js')

module.exports = class Storage {

  static async clientConfig() {
    try {
      await nano.db.create("getyour")
      const db = nano.db.use("getyour")
      await db.insert({ users: [] }, "users")
      return {
        status: 200,
        message: "CLIENT_CONFIGURED",
      }
    } catch (error) {
      if (error.statusCode !== CouchDBErrorCode.DATABASE_ALREADY_EXIST) {
        console.error(error)
      }
    }
    return {
      status: 500,
      message: "CLIENT_CONFIG_ERROR",
    }
  }

  static async get(database, document) {
    try {
      const doc = await nano.db.use(database).get(document)
      return {
        status: 200,
        message: "GET_DOCUMENT_SUCCESS",
        doc: doc,
      }
    } catch (error) {
      return {
        status: 500,
        message: "GET_DOCUMENT_ERROR",
        error,
      }
    }
  }
}
