const jwt = require('jsonwebtoken')
const { Helper } = require('./Helper.js')

module.exports.JWTToken = class {
  static sign(options) {
    try {
      if (!Helper.objectIsEmpty(options)) {
        const jwtToken = jwt.sign(options, process.env.JWT_SECRET, { expiresIn: '2h' })
        if (!Helper.stringIsEmpty(jwtToken)) {
          return {
            status: 200,
            message: "SIGN_JWT_TOKEN_SUCCEED",
            jwtToken: jwtToken,
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "SIGN_JWT_TOKEN_FAILED",
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
