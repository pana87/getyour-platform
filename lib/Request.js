require('dotenv').config()
const { UserRole } = require("./UserRole.js")
const { Helper } = require("./Helper.js")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

module.exports.Request = class {

  static async update(req, res, next) {
    try {

      if (req.params.method === "update") {

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")


        if (req.params.type === "match-maker") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "condition") {

                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                    if (Helper.stringIsEmpty(req.body.left)) throw new Error("req.body.left is empty")
                    if (Helper.stringIsEmpty(req.body.operator)) throw new Error("req.body.operator is empty")
                    if (Helper.stringIsEmpty(req.body.right)) throw new Error("req.body.right is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform["match-maker"] !== undefined) {
                                    for (let i = 0; i < platform["match-maker"].length; i++) {
                                      const matchMaker = platform["match-maker"][i]

                                      if (matchMaker.conditions !== undefined) {
                                        for (let i = 0; i < matchMaker.conditions.length; i++) {
                                          const condition = matchMaker.conditions[i]


                                          if (condition.created === req.body.id) {

                                            condition.left = req.body.left
                                            condition.operator = req.body.operator
                                            condition.right = req.body.right

                                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                            return res.sendStatus(200)

                                          }

                                        }
                                      }


                                    }
                                  }

                                }
                              }
                            }
                          }
                        }
                      }

                    }

                  }
                }
              }
            }
          }
        }

        if (req.params.type === "location-list") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                if (Helper.objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {

                      if (user[req.location.platform][req.body.tag] !== undefined) {
                        for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
                          const locationList = user[req.location.platform][req.body.tag][i]

                          if (locationList.created === req.body.id) {

                            locationList.funnel = req.body.map

                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                            return res.sendStatus(200)
                          }


                        }
                      }

                    }
                  }

                }

              }
            }
          }
        }

        if (req.params.type === "expert") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "name") {
                    if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              user["getyour"].expert.name = req.body.name

                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.values !== undefined) {
                                    for (let i = 0; i < platform.values.length; i++) {
                                      const value = platform.values[i]

                                      if (value.path !== undefined) {
                                        const pathName = value.path.split("/")[3]

                                        value.path = `/${req.body.name}/${platform.name}/${pathName}/`
                                      }



                                    }


                                  }

                                  if (platform.roles !== undefined) {
                                    for (let i = 0; i < platform.roles.length; i++) {
                                      const role = platform.roles[i]

                                      if (role.home !== undefined) {
                                        const pathName = role.home.split("/")[3]

                                        role.home = `/${req.body.name}/${platform.name}/${pathName}/`

                                      }

                                    }
                                  }

                                }
                              }
                              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                              return res.sendStatus(200)
                            }
                          }
                        }
                      }

                    }


                  }
                }


              }
            }
          }
        }

        if (req.params.type === "platform-value-image") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                if (Helper.stringIsEmpty(req.body.image)) throw new Error("req.body.image is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.values !== undefined) {
                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]

                                  if (value.path === req.body.path) {
                                    value.image = {}
                                    value.image.url = req.body.image

                                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                    return res.sendStatus(200)
                                  }


                                }
                              }


                            }
                          }
                        }
                      }
                    }
                  }

                }

              }
            }
          }
        }

        if (req.params.type === "platform-image") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.stringIsEmpty(req.body.image)) throw new Error("req.body.image is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.name === req.body.platform) {
                                // override old
                                platform.image = {}
                                platform.image.url = req.body.image

                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }

                            }
                          }
                        }
                      }
                    }
                  }

                }

              }
            }
          }
        }

        if (req.params.type === "user-json") {
          if (req.params.event === "verified") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                console.log("hi");

                if (req.params.role !== undefined) {
                  if (parseInt(req.params.role) === UserRole.ADMIN) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const admin = doc.users[i]

                      if (admin.id === req.jwt.id) {

                        if (Helper.verifyIs("user/getyour-admin", admin)) {

                          if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
                          if (Helper.objectIsEmpty(req.body.user)) throw new Error("req.body.user is empty")
                          for (let i = 0; i < doc.users.length; i++) {
                            const user = doc.users[i]

                            if (user.email === req.body.email) {
                              user = req.body.user
                              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                              return res.sendStatus(200)
                            }

                          }
                        }

                      }
                    }
                  }
                }

              }
            }
          }
        }

        if (req.params.type === "service-condition") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {


                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {
                        if (user[req.body.platform].services !== undefined) {

                          for (let i = 0; i < user[req.body.platform].services.length; i++) {
                            const service = user[req.body.platform].services[i]
                            if (service.id === req.body.service) {

                              if (service.conditions !== undefined) {
                                for (let i = 0; i < service.conditions.length; i++) {
                                  const condition = service.conditions[i]

                                  if (condition.id === req.body.id) {

                                    Helper.update("condition", condition, req.body)

                                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                    return res.sendStatus(200)
                                  }

                                }



                              }
                              if (service.conditions === undefined) service.conditions = []
                              const condition = {}
                              condition.id = Date.now()

                              Helper.update("condition", condition, req.body)

                              service.conditions.unshift(condition)
                              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                              return res.sendStatus(200)

                            }

                          }


                        }
                      }
                    }

                  }

                }

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].services !== undefined) {

                        for (let i = 0; i < user[req.location.platform].services.length; i++) {
                          const service = user[req.location.platform].services[i]
                          if (service.id === req.body.service) {

                            if (service.conditions !== undefined) {
                              for (let i = 0; i < service.conditions.length; i++) {
                                const condition = service.conditions[i]

                                if (condition.id === req.body.id) {

                                  Helper.update("condition", condition, req.body)

                                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                  return res.sendStatus(200)
                                }

                              }



                            }
                            if (service.conditions === undefined) service.conditions = []
                            const condition = {}
                            condition.id = Date.now()

                            Helper.update("condition", condition, req.body)

                            service.conditions.unshift(condition)
                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                            return res.sendStatus(200)

                          }

                        }


                      }
                    }
                  }

                }


              }
            }
          }
        }

        if (req.params.type === "offer") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {

                        if (user[req.body.platform].offer !== undefined) {

                          Helper.update("offer", user[req.body.platform].offer, req.body)

                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                          return res.sendStatus(200)

                        }

                        const offer = Helper.create("offer")

                        Helper.update("offer", offer, req.body)

                        user[req.body.platform].offer = offer

                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }

                  }

                }

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {

                      if (user[req.location.platform].offer !== undefined) {

                        Helper.update("offer", user[req.location.platform].offer, req.body)

                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)

                      }

                      const offer = Helper.create("offer")

                      Helper.update("offer", offer, req.body)

                      user[req.location.platform].offer = offer

                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }
                  }

                }


              }
            }
          }
        }

        if (req.params.type === "script") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].scripts === undefined) user[req.location.platform].scripts = []
                      if (user[req.location.platform].scripts !== undefined) {

                        if (!Helper.numberIsEmpty(req.body.id)) {
                          for (let i = 0; i < user[req.location.platform].scripts.length; i++) {
                            const script = user[req.location.platform].scripts[i]

                            if (script.id === req.body.id) {

                              Helper.update("script", script, req.body)

                              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                              return res.sendStatus(200)
                            }
                          }

                          throw new Error("id not found")
                        }

                        const script = {}
                        script.id = Date.now()

                        Helper.update("script", script, req.body)

                        user[req.location.platform].scripts.unshift(script)
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)

                      }
                    }
                  }

                }


              }
            }
          }
        }

        if (req.params.type === "service") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {


                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")


                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {
                        if (user[req.body.platform].services === undefined) user[req.body.platform].services = []
                        if (user[req.body.platform].services !== undefined) {

                          if (!Helper.numberIsEmpty(req.body.id)) {
                            for (let i = 0; i < user[req.body.platform].services.length; i++) {
                              const service = user[req.body.platform].services[i]

                              if (service.id === req.body.id) {

                                Helper.update("service", service, req.body)

                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }
                            }




                            throw new Error("id not found")
                          }

                          const service = {}
                          service.id = Date.now()

                          Helper.update("service", service, req.body)

                          user[req.body.platform].services.unshift(service)
                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                          return res.sendStatus(200)

                        }
                      }
                    }

                  }

                }


                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].services === undefined) user[req.location.platform].services = []
                      if (user[req.location.platform].services !== undefined) {

                        if (!Helper.numberIsEmpty(req.body.id)) {
                          for (let i = 0; i < user[req.location.platform].services.length; i++) {
                            const service = user[req.location.platform].services[i]

                            if (service.id === req.body.id) {

                              Helper.update("service", service, req.body)

                              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                              return res.sendStatus(200)
                            }
                          }




                          throw new Error("id not found")
                        }

                        const service = {}
                        service.id = Date.now()

                        Helper.update("service", service, req.body)

                        user[req.location.platform].services.unshift(service)
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)

                      }
                    }
                  }

                }


              }
            }
          }
        }

        if (req.params.type === "platform") {
          if (req.params.event === "closed") {
            if (req.jwt !== undefined) {
              if (req.body.type !== undefined) {
                if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                if (req.body.type === "role") {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.name === req.location.expert) {
                            if (user["getyour"].expert.platforms !== undefined) {
                              for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                const platform = user["getyour"].expert.platforms[i]

                                if (platform.name === req.body.platform) {
                                  if (platform.roles === undefined) platform.roles = []

                                  if (req.body.id !== undefined) {
                                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                                    for (let i = 0; i < platform.roles.length; i++) {
                                      const role = platform.roles[i]


                                      if (role.id === req.body.id) {

                                        Helper.update("role", role, req.body)

                                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                        return res.sendStatus(200)
                                      }

                                    }

                                    throw new Error("update failed")
                                  }

                                  if (req.body.id === undefined) {

                                    for (let i = 0; i < platform.roles.length; i++) {
                                      const role = platform.roles[i]

                                      if (role.name === req.body.name) throw new Error("req.body.name exist")

                                    }

                                  }


                                  const role = {}
                                  role.id = Date.now()

                                  Helper.update("role", role, req.body)

                                  platform.roles.unshift(role)
                                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                  return res.sendStatus(200)
                                }



                              }
                            }
                          }
                        }
                      }
                    }

                  }

                }

              }
            }
          }
        }

      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyReferer(req, res, next) {
    try {

      if (req.body.referer !== undefined) {

        if (!Helper.stringIsEmpty(req.body.referer)) {
          const referer = new URL(req.body.referer)
          if (
            referer.origin === "http://localhost:9999" ||
            referer.origin === "https://get-your.de" ||
            referer.origin === "https://www.get-your.de"
          ) {

            req.referer = referer
            return next()
          }
        }

      }

      throw new Error("referer failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)

  }

  static async verifyLocation(req, res, next) {
    try {

      if (req.body.location !== undefined) {
        const location = new URL(req.body.location)
        if (
          location.origin === "http://localhost:9999" ||
          location.origin === "https://get-your.de" ||
          location.origin === "https://www.get-your.de"
        ) {

          // console.log(req.location);
          req.location = {}
          req.location.url = location
          req.location.expert = location.pathname.split("/")[1]
          req.location.platform = location.pathname.split("/")[2]
          req.location.path = location.pathname.split("/")[3]
          // req.body.location = location
          return next()
        }
      }

      throw new Error("location failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)

  }

  static async delete(req, res, next) {
    try {

      if (req.params.method === "delete") {

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users are undefined")

        if (req.params.type === "match-maker") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "condition") {

                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform["match-maker"] !== undefined) {
                                    for (let i = 0; i < platform["match-maker"].length; i++) {
                                      const matchMaker = platform["match-maker"][i]

                                      if (matchMaker.conditions !== undefined) {
                                        for (let i = 0; i < matchMaker.conditions.length; i++) {
                                          const condition = matchMaker.conditions[i]

                                          if (condition.created === req.body.id) {

                                            matchMaker.conditions.splice(i, 1)

                                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                            return res.sendStatus(200)

                                          }

                                        }
                                      }


                                    }
                                  }

                                }
                              }
                            }
                          }
                        }
                      }

                    }

                  }
                }

                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform["match-maker"] !== undefined) {
                                for (let i = 0; i < platform["match-maker"].length; i++) {
                                  const matchMaker = platform["match-maker"][i]

                                  if (matchMaker.created === req.body.id) {
                                    platform["match-maker"].splice(i, 1)

                                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                    return res.sendStatus(200)

                                  }

                                }
                              }

                            }
                          }
                        }
                      }
                    }
                  }


                }
              }
            }
          }
        }


        if (req.params.type === "location-list-funnel") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform][req.body.tag] !== undefined) {

                        for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
                          const locationListFunnel = user[req.location.platform][req.body.tag][i]

                          if (locationListFunnel.created === req.body.id) {

                            user[req.location.platform][req.body.tag].splice(i, 1)

                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                            return res.sendStatus(200)
                          }

                        }

                      }
                    }
                  }

                }

              }
            }
          }
        }

        if (req.params.type === "logs") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (req.params.role !== undefined) {

                  if (parseInt(req.params.role) === UserRole.ADMIN) {

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (Helper.verifyIs("email/super-admin", user.email)) {

                          const doc = await nano.db.use("getyour").get("logs")
                          doc.logs = []
                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, logs: doc.logs })
                          return res.sendStatus(200)

                        }
                      }

                    }

                  }

                }
              }
            }

          }
        }

        if (req.params.type === "service-condition") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {



                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")


                  if (Helper.numberIsEmpty(req.body.service)) throw new Error("req.body.service is empty")
                  if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {
                        if (user[req.body.platform].services !== undefined) {

                          for (let i = 0; i < user[req.body.platform].services.length; i++) {
                            const service = user[req.body.platform].services[i]

                            if (service.id === req.body.service) {

                              if (service.conditions !== undefined) {
                                for (let i = 0; i < service.conditions.length; i++) {
                                  const condition = service.conditions[i]

                                  if (condition.id === req.body.id) {

                                    service.conditions.splice(i, 1)

                                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                    return res.sendStatus(200)
                                  }

                                }
                              }

                            }




                          }

                        }
                      }
                    }

                  }

                }


                if (Helper.numberIsEmpty(req.body.service)) throw new Error("req.body.service is empty")
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].services !== undefined) {

                        for (let i = 0; i < user[req.location.platform].services.length; i++) {
                          const service = user[req.location.platform].services[i]

                          if (service.id === req.body.service) {

                            if (service.conditions !== undefined) {
                              for (let i = 0; i < service.conditions.length; i++) {
                                const condition = service.conditions[i]

                                if (condition.id === req.body.id) {

                                  service.conditions.splice(i, 1)

                                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                  return res.sendStatus(200)
                                }

                              }
                            }

                          }




                        }

                      }
                    }
                  }

                }


              }
            }
          }
        }

        if (req.params.type === "offer") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                  if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {
                        if (user[req.body.platform].offer !== undefined) {

                          user[req.body.platform].offer = undefined
                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                          return res.sendStatus(200)

                        }
                      }
                    }

                  }

                }





                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].offer !== undefined) {

                        user[req.location.platform].offer = undefined
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)

                      }
                    }
                  }

                }


              }
            }
          }
        }

        if (req.params.type === "script") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].scripts !== undefined) {

                        for (let i = 0; i < user[req.location.platform].scripts.length; i++) {
                          const script = user[req.location.platform].scripts[i]

                          if (script.id === req.body.id) {

                            user[req.location.platform].scripts.splice(i, 1)

                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                            return res.sendStatus(200)
                          }


                        }

                      }
                    }
                  }

                }


              }
            }
          }
        }

        if (req.params.type === "service") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                  if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {
                        if (user[req.body.platform].services !== undefined) {

                          for (let i = 0; i < user[req.body.platform].services.length; i++) {
                            const service = user[req.body.platform].services[i]

                            if (service.id === req.body.id) {

                              user[req.body.platform].services.splice(i, 1)

                              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                              return res.sendStatus(200)
                            }




                          }

                        }
                      }
                    }

                  }

                }

                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].services !== undefined) {

                        for (let i = 0; i < user[req.location.platform].services.length; i++) {
                          const service = user[req.location.platform].services[i]

                          if (service.id === req.body.id) {

                            user[req.location.platform].services.splice(i, 1)

                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                            return res.sendStatus(200)
                          }




                        }

                      }
                    }
                  }

                }


              }
            }
          }
        }

        if (req.params.type === "template") {
          if (req.params.event === "closed") {
            if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === req.jwt.id) {
                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert !== undefined) {
                    if (user["getyour"].expert.templates !== undefined) {
                      for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                        const template = user["getyour"].expert.templates[i]

                        if (template.id === req.body.id) {
                          user["getyour"].expert.templates.splice(i, 1)

                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                          return res.sendStatus(200)
                        }

                      }
                    }
                  }
                }
              }

            }
          }
        }

        if (req.params.type === "key") {
          if (req.params.event === "closed") {


            if (req.jwt !== undefined) {

              if (Helper.stringIsEmpty(req.body.key)) throw new Error("req.body.key is empty")

              if (req.body.key === "id") throw new Error("reserved key not deletable")
              if (req.body.key === "email") throw new Error("reserved key not deletable")
              if (req.body.key === "verified") throw new Error("reserved key not deletable")
              if (req.body.key === "reputation") throw new Error("reserved key not deletable")
              if (req.body.key === "created") throw new Error("reserved key not deletable")
              if (req.body.key === "roles") throw new Error("reserved key not deletable")
              if (req.body.key === "parent") throw new Error("reserved key not deletable")
              if (req.body.key === "children") throw new Error("reserved key not deletable")
              // if (req.body.key === "getyour") throw new Error("reserved key not deletable")

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === req.jwt.id) {

                  if (user[req.body.key] !== undefined) user[req.body.key] = undefined

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }

            }


          }
        }

        if (req.params.type === "feedback") {

          if (req.params.event === "location") {
            if (req.location !== undefined) {

              if (req.body.type !== undefined) {
                if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                if (req.body.type === "script") {
                  if (Helper.numberIsEmpty(req.body.scriptId)) throw new Error("req.body.scriptId is empty")
                  if (Helper.numberIsEmpty(req.body.feedbackId)) throw new Error("req.body.feedbackId is empty")

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].scripts !== undefined) {

                        for (let i = 0; i < user[req.location.platform].scripts.length; i++) {
                          const script = user[req.location.platform].scripts[i]

                          if (script.id === req.body.scriptId) {


                            for (let i = 0; i < script.feedback.length; i++) {
                              const feedback = script.feedback[i]


                              if (feedback.id === req.body.feedbackId) {
                                script.feedback.splice(i, 1)

                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }

                            }

                          }

                        }

                      }


                    }

                  }

                }


                if (req.body.type === "html-value") {

                  if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.name === req.location.platform) {
                                if (platform.values !== undefined) {
                                  for (let i = 0; i < platform.values.length; i++) {
                                    const value = platform.values[i]

                                    if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                                      if (value.feedback !== undefined) {


                                        for (let i = 0; i < value.feedback.length; i++) {
                                          const feedback = value.feedback[i]


                                          if (feedback.id === req.body.id) {
                                            value.feedback.splice(i, 1)

                                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                            return res.sendStatus(200)
                                          }

                                        }

                                      }
                                    }

                                  }
                                }
                              }

                            }
                          }
                        }
                      }

                    }

                  }

                }


              }

            }





          }
        }

        if (req.params.type === "user") {

          if (req.params.event === "closed") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {


                if (req.params.role !== undefined) {
                  if (parseInt(req.params.role) === UserRole.ADMIN) {

                    if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
                    let id
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.email === req.body.email) {
                        if (Helper.verifyIs("email/super-admin", user.email)) return res.sendStatus(404)
                        id = user.id
                        doc.users.splice(i, 1)
                      }
                    }

                    if (!Helper.stringIsEmpty(id)) {
                      for (let i = 0; i < doc.users.length; i++) {
                        const user = doc.users[i]

                        if (user.children !== undefined) {
                          for (let i = 0; i < user.children.length; i++) {
                            const child = user.children[i]

                            if (child === id) user.children.splice(i, 1)

                          }
                        }

                      }
                    }

                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)

                  }
                }



                let id
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  id = user.id
                  if (user.id === req.jwt.id) {
                    doc.users.splice(i, 1)
                  }
                }

                if (!Helper.stringIsEmpty(id)) {
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.children !== undefined) {
                      for (let i = 0; i < user.children.length; i++) {
                        const child = user.children[i]

                        if (child === id) user.children.splice(i, 1)

                      }
                    }

                  }
                }

                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)


              }

            }


          }

        }

        if (req.params.type === "platform-value") {


          if (req.params.event === "closed") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {

                      if (user["getyour"].expert !== undefined) {

                        if (user["getyour"].expert.name === req.location.expert) {

                          if (user["getyour"].expert.platforms !== undefined) {

                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.values !== undefined) {
                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]
                                  if (value.path === req.body.path) {
                                    platform.values.splice(i, 1)
                                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                    return res.sendStatus(200)
                                  }
                                }
                              }

                            }

                          }

                        }

                      }



                    }
                  }
                }

              }

            }


          }



        }

        if (req.params.type === "platform") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "role") {
                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {

                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {

                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]
                                  if (platform.name === req.body.platform) {


                                    if (platform.roles !== undefined) {
                                      for (let i = 0; i < platform.roles.length; i++) {
                                        const role = platform.roles[i]

                                        if (role.id === req.body.id) {
                                          platform.roles.splice(i, 1)
                                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                          return res.sendStatus(200)
                                        }

                                      }
                                    }




                                  }
                                }

                              }
                            }

                          }

                        }
                      }
                    }
                  }
                }




                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.isReserved(req.body.platform)) throw new Error("reserved word")


                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (user[req.body.platform] !== undefined) user[req.body.platform] = undefined
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {

                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]
                              if (platform.name === req.body.platform) {
                                user["getyour"].expert.platforms.splice(i, 1)
                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }
                            }

                          }
                        }

                      }

                    }
                  }
                }

              }

            }



          }
        }

      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async redirect(req, res, next) {
    try {

      if (req.params.method === "redirect") {
        if (req.params.type === "user") {

          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")

          if (req.params.event === "closed") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {

                    if (Helper.verifyIs("user/getyour-admin", user)) {
                      return res.send("/admin/")
                    }

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name !== undefined) {
                          return res.send(`/${user["getyour"].expert.name}/`)
                        }
                      }
                    }

                    if (user.roles !== undefined) {
                      for (let i = 0; i < user.roles.length; i++) {
                        const roleId = user.roles[i]

                        if (roleId === UserRole.ADMIN) continue
                        if (roleId === UserRole.EXPERT) continue

                        for (let i = 0; i < doc.users.length; i++) {
                          const user = doc.users[i]

                          if (user["getyour"] !== undefined) {
                            if (user["getyour"].expert !== undefined) {
                              if (user["getyour"].expert.name === req.location.expert) {
                                if (user["getyour"].expert.platforms !== undefined) {
                                  for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                    const platform = user["getyour"].expert.platforms[i]

                                    if (platform.name === req.location.platform) {
                                      if (platform.roles !== undefined) {
                                        for (let i = 0; i < platform.roles.length; i++) {
                                          const role = platform.roles[i]

                                          if (role.id === roleId) {
                                            return res.send(role.home)
                                          }

                                        }
                                      }
                                    }

                                  }
                                }
                              }
                            }
                          }

                        }


                      }
                    }




                  }

                }

              }

            }



          }
        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async send(req, res, next) {
    try {

      if (req.params.method === "send") {

        if (req.params.type === "email") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
                if (Helper.stringIsEmpty(req.body.event)) throw new Error("req.body.event is empty")

                const doc = await nano.db.use("getyour").get("users")
                if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
                if (doc.users === undefined) throw new Error("users are undefined")

                if (req.body.event === "welcome/client") {


                  const {jwt} = req

                  let owner
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === jwt.id) {
                      if (user.owner === undefined) throw new Error("owner is undefined")
                      owner = user.owner
                    }

                  }
                  if (owner === undefined) throw new Error("owner not found")

                  await Helper.sendEmailFromDroid({
                    from: "<droid@get-your.de>",
                    to: email,
                    subject: `[${platform}] Willkommen`,
                    html: /*html*/`
                      <div>
                        Die ${Helper.convert("tag/capitalizeFirstLetter", platform)} grüßt Sie herzlich,<br/><br/>

                        Sie wurden von ${owner.firstname} ${owner.lastname} angemeldet, um in Zukunft diverse Angebote von verschiedenen Herstellern zu erhalten - Rund um Eneuerbare Energien. Sobald es neue Angebote gibt, wird sich ${owner.firstname} ${owner.lastname} bei Ihnen melden, damit Sie einfach & schnell vergleichen können.<br/><br/>

                        Viele Grüße<br/>
                        Ihre ${Helper.convert("tag/capitalizeFirstLetter", platform)}<br/><br/>

                        Sicherheitshinweise:<br/>
                        Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de
                      </div>
                    `
                  })
                  return res.sendStatus(200)
                }


                if (req.body.event === "invite/expert") {

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {

                      if (Helper.verifyIs("user/getyour-admin", user)) {

                        await Helper.sendEmailFromDroid({
                          from: "<droid@get-your.de>",
                          to: req.body.email,
                          subject: `[getyour] Einladung`,
                          html: /*html*/`
                            <div>
                              Du wurdest von '${user.email}' eingeladen, als Experte auf unserer Plattform teilzunehmen. <a href="https://www.get-your.de/login/">Du kannst dich ab jetzt hier anmelden.</a><br/><br/>

                              Sicherheitshinweise:<br/>
                              Solltest du nicht wissen, warum du diese E-Mail erhälst, dann kontaktiere uns bitte umgehend unter datenschutz@get-your.de<br/><br/>
                              Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicke in dem Fall auf keine Links, antworte nicht dem Absender und kontaktiere uns sofort unter datenschutz@get-your.de
                            </div>
                          `
                        })
                        return res.sendStatus(200)

                      }

                    }


                  }

                }




                if (req.body.event === "/register/seller/") {

                  await Helper.sendEmailFromDroid({
                    from: "<droid@get-your.de>",
                    to: email,
                    subject: "[getyour plattform] Angebot freigeschaltet",
                    html: /*html*/`
                      <p>Ihr Promoter hat Sie in die Liste seiner Verkäufer erfolgreich hinzugefügt. <a href="https://www.get-your.de/felix/ep/hersteller-vergleich/4/">Das Angebot wird ab sofort hier zur Verfügung stehen.</a></p>
                      <p>Sollten Sie nicht wissen, warum Sie diese E-Mail erhalten, dann hat ein unbekannter Zugang zu Ihrer E-Mail Adresse. In dem Fall, kontaktieren Sie uns umgehend unter datenschutz@get-your.de und lassen Sie Ihren Zugang sperren.</p>
                      <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
                    `
                  })
                  return res.sendStatus(200)

                }

              }
            }





          }
        }

      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyUrlId(req, res, next) {
    try {

      const role = parseInt(req.params.role)
      if (Helper.numberIsEmpty(role)) throw new Error("role is empty")
      if (role === UserRole.SELLER) {

        if (req.params.event === "closed") {

          {
            const {urlId} = req.body
            if (urlId !== undefined) {

              if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
              const doc = await nano.db.use("getyour").get("users")
              if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
              if (doc.users === undefined) throw new Error("users are undefined")

              const {jwt} = req
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === jwt.id) {
                  for (let i = 0; i < user.clients.length; i++) {
                    if (user.clients[i].id === urlId) {
                      return next()
                    }
                  }
                }
              }
            }
          }
        }

        {
          const {urlId} = req.params
          if (urlId !== undefined) {

            if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")

            const {jwt} = req
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.id === jwt.id) {
                for (let i = 0; i < user.clients.length; i++) {
                  if (user.clients[i].id === urlId) {
                    return next()
                  }
                }
              }

            }
          }
        }

      }

      throw new Error("url id is not a client")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async register(req, res, next) {
    try {

      if (req.params.method === "register") {

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")

        if (req.params.type === "match-maker") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "condition") {

                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                    if (Helper.stringIsEmpty(req.body.left)) throw new Error("req.body.left is empty")
                    if (Helper.stringIsEmpty(req.body.operator)) throw new Error("req.body.operator is empty")
                    if (Helper.stringIsEmpty(req.body.right)) throw new Error("req.body.right is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform["match-maker"] !== undefined) {
                                    for (let i = 0; i < platform["match-maker"].length; i++) {
                                      const matchMaker = platform["match-maker"][i]

                                      if (matchMaker.created === req.body.id) {
                                        if (matchMaker.conditions === undefined) matchMaker.conditions = []

                                        const map = {}
                                        map.created = Date.now()
                                        map.left = req.body.left
                                        map.operator = req.body.operator
                                        map.right = req.body.right

                                        matchMaker.conditions.unshift(map)
                                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                        return res.sendStatus(200)

                                      }

                                    }
                                  }

                                }
                              }
                            }
                          }
                        }
                      }

                    }

                  }
                }
              }
            }
          }
        }

        if (req.params.type === "location-list") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                if (Helper.objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {

                      if (user[req.location.platform][req.body.tag] === undefined) user[req.location.platform][req.body.tag] = []

                      const map = {}
                      map.created = Date.now()
                      map.tag = req.body.tag
                      map.funnel = req.body.map

                      user[req.location.platform][req.body.tag].unshift(map)

                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })

                      return res.sendStatus(200)
                    }
                  }

                }

              }
            }
          }
        }

        if (req.params.type === "feedback") {

          if (req.params.event === "location") {
            if (req.location !== undefined) {


              if (req.body.type !== undefined) {
                if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                if (req.body.type === "script") {

                  if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                  if (Helper.stringIsEmpty(req.body.content)) throw new Error("req.body.content is empty")
                  if (Helper.stringIsEmpty(req.body.importance)) throw new Error("req.body.importance is empty")

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].scripts !== undefined) {

                        for (let i = 0; i < user["getyour"].scripts.length; i++) {
                          const script = user["getyour"].scripts[i]

                          if (script.id === req.body.id) {
                            if (script.feedback === undefined) script.feedback = []

                            const map = {}
                            map.id = Date.now()

                            map.content = req.body.content
                            map.importance = req.body.importance

                            script.feedback.unshift(map)

                            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                            return res.sendStatus(200)
                          }
                        }


                      }
                    }

                  }

                }

                if (req.body.type === "html-value") {

                  if (Helper.stringIsEmpty(req.body.content)) throw new Error("req.body.content is empty")
                  if (Helper.stringIsEmpty(req.body.importance)) throw new Error("req.body.importance is empty")

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user["getyour"] !== undefined) {

                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.name === req.location.platform) {
                                if (platform.values !== undefined) {
                                  for (let i = 0; i < platform.values.length; i++) {
                                    const value = platform.values[i]

                                    if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {


                                      if (value.feedback === undefined) value.feedback = []

                                      const map = {}
                                      map.id = Date.now()

                                      map.content = req.body.content
                                      map.importance = req.body.importance

                                      value.feedback.unshift(map)

                                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                      return res.sendStatus(200)


                                    }

                                  }
                                }
                              }

                            }
                          }
                        }
                      }

                    }

                  }

                }

              }


            }
          }

        }

        if (req.params.type === "template") {
          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {

              if (req.body.type !== undefined) {
                if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")


                if (req.body.type === "script") {
                  if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                  if (Helper.stringIsEmpty(req.body.script)) throw new Error("req.body.script is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.templates !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                              const template = user["getyour"].expert.templates[i]

                              if (template.id === req.body.id) {
                                template.script = req.body.script

                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }

                            }
                          }
                        }
                      }
                    }

                  }
                }



                if (req.body.type === "description") {
                  if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                  if (Helper.stringIsEmpty(req.body.description)) throw new Error("req.body.description is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]


                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.templates !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                              const template = user["getyour"].expert.templates[i]

                              if (template.id === req.body.id) {
                                template.description = req.body.description

                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }

                            }
                          }
                        }
                      }
                    }

                  }
                }



                if (req.body.type === "dependencies") {
                  if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                  if (Helper.stringIsEmpty(req.body.dependencies)) throw new Error("req.body.dependencies is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]


                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.templates !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                              const template = user["getyour"].expert.templates[i]

                              if (template.id === req.body.id) {
                                template.dependencies = req.body.dependencies

                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }

                            }
                          }
                        }
                      }
                    }

                  }
                }



                if (req.body.type === "alias") {
                  if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                  if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]


                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.templates !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                              const template = user["getyour"].expert.templates[i]

                              if (template.id === req.body.id) {
                                template.alias = req.body.alias

                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }

                            }
                          }
                        }
                      }
                    }

                  }
                }



                if (req.body.type === "id") {
                  if (Helper.stringIsEmpty(req.body.old)) throw new Error("req.body.old is empty")
                  if (Helper.stringIsEmpty(req.body.new)) throw new Error("req.body.new is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]


                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.templates !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                              const template = user["getyour"].expert.templates[i]

                              if (template.id === req.body.old) {
                                template.id = req.body.new

                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }

                            }
                          }
                        }
                      }
                    }

                  }
                }



              }

              if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
              if (Helper.stringIsEmpty(req.body.script)) throw new Error("req.body.script is empty")

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {

                  if (user["getyour"] !== undefined) {

                    if (user["getyour"].expert !== undefined) {

                      if (user["getyour"].expert.name === req.location.expert) {

                        if (user["getyour"].expert.templates === undefined) user["getyour"].expert.templates = []
                        const template = {}
                        template.alias = req.body.alias
                        template.id = req.body.id
                        template.created = Date.now()
                        template.script = req.body.script

                        user["getyour"].expert.templates.unshift(template)

                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }

                    }


                  }


                }
              }

            }


          }
        }

        if (req.params.type === "user") {
          if (req.params.event === "open") {

            if (req.body.type !== undefined) {
              if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")


              if (req.body.type === "verified") {


                if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.email === req.body.email) {
                    user.verified = true
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }
                }


              }




            }



          }
        }

        if (req.params.type === "platform-value") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "html") {
                    if (Helper.stringIsEmpty(req.body.html)) throw new Error("req.body.html is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {

                        if (user["getyour"] !== undefined) {

                          if (user["getyour"].expert !== undefined) {

                            if (user["getyour"].expert.name === req.location.expert) {


                              if (user["getyour"].expert.platforms !== undefined) {

                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]
                                  if (platform.name === req.location.platform) {

                                    if (platform.values !== undefined) {

                                      for (let i = 0; i < platform.values.length; i++) {
                                        const value = platform.values[i]
                                        if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                                          value.html = req.body.html
                                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                          return res.sendStatus(200)
                                        }
                                      }

                                    }


                                  }
                                }

                              }

                            }

                          }



                        }


                      }
                    }
                  }

                  if (req.body.type === "new") {
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                    if (req.body.logo === undefined) throw new Error("req.body.logo is undefined")
                    if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                    if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
                    if (Helper.stringIsEmpty(req.body.lang)) throw new Error("req.body.lang is empty")

                    const {location} = req.body
                    if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
                    const loc = new URL(location)
                    if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
                    const url = {}
                    url.expert = loc.pathname.split("/")[1]

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === jwt.id) {

                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert.name === url.expert) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]
                              if (platform.name === req.body.platform) {

                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]
                                  if (value.path === `/${req.body.platform}/${url.expert}/${req.body.path}/`) throw new Error("value.path exist")
                                }

                                const value = {}
                                value.id = Helper.digest(`${Date.now()}`)
                                value.created = Date.now()
                                value.path = `/${req.body.platform}/${user["getyour"].expert.name}/${req.body.path}/`
                                value.alias = req.body.alias
                                value.logo = req.body.logo
                                value.lang = req.body.lang
                                value.visibility = "closed"
                                value.roles = []
                                value.authorized = []
                                value.type = "text/html"
                                value.html = Helper.readFileSyncToString("../lib/value-units/toolbox.html")
                                platform.values.unshift(value)
                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)

                              }
                            }
                          }
                        }

                      }
                    }
                  }

                  if (req.body.type === "path") {
                    if (Helper.stringIsEmpty(req.body.oldPath)) throw new Error("req.body.oldPath is empty")
                    if (Helper.stringIsEmpty(req.body.newPath)) throw new Error("req.body.newPath is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {

                        if (user["getyour"] !== undefined) {

                          if (user["getyour"].expert !== undefined) {

                            if (user["getyour"].expert.name === req.location.expert) {


                              if (user["getyour"].expert.platforms !== undefined) {

                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]


                                  for (let i = 0; i < platform.values.length; i++) {
                                    const value = platform.values[i]
                                    if (value.path === req.body.oldPath) {
                                      value.path = `/${user["getyour"].expert.name}/${platform.name}/${req.body.newPath}/`
                                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                      return res.sendStatus(200)
                                    }
                                  }


                                }

                              }


                            }

                          }


                        }

                      }
                    }
                  }

                  if (req.body.type === "alias") {
                    if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
                    if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {

                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {

                              if (user["getyour"].expert.platforms !== undefined) {

                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.values !== undefined) {
                                    for (let i = 0; i < platform.values.length; i++) {
                                      const value = platform.values[i]
                                      if (value.path === req.body.path) {
                                        value.alias = req.body.alias
                                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                        return res.sendStatus(200)
                                      }
                                    }
                                  }

                                }

                              }




                            }
                          }
                        }




                      }
                    }
                  }

                  if (req.body.type === "image") {
                    if (Helper.objectIsEmpty(req.body.image)) throw new Error("req.body.image is empty")
                    if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {


                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {


                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.values !== undefined) {
                                    for (let i = 0; i < platform.values.length; i++) {
                                      const value = platform.values[i]
                                      if (value.path === req.body.path) {
                                        value.image = req.body.image
                                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                        return res.sendStatus(200)
                                      }
                                    }

                                  }



                                }

                              }




                            }

                          }
                        }



                      }
                    }
                  }

                  if (req.body.type === "lang") {
                    if (Helper.stringIsEmpty(req.body.lang)) throw new Error("req.body.lang is empty")
                    if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {

                        if (user["getyour"] !== undefined) {

                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {


                              if (user["getyour"].expert.platforms !== undefined) {

                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.values !== undefined) {
                                    for (let i = 0; i < platform.values.length; i++) {
                                      const value = platform.values[i]
                                      if (value.path === req.body.path) {
                                        value.lang = req.body.lang
                                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                        return res.sendStatus(200)
                                      }
                                    }
                                  }
                                }

                              }



                            }

                          }


                        }



                      }
                    }
                  }

                  if (req.body.type === "visibility") {
                    if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                    if (Helper.stringIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {

                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {

                            if (user["getyour"].expert.name === req.location.expert) {



                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.values !== undefined) {
                                    for (let i = 0; i < platform.values.length; i++) {
                                      const value = platform.values[i]
                                      if (value.path === req.body.path) {

                                        if (req.body.visibility === "open") {
                                          value.visibility = req.body.visibility
                                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                          return res.sendStatus(200)
                                        }

                                        if (req.body.visibility === "closed") {
                                          value.visibility = req.body.visibility
                                          value.roles = req.body.roles
                                          value.authorized = req.body.authorized
                                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                          return res.sendStatus(200)
                                        }

                                      }
                                    }
                                  }
                                }
                              }


                            }

                          }
                        }

                      }
                    }
                  }

                }



                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
                // if (Helper.stringIsEmpty(req.body.lang)) throw new Error("req.body.lang is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {

                    if (user["getyour"] !== undefined) {

                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]
                            if (platform.name === req.body.platform) {

                              if (platform.values !== undefined) {
                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]
                                  if (value.path === `/${req.location.expert}/${req.body.platform}/${req.body.path}/`) throw new Error("value.path exist")
                                }
                              }

                              const value = {}
                              value.id = Helper.digest(`${Date.now()}`)
                              value.created = Date.now()
                              value.path = `/${user["getyour"].expert.name}/${platform.name}/${req.body.path}/`
                              value.alias = req.body.alias
                              // if (req.body.image !== undefined) value.image = req.body.image
                              // value.lang = req.body.lang
                              value.visibility = "closed"
                              value.roles = []
                              value.authorized = []
                              value.type = "text/html"
                              value.html = Helper.readFileSyncToString("../lib/value-units/toolbox.html")


                              if (platform.values === undefined) platform.values = []
                              platform.values.unshift(value)
                              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                              return res.sendStatus(200)

                            }
                          }
                        }
                      }


                    }

                  }
                }

              }

            }


          }
        }

        if (req.params.type === "expert") {

          if (req.params.role !== undefined) {

            if (req.params.event === "closed") {

              if (req.location !== undefined) {

                if (req.jwt !== undefined) {

                  if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
                  if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const child = doc.users[i]

                    if (child.email === req.body.email) {

                      if (child["getyour"] !== undefined) {
                        if (child["getyour"].expert !== undefined) {
                          if (child["getyour"].expert.name !== undefined) {
                            throw new Error("expert exist")
                          }
                        }
                      }

                      let found = false
                      for (let i = 0; i < child.roles.length; i++) {
                        if (child.roles[i] === req.body.id) {
                          found = true
                          break
                        }
                      }
                      if (found === true) throw new Error("role exist")
                      if (found === false) {

                        if (child["getyour"] === undefined) child["getyour"] = {}
                        if (child["getyour"].expert === undefined) child["getyour"].expert = {}
                        child["getyour"].expert.type = "role"
                        child["getyour"].expert.name = req.body.name


                        if (!Helper.verify("role/exist", UserRole.EXPERT, child.roles)) {
                          child.roles.push(UserRole.EXPERT)
                        }

                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }

                  {
                    const child = {}
                    child.id =  Helper.digest(JSON.stringify({email: req.body.email, verified: true})),
                    child.email = req.body.email
                    child.verified =  false
                    child.created =  Date.now()
                    child.reputation = 0

                    child.roles =  []
                    child["getyour"] = {}
                    child["getyour"].expert = {}
                    child["getyour"].expert.type = "role"
                    child["getyour"].expert.name = req.body.name

                    if (!Helper.verify("role/exist", UserRole.EXPERT, child.roles)) {
                      child.roles.push(UserRole.EXPERT)
                    }

                    doc.users.push(child)

                    for (let i = 0; i < doc.users.length; i++) {
                      const parent = doc.users[i]

                      if (parent.id === req.jwt.id) {

                        child.parent = parent.id

                        if (parent.children === undefined) parent.children = []

                        for (let i = 0; i < parent.children.length; i++) {
                          const expertChild = parent.children[i]
                          if (expertChild === child.id) throw new Error("child exist")
                        }

                        parent.children.unshift(child.id)
                        break

                      }

                    }
                  }

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }

            }

          }

        }

        if (req.params.type === "admin") {

          if (req.params.event === "location") {

            if (req.location !== undefined) {

              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              if (Helper.verifyIs("email/super-admin", req.body.email)) {

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.email === req.body.email) {

                    let found = false
                    for (let i = 0; i < user.roles.length; i++) {
                      if (user.roles[i] === UserRole.ADMIN) {
                        found = true
                        break
                      }
                    }

                    if (found === true) return res.sendStatus(200)
                    if (found === false) {

                      if (user["getyour"] === undefined) user["getyour"] = {}
                      user["getyour"].admin = {}
                      user["getyour"].admin.type = "role"
                      user.roles.push(UserRole.ADMIN)

                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }

                  }

                }

                {
                  const user = {}
                  user.id =  Helper.digest(JSON.stringify({email: req.body.email, verified: true})),
                  user.email = req.body.email
                  user.verified = true
                  user.reputation = 0
                  user.created =  Date.now()

                  user["getyour"] = {}
                  user["getyour"].admin = {}
                  user["getyour"].admin.type = "role"
                  user.roles =  []
                  user.roles.push(UserRole.ADMIN)

                  doc.users.push(user)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }

            }



          }

        }

        if (req.params.type === "email") {

          if (req.params.event === "location") {

            if (req.location !== undefined) {

              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")

              if (req.body.email.endsWith("@get-your.de")) {

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.email === req.body.email) {

                    let found = false
                    for (let i = 0; i < user.roles.length; i++) {
                      if (user.roles[i] === UserRole.ADMIN) {
                        found = true
                        break
                      }
                    }

                    if (found === true) return res.sendStatus(200)
                    if (found === false) {
                      if (user["getyour"] === undefined) user["getyour"] = {}
                      user["getyour"].admin = {}
                      user["getyour"].admin.type = "role"
                      user.verified = true
                      user.roles.push(UserRole.ADMIN)
                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }

                  }

                }

                {
                  const user = {}
                  user.id =  Helper.digest(JSON.stringify({email: req.body.email, verified: true})),
                  user.email = req.body.email
                  user.verified = true
                  user.reputation = 0
                  user.created =  Date.now()
                  user["getyour"] = {}
                  user["getyour"].admin = {}
                  user["getyour"].admin.type = "role"
                  user.roles =  []
                  user.roles.push(UserRole.ADMIN)
                  doc.users.push(user)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }

              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")

              for (let i = 0; i < doc.users.length; i++) {
                const child = doc.users[i]

                if (child.email === req.body.email) {
                  let found = false
                  for (let i = 0; i < child.roles.length; i++) {
                    if (child.roles[i] === req.body.id) {
                      found = true
                      break
                    }
                  }
                  if (found === true) return res.sendStatus(200)
                  if (found === false) {

                    if (child[req.location.platform] === undefined) child[req.location.platform] = {}
                    if (child[req.location.platform][req.body.name] === undefined) child[req.location.platform][req.body.name] = {}
                    child[req.location.platform][req.body.name].type = "role"
                    child.roles.push(req.body.id)

                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }
                }
              }

              {
                const child = {}
                child.id =  Helper.digest(JSON.stringify({email: req.body.email, verified: true})),
                child.email = req.body.email
                child.verified =  false
                child.created =  Date.now()
                child.reputation = 0

                child.roles =  []
                child[req.location.platform] = {}
                child[req.location.platform][req.body.name] = {}
                child[req.location.platform][req.body.name].type = "role"
                child.roles.push(req.body.id)

                doc.users.push(child)

                for (let i = 0; i < doc.users.length; i++) {
                  const parent = doc.users[i]


                  if (parent["getyour"] !== undefined) {
                    if (parent["getyour"].expert !== undefined) {
                      if (parent["getyour"].expert.name === req.location.expert) {
                        child.parent = parent.id

                        if (parent.children === undefined) parent.children = []

                        for (let i = 0; i < parent.children.length; i++) {
                          const expertChild = parent.children[i]
                          if (expertChild === child.id) throw new Error("child exist")
                        }

                        parent.children.unshift(child.id)
                        break

                      }
                    }
                  }

                }
              }

              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }



          }

        }

        if (req.params.type === "platform") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "match-maker") {
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                    if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.name === req.body.platform) {
                                    if (platform["match-maker"] === undefined) platform["match-maker"] = []

                                    const map = {}
                                    map.name = req.body.name
                                    map.created = Date.now()

                                    platform["match-maker"].unshift(map)
                                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                    return res.sendStatus(200)


                                  }

                                }
                              }
                            }
                          }
                        }
                      }

                    }

                  }

                  if (req.body.type === "role") {
                    if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.name === req.body.platform) {
                                    if (platform.roles === undefined) platform.roles = []

                                    const role = {}
                                    role.id = Date.now()
                                    role.name = req.body.tag

                                    platform.roles.unshift(role)
                                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                    return res.sendStatus(200)
                                  }



                                }
                              }
                            }
                          }
                        }
                      }

                    }

                  }

                  if (req.body.type === "new") {

                    const url = {}
                    url.expert = new URL(req.body.location).pathname.split("/")[1]
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert.platforms !== undefined) {
                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            if (user["getyour"].expert.platforms[i].name === req.body.platform) throw new Error("req.body.platform exist")
                          }
                        }
                      }
                    }

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === jwt.id) {
                        if (user[req.body.platform] === undefined) user[req.body.platform] = {}
                        if (user["getyour"].expert.platforms === undefined) throw new Error("platforms is undefined")

                        if (user["getyour"].expert.name === url.expert) {
                          const map = {}
                          map.id = Helper.digest(`${Date.now()}`)
                          map.name = req.body.platform
                          map.logo = req.body.logo
                          map.created = Date.now()
                          map.visibility = "closed"

                          map.values = []
                          const value = {}
                          value.id = Helper.digest(`${Date.now()}`)
                          value.created = Date.now()
                          value.path = `/${req.body.platform}/${user["getyour"].expert.name}/meine-erste-werteinheit/`
                          value.alias = "Meine erste Werteinheit"
                          value.logo = "/public/stars.svg"
                          value.lang = "de"
                          value.visibility = "closed"
                          value.roles = []
                          value.authorized = []
                          value.type = "text/html"
                          value.html = Helper.readFileSyncToString("../lib/value-units/toolbox.html")
                          map.values.push(value)

                          user["getyour"].expert.platforms.push(map)
                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                          return res.sendStatus(200)
                        }


                      }
                    }

                  }

                  if (req.body.type === "name") {
                    if (Helper.stringIsEmpty(req.body.newPlatform)) throw new Error("req.body.newPlatform is empty")
                    if (Helper.stringIsEmpty(req.body.oldPlatform)) throw new Error("req.body.oldPlatform is empty")

                    const reservedWords = Helper.getReservedWords()
                    for (let i = 0; i < reservedWords.length; i++) {
                      const word = reservedWords[i]
                      if (req.body.newPlatform === word) throw new Error("platform exist")
                    }

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {

                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.name === req.location.expert) {


                            if (user["getyour"].expert.platforms !== undefined) {
                              for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                const platform = user["getyour"].expert.platforms[i]

                                if (platform.name === req.body.oldPlatform) {
                                  if (platform.values !== undefined) {
                                    for (let i = 0; i < platform.values.length; i++) {
                                      const value = platform.values[i]
                                      value.path = `/${user["getyour"].expert.name}/${req.body.newPlatform}/${value.path.split("/")[3]}/`
                                    }
                                  }
                                  platform.name = req.body.newPlatform
                                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                  return res.sendStatus(200)
                                }
                              }

                            }


                          }

                        }
                      }
                    }
                  }

                  if (req.body.type === "image") {
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                    if (Helper.objectIsEmpty(req.body.image)) throw new Error("req.body.image is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.id === req.jwt.id) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.name === req.location.expert) {

                            if (user["getyour"].expert.platforms !== undefined) {
                              for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                const platform = user["getyour"].expert.platforms[i]
                                if (platform.name === req.body.platform) {
                                  platform.image = req.body.image
                                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                  return res.sendStatus(200)
                                }
                              }

                            }

                          }

                        }
                      }
                    }
                  }

                  if (req.body.type === "visibility") {
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                    if (Helper.stringIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {

                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]
                                  if (platform.name === req.body.platform) {
                                    platform.visibility = req.body.visibility
                                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                    return res.sendStatus(200)
                                  }
                                }

                              }

                            }

                          }
                        }
                      }

                    }

                  }

                }

                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {

                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          if (user["getyour"].expert.platforms[i].name === req.body.platform) throw new Error("req.body.platform exist")
                        }
                      }

                    }
                  }
                }

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {


                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {

                          if (user["getyour"].expert.platforms === undefined) user["getyour"].expert.platforms = []
                          if (user[req.body.platform] === undefined) user[req.body.platform] = {}

                          const map = {}
                          map.name = req.body.platform
                          map.id = Helper.digest(`${Date.now()}`)
                          map.created = Date.now()
                          map.visibility = "closed"

                          if (req.body.image !== undefined) {
                            if (Helper.objectIsEmpty(req.body.image)) throw new Error("req.body.image is empty")
                            map.image = req.body.image
                          }

                          user["getyour"].expert.platforms.push(map)
                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                          return res.sendStatus(200)
                        }
                      }
                    }

                  }
                }

              }

            }


          }
        }

        if (req.params.type === "verified") {

          if (req.params.event === "open") {

            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users is undefined")

            const {state} = req.body
            if (Helper.booleanIsEmpty(state)) throw new Error("state is empty")

            const {email} = req.body

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.email === email) {
                user.verified = state
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }
            }

          }





          if (req.params.event === "closed") {
            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users is undefined")
            const {jwt} = req
            const {state} = req.body
            if (Helper.booleanIsEmpty(state)) throw new Error("state is empty")

            const {email} = req.body
            if (email !== undefined) {
              if (Helper.stringIsEmpty(email)) throw new Error("email is empty")

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.email === email) {
                  user.verified = state
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }
            }



            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.id === jwt.id) {
                user.verified = state
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }
            }
          }

          if (req.params.event === "verified") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (req.params.role !== undefined) {
                  if (parseInt(req.params.role) === UserRole.ADMIN) {

                    if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
                    if (Helper.booleanIsEmpty(req.body.verified)) throw new Error("req.body.verified is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {

                        if (Helper.verifyIs("email/super-admin", user.email)) {

                          if (user.verified === true) {

                            for (let i = 0; i < doc.users.length; i++) {
                              const user = doc.users[i]

                              if (user.email === req.body.email) {
                                if (Helper.verifyIs("email/super-admin", user.email)) return res.sendStatus(404)
                                user.verified = req.body.verified
                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                return res.sendStatus(200)
                              }

                            }

                          }

                        }


                      }

                    }



                  }
                }

              }
            }

          }
        }

        if (req.params.type === "seller") {
          if (req.params.event === "closed") {

            const {jwt} = req
            const {id} = req.body

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user.seller === undefined) user.seller = []
                const map = {}
                map.id = id
                map.state = "active"
                user.seller.push(map)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }

            }

          }
        }

        if (req.params.type === "name") {
          if (req.params.event === "closed") {

            const {email} = req.body
            if (email !== undefined) {
              if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
              const {name} = req.body
              if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
              const doc = await nano.db.use("getyour").get("users")
              if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
              if (doc.users === undefined) throw new Error("users is undefined")

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.email === email) {
                  if (user.expert.name === undefined) user.expert.name = {}
                  user.expert.name = name
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }



              }

            }
          }
        }

        if (req.params.type === "preference") {
          if (req.params.event === "closed") {
            const {contact} = req.body
            const {jwt} = req

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user.preference === undefined) user.preference = {}
                if (!Helper.stringIsEmpty(contact)) user.preference.contact = contact

                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }
            }

          }
        }

        if (req.params.type === "funnel") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.objectIsEmpty(req.body.funnel)) throw new Error("req.body.funnel is empty")
                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] === undefined) user[req.location.platform] = {}
                    if (user[req.location.platform][req.body.tag] === undefined) user[req.location.platform][req.body.tag] = {}
                    user[req.location.platform][req.body.tag].type = "funnel"

                    for (const [key, value] of Object.entries(req.body.funnel)) {
                      if (key === "type") continue
                      user[req.location.platform][req.body.tag][key] = value
                    }

                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }

                }

              }
            }


          }
        }

        if (req.params.type === "services") {
          if (req.params.event === "closed") {

            const {jwt} = req
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {

                if (user.offer === undefined) user.offer = {}

                const {services} = req.body
                if (!Helper.arrayIsEmpty(services)) {
                  for (let i = 0; i < services.length; i++) {
                    const service = services[i]

                    for (let i = 0; i < user.offer.services.length; i++) {
                      const name = user.offer.services[i].name

                      if (service.name === name) {
                        service.price = price
                        service.selected = selected

                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }

                    }

                  }

                  // user.offer.services = services
                }

              }

            }
            throw new Error("user not found")
          }
        }

        if (req.params.type === "company") {
          if (req.params.event === "closed") {

            const {jwt} = req

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {

                const {name, website, sector, logo} = req.body
                console.log(logo);

                if (user.company === undefined) user.company = {}

                if (!Helper.stringIsEmpty(name)) user.company.name = name
                if (!Helper.stringIsEmpty(website)) user.company.website = website
                if (!Helper.stringIsEmpty(sector)) user.company.sector = sector
                if (!Helper.objectIsEmpty(logo)) user.company.logo = logo

                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }

            }
            throw new Error("user not found")
          }



        }

        if (req.params.type === "offer") {
          if (req.params.event === "closed") {

            const {type} = req.body
            if (type !== undefined) {
              if (Helper.stringIsEmpty(type)) throw new Error("type is empty")

              if (type === "verified") {
                const {email, status, reason} = req.body
                if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
                if (Helper.numberIsEmpty(status)) throw new Error("status is empty")
                if (Helper.stringIsEmpty(reason)) throw new Error("reason is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.email === email) {
                    if(user.offer === undefined) throw new Error("offer is undefined")
                    user.offer.verified = {}
                    user.offer.verified.status = status
                    user.offer.verified.reason = reason
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }

                }
              }



              if (type === "service") {
                const {jwt} = req

                const {name, units, price, selected} = req.body
                if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
                if (Helper.numberIsEmpty(parseInt(units))) throw new Error("units is empty")
                if (Helper.numberIsEmpty(parseInt(price))) throw new Error("price is empty")
                if (Helper.booleanIsEmpty(selected)) throw new Error("selected is empty")


                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === jwt.id) {

                    if (user.offer === undefined) user.offer = {}
                    if (user.offer.services === undefined) user.offer.services = []

                    for (let i = 0; i < user.offer.services.length; i++) {
                      const service = user.offer.services[i]

                      if (service.name === name) {
                        service.units = units
                        service.price = price
                        service.selected = selected
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }

                    }

                    const map = {}
                    map.name = name
                    map.units = units
                    map.price = price
                    map.selected = selected
                    user.offer.services.push(map)
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)

                  }

                }
              }

              if (type === "offer") {

                const {jwt} = req
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === jwt.id) {

                    const {visibility, tag, title, description, message, notes, termsPdf, companyPdf, productPdf, discount, vat} = req.body

                    if (user.offer === undefined) user.offer = {}

                    if (!Helper.stringIsEmpty(tag)) user.offer.tag = tag
                    if (!Helper.stringIsEmpty(title)) user.offer.title = title
                    if (!Helper.stringIsEmpty(description)) user.offer.description = description
                    if (!Helper.stringIsEmpty(message)) user.offer.message = message
                    if (!Helper.stringIsEmpty(notes)) user.offer.notes = notes
                    if (!Helper.objectIsEmpty(termsPdf)) user.offer.termsPdf = termsPdf
                    if (!Helper.objectIsEmpty(companyPdf)) user.offer.companyPdf = companyPdf
                    if (!Helper.objectIsEmpty(productPdf)) user.offer.productPdf = productPdf
                    if (!Helper.stringIsEmpty(discount)) user.offer.discount = discount
                    if (!Helper.stringIsEmpty(vat)) user.offer.vat = vat
                    if (!Helper.stringIsEmpty(visibility)) user.offer.visibility = visibility

                    if (user.offer.visibility === "open") {
                      if (user.offer.verified === undefined) user.offer.verified = {}
                      user.offer.verified.status = 500
                      user.offer.verified.reason = "offer changed"
                    }

                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }

                }

              }

            }

            throw new Error("user not found")
          }
        }

        if (req.params.type === "client") {
          if (req.params.event === "closed") {




            const {email} = req.body
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")

            let clientId
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.email === email) {
                clientId = user.id
                break
              }

            }

            if (clientId !== undefined) {
              if (Helper.stringIsEmpty(clientId)) throw new Error("client id is empty")
              const {jwt} = req

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === jwt.id) {
                  if (user.clients === undefined) user.clients = []

                  const client = {}
                  client.id = clientId
                  client.state = "open"

                  user.clients.unshift(client)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }


              }

            }

          }
        }

        if (req.params.type === "lead") {
          if (req.params.event === "closed") {

            const {state, quality, type, role, to, email} = req.body

            if (email !== undefined) {
              if (Helper.stringIsEmpty(email)) throw new Error("email is empty")


              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.email === email) {

                  if (user.lead === undefined) {
                    user.lead = {}
                    user.lead.counter = 0
                  }

                  if (!Helper.stringIsEmpty(state)) user.lead.state = state
                  if (!Helper.stringIsEmpty(to)) user.lead.to = to
                  if (!Helper.stringIsEmpty(quality)) user.lead.quality = quality
                  if (!Helper.stringIsEmpty(type)) user.lead.type = type
                  if (!Helper.stringIsEmpty(role)) user.lead.role = role
                  user.lead.modified = Date.now()
                  user.lead.counter = user.lead.counter + 1
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)

                }

              }
            }




            {
              const {jwt} = req

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === jwt.id) {
                  if (user.lead === undefined) {
                    user.lead = {}
                    user.lead.counter = 0
                  }

                  if (!Helper.stringIsEmpty(state)) user.lead.state = state
                  if (!Helper.stringIsEmpty(to)) user.lead.to = to
                  if (!Helper.stringIsEmpty(quality)) user.lead.quality = quality
                  if (!Helper.stringIsEmpty(type)) user.lead.type = type
                  if (!Helper.stringIsEmpty(role)) user.lead.role = role
                  user.lead.modified = Date.now()
                  user.lead.counter = user.lead.counter + 1
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }




              }
            }








          }
        }

        if (req.params.type === "owner") {
          if (req.params.event === "closed") {

            const {email} = req.body
            if (!Helper.stringIsEmpty(email)) {
              if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
              const {firstname, lastname, street, zip, country, state, phone} = req.body

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.email === email) {
                  if (user.owner === undefined) user.owner = {}
                  if (!Helper.stringIsEmpty(firstname)) user.owner.firstname = firstname
                  if (!Helper.stringIsEmpty(lastname)) user.owner.lastname = lastname
                  if (!Helper.stringIsEmpty(street)) user.owner.street = street
                  if (!Helper.stringIsEmpty(zip)) user.owner.zip = zip
                  if (!Helper.stringIsEmpty(country)) user.owner.country = country
                  if (!Helper.stringIsEmpty(state)) user.owner.state = state
                  if (!Helper.stringIsEmpty(phone)) user.owner.phone = phone

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }



            }

            {
              const {firstname, lastname, street, zip, country, state, phone} = req.body
              if (Helper.stringIsEmpty(firstname)) throw new Error("firstname is empty")
              if (Helper.stringIsEmpty(lastname)) throw new Error("lastname is empty")
              if (Helper.stringIsEmpty(street)) throw new Error("street is empty")
              if (Helper.stringIsEmpty(zip)) throw new Error("zip is empty")
              if (Helper.stringIsEmpty(country)) throw new Error("country is empty")
              if (Helper.stringIsEmpty(state)) throw new Error("state is empty")
              if (Helper.stringIsEmpty(phone)) throw new Error("phone is empty")


              const {jwt} = req

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === jwt.id) {
                  if (user.owner === undefined) user.owner = {}
                  user.owner.firstname = firstname
                  user.owner.lastname = lastname
                  user.owner.street = street
                  user.owner.zip = zip
                  user.owner.country = country
                  user.owner.state = state
                  user.owner.phone = phone
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }

            }
          }



        }

      }


      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verify(req, res, next) {
    try {

      if (req.params.method === "verify") {

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")

        if (req.params.type === "match-maker") {

          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "conditions") {
                    if (Helper.arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")

                    for (let i = 0; i < req.body.conditions.length; i++) {
                      const condition = req.body.conditions[i]

                      for (let i = 0; i < doc.users.length; i++) {
                        const user = doc.users[i]

                        if (user.id === req.jwt.id) {

                          if (Helper.verify("user/tree/exist", user, condition.left) === true) {

                            if (Helper.verify("user/condition", user, condition) === false) {
                              return res.sendStatus(404)
                            }

                          } else {
                            return res.sendStatus(404)
                          }

                        }

                      }

                    }

                    return res.sendStatus(200)


                  }

                }

              }
            }
          }



          if (req.params.event === "open") {

            if (req.body.type !== undefined) {
              if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

              if (req.body.type === "name") {

                if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")

                if (Helper.isReserved(req.body.name)) return res.sendStatus(200)

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]

                          if (platform["match-maker"] !== undefined) {
                            for (let i = 0; i < platform["match-maker"].length; i++) {
                              const matchMaker = platform["match-maker"][i]

                              if (matchMaker.name === req.body.name) {
                                return res.sendStatus(200)
                              }

                            }
                          }

                        }
                      }
                    }
                  }

                }

              }


            }



          }
        }

        if (req.params.type === "template") {
          if (req.params.event === "closed") {


            if (req.body.type === "id/jwt") {
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert !== undefined) {
                    if (user["getyour"].expert.templates !== undefined) {
                      for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                        const template = user["getyour"].expert.templates[i]

                        if (template.id === req.body.id) {
                          if (user.id === req.jwt.id) {
                            return res.sendStatus(200)
                          }
                        }

                      }
                    }
                  }
                }

              }
            }



            if (req.body.type === "id") {
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert !== undefined) {
                    if (user["getyour"].expert.templates !== undefined) {
                      for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                        const template = user["getyour"].expert.templates[i]

                        if (template.id === req.body.id) return res.sendStatus(200)

                      }
                    }
                  }
                }

              }
            }



            // if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
          }
        }

        if (req.params.type === "role") {
          if (req.params.event = "closed") {
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.id === req.jwt.id) {
                for (let i = 0; i < user.roles.length; i++) {
                  const role = user.roles[i]
                  if (role === parseInt(req.params.role)) {
                    return res.sendStatus(200)
                  }
                }
              }
            }
          }
        }

        if (req.params.type === "platform-value") {

          if (req.params.event === "open") {

            if (req.body.type !== undefined) {
              if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

              if (req.body.type === "path") {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user["getyour"] !== undefined) {

                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.platforms !== undefined) {

                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]


                          if (platform.values !== undefined) {
                            for (let i = 0; i < platform.values.length; i++) {
                              const value = platform.values[i]
                              if (value.path === req.body.path) {
                                return res.sendStatus(200)
                              }
                            }
                          }

                        }

                      }
                    }



                  }

                }
              }

              if (req.body.type === "alias") {
                if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                const {location} = req.body
                if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
                const loc = new URL(location)
                if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
                const url = {}
                url.expert = loc.pathname.split("/")[1]

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert.name === url.expert) {

                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {

                            for (let i = 0; i < platform.values.length; i++) {
                              const value = platform.values[i]
                              if (value.alias === req.body.alias) {
                                return res.sendStatus(200)
                              }
                            }
                          }

                        }
                      }
                    }
                  }

                }
              }

            }

          }




        }

        if (req.params.type === "owner") {
          if (req.params.event === "closed") {
            const {jwt} = req

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user.owner === undefined) throw new Error("owner is undefined")
                if (user.owner.firstname === undefined) throw new Error("owner.firstname is undefined")
                if (user.owner.lastname === undefined) throw new Error("owner.lastname is undefined")
                if (user.owner.street === undefined) throw new Error("owner.street is undefined")
                if (user.owner.zip === undefined) throw new Error("owner.zip is undefined")
                if (user.owner.country === undefined) throw new Error("owner.country is undefined")
                if (user.owner.state === undefined) throw new Error("owner.state is undefined")
                if (user.owner.phone === undefined) throw new Error("owner.phone is undefined")
                return res.sendStatus(200)
              }

            }
          }
        }

        if (req.params.type === "platform") {

          if (req.params.event === "open") {

            if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user["getyour"] !== undefined) {
                if (user["getyour"].expert !== undefined) {
                  if (user["getyour"].expert.platforms !== undefined) {
                    for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                      const platform = user["getyour"].expert.platforms[i]
                      if (platform.name === req.body.platform) return res.sendStatus(200)
                    }
                  }
                }
              }
            }

            if (req.body.platform === "getyour") {
              let found = false
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert !== undefined) {
                    if (user["getyour"].expert.platforms !== undefined) {
                      for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                        const platform = user["getyour"].expert.platforms[i]
                        if (platform.name === req.body.platform) {
                          found = true
                          break
                        }
                      }
                    }
                  }
                }
              }

              if (found === true) return res.sendStatus(200)
              if (found === false) return res.sendStatus(404)

            }

            if (Helper.isReserved(req.body.platform)) return res.sendStatus(200)

          }

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {

              if (req.body.type !== undefined) {
                if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")


                if (req.body.type === "role/name") {

                  if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                  if (Helper.isReserved(req.body.name)) return res.sendStatus(200)

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.name === req.body.platform) {
                                // console.log(platform.roles);

                                if (platform.roles !== undefined) {
                                  for (let i = 0; i < platform.roles.length; i++) {
                                    const role = platform.roles[i]

                                    // console.log(role.name);
                                    // console.log(req.body.name);
                                    if (role.name === req.body.name) return res.sendStatus(200)

                                  }
                                }

                              }


                            }
                          }
                        }
                      }
                    }

                  }
                }


                if (req.body.type === "role") {
                  if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")

                  if (Helper.isReserved(req.body.name)) return res.sendStatus(200)

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.roles !== undefined) {
                                for (let i = 0; i < platform.roles.length; i++) {
                                  const role = platform.roles[i]

                                  if (role.name === req.body.name) return res.sendStatus(200)

                                }
                              }

                            }
                          }
                        }
                      }
                    }

                  }
                }
              }

            }

          }

        }

        if (req.params.type === "email") {

          if (req.params.event === "closed") {


            if (req.jwt !== undefined) {

              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === req.jwt.id) {
                  if (user.email === req.body.email) {
                    return res.sendStatus(200)
                  }
                }

              }

            }


          }

        }

        if (req.params.type === "seller") {
          if (req.params.event === "closed") {
            const {jwt} = req

            const {type} = req.body
            if (type !== undefined) {
              if (Helper.stringIsEmpty(type)) throw new Error("type is empty")

              if (type === "owner") {
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === jwt.id) {
                    for (let i = 0; i < user.roles.length; i++) {
                      const role = user.roles[i]

                      if (role === UserRole.SELLER) {
                        if (user.owner === undefined) throw new Error("owner is undefined")
                        return res.sendStatus(200)
                      }

                    }
                  }

                }
              }
            }

            const {state} = req.body
            if (state !== undefined) {
              if (Helper.stringIsEmpty(state)) throw new Error("state is empty")

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]


                if (user[platform] !== undefined) {
                  for (let i = 0; i < user.roles.length; i++) {
                    const role = user.roles[i]

                    if (role === UserRole.PROMOTER) {
                      for (let i = 0; i < user.seller.length; i++) {
                        const seller = user.seller[i]

                        if (jwt.id === seller.id) {
                          if (seller.state === state) {
                            return res.sendStatus(200)
                          }
                        }

                      }
                    }

                  }
                }

              }
            }







          }
        }

        if (req.params.type === "offer") {
          if (req.params.event === "closed") {

            const {state} = req.body
            if (Helper.stringIsEmpty(state)) throw new Error("state is empty")

            if (state === "complete") {
              // const doc = await nano.db.use("getyour").get("users")
              // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
              // if (doc.users === undefined) throw new Error("users is undefined")
              const {jwt} = req
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (jwt.id === user.id) {

                  if (user.owner !== undefined) {
                    if (user.company !== undefined) {
                      if (user.offer !== undefined) {
                        if (user.offer.services !== undefined) {
                          if (user.offer.services.length > 0) {
                            return res.sendStatus(200)
                          }
                        }
                      }
                    }
                  }


                }
              }
            }
          }
        }

        if (req.params.type === "platform-roles") {

        }

        if (req.params.type === "roles") {
          if (req.params.event === "closed") {

            // if (req.jwt !== undefined) {
            //   if (req.body.type !== undefined) {
            //     if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

            //     if (req.body.type === "name") {
            //       // finish it
            //     }
            //   }
            // }

            const {jwt} = req
            const {state} = req.body
            if (Helper.stringIsEmpty(state)) throw new Error("state is empty")

            const role = parseInt(req.params.role)
            if (Helper.numberIsEmpty(role)) throw new Error("role is empty")

            if (role === UserRole.EXPERT) {
              if (state === "owner") {


                const {name} = req.body
                if (name !== undefined) {
                  if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === jwt.id) {
                      if (user.expert.name === name) {
                        for (let i = 0; i < user.roles.length; i++) {
                          if (user.roles[i] === UserRole.EXPERT) {
                            return res.sendStatus(200)
                          }
                        }
                      }
                    }
                  }
                }



              }
            }



            if (state === "exist") {
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (jwt.id === user.id) {
                  for (let i = 0; i < user.roles.length; i++) {
                    const role = user.roles[i]
                    if (parseInt(req.params.role) === role) {
                      return res.sendStatus(200)
                    }
                  }
                }
              }

            }

            if (state === "multiple") {
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (jwt.id === user.id) {
                  if (user.roles.length > 1) {
                    return res.sendStatus(200)
                  }
                }
              }

            }


          }
        }

        if (req.params.type === "expert") {

          if (req.params.event === "verified") {
            if (Helper.stringIsEmpty(req.body.expert)) throw new Error("req.body.expert is empty")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === req.jwt.id) {

                for (let i = 0; i < user.roles.length; i++) {
                  const role = user.roles[i]

                  if (role === UserRole.EXPERT) {

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.body.expert) {

                          if (user.verified === true) {
                            return res.sendStatus(200)
                          }

                        }
                      }



                    }

                  }

                }

              }

            }
          }


          if (req.params.event === "closed") {

            if (req.params.role !== undefined) {

              if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert !== undefined) {
                    if (user["getyour"].expert.name !== undefined) {
                      if (user["getyour"].expert.name === req.body.name) {
                        return res.sendStatus(200)
                      }
                    }
                  }
                }

              }

              return res.sendStatus(404)

            }

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {

                    for (let i = 0; i < user.roles.length; i++) {
                      const role = user.roles[i]

                      if (role === UserRole.EXPERT) {

                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {

                              return res.sendStatus(200)

                            }
                          }



                        }

                      }

                    }

                  }

                }
              }

            }

          }

          if (req.params.event === "event-type") {


            const {event} = req.body
            if (event !== undefined) {
              if (Helper.stringIsEmpty(event)) throw new Error("event is empty")

              if (event === "toolbox") {

                const {location} = req.body
                if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
                const loc = new URL(location)
                if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
                const url = {}
                url.platform = loc.pathname.split("/")[1]
                url.expert = loc.pathname.split("/")[2]
                url.path = loc.pathname.split("/")[3]

                // // toolbox for all
                // if (url.platform === "getyour") {
                //   if (url.expert === "pana") {
                //     if (url.path === "toolbox-alpha") {
                //       return res.sendStatus(200)
                //     }
                //   }
                // }

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert.name === url.expert) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]

                          if (platform.name === url.platform) {
                            for (let i = 0; i < platform.values.length; i++) {
                              const value = platform.values[i]

                              // for admin only
                              if (req.params.platform === "getyour") {
                                if (req.params.expert === "pana") {
                                  if (req.params.path === "toolbox") {
                                    if (user["getyour"].admin !== undefined) {
                                      return res.sendStatus(200)
                                    }
                                  }
                                }
                              }

                              if (value.path.split("/")[3] === url.path) {
                                return res.sendStatus(200)
                              }

                            }
                          }



                        }
                      }
                    }
                  }

                }




              }


              if (event === "jwt") {

                if (Helper.stringIsEmpty(req.body.expert)) throw new Error("req.body.expert is empty")
                const {jwt} = req
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert.name === req.body.expert) {
                        return res.sendStatus(200)
                      }
                    }
                  }
                }

              }

              if (event === "exist") {
                const {email, name} = req.body
                if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
                if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user[platform].expert.name === name) return res.sendStatus(200)
                  if (user.email === email) {
                    for (let i = 0; i < user.roles.length; i++) {
                      const role = user.roles[i]
                      if (role === UserRole.EXPERT) {
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }

              if (event === "direct") {

                if (Helper.stringIsEmpty(req.body.expert)) throw new Error("req.body.expert is empty")
                const {jwt} = req
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === jwt.id) {
                    if (user["getyour"].expert === undefined) throw new Error("expert is undefined")
                    if (user["getyour"].expert.name === undefined) throw new Error("expert.name is undefined")
                    if (user["getyour"].expert.platforms === undefined) throw new Error("expert.platforms is undefined")
                    for (let i = 0; i < user.roles.length; i++) {
                      const role = user.roles[i]
                      if (role === UserRole.EXPERT) {
                        if (user["getyour"].expert.name === req.body.expert) {
                          return res.sendStatus(200)
                        }
                      }
                    }
                  }
                }

              }

              if (event === "indirect") {

                const {name} = req.body
                if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.expert.name === name) {
                    return res.sendStatus(200)
                  }
                }

                const {email} = req.body
                if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.email === email) {
                    if (user[platform].expert === undefined) throw new Error("expert is undefined")
                    if (user[platform].expert.name === undefined) throw new Error("expert.name is undefined")
                    if (user[platform].expert.platforms === undefined) throw new Error("expert.platforms is undefined")
                    for (let i = 0; i < user.roles.length; i++) {
                      const role = user.roles[i]
                      if (role === UserRole.EXPERT) {
                        return res.sendStatus(200)
                      }
                    }
                  }
                }



              }

            }

          }
        }

        if (req.params.type === "lead") {
          if (req.params.event === "closed") {

            const {type, state} = req.body
            if (Helper.stringIsEmpty(type)) throw new Error("type is empty")
            if (Helper.stringIsEmpty(state)) throw new Error("state is empty")

            const {jwt} = req

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (jwt.id === user.id) {


                if (user.lead !== undefined) {

                  if (user.lead.type === type) {
                    if (user.lead.state === state) {
                      return res.sendStatus(200)
                    }
                  }

                }

              }


            }
          }
        }

        if (req.params.type === "client") {
          if (req.params.event === "closed") {

            const {urlId} = req.body
            if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")

            const {jwt} = req



            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (jwt.id === user.id) {
                if (user.clients === undefined) throw new Error("clients is undefined")
                for (let i = 0; i < user.clients.length; i++) {
                  const client = user.clients[i]
                  // console.log(client);

                  if (client.id === urlId) {
                    return res.sendStatus(200)
                  }

                }
              }


            }
          }
        }

      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async get(req, res, next) {
    try {

      if (req.params.method === "get") {
        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users are undefined")


        if (req.params.type === "match-maker") {

          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "mirror") {
                    if (Helper.arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
                    if (Helper.arrayIsEmpty(req.body.mirror)) throw new Error("req.body.mirror is empty")

                    for (let i = 0; i < req.body.conditions.length; i++) {
                      const condition = req.body.conditions[i]

                      for (let i = 0; i < doc.users.length; i++) {
                        const user = doc.users[i]

                        if (user.id === req.jwt.id) {

                          if (Helper.verify("user/tree/exist", user, condition.left) === true) {

                            if (Helper.verify("user/condition", user, condition) === false) {
                              return res.sendStatus(404)
                            }

                          } else {
                            return res.sendStatus(404)
                          }

                        }

                      }

                    }

                    const map = await Helper.convert("mirror/users-map", req.body.mirror)
                    return res.send(map)

                  }

                  if (req.body.type === "conditions") {

                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                    const array = []
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {

                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform["match-maker"] !== undefined) {

                                    for (let i = 0; i < platform["match-maker"].length; i++) {
                                      const matchMaker = platform["match-maker"][i]

                                      if (matchMaker.created === req.body.id) {

                                        if (matchMaker.conditions !== undefined) {
                                          for (let i = 0; i < matchMaker.conditions.length; i++) {
                                            const condition = matchMaker.conditions[i]

                                            const map = {}
                                            map.id = condition.created
                                            array.push(map)

                                          }
                                        }


                                      }


                                    }

                                  }

                                }
                              }
                            }
                          }
                        }
                      }


                    }

                    return res.send(array)

                  }

                  if (req.body.type === "complete-conditions") {

                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                    const array = []
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {

                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform["match-maker"] !== undefined) {

                                    for (let i = 0; i < platform["match-maker"].length; i++) {
                                      const matchMaker = platform["match-maker"][i]

                                      if (matchMaker.created === req.body.id) {

                                        if (matchMaker.conditions !== undefined) {
                                          for (let i = 0; i < matchMaker.conditions.length; i++) {
                                            const condition = matchMaker.conditions[i]

                                            const map = {}
                                            map.id = condition.created

                                            if (condition.left !== undefined) map.left = condition.left
                                            if (condition.operator !== undefined) map.operator = condition.operator
                                            if (condition.right !== undefined) map.right = condition.right

                                            array.push(map)

                                          }
                                        }


                                      }


                                    }

                                  }

                                }
                              }
                            }
                          }
                        }
                      }


                    }

                    return res.send(array)

                  }

                  if (req.body.type === "condition") {

                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {

                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform["match-maker"] !== undefined) {

                                    for (let i = 0; i < platform["match-maker"].length; i++) {
                                      const matchMaker = platform["match-maker"][i]

                                      if (matchMaker.conditions !== undefined) {
                                        for (let i = 0; i < matchMaker.conditions.length; i++) {
                                          const condition = matchMaker.conditions[i]

                                          if (condition.created === req.body.id) {

                                            const map = {}
                                            map.id = condition.created
                                            map.left = condition.left
                                            map.operator = condition.operator
                                            map.right = condition.right
                                            return res.send(map)

                                          }


                                        }
                                      }


                                    }

                                  }

                                }
                              }
                            }
                          }
                        }
                      }


                    }

                  }

                  if (req.body.type === "toolbox") {

                    const array = []
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {

                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform["match-maker"] !== undefined) {

                                    for (let i = 0; i < platform["match-maker"].length; i++) {
                                      const matchMaker = platform["match-maker"][i]

                                      const map = {}
                                      map.id = matchMaker.created
                                      map.name = matchMaker.name
                                      array.push(map)

                                    }

                                  }

                                }
                              }
                            }
                          }
                        }
                      }


                    }

                    return res.send(array)

                  }

                }

                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                const array = []
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {

                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.name === req.body.platform) {
                                if (platform["match-maker"] !== undefined) {

                                  for (let i = 0; i < platform["match-maker"].length; i++) {
                                    const matchMaker = platform["match-maker"][i]

                                    const map = {}
                                    map.id = matchMaker.created
                                    map.name = matchMaker.name
                                    array.push(map)

                                  }

                                }
                              }

                            }
                          }
                        }
                      }
                    }
                  }


                }

                return res.send(array)
              }
            }
          }
        }

        if (req.params.type === "location-list-funnel") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {

                    if (user[req.location.platform] !== undefined) {

                      if (user[req.location.platform][req.body.tag] !== undefined) {

                        for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
                          const list = user[req.location.platform][req.body.tag][i]

                          if (list.created === req.body.id) {
                            return res.send(list.funnel)
                          }


                        }

                      }


                    }

                  }

                }

              }
            }
          }
        }

        if (req.params.type === "location-list") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")

                const array = []
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {

                    if (user[req.location.platform] !== undefined) {

                      if (user[req.location.platform][req.body.tag] !== undefined) {

                        for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
                          const list = user[req.location.platform][req.body.tag][i]

                          const map = {}
                          map.id = list.created
                          map.tag = list.tag
                          array.push(map)

                        }

                      }



                    }

                  }

                }
                return res.send(array)

              }
            }
          }
        }

        if (req.params.type === "feedback") {

          if (req.params.event === "location") {
            if (req.location !== undefined) {


              if (req.body.type !== undefined) {
                if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                if (req.body.type === "script") {

                  if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")


                  const array = []
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].scripts !== undefined) {

                        for (let i = 0; i < user["getyour"].scripts.length; i++) {
                          const script = user["getyour"].scripts[i]

                          if (script.id === req.body.id) {

                            if (script.feedback !== undefined) {
                              for (let i = 0; i < script.feedback.length; i++) {
                                const feedback = script.feedback[i]

                                const map = {}
                                map.id = feedback.id
                                map.content = feedback.content
                                map.importance = feedback.importance


                                array.push(map)

                              }
                            }


                          }
                        }


                      }
                    }

                  }
                  return res.send(array)

                }

                if (req.body.type === "html-value") {

                  const array = []
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user["getyour"] !== undefined) {

                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.name === req.location.platform) {
                                if (platform.values !== undefined) {
                                  for (let i = 0; i < platform.values.length; i++) {
                                    const value = platform.values[i]

                                    if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                                      if (value.feedback !== undefined) {
                                        for (let i = 0; i < value.feedback.length; i++) {
                                          const feedback = value.feedback[i]

                                          const map = {}
                                          map.id = feedback.id
                                          map.content = feedback.content
                                          map.importance = feedback.importance


                                          array.push(map)

                                        }
                                      }
                                    }

                                  }
                                }
                              }

                            }
                          }
                        }
                      }

                    }

                  }
                  return res.send(array)

                }

                if (req.body.type === "html-value-length") {

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.name === req.location.platform) {
                                if (platform.values !== undefined) {
                                  for (let i = 0; i < platform.values.length; i++) {
                                    const value = platform.values[i]

                                    if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {

                                      if (value.feedback !== undefined) {
                                        return res.send(`${value.feedback.length}`)
                                      }

                                    }


                                  }
                                }
                              }

                            }
                          }
                        }
                      }
                    }

                  }

                }

              }


            }
          }

        }

        if (req.params.type === "user-json") {
          if (req.params.event === "verified") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {
                if (req.params.role !== undefined) {
                  if (parseInt(req.params.role) === UserRole.ADMIN) {

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {

                        if (Helper.verifyIs("user/getyour-admin", user)) {

                          if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
                          for (let i = 0; i < doc.users.length; i++) {
                            const user = doc.users[i]
                            if (user.email === req.body.email) {
                              return res.send(user)
                            }

                          }

                        }

                      }


                    }



                  }
                }


              }

            }


          }
        }

        if (req.params.type === "user-keys") {
          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {

              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === req.jwt.id) {

                  const properties = Object.getOwnPropertyNames(user)

                  for (let i = 0; i < properties.length; i++) {
                    const property = properties[i]
                    if (property === "id") continue
                    if (property === "email") continue
                    if (property === "verified") continue
                    if (property === "created") continue
                    if (property === "reputation") continue
                    if (property === "roles") continue
                    if (property === "children") continue
                    if (property === "parent") continue
                    // if (property === "getyour") continue

                    array.push(property)
                  }

                }

              }
              return res.send(array)

            }

          }
        }

        if (req.params.type === "conditions") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {



                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")


                  if (Helper.numberIsEmpty(req.body.service)) throw new Error("req.body.service is empty")

                  const array = []
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {
                        if (user[req.body.platform].services !== undefined) {

                          for (let i = 0; i < user[req.body.platform].services.length; i++) {
                            const service = user[req.body.platform].services[i]

                            if (service.id === req.body.service) {


                              if (service.conditions !== undefined) {
                                for (let i = 0; i < service.conditions.length; i++) {
                                  const condition = service.conditions[i]

                                  const map = {}
                                  map.id = condition.id
                                  map.left = condition.left
                                  map.operator = condition.operator
                                  map.right = condition.right
                                  map.action = condition.action

                                  array.push(map)


                                }
                              }


                            }

                          }
                        }
                      }
                    }

                  }

                  return res.send(array)
                }

                if (Helper.numberIsEmpty(req.body.service)) throw new Error("req.body.service is empty")

                const array = []
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].services !== undefined) {

                        for (let i = 0; i < user[req.location.platform].services.length; i++) {
                          const service = user[req.location.platform].services[i]

                          if (service.id === req.body.service) {


                            if (service.conditions !== undefined) {
                              for (let i = 0; i < service.conditions.length; i++) {
                                const condition = service.conditions[i]

                                const map = {}
                                map.id = condition.id
                                map.left = condition.left
                                map.operator = condition.operator
                                map.right = condition.right
                                map.action = condition.action

                                array.push(map)


                              }
                            }


                          }

                        }
                      }
                    }
                  }

                }

                return res.send(array)
              }
            }
          }
        }

        if (req.params.type === "script") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].scripts !== undefined) {

                        for (let i = 0; i < user[req.location.platform].scripts.length; i++) {
                          const script = user[req.location.platform].scripts[i]

                          if (script.id === req.body.id) {

                            const map = {}
                            map.name = script.name
                            map.script = script.script


                            if (script.feedback !== undefined) {
                              map.feedbackLength = script.feedback.length
                            } else {
                              map.feedbackLength = 0
                            }



                            return res.send(map)
                          }

                        }
                      }
                    }
                  }

                }

              }
            }
          }
        }

        if (req.params.type === "toolbox-scripts") {

          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                const array = []
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {

                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {

                          for (let i = 0; i < doc.users.length; i++) {
                            const user = doc.users[i]

                            if (user["getyour"] !== undefined) {
                              if (user["getyour"].scripts !== undefined) {
                                for (let i = 0; i < user["getyour"].scripts.length; i++) {
                                  const script = user["getyour"].scripts[i]

                                  if (user.verified === true) {

                                    const map = {}
                                    map.id = script.id
                                    map.name = script.name
                                    map.script = script.script

                                    if (script.feedback !== undefined) {
                                      map.feedbackLength = script.feedback.length
                                    } else {
                                      map.feedbackLength = 0
                                    }

                                    array.push(map)

                                  }


                                }
                              }
                            }

                          }


                        }
                      }
                    }

                  }


                }
                return res.send(array)

              }
            }
          }

        }

        if (req.params.type === "scripts") {

          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {

                const array = []
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].scripts !== undefined) {

                        for (let i = 0; i < user[req.location.platform].scripts.length; i++) {
                          const script = user[req.location.platform].scripts[i]

                          const map = {}
                          map.id = script.id
                          map.name = script.name

                          if (script.feedback !== undefined) {
                            map.feedbackLength = script.feedback.length
                          } else {
                            map.feedbackLength = 0
                          }


                          array.push(map)
                        }
                      }
                    }
                  }

                }

                return res.send(array)
              }
            }
          }

        }

        if (req.params.type === "services") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {



                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                  const array = []
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {
                        if (user[req.body.platform].services !== undefined) {

                          for (let i = 0; i < user[req.body.platform].services.length; i++) {
                            const service = user[req.body.platform].services[i]

                            const map = {}
                            map.id = service.id
                            map.quantity = service.quantity
                            map.unit = service.unit
                            map.title = service.title
                            map.price = service.price
                            map.currency = service.currency
                            map.selected = service.selected

                            array.push(map)
                          }
                        }
                      }
                    }

                  }
                  return res.send(array)

                }

                const array = []
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].services !== undefined) {

                        for (let i = 0; i < user[req.location.platform].services.length; i++) {
                          const service = user[req.location.platform].services[i]

                          const map = {}
                          map.id = service.id
                          map.quantity = service.quantity
                          map.unit = service.unit
                          map.title = service.title
                          map.price = service.price
                          map.currency = service.currency
                          map.selected = service.selected

                          array.push(map)
                        }
                      }
                    }
                  }

                }

                return res.send(array)
              }
            }
          }
        }

        if (req.params.type === "role-apps") {
          if (req.params.event === "closed") {
            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                let allowed
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (user.roles !== undefined) {
                      for (let i = 0; i < user.roles.length; i++) {
                        const role = user.roles[i]

                        if (role === req.body.id) {
                          allowed = true
                        }

                      }
                    }
                  }
                }

                if (allowed === true) {

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.name === req.location.expert) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                              const platform = user["getyour"].expert.platforms[i]

                              if (platform.name === req.location.platform) {
                                if (platform.roles !== undefined) {
                                  for (let i = 0; i < platform.roles.length; i++) {
                                    const role = platform.roles[i]

                                    if (role.id === req.body.id) {
                                      if (role.apps !== undefined) {
                                        return res.send(role.apps)
                                      }
                                    }

                                  }
                                }
                              }

                            }
                          }
                        }
                      }
                    }

                  }

                }





              }
            }
          }
        }

        if (req.params.type === "experts") {
          if (req.params.event === "open") {

            const array = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user["getyour"] !== undefined) {
                if (user["getyour"].expert !== undefined) {
                  if (user.verified === true) {
                    if (user["getyour"].expert.name !== undefined) array.push(user["getyour"].expert.name)
                  }
                }
              }



            }
            return res.send(array)


          }
        }

        if (req.params.type === "platform") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {
                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "image") {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.name === req.location.platform) {
                                    if (platform.image !== undefined) {
                                      if (platform.image.svg !== undefined) {

                                        const map = {}
                                        map.svg = platform.image.svg


                                        return res.send(map)
                                      }

                                      if (platform.image.dataUrl !== undefined) {

                                        const map = {}
                                        map.dataUrl = platform.image.dataUrl


                                        return res.send(map)
                                      }
                                    }
                                  }

                                }
                              }
                            }
                          }
                        }
                      }

                    }
                  }


                  if (req.body.type === "role/home") {

                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.platforms !== undefined) {
                              for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                const platform = user["getyour"].expert.platforms[i]

                                if (platform.name === req.body.platform) {
                                  if (platform.roles !== undefined) {
                                    for (let i = 0; i < platform.roles.length; i++) {
                                      const role = platform.roles[i]

                                      if (role.id === req.body.id) return res.send(role.home)

                                    }
                                  }

                                }


                              }
                            }
                          }
                        }
                      }

                    }
                  }

                  if (req.body.type === "role") {
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                    if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.name === req.body.platform) {
                                    if (platform.roles !== undefined) {
                                      for (let i = 0; i < platform.roles.length; i++) {
                                        const role = platform.roles[i]

                                        if (role.id === req.body.id) {

                                          const map = {}
                                          // mirror für role/update
                                          // is input for role update function
                                          // sends only if it is not undefined
                                          map.id = role.id
                                          map.name = role.name
                                          map.apps = role.apps

                                          return res.send(map)

                                        }


                                      }
                                    }
                                  }

                                }
                              }
                            }
                          }
                        }
                      }

                    }
                  }

                  if (req.body.type === "roles") {
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")

                    const array = []
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.name === req.body.platform) {
                                    if (platform.roles !== undefined) {
                                      for (let i = 0; i < platform.roles.length; i++) {
                                        const role = platform.roles[i]

                                        const map = {}
                                        map.id = role.id
                                        map.name = role.name
                                        array.push(map)

                                      }
                                    }
                                  }

                                }
                              }
                            }
                          }
                        }
                      }

                    }

                    return res.send(array)
                  }

                  if (req.body.type === "visibility") {
                    if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (user["getyour"] !== undefined) {
                          if (user["getyour"].expert !== undefined) {
                            if (user["getyour"].expert.name === req.location.expert) {
                              if (user["getyour"].expert.platforms !== undefined) {
                                for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                  const platform = user["getyour"].expert.platforms[i]

                                  if (platform.name === req.body.platform) {
                                    return res.send(platform.visibility)
                                  }

                                }
                              }
                            }
                          }
                        }
                      }

                    }
                  }

                }
              }

            }



          }
        }

        if (req.params.type === "platform-value") {

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {


              if (req.body.type !== undefined) {
                if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is emtpy")

                if (req.body.type === "path") {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is emtpy")

                  const array = []
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.name === req.location.expert) {

                            if (user["getyour"].expert.platforms !== undefined) {
                              for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                const platform = user["getyour"].expert.platforms[i]
                                if (platform.values !== undefined) {
                                  for (let i = 0; i < platform.values.length; i++) {
                                    const value = platform.values[i]

                                    array.push(value.path)

                                  }
                                }
                              }
                            }


                          }
                        }
                      }
                    }
                  }
                  return res.send(array)

                }

                if (req.body.type === "visibility") {
                  if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is emtpy")

                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.id === req.jwt.id) {
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.name === req.location.expert) {

                            if (user["getyour"].expert.platforms !== undefined) {
                              for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                const platform = user["getyour"].expert.platforms[i]
                                if (platform.values !== undefined) {
                                  for (let i = 0; i < platform.values.length; i++) {
                                    const value = platform.values[i]

                                    if (value.path === req.body.path) {

                                      const map = {}
                                      map.visibility = value.visibility
                                      map.roles = {}
                                      map.roles.available = platform.roles
                                      map.roles.selected = value.roles
                                      map.authorized = value.authorized

                                      return res.send(map)
                                    }

                                  }
                                }
                              }
                            }


                          }
                        }
                      }
                    }
                  }

                }

              }

            }

          }

        }

        if (req.params.type === "platform-values") {

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {

              if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is emtpy")

              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.name === req.location.expert) {

                        if (user["getyour"].expert.platforms !== undefined) {
                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]
                            if (platform.name === req.body.platform) {

                              if (platform.values !== undefined) {
                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]

                                  const map = {}
                                  map.alias = value.alias
                                  map.path = value.path
                                  map.visibility = value.visibility
                                  map.roles = value.roles
                                  map.authorized = value.authorized

                                  array.push(map)
                                }
                              }

                            }
                          }
                        }


                      }
                    }
                  }
                }
              }

              return res.send(array)
            }

          }




          if (req.params.event === "location") {

            if (req.location !== undefined) {

              if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert !== undefined) {
                    if (user["getyour"].expert.name === req.location.expert) {

                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]

                          if (platform.name === req.body.platform) {
                            if (platform.visibility === "open") {

                              for (let i = 0; i < platform.values.length; i++) {
                                const value = platform.values[i]

                                if (value.visibility === "open") {

                                  if (value.authorized.length === 0) {

                                    if (value.roles.length === 0) {

                                      const map = {}

                                      map.alias =  value.alias
                                      map.path = value.path

                                      if (value.image !== undefined) {
                                        map.image = {}

                                        if (value.image.svg !== undefined) {
                                          map.image.svg = value.image.svg
                                        }

                                        if (value.image.dataUrl !== undefined) {
                                          map.image.dataUrl = value.image.dataUrl
                                        }

                                        if (value.image.url !== undefined) {
                                          map.image.url = value.image.url
                                        }

                                      }

                                      array.push(map)

                                    }

                                  }
                                }

                              }


                            }

                          }

                        }
                      }

                    }
                  }
                }
              }
              return res.send(array)

            }

          }
        }

        if (req.params.type === "expert-templates") {
          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {

              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === req.jwt.id) {
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.templates !== undefined) {

                        for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                          const template = user["getyour"].expert.templates[i]

                          const map = {}
                          map.id = template.id
                          map.alias = template.alias
                          map.reputation = user.reputation

                          if (template.feedback !== undefined) {
                            map.feedbackLength = template.feedback.length
                          } else {
                            map.feedbackLength = 0
                          }



                          array.push(map)

                        }


                      }
                    }
                  }
                }

              }
              return res.send(array)

            }


          }
        }

        if (req.params.type === "templates") {
          if (req.params.event === "closed") {



            if (req.body.type === undefined) {
              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert !== undefined) {
                    if (user["getyour"].expert.templates !== undefined) {
                      for (let i = 0; i < user["getyour"].expert.templates.length; i++) {


                        const template = user["getyour"].expert.templates[i]
                        const map = {}



                        map.id = template.id
                        map.alias = template.alias
                        map.reputation = user.reputation
                        // map.firstname = user.owner.firstname
                        // map.lastname = user.owner.lastname
                        map.script = template.script

                        // const mockFeedback = {}
                        // mockFeedback.content = "Hi das ist ein Feedback"
                        // mockFeedback.created = Date.now()
                        // template.feedback = []
                        // template.feedback.push(mockFeedback)





                        if (template.feedback !== undefined) {
                          map.feedbackLength = template.feedback.length
                        } else {
                          map.feedbackLength = 0
                        }


                        array.push(map)
                      }
                    }
                  }
                }
              }

              // sort the array by reputation and feedback
              // then send only the 21 best templates
              return res.send(array)
            }

            if (req.body.type !== undefined) {
              if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")


              if (req.body.type === "script") {
                if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.templates !== undefined) {

                          for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                            const template = user["getyour"].expert.templates[i]

                            if (template.id === req.body.id) {
                              return res.send(template.script)
                            }

                          }


                        }
                      }
                    }
                  }

                }

              }



              if (req.body.type === "description") {
                if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.templates !== undefined) {

                          for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                            const template = user["getyour"].expert.templates[i]

                            if (template.id === req.body.id) {
                              return res.send(template.description)
                            }

                          }


                        }
                      }
                    }
                  }

                }

              }


              if (req.body.type === "dependencies") {
                if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.templates !== undefined) {

                          for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                            const template = user["getyour"].expert.templates[i]

                            if (template.id === req.body.id) {
                              return res.send(template.dependencies)
                            }

                          }


                        }
                      }
                    }
                  }

                }

              }


              if (req.body.type === "jwt") {

                const array = []
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user["getyour"] !== undefined) {
                      if (user["getyour"].expert !== undefined) {
                        if (user["getyour"].expert.templates !== undefined) {


                          for (let i = 0; i < user["getyour"].expert.templates.length; i++) {
                            const template = user["getyour"].expert.templates[i]

                            const map = {}
                            map.id = template.id
                            map.alias = template.alias
                            map.reputation = user.reputation
                            map.feedbackLength = 0
                            if (template.feedback !== undefined) map.feedbackLength = template.feedback.length

                            array.push(map)

                          }


                        }
                      }
                    }
                  }

                }
                return res.send(array)



              }

              if (req.body.type === "feedback") {
                if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")

                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.templates !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.templates.length; i++) {

                          const template = user["getyour"].expert.templates[i]

                          if (template.id === req.body.id) {
                            if (template.feedback === undefined) return res.send([])
                            return res.send(template.feedback)
                          }

                        }
                      }
                    }
                  }
                }

              }

            }

          }
        }

        if (req.params.type === "toolbox") {
          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === req.jwt.id) {
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.name === req.location.expert) {


                        if (user["getyour"].expert.platforms !== undefined) {

                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]

                            if (platform.name === req.location.platform) {


                              if (platform.values !== undefined) {
                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]

                                  if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                                    return res.send(Helper.readFileSyncToString("./value-units/toolbox-script.html"))
                                  }

                                }
                              }
                            }

                          }

                        }
                      }
                    }
                  }
                }

              }

            }


          }
        }

        if (req.params.type === "platforms") {

          if (req.params.event === "closed") {


            if (req.jwt !== undefined) {
              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.name === req.location.expert) {
                        if (user["getyour"].expert.platforms !== undefined) {

                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]

                            const map = {}
                            map.name = platform.name

                            if (platform.image !== undefined) {
                              map.image = {}

                              if (platform.image.svg !== undefined) {
                                map.image.svg = platform.image.svg
                              }

                              if (platform.image.dataUrl !== undefined) {
                                map.image.dataUrl = platform.image.dataUrl
                              }

                              if (platform.image.url !== undefined) {
                                map.image.url = platform.image.url
                              }

                            }

                            array.push(map)
                          }

                        }
                      }
                    }
                  }
                }
              }
              return res.send(array)
            }





          }

          if (req.params.event === "verified") {



            if (req.jwt !== undefined) {
              const url = {}
              url.expert = req.body.location.pathname.split("/")[1]
              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.name === url.expert) {
                        if (user.verified === true) {
                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]


                            const map = {}
                            map.name = platform.name


                            if (platform.image !== undefined) {
                              map.image = {}

                              if (platform.image.svg !== undefined) {
                                map.image.svg = platform.image.svg
                              }

                              if (platform.image.dataUrl !== undefined) {
                                map.image.dataUrl = platform.image.dataUrl
                              }
                            }

                            array.push(map)
                          }
                        }
                      }
                    }
                  }
                }
              }
              return res.send(array)
            }





          }

          if (req.params.event === "location") {

            if (req.location !== undefined) {

              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user["getyour"] !== undefined) {

                  if (user["getyour"].expert !== undefined) {

                    if (user["getyour"].expert.name === req.location.expert) {

                      if (user.verified === true) {
                        if (user["getyour"].expert.platforms !== undefined) {

                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]
                            if (platform.visibility === "open") {

                              const map = {}
                              map.name = platform.name
                              map.image = {}

                              if (platform.image !== undefined) {
                                if (platform.image.svg !== undefined) {
                                  map.image.svg = platform.image.svg
                                }
                              }

                              if (platform.image !== undefined) {
                                if (platform.image.dataUrl !== undefined) {
                                  map.image.dataUrl = platform.image.dataUrl
                                }
                              }


                              if (platform.image !== undefined) {
                                if (platform.image.url !== undefined) {
                                  map.image.url = platform.image.url
                                }
                              }


                              array.push(map)
                            }

                          }

                        }
                      }




                    }

                  }



                }
              }
              return res.send(array)

            }

          }

          if (req.params.event === "open") {


            // add from location ???

            if (req.body.expert === undefined) {


              // const {location} = req.body
              // if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
              // const loc = new URL(location)
              // if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
              const url = {}
              // url.platform = loc.pathname.split("/")[1]
              url.expert = req.body.location.pathname.split("/")[1]


              // if (Helper.stringIsEmpty(req.body.expert)) throw new Error("req.body.expert is empty")
              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert.name !== undefined) {
                    if (user["getyour"].expert.name === url.expert) {
                      for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                        const platform = user["getyour"].expert.platforms[i]
                        if (platform.visibility === "open") {

                          const map = {}
                          map.name = platform.name
                          map.image = {}

                          if (platform.image !== undefined) {
                            if (platform.image.svg !== undefined) {
                              map.image.svg = platform.image.svg
                            }
                          }

                          if (platform.image !== undefined) {
                            if (platform.image.dataUrl !== undefined) {
                              map.image.dataUrl = platform.image.dataUrl
                            }
                          }

                          array.push(map)
                        }

                      }
                    }
                  }
                }
              }

              return res.send(array)
            }

            if (req.body.expert !== undefined) {

              if (Helper.stringIsEmpty(req.body.expert)) throw new Error("req.body.expert is empty")
              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user["getyour"] !== undefined) {
                  if (user["getyour"].expert.name !== undefined) {
                    if (user["getyour"].expert.name === req.body.expert) {
                      for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                        const platform = user["getyour"].expert.platforms[i]
                        if (platform.visibility === "open") {
                          const map = {}
                          map.values = []
                          map.name = platform.name

                          if (platform.logo.dataUrl !== undefined) {
                            map.logo = platform.logo.dataUrl
                          } else {
                            map.logo = platform.logo
                          }

                          for (let i = 0; i < platform.values.length; i++) {
                            const value = platform.values[i]
                            if (value.visibility === "open") {
                              if (value.roles.length === 0) {
                                if (value.authorized.length === 0) {

                                  const valueMap = {}
                                  valueMap.alias = value.alias
                                  valueMap.path = value.path

                                  if (value.logo.dataUrl !== undefined) {
                                    valueMap.logo = value.logo.dataUrl
                                  } else {
                                    valueMap.logo = value.logo
                                  }

                                  map.values.push(valueMap)

                                }
                              }
                            }
                          }
                          array.push(map)
                        }

                      }
                    }
                  }
                }
              }

              return res.send(array)

            }



          }

        }

        if (req.params.type === "offer") {

          if (req.params.event === "open") {



            const array = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user[platform] !== undefined) {
                for (let i = 0; i < user.roles.length; i++) {
                  const role = user.roles[i]

                  if (role === UserRole.PROMOTER) {
                    if (Helper.objectIsEmpty(user.offer)) throw new Error("offer is empty")
                    if (user.offer.verified === undefined) throw new Error("offer not verified")
                    // if (user[platform].verified === undefined) throw new Error("promoter not verified")
                    // if (user[platform].payed === undefined) throw new Error("promoter not verified")
                    // more verified checks if needed (e.g. check payment of promoter)

                    const map = {}
                    map.company = user.company.name
                    map.website = user.company.website
                    map.logo = user.company.logo.dataUrl

                    map.title = user.offer.title
                    map.description = user.offer.description

                    array.push(map)
                  }

                }
              }
            }
            return res.send(array)
          }

          if (req.params.event === "closed") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {



                if (Helper.stringIsEmpty(req.location.platform)) {
                  if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")


                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]

                    if (user.id === req.jwt.id) {
                      if (user[req.body.platform] !== undefined) {
                        if (user[req.body.platform].offer !== undefined) {
                          return res.send(user[req.body.platform].offer)
                        }
                      }
                    }

                  }

                }





                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform].offer !== undefined) {
                        return res.send(user[req.location.platform].offer)
                      }
                    }
                  }

                }

              }
            }



            // const {email} = req.body
            // if (email !== undefined) {
            //   if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
            //   for (let i = 0; i < doc.users.length; i++) {
            //     const user = doc.users[i]

            //     if (user.email === email) {
            //       if (user.offer === undefined) throw new Error("offer is undefined")
            //       if (user.offer.feedbacks === undefined) throw new Error("feedbacks is undefined")
            //       return res.send(user.offer.feedbacks)
            //     }

            //   }
            // }

            // const {platformName} = req.body
            // if (platformName !== undefined) {
            //   if (Helper.stringIsEmpty(platformName)) throw new Error("platform name is empty")


            //   const array = []
            //   for (let i = 0; i < doc.users.length; i++) {
            //     const user = doc.users[i]

            //     if (user[platformName] !== undefined) {
            //       for (let i = 0; i < user.roles.length; i++) {
            //         const role = user.roles[i]

            //         if (role === UserRole.PROMOTER) {
            //           if (Helper.objectIsEmpty(user.promoter.offer)) throw new Error("promoter.offer is empty")
            //           if (Helper.objectIsEmpty(user.owner)) throw new Error("owner is empty")
            //           if (Helper.objectIsEmpty(user.company)) throw new Error("company is empty")
            //           if (Helper.arrayIsEmpty(user.promoter.offer.services)) throw new Error("promoter.offer.services is empty")

            //           if (user.promoter.offer.visibility === "open") {
            //             const map = {}
            //             map.email = user.email
            //             map.reputation = user.reputation
            //             map.owner = user.owner
            //             map.company = user.company
            //             map.offer = user.promoter.offer
            //             array.push(map)
            //           }

            //         }

            //       }
            //     }

            //   }
            //   return res.send(array)
            // }






            // const array = []
            // for (let i = 0; i < doc.users.length; i++) {
            //   const user = doc.users[i]

            //   if (user[platform] !== undefined) {
            //     for (let i = 0; i < user.roles.length; i++) {
            //       const role = user.roles[i]

            //       if (role === UserRole.PROMOTER) {
            //         if (Helper.objectIsEmpty(user.offer)) throw new Error("offer is empty")
            //         if (user.offer.verified === undefined) throw new Error("offer not verified")
            //         // if (user[platform].verified === undefined) throw new Error("promoter not verified")
            //         // if (user[platform].payed === undefined) throw new Error("promoter not verified")
            //         // more verified checks if needed (e.g. check payment of promoter)

            //         const map = {}
            //         map.company = user.company.name
            //         map.website = user.company.website
            //         map.logo = user.company.logo

            //         map.title = user.offer.title
            //         map.description = user.offer.description
            //         map.vat = user.offer.vat
            //         map.tag = user.offer.tag



            //         // get funnel
            //         const {funnel} = req.body
            //         if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")
            //         console.log(funnel);
            //         // get filter from offer
            //         const filter = user.offer.filter
            //         // get services
            //         console.log(filter);
            //         const services = user.offer.services
            //         // calc services with funnel and filter
            //         console.log(services);

            //         // const servicesFilteredByFunnel = Helper.servicesFilteredByFunnel(services, filter, funnel)


            //         // the map the view with the data
            //         map.grossAmount = 10




            //         array.push(map)
            //         // array.push(map)
            //       }

            //     }
            //   }

            // }

            // // sort array before sending
            // return res.send(array)



            // if (req.body.state === "verified") {}
          }

        }

        if (req.params.type === "filter") {
          if (req.params.event === "closed") {
            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")
            const {jwt} = req

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user.offer === undefined) throw new Error("offer is undefined")
                if (user.offer.filter === undefined) throw new Error("filter is undefined")
                return res.send(user.offer.filter)
              }

            }

          }
        }

        if (req.params.type === "logs") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (req.params.role !== undefined) {

                  if (parseInt(req.params.role) === UserRole.ADMIN) {

                    if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                    const array = []
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {
                        if (Helper.verifyIs("user/getyour-admin", user)) {

                          const doc = await nano.db.use("getyour").get("logs")

                          for (let i = 0; i < doc.logs.length; i++) {
                            const log = doc.logs[i]

                            if (log.type === req.body.type) {
                              array.push(log)
                            }

                          }

                          const offset = parseInt(req.body.offset) || 0
                          const limit = parseInt(req.body.limit) || 21
                          const slicedLogs = array.slice(offset, offset + limit);

                          return res.send(slicedLogs)

                        }
                      }

                    }





                  }

                }
              }
            }



          }
        }

        if (req.params.type === "error") {
          if (req.params.event === "closed") {
            if (parseInt(req.params.role) === UserRole.ADMIN) {

              const doc = await nano.db.use("getyour").get("logs")
              const offset = parseInt(req.body.offset) || 0
              const limit = parseInt(req.body.limit) || 21
              const slicedLogs = doc.logs.slice(offset, offset + limit);

              return res.send(slicedLogs)

            }
          }
        }

        if (req.params.type === "user") {
          if (req.params.event === "closed") {

            if (req.location !== undefined) {

              if (req.jwt !== undefined) {

                if (req.params.role !== undefined) {

                  if (parseInt(req.params.role) === UserRole.ADMIN) {

                    const array = []
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      const map = {}
                      map.email = user.email
                      map.verified = user.verified
                      map.counter = 0
                      if (user.session !== undefined) map.counter = user.session.counter

                      array.push(map)
                    }
                    return res.send(array)
                  }
                }

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "self") {


                    const array = []
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]

                      if (user.id === req.jwt.id) {

                        const properties = Object.getOwnPropertyNames(user)

                        for (let i = 0; i < properties.length; i++) {
                          const property = properties[i]
                          if (property === "id") continue
                          if (property === "getyour") continue
                          if (property === "email") continue
                          if (property === "verified") continue
                          if (property === "reputation") continue
                          if (property === "created") continue
                          if (property === "roles") continue

                          array.push(property)
                        }

                      }

                    }

                    return res.send(array)
                  }
                }

              }

            }




          }
        }

        if (req.params.type === "lead") {
          if (req.params.event === "closed") {
            const {jwt} = req
            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")

            let companyName
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.id === jwt.id) {
                if (Helper.objectIsEmpty(user.company)) throw new Error("company is empty")
                if (Helper.stringIsEmpty(user.company.name)) throw new Error("company name is empty")
                companyName = user.company.name
                break
              }
            }

            const array = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.lead !== undefined) {
                if (user.lead.to === companyName) {
                  if (user.lead.state === "open") {
                    if (user.lead.type === "application") {
                      const map = {}

                      if (user.preference.contact === "E-Mail") {
                        map.email = user.email
                      }

                      if (user.preference.contact === "Telefon") {
                        map.phone = user.owner.phone
                      }

                      map.id = user.id
                      map.firstname = user.owner.firstname
                      map.lastname = user.owner.lastname
                      map.role = Helper.translateRole(user.lead.role)
                      map.reputation = user.reputation
                      array.push(map)
                    }

                  }
                }
              }


            }

            return res.send(array)



          }
        }

        if (req.params.type === "roles") {
          if (req.params.event === "closed") {
            const {location} = req.body
            if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
            const loc = new URL(location)
            if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
            const expert = loc.pathname.split("/")[2]
            const platform = loc.pathname.split("/")[1]



            const {jwt} = req
            if (jwt !== undefined) {
              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === jwt.id) {
                  for (let i = 0; i < user.roles.length; i++) {
                    const role = user.roles[i]

                    if (role === UserRole.ADMIN) {
                      const map = {}
                      map.id = UserRole.ADMIN
                      // map.tag = "admin"
                      map.name = "Admin"
                      // map.path = "/getyour/pana/admin/"
                      map.icon = "/public/admin.svg"
                      array.push(map)
                    }

                    if (role === UserRole.OPERATOR) {
                      const map = {}
                      map.id = UserRole.OPERATOR
                      // map.tag = "operator"
                      map.name = "Anlagenbetreiber"
                      map.icon = "/public/operator.svg"
                      // console.log(platform);

                      // if (user[platform].funnel === undefined) map.path = "/felix/energie-plattform/qualifizierung/1/"
                      // if (user[platform].funnel.q0 === undefined) map.path = "/felix/energie-plattform/qualifizierung/1/"
                      // if (user[platform].funnel.hausBaujahr === undefined) map.path = "/felix/energie-plattform/abfrage-haus/1/"


                      // if (user[platform].checklist !== undefined) map.path = `/felix/energie-plattform/anlagenbetreiber-ansicht/1/`




                      array.push(map)
                    }

                    if (role === UserRole.SELLER) {
                      const map = {}
                      map.id = UserRole.SELLER
                      // map.tag = "seller"
                      map.name = "Verkäufer"
                      // map.path = `/felix/energie-plattform/verkaufer-ansicht/4/`
                      map.icon = "/public/seller.svg"
                      array.push(map)
                    }

                    if (role === UserRole.EXPERT) {
                      const map = {}
                      // map.tag = "expert"
                      map.id = UserRole.EXPERT
                      map.name = "Experten"
                      // map.path = `/${user.expert.name}/`
                      map.icon = "/public/expert.svg"
                      array.push(map)
                    }

                    if (role === UserRole.PROMOTER) {
                      const map = {}
                      map.id = UserRole.PROMOTER
                      // map.tag = "promoter"
                      map.name = "Promoter"
                      // map.path = `/felix/energie-plattform/promoter-ansicht/5/`
                      map.icon = "/public/promoter.svg"
                      array.push(map)
                    }

                    if (role === UserRole.PLATFORM_DEVELOPER) {
                      const map = {}
                      map.id = UserRole.PLATFORM_DEVELOPER
                      // map.tag = "platform-developer"
                      map.name = "Plattformentwickler"
                      // map.path = `/felix/energie-plattform/plattform-entwickler-ansicht/5/`
                      map.icon = "/public/code.svg"
                      array.push(map)
                    }

                    if (role === UserRole.MONTEUR) {
                      const map = {}
                      map.id = UserRole.MONTEUR
                      // map.tag = "monteur"
                      map.name = "Monteur"
                      // map.path = `/felix/energie-plattform/monteur-ansicht/6/`
                      map.icon = "/public/engineer.svg"
                      array.push(map)
                    }


                  }
                }
              }

              return res.send(array)
            }

          }
        }

        if (req.params.type === "funnel") {
          if (req.params.event === "closed") {

            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")

            const {location} = req.body
            if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
            const loc = new URL(location)
            if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
            const expert = loc.pathname.split("/")[2]
            const platform = loc.pathname.split("/")[1]

            const {jwt} = req

            if (req.body.state === "owner") {
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === jwt.id) {
                  if (user[platform] !== undefined) {
                    if (user[platform].funnel !== undefined) {
                      return res.send(user[platform].funnel)
                    }
                  }
                }

              }
              throw new Error("funnel not found")
            }

            if (req.body.state === "keys") {


              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.expert.name !== undefined) {
                  if (user.expert.name === username) {
                    if (user[platform] !== undefined) {
                      for (let i = 0; i < user.roles.length; i++) {
                        const role = user.roles[i]
                        if (role === UserRole.EXPERT) {
                          if (user.funnel !== undefined) {
                            return res.send(Helper.getKeysRecursively(user.funnel))
                          }
                        }
                      }
                    }
                  }
                }
              }





            }



          }
        }

        if (req.params.type === "clients") {
          if (req.params.event === "closed") {

            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")


            const clients = []
            {
              const {jwt} = req
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === jwt.id) {
                  for (let i = 0; i < user.clients.length; i++) {
                    clients.push(user.clients[i])
                  }
                }
              }
              if (Helper.arrayIsEmpty(clients)) throw new Error("client ids is empty")
            }


            const array = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              for (let i = 0; i < clients.length; i++) {
                const client = clients[i]

                if (user.id === client.id) {
                  const map = {}
                  map.id = user.id
                  map.email = user.email
                  map.firstname = user.owner.firstname
                  map.lastname = user.owner.lastname
                  map.street = user.owner.street
                  map.zip = user.owner.zip
                  map.phone = user.owner.phone
                  map.reputation = user.reputation
                  map.state = client.state

                  array.push(map)
                }
              }
            }

            return res.send(array)
          }
        }

        if (req.params.type === "seller") {
          if (req.params.event === "closed") {

            const {jwt} = req
            const ids = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                for (let i = 0; i < user.seller.length; i++) {
                  ids.push(user.seller[i].id)
                }
                break
              }

            }


            const array = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              for (let i = 0; i < ids.length; i++) {
                const id = ids[i]

                if (user.id === id) {
                  const map = {}

                  map.reputation = user.reputation
                  map.firstname = user.owner.firstname
                  map.lastname = user.owner.lastname

                  if (user.preference.contact === "E-Mail") {
                    map.email = user.email
                  }

                  if (user.preference.contact === "Telefon") {
                    map.phone = user.owner.phone
                  }

                  array.push(map)
                }

              }

            }
            return res.send(array)

          }
        }

        if (req.params.type === "promoter") {
          if (req.params.event === "closed") {



            const {location} = req.body
            if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
            const loc = new URL(location)
            if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
            const expert = loc.pathname.split("/")[2]

            const {jwt} = req

            const promoter = []
            userloop: for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user[platform] !== undefined) {
                for (let i = 0; i < user.roles.length; i++) {
                  const role = user.roles[i]

                  if (role === UserRole.PROMOTER) {

                    for (let i = 0; i < user.seller.length; i++) {
                      const seller = user.seller[i]

                      if (seller.id === jwt.id) {
                        continue userloop
                      }

                    }

                    if (user.owner === undefined) throw new Error("owner is undefined")
                    if (user.company === undefined) throw new Error("company is undefined")
                    if (user.offer === undefined) throw new Error("offer is undefined")
                    if (user.offer.services === undefined) throw new Error("offer services is undefined")
                    if (user.offer.services.length <= 0) throw new Error("offer services is empty")
                    promoter.push(user.company.name)
                  }

                }
              }

            }
            return res.send(promoter)
          }
        }

        if (req.params.type === "owner") {
          if (req.params.event === "closed") {
            const {jwt} = req

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user.owner === undefined) throw new Error("owner is undefined")

                const map = {}
                map.firstname = user.owner.firstname
                map.lastname = user.owner.lastname
                map.street = user.owner.street
                map.zip = user.owner.zip
                map.state = user.owner.state
                map.country = user.owner.country
                map.phone = user.owner.phone
                return res.send(map)
              }

            }



          }
        }

      }



      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async render(req, res, next) {
    try {

      const {method} = req.body

      if (method === "render") {
        return res.sendStatus(200)
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifySession(req, res, next) {
    try {
      const {sessionToken} = req.cookies

      if (sessionToken !== undefined) {
        // const {jwt} = req
        if (Helper.stringIsEmpty(sessionToken)) throw new Error("session token is empty")


        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")




        // const {user} = await Helper.findUser(user => user.id === jwt.id)
        // console.log("sessionToken", sessionToken);

        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]

          if (user.id === req.jwt.id) {
            // console.log(user.verified);
            // this verifies if the user id has changed but id can change now when user is
            // not verified any more
            const sessionTokenDigest = Helper.digest(JSON.stringify({
              id: user.id,
              // id: Helper.digest(JSON.stringify({email: user.email, verified: user.verified})),
              pin: user.session.pin,
              salt: user.session.salt,
              jwt: user.session.jwt,
            }))
            // console.log("sessionTokenDigest", sessionTokenDigest);
            if (Helper.stringIsEmpty(sessionTokenDigest)) throw new Error("session token is not valid")
            if (sessionTokenDigest !== sessionToken) throw new Error("session token changed during session")
            return next()
          }

        }





      }

      throw new Error("verify session failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyVerified(req, res, next) {
    try {
      if (req.method === "GET" || req.method === "POST") {

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")

        if (Helper.objectIsEmpty(req.jwt)) throw new Error("req.jwt is empty")

        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]

          if (user.id === req.jwt.id) {
            if (user.verified === false) throw new Error("user unverified")

            const verified = Helper.digest(JSON.stringify({email: user.email, verified: user.verified}))
            if (user.id !== verified) throw new Error("user id mismatch")
            if (req.jwt.id !== verified) throw new Error("jwt id mismatch")
          }

        }

        // console.log(req.params);
        // if (req.params.event === "verified") {
        //   req.verified = true
        // }

        // console.log(req.verified);
        // console.log("ho");

        return next()
      }

      throw new Error("verify jwt id failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyEvent(req, res, next) {
    try {

      if (req.params.event === "closed") {
        const {localStorageId, localStorageEmail, referer} = req.body

        if (Helper.objectIsEmpty(req.location)) throw new Error("location is empty")
        if (Helper.stringIsEmpty(localStorageId)) throw new Error("local storage id is empty")
        if (Helper.stringIsEmpty(localStorageEmail)) throw new Error("local storage email is empty")
        if (referer === undefined) throw new Error("referer is undefined")

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")

        let userById
        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]
          if (user.id === localStorageId) {
            userById = user
            break
          }
        }
        if (Helper.objectIsEmpty(userById)) throw new Error("user not registered")

        let verifiedUserById
        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]

          if (user.id === Helper.digest(JSON.stringify({email: userById.email, verified: userById.verified}))) {
            verifiedUserById = user
            break
          }

        }
        if (Helper.objectIsEmpty(verifiedUserById)) throw new Error("user not verified")
        if (localStorageId !== verifiedUserById.id) throw new Error("local storage id is not trusted")
        if (localStorageEmail !== verifiedUserById.email) throw new Error("email mismatch")

        return next()
      }

      throw new Error("event unknown")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyClosed(req, res, next) {
    try {

      if (req.params.event === "closed") {
        const {localStorageId, localStorageEmail, referer} = req.body

        if (Helper.objectIsEmpty(req.jwt)) throw new Error("req.jwt is empty")
        if (Helper.objectIsEmpty(req.location)) throw new Error("req.location is empty")
        if (Helper.objectIsEmpty(req.referer)) throw new Error("req.referer is empty")
        if (Helper.stringIsEmpty(localStorageId)) throw new Error("local storage id is empty")
        if (Helper.stringIsEmpty(localStorageEmail)) throw new Error("local storage email is empty")

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")

        let userById
        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]
          if (user.id === localStorageId) {
            userById = user
            break
          }
        }
        if (Helper.objectIsEmpty(userById)) throw new Error("user not registered")


        return next()
      }

      return res.sendStatus(404)
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyAdmin(req, res, next) {
    try {

      const {email} = req.body

      if (email !== undefined) {
        if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
        if (!email.endsWith("@get-your.de")) throw new Error("not a producer email")
        return next()
      }

    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyJwtToken(req, res, next) {
    try {
      // redirect possible
      if (req.method === "GET") {

        if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
        const {jwtToken} = req.cookies
        if (Helper.stringIsEmpty(jwtToken)) {
          // await Helper.logError(new Error("jwt token is empty"), req)
          return res.redirect("/")
        }
        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")

        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]

          if (user.id === jwt.id) {

            if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
            if (user.session.jwt !== Helper.digest(jwtToken)) {
              await Helper.logError(new Error("jwt token changed"), req)
              return res.redirect("/login/")
            }

            // const verified = Helper.digest(JSON.stringify({email: user.email, verified: user.verified}))

            // if (user.id !== verified) throw new Error("user not verified")

            if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
            req.jwt = jwt
            if (Helper.objectIsEmpty(req.jwt)) throw new Error("jwt is empty")
            return next()

          }

        }

      }

      if (req.method === "POST") {



        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")



        if (Helper.objectIsEmpty(req.body)) throw new Error("body is empty")
        if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
        const {jwtToken} = req.cookies
        if (Helper.stringIsEmpty(jwtToken)) throw new Error("jwt token is empty")
        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")


        // user exist and has valid session
        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]

          if (user.id === jwt.id) {
            if (user.session.jwt !== Helper.digest(jwtToken)) throw new Error("jwt token changed")


            // verify that jwt roles not changed or are in roles of user

            // this is only for verified users ???? pass becaus on register we create the id with true digest
            // verifyVerified ???
            // if (jwt.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified}))) throw new Error("jwt user not verified")
            req.jwt = jwt
            if (Helper.objectIsEmpty(req.jwt)) throw new Error("jwt is empty")
            return next()

          }

        }





        // user is verified
        // do this extra function
        // const verifiedUser = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified})))).user
        // if (Helper.objectIsEmpty(verifiedUser)) throw new Error("verified user is empty")

        // for (let i = 0; i < doc.users.length; i++) {
        //   const user = doc.users[i]

        //   if (user.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified}))) {

        //   }

        // }

        // if (jwt.id !== user.id) throw new Error("jwt id not equals user id")






        // req.jwt = jwt
        // if (Helper.objectIsEmpty(req.jwt)) throw new Error("jwt is empty")
        // return next()












      }


      throw new Error("verify jwt token failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyRole(req, res, next) {
    try {

      if (req.params.role !== undefined) {

        if (req.jwt !== undefined) {

          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users is undefined")

          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]
            if (user.id === req.jwt.id) {
              for (let i = 0; i < user.roles.length; i++) {
                const role = user.roles[i]
                if (parseInt(req.params.role) === role) {
                  return next()
                }
              }
            }
          }

        }

      }

      throw new Error("verify role failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static verifyRoles(roles) {
    return async(req, res, next) => {
      try {
        if (roles === undefined) throw new Error("roles is undefined")

        const {jwt} = req
        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users are undefined")

        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]
          if (user.id === jwt.id) {
            for (let i = 0; i < roles.length; i++) {
              const requiredRole = roles[i]
              for (let i = 0; i < user.roles.length; i++) {
                const role = user.roles[i]
                if (requiredRole === role) {
                  return next()
                }
              }
            }
          }
        }



        throw new Error("verify role failed")
      } catch (error) {
        await Helper.logError(error, req)
      }
      return res.sendStatus(404)
    }
  }

}
