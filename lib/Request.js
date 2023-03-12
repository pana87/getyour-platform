require('dotenv').config()
const { UserRole } = require("./UserRole.js")
const { Helper } = require("./Helper.js")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

module.exports.Request = class {

  static async registerLead(req, res, next) {
    try {
      const {method, security, type, consumer} = req.body

      if (consumer === "operator") {
        if (method === "register") {
          if (type === "lead") {


            if (security === "open") {
              const {localStorageId, contactType, phone, date} = req.body
              const {doc, user} = await Helper.findUser(user => user.id === localStorageId)
              if (Helper.stringIsEmpty(contactType)) throw new Error("contact type is empty")
              if (Helper.stringIsEmpty(date)) throw new Error("date is empty")
              if (contactType === "Telefon") {
                if (Helper.stringIsEmpty(phone)) throw new Error("phone is empty")
              }

              user.lead = {}
              user.lead.type = contactType
              user.lead.phone = phone
              user.lead.contactAt = new Date(date).getTime()
              user.lead.createdAt = Date.now()
              user.lead.state = "pending"
              user.lead.quality = "unqualified"

              user.lead.owner = {}
              user.lead.owner.id = localStorageId

              user.lead.id = Helper.digest(JSON.stringify(user.lead))

              // console.log(user.lead);
              // console.log(new Date(user.lead.contactAt));

              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)

            }




            if (security === "closed") {
              // console.log("hi lead");

              const {phone, contactType, date} = req.body
              const {jwt} = req
              // if (Helper.stringIsEmpty(jwt.id)) throw new Error("url id is empty")
              if (Helper.stringIsEmpty(contactType)) throw new Error("contact type is empty")
              if (Helper.stringIsEmpty(date)) throw new Error("date is empty")
              if (contactType === "Telefon") {
                if (Helper.stringIsEmpty(phone)) throw new Error("phone is empty")
              }

              const {doc, user} = await Helper.findUser(user => user.id === jwt.id)

              user.lead = {}
              user.lead.type = contactType
              user.lead.phone = phone
              user.lead.contactAt = new Date(date).getTime()
              user.lead.createdAt = Date.now()
              user.lead.state = "pending"
              user.lead.quality = "qualified"

              user.lead.owner = {}
              user.lead.owner.id = jwt.id

              user.lead.id = Helper.digest(JSON.stringify(user.lead))

              // console.log(user.lead);
              // console.log(new Date(user.lead.contactAt));

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

  static async getEmail(req, res, next) {
    try {

      const {method, security, type, name} = req.body



      if (type === "email") {
        if (method === "get") {
          if (security === "closed") {
            const {jwt} = req
            const {user} = await Helper.findUser(user => user.id === jwt.id)
            // console.log(user);
            return res.send(user.email)
          }
        }
      }


      return next()
    } catch (error) {
      Helper.logError(error, req)
      // console.error(error)
    }
    return res.sendStatus(404)
  }

  static async requireRedirect(req, res, next) {
    try {
      const {type, name, method, security, consumer} = req.body
      if (consumer === "operator") {
        if (method === "redirect") {
          if (name === "shs") {
            if (type === "checklist") {
              if (security === "closed") {
                const {jwt} = req
                const {user} = await Helper.findUser(user => user.id === jwt.id)
                if (Helper.objectIsEmpty(user)) throw new Error("jwt id is empty")
                if (user.funnels.length !== 0) {
                  for (let i = 0; i < user.funnels.length; i++) {
                    if (Helper.stringIsEmpty(user.funnels[i].owner.id)) throw new Error("owner id is empty")
                    if (user.funnels[i].type === "funnel" && user.funnels[i].name === "shs") {
                      return res.send(jwt.id)
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
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerChecklist(req, res, next) {
    try {
      const {method, security, name, type, consumer} = req.body

      if (consumer === "operator") {
        if (method === "register") {
          if (type === "checklist") {
            if (security === "closed") {








              const {jwt} = req
              const {doc, user} = await Helper.findUser(user => user.id === jwt.id)

              if (user.checklists === undefined) user.checklists = []
              // if (user.checklists !== undefined) return res.sendStatus(200)
              if (user.checklists.length === 0) {
                // user.checklists = []
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


            // if (method === "put") {
            //   if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")

            //   const {doc, user} = await Helper.findUser(user => user.id === urlId)
            //   // if (user.checklist === undefined) {
            //   //   user.checklist = []
            //   //   user.checklist.push(checklist)
            //   //   await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            //   //   return res.sendStatus(200)
            //   // }
            //   if (user.checklists === undefined) throw new Error("user checklists are undefined")

            // }


          }
        }
      }



      // if (type === "checklist") {
      //   if (name === "shs") {
      //     if (security === "closed") {








      //     }
      //   }
      // }
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }



  static async requireChecklist(req, res, next) {
    try {
      const {checklist, method, security, type, name} = req.body
      if (method === "post" || method === "put") {
        if (security === "closed") {
          if (type === "checklist" && name === "shs") {
            if (Helper.objectIsEmpty(checklist)) throw new Error("checklist is empty")
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

  static requireMethod(req, res, next) {
    try {
      const {method} = req.body
      if (Helper.stringIsEmpty(method)) throw new Error("method is empty")
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static requireSecurity(req, res, next) {
    try {
      const {security} = req.body
      if (security !== undefined) {
        if (Helper.stringIsEmpty(security)) throw new Error("security is empty")
      }
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static requireName(req, res, next) {
    try {
      const {name} = req.body
      if (name !== undefined) {
        if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
      }
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static requireType(req, res, next) {
    try {
      const {type} = req.body
      if (Helper.stringIsEmpty(type)) throw new Error("type is empty")
    } catch (error) {
      Helper.logError(error, req)
    }
    next()
  }

  static async getChecklist(req, res, next) {
    try {
      const {method, security, type, consumer} = req.body

      if (consumer === "operator") {
        if (method === "get") {
          if (type === "checklist") {
            if (security === "closed") {


              const {urlId} = req.body
              if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
              const {user} = await Helper.findUser(user => user.id === urlId)

              if (user.checklists === undefined) throw new Error("user checklists are undefined")
              for (let i = 0; i < user.checklists.length; i++) {
                if (user.checklists[i].owner.id === urlId) {
                  return res.send(user.checklists[i])
                }
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
      const {method, security, type, name, consumer} = req.body


      if (consumer === "operator") {
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
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerOffer(req, res, next) {
    try {
      const {type, method, security, consumer} = req.body
      const {jwt} = req

      if (consumer === "operator") {
        if (method === "register") {
          if (type === "offer") {
            if (security === "closed") {
              // console.log("hi");

              const {offer} = req.body
              if (Helper.objectIsEmpty(offer)) throw new Error("offer is empty")
              const {jwt} = req
              const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
              // if (user.offers === undefined) throw new Error("user offers are undefined")
              if (user.offers === undefined) user.offers = []

              if (user.offers.length === 0) {
                // check name of offer here
                const {funnel, offer} = req.body
                if (Helper.objectIsEmpty(offer)) throw new Error("offer is empty")
                if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")

                offer.owner = {}
                offer.owner.id = jwt.id
                offer.to = {}
                offer.to.firstname = funnel.value.firstname
                offer.to.lastname = funnel.value.lastname
                offer.to.street = funnel.value.street
                offer.to.zip = funnel.value.zip
                offer.to.state = funnel.value.state
                offer.to.country = funnel.value.country
                user.offers.push(offer)
                // user.offers.push(JSON.stringify(offer))
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }


              // console.log(offer);
              // console.log(offer.value.file);
              // console.log(offer);
              // console.log(offer.value.file.binaryString);
              // console.log(JSON.stringify(offer));
              if (Helper.arrayIsEmpty(user.offers)) throw new Error("user offers are empty")

              // if (user.offers === undefined) throw new Error("user offers are undefined")
              for (let i = 0; i < user.offers.length; i++) {
                if (offer.id === user.offers[i].id) {
                  // console.log(user.offers[i]);
                  // console.log("hi");
                  user.offers[i] = offer
                  // user.offers[i].value.binaryString = offer.value.file.binaryString
                  // user.offers[i] = JSON.stringify(offer)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }

            }
          }
        }
      }
      // const loadUser = await (await Helper.findUser(user => user.id === jwt.id)).user
      // // console.log(loadUser);
      // // console.log(loadUser.offers[0]);
      // console.log(loadUser.offers[0].value.file.dataURL);
      // return res.send(loadUser.offers[0].value.file.dataURL)

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async registerRole(req, res, next) {
    try {
      const {type, consumer, security, method} = req.body

      if (consumer === "operator") {
        if (method === "register") {
          if (type === "role") {
            if (security === "open") {
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
      }

      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }


  static async verifyEmail(req, res, next) {
    try {
      const {method, type} = req.body

      if (method === "verify") {
        if (type === "email") {
          const {localStorageId} = req.body
          if (Helper.stringIsEmpty(localStorageId)) throw new Error("local storage id is empty")
          const {doc, user} = await Helper.findUser(user => user.id === localStorageId)
          user.verified = true
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
          return res.sendStatus(200)
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

      const {type, method, security, consumer} = req.body
      if (consumer === "operator") {
        if (method === "register") {
          if (type === "funnel") {
            if (security === "closed") {

              const {jwt} = req
              const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
              const {funnel} = req.body
              if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")

              if (user.funnels === undefined) user.funnels = []

              if (user.funnels.length === 0) {
                funnel.owner = {}
                funnel.owner.id = jwt.id
                user.funnels.push(funnel)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }

              // for (let i = 0; i < user.funnels.length; i++) {
              //   if (funnel.id === user.funnels[i].id) {
              //     return res.sendStatus(200)
              //   }
              // }
              if (Helper.arrayIsEmpty(user.funnels)) throw new Error("user funnels are empty")
              for (let i = 0; i < user.funnels.length; i++) {
                if (funnel.id === user.funnels[i].id) {
                  user.funnels[i] = funnel
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }


            // const {jwt} = req
            // const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
            // const {funnel} = req.body
            // if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")



          }
        }
      }
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }



  static async registerSession(req) {
    try {
      const {doc, user} = await Helper.find(user => user.id === req.session.id)
      if (user.session === undefined) {
        user.session = {
          createdAt: Date.now(),
          pin: req.session.pin,
          salt: req.session.salt,
          jwt: req.session.jwt,
          counter: 1,
        }
      } else {
        user.session = {
          createdAt: Date.now(),
          pin: req.session.pin,
          salt: req.session.salt,
          jwt: req.session.jwt,
          counter: user.session.counter + 1,
        }
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
      return {status: 200, statusText: "REGISTER_SESSION_SUCCEED"}
    } catch (error) {
      Helper.logError(error, req)
    }
    return {status: 500, statusText: "REGISTER_SESSION_FAILED"}
  }

  static requireUserPin(req, res, next) {
    try {
      const {userPin} = req.body
      if (Helper.stringIsEmpty(userPin)) throw new Error("user pin is empty")
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
            const newUser = {
              id: Helper.digest(JSON.stringify({email: email, verified: true})),
              email,
              verified: false,
              roles: [],
              authorized: [],
              createdAt: Date.now(),
            }
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

  static async getOffer(req, res, next) {
    try {
      const {method, security, type, consumer, urlId} = req.body

      if (consumer === "operator") {
        if (method === "get") {
          if (type === "offer") {



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
              if (user.offers === undefined) throw new Error("user offers are undefined")
              // console.log(user.offers);
              for (let i = 0; i < user.offers.length; i++) {
                if (user.offers[i].owner.id === urlId && user.offers[i].value.selected === true) {

                  return res.send(user.offers[i])
                } else throw new Error(`offer not found`)
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

  static async requireVerifiedUser(req, res, next) {
    try {
      const {security} = req.body
      if (security === "closed") {
        const {localStorageId} = req.body
        const foundUserById = await (await Helper.find(user => user.id === localStorageId)).user
        const foundVerifiedUserById = await (await Helper.find(user => user.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
        if (Helper.objectIsEmpty(foundVerifiedUserById)) throw new Error("user is not verified")
        if (localStorageId !== foundVerifiedUserById.id) throw new Error("local storage id is not trusted")
      }
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async requireLocalStorageId(req, res, next) {
    try {
      const {security} = req.body
      if (security === "closed") {
        const {localStorageId} = req.body
        if (Helper.stringIsEmpty(localStorageId)) throw new Error("localStorageId is empty")
        const {user} = await Helper.find(user => user.id === localStorageId)
        if (Helper.objectIsEmpty(user)) throw new Error("local storage id not registered")
      }
      return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async requireBody(req, res, next) {
    try {
      if (Helper.objectIsEmpty(req.body)) throw new Error("body is empty")
      else return next()
    } catch (error) {
      Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyId(req, res, next) {
    try {
      const {security} = req.body

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
        if (Helper.stringIsEmpty(jwtToken)) return res.redirect("/home/")
        // if (Helper.stringIsEmpty(jwtToken)) throw new Error("jwt token is empty")
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

  static requireRoles(roles) {
    return async(req, res, next) => {
      try {
        if (roles === undefined) throw new Error(`expected roles, found ${JSON.stringify(roles)}`)
        const {jwt} = req
        const {user} = await Helper.find(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error(`user is empty`)
        if (Helper.arrayIsEmpty(user.roles)) return res.send({redirect: "/user/entries/"})
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
