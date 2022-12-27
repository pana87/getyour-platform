const express = require('express')
const cors = require("cors")
// const Location = require('../config/Location')
// const Storage = require('../config/Storage')
const Auth = require('../lib/AuthServer.js')
const Notification = require('../lib/Notification')
const { dbLocation, platformLocation } = require('../config/ServerLocation.js')
const app = express()
// const location = dbLocation
// const platformLocation = platformLocation

app.use(express.json())
app.use(cors({
  origin: `${platformLocation.protocol}//${platformLocation.hostname}:${platformLocation.port}`,
  methods: [ "POST", "GET" ],
  credentials: true,
}))

// app.post("/users/append/", async (req, res) => {
//   // const user = req.body
//   console.log(req.body);

//   // const object = req.body.privateKeyCredential.attestationObject
//   // console.log(object);
//   // console.log(JSON.parse(object));
//   // console.log(Buffer.from(JSON.parse(object)))
//   // console.log(JSON.parse(Buffer.from(JSON.parse(object)).toString()))

//   // return console.log("SAVED");
//   // if (!user) {
//   //   return {
//   //     status: 500,
//   //     message: "USER_NOT_VALID"
//   //   }
//   // }

//   // const userExists = await Storage.userExists(user)
//   // if (userExists) {
//   //   return res.send({
//   //     status: 100,
//   //     message: "USER_EXISTS",
//   //     userExists: true,
//   //   })
//   // }

//   // const saveUserRx = await Storage.save(user)
//   // console.log(saveUserRx);


//   res.send({
//     status: 200,
//     body: "OK"
//   })

// })

// app.get("/users/", async (req, res) => {
//   const users = await Storage.getUsers()
//   return res.send({
//     status: 200,
//     users: users
//   })
// })

app.listen(dbLocation.port, () => Notification.warn(`database listening on ${dbLocation.origin}`))
