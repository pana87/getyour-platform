require('dotenv').config()
const { UserRole } = require("./UserRole.js")
const { Helper } = require("./Helper.js")
const jwt = require('jsonwebtoken')
const nano = require("nano")(process.env.COUCHDB_LOCATION)

module.exports.Request = class {

  static async delete(req, res, next) {
    try {

      if (req.params.method === "delete") {

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users are undefined")

        if (req.params.type === "platform") {
          if (req.params.event === "closed") {
            const {jwt} = req


            const {name} = req.body
            if (Helper.stringIsEmpty(name)) throw new Error("name is empty")

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user.platforms === undefined) throw new Error("platforms is undefined")
                for (let i = 0; i < user.platforms.length; i++) {
                  const platform = user.platforms[i]

                  if (platform.name === name) {
                    user.platforms.splice(i, 1)
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                    return res.sendStatus(200)
                  }

                }

              }

            }
          }
        }



        if (req.params.type === "service") {
          if (req.params.event === "closed") {
            const {jwt} = req

            // const doc = await nano.db.use("getyour").get("users")
            // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            // if (doc.users === undefined) throw new Error("users are undefined")

            const {name} = req.body
            if (Helper.stringIsEmpty(name)) throw new Error("name is empty")

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                for (let i = 0; i < user.offer.services.length; i++) {
                  const service = user.offer.services[i]

                  if (service.name === name) {
                    user.offer.services.splice(i, 1)
                    await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
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

  static async redirect(req, res, next) {
    try {

      if (req.params.method === "redirect") {
        if (req.params.type === "user") {
          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")

          const {location} = req.body
          if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
          const loc = new URL(location)
          if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
          const username = loc.pathname.split("/")[1]
          const platform = loc.pathname.split("/")[2]
          const path = loc.pathname.split("/")[3]


          if (req.params.event === "closed") {

            const {roleId} = req.body
            if (roleId !== undefined) {
              const role = parseInt(roleId)
              if (Helper.numberIsEmpty(role)) throw new Error("role is empty")


              const {jwt} = req

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === jwt.id) {

                  if (user.roles.length === 0) {
                    return res.send("/")
                  }

                  if (role === UserRole.EXPERT) {
                    if (Helper.stringIsEmpty(user.name)) throw new Error("user name is empty")
                    return res.send(`/${user.name}/`)
                  }

                  if (role === UserRole.ADMIN) {
                    return res.send("/pana/getyour/admin/")
                  }

                  if (role === UserRole.SELLER) {
                    return res.send("/felix/energie-plattform/verkaufer-ansicht/4/")
                  }

                  if (role === UserRole.PROMOTER) {
                    return res.send("/felix/energie-plattform/promoter-ansicht/5/")
                  }

                  if (role === UserRole.MONTEUR) {
                    return res.send("/felix/energie-plattform/monteur-ansicht/6/")
                  }

                  if (role === UserRole.OPERATOR) {
                    if (user[platform].funnel === undefined) return res.send("/felix/energie-plattform/qualifizierung/1/")
                    if (user[platform].funnel.technischesWlan !== undefined) return res.send("/felix/energie-plattform/abfrage-technisches/1/")
                    if (user[platform].funnel.stromHauptzaehlerAnzahl !== undefined) return res.send("/felix/energie-plattform/abfrage-strom/1/")
                    if (user[platform].funnel.heizungWarm !== undefined) return res.send("/felix/energie-plattform/abfrage-heizung/1/")
                    if (user[platform].funnel.hausEtage !== undefined) return res.send("/felix/energie-plattform/abfrage-haus/1/")
                    if (user[platform].funnel.q0 !== undefined) return res.send("/felix/energie-plattform/qualifizierung/1/")
                    if (user[platform].checklist !== undefined)return res.send("/felix/energie-plattform/anlagenbetreiber-ansicht/1/")
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
            const {email, event} = req.body
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
            if (Helper.stringIsEmpty(event)) throw new Error("event is empty")

            if (event === "/register/seller/") {

              await Helper.sendEmailFromDroid({
                from: "<droid@get-your.de>",
                to: email,
                subject: "[getyour plattform] Angebot freigeschaltet",
                html: /*html*/`
                  <p>Ihr Promoter hat Sie in die Liste seiner Verkäufer erfolgreich hinzugefügt. <a href="https://get-your.de/felix/ep/hersteller-vergleich/4/">Das Angebot wird ab sofort hier zur Verfügung stehen.</a></p>
                  <p>Sollten Sie nicht wissen, warum Sie diese E-Mail erhalten, dann hat ein unbekannter Zugang zu Ihrer E-Mail Adresse. In dem Fall, kontaktieren Sie uns umgehend unter datenschutz@get-your.de und lassen Sie Ihren Zugang sperren.</p>
                  <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
                `
              })
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

  static async invite(req, res, next) {
    try {

      if (req.params.method === "invite") {
        if (req.params.type === "email") {
          if (req.params.event === "closed") {
            const {email} = req.body
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")

            const role = parseInt(req.body.role)
            if (Helper.numberIsEmpty(role)) throw new Error("role is empty")

            if (role === UserRole.PROMOTER) {
              await Helper.sendEmailFromDroid({
                from: "<droid@get-your.de>",
                to: email,
                subject: "[getyour plattform] Einladung als Promoter",
                html: /*html*/`
                  <p>Sie wurden von einem Admin eingeladen als Promoter auf der Getyour Plattform teilzunehmen. <a href="https://get-your.de/pana/getyour/login/">Sie können sich jetzt ab sofort hier anmelden.</a></p>
                  <p>Sollten Sie nicht wissen, warum Sie diese E-Mail erhalten, dann hat ein unbekannter Zugang zu Ihrer E-Mail Adresse. In dem Fall, kontaktieren Sie uns umgehend unter datenschutz@get-your.de und lassen Sie Ihren Zugang sperren.</p>
                  <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
                `
              })
              return res.sendStatus(200)
            }

            await Helper.sendEmailFromDroid({
              from: "<droid@get-your.de>",
              to: email,
              subject: "[getyour plattform] Einladung",
              html: /*html*/`
                <p>Sie wurden von einem Admin eingeladen als Branchenexperte auf der Getyour Plattform teilzunehmen. <a href="https://get-your.de/pana/getyour/login/">Sie können sich jetzt ab sofort hier anmelden.</a></p>
                <p>Sollten Sie nicht wissen, warum Sie diese E-Mail erhalten, dann ignorieren Sie diese E-Mail. Sollte es öfters vorkommen, dass Sie diese E-Mail erhalten, dann kontaktieren Sie uns bitte umgehend unter datenschutz@get-your.de</p>
                <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
              `
            })
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
        const {location} = req.body
        if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
        const loc = new URL(location)
        if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
        const username = loc.pathname.split("/")[1]
        const platform = loc.pathname.split("/")[2]

        const doc = await nano.db.use("getyour").get("users")
        if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
        if (doc.users === undefined) throw new Error("users is undefined")

        if (req.params.type === "feedback") {
          if (req.params.event === "closed") {
            const {email, value} = req.body
            const {jwt} = req

            if (email !== undefined) {
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.email === email) {
                  if (user.offer === undefined) throw new Error("offer is undefined")
                  if (user.offer.feedbacks === undefined) user.offer.feedbacks = []
                  const feedback = {}
                  feedback.owner = jwt.id
                  feedback.value = value
                  feedback.created = Date.now()
                  user.offer.feedbacks.unshift(feedback)
                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }
              }
            }


          }
        }

        if (req.params.type === "platform") {
          if (req.params.event === "closed") {






            const {name, logo, type, visibility} = req.body
            if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
            const {jwt} = req


            if (type !== undefined) {
              if (Helper.stringIsEmpty(type)) throw new Error("type is empty")

              if (type === "visibility") {
                if (Helper.stringIsEmpty(visibility)) throw new Error("visibility is empty")
                for (let i = 0; i < doc.users.length; i++) {
                  const user = doc.users[i]

                  if (user.id === jwt.id) {
                    if (user.name === username) {
                      for (let i = 0; i < user.platforms.length; i++) {
                        const platform = user.platforms[i]

                        if (platform.name === name) {
                          platform.visibility = visibility
                          await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                          return res.sendStatus(200)
                        }

                      }
                    }
                  }

                }

              }

            }






            if (Helper.objectIsEmpty(logo)) throw new Error("logo is empty")


            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.platforms !== undefined) {
                for (let i = 0; i < user.platforms.length; i++) {
                  const platform = user.platforms[i]
                  if (platform.name === name) throw new Error("name exist")
                }
              }
            }

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user.platforms === undefined) throw new Error("platforms is undefined")
                const map = {}
                map.id = Helper.digest(`${Date.now()}`)
                map.name = name
                map.logo = logo
                map.home = `/${user.name}/${name}/`
                map.created = Date.now()
                map.visibility = "closed"
                map.values = []
                user.platforms.push(map)
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
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
        }


        if (req.params.type === "seller") {
          if (req.params.event === "closed") {
            // const doc = await nano.db.use("getyour").get("users")
            // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            // if (doc.users === undefined) throw new Error("users is undefined")
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
                  if (user.name === undefined) user.name = {}
                  user.name = name
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

            // const doc = await nano.db.use("getyour").get("users")
            // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            // if (doc.users === undefined) throw new Error("users is undefined")

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

            const {jwt} = req

            const {urlId} = req.body
            if (urlId !== undefined) {

              const {tag, funnel} = req.body
              if (Helper.stringIsEmpty(tag)) throw new Error("tag is empty")
              if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
              if (Helper.objectIsEmpty(funnel)) throw new Error("url id is empty")

              // const doc = await nano.db.use("getyour").get("users")
              // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
              // if (doc.users === undefined) throw new Error("users are undefined")

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === urlId) {

                  if (user[tag] === undefined) user[tag] = {}
                  user[tag] = funnel

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }
              throw new Error("user not found")
            }




            const {funnel} = req.body
            if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user[platform] === undefined) user[platform] = {}
                user[platform].funnel = funnel
                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }

            }





            throw new Error("register funnel failed")
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



            }




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

                await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                return res.sendStatus(200)
              }

            }
            throw new Error("user not found")
          }
        }


        if (req.params.type === "client") {
          if (req.params.event === "closed") {




            const {email} = req.body
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")

            // const doc = await nano.db.use("getyour").get("users")
            // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            // if (doc.users === undefined) throw new Error("users are undefined")



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

              const {jwt} = req

              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.id === jwt.id) {
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

        const {location} = req.body
        if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
        const loc = new URL(location)
        if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
        const platform = loc.pathname.split("/")[2]

        if (req.params.type === "platform") {
          if (req.params.event === "closed") {
            const {name} = req.body
            if (name !== undefined) {
              if (Helper.stringIsEmpty(name)) throw new Error("name is empty")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.platforms !== undefined) {
                  for (let i = 0; i < user.platforms.length; i++) {
                    const platform = user.platforms[i]

                    if (platform.name === name) {
                      return res.sendStatus(200)
                    }

                  }
                }

              }
            }
          }
        }


        if (req.params.type === "email") {
          // const doc = await nano.db.use("getyour").get("users")
          // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          // if (doc.users === undefined) throw new Error("users is undefined")

          const {email} = req.body
          if (Helper.stringIsEmpty(email)) throw new Error("email is empty")

          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]

            if (user.email === email) {
              return res.sendStatus(200)
            }

          }
        }

        if (req.params.type === "seller") {
          if (req.params.event === "closed") {
            // const {location} = req.body
            // if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
            // const loc = new URL(location)
            // if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
            // const platform = loc.pathname.split("/")[2]

            // const doc = await nano.db.use("getyour").get("users")
            // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            // if (doc.users === undefined) throw new Error("users is undefined")
            const {jwt} = req


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

        if (req.params.type === "roles") {
          if (req.params.event === "closed") {

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
                      if (user.name === name) {
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

        if (req.params.type === "name") {
          if (req.params.event === "closed") {
            // const doc = await nano.db.use("getyour").get("users")
            // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            // if (doc.users === undefined) throw new Error("users is undefined")


            const {name} = req.body
            if (Helper.stringIsEmpty(name)) throw new Error("name is empty")

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.name === name) {
                return res.sendStatus(200)
              }


            }
          }
        }

        if (req.params.type === "lead") {
          if (req.params.event === "closed") {

            const {type, state} = req.body
            if (Helper.stringIsEmpty(type)) throw new Error("type is empty")
            if (Helper.stringIsEmpty(state)) throw new Error("state is empty")

            // const doc = await nano.db.use("getyour").get("users")
            // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            // if (doc.users === undefined) throw new Error("users is undefined")

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

            // const doc = await nano.db.use("getyour").get("users")
            // if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            // if (doc.users === undefined) throw new Error("users is undefined")

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


        if (req.params.event === "closed") {
          const {jwt} = req
          const {user} = await Helper.findUser(user => user.id === jwt.id)

          if (req.params.type === "role") {

            const role = parseInt(req.params.role)
            if (Helper.numberIsEmpty(role)) throw new Error("role is empty")
            for (let i = 0; i < user.roles.length; i++) {
              if (role === user.roles[i]) {
                return res.sendStatus(200)
              }
            }

          }

          if (req.params.type === "email") {
            const {email} = req.body
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")

            for (let i = 0; i < doc.users.length; i++) {
              if (doc.users[i].email === email) return res.sendStatus(200)
            }
          }




        }
      }


      throw new Error("request not found")
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

        const {location} = req.body
        if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
        const loc = new URL(location)
        if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
        const username = loc.pathname.split("/")[1]
        const platform = loc.pathname.split("/")[2]


        if (req.params.type === "platforms") {

          if (req.params.event === "closed") {
            const {jwt} = req

            const array = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                for (let i = 0; i < user.platforms.length; i++) {
                  const platform = user.platforms[i]

                  const map = {}
                  map.home = platform.home
                  map.logo = platform.logo.dataUrl
                  map.name = platform.name
                  array.push(map)

                }
              }
            }

            return res.send(array)
          }




          if (req.params.event === "open") {

            const array = []
            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.name !== undefined) {
                if (user.name === username) {
                  for (let i = 0; i < user.platforms.length; i++) {
                    const platform = user.platforms[i]

                    if (platform.visibility === "open") {
                      const map = {}
                      map.home = platform.home
                      map.logo = platform.logo.dataUrl
                      map.name = platform.name
                      array.push(map)
                    }

                  }
                }
              }
            }

            return res.send(array)
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

            const {email} = req.body
            if (email !== undefined) {
              if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user.email === email) {
                  if (user.offer === undefined) throw new Error("offer is undefined")
                  if (user.offer.feedbacks === undefined) throw new Error("feedbacks is undefined")
                  return res.send(user.offer.feedbacks)
                }

              }
            }

            const {platformName} = req.body
            if (platformName !== undefined) {
              if (Helper.stringIsEmpty(platformName)) throw new Error("platform name is empty")


              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                if (user[platformName] !== undefined) {
                  for (let i = 0; i < user.roles.length; i++) {
                    const role = user.roles[i]

                    if (role === UserRole.PROMOTER) {
                      if (Helper.objectIsEmpty(user.offer)) throw new Error("offer is empty")
                      if (Helper.objectIsEmpty(user.owner)) throw new Error("owner is empty")
                      if (Helper.objectIsEmpty(user.company)) throw new Error("company is empty")
                      if (Helper.arrayIsEmpty(user.offer.services)) throw new Error("offer services is empty")
                      // if (Helper.arrayIsEmpty(user.offer.termsPdf)) throw new Error("offer termsPdf is empty")
                      // if (Helper.arrayIsEmpty(user.offer.companyPdf)) throw new Error("offer companyPdf is empty")
                      // if (Helper.arrayIsEmpty(user.offer.productPdf)) throw new Error("offer productPdf is empty")

                      if (user.offer.visibility === "open") {
                        const map = {}
                        map.email = user.email
                        map.reputation = user.reputation
                        map.owner = user.owner
                        map.company = user.company
                        map.offer = user.offer
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
                    map.logo = user.company.logo

                    map.title = user.offer.title
                    map.description = user.offer.description
                    map.vat = user.offer.vat
                    map.tag = user.offer.tag



                    // get funnel
                    const {funnel} = req.body
                    if (Helper.objectIsEmpty(funnel)) throw new Error("funnel is empty")
                    console.log(funnel);
                    // get filter from offer
                    const filter = user.offer.filter
                    // get services
                    console.log(filter);
                    const services = user.offer.services
                    // calc services with funnel and filter
                    console.log(services);

                    // const servicesFilteredByFunnel = Helper.servicesFilteredByFunnel(services, filter, funnel)


                    // the map the view with the data
                    map.grossAmount = 10




                    array.push(map)
                    // array.push(map)
                  }

                }
              }

            }

            // sort array before sending
            return res.send(array)



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
            if (parseInt(req.params.role) === UserRole.ADMIN) {
              const doc = await nano.db.use("getyour").get("users")
              if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
              if (doc.users === undefined) throw new Error("users are undefined")

              const array = []
              for (let i = 0; i < doc.users.length; i++) {
                const user = doc.users[i]

                const map = {}
                map.email = user.email
                map.verified = user.verified
                map.roles = user.roles
                map.created = user.created
                map.counter = 0
                if (user.session !== undefined) map.counter = user.session.counter
                map.keys = Helper.getKeysRecursively(user)

                array.push(map)
              }
              return res.send(array)
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
            const platform = loc.pathname.split("/")[2]
            const username = loc.pathname.split("/")[1]



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
                      // map.path = "/pana/getyour/admin/"
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
                      // map.path = `/${user.name}/`
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
            const platform = loc.pathname.split("/")[2]
            const username = loc.pathname.split("/")[1]

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
                if (user.name !== undefined) {
                  if (user.name === username) {
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


        if (req.params.type === "services") {
          if (req.params.event === "closed") {
            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")
            const {jwt} = req

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]

              if (user.id === jwt.id) {
                if (user.offer === undefined) throw new Error("offer is undefined")
                if (user.offer.services === undefined) throw new Error("services is undefined")
                return res.send(user.offer.services)
              }

            }

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


            const doc = await nano.db.use("getyour").get("users")
            if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
            if (doc.users === undefined) throw new Error("users are undefined")

            const {location} = req.body
            if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
            const loc = new URL(location)
            if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
            const platform = loc.pathname.split("/")[2]

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
            const {user} = await Helper.findUser(user => user.id === jwt.id)

            if (user.owner === undefined) throw new Error("owner is undefined")
            const map = {}
            map.firstname = user.owner.firstname
            map.lastname = user.owner.lastname

            return res.send(map)
          }
        }

      }



      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }




  static async getOwner(req, res, next) {
    try {
      const {method, type} = req.body
      if (type === "owner") {
        if (method === "get") {
          const {jwt} = req
          const {user} = await Helper.findUser(user => user.id === jwt.id)

          if (user.owner === undefined) throw new Error("owner is undefined")
          const map = {}
          map.firstname = user.owner.firstname
          map.lastname = user.owner.lastname

          return res.send(map)
        }
      }




      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async getClients(req, res, next) {
    try {
      const {method, type} = req.body
      if (type === "clients") {
        if (method === "get") {
          const {jwt} = req
          const jwtUser = await (await Helper.findUser(user => user.id === jwt.id)).user

          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")

          const clients = []
          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]
            if (jwtUser.clients !== undefined) {
              for (let i = 0; i < jwtUser.clients.length; i++) {
                const client = jwtUser.clients[i]

                if (user.id === client.id) {

                  const map = {}
                  map.email = user.email
                  map.firstname = user.owner.firstname
                  map.lastname = user.owner.lastname
                  map.street = user.owner.street
                  map.zip = user.owner.zip
                  map.phone = user.owner.phone
                  map.state = client.state

                  clients.push(map)
                }
              }
            }
          }





          return res.send(clients)
        }
      }

      return next()
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  // static async verify(req, res, next) {
  //   try {
  //     const {type, method} = req.body
  //     if (method === "verify") {

  //       const doc = await nano.db.use("getyour").get("users")
  //       if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
  //       if (doc.users === undefined) throw new Error("users are undefined")


  //       if (type === "name") {
  //         const {nameToVerify} = req.body
  //         if (Helper.stringIsEmpty(nameToVerify)) throw new Error("name to verify is empty")
  //         for (let i = 0; i < doc.users.length; i++) {
  //           if (doc.users[i].name === nameToVerify) return res.sendStatus(200)
  //         }
  //       }


  //       if (type === "email") {
  //         const {emailToVerify} = req.body
  //         if (Helper.stringIsEmpty(emailToVerify)) throw new Error("email to verify is empty")
  //         for (let i = 0; i < doc.users.length; i++) {
  //           if (doc.users[i].email === emailToVerify) return res.sendStatus(200)
  //         }
  //       }


  //     }





  //   } catch (error) {
  //     await Helper.logError(error, req)
  //   }
  //   return res.sendStatus(404)

  // }

  // static async inviteEmail(req, res, next) {
  //   try {

  //     const {type, method} = req.body
  //     if (type === "email") {
  //       if (method === "invite") {


  //         const {emailToInvite} = req.body
  //         if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
  //         randomPin = Helper.digest(crypto.randomBytes(32))
  //         expiredTimeMs = Date.now() + (2 * 60 * 1000)

  //         await Helper.sendEmailFromDroid({
  //           from: "<droid@get-your.de>",
  //           to: emailToInvite,
  //           subject: "[getyour plattform] Deine PIN",
  //           html: /*html*/`
  //             <p>PIN: ${randomPin}</p>
  //             <p>Sollten Sie gerade nicht versucht haben sich unter https://get-your.de anzumelden, dann erhalten Sie diese E-Mail, weil jemand anderes versucht hat sich mit Ihrer E-Mail Adresse anzumelden. In dem Fall löschen Sie die E-Mail mit der PIN und <span style="color: #d50000; font-weight: bold;">geben Sie die PIN auf keinen Fall weiter.</span></p>
  //             <p>Wenn Sie Ihre PIN mit anderen teilen, besteht die Gefahr, dass unbefugte Personen Zugang zu Ihrem Konto erhalten und Ihre Sicherheit gefährden. Daher ist es wichtig, Ihre PIN vertraulich zu behandeln und sicherzustellen, dass Sie sie nur selbst verwenden.</p>
  //             <p>Sollte eine andere E-Mail Adresse als <a href="#" style="text-decoration: none; color: #d50000; font-weight: bold; cursor: default;">droid&#64;get-your&#46;de</a> als Absender erscheinen, dann versucht jemand sich als vertrauenswürdiger Absender auszugeben. Klicken Sie in dem Fall auf keine Links, antworten Sie nicht dem Absender und kontaktieren Sie uns sofort unter datenschutz@get-your.de</p>
  //           `
  //         })
  //         return res.sendStatus(200)


  //       }
  //     }




  //   } catch (error) {
  //     await Helper.logError(error, req)
  //   }
  //   return res.sendStatus(404)
  // }

  static async deleteUser(req, res, next) {
    try {

      const {method, type} = req.body
      if (type === "user") {
        if (method === "delete") {

          const {emailToDelete} = req.body
          if (Helper.stringIsEmpty(emailToDelete)) throw new Error("email to delete is empty")

          const doc = await nano.db.use("getyour").get("users")

          for (let i = 0; i < doc.users.length; i++) {

            if (doc.users[i].email === emailToDelete) {
              doc.users.splice(i, 1)
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

  // static async getUsers(req, res, next) {
  //   try {

  //     const {method, type} = req.body
  //     if (type === "user") {
  //       if (method === "get") {

  //         const doc = await nano.db.use("getyour").get("users")

  //         const users = []

  //         for (let i = 0; i < doc.users.length; i++) {
  //           const user = doc.users[i];

  //           const map = {}
  //           map.email = user.email
  //           map.verified = user.verified
  //           map.roles = user.roles
  //           if (user.session !== undefined) {
  //             map.sessionCounter = user.session.counter
  //           }
  //           map.created = user.created

  //           const keys = Helper.getKeysRecursively(user)

  //           map.keys = keys

  //           users.push(map)

  //         }



  //         return res.send(users)
  //       }
  //     }


  //     return next()
  //   } catch (error) {
  //     await Helper.logError(error, req)
  //   }
  //   return res.sendStatus(404)
  // }

  // static async getErrors(req, res, next) {
  //   try {

  //     const {method, type} = req.body
  //     if (type === "error") {
  //       if (method === "get") {

  //         const doc = await nano.db.use("getyour").get("logs")
  //         // filter logs by type
  //         const offset = parseInt(req.body.offset) || 0
  //         const limit = parseInt(req.body.limit) || 21
  //         const slicedLogs = doc.logs.slice(offset, offset + limit);

  //         return res.send(slicedLogs)
  //       }
  //     }


  //     return next()
  //   } catch (error) {
  //     await Helper.logError(error, req)
  //   }
  //   return res.sendStatus(404)
  // }

  // static async verifyUrlId(req, res, next) {
  //   try {


  //     if (req.params.urlId !== undefined) {
  //       const urlId = req.params.urlId
  //       if (Helper.stringIsEmpty(urlId)) throw new Error("url id is empty")
  //       const userFromUrlId = await (await Helper.findUser(user => user.id === urlId)).user

  //       const {jwt} = req
  //       const userFromJwt = await (await Helper.findUser(user => user.id === jwt.id)).user

  //       if (jwt.id !== urlId) throw new Error("jwt id is not equal url id")
  //       if (urlId !== userFromUrlId.id) throw new Error("url id is not trusted")
  //       if (urlId !== userFromJwt.id) throw new Error("jwt id is not trusted")
  //       if (jwt.id !== userFromUrlId.id) throw new Error("jwt id is not trusted")
  //       if (jwt.id !== userFromJwt.id) throw new Error("jwt id is not trusted")
  //       if (userFromJwt.id !== userFromUrlId.id) throw new Error("user id mismatch")
  //       return next()
  //     }


  //   } catch (error) {
  //     await Helper.logError(error, req)
  //   }
  //   return res.sendStatus(404)
  // }

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
      const {type, method, name} = req.body

      if (type === "name") {
        if (method === "verify") {
          // console.log("hi");
          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")
          for (let i = 0; i < doc.users.length; i++) {
            // console.log(name);
            // console.log(doc.users[i].name);
            if (doc.users[i].name === name) return res.sendStatus(200)
          }
        }
      }

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

          const {referer, location} = req.body
          if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
          const loc = new URL(location)
          let ref = ""
          if (referer !== "") {
            ref = new URL(referer)
          }

          const {jwt} = req
          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")


          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]

            if (user.id === jwt.id) {

              if (user.roles.length === 0) {
                return res.send("/pana/getyour/zugang/")
              }

              for (let i = 0; i < user.roles.length; i++) {
                const role = user.roles[i]

                // console.log(role);
                if (role === UserRole.ADMIN) {
                  return res.send("/pana/getyour/admin/")
                }

                if (role === UserRole.SELLER) {
                  return res.send("/felix/ep/verkaufer-ansicht/4/")
                }

                if (role === UserRole.PROMOTER) {
                  return res.send("/felix/ep/promoter-ansicht/5/")
                }

                if (role === UserRole.EXPERT) {
                  if (user.name !== undefined) return res.send(`/${user.name}/`)
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
          user.lead.created = Date.now()
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
      const {sessionToken} = req.cookies

      // console.log("hi");
      if (sessionToken !== undefined) {
        const {jwt} = req
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
      }

      throw new Error("verify session failed")
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

  static async createFunnel(req, res, next) {
    try {
      const {method, type, name} = req.body

      if (type === "funnel") {
        if (method === "create") {





          if (name === "shs") {
            const funnel = Helper.createSHSFunnel()
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
          // console.log(consumer);
          // console.log(typeof consumer);
          if (Helper.numberIsEmpty(consumer)) throw new Error("consumer is empty")




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

          if (consumer === UserRole.EXPERT) {
            const {email, name} = req.body
            if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
            if (Helper.stringIsEmpty(name)) throw new Error("name is empty")

            const {doc, user} = await Helper.findUser(user => user.email === email)
            let foundRole = false
            for (let i = 0; i < user.roles.length; i++) {
              if (user.roles[i] === UserRole.EXPERT) {
                foundRole = true
                break
              }
            }
            if (foundRole === true) return res.sendStatus(200)

            if (foundRole === false) {
              user.roles.push(UserRole.EXPERT)
              user.platforms = []
              user.name = name
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
      if (req.params.method === "register") {
        if (req.params.type === "email") {

          const {email} = req.body
          if (Helper.stringIsEmpty(email)) throw new Error("email is empty")

          const {location} = req.body
          if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
          const loc = new URL(location)
          if (Helper.objectIsEmpty(loc)) throw new Error("location is not valid")
          const platform = loc.pathname.split("/")[2]

          const role = parseInt(req.body.role)
          if (Helper.numberIsEmpty(role)) throw new Error("role is empty")

          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")



          if (role === UserRole.MONTEUR) {

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.email === email) {

                let found = false
                for (let i = 0; i < user.roles.length; i++) {
                  if (user.roles[i] === UserRole.MONTEUR) {
                    found = true
                    break
                  }
                }

                if (found === true) return res.sendStatus(200)
                if (found === false) {
                  if (user[platform] === undefined) user[platform] = {}

                  user.roles.push(UserRole.MONTEUR)

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }
            }

            {
              const user = {}
              user.id =  Helper.digest(JSON.stringify({email: email, verified: true})),
              user.email = email
              user.verified =  false
              user.created =  Date.now()
              user.reputation = 0
              user.roles =  []
              user[platform] = {}

              user.roles.push(UserRole.MONTEUR)

              doc.users.push(user)
            }

            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }



          if (role === UserRole.EXPERT) {

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.email === email) {

                let found = false
                for (let i = 0; i < user.roles.length; i++) {
                  if (user.roles[i] === UserRole.EXPERT) {
                    found = true
                    break
                  }
                }

                if (found === true) return res.sendStatus(200)
                if (found === false) {
                  if (user[platform] === undefined) user[platform] = {}

                  user.roles.push(UserRole.EXPERT)
                  user.platforms = []

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }
            }

            {
              const user = {}
              user.id =  Helper.digest(JSON.stringify({email: email, verified: true})),
              user.email = email
              user.verified =  false
              user.created =  Date.now()
              user.reputation = 0
              user.roles =  []
              user[platform] = {}

              user.roles.push(UserRole.EXPERT)
              user.platforms = []

              doc.users.push(user)
            }

            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }


          if (role === UserRole.PROMOTER) {


            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.email === email) {

                let found = false
                for (let i = 0; i < user.roles.length; i++) {
                  if (user.roles[i] === UserRole.PROMOTER) {
                    found = true
                    break
                  }
                }

                if (found === true) return res.sendStatus(200)
                if (found === false) {
                  if (user[platform] === undefined) user[platform] = {}

                  user.roles.push(UserRole.PROMOTER)

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }
            }



            {
              const user = {}
              user.id =  Helper.digest(JSON.stringify({email: email, verified: true})),
              user.email = email
              user.verified =  false
              user.created =  Date.now()
              user.reputation = 0
              user.roles =  []
              user[platform] = {}

              user.roles.push(UserRole.PROMOTER)

              doc.users.push(user)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }





          }


          if (role === UserRole.OPERATOR) {

            for (let i = 0; i < doc.users.length; i++) {

              const user = doc.users[i]

              if (user.email === email) {

                let found = false
                for (let i = 0; i < user.roles.length; i++) {
                  if (user.roles[i] === UserRole.OPERATOR) {
                    found = true
                    break
                  }
                }

                if (found === true) return res.sendStatus(200)
                if (found === false) {
                  if (user[platform] === undefined) user[platform] = {}

                  user.roles.push(UserRole.OPERATOR)

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }
            }



            {
              const user = {}
              user.id =  Helper.digest(JSON.stringify({email: email, verified: true})),
              user.email = email
              user.verified =  false
              user.created =  Date.now()
              user.reputation = 0
              user.roles =  []
              user[platform] = {}

              user.roles.push(UserRole.OPERATOR)

              doc.users.push(user)
              await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
              return res.sendStatus(200)
            }

          }


          if (role === UserRole.ADMIN) {

            for (let i = 0; i < doc.users.length; i++) {
              const user = doc.users[i]
              if (user.email === email) {

                let found = false
                for (let i = 0; i < user.roles.length; i++) {
                  if (user.roles[i] === UserRole.ADMIN) {
                    found = true
                    break
                  }
                }

                if (found === true) return res.sendStatus(200)
                if (found === false) {
                  if (user[platform] === undefined) user[platform] = {}

                  if (email.endsWith("@get-your.de")) {
                    user.verified = true
                    user.roles.push(UserRole.ADMIN)
                  }

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }

            }

            {
              const user = {}
              user.id =  Helper.digest(JSON.stringify({email: email, verified: true})),
              user.email = email
              user.verified =  false
              user.roles =  []
              user.reputation = 0
              user.created =  Date.now()
              user[platform] = {}

              if (email.endsWith("@get-your.de")) {
                user.verified = true
                user.roles.push(UserRole.ADMIN)
              }

              doc.users.push(user)
            }
            await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
            return res.sendStatus(200)
          }


          if (role === UserRole.SELLER) {

            for (let i = 0; i < doc.users.length; i++) {

              const user = doc.users[i]

              if (user.email === email) {

                let found = false
                for (let i = 0; i < user.roles.length; i++) {
                  if (user.roles[i] === UserRole.SELLER) {
                    found = true
                    break
                  }
                }

                if (found === true) return res.sendStatus(200)
                if (found === false) {
                  if (user[platform] === undefined) user[platform] = {}

                  user.roles.push(UserRole.SELLER)
                  user.clients = []

                  await nano.db.use("getyour").insert({ _id: doc._id, _rev: doc._rev, users: doc.users })
                  return res.sendStatus(200)
                }

              }
            }



            {
              const user = {}
              user.id =  Helper.digest(JSON.stringify({email: email, verified: true})),
              user.email = email
              user.verified =  false
              user.created =  Date.now()
              user.reputation = 0
              user.roles =  []
              user[platform] = {}

              user.clients = []
              user.roles.push(UserRole.SELLER)

              doc.users.push(user)
            }




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

  static async verifyJwtId(req, res, next) {
    try {
      if (req.method === "GET" || req.method === "POST") {
        const {jwt} = req
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const userFromJwt = await (await Helper.findUser(user => user.id === jwt.id)).user
        const foundVerifiedUserById = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: userFromJwt.email, verified: userFromJwt.verified})))).user
        if (userFromJwt.id !== foundVerifiedUserById.id) throw new Error("user id mismatch")
        if (jwt.id !== foundVerifiedUserById.id) throw new Error("jwt id mismatch")
        if (userFromJwt.email !== foundVerifiedUserById.email) throw new Error("user email mismatch")
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
        const {localStorageId, localStorageEmail, referer, location} = req.body

        if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
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
        if (Helper.objectIsEmpty(userById)) throw new Error("user not registerd")

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

      if (req.params.event === "open") {
        const {referer, location} = req.body
        if (Helper.stringIsEmpty(location)) throw new Error("location is empty")
        if (referer === undefined) throw new Error("referer is undefined")
        return next()
      }

      throw new Error("event unknown")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyOpenPostRequest(req, res, next) {
    try {

      if (req.method === "POST") {
        const {localStorageId, email, referer} = req.body
        if (Helper.stringIsEmpty(localStorageId)) throw new Error("local storage id is empty")
        if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
        if (referer === undefined) throw new Error("referer is undefined")
        return next()
      }

    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyClosedPostRequest(req, res, next) {
    try {

      if (req.method === "POST") {
        const {localStorageId, email, referer} = req.body
        if (Helper.stringIsEmpty(localStorageId)) throw new Error("local storage id is empty")
        if (Helper.stringIsEmpty(email)) throw new Error("email is empty")
        if (referer === undefined) throw new Error("referer is undefined")
        const foundUserById = await (await Helper.findUser(user => user.id === localStorageId)).user
        if (Helper.objectIsEmpty(foundUserById)) throw new Error("user is not registered")
        const foundVerifiedUserById = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: foundUserById.email, verified: foundUserById.verified})))).user
        if (Helper.objectIsEmpty(foundVerifiedUserById)) throw new Error("user is not verified")
        if (localStorageId !== foundVerifiedUserById.id) throw new Error("local storage id is not trusted")
        if (email !== foundVerifiedUserById.email) throw new Error("email mismatch")
        return next()
      }

      throw new Error("closed post request failed")
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
          await Helper.logError(new Error("jwt token is empty"), req)
          return res.redirect("/pana/getyour/login/")
        }
        const jwt = await Helper.verifyJwtToken(jwtToken)
        if (Helper.objectIsEmpty(jwt)) throw new Error("jwt is empty")
        const {user} = await Helper.findUser(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
        if (user.session.jwt !== Helper.digest(jwtToken)) {
          await Helper.logError(new Error("jwt token changed"), req)
          return res.redirect("/pana/getyour/login/")
        }
        const verifiedUser = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified})))).user
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
        const {user} = await Helper.findUser(user => user.id === jwt.id)
        if (Helper.objectIsEmpty(user)) throw new Error("user is empty")
        if (user.session.jwt !== Helper.digest(jwtToken)) throw new Error("jwt token changed")
        const verifiedUser = await (await Helper.findUser(user => user.id === Helper.digest(JSON.stringify({email: user.email, verified: user.verified})))).user
        if (Helper.objectIsEmpty(verifiedUser)) throw new Error("verified user is empty")
        if (jwt.id !== user.id) throw new Error("jwt id not equals user id")
        req.jwt = jwt
        if (Helper.objectIsEmpty(req.jwt)) throw new Error("jwt is empty")
        return next()
      }


      throw new Error("verify jwt token failed")
    } catch (error) {
      await Helper.logError(error, req)
    }
    return res.sendStatus(404)
  }

  static async verifyRole(req, res, next) {
    try {
      if (req.params.role === undefined) throw new Error("role is undefined")

      if (req.method === "POST") {
        if (req.params.event === "closed") {
          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users is undefined")
          const {jwt} = req
          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]
            if (jwt.id === user.id) {
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
      // console.log("hi");

      if (req.params.name !== undefined) {
        if (req.params.path !== undefined) {
              // console.log("hi");

          const doc = await nano.db.use("getyour").get("users")
          if (Helper.objectIsEmpty(doc)) throw new Error("doc is empty")
          if (doc.users === undefined) throw new Error("users are undefined")

          let allowed = false
          for (let i = 0; i < doc.users.length; i++) {
            const user = doc.users[i]

            if ("felix" === req.params.name) {
            // if (user.name === req.params.name) {

              // hack
              user.platforms = [
                {
                  values: [
                    // {path: "experten-ansicht", roles: ["3"]},
                    {path: "angebot-vergleich", roles: ["1"]},
                    {path: "abfrage-technisches", roles: ["1"]},
                    {path: "abfrage-strom", roles: ["1"]},
                    {path: "abfrage-heizung", roles: ["1"]},
                    {path: "abfrage-haus", roles: ["1"]},
                    {path: "qualifizierung", roles: ["1"]},
                    {path: "promoter-ansicht", roles: ["5"]},
                    {path: "verkaufer-ansicht", roles: ["4"]}
                  ]
                }
              ]

              // console.log("hi");
              for (let i = 0; i < user.platforms.length; i++) {
                const platform = user.platforms[i]
                for (let i = 0; i < platform.values.length; i++) {
                  const value = platform.values[i]
                  if (value.path === req.params.path) {
                    for (let i = 0; i < value.roles.length; i++) {
                      const requiredRole = value.roles[i]
                      if (req.params.role === requiredRole) {
                        allowed = true
                      }
                    }
                  }
                }
              }
            }

          }

          if (allowed === true) return next()
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
