require('dotenv').config()
const { db } = require('../../config/CouchDB.js')
const { Helper } = require('../Helper.js')
const Storage = require('../Storage.js')

module.exports.User = class {

  static async filter(predicate) {
    try {
      const array = []
      const { doc } = await Storage.get("getyour", "users")
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

  static async find(predicate) {
    try {
      const { doc } = await Storage.get("getyour", "users")
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

  static async storeDigest({ id, digest }) {
    try {
      const {doc, user} = await this.find(it => it.email.value === id)
      if (
        user !== undefined &&
        doc !== undefined &&
        user.digest !== digest
        ) {
        user.digest = digest
        await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
        return {
          status: 200,
          message: "ROLES_STORED",
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "STORE_EMAIL_FAILED",
    }
  }

  static async storeName({ id, name }) {
    try {
      const {doc, user} = await this.find(it => it.email.value === id)
      if (
        user !== undefined &&
        doc !== undefined &&
        user.name !== name
        ) {
        user.name = name
        await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
        return {
          status: 200,
          message: "ROLES_STORED",
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "STORE_EMAIL_FAILED",
    }
  }

  static async storePassword({ id, password }) {
    try {
      const {doc, user} = await this.find(it => it.email.value === id)
      if (
        user !== undefined &&
        doc !== undefined &&
        user.password !== password
        ) {
        user.password = password
        await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
        return {
          status: 200,
          message: "ROLES_STORED",
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "STORE_EMAIL_FAILED",
    }
  }

  static async storeRoles({ id, roles }) {
    try {
      const {doc, user} = await this.find(it => it.email.value === id)
      if (
        user !== undefined &&
        doc !== undefined &&
        !Helper.isEqual(user.roles, roles) &&
        roles.length > 0
        ) {
        user.roles = roles
        await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
        return {
          status: 200,
          message: "ROLES_STORED",
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "STORE_EMAIL_FAILED",
    }
  }

  static withValidEmail(user) {
    const {email} = user
    const {value, verified} = email
    if (
      typeof email === "object" &&
      typeof value === "string" &&
      value !== "" &&
      value !== null &&
      value !== undefined &&
      typeof verified === "boolean"
    ) {
      return true
    }
    return false
  }

  static async storeEmail(email) {
    try {
      const {doc} = await Storage.get("getyour", "users")
      if (doc !== undefined) {
        const {array} = await this.filter(it => it.email.value === email)
        if (array === undefined) {
          const newUser = {
            email: {
              value: email,
              verified: true,
            }
          }
          if (this.withValidEmail(newUser)) {
            doc.users.push(newUser)
            await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return {
              status: 200,
              message: "EMAIL_STORED",
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "STORE_EMAIL_FAILED",
    }
  }

  // deconstruct this function
  static isValid(user) {
    const {email} = user
    const {value, verified} = email
    if (
      typeof email === "object" &&
      typeof value === "string" &&
      value !== "" &&
      value !== null &&
      value !== undefined &&
      typeof verified === "boolean"
    ) {
      return {
        status: 200,
        message: "USER_VALID",
      }
    }
    return {
      status: 500,
      message: "USER_NOT_VALID",
    }


    const {credentialRecord} = user
    if (typeof credentialRecord !== "object") return { status: 500, message: "CREDENTIAL_RECORD_NOT_VALID", }

    // if (typeof value !== "string" || value === "") return { status: 500, message: "EMAIL_VALUE_NOT_VALID", }
    // if (value === "") return { status: 500, message: "EMAIL_VALUE_IS_EMPTY", }

    // const {verified} = email
    // if (typeof verified !== "boolean") return { status: 500, message: "EMAIL_VERIFIED_NOT_VALID", }

    const {userHandle} = credentialRecord
    if (!Array.isArray(userHandle)) return { status: 500, message: "MISSING_USER_HANDLE_CREDENTIAL_RECORD", }

    const {type} = credentialRecord
    if (type === undefined) return { status: 500, message: "MISSING_TYPE_IN_CREDENTIAL_RECORD", }

    const {id} = credentialRecord
    if (!Array.isArray(id)) return { status: 500, message: "MISSING_ID_IN_CREDENTIAL_RECORD", }
    const {publicKey} = credentialRecord
    if (!Array.isArray(publicKey)) return { status: 500, message: "MISSING_PUBLICKEY_IN_CREDENTIAL_RECORD", }

    const {signCount} = credentialRecord
    if (signCount === undefined) return { status: 500, message: "MISSING_SIGN_COUNT_IN_CREDENTIAL_RECORD", }
    if (typeof signCount !== "number") return { status: 500, message: "EMAIL_VERIFIED_NOT_A_BOOLEAN", }

    const {transports} = credentialRecord
    if (!Array.isArray(transports)) return { status: 500, message: "MISSING_TRANSPORTS_IN_CREDENTIAL_RECORD", }

    const {backupEligible} = credentialRecord
    if (backupEligible === undefined) return { status: 500, message: "MISSING_BACKUP_ELIGIBLE_FLAG_IN_CREDENTIAL_RECORD", }

    const {backupState} = credentialRecord
    if (backupState === undefined) return { status: 500, message: "MISSING_BACKUP_STATUS_IN_CREDENTIAL_RECORD", }
    if (typeof backupState !== "boolean") return { status: 500, message: "EMAIL_VERIFIED_NOT_A_BOOLEAN", }

    const {attestationObject} = credentialRecord
    if (!Array.isArray(attestationObject)) return { status: 500, message: "MISSING_ATTESTATION_OBJECT_IN_CREDENTIAL_RECORD", }

    const {attestationClientDataJSON} = credentialRecord
    if (!Array.isArray(attestationClientDataJSON)) return { status: 500, message: "MISSING_ATTESTATION_CLIENT_DATA_IN_CREDENTIAL_RECORD", }

    return {
      status: 200,
      message: "VALID_USER",
      value: true,
    }
  }
}
