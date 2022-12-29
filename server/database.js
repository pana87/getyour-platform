const express = require('express')
const cors = require("cors")
const Notification = require('../lib/Notification.js')
const app = express()
const {clientLocation, databaseLocation} = require('../config/ServerLocation.js')
const { User } = require('../lib/domain/User.js')

app.use(express.json())
app.use(cors({
  origin: `${clientLocation.origin}`,
  methods: [ "POST" ],
  credentials: true,
}))

app.post("/request/store/name/", async (req, res) => {
  const { id, name } = req.body

  const {user} = await User.find(it => it.name === name)
  console.log(user)

  if (user !== undefined) {
    const userUpdateRx = await User.update(id, (user) => {
      user.name = name
    })
    if (userUpdateRx.status === 200) {
      return res.send({
        status: 200,
        message: "NAME_STORED",
      })
    }
  }
  return res.send({
    status: 500,
    message: "NAME_STORE_FAILED",
  })
})

app.post("/request/store/password/", async (req, res) => {
  const { id, password } = req.body
  if (password !== undefined) {
    const userUpdateRx = await User.update(id, (user) => {
      user.password = password
    })
    if (userUpdateRx.status === 200) {
      return res.send({
        status: 200,
        message: "NAME_STORED",
      })
    }
  }
  return res.send({
    status: 500,
    message: "PASSWORD_STORE_FAILED",
  })
})

app.post("/request/store/roles/", async (req, res) => {
  const { roles } = req.body
  if (roles.length !== 0) {
    User.storeRoles(req.body)
    return res.send({
      status: 200,
      message: "ROLES_STORED",
    })
  }
  return res.send({
    status: 500,
    message: "ROLES_STORE_FAILED",
  })
})

app.post("/request/store/email/", async (req, res) => {
  const { email } = req.body
  if (email !== undefined) {

    User.storeEmail({
      value: email,
      verified: true,
    })

    return res.send({
      status: 200,
      message: "EMAIL_STORED",
    })
  }

  return res.send({
    status: 500,
    message: "EMAIL_STORE_FAILED",
  })
})


app.listen(databaseLocation.port, () => Notification.warn(`database listening on ${databaseLocation.origin}`))
