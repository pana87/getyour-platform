const fs = require("fs")
const path = require("path")

const url = process.env.URL || "http://localhost:8888"

module.exports = function(eleventyConfig) {

  // eleventyConfig.addTransform("replace-css-paths", (content) => {
  //   const result = content.replace(/css\//g, `${url}/css/`)
  //   return result
  // })

  // eleventyConfig.addTransform("replace-img-paths", (content) => {
  //   const result = content.replace(/img\//g, `${url}/img/`)
  //   return result
  // })

  // eleventyConfig.addPassthroughCopy({
  //   "node_modules/@getyour/getyour-fireflies/getyour-fireflies.js":
  //   "js/getyour-fireflies.js"
  // })

  getAllFiles("./static").filter(it => it.endsWith(".html")).forEach(result => _transform(result))
  getAllFiles("./static").filter(it => it.endsWith(".css")).forEach(result => _removeAnimasBoilerplateCodeFromCss(result))

  // eleventyConfig.addTransform("add-google-analytics-tag", (content) => {
  //   const result = content.replace(/<\/head>/, `
  //   <script class="ga-tag" async src="https://www.googletagmanager.com/gtag/js?id=G-5W2YKBV4NZ"></script>
  //   <script class="ga-tag" >
  //     window.dataLayer = window.dataLayer || [];
  //     function gtag(){dataLayer.push(arguments);}
  //     gtag('js', new Date());

  //     gtag('config', 'G-5W2YKBV4NZ');
  //   </script>
  // </head>
  //   `)
  //   return result
  // })

  // eleventyConfig.addPassthroughCopy({"./static/": "/"})
  // eleventyConfig.addPassthroughCopy({"./src/js": "/js"})

  return {
    dir: {
      input: "./src/",
      output: "./public/"
    }
  }
}

// function _removeAnimasBoilerplateCodeFromCss(file) {
//   if (fs.existsSync(file)) {
//     const fileBuffer = fs.readFileSync(file)

//     const search1 = `/* The following line is used to measure usage of this code in production. For more info see our usage billing page */`
//     const search2 = `@import url("https://px.animaapp.com`

//     if (fileBuffer.toString().includes(search1)) {
//       const result = fileBuffer.toString().replace(/\/\* The following line is used to measure usage of this code in production\. For more info see our usage billing page \*\//g, "")
//       fs.writeFileSync(file, result, "utf-8")
//     }

//     if (fileBuffer.toString().includes(search2)) {
//       const result = fileBuffer.toString().replace(/@import url\("https:\/\/px\.animaapp\.com.*/g, "")
//       fs.writeFileSync(file, result, "utf-8")
//     }
//   }
// }

function _transform(file) {
  const script =
`
  <script id="global-js" type="module" src="${url}/js/global.js"></script>
  <script id="__EXPOSE__">
    window.__URL__=${JSON.stringify(url)}
    document.getElementById("__EXPOSE__").remove()
  </script>
</body>
`

  const search1 = `<script id="global-js"`
  const search2 = `<script id="__EXPOSE__"`
  const staticUrl = `https://get-your.de`

  if (fs.existsSync(file)) {
    const fileBuffer = fs.readFileSync(file)

    if (fileBuffer.toString().includes(staticUrl)) {
      const result = fileBuffer.toString().replace(/https:\/\/get-your.de/g, url)
      fs.writeFileSync(file, result, "utf-8")
    }
    if (fileBuffer.toString().includes(search1) || fileBuffer.toString().includes(search2)) return

    const result = fileBuffer.toString().replace(/<\/body>/, script)
    fs.writeFileSync(file, result, "utf-8")
  }
}

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
    }
  })

  return arrayOfFiles
}
