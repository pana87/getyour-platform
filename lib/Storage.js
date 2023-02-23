require('dotenv').config()
const nano = require("nano")(process.env.COUCHDB_LOCATION)
const { CouchDBErrorCode } = require('./CouchDBErrorCode.js')

module.exports = class Storage {

  // static async filter(predicate) {
  //   try {
  //     const array = []
  //     const doc = await nano.db.use("getyour").get("users")
  //     // const { doc } = await this.get("getyour", "users")
  //     if (doc !== undefined) {
  //       for (let i = 0; i < doc.users.length; i++) {
  //         if (
  //           typeof predicate(doc.users[i]) === "boolean" &&
  //           predicate(doc.users[i]) &&
  //           doc.users[i] !== undefined
  //         ) {
  //           array.push(doc.users[i])
  //           return {
  //             status: 200,
  //             message: "FILTER_USER_SUCCEED",
  //             array: array,
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return {
  //     status: 500,
  //     message: "FILTER_USER_FAILED",
  //   }
  // }

  // static async find(predicate) {
  //   try {
  //     const { doc } = await this.get("getyour", "users")
  //     if (doc !== undefined) {
  //       for (let i = 0; i < doc.users.length; i++) {
  //         if (
  //           typeof predicate(doc.users[i]) === "boolean" &&
  //           predicate(doc.users[i]) &&
  //           doc.users[i] !== undefined
  //         ) {
  //           return {
  //             status: 200,
  //             message: "FIND_USER_SUCCEED",
  //             doc: doc,
  //             user: doc.users[i],
  //           }
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return {
  //     status: 500,
  //     message: "FIND_USER_FAILED",
  //   }
  // }

  // static async insert(database, document) {
  //   try {
  //     await nano.db.use(database).insert(document)
  //     return {
  //       status: 200,
  //       message: "INSERT_SUCCEED",
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return {
  //     status: 200,
  //     message: "INSERT_FAILED",
  //   }
  // }

  // static async configureClient() {
  //   try {
  //     await nano.db.create(process.env.DATABASE_NAME)
  //     const db = nano.db.use(process.env.DATABASE_NAME)
  //     await db.insert({ users: [] }, "users")
  //     return {
  //       status: 200,
  //       message: "CONFIGURE_CLIENT_SUCCEED",
  //     }
  //   } catch (error) {
  //     if (error.statusCode !== CouchDBErrorCode.DATABASE_ALREADY_EXIST) {
  //       console.error(error)
  //     }
  //   }
  //   return {
  //     status: 500,
  //     message: "CONFIGURE_CLIENT_FAILED",
  //   }
  // }

  // static async get(database, document) {
  //   try {
  //     const doc = await nano.db.use(database).get(document)
  //     return {
  //       status: 200,
  //       message: "GET_DOCUMENT_SUCCEED",
  //       doc: doc,
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return {
  //     status: 500,
  //     message: "GET_DOCUMENT_FAILED",
  //   }
  // }
}
