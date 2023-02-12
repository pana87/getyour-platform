const express = require('express')
const cors = require("cors")
const AuthServer = require('../lib/AuthServer.js')
const app = express()
const crypto = require("node:crypto")
const { User } = require('../lib/domain/User.js')
const { JWTToken } = require('../lib/JWTToken.js')
const { authLocation, clientLocation } = require('../config/ServerLocation.js')
const { Helper } = require('../lib/Helper.js')
const { Request } = require('../lib/Request.js')
const cookieParser = require('cookie-parser')
const { UserRole } = require('../lib/domain/UserRole.js')
// huge security bug
const userChallenge = Array.from(Uint8Array.from(crypto.randomBytes(32)))
const userHandle = Array.from(Uint8Array.from(crypto.randomBytes(16)))
const pubKeyCredParams = [
  { type: "public-key", alg: -7 },
  { type: "public-key", alg: -257 }
]
const sessionLength = 120 * 60000

app.use(express.json())
app.use(cors({
  origin: `${clientLocation.origin}`,
  credentials: true,
}))
app.use(cookieParser())

// app.post("/request/verify/user/",
//   Request.requireBody,
//   Request.requireUrl,
//   Request.requireLocalStorageId,
//   Request.registerVerifiedUser,
//   async (req, res) => {
//     return res.sendStatus(404)
//   }
// )

app.post("/request/register/session/",
  // Request.requireBody,
  // Request.requireUrl,
  Request.requireLocalStorageId,
  Request.requireVerifiedUser,
  async (req, res) => {
    try {
      const {localStorageId, name} = req.body
      const {user} = await Helper.find(user => user.id === localStorageId)
      if (Helper.objectIsEmpty(user)) return res.sendStatus(404)
      const salt = Helper.generateRandomBytes(32)
      if (Helper.arrayIsEmpty(salt)) return res.sendStatus(404)

      if (name === "onlogin") {
        if (Helper.arrayIsEmpty(user.roles)) return res.send({redirectPath: "/user/entries/"})
      }

      if (Helper.stringIsEmpty(user.id)) return res.sendStatus(404)
      const jwtToken = JWTToken.sign({
        roles: user.roles,
        id: user.id,
      }).jwtToken
      if (Helper.stringIsEmpty(jwtToken)) return res.sendStatus(404)
      const saltDigest = Helper.digest(JSON.stringify(salt))
      if (Helper.stringIsEmpty(saltDigest)) return res.sendStatus(404)
      const jwtTokenDigest = Helper.digest(jwtToken)
      if (Helper.stringIsEmpty(jwtTokenDigest)) return res.sendStatus(404)
      const sessionToken = Helper.digest(JSON.stringify({
        id: user.id,
        pin: randomPin,
        salt: saltDigest,
        jwt: jwtTokenDigest,
      }))
      if (Helper.stringIsEmpty(sessionToken)) return res.sendStatus(404)
      req.session = {}
      req.session.id = user.id
      req.session.pin = randomPin
      req.session.salt = saltDigest
      req.session.jwt = jwtTokenDigest
      const storeSessionRx = await Request.registerSession(req)
      if (storeSessionRx.status !== 200) return res.sendStatus(404)
      res.cookie("jwtToken", jwtToken, {
        maxAge: sessionLength,
        httpOnly: true,
        sameSite: "lax",
      })
      res.cookie("sessionToken", sessionToken, {
        maxAge: sessionLength,
        httpOnly: true,
        sameSite: "lax",
      })
      return res.send({status: storeSessionRx.status, statusText: storeSessionRx.statusText})
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
  }
)

// app.post("/request/verify/id/", Request.requireBody, Request.requireLocalStorageId, User.verify, async (req, res) => {
//   return res.sendStatus(404)
// })
let randomPin
app.post("/request/verify/pin/",
// Request.requireBody,
// Request.requireUrl,
// Request.requireUserPin,
async (req, res) => {
  try {
    const {userPin} = req.body
    if (Helper.stringIsEmpty(userPin)) throw new Error("user pin is empty")

    Helper.verifyPin(userPin, randomPin)
    return res.sendStatus(200)
  } catch (error) {
    console.error(error)
  }
  return res.sendStatus(404)
})

app.post("/request/send/email/with/pin/",
// Request.requireBody,
// Request.requireUrl,
// Request.requireEmail,
async (req, res) => {
  try {
    const {email} = req.body
    if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
    randomPin = Helper.digest(crypto.randomBytes(32))
    setTimeout(() => randomPin = undefined, 2 * 60000)
    await Helper.sendEmailFromDroid({
      from: "<droid@get-your.de>",
      to: email,
      subject: "[getyour plattform] Aus Sicherheitsgründen, bestätige diesen PIN",
      html: /*html*/`<div>PIN: ${randomPin}</div>`
    })
    return res.sendStatus(200)
  } catch (error) {
    console.error(error)
  }
  return res.sendStatus(404)
})

app.post("/request/jwt/token/", async (req, res) => {
  const requestJwtTokenRx = JWTToken.sign(req.body)
  if (requestJwtTokenRx.status !== 200) {
    return res.send({
      status: 500,
      message: "JWT_SIGN_FAILED"
    })
  }

  return res.send({
    status: 200,
    message: "JWT_SIGN_SUCCESS",
    token: requestJwtTokenRx.token,
  })
})

app.post("/user/authentication/verification/", async (req, res) => {
  req.body.expectedUserChallenge = userChallenge
  const verifyAssertionRx = await AuthServer.verifyAssertion(req.body)
  if (verifyAssertionRx.status !== 200) {
    return res.send({
      status: 500,
      message: "VERIFY_ASSERTION_FAILED",
    })
  }
  console.log(verifyAssertionRx);

  return res.send({
    status: 200,
    message: "AUTHENTICATION_VERIFIED"
  })
})

app.post("/public-key/credential/request/options/", async (req, res) => {
  const {email} = req.body
  if (!email) {
    return res.send({
      status: 500,
      message: "INVALID_EMAIL"
    })
  }

  const getUserByEmailRx = await User.getByEmail(req.body)
  if (getUserByEmailRx.status === 404) {
    return res.send({
      status: 500,
      message: "USER_NOT_FOUND"
    })
  }

  // 1.) https://w3c.github.io/webauthn/#sctn-verifying-assertion
  const {credentialRecord} = getUserRx.user
  const options = {
    publicKey: {
      challenge: userChallenge,
      rpId: clientLocation.hostname,
      allowCredentials: [{
        id: credentialRecord.id,
        type: "public-key",
      }],
      userVerification: "required",
    }
  }

  return res.send({
    status: 200,
    message: "BEGIN_LOGIN_EVENT",
    publicKeyCredentialRequestOptions: options,
  })
})

app.post("/user/registration/verification/", async (req, res) => {
  req.body.userChallenge = userChallenge
  req.body.userHandle = userHandle
  req.body.pubKeyCredParams = pubKeyCredParams

  const verifyAttestationRx = await AuthServer.verifyAttestation(req.body)
  if (verifyAttestationRx.status !== 200) {
    return res.send({
      status: 500,
      message: "REGISTRATION_ABORTED_DUE_TO_SECURITY_ISSUES"
    })
  }

  return res.send({
    status: 200,
    message: "USER_REGISTRATION_VERIFICATION_SUCCESS"
  })
})

app.post("/public-key/credential/creation/options/", async (req, res) => {
  const {email} = req.body
  if (!email) {
    return res.send({
      status: 500,
      message: "NOT_A_USER"
    })
  }

  const getUserByEmailRx = await User.getByEmail(req.body)
  if (getUserByEmailRx.status === 404) {
    return res.send({
      status: 500,
      message: "USER_NOT_FOUND"
    })
  }

  // 1.) https://w3c.github.io/webauthn/#sctn-registering-a-new-credential
  const options = {
    publicKey: {
      rp: {
        name: "getyour platform",
        id: clientLocation.hostname,
      },
      user: {
        name: email.value.split("@")[0],
        id: userHandle,
        displayName: email.value.split("@")[0]
      },
      pubKeyCredParams: pubKeyCredParams,
      challenge: userChallenge,
    }
  }
  if (getUserByEmailRx.status === 404) {
    return res.send({
      status: 200,
      message: "BEGIN_REGISTRATION_EVENT",
      options: options
    })
  }

  return res.send({
    status: 302,
    message: "ALREADY_REGISTERED",
  })
})

app.listen(authLocation.port, () => console.log(`[getyour] auth listening on ${authLocation.origin}`))
