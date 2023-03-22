const express = require('express')
const cookieParser = require('cookie-parser')
const { clientLocation, docsLocation } = require('../config/ServerLocation.js')
const { Helper } = require('../lib/Helper.js')
const { User } = require('../lib/User.js')
const { Request } = require('../lib/Request.js')
const { UserRole } = require('../lib/UserRole.js')
const crypto = require("node:crypto")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)


Helper.configureClientStorage()


const app = express()
app.use(cookieParser())
app.use(express.json({limit: "50mb"}))
app.use(Helper.removeCookies)


// static first
app.use("/docs/", express.static(docsLocation.absolutePath))
app.use(express.static(clientLocation.absolutePath))






app.get("/cookies/entfernen/", (req, res) => {
  Object.keys(req.cookies).forEach((cookieName) => {
    res.clearCookie(cookieName)
  })
  return res.sendStatus(200)
})

app.get("/felix/shs/:type/:name/", async(req, res, next) => {
  try {
    if (req.params.type === "compliance") {
      if (req.params.name === "impressum") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
    }

    // if (req.params.username === "impressum") return res.send(Helper.readFileSyncToString("./../lib/value-units/getyourindex.html"))
    // if (req.params.username === "datenschutz") return res.send(Helper.readFileSyncToString("./../client/datenschutz/index.html"))
    // if (req.params.username === "nutzervereinbarung") return res.send(Helper.readFileSyncToString("./../client/nutzervereinbarung/index.html"))

    // if (req.params.type === "checklist") {
    //   // if (req.params.id === "")
    // }
    // console.log(req.params.type);
    // console.log(req.params.name);
    if (req.params.type === "match-maker") {
      // console.log("hi");
      // if (req.params.name === "experte-kontaktieren") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
      if (req.params.name === "hersteller-vergleich") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))

    }
    if (req.params.type === "funnel") {
      if (req.params.name === "qualifizierung") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
      if (req.params.name === "abfrage-haus") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
      if (req.params.name === "abfrage-heizung") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
      if (req.params.name === "abfrage-strom") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
      if (req.params.name === "abfrage-technisches") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
      if (req.params.name === "abfrage-persoenliches") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
    }
  } catch (error) {
    Helper.logError(error, req)
  }
  // return res.redirect("/felix/shs/")
  return next()
})

app.get("/felix/shs/checklist/:urlId/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
  Request.verifyId,
async(req, res) => {
  // send value unit by valid urlId verifyUrlId(req.params.urlId)
  // console.log(req.params.itemIndex);
  return res.send(Helper.readFileSyncToString("../lib/value-units/shs-checklist.html"))
  // return res.send(Helper.readFileSyncToString("../lib/value-units/checklist.html"))
  // return res.send(Helper.readFileSyncToString("../client/felix/shs/checkliste/index.html"))
})

app.get("/felix/shs/checklist/:urlId/print/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
  Request.verifyId,
  (req, res) => {
    return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-drucken.html"))
    // return res.send(Helper.readFileSyncToString("../client/felix/shs/checkliste/1/print.html"))
  }
)

app.get("/felix/shs/checklist/:urlId/sign/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
  Request.verifyId,
  (req, res) => {
  // console.log("hi");
  // const html = Helper.readFileSyncToString("../client/user/platform/funnel/sign/index.html")
  // if (html !== undefined) return res.send(html)
  // return res.sendStatus(404)
  return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-digital-unterschreiben.html"))
})



app.get("/felix/shs/checklist/:urlId/:itemIndex/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
  Request.verifyId,
async(req, res) => {
  // for (let i = 0; i < array.length; i++) {
  //   const element = array[i];

  // }
  // console.log(req.params.itemIndex);
  // console.log("hi");
  // console.log(typeof req.params.itemIndex);
  if (req.params.itemIndex === "0") {
    return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-ansicht.html"))
  }
  if (req.params.itemIndex === "1") {
    return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-hochladen.html"))
  }
  // return res.send(Helper.readFileSyncToString("../client/felix/shs/checkliste/1/index.html"))
  // return next()
  // return res.sendStatus(404)
})

// app.get("/felix/shs/:valueUnit/:name/", async(req, res, next) => {
//   return res.send("hi")
//   // try {
//   //   if (req.params.valueUnit === "funnel") {
//   //     if (req.params.name === "qualifizierung") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   //     if (req.params.name === "abfrage-haus") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   //     if (req.params.name === "abfrage-heizung") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   //     if (req.params.name === "abfrage-strom") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   //     if (req.params.name === "abfrage-technisches") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   //     if (req.params.name === "abfrage-persoenliches") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   //   }
//   // } catch (error) {
//   //   Helper.logError(error, req)
//   // }
//   // // return res.redirect("/felix/shs/")
//   // return next()
// })

app.get("/pana/getyour/entwickler-registrieren/",
// if value.security = closed
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.PLATFORM_DEVELOPER]),
  Request.verifyId,
async(req, res) => {
  return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-entwickler-registrieren.html"))
})


app.get("/pana/getyour/zugang/", async(req, res) => {
  // if value.security = open
  return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-plattform-zugang.html"))
})


// app.get("/felix/shs/hersteller/", async(req, res) => {
//   // user/platform/app/
//   // die app heißt hersteller-matching
//   return res.send(Helper.readFileSyncToString("../lib/value-units/offer-list.html"))
//   // return res.send(Helper.readFileSyncToString("../client/felix/shs/hersteller/index.html"))
// })




// app.get("/user/register/platform-developer/", Request.requireSessionToken, (req, res) => {
//   res.send(Helper.readFileSyncToString("../client/user/register/platform-developer/index.html"))
// })

// because express root is not serving any css or js files
app.get("/", (req, res) => res.redirect("/home/"))

// app.get("/user/platform/funnel/sign/", (req, res) => {
//   console.log("hi");
//   const html = Helper.readFileSyncToString("../client/user/platform/funnel/sign/index.html")
//   if (html !== undefined) return res.send(html)
//   return res.sendStatus(404)
// })

// app.get("/user/entries/", (req, res) => {
//   // if (req.userError !== undefined) return res.redirect("/home/")
//   return res.send(Helper.readFileSyncToString("../client/user/entries/index.html"))
// })

app.get("/cookies/anzeigen/", async (req, res) => {
  return res.send(req.cookies)
})


app.post("/producer/v1/",

  // security level closed
  Request.requireJwtToken,
  Request.verifySession,
  Request.verifyId,


  // interactions
  Request.verifyName,
  Request.registerName,

async(req, res) => {
  return res.sendStatus(404)
})



app.post("/consumer/v1/",
  // session
  // Request.requireCookies,


  // security level open



  // security level closed
  Request.requireJwtToken,
  Request.verifySession,


  Request.registerEmail,
  Request.registerVerified,


  // open closed
  Request.verifyId,

  // options
  // Request.requireBody,
  // Request.requireUrl,
  // Request.requireMethod,
  // Request.requireSecurity,
  // Request.requireType,
  // Request.requireName,

  Request.redirectUser,
  // Request.requireRedirect,
  // identification
  // Request.requireEmail,
  // Request.requireLocalStorageId,
  // Request.getEmail,

  // Request.requireVerifiedUser,
  // authorization
  Request.registerRole,

  // methods
  Request.getFunnel,
  // Request.requireFunnel,
  Request.registerFunnel,

  Request.getOffers,
  // Request.requireOffer,
  Request.registerOffer,

  Request.getChecklist,
  // Request.requireChecklist,
  Request.registerChecklist,


  Request.registerLead,

  async(req, res) => {
    return res.sendStatus(404)
  }
)

app.post("/request/register/session/",
  Request.verifyId,

  async (req, res) => {
    try {
      const {localStorageId, event} = req.body
      const {doc, user} = await Helper.findUser(user => user.id === localStorageId)
      if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
      if (Helper.stringIsEmpty(user.id)) throw new Error("user id is empty")

      if (event === "onlogin") {
        if (Helper.arrayIsEmpty(user.roles)) return res.sendStatus(200)
      }
      if (Helper.arrayIsEmpty(user.roles)) throw new Error("user roles is empty")

      const salt = Helper.generateRandomBytes(32)
      if (Helper.arrayIsEmpty(salt)) throw new Error("salt is empty")
      const jwtToken = jwt.sign({
        roles: user.roles,
        id: user.id,
      }, process.env.JWT_SECRET, { expiresIn: '2h' })
      if (Helper.stringIsEmpty(jwtToken)) throw new Error("jwt token is empty")
      const saltDigest = Helper.digest(JSON.stringify(salt))
      if (Helper.stringIsEmpty(saltDigest)) throw new Error("salt digest is empty")
      const jwtTokenDigest = Helper.digest(jwtToken)
      if (Helper.stringIsEmpty(jwtTokenDigest)) throw new Error("jwt token digest is empty")
      const sessionToken = Helper.digest(JSON.stringify({
        id: user.id,
        pin: randomPin,
        salt: saltDigest,
        jwt: jwtTokenDigest,
      }))
      if (Helper.stringIsEmpty(sessionToken)) throw new Error("session token is empty")



      if (user.session === undefined) {
        user.session = {}
        user.session.createdAt = Date.now()
        user.session.pin = randomPin
        user.session.salt = saltDigest
        user.session.jwt = jwtTokenDigest
        user.session.counter = 1
      } else {
        user.session.session = {}
        user.session.createdAt = Date.now()
        user.session.pin = randomPin
        user.session.salt = saltDigest
        user.session.jwt = jwtTokenDigest
        user.session.counter = user.session.counter + 1
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })


      const sessionLength = 120 * 60000
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
      return res.sendStatus(200)
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }
)

app.post("/request/verify/pin/",
async (req, res) => {
  try {
    const {userPin} = req.body
    if (Helper.stringIsEmpty(userPin)) throw new Error("user pin is empty")
    if (Helper.stringIsEmpty(randomPin)) throw new Error("random pin is empty")
    if (userPin !== randomPin) throw new Error("user pin is not valid")
    if (expiredTimeMs < Date.now()) throw new Error("user pin expired")
    return res.sendStatus(200)
  } catch (error) {
    Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

let expiredTimeMs
let randomPin
app.post("/request/send/email/with/pin/",
async (req, res) => {
  try {
    const {email} = req.body
    if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
    randomPin = Helper.digest(crypto.randomBytes(32))
    expiredTimeMs = Date.now() + (2 * 60 * 1000)

    await Helper.sendEmailFromDroid({
      from: "<droid@get-your.de>",
      to: email,
      subject: "[getyour plattform] Deine PIN",
      html: /*html*/`
        <p>PIN: ${randomPin}</p>
        <p>Sollten Sie gerade nicht versucht haben sich unter https://get-your.de anzumelden, dann erhalten Sie diese E-Mail, weil jemand anderes versucht hat sich mit Ihrer E-Mail Adresse anzumelden. In dem Fall löschen Sie die E-Mail mit der PIN und <span style="color: #d50000; font-weight: bold;">geben Sie die PIN auf keinen Fall weiter.</span></p>
        <p>Wenn Sie Ihre PIN mit anderen teilen, besteht die Gefahr, dass unbefugte Personen Zugang zu Ihrem Konto erhalten und Ihre Sicherheit gefährden. Daher ist es wichtig, Ihre PIN vertraulich zu behandeln und sicherzustellen, dass Sie sie nur selbst verwenden.</p>
        <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
      `
    })
    return res.sendStatus(200)
  } catch (error) {
    Helper.logError(error, req)
  }
  return res.sendStatus(404)
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



app.get("/:username/", async (req, res, next) => {
  try {
    if (req.params.username === "home") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-login.html"))
    if (req.params.username === "impressum") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-impressum.html"))
    if (req.params.username === "datenschutz") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-datenschutz.html"))
    if (req.params.username === "nutzervereinbarung") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-nutzervereinbarung.html"))


    const {user} = await Helper.findUser(user => user.name === req.params.username)
    console.log(user);

    // TODO



    return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-profile-page.html"))
  } catch (error) {
    Helper.logError(error, req)
  }
  return res.sendStatus(404)
})



// app.use(express.static(docsLocation.absolutePath))
// app.use(express.static(clientLocation.absolutePath))
app.listen(clientLocation.port, () => console.log(`[getyour] client listening on ${clientLocation.origin}`))
