const fs = require("node:fs")
const path = require("node:path")
const { platformLocation, authLocation, componentsLocation, dbLocation } = require("../config/ServerLocation.js")

const PATH_TO_FAVICON = "/img/favicon.ico"

const INDEX_SCRIPT = `
  <script type="module" src="./index.js"></script>
</body>
`

const GLOBAL_SCRIPT = `
  <script type="module" src="${platformLocation.origin}/js/global.js"></script>
</body>
`

const searchStrings = [
  `<script type="module" src="./index.js"></script>`,
  `<!--<meta name=description content="This site was generated with Anima. www.animaapp.com"/>-->`,
  `<!-- <link rel="shortcut icon" type=image/png href="https://animaproject.s3.amazonaws.com/home/favicon.png" /> -->`,
  `<link rel="shortcut icon" type="image/png" href="https://animaproject.s3.amazonaws.com/home/favicon.png"`
]

const ENVIRONMENT_VARIABLES = `
<script id="__EXPOSE__">
  window.__DB_LOCATION__=${JSON.stringify(dbLocation)}
  window.__PLATFORM_LOCATION__=${JSON.stringify(platformLocation)}
  window.__AUTH_LOCATION__=${JSON.stringify(authLocation)}
  window.__COMPONENTS_LOCATION__=${JSON.stringify(componentsLocation)}
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

module.exports.HtmlParser = class {

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
      this.html = html.replace(ANIMA_BOILERPLATE_REGEX_3, `<link rel="shortcut icon" type="image/png" href="${platformLocation.origin}/img/favicon.ico"`)
    }
  }

  #setUrl(html) {
    this.html = html
      .replace(URL_REGEX, platformLocation.origin)
      .replace(LOCALHOST_REGEX, platformLocation.origin)
  }

  #parseHtml(file) {
    if (fs.existsSync(file)) {
      this.html = fs.readFileSync(file).toString()

      this.#setUrl(this.html)
      this.#setIndexScript(this.html)
      this.#setAnimaBoilerplate1(this.html)
      this.#setAnimaBoilerplate2(this.html)
      this.#setAnimaBoilerplate3(this.html)

      if (this.html === "") return
      fs.writeFileSync(file, this.html, "utf-8")
    }
  }

  constructor() {
    this.html = ""

    const files = getAllFiles("/client").filter(it => it.endsWith(".html"))

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
