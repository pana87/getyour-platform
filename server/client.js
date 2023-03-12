const express = require('express')
const {HtmlParser} = require('../config/HtmlParser.js')
const cookieParser = require('cookie-parser')
const { clientLocation, docsLocation } = require('../config/ServerLocation.js')
const { CSSParser } = require('../config/CSSParser.js')
const { Helper } = require('../lib/Helper.js')
const { User } = require('../lib/User.js')
const { Request } = require('../lib/Request.js')
const { UserRole } = require('../lib/UserRole.js')
const crypto = require("node:crypto")
const jwt = require('jsonwebtoken')
// const sessionLength = 5 * 60000
const sessionLength = 120 * 60000


Helper.configureClientStorage()
// new HtmlParser(docsLocation.relativePath)
// new HtmlParser(clientLocation.relativePath)
// new CSSParser()

const app = express()
app.use(cookieParser())
app.use(express.json({limit: "50mb"}))
app.use("/docs/", express.static(docsLocation.absolutePath))
app.use(express.static(clientLocation.absolutePath))


// app.get("/felix/shs/hersteller/", async(req, res) => {
//   // user/platform/app/
//   // die app heißt hersteller-matching
//   return res.send(Helper.readFileSyncToString("../lib/value-units/offer-list.html"))
//   // return res.send(Helper.readFileSyncToString("../client/felix/shs/hersteller/index.html"))
// })

// app.get("/felix/shs/funnel/abfrage-technisches/1", async(req, res) => {
//   return res.send(Helper.readFileSyncToString("../client/felix/shs/funnel/abfrage-technisches/index.html"))
//   // if (req.params.name === "qualifizierung") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   // if (req.params.name === "abfrage-haus") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   // if (req.params.name === "abfrage-heizung") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   // if (req.params.name === "abfrage-strom") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   // if (req.params.name === "abfrage-technisches") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   // if (req.params.name === "abfrage-persoenliches") return res.send(Helper.readFileSyncToString(`../lib/value-units/funnel/shs-${req.params.name}.html`))
//   // try {
//   // } catch (error) {
//   //   Helper.logError(error, req)
//   // }
//   // return res.redirect("/felix/shs/")
// })

// app.get("/:username/", async (req, res) => {
//   try {
//     // before jwt
//     if (req.params.username === "home") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-login.html"))
//     // if (req.params.username === "home") return res.send(Helper.readFileSyncToString("./../client/home/index.html"))
//     if (req.params.username === "impressum") return res.send(Helper.readFileSyncToString("./../lib/value-units/getyourindex.html"))
//     if (req.params.username === "datenschutz") return res.send(Helper.readFileSyncToString("./../client/datenschutz/index.html"))
//     if (req.params.username === "nutzervereinbarung") return res.send(Helper.readFileSyncToString("./../client/nutzervereinbarung/index.html"))
//     // const {user} = await User.find(it => it.name === req.params.username)
//     // if (user === undefined) return res.sendStatus(404)
//     // const userRole = user.roles
//     // const userName = Helper.capitalizeFirstLetter(req.params.username)
//     // const platformList = "<p>test</p>"

//     // const html = Helper.renderContentFeed(req.params.username)

//     const html = Helper.readFileSyncToString("../lib/value-units/profile-doc-by-username.html")
//     // console.log(html);
//     return res.send(html)

//   } catch (error) {
//     console.error(error)
//   }
//   return res.sendStatus(404)
// })
app.get("/:user/", async (req, res, next) => {
  try {
    if (req.params.user === "home") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-login.html"))
    if (req.params.user === "impressum") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-impressum.html"))
    if (req.params.user === "datenschutz") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-datenschutz.html"))
    if (req.params.user === "nutzervereinbarung") return res.send(Helper.readFileSyncToString("../lib/value-units/getyour-nutzervereinbarung.html"))
    return next()
  } catch (error) {
    Helper.logError(error, req)
  }
  return res.sendStatus(404)
})


// app.get("/:user/:platform/:type/:name/", async(req, res, next) => {
//   // if (req.params.username === "impressum") return res.send(Helper.readFileSyncToString("./../lib/value-units/getyourindex.html"))
//   // if (req.params.username === "datenschutz") return res.send(Helper.readFileSyncToString("./../client/datenschutz/index.html"))
//   // if (req.params.username === "nutzervereinbarung") return res.send(Helper.readFileSyncToString("./../client/nutzervereinbarung/index.html"))
//   return next()
// })


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
      if (req.params.name === "experte-kontaktieren") return res.send(Helper.readFileSyncToString(`../lib/value-units/shs-${req.params.name}.html`))
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
  (req, res) => {
    return res.send(Helper.readFileSyncToString("../lib/value-units/shs-angebot-drucken.html"))
    // return res.send(Helper.readFileSyncToString("../client/felix/shs/checkliste/1/print.html"))
  }
)

app.get("/felix/shs/checklist/:urlId/sign/",
  Request.requireJwtToken,
  Request.verifySession,
  Request.requireRoles([UserRole.OPERATOR]),
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



app.get("/plattform/zugang/", async(req, res) => {
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

app.get("/user/platform/funnel/sign/", (req, res) => {
  console.log("hi");
  const html = Helper.readFileSyncToString("../client/user/platform/funnel/sign/index.html")
  if (html !== undefined) return res.send(html)
  return res.sendStatus(404)
})

// app.get("/user/entries/", (req, res) => {
//   // if (req.userError !== undefined) return res.redirect("/home/")
//   return res.send(Helper.readFileSyncToString("../client/user/entries/index.html"))
// })

app.get("/cookies/anzeigen/", async (req, res) => {
  return res.send(req.cookies)
})



app.post("/consumer/v1/",
  // session
  // Request.requireCookies,


  // with options
  Request.requireJwtToken,
  Request.verifySession,

  // options
  // Request.requireBody,
  // Request.requireUrl,
  // Request.requireMethod,
  // Request.requireSecurity,
  // Request.requireType,
  // Request.requireName,

  // identification
  // Request.requireEmail,
  // Request.requireLocalStorageId,
  Request.registerEmail,
  Request.verifyEmail,

  // Request.requireVerifiedUser,

  // authorization
  Request.verifyId,

  Request.registerRole,
  // methods
  Request.getFunnel,
  // Request.requireFunnel,
  Request.registerFunnel,

  Request.getOffer,
  // Request.requireOffer,
  Request.registerOffer,

  Request.getChecklist,
  // Request.requireChecklist,
  Request.registerChecklist,

  Request.requireRedirect,
  Request.getEmail,

  Request.registerLead,

  async(req, res) => {
    return res.sendStatus(404)
  }
)


app.post("/request/register/session/",
  // Request.requireBody,
  // Request.requireUrl,
  Request.requireLocalStorageId,
  Request.requireVerifiedUser,
  async (req, res) => {
    try {
      const {localStorageId, name, referrer} = req.body
      const {user} = await Helper.find(user => user.id === localStorageId)
      if (Helper.objectIsEmpty(user)) return res.sendStatus(404)
      const salt = Helper.generateRandomBytes(32)
      if (Helper.arrayIsEmpty(salt)) return res.sendStatus(404)

      if (name === "onlogin") {
        // redirect by referrer
        // 901 - platform entries
        // if (referrer !== "") {}
        if (referrer !== undefined) {
          // console.log(referrer.pathname);
          if (referrer.pathname === "/felix/shs/") return res.sendStatus(901)
        }
        // if (referrer.pathname === "") return res.sendStatus(901)
        // if (referrer.pathname === "/felix/shs/funnel/abfrage-haus/") return res.sendStatus(900)
        // if (referrer.pathname === "/felix/shs/match-maker/experte-kontaktieren/") return res.sendStatus(900)
        // if (referrer.pathname === "/felix/shs/match-maker/experte-kontaktieren/") return res.sendStatus(900)
        // if (referrer.pathname === "/felix/shs/match-maker/experte-kontaktieren/") return res.sendStatus(900)
        // if (referrer.pathname === "/felix/shs/match-maker/experte-kontaktieren/") return res.sendStatus(900)
        // console.log(user);
        // redirect to shs qualification
        // if (user.funnels === undefined) return res.sendStatus(903)
        // if (Helper.arrayIsEmpty(user.roles)) {
        //   return res.sendStatus(902)
        // }
      }

      if (Helper.stringIsEmpty(user.id)) return res.sendStatus(404)





      // const jwtToken = JWTToken.sign({
      //   roles: user.roles,
      //   id: user.id,
      // }).jwtToken


      const jwtToken = jwt.sign({
        roles: user.roles,
        id: user.id,
      }, process.env.JWT_SECRET, { expiresIn: '2h' })



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
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }
)

let randomPin
app.post("/request/verify/pin/",
async (req, res) => {
  try {
    const {userPin} = req.body
    Helper.verifyPin(userPin, randomPin)
    return res.sendStatus(200)
  } catch (error) {
    Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

app.post("/request/send/email/with/pin/",
async (req, res) => {
  try {
    const {email} = req.body
    if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
    randomPin = Helper.digest(crypto.randomBytes(32))
    setTimeout(() => randomPin = undefined, 5 * 60000)
    await Helper.sendEmailFromDroid({
      from: "<droid@get-your.de>",
      to: email,
      subject: "[getyour plattform] Deine PIN",
      html: /*html*/`
        <p>PIN: ${randomPin}</p>
        <p>Sollten Sie gerade nicht versucht haben sich unter https://get-your.de anzumelden, dann erhalten Sie diese E-Mail, weil jemand anderes versucht hat sich mit Ihrer E-Mail Adresse anzumelden. In dem Fall löschen Sie die E-Mail mit der PIN und <span style="color: #d50000; font-weight: bold;">geben Sie die PIN auf keinen Fall weiter.</span></p>
        <p>Wenn Sie Ihre PIN mit anderen teilen, besteht die Gefahr, dass unbefugte Personen Zugang zu Ihrem Konto erhalten und Ihre Sicherheit gefährden. Daher ist es wichtig, Ihre PIN vertraulich zu behandeln und sicherzustellen, dass Sie sie nur selbst verwenden.</p>
        <p>Sollte eine andere E-Mail Adresse als "<a href="#" style="text-decoration: none; color: inherit; cursor: default;">droid&#64;get-your&#46;de</a>" als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
      `
    })
    return res.sendStatus(200)
  } catch (error) {
    Helper.logError(error, req)
  }
  return res.sendStatus(404)
})

// app.post("/request/jwt/token/", async (req, res) => {
//   const requestJwtTokenRx = JWTToken.sign(req.body)
//   if (requestJwtTokenRx.status !== 200) {
//     return res.send({
//       status: 500,
//       message: "JWT_SIGN_FAILED"
//     })
//   }

//   return res.send({
//     status: 200,
//     message: "JWT_SIGN_SUCCESS",
//     token: requestJwtTokenRx.token,
//   })
// })

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



// app.use(express.static(docsLocation.absolutePath))
// app.use(express.static(clientLocation.absolutePath))
app.listen(clientLocation.port, () => console.log(`[getyour] client listening on ${clientLocation.origin}`))
