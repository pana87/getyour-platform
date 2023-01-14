const { User } = require("./domain/User.js")
const { Helper } = require("./Helper.js")
const Storage = require("./Storage.js")
const jwt = require('jsonwebtoken')
const { clientLocation } = require('../config/ServerLocation.js')

const loginPath = `${clientLocation.origin}/plattform/zugang/`

module.exports.Request = class {

  static async verifyId(req, res, next) {
    req.loginPath = loginPath
    const {id} = req.body
    // check if id is owner
    if (id === undefined) return res.redirect(req.loginPath)
    const foundUserById = await (await User.find(it => it.id === id)).user
    // check if id has authorization from owner (db entry in owner - authorized ids list)
    if (foundUserById === undefined) return res.redirect(req.loginPath)
    const foundVerifiedUserById = await (await User.find(it => it.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
    if (foundVerifiedUserById === undefined) return res.redirect(req.loginPath)
    next()
  }

  static verifyRole(role) {
    return (req, res, next) => {
      const roleFound = req.user.roles.find(it => it === role)
      if (roleFound === undefined) return res.redirect(req.redirectPath)
      next()
    }
  }

  static async verifySession(req, res, next) {
    // req.redirectPath = "/plattform/zugang/"
    const {sessionToken, jwtToken} = req.cookies
    if (sessionToken === undefined || jwtToken === undefined) return res.redirect(req.redirectPath)
    const jwtDigest = Helper.digest(jwtToken)
    const foundUserByJwtToken = await (await User.find(it => it.jwt === jwtDigest)).user
    console.log(foundUserByJwtToken);
    // const {user} = await (await User.find(it => it.jwt === jwtDigest))
    if (foundUserByJwtToken === undefined) return res.redirect(req.redirectPath)
    const id = Helper.digest(JSON.stringify({email: foundUserByJwtToken.email, verified: foundUserByJwtToken.verified}))

    const foundUserById = await (await User.find(it => it.id === id)).user
    console.log(foundUserById);
    if (foundUserById === undefined) return res.redirect(req.redirectPath)

    // const id = Helper.digest(JSON.stringify(user.email)) // check this for bug
    const sessionTokenDigest = Helper.digest(JSON.stringify({
      id,
      pin: foundUserById.pin,
      salt: foundUserById.salt,
      jwt: foundUserById.jwt,
    }))
    if (sessionTokenDigest !== sessionToken) return res.redirect(req.redirectPath)
    jwt.verify(jwtToken, process.env.JWT_SECRET, (error, jwt) => {
      if (error) return res.redirect(req.redirectPath)
      if (jwt.id === foundUserById.id) return res.redirect(req.redirectPath)
      req.user = jwt
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
