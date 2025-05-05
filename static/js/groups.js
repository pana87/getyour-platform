import {addLoading} from "/js/events.js"
import {alertNok, alertSaved} from "/js/alert.js"
import {renderNode} from "/js/render.js"
import {post} from "/js/request.js"
import {leftRight, add} from "/js/button.js"
import {div} from "/js/html-tags.js"
import {millisToSince, textToAction, nodeMarked, textToNote, textToH1} from "/js/convert.js"
import {text, selectContacts, selectEmails} from "/js/input.js"
import {resetNode} from "/js/remove.js"
import {aliasFunnel} from "/js/funnel.js"
import {onlyClosedUser, verifyInputValue, arrayIsEmpty, textIsEmpty, addValidSign, addNotValidSign, verifyInputs, verifyFunnel} from "/js/verify.js"
import {pop, lock} from "/js/overlay.js"

export const openGroups = () => {
  pop(async o1 => {
    await onlyClosedUser(o1)
    o1.addInfo(".groups")
    const content = o1.content
    const addGroup = add("+", o1)
    addGroup.onclick = () => {
      pop(async o2 => {
        const content = o2.content
        const emailSelect = selectContacts(content)
        addNotValidSign(emailSelect.input)
        const submit = textToAction("Gruppe jetzt speichern", content)
        submit.onclick = () => {
          const emails = emailSelect.selectedEmails()
          if (arrayIsEmpty(emails)) {
            window.alert("Wähle mindestens eine E-Mail Adresse.")
            addNotValidSign(emailSelect.input)
            return
          }
          lock(async o3 => {
            const res = await post("/jwt/register/group/", {emails})
            if (res.status === 200) {
              window.alert("Deine Gruppe wurde erfolgreich gespeichert.")
              await getAndRenderGroups(groupsContainer)
              o2.remove()
            }
            o3.remove()
          })
        }
      })
    }
    const searchField = text(content)
    searchField.input.placeholder = "Filter nach E-Mail Adresse oder Alias"
    addValidSign(searchField.input)
    textToH1("Meine Gruppen", content)
    const groupsContainer = div("", content)
    await getAndRenderGroups(groupsContainer)
    function renderGroupEmails(group, parent) {
      const fragment = document.createDocumentFragment()
      for (let i = 0; i < group.emails.length; i++) {
        const email = group.emails[i]
        const emailDiv = div("", fragment)
        emailDiv.textContent = email
        fragment.appendChild(emailDiv)
      }
      parent?.appendChild(fragment)
      return fragment
    }
    function filterGroupsByEmail(array, parent) {
      searchField.input.oninput = (ev) => {
        const filtered = array.filter(it => {
          const lowercase = ev.target.value.toLowerCase()
          if (it.emails && it.emails.length > 0) {
            return it.emails.some(email => email.includes(lowercase)) || (it.alias && it.alias.toLowerCase().includes(lowercase))
          } else {
            if (it.alias && it.alias.toLowerCase().includes(lowercase)) {
              return true
            }
            return false
          }
        })
        renderGroupButtons(filtered, parent, ev.target.value)
      }
    }
    function markQueryInNode(node, query) {
      if (node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i]
          markQueryInNode(child, query)
        }
      } else {
        nodeMarked(query, node)
      }
    }
    function renderGroupButtons(groups, parent, query = "") {
      const fragment = document.createDocumentFragment()
      resetNode(parent)
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        const groupButton = leftRight(fragment)
        groupButton.right.textContent = `Erstellt vor ${millisToSince(group.created)}`
        if (textIsEmpty(query)) {
          if (!textIsEmpty(group.alias)) {
            renderNode("span", `${group.alias}`, groupButton.left)
          } else {
            renderGroupEmails(group, groupButton.left)
          }
        } else {
          if (!textIsEmpty(group.alias)) {
            renderNode("span", `${group.alias}:`, groupButton.left)
            renderGroupEmails(group, groupButton.left)
          } else {
            renderGroupEmails(group, groupButton.left)
          }
        }
        markQueryInNode(groupButton.left, query)
        groupButton.onclick = () => {
          pop(async o2 => {
            o2.addInfo(group.emails.join(", "))
            const buttons = o2.content
            const loader = addLoading(buttons)
            const res = await post("/jwt/verify/group/creator/", {created: group.created})
            loader.remove()
            if (res.status === 200) {
              const aliasButton = leftRight({left: ".alias", right: "Gebe deiner Gruppe einen alternativen Namen"}, buttons)
              aliasButton.onclick = () => {
                pop(o3 => {
                  o3.addInfo(group.emails.join(", "))
                  const content = o3.content
                  const funnel = aliasFunnel(content)
                  if (group.alias) {
                    funnel.alias.input.value = group.alias
                  }
                  funnel.submit.onclick = async () => {
                    await verifyInputValue(funnel.alias.input)
                    const alias = funnel.alias.input.value
                    const created = group.created
                    lock(async o4 => {
                      const res = await post("/jwt/register/group/alias/", {created, alias})
                      if (res.status === 200) {
                        window.alert("Alias erfolgreich gespeichert.")
                        await getAndRenderGroups(groupsContainer)
                        o3.remove()
                        o2.remove()
                      } else {
                        window.alert("Fehler.. Bitte wiederholen.")
                      }
                      o4.remove()
                    })
                  }
                })
              }
              const emailsButton = leftRight({left: ".emails", right: "Aktualisiere die Mitglieder deiner Gruppe"}, buttons)
              emailsButton.onclick = () => {
                pop(async o3 => {
                  const content = o3.content
                  const emailSelect = selectEmails(content)
                  post("/jwt/get/contacts/").then(res => {
                    if (res.status === 200) {
                      const contacts = JSON.parse(res.response)
                      contacts.forEach(contact => emailSelect.addOption(contact.email, contact.id))
                      emailSelect.selectByText(group.emails)
                    }
                  })
                  const submit = textToAction("Gruppe jetzt speichern", content)
                  submit.onclick = () => {
                    const emails = emailSelect.selectedEmails()
                    if (arrayIsEmpty(emails)) {
                      window.alert("Wähle mindestens eine E-Mail Adresse.")
                      addNotValidSign(emailSelect.field.input)
                      return
                    }
                    lock(async o4 => {
                      const res = await post("/jwt/register/group/emails/", {created: group.created, emails})
                      if (res.status === 200) {
                        alertSaved()
                        await getAndRenderGroups(groupsContainer)
                        o3.remove()
                        o2.remove()
                      } else {
                        alertNok()
                      }
                      o4.remove()
                    })
                  }
                })
              }
              const removeButton = leftRight({left: ".remove", right: "Gruppe entfernen"}, buttons)
              removeButton.onclick = () => {
                const confirm = window.confirm("Möchtest du deine Gruppe wirklich entfernen?")
                if (confirm === true) {
                  lock(async o3 => {
                    const res = await post("/jwt/remove/group/", {created: group.created})
                    if (res.status === 200) {
                      o3.alert.removed()
                      groupButton.remove()
                      o2.remove()
                    } else {
                      alertNok()
                    }
                    o3.remove()
                  })
                }
              }
            }
          })
        }
      }
      parent?.appendChild(fragment)
      return fragment
    }
    async function getAndRenderGroups(parent) {
      resetNode(parent)
      const loader = addLoading(parent)
      const res = await post("/jwt/get/groups/")
      loader.remove()
      if (res.status === 200) {
        const groups = JSON.parse(res.response)
        renderGroupButtons(groups, parent)
        filterGroupsByEmail(groups, parent)
      } else {
        textToNote("Keine Gruppen gefunden", parent)
      }
    }
  })
}
