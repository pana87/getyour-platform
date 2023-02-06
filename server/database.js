const express = require('express')
const cors = require("cors")
const cookieParser = require('cookie-parser')
const Notification = require('../lib/Notification.js')
const app = express()
const {clientLocation, databaseLocation} = require('../config/ServerLocation.js')
const { User } = require('../lib/domain/User.js')
const { Request } = require('../lib/Request.js')
const { UserRole } = require('../lib/domain/UserRole.js')
const { Helper } = require('../lib/Helper.js')

app.use(express.json({limit: "50mb"}))
app.use(cookieParser())
app.use(cors({
  origin: `${clientLocation.origin}`,
  methods: [ "POST" ],
  credentials: true,
}))

app.post("/request/user/offer/", Request.requireId, Request.requireSession, Request.requireRoles([UserRole.OPERATOR]), Request.requireUrlId, async (req, res) => {
  const {user} = await User.find(it => it.id === req.user.id)
  if (user !== undefined) {
    return res.send({
      id: user.id,
      offer: user.offer,
    })
  }
  return res.sendStatus(404)
})

app.post("/request/user/checklist/", Request.requireId, Request.requireSession, Request.requireRoles([UserRole.OPERATOR]), Request.requireUrlId, async (req, res) => {
  const {user} = await User.find(it => it.id === req.user.id)
  if (user !== undefined) {
    return res.send({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  }
  return res.sendStatus(404)
})

app.post("/request/register/operator/", Request.requireId, async (req, res) => {
  try {
    const storeOperatorRx = await User.registerOperator(req.body)
    if (storeOperatorRx.status === 200) {
      return res.send({
        status: 200,
        message: "REGISTER_OPERATOR_REQUEST_SUCCEED",
      })
    }
  } catch (error) {
    console.error(error)
  }
  return res.send({
    status: 500,
    message: "REGISTER_OPERATOR_REQUEST_FAILED",
  })
})

app.post("/request/register/id/", async (req, res) => {
  try {
    const storeIdRx = await User.registerId(req.body)
    if (storeIdRx.status === 200) {
      return res.send({
        status: 200,
        message: "REGISTER_ID_REQUEST_SUCCEED",
      })
    }
  } catch (error) {
    console.error(error)
  }
  return res.send({
    status: 500,
    message: "REGISTER_ID_REQUEST_FAILED",
  })
})

app.listen(databaseLocation.port, () => Notification.warn(`database listening on ${databaseLocation.origin}`))
