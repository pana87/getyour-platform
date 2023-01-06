module.exports = class Notification {

  // do metadata here

  static warn(message) {
    const error = new Error()
    const location = error.stack.split("at ")[2].trim()
    console.log("\x1b[33m%s\x1b[0m", `[getyour] ${message} -> ${location}`)
  }

  static error(message) {
    const error = new Error()
    const location = error.stack.split("at ")[3].trim()
    console.log("\x1b[31m%s\x1b[0m", `[getyour] ${message} -> ${location}`)
  }

  static info(message) {
    // const error = new Error()
    // console.log(error);
    // const location = error.stack.split("at ")[2].trim()
    console.log(`[getyour] ${message}`)
  }
}

