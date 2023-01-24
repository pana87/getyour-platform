const express = require('express')
const cors = require("cors")
const AuthServer = require('../lib/AuthServer.js')
const Notification = require('../lib/Notification.js')
const base64url = require('base64url')
const app = express()
const crypto = require("node:crypto")
const StringDecoder = require("node:string_decoder")
const { User } = require('../lib/domain/User.js')
const { JWTToken } = require('../lib/JWTToken.js')
const { authLocation, clientLocation } = require('../config/ServerLocation.js')
const { Helper } = require('../lib/Helper.js')
const { Request } = require('../lib/Request.js')
const cookieParser = require('cookie-parser')
const { has } = require('lodash')
// huge security bug
const userChallenge = Array.from(Uint8Array.from(crypto.randomBytes(32)))
const userHandle = Array.from(Uint8Array.from(crypto.randomBytes(16)))
const pubKeyCredParams = [
  { type: "public-key", alg: -7 },
  { type: "public-key", alg: -257 }
]
const sessionLength = 1 * 60000

app.use(express.json())
// app.use(cors())
app.use(cors({
  origin: `${clientLocation.origin}`,
  credentials: true,
}))
app.use(cookieParser())

app.post("/request/session/token/", Request.verifyId, async (req, res) => {
  try {
    const {id} = req.body
    const {user} = await User.find(it => it.id === id)
    const salt = Helper.generateRandomBytes(32)
    const jwtToken = JWTToken.sign({
      roles: user.roles,
      id: id,
    }).jwtToken
    const saltDigest = Helper.digest(JSON.stringify(salt))
    const jwtTokenDigest = Helper.digest(jwtToken)
    const sessionToken = Helper.digest(JSON.stringify({
      id,
      pin: userPin,
      salt: saltDigest,
      jwt: jwtTokenDigest,
    }))

    if (
      !Helper.stringIsEmpty(id) &&
      !Helper.objectIsEmpty(user) &&
      !Helper.arrayIsEmpty(salt) &&
      !Helper.stringIsEmpty(jwtToken) &&
      !Helper.stringIsEmpty(saltDigest) &&
      !Helper.stringIsEmpty(jwtTokenDigest) &&
      !Helper.stringIsEmpty(sessionToken)
      ) {
      const storeSessionRx = await User.storeSession({
        id,
        session: {
          pin: userPin,
          salt: saltDigest,
          jwt: jwtTokenDigest,
        }
      })
      if (storeSessionRx.status === 200) {
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

        return res.send({
          status: 200,
          message: "SESSION_TOKEN_REQUEST_SUCCEED",
        })
      }
    }
  } catch (error) {
    console.error(error)
  }
  return res.send({
    status: 500,
    message: "SESSION_TOKEN_REQUEST_FAILED",
  })
})

app.post("/request/store/id/", async (req, res) => {
  const {id} = req.body
  if (id !== undefined) {
    const {user} = await User.find((user) => user.id === Helper.digest(JSON.stringify({email: id, verified: user.verified})))
    if (user === undefined) {
      const {userId} = await User.storeId(id)
      if (userId !== undefined) {
        return res.send({
          status: 200,
          message: "ID_FROM_NEW_USER",
          id: userId,
        })
      }
      return res.send({
        status: 500,
        message: "USER_IS_NOT_VERIFIED",
      })
    }
    return res.send({
      status: 200,
      message: "ID_FROM_EXISTING_USER",
      id: user.id,
    })
  }
  return res.send({
    status: 500,
    message: "STORE_ID_REQUEST_FAILED",
  })
})

app.post("/request/verify/id/", async (req, res) => {
  const {id} = req.body
  if (id !== undefined) {
    const {user} = await User.find((user) => user.id === Helper.digest(JSON.stringify({email: id, verified: user.verified})))
    if (user !== undefined) {
      if (user.verified === true) {
        return res.send({
          status: 200,
          message: "VERIFY_ID_REQUEST_SUCCEED",
          id: user.id,
        })
      }
    }
  }
  return res.send({
    status: 500,
    message: "VERIFY_ID_REQUEST_FAILED",
  })
})

app.post("/request/verify/pin/", async (req, res) => {
  const { id, pin } = req.body
  if (
    pin === userPin &&
    pin !== undefined &&
    userPin !== undefined &&
    id !== undefined
    ) {
    const verifyIdRx = await User.verify(id)
    if (verifyIdRx.status === 200) {
      return res.send({
        status: 200,
        message: "VERIFY_PIN_REQUEST_SUCCEED",
      })
    }
  }
  return res.send({
    status: 500,
    message: "VERIFY_PIN_REQUEST_FAILED",
  })
})

let userPin
app.post("/request/send/email/with/pin/", async (req, res) => {
  const { email } = req.body
  if (email !== undefined) {
    userPin = Helper.digest(crypto.randomBytes(32))
    setTimeout(() => userPin = undefined, sessionLength)
    const sendEmailRx = await Helper.sendEmailFromDroid({
      from: "<droid@get-your.de>",
      to: email,
      subject: "[getyour plattform] Aus Sicherheitsgründen, bestätige diesen PIN",
      html: /*html*/`<div>PIN: ${userPin}</div>`
    })

    if (sendEmailRx.status === 200) {
      return res.send({
        status: 200,
        message: "SEND_EMAIL_WITH_PIN_REQUEST_SUCCEED",
      })
    }
  }
  return res.send({
    status: 500,
    message: "SEND_EMAIL_WITH_PIN_REQUEST_FAILED",
  })
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

app.listen(authLocation.port, () => Notification.warn(`auth listening on ${authLocation.origin}`))
