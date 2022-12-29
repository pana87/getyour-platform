require('dotenv').config()
const express = require('express')
const bodyParser = require("body-parser")
const path = require("node:path")
// const Location = require('../config/Location.js')
const {HtmlParser} = require('../config/HtmlParser.js')
const Notification = require('../lib/Notification.js')
// const { fstat } = require('node:fs')
const app = express()
const { clientLocation, authLocation, databaseLocation } = require('../config/ServerLocation.js')
// const location = clientLocation
const rawParser = bodyParser.raw()
const jsonParser = bodyParser.json({ limit: "50mb" })
const textParser = bodyParser.text()
// const db = require("nano")(process.env.DB)
const fs = require("node:fs")
const { CSSParser } = require('../config/CSSParser.js')
const Storage = require('../lib/Storage.js')
const { Helper } = require('../lib/Helper.js')
const { User } = require('../lib/domain/User.js')
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

// console.log("before db");
// async function createDatabase() {
//   console.log("before create");
//   const response = await Storage.create("getyour")
//   console.log(response);
//   console.log("after create");
//   Storage.insert({ users: [] }, "users")
// }
// createDatabase()
Storage.clientConfig()



// console.log("long after create");
// await Storage.create("getyour")

// console.log("after db");


// app.use(formidableMiddleware());
// console.log(clientLocation.relativePath);
new HtmlParser(clientLocation.relativePath)
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

app.get("/plattform/zugang/", (req, res) => {
  return res.send(/*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Plattform Zugänge</title>
      </head>
      <body>

        <h1 class="title">Übersicht aller Zugänge</h1>
        <p class="info">Du musst dich anmelden, um die Plattform benutzen zu können.</p>

        <div class="platform-developer-entry-anchor"></div>
        <div class="operator-entry-anchor"></div>

        <script type="module" src="./index.js"></script>
      </body>
    </html>
  `)
})




// const welcome = `Herzlich Willkommen bei getyour plattform.\n\nIch bin Droid, dein persönlicher Assistent. Ich habe dir gerade eine E-Mail an '${userEmail}' gesendet.\n\nBestätige die PIN aus der E-Mail um fortzufahren.`
// app.get("/plattform/zugang/", (req, res) => {
//   return res.send(/*html*/`
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta http-equiv="X-UA-Compatible" content="IE=edge">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Jetzt anmelden</title>
//       </head>
//       <body>

//         <h1 class="title">Willkommen auf getyour plattform</h1>
//         <p class="info">Du musst dich anmelden, um die Plattform benutzen zu können.</p>

//         <div class="create-email"></div>
//         <div class="login-button"></div>

//         <script type="module">
//           import {EmailField} from "../../js/EmailField.js"
//           import {ButtonField} from "../../js/ButtonField.js"
//           import {Request} from "../../js/Request.js"
//           import {UserRoles} from "../../js/UserRoles.js"

//           const emailField = new EmailField("div[class*='create-email']").withPlaceholder("meine.email@get-your.de").withPattern(".+@get-your.de").withValidity()

//           new ButtonField("div[class*='login-button']").withInnerHtml("Anmelden").withOnclick(async () => {

//           const userEmail = emailField.getValue()
//           if (userEmail !== undefined) {
//             await Request.verifyEmail(userEmail)

//             const pin = prompt("Herzlich Willkommen bei getyour plattform.\\n\\nIch bin Droid, dein persönlicher Assistent. Ich habe dir gerade eine E-Mail an '" + userEmail + "' gesendet.\\n\\nBestätige die PIN aus der E-Mail um fortzufahren.")
//             await Request.verifyPin(pin)

//             Request.storeToLocalstorage("email", userEmail)
//             await Request.storeEmail(userEmail)
//             await Request.storeRoles([
//               UserRoles.PLATFORM_DEVELOPER
//             ])

//             window.location.assign("/zugang/plattformentwickler/registrieren/")
//             return
//           }

//           emailField.withNotValidStyle()
//           console.error("NO_VALID_INPUT")
//           })

//         </script>
//         <script id="__EXPOSE__">
//           window.__AUTH_LOCATION__=${JSON.stringify(authLocation.origin)}
//           window.__DATABASE_LOCATION__=${JSON.stringify(databaseLocation.origin)}
//           document.getElementById("__EXPOSE__").remove()
//         </script>
//       </body>
//     </html>
//   `)
// })



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
  const {doc} = await Storage.get("getyour", "users")
  console.log(doc);


  // const {html} = HtmlParser.parse({
  //   pathToAssets: "",
  //   pathToHtmlFile: "/lib/views/default.html",
  // })
  return res.send("hi")
})

app.get("/:username/", async (req, res) => {
  const {user} = await User.find(it => it.name === req.params.username)
  console.log(user);

  if (user !== undefined) {
    const username = Helper.capitalizeFirstLetter(req.params.username)

    return res.send(/*html*/`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dein Profil</title>
        </head>
        <body>

          <h1 class="title">Hey ${username}</h1>
          <p class="info">Ich bin Droid, dein persönlicher Assistent. Es scheint als würdest du dich das erste mal anmelden. Ich benötige noch einige Informationen, um dich auf die Plattform vorzubereiten.</p>


          <script id="__EXPOSE__">
            window.__DATABASE_LOCATION__=${JSON.stringify(databaseLocation.origin)}
            document.getElementById("__EXPOSE__").remove()
          </script>
        </body>
      </html>
    `)
  }

  return res.send(/*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weiterleitung</title>
      </head>
      <body>
        <script>
          window.location.assign("/plattform/zugang/")
        </script>
      </body>
    </html>
  `)
})


app.get("/plattform/zugang/plattformentwickler/registrieren/", (req, res) => {
  return res.send(/*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zugang für Plattformentwickler</title>
      </head>
      <body>

        <h1 class="title">Herzlich Willkommen auf getyour plattform</h1>
        <p class="info">Ich bin Droid, dein persönlicher Assistent. Es scheint als würdest du dich das erste mal anmelden. Ich benötige noch einige Informationen, um dich auf die Plattform vorzubereiten.</p>

        <div class="create-name"></div>
        <div class="preview-url">https://get-your.de/</div>

        <div class="create-password"></div>
        <div class="confirm-password"></div>
        <div class="register-button"></div>

        <script type="module" src="./index.js"></script>
        <script id="__EXPOSE__">
          window.__DATABASE_LOCATION__=${JSON.stringify(databaseLocation.origin)}
          document.getElementById("__EXPOSE__").remove()
        </script>
      </body>
    </html>
  `)
})

app.get("/plattform/zugang/plattformentwickler/anmelden/", (req, res) => {
  return res.send(/*html*/`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Zugang für Plattformentwickler</title>
      </head>
      <body>

        <h1 class="title">Anmeldung zum Plattformentwickler</h1>
        <p class="info">Als Plattformentwickler hast du die Möglichkeit Plattformen zu entwickeln.</p>

        <div class="create-email"></div>
        <div class="login-button"></div>

        <script type="module" src="./index.js"></script>
        <script id="__EXPOSE__">
          window.__AUTH_LOCATION__=${JSON.stringify(authLocation.origin)}
          window.__DATABASE_LOCATION__=${JSON.stringify(databaseLocation.origin)}
          document.getElementById("__EXPOSE__").remove()
        </script>
      </body>
    </html>
  `)
})







// app.get("/felix/shs/login/", async (req, res) => {
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
app.use(express.static(clientLocation.absolutePath))

app.listen(clientLocation.port, () => Notification.warn(`client listening on ${clientLocation.origin}`))
