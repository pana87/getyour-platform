require('dotenv').config()
const { UserRole } = require("./UserRole.js")
const { Helper } = require("./Helper.js")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

module.exports.Request = class {

  static async getErrors(req, res, next) {
    try {


      const {method, type} = req.body
      if (type === "error") {
        if (method === "get") {
          const doc = await nano.db.use("getyour").get("logs")
          const errors = []
          for (let i = 0; i < doc.logs.length; i++) {
            if (doc.logs[i].type === type) {
              errors.push(doc.logs[i])
            }
          }
          return res.send(errors)
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

      console.log("hi");
      const {urlId} = req.body
      if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
      const userFromUrlId = await (await Helper.findUser(user => user.id === urlId)).user


      const {localStorageId} = req.body
      const userFromLocalStorageId = await (await Helper.findUser(user => user.id === localStorageId)).user



      const {jwt} = req
      const userFromJwt = await (await Helper.findUser(user => user.id === jwt.id)).user



      if (urlId !== userFromUrlId.id) throw new Error("url id is not trusted")
      if (urlId !== userFromJwt.id) throw new Error("jwt id is not trusted")
      if (userFromJwt.id !== userFromUrlId.id) throw new Error("user id mismatch")



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

  static async getPlatforms(req, res, next) {
    try {

      const {type, method} = req.body

      if (type === "platforms") {
        if (method === "get") {
          const {name} = req.body
          if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
          const {user} = await Helper.findUser(user => user.name === name)
          // console.log(user);
          if (user.platforms === undefined) throw new Error("user platforms is undefined")

          const array = []
          for (let i = 0; i < user.platforms.length; i++) {
            const platform = {}
            platform.name = user.platforms[i].name
            platform.logo = user.platforms[i].logo
            platform.home = user.platforms[i].home
            array.push(platform)
          }

          return res.send(array)
        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyName(req, res, next) {
    try {
      const {type, security, method, name} = req.body

      if (type === "name") {
        if (method === "verify") {
          if (security === "closed") {
            // const {jwt} = req
            // const {user} = await Helper.findUser(user => user.id === jwt.id)
            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")
            for (let i = 0; i < doc.users.length; i++) {
              // console.log(doc.users[i].name);
              // console.log(name);

              // not changable name feature
              // if (doc.users[i].name !== undefined) return res.sendStatus(200)
              if (doc.users[i].name === name) return res.sendStatus(200)
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

  static async registerName(req, res, next) {
    try {

      const {type, security, method} = req.body

      if (type === "name") {
        if (method === "register") {
          if (security === "closed") {
            const {jwt} = req
            const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
            const {name} = req.body
            if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
            user.name = name
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }
        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async redirectUser(req, res, next) {
    try {
      const {method, type} = req.body

      if (type === "user") {
        if (method === "redirect") {

          const {referrer, location} = req.body
          if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
          const loc = new URL(location)
          let ref = ""
          if (referrer !== "") {
            ref = new URL(referrer)
          }
          const {localStorageId} = req.body
          const {user} = await Helper.findUser(user => user.id === localStorageId)

          if (user.roles.length === 0) {
            if (user.email.endsWith("@get-your.de")) return res.send("/pana/getyour/entwickler-registrieren/")
            if (loc.pathname.startsWith("/felix/shs/")) {
              if (ref.pathname === "/felix/shs/hersteller-vergleich/") return res.send(ref.pathname)
              return res.send(loc.pathname)
            }
            return res.send("/pana/getyour/zugang/")
          }

          for (let i = 0; i < user.roles.length; i++) {
            if (user.roles[i] === UserRole.OPERATOR) {
              if (user.checklists.length === 0) return res.send("/felix/shs/abfrage-persoenliches/")


              return res.send(`/felix/shs/${localStorageId}/`)
            }
            if (user.roles[i] === UserRole.PLATFORM_DEVELOPER) {
              if (user.name === undefined) return res.send("/pana/getyour/entwickler-registrieren/")
              if (user.name !== undefined) return res.send(`/${user.name}/`)
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

  static async registerLead(req, res, next) {
    try {
      const {method, type} = req.body

      if (type === "lead") {
        if (method === "register") {

          const {phone, contactType, date} = req.body
          const {jwt} = req
          if (Helper.stringIsEmpty(contactType)) throw new Error("contact type is empty")
          if (Helper.stringIsEmpty(date)) throw new Error("date is empty")
          if (contactType === "Telefon") {
            if (Helper.stringIsEmpty(phone)) throw new Error("phone is empty")
          }

          const {doc, user} = await Helper.findUser(user => user.id === jwt.id)

          user.lead = {}
          user.lead.id = Helper.digest(`${Date.now()}`)
          user.lead.type = contactType
          user.lead.phone = phone
          user.lead.contactAt = new Date(date).getTime()
          user.lead.createdAt = Date.now()
          user.lead.state = "pending"
          user.lead.quality = "qualified"

          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
          return res.sendStatus(200)



        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async registerChecklist(req, res, next) {
    try {
      const {method, type} = req.body

      if (type === "checklist") {
        if (method === "register") {


          const {jwt} = req
          const {doc, user} = await Helper.findUser(user => user.id === jwt.id)

          if (user.checklists === undefined) user.checklists = []

          if (user.checklists.length === 0) {
            const checklist = Helper.createSHSChecklist({user, jwt})
            user.checklists.push(checklist)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }


          const {checklist} = req.body
          if (Helper.objectIsEmpty(checklist)) return res.sendStatus(200)
          for (let i = 0; i < user.checklists.length; i++) {
            if (checklist.id === user.checklists[i].id) {
              user.checklists[i] = checklist
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
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
      const {jwt} = req
      const {sessionToken} = req.cookies
      if (Helper.stringIsEmpty(sessionToken)) throw new Error("session token is empty")
      const {user} = await Helper.findUser(user => user.id === jwt.id)
      const sessionTokenDigest = Helper.digest(JSON.stringify({
        id: Helper.digest(JSON.stringify({email: user.email, verified: user.verified})),
        pin: user.session.pin,
        salt: user.session.salt,
        jwt: user.session.jwt,
      }))
      if (Helper.stringIsEmpty(sessionTokenDigest)) throw new Error("session token is not valid")
      if (sessionTokenDigest !== sessionToken) throw new Error("session token changed during session")
      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async getChecklist(req, res, next) {
    try {
      const {method, type} = req.body

      if (type === "checklist") {
        if (method === "get") {


          const {urlId} = req.body
          if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
          const {user} = await Helper.findUser(user => user.id === urlId)

          if (user.checklists === undefined) throw new Error("user checklists is undefined")
          for (let i = 0; i < user.checklists.length; i++) {
            if (user.checklists[i].owner.id === urlId) {
              return res.send(user.checklists[i])
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

  static async getFunnel(req, res, next) {
    try {
      const {method, type, name} = req.body

      if (method === "get") {
        if (type === "funnel") {





          if (name === "shs") {
            const funnel = Helper.createSHSFunnel(req.body)
            return res.send(funnel)
          }



        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerOffer(req, res, next) {
    try {
      const {type, method} = req.body


      if (type === "offer") {
        if (method === "register") {


          const {offer} = req.body
          if (Helper.objectIsEmpty(offer)) throw new Error("offer is empty")
          const {jwt} = req
          const {doc, user} = await Helper.findUser(user => user.id === jwt.id)



          if (user.offers === undefined) user.offers = []

          if (user.offers.length === 0) {
            user.offers.push(offer)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }



          if (Helper.arrayIsEmpty(user.offers)) throw new Error("user offers is empty")
          for (let i = 0; i < user.offers.length; i++) {
            if (offer.id === user.offers[i].id) {
              user.offers[i] = offer
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }
          }


          for (let i = 0; i < user.offers.length; i++) {
            // what should we do with the old data?
            user.offers[i].selected = false
          }

          user.offers.push(offer)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
          return res.sendStatus(200)


        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerRole(req, res, next) {
    try {
      const {type, consumer, method} = req.body

      if (type === "role") {
        if (method === "register") {
          if (Helper.stringIsEmpty(consumer)) throw new Error("consumer is empty")




          if (consumer === "operator") {
            const {localStorageId} = req.body
            if (Helper.stringIsEmpty(localStorageId)) throw new Error("local storage id is empty")


            const {doc, user} = await Helper.findUser(user => user.id === localStorageId)
            let foundRole = false
            for (let i = 0; i < user.roles.length; i++) {
              if (user.roles[i] === UserRole.OPERATOR) {
                foundRole = true
                break
              }
            }
            if (foundRole === true) return res.sendStatus(200)

            if (foundRole === false) user.roles.push(UserRole.OPERATOR)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }





        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async registerVerified(req, res, next) {
    try {
      const {method, type} = req.body

      if (method === "register") {
        if (type === "verified") {
          const {localStorageId} = req.body
          const {doc, user} = await Helper.findUser(user => user.id === localStorageId)
          user.verified = true
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
          return res.sendStatus(200)
        }
      }
      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerFunnel(req, res, next) {
    try {

      const {type, method} = req.body
      if (type === "funnel") {
        if (method === "register") {


          const {jwt} = req
          const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
          const {funnel} = req.body
          if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")

          if (user.funnels === undefined) user.funnels = []

          // push funnel when array is empty
          if (user.funnels.length === 0) {
            user.funnels.push(funnel)
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }



          // overrides funnel with same id
          if (Helper.arrayIsEmpty(user.funnels)) throw new Error("user funnels is empty")
          for (let i = 0; i < user.funnels.length; i++) {
            if (funnel.id === user.funnels[i].id) {
              user.funnels[i] = funnel
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }
          }



          // push funnel when funnel has new id
          for (let i = 0; i < user.funnels.length; i++) {
            // what should we do with the old data?
            user.funnels[i].selected = false
          }

          user.funnels.push(funnel)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
          return res.sendStatus(200)

        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerEmail(req, res, next) {
    try {
      const {method, type} = req.body
      if (type === "email") {
        if (method === "register") {

          // console.log("hi");
          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")

          const {localStorageId, email} = req.body
          for (let i = 0; i < doc.users.length; i++) {
            if (doc.users[i].id === localStorageId) return res.sendStatus(200)
            if (doc.users[i].email === email) return res.sendStatus(200)
          }

          const newUser = {}
          newUser.id =  Helper.digest(JSON.stringify({email: email, verified: true})),
          newUser.email = email
          newUser.verified =  false
          newUser.roles =  []
          newUser.reputation = 0
          if (email.endsWith("@get-your.de")) {
            newUser.platforms = []
            newUser.roles.push(UserRole.PLATFORM_DEVELOPER)
          }
          newUser.createdAt =  Date.now()

          if (Helper.objectIsEmpty(newUser)) throw new Error("new user is empty")
          doc.users.push(newUser)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
          return res.sendStatus(200)
        }
      }
      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async createOffer(req, res, next) {

    try {
      const {method, name, type} = req.body

      if (type === "offer") {
        if (method === "create") {

          if (name === "bestprime") {
            const offer = Helper.createBestprimeOffer(req.body)
            return res.send(offer)
          }

        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async getOffer(req, res, next) {
    try {
      const {method, type} = req.body

      if (type === "offer") {
        if (method === "get") {


          const {jwt} = req
          const {user} = await Helper.findUser(user => user.id === jwt.id)
          if (user.offers === undefined) throw new Error("user offers is undefined")
          for (let i = 0; i < user.offers.length; i++) {
            if (user.offers[i].owner.id === jwt.id && user.offers[i].selected === true) {
              return res.send(user.offers[i])
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

  static async verifyId(req, res, next) {
    try {

      // verify request location from headers referer


      if (req.originalUrl === "/consumer/open/") {
        const {method, type} = req.body

        if (type === "email") {
          if (method === "register") {
            const {localStorageId, email} = req.body
            if (Helper.stringIsEmpty(localStorageId)) throw new Error("localStorageId is empty")
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
            return next()
          }
        }

        if (type === "verified") {
          if (method === "register") {
            const {localStorageId, email} = req.body
            if (Helper.stringIsEmpty(localStorageId)) throw new Error("localStorageId is empty")
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
            return next()
          }
        }


      }

      if (req.method === "POST") {
        const {localStorageId, email} = req.body
        if (Helper.stringIsEmpty(localStorageId)) throw new Error("localStorageId is empty")
        if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
        const foundUserById = await (await Helper.findUser(user => user.id === localStorageId)).user
        if (Helper.objectIsEmpty(foundUserById)) throw new Error("user is not registered")
        const foundVerifiedUserById = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
        if (Helper.objectIsEmpty(foundVerifiedUserById)) throw new Error("user is not verified")
        if (localStorageId !== foundVerifiedUserById.id) throw new Error("local storage id is not trusted")
        if (email !== foundVerifiedUserById.email) throw new Error("email mismatch")
        return next()
      }




      if (req.originalUrl === "/producer/v1/") {
        const {email} = req.body
        if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
        if (!email.endsWith("@get-your.de")) throw new Error("not a getyour email")
        // const
      }

      if (req.method === "GET") {
        const {jwt} = req
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const userFromJwt = await (await Helper.findUser(user => user.id === jwt.id)).user
        const foundVerifiedUserById = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: userFromJwt.email, verified: userFromJwt.verified})))).user
        if (userFromJwt.id !== foundVerifiedUserById.id) throw new Error("user id mismatch")
        return next()
      }




      if (req.params.urlId !== undefined) {
        const urlId = req.params.urlId
        if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
        const userFromUrlId = await (await Helper.findUser(user => user.id === urlId)).user

        const {jwt} = req
        const userFromJwt = await (await Helper.findUser(user => user.id === jwt.id)).user

        if (jwt.id !== urlId) throw new Error("jwt id is not equal url id")
        if (urlId !== userFromUrlId.id) throw new Error("url id is not trusted")
        if (urlId !== userFromJwt.id) throw new Error("jwt id is not trusted")
        if (userFromJwt.id !== userFromUrlId.id) throw new Error("user id mismatch")
        return next()
      }



      // console.log("hi");



      // return next()
      throw new Error("id is not verified")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async requireJwtToken(req, res, next) {
    try {
      // redirect possible
      if (req.method === "GET") {
        // console.log("hi");
        if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
        const {jwtToken} = req.cookies
        if (Helper.stringIsEmpty(jwtToken)) {
          Helper.logError(new Error("jwt token is empty"), req)
          return res.redirect("/home/")
        }
        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const {user} = await Helper.find(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
        if (user.session.jwt !== Helper.digest(jwtToken)) {
          Helper.logError(new Error("jwt token changed"), req)
          return res.redirect("/home/")
        }
        const verifiedUser = await (await Helper.find(user => user.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified})))).user
        if (Helper.objectIsEmpty(verifiedUser)) throw new Error("verified user is empty")
        if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
        req.jwt = jwt
        if (Helper.objectIsEmpty(req.jwt)) throw new Error("jwt is empty")
        return next()
      }

      if (req.method === "POST") {
        if (Helper.objectIsEmpty(req.body)) throw new Error("body is empty")
        if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
        const {jwtToken} = req.cookies
        if (Helper.stringIsEmpty(jwtToken)) throw new Error("jwt token is empty")
        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const {user} = await Helper.find(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
        if (user.session.jwt !== Helper.digest(jwtToken)) throw new Error("jwt token changed")
        const verifiedUser = await (await Helper.find(user => user.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified})))).user
        if (Helper.objectIsEmpty(verifiedUser)) throw new Error("verified user is empty")
        if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
        req.jwt = jwt
        if (Helper.objectIsEmpty(req.jwt)) throw new Error("jwt is empty")
        return next()
      }
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
        const {user} = await Helper.findUser(user => user.id === jwt.id)

        let foundRole = false
        for (let i = 0; i < roles.length; i++) {
          for (let n = 0; n < user.roles.length; n++) {
            if (roles[i] ===  user.roles[n]) {
              // foundRole = true
              return next()
              // break
            }
          }
        }

        if (foundRole === false) throw new Error("user is not authorized")
        // return next()

      } catch (error) {
        await Helper.logError(error, req)
      }
      return res.sendStatus(404)
    }
  }

  static requireRoles(roles) {
    return async(req, res, next) => {
      try {
    // console.log("hi");

        if (roles === undefined) throw new Error(`expected roles, found ${JSON.stringify(roles)}`)
        const {jwt} = req
        const {user} = await Helper.find(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error(`user is empty`)
        if (Helper.arrayIsEmpty(user.roles)) throw new Error(`user roles is empty`)
        roles.forEach(role => {
          const found = user.roles.find(it => it === role)
          if (found === undefined) throw new Error(`user is not authorized`)
        })
        return next()
      } catch (error) {
        await Helper.logError(error, req)
      }
      return res.sendStatus(404)
    }
  }

  static async requireSessionToken(req, res, next) {
    try {
      const {sessionToken} = req.cookies
      const {localStorageId, security} = req.body
      if (security === "closed") {
        if (Helper.stringIsEmpty(sessionToken)) throw new Error("session token is empty")
        const {user} = await Helper.find(user => user.id === localStorageId)
        const sessionTokenDigest = Helper.digest(JSON.stringify({
          id: Helper.digest(JSON.stringify({email: user.email, verified: user.verified})),
          pin: user.session.pin,
          salt: user.session.salt,
          jwt: user.session.jwt,
        }))
        if (Helper.stringIsEmpty(sessionTokenDigest)) throw new Error("session token is not valid")
        if (sessionTokenDigest !== sessionToken) throw new Error("session token changed during session")
      }
      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

}
