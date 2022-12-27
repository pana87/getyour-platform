const fs = require("node:fs")
const path = require("node:path")

const ANIMA_BOILERPLATE_REGEX_1 = /\/\* The following line is used to measure usage of this code in production\. For more info see our usage billing page \*\//g
const ANIMA_BOILERPLATE_REGEX_2 = /@import url\("https:\/\/px\.animaapp\.com\/.*\.hcp\.png"\);/g

module.exports.CSSParser = class {

  #setAnimaBoilerplate1(css) {
    this.css = css.replace(ANIMA_BOILERPLATE_REGEX_1, "")
  }

  #setAnimaBoilerplate2(css) {
    this.css = css.replace(ANIMA_BOILERPLATE_REGEX_2, "")
  }

  #parseCss(file) {
    if (fs.existsSync(file)) {
      this.css = fs.readFileSync(file).toString()

      this.#setAnimaBoilerplate1(this.css)
      this.#setAnimaBoilerplate2(this.css)

      if (this.css === "") return
      fs.writeFileSync(file, this.css, "utf-8")
    }
  }

  constructor() {
    this.css = ""

    const files = getAllFiles("/client").filter(it => it.endsWith(".css"))

    files.forEach(file => this.#parseCss(file))
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
