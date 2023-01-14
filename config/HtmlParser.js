const fs = require("node:fs")
const path = require("node:path")
const { clientLocation, authLocation, databaseLocation, docsLocation } = require("../config/ServerLocation.js")

const PATH_TO_FAVICON = `${clientLocation.origin}/favicon.ico`

const INDEX_SCRIPT = `
  <script type="module" src="./index.js"></script>
</body>
`

const GLOBAL_SCRIPT = `
  <script type="module" src="${clientLocation.origin}/js/global.js"></script>
</body>
`

const searchStrings = [
  `<script type="module" src="./index.js"></script>`,
  `<!--<meta name=description content="This site was generated with Anima. www.animaapp.com"/>-->`,
  `<!-- <link rel="shortcut icon" type=image/png href="https://animaproject.s3.amazonaws.com/home/favicon.png" /> -->`,
  `<link rel="shortcut icon" type="image/png" href="https://animaproject.s3.amazonaws.com/home/favicon.png"`
]

const EXPOSE_TAG = `<script id="__EXPOSE__">`
const EXPOSE_DEFAULT = `
  <script id="__EXPOSE__">
    window.__AUTH_LOCATION__="."
    window.__DB_LOCATION__="."
    document.getElementById("__EXPOSE__").remove()
  </script>
</body>
`

const CSS_REGEX = /type="text\/css" href="/g
const IMG_REGEX = /src="img\//g
const URL_REGEX = /https:\/\/get-your.de/g
const LOCALHOST_REGEX = /http:\/\/localhost:[0-9]+/g
const BODY_REGEX = /<\/body>/
const SCRIPT_REGEX = /<script type="module" src="\.\/index\.js"><\/script>/g
const ANIMA_BOILERPLATE_REGEX_1 = /<!--<meta name=description content="This site was generated with Anima\. www\.animaapp\.com"\/>-->/g
const ANIMA_BOILERPLATE_REGEX_2 = /<!-- <link rel="shortcut icon" type=image\/png href="https:\/\/animaproject\.s3\.amazonaws\.com\/home\/favicon\.png" \/> -->/g
const ANIMA_BOILERPLATE_REGEX_3 = /<link rel="shortcut icon" type="image\/png" href="https:\/\/animaproject\.s3\.amazonaws\.com\/home\/favicon\.png"/g
const AUTH_LOCATION_REGEX = /window\.__AUTH_LOCATION__=".+"/g
const DB_LOCATION_REGEX = /window\.__DB_LOCATION__=".+"/g


module.exports.HtmlParser = class {

  #setDatabaseLocation(html) {
    this.html = html.replace(DB_LOCATION_REGEX, `window.__DB_LOCATION__="${databaseLocation.origin}"`)
  }

  #setAuthLocation(html) {
    this.html = html.replace(AUTH_LOCATION_REGEX, `window.__AUTH_LOCATION__="${authLocation.origin}"`)
  }

  #setExpose(html) {
    if (!html.includes(EXPOSE_TAG)){
      this.html = html.replace(BODY_REGEX, EXPOSE_DEFAULT)
    }
  }

  #setIndexScript(html) {
    if (!html.includes(searchStrings[0])) {
      this.html = html.replace(BODY_REGEX, INDEX_SCRIPT)
    }
  }

  #setAnimaBoilerplate1(html) {
    if (html.includes(searchStrings[1])) {
      this.html = html.replace(ANIMA_BOILERPLATE_REGEX_1, " ")
    }
  }

  #setAnimaBoilerplate2(html) {
    if (html.includes(searchStrings[2])) {
      this.html = html.replace(ANIMA_BOILERPLATE_REGEX_2, " ")
    }
  }

  #setAnimaBoilerplate3(html) {
    if (html.includes(searchStrings[3])) {
      this.html = html.replace(ANIMA_BOILERPLATE_REGEX_3, `<link rel="shortcut icon" type="image/x-icon" href="${PATH_TO_FAVICON}"`)
    }
  }

  #parseHtml(file) {
    if (fs.existsSync(file)) {
      this.html = fs.readFileSync(file).toString()

      this.#setIndexScript(this.html)
      this.#setExpose(this.html)
      this.#setAnimaBoilerplate1(this.html)
      this.#setAnimaBoilerplate2(this.html)
      this.#setAnimaBoilerplate3(this.html)

      this.#setAuthLocation(this.html)
      this.#setDatabaseLocation(this.html)

      if (this.html === "") return
      fs.writeFileSync(file, this.html, "utf-8")
    }
  }

  constructor(directory) {
    this.html = ""

    const files = getAllFiles(directory).filter(it => it.endsWith(".html"))

    files.forEach(file => this.#parseHtml(file))
  }
}

function getAllFiles(dirPath, arrayOfFiles) {
  const directoryPath = path.join(__dirname, "..", dirPath)
  files = fs.readdirSync(directoryPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(directoryPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(__dirname, "..", dirPath, "/", file))
    }
  })
  return arrayOfFiles
}
