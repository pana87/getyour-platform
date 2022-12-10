// OPEN PLATFORM Level 5 (JWT)

const jwt = require('jsonwebtoken')
const Notification = require("./Notification.js")

module.exports.JWTToken = class {
  static sign(user) {
    const {id, roles} = user
    let token
    try {
      token = jwt.sign({ id: id, roles: roles }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (error) {
      Notification.error("JWT_SIGN_ABORT")
      console.error(error)
      return {
        status: 500,
        message: "JWT_SIGN_ABORT",
      }
    }
    if (token === undefined) {
      Notification.error("JWT_TOKEN_UNDEFINED")
      console.error(error)
      return {
        status: 500,
        message: "JWT_TOKEN_UNDEFINED",
      }
    }

    return {
      status: 200,
      message: "JWT_SIGN_SUCCESS",
      token: token,
    }
  }

  static verify(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.send({ status: 401, body: "Unauthorized" })

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      console.log(user)
      console.log(err)

      if (err) return res.send({ status: 403, body: "Forbidden" })

      req.body.userInfo = user
      next()
    })
  }
}
