require('dotenv').config()
// const db = require("nano")(process.env.DB)
const { db } = require('../../config/CouchDB.js')
const { Helper } = require('../Helper.js')
// const Storage = require('../../config/Storage.js')
const Notification = require("../Notification.js")
const Storage = require('../Storage.js')
const UPDATE_FAILED = "UPDATE_FAILED"
const GET_ALL_USER_FAILED = "GET_ALL_USER_FAILED"
// const ERROR_DEFAULT_RETURN_OBJECT = { status: 500, message: "USER_NOT_VALID", }

/**
 * User Interactions
 */
module.exports.User = class {

  // static async update({
  //   email: {
  //     value,
  //     verified,
  //   },
  //   credentialRecord: {
  //     signCount,
  //     backupState,
  //   }
  // }) {
  //   const {users, doc} = await this.getAll()
  //   for (let i = 0; i < users.length; i++) {
  //     if (users[i].email.value === value) {
  //       users[i].email.verified = verified
  //       users[i].credentialRecord.signCount = signCount
  //       users[i].credentialRecord.backupState = backupState
  //       if (!this.isValid(users[i]).value) {
  //         return {
  //           status: 500,
  //           message: "USER_IS_NOT_VALID"
  //         }
  //       }
  //     }
  //   }
  //   try {
  //     await db.insert({ _id: doc._id, _rev: doc._rev, users })
  //   } catch (error) {
  //     Notification.error(UPDATE_FAILED)
  //     console.error(error);
  //     return {
  //       status: 500,
  //       message: "USER_UPDATE_ABORT"
  //     }
  //   }
  //   return {
  //     status: 200,
  //     message: "USER_UPDATE_SUCCESS"
  //   }
  // }

  static async find(predicate) {
    try {
      const { doc } = await Storage.get("getyour", "users")
      for (let i = 0; i < doc.users.length; i++) {
        if (
          typeof predicate(doc.users[i]) === "boolean" &&
          predicate(doc.users[i]) &&
          doc.users[i] !== undefined
        ) {
          return {
            status: 200,
            message: "USER_FOUND",
            user: doc.users[i],
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "USER_NOT_FOUND",
    }
  }

  // static find(predicate) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const { doc } = await Storage.get("getyour", "users")
  //       const user = doc.users.find(it => predicate(it))
  //       if (user !== undefined) {
  //         return resolve(user)
  //       }
  //     } catch (error) {
  //       return reject(error)
  //     }
  //   })
  // }



  static async update(id, callback) {
    try {
      const { doc } = await Storage.get("getyour", "users")
      const user = doc.users.find(it => it.email.value === id)
      if (user !== undefined) {
        callback(user)
        await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
        return {
          status: 200,
          message: "USER_UPDATED",
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "USER_UPDATE_FAILED",
    }
  }

  static async storeName({ id, name }) {
    try {
      const { doc } = await Storage.get("getyour", "users")

      const user = doc.users.find(it => it.email.value === id)
      if (user !== undefined) {
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

  // static async digest(user) {

  // }

  // replace filter with for loop for performance
  static async nameExists(name) {
    const { doc } = await Storage.get("getyour", "users")
    return doc.users.filter(it => it.name === name).length > 0
  }

  // replace filter with for loop for performance
  static async emailExists(email) {
    const { doc } = await Storage.get("getyour", "users")
    return doc.users.filter(it => it.email.value === email).length > 0
  }

  static async storeRoles({ id, roles }) {
    try {
      const { doc } = await Storage.get("getyour", "users")

      const user = doc.users.find(it => it.email.value === id)
      if (user !== undefined) {
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

  static isValid(user) {
    const {email} = user
    const {value, verified} = email
    if (
      typeof email === "object" &&
      typeof value === "string" &&
      value !== "" &&
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

  static async storeEmail({
    value,
    verified,
  }) {
    try {
      const { doc } = await Storage.get("getyour", "users")

      if (doc.users.filter(it => it.email.value === value).length === 0) {
        const user = {
          email: {
            value,
            verified,
          }
        }

        if (this.isValid(user).status === 200) {
          doc.users.push(user)
          await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
          return {
            status: 200,
            message: "EMAIL_STORED",
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

  static async store({
    email: {
      value,
      verified,
    },
    credentialRecord: {
      type,
      id,
      userHandle,
      publicKey,
      transports,
      signCount,
      backupEligible,
      backupState,
      attestationObject,
      attestationClientDataJSON,
    },
  }) {
    const {users, doc} = await this.getAll()
    const user = {
      email: {
        value: value,
        verified: verified
      },
      credentialRecord: {
        type: type,
        id: id,
        userHandle: userHandle,
        publicKey: publicKey,
        transports: transports,
        signCount: signCount,
        backupEligible: backupEligible,
        backupState: backupState,
        attestationObject: attestationObject,
        attestationClientDataJSON: attestationClientDataJSON,
      }
    }
    const isValidRx = this.isValid(user)
    if (isValidRx.status !== 200) {
      Notification.error(`NO_VALID_USER - Error: ${isValidRx.message}`)
      return {
        status: 500,
        message: "NO_VALID_USER",
      }
    }

    users.push(user)
    try {
      await db.insert({ _id: doc._id, _rev: doc._rev, users })
    } catch (error) {
      Notification.error(`USER_STORE_ABORT`)
      console.error(error);
      return {
        status: 500,
        message: "USER_STORE_ABORT",
      }
    }
    return {
      status: 200,
      message: "USER_STORE_SUCCESS",
    }
  }

  static async getByEmail({
    email: {
      value,
    }
  }) {
    const {users} = await this.getAll()
    for (let i = 0; i < users.length; i++) {
      if (users[i].email.value === value) {
        return {
          status: 200,
          message: "USER_FOUND",
          user: users[i],
        }
      }
    }
    return {
      status: 404,
      message: "USER_NOT_FOUND",
    }
  }

  static async getAll() {
    try {
      const doc = await db.get("users")
      return {
        status: 200,
        message: "GET_ALL_USER_SUCCESS",
        users: doc.users,
        doc: doc,
      }
    } catch (error) {
      // Notification.error(error)
      console.error(error)
      return {
        status: 500,
        message: "GET_ALL_USER_FAILED",
      }
    }
  }

  // static async update({
  //   email: {
  //     value,
  //     verified,
  //   },
  //   credentialRecord: {
  //     signCount,
  //     backupState,
  //   }
  // }) {
  //   const {users, doc} = await this.getAll()
  //   for (let i = 0; i < users.length; i++) {
  //     if (users[i].email.value === value) {
  //       users[i].email.verified = verified
  //       users[i].credentialRecord.signCount = signCount
  //       users[i].credentialRecord.backupState = backupState
  //       if (!this.isValid(users[i]).value) {
  //         return {
  //           status: 500,
  //           message: "USER_IS_NOT_VALID"
  //         }
  //       }
  //     }
  //   }
  //   try {
  //     await db.insert({ _id: doc._id, _rev: doc._rev, users })
  //   } catch (error) {
  //     Notification.error(UPDATE_FAILED)
  //     console.error(error);
  //     return {
  //       status: 500,
  //       message: "USER_UPDATE_ABORT"
  //     }
  //   }
  //   return {
  //     status: 200,
  //     message: "USER_UPDATE_SUCCESS"
  //   }
  // }

}
