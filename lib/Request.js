const { User } = require("./domain/User.js")
const { Helper } = require("./Helper.js")
const Storage = require("./Storage.js")
const jwt = require('jsonwebtoken')

module.exports.Request = class {

  static verifyRole(role) {
    return (req, res, next) => {
      const roleFound = req.user.roles.find(it => it === role)
      if (roleFound === undefined) return res.redirect(req.redirectPath)
      next()
    }
  }

  static async verifySession(req, res, next) {
    req.redirectPath = "/plattform/zugang/"
    const {sessionToken, jwtToken} = req.cookies
    if (sessionToken === undefined || jwtToken === undefined) return res.redirect(req.redirectPath)
    const jwtDigest = Helper.digest(jwtToken)
    const {user} = await User.find(it => it.jwt === jwtDigest)
    if (user === undefined) return res.redirect(req.redirectPath)
    const id = Helper.digest(JSON.stringify(user.email))
    const sessionTokenDigest = Helper.digest(JSON.stringify({
      id,
      pin: user.pin,
      salt: user.salt,
      jwt: user.jwt,
    }))
    if (sessionTokenDigest !== sessionToken) return res.redirect(req.redirectPath)
    jwt.verify(jwtToken, process.env.JWT_SECRET, (error, user) => {
      if (error) return res.redirect(req.redirectPath)
      req.user = user
    })
    next()
  }

  static sessionTimeout(id, minutes) {
    try {
      setTimeout(async () => {
        const {doc, user} = await User.find(it => it.email.value === id)
        user.digest = undefined
        await Storage.insert("getyour", { _id: doc._id, _rev: doc._rev, users: doc.users })
        return {
          status: 200,
          message: "SESSION_TIMEOUT_REQUEST_SUCCEED",
        }
      }, minutes * 60000)
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "SESSION_TIMEOUT_REQUEST_FAILED",
    }
  }

}
