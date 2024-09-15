require('dotenv').config()
const { UserRole } = require("./UserRole.js")
const {Helper} = require("./Helper.js")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

module.exports.Request = class {

  static async get(req, res, next) {
    try {

      if (req.params.method === "get") {

        if (req.params.type === "sounds") {

          if (req.params.event === "cids-self") {
            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.sounds !== undefined) {
                    for (let i = 0; i < user.sounds.length; i++) {
                      const sound = user.sounds[i]
                      array.push(sound)
                    }
                  }
                }
              }
              if (array.length <= 0) return res.sendStatus(404)
              return res.send(array)
            }
          }

        }

        if (req.params.type === "match-maker") {

          if (req.params.event === "keys") {

            if (req.jwt !== undefined) {
              if (Helper.arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
              if (Helper.arrayIsEmpty(req.body.mirror)) throw new Error("req.body.mirror is empty")
              const doc = await nano.db.use("getyour").get("users")
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
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  const clone = {}
                  for (let i = 0; i < req.body.mirror.length; i++) {
                    const tree = req.body.mirror[i]
                    if (Helper.verify("user/tree/exist", user, tree) === true) {
                      const map = {}
                      map.tree = tree
                      map.user = user
                      clone[tree.replace(/\./g, "-")] = Helper.convert("user-tree/value", map)
                    }
                  }
                  return res.send(clone)
                }
              }
            }
          }

          if (req.params.event === "list") {

            if (req.jwt !== undefined) {
              if (Helper.arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
              if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  for (let i = 0; i < req.body.conditions.length; i++) {
                    const condition = req.body.conditions[i]
                    if (Helper.verify("user/condition", user, condition) === false) {
                      return res.sendStatus(404)
                    }
                  }
                }
              }
              const list = await Helper.convert("tree/match-maker-list", req.body.tree)
              return res.send(list)
            }
          }

          if (req.params.event === "mirror") {

            if (req.jwt !== undefined) {
              if (Helper.arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
              if (Helper.arrayIsEmpty(req.body.mirror)) throw new Error("req.body.mirror is empty")
              const doc = await nano.db.use("getyour").get("users")
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
          }

          if (req.params.event === "condition-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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
                                    return res.send(condition)
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

          if (req.params.event === "conditions-writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (Helper.verify("user/location-writable", user, {location: req.location, email: jwtUser.email})) {
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
                                      if (matchMaker.created === req.body.id) {
                                        if (matchMaker.conditions !== undefined) {
                                          for (let i = 0; i < matchMaker.conditions.length; i++) {
                                            const condition = matchMaker.conditions[i]
                                            array.push(condition)
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
                if (array.length <= 0) return res.sendStatus(404)
                return res.send(array)
              }
            }
          }

          if (req.params.event === "conditions-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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
                                    if (matchMaker.created === req.body.id) {
                                      if (matchMaker.conditions !== undefined) {
                                        for (let i = 0; i < matchMaker.conditions.length; i++) {
                                          const condition = matchMaker.conditions[i]
                                          array.push(condition)
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
                if (array.length <= 0) return res.sendStatus(404)
                return res.send(array)
              }
            }
          }

          if (req.params.event === "expert-self") {
            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            if (platform["match-maker"] !== undefined) {
                              for (let i = 0; i < platform["match-maker"].length; i++) {
                                const matchMaker = platform["match-maker"][i]
                                array.push(matchMaker)
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (array.length > 0) return res.send(array)
              }
            }
          }

        }

        if (req.params.type === "location") {

          if (req.params.event === "lists") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.arrayIsEmpty(req.body.ids)) throw new Error("req.body.ids is empty")
                if (Helper.arrayIsEmpty(req.body.tags)) throw new Error("req.body.tags is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    const clone = {}
                    for (let i = 0; i < req.body.ids.length; i++) {
                      const id = req.body.ids[i]
                      for (let i = 0; i < doc.users.length; i++) {
                        const user = doc.users[i]
                        if (user[req.location.platform] !== undefined) {
                          Object.entries(user[req.location.platform]).forEach(([key, value] )=> {
                            if (Array.isArray(user[req.location.platform][key])) {
                              for (let i = 0; i < user[req.location.platform][key].length; i++) {
                                const item = user[req.location.platform][key][i]
                                if (item.created === id) {
                                  clone[id] = Helper.convert("user-tags/value", {user, tags: req.body.tags})
                                }
                              }
                            }
                          })
                        }
                      }
                    }
                    return res.send(clone)
                  }
                }
              }
            }
          }

          if (req.params.event === "tag-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      let found
                      Object.entries(user[req.location.platform]).forEach(([key, value]) => {
                        if (key === req.body.tag) {
                          found = { [key]: value }
                        }
                      })
                      if (found) {
                        return res.send(found)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "tag-expert") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
              if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
              const location = req.body.path.split("/")[2]
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  if (Helper.verifyIs("user/expert", jwtUser)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.email === req.body.email) {
                        if (user[location] !== undefined) {
                          let found
                          Object.entries(user[location]).forEach(([key, value]) => {
                            if (key === req.body.tag) {
                              found = { [key]: value }
                            }
                          })
                          if (found && found[req.body.tag].length > 0) {
                            return res.send(found)
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

        if (req.params.type === "feedback") {

          if (req.params.event === "script") {

            if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.scripts !== undefined) {
                for (let i = 0; i < user.scripts.length; i++) {
                  const script = user.scripts[i]
                  if (script.created === req.body.id) {
                    if (script.feedback !== undefined) {
                      if (script.feedback.length > 0) return res.send(script.feedback)
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "html-value") {

            if (req.location !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (Helper.verifyIs("user/location-expert", {user, req})) {
                  if (user["getyour"].expert.platforms !== undefined) {
                    for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                      const platform = user["getyour"].expert.platforms[i]
                      if (platform.name === req.location.platform) {
                        if (platform.values !== undefined) {
                          for (let i = 0; i < platform.values.length; i++) {
                            const value = platform.values[i]
                            if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                              if (value.feedback !== undefined) {
                                if (value.feedback.length > 0) return res.send(value.feedback)
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

          if (req.params.event === "length-html-value") {

            if (req.location !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "length-script") {

            if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.scripts !== undefined) {
                for (let i = 0; i < user.scripts.length; i++) {
                  const script = user.scripts[i]
                  if (script.created === req.body.id) {
                    if (script.feedback !== undefined) {
                      return res.send(`${script.feedback.length}`)
                    }
                  }
                }
              }
            }
          }

        }

        if (req.params.type === "contacts") {

          if (req.params.event === "self") {
            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    if (user.contacts.length > 0) {
                      return res.send(user.contacts)
                    }
                  }
                }
              }
            }
          }
        }

        if (req.params.type === "deadlines") {

          if (req.params.event === "closed") {
            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.deadlines !== undefined) {
                    if (user.deadlines.length > 0) return res.send(user.deadlines)
                  }
                }
              }
            }
          }

        }

        if (req.params.type === "funnel") {

          if (req.params.event === "open") {

            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.funnel !== undefined) {
                  for (let i = 0; i < user.funnel.length; i++) {
                    const funnel = user.funnel[i]
                    if (funnel.visibility === "open") {
                      array.push(funnel)
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }
        }

        if (req.params.type === "groups") {

          if (req.params.event === "self") {

            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.groups !== undefined) {
                      for (let i = 0; i < user.groups.length; i++) {
                        const group = user.groups[i]
                        if (group.emails !== undefined) {
                          for (let i = 0; i < group.emails.length; i++) {
                            const email = group.emails[i]
                            if (jwtUser.email === email) {
                              array.push(group)
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }
        }

        if (req.params.type === "expert") {

          if (req.params.event === "name-self") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.name !== undefined) {
                        return res.send(user["getyour"].expert.name)
                      }
                    }
                  }
                }
              }
            }
          }

        }

        if (req.params.type === "open") {

          if (!Helper.verifyIs("text/empty", req.params.event)) {

            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user[req.params.event] !== undefined) {
                  for (let i = 0; i < user[req.params.event].length; i++) {
                    const it = user[req.params.event][i]
                    if (it.visibility === "open") {
                      array.push(it)
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }
        }

        if (req.params.type === "pager") {

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.pager !== undefined) {
                      for (let i = 0; i < user.pager.length; i++) {
                        const pager = user.pager[i]
                        if (pager.emails !== undefined) {
                          for (let i = 0; i < pager.emails.length; i++) {
                            const email = pager.emails[i]
                            if (email === jwtUser.email) {
                              return res.send(pager)
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              if (req.location !== undefined) {

                if (req.body.type !== undefined) {
                  if (Helper.stringIsEmpty(req.body.type)) throw new Error("req.body.type is empty")

                  if (req.body.type === "jwt-email") {


                  }

                }
              }
            }
          }

        }

        if (req.params.type === "platform") {

          if (req.params.event === "list-location-expert") {
            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        if (user["getyour"].expert.platforms.length > 0) {
                          return res.send(user["getyour"].expert.platforms)
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "list-location-writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-writable", {user: jwtUser, req})) {
                      for (let i = 0; i < doc.users.length; i++) {
                        const user = doc.users[i]
                        if (Helper.verifyIs("user/location-expert", {user, req})) {
                          if (user["getyour"].expert.platforms !== undefined) {
                            if (user["getyour"].expert.platforms.length > 0) {
                              return res.send(user["getyour"].expert.platforms)
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

          if (req.params.event === "list-open") {

            if (req.location !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (Helper.verifyIs("user/location-expert", {user, req})) {
                  if (user.verified === true) {
                    if (user["getyour"].expert.platforms !== undefined) {
                      for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                        const platform = user["getyour"].expert.platforms[i]
                        if (platform.visibility === "open") {
                          array.push(platform)
                        }
                      }
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }

          if (req.params.event === "values-location-expert") {

            if (req.location !== undefined) {
              if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
              const array = []
              const doc = await nano.db.use("getyour").get("users")
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
                                      array.push(value)
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

          if (req.params.event === "values-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is emtpy")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            if (platform.values !== undefined) {
                              if (platform.values.length > 0) return res.send(platform.values)
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

          if (req.params.event === "values-writable") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
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
                                      if (value.writability !== undefined) {
                                        for (let i = 0; i < value.writability.length; i++) {
                                          const authorized = value.writability[i]
                                          if (authorized === user.email) {
                                            array.push(value)
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
                if (array.length > 0) return res.send(array)
              }
            }
          }

          if (req.params.event === "match-maker-location-writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (Helper.verifyIs("user/location-writable", {user, req, email: jwtUser.email})) {
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
                                      array.push(matchMaker)
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
                if (array.length <= 0) return res.sendStatus(404)
                return res.send(array)
              }
            }
          }

          if (req.params.event === "match-maker-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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
                                    array.push(matchMaker)
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
                if (array.length <= 0) return res.sendStatus(404)
                return res.send(array)
              }
            }
          }

          if (req.params.event === "paths-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is emtpy")
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
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
                if (array.length > 0) return res.send(array)
              }
            }
          }

          if (req.params.event === "role-apps") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    if (jwtUser.roles !== undefined) {
                      for (let i = 0; i < jwtUser.roles.length; i++) {
                        const role = jwtUser.roles[i]
                        if (role === req.body.id) {
                          for (let i = 0; i < doc.users.length; i++) {
                            const user = doc.users[i]
                            if (Helper.verifyIs("user/location-expert", {user, req})) {
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
          }

          if (req.params.event === "roles-location-writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (Helper.verifyIs("user/location-writable", {user, req, email: jwtUser.email})) {
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
                                        if (platform.roles.length > 0) return res.send(platform.roles)
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

          if (req.params.event === "role-home-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
              const doc = await nano.db.use("getyour").get("users")
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
                                if (role.created === req.body.id) return res.send(role.home)
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

          if (req.params.event === "roles-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.location.platform) {
                            if (platform.roles !== undefined) {
                              if (platform.roles.length > 0) return res.send(platform.roles)
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (array.length > 0) return res.send(array)
              }
            }
          }

          if (req.params.event === "roles-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            if (platform.roles !== undefined) {
                              if (platform.roles.length > 0) return res.send(platform.roles)
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

          if (req.params.event === "visibility-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "role-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            if (platform.roles !== undefined) {
                              for (let i = 0; i < platform.roles.length; i++) {
                                const role = platform.roles[i]
                                if (role.created === req.body.id) {
                                  return res.send(role)
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

          if (req.params.event === "surveys") {

            if (req.location !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user[req.location.platform] !== undefined) {
                  if (user[req.location.platform].surveys !== undefined) {
                    for (let i = 0; i < user[req.location.platform].surveys.length; i++) {
                      const survey = user[req.location.platform].surveys[i]
                      if (survey.visibility === "open") {
                        array.push(survey)
                      }
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }

          if (req.params.event === "image-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          return res.send(platform.image)
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "value-paths-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is emtpy")
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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
                return res.send(array)
              }
            }
          }

          if (req.params.event === "value-visibility-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is emtpy")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "value-writability-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is emtpy")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.values !== undefined) {
                            for (let i = 0; i < platform.values.length; i++) {
                              const value = platform.values[i]
                              if (value.path === req.body.path) {
                                if (value.writability !== undefined) {
                                  return res.send(value.writability)
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

          if (req.params.event === "values-location-writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const array = []
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (Helper.verifyIs("user/location-expert", {user, req})) {
                        Helper.getUserPlatformValues(user, value => {
                          if (Helper.verifyIs("user/writable", {value, writable: jwtUser})) {
                            const map = {}
                            map.alias = value.alias
                            map.path = value.path
                            array.push(map)
                          }
                        })
                      }
                    }
                  }
                }
                if (array.length > 0) return res.send(array)
              }
            }
          }

        }

        if (req.params.type === "templates") {

          if (req.params.event === "open") {

            const doc = await nano.db.use("getyour").get("users")
            const array = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.templates !== undefined) {
                for (let i = 0; i < user.templates.length; i++) {
                  const template = user.templates[i]
                  if (template.visibility === "open") {
                    array.push(template)
                  }
                }
              }
            }
            if (array.length > 0) return res.send(array)
          }

        }

        if (req.params.type === "platforms") {

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

        if (req.params.type === "scripts") {

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.scripts !== undefined) {
                    if (user.scripts.length > 0) return res.send(user.scripts)
                  }
                }
              }
            }
          }

          if (req.params.event === "open") {

            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.scripts !== undefined) {
                  for (let i = 0; i < user.scripts.length; i++) {
                    const script = user.scripts[i]
                    if (script.visibility === "open") {
                      array.push(script)
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }

          if (req.params.event === "toolbox") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      for (let i = 0; i < doc.users.length; i++) {
                        const user = doc.users[i]
                        if (user.scripts !== undefined) {
                          if (user.verified === true) {
                            if (user.scripts.length > 0) return res.send(user.scripts)
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (Helper.verifyIs("user/location-expert", {user, req})) {
                        if (user["getyour"].expert.platforms !== undefined) {
                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]
                            if (platform.name === req.location.platform) {
                              if (platform.values !== undefined) {
                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]
                                  if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                                    if (value.writability !== undefined) {
                                      for (let i = 0; i < value.writability.length; i++) {
                                        const authorized = value.writability[i]
                                        if (jwtUser.email === authorized) {
                                          for (let i = 0; i < doc.users.length; i++) {
                                            const user = doc.users[i]
                                            if (user.scripts !== undefined) {
                                              if (user.verified === true) {
                                                if (user.scripts.length > 0) return res.send(user.scripts)
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

        }

        if (req.params.type === "svg") {

          if (req.params.event === "list-open") {
            const files = Helper.convert("path/file-name-list", "../client/public/")
            const filteredFiles = files.filter(it => it.endsWith(".svg"))
            return res.send(filteredFiles)
          }

        }

        if (req.params.type === "logs") {

          if (req.params.event === "admin") {
            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
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
                    if (slicedLogs.length > 0) return res.send(slicedLogs)
                  }
                }
              }
            }
          }

        }

        if (req.params.type === "users") {

          if (req.params.event === "tree-open") {
            if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
            const array = []
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (Helper.verify("user/tree/exist", user, req.body.tree)) {
                const map = user
                map.id = undefined
                map.children = undefined
                map.parent = undefined
                map.session = undefined
                map.email = undefined
                array.push(map)
              }
            }
            if (array.length > 0) return res.send(array)
          }

        }

        if (req.params.type === "user") {

          if (req.params.event === "blocked") {

            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  if (jwtUser.blocked !== undefined) {
                    for (let i = 0; i < jwtUser.blocked.length; i++) {
                      const blocked = jwtUser.blocked[i]
                      for (let i = 0; i < doc.users.length; i++) {
                        const user = doc.users[i]
                        if (blocked.id === user.created) {
                          const map = {}
                          map.created = blocked.created
                          map.alias = user.alias
                          map.image = user.image
                          map.id = user.created
                          array.push(map)
                        }
                      }
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }

          if (req.params.event === "community") {

            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              outer: for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  inner: for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.created === jwtUser.created) continue

                    if (user.blocked !== undefined) {
                      for (let i = 0; i < user.blocked.length; i++) {
                        const blockedUser = user.blocked[i]
                        if (jwtUser.created === blockedUser.id) continue inner
                      }
                    }

                    if (jwtUser.blocked !== undefined) {
                      for (let i = 0; i < jwtUser.blocked.length; i++) {
                        const blockedUser = jwtUser.blocked[i]
                        if (user.created === blockedUser.id) continue inner
                      }
                    }

                    let myMessagesTo = []
                    if (jwtUser.messages !== undefined) {
                      myMessagesTo = jwtUser.messages.filter(it => it.to === user.created)
                    }

                    let toMessagesMe = []
                    if (user.messages !== undefined) {
                      toMessagesMe = user.messages.filter(it => it.to === jwtUser.created)
                    }

                    const chat = [...myMessagesTo, ...toMessagesMe]
                    const sortedMessages = chat.sort((a, b) => {
                      const aCreated = a.created ?? -Infinity;
                      const bCreated = b.created ?? -Infinity;
                      return bCreated - aCreated
                    })

                    const mostRecentMessage = sortedMessages[0]
                    console.log(mostRecentMessage);


                    // highlight not working correct

                    let highlight = false
                    if (mostRecentMessage) {
                      if (mostRecentMessage.to === jwtUser.created) highlight = true
                    }

                    // do this seperate again
                    // verify/last/message between to users

                    const map = {}
                    map.created = user.created
                    map.alias = user.alias
                    map.highlight = highlight
                    map.image = user.image
                    array.push(map)
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }

          if (req.params.event === "conflicts-open") {

            const array = []
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.conflicts !== undefined) {
                for (let i = 0; i < user.conflicts.length; i++) {
                  const conflict = user.conflicts[i]
                  if (conflict.visibility === "open") {
                    array.push(conflict)
                  }
                }
              }
            }
            if (array.length > 0) return res.send(array)
          }

          if (req.params.event === "conflicts-closed") {

            if (req.jwt !== undefined) {

              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.conflicts !== undefined) {
                    if (user.conflicts.length > 0) return res.send(user.conflicts)
                  }
                }
              }
            }
          }

          if (req.params.event === "funnel") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.funnel !== undefined) {
                    if (user.funnel.length > 0) return res.send(user.funnel)
                  }
                }
              }
            }
          }

          if (req.params.event === "id-by-email") {

            if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.email === req.body.email) {
                return res.send(user.id)
              }
            }
          }

          if (req.params.event === "json-admin") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
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

          if (req.params.event === "trees-open") {

            if (Helper.arrayIsEmpty(req.body.trees)) throw new Error("req.body.trees is empty")
            const array = []
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.verified === true) {
                const clone = {}
                let isValidUser = true
                for (let j = 0; j < req.body.trees.length; j++) {
                  const tree = req.body.trees[j]
                  if (Helper.verify("user/tree/exist", user, tree)) {
                    const map = {}
                    map.tree = tree
                    map.user = user
                    clone[tree] = Helper.convert("user-tree/value", map)
                  } else {
                    isValidUser = false
                    break
                  }
                }
                if (isValidUser) {
                  array.push(clone)
                }
              }
            }
            if (array.length > 0) return res.send(array)
          }

          if (req.params.event === "key-admin") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.key)) throw new Error("req.body.key is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.created === req.body.id) {
                        let result
                        if (req.body.key.includes(".")) {
                          result = Helper.convert("user-tree/value", {user, tree: req.body.key})
                        } else {
                          Object.entries(user).forEach(([key, value]) => {
                            if (key === req.body.key) {
                              result = value
                            }
                          })
                        }
                        if (typeof result === "number") {
                          result = `${result}`
                        }
                        if (result === undefined) return res.sendStatus(404)
                        if (result !== undefined) return res.send(result)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "keys-admin") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.created === req.body.id) {
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
                          array.push(property)
                        }
                      }
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }

          if (req.params.event === "latest-message") {

            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.messages !== undefined) {
                      for (let i = 0; i < user.messages.length; i++) {
                        const message = user.messages[i]
                        if (message.to === jwtUser.created) {
                          array.push(message)
                        }
                      }
                    }
                  }
                }
              }
              const latest = Helper.sort("created-desc", array)[0]
              if (latest) return res.send(latest)
            }
          }

          if (req.params.event === "list-admin") {

            if (req.jwt !== undefined) {
              const array = []
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      const map = {}
                      map.id = user.created
                      map.email = user.email
                      map.verified = user.verified
                      map.counter = 0
                      if (user.session !== undefined) map.counter = user.session.counter
                      array.push(map)
                    }
                  }
                }
              }
              if (array.length > 0) return res.send(array)
            }
          }

          if (req.params.event === "location-list-closed") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
              if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user[req.body.platform] !== undefined) {
                    if (user[req.body.platform][req.body.id] !== undefined) {
                      if (user[req.body.platform][req.body.id].length > 0) {
                        return res.send(user[req.body.platform][req.body.id][0])
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "tree-closed") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  let value = Helper.convert("user-tree/value", {user, tree: req.body.tree})
                  if (value === undefined) {
                    value = user[req.body.tree]
                  }
                  if (value !== undefined) return res.send(value)
                }
              }
            }
          }

          if (req.params.event === "trees-closed") {

            if (req.jwt !== undefined) {
              if (Helper.arrayIsEmpty(req.body.trees)) throw new Error("req.body.trees is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  const clone = {}
                  for (let i = 0; i < req.body.trees.length; i++) {
                    const tree = req.body.trees[i]
                    if (Helper.verify("user/tree/exist", user, tree) === true) {
                      const map = {}
                      map.tree = tree
                      map.user = user
                      clone[tree] = Helper.convert("user-tree/value", map)
                    }
                  }
                  return res.send(clone)
                }
              }
            }
          }

          if (req.params.event === "reputation-self") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  return res.send(`${user.reputation}`)
                }
              }
            }

          }

          if (req.params.event === "scripts") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.scripts !== undefined) {
                    if (user.scripts.length > 0) return res.send(user.scripts)
                  }
                }
              }
            }
          }

          if (req.params.event === "self") {


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

          if (req.params.event === "sources") {
            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.sources !== undefined) {
                    if (user.sources.length > 0) return res.send(user.sources)
                  }
                }
              }
            }
          }

          if (req.params.event === "templates") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.templates !== undefined) {
                    if (user.templates.length > 0) return res.send(user.templates)
                  }
                }
              }
            }
          }

          if (req.params.event === "parent") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.parent !== undefined) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const parent = doc.users[i]
                      if (user.parent === parent.id) {
                        const map = {}
                        map.created = parent.created
                        map.name = parent.name
                        map.image = parent.image
                        map.alias = parent.alias
                        return res.send(map)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "parent-self") {

            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const jwtUser = doc.users[i]
              if (jwtUser.id === req.jwt.id) {
                if (jwtUser.parent !== undefined) {
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (jwtUser.parent === user.id) {
                      const map = {}
                      map.email = user.email
                      return res.send(map)
                    }
                  }
                }
              }
            }

          }

          if (req.params.event === "profiles-open") {

            const array = []
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.profile !== undefined) {
                if (user.profile.visibility === "open") {
                  array.push(user.profile)
                }
              }
            }
            if (array.length > 0) return res.send(array)
          }

          if (!Helper.verifyIs("text/empty", req.params.event)) {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user[req.params.event] !== undefined) {
                    if (user[req.params.event].length > 0) return res.send(user[req.params.event])
                  }
                }
              }
            }
          }

        }

        if (req.params.type === "owner") {

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.owner !== undefined) {
                    return res.send(user.owner)
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

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    return res.send("/admin/")
                  }
                  if (Helper.verifyIs("user/expert", user)) {
                    return res.send(`/${user["getyour"].expert.name}/`)
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
                            if (user["getyour"].expert.platforms !== undefined) {
                              for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                                const platform = user["getyour"].expert.platforms[i]
                                if (platform.roles !== undefined) {
                                  for (let i = 0; i < platform.roles.length; i++) {
                                    const role = platform.roles[i]
                                    if (role.created === roleId) {
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

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async register(req, res, next) {
    try {

      if (req.params.method === "register") {

        if (req.params.type === "contacts") {

          if (req.params.event === "lead-location-expert") {

            if (req.location !== undefined) {
              if (Helper.stringIsEmpty(req.body.preference)) throw new Error("req.body.preference is empty")
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              if (Helper.stringIsEmpty(req.body.subject)) throw new Error("req.body.subject is empty")
              if (req.body.subject.length > 144) throw new Error("req.body.subject too long")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (Helper.verify("user/location-expert", user, req.location.expert)) {
                  if (user.contacts === undefined) {
                    user.contacts = []
                    const contact = {}
                    contact.created = Date.now()
                    contact.email = req.body.email
                    if (contact.lead === undefined) contact.lead = {}
                    contact.lead.created = Date.now()
                    contact.status = "lead-new"
                    let text = ""
                    if (req.body.preference.toLowerCase() === "e-mail") {
                      text = `next:email(${req.body.subject})`
                    }
                    if (req.body.preference.toLowerCase() === "telefon") {
                      text = `next:tel(${req.body.subject})`
                    }
                    if (req.body.preference.toLowerCase() === "webcall") {
                      text = `next:webcall(${req.body.subject})`
                    }
                    if (text) contact.notes = contact.notes + text

                    if (req.body.tel !== undefined) {
                      if (Helper.stringIsEmpty(req.body.tel)) throw new Error("req.body.tel is empty")
                      contact.phone = req.body.tel
                    }
                    contact.lead.preference = req.body.preference
                    user.contacts.unshift(contact)
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    await Helper.sendEmailFromDroid({
                      from: "<droid@get-your.de>",
                      to: contact.email,
                      subject: "[getyour] Kontaktanfrage erfolgreich gesendet",
                      html: `
                      Du hast eine neue Kontaktanfrage gesendet.
                      Schon Bald wird sich Dein persönlicher Ansprechpartner, bei Dir, per ${contact.lead.preference}, melden.
                      `
                    })
                    await Helper.sendEmailFromDroid({
                      from: "<droid@get-your.de>",
                      to: user.email,
                      subject: "[getyour] Neue Kontaktanfrage erhalten",
                      html: `
                      Du hast eine neue Kontaktanfrage erhalten.
                      Der Lead mit der E-Mail ${contact.email} möchte, von dir, per ${contact.lead.preference} kontaktiert werden.
                      Der Lead hat folgenden Betreff angegeben:
                      ${req.body.subject}
                      Der Lead ist ab sofort in deiner Kontaktliste verfügbar. <a href="https://www.get-your.de/">Hier kannst du den Status deines neuen Leads prüfen.</a>
                      `
                    })
                    return res.sendStatus(200)
                  }
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.email === req.body.email) {
                        if (contact.lead === undefined) contact.lead = {}
                        contact.lead.created = Date.now()
                        contact.status = "lead-update"
                        let text = ""
                        if (req.body.preference.toLowerCase() === "e-mail") {
                          text = `next:email(${req.body.subject})`
                        }
                        if (req.body.preference.toLowerCase() === "telefon") {
                          text = `next:tel(${req.body.subject})`
                        }
                        if (req.body.preference.toLowerCase() === "webcall") {
                          text = `next:webcall(${req.body.subject})`
                        }
                        if (text) contact.notes = contact.notes + text

                        if (req.body.tel !== undefined) {
                          if (Helper.stringIsEmpty(req.body.tel)) throw new Error("req.body.tel is empty")
                          contact.phone = req.body.tel
                        }
                        contact.lead.preference = req.body.preference
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        await Helper.sendEmailFromDroid({
                          from: "<droid@get-your.de>",
                          to: contact.email,
                          subject: "[getyour] Kontaktanfrage erfolgreich gesendet",
                          html: `
                          Sie haben eine neue Kontaktanfrage gesendet.
                          Schon Bald wird sich Ihr persönlicher Ansprechpartner, bei Ihnen, per ${contact.lead.preference}, melden.
                          `
                        })
                        await Helper.sendEmailFromDroid({
                          from: "<droid@get-your.de>",
                          to: user.email,
                          subject: "[getyour] Neue Kontaktanfrage erhalten",
                          html: `
                          Du hast eine neue Kontaktanfrage erhalten.
                          Der Lead mit der E-Mail ${contact.email} möchte, von dir, per ${contact.lead.preference} kontaktiert werden.
                          Der Lead hat folgenden Betreff angegeben:
                          ${req.body.subject}
                          Der Lead ist ab sofort in deiner Kontaktliste verfügbar. <a href="https://www.get-your.de/">Hier geht es direkt zur Startseite, wo du den Status deines neuen Leads prüfen kannst.</a>
                          `
                        })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "email-self") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts === undefined) user.contacts = []
                  for (let i = 0; i < user.contacts.length; i++) {
                    const contact = user.contacts[i]
                    if (contact.email === req.body.email) return res.sendStatus(200)
                  }
                  const contact = {}
                  contact.created = Date.now()
                  contact.email = req.body.email
                  user.contacts.unshift(contact)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "email-update") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.created === req.body.id) {
                        contact.email = req.body.email
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "alias-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.created === req.body.id) {
                        contact.alias = req.body.alias
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "birthday-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.birthday)) throw new Error("req.body.birthday is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.created === req.body.id) {
                        contact.birthday = req.body.birthday
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "js-list-self") {

            if (req.jwt !== undefined) {
              if (Helper.arrayIsEmpty(req.body.contacts)) throw new Error("req.body.contacts is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id && user.contacts !== undefined) {
                  for (let j = 0; j < req.body.contacts.length; j++) {
                    const newContact = req.body.contacts[j]
                    let contactExists = false
                    for (let k = 0; k < user.contacts.length; k++) {
                      const contact = user.contacts[k]
                      if (contact.email === newContact.email) {
                        if (newContact.alias) contact.alias = newContact.alias
                        if (newContact.birthday) contact.birthday = newContact.birthday
                        if (newContact.status) contact.status = newContact.status
                        if (newContact.notes) contact.notes = newContact.notes
                        if (newContact.phone) contact.phone = newContact.phone
                        if (newContact.website) contact.website = newContact.website
                        contactExists = true
                        break
                      }
                    }
                    if (!contactExists) {
                      const map = {
                        created: newContact.created,
                        email: newContact.email
                      }
                      if (newContact.alias) map.alias = newContact.alias
                      if (newContact.birthday) map.birthday = newContact.birthday
                      if (newContact.status) map.status = newContact.status
                      if (newContact.notes) map.notes = newContact.notes
                      if (newContact.phone) map.phone = newContact.phone
                      if (newContact.website) map.website = newContact.website
                      user.contacts.unshift(map)
                    }
                  }
                }
              }
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }
          }

          if (req.params.event === "notes-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.created === req.body.id) {
                        contact.notes = req.body.notes
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "phone-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.phone)) throw new Error("req.body.phone is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.created === req.body.id) {
                        contact.phone = req.body.phone
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "website-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.website)) throw new Error("req.body.website is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.created === req.body.id) {
                        contact.website = req.body.website
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "status-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.status)) throw new Error("req.body.status is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.created === req.body.id) {
                        contact.status = req.body.status
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

        if (req.params.type === "deadline") {

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.date)) throw new Error("req.body.date is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.deadlines === undefined) user.deadlines = []
                  const deadline = {}
                  deadline.created = Date.now()
                  deadline.date = req.body.date
                  deadline.alias = req.body.alias
                  deadline.notes = req.body.notes
                  user.deadlines.push(deadline)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "id-closed") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.date)) throw new Error("req.body.date is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.deadlines === undefined) user.deadlines = []
                  for (let i = 0; i < user.deadlines.length; i++) {
                    const deadline = user.deadlines[i]
                    if (deadline.created === req.body.id) {
                      deadline.date = req.body.date
                      deadline.alias = req.body.alias
                      deadline.notes = req.body.notes
                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }
                  }
                }
              }
            }
          }

        }

        if (req.params.type === "groups") {

          if (req.params.event === "emails-self") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.verifyIs("array/empty", req.body.emails)) throw new Error("req.body.emails is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.groups !== undefined) {
                    for (let i = 0; i < user.groups.length; i++) {
                      const group = user.groups[i]
                      if (group.created === req.body.id) {
                        group.emails = []
                        group.emails.push(user.email)
                        for (let i = 0; i < req.body.emails.length; i++) {
                          const email = req.body.emails[i]
                          if (user.email === email) continue
                          group.emails.push(email)
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

          if (req.params.event === "self") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("array/empty", req.body.emails)) throw new Error("req.body.emails is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.groups === undefined) user.groups = []
                  const group = {}
                  group.created = Date.now()
                  group.emails = []
                  group.emails.push(user.email)
                  for (let i = 0; i < req.body.emails.length; i++) {
                    const email = req.body.emails[i]
                    if (user.email === email) continue
                    group.emails.push(email)
                  }
                  user.groups.unshift(group)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "alias") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.groups !== undefined) {
                    for (let i = 0; i < user.groups.length; i++) {
                      const group = user.groups[i]
                      if (group.created === req.body.id) {
                        if (Helper.stringIsEmpty(req.body.alias)) {
                          group.alias = undefined
                        } else {
                          group.alias = req.body.alias
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

        if (req.params.type === "sounds") {

          if (req.params.event === "played") {

            if (Helper.stringIsEmpty(req.query.id)) throw new Error("req.query.id is empty")
            const doc = await nano.db.use("getyour").get("users")
            for (var i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.sounds !== undefined) {
                for (var i = 0; i < user.sounds.length; i++) {
                  const sound = user.sounds[i]
                  if (`${sound.created}` === req.query.id) {
                    if (sound.played === undefined) sound.played = 0
                    sound.played++
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }
                }
              }
            }
          }

          if (req.params.event === "meta-self") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.track)) throw new Error("req.body.track is empty")
              if (Helper.stringIsEmpty(req.body.creator)) throw new Error("req.body.creator is empty")
              if (Helper.stringIsEmpty(req.body.album)) throw new Error("req.body.album is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (var i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.sounds !== undefined) {
                    for (var i = 0; i < user.sounds.length; i++) {
                      const sound = user.sounds[i]
                      if (`${sound.created}` === req.body.id) {
                        sound.track = req.body.track
                        sound.creator = req.body.creator
                        sound.album = req.body.album
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

        if (req.params.type === "match-maker") {

          if (req.params.event === "condition") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                if (Helper.stringIsEmpty(req.body.left)) throw new Error("req.body.left is empty")
                if (Helper.stringIsEmpty(req.body.operator)) throw new Error("req.body.operator is empty")
                if (Helper.stringIsEmpty(req.body.right)) throw new Error("req.body.right is empty")
                const doc = await nano.db.use("getyour").get("users")
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

        if (req.params.type === "location") {

          if (req.params.event === "list-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                if (Helper.objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] === undefined) user[req.location.platform] = {}
                    if (user[req.location.platform][req.body.tag] === undefined) user[req.location.platform][req.body.tag] = []
                    const map = {}
                    map.created = Date.now()
                    for (const key in req.body.map) {
                      if (req.body.map.hasOwnProperty(key)) {
                        if (key === "created") continue
                        map[key] = req.body.map[key]
                      }
                    }
                    user[req.location.platform][req.body.tag].unshift(map)
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }
                }
              }
            }
          }

          if (req.params.event === "map-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] === undefined) user[req.location.platform] = {}
                    for (const key in req.body.map) {
                      user[req.location.platform][key] = req.body.map[key]
                    }
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }
                }
              }
            }
          }

          if (req.params.event === "email-expert") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              if (Helper.objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")
              if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
              if (Helper.stringIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const location = req.body.path.split("/")[2]
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.email === req.body.email) {
                      if (user[location] === undefined) user[location] = {}
                      if (user[location][req.body.id] === undefined) user[location][req.body.id] = []
                      const obj = {}
                      obj.created = Date.now()
                      for (const key in req.body.map) {
                        if (req.body.map.hasOwnProperty(key)) {
                          obj[key] = req.body.map[key]
                        }
                      }
                      user[location][req.body.id].unshift(obj)
                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }
                  }
                  const user = {}
                  user.id =  Helper.digest(JSON.stringify({email: req.body.email, verified: true})),
                  user.email = req.body.email
                  user.verified = false
                  user.reputation = 0
                  user.created =  Date.now()
                  user.roles =  []
                  user.parent = jwtUser.id
                  if (user[location] === undefined) user[location] = {}
                  if (user[location][req.body.id] === undefined) user[location][req.body.id] = []
                  const obj = {}
                  obj.created = Date.now()
                  for (const key in req.body.map) {
                    if (req.body.map.hasOwnProperty(key)) {
                      obj[key] = req.body.map[key]
                    }
                  }
                  user[location][req.body.id].unshift(obj)
                  doc.users.push(user)
                  if (jwtUser.children === undefined) jwtUser.children = []
                  jwtUser.children.unshift({id: user.id})
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "html-requested") {

            if (req.location !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
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
                                  if (value.requested === undefined) value.requested = []
                                  value.requested.push({created: Date.now()})
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

        if (req.params.type === "feedback") {

          if (req.params.event === "script") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.text)) throw new Error("req.body.text is empty")
              if (req.body.text.length > 377) throw new Error("req.body.text too long")
              if (Helper.stringIsEmpty(req.body.importance)) throw new Error("req.body.importance is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.scripts !== undefined) {
                      for (let i = 0; i < user.scripts.length; i++) {
                        const script = user.scripts[i]
                        if (script.created === req.body.id) {
                          if (script.feedback === undefined) script.feedback = []
                          const map = {}
                          map.created = Date.now()
                          map.text = req.body.text
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
            }
          }

          if (req.params.event === "html-value") {

            if (req.location !== undefined) {
              if (Helper.stringIsEmpty(req.body.text)) throw new Error("req.body.text is empty")
              if (req.body.text.length > 377) throw new Error("req.body.text too long")
              if (Helper.stringIsEmpty(req.body.importance)) throw new Error("req.body.importance is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (Helper.verifyIs("user/location-expert", {user, req})) {
                  if (user["getyour"].expert.platforms !== undefined) {
                    for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                      const platform = user["getyour"].expert.platforms[i]
                      if (platform.name === req.location.platform) {
                        if (platform.values !== undefined) {
                          for (let i = 0; i < platform.values.length; i++) {
                            const value = platform.values[i]
                            if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                              if (value.feedback === undefined) value.feedback = []
                              const feedback = {}
                              feedback.created = Date.now()
                              feedback.text = req.body.text
                              feedback.importance = req.body.importance
                              value.feedback.unshift(feedback)
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

        if (req.params.type === "templates") {

          if (req.params.event === "alias") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
              if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.templates !== undefined) {
                    for (let i = 0; i < user.templates.length; i++) {
                      const template = user.templates[i]
                      if (template.created === req.body.created) {
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

          if (req.params.event === "visibility-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.templates !== undefined) {
                    for (let i = 0; i < user.templates.length; i++) {
                      const template = user.templates[i]
                      if (template.created === req.body.id) {
                        template.visibility = req.body.visibility
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

        if (req.params.type === "users") {

          if (req.params.event === "verified-true") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("array/empty", req.body.emails)) throw new Error("req.body.emails is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (req.body.emails.includes(user.email)) {
                        user.verified = true
                      }
                    }
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }
                }
              }
            }
          }

          if (req.params.event === "verified-false") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("array/empty", req.body.emails)) throw new Error("req.body.emails is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (req.body.emails.includes(user.email)) {
                        if (Helper.verifyIs("user/admin", user)) continue
                        user.verified = false
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

        if (req.params.type === "user") {

          if (req.params.event === "alias") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  user.alias = req.body.alias
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "blocked") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.blocked === undefined) user.blocked = []

                  let exist = false
                  for (let i = 0; i < user.blocked.length; i++) {
                    const blocked = user.blocked[i]
                    if (blocked.id === req.body.id) {
                      exist = true
                    }
                  }

                  if (exist === false) {
                    const blocked = {}
                    blocked.created = Date.now()
                    blocked.id = req.body.id
                    user.blocked.push(blocked)
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }
                }
              }
            }
          }

          if (req.params.event === "conflict") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.conflicts === undefined) user.conflicts = []
                  const conflict = {}
                  conflict.created = Date.now()
                  conflict.trigger = req.body.trigger
                  conflict.environment = req.body.environment
                  conflict.reproduce = req.body.reproduce
                  conflict.expected = req.body.expected
                  conflict.actual = req.body.actual
                  conflict.visibility = req.body.visibility
                  user.conflicts.unshift(conflict)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "image") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.image)) throw new Error("req.body.image is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  user.image = req.body.image
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "key-visibility") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.verifyIs("text/empty", req.body.key)) throw new Error("req.body.key is empty")
              if (Helper.verifyIs("text/empty", req.body.visibility)) throw new Error("req.body.visibility is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user[req.body.key] !== undefined) {
                    for (let i = 0; i < user[req.body.key].length; i++) {
                      const it = user[req.body.key][i]
                      if (it.created === req.body.id) {
                        it.visibility = req.body.visibility
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "profile") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.profile === undefined) user.profile = {}
                  if (user.profile.created === undefined) user.profile.created = Date.now()
                  user.profile.aboutYou = req.body.aboutYou
                  user.profile.whyThis = req.body.whyThis
                  user.profile.whyYou = req.body.whyYou
                  user.profile.strength = req.body.strength
                  user.profile.weakness = req.body.weakness
                  user.profile.motivation = req.body.motivation
                  user.profile.visibility = req.body.visibility
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "profile-message") {

            if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
            if (Helper.stringIsEmpty(req.body.message)) throw new Error("req.body.message is empty")
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.profile !== undefined) {
                if (user.profile.created === req.body.id) {
                  if (user.profile.messages === undefined) user.profile.messages = []
                  const message = {}
                  message.created = Date.now()
                  message.html = req.body.message
                  user.profile.messages.unshift(message)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "verified") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              if (Helper.booleanIsEmpty(req.body.verified)) throw new Error("req.body.verified is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.email === req.body.email) {
                        if (Helper.verifyIs("user/admin", user)) return res.sendStatus(404)
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

          if (req.params.event === "super-admin") {

            if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
            if (Helper.verifyIs("user/admin", {email: req.body.email})) {
              const doc = await nano.db.use("getyour").get("users")
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
                    user.admin = {}
                    user.admin.type = "role"
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
                user.admin = {}
                user.admin.type = "role"
                user.roles =  []
                user.roles.push(UserRole.ADMIN)
                doc.users.push(user)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }
            }


          }

          if (req.params.event === "text-tree-self") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.text)) throw new Error("req.body.text is empty")
              if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  const split = req.body.tree.split(".")
                  const lastKey = split.pop()
                  let current = user
                  for (let i = 0; i < split.length; i++) {
                    const key = split[i]
                    if (!current[key]) {
                      current[key] = {}
                    }
                    current = current[key]
                  }
                  current[lastKey] = req.body.text
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "tree-value-admin") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
              if (Helper.stringIsEmpty(req.body.value)) throw new Error("req.body.value is empty")
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")

              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", jwtUser)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.email === req.body.email) {
                        let target = user
                        const splitTree = req.body.tree.split(".")
                        if (splitTree[0] === "user") {
                          if (splitTree[1] === "id") return res.sendStatus(404)
                          if (splitTree[1] === "session") return res.sendStatus(404)
                          let target = user
                          for (let k = 1; k < splitTree.length - 1; k++) {
                            const key = splitTree[k]
                            if (!target[key]) {
                              target[key] = {}
                            }
                            target = target[key]
                          }
                          const finalKey = splitTree[splitTree.length - 1]
                          target[finalKey] = req.body.value

                          const num = Number(req.body.value)
                          if (!isNaN(num)) {
                            target[finalKey] = num
                          }

                          if (req.body.value.startsWith("{") || req.body.value.startsWith("[")) {
                            try {
                              const obj = JSON.parse(res.body.value)
                              target[finalKey] = obj
                            } catch (error) {
                              target[finalKey] = req.body.value
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

          if (!Helper.verifyIs("text/empty", req.params.event)) {

            if (!Helper.isReserved(req.params.event)) throw new Error(`${req.params.event} is not reserved`)
            if (req.jwt !== undefined) {
              if (Helper.verifyIs("object/empty", req.body[req.params.event])) throw new Error(`req.body.${req.params.event} is empty`)
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user[req.params.event] === undefined) user[req.params.event] = []
                  const map = {...req.body[req.params.event]}
                  map.created = Date.now()
                  map.visibility = "closed"
                  const sorted = Helper.sort("keys/abc", map)
                  user[req.params.event].unshift(sorted)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

        }

        if (req.params.type === "platform") {

          if (req.params.event === "match-maker-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            if (platform["match-maker"] === undefined) platform["match-maker"] = []
                            const map = {}
                            map.created = Date.now()
                            map.name = req.body.name
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

          if (req.params.event === "role-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
                if (Helper.stringIsEmpty(req.body.home)) throw new Error("req.body.home is empty")
                if (!Array.isArray(req.body.apps)) throw new Error("req.body.apps is not an array")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            if (platform.roles === undefined) platform.roles = []
                            for (let i = 0; i < platform.roles.length; i++) {
                              const role = platform.roles[i]
                              if (role.name === req.body.name) throw new Error("req.body.name exist")
                            }
                            const role = {}
                            role.created = Date.now()
                            role.name = req.body.name
                            role.home = req.body.home
                            role.apps = req.body.apps
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

          if (req.params.event === "name-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.new)) throw new Error("req.body.new is empty")
                if (Helper.stringIsEmpty(req.body.old)) throw new Error("req.body.old is empty")
                if (Helper.verifyIs("key/reserved", req.body.new)) throw new Error("req.body.new is reserved")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.old) {
                            if (platform.values !== undefined) {
                              for (let i = 0; i < platform.values.length; i++) {
                                const value = platform.values[i]
                                value.path = `/${user["getyour"].expert.name}/${req.body.new}/${value.path.split("/")[3]}/`
                              }
                            }
                            platform.name = req.body.new
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

          if (req.params.event === "image-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            platform.image = req.body.image ?? "";
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

          if (req.params.event === "image-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.objectIsEmpty(req.body.image)) throw new Error("req.body.image is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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
          }

          if (req.params.event === "start-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.stringIsEmpty(req.body.start)) throw new Error("req.body.start is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            platform.start = req.body.start
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

          if (req.params.event === "visibility-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.stringIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "expert-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                const doc = await nano.db.use("getyour").get("users")
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
                if (Helper.verifyIs("key/reserved", req.body.platform)) throw new Error("req.body.platform is reserved")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms === undefined) user["getyour"].expert.platforms = []
                      if (user[req.body.platform] === undefined) user[req.body.platform] = {}
                      const map = {}
                      map.name = req.body.platform
                      map.created = Date.now()
                      map.visibility = "closed"
                      user["getyour"].expert.platforms.push(map)
                      if (user.xp === undefined) user.xp = 0
                      user.xp = user.xp + 3
                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "value-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
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
                            value.created = Date.now()
                            value.path = `/${user["getyour"].expert.name}/${platform.name}/${req.body.path}/`
                            value.alias = req.body.alias
                            value.visibility = "closed"
                            value.roles = []
                            value.authorized = []
                            value.type = "text/html"
                            value.html = Helper.readFileSyncToString("../lib/values/toolbox.html")
                            if (platform.values === undefined) platform.values = []
                            platform.values.unshift(value)
                            if (user.xp === undefined) user.xp = 0
                            user.xp = user.xp + 1
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

          if (req.params.event === "value-html-writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.html)) throw new Error("req.body.html is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (Helper.verifyIs("user/location-expert", {user, req})) {
                        if (user["getyour"].expert.platforms !== undefined) {
                          for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]
                            if (platform.name === req.location.platform) {
                              if (platform.values !== undefined) {
                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]
                                  if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                                    if (value.writability !== undefined) {
                                      for (let i = 0; i < value.writability.length; i++) {
                                        const authorized = value.writability[i]
                                        if (jwtUser.email === authorized) {
                                          value.html = req.body.html
                                          if (jwtUser.xp === undefined) jwtUser.xp = 0
                                          jwtUser.xp++
                                          if (value.saved === undefined) value.saved = 0
                                          value.saved++
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

          if (req.params.event === "value-html-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.html)) throw new Error("req.body.html is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.location.platform) {
                            if (platform.values !== undefined) {
                              for (let i = 0; i < platform.values.length; i++) {
                                const value = platform.values[i]
                                if (value.path === `/${req.location.expert}/${req.location.platform}/${req.location.path}/`) {
                                  value.html = req.body.html
                                  if (user.xp === undefined) user.xp = 0
                                  user.xp++
                                  if (value.saved === undefined) value.saved = 0
                                  value.saved++
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

          if (req.params.event === "value-path-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.old)) throw new Error("req.body.old is empty")
                if (Helper.stringIsEmpty(req.body.new)) throw new Error("req.body.new is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          for (let i = 0; i < platform.values.length; i++) {
                            const value = platform.values[i]
                            if (value.path === req.body.old) {
                              value.path = `/${user["getyour"].expert.name}/${platform.name}/${req.body.new}/`
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

          if (req.params.event === "value-alias-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "value-image-expert") {
            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                if (Helper.stringIsEmpty(req.body.image)) throw new Error("req.body.image is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "value-image-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.objectIsEmpty(req.body.image)) throw new Error("req.body.image is empty")
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "value-lang-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.lang)) throw new Error("req.body.lang is empty")
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "value-visibility-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                if (Helper.stringIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "value-visibility-writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                if (Helper.stringIsEmpty(req.body.visibility)) throw new Error("req.body.visibility is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.getyour !== undefined) {
                        if (user.getyour.expert !== undefined) {
                          if (user.getyour.expert.platforms !== undefined) {
                            for (let i = 0; i < user.getyour.expert.platforms.length; i++) {
                              const platform = user.getyour.expert.platforms[i]
                              if (platform.values !== undefined) {
                                for (let i = 0; i < platform.values.length; i++) {
                                  const value = platform.values[i]
                                  if (value.path === req.body.path) {
                                    if (value.writability !== undefined) {
                                      for (let i = 0; i < value.writability.length; i++) {
                                        const authorized = value.writability[i]
                                        if (jwtUser.email === authorized) {
                                          value.visibility = req.body.visibility
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

          if (req.params.event === "value-writability-location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                if (!Array.isArray(req.body.writability)) throw new Error("req.body.writability is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.values !== undefined) {
                            for (let i = 0; i < platform.values.length; i++) {
                              const value = platform.values[i]
                              if (value.path === req.body.path) {
                                value.writability = req.body.writability
                                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                                for (let i = 0; i < req.body.writability.length; i++) {
                                  const writableEmail = req.body.writability[i]
                                  await Helper.sendEmailFromDroid({
                                    from: "<droid@get-your.de>",
                                    to: writableEmail,
                                    subject: "[getyour] Schreibrechte erhalten",
                                    html: `Du hast Schreibrechten von '${user.email}' erhalten und kannst ab jetzt die Werteinheit '${req.body.path}' bearbeiten.<br><br><a href="https://www.get-your.de${req.body.path}">Klicke hier, um die Werteinheit zu öffnen.</a>`
                                  })
                                }
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

        if (req.params.type === "expert") {

          if (req.params.event === "alias-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.alias)) throw new Error("req.body.alias is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      user["getyour"].expert.alias = req.body.alias
                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "email-admin") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", jwtUser)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const child = doc.users[i]
                      if (child.email === req.body.email) {
                        if (Helper.verifyIs("user/expert", child)) {
                          throw new Error("expert exist")
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

          if (req.params.event === "image-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.image)) throw new Error("req.body.image is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      user["getyour"].expert.image = req.body.image
                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "description-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      user["getyour"].expert.description = req.body.description
                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "name-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

        if (req.params.type === "email") {

          if (req.params.event === "location") {

            if (req.location !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              const doc = await nano.db.use("getyour").get("users")
              if (req.body.email.endsWith(process.env.ADMIN_DOMAIN)) {

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

        if (req.params.type === "owner") {

          if (req.params.event === "closed") {
            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.firstname)) throw new Error("req.body.firstname is empty")
              if (Helper.stringIsEmpty(req.body.lastname)) throw new Error("req.body.lastname is empty")
              if (Helper.stringIsEmpty(req.body.street)) throw new Error("req.body.street is empty")
              if (Helper.stringIsEmpty(req.body.zip)) throw new Error("req.body.zip is empty")
              if (Helper.stringIsEmpty(req.body.country)) throw new Error("req.body.country is empty")
              if (Helper.stringIsEmpty(req.body.state)) throw new Error("req.body.state is empty")
              if (Helper.stringIsEmpty(req.body.phone)) throw new Error("req.body.phone is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.owner === undefined) user.owner = {}
                  user.owner.firstname = req.body.firstname
                  user.owner.lastname = req.body.lastname
                  user.owner.street = req.body.street
                  user.owner.zip = req.body.zip
                  user.owner.country = req.body.country
                  user.owner.state = req.body.state
                  user.owner.phone = req.body.phone
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

        }

        if (!Helper.verifyIs("text/empty", req.params.type)) {

          if (!Helper.verifyIs("text/empty", req.params.event)) {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
              if (Helper.stringIsEmpty(req.body[req.params.event])) throw new Error(`req.body.${req.params.event} is empty`)
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user[req.params.type] !== undefined) {
                    for (let i = 0; i < user[req.params.type].length; i++) {
                      const it = user[req.params.type][i]
                      if (it.created === req.body.created) {
                        it[req.params.event] = req.body[req.params.event]
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

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async remove(req, res, next) {
    try {

      if (req.params.method === "remove") {

        if (req.params.type === "contacts") {

          if (req.params.event === "id-self") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.contacts !== undefined) {
                    for (let i = 0; i < user.contacts.length; i++) {
                      const contact = user.contacts[i]
                      if (contact.created === req.body.id) {
                        user.contacts.splice(i, 1)
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

        if (req.params.type === "deadline") {

          if (req.params.event === "closed") {
            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.deadlines !== undefined) {
                    for (let i = 0; i < user.deadlines.length; i++) {
                      const deadline = user.deadlines[i]
                      if (deadline.created === req.body.id) {
                        user.deadlines.splice(i, 1)
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

        if (req.params.type === "groups") {

          if (req.params.event === "id-self") {
            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.groups !== undefined) {
                  for (let i = 0; i < user.groups.length; i++) {
                    const group = user.groups[i]
                    if (group.created === req.body.id) {
                      if (group.emails.includes(user.email)) {
                        group.emails = group.emails.filter(it => it.toLowerCase() !== user.email.toLowerCase())
                      }
                      if (group.emails.length < 2) user.groups.splice(i, 1)
                      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                      return res.sendStatus(200)
                    }
                  }
                }
              }
            }
          }

        }

        if (req.params.type === "match-maker") {

          if (req.params.event === "condition") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                const doc = await nano.db.use("getyour").get("users")
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
          }

          if (req.params.event === "expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

        if (req.params.type === "location") {

          if (req.params.event === "email-expert") {
            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
              if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const location = req.body.path.split("/")[2]
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  if (Helper.verifyIs("user/expert", jwtUser)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.email === req.body.email) {
                        if (user[location] !== undefined) {
                          if (user[location][req.body.tag] !== undefined) {
                            for (let i = 0; i < user[location][req.body.tag].length; i++) {
                              const item = user[location][req.body.tag][i]
                              if (item.created === req.body.id) {
                                user[location][req.body.tag].splice(i, 1)
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

          if (req.params.event === "tag-self") {
            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform][req.body.tag] !== undefined) {
                        for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
                          const item = user[req.location.platform][req.body.tag][i]
                          if (item.created === req.body.id) {
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

          if (req.params.event === "super-admin") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
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

        if (req.params.type === "feedback") {

          if (req.params.event === "script") {

            if (Helper.numberIsEmpty(req.body.scriptId)) throw new Error("req.body.scriptId is empty")
            if (Helper.numberIsEmpty(req.body.feedbackId)) throw new Error("req.body.feedbackId is empty")
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.scripts !== undefined) {
                for (let i = 0; i < user.scripts.length; i++) {
                  const script = user.scripts[i]
                  if (script.created === req.body.scriptId) {
                    for (let i = 0; i < script.feedback.length; i++) {
                      const feedback = script.feedback[i]
                      if (feedback.created === req.body.feedbackId) {
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

          if (req.params.event === "html-value") {

            if (req.location !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (Helper.verifyIs("user/location-expert", {user, req})) {
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
                                  if (feedback.created === req.body.id) {
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

        if (req.params.type === "user") {

          if (req.params.event === "blocked") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.blocked !== undefined) {
                    for (let i = 0; i < user.blocked.length; i++) {
                      const blocked = user.blocked[i]
                      if (blocked.id === req.body.id) {
                        user.blocked.splice(i, 1)
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "funnel") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.funnel !== undefined) {
                    for (let i = 0; i < user.funnel.length; i++) {
                      const funnel = user.funnel[i]
                      if (funnel.created === req.body.created) {
                        user.funnel.splice(i, 1)
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "profile-message") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.profile !== undefined) {
                    if (user.profile.messages !== undefined) {
                      for (let i = 0; i < user.profile.messages.length; i++) {
                        const message = user.profile.messages[i]
                        if (message.created === req.body.id) {
                          user.profile.messages.splice(i, 1)
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

          if (req.params.event === "tree-admin") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (!Helper.verifyIs("key/deletable", req.body.key)) throw new Error("key not deletable")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.created === req.body.id) {
                        if (req.body.tree.includes(".")) {
                          const keys = req.body.tree.split(".")
                          let value = user
                          let previousIsArray
                          let array
                          for (let i = 0; i < keys.length; i++) {
                            const key = keys[i]
                            if (value[key] !== undefined) {
                              if (i === keys.length - 2) {
                                if (Array.isArray(value[key])) {
                                  previousIsArray = true
                                  array = value[key]
                                }
                              }
                              if (i === keys.length - 1) {
                                if (previousIsArray === true) {
                                  const index = array.indexOf(value[key])
                                  array.splice(index, 1)
                                  break
                                }
                                value[key] = undefined
                                break
                              } else {
                                value = value[key]
                              }
                            } else {
                              return res.sendStatus(404)
                            }
                          }
                        } else {
                          if (user[req.body.tree] !== undefined) {
                            user[req.body.tree] = undefined
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

          if (req.params.event === "scripts") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.scripts !== undefined) {
                    for (let i = 0; i < user.scripts.length; i++) {
                      const script = user.scripts[i]
                      if (script.created === req.body.created) {
                        user.scripts.splice(i, 1)
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "self") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              let id
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) return res.sendStatus(404)
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

          if (req.params.event === "sources") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.sources !== undefined) {
                    for (let i = 0; i < user.sources.length; i++) {
                      const source = user.sources[i]
                      if (source.created === req.body.created) {
                        user.sources.splice(i, 1)
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "templates") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user.templates !== undefined) {
                    for (let i = 0; i < user.templates.length; i++) {
                      const template = user.templates[i]
                      if (template.created === req.body.created) {
                        user.templates.splice(i, 1)
                        await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "by-admin") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              let id
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.created === req.body.id) {
                        if (Helper.verifyIs("user/admin", user)) return res.sendStatus(404)
                        id = user.id
                        doc.users.splice(i, 1)
                      }
                    }
                  }
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

          if (!Helper.verifyIs("text/empty", req.params.event)) {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.created)) throw new Error("req.body.created is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user[req.params.event] !== undefined) {
                    for (let i = 0; i < user[req.params.event].length; i++) {
                      const it = user[req.params.event][i]
                      if (it.created === req.body.created) {
                        user[req.params.event].splice(i, 1)
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

          if (req.params.event === "role-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            if (platform.roles !== undefined) {
                              for (let i = 0; i < platform.roles.length; i++) {
                                const role = platform.roles[i]
                                if (role.created === req.body.id) {
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

          if (req.params.event === "value-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
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

          if (req.params.event === "expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.verifyIs("key/reserved", req.body.platform)) throw new Error("reserved word")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user[req.body.platform] !== undefined) user[req.body.platform] = undefined
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

          if (req.params.event === "lat-lon") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("text/empty", req.body.to)) throw new Error("req.body.to is empty")
              if (Helper.verifyIs("number/empty", req.body.lat)) throw new Error("req.body.lat is empty")
              if (Helper.verifyIs("number/empty", req.body.lon)) throw new Error("req.body.lon is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  await Helper.sendEmailFromDroid({
                    from: user.email,
                    to: req.body.to,
                    subject: "[getyour] Standort",
                    html: `
                    <p>Dir wurde von '${user.email}' ein Standort zugeschickt.</p>
                    <a href="https://www.google.com/maps?saddr=Mein+Standort&daddr=${req.body.lat},${req.body.lon}" target="_blank">Klicke hier, um von deinem Standort aus eine Route zu planen</a>
                    `
                  })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "test-template") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.subject)) throw new Error("req.body.subject is empty")
              if (Helper.stringIsEmpty(req.body.template)) throw new Error("req.body.template is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  await Helper.sendEmailFromDroid({
                    from: "<droid@get-your.de>",
                    to: user.email,
                    subject: "[test] " + req.body.subject,
                    html: req.body.template
                  })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "send-template") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.subject)) throw new Error("req.body.subject is empty")
              if (Helper.stringIsEmpty(req.body.template)) throw new Error("req.body.template is empty")
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  await Helper.sendEmailFromDroid({
                    from: user.email,
                    to: req.body.email,
                    subject: req.body.subject,
                    html: req.body.template
                  })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (req.params.event === "invite-expert-admin") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    await Helper.sendEmailFromDroid({
                      from: user.email,
                      to: req.body.email,
                      subject: "[getyour] Einladung",
                      html: `Du wurdest von ${user.email} eingeladen an unsere Plattform teilzunehmen.<br><br><a href="https://www.get-your.de/">Klicke hier, um deine Plattform zu starten.</a>`
                    })
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

  static async update(req, res, next) {
    try {

      if (req.params.method === "update") {

        if (req.params.type === "paths") {

          if (req.params.event === "html") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (Helper.verifyIs("array/empty", req.body.paths)) throw new Error("req.body.paths is empty")
                if (Helper.verifyIs("text/empty", req.body.html)) throw new Error("req.body.html is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verify("user/location-expert", user, req.location.expert)) {
                      for (let i = 0; i < req.body.paths.length; i++) {
                        const path = req.body.paths[i]
                        if (user["getyour"].expert.platforms !== undefined) {
                          platformLoop: for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]
                            if (platform.values !== undefined) {
                              for (let i = 0; i < platform.values.length; i++) {
                                const value = platform.values[i]
                                if (value.path === path) {
                                  if (!value.html.includes(req.body.html)) {
                                    value.html = value.html.replace(/<\/body>/, `${req.body.html}<\/body>`)
                                  }
                                  break platformLoop
                                }
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

          if (req.params.event === "html-add-feedback-script") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (Helper.verifyIs("array/empty", req.body.paths)) throw new Error("req.body.paths is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verify("user/location-expert", user, req.location.expert)) {
                      for (let i = 0; i < req.body.paths.length; i++) {
                        const path = req.body.paths[i]
                        if (user["getyour"].expert.platforms !== undefined) {
                          platformLoop: for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]
                            if (platform.values !== undefined) {
                              for (let i = 0; i < platform.values.length; i++) {
                                const value = platform.values[i]
                                if (value.path === path) {
                                  const updatedScript = `import {Helper} from "/js/Helper.js"\nif (Helper.verifyIs("script-id/disabled", "html-feedback")) throw new Error("'script#html-feedback' disabled")\nHelper.add("html-feedback")`
                                  if (!value.html.includes(`<script id="html-feedback" type="module"`)) {
                                    value.html = value.html.replace(/<\/body>/, `<script id="html-feedback" type="module">${updatedScript}</script><\/body>`)
                                  }
                                  break platformLoop
                                }
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

          if (req.params.event === "html-add-requested-script") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (Helper.verifyIs("array/empty", req.body.paths)) throw new Error("req.body.paths is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verify("user/location-expert", user, req.location.expert)) {
                      for (let i = 0; i < req.body.paths.length; i++) {
                        const path = req.body.paths[i]
                        if (user["getyour"].expert.platforms !== undefined) {
                          platformLoop: for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                            const platform = user["getyour"].expert.platforms[i]
                            if (platform.values !== undefined) {
                              for (let i = 0; i < platform.values.length; i++) {
                                const value = platform.values[i]
                                if (value.path === path) {
                                  const updatedScript = `import {Helper} from "/js/Helper.js"\nif (Helper.verifyIs("script-id/disabled", "html-requested")) throw new Error("'script#html-requested' disabled")\nHelper.request("/register/location/html-requested/")`
                                  if (!value.html.includes(`<script id="html-requested" type="module"`)) {
                                    value.html = value.html.replace(/<\/body>/, `<script id="html-requested" type="module">${updatedScript}</script><\/body>`)
                                  }
                                  break platformLoop
                                }
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

        if (req.params.type === "toolbox") {

          if (req.params.event === "path-location-expert") {

            if (req.location !== undefined) {
              if (req.jwt !== undefined) {
                if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verify("user/location-expert", user, req.location.expert)) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.values !== undefined) {
                            for (let i = 0; i < platform.values.length; i++) {
                              const value = platform.values[i]
                              if (value.path === req.body.path) {
                                const updatedScript = `
                                import {Helper} from "/js/Helper.js"
                                await Helper.add("toolbox/onbody")
                                `
                                if (!value.html.includes(`<script id="toolbox-getter" type="module"`)) {
                                  value.html = value.html.replace(/<\/body>/, `<script id="toolbox-getter" type="module">${updatedScript}</script><\/body>`)
                                }
                                value.html = value.html.replace(/<script id="toolbox-getter" type="module"[\s\S]*?<\/script>/s, `<script id="toolbox-getter" type="module">${updatedScript}</script>`)
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

        if (req.params.type === "match-maker") {

          if (req.params.event === "condition") {
            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                if (Helper.stringIsEmpty(req.body.left)) throw new Error("req.body.left is empty")
                if (Helper.stringIsEmpty(req.body.operator)) throw new Error("req.body.operator is empty")
                if (Helper.stringIsEmpty(req.body.right)) throw new Error("req.body.right is empty")
                const doc = await nano.db.use("getyour").get("users")
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

        if (req.params.type === "location") {

          if (req.params.event === "list-self") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
                if (Helper.objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (user[req.location.platform] !== undefined) {
                      if (user[req.location.platform][req.body.tag] !== undefined) {
                        for (let i = 0; i < user[req.location.platform][req.body.tag].length; i++) {
                          const locationList = user[req.location.platform][req.body.tag][i]
                          if (locationList.created === req.body.id) {
                            Object.keys(req.body.map).forEach(key => {
                              if (key !== 'created') {
                                locationList[key] = req.body.map[key]
                              }
                            })
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

          if (req.params.event === "list-email-expert") {
            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              if (Helper.stringIsEmpty(req.body.tag)) throw new Error("req.body.tag is empty")
              if (Helper.objectIsEmpty(req.body.map)) throw new Error("req.body.map is empty")
              const location = req.body.path.split("/")[2]
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  if (Helper.verifyIs("user/expert", jwtUser)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.email === req.body.email) {
                        if (user[location] !== undefined) {
                          if (user[location][req.body.tag] !== undefined) {
                            for (let i = 0; i < user[location][req.body.tag].length; i++) {
                              const item = user[location][req.body.tag][i]
                              if (item.created === req.body.id) {
                                Object.keys(req.body.map).forEach(key => {
                                  if (key !== 'created') {
                                    item[key] = req.body.map[key]
                                  }
                                })
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

        if (req.params.type === "user") {

          if (req.params.event === "key-name-tree-admin") {

            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
              if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.created === req.body.id) {
                        if (req.body.tree.includes(".")) {
                          const keys = req.body.tree.split(".")
                          let value = user
                          for (let i = 0; i < keys.length; i++) {
                            const key = keys[i]
                            if (value[key] !== undefined) {
                              if (i === keys.length - 1) {
                                value[req.body.name] = value[key]
                                value[key] = undefined
                                break
                              } else {
                                value = value[key]
                              }
                            } else {
                              return res.sendStatus(404)
                            }
                          }
                        } else {
                          if (user[req.body.tree] !== undefined) {
                            user[req.body.name] = user[req.body.tree]
                            user[req.body.tree] = undefined
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

          if (req.params.event === "number-tree-admin") {

            if (req.jwt !== undefined) {
              req.body.number = Helper.convert("text/number", req.body.number)
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
              if (Helper.numberIsEmpty(req.body.number)) throw new Error("req.body.number is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.created === req.body.id) {
                        if (req.body.tree.includes(".")) {
                          const keys = req.body.tree.split(".")
                          let value = user
                          for (let i = 0; i < keys.length; i++) {
                            const key = keys[i]
                            if (value[key] !== undefined) {
                              if (i === keys.length - 1) {
                                if (typeof value[key] === "number") {
                                  value[key] = req.body.number
                                }
                                break
                              } else {
                                value = value[key]
                              }
                            } else {
                              return res.sendStatus(404)
                            }
                          }
                        } else {
                          if (user[req.body.tree] !== undefined) {
                            user[req.body.tree] = req.body.number
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

          if (req.params.event === "text-tree-admin") {
            if (req.jwt !== undefined) {
              if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
              if (Helper.stringIsEmpty(req.body.tree)) throw new Error("req.body.tree is empty")
              if (Helper.stringIsEmpty(req.body.text)) throw new Error("req.body.text is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user.created === req.body.id) {
                        if (req.body.tree.includes(".")) {
                          const keys = req.body.tree.split(".")
                          let value = user
                          for (let i = 0; i < keys.length; i++) {
                            const key = keys[i]
                            if (value[key] !== undefined) {
                              if (i === keys.length - 1) {
                                if (typeof value[key] === "string") {
                                  value[key] = req.body.text
                                }
                                break
                              } else {
                                value = value[key]
                              }
                            } else {
                              return res.sendStatus(404)
                            }
                          }
                        } else {
                          if (user[req.body.tree] !== undefined) {
                            user[req.body.tree] = req.body.text
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

          if (!Helper.verifyIs("text/empty", req.params.event)) {

            if (!Helper.isReserved(req.params.event)) throw new Error(`${req.params.event} is not reserved`)
            if (req.jwt !== undefined) {
              if (Helper.verifyIs("number/empty", req.body.created)) throw new Error("req.body.created is empty")
              if (Helper.verifyIs("object/empty", req.body[req.params.event])) throw new Error("req.body.source is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user[req.params.event] !== undefined) {
                    for (let i = 0; i < user[req.params.event].length; i++) {
                      const it = user[req.params.event][i]
                      if (it.created === req.body.created) {
                        user[req.params.event][i] = { ...it, ...req.body[req.params.event] }
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

          if (req.params.event === "role-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                if (Helper.numberIsEmpty(req.body.id)) throw new Error("req.body.id is empty")
                if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
                if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
                if (Helper.stringIsEmpty(req.body.home)) throw new Error("req.body.home is empty")
                if (!Array.isArray(req.body.apps)) throw new Error("req.body.apps is not an array")
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (Helper.verifyIs("user/location-expert", {user, req})) {
                      if (user["getyour"].expert.platforms !== undefined) {
                        for (let i = 0; i < user["getyour"].expert.platforms.length; i++) {
                          const platform = user["getyour"].expert.platforms[i]
                          if (platform.name === req.body.platform) {
                            if (platform.roles !== undefined) {
                              for (let i = 0; i < platform.roles.length; i++) {
                                const role = platform.roles[i]
                                if (role.created === req.body.id) {
                                  role.name = req.body.name
                                  role.home = req.body.home
                                  role.apps = req.body.apps
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

  static async upload(req, res, next) {
    try {

      if (req.params.type === "mp3-file") {

        if (req.jwt !== undefined) {
          const doc = await nano.db.use("getyour").get("users")
          for (var i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]
            if (user.id === req.jwt.id) {
              const file = req.files[0]
              if (user["soundbox"] === undefined) user["soundbox"] = []
              const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY })
              const mp3 = new Blob([file.buffer])
              const cid = await client.storeBlob(mp3)
              if (!user["soundbox"].some((sound) => sound.cid === cid)) {
                user["soundbox"].push({ cid, created: Date.now() })
              }
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }
          }
        }

      }

      if (req.params.type === "mp3-files") {

        if (req.jwt !== undefined) {
          const doc = await nano.db.use("getyour").get("users")
          for (var i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]
            if (user.id === req.jwt.id) {
              const promises = []
              for (var i = 0; i < req.files.length; i++) {
                const file = req.files[i]
                if (user["soundbox"] === undefined) user["soundbox"] = []
                const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY })
                const mp3 = new Blob([file.buffer])
                const promise = client.storeBlob(mp3)
                promises.push(promise)
                promise.then(cid => {
                  if (!user["soundbox"].some((sound) => sound.cid === cid)) {
                    user["soundbox"].push({ cid, created: Date.now() })
                  }
                })
              }
              await Promise.all(promises)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }
          }
        }

      }

    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verify(req, res, next) {
    try {

      if (req.params.method === "verify") {

        if (req.params.type === "group") {

          if (req.params.event === "is-creator") {

            if (req.jwt !== undefined) {
              if (Helper.verifyIs("number/empty", req.body.id)) throw new Error("req.body.id is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.groups !== undefined) {
                  for (let i = 0; i < user.groups.length; i++) {
                    const group = user.groups[i]
                    if (group.created === req.body.id) {
                      if (user.id === req.jwt.id) return res.sendStatus(200)
                    }
                  }
                }
              }
            }
          }

        }

        if (req.params.type === "user") {

          if (req.params.event === "admin") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", user)) return res.sendStatus(200)
                }
              }
            }

          }

          if (req.params.event === "jwt-in-emails") {

            if (req.jwt !== undefined) {

              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (Helper.verifyIs("array/empty", req.body.emails)) throw new Error("req.body.emails is empty")
                  const doc = await nano.db.use("getyour").get("users")
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.id === req.jwt.id) {
                      for (let i = 0; i < req.body.emails.length; i++) {
                        const email = req.body.emails[i]
                        if (user.email === email) return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }
          }

          if (req.params.event === "location-writable") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const jwtUser = doc.users[i]
                  if (jwtUser.id === req.jwt.id) {
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
                                        if (value.writability !== undefined) {
                                          for (let i = 0; i < value.writability.length; i++) {
                                            const authorized = value.writability[i]
                                            if (jwtUser.email === authorized) {
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

          if (req.params.event === "location-expert") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
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

          if (req.params.event === "messages") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  for (let i = 0; i < doc.users.length; i++) {
                    const user = doc.users[i]
                    if (user.messages !== undefined) {
                      for (let i = 0; i < user.messages.length; i++) {
                        const message = user.messages[i]
                        if (message.to === jwtUser.created) {
                          const oneDayInMillis = 24 * 60 * 60 * 1000
                          const now = Date.now()
                          const timeDifference = now - message.created
                          if (timeDifference <= oneDayInMillis) {
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

          if (req.params.event === "expert") {

            if (req.jwt !== undefined) {
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]
                if (user.id === req.jwt.id) {
                  if (user["getyour"] !== undefined) {
                    if (user["getyour"].expert !== undefined) {
                      if (user["getyour"].expert.name !== undefined) {
                        return res.sendStatus(200)
                      }
                    }
                  }
                }
              }
            }

          }

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {
              if (req.body.localStorageId !== undefined) {
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.body.localStorageId) {
                    if (user.id === req.jwt.id) return res.sendStatus(200)
                  }
                }
              }
            }

          }

          if (req.params.event === "url-id") {

            if (req.jwt !== undefined) {
              if (req.location !== undefined) {
                const urlId = req.location.url.pathname.split("/")[4]
                const doc = await nano.db.use("getyour").get("users")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]
                  if (user.id === req.jwt.id) {
                    if (req.jwt.id === urlId) {
                      return res.sendStatus(200)
                    }
                  }
                }
              }
            }
          }
        }

        if (req.params.type === "match-maker") {

          if (req.params.event === "conditions") {

            if (req.jwt !== undefined) {
              if (Helper.arrayIsEmpty(req.body.conditions)) throw new Error("req.body.conditions is empty")
              const doc = await nano.db.use("getyour").get("users")
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

          if (req.params.event === "name") {

            if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
            if (Helper.verifyIs("key/reserved", req.body.name)) return res.sendStatus(200)
            const doc = await nano.db.use("getyour").get("users")
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

        if (req.params.type === "platform") {

          if (req.params.event === "role-name") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
              if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
              if (Helper.verifyIs("key/reserved", req.body.name)) return res.sendStatus(200)
              const doc = await nano.db.use("getyour").get("users")
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

          if (req.params.event === "exist") {

            if (Helper.stringIsEmpty(req.body.platform)) throw new Error("req.body.platform is empty")
            if (Helper.verifyIs("key/reserved", req.body.platform)) return res.sendStatus(200)
            const doc = await nano.db.use("getyour").get("users")
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
            return res.sendStatus(404)
          }

          if (req.params.event === "value-path-exist") {

            if (Helper.stringIsEmpty(req.body.path)) throw new Error("req.body.path is empty")
            const doc = await nano.db.use("getyour").get("users")
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (Helper.verifyIs("user/expert", user)) {
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

        if (req.params.type === "email") {

          if (req.params.event === "closed") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.email)) throw new Error("req.body.email is empty")
              const doc = await nano.db.use("getyour").get("users")
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

        if (req.params.type === "expert") {

          if (req.params.event === "name-exist") {

            if (req.jwt !== undefined) {
              if (Helper.stringIsEmpty(req.body.name)) throw new Error("req.body.name is empty")
              const doc = await nano.db.use("getyour").get("users")
              for (let i = 0; i < doc.users.length; i++) {
                const jwtUser = doc.users[i]
                if (jwtUser.id === req.jwt.id) {
                  if (Helper.verifyIs("user/admin", jwtUser)) {
                    for (let i = 0; i < doc.users.length; i++) {
                      const user = doc.users[i]
                      if (user["getyour"] !== undefined) {
                        if (user["getyour"].expert !== undefined) {
                          if (user["getyour"].expert.name === req.body.name) {
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

        if (Helper.stringIsEmpty(sessionToken)) throw new Error("session token is empty")

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")

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

  static async verifyEvent(req, res, next) {
    try {

      if (req.params.event === "open") {

        if (Helper.objectIsEmpty(req.location)) throw new Error("req.location is empty")
        if (Helper.objectIsEmpty(req.referer)) throw new Error("req.referer is empty")
        return next()

      }

      if (req.params.event === "closed") {

        if (Helper.objectIsEmpty(req.location)) throw new Error("req.location is empty")
        if (Helper.objectIsEmpty(req.referer)) throw new Error("req.referer is empty")
        if (Helper.stringIsEmpty(req.body.localStorageId)) throw new Error("local storage id is empty")
        if (Helper.stringIsEmpty(req.body.localStorageEmail)) throw new Error("local storage email is empty")
        if (Helper.objectIsEmpty(req.jwt)) throw new Error("req.jwt is empty")
        const doc = await nano.db.use("getyour").get("users")
        let found = false
        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]
          if (user.id === req.body.localStorageId) {
            if (user.id === req.jwt.id) {
              found = true
              break
            }
          }
        }
        if (found) return next()

      }

      return res.sendStatus(404)
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyJwtToken(req, res, next) {
    try {

      function logJwtTokenIsEmpty() {
        console.log('\x1b[31m%s\x1b[0m', "[error] jwt token is empty")
      }

      if (req.method === "GET") {

        if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
        const {jwtToken} = req.cookies
        if (Helper.stringIsEmpty(jwtToken)) {
          logJwtTokenIsEmpty()
          return res.redirect("/")
        }

        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const doc = await nano.db.use("getyour").get("users")
        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]
          if (user.id === jwt.id) {

            if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
            if (user.session.jwt !== Helper.digest(jwtToken)) {
              await Helper.logError(new Error("jwt token changed"), req)
              return res.redirect("/login/")
            }

            if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
            req.jwt = jwt
            if (Helper.objectIsEmpty(req.jwt)) throw new Error("jwt is empty")
            return next()

          }
        }
        return res.redirect("/")
      }

      if (req.method === "POST") {
        if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
        const {jwtToken} = req.cookies
        if (Helper.stringIsEmpty(jwtToken)) {
          return res.sendStatus(404)
        }
        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const doc = await nano.db.use("getyour").get("users")
        for (let i = 0; i < doc.users.length; i++) {
          const user = doc.users[i]
          if (user.id === jwt.id) {
            if (user.session.jwt !== Helper.digest(jwtToken)) throw new Error("jwt token changed")

            req.jwt = jwt
            if (Helper.objectIsEmpty(req.jwt)) throw new Error("jwt is empty")
            if (user.id === req.body.localStorageId) {
              return next()
            }

          }
        }
      }

      throw new Error("verify jwt token failed")
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

        return next()
      }

      throw new Error("verify jwt id failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyReferer(req, res, next) {
    try {
      if (req.body.referer !== undefined) {
        if (req.body.referer === "") {
          return next()
        } else {
          if (!Helper.stringIsEmpty(req.body.referer)) {
            const referer = new URL(req.body.referer)

            const allowedOrigins = [
              "http://localhost:9999",
              "https://localhost:9999",
              "https://get-your.de",
              "https://www.get-your.de",
            ]

            const isLocaltunnel = referer.origin.endsWith(".loca.lt") && referer.protocol === "https:"

            if (allowedOrigins.includes(referer.origin) || isLocaltunnel) {
              req.referer = referer
              return next()
            }

          }
          if (req.location.url.pathname === "/") return next()
        }
      }
      throw new Error("referer failed")
    } catch (error) {
      Helper.debounce(async() => await Helper.logError(error, req), 34)
    }
    return res.sendStatus(404)
  }

  static async verifyLocation(req, res, next) {
    try {
      if (req.body.location !== undefined) {
        const location = new URL(req.body.location)

        const allowedOrigins = [
          "http://localhost:9999",
          "https://localhost:9999",
          "https://get-your.de",
          "https://www.get-your.de",
        ]

        const isLocaltunnel = location.origin.endsWith(".loca.lt") && location.protocol === "https:"

        if (allowedOrigins.includes(location.origin) || isLocaltunnel) {
          req.location = {}
          req.location.url = location
          req.location.expert = location.pathname.split("/")[1]
          req.location.platform = location.pathname.split("/")[2]
          req.location.path = location.pathname.split("/")[3]
          return next()
        }

      }
      throw new Error("location failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

}
