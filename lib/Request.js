const { User } = require("./domain/User.js")
const { Helper } = require("./Helper.js")
const jwt = require('jsonwebtoken')

const errorPage = Helper.readFileSyncToString("../client/user/error/index.html")
module.exports.Request = class {

  static async requireUrlId(req, res, next) {
    const {urlId} = req.body
    if (Helper.stringIsEmpty(urlId)) return res.sendStatus(404)
    if (urlId !== req.user.id) return res.sendStatus(404)
    const {user} = await User.find(it => it.id === req.user.id)
    if (urlId !== user.id) return res.sendStatus(404)
    next()
  }

  static requireRoles(roles) {
    return async(req, res, next) => {
      const foundUserById = await (await User.find(it => it.id === req.user.id)).user
      // console.log(foundUserById);
      // check if localStorageId has authorization from owner (db entry in owner - authorized ids list)
      if (foundUserById === undefined) return res.sendStatus(404)
      const foundVerifiedUserById = await (await User.find(it => it.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
      if (foundVerifiedUserById === undefined) return res.sendStatus(404)
      if (req.user.id !== foundUserById.id) return res.sendStatus(404)
      if (req.user.id !== foundVerifiedUserById.id) return res.sendStatus(404)
      if (!Helper.isEqual(req.user.roles, foundVerifiedUserById.roles)) return res.sendStatus(404)
      if (roles === undefined) return res.sendStatus(404)
      if (req.user.roles.length <= 0) return res.sendStatus(404)
      roles.forEach(role => {
        const found = req.user.roles.find(it => it === role)
        if (found === undefined) return res.sendStatus(404)
      })
      next()
    }
  }

  static async requireSession(req, res, next) {
    if (req.cookies === undefined) return res.sendStatus(404)
    // console.log(req.cookies);
    const {sessionToken, jwtToken} = req.cookies
    if (jwtToken === undefined) return res.sendStatus(404)
    if (sessionToken === undefined) return res.sendStatus(404)
    const jwtDigest = Helper.digest(jwtToken)
    const foundUserByJwtToken = await (await User.find(it => it.session.jwt === jwtDigest)).user
    // console.log(foundUserByJwtToken);
    if (foundUserByJwtToken === undefined) return res.sendStatus(404)
    const id = Helper.digest(JSON.stringify({email: foundUserByJwtToken.email, verified: foundUserByJwtToken.verified}))
    // console.log(id);

    const foundUserById = await (await User.find(it => it.id === id)).user
    // console.log(foundUserById);
    if (foundUserById === undefined) return res.sendStatus(404)
    const sessionTokenDigest = Helper.digest(JSON.stringify({
      id,
      pin: foundUserById.session.pin,
      salt: foundUserById.session.salt,
      jwt: foundUserById.session.jwt,
    }))
    if (sessionTokenDigest !== sessionToken) return res.sendStatus(404)
    jwt.verify(jwtToken, process.env.JWT_SECRET, (error, jwt) => {
      // console.log(error);
      if (error) return res.sendStatus(404)
      if (jwt.id !== foundUserById.id) return res.sendStatus(404)
      // console.log(jwt);
      req.user = jwt
    })
    // console.log(req.user);
    next()
  }

  static async requireId(req, res, next) {
    // console.log(req.body)
    if (req.body === undefined) return res.sendStatus(404)
    const {localStorageId} = req.body

    // if (urlId !== undefined) {
    //   if (urlId !== localStorageId) return res.sendStatus(404)
    // }
    if (localStorageId === undefined) return res.sendStatus(404)
    const foundUserById = await (await User.find(it => it.id === localStorageId)).user
    // console.log(foundUserById)
    // check if localStorageId has authorization from owner (db entry in owner - authorized ids list)
    if (foundUserById === undefined) return res.sendStatus(404)
    const foundVerifiedUserById = await (await User.find(it => it.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
    // console.log(foundVerifiedUserById)
    if (foundVerifiedUserById === undefined) return res.sendStatus(404)

    if (localStorageId !== foundUserById.id) return res.sendStatus(404)
    if (localStorageId !== foundVerifiedUserById.id) return res.sendStatus(404)
    // console.log(req.body);
    next()
  }

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
