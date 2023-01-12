require('dotenv').config({ path: `${__dirname}/../.env`})
const path = require("node:path")

class ServerLocation {

  withProtocol(protocol) {
    this.protocol = protocol
    return this.#ServerLocation(this)
  }

  withHostname(hostname) {
    this.hostname = hostname
    return this.#ServerLocation(this)
  }

  withPort(port) {
    this.port = port
    return this.#ServerLocation(this)
  }

  #ServerLocation(instance) {
    const { port, hostname, protocol } = instance

    if (port === undefined) this.port = "9999"
    if (hostname === undefined) this.hostname = "localhost"
    if (protocol === undefined) this.protocol = "http:"
    this.host = `${this.hostname}:${this.port}`
    this.origin = `${this.protocol}://${this.host}`

    return this
  }

  constructor(relativePath = "") {
    this.absolutePath = path.join(__dirname, "..", relativePath)
    this.relativePath = relativePath
  }
}

module.exports.docsLocation = new ServerLocation("docs").withPort(process.env.DOCS_PORT || "10000").withHostname(process.env.DOCS_HOSTNAME).withProtocol(process.env.DOCS_PROTOCOL)
module.exports.databaseLocation = new ServerLocation().withPort(process.env.DATABASE_PORT || "7777").withHostname(process.env.DATABASE_HOSTNAME).withProtocol(process.env.DATABASE_PROTOCOL)
module.exports.clientLocation = new ServerLocation("client").withPort(process.env.CLIENT_PORT || "9999").withHostname(process.env.CLIENT_HOSTNAME).withProtocol(process.env.CLIENT_PROTOCOL)
module.exports.authLocation = new ServerLocation().withPort(process.env.AUTH_PORT || "8888").withHostname(process.env.AUTH_HOSTNAME).withProtocol(process.env.AUTH_PROTOCOL)
