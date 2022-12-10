const fs = require("node:fs")

module.exports.parseAssets = (pathname) => {
  // const file = `${__dirname}${pathname}index.html`
  // console.log(file);

  // SHOULD BE WRITTEN IN TESTS
  // if (pathname === "") return { status: "500", body: "INPUT_IS_EMPTY" }
  // if (pathname === null) return { status: "500", body: "INPUT_IS_NULL" }
  // if (pathname === undefined) return { status: "500", body: "INPUT_IS_UNDEFINED" }

  return parseHtml(pathname)
    .replace(cssRegex, `type="text/css" href="${url}${pathname}`)
    .replace(imgRegex, `src="${url}${pathname}img/`)
}

module.exports.parseHtml = (pathname) => {
  const file = `${__dirname}${pathname}index.html`
  console.log(file);
  if (fs.existsSync(file)) {
    const fileBuffer = fs.readFileSync(file)

    result = fileBuffer.toString()
      .replace(/https:\/\/get-your.de/g, url)
      .replace(/<\/body>/, globalScript)
      .replace(/<\/body>/, environmentVariables)

    return result
  }
}
