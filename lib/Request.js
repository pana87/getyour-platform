require('dotenv').config()
const { UserRole } = require("./UserRole.js")
const { Helper } = require("./Helper.js")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

module.exports.Request = class {

  static async requireRedirect(req, res, next) {
    try {
      const {type, name, method, security} = req.body
      if (type === "redirect") {
        if (name === "operator") {
          if (method === "get") {
            if (security === "closed") {
              const {jwt} = req
              const {user} = await Helper.findUser(user => user.id === jwt.id)
              if (Helper.objectIsEmpty(user)) throw new Error("jwt id is empty")
              for (let i = 0; i < user.funnels.length; i++) {
                if (user.funnels[i].type === "funnel" && user.funnels[i].name === "shs") {
                  return res.send(jwt.id)
                }
              }
            }
          }
        }
      }
      return next()
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
  }

  static async registerChecklist(req, res, next) {
    try {
      const {method, security, name, type} = req.body

      if (type === "checklist") {
        if (name === "shs") {
          if (method === "put") {
            if (security === "closed") {
              const {checklist, urlId} = req.body
              if (Helper.objectIsEmpty(checklist)) throw new Error("checklist is empty")
              if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")

              const {doc, user} = await Helper.findUser(user => user.id === urlId)
              if (user.checklist === undefined) {
                user.checklist = []
                user.checklist.push(checklist)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }
              for (let i = 0; i < user.checklist.length; i++) {
                if (checklist.id === user.checklist[i].id) {
                  user.checklist[i] = checklist
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
      console.error(error)
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
      console.error(error)
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
      console.error(error)
    }
    return res.sendStatus(404)
  }

  static requireMethod(req, res, next) {
    try {
      const {method} = req.body
      if (Helper.stringIsEmpty(method)) throw new Error("method is empty")
      return next()
    } catch (error) {
      console.error(error)
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
      console.error(error)
    }
    return res.sendStatus(404)
  }

  // static requirePlatformId(req, res, next) {
  //   try {
  //     if (Helper.stringIsEmpty(process.env.PLATFORM_ID)) throw new Error("platform id is empty")
  //     return next()
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return res.sendStatus(404)
  // }

  // static async updateOffer(req, res, next) {
  //   try {
  //     const {offer, jwt} = req.body
  //     const {doc, user} = await Helper.find(user => user.id === jwt.id)
  //     if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
  //     if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
  //     if (user.offers === undefined) user.offers = []
  //     for (let i = 0; i < user.offers.length; i++) {
  //       if (offer.id === user.offers[i].id) {
  //         user.offers[i] = offer
  //         await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //         return res.sendStatus(200)
  //       }
  //     }
  //     user.offers.push(offer)
  //     await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
  //     return res.sendStatus(200)
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   next()
  // }

  static requireName(req, res, next) {
    try {
      const {name} = req.body
      if (name !== undefined) {
        if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
      }
      return next()
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
  }

  static requireType(req, res, next) {
    try {
      const {type} = req.body
      if (Helper.stringIsEmpty(type)) throw new Error("type is empty")
    } catch (error) {
      console.error(error)
    }
    next()
  }

  // static requireUrl(req, res, next) {
  //   try {
  //     const {url} = req.body
  //     if (Helper.stringIsEmpty(url)) throw new Error("url is empty")
  //     if (req.get("Host") === databaseLocation.host) {
  //       if (url !== `${databaseLocation.origin}${req.originalUrl}`) throw new Error("url mismatch")
  //     }
  //     if (req.get("Host") === authLocation.host) {
  //       if (url !== `${authLocation.origin}${req.originalUrl}`) throw new Error("url mismatch")
  //     }
  //     return next()
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return res.sendStatus(404)
  // }

  static async sendChecklist(req, res, next) {
    try {
      const {method, security, type, name} = req.body
      if (type === "checklist") {
        if (name === "shs") {
          if (method === "get") {
            if (security === "closed") {
              const {urlId} = req.body
              const {jwt} = req
              if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
              const {user} = await Helper.findUser(user => user.id === urlId)

              if (user.checklist === undefined) {
                const checklist = {}
                for (let i = 0; i < user.funnels.length; i++) {
                  if (user.funnels[i].name === name && user.funnels[i].type === "funnel") {
                    checklist.firstName = user.funnels[i].value.registrierenvorname
                    checklist.lastName = user.funnels[i].value.registrierennachname
                    break
                  } else throw new Error("funnel does not exist")
                }
                checklist.name = name
                checklist.type = type
                checklist.state = 0
                checklist.created_at = Date.now()
                checklist.owner = jwt.id
                checklist.id = Helper.digest(`${Date.now()}`)
                checklist.items = []
                checklist.items.push({title: "Angebotsübersicht - BPE SolarHyprid-System", description: "Hier können Sie ihr Angebot prüfen und anpassen, nähere Produktinformationen erhalten, Allgemeine Geschäftsbedingungen aufrufen und mehr über den Hersteller erfahren.", path: `/felix/shs/checkliste/${checklist.owner}/1/`})
                checklist.items.push({title: "Angebot hochladen", description: "Wenn Sie noch Fragen haben, finden Sie hier einen kompetenten Ansprechpartner. Haben Sie ihr Angebot geprüft und ggf. geändert, können Sie es hier drucken, hochladen und somit zur Prüfung freigeben.", path: `/felix/shs/checkliste/${checklist.owner}/2/`})
                checklist.items.push({title: "Baugo", description: "Ihr Angebot wird geprüft und ggf. freigegeben. Hier finden Sie ihren Projektbericht.", path: `/felix/shs/checkliste/${checklist.owner}/3/`})
                checklist.items.push({title: "Projektvorbereitung", description: "Um einen einwandfreien Aufbau ihres Energiekonzeptes zu ermöglichen, finden Sie hier eine Liste von Aufgaben, die Sie noch vor der Montage erledigen müssen.", path: `/felix/shs/checkliste/${checklist.owner}/4/`})
                checklist.items.push({title: "Bestätigen Sie die Warenlieferung", description: "Damit zusätzliche Kosten leicht vermieden werden können, prüfen Sie bitte mit Sorgfalt, ob alle gekauften Artikel angeliefert wurden. Die Bestätigung der Ware ist unerlässlich, um weitere Schritte des Aufbaus abzuschließen.", path: `/felix/shs/checkliste/${checklist.owner}/5/`})
                checklist.items.push({title: "DC-Ansprechpartner", description: "Ihren persönlichen Ansprechpartner für technische Fragen während der Montage finden Sie hier.", path: `/felix/shs/checkliste/${checklist.owner}/6/`})
                checklist.items.push({title: "Dachmontage - Termin vereinbaren", description: "Über den Terminkalender können Sie einfach und bequem ihren Wunschtermin mit dem Montageteam vereinbaren.", path: `/felix/shs/checkliste/${checklist.owner}/7/`})
                checklist.items.push({title: "Abnahmeprotokoll DC hochladen", description: "Nachdem unser Monteur das Abnahmeprotokoll aufgenommen hat, prüfen wir es zu ihrem Schutz.", path: `/felix/shs/checkliste/${checklist.owner}/8/`})
                checklist.items.push({title: "AC-Ansprechpartner", description: "Ihren persönlichen Ansprechpartner für technische Fragen während der Montage finden Sie hier.", path: `/felix/shs/checkliste/${checklist.owner}/9/`})
                checklist.items.push({title: "Hauselektrik - Termin vereinbaren", description: "Über den Terminkalender können Sie einfach und bequem ihren Wunschtermin mit dem Montageteam vereinbaren.", path: `/felix/shs/checkliste/${checklist.owner}/10/`})
                checklist.items.push({title: "Abnahmeprotokoll AC hochladen", description: "Nachdem unser Monteur das Abnahmeprotokoll aufgenommen hat, prüfen wir es zu ihrem Schutz.", path: `/felix/shs/checkliste/${checklist.owner}/11/`})
                checklist.items.push({title: "WP-Ansprechpartner", description: "Ihren persönlichen Ansprechpartner für technische Fragen während der Montage finden Sie hier.", path: `/felix/shs/checkliste/${checklist.owner}/12/`})
                checklist.items.push({title: "Wärmepumpe - Termin vereinbaren", description: "Über den Terminkalender können Sie einfach und bequem ihren Wunschtermin mit dem Montageteam vereinbaren.", path: `/felix/shs/checkliste/${checklist.owner}/13/`})
                checklist.items.push({title: "Abnahmeprotokoll WP hochladen", description: "Nachdem unser Monteur das Abnahmeprotokoll aufgenommen hat, prüfen wir es zu ihrem Schutz.", path: `/felix/shs/checkliste/${checklist.owner}/14/`})
                checklist.items.push({title: "Feedback", description: "Um uns stetig verbessern zu können, brauchen wir ihre Mithilfe. Geben Sie uns ihr Feedback zur Montage, damit unsere Prozesse noch einfacher und schneller werden.", path: `/felix/shs/checkliste/${checklist.owner}/15/`})
                checklist.value = {}
                return res.send(checklist)
              } else {
                for (let i = 0; i < user.checklist.length; i++) {
                  if (user.checklist[i].owner === urlId) {
                    return res.send(user.checklist[i])
                  }
                }
              }
            }
          }
        }
      }
      return next()
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
  }

  // static sendUserFunnel // secured
  static async sendFunnel(req, res, next) {
    try {
      const {method, security, type, name} = req.body
      if (type === "funnel") {
        if (name === "shs") {
          if (method === "get") {
            if (security === "open") {
              const funnel = Helper.createSHSFunnel(req.body)
              return res.send(funnel)
            }

            if (security === "closed") {
              const {jwt} = req
              const {user} = await Helper.findUser(user => user.id === jwt.id)
              if (Helper.arrayIsEmpty(user.funnels)) throw new Error("funnels are empty")
              for (let i = 0; i < user.funnels.length; i++) {
                if (user.funnels[i].name === name) {
                  return res.send(user.funnels[i])
                }
              }
            }
          }
        }
      }
      return next()
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
  }

  // static async requireOffer(req, res, next) {
  //   try {
  //     const {offer, method, security, type} = req.body
  //     // console.log(offer);
  //     if (security === "closed") {
  //       if (method === "post" || method === "put") {
  //         if (type === "offer") {
  //           if (Helper.objectIsEmpty(offer)) throw new Error("offer is empty")
  //           // const checkDigest = offer.digest
  //           // offer.digest = undefined
  //           // if (checkDigest !== Helper.digest(JSON.stringify(offer))) throw new Error("offer was changed")
  //         }
  //       }
  //     }
  //     return next()
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return res.sendStatus(404)
  // }

  static async registerOffer(req, res, next) {
    try {
      const {type, name} = req.body
      if (type === "offer") {
        if (name === "bestprime") {
          const {method, security, offer} = req.body
          if (Helper.objectIsEmpty(offer)) throw new Error("offer is empty")

          if (method === "put") {
            if (security === "closed") {
              const {jwt} = req
              const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
              for (let i = 0; i < user.offers.length; i++) {
                if (offer.id === user.offers[i].id) {
                  user.offers[i] = offer
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }
          }

          if (method === "post") {
            if (security === "closed") {
              const {funnel} = req.body
              if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")
              const {jwt} = req
              const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
              if (user.offers === undefined) user.offers = []

              for (let i = 0; i < user.offers.length; i++) {
                if (offer.id === user.offers[i].id) {
                  return res.sendStatus(200)
                }
              }

              offer.to = {}
              offer.to.firstName = funnel.value.registrierenvorname
              offer.to.lastName = funnel.value.registrierennachname
              offer.to.street = funnel.value.registrierenstrasseundhausnumm
              offer.to.zip = funnel.value.registrierenpostleitzahl
              offer.digest = Helper.digest(JSON.stringify(offer))
              user.offers.push(offer)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }
          }
        }
      }

      return next()
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
  }

  static async registerOperator(req, res, next) {
    try {
      const {type} = req.body
      if (type === "role") {
        const {method} = req.body
        if (method === "post") {
          const {name} = req.body
          if (name === "onoperator") {
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
      console.error(error)
    }
    return res.sendStatus(404)
  }


  static async registerVerifiedUser(req, res, next) {
    try {
      const {method, type} = req.body

      if (type === "verify") {
        if (method === "put") {
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
      console.error(error)
    }
    return res.sendStatus(404)
  }

  // static requireFunnel(req, res, next) {
  //   try {
  //     const {method, security, type} = req.body
  //     if (type === "funnel") {
  //       if (method === "post" || method === "put") {
  //         if (security === "closed") {
  //           const {funnel} = req.body
  //           if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")
  //         }
  //       }
  //     }
  //     return next()
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return res.sendStatus(404)
  // }

  static async registerFunnel(req, res, next) {
    try {

      const {type, method, name, security} = req.body
      if (type === "funnel") {
        if (method === "post") {
          if (name === "shs") {
            if (security === "closed") {
              const {jwt} = req
              const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
              const {funnel} = req.body
              if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")

              if (user.funnels === undefined) user.funnels = []
              for (let i = 0; i < user.funnels.length; i++) {
                if (funnel.id === user.funnels[i].id) {
                  return res.sendStatus(200)
                }
              }
              user.funnels.push(funnel)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }
          }
        }
        if (method === "put") {
          if (name === "shs") {
            if (security === "closed") {
              const {jwt} = req
              const {doc, user} = await Helper.findUser(user => user.id === jwt.id)
              const {funnel} = req.body
              if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")
              if (Helper.arrayIsEmpty(user.funnels)) throw new Error("user funnel list is empty")
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
      }
      return next()
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
  }



  static async registerSession(req) {
    try {
      const {doc, user} = await Helper.find(user => user.id === req.session.id)
      if (user.session === undefined) {
        user.session = {
          created_at: Date.now(),
          pin: req.session.pin,
          salt: req.session.salt,
          jwt: req.session.jwt,
          counter: 1,
        }
      } else {
        user.session = {
          created_at: Date.now(),
          pin: req.session.pin,
          salt: req.session.salt,
          jwt: req.session.jwt,
          counter: user.session.counter + 1,
        }
      }
      await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
      return {status: 200, statusText: "REGISTER_SESSION_SUCCEED"}
    } catch (error) {
      console.error(error)
    }
    return {status: 500, statusText: "REGISTER_SESSION_FAILED"}
  }

  static requireUserPin(req, res, next) {
    try {
      const {userPin} = req.body
      if (Helper.stringIsEmpty(userPin)) throw new Error("user pin is empty")
    } catch (error) {
      console.error(error)
      return res.sendStatus(404)
    }
    next()
  }

  // static async requireEmail(req, res, next) {
  //   try {
  //     const {method, type} = req.body
  //     if (type === "id") {
  //       if (method === "post") {
  //         const {email} = req.body
  //         if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
  //       }
  //     }
  //     return next()
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return res.sendStatus(404)
  // }

  static async registerEmail(req, res, next) {
    try {
      const {method, type} = req.body
      if (type === "id") {
        if (method === "post") {
          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")

          const {security} = req.body
          if (Helper.stringIsEmpty(security)) throw new Error("security is empty")
          if (security === "closed") {
            const {jwt} = req
            if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
            for (let i = 0; i < doc.users.length; i++) {
              if (doc.users[i].id === jwt.id) return res.sendStatus(200)
            }
          }

          if (security === "open") {
            const {localStorageId} = req.body
            if (Helper.stringIsEmpty(localStorageId)) throw new Error("local storage id is empty")
            for (let i = 0; i < doc.users.length; i++) {
              if (doc.users[i].id === localStorageId) return res.sendStatus(200)
            }
          }

          const {email} = req.body
          if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
          const newUser = {
            id: Helper.digest(JSON.stringify({email: email, verified: true})),
            email,
            verified: false,
            roles: [],
            authorized: [],
            created_at: Date.now(),
          }
          if (Helper.objectIsEmpty(newUser)) throw new Error("new user is empty")
          doc.users.push(newUser)
          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
          return res.sendStatus(200)
        }
      }
      return next()
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
  }

  static async sendOffer(req, res, next) {
    try {
      const {method, security, type, name, urlId} = req.body

      if (type === "offer") {
        if (name === "bestprime") {
          if (method === "get") {
            if (security === "closed") {
              if (urlId !== undefined) {
                const {user} = await Helper.findUser(user => user.id === urlId)
                for (let i = 0; i < user.offers.length; i++) {
                  if (user.offers[i].name === name && user.offers[i].value.selected === true) {
                    return res.send(user.offers[i])
                  } else throw new Error(`expected to find offer with name '${name}', but found '${JSON.stringify(user.offers[i])}'`)
                }
              }
            }

            if (security === "open") {
              const offer = Helper.createBestprimeOffer(req.body)
              return res.send(offer)
            }
          }
        }
      }

      return next()
    } catch (error) {
      console.error(error)
    }
    return res.sendStatus(404)
    // next()
  }

  // static async requireStorage(req, res, next) {
  //   try {
  //     const {user} = await Helper.find(it => it.id === req.user.id)
  //     if (user.roles.includes(UserRole.OPERATOR)) {
  //       const {shsFunnel, offers, checklist} = user
  //       if (Helper.objectIsEmpty(shsFunnel)) return res.sendStatus(404)
  //       if (Helper.arrayIsEmpty(offers)) return res.sendStatus(404)
  //       if (Helper.objectIsEmpty(checklist)) return res.sendStatus(404)
  //       return res.send({shsFunnel, offers, checklist})
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   next()
  // }

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
      console.error(error)
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
      console.error(error)
    }
    return res.sendStatus(404)
  }

  // static async requireLocalStorageId(req, res, next) {
  //   try {
  //     const {localStorageId} = req.body
  //     if (Helper.stringIsEmpty(localStorageId)) throw new Error("localStorageId is empty")
  //   } catch (error) {
  //     console.error(error)
  //     return res.sendStatus(404)
  //   }
  //   next()
  // }

  static async requireBody(req, res, next) {
    try {
      if (Helper.objectIsEmpty(req.body)) throw new Error("body is empty")
      else return next()
    } catch (error) {
      console.error(error)
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
      console.error(error)
    }
    return res.sendStatus(404)
  }

  static async requireJwtToken(req, res, next) {
    try {

      if (req.method === "GET") {
        if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
        const {jwtToken} = req.cookies
        if (Helper.stringIsEmpty(jwtToken)) return res.redirect("/home/")
        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const {user} = await Helper.find(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
        if (user.session.jwt !== Helper.digest(jwtToken)) throw new Error("jwt token changed")
        const verifiedUser = await (await Helper.find(user => user.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified})))).user
        if (Helper.objectIsEmpty(verifiedUser)) throw new Error("verified user is empty")
        if (!Helper.isEqual(jwt.roles, verifiedUser.roles)) throw new Error("jwt roles mismatch")
        if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
        req.jwt = jwt
        return next()
      }

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
      console.error(error)
    }
    return res.sendStatus(404)
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
        console.error(error)
      }
      return res.sendStatus(404)
    }
  }

  // static async requireCookies(req, res, next) {
  //   try {
  //     if (Helper.objectIsEmpty(req.cookies)) throw new Error("cookies are empty")
  //     // const {security} = req.body
  //     // if (Helper.stringIsEmpty(security)) throw new Error("security is empty")
  //     // if (security === "closed") {
  //     // }
  //     return next()
  //   } catch (error) {
  //     console.error(error)
  //   }
  //   return res.sendStatus(404)
  // }

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
      console.error(error)
    }
    return res.sendStatus(404)
    // next()
  }

}
