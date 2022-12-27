require('dotenv').config()
const express = require('express')
const bodyParser = require("body-parser")
const path = require("node:path")
// const Location = require('../config/Location.js')
const {HtmlParser} = require('../config/HtmlParser.js')
const Notification = require('../lib/Notification.js')
// const { fstat } = require('node:fs')
const app = express()
const { platformLocation } = require('../config/ServerLocation.js')
const location = platformLocation
const rawParser = bodyParser.raw()
const jsonParser = bodyParser.json({ limit: "50mb" })
const textParser = bodyParser.text()
// const db = require("nano")(process.env.DB)
const fs = require("node:fs")
const { CSSParser } = require('../config/CSSParser.js')
// const { Helper } = require('../lib/Helper.js')
// const { nano } = require('../config/CouchDB.js')
// console.log(nano);
// console.log(await nano.db.list());
// const CouchDB = require('../config/CouchDB.js')
// const Blob = require('node:buffer').Blob
// const multer  = require('multer')
// const upload = multer
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
// app.use(bodyParser.json({ limit: "50mb" }));
// // app.use(bodyParser.urlencoded());
// // // in latest body-parser use like below.
// app.use(bodyParser.urlencoded({ extended: true }));
// const db = db
// const formidableMiddleware = require('express-formidable');

// app.use(formidableMiddleware());

new HtmlParser()
new CSSParser()
// new CouchDB()

// const files = Helper.getAllFilesFromDirectory(".")
// console.log(files);

function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}
// app.use(express.json())

// OPEN PLATFORM Level 1 (Server)

app.post("/send/file/", jsonParser, async (req, res) => {
  console.log(req.body);
  // req.files
  // req.files
  // console.log(req.files);
  // console.log(req.body.file);
  // console.log(req.body);
  // const info = await db.get('attachmens')
  // console.log(info);

  // const getyour = nano.use('getyour');
  // console.log(getyour);

  // try saving with th is - add more data from users and store everything in attachment doc and create attachment doc
  // await db.attachment.insert('users',
  //     'file.pdf',
  //     req.body.data,
  //     'application/pdf',
  //     { rev: '41-a5c8d39e4e1b740049772fbd7dfcc582' })

  const body = await db.attachment.get('users', 'file.pdf')
  // console.log(body);

  // fs.writeFile()
  // console.log(Buffer.from(body).toString())
  // return res.send(Buffer.from(body))


  // const response = await db.attachment.insert('rabbit',
  //   'rabbit.png',
  //   data,
  //   'image/png',
  //   { rev: '12-150985a725ec88be471921a54ce91452' })

  // const blob = dataURItoBlob(req.body.file)
  // console.log(blob);
  // console.log(blob);
  // var buf = Buffer.from(req.body, "binary");
  // console.log(buf);
  return res.send({
    status: 200,
    message: "FILE_SAVED",
    blob: Buffer.from(body).toString(),
  })
})

app.get("/testing/", async (req, res) => {
  const {html} = HtmlParser.parse({
    pathToAssets: "",
    pathToHtmlFile: "/lib/views/default.html",
  })
  return res.send(html)
})

// app.get("/felix/shs/login/", async (req, res) => {
//   const result = parser.parse("/lib/views/", "default.html")

//   if (result.status === 404) res.sendStatus(404)
//   res.send(result.body)
// })

// app.get("/:userName/", async (req, res) => {
//   // if (req.params.userName === "login") return res.send(result.body)

//   const result = parser.parse("/lib/views/", "default.html")

//   if (result.status === 404) res.sendStatus(404)
//   res.send(result.body)
// })

// app.get("/felix/shs/techniker/ansicht/", (req, res) => {
//   const result = parser.parse("/lib/views/", "default.html")

//   if (result.status === 404) res.sendStatus(404)
//   // var cookie = req.cookies.token;
//   // console.log("pl", cookie);
//   res.send(result.body)
// })

// app.get("/felix/shs/technician/checklist-item/", Auth.verify, (req, res) => {
//   const result = parser.parseStatic("/felix/shs/technician/checklist-item/", "index.html")
//   if (result.status === 404) res.sendStatus(404)

//   res.send(result.body)
// })


// // THIS PATH SHOULD BE IN GERMAN (OUTSIDE)
// app.get('/toolbox/funnel/ansicht/:funnelName/', (req, res) => {
//   // THE PATHS SHOULD NOT BE EQUAL BECAUSE OF MULTIPLE reqS

//   // THIS PATH SHOULD BE IN ENGLISH (INSIDE)
//   const result = parser.parse("/toolbox/funnel/view/")
//   res.send(result)
// })
app.use(express.static(path.join(__dirname, "..", "client")))

app.listen(location.port, () => Notification.warn(`platform listening on ${location.origin}`))
