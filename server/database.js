const express = require('express')
const cors = require("cors")
const Notification = require('../lib/Notification.js')
const app = express()
const {clientLocation, databaseLocation} = require('../config/ServerLocation.js')
const { User } = require('../lib/domain/User.js')
const { Request } = require('../lib/Request.js')

app.use(express.json({limit: "50mb"}))
app.use(cors({
  origin: `${clientLocation.origin}`,
  methods: [ "POST" ],
  credentials: true,
}))

app.post("/request/register/operator/", Request.verifyId, async (req, res) => {
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

// app.post("/request/store/digest/", async (req, res) => {
//   const { id, digest } = req.body
//   if (id !== undefined && digest !== undefined) {
//     await User.storeDigest({id, digest})
//     return res.send({
//       status: 200,
//       message: "STORE_DIGEST_REQUEST_SUCCEED",
//     })
//   }
//   return res.send({
//     status: 500,
//     message: "STORE_DIGEST_REQUEST_FAILED",
//   })
// })

// app.post("/request/store/name/", async (req, res) => {
//   const { id, name } = req.body
//   if (id !== undefined && name !== undefined) {
//     await User.storeName({id, name})
//     return res.send({
//       status: 200,
//       message: "STORE_NAME_REQUEST_SUCCEED",
//     })
//   }
//   return res.send({
//     status: 500,
//     message: "STORE_NAME_REQUEST_FAILED",
//   })
// })

// app.post("/request/store/password/", async (req, res) => {
//   const { id, password } = req.body
//   if (id !== undefined && password !== undefined) {
//     await User.storePassword({id, password})
//     return res.send({
//       status: 200,
//       message: "STORE_PASSWORD_REQUEST_SUCCEED",
//     })
//   }
//   return res.send({
//     status: 500,
//     message: "STORE_PASSWORD_REQUEST_FAILED",
//   })
// })

// app.post("/request/store/role/", async (req, res) => {
//   const {id, role} = req.body
//   if (id !== undefined && role !== undefined) {
//     await User.storeRole({id, role})
//     return res.send({
//       status: 200,
//       message: "STORE_ROLE_REQUEST_SUCCEED",
//     })
//   }
//   return res.send({
//     status: 500,
//     message: "STORE_ROLE_REQUEST_FAILED",
//   })
// })

// app.post("/request/store/id/", async (req, res) => {
//   const { id } = req.body
//   if (id !== undefined) {
//     await User.storeId(id)
//     const {user} = await User.find(it => it.email.value === id)
//     // console.log(user);
//     return res.send({
//       status: 200,
//       message: "STORE_EMAIL_REQUEST_SUCCEED",
//       id: user.id,
//     })
//   }
//   return res.send({
//     status: 500,
//     message: "STORE_EMAIL_REQUEST_FAILED",
//   })
// })


app.listen(databaseLocation.port, () => Notification.warn(`database listening on ${databaseLocation.origin}`))
