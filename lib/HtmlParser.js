const Notification = require("./Notification.js")
const path = require("node:path")
const fs = require("node:fs")
const { platformLocation, authLocation, componentsLocation, dbLocation } = require("../config/Location.js")

const GLOBAL_SCRIPT = `
<script id="global-js" type="module" src="${platformLocation.origin}/js/global.js"></script>
</body>
`
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
const BODY_REGEX = /<\/body>/

module.exports = class HtmlParser {

  static parse({pathToAssets, pathToHtmlFile}) {
    const file = path.join(__dirname, "..", pathToHtmlFile)

    if (!fs.existsSync(file)) {
      Notification.error(`FILE_NOT_FOUND`)
      return {
        status: 404,
        message: "FILE_NOT_FOUND",
      }
    }

    return {
      status: 200,
      message: "PARSE_SUCCESS",
      html: fs.readFileSync(file).toString()
        .replace(URL_REGEX, platformLocation.origin)
        .replace(BODY_REGEX, GLOBAL_SCRIPT)
        .replace(BODY_REGEX, ENVIRONMENT_VARIABLES)
        .replace(CSS_REGEX, `type="text/css" href="${pathToAssets}`)
        .replace(IMG_REGEX, `src="${pathToAssets}img/`)
    }
  }
}
