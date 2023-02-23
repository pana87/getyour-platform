const express = require('express')
const cors = require("cors")
const cookieParser = require('cookie-parser')
const app = express()
const {clientLocation, databaseLocation} = require('../config/ServerLocation.js')
const { Request } = require('../lib/Request.js')
const { UserRole } = require('../lib/domain/UserRole.js')

app.use(express.json({limit: "50mb"}))
app.use(cookieParser())
app.use(cors({
  origin: `${clientLocation.origin}`,
  methods: [ "POST" ],
  credentials: true,
}))

//// app example
// write
// app.post("/request/register/funnel/",
// Request.requireBody,
// Request.requireUrl,
// Request.requireLocalStorageId,
// Request.requireVerifiedUser,
// Request.requireCookies,
// Request.requireSessionToken,
// Request.requireJwtToken,
// Request.requireRoles,
// Request.requireFunnel,
// Request.registerFunnel,
// async(req, res) => {
//   return res.sendStatus(404)
// })
// read
// app.post("/request/require/funnel/",
// Request.requireBody,
// Request.requireUrl,
// Request.requireType,
// Request.requireName,
// Request.requireLocalStorageId,
// Request.requireVerifiedUser,
// Request.requireCookies,
// Request.requireSessionToken,
// Request.requireJwtToken,
// Request.requireRoles,
// Request.verifyUrlId,
// Request.sendFunnel,
// async(req, res) => {
//   return res.sendStatus(404)
// })
// create
// app.post("/request/create/funnel/",
// Request.requireBody,
// Request.requireUrl,
// Request.requireType,
// Request.requireName,
// Request.sendFunnel, async(req, res) => {
//   return res.sendStatus(404)
// })



// app.post("/request/require/checklist/",
// Request.requireBody,
// Request.requireUrl,
// Request.requireType,
// Request.requireName,
// Request.requireLocalStorageId,
// Request.requireVerifiedUser,
// Request.requireCookies,
// Request.requireJwtToken,
// Request.requireSessionToken,
// // Request.requireRoles,
// Request.verifyUrlId,
//  async(req, res) => {
//   return res.sendStatus(404)
// })
// app.post("/request/create/checklist/", (req, res) => {
//   return res.sendStatus(404)
// })

app.post("/",
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
  Request.registerVerifiedUser,

  // Request.requireVerifiedUser,

  // authorization
  Request.verifyId,

  Request.registerOperator,
  // methods
  Request.sendFunnel,
  // Request.requireFunnel,
  Request.registerFunnel,

  Request.sendOffer,
  // Request.requireOffer,
  Request.registerOffer,

  Request.sendChecklist,
  // Request.requireChecklist,
  Request.registerChecklist,


  async(req, res) => {
    return res.sendStatus(404)
  }
)


// app.post("/request/update/offer/", Request.requireBody, Request.requireUrl, Request.requireLocalStorageId, Request.requireVerifiedUser, Request.requireCookies, Request.requireSessionToken, Request.requireJwtToken, Request.requireRoles, Request.requireOffer, Request.sendOffer, async(req, res) => {
//   return res.sendStatus(404)
// })
// app.post("/request/register/offer/", Request.requireBody, Request.requireUrl, Request.requireFunnel, Request.requireLocalStorageId, Request.requireVerifiedUser, Request.requireCookies, Request.requireSessionToken, Request.requireJwtToken, Request.requireRoles, Request.requireOffer, Request.registerOffer, async(req, res) => {
//   return res.sendStatus(404)
// })
// app.post("/request/require/offer/", Request.requireBody, Request.requireUrl, Request.requireType, Request.requireName, Request.requireLocalStorageId, Request.requireVerifiedUser, Request.requireCookies, Request.requireSessionToken, Request.requireJwtToken, Request.requireRoles, Request.sendOffer, async(req, res) => {
//   return res.sendStatus(404)
// })
// app.post("/request/create/offer/", Request.requireBody, Request.requireUrl, Request.requireType, Request.requireName, Request.requireFunnel, Request.sendOffer, (req, res) => {
//   return res.sendStatus(404)
// })






// app.post("/request/register/operator/",
// Request.requireBody,
// Request.requireUrl,
// Request.requireLocalStorageId,
// Request.requireVerifiedUser,
// Request.registerOperator,
// async (req, res) => {
//   return res.sendStatus(404)
// })

// app.post("/request/register/email/",
// Request.requireBody,
// Request.requireUrl,
// Request.requireLocalStorageId,
// Request.requireEmail,
// Request.registerEmail,

// async (req, res) => {
//   return res.sendStatus(404)
// })

app.listen(databaseLocation.port, () => console.log(`[getyour] database listening on ${databaseLocation.origin}`))
