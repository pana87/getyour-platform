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


app.get("/get-cookies/", (req, res) => {
  res.send(req.cookies)
})

app.get("/set-cookies/", (req, res) => {
  res.cookie("jwtToken", "jwtToken", {
    maxAge: 1000 * 60, // 1 min
    httpOnly: true // http only, prevents JavaScript cookie access
  })
  res.send("ok")
})

let salt
let jwtToken
app.post("/request/session/token/", async (req, res) => {
  try {
    const {email, digest} = req.body
    const {user} = await User.find(it => it.email.value === email)
    const userDigest = user.digest
    const testDigest = Helper.digest(JSON.stringify({
      email: user.email.value,
    }))
    const userId = Helper.digest(JSON.stringify({
      userEmail: user.email,
      userRoles: user.roles,
    }))
    jwtToken = JWTToken.sign({
      roles: user.roles,
      id: userId,
    }).jwtToken
    salt = Helper.generateRandomBytes(32)
    // digest all and save it in credential record
    const sessionToken = Helper.digest(JSON.stringify({
      salt,
      userPin,
      digest,
      jwtToken,
    }))

    if (
      email !== undefined &&
      digest !== undefined &&
      digest === userDigest &&
      digest === testDigest &&
      userDigest === testDigest &&
      salt !== undefined &&
      jwtToken !== undefined &&
      sessionToken !== undefined
      ) {
      // Request.sessionTimeout(email, 30)
      // res.setHeader("Set-Cookie", `jwtToken=${jwtToken}`)
      // console.log("hi");
      res.cookie("jwtToken", jwtToken, {
        maxAge: sessionLength, // 1 min
        httpOnly: true // http only, prevents JavaScript cookie access
      })
      // console.log(response);
      return res.send({
        status: 200,
        message: "SESSION_TOKEN_REQUEST_SUCCEED",
        // sessionToken,
        // jwtToken,
      })
    }
  } catch (error) {
    console.error(error)
  }
  return res.send({
    status: 500,
    message: "SESSION_TOKEN_REQUEST_FAILED",
  })
})

app.post("/request/verify/pin/", async (req, res) => {
  const { pin } = req.body
  if (pin === userPin && pin !== undefined) {
    return res.send({
      status: 200,
      message: "VERIFY_PIN_REQUEST_SUCCEED",
    })
  }
  return res.send({
    status: 500,
    message: "VERIFY_PIN_REQUEST_FAILED",
  })
})

let userPin
app.post("/request/verify/email/", async (req, res) => {
  const { email } = req.body
  // console.log(email);
  if (email !== undefined) {
    userPin = Helper.generateRandomPin(4)

    const sendEmailRx = await Helper.sendEmailFromDroid({
      from: "<droid@get-your.de>",
      to: email,
      subject: "[getyour plattform] Aus Sicherheitsgründen bestätige bitte deine E-Mail Adresse",
      html: /*html*/`<div>PIN: ${userPin}</div>`
    })

    if (sendEmailRx.status === 200) {
      return res.send({
        status: 200,
        message: "VERIFY_EMAIL_REQUEST_SUCCEED",
      })
    }
  }

  return res.send({
    status: 500,
    message: "VERIFY_EMAIL_REQUEST_FAILED",
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
