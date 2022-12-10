require('dotenv').config()

class Location {
  constructor({
    port,
    hostname,
    protocol,
  }) {
    this.port = port
    this.hostname = hostname
    this.protocol = protocol
    this.host = `${this.hostname}:${this.port}`
    this.origin = `${this.protocol}//${this.host}`
  }
}

const dbServer = {
  port: process.env.COMPONENTS_PORT || "10001",
  hostname: process.env.COMPONENTS_HOSTNAME || "localhost",
  protocol: process.env.COMPONENTS_PROTOCOL || "http:",
}

const componentsServer = {
  port: process.env.COMPONENTS_PORT || "7777",
  hostname: process.env.COMPONENTS_HOSTNAME || "localhost",
  protocol: process.env.COMPONENTS_PROTOCOL || "http:",
}

const platformServer = {
  port: process.env.PLATFORM_PORT || "8888",
  hostname: process.env.PLATFORM_HOSTNAME || "localhost",
  protocol: process.env.PLATFORM_PROTOCOL || "http:",
}

const authServer = {
  port: process.env.AUTH_PORT || "9999",
  hostname: process.env.AUTH_HOSTNAME || "localhost",
  protocol: process.env.AUTH_PROTOCOL || "http:",
}

module.exports.dbLocation = new Location(dbServer)
module.exports.componentsLocation = new Location(componentsServer)
module.exports.platformLocation = new Location(platformServer)
module.exports.authLocation = new Location(authServer)
