const { User } = require("./domain/User.js")
const { Helper } = require("./Helper.js")
const jwt = require('jsonwebtoken')

const errorPage = Helper.readFileSyncToString("../client/user/error/index.html")
module.exports.Request = class {


  static async verifyId(req, res, next) {
    if (req.body === undefined) return res.send(errorPage.replace("[user error] error", `[user error] REQUEST_BODY_IS_UNDEFINED`))
    const {id} = req.body
    // check if id is owner
    if (id === undefined) return res.send(errorPage.replace("[user error] error", `[user error] ID_IS_UNDEFINED`))
    const foundUserById = await (await User.find(it => it.id === id)).user
    // check if id has authorization from owner (db entry in owner - authorized ids list)
    if (foundUserById === undefined) return res.send(errorPage.replace("[user error] error", `[user error] USER_IS_UNDEFINED`))
    const foundVerifiedUserById = await (await User.find(it => it.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
    if (foundVerifiedUserById === undefined) return res.send(errorPage.replace("[user error] error", `[user error] USER_IS_NOT_VERIFIED`))
    if (id !== foundUserById.id) return res.send(errorPage.replace("[user error] error", `[user error] LOCALSTORAGE_ID_MISMATCH`))
    if (id !== foundVerifiedUserById.id) return res.send(errorPage.replace("[user error] error", `[user error] LOCALSTORAGE_ID_MISMATCH`))
    next()
  }

  static requireRole(role) {
    return (req, res, next) => {
      req.userError = undefined
      const roleFound = req.user.roles.find(it => it === role)
      if (roleFound === undefined) return res.send(errorPage.replace("[user error] error", `[user error] ROLE_IS_UNDEFINED`))
      next()
    }
  }

  static async verifySession(req, res, next) {
    if (req.cookies === undefined) return res.send(errorPage.replace("[user error] error", `[user error] COOKIES_ARE_UNDEFINED`))
    const {sessionToken, jwtToken} = req.cookies
    if (jwtToken === undefined) return res.send(errorPage.replace("[user error] error", `[user error] JWT_TOKEN_IS_UNDEFINED`))
    if (sessionToken === undefined) return res.send(errorPage.replace("[user error] error", `[user error] SESSION_TOKEN_IS_UNDEFINED`))
    const jwtDigest = Helper.digest(jwtToken)
    const foundUserByJwtToken = await (await User.find(it => it.session.jwt === jwtDigest)).user
    if (foundUserByJwtToken === undefined) return res.send(errorPage.replace("[user error] error", `[user error] USER_MISSING_JWT_TOKEN`))
    const id = Helper.digest(JSON.stringify({email: foundUserByJwtToken.email, verified: foundUserByJwtToken.verified}))
    const foundUserById = await (await User.find(it => it.id === id)).user
    if (foundUserById === undefined) return res.send(errorPage.replace("[user error] error", `[user error] USER_ID_MISMATCH`))
    const sessionTokenDigest = Helper.digest(JSON.stringify({
      id,
      pin: foundUserById.session.pin,
      salt: foundUserById.session.salt,
      jwt: foundUserById.session.jwt,
    }))
    if (sessionTokenDigest !== sessionToken) return res.send(errorPage.replace("[user error] error", `[user error] SESSION_TOKEN_MISMATCH`))
    jwt.verify(jwtToken, process.env.JWT_SECRET, (error, jwt) => {
      if (error) return res.send(errorPage.replace("[user error] error", `[user error] JWT_TOKEN_ERROR`))
      if (jwt.id !== foundUserById.id) return res.send(errorPage.replace("[user error] error", `[user error] JWT_USER_ID_MISMATCH`))
      req.user = jwt
    })
    next()
  }
}
