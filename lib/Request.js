const { User } = require("./domain/User.js");
const Storage = require("./Storage.js");

module.exports.Request = class {

  static verifySession(req, res) {
    return new Promise((resolve, reject) => {
      console.log(req);
      console.log(res);


    })
  }

  static sessionTimeout(id, minutes) {
    try {
      setTimeout(async () => {
        const {doc, user} = await User.find(it => it.email.value === id)
        user.digest = undefined
        await Storage.insert("getyour", { _id: doc._id, _rev: doc._rev, users: doc.users })
        return {
          status: 200,
          message: "SESSION_TIMEOUT_REQUEST_SUCCEED",
        }
      }, minutes * 60000)
    } catch (error) {
      console.error(error)
    }
    return {
      status: 500,
      message: "SESSION_TIMEOUT_REQUEST_FAILED",
    }
  }

}
