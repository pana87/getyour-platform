require('dotenv').config()
const { UserRole } = require("./UserRole.js")
const { Helper } = require("./Helper.js")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

module.exports.Request = class {

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
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerName(req, res, next) {
    try {

      const {type, security, method, name} = req.body

      if (type === "name") {
        if (method === "register") {
          if (security === "closed") {
            const {jwt} = req
            const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
            user.name = name
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }
        }
      }


      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async redirectUser(req, res, next) {
    try {
      const {method, type, name, security} = req.body

      if (method === "redirect") {
        if (type === "user") {
          if (security === "open") {




            const {referrer, location} = req.body
            if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
            const loc = new URL(location)
            let ref = ""
            if (referrer !== "") {
              ref = new URL(referrer)
            }
            const {localStorageId} = req.body
            const {user} = await Helper.findUser(user => user.id === localStorageId)
            // console.log("user", user)
            // console.log("loc", loc)
            // console.log("ref", ref)

            if (user.roles.length === 0) {
              if (user.email.endsWith("@get-your.de")) return res.send("/pana/getyour/entwickler-registrieren/")
              if (loc.pathname.startsWith("/felix/shs/")) {
                if (ref.pathname === "/felix/shs/match-maker/hersteller-vergleich/") return res.send(ref.pathname)
                return res.send(loc.pathname)
              }
              return res.send("/pana/getyour/zugang/")
            }

            for (let i = 0; i < user.roles.length; i++) {
              if (user.roles[i] === UserRole.OPERATOR) {
                return res.send(`/felix/shs/checklist/${localStorageId}/`)
              }
              if (user.roles[i] === UserRole.PLATFORM_DEVELOPER) {
                if (user.name === undefined) return res.send("/pana/getyour/entwickler-registrieren/")
                if (user.name !== undefined) return res.send(`/${user.name}/`)
              }
            }

          }

        }

      }


      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerLead(req, res, next) {
    try {
      const {method, security, type} = req.body

      if (method === "register") {
        if (type === "lead") {


          if (security === "closed") {

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
      }


      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async registerChecklist(req, res, next) {
    try {
      const {method, security, type} = req.body

      if (method === "register") {
        if (type === "checklist") {
          if (security === "closed") {


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
            if (Helper.objectIsEmpty(checklist)) throw new Error("checklist is empty")
            for (let i = 0; i < user.checklists.length; i++) {
              if (checklist.id === user.checklists[i].id) {
                user.checklists[i] = checklist
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }
            }


          }
        }
      }


      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async verifySession(req, res, next) {
    try {

      if (req.method === "GET") {
        const {sessionToken} = req.cookies
        const {jwt} = req
        if (Helper.stringIsEmpty(sessionToken)) throw new Error("session token is empty")
        const {user} = await Helper.find(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error("jwt id is empty")
        const sessionTokenDigest = Helper.digest(JSON.stringify({
          id: Helper.digest(JSON.stringify({email: user.email, verified: user.verified})),
          pin: user.session.pin,
          salt: user.session.salt,
          jwt: user.session.jwt,
        }))
        if (Helper.stringIsEmpty(sessionTokenDigest)) throw new Error("session token is not valid")
        if (sessionTokenDigest !== sessionToken) throw new Error("session token changed during session")
        return next()
      }

      if (req.method === "POST") {
        const {security} = req.body
        if (security === "closed") {
          const {sessionToken} = req.cookies
          const {jwt} = req
          if (Helper.stringIsEmpty(sessionToken)) throw new Error("session token is empty")
          const {user} = await Helper.find(user => user.id === jwt.id)
          if (Helper.objectIsEmpty(user)) throw new Error("jwt id is empty")
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
      }
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async getChecklist(req, res, next) {
    try {
      const {method, security, type} = req.body

      if (method === "get") {
        if (type === "checklist") {
          if (security === "closed") {


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
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  // static sendUserFunnel // secured
  static async getFunnel(req, res, next) {
    try {
      const {method, security, type, name} = req.body

      if (method === "get") {
        if (type === "funnel") {
          if (security === "open") {

            if (name === "shs") {
              const funnel = Helper.createSHSFunnel(req.body)
              return res.send(funnel)
            }

          }



          if (security === "closed") {
            const {jwt} = req
            const {user} = await Helper.findUser(user => user.id === jwt.id)
            if (Helper.arrayIsEmpty(user.funnels)) throw new Error("funnels are empty")

            // check if funnel is empty redirect when closed
            for (let i = 0; i < user.funnels.length; i++) {
              if (user.funnels[i].owner.id === jwt.id) {
                return res.send(user.funnels[i])
              }
            }
          }
        }
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerOffer(req, res, next) {
    try {
      const {type, method, security} = req.body

      if (method === "register") {
        if (type === "offer") {
          if (security === "closed") {


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

          }
        }
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerRole(req, res, next) {
    try {
      const {type, security, method} = req.body

      if (method === "register") {
        if (type === "role") {
          if (security === "open") {
            const {localStorageId, name} = req.body
            if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
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

            if (name === "operator") {
              if (foundRole === false) user.roles.push(UserRole.OPERATOR)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }




          }
        }
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async registerVerified(req, res, next) {
    try {
      const {method, type, security} = req.body

      if (method === "register") {
        if (type === "verified") {
          if (security === "open") {
            const {localStorageId} = req.body
            const {doc, user} = await Helper.findUser(user => user.id === localStorageId)
            user.verified = true
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }
        }
      }
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerFunnel(req, res, next) {
    try {

      const {type, method, security} = req.body
      if (method === "register") {
        if (type === "funnel") {


          if (security === "closed") {

            const {jwt} = req
            const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
            const {funnel} = req.body
            if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")

            if (user.funnels === undefined) user.funnels = []

            if (user.funnels.length === 0) {
              user.funnels.push(funnel)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }

            if (Helper.arrayIsEmpty(user.funnels)) throw new Error("user funnels is empty")
            for (let i = 0; i < user.funnels.length; i++) {
              if (funnel.id === user.funnels[i].id) {
                user.funnels[i] = funnel
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }
            }
          }


        }
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerEmail(req, res, next) {
    try {
      const {method, type, security} = req.body
      if (method === "register") {
        if (type === "email") {
          if (Helper.stringIsEmpty(security)) throw new Error("security is empty")
          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")


          // const {security} = req.body
          // if (security === "closed") {
          //   const {jwt} = req
          //   if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
          //   for (let i = 0; i < doc.users.length; i++) {
          //     if (doc.users[i].id === jwt.id) return res.sendStatus(200)
          //   }
          // }

          if (security === "open") {
            const {localStorageId} = req.body
            if (Helper.stringIsEmpty(localStorageId)) throw new Error("local storage id is empty")
            for (let i = 0; i < doc.users.length; i++) {
              if (doc.users[i].id === localStorageId) return res.sendStatus(200)
            }

            const {email} = req.body
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
            const newUser = {}
            newUser.id =  Helper.digest(JSON.stringify({email: email, verified: true})),
            newUser.email = email
            newUser.verified =  false
            newUser.roles =  []
            newUser.reputation = 0

            // producer features
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
      }
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async getOffers(req, res, next) {
    try {
      const {method, security, type} = req.body

      if (method === "get") {
        if (type === "offers") {



          if (security === "open") {
            // console.log("hi");
            const offers = []
            offers.push(Helper.createBestprimeOffer(req.body))
            return res.send(offers)
          }




          if (security === "closed") {
            const {urlId} = req.body
            if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
            const {user} = await Helper.findUser(user => user.id === urlId)
            if (user.offers === undefined) throw new Error("user offers is undefined")
            for (let i = 0; i < user.offers.length; i++) {
              if (user.offers[i].owner.id === urlId && user.offers[i].value.selected === true) {
                return res.send(user.offers[i])
              } else throw new Error(`offer not found`)
            }
          }




        }
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyId(req, res, next) {
    try {
      const {security} = req.body

      if (req.originalUrl === "/producer/v1/") {
        const {email} = req.body
        if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
        if (!email.endsWith("@get-your.de")) throw new Error("not a getyour email")
      }

      if (security === "open") {
        const {localStorageId} = req.body
        if (Helper.stringIsEmpty(localStorageId)) throw new Error("localStorageId is empty")



        const foundUserById = await (await Helper.findUser(user => user.id === localStorageId)).user
        if (Helper.objectIsEmpty(foundUserById)) throw new Error("user is not registered")
        const foundVerifiedUserById = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
        if (Helper.objectIsEmpty(foundVerifiedUserById)) throw new Error("user is not verified")
        if (localStorageId !== foundVerifiedUserById.id) throw new Error("local storage id is not trusted")

      }

      if (security === "closed") {

        const {jwt} = req
        const {localStorageId, urlId} = req.body
        if (Helper.stringIsEmpty(localStorageId)) throw new Error("localStorageId is empty")
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")

        const foundUserById = await (await Helper.findUser(user => user.id === localStorageId)).user
        if (Helper.objectIsEmpty(foundUserById)) throw new Error("user is not registered")
        const foundVerifiedUserById = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
        if (Helper.objectIsEmpty(foundVerifiedUserById)) throw new Error("user is not verified")
        if (localStorageId !== foundVerifiedUserById.id) throw new Error("local storage id is not trusted")

        const userFromJwt = await (await Helper.find(user => user.id === jwt.id)).user
        if (Helper.objectIsEmpty(userFromJwt)) throw new Error("jwt user is empty")

        // data sharing via url id
        if (urlId !== undefined) {
          const {localStorageId} = req.body
          const {jwt} = req
          if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")

          const userFromUrlId = await (await Helper.find(user => user.id === urlId)).user
          if (Helper.objectIsEmpty(userFromUrlId)) throw new Error("user with url id does not exist")
          if (urlId !== userFromUrlId.id) throw new Error("url id is not trusted")
          if (urlId !== userFromJwt.id) throw new Error("jwt id is not trusted")
          if (userFromJwt.id !== userFromUrlId.id) throw new Error("user id mismatch")

          // authorization logic
          if (localStorageId !== urlId) {
            if (urlId === jwt.id) throw new Error("local storage id is not trusted")
            const {user} = await Helper.findUser(user => user.id === urlId)
            if (Helper.objectIsEmpty(user)) throw new Error("no user for authorization")
            let userAuthorized = false
            for (let i = 0; i < user.authorized.length; i++) {
              if (user.authorized[i] === localStorageId) {
                userAuthorized = true
                break
              }
            }
            if (userAuthorized === false) throw new Error("local storage id is not authorized by url id")
          }
        }
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async requireJwtToken(req, res, next) {
    try {
      // console.log("hi");

      if (req.method === "GET") {
        if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
        const {jwtToken} = req.cookies
        if (Helper.stringIsEmpty(jwtToken)) {
          // show error and redirect to home
          const error = new Error("jwt token is empty")
          Helper.logError(error, req)
          return res.redirect("/home/")
        }
        // if (Helper.stringIsEmpty(jwtToken)) throw new Error("jwt token is empty")
        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const {user} = await Helper.find(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
        if (user.session.jwt !== Helper.digest(jwtToken)) {
          // show error and redirect to home
          const error = new Error("jwt token changed")
          Helper.logError(error, req)
          return res.redirect("/home/")
        }
        const verifiedUser = await (await Helper.find(user => user.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified})))).user
        if (Helper.objectIsEmpty(verifiedUser)) throw new Error("verified user is empty")
        // if (!Helper.isEqual(jwt.roles, verifiedUser.roles)) throw new Error("jwt roles mismatch")
        if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
        req.jwt = jwt
        return next()
      }

      // console.log("hi");
      if (req.method === "POST") {
        if (Helper.objectIsEmpty(req.body)) throw new Error("body is empty")
        const {security} = req.body
        if (Helper.stringIsEmpty(security)) throw new Error("security is empty")

        if (security === "closed") {
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
          // if (!Helper.isEqual(jwt.roles, verifiedUser.roles)) throw new Error("jwt roles mismatch")
          if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
          req.jwt = jwt
        }
        return next()
      }
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
    // return res.redirect("/home/")
  }

  static verifyRoles(roles) {
    return async(req, res, next) => {
      try {
        if (roles === undefined) throw new Error(`expected roles, found ${JSON.stringify(roles)}`)
        const {jwt} = req
        const {user} = await Helper.find(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error(`user is empty`)
        if (Helper.arrayIsEmpty(user.roles)) throw new Error(`user roles is empty`)

        let foundRole = false
        for (let i = 0; i < roles.length; i++) {
          for (let n = 0; n < user.roles.length; n++) {
            if (roles[i] ===  user.roles[n]) {
              foundRole = true
              break
            }
          }
        }

        if (foundRole === false) throw new Error("user is not authorized")

        return next()
      } catch (error) {
        Helper.logError(error, req)
      }
      return res.sendStatus(404)
    }
  }

  static requireRoles(roles) {
    return async(req, res, next) => {
      try {
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
        Helper.logError(error, req)
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
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

}
