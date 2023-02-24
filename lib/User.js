// const { db } = require('../../config/CouchDB.js')
// const { Helper } = require('../Helper.js')
// const { UserRole } = require('./UserRole.js')

module.exports.User = class {

  // static async registerFunnel(req, res, next) {
  //   try {
  //     if (req.user === undefined) return res.sendStatus(404)
  //     const {doc, user} = await Helper.find(user => user.id === req.user.id)
  //     if (doc === undefined) return res.sendStatus(404)
  //     if (user === undefined) return res.sendStatus(404)
  //     if (Helper.objectIsEmpty(req.body.shsFunnel)) return res.sendStatus(404)
  //     user.shsFunnel = req.body.shsFunnel
  //     user.modified = Date.now()
  //     await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //     return res.send({status: 200, statusText: "REGISTER_FUNNEL_SUCCEED"})
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   next()
  // }

  // static async registerOffer(req, res, next) {
  //   try {
  //     if (req.user === undefined) return res.sendStatus(404)
  //     const {doc, user} = await Helper.find(user => user.id === req.user.id)
  //     if (doc === undefined) return res.sendStatus(404)
  //     if (user === undefined) return res.sendStatus(404)
  //     if (Helper.objectIsEmpty(req.body.offers)) return res.sendStatus(404)
  //     user.offers = req.body.offers
  //     user.modified = Date.now()
  //     await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //     return res.send({status: 200, statusText: "REGISTER_OFFERS_SUCCEED"})
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   next()
  // }

  // static async registerChecklist(req, res, next) {
  //   try {
  //     if (req.user === undefined) return res.sendStatus(404)
  //     const {doc, user} = await Helper.find(user => user.id === req.user.id)
  //     if (doc === undefined) return res.sendStatus(404)
  //     if (user === undefined) return res.sendStatus(404)
  //     if (Helper.objectIsEmpty(req.body.checklist)) return res.sendStatus(404)
  //     user.checklist = req.body.checklist
  //     user.modified = Date.now()
  //     await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //     return res.send({status: 200, statusText: "REGISTER_CHECKLIST_SUCCEED"})
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   next()
  // }

  // static async registerOperator(req, res, next) {
  //   try {
  //     if (req.body === undefined) return res.sendStatus(404)
  //     const {doc, user} = await Helper.find(it => it.id === req.body.localStorageId)
  //     if (doc === undefined) return res.sendStatus(404)
  //     if (user === undefined) return res.sendStatus(404)
  //     const foundRole = user.roles.find(role => role === UserRole.OPERATOR)
  //     if (foundRole === undefined) user.roles.push(UserRole.OPERATOR)
  //     user.modified = Date.now()
  //     await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //     return res.send({status: 200, statusText: "STORE_OPERATOR_SUCCEED"})
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   next()
  // }

  // static async unverify({localStorageId}) {
  //   try {
  //     const {doc, user} = await Helper.find(it => it.id === localStorageId)
  //     if (
  //       user !== undefined &&
  //       doc !== undefined &&
  //       user.verified !== undefined
  //       ) {
  //       user.verified = false
  //       await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //       return {
  //         status: 200,
  //         message: "USER_VERIFY_SUCCEED",
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return {
  //     status: 500,
  //     message: "USER_VERIFY_FAILED",
  //   }
  // }

  // static async verify(req, res, next) {
  //   try {
  //     if (req.body === undefined) return res.sendStatus(404)
  //     const {doc, user} = await Helper.find(it => it.id === req.body.localStorageId)
  //     if (doc === undefined) return res.sendStatus(404)
  //     if (user === undefined) return res.sendStatus(404)
  //     user.verified = true
  //     await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //     return res.send({status: 200, statusText: "USER_VERIFIED"})
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   next()
  // }

  // static async filter(predicate) {
  //   try {
  //     const array = []
  //     const { doc } = await Storage.get("getyour", "users")
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
  //     const { doc } = await Storage.get("getyour", "users")
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

  // static async registerSession({id, pin, salt, jwt}) {
  //   try {
  //     // if (!Helper.objectIsEmpty(data)) {
  //       // const {id, pin, salt, jwt} = data
  //       if (!Helper.stringIsEmpty(id)) {
  //         const {doc, user} = await this.find(it => it.id === id)
  //         if (
  //           !Helper.objectIsEmpty(doc) ||
  //           !Helper.objectIsEmpty(user) ||
  //           !Helper.stringIsEmpty(pin) ||
  //           !Helper.stringIsEmpty(salt) ||
  //           !Helper.stringIsEmpty(jwt)
  //           ) {
  //           if (user.session === undefined) {
  //             user.session = {
  //               pin,
  //               salt,
  //               jwt,
  //               counter: 1,
  //             }
  //           } else {
  //             user.session = {
  //               pin,
  //               salt,
  //               jwt,
  //               counter: user.session.counter + 1,
  //             }
  //           }
  //           await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //           return {
  //             status: 200,
  //             message: "STORE_SESSION_SUCCEED",
  //           }
  //         }
  //       }
  //     // }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return {
  //     status: 500,
  //     message: "STORE_SESSION_FAILED",
  //   }
  // }

  // static isEmpty(user) {
  //   const {id, email, verified, created_at} = user
  //   if (
  //     Helper.stringIsEmpty(id) ||
  //     Helper.stringIsEmpty(email) ||
  //     Helper.booleanIsEmpty(verified) ||
  //     Helper.numberIsEmpty(created_at)
  //   ) {
  //     return true
  //   }
  //   return false
  // }

  // static async registerEmail(req, res, next) {
  //   try {
  //     if (req.body === undefined) return res.sendStatus(404)
  //     const {doc, user} = await Helper.find(it => it.id === req.body.localStorageId)
  //     if (doc === undefined) return res.sendStatus(404)
  //     if (user === undefined) return res.sendStatus(404)
  //     if (user !== undefined) return res.send({status: 200, statusText: "USER_EXIST"})
  //     if (user === undefined) {
  //       const newUser = {
  //         id: Helper.digest(JSON.stringify({email: req.body.email, verified: true})),
  //         email: req.body.email,
  //         verified: false,
  //         roles: [],
  //         created_at: Date.now(),
  //       }
  //       if (this.isEmpty(newUser)) return res.sendStatus(404)
  //       doc.users.push(newUser)
  //       await db.insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //       return res.send({status: 200, statusText: "NEW_USER"})
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   next()
  // }

  // deconstruct this function
  // static isValid(user) {
  //   const {email, id, roles} = user
  //   const {value, verified} = email
  //   if (
  //     typeof id === "string" &&
  //     id !== "" &&
  //     id !== null &&
  //     id !== undefined &&
  //     typeof email === "object" &&
  //     email !== "" &&
  //     email !== null &&
  //     email !== undefined &&
  //     typeof value === "string" &&
  //     value !== "" &&
  //     value !== null &&
  //     value !== undefined &&
  //     typeof verified === "boolean" &&
  //     verified !== "" &&
  //     verified !== null &&
  //     verified !== undefined &&
  //     typeof roles === "object" &&
  //     roles !== "" &&
  //     roles !== null &&
  //     roles !== undefined
  //   ) {
  //     return {
  //       status: 200,
  //       message: "USER_IS_VALID",
  //     }
  //   }
  //   return {
  //     status: 500,
  //     message: "USER_IS_NOT_VALID",
  //   }


  //   const {credentialRecord} = user
  //   if (typeof credentialRecord !== "object") return { status: 500, message: "CREDENTIAL_RECORD_NOT_VALID", }

  //   // if (typeof value !== "string" || value === "") return { status: 500, message: "EMAIL_VALUE_NOT_VALID", }
  //   // if (value === "") return { status: 500, message: "EMAIL_VALUE_IS_EMPTY", }

  //   // const {verified} = email
  //   // if (typeof verified !== "boolean") return { status: 500, message: "EMAIL_VERIFIED_NOT_VALID", }

  //   const {userHandle} = credentialRecord
  //   if (!Array.isArray(userHandle)) return { status: 500, message: "MISSING_USER_HANDLE_CREDENTIAL_RECORD", }

  //   const {type} = credentialRecord
  //   if (type === undefined) return { status: 500, message: "MISSING_TYPE_IN_CREDENTIAL_RECORD", }

  //   // const {id} = credentialRecord
  //   if (!Array.isArray(id)) return { status: 500, message: "MISSING_ID_IN_CREDENTIAL_RECORD", }
  //   const {publicKey} = credentialRecord
  //   if (!Array.isArray(publicKey)) return { status: 500, message: "MISSING_PUBLICKEY_IN_CREDENTIAL_RECORD", }

  //   const {signCount} = credentialRecord
  //   if (signCount === undefined) return { status: 500, message: "MISSING_SIGN_COUNT_IN_CREDENTIAL_RECORD", }
  //   if (typeof signCount !== "number") return { status: 500, message: "EMAIL_VERIFIED_NOT_A_BOOLEAN", }

  //   const {transports} = credentialRecord
  //   if (!Array.isArray(transports)) return { status: 500, message: "MISSING_TRANSPORTS_IN_CREDENTIAL_RECORD", }

  //   const {backupEligible} = credentialRecord
  //   if (backupEligible === undefined) return { status: 500, message: "MISSING_BACKUP_ELIGIBLE_FLAG_IN_CREDENTIAL_RECORD", }

  //   const {backupState} = credentialRecord
  //   if (backupState === undefined) return { status: 500, message: "MISSING_BACKUP_STATUS_IN_CREDENTIAL_RECORD", }
  //   if (typeof backupState !== "boolean") return { status: 500, message: "EMAIL_VERIFIED_NOT_A_BOOLEAN", }

  //   const {attestationObject} = credentialRecord
  //   if (!Array.isArray(attestationObject)) return { status: 500, message: "MISSING_ATTESTATION_OBJECT_IN_CREDENTIAL_RECORD", }

  //   const {attestationClientDataJSON} = credentialRecord
  //   if (!Array.isArray(attestationClientDataJSON)) return { status: 500, message: "MISSING_ATTESTATION_CLIENT_DATA_IN_CREDENTIAL_RECORD", }

  //   return {
  //     status: 200,
  //     message: "VALID_USER",
  //     value: true,
  //   }
  // }
}
